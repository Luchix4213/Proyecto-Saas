import { useEffect, useState } from 'react';
import { clientsService, type Cliente } from '../../services/clientsService';
import { Users, RefreshCw, Search, Building2, Phone, Mail, Ban } from 'lucide-react';


export const AdminClientsPage = () => {
    const [clients, setClients] = useState<Cliente[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchClients(searchTerm);
        }, 300); // debounce
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchClients = async (search?: string) => {
        try {
            setLoading(true);
            const data = await clientsService.getAllGlobal(search);
            setClients(data);
            setError('');
        } catch (err) {
            setError('Error al cargar la lista de clientes global');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                        <Users className="text-teal-600" />
                        Búsqueda Global de Clientes
                    </h1>
                    <p className="text-slate-500 mt-1">Busca clientes en todas las microempresas registradas.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => fetchClients(searchTerm)}
                        className="p-2.5 text-slate-400 hover:text-teal-600 bg-white border border-slate-200 hover:border-teal-200 rounded-xl transition-all shadow-sm"
                        title="Refrescar lista"
                    >
                        <RefreshCw size={20} />
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center gap-3">
                    <Ban size={20} />
                    <span className="font-medium">{error}</span>
                </div>
            )}

            {/* Content Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Toolbar */}
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
                    <div className="relative w-full sm:w-96 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, apellido o empresa..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Cliente</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Empresa (Tenant)</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contacto</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Fecha Registro</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent"></div>
                                            <span className="text-sm font-medium text-slate-500">Cargando clientes...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : clients.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        No se encontraron clientes que coincidan con la búsqueda.
                                    </td>
                                </tr>
                            ) : (
                                clients.map((client) => (
                                    <tr key={client.cliente_id} className="group hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 font-bold uppercase">
                                                    {client.nombre.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-800">{client.nombre} {client.paterno} {client.materno}</div>
                                                    {client.nit_ci && <div className="text-xs text-slate-400 font-mono">CI/NIT: {client.nit_ci}</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {client.tenant ? (
                                                <div className="flex items-center gap-2 text-slate-700">
                                                    <Building2 size={16} className="text-slate-400" />
                                                    <span className="font-medium">{client.tenant.nombre_empresa}</span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 italic">--</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                {client.telefono && (
                                                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                                        <Phone size={14} className="text-slate-400" />
                                                        {client.telefono}
                                                    </div>
                                                )}
                                                {client.email && (
                                                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                                        <Mail size={14} className="text-slate-400" />
                                                        {client.email}
                                                    </div>
                                                )}
                                                {!client.telefono && !client.email && (
                                                    <span className="text-slate-400 italic text-xs">Sin contacto</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${client.estado === 'ACTIVO' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                    'bg-slate-100 text-slate-600 border-slate-200'
                                                }`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${client.estado === 'ACTIVO' ? 'bg-emerald-500' :
                                                        'bg-slate-500'
                                                    }`}></span>
                                                {client.estado}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm text-slate-500 whitespace-nowrap">
                                            {new Date(client.fecha_registro).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
