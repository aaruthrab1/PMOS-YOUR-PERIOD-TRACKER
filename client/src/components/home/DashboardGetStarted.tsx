import { Link } from 'react-router-dom';
import { Activity, MessageCircle, FileText, ChevronRight } from 'lucide-react';
import { usePersonalization } from '@/contexts/PersonalizationContext';

interface DashboardGetStartedProps {
  show: boolean;
}

export function DashboardGetStarted({ show }: DashboardGetStartedProps) {
  const { t } = usePersonalization();
  if (!show) return null;

  const steps = [
    { icon: Activity, label: t('dashboard.nextStepTrack'), href: '/tracker' },
    { icon: MessageCircle, label: t('dashboard.nextStepChat'), href: '/chat' },
    { icon: FileText, label: t('dashboard.nextStepReport'), href: '/reports' },
  ];

  return (
    <section
      aria-labelledby="get-started-heading"
      className="rounded-3xl border border-brand-500/20 bg-gradient-to-br from-brand-50/80 to-surface p-5 shadow-card"
    >
      <h2 id="get-started-heading" className="font-display text-title text-ink">
        {t('dashboard.nextSteps')}
      </h2>
      <ul className="mt-4 space-y-2">
        {steps.map(({ icon: Icon, label, href }) => (
          <li key={href}>
            <Link
              to={href}
              className="flex items-center gap-3 rounded-2xl bg-surface/90 px-4 py-3.5 transition-colors hover:bg-surface-elevated"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
                <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
              </div>
              <span className="flex-1 text-caption font-medium text-ink">{label}</span>
              <ChevronRight className="h-4 w-4 text-ink-muted" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
