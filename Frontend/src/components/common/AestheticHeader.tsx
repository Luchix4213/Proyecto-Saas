import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface AestheticHeaderProps {
    title: string;
    description: string;
    icon: LucideIcon;
    iconColor?: string; // e.g., "from-teal-500 to-emerald-600"
    action?: React.ReactNode;
}

export const AestheticHeader: React.FC<AestheticHeaderProps> = ({
    title,
    description,
    icon: Icon,
    iconColor = "from-indigo-500 to-purple-600",
    action
}) => {
    return (
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center gap-4 lg:gap-6 text-center md:text-left">
                <div className={`mx-auto md:mx-0 p-3 lg:p-4 bg-gradient-to-br ${iconColor} rounded-[1.5rem] lg:rounded-[2rem] text-white shadow-xl shadow-indigo-500/20 transform hover:scale-105 transition-transform duration-500`}>
                    <Icon className="w-8 h-8 lg:w-9 lg:h-9" />
                </div>
                <div>
                    <h1 className="text-3xl lg:text-4xl font-black text-slate-800 tracking-tight">
                        {title}
                    </h1>
                    <p className="text-slate-500 mt-1 lg:mt-2 text-base lg:text-lg font-medium">
                        {description}
                    </p>
                </div>
            </div>
            {action && (
                <div className="w-full md:w-auto">
                    {action}
                </div>
            )}
        </div>
    );
};
