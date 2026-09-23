import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { EvaluationScore, UnknownSample, NotebookObservation, AdulterantType } from '../types/lab';
import { ADULTERANT_DATA } from './adulterationData';

interface GenerateReportOptions {
  score: EvaluationScore;
  sample: UnknownSample;
  observations: NotebookObservation[];
  studentName?: string;
}

export function generateLabReportPDF({
  score,
  sample,
  observations,
  studentName = 'Student Analyst',
}: GenerateReportOptions): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Color Palette (Navy / Slate / Cyan / Crimson / Emerald)
  const primaryNavy: [number, number, number] = [15, 23, 42]; // #0f172a
  const cyanAccent: [number, number, number] = [6, 182, 212]; // #06b6d4
  const darkSlate: [number, number, number] = [30, 41, 59]; // #1e293b
  const mutedGray: [number, number, number] = [100, 116, 139]; // #64748b
  const emeraldGreen: [number, number, number] = [16, 185, 129]; // #10b981
  const roseRed: [number, number, number] = [239, 68, 68]; // #ef4444

  // Top Decorative Header Bar
  doc.setFillColor(...primaryNavy);
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Accent Line
  doc.setFillColor(...cyanAccent);
  doc.rect(0, 27, pageWidth, 1.2, 'F');

  // Header Title & Lab Branding
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('MILKSAFE 3D LABORATORY SIMULATION', margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text('Dairy Chemistry & Forensic Adulteration Analysis Certificate', margin, 18);

  const reportId = `MS-${sample.id.replace(/[^a-zA-Z0-9]/g, '')}-${Date.now().toString().slice(-6)}`;
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text(`Report ID: ${reportId}`, pageWidth - margin, 12, { align: 'right' });
  doc.text(`Issued: ${dateStr}`, pageWidth - margin, 18, { align: 'right' });
  doc.text(`Investigator: ${studentName}`, pageWidth - margin, 23, { align: 'right' });

  let cursorY = 34;

  // Executive Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...primaryNavy);
  doc.text('OFFICIAL FORENSIC ADULTERATION TEST REPORT', margin, cursorY);

  cursorY += 5;

  // Executive Summary Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...mutedGray);
  doc.text(
    'Qualitative chemical assay report determining adulterant compounds according to FSSAI & AOAC standards.',
    margin,
    cursorY
  );

  cursorY += 6;

  // Box 1: Sample Metadata & Baseline Physical Parameters
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, cursorY, contentWidth, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...darkSlate);
  doc.text('SAMPLE METADATA & PHYSICAL SPECIFICATIONS', margin + 4, cursorY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

  const col1X = margin + 4;
  const col2X = margin + 48;
  const col3X = margin + 96;
  const col4X = margin + 140;

  // Row 1
  doc.text(`Sample Code: `, col1X, cursorY + 12);
  doc.setFont('helvetica', 'bold');
  doc.text(sample.id, col1X + 20, cursorY + 12);
  doc.setFont('helvetica', 'normal');

  doc.text(`Batch ID: `, col2X, cursorY + 12);
  doc.setFont('helvetica', 'bold');
  doc.text(sample.batchNumber, col2X + 14, cursorY + 12);
  doc.setFont('helvetica', 'normal');

  doc.text(`Difficulty: `, col3X, cursorY + 12);
  doc.text(sample.difficulty.toUpperCase(), col3X + 16, cursorY + 12);

  doc.text(`Time Elapsed: `, col4X, cursorY + 12);
  doc.text(`${Math.floor(score.timeSpentSeconds / 60)}m ${score.timeSpentSeconds % 60}s`, col4X + 21, cursorY + 12);

  // Row 2
  doc.text(`Origin Depot: `, col1X, cursorY + 18.5);
  doc.text(sample.source.length > 22 ? sample.source.slice(0, 20) + '...' : sample.source, col1X + 19, cursorY + 18.5);

  doc.text(`Gerber Fat: `, col2X, cursorY + 18.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`${sample.fatPercentage}% (Std ≥ 3.5%)`, col2X + 18, cursorY + 18.5);
  doc.setFont('helvetica', 'normal');

  doc.text(`SNF Content: `, col3X, cursorY + 18.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`${sample.snfPercentage}% (Std ≥ 8.5%)`, col3X + 20, cursorY + 18.5);
  doc.setFont('helvetica', 'normal');

  cursorY += 28;

  // Box 2: Overall Score & Rubric Breakdown Banner
  const scoreBoxHeight = 22;
  const isHighPass = score.totalScore >= 75;
  const isPass = score.totalScore >= 60;
  const scoreBgColor: [number, number, number] = isHighPass
    ? [236, 253, 245]
    : isPass
    ? [239, 246, 255]
    : [254, 242, 242];
  const scoreBorderColor: [number, number, number] = isHighPass
    ? [16, 185, 129]
    : isPass
    ? [59, 130, 246]
    : [239, 68, 68];

  doc.setFillColor(...scoreBgColor);
  doc.setDrawColor(...scoreBorderColor);
  doc.roundedRect(margin, cursorY, contentWidth, scoreBoxHeight, 2, 2, 'FD');

  // Big Score on Left
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...(isHighPass ? emeraldGreen : isPass ? darkSlate : roseRed));
  doc.text(`${score.totalScore}`, margin + 6, cursorY + 14);

  doc.setFontSize(8.5);
  doc.setTextColor(...mutedGray);
  doc.text('/ 100 PTS', margin + 28, cursorY + 13.5);

  // Verdict status badge
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  const verdictText = score.diagnosisCorrect
    ? 'DIAGNOSIS ACCURATE & VERIFIED'
    : 'DIAGNOSTIC DISCREPANCY IDENTIFIED';
  doc.setTextColor(...(score.diagnosisCorrect ? emeraldGreen : roseRed));
  doc.text(verdictText, margin + 50, cursorY + 8);

  // Rubric details
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Scientific Result: ${score.scientificAccuracy}/50  •  Procedural Rigor: ${score.proceduralAccuracy}/30  •  ELN Observation: ${score.observationAccuracy}/20`,
    margin + 50,
    cursorY + 14
  );

  doc.text(
    `Total Mistakes: ${score.mistakesCount}  •  Tests Documented: ${score.testsCompletedCount} of 5 standard assays`,
    margin + 50,
    cursorY + 18.5
  );

  cursorY += scoreBoxHeight + 5;

  // Section 3: Diagnostic Results Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...primaryNavy);
  doc.text('1. QUALITATIVE ASSAY OBSERVATIONS & FORENSIC DIAGNOSIS', margin, cursorY);
  cursorY += 2.5;

  const allAdulterants: AdulterantType[] = ['starch', 'urea', 'detergent', 'cane_sugar', 'hydrogen_peroxide'];

  const tableRows = allAdulterants.map((type) => {
    const info = ADULTERANT_DATA[type];
    const obs = observations.find((o) => o.sampleId === sample.id && o.testId === type);
    const isDetectedByStudent = score.detectedAdulterants.includes(type);
    const isActuallyPresent = score.actualAdulterants.includes(type);
    const isCorrect = isDetectedByStudent === isActuallyPresent;

    const studentVerdictStr = isDetectedByStudent ? 'POSITIVE (Present)' : 'NEGATIVE (Absent)';
    const actualStatusStr = isActuallyPresent ? 'PRESENT' : 'ABSENT (Pure)';
    const outcomeStr = isCorrect ? 'CORRECT' : 'INCORRECT';

    const obsText = obs
      ? `${obs.observedColor}${obs.observedFoam ? ' (Foam)' : ''}`
      : 'No test recorded';

    return [
      `${info.name}\n(${info.testName})`,
      info.reagentName,
      obsText,
      studentVerdictStr,
      actualStatusStr,
      outcomeStr,
    ];
  });

  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    head: [['Assay / Target', 'Testing Reagent', 'Observed Visual Sign', 'Student Verdict', 'Actual Content', 'Result']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: primaryNavy,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'left',
      cellPadding: 2,
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [30, 41, 59],
      cellPadding: 2,
      valign: 'middle',
    },
    columnStyles: {
      0: { cellWidth: 32, fontStyle: 'bold' },
      1: { cellWidth: 38 },
      2: { cellWidth: 42 },
      3: { cellWidth: 28, fontStyle: 'bold' },
      4: { cellWidth: 24, fontStyle: 'bold' },
      5: { cellWidth: 18, fontStyle: 'bold', halign: 'center' },
    },
    didParseCell: (data) => {
      if (data.section === 'body') {
        if (data.column.index === 5) {
          const val = String(data.cell.raw);
          if (val === 'CORRECT') {
            data.cell.styles.textColor = emeraldGreen;
          } else {
            data.cell.styles.textColor = roseRed;
          }
        } else if (data.column.index === 3) {
          const val = String(data.cell.raw);
          if (val.startsWith('POSITIVE')) {
            data.cell.styles.textColor = [190, 18, 60];
          }
        }
      }
    },
  });

  // Calculate position after table
  // @ts-expect-error jspdf-autotable augments doc with lastAutoTable
  cursorY = (doc.lastAutoTable?.finalY || cursorY + 45) + 5;

  // Section 4: Procedural Deviations / Mistakes Audit
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...primaryNavy);
  doc.text('2. PROCEDURAL EXECUTION & DEVIATIONS AUDIT', margin, cursorY);
  cursorY += 2.5;

  if (score.mistakes.length === 0) {
    autoTable(doc, {
      startY: cursorY,
      margin: { left: margin, right: margin },
      head: [['Fault / Deviation', 'Classification', 'Penalty', 'Correction / Protocol Standard']],
      body: [
        ['Nil (Perfect Protocol Adherence)', 'N/A', '0 Pts', 'Standard operating procedures were strictly maintained.'],
      ],
      theme: 'grid',
      headStyles: {
        fillColor: darkSlate,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5,
      },
      bodyStyles: {
        fontSize: 7,
        cellPadding: 2,
        textColor: emeraldGreen,
      },
    });
  } else {
    const mistakeRows = score.mistakes.map((m) => [
      m.title,
      m.type.toUpperCase(),
      `-${m.penaltyPoints} Pts`,
      m.description,
    ]);

    autoTable(doc, {
      startY: cursorY,
      margin: { left: margin, right: margin },
      head: [['Procedural Deviation', 'Error Type', 'Deduction', 'Auditor Note & Remediation']],
      body: mistakeRows,
      theme: 'grid',
      headStyles: {
        fillColor: [127, 29, 29], // dark red
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5,
      },
      bodyStyles: {
        fontSize: 7,
        cellPadding: 2,
        textColor: [51, 65, 85],
      },
      columnStyles: {
        0: { cellWidth: 40, fontStyle: 'bold' },
        1: { cellWidth: 26 },
        2: { cellWidth: 20, fontStyle: 'bold', textColor: roseRed },
        3: { cellWidth: 'auto' },
      },
    });
  }

  // @ts-expect-error jspdf-autotable augments doc with lastAutoTable
  cursorY = (doc.lastAutoTable?.finalY || cursorY + 25) + 5;

  // Check if we need a new page for Chemistry Breakdown & Certification Sign-Off
  if (cursorY > pageHeight - 55) {
    doc.addPage();
    cursorY = 16;
  }

  // Section 5: Chemistry Breakdown of Identified Adulterants
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...primaryNavy);
  doc.text('3. SCIENTIFIC REACTION MECHANISMS & TOXICOLOGY', margin, cursorY);
  cursorY += 4;

  const relevantAdulterants = score.actualAdulterants.length > 0
    ? score.actualAdulterants
    : (['starch', 'urea'] as AdulterantType[]);

  relevantAdulterants.slice(0, 3).forEach((type) => {
    const info = ADULTERANT_DATA[type];
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...darkSlate);
    doc.text(`• ${info.name} Assay (${info.testName}):`, margin, cursorY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);

    const explanationText = `${info.purposeOfAdulteration} Mechanism: ${info.chemistryExplanation} Toxicological Impact: ${info.healthHazard}`;
    const splitLines = doc.splitTextToSize(explanationText, contentWidth - 4);
    doc.text(splitLines, margin + 4, cursorY + 3.5);

    cursorY += 4 + splitLines.length * 3;
  });

  cursorY += 2;

  // Verification & Academic Certification Sign-off Block
  if (cursorY > pageHeight - 35) {
    doc.addPage();
    cursorY = 16;
  }

  doc.setDrawColor(203, 213, 225);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryNavy);
  doc.text('LABORATORY SUPERVISOR VERIFICATION & SIGN-OFF', margin, cursorY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...mutedGray);
  doc.text(
    'This electronic lab document was programmatically validated by the MilkSafe 3D simulation rubric engine.',
    margin,
    cursorY + 4
  );

  // Digital Signature Box
  const sigX = pageWidth - margin - 55;
  doc.setDrawColor(148, 163, 184);
  doc.line(sigX, cursorY + 12, sigX + 50, cursorY + 12);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.text('Certified Academic Laboratory System', sigX + 3, cursorY + 15);

  // Footer Disclaimer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Notice: MilkSafe 3D Lab is an educational simulation platform conforming to FSSAI & AOAC qualitative protocols. Not for regulatory prosecution.',
    pageWidth / 2,
    pageHeight - 6,
    { align: 'center' }
  );

  // Save / Trigger Download
  const filename = `MilkSafe_Lab_Report_${sample.id}_${Date.now()}.pdf`;
  doc.save(filename);
}
