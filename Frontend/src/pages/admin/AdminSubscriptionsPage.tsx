import { useEffect, useState } from 'react';
import { getAllSubscriptions, approveSubscription, rejectSubscription, type Suscripcion } from '../../services/suscripcionesService';
import { Check, X, Eye, CreditCard, CheckCircle2, Ban, AlertCircle } from 'lucide-react';

export const AdminSubscriptionsPage = () => {
    const [subscriptions, setSubscriptions] = useState<Suscripcion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedSub, setSelectedSub] = useState<Suscripcion | null>(null);

    useEffect(() => {
        loadSubscriptions();
    }, []);

    const loadSubscriptions = async () => {
        try {
            const data = await getAllSubscriptions();
            setSubscriptions(data);
        } catch (err) {
            setError('Error al cargar suscripciones');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: number) => {
        if (!window.confirm('¿Aprobar esta suscripción? Esto activará el plan del Tenant.')) return;
        try {
            await approveSubscription(id);
            loadSubscriptions();
        } catch (err) {
            alert('Error al aprobar');
        }
    };

    const handleReject = async (id: number) => {
        if (!window.confirm('¿Rechazar esta suscripción?')) return;
        try {
            await rejectSubscription(id);
            loadSubscriptions();
        } catch (err) {
            alert('Error al rechazar');
        }
    };

    const stats = {
        total: subscriptions.length,
        active: subscriptions.filter(s => s.estado === 'ACTIVA').length,
        pending: subscriptions.filter(s => s.estado === 'PENDIENTE').length
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                    <CreditCard className="text-teal-600" />
                    Gestión de Suscripciones
                </h1>
                <p className="text-slate-500 mt-1">Supervisa y aprueba los planes y pagos de las microempresas.</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Suscripciones</p>
                        <p className="text-2xl font-bold text-slate-800 mt-1">{stats.total}</p>
                    </div>
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                        <CreditCard size={20} />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Activas</p>
                        <p className="text-2xl font-bold text-slate-800 mt-1">{stats.active}</p>
                    </div>
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                        <CheckCircle2 size={20} />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pendientes de Aprobación</p>
                        <p className="text-2xl font-bold text-slate-800 mt-1">{stats.pending}</p>
                    </div>
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                        <AlertCircle size={20} />
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center gap-3">
                    <Ban size={20} />
                    <span className="font-medium">{error}</span>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Empresa</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Plan Solicitado</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Monto</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Comprobante</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent"></div>
                                            <span className="text-sm font-medium text-slate-500">Cargando suscripciones...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : subscriptions.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                                        No hay historial de suscripciones.
                                    </td>
                                </tr>
                            ) : (
                                subscriptions.map((sub) => (
                                    <tr key={sub.suscripcion_id} className={`group hover:bg-slate-50/80 transition-colors ${sub.estado === 'PENDIENTE' ? 'bg-amber-50/30' : ''}`}>
                                        <td className="px-6 py-4 text-sm text-slate-500 font-mono">#{sub.suscripcion_id}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-800">{sub.tenant?.nombre_empresa}</div>
                                            <div className="text-xs text-slate-500">{sub.tenant?.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-slate-700">{sub.plan?.nombre_plan}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${sub.estado === 'ACTIVA' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                sub.estado === 'PENDIENTE' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                    'bg-red-50 text-red-700 border-red-100'
                                                }`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${sub.estado === 'ACTIVA' ? 'bg-emerald-500' :
                                                    sub.estado === 'PENDIENTE' ? 'bg-amber-500' :
                                                        'bg-red-500'
                                                    }`}></span>
                                                {sub.estado}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-sm text-slate-700">
                                            {sub.monto} BOB
                                        </td>
                                        <td className="px-6 py-4">
                                            {sub.comprobante_url ? (
                                                <button
                                                    onClick={() => setSelectedSub(sub)}
                                                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded transition-colors"
                                                >
                                                    <Eye size={14} /> Ver Imagen
                                                </button>
                                            ) : (
                                                <span className="text-slate-400 text-xs italic">N/A</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {sub.estado === 'PENDIENTE' ? (
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleApprove(sub.suscripcion_id)}
                                                        className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                                                        title="Aprobar"
                                                    >
                                                        <Check size={16} strokeWidth={2.5} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(sub.suscripcion_id)}
                                                        className="p-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                                        title="Rechazar"
                                                    >
                                                        <X size={16} strokeWidth={2.5} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-slate-300">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Comprobante */}
            {selectedSub && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col animate-scale-in border border-slate-100">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="font-bold text-lg text-slate-800">Comprobante de Pago</h3>
                                <p className="text-sm text-slate-500">{selectedSub.tenant?.nombre_empresa}</p>
                            </div>
                            <button
                                onClick={() => setSelectedSub(null)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-4 overflow-y-auto flex-1 flex justify-center bg-slate-100">
                            {selectedSub.comprobante_url ? (
                                <img
                                    src={'http://localhost:3000' + selectedSub.comprobante_url}
                                    alt="Comprobante"
                                    className="max-w-full h-auto object-contain shadow-md rounded-lg"
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center text-slate-400 h-64">
                                    <Ban size={48} className="mb-2 opacity-50" />
                                    <p>No hay imagen disponible</p>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-slate-100 bg-white flex justify-between items-center">
                            <span className="text-sm text-slate-500 font-mono">ID: #{selectedSub.suscripcion_id}</span>
                            <div className="flex gap-2">
                                {selectedSub.estado === 'PENDIENTE' && (
                                    <>
                                        <button
                                            onClick={() => { handleReject(selectedSub.suscripcion_id); setSelectedSub(null); }}
                                            className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100 font-bold text-sm transition-colors"
                                        >
                                            Rechazar
                                        </button>
                                        <button
                                            onClick={() => { handleApprove(selectedSub.suscripcion_id); setSelectedSub(null); }}
                                            className="px-4 py-2 bg-emerald-600 text-white shadow-lg shadow-emerald-200 border border-transparent rounded-xl hover:bg-emerald-700 font-bold text-sm transition-colors"
                                        >
                                            Aprobar Pagp
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={() => setSelectedSub(null)}
                                    className="px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 font-medium text-sm transition-colors"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
