import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  Building2,
  CheckCircle2,
  ArrowRight,
  Printer,
  Receipt,
  ExternalLink,
  FileText,
  BadgeAlert,
} from 'lucide-react';
import { api } from '../../lib/api';
import { BrandLogo } from '../../components/BrandLogo';
import { Button, Skeleton } from '../../components/ui';
import { money, date } from '../../lib/format';
import './portal.css';

interface VerificationResult {
  valid: boolean;
  reference?: string;
  status?: string;
  projectName?: string;
  projectCode?: string;
  propertyNumber?: string;
  propertyType?: string;
  phase?: string | null;
  block?: string | null;
  tower?: string | null;
  floor?: string | null;
  size?: string;
  total?: string;
  currency?: string;
  customerName?: string;
  customerIdentityLast4?: string;
  confirmedAt?: string | null;
  verifiedAt?: string;
  message?: string;
}

interface EmployeeVerificationResult {
  valid: boolean;
  employeeId?: string;
  employeeCode?: string;
  name?: string;
  active?: boolean;
  status?: string;
  photoId?: string | null;
  roles?: string[];
  projects?: string[];
  joinedAt?: string;
  verifiedAt?: string;
  message?: string;
}

interface CustomerVerificationResult {
  valid: boolean;
  customerId?: string;
  customerCode?: string;
  name?: string;
  identityLast4?: string;
  photoId?: string | null;
  projectName?: string;
  projectCode?: string;
  currency?: string;
  activeBookings?: string[];
  joinedAt?: string;
  verifiedAt?: string;
  message?: string;
  financial?: {
    total: string;
    paid: string;
    outstanding: string;
    overdue: string;
    advanceCredit: string;
    bookingsCount: number;
  };
  bookings?: {
    reference: string;
    status: string;
    total: string;
    unitNumber: string;
    unitType: string;
    size?: string | null;
    location?: string;
  }[];
  payments?: {
    receiptRef: string;
    bookingRef?: string;
    unitNumber?: string;
    paidAt: string;
    amount: string;
    method: string;
    status: string;
  }[];
}

export default function VerificationPage() {
  const [params, setParams] = useSearchParams();
  const employeeParam = params.get('employee') ?? '';
  const customerParam = params.get('customer') ?? '';
  const refParam = params.get('ref') ?? '';

  const isEmployeeSearch = Boolean(
    employeeParam ||
      refParam.toUpperCase().startsWith('EMP-') ||
      refParam.toUpperCase().startsWith('USR-'),
  );
  const isCustomerSearch = Boolean(
    customerParam ||
      refParam.toUpperCase().startsWith('CUST-') ||
      refParam.toUpperCase().startsWith('MEM-'),
  );
  const activeLookup = employeeParam || customerParam || refParam;

  const [inputRef, setInputRef] = useState(activeLookup);

  const fileQuery = useQuery({
    queryKey: ['file-verification', refParam],
    enabled: !!refParam.trim() && !isEmployeeSearch && !isCustomerSearch,
    queryFn: ({ signal }) =>
      api<VerificationResult>(`/verify/file/${encodeURIComponent(refParam.trim())}`, { signal }),
  });

  const employeeQuery = useQuery({
    queryKey: ['employee-verification', activeLookup],
    enabled: !!activeLookup.trim() && isEmployeeSearch,
    queryFn: ({ signal }) =>
      api<EmployeeVerificationResult>(
        `/verify/employee/${encodeURIComponent(activeLookup.trim())}`,
        { signal },
      ),
  });

  const customerQuery = useQuery({
    queryKey: ['customer-verification', activeLookup],
    enabled: !!activeLookup.trim() && isCustomerSearch,
    queryFn: ({ signal }) =>
      api<CustomerVerificationResult>(
        `/verify/customer/${encodeURIComponent(activeLookup.trim())}`,
        { signal },
      ),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const val = inputRef.trim();
    if (!val) return;
    if (val.toUpperCase().startsWith('EMP-') || val.toUpperCase().startsWith('USR-')) {
      setParams({ employee: val });
    } else if (val.toUpperCase().startsWith('CUST-') || val.toUpperCase().startsWith('MEM-')) {
      setParams({ customer: val });
    } else {
      setParams({ ref: val });
    }
  };

  const fileData = fileQuery.data;
  const empData = employeeQuery.data;
  const custData = customerQuery.data;
  const isLoading = fileQuery.isLoading || employeeQuery.isLoading || customerQuery.isLoading;

  return (
    <div className="portal-auth-layout">
      <div className="portal-auth-card" style={{ maxWidth: isCustomerSearch && custData?.valid ? 820 : 640 }}>
        <header className="portal-auth-header">
          <BrandLogo variant="full" className="portal-auth-logo" />
          <h1>
            {isEmployeeSearch
              ? 'Official System User Verification'
              : isCustomerSearch
                ? 'Official Member & Allottee Verification'
                : 'Computerized File Verification'}
          </h1>
          <p>
            {isEmployeeSearch
              ? 'Verify official staff credentials, identity authorization and active system access.'
              : isCustomerSearch
                ? 'Verify registered member credentials, ownership portfolio and membership authenticity.'
                : 'Verify official real estate allotment records and ownership references.'}
          </p>
        </header>

        {/* Search input */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <div className="input-icon" style={{ flex: 1 }}>
            <Search size={16} />
            <input
              placeholder="Enter Registration No., User Code or Member Code"
              value={inputRef}
              onChange={(e) => setInputRef(e.target.value)}
              aria-label="Registration reference or code"
            />
          </div>
          <Button type="submit">Verify</Button>
        </form>

        {isLoading ? (
          <Skeleton rows={4} />
        ) : isEmployeeSearch && empData?.valid ? (
          <div
            style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: 8,
              padding: 24,
              color: '#166534',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <ShieldCheck size={32} style={{ color: '#16a34a' }} />
              <div>
                <h3 style={{ margin: 0, fontSize: 18, color: '#15803d' }}>
                  Official System User Verified
                </h3>
                <small style={{ color: '#166534' }}>
                  Authentic authorized user of property management organization
                </small>
              </div>
            </div>

            <dl
              style={{
                display: 'grid',
                gridTemplateColumns: '140px 1fr',
                gap: '8px 12px',
                fontSize: 13,
                margin: '16px 0',
                borderTop: '1px solid #dcfce7',
                paddingTop: 16,
              }}
            >
              <dt style={{ color: '#4b7a59', fontWeight: 500 }}>User Code</dt>
              <dd style={{ fontWeight: 700, color: '#0f172a' }}>{empData.employeeCode}</dd>

              <dt style={{ color: '#4b7a59', fontWeight: 500 }}>Staff Name</dt>
              <dd style={{ fontWeight: 600, color: '#0f172a' }}>{empData.name}</dd>

              <dt style={{ color: '#4b7a59', fontWeight: 500 }}>Designation / Roles</dt>
              <dd style={{ fontWeight: 600, color: '#0f172a' }}>
                {empData.roles && empData.roles.length > 0
                  ? empData.roles.join(', ')
                  : 'Staff Member'}
              </dd>

              <dt style={{ color: '#4b7a59', fontWeight: 500 }}>System Access</dt>
              <dd style={{ fontWeight: 700, color: empData.active ? '#16a34a' : '#ef4444' }}>
                {empData.active ? 'ACTIVE SYSTEM USER' : 'INACTIVE'}
              </dd>

              {empData.projects && empData.projects.length > 0 && (
                <>
                  <dt style={{ color: '#4b7a59', fontWeight: 500 }}>Assigned Projects</dt>
                  <dd style={{ color: '#0f172a' }}>{empData.projects.join(' · ')}</dd>
                </>
              )}

              {empData.joinedAt && (
                <>
                  <dt style={{ color: '#4b7a59', fontWeight: 500 }}>Member Since</dt>
                  <dd style={{ color: '#0f172a' }}>{date(empData.joinedAt)}</dd>
                </>
              )}
            </dl>

            <div
              style={{
                fontSize: 11,
                color: '#4b7a59',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                marginTop: 16,
              }}
            >
              <CheckCircle2 size={14} />
              <span>
                Verified against employee registry on{' '}
                {empData.verifiedAt ? date(empData.verifiedAt) : new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        ) : isCustomerSearch && custData?.valid ? (
          <div
            style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: 8,
              padding: 24,
              color: '#166534',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <ShieldCheck size={32} style={{ color: '#16a34a' }} />
              <div>
                <h3 style={{ margin: 0, fontSize: 18, color: '#15803d' }}>
                  Official Allottee / Member Verified
                </h3>
                <small style={{ color: '#166534' }}>
                  Authentic registered customer & property owner
                </small>
              </div>
            </div>

            <dl
              style={{
                display: 'grid',
                gridTemplateColumns: '140px 1fr',
                gap: '8px 12px',
                fontSize: 13,
                margin: '16px 0',
                borderTop: '1px solid #dcfce7',
                paddingTop: 16,
              }}
            >
              <dt style={{ color: '#4b7a59', fontWeight: 500 }}>Customer Code</dt>
              <dd style={{ fontWeight: 700, color: '#0f172a' }}>{custData.customerCode}</dd>

              <dt style={{ color: '#4b7a59', fontWeight: 500 }}>Allottee Name</dt>
              <dd style={{ fontWeight: 600, color: '#0f172a' }}>{custData.name}</dd>

              {custData.identityLast4 && (
                <>
                  <dt style={{ color: '#4b7a59', fontWeight: 500 }}>Identity Record</dt>
                  <dd style={{ fontWeight: 600, color: '#0f172a' }}>
                    •••• {custData.identityLast4} (Verified)
                  </dd>
                </>
              )}

              {custData.projectName && (
                <>
                  <dt style={{ color: '#4b7a59', fontWeight: 500 }}>Project</dt>
                  <dd style={{ color: '#0f172a' }}>{custData.projectName}</dd>
                </>
              )}

              {custData.activeBookings && custData.activeBookings.length > 0 && (
                <>
                  <dt style={{ color: '#4b7a59', fontWeight: 500 }}>Allotted Files</dt>
                  <dd style={{ color: '#0f172a' }}>{custData.activeBookings.join(' · ')}</dd>
                </>
              )}

              {custData.joinedAt && (
                <>
                  <dt style={{ color: '#4b7a59', fontWeight: 500 }}>Registered On</dt>
                  <dd style={{ color: '#0f172a' }}>{date(custData.joinedAt)}</dd>
                </>
              )}
            </dl>

            <div
              style={{
                fontSize: 11,
                color: '#4b7a59',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                marginTop: 16,
              }}
            >
              <CheckCircle2 size={14} />
              <span>
                Verified against customer registry on{' '}
                {custData.verifiedAt ? date(custData.verifiedAt) : new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        ) : fileData?.valid ? (
          <div
            style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: 8,
              padding: 24,
              color: '#166534',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <ShieldCheck size={32} style={{ color: '#16a34a' }} />
              <div>
                <h3 style={{ margin: 0, fontSize: 18, color: '#15803d' }}>
                  Official Record Verified
                </h3>
                <small style={{ color: '#166534' }}>
                  Authentic computerized property allotment file
                </small>
              </div>
            </div>

            <dl
              style={{
                display: 'grid',
                gridTemplateColumns: '140px 1fr',
                gap: '8px 12px',
                fontSize: 13,
                margin: '16px 0',
                borderTop: '1px solid #dcfce7',
                paddingTop: 16,
              }}
            >
              <dt style={{ color: '#4b7a59', fontWeight: 500 }}>Registration No.</dt>
              <dd style={{ fontWeight: 700, color: '#0f172a' }}>{fileData.reference}</dd>

              <dt style={{ color: '#4b7a59', fontWeight: 500 }}>Project</dt>
              <dd style={{ fontWeight: 600, color: '#0f172a' }}>{fileData.projectName}</dd>

              <dt style={{ color: '#4b7a59', fontWeight: 500 }}>Property / Unit</dt>
              <dd style={{ fontWeight: 600, color: '#0f172a' }}>
                Unit {fileData.propertyNumber} ({fileData.propertyType})
              </dd>

              <dt style={{ color: '#4b7a59', fontWeight: 500 }}>Area / Size</dt>
              <dd style={{ fontWeight: 600, color: '#0f172a' }}>{fileData.size}</dd>

              <dt style={{ color: '#4b7a59', fontWeight: 500 }}>Location</dt>
              <dd style={{ fontWeight: 600, color: '#0f172a' }}>
                {[fileData.phase, fileData.block, fileData.tower, fileData.floor]
                  .filter(Boolean)
                  .join(' · ') || 'Assigned'}
              </dd>

              <dt style={{ color: '#4b7a59', fontWeight: 500 }}>Total Agreed Price</dt>
              <dd style={{ fontWeight: 700, color: '#0f172a' }}>
                {money(fileData.total, fileData.currency)}
              </dd>

              <dt style={{ color: '#4b7a59', fontWeight: 500 }}>Registered Member</dt>
              <dd style={{ fontWeight: 600, color: '#0f172a' }}>
                {fileData.customerName}{' '}
                {fileData.customerIdentityLast4 && (
                  <span style={{ fontSize: 11, color: '#64748b' }}>
                    (Identity ending in {fileData.customerIdentityLast4})
                  </span>
                )}
              </dd>

              <dt style={{ color: '#4b7a59', fontWeight: 500 }}>Status</dt>
              <dd style={{ fontWeight: 700, color: '#16a34a' }}>{fileData.status}</dd>

              {fileData.confirmedAt && (
                <>
                  <dt style={{ color: '#4b7a59', fontWeight: 500 }}>Allotment Date</dt>
                  <dd style={{ color: '#0f172a' }}>{date(fileData.confirmedAt)}</dd>
                </>
              )}
            </dl>

            <div
              style={{
                fontSize: 11,
                color: '#4b7a59',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                marginTop: 16,
              }}
            >
              <CheckCircle2 size={14} />
              <span>
                Verified against property ledger on{' '}
                {fileData.verifiedAt ? date(fileData.verifiedAt) : new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        ) : activeLookup ? (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 8,
              padding: 24,
              color: '#991b1b',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <ShieldAlert size={32} style={{ color: '#dc2626' }} />
              <div>
                <h3 style={{ margin: 0, fontSize: 16, color: '#dc2626' }}>No Record Found</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: 13 }}>
                  The identifier &ldquo;{activeLookup}&rdquo; could not be verified in the official
                  ledger. Check the number and try again.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: '#64748b' }}>
            <Building2 size={40} style={{ margin: '0 auto 12px auto', opacity: 0.6 }} />
            <p style={{ margin: 0, fontSize: 14 }}>
              Scan the QR code printed on the official property file, employee ID pass, or customer
              member card, or enter the reference number above to verify record authenticity.
            </p>
          </div>
        )}

        <footer style={{ marginTop: 24, textAlign: 'center' }}>
          <Link
            to="/login"
            style={{
              fontSize: 12,
              color: 'var(--primary)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span>Staff / Customer Login</span>
            <ArrowRight size={13} />
          </Link>
        </footer>
      </div>
    </div>
  );
}
