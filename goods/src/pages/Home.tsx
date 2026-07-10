import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Star, Heart, CheckCircle } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import SocialProofBar from '../components/SocialProofBar';
import { products, categories } from '../data';
import SEO from '../components/SEO';
import { useProductData } from '../hooks/useProductData';

export default function Home() {
  // Triggers re-render when Printrove cache loads, so live data shows immediately
  useProductData();

  // Get dynamic listings from cached data
  const gridProducts = products.slice(0, 4); // 2x2 Dense Grid in Hero
  const handpickedProducts = products.filter(p => p.isTrending || p.isNew).slice(0, 2);
  const remainingProducts = products.slice(4, 12); // Extra products to browse

  return (
    <div className="flex flex-col gap-12 pb-20 relative overflow-hidden bg-transparent">
      <SEO
        title="Albatross Goods India | Premium Graphic Streetwear & Collectible Apparel"
        description="Discover art-led heavyweight graphic t-shirts and custom streetwear drops in India. Custom pressed on demand on premium 240 GSM organic blanks."
      />

      {/* ── PART 3: DENSE HERO & PRODUCT DISCOVERY ROW ───────────────────── */}
      <section
        className="relative max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-10 pt-4"
        aria-labelledby="hero-headline"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Headline, CTA & Handpicked Strip */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-2.5 py-1 bg-white/[0.03] border border-white/10 text-white/70 text-[8px] uppercase tracking-[0.3em] font-sans w-fit"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Live custom collection drops
            </motion.div>

            <motion.h1
              id="hero-headline"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-[36px] sm:text-[48px] lg:text-[56px] leading-[0.95] font-display font-bold uppercase tracking-tight"
            >
              Wear The
              <br />
              <span className="font-serif italic font-normal text-cyan-400 normal-case">
                Subculture.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-white/40 text-xs sm:text-sm max-w-sm leading-relaxed font-sans font-light"
            >
              Art-led graphic prints custom-pressed to order. Heavyweight 240 GSM organic cotton blanks engineered for fit and endurance.
            </motion.p>

            {/* Main Action CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-3"
            >
              <Link
                to="/collection"
                id="hero-shop-cta"
                className="px-6 py-3 bg-white text-black font-display font-bold uppercase text-[9px] tracking-[0.2em] hover:bg-cyan-400 transition-colors duration-300 shadow-[0_4px_15px_rgba(255,255,255,0.05)] rounded-sm"
              >
                Browse Releases
              </Link>
              <Link
                to="/request-design"
                className="px-6 py-3 border border-orange-500/35 text-orange-400 hover:bg-orange-500 hover:text-black font-display font-bold uppercase text-[9px] tracking-[0.2em] transition-all rounded-sm"
              >
                Request Custom
              </Link>
            </motion.div>

            {/* Handpicked / Curated For You Strip */}
            {handpickedProducts.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="pt-6 border-t border-white/5 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <Star className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
                  <span className="text-[8px] font-display font-bold uppercase tracking-[0.25em] text-white/50">
                    Handpicked For You
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  {handpickedProducts.map(product => (
                    <Link
                      key={product.id}
                      to={`/product/${product.slug}`}
                      className="group flex items-center gap-3 p-2 bg-white/[0.02] border border-white/5 hover:border-cyan-500/25 transition-all duration-300 rounded-sm"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-10 h-12 object-cover bg-black border border-white/10"
                      />
                      <div className="flex-1 min-w-0 text-left">
                        <h4 className="text-[10px] uppercase font-bold tracking-wider text-white group-hover:text-cyan-400 transition-colors truncate">
                          {product.name}
                        </h4>
                        <span className="text-[9px] font-mono text-white/30">{product.category}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono font-bold text-cyan-400 block">
                          ₹{product.price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[7px] text-green-400 uppercase tracking-widest font-bold">In Stock</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column: Dense Immediate Product Grid */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex justify-between items-baseline border-b border-white/5 pb-2">
              <span className="text-[8px] font-display font-bold uppercase tracking-[0.25em] text-cyan-400">
                ✦ CURRENT ARCHIVE FEEDS
              </span>
              <span className="text-[8px] font-mono uppercase tracking-widest text-white/30">
                Real Mockup Previews
              </span>
            </div>

            {gridProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {gridProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="aspect-square w-full border border-dashed border-white/10 flex flex-col items-center justify-center text-white/20 rounded-sm">
                <span className="text-xs font-serif italic mb-1">Catalog loading</span>
                <p className="text-[8px] uppercase tracking-widest">Awaiting dynamic Printrove sync feed</p>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* ── SOCIAL PROOF TESTIMONIALS MARQUEE ─────────────────────────────── */}
      <SocialProofBar />

      {/* ── SHOP BY CURATED COLLECTION SERIES ─────────────────────────────── */}
      <section
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 w-full"
        aria-labelledby="collections-title"
      >
        <div className="flex justify-between items-end mb-6 border-b border-white/5 pb-4">
          <div>
            <span className="text-[8px] font-display font-bold uppercase tracking-[0.25em] text-fuchsia-500 block mb-1">
              ✦ SHOP THE SERIES
            </span>
            <h2 id="collections-title" className="text-sm font-display font-bold uppercase tracking-wider text-white">
              Shop by Collection
            </h2>
          </div>
          <Link
            to="/collection"
            className="text-cyan-400 hover:text-fuchsia-500 transition-colors text-[9px] font-display font-bold uppercase tracking-wider flex items-center gap-1.5"
          >
            VIEW ALL CATALOG <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Dynamic Category card links */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.slice(0, 6).map((category, index) => (
            <Link
              key={category.id}
              to={`/collection?theme=${category.slug}`}
              className="group relative aspect-[3/4] overflow-hidden block bg-[#0a0a0a] border border-white/5 rounded-sm"
            >
              <img
                src={category.image}
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover opacity-40 transition-transform duration-700 group-hover:scale-103 group-hover:opacity-60 grayscale group-hover:grayscale-0"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              <div className="absolute bottom-4 left-4 right-4 flex flex-col text-left">
                <span className="text-white/30 text-[7px] font-mono tracking-widest block">
                  SERIES_0{index + 1}
                </span>
                <span className="text-white text-[10px] sm:text-[11px] font-display font-bold uppercase tracking-wider truncate">
                  {category.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── ADDITIONAL DISCOVERY LISTINGS (Denser browse) ─────────────────── */}
      {remainingProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 w-full">
          <div className="flex justify-between items-end mb-6 border-b border-white/5 pb-4">
            <div>
              <span className="text-[8px] font-display font-bold uppercase tracking-[0.25em] text-green-400 block mb-1">
                ✦ EXPLORE MORE RELEASES
              </span>
              <h2 className="text-sm font-display font-bold uppercase tracking-wider text-white">
                Archival Streetwear Archive
              </h2>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {remainingProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* ── ZINE QUALITY SPECS MANIFESTO ──────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 w-full border-t border-b border-white/5 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="text-left">
            <span className="text-[8px] font-display font-bold uppercase tracking-[0.25em] text-fuchsia-500 block mb-2">
              ✦ PRODUCTION PIPELINE
            </span>
            <h2 className="text-xl font-display font-bold uppercase tracking-wider text-white mb-3">
              Real-Time Custom Press
            </h2>
            <p className="text-white/40 text-xs leading-relaxed max-w-sm font-sans font-light">
              Every garment is prepared individually upon payment confirmation using high-fidelity water-based inks for durability and longevity.
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-left border-l border-white/10 pl-6 md:pl-12">
            <div>
              <span className="block text-[8px] text-white/30 uppercase tracking-widest mb-1">01 / Fabric</span>
              <span className="block text-xs uppercase font-display font-bold tracking-wider text-white">240GSM Heavy</span>
            </div>
            <div>
              <span className="block text-[8px] text-white/30 uppercase tracking-widest mb-1">02 / Press</span>
              <span className="block text-xs uppercase font-display font-bold tracking-wider text-white">Archival Press</span>
            </div>
            <div>
              <span className="block text-[8px] text-white/30 uppercase tracking-widest mb-1">03 / Model</span>
              <span className="block text-xs uppercase font-display font-bold tracking-wider text-white">On-Demand</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
