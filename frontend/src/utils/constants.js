/**
 * Application Constants
 * Centralized definition of colors, icons, and configuration values
 */

// Color palettes for charts and categories
export const CHART_COLORS = {
    light: [
        '#DC2626', '#EA580C', '#D97706', '#CA8A04', '#65A30D',
        '#16A34A', '#059669', '#0D9488', '#0891B2', '#0284C7',
    ],
    dark: [
        '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
        '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
    ],
    sunset: {
        light: ['#DC2626', '#EA580C', '#FBBF24', '#78350F', '#D97706'],
        dark: ['#EF4444', '#F97316', '#EAB308', '#FBBF24', '#FCA5A5', '#FDBA74'],
    },
};

// Task status options
export const TASK_STATUS = {
    INBOX: 'INBOX',
    TODO: 'TODO',
    DONE: 'DONE',
};

export const TASK_STATUS_LABELS = {
    en: { INBOX: 'Inbox', TODO: 'To Do', DONE: 'Done' },
    es: { INBOX: 'Bandeja', TODO: 'Por Hacer', DONE: 'Hecho' },
};

// Energy/Mood levels
export const ENERGY_LEVELS = [
    { value: 1, label: { en: 'Very Low', es: 'Muy Bajo' } },
    { value: 2, label: { en: 'Low', es: 'Bajo' } },
    { value: 3, label: { en: 'Medium', es: 'Medio' } },
    { value: 4, label: { en: 'High', es: 'Alto' } },
    { value: 5, label: { en: 'Very High', es: 'Muy Alto' } },
];

export const MOOD_LEVELS = [
    { value: 1, label: { en: 'Very Bad', es: 'Muy Mal' }, emoji: '😢' },
    { value: 2, label: { en: 'Bad', es: 'Mal' }, emoji: '😕' },
    { value: 3, label: { en: 'Neutral', es: 'Neutral' }, emoji: '😐' },
    { value: 4, label: { en: 'Good', es: 'Bien' }, emoji: '🙂' },
    { value: 5, label: { en: 'Very Good', es: 'Muy Bien' }, emoji: '😄' },
];

// Transaction types
export const TRANSACTION_TYPES = {
    INCOME: 'INCOME',
    EXPENSE: 'EXPENSE',
};

export const TRANSACTION_TYPE_LABELS = {
    en: { INCOME: 'Income', EXPENSE: 'Expense' },
    es: { INCOME: 'Ingreso', EXPENSE: 'Gasto' },
};

// Project status
export const OBJECTIVE_STATUS = {
    PENDING: 'PENDING',
    COMPLETED: 'COMPLETED',
};

// Default category icons for finance
export const CATEGORY_ICONS = [
    'shopping-cart', 'utensils', 'car', 'home', 'heart',
    'gift', 'briefcase', 'plane', 'music', 'film',
    'book', 'coffee', 'wifi', 'phone', 'credit-card',
];

// Default category colors
export const CATEGORY_COLORS = [
    '#6366F1', '#8B5CF6', '#EC4899', '#EF4444', '#F97316',
    '#F59E0B', '#84CC16', '#22C55E', '#14B8A6', '#06B6D4',
    '#3B82F6', '#6B7280', '#78350F', '#1E3A8A', '#7C3AED',
];

// Local storage keys
export const STORAGE_KEYS = {
    API_KEY: 'ai_api_key',
    PROVIDER: 'ai_provider',
    MODEL: 'ai_model',
    DARK_MODE: 'dark_mode',
    LANGUAGE: 'language',
};
