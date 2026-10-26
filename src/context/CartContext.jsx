import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { getCart, saveCart } from '../storage/appStorage';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartLoading, setIsCartLoading] = useState(true);

  // Hydrate cart from AsyncStorage on app startup (R07)
  useEffect(() => {
    let isMounted = true;
    const hydrateCart = async () => {
      const storedItems = await getCart();
      if (isMounted) {
        setCartItems(storedItems);
        setIsCartLoading(false);
      }
    };
    hydrateCart();
    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Helper to persist updated cart state
   */
  const persistAndSetCart = async (nextCart) => {
    setCartItems(nextCart);
    await saveCart(nextCart);
  };

  /**
   * Add a product to the cart (or increment quantity if already exists - TC 06)
   * @param {object} product
   * @param {number} quantity
   */
  const addToCart = useCallback(
    async (product, quantity = 1) => {
      if (!product || !product.id) return;
      const addQty = Math.max(1, quantity);

      setCartItems((prevItems) => {
        const existingIndex = prevItems.findIndex((item) => item.id === product.id);
        let nextCart;

        if (existingIndex > -1) {
          // Increment existing product quantity
          nextCart = prevItems.map((item, idx) =>
            idx === existingIndex
              ? { ...item, quantity: item.quantity + addQty }
              : item
          );
        } else {
          // Add new product item
          const newItem = {
            id: product.id,
            title: product.title,
            price: Number(product.price) || 0,
            thumbnail: product.thumbnail || (product.images && product.images[0]) || '',
            category: product.category || '',
            discountPercentage: product.discountPercentage || 0,
            quantity: addQty,
          };
          nextCart = [newItem, ...prevItems];
        }

        saveCart(nextCart);
        return nextCart;
      });
    },
    []
  );

  /**
   * Update item quantity (automatically removes item if quantity becomes <= 0 - TC 07)
   * @param {number|string} productId
   * @param {number} newQuantity
   */
  const updateQuantity = useCallback(
    async (productId, newQuantity) => {
      setCartItems((prevItems) => {
        let nextCart;
        if (newQuantity <= 0) {
          nextCart = prevItems.filter((item) => item.id !== productId);
        } else {
          nextCart = prevItems.map((item) =>
            item.id === productId ? { ...item, quantity: Math.floor(newQuantity) } : item
          );
        }
        saveCart(nextCart);
        return nextCart;
      });
    },
    []
  );

  /**
   * Remove item directly from cart
   * @param {number|string} productId
   */
  const removeFromCart = useCallback(
    async (productId) => {
      setCartItems((prevItems) => {
        const nextCart = prevItems.filter((item) => item.id !== productId);
        saveCart(nextCart);
        return nextCart;
      });
    },
    []
  );

  /**
   * Clear all items in cart (e.g. after successful checkout)
   */
  const clearCart = useCallback(async () => {
    await persistAndSetCart([]);
  }, []);

  /**
   * DERIVED TOTALS (R06 & CLO9 Architectural Principle)
   * Computed dynamically to guarantee a Single Source of Truth
   */
  const { totalItems, subtotal, discount, shipping, totalAmount } = useMemo(() => {
    let itemsCount = 0;
    let rawSubtotal = 0;
    let totalDiscount = 0;

    cartItems.forEach((item) => {
      const qty = item.quantity || 1;
      const price = Number(item.price) || 0;
      itemsCount += qty;
      rawSubtotal += price * qty;

      if (item.discountPercentage && item.discountPercentage > 0) {
        const savedPerItem = (price * item.discountPercentage) / 100;
        totalDiscount += savedPerItem * qty;
      }
    });

    // Business rules: free shipping if subtotal > $50, otherwise $4.99
    const computedShipping = itemsCount === 0 || rawSubtotal > 50 ? 0 : 4.99;
    const finalTotal = Math.max(0, rawSubtotal - totalDiscount + computedShipping);

    return {
      totalItems: itemsCount,
      subtotal: Math.round(rawSubtotal * 100) / 100,
      discount: Math.round(totalDiscount * 100) / 100,
      shipping: computedShipping,
      totalAmount: Math.round(finalTotal * 100) / 100,
    };
  }, [cartItems]);

  const value = useMemo(
    () => ({
      cartItems,
      isCartLoading,
      totalItems,
      subtotal,
      discount,
      shipping,
      totalAmount,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
    }),
    [
      cartItems,
      isCartLoading,
      totalItems,
      subtotal,
      discount,
      shipping,
      totalAmount,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
