import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import { api } from '@/api/client';
import type { SymptomEntryWithDetails, InsightSummary, DailyTrend } from '@/types/database';

interface SymptomContextValue {
  entries: SymptomEntryWithDetails[];
  summary: InsightSummary | null;
  trends: DailyTrend[];
  loading: boolean;
  fetchEntries: (startDate?: string, endDate?: string) => Promise<void>;
  fetchInsights: (days?: number) => Promise<void>;
  logSymptoms: (data: LogSymptomInput) => Promise<void>;
}

interface LogSymptomInput {
  loggedDate: string;
  cyclePhase?: string;
  mood?: string;
  energyLevel?: number;
  sleepHours?: number;
  sleepQuality?: number;
  notes?: string;
  triggers?: string[];
  symptoms?: Array<{
    symptomName: string;
    category: string;
    severity: string;
  }>;
}

const SymptomContext = createContext<SymptomContextValue | null>(null);

export function SymptomProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [entries, setEntries] = useState<SymptomEntryWithDetails[]>([]);
  const [summary, setSummary] = useState<InsightSummary | null>(null);
  const [trends, setTrends] = useState<DailyTrend[]>([]);
  const [loading, setLoading] = useState(false);

  const token = session?.access_token;

  const fetchEntries = useCallback(async (startDate?: string, endDate?: string) => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      const query = params.toString() ? `?${params}` : '';
      const data = await api.get<SymptomEntryWithDetails[]>(`/symptoms${query}`, token);
      setEntries(data);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchInsights = useCallback(async (days = 30) => {
    if (!token) return;
    try {
      const [summaryData, trendsData] = await Promise.all([
        api.get<InsightSummary>(`/insights/summary?days=${days}`, token),
        api.get<{ dailyTrends: DailyTrend[] }>(`/insights/trends?days=${days}`, token),
      ]);
      setSummary(summaryData);
      setTrends(trendsData.dailyTrends);
    } catch {
      // Graceful degradation when API unavailable
    }
  }, [token]);

  const logSymptoms = useCallback(async (data: LogSymptomInput) => {
    if (!token) return;
    await api.post('/symptoms', data, token);
    await fetchEntries();
    await fetchInsights();
  }, [token, fetchEntries, fetchInsights]);

  return (
    <SymptomContext.Provider
      value={{ entries, summary, trends, loading, fetchEntries, fetchInsights, logSymptoms }}
    >
      {children}
    </SymptomContext.Provider>
  );
}

export function useSymptoms() {
  const context = useContext(SymptomContext);
  if (!context) throw new Error('useSymptoms must be used within SymptomProvider');
  return context;
}
