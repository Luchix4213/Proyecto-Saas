import { useAuth } from '../../context/AuthContext';
import { Users, UserPlus, ShoppingBag, Settings, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const OwnerDashboardPage = () => {
    const { user } = useAuth();

    // Quick Actions Data
    const quickActions = [
        {
            title: 'Gestionar Clientes',
            description: 'Ver y administrar cartera',
            icon: ShoppingBag,
            to: '/clientes',
            color: 'bg-blue-50 text-blue-600',
            hover: 'hover:border-blue-200'
        },
        {
            title: 'Mi Equipo',
            description: 'Administrar usuarios y permisos',
            icon: Users,
            to: '/usuarios',
            color: 'bg-indigo-50 text-indigo-600',
            hover: 'hover:border-indigo-200'
        },
        {
            title: 'Suscripción',
            description: 'Ver plan actual y facturación',
            icon: Settings,
            to: '/suscripcion',
            color: 'bg-teal-50 text-teal-600',
            hover: 'hover:border-teal-200'
        }
    ];

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-teal-900 to-emerald-900 p-8 md:p-12 shadow-2xl">
                {/* Decorative Blobs */}
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>

                <div className="relative z-10 text-white">
                    <span className="inline-block py-1 px-3 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold mb-4 border border-white/20">
                        Panel de Control
                    </span>
                    <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                        ¡Hola, {user?.nombre || 'Usuario'}! 👋
                    </h1>
                    <p className="text-slate-200 text-lg max-w-xl leading-relaxed">
                        Bienvenido a Kipu. Aquí tienes un resumen de tu negocio y accesos rápidos para gestionar tu empresa.
                    </p>

                    <div className="mt-8 flex flex-wrap gap-4">
                        <Link
                            to="/clientes"
                            className="inline-flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-slate-100 transition-colors shadow-lg"
                        >
                            Ver Clientes
                            <ArrowRight size={18} />
                        </Link>
                        <Link
                            to="/suscripcion"
                            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-medium hover:bg-white/20 transition-colors border border-white/10"
                        >
                            Mi Suscripción
                        </Link>
                    </div>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div>
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    Accesos Rápidos
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {quickActions.map((action) => (
                        <Link
                            key={action.title}
                            to={action.to}
                            className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${action.hover} group`}
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${action.color} transition-transform group-hover:scale-110`}>
                                <action.icon size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-1">{action.title}</h3>
                            <p className="text-slate-500 text-sm">{action.description}</p>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Recent Activity or Info Section - Placeholder for now */}
            <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-50 rounded-full mb-4">
                    <ShoppingBag className="text-slate-400" size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Tu negocio está listo</h3>
                <p className="text-slate-500 max-w-md mx-auto mt-2">
                    Comienza a registrar clientes y usuarios para ver estadísticas detalladas aquí.
                </p>
            </div>
        </div>
    );
};
