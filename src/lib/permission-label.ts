import { t } from './i18n';

export function permissionLabel(permission: string) {
  if (permission === 'customers.portal.manage') return t('Manage customer portal access');
  const [scope, action] = permission.split('.');
  return `${t(scope ?? permission)} — ${t((action ?? '').replaceAll('_', ' '))}`;
}
