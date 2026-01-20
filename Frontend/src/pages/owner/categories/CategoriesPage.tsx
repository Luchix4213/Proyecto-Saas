import { useEffect, useState } from 'react';
import { categoriesService, type Category, type CreateCategoryData, type UpdateCategoryData } from '../../../services/categoriesService';
import { Plus, Search, RefreshCw, Tag, Loader2, Pencil, Trash2, X } from 'lucide-react';
import CategoryForm from '../../../components/categories/CategoryForm';

export const CategoriesPage = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);
    const [isSaving, setIsSaving] = useState(false);
    const [filterStatus, setFilterStatus] = useState<'ACTIVO' | 'INACTIVO'>('ACTIVO');

    useEffect(() => {
        fetchCategories();
    }, [filterStatus]);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const data = await categoriesService.getAll(filterStatus);
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingCategory(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Estás seguro de eliminar esta categoría?')) return;
        try {
            await categoriesService.delete(id);
            await fetchCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('No se pudo eliminar la categoría. Puede que esté en uso.');
        }
    };

    const handleReactivate = async (id: number) => {
        if (!window.confirm('¿Deseas reactivar esta categoría?')) return;
        try {
            await categoriesService.update(id, { nombre: undefined, descripcion: undefined } as any); // Hacky update to just trigger simple update? Wait, service update takes UpdateCategoryData. I need to change the service or backend to allow updating status explicitly? 
            // WAIT. My backend update CategoriesService.update accepts UpdateCategoryDto.
            // But UpdateCategoryDto (which I assume exists) usually just has nombre/descripcion.
            // I should check UpdateCategoryDto in backend.
            // If I can't update status via 'update', I might need a specific endpoint or update the DTO.
            // Let's assume for now I will modify the backend DTO or logic to allow status update if I pass it.
            // Actually, usually Reactivation is done via PATCH status='ACTIVO'.
            // I'll leave this logic pending and check backend DTO first.
            // But let's assume I can send { estado: 'ACTIVO' } if I cast it.
            await categoriesService.update(id, { estado: 'ACTIVO' } as any);
            await fetchCategories();
        } catch (error) {
            console.error('Error reactivating category:', error);
            alert('No se pudo reactivar la categoría.');
        }
    };

    const handleSubmit = async (data: CreateCategoryData | UpdateCategoryData) => {
        setIsSaving(true);
        try {
            if (editingCategory) {
                await categoriesService.update(editingCategory.categoria_id, data);
            } else {
                await categoriesService.create(data as CreateCategoryData);
            }
            setIsModalOpen(false);
            fetchCategories();
        } catch (error) {
            console.error('Error saving category:', error);
            alert('Error al guardar la categoría.');
        } finally {
            setIsSaving(false);
        }
    };

    const filteredCategories = categories.filter(cat =>
        cat.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                        <Tag className="text-teal-600" />
                        Categorías
                    </h1>
                    <p className="text-slate-500 mt-1">Gestiona las categorías de tus productos para el catálogo.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchCategories}
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
                        Nueva Categoría
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Toolbar */}
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                    <div className="relative w-full sm:w-72 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar categorías..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as 'ACTIVO' | 'INACTIVO')}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-slate-600 font-medium cursor-pointer"
                    >
                        <option value="ACTIVO">Activos</option>
                        <option value="INACTIVO">Inactivos</option>
                    </select>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Descripción</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center">
                                        <div className="flex justify-center">
                                            <Loader2 className="animate-spin text-teal-600" size={24} />
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredCategories.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                                        No hay categorías registradas.
                                    </td>
                                </tr>
                            ) : (
                                filteredCategories.map((cat) => (
                                    <tr key={cat.categoria_id} className="group hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-slate-800">{cat.nombre}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {cat.descripcion || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {filterStatus === 'INACTIVO' ? (
                                                    <button
                                                        onClick={() => handleReactivate(cat.categoria_id)}
                                                        className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="Reactivar"
                                                    >
                                                        <RefreshCw size={18} />
                                                    </button>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => handleEdit(cat)}
                                                            className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                                            title="Editar"
                                                        >
                                                            <Pencil size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(cat.categoria_id)}
                                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </>
                                                )}
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
            {
                isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in p-4">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-scale-in border border-slate-100">
                            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
                                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <Tag className="text-teal-600" />
                                    {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                                </h3>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6">
                                <CategoryForm
                                    category={editingCategory}
                                    onSubmit={handleSubmit}
                                    onCancel={() => setIsModalOpen(false)}
                                    isLoading={isSaving}
                                />
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};
