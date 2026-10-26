/**
 * Utility functions for formatting currency, numbers, and dates
 */

/**
 * Format number as USD currency
 * @param {number} amount
 * @returns {string}
 */
export const formatCurrency = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '$0.00';
  }
  return `$${amount.toFixed(2)}`;
};

/**
 * Calculate discount price
 * @param {number} price
 * @param {number} discountPercentage
 * @returns {number}
 */
export const calculateDiscountPrice = (price, discountPercentage) => {
  if (!discountPercentage || discountPercentage <= 0) return price;
  const discounted = price - (price * discountPercentage) / 100;
  return Math.round(discounted * 100) / 100;
};

/**
 * Format date to Vietnamese readable string
 * @param {Date|string|number} date
 * @returns {string}
 */
export const formatDate = (date) => {
  try {
    const d = new Date(date);
    return d.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Vừa xong';
  }
};

/**
 * Truncate long text with ellipsis
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export const truncateText = (text, maxLength = 80) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};
