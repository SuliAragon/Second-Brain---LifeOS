import React, { useState, useEffect, useRef } from 'react';
import { Settings as SettingsIcon, Key, Cpu, Save, Check, AlertCircle, Eye, EyeOff, Sparkles, Database, RefreshCw, Upload, Download, Server, Search, ChevronDown, ChevronUp, Star, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useConfirmModal } from '../components/ConfirmModal';
import { useAISettings } from '../hooks/useLocalStorage';
import { useModels } from '../hooks/useModels';
import { exportAllData, importAllData } from '../api';
import { PageContainer, PageHeader, PageSection } from '../components/layout';
import { Card, Input, Button, Modal } from '../components/common';
import { AI_PROVIDERS } from '../config/aiProviders';

export function SettingsPage({ darkMode }) {
    const { t, language } = useLanguage();
    const { showDelete, showAlert, ModalComponent } = useConfirmModal();

    // Use centralized hook for settings
    const {
        provider, setProvider,
        apiKey, setApiKey,
        model, setModel
    } = useAISettings();

    // Dynamic models hook - always fetch for OpenRouter
    const { models: openRouterModels, loading: openRouterLoading, error: openRouterError, refresh: refreshOpenRouter } = useModels('openrouter');

    // UI State
    const [showKey, setShowKey] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');
    const [modelSearch, setModelSearch] = useState('');
    const [showAllModels, setShowAllModels] = useState(false);
    const [showOtherProviders, setShowOtherProviders] = useState(false);
    const [expandedProvider, setExpandedProvider] = useState(null);

    // Backup State
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [importPreview, setImportPreview] = useState(null);
    const [showImportModal, setShowImportModal] = useState(false);
    const fileInputRef = useRef(null);

    // Get models for current provider
    const currentProvider = AI_PROVIDERS[provider];
    let availableModels = provider === 'openrouter'
        ? (openRouterModels.length > 0 ? openRouterModels : AI_PROVIDERS.openrouter.models)
        : (currentProvider?.models || []);

    // Filter popular models for OpenRouter
    if (provider === 'openrouter' && !showAllModels && openRouterModels.length > 20) {
        availableModels = availableModels.filter(m => {
            const id = m.id.toLowerCase();
            return id.includes('claude') || id.includes('gpt') || id.includes('gemini') ||
                id.includes('llama-3') || id.includes('mistral') || id.includes('qwen');
        }).slice(0, 20);
    }

    // Filter by search
    if (modelSearch.trim()) {
        const searchLower = modelSearch.toLowerCase();
        availableModels = availableModels.filter(m =>
            m.name.toLowerCase().includes(searchLower) ||
            m.id.toLowerCase().includes(searchLower) ||
            (m.description && m.description.toLowerCase().includes(searchLower))
        );
    }

    useEffect(() => {
        if (!model && availableModels.length > 0) {
            setModel(availableModels[0].id);
        }
    }, [provider, availableModels, model, setModel]);

    const handleSave = () => {
        setError('');
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const blob = await exportAllData();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `lifeos-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            showAlert('Success', 'Data exported successfully!');
        } catch (err) {
            showAlert('Error', `Export failed: ${err.message}`);
        } finally {
            setIsExporting(false);
        }
    };

    const handleFileSelect = (file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (!data.data) throw new Error('Invalid backup file format');
                const stats = {
                    tasks: data.data.tasks?.length || 0,
                    projects: data.data.projects?.length || 0,
                    journal_entries: data.data.journal_entries?.length || 0,
                    transactions: data.data.transactions?.length || 0,
                };
                setImportPreview({ data, stats });
                setShowImportModal(true);
            } catch (err) {
                showAlert('Error', `Invalid file: ${err.message}`);
            }
        };
        reader.readAsText(file);
    };

    const handleImport = async () => {
        if (!importPreview) return;
        setIsImporting(true);
        setShowImportModal(false);
        try {
            await importAllData(importPreview.data);
            await showAlert('Success', `Imported successfully! Reloading...`);
            setTimeout(() => window.location.reload(), 1500);
        } catch (err) {
            showAlert('Error', `Import failed: ${err.message}`);
        } finally {
            setIsImporting(false);
            setImportPreview(null);
        }
    };

    const isConfigured = (providerId) => {
        if (providerId === provider) return !!apiKey;
        return false;
    };

    const otherProviders = ['groq', 'openai', 'anthropic', 'together'];

    return (
        <PageContainer>
            {ModalComponent}
            <PageHeader
                title={t('settings', 'title')}
                subtitle={t('settings', 'subtitle')}
            />

            <div className="max-w-4xl mx-auto w-full space-y-6">
                {/* Security Note */}
                <div className={`p-4 rounded border flex items-start gap-3 ${darkMode ? 'bg-green-500/10 border-green-500/20' : 'bg-green-50 border-green-200'}`}>
                    <div className="p-2 rounded bg-green-500/20 shrink-0">
                        <Key className="w-5 h-5 text-green-500" />
                    </div>
                    <p className="text-sm text-life-text-muted">{t('settings', 'securityNote')}</p>
                </div>

                {/* OpenRouter - Main Configuration */}
                <div className={`border-2 rounded-lg overflow-hidden ${provider === 'openrouter'
                    ? 'border-life-accent shadow-lg shadow-life-accent/20'
                    : 'border-life-border hover:border-life-accent/50'
                    }`}>
                    <div className="p-8 bg-life-bg-base">
                        <button
                            onClick={() => setProvider('openrouter')}
                            className="w-full"
                        >
                            {/* Centered Header */}
                            <div className="text-center mb-6">
                                <div className="text-5xl mb-4">🌐</div>
                                <h3 className="text-2xl font-bold text-life-text-base mb-3 flex items-center justify-center gap-2">
                                    {t('settings', 'aiConfigTitle')}
                                    {isConfigured('openrouter') && <Check className="w-6 h-6 text-green-500" />}
                                </h3>

                                {/* Explanation */}
                                <p className="text-life-text-base text-base mb-3 max-w-2xl mx-auto" dangerouslySetInnerHTML={{ __html: t('settings', 'aiConfigExplanation') }} />

                                <p className="text-life-text-muted text-sm max-w-xl mx-auto mb-4">
                                    {t('settings', 'aiConfigDescription')}
                                </p>

                                {/* Model Tags */}
                                <div className="flex flex-wrap gap-2 justify-center mb-6">
                                    <span className="text-xs px-3 py-1.5 bg-blue-500/10 text-blue-500 rounded-full font-medium">Claude 4.6</span>
                                    <span className="text-xs px-3 py-1.5 bg-green-500/10 text-green-500 rounded-full font-medium">GPT-4.5</span>
                                    <span className="text-xs px-3 py-1.5 bg-purple-500/10 text-purple-500 rounded-full font-medium">Gemini 2.5</span>
                                    <span className="text-xs px-3 py-1.5 bg-orange-500/10 text-orange-500 rounded-full font-medium">+400 more</span>
                                </div>

                                {/* Steps (if not configured) */}
                                {!isConfigured('openrouter') && (
                                    <div className="pt-6 border-t border-life-border">
                                        <h4 className="text-center text-sm font-semibold text-life-text-base mb-4">{t('settings', 'quickSetup')}</h4>
                                        <div className="flex flex-col md:flex-row gap-4 justify-center items-start max-w-3xl mx-auto">
                                            <div className="flex-1 text-center p-4 bg-life-bg-alt rounded">
                                                <div className="w-8 h-8 rounded-full bg-life-accent/20 text-life-accent font-bold flex items-center justify-center mx-auto mb-2">1</div>
                                                <p className="text-sm text-life-text-base font-medium mb-1">{t('settings', 'step1Title')}</p>
                                                <p className="text-xs text-life-text-muted">{t('settings', 'step1Desc')}</p>
                                            </div>
                                            <div className="flex-1 text-center p-4 bg-life-bg-alt rounded">
                                                <div className="w-8 h-8 rounded-full bg-life-accent/20 text-life-accent font-bold flex items-center justify-center mx-auto mb-2">2</div>
                                                <p className="text-sm text-life-text-base font-medium mb-1">{t('settings', 'step2Title')}</p>
                                                <p className="text-xs text-life-text-muted">{t('settings', 'step2Desc')}</p>
                                            </div>
                                            <div className="flex-1 text-center p-4 bg-life-bg-alt rounded">
                                                <div className="w-8 h-8 rounded-full bg-life-accent/20 text-life-accent font-bold flex items-center justify-center mx-auto mb-2">3</div>
                                                <p className="text-sm text-life-text-base font-medium mb-1">{t('settings', 'step3Title')}</p>
                                                <p className="text-xs text-life-text-muted">{t('settings', 'step3Desc')}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </button>

                        {provider === 'openrouter' && (
                            <div className="mt-6 space-y-4 pt-6 border-t border-life-border">
                                {/* API Key */}
                                <div>
                                    <label className="text-sm font-semibold text-life-text-base mb-2 block">{t('settings', 'apiKeyLabel')}</label>
                                    <div className="relative">
                                        <input
                                            type={showKey ? 'text' : 'password'}
                                            value={apiKey}
                                            onChange={(e) => { setApiKey(e.target.value); setError(''); }}
                                            placeholder="sk-or-..."
                                            className="w-full px-4 py-3 pr-12 bg-life-bg-alt border border-life-border rounded text-life-text-base focus:ring-2 focus:ring-life-accent outline-none font-mono"
                                        />
                                        <button
                                            onClick={() => setShowKey(!showKey)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-life-text-muted hover:text-life-text-base"
                                        >
                                            {showKey ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    <a
                                        href="https://openrouter.ai/keys"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-life-accent hover:underline flex items-center gap-1 mt-2"
                                    >
                                        <Sparkles size={14} />
                                        {t('settings', 'getApiKey')}
                                    </a>
                                </div>

                                {/* Model Selection */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="text-sm font-semibold text-life-text-base">
                                            {t('settings', 'selectModel')}
                                        </label>
                                        <button
                                            onClick={refreshOpenRouter}
                                            disabled={openRouterLoading}
                                            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-life-bg-alt border border-life-border rounded hover:border-life-accent transition-all disabled:opacity-50"
                                        >
                                            <RefreshCw className={`w-4 h-4 ${openRouterLoading ? 'animate-spin' : ''}`} />
                                            {openRouterLoading ? t('settings', 'loadingModels') : t('settings', 'refreshModels')}
                                        </button>
                                    </div>

                                    {openRouterError && (
                                        <div className="mb-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded text-sm text-yellow-600">
                                            {t('settings', 'usingCachedModels')}
                                        </div>
                                    )}

                                    {/* Search */}
                                    {openRouterModels.length > 10 && (
                                        <div className="mb-3">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-life-text-muted" />
                                                <input
                                                    type="text"
                                                    value={modelSearch}
                                                    onChange={(e) => setModelSearch(e.target.value)}
                                                    placeholder={t('settings', 'searchModels')}
                                                    className="w-full pl-10 pr-4 py-2 bg-life-bg-alt border border-life-border rounded text-life-text-base focus:ring-2 focus:ring-life-accent outline-none"
                                                />
                                            </div>
                                            {openRouterModels.length > 20 && (
                                                <button
                                                    onClick={() => setShowAllModels(!showAllModels)}
                                                    className="text-sm text-life-accent hover:underline mt-2"
                                                >
                                                    {showAllModels ? `${t('settings', 'showingAllModels')} (${openRouterModels.length})` : `${t('settings', 'showAllModels')} (${openRouterModels.length})`}
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {/* Model List */}
                                    <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                                        {availableModels.map(m => (
                                            <button
                                                key={m.id}
                                                onClick={() => setModel(m.id)}
                                                className={`w-full p-3 rounded border text-left flex items-center justify-between transition-all ${model === m.id
                                                    ? 'bg-life-accent/10 border-life-accent'
                                                    : 'bg-life-bg-alt border-life-border hover:border-life-accent/50'
                                                    }`}
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-life-text-base truncate">{m.name}</div>
                                                    {m.description && (
                                                        <div className="text-sm text-life-text-muted truncate">{m.description}</div>
                                                    )}
                                                </div>
                                                {model === m.id && <Check className="text-life-accent flex-shrink-0 ml-2" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Save Button */}
                                <Button onClick={handleSave} disabled={saved} className="w-full py-3 text-base">
                                    {saved ? <><Check className="mr-2" /> {t('settings', 'saved')}</> : <><Save className="mr-2" /> {t('settings', 'saveSettings')}</>}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Other Providers - Collapsible */}
                <div className="border border-life-border rounded-lg overflow-hidden bg-life-bg-base">
                    <button
                        onClick={() => setShowOtherProviders(!showOtherProviders)}
                        className="w-full p-5 flex items-center justify-between hover:bg-life-bg-alt transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 text-orange-500" />
                            <div className="text-left">
                                <h3 className="font-semibold text-life-text-base">Direct Provider Access</h3>
                                <p className="text-sm text-life-text-muted">Configure individual providers (may have outdated models)</p>
                            </div>
                        </div>
                        {showOtherProviders ? <ChevronUp /> : <ChevronDown />}
                    </button>

                    {showOtherProviders && (
                        <div className="p-5 pt-0 border-t border-life-border space-y-3">
                            <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded text-sm text-orange-600 mb-4">
                                <strong>Note:</strong> These providers may show outdated model lists. For the latest models, use OpenRouter above.
                            </div>

                            {otherProviders.map(providerId => {
                                const prov = AI_PROVIDERS[providerId];
                                const isExpanded = expandedProvider === providerId;
                                const isActive = provider === providerId;

                                return (
                                    <div key={providerId} className={`border rounded ${isActive ? 'border-life-accent' : 'border-life-border'}`}>
                                        <button
                                            onClick={() => {
                                                setExpandedProvider(isExpanded ? null : providerId);
                                                if (!isActive) setProvider(providerId);
                                            }}
                                            className="w-full p-4 flex items-center justify-between hover:bg-life-bg-alt transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="text-2xl">{prov.logo}</div>
                                                <div className="text-left">
                                                    <div className="font-medium text-life-text-base">{prov.name}</div>
                                                    <div className="text-sm text-life-text-muted">
                                                        {isConfigured(providerId) ? '✅ Configured' : '⚠️ Needs API key'}
                                                    </div>
                                                </div>
                                            </div>
                                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                        </button>

                                        {isExpanded && isActive && (
                                            <div className="p-4 border-t border-life-border space-y-4 bg-life-bg-alt">
                                                {/* API Key */}
                                                <div>
                                                    <label className="text-sm font-semibold text-life-text-base mb-2 block">API Key</label>
                                                    <div className="relative">
                                                        <input
                                                            type={showKey ? 'text' : 'password'}
                                                            value={apiKey}
                                                            onChange={(e) => setApiKey(e.target.value)}
                                                            placeholder={prov.keyPlaceholder}
                                                            className="w-full px-4 py-2 pr-12 bg-life-bg-base border border-life-border rounded text-life-text-base focus:ring-2 focus:ring-life-accent outline-none font-mono"
                                                        />
                                                        <button
                                                            onClick={() => setShowKey(!showKey)}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-life-text-muted hover:text-life-text-base"
                                                        >
                                                            {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Models */}
                                                <div>
                                                    <label className="text-sm font-semibold text-life-text-base mb-2 block">Model</label>
                                                    <div className="space-y-2">
                                                        {prov.models.map(m => (
                                                            <button
                                                                key={m.id}
                                                                onClick={() => setModel(m.id)}
                                                                className={`w-full p-3 rounded border text-left flex items-center justify-between ${model === m.id
                                                                    ? 'bg-life-accent/10 border-life-accent'
                                                                    : 'bg-life-bg-base border-life-border hover:border-life-accent/50'
                                                                    }`}
                                                            >
                                                                <div>
                                                                    <div className="font-medium text-life-text-base text-sm">{m.name}</div>
                                                                    <div className="text-xs text-life-text-muted">{m.description}</div>
                                                                </div>
                                                                {model === m.id && <Check className="text-life-accent" size={18} />}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <Button onClick={handleSave} disabled={saved} className="w-full">
                                                    {saved ? <><Check size={16} className="mr-2" /> Saved!</> : <><Save size={16} className="mr-2" /> Save</>}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Backup */}
                <PageSection title="Data Backup & Restore" icon={Database}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={handleExport}
                            disabled={isExporting}
                            className="p-6 rounded border bg-life-bg-base border-life-border hover:border-life-accent text-left transition-all"
                        >
                            <div className="flex items-center gap-3 mb-3 text-life-text-base font-bold">
                                {isExporting ? <RefreshCw className="animate-spin" /> : <Download />}
                                Export Data
                            </div>
                            <p className="text-sm text-life-text-muted">Download JSON backup</p>
                        </button>

                        <div
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={(e) => {
                                e.preventDefault();
                                setIsDragging(false);
                                const file = e.dataTransfer.files[0];
                                if (file?.type === 'application/json') handleFileSelect(file);
                            }}
                            onClick={() => fileInputRef.current?.click()}
                            className={`p-6 rounded border-2 border-dashed cursor-pointer transition-all ${isDragging ? 'border-life-accent bg-life-accent/10' : 'border-life-border hover:border-life-accent'
                                }`}
                        >
                            <div className="flex items-center gap-3 mb-3 text-life-text-base font-bold">
                                {isImporting ? <RefreshCw className="animate-spin" /> : <Upload />}
                                Import Data
                            </div>
                            <p className="text-sm text-life-text-muted">Drag & drop or click</p>
                            <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={(e) => handleFileSelect(e.target.files[0])} />
                        </div>
                    </div>
                </PageSection>
            </div>

            {/* Import Modal */}
            <Modal isOpen={showImportModal} onClose={() => setShowImportModal(false)} title="Confirm Import">
                <div className="space-y-4">
                    <p className="text-life-text-muted">This will replace ALL existing data. Cannot be undone.</p>
                    {importPreview && (
                        <div className="bg-life-bg-alt p-4 rounded text-sm space-y-2">
                            {Object.entries(importPreview.stats).map(([key, val]) => (
                                <div key={key} className="flex justify-between">
                                    <span className="capitalize">{key.replace('_', ' ')}:</span>
                                    <span className="font-bold">{val}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="secondary" onClick={() => setShowImportModal(false)}>Cancel</Button>
                        <Button variant="danger" onClick={handleImport} disabled={isImporting}>
                            {isImporting ? 'Importing...' : 'Import & Replace'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </PageContainer>
    );
}

export default SettingsPage;
