import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import App from './src/App.tsx';

const routes = [
  '/',
  '/collection',
  '/product/akira-cyberpunk-tee',
  '/request-design',
  '/checkout',
  '/about',
  '/help',
  '/shipping',
  '/contact'
];

// Replace BrowserRouter with MemoryRouter in App component conceptually
// We'll just render the sub-components manually for testing:

import { Routes, Route } from 'react-router-dom';
import Layout from './src/components/Layout';
import Home from './src/pages/Home';
import Collection from './src/pages/Collection';
import ProductDetail from './src/pages/ProductDetail';
import RequestDesign from './src/pages/RequestDesign';
import Checkout from './src/pages/Checkout';
import TextPage from './src/pages/TextPage';

const AppTest = ({ initialEntry }: { initialEntry: string }) => (
  <MemoryRouter initialEntries={[initialEntry]}>
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="collection" element={<Collection />} />
        <Route path="product/:slug" element={<ProductDetail />} />
        <Route path="request-design" element={<RequestDesign />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="about" element={<TextPage title="About Us">Content</TextPage>} />
      </Route>
    </Routes>
  </MemoryRouter>
);

routes.forEach(route => {
  try {
    renderToString(React.createElement(AppTest, { initialEntry: route }));
    console.log(`Render successful for route: ${route}`);
  } catch (error) {
    console.error(`Render failed for route: ${route}`, error);
  }
});
