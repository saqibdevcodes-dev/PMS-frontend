import { ownershipLabels, ownershipHelp } from './ownership';
export const fieldLabels: Record<string, string> = {
  logoId: 'Project logo',
  vendorId: 'Seller or supplier',
  fileReference: 'Purchase agreement reference',
  purchaseDate: 'Purchase date',
  taxes: 'Non-recoverable acquisition taxes',
  legalFees: 'Acquisition legal fees',
  brokerage: 'Acquisition brokerage',
  otherCosts: 'Other direct acquisition costs',
  ...ownershipLabels,
  createdAt: 'Creation Time',
  location: 'Location',
  paymentType: 'Payment type',
  installmentCount: 'Number of installments',
  intervalMonths: 'Months between payments',
  firstInstallmentDate: 'First installment date',
  name: 'Name',
  code: 'Project code',
  number: 'Property number',
  type: 'Property type',
  typeDetails: 'Other property type',
  size: 'Property area',
  measurementUnit: 'Area unit',
  features: 'Property features',
  featureImages: 'Feature photos',
  photoId: 'Photo',
  photoIds: 'Photos',
  imageId: 'Photo',
  price: 'Property price',
  charges: 'Additional property fees',
  method: 'Payment method',
  methodDetails: 'Other payment method',
  proofImageId: 'Payment proof image',
  transactionReference: 'Transaction or cheque number',
  receivingAccountId: 'Account receiving the payment',
  paidAt: 'Payment date and time',
  roleIds: 'Roles and responsibilities',
  projectIds: 'Projects this person can access',
  identity: 'National ID or passport number',
  identityType: 'Identity document type',
  identityLast4: 'ID ending in',
  downPaymentPercent: 'Minimum down payment (%)',
  ndcValidityDays: 'Clearance certificate validity (days)',
  customerId: 'Member',
  buyerId: 'New owner',
  unitId: 'Property',
  bookingId: 'Booking',
  assignedTo: 'Responsible employee',
  communicationConsent: 'Member agrees to receive messages',
  amount: 'Payment amount',
  fatherName: 'Father / Guardian',
  phone: 'Phone number',
  secondaryPhone: 'Secondary phone',
  email: 'Email address',
};
export const fieldHelp: Record<string, [string, string]> = {
  ...ownershipHelp,
  name: ['e.g. Ahmed Ali', 'Enter the full name as it should appear on records.'],
  fatherName: ['e.g. Muhammad Ali', 'Enter father or legal guardian name.'],
  code: [
    'e.g. GARDEN-HOMES',
    'Generated from the project name. You can edit it: use 2–20 capital letters, numbers or hyphens. The code must be unique.',
  ],
  location: [
    'e.g. DHA Phase 5, Lahore',
    'Enter the city, address or area where the project is located.',
  ],
  description: [
    'Describe this project',
    'Tell customers and staff what makes this development useful.',
  ],
  downPaymentPercent: [
    'e.g. 20',
    'The minimum percentage paid upfront for installment bookings. Full payment is exempt.',
  ],
  currency: ['Choose a currency', 'Used for prices, payments and reports in this project.'],
  timezone: ['Choose a timezone', 'Used for project dates, deadlines and reports.'],
  number: ['e.g. A-104', 'The plot, apartment, shop or office number used in this project.'],
  size: [
    'e.g. 5',
    'Enter the area as a number, then choose its unit. For example: 5 marla or 1,200 square feet.',
  ],
  measurementUnit: [
    'Choose an area unit',
    'This describes how the property area is measured; it is not a price.',
  ],
  price: [
    'e.g. 3500000.00',
    'Enter the total price of this property, not the price per area unit.',
  ],
  charges: [
    'e.g. 0.00',
    'Extra property fees, such as development or utility connection fees, added once to the property price. Enter 0 if none.',
  ],
  phone: ['e.g. 0300-1234567', 'Include the mobile phone number so the person can be contacted.'],
  secondaryPhone: ['e.g. 0300-1234567', 'Alternative contact number for urgent communications.'],
  email: ['e.g. name@example.com', 'Use an email address that belongs to this person.'],
  address: ['e.g. House 12, Street 4, Lahore', 'Enter the house, street, city and country.'],
  notes: [
    'Add useful details about this enquiry',
    'Include the preferred property, budget, follow-up date or discussion notes.',
  ],
  budget: ['e.g. 5000000.00', 'The maximum amount the customer expects to spend.'],
  password: [
    'Create a strong password',
    'Use at least 12 characters with uppercase, lowercase and a number.',
  ],
  typeDetails: ['e.g. Warehouse', 'Describe the property type when you select Other.'],
  methodDetails: [
    'e.g. Mobile wallet transfer',
    'Describe the payment method when you select Other.',
  ],
  transactionReference: [
    'e.g. TXN-123456 or cheque number',
    'Enter the reference shown on the transfer receipt, cheque or payment slip.',
  ],
  amount: ['e.g. 50000.00', 'Enter the amount actually received in the selected project currency.'],
  receivingAccountId: [
    'Choose the receiving account',
    'Select the cash or bank account where the money was received.',
  ],
  proofImageId: [
    'Choose a proof image',
    'A receipt, transfer screenshot, cheque or deposit slip is required for every payment method except cash.',
  ],
  phase: ['e.g. Phase 1', 'The development phase, if this project uses phases.'],
  block: ['e.g. Block A', 'The block or section containing this property.'],
  floor: ['e.g. Ground floor or 3', 'The floor of the building, if applicable.'],
  tower: ['e.g. Tower B', 'The building or tower name, if applicable.'],
  sector: ['e.g. Sector C', 'The sector containing this property, if applicable.'],
  identity: [
    'e.g. National ID or passport number',
    'Use the official identity number; access to it is restricted.',
  ],
  title: ['e.g. Follow-up call', 'Give this item a short, clear title.'],
  reason: [
    'Explain why this change is needed',
    'This explanation is saved with the request for review.',
  ],
  comment: [
    'Add a helpful comment',
    'Explain your decision clearly for the person reviewing this record.',
  ],
};
export function guidanceFor(field: string, path: string): [string, string] | undefined {
  if (field === 'price' && path.includes('/property-purchases'))
    return [
      'e.g. 5000000.00',
      'The agreed property price owed to the seller, excluding the additional acquisition costs below.',
    ];
  if (field === 'vendorId' && path.includes('/property-purchases'))
    return [
      'Choose the seller',
      'Add the seller under Sellers & suppliers first. Choose Seller or Multi-role as their category.',
    ];
  if (field === 'otherCosts' && path.includes('/property-purchases'))
    return [
      '0',
      'Only include direct acquisition costs. Exclude recoverable taxes, selling costs and general administration.',
    ];
  if (field === 'name' && /^\/projects(?:\/\{projectId\})?$/.test(path))
    return ['e.g. Garden Homes', 'Use the name customers and staff know this project by.'];
  if (field === 'name' && /payment-plans|document-templates|accounts|roles/.test(path))
    return ['Enter a short, clear name', 'This name appears in lists and selection menus.'];
  if (field === 'code' && !/^\/projects(?:\/\{projectId\})?$/.test(path))
    return ['e.g. 1010', 'Enter the unique code used for this account.'];
  if (field === 'amount' && !path.endsWith('/payments'))
    return ['e.g. 50000.00', 'Enter the amount in the selected project currency.'];
  if (field === 'notes' && !/leads|recovery/.test(path))
    return ['Add useful details', 'Include information needed by the person handling this record.'];
  return fieldHelp[field];
}
export const featureOptions = [
  'Corner plot',
  'Park facing',
  'Main road',
  'Gated community',
  'Parking',
  'Lift',
  'Balcony',
  'Security',
  'Water supply',
  'Electricity',
  'Gas connection',
  'Swimming pool',
  'Gym',
];
export function imagePurpose(path: string) {
  if (/\/customers(?:\/|$)/.test(path)) return 'CUSTOMER';
  if (path === '/users') return 'USER';
  if (/\/units(?:\/|$)/.test(path)) return 'UNIT';
  return 'PROJECT';
}
export const roleDescriptions: Record<string, string> = {
  'Super Admin':
    'Full administration of users, roles, project records and settings. Assign only to trusted administrators.',
  Management:
    'Reviews project performance and confirms bookings, discounts, ownership changes and refunds.',
  'Project Manager':
    'Manages project settings and properties, and confirms bookings and property handovers.',
  'Sales Manager': 'Manages customers, bookings and payment schedules.',
  'Sales Executive': 'Adds customers and prepares bookings.',
  'Finance Manager':
    'Records and verifies payments, manages accounting entries and reviews refunds.',
  'Finance Officer':
    'Records incoming payments and views customer, booking and account information.',
  'Recovery Officer': 'Tracks overdue installments and follows up outstanding customer payments.',
  'Customer Service':
    'Updates customer details, manages documents and prepares property handovers.',
  Auditor: 'Views records and reports for review without changing them.',
};
