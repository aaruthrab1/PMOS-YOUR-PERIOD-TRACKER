import { Link } from 'react-router-dom';
import { Calendar, Droplets, Stethoscope, ChevronRight, MessageCircle, FileText, Activity } from 'lucide-react';
import { usePersonalization } from '@/contexts/PersonalizationContext';
import type { UpcomingHealthEvent } from '@/lib/dashboard/upcomingEvents';
import { cn } from '@/lib/tokens';

const ICONS = {
  period: Calendar,
  androgen: Droplets,
  doctor: Stethoscope,
};

interface HomeUpcomingProps {
  events: UpcomingHealthEvent[];
}

export function HomeUpcoming({ events }: HomeUpcomingProps) {
  const { t } = usePersonalization();
  if (events.length === 0) return null;

  return (
    <section aria-labelledby="upcoming-heading">
      <div className="home-section-head">
        <h2 id="upcoming-heading" className="home-section-title">
          {t('dashboard.upcoming')}
        </h2>
      </div>
      <ul className="space-y-2">
        {events.slice(0, 3).map((event) => {
          const Icon = ICONS[event.type];
          return (
            <li key={event.id}>
              <Link to={event.href} className="home-list-row">
                <div className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-tertiary',
                  event.type === 'period' ? 'text-cycle-500' : 'text-brand-500',
                )}>
                  <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-caption font-medium text-ink truncate">{event.title}</p>
                  <p className="text-micro text-ink-muted truncate">{event.subtitle}</p>
                </div>
                <span className="shrink-0 text-caption font-medium tabular-nums text-ink-secondary">
                  {event.daysUntil === 0 ? t('common.today') : event.daysUntil != null ? `${event.daysUntil}d` : '—'}
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

const QUICK = [
  { id: 'log', icon: Activity, labelKey: 'quickAction.logPeriod' as const, href: '/tracker' },
  { id: 'sakhi', icon: MessageCircle, labelKey: 'quickAction.talkSakhi' as const, href: '/chat' },
  { id: 'report', icon: FileText, labelKey: 'quickAction.generateReport' as const, href: '/reports' },
];

export function HomeQuickAccess() {
  const { t } = usePersonalization();

  return (
    <section aria-labelledby="quick-heading">
      <h2 id="quick-heading" className="home-section-title mb-3">
        {t('dashboard.quickActions')}
      </h2>
      <div className="grid grid-cols-3 gap-2">
        {QUICK.map(({ id, icon: Icon, labelKey, href }) => (
          <Link key={id} to={href} className="home-quick-tile">
            <Icon className="h-5 w-5 text-brand-500" strokeWidth={1.75} aria-hidden="true" />
            <span className="text-micro font-semibold text-ink text-center leading-tight">
              {t(labelKey)}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

