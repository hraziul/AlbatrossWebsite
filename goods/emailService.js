/**
 * emailService.js
 *
 * Order-confirmation email. There was previously no email-sending code at
 * all in this project — this adds the capability via plain SMTP (works with
 * Gmail, SendGrid, Mailgun, AWS SES, Resend, etc. — anything with an SMTP
 * relay) rather than locking into one provider's HTTP API.
 *
 * Gated behind env vars exactly like Razorpay/Printrove elsewhere in this
 * codebase: if unconfigured, it logs clearly and returns false rather than
 * throwing — a missing SMTP config should never block order confirmation.
 */
import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const FROM_EMAIL = process.env.FROM_EMAIL || SMTP_USER;

export function isEmailConfigured() {
  return !!(SMTP_HOST && SMTP_USER && SMTP_PASS);
}

let _transporter = null;
function getTransporter() {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return _transporter;
}

function formatLineItem(item) {
  const variant = [item.color, item.size].filter(Boolean).join(', ');
  return `  • ${item.name}${variant ? ` (${variant})` : ''} × ${item.quantity}`;
}

/** Returns true if the email was actually sent, false if skipped or failed — never throws. */
export async function sendOrderConfirmationEmail({ to, name, referenceNumber, cartItems, amount }) {
  if (!isEmailConfigured()) {
    console.warn(`[Email] SMTP not configured (SMTP_HOST / SMTP_USER / SMTP_PASS) — skipping confirmation email for ${referenceNumber}.`);
    console.warn('[Email] Set these in .env to enable order-confirmation emails.');
    return false;
  }
  if (!to) {
    console.warn(`[Email] No customer email on file for ${referenceNumber} — skipping.`);
    return false;
  }

  const itemLines = (cartItems || []).map(formatLineItem).join('\n') || '  (no items on file)';
  const totalLine = amount ? `\nTotal: ₹${amount.toLocaleString('en-IN')}\n` : '';

  try {
    await getTransporter().sendMail({
      from: `"Albatross Goods India" <${FROM_EMAIL}>`,
      to,
      subject: `Order Confirmed — ${referenceNumber}`,
      text: `Hi ${name || 'there'},\n\nYour order is confirmed.\n\nOrder Reference: ${referenceNumber}\n\n${itemLines}\n${totalLine}\nDispatched within 48 hours of confirmation. We'll email you again once it ships.\n\n— Albatross Goods India`,
    });
    console.log(`[Email] ✓ Confirmation email sent to ${to} for ${referenceNumber}`);
    return true;
  } catch (err) {
    console.error(`[Email] ✗ Failed to send confirmation email for ${referenceNumber}:`, err.message);
    return false;
  }
}
