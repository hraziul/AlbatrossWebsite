import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { ShieldCheck, Loader2, Package } from 'lucide-react';
import { LAST_ORDER_STORAGE_KEY } from './OrderConfirmation';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  // UI states
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load Razorpay script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Basic Validation
    if (!name || !email || !phone || !address1 || !city || !state || !pincode) {
      setErrorMsg('Please fill in all required shipping and contact fields.');
      return;
    }

    if (cartItems.length === 0) {
      setErrorMsg('Your cart is empty.');
      return;
    }

    setIsProcessing(true);
    console.log('[Checkout] Starting checkout — cart total ₹' + cartTotal, cartItems);

    // Snapshot cart/customer details now — cartItems gets cleared from
    // context once payment succeeds, but the Razorpay handler below (and the
    // confirmation page after it) still need this exact snapshot.
    const orderCustomer = { name, email, phone, address1, address2, city, state, pincode };
    const orderCartItems = cartItems.map(item => ({
      id: item.product.id,
      name: item.product.name,
      size: item.selectedSize,
      color: item.selectedColor,
      quantity: item.quantity,
      baseProductId: item.product.baseProductId,
      variantId: item.variantId,
    }));

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Razorpay payment gateway failed to load. Please check your internet connection.');
      }
      console.log('[Checkout] Razorpay checkout.js loaded.');

      // 1. Create the order via the backend API. The backend returns the exact
      // key_id the order was created with, so checkout.js can never open with a
      // different/stale key than the order — that mismatch is what causes
      // Razorpay's generic "Oops! Something went wrong" failure.
      //
      // Customer + cart are sent now too (not just at verify time) and saved
      // server-side as a pending order — this is what lets the webhook
      // confirm the order later with full context, independent of whether
      // this browser tab ever comes back after payment.
      let orderRes: Response;
      try {
        orderRes = await fetch('/api/checkout/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: cartTotal,
            customer: {
              name: orderCustomer.name,
              email: orderCustomer.email,
              number: parseInt(orderCustomer.phone),
              address1: orderCustomer.address1,
              address2: orderCustomer.address2,
              pincode: parseInt(orderCustomer.pincode),
              state: orderCustomer.state,
              city: orderCustomer.city,
              country: 'India',
            },
            cartItems: orderCartItems,
          }),
        });
      } catch (err) {
        // A thrown fetch (vs. a non-2xx response) means nothing answered at
        // all — in local dev that's almost always the Express backend simply
        // not running, since it's a separate process from `npm run dev`.
        const isLocalDev = ['localhost', '127.0.0.1'].includes(window.location.hostname);
        const hint = isLocalDev
          ? ' The backend server isn\'t running — start it with `node server.js` (or `npm run start`) in a separate terminal alongside `npm run dev`, then try again.'
          : ' Please check your connection and try again.';
        console.error(
          '[Albatross Checkout] fetch(/api/checkout/create-order) failed to connect — the backend is unreachable, not just slow.',
          err
        );
        throw new Error(`Could not reach the payment server.${hint}`);
      }

      if (!orderRes.ok) {
        const errData = await orderRes.json().catch(() => ({}));
        // Distinct from the network-failure case above: we DID reach the
        // backend, it just isn't configured to accept payments yet (missing
        // Razorpay keys) — surface that distinction rather than a generic message.
        console.error('[Albatross Checkout] Backend reached but rejected order creation:', errData);
        // appCore.js uses `message` for the 503 gateway_not_configured case but
        // `error` for the 401 (bad keys) and 500 (generic) cases — reading only
        // `message` silently discarded the real reason for those two and always
        // fell back to the same generic banner, making all three failure modes
        // look identical on screen. Read both so the actual backend reason shows.
        throw new Error(
          errData.message || errData.error || 'Payment gateway is not available right now. Please try again shortly or contact support.'
        );
      }

      const orderData = await orderRes.json();
      const backendOrderId = orderData.id;
      const amountInPaise = orderData.amount;
      const gatewayKeyId = orderData.key_id;
      console.log(`[Checkout] Razorpay order created: ${backendOrderId} (₹${amountInPaise / 100})`);

      if (!backendOrderId || !gatewayKeyId) {
        throw new Error('Payment gateway is not configured yet. Please contact support.');
      }

      // 2. Configure Razorpay Standard Options
      const options = {
        key: gatewayKeyId,
        amount: amountInPaise,
        currency: 'INR',
        name: 'Albatross Goods India',
        description: 'Streetwear & Graphics order',
        order_id: backendOrderId,
        prefill: {
          name: name,
          email: email,
          contact: phone,
        },
        theme: {
          color: '#22d3ee', // Cyan accent
        },
        handler: async function (response: any) {
          // If you don't see this log after completing a test payment, the
          // Razorpay success handler itself never fired — that's a Razorpay/
          // browser-side issue (closed tab, blocked popup, etc.), not a
          // backend one. Everything after this line assumes it DID fire.
          console.log('[Checkout] Razorpay handler fired — payment succeeded on Razorpay\'s side.', response);
          setIsProcessing(true);
          // Razorpay has already captured the charge by the time this handler
          // fires — every failure path below must assume the customer's money
          // has moved, so we never silently invent success, but we also always
          // surface the payment ID so a real payment can be reconciled manually.
          const paymentId = response.razorpay_payment_id;
          try {
            console.log('[Checkout] Calling /api/checkout/verify-payment...');
            let verifyRes: Response;
            try {
              verifyRes = await fetch('/api/checkout/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  customer: {
                    name: orderCustomer.name,
                    email: orderCustomer.email,
                    number: parseInt(orderCustomer.phone),
                    address1: orderCustomer.address1,
                    address2: orderCustomer.address2,
                    pincode: parseInt(orderCustomer.pincode),
                    state: orderCustomer.state,
                    city: orderCustomer.city,
                    country: 'India'
                  },
                  cartItems: orderCartItems,
                }),
              });
            } catch (err) {
              console.error('[Checkout] verify-payment fetch failed to connect — payment succeeded but we could not reach the backend to confirm it.', err);
              throw new Error(
                `Your payment was received, but we couldn't reach our server to confirm it. Please save this payment ID and email ArtsyCheezein@gmail.com: ${paymentId}`
              );
            }

            if (!verifyRes.ok) {
              const errData = await verifyRes.json().catch(() => ({} as any));
              console.error('[Checkout] verify-payment reached the backend but it rejected the request:', verifyRes.status, errData);
              throw new Error(
                `${errData.error || 'Payment verification failed.'} Please save this payment ID and email ArtsyCheezein@gmail.com so we can confirm your order: ${paymentId}`
              );
            }

            const verifyData = await verifyRes.json();
            const referenceNumber = verifyData.reference_number || paymentId;
            console.log(`[Checkout] ✓ Order confirmed: ${referenceNumber}. Printrove: ${verifyData.printrove ? 'submitted' : 'skipped/failed — check server logs'}. Redirecting to /order-confirmed.`);

            // Persisted (not just component state) so the confirmation page
            // survives a reload/redirect — the entire point of this fix.
            localStorage.setItem(LAST_ORDER_STORAGE_KEY, JSON.stringify({
              referenceNumber,
              customerName: orderCustomer.name,
              confirmedAt: new Date().toISOString(),
            }));
            clearCart();
            navigate('/order-confirmed');
          } catch (err: any) {
            console.error('[Checkout] Post-payment confirmation failed:', err);
            setErrorMsg(err.message || 'Payment verification failed.');
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      // Distinct from modal.ondismiss (user closed the modal): this fires
      // when Razorpay itself declines the attempt (card declined, insufficient
      // funds, etc.) while the modal may still be open.
      rzp.on('payment.failed', function (response: any) {
        console.error('[Checkout] Razorpay payment.failed event:', response.error);
        setIsProcessing(false);
        setErrorMsg(
          response.error?.description || 'Payment failed. Please try again or use a different payment method.'
        );
      });
      console.log('[Checkout] Opening Razorpay modal for order', backendOrderId);
      rzp.open();
    } catch (err: any) {
      console.error('[Checkout] Failed to initiate checkout:', err);
      setErrorMsg(err.message || 'Failed to initiate checkout.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-10 bg-transparent min-h-screen">
      <SEO title="Checkout | Albatross Goods India" description="Secure payment checkout portal." />
      
      <div className="mb-10 border-b border-white/5 pb-6">
        <span className="text-[8px] font-display font-bold uppercase tracking-[0.25em] text-fuchsia-500 block mb-1">
          ✦ SECURE PAYMENT GATEWAY
        </span>
        <h1 className="text-3xl font-display font-bold uppercase tracking-tight text-white">
          Checkout
        </h1>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-20 border border-white/5 bg-[#070707] max-w-md mx-auto rounded-sm">
          <Package className="w-10 h-10 text-white/20 mx-auto mb-4" />
          <span className="text-xl block mb-2 font-serif italic text-white/30">Your bag is empty</span>
          <p className="text-white/20 uppercase tracking-[0.25em] text-[8px] font-display mb-6">
            Add items to curate before checking out.
          </p>
          <Link
            to="/collection"
            className="px-6 py-2.5 bg-white hover:bg-cyan-400 text-black text-[9px] font-display font-bold uppercase tracking-[0.2em] transition-colors"
          >
            EXPLORE CATALOG
          </Link>
        </div>
      ) : (
        <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left panel — Shipping information */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-6">
              <h2 className="text-[10px] font-display font-bold uppercase tracking-[0.2em] text-white/40 border-b border-white/10 pb-2">
                Shipping & Contact Information
              </h2>
              
              {errorMsg && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-sm">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[8px] uppercase tracking-widest text-white/40 font-mono">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-white/10 px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-400 rounded-sm"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[8px] uppercase tracking-widest text-white/40 font-mono">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-white/10 px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-400 rounded-sm"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[8px] uppercase tracking-widest text-white/40 font-mono">Phone Number (10 Digit) *</label>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-white/10 px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-400 rounded-sm"
                    placeholder="9876543210"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[8px] uppercase tracking-widest text-white/40 font-mono">Address Line 1 *</label>
                  <input
                    type="text"
                    required
                    value={address1}
                    onChange={(e) => setAddress1(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-white/10 px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-400 rounded-sm"
                    placeholder="Street Address, Flat/House No."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[8px] uppercase tracking-widest text-white/40 font-mono">Address Line 2 (Optional)</label>
                  <input
                    type="text"
                    value={address2}
                    onChange={(e) => setAddress2(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-white/10 px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-400 rounded-sm"
                    placeholder="Landmark, Area Details"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[8px] uppercase tracking-widest text-white/40 font-mono">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-white/10 px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-400 rounded-sm"
                    placeholder="Mumbai"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[8px] uppercase tracking-widest text-white/40 font-mono">State *</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-white/10 px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-400 rounded-sm"
                    placeholder="Maharashtra"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[8px] uppercase tracking-widest text-white/40 font-mono">PIN Code (6 Digit) *</label>
                  <input
                    type="text"
                    required
                    pattern="[0-9]{6}"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-white/10 px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-400 rounded-sm"
                    placeholder="400001"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-[10px] font-display font-bold uppercase tracking-[0.2em] text-white/40 border-b border-white/10 pb-2">
                Payment Processor
              </h2>
              <div className="p-4 border border-cyan-400/20 bg-cyan-400/5 flex items-center justify-between rounded-sm">
                <div className="flex items-center gap-3">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-cyan-400 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  </div>
                  <span className="font-display font-bold uppercase tracking-wider text-[10px] text-white">
                    Razorpay Checkout (UPI, Cards, Netbanking)
                  </span>
                </div>
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4.5 bg-white text-black font-display font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-cyan-400 transition-colors duration-300 flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(255,255,255,0.05)]"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  PROCESSING TRANSACTION...
                </>
              ) : (
                'COMPLETE ORDER'
              )}
            </button>
          </div>

          {/* Right panel — Order Summary */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#070707] border border-white/10 p-6 rounded-sm sticky top-24">
              <h2 className="text-[10px] font-display font-bold uppercase tracking-[0.2em] text-white/30 border-b border-white/10 pb-3 mb-5">
                Order Summary
              </h2>
              
              <div className="space-y-4 overflow-y-auto max-h-[30vh] border-b border-white/5 pb-5 mb-5 scrollbar-none">
                {cartItems.map((item) => (
                  <div key={`${item.product.id}-${item.selectedSize}-${item.selectedColor ?? ''}`} className="flex gap-3">
                    <div className="w-12 aspect-[3/4] bg-[#0d0d0d] border border-white/5 overflow-hidden shrink-0">
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <h4 className="text-[10px] font-display font-bold uppercase tracking-wider text-white truncate">
                          {item.product.name}
                        </h4>
                        <span className="text-[9px] text-white/40 uppercase tracking-widest font-sans">
                          {item.selectedColor ? `${item.selectedColor} • ` : ''}{item.selectedSize ? `Size: ${item.selectedSize} × ` : ''}{item.quantity}
                        </span>
                      </div>
                      <span className="font-mono text-cyan-400 text-xs font-medium">
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6 font-sans font-light">
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">Subtotal</span>
                  <span className="font-mono text-white/80">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">Custom Screen Printing</span>
                  <span className="text-green-400 text-[10px] font-display font-bold uppercase tracking-wider">Free</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">Shipping & Delivery</span>
                  <span className="text-green-400 text-[10px] font-display font-bold uppercase tracking-wider">Free</span>
                </div>
              </div>

              <div className="flex justify-between items-baseline text-md font-bold border-t border-white/10 pt-5">
                <span className="font-display uppercase tracking-widest text-xs text-white/60">Estimated Total</span>
                <span className="font-mono text-lg text-fuchsia-500 font-bold">
                  ₹{cartTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
