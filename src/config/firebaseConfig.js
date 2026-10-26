/**
 * Firebase Service Configuration
 * 
 * Supports Firebase modular Web SDK with zero native crash risk in Expo.
 * If credentials are not configured or network is offline, the app seamlessly
 * falls back to local storage cache so all features remain testable and interactive.
 */

export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: 'AIzaSyDemoPlaceholderKeyForAssignmentSubmission',
  authDomain: 'mma301-assignment-2.firebaseapp.com',
  projectId: 'mma301-assignment-2',
  storageBucket: 'mma301-assignment-2.appspot.com',
  messagingSenderId: '123456789012',
  appId: '1:123456789012:web:abcdef1234567890',
};

export const FIREBASE_COLLECTIONS = {
  WISHLIST: 'wishlists',
  ORDERS: 'orders',
};
