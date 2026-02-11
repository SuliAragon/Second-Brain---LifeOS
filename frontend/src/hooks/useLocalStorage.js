import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for persistent storage (localStorage or sessionStorage)
 * @param {string} key - Storage key
 * @param {any} initialValue - Initial value if not in storage
 * @param {Storage} storage - Storage object (window.localStorage or window.sessionStorage)
 */
export function useStorage(key, initialValue, storage = window.localStorage) {
    // Get initial value from storage or use default
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = storage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error reading storage key "${key}":`, error);
            return initialValue;
        }
    });

    // Update storage when value changes
    const setValue = useCallback((value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            storage.setItem(key, JSON.stringify(valueToStore));
            // Dispatch a custom event for cross-component updates
            window.dispatchEvent(new Event('storage'));
        } catch (error) {
            console.error(`Error setting storage key "${key}":`, error);
        }
    }, [key, storedValue, storage]);

    // Remove from storage
    const removeValue = useCallback(() => {
        try {
            storage.removeItem(key);
            setStoredValue(initialValue);
            window.dispatchEvent(new Event('storage'));
        } catch (error) {
            console.error(`Error removing storage key "${key}":`, error);
        }
    }, [key, initialValue, storage]);

    return [storedValue, setValue, removeValue];
}

// Keep useLocalStorage for backward compatibility but use the new general hook
export function useLocalStorage(key, initialValue) {
    return useStorage(key, initialValue, window.localStorage);
}

/**
 * Custom hook for AI settings stored in localStorage
 */
export function useAISettings() {
    const [provider, setProvider] = useLocalStorage('lifeos_ai_provider', 'groq');
    const [model, setModel] = useLocalStorage('lifeos_ai_model', 'llama-3.1-8b-instant');
    // Use sessionStorage for API key so it's cleared when browser is closed
    const [apiKey, setApiKey] = useStorage('lifeos_ai_key', '', window.sessionStorage);

    const saveSettings = useCallback((newProvider, newModel, newApiKey) => {
        setProvider(newProvider);
        setModel(newModel);
        setApiKey(newApiKey);
    }, [setProvider, setModel, setApiKey]);

    const clearSettings = useCallback(() => {
        setProvider('groq');
        setModel('llama-3.3-70b-versatile');
        setApiKey('');
    }, [setProvider, setModel, setApiKey]);

    return {
        provider,
        model,
        apiKey,
        setProvider,
        setModel,
        setApiKey,
        saveSettings,
        clearSettings,
        isConfigured: Boolean(apiKey),
    };
}
