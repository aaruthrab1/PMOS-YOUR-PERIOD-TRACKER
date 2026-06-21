import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { useChartTheme } from '@/hooks/useChartTheme';

interface ZoneBarItem {
  label: string;
  count: number;
  pct: number;
}

interface ZoneFrequencyChartProps {
  data: ZoneBarItem[];
  ariaLabel?: string;
}

export function ZoneFrequencyChart({ data, ariaLabel = 'Acne zone frequency' }: ZoneFrequencyChartProps) {
  const chartTheme = useChartTheme();
  const max = Math.max(...data.map((d) => d.count), 1);

  if (data.every((d) => d.count === 0)) {
    return (
      <p className="py-6 text-center text-caption text-ink-secondary">
        No zone data yet — log breakouts with location mapping
      </p>
    );
  }

  return (
    <div className="chart-container h-44" role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
          <XAxis type="number" {...chartTheme.axis} domain={[0, max]} allowDecimals={false} hide />
          <YAxis
            type="category"
            dataKey="label"
            {...chartTheme.axis}
            width={72}
            tick={{ ...chartTheme.axis.tick, fontSize: 10 }}
          />
          <Tooltip
            contentStyle={chartTheme.tooltip.contentStyle}
            formatter={(value: number, _n, item) => [`${value} logs (${(item.payload as ZoneBarItem).pct}%)`, 'Frequency']}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={14}>
            {data.map((entry, i) => (
              <Cell
                key={entry.label}
                fill={entry.count > 0 ? chartTheme.series.cycle.stroke : chartTheme.grid.stroke}
                fillOpacity={entry.count > 0 ? 0.35 + (i === 0 ? 0.45 : 0.15) : 0.2}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
