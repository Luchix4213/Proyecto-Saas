import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Users, Building2, CreditCard, TrendingUp, Activity, PieChart } from 'lucide-react';

interface DashboardStats {
    tenants: {
        total: number;
        active: number;
        inactive: number;
    };
    users: {
        total: number;
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

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando dashboard...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    if (!stats) return null;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrativo</h1>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Microempresas */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Microempresas</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.tenants.total}</p>
                        </div>
                        <div className="bg-indigo-50 p-3 rounded-lg">
                            <Building2 className="text-indigo-600 h-6 w-6" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                        <span className="text-green-600 font-medium flex items-center">
                            <Activity className="h-3 w-3 mr-1" />
                            {stats.tenants.active} Activas
                        </span>
                        <span className="mx-2 text-gray-300">|</span>
                        <span className="text-gray-500">{stats.tenants.inactive} Inactivas</span>
                    </div>
                </div>

                 {/* Ingresos Estimados */}
                 <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Ingresos Mensuales (Est.)</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                {stats.financials.estimatedMonthlyRevenue.toLocaleString('es-BO', { style: 'currency', currency: 'BOB' })}
                            </p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                            <TrendingUp className="text-green-600 h-6 w-6" />
                        </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-500">
                        Basado en planes activos
                    </div>
                </div>

                {/* Usuarios Totales */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Usuarios Totales</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.users.total}</p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <Users className="text-blue-600 h-6 w-6" />
                        </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-500">
                        Incluye admins y vendedores
                    </div>
                </div>

                 {/* Planes */}
                 <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Plan Más Popular</p>
                            <p className="text-lg font-bold text-gray-900 mt-2 truncate">
                                {stats.plans.sort((a,b) => b.count - a.count)[0]?.name || 'N/A'}
                            </p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                            <CreditCard className="text-purple-600 h-6 w-6" />
                        </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-500">
                         {stats.plans.sort((a,b) => b.count - a.count)[0]?.count || 0} suscripciones
                    </div>
                </div>
            </div>

            {/* Charts Section (Simple Visuals) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <PieChart className="h-5 w-5 text-gray-500" />
                        Distribución de Planes
                    </h3>
                    <div className="space-y-4">
                        {stats.plans.map((plan) => (
                            <div key={plan.name}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-medium text-gray-700">{plan.name}</span>
                                    <span className="text-sm text-gray-500">{plan.count} ({Math.round((plan.count / stats.tenants.total) * 100) || 0}%)</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className="bg-indigo-600 h-2.5 rounded-full"
                                        style={{ width: `${(plan.count / stats.tenants.total) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col justify-center items-center text-center">
                    <div className="bg-gray-100 p-4 rounded-full mb-4">
                        <TrendingUp className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Más reportes próximamente</h3>
                    <p className="text-gray-500 mt-2 max-w-xs">
                        Estamos trabajando en gráficas de evolución de ventas y retención de clientes.
                    </p>
                </div>
            </div>
        </div>
    );
};
