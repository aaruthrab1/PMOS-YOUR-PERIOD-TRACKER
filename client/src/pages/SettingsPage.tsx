import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Monitor, LogOut, Shield, ChevronRight, Droplets, ClipboardList, Minus, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePersonalization } from '@/contexts/PersonalizationContext';
import { useTheme } from '@/contexts/ThemeContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, Button, Input, Avatar, Alert } from '@/components/ui';
import { LanguageSelector, SimpleLanguageSwitch, RegionSelector } from '@/components/settings/PersonalizationSettings';
import { updatePreferences } from '@/lib/db/profiles';
import { cn } from '@/lib/tokens';
import { friendlySaveError } from '@/lib/userMessages';
import { Link } from 'react-router-dom';
import { useLocalizedPageTitle } from '@/hooks/useLocalizedPageTitle';

export function SettingsPage() {
  useLocalizedPageTitle('page.settings');
  const { profile, preferences, signOut, updateProfile, refreshProfile } = useAuth();
  const { t } = usePersonalization();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [cycleLength, setCycleLength] = useState(preferences?.cycle_length_avg ?? 28);
  const [periodLength, setPeriodLength] = useState(preferences?.period_length_avg ?? 5);
  const [prefsSaving, setPrefsSaving] = useState(false);
  const [prefsMessage, setPrefsMessage] = useState('');

  useEffect(() => {
    setCycleLength(preferences?.cycle_length_avg ?? 28);
    setPeriodLength(preferences?.period_length_avg ?? 5);
  }, [preferences?.cycle_length_avg, preferences?.period_length_avg]);

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);
    try {
      await updateProfile({ full_name: fullName });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      setSaveError(friendlySaveError(err instanceof Error ? err.message : 'Could not save profile'));
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const adjustCycle = (field: 'cycle' | 'period', delta: number) => {
    if (field === 'cycle') setCycleLength((v) => Math.min(45, Math.max(21, v + delta)));
    else setPeriodLength((v) => Math.min(10, Math.max(2, v + delta)));
  };

  const handleSaveCyclePrefs = async () => {
    setPrefsSaving(true);
    setPrefsMessage('');
    try {
      await updatePreferences({
        cycle_length_avg: cycleLength,
        period_length_avg: periodLength,
      });
      await refreshProfile();
      setPrefsMessage('saved');
      setTimeout(() => setPrefsMessage(''), 2500);
    } catch (err) {
      setPrefsMessage(friendlySaveError(err instanceof Error ? err.message : 'Could not save'));
    } finally {
      setPrefsSaving(false);
    }
  };

  const themeOptions = [
    { value: 'light' as const, icon: Sun, label: 'Light' },
    { value: 'dark' as const, icon: Moon, label: 'Dark' },
    { value: 'system' as const, icon: Monitor, label: 'Auto' },
  ];

  const menuItems = [
    { to: '/androgen', icon: Droplets, label: 'Androgen intelligence', desc: 'Hair, skin & hormone patterns' },
    { to: '/quiz?retake=1', icon: ClipboardList, label: 'Retake health quiz', desc: 'Update your health snapshot' },
    { to: '/reports', icon: Shield, label: 'Doctor reports', desc: 'Visit summaries' },
  ];

  return (
    <div className="page-container page-enter">
      <PageHeader title={t('settings.title')} subtitle={t('settings.subtitle')} />

      <Card className="mb-6">
        <div className="flex items-center gap-4 mb-5">
          <Avatar name={profile?.full_name} src={profile?.avatar_url} size="lg" />
          <div>
            <p className="font-display text-title text-ink">{profile?.full_name || 'Your profile'}</p>
            <p className="text-caption text-ink-secondary">{profile?.email}</p>
          </div>
        </div>
        <Input label="Display name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        {saveError && (
          <Alert variant="error" className="mt-3">{saveError}</Alert>
        )}
        {saveSuccess && (
          <Alert variant="success" className="mt-3">{t('settings.saved')}</Alert>
        )}
        <Button onClick={handleSave} loading={saving} size="sm" className="mt-4">{t('settings.save')}</Button>
      </Card>

      <section className="mb-6 space-y-4">
        <p className="section-label">{t('settings.language')}</p>
        <LanguageSelector />
        <SimpleLanguageSwitch />
        <RegionSelector />
      </section>

      <section className="mb-6">
        <p className="section-label mb-3">{t('settings.appearance')}</p>
        <Card>
          <div className="grid grid-cols-3 gap-2">
            {themeOptions.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setTheme(value)}
                aria-pressed={theme === value}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-2xl py-4 transition-all duration-200',
                  theme === value
                    ? 'bg-surface-elevated ring-1 ring-border-strong'
                    : 'hover:bg-surface-tertiary',
                )}
              >
                <Icon className={cn('h-5 w-5', theme === value ? 'text-brand-400' : 'text-ink-tertiary')} strokeWidth={1.75} />
                <span className="text-micro font-medium text-ink-secondary">{label}</span>
              </button>
            ))}
          </div>
        </Card>
      </section>

      <section className="mb-6">
        <p className="section-label mb-3">{t('settings.cyclePrefs')}</p>
        <Card className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <CycleStepper
              label={t('settings.cycleLength')}
              value={cycleLength}
              unit="days"
              onDecrease={() => adjustCycle('cycle', -1)}
              onIncrease={() => adjustCycle('cycle', 1)}
            />
            <CycleStepper
              label={t('settings.periodLength')}
              value={periodLength}
              unit="days"
              onDecrease={() => adjustCycle('period', -1)}
              onIncrease={() => adjustCycle('period', 1)}
            />
          </div>
          {prefsMessage && (
            <Alert
              variant={prefsMessage === 'saved' ? 'success' : 'error'}
              className="mt-2"
            >
              {prefsMessage === 'saved' ? t('settings.saved') : prefsMessage}
            </Alert>
          )}
          <Button size="sm" loading={prefsSaving} onClick={handleSaveCyclePrefs}>
            {t('settings.save')}
          </Button>
        </Card>
      </section>

      <section className="mb-6">
        <p className="section-label mb-3">{t('settings.healthTools')}</p>
        <Card className="!p-0 divide-y divide-surface-tertiary">
          {menuItems.map(({ to, icon: Icon, label, desc }) => (
            <Link key={to} to={to} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-secondary">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-secondary">
                <Icon className="h-5 w-5 text-ink-secondary" strokeWidth={1.75} />
              </div>
              <div className="flex-1">
                <p className="text-caption font-medium text-ink">{label}</p>
                <p className="text-micro text-ink-tertiary">{desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-ink-muted" />
            </Link>
          ))}
        </Card>
      </section>

      <Card className="mb-6">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 flex-shrink-0 text-wellness-500" strokeWidth={1.75} />
          <div>
            <p className="text-caption font-medium text-ink">{t('settings.privacy')}</p>
            <p className="mt-1 text-micro text-ink-secondary leading-relaxed">
              Your health data is encrypted and never sold. Notifications are {preferences?.notifications_enabled ? 'on' : 'off'}.
            </p>
          </div>
        </div>
      </Card>

      <Button variant="secondary" onClick={handleSignOut} fullWidth>
        <LogOut className="h-4 w-4" /> {t('settings.signOut')}
      </Button>
    </div>
  );
}

function CycleStepper({
  label,
  value,
  unit,
  onDecrease,
  onIncrease,
}: {
  label: string;
  value: number;
  unit: string;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  return (
    <div>
      <p className="text-micro text-ink-tertiary">{label}</p>
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={onDecrease}
          aria-label={`Decrease ${label}`}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-secondary text-ink-secondary hover:bg-surface-tertiary"
        >
          <Minus className="h-4 w-4" />
        </button>
        <p className="flex-1 text-center font-display text-title text-ink">
          {value} <span className="text-caption text-ink-secondary">{unit}</span>
        </p>
        <button
          type="button"
          onClick={onIncrease}
          aria-label={`Increase ${label}`}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-secondary text-ink-secondary hover:bg-surface-tertiary"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
