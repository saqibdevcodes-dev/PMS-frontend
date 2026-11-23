import { t } from '../lib/i18n';

export function SignatureFooter({
  labels = ['Prepared by', 'Verified / Checked by', 'Authorized Approval'],
  printOnly = false,
}: {
  labels?: string[];
  printOnly?: boolean;
}) {
  return (
    <div
      className={'print-signatures' + (printOnly ? ' print-only-signatures' : '')}
      aria-label={t('Signatures')}
    >
      {labels.map((label) => (
        <div className="print-signature" key={label}>
          <span>{t(label)}</span>
        </div>
      ))}
    </div>
  );
}
