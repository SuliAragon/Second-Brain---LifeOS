import { useState, useCallback } from 'react';

/**
 * Custom hook for modal state management
 * Reusable across different modal types
 */
export function useModal(initialState = false) {
    const [isOpen, setIsOpen] = useState(initialState);
    const [data, setData] = useState(null);

    const open = useCallback((modalData = null) => {
        setData(modalData);
        setIsOpen(true);
    }, []);

    const close = useCallback(() => {
        setIsOpen(false);
        setData(null);
    }, []);

    const toggle = useCallback(() => {
        setIsOpen(prev => !prev);
    }, []);

    return {
        isOpen,
        data,
        open,
        close,
        toggle,
    };
}

/**
 * Custom hook for managing multiple modals
 * Useful when a component has several modal states
 */
export function useModals(modalNames = []) {
    const [modals, setModals] = useState(
        modalNames.reduce((acc, name) => ({ ...acc, [name]: { isOpen: false, data: null } }), {})
    );

    const open = useCallback((name, data = null) => {
        setModals(prev => ({
            ...prev,
            [name]: { isOpen: true, data }
        }));
    }, []);

    const close = useCallback((name) => {
        setModals(prev => ({
            ...prev,
            [name]: { isOpen: false, data: null }
        }));
    }, []);

    const closeAll = useCallback(() => {
        setModals(prev =>
            Object.keys(prev).reduce((acc, name) => ({
                ...acc,
                [name]: { isOpen: false, data: null }
            }), {})
        );
    }, []);

    const isOpen = useCallback((name) => modals[name]?.isOpen || false, [modals]);
    const getData = useCallback((name) => modals[name]?.data || null, [modals]);

    return {
        modals,
        open,
        close,
        closeAll,
        isOpen,
        getData,
    };
}
