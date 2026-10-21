import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  QrCode,
  Search,
  Printer,
  UserCheck,
  CheckCircle2,
  X,
  Phone,
  CreditCard,
  UserPlus,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../../lib/api';
import { t, useLocale } from '../../lib/i18n';
import { usePreferences } from '../../stores/preferences';
import { can } from '../../stores/auth';
import { asRows, type Page } from '../../lib/types';
import { Button, Skeleton } from '../../components/ui';
import { QRCode } from '../../components/QRCode';
import { RecordImage } from '../../components/ImageUpload';
import './customer-detail.css';

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
  const projectId = usePreferences((s) => s.projectId);

  const [search, setSearch] = useState('');
  const activeParamId = params.get('customerId') ?? '';

  // Query all project members
  const membersQuery = useQuery({
    queryKey: ['project-members-list', projectId],
    enabled: !!projectId && can('customers.read'),
    queryFn: ({ signal }) =>
      api<Page>(`/projects/${projectId}/customers?limit=100`, { signal }),
  });

  const allMembers = asRows(membersQuery.data?.items) as unknown as CustomerItem[];

  // Filter members by search
  const filteredMembers = useMemo(() => {
    if (!search.trim()) return allMembers;
    const q = search.trim().toLowerCase();
    return allMembers.filter((m) => {
      const code = ('MEM-' + m.id.slice(0, 8)).toLowerCase();
      return (
        m.name?.toLowerCase().includes(q) ||
        m.phone?.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q) ||
        m.identityLast4?.toLowerCase().includes(q) ||
        code.includes(q)
      );
    });
  }, [allMembers, search]);

  // Selected member selection
  const selectedMember = useMemo(() => {
    if (activeParamId) {
      const found = allMembers.find((m) => m.id === activeParamId);
      if (found) return found;
    }
    return filteredMembers[0] || allMembers[0] || null;
  }, [activeParamId, allMembers, filteredMembers]);

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
    document.body.classList.add('print-customer-badge-active');
    window.print();
    window.setTimeout(() => {
      document.body.classList.remove('print-customer-badge-active');
    }, 500);
  };

  const selectedCode = selectedMember
    ? 'MEM-' + selectedMember.id.slice(0, 8).toUpperCase()
    : '';
  const verificationUrl = selectedMember
    ? `${window.location.origin}/verify?customer=${selectedMember.id}`
    : '';

  return (
    <div className="customer-detail-page">
      {/* Header */}
      <div className="customer-page-header">
        <div className="customer-header-left">
          <div className="customer-avatar-badge" style={{ background: 'var(--primary-subtle, #ecfdf5)', color: 'var(--primary, #059669)' }}>
            <QrCode size={26} />
          </div>
          <div>
            <div className="customer-title-row">
              <h1 className="customer-name">{t('Member QR codes')}</h1>
              <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <ShieldCheck size={13} />
                {t('Live verification')}
              </span>
            </div>
            <p className="customer-code-meta">
              {t('Official digital allotment passes and verification QR codes for all members')}
            </p>
          </div>
        </div>

        <div className="customer-header-actions">
          {can('customers.create') && (
            <Button asChild variant="secondary">
              <Link to="/members/register">
                <UserPlus size={15} />
                {t('Register member')}
              </Link>
            </Button>
          )}
          {selectedMember && (
            <Button variant="primary" onClick={handlePrintBadge}>
              <Printer size={15} />
              {t('Print member pass')}
            </Button>
          )}
        </div>
      </div>

      {/* Main Layout: Split Screen (Members List on Left, Active Pass on Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.2fr) minmax(360px, 1fr)', gap: 24, alignItems: 'start' }}>
        
        {/* Left Column: Member Directory & Search */}
        <div className="customer-section-card" style={{ gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <h3 style={{ margin: 0, fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}>
              <UserCheck size={18} color="var(--primary)" />
              {t('Select member')}
            </h3>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {t('Showing')} {filteredMembers.length} {t('members')}
            </span>
          </div>

          {/* Search Bar */}
          <div style={{ position: 'relative' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: 36, paddingRight: search ? 36 : 12, height: 40 }}
              placeholder={t('Search by name, phone, CNIC or member ID...')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                }}
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Members List */}
          {membersQuery.isLoading ? (
            <Skeleton rows={6} />
          ) : filteredMembers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)' }}>
              <QrCode size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <p style={{ margin: 0, fontWeight: 500 }}>{t('No members found')}</p>
              <p style={{ margin: '4px 0 0', fontSize: 13 }}>
                {t('Try searching with a different name or ID')}
              </p>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                maxHeight: 'calc(100vh - 280px)',
                overflowY: 'auto',
                paddingRight: 4,
              }}
            >
              {filteredMembers.map((m) => {
                const isSelected = selectedMember?.id === m.id;
                const mCode = 'MEM-' + m.id.slice(0, 8).toUpperCase();
                return (
                  <div
                    key={m.id}
                    onClick={() => selectMember(m.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: 10,
                      cursor: 'pointer',
                      border: isSelected
                        ? '2px solid var(--primary, #059669)'
                        : '1px solid var(--border-color, #e2e8f0)',
                      background: isSelected
                        ? 'var(--primary-subtle, #ecfdf5)'
                        : 'var(--card-bg, #ffffff)',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 4px 12px rgba(5, 150, 105, 0.12)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: '50%',
                          background: isSelected ? '#059669' : '#0f172a',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: 16,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          flexShrink: 0,
                        }}
                      >
                        {m.photoId ? (
                          <RecordImage id={m.photoId} alt={m.name} />
                        ) : (
                          m.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-color)' }}>
                          {m.name}
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            marginTop: 3,
                            fontSize: 12,
                            color: 'var(--text-muted)',
                          }}
                        >
                          <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{mCode}</span>
                          {m.phone && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                              <Phone size={11} />
                              {m.phone}
                            </span>
                          )}
                          {m.identityLast4 && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                              <CreditCard size={11} />
                              ****{m.identityLast4}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div
                        style={{
                          padding: '6px 10px',
                          borderRadius: 6,
                          background: isSelected ? 'rgba(5, 150, 105, 0.15)' : 'var(--bg-subtle, #f1f5f9)',
                          color: isSelected ? 'var(--primary, #059669)' : 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        <QrCode size={14} />
                        {isSelected ? t('Viewing pass') : t('View QR')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Member Pass & QR Code Card */}
        <div style={{ position: 'sticky', top: 20 }}>
          {selectedMember ? (
            <div className="customer-id-card-wrapper" id="member-qrcode" style={{ margin: 0 }}>
              <div className="customer-id-card" id="printable-customer-badge">
                <div className="id-card-header">
                  <span className="org-name">{t('Real Estate Property Management')}</span>
                  <span className="card-type">{t('Official Member Allotment Pass')}</span>
                </div>

                <div className="id-card-photo">
                  {selectedMember.photoId ? (
                    <RecordImage id={selectedMember.photoId} alt={selectedMember.name} />
                  ) : (
                    <span>{selectedMember.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>

                <h2 className="id-card-name">{selectedMember.name}</h2>
                <div className="id-card-role">{t('Authorized Property Owner')}</div>

                <div className="id-card-code">{selectedCode}</div>

                {/* Generated Standalone Vector QR Code */}
                <div className="id-card-qr-box">
                  <QRCode value={verificationUrl} size={160} color="#064e3b" bgColor="#ffffff" />
                  <span>{t('Scan to verify ownership')}</span>
                </div>

                <div className="id-card-footer">
                  <CheckCircle2 size={14} color="#34d399" />
                  <span>{t('Verified property owner')}</span>
                </div>
              </div>

              {/* Pass Actions */}
              <div className="customer-id-actions" style={{ marginTop: 16 }}>
               
                <Button asChild variant="ghost">
                  <Link to={`/customers/${selectedMember.id}`}>
                    <ArrowRight size={15} />
                    {t('View member profile')}
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div
              className="customer-section-card"
              style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}
            >
              <QrCode size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
              <h4 style={{ margin: 0, fontSize: 16 }}>{t('No member selected')}</h4>
              <p style={{ margin: '8px 0 0', fontSize: 13 }}>
                {t('Select a member from the directory to view and print their QR allotment pass')}
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
