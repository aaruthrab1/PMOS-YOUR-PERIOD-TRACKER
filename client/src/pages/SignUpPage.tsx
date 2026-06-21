import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Input, Alert } from '@/components/ui';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';
import { AuthLayout, CyraLogo } from '@/components/layout/AppLayout';
import { AuthLanguageBar } from '@/components/auth/AuthLanguageBar';
import { getPostAuthRoute } from '@/lib/navigation';
import { validateEmail, validatePassword, validateRequired } from '@/lib/validation';
import { friendlyAuthError } from '@/lib/userMessages';
import { usePageTitle } from '@/hooks/usePageTitle';

export function SignUpPage() {
  usePageTitle('Create account');
  const { signUp, signInWithGoogle, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const nameErr = validateRequired(fullName, 'Full name');
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    setFieldErrors({
      name: nameErr ?? undefined,
      email: emailErr ?? undefined,
      password: passwordErr ?? undefined,
    });
    if (nameErr || emailErr || passwordErr) return;

    setLoading(true);
    try {
      const result = await signUp(email.trim(), password, fullName.trim());
      if (result.needsEmailConfirmation) {
        setEmailSent(true);
        return;
      }
      const profile = await refreshProfile();
      navigate(getPostAuthRoute(profile, result.user));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create account';
      setError(friendlyAuthError(message));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(friendlyAuthError(err instanceof Error ? err.message : 'Google sign-up failed'));
      setGoogleLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthLanguageBar />
      <div className="flex flex-1 flex-col justify-center py-12">
        <div className="mb-10">
          <CyraLogo size="lg" />
          <h1 className="mt-8 font-display text-display-sm text-ink">Create your account</h1>
          <p className="mt-2 text-body text-ink-secondary">Start understanding your health today</p>
        </div>

        {emailSent ? (
          <div className="rounded-2xl border border-border-strong bg-surface-elevated p-6 text-center animate-scale-in">
            <Mail className="mx-auto h-10 w-10 text-brand-500 mb-3" aria-hidden="true" />
            <h2 className="font-display text-title text-ink">Check your inbox</h2>
            <p className="mt-2 text-caption text-ink-secondary leading-relaxed">
              We sent a confirmation link to <strong className="text-ink">{email}</strong>. Open it to activate your account, then sign in.
            </p>
            <Link to="/login" className="mt-5 inline-block">
              <Button size="sm">Go to sign in</Button>
            </Link>
          </div>
        ) : (
        <>
        <GoogleAuthButton onClick={handleGoogle} loading={googleLoading} label="Sign up with Google" />

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-micro text-ink-tertiary">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {error && <Alert variant="error">{error}</Alert>}
          <Input
            label="Full name"
            type="text"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (fieldErrors.name) setFieldErrors((f) => ({ ...f, name: undefined }));
            }}
            icon={<User className="h-[18px] w-[18px]" />}
            autoComplete="name"
            error={fieldErrors.name}
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) setFieldErrors((f) => ({ ...f, email: undefined }));
            }}
            icon={<Mail className="h-[18px] w-[18px]" />}
            autoComplete="email"
            inputMode="email"
            error={fieldErrors.email}
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) setFieldErrors((f) => ({ ...f, password: undefined }));
            }}
            icon={<Lock className="h-[18px] w-[18px]" />}
            hint="At least 8 characters"
            autoComplete="new-password"
            error={fieldErrors.password}
          />
          <Button type="submit" loading={loading} fullWidth size="lg" className="!mt-6">
            Create account
          </Button>
        </form>

        <p className="mt-4 text-center text-micro text-ink-muted">
          By signing up, you agree Cyra provides educational support only — not medical advice.
        </p>

        <p className="mt-6 text-center text-caption text-ink-secondary">
          Already have an account?{' '}
          <Link to="/login" className="link-brand">Sign in</Link>
        </p>
        </>
        )}
      </div>
    </AuthLayout>
  );
}
