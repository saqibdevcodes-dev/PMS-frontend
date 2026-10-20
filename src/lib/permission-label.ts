import { t } from './i18n';

export function permissionLabel(permission: string) {
  if (permission === 'customers.portal.manage') return t('Manage member portal access');
  const direct: Record<string, string> = {
    'bookings.approve': 'Confirm bookings',
    'discounts.approve': 'Apply discounts',
    'transfers.approve': 'Complete transfers',
    'refunds.approve': 'Pay refunds',
    'ndc.approve': 'Issue clearance certificates',
    'possession.approve': 'Complete handovers',
    'users.manage': 'Manage system users',
  };
  if (direct[permission]) return t(direct[permission]);
  const [scope, action] = permission.split('.');
  return `${t(scope ?? permission)} — ${t((action ?? '').replaceAll('_', ' '))}`;
}
