import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Youtube, ExternalLink, Lock, Package, RotateCcw, MapPin } from 'lucide-react';
import { categories, products } from '../data';

/**
 * The welcome popup is the only other signup path, and it's a one-time,
 * per-session prompt — anyone who dismisses it has no other way to join
 * short of clearing their session. This is the persistent, always-available
 * fallback, present on every page. Shares the same backend endpoint (and
 * therefore the same durable server-side storage) as the popup.
 */
function FooterNewsletter() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || state === 'submitting') return;
    setState('submitting');
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source: 'footer' }),
      });
      if (!res.ok) throw new Error('failed');
      setState('done');
    } catch (err) {
      console.error('[Footer] Newsletter signup failed:', err);
      setState('error');
    }
  };

  if (state === 'done') {
    return (
      <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-400 font-bold">
        ✓ You're on the list — welcome to the collective.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-xs">
      <div className="flex gap-2">
        <label htmlFor="footer-email" className="sr-only">Email address</label>
        <input
          id="footer-email"
          type="email"
          required
          disabled={state === 'submitting'}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="flex-1 min-w-0 bg-white/5 border border-white/10 px-3 py-2.5 text-xs text-white placeholder-white/20 outline-none focus:border-cyan-500/60 transition-all font-mono disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={state === 'submitting'}
          className="shrink-0 px-4 py-2.5 bg-white text-black text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-cyan-400 transition-colors disabled:opacity-60"
        >
          {state === 'submitting' ? '...' : 'Join'}
        </button>
      </div>
      {state === 'error' && (
        <p className="text-red-400 text-[9px]" role="alert">Could not save that — please try again.</p>
      )}
      <p className="text-white/20 text-[9px] leading-relaxed">
        First word on numbered drops. No spam, unsubscribe anytime.
      </p>
    </form>
  );
}

const paymentMethods = ['UPI', 'Visa', 'Mastercard', 'RuPay', 'COD'];

const assurances = [
  { icon: Lock, label: 'SSL Secured' },
  { icon: Package, label: 'Tracked Shipping' },
  { icon: RotateCcw, label: 'Easy Returns' },
  { icon: MapPin, label: 'Made in India' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  // Dynamically build category links from actual categories and product flags
  const categoryLinks = [
    ...categories.map(cat => ({
      name: cat.name,
      path: `/collection?category=${cat.slug}`,
      colorClass: cat.slug === 'cult-cinema' ? 'hover:text-cyan-400' : cat.slug === 'music-inspired' ? 'hover:text-fuchsia-400' : 'hover:text-yellow-400'
    })),
    ...(products.some(p => p.isTrending) ? [{
      name: 'Trending',
      path: '/collection?category=trending',
      colorClass: 'hover:text-green-400'
    }] : []),
    ...(products.some(p => p.isBasic) ? [{
      name: 'Everyday Basics',
      path: '/collection?category=everyday-basics',
      colorClass: 'hover:text-orange-400'
    }] : []),
  ];

  return (
    <footer className="border-t border-white/8 mt-24 bg-[#040404] relative z-10">
      {/* Assurance strip */}
      <div className="border-b border-white/5 bg-white/[0.015]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {assurances.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full border border-cyan-500/20 bg-cyan-500/5 flex items-center justify-center shrink-0">
                <Icon className="w-3 h-3 text-cyan-400" />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main footer columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-14 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-10">
        {/* Brand column */}
        <div className="col-span-1 sm:col-span-2">
          <Link to="/" className="flex items-center gap-2 mb-4" aria-label="Albatross Goods India home">
            <div className="w-6 h-6 bg-white flex items-center justify-center">
              <div className="w-3 h-3 border-2 border-black rotate-45" />
            </div>
            <span className="text-[15px] font-bold tracking-tighter uppercase text-white">
              Albatross <span className="text-cyan-400">Goods</span>
            </span>
          </Link>
          <p className="text-xs text-white/35 leading-relaxed max-w-xs mb-5 font-light">
            Premium, art-led apparel for fans of cult cinema, underground music, and visual storytelling.
            Collectible, limited-edition designs — built in India, built to last.
          </p>

          {/* Social links */}
          <div className="flex gap-3 mb-6">
            <a
              href="https://www.instagram.com/albatrossamazedotcom/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Albatross Goods on Instagram"
              className="w-8 h-8 border border-white/10 flex items-center justify-center text-white/30 hover:text-white hover:border-white/30 transition-all duration-200"
            >
              <Instagram className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://www.youtube.com/@albatrossamaze/shorts"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Albatross Goods on YouTube"
              className="w-8 h-8 border border-white/10 flex items-center justify-center text-white/30 hover:text-white hover:border-white/30 transition-all duration-200"
            >
              <Youtube className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://albatrossamaze.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Albatross Amaze Main Portal"
              className="w-8 h-8 border border-white/10 flex items-center justify-center text-white/30 hover:text-white hover:border-white/30 transition-all duration-200"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Secure checkout indicator */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-white/30">
              Secure Checkout Active
            </span>
          </div>
        </div>

        {/* Collections column */}
        <div>
          <h4 className="text-[9px] font-bold uppercase tracking-[0.25em] text-white mb-5">
            Collections
          </h4>
          <ul className="flex flex-col gap-3 text-[10px] uppercase tracking-[0.15em] font-medium text-white/35">
            {categoryLinks.map((cat) => (
              <li key={cat.name}>
                <Link to={cat.path} className={`${cat.colorClass} transition-colors`}>
                  {cat.name}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/request-design" className="text-orange-400 hover:text-white font-bold transition-colors">
                Request Design
              </Link>
            </li>
          </ul>
        </div>

        {/* Newsletter column */}
        <div>
          <h4 className="text-[9px] font-bold uppercase tracking-[0.25em] text-white mb-5">
            Inner Circle
          </h4>
          <p className="text-[10px] text-white/35 leading-relaxed mb-4 max-w-xs">
            Numbered runs sell out. Join the list to hear about a drop before it's retired for good.
          </p>
          <FooterNewsletter />
        </div>

        {/* Support & Policy column */}
        <div>
          <h4 className="text-[9px] font-bold uppercase tracking-[0.25em] text-white mb-5">
            Support & Legal
          </h4>
          <ul className="flex flex-col gap-3 text-[10px] uppercase tracking-[0.15em] font-medium text-white/35">
            <li><Link to="/help" className="hover:text-white transition-colors">FAQ</Link></li>
            <li><Link to="/track" className="hover:text-cyan-400 font-bold transition-colors">Track Order</Link></li>
            <li><Link to="/returns" className="hover:text-fuchsia-400 font-bold transition-colors">Return / Replacement</Link></li>
            <li><Link to="/shipping" className="hover:text-white transition-colors">Shipping Info</Link></li>
            <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
          </ul>
        </div>
      </div>

      {/* Payment methods + copyright strip */}
      <div className="border-t border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <span className="text-[9px] uppercase tracking-[0.2em] font-medium text-white/20">
            © {year} Albatross Goods India. All Rights Reserved.
          </span>

          {/* Payment badges */}
          <div className="flex items-center gap-2">
            <span className="text-[8px] uppercase tracking-widest text-white/15 mr-1 hidden sm:block">We accept</span>
            {paymentMethods.map((method) => (
              <div
                key={method}
                className="px-2.5 py-1 border border-white/10 bg-white/[0.03] text-[8px] font-bold uppercase tracking-widest text-white/30"
              >
                {method}
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
