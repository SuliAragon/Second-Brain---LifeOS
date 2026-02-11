import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Modal } from '../common';

const COLORS = [
    '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#22C55E',
    '#14B8A6', '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6',
    '#A855F7', '#D946EF', '#EC4899', '#F43F5E'
];

export function ProjectModal({ isOpen, onClose, onSubmit, project = null, darkMode }) {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: '#6366F1',
        icon: 'folder'
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (project) {
            setFormData({
                name: project.name,
                description: project.description || '',
                color: project.color,
                icon: project.icon || 'folder'
            });
        } else {
            setFormData({
                name: '',
                description: '',
                color: '#6366F1',
                icon: 'folder'
            });
        }
    }, [project, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name) return;

        setLoading(true);
        try {
            await onSubmit(formData);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={project ? t('projects', 'editProject') : t('projects', 'newProject')}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                    <label className="block text-sm font-medium text-life-text-muted mb-1">
                        {t('projects', 'name')}
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder={t('projects', 'namePlaceholder')}
                        className="w-full px-3 py-2 bg-life-bg-alt border border-life-border rounded text-life-text-base focus:ring-2 focus:ring-life-accent focus:border-transparent outline-none"
                        required
                        disabled={loading}
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-life-text-muted mb-1">
                        {t('projects', 'description')}
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder={t('projects', 'descriptionPlaceholder')}
                        rows={3}
                        className="w-full px-3 py-2 bg-life-bg-alt border border-life-border rounded text-life-text-base focus:ring-2 focus:ring-life-accent focus:border-transparent outline-none resize-none"
                        disabled={loading}
                    />
                </div>

                {/* Color */}
                <div>
                    <label className="block text-sm font-medium text-life-text-muted mb-2">
                        {t('projects', 'color')}
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {COLORS.map((color) => (
                            <button
                                key={color}
                                type="button"
                                onClick={() => setFormData({ ...formData, color })}
                                disabled={loading}
                                className={`w-8 h-8 rounded transition-transform hover:scale-110 ${formData.color === color ? 'ring-2 ring-offset-2 ring-life-accent' : ''
                                    }`}
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-life-border">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 rounded border border-life-border text-life-text-muted hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        {t('projects', 'cancel')}
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-4 py-2 rounded text-white font-medium transition-all hover:scale-105 ${darkMode
                                ? 'bg-gradient-to-r from-orange-500 to-amber-600'
                                : 'bg-gradient-to-r from-red-500 to-rose-600'
                            }`}
                    >
                        {loading ? 'Saving...' : t('projects', 'save')}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

export default ProjectModal;
