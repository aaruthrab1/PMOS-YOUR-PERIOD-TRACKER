import { Copy, Download, CheckSquare, MessageCircle, FileText, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, Badge, Button, SkeletonCard } from '@/components/ui';
import { useDoctorPrep } from '@/hooks/useDoctorPrep';
import { useState } from 'react';

export function DoctorPrepTab() {
  const { document: prep, exportText, loading } = useDoctorPrep();
  const [copied, setCopied] = useState(false);

  const copyAll = async () => {
    await navigator.clipboard.writeText(exportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = 'cyra-doctor-prep.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <Card className="border-border">
        <p className="text-caption text-ink-secondary leading-relaxed">
          Your prep sheet is built from your Cyra logs and profile. You deserve to walk into appointments feeling prepared and heard.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
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
              Full AI report + PDF
            </Button>
          </Link>
        </div>
      </Card>

      <Card>
        <div className="mb-3 flex items-center gap-2">
          <Activity className="h-5 w-5 text-brand-500" aria-hidden="true" />
          <p className="section-label !mb-0">Health summary</p>
        </div>
        <ul className="space-y-2">
          {prep.healthSummary.map((line) => (
            <li key={line} className="text-caption text-ink-secondary leading-relaxed">{line}</li>
          ))}
        </ul>
      </Card>

      {prep.keyConcerns.length > 0 && (
        <Card className="border-risk-moderate-border/40 bg-risk-moderate-bg/30">
          <p className="section-label mb-3">Key concerns</p>
          <ul className="space-y-2">
            {prep.keyConcerns.map((c) => (
              <li key={c} className="text-caption text-ink-secondary">{c}</li>
            ))}
          </ul>
        </Card>
      )}

      <Card>
        <div className="mb-3 flex items-center gap-2">
          <FileText className="h-5 w-5 text-cycle-500" aria-hidden="true" />
          <p className="section-label !mb-0">Symptom timeline</p>
        </div>
        {prep.symptomTimeline.length === 0 ? (
          <p className="text-caption text-ink-secondary">
            Log mood and sleep in the Tracker for a richer timeline before your visit.
          </p>
        ) : (
          <ul className="divide-y divide-border/50">
            {prep.symptomTimeline.map(({ date, summary }) => (
              <li key={date} className="flex gap-3 py-2.5 first:pt-0 last:pb-0">
                <span className="shrink-0 text-micro font-medium text-ink-tertiary w-24">{date}</span>
                <span className="text-caption text-ink-secondary">{summary}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <div className="mb-3 flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-brand-500" aria-hidden="true" />
          <p className="section-label !mb-0">Questions to ask</p>
        </div>
        <ul className="space-y-2.5">
          {prep.questionsToAsk.map((q) => (
            <li key={q} className="flex gap-2 text-caption text-ink-secondary leading-relaxed">
              <span className="text-brand-500 font-bold" aria-hidden="true">?</span>
              {q}
            </li>
          ))}
        </ul>
        <Link to="/chat" className="mt-4 inline-flex text-micro font-semibold text-brand-600">
          Practice with Sakhi →
        </Link>
      </Card>

      <Card>
        <div className="mb-3 flex items-center gap-2">
          <CheckSquare className="h-5 w-5 text-brand-500" aria-hidden="true" />
          <p className="section-label !mb-0">Test checklist</p>
        </div>
        <ul className="space-y-3">
          {prep.testChecklist.map((test) => (
            <li key={test.name} className="flex items-start gap-3">
              <span className="mt-0.5 text-lg" aria-hidden="true">{test.suggested ? '☐' : '○'}</span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-caption font-medium text-ink">{test.name}</p>
                  {test.suggested && <Badge variant="brand" className="!text-[10px]">Often relevant</Badge>}
                </div>
                <p className="text-micro text-ink-secondary">{test.reason}</p>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <p className="text-micro text-ink-muted text-center pb-4">
        For personal use only — not a medical record. You know your body best.
      </p>
    </div>
  );
}
