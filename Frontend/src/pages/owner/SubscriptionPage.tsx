import { useEffect, useState } from 'react';
import { getMySubscriptions, cancelSubscription, loadCreateSubscription, type Suscripcion } from '../../services/suscripcionesService';
import { getPlans, type Plan } from '../../services/planesService';
import { useAuth } from '../../context/AuthContext';
import { Check, X, CreditCard, Clock, ShieldCheck, AlertTriangle, Upload, FileText, ChevronUp } from 'lucide-react';

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
                tenant_id: user!.tenant_id,
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

    if (loading) return (
        <div className="flex h-64 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
                <p className="text-sm font-medium text-slate-500">Cargando suscripción...</p>
            </div>
        </div>
    );

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

    const getSubscriptionCycle = (sub: Suscripcion) => {
        if (!sub.plan) return 'N/A';
        // Infer cycle from amount
        // If amount == annual price -> ANUAL
        if (Number(sub.monto) === Number(sub.plan.precio_anual)) return 'ANUAL';
        return 'MENSUAL';
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            {isQrZoomed && (
                <div
                    className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-sm cursor-zoom-out animate-fade-in"
                    onClick={() => setIsQrZoomed(false)}
                >
                    <img
                        src="http://localhost:3000/uploads/tenants/QR_generado.jpeg"
                        alt="QR Full Size"
                        className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl shadow-2xl"
                    />
                </div>
            )}

            {/* Header Section */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                    <ShieldCheck className="text-teal-600" />
                    Mi Suscripción
                </h1>
                <p className="text-slate-500">Gestiona tu plan y facturación.</p>
            </div>


            {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">{error}</div>}

            {/* Warning Banners */}
            {queuedSubscription && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
                    <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-amber-800">Cambio de plan programado</h4>
                        <p className="text-sm text-amber-700">
                            Tu nuevo plan iniciará el <strong>{new Date(queuedSubscription.fecha_inicio).toLocaleDateString()}</strong>.
                        </p>
                    </div>
                </div>
            )}

            {pendingSubscription && (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-start gap-3">
                    <Clock className="text-blue-500 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-blue-800">Solicitud en revisión</h4>
                        <p className="text-sm text-blue-700">
                            Tu solicitud para el plan <strong>{pendingSubscription.plan?.nombre_plan}</strong> está siendo verificada. Te notificaremos pronto.
                        </p>
                    </div>
                </div>
            )}

            {/* Active Plan Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-500"></div>
                <div className="p-6 md:p-8">
                    <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center justify-between">
                        <span>Plan Actual</span>
                        {activeSubscription && (
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${activeSubscription.estado === 'ACTIVA' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                                {activeSubscription.estado === 'CANCELADA' ? 'CANCELADA (Expira pronto)' : activeSubscription.estado}
                            </span>
                        )}
                    </h2>

                    {activeSubscription ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="p-4 bg-slate-50 rounded-xl">
                                    <p className="text-sm text-slate-500 mb-1">Plan</p>
                                    <p className="text-xl font-bold text-slate-900">{activeSubscription.plan?.nombre_plan}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl">
                                    <p className="text-sm text-slate-500 mb-1">Precio</p>
                                    <p className="text-xl font-bold text-slate-900">
                                        {activeSubscription.monto} BOB / {getSubscriptionCycle(activeSubscription).toLowerCase()}
                                    </p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl">
                                    <p className="text-sm text-slate-500 mb-1">Vencimiento</p>
                                    <p className="text-xl font-bold text-slate-900">
                                        {activeSubscription.fecha_fin ? new Date(activeSubscription.fecha_fin).toLocaleDateString() : 'Indefinido'}
                                    </p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl flex flex-col justify-center">
                                    {(activeSubscription.plan?.nombre_plan !== 'FREE' && user?.rol === 'PROPIETARIO' && activeSubscription.estado === 'ACTIVA') && (
                                        <button
                                            className="text-red-600 hover:text-red-700 text-sm font-medium hover:underline text-left"
                                            onClick={() => handleCancel(activeSubscription.suscripcion_id)}
                                        >
                                            Cancelar Suscripción
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100 flex justify-center md:justify-start">
                                <button
                                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all shadow-lg hover:-translate-y-0.5 ${isBlocked
                                        ? 'bg-slate-300 cursor-not-allowed shadow-none'
                                        : 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-teal-500/30'}`}
                                    onClick={() => !isBlocked && setShowPlans(!showPlans)}
                                    disabled={isBlocked}
                                >
                                    {showPlans ? (
                                        <>
                                            <ChevronUp size={20} /> Ocultar Planes
                                        </>
                                    ) : (
                                        <>
                                            <ShieldCheck size={20} /> Cambiar Plan / Mejorar
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 text-teal-600 rounded-full mb-4">
                                <ShieldCheck size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Sin suscripción activa</h3>
                            <p className="text-slate-500 mb-6 max-w-sm mx-auto">Selecciona un plan para desbloquear todas las funcionalidades de Kipu.</p>
                            <button
                                className="px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 font-bold shadow-lg shadow-teal-500/20"
                                onClick={() => setShowPlans(true)}
                            >
                                Ver Planes Disponibles
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Planes Disponibles (Toggle) */}
            {showPlans && (
                <div className="animate-fade-in space-y-6">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-slate-800 mb-4">Elige el plan perfecto para tu negocio</h2>
                        {/* Selector de Ciclo */}
                        <div className="inline-flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200">
                            <button
                                onClick={() => setBillingCycle('MENSUAL')}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${billingCycle === 'MENSUAL'
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : 'text-slate-500 hover:text-slate-900'
                                    }`}
                            >
                                Mensual
                            </button>
                            <button
                                onClick={() => setBillingCycle('ANUAL')}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${billingCycle === 'ANUAL'
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : 'text-slate-500 hover:text-slate-900'
                                    }`}
                            >
                                Anual <span className="text-emerald-400 font-normal ml-1">(-20%)</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {plans.map(plan => {
                            const isCurrentPlan = activeSubscription?.plan_id === plan.plan_id;
                            return (
                                <div key={plan.plan_id} className={`bg-white rounded-3xl shadow-sm border p-8 flex flex-col relative overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 ${isCurrentPlan ? 'border-teal-500 ring-2 ring-teal-500 ring-opacity-10' : 'border-slate-100'}`}>
                                    {isCurrentPlan && (
                                        <div className="absolute top-0 right-0 left-0 bg-teal-50 text-teal-700 text-xs font-bold text-center py-2 uppercase tracking-wider">
                                            Plan Actual
                                        </div>
                                    )}
                                    <div className={`flex flex-col h-full ${isCurrentPlan ? 'pt-6' : ''}`}>
                                        <h3 className="text-xl font-bold text-slate-800 mb-2">{plan.nombre_plan}</h3>
                                        <p className="text-slate-500 text-sm mb-6 line-clamp-2">{plan.descripcion}</p>

                                        <div className="mb-8">
                                            <div className="flex items-baseline">
                                                <span className="text-4xl font-extrabold text-slate-900">
                                                    {billingCycle === 'MENSUAL' ? plan.precio_mensual : plan.precio_anual}
                                                </span>
                                                <span className="text-xl font-bold text-slate-900 ml-1">BOB</span>
                                            </div>
                                            <div className="text-slate-400 text-sm font-medium mt-1">
                                                Facturado {billingCycle === 'MENSUAL' ? 'mensualmente' : 'anualmente'}
                                            </div>
                                            {billingCycle === 'ANUAL' && plan.precio_anual < (plan.precio_mensual * 12) && (
                                                <span className="inline-block mt-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md font-bold">
                                                    Ahorras {((plan.precio_mensual * 12) - plan.precio_anual).toFixed(0)} BOB
                                                </span>
                                            )}
                                        </div>

                                        <div className="space-y-4 flex-1 mb-8">
                                            <FeatureItem icon={Check} label={`Hasta ${plan.max_usuarios} usuarios`} />
                                            <FeatureItem icon={Check} label={`Hasta ${plan.max_productos} productos`} />
                                            <FeatureItem
                                                icon={plan.ventas_online ? Check : X}
                                                label="Ventas Online"
                                                active={plan.ventas_online}
                                            />
                                            <FeatureItem
                                                icon={plan.reportes_avanzados ? Check : X}
                                                label="Reportes Avanzados"
                                                active={plan.reportes_avanzados}
                                            />
                                        </div>

                                        <button
                                            onClick={() => handleOpenModal(plan)}
                                            disabled={isCurrentPlan}
                                            className={`w-full py-4 rounded-xl font-bold transition-all ${isCurrentPlan
                                                ? 'bg-slate-100 text-slate-400 cursor-default'
                                                : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg hover:shadow-xl'
                                                }`}
                                        >
                                            {isCurrentPlan ? 'Plan Actual' : 'Seleccionar Plan'}
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {selectedPlanForModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h3 className="text-xl font-bold text-slate-900">Confirmar Suscripción</h3>
                            <button
                                onClick={handleCloseModal}
                                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-8">
                            <div className="text-center mb-8">
                                <p className="text-slate-500 mb-2">Estás contratando el plan</p>
                                <h2 className="text-2xl font-bold text-teal-600 mb-1">{selectedPlanForModal.nombre_plan}</h2>
                                <p className="text-4xl font-extrabold text-slate-900 my-4">
                                    {billingCycle === 'MENSUAL' ? selectedPlanForModal.precio_mensual : selectedPlanForModal.precio_anual} BOB
                                </p>
                                <p className="text-slate-400 text-sm uppercase tracking-wide font-semibold">Pago {billingCycle.toLowerCase()}</p>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-3">Método de Pago</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => setPaymentMethod('QR')}
                                            className={`py-3 px-4 rounded-xl border-2 font-semibold transition-all flex flex-col items-center gap-2 ${paymentMethod === 'QR' ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-200 hover:border-slate-300 text-slate-600'}`}
                                        >
                                            <CreditCard size={24} />
                                            Pago QR
                                        </button>
                                        <button
                                            onClick={() => setPaymentMethod('TRANSFERENCIA')}
                                            className={`py-3 px-4 rounded-xl border-2 font-semibold transition-all flex flex-col items-center gap-2 ${paymentMethod === 'TRANSFERENCIA' ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-200 hover:border-slate-300 text-slate-600'}`}
                                        >
                                            <FileText size={24} />
                                            Transferencia
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                                    <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">1</span>
                                        Realiza el pago
                                    </h4>

                                    <div className="flex flex-col items-center">
                                        <p className="text-sm text-slate-500 mb-4 text-center">Escanea el QR desde tu aplicación bancaria.</p>
                                        <div className="relative group cursor-zoom-in" onClick={() => setIsQrZoomed(true)}>
                                            <img
                                                src="http://localhost:3000/uploads/tenants/QR_generado.jpeg"
                                                alt="Código QR de Pago"
                                                className="w-48 h-48 object-cover rounded-xl shadow-md transition-transform group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors rounded-xl"></div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">2</span>
                                        Sube el comprobante
                                    </h4>

                                    <label
                                        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${previewProof ? 'border-teal-500 bg-teal-50/50' : 'border-slate-300 hover:bg-slate-50'}`}
                                    >
                                        {previewProof ? (
                                            <div className="relative w-full h-full p-2">
                                                <img src={previewProof} alt="Comprobante" className="w-full h-full object-contain rounded-lg" />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/40 text-transparent hover:text-white transition-all rounded-lg">
                                                    <span className="font-bold text-sm">Cambiar Imagen</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                                                <p className="text-sm text-slate-500 font-medium">Click para subir imagen</p>
                                                <p className="text-xs text-slate-400 mt-1">PNG, JPG (Max 5MB)</p>
                                            </div>
                                        )}
                                        <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 flex gap-4 bg-slate-50">
                            <button
                                onClick={handleCloseModal}
                                className="flex-1 py-3 px-4 bg-white border border-slate-300 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmSubscription}
                                disabled={!paymentProof}
                                className={`flex-1 py-3 px-4 rounded-xl font-bold text-white shadow-lg transition-all ${!paymentProof
                                    ? 'bg-slate-400 cursor-not-allowed shadow-none'
                                    : 'bg-teal-600 hover:bg-teal-700 shadow-teal-500/30'
                                    }`}
                            >
                                Confirmar Pago
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Historial */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800">Historial de Pagos</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                            <tr>
                                <th className="px-8 py-4">Fecha</th>
                                <th className="px-8 py-4">Plan</th>
                                <th className="px-8 py-4">Inicio</th>
                                <th className="px-8 py-4">Vence</th>
                                <th className="px-8 py-4">Monto</th>
                                <th className="px-8 py-4">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                            {subscriptions.map((sub) => (
                                <tr key={sub.suscripcion_id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-8 py-4 font-medium text-slate-900">
                                        {sub.creado_en ? new Date(sub.creado_en).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="px-8 py-4 font-bold text-slate-800">
                                        {sub.plan?.nombre_plan}
                                    </td>
                                    <td className="px-8 py-4">
                                        {sub.fecha_inicio ? new Date(sub.fecha_inicio).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="px-8 py-4">
                                        {sub.fecha_fin ? new Date(sub.fecha_fin).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="px-8 py-4 font-medium">
                                        {sub.monto} BOB
                                    </td>
                                    <td className="px-8 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide
                                            ${sub.estado === 'ACTIVA' ? 'bg-emerald-100 text-emerald-700' :
                                                sub.estado === 'PENDIENTE' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-red-100 text-red-700'}`}>
                                            {sub.estado === 'CANCELADA' ? 'RECHAZADA/CANCELADA' : sub.estado}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {subscriptions.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-8 py-12 text-center text-slate-400">
                                        No hay historial disponible.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const FeatureItem = ({ icon: Icon, label, active = true }: { icon: any, label: string, active?: boolean }) => (
    <div className={`flex items-center gap-3 text-sm ${active ? 'text-slate-700' : 'text-slate-400 line-through'}`}>
        <div className={`p-1 rounded-full ${active ? 'bg-teal-50 text-teal-600' : 'bg-slate-100 text-slate-400'}`}>
            <Icon size={14} strokeWidth={active ? 3 : 2} />
        </div>
        <span className="font-medium">{label}</span>
    </div>
);
