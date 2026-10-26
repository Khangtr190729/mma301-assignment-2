import AsyncStorage from '@react-native-async-storage/async-storage';

export const THEME_STORAGE_KEY = '@mma301_ass2_theme_mode_v1';
export const CART_STORAGE_KEY = '@mma301_ass2_cart_items_v1';
export const WISHLIST_STORAGE_KEY = '@mma301_ass2_wishlist_v1';
export const ORDERS_STORAGE_KEY = '@mma301_ass2_orders_v1';
export const GEMINI_KEY_STORAGE_KEY = '@mma301_ass2_gemini_api_key_v1';
export const NOTIFICATIONS_STORAGE_KEY = '@mma301_ass2_notifications_v1';

export const DEFAULT_THEME = 'light';

/**
 * Safe JSON Parse with fallback
 */
const safeJsonParse = (str, fallback) => {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch (err) {
    console.warn('[appStorage] JSON parse failed, returning fallback:', err);
    return fallback;
  }
};

/**
 * ---------------- THEME ----------------
 */
export const getTheme = async () => {
  try {
    const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    return DEFAULT_THEME;
  } catch (err) {
    console.warn('[appStorage] Error reading theme, using default:', err);
    return DEFAULT_THEME;
  }
};

export const saveTheme = async (themeMode) => {
  try {
    await AsyncStorage.setItem(THEME_STORAGE_KEY, themeMode);
    return true;
  } catch (err) {
    console.error('[appStorage] Error saving theme:', err);
    return false;
  }
};

/**
 * ---------------- CART PERSISTENCE (R07) ----------------
 */
export const getCart = async () => {
  try {
    const raw = await AsyncStorage.getItem(CART_STORAGE_KEY);
    const parsed = safeJsonParse(raw, []);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('[appStorage] Error reading cart, returning empty array:', err);
    return [];
  }
};

export const saveCart = async (cartItems) => {
  try {
    const cleanItems = Array.isArray(cartItems) ? cartItems : [];
    await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cleanItems));
    return true;
  } catch (err) {
    console.error('[appStorage] Error saving cart:', err);
    return false;
  }
};

/**
 * ---------------- WISHLIST PERSISTENCE ----------------
 */
export const getWishlist = async () => {
  try {
    const raw = await AsyncStorage.getItem(WISHLIST_STORAGE_KEY);
    const parsed = safeJsonParse(raw, []);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('[appStorage] Error reading wishlist:', err);
    return [];
  }
};

export const saveWishlist = async (wishlistItems) => {
  try {
    const cleanItems = Array.isArray(wishlistItems) ? wishlistItems : [];
    await AsyncStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(cleanItems));
    return true;
  } catch (err) {
    console.error('[appStorage] Error saving wishlist:', err);
    return false;
  }
};

/**
 * ---------------- ORDERS PERSISTENCE ----------------
 */
export const getOrders = async () => {
  try {
    const raw = await AsyncStorage.getItem(ORDERS_STORAGE_KEY);
    const parsed = safeJsonParse(raw, []);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('[appStorage] Error reading orders:', err);
    return [];
  }
};

export const saveOrders = async (orders) => {
  try {
    const cleanOrders = Array.isArray(orders) ? orders : [];
    await AsyncStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(cleanOrders));
    return true;
  } catch (err) {
    console.error('[appStorage] Error saving orders:', err);
    return false;
  }
};

/**
 * ---------------- GEMINI API KEY PERSISTENCE ----------------
 */
export const getGeminiApiKey = async () => {
  try {
    const key = await AsyncStorage.getItem(GEMINI_KEY_STORAGE_KEY);
    return key || '';
  } catch (err) {
    console.warn('[appStorage] Error reading Gemini key:', err);
    return '';
  }
};

export const saveGeminiApiKey = async (apiKey) => {
  try {
    await AsyncStorage.setItem(GEMINI_KEY_STORAGE_KEY, apiKey || '');
    return true;
  } catch (err) {
    console.error('[appStorage] Error saving Gemini key:', err);
    return false;
  }
};

/**
 * ---------------- CLEAR STORAGE (For Evaluation & First-Run Testing) ----------------
 */
export const clearAllStorage = async () => {
  try {
    await AsyncStorage.multiRemove([
      THEME_STORAGE_KEY,
      CART_STORAGE_KEY,
      WISHLIST_STORAGE_KEY,
      ORDERS_STORAGE_KEY,
      GEMINI_KEY_STORAGE_KEY,
      NOTIFICATIONS_STORAGE_KEY,
    ]);
    return true;
  } catch (err) {
    console.error('[appStorage] Error in clearAllStorage:', err);
    return false;
  }
};
