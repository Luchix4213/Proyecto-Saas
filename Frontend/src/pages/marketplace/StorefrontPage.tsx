import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { tenantsService, type Tenant } from '../../services/tenantsService';
import { productsService, type Product } from '../../services/productsService';
import { type Category } from '../../services/categoriesService';
import {
    ShoppingBag, Star, MapPin, Clock, Phone, Mail, ArrowLeft,
    Package, Search, Filter, Share2, Info
} from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { CartDrawer } from '../../components/marketplace/CartDrawer';
import { StorefrontProductCard } from '../../components/marketplace/StorefrontProductCard';


export const StorefrontPage = () => {
    const { slug } = useParams<{ slug: string }>();
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const { addItem, getItemCount } = useCartStore();

    useEffect(() => {
        if (slug) {
            loadStoreData(slug);
        }
    }, [slug]);

    const loadStoreData = async (tenantSlug: string) => {
        setLoading(true);
        setError(null);
        try {
            const tenantData = await tenantsService.getBySlug(tenantSlug);
            setTenant(tenantData);

            const productsData = await productsService.getStoreProducts(tenantSlug);
            setProducts(productsData);

        } catch (err) {
            console.error('Error loading store:', err);
            setError('No pudimos cargar la tienda. Verifique la dirección o intente más tarde.');
        } finally {
            setLoading(false);
        }
    };

    // Extract unique categories from products
    const categories = Array.from(new Set(products.map(p => JSON.stringify(p.categoria)))).map(c => JSON.parse(c) as Category).filter(Boolean);

    const filteredProducts = products.filter(p => {
        const matchesCategory = activeCategory ? p.categoria_id === activeCategory : true;
        const matchesSearch = p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.descripcion?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white gap-6">
                <div className="relative">
                    <div className="h-16 w-16 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Store className="text-teal-500 h-6 w-6" />
                    </div>
                </div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Preparando tu tienda favorita...</p>
            </div>
        );
    }

    if (error || !tenant) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 text-center">
                <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6 text-red-500">
                    <StoreOff size={48} />
                </div>
                <h2 className="text-3xl font-extrabold text-slate-800 mb-2 tracking-tight">Tienda no encontrada</h2>
                <p className="text-slate-500 max-w-sm mb-8">{error || 'La tienda que buscas no existe o se encuentra desactivada temporalmente.'}</p>
                <Link to="/" className="inline-flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10">
                    <ArrowLeft size={18} /> Volver al Mercado
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-slate-50/50 min-h-screen pb-40 animate-fade-in">
            {/* Store Profile Header */}
            <div className="relative bg-white overflow-hidden">
                {/* Banner */}
                <div className="h-[20rem] relative">
                    {tenant.banner_url ? (
                        <img src={tenant.banner_url} alt="Banner" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                        </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent"></div>

                    {/* Top Actions */}
                    <div className="absolute top-6 left-6 flex gap-4">
                        <Link to="/" className="p-3 bg-white/10 backdrop-blur-md rounded-2xl text-white border border-white/20 hover:bg-white/20 transition-all">
                            <ArrowLeft size={20} />
                        </Link>
                    </div>
                    <div className="absolute top-6 right-6">
                        <button className="p-3 bg-white/10 backdrop-blur-md rounded-2xl text-white border border-white/20 hover:bg-white/20 transition-all">
                            <Share2 size={20} />
                        </button>
                    </div>
                </div>

                {/* Identity Bar */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 -mt-24 pb-8">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl p-6 md:p-10 border border-slate-100 flex flex-col md:flex-row items-center md:items-end gap-8 overflow-hidden relative">
                        {/* Glass Background Elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>

                        <div className="h-40 w-40 rounded-[2rem] bg-white p-2 shadow-2xl ring-8 ring-slate-50 flex-shrink-0 relative group">
                            {tenant.logo_url ? (
                                <img
                                    src={`http://localhost:3000${tenant.logo_url}`}
                                    alt="Logo"
                                    className="w-full h-full object-contain rounded-[1.5rem]"
                                    onError={(e) => {
                                        const img = e.target as HTMLImageElement;
                                        img.classList.add('hidden');
                                        img.nextElementSibling?.classList.remove('hidden');
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full bg-teal-50 rounded-[1.5rem] flex items-center justify-center text-teal-600 font-bold text-5xl">
                                    {tenant.nombre_empresa.substring(0, 1)}
                                </div>
                            )}
                            <div className="hidden absolute inset-2 w-full h-full bg-teal-50 rounded-[1.5rem] items-center justify-center text-teal-600 font-bold text-5xl">
                                {tenant.nombre_empresa.substring(0, 1)}
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                <div>
                                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-none mb-4">{tenant.nombre_empresa}</h1>
                                    <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
                                        <div className="flex items-center gap-1.5 text-amber-500 bg-amber-50 px-3 py-1.5 rounded-full ring-1 ring-amber-100">
                                            <Star size={16} fill="currentColor" />
                                            <span className="font-bold text-sm">4.8 (85 reseñas)</span>
                                        </div>
                                        <div className="flex gap-2">
                                            {tenant.rubros?.map((r: any) => (
                                                <span key={r.rubro_id || r.nombre} className="text-xs text-slate-500 font-bold uppercase tracking-wider bg-slate-100 px-3 py-1.5 rounded-full">
                                                    {r.nombre || 'Comercio'}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center lg:items-end gap-3 px-6 py-4 bg-slate-50 rounded-3xl border border-slate-100">
                                    <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                                        <MapPin size={16} className="text-teal-500" />
                                        <span>{tenant.direccion || 'Ubicación central'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                                        <Clock size={16} className="text-teal-500" />
                                        <span>{tenant.horario_atencion || 'Lun-Vie: 09:00 - 18:00'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Marketplace Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">

                {/* Search & Actions Bar */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={20} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={`¿Qué buscas en ${tenant.nombre_empresa}?`}
                            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                        />
                    </div>
                    <button className="px-6 py-4 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm flex items-center justify-center gap-2 font-bold text-slate-700 hover:bg-slate-50 transition-all active:scale-95">
                        <Filter size={20} />
                        Filtros
                    </button>
                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="px-6 py-4 bg-slate-900 text-white rounded-[1.5rem] shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2 font-bold hover:bg-slate-800 transition-all active:scale-95 relative"
                    >
                        <ShoppingBag size={20} />
                        Ver Pedido
                        {getItemCount() > 0 && (
                            <span className="absolute -top-2 -right-2 h-6 w-6 bg-teal-500 text-white text-[10px] font-black rounded-full flex items-center justify-center ring-4 ring-slate-50">
                                {getItemCount()}
                            </span>
                        )}
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* Navigation Sidebar */}
                    <aside className="lg:col-span-3 space-y-8">
                        <div>
                            <h3 className="font-extrabold text-slate-900 mb-6 flex items-center gap-2 px-4 uppercase tracking-[0.2em] text-xs">
                                <Package size={16} className="text-teal-500" /> Navegación
                            </h3>
                            <nav className="space-y-2">
                                <button
                                    onClick={() => setActiveCategory(null)}
                                    className={`w-full text-left px-5 py-3.5 rounded-2xl text-sm font-bold transition-all flex items-center justify-between group ${activeCategory === null
                                        ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-500/30'
                                        : 'text-slate-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100'
                                        }`}
                                >
                                    <span>Todo el catálogo</span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeCategory === null ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
                                        {products.length}
                                    </span>
                                </button>
                                {categories.map(cat => {
                                    const count = products.filter(p => p.categoria_id === cat.categoria_id).length;
                                    return (
                                        <button
                                            key={cat.categoria_id}
                                            onClick={() => setActiveCategory(cat.categoria_id)}
                                            className={`w-full text-left px-5 py-3.5 rounded-2xl text-sm font-bold transition-all flex items-center justify-between group ${activeCategory === cat.categoria_id
                                                ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-500/30'
                                                : 'text-slate-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100'
                                                }`}
                                        >
                                            <span className="truncate">{cat.nombre}</span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeCategory === cat.categoria_id ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
                                                {count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* Enhanced Contact Info */}
                        <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
                            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Info size={18} className="text-teal-500" /> Más Información
                            </h3>
                            <div className="space-y-6">
                                {tenant.telefono && (
                                    <div className="group cursor-pointer">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">WhatsApp</p>
                                        <div className="flex items-center gap-3 text-slate-700 font-bold group-hover:text-teal-600 transition-colors">
                                            <Phone size={18} />
                                            <span>{tenant.telefono}</span>
                                        </div>
                                    </div>
                                )}
                                {tenant.email && (
                                    <div className="group cursor-pointer">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Email Directo</p>
                                        <div className="flex items-center gap-3 text-slate-700 font-bold group-hover:text-teal-600 transition-colors">
                                            <Mail size={18} />
                                            <span className="break-all">{tenant.email}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </aside>

                    {/* Catalog Grid */}
                    <div className="lg:col-span-9">
                        <div className="mb-6 flex items-center justify-between px-4">
                            <h4 className="text-lg font-bold text-slate-800">
                                {activeCategory ? categories.find(c => c.categoria_id === activeCategory)?.nombre : 'Catálogo General'}
                            </h4>
                            <p className="text-sm text-slate-400 font-medium">{filteredProducts.length} productos disponibles</p>
                        </div>

                        {filteredProducts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-300">
                                    <Search size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">No encontramos coincidencias</h3>
                                <p className="text-slate-500 max-w-sm text-center">Intenta ajustar tus filtros de búsqueda para ver más productos.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                                {filteredProducts.map((product, idx) => (
                                    <StorefrontProductCard
                                        key={product.producto_id}
                                        product={product}
                                        tenant={tenant}
                                        onAddToCart={addItem}
                                        animationDelay={idx * 0.05}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Cart Drawer */}
            {tenant && (
                <CartDrawer
                    isOpen={isCartOpen}
                    onClose={() => setIsCartOpen(false)}
                    tenant={tenant}
                />
            )}
        </div>
    );
};

// SVG components to fix visual errors
const Store = ({ className, size = 24 }: { className?: string; size?: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" /><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" /><path d="M2 7h20" /><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7" />
    </svg>
);

const StoreOff = ({ className, size = 24 }: { className?: string; size?: number }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M2.97 12.96A9.09 9.09 0 0 0 9 13a9 9 0 0 1 9 9" />
        <path d="m2 2 20 20" />
        <path d="M20 7.4A9 9 0 0 0 12 4a9 9 0 0 0-5 2.6" />
        <path d="M9.41 11a4.94 4.94 0 0 1 1-1" />
    </svg>
);
