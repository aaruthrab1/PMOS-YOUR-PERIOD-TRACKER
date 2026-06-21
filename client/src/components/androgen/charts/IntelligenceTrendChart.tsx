import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { AndrogenTrendPoint } from '@/lib/androgen/types';
import { useChartTheme } from '@/hooks/useChartTheme';
import { PHASE_LABELS, type CyclePhaseName } from '@/lib/cyclePhase';

type TrendKey = 'hairScore' | 'acneScore' | 'bodyHairScore' | 'scalpOiliness' | 'scalpDryness' | 'darkPatchScore';

interface IntelligenceTrendChartProps {
  data: AndrogenTrendPoint[];
  dataKey: TrendKey;
  label: string;
  yDomain?: [number, number];
  simpleLanguage?: boolean;
  variant?: 'area' | 'line';
  color?: 'brand' | 'cycle' | 'neutral';
}

function PhaseDot(props: { cx?: number; cy?: number; payload?: AndrogenTrendPoint }) {
  const { cx, cy, payload } = props;
  if (cx == null || cy == null || !payload) return null;
  return (
    <circle cx={cx} cy={cy} r={4} fill={payload.phaseColor} stroke="var(--color-surface)" strokeWidth={2} />
  );
}

export function IntelligenceTrendChart({
  data,
  dataKey,
  label,
  yDomain,
  simpleLanguage,
  variant = 'area',
  color = 'brand',
}: IntelligenceTrendChartProps) {
  const chartTheme = useChartTheme();
  const stroke =
    color === 'cycle' ? chartTheme.series.cycle.stroke : color === 'neutral' ? chartTheme.axis.tick.fill : chartTheme.series.brand.stroke;
  const fillId = `gradient-${dataKey}`;

  const tooltipFormatter = (value: number, _name: string, item: { payload?: AndrogenTrendPoint }) => {
    const p = item.payload;
    if (!p) return [value, label];
    const phaseLabel = simpleLanguage
      ? PHASE_LABELS[p.phase as CyclePhaseName]?.simple
      : PHASE_LABELS[p.phase as CyclePhaseName]?.medical;
    return [`${value} · ${phaseLabel ?? p.phase}`, label];
  };

  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-caption text-ink-secondary">
        Log weekly check-ins to see trends
      </p>
    );
  }

  return (
    <div className="chart-container h-48" role="img" aria-label={`${label} trend chart`}>
      <ResponsiveContainer width="100%" height="100%">
        {variant === 'area' ? (
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={stroke} stopOpacity={0.12} />
                <stop offset="100%" stopColor={stroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...chartTheme.grid} vertical={false} />
            <XAxis dataKey="label" {...chartTheme.axis} tick={{ ...chartTheme.axis.tick, fontSize: 10 }} />
            <YAxis {...chartTheme.axis} domain={yDomain ?? ['auto', 'auto']} allowDecimals={false} width={28} />
            <Tooltip contentStyle={chartTheme.tooltip.contentStyle} formatter={tooltipFormatter} />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={stroke}
              strokeWidth={2}
              fill={`url(#${fillId})`}
              dot={<PhaseDot />}
            />
          </AreaChart>
        ) : (
          <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid {...chartTheme.grid} vertical={false} />
            <XAxis dataKey="label" {...chartTheme.axis} tick={{ ...chartTheme.axis.tick, fontSize: 10 }} />
            <YAxis {...chartTheme.axis} domain={yDomain ?? ['auto', 'auto']} allowDecimals={false} width={28} />
            <Tooltip contentStyle={chartTheme.tooltip.contentStyle} formatter={tooltipFormatter} />
            <Line type="monotone" dataKey={dataKey} stroke={stroke} strokeWidth={2} dot={<PhaseDot />} />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
