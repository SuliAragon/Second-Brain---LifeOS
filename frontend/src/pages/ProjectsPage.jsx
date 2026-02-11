import React, { useState } from 'react';
import { FolderKanban, Plus, Archive } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useProjects } from '../hooks/useProjects';
import { useConfirmModal } from '../components/ConfirmModal';
import { PageContainer, PageHeader } from '../components/layout';
import { LoadingPage, EmptyState } from '../components/common';
import {
    ProjectStats,
    ProjectCard,
    ProjectModal,
    ObjectivesList
} from '../components/projects';

export function ProjectsPage({ darkMode }) {
    const { t } = useLanguage();
    const {
        projects,
        objectives,
        loading,
        createProject,
        updateProject,
        deleteProject,
        loadObjectives,
        createObjective,
        toggleObjective,
        deleteObjective
    } = useProjects();

    const { showDelete, ModalComponent } = useConfirmModal();

    // UI State
    const [showArchived, setShowArchived] = useState(false);
    const [menuOpen, setMenuOpen] = useState(null);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);

    // Objectives State
    const [selectedProject, setSelectedProject] = useState(null);
    const [isObjectivesModalOpen, setIsObjectivesModalOpen] = useState(false);

    // Derived Data
    const activeProjects = projects.filter(p => p.is_active);
    const archivedProjects = projects.filter(p => !p.is_active);
    const displayProjects = showArchived ? archivedProjects : activeProjects;
    const totalTasks = projects.reduce((acc, p) => acc + (p.stats?.tasks || 0), 0);

    // Handlers
    const handleCreateProject = () => {
        setEditingProject(null);
        setIsProjectModalOpen(true);
    };

    const handleEditProject = (project) => {
        setEditingProject(project);
        setIsProjectModalOpen(true);
    };

    const handleSubmitProject = async (data) => {
        if (editingProject) {
            await updateProject(editingProject.id, data);
        } else {
            await createProject({ ...data, is_active: true });
        }
    };

    const handleDeleteProject = async (project) => {
        const confirmed = await showDelete(t('projects', 'delete'), t('projects', 'confirmDelete'));
        if (confirmed) {
            await deleteProject(project.id);
        }
    };

    const handleArchiveProject = async (project) => {
        await updateProject(project.id, { is_active: !project.is_active });
    };

    // Objectives Handlers
    const handleViewObjectives = async (project) => {
        setSelectedProject(project);
        setIsObjectivesModalOpen(true);
        await loadObjectives(project.id);
    };

    const handleAddObjective = async (project) => {
        await handleViewObjectives(project);
        // The modal opens and shows the form
    };

    const handleObjectiveSubmit = async (data) => {
        await createObjective(data);
    };

    if (loading && projects.length === 0) return <LoadingPage />;

    const headerAction = (
        <div className="flex items-center gap-3">
            <button
                onClick={() => setShowArchived(!showArchived)}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${showArchived
                    ? 'bg-gray-200 dark:bg-gray-700 text-life-text-base'
                    : 'bg-life-bg-base text-life-text-muted border border-life-border hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
            >
                <Archive className="w-4 h-4 inline mr-2" />
                {showArchived ? t('projects', 'hideArchived') : t('projects', 'showArchived')}
            </button>
            <button
                onClick={handleCreateProject}
                className={`px-4 py-2 rounded text-white font-medium flex items-center gap-2 transition-all hover:scale-105 ${darkMode
                    ? 'bg-gradient-to-r from-orange-500 to-amber-600'
                    : 'bg-gradient-to-r from-red-500 to-rose-600'
                    }`}
            >
                <Plus className="w-5 h-5" />
                {t('projects', 'newProject')}
            </button>
        </div>
    );

    return (
        <PageContainer>
            {ModalComponent}

            <PageHeader
                title={t('projects', 'title')}
                subtitle={t('projects', 'subtitle')}
                action={headerAction}
            />

            <ProjectStats
                activeCount={activeProjects.length}
                archivedCount={archivedProjects.length}
                totalTasks={totalTasks}
            />

            {displayProjects.length === 0 ? (
                <EmptyState
                    icon={FolderKanban}
                    title={t('projects', 'noProjects')}
                    description={t('projects', 'noProjectsDesc')}
                />
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {displayProjects.map(project => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            isMenuOpen={menuOpen === project.id}
                            onToggleMenu={(id) => setMenuOpen(id)}
                            onEdit={handleEditProject}
                            onDelete={handleDeleteProject}
                            onArchive={handleArchiveProject}
                            onAddObjective={handleAddObjective}
                            onViewObjectives={handleViewObjectives}
                        />
                    ))}
                </div>
            )}

            <ProjectModal
                isOpen={isProjectModalOpen}
                onClose={() => setIsProjectModalOpen(false)}
                onSubmit={handleSubmitProject}
                project={editingProject}
                darkMode={darkMode}
            />

            <ObjectivesList
                isOpen={isObjectivesModalOpen}
                onClose={() => setIsObjectivesModalOpen(false)}
                project={selectedProject}
                objectives={selectedProject ? (objectives[selectedProject.id] || []) : []}
                onAdd={handleObjectiveSubmit}
                onToggle={toggleObjective}
                onDelete={deleteObjective}
                darkMode={darkMode}
            />
        </PageContainer>
    );
}

export default ProjectsPage;
