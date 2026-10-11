/**
 * Pocketwise Currency Formatter
 * Formats numbers as Indian Rupee (₹) values
 */

export const formatCurrency = (amount, options = {}) => {
  const { compact = false, decimals = 2 } = options;
  
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0.00';
  
  const num = Number(amount);
  
  if (compact) {
    if (Math.abs(num) >= 100000) {
      return `₹${(num / 100000).toFixed(1)}L`;
    } else if (Math.abs(num) >= 1000) {
      return `₹${(num / 1000).toFixed(1)}K`;
    }
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

export const formatCurrencyCompact = (amount) => formatCurrency(amount, { compact: true });

export const parseCurrency = (str) => {
  if (!str) return 0;
  return parseFloat(String(str).replace(/[₹,\s]/g, '')) || 0;
};
