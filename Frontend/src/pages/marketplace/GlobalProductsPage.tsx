import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productsService, type Product } from '../../services/productsService';
import { ShoppingBag, ArrowRight, Store, Search, Filter } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUtils';
import { useCartStore } from '../../store/useCartStore';

export const GlobalProductsPage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { addItem } = useCartStore();
    const [addedId, setAddedId] = useState<number | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const data = await productsService.getGlobalProducts();
            setProducts(data);
        } catch (error) {
            console.error('Error fetching global products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = (e: React.MouseEvent, product: Product) => {
        e.preventDefault(); // Prevent navigating if clicked on button
        e.stopPropagation();

        if (!product.tenant?.slug) return;

        addItem({
            producto_id: product.producto_id,
            nombre: product.nombre,
            precio: Number(product.precio),
            imagen_url: product.imagenes?.[0]?.url,
            cantidad: 1,
            tenant_slug: product.tenant.slug, // Crucial for cart separation
            stock_maximo: product.stock_actual
        });

        setAddedId(product.producto_id);
        setTimeout(() => setAddedId(null), 1500);
    };

    const filteredProducts = products.filter(p =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.tenant?.nombre_empresa.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header / Hero */}
            <div className="bg-white border-b border-slate-200 sticky top-16 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <h1 className="text-3xl font-extrabold text-slate-900 mb-6 flex items-center gap-3">
                        <ShoppingBag className="text-teal-500" size={32} />
                        Explorar Productos
                    </h1>

                    {/* Search & Filter Bar */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar productos, tiendas o descripciones..."
                                className="w-full pl-12 pr-4 py-3 bg-slate-100 border-transparent focus:bg-white border-2 focus:border-teal-500 rounded-xl outline-none transition-all font-medium text-slate-700"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                             <button className="px-5 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 flex items-center gap-2 transition-colors">
                                <Filter size={18} />
                                <span className="hidden sm:inline">Filtros</span>
                             </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {loading ? (
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="bg-white rounded-[2rem] aspect-[3/4] animate-pulse"></div>
                        ))}
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                            <ShoppingBag size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">No se encontraron productos</h3>
                        <p className="text-slate-500">Intenta con otros términos de búsqueda.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {filteredProducts.map((product) => (
                            <Link
                                key={product.producto_id}
                                to={`/tienda/${product.tenant?.slug}/?product=${product.producto_id}`}
                                className="group bg-white rounded-[2rem] border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 hover:-translate-y-1 flex flex-col"
                            >
                                {/* Image */}
                                <div className="aspect-square relative overflow-hidden bg-slate-100">
                                    {product.imagenes?.[0] ? (
                                        <img
                                            src={getImageUrl(product.imagenes[0].url)}
                                            alt={product.nombre}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                            <ShoppingBag size={48} />
                                        </div>
                                    )}

                                    {/* Tenant Badge */}
                                    {product.tenant && (
                                        <div className="absolute top-4 left-4 right-4 flex items-center gap-2">
                                            <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-white/20 max-w-full">
                                                {product.tenant.logo_url ? (
                                                    <img src={getImageUrl(product.tenant.logo_url)} alt="Logo" className="w-5 h-5 rounded-full object-cover" />
                                                ) : (
                                                    <Store size={14} className="text-teal-600" />
                                                )}
                                                <span className="text-xs font-bold text-slate-700 truncate">{product.tenant.nombre_empresa}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Quick Actions (only visible on hover) */}
                                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex gap-2">
                                        <button
                                            onClick={(e) => handleAddToCart(e, product)}
                                            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all ${
                                                addedId === product.producto_id
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-white text-slate-900 hover:bg-slate-50'
                                            }`}
                                        >
                                            {addedId === product.producto_id ? (
                                                <>Agregado</>
                                            ) : (
                                                <>Agregar <span className="text-emerald-600 ml-1">{product.precio} Bs</span></>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-5 flex-1 flex flex-col">
                                    <h3 className="font-bold text-slate-900 group-hover:text-teal-600 transition-colors line-clamp-2 mb-1">
                                        {product.nombre}
                                    </h3>
                                    <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">
                                        {product.descripcion || 'Sin descripción disponible.'}
                                    </p>

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Precio</span>
                                            <span className="text-lg font-black text-slate-900">{product.precio} <span className="text-xs text-slate-400 font-bold">Bs</span></span>
                                        </div>
                                        <div className="h-8 w-8 rounded-full bg-slate-100 group-hover:bg-teal-50 group-hover:text-teal-600 flex items-center justify-center transition-colors">
                                            <ArrowRight size={16} />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
