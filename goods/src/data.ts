/**
 * data.ts — Live product data loader
 *
 * Exports the same `products` and `categories` names all other files import.
 * No changes needed in Home.tsx, Collection.tsx, or ProductDetail.tsx.
 *
 * DATA PRIORITY at runtime:
 *   1. /products-cache.json (public/) — written by `npm run sync`, served
 *      statically. The React hook in useProductData.ts loads this at mount.
 *   2. STATIC_FALLBACK — embedded in the JS bundle, used until the cache
 *      loads, or permanently if the fetch fails.
 *
 * SYNC:
 *   Run `npm run sync` to pull latest products from Printrove.
 *   Run `npm run sync:watch` to keep it updated on a schedule.
 */

import type { Product, Category } from './types';

// ── Static fallback ──────────────────────────────────────────────────────────
// Mirrors the last-known good data so the site never breaks cold.
// This is intentionally the same shape — update when you rename categories.

// Empty static fallbacks — the site loads real data from products-cache.json.
// If the cache fetch fails, the site shows a clean empty state, never fake products.
export const STATIC_PRODUCTS: Product[] = [];

export const STATIC_CATEGORIES: Category[] = [];

// ── Synchronous exports (used directly by ProductDetail, Home, Collection) ───
// On initial bundle load these are the static fallback.
// Call `refreshProductData()` from App.tsx to update them from the cache.

export let products: Product[] = [...STATIC_PRODUCTS];
export let categories: Category[] = [...STATIC_CATEGORIES];

// Internal cache state (not exported to consumers)
let _cacheLoaded = false;
let _listeners: Array<() => void> = [];

/** Subscribe to cache load events (used by useProductData hook) */
export function onCacheLoaded(cb: () => void): () => void {
  _listeners.push(cb);
  if (_cacheLoaded) cb(); // already loaded — fire immediately
  return () => { _listeners = _listeners.filter(l => l !== cb); };
}

/**
 * Fetches /products-cache.json from the public directory at runtime.
 * On success, updates the module-level arrays and notifies subscribers.
 * On failure, leaves the static fallback in place — site stays up.
 *
 * Called once from App.tsx on mount.
 */
export async function loadProductCache(): Promise<void> {
  if (_cacheLoaded) return;

  try {
    // BASE_URL is "/goods/" in production, "/" in dev — this is a static
    // file under public/, not an app route, so it needs the same prefix
    // Vite gives bundled assets (unlike /api/* calls, which stay absolute).
    const res = await fetch(`${import.meta.env.BASE_URL}products-cache.json`, {
      // Cache for 5 minutes; a new sync will bust via file replacement
      cache: 'no-cache',
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json() as {
      products?: Product[];
      categories?: Category[];
      syncedAt?: string;
      source?: string;
    };

    if (Array.isArray(json.products) && json.products.length > 0) {
      products = json.products as Product[];
    }
    if (Array.isArray(json.categories) && json.categories.length > 0) {
      categories = json.categories as Category[];
    }

    const syncedAt = json.syncedAt ?? 'unknown';
    const src = json.source ?? 'cache';
    console.info(`[Albatross] Products loaded from ${src} (synced ${syncedAt}). ${products.length} products.`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[Albatross] Could not load products-cache.json (${msg}). Using static fallback.`);
  } finally {
    _cacheLoaded = true;
    _listeners.forEach(cb => cb());
  }
}
