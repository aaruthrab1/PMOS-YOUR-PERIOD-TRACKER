import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { CyraLanguageCode } from '@/lib/personalization/types';
import { getReportLabels } from '@/lib/personalization/reportLabels';
import type { CyraDoctorReport } from './types';
import { buildClinicalReportView } from './buildClinicalReport';

const BRAND = { r: 91, g: 75, b: 219 };
const INK = { r: 28, g: 28, b: 36 };
const MUTED = { r: 100, g: 100, b: 110 };
const LINE = { r: 220, g: 220, b: 225 };
const PAGE_W = 210;
const MARGIN = 18;
const CONTENT_W = PAGE_W - MARGIN * 2;

type RGB = { r: number; g: number; b: number };

function fmtShort(d: string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(d));
}

function ensureSpace(doc: jsPDF, y: number, needed: number, footerText?: string): number {
  if (y + needed > 275) {
    doc.addPage();
    drawPageFooter(doc, footerText ?? '');
    return 24;
  }
  return y;
}

function drawPageFooter(doc: jsPDF, footerText: string) {
  const page = doc.getNumberOfPages();
  doc.setFontSize(7);
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.setDrawColor(LINE.r, LINE.g, LINE.b);
  doc.line(MARGIN, 282, PAGE_W - MARGIN, 282);
  doc.text(footerText, MARGIN, 287);
  doc.text(`Page ${page}`, PAGE_W - MARGIN, 287, { align: 'right' });
}

function drawLogoMark(doc: jsPDF, x: number, y: number) {
  doc.setFillColor(BRAND.r, BRAND.g, BRAND.b);
  doc.roundedRect(x, y, 10, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('C', x + 5, y + 7.2, { align: 'center' });
}

function drawCoverPage(
  doc: jsPDF,
  view: NonNullable<ReturnType<typeof buildClinicalReportView>>,
  labels: ReturnType<typeof getReportLabels>,
) {
  doc.setFillColor(248, 248, 250);
  doc.rect(0, 0, PAGE_W, 297, 'F');

  doc.setFillColor(BRAND.r, BRAND.g, BRAND.b);
  doc.rect(0, 0, PAGE_W, 52, 'F');

  drawLogoMark(doc, MARGIN, 14);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Cyra', MARGIN + 14, 22);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(labels.coverSubtitle, MARGIN + 14, 30);

  doc.setFontSize(9);
  doc.text(`${labels.generated} ${view.generatedOn}`, PAGE_W - MARGIN, 20, { align: 'right' });
  doc.text(labels.confidential, PAGE_W - MARGIN, 28, { align: 'right' });

  let y = 72;
  doc.setTextColor(INK.r, INK.g, INK.b);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(labels.doctorVisitReport, MARGIN, y);
  y += 12;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(view.patientName, MARGIN, y);
  y += 8;

  doc.setFontSize(10);
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.text(`${labels.reportingPeriod} ${view.reportPeriod}`, MARGIN, y);
  y += 20;

  doc.setDrawColor(LINE.r, LINE.g, LINE.b);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(MARGIN, y, CONTENT_W, 48, 3, 3, 'FD');
  doc.setTextColor(INK.r, INK.g, INK.b);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(labels.healthSummary.toUpperCase(), MARGIN + 6, y + 10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  let sy = y + 16;
  for (const line of view.healthSummary.slice(0, 4)) {
    const wrapped = doc.splitTextToSize(`• ${line}`, CONTENT_W - 12);
    doc.text(wrapped, MARGIN + 6, sy);
    sy += wrapped.length * 4.2 + 1;
  }

  y += 62;
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.setFontSize(8);
  const disclaimer = [labels.disclaimer];
  for (const line of disclaimer) {
    const wrapped = doc.splitTextToSize(line, CONTENT_W);
    doc.text(wrapped, MARGIN, y);
    y += wrapped.length * 3.8 + 2;
  }

  drawPageFooter(doc, labels.pdfFooter);
}

function sectionHeading(doc: jsPDF, num: number, title: string, y: number): number {
  y = ensureSpace(doc, y, 14);
  doc.setFillColor(BRAND.r, BRAND.g, BRAND.b);
  doc.roundedRect(MARGIN, y - 4, 7, 7, 1, 1, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(String(num), MARGIN + 3.5, y + 0.5, { align: 'center' });

  doc.setTextColor(INK.r, INK.g, INK.b);
  doc.setFontSize(11);
  doc.text(title, MARGIN + 10, y + 0.5);
  doc.setDrawColor(LINE.r, LINE.g, LINE.b);
  doc.setLineWidth(0.2);
  doc.line(MARGIN, y + 4, PAGE_W - MARGIN, y + 4);
  return y + 10;
}

function bulletList(doc: jsPDF, items: string[], y: number): number {
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  for (const item of items) {
    const lines = doc.splitTextToSize(`• ${item}`, CONTENT_W - 4);
    y = ensureSpace(doc, y, lines.length * 4.5 + 2);
    doc.text(lines, MARGIN + 2, y);
    y += lines.length * 4.2 + 2;
  }
  return y + 4;
}

function drawTrendChart(
  doc: jsPDF,
  title: string,
  points: Array<{ date: string; value: number }>,
  y: number,
  color: RGB,
  yLabel?: string,
): number {
  if (points.length < 2) return y;

  y = ensureSpace(doc, y, 52);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(INK.r, INK.g, INK.b);
  doc.text(title, MARGIN, y);
  y += 4;

  const chartX = MARGIN;
  const chartY = y;
  const chartW = CONTENT_W;
  const chartH = 32;

  doc.setDrawColor(LINE.r, LINE.g, LINE.b);
  doc.setFillColor(252, 252, 254);
  doc.rect(chartX, chartY, chartW, chartH, 'FD');

  const slice = points.slice(-16);
  const values = slice.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  doc.setDrawColor(color.r, color.g, color.b);
  doc.setLineWidth(0.7);
  for (let i = 0; i < slice.length - 1; i++) {
    const x1 = chartX + 4 + (i / (slice.length - 1)) * (chartW - 8);
    const x2 = chartX + 4 + ((i + 1) / (slice.length - 1)) * (chartW - 8);
    const y1 = chartY + chartH - 4 - ((slice[i].value - min) / range) * (chartH - 8);
    const y2 = chartY + chartH - 4 - ((slice[i + 1].value - min) / range) * (chartH - 8);
    doc.line(x1, y1, x2, y2);
  }

  doc.setFontSize(7);
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.text(`${fmtShort(slice[0].date)} → ${fmtShort(slice[slice.length - 1].date)}`, chartX + 2, chartY + chartH + 4);
  if (yLabel) doc.text(yLabel, chartX + chartW - 2, chartY + chartH + 4, { align: 'right' });

  return chartY + chartH + 10;
}

export function exportDoctorReportPdf(report: CyraDoctorReport, language: CyraLanguageCode = 'en'): void {
  const view = buildClinicalReportView(report);
  if (!view) {
    throw new Error(getReportLabels(language).regenerateHint);
  }

  const labels = getReportLabels(language);
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  drawCoverPage(doc, view, labels);
  doc.addPage();

  let y = 22;
  let sectionNum = 1;

  y = sectionHeading(doc, sectionNum++, labels.profileSummary, y);
  y = bulletList(doc, view.profileSummary, y);

  y = sectionHeading(doc, sectionNum++, labels.cycleAnalysis, y);
  y = bulletList(doc, view.cycleAnalysis, y);

  if (view.snapshot.periodLogs.length) {
    y = ensureSpace(doc, y, 20);
    autoTable(doc, {
      startY: y,
      head: [['Period Start', 'End', 'Flow', 'Cycle (days)', 'Pain', 'Symptoms']],
      body: view.snapshot.periodLogs.slice(0, 10).map((p) => [
        p.start,
        p.end ?? '—',
        p.flow ?? '—',
        p.cycleLength?.toString() ?? '—',
        p.painLevel != null ? `${p.painLevel}/10` : '—',
        (p.symptoms ?? []).slice(0, 3).join(', ') || '—',
      ]),
      theme: 'plain',
      headStyles: {
        fillColor: [BRAND.r, BRAND.g, BRAND.b],
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold',
      },
      bodyStyles: { fontSize: 8, textColor: [INK.r, INK.g, INK.b] },
      alternateRowStyles: { fillColor: [248, 248, 252] },
      margin: { left: MARGIN, right: MARGIN },
      styles: { lineColor: [LINE.r, LINE.g, LINE.b], lineWidth: 0.1 },
    });
    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  }

  y = sectionHeading(doc, sectionNum++, labels.sleepAnalysis, y);
  y = bulletList(doc, view.sleepAnalysis, y);

  y = sectionHeading(doc, sectionNum++, labels.moodAnalysis, y);
  y = bulletList(doc, view.moodAnalysis, y);

  y = sectionHeading(doc, sectionNum++, labels.androgenAnalysis, y);
  y = bulletList(doc, view.androgenAnalysis, y);

  y = sectionHeading(doc, sectionNum++, labels.symptomHistory, y);
  y = bulletList(doc, view.symptomHistory, y);

  y = sectionHeading(doc, sectionNum++, labels.charts, y);
  y = drawTrendChart(doc, 'Cycle Length Trend', view.charts.cycleLength, y, { r: 236, g: 72, b: 153 }, 'days');
  y = drawTrendChart(doc, 'Sleep Hours Trend', view.charts.sleepHours, y, BRAND, 'hours');
  y = drawTrendChart(doc, 'Mood / Energy Trend', view.charts.moodTrend, y, { r: 139, g: 92, b: 246 }, 'score');
  y = drawTrendChart(doc, 'Hair Fall Severity Trend', view.charts.hairFall, y, { r: 180, g: 120, b: 80 }, '0–3 scale');

  if (view.timeline.length) {
    y = sectionHeading(doc, sectionNum++, labels.timeline, y);
    autoTable(doc, {
      startY: y,
      head: [['Date', 'Daily Summary']],
      body: view.timeline.slice(0, 18).map((t) => [t.date, t.summary]),
      theme: 'striped',
      headStyles: { fillColor: [INK.r, INK.g, INK.b], fontSize: 8 },
      bodyStyles: { fontSize: 8, cellPadding: 2 },
      columnStyles: { 0: { cellWidth: 28 } },
      margin: { left: MARGIN, right: MARGIN },
    });
    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  }

  y = sectionHeading(doc, sectionNum++, labels.riskPatterns, y);
  y = bulletList(
    doc,
    view.riskPatterns.map((r) => `[${r.severity.toUpperCase()}] ${r.concern} — ${r.note}`),
    y,
  );

  y = sectionHeading(doc, sectionNum++, labels.questionsForDoctor, y);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  view.questionsForDoctor.forEach((q, i) => {
    const lines = doc.splitTextToSize(`${i + 1}. ${q}`, CONTENT_W - 4);
    y = ensureSpace(doc, y, lines.length * 4.5);
    doc.text(lines, MARGIN + 2, y);
    y += lines.length * 4.2 + 2;
  });
  y += 4;

  y = sectionHeading(doc, sectionNum++, labels.recommendedTests, y);
  if (view.recommendedTests.length) {
    autoTable(doc, {
      startY: y,
      head: [['Test', 'Clinical Rationale', 'Priority']],
      body: view.recommendedTests.map((t) => [
        t.name,
        t.reason,
        t.suggested ? 'Discuss' : 'Optional',
      ]),
      theme: 'grid',
      headStyles: { fillColor: [BRAND.r, BRAND.g, BRAND.b], fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      margin: { left: MARGIN, right: MARGIN },
    });
    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  } else {
    y = bulletList(doc, ['No specific tests suggested — your clinician will recommend based on examination.'], y);
  }

  y = ensureSpace(doc, y, 30);
  y = sectionHeading(doc, sectionNum, labels.disclaimer.split('.')[0] ?? labels.disclaimer, y);
  doc.setFontSize(8);
  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  const disclaimerLines = [labels.disclaimer];
  for (const line of disclaimerLines) {
    const lines = doc.splitTextToSize(line, CONTENT_W);
    y = ensureSpace(doc, y, lines.length * 4, labels.pdfFooter);
    doc.text(lines, MARGIN, y);
    y += lines.length * 3.8 + 1.5;
  }

  const totalPages = doc.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);
    drawLogoMark(doc, MARGIN, 8);
    doc.setFontSize(8);
    doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
    doc.text(`${view.patientName} · Cyra Health Report`, MARGIN + 14, 14);
    doc.text(view.reportPeriod, PAGE_W - MARGIN, 14, { align: 'right' });
    drawPageFooter(doc, labels.pdfFooter);
  }

  const safeName = view.patientName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  doc.save(`cyra-clinical-report-${safeName}-${report.date_range_end}.pdf`);
}

export function formatReportAsText(report: CyraDoctorReport): string {
  const view = buildClinicalReportView(report);
  if (!view) return 'Report data unavailable.';

  const lines: string[] = [
    'CYRA — CLINICAL HEALTH REPORT',
    `Patient: ${view.patientName}`,
    `Generated: ${view.generatedOn}`,
    `Period: ${view.reportPeriod}`,
    '',
    'HEALTH SUMMARY',
    ...view.healthSummary.map((s) => `• ${s}`),
    '',
    'PROFILE',
    ...view.profileSummary.map((s) => `• ${s}`),
    '',
    'CYCLE ANALYSIS',
    ...view.cycleAnalysis.map((s) => `• ${s}`),
    '',
    'SLEEP ANALYSIS',
    ...view.sleepAnalysis.map((s) => `• ${s}`),
    '',
    'MOOD ANALYSIS',
    ...view.moodAnalysis.map((s) => `• ${s}`),
    '',
    'ANDROGEN ANALYSIS',
    ...view.androgenAnalysis.map((s) => `• ${s}`),
    '',
    'SYMPTOM HISTORY',
    ...view.symptomHistory.map((s) => `• ${s}`),
    '',
    'RISK PATTERNS',
    ...view.riskPatterns.map((r) => `• [${r.severity}] ${r.concern}: ${r.note}`),
    '',
    'QUESTIONS FOR DOCTOR',
    ...view.questionsForDoctor.map((q, i) => `${i + 1}. ${q}`),
    '',
    'RECOMMENDED TESTS',
    ...view.recommendedTests.map((t) => `• ${t.name} — ${t.reason}`),
    '',
    'Generated by Cyra — not a medical diagnosis.',
  ];
  return lines.join('\n');
}
