import { useEffect, useState } from 'react';
import { tenantsService } from '../../services/tenantsService';
import type { Tenant } from '../../services/tenantsService';
import { Plus, X, RefreshCw, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import TenantForm from '../../components/tenants/TenantForm';
import type { CreateTenantData } from '../../services/tenantsService';

export const AdminTenantsPage = () => {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const fetchTenants = async () => {
        try {
            const data = await tenantsService.getAll();
            setTenants(data);
        } catch (err) {
            setError('Error al cargar las empresas');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTenants();
    }, []);

    const handleCreate = async (data: any) => {
        try {
            setIsCreating(true);
            // Extract logo from data if present
            const { logo, ...createData } = data;

            // Call create service with separated logo
            await tenantsService.create(createData as CreateTenantData, logo);

            setIsModalOpen(false);
            fetchTenants(); // Refresh list
        } catch (err: any) {
            console.error(err);
            const message = err.response?.data?.message || 'Error al crear la empresa';
            alert(message);
        } finally {
            setIsCreating(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Cargando empresas...</div>;

    return (
        <div className="space-y-6">
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Building2 className="h-8 w-8 text-indigo-600" />
                        Gestión de Microempresas
                    </h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Administración de tenants registrados en la plataforma SaaS.
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 flex gap-2">
                    <button
                        onClick={fetchTenants}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refrescar
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Nueva Empresa
                    </button>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center p-6 border-b flex-shrink-0">
                            <h3 className="text-xl font-semibold text-gray-800">
                                Registrar Nueva Microempresa
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
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


            {
                error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                        {error}
                    </div>
                )
            }

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {tenants.map((tenant) => (
                            <tr key={tenant.tenant_id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{tenant.nombre_empresa}</div>
                                    <div className="text-xs text-gray-500">ID: {tenant.tenant_id}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{tenant.email}</div>
                                    <div className="text-xs text-gray-500">Reg: {new Date(tenant.fecha_registro).toLocaleDateString()}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                        {tenant.plan?.nombre_plan || 'Sin Plan'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                        ${tenant.estado === 'ACTIVA' ? 'bg-green-100 text-green-800' :
                                            tenant.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'}`}>
                                        {tenant.estado}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                    <Link to={`/admin/tenants/${tenant.tenant_id}`} className="text-indigo-600 hover:text-indigo-900 font-medium bg-indigo-50 px-3 py-1 rounded-md">
                                        Ver Detalles
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div >
    );
};
