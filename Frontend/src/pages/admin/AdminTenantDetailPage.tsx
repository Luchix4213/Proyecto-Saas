import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTenantSubscriptions, type Suscripcion } from '../../services/suscripcionesService';
import { tenantsService, type Tenant } from '../../services/tenantsService';
import { userService } from '../../services/userService'; // Import userService
import { Building2, Mail, Calendar, CreditCard, Users, ArrowLeft, CheckCircle, XCircle, Ban } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { ConfirmDialog, type DialogType } from '../../components/common/ConfirmDialog';

export const AdminTenantDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const { addToast } = useToast();
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [subscriptions, setSubscriptions] = useState<Suscripcion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [confirmConfig, setConfirmConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: DialogType;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: () => {},
    });

    useEffect(() => {
        if (id) {
            loadTenant(parseInt(id));
        }
    }, [id]);

    const loadTenant = async (tenantId: number) => {
        try {
            const data = await tenantsService.getById(tenantId);
            setTenant(data);
            // Fetch subscription history
            try {
                const subs = await getTenantSubscriptions(tenantId);
                setSubscriptions(subs);
            } catch (subError) {
                console.error('Error fetching subscriptions:', subError);
            }
        } catch (err) {
            console.error(err);
            setError('Error al cargar la información de la empresa.');
            addToast('Error al cargar la información', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando detalles...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!tenant) return <div className="p-8 text-center text-gray-500">No se encontró la empresa.</div>;

    const handleStatusChange = async (newStatus: 'ACTIVA' | 'INACTIVA') => {
        if (!tenant) return;
        setConfirmConfig({
            isOpen: true,
            title: newStatus === 'ACTIVA' ? 'Activar Empresa' : 'Desactivar Empresa',
            message: `¿Estás seguro de que deseas ${newStatus === 'ACTIVA' ? 'activar' : 'desactivar'} a ${tenant.nombre_empresa}?`,
            type: newStatus === 'ACTIVA' ? 'info' : 'danger',
            onConfirm: async () => {
                try {
                    await tenantsService.updateStatus(tenant.tenant_id, newStatus);
                    loadTenant(tenant.tenant_id);
                    addToast(`Empresa ${newStatus === 'ACTIVA' ? 'activada' : 'desactivada'} correctamente`, 'success');
                    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                } catch (err) {
                    console.error(err);
                    addToast('Error al actualizar el estado de la empresa', 'error');
                }
            }
        });
    };

    const handleToggleUserStatus = (user: any) => {
        const nuevoEstado = user.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
        const accion = user.estado === 'ACTIVO' ? 'bloquear' : 'reactivar';

        setConfirmConfig({
            isOpen: true,
            title: user.estado === 'ACTIVO' ? 'Bloquear Usuario' : 'Reactivar Usuario',
            message: `¿Estás seguro de ${accion} el acceso a ${user.nombre}?`,
            type: user.estado === 'ACTIVO' ? 'danger' : 'info',
            onConfirm: async () => {
                try {
                    await userService.update(user.usuario_id, { estado: nuevoEstado });
                    loadTenant(tenant!.tenant_id);
                    addToast(`Usuario ${nuevoEstado === 'ACTIVO' ? 'activado' : 'bloqueado'} correctamente`, 'success');
                    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                } catch (error) {
                    console.error('Error al cambiar estado de usuario:', error);
                    addToast('No se pudo cambiar el estado del usuario', 'error');
                }
            }
        });
    };

    const isActive = tenant.estado === 'ACTIVA';

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link to="/admin" className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Building2 className="h-6 w-6 text-indigo-600" />
                    {tenant.nombre_empresa}
                </h1>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                    {tenant.estado}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Info General */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 col-span-2">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Información General</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500">ID del Sistema</p>
                            <p className="text-gray-900 mt-1">{tenant.tenant_id}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Fecha de Registro</p>
                            <p className="text-gray-900 mt-1 flex items-center gap-2">
                                <Calendar size={16} className="text-gray-400" />
                                {new Date(tenant.fecha_registro).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-sm font-medium text-gray-500">Contacto / Email</p>
                            <p className="text-gray-900 mt-1 flex items-center gap-2">
                                <Mail size={16} className="text-gray-400" />
                                {tenant.email}
                            </p>
                        </div>
                         <div className="col-span-2">
                            <p className="text-sm font-medium text-gray-500">Plan Actual</p>
                            <div className="mt-1 flex items-center justify-between bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                                <span className="flex items-center gap-2 font-semibold text-indigo-700">
                                    <CreditCard size={18} />
                                    {tenant.plan?.nombre_plan || 'Sin Plan Asignado'}
                                </span>
                                <span className="text-xs text-indigo-500 font-medium tracking-wide">
                                    {(() => {
                                        const activeSub = subscriptions.find(s => s.estado === 'ACTIVA');
                                        if (!activeSub) return 'GRATUITO'; // O "Sin suscripción activa"

                                        // Inferir ciclo basado en monto (si coincide con precio mensual/anual del plan)
                                        // O idealmente el backend retorna el ciclo, pero no está en el tipo Suscripcion actual del frontend explícitamente?
                                        // Revisemos el servicio... si no, usamos el monto
                                        const monto = Number(activeSub.monto);
                                        const precioAnual = Number(tenant.plan?.precio_anual || 0);

                                        if (monto === precioAnual && precioAnual > 0) return `BOB ${monto}/año`;
                                        return `BOB ${monto}/mes`;
                                    })()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Acciones Rápidas */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3">
                     <h3 className="text-lg font-semibold text-gray-800 mb-2">Acciones</h3>
                     <a href={`mailto:${tenant.email}`} className="w-full py-2 px-4 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-lg flex items-center justify-center gap-2 font-medium border border-gray-200 transition-colors">
                        <Mail size={16} /> Contactar
                     </a>
                     {isActive ? (
                        <button
                            onClick={() => handleStatusChange('INACTIVA')}
                            className="w-full py-2 px-4 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg flex items-center justify-center gap-2 font-medium border border-red-100 transition-colors"
                        >
                            <XCircle size={16} /> Desactivar Empresa
                        </button>
                     ) : (
                        <button
                            onClick={() => handleStatusChange('ACTIVA')}
                            className="w-full py-2 px-4 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg flex items-center justify-center gap-2 font-medium border border-green-100 transition-colors"
                        >
                            <CheckCircle size={16} /> Activar Empresa
                        </button>
                     )}
                </div>
            </div>

            {/* Usuarios Registrados */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <div className="p-6 border-b border-gray-100 flex items-center gap-2">
                    <Users className="h-5 w-5 text-gray-500" />
                    <h3 className="text-lg font-bold text-gray-900">Usuarios Registrados ({tenant.usuarios?.length || 0})</h3>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-600 font-medium text-sm">
                        <tr>
                            <th className="px-6 py-3">Usuario</th>
                            <th className="px-6 py-3">Rol</th>
                            <th className="px-6 py-3">Email</th>
                            <th className="px-6 py-3">Estado</th>
                            <th className="px-6 py-3 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {tenant.usuarios?.map((user: any) => (
                            <tr key={user.usuario_id} className="hover:bg-gray-50">
                                <td className="px-6 py-3 font-medium text-gray-900">
                                    {user.nombre} {user.paterno}
                                </td>
                                <td className="px-6 py-3">
                                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                                        user.rol === 'PROPIETARIO' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                                    }`}>
                                        {user.rol}
                                    </span>
                                </td>
                                <td className="px-6 py-3 text-sm text-gray-500">{user.email}</td>
                                <td className="px-6 py-3">
                                     <span className={`text-xs font-medium ${user.estado === 'ACTIVO' ? 'text-green-600' : 'text-red-600'}`}>
                                        {user.estado}
                                    </span>
                                </td>
                                <td className="px-6 py-3 text-right">
                                    <button
                                        onClick={() => handleToggleUserStatus(user)}
                                        title={user.estado === 'ACTIVO' ? 'Bloquear Acceso' : 'Reactivar Acceso'}
                                        className={`p-1.5 rounded-full transition-colors ${
                                            user.estado === 'ACTIVO'
                                            ? 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                                            : 'text-green-600 bg-green-50 hover:bg-green-100'
                                        }`}
                                    >
                                        {user.estado === 'ACTIVO' ? <Ban size={16} /> : <CheckCircle size={16} />}
                                    </button>
                                </td>
                            </tr>
                        )) || (
                            <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">No hay usuarios visibles.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Historial de Suscripciones */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <div className="p-6 border-b border-gray-100 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-gray-500" />
                    <h3 className="text-lg font-bold text-gray-900">Historial de Suscripciones</h3>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-600 font-medium text-sm">
                        <tr>
                            <th className="px-6 py-3">Fecha Inicio</th>
                            <th className="px-6 py-3">Fecha Fin</th>
                            <th className="px-6 py-3">Plan</th>
                            <th className="px-6 py-3">Monto</th>
                            <th className="px-6 py-3">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {subscriptions.map((sub) => (
                            <tr key={sub.suscripcion_id} className="hover:bg-gray-50">
                                <td className="px-6 py-3 text-sm text-gray-900">
                                    {new Date(sub.fecha_inicio).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-3 text-sm text-gray-500">
                                    {sub.fecha_fin ? new Date(sub.fecha_fin).toLocaleDateString() : '-'}
                                </td>
                                <td className="px-6 py-3 text-sm font-medium text-gray-900">
                                    {sub.plan?.nombre_plan}
                                </td>
                                <td className="px-6 py-3 text-sm text-gray-500">
                                    {sub.monto} BOB
                                </td>
                                <td className="px-6 py-3">
                                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                                        sub.estado === 'ACTIVA' ? 'bg-green-100 text-green-800' :
                                        sub.estado === 'CANCELADA' ? 'bg-red-100 text-red-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {sub.estado}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {subscriptions.length === 0 && (
                            <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">No hay historial de suscripciones.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <ConfirmDialog
                {...confirmConfig}
                onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
};
