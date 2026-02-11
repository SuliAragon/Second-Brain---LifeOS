import React from 'react';
import { Brain, CheckCircle, Wallet, BookOpen, FolderKanban, Sparkles, ArrowRight, Zap, Heart, TrendingUp, MessageSquare, Command, Bot, ListTodo, PiggyBank, Calendar, Target, BarChart3, Search, Plus, Check, AlertTriangle, Smile, Activity } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function Home({ darkMode, onNavigate }) {
    const { t } = useLanguage();

    const features = [
        {
            icon: <CheckCircle className="w-8 h-8" />,
            titleKey: 'taskManagement',
            descKey: 'taskManagementDesc',
            lightColor: "from-red-500 to-rose-600",
            darkColor: "from-orange-500 to-amber-600"
        },
        {
            icon: <Wallet className="w-8 h-8" />,
            titleKey: 'personalFinance',
            descKey: 'personalFinanceDesc',
            lightColor: "from-emerald-500 to-green-600",
            darkColor: "from-emerald-500 to-green-600"
        },
        {
            icon: <BookOpen className="w-8 h-8" />,
            titleKey: 'personalJournal',
            descKey: 'personalJournalDesc',
            lightColor: "from-violet-500 to-purple-600",
            darkColor: "from-violet-500 to-purple-600"
        },
        {
            icon: <FolderKanban className="w-8 h-8" />,
            titleKey: 'crossLinkProjects',
            descKey: 'crossLinkProjectsDesc',
            lightColor: "from-blue-500 to-cyan-600",
            darkColor: "from-blue-500 to-cyan-600"
        }
    ];

    const aiCapabilities = [
        { icon: <TrendingUp />, textKey: 'dailySummary' },
        { icon: <Heart />, textKey: 'moodPatterns' },
        { icon: <Zap />, textKey: 'budgetAlerts' },
        { icon: <Command />, textKey: 'naturalCommands' },
    ];

    // Comprehensive tools guide with examples
    const toolsGuide = {
        tasks: {
            icon: <ListTodo className="w-6 h-6" />,
            color: darkMode ? 'text-orange-400' : 'text-red-500',
            bgColor: darkMode ? 'bg-orange-500/10 border-orange-500/20' : 'bg-red-500/10 border-red-500/20',
            tools: [
                { icon: <Search />, name: t('home', 'taskTools') === 'Tareas' ? 'Ver todas las tareas' : 'View all tasks', example: t('home', 'taskTools') === 'Tareas' ? '"¿Cuáles son mis tareas?"' : '"What are my tasks?"' },
                { icon: <Plus />, name: t('home', 'taskTools') === 'Tareas' ? 'Crear tarea' : 'Create task', example: t('home', 'taskTools') === 'Tareas' ? '"Crea una tarea para mañana: comprar leche"' : '"Create a task for tomorrow: buy milk"' },
                { icon: <Check />, name: t('home', 'taskTools') === 'Tareas' ? 'Completar tarea' : 'Complete task', example: t('home', 'taskTools') === 'Tareas' ? '"Marca la tarea 5 como completada"' : '"Mark task 5 as complete"' },
                { icon: <AlertTriangle />, name: t('home', 'taskTools') === 'Tareas' ? 'Tareas vencidas' : 'Overdue tasks', example: t('home', 'taskTools') === 'Tareas' ? '"¿Tengo tareas vencidas?"' : '"Do I have overdue tasks?"' },
                { icon: <BarChart3 />, name: t('home', 'taskTools') === 'Tareas' ? 'Estadísticas' : 'Productivity stats', example: t('home', 'taskTools') === 'Tareas' ? '"¿Cómo va mi productividad?"' : '"How is my productivity?"' },
            ]
        },
        finance: {
            icon: <Wallet className="w-6 h-6" />,
            color: 'text-emerald-500',
            bgColor: 'bg-emerald-500/10 border-emerald-500/20',
            tools: [
                { icon: <BarChart3 />, name: t('home', 'taskTools') === 'Tareas' ? 'Resumen financiero' : 'Financial summary', example: t('home', 'taskTools') === 'Tareas' ? '"¿Cuánto he gastado este mes?"' : '"How much did I spend this month?"' },
                { icon: <Plus />, name: t('home', 'taskTools') === 'Tareas' ? 'Añadir gasto' : 'Add expense', example: t('home', 'taskTools') === 'Tareas' ? '"Añade un gasto de 50€ en supermercado"' : '"Add a $50 expense for groceries"' },
                { icon: <Plus />, name: t('home', 'taskTools') === 'Tareas' ? 'Añadir ingreso' : 'Add income', example: t('home', 'taskTools') === 'Tareas' ? '"Registra un ingreso de 2000€ de nómina"' : '"Log $2000 income from salary"' },
                { icon: <Target />, name: t('home', 'taskTools') === 'Tareas' ? 'Estado presupuestos' : 'Budget status', example: t('home', 'taskTools') === 'Tareas' ? '"¿Cómo van mis presupuestos?"' : '"How are my budgets?"' },
                { icon: <AlertTriangle />, name: t('home', 'taskTools') === 'Tareas' ? 'Alertas presupuesto' : 'Budget alerts', example: t('home', 'taskTools') === 'Tareas' ? '"¿Hay alertas de presupuesto?"' : '"Any budget alerts?"' },
                { icon: <PiggyBank />, name: t('home', 'taskTools') === 'Tareas' ? 'Metas de ahorro' : 'Savings goals', example: t('home', 'taskTools') === 'Tareas' ? '"¿Cómo van mis ahorros?"' : '"How are my savings?"' },
            ]
        },
        mood: {
            icon: <Smile className="w-6 h-6" />,
            color: 'text-violet-500',
            bgColor: 'bg-violet-500/10 border-violet-500/20',
            tools: [
                { icon: <Activity />, name: t('home', 'taskTools') === 'Tareas' ? 'Estadísticas de ánimo' : 'Mood stats', example: t('home', 'taskTools') === 'Tareas' ? '"¿Cómo ha sido mi estado de ánimo?"' : '"How has my mood been?"' },
                { icon: <TrendingUp />, name: t('home', 'taskTools') === 'Tareas' ? 'Patrones' : 'Patterns', example: t('home', 'taskTools') === 'Tareas' ? '"¿Cuál es mi mejor día de la semana?"' : '"What\'s my best day of the week?"' },
                { icon: <Calendar />, name: t('home', 'taskTools') === 'Tareas' ? 'Últimas entradas' : 'Recent entries', example: t('home', 'taskTools') === 'Tareas' ? '"¿Qué escribí en mi diario ayer?"' : '"What did I write yesterday?"' },
            ]
        },
        projects: {
            icon: <FolderKanban className="w-6 h-6" />,
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10 border-blue-500/20',
            tools: [
                { icon: <Search />, name: t('home', 'taskTools') === 'Tareas' ? 'Ver proyectos' : 'View projects', example: t('home', 'taskTools') === 'Tareas' ? '"¿Cuáles son mis proyectos?"' : '"What are my projects?"' },
                { icon: <BarChart3 />, name: t('home', 'taskTools') === 'Tareas' ? 'Resumen proyecto' : 'Project overview', example: t('home', 'taskTools') === 'Tareas' ? '"Dame un resumen del proyecto 1"' : '"Give me an overview of project 1"' },
            ]
        }
    };

    return (
        <div className="flex-1 overflow-y-auto bg-life-bg-alt text-life-text-base transition-colors duration-300">
            {/* Hero Section */}
            <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20 overflow-hidden">
                {/* Subtle gradient background */}
                <div className={`absolute inset-0 ${darkMode ? 'bg-gradient-to-br from-orange-500/5 via-transparent to-purple-500/5' : 'bg-gradient-to-br from-red-500/5 via-transparent to-blue-500/5'}`} />

                {/* Logo */}
                <div className={`relative z-10 mb-8 p-4 rounded shadow-xl ${darkMode ? 'bg-gradient-to-br from-orange-500 to-amber-600 shadow-orange-500/20' : 'bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/20'}`}>
                    <Brain className="w-16 h-16 text-white" />
                </div>

                {/* Main headline */}
                <h1 className="relative z-10 text-5xl md:text-7xl font-black text-center mb-6 tracking-tight">
                    <span className={`bg-clip-text text-transparent ${darkMode ? 'bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500' : 'bg-gradient-to-r from-red-500 via-rose-400 to-red-600'}`}>
                        {t('home', 'heroTitle')}
                    </span>
                    <br />
                    <span className="text-2xl md:text-4xl font-bold text-life-text-muted">
                        {t('home', 'heroSubtitle')}
                    </span>
                </h1>

                {/* Subtitle */}
                <p className="relative z-10 text-lg md:text-xl text-life-text-muted text-center max-w-2xl mb-12">
                    {t('home', 'heroDescription')}
                </p>

                {/* CTA Buttons */}
                <div className="relative z-10 flex flex-wrap gap-4 justify-center">
                    <button
                        onClick={() => onNavigate && onNavigate('tasks')}
                        className={`px-8 py-4 text-white rounded font-bold text-lg transition-all hover:scale-105 flex items-center gap-2 shadow-lg ${darkMode
                                ? 'bg-gradient-to-r from-orange-500 to-amber-600 hover:shadow-orange-500/30'
                                : 'bg-gradient-to-r from-red-500 to-rose-600 hover:shadow-red-500/30'
                            }`}
                    >
                        {t('home', 'startNow')} <ArrowRight className="w-5 h-5" />
                    </button>
                    <button
                        className="px-8 py-4 bg-life-bg-base border border-life-border text-life-text-base rounded font-bold text-lg hover:bg-life-bg-alt transition-all flex items-center gap-2"
                    >
                        <Bot className="w-5 h-5" /> {t('home', 'tryAI')}
                    </button>
                </div>

                {/* Stats */}
                <div className="relative z-10 mt-16 grid grid-cols-3 gap-8 text-center">
                    <div>
                        <div className={`text-4xl font-black ${darkMode ? 'text-orange-400' : 'text-red-500'}`}>14</div>
                        <div className="text-life-text-muted text-sm">{t('home', 'aiTools')}</div>
                    </div>
                    <div>
                        <div className={`text-4xl font-black ${darkMode ? 'text-orange-400' : 'text-red-500'}`}>4</div>
                        <div className="text-life-text-muted text-sm">{t('home', 'modules')}</div>
                    </div>
                    <div>
                        <div className={`text-4xl font-black ${darkMode ? 'text-orange-400' : 'text-red-500'}`}>∞</div>
                        <div className="text-life-text-muted text-sm">{t('home', 'possibilities')}</div>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                    <div className="w-6 h-10 border-2 border-life-border rounded flex justify-center pt-2">
                        <div className={`w-1 h-2 rounded ${darkMode ? 'bg-orange-400' : 'bg-red-500'}`} />
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="px-6 py-20 relative">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
                        {t('home', 'featuresTitle')}
                    </h2>
                    <p className="text-life-text-muted text-center mb-16 max-w-2xl mx-auto">
                        {t('home', 'featuresSubtitle')}
                    </p>

                    <div className="grid md:grid-cols-2 gap-6">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="group p-6 bg-life-bg-base border border-life-border rounded hover:shadow-lg transition-all cursor-pointer"
                            >
                                <div className={`w-14 h-14 rounded bg-gradient-to-br ${darkMode ? feature.darkColor : feature.lightColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-white`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-2">{t('home', feature.titleKey)}</h3>
                                <p className="text-life-text-muted">{t('home', feature.descKey)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* TOOLS GUIDE SECTION - What can I ask? */}
            <section className="px-6 py-20 relative">
                <div className={`absolute inset-0 ${darkMode ? 'bg-gradient-to-b from-transparent via-orange-500/5 to-transparent' : 'bg-gradient-to-b from-transparent via-red-500/5 to-transparent'}`} />

                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="text-center mb-12">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded text-sm font-medium mb-4 ${darkMode
                                ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                                : 'bg-red-500/10 text-red-600 border border-red-500/20'
                            }`}>
                            <Bot className="w-4 h-4" /> {t('home', 'aiTools')}
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            {t('home', 'toolsGuideTitle')}
                        </h2>
                        <p className="text-life-text-muted max-w-2xl mx-auto">
                            {t('home', 'toolsGuideSubtitle')}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Tasks Tools */}
                        <div className={`p-6 rounded border bg-life-bg-base border-life-border`}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`p-2 rounded ${toolsGuide.tasks.bgColor} border`}>
                                    <ListTodo className={`w-5 h-5 ${toolsGuide.tasks.color}`} />
                                </div>
                                <h3 className="text-lg font-bold">{t('home', 'taskTools')}</h3>
                            </div>
                            <div className="space-y-3">
                                {toolsGuide.tasks.tools.map((tool, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 rounded bg-life-bg-alt">
                                        <div className={`mt-0.5 ${toolsGuide.tasks.color}`}>{tool.icon}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm">{tool.name}</div>
                                            <div className="text-xs text-life-text-muted mt-1 font-mono truncate">{tool.example}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Finance Tools */}
                        <div className={`p-6 rounded border bg-life-bg-base border-life-border`}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`p-2 rounded ${toolsGuide.finance.bgColor} border`}>
                                    <Wallet className={`w-5 h-5 ${toolsGuide.finance.color}`} />
                                </div>
                                <h3 className="text-lg font-bold">{t('home', 'financeTools')}</h3>
                            </div>
                            <div className="space-y-3">
                                {toolsGuide.finance.tools.map((tool, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 rounded bg-life-bg-alt">
                                        <div className={`mt-0.5 ${toolsGuide.finance.color}`}>{tool.icon}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm">{tool.name}</div>
                                            <div className="text-xs text-life-text-muted mt-1 font-mono truncate">{tool.example}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Mood Tools */}
                        <div className={`p-6 rounded border bg-life-bg-base border-life-border`}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`p-2 rounded ${toolsGuide.mood.bgColor} border`}>
                                    <Smile className={`w-5 h-5 ${toolsGuide.mood.color}`} />
                                </div>
                                <h3 className="text-lg font-bold">{t('home', 'moodTools')}</h3>
                            </div>
                            <div className="space-y-3">
                                {toolsGuide.mood.tools.map((tool, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 rounded bg-life-bg-alt">
                                        <div className={`mt-0.5 ${toolsGuide.mood.color}`}>{tool.icon}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm">{tool.name}</div>
                                            <div className="text-xs text-life-text-muted mt-1 font-mono truncate">{tool.example}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Projects Tools */}
                        <div className={`p-6 rounded border bg-life-bg-base border-life-border`}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`p-2 rounded ${toolsGuide.projects.bgColor} border`}>
                                    <FolderKanban className={`w-5 h-5 ${toolsGuide.projects.color}`} />
                                </div>
                                <h3 className="text-lg font-bold">{t('home', 'projectTools')}</h3>
                            </div>
                            <div className="space-y-3">
                                {toolsGuide.projects.tools.map((tool, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 rounded bg-life-bg-alt">
                                        <div className={`mt-0.5 ${toolsGuide.projects.color}`}>{tool.icon}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm">{tool.name}</div>
                                            <div className="text-xs text-life-text-muted mt-1 font-mono truncate">{tool.example}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Daily Summary highlight */}
                    <div className={`mt-8 p-6 rounded border ${darkMode
                            ? 'bg-gradient-to-r from-orange-500/10 to-amber-500/10 border-orange-500/20'
                            : 'bg-gradient-to-r from-red-500/10 to-rose-500/10 border-red-500/20'
                        }`}>
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded ${darkMode ? 'bg-orange-500/20' : 'bg-red-500/10'}`}>
                                <Sparkles className={`w-8 h-8 ${darkMode ? 'text-orange-400' : 'text-red-500'}`} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold mb-1">
                                    {t('home', 'taskTools') === 'Tareas' ? '⭐ Comando Estrella: Resumen del Día' : '⭐ Star Command: Daily Summary'}
                                </h3>
                                <p className="text-life-text-muted text-sm">
                                    {t('home', 'taskTools') === 'Tareas'
                                        ? 'Pregunta "¿Cómo va mi día?" o "Dame un resumen" para obtener un informe completo con tareas, finanzas y estado de ánimo.'
                                        : 'Ask "How is my day going?" or "Give me a summary" to get a complete report with tasks, finances and mood.'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* AI Section */}
            <section className="px-6 py-20 relative">
                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-12">
                        {/* Left content */}
                        <div className="flex-1">
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded text-sm font-medium mb-6 ${darkMode
                                    ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                                    : 'bg-red-500/10 text-red-600 border border-red-500/20'
                                }`}>
                                <Sparkles className="w-4 h-4" /> {t('home', 'poweredBy')}
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">
                                {t('home', 'aiAssistantTitle')}
                            </h2>
                            <p className="text-life-text-muted text-lg mb-8">
                                {t('home', 'aiAssistantSubtitle')}
                            </p>

                            <div className="grid grid-cols-2 gap-4">
                                {aiCapabilities.map((cap, i) => (
                                    <div key={i} className="flex items-center gap-3 text-life-text-base">
                                        <div className={darkMode ? 'text-orange-400' : 'text-red-500'}>{cap.icon}</div>
                                        <span>{t('home', cap.textKey)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right - Chat preview */}
                        <div className="flex-1 w-full max-w-md">
                            <div className={`border rounded p-6 shadow-xl ${darkMode
                                    ? 'bg-black/50 border-gray-800'
                                    : 'bg-white border-gray-200'
                                }`}>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className={`w-10 h-10 rounded flex items-center justify-center ${darkMode
                                            ? 'bg-gradient-to-br from-orange-500 to-amber-600'
                                            : 'bg-gradient-to-br from-red-500 to-rose-600'
                                        }`}>
                                        <Bot className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <div className="font-bold">LifeOS AI</div>
                                        <div className="text-xs text-life-text-muted flex items-center gap-1">
                                            <span className="w-2 h-2 bg-green-500 rounded" />
                                            {t('home', 'taskTools') === 'Tareas' ? 'Siempre listo para ayudarte' : 'Always ready to help'}
                                        </div>
                                    </div>
                                </div>

                                {/* Sample conversation */}
                                <div className="space-y-4">
                                    <div className="flex justify-end">
                                        <div className={`px-4 py-2 rounded rounded-br-md max-w-[80%] ${darkMode
                                                ? 'bg-orange-500/20 border border-orange-500/30 text-orange-100'
                                                : 'bg-red-500/10 border border-red-500/20 text-red-900'
                                            }`}>
                                            <p className="text-sm">{t('home', 'taskTools') === 'Tareas' ? '¿Cómo va mi día?' : 'How is my day going?'}</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-start">
                                        <div className={`px-4 py-3 rounded rounded-bl-md max-w-[80%] ${darkMode
                                                ? 'bg-gray-800 border border-gray-700'
                                                : 'bg-gray-50 border border-gray-200'
                                            }`}>
                                            <p className="text-sm">
                                                📊 <strong>{t('home', 'taskTools') === 'Tareas' ? 'Resumen del día:' : 'Daily summary:'}</strong><br />
                                                • {t('home', 'taskTools') === 'Tareas' ? '3 tareas pendientes' : '3 pending tasks'}<br />
                                                • {t('home', 'taskTools') === 'Tareas' ? 'Has gastado €45 este mes' : 'You spent $45 this month'}<br />
                                                • {t('home', 'taskTools') === 'Tareas' ? 'Tu ánimo promedio: 😊 4/5' : 'Your avg mood: 😊 4/5'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Input preview */}
                                <div className={`mt-6 flex items-center gap-2 p-3 rounded border ${darkMode
                                        ? 'bg-gray-900 border-gray-700'
                                        : 'bg-gray-50 border-gray-200'
                                    }`}>
                                    <MessageSquare className="w-5 h-5 text-life-text-muted" />
                                    <span className="text-life-text-muted text-sm">{t('home', 'taskTools') === 'Tareas' ? 'Escribe tu mensaje...' : 'Type your message...'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Start Section */}
            <section className="px-6 py-20 relative">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
                        {t('home', 'quickStartTitle')}
                    </h2>
                    <p className="text-life-text-muted text-center mb-12">
                        {t('home', 'quickStartSubtitle')}
                    </p>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className={`w-12 h-12 rounded flex items-center justify-center mx-auto mb-4 font-bold text-xl ${darkMode
                                    ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                                    : 'bg-red-500/10 text-red-600 border border-red-500/20'
                                }`}>1</div>
                            <h3 className="font-bold mb-2">{t('home', 'step1Title')}</h3>
                            <p className="text-life-text-muted text-sm">{t('home', 'step1Desc')}</p>
                        </div>
                        <div className="text-center">
                            <div className={`w-12 h-12 rounded flex items-center justify-center mx-auto mb-4 font-bold text-xl ${darkMode
                                    ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                                    : 'bg-red-500/10 text-red-600 border border-red-500/20'
                                }`}>2</div>
                            <h3 className="font-bold mb-2">{t('home', 'step2Title')}</h3>
                            <p className="text-life-text-muted text-sm">{t('home', 'step2Desc')}</p>
                        </div>
                        <div className="text-center">
                            <div className={`w-12 h-12 rounded flex items-center justify-center mx-auto mb-4 font-bold text-xl ${darkMode
                                    ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                                    : 'bg-red-500/10 text-red-600 border border-red-500/20'
                                }`}>3</div>
                            <h3 className="font-bold mb-2">{t('home', 'step3Title')}</h3>
                            <p className="text-life-text-muted text-sm">{t('home', 'step3Desc')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer CTA */}
            <section className="px-6 py-20 relative">
                <div className="max-w-3xl mx-auto text-center">
                    <div className={`p-8 rounded border ${darkMode
                            ? 'bg-gradient-to-br from-orange-500/10 via-transparent to-purple-500/10 border-gray-800'
                            : 'bg-gradient-to-br from-red-500/5 via-transparent to-blue-500/5 border-gray-200'
                        }`}>
                        <Brain className={`w-12 h-12 mx-auto mb-6 ${darkMode ? 'text-orange-400' : 'text-red-500'}`} />
                        <h2 className="text-2xl md:text-3xl font-bold mb-4">
                            {t('home', 'ctaTitle')}
                        </h2>
                        <p className="text-life-text-muted mb-8">
                            {t('home', 'ctaSubtitle')}
                        </p>
                        <button
                            onClick={() => onNavigate && onNavigate('tasks')}
                            className={`px-8 py-4 text-white rounded font-bold text-lg transition-all hover:scale-105 shadow-lg ${darkMode
                                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 hover:shadow-orange-500/30'
                                    : 'bg-gradient-to-r from-red-500 to-rose-600 hover:shadow-red-500/30'
                                }`}
                        >
                            {t('home', 'ctaButton')}
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="px-6 py-8 border-t border-life-border">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Brain className={`w-6 h-6 ${darkMode ? 'text-orange-400' : 'text-red-500'}`} />
                        <span className="font-bold">LifeOS</span>
                    </div>
                    <p className="text-life-text-muted text-sm">
                        {t('home', 'footer')}
                    </p>
                </div>
            </footer>
        </div>
    );
}
