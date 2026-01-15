import { useEffect, useState } from 'react';
import { getAllSubscriptions, approveSubscription, rejectSubscription, type Suscripcion } from '../../services/suscripcionesService';
import { Check, X, Eye } from 'lucide-react';

export const AdminSubscriptionsPage = () => {
    const [subscriptions, setSubscriptions] = useState<Suscripcion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedSub, setSelectedSub] = useState<Suscripcion | null>(null); // Para el modal de comprobante

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
            alert('Suscripción aprobada');
            loadSubscriptions(); // Recargar datos
        } catch (err) {
            alert('Error al aprobar');
        }
    };

    const handleReject = async (id: number) => {
        if (!window.confirm('¿Rechazar esta suscripción?')) return;
        try {
            await rejectSubscription(id);
            alert('Suscripción rechazada');
            loadSubscriptions();
        } catch (err) {
            alert('Error al rechazar');
        }
    };

    if (loading) return <div>Cargando...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Gestión de Suscripciones (Global)</h1>
            <div className="overflow-x-auto bg-white shadow rounded-lg">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Empresa</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Plan</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Monto</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Comprobante</th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subscriptions.map((sub) => (
                            <tr key={sub.suscripcion_id} className={sub.estado === 'PENDIENTE' ? 'bg-blue-50' : ''}>
                                <td className="px-5 py-5 border-b border-gray-200 text-sm">{sub.suscripcion_id}</td>
                                <td className="px-5 py-5 border-b border-gray-200 text-sm">
                                    <div className="font-bold">{sub.tenant?.nombre_empresa}</div>
                                    <div className="text-gray-500 text-xs">{sub.tenant?.email}</div>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 text-sm">{sub.plan?.nombre_plan}</td>
                                <td className="px-5 py-5 border-b border-gray-200 text-sm">
                                    <span className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${sub.estado === 'ACTIVA' ? 'bg-green-100 text-green-800' :
                                        sub.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                        {sub.estado}
                                    </span>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 text-sm">{sub.monto} BOB</td>
                                <td className="px-5 py-5 border-b border-gray-200 text-sm">
                                    {sub.comprobante_url ? (
                                        <button
                                            onClick={() => setSelectedSub(sub)}
                                            className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                                        >
                                            <Eye size={16} /> Ver
                                        </button>
                                    ) : (
                                        <span className="text-gray-400 text-xs">N/A</span>
                                    )}
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 text-sm">
                                    {sub.estado === 'PENDIENTE' ? (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleApprove(sub.suscripcion_id)}
                                                className="bg-green-100 text-green-700 p-1 rounded hover:bg-green-200"
                                                title="Aprobar"
                                            >
                                                <Check size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleReject(sub.suscripcion_id)}
                                                className="bg-red-100 text-red-700 p-1 rounded hover:bg-red-200"
                                                title="Rechazar"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 text-xs">-</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal de Comprobante */}
            {selectedSub && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg">Comprobante de Pago - {selectedSub.tenant?.nombre_empresa}</h3>
                            <button onClick={() => setSelectedSub(null)} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-4 overflow-y-auto flex-1 flex justify-center bg-gray-100">
                            {selectedSub.comprobante_url ? (
                                <img
                                    src={'http://localhost:3000' + selectedSub.comprobante_url}
                                    alt="Comprobante"
                                    className="max-w-full h-auto object-contain shadow-md"
                                />
                            ) : (
                                <p>No hay imagen disponible</p>
                            )}
                        </div>
                        <div className="p-4 border-t flex justify-end gap-2 bg-gray-50">
                            {selectedSub.estado === 'PENDIENTE' && (
                                <>
                                    <button
                                        onClick={() => { handleReject(selectedSub.suscripcion_id); setSelectedSub(null); }}
                                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                    >
                                        Rechazar
                                    </button>
                                    <button
                                        onClick={() => { handleApprove(selectedSub.suscripcion_id); setSelectedSub(null); }}
                                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                    >
                                        Aprobar Suscripción
                                    </button>
                                </>
                            )}
                            <button
                                onClick={() => setSelectedSub(null)}
                                className="px-4 py-2 border rounded hover:bg-gray-100"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
