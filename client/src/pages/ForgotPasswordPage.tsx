import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Input, Alert } from '@/components/ui';
import { AuthLayout, CyraLogo } from '@/components/layout/AppLayout';
import { validateEmail } from '@/lib/validation';
import { friendlyAuthError } from '@/lib/userMessages';
import { usePageTitle } from '@/hooks/usePageTitle';

export function ForgotPasswordPage() {
  usePageTitle('Reset password');
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string>();
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const err = validateEmail(email);
    setEmailError(err ?? undefined);
    if (err) return;

    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError(friendlyAuthError(err instanceof Error ? err.message : 'Could not send reset email'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="flex flex-1 flex-col justify-center py-12 page-enter">
        <Link
          to="/login"
          className="mb-8 inline-flex items-center gap-1.5 text-caption font-medium text-ink-secondary hover:text-ink transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to sign in
        </Link>

        <CyraLogo size="lg" />
        <h1 className="mt-8 font-display text-display-sm text-ink">Reset your password</h1>
        <p className="mt-2 text-body text-ink-secondary">
          {sent
            ? 'Check your email for a link to reset your password.'
            : 'Enter your email and we will send you a reset link.'}
        </p>

        {sent ? (
          <div className="mt-8 space-y-4">
            <Alert variant="success" title="Email sent">
              If an account exists for {email}, you will receive a reset link shortly.
            </Alert>
            <Link to="/login" className="block">
              <Button fullWidth size="lg" variant="secondary">
                Return to sign in
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
            {error && <Alert variant="error">{error}</Alert>}
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError(undefined);
              }}
              icon={<Mail className="h-[18px] w-[18px]" />}
              autoComplete="email"
              inputMode="email"
              error={emailError}
            />
            <Button type="submit" loading={loading} fullWidth size="lg">
              Send reset link
            </Button>
          </form>
        )}
      </div>
    </AuthLayout>
  );
}
