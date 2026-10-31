import { Money } from '../../components/Money';
import { useState, useMemo, useEffect } from 'react';
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
import { can } from '../../stores/auth';
import { usePreferences } from '../../stores/preferences';
import { asRows, type Page } from '../../lib/types';
import { date, moneyWithWords } from '../../lib/format';
import { t, useLocale } from '../../lib/i18n';
import { Button, Modal, Skeleton, ErrorState } from '../../components/ui';
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

  type CalendarDay = { date: string; total: number; overdue: number; unpaid: number; paid: number };
  const query = useQuery({
    queryKey: ['installment-calendar', projectId, fromStr, toStr],
    enabled: Boolean(projectId && can('reports.read')),
    queryFn: ({ signal }) =>
      api<{ days: CalendarDay[]; today: string }>(
        `/projects/${projectId}/installment-calendar${queryString({ from: fromStr, to: toStr })}`,
        { signal },
      ),
  });
  const [detailPage, setDetailPage] = useState(1);
  useEffect(() => setDetailPage(1), [selectedDay, filterStatus]);
  const details = useQuery({
    queryKey: ['installment-calendar-day', projectId, selectedDay, detailPage, filterStatus],
    enabled: Boolean(projectId && selectedDay && can('reports.read')),
    queryFn: ({ signal }) =>
      api<Page>(
        `/projects/${projectId}/installment-calendar/day${queryString({ date: selectedDay, page: detailPage, limit: 25, status: filterStatus })}`,
        { signal },
      ),
  });
  const byDate = useMemo(
    () => new Map((query.data?.days ?? []).map((day) => [day.date, day])),
    [query.data],
  );

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
  const todayStr = query.data?.today ?? '';

  const filteredDayInstallments = asRows(details.data);
  const totalDay = details.data?.pagination.total ?? 0;

  return (
    <section className="calendar-panel" aria-label={t('Installment Due Calendar')}>
      <div className="calendar-header">
        <div className="calendar-title-wrap">
          <CalendarDays size={18} style={{ color: 'var(--primary)' }} />
          <div>
            <h3>{t('Installment Due Calendar')}</h3>
            <p>{t('Daily payment obligations & schedule')}</p>
          </div>
        </div>

        <div className="calendar-nav">
          <Button
            variant="secondary"
            size="icon"
            onClick={prevMonth}
            aria-label={t('Previous Month')}
          >
            <ChevronLeft size={14} />
          </Button>
          <span className="calendar-month-label">{currentMonthName}</span>
          <Button variant="secondary" size="icon" onClick={nextMonth} aria-label={t('Next Month')}>
            <ChevronRight size={14} />
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

      {query.isError ? (
        <ErrorState error={query.error} retry={() => void query.refetch()} />
      ) : query.isLoading ? (
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
              const stats = byDate.get(dateStr);
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDay;
              const totalDue = stats?.total ?? 0;
              const overdueCount = stats?.overdue ?? 0;
              const pendingCount = stats?.unpaid ?? 0;
              const clearedCount = stats?.paid ?? 0;

              return (
                <div
                  key={dateStr}
                  className={`calendar-day-cell ${isToday ? 'is-today' : ''} ${
                    isSelected ? 'is-selected' : ''
                  }`}
                  onClick={() => totalDue > 0 && setSelectedDay(dateStr)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      if (totalDue > 0) setSelectedDay(dateStr);
                    }
                  }}
                  aria-label={`${dateStr}: ${totalDue} installments`}
                >
                  <div className="day-number">{dayNum}</div>

                  {totalDue > 0 && (
                    <div className="day-badge-stack">
                      {overdueCount > 0 && (
                        <span className="day-due-badge badge-overdue">
                          <AlertTriangle size={9} />
                          {overdueCount} {t('overdue')}
                        </span>
                      )}
                      {pendingCount > 0 && (
                        <span className="day-due-badge badge-pending">
                          <Clock3 size={9} />
                          {pendingCount} {t('due')}
                        </span>
                      )}
                      {clearedCount > 0 && overdueCount === 0 && pendingCount === 0 && (
                        <span className="day-due-badge badge-cleared">
                          <CheckCircle2 size={9} />
                          {clearedCount} {t('paid')}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <footer className="calendar-footer">
            <div className="calendar-legend">
              <span className="calendar-legend-item">
                <span className="calendar-legend-dot" style={{ background: 'var(--danger)' }} />
                {t('Overdue')}
              </span>
              <span className="calendar-legend-item">
                <span className="calendar-legend-dot" style={{ background: 'var(--warning)' }} />
                {t('Due')}
              </span>
              <span className="calendar-legend-item">
                <span className="calendar-legend-dot" style={{ background: 'var(--success)' }} />
                {t('Cleared')}
              </span>
            </div>
            <span>{t('Click date to inspect')}</span>
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
            count: totalDay,
          })}
          wide
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="m-4">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>
                {t('Total Obligations')}: {totalDay}
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

            <div className="table-pagination">
              <Button
                variant="secondary"
                disabled={detailPage === 1 || details.isFetching}
                onClick={() => setDetailPage(detailPage - 1)}
              >
                {t('Previous')}
              </Button>
              <span>
                {t('Page')} {detailPage} {t('of')}{' '}
                {Math.max(1, details.data?.pagination.totalPages ?? 1)}
              </span>
              <Button
                variant="secondary"
                disabled={
                  detailPage >= (details.data?.pagination.totalPages ?? 1) || details.isFetching
                }
                onClick={() => setDetailPage(detailPage + 1)}
              >
                {t('Next')}
              </Button>
            </div>
            <div className="day-detail-modal-list">
              {details.isError ? (
                <ErrorState error={details.error} retry={() => void details.refetch()} />
              ) : details.isLoading ? (
                <Skeleton rows={3} />
              ) : filteredDayInstallments.length === 0 ? (
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
                        <strong>
                          <Money value={inst.amount} currency={currency} />
                        </strong>
                        {isPaid ? (
                          <span style={{ color: 'var(--success)', fontSize: 11, fontWeight: 600 }}>
                            ✓ {t('Paid')}
                          </span>
                        ) : (
                          <small style={{ color: isOverdue ? 'var(--danger)' : 'var(--warning)' }}>
                            {isOverdue
                              ? `${moneyWithWords(inst.overdue, currency)} ${t('overdue')}`
                              : `${moneyWithWords(inst.outstanding, currency)} ${t('outstanding')}`}
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
                        {!isPaid && Boolean(inst.bookingId) && can('payments.create') && (
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
