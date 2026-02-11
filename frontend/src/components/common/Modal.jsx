import React from 'react';
import { X } from 'lucide-react';

/**
 * Reusable Modal Component
 * Base modal with customizable content
 */
export function Modal({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    showCloseButton = true,
    className = '',
}) {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        full: 'max-w-full mx-4',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div
                className={`bg-life-bg-base p-6 rounded-lg shadow-2xl w-full border border-life-border ${sizeClasses[size]} ${className}`}
                onClick={(e) => e.stopPropagation()}
            >
                {(title || showCloseButton) && (
                    <div className="flex items-center justify-between mb-4">
                        {title && (
                            <h3 className="text-xl font-bold text-life-text-base">
                                {title}
                            </h3>
                        )}
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className="p-1 hover:bg-life-bg-alt rounded transition-colors text-life-text-muted hover:text-life-text-base"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>
                )}
                {children}
            </div>
        </div>
    );
}

/**
 * Modal Footer with action buttons
 */
export function ModalFooter({ children, className = '' }) {
    return (
        <div className={`flex gap-3 justify-end mt-6 pt-4 border-t border-life-border ${className}`}>
            {children}
        </div>
    );
}

export default Modal;
