/**
 * Generic Helper Functions
 */

/**
 * Debounce a function
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds
 */
export const debounce = (fn, delay = 300) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
};

/**
 * Deep clone an object
 * @param {object} obj - Object to clone
 */
export const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

/**
 * Generate a random ID
 * @param {number} length - Length of ID
 */
export const generateId = (length = 8) => {
    return Math.random().toString(36).substring(2, 2 + length);
};

/**
 * Capitalize first letter of a string
 * @param {string} str - String to capitalize
 */
export const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Check if a value is empty (null, undefined, empty string, or empty array)
 * @param {any} value - Value to check
 */
export const isEmpty = (value) => {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
};

/**
 * Group an array by a key
 * @param {Array} array - Array to group
 * @param {string|Function} key - Key to group by
 */
export const groupBy = (array, key) => {
    return array.reduce((result, item) => {
        const groupKey = typeof key === 'function' ? key(item) : item[key];
        (result[groupKey] = result[groupKey] || []).push(item);
        return result;
    }, {});
};

/**
 * Sort an array by a key
 * @param {Array} array - Array to sort
 * @param {string} key - Key to sort by
 * @param {string} order - 'asc' or 'desc'
 */
export const sortBy = (array, key, order = 'asc') => {
    return [...array].sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];
        if (aVal < bVal) return order === 'asc' ? -1 : 1;
        if (aVal > bVal) return order === 'asc' ? 1 : -1;
        return 0;
    });
};

/**
 * Sleep for a specified duration
 * @param {number} ms - Milliseconds to sleep
 */
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Clamp a number between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 */
export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
