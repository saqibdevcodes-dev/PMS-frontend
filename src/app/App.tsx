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
const BookingWizard = lazy(() => import('../features/bookings/BookingWizard'));
const Reports = lazy(() => import('../features/reports/Reports'));
const Documents = lazy(() => import('../features/documents/Documents'));
const Finance = lazy(() => import('../features/finance/Finance'));
const Profile = lazy(() => import('../features/admin/Profile'));
const Notifications = lazy(() => import('../features/admin/Notifications'));
const MyWork = lazy(() => import('../features/admin/MyWork'));
const Settings = lazy(() => import('../features/admin/Settings'));
class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="fatal-error">
        <EmptyState
          title="This screen needs a fresh start"
          description="Reload the workspace to recover. Your saved records remain on the server."
          action={<Button onClick={() => window.location.reload()}>Reload workspace</Button>}
        />
      </div>
    ) : (
      this.props.children
    );
  }
}
function AppRoutes() {
  useInitializeAuth();
  useNavigationGuard();
  const status = useAuth((s) => s.status);
  useAuth((s) => s.user);
  if (status === 'initializing') return <BrandedLoader />;
  return (
    <Suspense fallback={<BrandedLoader />}>
      <Routes>
        {['/login', '/forgot-password', '/reset-password'].map((path) => (
          <Route path={path} key={path} element={<AuthPage />} />
        ))}
        <Route element={status === 'authenticated' ? <Shell /> : <Navigate to="/login" replace />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/bookings/new" element={<BookingWizard />} />
          {resources.map((r) => (
            <Route
              path={'/' + r.slug}
              key={r.slug}
              element={<ResourcePage key={r.slug} slug={r.slug} />}
            />
          ))}
          <Route path="/reports" element={<Reports />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/my-work" element={<MyWork />} />
          <Route path="/settings" element={<Settings />} />
          <Route
            path="*"
            element={
              <EmptyState
                title="This page isn't in your portfolio"
                description="Check the address, or return to your overview."
                action={
                  <Button asChild>
                    <Link to="/dashboard">Back to overview</Link>
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
  { path: '*', element: <AppRoutes /> },
]);
export default function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}
