import React from 'react';

/**
 * Reusable Card Component
 * Container with consistent styling
 */
export function Card({
    children,
    className = '',
    padding = 'md',
    hover = false,
    onClick,
    ...props
}) {
    const paddingClasses = {
        none: '',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
    };

    const hoverClasses = hover
        ? 'hover:border-life-accent/50 cursor-pointer transition-colors'
        : '';

    return (
        <div
            className={`bg-life-bg-base border border-life-border rounded-lg ${paddingClasses[padding]} ${hoverClasses} ${className}`}
            onClick={onClick}
            {...props}
        >
            {children}
        </div>
    );
}

/**
 * Card Header
 */
export function CardHeader({ children, className = '' }) {
    return (
        <div className={`flex items-center justify-between mb-4 ${className}`}>
            {children}
        </div>
    );
}

/**
 * Card Title
 */
export function CardTitle({ children, icon: Icon, className = '' }) {
    return (
        <h3 className={`flex items-center gap-2 font-semibold text-life-text-base ${className}`}>
            {Icon && <Icon size={18} />}
            {children}
        </h3>
    );
}

/**
 * Card Content
 */
export function CardContent({ children, className = '' }) {
    return (
        <div className={className}>
            {children}
        </div>
    );
}

/**
 * Card Footer
 */
export function CardFooter({ children, className = '' }) {
    return (
        <div className={`mt-4 pt-4 border-t border-life-border ${className}`}>
            {children}
        </div>
    );
}

export default Card;
