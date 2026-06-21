import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { getProfile } from '@/lib/db/profiles';
import { getPostAuthRoute } from '@/lib/navigation';
import { friendlyAuthError } from '@/lib/userMessages';
import { LoadingScreen, Button } from '@/components/ui';

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const queryParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const errorDescription = hashParams.get('error_description') || queryParams.get('error_description');

        if (errorDescription) throw new Error(friendlyAuthError(errorDescription));

        const isRecovery =
          hashParams.get('type') === 'recovery' || queryParams.get('type') === 'recovery';

        const code = queryParams.get('code');
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        } else {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) throw sessionError;
          if (!session) throw new Error('Your sign-in link expired. Please try again.');
        }

        if (isRecovery) {
          navigate('/reset-password', { replace: true });
          return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        const profile = await getProfile().catch(() => null);
        navigate(getPostAuthRoute(profile, user), { replace: true });
      } catch (err) {
        setError(friendlyAuthError(err instanceof Error ? err.message : 'Authentication failed'));
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <p className="text-caption text-ink-secondary" role="alert">{error}</p>
        <Button className="mt-6" onClick={() => navigate('/login', { replace: true })}>
          Back to sign in
        </Button>
      </div>
    );
  }

  return <LoadingScreen message="Signing you in..." />;
}
