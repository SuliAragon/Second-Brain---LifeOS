import { useState, useEffect, useCallback } from 'react';
import {
    fetchProjects as apiFetchProjects,
    createProject as apiCreateProject,
    updateProject as apiUpdateProject,
    deleteProject as apiDeleteProject,
    fetchObjectives,
    createObjective as apiCreateObjective,
    updateObjective as apiUpdateObjective,
    deleteObjective as apiDeleteObjective,
} from '../api';

/**
 * Custom hook for project management
 * Handles projects and objectives CRUD
 */
export function useProjects() {
    const [projects, setProjects] = useState([]);
    const [objectives, setObjectives] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadProjects = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await apiFetchProjects();
            setProjects(data);
        } catch (err) {
            setError(err.message);
            console.error('Error loading projects:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadObjectives = useCallback(async (projectId) => {
        try {
            const data = await fetchObjectives(projectId);
            setObjectives(prev => ({ ...prev, [projectId]: data }));
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    const createProject = useCallback(async (data) => {
        const newProject = await apiCreateProject(data);
        setProjects(prev => [...prev, newProject]);
        return newProject;
    }, []);

    const updateProject = useCallback(async (id, updates) => {
        const updated = await apiUpdateProject(id, updates);
        setProjects(prev => prev.map(p => p.id === id ? updated : p));
        return updated;
    }, []);

    const deleteProject = useCallback(async (id) => {
        await apiDeleteProject(id);
        setProjects(prev => prev.filter(p => p.id !== id));
    }, []);

    const createObjective = useCallback(async (data) => {
        const newObj = await apiCreateObjective(data);
        const projectId = data.project;
        setObjectives(prev => ({
            ...prev,
            [projectId]: [...(prev[projectId] || []), newObj]
        }));
        // Update project stats
        await loadProjects();
        return newObj;
    }, [loadProjects]);

    const toggleObjective = useCallback(async (objective) => {
        const newStatus = objective.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
        const updated = await apiUpdateObjective(objective.id, { status: newStatus });
        const projectId = objective.project;
        setObjectives(prev => ({
            ...prev,
            [projectId]: prev[projectId]?.map(o => o.id === objective.id ? updated : o) || []
        }));
        // Update project stats
        await loadProjects();
        return updated;
    }, [loadProjects]);

    const deleteObjective = useCallback(async (id, projectId) => {
        await apiDeleteObjective(id);
        setObjectives(prev => ({
            ...prev,
            [projectId]: prev[projectId]?.filter(o => o.id !== id) || []
        }));
        // Update project stats
        await loadProjects();
    }, [loadProjects]);

    // Listen for refresh events from chat
    useEffect(() => {
        const handleRefresh = () => loadProjects();
        window.addEventListener('refresh-projects', handleRefresh);
        return () => window.removeEventListener('refresh-projects', handleRefresh);
    }, [loadProjects]);

    // Initial load
    useEffect(() => {
        loadProjects();
    }, [loadProjects]);

    // Computed values
    const activeProjects = projects.filter(p => p.is_active);
    const archivedProjects = projects.filter(p => !p.is_active);

    return {
        projects,
        objectives,
        loading,
        error,
        activeProjects,
        archivedProjects,
        loadProjects,
        loadObjectives,
        createProject,
        updateProject,
        deleteProject,
        createObjective,
        toggleObjective,
        deleteObjective,
    };
}
