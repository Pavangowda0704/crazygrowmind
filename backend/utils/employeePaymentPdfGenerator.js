const PDFDocument = require('pdfkit');
const path = require('path');

/**
 * Generates the "Employee Payment Invoice" (payslip) PDF — same visual
 * language as the customer Tax Invoice (utils/pdfGenerator.js) so the two
 * feel like one product, but headed "EMPLOYEE PAYMENT INVOICE", billed to
 * the employee instead of a customer, and with no GST/TDS line items.
 *
 * @param {Object} data
 * @param {Object} data.settings - company settings (settings.logoBuffer / settings.signatureBuffer if uploaded)
 * @param {Object} data.payment - employee payment document (populated employee)
 * @param {Writable} res - response or writable stream to pipe the PDF into
 */
function generateEmployeePaymentPDF({ settings, payment }, res) {
  const doc = new PDFDocument({ size: 'A4', margin: 28 });

  const fontDir = path.join(__dirname, '..', 'assets', 'fonts');
  doc.registerFont('Regular', path.join(fontDir, 'DejaVuSans.ttf'));
  doc.registerFont('Bold', path.join(fontDir, 'DejaVuSans-Bold.ttf'));

  doc.pipe(res);

  const left = 28;
  const right = doc.page.width - 28;
  const pageWidth = right - left;

  const blue = '#1a56db';
  const dark = '#1a1a1a';
  const gray = '#555555';
  const lightGray = '#f2f2f2';
  const lineGray = '#dddddd';

  // ---------- HEADER ----------
  doc.fillColor(blue).font('Bold').fontSize(13).text('E M P L O Y E E   P A Y M E N T   I N V O I C E', left, 40);
  doc.fillColor(dark).font('Bold').fontSize(9)
    .text('INTERNAL USE ONLY', left, 40, { width: pageWidth, align: 'right' });

  let y = 63;
  doc.fillColor(dark).font('Bold').fontSize(15).text(settings.companyName || 'CRAZYGROWMIND STUDIO', left, y);

  y += 20;
  doc.font('Regular').fontSize(9).fillColor(gray);
  const addressLines = [
    settings.addressLine1,
    settings.addressLine2,
    [settings.city, settings.state, settings.pincode].filter(Boolean).join(', '),
  ].filter(Boolean);
  addressLines.forEach((line) => {
    doc.text(line, left, y);
    y += 12;
  });

  doc.font('Bold').fontSize(9).fillColor(dark)
    .text(`Mobile `, left, y, { continued: true })
    .font('Regular').text(`${settings.mobile || ''}   `, { continued: true })
    .font('Bold').text(`Email `, { continued: true })
    .font('Regular').text(settings.email || '');

  if (settings.logoBuffer) {
    try {
      const logoWidth = 150;
      const logoHeight = 95;
      doc.image(settings.logoBuffer, right - logoWidth, 28, { fit: [logoWidth, logoHeight], align: 'right', valign: 'top' });
    } catch (e) { /* ignore broken logo */ }
  }

  y += 18;
  doc.moveTo(left, y).lineTo(right, y).strokeColor(lineGray).stroke();
  y += 14;

  // ---------- PAYSLIP META ----------
  doc.font('Bold').fontSize(9).fillColor(dark);
  doc.text('Payslip #: ', left, y, { continued: true }).font('Bold').text(payment.payslipNumber);
  doc.font('Bold').text('Period: ', left + 178, y, { continued: true }).font('Regular').text(payment.period || '');
  doc.font('Bold').text('Payment Date: ', left + 358, y, { continued: true })
    .font('Regular').text(formatDate(payment.paymentDate));

  y += 22;
  doc.font('Bold').fontSize(9).text('Employee Details:', left, y);
  y += 13;
  doc.font('Bold').fontSize(10).text(payment.employeeSnapshot?.name || 'Employee', left, y);
  y += 13;
  doc.font('Regular').fontSize(9).fillColor(gray)
    .text([payment.employeeSnapshot?.designation, payment.employeeSnapshot?.phone].filter(Boolean).join('  •  '), left, y);

  y += 24;

  // ---------- ITEMS TABLE ----------
  const col = {
    no: { x: left, w: 26 },
    desc: { x: left + 30, w: 380 },
    amount: { x: right - 130, w: 130 },
  };

  doc.rect(left, y, pageWidth, 18).fill(lightGray);
  doc.fillColor(dark).font('Bold').fontSize(8);
  doc.text('#', col.no.x + 3, y + 5);
  doc.text('Description', col.desc.x, y + 5);
  doc.text('Amount', col.amount.x, y + 5, { width: col.amount.w, align: 'right' });

  y += 18;
  doc.moveTo(left, y).lineTo(right, y).strokeColor(blue).lineWidth(1.2).stroke();
  doc.lineWidth(1);

  payment.items.forEach((it, idx) => {
    const rowY = y + 6;
    doc.font('Regular').fillColor(dark).text(String(idx + 1), col.no.x + 3, rowY);
    doc.font('Regular').text(it.description, col.desc.x, rowY, { width: col.desc.w });
    doc.text(formatCurrency(it.amount), col.amount.x, rowY, { width: col.amount.w, align: 'right' });
    y += 22;
    doc.moveTo(left, y - 2).lineTo(right, y - 2).strokeColor('#eeeeee').stroke();
  });

  y += 10;

  // ---------- NET AMOUNT ----------
  const labelBox = { x: 300, w: 150 };
  const valueBox = { x: 460, w: right - 460 };

  doc.font('Bold').fontSize(12);
  writeTotalRow(doc, 'Net Amount Paid', formatCurrency(payment.netAmount), labelBox, valueBox, y);
  y += 24;

  doc.font('Regular').fontSize(8).fillColor(gray)
    .text(`Amount (in words): ${payment.amountInWords}`, left, y, { width: labelBox.x - left - 10 });
  y += 20;

  doc.fillColor(dark).font('Bold').fontSize(9);
  doc.text('Payment Mode: ', left, y, { continued: true }).font('Regular').text(payment.paymentMode || '');
  if (payment.referenceNo) {
    doc.font('Bold').text('   Reference No: ', { continued: true }).font('Regular').text(payment.referenceNo);
  }
  y += 26;

  // ---------- NOTES ----------
  if (payment.notes && payment.notes.trim()) {
    doc.font('Bold').fontSize(9).fillColor(dark).text('Notes:', left, y);
    y += 13;
    doc.font('Regular').fontSize(8.5).fillColor(gray).text(payment.notes, left, y, { width: pageWidth });
    y += doc.heightOfString(payment.notes, { width: pageWidth }) + 16;
  } else {
    y += 8;
  }

  // ---------- BANK DETAILS (employee's, for salary transfer reference) + SIGNATURE ----------
  const bankSectionTop = Math.max(y, doc.page.height - 190);

  doc.font('Bold').fontSize(9).fillColor(dark).text("Employee's Bank Details:", left, bankSectionTop);
  const bank = payment.employeeSnapshot?.bankDetails || {};
  let by = bankSectionTop + 15;
  const bankLabelX = left;
  const bankValueX = left + 116;
  const bankRows = [
    ['Bank:', bank.bankName],
    ['Account Holder:', bank.accountHolder],
    ['Account #:', bank.accountNumber],
    ['IFSC Code:', bank.ifscCode],
  ];
  bankRows.forEach(([label, val]) => {
    doc.font('Regular').fontSize(8.5).fillColor(gray).text(label, bankLabelX, by, { width: 112 });
    doc.font('Bold').fontSize(8.5).fillColor(dark).text(val || '-', bankValueX, by, { width: right - bankValueX });
    by += 14;
  });

  const sigBoxWidth = 200;
  const sigBoxX = right - sigBoxWidth;

  doc.font('Regular').fontSize(9).fillColor(dark)
    .text(`For ${settings.companyName || 'CRAZYGROWMIND STUDIO'}`, sigBoxX, bankSectionTop, { width: sigBoxWidth, align: 'right' });

  if (settings.signatureBuffer) {
    try {
      doc.image(settings.signatureBuffer, right - 180, bankSectionTop + 14, { fit: [180, 85], align: 'right' });
    } catch (e) { /* ignore broken signature */ }
  }

  doc.font('Regular').fontSize(9)
    .text('Authorized Signatory', sigBoxX, bankSectionTop + 104, { width: sigBoxWidth, align: 'right' });

  doc.end();
}

function writeTotalRow(doc, label, value, labelBox, valueBox, y) {
  doc.font('Bold').text(label, labelBox.x, y, { width: labelBox.w, align: 'right' });
  doc.text(value, valueBox.x, y, { width: valueBox.w, align: 'right' });
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
