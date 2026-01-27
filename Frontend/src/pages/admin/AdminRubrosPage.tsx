import { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, Tag, Loader2 } from 'lucide-react';
import { rubrosService, type Rubro } from '../../services/rubrosService';
import { RubroForm } from '../../components/rubros/RubroForm';
import { useToast } from '../../context/ToastContext';
import { ConfirmDialog, type DialogType } from '../../components/common/ConfirmDialog';

export const AdminRubrosPage = () => {
    const { addToast } = useToast();
    const [rubros, setRubros] = useState<Rubro[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRubro, setEditingRubro] = useState<Rubro | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

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

    useEffect(() => {
        fetchRubros();
    }, []);

    const fetchRubros = async () => {
        try {
            const data = await rubrosService.getAll();
            setRubros(data);
        } catch (error) {
            console.error('Error fetching rubros:', error);
            addToast('Error al cargar rubros', 'error');
        } finally {
            setLoading(false);
        }
    };

    const filteredRubros = rubros.filter(rubro =>
        rubro.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreate = async (data: { nombre: string; descripcion?: string }) => {
        setActionLoading(true);
        try {
            await rubrosService.create(data);
            await fetchRubros();
            setIsModalOpen(false);
            addToast('Rubro creado correctamente', 'success');
        } catch (error) {
            console.error('Error creating rubro:', error);
            addToast('Error al crear rubro', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdate = async (data: { nombre: string; descripcion?: string }) => {
        if (!editingRubro) return;
        setActionLoading(true);
        try {
            await rubrosService.update(editingRubro.rubro_id, data);
            await fetchRubros();
            setIsModalOpen(false);
            setEditingRubro(null);
            addToast('Rubro actualizado correctamente', 'success');
        } catch (error) {
            console.error('Error updating rubro:', error);
            addToast('Error al actualizar rubro', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = (id: number) => {
        setConfirmConfig({
            isOpen: true,
            title: 'Eliminar Rubro',
            message: '¿Estás seguro de eliminar este rubro? Esta acción no se puede deshacer.',
            type: 'danger',
            onConfirm: async () => {
                try {
                    await rubrosService.delete(id);
                    setRubros(rubros.filter(r => r.rubro_id !== id));
                    addToast('Rubro eliminado correctamente', 'success');
                    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                } catch (error) {
                    console.error('Error deleting rubro:', error);
                    addToast('No se puede eliminar un rubro que está siendo usado por empresas.', 'error');
                }
            }
        });
    };

    const openCreateModal = () => {
        setEditingRubro(null);
        setIsModalOpen(true);
    };

    const openEditModal = (rubro: Rubro) => {
        setEditingRubro(rubro);
        setIsModalOpen(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin text-teal-600" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Rubros de Negocio</h1>
                    <p className="text-slate-500">Gestiona las categorías de negocio disponibles para las empresas</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors shadow-lg shadow-teal-600/20"
                >
                    <Plus size={20} />
                    Nuevo Rubro
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar rubros..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                    />
                </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRubros.map((rubro) => (
                    <div key={rubro.rubro_id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
                        {/* Decorative background */}
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                             <Tag size={100} className="text-teal-600" />
                        </div>

                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className="p-3 bg-gradient-to-br from-teal-500 to-emerald-500 text-white rounded-xl shadow-lg shadow-teal-500/20 group-hover:scale-110 transition-transform duration-300">
                                <Tag size={20} />
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 bg-white/80 backdrop-blur-sm p-1 rounded-lg">
                                <button
                                    onClick={() => openEditModal(rubro)}
                                    className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                    title="Editar"
                                >
                                    <Pencil size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(rubro.rubro_id)}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Eliminar"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg mb-2 relative z-10 group-hover:text-teal-700 transition-colors">{rubro.nombre}</h3>
                        <p className="text-slate-500 text-sm line-clamp-2 relative z-10 leading-relaxed">
                            {rubro.descripcion || 'Sin descripción disponible para este rubro.'}
                        </p>
                    </div>
                ))}

                {filteredRubros.length === 0 && (
                    <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
                        <Tag size={48} className="mb-4 opacity-20" />
                        <p>No se encontraron rubros</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800 text-lg">
                                {editingRubro ? 'Editar Rubro' : 'Nuevo Rubro'}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <Plus size={24} className="rotate-45" />
                            </button>
                        </div>
                        <div className="p-6">
                            <RubroForm
                                initialData={editingRubro || undefined}
                                onSubmit={editingRubro ? handleUpdate : handleCreate}
                                isLoading={actionLoading}
                                onCancel={() => setIsModalOpen(false)}
                            />
                        </div>
                    </div>
                </div>
            )}

            <ConfirmDialog
                {...confirmConfig}
                onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
};
