/**
 * API Configuration
 * Base URL for all API calls
 */
export const API_URL = 'http://127.0.0.1:8000/api';

/**
 * Generic fetch wrapper with error handling
 */
export async function apiRequest(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed: ${response.statusText}`);
    }

    // Handle DELETE requests that return no content
    if (response.status === 204 || options.method === 'DELETE') {
        return true;
    }

    return response.json();
}
