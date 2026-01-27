import { useEffect, useState } from 'react';
import { Plus, Search, Filter, ShoppingBag, Package, Image as ImageIcon, Trash2, Pencil, Star } from 'lucide-react';
import { productsService, type Product } from '../../../services/productsService';
import { categoriesService, type Category } from '../../../services/categoriesService';
import { ProductForm } from '../../../components/products/ProductForm';
import { getImageUrl } from '../../../utils/imageUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfirmDialog, type DialogType } from '../../../components/common/ConfirmDialog';
import { AestheticHeader } from '../../../components/common/AestheticHeader';
import { EmptyState } from '../../../components/common/EmptyState';
import { useToast } from '../../../context/ToastContext';
import { useAuth } from '../../../context/AuthContext';

export const ProductsPage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');
    const [filterStatus, setFilterStatus] = useState<string>('TODAS');

    const { addToast } = useToast();
    const { user } = useAuth();
    const isVendedor = user?.rol === 'VENDEDOR';
    const [confirmConfig, setConfirmConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: DialogType;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: () => {},
    });

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
            addToast('Error al cargar productos', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (product: Product) => {
        setConfirmConfig({
            isOpen: true,
            title: 'Eliminar Producto',
            message: `¿Estás seguro de eliminar el producto ${product.nombre}?`,
            type: 'danger',
            onConfirm: async () => {
                try {
                    await productsService.delete(product.producto_id);
                    setProducts(prev => prev.map(p =>
                        p.producto_id === product.producto_id
                            ? { ...p, estado: 'INACTIVO' }
                            : p
                    ));
                    addToast('Producto eliminado correctamente', 'success');
                    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                } catch (error) {
                    addToast('Error al eliminar producto', 'error');
                }
            }
        });
    };

    const handleReactivate = (product: Product) => {
        setConfirmConfig({
            isOpen: true,
            title: 'Reactivar Producto',
            message: `¿Reactivar el producto ${product.nombre}?`,
            type: 'info',
            onConfirm: async () => {
                try {
                    await productsService.update(product.producto_id, { estado: 'ACTIVO' });
                    setProducts(prev => prev.map(p =>
                        p.producto_id === product.producto_id
                            ? { ...p, estado: 'ACTIVO' }
                            : p
                    ));
                    addToast('Producto reactivado correctamente', 'success');
                    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                } catch (error: any) {
                    console.error(error);
                    addToast(`Error al reactivar producto: ${error.response?.data?.message || error.message}`, 'error');
                }
            }
        });
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

    // Stats Calculation
    const totalProducts = products.length;
    const lowStockProducts = products.filter(p => p.stock_actual <= p.stock_minimo).length;
    const activeProducts = products.filter(p => p.estado === 'ACTIVO').length;

    return (
        <div className="relative min-h-[80vh] w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
             <div className="animate-fade-in-up">
                {/* Ambient Background Elements */}
                <div className="absolute top-0 left-10 -mt-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 right-10 -mb-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

                {/* Header Section */}
                <AestheticHeader
                    title="Catálogo de Productos"
                    description="Gestiona tu inventario, precios y stock en tiempo real."
                    icon={ShoppingBag}
                    iconColor="from-teal-500 to-emerald-600"
                    action={
                        !isVendedor ? (
                            <button
                                onClick={handleCreate}
                                className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 border border-transparent rounded-2xl shadow-xl shadow-slate-900/20 text-sm font-bold text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all hover:-translate-y-0.5"
                            >
                                <Plus size={20} className="stroke-[3]" />
                                Nuevo Producto
                            </button>
                        ) : null
                    }
                />

                {/* Stats Overview */}
                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center justify-between group hover:border-indigo-200 transition-all duration-300">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Productos</p>
                            <p className="text-3xl font-black text-slate-800 mt-1">{totalProducts}</p>
                        </div>
                        <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                            <Package size={24} />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center justify-between group hover:border-teal-200 transition-all duration-300">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Activos en Venta</p>
                            <p className="text-3xl font-black text-teal-600 mt-1">{activeProducts}</p>
                        </div>
                        <div className="p-4 bg-teal-50 text-teal-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                            <Star size={24} />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center justify-between group hover:border-amber-200 transition-all duration-300">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Stock Bajo</p>
                            <p className="text-3xl font-black text-amber-500 mt-1">{lowStockProducts}</p>
                        </div>
                        <div className="p-4 bg-amber-50 text-amber-500 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                            <Filter size={24} />
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="relative z-10 bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden">

                    {/* Toolbar */}
                    <div className="p-6 border-b border-slate-100 flex flex-col xl:flex-row gap-4 justify-between items-center bg-slate-50/30">
                        <div className="relative w-full xl:w-96 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar por nombre..."
                                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0">
                             <div className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm min-w-max">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estado:</span>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="text-sm font-bold text-slate-700 bg-transparent outline-none cursor-pointer"
                                >
                                    <option value="TODAS">Todos</option>
                                    <option value="ACTIVO">Activos</option>
                                    <option value="INACTIVO">Inactivos</option>
                                </select>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setSelectedCategory('TODAS')}
                                    className={`px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-sm whitespace-nowrap ${selectedCategory === 'TODAS' ? 'bg-slate-900 text-white shadow-slate-900/20' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                >
                                    Todas
                                </button>
                                {categories.map(cat => (
                                    <button
                                        key={cat.categoria_id}
                                        onClick={() => setSelectedCategory(cat.categoria_id.toString())}
                                        className={`px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-sm whitespace-nowrap ${selectedCategory === cat.categoria_id.toString() ? 'bg-slate-900 text-white shadow-slate-900/20' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        {cat.nombre}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="p-6 sm:p-8 bg-slate-50/30 min-h-[400px]">
                        <AnimatePresence mode="popLayout">
                            {loading ? (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col items-center justify-center py-20 gap-4"
                                >
                                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
                                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Cargando inventario...</p>
                                </motion.div>
                            ) : filteredProducts.length === 0 ? (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <EmptyState
                                        icon={ShoppingBag}
                                        title="No se encontraron productos"
                                        description="Intenta ajustar tu búsqueda o filtros para encontrar lo que buscas."
                                    />
                                </motion.div>
                            ) : (
                                <motion.div
                                    layout
                                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                                >
                                    {filteredProducts.map(product => {
                                        const principalImage = product.imagenes?.find(img => img.es_principal) || product.imagenes?.[0];

                                        return (
                                            <motion.div
                                                key={product.producto_id}
                                                layout
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                className="group bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 flex flex-col relative"
                                            >

                                                {/* Image Area */}
                                                <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                                                    {principalImage ? (
                                                        <img
                                                            src={getImageUrl(principalImage.url)}
                                                            alt={product.nombre}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50">
                                                            <ImageIcon size={32} />
                                                            <span className="text-[10px] font-black uppercase tracking-widest mt-2">Sin imagen</span>
                                                        </div>
                                                    )}

                                                    {/* Badges */}
                                                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                                                        {product.destacado && (
                                                            <div className="bg-amber-400/90 backdrop-blur-sm text-amber-900 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-1">
                                                                <Star size={10} fill="currentColor" /> Destacado
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Actions Overlay - Hidden for VENDEDOR */}
                                                    {!isVendedor && (
                                                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                                                            <button
                                                                onClick={() => handleEdit(product)}
                                                                className="p-3 bg-white text-slate-800 rounded-2xl hover:bg-teal-400 hover:text-white transition-all shadow-lg transform hover:scale-110"
                                                                title="Editar"
                                                            >
                                                                <Pencil size={20} />
                                                            </button>

                                                            {product.estado === 'INACTIVO' ? (
                                                                <button
                                                                    onClick={() => handleReactivate(product)}
                                                                    className="p-3 bg-white text-slate-800 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all shadow-lg transform hover:scale-110"
                                                                    title="Reactivar"
                                                                >
                                                                    <Package size={20} />
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleDelete(product)}
                                                                    className="p-3 bg-white text-slate-800 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-lg transform hover:scale-110"
                                                                    title="Eliminar"
                                                                >
                                                                    <Trash2 size={20} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Info Area */}
                                                <div className="p-5 flex flex-col flex-1">
                                                    <div className="mb-3">
                                                        <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest bg-teal-50 px-2 py-1 rounded-lg">
                                                            {product.categoria?.nombre || 'General'}
                                                        </span>
                                                        <h3 className="font-bold text-slate-800 mt-2 text-lg line-clamp-1 leading-tight" title={product.nombre}>{product.nombre}</h3>
                                                    </div>

                                                    <p className="text-sm text-slate-400 line-clamp-2 mb-4 flex-1 font-medium">{product.descripcion || 'Sin descripción disponible.'}</p>

                                                    <div className="flex items-end justify-between pt-4 border-t border-slate-50">
                                                        <div>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Stock</p>
                                                            <div className={`flex items-center gap-1.5 font-bold ${product.stock_actual <= product.stock_minimo ? 'text-amber-500' : 'text-slate-600'}`}>
                                                                <Package size={16} />
                                                                {product.stock_actual}
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Precio</p>
                                                            <div className="text-xl font-black text-slate-800 bg-slate-100 px-3 py-1 rounded-xl">
                                                                Bs {Number(product.precio).toFixed(2)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </motion.div>
                            )}
                        </AnimatePresence>
                        {/* Pagination or Footer info could go here */}
                         <div className="mt-8 pt-4 border-t border-slate-200/50 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                             <span>Mostrando {filteredProducts.length} productos</span>
                             <span>Catálogo v2.0</span>
                         </div>
                    </div>
                </div>
            </div>

            {/* Modal Form - Placed outside animation wrapper for z-index safety */}
            {isFormOpen && (
                <ProductForm
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    onSuccess={loadData}
                    productToEdit={selectedProduct}
                    categories={categories}
                />
            )}

            <ConfirmDialog
                {...confirmConfig}
                onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
};
