import type { SupabaseClient } from '@supabase/supabase-js';
import { groq, CYRA_SYSTEM_PROMPT, MODEL } from '../config/groq.js';
import { AppError } from '../utils/AppError.js';

interface ReportSummaryInput {
  dateRangeStart: string;
  dateRangeEnd: string;
  symptoms: Array<{ name: string; severity: string; frequency: number }>;
  moodTrend?: string;
  notes?: string;
}

export async function chatWithAI(
  userId: string,
  supabase: SupabaseClient,
  message: string,
  conversationId?: string
) {
  if (!process.env.GROQ_API_KEY) {
    throw new AppError('AI service unavailable', 503);
  }

  let convId = conversationId;

  if (!convId) {
    const { data: conv, error: convError } = await supabase
      .from('ai_conversations')
      .insert({ user_id: userId, title: message.slice(0, 60) })
      .select('id')
      .single();

    if (convError) throw new AppError('Failed to create conversation', 500);
    convId = conv.id;
  }

  await supabase.from('ai_messages').insert({
    conversation_id: convId,
    role: 'user',
    content: message,
  });

  const { data: history } = await supabase
    .from('ai_messages')
    .select('role, content')
    .eq('conversation_id', convId)
    .order('created_at', { ascending: true })
    .limit(20);

  const messages = [
    { role: 'system' as const, content: CYRA_SYSTEM_PROMPT },
    ...(history || []).map((m) => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content,
    })),
  ];

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages,
    max_tokens: 1024,
    temperature: 0.7,
  });

  const reply = completion.choices[0]?.message?.content || 'I apologize, I could not generate a response.';

  await supabase.from('ai_messages').insert({
    conversation_id: convId,
    role: 'assistant',
    content: reply,
    token_count: completion.usage?.total_tokens,
  });

  await supabase
    .from('ai_conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', convId);

  return {
    conversationId: convId,
    message: reply,
  };
}

export async function generateReportSummary(input: ReportSummaryInput): Promise<string> {
  if (!process.env.GROQ_API_KEY) {
    throw new AppError('AI service unavailable', 503);
  }

  const symptomList = input.symptoms
    .map((s) => `- ${s.name}: ${s.severity} (logged ${s.frequency} times)`)
    .join('\n');

  const prompt = `Generate a professional, concise doctor visit summary for a patient based on the following tracked health data.

Date range: ${input.dateRangeStart} to ${input.dateRangeEnd}
Mood trend: ${input.moodTrend || 'Not specified'}
Patient notes: ${input.notes || 'None'}

Symptoms tracked:
${symptomList}

Format the summary with:
1. Overview (2-3 sentences)
2. Key symptom patterns
3. Suggested questions for the doctor (3-5 bullet points)

Keep language clinical but accessible. Do not diagnose. Encourage follow-up with a healthcare provider.`;

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: CYRA_SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
    max_tokens: 1500,
    temperature: 0.5,
  });

  return completion.choices[0]?.message?.content || 'Unable to generate summary.';
}
