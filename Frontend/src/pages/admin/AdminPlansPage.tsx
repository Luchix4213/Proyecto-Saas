import React, { useEffect, useState } from 'react';
import { planesService } from '../../services/planesService';
import type { Plan } from '../../services/planesService';
import { Plus, Pencil, Trash2, Check, X, Power } from 'lucide-react';

export const AdminPlansPage = () => {
    const [planes, setPlanes] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

    // Form states
    const [formData, setFormData] = useState({
        nombre_plan: '',
        max_usuarios: 0,
        max_productos: 0,
        precio: 0,
        ventas_online: false,
        reportes_avanzados: false,
        estado: 'ACTIVO' as 'ACTIVO' | 'INACTIVO'
    });

    useEffect(() => {
        loadPlanes();
    }, []);

    const loadPlanes = async () => {
        setLoading(true);
        try {
            const data = await planesService.getAll();
            setPlanes(data);
        } catch (error) {
            console.error('Error loading plans:', error);
            alert('Error al cargar planes');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                precio: Number(formData.precio), // Ensure number
                max_usuarios: Number(formData.max_usuarios),
                max_productos: Number(formData.max_productos)
            };

            if (editingPlan) {
                await planesService.update(editingPlan.plan_id, payload);
            } else {
                await planesService.create(payload);
            }
            setIsModalOpen(false);
            setEditingPlan(null);
            resetForm();
            loadPlanes();
        } catch (error) {
            console.error('Error saving plan:', error);
            alert('Error al guardar el plan: ' + (error as any).response?.data?.message || 'Error desconocido');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Estás seguro de eliminar este plan permanentemente?')) return;
        try {
            await planesService.delete(id);
            loadPlanes();
        } catch (error) {
            console.error('Error deleting plan:', error);
            alert('Error al eliminar el plan');
        }
    };

    const toggleStatus = async (plan: Plan) => {
        const newStatus = plan.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
        if (!window.confirm(`¿Estás seguro de cambiar el estado a ${newStatus}?`)) return;
        try {
            await planesService.update(plan.plan_id, { estado: newStatus });
            loadPlanes();
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Error al actualizar estado');
        }
    };

    const handleEdit = (plan: Plan) => {
        setEditingPlan(plan);
        setFormData({
            nombre_plan: plan.nombre_plan,
            max_usuarios: plan.max_usuarios,
            max_productos: plan.max_productos,
            precio: plan.precio,
            ventas_online: plan.ventas_online,
            reportes_avanzados: plan.reportes_avanzados,
            estado: plan.estado
        });
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingPlan(null);
        resetForm();
        setIsModalOpen(true);
    }

    const resetForm = () => {
        setFormData({
            nombre_plan: '',
            max_usuarios: 1,
            max_productos: 10,
            precio: 0,
            ventas_online: false,
            reportes_avanzados: false,
            estado: 'ACTIVO'
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Gestión de Planes SaaS</h2>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <Plus size={20} />
                    Nuevo Plan
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {planes.map((plan) => (
                    <div key={plan.plan_id} className={`rounded-xl shadow-sm border p-6 flex flex-col relative overflow-hidden transition-all ${plan.estado === 'INACTIVO' ? 'bg-gray-50 border-gray-200 opacity-75' : 'bg-white border-gray-100'}`}>
                        <div className="absolute top-0 right-0 p-4 flex gap-2">
                            <button
                                onClick={() => toggleStatus(plan)}
                                title={plan.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'}
                                className={`p-1.5 rounded-full transition-colors ${plan.estado === 'ACTIVO' ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-200'}`}
                            >
                                <Power size={18} />
                            </button>
                             <button onClick={() => handleEdit(plan)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
                                <Pencil size={18} />
                            </button>
                            <button onClick={() => handleDelete(plan.plan_id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
                                <Trash2 size={18} />
                            </button>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                             <h3 className="text-xl font-bold text-gray-900">{plan.nombre_plan}</h3>
                             {plan.estado === 'INACTIVO' && <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">INACTIVO</span>}
                        </div>

                        <div className="mb-4">
                            <span className="text-3xl font-bold text-indigo-600">${plan.precio}</span>
                            <span className="text-gray-500 text-sm">/mes</span>
                        </div>

                        <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-2 text-gray-600">
                                <Check size={18} className="text-green-500" />
                                <span>Hasta <strong>{plan.max_usuarios}</strong> usuarios</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <Check size={18} className="text-green-500" />
                                <span>Hasta <strong>{plan.max_productos}</strong> productos</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                {plan.ventas_online ? (
                                    <Check size={18} className="text-green-500" />
                                ) : (
                                    <X size={18} className="text-gray-400" />
                                )}
                                <span className={plan.ventas_online ? '' : 'text-gray-400 line-through'}>
                                    Ventas Online
                                </span>
                            </div>
                             <div className="flex items-center gap-2 text-gray-600">
                                {plan.reportes_avanzados ? (
                                    <Check size={18} className="text-green-500" />
                                ) : (
                                    <X size={18} className="text-gray-400" />
                                )}
                                <span className={plan.reportes_avanzados ? '' : 'text-gray-400 line-through'}>
                                    Reportes Avanzados
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-50 text-xs text-gray-400 text-center">
                            ID Plan: {plan.plan_id}
                        </div>
                    </div>
                ))}

                {!loading && planes.length === 0 && (
                     <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <p>No hay planes definidos.</p>
                        <button onClick={handleCreate} className="mt-2 text-indigo-600 hover:underline">Crear el primero</button>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <h3 className="text-xl font-bold mb-4">{editingPlan ? 'Editar Plan' : 'Nuevo Plan'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Plan</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.nombre_plan}
                                    onChange={e => setFormData({...formData, nombre_plan: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Ej. Básico, Pro, Enterprise"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio (Bs)</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.precio}
                                        onChange={e => setFormData({...formData, precio: Number(e.target.value)})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Máx. Usuarios</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={formData.max_usuarios}
                                        onChange={e => setFormData({...formData, max_usuarios: Number(e.target.value)})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Máx. Productos</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={formData.max_productos}
                                        onChange={e => setFormData({...formData, max_productos: Number(e.target.value)})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                 <div className="flex flex-col justify-end">
                                     <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                                     <select
                                        value={formData.estado}
                                        onChange={e => setFormData({...formData, estado: e.target.value as 'ACTIVO' | 'INACTIVO'})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                     >
                                         <option value="ACTIVO">ACTIVO</option>
                                         <option value="INACTIVO">INACTIVO</option>
                                     </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="online"
                                        checked={formData.ventas_online}
                                        onChange={e => setFormData({...formData, ventas_online: e.target.checked})}
                                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                    />
                                    <label htmlFor="online" className="text-sm text-gray-700">Habilitar Ventas Online</label>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="reportes"
                                        checked={formData.reportes_avanzados}
                                        onChange={e => setFormData({...formData, reportes_avanzados: e.target.checked})}
                                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                    />
                                    <label htmlFor="reportes" className="text-sm text-gray-700">Habilitar Reportes Avanzados</label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
                                >
                                    {editingPlan ? 'Guardar Cambios' : 'Crear Plan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
