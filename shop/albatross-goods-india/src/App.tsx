import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Collection from './pages/Collection';
import ProductDetail from './pages/ProductDetail';
import RequestDesign from './pages/RequestDesign';
import Checkout from './pages/Checkout';
import TextPage from './pages/TextPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="collection" element={<Collection />} />
          <Route path="product/:slug" element={<ProductDetail />} />
          <Route path="request-design" element={<RequestDesign />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="about" element={
            <TextPage title="About Us">
              <h2 className="text-xl font-bold uppercase text-white tracking-widest mt-12 mb-4">Our Vision</h2>
              <p>Albatross Goods India was founded on the belief that clothing should be a canvas for cultural obsessions. We curate and craft premium apparel inspired by cult cinema, underground music, and avant-garde visual arts.</p>
              <h2 className="text-xl font-bold uppercase text-white tracking-widest mt-12 mb-4">The Craft</h2>
              <p>Every garment is constructed from heavyweight, locally sourced cotton. We employ high-fidelity printing techniques to ensure our graphics endure as long as the subcultures that inspired them.</p>
            </TextPage>
          } />
          <Route path="help" element={
            <TextPage title="FAQ">
              <h2 className="text-xl font-bold uppercase text-white tracking-widest mt-12 mb-4">How long does shipping take?</h2>
              <p>All orders are processed within 48 hours. Delivery typically takes 3-5 business days across major metro areas in India, and 5-7 days for other locations.</p>
              <h2 className="text-xl font-bold uppercase text-white tracking-widest mt-12 mb-4">Do you restock limited editions?</h2>
              <p>No. Once a limited edition drop sells out, the screens are retired. We believe in preserving the rarity of our collections.</p>
            </TextPage>
          } />
          <Route path="shipping" element={
            <TextPage title="Shipping & Returns">
              <h2 className="text-xl font-bold uppercase text-white tracking-widest mt-12 mb-4">Shipping Policy</h2>
              <p>We offer free standard shipping on all orders over ₹2,000 within India. All shipments are fully tracked and insured.</p>
              <h2 className="text-xl font-bold uppercase text-white tracking-widest mt-12 mb-4">Return Policy</h2>
              <p>Due to the limited nature of our drops, all sales are final. We only accept returns or exchanges in the case of manufacturing defects reported within 48 hours of delivery.</p>
            </TextPage>
          } />
          <Route path="contact" element={
            <TextPage title="Contact">
              <h2 className="text-xl font-bold uppercase text-white tracking-widest mt-12 mb-4">Get In Touch</h2>
              <p>For support, general inquiries, or press, please email us at:</p>
              <p className="text-cyan-400 font-mono">studio@albatrossgoods.in</p>
              <p className="mt-8">We aim to respond to all inquiries within 24 hours during business days.</p>
            </TextPage>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
