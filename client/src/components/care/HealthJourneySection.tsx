import { useState } from 'react';
import {
  Check,
  ChevronDown,
  Circle,
  Copy,
  Download,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, Button, ProgressBar } from '@/components/ui';
import { useDiagnosisJourney } from '@/hooks/useDiagnosisJourney';
import { useDoctorPrep } from '@/hooks/useDoctorPrep';
import {
  generateJourneyChecklist,
  formatJourneyChecklistText,
} from '@/lib/care/journeyChecklists';
import type {
  JourneyChecklist,
  JourneyChecklistType,
  JourneyStepContent,
  JourneyStepId,
  JourneyStepState,
} from '@/lib/care/types';
import { cn } from '@/lib/tokens';

interface HealthJourneySectionProps {
  defaultExpanded?: JourneyStepId;
}

export function HealthJourneySection({ defaultExpanded }: HealthJourneySectionProps) {
  const journey = useDiagnosisJourney();
  const { document: prep, loading: prepLoading } = useDoctorPrep();
  const [expanded, setExpanded] = useState<JourneyStepId | null>(
    defaultExpanded ?? journey.currentStepId,
  );
  const [activeChecklist, setActiveChecklist] = useState<{
    stepId: JourneyStepId;
    checklist: JourneyChecklist;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const openChecklist = (step: JourneyStepContent, type: JourneyChecklistType) => {
    const checklist = generateJourneyChecklist(type, step, prep);
    setActiveChecklist({ stepId: step.id, checklist });
    setExpanded(step.id);
    setCopied(false);
  };

  const checklistText = activeChecklist
    ? formatJourneyChecklistText(activeChecklist.checklist)
    : '';

  const copyChecklist = async () => {
    await navigator.clipboard.writeText(checklistText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadChecklist = () => {
    const blob = new Blob([checklistText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cyra-${activeChecklist?.checklist.type ?? 'checklist'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="section-label">Progress</p>
            <p className="mt-1 font-display text-display-sm text-ink tabular-nums">
              {journey.progressPercent}%
            </p>
            <p className="mt-2 text-caption text-ink-secondary leading-relaxed max-w-xs">
              {journey.encouragement}
            </p>
          </div>
          <div className="text-right">
            <p className="text-micro text-ink-muted">
              {journey.completedCount} of {journey.steps.length} steps
            </p>
          </div>
        </div>
        <ProgressBar
          value={journey.progressPercent}
          className="mt-4"
          label="Journey progress"
          color="brand"
        />
      </Card>

      <ol className="relative space-y-0" aria-label="Health journey timeline">
        {journey.steps.map((step, index) => {
          const state = journey.progress.steps[step.id];
          const isOpen = expanded === step.id;
          const isCurrent = journey.currentStepId === step.id && !state.completed;
          const isLast = index === journey.steps.length - 1;

          return (
            <li key={step.id} className="relative flex gap-4 pb-6 last:pb-0">
              {!isLast && (
                <span
                  className={cn(
                    'absolute left-[15px] top-8 bottom-0 w-px',
                    state.completed ? 'bg-risk-low/60' : 'bg-border',
                  )}
                  aria-hidden="true"
                />
              )}

              <JourneyTimelineMarker
                step={step}
                state={state}
                isCurrent={isCurrent}
                onToggle={() => journey.toggleComplete(step.id)}
              />

              <div className="min-w-0 flex-1">
                <JourneyStepCard
                  step={step}
                  state={state}
                  isOpen={isOpen}
                  isCurrent={isCurrent}
                  prepLoading={prepLoading}
                  onToggleOpen={() => setExpanded(isOpen ? null : step.id)}
                  onGenerate={(type) => openChecklist(step, type)}
                  onNotesChange={(notes) => journey.updateStep(step.id, { notes })}
                />

                {isOpen && activeChecklist?.stepId === step.id && (
                  <JourneyChecklistView
                    checklist={activeChecklist.checklist}
                    copied={copied}
                    onCopy={copyChecklist}
                    onDownload={downloadChecklist}
                    onClose={() => setActiveChecklist(null)}
                  />
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <Card className="border-border bg-surface-secondary/50">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 shrink-0 text-brand-500 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-caption font-semibold text-ink">Need help preparing?</p>
            <p className="mt-1 text-micro text-ink-secondary leading-relaxed">
              Practice questions with Sakhi or generate a full clinician report from your logs.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link to="/chat">
                <Button size="sm" variant="secondary">Talk to Sakhi</Button>
              </Link>
              <Link to="/reports">
                <Button size="sm" variant="ghost">Full doctor report</Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function JourneyTimelineMarker({
  step,
  state,
  isCurrent,
  onToggle,
}: {
  step: JourneyStepContent;
  state: JourneyStepState;
  isCurrent: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'relative z-10 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
        state.completed
          ? 'border-risk-low bg-risk-low text-ink-inverse'
          : isCurrent
            ? 'border-brand-500 bg-surface ring-2 ring-brand-500/25'
            : 'border-border bg-surface text-ink-muted',
      )}
      aria-label={
        state.completed
          ? `Mark ${step.title} incomplete`
          : `Mark ${step.title} complete`
      }
    >
      {state.completed ? (
        <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
      ) : (
        <Circle className="h-3 w-3" strokeWidth={2} aria-hidden="true" />
      )}
    </button>
  );
}

function JourneyStepCard({
  step,
  state,
  isOpen,
  isCurrent,
  prepLoading,
  onToggleOpen,
  onGenerate,
  onNotesChange,
}: {
  step: JourneyStepContent;
  state: JourneyStepState;
  isOpen: boolean;
  isCurrent: boolean;
  prepLoading: boolean;
  onToggleOpen: () => void;
  onGenerate: (type: JourneyChecklistType) => void;
  onNotesChange: (notes: string) => void;
}) {
  return (
    <Card className={cn('!p-0 overflow-hidden', isCurrent && 'ring-1 ring-brand-500/30')}>
      <button
        type="button"
        className="flex w-full items-start gap-3 px-4 py-4 text-left"
        onClick={onToggleOpen}
        aria-expanded={isOpen}
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {isCurrent && (
              <span className="rounded-md bg-brand-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-500">
                You&apos;re here
              </span>
            )}
            {state.completedDate && (
              <span className="text-micro text-ink-muted">{state.completedDate}</span>
            )}
          </div>
          <p
            className={cn(
              'mt-0.5 font-display text-title-sm text-ink',
              state.completed && 'text-ink-secondary',
            )}
          >
            {step.title}
          </p>
          <p className="text-micro text-ink-tertiary">{step.subtitle}</p>
        </div>
        <ChevronDown
          className={cn(
            'h-5 w-5 shrink-0 text-ink-muted transition-transform',
            isOpen && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div className="border-t border-border px-4 pb-4 pt-3 space-y-4 animate-slide-up">
          <p className="text-caption text-ink-secondary leading-relaxed">{step.guidance}</p>

          <JourneyDetailSection title="What to expect" body={step.whatToExpect} />
          <JourneyDetailSection title="What to ask" items={step.whatToAsk} />
          <JourneyDetailSection title="Questions for your doctor" items={step.questionsForDoctor} />

          <div>
            <p className="section-label mb-2">Guides & checklists</p>
            <div className="flex flex-wrap gap-2">
              {step.actions.map((action) => (
                <Button
                  key={action.type}
                  size="sm"
                  variant="secondary"
                  loading={prepLoading && action.type !== 'visit_checklist'}
                  onClick={() => onGenerate(action.type)}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="text-micro text-ink-tertiary">Your notes</span>
            <textarea
              value={state.notes}
              onChange={(e) => onNotesChange(e.target.value)}
              onBlur={(e) => onNotesChange(e.target.value)}
              rows={2}
              placeholder="Appointments, feelings, questions for next time…"
              className="input-field mt-1 w-full resize-none"
            />
          </label>
        </div>
      )}
    </Card>
  );
}

function JourneyDetailSection({
  title,
  body,
  items,
}: {
  title: string;
  body?: string;
  items?: string[];
}) {
  return (
    <section>
      <p className="section-label">{title}</p>
      {body && (
        <p className="mt-1 text-caption text-ink-secondary leading-relaxed">{body}</p>
      )}
      {items && (
        <ul className="mt-2 space-y-1.5">
          {items.map((item) => (
            <li key={item} className="flex gap-2 text-caption text-ink-secondary">
              <span className="text-brand-500 shrink-0" aria-hidden="true">•</span>
              {item}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function JourneyChecklistView({
  checklist,
  copied,
  onCopy,
  onDownload,
  onClose,
}: {
  checklist: JourneyChecklist;
  copied: boolean;
  onCopy: () => void;
  onDownload: () => void;
  onClose: () => void;
}) {
  return (
    <Card className="mt-3 border-brand-500/20 animate-slide-up">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-caption font-semibold text-ink">{checklist.title}</p>
          <p className="mt-1 text-micro text-ink-secondary leading-relaxed">{checklist.intro}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-micro font-medium text-ink-muted hover:text-ink"
        >
          Close
        </button>
      </div>

      <ul className="space-y-2.5">
        {checklist.items.map((item) => (
          <li key={item.id} className="flex gap-2.5">
            <span className="mt-0.5 text-caption text-ink-muted" aria-hidden="true">☐</span>
            <div>
              <p className="text-caption text-ink-secondary">{item.text}</p>
              {item.detail && (
                <p className="text-micro text-ink-muted">{item.detail}</p>
              )}
            </div>
          </li>
        ))}
      </ul>

      {checklist.questions && checklist.questions.length > 0 && (
        <div className="mt-4 border-t border-border pt-3">
          <p className="section-label mb-2">Questions to bring</p>
          <ul className="space-y-1.5">
            {checklist.questions.map((q) => (
              <li key={q} className="text-caption text-ink-secondary">• {q}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" onClick={onCopy}>
          <Copy className="h-4 w-4" aria-hidden="true" />
          {copied ? 'Copied!' : 'Copy'}
        </Button>
        <Button size="sm" variant="secondary" onClick={onDownload}>
          <Download className="h-4 w-4" aria-hidden="true" />
          Download
        </Button>
      </div>

      <p className="mt-3 text-micro text-ink-muted">{checklist.footer}</p>
    </Card>
  );
}
