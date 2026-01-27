import { useEffect, useState } from 'react';
import { getAllSubscriptions, approveSubscription, rejectSubscription, type Suscripcion } from '../../services/suscripcionesService';
import { Check, X, Calendar, CreditCard, Building2, ExternalLink, Activity, Ban, Eye } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { ConfirmDialog, type DialogType } from '../../components/common/ConfirmDialog';
import { AestheticHeader } from '../../components/common/AestheticHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';

export const AdminSubscriptionsPage = () => {
    const { addToast } = useToast();
    const [subscriptions, setSubscriptions] = useState<Suscripcion[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSub, setSelectedSub] = useState<Suscripcion | null>(null);

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
        loadSubscriptions();
    }, []);

    const loadSubscriptions = async () => {
        try {
            setLoading(true);
            const data = await getAllSubscriptions();
            setSubscriptions(data);
        } catch (err) {
            console.error('Error al cargar suscripciones:', err);
            addToast('Error al cargar suscripciones', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = (id: number) => {
        setConfirmConfig({
            isOpen: true,
            title: 'Aprobar Suscripción',
            message: '¿Estás seguro de aprobar esta suscripción? El acceso será habilitado de inmediato.',
            type: 'success',
            onConfirm: async () => {
                try {
                    await approveSubscription(id);
                    loadSubscriptions();
                    addToast('Suscripción aprobada correctamente', 'success');
                    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                } catch (err) {
                    addToast('Error al aprobar suscripción', 'error');
                }
            }
        });
    };

    const handleReject = (id: number) => {
        setConfirmConfig({
            isOpen: true,
            title: 'Rechazar Suscripción',
            message: '¿Estás seguro de rechazar esta suscripción?',
            type: 'danger',
            onConfirm: async () => {
                try {
                    await rejectSubscription(id);
                    loadSubscriptions();
                    addToast('Suscripción rechazada', 'info');
                    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                } catch (err) {
                    addToast('Error al rechazar suscripción', 'error');
                }
            }
        });
    };

    const stats = {
        total: subscriptions.length,
        active: subscriptions.filter(s => s.estado === 'ACTIVA').length,
        pending: subscriptions.filter(s => s.estado === 'PENDIENTE').length
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            <AestheticHeader
                title="Suscripciones Globales"
                description="Monitorea y gestiona el estado de las membresías de todas las microempresas."
                icon={Activity}
                iconColor="from-amber-500 to-orange-600"
            />

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Total Suscripciones</p>
                        <p className="text-2xl font-bold text-slate-800 mt-1">{stats.total}</p>
                    </div>
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                        <CreditCard size={20} />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Suscripciones Activas</p>
                        <p className="text-2xl font-bold text-slate-800 mt-1">{stats.active}</p>
                    </div>
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                        <Check size={20} />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Pendientes de Aprobación</p>
                        <p className="text-2xl font-bold text-slate-800 mt-1">{stats.pending}</p>
                    </div>
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                        <Activity size={20} />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"></div>
                        </div>
                    ) : subscriptions.length === 0 ? (
                        <EmptyState
                            icon={CreditCard}
                            title="No hay suscripciones"
                            description="No se encontraron registros de suscripción en el sistema."
                        />
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Empresa / Plan</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Monto</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Periodo</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {subscriptions.map((sub) => (
                                    <tr key={sub.suscripcion_id} className="group hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                                                    <Building2 size={18} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-800">{sub.tenant?.nombre_empresa}</div>
                                                    <div className="text-xs text-amber-600 font-bold uppercase tracking-wider">{sub.plan?.nombre_plan}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-slate-700">
                                                ${sub.monto}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="text-[10px] flex items-center gap-1 font-bold text-slate-400">
                                                    <Calendar size={10} /> INICIO: {new Date(sub.fecha_inicio).toLocaleDateString()}
                                                </div>
                                                <div className="text-[10px] flex items-center gap-1 font-bold text-slate-400">
                                                    <Calendar size={10} /> FIN: {new Date(sub.fecha_fin).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge
                                                status={sub.estado}
                                                variant={
                                                    sub.estado === 'ACTIVA' ? 'success' :
                                                    sub.estado === 'PENDIENTE' ? 'warning' : 'neutral'
                                                }
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {sub.comprobante_url && (
                                                    <button
                                                        onClick={() => setSelectedSub(sub)}
                                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                        title="Ver Comprobante"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                )}
                                                {sub.estado === 'PENDIENTE' && (
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleApprove(sub.suscripcion_id)}
                                                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                            title="Aprobar"
                                                        >
                                                            <Check size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(sub.suscripcion_id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Rechazar"
                                                        >
                                                            <X size={18} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Modal para ver comprobante */}
            {selectedSub && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in" onClick={() => setSelectedSub(null)}>
                    <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden max-w-2xl w-full animate-scale-in border border-slate-100" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                <Building2 className="text-indigo-600" />
                                {selectedSub.tenant?.nombre_empresa}
                            </h3>
                            <button onClick={() => setSelectedSub(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:rotate-90 transition-all duration-300">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-0 bg-slate-100 flex items-center justify-center overflow-auto max-h-[65vh]">
                            {selectedSub.comprobante_url ? (
                                <img
                                    src={'http://localhost:3000' + selectedSub.comprobante_url}
                                    alt="Comprobante de pago"
                                    className="max-w-full h-auto object-contain shadow-2xl"
                                />
                            ) : (
                                <div className="py-20 text-slate-400 flex flex-col items-center">
                                    <Ban size={48} className="opacity-20 mb-2" />
                                    <p>No hay imagen disponible</p>
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-slate-100 bg-white flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">Pago: ${selectedSub.monto}</div>
                            <div className="flex gap-3 w-full sm:w-auto">
                                {selectedSub.estado === 'PENDIENTE' && (
                                    <>
                                        <button
                                            onClick={() => { handleReject(selectedSub.suscripcion_id); setSelectedSub(null); }}
                                            className="flex-1 sm:flex-none px-6 py-3 border border-red-200 text-red-600 rounded-[1.25rem] text-xs font-black uppercase tracking-widest hover:bg-red-50 transition-all"
                                        >
                                            Rechazar
                                        </button>
                                        <button
                                            onClick={() => { handleApprove(selectedSub.suscripcion_id); setSelectedSub(null); }}
                                            className="flex-1 sm:flex-none px-6 py-3 bg-emerald-600 text-white rounded-[1.25rem] text-xs font-black uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all hover:-translate-y-0.5"
                                        >
                                            Aprobar
                                        </button>
                                    </>
                                )}
                                <a
                                    href={'http://localhost:3000' + selectedSub.comprobante_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-[1.25rem] text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all hover:-translate-y-0.5"
                                >
                                    <ExternalLink size={16} /> Abrir Original
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmDialog
                {...confirmConfig}
                onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
};
