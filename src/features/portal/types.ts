export type PortalProject = {
  id: string;
  logoId?: string | null;
  name: string;
  currency: string;
  timezone: string;
};
export type Position = {
  bookings: number;
  total: string;
  paid: string;
  outstanding: string;
  overdue: string;
  advanceCredit: string;
};
export type PortalBooking = {
  id: string;
  reference: string;
  status: string;
  total: string;
  downPayment: string;
  createdAt: string;
  confirmedAt: string | null;
  unit: {
    number: string;
    type: string;
    phase: string | null;
    block: string | null;
    floor: string | null;
    size: string;
    measurementUnit: string;
    status: string;
    project: PortalProject;
  };
  position?: Position;
};
export type PortalInstallment = {
  id: string;
  label: string;
  dueDate: string;
  amount: string;
  paid: string;
  outstanding: string;
  booking: PortalBooking;
};
export type PortalPayment = {
  id: string;
  amount: string;
  method: string;
  paidAt: string;
  status: string;
  booking: PortalBooking;
  receipt: { reference: string; createdAt: string; reversedAt: string | null } | null;
};
export type PortalDocument = {
  id: string;
  name: string;
  mime: string;
  size: number;
  createdAt: string;
  project: PortalProject;
};
export type PortalNotice = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  readAt: string | null;
};
export type PortalRequest = {
  id: string;
  reference?: string;
  status: string;
  booking: PortalBooking;
  issuedAt?: string;
  completedAt?: string;
  handoverAt?: string;
  inspectionAt?: string;
  paidAt?: string;
  amount?: string;
  charges?: string;
};
export type PortalProfile = {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  address: string | null;
  reference: string;
  project: PortalProject;
};
export type PortalDashboard = {
  accounts: (Position & { project: PortalProject })[];
  upcoming: {
    id: string;
    bookingId: string;
    reference: string;
    label: string;
    dueDate: string;
    outstanding: string;
    currency: string;
    projectName: string;
  }[];
  asOf: string;
};
