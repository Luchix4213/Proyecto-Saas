import React from 'react';
import { CheckCircle, Printer, Plus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { type Venta } from '../../services/salesService';

interface PostSaleModalProps {
    sale: Venta | null;
    onNewSale: () => void;
}

export const PostSaleModal: React.FC<PostSaleModalProps> = ({ sale, onNewSale }) => {
    if (!sale) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in relative">

                {/* Decorative Header */}
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg animate-bounce-short">
                            <CheckCircle size={32} className="text-emerald-500" />
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-tight">¡Venta Exitosa!</h2>
                        <p className="text-emerald-100 font-medium mt-1">
                            Orden #{sale.venta_id} registrada correctamente
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    <div className="space-y-4">

                        {/* Dynamic Receipt/Invoice Button */}
                        {sale.comprobante_pdf && (
                            <a
                                href={`http://localhost:3000${sale.comprobante_pdf}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl group hover:border-emerald-500 hover:bg-emerald-50/50 transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white rounded-xl shadow-sm text-slate-400 group-hover:text-emerald-600 transition-colors">
                                        <Printer size={24} />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-slate-800 text-lg group-hover:text-emerald-700">Imprimir Comprobante</p>
                                        <p className="text-xs text-slate-500 font-medium">Ticket / Factura</p>
                                    </div>
                                </div>
                                <ArrowRight size={20} className="text-slate-300 group-hover:text-emerald-500 transform group-hover:translate-x-1 transition-all" />
                            </a>
                        )}

                        <div className="h-px bg-slate-100 my-4" />

                        {/* Primary Actions */}
                        <div className="grid grid-cols-2 gap-4">
                             <Link
                                to="/app/ventas/historial"
                                className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                                Ver Historial
                            </Link>

                            <button
                                onClick={onNewSale}
                                className="flex items-center justify-center gap-2 py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/30 transition-all transform hover:-translate-y-0.5"
                            >
                                <Plus size={18} />
                                Nueva Venta
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
