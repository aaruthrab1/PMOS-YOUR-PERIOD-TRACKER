import { usePersonalization } from '@/contexts/PersonalizationContext';
import { useState } from 'react';
import { Copy, Download, FileText, MessageCircle, Activity, CheckSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, Badge, Button, SkeletonCard } from '@/components/ui';
import { useDoctorPrep } from '@/hooks/useDoctorPrep';
import { cn } from '@/lib/tokens';

type PrepPanel = 'symptoms' | 'questions' | 'tests';

const PANELS: { id: PrepPanel; label: string; icon: typeof Activity }[] = [
  { id: 'symptoms', label: 'Symptoms summary', icon: Activity },
  { id: 'questions', label: 'Questions to ask', icon: MessageCircle },
  { id: 'tests', label: 'Tests to request', icon: CheckSquare },
];

export function DoctorPrepToolkitSection() {
  const { t } = usePersonalization();
  const { document: prep, exportText, loading } = useDoctorPrep();
  const [panel, setPanel] = useState<PrepPanel>('symptoms');
  const [copied, setCopied] = useState(false);

  const copyAll = async () => {
    await navigator.clipboard.writeText(exportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cyra-doctor-prep.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <section id="doctor-prep" aria-labelledby="doctor-prep-heading">
        <h2 id="doctor-prep-heading" className="section-label mb-3">
          {t('care.doctorPrep')}
        </h2>
        <SkeletonCard />
      </section>
    );
  }

  return (
    <section id="doctor-prep" aria-labelledby="doctor-prep-heading">
      <h2 id="doctor-prep-heading" className="section-label mb-3">
        {t('care.doctorPrep')}
      </h2>
      <Card className="!p-0 overflow-hidden">
        <div className="flex border-b border-border overflow-x-auto">
          {PANELS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setPanel(id)}
              aria-selected={panel === id}
              className={cn(
                'flex shrink-0 items-center gap-2 px-4 py-3 text-micro font-semibold transition-colors',
                panel === id
                  ? 'border-b-2 border-brand-500 text-brand-500 bg-surface'
                  : 'text-ink-secondary hover:text-ink hover:bg-surface-secondary',
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>

        <div className="p-4 min-h-[200px]">
          {panel === 'symptoms' && (
            <div className="space-y-4 animate-fade-in">
              <ul className="space-y-2">
                {prep.healthSummary.map((line) => (
                  <li key={line} className="text-caption text-ink-secondary leading-relaxed">{line}</li>
                ))}
              </ul>
              {prep.keyConcerns.length > 0 && (
                <div className="rounded-xl bg-risk-moderate-bg/40 px-3 py-2.5">
                  <p className="text-overline uppercase text-ink-muted mb-1.5">Priority topics</p>
                  <ul className="space-y-1">
                    {prep.keyConcerns.map((c) => (
                      <li key={c} className="text-caption text-ink-secondary">• {c}</li>
                    ))}
                  </ul>
                </div>
              )}
              {prep.symptomTimeline.length > 0 && (
                <div>
                  <p className="text-overline uppercase text-ink-muted mb-2">Recent timeline</p>
                  <ul className="divide-y divide-border">
                    {prep.symptomTimeline.slice(0, 5).map(({ date, summary }) => (
                      <li key={date} className="flex gap-3 py-2 first:pt-0">
                        <span className="shrink-0 w-20 text-micro text-ink-tertiary">{date}</span>
                        <span className="text-caption text-ink-secondary">{summary}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {panel === 'questions' && (
            <ul className="space-y-3 animate-fade-in">
              {prep.questionsToAsk.map((q) => (
                <li key={q} className="flex gap-2.5 text-caption text-ink-secondary leading-relaxed">
                  <span className="font-bold text-brand-500 shrink-0" aria-hidden="true">?</span>
                  {q}
                </li>
              ))}
              <Link to="/chat" className="inline-flex text-micro font-semibold text-brand-500">
                Practice with Sakhi →
              </Link>
            </ul>
          )}

          {panel === 'tests' && (
            <ul className="space-y-3 animate-fade-in">
              {prep.testChecklist.map((test) => (
                <li key={test.name} className="flex gap-3">
                  <span className="mt-0.5 text-caption text-ink-muted" aria-hidden="true">
                    {test.suggested ? '☐' : '○'}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-caption font-medium text-ink">{test.name}</p>
                      {test.suggested && (
                        <Badge variant="brand" className="!text-[10px]">Often relevant</Badge>
                      )}
                    </div>
                    <p className="text-micro text-ink-secondary">{test.reason}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-wrap gap-2 border-t border-border px-4 py-3 bg-surface-secondary/30">
          <Button size="sm" onClick={copyAll}>
            <Copy className="h-4 w-4" aria-hidden="true" />
            {copied ? 'Copied!' : 'Copy all'}
          </Button>
          <Button size="sm" variant="secondary" onClick={download}>
            <Download className="h-4 w-4" aria-hidden="true" />
            Download
          </Button>
          <Link to="/reports">
            <Button size="sm" variant="ghost">
              <FileText className="h-4 w-4" aria-hidden="true" />
              Full AI report
            </Button>
          </Link>
        </div>
      </Card>
      <p className="mt-2 text-micro text-ink-muted">
        Generated from your quiz, symptoms, and tracker history — for personal use only.
      </p>
    </section>
  );
}
