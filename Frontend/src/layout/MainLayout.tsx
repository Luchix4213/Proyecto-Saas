import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut } from 'lucide-react';

export const MainLayout = () => {
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md flex flex-col">
                <div className="p-6 border-b">
                    <h1 className="text-2xl font-bold text-indigo-600">SaaS Taller</h1>
                    <p className="text-sm text-gray-500">Mi Empresa S.R.L</p>
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

                    <Link
                        to="/usuarios"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/usuarios') ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <Users size={20} />
                        Usuarios
                    </Link>
                </nav>

                <div className="p-4 border-t">
                    <button className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
