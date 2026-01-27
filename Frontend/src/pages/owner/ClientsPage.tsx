import { useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2, Users, Phone, FileText, History, Filter, UserCheck, UserX, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clientsService } from '../../services/clientsService';
import type { Cliente } from '../../services/clientsService';
import { ClientForm } from '../../components/clientes/ClientForm';
import { ClientHistoryModal } from '../../components/clientes/ClientHistoryModal';
import { ConfirmDialog, type DialogType } from '../../components/common/ConfirmDialog';
import { AestheticHeader } from '../../components/common/AestheticHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';

export const ClientsPage = () => {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'TODOS' | 'ACTIVO' | 'INACTIVO'>('TODOS');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);

    // History Modal State
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [historyClient, setHistoryClient] = useState<Cliente | null>(null);

    const { addToast } = useToast();
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

    const handleDelete = (client: Cliente) => {
        setConfirmConfig({
            isOpen: true,
            title: 'Dar de baja',
            message: `¿Estás seguro de dar de baja a ${client.nombre}? El cliente no podrá realizar nuevas compras.`,
            type: 'danger',
            onConfirm: async () => {
                try {
                    await clientsService.delete(client.cliente_id);
                    loadClients();
                    addToast('Cliente dado de baja correctamente', 'success');
                    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                } catch (error) {
                    addToast('Error al eliminar cliente', 'error');
                }
            }
        });
    };

    const handleHistory = (client: Cliente) => {
        setHistoryClient(client);
        setIsHistoryOpen(true);
    };

    const handleReactivate = (client: Cliente) => {
        setConfirmConfig({
            isOpen: true,
            title: 'Reactivar Cliente',
            message: `¿Quieres reactivar a ${client.nombre}? Podrá volver a operar normalmente.`,
            type: 'success',
            onConfirm: async () => {
                try {
                    await clientsService.update(client.cliente_id, { estado: 'ACTIVO' });
                    loadClients();
                    addToast('Cliente reactivado', 'success');
                    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                } catch (error) {
                    addToast('Error al reactivar cliente', 'error');
                }
            }
        });
    };

    const filteredClients = clientes.filter(c => {
        const matchesSearch = c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.paterno && c.paterno.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (c.nit_ci && c.nit_ci.includes(searchTerm));

        const matchesStatus = statusFilter === 'TODOS' || c.estado === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const activeCount = clientes.filter(c => c.estado === 'ACTIVO').length;

    return (
        <>
            <div className="relative min-h-[80vh] w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8 animate-fade-in-up">
                {/* Ambient Backgrounds */}
                <div className="absolute top-0 left-10 -mt-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 right-10 -mb-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 space-y-8">
                    {/* Header Section */}
                <AestheticHeader
                    title="Gestión de Clientes"
                    description="Administra la base de datos de tus clientes y su historial de compras."
                    icon={Users}
                    iconColor="from-teal-500 to-emerald-600"
                    action={
                        <button
                            onClick={handleCreate}
                            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 border border-transparent rounded-2xl shadow-xl shadow-slate-900/20 text-sm font-bold text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all hover:-translate-y-0.5"
                        >
                            <Plus size={20} className="stroke-[3]" />
                            Nuevo Cliente
                        </button>
                    }
                />

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-xl transition-all duration-300">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Clientes</p>
                                <h3 className="text-3xl font-black text-slate-800">{clientes.length}</h3>
                            </div>
                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                                <Users size={24} />
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-xl transition-all duration-300">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Activos</p>
                                <h3 className="text-3xl font-black text-slate-800">{activeCount}</h3>
                            </div>
                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                                <UserCheck size={24} />
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-xl transition-all duration-300">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Inactivos</p>
                                <h3 className="text-3xl font-black text-slate-800">{clientes.length - activeCount}</h3>
                            </div>
                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-red-50 group-hover:text-red-500 transition-colors">
                                <UserX size={24} />
                            </div>
                        </div>
                    </div>

                    {/* Content Card */}
                    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                        {/* Actions Bar */}
                        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/30 backdrop-blur-sm sticky top-0 z-10">
                            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto flex-1">
                                <div className="relative w-full md:w-96 group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Buscar por nombre, apellido o NIT..."
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-slate-700 font-bold placeholder:text-slate-400"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                <div className="relative w-full sm:w-56">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                        <Filter size={18} />
                                    </div>
                                    <select
                                        className="block w-full pl-11 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all text-sm font-bold text-slate-700 appearance-none cursor-pointer hover:bg-slate-100"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value as any)}
                                    >
                                        <option value="TODOS">Todos los Estados</option>
                                        <option value="ACTIVO">Activos</option>
                                        <option value="INACTIVO">Inactivos</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                                        <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50/50 text-slate-400 text-xs uppercase tracking-widest font-extrabold">
                                    <tr>
                                        <th className="px-8 py-6">Cliente</th>
                                        <th className="px-8 py-6">Documento</th>
                                        <th className="px-8 py-6">Contacto</th>
                                        <th className="px-8 py-6 text-center">Estado</th>
                                        <th className="px-8 py-6 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
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
                                                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
                                                        <p className="text-slate-400 font-bold animate-pulse">Cargando lista de clientes...</p>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ) : filteredClients.length === 0 ? (
                                            <motion.tr
                                                key="empty"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                            >
                                                <td colSpan={5}>
                                                    <EmptyState
                                                        icon={Users}
                                                        title="No se encontraron clientes"
                                                        description="Intenta ajustar tu búsqueda o crea un nuevo cliente para comenzar."
                                                    />
                                                </td>
                                            </motion.tr>
                                        ) : (
                                            filteredClients.map((client) => (
                                                <motion.tr
                                                    key={client.cliente_id}
                                                    layout
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    className="hover:bg-slate-50/80 transition-all group"
                                                >
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                                                                {client.nombre.charAt(0).toUpperCase()}{client.paterno?.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-slate-800 text-base">{client.nombre} {client.paterno}</p>
                                                                <p className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg inline-block mt-1">ID: {client.cliente_id}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        {client.nit_ci ? (
                                                            <div className="flex items-center gap-2 font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl w-fit">
                                                                <FileText size={16} className="text-slate-400" />
                                                                {client.nit_ci}
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-400 font-medium italic pl-3">No registrado</span>
                                                        )}
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <div className="flex flex-col gap-1">
                                                            {client.telefono ? (
                                                                <div className="flex items-center gap-2 font-medium text-slate-700">
                                                                    <Phone size={14} className="text-slate-400" />
                                                                    {client.telefono}
                                                                </div>
                                                            ) : (
                                                                <span className="text-slate-400 text-xs italic">Sin teléfono</span>
                                                            )}
                                                            {client.email && <div className="text-xs font-medium text-slate-500">{client.email}</div>}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 text-center">
                                                        <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wide border
                                                            ${client.estado === 'ACTIVO'
                                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                                : 'bg-red-50 text-red-600 border-red-100'}`}>
                                                            {client.estado}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                                <div className="flex p-1.5 bg-slate-50 border border-slate-100 rounded-2xl gap-1 shadow-sm">
                                                    {client.telefono && (
                                                        <a
                                                            href={`https://wa.me/${client.telefono.replace(/\D/g, '')}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-white hover:shadow-md rounded-xl transition-all"
                                                            title="WhatsApp"
                                                        >
                                                            <MessageCircle size={18} />
                                                        </a>
                                                    )}
                                                    <div className="w-[1px] h-4 bg-slate-200 self-center mx-1"></div>
                                                    <button
                                                        onClick={() => handleHistory(client)}
                                                        className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-md rounded-xl transition-all"
                                                        title="Historial de Compras"
                                                    >
                                                        <History size={18} />
                                                    </button>
                                                    <div className="w-[1px] h-4 bg-slate-200 self-center mx-1"></div>
                                                    <button
                                                        onClick={() => handleEdit(client)}
                                                        className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-md rounded-xl transition-all"
                                                        title="Editar Cliente"
                                                    >
                                                        <Pencil size={18} />
                                                    </button>
                                                    <div className="w-[1px] h-4 bg-slate-200 self-center mx-1"></div>

                                                    {client.estado === 'INACTIVO' ? (
                                                        <button
                                                            onClick={() => handleReactivate(client)}
                                                            className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-white hover:shadow-md rounded-xl transition-all"
                                                            title="Reactivar Cliente"
                                                        >
                                                            <UserCheck size={18} />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleDelete(client)}
                                                            className="p-2.5 text-slate-300 hover:text-red-600 hover:bg-white hover:shadow-md rounded-xl transition-all"
                                                            title="Dar de baja"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    )}
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
                    </div>
                </div>
            </div>

            <ClientForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSuccess={loadClients}
                clientToEdit={selectedClient}
            />

            {historyClient && (
                <ClientHistoryModal
                    isOpen={isHistoryOpen}
                    onClose={() => setIsHistoryOpen(false)}
                    clientId={historyClient.cliente_id}
                    clientName={`${historyClient.nombre} ${historyClient.paterno || ''}`}
                />
            )}
            {/* Premium Confirm Dialog */}
            <ConfirmDialog
                {...confirmConfig}
                onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
            />
        </>
    );
};
