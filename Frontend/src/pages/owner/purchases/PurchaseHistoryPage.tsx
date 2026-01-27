import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Calendar, History, Search, Eye, ArrowLeft, Filter, Truck, FileText, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { purchasesService, type Compra } from '../../../services/purchasesService';
import { PurchaseDetailModal } from '../../../components/purchases/PurchaseDetailModal';
import { AestheticHeader } from '../../../components/common/AestheticHeader';
import { EmptyState } from '../../../components/common/EmptyState';
import { useToast } from '../../../context/ToastContext';

export const PurchaseHistoryPage = () => {
    const { addToast } = useToast();
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
            addToast('Error al cargar historial de compras', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = (purchase: Compra) => {
        setSelectedPurchase(purchase);
        setIsModalOpen(true);
    };

    const handleDownloadPdf = async (p: Compra) => {
        try {
            const blob = await purchasesService.downloadPdf(p.compra_id);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            const empresa = p.proveedor?.nombre.replace(/\s+/g, '_') || 'Empresa';
            const fecha = new Date(p.fecha_compra).toISOString().split('T')[0];
            link.setAttribute('download', `${empresa}_Compra_${p.compra_id}_${fecha}.pdf`);

            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            addToast('Comprobante descargado', 'success');
        } catch (error) {
            console.error('Error downloading PDF:', error);
            addToast('Error al descargar el PDF', 'error');
        }
    };

    const filteredPurchases = purchases.filter(p =>
        p.proveedor?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.compra_id.toString().includes(searchTerm)
    );

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 animate-fade-in-up">
            {/* Header */}
            <AestheticHeader
                title="Historial de Compras"
                description={proveedorIdParam ? "Mostrando compras del proveedor seleccionado." : "Consulta todos los ingresos de mercadería realizados."}
                icon={History}
                iconColor="from-indigo-500 to-purple-600"
                action={
                    <Link
                        to="/owner/purchases"
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm text-sm font-black text-slate-600 hover:bg-slate-50 transition-all hover:border-indigo-200 active:scale-95"
                    >
                        <ArrowLeft size={18} className="text-slate-400" />
                        Nueva Compra
                    </Link>
                }
            />

            {/* Toolbar & Filters */}
            <div className="mt-8 bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
                <div className="p-6 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/30 border-b border-slate-100">
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
                                className="px-4 py-2 bg-amber-50 rounded-xl text-xs font-black text-amber-600 flex items-center gap-2 border border-amber-100 hover:bg-amber-100 transition-all"
                            >
                                <Filter size={14} /> Quitar filtro
                            </Link>
                        )}
                         <span className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-2 shadow-sm">
                            <Calendar size={14} className="text-indigo-500" /> Todas las fechas
                         </span>
                     </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-10">ID/Fecha</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Proveedor</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Responsable</th>
                                <th className="px-6 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total</th>
                                <th className="px-6 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Estado</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pr-10">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-24 text-center">
                                        <div className="flex flex-col items-center justify-center gap-4">
                                            <Loader2 className="animate-spin text-indigo-500" size={32} />
                                            <span className="text-sm font-black text-slate-500 uppercase tracking-widest animate-pulse">Cargando historial...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredPurchases.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-12">
                                        <EmptyState
                                            title="No se encontraron compras"
                                            description={searchTerm ? `No hay resultados para "${searchTerm}"` : "Aún no has registrado ingresos de mercadería."}
                                            icon={History}
                                        />
                                    </td>
                                </tr>
                            ) : (
                                filteredPurchases.map((p) => (
                                    <tr key={p.compra_id} className="group hover:bg-slate-50 transition-all duration-300">
                                        <td className="px-8 py-6 pl-10">
                                            <div>
                                                <div className="text-sm font-black text-slate-800 tracking-tight">#{p.compra_id}</div>
                                                <div className="text-[10px] font-black text-slate-400 flex items-center gap-1 mt-1 uppercase">
                                                    <Calendar size={10} className="text-slate-300" />
                                                    {new Date(p.fecha_compra).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 font-bold text-slate-700">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:scale-110 transition-transform">
                                                    <Truck size={16} />
                                                </div>
                                                <span className="text-sm tracking-tight">{p.proveedor?.nombre || 'PROPIA'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-sm font-medium text-slate-500">
                                            {p.usuario?.nombre}
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <div className="text-sm font-black text-slate-800">
                                                BOB {Number(p.total).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <span className="inline-flex px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-wider">
                                                {p.estado}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right pr-10">
                                            <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                                <div className="flex p-1.5 bg-slate-50 border border-slate-100 rounded-2xl gap-1 shadow-sm">
                                                    <button
                                                        onClick={() => handleDownloadPdf(p)}
                                                        className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-md rounded-xl transition-all"
                                                        title="Descargar PDF"
                                                    >
                                                        <FileText size={18} />
                                                    </button>
                                                    <div className="w-[1px] h-4 bg-slate-200 self-center mx-1"></div>
                                                    <button
                                                        onClick={() => handleViewDetail(p)}
                                                        className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-md rounded-xl transition-all"
                                                        title="Ver Detalles"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer Insight */}
                <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 text-[10px] text-slate-400 uppercase tracking-widest font-black flex justify-between items-center">
                    <span>Historial de Registros</span>
                    <span>{filteredPurchases.length} Movimientos</span>
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
