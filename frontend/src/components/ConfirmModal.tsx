import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    message,
    confirmText = '确定',
    cancelText = '取消',
    variant = 'warning',
    onConfirm,
    onCancel
}) => {
    if (!isOpen) return null;

    const variantStyles = {
        danger: {
            icon: <AlertTriangle className="w-6 h-6 text-red-500" />,
            confirmBg: 'bg-red-600 hover:bg-red-700',
            iconBg: 'bg-red-50'
        },
        warning: {
            icon: <AlertTriangle className="w-6 h-6 text-yellow-500" />,
            confirmBg: 'bg-black hover:bg-gray-900',
            iconBg: 'bg-yellow-50'
        },
        info: {
            icon: <Info className="w-6 h-6 text-blue-500" />,
            confirmBg: 'bg-black hover:bg-gray-900',
            iconBg: 'bg-blue-50'
        }
    };

    const styles = variantStyles[variant];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/50 transition-opacity"
                onClick={onCancel}
            />

            {/* Modal */}
            <div className="relative bg-white w-full max-w-sm mx-4 shadow-xl animate-fade-in">
                <div className="p-6">
                    {/* Icon */}
                    <div className={`w-12 h-12 mx-auto rounded-full ${styles.iconBg} flex items-center justify-center mb-4`}>
                        {styles.icon}
                    </div>

                    {/* Title */}
                    <h3 className="text-center font-display text-lg text-black mb-2">
                        {title}
                    </h3>

                    {/* Message */}
                    <p className="text-center font-body text-sm text-gray-1 mb-6">
                        {message}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="flex-1 h-10 border border-gray-3 font-body text-sm text-black hover:bg-gray-2 transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`flex-1 h-10 font-body text-sm text-white transition-colors ${styles.confirmBg}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in {
                    animation: fade-in 0.2s ease-out;
                }
            `}</style>
        </div>
    );
};

export default ConfirmModal;
