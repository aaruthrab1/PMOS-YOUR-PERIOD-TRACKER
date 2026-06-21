import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Card } from '@/components/ui';
import type { ReportSourceSnapshot } from '@/lib/reports';

interface ReportChartsPanelInnerProps {
  snapshot: ReportSourceSnapshot | null;
}

function shortDate(d: string) {
  return d.slice(5);
}

export function ReportChartsPanelInner({ snapshot }: ReportChartsPanelInnerProps) {
  if (!snapshot) {
    return (
      <Card>
        <p className="text-caption text-ink-secondary">No chart data in this report.</p>
      </Card>
    );
  }

  const charts = [
    {
      title: 'Sleep hours',
      data: snapshot.chartData.sleepHours.slice(-21).map((p) => ({ date: shortDate(p.date), value: p.value })),
      color: '#5b4bdb',
      unit: 'h',
    },
    {
      title: 'Energy level',
      data: snapshot.chartData.moodEnergy.slice(-21).map((p) => ({ date: shortDate(p.date), value: p.value })),
      color: '#ec4899',
      unit: '/10',
    },
    {
      title: 'Weight',
      data: snapshot.chartData.weight.slice(-21).map((p) => ({ date: shortDate(p.date), value: p.value })),
      color: '#059669',
      unit: snapshot.weightLogs[0]?.unit ?? 'kg',
    },
  ].filter((c) => c.data.length >= 2);

  if (charts.length === 0) {
    return (
      <Card>
        <p className="text-caption text-ink-secondary">
          Log sleep, mood energy, or weight in the Tracker to see trends here.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {charts.map((chart) => (
        <Card key={chart.title} className="!p-4">
          <p className="section-label mb-3">{chart.title}</p>
          <div className="h-36" role="img" aria-label={`${chart.title} trend chart`}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chart.data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0eef8" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" width={28} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #e8e4fc', fontSize: 12 }}
                  formatter={(v: number) => [`${v}${chart.unit}`, chart.title]}
                />
                <Line type="monotone" dataKey="value" stroke={chart.color} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      ))}
    </div>
  );
}
