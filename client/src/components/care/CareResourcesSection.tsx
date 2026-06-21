import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight, MapPin, FlaskConical, Calendar, FileText } from 'lucide-react';
import { Card } from '@/components/ui';
import {
  ClinicFinderTab,
  TestGuideTab,
  CycleEducationTab,
  DoctorPrepTab,
} from '@/components/care';
import type { CareResource } from '@/lib/care/types';
import { cn } from '@/lib/tokens';

const RESOURCES: {
  id: CareResource;
  label: string;
  description: string;
  icon: typeof MapPin;
}[] = [
  {
    id: 'clinics',
    label: 'Find a clinic',
    description: 'Gynecologists and endocrinologists near you',
    icon: MapPin,
  },
  {
    id: 'tests',
    label: 'Understand tests',
    description: 'What labs and scans measure',
    icon: FlaskConical,
  },
  {
    id: 'cycle',
    label: 'Cycle basics',
    description: 'Phases, patterns, and what is normal',
    icon: Calendar,
  },
  {
    id: 'doctor_prep',
    label: 'Full doctor prep',
    description: 'Complete prep sheet from your logs',
    icon: FileText,
  },
];

export function CareResourcesSection() {
  const [open, setOpen] = useState<CareResource | null>(null);

  return (
    <section className="mt-10 pt-6 border-t border-border" aria-labelledby="care-resources-heading">
      <h2 id="care-resources-heading" className="section-label mb-1">
        Resources
      </h2>
      <p className="mb-4 text-micro text-ink-secondary">
        Tools to support your journey — open when you need them.
      </p>

      <div className="space-y-2">
        {RESOURCES.map(({ id, label, description, icon: Icon }) => {
          const isOpen = open === id;
          return (
            <div key={id}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : id)}
                aria-expanded={isOpen}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors',
                  isOpen
                    ? 'border-border-strong bg-surface-tertiary'
                    : 'border-border bg-surface hover:border-border-strong',
                )}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-tertiary">
                  <Icon className="h-4 w-4 text-brand-500" strokeWidth={1.75} aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-caption font-semibold text-ink">{label}</p>
                  <p className="text-micro text-ink-tertiary">{description}</p>
                </div>
                <ChevronRight
                  className={cn(
                    'h-4 w-4 shrink-0 text-ink-muted transition-transform',
                    isOpen && 'rotate-90',
                  )}
                  aria-hidden="true"
                />
              </button>

              {isOpen && (
                <div className="mt-3 animate-slide-up pb-2">
                  {id === 'clinics' && <ClinicFinderTab />}
                  {id === 'tests' && <TestGuideTab />}
                  {id === 'cycle' && <CycleEducationTab />}
                  {id === 'doctor_prep' && <DoctorPrepTab />}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Link to="/care/articles" className="mt-6 block">
        <Card interactive padding="sm" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-tertiary">
            <BookOpen className="h-5 w-5 text-brand-500" strokeWidth={1.75} aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-caption font-semibold text-ink">Education library</p>
            <p className="text-micro text-ink-tertiary">Articles on PMOS, nutrition, and doctor prep</p>
          </div>
          <ChevronRight className="h-5 w-5 text-ink-muted" aria-hidden="true" />
        </Card>
      </Link>
    </section>
  );
}
