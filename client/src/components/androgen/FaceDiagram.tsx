import { cn } from '@/lib/tokens';
import type { AcneZone } from '@/lib/androgen/types';
import { ACNE_ZONE_OPTIONS } from '@/lib/androgen/constants';

interface FaceDiagramProps {
  selected: AcneZone[];
  onToggle: (zone: AcneZone) => void;
  simpleLanguage?: boolean;
  readOnly?: boolean;
  heatCounts?: Partial<Record<AcneZone, number>>;
}

export function FaceDiagram({ selected, onToggle, simpleLanguage, readOnly, heatCounts }: FaceDiagramProps) {
  const isSelected = (z: AcneZone) => selected.includes(z);
  const heat = (z: AcneZone) => heatCounts?.[z] ?? 0;

  const zoneClass = (z: AcneZone) => {
    if (readOnly) {
      const count = heat(z);
      if (count >= 3) return 'fill-brand-500/70';
      if (count >= 2) return 'fill-brand-500/45';
      if (count >= 1) return 'fill-brand-500/25';
      return 'fill-transparent opacity-30';
    }
    return cn(
      'cursor-pointer transition-opacity',
      isSelected(z) ? 'fill-cycle-400 opacity-90' : 'fill-transparent opacity-60 hover:fill-cycle-200',
    );
  };

  const handleClick = (z: AcneZone) => {
    if (!readOnly) onToggle(z);
  };

  return (
    <div className="mx-auto max-w-xs">
      <svg
        viewBox="0 0 200 260"
        className="w-full"
        role="group"
        aria-label={readOnly ? 'Acne zone heat map from your logs' : 'Select areas where you notice breakouts'}
      >
        <ellipse cx="100" cy="130" rx="72" ry="88" fill="var(--color-surface-secondary)" stroke="var(--color-border)" strokeWidth="1.5" />

        <ellipse
          cx="100"
          cy="68"
          rx="48"
          ry="22"
          className={cn('transition-opacity', zoneClass('forehead'))}
          onClick={() => handleClick('forehead')}
          role={readOnly ? undefined : 'button'}
          aria-pressed={readOnly ? undefined : isSelected('forehead')}
          aria-label={ACNE_ZONE_OPTIONS.find((z) => z.id === 'forehead')?.[simpleLanguage ? 'simpleLabel' : 'label'] ?? 'Forehead'}
        />

        <ellipse
          cx="58"
          cy="118"
          rx="22"
          ry="28"
          className={cn('transition-opacity', zoneClass('cheeks'))}
          onClick={() => handleClick('cheeks')}
          role={readOnly ? undefined : 'button'}
          aria-pressed={readOnly ? undefined : isSelected('cheeks')}
          aria-label="Left cheek"
        />
        <ellipse
          cx="142"
          cy="118"
          rx="22"
          ry="28"
          className={cn('transition-opacity', zoneClass('cheeks'))}
          onClick={() => handleClick('cheeks')}
          aria-hidden="true"
        />

        <ellipse
          cx="100"
          cy="118"
          rx="14"
          ry="24"
          className={cn('transition-opacity', zoneClass('nose'))}
          onClick={() => handleClick('nose')}
          role={readOnly ? undefined : 'button'}
          aria-pressed={readOnly ? undefined : isSelected('nose')}
          aria-label="Nose"
        />

        <path
          d="M 52 155 Q 100 210 148 155 Q 130 195 100 200 Q 70 195 52 155 Z"
          className={cn('transition-opacity', zoneClass('jawline_chin'))}
          onClick={() => handleClick('jawline_chin')}
          role={readOnly ? undefined : 'button'}
          aria-pressed={readOnly ? undefined : isSelected('jawline_chin')}
          aria-label="Jawline and chin"
        />

        <ellipse cx="78" cy="108" rx="6" ry="4" fill="var(--color-ink-muted)" opacity="0.3" />
        <ellipse cx="122" cy="108" rx="6" ry="4" fill="var(--color-ink-muted)" opacity="0.3" />
        <path d="M 88 138 Q 100 148 112 138" fill="none" stroke="var(--color-ink-muted)" strokeWidth="1.5" opacity="0.25" />
      </svg>

      {!readOnly && (
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {ACNE_ZONE_OPTIONS.map(({ id, label, simpleLabel }) => (
            <button
              key={id}
              type="button"
              onClick={() => onToggle(id)}
              aria-pressed={isSelected(id)}
              className={cn(
                'rounded-full px-3 py-1 text-micro font-medium transition-colors',
                isSelected(id)
                  ? 'bg-cycle-500 text-white'
                  : 'bg-surface-secondary text-ink-secondary ring-1 ring-border',
              )}
            >
              {simpleLanguage ? simpleLabel : label}
            </button>
          ))}
        </div>
      )}
      {readOnly && heatCounts && (
        <p className="mt-2 text-center text-micro text-ink-tertiary">
          Darker zones = more frequently logged breakouts
        </p>
      )}
    </div>
  );
}
