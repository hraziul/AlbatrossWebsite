import { useCart } from '../context/CartContext';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.35, ease: [0.25, 0.1, 0.25, 1.0] }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#070707] border-l border-white/10 z-[101] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#090909]">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-cyan-400" />
                <span className="font-display font-bold uppercase tracking-[0.2em] text-xs text-white">
                  Your Selection
                </span>
              </div>
              <button
                onClick={onClose}
                aria-label="Close cart"
                className="text-white/40 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-none">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-20">
                  <span className="text-2xl font-serif italic text-white/20">Empty selection</span>
                  <p className="text-[9px] font-display uppercase tracking-[0.25em] text-white/30 max-w-[200px] leading-relaxed">
                    You haven't curated any pieces yet.
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-2 px-6 py-2.5 border border-white/10 hover:border-cyan-400 text-white text-[9px] font-display font-bold uppercase tracking-[0.2em] transition-colors"
                  >
                    CONTINUE BROWSING
                  </button>
                </div>
              ) : (
                cartItems.map((item, idx) => (
                  <div
                    key={`${item.product.id}-${item.selectedSize}-${item.selectedColor ?? ''}`}
                    className="flex gap-4 pb-6 border-b border-white/5 last:border-0 last:pb-0"
                  >
                    {/* Image frame */}
                    <Link
                      to={`/product/${item.product.slug}`}
                      onClick={onClose}
                      className="w-20 aspect-[3/4] bg-[#0d0d0d] border border-white/5 shrink-0 overflow-hidden"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </Link>

                    {/* Metadata details */}
                    <div className="flex-1 flex flex-col justify-between py-0.5">
                      <div>
                        <div className="flex justify-between items-baseline gap-2 mb-1">
                          <h4 className="font-display font-bold text-[10px] sm:text-xs uppercase tracking-wider text-white truncate max-w-[160px]">
                            <Link to={`/product/${item.product.slug}`} onClick={onClose} className="hover:text-cyan-400 transition-colors">
                              {item.product.name}
                            </Link>
                          </h4>
                          <span className="font-mono text-cyan-400 text-[11px] font-medium shrink-0">
                            ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="text-[9px] uppercase tracking-widest text-white/40 font-sans flex gap-2 flex-wrap">
                          <span>{item.product.category}</span>
                          {item.selectedColor && (
                            <>
                              <span>•</span>
                              <span>{item.selectedColor}</span>
                            </>
                          )}
                          {item.selectedSize && (
                            <>
                              <span>•</span>
                              <span>Size: {item.selectedSize}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Quantity editors */}
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center border border-white/10 bg-white/[0.02]">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity - 1)}
                            className="p-1 px-2 text-white/50 hover:text-white transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3 text-xs font-mono font-medium text-white select-none">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity + 1)}
                            className="p-1 px-2 text-white/50 hover:text-white transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.product.id, item.selectedSize, item.selectedColor)}
                          className="text-[9px] font-display uppercase tracking-widest text-white/30 hover:text-red-400 transition-colors"
                        >
                          REMOVE
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary & Checkout */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-white/5 bg-[#090909] space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-[9px] font-display uppercase tracking-[0.25em] text-white/40">
                    Estimated Total
                  </span>
                  <span className="font-mono text-lg text-fuchsia-500 font-bold">
                    ₹{cartTotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-[9px] text-white/30 leading-relaxed font-sans font-light">
                  Archival print-on-demand fulfillment. Taxes calculated at shipping.
                </p>
                <Link
                  to="/checkout"
                  onClick={onClose}
                  className="w-full py-4 bg-white hover:bg-cyan-400 text-black text-center font-display font-bold uppercase tracking-[0.25em] text-[10px] transition-colors block"
                >
                  PROCEED TO CHECKOUT
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
