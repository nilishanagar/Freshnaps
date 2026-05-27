const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

/**
 * Generates an invoice PDF for an order and saves it to uploads/invoices/.
 * @param {Object} order - Mongoose Order document
 * @returns {Promise<string>} - Public URL/path of the saved PDF
 */
const generateInvoicePDF = async (order) => {
  return new Promise((resolve, reject) => {
    try {
      // Ensure invoice directory exists
      const invoicesDir = path.join(__dirname, '..', 'uploads', 'invoices');
      if (!fs.existsSync(invoicesDir)) {
        fs.mkdirSync(invoicesDir, { recursive: true });
      }

      // Generate invoice number if not already present
      if (!order.invoiceNumber) {
        const year = new Date(order.createdAt || Date.now()).getFullYear();
        const rand = Math.floor(10000 + Math.random() * 90000);
        order.invoiceNumber = `FN-${year}-${rand}`;
      }

      const fileName = `${order.invoiceNumber}.pdf`;
      const filePath = path.join(invoicesDir, fileName);
      const publicPath = `/uploads/invoices/${fileName}`;

      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      // Header Section
      doc.fillColor('#1A1A2E').fontSize(24).font('Helvetica-Bold').text('FRESHNAPS', 40, 40);
      doc.fontSize(10).font('Helvetica').fillColor('#666666').text('Premium Bedding & Sleep Solutions', 40, 68);
      
      // Business details
      doc.fontSize(9).text('Freshnaps Sleep Products Private Limited', 40, 90);
      doc.text('Plot 42, Sector 3, Industrial Area, Mumbai, MH - 400001', 40, 102);
      doc.text('Email: support@freshnaps.in | Phone: +91 98765 43210', 40, 114);
      doc.text('GSTIN: 27AAPCF1234F1Z5 (Maharashtra)', 40, 126);

      // Invoice info block (Right-aligned relative to page)
      doc.fillColor('#1A1A2E').fontSize(14).font('Helvetica-Bold').text('INVOICE', 380, 40, { align: 'right', width: 175 });
      doc.fontSize(9).font('Helvetica').fillColor('#333333');
      doc.text(`Invoice No: ${order.invoiceNumber}`, 380, 60, { align: 'right', width: 175 });
      doc.text(`Date: ${new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN')}`, 380, 72, { align: 'right', width: 175 });
      doc.text(`Order ID: ${order._id.toString().substring(18).toUpperCase()}`, 380, 84, { align: 'right', width: 175 });
      doc.text(`Payment: ${order.paymentMethod} (${order.paymentStatus.toUpperCase()})`, 380, 96, { align: 'right', width: 175 });

      // Divider Line
      doc.strokeColor('#E5E7EB').lineWidth(1).moveTo(40, 145).lineTo(550, 145).stroke();

      // Bill To / Ship To
      const billing = order.billingAddress || order.shippingAddress;
      const shipping = order.shippingAddress;

      doc.fillColor('#1A1A2E').font('Helvetica-Bold').fontSize(10).text('BILL TO:', 40, 160);
      doc.font('Helvetica').fillColor('#333333').fontSize(9);
      doc.text(billing.name || 'Customer Name', 40, 175, { width: 240 });
      doc.text(billing.phone || '', 40, 187, { width: 240 });
      doc.text(`${billing.street || ''}`, 40, 199, { width: 240 });
      doc.text(`${billing.city || ''}, ${billing.state || ''} - ${billing.pincode || ''}`, 40, 211, { width: 240 });

      doc.fillColor('#1A1A2E').font('Helvetica-Bold').fontSize(10).text('SHIP TO:', 300, 160);
      doc.font('Helvetica').fillColor('#333333').fontSize(9);
      doc.text(shipping.name || 'Customer Name', 300, 175, { width: 240 });
      doc.text(shipping.phone || '', 300, 187, { width: 240 });
      doc.text(`${shipping.street || ''}`, 300, 199, { width: 240 });
      doc.text(`${shipping.city || ''}, ${shipping.state || ''} - ${shipping.pincode || ''}`, 300, 211, { width: 240 });

      // Divider Line
      doc.strokeColor('#E5E7EB').moveTo(40, 235).lineTo(550, 235).stroke();

      // Table Headers
      const tableTop = 250;
      doc.fillColor('#1A1A2E').font('Helvetica-Bold').fontSize(9);
      doc.text('Item Description', 40, tableTop, { width: 200 });
      doc.text('HSN/SKU', 250, tableTop, { width: 60, align: 'center' });
      doc.text('Qty', 320, tableTop, { width: 30, align: 'center' });
      doc.text('Unit Price', 360, tableTop, { width: 60, align: 'right' });
      doc.text('Discount', 430, tableTop, { width: 50, align: 'right' });
      doc.text('Total', 490, tableTop, { width: 60, align: 'right' });

      // Header underline
      doc.strokeColor('#C9A96E').lineWidth(1.5).moveTo(40, 264).lineTo(550, 264).stroke();

      // Table Rows
      let currentTop = 272;
      doc.font('Helvetica').fontSize(9).fillColor('#333333');

      (order.orderItems || []).forEach((item, index) => {
        // Dummy HSN mapping based on keywords
        let hsn = '94049000'; // Default bedding
        const nameLower = (item.name || '').toLowerCase();
        if (nameLower.includes('sheet') || nameLower.includes('pillowcase')) {
          hsn = '63023100'; // Bed linen
        } else if (nameLower.includes('pillow')) {
          hsn = '94049010'; // Pillows
        } else if (nameLower.includes('protector')) {
          hsn = '94049090'; // Mattress protectors
        }

        const variantStr = item.variant ? Object.entries(item.variant)
          .filter(([_, val]) => !!val)
          .map(([key, val]) => `${key}: ${val}`)
          .join(', ') : '';

        const desc = item.name + (variantStr ? ` (${variantStr})` : '');
        const itemDiscount = 0; // standard item discount is already included in item.price or handled at order total

        doc.text(desc, 40, currentTop, { width: 200 });
        doc.text(hsn, 250, currentTop, { width: 60, align: 'center' });
        doc.text(item.quantity.toString(), 320, currentTop, { width: 30, align: 'center' });
        doc.text(`INR ${item.price.toFixed(2)}`, 360, currentTop, { width: 60, align: 'right' });
        doc.text(`INR ${itemDiscount.toFixed(2)}`, 430, currentTop, { width: 50, align: 'right' });
        
        const rowTotal = item.price * item.quantity;
        doc.text(`INR ${rowTotal.toFixed(2)}`, 490, currentTop, { width: 60, align: 'right' });

        currentTop += 24;

        // Page break if items run out of space
        if (currentTop > 650) {
          doc.addPage();
          currentTop = 40;
        }
      });

      // Divider Line
      doc.strokeColor('#E5E7EB').lineWidth(1).moveTo(40, currentTop).lineTo(550, currentTop).stroke();
      currentTop += 10;

      // Summary Block (Right side)
      const summaryLeft = 320;
      doc.font('Helvetica').fontSize(9);

      doc.text('Subtotal:', summaryLeft, currentTop, { width: 140, align: 'right' });
      doc.font('Helvetica-Bold').text(`INR ${(order.subtotal || 0).toFixed(2)}`, 470, currentTop, { width: 80, align: 'right' });
      doc.font('Helvetica');
      currentTop += 16;

      if (order.discount > 0) {
        doc.text(`Discount (${order.couponCode || 'Coupon'}):`, summaryLeft, currentTop, { width: 140, align: 'right' });
        doc.text(`- INR ${(order.discount).toFixed(2)}`, 470, currentTop, { width: 80, align: 'right' });
        currentTop += 16;
      }

      doc.text('Shipping Charges:', summaryLeft, currentTop, { width: 140, align: 'right' });
      doc.text(`INR ${(order.shippingCharge || 0).toFixed(2)}`, 470, currentTop, { width: 80, align: 'right' });
      currentTop += 16;

      // Tax Breakdowns
      const tb = order.taxBreakdown || { cgst: 0, sgst: 0, igst: 0 };
      if (tb.igst > 0) {
        doc.text('IGST (18%):', summaryLeft, currentTop, { width: 140, align: 'right' });
        doc.text(`INR ${tb.igst.toFixed(2)}`, 470, currentTop, { width: 80, align: 'right' });
        currentTop += 16;
      } else {
        doc.text('CGST (9%):', summaryLeft, currentTop, { width: 140, align: 'right' });
        doc.text(`INR ${tb.cgst.toFixed(2)}`, 470, currentTop, { width: 80, align: 'right' });
        currentTop += 16;

        doc.text('SGST (9%):', summaryLeft, currentTop, { width: 140, align: 'right' });
        doc.text(`INR ${tb.sgst.toFixed(2)}`, 470, currentTop, { width: 80, align: 'right' });
        currentTop += 16;
      }

      // Total Line
      doc.strokeColor('#E5E7EB').moveTo(summaryLeft, currentTop).lineTo(550, currentTop).stroke();
      currentTop += 6;

      doc.font('Helvetica-Bold').fontSize(11).fillColor('#1A1A2E');
      doc.text('Grand Total:', summaryLeft, currentTop, { width: 140, align: 'right' });
      doc.text(`INR ${(order.totalAmount || 0).toFixed(2)}`, 470, currentTop, { width: 80, align: 'right' });

      // Footer Notes
      const notesTop = Math.max(currentTop + 60, 680);
      doc.fontSize(8).fillColor('#666666').font('Helvetica');
      doc.text('Terms & Conditions:', 40, notesTop);
      doc.text('1. All disputes are subject to Mumbai jurisdiction.', 40, notesTop + 12);
      doc.text('2. Goods once sold will only be replaced or returned as per the site Return Policy within 7 days of delivery.', 40, notesTop + 22);
      doc.text('This is a computer-generated invoice and does not require a physical signature.', 40, notesTop + 37, { align: 'center', width: 510 });

      doc.end();

      writeStream.on('finish', () => {
        resolve(publicPath);
      });

      writeStream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateInvoicePDF };
