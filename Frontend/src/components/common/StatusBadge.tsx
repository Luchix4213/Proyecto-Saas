import React from 'react';

export type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface StatusBadgeProps {
    status: string;
    variant?: StatusVariant;
    className?: string;
}

const variantStyles: Record<StatusVariant, string> = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    warning: 'bg-amber-50 text-amber-700 border-amber-100',
    error: 'bg-red-50 text-red-700 border-red-100',
    info: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    neutral: 'bg-slate-50 text-slate-600 border-slate-200'
};

const dotStyles: Record<StatusVariant, string> = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
    info: 'bg-indigo-500',
    neutral: 'bg-slate-400'
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
    status,
    variant = 'neutral',
    className = ''
}) => {
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${variantStyles[variant]} ${className}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${dotStyles[variant]} animate-pulse`}></span>
            {status}
        </span>
    );
};
