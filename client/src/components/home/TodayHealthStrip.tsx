import { Link } from 'react-router-dom';
import { Moon, Smile, Zap, Droplets, ChevronRight } from 'lucide-react';
import { usePersonalization } from '@/contexts/PersonalizationContext';
import { moodDisplayLabel } from '@/lib/dashboard/suggestedActions';
import { cn } from '@/lib/tokens';

interface TodayHealthStripProps {
  todayMood?: { mood: string; energy_level: number | null } | null;
  todaySleep?: { sleep_hours: number | null } | null;
  cycleDay: number | null;
  cyclePhase?: string;
  hasCycleData: boolean;
}

export function TodayHealthStrip({
  todayMood,
  todaySleep,
  cycleDay,
  cyclePhase,
  hasCycleData,
}: TodayHealthStripProps) {
  const { t } = usePersonalization();

  const metrics = [
    {
      id: 'sleep',
      icon: Moon,
      label: t('checkin.sleep'),
      value: todaySleep?.sleep_hours != null ? `${todaySleep.sleep_hours}h` : null,
      href: '/tracker?tab=sleep',
    },
    {
      id: 'mood',
      icon: Smile,
      label: t('checkin.mood'),
      value: todayMood?.mood ? moodDisplayLabel(todayMood.mood) : null,
      href: '/tracker?tab=mood',
    },
    {
      id: 'energy',
      icon: Zap,
      label: t('checkin.energy'),
      value: todayMood?.energy_level != null ? `${todayMood.energy_level}/10` : null,
      href: '/tracker?tab=mood',
    },
    {
      id: 'cycle',
      icon: Droplets,
      label: t('dashboard.cycleDay'),
      value: hasCycleData && cycleDay != null ? `${cycleDay}` : null,
      sub: hasCycleData ? cyclePhase : null,
      href: '/tracker',
    },
  ];

  return (
    <section aria-labelledby="today-snapshot-heading">
      <div className="home-section-head">
        <h2 id="today-snapshot-heading" className="home-section-title">
          {t('dashboard.snapshot')}
        </h2>
        <Link to="/tracker" className="home-section-link">
          {t('dashboard.quickLog')}
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
      <div className="home-metric-strip">
        {metrics.map(({ id, icon: Icon, label, value, sub, href }) => (
          <Link key={id} to={href} className="home-metric-cell">
            <div className={cn('home-metric-icon', value && 'home-metric-icon--logged')}>
              <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            </div>
            <p className="home-metric-label">{label}</p>
            <p className={cn('home-metric-value', !value && 'home-metric-value--empty')}>
              {value ?? t('checkin.tapToLog')}
            </p>
            {sub && <p className="home-metric-sub">{sub}</p>}
          </Link>
        ))}
      </div>
    </section>
  );
}
