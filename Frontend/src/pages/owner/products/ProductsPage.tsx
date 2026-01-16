import { useEffect, useState } from 'react';
import { productsService, type Product, type CreateProductData, type UpdateProductData } from '../../../services/productsService';
import { categoriesService, type Category } from '../../../services/categoriesService';
import { Plus, Search, RefreshCw, Package, Loader2, Pencil, Trash2, X, Filter, AlertTriangle } from 'lucide-react';
import ProductForm from '../../../components/products/ProductForm';

export const ProductsPage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [productsData, categoriesData] = await Promise.all([
                productsService.getAll(),
                categoriesService.getAll()
            ]);
            setProducts(productsData);
            setCategories(categoriesData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingProduct(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;
        try {
            await productsService.delete(id);
            // Quick update local state
            setProducts(prev => prev.filter(p => p.producto_id !== id));
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('No se pudo eliminar el producto.');
        }
    };

    const handleSubmit = async (data: CreateProductData | UpdateProductData) => {
        setIsSaving(true);
        try {
            if (editingProduct) {
                await productsService.update(editingProduct.producto_id, data);
            } else {
                await productsService.create(data as CreateProductData);
            }
            setIsModalOpen(false);
            fetchData(); // Refresh all to ensure relations are updated
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Error al guardar el producto.');
        } finally {
            setIsSaving(false);
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.nombre.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'ALL' || product.categoria_id === Number(selectedCategory);
        return matchesSearch && matchesCategory;
    });

    return (
         <div className="space-y-8 animate-fade-in-up">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                        <Package className="text-teal-600" />
                        Gestión de Productos
                    </h1>
                    <p className="text-slate-500 mt-1">Administra tu inventario, precios y stock.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchData}
                        className="p-2.5 text-slate-400 hover:text-teal-600 bg-white border border-slate-200 hover:border-teal-200 rounded-xl transition-all shadow-sm"
                        title="Refrescar"
                    >
                        <RefreshCw size={20} />
                    </button>
                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white hover:from-teal-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all hover:-translate-y-0.5 hover:shadow-teal-500/30"
                    >
                        <Plus size={18} strokeWidth={2.5} />
                        Nuevo Producto
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Toolbar */}
                 <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
                    <div className="relative w-full sm:w-72 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar productos (ej. nombre)..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl w-full sm:w-auto">
                            <Filter size={16} className="text-slate-400" />
                            <select
                                className="bg-transparent border-none text-sm text-slate-600 font-medium focus:outline-none w-full"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option value="ALL">Todas las Categorías</option>
                                {categories.map(cat => (
                                    <option key={cat.categoria_id} value={cat.categoria_id}>{cat.nombre}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                 </div>

                 {/* Table */}
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                         <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Producto</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Categoría</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Precio</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                         <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex justify-center">
                                            <Loader2 className="animate-spin text-teal-600" size={24} />
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        No se encontraron productos. Use el botón "Nuevo Producto" para agregar uno.
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr key={product.producto_id} className="group hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-800">{product.nombre}</span>
                                                {product.slug && <span className="text-xs text-slate-400 font-mono hidden md:inline">/{product.slug}</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                             <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                                {product.categoria?.nombre || 'Sin Categoría'}
                                            </span>
                                        </td>
                                         <td className="px-6 py-4">
                                            <span className="font-bold text-emerald-700">{Number(product.precio).toFixed(2)} Bs</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`font-bold ${product.stock_actual <= product.stock_minimo ? 'text-red-600' : 'text-slate-700'}`}>
                                                    {product.stock_actual}
                                                </span>
                                                {product.stock_actual <= product.stock_minimo && (
                                                    <AlertTriangle size={14} className="text-red-500" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(product)}
                                                    className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product.producto_id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                         </tbody>
                    </table>
                 </div>
            </div>

            {/* Modal */}
             {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col animate-scale-in border border-slate-100">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <Package className="text-teal-600" />
                                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <ProductForm
                                product={editingProduct}
                                onSubmit={handleSubmit}
                                onCancel={() => setIsModalOpen(false)}
                                isLoading={isSaving}
                            />
                        </div>
                    </div>
                </div>
            )}
         </div>
    );
};
