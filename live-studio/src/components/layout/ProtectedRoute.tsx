import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Spinner } from '@/components/ui/Feedback';

export function ProtectedRoute() {
  const { session, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Spinner label="Checking session…" />;
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return <Outlet />;
}

/** Redirects signed-in users away from login / signup. */
export function GuestRoute() {
  const { session, loading } = useAuth();
  if (loading) return <Spinner label="Checking session…" />;
  if (session) return <Navigate to="/app" replace />;
  return <Outlet />;
}
