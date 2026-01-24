import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Plus, Search, Pencil, Trash2, AlertCircle, Phone, Mail, CreditCard, CheckCircle2, TrendingUp, Truck, History } from 'lucide-react';
import { suppliersService, type Proveedor, type CreateProveedorData } from '../../services/suppliersService';
import { SupplierForm } from '../../components/suppliers/SupplierForm';

export const OwnerSuppliersPage = () => {
    const navigate = useNavigate();
    const [suppliers, setSuppliers] = useState<Proveedor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Proveedor | null>(null);
    const [error, setError] = useState('');




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
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (supplier?: Proveedor) => {
        setEditingSupplier(supplier || null);
        setIsModalOpen(true);
    };


    const handleSubmit = async (data: CreateProveedorData) => {
        setError('');

        try {
            // data already comes correctly formatted from the form component
            if (editingSupplier) {
                await suppliersService.update(editingSupplier.proveedor_id, data);
            } else {
                await suppliersService.create(data);
            }
            setIsModalOpen(false);
            fetchSuppliers();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al guardar proveedor');
            alert(err.response?.data?.message || 'Error al guardar proveedor');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Estás seguro de eliminar este proveedor?')) return;
        try {
            await suppliersService.delete(id);
            fetchSuppliers();
        } catch (err) {
            console.error('Error deleting supplier:', err);
        }
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
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
                            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white shadow-lg shadow-indigo-500/30">
                                <LayoutDashboard size={28} />
                            </div>
                            Gestión de Proveedores
                        </h1>
                        <p className="text-slate-500 mt-2 text-lg">
                            Administra tu cadena de suministro y contactos clave.
                        </p>
                    </div>
                     <button
                        onClick={() => handleOpenModal()}
                        className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 border border-transparent rounded-2xl shadow-xl shadow-slate-900/20 text-sm font-bold text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all hover:-translate-y-0.5"
                    >
                        <Plus size={20} className="stroke-[3]" />
                        Nuevo Proveedor
                    </button>
                </div>

                {/* Stats */}
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard
                        title="Total Proveedores"
                        value={totalSuppliers}
                        icon={Truck}
                        color="bg-indigo-500 overflow-hidden" // Using bg-opacity in component
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
                                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                         {/* Additional filters can go here */}
                         <div className="flex gap-2">
                             <span className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                <AlertCircle size={14} /> Solo Activos
                             </span>
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
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center">
                                             <div className="flex justify-center">
                                                <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredSuppliers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center text-slate-400">
                                            <div className="flex flex-col items-center justify-center gap-4">
                                                <div className="p-4 bg-slate-50 rounded-full">
                                                    <Truck size={32} className="text-slate-300" />
                                                </div>
                                                <p className="font-bold text-slate-600">No se encontraron proveedores</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredSuppliers.map((supplier) => (
                                        <tr key={supplier.proveedor_id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 font-black shadow-sm border border-white">
                                                        {supplier.nombre.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-slate-800">{supplier.nombre}</div>
                                                        <div className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded inline-block mt-1">ID: #{supplier.proveedor_id}</div>
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
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                    supplier.estado === 'ACTIVO'
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                    {supplier.estado === 'ACTIVO' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>}
                                                    {supplier.estado}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => navigate(`/owner/purchases/history?proveedorId=${supplier.proveedor_id}`)}
                                                        className="p-2.5 text-slate-500 hover:text-emerald-600 hover:bg-white rounded-xl transition-all shadow-sm hover:shadow-md border border-transparent hover:border-slate-100"
                                                        title="Historial de Compras"
                                                    >
                                                        <History size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenModal(supplier)}
                                                        className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-xl transition-all shadow-sm hover:shadow-md border border-transparent hover:border-slate-100"
                                                        title="Editar"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(supplier.proveedor_id)}
                                                        className="p-2.5 text-slate-500 hover:text-red-600 hover:bg-white rounded-xl transition-all shadow-sm hover:shadow-md border border-transparent hover:border-slate-100"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                     <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-center">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Fin del listado</span>
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
        </div>
    );
};
