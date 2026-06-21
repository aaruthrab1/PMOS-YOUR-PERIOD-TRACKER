-- Seed education articles for PMOS awareness
INSERT INTO education_articles (slug, title, summary, content, category, read_time_minutes, tags, is_featured) VALUES
(
  'understanding-pmos',
  'Understanding PMOS: What Every Woman Should Know',
  'Premenstrual Ovulation Syndrome (PMOS) encompasses the hormonal shifts and symptoms many women experience throughout their cycle.',
  E'# Understanding PMOS\n\nPremenstrual Ovulation Syndrome refers to the collection of physical, emotional, and cognitive symptoms that can occur in relation to your menstrual cycle.\n\n## Key Points\n\n- Symptoms typically appear 1-2 weeks before menstruation\n- Hormonal fluctuations in estrogen and progesterone play a central role\n- Tracking patterns helps identify personal triggers\n- Not all cycles are the same — your experience is valid\n\n## When to Seek Help\n\nIf symptoms significantly impact daily life, relationships, or work, consult a healthcare provider. Cyra helps you prepare for those conversations with data-driven insights.',
  'pmos_basics',
  6,
  ARRAY['pmos', 'basics', 'hormones'],
  TRUE
),
(
  'symptom-tracking-guide',
  'How to Track Symptoms Effectively',
  'Learn the best practices for daily symptom logging to uncover meaningful patterns.',
  E'# Effective Symptom Tracking\n\nConsistent tracking is the foundation of understanding your body.\n\n## Daily Check-ins\n\n1. Log symptoms at the same time each day\n2. Rate severity honestly — there is no wrong answer\n3. Note potential triggers (sleep, stress, diet)\n4. Record mood and energy alongside physical symptoms\n\n## Pattern Recognition\n\nAfter 2-3 cycles of consistent tracking, Cyra''s insights engine can identify recurring patterns and help you prepare questions for your doctor.',
  'symptom_management',
  5,
  ARRAY['tracking', 'symptoms', 'tips'],
  TRUE
),
(
  'preparing-for-your-doctor',
  'Preparing for Your Doctor Visit',
  'Turn your tracked data into actionable talking points for productive healthcare conversations.',
  E'# Doctor Visit Preparation\n\nYour tracked data is powerful evidence. Here is how to use it.\n\n## Before Your Appointment\n\n- Generate a Cyra doctor report covering your last 1-3 cycles\n- Highlight your top 3 concerns\n- Prepare specific questions\n- Bring a list of current medications and supplements\n\n## During the Visit\n\n- Share severity trends, not just symptom names\n- Mention impact on daily life\n- Ask about diagnostic options if needed\n\n## After the Visit\n\n- Log any new diagnoses or treatment plans\n- Set reminders for follow-ups',
  'doctor_prep',
  7,
  ARRAY['doctor', 'appointment', 'advocacy'],
  TRUE
),
(
  'nutrition-and-cycle-health',
  'Nutrition Strategies for Cycle Health',
  'Evidence-based dietary approaches that may support hormonal balance and reduce symptom severity.',
  E'# Nutrition and Your Cycle\n\nWhile no single diet works for everyone, research suggests certain nutritional strategies may help.\n\n## Helpful Approaches\n\n- **Anti-inflammatory foods**: leafy greens, fatty fish, berries\n- **Stable blood sugar**: protein with every meal, complex carbs\n- **Magnesium-rich foods**: dark chocolate, nuts, seeds\n- **Hydration**: aim for 2-3 liters daily\n\n## Foods to Monitor\n\nSome women find caffeine, alcohol, and high-sodium foods worsen symptoms. Track your personal responses in Cyra.',
  'nutrition',
  6,
  ARRAY['nutrition', 'diet', 'wellness'],
  FALSE
),
(
  'mental-health-and-pmos',
  'Mental Health During Your Cycle',
  'Understanding the emotional dimension of PMOS and strategies for emotional wellbeing.',
  E'# Mental Health and PMOS\n\nEmotional symptoms are real, valid, and treatable.\n\n## Common Experiences\n\n- Mood swings and irritability\n- Anxiety and worry\n- Low mood or sadness\n- Brain fog and difficulty concentrating\n\n## Coping Strategies\n\n- Mindfulness and breathing exercises\n- Regular movement (even gentle walks help)\n- Social connection and support\n- Professional therapy when needed\n\n## Important Note\n\nIf you experience severe mood changes or thoughts of self-harm, please reach out to a mental health professional or crisis line immediately.',
  'mental_health',
  8,
  ARRAY['mental-health', 'mood', 'wellbeing'],
  FALSE
);
