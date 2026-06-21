import { usePersonalization } from '@/contexts/PersonalizationContext';
import { usePageTitle } from '@/hooks/usePageTitle';
import type { TranslationKey } from '@/lib/personalization';

/** Set document title using localized page key */
export function useLocalizedPageTitle(key: TranslationKey) {
  const { t } = usePersonalization();
  usePageTitle(t(key));
}
