/**
 * AI Providers Configuration
 * Extracted from Settings component for reusability
 */

export const AI_PROVIDERS = {
    groq: {
        name: 'Groq',
        logo: '⚡',
        description: {
            en: 'Ultra-fast inference with open models',
            es: 'Inferencia ultra-rápida con modelos abiertos'
        },
        keyPlaceholder: 'gsk_...',
        models: [
            { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', description: 'Latest flagship' },
            { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B', description: 'Fast & Efficient' },
            { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', description: 'Good for longer context' },
            { id: 'gemma2-9b-it', name: 'Gemma 2 9B', description: 'Google model, efficient' },
        ]
    },
    openai: {
        name: 'OpenAI',
        logo: '🤖',
        description: {
            en: 'GPT models with excellent tool calling',
            es: 'Modelos GPT con excelente llamada a herramientas'
        },
        keyPlaceholder: 'sk-...',
        models: [
            { id: 'gpt-4o', name: 'GPT-4o', description: 'Most capable, multimodal' },
            { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Fast and cost-effective' },
            { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Previous flagship' },
            { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast, legacy' },
        ]
    },
    anthropic: {
        name: 'Anthropic',
        logo: '🧠',
        description: {
            en: 'Claude models with strong reasoning',
            es: 'Modelos Claude con fuerte razonamiento'
        },
        keyPlaceholder: 'sk-ant-...',
        models: [
            { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', description: 'Best balance' },
            { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', description: 'Most capable' },
            { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', description: 'Fastest, cheapest' },
        ]
    },
    together: {
        name: 'Together AI',
        logo: '🚀',
        description: {
            en: 'Open source models at scale',
            es: 'Modelos open source a escala'
        },
        keyPlaceholder: 'together_...',
        models: [
            { id: 'meta-llama/Llama-3-70b-chat-hf', name: 'Llama 3 70B', description: 'Meta flagship' },
            { id: 'mistralai/Mixtral-8x7B-Instruct-v0.1', name: 'Mixtral 8x7B', description: 'Open MoE model' },
            { id: 'Qwen/Qwen2-72B-Instruct', name: 'Qwen 2 72B', description: 'Alibaba flagship' },
        ]
    },
    openrouter: {
        name: 'OpenRouter',
        logo: '🌐',
        description: {
            en: 'Access to all major models via one API',
            es: 'Acceso a todos los modelos principales via una API'
        },
        keyPlaceholder: 'sk-or-...',
        models: [
            { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', description: 'Via OpenRouter' },
            { id: 'openai/gpt-4o', name: 'GPT-4o', description: 'Via OpenRouter' },
            { id: 'google/gemini-pro-1.5', name: 'Gemini 1.5 Pro', description: 'Via OpenRouter' },
            { id: 'mistralai/mistral-large', name: 'Mistral Large', description: 'Via OpenRouter' },
        ]
    }
};

/**
 * Get provider URL for documentation/signup
 * @param {string} providerId - Provider ID
 */
export const getProviderUrl = (providerId) => {
    const urls = {
        groq: 'https://console.groq.com/keys',
        openai: 'https://platform.openai.com/api-keys',
        anthropic: 'https://console.anthropic.com/account/keys',
        together: 'https://api.together.xyz/settings/api-keys',
        openrouter: 'https://openrouter.ai/keys',
    };
    return urls[providerId] || '#';
};

/**
 * Get default model for a provider
 * @param {string} providerId - Provider ID
 */
export const getDefaultModel = (providerId) => {
    const provider = AI_PROVIDERS[providerId];
    return provider?.models[0]?.id || '';
};
