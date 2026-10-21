import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  CreditCard,
} from 'lucide-react';
import { api, queryString } from '../../lib/api';
import { usePreferences } from '../../stores/preferences';
import { asRows, type Row } from '../../lib/types';
import { money, date } from '../../lib/format';
import { t, useLocale } from '../../lib/i18n';
import { Button, Modal, Skeleton } from '../../components/ui';
import { Select } from '../../components/Select';
import './calendar.css';

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function InstallmentCalendar() {
  useLocale();
  const projectId = usePreferences((s) => s.projectId);
  const currency = usePreferences((s) => s.currency) || 'PKR';
  const navigate = useNavigate();

  const [activeDate, setActiveDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const year = activeDate.getFullYear();
  const month = activeDate.getMonth();

  // First day of current month & last day of current month (YYYY-MM-DD)
  const fromStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
  const toStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDayOfMonth).padStart(2, '0')}`;

  const query = useQuery({
    queryKey: ['installment-calendar', projectId, fromStr, toStr],
    enabled: !!projectId,
    queryFn: ({ signal }) =>
      api<{ rows: Row[] }>(
        `/projects/${projectId}/reports` +
          queryString({ kind: 'installments', from: fromStr, to: toStr }),
        { signal },
      ),
  });

  const allRows = asRows(query.data?.rows);

  // Group installments by due date string (YYYY-MM-DD)
  const byDate = useMemo(() => {
    const map = new Map<string, Row[]>();
    for (const r of allRows) {
      const d = String(r.dueDate ?? '').slice(0, 10);
      if (!d) continue;
      const list = map.get(d) ?? [];
      list.push(r);
      map.set(d, list);
    }
    return map;
  }, [allRows]);

  // First day of month (0 = Sun, 1 = Mon...)
  const firstDayIndex = new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setActiveDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };

  const nextMonth = () => {
    setActiveDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  const currentMonthName = activeDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const todayStr = new Date().toISOString().slice(0, 10);

  // Installments for the selected day modal
  const dayInstallments = useMemo(
    () => (selectedDay ? (byDate.get(selectedDay) ?? []) : []),
    [selectedDay, byDate],
  );

  const filteredDayInstallments = useMemo(() => {
    if (filterStatus === 'unpaid') {
      return dayInstallments.filter((i) => Number(i.outstanding) > 0);
    }
    if (filterStatus === 'overdue') {
      return dayInstallments.filter((i) => Number(i.overdue) > 0);
    }
    if (filterStatus === 'paid') {
      return dayInstallments.filter((i) => Number(i.outstanding) === 0);
    }
    return dayInstallments;
  }, [dayInstallments, filterStatus]);

  return (
    <section className="calendar-panel" aria-label={t('Installment Due Calendar')}>
      <div className="calendar-header">
        <div className="calendar-title-wrap">
          <CalendarDays size={20} style={{ color: 'var(--primary)' }} />
          <div>
            <h3>{t('Installment Due Calendar')}</h3>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>
              {t('Track daily payment obligations and due installment schedules')}
            </p>
          </div>
        </div>

        <div className="calendar-nav">
          <Button
            variant="secondary"
            size="icon"
            onClick={prevMonth}
            aria-label={t('Previous Month')}
          >
            <ChevronLeft size={16} />
          </Button>
          <span className="calendar-month-label">{currentMonthName}</span>
          <Button variant="secondary" size="icon" onClick={nextMonth} aria-label={t('Next Month')}>
            <ChevronRight size={16} />
          </Button>
          <Button
            variant="ghost"
            size="small"
            onClick={() => {
              setActiveDate(new Date());
              setSelectedDay(null);
            }}
          >
            {t('Today')}
          </Button>
        </div>
      </div>

      {query.isLoading ? (
        <Skeleton rows={4} />
      ) : (
        <>
          <div className="calendar-grid">
            {weekdays.map((day) => (
              <div key={day} className="calendar-weekday">
                {t(day)}
              </div>
            ))}

            {/* Empty cells before month starts */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="calendar-day-cell empty-day" />
            ))}

            {/* Days in month */}
            {Array.from({ length: lastDayOfMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayRows = byDate.get(dateStr) ?? [];
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDay;

              const totalDue = dayRows.length;
              const overdueCount = dayRows.filter((r) => Number(r.overdue) > 0).length;
              const pendingCount = dayRows.filter(
                (r) => Number(r.outstanding) > 0 && Number(r.overdue) === 0,
              ).length;
              const clearedCount = dayRows.filter((r) => Number(r.outstanding) === 0).length;

              return (
                <div
                  key={dateStr}
                  className={`calendar-day-cell ${isToday ? 'is-today' : ''} ${
                    isSelected ? 'is-selected' : ''
                  }`}
                  onClick={() => dayRows.length > 0 && setSelectedDay(dateStr)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      if (dayRows.length > 0) setSelectedDay(dateStr);
                    }
                  }}
                  aria-label={`${dateStr}: ${totalDue} installments`}
                >
                  <div className="day-number">{dayNum}</div>

                  {totalDue > 0 && (
                    <div className="day-badge-stack">
                      {overdueCount > 0 && (
                        <span className="day-due-badge badge-overdue">
                          <AlertTriangle size={10} />
                          {overdueCount} {t('overdue')}
                        </span>
                      )}
                      {pendingCount > 0 && (
                        <span className="day-due-badge badge-pending">
                          <Clock3 size={10} />
                          {pendingCount} {t('due')}
                        </span>
                      )}
                      {clearedCount > 0 && overdueCount === 0 && pendingCount === 0 && (
                        <span className="day-due-badge badge-cleared">
                          <CheckCircle2 size={10} />
                          {clearedCount} {t('paid')}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <footer
            style={{
              display: 'flex',
              gap: 16,
              fontSize: 12,
              color: 'var(--text-muted)',
              marginTop: 8,
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
              {t('Overdue')}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
              {t('Due / Upcoming')}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
              {t('Cleared')}
            </span>
          </footer>
        </>
      )}

      {/* Selected Day Installments Modal */}
      {selectedDay && (
        <Modal
          open
          onOpenChange={(v) => !v && setSelectedDay(null)}
          title={t('Installments Due on {0}', { '0': date(selectedDay) })}
          description={t('{count} scheduled installment obligations', {
            count: dayInstallments.length,
          })}
          wide
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>
                {t('Total Obligations')}: {dayInstallments.length}
              </span>
              <Select
                value={filterStatus}
                onChange={setFilterStatus}
                options={[
                  { value: 'all', label: t('All Installments') },
                  { value: 'unpaid', label: t('Unpaid Only') },
                  { value: 'overdue', label: t('Overdue Only') },
                  { value: 'paid', label: t('Paid / Cleared') },
                ]}
              />
            </div>

            <div className="day-detail-modal-list">
              {filteredDayInstallments.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px 0' }}>
                  {t('No installments match this filter')}
                </p>
              ) : (
                filteredDayInstallments.map((inst) => {
                  const isPaid = Number(inst.outstanding) === 0;
                  const isOverdue = Number(inst.overdue) > 0;

                  return (
                    <div key={String(inst.id)} className="day-installment-card">
                      <div className="installment-main-info">
                        <h4>
                          {String(inst.customerName || t('Customer'))}{' '}
                          {Boolean(inst.customerPhone) && (
                            <span
                              style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)' }}
                            >
                              · {String(inst.customerPhone)}
                            </span>
                          )}
                        </h4>
                        <p>
                          {t('Booking')} <strong>{String(inst.reference ?? '—')}</strong>
                          {Boolean(inst.unitNumber) && (
                            <>
                              {' '}
                              · {t('Property')} <strong>{String(inst.unitNumber)}</strong>
                            </>
                          )}
                          {' · '}
                          {String(inst.label ?? `Installment ${inst.sequence ?? ''}`)}
                        </p>
                      </div>

                      <div className="installment-money-info">
                        <strong>{money(inst.amount, currency)}</strong>
                        {isPaid ? (
                          <span style={{ color: '#22c55e', fontSize: 11, fontWeight: 600 }}>
                            ✓ {t('Paid')}
                          </span>
                        ) : (
                          <small style={{ color: isOverdue ? '#ef4444' : '#f59e0b' }}>
                            {isOverdue
                              ? `${money(inst.overdue, currency)} ${t('overdue')} (${inst.lateDays}d)`
                              : `${money(inst.outstanding, currency)} ${t('outstanding')}`}
                          </small>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: 8 }}>
                        {Boolean(inst.bookingId) && (
                          <Button
                            size="small"
                            variant="secondary"
                            onClick={() => {
                              setSelectedDay(null);
                              navigate(`/bookings?record=${String(inst.bookingId)}`);
                            }}
                          >
                            {t('Booking')}
                            <ArrowRight size={13} />
                          </Button>
                        )}
                        {!isPaid && Boolean(inst.bookingId) && (
                          <Button
                            size="small"
                            onClick={() => {
                              setSelectedDay(null);
                              navigate(`/collections?bookingId=${String(inst.bookingId)}`);
                            }}
                          >
                            <CreditCard size={13} />
                            {t('Collect')}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}
