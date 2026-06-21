/**
 * Cyra chart theme — theme-aware for Recharts
 * Uses clinical palette; cycle mauve for menstrual series only.
 */

import { colors } from '@/lib/tokens';

const light = {
  grid: { stroke: colors.border.DEFAULT, strokeDasharray: '3 3' },
  axis: {
    tick: { fontSize: 11, fill: colors.ink.muted },
    tickLine: false,
    axisLine: false,
  },
  tooltip: {
    contentStyle: {
      borderRadius: '12px',
      border: `1px solid ${colors.border.DEFAULT}`,
      boxShadow: '0 1px 3px rgba(17, 24, 39, 0.06)',
      fontSize: '12px',
      backgroundColor: colors.surface.DEFAULT,
      color: colors.ink.DEFAULT,
    },
  },
  series: {
    brand: {
      stroke: colors.brand[500],
      fill: colors.brand[500],
      fillOpacity: 0.12,
      activeDot: { r: 4, fill: colors.brand[500], stroke: colors.surface.DEFAULT, strokeWidth: 2 },
    },
    cycle: {
      stroke: colors.cycle[500],
      fill: colors.cycle[500],
      fillOpacity: 0.12,
      activeDot: { r: 4, fill: colors.cycle[500], stroke: colors.surface.DEFAULT, strokeWidth: 2 },
    },
    neutral: {
      stroke: colors.ink.tertiary,
      fill: colors.ink.muted,
      fillOpacity: 0.08,
    },
    riskLow: { stroke: colors.risk.low, fill: colors.risk.low },
    riskModerate: { stroke: colors.risk.moderate, fill: colors.risk.moderate },
    riskHigh: { stroke: colors.risk.high, fill: colors.risk.high },
  },
} as const;

/** Premium dark palette — matches tokens.css .dark */
const dark = {
  grid: { stroke: '#1E2533', strokeDasharray: '3 3' },
  axis: {
    tick: { fontSize: 11, fill: '#78889A' },
    tickLine: false,
    axisLine: false,
  },
  tooltip: {
    contentStyle: {
      borderRadius: '12px',
      border: '1px solid #283040',
      boxShadow: 'none',
      fontSize: '12px',
      backgroundColor: '#1B2230',
      color: '#F8FAFC',
    },
  },
  series: {
    brand: {
      stroke: '#7C6BFF',
      fill: '#7C6BFF',
      fillOpacity: 0.12,
      activeDot: { r: 4, fill: '#7C6BFF', stroke: '#121621', strokeWidth: 2 },
    },
    cycle: {
      stroke: '#B8939F',
      fill: '#B8939F',
      fillOpacity: 0.1,
      activeDot: { r: 4, fill: '#B8939F', stroke: '#121621', strokeWidth: 2 },
    },
    neutral: {
      stroke: '#78889A',
      fill: '#78889A',
      fillOpacity: 0.08,
    },
    riskLow: { stroke: '#34D399', fill: '#34D399' },
    riskModerate: { stroke: '#FBBF24', fill: '#FBBF24' },
    riskHigh: { stroke: '#F87171', fill: '#F87171' },
  },
} as const;

export type ChartTheme = {
  grid: { stroke: string; strokeDasharray: string };
  axis: {
    tick: { fontSize: number; fill: string };
    tickLine: boolean;
    axisLine: boolean;
  };
  tooltip: {
    contentStyle: {
      borderRadius: string;
      border: string;
      boxShadow: string;
      fontSize: string;
      backgroundColor: string;
      color: string;
    };
  };
  series: {
    brand: {
      stroke: string;
      fill: string;
      fillOpacity: number;
      activeDot: { r: number; fill: string; stroke: string; strokeWidth: number };
    };
    cycle: {
      stroke: string;
      fill: string;
      fillOpacity: number;
      activeDot: { r: number; fill: string; stroke: string; strokeWidth: number };
    };
    neutral: {
      stroke: string;
      fill: string;
      fillOpacity: number;
    };
    riskLow: { stroke: string; fill: string };
    riskModerate: { stroke: string; fill: string };
    riskHigh: { stroke: string; fill: string };
  };
};

export function getChartTheme(mode: 'light' | 'dark'): ChartTheme {
  return mode === 'dark' ? dark : light;
}

/** @deprecated Use getChartTheme(resolvedTheme) or useChartTheme() */
export const chartTheme = light;

export function brandGradientId(suffix = '') {
  return `brandGrad${suffix}`;
}

export function cycleGradientId(suffix = '') {
  return `cycleGrad${suffix}`;
}
