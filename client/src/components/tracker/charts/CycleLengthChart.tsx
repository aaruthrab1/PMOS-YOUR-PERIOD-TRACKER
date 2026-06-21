import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { ChartPoint } from '@/lib/tracker/types';
import { useChartTheme } from '@/hooks/useChartTheme';

interface Props {
  data: ChartPoint[];
  emptyLabel?: string;
}

export function CycleLengthChart({ data, emptyLabel = 'Log more cycles to see chart' }: Props) {
  const chartTheme = useChartTheme();

  if (data.length === 0) {
    return <p className="py-8 text-center text-caption text-ink-secondary">{emptyLabel}</p>;
  }

  return (
    <div className="chart-container h-48" role="img" aria-label="Cycle length chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <CartesianGrid {...chartTheme.grid} />
          <XAxis dataKey="label" {...chartTheme.axis} />
          <YAxis {...chartTheme.axis} domain={[20, 40]} />
          <Tooltip contentStyle={chartTheme.tooltip.contentStyle} formatter={(v) => [`${v} days`, 'Length']} />
          <Bar dataKey="value" fill={chartTheme.series.cycle.fill} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
