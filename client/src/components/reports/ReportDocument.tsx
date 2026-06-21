import type { ReactNode } from 'react';
import {
  User,
  Calendar,
  Moon,
  Heart,
  Droplets,
  Activity,
  Shield,
  MessageCircle,
  FlaskConical,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import { usePersonalization } from '@/contexts/PersonalizationContext';
import type { CyraDoctorReport } from '@/lib/reports';
import { buildClinicalReportView } from '@/lib/reports/buildClinicalReport';
import { ReportClinicalCharts } from './ReportClinicalCharts';
import { cn } from '@/lib/tokens';

interface ReportDocumentProps {
  report: CyraDoctorReport;
}

const SEVERITY_STYLE = {
  low: 'border-risk-low-border/40 bg-risk-low-bg/30',
  moderate: 'border-risk-moderate-border/40 bg-risk-moderate-bg/30',
  high: 'border-risk-high-border/40 bg-risk-high-bg/30',
};

export function ReportDocument({ report }: ReportDocumentProps) {
  const { t } = usePersonalization();
  const view = buildClinicalReportView(report);
  if (!view) {
    return (
      <Card>
        <p className="text-caption text-ink-secondary">{t('reports.regenerateHint')}</p>
      </Card>
    );
  }

  return (
    <article className="animate-slide-up space-y-6" aria-label={t('reports.clinicalReport')}>
      {/* Cover header */}
      <Card className="overflow-hidden !p-0">
        <div className="bg-brand-500 px-5 py-6 text-ink-inverse">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 font-display text-lg font-bold">
                C
              </div>
              <div>
                <p className="font-display text-title text-white">{t('reports.clinicalReport')}</p>
                <p className="text-micro text-white/80">{t('reports.preparedFor')}</p>
              </div>
            </div>
            <div className="text-right text-micro text-white/80">
              <p>{t('reports.generated')} {view.generatedOn}</p>
              <p className="mt-0.5">{view.reportPeriod}</p>
            </div>
          </div>
          <div className="mt-5 border-t border-white/20 pt-4">
            <p className="text-overline uppercase text-white/70 mb-1">{t('reports.patient')}</p>
            <p className="font-display text-display-sm text-white">{view.patientName}</p>
          </div>
        </div>
        <div className="px-5 py-4 bg-surface-secondary/40">
          <p className="text-overline uppercase text-ink-muted mb-2">{t('reports.healthSummary')}</p>
          <ul className="space-y-1.5">
            {view.healthSummary.map((line) => (
              <li key={line} className="text-caption text-ink-secondary leading-relaxed">{line}</li>
            ))}
          </ul>
        </div>
      </Card>

      <ReportSection icon={User} title={t('reports.profileSummary')} items={view.profileSummary} />

      <ReportSection icon={Calendar} title={t('reports.cycleAnalysis')} items={view.cycleAnalysis}>
        {view.snapshot.periodLogs.length > 0 && (
          <div className="mt-4 overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-caption">
              <thead>
                <tr className="border-b border-border bg-surface-secondary text-left text-micro text-ink-muted">
                  <th className="px-3 py-2 font-medium">Start</th>
                  <th className="px-3 py-2 font-medium">End</th>
                  <th className="px-3 py-2 font-medium">Flow</th>
                  <th className="px-3 py-2 font-medium">Cycle</th>
                  <th className="px-3 py-2 font-medium">Pain</th>
                  <th className="px-3 py-2 font-medium">Symptoms</th>
                </tr>
              </thead>
              <tbody>
                {view.snapshot.periodLogs.slice(0, 8).map((p) => (
                  <tr key={p.start} className="border-b border-border/50 text-ink-secondary">
                    <td className="px-3 py-2">{p.start}</td>
                    <td className="px-3 py-2">{p.end ?? '—'}</td>
                    <td className="px-3 py-2 capitalize">{p.flow ?? '—'}</td>
                    <td className="px-3 py-2">{p.cycleLength != null ? `${p.cycleLength}d` : '—'}</td>
                    <td className="px-3 py-2">{p.painLevel != null ? `${p.painLevel}/10` : '—'}</td>
                    <td className="px-3 py-2">{(p.symptoms ?? []).slice(0, 2).join(', ') || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ReportSection>

      <ReportSection icon={Moon} title={t('reports.sleepAnalysis')} items={view.sleepAnalysis} />
      <ReportSection icon={Heart} title={t('reports.moodAnalysis')} items={view.moodAnalysis} />
      <ReportSection icon={Droplets} title={t('reports.androgenAnalysis')} items={view.androgenAnalysis} />
      <ReportSection icon={Activity} title={t('reports.symptomHistory')} items={view.symptomHistory} />

      <section aria-labelledby="report-charts">
        <h3 id="report-charts" className="section-label mb-3">{t('reports.charts')}</h3>
        <ReportClinicalCharts charts={view.charts} />
      </section>

      {view.timeline.length > 0 && (
        <section aria-labelledby="report-timeline">
          <h3 id="report-timeline" className="section-label mb-3">{t('reports.timeline')}</h3>
          <Card className="!p-0 overflow-hidden">
            <ul className="divide-y divide-border">
              {view.timeline.map(({ date, summary }) => (
                <li key={date} className="flex gap-4 px-4 py-3">
                  <div className="flex shrink-0 items-center gap-1.5 w-24">
                    <Clock className="h-3.5 w-3.5 text-ink-muted" aria-hidden="true" />
                    <span className="text-micro font-medium text-ink-tertiary">{date}</span>
                  </div>
                  <p className="text-caption text-ink-secondary">{summary}</p>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      )}

      <section aria-labelledby="report-risks">
        <div className="mb-3 flex items-center gap-2">
          <Shield className="h-4 w-4 text-brand-500" aria-hidden="true" />
          <h3 id="report-risks" className="section-label !mb-0">{t('reports.riskPatterns')}</h3>
        </div>
        <ul className="space-y-2">
          {view.riskPatterns.map((r) => (
            <li
              key={r.concern}
              className={cn('rounded-xl border px-4 py-3', SEVERITY_STYLE[r.severity])}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 opacity-70" aria-hidden="true" />
                <p className="text-caption font-medium text-ink">{r.concern}</p>
                <Badge variant="outline" className="!text-[10px] capitalize ml-auto">{r.severity}</Badge>
              </div>
              <p className="mt-1 pl-6 text-micro text-ink-secondary">{r.note}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="report-questions">
        <div className="mb-3 flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-brand-500" aria-hidden="true" />
          <h3 id="report-questions" className="section-label !mb-0">{t('reports.questionsForDoctor')}</h3>
        </div>
        <Card>
          <ol className="space-y-2.5">
            {view.questionsForDoctor.map((q, i) => (
              <li key={q} className="flex gap-3 text-caption text-ink-secondary leading-relaxed">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-micro font-bold text-brand-500">
                  {i + 1}
                </span>
                {q}
              </li>
            ))}
          </ol>
        </Card>
      </section>

      <section aria-labelledby="report-tests">
        <div className="mb-3 flex items-center gap-2">
          <FlaskConical className="h-4 w-4 text-brand-500" aria-hidden="true" />
          <h3 id="report-tests" className="section-label !mb-0">{t('reports.recommendedTests')}</h3>
        </div>
        <ul className="space-y-2">
          {view.recommendedTests.map((test) => (
            <li key={test.name}>
              <Card className="!py-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-caption font-semibold text-ink">{test.name}</p>
                  {test.suggested && <Badge variant="brand" className="!text-[10px]">Discuss</Badge>}
                </div>
                <p className="mt-1 text-micro text-ink-secondary">{test.reason}</p>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <Card className="border-border bg-surface-secondary/50">
        <p className="text-micro text-ink-muted leading-relaxed">{t('reports.disclaimer')}</p>
      </Card>
    </article>
  );
}

function ReportSection({
  icon: Icon,
  title,
  items,
  children,
}: {
  icon: typeof User;
  title: string;
  items: string[];
  children?: ReactNode;
}) {
  return (
    <section aria-labelledby={title.replace(/\s/g, '-')}>
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-brand-500" aria-hidden="true" />
        <h3 id={title.replace(/\s/g, '-')} className="section-label !mb-0">{title}</h3>
      </div>
      <Card>
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item} className="flex gap-2 text-caption text-ink-secondary leading-relaxed">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
        {children}
      </Card>
    </section>
  );
}
