import React from 'react';
import {
    LayoutDashboard,
    Wallet,
    BookOpen,
    Home as HomeIcon,
    FolderKanban,
    Settings as SettingsIcon,
    Moon,
    Sun
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Sidebar Navigation Component
 * Main navigation for the application
 */
export function Sidebar({
    view,
    onViewChange,
    darkMode,
    onToggleDarkMode,
    children
}) {
    const { language, setLanguage, t } = useLanguage();

    const navItems = [
        { id: 'home', icon: HomeIcon, label: 'Inicio' },
        { id: 'tasks', icon: LayoutDashboard, label: t('sidebar', 'tasks') },
        { id: 'finance', icon: Wallet, label: t('sidebar', 'finance') },
        { id: 'journal', icon: BookOpen, label: t('sidebar', 'journal') },
        { id: 'projects', icon: FolderKanban, label: language === 'es' ? 'Proyectos' : 'Projects' },
        { id: 'settings', icon: SettingsIcon, label: language === 'es' ? 'Configuración' : 'Settings' },
    ];

    return (
        <div className="w-80 bg-life-bg-base border-r border-life-border flex flex-col transition-colors duration-300">
            {/* Header */}
            <div className="p-6 border-b border-life-border flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold tracking-tight mb-1">Life OS</h1>
                    <p className="text-xs text-life-text-muted">{t('sidebar', 'subtitle')}</p>
                </div>
                <div className="flex gap-2">
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="bg-transparent text-sm border border-life-border rounded px-2 py-1 outline-none text-life-text-base cursor-pointer hover:bg-life-bg-alt transition-colors"
                        title="Change Language"
                    >
                        <option value="en">EN</option>
                        <option value="es">ES</option>
                    </select>
                    <button
                        onClick={onToggleDarkMode}
                        className="p-2 rounded hover:bg-life-bg-alt transition-colors text-life-text-base"
                        title={darkMode ? 'Light Mode' : 'Dark Mode'}
                    >
                        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </div>
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-1">
                {navItems.map(({ id, icon: Icon, label }) => (
                    <button
                        key={id}
                        onClick={() => onViewChange(id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded transition-colors ${view === id
                                ? 'bg-life-bg-alt text-life-text-base'
                                : 'text-life-text-muted hover:bg-life-bg-alt'
                            }`}
                    >
                        <Icon size={18} />
                        {label}
                    </button>
                ))}
            </nav>

            {/* Additional content passed as children (e.g., Inbox) */}
            {children}
        </div>
    );
}

export default Sidebar;
