import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    DollarSign, ShoppingBag, Users,
    Package, TrendingUp, Calendar,
    ArrowUpRight, Building2, CreditCard,
    LayoutDashboard, Plus, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AestheticHeader } from '../../components/common/AestheticHeader';
import api from '../../api/axios';

interface DashboardStats {
    sales: {
        total: number;
        growth: number;
        history: number[];
    };
    orders: {
        total: number;
        pending: number;
    };
    customers: {
        total: number;
        new: number;
    };
    products: {
        total: number;
        topSelling: string;
    };
    recentOrders: {
        id: string;
        customer: string;
        items: number;
        total: number;
        status: string;
        date: string;
    }[];
}

export const OwnerDashboardPage = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/reportes/dashboard');
                setStats(data);
            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 font-bold animate-pulse">Preparando tu tablero...</p>
        </div>
    );

    if (!stats) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <LayoutDashboard size={64} className="text-slate-200" />
            <p className="text-slate-500 font-bold">No pudimos cargar tus estadísticas.</p>
        </div>
    );

    const StatCard = ({ title, value, icon: Icon, gradientClass, subtext, delay }: any) => (
        <div
            className="group relative bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 overflow-hidden"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className={`absolute -right-6 -top-6 w-32 h-32 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700 bg-current rounded-full`}></div>

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-start justify-between mb-6">
                    <div className={`p-4 rounded-2xl shadow-xl ${gradientClass} text-white transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                        <Icon size={24} />
                    </div>
                    {subtext && (
                        <div className="group-hover:translate-x-1 transition-transform">
                            {subtext}
                        </div>
                    )}
                </div>

                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{title}</h3>
                <p className="text-3xl font-black text-slate-800 tracking-tight">{value}</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-fade-in-up p-4 md:p-6 lg:p-8">
            {/* Header */}
            <AestheticHeader
                title={`Hola, ${user?.nombre || 'Propietario'} 👋`}
                description="Aquí tienes lo que está sucediendo en tu negocio hoy."
                icon={LayoutDashboard}
                iconColor="from-indigo-500 to-purple-600"
                action={
                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white border border-slate-100 rounded-2xl shadow-sm text-xs font-bold text-slate-600">
                            <Calendar size={14} className="text-indigo-500" />
                            {new Date().toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </div>
                        <Link
                            to="/app/productos"
                            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95"
                        >
                            <Plus size={18} />
                            Nuevo Producto
                        </Link>
                    </div>
                }
            />

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Ventas del Mes"
                    value={`Bs ${stats.sales.total.toLocaleString()}`}
                    icon={DollarSign}
                    gradientClass="bg-gradient-to-br from-emerald-500 to-teal-600"
                    delay={100}
                    subtext={
                        <span className="flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-600 font-black px-2 py-1 rounded-lg">
                            <ArrowUpRight size={12} />
                            +{stats.sales.growth}%
                        </span>
                    }
                />
                <StatCard
                    title="Pedidos Pendientes"
                    value={stats.orders.pending}
                    icon={ShoppingBag}
                    gradientClass="bg-gradient-to-br from-orange-400 to-pink-500"
                    delay={200}
                    subtext={
                        <span className="text-[10px] font-black text-orange-500 bg-orange-50 px-2 py-1 rounded-lg">
                            Prioritario
                        </span>
                    }
                />
                <StatCard
                    title="Clientes Nuevos"
                    value={stats.customers.new}
                    icon={Users}
                    gradientClass="bg-gradient-to-br from-indigo-500 to-blue-600"
                    delay={300}
                    subtext={
                        <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2 py-1 rounded-lg">
                            + {stats.customers.total} Total
                        </span>
                    }
                />
                <StatCard
                    title="Top Producto"
                    value={stats.products.topSelling}
                    icon={Package}
                    gradientClass="bg-gradient-to-br from-purple-500 to-fuchsia-600"
                    delay={400}
                    subtext={
                        <span className="text-[10px] font-black text-purple-500 bg-purple-50 px-2 py-1 rounded-lg uppercase tracking-wider">
                            Trend
                        </span>
                    }
                />
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sales Chart Section */}
                <div className="lg:col-span-8 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                        <div>
                            <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                                <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                                    <TrendingUp size={20} />
                                </div>
                                Resumen de Ingresos
                            </h3>
                            <p className="text-slate-400 text-xs font-bold mt-1 ml-11">Comparativa de ingresos por periodo</p>
                        </div>
                        <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100">
                            {['Semana', 'Mes', 'Año'].map((tab) => (
                                <button
                                    key={tab}
                                    className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${
                                        tab === 'Mes'
                                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
                                        : 'text-slate-400 hover:text-slate-600'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Chart Visualization */}
                    <div className="h-64 flex items-end justify-between gap-3 px-2 group/chart">
                        {(() => {
                            const maxSale = Math.max(...stats.sales.history, 1);
                            return stats.sales.history.map((amount, index) => {
                                const heightPercentage = (amount / maxSale) * 100;
                                return (
                                    <div key={index} className="flex-1 flex flex-col items-center gap-4 h-full relative group">
                                        <div className="flex-1 w-full bg-slate-50 rounded-2xl overflow-hidden relative group/bar">
                                            <div
                                                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t-2xl transition-all duration-1000 ease-out group-hover:from-indigo-600 group-hover:to-indigo-500 cursor-pointer"
                                                style={{ height: `${heightPercentage}%` }}
                                            >
                                                <div className="opacity-0 group-hover:opacity-100 absolute -top-12 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black py-2 px-3 rounded-xl pointer-events-none transition-all shadow-xl whitespace-nowrap z-20">
                                                    Bs {amount.toLocaleString()}
                                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase">{['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'][index]}</span>
                                    </div>
                                );
                            });
                        })()}
                    </div>
                </div>

                {/* Right Column: Quick Links & Recent Actions */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Quick Access Card */}
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-[64px] -mr-16 -mt-16 group-hover:bg-indigo-500/30 transition-colors duration-700"></div>
                        <h3 className="text-lg font-black mb-6 relative z-10">Herramientas</h3>
                        <div className="grid grid-cols-2 gap-4 relative z-10">
                            {[
                                { to: '/app/empresa', icon: Building2, label: 'Negocio', color: 'text-teal-400' },
                                { to: '/app/productos', icon: Package, label: 'Productos', color: 'text-indigo-400' },
                                { to: '/app/clientes', icon: Users, label: 'Clientes', color: 'text-blue-400' },
                                { to: '/app/suscripciones', icon: CreditCard, label: 'Plan', color: 'text-fuchsia-400' }
                            ].map((item, i) => (
                                <Link
                                    key={i}
                                    to={item.to}
                                    className="flex flex-col items-center bg-white/5 hover:bg-white/10 p-5 rounded-2xl transition-all border border-white/5 active:scale-95 group/btn"
                                >
                                    <item.icon size={22} className={`${item.color} mb-3 group-hover/btn:scale-110 transition-transform`} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Recent Orders Card */}
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Últimos Pedidos</h3>
                            <Link to="/app/ventas/online" className="p-2 bg-slate-50 text-slate-400 hover:text-teal-600 rounded-xl transition-all">
                                <ChevronRight size={18} />
                            </Link>
                        </div>

                        <div className="space-y-6">
                            {stats.recentOrders.map(order => (
                                <div key={order.id} className="flex items-center justify-between group cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 font-black text-xs group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all border border-slate-100">
                                            {order.customer.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-700">{order.customer}</p>
                                            <p className="text-[10px] font-bold text-slate-400 mt-0.5">{order.date}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-slate-800">Bs {order.total}</p>
                                        <div className={`mt-1 inline-block px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                                            order.status === 'Completado' || order.status === 'ENTREGADO' ? 'bg-emerald-50 text-emerald-600' :
                                            order.status === 'Pendiente' || order.status === 'PENDIENTE' ? 'bg-amber-50 text-amber-600' :
                                            'bg-blue-50 text-blue-600'
                                        }`}>
                                            {order.status}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {stats.recentOrders.length === 0 && (
                                <div className="text-center py-8">
                                    <ShoppingBag size={48} className="mx-auto text-slate-100 mb-4" />
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Sin pedidos hoy</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};



