import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Settings, Droplets, X } from 'lucide-react';
import { usePersonalization } from '@/contexts/PersonalizationContext';
import type { TranslationKey } from '@/lib/personalization';
import { cn } from '@/lib/tokens';

interface MobileMoreSheetProps {
  open: boolean;
  onClose: () => void;
}

const LINKS: { to: string; icon: typeof FileText; labelKey: TranslationKey; descKey: TranslationKey }[] = [
  { to: '/reports', icon: FileText, labelKey: 'nav.more.reports', descKey: 'nav.more.reportsDesc' },
  { to: '/androgen', icon: Droplets, labelKey: 'nav.androgen', descKey: 'nav.more.androgenDesc' },
  { to: '/settings', icon: Settings, labelKey: 'nav.settings', descKey: 'nav.more.settingsDesc' },
];

export function MobileMoreSheet({ open, onClose }: MobileMoreSheetProps) {
  const { t } = usePersonalization();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] lg:hidden" role="dialog" aria-modal="true" aria-label={t('nav.more')}>
      <button type="button" className="absolute inset-0 bg-surface-overlay" aria-label={t('common.close')} onClick={onClose} />
      <div className={cn(
        'absolute bottom-0 left-0 right-0 rounded-t-4xl bg-surface px-5 pt-4 pb-safe-bottom',
        'shadow-5 ring-1 ring-border/40 animate-slide-up',
      )}>
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" aria-hidden="true" />
        <div className="mb-4 flex items-center justify-between">
          <p className="font-display text-title text-ink">{t('nav.more')}</p>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-secondary text-ink-secondary"
            aria-label={t('common.close')}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <nav className="space-y-2 pb-4">
          {LINKS.map(({ to, icon: Icon, labelKey, descKey }) => (
            <Link
              key={to}
              to={to}
              onClick={onClose}
              className="flex items-center gap-4 rounded-2xl px-4 py-3.5 transition-colors hover:bg-surface-secondary active:scale-[0.99]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-tertiary text-brand-500">
                <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
              </div>
              <div>
                <p className="text-caption font-semibold text-ink">{t(labelKey)}</p>
                <p className="text-micro text-ink-tertiary">{t(descKey)}</p>
              </div>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
