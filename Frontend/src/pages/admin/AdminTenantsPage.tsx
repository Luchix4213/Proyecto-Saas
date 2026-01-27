import { useEffect, useState } from 'react';
import { tenantsService } from '../../services/tenantsService';
import type { Tenant } from '../../services/tenantsService';
import { Plus, X, RefreshCw, Building2, Search, Filter, Store, CheckCircle2, Clock, Ban } from 'lucide-react';
import { Link } from 'react-router-dom';
import TenantForm from '../../components/tenants/TenantForm';
import type { CreateTenantData } from '../../services/tenantsService';
import { useToast } from '../../context/ToastContext';

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
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                        <Building2 className="text-teal-600" />
                        Gestión de Microempresas
                    </h1>
                    <p className="text-slate-500 mt-1">Administración de tenants registrados en la plataforma SaaS.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => fetchTenants()}
                        className="p-2.5 text-slate-400 hover:text-teal-600 bg-white border border-slate-200 hover:border-teal-200 rounded-xl transition-all shadow-sm"
                        title="Refrescar lista"
                    >
                        <RefreshCw size={20} />
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white hover:from-teal-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all hover:-translate-y-0.5 hover:shadow-teal-500/30"
                    >
                        <Plus size={18} strokeWidth={2.5} />
                        Nueva Empresa
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {/* Total Companies */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Store size={80} className="text-indigo-600" />
                    </div>
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Empresas</p>
                            <p className="text-3xl font-bold text-slate-800 mt-2">{stats.total}</p>
                        </div>
                        <div className="p-3 rounded-xl shadow-lg bg-gradient-to-br from-indigo-500 to-blue-500 text-white">
                            <Store size={24} />
                        </div>
                    </div>
                </div>

                {/* Active Companies */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CheckCircle2 size={80} className="text-emerald-600" />
                    </div>
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Activas</p>
                            <p className="text-3xl font-bold text-slate-800 mt-2">{stats.active}</p>
                        </div>
                        <div className="p-3 rounded-xl shadow-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                            <CheckCircle2 size={24} />
                        </div>
                    </div>
                </div>

                {/* Pending Companies */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Clock size={80} className="text-amber-600" />
                    </div>
                    <div className="flex justify-between items-start relative z-10">
                         <div>
                            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Pendientes</p>
                            <p className="text-3xl font-bold text-slate-800 mt-2">{stats.pending}</p>
                        </div>
                        <div className="p-3 rounded-xl shadow-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white">
                            <Clock size={24} />
                        </div>
                    </div>
                </div>
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
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${tenant.estado === 'ACTIVA' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                    tenant.estado === 'PENDIENTE' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                        'bg-red-50 text-red-700 border-red-100'
                                                }`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${tenant.estado === 'ACTIVA' ? 'bg-emerald-500' :
                                                        tenant.estado === 'PENDIENTE' ? 'bg-amber-500' :
                                                            'bg-red-500'
                                                    }`}></span>
                                                {tenant.estado}
                                            </span>
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
