import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import ProductCard from '../components/ProductCard';
import { products, categories } from '../data';

export default function Home() {
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="flex flex-col gap-24 pb-24">
      <section className="relative min-h-[90vh] flex flex-col md:flex-row items-center px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto w-full pt-10">
        <div className="w-full md:w-1/2 z-10 py-12 md:py-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-3 py-1 bg-fuchsia-500/20 border border-fuchsia-500/30 text-fuchsia-400 text-[10px] uppercase tracking-widest font-bold mb-6 rounded-sm"
          >
            New Drop: Noir Cinema Series
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[0.9] tracking-tighter mb-6"
          >
            WEAR THE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">SUBCULTURE.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-white/50 text-lg max-w-md mb-8 leading-relaxed"
          >
            Art-led apparel for fans of cult cinema, underground music, and visual storytelling. Collectible, limited-edition designs.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-wrap gap-4"
          >
            <Link
              to="/collection"
              className="px-8 py-4 bg-white text-black font-bold uppercase text-xs tracking-widest hover:bg-cyan-400 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)] text-center"
            >
              Shop the Collection
            </Link>
            <Link
              to="/request-design"
              className="px-8 py-4 border border-white/20 text-white font-bold uppercase text-xs tracking-widest hover:bg-white/5 text-center transition-colors"
            >
              Request Design
            </Link>
          </motion.div>
        </div>

        <div className="w-full md:w-1/2 h-full flex items-center justify-center relative mt-12 md:mt-0 min-h-[500px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: 0 }}
            animate={{ opacity: 1, scale: 1, rotate: 2 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="w-full max-w-[380px] h-[500px] bg-neutral-900 border border-white/10 relative overflow-hidden"
          >
            <img src={featuredProducts[0]?.image} alt={featuredProducts[0]?.name} className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity" />
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/30 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8 bg-black/60 backdrop-blur-sm p-4 border border-white/10">
              <div className="text-[10px] text-white/40 uppercase mb-2">Ref: #{featuredProducts[0]?.id || '99021'}</div>
              <div className="text-xl font-bold uppercase tracking-widest">{featuredProducts[0]?.name || 'METROPOLIS UNBOUND'}</div>
              <div className="w-full h-[1px] bg-white/20 my-4" />
              <div className="flex justify-between items-center">
                <span className="text-cyan-400 font-mono">₹{featuredProducts[0]?.price || '2,499.00'}</span>
                <span className="text-[10px] uppercase text-white/60">Limited Run</span>
              </div>
            </div>
          </motion.div>
          <div className="absolute top-1/4 right-0 w-24 h-[1px] bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] hidden md:block" />
          <div className="absolute bottom-1/4 left-0 w-24 h-[1px] bg-fuchsia-500 shadow-[0_0_8px_rgba(217,70,239,0.8)] hidden md:block" />
        </div>
      </section>

      <section className="w-full bg-white/5 border-t border-b border-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4">
          <Link to="/request-design" className="py-10 border-r border-b md:border-b-0 border-white/5 flex flex-col justify-center px-10 hover:bg-white/[0.02] transition-colors group">
            <span className="text-fuchsia-500 font-bold text-xs mb-1 group-hover:translate-x-1 transition-transform">01</span>
            <span className="text-sm font-bold uppercase tracking-widest">Custom Design</span>
            <span className="text-[10px] text-white/40 mt-1 uppercase">Request your vision</span>
          </Link>
          <Link to="/collection?category=music" className="py-10 border-r border-b md:border-b-0 border-white/5 flex flex-col justify-center px-10 hover:bg-white/[0.02] transition-colors group">
            <span className="text-cyan-400 font-bold text-xs mb-1 group-hover:translate-x-1 transition-transform">02</span>
            <span className="text-sm font-bold uppercase tracking-widest">Vinyl Music</span>
            <span className="text-[10px] text-white/40 mt-1 uppercase">Audio visual culture</span>
          </Link>
          <Link to="/collection?category=cinema" className="py-10 border-r md:border-b-0 border-white/5 flex flex-col justify-center px-10 hover:bg-white/[0.02] transition-colors group">
            <span className="text-yellow-400 font-bold text-xs mb-1 group-hover:translate-x-1 transition-transform">03</span>
            <span className="text-sm font-bold uppercase tracking-widest">Cult Cinema</span>
            <span className="text-[10px] text-white/40 mt-1 uppercase">Screen inspired art</span>
          </Link>
          <Link to="/collection?category=comics" className="py-10 flex flex-col justify-center px-10 hover:bg-white/[0.02] transition-colors group">
            <span className="text-green-400 font-bold text-xs mb-1 group-hover:translate-x-1 transition-transform">04</span>
            <span className="text-sm font-bold uppercase tracking-widest">The Archive</span>
            <span className="text-[10px] text-white/40 mt-1 uppercase">Past collectors items</span>
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 w-full">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tighter uppercase mb-2">The Curations</h2>
            <p className="text-white/50">Explore collections curated by cultural movements.</p>
          </div>
          <Link to="/collection" className="text-cyan-400 hover:text-fuchsia-500 transition-colors text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <motion.div key={category.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} viewport={{ once: true }}>
              <Link to={`/collection?category=${category.slug}`} className="group relative h-80 overflow-hidden block border border-white/10 bg-neutral-900">
                <img src={category.image} alt={category.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-50 group-hover:opacity-70 mix-blend-luminosity" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <h3 className="text-xl font-bold uppercase text-white mb-2 group-hover:text-cyan-400 transition-colors tracking-widest">{category.name}</h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 w-full">
        <h2 className="text-3xl font-extrabold tracking-tighter uppercase mb-12">
          Latest <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">Drops</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
