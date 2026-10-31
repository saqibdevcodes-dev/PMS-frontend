import { Money } from '../../components/Money';
import Decimal from 'decimal.js';
import { useQuery } from '@tanstack/react-query';
import { Printer, Calendar, FileText, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../lib/api';
import { date } from '../../lib/format';
import { errorMessage } from '../../lib/error-messages';
import { t, useLocale } from '../../lib/i18n';
import { print } from '../../platform/adapter';
import { usePreferences } from '../../stores/preferences';
import { ProjectLogo } from '../../components/ProjectLogo';
import { Modal, Button, ErrorState, Skeleton } from '../../components/ui';
import './journal-voucher.css';

type Voucher = {
  reference: string;
  description: string;
  postedAt: string;
  project: { name: string; currency: string; logoId: string | null };
  reversal: { reference: string } | null;
  reversalOf: { reference: string } | null;
  lines: {
    id: string;
    debit: string;
    credit: string;
    account: { code: string; name: string };
    vendor: { name: string } | null;
  }[];
};

export function JournalVoucher({ id, onClose }: { id: string; onClose: () => void }) {
  useLocale();
  const projectId = usePreferences((s) => s.projectId);
  const query = useQuery({
    queryKey: ['journal-voucher', projectId, id],
    queryFn: ({ signal }) => api<Voucher>(`/projects/${projectId}/journals/${id}`, { signal }),
  });
  const voucher = query.data;

  return (
    <Modal open onOpenChange={(open) => !open && onClose()} title={t('Journal voucher')} wide>
      <div className="modal-body printable-receipt journal-voucher journal-voucher-container">
        {query.isLoading ? (
          <Skeleton />
        ) : query.isError ? (
          <ErrorState error={query.error} />
        ) : (
          voucher && (
            <>
              {/* Header: Project Brand (Left) + Voucher Meta (Right) */}
              <div className="voucher-header">
                <div className="voucher-brand-section">
                  <div className="voucher-logo-box">
                    <ProjectLogo logoId={voucher.project.logoId} name={voucher.project.name} />
                  </div>
                  <div className="voucher-project-details">
                    <h2 className="voucher-project-name">{voucher.project.name}</h2>
                    <p className="voucher-project-subtitle">
                      {t('Official General Ledger Journal Voucher')}
                    </p>
                  </div>
                </div>

                <div className="voucher-meta-box">
                  <span className="voucher-type-badge">
                    <FileText size={12} />
                    {t('Journal Voucher')}
                  </span>
                  <p className="voucher-ref-code">{voucher.reference}</p>
                  <p className="voucher-date-label">
                    <Calendar size={12} />
                    <span>{date(voucher.postedAt)}</span>
                  </p>
                </div>
              </div>

              {/* Transaction Description Banner */}
              <div className="voucher-description-banner">
                <span className="voucher-desc-heading">
                  {t('Transaction Reference & Description')}
                </span>
                <p className="voucher-desc-content">{voucher.description}</p>
                {voucher.reversal && (
                  <div className="voucher-reversal-alert">
                    <AlertTriangle size={13} />
                    <span>{t('Reversed by: {ref}', { ref: voucher.reversal.reference })}</span>
                  </div>
                )}
                {voucher.reversalOf && (
                  <div className="voucher-reversal-alert">
                    <AlertTriangle size={13} />
                    <span>
                      {t('Reversal of original voucher: {ref}', {
                        ref: voucher.reversalOf.reference,
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* Accounting Ledger Table */}
              <div className="voucher-table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>{t('Account Code & Name')}</th>
                      <th>{t('Party / Vendor')}</th>
                      <th className="numeric-cell">{t('Debit')}</th>
                      <th className="numeric-cell">{t('Credit')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {voucher.lines.map((line) => {
                      const isZeroDebit = Number(line.debit) === 0;
                      const isZeroCredit = Number(line.credit) === 0;
                      return (
                        <tr key={line.id}>
                          <td>
                            <div className="voucher-account-entry">
                              <span className="voucher-account-code">{line.account.code}</span>
                              <span className="voucher-account-name">{line.account.name}</span>
                            </div>
                          </td>
                          <td>
                            <span className="voucher-vendor-text">{line.vendor?.name ?? '—'}</span>
                          </td>
                          <td className="numeric-cell">
                            <span
                              className={isZeroDebit ? 'voucher-money-zero' : 'voucher-money-val'}
                            >
                              <Money value={line.debit} currency={voucher.project.currency} />
                            </span>
                          </td>
                          <td className="numeric-cell">
                            <span
                              className={isZeroCredit ? 'voucher-money-zero' : 'voucher-money-val'}
                            >
                              <Money value={line.credit} currency={voucher.project.currency} />
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th colSpan={2}>{t('Total')}</th>
                      {(['debit', 'credit'] as const).map((side) => (
                        <th key={side} className="numeric-cell">
                          <Money
                            value={voucher.lines
                              .reduce((total, line) => total.plus(line[side]), new Decimal(0))
                              .toFixed(2)}
                            currency={voucher.project.currency}
                          />
                        </th>
                      ))}
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Signatures for physical printing & audit compliance */}
              <div className="voucher-signatures">
                <div className="voucher-signature-box">
                  <span>{t('Prepared by')}</span>
                </div>
                <div className="voucher-signature-box">
                  <span>{t('Verified / Checked by')}</span>
                </div>
                <div className="voucher-signature-box">
                  <span>{t('Authorized Approval')}</span>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="voucher-footer-actions">
                <Button
                  onClick={() =>
                    void Promise.resolve(print()).catch((error) => toast.error(errorMessage(error)))
                  }
                >
                  <Printer size={16} />
                  {t('Print voucher')}
                </Button>
              </div>
            </>
          )
        )}
      </div>
    </Modal>
  );
}
