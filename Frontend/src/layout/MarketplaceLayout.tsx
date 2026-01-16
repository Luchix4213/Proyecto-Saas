import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Search, User, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export const MarketplaceLayout = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/?search=${encodeURIComponent(searchTerm)}`);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
                        <div className="h-9 w-9 bg-gradient-to-tr from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:scale-105 transition-transform">
                            K
                        </div>
                        <span className="text-xl font-bold text-slate-800 tracking-tight">Kipu<span className="text-teal-600">Market</span></span>
                    </Link>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden md:flex relative group">
                        <input
                            type="text"
                            placeholder="Buscar productos, farmacias, tiendas..."
                            className="w-full pl-11 pr-4 py-2.5 bg-slate-100 border-2 border-slate-100 rounded-full text-slate-700 placeholder-slate-400 focus:bg-white focus:border-teal-500 focus:outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={20} />
                        <button type="submit" className="hidden">Buscar</button>
                    </form>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        <button className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-full">
                            <Search size={22} />
                        </button>

                        {user ? (
                            <Link to={user.rol === 'ADMIN' ? '/admin/dashboard' : '/dashboard'} className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-teal-600 transition-colors">
                                <div className="h-9 w-9 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center border border-teal-100">
                                    <User size={18} />
                                </div>
                                <span className="hidden sm:block">Mi Cuenta</span>
                            </Link>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-teal-600 transition-colors hidden sm:block">
                                    Ingresar
                                </Link>
                                <Link to="/register" className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-full text-sm font-bold hover:bg-slate-800 transition-all hover:-translate-y-0.5 shadow-lg shadow-slate-900/20">
                                    <LogIn size={16} />
                                    <span>Vender aquí</span>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                     <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="col-span-1 md:col-span-1">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="h-8 w-8 bg-gradient-to-tr from-teal-500 to-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                                    K
                                </div>
                                <span className="text-xl font-bold text-slate-800">Kipu</span>
                            </div>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                La plataforma líder para microempresas en Bolivia. Crea tu tienda online en minutos.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 mb-4">Plataforma</h4>
                            <ul className="space-y-2 text-sm text-slate-500">
                                <li><Link to="/" className="hover:text-teal-600">Inicio</Link></li>
                                <li><Link to="/register" className="hover:text-teal-600">Vender</Link></li>
                                <li><Link to="/login" className="hover:text-teal-600">Ingresar</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm text-slate-500">
                                <li><a href="#" className="hover:text-teal-600">Términos y Condiciones</a></li>
                                <li><a href="#" className="hover:text-teal-600">Privacidad</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 mb-4">Contacto</h4>
                            <p className="text-slate-500 text-sm">soporte@kipu.bo</p>
                            <p className="text-slate-500 text-sm">+591 70000000</p>
                        </div>
                     </div>
                     <div className="mt-12 pt-8 border-t border-slate-100 text-center text-sm text-slate-400">
                        &copy; {new Date().getFullYear()} Kipu SaaS. Todos los derechos reservados.
                     </div>
                </div>
            </footer>
        </div>
    );
};
