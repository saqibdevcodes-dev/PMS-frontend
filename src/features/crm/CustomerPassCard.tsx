import { ShieldCheck } from 'lucide-react';
import { QRCode } from '../../components/QRCode';
import { RecordImage } from '../../components/ImageUpload';
import { SignatureFooter } from '../../components/SignatureFooter';
import { t, useLocale } from '../../lib/i18n';

export type PassCustomer = {
  id: string;
  reference?: string | null;
  name: string;
  photoId?: string | null;
  project?: {
    name: string;
    company?: { name: string; logoId?: string | null } | null;
  } | null;
  owners?: Array<{
    current?: boolean;
    validTo?: string | null;
    booking?: { status?: string } | null;
  }>;
  bookings?: Array<{ status?: string }>;
};

export function customerPassIdentity(customer: PassCustomer) {
  const ownsProperty =
    customer.owners?.some(
      (owner) =>
        owner.current !== false && owner.validTo == null && owner.booking?.status === 'CONFIRMED',
    ) ??
    customer.bookings?.some((booking) => booking.status === 'CONFIRMED') ??
    false;
  return {
    code: customer.reference || `MEM-${customer.id.slice(0, 8).toUpperCase()}`,
    companyName: customer.project?.company?.name || customer.project?.name || '',
    projectName: customer.project?.name || '',
    logoId: customer.project?.company?.logoId || undefined,
    ownsProperty,
  };
}

export function CustomerPassCard({
  customer,
  verificationUrl,
  qrSize = 150,
}: {
  customer: PassCustomer;
  verificationUrl: string;
  qrSize?: number;
}) {
  useLocale();
  const identity = customerPassIdentity(customer);
  return (
    <div className="customer-id-card" id="printable-customer-badge">
      <div className="id-card-header">
        {identity.logoId && (
          <RecordImage id={identity.logoId} alt="" className="pass-company-logo" />
        )}
        {identity.companyName && <span className="org-name">{identity.companyName}</span>}
        <span className="card-type">
          {t(
            identity.ownsProperty
              ? 'Official Customer Allotment Pass'
              : 'Customer Registration Pass',
          )}
        </span>
        {identity.projectName && (
          <span className="card-project">
            {t('Project')}: {identity.projectName}
          </span>
        )}
      </div>

      <div className="id-card-photo">
        {customer.photoId ? (
          <RecordImage id={customer.photoId} alt={customer.name} />
        ) : (
          <span>{customer.name.charAt(0).toUpperCase()}</span>
        )}
      </div>
      <h2 className="id-card-name">{customer.name}</h2>
      <div className="id-card-role">
        {t(identity.ownsProperty ? 'Authorized Property Owner' : 'Registered customer')}
      </div>
      <div className="id-card-code">{identity.code}</div>
      <div className="id-card-qr-box">
        {verificationUrl ? (
          <QRCode value={verificationUrl} size={qrSize} color="#064e3b" bgColor="#ffffff" />
        ) : (
          <span>{t('Verification link unavailable')}</span>
        )}
        {verificationUrl && <span>{t('Scan to verify registration')}</span>}
      </div>
      <div className="id-card-footer">
        <ShieldCheck size={14} />
        <span>
          {t(identity.ownsProperty ? 'Verified property owner' : 'Customer registration')}
        </span>
      </div>
      <SignatureFooter printOnly labels={['Customer signature', 'Authorized Project Officer']} />
    </div>
  );
}
