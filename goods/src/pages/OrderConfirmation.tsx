import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface LastOrder {
  referenceNumber: string;
  customerName: string;
  confirmedAt: string;
}

export const LAST_ORDER_STORAGE_KEY = 'albatross_last_order';

/**
 * A real, URL-addressable route for post-checkout confirmation — previously
 * this only existed as in-memory React state on the Checkout page itself, so
 * any reload/redirect after a successful payment silently lost it, even
 * though the order had actually gone through. Reading from localStorage
 * instead of route/component state means this survives a hard refresh.
 */
export default function OrderConfirmation() {
  const [order, setOrder] = useState<LastOrder | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    try {
      const raw = localStorage.getItem(LAST_ORDER_STORAGE_KEY);
      if (raw) setOrder(JSON.parse(raw));
    } catch (err) {
      console.error('[OrderConfirmation] Failed to read last order from localStorage:', err);
    } finally {
      setChecked(true);
    }
  }, []);

  // Avoid a flash of "no order found" before the localStorage read completes.
  if (!checked) return null;

  if (!order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center flex-col gap-6 bg-transparent px-4 text-center">
        <SEO title="Order Confirmation | Albatross Goods India" description="Order confirmation status." />
        <span className="text-3xl font-serif italic text-white/30">No recent order found</span>
        <p className="text-white/40 text-xs max-w-sm leading-relaxed">
          If you just completed a payment and landed here without details, check your email for a confirmation, or contact{' '}
          <span className="text-cyan-400">ArtsyCheezein@gmail.com</span> with your payment ID and we'll confirm it manually.
        </p>
        <Link to="/collection" className="text-cyan-400 hover:text-white transition-colors text-[9px] tracking-[0.2em] uppercase border border-white/10 px-5 py-2.5">
          BACK TO CATALOG
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center bg-transparent min-h-[70vh] flex flex-col justify-center items-center">
      <SEO title="Order Confirmed | Albatross Goods India" description="Your streetwear order is confirmed." />
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mb-8"
      >
        <CheckCircle className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
        <span className="text-[9px] font-display uppercase tracking-[0.25em] text-cyan-400 font-bold block mb-1">
          Payment Verified
        </span>
        <h1 className="text-3xl font-display font-bold uppercase tracking-wide text-white">
          Order Confirmed
        </h1>
      </motion.div>

      <div className="w-full bg-[#070707] border border-white/10 p-6 rounded-sm mb-8 text-left space-y-4 font-sans font-light">
        <div className="flex justify-between text-xs border-b border-white/5 pb-3">
          <span className="text-white/40">Order Reference</span>
          <span className="font-mono text-white font-bold">{order.referenceNumber}</span>
        </div>
        <div className="flex justify-between text-xs border-b border-white/5 pb-3">
          <span className="text-white/40">Delivery To</span>
          <span className="text-white font-medium">{order.customerName}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-white/40">Status</span>
          <span className="text-green-400 font-medium">In Production</span>
        </div>
      </div>

      <p className="text-white/40 text-xs leading-relaxed max-w-sm mb-8 font-light">
        Your order details have been registered. Our local press studio is crafting your custom streetwear drop on demand. If a confirmation email was sent, it's on its way.
      </p>

      <Link
        to="/collection"
        className="px-8 py-3.5 bg-white hover:bg-cyan-400 text-black text-xs font-display font-bold uppercase tracking-[0.2em] transition-colors"
      >
        CONTINUE SHOPPING
      </Link>
    </div>
  );
}
