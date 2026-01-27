import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2, AlertCircle, Phone, Mail, CreditCard, CheckCircle2, TrendingUp, Truck, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { suppliersService, type Proveedor, type CreateProveedorData } from '../../services/suppliersService';
import { SupplierForm } from '../../components/suppliers/SupplierForm';
import { ConfirmDialog, type DialogType } from '../../components/common/ConfirmDialog';
import { AestheticHeader } from '../../components/common/AestheticHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';

export const OwnerSuppliersPage = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [suppliers, setSuppliers] = useState<Proveedor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Proveedor | null>(null);

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
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            const data = await suppliersService.getAll();
            setSuppliers(data);
        } catch (err) {
            console.error('Error fetching suppliers:', err);
             addToast('Error al cargar proveedores', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (supplier?: Proveedor) => {
        setEditingSupplier(supplier || null);
        setIsModalOpen(true);
    };


    const handleSubmit = async (data: CreateProveedorData) => {
        try {
            // data already comes correctly formatted from the form component
            if (editingSupplier) {
                await suppliersService.update(editingSupplier.proveedor_id, data);
                addToast('Proveedor actualizado correctamente', 'success');
            } else {
                await suppliersService.create(data);
                addToast('Proveedor creado correctamente', 'success');
            }
            setIsModalOpen(false);
            fetchSuppliers();
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Error al guardar proveedor';
            addToast(msg, 'error');
        }
    };

    const handleDelete = (id: number) => {
        setConfirmConfig({
            isOpen: true,
            title: 'Eliminar Proveedor',
            message: '¿Estás seguro de eliminar este proveedor? Esta acción no se puede deshacer.',
            type: 'danger',
            onConfirm: async () => {
                try {
                    await suppliersService.delete(id);
                    fetchSuppliers();
                    addToast('Proveedor eliminado correctamente', 'success');
                    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                } catch (err) {
                     console.error('Error deleting supplier:', err);
                     addToast('Error al eliminar proveedor', 'error');
                }
            }
        });
    };

    const filteredSuppliers = suppliers.filter(s =>
        s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const StatCard = ({ title, value, icon: Icon, color }: any) => (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center justify-between group hover:border-indigo-200 transition-all duration-300">
            <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
                <h3 className="text-3xl font-black text-slate-800">{value}</h3>
            </div>
            <div className={`p-4 rounded-2xl ${color} bg-opacity-10 text-indigo-600 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
    );

    // Calc stats
    const totalSuppliers = suppliers.length;
    const activeSuppliers = suppliers.filter(s => s.estado === 'ACTIVO').length;

    return (
        <div className="relative min-h-[80vh] w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
            <div className="animate-fade-in-up">
                {/* Ambient Background Elements */}
                <div className="absolute top-0 left-10 -mt-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 right-10 -mb-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

                {/* Header */}
                <AestheticHeader
                    title="Gestión de Proveedores"
                    description="Administra tu cadena de suministro y contactos clave."
                    icon={Truck}
                    iconColor="from-indigo-500 to-purple-600"
                    action={
                        <button
                            onClick={() => handleOpenModal()}
                            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 border border-transparent rounded-2xl shadow-xl shadow-slate-900/20 text-sm font-bold text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all hover:-translate-y-0.5"
                        >
                            <Plus size={20} className="stroke-[3]" />
                            Nuevo Proveedor
                        </button>
                    }
                />

                {/* Stats */}
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard
                        title="Total Proveedores"
                        value={totalSuppliers}
                        icon={Truck}
                        color="bg-indigo-500"
                    />
                    <StatCard
                        title="Proveedores Activos"
                        value={activeSuppliers}
                        icon={CheckCircle2}
                        color="bg-emerald-500"
                    />
                    <StatCard
                        title="Nuevos este mes"
                        value={'+2'}
                        icon={TrendingUp}
                        color="bg-amber-500"
                    />
                </div>

                {/* Toolbar */}
                <div className="relative z-10 bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/30">
                        <div className="relative w-full sm:w-96 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar proveedor por nombre o email..."
                                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-teal-500 transition-all shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                         <div className="flex gap-2">
                             <div className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                <AlertCircle size={14} /> Solo Activos
                             </div>
                         </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Proveedor</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contacto</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Datos de Pago</th>
                                    <th className="px-6 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Estado</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                <AnimatePresence mode="popLayout">
                                    {loading ? (
                                        <motion.tr
                                            key="loading"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <td colSpan={5} className="px-6 py-24 text-center">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
                                                    <p className="text-slate-400 font-bold animate-pulse uppercase tracking-widest text-xs">Cargando proveedores...</p>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ) : filteredSuppliers.length === 0 ? (
                                        <motion.tr
                                            key="empty"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <td colSpan={5}>
                                                <EmptyState
                                                    icon={Truck}
                                                    title="No se encontraron proveedores"
                                                    description="Intenta ajustar tu búsqueda o crea un nuevo proveedor para comenzar."
                                                />
                                            </td>
                                        </motion.tr>
                                    ) : (
                                        filteredSuppliers.map((supplier) => (
                                            <motion.tr
                                                key={supplier.proveedor_id}
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className="hover:bg-slate-50/80 transition-colors group"
                                            >
                                                <td className="px-8 py-5 whitespace-nowrap">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
                                                            {supplier.nombre.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="text-base font-bold text-slate-800">{supplier.nombre}</div>
                                                            <div className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg inline-block mt-1 border border-slate-100">ID: #{supplier.proveedor_id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap">
                                                    <div className="flex flex-col gap-1.5">
                                                        {supplier.telefono ? (
                                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                                                <div className="p-1 bg-emerald-50 rounded text-emerald-600"><Phone size={12} /></div>
                                                                {supplier.telefono}
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-slate-400 font-medium italic pl-7">Sin teléfono</span>
                                                        )}
                                                        {supplier.email ? (
                                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                                                <div className="p-1 bg-blue-50 rounded text-blue-600"><Mail size={12} /></div>
                                                                {supplier.email}
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-slate-400 font-medium italic pl-7">Sin email</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    {supplier.datos_pago ? (
                                                        <div className="flex items-start gap-2 text-xs font-medium text-slate-600 max-w-xs">
                                                             <div className="p-1 bg-purple-50 rounded text-purple-600 shrink-0 mt-0.5"><CreditCard size={12} /></div>
                                                            <span className="truncate leading-relaxed">{supplier.datos_pago}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-2 opacity-50">
                                                            <AlertCircle size={12} /> No registrado
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap text-center">
                                                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                                        supplier.estado === 'ACTIVO'
                                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                            : 'bg-slate-50 text-slate-400 border-slate-200'
                                                    }`}>
                                                        {supplier.estado === 'ACTIVO' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>}
                                                        {supplier.estado}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                                <div className="flex p-1.5 bg-slate-50 border border-slate-100 rounded-2xl gap-1 shadow-sm">
                                                    <button
                                                        onClick={() => navigate(`/owner/purchases/history?proveedorId=${supplier.proveedor_id}`)}
                                                        className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-md rounded-xl transition-all"
                                                        title="Historial de Compras"
                                                    >
                                                        <History size={18} />
                                                    </button>
                                                    <div className="w-[1px] h-4 bg-slate-200 self-center mx-1"></div>
                                                    <button
                                                        onClick={() => handleOpenModal(supplier)}
                                                        className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-md rounded-xl transition-all"
                                                        title="Editar Proveedor"
                                                    >
                                                        <Pencil size={18} />
                                                    </button>
                                                    <div className="w-[1px] h-4 bg-slate-200 self-center mx-1"></div>
                                                    <button
                                                        onClick={() => handleDelete(supplier.proveedor_id)}
                                                        className="p-2.5 text-slate-300 hover:text-red-600 hover:bg-white hover:shadow-md rounded-xl transition-all"
                                                        title="Eliminar Permanente"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                            </motion.tr>
                                        ))
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                     <div className="p-4 border-t border-slate-50 bg-slate-50/30 flex justify-center">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Fin del listado de proveedores</span>
                    </div>
                </div>
            </div>

            {/* Modal */}
             <SupplierForm
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                supplier={editingSupplier}
                isLoading={false} // Add loading state logic if needed in future
            />

            <ConfirmDialog
                {...confirmConfig}
                onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
};
