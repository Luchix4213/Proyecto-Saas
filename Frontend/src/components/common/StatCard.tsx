import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string;
    subtitle?: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    gradientFrom: string;
    gradientTo: string;
}

export const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    gradientFrom,
    gradientTo
}: StatCardProps) => {
    return (
        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/60 border border-slate-100 hover:shadow-2xl hover:border-slate-200 transition-all duration-300 relative overflow-hidden group">
            {/* Background Icon */}
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
                <Icon size={120} strokeWidth={1.5} />
            </div>

            {/* Content */}
            <div className="relative z-10">
                {/* Icon Badge */}
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${gradientFrom} ${gradientTo} shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-6 w-6 text-white" strokeWidth={2.5} />
                </div>

                {/* Title */}
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                    {title}
                </p>

                {/* Value */}
                <p className="text-4xl font-black text-slate-800 mb-2">
                    {value}
                </p>

                {/* Subtitle or Trend */}
                {trend ? (
                    <div className={`flex items-center gap-2 text-sm font-bold ${trend.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                        <div className={`h-2 w-2 rounded-full ${trend.isPositive ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`}></div>
                        <span>{subtitle}</span>
                    </div>
                ) : subtitle ? (
                    <p className="text-sm font-medium text-slate-500">
                        {subtitle}
                    </p>
                ) : null}
            </div>

            {/* Bottom Gradient Bar */}
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${gradientFrom} ${gradientTo} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}></div>
        </div>
    );
};
