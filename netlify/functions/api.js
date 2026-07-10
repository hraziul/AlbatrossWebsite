import serverless from 'serverless-http';
import app, { logConfigStatus } from '../../goods/appCore.js';

/**
 * api.js — Netlify Function
 *
 * Wraps the exact same Express app (appCore.js) used for local/traditional
 * hosting, so every /api/* route (checkout, webhook, newsletter, order
 * tracking/returns) works identically here as it does in `npm run dev:full`.
 * No route logic lives in this file — see appCore.js for that.
 *
 * netlify.toml redirects /api/* to this function with a plain rewrite (no
 * :splat), which is the standard pattern for "one function serves an entire
 * path prefix": Netlify preserves the ORIGINAL request path in event.path,
 * so Express sees "/api/checkout/create-order" unchanged, matching the
 * routes in appCore.js with zero path rewriting needed.
 *
 * The defensive normalization below guards against the one case where that
 * assumption could be wrong (event.path arriving prefixed with the
 * function's own invocation path instead) — cheap insurance, not the primary
 * mechanism.
 */

let configLogged = false;
const serverlessHandler = serverless(app);

export const handler = async (event, context) => {
  if (!configLogged) {
    logConfigStatus();
    configLogged = true;
  }

  const rawPath = event.path || event.rawPath || '';
  const apiIndex = rawPath.indexOf('/api/');
  if (apiIndex > 0) {
    // Something (an unexpected Netlify path-rewrite behavior) put a prefix
    // before "/api/" — strip it so Express's route matching still works.
    const normalized = rawPath.slice(apiIndex);
    if (event.path !== undefined) event.path = normalized;
    if (event.rawPath !== undefined) event.rawPath = normalized;
  }

  return serverlessHandler(event, context);
};
