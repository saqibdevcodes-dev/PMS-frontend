import { t, useLocale } from '../../lib/i18n';
import { useQuery } from '@tanstack/react-query';
import { Printer, ShieldCheck, X } from 'lucide-react';
import { api } from '../../lib/api';
import { usePreferences } from '../../stores/preferences';
import { asRows, row, type Row } from '../../lib/types';
import { money, date, humanize } from '../../lib/format';
import { Button, Modal, Skeleton, ErrorState } from '../../components/ui';
import { QRCode } from '../../components/QRCode';
import { BrandLogo } from '../../components/BrandLogo';
import './property-file.css';

export function PropertyFileModal({
  bookingId,
  onClose,
}: {
  bookingId: string;
  onClose: () => void;
}) {
  useLocale();
  const projectId = usePreferences((s) => s.projectId);
  const projectName = usePreferences((s) => s.projectName);

  const query = useQuery({
    queryKey: ['booking-property-file', projectId, bookingId],
    enabled: !!projectId && !!bookingId,
    queryFn: ({ signal }) => api<Row>(`/projects/${projectId}/bookings/${bookingId}`, { signal }),
  });

  const booking = query.data ?? {};
  const customer = row(booking.customer);
  const unit = row(booking.unit);
  const position = row(booking.position);
  const installments = asRows(position.installments);
  const nominees = asRows(customer.nominees);
  const primaryNominee = nominees[0];

  const verifyUrl = `${window.location.origin}/verify?ref=${encodeURIComponent(String(booking.reference ?? ''))}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      open
      onOpenChange={(v) => !v && onClose()}
      title={t('Computerized Property File')}
      description={t('Official property allotment file, computerized schedule and QR verification')}
      wide
    >
      <div className="property-file-container">
        <div className="property-file-toolbar">
          <div className="toolbar-info">
            <strong>
              {t('Reference')}: {String(booking.reference ?? '—')}
            </strong>
            <span className="context-divider" style={{ margin: '0 8px' }}>
              ·
            </span>
            <span>
              {t('Status')}: {humanize(String(booking.status ?? '—'))}
            </span>
          </div>
          <div className="toolbar-actions">
            <Button variant="secondary" onClick={handlePrint}>
              <Printer size={16} />
              {t('Print Official File')}
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label={t('Close')}>
              <X size={18} />
            </Button>
          </div>
        </div>

        {query.isLoading ? (
          <Skeleton rows={6} />
        ) : query.isError ? (
          <ErrorState error={query.error} retry={() => void query.refetch()} />
        ) : (
          <div className="property-file-sheet" id="printable-property-file">
            {/* Header */}
            <div className="sheet-header">
              <div className="sheet-branding">
                <div style={{ width: 42, height: 42, display: 'flex', alignItems: 'center' }}>
                  <BrandLogo variant="symbol" decorative />
                </div>
                <div>
                  <h2>{projectName || t('Real Estate Development')}</h2>
                  <p>{t('Computerized Property Management & Allotment File')}</p>
                </div>
              </div>
              <div className="sheet-title-badge">
                <span className="file-badge">{t('Official Property File')}</span>
                <span className="ref-no">{String(booking.reference ?? '—')}</span>
              </div>
            </div>

            {/* Customer & Unit Details */}
            <div className="sheet-grid">
              <div className="sheet-card">
                <h3>{t('Member / Allottee Information')}</h3>
                <dl className="sheet-dl">
                  <dt>{t('Full Name')}</dt>
                  <dd>{String(customer.name ?? '—')}</dd>
                  <dt>{t('CNIC / Identity')}</dt>
                  <dd>{customer.identityLast4 ? `•••• ••••••• ${customer.identityLast4}` : '—'}</dd>
                  <dt>{t('Phone')}</dt>
                  <dd>{String(customer.phone ?? '—')}</dd>
                  <dt>{t('Email')}</dt>
                  <dd>{String(customer.email ?? '—')}</dd>
                  <dt>{t('Address')}</dt>
                  <dd>{String(customer.address ?? '—')}</dd>
                  <dt>{t('Nominee')}</dt>
                  <dd>
                    {primaryNominee
                      ? `${primaryNominee.name} (${primaryNominee.relationship || 'Nominee'})`
                      : '—'}
                  </dd>
                </dl>
              </div>

              <div className="sheet-card">
                <h3>{t('Property Specifications')}</h3>
                <dl className="sheet-dl">
                  <dt>{t('Property No.')}</dt>
                  <dd>{String(unit.number ?? '—')}</dd>
                  <dt>{t('Property Type')}</dt>
                  <dd>{humanize(String(unit.type ?? '—'))}</dd>
                  <dt>{t('Area / Size')}</dt>
                  <dd>{`${unit.size ?? '—'} ${unit.measurementUnit ?? ''}`}</dd>
                  <dt>{t('Phase / Block')}</dt>
                  <dd>
                    {[unit.phase, unit.block, unit.tower, unit.floor].filter(Boolean).join(' · ') ||
                      '—'}
                  </dd>
                  <dt>{t('Base Price')}</dt>
                  <dd>{money(booking.basePrice)}</dd>
                  <dt>{t('Total Value')}</dt>
                  <dd style={{ color: '#0f172a', fontWeight: 800 }}>{money(booking.total)}</dd>
                </dl>
              </div>
            </div>

            {/* Financial Overview */}
            <div className="sheet-financials">
              <div className="financial-metric">
                <span>{t('Total Contract')}</span>
                <strong>{money(booking.total)}</strong>
              </div>
              <div className="financial-metric metric-green">
                <span>{t('Total Received')}</span>
                <strong>{money(position.collected ?? 0)}</strong>
              </div>
              <div className="financial-metric metric-amber">
                <span>{t('Outstanding Balance')}</span>
                <strong>{money(position.outstanding ?? 0)}</strong>
              </div>
              <div className="financial-metric">
                <span>{t('Overdue Amount')}</span>
                <strong style={{ color: Number(position.overdue) > 0 ? '#dc2626' : undefined }}>
                  {money(position.overdue ?? 0)}
                </strong>
              </div>
            </div>

            {/* Installments Table */}
            {installments.length > 0 && (
              <div className="sheet-schedule">
                <h3>{t('Payment Installment Schedule')}</h3>
                <table className="sheet-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>{t('Installment')}</th>
                      <th>{t('Due Date')}</th>
                      <th className="text-right">{t('Amount Due')}</th>
                      <th className="text-right">{t('Amount Paid')}</th>
                      <th className="text-right">{t('Balance')}</th>
                      <th>{t('Status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {installments.map((inst, idx) => (
                      <tr key={String(inst.id || idx)}>
                        <td>{idx + 1}</td>
                        <td>{String(inst.label ?? `Installment ${idx + 1}`)}</td>
                        <td>{date(String(inst.dueDate ?? ''))}</td>
                        <td className="text-right">{money(inst.amount)}</td>
                        <td className="text-right">{money(inst.paid ?? 0)}</td>
                        <td className="text-right">{money(inst.outstanding ?? 0)}</td>
                        <td>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              color:
                                Number(inst.outstanding) === 0
                                  ? '#166534'
                                  : Number(inst.overdue) > 0
                                    ? '#dc2626'
                                    : '#b45309',
                            }}
                          >
                            {Number(inst.outstanding) === 0
                              ? t('Paid')
                              : Number(inst.overdue) > 0
                                ? t('Overdue')
                                : t('Pending')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Footer with QR Verification and Signatures */}
            <div className="sheet-footer">
              <div className="qr-section">
                <QRCode value={verifyUrl} size={100} />
                <small>{t('Scan to Verify')}</small>
              </div>
              <div className="verification-notice">
                <ShieldCheck size={18} style={{ color: '#166534', marginBottom: 4 }} />
                <p>
                  <strong>{t('Digitally Verified Computerized Record')}</strong>
                  <br />
                  {t(
                    'This computerized property file is generated directly from the property management ledger. Scan the QR code with any mobile device to confirm authenticity and active registration status.',
                  )}
                </p>
                <small>{t('Generated on {0}', { '0': new Date().toLocaleDateString() })}</small>
              </div>
              <div className="signatures">
                <div className="sig-line">{t('Allottee Signature')}</div>
                <div className="sig-line">{t('Authorized Project Officer')}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
