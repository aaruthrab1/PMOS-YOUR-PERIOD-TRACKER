import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ZAxis,
} from 'recharts';
import type { EnergySleepCorrelation } from '@/lib/tracker/types';
import { useChartTheme } from '@/hooks/useChartTheme';

interface Props {
  data: EnergySleepCorrelation[];
}

export function EnergySleepScatterChart({ data }: Props) {
  const chartTheme = useChartTheme();

  if (data.length < 2) {
    return <p className="py-8 text-center text-caption text-ink-secondary">Log energy and sleep on the same days to see correlation</p>;
  }

  return (
    <div className="chart-container h-52" role="img" aria-label="Energy vs sleep correlation">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
          <CartesianGrid {...chartTheme.grid} />
          <XAxis type="number" dataKey="sleep" name="Sleep" unit="h" {...chartTheme.axis} domain={[4, 10]} />
          <YAxis type="number" dataKey="energy" name="Energy" {...chartTheme.axis} domain={[1, 5]} />
          <ZAxis range={[80, 80]} />
          <Tooltip contentStyle={chartTheme.tooltip.contentStyle} cursor={{ strokeDasharray: '3 3' }} />
          <Scatter data={data} fill={chartTheme.series.brand.fill} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
