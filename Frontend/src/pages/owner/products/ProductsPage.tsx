import { useEffect, useState } from 'react';
import { Plus, Search, Filter, ShoppingBag, Package, Image as ImageIcon, Trash2, Pencil, Star } from 'lucide-react';
import { productsService, type Product } from '../../../services/productsService';
import { categoriesService, type Category } from '../../../services/categoriesService';
import { ProductForm } from '../../../components/products/ProductForm';
import { getImageUrl } from '../../../utils/imageUtils';

export const ProductsPage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');
    const [filterStatus, setFilterStatus] = useState<string>('TODAS');

    // Modal State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [productsData, categoriesData] = await Promise.all([
                productsService.getAll(),
                categoriesService.getAll()
            ]);
            setProducts(productsData);
            setCategories(categoriesData);
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (product: Product) => {
        if (!window.confirm(`¿Estás seguro de eliminar el producto ${product.nombre}?`)) return;
        try {
            await productsService.delete(product.producto_id);
            // Instead of removing, we update local state to reflect change if we were keeping it,
            // but delete usually sets to INACTIVE in backend.
            // So we should verify if 'delete' sets to INACTIVE (soft delete) or actually deletes.
            // Based on backend service 'remove', it sets estado: 'INACTIVO'.
            // So we should update the local product state to INACTIVO.
            setProducts(products.map(p =>
                p.producto_id === product.producto_id
                    ? { ...p, estado: 'INACTIVO' }
                    : p
            ));
        } catch (error) {
            alert('Error al eliminar producto');
        }
    };

    const handleReactivate = async (product: Product) => {
        if (!window.confirm(`¿Reactivar el producto ${product.nombre}?`)) return;
        try {
            await productsService.update(product.producto_id, { estado: 'ACTIVO' });
            setProducts(products.map(p =>
                p.producto_id === product.producto_id
                    ? { ...p, estado: 'ACTIVO' }
                    : p
            ));
        } catch (error: any) {
            console.error(error);
            alert(`Error al reactivar producto: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleEdit = (product: Product) => {
        setSelectedProduct(product);
        setIsFormOpen(true);
    };

    const handleCreate = () => {
        setSelectedProduct(null);
        setIsFormOpen(true);
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'TODAS' || p.categoria_id.toString() === selectedCategory;
        const matchesStatus = filterStatus === 'TODAS' || p.estado === filterStatus;
        return matchesSearch && matchesCategory && matchesStatus;
    });

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                        <ShoppingBag className="text-teal-600" />
                        Catálogo de Productos
                    </h1>
                    <p className="text-slate-500">Gestiona tu inventario y precios.</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold hover:shadow-lg hover:shadow-teal-500/30 transition-all hover:-translate-y-0.5"
                >
                    <Plus size={20} className="stroke-[3]" />
                    Nuevo Producto
                </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar producto..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="rounded-xl border-slate-200 py-2 px-3 text-sm focus:border-teal-500 focus:ring-teal-500 bg-white shadow-sm font-medium text-slate-700"
                    >
                        <option value="TODAS">Todos los Estados</option>
                        <option value="ACTIVO">Activos</option>
                        <option value="INACTIVO">Inactivos</option>
                    </select>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 font-medium text-sm whitespace-nowrap">
                        <Filter size={16} /> Filters:
                    </div>
                    <button
                        onClick={() => setSelectedCategory('TODAS')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${selectedCategory === 'TODAS' ? 'bg-teal-100 text-teal-700' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                        Todas
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.categoria_id}
                            onClick={() => setSelectedCategory(cat.categoria_id.toString())}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${selectedCategory === cat.categoria_id.toString() ? 'bg-teal-100 text-teal-700' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            {cat.nombre}
                        </button>
                    ))}
                </div>
            </div>

            {/* Product Grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <ShoppingBag size={48} className="mb-4 text-slate-300" />
                    <p className="text-lg font-medium text-slate-600">No hay productos</p>
                    <p className="text-sm">Empieza agregando items a tu inventario.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map(product => {
                        const principalImage = product.imagenes?.find(img => img.es_principal) || product.imagenes?.[0];

                        return (
                            <div key={product.producto_id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
                                {/* Image Area */}
                                <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                                    {principalImage ? (
                                        <img
                                            src={getImageUrl(principalImage.url)}
                                            alt={product.nombre}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                                            <ImageIcon size={32} />
                                            <span className="text-xs font-medium mt-1">Sin imagen</span>
                                        </div>
                                    )}

                                    {product.destacado && (
                                        <div className="absolute top-3 left-3 bg-amber-400 text-amber-900 text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                                            <Star size={12} fill="currentColor" /> Destacado
                                        </div>
                                    )}

                                    {/* Actions Overlay */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => handleEdit(product)}
                                            className="p-2 bg-white text-slate-700 rounded-xl hover:bg-teal-50 hover:text-teal-600 transition-colors shadow-lg"
                                        >
                                            <Pencil size={20} />
                                        </button>

                                        {product.estado === 'INACTIVO' ? (
                                            <button
                                                onClick={() => handleReactivate(product)}
                                                className="p-2 bg-white text-slate-700 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-colors shadow-lg"
                                                title="Reactivar Producto"
                                            >
                                                <Package size={20} />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleDelete(product)}
                                                className="p-2 bg-white text-slate-700 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors shadow-lg"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Info Area */}
                                <div className="p-4 flex flex-col flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider bg-teal-50 px-2 py-1 rounded-md">
                                                {product.categoria?.nombre || 'General'}
                                            </span>
                                            <h3 className="font-bold text-slate-800 mt-1 line-clamp-1" title={product.nombre}>{product.nombre}</h3>
                                        </div>
                                    </div>

                                    <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">{product.descripcion || 'Sin descripción'}</p>

                                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                        <div className="flex items-center gap-1.5 text-slate-600 font-medium text-sm">
                                            <Package size={16} className="text-slate-400" />
                                            {product.stock_actual}
                                        </div>
                                        <div className="text-lg font-bold text-slate-800">
                                            Bs {Number(product.precio).toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {isFormOpen && (
                <ProductForm
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    onSuccess={loadData}
                    productToEdit={selectedProduct}
                    categories={categories}
                />
            )}
        </div>
    );
};
