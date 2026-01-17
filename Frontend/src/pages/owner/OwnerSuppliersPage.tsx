import { useState, useEffect } from 'react';
import { LayoutDashboard, Plus, Search, Pencil, Trash2, X, Save, AlertCircle, Phone, Mail, CreditCard, ChevronDown } from 'lucide-react';
import { suppliersService, type Proveedor, type CreateProveedorData } from '../../services/suppliersService';

export const OwnerSuppliersPage = () => {
    const [suppliers, setSuppliers] = useState<Proveedor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Proveedor | null>(null);
    const [formData, setFormData] = useState<CreateProveedorData>({
        nombre: '',
        telefono: '',
        email: '',
        datos_pago: ''
    });
    const [error, setError] = useState('');

    // Country code state
    const [countryCode, setCountryCode] = useState('+591');

    // Country codes data
    const countryCodes = [
        { code: '+591', country: 'Bolivia', flag: '🇧🇴' },
        { code: '+54', country: 'Argentina', flag: '🇦🇷' },
        { code: '+51', country: 'Perú', flag: '🇵🇪' },
        { code: '+56', country: 'Chile', flag: '🇨🇱' },
        { code: '+57', country: 'Colombia', flag: '🇨🇴' },
        { code: '+52', country: 'México', flag: '🇲🇽' },
        { code: '+1', country: 'USA', flag: '🇺🇸' },
        { code: '+34', country: 'España', flag: '🇪🇸' },
    ];



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
        if (supplier) {
            setEditingSupplier(supplier);

            let phone = supplier.telefono || '';
            let code = '+591';

            const foundCode = countryCodes.find(c => phone.startsWith(c.code));
            if (foundCode) {
                code = foundCode.code;
                phone = phone.substring(code.length).trim();
            }
            setCountryCode(code);

            setFormData({
                nombre: supplier.nombre,
                telefono: phone,
                email: supplier.email || '',
                datos_pago: supplier.datos_pago || ''
            });
        } else {
            setEditingSupplier(null);
            setCountryCode('+591');
            setFormData({
                nombre: '',
                telefono: '',
                email: '',
                datos_pago: ''
            });
        }
        setError('');
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.nombre.trim()) {
            setError('El nombre es requerido');
            return;
        }

        try {
            const payload = {
                ...formData,
                telefono: formData.telefono ? `${countryCode} ${formData.telefono.trim()}` : undefined
            };

            if (editingSupplier) {
                await suppliersService.update(editingSupplier.proveedor_id, payload);
            } else {
                await suppliersService.create(payload);
            }
            setIsModalOpen(false);
            fetchSuppliers();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al guardar proveedor');
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
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
                <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Proveedores</h1>
                <p className="text-slate-500">Gestiona los proveedores de tu negocio</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard
                    title="Total Proveedores"
                    value={suppliers.length}
                    icon={LayoutDashboard}
                    color="bg-gradient-to-br from-indigo-500 to-purple-600"
                />
                 {/* Placeholder stats */}
                 {/* Add more stats if needed */}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar proveedor..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="w-full sm:w-auto px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 font-medium shadow-lg shadow-indigo-500/20"
                >
                    <Plus className="w-5 h-5" />
                    Nuevo Proveedor
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Proveedor</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Contacto</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Datos de Pago</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        Cargando listado...
                                    </td>
                                </tr>
                            ) : filteredSuppliers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        No se encontraron proveedores
                                    </td>
                                </tr>
                            ) : (
                                filteredSuppliers.map((supplier) => (
                                    <tr key={supplier.proveedor_id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-slate-800">{supplier.nombre}</div>
                                            <div className="text-xs text-slate-500">ID: #{supplier.proveedor_id}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col gap-1">
                                                {supplier.telefono && (
                                                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                                                        {supplier.telefono}
                                                    </div>
                                                )}
                                                {supplier.email && (
                                                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                                                        {supplier.email}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {supplier.datos_pago ? (
                                                <div className="flex items-start gap-1.5 text-sm text-slate-600 max-w-xs truncate">
                                                    <CreditCard className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                                                    <span className="truncate">{supplier.datos_pago}</span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-slate-400 italic">No registrado</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                                supplier.estado === 'ACTIVO'
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                    : 'bg-slate-100 text-slate-600 border-slate-200'
                                            }`}>
                                                {supplier.estado}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(supplier)}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(supplier.proveedor_id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
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
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-scale-in">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <h3 className="text-xl font-bold text-slate-800">
                                {editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2">
                                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nombre <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                    placeholder="Nombre de la empresa o proveedor"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Teléfono</label>
                                    <div className="flex gap-2">
                                        <div className="relative w-24 shrink-0">
                                            <select
                                                value={countryCode}
                                                onChange={(e) => setCountryCode(e.target.value)}
                                                className="w-full appearance-none px-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer text-sm"
                                            >
                                                {countryCodes.map((item) => (
                                                    <option key={item.code} value={item.code}>
                                                        {item.flag} {item.code}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                                <ChevronDown className="h-3 w-3" />
                                            </div>
                                        </div>
                                        <input
                                            type="tel"
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                            placeholder="70012345"
                                            value={formData.telefono}
                                            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                                    <input
                                        type="email"
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                        placeholder="contacto@prov.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Datos de Pago / Notas</label>
                                <textarea
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                                    placeholder="Cuenta bancaria, NIT, etc."
                                    rows={3}
                                    value={formData.datos_pago}
                                    onChange={(e) => setFormData({ ...formData, datos_pago: e.target.value })}
                                />
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 text-slate-700 font-medium hover:bg-slate-50 rounded-xl border border-slate-200 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-medium hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    {editingSupplier ? 'Guardar Cambios' : 'Crear Proveedor'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
