import { useState, useEffect, useCallback } from 'react';
import {
    fetchEntries as apiFetchEntries,
    createEntry as apiCreateEntry,
    updateEntry as apiUpdateEntry,
    deleteEntry as apiDeleteEntry,
    fetchCategories as apiFetchCategories,
    createCategory as apiCreateCategory,
    deleteCategory as apiDeleteCategory,
} from '../api';

/**
 * Custom hook for journal management
 * Handles entries and categories
 */
export function useJournal() {
    const [entries, setEntries] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const [entriesData, categoriesData] = await Promise.all([
                apiFetchEntries(),
                apiFetchCategories(),
            ]);
            setEntries(entriesData);
            setCategories(categoriesData);
        } catch (err) {
            setError(err.message);
            console.error('Error loading journal data:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const createEntry = useCallback(async (data) => {
        const newEntry = await apiCreateEntry(data);
        setEntries(prev => [newEntry, ...prev]);
        return newEntry;
    }, []);

    const updateEntry = useCallback(async (id, updates) => {
        const updated = await apiUpdateEntry(id, updates);
        setEntries(prev => prev.map(e => e.id === id ? updated : e));
        return updated;
    }, []);

    const deleteEntry = useCallback(async (id) => {
        await apiDeleteEntry(id);
        setEntries(prev => prev.filter(e => e.id !== id));
    }, []);

    const createCategory = useCallback(async (name) => {
        const newCat = await apiCreateCategory({ name });
        setCategories(prev => [...prev, newCat]);
        return newCat;
    }, []);

    const deleteCategory = useCallback(async (id) => {
        await apiDeleteCategory(id);
        setCategories(prev => prev.filter(c => c.id !== id));
    }, []);

    // Listen for refresh events from chat
    useEffect(() => {
        const handleRefresh = () => loadData();
        window.addEventListener('refresh-journal', handleRefresh);
        return () => window.removeEventListener('refresh-journal', handleRefresh);
    }, [loadData]);

    // Initial load
    useEffect(() => {
        loadData();
    }, [loadData]);

    return {
        entries,
        categories,
        loading,
        error,
        loadData,
        createEntry,
        updateEntry,
        deleteEntry,
        createCategory,
        deleteCategory,
    };
}
