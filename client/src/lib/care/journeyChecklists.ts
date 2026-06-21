import type {
  DoctorPrepDocument,
  JourneyChecklist,
  JourneyChecklistType,
  JourneyStepContent,
} from './types';
import { TEST_GUIDE_ITEMS } from './testGuide';

function staticVisitItems(): JourneyChecklist['items'] {
  return [
    { id: 'v1', text: 'List your top 3 symptoms and when they started' },
    { id: 'v2', text: 'Note cycle length and last period date' },
    { id: 'v3', text: 'Bring a list of medications and supplements' },
    { id: 'v4', text: 'Write down questions — do not leave without asking them' },
    { id: 'v5', text: 'Ask who to contact if results or symptoms worsen' },
    { id: 'v6', text: 'Request a summary of next steps before you leave' },
  ];
}

function staticTestItems(): JourneyChecklist['items'] {
  return TEST_GUIDE_ITEMS.filter((t) => t.id !== 'pelvic_ultrasound').map((t) => ({
    id: t.id,
    text: t.name,
    detail: t.whyOrdered.simple,
  }));
}

function staticScanItems(): JourneyChecklist['items'] {
  const u = TEST_GUIDE_ITEMS.find((t) => t.id === 'pelvic_ultrasound');
  return [
    { id: 's1', text: 'Confirm scan type (transabdominal vs transvaginal)' },
    { id: 's2', text: 'Ask which cycle day is best for scheduling' },
    { id: 's3', text: 'Request a chaperone if that helps you feel comfortable' },
    { id: 's4', text: 'Ask for a copy of the report and images if available' },
    {
      id: 's5',
      text: u?.name ?? 'Pelvic ultrasound',
      detail: u?.whyOrdered.simple,
    },
  ];
}

function staticCarePlanItems(): JourneyChecklist['items'] {
  return [
    { id: 'c1', text: 'Confirm medication dose, timing, and duration' },
    { id: 'c2', text: 'Ask what side effects to watch for and when to call' },
    { id: 'c3', text: 'Schedule your next follow-up before leaving' },
    { id: 'c4', text: 'Set a reminder to log symptoms weekly in Cyra' },
    { id: 'c5', text: 'Note any lifestyle changes your clinician recommended' },
    { id: 'c6', text: 'Ask what to do if the plan is not helping after 4–6 weeks' },
  ];
}

export function generateJourneyChecklist(
  type: JourneyChecklistType,
  step: JourneyStepContent,
  prep: DoctorPrepDocument | null,
): JourneyChecklist {
  switch (type) {
    case 'symptom_summary':
      return {
        type,
        title: 'Symptom summary',
        intro: 'Use this before your first conversation with a clinician. Pull from your Cyra tracker logs where you can.',
        items: [
          { id: 'ss1', text: 'Main symptoms (rank by impact on daily life)' },
          { id: 'ss2', text: 'When symptoms started and how they change across your cycle' },
          { id: 'ss3', text: 'Sleep, energy, and mood patterns (last 2–4 weeks)' },
          { id: 'ss4', text: 'Period dates and cycle length if known' },
          ...(prep?.symptomTimeline.slice(0, 5).map((t, i) => ({
            id: `log-${i}`,
            text: `${t.date}: ${t.summary}`,
          })) ?? []),
          ...(prep?.keyConcerns.map((c, i) => ({
            id: `concern-${i}`,
            text: c,
            detail: 'From your recent logs',
          })) ?? []),
        ],
        questions: step.questionsForDoctor,
        footer: 'This summary supports your conversation — it is not a diagnosis.',
      };

    case 'appointment_prep':
      return {
        type,
        title: 'Appointment preparation',
        intro: prep?.appointmentNotes ?? 'Walk in knowing your data. You deserve to be heard.',
        items: [
          ...(prep?.healthSummary.map((s, i) => ({ id: `hs-${i}`, text: s })) ?? [
            { id: 'hs0', text: 'Log mood, sleep, and periods in Cyra for richer prep' },
          ]),
          ...(prep?.keyConcerns.map((c, i) => ({
            id: `kc-${i}`,
            text: c,
            detail: 'Priority topic',
          })) ?? []),
        ],
        questions: [
          ...step.whatToAsk,
          ...(prep?.questionsToAsk ?? []),
        ],
        footer: 'Generated from your Cyra profile and tracker data.',
      };

    case 'visit_checklist':
      return {
        type,
        title: 'Visit checklist',
        intro: 'Bring this to your appointment. Check items off as you go.',
        items: staticVisitItems(),
        questions: step.questionsForDoctor,
        footer: 'Take your time — good care includes good communication.',
      };

    case 'test_checklist':
      return {
        type,
        title: 'Blood test checklist',
        intro: 'Discuss these with your clinician. Suggested tests are based on common workups — your doctor decides what is right for you.',
        items: prep
          ? prep.testChecklist
              .filter((t) => t.name !== 'Pelvic Ultrasound')
              .map((t, i) => ({
                id: `test-${i}`,
                text: t.name,
                detail: t.suggested ? `Suggested — ${t.reason}` : t.reason,
              }))
          : staticTestItems(),
        questions: step.whatToAsk,
        footer: 'Ask which cycle day to test and whether fasting is required.',
      };

    case 'scan_checklist':
      return {
        type,
        title: 'Ultrasound checklist',
        intro: 'Prepare for your scan and know what to ask before and after.',
        items: staticScanItems(),
        questions: step.whatToAsk,
        footer: 'You can request a chaperone and a copy of your report.',
      };

    case 'care_plan_checklist':
      return {
        type,
        title: 'Care plan follow-up',
        intro: 'Use this at follow-up visits to stay aligned with your clinician.',
        items: staticCarePlanItems(),
        questions: step.questionsForDoctor,
        footer: 'Plans can change — honest check-ins lead to better care.',
      };

    default:
      return {
        type: 'visit_checklist',
        title: 'Checklist',
        intro: '',
        items: [],
        footer: '',
      };
  }
}

export function formatJourneyChecklistText(checklist: JourneyChecklist): string {
  const lines: string[] = [
    `CYRA — ${checklist.title.toUpperCase()}`,
    '',
    checklist.intro,
    '',
    'CHECKLIST',
    ...checklist.items.map((item) =>
      item.detail ? `☐ ${item.text} — ${item.detail}` : `☐ ${item.text}`,
    ),
  ];

  if (checklist.questions?.length) {
    lines.push('', 'QUESTIONS FOR YOUR DOCTOR', ...checklist.questions.map((q) => `• ${q}`));
  }

  lines.push('', checklist.footer, '', 'Generated by Cyra for personal use — not a medical document.');
  return lines.join('\n');
}
