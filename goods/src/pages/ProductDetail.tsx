import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { products } from '../data';
import SEO from '../components/SEO';
import { useProductData } from '../hooks/useProductData';
import { ChevronDown, X, Ruler, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';

// Source: Printrove official size guides (Unisex Regular Fit / Women's Curved Fit),
// verified against their product spec sheets. Do not edit without re-checking
// against Printrove — this exists specifically because customers previously
// ordered Unisex M and Women's M expecting the same fit and got different sizes.
const UNISEX_SIZE_CHART_ROWS = [
  { size: 'S', chest: '38', length: '26', sleeve: '7' },
  { size: 'M', chest: '40', length: '27', sleeve: '7.5' },
  { size: 'L', chest: '42', length: '28', sleeve: '8' },
  { size: 'XL', chest: '44', length: '29', sleeve: '8.5' },
  { size: '2XL', chest: '46', length: '30', sleeve: '9' },
  { size: '3XL', chest: '48', length: '31', sleeve: '9.5' },
  { size: '4XL', chest: '50', length: '32', sleeve: '10' },
  { size: '5XL', chest: '52', length: '33', sleeve: '10' },
];

const WOMENS_SIZE_CHART_ROWS = [
  { size: 'XS', chest: '32', length: '23', sleeve: '5.5' },
  { size: 'S', chest: '34', length: '24', sleeve: '6' },
  { size: 'M', chest: '36', length: '25', sleeve: '6.5' },
  { size: 'L', chest: '38', length: '26', sleeve: '7' },
  { size: 'XL', chest: '40', length: '27', sleeve: '7.5' },
  { size: '2XL', chest: '42', length: '28', sleeve: '8' },
  { size: '3XL', chest: '44', length: '29', sleeve: '8.5' },
  { size: '4XL', chest: '46', length: '30', sleeve: '9' },
  { size: '5XL', chest: '48', length: '31', sleeve: '9.5' },
];

const UNISEX_FALLBACK_SIZES = UNISEX_SIZE_CHART_ROWS.map(r => r.size);
const WOMENS_FALLBACK_SIZES = WOMENS_SIZE_CHART_ROWS.map(r => r.size);

function SizeChartModal({ isWomens, onClose }: { isWomens: boolean; onClose: () => void }) {
  const rows = isWomens ? WOMENS_SIZE_CHART_ROWS : UNISEX_SIZE_CHART_ROWS;
  const bustLabel = isWomens ? 'Bust (in)' : 'Chest (in)';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-md"
        aria-hidden="true"
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Size chart"
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[201] flex items-center justify-center p-4"
      >
        <div className="w-full max-w-sm bg-[#070707] border border-white/10 rounded-sm p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Ruler className="w-4 h-4 text-cyan-400" />
              <h2 className="text-xs font-display font-bold uppercase tracking-[0.2em] text-white">
                Size Chart
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 border border-white/10 hover:border-white/35 rounded-sm transition-all text-white/50 hover:text-white cursor-pointer"
              aria-label="Close size chart"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[9px] uppercase tracking-[0.2em] font-bold mb-4 text-fuchsia-400">
            {isWomens ? "Women's Curved Fit" : 'Unisex Regular Fit'}
          </p>

          <table className="w-full text-left mb-4">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-2 text-[9px] font-display uppercase tracking-widest text-white/40">Size</th>
                <th className="py-2 text-[9px] font-display uppercase tracking-widest text-white/40">{bustLabel}</th>
                <th className="py-2 text-[9px] font-display uppercase tracking-widest text-white/40">Length (in)</th>
                <th className="py-2 text-[9px] font-display uppercase tracking-widest text-white/40">Sleeve (in)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.size} className="border-b border-white/5">
                  <td className="py-2.5 text-xs font-bold text-white">{row.size}</td>
                  <td className="py-2.5 text-xs text-white/70 font-mono">{row.chest}"</td>
                  <td className="py-2.5 text-xs text-white/70 font-mono">{row.length}"</td>
                  <td className="py-2.5 text-xs text-white/70 font-mono">{row.sleeve}"</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="text-white/30 text-[10px] leading-relaxed font-sans font-light">
            Measured flat, {isWomens ? "Women's Curved" : 'Unisex Regular'} fit, ± 0.5" tolerance for hand-finished garments.
            {isWomens
              ? ' Runs smaller than our Unisex fit at the same letter size — e.g. Unisex M (40" chest) is closer to Women\'s XL (40" bust), not Women\'s M (36" bust).'
              : ' If you\'re between sizes, we recommend sizing up for an oversized streetwear fit.'}
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function ProductDetail() {
  // Re-renders after Printrove cache loads so slugs resolve correctly
  useProductData();

  const { slug } = useParams();
  const product = products.find(p => p.slug === slug);
  const { addToCart, setIsCartOpen } = useCart();
  
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);
  const [colorError, setColorError] = useState(false);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);

  // Reset selections when navigating between products so a size/color picked
  // on the previous product page doesn't silently carry over.
  useEffect(() => {
    setSelectedSize(null);
    setSelectedColor(null);
    setSizeError(false);
    setColorError(false);
  }, [product?.id]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center flex-col gap-6 bg-transparent">
        <span className="text-3xl font-serif italic text-white/30">This product is no longer available</span>
        <h1 className="text-sm font-display uppercase tracking-[0.2em] text-white">Product not found</h1>
        <Link to="/collection" className="text-cyan-400 hover:text-white transition-colors text-[9px] tracking-[0.2em] uppercase border border-white/10 px-5 py-2.5">
          BACK TO CATALOG
        </Link>
      </div>
    );
  }

  // ── Variant resolution (from Printrove-synced cache) ─────────────────────
  const variants = product.variants ?? [];
  const hasVariantData = variants.length > 0;

  // One representative variant per color (first match) — used for swatch
  // color and for swapping the product photo when a color is selected.
  const colorOptions = hasVariantData
    ? Array.from(new Map(variants.map(v => [v.color, v])).values())
    : [];
  // Only worth showing a picker if there's an actual choice to make —
  // a single-color product has nothing to "select".
  const showColorPicker = colorOptions.length > 1;

  // A color is "effectively" selected once picked, or automatically for
  // single-color products (nothing to choose, but still needed to resolve
  // the right image/variant/stock line).
  const effectiveColor = selectedColor ?? (colorOptions.length === 1 ? colorOptions[0].color : null);

  // Sizes available for the current color (falls back to all sizes across
  // variants if no color is selected yet, or the product has no colors at all).
  const sizeOptions = hasVariantData
    ? Array.from(new Set(
        variants
          .filter(v => !effectiveColor || v.color === effectiveColor)
          .map(v => v.size)
          .filter((s): s is string => !!s)
      ))
    : (product.isWomens ? WOMENS_FALLBACK_SIZES : UNISEX_FALLBACK_SIZES);
  // Sizeless products (tote bags, etc.) simply have no size variants at all —
  // don't render a size grid with nothing meaningful to pick.
  const showSizePicker = sizeOptions.length > 0;

  const activeVariant = hasVariantData && effectiveColor
    ? variants.find(v => v.color === effectiveColor && (!showSizePicker || v.size === selectedSize))
      ?? variants.find(v => v.color === effectiveColor)
    : undefined;

  const displayImage = activeVariant?.image || product.image;
  const displayHoverImage = activeVariant?.hoverImage || product.hoverImage;

  const readyToAdd = (!showColorPicker || !!effectiveColor) && (!showSizePicker || !!selectedSize);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6 bg-transparent min-h-screen">
      <SEO
        title={`${product.name} | Albatross Goods India`}
        description={`${product.description} Crafted from premium heavyweight organic cotton. Part of our exclusive custom streetwear series.`}
        image={product.image}
        schema={{
          "@context": "https://schema.org/",
          "@type": "Product",
          "name": product.name,
          "image": product.image ? (product.image.startsWith('http') ? [product.image] : [window.location.origin + product.image]) : [],
          "description": product.description,
          "sku": product.id,
          "offers": {
            "@type": "Offer",
            "url": window.location.href,
            "priceCurrency": "INR",
            "price": product.price > 0 ? product.price : 899,
            "availability": "https://schema.org/InStock",
            "itemCondition": "https://schema.org/NewCondition"
          }
        }}
      />
      
      {/* Back to Collection link */}
      <div className="mb-6">
        <Link to="/collection" className="text-white/40 hover:text-white text-[9px] tracking-[0.2em] uppercase transition-colors">
          ← BACK TO ARCHIVES
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* ── IMAGE GALLERY (Left Column) ─────────────────────────────────── */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-[3/4] bg-[#0d0d0d] border border-white/5 relative overflow-hidden">
            <div className="absolute inset-0 border-r border-b border-white/[0.01] pointer-events-none z-10" />
            {displayImage ? (
              <img
                key={displayImage}
                src={displayImage}
                alt={effectiveColor ? `${product.name} — ${effectiveColor}` : product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-[#0d0d0d] text-white/30 p-4">
                <span className="text-[14px] font-serif italic mb-1">Image Coming Soon</span>
                <span className="text-[9px] uppercase tracking-[0.2em] font-mono">Curation In Progress</span>
              </div>
            )}
          </div>
          {displayHoverImage && displayHoverImage !== displayImage && (
            <div className="aspect-[3/4] bg-[#0d0d0d] border border-white/5 relative overflow-hidden">
              <div className="absolute inset-0 border-r border-b border-white/[0.01] pointer-events-none z-10" />
              <img
                key={displayHoverImage}
                src={displayHoverImage}
                alt={`${product.name} alternate view`}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* ── CONVERSION & BUY PANEL (Right Column) ────────────────────────── */}
        <div className="lg:col-span-5 flex flex-col justify-start lg:sticky lg:top-24">
          
          {/* Headline details */}
          <div className="border-b border-white/5 pb-5 mb-5">
            <span className="text-fuchsia-500 font-serif italic text-xs tracking-wider block mb-2">
              {product.category}
            </span>
            <h1 className="text-2xl sm:text-3xl font-display font-bold uppercase tracking-tight leading-tight text-white mb-3">
              {product.name}
            </h1>
            <div className="text-xl font-mono text-cyan-400 font-medium">
              {product.price > 0 ? `₹${product.price.toLocaleString('en-IN')}` : 'Price on Request'}
            </div>
          </div>

          {/* Color Selection — only rendered when there's an actual choice (2+ colors) */}
          {showColorPicker && (
            <div className="mb-5">
              <span className={`font-display font-bold uppercase tracking-[0.2em] text-[8px] block mb-2 ${colorError ? 'text-red-400' : 'text-white/30'}`}>
                {colorError ? 'Please select a color' : `Select Color${effectiveColor ? ` — ${effectiveColor}` : ''}`}
              </span>
              <div className={`flex flex-wrap gap-2 p-1 rounded-sm border ${colorError ? 'border-red-500/40 bg-red-500/5 animate-pulse' : 'border-transparent'}`}>
                {colorOptions.map(variant => (
                  <button
                    key={variant.color}
                    type="button"
                    onClick={() => {
                      setSelectedColor(variant.color);
                      setColorError(false);
                      // A different color can have a different size range — drop a size
                      // pick that no longer applies rather than silently keeping it.
                      if (selectedSize && !variants.some(v => v.color === variant.color && v.size === selectedSize)) {
                        setSelectedSize(null);
                      }
                    }}
                    aria-pressed={effectiveColor === variant.color}
                    title={variant.color}
                    className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer ${
                      effectiveColor === variant.color
                        ? 'border-cyan-400 scale-110 shadow-[0_0_0_2px_rgba(0,0,0,1),0_0_0_3px_rgba(34,211,238,0.5)]'
                        : 'border-white/15 hover:border-white/40'
                    }`}
                    style={{ backgroundColor: variant.colorCode }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size Selection — hidden entirely for sizeless products (e.g. tote bags) */}
          {showSizePicker && (
            <div className="mb-6">
              {product.isWomens && (
                <div className="flex items-start gap-2 px-3 py-2.5 mb-3 bg-fuchsia-500/10 border border-fuchsia-500/30 rounded-sm">
                  <AlertTriangle className="w-3.5 h-3.5 text-fuchsia-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-fuchsia-200 leading-relaxed">
                    <strong>Women's Curved Fit</strong> — sizing differs from our Unisex tees at the same letter size (e.g. Women's M ≠ Unisex M). Please check the{' '}
                    <button
                      type="button"
                      onClick={() => setIsSizeChartOpen(true)}
                      className="underline hover:text-white cursor-pointer"
                    >
                      size guide
                    </button>{' '}
                    before ordering.
                  </p>
                </div>
              )}
              <div className="flex justify-between items-center mb-2">
                <span className={`font-display font-bold uppercase tracking-[0.2em] text-[8px] ${sizeError ? 'text-red-400' : 'text-white/30'}`}>
                  {sizeError ? 'Please select a size' : 'Select Size'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsSizeChartOpen(true)}
                  className="text-[8px] text-white/30 hover:text-cyan-400 uppercase tracking-[0.2em] transition-colors cursor-pointer"
                >
                  Size Chart
                </button>
              </div>

              <div className={`grid grid-cols-5 gap-2 p-1 rounded-sm border ${sizeError ? 'border-red-500/40 bg-red-500/5 animate-pulse' : 'border-transparent'}`}>
                {sizeOptions.map(size => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      setSelectedSize(size);
                      setSizeError(false);
                    }}
                    className={`py-3 text-center text-xs font-sans transition-all border rounded-sm ${
                      selectedSize === size
                        ? 'bg-white text-black border-white font-bold'
                        : 'border-white/10 text-white hover:border-cyan-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Availability feedback for the current selection — Printrove is print-on-demand
              (no live inventory API), so this confirms production readiness rather than a
              fabricated stock count. */}
          {readyToAdd && (
            <div className="flex items-center gap-2 mb-4 text-[9px] uppercase tracking-[0.2em] text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>
                {[effectiveColor, selectedSize].filter(Boolean).join(' / ') || 'Available'} — made to order, ships within 48 hrs
              </span>
            </div>
          )}

          {/* Buy CTA */}
          <button
            onClick={() => {
              let blocked = false;
              if (showSizePicker && !selectedSize) {
                setSizeError(true);
                blocked = true;
              }
              if (showColorPicker && !effectiveColor) {
                setColorError(true);
                blocked = true;
              }
              if (blocked) return;

              // Tied to the exact selected variant (not just the base product) so
              // fulfillment produces the right size/color instead of a fallback default.
              addToCart(product, selectedSize ?? '', effectiveColor ?? undefined, activeVariant?.id);
              setIsCartOpen(true);
            }}
            className="w-full py-4 bg-white text-black font-display font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-cyan-400 transition-colors duration-300 shadow-[0_4px_15px_rgba(255,255,255,0.05)] mb-6"
          >
            ADD TO CART
          </button>

          {/* Trust Cue */}
          <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-white/40 mb-8 border-b border-white/5 pb-6">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span>Archival screen-printed in India // Limited run drops</span>
          </div>

          {/* ── PROGRESSIVE DISCLOSURES (Accordions) ────────────────────────── */}
          <div className="space-y-4 font-sans font-light">
            
            {/* Description Dropdown */}
            <details className="group border-b border-white/5 pb-4" open>
              <summary className="flex justify-between items-center cursor-pointer list-none text-[9px] font-display font-bold uppercase tracking-[0.25em] text-white/50 hover:text-white">
                <span>The Story</span>
                <ChevronDown className="w-3.5 h-3.5 transition-transform duration-300 group-open:rotate-180" />
              </summary>
              <div className="mt-3 text-white/50 text-xs leading-relaxed">
                {product.description}
              </div>
            </details>

            {/* Specifications Dropdown */}
            <details className="group border-b border-white/5 pb-4">
              <summary className="flex justify-between items-center cursor-pointer list-none text-[9px] font-display font-bold uppercase tracking-[0.25em] text-white/50 hover:text-white">
                <span>Specifications</span>
                <ChevronDown className="w-3.5 h-3.5 transition-transform duration-300 group-open:rotate-180" />
              </summary>
              <div className="mt-3 text-white/50 text-xs leading-relaxed space-y-2">
                {product.details?.map((detail, idx) => (
                  <div key={idx} className="flex items-center gap-2.5">
                    <div className="w-1 h-1 bg-fuchsia-500 rounded-full shadow-[0_0_8px_rgba(217,70,239,0.8)]" />
                    <span>{detail}</span>
                  </div>
                ))}
                 {(!product.details || product.details.length === 0) && (
                  <div className="flex items-center gap-2.5">
                    <div className="w-1 h-1 bg-fuchsia-500 rounded-full" />
                    <span>Premium Heavyweight Cotton Canvas Blank</span>
                  </div>
                )}
              </div>
            </details>

            {/* Shipping & Returns Dropdown */}
            <details className="group border-b border-white/5 pb-4">
              <summary className="flex justify-between items-center cursor-pointer list-none text-[9px] font-display font-bold uppercase tracking-[0.25em] text-white/50 hover:text-white">
                <span>Shipping & Returns</span>
                <ChevronDown className="w-3.5 h-3.5 transition-transform duration-300 group-open:rotate-180" />
              </summary>
              <div className="mt-3 text-white/50 text-xs leading-relaxed space-y-2">
                <div>✦ Dispatched within 48 hours of payment verification.</div>
                <div>✦ Fully tracked delivery across India.</div>
                <div>✦ Due to the limited nature of our drops, items are custom-pressed to order. Exchanges are accepted only for damage or printing errors.</div>
              </div>
            </details>

          </div>

        </div>
      </div>

      {isSizeChartOpen && (
        <SizeChartModal isWomens={!!product.isWomens} onClose={() => setIsSizeChartOpen(false)} />
      )}
    </div>
  );
}
