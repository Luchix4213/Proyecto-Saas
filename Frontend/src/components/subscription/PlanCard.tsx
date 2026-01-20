import React from 'react';
import { Check, X } from 'lucide-react';
import { type Plan } from '../../services/planesService';

interface PlanCardProps {
    plan: Plan;
    isCurrentPlan: boolean;
    billingCycle: 'MENSUAL' | 'ANUAL';
    onSelect: (plan: Plan) => void;
}

export const PlanCard: React.FC<PlanCardProps> = ({ plan, isCurrentPlan, billingCycle, onSelect }) => {
    return (
        <div className={`bg-white rounded-[2.5rem] shadow-sm border p-8 flex flex-col relative overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-2 group ${isCurrentPlan ? 'border-teal-500 ring-2 ring-teal-500 ring-opacity-10' : 'border-slate-100 hover:border-teal-200'}`}>
            {isCurrentPlan && (
                <div className="absolute top-0 right-0 left-0 bg-teal-50 text-teal-700 text-xs font-black text-center py-2 uppercase tracking-widest">
                    Plan Actual
                </div>
            )}

            <div className={`flex flex-col h-full ${isCurrentPlan ? 'pt-8' : ''}`}>
                <div className="mb-6">
                    <h3 className="text-2xl font-black text-slate-800 mb-2">{plan.nombre_plan}</h3>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed">{plan.descripcion}</p>
                </div>

                <div className="mb-8 p-6 bg-slate-50 rounded-2xl group-hover:bg-teal-50/30 transition-colors">
                    <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-black text-slate-900 tracking-tight">
                            {billingCycle === 'MENSUAL' ? plan.precio_mensual : plan.precio_anual}
                        </span>
                        <span className="text-xl font-bold text-slate-500">BOB</span>
                    </div>
                    <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-2">
                        Facturado {billingCycle === 'MENSUAL' ? 'mensualmente' : 'anualmente'}
                    </div>
                    {billingCycle === 'ANUAL' && plan.precio_anual < (plan.precio_mensual * 12) && (
                        <div className="mt-3 inline-flex items-center gap-2">
                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg font-bold">
                                Ahorras {((plan.precio_mensual * 12) - plan.precio_anual).toFixed(0)} BOB
                            </span>
                        </div>
                    )}
                </div>

                <div className="space-y-4 flex-1 mb-8">
                    <FeatureItem icon={Check} label={`Hasta ${plan.max_usuarios} usuarios`} />
                    <FeatureItem icon={Check} label={`Hasta ${plan.max_productos} productos`} />
                    <FeatureItem
                        icon={plan.ventas_online ? Check : X}
                        label="Ventas Online"
                        active={plan.ventas_online}
                    />
                    <FeatureItem
                        icon={plan.reportes_avanzados ? Check : X}
                        label="Reportes Avanzados"
                        active={plan.reportes_avanzados}
                    />
                </div>

                <button
                    onClick={() => onSelect(plan)}
                    disabled={isCurrentPlan}
                    className={`w-full py-4 rounded-2xl font-black text-lg transition-all transform active:scale-[0.98] ${isCurrentPlan
                        ? 'bg-slate-100 text-slate-400 cursor-default'
                        : 'bg-slate-900 text-white hover:bg-teal-600 shadow-xl shadow-slate-900/10 hover:shadow-teal-500/20'
                        }`}
                >
                    {isCurrentPlan ? 'Plan Actual' : 'Seleccionar Plan'}
                </button>
            </div>
        </div>
    );
};

const FeatureItem = ({ icon: Icon, label, active = true }: { icon: any, label: string, active?: boolean }) => (
    <div className={`flex items-center gap-3 text-sm ${active ? 'text-slate-700' : 'text-slate-300'}`}>
        <div className={`p-1.5 rounded-full shrink-0 ${active ? 'bg-teal-50 text-teal-600' : 'bg-slate-50 text-slate-300'}`}>
            <Icon size={14} strokeWidth={active ? 3 : 2} />
        </div>
        <span className="font-bold">{label}</span>
    </div>
);
