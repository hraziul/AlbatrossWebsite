import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, Check } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { products, categories } from '../data';
import SEO from '../components/SEO';
import { useProductData } from '../hooks/useProductData';

// Helper to determine subcategory type dynamically
function getProductType(product: any): string {
  const detail = (product.details?.[0] || '').toLowerCase();
  const name = product.name.toLowerCase();

  if (detail.includes('tote') || detail.includes('bag') || name.includes('tote') || name.includes('bag')) {
    return 'Tote Bags';
  } else if (detail.includes('hoodie') || name.includes('hoodie')) {
    return 'Hoodies';
  } else if (detail.includes('sweatshirt') || name.includes('sweatshirt')) {
    return 'Sweatshirts';
  }
  return 'T-Shirts';
}

export default function Collection() {
  const { ready } = useProductData();
  const [searchParams, setSearchParams] = useSearchParams();

  // Mobile filter visibility state
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Read initial states from search params
  const themeParam = searchParams.get('theme');
  const typeParam = searchParams.get('type');
  const categoryParam = searchParams.get('category'); // e.g. trending or basics

  // Filter States
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [onlyTrending, setOnlyTrending] = useState(false);
  const [onlyBasics, setOnlyBasics] = useState(false);

  // Sync state with URL params
  useEffect(() => {
    if (themeParam) {
      const match = categories.find(c => c.slug === themeParam);
      if (match) {
        setSelectedThemes([match.name]);
      }
    } else {
      setSelectedThemes([]);
    }

    if (typeParam) {
      setSelectedTypes([typeParam]);
    } else {
      setSelectedTypes([]);
    }

    if (categoryParam === 'trending') {
      setOnlyTrending(true);
      setOnlyBasics(false);
    } else if (categoryParam === 'everyday-basics') {
      setOnlyBasics(true);
      setOnlyTrending(false);
    } else {
      setOnlyTrending(false);
      setOnlyBasics(false);
    }
  }, [themeParam, typeParam, categoryParam, ready]);

  // Derive dynamic filter lists from actual loaded products to prevent dead-end options
  const filterOptions = useMemo(() => {
    const themesSet = new Set<string>();
    const typesSet = new Set<string>();
    const sizesSet = new Set<string>();

    products.forEach(p => {
      if (p.category) themesSet.add(p.category);
      typesSet.add(getProductType(p));
      
      const sizesList = p.variants && p.variants.length > 0
        ? p.variants.map(v => v.size)
        : ['S', 'M', 'L', 'XL', 'XXL'];
      sizesList.forEach(s => sizesSet.add(s));
    });

    // Standard sorting for sizes
    const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
    const sortedSizes = Array.from(sizesSet).sort((a, b) => {
      const idxA = sizeOrder.indexOf(a);
      const idxB = sizeOrder.indexOf(b);
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });

    return {
      themes: Array.from(themesSet),
      types: Array.from(typesSet),
      sizes: sortedSizes
    };
  }, [ready]);

  // Handle updates to search params on clear
  const resetFilters = () => {
    setSelectedThemes([]);
    setSelectedTypes([]);
    setSelectedSizes([]);
    setOnlyTrending(false);
    setOnlyBasics(false);
    setSearchParams({});
  };

  // Perform multi-facet combination filtering
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // 1. Theme Filter
      if (selectedThemes.length > 0 && !selectedThemes.includes(product.category)) {
        return false;
      }

      // 2. Type Filter
      if (selectedTypes.length > 0 && !selectedTypes.includes(getProductType(product))) {
        return false;
      }

      // 3. Size Filter
      if (selectedSizes.length > 0) {
        const sizesList = product.variants && product.variants.length > 0
          ? product.variants.map(v => v.size)
          : ['S', 'M', 'L', 'XL', 'XXL'];
        const hasSize = selectedSizes.some(size => sizesList.includes(size));
        if (!hasSize) return false;
      }

      // 4. Trending Tag Filter
      if (onlyTrending && !product.isTrending) {
        return false;
      }

      // 5. Basics Tag Filter
      if (onlyBasics && !product.isBasic) {
        return false;
      }

      return true;
    });
  }, [selectedThemes, selectedTypes, selectedSizes, onlyTrending, onlyBasics, ready]);

  // Toggle helpers
  const toggleTheme = (val: string) => {
    setSelectedThemes(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);
  };

  const toggleType = (val: string) => {
    setSelectedTypes(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);
  };

  const toggleSize = (val: string) => {
    setSelectedSizes(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);
  };

  // Header Title description mapping
  const activeTitle = useMemo(() => {
    if (selectedThemes.length === 1) return selectedThemes[0];
    if (selectedTypes.length === 1) return selectedTypes[0];
    if (onlyTrending) return 'Trending Drops';
    if (onlyBasics) return 'Everyday Basics';
    return 'All Releases';
  }, [selectedThemes, selectedTypes, onlyTrending, onlyBasics]);

  const seoTitle = `${activeTitle} | Albatross Goods India`;
  const seoDescription = `Shop custom print heavyweight apparel. Explore premium limited drops for ${activeTitle}.`;

  const renderFiltersList = () => (
    <div className="space-y-8 text-left">
      {/* Curation Collections */}
      {filterOptions.themes.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-[10px] font-display font-bold uppercase tracking-[0.2em] text-white/40">
            Collection Series
          </h3>
          <div className="flex flex-col gap-2">
            {filterOptions.themes.map(theme => (
              <label key={theme} className="flex items-center gap-3 cursor-pointer group text-xs text-white/70 hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={selectedThemes.includes(theme)}
                  onChange={() => toggleTheme(theme)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 border flex items-center justify-center transition-all ${
                  selectedThemes.includes(theme) 
                    ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400' 
                    : 'border-white/10 bg-white/5 group-hover:border-white/30'
                }`}>
                  {selectedThemes.includes(theme) && <Check className="w-3 h-3" />}
                </div>
                <span className="uppercase tracking-wider text-[10px] font-semibold">{theme}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Product type styles */}
      {filterOptions.types.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-[10px] font-display font-bold uppercase tracking-[0.2em] text-white/40">
            Product Styles
          </h3>
          <div className="flex flex-col gap-2">
            {filterOptions.types.map(type => (
              <label key={type} className="flex items-center gap-3 cursor-pointer group text-xs text-white/70 hover:text-white select-none">
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(type)}
                  onChange={() => toggleType(type)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 border flex items-center justify-center transition-all ${
                  selectedTypes.includes(type) 
                    ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400' 
                    : 'border-white/10 bg-white/5 group-hover:border-white/30'
                }`}>
                  {selectedTypes.includes(type) && <Check className="w-3 h-3" />}
                </div>
                <span className="uppercase tracking-wider text-[10px] font-semibold">{type}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Sizing grid filter */}
      {filterOptions.sizes.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-[10px] font-display font-bold uppercase tracking-[0.2em] text-white/40">
            Filter Size
          </h3>
          <div className="grid grid-cols-4 gap-1.5">
            {filterOptions.sizes.map(size => (
              <button
                key={size}
                onClick={() => toggleSize(size)}
                className={`py-2 text-center text-[10px] font-mono font-bold tracking-widest border rounded-sm transition-all cursor-pointer ${
                  selectedSizes.includes(size)
                    ? 'bg-white text-black border-white'
                    : 'bg-white/5 border-white/10 text-white/60 hover:border-cyan-400/40 hover:text-cyan-400'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick filters tags */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-display font-bold uppercase tracking-[0.2em] text-white/40">
          Quick Filters
        </h3>
        <div className="flex flex-col gap-2.5">
          {products.some(p => p.isTrending) && (
            <label className="flex items-center gap-3 cursor-pointer group text-xs text-white/70 hover:text-white select-none">
              <input
                type="checkbox"
                checked={onlyTrending}
                onChange={() => setOnlyTrending(!onlyTrending)}
                className="sr-only"
              />
              <div className={`w-4 h-4 border flex items-center justify-center transition-all ${
                onlyTrending 
                  ? 'border-green-400 bg-green-400/10 text-green-400' 
                  : 'border-white/10 bg-white/5 group-hover:border-white/30'
              }`}>
                {onlyTrending && <Check className="w-3 h-3" />}
              </div>
              <span className="uppercase tracking-wider text-[10px] font-semibold">Trending Drops</span>
            </label>
          )}

          {products.some(p => p.isBasic) && (
            <label className="flex items-center gap-3 cursor-pointer group text-xs text-white/70 hover:text-white select-none">
              <input
                type="checkbox"
                checked={onlyBasics}
                onChange={() => setOnlyBasics(!onlyBasics)}
                className="sr-only"
              />
              <div className={`w-4 h-4 border flex items-center justify-center transition-all ${
                onlyBasics 
                  ? 'border-orange-400 bg-orange-400/10 text-orange-400' 
                  : 'border-white/10 bg-white/5 group-hover:border-white/30'
              }`}>
                {onlyBasics && <Check className="w-3 h-3" />}
              </div>
              <span className="uppercase tracking-wider text-[10px] font-semibold">Everyday Basics</span>
            </label>
          )}
        </div>
      </div>

      {/* Clear/Reset button */}
      {(selectedThemes.length > 0 || selectedTypes.length > 0 || selectedSizes.length > 0 || onlyTrending || onlyBasics) && (
        <button
          onClick={resetFilters}
          className="w-full py-2.5 border border-dashed border-red-500/30 hover:border-red-500 hover:bg-red-500/5 text-red-400 hover:text-white text-[9px] font-display font-bold uppercase tracking-[0.25em] transition-colors rounded-sm cursor-pointer"
        >
          CLEAR ALL FILTERS
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10 relative bg-transparent min-h-screen">
      <SEO title={seoTitle} description={seoDescription} />
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-6 border-b border-white/5">
        <div className="text-left">
          <span className="text-[8px] font-display font-bold uppercase tracking-[0.25em] text-cyan-400 block mb-1">
            ✦ LATEST DROPS ARCHIVE
          </span>
          <h1 className="text-3xl sm:text-4xl font-display font-bold uppercase tracking-tight text-white">
            {activeTitle}
          </h1>
        </div>

        {/* Action buttons (Mobile Filters Trigger + Active Count) */}
        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
          <span className="text-[9px] font-mono uppercase tracking-widest text-white/35">
            {filteredProducts.length} items found
          </span>
          <button
            onClick={() => setIsMobileFiltersOpen(true)}
            className="md:hidden flex items-center gap-2 px-3.5 py-2 border border-white/10 bg-white/5 hover:border-cyan-400/40 text-[9px] font-display font-bold uppercase tracking-wider text-white/80 rounded-sm cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        {/* LEFT COLUMN: Desktop Sidebar Filters */}
        <aside className="hidden md:block md:col-span-1 space-y-8 sticky top-24 pr-4 border-r border-white/5">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-[10px] font-display font-bold uppercase tracking-[0.25em] text-white">
              Filter By
            </span>
          </div>
          {renderFiltersList()}
        </aside>

        {/* RIGHT COLUMN: Products Grid */}
        <div className="md:col-span-3">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
              />
            ))}
          </div>

          {/* Empty state handles search exclusions */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-24 border border-dashed border-white/10 bg-white/[0.01] max-w-md mx-auto mt-6 rounded-sm">
              <span className="text-lg block mb-1.5 font-serif italic text-white/30">No Curations Match</span>
              <p className="text-white/20 uppercase tracking-[0.2em] text-[8px] font-display mb-6">
                Try selecting different sizing or collection filters.
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-2.5 bg-white text-black text-[9px] font-display font-bold uppercase tracking-[0.2em] hover:bg-cyan-400 transition-colors rounded-sm cursor-pointer"
              >
                RESET CATALOG
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE FILTERS SIDEBAR OVERLAY */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-[100] md:hidden flex justify-end">
          {/* Backdrop */}
          <div 
            onClick={() => setIsMobileFiltersOpen(false)}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* Filter Panel Drawer */}
          <div className="relative w-full max-w-[280px] h-full bg-[#070707] border-l border-white/10 p-6 overflow-y-auto z-10 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <span className="text-[10px] font-display font-bold uppercase tracking-[0.25em] text-white">
                  Filter Options
                </span>
                <button 
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="text-white/40 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {renderFiltersList()}
            </div>

            <button
              onClick={() => setIsMobileFiltersOpen(false)}
              className="w-full mt-6 py-3 bg-white text-black font-display font-bold uppercase text-[9px] tracking-[0.2em] hover:bg-cyan-400 transition-colors rounded-sm cursor-pointer"
            >
              APPLY FILTERS ({filteredProducts.length})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
