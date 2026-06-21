import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { DailyTrend } from '@/types/database';
import { brandGradientId } from '@/lib/chartTheme';
import { useChartTheme } from '@/hooks/useChartTheme';

export function SymptomTrendChart({ data }: { data: DailyTrend[] }) {
  const chartTheme = useChartTheme();
  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  const gradId = brandGradientId('Symptom');
  const stroke = chartTheme.series.brand.stroke;

  return (
    <div className="chart-container h-52" role="img" aria-label="Symptom severity trend">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formatted} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.18} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid {...chartTheme.grid} vertical={false} />
          <XAxis dataKey="label" {...chartTheme.axis} />
          <YAxis domain={[0, 3]} ticks={[0, 1, 2, 3]} {...chartTheme.axis} />
          <Tooltip contentStyle={chartTheme.tooltip.contentStyle} />
          <Area
            type="monotone"
            dataKey="avgSeverity"
            stroke={stroke}
            strokeWidth={2}
            fill={`url(#${gradId})`}
            name="Severity"
            dot={false}
            activeDot={chartTheme.series.brand.activeDot}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
