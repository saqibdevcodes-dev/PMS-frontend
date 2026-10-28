import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  FileText,
  MapPin,
  Clock,
  ArrowRight,
  User,
  FileSpreadsheet,
  Coins,
} from 'lucide-react';
import { t } from '../../lib/i18n';
import { money, date, humanize } from '../../lib/format';
import { row, type Row } from '../../lib/types';
import './purchase-table.css';

export const purchaseColumnLabels: Record<string, string> = {
  reference: 'Purchase reference',
  title: 'Property & Location',
  unit: 'Project unit / plot',
  vendor: 'Seller / Vendor',
  purchaseDate: 'Purchase date',
  price: 'Base price',
  otherCosts: 'Taxes & Expenses',
  total: 'Total acquisition cost',
  status: 'Status & Voucher',
  actions: 'Actions',
};

export function PropertyPurchaseGuide() {
  return (
    <div className="purchase-guide-banner">
      <div className="purchase-guide-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="purchase-guide-icon">
            <Building2 size={20} />
          </div>
          <div>
            <h3>{t('Property Acquisition & Complete Lifecycle Workflow')}</h3>
            <p>
              {t(
                'Follow the unified 6-step lifecycle: Acquisition from Seller → Expenses Management → Move to Selling → Customer Booking → Sold P&L.',
              )}
            </p>
          </div>
        </div>
        <Link
          to="/property-lifecycle"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 650,
            background: 'var(--primary, #0284c7)',
            color: 'var(--on-primary, #ffffff)',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          <Coins size={14} />
          <span>{t('Open Property Lifecycle Hub')}</span>
          <ArrowRight size={13} />
        </Link>
      </div>
      <div className="purchase-guide-steps">
        <div className="purchase-step-card">
          <span className="purchase-step-num">1</span>
          <div>
            <strong>{t('Save as Draft')}</strong>
            <p>
              {t(
                'Enter property details, seller info, base price, legal/taxes, and renovation expenses without affecting general accounts.',
              )}
            </p>
          </div>
        </div>
        <div className="purchase-step-arrow">
          <ArrowRight size={16} />
        </div>
        <div className="purchase-step-card">
          <span className="purchase-step-num">2</span>
          <div>
            <strong>{t('Post Purchase (Finalize)')}</strong>
            <p>
              {t(
                'Review and post to accounts. Records property into project inventory assets and establishes the payable balance owed to the seller.',
              )}
            </p>
          </div>
        </div>
        <div className="purchase-step-arrow">
          <ArrowRight size={16} />
        </div>
        <div className="purchase-step-card">
          <span className="purchase-step-num">3</span>
          <div>
            <strong>{t('Accounting Voucher')}</strong>
            <p>
              {t(
                'Generates an official Journal Voucher (JV) documenting inventory debits and seller credit obligations for audits and tax records.',
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function purchaseCell(
  column: string,
  record: Row,
  onViewVoucher?: (journalId: string) => void,
) {
  if (column === 'reference') {
    const fileRef = record.fileReference ? String(record.fileReference) : '';
    return (
      <div className="purchase-cell-stack">
        <strong className="purchase-ref-code">{String(record.reference ?? '—')}</strong>
        {fileRef ? (
          <small className="purchase-doc-ref" title={t('Deed / Agreement file reference')}>
            <FileSpreadsheet size={11} aria-hidden />
            <span>{fileRef}</span>
          </small>
        ) : null}
      </div>
    );
  }

  if (column === 'title') {
    const title = String(record.title ?? '—');
    const location = String(record.location ?? '').trim();
    return (
      <div className="purchase-cell-stack">
        <strong className="purchase-title-text" title={title}>
          {title}
        </strong>
        {location ? (
          <small className="purchase-location-text" title={location}>
            <MapPin size={11} aria-hidden />
            <span>{location}</span>
          </small>
        ) : null}
      </div>
    );
  }

  if (column === 'unit') {
    if (record.unit) {
      const u = row(record.unit);
      return (
        <div className="purchase-cell-stack">
          <span className="purchase-unit-badge">
            <Building2 size={11} aria-hidden />
            <strong>Unit #{String(u.number)}</strong>
          </span>
          <small className="muted">
            {[
              u.type ? humanize(String(u.type)) : '',
              u.size ? `${u.size} ${u.measurementUnit ?? ''}`.trim() : '',
            ]
              .filter(Boolean)
              .join(' · ')}
          </small>
        </div>
      );
    }
    return (
      <span
        className="purchase-direct-tag"
        title={t('Standalone acquisition not mapped to a project inventory unit')}
      >
        {t('Direct Acquisition')}
      </span>
    );
  }

  if (column === 'vendor') {
    const v = row(record.vendor);
    const name = String(v.name ?? '—');
    const phone = String(v.phone ?? '').trim();
    return (
      <div className="purchase-cell-stack">
        <div className="purchase-vendor-row">
          <User size={12} className="muted" aria-hidden />
          <strong className="purchase-vendor-name" title={name}>
            {name}
          </strong>
        </div>
        {phone ? (
          <small className="purchase-vendor-phone muted" title={phone}>
            {phone}
          </small>
        ) : (
          <small className="muted">{t('Seller')}</small>
        )}
      </div>
    );
  }

  if (column === 'purchaseDate') {
    return <span className="nowrap">{date(record.purchaseDate)}</span>;
  }

  if (column === 'price') {
    return (
      <div className="purchase-cell-stack">
        <span className="numeric">{money(record.price)}</span>
        <small className="muted">{t('Base price')}</small>
      </div>
    );
  }

  if (column === 'otherCosts') {
    const total = Number(record.total ?? 0);
    const base = Number(record.price ?? 0);
    const extra = Math.max(0, total - base);
    const itemsCount = Array.isArray(record.expenseItems) ? record.expenseItems.length : 0;
    return extra > 0 ? (
      <div className="purchase-cell-stack">
        <span className="numeric purchase-extra-amount">+{money(extra)}</span>
        <small className="muted">
          {itemsCount > 0
            ? t('{count} expenses & fees', { count: itemsCount })
            : t('Taxes, legal & fees')}
        </small>
      </div>
    ) : (
      <span className="muted">Rs 0.00</span>
    );
  }

  if (column === 'total') {
    return (
      <div className="purchase-cell-stack">
        <strong className="numeric purchase-total-cost">{money(record.total)}</strong>
        <small className="muted">{t('Total acquisition')}</small>
      </div>
    );
  }

  if (column === 'status') {
    const st = String(record.status ?? 'DRAFT').toUpperCase();
    if (st === 'DRAFT') {
      return (
        <div className="purchase-cell-stack">
          <span
            className="badge badge-warning"
            title={t('Draft purchase: Not yet posted into financial accounts.')}
          >
            <span className="status-dot" />
            {t('Draft (Pending Post)')}
          </span>
          <small className="muted purchase-status-hint">
            <Clock size={10} aria-hidden />
            {t('Post to finalize')}
          </small>
        </div>
      );
    }
    if (st === 'POSTED') {
      const jv = row(record.journal);
      const jvRef = jv.reference ? String(jv.reference) : '';
      return (
        <div className="purchase-cell-stack">
          <span
            className="badge badge-success"
            title={t('Finalized: Recorded into general ledger & inventory.')}
          >
            <span className="status-dot" />
            {t('Posted (Finalized)')}
          </span>
          {jvRef ? (
            <button
              type="button"
              className="purchase-voucher-pill"
              title={t('Click to view Accounting Voucher {ref}', { ref: jvRef })}
              onClick={(e) => {
                e.stopPropagation();
                if (record.journalId && onViewVoucher) {
                  onViewVoucher(String(record.journalId));
                }
              }}
            >
              <FileText size={11} aria-hidden />
              <span>{jvRef}</span>
            </button>
          ) : null}
        </div>
      );
    }
    if (st === 'VOIDED') {
      const reason = record.voidReason ? String(record.voidReason) : '';
      return (
        <div className="purchase-cell-stack">
          <span className="badge badge-danger" title={reason || t('Purchase voided')}>
            <span className="status-dot" />
            {t('Voided (Cancelled)')}
          </span>
          {reason ? (
            <small className="muted purchase-void-reason" title={reason}>
              {reason}
            </small>
          ) : null}
        </div>
      );
    }
  }

  return undefined;
}
