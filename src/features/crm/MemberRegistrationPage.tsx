import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  UserPlus,
  CheckCircle2,
  ShieldCheck,
  QrCode,
  UserCheck,
  Camera,
  AlertCircle,
  Loader2,
  Mail,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../lib/api';
import { t, useLocale } from '../../lib/i18n';
import { errorMessage } from '../../lib/error-messages';
import { usePreferences } from '../../stores/preferences';
import { Button } from '../../components/ui';
import { ImageUpload } from '../../components/ImageUpload';
import './customer-detail.css';
import './member-registration.css';

interface CreatedMember {
  id: string;
  name: string;
  reference?: string;
  phone?: string;
  email?: string;
  identityLast4?: string;
}

interface EmailCheckResult {
  available: boolean;
  exists: boolean;
  reason?: string;
  existingMember?: {
    name: string;
    reference?: string;
    sameProject?: boolean;
  } | null;
}

export default function MemberRegistrationPage() {
  useLocale();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const projectId = usePreferences((s) => s.projectId);

  const [name, setName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [phone, setPhone] = useState('');
  const [secondaryPhone, setSecondaryPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [photoId, setPhotoId] = useState('');
  const [identityType, setIdentityType] = useState<'CNIC' | 'PASSPORT'>('CNIC');
  const [identity, setIdentity] = useState('');
  const [communicationConsent, setCommunicationConsent] = useState(true);
  const [createdMember, setCreatedMember] = useState<CreatedMember | null>(null);

  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailCheckResult, setEmailCheckResult] = useState<EmailCheckResult | null>(null);

  // Debounced email availability check
  useEffect(() => {
    const cleanEmail = email.trim().toLowerCase();

    if (
      !cleanEmail ||
      !cleanEmail.includes('@') ||
      !cleanEmail.includes('.') ||
      cleanEmail.length < 5
    ) {
      setIsCheckingEmail(false);
      setEmailCheckResult(null);
      return;
    }

    // Reset result while typing so stale status clears
    setEmailCheckResult((prev) => (prev ? null : prev));

    let isCancelled = false;
    const timer = setTimeout(async () => {
      if (!projectId) return;
      setIsCheckingEmail(true);
      try {
        const res = await api<EmailCheckResult>(
          `/projects/${projectId}/customers/check-email?email=${encodeURIComponent(cleanEmail)}`,
        );
        if (!isCancelled) {
          setEmailCheckResult(res);
        }
      } catch {
        // Silently catch network check errors during typing
      } finally {
        if (!isCancelled) {
          setIsCheckingEmail(false);
        }
      }
    }, 400);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [email, projectId]);

  /** Auto-format a raw digit string into CNIC pattern XXXXX-XXXXXXX-X */
  function formatCnic(raw: string): string {
    const digits = raw.replace(/\D/g, '').slice(0, 13);
    if (digits.length <= 5) return digits;
    if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
  }

  /** Auto-format a phone string into pattern 03XX-XXXXXXX or +92-XXX-XXXXXXX */
  function formatPhone(raw: string): string {
    const hasPlus = raw.trim().startsWith('+');
    const digits = raw.replace(/\D/g, '');

    if (hasPlus || digits.startsWith('92')) {
      const national = digits.startsWith('92') ? digits.slice(2) : digits;
      const clean = national.slice(0, 10);
      if (clean.length === 0) return '+92-';
      if (clean.length <= 3) return `+92-${clean}`;
      return `+92-${clean.slice(0, 3)}-${clean.slice(3, 10)}`;
    }

    const clean = digits.slice(0, 11);
    if (clean.length <= 4) return clean;
    return `${clean.slice(0, 4)}-${clean.slice(4, 11)}`;
  }

  const registerMutation = useMutation({
    mutationFn: async () => {
      if (!projectId) throw new Error(t('Choose a project first.'));
      if (!name.trim()) throw new Error(t('Member full name is required.'));
      if (!phone.trim()) throw new Error(t('Mobile phone number is required.'));

      const cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length < 10) {
        throw new Error(t('Enter a valid mobile phone number, for example 0300-1234567.'));
      }
      if (secondaryPhone.trim()) {
        const cleanSecPhone = secondaryPhone.replace(/\D/g, '');
        if (cleanSecPhone.length < 10) {
          throw new Error(t('Enter a valid secondary phone number, for example 0300-7654321.'));
        }
      }

      if (!email.trim()) throw new Error(t('Email address is required for member registration.'));
      if (emailCheckResult?.exists) {
        throw new Error(
          emailCheckResult.existingMember?.name
            ? t(
                `This email is already registered to ${emailCheckResult.existingMember.name}${
                  emailCheckResult.existingMember.reference
                    ? ` (${emailCheckResult.existingMember.reference})`
                    : ''
                }. Please use another email.`,
              )
            : t('This email address is already registered. Please use another email.'),
        );
      }

      // If not yet verified by debounce (e.g. quick form submission), verify now
      const cleanEmail = email.trim().toLowerCase();
      if (!emailCheckResult) {
        try {
          const quickCheck = await api<EmailCheckResult>(
            `/projects/${projectId}/customers/check-email?email=${encodeURIComponent(cleanEmail)}`,
          );
          if (quickCheck.exists) {
            setEmailCheckResult(quickCheck);
            throw new Error(
              quickCheck.existingMember?.name
                ? t(
                    `This email is already registered to ${quickCheck.existingMember.name}${
                      quickCheck.existingMember.reference
                        ? ` (${quickCheck.existingMember.reference})`
                        : ''
                    }. Please use another email.`,
                  )
                : t('This email address is already registered. Please use another email.'),
            );
          }
        } catch (e: unknown) {
          if (e instanceof Error && e.message.includes('already registered')) throw e;
        }
      }

      if (!identity.trim()) throw new Error(t('National ID or passport number is required.'));

      const cleanIdentity = identity.replace(/[ -]/g, '');
      if (identityType === 'CNIC' && !/^\d{13}$/.test(cleanIdentity)) {
        throw new Error(t('Enter a 13-digit CNIC, for example 35202-1234567-1.'));
      }
      if (identityType === 'PASSPORT' && !/^[A-Za-z0-9]{6,20}$/.test(cleanIdentity)) {
        throw new Error(t('Enter a passport number with 6–20 letters or digits.'));
      }

      return api<CreatedMember>(`/projects/${projectId}/customers`, {
        method: 'POST',
        body: {
          name: name.trim(),
          fatherName: fatherName.trim() || null,
          phone: phone.trim(),
          secondaryPhone: secondaryPhone.trim() || null,
          email: cleanEmail,
          address: address.trim() || null,
          photoId: photoId || null,
          identityType,
          identity: identity.trim(),
          communicationConsent,
        },
      });
    },
    onSuccess: (data) => {
      setCreatedMember(data);
      toast.success(t('Customer registered successfully'));
      void queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (err) => {
      toast.error(errorMessage(err));
    },
  });

  const handleReset = () => {
    setName('');
    setFatherName('');
    setPhone('');
    setSecondaryPhone('');
    setEmail('');
    setAddress('');
    setPhotoId('');
    setIdentityType('CNIC');
    setIdentity('');
    setCommunicationConsent(true);
    setCreatedMember(null);
    setEmailCheckResult(null);
    setIsCheckingEmail(false);
  };

  const memberCode = createdMember
    ? createdMember.id.toUpperCase().startsWith('MEM-')
      ? createdMember.id
      : `MEM-${createdMember.id.slice(0, 8).toUpperCase()}`
    : '';

  /* ── Success screen ─────────────────────────────────────────── */
  if (createdMember) {
    return (
      <div className="mreg-page">
        <div className="mreg-success">
          <div className="mreg-success-icon">
            <CheckCircle2 size={48} />
          </div>
          <div className="mreg-success-label">{t('Official Registration Completed')}</div>
          <h2 className="mreg-success-title">{t('Customer Registered Successfully')}</h2>
          <p className="mreg-success-desc">
            {t(
              'The customer profile has been registered with official computerized allotment records. Portal credentials have been queued for email delivery.',
            )}
          </p>

          <div className="mreg-success-badge">
            <div>
              <div className="mreg-badge-label">{t('Customer code')}</div>
              <strong className="mreg-badge-value mreg-badge-value--primary">{memberCode}</strong>
            </div>
            <div className="mreg-badge-divider" />
            <div>
              <div className="mreg-badge-label">{t('Full name')}</div>
              <strong className="mreg-badge-value">{createdMember.name}</strong>
            </div>
            {createdMember.phone && (
              <>
                <div className="mreg-badge-divider" />
                <div>
                  <div className="mreg-badge-label">{t('Mobile phone')}</div>
                  <span className="mreg-badge-value">{createdMember.phone}</span>
                </div>
              </>
            )}
          </div>

          <div className="mreg-success-actions">
            <Button asChild variant="primary">
              <Link to={`/customers/${createdMember.id}`}>
                <UserCheck size={16} />
                {t('View customer profile')}
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to={`/members/qr?customerId=${createdMember.id}`}>
                <QrCode size={16} />
                {t('View QR pass')}
              </Link>
            </Button>
            <Button variant="ghost" onClick={handleReset}>
              {t('Register another customer')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Registration form ──────────────────────────────────────── */
  return (
    <div className="mreg-page">
      {/* Top bar */}
      <div className="mreg-topbar">
        <Button variant="ghost" onClick={() => navigate('/customers')}>
          <ArrowLeft size={16} />
          {t('Back to customers')}
        </Button>
        <div className="mreg-topbar-title">
          <ShieldCheck size={16} />
          <span>{t('Customer Registration')}</span>
        </div>
      </div>

      {/* Main card */}
      <form
        className="mreg-card"
        onSubmit={(e) => {
          e.preventDefault();
          registerMutation.mutate();
        }}
      >
        {/* ── Left: Photo ── */}
        <div className="mreg-photo-col">
          <div className="mreg-photo-header">
            <Camera size={15} />
            <span>{t('Customer Photo')}</span>
          </div>
          <ImageUpload purpose="CUSTOMER" value={photoId} onChange={setPhotoId} label="" />
          <p className="mreg-photo-hint">
            {t('Upload a clear passport-style photo. JPEG, PNG or WebP, max 5 MiB.')}
          </p>
        </div>

        {/* ── Right: Fields ── */}
        <div className="mreg-fields-col">
          {/* Section A – Personal */}
          <div className="mreg-section-label">
            <span>{t('Personal & Identity')}</span>
          </div>
          <div className="mreg-grid mreg-grid--4">
            <div className="mreg-field mreg-field--span2">
              <label>
                {t('Full name')} <em>*</em>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ahmed Ali"
                aria-label={t('Full name')}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="mreg-field mreg-field--span2">
              <label>{t('Father / Guardian')}</label>
              <input
                type="text"
                placeholder="e.g. Muhammad Ali"
                aria-label={t('Father / Guardian')}
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
              />
            </div>

            <div className="mreg-field mreg-field--span2">
              <label>
                {t('ID type')} <em>*</em>
              </label>
              <select
                aria-label={t('ID type')}
                value={identityType}
                onChange={(e) => {
                  setIdentityType(e.target.value as 'CNIC' | 'PASSPORT');
                  setIdentity('');
                }}
              >
                <option value="CNIC">{t('National ID (CNIC)')}</option>
                <option value="PASSPORT">{t('Passport')}</option>
              </select>
            </div>
            <div className="mreg-field mreg-field--span2">
              <label>
                {identityType === 'CNIC' ? t('CNIC Number') : t('Passport Number')} <em>*</em>
              </label>
              <input
                type="text"
                required
                inputMode={identityType === 'CNIC' ? 'numeric' : 'text'}
                placeholder={identityType === 'CNIC' ? '35202-1234567-1' : 'e.g. A1234567'}
                aria-label={t('National ID or passport number')}
                value={identity}
                maxLength={identityType === 'CNIC' ? 15 : 20}
                onChange={(e) => {
                  if (identityType === 'CNIC') {
                    setIdentity(formatCnic(e.target.value));
                  } else {
                    setIdentity(e.target.value);
                  }
                }}
                style={{
                  fontFamily: identityType === 'CNIC' ? 'monospace' : undefined,
                  letterSpacing: identityType === 'CNIC' ? '0.06em' : undefined,
                }}
              />
              <small>
                {identityType === 'CNIC'
                  ? t('Auto-formatted as XXXXX-XXXXXXX-X')
                  : t('6–20 alphanumeric characters')}
              </small>
            </div>
          </div>

          {/* Section B – Contact */}
          <div className="mreg-section-label">
            <span>{t('Contact Information')}</span>
          </div>
          <div className="mreg-grid mreg-grid--4">
            <div className="mreg-field mreg-field--span2">
              <label>
                {t('Mobile phone')} <em>*</em>
              </label>
              <input
                type="text"
                required
                inputMode="tel"
                maxLength={15}
                placeholder="0300-1234567"
                aria-label={t('Mobile phone')}
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                style={{ fontFamily: 'monospace', letterSpacing: '0.04em' }}
              />
              <small>{t('Auto-formatted as 03XX-XXXXXXX')}</small>
            </div>
            <div className="mreg-field mreg-field--span2">
              <label>{t('Secondary phone')}</label>
              <input
                type="text"
                inputMode="tel"
                maxLength={15}
                placeholder="0300-7654321"
                aria-label={t('Secondary phone')}
                value={secondaryPhone}
                onChange={(e) => setSecondaryPhone(formatPhone(e.target.value))}
                style={{ fontFamily: 'monospace', letterSpacing: '0.04em' }}
              />
              <small>{t('Optional alternative contact')}</small>
            </div>
            <div className="mreg-field mreg-field--span4">
              <div className="mreg-field-header">
                <label>
                  {t('Email address')} <em>*</em>
                </label>
                {isCheckingEmail && (
                  <span className="mreg-email-badge mreg-email-badge--checking">
                    <Loader2 size={11} className="mreg-spin" />
                    <span>{t('Checking...')}</span>
                  </span>
                )}
                {!isCheckingEmail && emailCheckResult?.available && (
                  <span className="mreg-email-badge mreg-email-badge--available">
                    <CheckCircle2 size={11} />
                    <span>{t('Available')}</span>
                  </span>
                )}
                {!isCheckingEmail && emailCheckResult?.exists && (
                  <span className="mreg-email-badge mreg-email-badge--taken">
                    <AlertCircle size={11} />
                    <span>{t('Already Registered')}</span>
                  </span>
                )}
              </div>
              <div className="mreg-input-wrap">
                <input
                  type="email"
                  required
                  placeholder="e.g. member@example.com"
                  aria-label={t('Email address')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={
                    emailCheckResult?.exists
                      ? 'mreg-input--invalid'
                      : emailCheckResult?.available
                        ? 'mreg-input--valid'
                        : ''
                  }
                />
                <div className="mreg-input-icon">
                  {isCheckingEmail ? (
                    <Loader2 size={15} className="mreg-spin" style={{ color: 'var(--muted)' }} />
                  ) : emailCheckResult?.available ? (
                    <CheckCircle2 size={15} style={{ color: 'var(--success)' }} />
                  ) : emailCheckResult?.exists ? (
                    <AlertCircle size={15} style={{ color: 'var(--danger)' }} />
                  ) : (
                    <Mail size={15} style={{ color: 'var(--muted)' }} />
                  )}
                </div>
              </div>
              {emailCheckResult?.exists ? (
                <div className="mreg-email-feedback mreg-email-feedback--taken">
                  <AlertCircle size={13} style={{ flexShrink: 0 }} />
                  <span>
                    {emailCheckResult.existingMember?.name
                      ? t(
                          `This email is already registered to ${emailCheckResult.existingMember.name}${
                            emailCheckResult.existingMember.reference
                              ? ` (${emailCheckResult.existingMember.reference})`
                              : ''
                          }. Please use another email.`,
                        )
                      : t('This email address is already registered. Please use another email.')}
                  </span>
                </div>
              ) : emailCheckResult?.available ? (
                <div className="mreg-email-feedback mreg-email-feedback--available">
                  <CheckCircle2 size={13} style={{ flexShrink: 0 }} />
                  <span>{t('Email is available for registration')}</span>
                </div>
              ) : (
                <small>{t('Used for portal login and allotment pass delivery')}</small>
              )}
            </div>
            <div className="mreg-field mreg-field--span4">
              <label>{t('Residential address')}</label>
              <input
                type="text"
                placeholder="e.g. House 12, Street 4, Sector G-10, Islamabad"
                aria-label={t('Residential address')}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          {/* Section C – Agreement + Submit */}
          <div className="mreg-footer">
            <div className="mreg-consent-row">
              <div className="mreg-portal-notice">
                <ShieldCheck size={15} style={{ flexShrink: 0, color: 'var(--primary)' }} />
                <span>
                  {t(
                    'A secure portal password will be auto-generated and emailed upon registration.',
                  )}
                </span>
              </div>
              <label className="mreg-consent-label">
                <input
                  type="checkbox"
                  checked={communicationConsent}
                  onChange={(e) => setCommunicationConsent(e.target.checked)}
                />
                <span>{t('Customer agrees to receive messages')}</span>
              </label>
            </div>

            <div className="mreg-actions">
              <Button variant="secondary" type="button" onClick={() => navigate('/customers')}>
                {t('Cancel')}
              </Button>
              <Button
                variant="primary"
                type="submit"
                busy={registerMutation.isPending}
                disabled={emailCheckResult?.exists}
              >
                <UserPlus size={16} />
                {t('Register customer')}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
