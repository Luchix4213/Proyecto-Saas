
import { useEffect, useState } from 'react';
import { notificationsService, type Notificacion } from '../../services/notificationsService';
import { Bell, Check, CheckCheck, AlertTriangle, Info, Clock, AlertOctagon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const NotificationsPage = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notificacion[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

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

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.leida;
        return true;
    });

    const unreadCount = notifications.filter(n => !n.leida).length;

    const getIcon = (tipo: string) => {
        switch (tipo) {
            case 'STOCK_BAJO': return <AlertTriangle className="text-amber-500" />;
            case 'STOCK_AGOTADO': return <AlertOctagon className="text-red-500" />;
            case 'NUEVA_VENTA': return <CheckCheck className="text-emerald-500" />;
            default: return <Info className="text-blue-500" />;
        }
    };

    const getBgColor = (tipo: string) => {
        switch (tipo) {
            case 'STOCK_BAJO': return 'bg-amber-50 border-amber-100';
            case 'STOCK_AGOTADO': return 'bg-red-50 border-red-100';
            case 'NUEVA_VENTA': return 'bg-emerald-50 border-emerald-100';
            default: return 'bg-slate-50 border-slate-100';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-4xl p-6 animate-fade-in-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <Bell className="text-teal-600" size={32} />
                        Notificaciones
                    </h1>
                    <p className="text-slate-500 mt-1">Mantente al día con lo que sucede en tu negocio.</p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => handleMarkAllAsRead()}
                        className="px-4 py-2 text-sm font-semibold text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors flex items-center gap-2"
                        disabled={unreadCount === 0}
                    >
                        <CheckCheck size={16} />
                        Marcar todo como leído
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-slate-100">
                    <button
                        onClick={() => setFilter('all')}
                        className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${
                            filter === 'all'
                            ? 'border-teal-500 text-teal-600 bg-teal-50/10'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                        Todas
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${
                            filter === 'unread'
                            ? 'border-teal-500 text-teal-600 bg-teal-50/10'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                        No leídas
                        {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* List */}
                <div className="divide-y divide-slate-100">
                    {filteredNotifications.length === 0 ? (
                        <div className="p-12 text-center text-slate-400">
                            <Bell size={48} className="mx-auto mb-4 opacity-20" />
                            <p>No tienes notificaciones {filter === 'unread' ? 'sin leer' : ''}.</p>
                        </div>
                    ) : (
                        filteredNotifications.map((notification) => (
                            <div
                                key={notification.notificacion_id}
                                className={`p-5 transition-colors hover:bg-slate-50 flex gap-4 ${notification.leida ? 'opacity-75' : 'bg-white'}`}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${getBgColor(notification.tipo)}`}>
                                    {getIcon(notification.tipo)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-slate-800 text-sm">{notification.tipo.replace('_', ' ')}</h3>
                                        <span className="text-xs text-slate-400 flex items-center gap-1">
                                            <Clock size={12} />
                                            {new Date(notification.fecha_envio).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-slate-600 text-sm mb-3">
                                        {notification.mensaje}
                                    </p>
                                    {!notification.leida && (
                                        <button
                                            onClick={() => handleMarkAsRead(notification.notificacion_id)}
                                            className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                                        >
                                            <Check size={14} />
                                            Marcar como leída
                                        </button>
                                    )}
                                </div>
                                {!notification.leida && (
                                    <div className="w-2 h-2 rounded-full bg-teal-500 shrink-0 mt-2"></div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
