
import { useEffect, useState, useMemo } from 'react';
import { notificationsService, type Notificacion } from '../../services/notificationsService';
import {
    Bell, Check, CheckCheck, AlertTriangle, Info, Clock,
    AlertOctagon, Trash2, Search, Filter, ArrowRight,
    Settings, Package, ShoppingCart, Trash
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export const NotificationsPage = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notificacion[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const data = await notificationsService.getAll();
            setNotifications(data);
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id: number) => {
        try {
            await notificationsService.markAsRead(id);
            setNotifications(prev => prev.map(n =>
                n.notificacion_id === id ? { ...n, leida: true } : n
            ));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationsService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, leida: true })));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await notificationsService.delete(id);
            setNotifications(prev => prev.filter(n => n.notificacion_id !== id));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const handleClearRead = async () => {
        try {
            await notificationsService.deleteAllRead();
            setNotifications(prev => prev.filter(n => !n.leida));
        } catch (error) {
            console.error('Error clearing read notifications:', error);
        }
    };

    const filteredNotifications = useMemo(() => {
        return notifications.filter(n => {
            const matchesTab = filter === 'unread' ? !n.leida : true;
            const matchesType = typeFilter === 'all' ? true : n.tipo === typeFilter;
            const matchesSearch = n.mensaje.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                n.tipo.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesTab && matchesType && matchesSearch;
        });
    }, [notifications, filter, typeFilter, searchTerm]);

    const groupedNotifications = useMemo(() => {
        const groups: { [key: string]: Notificacion[] } = {};
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        filteredNotifications.forEach(n => {
            const date = new Date(n.fecha_envio);
            const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());

            let label = 'Anteriores';
            if (d.getTime() === today.getTime()) label = 'Hoy';
            else if (d.getTime() === yesterday.getTime()) label = 'Ayer';
            else label = d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

            if (!groups[label]) groups[label] = [];
            groups[label].push(n);
        });
        return groups;
    }, [filteredNotifications]);

    const unreadCount = notifications.filter(n => !n.leida).length;

    const getIcon = (tipo: string) => {
        switch (tipo) {
            case 'STOCK_BAJO': return <AlertTriangle className="text-amber-500" />;
            case 'STOCK_AGOTADO': return <AlertOctagon className="text-red-500" />;
            case 'NUEVA_VENTA': return <CheckCheck className="text-emerald-500" />;
            default: return <Info className="text-blue-500" />;
        }
    };

    const getAction = (notification: Notificacion) => {
        switch (notification.tipo) {
            case 'STOCK_BAJO':
            case 'STOCK_AGOTADO':
                return {
                    label: 'Gestionar Inventario',
                    icon: <Package size={14} />,
                    onClick: () => navigate('/owner/inventory') // Assuming this route exists
                };
            case 'NUEVA_VENTA':
                return {
                    label: 'Ver Venta',
                    icon: <ShoppingCart size={14} />,
                    onClick: () => navigate('/owner/sales') // Assuming this route exists
                };
            default:
                return null;
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
    };

    if (loading) {
        return (
            <div className="container mx-auto max-w-4xl p-6">
                <div className="h-20 bg-slate-100 rounded-2xl animate-pulse mb-8" />
                <div className="space-y-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-24 bg-slate-50 rounded-2xl animate-pulse border border-slate-100" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-5xl p-6 lg:p-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h1 className="text-4xl font-extrabold text-slate-900 flex items-center gap-4">
                        <div className="bg-teal-500 p-3 rounded-2xl text-white shadow-lg shadow-teal-200">
                            <Bell size={32} />
                        </div>
                        Notificaciones
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">Central de actividad y alertas de tu negocio.</p>
                </motion.div>

                <motion.div
                    className="flex flex-wrap gap-3"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <button
                        onClick={handleMarkAllAsRead}
                        className="px-6 py-3 text-sm font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-xl transition-all flex items-center gap-2 border border-teal-100 disabled:opacity-50"
                        disabled={unreadCount === 0}
                    >
                        <CheckCheck size={18} />
                        Marcar todo leído
                    </button>
                    <button
                        onClick={handleClearRead}
                        className="px-6 py-3 text-sm font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all flex items-center gap-2 border border-slate-200"
                    >
                        <Trash2 size={18} />
                        Limpiar leídas
                    </button>
                </motion.div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Fixed Sidebar for Filters */}
                <aside className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Filter size={18} className="text-teal-500" />
                            Filtros
                        </h2>

                        <div className="space-y-2">
                            <button
                                onClick={() => setFilter('all')}
                                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                                    filter === 'all'
                                    ? 'bg-teal-50 text-teal-700'
                                    : 'text-slate-500 hover:bg-slate-50'
                                }`}
                            >
                                Todas las notificaciones
                            </button>
                            <button
                                onClick={() => setFilter('unread')}
                                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-between ${
                                    filter === 'unread'
                                    ? 'bg-teal-50 text-teal-700'
                                    : 'text-slate-500 hover:bg-slate-50'
                                }`}
                            >
                                No leídas
                                {unreadCount > 0 && (
                                    <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                        </div>

                        <hr className="my-6 border-slate-100" />

                        <div className="space-y-4">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tipo</label>
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-teal-500/20"
                            >
                                <option value="all">Cualquier tipo</option>
                                <option value="STOCK_BAJO">Stock bajo</option>
                                <option value="STOCK_AGOTADO">Stock agotado</option>
                                <option value="NUEVA_VENTA">Nuevas ventas</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-teal-500 to-emerald-600 p-6 rounded-3xl text-white shadow-xl shadow-teal-100">
                        <Settings className="mb-4 opacity-50" size={24} />
                        <h3 className="font-bold mb-2">Configuración</h3>
                        <p className="text-teal-50 text-xs leading-relaxed mb-4">Personaliza tus alertas por correo o notificaciones push.</p>
                        <button className="w-full py-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-bold transition-all">
                            Configurar
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="lg:col-span-3 space-y-8">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar en notificaciones..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl shadow-sm border border-slate-100 focus:outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 transition-all font-medium text-slate-700"
                        />
                    </div>

                    <AnimatePresence mode="popLayout">
                        {Object.keys(groupedNotifications).length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-3xl border border-slate-100 p-16 text-center shadow-sm"
                            >
                                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                                    <Bell size={48} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">Nada por aquí</h3>
                                <p className="text-slate-500 max-w-xs mx-auto">No encontramos notificaciones que coincidan con tus filtros actuales.</p>
                                <button
                                    onClick={() => {setFilter('all'); setTypeFilter('all'); setSearchTerm('')}}
                                    className="mt-6 text-teal-600 font-bold hover:underline"
                                >
                                    Limpiar todos los filtros
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="space-y-12"
                            >
                                {Object.entries(groupedNotifications).map(([label, items]) => (
                                    <div key={label} className="space-y-4">
                                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] pl-2">
                                            {label}
                                        </h3>
                                        <div className="space-y-3">
                                            <AnimatePresence mode="popLayout">
                                                {items.map((notification) => {
                                                    const action = getAction(notification);
                                                    return (
                                                        <motion.div
                                                            key={notification.notificacion_id}
                                                            variants={itemVariants}
                                                            layout
                                                            className={`group relative bg-white rounded-2xl border transition-all hover:shadow-md hover:border-slate-300 p-5 flex gap-5 ${
                                                                notification.leida ? 'border-slate-100 opacity-80' : 'border-teal-100 shadow-sm shadow-teal-50/50'
                                                            }`}
                                                        >
                                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border ${
                                                                notification.tipo.includes('STOCK') ? 'bg-orange-50 border-orange-100' :
                                                                notification.tipo === 'NUEVA_VENTA' ? 'bg-emerald-50 border-emerald-100' :
                                                                'bg-slate-50 border-slate-100'
                                                            }`}>
                                                                {getIcon(notification.tipo)}
                                                            </div>

                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex justify-between items-start gap-4 mb-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <h4 className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors capitalize">
                                                                            {notification.tipo.toLowerCase().replace('_', ' ')}
                                                                        </h4>
                                                                        {!notification.leida && (
                                                                            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                                                                        )}
                                                                    </div>
                                                                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 whitespace-nowrap bg-slate-50 px-2 py-1 rounded-full uppercase tracking-wider">
                                                                        <Clock size={10} />
                                                                        {new Date(notification.fecha_envio).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                                    </span>
                                                                </div>

                                                                <p className="text-slate-600 text-[13px] leading-relaxed mb-4">
                                                                    {notification.mensaje}
                                                                </p>

                                                                <div className="flex flex-wrap items-center gap-4">
                                                                    {action && (
                                                                        <button
                                                                            onClick={action.onClick}
                                                                            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-2"
                                                                        >
                                                                            {action.icon}
                                                                            {action.label}
                                                                            <ArrowRight size={12} />
                                                                        </button>
                                                                    )}
                                                                    {!notification.leida && (
                                                                        <button
                                                                            onClick={() => handleMarkAsRead(notification.notificacion_id)}
                                                                            className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1.5"
                                                                        >
                                                                            <div className="w-5 h-5 bg-teal-50 rounded-full flex items-center justify-center">
                                                                                <Check size={12} />
                                                                            </div>
                                                                            Marcar leído
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Deletion Overlay Action */}
                                                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    onClick={() => handleDelete(notification.notificacion_id)}
                                                                    className="p-2 text-slate-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all"
                                                                    title="Eliminar notificación"
                                                                >
                                                                    <Trash size={16} />
                                                                </button>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};
