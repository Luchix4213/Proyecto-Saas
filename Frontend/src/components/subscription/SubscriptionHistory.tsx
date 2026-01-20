import React from 'react';
import { Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { type Suscripcion } from '../../services/suscripcionesService';

interface SubscriptionHistoryProps {
    subscriptions: Suscripcion[];
}

export const SubscriptionHistory: React.FC<SubscriptionHistoryProps> = ({ subscriptions }) => {
    return (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-8 py-8 border-b border-slate-50">
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
                    <Clock className="text-teal-500" />
                    Historial de Pagos
                </h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50 text-slate-400 text-xs font-black uppercase tracking-wider">
                        <tr>
                            <th className="px-8 py-5">Fecha</th>
                            <th className="px-8 py-5">Plan</th>
                            <th className="px-8 py-5">Periodo</th>
                            <th className="px-8 py-5">Monto</th>
                            <th className="px-8 py-5">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-sm">
                        {subscriptions.map((sub) => {
                            const statusConfig = getStatusConfig(sub.estado);
                            const StatusIcon = statusConfig.icon;

                            return (
                                <tr key={sub.suscripcion_id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-8 py-5 font-bold text-slate-700">
                                        {sub.creado_en ? new Date(sub.creado_en).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="px-8 py-5 font-bold text-slate-900 group-hover:text-teal-600 transition-colors">
                                        {sub.plan?.nombre_plan}
                                    </td>
                                    <td className="px-8 py-5 text-slate-500 font-medium">
                                        {sub.fecha_inicio ? new Date(sub.fecha_inicio).toLocaleDateString() : '-'}
                                        <span className="mx-2 text-slate-300">→</span>
                                        {sub.fecha_fin ? new Date(sub.fecha_fin).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="px-8 py-5 font-black text-slate-800">
                                        {sub.monto} BOB
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${statusConfig.className}`}>
                                            <StatusIcon size={12} strokeWidth={3} />
                                            {sub.estado === 'CANCELADA' ? 'CANCELADA' : sub.estado}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                        {subscriptions.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-8 py-16 text-center">
                                    <div className="flex flex-col items-center justify-center text-slate-400 gap-3">
                                        <Clock size={48} strokeWidth={1} className="opacity-50" />
                                        <p className="font-bold">No hay historial disponible.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const getStatusConfig = (status: string) => {
    switch (status) {
        case 'ACTIVA':
            return { className: 'bg-emerald-100 text-emerald-700', icon: CheckCircle };
        case 'PENDIENTE':
            return { className: 'bg-blue-100 text-blue-700', icon: Clock };
        case 'CANCELADA':
            return { className: 'bg-red-100 text-red-700', icon: XCircle };
        default:
            return { className: 'bg-slate-100 text-slate-700', icon: AlertTriangle };
    }
};
