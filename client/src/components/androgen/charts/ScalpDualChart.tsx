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

interface ScalpDualChartProps {
  data: AndrogenTrendPoint[];
  simpleLanguage?: boolean;
}

export function ScalpDualChart({ data, simpleLanguage }: ScalpDualChartProps) {
  const chartTheme = useChartTheme();

  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-caption text-ink-secondary">
        Log scalp ratings in your weekly check-in
      </p>
    );
  }

  return (
    <div className="chart-container h-52" role="img" aria-label="Scalp oiliness and dryness trends">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid {...chartTheme.grid} vertical={false} />
          <XAxis dataKey="label" {...chartTheme.axis} tick={{ ...chartTheme.axis.tick, fontSize: 10 }} />
          <YAxis {...chartTheme.axis} domain={[1, 5]} allowDecimals={false} width={28} />
          <Tooltip contentStyle={chartTheme.tooltip.contentStyle} />
          <Legend
            wrapperStyle={{ fontSize: '11px', color: chartTheme.axis.tick.fill }}
            formatter={(value) => (simpleLanguage ? value : value)}
          />
          <Line
            type="monotone"
            dataKey="scalpOiliness"
            name={simpleLanguage ? 'Oiliness' : 'Oiliness (1–5)'}
            stroke={chartTheme.series.brand.stroke}
            strokeWidth={2}
            dot={{ r: 3, fill: chartTheme.series.brand.stroke }}
          />
          <Line
            type="monotone"
            dataKey="scalpDryness"
            name={simpleLanguage ? 'Dryness' : 'Dryness (1–5)'}
            stroke={chartTheme.series.cycle.stroke}
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={{ r: 3, fill: chartTheme.series.cycle.stroke }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
