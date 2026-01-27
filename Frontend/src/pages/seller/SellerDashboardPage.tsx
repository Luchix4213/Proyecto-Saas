import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    DollarSign, ShoppingCart, Users,
    ArrowUpRight, Target, Clock,
    Award, BarChart3, ShoppingBag
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AestheticHeader } from '../../components/common/AestheticHeader';
import api from '../../api/axios';

interface SellerStats {
    today: {
        sales: number;
        amount: number;
    };
    week: {
        sales: Array<{ day: string; amount: number }>;
        total: number;
    };
    topProducts: Array<{
        producto_id: number;
        nombre: string;
        cantidad: number;
        total: number;
    }>;
    recentSales: Array<{
        venta_id: number;
        fecha: string;
        cliente_nombre: string;
        total: number;
        tipo_comprobante: string;
    }>;
}

export const SellerDashboardPage = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<SellerStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'custom'>('week');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Build query params based on filter
                const params = new URLSearchParams();

                if (dateFilter === 'custom' && startDate && endDate) {
                    params.append('startDate', startDate);
                    params.append('endDate', endDate);
                } else {
                    params.append('filter', dateFilter);
                }

                // Fetch seller-specific stats
                const { data } = await api.get(`/reportes/vendedor?${params.toString()}`);
                setStats(data);
            } catch (error) {
                console.error("Error fetching seller stats:", error);
                // Set default empty stats if error
                setStats({
                    today: { sales: 0, amount: 0 },
                    week: { sales: [], total: 0 },
                    topProducts: [],
                    recentSales: []
                });
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [dateFilter, startDate, endDate]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 font-bold animate-pulse">Cargando tus estadísticas...</p>
        </div>
    );

    const StatCard = ({ title, value, icon: Icon, gradientClass, subtext, delay }: any) => (
        <div
            className="group relative bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 overflow-hidden animate-fade-in-up"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className={`absolute -right-6 -top-6 w-32 h-32 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700 bg-current rounded-full`}></div>

            <div className="relative flex items-start justify-between mb-4">
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${gradientClass} shadow-lg`}>
                    <Icon size={24} className="text-white" strokeWidth={2.5} />
                </div>
            </div>

            <div className="relative">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{title}</h3>
                <p className="text-4xl font-black text-slate-800 mb-1">{value}</p>
                {subtext && (
                    <p className="text-xs font-bold text-slate-400 flex items-center gap-1">
                        {subtext}
                    </p>
                )}
            </div>
        </div>
    );

    const QuickAction = ({ to, icon: Icon, label, color }: any) => (
        <Link
            to={to}
            className={`flex items-center gap-4 p-6 rounded-2xl bg-gradient-to-br ${color} shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group`}
        >
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Icon size={24} className="text-white" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
                <p className="text-white font-black text-sm uppercase tracking-wider">{label}</p>
            </div>
            <ArrowUpRight size={20} className="text-white/70 group-hover:text-white transition-colors" />
        </Link>
    );

    return (
        <div className="space-y-8 animate-fade-in-up">
            <AestheticHeader
                title={`¡Hola, ${user?.nombre || 'Vendedor'}!`}
                description="Panel de control de ventas y métricas personalizadas"
                icon={Target}
                iconColor="from-teal-500 to-emerald-600"
            />

            {/* Date Filter */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Periodo:</span>
                    <div className="flex gap-2">
                        {(['today', 'week', 'month', 'custom'] as const).map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setDateFilter(filter)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                                    dateFilter === filter
                                        ? 'bg-teal-600 text-white shadow-lg'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                {filter === 'today' ? 'Hoy' : filter === 'week' ? 'Semana' : filter === 'month' ? 'Mes' : 'Personalizado'}
                            </button>
                        ))}
                    </div>
                </div>

                {dateFilter === 'custom' && (
                    <div className="flex items-center gap-3">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        <span className="text-slate-400 font-bold">→</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                    </div>
                )}
            </div>

            {/* Today's Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard
                    title="Ventas de Hoy"
                    value={stats?.today.sales || 0}
                    icon={ShoppingCart}
                    gradientClass="from-emerald-500 to-teal-600"
                    subtext="Transacciones realizadas"
                    delay={0}
                />
                <StatCard
                    title="Ingresos de Hoy"
                    value={`Bs. ${(stats?.today.amount || 0).toFixed(2)}`}
                    icon={DollarSign}
                    gradientClass="from-blue-500 to-indigo-600"
                    subtext="Monto total generado"
                    delay={100}
                />
            </div>

            {/* Weekly Summary */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Resumen Semanal</h3>
                        <p className="text-2xl font-black text-slate-800 mt-1">Bs. {(stats?.week.total || 0).toFixed(2)}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl">
                        <BarChart3 size={24} className="text-white" strokeWidth={2.5} />
                    </div>
                </div>

                {/* Simple bar chart */}
                <div className="flex items-end justify-between gap-2 h-32">
                    {stats?.week.sales.map((day, idx) => {
                        const maxAmount = Math.max(...(stats?.week.sales.map(d => d.amount) || [1]));
                        const height = maxAmount > 0 ? (day.amount / maxAmount) * 100 : 0;
                        return (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                                <div className="w-full bg-gradient-to-t from-teal-500 to-emerald-400 rounded-lg transition-all hover:from-teal-600 hover:to-emerald-500"
                                    style={{ height: `${height}%`, minHeight: '4px' }}
                                    title={`${day.day}: Bs. ${day.amount.toFixed(2)}`}
                                ></div>
                                <span className="text-[10px] font-black text-slate-400 uppercase">{day.day.substring(0, 3)}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <QuickAction to="/pos" icon={ShoppingBag} label="Nueva Venta" color="from-teal-500 to-emerald-600" />
                <QuickAction to="/clientes" icon={Users} label="Clientes" color="from-blue-500 to-indigo-600" />
                <QuickAction to="/ventas/historial" icon={Clock} label="Historial" color="from-purple-500 to-pink-600" />
            </div>

            {/* Two columns: Top Products & Recent Sales */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Products */}
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-6">
                        <Award size={20} className="text-amber-500" strokeWidth={2.5} />
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Top Productos</h3>
                    </div>
                    <div className="space-y-4">
                        {stats?.topProducts.length === 0 ? (
                            <p className="text-slate-400 text-sm text-center py-8">No hay datos de productos aún</p>
                        ) : (
                            stats?.topProducts.slice(0, 5).map((product, idx) => (
                                <div key={product.producto_id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-black text-xs">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm">{product.nombre}</p>
                                            <p className="text-xs text-slate-400">Vendidos: {product.cantidad}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm font-black text-slate-600">Bs. {product.total.toFixed(2)}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Sales */}
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-6">
                        <Clock size={20} className="text-teal-500" strokeWidth={2.5} />
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Últimas Ventas</h3>
                    </div>
                    <div className="space-y-3">
                        {stats?.recentSales.length === 0 ? (
                            <p className="text-slate-400 text-sm text-center py-8">No hay ventas registradas aún</p>
                        ) : (
                            stats?.recentSales.slice(0, 10).map((sale) => (
                                <div key={sale.venta_id} className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100">
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">{sale.cliente_nombre}</p>
                                        <p className="text-xs text-slate-400">
                                            {new Date(sale.fecha).toLocaleDateString()} • {sale.tipo_comprobante}
                                        </p>
                                    </div>
                                    <p className="text-sm font-black text-teal-600">Bs. {sale.total.toFixed(2)}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
