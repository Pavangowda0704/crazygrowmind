const PDFDocument = require('pdfkit');
const path = require('path');

/**
 * Generates the Tax Invoice PDF matching the CrazyGrowMind Studio
 * invoice layout (header / company block / invoice meta / customer /
 * items table / totals / amount in words / bank details / signature).
 *
 * Fonts: uses bundled DejaVu Sans (regular + bold) instead of PDFKit's
 * built-in Helvetica, because Helvetica's standard encoding has no glyph
 * for the Indian Rupee sign (₹) and silently drops it. DejaVu Sans is
 * free/open (Bitstream Vera license) and safe to bundle and redistribute.
 *
 * Logo + signature: pass pre-fetched Buffers on `settings.logoBuffer` and
 * `settings.signatureBuffer` (see invoiceController) — PDFKit's doc.image()
 * needs raw bytes, it cannot fetch a remote Cloudinary URL itself.
 *
 * @param {Object} data
 * @param {Object} data.settings - company/bank settings document
 * @param {Object} data.invoice - invoice document (populated customer)
 * @param {Writable} res - response or writable stream to pipe the PDF into
 */
function generateInvoicePDF({ settings, invoice }, res) {
  const doc = new PDFDocument({ size: 'A4', margin: 28 });

  const fontDir = path.join(__dirname, '..', 'assets', 'fonts');
  doc.registerFont('Regular', path.join(fontDir, 'DejaVuSans.ttf'));
  doc.registerFont('Bold', path.join(fontDir, 'DejaVuSans-Bold.ttf'));

  doc.pipe(res);

  const left = 28;
  const right = doc.page.width - 28; // 567.28 on A4
  const pageWidth = right - left;

  const blue = '#1a56db';
  const dark = '#1a1a1a';
  const gray = '#555555';
  const lightGray = '#f2f2f2';
  const lineGray = '#dddddd';

  // ---------- HEADER ----------
  doc.fillColor(blue).font('Bold').fontSize(13).text('T A X   I N V O I C E', left, 40);
  doc.fillColor(dark).font('Bold').fontSize(9)
    .text('ORIGINAL FOR RECIPIENT', left, 40, { width: pageWidth, align: 'right' });

  let y = 63;
  doc.fillColor(dark).font('Bold').fontSize(15).text(settings.companyName || 'CRAZYGROWMIND STUDIO', left, y);

  y += 20;
  doc.font('Bold').fontSize(9).fillColor(dark).text(`GSTIN ${settings.gstin || ''}`, left, y);

  y += 13;
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

  // Logo (top right) if a pre-fetched buffer is available on settings.
  // Sized to match the reference template — a larger box than before so
  // the logo reads clearly next to the company name block.
  if (settings.logoBuffer) {
    try {
      const logoWidth = 150;
      const logoHeight = 95;
      doc.image(settings.logoBuffer, right - logoWidth, 28, {
        fit: [logoWidth, logoHeight],
        align: 'right',
        valign: 'top',
      });
    } catch (e) {
      // ignore broken/corrupt image so the rest of the PDF still renders
    }
  }

  y += 18;
  doc.moveTo(left, y).lineTo(right, y).strokeColor(lineGray).stroke();
  y += 14;

  // ---------- INVOICE META ----------
  doc.font('Bold').fontSize(9).fillColor(dark);
  doc.text('Invoice #: ', left, y, { continued: true }).font('Bold').text(invoice.invoiceNumber);
  doc.font('Bold').text('Invoice Date: ', left + 178, y, { continued: true })
    .font('Bold').text(formatDate(invoice.invoiceDate));
  doc.font('Bold').text('Due Date: ', left + 358, y, { continued: true })
    .font('Regular').text(formatDate(invoice.dueDate));

  y += 22;
  doc.font('Bold').fontSize(9).text('Customer Details:', left, y);
  y += 13;
  doc.font('Bold').fontSize(10).text(invoice.customerSnapshot?.name || 'Customer', left, y);

  y += 19;
  doc.font('Bold').fontSize(9).text('Place of Supply:', left, y);
  y += 13;
  doc.font('Bold').fontSize(9).text(invoice.placeOfSupply || '', left, y);

  y += 20;

  // ---------- ITEMS TABLE ----------
  // Column right edges measured directly from the reference template so
  // nothing runs past the page's right margin.
  const col = {
    no: { x: left, w: 22 },
    item: { x: left + 24, w: 172 },
    rate: { x: 200, w: 88 },
    qty: { x: 296, w: 60 },
    taxable: { x: 362, w: 63 },
    tax: { x: 428, w: 72 },
    amount: { x: 503, w: right - 503 },
  };

  doc.rect(left, y, pageWidth, 18).fill(lightGray);
  doc.fillColor(dark).font('Bold').fontSize(8);
  doc.text('#', col.no.x + 3, y + 5);
  doc.text('Item', col.item.x, y + 5);
  doc.text('Rate / Item', col.rate.x, y + 5, { width: col.rate.w, align: 'right' });
  doc.text('Qty', col.qty.x, y + 5, { width: col.qty.w, align: 'right' });
  doc.text('Taxable Value', col.taxable.x, y + 5, { width: col.taxable.w, align: 'right' });
  doc.text('Tax Amount', col.tax.x, y + 5, { width: col.tax.w, align: 'right' });
  doc.text('Amount', col.amount.x, y + 5, { width: col.amount.w, align: 'right' });

  y += 18;
  doc.moveTo(left, y).lineTo(right, y).strokeColor(blue).lineWidth(1.2).stroke();
  doc.lineWidth(1);
  doc.font('Regular').fontSize(8.5).fillColor(dark);

  invoice.items.forEach((it, idx) => {
    const rowY = y + 6;
    doc.font('Regular').fillColor(dark).text(String(idx + 1), col.no.x + 3, rowY);
    doc.font('Bold').text(it.item, col.item.x, rowY, { width: col.item.w });
    doc.font('Regular').text(formatMoney(it.rate), col.rate.x, rowY, { width: col.rate.w, align: 'right' });
    doc.text(String(it.qty), col.qty.x, rowY, { width: col.qty.w, align: 'right' });
    doc.text(formatMoney(it.taxableValue), col.taxable.x, rowY, { width: col.taxable.w, align: 'right' });
    doc.text(`${formatMoney(it.taxAmount)} (${it.taxPercent}%)`, col.tax.x, rowY, { width: col.tax.w, align: 'right' });
    doc.text(formatMoney(it.amount), col.amount.x, rowY, { width: col.amount.w, align: 'right' });
    y += 22;
    doc.moveTo(left, y - 2).lineTo(right, y - 2).strokeColor('#eeeeee').stroke();
  });

  y += 6;

  // ---------- TOTALS ----------
  // Right-aligned two-column block: labels end at x=450, values end at
  // the page's right margin — matches the reference template exactly.
  const labelBox = { x: 300, w: 150 };
  const valueBox = { x: 460, w: right - 460 };

  doc.font('Bold').fontSize(9);
  writeTotalRow(doc, 'Taxable Amount', formatCurrency(invoice.taxableAmount), labelBox, valueBox, y);
  y += 16;

  doc.fontSize(12);
  writeTotalRow(doc, 'Total', formatCurrency(invoice.total), labelBox, valueBox, y);
  y += 20;

  doc.fontSize(9);
  writeTotalRow(doc, `TDS @ ${invoice.tdsPercent}% under GST`, formatCurrency(invoice.tdsAmount), labelBox, valueBox, y);

  const totalQty = invoice.items.reduce((s, i) => s + Number(i.qty), 0);
  const qtyLabel = `Total Items / Qty : ${invoice.items.length} / ${totalQty}`;
  doc.font('Regular').fontSize(8).fillColor(gray).text(qtyLabel, left, y);
  const qtyLabelWidth = doc.widthOfString(qtyLabel);
  const wordsX = left + qtyLabelWidth + 20;
  doc.font('Regular').fontSize(8).text(
    `Total amount (in words): ${invoice.amountInWords}`,
    wordsX,
    y,
    { width: labelBox.x - wordsX - 10, align: 'left' }
  );
  y += 17;

  doc.fillColor(dark).fontSize(9);
  writeTotalRow(doc, 'Amount Paid:', formatCurrency(invoice.amountPaid), labelBox, valueBox, y);
  y += 15;
  writeTotalRow(doc, 'Amount Payable:', formatCurrency(invoice.amountPayable), labelBox, valueBox, y);

  y += 30;

  // ---------- NOTES ----------
  // Only rendered when the invoice actually has a notes value. Height is
  // measured dynamically so multi-line notes push the bank/signature
  // section down instead of overlapping it.
  if (invoice.notes && invoice.notes.trim()) {
    const notesWidth = pageWidth;
    doc.font('Bold').fontSize(9).fillColor(dark).text('Notes:', left, y);
    y += 13;
    doc.font('Regular').fontSize(8.5).fillColor(gray);
    doc.text(invoice.notes, left, y, { width: notesWidth });
    y += doc.heightOfString(invoice.notes, { width: notesWidth }) + 16;
  } else {
    y += 8;
  }

  // ---------- BANK DETAILS + SIGNATURE ----------
  const bankSectionTop = y;

  doc.font('Bold').fontSize(9).fillColor(dark).text('Bank Details:', left, y);
  const bank = settings.bankDetails || {};
  let by = y + 15;
  const bankLabelX = left;
  const bankValueX = left + 116;
  const bankRows = [
    ['Bank:', bank.bankName],
    ['Account Holder:', bank.accountHolder],
    ['Account #:', bank.accountNumber],
    ['IFSC Code:', bank.ifscCode],
    ['Branch:', bank.branch],
  ];
  bankRows.forEach(([label, val]) => {
    // Explicit x-positioned columns (not PDFKit "continued" text) so a
    // long value can never wrap back into the initial label's text box.
    doc.font('Regular').fontSize(8.5).fillColor(gray).text(label, bankLabelX, by, { width: 112 });
    doc.font('Bold').fontSize(8.5).fillColor(dark).text(val || '', bankValueX, by, { width: right - bankValueX });
    by += 14;
  });

  // Signature block: "For <Company>" label, then the signature image (if
  // uploaded) sitting directly above "Authorized Signatory" — matching
  // the reference template's layout. Sized up from before, with the
  // "Authorized Signatory" caption pushed down to give the larger image
  // room to breathe.
  const sigBoxWidth = 200;
  const sigBoxX = right - sigBoxWidth;

  doc.font('Regular').fontSize(9).fillColor(dark)
    .text(`For ${settings.companyName || 'CRAZYGROWMIND STUDIO'}`, sigBoxX, bankSectionTop, { width: sigBoxWidth, align: 'right' });

  if (settings.signatureBuffer) {
    try {
      const sigWidth = 180;
      const sigHeight = 85;
      doc.image(settings.signatureBuffer, right - sigWidth, bankSectionTop + 14, {
        fit: [sigWidth, sigHeight],
        align: 'right',
      });
    } catch (e) {
      // ignore broken/corrupt signature image
    }
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

module.exports = generateInvoicePDF;