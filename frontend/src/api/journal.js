import { apiRequest } from './config';

/**
 * Journal API
 * Entries and Categories for the journal module
 */

// Entries
export const fetchEntries = () => apiRequest('/entries/');

export const createEntry = (entry) =>
    apiRequest('/entries/', {
        method: 'POST',
        body: JSON.stringify(entry),
    });

export const updateEntry = (id, updates) =>
    apiRequest(`/entries/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
    });

export const deleteEntry = (id) =>
    apiRequest(`/entries/${id}/`, { method: 'DELETE' });

// Journal Categories
export const fetchCategories = () => apiRequest('/categories/');

export const createCategory = (category) =>
    apiRequest('/categories/', {
        method: 'POST',
        body: JSON.stringify(category),
    });

export const deleteCategory = (id) =>
    apiRequest(`/categories/${id}/`, { method: 'DELETE' });
