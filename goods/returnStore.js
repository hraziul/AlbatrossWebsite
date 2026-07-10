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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RETURNS_PATH = path.join(__dirname, 'server-data', 'returns.json');

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
  fs.mkdirSync(path.dirname(RETURNS_PATH), { recursive: true });
  fs.writeFileSync(RETURNS_PATH, JSON.stringify(returns, null, 2), 'utf-8');
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
