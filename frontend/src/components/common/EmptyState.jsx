import React from 'react';
import { Inbox, FileText, Folder, Wallet } from 'lucide-react';

/**
 * Empty State Component
 * Display when there's no data to show
 */
export function EmptyState({
    icon: Icon = Inbox,
    title,
    description,
    action,
    className = '',
}) {
    return (
        <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
            <div className="w-16 h-16 rounded-full bg-life-bg-alt flex items-center justify-center mb-4">
                <Icon className="w-8 h-8 text-life-text-muted" />
            </div>
            {title && (
                <h3 className="text-lg font-medium text-life-text-base mb-2">
                    {title}
                </h3>
            )}
            {description && (
                <p className="text-sm text-life-text-muted max-w-sm mb-4">
                    {description}
                </p>
            )}
            {action}
        </div>
    );
}

/**
 * Loading Spinner Component
 */
export function LoadingSpinner({ size = 'md', className = '' }) {
    const sizeClasses = {
        sm: 'h-4 w-4 border-2',
        md: 'h-8 w-8 border-2',
        lg: 'h-12 w-12 border-3',
    };

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div
                className={`animate-spin rounded-full border-life-accent border-t-transparent ${sizeClasses[size]}`}
            />
        </div>
    );
}

/**
 * Full page loading state
 */
export function LoadingPage({ message = 'Loading...' }) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center bg-life-bg-alt">
            <LoadingSpinner size="lg" className="mb-4" />
            <p className="text-life-text-muted">{message}</p>
        </div>
    );
}

/**
 * Badge Component
 */
export function Badge({
    children,
    variant = 'default',
    size = 'md',
    className = '',
}) {
    const variantClasses = {
        default: 'bg-life-bg-alt text-life-text-muted',
        primary: 'bg-life-accent/20 text-life-accent',
        success: 'bg-green-500/20 text-green-500',
        warning: 'bg-yellow-500/20 text-yellow-600',
        danger: 'bg-red-500/20 text-red-500',
    };

    const sizeClasses = {
        sm: 'px-1.5 py-0.5 text-xs',
        md: 'px-2 py-1 text-xs',
        lg: 'px-3 py-1 text-sm',
    };

    return (
        <span className={`inline-flex items-center rounded-full font-medium ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
            {children}
        </span>
    );
}

export default EmptyState;
