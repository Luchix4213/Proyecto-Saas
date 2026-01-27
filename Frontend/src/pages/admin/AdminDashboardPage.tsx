import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Users, Building2, CreditCard, TrendingUp, PieChart, ArrowUpRight, DollarSign, LayoutDashboard, Activity } from 'lucide-react';
import { AestheticHeader } from '../../components/common/AestheticHeader';
import { StatCard } from '../../components/common/StatCard';

interface DashboardStats {
    tenants: {
        total: number;
        active: number;
        inactive: number;
    };
    users: {
        total: number;
        active: number;
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
                const { data } = await api.get('/reportes/admin/stats');
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
        <div className="flex h-96 items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="h-16 w-16 animate-spin rounded-full border-8 border-slate-200 border-t-teal-500"></div>
                    <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-teal-500 animate-pulse" />
                </div>
                <p className="text-sm font-bold text-slate-600 animate-pulse">Cargando análisis del ecosistema...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="p-8 bg-gradient-to-br from-red-50 to-rose-50 text-red-700 rounded-3xl border-2 border-red-200 flex flex-col items-center justify-center gap-4 shadow-xl">
            <div className="p-4 bg-red-100 rounded-full">
                <TrendingUp className="h-8 w-8 text-red-600" />
            </div>
            <p className="text-lg font-bold">{error}</p>
        </div>
    );

    if (!stats) return null;

    const totalPlans = stats.plans.reduce((sum, p) => sum + p.count, 0);

    return (
        <div className="space-y-8 animate-fade-in-up">
            <AestheticHeader
                title="Dashboard Administrativo"
                description="Vista ejecutiva del ecosistema Kipu SaaS - Métricas clave y análisis en tiempo real"
                icon={LayoutDashboard}
                iconColor="from-indigo-600 to-purple-600"
                action={
                    <div className="hidden lg:flex items-center gap-3 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sistema Activo</p>
                            <p className="text-sm font-bold text-slate-700">
                                {new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                }
            />

            {/* Premium KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Microempresas"
                    value={stats.tenants.total.toString()}
                    subtitle={`${stats.tenants.active} activas`}
                    icon={Building2}
                    trend={{ value: stats.tenants.active, isPositive: true }}
                    gradientFrom="from-indigo-500"
                    gradientTo="to-purple-600"
                />

                <StatCard
                    title="Ingresos (MRR)"
                    value={stats.financials.estimatedMonthlyRevenue.toLocaleString('es-BO', {
                        style: 'currency',
                        currency: 'BOB',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                    })}
                    subtitle="Ingreso mensual recurrente"
                    icon={DollarSign}
                    gradientFrom="from-emerald-500"
                    gradientTo="to-teal-600"
                />

                <StatCard
                    title="Usuarios Registrados"
                    value={stats.users.total.toString()}
                    subtitle="Propietarios y vendedores"
                    icon={Users}
                    gradientFrom="from-blue-500"
                    gradientTo="to-cyan-600"
                />

                <StatCard
                    title="Plan Más Usado"
                    value={stats.plans.sort((a, b) => b.count - a.count)[0]?.name || 'N/A'}
                    subtitle={`${stats.plans.sort((a, b) => b.count - a.count)[0]?.count || 0} suscripciones`}
                    icon={CreditCard}
                    gradientFrom="from-pink-500"
                    gradientTo="to-rose-600"
                />
            </div>

            {/* Charts & Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Plans Distribution Chart */}
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-8 border border-slate-100 lg:col-span-2 hover:shadow-2xl transition-shadow duration-300">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl shadow-lg">
                                <PieChart className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-800">Distribución de Planes</h3>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">Análisis de suscripciones activas</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Total</p>
                            <p className="text-2xl font-black text-slate-800">{totalPlans}</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {stats.plans
                            .sort((a, b) => b.count - a.count)
                            .map((plan, index) => {
                                const percentage = totalPlans > 0 ? (plan.count / totalPlans) * 100 : 0;
                                const gradients = [
                                    'from-teal-500 to-emerald-500',
                                    'from-indigo-500 to-purple-500',
                                    'from-blue-500 to-cyan-500',
                                    'from-pink-500 to-rose-500'
                                ];
                                return (
                                    <div key={plan.name} className="group">
                                        <div className="flex justify-between items-center mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-slate-200 transition-colors">
                                                    <span className="text-sm font-black text-slate-600">#{index + 1}</span>
                                                </div>
                                                <span className="font-bold text-slate-700 group-hover:text-slate-900 transition-colors">{plan.name}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm font-medium text-slate-500">{Math.round(percentage)}%</span>
                                                <span className="text-2xl font-black text-slate-800">{plan.count}</span>
                                            </div>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden shadow-inner">
                                            <div
                                                className={`bg-gradient-to-r ${gradients[index % gradients.length]} h-4 rounded-full shadow-lg transition-all duration-1000 ease-out group-hover:shadow-xl`}
                                                style={{
                                                    width: `${percentage}%`,
                                                    transitionDelay: `${index * 100}ms`
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>

                {/* Quick Insights */}
                <div className="space-y-6">
                    {/* Active Tenants Card */}
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl shadow-xl p-8 text-white relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-all"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl"></div>

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                                    <Building2 className="h-6 w-6" />
                                </div>
                                <ArrowUpRight className="h-5 w-5 opacity-50" />
                            </div>
                            <p className="text-sm font-bold uppercase tracking-wider opacity-90">Tenants Activos</p>
                            <p className="text-4xl font-black mt-2">{stats.tenants.active}</p>
                            <p className="text-sm opacity-75 mt-2">
                                {((stats.tenants.active / stats.tenants.total) * 100).toFixed(1)}% del total
                            </p>
                        </div>
                    </div>

                    {/* System Health */}
                    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-8 border border-slate-100 hover:shadow-2xl transition-shadow duration-300">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-lg">
                                <Activity className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h4 className="text-lg font-black text-slate-800">Estado del Sistema</h4>
                                <p className="text-xs text-slate-500 font-medium">Rendimiento óptimo</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-600">Disponibilidad</span>
                                <span className="text-sm font-black text-emerald-600">99.9%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-600">Tenants Inactivos</span>
                                <span className="text-sm font-black text-slate-800">{stats.tenants.inactive}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-600">Planes activos</span>
                                <span className="text-sm font-black text-slate-800">{stats.plans.length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
