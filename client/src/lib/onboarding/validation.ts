import type { OnboardingData } from './types';

export type ValidationResult = { valid: true } | { valid: false; message: string };

export function validateOnboardingStep(step: number, data: OnboardingData): ValidationResult {
  switch (step) {
    case 0:
      return { valid: true };
    case 1: {
      const name = data.fullName.trim();
      if (name.length < 2) return { valid: false, message: 'Please enter your name (at least 2 characters)' };
      if (name.length > 80) return { valid: false, message: 'Name is too long' };
      return { valid: true };
    }
    case 2:
      if (!data.ageRange) return { valid: false, message: 'Please select an age range' };
      return { valid: true };
    case 3:
      if (!data.region) return { valid: false, message: 'Please select your region' };
      return { valid: true };
    case 4:
      if (data.healthGoals.length === 0) return { valid: false, message: 'Pick at least one goal so Cyra knows what to focus on' };
      return { valid: true };
    case 5: {
      if (!data.lastPeriodDate) return { valid: false, message: 'Please select your last period date' };
      const selected = new Date(data.lastPeriodDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (selected > today) return { valid: false, message: 'Date cannot be in the future' };
      const yearAgo = new Date();
      yearAgo.setFullYear(yearAgo.getFullYear() - 2);
      if (selected < yearAgo) return { valid: false, message: 'Please enter a date within the last 2 years' };
      return { valid: true };
    }
    case 6:
      if (!data.cycleRegularity) return { valid: false, message: 'Please select an option' };
      return { valid: true };
    case 7:
      if (data.energyLevel === null || data.energyLevel < 1 || data.energyLevel > 10) {
        return { valid: false, message: 'Please set your typical energy level' };
      }
      return { valid: true };
    case 8:
      return { valid: true };
    case 9:
      return { valid: true };
    default:
      return { valid: true };
  }
}
