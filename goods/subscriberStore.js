/**
 * subscriberStore.js
 *
 * Durable, server-side newsletter signup log. Previously the welcome popup
 * saved emails only to the customer's own browser localStorage — nothing
 * ever reached the business. Every signup before this file existed is
 * unrecoverable (it was never sent anywhere). This is a minimal, dependency-free
 * safety net: every signup is appended here the moment it's submitted, so
 * nothing is lost even before/without a real newsletter platform connected.
 *
 * This is NOT a replacement for a real ESP (Mailchimp/Klaviyo/Brevo etc.) —
 * it has no unsubscribe handling, no bounce handling, no send capability.
 * It's the durability floor: a real list of who signed up and when, kept on
 * the server, that survives regardless of what marketing tool gets wired up
 * next.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SUBSCRIBERS_PATH = path.join(__dirname, 'server-data', 'subscribers.json');

function readAll() {
  try {
    if (!fs.existsSync(SUBSCRIBERS_PATH)) return [];
    const raw = fs.readFileSync(SUBSCRIBERS_PATH, 'utf-8');
    return raw.trim() ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('[SubscriberStore] Failed to read server-data/subscribers.json — starting from an empty list:', err.message);
    return [];
  }
}

function writeAll(subscribers) {
  fs.mkdirSync(path.dirname(SUBSCRIBERS_PATH), { recursive: true });
  fs.writeFileSync(SUBSCRIBERS_PATH, JSON.stringify(subscribers, null, 2), 'utf-8');
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Adds a subscriber if not already present (case-insensitive dedupe).
 * Returns { added: boolean, alreadySubscribed: boolean }.
 * Throws only for a genuinely invalid email — never for "already subscribed"
 * (that's a normal, expected case, not an error).
 */
export function addSubscriber(rawEmail, source = 'welcome_modal') {
  const email = String(rawEmail || '').trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    throw new Error('Invalid email address.');
  }

  const subscribers = readAll();
  if (subscribers.some(s => s.email === email)) {
    return { added: false, alreadySubscribed: true };
  }

  subscribers.push({
    email,
    source,
    consented: true, // implied by submitting the signup form — see WelcomeModal disclosure copy
    subscribedAt: new Date().toISOString(),
  });
  writeAll(subscribers);
  console.log(`[SubscriberStore] New signup: ${email} (source: ${source}). Total: ${subscribers.length}.`);
  return { added: true, alreadySubscribed: false };
}

export function getAllSubscribers() {
  return readAll();
}
