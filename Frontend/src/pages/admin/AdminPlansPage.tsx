import { useState, useEffect } from 'react';
import { planesService, type Plan, type CreatePlanData } from '../../services/planesService';
import { Plus, Edit2, Trash2, Check, X, Shield, Users, Package } from 'lucide-react';

export const AdminPlansPage = () => {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

    // Form Initial State
    const [formData, setFormData] = useState<CreatePlanData>({
        nombre_plan: '',
        descripcion: '',
        max_usuarios: 1,
        max_productos: 0,
        precio_mensual: 0,
        precio_anual: 0,
        ventas_online: false,
        reportes_avanzados: false,
        estado: 'ACTIVO'
    });

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        try {
            const data = await planesService.getAll();
            setPlans(data);
        } catch (err) {
            setError('Error al cargar planes');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (plan: Plan) => {
        setEditingPlan(plan);
        setFormData({
            nombre_plan: plan.nombre_plan,
            descripcion: plan.descripcion || '',
            max_usuarios: plan.max_usuarios,
            max_productos: plan.max_productos,
            precio_mensual: plan.precio_mensual,
            precio_anual: plan.precio_anual,
            ventas_online: plan.ventas_online,
            reportes_avanzados: plan.reportes_avanzados,
            estado: plan.estado
        });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Estás seguro de eliminar este plan?')) return;
        try {
            await planesService.delete(id);
            loadPlans();
        } catch (err) {
            alert('Error al eliminar el plan');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingPlan) {
                await planesService.update(editingPlan.plan_id, formData);
            } else {
                await planesService.create(formData);
            }
            setShowModal(false);
            setEditingPlan(null);
            setFormData({
                nombre_plan: '',
                descripcion: '',
                max_usuarios: 1,
                max_productos: 0,
                precio_mensual: 0,
                precio_anual: 0,
                ventas_online: false,
                reportes_avanzados: false,
                estado: 'ACTIVO'
            });
            loadPlans();
        } catch (err) {
            alert('Error al guardar el plan');
            console.error(err);
        }
    };

    if (loading) return <div>Cargando...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Shield className="text-indigo-600" />
                    Gestión de Planes
                </h1>
                <button
                    onClick={() => {
                        setEditingPlan(null);
                        setFormData({
                            nombre_plan: '',
                            descripcion: '',
                            max_usuarios: 1,
                            max_productos: 0,
                            precio_mensual: 0,
                            precio_anual: 0,
                            ventas_online: false,
                            reportes_avanzados: false,
                            estado: 'ACTIVO'
                        });
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                    <Plus size={20} /> Nuevo Plan
                </button>
            </div>

            {error && <div className="text-red-500 mb-4">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <div key={plan.plan_id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{plan.nombre_plan}</h3>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                    plan.estado === 'ACTIVO' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                    {plan.estado}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleEdit(plan)} className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-50 rounded-lg">
                                    <Edit2 size={18} />
                                </button>
                                <button onClick={() => handleDelete(plan.plan_id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-50 rounded-lg">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                <span className="text-sm text-gray-600">Mensual</span>
                                <span className="font-bold text-gray-900">{plan.precio_mensual} BOB</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                <span className="text-sm text-gray-600">Anual</span>
                                <span className="font-bold text-gray-900">{plan.precio_anual} BOB</span>
                            </div>

                            <div className="border-t pt-3 space-y-2">
                                <p className="text-sm flex items-center gap-2">
                                    <Users size={16} className="text-gray-400" />
                                    <span>Max Usuarios: <strong>{plan.max_usuarios}</strong></span>
                                </p>
                                <p className="text-sm flex items-center gap-2">
                                    <Package size={16} className="text-gray-400" />
                                    <span>Max Productos: <strong>{plan.max_productos}</strong></span>
                                </p>
                                <p className="text-sm flex items-center gap-2">
                                    {plan.ventas_online ? <Check size={16} className="text-green-500" /> : <X size={16} className="text-red-500" />}
                                    <span>Ventas Online</span>
                                </p>
                                <p className="text-sm flex items-center gap-2">
                                    {plan.reportes_avanzados ? <Check size={16} className="text-green-500" /> : <X size={16} className="text-red-500" />}
                                    <span>Reportes Avanzados</span>
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">{editingPlan ? 'Editar Plan' : 'Nuevo Plan'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nombre del Plan</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
                                    value={formData.nombre_plan}
                                    onChange={e => setFormData({...formData, nombre_plan: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                                <textarea
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
                                    value={formData.descripcion || ''}
                                    onChange={e => setFormData({...formData, descripcion: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Precio Mensual (BOB)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
                                        value={formData.precio_mensual}
                                        onChange={e => setFormData({...formData, precio_mensual: Number(e.target.value)})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Precio Anual (BOB)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
                                        value={formData.precio_anual}
                                        onChange={e => setFormData({...formData, precio_anual: Number(e.target.value)})}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Max Usuarios</label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
                                        value={formData.max_usuarios}
                                        onChange={e => setFormData({...formData, max_usuarios: Number(e.target.value)})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Max Productos</label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
                                        value={formData.max_productos}
                                        onChange={e => setFormData({...formData, max_productos: Number(e.target.value)})}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-6 mt-4">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.ventas_online}
                                        onChange={e => setFormData({...formData, ventas_online: e.target.checked})}
                                        className="rounded text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-sm text-gray-700">Ventas Online</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.reportes_avanzados}
                                        onChange={e => setFormData({...formData, reportes_avanzados: e.target.checked})}
                                        className="rounded text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-sm text-gray-700">Reportes Avanzados</span>
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                                <select
                                    value={formData.estado}
                                    onChange={e => setFormData({...formData, estado: e.target.value as 'ACTIVO' | 'INACTIVO'})}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
                                >
                                    <option value="ACTIVO">Activo</option>
                                    <option value="INACTIVO">Inactivo</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                    Guardar Plan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
