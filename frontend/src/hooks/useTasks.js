import { useState, useEffect, useCallback } from 'react';
import {
    fetchTasks as apiFetchTasks,
    createTask as apiCreateTask,
    updateTask as apiUpdateTask,
    deleteTask as apiDeleteTask
} from '../api';

/**
 * Custom hook for task management
 * Handles all task CRUD operations and state
 */
export function useTasks() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadTasks = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await apiFetchTasks();
            setTasks(data);
        } catch (err) {
            setError(err.message);
            console.error('Error loading tasks:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const createTask = useCallback(async (taskData) => {
        try {
            const newTask = await apiCreateTask(taskData);
            setTasks(prev => [...prev, newTask]);
            return newTask;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    const updateTask = useCallback(async (id, updates) => {
        try {
            const updated = await apiUpdateTask(id, updates);
            setTasks(prev => prev.map(t => t.id === id ? updated : t));
            return updated;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    const deleteTask = useCallback(async (id) => {
        try {
            await apiDeleteTask(id);
            setTasks(prev => prev.filter(t => t.id !== id));
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    // Listen for refresh events from chat
    useEffect(() => {
        const handleRefresh = () => loadTasks();
        window.addEventListener('refresh-tasks', handleRefresh);
        return () => window.removeEventListener('refresh-tasks', handleRefresh);
    }, [loadTasks]);

    // Initial load
    useEffect(() => {
        loadTasks();
    }, [loadTasks]);

    // Computed values
    const inboxTasks = tasks.filter(t => !t.due_date && t.status !== 'DONE');
    const todoTasks = tasks.filter(t => t.status === 'TODO');
    const doneTasks = tasks.filter(t => t.status === 'DONE');

    return {
        tasks,
        loading,
        error,
        inboxTasks,
        todoTasks,
        doneTasks,
        loadTasks,
        createTask,
        updateTask,
        deleteTask,
    };
}
