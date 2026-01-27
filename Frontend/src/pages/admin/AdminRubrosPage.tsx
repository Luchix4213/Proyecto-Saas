import { useState, useEffect } from 'react';
import { rubrosService, type Rubro } from '../../services/rubrosService';
import { RubroForm } from '../../components/rubros/RubroForm';
import { Plus, Pencil, Trash2, Search, Hash, Tag } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { AestheticHeader } from '../../components/common/AestheticHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';

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
        type: 'info' | 'warning' | 'danger';
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

    return (
        <div className="space-y-8 animate-fade-in-up">
            <AestheticHeader
                title="Sectores de Negocio"
                description="Gestiona los rubros y categorías comerciales disponibles para las microempresas."
                icon={Tag}
                iconColor="from-pink-500 to-rose-600"
                action={
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-transparent rounded-[1.25rem] shadow-xl text-sm font-black text-white hover:bg-slate-800 transition-all hover:-translate-y-0.5"
                    >
                        <Plus size={18} strokeWidth={3} />
                        NUEVO RUBRO
                    </button>
                }
            />

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
            <div className="overflow-x-auto">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent"></div>
                    </div>
                ) : filteredRubros.length === 0 ? (
                    <EmptyState
                        icon={Hash}
                        title="No se encontraron rubros"
                        description="Ajusta los filtros o crea un nuevo sector para comenzar."
                    />
                ) : (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre del Rubro</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredRubros.map((rubro) => (
                                <tr key={rubro.rubro_id} className="group hover:bg-slate-50/80 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-800">{rubro.nombre}</div>
                                        <div className="text-xs text-slate-400 font-mono">ID: {rubro.rubro_id}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge
                                            status={rubro.estado}
                                            variant={rubro.estado === 'ACTIVO' ? 'success' : 'neutral'}
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                            <div className="flex p-1.5 bg-slate-50 border border-slate-100 rounded-2xl gap-1 shadow-sm">
                                                <button
                                                    onClick={() => openEditModal(rubro)}
                                                    title="Editar"
                                                    className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-md rounded-xl transition-all"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <div className="w-[1px] h-4 bg-slate-200 self-center mx-1"></div>
                                                <button
                                                    onClick={() => handleDelete(rubro.rubro_id)}
                                                    title="Eliminar Permanente"
                                                    className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-white hover:shadow-md rounded-xl transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
