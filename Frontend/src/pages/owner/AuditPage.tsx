import { useEffect, useState } from 'react';
import { ShieldCheck, Search, Filter, Activity, User, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { auditService } from '../../services/auditService';
import { AestheticHeader } from '../../components/common/AestheticHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const AuditPage = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [moduleFilter, setModuleFilter] = useState('TODOS');

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        setLoading(true);
        try {
            const data = await auditService.getMyTenantLogs();
            setLogs(data);
        } catch (error) {
            console.error('Error cargando logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const modules = ['TODOS', ...new Set(logs.map(log => log.modulo))];

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.detalle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (log.usuario?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.accion.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesModule = moduleFilter === 'TODOS' || log.modulo === moduleFilter;
        return matchesSearch && matchesModule;
    });

    const getActionColor = (action: string) => {
        switch (action) {
            case 'CREAR': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'EDITAR': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'ELIMINAR': return 'bg-rose-100 text-rose-700 border-rose-200';
            case 'LOGIN': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'REGISTRO': return 'bg-purple-100 text-purple-700 border-purple-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="space-y-6">
            <AestheticHeader
                title="Historial de Auditoría"
                description="Registro detallado de acciones y cambios en el sistema"
                icon={ShieldCheck}
                iconColor="from-slate-700 to-slate-900"
            />

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por usuario, acción o detalle..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Filter size={18} className="text-slate-400" />
                    <select
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all text-sm font-medium"
                        value={moduleFilter}
                        onChange={(e) => setModuleFilter(e.target.value)}
                    >
                        {modules.map(mod => (
                            <option key={mod} value={mod}>{mod}</option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={loadLogs}
                    className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                    title="Actualizar"
                >
                    <Activity size={20} />
                </button>
            </div>

            {/* Logs List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {loading ? (
                    <div className="p-20 flex justify-center">
                        <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
                    </div>
                ) : filteredLogs.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha y Hora</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Usuario</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Módulo</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Acción</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Detalle</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                <AnimatePresence mode="popLayout">
                                    {filteredLogs.map((log) => (
                                        <motion.tr
                                            key={log.log_id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="hover:bg-slate-50/50 transition-colors group"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-slate-700">
                                                        {format(new Date(log.fecha_hora), 'dd MMM, yyyy', { locale: es })}
                                                    </span>
                                                    <span className="text-xs text-slate-400 font-medium">
                                                        {format(new Date(log.fecha_hora), 'HH:mm:ss')}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                                        <User size={14} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-slate-700">
                                                            {log.usuario ? `${log.usuario.nombre} ${log.usuario.paterno || ''}` : 'Sistema'}
                                                        </span>
                                                        <span className="text-xs text-slate-400">{log.usuario?.email || '-'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200 uppercase">
                                                    {log.modulo}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${getActionColor(log.accion)}`}>
                                                    {log.accion}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 max-w-xs">
                                                    <p className="text-sm text-slate-600 truncate group-hover:whitespace-normal group-hover:overflow-visible group-hover:truncate-none transition-all">
                                                        {log.detalle}
                                                    </p>
                                                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                                                        <div className="relative group/meta flex-shrink-0">
                                                            <Info size={14} className="text-slate-300 hover:text-slate-500 cursor-help" />
                                                            <div className="absolute left-full ml-2 top-0 invisible group-hover/meta:visible bg-slate-900 text-white text-[10px] p-3 rounded-lg w-64 z-50 font-mono overflow-auto max-h-48 shadow-xl border border-white/10">
                                                                <pre className="whitespace-pre-wrap">{JSON.stringify(log.metadata, null, 2)}</pre>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <EmptyState
                        title="No se encontraron registros"
                        description="Aún no hay actividad registrada o los filtros son muy estrictos."
                        icon={ShieldCheck}
                    />
                )}
            </div>
        </div>
    );
};
