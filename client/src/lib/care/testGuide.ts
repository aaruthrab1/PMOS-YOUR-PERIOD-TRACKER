import type { TestGuideItem } from './types';

export const TEST_GUIDE_ITEMS: TestGuideItem[] = [
  {
    id: 'amh',
    name: 'AMH (Anti-Müllerian Hormone)',
    measures: {
      medical: 'Ovarian reserve — an estimate of remaining egg supply based on follicle activity.',
      simple: 'A blood test that gives a rough idea of how many eggs your ovaries may have left.',
    },
    whyOrdered: {
      medical: 'Often used in fertility planning, PCOS assessment, and before certain treatments.',
      simple: 'Doctors may order it when looking at fertility, PCOS, or before starting some treatments.',
    },
  },
  {
    id: 'lh',
    name: 'LH (Luteinizing Hormone)',
    measures: {
      medical: 'A pituitary hormone that triggers ovulation; ratio to FSH is evaluated in PCOS workups.',
      simple: 'A hormone that helps control ovulation — when and if an egg is released.',
    },
    whyOrdered: {
      medical: 'Checked on specific cycle days to assess ovulation and PCOS patterns.',
      simple: 'Often checked on certain cycle days to see if ovulation is happening normally.',
    },
  },
  {
    id: 'fsh',
    name: 'FSH (Follicle-Stimulating Hormone)',
    measures: {
      medical: 'Stimulates follicle growth in the ovaries; interpreted alongside LH and estradiol.',
      simple: 'A hormone that helps eggs mature in the ovaries each cycle.',
    },
    whyOrdered: {
      medical: 'Used to evaluate ovarian function, irregular cycles, and menopause transition.',
      simple: 'Helps doctors understand how your ovaries are working and why cycles might be irregular.',
    },
  },
  {
    id: 'tsh',
    name: 'TSH (Thyroid-Stimulating Hormone)',
    measures: {
      medical: 'Screens thyroid function; thyroid imbalance can affect cycles, mood, and energy.',
      simple: 'Checks whether your thyroid gland is working normally — it affects energy and periods.',
    },
    whyOrdered: {
      medical: 'Routine in workups for irregular periods, fatigue, weight changes, and before fertility care.',
      simple: 'Often included when periods are irregular or you feel tired — thyroid affects many body systems.',
    },
  },
  {
    id: 'fasting_insulin',
    name: 'Fasting Insulin',
    measures: {
      medical: 'Reflects how much insulin your body needs to manage blood sugar after fasting.',
      simple: 'Shows how hard your body works to manage blood sugar — often checked in the morning before eating.',
    },
    whyOrdered: {
      medical: 'Relevant in PCOS, insulin resistance, and metabolic screening alongside glucose or HOMA-IR.',
      simple: 'Doctors may order it with PCOS or when checking blood-sugar-related patterns.',
    },
  },
  {
    id: 'pelvic_ultrasound',
    name: 'Pelvic Ultrasound',
    measures: {
      medical: 'Imaging of uterus and ovaries — follicle count, endometrial thickness, ovarian morphology.',
      simple: 'A scan that lets doctors see your uterus and ovaries — no radiation involved.',
    },
    whyOrdered: {
      medical: 'Assists PCOS diagnosis (e.g. polycystic appearance), fibroids, and cycle-related pain.',
      simple: 'Helps explain irregular periods, PCOS signs, or pelvic pain you have described.',
    },
  },
];

export const SIMPLE_LANGUAGE_KEY = 'cyra_care_simple_language';
