/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useEffect, useMemo, useState } from "react";

export const CartContext = createContext(null);
const storageKey = "vera-cart";

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => { try { return JSON.parse(localStorage.getItem(storageKey)) || []; } catch { return []; } });
  useEffect(() => localStorage.setItem(storageKey, JSON.stringify(items)), [items]);
  const addItem = useCallback((product, size) => setItems((current) => {
    const key = `${product._id}-${size}`;
    const existing = current.find((item) => item.key === key);
    if (existing) return current.map((item) => item.key === key ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) } : item);
    return [...current, { key, productId: product._id, name: product.name, image: product.image, price: product.price, size, stock: product.stock, quantity: 1 }];
  }), []);
  const updateQuantity = useCallback((key, quantity) => setItems((current) => current.map((item) => item.key === key ? { ...item, quantity: Math.max(1, Math.min(Number(quantity) || 1, item.stock)) } : item)), []);
  const removeItem = useCallback((key) => setItems((current) => current.filter((item) => item.key !== key)), []);
  const clearCart = useCallback(() => setItems([]), []);
  const value = useMemo(() => ({ items, addItem, updateQuantity, removeItem, clearCart, count: items.reduce((sum, item) => sum + item.quantity, 0), total: items.reduce((sum, item) => sum + item.price * item.quantity, 0) }), [items, addItem, updateQuantity, removeItem, clearCart]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
