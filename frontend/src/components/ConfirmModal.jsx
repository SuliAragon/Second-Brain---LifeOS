import React from 'react';
import { AlertTriangle, X, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

/**
 * Custom confirmation/alert modal that matches the app's design system.
 * 
 * Props:
 * - isOpen: boolean - Whether the modal is visible
 * - onClose: function - Called when modal is closed (cancel/X)
 * - onConfirm: function - Called when confirm button is clicked
 * - title: string - Modal title
 * - message: string - Modal message/description
 * - type: 'confirm' | 'alert' | 'delete' | 'input' - Determines styling and buttons
 * - confirmText: string - Custom confirm button text
 * - cancelText: string - Custom cancel button text
 * - inputValue: string - Current input value (for input type)
 * - onInputChange: function - Called when input changes (for input type)
 * - inputPlaceholder: string - Placeholder for input field
 */
export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm',
    message = 'Are you sure?',
    type = 'confirm',
    confirmText,
    cancelText = 'Cancel',
    inputValue = '',
    onInputChange,
    inputPlaceholder = ''
}) {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'delete':
                return <Trash2 className="w-6 h-6 text-red-500" />;
            case 'alert':
                return <AlertCircle className="w-6 h-6 text-orange-500" />;
            case 'input':
                return <CheckCircle className="w-6 h-6 text-green-500" />;
            default:
                return <AlertTriangle className="w-6 h-6 text-orange-500" />;
        }
    };

    const getConfirmButton = () => {
        const baseClasses = "px-4 py-2 rounded font-medium transition-all";
        switch (type) {
            case 'delete':
                return `${baseClasses} bg-red-500 hover:bg-red-600 text-white`;
            case 'alert':
                return `${baseClasses} bg-orange-500 hover:bg-orange-600 text-white`;
            case 'input':
                return `${baseClasses} bg-green-500 hover:bg-green-600 text-white`;
            default:
                return `${baseClasses} bg-life-accent hover:opacity-90 text-white`;
        }
    };

    const defaultConfirmText = type === 'delete' ? 'Delete' : type === 'alert' ? 'OK' : type === 'input' ? 'Confirmar' : 'Confirm';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={type === 'alert' ? onClose : undefined}
            />

            {/* Modal */}
            <div className="relative bg-life-bg-base border border-life-border rounded shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center gap-3 p-5 border-b border-life-border bg-life-bg-alt/50">
                    <div className={`p-2 rounded ${type === 'delete' ? 'bg-red-500/10' : type === 'input' ? 'bg-green-500/10' : 'bg-orange-500/10'}`}>
                        {getIcon()}
                    </div>
                    <h3 className="text-lg font-bold text-life-text-base flex-1">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-life-bg-alt rounded transition-colors text-life-text-muted hover:text-life-text-base"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5">
                    <p className="text-life-text-muted leading-relaxed mb-4">{message}</p>
                    {type === 'input' && (
                        <input
                            type="number"
                            value={inputValue}
                            onChange={(e) => onInputChange?.(e.target.value)}
                            placeholder={inputPlaceholder}
                            className="w-full px-4 py-3 bg-life-bg-alt border border-life-border rounded text-life-text-base focus:ring-2 focus:ring-life-accent focus:border-transparent outline-none text-lg"
                            autoFocus
                        />
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-5 bg-life-bg-alt/30 border-t border-life-border">
                    {type !== 'alert' && (
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded font-medium text-life-text-muted hover:text-life-text-base hover:bg-life-bg-alt transition-all"
                        >
                            {cancelText}
                        </button>
                    )}
                    <button
                        onClick={() => {
                            onConfirm?.();
                            onClose();
                        }}
                        className={getConfirmButton()}
                    >
                        {confirmText || defaultConfirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

/**
 * Hook to easily use confirmation modals
 * Returns: { showConfirm, showAlert, showDelete, showInput, ModalComponent }
 */
export function useConfirmModal() {
    const [modalState, setModalState] = React.useState({
        isOpen: false,
        type: 'confirm',
        title: '',
        message: '',
        confirmText: '',
        cancelText: 'Cancel',
        inputValue: '',
        inputPlaceholder: ''
    });

    // Use refs to avoid stale closure issues
    const resolverRef = React.useRef(null);
    const inputValueRef = React.useRef('');

    // Keep refs in sync
    React.useEffect(() => {
        inputValueRef.current = modalState.inputValue;
    }, [modalState.inputValue]);

    const closeModal = () => {
        setModalState(prev => ({ ...prev, isOpen: false }));
        resolverRef.current = null;
    };

    const handleInputChange = (value) => {
        setModalState(prev => ({ ...prev, inputValue: value }));
    };

    const handleConfirm = () => {
        if (resolverRef.current) {
            if (modalState.type === 'input') {
                resolverRef.current(inputValueRef.current);
            } else {
                resolverRef.current(true);
            }
        }
        closeModal();
    };

    const handleCancel = () => {
        if (resolverRef.current && modalState.type !== 'alert') {
            resolverRef.current(null);
        }
        closeModal();
    };

    const showConfirm = (title, message, options = {}) => {
        return new Promise((resolve) => {
            resolverRef.current = resolve;
            setModalState({
                isOpen: true,
                type: 'confirm',
                title,
                message,
                inputValue: '',
                inputPlaceholder: '',
                confirmText: options.confirmText || 'Confirm',
                cancelText: options.cancelText || 'Cancel'
            });
        });
    };

    const showDelete = (title, message, options = {}) => {
        return new Promise((resolve) => {
            resolverRef.current = resolve;
            setModalState({
                isOpen: true,
                type: 'delete',
                title,
                message,
                inputValue: '',
                inputPlaceholder: '',
                confirmText: options.confirmText || 'Delete',
                cancelText: options.cancelText || 'Cancel'
            });
        });
    };

    const showAlert = (title, message, options = {}) => {
        return new Promise((resolve) => {
            resolverRef.current = resolve;
            setModalState({
                isOpen: true,
                type: 'alert',
                title,
                message,
                inputValue: '',
                inputPlaceholder: '',
                confirmText: options.confirmText || 'OK',
                cancelText: 'Cancel'
            });
        });
    };

    const showInput = (title, message, options = {}) => {
        return new Promise((resolve) => {
            resolverRef.current = resolve;
            inputValueRef.current = '';
            setModalState({
                isOpen: true,
                type: 'input',
                title,
                message,
                inputValue: '',
                inputPlaceholder: options.placeholder || '0.00',
                confirmText: options.confirmText || 'Confirmar',
                cancelText: options.cancelText || 'Cancelar'
            });
        });
    };

    const ModalComponent = (
        <ConfirmModal
            isOpen={modalState.isOpen}
            onClose={handleCancel}
            onConfirm={handleConfirm}
            title={modalState.title}
            message={modalState.message}
            type={modalState.type}
            confirmText={modalState.confirmText}
            cancelText={modalState.cancelText}
            inputValue={modalState.inputValue}
            onInputChange={handleInputChange}
            inputPlaceholder={modalState.inputPlaceholder}
        />
    );

    return { showConfirm, showAlert, showDelete, showInput, ModalComponent };
}

