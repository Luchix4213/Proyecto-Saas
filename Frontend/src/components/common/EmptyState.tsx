import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, action }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 px-6 text-center"
        >
            <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 shadow-sm border border-slate-100 group">
                <Icon size={48} className="text-slate-300 group-hover:scale-110 group-hover:text-slate-400 transition-all duration-500" />
            </div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">{title}</h3>
            <p className="text-slate-500 mt-2 max-w-xs mx-auto font-medium">
                {description}
            </p>
            {action && (
                <div className="mt-8">
                    {action}
                </div>
            )}
        </motion.div>
    );
};
