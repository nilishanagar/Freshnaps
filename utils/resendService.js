const fs = require('fs');
const path = require('path');
const { generateInvoicePDF } = require('./invoiceService');

let ResendPkg;
try {
  ResendPkg = require('resend').Resend;
} catch (e) {
  ResendPkg = null;
}

const resendApiKey = process.env.RESEND_API_KEY;
const resendClient = (ResendPkg && resendApiKey) ? new ResendPkg(resendApiKey) : null;
const fromEmail = process.env.FROM_EMAIL || 'Freshnaps <onboarding@resend.dev>';

/**
 * Sends a transaction email using Resend, or falls back to diagnostic logs.
 * @param {string} to Recipient email
 * @param {string} subject Email Subject
 * @param {string} html HTML body content
 * @param {Array} attachments Optional attachment array: [{ filename: string, content: Buffer }]
 */
const sendEmail = async (to, subject, html, attachments = []) => {
  if (resendClient) {
    try {
      const payload = {
        from: fromEmail,
        to: [to],
        subject,
        html,
      };

      if (attachments && attachments.length > 0) {
        payload.attachments = attachments.map(att => ({
          filename: att.filename,
          content: att.content // Node Buffer or Base64 string depending on SDK version
        }));
      }

      const response = await resendClient.emails.send(payload);
      console.log(`[EMAIL SUCCESS] Dispatched transactional email to ${to} via Resend. ID: ${response.data?.id}`);
      return response;
    } catch (err) {
      console.error(`[EMAIL FAILED] Resend delivery exception to ${to}:`, err.message);
      throw err;
    }
  } else {
    // Sandbox Mock Mode fallback
    console.log(`\n📧 ================= MOCK EMAIL DISPATCH =================`);
    console.log(`   FROM:        ${fromEmail}`);
    console.log(`   TO:          ${to}`);
    console.log(`   SUBJECT:     ${subject}`);
    console.log(`   ATTACHMENTS: ${attachments.length > 0 ? attachments.map(a => a.filename).join(', ') : 'None'}`);
    console.log(`   BODY SNIPPET:`);
    console.log(`   ${html.slice(0, 300).replace(/\s+/g, ' ')}...`);
    console.log(`   STATUS:      [SANDBOX SIMULATION COMPLETED SUCCESSFULLY]`);
    console.log(`==========================================================\n`);
    return { data: { id: 'mock_email_id_' + Math.random().toString(36).substring(2, 10) } };
  }
};

/**
 * Sends a verification link.
 * @param {string} to 
 * @param {string} token 
 */
const sendVerificationEmail = async (to, token) => {
  const verifyLink = `${process.env.FRONTEND_URL || 'http://localhost:5174'}/verify-email?token=${token}`;
  
  const html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-2xl; background-color: #fafaf9;">
      <h2 style="color: #1A1A2E; border-bottom: 2px solid #C9A96E; padding-bottom: 10px;">Welcome to Freshnaps</h2>
      <p style="color: #4a5568; font-size: 14px; line-height: 1.6;">Thank you for registering your account with Freshnaps! Please click the button below to verify your email address and activate your profile.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verifyLink}" style="background: linear-gradient(135deg, #1A1A2E 0%, #C9A96E 100%); color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">Verify Email Address</a>
      </div>
      <p style="color: #718096; font-size: 12px; margin-top: 20px;">If the button above does not work, copy and paste this link in your browser: ${verifyLink}</p>
      <p style="color: #718096; font-size: 12px;">This link will expire in 24 hours.</p>
    </div>
  `;

  return await sendEmail(to, 'Verify Your Email Address — Freshnaps', html);
};

/**
 * Sends a password reset verification link.
 * @param {string} to 
 * @param {string} token 
 */
const sendResetPasswordEmail = async (to, token) => {
  const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5174'}/reset-password?token=${token}`;

  const html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; background-color: #fafaf9;">
      <h2 style="color: #1A1A2E; border-bottom: 2px solid #C9A96E; padding-bottom: 10px;">Reset Your Password — Freshnaps</h2>
      <p style="color: #4a5568; font-size: 14px; line-height: 1.6;">We received a request to reset the password associated with your account. Click the button below to configure a new password.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background: linear-gradient(135deg, #1A1A2E 0%, #C9A96E 100%); color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">Reset Password</a>
      </div>
      <p style="color: #718096; font-size: 12px; margin-top: 20px;">If the button above does not work, copy and paste this link in your browser: ${resetLink}</p>
      <p style="color: #718096; font-size: 12px;">This link will expire in 1 hour.</p>
    </div>
  `;

  return await sendEmail(to, 'Reset Your Password — Freshnaps', html);
};

/**
 * Dynamically generates a PDF invoice, reads the buffer, and sends an order confirmation email containing the PDF as an attachment.
 * @param {string} to Recipient email address
 * @param {object} payload Task payload containing orderId and invoiceNumber
 */
const sendOrderConfirmationEmail = async (to, payload) => {
  const Order = require('../models/Order');
  const order = await Order.findById(payload.orderId);
  if (!order) throw new Error(`Order ${payload.orderId} not found in database`);

  // Ensure PDF exists (Generates locally)
  const relativePath = await generateInvoicePDF(order);
  const absolutePath = path.join(__dirname, '..', relativePath);

  // Read binary PDF buffer
  let pdfBuffer;
  try {
    pdfBuffer = fs.readFileSync(absolutePath);
  } catch (err) {
    console.error('[EMAIL ERROR] Failed to read PDF invoice buffer:', err.message);
    pdfBuffer = Buffer.from('Failed to compile invoice PDF');
  }

  const html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; background-color: #ffffff;">
      <div style="text-align: center; padding: 10px 0; border-bottom: 2px solid #C9A96E;">
        <h1 style="color: #1A1A2E; margin: 0; font-size: 28px;">FRESHNAPS</h1>
        <p style="color: #a0aec0; margin: 5px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">Premium Sleep Solutions</p>
      </div>
      <div style="padding: 20px 0;">
        <h2 style="color: #1A1A2E;">Order Confirmed!</h2>
        <p style="color: #4a5568; font-size: 14px; line-height: 1.6;">Hi ${order.shippingAddress.name || 'Valued Customer'},</p>
        <p style="color: #4a5568; font-size: 14px; line-height: 1.6;">Thank you for shopping with Freshnaps. We have successfully processed your payment and confirmed your premium bedding order.</p>
        
        <div style="background-color: #fafaf9; border: 1px solid #f3f3f2; padding: 15px; border-radius: 12px; margin: 20px 0;">
          <table style="width: 100%; font-size: 13px; color: #4a5568;">
            <tr>
              <td style="font-weight: bold; padding: 4px 0;">Invoice Number:</td>
              <td style="text-align: right; padding: 4px 0; font-family: monospace;">${order.invoiceNumber}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; padding: 4px 0;">Grand Total:</td>
              <td style="text-align: right; padding: 4px 0; font-weight: bold; color: #1A1A2E;">₹${order.totalAmount.toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; padding: 4px 0;">Payment Method:</td>
              <td style="text-align: right; padding: 4px 0;">${order.paymentMethod}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; padding: 4px 0;">Delivery Address:</td>
              <td style="text-align: right; padding: 4px 0;">${order.shippingAddress.street}, ${order.shippingAddress.city}</td>
            </tr>
          </table>
        </div>

        <p style="color: #4a5568; font-size: 14px; line-height: 1.6;">We have attached a fully detailed, HSN-compliant digital PDF invoice directly to this email for your records.</p>
        <p style="color: #4a5568; font-size: 14px; line-height: 1.6;">We will notify you immediately once your package is shipped and our logistics partner provides tracking details.</p>
      </div>
      <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #718096; font-size: 11px;">
        <p>Freshnaps Sleep Products Private Limited</p>
        <p>Plot 42, Sector 3, Industrial Area, Mumbai, MH - 400001</p>
      </div>
    </div>
  `;

  const attachments = [
    {
      filename: `Freshnaps_Invoice_${order.invoiceNumber}.pdf`,
      content: pdfBuffer
    }
  ];

  return await sendEmail(to, `Your Freshnaps Order is Confirmed! — ${order.invoiceNumber}`, html, attachments);
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendResetPasswordEmail,
  sendOrderConfirmationEmail
};
