import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Calendar, History, Search, Eye, ArrowLeft, Filter, Truck, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { purchasesService, type Compra } from '../../../services/purchasesService';
import { PurchaseDetailModal } from '../../../components/purchases/PurchaseDetailModal';

export const PurchaseHistoryPage = () => {
    const [searchParams] = useSearchParams();
    const proveedorIdParam = searchParams.get('proveedorId');

    const [purchases, setPurchases] = useState<Compra[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPurchase, setSelectedPurchase] = useState<Compra | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPurchases();
    }, [proveedorIdParam]);

    const fetchPurchases = async () => {
        try {
            setLoading(true);
            const data = await purchasesService.getAll(proveedorIdParam ? Number(proveedorIdParam) : undefined);
            setPurchases(data);
        } catch (error) {
            console.error('Error fetching purchases:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = (purchase: Compra) => {
        setSelectedPurchase(purchase);
        setIsModalOpen(true);
    };

    const filteredPurchases = purchases.filter(p =>
        p.proveedor?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.compra_id.toString().includes(searchTerm)
    );

    return (
        <div className="relative min-h-[80vh] w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
            <div className="animate-fade-in-up">
                {/* Ambient Background Elements */}
                <div className="absolute top-0 left-10 -mt-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 right-10 -mb-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

                {/* Header */}
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                             <Link
                                to="/owner/purchases"
                                className="p-2 bg-white rounded-xl text-slate-400 hover:text-slate-600 border border-slate-100 shadow-sm transition-all"
                            >
                                <ArrowLeft size={18} />
                            </Link>
                            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
                                <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white shadow-lg shadow-indigo-500/30">
                                    <History size={28} />
                                </div>
                                Historial de Compras
                            </h1>
                        </div>
                        <p className="text-slate-500 text-lg">
                            {proveedorIdParam
                                ? `Mostrando compras del proveedor seleccionado`
                                : 'Listado de todos los ingresos de mercadería realizados.'}
                        </p>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="relative z-10 bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden mb-8">
                    <div className="p-6 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/30">
                        <div className="relative w-full sm:w-96 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar por ID o proveedor..."
                                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            {proveedorIdParam && (
                                <Link
                                    to="/owner/purchases/history"
                                    className="px-4 py-2 bg-amber-50 rounded-xl text-xs font-bold text-amber-600 flex items-center gap-2 border border-amber-100"
                                >
                                    <Filter size={14} /> Quitar filtro de proveedor
                                </Link>
                            )}
                             <span className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                <Calendar size={14} /> Todas las fechas
                             </span>
                         </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">ID/Fecha</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Proveedor</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Responsable</th>
                                    <th className="px-6 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total</th>
                                    <th className="px-6 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Estado</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-20 text-center">
                                             <div className="flex justify-center">
                                                <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredPurchases.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-20 text-center text-slate-400">
                                            <div className="flex flex-col items-center justify-center gap-4">
                                                <div className="p-4 bg-slate-50 rounded-full">
                                                    <History size={32} className="text-slate-300" />
                                                </div>
                                                <p className="font-bold text-slate-600">No se encontraron compras registradas</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPurchases.map((p) => (
                                        <tr key={p.compra_id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-bold text-slate-800">#{p.compra_id}</div>
                                                    <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mt-1">
                                                        <Calendar size={10} />
                                                        {new Date(p.fecha_compra).toLocaleDateString('es-ES')}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                                        <Truck size={14} />
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-700">{p.proveedor?.nombre}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <span className="text-sm text-slate-600 font-medium">{p.usuario?.nombre}</span>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap text-right">
                                                <div className="text-sm font-black text-slate-800">
                                                    {Number(p.total).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                                                    <span className="text-[10px] ml-1 text-slate-400">BOB</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap text-center">
                                                <span className="inline-flex px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                                                    {p.estado}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            try {
                                                                const blob = await purchasesService.downloadPdf(p.compra_id);
                                                                const url = window.URL.createObjectURL(blob);
                                                                const link = document.createElement('a');
                                                                link.href = url;

                                                                const empresa = p.proveedor?.nombre.replace(/\s+/g, '_') || 'Empresa';
                                                                const fecha = new Date(p.fecha_compra).toISOString().split('T')[0];
                                                                link.setAttribute('download', `${empresa}_Compra_${p.compra_id}_${fecha}.pdf`);

                                                                document.body.appendChild(link);
                                                                // Actually, if backend sets header, this download attribute might be overridden or ignored depending on browser.
                                                                // But better to let the blob handle it if possible.
                                                                // Let's just create the link.
                                                                document.body.appendChild(link);
                                                                link.click();
                                                                link.remove();
                                                            } catch (error) {
                                                                console.error('Error downloading PDF:', error);
                                                            }
                                                        }}
                                                        className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all shadow-sm hover:shadow-md border border-transparent hover:border-slate-100"
                                                        title="Descargar Comprobante"
                                                    >
                                                        <FileText size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleViewDetail(p)}
                                                        className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all shadow-sm hover:shadow-md border border-transparent hover:border-slate-100 flex items-center gap-2"
                                                    >
                                                        <Eye size={16} />
                                                        <span className="text-xs font-bold">Ver Detalles</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <PurchaseDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                purchase={selectedPurchase}
            />
        </div>
    );
};
