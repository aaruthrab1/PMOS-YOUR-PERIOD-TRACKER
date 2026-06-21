import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { User, Session, Provider, AuthError } from '@supabase/supabase-js';
import { friendlyAuthError, friendlySaveError } from '@/lib/userMessages';
import { supabase, isSupabaseConfigured, AUTH_REDIRECT_URL } from '@/lib/supabase';
import { resolveAuthUser, logActiveSupabaseConfig } from '@/lib/auth/resolveSession';
import { isOnboardingComplete, logOnboardingState } from '@/lib/auth/onboardingStatus';
import { getProfile, getPreferences, ensureProfileRow } from '@/lib/db/profiles';
import { clearOfflineData } from '@/lib/offline/storage';
import { clearOnboardingCache } from '@/lib/onboarding/storage';
import { isDemoMode, clearDemoOnboarding, markDemoOnboardingComplete } from '@/lib/demoMode';
import type { Profile, ProfileUpdate, UserPreferences } from '@/types/supabase';

export interface SignUpResult {
  user: User;
  session: Session | null;
  needsEmailConfirmation: boolean;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  preferences: UserPreferences | null;
  loading: boolean;
  profileLoading: boolean;
  isConfigured: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<SignUpResult>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithOAuth: (provider: Provider) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  updateProfile: (updates: ProfileUpdate) => Promise<void>;
  refreshProfile: () => Promise<Profile | null>;
  applyOnboardingComplete: (savedProfile: Profile) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function formatAuthError(error: AuthError): string {
  return friendlyAuthError(error.message);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  const applyAuth = useCallback((nextUser: User | null, nextSession: Session | null) => {
    setUser(nextUser);
    setSession(nextSession);
    if (!nextUser) {
      setProfile(null);
      setPreferences(null);
    }
  }, []);

  const fetchProfile = useCallback(async (authUser?: User | null): Promise<Profile | null> => {
    setProfileLoading(true);
    try {
      const [profileData, prefsData] = await Promise.all([getProfile(), getPreferences()]);
      setProfile(profileData);
      setPreferences(prefsData);
      return profileData;
    } catch (err) {
      if (import.meta.env.DEV) console.error('[auth] profile fetch failed:', err);
      const { data: { user: fallbackUser } } = await supabase.auth.getUser();
      const activeUser = authUser ?? fallbackUser;
      if (isDemoMode() && activeUser) {
        const demoProfile: Profile = {
          id: activeUser.id,
          email: activeUser.email ?? '',
          full_name: (activeUser.user_metadata?.full_name as string) ?? null,
          avatar_url: null,
          date_of_birth: null,
          timezone: 'UTC',
          onboarding_completed: isOnboardingComplete(null, activeUser),
          health_goals: (activeUser.user_metadata?.health_goals as string[]) ?? [],
          conditions: [],
          auth_provider: null,
          locale: null,
          phone: null,
          age_range: (activeUser.user_metadata?.age_range as string) ?? null,
          region: (activeUser.user_metadata?.region as string) ?? null,
          cycle_regularity: (activeUser.user_metadata?.cycle_regularity as string) ?? null,
          energy_level: (activeUser.user_metadata?.energy_level as number) ?? null,
          common_symptoms: (activeUser.user_metadata?.common_symptoms as string[]) ?? [],
          last_period_date: (activeUser.user_metadata?.last_period_date as string) ?? null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setProfile(demoProfile);
        return demoProfile;
      }
      if (isOnboardingComplete(null, activeUser)) {
        const fallbackProfile: Profile = {
          id: activeUser!.id,
          email: activeUser!.email ?? '',
          full_name: (activeUser!.user_metadata?.full_name as string) ?? null,
          avatar_url: null,
          date_of_birth: null,
          timezone: 'UTC',
          onboarding_completed: true,
          health_goals: (activeUser!.user_metadata?.health_goals as string[]) ?? [],
          conditions: [],
          auth_provider: null,
          locale: null,
          phone: null,
          age_range: (activeUser!.user_metadata?.age_range as string) ?? null,
          region: (activeUser!.user_metadata?.region as string) ?? null,
          cycle_regularity: (activeUser!.user_metadata?.cycle_regularity as string) ?? null,
          energy_level: (activeUser!.user_metadata?.energy_level as number) ?? null,
          common_symptoms: (activeUser!.user_metadata?.common_symptoms as string[]) ?? [],
          last_period_date: (activeUser!.user_metadata?.last_period_date as string) ?? null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setProfile(fallbackProfile);
        return fallbackProfile;
      }
      setProfile(null);
      setPreferences(null);
      return null;
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    logActiveSupabaseConfig();

    if (!isSupabaseConfigured) {
      console.error('[auth] Supabase NOT configured — check client/.env VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
      setLoading(false);
      return;
    }

    const initTimeout = window.setTimeout(() => setLoading(false), isDemoMode() ? 1200 : 4000);

    const initAuth = async () => {
      try {
        if (isDemoMode()) {
          const { data: { session: s } } = await supabase.auth.getSession();
          applyAuth(s?.user ?? null, s);
          if (s?.user) {
            void ensureProfileRow(s.user).catch(() => {});
            void fetchProfile(s.user);
          }
        } else {
          const { user: u, session: s } = await resolveAuthUser();
          applyAuth(u, s);
          if (u) {
            void ensureProfileRow(u).catch(() => {});
            void fetchProfile(u);
          }
        }
      } catch {
        applyAuth(null, null);
      } finally {
        window.clearTimeout(initTimeout);
        setLoading(false);
      }
    };

    void initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === 'SIGNED_OUT') {
        applyAuth(null, null);
        setProfile(null);
        setPreferences(null);
        setLoading(false);
        return;
      }

      // Trust callback session — never await getUser() here (Supabase deadlock)
      if (s?.user) {
        applyAuth(s.user, s);
      }

      if (s?.user && event !== 'USER_UPDATED') {
        setTimeout(() => {
          void ensureProfileRow(s.user!).catch(() => {});
          void fetchProfile(s.user);
        }, 0);
      }

      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        setLoading(false);
      }
    });

    return () => {
      window.clearTimeout(initTimeout);
      subscription.unsubscribe();
    };
  }, [applyAuth, fetchProfile]);

  const signUp = async (email: string, password: string, fullName: string): Promise<SignUpResult> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: AUTH_REDIRECT_URL,
      },
    });

    if (error) throw new Error(formatAuthError(error));

    if (!data.user) {
      throw new Error('We couldn\'t create your account. Please try again.');
    }

    if (import.meta.env.DEV && data.session) {
      console.info('[auth] signUp success', data.user.id);
    }

    if (data.session) {
      applyAuth(data.user, data.session);
      await ensureProfileRow(data.user).catch(() => {});
      await fetchProfile();
    } else if (import.meta.env.DEV) {
      console.info('[auth] signUp awaiting email confirmation');
    }

    return {
      user: data.user,
      session: data.session,
      needsEmailConfirmation: !data.session,
    };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(formatAuthError(error));

    if (!data.user || !data.session) {
      throw new Error('Sign in failed. Please check your email and password.');
    }

    if (import.meta.env.DEV) {
      console.info('[auth] signIn success', data.user.id);
    }
    applyAuth(data.user, data.session);
    await ensureProfileRow(data.user).catch(() => {});
    await fetchProfile();
  };

  const signInWithOAuth = async (provider: Provider) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: AUTH_REDIRECT_URL,
        queryParams: provider === 'google' ? { access_type: 'offline', prompt: 'consent' } : undefined,
      },
    });
    if (error) throw new Error(formatAuthError(error));
  };

  const signInWithGoogle = () => signInWithOAuth('google');

  const signOut = async () => {
    await clearOfflineData();
    clearOnboardingCache();
    if (isDemoMode()) clearDemoOnboarding();
    const { error } = await supabase.auth.signOut();
    if (error && !isDemoMode()) throw new Error(formatAuthError(error));
    applyAuth(null, null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    });
    if (error) throw new Error(formatAuthError(error));
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw new Error(formatAuthError(error));
  };

  const updateProfile = async (updates: ProfileUpdate) => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) throw new Error('Please sign in to update your profile.');
    const { updateProfile: updateProfileDb } = await import('@/lib/db/profiles');
    try {
      await updateProfileDb(updates);
      await fetchProfile();
    } catch (err) {
      throw new Error(friendlySaveError(err instanceof Error ? err.message : 'Could not save profile'));
    }
  };

  const refreshProfile = async () => {
    const { user: u, session: s } = await resolveAuthUser();
    if (!u) return null;
    applyAuth(u, s);
    return fetchProfile(u);
  };

  /** Sync React state immediately after onboarding save — avoids redirect race with ProtectedRoute. */
  const applyOnboardingComplete = async (savedProfile: Profile) => {
    markDemoOnboardingComplete();
    try {
      await supabase.auth.refreshSession();
    } catch {
      /* demo continues */
    }
    const { data: { user: u } } = await supabase.auth.getUser();
    const { data: { session: s } } = await supabase.auth.getSession();
    const profileWithComplete: Profile = {
      ...savedProfile,
      onboarding_completed: true,
    };
    if (u) applyAuth(u, s);
    setProfile(profileWithComplete);
    setProfileLoading(false);
    try {
      await supabase.auth.updateUser({ data: { onboarding_completed: true } });
    } catch {
      /* local flag is enough in demo */
    }
    logOnboardingState('applyOnboardingComplete', u, profileWithComplete);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        preferences,
        loading,
        profileLoading,
        isConfigured: isSupabaseConfigured,
        signUp,
        signIn,
        signInWithGoogle,
        signInWithOAuth,
        signOut,
        resetPassword,
        updatePassword,
        updateProfile,
        refreshProfile,
        applyOnboardingComplete,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
