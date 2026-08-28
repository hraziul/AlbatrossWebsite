import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Collections', path: '/collection' },
    { name: 'Request Design', path: '/request-design' },
    { name: 'About', path: '/about' },
  ];

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 h-20 flex items-center border-b border-white/5 ${
        isScrolled ? 'bg-black/80 backdrop-blur-xl' : 'bg-black/40 backdrop-blur-xl'
      }`}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white flex items-center justify-center hidden sm:flex">
            <div className="w-4 h-4 border-2 border-black rotate-45"></div>
          </div>
          <span className="text-xl font-bold tracking-tighter uppercase">Albatross <span className="text-cyan-400">Goods</span></span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-8 items-center text-[11px] uppercase tracking-[0.2em] font-semibold text-white/60">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`hover:text-white transition-colors ${location.pathname === link.path ? 'text-white border-b border-cyan-400 pb-1' : ''}`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-6">
          <Link to="/search" className="hidden sm:block text-xs uppercase tracking-widest text-white/40 hover:text-white transition-colors">
            Search
          </Link>
          <Link to="/checkout" className="relative hover:text-cyan-400 transition-colors">
            <div className="w-10 h-10 border border-white/10 rounded-full flex items-center justify-center bg-white/5">
              <span className="text-[10px] font-bold">0</span>
            </div>
          </Link>
          <button
            className="md:hidden p-2 text-white/60 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-black/95 backdrop-blur-xl border-t border-white/10 md:hidden"
          >
            <nav className="flex flex-col py-6 px-6 gap-6 text-sm uppercase tracking-[0.2em] font-semibold text-white/60">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`hover:text-white transition-colors ${location.pathname === link.path ? 'text-white' : ''}`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
