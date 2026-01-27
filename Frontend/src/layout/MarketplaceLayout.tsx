import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Search, User, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { useCartStore } from '../store/useCartStore';
import { CartDrawer } from '../components/marketplace/CartDrawer';

export const MarketplaceLayout = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    // const { slug } = useParams(); // Unused<{ slug: string }>(); // Context awareness
    const [searchTerm, setSearchTerm] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Global Cart State
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { getItemCount } = useCartStore();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/?search=${encodeURIComponent(searchTerm)}`);
            setIsMobileMenuOpen(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center gap-8">

                    {/* 1. Logo */}
                    <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
                        <div className="h-10 w-10 bg-gradient-to-tr from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:scale-105 transition-transform">
                            K
                        </div>
                        <span className="text-xl font-bold text-slate-800 tracking-tight hidden sm:block">Kipu<span className="text-teal-600">Market</span></span>
                    </Link>

                    {/* 2. Navigation (Desktop) */}
                    <nav className="hidden md:flex items-center gap-6">
                        <Link to="/" className="text-sm font-bold text-slate-600 hover:text-teal-600 transition-colors">
                            Inicio
                        </Link>
                        <Link to="/stores" className="text-sm font-bold text-slate-600 hover:text-teal-600 transition-colors">
                            Tiendas
                        </Link>
                        <Link to="/productos-global" className="text-sm font-bold text-slate-600 hover:text-teal-600 transition-colors">
                            Productos
                        </Link>
                    </nav>

                    {/* 3. Search Bar (Flexible) */}
                    <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-auto hidden md:flex relative group">
                        <input
                            type="text"
                            placeholder="Buscar en Kipu..."
                            className="w-full pl-11 pr-4 py-3 bg-slate-100 border-2 border-transparent rounded-2xl text-slate-700 placeholder-slate-400 focus:bg-white focus:border-teal-500 focus:outline-none transition-all font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={20} />
                    </form>

                    {/* 4. Actions (Cart & Auth) */}
                    <div className="flex items-center gap-3 ml-auto">

                        {/* Search Toggle (Mobile) */}
                        <button
                            className="md:hidden p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <Search size={22} />
                        </button>

                        {/* Cart Trigger */}
                        <button
                            className="relative p-2.5 text-slate-700 hover:bg-slate-100 hover:text-teal-600 rounded-xl transition-all group"
                            onClick={() => setIsCartOpen(true)}
                        >
                            <ShoppingBag size={22} />
                            {getItemCount() > 0 && (
                                <span className="absolute top-1.5 right-1.5 h-4 min-w-[16px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                                    {getItemCount()}
                                </span>
                            )}
                        </button>

                        <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

                        {user ? (
                            <Link to={user.rol === 'ADMIN' ? '/admin/dashboard' : '/app/dashboard'} className="hidden sm:flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-teal-600 transition-colors">
                                <div className="h-10 w-10 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center border border-teal-100">
                                    <User size={20} />
                                </div>
                            </Link>
                        ) : (
                            <div className="hidden sm:flex items-center gap-3">
                                <Link to="/login" className="px-5 py-2.5 text-slate-700 font-bold hover:bg-slate-50 rounded-xl transition-colors text-sm">
                                    Ingresar
                                </Link>
                                <Link to="/register" className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all hover:shadow-lg shadow-slate-900/20">
                                    Vender
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div className="absolute top-20 left-0 w-full bg-white border-b border-slate-200 p-4 md:hidden shadow-xl animate-fade-in z-40">
                        <form onSubmit={handleSearch} className="relative group mb-4">
                            <input
                                type="text"
                                placeholder="¿Qué estás buscando?"
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-slate-700 placeholder-slate-400 focus:bg-white focus:border-teal-500 focus:outline-none transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        </form>
                        <nav className="flex flex-col gap-2">
                            <Link to="/" className="py-3 px-4 text-slate-600 font-bold hover:bg-slate-50 rounded-xl" onClick={() => setIsMobileMenuOpen(false)}>
                                Inicio
                            </Link>
                            <Link to="/stores" className="py-3 px-4 text-slate-600 font-bold hover:bg-slate-50 rounded-xl" onClick={() => setIsMobileMenuOpen(false)}>
                                Tiendas
                            </Link>
                            <Link to="/productos-global" className="py-3 px-4 text-slate-600 font-bold hover:bg-slate-50 rounded-xl" onClick={() => setIsMobileMenuOpen(false)}>
                                Productos
                            </Link>
                            {!user && (
                                <div className="pt-4 border-t border-slate-100 mt-2 flex flex-col gap-2">
                                    <Link to="/login" className="py-3 px-4 text-slate-600 font-bold hover:bg-slate-50 rounded-xl" onClick={() => setIsMobileMenuOpen(false)}>
                                        Ingresar a mi cuenta
                                    </Link>
                                    <Link to="/register" className="py-3 px-4 bg-teal-50 text-teal-700 font-bold rounded-xl text-center" onClick={() => setIsMobileMenuOpen(false)}>
                                        Registrar mi Negocio
                                    </Link>
                                </div>
                            )}
                        </nav>
                    </div>
                )}
            </header>

            {/* Global Cart Drawer - Context Aware */}
            <CartDrawer
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
            />

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
