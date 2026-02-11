import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Loader2, Minimize2, Maximize2, Terminal } from 'lucide-react';

export function ChatBubble({ darkMode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: '[ SYSTEM READY ] LifeOS AI initialized. Query tasks, finances, or mood data.'
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Get AI settings from localStorage
    // Helper to safely parse JSON from storage
    const getStorageValue = (storage, key, defaultValue) => {
        try {
            const item = storage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.warn(`Error parsing ${key}:`, error);
            return defaultValue;
        }
    };

    // Get AI settings from storage
    const getAISettings = () => {
        const provider = getStorageValue(localStorage, 'lifeos_ai_provider', 'groq');

        let model = getStorageValue(localStorage, 'lifeos_ai_model', 'llama-3.1-8b-instant');

        // Auto-update to 8b if user is stuck on 70b (optional, but good for now)
        if (model === 'llama-3.3-70b-versatile') {
            model = 'llama-3.1-8b-instant';
        }

        // Try session first, then local (for backward compat), then empty
        // Note: apiKey might be empty string, which is falsy, so be careful with logic if needed
        const sessionKey = getStorageValue(sessionStorage, 'lifeos_ai_key', null);
        const localKey = getStorageValue(localStorage, 'lifeos_ai_key', '');
        const apiKey = sessionKey !== null ? sessionKey : localKey;

        return { provider, apiKey, model };
    };

    const [aiSettings, setAISettings] = useState(getAISettings());

    // Update settings when localStorage changes
    useEffect(() => {
        const handleStorageChange = () => setAISettings(getAISettings());
        window.addEventListener('storage', handleStorageChange);

        // Also check periodically in case settings were changed in same tab
        const interval = setInterval(() => setAISettings(getAISettings()), 2000);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && !isMinimized) {
            inputRef.current?.focus();
        }
    }, [isOpen, isMinimized]);

    const handleSend = async () => {
        if (!message.trim() || isLoading) return;

        // Check for API key
        const settings = getAISettings();
        if (!settings.apiKey) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '[ ERROR ] No API key configured. Navigate to Settings to add your credentials.',
                isError: true
            }]);
            return;
        }

        const userMessage = message.trim();
        setMessage('');

        // Build conversation history for context (excluding system messages and errors)
        const currentMessages = [...messages, { role: 'user', content: userMessage }];
        const conversationHistory = currentMessages
            .filter(m => !m.isError && m.role !== 'system')
            .map(m => ({ role: m.role, content: m.content }));

        setMessages(currentMessages);
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:8000/api/chat/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    conversation_history: conversationHistory,
                    provider: settings.provider,
                    api_key: settings.apiKey,
                    model: settings.model
                })
            });


            const data = await response.json();

            if (data.error) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: `[ ERROR ] ${data.error}`,
                    isError: true
                }]);
            } else {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: data.response,
                    tools: data.tools_used
                }]);

                // Dispatch refresh events based on tools used
                if (data.tools_used && data.tools_used.length > 0) {
                    const tools = data.tools_used;

                    // Refresh tasks if task tools were used
                    if (tools.some(t => ['create_task', 'complete_task', 'delete_task', 'update_task'].includes(t))) {
                        window.dispatchEvent(new CustomEvent('refresh-tasks'));
                    }

                    // Refresh finance if finance tools were used
                    if (tools.some(t => ['add_transaction', 'create_savings_goal', 'add_funds_to_goal', 'delete_savings_goal'].includes(t))) {
                        window.dispatchEvent(new CustomEvent('refresh-finance'));
                    }

                    // Refresh journal if journal tools were used
                    if (tools.some(t => ['write_journal_entry', 'delete_journal_entry', 'update_journal_entry'].includes(t))) {
                        window.dispatchEvent(new CustomEvent('refresh-journal'));
                    }

                    // Refresh projects if project tools were used
                    if (tools.some(t => ['create_project', 'add_project_objective', 'add_project_objectives_batch', 'complete_objective', 'delete_project', 'delete_objective'].includes(t))) {
                        window.dispatchEvent(new CustomEvent('refresh-projects'));
                    }
                }
            }
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '[ CONNECTION_ERROR ] Server unreachable. Verify backend is running.',
                isError: true
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const quickPrompts = [
        "[ DAILY_SUMMARY ]",
        "[ MONTHLY_EXPENSES ]",
        "[ OVERDUE_TASKS ]"
    ];

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-life-bg-base border-2 border-life-accent flex items-center justify-center text-life-accent hover:bg-life-accent hover:text-life-bg-base transition-all z-50 group"
            >
                <Terminal className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border border-life-bg-base" />
            </button>
        );
    }

    return (
        <div
            className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${isMinimized ? 'w-80 h-12' : 'w-[420px] h-[550px]'
                }`}
        >
            <div className={`w-full h-full bg-life-bg-base border border-life-border flex flex-col overflow-hidden`}>
                {/* Header - Terminal style */}
                <div className="flex items-center justify-between px-4 py-2 bg-life-bg-alt border-b border-life-border">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 bg-red-500" />
                            <span className="w-3 h-3 bg-yellow-500" />
                            <span className="w-3 h-3 bg-green-500" />
                        </div>
                        <span className="font-mono text-xs text-life-text-muted tracking-wide">
                            user@lifeos:~/assistant
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setIsMinimized(!isMinimized)}
                            className="p-1.5 hover:bg-life-bg-base text-life-text-muted hover:text-life-text-base transition-colors"
                        >
                            {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                        </button>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1.5 hover:bg-life-bg-base text-life-text-muted hover:text-life-accent transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>

                {!isMinimized && (
                    <>
                        {/* Status bar */}
                        <div className="px-4 py-2 border-b border-life-border bg-life-bg-alt/50">
                            <div className="flex items-center justify-between text-xs font-mono">
                                <span className="text-life-accent">[ LIFEOS_AI ]</span>
                                <span className="text-life-text-muted flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-green-500" />
                                    ONLINE
                                </span>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-sm">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`${msg.role === 'user' ? 'text-right' : 'text-left'}`}
                                >
                                    <div
                                        className={`inline-block max-w-[90%] px-3 py-2 ${msg.role === 'user'
                                            ? 'bg-life-accent text-life-bg-base'
                                            : msg.isError
                                                ? 'bg-red-500/10 border border-red-500/50 text-red-400'
                                                : 'bg-life-bg-alt border border-life-border text-life-text-base'
                                            }`}
                                    >
                                        {msg.role === 'assistant' && (
                                            <span className="text-life-accent text-xs block mb-1">
                                                {'>'} system_response:
                                            </span>
                                        )}
                                        {msg.role === 'user' && (
                                            <span className="text-life-bg-base/70 text-xs block mb-1">
                                                {'>'} user_input:
                                            </span>
                                        )}
                                        <p className="whitespace-pre-wrap">{msg.content}</p>
                                        {msg.tools && msg.tools.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-1">
                                                {msg.tools.map((tool, i) => (
                                                    <span key={i} className="text-xs px-1.5 py-0.5 bg-life-bg-base border border-life-border text-life-accent">
                                                        [ {tool} ]
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="text-left">
                                    <div className="inline-block bg-life-bg-alt border border-life-border px-3 py-2">
                                        <div className="flex items-center gap-2 text-life-text-muted">
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                            <span className="text-xs font-mono">processing_request...</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick prompts */}
                        {messages.length <= 2 && (
                            <div className="px-4 pb-2 flex flex-wrap gap-2">
                                {quickPrompts.map((prompt, i) => (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            const cleanPrompt = prompt === "[ DAILY_SUMMARY ]" ? "Dame un resumen del día"
                                                : prompt === "[ MONTHLY_EXPENSES ]" ? "¿Cuánto he gastado este mes?"
                                                    : "¿Tengo tareas vencidas?";
                                            setMessage(cleanPrompt);
                                            setTimeout(() => handleSend(), 100);
                                        }}
                                        className="text-xs font-mono px-2 py-1 bg-life-bg-alt border border-life-border text-life-accent hover:bg-life-accent hover:text-life-bg-base transition-colors"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Input - Terminal style */}
                        <div className="p-4 border-t border-life-border bg-life-bg-alt">
                            <div className="flex items-center gap-2 bg-life-bg-base border border-life-border px-3 py-2 focus-within:border-life-accent transition-colors">
                                <span className="text-life-accent font-mono text-sm">$</span>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="enter_command..."
                                    className="flex-1 bg-transparent text-life-text-base text-sm font-mono placeholder-life-text-muted outline-none"
                                    disabled={isLoading}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!message.trim() || isLoading}
                                    className="p-1.5 bg-life-accent text-life-bg-base disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="mt-2 text-xs font-mono text-life-text-muted text-center">
                                {aiSettings.apiKey
                                    ? `[ ${aiSettings.provider.toUpperCase()} ] ${aiSettings.model.split('/').pop()}`
                                    : '[ WARNING ] api_key_missing'}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
