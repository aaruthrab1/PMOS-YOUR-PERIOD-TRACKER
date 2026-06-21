import type { SakhiLanguage } from '../config/sakhi.prompt.js';

/** Unicode script ranges for Indic language detection */
const SCRIPTS = {
  devanagari: /[\u0900-\u097F]/,
  bengali: /[\u0980-\u09FF]/,
  gurmukhi: /[\u0A00-\u0A7F]/,
  gujarati: /[\u0A80-\u0AFF]/,
  tamil: /[\u0B80-\u0BFF]/,
  telugu: /[\u0C00-\u0C7F]/,
  kannada: /[\u0C80-\u0CFF]/,
  malayalam: /[\u0D00-\u0D7F]/,
};

/** Marathi-specific markers in Devanagari script */
const MARATHI_MARKERS = /\b(आहे|नाही|मला|तुम्ही|काय|होते|माझ|तुझ|बाब|कधी)\b/;

/** Hindi-specific markers in Devanagari script */
const HINDI_MARKERS = /\b(है|हैं|मुझे|आप|क्या|था|थी|मेर|आपक|कैसे|क्यों|बहुत)\b/;

const LATIN_RATIO_THRESHOLD = 0.6;

function scriptCount(text: string, regex: RegExp): number {
  return (text.match(new RegExp(regex.source, 'g')) || []).length;
}

/**
 * Detects the primary language of user input.
 * Falls back to preferredLanguage if text is ambiguous (e.g. short English "ok").
 */
export function detectLanguage(
  text: string,
  preferredLanguage?: SakhiLanguage
): SakhiLanguage {
  const trimmed = text.trim();
  if (!trimmed) return preferredLanguage || 'English';

  const counts = {
    devanagari: scriptCount(trimmed, SCRIPTS.devanagari),
    bengali: scriptCount(trimmed, SCRIPTS.bengali),
    gurmukhi: scriptCount(trimmed, SCRIPTS.gurmukhi),
    gujarati: scriptCount(trimmed, SCRIPTS.gujarati),
    tamil: scriptCount(trimmed, SCRIPTS.tamil),
    telugu: scriptCount(trimmed, SCRIPTS.telugu),
    kannada: scriptCount(trimmed, SCRIPTS.kannada),
    malayalam: scriptCount(trimmed, SCRIPTS.malayalam),
  };

  const maxScript = Object.entries(counts).reduce(
    (best, [script, count]) => (count > best.count ? { script, count } : best),
    { script: 'none', count: 0 }
  );

  if (maxScript.count > 0) {
    switch (maxScript.script) {
      case 'devanagari':
        return MARATHI_MARKERS.test(trimmed) && !HINDI_MARKERS.test(trimmed) ? 'Marathi' : 'Hindi';
      case 'bengali':
        return 'Bengali';
      case 'gurmukhi':
        return 'Punjabi';
      case 'gujarati':
        return 'Gujarati';
      case 'tamil':
        return 'Tamil';
      case 'telugu':
        return 'Telugu';
      case 'kannada':
        return 'Kannada';
      case 'malayalam':
        return 'Malayalam';
    }
  }

  // Latin script — check if mostly English
  const latinChars = (trimmed.match(/[a-zA-Z]/g) || []).length;
  const totalAlpha = (trimmed.match(/\p{L}/gu) || []).length || 1;
  if (latinChars / totalAlpha >= LATIN_RATIO_THRESHOLD) {
    return 'English';
  }

  return preferredLanguage || 'English';
}

export function isValidSakhiLanguage(lang: string): lang is SakhiLanguage {
  const supported = [
    'English', 'Hindi', 'Tamil', 'Telugu', 'Kannada',
    'Malayalam', 'Bengali', 'Marathi', 'Gujarati', 'Punjabi',
  ];
  return supported.includes(lang);
}
