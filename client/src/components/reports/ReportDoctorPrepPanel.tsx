import { Link } from 'react-router-dom';
import {
  MessageCircle,
  CheckSquare,
  Clock,
  AlertTriangle,
  StickyNote,
} from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui';
import type { DoctorPrepData } from '@/lib/reports';

interface ReportDoctorPrepPanelProps {
  prep: DoctorPrepData | null;
}

export function ReportDoctorPrepPanel({ prep }: ReportDoctorPrepPanelProps) {
  if (!prep) {
    return (
      <Card>
        <p className="text-caption text-ink-secondary">
          Generate a report to unlock Doctor Prep mode with questions, timeline, and checklists.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4 animate-slide-up">
      {prep.appointmentNotes && (
        <Card className="border-border bg-surface">
          <div className="mb-2 flex items-center gap-2">
            <StickyNote className="h-5 w-5 text-brand-500" aria-hidden="true" />
            <p className="section-label !mb-0">Appointment notes</p>
          </div>
          <p className="text-caption text-ink-secondary leading-relaxed">{prep.appointmentNotes}</p>
        </Card>
      )}

      {prep.keyConcerns.length > 0 && (
        <Card>
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-risk-moderate" aria-hidden="true" />
            <p className="section-label !mb-0">Key concerns</p>
          </div>
          <ul className="space-y-2">
            {prep.keyConcerns.map((c) => (
              <li key={c} className="rounded-xl bg-risk-moderate-bg px-3 py-2 text-caption text-ink-secondary">
                {c}
              </li>
            ))}
          </ul>
        </Card>
      )}

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
        <Link to="/chat" className="mt-4 inline-flex">
          <Button size="sm" variant="ghost">Practice with Sakhi →</Button>
        </Link>
      </Card>

      <Card>
        <div className="mb-3 flex items-center gap-2">
          <Clock className="h-5 w-5 text-cycle-500" aria-hidden="true" />
          <p className="section-label !mb-0">Timeline of symptoms</p>
        </div>
        {prep.symptomTimeline.length === 0 ? (
          <p className="text-caption text-ink-secondary">No timeline entries in this range.</p>
        ) : (
          <ul className="divide-y divide-border/50">
            {prep.symptomTimeline.map(({ date, summary }) => (
              <li key={date} className="flex gap-3 py-2.5 first:pt-0 last:pb-0">
                <span className="shrink-0 w-24 text-micro font-medium text-ink-tertiary">{date}</span>
                <span className="text-caption text-ink-secondary">{summary}</span>
              </li>
            ))}
          </ul>
        )}
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
    </div>
  );
}
