import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { planesService, type Plan } from '../../services/planesService';
import { tenantsService, type Tenant } from '../../services/tenantsService';
import { CheckCircle, Shield, Zap, X } from 'lucide-react';

export const SubscriptionPage = () => {
    const { user } = useAuth();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<number | null>(null); // Plan ID being processed

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [plansData, tenantData] = await Promise.all([
                planesService.getAll(),
                (user?.rol === 'PROPIETARIO' || user?.rol === 'ADMIN') ? tenantsService.getMyTenant().catch(() => null) : Promise.resolve(null)
            ]);
            setPlans(plansData);
            setCurrentTenant(tenantData);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPlan = async (plan: Plan) => {
        if (!currentTenant) return;

        if (!window.confirm(`¿Estás seguro de cambiar al plan ${plan.nombre_plan}?`)) return;

        setProcessing(plan.plan_id);
        try {
            await tenantsService.updatePlan(currentTenant.tenant_id, plan.nombre_plan);
            alert('Plan actualizado con éxito');
            loadData(); // Reload to reflect changes
        } catch (error) {
            console.error('Error updating plan:', error);
            alert('Error al actualizar el plan');
        } finally {
            setProcessing(null);
        }
    };

    // Helpers
    const getIcon = (planName: string) => {
        const name = planName.toUpperCase();
        if (name.includes('FREE')) return <Shield />;
        if (name.includes('BASICO') || name.includes('BASIC')) return <CheckCircle />;
        return <Zap />;
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Mi Suscripción</h1>
            <p className="text-gray-600">Gestiona el plan de tu empresa y aumenta tus límites.</p>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Cargando planes...</div>
            ) : (
                <div className="grid md:grid-cols-3 gap-6 mt-8">
                    {plans.map((plan) => {
                         const isCurrent = currentTenant?.plan?.nombre_plan === plan.nombre_plan;

                         // Determine if we can select this plan
                         // Only Owners can select (or Admins for testing)
                         // And verify it's not the current plan
                         const canSelect = !isCurrent && user?.rol === 'PROPIETARIO';

                        return (
                        <div
                            key={plan.plan_id}
                            className={`bg-white rounded-lg shadow-md p-6 border-2 flex flex-col transition-all ${isCurrent ? 'border-indigo-500 relative ring-2 ring-indigo-500/20' : 'border-transparent hover:border-gray-200'}`}
                        >
                            {isCurrent && (
                                <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                                    PLAN ACTUAL
                                </div>
                            )}
                            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-50 text-indigo-600 mb-4">
                                {getIcon(plan.nombre_plan)}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 uppercase">{plan.nombre_plan}</h3>
                            <div className="mt-2 mb-4">
                                <span className="text-3xl font-bold text-gray-900">{plan.precio} BOB</span>
                                <span className="text-gray-500 ml-1">/mes</span>
                            </div>

                            <div className="space-y-3 flex-1">
                                <div className="flex items-center text-gray-600">
                                    <CheckCircle size={16} className="text-green-500 mr-2 flex-shrink-0" />
                                    <span>Hasta <strong>{plan.max_usuarios}</strong> usuarios</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <CheckCircle size={16} className="text-green-500 mr-2 flex-shrink-0" />
                                    <span>Hasta <strong>{plan.max_productos}</strong> productos</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    {plan.ventas_online ? (
                                         <CheckCircle size={16} className="text-green-500 mr-2 flex-shrink-0" />
                                    ) : (
                                        <X size={16} className="text-gray-400 mr-2 flex-shrink-0" />
                                    )}
                                    <span className={!plan.ventas_online ? 'text-gray-400' : ''}>Ventas Online</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    {plan.reportes_avanzados ? (
                                         <CheckCircle size={16} className="text-green-500 mr-2 flex-shrink-0" />
                                    ) : (
                                        <X size={16} className="text-gray-400 mr-2 flex-shrink-0" />
                                    )}
                                    <span className={!plan.reportes_avanzados ? 'text-gray-400' : ''}>Reportes Avanzados</span>
                                </div>
                            </div>

                            <button
                                onClick={() => handleSelectPlan(plan)}
                                disabled={isCurrent || !canSelect || processing !== null}
                                className={`mt-8 w-full py-2 px-4 rounded-md font-medium transition-colors ${
                                    isCurrent
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : canSelect
                                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                {processing === plan.plan_id ? 'Procesando...' : (isCurrent ? 'Tu Plan Actual' : 'Seleccionar Plan')}
                            </button>
                        </div>
                    )})}
                </div>
            )}
        </div>
    );
};
