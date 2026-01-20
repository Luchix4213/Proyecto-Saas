import { useEffect, useState } from 'react';
import { getMySubscriptions, cancelSubscription, loadCreateSubscription, type Suscripcion } from '../../services/suscripcionesService';
import { getPlans, type Plan } from '../../services/planesService';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, ChevronUp, AlertTriangle, Clock } from 'lucide-react';

import { ActiveSubscriptionCard } from '../../components/subscription/ActiveSubscriptionCard';
import { PlanCard } from '../../components/subscription/PlanCard';
import { PaymentModal } from '../../components/subscription/PaymentModal';
import { SubscriptionHistory } from '../../components/subscription/SubscriptionHistory';

export const SubscriptionPage = () => {
    const { user } = useAuth();
    const [subscriptions, setSubscriptions] = useState<Suscripcion[]>([]);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [showPlans, setShowPlans] = useState(false);
    const [billingCycle, setBillingCycle] = useState<'MENSUAL' | 'ANUAL'>('MENSUAL');
    const [selectedPlanForModal, setSelectedPlanForModal] = useState<Plan | null>(null);

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

    const handleConfirmSubscription = async (data: { paymentMethod: 'QR' | 'TRANSFERENCIA'; proof: File }) => {
        if (!selectedPlanForModal || !user?.tenant_id) return;

        try {
            await loadCreateSubscription({
                tenant_id: user.tenant_id,
                plan_id: selectedPlanForModal.plan_id,
                fecha_inicio: new Date().toISOString(),
                ciclo: billingCycle,
                metodo_pago: data.paymentMethod,
                referencia: data.paymentMethod === 'QR' ? 'Pago QR' : 'Transferencia',
                comprobante: data.proof
            });
            alert('Solicitud enviada con éxito. Tu plan se activará cuando verifiquemos el pago.');
            setSelectedPlanForModal(null);
            setShowPlans(false);
            loadData();
        } catch (err: any) {
            console.error(err);
            const msg = err.response?.data?.message || err.message || 'Error al procesar la solicitud';
            alert(`Error: ${msg}`);
        }
    };

    if (loading) return (
        <div className="flex h-[calc(100vh-6rem)] items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
                <p className="font-bold text-slate-400 animate-pulse">Cargando suscripción...</p>
            </div>
        </div>
    );

    // Filter Subscriptions
    const activeSubscription = subscriptions.find(s => s.estado === 'ACTIVA') ||
        subscriptions.find(s => s.estado === 'CANCELADA' && s.fecha_fin && new Date(s.fecha_fin) > new Date());

    const pendingSubscription = subscriptions.find(s => s.estado === 'PENDIENTE');

    const queuedSubscription = subscriptions.find(s =>
        s.estado === 'ACTIVA' && s.fecha_inicio && new Date(s.fecha_inicio) > new Date()
    );

    const isBlocked = !!queuedSubscription || !!pendingSubscription;

    return (
        <div className="space-y-8 animate-fade-in-up pb-12">

            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                    <ShieldCheck className="text-teal-600" size={32} />
                    Mi Suscripción
                </h1>
                <p className="text-slate-500 font-medium ml-11">Gestiona tu plan, facturación y mejoras.</p>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-700 font-bold rounded-2xl border border-red-100 flex items-center gap-3">
                    <AlertTriangle /> {error}
                </div>
            )}

            {/* Notifications */}
            {queuedSubscription && (
                <div className="bg-amber-50 border border-amber-100 p-6 rounded-[2rem] flex items-start gap-4 shadow-sm">
                    <div className="p-3 bg-amber-100 rounded-full text-amber-600">
                         <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h4 className="font-black text-amber-800 text-lg">Cambio de plan programado</h4>
                        <p className="text-amber-700 font-medium">
                            Tu nuevo plan iniciará el <strong>{new Date(queuedSubscription.fecha_inicio).toLocaleDateString()}</strong>.
                        </p>
                    </div>
                </div>
            )}

            {pendingSubscription && (
                <div className="bg-blue-50 border border-blue-100 p-6 rounded-[2rem] flex items-start gap-4 shadow-sm">
                    <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                         <Clock size={24} />
                    </div>
                    <div>
                        <h4 className="font-black text-blue-800 text-lg">Solicitud en revisión</h4>
                        <p className="text-blue-700 font-medium">
                            Tu solicitud para el plan <strong>{pendingSubscription.plan?.nombre_plan}</strong> está siendo verificada. Te notificaremos pronto.
                        </p>
                    </div>
                </div>
            )}

            {/* Active Plan */}
            <ActiveSubscriptionCard
                subscription={activeSubscription}
                onCancel={handleCancel}
                canCancel={activeSubscription?.plan?.nombre_plan !== 'FREE' && user?.rol === 'PROPIETARIO'}
            />

            {/* Upgrade / Change Plan Button */}
            {!isBlocked && activeSubscription && (
                <div className="flex justify-center">
                    <button
                        className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-lg text-white transition-all transform active:scale-95 shadow-xl shadow-teal-500/30 hover:shadow-teal-500/50 ${showPlans
                            ? 'bg-slate-800 hover:bg-slate-700'
                            : 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500'}`}
                        onClick={() => setShowPlans(!showPlans)}
                    >
                        {showPlans ? (
                            <>
                                <ChevronUp size={24} strokeWidth={3} /> Ocultar Planes
                            </>
                        ) : (
                            <>
                                <ShieldCheck size={24} strokeWidth={2.5} /> Mejorar mi Plan
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Plans Grid */}
            {(showPlans || !activeSubscription) && (
                <div className="animate-fade-in space-y-8 bg-slate-50/50 p-8 rounded-[3rem] border border-slate-100">
                    <div className="text-center max-w-2xl mx-auto">
                        <h2 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">Elige el plan perfecto</h2>
                        <p className="text-slate-500 font-medium mb-8">Desbloquea todo el potencial de tu negocio con nuestros planes premium.</p>

                        {/* Cycle Selector */}
                        <div className="inline-flex bg-white p-2 rounded-2xl shadow-sm border border-slate-100 mb-2">
                             <button
                                onClick={() => setBillingCycle('MENSUAL')}
                                className={`px-8 py-3 rounded-xl text-sm font-black transition-all ${billingCycle === 'MENSUAL'
                                    ? 'bg-slate-900 text-white shadow-lg'
                                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                Mensual
                            </button>
                            <button
                                onClick={() => setBillingCycle('ANUAL')}
                                className={`px-8 py-3 rounded-xl text-sm font-black transition-all ${billingCycle === 'ANUAL'
                                    ? 'bg-slate-900 text-white shadow-lg'
                                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                Anual <span className="text-emerald-400 ml-1">(-20%)</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {plans.map(plan => (
                            <PlanCard
                                key={plan.plan_id}
                                plan={plan}
                                isCurrentPlan={activeSubscription?.plan_id === plan.plan_id}
                                billingCycle={billingCycle}
                                onSelect={setSelectedPlanForModal}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* History Table */}
            <SubscriptionHistory subscriptions={subscriptions} />

            {/* Payment Modal */}
            <PaymentModal
                plan={selectedPlanForModal}
                billingCycle={billingCycle}
                onClose={() => setSelectedPlanForModal(null)}
                onConfirm={handleConfirmSubscription}
            />

        </div>
    );
};
