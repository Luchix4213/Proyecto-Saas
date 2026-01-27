import { useEffect, useState } from 'react';
import { tenantsService } from '../../services/tenantsService';
import type { Tenant } from '../../services/tenantsService';
import { Plus, X, RefreshCw, Building2, Search, Filter, Store, CheckCircle2, Clock, Ban } from 'lucide-react';
import { Link } from 'react-router-dom';
import TenantForm from '../../components/tenants/TenantForm';
import type { CreateTenantData } from '../../services/tenantsService';
import { useToast } from '../../context/ToastContext';
import { AestheticHeader } from '../../components/common/AestheticHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { StatCard } from '../../components/common/StatCard';

export const AdminTenantsPage = () => {
    const { addToast } = useToast();
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [searchRubro, setSearchRubro] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchTenants(searchRubro);
        }, 300); // debounce
        return () => clearTimeout(timer);
    }, [searchRubro]);

    const fetchTenants = async (rubro?: string) => {
        try {
            setLoading(true);
            const data = await tenantsService.getAll(rubro);
            setTenants(data);
        } catch (err) {
            setError('Error al cargar las empresas');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (data: any) => {
        try {
            setIsCreating(true);
            const { logo, ...createData } = data;
            await tenantsService.create(createData as CreateTenantData, logo);
            setIsModalOpen(false);
            fetchTenants();
            addToast('Empresa registrada correctamente', 'success');
        } catch (err: any) {
            console.error(err);
            const message = err.response?.data?.message || 'Error al crear la empresa';
            addToast(message, 'error');
        } finally {
            setIsCreating(false);
        }
    };

    const filteredTenants = tenants.filter(tenant => {
        if (filterStatus === 'ALL') return true;
        return tenant.estado === filterStatus;
    });

    const stats = {
        total: tenants.length,
        active: tenants.filter(t => t.estado === 'ACTIVA').length,
        pending: tenants.filter(t => t.estado === 'PENDIENTE').length
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            <AestheticHeader
                title="Gestión de Microempresas"
                description="Administración y monitoreo de todos los tenants registrados en la plataforma."
                icon={Building2}
                iconColor="from-teal-600 to-emerald-600"
                action={
                    <div className="flex gap-2">
                        <button
                            onClick={() => fetchTenants()}
                            className="p-3 text-slate-400 hover:text-teal-600 bg-white border border-slate-200 hover:border-teal-200 rounded-2xl transition-all shadow-sm group"
                            title="Refrescar lista"
                        >
                            <RefreshCw size={20} className="group-active:rotate-180 transition-transform duration-500" />
                        </button>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-transparent rounded-[1.25rem] shadow-xl text-sm font-black text-white hover:bg-slate-800 transition-all hover:-translate-y-0.5"
                        >
                            <Plus size={18} strokeWidth={3} />
                            NUEVA EMPRESA
                        </button>
                    </div>
                }
            />

            {/* Premium Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Empresas"
                    value={stats.total.toString()}
                    subtitle="Registradas en la plataforma"
                    icon={Store}
                    gradientFrom="from-indigo-500"
                    gradientTo="to-purple-600"
                />

                <StatCard
                    title="Empresas Activas"
                    value={stats.active.toString()}
                    subtitle={`${((stats.active / stats.total) * 100 || 0).toFixed(1)}% del total`}
                    icon={CheckCircle2}
                    trend={{ value: stats.active, isPositive: true }}
                    gradientFrom="from-emerald-500"
                    gradientTo="to-teal-600"
                />

                <StatCard
                    title="Pendientes"
                    value={stats.pending.toString()}
                    subtitle="Esperando activación"
                    icon={Clock}
                    gradientFrom="from-amber-500"
                    gradientTo="to-orange-600"
                />
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center gap-3">
                    <Ban size={20} />
                    <span className="font-medium">{error}</span>
                </div>
            )}

            {/* Content Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Toolbar */}
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
                    <div className="relative w-full sm:w-72 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por rubro (ej: juguetes)..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                            value={searchRubro}
                            onChange={(e) => setSearchRubro(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl w-full sm:w-auto">
                            <Filter size={16} className="text-slate-400" />
                            <select
                                className="bg-transparent border-none text-sm text-slate-600 font-medium focus:outline-none w-full"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="ALL">Todos los Estados</option>
                                <option value="ACTIVA">Activas</option>
                                <option value="INACTIVA">Inactivas</option>
                                <option value="PENDIENTE">Pendientes</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Empresa</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contacto</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Rubro</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Plan</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent"></div>
                                            <span className="text-sm font-medium text-slate-500">Cargando empresas...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredTenants.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        No se encontraron empresas que coincidan con los criterios.
                                    </td>
                                </tr>
                            ) : (
                                filteredTenants.map((tenant) => (
                                    <tr key={tenant.tenant_id} className="group hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 border border-teal-100">
                                                    <Store size={20} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-800">{tenant.nombre_empresa}</div>
                                                    <div className="text-xs text-slate-400 font-mono">ID: {tenant.tenant_id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-600 font-medium">{tenant.email}</div>
                                            <div className="text-xs text-slate-400">Reg: {new Date(tenant.fecha_registro).toLocaleDateString()}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 capitalize">
                                                {tenant.rubros?.map((r: any) => r.nombre).join(', ') || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                {tenant.plan?.nombre_plan || 'Sin Plan'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge
                                                status={tenant.estado}
                                                variant={
                                                    tenant.estado === 'ACTIVA' ? 'success' :
                                                    tenant.estado === 'PENDIENTE' ? 'warning' : 'error'
                                                }
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                to={`/admin/tenants/${tenant.tenant_id}`}
                                                className="inline-flex items-center gap-1 text-sm font-semibold text-teal-600 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors"
                                            >
                                                Ver Detalles
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col animate-scale-in border border-slate-100">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <Building2 className="text-teal-600" />
                                Registrar Nueva Microempresa
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <TenantForm
                                isCreateMode={true}
                                onSubmit={handleCreate}
                                onCancel={() => setIsModalOpen(false)}
                                isLoading={isCreating}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
