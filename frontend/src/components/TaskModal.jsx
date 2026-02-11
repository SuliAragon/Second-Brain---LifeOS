
import React, { useState, useEffect } from 'react';
import { Trash2, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useConfirmModal } from './ConfirmModal';

export function TaskModal({ task, onClose, onUpdate, onDelete }) {
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description || '');
    const [dueTime, setDueTime] = useState(task.due_time || '');
    const [status, setStatus] = useState(task.status);
    const { t } = useLanguage();
    const { showDelete, ModalComponent } = useConfirmModal();

    useEffect(() => {
        setTitle(task.title);
        setDescription(task.description || '');
        setDueTime(task.due_time || '');
        setStatus(task.status);
    }, [task]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate(task.id, {
            title,
            description,
            status,
            due_time: dueTime || null
        });
        onClose();
    };

    const handleDelete = async () => {
        const confirmed = await showDelete(t('modal', 'title'), t('modal', 'confirmDelete'));
        if (confirmed) {
            onDelete(task.id);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-life-text-base/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            {ModalComponent}
            <div className="bg-life-bg-base w-full max-w-md rounded shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-life-border">
                <div className="flex justify-between items-center p-4 border-b border-life-border">
                    <h2 className="font-bold text-lg text-life-text-base">{t('modal', 'title')}</h2>
                    <button onClick={onClose} className="p-1 hover:bg-life-bg-alt rounded text-life-text-muted hover:text-life-text-base">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-life-text-muted uppercase mb-1">{t('modal', 'labelTitle')}</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full p-2 bg-life-bg-alt text-life-text-base border border-transparent rounded focus:bg-life-bg-base focus:border-life-accent focus:outline-none transition-colors"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-life-text-muted uppercase mb-1">{t('modal', 'labelDesc')}</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full p-2 bg-life-bg-alt text-life-text-base border border-transparent rounded focus:bg-life-bg-base focus:border-life-accent focus:outline-none h-24 resize-none transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-life-text-muted uppercase mb-1">{t('modal', 'labelTime')}</label>
                        <input
                            type="time"
                            value={dueTime}
                            onChange={(e) => setDueTime(e.target.value)}
                            className="w-full p-2 bg-life-bg-alt text-life-text-base border border-transparent rounded focus:bg-life-bg-base focus:border-life-accent focus:outline-none transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-life-text-muted uppercase mb-1">{t('modal', 'labelStatus')}</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full p-2 bg-life-bg-alt text-life-text-base border border-transparent rounded focus:bg-life-bg-base focus:border-life-accent focus:outline-none transition-colors"
                        >
                            {!task.due_date && <option value="INBOX">{t('modal', 'statusInbox')}</option>}
                            <option value="TODO">{t('modal', 'statusTodo')}</option>
                            <option value="DONE">{t('modal', 'statusDone')}</option>
                        </select>
                    </div>

                    <div className="flex justify-between items-center pt-4 mt-4 border-t border-life-border">
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="text-red-500 flex items-center gap-1 text-sm font-medium hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                        >
                            <Trash2 size={16} /> {t('modal', 'delete')}
                        </button>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-life-text-muted hover:text-life-text-base transition-colors"
                            >
                                {t('modal', 'cancel')}
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-bold text-life-bg-base bg-life-text-base hover:opacity-90 rounded transition-opacity"
                            >
                                {t('modal', 'save')}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}