import { API_CONFIG } from '../config/apiConfig';
import { FALLBACK_PRODUCTS } from '../data/mockProducts';

/**
 * Service to interact with the Remote Product Catalog API
 * Supports pagination, search, category filtering, and offline resilience.
 */
class ProductService {
  /**
   * Fetch products with pagination, search, and category support
   * @param {object} options
   * @param {number} options.limit
   * @param {number} options.skip
   * @param {string} options.search
   * @param {string} options.category
   * @returns {Promise<{ products: Array, total: number, skip: number, limit: number, isFallback: boolean }>}
   */
  async getProducts({ limit = API_CONFIG.PAGE_LIMIT, skip = 0, search = '', category = '' } = {}) {
    try {
      let url = '';
      if (search && search.trim()) {
        url = `${API_CONFIG.PRODUCTS_BASE_URL}/products/search?q=${encodeURIComponent(
          search.trim()
        )}&limit=${limit}&skip=${skip}`;
      } else if (category && category !== 'all') {
        url = `${API_CONFIG.PRODUCTS_BASE_URL}/products/category/${encodeURIComponent(
          category
        )}?limit=${limit}&skip=${skip}`;
      } else {
        url = `${API_CONFIG.PRODUCTS_BASE_URL}/products?limit=${limit}&skip=${skip}`;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT_MS);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API returned HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        products: Array.isArray(data.products) ? data.products : [],
        total: typeof data.total === 'number' ? data.total : (data.products || []).length,
        skip: data.skip || skip,
        limit: data.limit || limit,
        isFallback: false,
      };
    } catch (error) {
      console.warn('[ProductService] Fetch failed, using safe fallback:', error.message);
      
      // Filter fallback products locally to support search & category offline
      let filtered = [...FALLBACK_PRODUCTS];
      if (search && search.trim()) {
        const query = search.trim().toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.title.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query) ||
            p.category.toLowerCase().includes(query)
        );
      } else if (category && category !== 'all') {
        filtered = filtered.filter((p) => p.category.toLowerCase() === category.toLowerCase());
      }

      const paginated = filtered.slice(skip, skip + limit);
      return {
        products: paginated,
        total: filtered.length,
        skip,
        limit,
        isFallback: true,
        errorMessage: error.message,
      };
    }
  }

  /**
   * Fetch a single product by ID
   * @param {number|string} id
   * @returns {Promise<object|null>}
   */
  async getProductById(id) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT_MS);

      const response = await fetch(`${API_CONFIG.PRODUCTS_BASE_URL}/products/${id}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Product #${id} not found (HTTP ${response.status})`);
      }

      return await response.json();
    } catch (error) {
      console.warn(`[ProductService] Failed to fetch product #${id}:`, error.message);
      const fallback = FALLBACK_PRODUCTS.find((p) => String(p.id) === String(id));
      if (fallback) return fallback;
      throw error;
    }
  }

  /**
   * Fetch category list from Remote API
   * @returns {Promise<Array<string|object>>}
   */
  async getCategories() {
    try {
      const response = await fetch(`${API_CONFIG.PRODUCTS_BASE_URL}/products/categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.warn('[ProductService] Categories fetch failed, using defaults:', error.message);
      return [
        { slug: 'all', name: 'Tất cả' },
        { slug: 'beauty', name: 'Làm đẹp' },
        { slug: 'fragrances', name: 'Nước hoa' },
        { slug: 'groceries', name: 'Bách hóa' },
      ];
    }
  }
}

export const productService = new ProductService();
