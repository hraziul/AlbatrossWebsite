import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Collection from './pages/Collection';
import ProductDetail from './pages/ProductDetail';
import RequestDesign from './pages/RequestDesign';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import TextPage from './pages/TextPage';
import TrackOrder from './pages/TrackOrder';
import Returns from './pages/Returns';
import { loadProductCache } from './data';
import { CartProvider } from './context/CartContext';

// React Router's basename must NOT have a trailing slash — "/goods/" fails to
// match the bare path "/goods" (no trailing slash) and renders nothing, even
// though "/goods/anything" matches fine. Vite's BASE_URL always has a
// trailing slash ("/goods/" in prod, "/" in dev), so it's stripped here.
const ROUTER_BASENAME = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

export default function App() {
  // Fetch /products-cache.json once on mount.
  // On success, module-level `products` and `categories` arrays in data.ts
  // are replaced with live Printrove data and subscribers are notified.
  // On failure, the static fallback embedded in the bundle is used silently.
  useEffect(() => {
    loadProductCache();
  }, []);

  return (
    <CartProvider>
      {/* Matches vite.config.ts's `base` — "/goods" in production, "/" in
          local dev — so every <Link>/navigate() path in this app
          automatically resolves under /goods without rewriting each one. */}
      <BrowserRouter basename={ROUTER_BASENAME}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="collection" element={<Collection />} />
            <Route path="product/:slug" element={<ProductDetail />} />
            <Route path="request-design" element={<RequestDesign />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="order-confirmed" element={<OrderConfirmation />} />
            <Route path="track" element={<TrackOrder />} />
            <Route path="returns" element={<Returns />} />
            <Route path="about" element={
              <TextPage
                title="About Us"
                description="Learn about Albatross Goods India, a premium creative streetwear label. Our clothing is inspired by cult cinema, underground music, and visual culture."
              >
                <h2 className="text-xl font-bold uppercase text-white tracking-widest mt-12 mb-4">Our Vision</h2>
                <p>Albatross Goods India was founded on the belief that clothing should be a canvas for cultural obsessions. We curate and craft premium apparel inspired by cult cinema, underground music, and avant-garde visual arts.</p>
                <h2 className="text-xl font-bold uppercase text-white tracking-widest mt-12 mb-4">The Craft</h2>
                <p>Every garment is constructed from heavyweight, locally sourced cotton. We employ high-fidelity printing techniques to ensure our graphics endure as long as the subcultures that inspired them.</p>
                <h2 className="text-xl font-bold uppercase text-white tracking-widest mt-12 mb-4">The Community</h2>
                <p>We work closely with independent artists, graphic designers, and musicians in India to foster a collaborative creative community. By providing a platform for custom design intake, we help visionaries bring limited runs of custom streetwear and collectible apparel to life.</p>
              </TextPage>
            } />
            <Route path="help" element={
              <TextPage
                title="FAQ"
                description="Frequently asked questions about Albatross Goods India. Find details on shipping timelines, returns, and custom design apparel drops."
              >
                <h2 className="text-xl font-bold uppercase text-white tracking-widest mt-12 mb-4">How long does shipping take?</h2>
                <p>All orders are processed within 48 hours. Delivery typically takes 3-5 business days across major metro areas in India, and 5-7 days for other locations.</p>
                <h2 className="text-xl font-bold uppercase text-white tracking-widest mt-12 mb-4">Do you restock limited editions?</h2>
                <p>No. Once a limited edition drop sells out, the screens are retired. We believe in preserving the rarity of our collections.</p>
              </TextPage>
            } />
            <Route path="shipping" element={
              <TextPage
                title="Shipping & Returns"
                description="Read our shipping policies, domestic delivery timelines across India, and terms for our limited edition custom apparel drops."
              >
                <h2 className="text-xl font-bold uppercase text-white tracking-widest mt-12 mb-4">Shipping Policy</h2>
                <p>We offer free standard shipping on all orders over ₹2,000 within India. All shipments are fully tracked and insured.</p>
                <h2 className="text-xl font-bold uppercase text-white tracking-widest mt-12 mb-4">Return Policy</h2>
                <p>Due to the limited nature of our drops, all sales are final. We only accept returns or exchanges in the case of manufacturing defects reported within 48 hours of delivery.</p>
              </TextPage>
            } />
            <Route path="contact" element={
              <TextPage
                title="Contact"
                description="Get in touch with Albatross Goods India. Email us for design collaborations, custom merch orders, and customer support."
              >
                <h2 className="text-xl font-bold uppercase text-white tracking-widest mt-12 mb-4">Get In Touch</h2>
                <p>For support, general inquiries, or press, please email us at:</p>
                <p className="text-cyan-400 font-mono">ArtsyCheezein@gmail.com</p>
                <p className="mt-8">We aim to respond to all inquiries within 24 hours during business days.</p>
              </TextPage>
            } />
            <Route path="privacy" element={
              <TextPage
                title="Privacy Policy"
                description="Privacy Policy for Albatross Goods India."
              >
                <h2 className="text-xl font-bold uppercase text-white tracking-widest mt-12 mb-4">Data Privacy</h2>
                <p>We respect your privacy. Any information collected during checkout or sign-up is used strictly for processing payments and dispatching your custom drops.</p>
              </TextPage>
            } />
            <Route path="terms" element={
              <TextPage
                title="Terms of Service"
                description="Terms of Service for Albatross Goods India."
              >
                <h2 className="text-xl font-bold uppercase text-white tracking-widest mt-12 mb-4">Custom Production Terms</h2>
                <p>By placing an order, you acknowledge that items are pressed to order. We do not support order cancellations once production begins.</p>
              </TextPage>
            } />
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}
