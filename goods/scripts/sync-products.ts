/**
 * sync-products.ts
 *
 * Fetches live product data from the Printrove API and writes it to
 * public/products-cache.json so the React app reads live data at runtime.
 *
 * Usage:
 *   npm run sync          — full sync, writes public/products-cache.json
 *   npm run sync:dry      — prints transformed data, writes nothing
 *
 * Environment variables (read from .env):
 *   PRINTROVE_EMAIL       — your Printrove account email
 *   PRINTROVE_PASSWORD    — your Printrove account password
 *
 * ── Actual API response shape (verified via live inspection) ─────────────────
 * GET /api/external/products returns an array of:
 * {
 *   id: number,                       ← design/product ID
 *   name: string,                     ← your product name
 *   product: {                        ← base garment details
 *     id: number,
 *     name: string                    ← e.g. "Half Sleeve Round Neck T-Shirt"
 *   },
 *   mockup: {
 *     front_mockup: string,           ← full-res front image URL (S3)
 *     back_mockup: string,            ← full-res back image URL (S3)
 *     front_mockup_thumbnail: string, ← thumbnail front (S3)
 *     back_mockup_thumbnail: string   ← thumbnail back (S3)
 *   }
 * }
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import { createRequire } from 'module';
const _require = createRequire(import.meta.url);

// ── Bootstrap ────────────────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

config({ path: path.join(ROOT, '.env') });

const isDryRun = process.argv.includes('--dry-run');
const BASE_URL = 'https://api.printrove.com';
const CACHE_PATH = path.join(ROOT, 'public', 'products-cache.json');
const BACKUP_PATH = path.join(ROOT, 'public', 'products-cache.backup.json');
const OVERRIDES_PATH = path.join(ROOT, 'scripts', 'price-overrides.json');

// ── Price + Category override map ────────────────────────────────────────────
// Loaded once at startup from scripts/price-overrides.json.
// Keys are Printrove product IDs (as strings).
interface OverrideEntry {
  price?: number;
  category?: string;
  _name?: string;  // human-readable label — ignored by code
}
interface OverrideMap {
  [id: string]: OverrideEntry | string; // string keys for _readme/_schema
}

function loadOverrides(): Record<string, OverrideEntry> {
  try {
    const raw = _require(OVERRIDES_PATH) as OverrideMap;
    // Strip metadata keys (prefixed with _)
    return Object.fromEntries(
      Object.entries(raw)
        .filter(([k]) => !k.startsWith('_'))
        .map(([k, v]) => [k, v as OverrideEntry])
    );
  } catch {
    console.warn('  ⚠  Could not load price-overrides.json — all prices will be 0.');
    return {};
  }
}

const OVERRIDES = loadOverrides();

// ── Printrove API types (real shapes from live inspection) ───────────────────

interface PrintroveTokenResponse {
  access_token: string;
  expires_at?: string;
}

/** The real shape of a product returned by GET /api/external/products */
interface PrintroveProduct {
  id: number;
  name: string;
  product?: {
    id: number;
    name: string; // base garment name, e.g. "Half Sleeve Round Neck T-Shirt"
  };
  mockup?: {
    front_mockup?: string;
    back_mockup?: string;
    front_mockup_thumbnail?: string;
    back_mockup_thumbnail?: string;
  };
  // Fields that may appear in other API versions or future responses
  description?: string;
  selling_price?: number;
  mrp?: number;
  base_price?: number;
  category?: string | { name: string };
  tags?: string[];
  gsm?: number;
  fabric?: string;
  fit?: string;
  weight?: number;
  // Populated separately via fetchProductVariants() — the list endpoint
  // doesn't include per-variant data, only GET /api/external/products/{id} does.
  variants?: RawPrintroveVariant[];
}

/** A single size/color SKU, from the `variants` array of GET /api/external/products/{id} */
interface RawPrintroveVariant {
  id: number;
  sku?: string;
  product?: {
    id?: number;
    name?: string;   // e.g. "Almond S Men Round"
    color?: string;  // e.g. "Almond"
    size?: string | null; // null for sizeless products like tote bags
  };
  mockup?: {
    front_mockup?: string;
    back_mockup?: string;
    front_mockup_thumbnail?: string;
    back_mockup_thumbnail?: string;
  };
}

interface PrintrovePaginatedResponse {
  data?: PrintroveProduct[];
  products?: PrintroveProduct[];
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  // Printrove's actual /api/external/products response nests pagination info
  // here (Laravel resource-collection shape) rather than at the top level.
  meta?: {
    current_page?: number;
    last_page?: number;
    per_page?: number | string;
    total?: number;
  };
}

interface ProductVariant {
  id: number;
  size?: string;      // absent for sizeless products (e.g. tote bags)
  color: string;
  colorCode: string;  // resolved hex swatch color — see COLOR_HEX_MAP
  stockStatus: string;
  image?: string;      // per-color mockup — lets the storefront swap photos on color change
  hoverImage?: string;
}

/** Shape written to products-cache.json — matches src/types.ts exactly */
interface CachedProduct {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  image: string;
  hoverImage?: string;
  isNew?: boolean;
  isTrending?: boolean;
  isBasic?: boolean;
  slug: string;
  details?: string[];
  baseProductId?: number;
  variants?: ProductVariant[];
  /** True when the Printrove base garment is the Women's Curved Fit pattern (vs. Unisex) */
  isWomens?: boolean;
}

interface CachedCategory {
  id: string;
  name: string;
  slug: string;
  image: string;
  accent?: string;
  glyph?: string;
  tagline?: string;
}

interface ProductCache {
  syncedAt: string;
  source: 'printrove';
  products: CachedProduct[];
  categories: CachedCategory[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80); // cap length
}

/**
 * Derive a clean product name by stripping the " | Albatross Goods India"
 * suffix that merchants sometimes append to product names in Printrove.
 */
function cleanName(raw: string): string {
  return raw
    .replace(/\s*\|\s*Albatross Goods India\s*$/i, '')
    .replace(/\s*\|\s*Albatross\s*$/i, '')
    .trim();
}

/**
 * Derive a short, friendly product name for display.
 * If the full name has multiple "|" segments, take the first one.
 */
function displayName(raw: string): string {
  let name = raw.split('|')[0].trim();
  // Truncate overly long comma-separated names to the first segment
  if (name.length > 60) {
    const commaSegment = name.split(',')[0].trim();
    if (commaSegment.length >= 15) name = commaSegment;
  }
  return name;
}

/**
 * Printrove's Women's garments use a distinct "Curved Fit" pattern with its own
 * size guide (e.g. Women's M = 36" bust vs. Unisex M = 40" chest) — same size
 * label, different actual measurements. Detected from the base garment name
 * Printrove returns, e.g. "Women's Half Sleeve Round Neck T-Shirt".
 */
function resolveIsWomens(p: PrintroveProduct): boolean {
  return /women/i.test(p.product?.name ?? '');
}

function resolvePrice(p: PrintroveProduct): number {
  const raw = p.selling_price ?? p.mrp ?? p.base_price ?? 0;
  // Printrove sometimes returns prices in paise — normalise
  return raw > 100000 ? Math.round(raw / 100) : raw;
}

function resolveImage(p: PrintroveProduct): string {
  return (
    p.mockup?.front_mockup ||
    p.mockup?.front_mockup_thumbnail ||
    p.mockup?.back_mockup ||
    p.mockup?.back_mockup_thumbnail ||
    ''
  );
}

function resolveHoverImage(p: PrintroveProduct): string | undefined {
  const back = p.mockup?.back_mockup || p.mockup?.back_mockup_thumbnail;
  const front = resolveImage(p);
  return back && back !== front ? back : undefined;
}

// Printrove returns color as a plain name (e.g. "Almond"), not a hex code.
// Maps their known garment/tote color names to a swatch color for the storefront.
// Unmapped names fall back to a neutral gray swatch rather than breaking the UI.
const COLOR_HEX_MAP: Record<string, string> = {
  'black': '#0a0a0a',
  'white': '#f5f5f5',
  'half white': '#efece4',
  'navy blue': '#1b2a4a',
  'navy': '#1b2a4a',
  'maroon': '#5c1a24',
  'olive': '#5c5a37',
  'olive green': '#5c5a37',
  'royal blue': '#1f4fa3',
  'red': '#a3221f',
  'yellow': '#e8c547',
  'golden yellow': '#d9a916',
  'grey melange': '#8a8a8a',
  'melange grey': '#8a8a8a',
  'charcoal grey': '#3a3a3a',
  'charcoal': '#3a3a3a',
  'grey': '#8a8a8a',
  'gray': '#8a8a8a',
  'almond': '#c9a77c',
  'beige': '#d9c7a3',
  'sand': '#d2b88a',
  'brown': '#5a3d2b',
  'green': '#2f5d3a',
  'bottle green': '#1f3d29',
  'pink': '#dd8fa5',
  'purple': '#5a3d7a',
  'orange': '#d9702e',
  'sky blue': '#7db9e8',
  'teal': '#1f6f6f',
};

function resolveColorHex(colorName: string | undefined): string {
  if (!colorName) return '#888888';
  return COLOR_HEX_MAP[colorName.trim().toLowerCase()] ?? '#888888';
}

/**
 * Maps Printrove's per-SKU `variants` array (fetched separately via
 * fetchProductVariants — the list endpoint doesn't include it) into the
 * storefront's ProductVariant shape. Each variant keeps its own mockup so
 * the product page can swap the displayed photo when the color changes.
 */
function resolveVariants(p: PrintroveProduct): ProductVariant[] {
  if (!p.variants || p.variants.length === 0) return [];
  return p.variants
    .filter(v => v.id != null)
    .map(v => ({
      id: v.id,
      size: v.product?.size ?? undefined,
      color: v.product?.color ?? 'Default',
      colorCode: resolveColorHex(v.product?.color),
      // Printrove is print-on-demand — there's no live inventory endpoint,
      // items are produced on order. This reflects that honestly rather
      // than fabricating stock counts the API doesn't provide.
      stockStatus: 'made_to_order',
      image: v.mockup?.front_mockup || v.mockup?.front_mockup_thumbnail || undefined,
      hoverImage: v.mockup?.back_mockup || v.mockup?.back_mockup_thumbnail || undefined,
    }));
}

function resolveCategoryName(p: PrintroveProduct): string {
  const textToScan = `${p.name} ${(p.description ?? '')}`.toLowerCase();
  
  // 1. Music Inspired
  const musicKeywords = [
    'pink floyd', 'floyd', 'doors', 'morrison', 'mraz', 'stones', 'simon', 'garfunkel', 
    'synthwave', 'synth', 'feeling', 'jealousy', 'brightside', 'song', 'lyrics', 
    'band', 'album', 'wave', 'music', 'sound', 'concert', 'soundtrack', 'beatles'
  ];
  if (musicKeywords.some(kw => textToScan.includes(kw))) {
    return 'Music Inspired';
  }

  // 2. Comics & Art
  const artKeywords = [
    'superman', 'dc', 'comic', 'panel', 'tintin', 'snowy', 'batman', 'hero', 
    'graphic', 'art', 'vintage', 'retro', 'drawing', 'illustration', 'sketch', 
    'collage', 'marvel', 'spiderman', 'canvas', 'ink', 'pop art'
  ];
  if (artKeywords.some(kw => textToScan.includes(kw))) {
    return 'Comics & Art';
  }

  // 3. Cult Cinema
  const cinemaKeywords = [
    'film', 'movie', 'director', 'cinema', 'kurosawa', 'silhouette', 'ophelia', 
    'river', 'surreal', 'scene', 'melting clock', 'screen', 'hollywood', 'classic scene'
  ];
  if (cinemaKeywords.some(kw => textToScan.includes(kw))) {
    return 'Cult Cinema';
  }

  // 4. Everyday Basics
  const basicKeywords = [
    'blank', 'basic', 'plain', 'solid', 'canvas', 'minimalist sun', 'sun rising'
  ];
  if (basicKeywords.some(kw => textToScan.includes(kw))) {
    return 'Everyday Basics';
  }

  // Fallback to Pop Culture
  return 'Pop Culture';
}

function buildDetails(p: PrintroveProduct): string[] {
  const details: string[] = [];
  if (p.product?.name) details.push(p.product.name);
  if (p.gsm && p.fabric) details.push(`${p.gsm} GSM ${p.fabric}`);
  else if (p.gsm) details.push(`${p.gsm} GSM Premium Fabric`);
  else if (p.fabric) details.push(p.fabric);
  if (p.fit) details.push(`${p.fit} Fit`);
  if (p.weight) details.push(`Approx. ${p.weight}g per unit`);
  return details;
}

/**
 * Builds the storefront description. Takes the FINAL resolved category
 * (post price-overrides.json) rather than re-deriving it from keywords —
 * otherwise a manually overridden category (e.g. price-overrides.json says
 * "Cult Cinema" but the keyword scan would auto-detect "Comics & Art" from
 * a stray word like "art") produces a description that contradicts the
 * category actually shown on the listing.
 */
function buildDescription(p: PrintroveProduct, finalCategory: string): string {
  if (p.description?.trim()) return p.description.trim();
  const name = displayName(p.name);
  const gsmNote = p.gsm ? ` Built on ${p.gsm} GSM premium fabric.` : '';
  return `${name} — a limited-edition piece from our ${finalCategory} collection.${gsmNote} Crafted for collectors who take quality seriously.`;
}

/** Transform a raw Printrove product into the site's CachedProduct shape */
function transformProduct(p: PrintroveProduct): CachedProduct {
  const tags = p.tags ?? [];
  const id = String(p.id);
  const fullName = cleanName(p.name);
  const override = OVERRIDES[id];

  // Price: Printrove API price (>0) takes precedence → override map fallback → 0
  const apiPrice = resolvePrice(p);
  const price = apiPrice > 0 ? apiPrice : (override?.price ?? 0);

  // Category: override map → garment-type inference
  const autoCategory = resolveCategoryName(p);
  const category = override?.category ?? autoCategory;

  if (price === 0) {
    console.warn(`  ⚠  No price returned from Printrove or override map for product ${id} ("${displayName(fullName).slice(0, 40)}")` +
      ` — add it to scripts/price-overrides.json`);
  }

  const finalName = displayName(fullName);
  const finalImage = resolveImage(p);
  const finalHoverImage = resolveHoverImage(p);
  const finalCategory = category;
  const finalSlug = slugify(finalName);

  // Image validation check
  if (!finalImage || finalImage.includes('placeholder') || finalImage.includes('blank')) {
    console.warn(`  [Flagged Record] Product ID ${id} (${finalName}) has an invalid or missing mockup: "${finalImage}"`);
  }

  return {
    id,
    name: finalName,
    price,
    description: buildDescription(p, finalCategory),
    category: finalCategory,
    image: finalImage,
    hoverImage: finalHoverImage,
    isNew: tags.some(t => t.toLowerCase() === 'new'),
    isTrending: tags.some(t => t.toLowerCase() === 'trending'),
    isBasic: tags.some(t => ['basic', 'basics'].includes(t.toLowerCase())),
    slug: finalSlug,
    details: buildDetails(p),
    isWomens: resolveIsWomens(p),
    // The base garment/product-type id Printrove's order API expects as
    // `product_id` on fulfillment — was never populated before, so checkout
    // always fell back to a hardcoded default regardless of the real garment.
    baseProductId: p.product?.id,
    variants: resolveVariants(p),
  };
}

/**
 * Derive unique categories from the transformed product list,
 * preserving fandom accent/glyph/tagline metadata by slug match.
 */
function deriveCategories(products: CachedProduct[]): CachedCategory[] {
  const fanomMeta: Record<string, Pick<CachedCategory, 'accent' | 'glyph' | 'tagline'>> = {
    'cinema':        { accent: '#22d3ee', glyph: '🎞', tagline: 'Screen-born legends' },
    'cult-cinema':   { accent: '#22d3ee', glyph: '🎞', tagline: 'Screen-born legends' },
    'music':         { accent: '#d946ef', glyph: '♫',  tagline: 'Audio-visual culture' },
    'music-inspired':{ accent: '#d946ef', glyph: '♫',  tagline: 'Audio-visual culture' },
    'comics':        { accent: '#facc15', glyph: '⚡', tagline: 'Panel to pavement' },
    'comics-art':    { accent: '#facc15', glyph: '⚡', tagline: 'Panel to pavement' },
    'trending':      { accent: '#4ade80', glyph: '↑',  tagline: 'What the collective wears' },
    'everyday-basics':{ accent: '#fb923c', glyph: '∞', tagline: 'Understated. Uncompromised.' },
    'basics':        { accent: '#fb923c', glyph: '∞',  tagline: 'Understated. Uncompromised.' },
    't-shirts':      { accent: '#22d3ee', glyph: '👕', tagline: 'The canvas for culture' },
    'hoodies':       { accent: '#d946ef', glyph: '🧥', tagline: 'Heavy. Warm. Considered.' },
    'apparel':       { accent: '#fb7185', glyph: '◈',  tagline: 'Curated premium pieces' },
    'jackets':       { accent: '#facc15', glyph: '◈',  tagline: 'Layer with intention' },
    'polo':          { accent: '#4ade80', glyph: '◈',  tagline: 'Refined casual' },
    'long-sleeve':   { accent: '#fb923c', glyph: '◈',  tagline: 'Extended edition' },
  };

  const seen = new Map<string, CachedCategory>();
  for (const product of products) {
    const name = product.category;
    const slug = slugify(name);
    if (seen.has(slug)) continue;
    const meta = fanomMeta[slug] ?? { accent: '#22d3ee' };
    seen.set(slug, {
      id: `cat-${slug}`,
      name,
      slug,
      image: product.image || '',
      ...meta,
    });
  }
  return Array.from(seen.values());
}

// ── API calls ─────────────────────────────────────────────────────────────────

async function authenticate(email: string, password: string): Promise<string> {
  console.log('  → Authenticating with Printrove...');
  const res = await fetch(`${BASE_URL}/api/external/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Auth failed (${res.status}): ${text}`);
  }
  const json = (await res.json()) as PrintroveTokenResponse;
  if (!json.access_token) throw new Error('Auth response missing access_token');
  const expiresAt = json.expires_at ? ` (expires ${json.expires_at})` : '';
  console.log(`  ✓ Token obtained${expiresAt}`);
  return json.access_token;
}

/** Fetch all products from GET /api/external/products, handling pagination */
async function fetchAllProducts(token: string): Promise<PrintroveProduct[]> {
  console.log('  → Fetching products from Printrove...');
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const allProducts: PrintroveProduct[] = [];
  let page = 1;
  let lastPage = 1;

  do {
    const url = `${BASE_URL}/api/external/products?page=${page}&per_page=20`;
    const res = await fetch(url, { headers });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Products fetch failed (${res.status}): ${text}`);
    }

    const json = (await res.json()) as PrintroveProduct[] | PrintrovePaginatedResponse;

    if (Array.isArray(json)) {
      // Flat array — no pagination
      allProducts.push(...json);
      break;
    }

    const pageItems = json.data ?? json.products ?? [];
    allProducts.push(...pageItems);
    // Printrove nests pagination under `meta` — fall back to a top-level
    // `last_page` only for API versions/responses that don't nest it.
    lastPage = json.meta?.last_page ?? json.last_page ?? 1;
    console.log(`     Page ${page}/${lastPage} — ${pageItems.length} products`);
    page++;
  } while (page <= lastPage);

  console.log(`  ✓ Fetched ${allProducts.length} products total`);
  return allProducts;
}

/**
 * The list endpoint (fetchAllProducts) doesn't include per-SKU variants —
 * only GET /api/external/products/{id} does. Fetched one product at a time
 * with a small delay to stay polite to the API; a failure on any single
 * product falls back to no variants for that product (storefront then falls
 * back to its generic size list) rather than failing the whole sync.
 */
async function fetchProductVariants(token: string, id: number): Promise<RawPrintroveVariant[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/external/products/${id}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { product?: { variants?: RawPrintroveVariant[] } };
    return json.product?.variants ?? [];
  } catch {
    return [];
  }
}

async function fetchAllVariants(token: string, products: PrintroveProduct[]): Promise<void> {
  console.log(`  → Fetching variants for ${products.length} products...`);
  let withVariants = 0;
  for (const p of products) {
    p.variants = await fetchProductVariants(token, p.id);
    if (p.variants.length > 0) withVariants++;
    // Small delay between requests — polite pacing, not a rate-limit workaround.
    await new Promise(r => setTimeout(r, 120));
  }
  console.log(`  ✓ Variants fetched for ${withVariants}/${products.length} products`);
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║   Albatross × Printrove — Product Sync       ║');
  console.log(`║   Mode: ${isDryRun ? 'DRY RUN (no files written)     ' : 'LIVE   (writes to public/)        '}║`);
  console.log('╚══════════════════════════════════════════════╝\n');

  const email = process.env.PRINTROVE_EMAIL;
  const password = process.env.PRINTROVE_PASSWORD;

  if (!email || !password) {
    console.error('✗ Missing environment variables.\n');
    console.error('  Add to your .env file:');
    console.error('    PRINTROVE_EMAIL=your@email.com');
    console.error('    PRINTROVE_PASSWORD=yourpassword\n');
    process.exit(1);
  }

  try {
    const token = await authenticate(email, password);
    const rawProducts = await fetchAllProducts(token);

    if (rawProducts.length === 0) {
      console.warn('\n⚠  Printrove returned 0 products. Keeping existing cache unchanged.\n');
      process.exit(0);
    }

    await fetchAllVariants(token, rawProducts);

    console.log('\n  → Transforming products...');
    const products = rawProducts.map(transformProduct);

    const categories = deriveCategories(products);
    console.log(`  ✓ ${products.length} products → ${categories.length} categories`);

    if (isDryRun) {
      console.log('\n── DRY RUN OUTPUT ──────────────────────────────\n');
      console.log('Categories:', JSON.stringify(categories, null, 2));
      console.log('\nProducts (first 3):');
      console.log(JSON.stringify(products.slice(0, 3), null, 2));
      if (products.length > 3) console.log(`\n... and ${products.length - 3} more products.`);
      console.log('\n✓ Dry run complete. No files written.\n');
      process.exit(0);
    }

    const cache: ProductCache = {
      syncedAt: new Date().toISOString(),
      source: 'printrove',
      products,
      categories,
    };

    // Back up the previous cache before overwriting
    if (fs.existsSync(CACHE_PATH)) {
      fs.copyFileSync(CACHE_PATH, BACKUP_PATH);
      console.log('  → Backed up previous cache to products-cache.backup.json');
    }

    fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
    fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2), 'utf-8');

    console.log(`\n✓ Sync complete at ${cache.syncedAt}`);
    console.log(`  Written: public/products-cache.json`);
    console.log(`  Products: ${products.length}`);
    console.log(`  Categories: ${categories.length}\n`);

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`\n✗ Sync failed: ${message}`);

    if (fs.existsSync(BACKUP_PATH)) {
      console.error('  Restoring from backup...');
      fs.copyFileSync(BACKUP_PATH, CACHE_PATH);
      console.error('  ✓ Backup restored. Site will serve last good data.\n');
    } else {
      console.error('  No backup available. Site will use the static fallback in data.ts.\n');
    }
    process.exit(1);
  }
}

main();
