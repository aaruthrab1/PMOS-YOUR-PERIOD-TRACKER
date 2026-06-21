import { useState, FormEvent } from 'react';
import { Check } from 'lucide-react';
import { useSymptoms } from '@/contexts/SymptomContext';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  COMMON_SYMPTOMS,
  MOOD_OPTIONS,
  CYCLE_PHASES,
  SEVERITY_OPTIONS,
  cn,
} from '@/lib/constants';

export function TrackPage() {
  const { logSymptoms } = useSymptoms();
  const [mood, setMood] = useState('neutral');
  const [cyclePhase, setCyclePhase] = useState('unknown');
  const [energyLevel, setEnergyLevel] = useState(5);
  const [sleepHours, setSleepHours] = useState(7);
  const [notes, setNotes] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<
    Record<string, { severity: string; category: string }>
  >({});
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleSymptom = (name: string, category: string) => {
    setSelectedSymptoms((prev) => {
      if (prev[name]) {
        const next = { ...prev };
        delete next[name];
        return next;
      }
      return { ...prev, [name]: { severity: 'mild', category } };
    });
  };

  const setSeverity = (name: string, severity: string) => {
    setSelectedSymptoms((prev) => ({
      ...prev,
      [name]: { ...prev[name], severity },
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    try {
      await logSymptoms({
        loggedDate: new Date().toISOString().split('T')[0],
        mood,
        cyclePhase,
        energyLevel,
        sleepHours,
        notes: notes || undefined,
        symptoms: Object.entries(selectedSymptoms).map(([symptomName, data]) => ({
          symptomName,
          category: data.category,
          severity: data.severity,
        })),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">
          Track today
        </h1>
        <p className="mt-1 text-sm text-gray-500">Log how you're feeling — it only takes a minute</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mood */}
        <Card>
          <CardHeader>
            <CardTitle>How's your mood?</CardTitle>
          </CardHeader>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Mood selection">
            {MOOD_OPTIONS.map(({ value, label, emoji }) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={mood === value}
                onClick={() => setMood(value)}
                className={cn(
                  'flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all',
                  mood === value
                    ? 'bg-cyra-100 text-cyra-700 ring-2 ring-cyra-400 dark:bg-cyra-950 dark:text-cyra-300'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400'
                )}
              >
                <span aria-hidden="true">{emoji}</span>
                {label}
              </button>
            ))}
          </div>
        </Card>

        {/* Cycle phase */}
        <Card>
          <CardHeader>
            <CardTitle>Cycle phase</CardTitle>
          </CardHeader>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Cycle phase">
            {CYCLE_PHASES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={cyclePhase === value}
                onClick={() => setCyclePhase(value)}
                className={cn(
                  'rounded-xl px-3 py-2 text-sm font-medium transition-all',
                  cyclePhase === value
                    ? 'bg-cyra-100 text-cyra-700 ring-2 ring-cyra-400 dark:bg-cyra-950 dark:text-cyra-300'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </Card>

        {/* Energy & Sleep */}
        <Card>
          <CardHeader>
            <CardTitle>Energy & sleep</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="energy" className="label">
                Energy level: {energyLevel}/10
              </label>
              <input
                id="energy"
                type="range"
                min={1}
                max={10}
                value={energyLevel}
                onChange={(e) => setEnergyLevel(Number(e.target.value))}
                className="w-full accent-cyra-500"
              />
            </div>
            <div>
              <label htmlFor="sleep" className="label">
                Sleep hours: {sleepHours}h
              </label>
              <input
                id="sleep"
                type="range"
                min={0}
                max={12}
                step={0.5}
                value={sleepHours}
                onChange={(e) => setSleepHours(Number(e.target.value))}
                className="w-full accent-cyra-500"
              />
            </div>
          </div>
        </Card>

        {/* Symptoms */}
        <Card>
          <CardHeader>
            <CardTitle>Symptoms</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            {COMMON_SYMPTOMS.map(({ name, category }) => {
              const selected = selectedSymptoms[name];
              return (
                <div key={name}>
                  <button
                    type="button"
                    onClick={() => toggleSymptom(name, category)}
                    aria-pressed={!!selected}
                    className={cn(
                      'flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                      selected
                        ? 'bg-cyra-50 text-cyra-700 dark:bg-cyra-950 dark:text-cyra-300'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400'
                    )}
                  >
                    {name}
                    {selected && <Check className="h-4 w-4 text-cyra-500" aria-hidden="true" />}
                  </button>
                  {selected && (
                    <div className="mt-2 flex gap-1.5 pl-2" role="radiogroup" aria-label={`${name} severity`}>
                      {SEVERITY_OPTIONS.filter((s) => s.value !== 'none').map(({ value, label, color }) => (
                        <button
                          key={value}
                          type="button"
                          role="radio"
                          aria-checked={selected.severity === value}
                          onClick={() => setSeverity(name, value)}
                          className={cn(
                            'rounded-lg px-2.5 py-1 text-xs font-medium transition-all',
                            selected.severity === value
                              ? `${color} ring-2 ring-cyra-400 text-gray-800`
                              : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Notes */}
        <Card>
          <label htmlFor="notes" className="label">
            Additional notes
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="input-field resize-none"
            placeholder="Anything else you'd like to remember..."
          />
        </Card>

        <Button type="submit" loading={loading} className="w-full" size="lg">
          {saved ? (
            <>
              <Check className="h-4 w-4" aria-hidden="true" />
              Saved!
            </>
          ) : (
            'Save entry'
          )}
        </Button>
      </form>
    </div>
  );
}
