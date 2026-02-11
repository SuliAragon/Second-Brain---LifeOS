import React, { useState } from 'react';
import { Target, Plus, CheckCircle2, Circle, Trash2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Modal } from '../common';

export function ObjectivesList({
    isOpen,
    onClose,
    project,
    objectives = [],
    onAdd,
    onToggle,
    onDelete,
    darkMode
}) {
    const { t } = useLanguage();
    const [newObjective, setNewObjective] = useState({ title: '', description: '', deadline: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newObjective.title.trim()) return;

        setLoading(true);
        try {
            await onAdd({
                project: project.id,
                title: newObjective.title,
                description: newObjective.description,
                deadline: newObjective.deadline || null
            });
            setNewObjective({ title: '', description: '', deadline: '' });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!project) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`${t('projects', 'objectives')} - ${project.name}`}
            size="lg"
        >
            <div className="flex flex-col h-[60vh]">
                {/* List of Objectives */}
                <div className="flex-1 overflow-y-auto p-1 space-y-3 mb-4">
                    {!Array.isArray(objectives) || objectives.length === 0 ? (
                        <div className="text-center py-8 text-life-text-muted">
                            <Target className="w-12 h-12 mx-auto opacity-50 mb-2" />
                            <p>{t('projects', 'noObjectives')}</p>
                        </div>
                    ) : (
                        objectives.map((objective) => (
                            <div
                                key={objective.id}
                                className={`p-3 rounded border ${objective.status === 'COMPLETED'
                                    ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                                    : 'border-life-border bg-life-bg-alt'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <button
                                        onClick={() => onToggle(objective)}
                                        className="mt-0.5 flex-shrink-0"
                                    >
                                        {objective.status === 'COMPLETED' ? (
                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        ) : (
                                            <Circle className="w-5 h-5 text-life-text-muted hover:text-orange-500 transition-colors" />
                                        )}
                                    </button>
                                    <div className="flex-1 min-w-0">
                                        <p className={`font-medium ${objective.status === 'COMPLETED'
                                            ? 'text-life-text-muted line-through'
                                            : 'text-life-text-base'
                                            }`}>
                                            {objective.title}
                                        </p>
                                        {objective.description && (
                                            <p className="text-sm text-life-text-muted mt-1">
                                                {objective.description}
                                            </p>
                                        )}
                                        {objective.deadline && (
                                            <p className="text-xs text-life-text-muted mt-1">
                                                📅 {new Date(objective.deadline).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => onDelete(objective.id)}
                                        className="text-life-text-muted hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Add Objective Form */}
                <form onSubmit={handleSubmit} className="border-t border-life-border pt-4 space-y-3">
                    <input
                        type="text"
                        value={newObjective.title}
                        onChange={(e) => setNewObjective({ ...newObjective, title: e.target.value })}
                        placeholder={t('projects', 'objectiveTitle')}
                        className="w-full px-3 py-2 bg-life-bg-alt border border-life-border rounded text-life-text-base focus:ring-2 focus:ring-life-accent focus:border-transparent outline-none"
                        required
                        disabled={loading}
                    />
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newObjective.description}
                            onChange={(e) => setNewObjective({ ...newObjective, description: e.target.value })}
                            placeholder={t('projects', 'objectiveDesc')}
                            className="flex-1 px-3 py-2 bg-life-bg-alt border border-life-border rounded text-life-text-base focus:ring-2 focus:ring-life-accent focus:border-transparent outline-none"
                            disabled={loading}
                        />
                        <input
                            type="date"
                            value={newObjective.deadline}
                            onChange={(e) => setNewObjective({ ...newObjective, deadline: e.target.value })}
                            className="px-3 py-2 bg-life-bg-alt border border-life-border rounded text-life-text-base focus:ring-2 focus:ring-life-accent focus:border-transparent outline-none"
                            disabled={loading}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full px-4 py-2 rounded text-white font-medium flex items-center justify-center gap-2 transition-all hover:scale-[1.02] ${darkMode
                            ? 'bg-gradient-to-r from-orange-500 to-amber-600'
                            : 'bg-gradient-to-r from-red-500 to-rose-600'
                            }`}
                    >
                        <Plus className="w-4 h-4" />
                        {loading ? 'Adding...' : t('projects', 'addObjective')}
                    </button>
                </form>
            </div>
        </Modal>
    );
}

export default ObjectivesList;
