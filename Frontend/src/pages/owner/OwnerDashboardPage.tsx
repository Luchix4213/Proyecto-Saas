import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DollarSign, ShoppingBag, Users, Package, TrendingUp, Calendar, ArrowUpRight, Building2, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
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

    if (loading) return <div className="p-8 text-center text-slate-500">Cargando estadísticas...</div>;
    if (!stats) return <div className="p-8 text-center text-slate-500">No hay datos disponibles</div>;



    const StatCard = ({ title, value, icon: Icon, colorClass, gradientClass, subtext }: any) => (
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
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                        Hola, {user?.nombre || 'Propietario'} 👋
                    </h1>
                    <p className="text-slate-500">Aquí tienes lo que está sucediendo en tu negocio hoy.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2">
                        <Calendar size={14} />
                        {new Date().toLocaleDateString('es-BO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                    <Link to="/productos" className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors shadow-lg shadow-teal-600/20">
                        + Nuevo Producto
                    </Link>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Ventas del Mes"
                    value={`Bs ${stats.sales.total.toLocaleString()}`}
                    icon={DollarSign}
                    colorClass="text-emerald-600"
                    gradientClass="bg-gradient-to-br from-emerald-500 to-teal-500"
                    subtext={
                        <span className="flex items-center gap-1 text-emerald-600 font-medium">
                            <ArrowUpRight size={16} />
                            {stats.sales.growth}% vs mes anterior
                        </span>
                    }
                />
                <StatCard
                    title="Pedidos"
                    value={stats.orders.total}
                    icon={ShoppingBag}
                    colorClass="text-blue-600"
                    gradientClass="bg-gradient-to-br from-blue-500 to-indigo-500"
                    subtext={
                        <span className="text-orange-500 font-medium">
                            {stats.orders.pending} por procesar
                        </span>
                    }
                />
                <StatCard
                    title="Clientes Nuevos"
                    value={stats.customers.new}
                    icon={Users}
                    colorClass="text-violet-600"
                    gradientClass="bg-gradient-to-br from-violet-500 to-purple-500"
                    subtext={
                        <span className="text-slate-400">
                            {stats.customers.total} total acumulado
                        </span>
                    }
                />
                <StatCard
                    title="Producto Top"
                    value={stats.products.topSelling}
                    icon={Package}
                    colorClass="text-amber-600"
                    gradientClass="bg-gradient-to-br from-amber-500 to-orange-500"
                    subtext={
                        <span className="text-slate-400">
                            Mas vendido esta semana
                        </span>
                    }
                />
            </div>

            {/* Main Content Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sales Chart (Visual Placeholder) */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <TrendingUp className="text-teal-600" size={20} />
                            Resumen de Ingresos
                        </h3>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 text-xs font-semibold bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 transition-colors">Semana</button>
                            <button className="px-3 py-1 text-xs font-semibold bg-teal-600 text-white rounded-md shadow-md shadow-teal-600/20">Mes</button>
                            <button className="px-3 py-1 text-xs font-semibold bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 transition-colors">Año</button>
                        </div>
                    </div>

                    {/* Fake Chart Bars using CSS */}
                    <div className="h-64 flex items-end justify-between gap-2 px-2">
                        {stats.sales.history.map((height, index) => (
                            <div key={index} className="w-full bg-slate-100 rounded-t-lg relative group">
                                <div
                                    className="absolute bottom-0 w-full bg-gradient-to-t from-teal-500 to-emerald-400 rounded-t-lg transition-all duration-500 hover:opacity-90 cursor-pointer"
                                    style={{ height: `${height}%` }}
                                >
                                    <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded pointer-events-none transition-opacity">
                                        Bs {(height * 150).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4 text-xs text-slate-400 font-medium px-2">
                        <span>Lun</span><span>Mar</span><span>Mie</span><span>Jue</span><span>Vie</span><span>Sab</span><span>Dom</span>
                    </div>
                </div>

                {/* Recent Activity / Quick Actions */}
                <div className="space-y-6">
                    {/* Quick Access */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                        <h3 className="font-bold text-lg mb-4 relative z-10">Accesos Rápidos</h3>
                        <div className="grid grid-cols-2 gap-3 relative z-10">
                            <Link to="/mi-empresa" className="bg-white/10 hover:bg-white/20 p-3 rounded-xl transition-colors text-center border border-white/10">
                                <Building2 size={20} className="mx-auto mb-2 text-teal-300" />
                                <span className="text-xs font-medium">Mi Empresa</span>
                            </Link>
                            <Link to="/productos" className="bg-white/10 hover:bg-white/20 p-3 rounded-xl transition-colors text-center border border-white/10">
                                <Package size={20} className="mx-auto mb-2 text-indigo-300" />
                                <span className="text-xs font-medium">Productos</span>
                            </Link>
                            <Link to="/clientes" className="bg-white/10 hover:bg-white/20 p-3 rounded-xl transition-colors text-center border border-white/10">
                                <Users size={20} className="mx-auto mb-2 text-blue-300" />
                                <span className="text-xs font-medium">Clientes</span>
                            </Link>
                            <Link to="/suscripcion" className="bg-white/10 hover:bg-white/20 p-3 rounded-xl transition-colors text-center border border-white/10">
                                <CreditCard size={20} className="mx-auto mb-2 text-fuchsia-300" />
                                <span className="text-xs font-medium">Suscripción</span>
                            </Link>
                        </div>
                    </div>

                    {/* Pending Orders Mini List */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center justify-between">
                            <span>Pedidos Recientes</span>
                            <Link to="/pedidos" className="text-xs text-teal-600 hover:underline">Ver todo</Link>
                        </h3>
                        <div className="space-y-4">
                            {stats.recentOrders.map(order => (
                                <div key={order.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                            {order.customer.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-700">{order.customer}</p>
                                            <p className="text-xs text-slate-400">{order.items} items • {order.date}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-slate-800">Bs {order.total}</p>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                            order.status === 'Completado' || order.status === 'ENTREGADO' ? 'bg-emerald-100 text-emerald-700' :
                                            order.status === 'Pendiente' || order.status === 'PENDIENTE' ? 'bg-amber-100 text-amber-700' :
                                            'bg-blue-100 text-blue-700'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                             {stats.recentOrders.length === 0 && (
                                <p className="text-center text-slate-400 text-sm py-4">No hay pedidos recientes</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


