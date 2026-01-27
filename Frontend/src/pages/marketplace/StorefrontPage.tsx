import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { tenantsService, type Tenant } from '../../services/tenantsService';
import { productsService, type Product } from '../../services/productsService';
import { type Category } from '../../services/categoriesService';
import {
    ShoppingBag, Star, MapPin, Clock, Phone, Mail, ArrowLeft,
    Package, Search, Info, RefreshCw
} from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { CartDrawer } from '../../components/marketplace/CartDrawer';
import { StorefrontProductCard } from '../../components/marketplace/StorefrontProductCard';
import { getImageUrl } from '../../utils/imageUtils';


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

    const handleAddToCart = (product: Product) => {
        if (!tenant) return;
        addItem({
            ...product, // Spread original product
            tenant_slug: tenant.slug || String(tenant.tenant_id), // Force explicit slug or ID
            tenant_name: tenant.nombre_empresa,
            tenant: tenant // Pass full tenant just in case
        });
    };

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
            <div className="relative bg-white shadow-xl z-20">
                {/* Banner */}
                <div className="h-[24rem] relative">
                    {tenant.banner_url ? (
                        <div className="absolute inset-0">
                             <img
                                src={getImageUrl(tenant.banner_url)}
                                alt="Banner"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent"></div>
                        </div>
                    ) : (
                        <div className="w-full h-full bg-slate-900 relative overflow-hidden">
                             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                             <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-slate-900 to-teal-900 opacity-80"></div>
                        </div>
                    )}

                    {/* Top Actions */}
                    <div className="absolute top-6 left-6 flex gap-4 z-30">
                        <Link to="/" className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl text-white border border-white/10 hover:bg-white/20 transition-all shadow-lg hover:scale-105 active:scale-95">
                            <ArrowLeft size={20} strokeWidth={2.5} />
                        </Link>
                    </div>
                </div>

                {/* Identity Bar */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 -mt-32 pb-10">
                    <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-6 md:p-10 border border-white/50 flex flex-col md:flex-row items-center md:items-end gap-8 relative overflow-hidden ring-1 ring-slate-900/5">

                        <div className="h-44 w-44 rounded-[2rem] bg-white p-2 shadow-2xl ring-8 ring-white/50 flex-shrink-0 relative group -mt-20 md:mt-0">
                            {tenant.logo_url ? (
                                <img
                                    src={getImageUrl(tenant.logo_url)}
                                    alt="Logo"
                                    className="w-full h-full object-contain rounded-[1.5rem]"
                                />
                            ) : (
                                <div className="w-full h-full bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-slate-400 font-bold text-6xl">
                                    {tenant.nombre_empresa.substring(0, 1)}
                                </div>
                            )}
                        </div>

                        <div className="flex-1 text-center md:text-left w-full">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                <div className="space-y-3">
                                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none drop-shadow-sm">{tenant.nombre_empresa}</h1>
                                    <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
                                        <div className="flex items-center gap-1.5 text-amber-500 bg-amber-50 px-3 py-1.5 rounded-full ring-1 ring-amber-100/50 shadow-sm">
                                            <Star size={16} fill="currentColor" strokeWidth={0} />
                                            <span className="font-bold text-sm text-amber-700">4.8 (85)</span>
                                        </div>
                                        <div className="flex gap-2">
                                            {tenant.rubros?.map((r: any) => (
                                                <span key={r.rubro_id || r.nombre} className="text-xs text-slate-500 font-bold uppercase tracking-wider bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                                                    {r.nombre || 'Comercio'}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 px-6 py-4 bg-slate-50/80 rounded-3xl border border-slate-100 min-w-[280px]">
                                    <div className="flex items-start gap-3 text-slate-600 text-sm font-medium">
                                        <MapPin size={18} className="text-teal-500 shrink-0 mt-0.5" />
                                        <span className="leading-snug">{tenant.direccion || 'Ubicación central'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-600 text-sm font-medium">
                                        <Clock size={18} className="text-teal-500 shrink-0" />
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
                <div className="flex flex-col md:flex-row gap-4 mb-10 sticky top-4 z-40">
                    <div className="flex-1 relative group shadow-2xl shadow-slate-200/50 rounded-[1.5rem]">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={22} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={`¿Qué buscas en ${tenant.nombre_empresa}?`}
                            className="w-full pl-14 pr-4 py-4 bg-white/90 backdrop-blur-xl border border-white/20 rounded-[1.5rem] focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all placeholder:text-slate-400 font-medium text-lg text-slate-700"
                        />
                    </div>
                     <button
                        onClick={() => setIsCartOpen(true)}
                        className="px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3 font-bold hover:bg-slate-800 transition-all active:scale-95 relative group overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative flex items-center gap-3">
                            <ShoppingBag size={22} />
                            Ver Pedido
                            {getItemCount() > 0 && (
                                <span className="bg-white text-slate-900 h-6 min-w-[1.5rem] px-1.5 text-xs font-black rounded-full flex items-center justify-center ring-2 ring-slate-900/20">
                                    {getItemCount()}
                                </span>
                            )}
                        </div>
                    </button>
                    <button
                        onClick={() => loadStoreData(slug!)}
                        className="w-14 h-14 bg-white border border-slate-100 rounded-[1.5rem] shadow-lg flex items-center justify-center text-slate-400 hover:text-teal-600 hover:shadow-xl transition-all active:scale-95 group"
                    >
                        <RefreshCw size={22} className={`transition-transform ${loading ? 'animate-spin' : 'group-hover:rotate-180'}`} />
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

                    {/* Navigation Sidebar */}
                    <aside className="lg:col-span-3 space-y-8 sticky top-32">
                        <div>
                            <h3 className="font-extrabold text-slate-900 mb-4 flex items-center gap-2 px-2 uppercase tracking-[0.2em] text-xs opacity-50">
                                <Package size={14} /> Categorías
                            </h3>
                            <nav className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                                <button
                                    onClick={() => setActiveCategory(null)}
                                    className={`w-full text-left px-5 py-4 rounded-2xl text-sm font-bold transition-all flex items-center justify-between group ${activeCategory === null
                                        ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10 scale-105'
                                        : 'text-slate-600 hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 border border-transparent hover:border-white'
                                        }`}
                                >
                                    <span>Todo el catálogo</span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeCategory === null ? 'bg-white/20' : 'bg-slate-200/50 text-slate-500'}`}>
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
                                                ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-500/30 scale-105'
                                                : 'text-slate-600 hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 border border-transparent hover:border-white'
                                                }`}
                                        >
                                            <span className="truncate">{cat.nombre}</span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeCategory === cat.categoria_id ? 'bg-white/20' : 'bg-slate-200/50 text-slate-500'}`}>
                                                {count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* Enhanced Contact Info */}
                        <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm hidden lg:block">
                            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider opacity-50">
                                <Info size={14} /> Contacto
                            </h3>
                            <div className="space-y-4">
                                {tenant.telefono && (
                                    <div className="group cursor-pointer flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                        <div className="h-10 w-10 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center">
                                             <Phone size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">WhatsApp</p>
                                            <span className="font-bold text-slate-700 text-sm">{tenant.telefono}</span>
                                        </div>
                                    </div>
                                )}
                                {tenant.email && (
                                    <div className="group cursor-pointer flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                        <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
                                             <Mail size={18} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</p>
                                            <span className="font-bold text-slate-700 text-sm truncate block">{tenant.email}</span>
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
                                        onAddToCart={handleAddToCart}
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
