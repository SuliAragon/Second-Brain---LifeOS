/**
 * Date and Currency Formatting Utilities
 */

/**
 * Format a date string to localized display format
 * @param {string|Date} date - Date to format
 * @param {string} locale - Locale code (en, es)
 * @param {object} options - Intl.DateTimeFormat options
 */
export const formatDate = (date, locale = 'en', options = {}) => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...options
    };
    return new Intl.DateTimeFormat(locale, defaultOptions).format(d);
};

/**
 * Format a number as currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (EUR, USD)
 * @param {string} locale - Locale code
 */
export const formatCurrency = (amount, currency = 'EUR', locale = 'es-ES') => {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
    }).format(amount);
};

/**
 * Format a number as percentage
 * @param {number} value - Value to format (0-100)
 * @param {number} decimals - Number of decimal places
 */
export const formatPercentage = (value, decimals = 1) => {
    return `${Number(value).toFixed(decimals)}%`;
};

/**
 * Format a time duration in minutes to human readable
 * @param {number} minutes - Duration in minutes
 */
export const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

/**
 * Get relative time (e.g., "2 days ago")
 * @param {string|Date} date - Date to compare
 * @param {string} locale - Locale code
 */
export const getRelativeTime = (date, locale = 'en') => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now - d;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return locale === 'es' ? 'Hoy' : 'Today';
    if (diffDays === 1) return locale === 'es' ? 'Ayer' : 'Yesterday';
    if (diffDays < 7) return locale === 'es' ? `Hace ${diffDays} días` : `${diffDays} days ago`;
    return formatDate(d, locale);
};
