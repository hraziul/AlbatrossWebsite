/**
 * returnStore.js
 *
 * Durable log of return/replacement requests. Previously these were only
 * ever console.log'd — no record survived a server restart, and there's no
 * admin dashboard in this app, so a console line was genuinely the only
 * trace a request ever existed. Mirrors orderStore.js's pattern.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Named uniquely (not __dirname) — see loadEnv.js for why: colliding names
// across files that all end up in the same Netlify function bundle broke
// the live function with a 502.
//
// Also crash-proofed against import.meta.url being empty/undefined — true
// when Netlify's bundler outputs CommonJS (see loadEnv.js for the full
// explanation). Falls back to process.cwd() rather than throwing.
let returnStoreDir;
try {
  if (!import.meta.url) throw new Error('import.meta.url unavailable (bundled as CJS)');
  returnStoreDir = path.dirname(fileURLToPath(import.meta.url));
} catch {
  returnStoreDir = process.cwd();
}
const RETURNS_PATH = path.join(returnStoreDir, 'server-data', 'returns.json');

function readAll() {
  try {
    if (!fs.existsSync(RETURNS_PATH)) return [];
    const raw = fs.readFileSync(RETURNS_PATH, 'utf-8');
    return raw.trim() ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('[ReturnStore] Failed to read server-data/returns.json — starting from an empty list:', err.message);
    return [];
  }
}

function writeAll(returns) {
  try {
    fs.mkdirSync(path.dirname(RETURNS_PATH), { recursive: true });
    fs.writeFileSync(RETURNS_PATH, JSON.stringify(returns, null, 2), 'utf-8');
  } catch (err) {
    // Netlify Functions run on a read-only filesystem outside /tmp — this
    // JSON-file log only actually persists for traditional/local hosting.
    // Must not crash the request: the merchant/customer emails still fire
    // regardless (see appCore.js), so the return request isn't silently lost.
    console.error('[ReturnStore] Could not persist to server-data/returns.json (read-only filesystem?):', err.message);
  }
}

export function saveReturnRequest({ referenceNumber, orderId, reason, contact, comments }) {
  const returns = readAll();
  returns.push({
    referenceNumber,
    orderId,
    reason,
    contact,
    comments: comments || '',
    status: 'requested',
    createdAt: new Date().toISOString(),
  });
  writeAll(returns);
  console.log(`[ReturnStore] Return request recorded: ${referenceNumber} for order ${orderId}.`);
}

export function getAllReturnRequests() {
  return readAll();
}
