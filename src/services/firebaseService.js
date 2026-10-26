import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { DEFAULT_FIREBASE_CONFIG, FIREBASE_COLLECTIONS } from '../config/firebaseConfig';
import { getWishlist, saveWishlist, getOrders, saveOrders } from '../storage/appStorage';

/**
 * Firebase Service for Assignment 2
 * Implements real business use cases:
 * 1. Synchronizing Wishlist / Favorites items to Cloud Firestore
 * 2. Saving Order History records with timestamps to Cloud Firestore
 * 
 * Includes graceful offline/fallback handling to satisfy R08 & Failure Constraints.
 */
class FirebaseService {
  constructor() {
    this.app = null;
    this.db = null;
    this.isInitialized = false;
    this.initError = null;
    this.init();
  }

  init(customConfig = null) {
    try {
      const config = customConfig || DEFAULT_FIREBASE_CONFIG;
      if (!getApps().length) {
        this.app = initializeApp(config);
      } else {
        this.app = getApp();
      }
      this.db = getFirestore(this.app);
      this.isInitialized = true;
      this.initError = null;
    } catch (err) {
      console.warn('[FirebaseService] Modular init skipped or operating in resilient fallback mode:', err.message);
      this.isInitialized = false;
      this.initError = err.message;
    }
  }

  /**
   * Status check for UI indicator
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      error: this.initError,
      mode: this.isInitialized && !this.initError ? 'Cloud Firestore Sync' : 'Local Persistence Fallback',
    };
  }

  // ==================== WISHLIST BUSINESS USE CASE ====================

  /**
   * Save an item to Wishlist (Firestore + Local fallback)
   * @param {object} product
   * @returns {Promise<{ success: boolean, syncedCloud: boolean, error?: string }>}
   */
  async addToWishlist(product) {
    if (!product || !product.id) return { success: false, syncedCloud: false };

    // 1. Update local storage first for instant feedback & resilience
    const currentList = await getWishlist();
    const exists = currentList.some((item) => item.id === product.id);
    let updatedList = currentList;
    if (!exists) {
      updatedList = [product, ...currentList];
      await saveWishlist(updatedList);
    }

    // 2. Sync to Firebase Firestore if online
    if (this.isInitialized && this.db) {
      try {
        const itemRef = doc(this.db, FIREBASE_COLLECTIONS.WISHLIST, String(product.id));
        await setDoc(itemRef, {
          id: product.id,
          title: product.title,
          price: product.price,
          thumbnail: product.thumbnail || '',
          category: product.category || '',
          rating: product.rating || 0,
          addedAt: serverTimestamp(),
        });
        return { success: true, syncedCloud: true };
      } catch (err) {
        console.warn('[FirebaseService] Firestore write failed, cached locally:', err.message);
        return { success: true, syncedCloud: false, error: err.message };
      }
    }

    return { success: true, syncedCloud: false };
  }

  /**
   * Remove an item from Wishlist (Firestore + Local)
   * @param {number|string} productId
   * @returns {Promise<{ success: boolean, syncedCloud: boolean }>}
   */
  async removeFromWishlist(productId) {
    // 1. Remove from local storage
    const currentList = await getWishlist();
    const updated = currentList.filter((item) => String(item.id) !== String(productId));
    await saveWishlist(updated);

    // 2. Remove from Firestore
    if (this.isInitialized && this.db) {
      try {
        const itemRef = doc(this.db, FIREBASE_COLLECTIONS.WISHLIST, String(productId));
        await deleteDoc(itemRef);
        return { success: true, syncedCloud: true };
      } catch (err) {
        console.warn('[FirebaseService] Firestore delete failed:', err.message);
        return { success: true, syncedCloud: false };
      }
    }

    return { success: true, syncedCloud: false };
  }

  /**
   * Fetch all Wishlist items (Firestore with local fallback)
   * @returns {Promise<{ items: Array, source: 'cloud' | 'local', error?: string }>}
   */
  async getWishlistItems() {
    if (this.isInitialized && this.db) {
      try {
        const colRef = collection(this.db, FIREBASE_COLLECTIONS.WISHLIST);
        const snapshot = await getDocs(colRef);
        const items = [];
        snapshot.forEach((docSnapshot) => {
          items.push(docSnapshot.data());
        });
        
        if (items.length > 0) {
          // Keep local storage in sync
          await saveWishlist(items);
          return { items, source: 'cloud' };
        }
      } catch (err) {
        console.warn('[FirebaseService] Firestore read failed, falling back to local storage:', err.message);
      }
    }

    // Safe fallback to local storage
    const local = await getWishlist();
    return { items: local, source: 'local' };
  }

  // ==================== ORDER HISTORY BUSINESS USE CASE ====================

  /**
   * Record a completed order in Firebase Firestore
   * @param {object} orderData
   * @returns {Promise<{ success: boolean, orderId: string, syncedCloud: boolean }>}
   */
  async createOrder(orderData) {
    const orderId = `ORD-${Date.now().toString().slice(-6)}`;
    const fullOrder = {
      orderId,
      items: orderData.items || [],
      totalAmount: orderData.totalAmount || 0,
      totalItems: orderData.totalItems || 0,
      createdAt: new Date().toISOString(),
      status: 'Đã xác nhận',
    };

    // 1. Save to local storage
    const currentOrders = await getOrders();
    const updated = [fullOrder, ...currentOrders];
    await saveOrders(updated);

    // 2. Sync to Firestore
    if (this.isInitialized && this.db) {
      try {
        const orderRef = doc(this.db, FIREBASE_COLLECTIONS.ORDERS, orderId);
        await setDoc(orderRef, {
          ...fullOrder,
          serverTimestamp: serverTimestamp(),
        });
        return { success: true, orderId, syncedCloud: true };
      } catch (err) {
        console.warn('[FirebaseService] Firestore order write failed, preserved in local storage:', err.message);
        return { success: true, orderId, syncedCloud: false };
      }
    }

    return { success: true, orderId, syncedCloud: false };
  }

  /**
   * Get all Orders history
   * @returns {Promise<Array>}
   */
  async getOrderHistory() {
    if (this.isInitialized && this.db) {
      try {
        const colRef = collection(this.db, FIREBASE_COLLECTIONS.ORDERS);
        const snapshot = await getDocs(colRef);
        const orders = [];
        snapshot.forEach((d) => orders.push(d.data()));
        if (orders.length > 0) {
          await saveOrders(orders);
          return orders;
        }
      } catch (err) {
        console.warn('[FirebaseService] Order fetch fallback:', err.message);
      }
    }
    return await getOrders();
  }
}

export const firebaseService = new FirebaseService();
