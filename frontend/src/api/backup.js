import { API_URL } from './config';

/**
 * Backup API
 * Export and Import data for portability
 */

export const exportAllData = async () => {
    const response = await fetch(`${API_URL}/backup/export/`);
    if (!response.ok) throw new Error('Failed to export data');
    return response.blob();
};

export const importAllData = async (jsonData) => {
    const response = await fetch(`${API_URL}/backup/import/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jsonData),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to import data');
    }
    return response.json();
};
