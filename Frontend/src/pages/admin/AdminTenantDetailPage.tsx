import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTenantSubscriptions, type Suscripcion } from '../../services/suscripcionesService';
import { tenantsService, type Tenant } from '../../services/tenantsService';
import { userService } from '../../services/userService';
import { Building2, Mail, CreditCard, Users, ArrowLeft, CheckCircle, Ban, ArrowLeftCircle, Globe } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { ConfirmDialog, type DialogType } from '../../components/common/ConfirmDialog';
import { AestheticHeader } from '../../components/common/AestheticHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';

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

    if (loading) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="flex items-center gap-4 mb-8">
                    <div className="h-10 w-10 bg-slate-200 rounded-full"></div>
                    <div className="space-y-2">
                        <div className="h-8 w-64 bg-slate-200 rounded-lg"></div>
                        <div className="h-4 w-48 bg-slate-100 rounded-lg"></div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 h-64 bg-slate-50 rounded-2xl border border-slate-100"></div>
                    <div className="h-64 bg-slate-50 rounded-2xl border border-slate-100"></div>
                </div>
            </div>
        );
    }

    if (error || !tenant) {
        return (
            <div className="py-20 flex justify-center">
                <EmptyState
                    icon={Building2}
                    title="Empresa no encontrada"
                    description={error || "El identificador de la empresa no es válido o ha sido removida."}
                    action={
                        <Link to="/admin" className="mt-4 flex items-center gap-2 text-indigo-600 font-bold">
                            <ArrowLeftCircle size={18} /> Volver al listado
                        </Link>
                    }
                />
            </div>
        );
    }

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
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex items-center gap-4 mb-2">
                <Link to="/admin/tenants" className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-2xl transition-all duration-300">
                    <ArrowLeft size={24} />
                </Link>
                <div className="h-8 w-px bg-slate-200"></div>
                <StatusBadge
                    status={tenant.estado}
                    variant={isActive ? 'success' : 'error'}
                />
            </div>

            <AestheticHeader
                title={tenant.nombre_empresa}
                description={`Gestionando la microempresa establecida el ${new Date(tenant.fecha_registro).toLocaleDateString()}.`}
                icon={Building2}
                iconColor="from-indigo-500 to-purple-600"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 md:col-span-2">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <Globe size={16} /> Información del Business
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email de Contacto</p>
                            <p className="font-bold text-slate-800 flex items-center gap-2">
                                <Mail size={16} className="text-slate-400" />
                                {tenant.email}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Identificador</p>
                            <p className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50/50 px-2 py-1 rounded inline-block">
                                ID-{tenant.tenant_id}
                            </p>
                        </div>
                        <div className="sm:col-span-2 space-y-3">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Suscripción y Plan</p>
                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 text-indigo-600">
                                        <CreditCard size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-800">{tenant.plan?.nombre_plan || 'Plan No Asignado'}</p>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase">Membresía Activa</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    {(() => {
                                        const activeSub = subscriptions.find(s => s.estado === 'ACTIVA');
                                        if (!activeSub) return <span className="text-xs font-bold text-slate-400">PLAN GRATUITO</span>;
                                        return <span className="text-lg font-black text-slate-800">${activeSub.monto} <span className="text-[10px] text-slate-400 uppercase">Pagado</span></span>;
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
                     <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                        Comandos
                     </h3>
                     {isActive ? (
                        <button
                            onClick={() => handleStatusChange('INACTIVA')}
                            className="w-full py-4 px-6 bg-red-50 text-red-600 hover:bg-red-100 rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[10px] border border-red-100 transition-all hover:-translate-y-0.5"
                        >
                            <Ban size={16} strokeWidth={3} /> Desactivar Acceso
                        </button>
                     ) : (
                        <button
                            onClick={() => handleStatusChange('ACTIVA')}
                            className="w-full py-4 px-6 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[10px] border border-emerald-100 transition-all hover:-translate-y-0.5"
                        >
                            <CheckCircle size={16} strokeWidth={3} /> Activar Acceso
                        </button>
                     )}
                     <a href={`mailto:${tenant.email}`} className="w-full py-4 px-6 bg-slate-900 text-white hover:bg-slate-800 rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-slate-900/20 transition-all hover:-translate-y-0.5">
                        <Mail size={16} strokeWidth={3} /> Enviar Mensaje
                     </a>
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
                                <td className="px-6 py-4">
                                     <StatusBadge
                                        status={user.estado}
                                        variant={user.estado === 'ACTIVO' ? 'success' : 'error'}
                                    />
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
                                <td className="px-6 py-4">
                                    <StatusBadge
                                        status={sub.estado}
                                        variant={
                                            sub.estado === 'ACTIVA' ? 'success' :
                                            sub.estado === 'CANCELADA' ? 'error' :
                                            sub.estado === 'PENDIENTE' ? 'warning' : 'neutral'
                                        }
                                    />
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
