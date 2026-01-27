import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, CreditCard, Building2, Menu, Bell, User, Package, Tag, Truck, ShoppingCart, ShoppingBag, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { tenantsService } from '../services/tenantsService';

export const OwnerLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [companyName, setCompanyName] = useState<string>('');
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const fetchTenantInfo = async () => {
            if (user?.tenant_id) {
                try {
                    const tenant = await tenantsService.getById(user.tenant_id);
                    setCompanyName(tenant.nombre_empresa);

                    // Fetch notifications
                    await fetchUnreadCount();
                } catch (error) {
                    console.error('Error fetching tenant info:', error);
                }
            }
        };

        fetchTenantInfo();
    }, [user, location.pathname]); // Re-fetch on navigation

    const fetchUnreadCount = async () => {
        try {
            // We could optimize this by adding a specific endpoint for count, but getAll is fine for now
            const { notificationsService } = await import('../services/notificationsService');
            const data = await notificationsService.getAll();
            setUnreadCount(data.filter((n: any) => !n.leida).length);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const isActive = (path: string) => location.pathname === path;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const NavLink = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
        <Link
            to={to}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${isActive(to)
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/20'
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
            <aside className={`bg-slate-900 shadow-xl flex flex-col transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} z-30`}>
                <div className="p-6 border-b border-slate-800 flex items-center justify-between h-16">
                    {isSidebarOpen ? (
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 bg-gradient-to-tr from-teal-400 to-emerald-400 rounded-lg flex items-center justify-center text-white font-bold text-lg">K</div>
                            <div>
                                <h1 className="text-xl font-bold text-white tracking-tight">Kipu</h1>
                            </div>
                        </div>
                    ) : (
                        <div className="h-8 w-8 mx-auto bg-gradient-to-tr from-teal-400 to-emerald-400 rounded-lg flex items-center justify-center text-white font-bold text-lg">K</div>
                    )}
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                    <NavLink to="/dashboard" icon={LayoutDashboard} label={isSidebarOpen ? 'Dashboard' : ''} />

                    <div className={`px-4 mt-6 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider ${!isSidebarOpen && 'hidden'}`}>
                        Gestión
                    </div>
                    <NavLink to="/mi-empresa" icon={Building2} label={isSidebarOpen ? 'Mi Empresa' : ''} />
                    <NavLink to="/usuarios" icon={Users} label={isSidebarOpen ? 'Usuarios' : ''} />
                    <NavLink to="/categorias" icon={Tag} label={isSidebarOpen ? 'Categorías' : ''} />
                    <NavLink to="/productos" icon={Package} label={isSidebarOpen ? 'Productos' : ''} />
                    <NavLink to="/proveedores" icon={Truck} label={isSidebarOpen ? 'Proveedores' : ''} />
                    <NavLink to="/compras" icon={ShoppingBag} label={isSidebarOpen ? 'Compras (Stock)' : ''} />
                    <NavLink to="/suscripcion" icon={CreditCard} label={isSidebarOpen ? 'Suscripción' : ''} />

                    <div className={`px-4 mt-6 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider ${!isSidebarOpen && 'hidden'}`}>
                        Operaciones
                    </div>
                    <NavLink to="/pos" icon={ShoppingCart} label={isSidebarOpen ? 'Punto de Venta' : ''} />
                    <NavLink to="/clientes" icon={Users} label={isSidebarOpen ? 'Clientes' : ''} />

                    <NavLink to="/ventas-online" icon={Globe} label={isSidebarOpen ? 'Ventas Online' : ''} />
                    <NavLink to="/ventas/historial" icon={ShoppingBag} label={isSidebarOpen ? 'Historial de Ventas' : ''} />

                    <div className="border-t border-slate-800 my-2 pt-2">
                        <NavLink to="/profile" icon={User} label={isSidebarOpen ? 'Mi Perfil' : ''} />
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
                <header className="h-16 bg-gradient-to-r from-teal-600 to-emerald-500 shadow-md flex items-center justify-between px-6 z-10">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 rounded-lg text-white/80 hover:bg-white/10 transition-colors"
                        >
                            <Menu size={20} />
                        </button>
                        <h2 className="text-white font-semibold text-lg hidden sm:block">
                            Panel de Control {companyName && `de ${companyName}`}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Link to="/notificaciones" className="p-2 rounded-full text-white/80 hover:bg-white/10 transition-colors relative block">
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-400 rounded-full border border-teal-600 animate-pulse"></span>
                                )}
                            </Link>
                        </div>

                        <Link to="/profile" className="flex items-center gap-3 pl-4 border-l border-white/20 hover:opacity-80 transition-opacity">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold text-white">{user?.nombre || 'Usuario'}</p>
                                <p className="text-xs text-teal-100">{user?.rol || 'Propietario'}</p>
                            </div>
                            <div className="h-9 w-9 bg-white/10 rounded-full flex items-center justify-center border border-white/20 text-white">
                                <User size={18} />
                            </div>
                        </Link>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-auto p-6 bg-slate-50 relative">
                    {/* Decorative background element */}
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-teal-600/5 to-emerald-500/5 pointer-events-none"></div>

                    <div className="relative max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};
