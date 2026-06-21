import { useMemo } from 'react';
import { usePersonalization } from '@/contexts/PersonalizationContext';
import { useDashboard } from '@/hooks/useDashboard';
import { SAKHI_STARTER_PROMPTS, SAKHI_QUICK_ACTIONS, type SakhiLanguage } from '@/lib/sakhi';
import { SakhiAvatar } from '@/components/sakhi';
import { cn } from '@/lib/tokens';

interface SakhiWelcomeScreenProps {
  firstName?: string;
  activeLanguage: SakhiLanguage;
  onSelectLanguage: (lang: SakhiLanguage) => void;
  onPrompt: (prompt: string) => void;
  streaming: boolean;
  languageLabels: Record<SakhiLanguage, string>;
  allLanguages: SakhiLanguage[];
}

export function SakhiWelcomeScreen({
  firstName,
  activeLanguage,
  onSelectLanguage,
  onPrompt,
  streaming,
  languageLabels,
  allLanguages,
}: SakhiWelcomeScreenProps) {
  const { t } = usePersonalization();
  const { cycle, smartInsights, todayMood, todaySleep, summary, loading } = useDashboard();

  const contextLine = useMemo(() => {
    if (loading) return null;

    const parts: string[] = [];

    if (cycle.hasData && cycle.cycleDay != null) {
      parts.push(`You're on cycle day ${cycle.cycleDay}${cycle.phase ? ` (${cycle.phase})` : ''}.`);
    }

    if (todaySleep?.sleep_hours != null) {
      parts.push(`You logged ${todaySleep.sleep_hours}h of sleep today.`);
    } else if (summary?.avgSleep) {
      parts.push(`Your recent sleep average is ${summary.avgSleep.toFixed(1)}h.`);
    }

    if (todayMood?.mood) {
      parts.push(`Today's mood: ${todayMood.mood.replace(/_/g, ' ')}.`);
    }

    const topInsight = smartInsights[0];
    if (topInsight) {
      parts.push(topInsight.text.length > 100 ? `${topInsight.text.slice(0, 97)}…` : topInsight.text);
    }

    if (parts.length === 0) {
      return t('chat.emptyDesc');
    }

    return parts.join(' ');
  }, [loading, cycle, todaySleep, summary, todayMood, smartInsights, t]);

  const personalizedPrompts = useMemo(() => {
    const base = SAKHI_STARTER_PROMPTS[activeLanguage] || SAKHI_QUICK_ACTIONS;
    const extra: string[] = [];

    if (cycle.daysUntilNextPeriod != null && cycle.daysUntilNextPeriod <= 7) {
      extra.push('How should I prepare for my upcoming period?');
    }
    if (summary?.topSymptoms?.[0]) {
      extra.push(`Why might I be experiencing ${summary.topSymptoms[0].name}?`);
    }
    if (!cycle.hasData) {
      extra.push('Help me understand my cycle better');
    }

    return [...extra, ...base].slice(0, 6);
  }, [activeLanguage, cycle, summary]);

  return (
    <div className="flex flex-col items-center py-6 text-center animate-fade-in">
      <SakhiAvatar size="lg" className="mb-5" />
      <h2 className="font-display text-title text-ink">
        {firstName ? t('chat.greetingWithName', { name: firstName }) : t('chat.greetingDefault')}
      </h2>
      <p className="mt-3 max-w-sm rounded-2xl border border-border bg-surface-secondary px-4 py-3 text-caption text-ink-secondary leading-relaxed text-left">
        {contextLine}
      </p>
      <p className="mt-2 text-micro text-ink-muted">{t('chat.contextHint')}</p>

      <div className="mt-5 flex flex-wrap justify-center gap-1.5 max-w-sm">
        {allLanguages.map((lang) => (
          <button
            key={lang}
            type="button"
            onClick={() => onSelectLanguage(lang)}
            className={cn(
              'rounded-full px-2.5 py-1 text-micro font-medium transition-all',
              activeLanguage === lang
                ? 'chip-active'
                : 'bg-surface-secondary text-ink-tertiary hover:bg-surface-tertiary',
            )}
          >
            {languageLabels[lang]}
          </button>
        ))}
      </div>

      <div className="mt-6 w-full max-w-sm space-y-2 text-left">
        <p className="text-overline uppercase text-ink-muted px-1">Suggested questions</p>
        {personalizedPrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onPrompt(prompt)}
            disabled={streaming}
            className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-left text-caption font-medium text-ink transition-all hover:border-border-strong hover:bg-surface-elevated disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
