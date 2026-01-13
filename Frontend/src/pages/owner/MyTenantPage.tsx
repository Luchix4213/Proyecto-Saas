import { useEffect, useState } from 'react';
import { tenantsService } from '../../services/tenantsService';
import type { Tenant, UpdateTenantData } from '../../services/tenantsService';
import TenantForm from '../../components/tenants/TenantForm';
import { Building2 } from 'lucide-react';
// import { useAuth } from '../../context/AuthContext';

const MyTenantPage = () => {
    // const { user } = useAuth();
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const fetchTenant = async () => {
        try {
            setLoading(true);
            const data = await tenantsService.getMyTenant();
            setTenant(data);
        } catch (err) {
            setError('Error al cargar la información de la empresa.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTenant();
    }, []);

    const handleUpdate = async (data: UpdateTenantData) => {
        if (!tenant) return;
        try {
            setLoading(true);
            setError('');
            setSuccessMessage('');
            const updated = await tenantsService.update(tenant.tenant_id, data);
            setTenant(updated);
            setSuccessMessage('Información actualizada correctamente.');
            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: any) {
            const message = err.response?.data?.message || 'Error al actualizar la información.';
            setError(message);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !tenant) {
        return <div className="p-8 text-center text-gray-500">Cargando información de su empresa...</div>;
    }

    if (error && !tenant) {
        return (
            <div className="p-8 text-center">
                <div className="bg-red-50 text-red-600 p-4 rounded-md inline-block">
                    {error}
                    <button onClick={fetchTenant} className="ml-4 underline">Reintentar</button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8 flex items-center gap-3">
                <div className="p-3 bg-indigo-100 rounded-lg text-indigo-600">
                    <Building2 size={32} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Mi Empresa</h1>
                    <p className="text-gray-500">Administre la información visible de su negocio.</p>
                </div>
            </div>

            {successMessage && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center justify-between animate-fade-in-down">
                    <span>{successMessage}</span>
                    <button onClick={() => setSuccessMessage('')} className="text-green-500 hover:text-green-700">&times;</button>
                </div>
            )}

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
                <div className="p-6 md:p-8">
                    {tenant && (
                        <TenantForm
                            tenant={tenant}
                            onSubmit={handleUpdate}
                            isLoading={loading}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyTenantPage;
