import React from 'react';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
import { type Suscripcion } from '../../services/suscripcionesService';

interface ActiveSubscriptionCardProps {
    subscription: Suscripcion | undefined;
    onCancel: (id: number) => void;
    canCancel: boolean;
}

export const ActiveSubscriptionCard: React.FC<ActiveSubscriptionCardProps> = ({ subscription, onCancel, canCancel }) => {
    if (!subscription) {
        return (
            <div className="bg-slate-900 rounded-[2.5rem] p-12 text-center relative overflow-hidden group shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500 rounded-full blur-[100px] opacity-20 -mr-16 -mt-16 animate-pulse"></div>

                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mb-6 backdrop-blur-sm border border-white/10 group-hover:scale-110 transition-transform">
                        <ShieldCheck size={40} className="text-teal-400" />
                    </div>
                    <h3 className="text-3xl font-black text-white mb-2 tracking-tight">Sin suscripción activa</h3>
                    <p className="text-slate-400 mb-8 max-w-md text-lg font-medium">Selecciona un plan para desbloquear todas las funcionalidades premium de Kipu y potenciar tu negocio.</p>
                </div>
            </div>
        );
    }

    const { plan, estado, fecha_fin, monto } = subscription;
    const isCancelled = estado === 'CANCELADA';

    return (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden relative group hover:shadow-xl transition-all duration-500">
            <div className={`absolute top-0 inset-x-0 h-2 bg-gradient-to-r ${isCancelled ? 'from-red-500 to-orange-500' : 'from-teal-500 via-emerald-500 to-teal-500 animate-gradient-x'}`}></div>

            <div className="p-8 md:p-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <div>
                        <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Tu Plan Actual</div>
                        <h2 className="text-4xl font-black text-slate-900 mb-1">{plan?.nombre_plan}</h2>
                         <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide ${isCancelled ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                {isCancelled ? 'Cancelada (Periodo de gracia)' : 'Suscripción Activa'}
                            </span>
                        </div>
                    </div>

                    <div className="text-right">
                         <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Próximo Pago</div>
                         <div className="text-2xl font-network text-slate-800 font-bold">
                            {fecha_fin ? new Date(fecha_fin).toLocaleDateString() : 'Indefinido'}
                         </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatBox label="Precio del Plan" value={`${monto} BOB`} />
                    <StatBox label="Usuarios Máximos" value={(plan?.max_usuarios ?? 0).toString()} />
                    <StatBox label="Productos Máximos" value={(plan?.max_productos ?? 0).toString()} />
                </div>

                {canCancel && !isCancelled && (
                    <div className="pt-8 border-t border-slate-100 flex justify-end">
                        <button
                            className="text-red-500 hover:text-red-600 font-bold text-sm hover:underline flex items-center gap-1 transition-colors"
                            onClick={() => onCancel(subscription.suscripcion_id)}
                        >
                            <AlertTriangle size={16} /> Cancelar Suscripción
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const StatBox = ({ label, value }: { label: string, value: string }) => (
    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</div>
        <div className="text-xl font-black text-slate-800">{value}</div>
    </div>
);
