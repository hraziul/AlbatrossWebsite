import './loadEnv.js';
import express from 'express';
import crypto from 'crypto';
import { savePendingOrder, findByRazorpayOrderId, updateOrder } from './orderStore.js';
import { sendOrderConfirmationEmail, sendReturnRequestEmails, sendSubscriberWelcomeEmail, isEmailConfigured } from './emailService.js';
import { addSubscriber } from './subscriberStore.js';
import { saveReturnRequest } from './returnStore.js';

/**
 * appCore.js
 *
 * The actual Express app — every /api/* route, with no knowledge of how it's
 * hosted. Two separate entry points use this same app:
 *   - server.js: adds static-file serving + app.listen() for traditional
 *     Node hosting (npm run start / npm run dev:full locally).
 *   - netlify/functions/api.js: wraps this same app with serverless-http so
 *     it runs as a Netlify Function, with no static-serving of its own
 *     (Netlify's CDN already serves the built goods/ frontend directly).
 * Splitting it this way means the actual route logic exists in exactly one
 * place regardless of which host runs it.
 */

const app = express();
// Capture the raw request body alongside the parsed JSON — Razorpay webhook
// signature verification is an HMAC over the exact raw bytes, not a re-serialization.
app.use(express.json({
  verify: (req, _res, buf) => { req.rawBody = buf; }
}));

// Env Keys validation
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || '';
const PRINTROVE_EMAIL = process.env.PRINTROVE_EMAIL || '';
const PRINTROVE_PASSWORD = process.env.PRINTROVE_PASSWORD || '';
const PRINTROVE_BASE_URL = 'https://api.printrove.com';

/**
 * Prints a startup summary of which integrations are configured. This is the
 * single most common source of "checkout is broken" confusion locally: the
 * .env keys exist as blank lines (not missing entirely), which is easy to
 * miss when eyeballing the file, and the resulting 503 only shows up once
 * someone actually clicks "pay". Surface it the moment the server boots.
 * (In the Netlify Function host, call this once per cold start — see
 * netlify/functions/api.js — since there's no single "startup" moment there.)
 */
export function logConfigStatus() {
  // KEY_ID/KEY_SECRET block checkout entirely (create-order returns 503
  // without them). WEBHOOK_SECRET only affects the separate webhook
  // receiver — treat it as its own, lower-severity notice so a missing
  // webhook secret doesn't look like checkout itself is broken.
  const missingKeys = [
    !RAZORPAY_KEY_ID && 'RAZORPAY_KEY_ID',
    !RAZORPAY_KEY_SECRET && 'RAZORPAY_KEY_SECRET',
  ].filter(Boolean);

  if (missingKeys.length > 0) {
    console.warn(`⚠  Razorpay not configured — missing: ${missingKeys.join(', ')}`);
    console.warn('   /api/checkout/create-order will return 503 "gateway_not_configured" until these are set in .env.');
    console.warn('   Test-mode keys (rzp_test_... / a matching test secret) from your Razorpay Dashboard → Settings → API Keys work fine for a local dry run — no live keys needed.');
  } else {
    console.log(`✓ Razorpay configured (key: ${RAZORPAY_KEY_ID.slice(0, 8)}…)`);
  }

  if (!RAZORPAY_WEBHOOK_SECRET) {
    console.warn('⚠  RAZORPAY_WEBHOOK_SECRET not set — /api/checkout/webhook will reject events until it is.');
    console.warn('   Checkout itself still works without it; the webhook is a separate server-to-server confirmation path.');
  }

  const missingPrintrove = [
    !PRINTROVE_EMAIL && 'PRINTROVE_EMAIL',
    !PRINTROVE_PASSWORD && 'PRINTROVE_PASSWORD',
  ].filter(Boolean);

  if (missingPrintrove.length > 0) {
    console.warn(`⚠  Printrove fulfillment not configured — missing: ${missingPrintrove.join(', ')}`);
    console.warn('   Orders will still be accepted after payment, but won\'t be auto-submitted to Printrove for production.');
  } else {
    console.log(`✓ Printrove fulfillment configured (${PRINTROVE_EMAIL})`);
  }

  if (isEmailConfigured()) {
    console.log(`✓ Email configured (SMTP: ${process.env.SMTP_HOST}, from: ${process.env.FROM_EMAIL || process.env.SMTP_USER}, merchant notifications: ${process.env.MERCHANT_EMAIL || process.env.SMTP_USER})`);
  } else {
    console.warn('⚠  Email not configured — missing SMTP_HOST / SMTP_USER / SMTP_PASS.');
    console.warn('   Orders still confirm/fulfill and returns still get recorded without this — customers just won\'t get order-confirmation or return-request emails, and you won\'t get return-request notifications, until these are set.');
  }
}

// ── Newsletter Signup ─────────────────────────────────────────────────────────

/**
 * Durable signup capture for the welcome popup. Previously this only wrote
 * to the visitor's own browser localStorage — nothing ever reached the
 * business. This is the durability floor (a real file the business can read),
 * not a full ESP — see subscriberStore.js for what's still missing
 * (unsubscribe handling, actual campaign sending, list segmentation).
 */
app.post('/api/newsletter/subscribe', (req, res) => {
  const { email, source } = req.body;
  try {
    const result = addSubscriber(email, source || 'welcome_modal');
    if (result.alreadySubscribed) {
      return res.json({ status: 'already_subscribed' });
    }
    // Respond as soon as the signup is durably saved — the customer shouldn't
    // wait on a full Gmail SMTP round-trip (can be 1-3+ seconds) just to see
    // "You're in". The welcome email fires in the background; its outcome is
    // still logged, it just doesn't hold up the response.
    res.json({ status: 'subscribed' });
    sendSubscriberWelcomeEmail({ to: email })
      .then((sent) => console.log(`[Albatross Server] New subscriber ${email} (source: ${source || 'welcome_modal'}) — welcome email sent: ${sent}`))
      .catch((err) => console.error('[Albatross Server] Welcome email failed to send:', err));
  } catch (err) {
    console.error('[Albatross Server] Newsletter signup rejected:', err.message);
    res.status(400).json({ error: err.message || 'Invalid email address.' });
  }
});

// ── Webhook / Payment API routes ─────────────────────────────────────────────

/**
 * Create Razorpay order. Also accepts (optional) `customer` and `cartItems` —
 * captured now, before payment, and saved as a pending order record. This is
 * what lets the webhook confirm an order with full context even if the
 * customer's browser never makes it back to call verify-payment.
 */
app.post('/api/checkout/create-order', async (req, res) => {
  const { amount, customer, cartItems } = req.body; // amount in INR

  if (!amount || isNaN(amount)) {
    return res.status(400).json({ error: 'Invalid order amount.' });
  }

  // Razorpay's minimum order amount is 100 paise (₹1) — reject below that
  // with a clear 400 rather than letting Razorpay's own rejection surface
  // as an opaque 500 further down.
  const amountInPaise = Math.round(amount * 100);
  if (amountInPaise < 100) {
    return res.status(400).json({ error: 'Order amount must be at least ₹1 (100 paise).' });
  }

  // If credentials are missing, the gateway is not configured yet.
  // Do NOT hand the client a fake order — that leads to Razorpay's checkout.js
  // opening with a mismatched/nonexistent key and failing with a generic
  // "Oops! Something went wrong" error. Tell the client plainly instead.
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    console.warn('[Albatross Server] Razorpay keys missing. Refusing to create a live order.');
    return res.status(503).json({
      error: 'gateway_not_configured',
      message: 'Payment gateway is not configured yet. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.'
    });
  }

  try {
    const authString = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${authString}`
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `receipt_${Date.now().toString().slice(-6)}`
      })
    });

    if (!response.ok) {
      const text = await response.text();
      // Razorpay returns 401 for bad/mismatched API keys — surface that
      // distinctly rather than folding every failure into a generic 500.
      if (response.status === 401) {
        console.error('[Albatross Server] Razorpay rejected the API key/secret (401):', text);
        return res.status(401).json({ error: 'Razorpay authentication failed. Check RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET.' });
      }
      throw new Error(`Razorpay Order creation error: ${text}`);
    }

    const data = await response.json();
    console.log(`[Order] Razorpay order created: ${data.id} (₹${amount})`);
    savePendingOrder({ razorpayOrderId: data.id, amount, customer, cartItems });

    // Hand the client the exact key_id this order was created with, so the
    // checkout.js instance can never open with a different/stale key than
    // the one that generated the order (the classic cause of key-mismatch failures).
    res.json({ ...data, key_id: RAZORPAY_KEY_ID });
  } catch (err) {
    console.error('Error creating Razorpay order:', err);
    res.status(500).json({ error: err.message || 'Payment provider order creation failed.' });
  }
});

/** Submits a confirmed order's cart to Printrove for fulfillment. Never throws — returns null on failure. */
async function submitToPrintrove(referenceNumber, customer, cartItems) {
  if (!PRINTROVE_EMAIL || !PRINTROVE_PASSWORD) {
    console.log(`[Printrove] Credentials not configured — skipping fulfillment for ${referenceNumber}.`);
    return null;
  }
  if (!customer || !cartItems || cartItems.length === 0) {
    console.warn(`[Printrove] No customer/cart data available for ${referenceNumber} — skipping fulfillment.`);
    return null;
  }

  try {
    console.log(`[Printrove] Authenticating for order ${referenceNumber}...`);
    const authRes = await fetch(`${PRINTROVE_BASE_URL}/api/external/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email: PRINTROVE_EMAIL, password: PRINTROVE_PASSWORD }),
    });
    if (!authRes.ok) throw new Error('Printrove auth failed.');

    const { access_token } = await authRes.json();
    console.log(`[Printrove] Submitting order ${referenceNumber}...`);

    const printroveProducts = cartItems.map((item) => ({
      product_id: item.baseProductId || 460, // Fallback to Round Neck T-Shirt if missing
      design: {
        front: {
          id: parseInt(item.id), // Design ID mapped in sync
          dimensions: { width: 3000, height: 3000, top: 10, left: 50 }
        }
      },
      quantity: item.quantity,
      variant_id: parseInt(item.variantId) || 264, // Mock/fallback standard variant
      is_plain: false
    }));

    const orderPayload = {
      reference_number: referenceNumber,
      retail_price: cartItems.reduce((acc, x) => acc + (x.price || 2499) * x.quantity, 0),
      customer: {
        name: customer.name,
        email: customer.email,
        number: customer.number,
        address1: customer.address1,
        address2: customer.address2 || '',
        pincode: customer.pincode,
        state: customer.state,
        city: customer.city,
        country: 'India'
      },
      order_products: printroveProducts,
      cod: false
    };

    const orderSubmitRes = await fetch(`${PRINTROVE_BASE_URL}/api/external/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(orderPayload)
    });

    if (orderSubmitRes.ok) {
      const printroveResponse = await orderSubmitRes.json();
      console.log(`[Printrove] ✓ Order placement successful for ${referenceNumber}:`, printroveResponse);
      return printroveResponse;
    }
    const text = await orderSubmitRes.text();
    console.error(`[Printrove] ✗ Order submission failed for ${referenceNumber}:`, text);
    return null;
  } catch (err) {
    console.error(`[Printrove] ✗ Error during fulfillment for ${referenceNumber}:`, err);
    return null;
  }
}

/**
 * Confirms an order once payment is verified — the single source of truth
 * for "a payment succeeded", called from BOTH verify-payment (client path,
 * fast, immediate UX) and the webhook (server-to-server, reliable even if
 * the browser never comes back). Idempotent: calling it twice for the same
 * Razorpay order (e.g. both paths fire for the same payment, which is
 * normal) returns the existing confirmation rather than double-fulfilling.
 */
async function confirmOrder({ razorpayOrderId, razorpayPaymentId, via, fallbackCustomer, fallbackCartItems }) {
  console.log(`[Order] confirmOrder(via=${via}) order_id=${razorpayOrderId} payment_id=${razorpayPaymentId}`);

  let record = findByRazorpayOrderId(razorpayOrderId);
  if (!record) {
    console.warn(`[Order] No pending record found for ${razorpayOrderId} (created before this order-tracking existed, or create-order wasn't called first) — reconstructing from ${via} data.`);
    record = { razorpayOrderId, customer: fallbackCustomer ?? null, cartItems: fallbackCartItems ?? [], amount: null, referenceNumber: null, status: 'pending' };
  }

  if (record.status === 'paid') {
    console.log(`[Order] ${record.referenceNumber} already confirmed via "${record.confirmedVia}" at ${record.paidAt} — ${via} confirmation is a duplicate, not re-processing.`);
    return record;
  }

  const referenceNumber = record.referenceNumber || `ALB-${Date.now().toString().slice(-8)}`;
  const customer = record.customer ?? fallbackCustomer ?? null;
  const cartItems = (record.cartItems && record.cartItems.length > 0) ? record.cartItems : (fallbackCartItems ?? []);

  const printroveResponse = await submitToPrintrove(referenceNumber, customer, cartItems);
  const emailSent = await sendOrderConfirmationEmail({
    to: customer?.email,
    name: customer?.name,
    referenceNumber,
    cartItems,
    amount: record.amount,
  });

  const updated = updateOrder(razorpayOrderId, {
    razorpayPaymentId,
    referenceNumber,
    status: 'paid',
    paidAt: new Date().toISOString(),
    confirmedVia: via,
    printrove: printroveResponse,
    emailSent,
  }) || { ...record, razorpayPaymentId, referenceNumber, status: 'paid', confirmedVia: via, printrove: printroveResponse, emailSent };

  console.log(`[Order] ✓ ${referenceNumber} confirmed via ${via}. Printrove: ${printroveResponse ? 'submitted' : 'skipped/failed'}. Email: ${emailSent ? 'sent' : 'not sent'}.`);
  return updated;
}

/** Verify payment signature and fulfill order via Printrove */
app.post('/api/checkout/verify-payment', async (req, res) => {
  const {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    customer,
    cartItems
  } = req.body;

  // 1. Signature Verification — fail closed. A payment is only ever
  // considered valid if we can cryptographically verify it; there is no
  // "skip verification" fallback path (that was the source of a real bug:
  // any missing field or unreachable gateway used to be treated as a
  // successful, fulfilled order).
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    console.error('[Albatross Server] Cannot verify payment — Razorpay keys not configured.');
    return res.status(503).json({ error: 'Payment gateway not configured.' });
  }
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Missing payment verification fields.' });
  }

  const generated = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (generated !== razorpay_signature) {
    console.error(`[Albatross Server] Signature mismatch for order ${razorpay_order_id} / payment ${razorpay_payment_id} — refusing to confirm.`);
    return res.status(400).json({ error: 'Signature verification failed.' });
  }
  console.log(`[Albatross Server] Signature verified for order ${razorpay_order_id} / payment ${razorpay_payment_id}.`);

  // 2. Confirm the order — this is the fast, in-browser confirmation path.
  // The webhook below performs the exact same confirmMation independently,
  // so an order still gets confirmed even if this call never happens.
  try {
    const order = await confirmOrder({
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      via: 'client',
      fallbackCustomer: customer,
      fallbackCartItems: cartItems,
    });
    res.json({
      status: 'success',
      reference_number: order.referenceNumber,
      printrove: order.printrove,
    });
  } catch (err) {
    // The payment is genuinely valid (signature already checked above) —
    // don't tell the client verification failed. Tell them clearly that
    // confirmation is still in progress instead.
    console.error(`[Albatross Server] confirmOrder threw for ${razorpay_order_id}:`, err);
    res.status(500).json({
      error: 'Payment verified, but order confirmation hit an error. Your payment is safe — save this payment ID and contact support: ' + razorpay_payment_id
    });
  }
});

/**
 * Razorpay webhook receiver — register this URL (POST, `<your-domain>/api/checkout/webhook`)
 * in the Razorpay Dashboard under Settings → Webhooks, with the `payment.captured` event
 * selected, and set RAZORPAY_WEBHOOK_SECRET to the secret shown there.
 *
 * This is a server-to-server source of truth independent of the customer's browser —
 * it still fires even if the customer closes the tab right after paying, before the
 * client-side verify-payment call completes.
 */
app.post('/api/checkout/webhook', async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];

  if (!RAZORPAY_WEBHOOK_SECRET) {
    console.warn('[Albatross Server] Webhook received but RAZORPAY_WEBHOOK_SECRET is not set. Rejecting.');
    return res.status(503).json({ error: 'Webhook not configured.' });
  }
  if (!signature || !req.rawBody) {
    return res.status(400).json({ error: 'Missing signature or body.' });
  }

  const expected = crypto
    .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
    .update(req.rawBody)
    .digest('hex');

  if (expected !== signature) {
    console.error('[Webhook] Signature mismatch — rejecting.');
    return res.status(400).json({ error: 'Invalid webhook signature.' });
  }

  const event = req.body;
  if (event.event === 'payment.captured') {
    const payment = event.payload?.payment?.entity;
    console.log(
      `[Webhook] payment.captured — payment_id=${payment?.id} order_id=${payment?.order_id} amount=${payment?.amount}`
    );
    if (payment?.order_id && payment?.id) {
      try {
        await confirmOrder({ razorpayOrderId: payment.order_id, razorpayPaymentId: payment.id, via: 'webhook' });
      } catch (err) {
        // Non-2xx tells Razorpay to retry the webhook later — appropriate
        // here since this is likely a transient failure (Printrove/email/disk),
        // not a reason to silently drop a real, paid order.
        console.error(`[Webhook] confirmOrder failed for order ${payment.order_id}:`, err);
        return res.status(500).json({ error: 'Failed to process payment.captured event.' });
      }
    } else {
      console.warn('[Webhook] payment.captured event missing order_id or payment id — cannot confirm order.', payment);
    }
  } else {
    console.log(`[Webhook] Received event: ${event.event} (no action taken)`);
  }

  res.json({ status: 'ok' });
});

// ── Order Tracking and Returns API endpoints ───────────────────────────────

/** Helper to extract confirmation date from order references, supporting testing states */
function parseOrderTime(id) {
  const rawId = String(id).replace('ALB-', '').toUpperCase();
  if (rawId === 'EXPIRED') {
    return new Date(Date.now() - 3 * 24 * 60 * 60 * 1000); // 72 hours ago
  }
  if (rawId === 'FRESH' || rawId === 'NEW') {
    return new Date(); // Placed just now
  }
  let orderCreatedTime = new Date();
  if (rawId.length === 8 && !isNaN(Number(rawId))) {
    const nowStr = String(Date.now());
    const basePrefix = nowStr.slice(0, nowStr.length - 8);
    let reconstructedTime = Number(basePrefix + rawId);
    if (!isNaN(reconstructedTime)) {
      if (reconstructedTime > Date.now()) {
        const prefixNum = Number(basePrefix) - 1;
        reconstructedTime = Number(String(prefixNum) + rawId);
      }
      orderCreatedTime = new Date(reconstructedTime);
    }
  }
  return orderCreatedTime;
}

/** GET real-time order status from Printrove or simulated status tracker */
app.get('/api/orders/track', async (req, res) => {
  const { id, contact } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Order Reference ID is required.' });
  }

  const orderCreatedTime = parseOrderTime(id);

  // Calculate elapsed hours
  const elapsedMs = Date.now() - orderCreatedTime.getTime();
  const elapsedHours = elapsedMs / (1000 * 60 * 60);

  // If live Printrove credentials exist, we can try to query Printrove
  let printroveStatusData = null;
  if (PRINTROVE_EMAIL && PRINTROVE_PASSWORD && id.startsWith('ALB-')) {
    try {
      const authRes = await fetch(`${PRINTROVE_BASE_URL}/api/external/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: PRINTROVE_EMAIL, password: PRINTROVE_PASSWORD }),
      });
      if (authRes.ok) {
        const { access_token } = await authRes.json();
        const trackingRes = await fetch(`${PRINTROVE_BASE_URL}/api/external/orders/${id}`, {
          headers: { Authorization: `Bearer ${access_token}` }
        });
        if (trackingRes.ok) {
          printroveStatusData = await trackingRes.json();
        }
      }
    } catch (err) {
      console.warn('[Albatross Server] Error fetching order tracking from Printrove API:', err);
    }
  }

  // Compile final tracking lifecycle payload
  let status = 'created';
  let statusLabel = 'Order Accepted';

  if (printroveStatusData && printroveStatusData.status) {
    status = printroveStatusData.status.toLowerCase();
    statusLabel = printroveStatusData.status;
  } else {
    // Simulated timeline stages based on time elapsed since order was created
    if (elapsedHours >= 96) {
      status = 'delivered';
      statusLabel = 'Delivered';
    } else if (elapsedHours >= 48) {
      status = 'shipped';
      statusLabel = 'Shipped';
    } else if (elapsedHours >= 24) {
      status = 'printed';
      statusLabel = 'Printed';
    } else if (elapsedHours >= 2) {
      status = 'processing';
      statusLabel = 'In Production';
    }
  }

  // Construct structured tracking response
  const timeOffset = (hrs) => new Date(orderCreatedTime.getTime() + hrs * 60 * 60 * 1000).toISOString();

  res.json({
    id,
    created_at: orderCreatedTime.toISOString(),
    status,
    status_label: statusLabel,
    contact_verified: !!contact,
    elapsed_hours: elapsedHours,
    timeline: [
      { status: 'created', label: 'Order Placed', time: orderCreatedTime.toISOString(), completed: true },
      { status: 'processing', label: 'In Production', time: timeOffset(2), completed: elapsedHours >= 2 },
      { status: 'printed', label: 'Press & Printed', time: timeOffset(24), completed: elapsedHours >= 24 },
      { status: 'shipped', label: 'Dispatched & Shipped', time: timeOffset(48), completed: elapsedHours >= 48 },
      { status: 'delivered', label: 'Delivered', time: timeOffset(96), completed: elapsedHours >= 96 }
    ]
  });
});

/** POST return/replacement request checking 48-hour window */
app.post('/api/orders/return', async (req, res) => {
  const { id, reason, contact, comments } = req.body;

  if (!id || !reason || !contact) {
    return res.status(400).json({ error: 'Order ID, return reason, and contact info are required.' });
  }

  const orderCreatedTime = parseOrderTime(id);

  // Enforce 48-hour return window
  const elapsedMs = Date.now() - orderCreatedTime.getTime();
  const elapsedHours = elapsedMs / (1000 * 60 * 60);

  if (elapsedHours > 48) {
    return res.status(400).json({
      error: `Return window closed. Your order was created on ${orderCreatedTime.toLocaleDateString()} (${Math.round(elapsedHours)} hours ago), which exceeds the 48-hour return eligibility window.`
    });
  }

  // Return request accepted — persist it (previously console.log only, with
  // no admin dashboard to ever see it again) and notify both the merchant
  // (the only way the business currently learns a return came in) and the
  // customer (if their contact info is an email).
  const referenceNumber = `RET-${Date.now().toString().slice(-6)}`;
  saveReturnRequest({ referenceNumber, orderId: id, reason, contact, comments });

  const { merchantNotified, customerNotified } = await sendReturnRequestEmails({
    referenceNumber, orderId: id, reason, contact, comments,
  });
  console.log(`[Albatross Server] Return Request ${referenceNumber} for order ${id} — merchant notified: ${merchantNotified}, customer notified: ${customerNotified}`);

  res.json({
    status: 'success',
    message: 'Return / Replacement request submitted successfully.',
    reference_number: referenceNumber
  });
});

export default app;
