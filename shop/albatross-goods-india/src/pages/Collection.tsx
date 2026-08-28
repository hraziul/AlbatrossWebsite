import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { products, categories } from '../data';

export default function Collection() {
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');
  
  const [filteredProducts, setFilteredProducts] = useState(products);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Collection | Albatross Goods India';
    
    if (categoryFilter) {
      const categoryName = categories.find(c => c.slug === categoryFilter)?.name;
      if (categoryName) {
        setFilteredProducts(products.filter(p => p.category === categoryName));
      }
    } else {
      setFilteredProducts(products);
    }
  }, [categoryFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12">
      <div className="mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter uppercase mb-4">
          {categoryFilter ? `Collection: ${categories.find(c => c.slug === categoryFilter)?.name}` : 'The Archives'}
        </h1>
        <p className="text-white/50 max-w-2xl leading-relaxed">
          Browse our complete catalog of premium, art-led apparel. Each piece is crafted with heavyweight cotton and high-fidelity printing techniques.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-12">
        {/* Sidebar Filters */}
        <div className="w-full md:w-64 shrink-0 space-y-8">
          <div>
            <h3 className="font-bold uppercase tracking-widest text-[10px] mb-6 border-b border-white/10 pb-4 text-white/40">Categories</h3>
            <ul className="space-y-4">
              <li>
                <Link 
                  to="/collection" 
                  className={`text-xs uppercase tracking-widest font-medium hover:text-cyan-400 transition-colors ${!categoryFilter ? 'text-cyan-400' : 'text-white'}`}
                >
                  All Products
                </Link>
              </li>
              {categories.map(cat => (
                <li key={cat.id}>
                  <Link 
                    to={`/collection?category=${cat.slug}`} 
                    className={`text-xs uppercase tracking-widest font-medium hover:text-cyan-400 transition-colors ${categoryFilter === cat.slug ? 'text-cyan-400' : 'text-white'}`}
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <div className="text-center py-24 border border-white/5 bg-white/[0.02]">
              <p className="text-white/40 uppercase tracking-widest text-xs">No products found for this category.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
