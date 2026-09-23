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
    description: 'One clear view of every development in your portfolio.',
    columns: ['name', 'code', 'currency', 'timezone', 'createdAt'],
  },
  {
    slug: 'inventory',
    label: 'Inventory',
    singular: 'unit',
    api: 'units',
    icon: Grid2X2,
    group: 'Sales & customers',
    permission: 'inventory.read',
    description: 'Find the right property. Know its availability.',
    columns: ['number', 'type', 'phase', 'block', 'size', 'price', 'status'],
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
    description: 'Every conversation, from first interest to a new customer.',
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
    description: 'Relationships, records, and a complete customer picture.',
    columns: ['name', 'reference', 'phone', 'email', 'identityLast4', 'createdAt'],
  },
  {
    slug: 'reservations',
    label: 'Reservations',
    singular: 'reservation',
    api: 'reservations',
    icon: CalendarClock,
    group: 'Sales & customers',
    permission: 'bookings.read',
    description: 'Time-bound property holds, backed by live availability.',
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
    description: 'From reservation to an approved sale, with every detail in place.',
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
    description: 'Versioned schedules that preserve existing commitments.',
    columns: ['name', 'createdAt'],
  },
  {
    slug: 'installments',
    label: 'Installments',
    singular: 'installment',
    api: 'installments',
    icon: ReceiptText,
    group: 'Collections & recovery',
    permission: 'reports.read',
    report: 'installments',
    description: 'Scheduled, paid, and outstanding — all in one place.',
    columns: ['reference', 'dueDate', 'amount', 'paid', 'outstanding', 'lateDays'],
  },
  {
    slug: 'collections',
    label: 'Collections',
    singular: 'payment',
    api: 'payments',
    icon: CreditCard,
    group: 'Collections & recovery',
    permission: 'payments.read',
    description: 'Record collections, verify funds, and follow every receipt.',
    columns: ['id', 'bookingId', 'amount', 'method', 'paidAt', 'status'],
  },
  {
    slug: 'recovery',
    label: 'Recovery',
    singular: 'recovery case',
    api: 'recovery-cases',
    icon: HandCoins,
    group: 'Collections & recovery',
    permission: 'recovery.manage',
    description: 'Focused follow-ups and a clear path to recovered dues.',
    columns: ['id', 'bookingId', 'assignedTo', 'status', 'createdAt'],
  },
  {
    slug: 'dealers',
    label: 'Dealers',
    singular: 'dealer',
    api: 'dealers',
    icon: BriefcaseBusiness,
    group: 'Collections & recovery',
    permission: 'dealers.read',
    description: 'Your partner network, allocations, and commission agreements.',
    columns: ['name', 'phone', 'commissionPercent', 'createdAt'],
  },
  {
    slug: 'commissions',
    label: 'Commissions',
    singular: 'commission',
    api: 'commissions',
    icon: BadgePercent,
    group: 'Collections & recovery',
    permission: 'reports.read',
    report: 'dealers',
    description: 'Approved earnings and traceable dealer settlements.',
    columns: ['dealerName', 'bookingId', 'amount', 'status', 'paidAt'],
  },
  {
    slug: 'ndcs',
    label: 'NDC requests',
    singular: 'NDC request',
    api: 'ndcs',
    icon: UserRoundCheck,
    group: 'Approvals & ownership',
    permission: 'bookings.read',
    description: 'Verify identity, documents, and dues before clearance.',
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
    description: 'Controlled ownership changes with a complete history.',
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
    description: 'Review deductions, approvals, and refundable balances.',
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
    description: 'Staged refunds with clear approvals and payment references.',
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
    description: 'Inspection, snag resolution, and a confident handover.',
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
    description: 'Decisions that keep your projects moving, with accountability.',
    columns: ['operation', 'amount', 'status', 'level', 'createdAt'],
  },
  {
    slug: 'accounts',
    label: 'Chart of accounts',
    singular: 'account',
    api: 'accounts',
    icon: Landmark,
    group: 'Finance & administration',
    permission: 'finance.read',
    description: 'The foundation of your project ledger.',
    columns: ['code', 'name', 'type', 'active'],
  },
  {
    slug: 'journals',
    label: 'Journals',
    singular: 'journal',
    api: 'journals',
    icon: BookOpen,
    group: 'Finance & administration',
    permission: 'finance.read',
    description: 'Balanced, approved postings with immutable history.',
    columns: ['reference', 'description', 'source', 'postedAt'],
  },
  {
    slug: 'bank-accounts',
    label: 'Bank accounts',
    singular: 'bank account',
    api: 'bank-accounts',
    icon: Landmark,
    group: 'Finance & administration',
    permission: 'finance.read',
    description: 'Registered accounts and bank reconciliation.',
    columns: ['name', 'iban', 'accountId'],
  },
  {
    slug: 'vendors',
    label: 'Vendors',
    singular: 'vendor',
    api: 'vendors',
    icon: BriefcaseBusiness,
    group: 'Finance & administration',
    permission: 'finance.read',
    description: 'Keep every supplier and ledger reference organized.',
    columns: ['name', 'phone'],
  },
  {
    slug: 'accounting-periods',
    label: 'Accounting periods',
    singular: 'accounting period',
    api: 'accounting-periods',
    icon: LockKeyhole,
    group: 'Finance & administration',
    permission: 'finance.read',
    description: 'Open periods for posting. Locked periods for reliable history.',
    columns: ['startDate', 'endDate', 'locked'],
  },
  {
    slug: 'document-templates',
    label: 'Document templates',
    singular: 'template',
    api: 'document-templates',
    icon: Files,
    group: 'Finance & administration',
    permission: 'documents.read',
    description: 'Versioned templates for authoritative property documents.',
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
    description: 'Manage team access, roles, and active sessions.',
    columns: ['name', 'email', 'active', 'roles'],
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
    description: 'Give each team member the access their work requires.',
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
    description: 'An append-only record of who did what, and when.',
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
    label: 'Finance',
    icon: Landmark,
    group: 'Finance & administration',
    permission: 'finance.read',
  },
  {
    slug: 'documents',
    label: 'Documents',
    icon: Files,
    group: 'Finance & administration',
    permission: 'documents.read',
  },
  {
    slug: 'reports',
    label: 'Reports',
    icon: ChartNoAxesCombined,
    group: 'Finance & administration',
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
    issue: 'Issue NDC',
    complete: 'Complete workflow',
    withdraw: 'Withdraw request',
    handover: 'Complete handover',
    inspection: 'Record inspection',
    activities: 'Add activity',
    allocations: 'Allocate inventory',
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
    import: 'Bulk import units',
    settle: 'Settle commission',
    pay: 'Pay refund',
    recalculate: 'Recalculate refund',
    lock: 'Lock period',
    requests: 'Request journal approval',
    reconcile: 'Reconcile bank entry',
    convert: 'Convert lead',
    generate: 'Generate document',
  };
  return names[tail] ?? 'New ' + (resource?.singular ?? 'record');
}
