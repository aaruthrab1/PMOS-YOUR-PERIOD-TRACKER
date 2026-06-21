import { useState, useEffect, useCallback } from 'react';
import { listQuizResults, saveQuizResult } from '@/lib/db/quizResults';
import type { QuizResult } from '@/types/supabase';

export function useQuizResults(quizType?: string) {
  const [data, setData] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const results = await listQuizResults(quizType);
      setData(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quiz results');
    } finally {
      setLoading(false);
    }
  }, [quizType]);

  useEffect(() => { refresh(); }, [refresh]);

  const save = async (answers: Record<string, string[]>, quiz_type = 'onboarding') => {
    const result = await saveQuizResult({ quiz_type, answers, recommendations: [] });
    await refresh();
    return result;
  };

  return { data, loading, error, refresh, save };
}
