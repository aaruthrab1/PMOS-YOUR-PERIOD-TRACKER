/**
 * Cyra Design System — TypeScript tokens
 * @see client/src/styles/tokens.css
 */

export const colors = {
  brand: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#7c6fe0',
    500: '#5b4bdb',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
    950: '#1e1b4b',
  },
  cycle: {
    50: '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899',
    600: '#db2777',
    700: '#be185d',
    800: '#9d174d',
    900: '#831843',
  },
  risk: {
    low: '#059669',
    lowBg: '#ecfdf5',
    lowBorder: '#a7f3d0',
    moderate: '#d97706',
    moderateBg: '#fffbeb',
    moderateBorder: '#fde68a',
    high: '#dc2626',
    highBg: '#fef2f2',
    highBorder: '#fecaca',
  },
  ink: {
    DEFAULT: '#111827',
    secondary: '#374151',
    tertiary: '#6b7280',
    muted: '#6b7280',
    inverse: '#ffffff',
  },
  surface: {
    DEFAULT: '#ffffff',
    secondary: '#f8f7fa',
    tertiary: '#f3f4f6',
    elevated: '#ffffff',
  },
  border: {
    DEFAULT: '#e5e7eb',
    strong: '#d1d5db',
  },
} as const;

export const typography = {
  display: {
    xl: { size: '2.25rem', lineHeight: '1.15', letterSpacing: '-0.025em', weight: 600 },
    lg: { size: '1.875rem', lineHeight: '1.2', letterSpacing: '-0.02em', weight: 600 },
    md: { size: '1.625rem', lineHeight: '1.22', letterSpacing: '-0.018em', weight: 600 },
    sm: { size: '1.375rem', lineHeight: '1.3', letterSpacing: '-0.015em', weight: 600 },
  },
  title: {
    lg: { size: '1.125rem', lineHeight: '1.35', weight: 600 },
    DEFAULT: { size: '1.0625rem', lineHeight: '1.4', weight: 600 },
    sm: { size: '0.9375rem', lineHeight: '1.45', weight: 600 },
  },
  body: {
    lg: { size: '1rem', lineHeight: '1.65', weight: 400 },
    DEFAULT: { size: '0.9375rem', lineHeight: '1.6', weight: 400 },
    sm: { size: '0.875rem', lineHeight: '1.55', weight: 400 },
  },
  caption: { size: '0.8125rem', lineHeight: '1.5', weight: 400 },
  micro: { size: '0.75rem', lineHeight: '1.45', letterSpacing: '0.01em', weight: 500 },
  overline: { size: '0.6875rem', lineHeight: '1.35', letterSpacing: '0.06em', weight: 600 },
} as const;

export const spacing = {
  pageX: '1.5rem',
  pageY: '2rem',
  navHeight: '5rem',
  scale: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96] as const,
} as const;

export const elevation = {
  0: 'none',
  1: '0 1px 2px rgba(17, 24, 39, 0.04)',
  2: '0 1px 3px rgba(17, 24, 39, 0.06)',
  3: '0 2px 8px rgba(17, 24, 39, 0.06)',
  4: '0 4px 12px rgba(17, 24, 39, 0.08)',
  5: '0 8px 24px rgba(17, 24, 39, 0.1)',
} as const;

export const radius = {
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.125rem',
  '3xl': '1.25rem',
  '4xl': '1.5rem',
  full: '9999px',
} as const;

export const motion = {
  instant: '100ms',
  fast: '150ms',
  normal: '200ms',
  slow: '300ms',
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.34, 1.2, 0.64, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
  },
} as const;

/** @deprecated Use colors.brand */
export const tokens = {
  colors: {
    primary: colors.brand[500],
    primaryDark: colors.brand[600],
    primaryLight: colors.brand[50],
    cycle: colors.cycle[500],
    background: colors.surface.secondary,
    surface: colors.surface.DEFAULT,
    text: colors.ink.DEFAULT,
    textSecondary: colors.ink.secondary,
    textTertiary: colors.ink.tertiary,
    border: colors.border.DEFAULT,
    success: colors.risk.low,
    warning: colors.risk.moderate,
    error: colors.risk.high,
  },
  radius,
  shadow: {
    card: elevation[1],
    elevated: elevation[2],
  },
  spacing,
  transition: {
    fast: motion.fast,
    normal: motion.normal,
    slow: motion.slow,
  },
} as const;

export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
