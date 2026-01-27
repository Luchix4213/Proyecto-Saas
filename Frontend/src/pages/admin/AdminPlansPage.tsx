import { useState, useEffect } from 'react';
import { planesService, type Plan, type CreatePlanData } from '../../services/planesService';
import { Plus, Edit2, Trash2, Check, X, Shield } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { ConfirmDialog, type DialogType } from '../../components/common/ConfirmDialog';

export const AdminPlansPage = () => {
    const { addToast } = useToast();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

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

    const [filterStatus, setFilterStatus] = useState<string>('ALL');

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        try {
            const data = await planesService.getAll();
            setPlans(data);
        } catch (err) {
            setError('Error al cargar planes');
            addToast('Error al cargar planes', 'error');
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

    const handleDelete = (id: number) => {
        setConfirmConfig({
            isOpen: true,
            title: 'Eliminar Plan',
            message: '¿Estás seguro de eliminar este plan? Las empresas que lo usen podrían verse afectadas.',
            type: 'danger',
            onConfirm: async () => {
                try {
                    await planesService.delete(id);
                    loadPlans();
                    addToast('Plan eliminado correctamente', 'success');
                    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                } catch (err) {
                    addToast('Error al eliminar el plan', 'error');
                }
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingPlan) {
                await planesService.update(editingPlan.plan_id, formData);
                addToast('Plan actualizado correctamente', 'success');
            } else {
                await planesService.create(formData);
                addToast('Plan creado correctamente', 'success');
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
            addToast('Error al guardar el plan', 'error');
            console.error(err);
        }
    };

    const filteredPlans = plans.filter(plan => {
        if (filterStatus === 'ALL') return true;
        return plan.estado === filterStatus;
    });

    if (loading) return (
        <div className="flex h-64 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
                <p className="text-sm font-medium text-slate-500">Cargando planes...</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                        <Shield className="text-teal-600" />
                        Gestión de Planes
                    </h1>
                    <p className="text-slate-500">Configura los paquetes de suscripción disponibles.</p>
                </div>
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="rounded-xl border-slate-200 py-2.5 pl-3 pr-10 text-sm focus:border-teal-500 focus:ring-teal-500 bg-white shadow-sm"
                    >
                        <option value="ALL">Todos los Estados</option>
                        <option value="ACTIVO">Activos</option>
                        <option value="INACTIVO">Inactivos</option>
                    </select>

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
                        className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 font-medium shadow-lg shadow-teal-600/20 transition-all hover:-translate-y-0.5"
                    >
                        <Plus size={20} /> Nuevo Plan
                    </button>
                </div>
            </div>

            {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">{error}</div>}

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {filteredPlans.map((plan) => (
                    <div key={plan.plan_id} className={`bg-white rounded-2xl shadow-sm border hover:shadow-xl transition-all duration-300 relative group flex flex-col ${plan.estado === 'INACTIVO' ? 'border-slate-200 opacity-75' : 'border-slate-100'}`}>
                        {/* Status Badge */}
                        <div className="absolute top-4 right-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${plan.estado === 'ACTIVO' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                                }`}>
                                {plan.estado}
                            </span>
                        </div>

                        <div className="p-6 pb-4 border-b border-slate-50">
                            <h3 className="text-xl font-bold text-slate-800 mb-2">{plan.nombre_plan}</h3>
                            <p className="text-sm text-slate-500 min-h-[40px] line-clamp-2">{plan.descripcion || 'Sin descripción'}</p>
                        </div>

                        <div className="p-6 bg-slate-50/50">
                            <div className="flex items-baseline mb-1">
                                <span className="text-3xl font-extrabold text-slate-900">{plan.precio_mensual}</span>
                                <span className="text-lg font-medium text-slate-500 ml-1">BOB</span>
                                <span className="text-sm text-slate-400 ml-2">/ mes</span>
                            </div>
                            <div className="text-sm text-slate-500">
                                o {plan.precio_anual} BOB al año
                            </div>
                        </div>

                        <div className="p-6 space-y-4 flex-1">
                            <div className="space-y-3">
                                <FeatureItem label={`Hasta ${plan.max_usuarios} usuarios`} />
                                <FeatureItem label={`Hasta ${plan.max_productos} productos`} />
                                <FeatureItem
                                    label="Ventas Online"
                                    included={plan.ventas_online} highlight={plan.ventas_online}
                                />
                                <FeatureItem
                                    label="Reportes Avanzados"
                                    included={plan.reportes_avanzados} highlight={plan.reportes_avanzados}
                                />
                            </div>
                        </div>

                        <div className="p-4 border-t border-slate-100 flex gap-2">
                            <button
                                onClick={() => handleEdit(plan)}
                                className="flex-1 py-2 px-4 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors flex items-center justify-center gap-2"
                            >
                                <Edit2 size={16} /> Editar
                            </button>
                            <button
                                onClick={() => handleDelete(plan.plan_id)}
                                className="py-2 px-4 bg-white border border-red-100 text-red-600 font-medium rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors"
                                title="Eliminar Plan"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-8 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-800">{editingPlan ? 'Editar Plan' : 'Nuevo Plan'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre del Plan</label>
                                <input
                                    type="text"
                                    required
                                    className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-teal-500 focus:ring-teal-500 py-2.5 px-3 bg-slate-50 focus:bg-white transition-colors"
                                    value={formData.nombre_plan}
                                    onChange={e => setFormData({ ...formData, nombre_plan: e.target.value })}
                                    placeholder="Ej. Plan Emprendedor"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Descripción</label>
                                <textarea
                                    className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-teal-500 focus:ring-teal-500 py-2.5 px-3 bg-slate-50 focus:bg-white transition-colors"
                                    rows={3}
                                    value={formData.descripcion || ''}
                                    onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                                    placeholder="Breve descripción de los beneficios..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Precio Mensual</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="0"
                                            required
                                            className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-teal-500 focus:ring-teal-500 py-2.5 pl-3 pr-12 bg-slate-50 focus:bg-white transition-colors"
                                            value={formData.precio_mensual}
                                            onChange={e => setFormData({ ...formData, precio_mensual: Number(e.target.value) })}
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 text-sm">
                                            BOB
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Precio Anual</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="0"
                                            required
                                            className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-teal-500 focus:ring-teal-500 py-2.5 pl-3 pr-12 bg-slate-50 focus:bg-white transition-colors"
                                            value={formData.precio_anual}
                                            onChange={e => setFormData({ ...formData, precio_anual: Number(e.target.value) })}
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 text-sm">
                                            BOB
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Max Usuarios</label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-teal-500 focus:ring-teal-500 py-2.5 px-3 bg-slate-50 focus:bg-white transition-colors"
                                        value={formData.max_usuarios}
                                        onChange={e => setFormData({ ...formData, max_usuarios: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Max Productos</label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-teal-500 focus:ring-teal-500 py-2.5 px-3 bg-slate-50 focus:bg-white transition-colors"
                                        value={formData.max_productos}
                                        onChange={e => setFormData({ ...formData, max_productos: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-6 pt-2">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.ventas_online}
                                            onChange={e => setFormData({ ...formData, ventas_online: e.target.checked })}
                                            className="rounded text-teal-600 focus:ring-teal-500 w-5 h-5 border-slate-300 transition-colors"
                                        />
                                    </div>
                                    <span className="text-sm font-medium text-slate-700 group-hover:text-teal-700 transition-colors">Ventas Online</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.reportes_avanzados}
                                            onChange={e => setFormData({ ...formData, reportes_avanzados: e.target.checked })}
                                            className="rounded text-teal-600 focus:ring-teal-500 w-5 h-5 border-slate-300 transition-colors"
                                        />
                                    </div>
                                    <span className="text-sm font-medium text-slate-700 group-hover:text-teal-700 transition-colors">Reportes Avanzados</span>
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Estado</label>
                                <select
                                    value={formData.estado}
                                    onChange={e => setFormData({ ...formData, estado: e.target.value as 'ACTIVO' | 'INACTIVO' })}
                                    className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-teal-500 focus:ring-teal-500 py-2.5 px-3 bg-slate-50 focus:bg-white transition-colors"
                                >
                                    <option value="ACTIVO">Activo</option>
                                    <option value="INACTIVO">Inactivo</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-5 py-2.5 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 font-medium shadow-lg shadow-teal-600/20 transition-all hover:-translate-y-0.5"
                                >
                                    Guardar Plan
                                </button>
                            </div>
                        </form>
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

const FeatureItem = ({ label, included = true, highlight = false }: { label: string, included?: boolean, highlight?: boolean }) => (
    <div className={`flex items-center gap-3 text-sm ${!included ? 'opacity-50' : ''}`}>
        <div className={`p-1.5 rounded-full ${included ? (highlight ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-500') : 'bg-slate-50 text-slate-300'}`}>
            {included ? <Check size={14} strokeWidth={3} /> : <X size={14} />}
        </div>
        <span className={`${highlight ? 'font-medium text-slate-900' : 'text-slate-600'}`}>{label}</span>
    </div>
);
