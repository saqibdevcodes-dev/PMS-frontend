import {
  LayoutDashboard,
  Building2,
  Grid2X2,
  Users,
  BookOpen,
  CreditCard,
  ReceiptText,
  HandCoins,
  Coins,
  UserRoundCheck,
  ShieldCheck,
  ArrowLeftRight,
  Undo2,
  KeyRound,
  Files,
  ChartNoAxesCombined,
  Settings2,
  CircleUserRound,
  ListTodo,
  Bell,
  SlidersHorizontal,
  Landmark,
  FileSpreadsheet,
  Store,
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
    columns: ['name', 'location', 'features', 'paymentRules', 'regionalSettings', 'createdAt'],
  },
  {
    slug: 'inventory',
    label: 'Properties',
    singular: 'property',
    api: 'units',
    icon: Grid2X2,
    group: 'Sales & members',
    permission: 'inventory.read',
    description: 'View property availability, area, price and photos.',
    columns: ['number', 'bookings', 'phase', 'size', 'price', 'status'],
    views: true,
  },
  {
    slug: 'customers',
    label: 'Members',
    singular: 'member',
    api: 'customers',
    icon: Users,
    group: 'Sales & members',
    permission: 'customers.read',
    description: 'Manage member photos, contact details and computerized allotment files.',
    columns: ['name', 'bookings', 'paymentStatus', 'email', 'phone', 'identityLast4', 'createdAt'],
  },
  {
    slug: 'bookings',
    label: 'Bookings',
    singular: 'booking',
    api: 'bookings',
    icon: BookOpen,
    group: 'Sales & members',
    permission: 'bookings.read',
    description: 'Create bookings and track their payment status.',
    columns: [
      'reference',
      'customer',
      'unit',
      'paymentType',
      'total',
      'paid',
      'outstanding',
      'nextDue',
      'status',
      'createdAt',
    ],
  },
  {
    slug: 'payment-plans',
    label: 'Payment plans',
    singular: 'payment plan',
    api: 'payment-plans',
    icon: SlidersHorizontal,
    group: 'Sales & members',
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
    columns: ['booking', 'amount', 'method', 'paidAt', 'status'],
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
    columns: ['booking', 'employee', 'status', 'createdAt'],
  },
  {
    slug: 'ndcs',
    label: 'Clearance certificates',
    singular: 'clearance request',
    api: 'ndcs',
    icon: UserRoundCheck,
    group: 'Ownership',
    permission: 'bookings.read',
    description: 'Check identity, documents and unpaid amounts before issuing clearance.',
    columns: ['reference', 'booking', 'status', 'issuedAt', 'expiresAt'],
  },
  {
    slug: 'transfers',
    label: 'Transfers',
    singular: 'transfer',
    api: 'transfers',
    icon: ArrowLeftRight,
    group: 'Ownership',
    permission: 'bookings.read',
    description: 'Change property ownership and keep its history.',
    columns: ['reference', 'booking', 'buyer', 'charges', 'status', 'completedAt'],
  },
  {
    slug: 'cancellations',
    label: 'Cancellations',
    singular: 'cancellation',
    api: 'cancellations',
    icon: Undo2,
    group: 'Ownership',
    permission: 'bookings.read',
    description: 'Review booking cancellations, deductions and refunds.',
    columns: ['id', 'booking', 'deduction', 'refundable', 'status'],
  },
  {
    slug: 'refunds',
    label: 'Refunds',
    singular: 'refund',
    api: 'refunds',
    icon: HandCoins,
    group: 'Ownership',
    permission: 'reports.read',
    report: 'refunds',
    description: 'Track refunds and their payments.',
    columns: ['bookingReference', 'customerName', 'amount', 'status', 'paidAt'],
  },
  {
    slug: 'possessions',
    label: 'Possession',
    singular: 'possession request',
    api: 'possessions',
    icon: KeyRound,
    group: 'Ownership',
    permission: 'bookings.read',
    description: 'Record inspections, resolve issues and hand over properties.',
    columns: ['id', 'booking', 'status', 'inspectionAt', 'handoverAt'],
  },
  {
    slug: 'accounts',
    label: 'Chart of accounts',
    singular: 'account',
    api: 'accounts',
    icon: Landmark,
    group: 'Accounts & administration',
    permission: 'finance.read',
    description: 'Review and manage asset, liability, equity, revenue and expense ledger accounts.',
    columns: ['code', 'name', 'type', 'active'],
  },
  {
    slug: 'journals',
    label: 'Accounting vouchers',
    singular: 'voucher',
    api: 'journals',
    icon: FileSpreadsheet,
    group: 'Accounts & administration',
    permission: 'finance.read',
    description: 'Post and review double-entry vouchers and immutable journal entries.',
    columns: ['reference', 'description', 'postedAt'],
  },
  {
    slug: 'bank-accounts',
    label: 'Bank accounts',
    singular: 'bank account',
    api: 'bank-accounts',
    icon: Landmark,
    group: 'Accounts & administration',
    permission: 'finance.read',
    description: 'Manage company bank accounts and match statement entries.',
    columns: ['name', 'iban', 'accountId'],
  },
  {
    slug: 'vendors',
    label: 'Sellers & suppliers',
    singular: 'vendor',
    api: 'vendors',
    icon: Store,
    group: 'Accounts & administration',
    permission: 'finance.read',
    description: 'Manage sellers, suppliers and contractors for this project.',
    columns: ['name', 'category', 'phone', 'email', 'address'],
  },
  {
    slug: 'property-purchases',
    label: 'Property purchases',
    singular: 'property purchase',
    api: 'property-purchases',
    icon: Building2,
    group: 'Accounts & administration',
    permission: 'finance.read',
    description:
      'Record property acquisitions for resale or development, review costs and post seller obligations.',
    columns: [
      'reference',
      'title',
      'unit',
      'vendor',
      'purchaseDate',
      'price',
      'otherCosts',
      'total',
      'status',
    ],
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
    label: 'System users',
    singular: 'system user',
    api: 'users',
    icon: Users,
    group: 'Administration',
    global: true,
    permission: 'users.manage',
    description: 'Manage system user photos, roles and access.',
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
    description: 'Choose what each employee can view and change.',
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
  {
    slug: 'property-lifecycle',
    label: 'Property Lifecycle',
    icon: Coins,
    group: 'Workspace',
    permission: 'inventory.read',
  },
  { slug: 'my-work', label: 'My work', icon: ListTodo, group: 'Workspace', permission: '' },
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
    permission: 'projects.update',
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
  'customers',
  'bookings',
  'payment-plans',
  'collections',
  'recovery',
  'transfers',
  'possessions',
  'journals',
  'vendors',
  'property-purchases',
  'users',
]);
export const navItems = [
  ...specialNav.slice(0, 2),
  ...resources.filter((r) => primarySlugs.has(r.slug)),
  ...specialNav.slice(2),
];
export const resourcePath = (r: Resource) => (r.global ? '/' + r.api : projectRoot + '/' + r.api);
const stateRules: Record<string, string[]> = {
  '/verification': ['PENDING'],
  '/confirm': ['DRAFT'],
  '/verify': ['PENDING'],
  '/reverse': ['CLEARED'],

  '/allocate-advance': ['CLEARED'],
  '/cancel': ['ACTIVE'],

  '/issue': ['PENDING'],
  '/complete': ['PENDING', 'APPROVED'],
  '/withdraw': ['PENDING'],
  '/handover': ['PENDING', 'APPROVED'],
  '/pay': ['PENDING', 'APPROVED'],

  '/status': ['AVAILABLE', 'BLOCKED'],
};
export function allowedAction(op: Operation, record?: Row): boolean {
  if (!can(op.permission)) return false;
  if (!record) return true;
  if (op.path.includes('/property-purchases/')) {
    if (op.method === 'patch' || op.path.endsWith('/post')) return record.status === 'DRAFT';
    if (op.path.endsWith('/void')) return record.status !== 'VOIDED';
  }
  if (
    /\/units\/\{id\}(?:\/price)?$/.test(op.path) &&
    !['AVAILABLE', 'BLOCKED'].includes(String(record.status))
  )
    return false;
  if (
    op.path.endsWith('/verify') &&
    record.receivedBy === useAuth.getState().user?.id &&
    !can('users.manage')
  )
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
  if (op.path.includes('/property-purchases/') && tail === 'post') return 'Post purchase';
  if (op.path.includes('/property-purchases/') && tail === 'void') return 'Void purchase';
  if (tail === 'verification') return 'Review case documents';
  if (tail === 'verify-fee') return 'Verify transfer fee';
  if (tail === 'complete' && resource?.slug === 'transfers') return 'Complete transfer';
  if (tail === 'reverse' && resource?.slug === 'collections') return 'Reverse payment';
  if (op.method === 'patch') return 'Edit ' + (resource?.singular ?? 'record');
  if (op.method === 'delete') return 'Revoke session';
  const names: Record<string, string> = {
    verify: 'Verify payment',
    confirm: 'Confirm booking',
    reverse: 'Reverse entry',
    'allocate-advance': 'Allocate advance',
    issue: 'Issue clearance certificate',
    complete: 'Complete workflow',
    withdraw: 'Withdraw request',
    handover: 'Complete handover',
    inspection: 'Record inspection',
    activities: 'Add activity',
    price: 'Change price',
    status: 'Change availability',
    reschedule: 'Save payment plan',
    nominees: 'Add nominee',
    'revoke-sessions': 'Revoke all sessions',
    'reset-password': 'Send password reset',
    access: 'Change access',
    versions: 'Add plan version',
    import: 'Import properties from CSV',
    pay: 'Pay refund',
    recalculate: 'Recalculate refund',
    lock: 'Lock period',
    reconcile: 'Reconcile bank entry',
    generate: 'Generate document',
  };
  return names[tail] ?? 'Add ' + (resource?.singular ?? 'record');
}
