import { useState } from 'react';
import type { CyclePattern, CyclePhaseSegment } from '@/lib/care/cycleEducation';
import { cn } from '@/lib/tokens';

interface CycleVisualizerProps {
  patterns: CyclePattern[];
  simpleLanguage?: boolean;
}

export function CycleVisualizer({ patterns, simpleLanguage }: CycleVisualizerProps) {
  const [activeSegment, setActiveSegment] = useState<{
    patternId: string;
    segment: CyclePhaseSegment;
  } | null>(null);

  return (
    <div className="space-y-8">
      {patterns.map((pattern) => (
        <div key={pattern.id}>
          <div className="mb-3 flex items-baseline justify-between">
            <p className="font-display text-title text-ink">{pattern.label}</p>
            <span className="text-caption font-semibold text-brand-600">{pattern.lengthLabel}</span>
          </div>

          <div
            className="relative flex h-14 overflow-hidden rounded-2xl ring-1 ring-border/60"
            role="group"
            aria-label={`${pattern.label} timeline`}
          >
            {pattern.segments.map((segment) => {
              const widthPct = ((segment.endDay - segment.startDay + 1) / pattern.length) * 100;
              const isActive =
                activeSegment?.patternId === pattern.id && activeSegment.segment.id === segment.id;

              return (
                <button
                  key={segment.id}
                  type="button"
                  style={{ width: `${widthPct}%`, backgroundColor: segment.color }}
                  className={cn(
                    'relative h-full border-r border-white/20 transition-opacity last:border-r-0',
                    isActive ? 'opacity-100 ring-2 ring-inset ring-white/80' : 'opacity-85 hover:opacity-100',
                  )}
                  onClick={() =>
                    setActiveSegment(
                      isActive ? null : { patternId: pattern.id, segment },
                    )
                  }
                  aria-pressed={isActive}
                  aria-label={`${simpleLanguage ? segment.simpleLabel : segment.label}, days ${segment.startDay}–${segment.endDay}`}
                >
                  <span className="absolute inset-x-0 bottom-1 truncate px-1 text-center text-[9px] font-semibold text-white drop-shadow-sm">
                    {widthPct > 12 ? (simpleLanguage ? segment.simpleLabel : segment.label) : ''}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex justify-between text-micro text-ink-tertiary">
            <span>Day 1</span>
            <span>Day {pattern.length}</span>
          </div>

          {activeSegment?.patternId === pattern.id && (
            <div className="mt-4 rounded-2xl bg-surface-secondary p-4 animate-slide-up ring-1 ring-border/50">
              <p className="font-display text-title-sm text-ink">
                {simpleLanguage ? activeSegment.segment.simpleLabel : activeSegment.segment.label}
              </p>
              <p className="mt-1 text-micro text-ink-tertiary">
                Days {activeSegment.segment.startDay}–{activeSegment.segment.endDay}
              </p>
              <p className="mt-2 text-caption text-ink-secondary leading-relaxed">
                {simpleLanguage
                  ? activeSegment.segment.description.simple
                  : activeSegment.segment.description.medical}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
