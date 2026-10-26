/**
 * API and AI Configuration
 * 
 * IMPORTANT: No production secrets are committed to this repository.
 * Gemini API Key can be entered dynamically via SettingsScreen or read from storage.
 */

export const API_CONFIG = {
  // Remote Product Catalog API
  PRODUCTS_BASE_URL: 'https://dummyjson.com',
  PAGE_LIMIT: 10,
  
  // Gemini AI Service Configuration
  GEMINI_BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models',
  DEFAULT_GEMINI_MODEL: 'gemini-2.5-flash',
  
  // Default demo / fallback key placeholder (Users enter their key in Settings)
  DEFAULT_GEMINI_KEY: '',
  
  // Network request timeout in milliseconds
  TIMEOUT_MS: 10000,
};
