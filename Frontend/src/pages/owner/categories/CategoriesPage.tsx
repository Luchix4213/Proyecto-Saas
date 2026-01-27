import { useEffect, useState } from 'react';
import { categoriesService, type Category, type CreateCategoryData, type UpdateCategoryData } from '../../../services/categoriesService';
import { Plus, Search, RefreshCw, Tag, Loader2, Pencil, Trash2 } from 'lucide-react';
import CategoryForm from '../../../components/categories/CategoryForm';
import { AestheticHeader } from '../../../components/common/AestheticHeader';
import { EmptyState } from '../../../components/common/EmptyState';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { useToast } from '../../../context/ToastContext';

export const CategoriesPage = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);
    const [isSaving, setIsSaving] = useState(false);
    const [filterStatus, setFilterStatus] = useState<'ACTIVO' | 'INACTIVO'>('ACTIVO');

    // ConfirmDialog State
    const [confirmConfig, setConfirmConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        type: 'danger' | 'warning' | 'info';
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
        type: 'info'
    });

    const { addToast } = useToast();

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
            addToast('No se pudieron cargar las categorías', 'error');
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

    const handleDelete = (id: number) => {
        setConfirmConfig({
            isOpen: true,
            title: '¿Eliminar Categoría?',
            message: 'Esta acción desactivará la categoría. Los productos asociados no se verán afectados directamente, pero no podrán asignarse a esta categoría mientras esté inactiva.',
            type: 'danger',
            onConfirm: async () => {
                try {
                    await categoriesService.delete(id);
                    addToast('Categoría eliminada correctamente', 'success');
                    fetchCategories();
                } catch (error) {
                    console.error('Error deleting category:', error);
                    addToast('No se pudo eliminar la categoría. Puede que esté en uso.', 'error');
                }
            }
        });
    };

    const handleReactivate = (id: number) => {
        setConfirmConfig({
            isOpen: true,
            title: '¿Reactivar Categoría?',
            message: 'La categoría volverá a estar disponible para asignar a nuevos productos.',
            type: 'info',
            onConfirm: async () => {
                try {
                    await categoriesService.update(id, { estado: 'ACTIVO' } as any);
                    addToast('Categoría reactivada correctamente', 'success');
                    fetchCategories();
                } catch (error) {
                    console.error('Error reactivating category:', error);
                    addToast('No se pudo reactivar la categoría.', 'error');
                }
            }
        });
    };

    const handleSubmit = async (data: CreateCategoryData | UpdateCategoryData) => {
        setIsSaving(true);
        try {
            if (editingCategory) {
                await categoriesService.update(editingCategory.categoria_id, data);
                addToast('Categoría actualizada', 'success');
            } else {
                await categoriesService.create(data as CreateCategoryData);
                addToast('Categoría creada con éxito', 'success');
            }
            setIsModalOpen(false);
            fetchCategories();
        } catch (error) {
            console.error('Error saving category:', error);
            addToast('Error al guardar la categoría.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const filteredCategories = categories.filter(cat =>
        cat.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="relative min-h-[80vh] w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8 animate-fade-in-up">
            {/* Header Section */}
            <AestheticHeader
                title="Categorías"
                description="Organiza tus productos para un catálogo más intuitivo."
                icon={Tag}
                iconColor="from-teal-500 to-emerald-600"
                action={
                    <div className="flex gap-3">
                        <button
                            onClick={fetchCategories}
                            className={`p-3 text-slate-400 hover:text-teal-600 bg-white border border-slate-200 hover:border-teal-200 rounded-2xl transition-all shadow-sm ${loading ? 'animate-spin' : ''}`}
                        >
                            <RefreshCw size={20} />
                        </button>
                        <button
                            onClick={handleCreate}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 border border-transparent rounded-2xl shadow-xl shadow-slate-900/20 text-sm font-bold text-white hover:bg-slate-800 transition-all hover:-translate-y-0.5 active:scale-95"
                        >
                            <Plus size={20} />
                            Nueva Categoría
                        </button>
                    </div>
                }
            />

            {/* Main Content Area */}
            <div className="mt-8 bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
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
                                    <td colSpan={3} className="px-8 py-20">
                                        <EmptyState
                                            title="No se encontraron categorías"
                                            description={searchTerm ? `No hay resultados para "${searchTerm}"` : "Comienza creando tu primera categoría para organizar tu inventario."}
                                            icon={Tag}
                                        />
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

                {/* Mobile View: Cards */}
                <div className="block md:hidden divide-y divide-slate-100">
                    {loading ? (
                        <div className="p-12 text-center">
                            <Loader2 className="animate-spin text-teal-500 mx-auto" size={32} />
                            <p className="text-slate-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Cargando...</p>
                        </div>
                    ) : filteredCategories.length === 0 ? (
                        <div className="p-8">
                             <EmptyState
                                title="Sin resultados"
                                description="No encontramos lo que buscas."
                                icon={Tag}
                            />
                        </div>
                    ) : (
                        filteredCategories.map((cat) => (
                            <div key={cat.categoria_id} className="p-5 bg-white space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 flex items-center justify-center text-teal-600 shadow-sm">
                                        <Tag size={18} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 tracking-tight">{cat.nombre}</h4>
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
                                                className="p-2.5 bg-slate-50 text-slate-600 border border-slate-200 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(cat.categoria_id)}
                                                className="p-2.5 bg-slate-50 text-slate-400 border border-slate-200 rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors"
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

                {/* Footer Insight */}
                <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 text-[10px] text-slate-400 uppercase tracking-widest font-black flex justify-between items-center">
                    <span>Catálogo de Productos</span>
                    <span>{filteredCategories.length} Registros</span>
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

            {/* Confirm Dialog */}
            <ConfirmDialog
                {...confirmConfig}
                onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
};
