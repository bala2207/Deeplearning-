import { useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaCheckCircle, FaExclamationTriangle, FaArrowLeft, FaDownload,
  FaBrain, FaClock, FaFile, FaFilePdf, FaHeartbeat, FaChartBar,
  FaShieldAlt, FaNotesMedical, FaStethoscope,
} from 'react-icons/fa';
import { jsPDF } from 'jspdf';
import PageTransition from '../components/PageTransition';

// ─────────────────────────────────────────────────────────
// Simulated clinical metrics derived from prediction + confidence
// In production these would come from the model's detailed output.
// ─────────────────────────────────────────────────────────
const generateClinicalMetrics = (prediction, confidence) => {
  const isStroke = prediction === 'Stroke';
  const conf = Math.round(confidence * 100);

  // Seed a deterministic-ish random from confidence for consistency
  const s = Math.round(confidence * 1000);

  if (isStroke) {
    const nihss = conf >= 90 ? 15 + (s % 6) : conf >= 70 ? 8 + (s % 7) : 3 + (s % 5);
    const aspects = conf >= 90 ? 3 + (s % 3) : conf >= 70 ? 5 + (s % 2) : 7 + (s % 2);
    const types = ['Ischemic', 'Hemorrhagic'];
    const strokeType = conf >= 80 ? types[s % 2] : types[0];
    const hemispheres = ['Left', 'Right'];
    const hemisphere = hemispheres[s % 2];
    const regions = [
      'Middle Cerebral Artery (MCA) territory',
      'Anterior Cerebral Artery (ACA) territory',
      'Posterior Cerebral Artery (PCA) territory',
      'Basal Ganglia region',
      'Internal Capsule region',
    ];
    const region = regions[s % regions.length];
    const riskLevel = conf >= 85 ? 'High' : conf >= 65 ? 'Moderate' : 'Low-Moderate';
    const lesionVol = conf >= 85
      ? (15 + (s % 35)).toFixed(1)
      : conf >= 65
        ? (5 + (s % 15)).toFixed(1)
        : (1 + (s % 5)).toFixed(1);
    const midlineShift = conf >= 85 ? (2 + (s % 4)).toFixed(1) : conf >= 65 ? (0.5 + (s % 2)).toFixed(1) : '0.0';

    return {
      nihss, aspects, strokeType, hemisphere, region, riskLevel,
      lesionVolume: `${lesionVol} mL`,
      midlineShift: `${midlineShift} mm`,
      bloodPressure: `${148 + (s % 30)}/${88 + (s % 15)} mmHg`,
      heartRate: `${78 + (s % 22)} bpm`,
      oxygenSaturation: `${93 + (s % 4)}%`,
      recommendations: [
        'Immediate neurological consultation recommended',
        strokeType === 'Ischemic' ? 'Evaluate eligibility for thrombolysis (tPA) if within time window' : 'Urgent neurosurgical evaluation for hemorrhage management',
        'Continuous cardiac monitoring and blood pressure management',
        'Repeat neuroimaging in 24 hours to assess progression',
        'Initiate stroke unit admission protocol',
      ],
    };
  }

  // Normal case
  return {
    nihss: 0,
    aspects: 10,
    strokeType: 'None Detected',
    hemisphere: 'Bilateral (Normal)',
    region: 'No focal abnormality identified',
    riskLevel: 'Low',
    lesionVolume: '0.0 mL',
    midlineShift: '0.0 mm',
    bloodPressure: `${115 + (s % 15)}/${72 + (s % 10)} mmHg`,
    heartRate: `${68 + (s % 12)} bpm`,
    oxygenSaturation: `${97 + (s % 2)}%`,
    recommendations: [
      'No acute stroke indicators detected',
      'Continue routine follow-up as clinically indicated',
      'Maintain healthy lifestyle and risk factor management',
      'Periodic neurological check-up recommended',
    ],
  };
};

// ─────────────────────────────────────────────────────────
// Shared styles for metric cards
// ─────────────────────────────────────────────────────────
const metricCardStyle = {
  padding: '18px',
  borderRadius: '14px',
  background: 'var(--color-surface-card)',
  border: '1px solid var(--glass-border)',
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
};
const metricLabel = { fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 };
const metricValue = (color) => ({ fontSize: '1.35rem', fontWeight: 800, color: color || '#fff', lineHeight: 1.2 });
const metricSub = { fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '2px' };

// ─── Risk badge color ──────────────────────────────────
const riskColor = (level) => {
  if (level === 'High') return '#ff4d6a';
  if (level === 'Moderate') return '#ff9f43';
  if (level === 'Low-Moderate') return '#ffc048';
  return '#00d4aa';
};

// ═══════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════

const ReportPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state;

  const metrics = useMemo(() => {
    if (!data) return null;
    return generateClinicalMetrics(data.prediction, data.confidence);
  }, [data]);

  // ──────────────────────────────────────────────
  // PDF Generation (expanded with clinical metrics)
  // ──────────────────────────────────────────────
  const generatePDF = async () => {
    if (!data || !metrics) return;

    const { prediction, confidence, imageUrl, fileName, fileSize, timestamp } = data;
    const isStroke = prediction === 'Stroke';
    const confidencePercent = Math.round(confidence * 100);
    const doc = new jsPDF('p', 'mm', 'a4');
    const pw = doc.internal.pageSize.getWidth();   // 210
    const ph = doc.internal.pageSize.getHeight();  // 297

    // ── Layout constants ──
    const mL = 16;           // left margin
    const mR = 16;           // right margin
    const contentW = pw - mL - mR; // usable width
    const innerPad = 10;     // padding inside cards
    const footerZone = 18;   // reserved for footer

    // ── Colors ──
    const primary   = [108, 99, 255];
    const accent    = isStroke ? [255, 77, 106] : [0, 212, 170];
    const darkBg    = [18, 18, 35];
    const darkBg2   = [24, 24, 44];
    const textWhite = [255, 255, 255];
    const textMuted = [160, 160, 180];
    const borderClr = [44, 44, 70];
    const riskC     = metrics.riskLevel === 'High' ? [255, 77, 106]
                    : metrics.riskLevel === 'Moderate' ? [255, 159, 67]
                    : metrics.riskLevel === 'Low-Moderate' ? [255, 192, 72]
                    : [0, 212, 170];

    let y = 0;
    let pageCount = 1;

    // ── Helpers ──
    const drawCard = (x, yy, w, h, r = 3) => {
      doc.setFillColor(...darkBg);
      doc.setDrawColor(...borderClr);
      doc.setLineWidth(0.35);
      doc.roundedRect(x, yy, w, h, r, r, 'FD');
    };

    const checkPageBreak = (needed) => {
      if (y + needed > ph - footerZone) {
        addFooter();
        doc.addPage();
        pageCount++;
        y = 16;
      }
    };

    const sectionTitle = (label) => {
      checkPageBreak(20);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...textWhite);
      doc.text(label, mL, y + 4);
      y += 9;
    };

    const addFooter = () => {
      const fy = ph - 8;
      doc.setDrawColor(...borderClr);
      doc.setLineWidth(0.25);
      doc.line(mL, fy - 5, pw - mR, fy - 5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...textMuted);
      doc.text('StrokeSense  —  AI-Based Stroke Detection System  |  For Research & Educational Use Only', mL, fy);
      doc.text(`Page ${pageCount}`, pw - mR, fy, { align: 'right' });
    };

    // ═══════════════════════════════════════════════════
    // PAGE 1
    // ═══════════════════════════════════════════════════

    // ── 1. Header Banner ──
    doc.setFillColor(...primary);
    doc.rect(0, 0, pw, 42, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(...textWhite);
    doc.text('StrokeSense', pw / 2, 15, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(220, 220, 240);
    doc.text('AI-Powered Stroke Detection  —  Clinical Analysis Report', pw / 2, 24, { align: 'center' });

    doc.setFontSize(7.5);
    doc.setTextColor(200, 200, 220);
    const reportId = `SS-${Date.now().toString(36).toUpperCase()}`;
    doc.text(`Report ID: ${reportId}     |     Generated: ${new Date().toLocaleString()}`, pw / 2, 34, { align: 'center' });

    y = 50;

    // ── 2. Prediction Result Card ──
    const predCardH = 36;
    drawCard(mL, y, contentW, predCardH);
    // accent top bar
    doc.setFillColor(...accent);
    doc.rect(mL, y, contentW, 2.5, 'F');

    // Left side — prediction
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...textMuted);
    doc.text('AI PREDICTION', mL + innerPad, y + 14);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(20); doc.setTextColor(...accent);
    doc.text(prediction, mL + innerPad, y + 26);

    // Right side — confidence
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...textMuted);
    doc.text('CONFIDENCE', pw - mR - innerPad, y + 14, { align: 'right' });
    doc.setFont('helvetica', 'bold'); doc.setFontSize(20); doc.setTextColor(...accent);
    doc.text(`${confidencePercent}%`, pw - mR - innerPad, y + 26, { align: 'right' });

    // Confidence bar
    const barX2 = mL + innerPad;
    const barW2 = contentW - innerPad * 2;
    const barY = y + 30;
    doc.setFillColor(40, 40, 65);
    doc.roundedRect(barX2, barY, barW2, 3, 1.5, 1.5, 'F');
    doc.setFillColor(...accent);
    doc.roundedRect(barX2, barY, Math.max(barW2 * (confidencePercent / 100), 3), 3, 1.5, 1.5, 'F');

    y += predCardH + 8;

    // ── 3. Clinical Assessment Metrics (table) ──
    sectionTitle('Clinical Assessment Metrics');

    const metricsRows = [
      { label: 'NIHSS Score',          value: `${metrics.nihss} / 42`,   note: metrics.nihss > 15 ? 'Severe' : metrics.nihss > 8 ? 'Moderate' : metrics.nihss > 0 ? 'Minor' : 'Normal' },
      { label: 'ASPECTS Score',        value: `${metrics.aspects} / 10`, note: metrics.aspects <= 5 ? 'Extensive Changes' : 'Normal / Limited' },
      { label: 'Stroke Classification', value: metrics.strokeType,       note: '' },
      { label: 'Risk Level',           value: metrics.riskLevel,         note: '', color: riskC },
      { label: 'Affected Hemisphere', value: metrics.hemisphere,         note: '' },
      { label: 'Affected Region',     value: metrics.region,             note: '' },
      { label: 'Estimated Lesion Volume', value: metrics.lesionVolume,   note: '' },
      { label: 'Midline Shift',       value: metrics.midlineShift,       note: '' },
    ];

    const rowH = 11;
    const tableH = metricsRows.length * rowH + 6;
    drawCard(mL, y, contentW, tableH);

    const labelX = mL + innerPad;
    const valueX = mL + 72;          // fixed column for values
    const noteX = mL + contentW - innerPad;

    metricsRows.forEach((row, i) => {
      const ry = y + 4 + i * rowH;

      // zebra
      if (i % 2 === 0) {
        doc.setFillColor(...darkBg2);
        doc.rect(mL + 1, ry, contentW - 2, rowH, 'F');
      }

      // Label
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...textMuted);
      doc.text(row.label, labelX, ry + 7.5);

      // Value
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5);
      doc.setTextColor(...(row.color || textWhite));
      doc.text(row.value, valueX, ry + 7.5);

      // Note (right-aligned)
      if (row.note) {
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(...textMuted);
        doc.text(row.note, noteX, ry + 7.5, { align: 'right' });
      }
    });

    y += tableH + 8;

    // ── 4. Vital Signs ──
    sectionTitle('Vital Signs (Simulated)');

    const vitals = [
      { label: 'Blood Pressure',       value: metrics.bloodPressure },
      { label: 'Heart Rate',            value: metrics.heartRate },
      { label: 'Oxygen Saturation',     value: metrics.oxygenSaturation },
    ];

    const vitalsH = 22;
    drawCard(mL, y, contentW, vitalsH);
    const vColW = contentW / vitals.length;

    vitals.forEach((v, i) => {
      const vx = mL + i * vColW + innerPad;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(...textMuted);
      doc.text(v.label, vx, y + 8);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10.5); doc.setTextColor(...textWhite);
      doc.text(v.value, vx, y + 17);

      // vertical divider (except last)
      if (i < vitals.length - 1) {
        doc.setDrawColor(...borderClr);
        doc.setLineWidth(0.25);
        doc.line(mL + (i + 1) * vColW, y + 4, mL + (i + 1) * vColW, y + vitalsH - 4);
      }
    });

    y += vitalsH + 8;

    // ── 5. Scan Image ──
    if (imageUrl) {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = imageUrl; });

        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvas.getContext('2d').drawImage(img, 0, 0);
        const imgData = canvas.toDataURL('image/jpeg', 0.85);

        const ratio = img.naturalHeight / img.naturalWidth;
        let iw = contentW - 20;
        let ih = iw * ratio;
        if (ih > 75) { ih = 75; iw = ih / ratio; }

        const imgCardH = ih + 16;
        checkPageBreak(imgCardH + 12);
        sectionTitle('Uploaded Scan');
        drawCard(mL, y, contentW, imgCardH);
        doc.addImage(imgData, 'JPEG', (pw - iw) / 2, y + 8, iw, ih);
        y += imgCardH + 8;
      } catch {
        /* skip image on error */
      }
    }

    // ── 6. File Details ──
    sectionTitle('Scan Details');

    const details = [
      ['File Name',     fileName || 'N/A'],
      ['File Size',     fileSize || 'N/A'],
      ['Date & Time',   timestamp || 'N/A'],
      ['Model',         'StrokeSense CNN v1.0'],
      ['Analysis Type', 'Brain MRI / CT Stroke Detection'],
    ];

    const detRowH = 10;
    const detTableH = details.length * detRowH + 6;
    checkPageBreak(detTableH + 4);
    drawCard(mL, y, contentW, detTableH);

    details.forEach((row, i) => {
      const ry = y + 4 + i * detRowH;
      if (i % 2 === 0) {
        doc.setFillColor(...darkBg2);
        doc.rect(mL + 1, ry, contentW - 2, detRowH, 'F');
      }
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...textMuted);
      doc.text(row[0], labelX, ry + 7);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(...textWhite);
      doc.text(row[1], pw - mR - innerPad, ry + 7, { align: 'right' });
    });

    y += detTableH + 8;

    // ── 7. Clinical Interpretation ──
    const interp = isStroke
      ? `The AI model has detected indicators consistent with ${metrics.strokeType.toLowerCase()} stroke in the ${metrics.hemisphere.toLowerCase()} hemisphere, specifically within the ${metrics.region}. The analysis reports a confidence level of ${confidencePercent}%, an NIHSS score of ${metrics.nihss}/42 (${metrics.nihss > 15 ? 'severe' : metrics.nihss > 8 ? 'moderate' : 'minor'} severity), and an ASPECTS score of ${metrics.aspects}/10. Estimated lesion volume is ${metrics.lesionVolume} with a midline shift of ${metrics.midlineShift}. These findings suggest ${metrics.riskLevel.toLowerCase()} risk and warrant immediate clinical evaluation by a qualified neurologist.`
      : `The AI model has analyzed the uploaded brain scan and found no significant indicators of stroke (NIHSS: 0/42, ASPECTS: 10/10). The scan appears to be within normal parameters across both hemispheres. No focal abnormalities, lesion volumes, or midline shifts were detected. Based on the model's assessment with ${confidencePercent}% confidence, the risk level is classified as low. Routine follow-up is recommended.`;

    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5);
    const interpTextW = contentW - innerPad * 2 - 6;  // 6 for accent bar
    const interpLines = doc.splitTextToSize(interp, interpTextW);
    const interpTextH = interpLines.length * 4.2;
    const interpCardH = interpTextH + 14;

    checkPageBreak(interpCardH + 14);
    sectionTitle('Clinical Interpretation');
    drawCard(mL, y, contentW, interpCardH);
    // left accent bar
    doc.setFillColor(...accent);
    doc.rect(mL, y, 3, interpCardH, 'F');

    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(210, 210, 220);
    doc.text(interpLines, mL + innerPad + 4, y + 10);

    y += interpCardH + 8;

    // ── 8. Recommendations ──
    // Wrap each recommendation line
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5);
    const recMaxW = contentW - innerPad * 2 - 12; // bullet + padding
    const wrappedRecs = metrics.recommendations.map(rec => doc.splitTextToSize(rec, recMaxW));
    const totalRecLines = wrappedRecs.reduce((sum, lines) => sum + lines.length, 0);
    const recLineH = 4.5;
    const recCardH = totalRecLines * recLineH + metrics.recommendations.length * 2 + 12;

    checkPageBreak(recCardH + 14);
    sectionTitle('Recommendations');
    drawCard(mL, y, contentW, recCardH);
    // left accent bar
    doc.setFillColor(...primary);
    doc.rect(mL, y, 3, recCardH, 'F');

    let recY = y + 10;
    wrappedRecs.forEach((lines) => {
      // bullet
      doc.setFillColor(...accent);
      doc.circle(mL + innerPad + 2, recY + 0.5, 1, 'F');

      doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(210, 210, 220);
      lines.forEach((line, li) => {
        doc.text(line, mL + innerPad + 8, recY + 2);
        recY += recLineH;
      });
      recY += 2; // gap between items
    });

    y += recCardH + 8;

    // ── 9. Risk Assessment Summary ──
    const riskText = metrics.riskLevel === 'High'
      ? 'Immediate medical attention is strongly advised. The detected indicators warrant urgent neurological evaluation and potential intervention.'
      : metrics.riskLevel === 'Moderate' || metrics.riskLevel === 'Low-Moderate'
        ? 'Clinical follow-up is recommended. While not immediately critical, further assessment by a healthcare professional can help rule out potential concerns.'
        : 'No immediate risk detected. The scan appears normal. Maintain regular health check-ups and a healthy lifestyle for ongoing brain health.';

    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5);
    const riskLines = doc.splitTextToSize(riskText, contentW - innerPad * 2 - 6);
    const riskCardH = riskLines.length * 4.2 + 20;

    checkPageBreak(riskCardH + 14);
    sectionTitle('Risk Assessment Summary');
    drawCard(mL, y, contentW, riskCardH);
    doc.setFillColor(...riskC);
    doc.rect(mL, y, 3, riskCardH, 'F');

    doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(...riskC);
    doc.text(`${metrics.riskLevel} Risk`, mL + innerPad + 4, y + 12);

    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(200, 200, 210);
    doc.text(riskLines, mL + innerPad + 4, y + 20);

    y += riskCardH + 8;

    // ── 10. Disclaimer ──
    const discText = 'This AI-generated report is for educational and research purposes only. All clinical metrics shown are simulated based on model confidence and do not represent actual patient data. This report should not replace professional medical diagnosis. Always consult a qualified healthcare provider for clinical decisions.';
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5);
    const discLines = doc.splitTextToSize(discText, contentW - innerPad * 2 - 6);
    const discCardH = discLines.length * 3.8 + 16;

    checkPageBreak(discCardH + 4);
    doc.setFillColor(40, 35, 22);
    doc.setDrawColor(80, 70, 40);
    doc.setLineWidth(0.3);
    doc.roundedRect(mL, y, contentW, discCardH, 3, 3, 'FD');
    // left accent
    doc.setFillColor(255, 184, 77);
    doc.rect(mL, y, 3, discCardH, 'F');

    doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(255, 184, 77);
    doc.text('MEDICAL DISCLAIMER', mL + innerPad + 4, y + 8);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(200, 180, 140);
    doc.text(discLines, mL + innerPad + 4, y + 15);

    // ── Add footers to all pages ──
    const totalPages = doc.internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      const fy = ph - 8;
      doc.setDrawColor(...borderClr);
      doc.setLineWidth(0.25);
      doc.line(mL, fy - 5, pw - mR, fy - 5);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(...textMuted);
      doc.text('StrokeSense  —  AI-Based Stroke Detection System  |  For Research & Educational Use Only', mL, fy);
      doc.text(`Page ${p} of ${totalPages}`, pw - mR, fy, { align: 'right' });
    }

    // ── Save ──
    const safeName = (fileName || 'scan').replace(/\.[^.]+$/, '');
    doc.save(`StrokeSense_Report_${safeName}.pdf`);
  };

  // ─── Empty state ────────────────────────────────
  if (!data) {
    return (
      <PageTransition>
        <section className="section" style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', maxWidth: '500px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <FaBrain size={32} style={{ color: 'var(--color-primary-light)' }} />
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '12px' }}>No Report Available</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', marginBottom: '32px', lineHeight: 1.6 }}>
              You haven't performed a scan analysis yet. Upload an MRI or CT image to generate a prediction report.
            </p>
            <Link to="/model"><button className="btn-primary" style={{ padding: '14px 32px' }}>Upload a Scan</button></Link>
          </div>
        </section>
      </PageTransition>
    );
  }

  const { prediction, confidence, imageUrl, fileName, fileSize, timestamp } = data;
  const isStroke = prediction === 'Stroke';
  const confidencePercent = Math.round(confidence * 100);
  const gaugeColor = isStroke ? '#ff4d6a' : '#00d4aa';

  return (
    <PageTransition>
      <section className="section" style={{ minHeight: '85vh' }}>
        <div className="container" style={{ maxWidth: '880px' }}>
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/model')}
            id="back-to-model"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '0.95rem', cursor: 'pointer', marginBottom: '32px', padding: '8px 0' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
          >
            <FaArrowLeft size={14} /> Back to Detection
          </motion.button>

          {/* Title */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', fontWeight: 800, marginBottom: '8px' }}>
              Clinical Analysis <span className="gradient-text">Report</span>
            </h1>
            <p style={{ color: 'var(--color-text-muted)' }}>AI-powered stroke detection result with clinical metrics</p>
          </motion.div>

          {/* ═══ Result + Gauge ═══ */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card" style={{ padding: '48px 40px', borderTop: `3px solid ${gaugeColor}` }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center' }} className="report-grid">
              {/* Left - Confidence Gauge */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}>
                  {isStroke ? <FaExclamationTriangle size={48} style={{ color: '#ff4d6a' }} /> : <FaCheckCircle size={48} style={{ color: '#00d4aa' }} />}
                </motion.div>
                <div style={{ padding: '10px 28px', borderRadius: '50px', background: `${gaugeColor}15`, border: `1px solid ${gaugeColor}40`, fontSize: '1.3rem', fontWeight: 700, color: gaugeColor, letterSpacing: '0.02em' }}>
                  {prediction}
                </div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="gauge-track" style={{ '--gauge-value': `${confidencePercent}%`, background: `conic-gradient(${gaugeColor} ${confidencePercent}%, rgba(255,255,255,0.05) ${confidencePercent}%)` }}>
                  <div className="gauge-inner">
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} style={{ fontSize: '2.2rem', fontWeight: 800, color: gaugeColor }}>{confidencePercent}%</motion.span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>Confidence</span>
                  </div>
                </motion.div>
              </div>

              {/* Right - Image & Metadata */}
              <div>
                {imageUrl && (
                  <div style={{ marginBottom: '24px' }}>
                    <img src={imageUrl} alt="Analyzed brain scan" style={{ width: '100%', maxHeight: '220px', objectFit: 'contain', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }} />
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '20px', borderRadius: 'var(--radius-md)', background: 'var(--color-surface-card)', border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                    <FaFile size={14} style={{ color: 'var(--color-primary-light)' }} />
                    <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>File:</span> <span>{fileName}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                    <FaDownload size={14} style={{ color: 'var(--color-primary-light)' }} />
                    <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>Size:</span> <span>{fileSize}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                    <FaClock size={14} style={{ color: 'var(--color-primary-light)' }} />
                    <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>Analyzed:</span> <span>{timestamp}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ═══ Clinical Metrics Grid ═══ */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ marginTop: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FaStethoscope size={18} style={{ color: 'var(--color-primary-light)' }} />
              Clinical Assessment Metrics
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }} className="metrics-grid">
              {/* NIHSS */}
              <div style={metricCardStyle}>
                <span style={metricLabel}>NIHSS Score</span>
                <span style={metricValue(isStroke ? '#ff4d6a' : '#00d4aa')}>{metrics.nihss} <span style={{ fontSize: '0.7rem', fontWeight: 400, color: 'var(--color-text-muted)' }}>/ 42</span></span>
                <span style={metricSub}>{metrics.nihss > 15 ? 'Severe Deficit' : metrics.nihss > 8 ? 'Moderate Deficit' : metrics.nihss > 0 ? 'Minor Deficit' : 'No Deficit'}</span>
              </div>

              {/* ASPECTS */}
              <div style={metricCardStyle}>
                <span style={metricLabel}>ASPECTS Score</span>
                <span style={metricValue(metrics.aspects <= 5 ? '#ff4d6a' : '#00d4aa')}>{metrics.aspects} <span style={{ fontSize: '0.7rem', fontWeight: 400, color: 'var(--color-text-muted)' }}>/ 10</span></span>
                <span style={metricSub}>{metrics.aspects <= 5 ? 'Extensive Changes' : metrics.aspects <= 7 ? 'Limited Changes' : 'Normal'}</span>
              </div>

              {/* Stroke Type */}
              <div style={metricCardStyle}>
                <span style={metricLabel}>Stroke Classification</span>
                <span style={metricValue(isStroke ? '#ff9f43' : '#00d4aa')}>{metrics.strokeType}</span>
                <span style={metricSub}>{isStroke ? 'AI Classification' : 'No acute findings'}</span>
              </div>

              {/* Risk Level */}
              <div style={metricCardStyle}>
                <span style={metricLabel}>Risk Level</span>
                <span style={metricValue(riskColor(metrics.riskLevel))}>{metrics.riskLevel}</span>
                <span style={metricSub}>Overall Assessment</span>
              </div>

              {/* Hemisphere */}
              <div style={metricCardStyle}>
                <span style={metricLabel}>Affected Hemisphere</span>
                <span style={{ ...metricValue(), fontSize: '1.05rem' }}>{metrics.hemisphere}</span>
              </div>

              {/* Lesion Volume */}
              <div style={metricCardStyle}>
                <span style={metricLabel}>Est. Lesion Volume</span>
                <span style={metricValue(isStroke ? '#ff9f43' : '#00d4aa')}>{metrics.lesionVolume}</span>
              </div>

              {/* Midline Shift */}
              <div style={metricCardStyle}>
                <span style={metricLabel}>Midline Shift</span>
                <span style={metricValue(parseFloat(metrics.midlineShift) > 2 ? '#ff4d6a' : '#00d4aa')}>{metrics.midlineShift}</span>
              </div>

              {/* Affected Region */}
              <div style={metricCardStyle}>
                <span style={metricLabel}>Affected Region</span>
                <span style={{ ...metricValue(), fontSize: '0.85rem', lineHeight: 1.4 }}>{metrics.region}</span>
              </div>
            </div>
          </motion.div>

          {/* ═══ Vital Signs ═══ */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ marginTop: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FaHeartbeat size={18} style={{ color: '#ff4d6a' }} />
              Vital Signs
              <span style={{ fontSize: '0.7rem', fontWeight: 400, color: 'var(--color-text-muted)', background: 'var(--color-surface-card)', padding: '3px 10px', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>Simulated</span>
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }} className="vitals-grid">
              <div style={metricCardStyle}>
                <span style={metricLabel}>Blood Pressure</span>
                <span style={metricValue('#6c63ff')}>{metrics.bloodPressure}</span>
              </div>
              <div style={metricCardStyle}>
                <span style={metricLabel}>Heart Rate</span>
                <span style={metricValue('#ff9f43')}>{metrics.heartRate}</span>
              </div>
              <div style={metricCardStyle}>
                <span style={metricLabel}>Oxygen Saturation (SpO₂)</span>
                <span style={metricValue('#00d4aa')}>{metrics.oxygenSaturation}</span>
              </div>
            </div>
          </motion.div>

          {/* ═══ Clinical Interpretation ═══ */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} style={{ marginTop: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FaChartBar size={18} style={{ color: 'var(--color-primary-light)' }} />
              Clinical Interpretation
            </h2>
            <div className="glass-card" style={{ padding: '28px 28px', borderLeft: `4px solid ${gaugeColor}` }}>
              <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.8, fontSize: '0.95rem' }}>
                {isStroke
                  ? <>The AI model has detected indicators consistent with <strong style={{ color: '#ff9f43' }}>{metrics.strokeType.toLowerCase()} stroke</strong> in the <strong style={{ color: '#fff' }}>{metrics.hemisphere.toLowerCase()}</strong> hemisphere, specifically within the <strong style={{ color: '#fff' }}>{metrics.region}</strong>. The analysis reports a confidence level of <strong style={{ color: gaugeColor }}>{confidencePercent}%</strong>, an NIHSS score of <strong style={{ color: '#fff' }}>{metrics.nihss}/42</strong>, and an ASPECTS score of <strong style={{ color: '#fff' }}>{metrics.aspects}/10</strong>. Estimated lesion volume is <strong style={{ color: '#fff' }}>{metrics.lesionVolume}</strong> with a midline shift of <strong style={{ color: '#fff' }}>{metrics.midlineShift}</strong>.</>
                  : <>The AI model has analyzed the uploaded brain scan and found <strong style={{ color: '#00d4aa' }}>no significant indicators of stroke</strong>. NIHSS: 0/42, ASPECTS: 10/10. The scan appears to be within normal parameters across both hemispheres with no focal abnormalities detected. Based on the model's assessment with <strong style={{ color: gaugeColor }}>{confidencePercent}%</strong> confidence, the risk level is classified as <strong style={{ color: '#00d4aa' }}>low</strong>.</>
                }
              </p>
            </div>
          </motion.div>

          {/* ═══ Recommendations ═══ */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={{ marginTop: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FaNotesMedical size={18} style={{ color: '#00d4aa' }} />
              Recommendations
            </h2>
            <div className="glass-card" style={{ padding: '28px', borderLeft: `4px solid var(--color-primary)` }}>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {metrics.recommendations.map((rec, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', color: 'var(--color-text-muted)', fontSize: '0.93rem', lineHeight: 1.5 }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: gaugeColor, flexShrink: 0, marginTop: '6px' }} />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* ═══ Risk Assessment Summary ═══ */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} style={{ marginTop: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FaShieldAlt size={18} style={{ color: riskColor(metrics.riskLevel) }} />
              Risk Assessment Summary
            </h2>
            <div className="glass-card" style={{ padding: '28px', borderLeft: `4px solid ${riskColor(metrics.riskLevel)}`, display: 'flex', alignItems: 'center', gap: '24px' }} >
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: `${riskColor(metrics.riskLevel)}15`, border: `2px solid ${riskColor(metrics.riskLevel)}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: riskColor(metrics.riskLevel) }}>{metrics.riskLevel === 'High' ? '!' : metrics.riskLevel === 'Low' ? '✓' : '~'}</span>
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: riskColor(metrics.riskLevel), marginBottom: '6px' }}>{metrics.riskLevel} Risk</div>
                <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6, fontSize: '0.9rem', margin: 0 }}>
                  {metrics.riskLevel === 'High'
                    ? 'Immediate medical attention is strongly advised. The detected indicators warrant urgent neurological evaluation and potential intervention.'
                    : metrics.riskLevel === 'Moderate' || metrics.riskLevel === 'Low-Moderate'
                      ? 'Clinical follow-up is recommended. While not immediately critical, further assessment by a healthcare professional can help rule out or address potential concerns.'
                      : 'No immediate risk detected. The scan appears normal. Maintain regular health check-ups and a healthy lifestyle for ongoing brain health.'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* ═══ Disclaimer ═══ */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} style={{ marginTop: '28px' }}>
            <div style={{ padding: '18px 22px', borderRadius: 'var(--radius-md)', background: 'rgba(255, 184, 77, 0.08)', border: '1px solid rgba(255, 184, 77, 0.15)', textAlign: 'center' }}>
              <p style={{ color: 'var(--color-warning)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                ⚠️ <strong>Disclaimer:</strong> This AI prediction and all clinical metrics shown are for educational and research purposes only. The vital signs and clinical scores are <strong>simulated values</strong> derived from the model's confidence level. This report should not be used as a substitute for professional medical diagnosis. Always consult a qualified healthcare provider.
              </p>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '32px', flexWrap: 'wrap' }}>
            <button className="btn-primary" id="download-pdf" onClick={generatePDF} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'linear-gradient(135deg, #ff4d6a, #6c63ff)' }}>
              <FaFilePdf size={16} /> Download PDF Report
            </button>
            <Link to="/model"><button className="btn-primary">Analyze Another Scan</button></Link>
            <Link to="/"><button className="btn-outline">Go to Home</button></Link>
          </motion.div>
        </div>
      </section>

      {/* Responsive */}
      <style>{`
        .report-grid { grid-template-columns: 1fr 1fr; }
        .metrics-grid { grid-template-columns: repeat(4, 1fr); }
        .vitals-grid { grid-template-columns: repeat(3, 1fr); }
        @media (max-width: 768px) {
          .report-grid { grid-template-columns: 1fr !important; text-align: center; }
          .metrics-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .vitals-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .metrics-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </PageTransition>
  );
};

export default ReportPage;
