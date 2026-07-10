/**
 * orderStore.js
 *
 * Minimal file-backed order log — this project has no database, and none is
 * warranted for this scale, but there was previously NO persistent record of
 * an order anywhere: /api/checkout/verify-payment computed a reference number
 * in memory and returned it, with nothing written down. If the client never
 * completed that call (closed tab, network drop, redirect), the order simply
 * never existed anywhere except Razorpay's own dashboard.
 *
 * A pending record is written at /api/checkout/create-order time (before
 * payment), so that whichever path confirms the payment first — the client's
 * verify-payment call, or Razorpay's server-to-server webhook — has full
 * customer/cart context to work with, not just a payment ID.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Named uniquely (not __dirname) — see loadEnv.js for why: colliding names
// across files that all end up in the same Netlify function bundle broke
// the live function with a 502.
const orderStoreDir = path.dirname(fileURLToPath(import.meta.url));
const ORDERS_PATH = path.join(orderStoreDir, 'server-data', 'orders.json');

function readAll() {
  try {
    if (!fs.existsSync(ORDERS_PATH)) return [];
    const raw = fs.readFileSync(ORDERS_PATH, 'utf-8');
    return raw.trim() ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('[OrderStore] Failed to read server-data/orders.json — starting from an empty list:', err.message);
    return [];
  }
}

function writeAll(orders) {
  fs.mkdirSync(path.dirname(ORDERS_PATH), { recursive: true });
  fs.writeFileSync(ORDERS_PATH, JSON.stringify(orders, null, 2), 'utf-8');
}

/** Called right after a Razorpay order is created, before payment happens. */
export function savePendingOrder({ razorpayOrderId, amount, customer, cartItems }) {
  const orders = readAll();
  if (orders.some(o => o.razorpayOrderId === razorpayOrderId)) {
    console.warn(`[OrderStore] Pending record for ${razorpayOrderId} already exists — not overwriting.`);
    return;
  }
  orders.push({
    razorpayOrderId,
    razorpayPaymentId: null,
    referenceNumber: null,
    status: 'pending',
    amount,
    customer: customer ?? null,
    cartItems: cartItems ?? [],
    createdAt: new Date().toISOString(),
    paidAt: null,
    confirmedVia: null,
    printrove: null,
    emailSent: false,
  });
  writeAll(orders);
  console.log(`[OrderStore] Pending order recorded for Razorpay order ${razorpayOrderId} (₹${amount}).`);
}

export function findByRazorpayOrderId(razorpayOrderId) {
  return readAll().find(o => o.razorpayOrderId === razorpayOrderId) || null;
}

export function updateOrder(razorpayOrderId, patch) {
  const orders = readAll();
  const idx = orders.findIndex(o => o.razorpayOrderId === razorpayOrderId);
  if (idx === -1) {
    console.warn(`[OrderStore] updateOrder called for unknown order ${razorpayOrderId} — nothing to update.`);
    return null;
  }
  orders[idx] = { ...orders[idx], ...patch };
  writeAll(orders);
  return orders[idx];
}
