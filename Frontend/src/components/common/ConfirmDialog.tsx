import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info, CheckCircle, AlertOctagon } from 'lucide-react';

export type DialogType = 'danger' | 'warning' | 'info' | 'success';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    type?: DialogType;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
}

const variants = {
    danger: {
        icon: <AlertOctagon size={32} />,
        color: 'text-red-500',
        bg: 'bg-red-50',
        button: 'bg-red-500 hover:bg-red-600 shadow-red-500/30',
        border: 'border-red-100'
    },
    warning: {
        icon: <AlertTriangle size={32} />,
        color: 'text-amber-500',
        bg: 'bg-amber-50',
        button: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30',
        border: 'border-amber-100'
    },
    info: {
        icon: <Info size={32} />,
        color: 'text-blue-500',
        bg: 'bg-blue-50',
        button: 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/30',
        border: 'border-blue-100'
    },
    success: {
        icon: <CheckCircle size={32} />,
        color: 'text-emerald-500',
        bg: 'bg-emerald-50',
        button: 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30',
        border: 'border-emerald-100'
    }
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    type = 'info',
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    isLoading = false
}) => {
    const style = variants[type];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        onClick={!isLoading ? onClose : undefined}
                    />

                    {/* Dialog */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", duration: 0.4 }}
                        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden z-10"
                    >
                        <div className="p-8 text-center">
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border-4 ${style.bg} ${style.border} ${style.color}`}>
                                {style.icon}
                            </div>

                            <h3 className="text-2xl font-black text-slate-800 mb-3">{title}</h3>

                            <p className="text-slate-500 font-medium leading-relaxed mb-8">
                                {message}
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="flex-1 px-6 py-3.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors disabled:opacity-50"
                                >
                                    {cancelText}
                                </button>
                                <button
                                    onClick={onConfirm}
                                    disabled={isLoading}
                                    className={`flex-1 px-6 py-3.5 text-white rounded-xl font-bold shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0 ${style.button}`}
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Procesando...</span>
                                        </div>
                                    ) : (
                                        confirmText
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
