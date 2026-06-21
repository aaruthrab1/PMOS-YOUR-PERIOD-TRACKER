import { Calendar, Droplets, AlertCircle, Heart, Scale } from 'lucide-react';
import { Card } from '@/components/ui';
import type { ReportSections, ReportSourceSnapshot } from '@/lib/reports';

interface ReportSummarySectionsProps {
  sections: ReportSections | null;
  snapshot: ReportSourceSnapshot | null;
  narrativeSummary: string | null;
}

const SECTION_META = [
  { key: 'cyclePatternSummary' as const, title: 'Cycle pattern summary', icon: Calendar, color: 'text-cycle-500' },
  { key: 'symptomTrends' as const, title: 'Symptom trends', icon: AlertCircle, color: 'text-brand-500' },
  { key: 'sleepEnergyTrends' as const, title: 'Sleep & energy trends', icon: Droplets, color: 'text-brand-400' },
  { key: 'moodTrends' as const, title: 'Mood trends', icon: Heart, color: 'text-cycle-400' },
  { key: 'weightTrends' as const, title: 'Weight trends', icon: Scale, color: 'text-wellness-500' },
] as const;

export function ReportSummarySections({ sections, snapshot, narrativeSummary }: ReportSummarySectionsProps) {
  if (!sections) {
    return (
      <Card>
        <p className="text-caption text-ink-secondary whitespace-pre-wrap">{narrativeSummary ?? 'No summary available.'}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {SECTION_META.map(({ key, title, icon: Icon, color }) => {
        const items = sections[key];
        if (!items?.length) return null;
        return (
          <Card key={key}>
            <div className="mb-3 flex items-center gap-2">
              <Icon className={`h-5 w-5 ${color}`} aria-hidden="true" />
              <p className="section-label !mb-0">{title}</p>
            </div>
            <ul className="space-y-2">
              {items.map((item) => (
                <li key={item} className="flex gap-2 text-caption text-ink-secondary leading-relaxed">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-300" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        );
      })}

      {sections.discussionPoints.length > 0 && (
        <Card className="border-border">
          <p className="section-label mb-3">Discussion points for your visit</p>
          <ol className="space-y-2.5">
            {sections.discussionPoints.map((point, i) => (
              <li key={point} className="flex gap-3 text-caption text-ink-secondary">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500 text-micro font-bold text-white">
                  {i + 1}
                </span>
                {point}
              </li>
            ))}
          </ol>
        </Card>
      )}

      {sections.suggestedTests.length > 0 && (
        <Card>
          <p className="section-label mb-3">Suggested tests to discuss</p>
          <ul className="space-y-3">
            {sections.suggestedTests.map((test) => (
              <li key={test.name} className="rounded-2xl bg-surface-secondary px-4 py-3">
                <p className="text-caption font-medium text-ink">{test.name}</p>
                <p className="mt-0.5 text-micro text-ink-secondary">{test.reason}</p>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-micro text-ink-muted">
            These are conversation starters — your doctor will decide what is appropriate for you.
          </p>
        </Card>
      )}

      {snapshot?.periodLogs.length ? (
        <Card>
          <p className="section-label mb-3">Cycle history</p>
          <div className="overflow-x-auto">
            <table className="w-full text-caption">
              <thead>
                <tr className="border-b border-border/60 text-left text-micro text-ink-tertiary">
                  <th className="pb-2 pr-3 font-medium">Start</th>
                  <th className="pb-2 pr-3 font-medium">End</th>
                  <th className="pb-2 pr-3 font-medium">Flow</th>
                  <th className="pb-2 pr-3 font-medium">Cycle</th>
                  <th className="pb-2 font-medium">Pain</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.periodLogs.slice(0, 8).map((p) => (
                  <tr key={p.start} className="border-b border-border/30 text-ink-secondary">
                    <td className="py-2 pr-3">{p.start}</td>
                    <td className="py-2 pr-3">{p.end ?? '—'}</td>
                    <td className="py-2 pr-3 capitalize">{p.flow ?? '—'}</td>
                    <td className="py-2 pr-3">{p.cycleLength != null ? `${p.cycleLength}d` : '—'}</td>
                    <td className="py-2">{p.painLevel != null ? `${p.painLevel}/10` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
