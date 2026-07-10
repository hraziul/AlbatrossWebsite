/**
 * useProductData.ts
 *
 * React hook that ensures components re-render and receive the up-to-date
 * products and categories dynamically once the Printrove cache has loaded.
 */

import { useState, useEffect } from 'react';
import { onCacheLoaded, products as getProducts, categories as getCategories } from '../data';
import type { Product, Category } from '../types';

interface ProductDataResult {
  products: Product[];
  categories: Category[];
  ready: boolean;
}

export function useProductData(): ProductDataResult {
  const [data, setData] = useState<ProductDataResult>({
    products: [...getProducts],
    categories: [...getCategories],
    ready: false
  });

  useEffect(() => {
    // If cache is already loaded on mount, set it immediately
    setData({
      products: [...getProducts],
      categories: [...getCategories],
      ready: true
    });

    const unsub = onCacheLoaded(() => {
      setData({
        products: [...getProducts],
        categories: [...getCategories],
        ready: true
      });
    });
    return unsub;
  }, []);

  return data;
}
