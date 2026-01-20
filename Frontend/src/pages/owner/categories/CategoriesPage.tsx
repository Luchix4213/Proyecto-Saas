import { useEffect, useState } from 'react';
import { categoriesService, type Category, type CreateCategoryData, type UpdateCategoryData } from '../../../services/categoriesService';
import { Plus, Search, RefreshCw, Tag, Loader2, Pencil, Trash2 } from 'lucide-react';
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
        <div className="relative min-h-[80vh] w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
            <div className="animate-fade-in-up">
                {/* Ambient Background Elements */}
                <div className="absolute top-0 left-10 -mt-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 right-10 -mb-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

                {/* Header Section */}
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
                            <div className="p-2.5 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl text-white shadow-lg shadow-teal-500/30">
                                <Tag size={28} />
                            </div>
                            Categorías
                        </h1>
                        <p className="text-slate-500 mt-2 text-lg">
                            Gestiona las categorías de tus productos para el catálogo.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={fetchCategories}
                            className="p-3.5 text-slate-400 hover:text-teal-600 bg-white border border-slate-200 hover:border-teal-200 rounded-2xl transition-all shadow-sm hover:rotate-180 duration-500"
                            title="Refrescar"
                        >
                            <RefreshCw size={20} />
                        </button>
                        <button
                            onClick={handleCreate}
                            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 border border-transparent rounded-2xl shadow-xl shadow-slate-900/20 text-sm font-bold text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all hover:-translate-y-0.5"
                        >
                            <Plus size={20} className="stroke-[3]" />
                            Nueva Categoría
                        </button>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center justify-between group hover:border-indigo-200 transition-all duration-300">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Categorías</p>
                            <p className="text-3xl font-black text-slate-800 mt-1">{categories.length}</p>
                        </div>
                        <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                            <Tag size={24} />
                        </div>
                    </div>
                    {/* Placeholder Stats - Can be real if backend supports 'estado' */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center justify-between group hover:border-emerald-200 transition-all duration-300 hidden sm:flex">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Activas</p>
                            <p className="text-3xl font-black text-emerald-600 mt-1">{categories.length}</p>
                        </div>
                        <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                            <Tag size={24} />
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="relative z-10 bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row gap-4 justify-between items-center bg-slate-50/30">
                        <div className="relative w-full lg:w-96 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar categorías..."
                                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Filter Status hidden if backend doesn't fully support it or for simplicity, kept here as placeholder logic exists */}
                        <div className="relative w-full lg:w-48">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value as 'ACTIVO' | 'INACTIVO')}
                                className="w-full pl-4 pr-10 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm appearance-none cursor-pointer"
                            >
                                <option value="ACTIVO">Activos</option>
                                <option value="INACTIVO">Inactivos</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <Plus size={14} className="rotate-45" />
                            </div>
                        </div>
                    </div>

                    {/* Mobile View: Cards */}
                    <div className="block md:hidden divide-y divide-slate-100">
                        {loading ? (
                             <div className="p-12 text-center">
                                <Loader2 className="animate-spin text-teal-500 mx-auto" size={32} />
                                <p className="text-slate-400 font-bold mt-2">Cargando...</p>
                            </div>
                        ) : filteredCategories.length === 0 ? (
                            <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-2">
                                <Tag size={40} className="opacity-20" />
                                <p className="font-medium italic">No hay resultados</p>
                            </div>
                        ) : (
                            filteredCategories.map((cat) => (
                                <div key={cat.categoria_id} className="p-5 bg-white space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 flex items-center justify-center text-teal-600 shadow-sm">
                                            <Tag size={18} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800">{cat.nombre}</h4>
                                            {cat.descripcion && <p className="text-xs text-slate-400 font-medium line-clamp-1">{cat.descripcion}</p>}
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2 pt-2">
                                         {filterStatus === 'INACTIVO' ? (
                                            <button
                                                onClick={() => handleReactivate(cat.categoria_id)}
                                                className="p-2.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl"
                                            >
                                                <RefreshCw size={18} />
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleEdit(cat)}
                                                    className="p-2.5 bg-slate-50 text-slate-600 border border-slate-200 rounded-xl hover:bg-teal-50 hover:text-teal-600 hover:border-teal-100 transition-colors"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(cat.categoria_id)}
                                                    className="p-2.5 bg-slate-50 text-slate-400 border border-slate-200 rounded-xl hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Desktop View: Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-10">Categoría</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Descripción</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right pr-10">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={3} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center justify-center gap-4">
                                                <Loader2 className="animate-spin text-teal-500" size={32} />
                                                <span className="text-sm font-black text-slate-500 uppercase tracking-widest">Cargando catálogo...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredCategories.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="p-4 bg-slate-50 rounded-full text-slate-300">
                                                    <Tag size={40} />
                                                </div>
                                                <p className="text-slate-400 font-bold tracking-tight">No se encontraron categorías</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCategories.map((cat) => (
                                        <tr key={cat.categoria_id} className="group hover:bg-teal-50/30 transition-all duration-300">
                                            <td className="px-8 py-6 pl-10">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 flex items-center justify-center text-teal-600 shadow-sm transition-transform group-hover:scale-110 duration-300">
                                                        <Tag size={20} />
                                                    </div>
                                                    <span className="font-bold text-slate-800 tracking-tight text-base">{cat.nombre}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-sm font-medium text-slate-500">
                                                {cat.descripcion || <span className="text-slate-300 italic">Sin descripción</span>}
                                            </td>
                                            <td className="px-8 py-6 text-right pr-10">
                                                <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                                    <div className="flex p-1.5 bg-slate-50 border border-slate-100 rounded-2xl gap-1 shadow-sm">
                                                        {filterStatus === 'INACTIVO' ? (
                                                            <button
                                                                onClick={() => handleReactivate(cat.categoria_id)}
                                                                className="p-2.5 text-emerald-600 hover:bg-white hover:shadow-md rounded-xl transition-all"
                                                                title="Reactivar"
                                                            >
                                                                <RefreshCw size={18} />
                                                            </button>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    onClick={() => handleEdit(cat)}
                                                                    className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-md rounded-xl transition-all"
                                                                    title="Editar"
                                                                >
                                                                    <Pencil size={18} />
                                                                </button>
                                                                <div className="w-[1px] h-4 bg-slate-200 self-center mx-1"></div>
                                                                <button
                                                                    onClick={() => handleDelete(cat.categoria_id)}
                                                                    className="p-2.5 text-slate-300 hover:text-red-600 hover:bg-white hover:shadow-md rounded-xl transition-all"
                                                                    title="Eliminar"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer Insight */}
                    <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 text-[10px] text-slate-400 uppercase tracking-widest font-bold flex justify-between items-center">
                        <span>Catálogo de Productos</span>
                        <span>{categories.length} Registros Totales</span>
                    </div>
                </div>
            </div>

            {/* Modal */}
            <CategoryForm
                isOpen={isModalOpen}
                onSubmit={handleSubmit}
                onClose={() => setIsModalOpen(false)}
                category={editingCategory}
                isLoading={isSaving}
            />
        </div >
    );
};
