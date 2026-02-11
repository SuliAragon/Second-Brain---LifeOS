import { apiRequest } from './config';

/**
 * Tasks API
 * CRUD operations for task management
 */

export const fetchTasks = () => apiRequest('/tasks/');

export const createTask = (task) =>
    apiRequest('/tasks/', {
        method: 'POST',
        body: JSON.stringify(task),
    });

export const updateTask = (id, updates) =>
    apiRequest(`/tasks/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
    });

export const deleteTask = (id) =>
    apiRequest(`/tasks/${id}/`, { method: 'DELETE' });
