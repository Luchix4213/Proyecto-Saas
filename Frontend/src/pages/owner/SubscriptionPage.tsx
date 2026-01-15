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

    const handleSelectPlan = async (plan: Plan) => {
        if (!window.confirm(`¿Confirmas cambiar al plan ${plan.nombre_plan}?`)) return;
        try {
             // Crear nueva suscripción
             await loadCreateSubscription({
                 tenant_id: user?.tenant_id,
                 plan_id: plan.plan_id,
                 fecha_inicio: new Date().toISOString(),
                 ciclo: billingCycle,
                 metodo_pago: 'TRANSFERENCIA', // Simulado (En enum: EFECTIVO, QR, TRANSFERENCIA)
                 referencia: 'Upgrade Manual'
             });
             alert('Plan actualizado con éxito');
             setShowPlans(false);
             loadData();
        } catch (err) {
            console.error(err);
            alert('Error al cambiar de plan');
        }
    };

    if (loading) return <div>Cargando...</div>;

    // Asumimos que la suscripción activa es la primera o la más reciente
    // Incluir CANCELADA si su fecha de fin es futura (Cancelación diferida)
    const activeSubscription = subscriptions.find(s =>
        s.estado === 'ACTIVA' ||
        (s.estado === 'CANCELADA' && s.fecha_fin && new Date(s.fecha_fin) > new Date())
    );

    // Detección de suscripción en cola para Anti-Stacking
    const queuedSubscription = subscriptions.find(s =>
        s.estado === 'ACTIVA' && s.fecha_inicio && new Date(s.fecha_inicio) > new Date()
    );

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Mi Suscripción</h1>

            {error && <div className="text-red-500 mb-4">{error}</div>}

            {/* Warning Banner for Queued Subscription */}
            {queuedSubscription && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <span className="text-yellow-400">⚠️</span>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                                Tienes un cambio de plan programado para el <strong>{new Date(queuedSubscription.fecha_inicio).toLocaleDateString()}</strong>.
                                <br />
                                No puedes realizar otra compra hasta que ese plan se active.
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
                                className={`px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${queuedSubscription ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => !queuedSubscription && setShowPlans(!showPlans)}
                                disabled={!!queuedSubscription}
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
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                    billingCycle === 'MENSUAL'
                                        ? 'bg-white text-indigo-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Mensual
                            </button>
                            <button
                                onClick={() => setBillingCycle('ANUAL')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                    billingCycle === 'ANUAL'
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
                                    onClick={() => handleSelectPlan(plan)}
                                    className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
                                >
                                    Elegir Plan
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Historial */}
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Historial de Pagos</h2>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Pago</th>
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
                                    {sub.estado}
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
