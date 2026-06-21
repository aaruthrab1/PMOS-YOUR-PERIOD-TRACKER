/** Five-step health journey — primary Care experience */
export type JourneyStepId =
  | 'symptoms_noticed'
  | 'doctor_visited'
  | 'blood_tests'
  | 'ultrasound'
  | 'care_plan';

/** @deprecated Use JourneyStepId */
export type DiagnosisStepId = JourneyStepId;

export interface JourneyStepState {
  completed: boolean;
  completedDate: string | null;
  notes: string;
}

/** @deprecated Use JourneyStepState */
export type DiagnosisStepState = JourneyStepState;

export interface JourneyProgress {
  steps: Record<JourneyStepId, JourneyStepState>;
  updatedAt: number;
}

/** @deprecated Use JourneyProgress */
export type DiagnosisJourneyProgress = JourneyProgress;

export type JourneyChecklistType =
  | 'symptom_summary'
  | 'appointment_prep'
  | 'visit_checklist'
  | 'test_checklist'
  | 'scan_checklist'
  | 'care_plan_checklist';

export interface JourneyStepAction {
  type: JourneyChecklistType;
  label: string;
}

export interface JourneyStepContent {
  id: JourneyStepId;
  order: number;
  title: string;
  subtitle: string;
  guidance: string;
  whatToExpect: string;
  whatToAsk: string[];
  questionsForDoctor: string[];
  actions: JourneyStepAction[];
}

/** @deprecated Use JourneyStepContent */
export type DiagnosisStepContent = JourneyStepContent;

export type CareResource =
  | 'clinics'
  | 'tests'
  | 'cycle'
  | 'doctor_prep';

/** @deprecated Use CareResource — pill nav removed from Care page */
export type CareTab = 'diagnosis' | CareResource;

export type CareCity =
  | 'Delhi'
  | 'Mumbai'
  | 'Bengaluru'
  | 'Chennai'
  | 'Hyderabad'
  | 'Kolkata'
  | 'Pune'
  | 'Ahmedabad'
  | 'Jaipur'
  | 'Kochi';

export interface Clinic {
  id: string;
  city: CareCity;
  name: string;
  area: string;
  specialty: string;
  mapsQuery: string;
}

export interface TestGuideItem {
  id: string;
  name: string;
  measures: { medical: string; simple: string };
  whyOrdered: { medical: string; simple: string };
}

export interface DoctorPrepDocument {
  symptomTimeline: { date: string; summary: string }[];
  healthSummary: string[];
  questionsToAsk: string[];
  keyConcerns: string[];
  testChecklist: { name: string; reason: string; suggested: boolean }[];
  appointmentNotes: string;
}

export interface JourneyChecklistItem {
  id: string;
  text: string;
  detail?: string;
}

export interface JourneyChecklist {
  type: JourneyChecklistType;
  title: string;
  intro: string;
  items: JourneyChecklistItem[];
  questions?: string[];
  footer: string;
}
