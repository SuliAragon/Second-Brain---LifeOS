import React, { useState } from 'react';
import { Plus, Menu } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useJournal } from '../hooks/useJournal';
import { useConfirmModal } from '../components/ConfirmModal';
import { LoadingPage, EmptyState } from '../components/common';
import {
    EntryEditor,
    EntryList,
    CategorySidebar
} from '../components/journal';

export function JournalPage({ darkMode }) {
    const { t, getLocale } = useLanguage();
    const {
        entries,
        categories,
        loading,
        createEntry,
        updateEntry,
        deleteEntry,
        createCategory,
        deleteCategory
    } = useJournal();

    const { showAlert, showDelete, ModalComponent } = useConfirmModal();

    // UI State
    const [viewMode, setViewMode] = useState('LIST'); // 'LIST' | 'EDIT'
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [currentEntry, setCurrentEntry] = useState(null);

    // Derived Data
    const filteredEntries = entries.filter(e => {
        if (selectedCategory && e.category !== selectedCategory) return false;
        return true;
    }).sort((a, b) => { // Sort descending by date
        const dateA = new Date(a.publication_date || a.date);
        const dateB = new Date(b.publication_date || b.date);
        return dateB - dateA;
    });

    // Handlers
    const handleCreateNew = () => {
        setCurrentEntry(null);
        setViewMode('EDIT');
    };

    const handleEditEntry = (entry) => {
        setCurrentEntry(entry);
        setViewMode('EDIT');
    };

    const handleSaveEntry = async (data) => {
        try {
            if (currentEntry) {
                await updateEntry(currentEntry.id, data);
            } else {
                await createEntry(data);
            }
            setViewMode('LIST');
        } catch (error) {
            console.error(error);
            showAlert(t('journal', 'error'), 'Failed to save entry');
        }
    };

    const handleDeleteEntry = async (id) => {
        const confirmed = await showDelete(t('journal', 'deleteEntry'), t('journal', 'confirmDeleteEntry'));
        if (confirmed) {
            try {
                await deleteEntry(id);
                if (currentEntry?.id === id) setViewMode('LIST');
            } catch (error) {
                showAlert(t('journal', 'error'), 'Failed to delete entry');
            }
        }
    };

    const handleAddCategory = async (data) => {
        try {
            await createCategory(data);
        } catch (error) {
            showAlert(t('journal', 'error'), 'Failed to create category');
        }
    };

    const handleDeleteCategory = async (id) => {
        const confirmed = await showDelete(t('journal', 'deleteCategory'), t('journal', 'confirmDeleteCategory'));
        if (confirmed) {
            try {
                await deleteCategory(id);
                if (selectedCategory === id) setSelectedCategory(null);
            } catch (error) {
                showAlert(t('journal', 'error'), 'Failed to delete category');
            }
        }
    };

    if (loading && entries.length === 0) return <LoadingPage />;

    return (
        <div className="flex bg-life-bg-alt h-full relative overflow-hidden">
            {ModalComponent}

            {/* Sidebar Toggle (Mobile/Tablet) */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`absolute bottom-4 right-4 z-50 p-3 rounded-full shadow-lg transition-all md:hidden ${isSidebarOpen ? 'bg-life-bg-base text-life-text-base' : 'bg-life-accent text-life-bg-base'
                    }`}
            >
                <Menu size={24} />
            </button>

            <CategorySidebar
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                onAddCategory={handleAddCategory}
                onDeleteCategory={handleDeleteCategory}
                isOpen={isSidebarOpen}
            />

            <div className="flex-1 flex flex-col h-full w-full overflow-hidden transition-all duration-300">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-life-border bg-life-bg-base/50 backdrop-blur-sm shrink-0">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold text-life-text-base">{t('journal', 'title')}</h1>
                        {selectedCategory && (
                            <span className="bg-life-accent/10 text-life-accent px-2 py-1 rounded text-xs font-bold uppercase tracking-wide">
                                {categories.find(c => c.id === selectedCategory)?.name}
                            </span>
                        )}
                    </div>
                    {viewMode === 'LIST' && (
                        <button
                            onClick={handleCreateNew}
                            className="px-4 py-2 bg-life-text-base text-life-bg-base rounded font-medium flex items-center gap-2 hover:opacity-90 transition-opacity whitespace-nowrap shadow-sm"
                        >
                            <Plus size={18} /> {t('journal', 'newEntry')}
                        </button>
                    )}
                </div>

                {/* Content */}
                {viewMode === 'LIST' ? (
                    <EntryList
                        entries={filteredEntries}
                        onEdit={handleEditEntry}
                        onDelete={handleDeleteEntry}
                        locale={getLocale()}
                    />
                ) : (
                    <EntryEditor
                        entry={currentEntry}
                        categories={categories}
                        onSave={handleSaveEntry}
                        onCancel={() => setViewMode('LIST')}
                        darkMode={darkMode}
                    />
                )}
            </div>
        </div>
    );
}

export default JournalPage;
