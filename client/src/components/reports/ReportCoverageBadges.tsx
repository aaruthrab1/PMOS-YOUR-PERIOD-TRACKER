import { Activity, Moon, Scale, Heart, Flame, Sparkles, ClipboardList } from 'lucide-react';
import { Badge } from '@/components/ui';
import type { ReportSourceSnapshot } from '@/lib/reports';

interface ReportCoverageBadgesProps {
  snapshot: ReportSourceSnapshot | null;
}

const SOURCES = [
  { key: 'periods' as const, label: 'Periods', icon: Activity },
  { key: 'sleep' as const, label: 'Sleep', icon: Moon },
  { key: 'moods' as const, label: 'Mood', icon: Heart },
  { key: 'weight' as const, label: 'Weight', icon: Scale },
  { key: 'metabolic' as const, label: 'Metabolic', icon: Flame },
  { key: 'androgen' as const, label: 'Androgen', icon: Sparkles },
  { key: 'quizzes' as const, label: 'Quiz', icon: ClipboardList },
];

export function ReportCoverageBadges({ snapshot }: ReportCoverageBadgesProps) {
  const coverage = snapshot?.dataCoverage;

  return (
    <div className="flex flex-wrap gap-2">
      {SOURCES.map(({ key, label, icon: Icon }) => {
        const count = coverage?.[key] ?? 0;
        return (
          <Badge
            key={key}
            variant={count > 0 ? 'wellness' : 'outline'}
            className="gap-1 !text-micro"
          >
            <Icon className="h-3 w-3" aria-hidden="true" />
            {label}
            {count > 0 && <span className="opacity-70">({count})</span>}
          </Badge>
        );
      })}
    </div>
  );
}
