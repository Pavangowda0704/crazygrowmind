const PDFDocument = require('pdfkit');
const path = require('path');
const QRCode = require('qrcode');

/**
 * Generates the black/gold "Booking & Payment Coupon" PDF — a landscape
 * A4 page split into the main coupon (left) and a tear-off "Client Copy"
 * (right) with a QR code that links to a public verify page.
 *
 * Requires the `qrcode` package: run `npm install qrcode` in backend/.
 *
 * @param {Object} data
 * @param {Object} data.settings - company settings (with settings.logoBuffer if a logo is uploaded)
 * @param {Object} data.booking - booking document
 * @param {Writable} res - response/writable stream to pipe the PDF into
 */
async function generateBookingPDF({ settings, booking }, res) {
  const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 0 });

  const fontDir = path.join(__dirname, '..', 'assets', 'fonts');
  doc.registerFont('Regular', path.join(fontDir, 'DejaVuSans.ttf'));
  doc.registerFont('Bold', path.join(fontDir, 'DejaVuSans-Bold.ttf'));

  doc.pipe(res);

  const pageW = doc.page.width;
  const pageH = doc.page.height;

  const gold = '#D4AF37';
  const black = '#0d0d0d';
  const white = '#ffffff';
  const gray = '#a8a8a8';
  const green = '#1b7a3d';
  const amber = '#a06a00';
  const red = '#8a1f1f';

  // Full black page background
  doc.rect(0, 0, pageW, pageH).fill(black);

  const mainRight = pageW * 0.72;
  const copyX = mainRight + 18;
  const copyW = pageW - copyX - 20;

  const websiteUrl = (settings.websiteUrl || 'https://crazygrowmindstudio.com').replace(/\/$/, '');
  const verifyUrl = `${websiteUrl}/verify/${booking.couponId}`;
  const qrBuffer = await QRCode.toBuffer(verifyUrl, {
    margin: 1,
    width: 300,
    color: { dark: '#000000', light: '#ffffff' },
  });

  const statusColor = booking.paymentStatus === 'Fully Paid' ? green
    : booking.paymentStatus === 'Partially Paid' ? amber : red;

  // ================= LEFT: MAIN COUPON =================
  const left = 24;
  let y = 22;

  if (settings.logoBuffer) {
    try { doc.image(settings.logoBuffer, left, y, { fit: [66, 66] }); } catch (e) { /* ignore broken logo */ }
  }

  doc.fillColor(white).font('Bold').fontSize(21).text('CRAZYGROWMIND', left + 76, y + 2, { continued: true });
  doc.fillColor(gold).text(' STUDIO');
  doc.fillColor(gold).font('Regular').fontSize(8.5).text('WE CREATE. WE PROMOTE. YOU GROW.', left + 76, y + 28);
  doc.fillColor(gray).font('Regular').fontSize(7.5)
    .text('CREATIVE  •  MARKETING  •  PRODUCTION  •  INFLUENCER MARKETING', left + 76, y + 41);

  // Coupon ID / booking date box
  const boxW = 190;
  const boxX = mainRight - boxW - 12;
  doc.roundedRect(boxX, y - 2, boxW, 60, 4).lineWidth(1).strokeColor(gold).stroke();
  doc.fillColor(gold).font('Regular').fontSize(7).text('COUPON ID', boxX, y + 6, { width: boxW, align: 'center' });
  doc.fillColor(white).font('Bold').fontSize(10.5).text(booking.couponId, boxX, y + 17, { width: boxW, align: 'center' });
  doc.fillColor(gold).font('Regular').fontSize(7).text('BOOKING DATE', boxX, y + 35, { width: boxW, align: 'center' });
  doc.fillColor(white).font('Bold').fontSize(9.5).text(formatDate(booking.bookingDate), boxX, y + 45, { width: boxW, align: 'center' });

  y += 76;

  // Banner
  doc.roundedRect(left, y, mainRight - left - 12, 28, 6).fill(gold);
  doc.fillColor(black).font('Bold').fontSize(14)
    .text('★  BOOKING & PAYMENT COUPON  ★', left, y + 8, { width: mainRight - left - 12, align: 'center' });
  y += 42;

  // Two-column detail grid
  const rowH = 33;
  const gridW = mainRight - left - 12;
  const colGap = 14;
  const colW = (gridW - colGap) / 2;
  const col1X = left;
  const col2X = left + colW + colGap;

  const rows = [
    [['CLIENT NAME', booking.clientName], ['SERVICE / SHOOT TYPE', booking.serviceType]],
    [['MOBILE', booking.mobile], ['SHOOT DATE', formatDate(booking.shootDate)]],
    [['BOOKING AMOUNT', formatCurrency(booking.bookingAmount)], ['SHOOT LOCATION', booking.shootLocation || '-']],
    [['AMOUNT PAID', formatCurrency(booking.amountPaid)], ['BALANCE AMOUNT', formatCurrency(booking.balanceAmount)]],
  ];

  doc.roundedRect(left, y, gridW, rowH * rows.length, 6).lineWidth(1).strokeColor('#3a3a3a').stroke();
  rows.forEach(([a, b], idx) => {
    const ry = y + idx * rowH + 6;
    writeField(doc, a[0], String(a[1]), col1X + 12, ry, colW - 16, gold, white);
    writeField(doc, b[0], String(b[1]), col2X, ry, colW - 12, gold, white);
    if (idx < rows.length - 1) {
      doc.moveTo(left, y + (idx + 1) * rowH).lineTo(left + gridW, y + (idx + 1) * rowH).strokeColor('#242424').stroke();
    }
  });
  y += rowH * rows.length + 14;

  // Payment status / mode / reference
  const statusW = 158;
  doc.roundedRect(left, y, statusW, 44, 6).lineWidth(1).strokeColor(statusColor).stroke();
  doc.fillColor(gold).font('Regular').fontSize(7).text('PAYMENT STATUS', left + 10, y + 7);
  doc.fillColor(white).font('Bold').fontSize(12.5).text(booking.paymentStatus.toUpperCase(), left + 10, y + 20);

  const modeX = left + statusW + 12;
  const modeW = (left + gridW - modeX - 12) / 2;
  doc.roundedRect(modeX, y, modeW, 44, 6).lineWidth(1).strokeColor('#3a3a3a').stroke();
  writeField(doc, 'PAYMENT MODE', booking.paymentMode, modeX + 10, y + 10, modeW - 16, gold, white);

  const refX = modeX + modeW + 12;
  const refW = left + gridW - refX;
  doc.roundedRect(refX, y, refW, 44, 6).lineWidth(1).strokeColor('#3a3a3a').stroke();
  writeField(doc, 'TRANSACTION / REF NO.', booking.transactionRef || '-', refX + 10, y + 10, refW - 16, gold, white);

  y += 58;

  // Confirmation note + authorized signatory
  const sigBoxW = 190;
  const confirmW = gridW - sigBoxW - 14;
  doc.roundedRect(left, y, confirmW, 62, 6).lineWidth(1).strokeColor('#3a3a3a').stroke();
  doc.fillColor(gray).font('Regular').fontSize(7.8).text(
    `This coupon confirms the booking and payment received by ${settings.companyName || 'CRAZYGROWMIND STUDIO'}. Please retain this coupon for future reference.`,
    left + 12, y + 12, { width: confirmW - 24 }
  );

  const sigX = left + confirmW + 14;
  if (settings.signatureBuffer) {
    try { doc.image(settings.signatureBuffer, sigX + 30, y - 6, { fit: [130, 44] }); } catch (e) { /* ignore */ }
  } else {
    doc.fillColor(white).font('Bold').fontSize(13).text(booking.authorizedBy || 'Authorized', sigX, y + 6, { width: sigBoxW, align: 'center' });
  }
  doc.moveTo(sigX + 20, y + 38).lineTo(sigX + sigBoxW - 20, y + 38).strokeColor(gold).stroke();
  doc.fillColor(gray).font('Regular').fontSize(7).text('AUTHORIZED BY', sigX, y + 43, { width: sigBoxW, align: 'center' });
  doc.fillColor(gold).font('Bold').fontSize(8).text((settings.companyName || 'CRAZYGROWMIND STUDIO').toUpperCase(), sigX, y + 53, { width: sigBoxW, align: 'center' });

  // Footer contact bar (pinned to bottom of main coupon area)
  const footerY = pageH - 42;
  doc.roundedRect(left, footerY, gridW, 24, 5).fill(gold);
  const contactLine = [settings.mobile, settings.email, settings.websiteUrl]
    .filter(Boolean).join('     ');
  doc.fillColor(black).font('Regular').fontSize(8.5)
    .text(contactLine, left, footerY + 7, { width: gridW, align: 'center' });

  // Dashed divider + scissors mark between the two halves
  doc.save();
  doc.dash(4, { space: 4 }).lineWidth(1).strokeColor('#555')
    .moveTo(mainRight, 8).lineTo(mainRight, pageH - 8).stroke();
  doc.undash();
  doc.restore();

  // ================= RIGHT: CLIENT COPY =================
  let ry = 18;
  doc.roundedRect(copyX, ry, copyW, 22, 4).fill(gold);
  doc.fillColor(black).font('Bold').fontSize(9).text('★  CLIENT COPY  ★', copyX, ry + 6, { width: copyW, align: 'center' });
  ry += 34;

  if (settings.logoBuffer) {
    try { doc.image(settings.logoBuffer, copyX + copyW / 2 - 24, ry, { fit: [48, 48] }); } catch (e) { /* ignore */ }
  }
  ry += 54;
  doc.fillColor(white).font('Bold').fontSize(10.5).text('CRAZYGROWMIND', copyX, ry, { width: copyW, align: 'center' });
  doc.fillColor(gold).fontSize(10.5).text('STUDIO', copyX, ry + 12, { width: copyW, align: 'center' });
  ry += 32;

  doc.roundedRect(copyX, ry, copyW, 32, 5).lineWidth(1).strokeColor(statusColor).stroke();
  doc.fillColor(gold).font('Regular').fontSize(6.5).text('STATUS', copyX, ry + 5, { width: copyW, align: 'center' });
  doc.fillColor(white).font('Bold').fontSize(10.5).text(booking.paymentStatus.toUpperCase(), copyX, ry + 15, { width: copyW, align: 'center' });
  ry += 44;

  doc.fillColor(gold).font('Regular').fontSize(6.8).text('SCAN TO VERIFY YOUR BOOKING', copyX, ry, { width: copyW, align: 'center' });
  ry += 12;
  const qrSize = Math.min(copyW - 20, 108);
  doc.image(qrBuffer, copyX + (copyW - qrSize) / 2, ry, { fit: [qrSize, qrSize] });
  ry += qrSize + 8;
  doc.fillColor(gray).font('Regular').fontSize(6.3)
    .text(`Scan or visit ${websiteUrl.replace(/^https?:\/\//, '')}/verify`, copyX, ry, { width: copyW, align: 'center' });
  ry += 22;

  const details = [
    ['COUPON ID', booking.couponId],
    ['CLIENT NAME', booking.clientName],
    ['SHOOT DATE', formatDate(booking.shootDate)],
    ['SERVICE', booking.serviceType],
    ['TOTAL AMOUNT', formatCurrency(booking.bookingAmount)],
  ];
  doc.font('Regular').fontSize(7);
  details.forEach(([label, val]) => {
    doc.fillColor(gold).text(`${label}`, copyX, ry, { continued: true, width: copyW });
    doc.fillColor(white).text(` : ${val}`);
    ry += 12;
  });

  ry += 8;
  doc.fillColor(gold).font('Bold').fontSize(9).text('Thank You!', copyX, ry, { width: copyW, align: 'center' });
  ry += 12;
  doc.fillColor(gray).font('Regular').fontSize(6.3)
    .text('We look forward to creating amazing work together.', copyX, ry, { width: copyW, align: 'center' });

  doc.end();
}

function writeField(doc, label, value, x, y, w, labelColor, valueColor) {
  doc.fillColor(labelColor).font('Regular').fontSize(6.8).text(label, x, y, { width: w });
  doc.fillColor(valueColor).font('Bold').fontSize(10.5).text(value, x, y + 10, { width: w });
}

function formatDate(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function formatMoney(num) {
  return Number(num || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function formatCurrency(num) {
  return `₹ ${formatMoney(num)}`;
}

module.exports = generateBookingPDF;
