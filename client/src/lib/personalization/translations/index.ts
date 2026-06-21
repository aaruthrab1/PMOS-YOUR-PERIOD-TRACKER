import type { CyraLanguageCode } from '../types';
import type { TranslationBundle, TranslationKey } from './en';
import { EN_BUNDLE } from './en';
import { HI_BUNDLE } from './locales/hi';
import { TA_BUNDLE } from './locales/ta';
import { TE_BUNDLE } from './locales/te';
import { KN_BUNDLE } from './locales/kn';
import { ML_BUNDLE } from './locales/ml';
import { BN_BUNDLE } from './locales/bn';
import { MR_BUNDLE } from './locales/mr';
import { GU_BUNDLE } from './locales/gu';
import { PA_BUNDLE } from './locales/pa';

function mergeBundle(partial: Partial<TranslationBundle>): TranslationBundle {
  return { ...EN_BUNDLE, ...partial };
}

export const LANGUAGE_BUNDLES: Record<CyraLanguageCode, TranslationBundle> = {
  en: EN_BUNDLE,
  hi: mergeBundle(HI_BUNDLE),
  ta: mergeBundle(TA_BUNDLE),
  te: mergeBundle(TE_BUNDLE),
  kn: mergeBundle(KN_BUNDLE),
  ml: mergeBundle(ML_BUNDLE),
  bn: mergeBundle(BN_BUNDLE),
  mr: mergeBundle(MR_BUNDLE),
  gu: mergeBundle(GU_BUNDLE),
  pa: mergeBundle(PA_BUNDLE),
};

export function createTranslator(language: CyraLanguageCode) {
  const bundle = LANGUAGE_BUNDLES[language] ?? EN_BUNDLE;

  return function t(key: TranslationKey, params?: Record<string, string | number>): string {
    let text = bundle[key] ?? EN_BUNDLE[key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      }
    }
    return text;
  };
}

export type { TranslationKey, TranslationBundle };
