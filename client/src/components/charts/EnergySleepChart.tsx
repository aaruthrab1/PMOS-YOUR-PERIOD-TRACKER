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
import type { DailyTrend } from '@/types/database';
import { useChartTheme } from '@/hooks/useChartTheme';

interface Props {
  data: DailyTrend[];
}

export function EnergySleepChart({ data }: Props) {
  const chartTheme = useChartTheme();

  const formatted = data.map((d) => ({
    label: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    energy: d.energyLevel,
    sleep: d.sleepHours,
  }));

  return (
    <div className="chart-container h-64" role="img" aria-label="Energy and sleep chart over time">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formatted} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <CartesianGrid {...chartTheme.grid} />
          <XAxis dataKey="label" {...chartTheme.axis} />
          <YAxis {...chartTheme.axis} />
          <Tooltip contentStyle={chartTheme.tooltip.contentStyle} />
          <Legend wrapperStyle={{ fontSize: '12px', color: chartTheme.axis.tick.fill }} />
          <Line
            type="monotone"
            dataKey="energy"
            stroke={chartTheme.series.brand.stroke}
            strokeWidth={2}
            dot={false}
            name="Energy"
          />
          <Line
            type="monotone"
            dataKey="sleep"
            stroke={chartTheme.series.neutral.stroke}
            strokeWidth={2}
            dot={false}
            name="Sleep (hrs)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
