import { useState, useEffect } from 'react';
import { X, Calendar, ShoppingBag, Monitor, Search } from 'lucide-react';
import { salesService, type Venta } from '../../services/salesService';

interface ClientHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    clientId: number;
    clientName: string;
}

export const ClientHistoryModal = ({ isOpen, onClose, clientId, clientName }: ClientHistoryModalProps) => {
    const [sales, setSales] = useState<Venta[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen && clientId) {
            loadSales();
        }
    }, [isOpen, clientId]);

    const loadSales = async () => {
        setLoading(true);
        try {
            const data = await salesService.getAll({ cliente_id: clientId });
            setSales(data);
        } catch (error) {
            console.error('Error loading client history:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredSales = sales.filter(s =>
        s.venta_id.toString().includes(searchTerm) ||
        s.total.toString().includes(searchTerm)
    );

    const totalSpent = sales.reduce((sum, sale) => sum + Number(sale.total), 0);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose}></div>

             <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-8 pb-0 flex justify-between items-start shrink-0">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                                <ShoppingBag size={24} />
                            </div>
                            Historial de Compras
                        </h2>
                        <p className="text-slate-500 font-medium pl-14">
                            Cliente: <span className="text-slate-800 font-bold">{clientName}</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                        <X size={20} className="text-slate-600" />
                    </button>
                </div>

                {/* Search & Stats */}
                <div className="px-8 mt-6">
                    <div className="relative mb-4">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por ID de venta o monto..."
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-bold text-slate-700"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">Total Gastado</p>
                            <p className="text-2xl font-black text-slate-800">BOB {totalSpent.toFixed(2)}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">Compras Realizadas</p>
                            <p className="text-2xl font-black text-slate-800">{sales.length}</p>
                        </div>
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                     {loading ? (
                        <div className="flex flex-col items-center justify-center h-40 gap-4">
                            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-slate-400 font-bold">Cargando historial...</p>
                        </div>
                    ) : filteredSales.length === 0 ? (
                        <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                            <ShoppingBag size={48} className="mx-auto text-slate-300 mb-4" />
                            <p className="text-slate-500 font-medium">Este cliente no tiene compras registradas.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredSales.map((sale) => (
                                <div key={sale.venta_id} className="group bg-white border border-slate-100 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5 rounded-2xl p-4 transition-all flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-md ${
                                            sale.tipo_venta === 'FISICA' ? 'bg-amber-500 shadow-amber-500/20' : 'bg-indigo-500 shadow-indigo-500/20'
                                        }`}>
                                            {sale.tipo_venta === 'FISICA' ? <Monitor size={20} /> : <ShoppingBag size={20} />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 flex items-center gap-2">
                                                Venta #{sale.venta_id}
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${
                                                    sale.estado === 'PAGADA' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                                }`}>{sale.estado}</span>
                                            </p>
                                            <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-1">
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={12} /> {new Date(sale.fecha_venta).toLocaleDateString()}
                                                </span>
                                                <span>•</span>
                                                <span>{sale.metodo_pago}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-lg font-black text-slate-800">BOB {Number(sale.total).toFixed(2)}</p>
                                        <p className="text-xs font-bold text-slate-400">{sale.detalles?.length || 0} productos</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
             </div>
        </div>
    );
};
