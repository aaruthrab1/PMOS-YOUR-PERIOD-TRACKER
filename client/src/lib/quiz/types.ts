export type QuizQuestionId =
  | 'welcome'
  | 'goals'
  | 'conditions'
  | 'cycle_regularity'
  | 'cycle_length'
  | 'energy'
  | 'symptoms'
  | 'tracking';

export type QuizAnswers = Partial<Record<QuizQuestionId, string[]>>;

export interface QuizProgress {
  step: number;
  answers: QuizAnswers;
  updatedAt: number;
}

export interface QuizQuestionOption {
  value: string;
  label: string;
}

export interface QuizQuestion {
  id: QuizQuestionId;
  title: string;
  subtitle: string;
  /** Warm, conversational opener */
  encouragement: string;
  /** Plain-language reason this question matters */
  whyWeAsk: string;
  multi: boolean;
  optional?: boolean;
  illustration: QuizIllustrationId;
  options?: QuizQuestionOption[];
  /** Slider config for energy question */
  slider?: { min: number; max: number; labels: [string, string] };
}

export type QuizIllustrationId =
  | 'welcome'
  | 'goals'
  | 'conditions'
  | 'cycle'
  | 'energy'
  | 'symptoms'
  | 'tracking'
  | 'snapshot';

export interface QuizFocusArea {
  id: string;
  label: string;
  description: string;
}

export interface QuizNextAction {
  id: string;
  label: string;
  description: string;
  href: string;
  primary?: boolean;
}

export interface QuizHealthSnapshot {
  score: number;
  headline: string;
  summary: string;
  insights: string[];
  focusAreas: QuizFocusArea[];
  nextActions: QuizNextAction[];
}
