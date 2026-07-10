import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag, ArrowRight, ShieldCheck, HelpCircle, FileText, ChevronDown, ChevronUp, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';
import CartDrawer from './CartDrawer';
import { useProductData } from '../hooks/useProductData';

// Helper to determine top-level group and subcategory from synced product data
function getProductHierarchy(product: any) {
  const detail = (product.details?.[0] || '').toLowerCase();
  const name = product.name.toLowerCase();

  let group = 'Topwear';
  let sub = 'T-Shirts';

  if (detail.includes('tote') || detail.includes('bag') || name.includes('tote') || name.includes('bag')) {
    group = 'Accessories';
    sub = 'Tote Bags';
  } else if (detail.includes('hoodie') || name.includes('hoodie')) {
    group = 'Topwear';
    sub = 'Hoodies';
  } else if (detail.includes('sweatshirt') || name.includes('sweatshirt')) {
    group = 'Topwear';
    sub = 'Sweatshirts';
  }

  return { group, sub };
}

export default function Header() {
  // Extract up-to-date products and categories reactively from hook state
  const { products: hookProducts, categories: hookCategories } = useProductData();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Expandable sections for the drawer
  const [isStylesExpanded, setIsStylesExpanded] = useState(true);
  const [isCollectionsExpanded, setIsCollectionsExpanded] = useState(true);
  const [isSupportExpanded, setIsSupportExpanded] = useState(true);

  const { cartCount, isCartOpen, setIsCartOpen } = useCart();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close side menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Trap focus and handle escape key to close menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Lock background scroll
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // Derive dynamic hierarchy from real catalog data
  const themes = hookCategories.map(cat => ({
    name: cat.name,
    slug: cat.slug,
    path: `/collection?theme=${cat.slug}`
  }));

  const productGroups: Record<string, Set<string>> = {};
  hookProducts.forEach(p => {
    const { group, sub } = getProductHierarchy(p);
    if (!productGroups[group]) {
      productGroups[group] = new Set();
    }
    productGroups[group].add(sub);
  });

  const hasNavigationItems = themes.length > 0 || Object.keys(productGroups).length > 0;

  return (
    <>
      <header
        className={`fixed top-0 w-full z-[80] transition-all duration-300 border-b border-white/5 ${
          isScrolled || isMenuOpen ? 'bg-black/95 backdrop-blur-xl' : 'bg-black/45 backdrop-blur-xl'
        }`}
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-[64px] flex justify-between items-center">
          {/* Left: Brand Logo & Hamburger Side Drawer Toggle */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="group flex items-center gap-3 px-4 py-2 border border-white/10 bg-white/5 hover:border-cyan-400/40 hover:bg-cyan-500/5 transition-all duration-300 rounded-sm cursor-pointer"
              aria-label="Open side navigation drawer"
            >
              <Menu className="w-4 h-4 text-white/70 group-hover:text-cyan-400 transition-colors" />
              <span className="text-[10px] font-display font-bold uppercase tracking-[0.2em] text-white/80 group-hover:text-cyan-400 transition-colors">
                MENU
              </span>
            </button>

            <Link to="/" className="flex items-center gap-2.5 shrink-0" aria-label="Albatross Goods India home">
              <div className="w-7 h-7 bg-white flex items-center justify-center">
                <div className="w-3.5 h-3.5 border-2 border-black rotate-45" />
              </div>
              <span className="text-[15px] sm:text-[17px] font-bold tracking-tighter uppercase text-white">
                Albatross <span className="text-cyan-400">Goods</span>
              </span>
            </Link>
          </div>

          {/* Right: Catalog shortcut & Cart toggle */}
          <div className="flex items-center gap-4">
            <Link
              to="/collection"
              className="text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors font-bold mr-2 hidden sm:block"
            >
              Catalog
            </Link>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative group cursor-pointer"
              aria-label={`Open cart, ${cartCount} items`}
            >
              <div className="w-9 h-9 border border-white/10 rounded-full flex items-center justify-center bg-white/5 group-hover:border-cyan-500/40 group-hover:bg-cyan-500/5 transition-all duration-200">
                <ShoppingBag className="w-4 h-4 text-white/60 group-hover:text-cyan-400 transition-colors" />
              </div>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-400 text-black text-[8px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Dynamic Side Menu Drawer Overlay — rendered as a sibling of <header>, NOT
          nested inside it. <header> has `backdrop-blur-xl`, and backdrop-filter on
          an ancestor creates a new CSS containing block for `position: fixed`
          descendants — so a fixed, h-full drawer nested inside it resolves its
          height against the header's own ~64px height instead of the viewport,
          clipping the entire drawer body down to an invisible sliver. */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop with fade-in and click-out */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMenuOpen(false)}
                className="fixed inset-0 bg-black z-[99] backdrop-blur-xs"
              />

              {/* Side Drawer Panel */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 left-0 h-full w-[330px] max-w-full bg-[#070707] border-r border-white/10 z-[100] overflow-y-auto flex flex-col shadow-[10px_0_40px_rgba(0,0,0,0.8)]"
              >
                {/* Drawer Header */}
                <div className="p-5 border-b border-white/10 flex items-center justify-between">
                  <Link to="/" className="flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                    <div className="w-5.5 h-5.5 bg-white flex items-center justify-center">
                      <div className="w-2.5 h-2.5 border-2 border-black rotate-45" />
                    </div>
                    <span className="text-xs font-bold tracking-tighter uppercase text-white">
                      Albatross <span className="text-cyan-400">Goods</span>
                    </span>
                  </Link>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-1.5 border border-white/10 hover:border-white/35 rounded-sm transition-all text-white/50 hover:text-white cursor-pointer"
                    aria-label="Close side menu"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Drawer Body Scroll */}
                <div className="flex-1 p-6 space-y-8 select-none text-left">
                  
                  {/* Clean Fallback if no navigation data loaded yet */}
                  {!hasNavigationItems ? (
                    <div className="py-20 text-center space-y-4">
                      <span className="text-white/30 text-xs italic block">
                        Navigation temporarily unavailable.
                      </span>
                      <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 border border-white/10 hover:border-white/45 text-white/80 hover:text-white text-[9px] uppercase tracking-wider font-bold transition-all rounded-sm cursor-pointer"
                      >
                        Reload Cache
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Static Core Page Navigation (Home / Catalog / Custom Request) */}
                      <div className="space-y-2">
                        <span className="text-[8px] font-display font-bold uppercase tracking-[0.25em] text-white/30 block border-b border-white/5 pb-1">
                          Explore Store
                        </span>
                        <ul className="space-y-2 pt-1">
                          <li>
                            <Link 
                              to="/" 
                              className="text-[12px] uppercase tracking-wider font-bold text-white/80 hover:text-cyan-400 transition-colors"
                            >
                              Home Page
                            </Link>
                          </li>
                          <li>
                            <Link 
                              to="/collection" 
                              className="text-[12px] uppercase tracking-wider font-bold text-white/80 hover:text-cyan-400 transition-colors"
                            >
                              All Drops Catalog
                            </Link>
                          </li>
                        </ul>
                      </div>

                      {/* 1. Expandable Apparel Styles */}
                      <div className="space-y-3">
                        <button
                          onClick={() => setIsStylesExpanded(!isStylesExpanded)}
                          className="w-full flex justify-between items-center text-[10px] font-display font-bold uppercase tracking-[0.25em] text-cyan-400 border-b border-white/5 pb-2 cursor-pointer"
                        >
                          <span>Style & Apparel</span>
                          {isStylesExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                        
                        <AnimatePresence initial={false}>
                          {isStylesExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden space-y-4 pl-1"
                            >
                              {Object.entries(productGroups).map(([group, subs]) => (
                                <div key={group} className="space-y-1.5 mt-2">
                                  <span className="text-[9px] font-display font-bold uppercase tracking-widest text-white/35">
                                    {group}
                                  </span>
                                  <ul className="space-y-2 pl-2.5 border-l border-white/5">
                                    {Array.from(subs).map(sub => (
                                      <li key={sub}>
                                        <Link
                                          to={`/collection?type=${encodeURIComponent(sub)}`}
                                          className="text-[11px] uppercase tracking-wider font-bold text-white/70 hover:text-cyan-400 transition-colors block"
                                        >
                                          {sub}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* 2. Expandable Themes & Collections */}
                      <div className="space-y-3">
                        <button
                          onClick={() => setIsCollectionsExpanded(!isCollectionsExpanded)}
                          className="w-full flex justify-between items-center text-[10px] font-display font-bold uppercase tracking-[0.25em] text-fuchsia-400 border-b border-white/5 pb-2 cursor-pointer"
                        >
                          <span>Themes & series</span>
                          {isCollectionsExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        <AnimatePresence initial={false}>
                          {isCollectionsExpanded && (
                            <motion.ul
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden space-y-3 pl-1.5 mt-2"
                            >
                              {themes.map(theme => (
                                <li key={theme.slug}>
                                  <Link
                                    to={theme.path}
                                    className="group flex items-center justify-between text-[11px] uppercase tracking-widest font-bold text-white/75 hover:text-fuchsia-400 transition-colors"
                                  >
                                    <span>{theme.name}</span>
                                    <ArrowRight className="w-3 h-3 text-fuchsia-400 translate-x-[-4px] opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                                  </Link>
                                </li>
                              ))}
                              {hookProducts.some(p => p.isTrending) && (
                                <li>
                                  <Link
                                    to="/collection?category=trending"
                                    className="group flex items-center justify-between text-[11px] uppercase tracking-widest font-bold text-white/75 hover:text-green-400 transition-colors"
                                  >
                                    <span>Trending Drops</span>
                                    <ArrowRight className="w-3 h-3 text-green-400 translate-x-[-4px] opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                                  </Link>
                                </li>
                              )}
                              {hookProducts.some(p => p.isBasic) && (
                                <li>
                                  <Link
                                    to="/collection?category=everyday-basics"
                                    className="group flex items-center justify-between text-[11px] uppercase tracking-widest font-bold text-white/75 hover:text-orange-400 transition-colors"
                                  >
                                    <span>Everyday Basics</span>
                                    <ArrowRight className="w-3 h-3 text-orange-400 translate-x-[-4px] opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                                  </Link>
                                </li>
                              )}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* 3. Expandable Support & Actions */}
                      <div className="space-y-3">
                        <button
                          onClick={() => setIsSupportExpanded(!isSupportExpanded)}
                          className="w-full flex justify-between items-center text-[10px] font-display font-bold uppercase tracking-[0.25em] text-white/40 border-b border-white/5 pb-2 cursor-pointer"
                        >
                          <span>Support & Help</span>
                          {isSupportExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        <AnimatePresence initial={false}>
                          {isSupportExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden space-y-3 pl-1.5 mt-2"
                            >
                              <Link
                                to="/about"
                                className="flex items-center gap-2.5 text-[11px] uppercase tracking-wider font-bold text-white/70 hover:text-white transition-colors"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                About Us
                              </Link>
                              <Link
                                to="/contact"
                                className="flex items-center gap-2.5 text-[11px] uppercase tracking-wider font-bold text-white/70 hover:text-white transition-colors"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                Contact Us
                              </Link>
                              <Link
                                to="/help"
                                className="flex items-center gap-2.5 text-[11px] uppercase tracking-wider font-bold text-white/70 hover:text-white transition-colors"
                              >
                                <HelpCircle className="w-3.5 h-3.5" />
                                FAQs
                              </Link>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* High Contrast Service Action Cues (Side Menu pop buttons) */}
                      <div className="space-y-3.5 pt-4 border-t border-white/10">
                        <Link
                          to="/track"
                          className="flex items-center justify-between px-4 py-3 border border-cyan-500/25 bg-cyan-500/5 text-cyan-400 hover:text-white hover:border-cyan-400 hover:bg-cyan-500/10 text-[10px] uppercase tracking-[0.15em] font-bold transition-all rounded-sm"
                        >
                          <span className="flex items-center gap-2">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Track Order
                          </span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>

                        <Link
                          to="/returns"
                          className="flex items-center justify-between px-4 py-3 border border-fuchsia-500/25 bg-fuchsia-500/5 text-fuchsia-400 hover:text-white hover:border-fuchsia-400 hover:bg-fuchsia-500/10 text-[10px] uppercase tracking-[0.15em] font-bold transition-all rounded-sm"
                        >
                          <span className="flex items-center gap-2">
                            <RotateCcwIcon className="w-3.5 h-3.5" />
                            Return Request
                          </span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>

                        {/* Pop Request Design CTA visually to match tracking and returns */}
                        <Link
                          to="/request-design"
                          className="flex items-center justify-between px-4 py-3 border border-orange-500/25 bg-orange-500/5 text-orange-400 hover:text-white hover:border-orange-400 hover:bg-orange-500/10 text-[10px] uppercase tracking-[0.15em] font-bold transition-all rounded-sm"
                        >
                          <span className="flex items-center gap-2">
                            <Edit3 className="w-3.5 h-3.5" />
                            Request Custom
                          </span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </>
                  )}

                </div>

                {/* Drawer Footer */}
                <div className="p-5 border-t border-white/10 text-center space-y-2 bg-[#040404]">
                  <span className="text-[8px] uppercase tracking-widest text-white/30 font-bold block">
                    SECURED BY RAZORPAY GATEWAY
                  </span>
                  <span className="text-[8px] uppercase tracking-widest text-white/20 block font-mono">
                    India-made // Dispatched 48h
                  </span>
                </div>

              </motion.div>
            </>
          )}
        </AnimatePresence>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}

// Inline fallback icon to avoid import issues
function RotateCcwIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}
