import React from 'react';

/**
 * Reusable Input Component
 * Text input with label and error handling
 */
export function Input({
    label,
    error,
    helperText,
    icon: Icon,
    className = '',
    inputClassName = '',
    ...props
}) {
    return (
        <div className={`space-y-1 ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-life-text-base">
                    {label}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-life-text-muted">
                        <Icon size={16} />
                    </div>
                )}
                <input
                    className={`w-full px-3 py-2 bg-life-bg-alt text-life-text-base rounded border 
                        ${error ? 'border-red-500' : 'border-life-border'} 
                        focus:border-life-accent focus:outline-none focus:ring-1 focus:ring-life-accent
                        placeholder-life-text-muted transition-colors
                        ${Icon ? 'pl-10' : ''}
                        ${inputClassName}`}
                    {...props}
                />
            </div>
            {error && (
                <p className="text-xs text-red-500">{error}</p>
            )}
            {helperText && !error && (
                <p className="text-xs text-life-text-muted">{helperText}</p>
            )}
        </div>
    );
}

/**
 * Reusable Textarea Component
 */
export function Textarea({
    label,
    error,
    helperText,
    className = '',
    textareaClassName = '',
    rows = 3,
    ...props
}) {
    return (
        <div className={`space-y-1 ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-life-text-base">
                    {label}
                </label>
            )}
            <textarea
                rows={rows}
                className={`w-full px-3 py-2 bg-life-bg-alt text-life-text-base rounded border 
                    ${error ? 'border-red-500' : 'border-life-border'} 
                    focus:border-life-accent focus:outline-none focus:ring-1 focus:ring-life-accent
                    placeholder-life-text-muted transition-colors resize-none
                    ${textareaClassName}`}
                {...props}
            />
            {error && (
                <p className="text-xs text-red-500">{error}</p>
            )}
            {helperText && !error && (
                <p className="text-xs text-life-text-muted">{helperText}</p>
            )}
        </div>
    );
}

/**
 * Reusable Select Component
 */
export function Select({
    label,
    error,
    options = [],
    placeholder,
    className = '',
    selectClassName = '',
    ...props
}) {
    return (
        <div className={`space-y-1 ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-life-text-base">
                    {label}
                </label>
            )}
            <select
                className={`w-full px-3 py-2 bg-life-bg-alt text-life-text-base rounded border 
                    ${error ? 'border-red-500' : 'border-life-border'} 
                    focus:border-life-accent focus:outline-none focus:ring-1 focus:ring-life-accent
                    transition-colors cursor-pointer
                    ${selectClassName}`}
                {...props}
            >
                {placeholder && (
                    <option value="" disabled>{placeholder}</option>
                )}
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && (
                <p className="text-xs text-red-500">{error}</p>
            )}
        </div>
    );
}

export default Input;
