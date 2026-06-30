'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from './DataContext';
import { useData } from './DataContext';

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const getProductStock = (p: Product) => (typeof p.stock === 'number' && p.stock >= 0 ? p.stock : 999);

export function CartProvider({ children }: { children: ReactNode }) {
  const { products } = useData();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('cart');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setCartItems(parsed);
          } else {
            console.error('Invalid cart data in localStorage, resetting to empty array');
            localStorage.removeItem('cart');
            setCartItems([]);
          }
        } catch (e) {
          console.error('Error loading cart from localStorage', e);
          localStorage.removeItem('cart');
          setCartItems([]);
        }
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  // Sync cart with latest product stock: clamp quantity and refresh product snapshot
  useEffect(() => {
    if (products.length === 0) return;
    setCartItems((prev) => {
      const next = prev.map((item) => {
        const latest = products.find((p) => p.id === item.productId);
        if (!latest) return item;
        const maxStock = getProductStock(latest);
        const clampedQty = Math.min(item.quantity, maxStock);
        if (clampedQty <= 0) return null;
        return {
          ...item,
          quantity: clampedQty,
          product: latest,
        };
      });
      return next.filter(Boolean) as CartItem[];
    });
  }, [products]);

  const addToCart = (product: Product, quantity: number = 1) => {
    const maxStock = getProductStock(product);
    if (maxStock <= 0) return;
    const toAdd = Math.min(quantity, maxStock);
    setCartItems((prev) => {
      const currentItems = Array.isArray(prev) ? prev : [];
      const existingItem = currentItems.find((item) => item.productId === product.id);
      if (existingItem) {
        const newQty = Math.min(existingItem.quantity + toAdd, getProductStock(existingItem.product));
        if (newQty <= 0) return currentItems.filter((item) => item.productId !== product.id);
        return currentItems.map((item) =>
          item.productId === product.id ? { ...item, quantity: newQty, product } : item
        );
      }
      return [...currentItems, { productId: product.id, product, quantity: toAdd }];
    });
    setIsOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prev) => {
      const currentItems = Array.isArray(prev) ? prev : [];
      return currentItems.filter((item) => item.productId !== productId);
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) => {
      const currentItems = Array.isArray(prev) ? prev : [];
      return currentItems.map((item) => {
        if (item.productId !== productId) return item;
        const maxStock = getProductStock(item.product);
        const newQty = Math.min(quantity, maxStock);
        if (newQty <= 0) return null;
        return { ...item, quantity: newQty };
      }).filter(Boolean) as CartItem[];
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotal = () => {
    if (!Array.isArray(cartItems)) return 0;
    return cartItems.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);
  };

  const cartCount = Array.isArray(cartItems) 
    ? cartItems.reduce((count, item) => count + item.quantity, 0)
    : 0;

  // Ensure cartItems is always an array before providing to context
  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];

  return (
    <CartContext.Provider
      value={{
        cartItems: safeCartItems,
        cartCount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotal,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

