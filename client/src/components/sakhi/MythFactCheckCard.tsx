import { Shield, AlertTriangle, BookOpen, Heart } from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import type { MythCheckResult } from '@/lib/sakhi';
import { cn } from '@/lib/tokens';

interface MythFactCheckCardProps {
  claim: string;
  result: MythCheckResult;
  className?: string;
}

function accuracyVariant(accuracy: string): 'risk-low' | 'risk-moderate' | 'risk-high' | 'outline' {
  const lower = accuracy.toLowerCase();
  if (lower.includes('accurate') && !lower.includes('misleading') && !lower.includes('false')) {
    return 'risk-low';
  }
  if (lower.includes('partial')) return 'risk-moderate';
  if (lower.includes('false') || lower.includes('misleading')) return 'risk-high';
  return 'outline';
}

export function MythFactCheckCard({ claim, result, className }: MythFactCheckCardProps) {
  return (
    <Card className={cn('border-border overflow-hidden', className)}>
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500">
          <Shield className="h-4 w-4 text-ink-inverse" aria-hidden="true" />
        </div>
        <div>
          <p className="font-display text-title-sm text-ink">Myth fact-check</p>
          <Badge variant={accuracyVariant(result.accuracy)}>{result.accuracy}</Badge>
        </div>
      </div>

      <blockquote className="mb-4 rounded-xl bg-surface/80 px-3 py-2 text-caption text-ink-secondary italic ring-1 ring-border/50">
        &ldquo;{claim.length > 280 ? `${claim.slice(0, 280)}…` : claim}&rdquo;
      </blockquote>

      <div className="space-y-3">
        <Section icon={BookOpen} title="Evidence" text={result.evidence} />
        <Section icon={AlertTriangle} title="Risks" text={result.risks} />
        <Section icon={Heart} title="Better guidance" text={result.betterGuidance} />
      </div>

      <p className="mt-4 text-micro text-ink-muted">
        For awareness only — not medical advice. Talk to your clinician for personal guidance.
      </p>
    </Card>
  );
}

function Section({ icon: Icon, title, text }: { icon: typeof BookOpen; title: string; text: string }) {
  return (
    <div className="flex gap-3">
      <Icon className="h-4 w-4 shrink-0 text-brand-500 mt-0.5" aria-hidden="true" />
      <div>
        <p className="text-micro font-semibold text-ink">{title}</p>
        <p className="text-caption text-ink-secondary leading-relaxed">{text}</p>
      </div>
    </div>
  );
}
