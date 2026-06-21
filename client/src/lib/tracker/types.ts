export interface TrackerInsight {
  id: string;
  text: string;
  category: 'period' | 'sleep' | 'weight' | 'mood' | 'metabolic' | 'general';
}

export interface ChartPoint {
  label: string;
  date: string;
  value: number;
}

export interface EnergySleepCorrelation {
  date: string;
  label: string;
  energy: number;
  sleep: number;
}
