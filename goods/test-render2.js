import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Layout from './src/components/Layout';
import Home from './src/pages/Home';
import Collection from './src/pages/Collection';

const AppTest = () => (
  <MemoryRouter>
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="collection" element={<Collection />} />
      </Route>
    </Routes>
  </MemoryRouter>
);

try {
  const html = renderToString(React.createElement(AppTest));
  console.log("Render successful");
} catch (error) {
  console.error("Render failed:", error);
}
