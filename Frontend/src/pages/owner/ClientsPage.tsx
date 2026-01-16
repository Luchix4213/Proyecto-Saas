import { useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2, Users, Phone, FileText, History } from 'lucide-react';
import { clientsService } from '../../services/clientsService';
import type { Cliente } from '../../services/clientsService';
import { ClientForm } from '../../components/clientes/ClientForm';

export const ClientsPage = () => {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        setLoading(true);
        try {
            const data = await clientsService.getAll();
            setClientes(data);
        } catch (error) {
            console.error('Error cargando clientes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedClient(null);
        setIsFormOpen(true);
    };

    const handleEdit = (client: Cliente) => {
        setSelectedClient(client);
        setIsFormOpen(true);
    };

    const handleDelete = async (client: Cliente) => {
        if (!window.confirm(`¿Estás seguro de dar de baja a ${client.nombre}?`)) return;

        try {
            await clientsService.delete(client.cliente_id);
            loadClients();
        } catch (error) {
            alert('Error al eliminar cliente');
        }
    };

    const handleHistory = (client: Cliente) => {
        alert(`Historial de compras de ${client.nombre}: Esta función estará disponible con el módulo de Ventas.`);
    };

    const filteredClients = clientes.filter(c =>
        c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.paterno && c.paterno.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.nit_ci && c.nit_ci.includes(searchTerm))
    );

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                        <Users className="text-teal-600" />
                        Cartera de Clientes
                    </h1>
                    <p className="text-slate-500">Gestiona y fideliza a tus compradores.</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold hover:shadow-lg hover:shadow-teal-500/30 transition-all hover:-translate-y-0.5"
                >
                    <Plus size={20} className="stroke-[3]" />
                    Nuevo Cliente
                </button>
            </div>

            {/* Content Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Actions Bar */}
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, apellido o NIT..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-slate-700 font-medium placeholder:text-slate-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="text-sm text-slate-500 font-medium">
                        Mostrando <span className="text-slate-900 font-bold">{filteredClients.length}</span> clientes
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                            <tr>
                                <th className="px-6 py-4">Cliente</th>
                                <th className="px-6 py-4">Documento (NIT/CI)</th>
                                <th className="px-6 py-4">Contacto</th>
                                <th className="px-6 py-4 text-center">Estado</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
                                            <p className="text-slate-400 font-medium">Cargando lista de clientes...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredClients.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                                <Users size={32} className="text-slate-300" />
                                            </div>
                                            <p className="text-lg font-medium text-slate-600">No se encontraron clientes</p>
                                            <p className="text-sm">Intenta ajustar tu búsqueda o crea uno nuevo.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredClients.map((client) => (
                                    <tr key={client.cliente_id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                                    {client.nombre.charAt(0).toUpperCase()}{client.paterno?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800">{client.nombre} {client.paterno}</p>
                                                    <p className="text-xs text-slate-400">ID: {client.cliente_id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {client.nit_ci ? (
                                                <div className="flex items-center gap-2 font-medium text-slate-700">
                                                    <FileText size={16} className="text-slate-400" />
                                                    {client.nit_ci}
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 italic">No registrado</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {client.telefono ? (
                                                <div className="flex items-center gap-2 font-medium text-slate-700">
                                                    <Phone size={16} className="text-slate-400" />
                                                    {client.telefono}
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 italic">--</span>
                                            )}
                                            {client.email && <div className="text-xs text-slate-400 mt-0.5">{client.email}</div>}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border
                                                ${client.estado === 'ACTIVO'
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                    : 'bg-red-50 text-red-700 border-red-100'}`}>
                                                {client.estado}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleHistory(client)}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="Historial de Compras"
                                                >
                                                    <History size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(client)}
                                                    className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                                    title="Editar Cliente"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(client)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Dar de baja"
                                                >
                                                    <Trash2 size={18} />
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

            <ClientForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSuccess={loadClients}
                clientToEdit={selectedClient}
            />
        </div>
    );
};
