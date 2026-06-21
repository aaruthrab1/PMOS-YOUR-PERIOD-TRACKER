import type { SupabaseClient } from '@supabase/supabase-js';

const SEVERITY_SCORE: Record<string, number> = {
  none: 0,
  mild: 1,
  moderate: 2,
  severe: 3,
};

export async function getTrends(
  supabase: SupabaseClient,
  userId: string,
  days: number
) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data: entries, error } = await supabase
    .from('symptom_entries')
    .select(`
      logged_date,
      mood,
      energy_level,
      sleep_hours,
      sleep_quality,
      cycle_phase,
      symptom_details (
        symptom_name,
        category,
        severity
      )
    `)
    .eq('user_id', userId)
    .gte('logged_date', startDate.toISOString().split('T')[0])
    .order('logged_date', { ascending: true });

  if (error) throw error;

  const dailyTrends = (entries || []).map((entry) => {
    const details = entry.symptom_details as Array<{ symptom_name: string; category: string; severity: string }> | null;
    const avgSeverity = details?.length
      ? details.reduce((sum, d) => sum + (SEVERITY_SCORE[d.severity] || 0), 0) / details.length
      : 0;

    return {
      date: entry.logged_date,
      mood: entry.mood,
      energyLevel: entry.energy_level,
      sleepHours: entry.sleep_hours,
      sleepQuality: entry.sleep_quality,
      cyclePhase: entry.cycle_phase,
      symptomCount: details?.length || 0,
      avgSeverity: Math.round(avgSeverity * 100) / 100,
    };
  });

  const symptomFrequency: Record<string, { count: number; totalSeverity: number }> = {};
  for (const entry of entries || []) {
    const details = entry.symptom_details as Array<{ symptom_name: string; severity: string }> | null;
    for (const d of details || []) {
      if (!symptomFrequency[d.symptom_name]) {
        symptomFrequency[d.symptom_name] = { count: 0, totalSeverity: 0 };
      }
      symptomFrequency[d.symptom_name].count++;
      symptomFrequency[d.symptom_name].totalSeverity += SEVERITY_SCORE[d.severity] || 0;
    }
  }

  const topSymptoms = Object.entries(symptomFrequency)
    .map(([name, data]) => ({
      name,
      frequency: data.count,
      avgSeverity: Math.round((data.totalSeverity / data.count) * 100) / 100,
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 10);

  return { dailyTrends, topSymptoms, period: { days, startDate: startDate.toISOString().split('T')[0] } };
}

export async function getSummary(
  supabase: SupabaseClient,
  userId: string,
  days: number
) {
  const trends = await getTrends(supabase, userId, days);
  const entries = trends.dailyTrends;

  const moodCounts: Record<string, number> = {};
  let totalEnergy = 0;
  let energyCount = 0;
  let totalSleep = 0;
  let sleepCount = 0;

  for (const e of entries) {
    if (e.mood) moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
    if (e.energyLevel) { totalEnergy += e.energyLevel; energyCount++; }
    if (e.sleepHours) { totalSleep += Number(e.sleepHours); sleepCount++; }
  }

  const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';

  return {
    daysLogged: entries.length,
    dominantMood,
    avgEnergy: energyCount ? Math.round((totalEnergy / energyCount) * 10) / 10 : null,
    avgSleep: sleepCount ? Math.round((totalSleep / sleepCount) * 10) / 10 : null,
    topSymptoms: trends.topSymptoms.slice(0, 5),
    streakDays: calculateStreak(entries.map((e) => e.date)),
  };
}

export async function getCycleData(
  supabase: SupabaseClient,
  userId: string
) {
  const { data: cycles, error } = await supabase
    .from('period_logs')
    .select('period_start, period_end, cycle_length')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('period_start', { ascending: false })
    .limit(6);

  if (error) throw error;

  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('cycle_length_avg, period_length_avg')
    .eq('user_id', userId)
    .single();

  const avgCycleLength = cycles?.length
    ? Math.round(cycles.reduce((s, c) => s + (c.cycle_length || prefs?.cycle_length_avg || 28), 0) / cycles.length)
    : prefs?.cycle_length_avg || 28;

  return {
    recentCycles: cycles || [],
    avgCycleLength,
    avgPeriodLength: prefs?.period_length_avg || 5,
    totalCyclesLogged: cycles?.length || 0,
  };
}

function calculateStreak(dates: string[]): number {
  if (!dates.length) return 0;
  const sorted = [...new Set(dates)].sort().reverse();
  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}
