import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, CreditCard, Building2, Menu, Bell, User, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

export const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const { notificationsService } = await import('../services/notificationsService');
                const data = await notificationsService.getAll();
                setUnreadCount(data.filter((n: any) => !n.leida).length);
            } catch (error) {
                console.error('Error fetching admin notifications:', error);
            }
        };

        fetchNotifications();
    }, [location.pathname]); // Re-fetch on navigation

    const isActive = (path: string) => location.pathname === path;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const NavLink = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
        <Link
            to={to}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${isActive(to)
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
        >
            <Icon size={20} className={isActive(to) ? 'text-white' : 'text-slate-400 group-hover:text-white transition-colors'} />
            <span className="font-medium">{label}</span>
        </Link>
    );

    return (
        <div className="flex h-screen bg-slate-100 font-sans">
            {/* Sidebar */}
            <aside className={`bg-slate-900 shadow-xl flex flex-col transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} z-20`}>
                <div className="p-6 border-b border-slate-800 flex items-center justify-between h-16">
                    {isSidebarOpen ? (
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">A</div>
                            <div>
                                <h1 className="text-xl font-bold text-white tracking-tight">Kipu Admin</h1>
                            </div>
                        </div>
                    ) : (
                        <div className="h-8 w-8 mx-auto bg-gradient-to-tr from-amber-500 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">A</div>
                    )}
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                    <NavLink to="/admin/dashboard" icon={LayoutDashboard} label={isSidebarOpen ? 'Dashboard' : ''} />

                    <div className={`px-4 mt-6 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider ${!isSidebarOpen && 'hidden'}`}>
                        Administración
                    </div>
                    <NavLink to="/admin/tenants" icon={Building2} label={isSidebarOpen ? 'Microempresas' : ''} />
                    <NavLink to="/admin/clientes" icon={Users} label={isSidebarOpen ? 'Clientes Globales' : ''} />
                    <NavLink to="/admin/rubros" icon={Tag} label={isSidebarOpen ? 'Rubros' : ''} />
                    <NavLink to="/admin/suscripciones" icon={CreditCard} label={isSidebarOpen ? 'Suscripciones' : ''} />
                    <NavLink to="/admin/usuarios" icon={Users} label={isSidebarOpen ? 'Administradores' : ''} />
                    <NavLink to="/admin/planes" icon={CreditCard} label={isSidebarOpen ? 'Planes' : ''} />
                    <div className="border-t border-slate-800 my-2 pt-2">
                        <NavLink to="/admin/profile" icon={User} label={isSidebarOpen ? 'Mi Perfil' : ''} />
                    </div>
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className={`flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors duration-200 group ${!isSidebarOpen && 'justify-center'}`}
                    >
                        <LogOut size={20} className="group-hover:text-red-400 transition-colors" />
                        {isSidebarOpen && <span className="font-medium">Cerrar Sesión</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white shadow-sm border-b border-slate-200 flex items-center justify-between px-6 z-10">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                        >
                            <Menu size={20} />
                        </button>
                        <h2 className="text-slate-800 font-semibold text-lg hidden sm:block">
                            Portal Administrativo
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Link to="/admin/notificaciones" className="p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors relative block">
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border border-white animate-pulse"></span>
                                )}
                            </Link>
                        </div>

                        <Link to="/admin/profile" className="flex items-center gap-3 pl-4 border-l border-slate-200 hover:opacity-80 transition-opacity">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold text-slate-800">{user?.nombre || 'Admin'}</p>
                                <p className="text-xs text-slate-500">Super Admin</p>
                            </div>
                            <div className="h-9 w-9 bg-amber-100 rounded-full flex items-center justify-center border border-amber-200 text-amber-700">
                                <User size={18} />
                            </div>
                        </Link>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-auto p-6 bg-slate-50 relative">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};
