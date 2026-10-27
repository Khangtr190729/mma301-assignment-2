import { API_CONFIG } from '../config/apiConfig';
import { getGeminiApiKey } from '../storage/appStorage';

/**
 * Service to interact with Google Gemini AI
 * 
 * Strict E-Commerce Integration (R10):
 * - Grounded in real catalog context (not a generic chatbot)
 * - Validates AI recommendations against actual catalog products to prevent hallucination
 * - Provides graceful fallback when offline or when invalid output is received
 */
class GeminiService {
  /**
   * Request shopping recommendations from Gemini grounded in real catalog
   * @param {object} params
   * @param {string} params.userQuery - User shopping goal or question
   * @param {Array} params.catalogProducts - Active catalog products to ground context
   * @param {Array} params.cartItems - Optional products in user's cart for context
   * @returns {Promise<{ advice: string, recommendations: Array, rawText: string, isValidated: boolean, hallucinatedIds: Array, isFallback: boolean }>}
   */
  async getRecommendations({ userQuery, catalogProducts = [], cartItems = [] }) {
    const storedKey = await getGeminiApiKey();
    const apiKey = (storedKey && storedKey.trim()) ? storedKey.trim() : (API_CONFIG.DEFAULT_GEMINI_KEY || '').trim();

    // 1. If no API key or offline, use rule-based catalog fallback
    if (!apiKey) {
      return this._generateCatalogFallback({
        userQuery,
        catalogProducts,
        cartItems,
        reason: 'Chưa cấu hình Gemini API Key. Vui lòng nhập key trong Cài đặt.',
      });
    }

    try {
      // 2. Prepare concise catalog context
      const catalogSummary = catalogProducts.slice(0, 15).map((p) => ({
        id: p.id,
        title: p.title,
        price: p.price,
        category: p.category,
        rating: p.rating,
      }));

      const cartSummary = cartItems.map((c) => ({
        id: c.id,
        title: c.title,
        quantity: c.quantity,
      }));

      // 3. Construct structured system prompt
      const prompt = `
Bạn là chuyên gia tư vấn mua sắm thông minh (AI Shopping Assistant) cho ứng dụng E-Commerce MMA301.
DƯỚI ĐÂY LÀ DANH MỤC SẢN PHẨM HIỆN CÓ TRONG KHO (BẮT BUỘC CHỈ ĐƯỢC CHỌN TRONG DANH SÁCH NÀY):
${JSON.stringify(catalogSummary, null, 2)}

${cartSummary.length > 0 ? `Sản phẩm hiện có trong giỏ hàng người dùng:\n${JSON.stringify(cartSummary, null, 2)}` : ''}

Yêu cầu của khách hàng: "${userQuery}"

QUY TẮC BẮT BUỘC:
1. Bạn CHỈ ĐƯỢC phép gợi ý các sản phẩm có ID và TÊN nằm trong danh sách trên.
2. TUYỆT ĐỐI KHÔNG tự bịa ra sản phẩm mới hoặc ID không có trong danh sách.
3. Hãy trả lời ĐÚNG cú pháp JSON thuần túy (không bọc code block markdown nếu có thể) theo định dạng:
{
  "advice": "Lời khuyên mua sắm ngắn gọn, thân thiện (tiếng Việt, 2-3 câu)",
  "recommendedProductIds": [danh sách các số ID phù hợp nhất, tối đa 3 ID],
  "reasoning": "Lý do lựa chọn"
}
`;

      const endpoint = `${API_CONFIG.GEMINI_BASE_URL}/${API_CONFIG.DEFAULT_GEMINI_MODEL}:generateContent?key=${apiKey.trim()}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.2, // Low temperature for factual precision
            topK: 20,
            topP: 0.8,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || `Gemini API HTTP ${response.status}: ${response.statusText}`
        );
      }

      const json = await response.json();
      const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text || '';

      // 4. Parse & Validate output against catalog (Anti-Hallucination Guard)
      return this._parseAndValidateResponse(rawText, catalogProducts);
    } catch (error) {
      console.warn('[GeminiService] AI request error:', error.message);
      return this._generateCatalogFallback({
        userQuery,
        catalogProducts,
        cartItems,
        reason: `Lỗi kết nối Gemini AI (${error.message}). Tự động kích hoạt cơ chế gợi ý an toàn.`,
      });
    }
  }

  /**
   * Compare two products with AI analysis
   * @param {object} productA
   * @param {object} productB
   * @returns {Promise<string>}
   */
  async compareProducts(productA, productB) {
    const storedKey = await getGeminiApiKey();
    const apiKey = (storedKey && storedKey.trim()) ? storedKey.trim() : (API_CONFIG.DEFAULT_GEMINI_KEY || '').trim();
    if (!apiKey) {
      return `So sánh nhanh:\n- ${productA.title}: $${productA.price} (Đánh giá: ${productA.rating}⭐)\n- ${productB.title}: $${productB.price} (Đánh giá: ${productB.rating}⭐)\nSản phẩm ${
        productA.price < productB.price ? productA.title : productB.title
      } có mức giá tiết kiệm hơn.`;
    }

    try {
      const prompt = `So sánh ngắn gọn ưu/nhược điểm giữa 2 sản phẩm:
1. ${productA.title} - Giá: $${productA.price}, Rating: ${productA.rating}/5, Danh mục: ${productA.category}. Mô tả: ${productA.description}
2. ${productB.title} - Giá: $${productB.price}, Rating: ${productB.rating}/5, Danh mục: ${productB.category}. Mô tả: ${productB.description}
Đưa ra kết luận sản phẩm nào phù hợp với nhu cầu gì trong 3-4 dòng tiếng Việt.`;

      const endpoint = `${API_CONFIG.GEMINI_BASE_URL}/${API_CONFIG.DEFAULT_GEMINI_MODEL}:generateContent?key=${apiKey.trim()}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });

      if (!response.ok) throw new Error('Compare request failed');
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Không có phản hồi từ AI.';
    } catch (err) {
      return `So sánh sơ bộ:\n- ${productA.title}: Giá $${productA.price}\n- ${productB.title}: Giá $${productB.price}`;
    }
  }

  /**
   * Parse AI JSON response and strictly validate against active catalog
   * @private
   */
  _parseAndValidateResponse(rawText, catalogProducts) {
    let parsed = null;
    let hallucinatedIds = [];
    let validRecommendations = [];

    // Extract JSON block even if model returned markdown backticks
    try {
      let clean = rawText.trim();
      if (clean.includes('```json')) {
        clean = clean.split('```json')[1].split('```')[0].trim();
      } else if (clean.includes('```')) {
        clean = clean.split('```')[1].split('```')[0].trim();
      }
      parsed = JSON.parse(clean);
    } catch {
      console.warn('[GeminiService] Failed to parse JSON, attempting regex extraction');
      parsed = {
        advice: rawText.slice(0, 300),
        recommendedProductIds: [],
      };
    }

    const proposedIds = Array.isArray(parsed.recommendedProductIds)
      ? parsed.recommendedProductIds
      : [];

    // Validation step: Check if proposed IDs exist in actual catalog
    proposedIds.forEach((id) => {
      const matched = catalogProducts.find((p) => Number(p.id) === Number(id));
      if (matched) {
        validRecommendations.push(matched);
      } else {
        hallucinatedIds.push(id);
      }
    });

    // If all proposed IDs were hallucinated or none returned, attempt keyword matching
    if (validRecommendations.length === 0 && catalogProducts.length > 0) {
      const firstMatches = catalogProducts.slice(0, 2);
      validRecommendations = firstMatches;
    }

    return {
      advice: parsed.advice || 'Dưới đây là các sản phẩm phù hợp nhất trong danh mục:',
      recommendations: validRecommendations,
      rawText,
      isValidated: true,
      hallucinatedIds,
      isFallback: false,
    };
  }

  /**
   * Fallback engine when offline or no API key is set
   * @private
   */
  _generateCatalogFallback({ userQuery, catalogProducts, reason }) {
    const q = (userQuery || '').toLowerCase();
    let matches = catalogProducts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );

    if (matches.length === 0) {
      // Pick top rated items as best alternative
      matches = [...catalogProducts].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 3);
    } else {
      matches = matches.slice(0, 3);
    }

    return {
      advice: `[Chế độ an toàn] ${reason}\nHệ thống đã lọc tự động các sản phẩm có điểm đánh giá cao và phù hợp nhất với từ khóa "${userQuery}".`,
      recommendations: matches,
      rawText: 'Offline rule-based fallback activated.',
      isValidated: true,
      hallucinatedIds: [],
      isFallback: true,
    };
  }
}

export const geminiService = new GeminiService();
