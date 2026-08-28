import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group flex flex-col gap-4"
    >
      <Link to={`/product/${product.slug}`} className="relative aspect-[4/5] overflow-hidden bg-neutral-900 border border-white/10 block">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 mix-blend-luminosity opacity-80 group-hover:opacity-100 group-hover:mix-blend-normal"
        />
        {product.hoverImage && (
          <img 
            src={product.hoverImage} 
            alt={`${product.name} alternate`} 
            className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100 mix-blend-luminosity group-hover:mix-blend-normal"
          />
        )}
        {product.isNew && (
          <div className="absolute top-4 left-4 bg-fuchsia-500/20 border border-fuchsia-500/30 text-fuchsia-400 text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-sm backdrop-blur-md">
            New Drop
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
          <span className="text-[10px] font-bold tracking-widest uppercase border border-white/30 backdrop-blur-sm px-4 py-3 hover:bg-white hover:text-black transition-colors w-full text-center">
            View Details
          </span>
        </div>
      </Link>
      <div>
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-sm tracking-wide uppercase">
            <Link to={`/product/${product.slug}`} className="hover:text-cyan-400 transition-colors">
              {product.name}
            </Link>
          </h3>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-white/50 text-xs uppercase tracking-widest">{product.category}</p>
          <span className="font-mono text-cyan-400 text-sm">₹{product.price}</span>
        </div>
      </div>
    </motion.div>
  );
}
