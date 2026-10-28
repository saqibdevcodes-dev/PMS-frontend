import { Info } from 'lucide-react';
import { ProjectLogo } from '../../components/ProjectLogo';
import { QRCode } from '../../components/QRCode';
import { date, humanize, money } from '../../lib/format';
import { t } from '../../lib/i18n';
import './statement.css';

export type AccountStatement = {
  project: {
    id?: string;
    logoId?: string | null;
    name: string;
    currency: string;
    timezone: string;
  };
  customer: {
    id?: string;
    name: string;
    reference: string;
    email?: string | null;
    phone?: string | null;
  };
  generatedAt: string;
  reference?: string;
  from?: string;
  to?: string;
  metrics: { label: string; amount: string; emphasis?: boolean }[];
  notes: string[];
  sections: {
    title: string;
    description: string;
    columns: { key: string; label: string; type?: 'money' | 'date' | 'status'; width: number }[];
    rows: Record<string, string | null>[];
  }[];
};

export function CustomerStatement({ statement: s }: { statement: AccountStatement }) {
  const noteText = (note: string) => {
    const balances = /^Overdue installments: (.+)\. Unallocated advance credit: (.+)\.$/.exec(note);
    return balances
      ? t('Overdue installments: {overdue}. Unallocated advance credit: {advance}.', {
          overdue: balances[1],
          advance: balances[2],
        })
      : t(note);
  };
  return (
    <article className="customer-statement" aria-label={t('Customer account statement')}>
      <header className="statement-header">
        <div>
          <ProjectLogo
            logoId={s.project.logoId ?? null}
            name={s.project.name}
            className="statement-logo"
          />
          <h2>{t('Account statement')}</h2>
          <p>{s.project.name}</p>
        </div>
        <div className="statement-issued">
          <span className="statement-kicker">{t('Customer copy')}</span>
          <span>
            {t('Issued')} {date(s.generatedAt)}
          </span>
          <span>
            {t('Currency')}: {s.project.currency}
          </span>
          {s.customer.id && (
            <div className="statement-qr">
              <QRCode
                value={`${window.location.origin}/verify?customer=${s.customer.id}`}
                size={88}
                color="#1e293b"
                bgColor="#ffffff"
              />
              <span className="statement-qr-label">{t('Scan to verify')}</span>
            </div>
          )}
        </div>
      </header>
      <div className="statement-details">
        <div>
          <span className="statement-kicker">{t('Prepared for')}</span>
          <h3>{s.customer.name}</h3>
          <span className="statement-reference">{s.customer.reference}</span>
          {s.customer.email && <span>{s.customer.email}</span>}
          {s.customer.phone && <span dir="ltr">{s.customer.phone}</span>}
        </div>
        <div>
          <span className="statement-kicker">{t('Payment period')}</span>
          <strong>
            {s.from || s.to
              ? `${s.from ? date(s.from) : t('Beginning')} – ${s.to ? date(s.to) : t('Present')}`
              : t('All recorded payments')}
          </strong>
          {s.reference && <span className="statement-reference">{s.reference}</span>}
          <span>
            {t('Balances as of')} {date(s.generatedAt)}
          </span>
        </div>
      </div>
      <div className="statement-metrics">
        {s.metrics.map((metric) => (
          <div
            key={metric.label}
            className={
              metric.emphasis ? 'statement-metric statement-metric-emphasis' : 'statement-metric'
            }
          >
            <span>{t(metric.label)}</span>
            <strong>{money(metric.amount, s.project.currency)}</strong>
          </div>
        ))}
      </div>
      <div className="statement-notes">
        <Info size={18} aria-hidden />
        <div>
          {s.notes.map((note) => (
            <p key={note}>{noteText(note)}</p>
          ))}
        </div>
      </div>
      {s.sections.map((section, sectionIndex) => (
        <section
          className="statement-section"
          key={section.title}
          aria-labelledby={`statement-section-${sectionIndex}`}
        >
          <div className="statement-section-heading">
            <div>
              <h3 id={`statement-section-${sectionIndex}`}>{t(section.title)}</h3>
              <p>{t(section.description)}</p>
            </div>
            <span>{s.project.currency}</span>
          </div>
          <div
            className="statement-table-scroll"
            role="region"
            aria-label={t(section.title)}
            tabIndex={0}
          >
            <table>
              <thead>
                <tr>
                  {section.columns.map((column) => (
                    <th
                      key={column.key}
                      scope="col"
                      className={column.type === 'money' ? 'statement-amount' : undefined}
                    >
                      {t(column.label)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {section.rows.map((row, index) => (
                  <tr key={index}>
                    {section.columns.map((column) => {
                      const value = row[column.key];
                      return (
                        <td
                          key={column.key}
                          data-label={t(column.label)}
                          className={column.type === 'money' ? 'statement-amount' : undefined}
                        >
                          {value == null || value === '' ? (
                            '—'
                          ) : column.type === 'money' ? (
                            money(value, '')
                          ) : column.type === 'date' ? (
                            date(value)
                          ) : column.type === 'status' ? (
                            <span className="statement-status" data-status={value}>
                              {value === 'CLEARED'
                                ? t('Verified')
                                : value === 'DRAFT'
                                  ? t('Pending confirmation')
                                  : humanize(value)}
                            </span>
                          ) : column.key === 'ownership' || column.key === 'method' ? (
                            t(value)
                          ) : (
                            value
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {!section.rows.length && (
                  <tr>
                    <td className="statement-empty" colSpan={section.columns.length}>
                      {t('No entries for this period.')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      ))}
      <footer className="statement-footer">
        <strong>{t('Questions about your statement?')}</strong>
        <p>{t('Contact the property office with your customer or booking reference.')}</p>
      </footer>
    </article>
  );
}
