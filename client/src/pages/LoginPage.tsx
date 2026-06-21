import { useState, FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Input, Alert } from '@/components/ui';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';
import { AuthLayout, CyraLogo } from '@/components/layout/AppLayout';
import { getPostAuthRoute } from '@/lib/navigation';
import { validateEmail, validateRequired } from '@/lib/validation';
import { friendlyAuthError } from '@/lib/userMessages';
import { usePageTitle } from '@/hooks/usePageTitle';
import { AuthLanguageBar } from '@/components/auth/AuthLanguageBar';
import { supabase } from '@/lib/supabase';

export function LoginPage() {
  usePageTitle('Sign in');
  const { signIn, signInWithGoogle, refreshProfile, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = (location.state as { message?: string } | null)?.message;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const emailErr = validateEmail(email);
    const passwordErr = validateRequired(password, 'Password');
    setFieldErrors({ email: emailErr ?? undefined, password: passwordErr ?? undefined });
    if (emailErr || passwordErr) return;

    setLoading(true);
    try {
      await signIn(email.trim(), password);
      const profile = await refreshProfile();
      const { data: { user: signedInUser } } = await supabase.auth.getUser();
      navigate(getPostAuthRoute(profile, signedInUser ?? user));
    } catch (err) {
      setError(friendlyAuthError(err instanceof Error ? err.message : 'Something went wrong. Please try again.'));
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
      setError(friendlyAuthError(err instanceof Error ? err.message : 'Google sign-in failed'));
      setGoogleLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthLanguageBar />
      <div className="flex flex-1 flex-col justify-center py-12">
        <div className="mb-10">
          <CyraLogo size="lg" />
          <h1 className="mt-8 font-display text-display-sm text-ink">Welcome back</h1>
          <p className="mt-2 text-body text-ink-secondary">Sign in to continue your health journey</p>
        </div>

        <GoogleAuthButton onClick={handleGoogle} loading={googleLoading} />

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-micro text-ink-tertiary">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {successMessage && <Alert variant="success">{successMessage}</Alert>}
          {error && <Alert variant="error">{error}</Alert>}
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
            autoComplete="current-password"
            error={fieldErrors.password}
          />
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-micro font-medium link-brand">
              Forgot password?
            </Link>
          </div>
          <Button type="submit" loading={loading} fullWidth size="lg" className="!mt-4">
            Sign in
          </Button>
        </form>

        <p className="mt-8 text-center text-caption text-ink-secondary">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="link-brand">Create one</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
