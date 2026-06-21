import { useState } from 'react';
import { FileText, Plus, Calendar, Trash2, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  Card,
  Button,
  Badge,
  EmptyState,
  SkeletonList,
  ErrorState,
  ConfirmDialog,
  GenerationOverlay,
} from '@/components/ui';
import { cn } from '@/lib/tokens';
import { useLocalizedPageTitle } from '@/hooks/useLocalizedPageTitle';
import { usePersonalization } from '@/contexts/PersonalizationContext';
import type { CyraLanguageCode } from '@/lib/personalization';
import { useDoctorReportGenerator } from '@/hooks/useDoctorReportGenerator';
import { ReportDocument, ReportDownloadBar, ReportCoverageBadges } from '@/components/reports';
import { parseSourceSnapshot } from '@/lib/reports';
import { friendlyLoadError } from '@/lib/userMessages';

function reportStatusLabel(status: string, t: (key: 'reports.statusDraft' | 'reports.statusShared') => string) {
  if (status === 'shared') return t('reports.statusShared');
  return t('reports.statusDraft');
}

function intlLocale(code: CyraLanguageCode): string {
  return code === 'en' ? 'en-US' : `${code}-IN`;
}

function formatDate(d: string, language: CyraLanguageCode) {
  return new Intl.DateTimeFormat(intlLocale(language), {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(d));
}

export function ReportsPage() {
  useLocalizedPageTitle('page.reports');
  const { t, language } = usePersonalization();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const {
    reports,
    selected,
    setSelectedId,
    loading,
    generating,
    error,
    datePresetDays,
    setDatePresetDays,
    datePresets,
    generate,
    deleteReport,
    markShared,
    refresh,
  } = useDoctorReportGenerator();

  const REPORT_STEPS = [
    t('reports.step.gathering'),
    t('reports.step.analyzing'),
    t('reports.step.androgen'),
    t('reports.step.formatting'),
  ];

  if (error && !loading && reports.length === 0) {
    return (
      <div className="page-container-wide">
        <ErrorState title={t('reports.loadFailed')} message={friendlyLoadError(error)} onRetry={refresh} />
      </div>
    );
  }

  const snapshot = selected ? parseSourceSnapshot(selected.source_snapshot) : null;

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await deleteReport(deleteTarget);
    setDeleting(false);
    setDeleteTarget(null);
  };

  return (
    <>
      <GenerationOverlay
        open={generating}
        title={t('reports.generating')}
        subtitle={t('reports.preparingDesc')}
        steps={REPORT_STEPS}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        title={t('reports.deleteTitle')}
        description={t('reports.deleteDesc')}
        confirmLabel={t('reports.deleteConfirm')}
        cancelLabel={t('reports.deleteCancel')}
        variant="danger"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
      <div className="page-container-wide pb-10 page-enter">
        <PageHeader
          title={t('reports.title')}
          subtitle={t('reports.subtitle')}
          action={
            <Button size="sm" onClick={generate} loading={generating} disabled={generating}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              {t('reports.generate')}
            </Button>
          }
        />

        <Card className="mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-500 text-ink-inverse">
                <Sparkles className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-caption font-semibold text-ink">{t('reports.professionalReport')}</p>
                <p className="text-micro text-ink-secondary mt-0.5">{t('reports.coverageHint')}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-micro text-ink-tertiary">{t('reports.periodLabel')}</span>
              {datePresets.map((preset) => (
                <button
                  key={preset.days}
                  type="button"
                  onClick={() => setDatePresetDays(preset.days)}
                  aria-pressed={datePresetDays === preset.days}
                  disabled={generating}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-micro font-medium transition-colors',
                    datePresetDays === preset.days
                      ? 'bg-brand-500 text-ink-inverse'
                      : 'bg-surface-secondary text-ink-secondary hover:bg-surface-tertiary',
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {error && reports.length > 0 && (
          <div className="mb-4 rounded-2xl bg-risk-high-bg px-4 py-3 text-caption text-risk-high" role="alert">
            {friendlyLoadError(error)}
          </div>
        )}

        {loading ? (
          <SkeletonList count={2} />
        ) : reports.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={t('reports.noReports')}
            description={t('reports.subtitle')}
            action={{ label: t('reports.generate'), onClick: generate }}
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="space-y-2 lg:col-span-2">
              <p className="section-label px-1">{t('reports.yourReports')}</p>
              {reports.map((report) => (
                <div key={report.id} className="relative">
                  <button
                    type="button"
                    onClick={() => setSelectedId(report.id)}
                    aria-current={selected?.id === report.id ? 'true' : undefined}
                    className={cn(
                      'w-full rounded-2xl border p-4 text-left transition-all pr-12',
                      selected?.id === report.id
                        ? 'border-brand-500/30 bg-surface ring-1 ring-brand-500/20'
                        : 'border-border bg-surface hover:border-border-strong',
                    )}
                  >
                    <p className="text-caption font-semibold text-ink line-clamp-2">{report.title}</p>
                    <div className="mt-1.5 flex items-center gap-1.5 text-micro text-ink-tertiary">
                      <Calendar className="h-3 w-3" aria-hidden="true" />
                      {formatDate(report.date_range_start, language)} — {formatDate(report.date_range_end, language)}
                    </div>
                    <Badge variant={report.status === 'shared' ? 'brand' : 'outline'} className="mt-2">
                      {reportStatusLabel(report.status, t)}
                    </Badge>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(report.id)}
                    disabled={generating}
                    className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-xl text-ink-muted hover:bg-risk-high-bg hover:text-risk-high"
                    aria-label={t('reports.deleteConfirm')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="lg:col-span-3">
              {selected ? (
                <div className="relative">
                  <ReportDownloadBar report={selected} onShare={markShared} />
                  <div className="mb-4">
                    <ReportCoverageBadges snapshot={snapshot} />
                  </div>
                  <ReportDocument report={selected} />
                </div>
              ) : (
                <Card className="flex h-48 items-center justify-center">
                  <p className="text-caption text-ink-tertiary">{t('reports.selectPreview')}</p>
                </Card>
              )}
            </div>
          </div>
        )}

        <p className="mt-8 text-center text-micro text-ink-muted">{t('reports.footerNote')}</p>
      </div>
    </>
  );
}
