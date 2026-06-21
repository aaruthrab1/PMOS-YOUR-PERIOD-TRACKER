import { Info } from 'lucide-react';
import { Card } from '@/components/ui';
import { DARK_PATCHES_EDUCATION } from '@/lib/androgen/constants';

interface DarkPatchesEducationProps {
  simpleLanguage: boolean;
  show: boolean;
}

export function DarkPatchesEducation({ simpleLanguage, show }: DarkPatchesEducationProps) {
  if (!show) return null;

  return (
    <Card className="mt-4 border-risk-moderate/20 bg-risk-moderate-bg/30">
      <div className="flex gap-3">
        <Info className="h-5 w-5 shrink-0 text-risk-moderate" strokeWidth={1.75} aria-hidden="true" />
        <div>
          <p className="text-caption font-semibold text-ink">About dark skin patches</p>
          <p className="mt-2 text-caption text-ink-secondary leading-relaxed">
            {simpleLanguage ? DARK_PATCHES_EDUCATION.simple : DARK_PATCHES_EDUCATION.medical}
          </p>
        </div>
      </div>
    </Card>
  );
}
