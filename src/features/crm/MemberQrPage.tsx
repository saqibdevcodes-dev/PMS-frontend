import { useState } from 'react';
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
} from 'lucide-react';
import { t, useLocale } from '../../lib/i18n';
import { can } from '../../stores/auth';
import { asRows } from '../../lib/types';
import { Button, EmptyState, ErrorState, PageHeading, Skeleton } from '../../components/ui';
import { RecordImage } from '../../components/ImageUpload';
import { CustomerPassCard, type PassCustomer } from './CustomerPassCard';
import './customer-detail.css';
import './member-qr.css';

interface CustomerItem extends PassCustomer {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  identity?: string | null;
  identityLast4?: string | null;
  photoId?: string | null;
}

export default function MemberQrPage() {
  useLocale();
  const [params, setParams] = useSearchParams();

  const [search, setSearch] = useState('');
  const activeParamId = params.get('customerId') ?? '';

  const {
    query: membersQuery,
    selected: selectedQuery,
    effectiveSelectedId,
    page,
    setPage,
  } = useCustomerDirectory(activeParamId, search);
  const allMembers = asRows(membersQuery.data) as unknown as CustomerItem[];

  const filteredMembers = allMembers;
  const selectedMember =
    selectedQuery.data?.id === effectiveSelectedId
      ? (selectedQuery.data as unknown as CustomerItem)
      : null;
  const verificationUrl = useVerificationLink({
    customer: selectedMember?.reference || selectedMember?.id || '',
  });

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

  return (
    <div className="customer-detail-page mqr-page">
      <PageHeading
        eyebrow={t('Customers')}
        title={t('Customer QR codes')}
        description={t('Customer registration and allotment passes with verification QR codes')}
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
                const mCode = m.reference || 'MEM-' + m.id.slice(0, 8).toUpperCase();
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
          {effectiveSelectedId && selectedQuery.isError ? (
            <ErrorState error={selectedQuery.error} retry={() => void selectedQuery.refetch()} />
          ) : selectedQuery.isFetching ? (
            <Skeleton rows={4} />
          ) : selectedMember && !membersQuery.isError ? (
            <div className="customer-id-card-wrapper" id="member-qrcode">
              <CustomerPassCard
                customer={selectedMember}
                verificationUrl={verificationUrl}
                qrSize={160}
              />

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
                {t('Select a customer to view and print their registration or allotment pass')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
