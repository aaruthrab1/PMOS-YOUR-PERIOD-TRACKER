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
import { useChartTheme } from '@/hooks/useChartTheme';
import type { ClinicalReportView } from '@/lib/reports/buildClinicalReport';

interface ReportClinicalChartsInnerProps {
  charts: ClinicalReportView['charts'];
}

function shortDate(d: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(d));
}

export function ReportClinicalChartsInner({ charts }: ReportClinicalChartsInnerProps) {
  const chartTheme = useChartTheme();

  const configs = [
    {
      title: 'Cycle length trend',
      data: charts.cycleLength.slice(-16).map((p) => ({ date: shortDate(p.date), value: p.value })),
      color: chartTheme.series.cycle.stroke,
      unit: ' days',
      empty: 'Log period start dates with cycle lengths',
    },
    {
      title: 'Sleep trend',
      data: charts.sleepHours.slice(-16).map((p) => ({ date: shortDate(p.date), value: p.value })),
      color: chartTheme.series.brand.stroke,
      unit: 'h',
      empty: 'Log sleep in Tracker',
    },
    {
      title: 'Mood trend',
      data: charts.moodTrend.slice(-16).map((p) => ({ date: shortDate(p.date), value: p.value })),
      color: '#8B5CF6',
      unit: '/10',
      empty: 'Log daily mood',
    },
    {
      title: 'Hair fall trend',
      data: charts.hairFall.slice(-16).map((p) => ({ date: shortDate(p.date), value: p.value })),
      color: '#B47850',
      unit: ' severity',
      empty: 'Complete androgen weekly check-ins',
    },
  ];

  const available = configs.filter((c) => c.data.length >= 2);

  if (available.length === 0) {
    return (
      <Card>
        <p className="text-caption text-ink-secondary">
          Charts appear when you have at least two data points in cycle, sleep, mood, or androgen logs.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {configs.map((chart) => (
        <Card key={chart.title} className="!p-4">
          <p className="text-overline uppercase text-ink-muted mb-3">{chart.title}</p>
          {chart.data.length >= 2 ? (
            <div className="chart-container h-40" role="img" aria-label={chart.title}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chart.data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid {...chartTheme.grid} vertical={false} />
                  <XAxis dataKey="date" {...chartTheme.axis} tick={{ ...chartTheme.axis.tick, fontSize: 9 }} />
                  <YAxis {...chartTheme.axis} width={28} tick={{ ...chartTheme.axis.tick, fontSize: 9 }} />
                  <Tooltip
                    contentStyle={chartTheme.tooltip.contentStyle}
                    formatter={(v: number) => [`${v}${chart.unit}`, chart.title]}
                  />
                  <Line type="monotone" dataKey="value" stroke={chart.color} strokeWidth={2} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-8 text-center text-micro text-ink-tertiary">{chart.empty}</p>
          )}
        </Card>
      ))}
    </div>
  );
}
