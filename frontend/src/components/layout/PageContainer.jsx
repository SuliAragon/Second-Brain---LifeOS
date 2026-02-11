import React from 'react';

/**
 * Page Container Component
 * Wrapper for main content pages with consistent styling
 */
export function PageContainer({
    children,
    className = '',
    fullWidth = false,
}) {
    return (
        <div className={`flex-1 overflow-y-auto bg-life-bg-alt ${className}`}>
            <div className={fullWidth ? '' : 'max-w-7xl mx-auto p-6'}>
                {children}
            </div>
        </div>
    );
}

/**
 * Page Header Component
 */
export function PageHeader({
    title,
    subtitle,
    icon: Icon,
    action,
    className = ''
}) {
    return (
        <div className={`flex items-center justify-between mb-6 ${className}`}>
            <div>
                <h1 className="text-2xl font-bold text-life-text-base flex items-center gap-3">
                    {Icon && <Icon className="w-7 h-7" />}
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-life-text-muted mt-1">{subtitle}</p>
                )}
            </div>
            {action}
        </div>
    );
}

/**
 * Page Section Component
 */
export function PageSection({
    title,
    icon: Icon,
    action,
    children,
    className = ''
}) {
    return (
        <section className={`mb-8 ${className}`}>
            {title && (
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-life-text-base flex items-center gap-2">
                        {Icon && <Icon size={18} />}
                        {title}
                    </h2>
                    {action}
                </div>
            )}
            {children}
        </section>
    );
}

export default PageContainer;
