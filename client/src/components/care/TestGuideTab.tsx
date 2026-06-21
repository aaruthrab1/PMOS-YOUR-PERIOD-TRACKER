import { useState } from 'react';
import { ChevronDown, ChevronUp, FlaskConical } from 'lucide-react';
import { Card } from '@/components/ui';
import { SimpleLanguageToggle } from '@/components/androgen/SimpleLanguageToggle';
import { TEST_GUIDE_ITEMS } from '@/lib/care/testGuide';
import { usePersonalization } from '@/contexts/PersonalizationContext';

export function TestGuideTab() {
  const { simpleLanguage, setSimpleLanguage, simplify } = usePersonalization();
  const [openId, setOpenId] = useState<string | null>(TEST_GUIDE_ITEMS[0]?.id ?? null);

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <p className="text-caption text-ink-secondary">
          Tap a test to learn what it measures and why doctors order it.
        </p>
        <SimpleLanguageToggle enabled={simpleLanguage} onChange={setSimpleLanguage} />
      </div>

      <div className="space-y-3">
        {TEST_GUIDE_ITEMS.map((test) => {
          const isOpen = openId === test.id;
          return (
            <Card key={test.id} className="!p-0 overflow-hidden">
              <button
                type="button"
                className="flex w-full items-center gap-3 px-4 py-4 text-left"
                onClick={() => setOpenId(isOpen ? null : test.id)}
                aria-expanded={isOpen}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-tertiary text-brand-600">
                  <FlaskConical className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                </div>
                <span className="flex-1 font-display text-title-sm text-ink">{simplify(test.name)}</span>
                {isOpen ? (
                  <ChevronUp className="h-5 w-5 text-ink-muted" aria-hidden="true" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-ink-muted" aria-hidden="true" />
                )}
              </button>
              {isOpen && (
                <div className="border-t border-border/50 px-4 pb-4 pt-3 space-y-3">
                  <div>
                    <p className="text-micro font-semibold text-ink-tertiary uppercase tracking-wide">What it measures</p>
                    <p className="mt-1 text-caption text-ink-secondary leading-relaxed">
                      {simpleLanguage ? test.measures.simple : test.measures.medical}
                    </p>
                  </div>
                  <div>
                    <p className="text-micro font-semibold text-ink-tertiary uppercase tracking-wide">Why ordered</p>
                    <p className="mt-1 text-caption text-ink-secondary leading-relaxed">
                      {simpleLanguage ? test.whyOrdered.simple : test.whyOrdered.medical}
                    </p>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
