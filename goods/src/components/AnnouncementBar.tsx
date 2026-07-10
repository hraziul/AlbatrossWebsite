import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { products } from '../data';
import { useProductData } from '../hooks/useProductData';

const BAR_HEIGHT = 40;
export { BAR_HEIGHT };

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  // Trigger update when product cache loads
  useProductData();

  const messages = [
    { id: 1, text: '✦ COLLECTOR STANDARD', sub: '240 GSM+ Premium Organic Blanks · Archival Inks' },
    { id: 2, text: '✦ FREE TRACKED SHIPPING', sub: 'Dispatched within 48 hours across India' },
    { id: 3, text: '✦ SECURE RAZORPAY GATEWAY', sub: '100% encrypted checkout with UPI & Cards' },
    { id: 4, text: '✦ 48-HOUR REPLACEMENT WINDOW', sub: 'Exchanges accepted for manufacturing defects' }
  ];

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((c) => (c + 1) % messages.length);
  }, [messages.length]);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((c) => (c - 1 + messages.length) % messages.length);
  }, [messages.length]);

  useEffect(() => {
    if (!visible) return;
    const id = setInterval(next, 4000);
    return () => clearInterval(id);
  }, [visible, next]);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('ag_bar_dismissed');
    if (dismissed) setVisible(false);
  }, []);

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem('ag_bar_dismissed', '1');
  };

  if (!visible || messages.length === 0) return null;

  const msg = messages[current % messages.length];

  return (
    <div
      id="announcement-bar"
      style={{ height: BAR_HEIGHT }}
      className="fixed bottom-0 left-0 right-0 w-full bg-[#080808]/95 backdrop-blur-md border-t border-cyan-500/20 flex items-center justify-center overflow-hidden z-[45] shrink-0 shadow-[0_-8px_30px_rgba(0,0,0,0.5)]"
    >
      {/* Neon left accent line */}
      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-cyan-400 to-fuchsia-500" />

      {/* Prev button */}
      <button
        onClick={prev}
        aria-label="Previous announcement"
        className="absolute left-6 text-white/30 hover:text-white/80 transition-colors hidden sm:flex items-center cursor-pointer"
      >
        <ChevronLeft className="w-3 h-3" />
      </button>

      {/* Rotating messages */}
      <div className="relative w-full max-w-2xl mx-auto px-12 flex items-center justify-center h-full overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={msg.id}
            custom={direction}
            initial={{ opacity: 0, y: direction * 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: direction * -12 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="flex items-center gap-3 text-center select-none"
          >
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-white">
              {msg.text}
            </span>
            <span className="hidden sm:block w-px h-3 bg-white/20" />
            <span className="hidden sm:block text-[10px] uppercase tracking-[0.15em] text-white/50">
              {msg.sub}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
        {messages.map((_, i) => (
          <button
            key={i}
            onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
            aria-label={`Announcement ${i + 1}`}
            className={`w-1 h-1 rounded-full transition-all cursor-pointer ${i === (current % messages.length) ? 'bg-cyan-400 w-3' : 'bg-white/20'}`}
          />
        ))}
      </div>

      {/* Next button */}
      <button
        onClick={next}
        aria-label="Next announcement"
        className="absolute right-10 text-white/30 hover:text-white/80 transition-colors hidden sm:flex items-center cursor-pointer"
      >
        <ChevronRight className="w-3 h-3" />
      </button>

      {/* Dismiss */}
      <button
        onClick={dismiss}
        aria-label="Dismiss announcement bar"
        className="absolute right-4 text-white/20 hover:text-white/60 transition-colors cursor-pointer"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}
