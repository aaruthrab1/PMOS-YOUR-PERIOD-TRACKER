import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import type { AndrogenTrendPoint } from '@/lib/androgen/types';
import { useChartTheme } from '@/hooks/useChartTheme';
import { PHASE_COLORS, PHASE_LABELS, type CyclePhaseName } from '@/lib/cyclePhase';

interface PhaseTrendChartProps {
  data: AndrogenTrendPoint[];
  dataKey: 'hairScore' | 'acneScore' | 'scalpOiliness';
  label: string;
  yDomain?: [number, number];
  simpleLanguage?: boolean;
}

function PhaseDot(props: { cx?: number; cy?: number; payload?: AndrogenTrendPoint }) {
  const { cx, cy, payload } = props;
  if (cx == null || cy == null || !payload) return null;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={5}
      fill={payload.phaseColor}
      stroke="#1e2230"
      strokeWidth={2}
    />
  );
}

export function PhaseTrendChart({
  data,
  dataKey,
  label,
  yDomain,
  simpleLanguage,
}: PhaseTrendChartProps) {
  const chartTheme = useChartTheme();
  const phases: CyclePhaseName[] = ['Menstrual', 'Follicular', 'Ovulation', 'Luteal'];

  return (
    <div>
      <div className="chart-container h-52" role="img" aria-label={`${label} trend with cycle phases`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid {...chartTheme.grid} />
            <XAxis dataKey="label" {...chartTheme.axis} />
            <YAxis {...chartTheme.axis} domain={yDomain ?? ['auto', 'auto']} allowDecimals={false} />
            <Tooltip
              contentStyle={chartTheme.tooltip.contentStyle}
              formatter={(value, _name, item) => {
                const p = item.payload as AndrogenTrendPoint;
                const phaseLabel = simpleLanguage
                  ? PHASE_LABELS[p.phase as CyclePhaseName]?.simple
                  : PHASE_LABELS[p.phase as CyclePhaseName]?.medical;
                return [`${value} (${phaseLabel ?? p.phase})`, label];
              }}
            />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={chartTheme.series.brand.stroke}
              strokeWidth={2}
              dot={<PhaseDot />}
              name={label}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex flex-wrap gap-3 justify-center">
        {phases.map((phase) => (
          <span key={phase} className="flex items-center gap-1.5 text-micro text-ink-tertiary">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: PHASE_COLORS[phase] }}
              aria-hidden="true"
            />
            {simpleLanguage ? PHASE_LABELS[phase].simple : PHASE_LABELS[phase].medical}
          </span>
        ))}
      </div>
    </div>
  );
}

interface AcneFrequencyChartProps {
  data: AndrogenTrendPoint[];
  simpleLanguage?: boolean;
}

export function AcneFrequencyChart({ data, simpleLanguage }: AcneFrequencyChartProps) {
  const chartTheme = useChartTheme();
  const formatted = data.map((d) => ({
    ...d,
    acneCount: d.hasAcne ? 1 : 0,
  }));

  return (
    <div>
      <div className="chart-container h-48" role="img" aria-label="Acne frequency by check-in">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formatted} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid {...chartTheme.grid} />
            <XAxis dataKey="label" {...chartTheme.axis} />
            <YAxis {...chartTheme.axis} domain={[0, 1]} ticks={[0, 1]} tickFormatter={(v) => (v === 1 ? 'Yes' : 'No')} />
            <Tooltip contentStyle={chartTheme.tooltip.contentStyle} />
            <Legend wrapperStyle={{ fontSize: '12px', color: chartTheme.axis.tick.fill }} />
            <Line
              type="stepAfter"
              dataKey="acneScore"
              stroke={chartTheme.series.cycle.stroke}
              strokeWidth={2}
              dot={<PhaseDot />}
              name="Acne severity"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-center text-micro text-ink-tertiary">
        Dot colors match your {simpleLanguage ? 'cycle week' : 'cycle phase'} at each check-in
      </p>
    </div>
  );
}
