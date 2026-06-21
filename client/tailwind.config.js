/** @type {import('tailwindcss').Config} */

/** Enables `bg-brand-500/40` etc. with theme CSS variables */
const alpha = (name) => `rgb(var(${name}) / <alpha-value>)`;

const brandScale = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const brand = Object.fromEntries(brandScale.map((s) => [s, alpha(`--color-brand-${s}-rgb`)]));

const cycleScale = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
const cycle = Object.fromEntries(cycleScale.map((s) => [s, alpha(`--color-cycle-${s}-rgb`)]));

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand,
        cycle,
        risk: {
          low: alpha('--color-risk-low-rgb'),
          'low-bg': alpha('--color-risk-low-bg-rgb'),
          'low-border': alpha('--color-risk-low-border-rgb'),
          moderate: alpha('--color-risk-moderate-rgb'),
          'moderate-bg': alpha('--color-risk-moderate-bg-rgb'),
          'moderate-border': alpha('--color-risk-moderate-border-rgb'),
          high: alpha('--color-risk-high-rgb'),
          'high-bg': alpha('--color-risk-high-bg-rgb'),
          'high-border': alpha('--color-risk-high-border-rgb'),
        },
        ink: {
          DEFAULT: 'var(--color-ink)',
          secondary: 'var(--color-ink-secondary)',
          tertiary: 'var(--color-ink-tertiary)',
          muted: 'var(--color-ink-muted)',
          inverse: 'var(--color-ink-inverse)',
        },
        surface: {
          DEFAULT: alpha('--color-surface-rgb'),
          secondary: alpha('--color-surface-secondary-rgb'),
          tertiary: alpha('--color-surface-tertiary-rgb'),
          elevated: alpha('--color-surface-elevated-rgb'),
        },
        border: {
          DEFAULT: 'var(--color-border)',
          strong: 'var(--color-border-strong)',
          focus: 'var(--color-border-focus)',
        },
        /* Legacy aliases → brand (migration) */
        cyra: { ...brand },
        lavender: {
          50: brand[50],
          100: brand[100],
          200: brand[200],
          300: brand[300],
          400: brand[400],
          500: brand[500],
        },
        wellness: {
          50: 'var(--color-risk-low-bg)',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: alpha('--color-risk-low-rgb'),
        },
        coral: {
          50: cycle[50],
          100: cycle[100],
          400: cycle[400],
          500: cycle[500],
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        display: ['var(--font-display)'],
      },
      fontSize: {
        'display-xl': ['var(--text-display-xl-size)', { lineHeight: 'var(--text-display-xl-lh)', letterSpacing: 'var(--text-display-xl-ls)', fontWeight: 'var(--text-display-xl-weight)' }],
        'display-lg': ['var(--text-display-lg-size)', { lineHeight: 'var(--text-display-lg-lh)', letterSpacing: 'var(--text-display-lg-ls)', fontWeight: 'var(--text-display-lg-weight)' }],
        'display-md': ['var(--text-display-md-size)', { lineHeight: 'var(--text-display-md-lh)', letterSpacing: 'var(--text-display-md-ls)', fontWeight: 'var(--text-display-md-weight)' }],
        'display-sm': ['var(--text-display-sm-size)', { lineHeight: 'var(--text-display-sm-lh)', letterSpacing: 'var(--text-display-sm-ls)', fontWeight: 'var(--text-display-sm-weight)' }],
        'title-lg': ['var(--text-title-lg-size)', { lineHeight: 'var(--text-title-lg-lh)', fontWeight: 'var(--text-title-lg-weight)' }],
        title: ['var(--text-title-size)', { lineHeight: 'var(--text-title-lh)', fontWeight: 'var(--text-title-weight)' }],
        'title-sm': ['var(--text-title-sm-size)', { lineHeight: 'var(--text-title-sm-lh)', fontWeight: 'var(--text-title-sm-weight)' }],
        'body-lg': ['var(--text-body-lg-size)', { lineHeight: 'var(--text-body-lg-lh)', fontWeight: 'var(--text-body-lg-weight)' }],
        body: ['var(--text-body-size)', { lineHeight: 'var(--text-body-lh)', fontWeight: 'var(--text-body-weight)' }],
        'body-sm': ['var(--text-body-sm-size)', { lineHeight: 'var(--text-body-sm-lh)', fontWeight: 'var(--text-body-sm-weight)' }],
        caption: ['var(--text-caption-size)', { lineHeight: 'var(--text-caption-lh)', fontWeight: 'var(--text-caption-weight)' }],
        micro: ['var(--text-micro-size)', { lineHeight: 'var(--text-micro-lh)', letterSpacing: 'var(--text-micro-ls)', fontWeight: 'var(--text-micro-weight)' }],
        overline: ['var(--text-overline-size)', { lineHeight: 'var(--text-overline-lh)', letterSpacing: 'var(--text-overline-ls)', fontWeight: 'var(--text-overline-weight)' }],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        '3xl': 'var(--radius-3xl)',
        '4xl': 'var(--radius-4xl)',
      },
      boxShadow: {
        0: 'var(--shadow-0)',
        1: 'var(--shadow-1)',
        2: 'var(--shadow-2)',
        3: 'var(--shadow-3)',
        4: 'var(--shadow-4)',
        5: 'var(--shadow-5)',
        xs: 'var(--shadow-1)',
        soft: 'var(--shadow-2)',
        card: 'var(--shadow-3)',
        elevated: 'var(--shadow-4)',
        glow: 'var(--shadow-brand-glow)',
        'glow-cycle': 'var(--shadow-cycle-glow)',
        nav: 'var(--shadow-nav)',
      },
      spacing: {
        'safe-bottom': 'var(--space-safe-bottom)',
        'page-x': 'var(--space-page-x)',
        'page-y': 'var(--space-page-y)',
        'nav-h': 'var(--space-nav-height)',
      },
      transitionDuration: {
        instant: 'var(--duration-instant)',
        fast: 'var(--duration-fast)',
        normal: 'var(--duration-normal)',
        slow: 'var(--duration-slow)',
      },
      transitionTimingFunction: {
        spring: 'var(--ease-spring)',
        smooth: 'var(--ease-default)',
      },
      zIndex: {
        dropdown: 'var(--z-dropdown)',
        sticky: 'var(--z-sticky)',
        nav: 'var(--z-nav)',
        overlay: 'var(--z-overlay)',
        modal: 'var(--z-modal)',
        toast: 'var(--z-toast)',
      },
      animation: {
        'fade-in': 'fadeIn var(--duration-slow) var(--ease-out) forwards',
        'page-enter': 'pageEnter var(--duration-slow) var(--ease-out) forwards',
        'slide-up': 'slideUp var(--duration-slow) var(--ease-default) forwards',
        'slide-down': 'slideDown var(--duration-normal) var(--ease-default) forwards',
        'scale-in': 'scaleIn var(--duration-normal) var(--ease-spring) forwards',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        shimmer: 'shimmer 1.8s ease-in-out infinite',
        float: 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pageEnter: {
          '0%': { transform: 'translateY(6px)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
};
