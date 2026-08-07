const PDFDocument = require('pdfkit');
const path = require('path');

/**
 * Generates the employee "Salary Slip" PDF. Deliberately designed to look
 * NOTHING like the customer Tax Invoice (utils/pdfGenerator.js) — different
 * accent color, a solid banner header instead of colored text, boxed
 * info panels, a classic two-column Earnings/Deductions payslip layout
 * instead of a single GST items table, and a clear "internal use only /
 * not a GST invoice" footer — so nobody can mistake one document for the
 * other at a glance.
 *
 * @param {Object} data
 * @param {Object} data.settings - company settings (settings.logoBuffer if uploaded)
 * @param {Object} data.payment - employee payment document (populated employee)
 * @param {Writable} res - response or writable stream to pipe the PDF into
 */
function generateEmployeePaymentPDF({ settings, payment }, res) {
  const doc = new PDFDocument({ size: 'A4', margin: 0 });

  const fontDir = path.join(__dirname, '..', 'assets', 'fonts');
  doc.registerFont('Regular', path.join(fontDir, 'DejaVuSans.ttf'));
  doc.registerFont('Bold', path.join(fontDir, 'DejaVuSans-Bold.ttf'));

  doc.pipe(res);

  const pageW = doc.page.width;
  const left = 32;
  const right = pageW - 32;
  const pageWidth = right - left;

  // Teal/slate palette — intentionally not the invoice's blue, so the two
  // documents are visually distinct even in a quick glance or a stack of printouts.
  const teal = '#0d6e5c';
  const tealLight = '#e6f3f0';
  const dark = '#1a1a1a';
  const gray = '#5a5a5a';
  const lineGray = '#dcdcdc';
  const red = '#b3261e';

  // ---------- SOLID BANNER HEADER ----------
  doc.rect(0, 0, pageW, 74).fill(teal);

  if (settings.logoBuffer) {
    try { doc.image(settings.logoBuffer, left, 12, { fit: [50, 50] }); } catch (e) { /* ignore */ }
  }
  const titleX = settings.logoBuffer ? left + 62 : left;
  doc.fillColor('#ffffff').font('Bold').fontSize(18).text(settings.companyName || 'CRAZYGROWMIND STUDIO', titleX, 18);
  doc.font('Regular').fontSize(9).fillColor('#d7ede8').text('SALARY SLIP', titleX, 40);

  doc.font('Bold').fontSize(8).fillColor('#ffffff')
    .text('CONFIDENTIAL — INTERNAL USE ONLY', left, 20, { width: pageWidth, align: 'right' });
  doc.font('Regular').fontSize(7.5).fillColor('#d7ede8')
    .text('This is not a GST invoice', left, 33, { width: pageWidth, align: 'right' });

  let y = 92;

  // ---------- INFO PANELS: Employee (left) + Payslip meta (right) ----------
  const panelGap = 14;
  const panelW = (pageWidth - panelGap) / 2;
  const empPanelX = left;
  const metaPanelX = left + panelW + panelGap;
  const panelH = 106;

  doc.roundedRect(empPanelX, y, panelW, panelH, 5).lineWidth(1).strokeColor(lineGray).stroke();
  doc.roundedRect(metaPanelX, y, panelW, panelH, 5).lineWidth(1).strokeColor(lineGray).stroke();

  doc.rect(empPanelX, y, panelW, 20).fill(tealLight);
  doc.rect(metaPanelX, y, panelW, 20).fill(tealLight);
  doc.fillColor(teal).font('Bold').fontSize(8.5).text('EMPLOYEE', empPanelX + 10, y + 6);
  doc.fillColor(teal).font('Bold').fontSize(8.5).text('PAYSLIP DETAILS', metaPanelX + 10, y + 6);

  doc.fillColor(dark).font('Bold').fontSize(11).text(payment.employeeSnapshot?.name || 'Employee', empPanelX + 10, y + 28);
  doc.font('Regular').fontSize(8.5).fillColor(gray);
  doc.text(payment.employeeSnapshot?.designation || '', empPanelX + 10, y + 46);
  doc.text(payment.employeeSnapshot?.phone || '', empPanelX + 10, y + 60);
  if (payment.employeeSnapshot?.email) doc.text(payment.employeeSnapshot.email, empPanelX + 10, y + 74);

  writeMetaRow(doc, 'Payslip #', payment.payslipNumber, metaPanelX + 10, y + 26, panelW - 20, dark);
  writeMetaRow(doc, 'Pay Period', payment.period || '', metaPanelX + 10, y + 47, panelW - 20, dark);
  writeMetaRow(doc, 'Payment Date', formatDate(payment.paymentDate), metaPanelX + 10, y + 68, panelW - 20, dark);
  writeMetaRow(doc, 'Payment Mode', payment.paymentMode || '', metaPanelX + 10, y + 89, panelW - 20, dark);

  y += panelH + 22;

  // ---------- EARNINGS / DEDUCTIONS — classic two-column payslip table ----------
  const earnings = payment.items.filter((it) => it.amount >= 0);
  const deductions = payment.items.filter((it) => it.amount < 0);
  const totalEarnings = +earnings.reduce((s, i) => s + i.amount, 0).toFixed(2);
  const totalDeductions = +deductions.reduce((s, i) => s + Math.abs(i.amount), 0).toFixed(2);

  const colGap = 14;
  const colW = (pageWidth - colGap) / 2;
  const earnX = left;
  const dedX = left + colW + colGap;
  const rowH = 18;
  const tableTop = y;
  const tableRows = Math.max(earnings.length, deductions.length, 1);
  const tableH = 20 + tableRows * rowH + 20;

  doc.roundedRect(earnX, tableTop, colW, tableH, 5).lineWidth(1).strokeColor(lineGray).stroke();
  doc.roundedRect(dedX, tableTop, colW, tableH, 5).lineWidth(1).strokeColor(lineGray).stroke();

  doc.rect(earnX, tableTop, colW, 20).fill(teal);
  doc.rect(dedX, tableTop, colW, 20).fill(red);
  doc.fillColor('#ffffff').font('Bold').fontSize(9).text('EARNINGS', earnX + 10, tableTop + 6);
  doc.fillColor('#ffffff').font('Bold').fontSize(9).text('DEDUCTIONS', dedX + 10, tableTop + 6);

  let ey = tableTop + 26;
  if (earnings.length === 0) {
    doc.font('Regular').fontSize(8.5).fillColor(gray).text('—', earnX + 10, ey);
  }
  earnings.forEach((it) => {
    doc.font('Regular').fontSize(8.5).fillColor(dark).text(it.description, earnX + 10, ey, { width: colW - 90 });
    doc.font('Bold').fontSize(8.5).text(formatMoney(it.amount), earnX + colW - 90, ey, { width: 80, align: 'right' });
    ey += rowH;
  });

  let dy = tableTop + 26;
  if (deductions.length === 0) {
    doc.font('Regular').fontSize(8.5).fillColor(gray).text('—', dedX + 10, dy);
  }
  deductions.forEach((it) => {
    doc.font('Regular').fontSize(8.5).fillColor(dark).text(it.description, dedX + 10, dy, { width: colW - 90 });
    doc.font('Bold').fontSize(8.5).fillColor(red).text(formatMoney(Math.abs(it.amount)), dedX + colW - 90, dy, { width: 80, align: 'right' });
    dy += rowH;
  });

  const totalsY = tableTop + tableH - 18;
  doc.moveTo(earnX + 10, totalsY - 4).lineTo(earnX + colW - 10, totalsY - 4).strokeColor(lineGray).stroke();
  doc.moveTo(dedX + 10, totalsY - 4).lineTo(dedX + colW - 10, totalsY - 4).strokeColor(lineGray).stroke();
  doc.font('Bold').fontSize(8.5).fillColor(teal).text('Total Earnings', earnX + 10, totalsY, { width: colW - 90 });
  doc.text(formatMoney(totalEarnings), earnX + colW - 90, totalsY, { width: 80, align: 'right' });
  doc.font('Bold').fontSize(8.5).fillColor(red).text('Total Deductions', dedX + 10, totalsY, { width: colW - 90 });
  doc.text(formatMoney(totalDeductions), dedX + colW - 90, totalsY, { width: 80, align: 'right' });

  y = tableTop + tableH + 20;

  // ---------- NET PAY — large highlighted panel ----------
  doc.roundedRect(left, y, pageWidth, 46, 6).fill(tealLight);
  doc.font('Bold').fontSize(12).fillColor(teal).text('NET PAY', left + 16, y + 15);
  doc.font('Bold').fontSize(18).fillColor(teal).text(formatCurrency(payment.netAmount), left, y + 12, { width: pageWidth - 16, align: 'right' });
  y += 46 + 8;
  doc.font('Regular').fontSize(8).fillColor(gray).text(`Amount in words: ${payment.amountInWords}`, left, y);
  y += 22;

  if (payment.referenceNo) {
    doc.font('Bold').fontSize(8.5).fillColor(dark).text('Reference No: ', left, y, { continued: true }).font('Regular').text(payment.referenceNo);
    y += 16;
  }

  if (payment.notes && payment.notes.trim()) {
    doc.font('Bold').fontSize(9).fillColor(dark).text('Notes:', left, y);
    y += 13;
    doc.font('Regular').fontSize(8.5).fillColor(gray).text(payment.notes, left, y, { width: pageWidth });
    y += doc.heightOfString(payment.notes, { width: pageWidth }) + 14;
  } else {
    y += 6;
  }

  // ---------- BANK DETAILS + SIGNATURES ----------
  const bottomSectionTop = Math.max(y, doc.page.height - 175);

  doc.font('Bold').fontSize(9).fillColor(dark).text("Bank Transfer Details:", left, bottomSectionTop);
  const bank = payment.employeeSnapshot?.bankDetails || {};
  let by = bottomSectionTop + 15;
  const bankRows = [
    ['Bank', bank.bankName],
    ['Account Holder', bank.accountHolder],
    ['Account #', bank.accountNumber],
    ['IFSC Code', bank.ifscCode],
  ];
  bankRows.forEach(([label, val]) => {
    doc.font('Regular').fontSize(8.5).fillColor(gray).text(label, left, by, { width: 110 });
    doc.font('Bold').fontSize(8.5).fillColor(dark).text(val || '-', left + 110, by, { width: 200 });
    by += 14;
  });

  const sigW = 190;
  const sigX1 = right - (sigW * 2 + 20);
  const sigX2 = right - sigW;
  const sigLineY = bottomSectionTop + 70;

  doc.moveTo(sigX1 + 15, sigLineY).lineTo(sigX1 + sigW - 15, sigLineY).strokeColor(dark).stroke();
  doc.font('Regular').fontSize(8.5).fillColor(dark).text('Employee Signature', sigX1, sigLineY + 5, { width: sigW, align: 'center' });

  doc.moveTo(sigX2 + 15, sigLineY).lineTo(sigX2 + sigW - 15, sigLineY).strokeColor(dark).stroke();
  doc.font('Regular').fontSize(8.5).fillColor(dark).text('Authorized Signatory', sigX2, sigLineY + 5, { width: sigW, align: 'center' });
  doc.font('Regular').fontSize(7.5).fillColor(gray).text(`For ${settings.companyName || 'CRAZYGROWMIND STUDIO'}`, sigX2, sigLineY + 18, { width: sigW, align: 'center' });

  // ---------- FOOTER ----------
  const footerY = doc.page.height - 30;
  doc.moveTo(left, footerY - 8).lineTo(right, footerY - 8).strokeColor(lineGray).stroke();
  doc.font('Regular').fontSize(7).fillColor(gray).text(
    'This is a system-generated salary slip issued to the named employee only. It is an internal payroll record, not a GST invoice or tax document.',
    left, footerY, { width: pageWidth, align: 'center' }
  );

  doc.end();
}

function writeMetaRow(doc, label, value, x, y, w, valueColor) {
  doc.font('Regular').fontSize(7.5).fillColor('#8a8a8a').text(label.toUpperCase(), x, y, { width: w });
  doc.font('Bold').fontSize(9).fillColor(valueColor).text(String(value || '-'), x, y + 9, { width: w });
}

function formatDate(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function formatMoney(num) {
  return Number(num || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatCurrency(num) {
  return `₹${formatMoney(num)}`;
}

module.exports = generateEmployeePaymentPDF;
