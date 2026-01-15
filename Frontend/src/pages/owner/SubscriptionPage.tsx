import { useEffect, useState } from 'react';
import { getMySubscriptions, cancelSubscription, loadCreateSubscription, type Suscripcion } from '../../services/suscripcionesService';
import { getPlans, type Plan } from '../../services/planesService';
import { useAuth } from '../../context/AuthContext';
import { Check, X } from 'lucide-react';

export const SubscriptionPage = () => {
    const { user } = useAuth();
    const [subscriptions, setSubscriptions] = useState<Suscripcion[]>([]);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [showPlans, setShowPlans] = useState(false);
    const [billingCycle, setBillingCycle] = useState<'MENSUAL' | 'ANUAL'>('MENSUAL');

    const [selectedPlanForModal, setSelectedPlanForModal] = useState<Plan | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'TRANSFERENCIA' | 'QR'>('QR');
    const [isQrZoomed, setIsQrZoomed] = useState(false);

    const [paymentProof, setPaymentProof] = useState<File | null>(null);
    const [previewProof, setPreviewProof] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [subsData, plansData] = await Promise.all([
                getMySubscriptions(),
                getPlans()
            ]);
            setSubscriptions(subsData);
            setPlans(plansData);
        } catch (err) {
            setError('No se pudo cargar la información');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id: number) => {
        if (!window.confirm('¿Estás seguro de cancelar tu suscripción?')) return;
        try {
            await cancelSubscription(id);
            loadData();
        } catch (err) {
            alert('Error al cancelar suscripción');
        }
    };

    const handleOpenModal = (plan: Plan) => {
        setSelectedPlanForModal(plan);
        setPaymentMethod('QR');
        setPaymentProof(null);
        setPreviewProof(null);
    };

    const handleCloseModal = () => {
        setSelectedPlanForModal(null);
        setPaymentProof(null);
        setPreviewProof(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPaymentProof(file);
            setPreviewProof(URL.createObjectURL(file));
        }
    };

    const handleConfirmSubscription = async () => {
        if (!selectedPlanForModal) return;

        if (!paymentProof) {
            alert('Por favor, sube el comprobante de pago.');
            return;
        }

        try {
            await loadCreateSubscription({
                tenant_id: user?.tenant_id,
                plan_id: selectedPlanForModal.plan_id,
                fecha_inicio: new Date().toISOString(),
                ciclo: billingCycle,
                metodo_pago: paymentMethod,
                referencia: 'Pago QR',
                comprobante: paymentProof
            });
            alert('Solicitud enviada con éxito. Tu plan se activará cuando verifiquemos el pago.');
            handleCloseModal();
            setShowPlans(false);
            loadData();
        } catch (err: any) {
            console.error(err);
            const msg = err.response?.data?.message || err.message || 'Error al procesar la solicitud';
            alert(`Error: ${msg}`);
        }
    };

    if (loading) return <div>Cargando...</div>;

    // Asumimos que la suscripción activa es la primera o la más reciente
    // Buscamos primero una suscripción explícitamente ACTIVA
    // Si no hay, buscamos una CANCELADA que siga vigente (periodo de gracia)
    const activeSubscription = subscriptions.find(s => s.estado === 'ACTIVA') ||
        subscriptions.find(s => s.estado === 'CANCELADA' && s.fecha_fin && new Date(s.fecha_fin) > new Date());

    // Suscripción pendiente de aprobación
    const pendingSubscription = subscriptions.find(s => s.estado === 'PENDIENTE');

    // Detección de suscripción en cola para Anti-Stacking
    const queuedSubscription = subscriptions.find(s =>
        s.estado === 'ACTIVA' && s.fecha_inicio && new Date(s.fecha_inicio) > new Date()
    );

    const isBlocked = !!queuedSubscription || !!pendingSubscription;

    return (
        <div className="p-6">
            {isQrZoomed && (
                <div
                    className="fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-90 cursor-zoom-out"
                    onClick={() => setIsQrZoomed(false)}
                >
                    <img
                        src="http://localhost:3000/uploads/tenants/QR_generado.jpeg"
                        alt="QR Full Size"
                        className="max-w-[90vw] max-h-[90vh] object-contain"
                    />
                </div>
            )}

            {isQrZoomed && (
                <div
                    className="fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-90 cursor-zoom-out"
                    onClick={() => setIsQrZoomed(false)}
                >
                    <img
                        src="http://localhost:3000/uploads/tenants/QR_generado.jpeg"
                        alt="QR Full Size"
                        className="max-w-[90vw] max-h-[90vh] object-contain"
                    />
                </div>
            )}

            <h1 className="text-2xl font-bold mb-6">Mi Suscripción</h1>

            {/* ... rest of the component until modal ... */}

            {/* Inside Modal QR Section */}


            {error && <div className="text-red-500 mb-4">{error}</div>}

            {/* Warning Banners */}
            {queuedSubscription && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <span className="text-yellow-400">⚠️</span>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                                Tienes un cambio de plan programado para el <strong>{new Date(queuedSubscription.fecha_inicio).toLocaleDateString()}</strong>.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {pendingSubscription && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <span className="text-blue-400">🕒</span>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-blue-700">
                                Tienes una solicitud de cambio al plan <strong>{pendingSubscription.plan?.nombre_plan}</strong> en revisión.
                                <br />
                                Te notificaremos cuando el pago sea verificado.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Plan Actual Card */}
            <div className="bg-white shadow-md rounded-lg p-6 mb-8 border border-gray-200">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Plan Actual</h2>
                {activeSubscription ? (
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <p className="text-sm text-gray-500">Plan</p>
                                <p className="text-lg font-bold text-blue-600">{activeSubscription.plan?.nombre_plan}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Precio</p>
                                <p className="text-lg font-bold">{activeSubscription.monto} BOB</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Estado</p>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                    ${activeSubscription.estado === 'ACTIVA' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {activeSubscription.estado === 'CANCELADA' ? 'CANCELADA (Expira pronto)' : activeSubscription.estado}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Vence el</p>
                                <p className="font-medium">
                                    {new Date(activeSubscription.fecha_fin).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div className="flex space-x-3 mt-6">
                            {(activeSubscription.plan?.nombre_plan !== 'FREE' && user?.rol === 'PROPIETARIO' && activeSubscription.estado === 'ACTIVA') && (
                                <button
                                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                                    onClick={() => handleCancel(activeSubscription.suscripcion_id)}
                                >
                                    Cancelar Suscripción
                                </button>
                            )}
                            <button
                                className={`px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${isBlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => !isBlocked && setShowPlans(!showPlans)}
                                disabled={isBlocked}
                            >
                                {showPlans ? 'Ocultar Planes' : 'Cambiar Plan'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">No tienes una suscripción activa.</p>
                        <button
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            onClick={() => setShowPlans(!showPlans)}
                        >
                            Ver Planes Disponibles
                        </button>
                    </div>
                )}
            </div>

            {/* Planes Disponibles (Toggle) */}
            {showPlans && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Selecciona un Plan</h2>

                    {/* Selector de Ciclo */}
                    <div className="flex justify-center mb-8">
                        <div className="bg-gray-100 p-1 rounded-lg inline-flex">
                            <button
                                onClick={() => setBillingCycle('MENSUAL')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${billingCycle === 'MENSUAL'
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Mensual
                            </button>
                            <button
                                onClick={() => setBillingCycle('ANUAL')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${billingCycle === 'ANUAL'
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Anual (Ahorra hasta 2 meses)
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {plans.map(plan => (
                            <div key={plan.plan_id} className="rounded-xl shadow-sm border p-6 flex flex-col relative overflow-hidden transition-all bg-white border-gray-100 hover:shadow-md">
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="text-xl font-bold text-gray-900">{plan.nombre_plan}</h3>
                                </div>

                                <div className="mb-4">
                                    <span className="text-3xl font-bold text-indigo-600">
                                        {billingCycle === 'MENSUAL' ? plan.precio_mensual : plan.precio_anual} BOB
                                    </span>
                                    <span className="text-gray-500 text-sm">/{billingCycle === 'MENSUAL' ? 'mes' : 'año'}</span>
                                    {billingCycle === 'ANUAL' && plan.precio_anual < (plan.precio_mensual * 12) && (
                                        <span className="block text-xs text-green-600 font-semibold mt-1">
                                            Ahorra {((plan.precio_mensual * 12) - plan.precio_anual).toFixed(0)} BOB al año
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-3 flex-1 mb-6">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Check size={18} className="text-green-500" />
                                        <span>Hasta <strong>{plan.max_usuarios}</strong> usuarios</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Check size={18} className="text-green-500" />
                                        <span>Hasta <strong>{plan.max_productos}</strong> productos</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        {plan.ventas_online ? (
                                            <Check size={18} className="text-green-500" />
                                        ) : (
                                            <X size={18} className="text-gray-400" />
                                        )}
                                        <span className={plan.ventas_online ? '' : 'text-gray-400 line-through'}>
                                            Ventas Online
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        {plan.reportes_avanzados ? (
                                            <Check size={18} className="text-green-500" />
                                        ) : (
                                            <X size={18} className="text-gray-400" />
                                        )}
                                        <span className={plan.reportes_avanzados ? '' : 'text-gray-400 line-through'}>
                                            Reportes Avanzados
                                        </span>
                                    </div>
                                    {plan.descripcion && (
                                        <p className="text-sm text-gray-500 mt-2 italic border-t pt-2 max-h-20 overflow-y-auto">
                                            "{plan.descripcion}"
                                        </p>
                                    )}
                                </div>

                                <button
                                    onClick={() => handleOpenModal(plan)}
                                    className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
                                >
                                    Elegir Plan
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {selectedPlanForModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
                    <div className="relative p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                        >
                            <X size={24} />
                        </button>

                        <div className="mt-3 text-center">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Confirmar Suscripción</h3>
                            <div className="mt-2 text-left">
                                <p className="text-sm text-gray-500 mb-4">
                                    Estás a punto de suscribirte al plan <strong>{selectedPlanForModal.nombre_plan}</strong>.
                                </p>
                                <div className="bg-gray-50 p-4 rounded-md mb-4 flex justify-between items-center">
                                    <span className="font-semibold text-gray-700">Total a Pagar:</span>
                                    <span className="text-2xl font-bold text-indigo-600">
                                        {billingCycle === 'MENSUAL' ? selectedPlanForModal.precio_mensual : selectedPlanForModal.precio_anual} BOB
                                    </span>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Método de Pago</label>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setPaymentMethod('QR')}
                                            className={`flex-1 py-2 px-4 rounded border ${paymentMethod === 'QR' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-gray-300'
                                                }`}
                                        >
                                            Pago QR
                                        </button>
                                        <button
                                            onClick={() => setPaymentMethod('TRANSFERENCIA')}
                                            className={`flex-1 py-2 px-4 rounded border ${paymentMethod === 'TRANSFERENCIA' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-gray-300'
                                                }`}
                                        >
                                            Transferencia
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <p className="text-sm text-gray-600 mb-2">
                                        1. Escanea el código QR para realizar el pago.
                                    </p>
                                    <div className="flex justify-center mb-4">
                                        <img
                                            src="http://localhost:3000/uploads/tenants/QR_generado.jpeg"
                                            alt="Código QR de Pago"
                                            className="w-48 h-48 object-cover border rounded shadow-sm cursor-zoom-in hover:opacity-95"
                                            onClick={() => setIsQrZoomed(true)}
                                            title="Click para ampliar"
                                        />
                                    </div>

                                    <p className="text-sm text-gray-600 mb-2">
                                        2. Sube el comprobante de pago.
                                    </p>
                                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                        <div className="space-y-1 text-center">
                                            {previewProof ? (
                                                <div className="mb-2">
                                                    <img src={previewProof} alt="Comprobante" className="mx-auto h-32 object-contain" />
                                                    <button
                                                        onClick={() => { setPaymentProof(null); setPreviewProof(null); }}
                                                        className="text-xs text-red-600 hover:text-red-800"
                                                    >
                                                        Cambiar imagen
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                    <div className="flex text-sm text-gray-600 justify-center">
                                                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                                            <span>Subir archivo</span>
                                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                                                        </label>
                                                    </div>
                                                    <p className="text-xs text-gray-500">PNG, JPG, BMP hasta 5MB</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={handleCloseModal}
                                        className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleConfirmSubscription}
                                        disabled={!paymentProof}
                                        className={`flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${!paymentProof ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        Enviar Solicitud
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Historial */}
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Historial de Pagos</h2>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Recibo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inicio</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vence</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {subscriptions.map((sub) => (
                            <tr key={sub.suscripcion_id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {sub.creado_en ? new Date(sub.creado_en).toLocaleDateString() : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {sub.plan?.nombre_plan}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {sub.fecha_inicio ? new Date(sub.fecha_inicio).toLocaleDateString() : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {sub.fecha_fin ? new Date(sub.fecha_fin).toLocaleDateString() : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {sub.monto} BOB
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                        ${sub.estado === 'ACTIVA' ? 'bg-green-100 text-green-800' :
                                            sub.estado === 'PENDIENTE' ? 'bg-blue-100 text-blue-800' :
                                                'bg-red-100 text-red-800'}`}>
                                        {sub.estado === 'CANCELADA' ? 'RECHAZADA/CANCELADA' : sub.estado}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {subscriptions.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                                    No hay historial disponible.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
