/**
 * useModels Hook
 * Fetches and caches AI models from provider APIs
 */
import { useState, useEffect } from 'react';

const CACHE_KEY_PREFIX = 'ai_models_';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export function useModels(providerId) {
    const [models, setModels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastFetched, setLastFetched] = useState(null);

    // Check if cache is valid
    const isCacheValid = (cacheData) => {
        if (!cacheData || !cacheData.timestamp) return false;
        const now = Date.now();
        return (now - cacheData.timestamp) < CACHE_DURATION;
    };

    // Load from cache
    const loadFromCache = () => {
        try {
            const cacheKey = `${CACHE_KEY_PREFIX}${providerId}`;
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                const cacheData = JSON.parse(cached);
                if (isCacheValid(cacheData)) {
                    setModels(cacheData.models);
                    setLastFetched(new Date(cacheData.timestamp));
                    return true;
                }
            }
        } catch (err) {
            console.error('Error loading from cache:', err);
        }
        return false;
    };

    // Save to cache
    const saveToCache = (modelsData) => {
        try {
            const cacheKey = `${CACHE_KEY_PREFIX}${providerId}`;
            const cacheData = {
                models: modelsData,
                timestamp: Date.now()
            };
            localStorage.setItem(cacheKey, JSON.stringify(cacheData));
            setLastFetched(new Date());
        } catch (err) {
            console.error('Error saving to cache:', err);
        }
    };

    // Fetch models from API
    const fetchModels = async (force = false) => {
        // If not forcing refresh, try cache first
        if (!force && loadFromCache()) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`http://localhost:8000/api/models/${providerId}/`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            if (data.models && data.models.length > 0) {
                setModels(data.models);
                saveToCache(data.models);
            } else {
                throw new Error('No models returned from API');
            }
        } catch (err) {
            console.error('Error fetching models:', err);
            setError(err.message);
            // Try to use cache as fallback even if expired
            loadFromCache();
        } finally {
            setLoading(false);
        }
    };

    // Auto-fetch on mount/provider change
    useEffect(() => {
        if (providerId) {
            fetchModels();
        }
    }, [providerId]);

    return {
        models,
        loading,
        error,
        refresh: () => fetchModels(true),
        lastFetched
    };
}
