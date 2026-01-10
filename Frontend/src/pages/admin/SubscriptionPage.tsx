import { useAuth } from '../../context/AuthContext';
import { CheckCircle, Shield, Zap } from 'lucide-react';

export const SubscriptionPage = () => {
    const { user } = useAuth();

    // Mock data based on typical SaaS plans
    const plans = [
        {
            name: 'FREE',
            price: '0 BOB',
            features: ['1 Usuario', '10 Productos', 'Soporte Básico'],
            current: user?.rol === 'PROPIETARIO' && true // Simplification for demo
        },
        {
            name: 'BASICO',
            price: '99 BOB/mes',
            features: ['5 Usuarios', '50 Productos', 'Reportes Básicos', 'Soporte Email'],
            current: true // Assume everyone is on BASICO for now based on seed
        },
        {
            name: 'PREMIUM',
            price: '199 BOB/mes',
            features: ['Usuarios Ilimitados', 'Productos Ilimitados', 'Reportes Avanzados', 'Soporte Prioritario 24/7'],
            current: false
        }
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Mi Suscripción</h1>
            <p className="text-gray-600">Gestiona el plan de tu empresa y aumenta tus límites.</p>

            <div className="grid md:grid-cols-3 gap-6 mt-8">
                {plans.map((plan) => (
                    <div
                        key={plan.name}
                        className={`bg-white rounded-lg shadow-md p-6 border-2 ${plan.current ? 'border-indigo-500 relative' : 'border-transparent'}`}
                    >
                        {plan.current && (
                            <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                                PLAN ACTUAL
                            </div>
                        )}
                        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-50 text-indigo-600 mb-4">
                            {plan.name === 'FREE' ? <Shield /> : plan.name === 'BASICO' ? <CheckCircle /> : <Zap />}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                        <p className="text-2xl font-bold text-gray-900 mt-2">{plan.price}</p>

                        <ul className="mt-6 space-y-4">
                            {plan.features.map((feature, index) => (
                                <li key={index} className="flex items-center text-gray-600">
                                    <CheckCircle size={16} className="text-green-500 mr-2" />
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <button
                            disabled={plan.current}
                            className={`mt-8 w-full py-2 px-4 rounded-md font-medium transition-colors ${
                                plan.current
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                            }`}
                        >
                            {plan.current ? 'Activado' : 'Cambiar Plan'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
