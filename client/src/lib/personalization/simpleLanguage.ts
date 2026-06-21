import type { DualCopy } from './types';

/** Centralized medical → plain language glossary */
export const MEDICAL_GLOSSARY: Record<string, DualCopy> = {
  'insulin resistance': {
    medical: 'Insulin resistance',
    simple: 'Your body has trouble using sugar properly',
  },
  ovulation: {
    medical: 'Ovulation',
    simple: 'Release of an egg',
  },
  amenorrhea: {
    medical: 'Amenorrhea',
    simple: 'Missing periods',
  },
  pcos: {
    medical: 'PCOS',
    simple: 'When ovaries produce extra hormones and cycles may become irregular',
  },
  pmos: {
    medical: 'PMOS',
    simple: 'Premenstrual and ovulatory symptoms — mood, energy, and body changes around your cycle',
  },
  endometriosis: {
    medical: 'Endometriosis',
    simple: 'Tissue similar to the uterine lining grows outside the uterus, which can cause pain',
  },
  hyperandrogenism: {
    medical: 'Hyperandrogenism',
    simple: 'Higher-than-usual levels of certain hormones that can affect skin, hair, and cycles',
  },
  luteal: {
    medical: 'Luteal phase',
    simple: 'The days after ovulation and before your period',
  },
  follicular: {
    medical: 'Follicular phase',
    simple: 'The first half of your cycle, before ovulation',
  },
  progesterone: {
    medical: 'Progesterone',
    simple: 'A hormone that rises after ovulation and can affect mood and sleep',
  },
  estrogen: {
    medical: 'Estrogen',
    simple: 'A hormone that helps regulate your cycle and can affect energy and mood',
  },
  testosterone: {
    medical: 'Testosterone',
    simple: 'A hormone everyone has — in some people, higher levels can affect skin and hair',
  },
  tsh: {
    medical: 'TSH',
    simple: 'A blood test that checks how your thyroid gland is working',
  },
  lh: {
    medical: 'LH',
    simple: 'A hormone test that can show if ovulation is happening',
  },
  fsh: {
    medical: 'FSH',
    simple: 'A hormone test related to egg development and cycle health',
  },
  amh: {
    medical: 'AMH',
    simple: 'A blood test sometimes used to understand egg supply',
  },
  metabolic: {
    medical: 'Metabolic',
    simple: 'How your body uses energy from food',
  },
  androgen: {
    medical: 'Androgen',
    simple: 'Hormones that can affect hair growth, skin, and cycles',
  },
  anovulatory: {
    medical: 'Anovulatory',
    simple: 'Cycles where an egg may not be released',
  },
  dysmenorrhea: {
    medical: 'Dysmenorrhea',
    simple: 'Painful periods',
  },
  oligomenorrhea: {
    medical: 'Oligomenorrhea',
    simple: 'Periods that come less often than usual',
  },
  hyperglycemia: {
    medical: 'Hyperglycemia',
    simple: 'Higher-than-usual blood sugar',
  },
  hypothyroidism: {
    medical: 'Hypothyroidism',
    simple: 'When the thyroid gland is underactive, which can affect energy and cycles',
  },
};

/** Sorted longest-first so multi-word terms match before substrings */
const TERM_ENTRIES = Object.entries(MEDICAL_GLOSSARY).sort(
  (a, b) => b[0].length - a[0].length,
);

export function pickCopy(copy: DualCopy, simpleLanguage: boolean): string {
  return simpleLanguage ? copy.simple : copy.medical;
}

export function simplifyText(text: string, simpleLanguage: boolean): string {
  if (!simpleLanguage || !text) return text;

  let result = text;
  for (const [term, copy] of TERM_ENTRIES) {
    const regex = new RegExp(`\\b${escapeRegex(term)}\\b`, 'gi');
    result = result.replace(regex, (match) => {
      if (match === match.toUpperCase()) return copy.simple.toUpperCase();
      if (match[0] === match[0].toUpperCase()) {
        return copy.simple.charAt(0).toUpperCase() + copy.simple.slice(1);
      }
      return copy.simple;
    });
  }
  return result;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function glossaryTerm(key: keyof typeof MEDICAL_GLOSSARY, simpleLanguage: boolean): string {
  const entry = MEDICAL_GLOSSARY[key];
  return entry ? pickCopy(entry, simpleLanguage) : key;
}
