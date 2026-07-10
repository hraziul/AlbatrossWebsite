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
const envDir = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(envDir, '.env') });
