import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-16 grid grid-cols-1 md:grid-cols-4 gap-12 text-[10px] uppercase tracking-[0.2em] font-medium text-white/40">
        <div className="col-span-1 md:col-span-2">
          <Link to="/" className="text-xl font-bold tracking-tighter text-white block mb-4 normal-case">
            Albatross <span className="text-cyan-400">Goods</span>
          </Link>
          <p className="max-w-sm leading-relaxed mb-8 normal-case text-xs">
            Premium, art-led apparel for fans of cult cinema, underground music, and visual storytelling. Collectible, limited-edition designs.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span className="text-white">Secure Checkout Active</span>
          </div>
        </div>
        
        <div>
          <h4 className="text-white font-bold mb-6">Explore</h4>
          <ul className="flex flex-col gap-4">
            <li><Link to="/collection" className="hover:text-white transition-colors">All Products</Link></li>
            <li><Link to="/request-design" className="hover:text-white transition-colors">Request Design</Link></li>
            <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">Support</h4>
          <ul className="flex flex-col gap-4">
            <li><Link to="/help" className="hover:text-white transition-colors">FAQ</Link></li>
            <li><Link to="/shipping" className="hover:text-white transition-colors">Shipping & Returns</Link></li>
            <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-16 flex flex-col md:flex-row items-center justify-between border-t border-white/5 text-[9px] uppercase tracking-[0.3em] font-medium text-white/40">
        <div className="flex gap-10">
          <span>© {new Date().getFullYear()} Albatross Goods India</span>
          <Link to="#" className="hover:text-white transition-colors hidden sm:block">Privacy</Link>
          <Link to="#" className="hover:text-white transition-colors hidden sm:block">Shipping</Link>
        </div>
        <div className="flex gap-8 mt-4 md:mt-0">
          <span className="hover:text-white cursor-pointer transition-colors">Instagram</span>
          <span className="hover:text-white cursor-pointer transition-colors">Behance</span>
          <span className="hover:text-white cursor-pointer transition-colors">Discord</span>
        </div>
      </div>
    </footer>
  );
}
