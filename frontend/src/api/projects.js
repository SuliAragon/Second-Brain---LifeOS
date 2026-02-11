import { apiRequest } from './config';

/**
 * Projects API
 * Projects and Objectives CRUD operations
 */

// Projects
export const fetchProjects = () => apiRequest('/projects/');

export const createProject = (project) =>
    apiRequest('/projects/', {
        method: 'POST',
        body: JSON.stringify(project),
    });

export const updateProject = (id, updates) =>
    apiRequest(`/projects/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
    });

export const deleteProject = (id) =>
    apiRequest(`/projects/${id}/`, { method: 'DELETE' });

// Objectives
export const fetchObjectives = (projectId) => {
    const endpoint = projectId
        ? `/objectives/?project=${projectId}`
        : '/objectives/';
    return apiRequest(endpoint);
};

export const createObjective = (objective) =>
    apiRequest('/objectives/', {
        method: 'POST',
        body: JSON.stringify(objective),
    });

export const updateObjective = (id, updates) =>
    apiRequest(`/objectives/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
    });

export const deleteObjective = (id) =>
    apiRequest(`/objectives/${id}/`, { method: 'DELETE' });
