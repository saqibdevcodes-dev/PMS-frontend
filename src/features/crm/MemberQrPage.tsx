import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useCustomerDirectory } from '../../hooks/use-customer-directory';
import { useVerificationLink } from '../../lib/verification-link';
import {
  QrCode,
  Search,
  Printer,
  UserCheck,
  X,
  Phone,
  CreditCard,
  UserPlus,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { t, useLocale } from '../../lib/i18n';
import { can } from '../../stores/auth';
import { asRows } from '../../lib/types';
import { Button, EmptyState, ErrorState, PageHeading, Skeleton } from '../../components/ui';
import { QRCode } from '../../components/QRCode';
import { RecordImage } from '../../components/ImageUpload';
import './customer-detail.css';
import './member-qr.css';

interface CustomerItem {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  identity?: string | null;
  identityLast4?: string | null;
  photoId?: string | null;
  paymentStatus?: string | null;
}

export default function MemberQrPage() {
  useLocale();
  const [params, setParams] = useSearchParams();

  const [search, setSearch] = useState('');
  const activeParamId = params.get('customerId') ?? '';

  const {
    query: membersQuery,
    selected: selectedQuery,
    page,
    setPage,
  } = useCustomerDirectory(activeParamId, search);
  const allMembers = asRows(membersQuery.data) as unknown as CustomerItem[];

  const filteredMembers = allMembers;
  const selectedMember = useMemo(
    () =>
      activeParamId
        ? selectedQuery.data?.id === activeParamId
          ? (selectedQuery.data as unknown as CustomerItem)
          : null
        : (filteredMembers[0] ?? null),
    [activeParamId, selectedQuery.data, filteredMembers],
  );
  const ownsProperty = ['INSTALLMENTS', 'FULLY_PAID'].includes(selectedMember?.paymentStatus ?? '');
  const verificationUrl = useVerificationLink({ customer: selectedMember?.id ?? '' });

  const selectMember = (id: string) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('customerId', id);
        return next;
      },
      { replace: true },
    );
  };

  const handlePrintBadge = () => {
    if (!selectedMember || !verificationUrl) return;
    document.body.classList.add('print-customer-badge-active');
    window.print();
    window.setTimeout(() => {
      document.body.classList.remove('print-customer-badge-active');
    }, 500);
  };

  const selectedCode = selectedMember ? 'MEM-' + selectedMember.id.slice(0, 8).toUpperCase() : '';

  return (
    <div className="customer-detail-page mqr-page">
      <PageHeading
        eyebrow={t('Customers')}
        title={t('Customer QR codes')}
        description={t(
          'Official digital allotment passes and verification QR codes for all customers',
        )}
        actions={
          <>
            {can('customers.create') && (
              <Button asChild variant="secondary">
                <Link to="/members/register">
                  <UserPlus size={15} />
                  {t('Register customer')}
                </Link>
              </Button>
            )}
            {selectedMember && !membersQuery.isError && (
              <Button
                onClick={handlePrintBadge}
                disabled={!verificationUrl || selectedQuery.isFetching}
              >
                <Printer size={15} />
                {t('Print customer pass')}
              </Button>
            )}
          </>
        }
      />

      {/* Main Layout: Split Screen (Customers List on Left, Active Pass on Right) */}
      <div className="mqr-layout">
        {/* Left Column: Customer Directory & Search */}
        <section
          className="customer-section-card mqr-directory"
          aria-labelledby="mqr-directory-title"
        >
          <div className="mqr-directory-heading">
            <h2 id="mqr-directory-title">
              <UserCheck size={18} />
              {t('Select customer')}
            </h2>
            <span className="muted">
              {t('Showing')} {filteredMembers.length} {t('customers')}
            </span>
          </div>
          <div className="input-icon mqr-search">
            <Search size={16} aria-hidden="true" />
            <input
              type="search"
              aria-label={t('Search customers')}
              placeholder={t('Search by name, phone, CNIC or member ID...')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="mqr-clear-search"
                aria-label={t('Clear search')}
                onClick={() => setSearch('')}
              >
                <X size={15} />
              </Button>
            )}
          </div>
          {membersQuery.isError ? (
            <ErrorState error={membersQuery.error} retry={() => void membersQuery.refetch()} />
          ) : membersQuery.isLoading ? (
            <Skeleton rows={6} />
          ) : filteredMembers.length === 0 ? (
            <EmptyState
              compact
              title={t('No members found')}
              description={t('Try searching with a different name or ID')}
            />
          ) : (
            <div className="mqr-member-list" aria-label={t('Customers')}>
              {filteredMembers.map((m) => {
                const isSelected = selectedMember?.id === m.id;
                const mCode = 'MEM-' + m.id.slice(0, 8).toUpperCase();
                return (
                  <button
                    key={m.id}
                    type="button"
                    className="mqr-member"
                    aria-pressed={isSelected}
                    onClick={() => selectMember(m.id)}
                  >
                    <span className="mqr-member-avatar">
                      {m.photoId ? (
                        <RecordImage id={m.photoId} alt="" />
                      ) : (
                        m.name.charAt(0).toUpperCase()
                      )}
                    </span>
                    <span className="mqr-member-info">
                      <strong>{m.name}</strong>
                      <span className="mqr-member-meta">
                        <code>{mCode}</code>
                        {m.phone && (
                          <span>
                            <Phone size={11} />
                            <bdi>{m.phone}</bdi>
                          </span>
                        )}
                        {m.identityLast4 && (
                          <span>
                            <CreditCard size={11} />
                            ****{m.identityLast4}
                          </span>
                        )}
                      </span>
                    </span>
                    <span className="mqr-member-action">
                      <QrCode size={16} />
                      <span>{isSelected ? t('Viewing pass') : t('View QR')}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <div className="mqr-pagination">
          <Button
            variant="secondary"
            disabled={page === 1 || membersQuery.isFetching}
            onClick={() => setPage(page - 1)}
          >
            {t('Previous')}
          </Button>
          <span>
            {t('Page')} {page} {t('of')}{' '}
            {Math.max(1, membersQuery.data?.pagination.totalPages ?? 1)}
          </span>
          <Button
            variant="secondary"
            disabled={
              page >= (membersQuery.data?.pagination.totalPages ?? 1) || membersQuery.isFetching
            }
            onClick={() => setPage(page + 1)}
          >
            {t('Next')}
          </Button>
        </div>

        {/* Right Column: Member Pass & QR Code Card */}
        <div className="mqr-pass-panel" aria-live="polite">
          {activeParamId && selectedQuery.isError ? (
            <ErrorState error={selectedQuery.error} retry={() => void selectedQuery.refetch()} />
          ) : selectedQuery.isFetching ? (
            <Skeleton rows={4} />
          ) : selectedMember && !membersQuery.isError ? (
            <div className="customer-id-card-wrapper" id="member-qrcode">
              <div className="customer-id-card" id="printable-customer-badge">
                <div className="id-card-header">
                  <span className="org-name">{t('Real Estate Property Management')}</span>
                  <span className="card-type">{t('Official Customer Allotment Pass')}</span>
                </div>

                <div className="id-card-photo">
                  {selectedMember.photoId ? (
                    <RecordImage id={selectedMember.photoId} alt={selectedMember.name} />
                  ) : (
                    <span>{selectedMember.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>

                <h2 className="id-card-name">{selectedMember.name}</h2>
                <div className="id-card-role">
                  {t(ownsProperty ? 'Authorized Property Owner' : 'Registered customer')}
                </div>

                <div className="id-card-code">{selectedCode}</div>

                {/* Generated Standalone Vector QR Code */}
                <div className="id-card-qr-box">
                  <QRCode value={verificationUrl} size={160} color="#064e3b" bgColor="#ffffff" />
                  <span>{t('Scan to verify registration')}</span>
                </div>

                <div className="id-card-footer">
                  <ShieldCheck size={14} />
                  <span>
                    {t(ownsProperty ? 'Verified property owner' : 'Customer registration')}
                  </span>
                </div>
              </div>

              {/* Pass Actions */}
              <div className="customer-id-actions">
                <Button asChild variant="ghost">
                  <Link to={`/customers/${selectedMember.id}`}>
                    <ArrowRight size={15} />
                    {t('View customer profile')}
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div
              className="customer-section-card"
              style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}
            >
              <QrCode size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
              <h4 style={{ margin: 0, fontSize: 16, color: 'var(--text)' }}>
                {t('No customer selected')}
              </h4>
              <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--muted)' }}>
                {t(
                  'Select a customer from the directory to view and print their QR allotment pass',
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
