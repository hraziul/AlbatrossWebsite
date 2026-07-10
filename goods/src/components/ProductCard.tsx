import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  // One dot per distinct color — signals variant choice before the customer clicks through.
  const colorSwatches = product.variants && product.variants.length > 1
    ? Array.from(new Map(product.variants.map(v => [v.color, v.colorCode])).entries())
    : [];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1.0] }}
      className="group flex flex-col gap-3 relative w-full"
    >
      {/* Visual Frame */}
      <Link 
        to={`/product/${product.slug}`} 
        className="relative aspect-[3/4] overflow-hidden bg-[#0a0a0a] border border-white/5 block w-full transition-all duration-500 group-hover:border-white/10 group-hover:shadow-[0_12px_30px_rgba(0,0,0,0.7)] group-hover:-translate-y-1"
      >
        {/* Subtle grid accent inside frame */}
        <div className="absolute inset-0 border-r border-b border-white/[0.01] pointer-events-none z-10" />

        {/* Primary Image */}
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover transition-all duration-[800ms] ease-out group-hover:scale-[1.04]"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#0d0d0d] text-white/30 p-4">
            <span className="text-[12px] font-serif italic mb-1">Image Coming Soon</span>
            <span className="text-[8px] uppercase tracking-[0.2em] font-mono">Curation In Progress</span>
          </div>
        )}

        {/* Alternate Image on Hover */}
        {product.hoverImage && product.hoverImage !== product.image && (
          <img 
            src={product.hoverImage} 
            alt={`${product.name} detail view`} 
            className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-[600ms] ease-out group-hover:opacity-100 group-hover:scale-[1.04]"
            loading="lazy"
          />
        )}

        {/* Minimal Category Accent Tag */}
        {product.isNew && (
          <span className="absolute top-4 left-4 bg-white text-black text-[7px] font-display font-bold uppercase tracking-[0.25em] px-2.5 py-1 z-20">
            NEW
          </span>
        )}

        {/* Subtle Bottom Glow/Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 pointer-events-none z-10" />
      </Link>

      {/* Product Information Grid */}
      <div className="flex flex-col px-1">
        <div className="flex justify-between items-baseline gap-4">
          {/* Tracked short uppercase title */}
          <h3 className="font-display font-bold text-[11px] sm:text-xs tracking-[0.1em] uppercase text-white/90 truncate flex-1">
            <Link to={`/product/${product.slug}`} className="hover:text-cyan-400 transition-colors duration-300">
              {product.name}
            </Link>
          </h3>
          
          {/* Price Tag */}
          <span className="font-mono text-cyan-400 text-xs tracking-widest shrink-0 font-medium">
            {product.price > 0 ? `₹${product.price.toLocaleString('en-IN')}` : 'Request'}
          </span>
        </div>

        {/* Light subtitle category mapping */}
        <span className="text-white/40 text-[9px] uppercase tracking-[0.15em] font-sans mt-0.5">
          {product.category}
        </span>

        {/* Color variant preview — signals "choose options" before click-through */}
        {colorSwatches.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2" aria-label={`${colorSwatches.length} colors available`}>
            {colorSwatches.slice(0, 5).map(([color, hex]) => (
              <span
                key={color}
                title={color}
                className="w-2.5 h-2.5 rounded-full border border-white/20"
                style={{ backgroundColor: hex }}
              />
            ))}
            {colorSwatches.length > 5 && (
              <span className="text-white/30 text-[8px] font-mono ml-0.5">+{colorSwatches.length - 5}</span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
