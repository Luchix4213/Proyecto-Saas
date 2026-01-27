import { useState, useEffect } from 'react';
import {
    Search, Calendar, ShoppingBag,
    Monitor, User, Eye,
    RefreshCw, X, Package,
    FileText, MapPin, Truck, Banknote
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { AestheticHeader } from '../../../components/common/AestheticHeader';
import { useToast } from '../../../context/ToastContext';
import { ImageOverlay } from '../../../components/common/ImageOverlay';
import { Link } from 'react-router-dom';
import { salesService, type Venta } from '../../../services/salesService';

export const SalesHistoryPage = () => {
    const { addToast } = useToast();
    const [sales, setSales] = useState<Venta[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('TODAS');
    const [dateRange, setDateRange] = useState({ inicio: '', fin: '' });
    const [selectedSale, setSelectedSale] = useState<Venta | null>(null);
    const [showModal, setShowModal] = useState(false);

    // Lightbox State
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    useEffect(() => {
        fetchSales();
    }, [filterType, dateRange]);

    const fetchSales = async () => {
        try {
            setLoading(true);
            const params = {
                tipo: filterType === 'TODAS' ? undefined : (filterType as 'FISICA' | 'ONLINE'),
                inicio: dateRange.inicio || undefined,
                fin: dateRange.fin || undefined,
            };
            const data = await salesService.getAll(params);
            setSales(data);
        } catch (error) {
            console.error('Error fetching sales history:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (saleId: number) => {
        try {
            const saleDetails = await salesService.getOne(saleId);
            setSelectedSale(saleDetails);
            setShowModal(true);
        } catch (error) {
            console.error('Error fetching sale details:', error);
        }
    };

    const filteredSales = sales.filter(s =>
        s.venta_id.toString().includes(searchTerm) ||
        (s.cliente?.nombre && s.cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="relative min-h-[80vh] w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8 animate-fade-in-up">
            <AestheticHeader
                title="Historial Unificado"
                description="Control total de ventas físicas y pedidos online."
                icon={ShoppingBag}
                iconColor="from-teal-500 to-indigo-600"
                action={
                    <button
                        onClick={fetchSales}
                        className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-teal-50 text-teal-600 rounded-2xl font-black hover:bg-teal-100 transition-all border border-teal-100"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        Actualizar
                    </button>
                }
            />

            {/* Filters & Tools */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
                <div className="lg:col-span-5 rounded-[2rem] bg-white p-6 shadow-sm border border-slate-100">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block">Canal de Venta</label>
                    <div className="flex p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
                        {['TODAS', 'FISICA', 'ONLINE'].map(type => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${
                                    filterType === type
                                    ? 'bg-white text-slate-900 shadow-md border border-slate-200/50'
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                {type === 'FISICA' ? <Monitor size={14} /> : type === 'ONLINE' ? <ShoppingBag size={14} /> : null}
                                {type === 'FISICA' ? 'Venta Física' : type === 'ONLINE' ? 'Pedido Online' : 'Todo'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-7 rounded-[2rem] bg-white p-6 shadow-sm border border-slate-100">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block">Filtrar por Fecha</label>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="date"
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 transition-all"
                                value={dateRange.inicio}
                                onChange={(e) => setDateRange(prev => ({ ...prev, inicio: e.target.value }))}
                            />
                        </div>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="date"
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 transition-all"
                                value={dateRange.fin}
                                onChange={(e) => setDateRange(prev => ({ ...prev, fin: e.target.value }))}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden min-h-[500px]">
                <div className="p-8 border-b border-slate-100">
                     <div className="relative w-full group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={22} />
                        <input
                            type="text"
                            placeholder="Buscar por cliente o ID de venta..."
                            className="w-full pl-14 pr-6 py-5 bg-slate-50/50 border border-slate-200 rounded-3xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Venta</th>
                                <th className="px-6 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Cliente</th>
                                <th className="px-6 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Canal</th>
                                <th className="px-6 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Estado</th>
                                <th className="px-6 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total</th>
                                <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Detalle</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading && sales.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-32 text-center text-slate-400">
                                        <div className="flex flex-col items-center gap-4 animate-pulse">
                                            <div className="h-12 w-12 rounded-full border-4 border-teal-500 border-t-transparent animate-spin"></div>
                                            <p className="font-bold">Obteniendo historial...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredSales.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-32 text-center">
                                        <div className="flex flex-col items-center gap-4 text-slate-300">
                                            <ShoppingBag size={64} className="opacity-20" />
                                            <p className="text-xl font-black text-slate-400">Sin movimientos encontrados</p>
                                            <p className="text-sm font-medium">Prueba ajustando los filtros de búsqueda.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredSales.map((sale) => (
                                    <tr key={sale.venta_id} className="hover:bg-slate-50/80 transition-all group cursor-default">
                                        <td className="px-8 py-6">
                                            <div className="text-sm font-black text-slate-800">#{sale.venta_id}</div>
                                            <div className="text-[10px] font-bold text-slate-400 mt-1 flex items-center gap-1.5">
                                                <Calendar size={12} />
                                                {new Date(sale.fecha_venta).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                                    <User size={18} />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-slate-700">{sale.cliente?.nombre || 'Venta Rápida'} {sale.cliente?.paterno || ''}</div>
                                                    <div className="text-[10px] text-slate-400 font-medium">{sale.metodo_pago}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                sale.tipo_venta === 'FISICA'
                                                ? 'bg-amber-100 text-amber-700'
                                                : 'bg-indigo-100 text-indigo-700'
                                            }`}>
                                                {sale.tipo_venta === 'FISICA' ? <Monitor size={10} /> : <ShoppingBag size={10} />}
                                                {sale.tipo_venta === 'FISICA' ? 'Física' : 'Online'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                sale.estado === 'PAGADA' ? 'bg-emerald-100 text-emerald-700' :
                                                sale.estado === 'CANCELADA' ? 'bg-red-100 text-red-700' :
                                                'bg-amber-100 text-amber-700'
                                            }`}>
                                                {sale.estado}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <div className="text-sm font-black text-slate-800">
                                                {Number(sale.total).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                                            </div>
                                            <div className="text-[10px] text-slate-400 font-bold">BOB</div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                                <div className="flex p-1.5 bg-slate-50 border border-slate-100 rounded-2xl gap-1 shadow-sm">
                                                    {sale.tipo_venta === 'ONLINE' && (
                                                        <>
                                                            <Link
                                                                to="/app/ventas/online"
                                                                className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-md rounded-xl transition-all"
                                                                title="Gestionar Pedido"
                                                            >
                                                                <RefreshCw size={18} />
                                                            </Link>
                                                            <div className="w-[1px] h-4 bg-slate-200 self-center mx-1"></div>
                                                        </>
                                                    )}
                                                    <button
                                                        onClick={() => handleViewDetails(sale.venta_id)}
                                                        className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-md rounded-xl transition-all"
                                                        title="Ver detalles"
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
            </div>

            {/* Sale Details Modal */}
            <AnimatePresence>
                {showModal && selectedSale && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-teal-50 to-indigo-50">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                                        <div className="p-2 bg-gradient-to-br from-teal-500 to-indigo-600 rounded-xl text-white">
                                            <ShoppingBag size={20} />
                                        </div>
                                        Venta #{selectedSale.venta_id}
                                    </h2>
                                    <p className="text-sm text-slate-500 mt-1">
                                        {new Date(selectedSale.fecha_venta).toLocaleDateString('es-BO', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    <X size={24} className="text-slate-400" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    {/* Left Column: Sale & Fiscal */}
                                    <div className="space-y-4">
                                        <div className="bg-slate-50 rounded-2xl p-4">
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Cliente & Fiscal</p>
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="text-lg font-bold text-slate-800">
                                                        {selectedSale.cliente?.nombre || 'Venta Rápida'} {selectedSale.cliente?.paterno || ''}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs font-bold text-slate-500 bg-white px-2 py-1 rounded-lg border border-slate-200">
                                                            NIT: {selectedSale.nit_facturacion || selectedSale.cliente?.nit_ci || 'S/N'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                                                    selectedSale.estado_facturacion === 'EMITIDA' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-500'
                                                }`}>
                                                    <FileText size={12} />
                                                    {selectedSale.estado_facturacion || 'PENDIENTE'}
                                                </span>
                                                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
                                                    {selectedSale.comprobante_pago && (
                                                        <button
                                                            onClick={() => {
                                                                setPreviewImage(`http://localhost:3000${selectedSale.comprobante_pago}`);
                                                                setIsPreviewOpen(true);
                                                            }}
                                                            className="text-xs font-bold text-teal-600 hover:text-teal-800 flex items-center gap-1.5 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-100 transition-colors"
                                                        >
                                                            <Eye size={14} /> Ver Pago
                                                        </button>
                                                    )}

                                                    {selectedSale.comprobante_pdf && (
                                                        <a
                                                            href={`http://localhost:3000${selectedSale.comprobante_pdf}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 transition-colors"
                                                        >
                                                            <FileText size={14} />
                                                            {selectedSale.estado_facturacion === 'EMITIDA' ? 'Ver Factura' : 'Ver Recibo'}
                                                        </a>
                                                    )}

                                                    {selectedSale.estado_facturacion !== 'EMITIDA' && (
                                                        <button
                                                            onClick={async () => {
                                                                try {
                                                                    const updated = await salesService.emitInvoice(selectedSale.venta_id);
                                                                    setSelectedSale(updated);
                                                                    setSales(prev => prev.map(s => s.venta_id === updated.venta_id ? updated : s));
                                                                    addToast('Factura emitida exitosamente', 'success');
                                                                } catch (e) {
                                                                    console.error(e);
                                                                    addToast('Error al emitir factura', 'error');
                                                                }
                                                            }}
                                                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 rounded-lg hover:bg-indigo-100 border border-indigo-100 transition-colors"
                                                        >
                                                            <FileText size={14} /> Emitir Factura
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">Estado Venta</p>
                                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                                                    selectedSale.estado === 'PAGADA' ? 'bg-emerald-100 text-emerald-700' :
                                                    selectedSale.estado === 'CANCELADA' ? 'bg-red-100 text-red-700' :
                                                    'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {selectedSale.estado}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">Canal</p>
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                                                    selectedSale.tipo_venta === 'FISICA'
                                                    ? 'bg-amber-100 text-amber-700'
                                                    : 'bg-indigo-100 text-indigo-700'
                                                }`}>
                                                    {selectedSale.tipo_venta === 'FISICA' ? <Monitor size={12} /> : <ShoppingBag size={12} />}
                                                    {selectedSale.tipo_venta === 'FISICA' ? 'Física' : 'Online'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Payment & Logistics */}
                                    <div className="space-y-4">
                                        <div className="bg-slate-50 rounded-2xl p-4">
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Detalle de Pago</p>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-slate-600 flex items-center gap-2">
                                                    <Banknote size={16} className="text-slate-400" /> Método
                                                </span>
                                                <span className="font-bold text-slate-800">{selectedSale.metodo_pago}</span>
                                            </div>
                                            {((selectedSale.monto_recibido != null) || (selectedSale.cambio != null)) && (
                                                <>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-xs text-slate-500">Recibido</span>
                                                        <span className="text-sm font-bold text-slate-700">BOB {Number(selectedSale.monto_recibido || 0).toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                                                        <span className="text-xs font-bold text-emerald-600">Cambio</span>
                                                        <span className="text-sm font-bold text-emerald-600">BOB {Number(selectedSale.cambio || 0).toFixed(2)}</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {selectedSale.tipo_venta === 'ONLINE' && (
                                            <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4">
                                                <p className="text-xs font-black text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                    <Truck size={12} /> Logística
                                                </p>
                                                <div className="mb-3">
                                                    <p className="text-sm font-medium text-slate-600 mb-1">Dirección de Entrega</p>
                                                    <p className="text-sm font-bold text-slate-800 leading-tight">
                                                        {selectedSale.direccion_envio || 'Recogida en tienda'}
                                                    </p>
                                                </div>
                                                {selectedSale.ubicacion_maps && (
                                                    <a
                                                        href={selectedSale.ubicacion_maps}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:underline bg-white px-3 py-2 rounded-lg border border-indigo-100 shadow-sm"
                                                    >
                                                        <MapPin size={12} /> Ver en Mapa
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Products */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                        <Package size={20} className="text-teal-600" />
                                        Productos
                                    </h3>
                                    <div className="space-y-3">
                                        {selectedSale.detalles?.map((detalle, index) => (
                                            <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                                <div className="flex-1">
                                                    <p className="font-bold text-slate-800">{detalle.producto?.nombre || 'Producto'}</p>
                                                    <p className="text-sm text-slate-500">
                                                        Cantidad: {detalle.cantidad} × BOB {Number(detalle.precio_unitario).toFixed(2)}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-black text-slate-800">
                                                        BOB {Number(detalle.subtotal).toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="bg-gradient-to-r from-teal-50 to-indigo-50 rounded-2xl p-6 border-2 border-teal-100">
                                    <div className="flex items-center justify-between">
                                        <p className="text-lg font-bold text-slate-700">Total</p>
                                        <p className="text-3xl font-black text-slate-900">
                                            BOB {Number(selectedSale.total).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-slate-100 bg-slate-50">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Image Preview Overlay */}
            <ImageOverlay
                isOpen={isPreviewOpen}
                imageSrc={previewImage}
                onClose={() => setIsPreviewOpen(false)}
                altText={selectedSale ? `Comprobante Venta #${selectedSale.venta_id}` : ''}
            />
        </div>
    );
};

