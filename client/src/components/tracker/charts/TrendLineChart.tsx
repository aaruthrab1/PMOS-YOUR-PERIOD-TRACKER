import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { ChartPoint } from '@/lib/tracker/types';
import { useChartTheme } from '@/hooks/useChartTheme';

interface Props {
  data: ChartPoint[];
  label?: string;
  color?: 'brand' | 'cycle';
}

export function TrendLineChart({ data, label = 'Value', color = 'brand' }: Props) {
  const chartTheme = useChartTheme();

  if (data.length === 0) {
    return <p className="py-8 text-center text-caption text-ink-secondary">Not enough data yet</p>;
  }

  const series = color === 'cycle' ? chartTheme.series.cycle : chartTheme.series.brand;

  return (
    <div className="chart-container h-52" role="img" aria-label={`${label} trend chart`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <CartesianGrid {...chartTheme.grid} />
          <XAxis dataKey="label" {...chartTheme.axis} interval="preserveStartEnd" />
          <YAxis {...chartTheme.axis} />
          <Tooltip contentStyle={chartTheme.tooltip.contentStyle} />
          <Line type="monotone" dataKey="value" stroke={series.stroke} strokeWidth={2} dot={{ r: 3 }} name={label} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
