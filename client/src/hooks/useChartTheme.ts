import { useMemo } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { getChartTheme } from '@/lib/chartTheme';

export function useChartTheme() {
  const { resolvedTheme } = useTheme();
  return useMemo(() => getChartTheme(resolvedTheme), [resolvedTheme]);
}
