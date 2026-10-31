import { useVerificationLink } from '../../lib/verification-link';
import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  ShieldCheck,
  KeyRound,
  LogOut,
  Printer,
  ExternalLink,
  Building2,
  UserCheck,
  UserX,
  Smartphone,
  CheckCircle2,
  FileText,
  FileUp,
  Download,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../lib/api';
import { operations } from '../../lib/contract';
import { t, useLocale } from '../../lib/i18n';
import { date } from '../../lib/format';
import { errorMessage } from '../../lib/error-messages';
import { can } from '../../stores/auth';
import { Button, Badge, Skeleton, ErrorState } from '../../components/ui';
import { QRCode } from '../../components/QRCode';
import { RecordImage } from '../../components/ImageUpload';
import { OperationDialog } from '../../components/OperationDialog';
import { DocumentUploadModal } from '../../components/DocumentUploadModal';
import { saveFile } from '../../platform/adapter';
import type { Operation, Row } from '../../lib/types';
import './employee-detail.css';

interface UserDetail {
  id: string;
  name: string;
  email: string;
  active: boolean;
  photoId?: string | null;
  createdAt: string;
  updatedAt?: string;
  firstLoginAt?: string | null;
  credentialsIssuedAt?: string | null;
  roles?: Array<{
    role: { id: string; name: string; permissions?: Array<{ permission: string }> };
  }>;
  projects?: Array<{ project: { id: string; name: string; code?: string } }>;
}

interface UserSession {
  id: string;
  device?: string | null;
  platform?: string | null;
  ipAddress?: string | null;
  createdAt: string;
  revokedAt?: string | null;
}

interface UserDocument {
  id: string;
  name: string;
  mime: string;
  size: number;
  projectId: string;
  userId?: string | null;
  createdAt: string;
  project?: {
    id: string;
    name: string;
    code?: string | null;
  } | null;
}

export default function EmployeeDetailPage() {
  useLocale();
  const { id } = useParams<{ id: string }>();
  const verificationUrl = useVerificationLink({ employee: id ?? '' });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Tab State: Overview & Access and Documents (no ledger for internal system users)
  const [activeTab, setActiveTab] = useState<'overview' | 'documents'>('overview');

  // Modals
  const [uploadDocOpen, setUploadDocOpen] = useState(false);

  // Role / Access Dialog
  const [action, setAction] = useState<{
    operation: Operation;
    title: string;
    record?: Row;
  } | null>(null);

  // Queries
  const userQuery = useQuery({
    queryKey: ['employee-detail', id],
    enabled: !!id && can('users.manage'),
    queryFn: ({ signal }) => api<UserDetail>(`/users/${id}`, { signal }),
  });

  const sessionsQuery = useQuery({
    queryKey: ['employee-sessions', id],
    enabled: !!id && can('users.manage') && activeTab === 'overview',
    queryFn: ({ signal }) => api<UserSession[]>(`/users/${id}/sessions`, { signal }),
  });

  const documentsQuery = useQuery({
    queryKey: ['employee-documents', id],
    enabled: !!id && can('users.manage'),
    queryFn: ({ signal }) => api<UserDocument[]>(`/users/${id}/documents`, { signal }),
  });

  // Mutations
  const toggleActiveMutation = useMutation({
    mutationFn: (active: boolean) =>
      api(`/users/${id}`, {
        method: 'PATCH',
        body: { active },
      }),
    onSuccess: (_, active) => {
      toast.success(
        active ? t('System user account activated') : t('System user account deactivated'),
      );
      void queryClient.invalidateQueries({ queryKey: ['employee-detail', id] });
      void queryClient.invalidateQueries({ queryKey: ['resource'] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });


  const deleteDocMutation = useMutation({
    mutationFn: (docId: string) =>
      api(`/users/${id}/documents/${docId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      toast.success(t('Document deleted'));
      void queryClient.invalidateQueries({ queryKey: ['employee-documents', id] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const downloadDocMutation = useMutation({
    mutationFn: (doc: UserDocument) =>
      api<{ url: string }>(`/projects/${doc.projectId}/documents/${doc.id}/download`),
    onSuccess: (res, doc) =>
      void saveFile(res.url, doc.name).catch((e: Error) => toast.error(errorMessage(e))),
    onError: (e) => toast.error(errorMessage(e)),
  });

  const employee = userQuery.data;

  if (userQuery.isLoading) {
    return (
      <div className="employee-detail-page">
        <Skeleton rows={8} />
      </div>
    );
  }

  if (userQuery.isError || !employee) {
    return (
      <div className="employee-detail-page">
        <Button variant="ghost" onClick={() => navigate('/users')}>
          <ArrowLeft size={16} />
          {t('Back to system users')}
        </Button>
        <ErrorState
          error={userQuery.error ?? new Error(t('System user not found'))}
          retry={() => void userQuery.refetch()}
        />
      </div>
    );
  }

  const userCode = `USR-${employee.id.slice(0, 8).toUpperCase()}`;

  const accessOp = operations.find((o) => o.path === '/users/{id}/access' && o.method === 'post');
  const resetPasswordOp = operations.find(
    (o) => o.path === '/users/{id}/reset-password' && o.method === 'post',
  );
  const revokeSessionsOp = operations.find(
    (o) => o.path === '/users/{id}/revoke-sessions' && o.method === 'post',
  );

  const handlePrintBadge = () => {
    if (!verificationUrl) return;
    document.body.classList.add('print-badge-active');
    window.print();
    window.setTimeout(() => {
      document.body.classList.remove('print-badge-active');
    }, 500);
  };

  const docList = documentsQuery.data ?? [];

  return (
    <div className="employee-detail-page">
      {/* Top Navigation */}
      <div className="employee-detail-nav">
        <Button variant="ghost" onClick={() => navigate('/users')}>
          <ArrowLeft size={16} />
          {t('Back to system users')}
        </Button>
      </div>

      {/* Main Header */}
      <header className="employee-detail-header">
        <div className="employee-detail-title-area">
          <div className="employee-detail-avatar-wrap">
            {employee.photoId ? (
              <RecordImage id={employee.photoId} alt={employee.name} />
            ) : (
              <span>{employee.name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="employee-detail-info">
            <h1>{employee.name}</h1>
            <div className="employee-detail-meta">
              <span className="id-card-code">{userCode}</span>
              <span>·</span>
              <span>{employee.email}</span>
              <span>·</span>
              <Badge value={employee.active ? 'ACTIVE' : 'INACTIVE'} />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="employee-detail-actions">
          <Button variant="secondary" onClick={handlePrintBadge}>
            <Printer size={15} />
            {t('Print ID card')}
          </Button>

          {accessOp && (
            <Button
              variant="secondary"
              onClick={() =>
                setAction({
                  operation: accessOp,
                  title: t('Change access'),
                  record: employee as unknown as Row,
                })
              }
            >
              <ShieldCheck size={15} />
              {t('Change access')}
            </Button>
          )}

          {resetPasswordOp && (
            <Button
              variant="secondary"
              onClick={() =>
                setAction({
                  operation: resetPasswordOp,
                  title: t('Send password reset'),
                  record: employee as unknown as Row,
                })
              }
            >
              <KeyRound size={15} />
              {t('Reset password')}
            </Button>
          )}

          {revokeSessionsOp && (
            <Button
              variant="secondary"
              onClick={() =>
                setAction({
                  operation: revokeSessionsOp,
                  title: t('Revoke active sessions'),
                  record: employee as unknown as Row,
                })
              }
            >
              <LogOut size={15} />
              {t('Revoke sessions')}
            </Button>
          )}

          <Button
            variant={employee.active ? 'secondary' : 'primary'}
            busy={toggleActiveMutation.isPending}
            onClick={() => toggleActiveMutation.mutate(!employee.active)}
          >
            {employee.active ? (
              <>
                <UserX size={15} />
                {t('Deactivate account')}
              </>
            ) : (
              <>
                <UserCheck size={15} />
                {t('Activate account')}
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Tabs Navigation */}
      <nav className="employee-detail-tabs" aria-label="System user sections">
        <button
          type="button"
          className={`employee-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <UserCheck size={16} />
          {t('Overview & Access')}
        </button>

        <button
          type="button"
          className={`employee-tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          <FileText size={16} />
          {t('Documents')}
          <span className="employee-tab-count">{docList.length}</span>
        </button>
      </nav>

      {/* TAB 1: Overview & Access */}
      {activeTab === 'overview' && (
        <div className="employee-detail-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Section: Personal & Account Information */}
            <section className="employee-section-card">
              <div className="employee-section-header">
                <h3>{t('System user information')}</h3>
              </div>
              <div className="employee-fields-grid">
                <div className="employee-field">
                  <label>{t('User code')}</label>
                  <strong>{userCode}</strong>
                </div>
                <div className="employee-field">
                  <label>{t('Full name')}</label>
                  <span>{employee.name}</span>
                </div>
                <div className="employee-field">
                  <label>{t('Email address')}</label>
                  <span>{employee.email}</span>
                </div>
                <div className="employee-field">
                  <label>{t('Account type')}</label>
                  <span>{t('Authorized staff')}</span>
                </div>
                <div className="employee-field">
                  <label>{t('Creation time')}</label>
                  <span>{employee.createdAt ? date(employee.createdAt) : '—'}</span>
                </div>
                <div className="employee-field">
                  <label>{t('First login')}</label>
                  <span>
                    {employee.firstLoginAt ? date(employee.firstLoginAt) : t('Never logged in')}
                  </span>
                </div>
              </div>
            </section>

            {/* Section: Roles & Granted Permissions */}
            <section className="employee-section-card">
              <div className="employee-section-header">
                <h3>
                  <ShieldCheck size={18} />
                  {t('Roles & permissions')}
                </h3>
              </div>
              {employee.roles && employee.roles.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="employee-roles-list">
                    {employee.roles.map((r) => (
                      <span key={r.role.id} className="role-badge">
                        <ShieldCheck size={14} />
                        {r.role.name}
                      </span>
                    ))}
                  </div>
                  <div>
                    <h4 style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
                      {t('Granted permissions')}
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {[
                        ...new Set(
                          employee.roles.flatMap(
                            (r) => r.role.permissions?.map((p) => p.permission) ?? [],
                          ),
                        ),
                      ].map((perm) => (
                        <span key={perm} className="permission-pill">
                          {perm}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                  {t('No administrative roles assigned yet.')}
                </p>
              )}
            </section>

            {/* Section: Project Workspace Access */}
            <section className="employee-section-card">
              <div className="employee-section-header">
                <h3>
                  <Building2 size={18} />
                  {t('Project access')}
                </h3>
              </div>
              {employee.projects && employee.projects.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {employee.projects.map((p) => (
                    <div
                      key={p.project.id}
                      style={{
                        background: 'var(--surface-raised, #f8fafc)',
                        border: '1px solid var(--border, #e2e8f0)',
                        padding: '8px 14px',
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <Building2 size={15} color="var(--primary)" />
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{p.project.name}</span>
                      {p.project.code && (
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          ({p.project.code})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                  {t('No specific project restrictions configured.')}
                </p>
              )}
            </section>

            {/* Section: Active Sessions */}
            <section className="employee-section-card">
              <div className="employee-section-header">
                <h3>
                  <Smartphone size={18} />
                  {t('Active sessions')}
                </h3>
              </div>
              {sessionsQuery.data && sessionsQuery.data.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {sessionsQuery.data.map((sess) => (
                    <div
                      key={sess.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 14px',
                        background: 'var(--surface-raised, #f8fafc)',
                        border: '1px solid var(--border, #e2e8f0)',
                        borderRadius: 8,
                        fontSize: 13,
                      }}
                    >
                      <div>
                        <strong>{sess.platform || sess.device || t('Browser session')}</strong>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {sess.ipAddress ? `IP: ${sess.ipAddress} · ` : ''}
                          {t('Started on {0}', { '0': date(sess.createdAt) })}
                        </div>
                      </div>
                      {sess.revokedAt ? (
                        <span style={{ color: 'var(--danger)', fontSize: 12 }}>{t('Revoked')}</span>
                      ) : (
                        <span style={{ color: 'var(--success)', fontSize: 12, fontWeight: 600 }}>
                          ● {t('Active')}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                  {t('No active sessions recorded.')}
                </p>
              )}
            </section>
          </div>

          {/* Right Column: Official System User Pass & QR Code */}
          <div className="employee-id-card-wrapper">
            <div className="employee-id-card" id="printable-employee-badge">
              <div className="id-card-header">
                <span className="org-name">{t('Real Estate Property Management')}</span>
                <span className="card-type">{t('Official System User Pass')}</span>
              </div>

              <div className="id-card-photo">
                {employee.photoId ? (
                  <RecordImage id={employee.photoId} alt={employee.name} />
                ) : (
                  <span>{employee.name.charAt(0).toUpperCase()}</span>
                )}
              </div>

              <h2 className="id-card-name">{employee.name}</h2>
              <div className="id-card-role">
                {employee.roles?.[0]?.role?.name ?? t('Authorized System User')}
              </div>

              <div className="id-card-code">{userCode}</div>

              {/* Generated Standalone Vector QR Code */}
              <div className="id-card-qr-box">
                <QRCode value={verificationUrl} size={150} color="#0f172a" bgColor="#ffffff" />
                <span>{t('Scan to verify')}</span>
              </div>

              <div className="id-card-footer">
                <CheckCircle2 size={14} color="#38bdf8" />
                <span>{t('Authorized System User')}</span>
              </div>
            </div>

            <div className="id-card-actions">
              <Button variant="secondary" onClick={handlePrintBadge}>
                <Printer size={15} />
                {t('Print ID card')}
              </Button>
              <Button asChild variant="primary">
                <Link to={`/verify?employee=${employee.id}`} target="_blank">
                  <ExternalLink size={15} />
                  {t('Verify online')}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Documents */}
      {activeTab === 'documents' && (
        <div className="employee-tab-panel">
          <div className="employee-ledger-card">
            <div className="ledger-header-row">
              <div>
                <h3>{t('User Documents')}</h3>
                <p>{t('Manage contracts, identification, resumes, and personnel records')}</p>
              </div>
              <Button variant="primary" onClick={() => setUploadDocOpen(true)}>
                <FileUp size={15} />
                {t('Upload document')}
              </Button>
            </div>

            {documentsQuery.isLoading ? (
              <Skeleton rows={4} />
            ) : docList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <FileText size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
                <h4 style={{ margin: '0 0 6px', color: 'var(--text)' }}>
                  {t('No documents uploaded for this system user.')}
                </h4>
                <p style={{ margin: '0 0 16px', fontSize: 13 }}>
                  {t('Upload employment contracts, CNIC copies, or qualifications.')}
                </p>
                <Button variant="primary" onClick={() => setUploadDocOpen(true)}>
                  <FileUp size={15} />
                  {t('Upload document')}
                </Button>
              </div>
            ) : (
              <div className="employee-docs-grid">
                {docList.map((doc) => {
                  const isPdf = doc.mime?.includes('pdf') || doc.name.endsWith('.pdf');
                  const isImg = doc.mime?.includes('image') || /\.(png|jpe?g)$/i.test(doc.name);
                  const sizeKb = Math.round(doc.size / 1024);

                  return (
                    <div key={doc.id} className="employee-doc-card">
                      <div className="doc-info-wrap">
                        <div className={`doc-icon-wrap ${isPdf ? 'pdf' : isImg ? 'image' : ''}`}>
                          <FileText size={20} />
                        </div>
                        <div className="doc-texts">
                          <strong title={doc.name}>{doc.name}</strong>
                          <span>
                            {sizeKb} KB · {date(doc.createdAt)}
                          </span>
                          {doc.project?.name && (
                            <span style={{ color: 'var(--primary)', fontWeight: 500 }}>
                              {doc.project.name}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="doc-card-actions">
                        <Button
                          variant="ghost"
                          size="icon"
                          title={t('Download')}
                          busy={downloadDocMutation.isPending}
                          onClick={() => downloadDocMutation.mutate(doc)}
                        >
                          <Download size={15} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title={t('Delete')}
                          disabled={deleteDocMutation.isPending}
                          onClick={() => {
                            if (window.confirm(t('Are you sure you want to delete this document?'))) {
                              deleteDocMutation.mutate(doc.id);
                            }
                          }}
                        >
                          <Trash2 size={15} color="var(--danger)" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Upload User Document with Live Preview */}
      <DocumentUploadModal
        open={uploadDocOpen}
        onOpenChange={setUploadDocOpen}
        context="employee"
        employeeId={id}
        projects={employee?.projects}
        onSuccess={() => {
          void queryClient.invalidateQueries({ queryKey: ['employee-documents', id] });
        }}
      />

      {/* Operation / Access Modal */}
      {action && (
        <OperationDialog
          {...action}
          onClose={() => {
            setAction(null);
            void userQuery.refetch();
            void sessionsQuery.refetch();
          }}
        />
      )}
    </div>
  );
}
