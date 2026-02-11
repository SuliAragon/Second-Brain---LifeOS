import React, { useRef, useEffect } from 'react';
import {
    FolderKanban,
    Trash2,
    MoreVertical,
    Edit2,
    Target,
    Archive,
    RotateCcw,
    CheckCircle,
    Wallet,
    BookOpen
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Card } from '../common';

export function ProjectCard({
    project,
    isMenuOpen,
    onToggleMenu,
    onEdit,
    onDelete,
    onArchive,
    onAddObjective,
    onViewObjectives
}) {
    const { t } = useLanguage();
    const menuRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (isMenuOpen && menuRef.current && !menuRef.current.contains(event.target)) {
                onToggleMenu(null); // Close menu
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isMenuOpen, onToggleMenu]);

    return (
        <div className="group bg-life-bg-base border border-life-border rounded p-5 hover:shadow-lg transition-all relative overflow-hidden">
            {/* Color bar */}
            <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: project.color }}
            />

            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded flex items-center justify-center"
                        style={{ backgroundColor: project.color + '20' }}
                    >
                        <FolderKanban
                            className="w-5 h-5"
                            style={{ color: project.color }}
                        />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-life-text-base">{project.name}</h3>
                            <span className="text-[10px] font-mono bg-gray-100 dark:bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700">
                                #{project.id}
                            </span>
                        </div>
                        {!project.is_active && (
                            <span className="text-xs text-life-text-muted bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">
                                {t('projects', 'archived')}
                            </span>
                        )}
                    </div>
                </div>

                {/* Menu and Delete Button */}
                <div className="flex items-center gap-1">
                    {/* Delete Button - Always Visible on Hover */}
                    <button
                        onClick={() => onDelete(project)}
                        className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-life-text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        title={t('projects', 'delete')}
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Three Dots Menu */}
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => onToggleMenu(project.id)}
                            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-life-text-muted opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <MoreVertical className="w-5 h-5" />
                        </button>

                        {isMenuOpen && (
                            <div className="absolute right-0 top-8 bg-life-bg-base border border-life-border rounded shadow-lg z-10 py-1 min-w-[160px]">
                                <button
                                    onClick={() => {
                                        onEdit(project);
                                        onToggleMenu(null);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 text-life-text-base"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    {t('projects', 'editProject')}
                                </button>
                                <button
                                    onClick={() => {
                                        onAddObjective(project);
                                        onToggleMenu(null);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 text-orange-500"
                                >
                                    <Target className="w-4 h-4" />
                                    {t('projects', 'addObjective')}
                                </button>
                                <button
                                    onClick={() => {
                                        onArchive(project);
                                        onToggleMenu(null);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 text-life-text-base"
                                >
                                    {project.is_active ? (
                                        <>
                                            <Archive className="w-4 h-4" />
                                            {t('projects', 'archive')}
                                        </>
                                    ) : (
                                        <>
                                            <RotateCcw className="w-4 h-4" />
                                            {t('projects', 'unarchive')}
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Description */}
            {project.description && (
                <p className="text-sm text-life-text-muted mb-4 line-clamp-2">
                    {project.description}
                </p>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm flex-wrap">
                <div className="flex items-center gap-1.5 text-life-text-muted">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    <span>{project.stats?.tasks || 0} {t('projects', 'tasks')}</span>
                </div>
                <div className="flex items-center gap-1.5 text-life-text-muted">
                    <Wallet className="w-4 h-4 text-green-500" />
                    <span>{project.stats?.transactions || 0}</span>
                </div>
                <div className="flex items-center gap-1.5 text-life-text-muted">
                    <BookOpen className="w-4 h-4 text-violet-500" />
                    <span>{project.stats?.entries || 0}</span>
                </div>
                <button
                    onClick={() => onViewObjectives(project)}
                    className="flex items-center gap-1.5 text-life-text-muted hover:text-orange-500 transition-colors cursor-pointer"
                >
                    <Target className="w-4 h-4 text-orange-500" />
                    <span>{project.stats?.objectives_completed || 0}/{project.stats?.objectives || 0} {t('projects', 'objectives')}</span>
                </button>
            </div>
        </div>
    );
}

export default ProjectCard;
