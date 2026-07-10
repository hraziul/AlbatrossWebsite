/**
 * loadEnv.js
 *
 * Must be the FIRST import in server.js, before orderStore.js / emailService.js /
 * subscriberStore.js / returnStore.js. Those modules read process.env at their
 * own top level (e.g. `const SMTP_HOST = process.env.SMTP_HOST || ''`) — in ES
 * modules, imports execute before the importing file's own body, so if dotenv's
 * config() call lived in server.js itself (after its imports), every local
 * module would already have evaluated its env-derived constants against an
 * empty process.env by the time config() ran. Isolating the config() call in
 * its own module and importing it first guarantees it runs before anything
 * that depends on it.
 */
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

// Named uniquely (not __dirname) — when Netlify's function bundler packs
// this file together with orderStore.js/returnStore.js/subscriberStore.js
// (all imported transitively via appCore.js) into one bundle, multiple
// modules each declaring `const __dirname = ...` at top level collide in
// the flattened scope: "Identifier '__dirname' has already been declared".
// This broke the live function with a 502 until each file got its own name.
//
// Netlify's function bundler outputs CommonJS, not ESM — import.meta.url is
// empty/undefined there (esbuild warns "import.meta is not available with
// the cjs output format"), so fileURLToPath(import.meta.url) throws a
// TypeError. That crashed the live function a second time after the rename
// above. Fall back to process.cwd() instead of assuming ESM always applies;
// it doesn't matter much here anyway — .env is gitignored and never reaches
// Netlify, so this call is a harmless no-op in that environment regardless
// of what path it resolves to.
let envDir;
try {
  if (!import.meta.url) throw new Error('import.meta.url unavailable (bundled as CJS)');
  envDir = path.dirname(fileURLToPath(import.meta.url));
} catch {
  envDir = process.cwd();
}
config({ path: path.join(envDir, '.env') });
