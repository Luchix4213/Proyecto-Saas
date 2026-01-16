import { useEffect, useState } from 'react';
import { tenantsService } from '../../services/tenantsService';
import type { Tenant, UpdateTenantData } from '../../services/tenantsService';
import TenantForm from '../../components/tenants/TenantForm';
import { Building2, X, Check } from 'lucide-react';

const MyTenantPage = () => {
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
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
                <p className="text-slate-400 font-medium">Cargando perfil de empresa...</p>
            </div>
        );
    }

    if (error && !tenant) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100 max-w-md text-center shadow-sm">
                    <p className="font-bold mb-2">Error de conexión</p>
                    <p className="text-sm mb-4">{error}</p>
                    <button
                        onClick={fetchTenant}
                        className="px-4 py-2 bg-white border border-red-200 rounded-lg text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                    <Building2 className="text-teal-600" />
                    Mi Empresa
                </h1>
                <p className="text-slate-500">Administra la identidad y configuración de tu tienda.</p>
            </div>

            {/* Notifications */}
            {successMessage && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl flex items-center justify-between shadow-sm animate-fade-in">
                    <div className="flex items-center gap-2">
                        <Check size={18} className="stroke-[3]" />
                        <span className="font-medium">{successMessage}</span>
                    </div>
                    <button onClick={() => setSuccessMessage('')} className="p-1 hover:bg-emerald-100 rounded-full transition-colors">
                        <X size={16} />
                    </button>
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center justify-between shadow-sm animate-fade-in">
                    <span className="font-medium">{error}</span>
                    <button onClick={() => setError('')} className="p-1 hover:bg-red-100 rounded-full transition-colors">
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Content Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="font-bold text-slate-800 text-lg">Perfil de Negocio</h2>
                    <p className="text-sm text-slate-500">Esta información será visible en sus facturas y reportes.</p>
                </div>
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
