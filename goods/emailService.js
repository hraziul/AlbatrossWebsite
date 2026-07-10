/**
 * emailService.js
 *
 * All outbound email for the storefront: order confirmations, return-request
 * acknowledgements, and merchant notifications. Sent via plain SMTP (works
 * with Gmail, SendGrid, Mailgun, AWS SES, Resend, etc. — anything with an
 * SMTP relay) rather than locking into one provider's HTTP API.
 *
 * Gated behind env vars exactly like Razorpay/Printrove elsewhere in this
 * codebase: if unconfigured, it logs clearly and returns false rather than
 * throwing — a missing SMTP config should never block checkout or returns.
 */
import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const FROM_EMAIL = process.env.FROM_EMAIL || SMTP_USER;
// Where internal notifications (new return request, etc.) land — there's no
// admin dashboard in this app, so this inbox is the only way the business
// finds out about things like return requests as they come in.
const MERCHANT_EMAIL = process.env.MERCHANT_EMAIL || SMTP_USER;
const BRAND_NAME = 'Albatross Goods India';

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

/** Low-level send — never throws, always returns whether it actually went out. */
async function send({ to, subject, text }) {
  if (!isEmailConfigured()) {
    console.warn(`[Email] SMTP not configured (SMTP_HOST / SMTP_USER / SMTP_PASS) — skipping "${subject}" to ${to}.`);
    return false;
  }
  if (!to) {
    console.warn(`[Email] No recipient for "${subject}" — skipping.`);
    return false;
  }
  try {
    await getTransporter().sendMail({ from: `"${BRAND_NAME}" <${FROM_EMAIL}>`, to, subject, text });
    console.log(`[Email] ✓ Sent "${subject}" to ${to}`);
    return true;
  } catch (err) {
    console.error(`[Email] ✗ Failed to send "${subject}" to ${to}:`, err.message);
    return false;
  }
}

function formatLineItem(item) {
  const variant = [item.color, item.size].filter(Boolean).join(', ');
  return `  • ${item.name}${variant ? ` (${variant})` : ''} × ${item.quantity}`;
}

/** Returns true if the email was actually sent, false if skipped or failed — never throws. */
export async function sendOrderConfirmationEmail({ to, name, referenceNumber, cartItems, amount }) {
  const itemLines = (cartItems || []).map(formatLineItem).join('\n') || '  (no items on file)';
  const totalLine = amount ? `\nTotal: ₹${amount.toLocaleString('en-IN')}\n` : '';

  return send({
    to,
    subject: `Order Confirmed — ${referenceNumber}`,
    text: `Hi ${name || 'there'},\n\nYour order is confirmed.\n\nOrder Reference: ${referenceNumber}\nPayment Status: Paid\n\n${itemLines}\n${totalLine}\nDispatched within 48 hours of confirmation. We'll email you again once it ships.\n\n— ${BRAND_NAME}`,
  });
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Sends both sides of a return request: an internal notification to the
 * merchant inbox (the only way the business currently learns a return was
 * requested — there's no admin dashboard), and, if the customer's contact
 * looks like an email, an acknowledgement to them too.
 */
export async function sendReturnRequestEmails({ referenceNumber, orderId, reason, contact, comments }) {
  const merchantNotified = await send({
    to: MERCHANT_EMAIL,
    subject: `Return Request — ${referenceNumber} (Order ${orderId})`,
    text: `A return/replacement request was submitted.\n\nOrder ID: ${orderId}\nReference: ${referenceNumber}\nReason: ${reason}\nCustomer contact: ${contact}\nComments: ${comments || '(none)'}\n\nRespond to the customer directly at the contact info above.`,
  });

  let customerNotified = false;
  if (EMAIL_RE.test(contact)) {
    customerNotified = await send({
      to: contact,
      subject: `We received your return request — ${referenceNumber}`,
      text: `Hi,\n\nWe've received your return/replacement request for order ${orderId}.\n\nReference: ${referenceNumber}\nReason: ${reason}\n\nOur team will review this and get back to you within 24–48 hours at this email address.\n\n— ${BRAND_NAME}`,
    });
  }

  return { merchantNotified, customerNotified };
}

/**
 * Sent once, right after a NEW newsletter signup (not on "already subscribed"
 * re-submits — no need to re-welcome someone already on the list). Matches
 * the popup/footer's own "Inner Circle" copy so the email doesn't feel like
 * a generic form-confirmation bolted onto a premium brand.
 */
export async function sendSubscriberWelcomeEmail({ to }) {
  return send({
    to,
    subject: `Welcome to the Subculture`,
    text: `You've discovered something rare.\n\nAlbatross makes limited-run apparel for people who take culture seriously. Each piece is numbered. Once a drop sells out, it's retired — forever.\n\nYou'll hear about new drops before anyone else, straight to this inbox.\n\nNo spam, unsubscribe anytime by replying to this email.\n\n— ${BRAND_NAME}`,
  });
}
