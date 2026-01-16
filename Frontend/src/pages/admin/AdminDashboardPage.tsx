import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Users, Building2, CreditCard, TrendingUp, Activity, PieChart, ArrowUpRight, DollarSign } from 'lucide-react';

interface DashboardStats {
    tenants: {
        total: number;
        active: number;
        inactive: number;
    };
    users: {
        total: number;
        active: number; // Assuming API provides this or we just show total
    };
    financials: {
        estimatedMonthlyRevenue: number;
        currency: string;
    };
    plans: {
        name: string;
        count: number;
    }[];
}

export const AdminDashboardPage = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/admin/stats');
                setStats(data);
            } catch (err) {
                console.error(err);
                setError('Error al cargar estadísticas.');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return (
        <div className="flex h-64 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
                <p className="text-sm font-medium text-slate-500">Cargando métricas...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="p-6 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center justify-center">
            {error}
        </div>
    );

    if (!stats) return null;

    const StatCard = ({ title, value, subtext, icon: Icon, colorClass, gradientClass }: any) => (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
                <Icon size={80} className={colorClass} />
            </div>

            <div className="flex justify-between items-start relative z-10">
                <div>
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
                    <p className="text-3xl font-bold text-slate-800 mt-2">{value}</p>
                </div>
                <div className={`p-3 rounded-xl shadow-lg ${gradientClass} text-white`}>
                    <Icon size={24} />
                </div>
            </div>
            {subtext && (
                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center text-sm relative z-10">
                    {subtext}
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard General</h1>
                    <p className="text-slate-500">Vista general del sistema Kipu</p>
                </div>
                <div className="hidden sm:block text-sm text-slate-400">
                    Última actualización: {new Date().toLocaleTimeString()}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Microempresas */}
                <StatCard
                    title="Microempresas"
                    value={stats.tenants.total}
                    icon={Building2}
                    colorClass="text-indigo-600"
                    gradientClass="bg-gradient-to-br from-indigo-500 to-violet-500"
                    subtext={
                        <span className="flex items-center gap-2 text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-md">
                            <ArrowUpRight size={14} />
                            {stats.tenants.active} Activas
                        </span>
                    }
                />

                {/* Ingresos Estimados */}
                <StatCard
                    title="Ingresos (Est.)"
                    value={stats.financials.estimatedMonthlyRevenue.toLocaleString('es-BO', { style: 'currency', currency: 'BOB' })}
                    icon={DollarSign}
                    colorClass="text-emerald-600"
                    gradientClass="bg-gradient-to-br from-emerald-500 to-teal-500"
                    subtext={
                        <span className="text-slate-400">Mensual recurrente</span>
                    }
                />

                {/* Usuarios Totales */}
                <StatCard
                    title="Usuarios"
                    value={stats.users.total}
                    icon={Users}
                    colorClass="text-blue-600"
                    gradientClass="bg-gradient-to-br from-blue-500 to-cyan-500"
                    subtext={
                        <span className="text-slate-400">Admins y Vendedores</span>
                    }
                />

                {/* Planes */}
                <StatCard
                    title="Plan Popular"
                    value={stats.plans.sort((a: any, b: any) => b.count - a.count)[0]?.name || 'N/A'}
                    icon={CreditCard}
                    colorClass="text-purple-600"
                    gradientClass="bg-gradient-to-br from-purple-500 to-fuchsia-500"
                    subtext={
                        <span className="text-slate-400">
                            {stats.plans.sort((a: any, b: any) => b.count - a.count)[0]?.count || 0} suscripciones
                        </span>
                    }
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 lg:col-span-2">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <PieChart className="h-5 w-5 text-teal-600" />
                        Distribución de Planes Activos
                    </h3>
                    <div className="space-y-6">
                        {stats.plans.map((plan) => {
                            const percentage = stats.tenants.total > 0 ? (plan.count / stats.tenants.total) * 100 : 0;
                            return (
                                <div key={plan.name} className="relative">
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="font-semibold text-slate-700">{plan.name}</span>
                                        <div className="text-right">
                                            <span className="text-lg font-bold text-slate-800">{plan.count}</span>
                                            <span className="text-sm text-slate-400 ml-1">({Math.round(percentage)}%)</span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                                        <div
                                            className="bg-gradient-to-r from-teal-500 to-emerald-500 h-3 rounded-full shadow-lg shadow-teal-500/20 transition-all duration-1000 ease-out"
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-100 flex flex-col justify-center items-center text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-50 rounded-full -ml-16 -mb-16 blur-2xl"></div>

                    <div className="bg-slate-50 p-6 rounded-full mb-6 relative z-10 shadow-inner">
                        <TrendingUp className="h-10 w-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 relative z-10">Próximamente</h3>
                    <p className="text-slate-500 mt-2 max-w-xs relative z-10">
                        Estamos preparando gráficas avanzadas de retención y evolución financiera.
                    </p>
                    <button className="mt-6 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors relative z-10">
                        Notificarme
                    </button>
                </div>
            </div>
        </div>
    );
};
