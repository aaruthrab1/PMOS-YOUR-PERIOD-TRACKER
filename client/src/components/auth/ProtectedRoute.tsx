import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { isOnboardingComplete } from '@/lib/auth/onboardingStatus';
import { isDemoMode } from '@/lib/demoMode';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { ConfigSetupPage } from '@/pages/ConfigSetupPage';

export function ProtectedRoute() {
  const { user, session, profile, loading, isConfigured } = useAuth();
  const location = useLocation();
  const demo = isDemoMode();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!demo) return;
    const t = window.setTimeout(() => setTimedOut(true), 600);
    return () => window.clearTimeout(t);
  }, [demo]);

  const showLoading = (loading && !user && (!demo || !timedOut));

  if (showLoading) return <LoadingScreen message="Loading your account..." />;

  if (!isConfigured && !demo) {
    return <ConfigSetupPage />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!demo && !session?.access_token) {
    return <Navigate to="/login" replace state={{ from: location.pathname, message: 'Session expired. Please sign in again.' }} />;
  }

  const onboardingComplete = isOnboardingComplete(profile, user);
  const onSetup = location.pathname === '/onboarding';
  const onQuiz = location.pathname === '/quiz';
  const retakeQuiz = new URLSearchParams(location.search).get('retake') === '1';
  const onResetPassword = location.pathname === '/reset-password';

  if (!onboardingComplete && !onSetup && !onQuiz && !onResetPassword) {
    return <Navigate to="/onboarding" replace />;
  }

  if (onboardingComplete && onSetup && !retakeQuiz) {
    return <Navigate to="/dashboard" replace />;
  }

  if (onboardingComplete && onQuiz && !retakeQuiz) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

/** Redirect authenticated users away from public auth pages */
export function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, session, profile, loading, isConfigured } = useAuth();

  // Demo mode: always show login/signup so judges can see auth UI
  if (isDemoMode()) return <>{children}</>;

  if (!isConfigured) return <>{children}</>;
  if (loading || !user || !session?.access_token) return <>{children}</>;

  const destination = isOnboardingComplete(profile, user) ? '/dashboard' : '/onboarding';
  return <Navigate to={destination} replace />;
}
