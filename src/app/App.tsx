import { t, useLocale } from '../lib/i18n';
import { Component, Suspense, lazy, type ReactNode } from 'react';
import {
  createBrowserRouter,
  createHashRouter,
  RouterProvider,
  Routes,
  Route,
  Navigate,
  Link,
} from 'react-router-dom';
import { useNavigationGuard } from '../hooks/use-unsaved';
import { useInitializeAuth } from '../hooks/use-auth';
import { useAuth } from '../stores/auth';
import { authTransport } from '../platform/adapter';
import { resources } from '../features/resources/catalog';
import { BrandedLoader, Button, EmptyState } from '../components/ui';
const Shell = lazy(() => import('../components/layout/Shell'));
const AuthPage = lazy(() => import('../features/auth/AuthPage'));
const Dashboard = lazy(() => import('../features/dashboard/Dashboard'));
const ResourcePage = lazy(() => import('../features/resources/ResourcePage'));
const PaymentPlans = lazy(() => import('../features/bookings/PaymentPlans'));
const BookingWizard = lazy(() => import('../features/bookings/BookingWizard'));
const Reports = lazy(() => import('../features/reports/Reports'));
const Documents = lazy(() => import('../features/documents/Documents'));
const Profile = lazy(() => import('../features/admin/Profile'));
const Notifications = lazy(() => import('../features/admin/Notifications'));
const MyWork = lazy(() => import('../features/admin/MyWork'));
const Settings = lazy(() => import('../features/admin/Settings'));
const Portal = lazy(() => import('../features/portal/Portal'));
const Activation = lazy(() => import('../features/portal/Activation'));
const VerificationPage = lazy(() => import('../features/portal/VerificationPage'));
const EmployeeDetailPage = lazy(() => import('../features/admin/EmployeeDetailPage'));
const CustomerDetailPage = lazy(() => import('../features/crm/CustomerDetailPage'));
const MemberRegistrationPage = lazy(() => import('../features/crm/MemberRegistrationPage'));
const MemberLedgersPage = lazy(() => import('../features/crm/MemberLedgersPage'));
const MemberQrPage = lazy(() => import('../features/crm/MemberQrPage'));
function WorkspaceError() {
  useLocale();
  return (
    <div className="fatal-error" role="alert">
      <EmptyState
        title={t('This screen needs a fresh start')}
        description={t('Reload the workspace to recover. Your saved records remain on the server.')}
        action={<Button onClick={() => window.location.reload()}>{t('Reload workspace')}</Button>}
      />
    </div>
  );
}
class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <WorkspaceError /> : this.props.children;
  }
}
function AppRoutes() {
  useLocale();
  useInitializeAuth();
  useNavigationGuard();
  const status = useAuth((s) => s.status);
  const user = useAuth((s) => s.user);
  if (status === 'initializing') return <BrandedLoader />;
  return (
    <Suspense fallback={<BrandedLoader />}>
      <Routes>
        {['/login', '/portal/login', '/forgot-password', '/reset-password'].map((path) => (
          <Route path={path} key={path} element={<AuthPage />} />
        ))}
        <Route path="/portal/activate" element={<Activation />} />
        <Route path="/verify" element={<VerificationPage />} />
        <Route path="/verify/:ref" element={<VerificationPage />} />
        <Route
          path="/portal/*"
          element={
            status !== 'authenticated' ? (
              <Navigate to="/portal/login" replace />
            ) : user?.accountType === 'CUSTOMER' ? (
              <Portal />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />
        <Route
          element={
            status !== 'authenticated' ? (
              <Navigate to="/login" replace />
            ) : user?.accountType === 'CUSTOMER' ? (
              <Navigate to="/portal" replace />
            ) : (
              <Shell />
            )
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/bookings/new" element={<BookingWizard />} />
          <Route path="/payment-plans" element={<PaymentPlans />} />
          <Route path="/users/:id" element={<EmployeeDetailPage />} />
          <Route path="/employees/:id" element={<EmployeeDetailPage />} />
          <Route path="/customers/:id" element={<CustomerDetailPage />} />
          <Route path="/members/register" element={<MemberRegistrationPage />} />
          <Route path="/customers/register" element={<MemberRegistrationPage />} />
          <Route path="/members/ledgers" element={<MemberLedgersPage />} />
          <Route path="/customers/ledgers" element={<MemberLedgersPage />} />
          <Route path="/members/qr" element={<MemberQrPage />} />
          <Route path="/customers/qr" element={<MemberQrPage />} />
          {resources
            .filter((r) => r.slug !== 'payment-plans')
            .map((r) => (
              <Route
                path={'/' + r.slug}
                key={r.slug}
                element={<ResourcePage key={r.slug} slug={r.slug} />}
              />
            ))}
          <Route path="/reports" element={<Reports />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/my-work" element={<MyWork />} />
          <Route path="/settings" element={<Settings />} />
          <Route
            path="*"
            element={
              <EmptyState
                title={t("This page isn't in your portfolio")}
                description={t('Check the address, or return to your overview.')}
                action={
                  <Button asChild>
                    <Link to="/dashboard">{t('Back to overview')}</Link>
                  </Button>
                }
              />
            }
          />
        </Route>
      </Routes>
    </Suspense>
  );
}
const router = (authTransport.native ? createHashRouter : createBrowserRouter)([
  { path: '*', element: <AppRoutes />, errorElement: <WorkspaceError /> },
]);
export default function App() {
  useLocale();
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}
