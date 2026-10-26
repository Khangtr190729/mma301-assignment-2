import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { firebaseService } from '../services/firebaseService';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState(firebaseService.getStatus());

  // Load wishlist and order history on startup
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const [wishlistRes, orderHistory] = await Promise.all([
          firebaseService.getWishlistItems(),
          firebaseService.getOrderHistory(),
        ]);

        if (isMounted) {
          setWishlist(wishlistRes.items || []);
          setOrders(orderHistory || []);
          setSyncStatus(firebaseService.getStatus());
          setIsLoading(false);
        }
      } catch (err) {
        console.warn('[WishlistContext] Initial load error:', err);
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Check if a product is in wishlist
   */
  const isWishlisted = useCallback(
    (productId) => wishlist.some((item) => String(item.id) === String(productId)),
    [wishlist]
  );

  /**
   * Toggle product in wishlist (Add/Remove with Firebase sync - R08)
   */
  const toggleWishlist = useCallback(
    async (product) => {
      if (!product || !product.id) return;
      const exists = wishlist.some((item) => String(item.id) === String(product.id));

      if (exists) {
        // Optimistic UI update
        setWishlist((prev) => prev.filter((item) => String(item.id) !== String(product.id)));
        await firebaseService.removeFromWishlist(product.id);
      } else {
        // Optimistic UI update
        setWishlist((prev) => [product, ...prev]);
        await firebaseService.addToWishlist(product);
      }
    },
    [wishlist]
  );

  /**
   * Place an order (Record in Firebase & local orders - R08)
   */
  const placeOrder = useCallback(async ({ items, totalAmount, totalItems }) => {
    const res = await firebaseService.createOrder({ items, totalAmount, totalItems });
    const orderRecord = {
      orderId: res.orderId,
      items,
      totalAmount,
      totalItems,
      createdAt: new Date().toISOString(),
      status: 'Đã xác nhận',
      syncedCloud: res.syncedCloud,
    };
    setOrders((prev) => [orderRecord, ...prev]);
    return res;
  }, []);

  const value = useMemo(
    () => ({
      wishlist,
      orders,
      isLoading,
      syncStatus,
      isWishlisted,
      toggleWishlist,
      placeOrder,
    }),
    [wishlist, orders, isLoading, syncStatus, isWishlisted, toggleWishlist, placeOrder]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};
