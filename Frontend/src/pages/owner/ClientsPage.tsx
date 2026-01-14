import { useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2, User, Phone, FileText } from 'lucide-react';
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

    const filteredClients = clientes.filter(c =>
        c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.paterno && c.paterno.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.nit_ci && c.nit_ci.includes(searchTerm))
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Cartera de Clientes</h2>
                    <p className="text-gray-500 text-sm">Gestiona tus compradores y su información</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm hover:shadow-md"
                >
                    <Plus size={20} />
                    Nuevo Cliente
                </button>
            </div>

            {/* Buscador */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, apellido o CI/NIT..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Listado */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    <div className="col-span-full py-12 text-center text-gray-500">Cargando clientes...</div>
                ) : filteredClients.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        {searchTerm ? 'No se encontraron clientes con esa búsqueda.' : 'No tienes clientes registrados aún.'}
                    </div>
                ) : (
                    filteredClients.map((client) => (
                        <div key={client.cliente_id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative">
                            {/* Actions overlay */}
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleEdit(client)}
                                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full"
                                    title="Editar"
                                >
                                    <Pencil size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(client)}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                                    title="Dar de baja"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full">
                                    <User size={24} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 line-clamp-1">
                                        {client.nombre} {client.paterno}
                                    </h3>
                                    <div className="space-y-1 mt-2 text-sm text-gray-600">
                                        {client.nit_ci && (
                                            <div className="flex items-center gap-2">
                                                <FileText size={14} className="text-gray-400" />
                                                <span>{client.nit_ci}</span>
                                            </div>
                                        )}
                                        {client.telefono && (
                                            <div className="flex items-center gap-2">
                                                <Phone size={14} className="text-gray-400" />
                                                <span>{client.telefono}</span>
                                            </div>
                                        )}
                                        <div className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-2 ${client.estado === 'ACTIVO' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {client.estado}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
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
