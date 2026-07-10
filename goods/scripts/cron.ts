/**
 * cron.ts
 *
 * Runs sync-products.ts on a repeating schedule.
 * Designed to run as a persistent background process.
 *
 * Usage:
 *   npm run sync:watch
 *
 * Environment variables:
 *   PRINTROVE_SYNC_INTERVAL_HOURS   default: 6
 *
 * Stop with Ctrl+C or kill the process.
 * In production, wrap this with PM2, systemd, or a cloud scheduler.
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

config({ path: path.join(ROOT, '.env') });

const INTERVAL_HOURS = Number(process.env.PRINTROVE_SYNC_INTERVAL_HOURS ?? 6);
const INTERVAL_MS = INTERVAL_HOURS * 60 * 60 * 1000;
const SYNC_SCRIPT = path.join(__dirname, 'sync-products.ts');

function timestamp() {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

function runSync(): Promise<number> {
  return new Promise((resolve) => {
    console.log(`\n[${timestamp()}] Starting scheduled sync...`);
    const child = spawn('npx', ['tsx', SYNC_SCRIPT], {
      stdio: 'inherit',
      cwd: ROOT,
    });
    child.on('close', (code) => {
      const exitCode = code ?? 1;
      if (exitCode === 0) {
        console.log(`[${timestamp()}] ✓ Sync succeeded. Next run in ${INTERVAL_HOURS}h.\n`);
      } else {
        console.error(`[${timestamp()}] ✗ Sync exited with code ${exitCode}. Will retry at next interval.\n`);
      }
      resolve(exitCode);
    });
  });
}

async function main() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║   Albatross × Printrove — Scheduled Sync Daemon  ║');
  console.log(`║   Interval: every ${INTERVAL_HOURS}h                              ║`);
  console.log('╚══════════════════════════════════════════════════╝');
  console.log(`\nPress Ctrl+C to stop.\n`);

  // Run immediately on start
  await runSync();

  // Then repeat on interval
  setInterval(runSync, INTERVAL_MS);
}

main();
