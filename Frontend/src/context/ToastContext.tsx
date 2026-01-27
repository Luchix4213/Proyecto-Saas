import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    addToast: (message: string, type?: ToastType, duration?: number) => void;
    removeToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

interface ToastProviderProps {
    children: ReactNode;
}

const toastVariants = {
    initial: { opacity: 0, y: 20, scale: 0.9 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

const toastStyles = {
    success: { icon: CheckCircle, bg: 'bg-emerald-500', text: 'text-white' },
    error: { icon: AlertCircle, bg: 'bg-red-500', text: 'text-white' },
    warning: { icon: AlertTriangle, bg: 'bg-amber-500', text: 'text-white' },
    info: { icon: Info, bg: 'bg-indigo-500', text: 'text-white' }
};

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const addToast = useCallback((message: string, type: ToastType = 'info', duration = 3000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);

        if (duration) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            {/* Valid Portal could be used here, but fixed rendering works fine for SPA */}
            <div className="fixed bottom-4 right-4 z-[110] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence>
                    {toasts.map(toast => {
                        const style = toastStyles[toast.type];
                        const Icon = style.icon;

                        return (
                            <motion.div
                                key={toast.id}
                                layout
                                variants={toastVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                className={`pointer-events-auto flex items-center gap-3 px-6 py-4 rounded-xl shadow-lg shadow-black/5 min-w-[320px] max-w-sm backdrop-blur-md ${style.bg} ${style.text}`}
                            >
                                <Icon size={20} className="shrink-0" />
                                <p className="font-bold text-sm flex-1">{toast.message}</p>
                                <button
                                    onClick={() => removeToast(toast.id)}
                                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};
