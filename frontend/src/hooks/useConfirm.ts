import { useState, useCallback } from 'react';

interface ConfirmOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
}

interface ConfirmState extends ConfirmOptions {
    isOpen: boolean;
    resolve: ((value: boolean) => void) | null;
}

export function useConfirm() {
    const [state, setState] = useState<ConfirmState>({
        isOpen: false,
        title: '',
        message: '',
        confirmText: '确定',
        cancelText: '取消',
        variant: 'warning',
        resolve: null
    });

    const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            setState({
                isOpen: true,
                ...options,
                resolve
            });
        });
    }, []);

    const handleConfirm = useCallback(() => {
        state.resolve?.(true);
        setState(prev => ({ ...prev, isOpen: false, resolve: null }));
    }, [state.resolve]);

    const handleCancel = useCallback(() => {
        state.resolve?.(false);
        setState(prev => ({ ...prev, isOpen: false, resolve: null }));
    }, [state.resolve]);

    return {
        confirm,
        confirmProps: {
            isOpen: state.isOpen,
            title: state.title,
            message: state.message,
            confirmText: state.confirmText,
            cancelText: state.cancelText,
            variant: state.variant,
            onConfirm: handleConfirm,
            onCancel: handleCancel
        }
    };
}
