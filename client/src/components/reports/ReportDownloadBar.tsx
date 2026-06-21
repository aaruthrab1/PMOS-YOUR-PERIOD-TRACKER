import { Download, Share2, Copy, FileText } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui';
import { usePersonalization } from '@/contexts/PersonalizationContext';
import type { CyraDoctorReport } from '@/lib/reports';
import { exportDoctorReportPdf, formatReportAsText } from '@/lib/reports';

interface ReportDownloadBarProps {
  report: CyraDoctorReport;
  onShare?: () => void;
}

export function ReportDownloadBar({ report, onShare }: ReportDownloadBarProps) {
  const { t, language } = usePersonalization();
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  const downloadPdf = () => {
    setExporting(true);
    try {
      exportDoctorReportPdf(report, language);
      onShare?.();
    } finally {
      setTimeout(() => setExporting(false), 800);
    }
  };

  const copyAll = async () => {
    await navigator.clipboard.writeText(formatReportAsText(report));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareNative = async () => {
    const text = formatReportAsText(report);
    if (navigator.share) {
      await navigator.share({ title: report.title, text });
      onShare?.();
    } else {
      await copyAll();
    }
  };

  return (
    <div className="sticky top-0 z-20 -mx-4 mb-4 border-b border-border bg-surface/95 px-4 py-3 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-caption font-semibold text-ink">{t('reports.hospitalPdf')}</p>
          <p className="text-micro text-ink-tertiary">{t('reports.hospitalPdfDesc')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={downloadPdf} loading={exporting}>
            <Download className="h-4 w-4" aria-hidden="true" />
            {t('reports.downloadPdf')}
          </Button>
          <Button size="sm" variant="secondary" onClick={shareNative}>
            <Share2 className="h-4 w-4" aria-hidden="true" />
            {t('common.share')}
          </Button>
          <Button size="sm" variant="ghost" onClick={copyAll}>
            <Copy className="h-4 w-4" aria-hidden="true" />
            {copied ? t('common.copied') : t('common.copy')}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              const blob = new Blob([formatReportAsText(report)], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `cyra-report-${report.date_range_end}.txt`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
            .txt
          </Button>
        </div>
      </div>
    </div>
  );
}
