import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Input, Alert } from '@/components/ui';
import { AuthLayout, CyraLogo } from '@/components/layout/AppLayout';
import { validatePassword, validatePasswordMatch } from '@/lib/validation';
import { friendlyAuthError } from '@/lib/userMessages';
import { usePageTitle } from '@/hooks/usePageTitle';

export function ResetPasswordPage() {
  usePageTitle('Set new password');
  const { updatePassword, signOut, session } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [passwordError, setPasswordError] = useState<string>();
  const [confirmError, setConfirmError] = useState<string>();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const pErr = validatePassword(password);
    const cErr = validatePasswordMatch(password, confirm);
    setPasswordError(pErr ?? undefined);
    setConfirmError(cErr ?? undefined);
    if (pErr || cErr) return;

    setLoading(true);
    try {
      await updatePassword(password);
      await signOut();
      navigate('/login', { replace: true, state: { message: 'Password updated. Please sign in with your new password.' } });
    } catch (err) {
      setError(friendlyAuthError(err instanceof Error ? err.message : 'Could not update password'));
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <AuthLayout>
        <div className="flex flex-1 flex-col justify-center py-12 page-enter text-center">
          <Alert variant="error">Your reset link has expired. Request a new one.</Alert>
          <Button className="mt-6" fullWidth onClick={() => navigate('/forgot-password', { replace: true })}>
            Request reset link
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="flex flex-1 flex-col justify-center py-12 page-enter">
        <button
          type="button"
          onClick={() => navigate('/login', { replace: true })}
          className="mb-8 inline-flex items-center gap-1.5 text-caption font-medium text-ink-secondary hover:text-ink transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to sign in
        </button>

        <CyraLogo size="lg" />
        <h1 className="mt-8 font-display text-display-sm text-ink">Set a new password</h1>
        <p className="mt-2 text-body text-ink-secondary">
          Choose a strong password for your Cyra account.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
          {error && <Alert variant="error">{error}</Alert>}
          <Input
            label="New password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (passwordError) setPasswordError(undefined);
            }}
            icon={<Lock className="h-[18px] w-[18px]" />}
            autoComplete="new-password"
            error={passwordError}
          />
          <Input
            label="Confirm password"
            type="password"
            value={confirm}
            onChange={(e) => {
              setConfirm(e.target.value);
              if (confirmError) setConfirmError(undefined);
            }}
            icon={<Lock className="h-[18px] w-[18px]" />}
            autoComplete="new-password"
            error={confirmError}
          />
          <Button type="submit" loading={loading} fullWidth size="lg">
            Update password
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}
