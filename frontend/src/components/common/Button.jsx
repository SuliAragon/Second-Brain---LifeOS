import React from 'react';

/**
 * Reusable Button Component
 * Variants: primary, secondary, danger, ghost
 */
export function Button({
    children,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    icon: Icon,
    iconPosition = 'left',
    className = '',
    onClick,
    type = 'button',
    ...props
}) {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantClasses = {
        primary: 'bg-life-accent text-white hover:opacity-90 focus:ring-life-accent',
        secondary: 'bg-life-bg-alt text-life-text-base border border-life-border hover:bg-life-border focus:ring-life-border',
        danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
        ghost: 'text-life-text-muted hover:text-life-text-base hover:bg-life-bg-alt focus:ring-life-border',
        success: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500',
    };

    const sizeClasses = {
        sm: 'px-2 py-1 text-xs gap-1',
        md: 'px-4 py-2 text-sm gap-2',
        lg: 'px-6 py-3 text-base gap-2',
    };

    const iconSizes = {
        sm: 14,
        md: 16,
        lg: 18,
    };

    return (
        <button
            type={type}
            disabled={disabled || loading}
            onClick={onClick}
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
            {...props}
        >
            {loading ? (
                <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
            ) : (
                <>
                    {Icon && iconPosition === 'left' && <Icon size={iconSizes[size]} />}
                    {children}
                    {Icon && iconPosition === 'right' && <Icon size={iconSizes[size]} />}
                </>
            )}
        </button>
    );
}

export default Button;
