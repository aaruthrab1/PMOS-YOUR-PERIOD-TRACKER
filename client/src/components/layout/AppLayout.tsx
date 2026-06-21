import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Sun, Activity, Map, MessageCircle, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/tokens';
import { useAuth } from '@/contexts/AuthContext';
import { usePersonalization } from '@/contexts/PersonalizationContext';
import { Avatar } from '@/components/ui';
import { OfflineSyncBanner } from '@/components/layout/OfflineSyncBanner';
import { MobileMoreSheet } from '@/components/layout/MobileMoreSheet';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import type { TranslationKey } from '@/lib/personalization';

type NavItem = {
  to: string;
  labelKey: TranslationKey;
  icon: typeof Sun;
  accent?: boolean;
};

const mobileNav: NavItem[] = [
  { to: '/dashboard', labelKey: 'nav.home', icon: Sun },
  { to: '/tracker', labelKey: 'nav.tracker', icon: Activity },
  { to: '/chat', labelKey: 'nav.chat', icon: MessageCircle, accent: true },
  { to: '/care', labelKey: 'nav.care', icon: Map },
];

const desktopLinks: { to: string; labelKey: TranslationKey }[] = [
  { to: '/dashboard', labelKey: 'nav.home' },
  { to: '/tracker', labelKey: 'nav.tracker' },
  { to: '/chat', labelKey: 'nav.chat' },
  { to: '/care', labelKey: 'nav.care' },
  { to: '/reports', labelKey: 'nav.reports' },
  { to: '/settings', labelKey: 'nav.settings' },
];

export function AppLayout() {
  const { profile } = useAuth();
  const { t } = usePersonalization();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  const isMoreActive = ['/reports', '/settings', '/androgen'].some((p) => location.pathname.startsWith(p));

  return (
    <div className="min-h-screen bg-surface-secondary">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-2xl focus:bg-brand-500 focus:px-4 focus:py-2 focus:text-white"
      >
        {t('common.skipToContent')}
      </a>

      <header className="sticky top-0 z-40 hidden border-b border-border bg-surface/90 backdrop-blur-xl lg:block">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-8">
            <CyraLogo />
            <nav className="flex items-center gap-1" aria-label="Main">
              {desktopLinks.map(({ to, labelKey }) => (
                <NavLink
                  key={to}
                  to={to}
                  aria-current={location.pathname.startsWith(to) && to !== '/dashboard' ? 'page' : location.pathname === to ? 'page' : undefined}
                  className={({ isActive }) =>
                    cn(
                      'rounded-xl px-4 py-2 text-caption font-medium transition-all duration-200',
                      isActive
                        ? 'nav-link-active'
                        : 'text-ink-secondary hover:bg-surface-tertiary hover:text-ink',
                    )
                  }
                >
                  {t(labelKey)}
                </NavLink>
              ))}
            </nav>
          </div>
          <Avatar name={profile?.full_name} src={profile?.avatar_url} size="sm" />
        </div>
      </header>

      <OfflineSyncBanner />

      <main id="main-content" className="lg:mx-auto lg:max-w-5xl xl:max-w-6xl" tabIndex={-1}>
        <ErrorBoundary fallbackTitle="This page encountered an error">
          <Outlet />
        </ErrorBoundary>
      </main>

      <nav
        className="glass-nav fixed bottom-0 left-0 right-0 z-50 pb-safe-bottom lg:hidden"
        aria-label="Bottom navigation"
      >
        <div className="mx-auto flex max-w-lg items-end justify-around px-1 pt-1.5 pb-2">
          {mobileNav.map(({ to, labelKey, icon: Icon, accent }) => {
            if (accent) {
              return (
                <NavLink
                  key={to}
                  to={to}
                  aria-current={location.pathname.startsWith(to) ? 'page' : undefined}
                  className={({ isActive }) =>
                    cn(
                      'nav-tab-sakhi flex min-h-[44px] min-w-[56px] flex-1 flex-col items-center justify-end gap-0.5 pb-0.5',
                      isActive && 'nav-tab-sakhi--active text-brand-500',
                      !isActive && 'text-ink-tertiary',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className={cn('nav-tab-sakhi-icon', !isActive && 'opacity-90')}>
                        <Icon className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
                      </div>
                      <span className={cn('truncate text-[11px] font-semibold leading-tight', isActive && 'text-brand-500')}>
                        {t(labelKey)}
                      </span>
                    </>
                  )}
                </NavLink>
              );
            }

            return (
              <NavLink
                key={to}
                to={to}
                aria-current={location.pathname.startsWith(to) && to !== '/dashboard' ? 'page' : location.pathname === to ? 'page' : undefined}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-[44px] min-w-[56px] flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl py-1.5 transition-all duration-200',
                    isActive ? 'text-brand-500' : 'text-ink-tertiary',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200',
                      isActive && 'nav-tab-icon-active',
                    )}>
                      <Icon className="h-5 w-5" strokeWidth={isActive ? 2.25 : 1.75} aria-hidden="true" />
                    </div>
                    <span className={cn('truncate text-[11px] font-medium leading-tight', isActive && 'font-semibold')}>
                      {t(labelKey)}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            aria-expanded={moreOpen}
            aria-haspopup="dialog"
            className={cn(
              'flex min-h-[44px] min-w-[56px] flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl py-1.5 transition-all duration-200',
              isMoreActive ? 'text-brand-500' : 'text-ink-tertiary',
            )}
          >
            <div className={cn(
              'flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200',
              isMoreActive && 'nav-tab-icon-active',
            )}>
              <LayoutGrid className="h-5 w-5" strokeWidth={isMoreActive ? 2.25 : 1.75} aria-hidden="true" />
            </div>
            <span className={cn('truncate text-[11px] font-medium leading-tight', isMoreActive && 'font-semibold')}>
              {t('nav.more')}
            </span>
          </button>
        </div>
      </nav>

      <MobileMoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
    </div>
  );
}

export function CyraLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-9 w-9 text-sm',
    lg: 'h-12 w-12 text-lg',
  };

  return (
    <div className="flex items-center gap-2.5">
      <div className={cn('flex items-center justify-center rounded-xl gradient-brand shadow-glow', sizes[size])}>
        <span className="font-display font-semibold text-white">C</span>
      </div>
      <span className="font-display text-title text-ink">Cyra</span>
    </div>
  );
}

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen gradient-hero">
      <div className="mx-auto flex min-h-screen max-w-lg flex-col px-page-x">
        {children}
      </div>
    </div>
  );
}
