
import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Truck, CheckCircle, XCircle, Loader, User, FileText } from 'lucide-react';

interface Venta {
    venta_id: number;
    fecha_venta: string;
    total: number;
    estado: string;
    estado_entrega: string;
    tipo_venta: string;
    comprobante_pago?: string;
    cliente?: {
        nombre: string;
        email: string;
        nit_ci?: string;
    };
    detalles: Array<{
        producto: { nombre: string; };
        cantidad: number;
        subtotal: number;
    }>;
}

export const OnlineSalesPage = () => {


    const [sales, setSales] = useState<Venta[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('REGISTRADA'); // Default to pending verification
    const [selectedSale, setSelectedSale] = useState<Venta | null>(null);

    useEffect(() => {
        loadSales();
    }, []);

    const loadSales = async () => {
        setLoading(true);
        try {
            const response = await api.get('/ventas');
            // Client-side filter for now as backend returns all
            // Ideally backend supports filtering
            const allSales = response.data;
            setSales(allSales.filter((v: Venta) => v.tipo_venta === 'ONLINE'));
        } catch (error) {
            console.error('Error loading sales:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: number) => {
        if (!window.confirm('¿Confirmar pago y descontar stock?')) return;
        try {
            await api.patch(`/ventas/${id}/aprobar`);
            loadSales();
            setSelectedSale(null);
            alert('Pago aprobado correctamente');
        } catch (error) {
            console.error(error);
            alert('Error al aprobar pago');
        }
    };

    const handleReject = async (id: number) => {
        if (!window.confirm('¿Rechazar venta?')) return;
        try {
            await api.patch(`/ventas/${id}/rechazar`);
            loadSales();
            setSelectedSale(null);
        } catch (error) {
            alert('Error al rechazar');
        }
    };

    const handleDeliver = async (id: number) => {
        if (!window.confirm('¿Marcar como Entregado?')) return;
        try {
            await api.patch(`/ventas/${id}/entregar`);
            loadSales();
        } catch (error) {
            alert('Error al actualizar estado');
        }
    };

    const filteredSales = sales.filter(s => {
        if (filterStatus === 'TODAS') return true;
        return s.estado === filterStatus;
    });

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Ventas Online</h1>
                    <p className="text-slate-500 font-medium mt-1">Gestiona pedidos y verifica pagos QR</p>
                </div>

                {/* Stats Cards (Optional/Simple) */}
                <div className="flex gap-4">
                    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
                        <div className="h-10 w-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600 font-bold">
                            {sales.filter(s => s.estado === 'REGISTRADA').length}
                        </div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pendientes</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 border-b border-slate-200 pb-4 overflow-x-auto">
                {['REGISTRADA', 'PAGADA', 'CANCELADA', 'TODAS'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${filterStatus === status
                            ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                            : 'bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                    >
                        {status === 'REGISTRADA' ? 'Por Verificar' : status}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden">
                {loading ? (
                    <div className="p-12 flex justify-center"><Loader className="animate-spin text-teal-600" /></div>
                ) : filteredSales.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 font-medium">No hay ventas en este estado</div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="text-left py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest">ID</th>
                                <th className="text-left py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest">Cliente</th>
                                <th className="text-left py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest">Total</th>
                                <th className="text-left py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest">Comprobante</th>
                                <th className="text-left py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest">Estado Ent.</th>
                                <th className="text-left py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest">Estado Pago</th>
                                <th className="text-right py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredSales.map(sale => (
                                <tr key={sale.venta_id} className="hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => setSelectedSale(sale)}>
                                    <td className="py-4 px-6 font-mono text-xs font-bold text-slate-400">#{sale.venta_id}</td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 bg-teal-50 rounded-full flex items-center justify-center text-teal-600">
                                                <User size={14} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-700 text-sm">{sale.cliente?.nombre || 'Invitado'}</div>
                                                <div className="text-xs text-slate-400">{sale.fecha_venta.split('T')[0]}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 font-bold text-slate-900">{Number(sale.total).toFixed(2)} BOB</td>
                                    <td className="py-4 px-6">
                                        {sale.comprobante_pago ? (
                                            <a
                                                href={`http://localhost:3000${sale.comprobante_pago}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg hover:bg-blue-100 transition-colors"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <FileText size={12} /> Ver Foto
                                            </a>
                                        ) : (
                                            <span className="text-xs font-bold text-slate-300 bg-slate-50 px-2 py-1 rounded-lg">Pendiente</span>
                                        )}
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${sale.estado_entrega === 'ENTREGADO' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                                            }`}>
                                            {sale.estado_entrega}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        {sale.estado === 'REGISTRADA' && (
                                            <span className="px-2 py-1 rounded-lg text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">
                                                En Revisión
                                            </span>
                                        )}
                                        {sale.estado === 'PAGADA' && (
                                            <span className="px-2 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                                Aprobada
                                            </span>
                                        )}
                                        {sale.estado === 'CANCELADA' && (
                                            <span className="px-2 py-1 rounded-lg text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                                                Rechazada
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        {sale.estado === 'REGISTRADA' && (
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleApprove(sale.venta_id); }}
                                                    className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                                                    title="Aprobar Pago"
                                                >
                                                    <CheckCircle size={18} />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleReject(sale.venta_id); }}
                                                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                    title="Rechazar"
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                            </div>
                                        )}
                                        {sale.estado === 'PAGADA' && sale.estado_entrega !== 'ENTREGADO' && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeliver(sale.venta_id); }}
                                                className="px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors inline-flex items-center gap-2"
                                            >
                                                <Truck size={14} /> Marcar Entregado
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Detail Modal (Simple Implementation) */}
            {selectedSale && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedSale(null)}>
                    <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl p-8 animate-scale-in" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900">Pedido #{selectedSale.venta_id}</h2>
                                <p className="text-slate-500 font-medium">{selectedSale.cliente?.nombre} • {selectedSale.cliente?.email}</p>
                            </div>
                            <button onClick={() => setSelectedSale(null)} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors">
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-6 mb-6 max-h-60 overflow-y-auto">
                            {selectedSale.detalles.map((d, i) => (
                                <div key={i} className="flex justify-between py-2 border-b border-slate-200 last:border-0">
                                    <span className="font-bold text-slate-700 text-sm">{d.producto?.nombre || 'Producto'} <span className="text-slate-400 font-medium">x{d.cantidad}</span></span>
                                    <span className="font-bold text-teal-600 text-sm">{Number(d.subtotal).toFixed(2)}</span>
                                </div>
                            ))}
                            <div className="flex justify-between pt-4 mt-2 border-t border-slate-200">
                                <span className="font-black text-slate-900">TOTAL</span>
                                <span className="font-black text-slate-900 text-lg">{Number(selectedSale.total).toFixed(2)} BOB</span>
                            </div>
                        </div>

                        {selectedSale.comprobante_pago && (
                            <div className="mb-6">
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Comprobante de Pago</label>
                                <div className="rounded-2xl overflow-hidden border border-slate-200">
                                    <img src={`http://localhost:3000${selectedSale.comprobante_pago}`} alt="Comprobante" className="w-full h-auto" />
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            {selectedSale.estado === 'REGISTRADA' ? (
                                <>
                                    <button onClick={() => handleReject(selectedSale.venta_id)} className="py-4 rounded-xl font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors">Rechazar</button>
                                    <button onClick={() => handleApprove(selectedSale.venta_id)} className="py-4 rounded-xl font-bold text-white bg-teal-500 hover:bg-teal-600 shadow-lg shadow-teal-500/20 transition-colors">Confirmar Pago</button>
                                </>
                            ) : (
                                <button onClick={() => setSelectedSale(null)} className="col-span-2 py-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Cerrar</button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
