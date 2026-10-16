import { t } from './i18n';
import { row, type Row } from './types';

export const ownershipLabels: Record<string, string> = {
  verification: 'Case document checks',
  authorityName: 'Authority or housing society',
  documentsReference: 'Case file / document references',
  identityVerified: 'Identity checked',
  ownershipVerified: 'Ownership checked',
  documentsVerified: 'Application and supporting documents checked',
  taxesAndFeesVerified: 'Applicable taxes and fees checked',
  consentVerified: 'Consent of owners and buyer checked',
  possessionReleased: 'Property released for possession',
  sitePlanVerified: 'Site plan / demarcation checked',
  clearanceStatus: 'Authority clearance',
  clearanceReference: 'Clearance document reference',
  clearanceValidUntil: 'Clearance expiry date',
  clearanceReason: 'Reason separate clearance is not required',
  handoverReference: 'Signed handover receipt reference',
  receivedByName: 'Owner or authorised recipient name',
};
export const ownershipHelp: Record<string, [string, string]> = {
  authorityName: [
    'e.g. DHA Lahore, CDA or your housing society',
    'Enter the authority or society responsible for this property.',
  ],
  documentsReference: [
    'Enter file numbers or references from Documents',
    'Keep the supporting documents in the case file. Include additional documents for an attorney, company, inheritance or gift, where applicable.',
  ],
  identityVerified: [
    '',
    'Check the relevant CNIC / NICOP or other accepted identity documents of the parties or authorised representative.',
  ],
  ownershipVerified: [
    '',
    'Check original allotment / transfer / title documents, current owners and any lender or ownership restrictions.',
  ],
  documentsVerified: [
    '',
    'Check signed applications and the photos, witnesses, affidavits or authority documents required for this case.',
  ],
  taxesAndFeesVerified: [
    '',
    'Verify applicable tax and authority fee receipts, or documented exemptions. The system checks booking dues separately.',
  ],
  consentVerified: [
    '',
    'Verify consent and signatures of all current owners and the buyer, or valid legal authority to act for them.',
  ],
  possessionReleased: [
    '',
    'Confirm this phase, sector and property is released for possession by the authority or developer.',
  ],
  sitePlanVerified: [
    '',
    'Verify the applicable site plan, demarcation and property identification. Record building or utility clearances where required.',
  ],
  clearanceStatus: [
    'Choose clearance status',
    'Use a verified NDC, NOC or dues-clearance document where the authority requires one. Otherwise record the reason.',
  ],
  clearanceReference: [
    'Enter the NDC, NOC or clearance reference',
    'Use the authority document or an existing clearance certificate reference.',
  ],
  clearanceValidUntil: [
    '',
    'Enter the expiry shown on the document, if it has one. Expired clearance cannot be used to complete the case.',
  ],
  clearanceReason: [
    'Explain the authority requirement',
    'Record the rule or authority confirmation that a separate clearance document is not required.',
  ],
  handoverReference: [
    'Enter the signed receipt or case file reference',
    'Keep the signed possession / handover acknowledgement with the case documents.',
  ],
  receivedByName: [
    'Enter the recipient’s full name',
    'The current owner or their verified authorised representative receiving possession.',
  ],
};

export function verificationErrors(value: unknown, fields: string[]): [string, string][] {
  const checks = row(value),
    errors: [string, string][] = [];
  for (const field of fields)
    if (/Verified$|Released$/.test(field) && checks[field] !== true)
      errors.push([field, t('Complete this check before continuing.')]);
  if (checks.clearanceStatus === 'VERIFIED') {
    if (!String(checks.clearanceReference ?? '').trim())
      errors.push(['clearanceReference', t('Enter the clearance document reference.')]);
    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Karachi',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
    if (checks.clearanceValidUntil && String(checks.clearanceValidUntil) < today)
      errors.push([
        'clearanceValidUntil',
        t('The clearance has expired. Verify a current document.'),
      ]);
  } else if (
    checks.clearanceStatus === 'NOT_REQUIRED' &&
    String(checks.clearanceReason ?? '').trim().length < 3
  )
    errors.push([
      'clearanceReason',
      t('Explain why separate authority clearance is not required.'),
    ]);
  return errors;
}

export function visibleVerificationEntries(value: Row) {
  return Object.entries(value).filter(
    ([key, val]) =>
      ownershipLabels[key] &&
      val != null &&
      val !== '' &&
      (!(key === 'clearanceReference' || key === 'clearanceValidUntil') ||
        value.clearanceStatus === 'VERIFIED') &&
      (key !== 'clearanceReason' || value.clearanceStatus === 'NOT_REQUIRED'),
  );
}
