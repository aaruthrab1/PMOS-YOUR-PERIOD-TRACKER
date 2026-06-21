/** Parse extended daily check-in fields stored in metabolic log notes JSON */

export interface MetabolicExtras {
  waterGlasses?: number;
  symptoms?: string[];
}

export function parseMetabolicExtras(notes: string | null): MetabolicExtras {
  if (!notes) return {};
  try {
    const parsed = JSON.parse(notes) as MetabolicExtras & { water_glasses?: number };
    return {
      waterGlasses: parsed.waterGlasses ?? parsed.water_glasses,
      symptoms: parsed.symptoms,
    };
  } catch {
    return {};
  }
}

export function serializeMetabolicExtras(extras: MetabolicExtras): string | null {
  if (extras.waterGlasses == null && (!extras.symptoms || extras.symptoms.length === 0)) {
    return null;
  }
  return JSON.stringify({
    water_glasses: extras.waterGlasses,
    symptoms: extras.symptoms ?? [],
  });
}
