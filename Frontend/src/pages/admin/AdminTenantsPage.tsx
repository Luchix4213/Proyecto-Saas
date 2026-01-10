import { useEffect, useState } from 'react';
import { tenantsService } from '../../services/tenantsService';
import type { Tenant } from '../../services/tenantsService';
import { CheckCircle, XCircle, Ban, RefreshCw, Building2 } from 'lucide-react';

export const AdminTenantsPage = () => {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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

    const handleStatusChange = async (id: number, newStatus: 'ACTIVA' | 'INACTIVA') => {
        if (!confirm(`¿Estás seguro de cambiar el estado a ${newStatus}?`)) return;

        try {
            await tenantsService.updateStatus(id, newStatus);
            // Actualizar localmente
            setTenants(prev => prev.map(t =>
                t.tenant_id === id ? { ...t, estado: newStatus } : t
            ));
        } catch (err) {
            alert('Error al actualizar el estado');
            console.error(err);
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
                <div className="mt-4 sm:mt-0">
                    <button
                        onClick={fetchTenants}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refrescar
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                    {error}
                </div>
            )}

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
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    {tenant.estado === 'PENDIENTE' && (
                                        <>
                                            <button
                                                onClick={() => handleStatusChange(tenant.tenant_id, 'ACTIVA')}
                                                className="text-green-600 hover:text-green-900"
                                                title="Aprobar"
                                            >
                                                <CheckCircle className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange(tenant.tenant_id, 'INACTIVA')} // O rechazar
                                                className="text-red-600 hover:text-red-900"
                                                title="Rechazar"
                                            >
                                                <XCircle className="h-5 w-5" />
                                            </button>
                                        </>
                                    )}
                                    {tenant.estado === 'ACTIVA' && (
                                        <button
                                            onClick={() => handleStatusChange(tenant.tenant_id, 'INACTIVA')}
                                            className="text-red-600 hover:text-red-900"
                                            title="Bloquear"
                                        >
                                            <Ban className="h-5 w-5" />
                                        </button>
                                    )}
                                    {tenant.estado === 'INACTIVA' && (
                                        <button
                                            onClick={() => handleStatusChange(tenant.tenant_id, 'ACTIVA')}
                                            className="text-green-600 hover:text-green-900"
                                            title="Reactivar"
                                        >
                                            <CheckCircle className="h-5 w-5" />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
