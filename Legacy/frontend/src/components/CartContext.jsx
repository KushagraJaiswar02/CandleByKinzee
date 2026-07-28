import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'ck_cart';

// Normalize items on read — ensure every item has a stable _lineId
function readCart() {
  try {
    const items = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]');
    return items.map((item, i) => ({
      ...item,
      _lineId: item._lineId || `line-${i}-${item.productId || i}`,
    }));
  } catch {
    return [];
  }
}

function writeCart(items) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(readCart);

  // Persist to sessionStorage on every cart change
  useEffect(() => {
    writeCart(cart);
  }, [cart]);

  const addToCart = useCallback((item) => {
    setCart((prev) => {
      const existing = prev.find(
        (c) =>
          c.productId === item.productId &&
          JSON.stringify(c.selectedOptions) === JSON.stringify(item.selectedOptions)
      );
      if (existing) {
        // Increment qty on existing line — _lineId is preserved via spread
        return prev.map((c) =>
          c._lineId === existing._lineId
            ? { ...c, qty: c.qty + (item.qty || 1) }
            : c
        );
      }
      // New item — assign a stable _lineId immediately into state
      return [
        ...prev,
        {
          ...item,
          qty: item.qty || 1,
          _lineId: `line-${Date.now()}-${item.productId}`,
        },
      ];
    });
  }, []);

  const removeFromCart = useCallback((lineId) => {
    setCart((prev) => prev.filter((c) => c._lineId !== lineId));
  }, []);

  const updateQty = useCallback((lineId, qty) => {
    if (qty < 1) return;
    setCart((prev) =>
      prev.map((c) => (c._lineId === lineId ? { ...c, qty } : c))
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  // Totals computed directly from cart state (no derived array)
  const cartCount = cart.reduce((acc, c) => acc + (c.qty || 1), 0);
  const cartTotal = cart.reduce((acc, c) => acc + (c.basePrice || 0) * (c.qty || 1), 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
