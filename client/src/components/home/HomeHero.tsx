import { Link } from 'react-router-dom';
import { Avatar } from '@/components/ui';
import { usePersonalization } from '@/contexts/PersonalizationContext';
import type { CyraLanguageCode } from '@/lib/personalization';
import type { CycleForecast } from '@/lib/dashboard/cycleForecast';
import type { HealthSnapshot } from '@/lib/dashboard/healthSnapshot';
import { cn } from '@/lib/tokens';

function intlLocale(code: CyraLanguageCode): string {
  return code === 'en' ? 'en-US' : `${code}-IN`;
}

interface HomeHeroProps {
  name?: string | null;
  avatarUrl?: string | null;
  cycle: CycleForecast;
  health: HealthSnapshot;
}

export function HomeHero({ name, avatarUrl, cycle, health }: HomeHeroProps) {
  const { t, language } = usePersonalization();
  const firstName = name?.split(' ')[0] || t('dashboard.there');
  const h = new Date().getHours();
  const greeting =
    h < 12 ? t('dashboard.greeting.morning') : h < 17 ? t('dashboard.greeting.afternoon') : t('dashboard.greeting.evening');
  const today = new Intl.DateTimeFormat(intlLocale(language), {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <header>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-micro text-ink-muted">{today}</p>
          <h1 className="mt-1 font-display text-display-sm text-ink tracking-tight">
            {greeting}, {firstName}
          </h1>
          {health.hasData && (
            <p className="mt-2 text-caption text-ink-secondary">
              {health.riskLabel}
              <span className="mx-1.5 text-ink-muted">·</span>
              <span className="tabular-nums">{health.score}</span>
              <span className="text-ink-muted">/100</span>
            </p>
          )}
        </div>
        <Link to="/settings" aria-label={t('page.settings')} className="shrink-0">
          <Avatar name={name} src={avatarUrl} size="sm" />
        </Link>
      </div>

      <div className="home-cycle-strip mt-6">
        <CycleStat
          label={t('dashboard.cycleDay')}
          value={cycle.cycleDay != null ? String(cycle.cycleDay) : '—'}
          detail={cycle.hasData ? cycle.phase : t('dashboard.logPeriod')}
        />
        <div className="home-cycle-divider" aria-hidden="true" />
        <CycleStat
          label={t('dashboard.nextPeriod')}
          value={
            cycle.daysUntilNextPeriod != null
              ? cycle.daysUntilNextPeriod === 0
                ? t('common.today')
                : `${cycle.daysUntilNextPeriod}d`
              : '—'
          }
          detail={
            cycle.hasData && cycle.nextPeriodDate
              ? t('dashboard.confidence', { percent: cycle.confidence })
              : t('dashboard.predict')
          }
          highlight={cycle.daysUntilNextPeriod != null && cycle.daysUntilNextPeriod <= 3}
        />
      </div>

      {!cycle.hasData && (
        <Link to="/tracker" className="mt-3 inline-flex text-caption font-medium text-brand-500 hover:text-brand-600">
          {t('dashboard.logPeriodUnlock')} →
        </Link>
      )}
    </header>
  );
}

function CycleStat({
  label,
  value,
  detail,
  highlight,
}: {
  label: string;
  value: string;
  detail?: string;
  highlight?: boolean;
}) {
  return (
    <div className="min-w-0 flex-1 px-1">
      <p className="text-overline uppercase text-ink-muted">{label}</p>
      <p className={cn('mt-1 font-display text-title-lg tabular-nums', highlight ? 'text-cycle-500' : 'text-ink')}>
        {value}
      </p>
      {detail && <p className="mt-0.5 truncate text-micro text-ink-tertiary">{detail}</p>}
    </div>
  );
}
