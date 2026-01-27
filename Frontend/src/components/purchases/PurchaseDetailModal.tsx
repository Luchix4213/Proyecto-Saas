import { X, Calendar, User, Truck, Package, CreditCard, FileText } from 'lucide-react';
import type { Compra } from '../../services/purchasesService';

interface PurchaseDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    purchase: Compra | null;
}

export const PurchaseDetailModal = ({ isOpen, onClose, purchase }: PurchaseDetailModalProps) => {
    if (!purchase || !isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl border border-white overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">Detalle de Compra</h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">ID: #{purchase.compra_id}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-100 shadow-sm hover:shadow-md"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="px-8 py-6 max-h-[70vh] overflow-y-auto">
                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-6 mb-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 rounded-xl text-indigo-500">
                                    <Calendar size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha</p>
                                    <p className="text-sm font-bold text-slate-700">{new Date(purchase.fecha_compra).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-50 rounded-xl text-emerald-500">
                                    <Truck size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Proveedor</p>
                                    <p className="text-sm font-bold text-slate-700">{purchase.proveedor?.nombre || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 rounded-xl text-blue-500">
                                    <User size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registrado por</p>
                                    <p className="text-sm font-bold text-slate-700">{purchase.usuario?.nombre || 'Sistema'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-50 rounded-xl text-purple-500">
                                    <CreditCard size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pago</p>
                                    <p className="text-sm font-bold text-slate-700">{purchase.metodo_pago}</p>
                                    <span className="inline-flex px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-wider mt-1">
                                        {purchase.estado}
                                    </span>
                                    {purchase.comprobante_url && (
                                        <div className="mt-2">
                                            <a
                                                href={`http://localhost:3000${purchase.comprobante_url}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-1"
                                            >
                                                <FileText size={10} />
                                                Ver Comprobante
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {purchase.nro_factura && (
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 rounded-xl text-slate-500">
                                        <FileText size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Factura</p>
                                        <p className="text-sm font-bold text-slate-700">#{purchase.nro_factura}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {purchase.observaciones && (
                        <div className="mb-6 bg-amber-50 rounded-2xl p-4 border border-amber-100">
                            <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">Observaciones</p>
                            <p className="text-sm font-medium text-slate-700 italic">"{purchase.observaciones}"</p>
                        </div>
                    )}

                    {/* Products Table */}
                    <div className="bg-slate-50 rounded-3xl border border-slate-100 overflow-hidden">
                        <table className="w-full">
                            <thead className="border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Producto</th>
                                    <th className="px-4 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Cant.</th>
                                    <th className="px-4 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Costo U.</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {purchase.detalles.map((detalle: any) => (
                                    <tr key={detalle.detalle_compra_id} className="hover:bg-white transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-1.5 bg-white rounded-lg border border-slate-100 text-slate-400">
                                                    <Package size={14} />
                                                </div>
                                                <span className="text-sm font-bold text-slate-700">{detalle.producto?.nombre || 'Producto eliminado'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center text-sm font-bold text-slate-600">{detalle.cantidad}</td>
                                        <td className="px-4 py-4 text-right text-sm font-bold text-slate-600">{Number(detalle.precio_unitario).toLocaleString('es-BO', { minimumFractionDigits: 2 })}</td>
                                        <td className="px-6 py-4 text-right text-sm font-black text-slate-800">{Number(detalle.subtotal).toLocaleString('es-BO', { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-white border-t border-slate-200">
                                <tr>
                                    <td colSpan={3} className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Compra</td>
                                    <td className="px-6 py-4 text-right text-lg font-black text-indigo-600">
                                        {Number(purchase.total).toLocaleString('es-BO', { minimumFractionDigits: 2 })} <span className="text-xs font-bold text-slate-400">BOB</span>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
                    >
                        Cerrar Detalle
                    </button>
                </div>
            </div>
        </div>
    );
};
