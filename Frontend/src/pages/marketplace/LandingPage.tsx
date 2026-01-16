import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { tenantsService, type Tenant } from '../../services/tenantsService';
import { Store, ArrowRight, Star, ShoppingBag, Zap, ShieldCheck, Globe } from 'lucide-react';

export const LandingPage = () => {
    const [searchParams] = useSearchParams();
    const searchTerm = searchParams.get('search') || '';

    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [searchTerm]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const tenantsData = await tenantsService.getMarketplace();
            setTenants(tenantsData);
        } catch (error) {
            console.error('Error fetching marketplace data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white min-h-screen">
            {/* Hero Section */}
            {!searchTerm && (
                <section className="relative min-h-[85vh] flex items-center pt-20 pb-16 overflow-hidden bg-slate-950">
                    {/* Atmospheric Background */}
                    <div className="absolute top-0 left-0 w-full h-full">
                        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-teal-500/10 rounded-full blur-[120px] animate-pulse"></div>
                        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                    </div>

                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
                        <div className="animate-fade-in-up">
                            <div className="inline-flex items-center gap-2 py-1.5 px-3 rounded-full bg-teal-500/10 text-teal-400 text-xs font-bold mb-8 border border-teal-500/20 uppercase tracking-widest">
                                <Zap size={14} fill="currentColor" />
                                Plataforma #1 en Bolivia
                            </div>
                            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-8">
                                Impulsa tu Negocio al <br/>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400">
                                    Siguiente Nivel.
                                </span>
                            </h1>
                            <p className="text-xl text-slate-400 mb-10 leading-relaxed max-w-xl">
                                Kipu es el ecosistema digital donde las mejores marcas locales conectan con miles de clientes. Crea tu tienda profesional en minutos.
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <Link to="/register" className="group relative overflow-hidden px-8 py-4 bg-teal-500 text-white rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-teal-500/40 text-lg flex items-center gap-2">
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                                    Empezar Gratis
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <a href="#stores" className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-bold transition-all backdrop-blur-md flex items-center gap-2">
                                    Explorar Tiendas
                                </a>
                            </div>

                            {/* Trust Badge */}
                            <div className="mt-12 flex items-center gap-6 pt-12 border-t border-white/5 grayscale opacity-50">
                                <span className="text-white font-bold text-sm tracking-widest uppercase">Trusted By</span>
                                <div className="flex gap-8">
                                    <Globe className="text-white" size={24} />
                                    <ShieldCheck className="text-white" size={24} />
                                    <Store className="text-white" size={24} />
                                </div>
                            </div>
                        </div>

                        {/* Hero Image/Card Visual */}
                        <div className="hidden lg:block relative animate-fade-in" style={{ animationDelay: '0.3s' }}>
                            <div className="relative z-10 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl p-4 rounded-[2.5rem] border border-white/10 shadow-2xl">
                                 <img
                                    src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80"
                                    alt="Dashboard Preview"
                                    className="rounded-[2rem] shadow-2xl border border-white/5"
                                />
                                {/* Floating elements */}
                                <div className="absolute -top-6 -right-6 bg-white p-4 rounded-2xl shadow-2xl animate-bounce-slow">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                                            <ShoppingBag size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Venta Reciente</p>
                                            <p className="text-sm font-bold text-slate-800">+120.00 Bs</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-teal-500/20 rounded-full blur-[100px] -z-10"></div>
                        </div>
                    </div>
                </section>
            )}

            {/* Results Section */}
            <section id="stores" className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${searchTerm ? 'pt-24' : 'py-24'}`}>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-slate-900 text-white rounded-xl">
                                <Store size={24} />
                            </div>
                            {searchTerm ? `Resultados para "${searchTerm}"` : 'Directorio de Tiendas'}
                        </h2>
                        <p className="text-slate-500 mt-2 text-lg">
                            {searchTerm ? 'Explora las mejores opciones que coinciden con tu búsqueda.' : 'Descubre y apoya a las microempresas más destacadas de la región.'}
                        </p>
                    </div>
                    {!searchTerm && (
                        <Link to="/stores" className="group text-teal-600 font-bold hover:text-teal-700 flex items-center gap-2 bg-teal-50 px-5 py-2.5 rounded-xl transition-all">
                            Ver catálogo completo
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    )}
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
                        <p className="text-slate-400 font-medium">Sincronizando con el mercado...</p>
                    </div>
                ) : tenants.length === 0 ? (
                    <div className="text-center py-24 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                         <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6 text-slate-300">
                            <Store size={40} />
                         </div>
                         <h3 className="text-xl font-bold text-slate-800 mb-2">No encontramos lo que buscas</h3>
                         <p className="text-slate-500 max-w-sm mx-auto">Prueba con otros términos o explora nuestras categorías destacadas.</p>
                         <button onClick={() => fetchData()} className="mt-8 text-teal-600 font-bold hover:underline">Recargar tiendas</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                        {tenants.map((tenant, idx) => (
                            <Link
                                key={tenant.tenant_id}
                                to={`/tienda/${tenant.slug || tenant.tenant_id}`}
                                className="group bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2 flex flex-col h-full animate-fade-in-up"
                                style={{ animationDelay: `${idx * 0.1}s` }}
                            >
                                {/* Banner Visual */}
                                <div className="h-44 bg-slate-100 relative overflow-hidden">
                                     {tenant.banner_url ? (
                                        <img src={tenant.banner_url} alt="Cover" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                     ) : (
                                        <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-100 group-hover:from-teal-100 group-hover:to-teal-50 transition-colors duration-500"></div>
                                     )}

                                     {/* Floating Logo */}
                                     <div className="absolute -bottom-6 left-8">
                                         <div className="h-20 w-20 rounded-2xl bg-white p-1.5 shadow-2xl border-4 border-white group-hover:border-teal-50 transition-colors">
                                             {tenant.logo_url ? (
                                                 <img
                                                    src={`http://localhost:3000${tenant.logo_url}`}
                                                    className="w-full h-full object-contain rounded-xl bg-white"
                                                    alt="Logo"
                                                    onError={(e) => {
                                                        const img = e.target as HTMLImageElement;
                                                        img.classList.add('hidden');
                                                        img.nextElementSibling?.classList.remove('hidden');
                                                    }}
                                                 />
                                             ) : (
                                                <div className="w-full h-full bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 font-bold text-2xl">
                                                    {tenant.nombre_empresa.substring(0,1)}
                                                </div>
                                             )}
                                             <div className="hidden w-full h-full bg-teal-50 rounded-xl items-center justify-center text-teal-600 font-bold text-2xl">
                                                {tenant.nombre_empresa.substring(0,1)}
                                             </div>
                                         </div>
                                     </div>
                                </div>

                                <div className="p-8 pt-10 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 group-hover:text-teal-600 transition-colors line-clamp-1">{tenant.nombre_empresa}</h3>
                                            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold mt-1 uppercase tracking-wider">
                                                <Star size={14} className="text-amber-400" fill="currentColor" />
                                                <span>4.8 (120 reseñas)</span>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-slate-500 text-sm mb-6 line-clamp-2 leading-relaxed h-10">{tenant.direccion || '📍 Ubicación central'}</p>

                                    <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-50">
                                        <div className="flex flex-wrap gap-2">
                                            {Array.isArray(tenant.rubros) && tenant.rubros.slice(0, 2).map((r: any) => (
                                                <span key={r.rubro_id || r} className="px-3 py-1 bg-slate-100 group-hover:bg-teal-50 text-slate-600 group-hover:text-teal-600 text-[10px] font-bold rounded-lg uppercase tracking-wide transition-colors">
                                                    {r.nombre || 'Comercio'}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="h-10 w-10 rounded-full bg-slate-900 group-hover:bg-teal-500 text-white flex items-center justify-center transition-all group-hover:rotate-45 shadow-lg shadow-slate-900/10">
                                            <ArrowRight size={18} />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* CTA Section */}
            {!searchTerm && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pb-40">
                    <div className="relative rounded-[3rem] overflow-hidden bg-slate-900 p-12 md:p-20 text-center">
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-purple-500/20"></div>
                        <div className="relative z-10 max-w-2xl mx-auto">
                            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">¿Listo para digitalizar tu negocio?</h2>
                            <p className="text-slate-300 text-lg mb-10 leading-relaxed">Únete a la plataforma que está transformando el comercio local en Bolivia. Gestión de inventarios, pagos y ventas en un solo lugar.</p>
                            <Link to="/register" className="inline-block px-10 py-5 bg-white text-slate-900 rounded-2xl font-bold text-lg hover:bg-slate-100 transition-all shadow-xl">
                                Crear mi cuenta ahora
                            </Link>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};
