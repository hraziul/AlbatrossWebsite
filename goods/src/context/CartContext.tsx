import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';

export interface CartItem {
  product: Product;
  selectedSize: string;
  /** Undefined for products with no color variants (e.g. single-color items) */
  selectedColor?: string;
  /** Printrove's per-SKU variant id — required for fulfillment to produce the right size/color */
  variantId?: number;
  quantity: number;
}

/** Two cart lines are "the same" only if product, size, AND color all match */
function sameLine(item: CartItem, productId: string, size: string, color?: string): boolean {
  return item.product.id === productId && item.selectedSize === size && item.selectedColor === color;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, size: string, color?: string, variantId?: number, quantity?: number) => void;
  removeFromCart: (productId: string, size: string, color?: string) => void;
  updateQuantity: (productId: string, size: string, color: string | undefined, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('albatross_cart');
      if (stored) {
        setCartItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage', e);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('albatross_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cartItems]);

  const addToCart = (product: Product, size: string, color?: string, variantId?: number, quantity = 1) => {
    setCartItems(prev => {
      const existingIdx = prev.findIndex(item => sameLine(item, product.id, size, color));

      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx].quantity += quantity;
        return next;
      }

      return [...prev, { product, selectedSize: size, selectedColor: color, variantId, quantity }];
    });
  };

  const removeFromCart = (productId: string, size: string, color?: string) => {
    setCartItems(prev => prev.filter(item => !sameLine(item, productId, size, color)));
  };

  const updateQuantity = (productId: string, size: string, color: string | undefined, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color);
      return;
    }
    setCartItems(prev => prev.map(item => {
      if (sameLine(item, productId, size, color)) {
        return { ...item, quantity };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartCount,
      cartTotal,
      isCartOpen,
      setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
