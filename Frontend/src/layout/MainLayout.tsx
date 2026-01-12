import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, CreditCard, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const MainLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    const isActive = (path: string) => location.pathname === path;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md flex flex-col">
                <div className="p-6 border-b">
                    <h1 className="text-2xl font-bold text-indigo-600 tracking-tight">Kipu</h1>
                    <p className="text-xs text-gray-500">Cuentas claras, negocio que crece</p>
                    <div className="mt-2">
                        <p className="text-sm font-semibold text-gray-900">{user?.nombre || 'Usuario'}</p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${
                            user?.rol === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                            user?.rol === 'PROPIETARIO' ? 'bg-indigo-100 text-indigo-800' :
                            'bg-blue-100 text-blue-800'
                        }`}>
                            {user?.rol}
                        </span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link
                        to="/"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/') ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <LayoutDashboard size={20} />
                        Dashboard
                    </Link>

                    {/* Vistas exclusivas del Propietario (Jefe de Tenant) */}
                    {user?.rol === 'PROPIETARIO' && (
                        <>
                            <Link
                                to="/usuarios"
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/usuarios') ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <Users size={20} />
                                Usuarios
                            </Link>

                            <Link
                                to="/suscripcion"
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/suscripcion') ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <CreditCard size={20} />
                                Suscripción
                            </Link>
                        </>
                    )}

                    {user?.rol === 'ADMIN' && (
                        <>
                            <Link
                                to="/admin"
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin') ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <Building2 size={20} />
                                Microempresas
                            </Link>
                             <Link
                                to="/admin/planes"
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/planes') ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <CreditCard size={20} />
                                Gestión de Planes
                            </Link>
                        </>
                    )}
                </nav>

                <div className="p-4 border-t">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut size={20} />
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-8">
                <Outlet />
            </main>
        </div>
    );
};
