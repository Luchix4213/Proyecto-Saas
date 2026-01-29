import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { salesService } from '../../services/salesService';

export const ConfirmationPage = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [saleInfo, setSaleInfo] = useState<any>(null);
    const [action, setAction] = useState<'NONE' | 'CONFIRMING' | 'REPORTING' | 'SUCCESS'>('NONE');
    const [comment, setComment] = useState('');

    useEffect(() => {
        if (!token) {
            setError('Enlace inválido o incompleto.');
            setLoading(false);
            return;
        }

        salesService.verifyToken(token)
            .then(data => {
                setSaleInfo(data);
                // If already confirmed/reported, showing static message could be nice,
                // but for now we let them update or see current status
                if (data.estado_confirmacion !== 'PENDIENTE') {
                    // Optional: setAction('SUCCESS') or similar if already done
                }
            })
            .catch(err => {
                console.error(err);
                setError(err.response?.data?.message || 'No se pudo verificar el pedido.');
            })
            .finally(() => setLoading(false));
    }, [token]);

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await salesService.confirmDelivery(token!, 'CONFIRMADO');
            setAction('SUCCESS');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al confirmar');
        } finally {
            setLoading(false);
        }
    };

    const handleReport = async () => {
        setLoading(true);
        try {
            await salesService.confirmDelivery(token!, 'RECLAMO', comment);
            setAction('SUCCESS');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al enviar reporte');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">⚠️</span>
                    </div>
                    <h1 className="text-xl font-bold text-slate-800 mb-2">Enlace no disponible</h1>
                    <p className="text-slate-500">{error}</p>
                </div>
            </div>
        );
    }

    if (action === 'SUCCESS') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">✅</span>
                    </div>
                    <h1 className="text-xl font-bold text-slate-800 mb-2">¡Gracias por tu respuesta!</h1>
                    <p className="text-slate-500">Hemos registrado tu confirmación correctamente.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
            <div className="bg-white max-w-md w-full rounded-2xl shadow-xl overflow-hidden">
                {/* Header */}
                <div className="bg-slate-900 p-6 text-white text-center">
                    <p className="text-sm opacity-80 uppercase tracking-widest font-bold mb-1">{saleInfo?.tenant_nombre}</p>
                    <h1 className="text-2xl font-bold">Confirmación de Entrega</h1>
                </div>

                <div className="p-8">
                    <div className="mb-8 text-center">
                        <p className="text-slate-500 mb-1">Hola <span className="font-bold text-slate-800">{saleInfo?.cliente}</span>,</p>
                        <p className="text-slate-600">
                            Por favor confirma si recibiste tu pedido de <span className="font-bold">{saleInfo?.items} productos</span>.
                        </p>
                    </div>

                    {action === 'NONE' && (
                        <div className="space-y-4">
                            <button
                                onClick={handleConfirm}
                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3"
                            >
                                <span className="text-xl">✅</span> Recibí todo correctamente
                            </button>

                            <button
                                onClick={() => setAction('REPORTING')}
                                className="w-full bg-white border-2 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3"
                            >
                                <span className="text-xl">⚠️</span> Tuve un problema
                            </button>
                        </div>
                    )}

                    {action === 'REPORTING' && (
                        <div className="space-y-4">
                            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Cuéntanos qué pasó:
                                </label>
                                <textarea
                                    className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none min-h-[100px]"
                                    placeholder="Ej: Llegó incompleto, producto dañado..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                />
                            </div>

                            <button
                                onClick={handleReport}
                                disabled={!comment.trim()}
                                className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-amber-500/20 transition-all"
                            >
                                Enviar Reporte
                            </button>

                            <button
                                onClick={() => setAction('NONE')}
                                className="w-full text-slate-400 hover:text-slate-600 font-medium py-2"
                            >
                                Cancelar
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
