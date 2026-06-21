import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/api/client';
import { friendlyLoadError, friendlySaveError } from '@/lib/userMessages';
import type { CyraDoctorReport, ReportViewMode } from '@/lib/reports';
import { REPORT_DATE_PRESETS } from '@/lib/reports';

function formatReportTitle(start: string, end: string) {
  const fmt = (d: string) =>
    new Intl.DateTimeFormat('en-IN', { month: 'short', day: 'numeric' }).format(new Date(d));
  return `Doctor Report — ${fmt(start)} to ${fmt(end)}`;
}

function dateRangeFromPreset(days: number) {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

export function useDoctorReportGenerator() {
  const { session } = useAuth();
  const [reports, setReports] = useState<CyraDoctorReport[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<ReportViewMode>('summary');
  const [datePresetDays, setDatePresetDays] = useState(90);

  const selected = reports.find((r) => r.id === selectedId) ?? reports[0] ?? null;

  const fetchReports = useCallback(async () => {
    if (!session?.access_token) return;
    setError('');
    try {
      const data = await api.get<CyraDoctorReport[]>('/reports', session.access_token);
      setReports(data);
      setSelectedId((prev) => {
        if (prev && data.some((r) => r.id === prev)) return prev;
        return data[0]?.id ?? null;
      });
    } catch (err) {
      setError(friendlyLoadError(err instanceof Error ? err.message : undefined));
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const generate = useCallback(async () => {
    if (!session?.access_token) return;
    setGenerating(true);
    setError('');
    try {
      const { start, end } = dateRangeFromPreset(datePresetDays);
      const report = await api.post<CyraDoctorReport>(
        '/reports',
        {
          title: formatReportTitle(start, end),
          dateRangeStart: start,
          dateRangeEnd: end,
        },
        session.access_token,
      );
      setReports((prev) => [report, ...prev]);
      setSelectedId(report.id);
      setViewMode('summary');
    } catch (err) {
      setError(friendlySaveError(err instanceof Error ? err.message : 'Failed to generate report'));
    } finally {
      setGenerating(false);
    }
  }, [session?.access_token, datePresetDays]);

  const deleteReport = useCallback(
    async (id: string) => {
      if (!session?.access_token) return;
      setError('');
      try {
        await api.delete(`/reports/${id}`, session.access_token);
        setReports((prev) => {
          const next = prev.filter((r) => r.id !== id);
          setSelectedId((cur) => (cur === id ? next[0]?.id ?? null : cur));
          return next;
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete report');
      }
    },
    [session?.access_token],
  );

  const markShared = useCallback(async () => {
    if (!session?.access_token || !selected) return;
    try {
      const updated = await api.patch<CyraDoctorReport>(
        `/reports/${selected.id}`,
        { status: 'shared' },
        session.access_token,
      );
      setReports((prev) => prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)));
    } catch {
      /* non-critical */
    }
  }, [session?.access_token, selected]);

  return {
    reports,
    selected,
    selectedId,
    setSelectedId,
    loading,
    generating,
    error,
    viewMode,
    setViewMode,
    datePresetDays,
    setDatePresetDays,
    datePresets: REPORT_DATE_PRESETS,
    generate,
    deleteReport,
    markShared,
    refresh: fetchReports,
  };
}
