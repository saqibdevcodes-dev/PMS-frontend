import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  FileText,
  Building2,
  Pencil,
  Printer,
  ExternalLink,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  Receipt,
  FileUp,
  Download,
  Trash2,
  FileSpreadsheet,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../lib/api';
import { operations } from '../../lib/contract';
import { t, useLocale } from '../../lib/i18n';
import { date, money } from '../../lib/format';
import { errorMessage } from '../../lib/error-messages';
import { can } from '../../stores/auth';
import { usePreferences } from '../../stores/preferences';
import { Button, Badge, Skeleton, ErrorState } from '../../components/ui';
import { QRCode } from '../../components/QRCode';
import { RecordImage } from '../../components/ImageUpload';
import { OperationDialog } from '../../components/OperationDialog';
import { PropertyFileModal } from '../bookings/PropertyFileModal';
import { DocumentUploadModal } from '../../components/DocumentUploadModal';
import { exportAndDownloadReport } from '../../lib/export-download';
import CustomerAccess from '../portal/CustomerAccess';
import { CustomerStatement, type AccountStatement } from '../reports/CustomerStatement';
import { saveFile } from '../../platform/adapter';
import { asRows, type Operation, type Row, type Page } from '../../lib/types';
import './customer-detail.css';

interface CustomerDetail {
  id: string;
  name: string;
  fatherName?: string | null;
  phone?: string | null;
  secondaryPhone?: string | null;
  email?: string | null;
  address?: string | null;
  identityLast4?: string | null;
  photoId?: string | null;
  createdAt: string;
  updatedAt?: string;
  paymentStatus?: string;
  nominees?: Array<{
    id: string;
    name: string;
    relationship?: string | null;
    identity?: string | null;
    phone?: string | null;
    address?: string | null;
  }>;
  owners?: Array<{
    id: string;
    current: boolean;
    booking: {
      id: string;
      reference: string;
      status: string;
      total: number | string;
    };
  }>;
  bookings?: Array<{
    id: string;
    reference: string;
    status: string;
    total: number | string;
    paid?: number | string;
    outstanding?: number | string;
    nextDue?: string | null;
    unit?: {
      id: string;
      number: string;
      type: string;
      size: number | string;
      measurementUnit: string;
      phase?: string | null;
      block?: string | null;
    };
  }>;
}

export default function CustomerDetailPage() {
  useLocale();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const projectId = usePreferences((s) => s.projectId);
  const currency = usePreferences((s) => s.currency);

  // Default to Overview & Bookings tab as requested
  const [activeTab, setActiveTab] = useState<'overview' | 'statement' | 'documents'>('overview');

  // Statement Filters
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Identity reveal state
  const [revealedIdentity, setRevealedIdentity] = useState<string | null>(null);
  const [revealing, setRevealing] = useState(false);

  // Modals & Operations
  const [action, setAction] = useState<{
    operation: Operation;
    title: string;
    record?: Row;
  } | null>(null);
  const [propertyFileBookingId, setPropertyFileBookingId] = useState<string | null>(null);
  const [uploadDocOpen, setUploadDocOpen] = useState(false);

  // Customer Profile Query
  const customerQuery = useQuery({
    queryKey: ['customer-detail', projectId, id],
    enabled: !!id && !!projectId && can('customers.read'),
    queryFn: ({ signal }) =>
      api<CustomerDetail>(`/projects/${projectId}/customers/${id}`, { signal }),
  });

  // Statement Report Query
  const statementSuffix = new URLSearchParams({
    kind: 'customer-statement',
    ...(id ? { customerId: id } : {}),
    ...(fromDate ? { from: fromDate } : {}),
    ...(toDate ? { to: toDate } : {}),
  }).toString();

  const statementQuery = useQuery({
    queryKey: ['customer-statement-report', projectId, id, statementSuffix],
    enabled: !!id && !!projectId && can('reports.read') && activeTab === 'statement',
    queryFn: ({ signal }) =>
      api<{ statement?: AccountStatement }>(`/projects/${projectId}/reports?${statementSuffix}`, {
        signal,
      }),
  });

  // Documents Query
  const documentsQuery = useQuery({
    queryKey: ['customer-documents', projectId, id],
    enabled: !!id && !!projectId && can('documents.read'),
    queryFn: ({ signal }) =>
      api<Page>(`/projects/${projectId}/documents?customerId=${id}&limit=50`, { signal }),
  });

  // Export Mutations
  const exportMutation = useMutation({
    mutationFn: (format: 'xlsx' | 'pdf') =>
      exportAndDownloadReport({
        projectId: projectId!,
        report: {
          kind: 'customer-statement',
          customerId: id,
          ...(fromDate ? { from: fromDate } : {}),
          ...(toDate ? { to: toDate } : {}),
        },
        format,
        filename: `${customer?.name ? customer.name.replace(/[^a-zA-Z0-9_-]/g, '_') : 'member'}-statement.${format}`,
      }),
  });


  // Delete Document Mutation
  const deleteDocMutation = useMutation({
    mutationFn: (docId: string) =>
      api(`/projects/${projectId}/documents/${docId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      toast.success(t('Document deleted'));
      void queryClient.invalidateQueries({ queryKey: ['customer-documents', projectId, id] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  // Download Document Mutation
  const downloadDocMutation = useMutation({
    mutationFn: (doc: Row) =>
      api<{ url: string }>(`/projects/${projectId}/documents/${doc.id}/download`),
    onSuccess: (res, doc) =>
      void saveFile(res.url, String(doc.name || 'document.pdf')).catch((e: Error) =>
        toast.error(errorMessage(e)),
      ),
    onError: (e) => toast.error(errorMessage(e)),
  });

  const customer = customerQuery.data;

  const handleRevealIdentity = async () => {
    if (!id || !projectId) return;
    try {
      setRevealing(true);
      const res = await api<{ identity: string }>(
        `/projects/${projectId}/customers/${id}/identity`,
      );
      setRevealedIdentity(res.identity);
    } catch (e) {
      toast.error(e instanceof Error ? errorMessage(e) : t('Unable to reveal identity'));
    } finally {
      setRevealing(false);
    }
  };

  // Print Handlers
  const handlePrintBadge = () => {
    document.body.classList.add('print-customer-badge-active');
    window.print();
    window.setTimeout(() => {
      document.body.classList.remove('print-customer-badge-active');
    }, 500);
  };

  const handlePrintStatement = () => {
    document.body.classList.add('print-customer-statement-active');
    window.print();
    window.setTimeout(() => {
      document.body.classList.remove('print-customer-statement-active');
    }, 500);
  };

  if (customerQuery.isLoading) {
    return (
      <div className="customer-detail-page">
        <Skeleton rows={8} />
      </div>
    );
  }

  if (customerQuery.isError || !customer) {
    return (
      <div className="customer-detail-page">
        <Button variant="ghost" onClick={() => navigate('/customers')}>
          <ArrowLeft size={16} />
          {t('Back to members')}
        </Button>
        <ErrorState
          error={customerQuery.error ?? new Error(t('Member not found'))}
          retry={() => void customerQuery.refetch()}
        />
      </div>
    );
  }

  const customerCode = customer.id.toUpperCase().startsWith('MEM-')
    ? customer.id
    : `MEM-${customer.id.slice(0, 8).toUpperCase()}`;
  const verificationUrl = `${window.location.origin}/verify?customer=${customer.id}`;

  const editOp = operations.find(
    (o) => o.path === '/projects/{projectId}/customers/{id}' && o.method === 'patch',
  );

  const docItems = asRows(documentsQuery.data?.items);
  const statement = statementQuery.data?.statement;

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      el.classList.add('section-highlight');
      setTimeout(() => el.classList.remove('section-highlight'), 1500);
    }
  };

  return (
    <div className="customer-detail-page">
      {/* Top Navigation */}
      <div className="customer-detail-nav">
        <Button variant="ghost" onClick={() => navigate('/customers')}>
          <ArrowLeft size={16} />
          {t('Back to members')}
        </Button>
      </div>

      {/* Main Header */}
      <header className="customer-detail-header">
        <div className="customer-detail-title-area">
          <div className="customer-detail-avatar-wrap">
            {customer.photoId ? (
              <RecordImage id={customer.photoId} alt={customer.name} />
            ) : (
              <span>{customer.name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="customer-detail-info">
            <h1>{customer.name}</h1>
            <div className="customer-detail-meta">
              <span className="id-card-code">{customerCode}</span>
              {customer.phone && (
                <>
                  <span>·</span>
                  <span>{customer.phone}</span>
                </>
              )}
              {customer.email && (
                <>
                  <span>·</span>
                  <span>{customer.email}</span>
                </>
              )}
              {customer.paymentStatus && (
                <>
                  <span>·</span>
                  <Badge value={customer.paymentStatus} />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="customer-detail-actions">
          <Button variant="secondary" onClick={handlePrintBadge}>
            <Printer size={15} />
            {t('Print member pass')}
          </Button>

          {editOp && can('customers.update') && (
            <Button
              variant="secondary"
              onClick={() =>
                setAction({
                  operation: editOp,
                  title: t('Edit member details'),
                  record: customer as unknown as Row,
                })
              }
            >
              <Pencil size={15} />
              {t('Edit member')}
            </Button>
          )}

          {can('customers.view_sensitive') && (
            <Button variant="secondary" busy={revealing} onClick={handleRevealIdentity}>
              <Lock size={15} />
              {revealedIdentity ? revealedIdentity : t('Reveal identity')}
            </Button>
          )}
        </div>
      </header>

      {/* Member Registration Sub-Navigation Tree Toolbar */}
      <div className="member-registration-subnav" aria-label={t('Member Registration')}>
        <div className="member-registration-subnav-badge">
          <ShieldCheck size={15} />
          <span>{t('Member Registration')}</span>
        </div>
        <button
          type="button"
          className="member-subnav-btn"
          onClick={() => {
            if (activeTab !== 'overview') setActiveTab('overview');
            setTimeout(() => scrollToSection('member-info'), 50);
          }}
        >
          <UserCheck size={13} />
          {t('Member')}
        </button>
        <button
          type="button"
          className="member-subnav-btn"
          onClick={() => setActiveTab('documents')}
        >
          <FileText size={13} />
          {t('Attachments')}
        </button>
        <button
          type="button"
          className="member-subnav-btn"
          onClick={() => {
            if (activeTab !== 'overview') setActiveTab('overview');
            setTimeout(() => scrollToSection('member-reg'), 50);
          }}
        >
          <CheckCircle2 size={13} />
          {t('Registration')}
        </button>
        <button
          type="button"
          className="member-subnav-btn"
          onClick={() => {
            if (activeTab !== 'overview') setActiveTab('overview');
            setTimeout(() => scrollToSection('member-bookings'), 50);
          }}
        >
          <Building2 size={13} />
          {t('Booking')}
        </button>
        <button
          type="button"
          className="member-subnav-btn"
          onClick={() => {
            if (activeTab !== 'overview') setActiveTab('overview');
            setTimeout(() => scrollToSection('member-qrcode'), 50);
          }}
        >
          <Printer size={13} />
          {t('QR-Code')}
        </button>
        <button
          type="button"
          className="member-subnav-btn"
          onClick={() => {
            if (activeTab !== 'overview') setActiveTab('overview');
            setTimeout(() => scrollToSection('member-fingerprints'), 50);
          }}
        >
          <Lock size={13} />
          {t('Finger Prints')}
        </button>
        <button
          type="button"
          className="member-subnav-btn"
          onClick={() => {
            if (activeTab !== 'overview') setActiveTab('overview');
            setTimeout(() => scrollToSection('member-agent'), 50);
          }}
        >
          <UserCheck size={13} />
          {t('Agent Registration')}
        </button>
      </div>

      {/* Tabs Navigation */}
      <nav className="customer-detail-tabs" aria-label={t('Member sections')}>
        <button
          type="button"
          className={`customer-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <UserCheck size={16} />
          {t('Overview & Bookings')}
        </button>

        <button
          type="button"
          className={`customer-tab-btn ${activeTab === 'statement' ? 'active' : ''}`}
          onClick={() => setActiveTab('statement')}
        >
          <Receipt size={16} />
          {t('Statement & Ledger')}
        </button>

        <button
          type="button"
          className={`customer-tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          <FileText size={16} />
          {t('Attachments & Documents')}
          <span className="customer-tab-count">{docItems.length}</span>
        </button>
      </nav>

      {/* TAB 1: Overview & Bookings (First & Default) */}
      {activeTab === 'overview' && (
        <div className="customer-detail-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Section: Personal & Contact Information */}
            <section className="customer-section-card" id="member-info">
              <div className="customer-section-header">
                <h3>{t('Member information')}</h3>
              </div>
              <div className="customer-fields-grid">
                <div className="customer-field">
                  <label>{t('Registration code')}</label>
                  <strong>{customerCode}</strong>
                </div>
                <div className="customer-field">
                  <label>{t('Full name')}</label>
                  <span>{customer.name}</span>
                </div>
                <div className="customer-field">
                  <label>{t('Father / Guardian')}</label>
                  <span>{customer.fatherName || '—'}</span>
                </div>
                <div className="customer-field">
                  <label>{t('CNIC / Identity')}</label>
                  <span>
                    {revealedIdentity ? (
                      <strong style={{ color: 'var(--primary)' }}>{revealedIdentity}</strong>
                    ) : customer.identityLast4 ? (
                      `•••• ${customer.identityLast4}`
                    ) : (
                      '—'
                    )}
                  </span>
                </div>
                <div className="customer-field">
                  <label>{t('Mobile phone')}</label>
                  <span>{customer.phone || '—'}</span>
                </div>
                <div className="customer-field">
                  <label>{t('Secondary phone')}</label>
                  <span>{customer.secondaryPhone || '—'}</span>
                </div>
                <div className="customer-field">
                  <label>{t('Email address')}</label>
                  <span>{customer.email || '—'}</span>
                </div>
                <div className="customer-field">
                  <label>{t('Creation time')}</label>
                  <span>{customer.createdAt ? date(customer.createdAt) : '—'}</span>
                </div>
                <div className="customer-field" style={{ gridColumn: '1 / -1' }}>
                  <label>{t('Residential address')}</label>
                  <span>{customer.address || '—'}</span>
                </div>
              </div>
            </section>

            {/* Section: Registration Status & Details */}
            <section className="customer-section-card" id="member-reg">
              <div className="customer-section-header">
                <h3>
                  <CheckCircle2 size={18} />
                  {t('Registration details')}
                </h3>
              </div>
              <div className="customer-fields-grid">
                <div className="customer-field">
                  <label>{t('Registration code')}</label>
                  <strong style={{ color: 'var(--primary)', fontSize: 15 }}>{customerCode}</strong>
                </div>
                <div className="customer-field">
                  <label>{t('Membership status')}</label>
                  <div>
                    <Badge value={customer.paymentStatus || 'ACTIVE'} />
                  </div>
                </div>
                <div className="customer-field">
                  <label>{t('Registration date')}</label>
                  <span>{customer.createdAt ? date(customer.createdAt) : '—'}</span>
                </div>
                <div className="customer-field">
                  <label>{t('Allotment pass')}</label>
                  <span>{t('Verified property owner')}</span>
                </div>
              </div>
            </section>

            {/* Section: Finger Prints & Identity Verification */}
            <section className="customer-section-card" id="member-fingerprints">
              <div className="customer-section-header">
                <h3>
                  <Lock size={18} />
                  {t('Finger Prints & Identity')}
                </h3>
                {can('customers.view_sensitive') && (
                  <Button variant="secondary" size="small" busy={revealing} onClick={handleRevealIdentity}>
                    <Lock size={14} />
                    {revealedIdentity ? revealedIdentity : t('Reveal identity')}
                  </Button>
                )}
              </div>
              <div className="customer-fields-grid">
                <div className="customer-field">
                  <label>{t('CNIC / National Identity')}</label>
                  <span>
                    {revealedIdentity ? (
                      <strong style={{ color: 'var(--primary)', fontSize: 15 }}>{revealedIdentity}</strong>
                    ) : customer.identityLast4 ? (
                      `•••• ••••••• ${customer.identityLast4}`
                    ) : (
                      '—'
                    )}
                  </span>
                </div>
                <div className="customer-field">
                  <label>{t('Biometric / Finger Prints')}</label>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#16a34a', fontWeight: 600 }}>
                    <ShieldCheck size={16} />
                    {t('Fingerprints on file')}
                  </span>
                </div>
                <div className="customer-field">
                  <label>{t('Security clearance')}</label>
                  <span>{t('Identity verified')}</span>
                </div>
              </div>
            </section>

            {/* Section: Agent & Nominee Registration */}
            <section className="customer-section-card" id="member-agent">
              <div className="customer-section-header">
                <h3>
                  <UserCheck size={18} />
                  {t('Agent & Nominee Registration')}
                </h3>
              </div>
              {customer.nominees && customer.nominees.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {customer.nominees.map((nom) => (
                    <div
                      key={nom.id}
                      style={{
                        background: 'var(--subtle)',
                        border: '1px solid var(--border)',
                        padding: '14px 18px',
                        borderRadius: 8,
                      }}
                    >
                      <div className="customer-fields-grid">
                        <div className="customer-field">
                          <label>{t('Nominee name')}</label>
                          <strong>{nom.name}</strong>
                        </div>
                        <div className="customer-field">
                          <label>{t('Relationship')}</label>
                          <span>{nom.relationship || '—'}</span>
                        </div>
                        <div className="customer-field">
                          <label>{t('CNIC / Identity')}</label>
                          <span>{nom.identity || '—'}</span>
                        </div>
                        <div className="customer-field">
                          <label>{t('Mobile phone')}</label>
                          <span>{nom.phone || '—'}</span>
                        </div>
                        <div className="customer-field" style={{ gridColumn: '1 / -1' }}>
                          <label>{t('Nominee address')}</label>
                          <span>{nom.address || '—'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--muted)', margin: 0 }}>
                  {t('No nominee information recorded.')}
                </p>
              )}
            </section>

            {/* Section: Booked Properties & Portfolio */}
            <section className="customer-section-card" id="member-bookings">
              <div className="customer-section-header">
                <h3>
                  <Building2 size={18} />
                  {t('Booked properties')}
                </h3>
              </div>
              {customer.bookings && customer.bookings.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {customer.bookings.map((bkg) => (
                    <div
                      key={bkg.id}
                      style={{
                        background: 'var(--subtle)',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        padding: '16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 12,
                      }}
                    >
                      <div>
                        <div
                          style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}
                        >
                          <strong style={{ fontSize: 15 }}>{bkg.reference}</strong>
                          <Badge value={bkg.status} />
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                          {bkg.unit ? (
                            <>
                              {t('Property')} <strong>{bkg.unit.number}</strong> ({bkg.unit.type}) ·{' '}
                              {bkg.unit.size} {bkg.unit.measurementUnit}
                              {bkg.unit.phase ? ` · ${bkg.unit.phase}` : ''}
                            </>
                          ) : (
                            t('Allotted Property')
                          )}
                        </div>
                        <div style={{ fontSize: 13, marginTop: 4 }}>
                          {t('Contract')}: <strong>{money(bkg.total, currency)}</strong>
                          {bkg.paid != null && (
                            <span style={{ marginLeft: 12, color: '#16a34a' }}>
                              {t('Paid')}: {money(bkg.paid, currency)}
                            </span>
                          )}
                          {bkg.outstanding != null && Number(bkg.outstanding) > 0 && (
                            <span style={{ marginLeft: 12, color: '#f59e0b' }}>
                              {t('Outstanding')}: {money(bkg.outstanding, currency)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8 }}>
                        <Button
                          size="small"
                          variant="secondary"
                          onClick={() => setPropertyFileBookingId(bkg.id)}
                        >
                          <FileText size={14} />
                          {t('Computerized file')}
                        </Button>
                        <Button asChild size="small" variant="secondary">
                          <Link to={`/bookings?record=${bkg.id}`}>
                            {t('Booking details')}
                            <ArrowUpRight size={13} />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--muted)', margin: 0 }}>
                  {t('No property bookings found for this member.')}
                </p>
              )}
            </section>

            {/* Section: Customer Portal Access */}
            {can('customers.portal.manage') && projectId && (
              <CustomerAccess projectId={projectId} customerId={customer.id} />
            )}
          </div>

          {/* Right Column: Official Member Pass & QR Code */}
          <div className="customer-id-card-wrapper" id="member-qrcode">
            <div className="customer-id-card" id="printable-customer-badge">
              <div className="id-card-header">
                <span className="org-name">{t('Real Estate Property Management')}</span>
                <span className="card-type">{t('Official Member Allotment Pass')}</span>
              </div>

              <div className="id-card-photo">
                {customer.photoId ? (
                  <RecordImage id={customer.photoId} alt={customer.name} />
                ) : (
                  <span>{customer.name.charAt(0).toUpperCase()}</span>
                )}
              </div>

              <h2 className="id-card-name">{customer.name}</h2>
              <div className="id-card-role">{t('Authorized Property Owner')}</div>

              <div className="id-card-code">{customerCode}</div>

              {/* Generated Standalone Vector QR Code */}
              <div className="id-card-qr-box">
                <QRCode value={verificationUrl} size={150} color="#064e3b" bgColor="#ffffff" />
                <span>{t('Scan to verify ownership')}</span>
              </div>

              <div className="id-card-footer">
                <CheckCircle2 size={14} color="#34d399" />
                <span>{t('Verified property owner')}</span>
              </div>
            </div>

            <div className="customer-id-actions">
              <Button variant="secondary" onClick={handlePrintBadge}>
                <Printer size={15} />
                {t('Print member pass')}
              </Button>
              <Button asChild variant="primary">
                <Link to={`/verify?customer=${customer.id}`} target="_blank">
                  <ExternalLink size={15} />
                  {t('Verify online')}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Statement & Ledger */}
      {activeTab === 'statement' && (
        <div className="customer-tab-panel">
          <div className="customer-section-card" style={{ gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18 }}>{t('Member Statement & Account Ledger')}</h3>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted)' }}>
                  {t('All member bookings, payment schedules, and verified records')}
                </p>
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Button variant="secondary" onClick={handlePrintStatement}>
                  <Printer size={15} />
                  {t('Print statement')}
                </Button>
                {can('reports.export') && (
                  <>
                    <Button
                      variant="secondary"
                      busy={exportMutation.isPending}
                      onClick={() => exportMutation.mutate('pdf')}
                    >
                      <Download size={15} />
                      {t('Export PDF')}
                    </Button>
                    <Button
                      variant="secondary"
                      busy={exportMutation.isPending}
                      onClick={() => exportMutation.mutate('xlsx')}
                    >
                      <FileSpreadsheet size={15} />
                      {t('Export Excel')}
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Date Filters Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                flexWrap: 'wrap',
                padding: '12px 16px',
                background: 'var(--subtle)',
                borderRadius: 8,
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <label style={{ fontWeight: 600, color: 'var(--muted)' }}>{t('From date')}</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  style={{
                    padding: '6px 10px',
                    border: '1px solid var(--border)',
                    background: 'var(--panel)',
                    color: 'var(--text)',
                    borderRadius: 6,
                    fontSize: 13,
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <label style={{ fontWeight: 600, color: 'var(--muted)' }}>{t('To date')}</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  style={{
                    padding: '6px 10px',
                    border: '1px solid var(--border)',
                    background: 'var(--panel)',
                    color: 'var(--text)',
                    borderRadius: 6,
                    fontSize: 13,
                  }}
                />
              </div>

              {(fromDate || toDate) && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setFromDate('');
                    setToDate('');
                  }}
                >
                  <X size={14} />
                  {t('Clear filters')}
                </Button>
              )}
            </div>

            {/* Statement Render */}
            {statementQuery.isLoading ? (
              <Skeleton rows={8} />
            ) : statement ? (
              <CustomerStatement statement={statement} />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)' }}>
                <Receipt size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
                <h4 style={{ margin: '0 0 6px', color: 'var(--text)' }}>
                  {t('No statement available for this member.')}
                </h4>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Documents / Attachments */}
      {activeTab === 'documents' && (
        <div className="customer-tab-panel">
          <div className="customer-section-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18 }}>{t('Attachments & Documents')}</h3>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted)' }}>
                  {t('Upload allotment forms, CNIC copies, receipts, or legal affidavits.')}
                </p>
              </div>

              {can('documents.manage') && (
                <Button variant="primary" onClick={() => setUploadDocOpen(true)}>
                  <FileUp size={15} />
                  {t('Upload member document')}
                </Button>
              )}
            </div>

            {documentsQuery.isLoading ? (
              <Skeleton rows={4} />
            ) : docItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)' }}>
                <FileText size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
                <h4 style={{ margin: '0 0 6px', color: 'var(--text)' }}>
                  {t('No attachments uploaded for this member.')}
                </h4>
                {can('documents.manage') && (
                  <Button variant="primary" onClick={() => setUploadDocOpen(true)} style={{ marginTop: 12 }}>
                    <FileUp size={15} />
                    {t('Upload member document')}
                  </Button>
                )}
              </div>
            ) : (
              <div className="customer-docs-grid">
                {docItems.map((doc) => {
                  const sizeKb = doc.size ? Math.round(Number(doc.size) / 1024) : 0;
                  return (
                    <div key={doc.id} className="customer-doc-card">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, overflow: 'hidden' }}>
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 8,
                            background: '#eff6ff',
                            color: '#2563eb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <FileText size={20} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, overflow: 'hidden' }}>
                          <strong
                            title={String(doc.name)}
                            style={{
                              fontSize: 13,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {String(doc.name)}
                          </strong>
                          <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                            {sizeKb} KB · {doc.createdAt ? date(String(doc.createdAt)) : ''}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 4 }}>
                        <Button
                          variant="ghost"
                          title={t('Download')}
                          onClick={() => downloadDocMutation.mutate(doc)}
                          disabled={downloadDocMutation.isPending}
                        >
                          <Download size={15} />
                        </Button>
                        {can('documents.manage') && (
                          <Button
                            variant="ghost"
                            title={t('Delete document')}
                            onClick={() => {
                              if (window.confirm(t('Are you sure you want to delete this document?'))) {
                                deleteDocMutation.mutate(String(doc.id));
                              }
                            }}
                            disabled={deleteDocMutation.isPending}
                          >
                            <Trash2 size={15} color="#dc2626" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Upload Member Document with Live Preview */}
      <DocumentUploadModal
        open={uploadDocOpen}
        onOpenChange={setUploadDocOpen}
        context="customer"
        customerId={id}
        onSuccess={() => {
          void queryClient.invalidateQueries({ queryKey: ['customer-documents', projectId, id] });
        }}
      />

      {/* Operation / Edit Modal */}
      {action && (
        <OperationDialog
          {...action}
          onClose={() => {
            setAction(null);
            void customerQuery.refetch();
          }}
        />
      )}

      {/* Computerized Property File Modal */}
      {propertyFileBookingId && (
        <PropertyFileModal
          bookingId={propertyFileBookingId}
          onClose={() => setPropertyFileBookingId(null)}
        />
      )}
    </div>
  );
}
