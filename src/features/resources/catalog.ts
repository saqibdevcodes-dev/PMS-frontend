import {
  LayoutDashboard,
  Building2,
  Grid2X2,
  Users,
  ContactRound,
  CalendarClock,
  BookOpen,
  CreditCard,
  ReceiptText,
  HandCoins,
  UserRoundCheck,
  ShieldCheck,
  ArrowLeftRight,
  Undo2,
  KeyRound,
  Landmark,
  Files,
  ChartNoAxesCombined,
  Settings2,
  CircleUserRound,
  ListTodo,
  Bell,
  BriefcaseBusiness,
  BadgePercent,
  LockKeyhole,
  SlidersHorizontal,
  type LucideIcon,
} from 'lucide-react';
import type { Operation, Row } from '../../lib/types';
import { operations, projectRoot } from '../../lib/contract';
import { can, useAuth } from '../../stores/auth';
export type Resource = {
  slug: string;
  label: string;
  singular: string;
  api: string;
  icon: LucideIcon;
  group: string;
  description: string;
  columns: string[];
  global?: boolean;
  permission: string;
  report?: string;
  views?: boolean;
};
export const resources: Resource[] = [
  {
    slug: 'projects',
    label: 'Projects',
    singular: 'project',
    api: 'projects',
    icon: Building2,
    group: 'Workspace',
    global: true,
    permission: 'projects.read',
    description: 'Create and manage your property developments.',
    columns: ['name', 'photoId', 'code', 'currency', 'timezone', 'createdAt'],
  },
  {
    slug: 'inventory',
    label: 'Properties',
    singular: 'property',
    api: 'units',
    icon: Grid2X2,
    group: 'Sales & customers',
    permission: 'inventory.read',
    description: 'View property availability, area, price and photos.',
    columns: ['number', 'photoId', 'type', 'phase', 'block', 'size', 'price', 'status'],
    views: true,
  },
  {
    slug: 'crm',
    label: 'Leads & pipeline',
    singular: 'lead',
    api: 'leads',
    icon: ContactRound,
    group: 'Sales & customers',
    permission: 'crm.read',
    description: 'Record enquiries and plan the next follow-up.',
    columns: ['name', 'phone', 'source', 'status', 'createdAt'],
    views: true,
  },
  {
    slug: 'customers',
    label: 'Customers',
    singular: 'customer',
    api: 'customers',
    icon: Users,
    group: 'Sales & customers',
    permission: 'customers.read',
    description: 'Manage customer photos, contact details and portal access.',
    columns: ['name', 'photoId', 'reference', 'phone', 'email', 'identityLast4', 'createdAt'],
  },
  {
    slug: 'reservations',
    label: 'Reservations',
    singular: 'reservation',
    api: 'reservations',
    icon: CalendarClock,
    group: 'Sales & customers',
    permission: 'bookings.read',
    description: 'Hold a property for a customer until the expiry time.',
    columns: ['id', 'unitId', 'customerId', 'expiresAt', 'status'],
  },
  {
    slug: 'bookings',
    label: 'Bookings',
    singular: 'booking',
    api: 'bookings',
    icon: BookOpen,
    group: 'Sales & customers',
    permission: 'bookings.read',
    description: 'Create bookings and track their approval and payment status.',
    columns: ['reference', 'customerId', 'unitId', 'total', 'downPayment', 'status', 'createdAt'],
  },
  {
    slug: 'payment-plans',
    label: 'Payment plans',
    singular: 'payment plan',
    api: 'payment-plans',
    icon: SlidersHorizontal,
    group: 'Sales & customers',
    permission: 'bookings.read',
    description: 'Set installment amounts and dates for new bookings.',
    columns: ['name', 'createdAt'],
  },
  {
    slug: 'installments',
    label: 'Installments',
    singular: 'installment',
    api: 'installments',
    icon: ReceiptText,
    group: 'Payments & follow-ups',
    permission: 'reports.read',
    report: 'installments',
    description: 'View installment dates, amounts paid and balances due.',
    columns: ['reference', 'dueDate', 'amount', 'paid', 'outstanding', 'lateDays'],
  },
  {
    slug: 'collections',
    label: 'Payments received',
    singular: 'payment',
    api: 'payments',
    icon: CreditCard,
    group: 'Payments & follow-ups',
    permission: 'payments.read',
    description: 'Record received payments, attach proof and verify receipts.',
    columns: ['id', 'bookingId', 'amount', 'method', 'paidAt', 'status'],
  },
  {
    slug: 'recovery',
    label: 'Overdue payments',
    singular: 'recovery case',
    api: 'recovery-cases',
    icon: HandCoins,
    group: 'Payments & follow-ups',
    permission: 'recovery.manage',
    description: 'Follow up overdue customer payments.',
    columns: ['id', 'bookingId', 'assignedTo', 'status', 'createdAt'],
  },
  {
    slug: 'dealers',
    label: 'Dealers',
    singular: 'dealer',
    api: 'dealers',
    icon: BriefcaseBusiness,
    group: 'Payments & follow-ups',
    permission: 'dealers.read',
    description: 'Manage dealer contacts, photos, assigned properties and commissions.',
    columns: ['name', 'photoId', 'phone', 'commissionPercent', 'createdAt'],
  },
  {
    slug: 'commissions',
    label: 'Commissions',
    singular: 'commission',
    api: 'commissions',
    icon: BadgePercent,
    group: 'Payments & follow-ups',
    permission: 'reports.read',
    report: 'dealers',
    description: 'Review dealer commissions and payments.',
    columns: ['dealerName', 'bookingId', 'amount', 'status', 'paidAt'],
  },
  {
    slug: 'ndcs',
    label: 'Clearance certificates',
    singular: 'clearance request',
    api: 'ndcs',
    icon: UserRoundCheck,
    group: 'Approvals & ownership',
    permission: 'bookings.read',
    description: 'Check identity, documents and unpaid amounts before issuing clearance.',
    columns: ['reference', 'bookingId', 'status', 'issuedAt', 'expiresAt'],
  },
  {
    slug: 'transfers',
    label: 'Transfers',
    singular: 'transfer',
    api: 'transfers',
    icon: ArrowLeftRight,
    group: 'Approvals & ownership',
    permission: 'bookings.read',
    description: 'Change property ownership and keep its history.',
    columns: ['reference', 'bookingId', 'buyerId', 'charges', 'status', 'completedAt'],
  },
  {
    slug: 'cancellations',
    label: 'Cancellations',
    singular: 'cancellation',
    api: 'cancellations',
    icon: Undo2,
    group: 'Approvals & ownership',
    permission: 'bookings.read',
    description: 'Review booking cancellations, deductions and refunds.',
    columns: ['id', 'bookingId', 'deduction', 'refundable', 'status'],
  },
  {
    slug: 'refunds',
    label: 'Refunds',
    singular: 'refund',
    api: 'refunds',
    icon: HandCoins,
    group: 'Approvals & ownership',
    permission: 'reports.read',
    report: 'refunds',
    description: 'Track approved refunds and their payments.',
    columns: ['id', 'cancellationId', 'amount', 'status', 'paidAt'],
  },
  {
    slug: 'possessions',
    label: 'Possession',
    singular: 'possession request',
    api: 'possessions',
    icon: KeyRound,
    group: 'Approvals & ownership',
    permission: 'bookings.read',
    description: 'Record inspections, resolve issues and hand over properties.',
    columns: ['id', 'bookingId', 'status', 'inspectionAt', 'handoverAt'],
  },
  {
    slug: 'approvals',
    label: 'Approvals',
    singular: 'approval',
    api: 'approvals',
    icon: ShieldCheck,
    group: 'Approvals & ownership',
    permission: 'approvals.read',
    description: 'Review requests that need your approval.',
    columns: ['operation', 'amount', 'status', 'level', 'createdAt'],
  },
  {
    slug: 'accounts',
    label: 'Account categories',
    singular: 'account',
    api: 'accounts',
    icon: Landmark,
    group: 'Accounts & administration',
    permission: 'finance.read',
    description: 'Organize accounts used to record money received and spent.',
    columns: ['code', 'name', 'type', 'active'],
  },
  {
    slug: 'journals',
    label: 'Accounting entries',
    singular: 'journal',
    api: 'journals',
    icon: BookOpen,
    group: 'Accounts & administration',
    permission: 'finance.read',
    description: 'View and create balanced accounting entries.',
    columns: ['reference', 'description', 'source', 'postedAt'],
  },
  {
    slug: 'bank-accounts',
    label: 'Bank accounts',
    singular: 'bank account',
    api: 'bank-accounts',
    icon: Landmark,
    group: 'Accounts & administration',
    permission: 'finance.read',
    description: 'Manage bank accounts and match bank transactions.',
    columns: ['name', 'iban', 'accountId'],
  },
  {
    slug: 'vendors',
    label: 'Vendors',
    singular: 'vendor',
    api: 'vendors',
    icon: BriefcaseBusiness,
    group: 'Accounts & administration',
    permission: 'finance.read',
    description: 'Manage suppliers and their contact details.',
    columns: ['name', 'phone'],
  },
  {
    slug: 'accounting-periods',
    label: 'Accounting periods',
    singular: 'accounting period',
    api: 'accounting-periods',
    icon: LockKeyhole,
    group: 'Accounts & administration',
    permission: 'finance.read',
    description: 'Choose dates when accounting entries can be added.',
    columns: ['startDate', 'endDate', 'locked'],
  },
  {
    slug: 'document-templates',
    label: 'Document templates',
    singular: 'template',
    api: 'document-templates',
    icon: Files,
    group: 'Accounts & administration',
    permission: 'documents.read',
    description: 'Create reusable templates for property documents.',
    columns: ['name', 'version'],
  },
  {
    slug: 'users',
    label: 'Team members',
    singular: 'team member',
    api: 'users',
    icon: Users,
    group: 'Administration',
    global: true,
    permission: 'users.manage',
    description: 'Manage team photos, roles and access.',
    columns: ['name', 'photoId', 'email', 'active', 'roles'],
  },
  {
    slug: 'roles',
    label: 'Roles & permissions',
    singular: 'role',
    api: 'roles',
    icon: ShieldCheck,
    group: 'Administration',
    global: true,
    permission: 'roles.manage',
    description: 'Choose what each team member can view and change.',
    columns: ['name', 'permissions'],
  },
  {
    slug: 'audit',
    label: 'Audit trail',
    singular: 'audit record',
    api: 'audit',
    icon: ListTodo,
    group: 'Administration',
    permission: 'audit.read',
    description: 'See who changed each record and when.',
    columns: ['action', 'actorId', 'entityId', 'createdAt'],
  },
];
export const specialNav = [
  {
    slug: 'dashboard',
    label: 'Overview',
    icon: LayoutDashboard,
    group: 'Workspace',
    permission: 'reports.read',
  },
  { slug: 'my-work', label: 'My work', icon: ListTodo, group: 'Workspace', permission: '' },
  {
    slug: 'finance',
    label: 'Accounts & money',
    icon: Landmark,
    group: 'Accounts & administration',
    permission: 'finance.read',
  },
  {
    slug: 'documents',
    label: 'Documents',
    icon: Files,
    group: 'Accounts & administration',
    permission: 'documents.read',
  },
  {
    slug: 'reports',
    label: 'Reports',
    icon: ChartNoAxesCombined,
    group: 'Accounts & administration',
    permission: 'reports.read',
  },
  {
    slug: 'settings',
    label: 'Project settings',
    icon: Settings2,
    group: 'Administration',
    permission: 'settings.manage',
  },
  { slug: 'notifications', label: 'Notifications', icon: Bell, group: 'Personal', permission: '' },
  {
    slug: 'profile',
    label: 'My profile',
    icon: CircleUserRound,
    group: 'Personal',
    permission: '',
  },
];
export const primarySlugs = new Set([
  'projects',
  'inventory',
  'crm',
  'customers',
  'bookings',
  'collections',
  'recovery',
  'dealers',
  'approvals',
  'transfers',
  'possessions',
  'users',
]);
export const navItems = [
  ...specialNav.slice(0, 2),
  ...resources.filter((r) => primarySlugs.has(r.slug)),
  ...specialNav.slice(2),
];
export const resourcePath = (r: Resource) => (r.global ? '/' + r.api : projectRoot + '/' + r.api);
const stateRules: Record<string, string[]> = {
  '/confirm': ['DRAFT'],
  '/verify': ['PENDING'],
  '/reverse': ['CLEARED'],
  '/reversal-requests': ['CLEARED'],
  '/allocate-advance': ['CLEARED'],
  '/cancel': ['ACTIVE'],
  '/resubmit': ['REJECTED'],
  '/issue': ['PENDING'],
  '/complete': ['PENDING', 'APPROVED'],
  '/withdraw': ['PENDING'],
  '/handover': ['PENDING', 'APPROVED'],
  '/pay': ['PENDING', 'APPROVED'],
  '/settle': ['PENDING', 'APPROVED'],
  '/convert': ['QUALIFIED'],
  '/status': ['AVAILABLE', 'BLOCKED'],
};
export function allowedAction(op: Operation, record?: Row): boolean {
  if (!can(op.permission)) return false;
  if (!record) return true;
  if (op.path.endsWith('/decide')) {
    const user = useAuth.getState().user;
    return (
      record.status === 'PENDING' &&
      record.requestedBy !== user?.id &&
      Array.isArray(record.permissions) &&
      Boolean(user?.permissions.includes(String(record.permissions[Number(record.level)])))
    );
  }
  if (op.path.endsWith('/resubmit') && record.requestedBy !== useAuth.getState().user?.id)
    return false;
  if (op.path.endsWith('/verify') && record.receivedBy === useAuth.getState().user?.id)
    return false;
  if (op.path.endsWith('/lock') && record.locked) return false;
  if (op.path.includes('/journals/') && op.path.endsWith('/reverse')) return !record.reversedById;
  const rule = Object.entries(stateRules).find(([suffix]) => op.path.endsWith(suffix));
  return !rule || !record.status || rule[1].includes(String(record.status));
}
export function actionsFor(resource: Resource, record?: Row) {
  const path = resourcePath(resource);
  return operations
    .filter(
      (op) =>
        op.method !== 'get' &&
        !op.path.includes('/portal') &&
        (record
          ? resource.slug === 'projects'
            ? op.path === '/projects/{projectId}'
            : op.path.startsWith(path + '/{id}')
          : op.path === path ||
            (op.path.startsWith(path + '/') &&
              !op.path.slice(path.length).includes('{id}') &&
              !op.path.slice(path.length).includes('{projectId}'))),
    )
    .filter((op) => allowedAction(op, record));
}
export function actionTitle(op: Operation, resource?: Resource) {
  const tail = op.path.split('/').at(-1)!;
  if (op.method === 'patch') return 'Edit ' + (resource?.singular ?? 'record');
  if (op.method === 'delete') return 'Revoke session';
  const names: Record<string, string> = {
    decide: 'Review approval',
    verify: 'Verify payment',
    confirm: 'Confirm booking',
    reverse: 'Reverse entry',
    'allocate-advance': 'Allocate advance',
    'reversal-requests': 'Request reversal',
    resubmit: 'Resubmit request',
    issue: 'Issue clearance certificate',
    complete: 'Complete workflow',
    withdraw: 'Withdraw request',
    handover: 'Complete handover',
    inspection: 'Record inspection',
    activities: 'Add activity',
    allocations: 'Assign properties',
    'price-requests': 'Request price change',
    price: 'Apply approved price',
    'discount-requests': 'Request discount',
    status: 'Change availability',
    'reschedule-requests': 'Request reschedule',
    reschedule: 'Apply reschedule',
    nominees: 'Add nominee',
    'revoke-sessions': 'Revoke all sessions',
    'reset-password': 'Send password reset',
    access: 'Change access',
    versions: 'Add plan version',
    import: 'Import properties from CSV',
    settle: 'Settle commission',
    pay: 'Pay refund',
    recalculate: 'Recalculate refund',
    lock: 'Lock period',
    requests: 'Request journal approval',
    reconcile: 'Reconcile bank entry',
    convert: 'Convert lead',
    generate: 'Generate document',
  };
  return names[tail] ?? 'Add ' + (resource?.singular ?? 'record');
}
