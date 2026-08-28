import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { products } from '../data';

export default function ProductDetail() {
  const { slug } = useParams();
  const product = products.find(p => p.slug === slug);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (product) {
      document.title = `${product.name} | Albatross Goods India`;
    }
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center flex-col gap-4">
        <h1 className="text-3xl font-extrabold uppercase tracking-tighter">Product not found</h1>
        <Link to="/collection" className="text-cyan-400 hover:text-white transition-colors text-xs tracking-widest uppercase">Back to Collection</Link>
      </div>
    );
  }

  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
        
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-[4/5] bg-neutral-900 border border-white/10 relative overflow-hidden group">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          {product.hoverImage && (
            <div className="aspect-[4/5] bg-neutral-900 border border-white/10 relative overflow-hidden group">
              <img 
                src={product.hoverImage} 
                alt={`${product.name} alternate view`} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="sticky top-32">
            <div className="mb-4 text-fuchsia-500 font-bold uppercase tracking-widest text-[10px]">
              {product.category}
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter uppercase mb-4 leading-tight">{product.name}</h1>
            <div className="text-2xl font-mono text-cyan-400 mb-8">₹{product.price}</div>

            <p className="text-white/60 text-base leading-relaxed mb-10">
              {product.description}
            </p>

            <div className="mb-10">
              <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                <span className="font-bold uppercase tracking-widest text-[10px] text-white/40">Select Size</span>
                <button className="text-[10px] text-white hover:text-cyan-400 uppercase tracking-widest transition-colors">Size Guide</button>
              </div>
              <div className="flex flex-wrap gap-3">
                {sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 flex items-center justify-center text-sm font-bold transition-all border ${
                      selectedSize === size 
                        ? 'bg-white text-black border-white' 
                        : 'border-white/20 text-white hover:border-cyan-400 hover:text-cyan-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <button className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-cyan-400 transition-colors mb-8 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              Add To Cart
            </button>

            <div className="space-y-6 pt-8 border-t border-white/10">
              <h3 className="font-bold uppercase tracking-widest text-xs">The Details</h3>
              <ul className="space-y-4">
                {product.details?.map((detail, idx) => (
                  <li key={idx} className="flex items-start gap-4 text-white/60 text-sm">
                    <span className="w-1.5 h-1.5 bg-fuchsia-500 rounded-full mt-1.5 shrink-0 shadow-[0_0_8px_rgba(217,70,239,0.8)]"></span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-12 flex gap-8 text-[10px] uppercase tracking-widest text-white/40 border-t border-white/10 pt-6">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span> Free Shipping in India
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span> Secure Checkout
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
