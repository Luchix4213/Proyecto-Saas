import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Truck, CheckCircle, XCircle, User, FileText, Smartphone, ShoppingBag, Eye, Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfirmDialog, type DialogType } from '../../components/common/ConfirmDialog';
import { AestheticHeader } from '../../components/common/AestheticHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';
import { ImageOverlay } from '../../components/common/ImageOverlay';

interface Venta {
    venta_id: number;
    fecha_venta: string;
    total: number;
    estado: string;
    estado_entrega: string;
    tipo_venta: string;
    comprobante_pago?: string;
    comprobante_pdf?: string;
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
    const { addToast } = useToast();
    const [confirmConfig, setConfirmConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: DialogType;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: () => {},
    });

    // Lightbox State
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');

    useEffect(() => {
        loadSales();
    }, []);

    const loadSales = async () => {
        setLoading(true);
        try {
            const response = await api.get('/ventas');
            const allSales = response.data;
            setSales(allSales.filter((v: Venta) => v.tipo_venta === 'ONLINE'));
        } catch (error) {
            console.error('Error loading sales:', error);
            addToast('Error al cargar pedidos online', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = (id: number) => {
        setConfirmConfig({
            isOpen: true,
            title: 'Confirmar Pago',
            message: '¿Estás seguro de aprobar este pago? Se actualizará el stock y el estado de la venta.',
            type: 'success',
            onConfirm: async () => {
                try {
                    await api.patch(`/ventas/${id}/aprobar`);
                    loadSales();
                    setSelectedSale(null);
                    addToast('Pago aprobado correctamente', 'success');
                    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                } catch (error) {
                    console.error(error);
                    addToast('Error al aprobar pago', 'error');
                }
            }
        });
    };

    const handleReject = (id: number) => {
        setConfirmConfig({
            isOpen: true,
            title: 'Rechazar Venta',
            message: '¿Deseas rechazar esta venta? Esta acción no se puede deshacer.',
            type: 'danger',
            onConfirm: async () => {
                try {
                    await api.patch(`/ventas/${id}/rechazar`);
                    loadSales();
                    setSelectedSale(null);
                    addToast('Venta rechazada', 'info');
                    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                } catch (error) {
                    addToast('Error al rechazar venta', 'error');
                }
            }
        });
    };

    const handleDeliver = (id: number) => {
        setConfirmConfig({
            isOpen: true,
            title: 'Marcar Entregado',
            message: '¿Confirmas que el pedido ha sido entregado al cliente?',
            type: 'info',
            onConfirm: async () => {
                try {
                    await api.patch(`/ventas/${id}/entregar`);
                    loadSales();
                    addToast('Pedido marcado como entregado', 'success');
                    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                } catch (error) {
                    addToast('Error al actualizar estado', 'error');
                }
            }
        });
    };

    const filteredSales = sales.filter(s => {
        if (filterStatus === 'TODAS') return true;
        return s.estado === filterStatus;
    });

    return (
        <div className="relative min-h-[80vh] w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8 animate-fade-in-up">
            {/* Ambient Backgrounds */}
            <div className="absolute top-0 left-10 -mt-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 right-10 -mb-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 space-y-8">
                {/* Header Section */}
                <AestheticHeader
                    title="Ventas Online"
                    description="Gestiona pedidos y verifica pagos por transferencia o QR."
                    icon={ShoppingBag}
                    iconColor="from-blue-500 to-indigo-600"
                    action={
                        <div className="flex gap-4">
                            <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                                <div className="h-10 w-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 font-bold">
                                    {sales.filter(s => s.estado === 'REGISTRADA').length}
                                </div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pendientes</div>
                            </div>
                        </div>
                    }
                />

                {/* Filters */}
                <div className="flex items-center gap-4 bg-white/50 backdrop-blur-sm p-2 rounded-[1.5rem] border border-slate-100 w-fit overflow-x-auto shadow-sm">
                    {['REGISTRADA', 'PAGADA', 'CANCELADA', 'TODAS'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${filterStatus === status
                                ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                                : 'text-slate-500 hover:bg-white hover:text-slate-900'
                                }`}
                        >
                            {status === 'REGISTRADA' ? 'Por Verificar' : status === 'TODAS' ? 'Historial' : status}
                        </button>
                    ))}
                </div>

                {/* List Container */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Referencia</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Cliente</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Comprobante</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Logística</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Finanzas</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                <AnimatePresence mode="popLayout">
                                    {loading ? (
                                        <motion.tr
                                            key="loading"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <td colSpan={7} className="px-8 py-24 text-center">
                                                <div className="flex flex-col items-center justify-center gap-4">
                                                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent shadow-lg text-blue-500"></div>
                                                    <span className="text-sm font-black text-slate-400 uppercase tracking-widest animate-pulse">Consultando transacciones...</span>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ) : filteredSales.length === 0 ? (
                                        <motion.tr
                                            key="empty"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <td colSpan={7}>
                                                <EmptyState
                                                    icon={ShoppingBag}
                                                    title="Sin movimientos"
                                                    description="No se encontraron ventas para el estado seleccionado."
                                                />
                                            </td>
                                        </motion.tr>
                                    ) : (
                                        filteredSales.map(sale => (
                                            <motion.tr
                                                key={sale.venta_id}
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className="group hover:bg-blue-50/30 transition-all cursor-pointer"
                                                onClick={() => setSelectedSale(sale)}
                                            >
                                                <td className="px-8 py-6 font-mono text-xs font-black text-slate-400">#{sale.venta_id}</td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-11 w-11 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 shadow-sm group-hover:scale-110 transition-transform">
                                                            <User size={18} />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-800 text-sm leading-tight">{sale.cliente?.nombre || 'Invitado'}</div>
                                                            <div className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-wider">{sale.fecha_venta.split('T')[0]}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="font-black text-slate-900 text-sm">
                                                        {Number(sale.total).toLocaleString('es-BO', { minimumFractionDigits: 2 })} <span className="text-[10px] text-slate-400 ml-0.5">BOB</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col gap-2">
                                                        {sale.comprobante_pago ? (
                                                            <button
                                                                className="inline-flex items-center gap-2 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-100 w-fit"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setPreviewImage(`http://localhost:3000${sale.comprobante_pago}`);
                                                                    setIsPreviewOpen(true);
                                                                }}
                                                            >
                                                                <Eye size={14} /> Ver Pago
                                                            </button>
                                                        ) : (
                                                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-300 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 w-fit">Sin Pago</span>
                                                        )}
                                                        {sale.comprobante_pdf && (
                                                            <a
                                                                href={`http://localhost:3000${sale.comprobante_pdf}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-2 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm border border-emerald-100 w-fit"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <FileText size={14} /> Ver Recibo
                                                            </a>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={`inline-flex px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm
                                                        ${sale.estado_entrega === 'ENTREGADO'
                                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                            : 'bg-orange-50 text-orange-600 border-orange-100 animate-pulse'}`}>
                                                        {sale.estado_entrega}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="relative group/status flex items-center">
                                                        {sale.estado === 'REGISTRADA' && (
                                                            <span className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-100 shadow-sm flex items-center gap-1.5">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                                                                Revisión
                                                            </span>
                                                        )}
                                                        {sale.estado === 'PAGADA' && (
                                                            <span className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm flex items-center gap-1.5">
                                                                Confirmado
                                                            </span>
                                                        )}
                                                        {sale.estado === 'CANCELADA' && (
                                                            <span className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-red-50 text-red-600 border border-red-100 shadow-sm">
                                                                Rechazado
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                                        {sale.estado === 'REGISTRADA' && (
                                                            <div className="flex p-1.5 bg-slate-50 border border-slate-100 rounded-2xl gap-1 shadow-sm">
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleApprove(sale.venta_id); }}
                                                                    className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-white hover:shadow-md rounded-xl transition-all"
                                                                    title="Aprobar Pago"
                                                                >
                                                                    <CheckCircle size={18} />
                                                                </button>
                                                                <div className="w-[1px] h-4 bg-slate-200 self-center mx-1"></div>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleReject(sale.venta_id); }}
                                                                    className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-white hover:shadow-md rounded-xl transition-all"
                                                                    title="Rechazar"
                                                                >
                                                                    <XCircle size={18} />
                                                                </button>
                                                            </div>
                                                        )}
                                                        {sale.estado === 'PAGADA' && sale.estado_entrega !== 'ENTREGADO' && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleDeliver(sale.venta_id); }}
                                                                className="px-6 py-2.5 bg-slate-900 border border-transparent rounded-2xl shadow-xl shadow-slate-900/20 text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-slate-800 transition-all hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
                                                            >
                                                                <Truck size={14} /> Entregar
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedSale && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedSale(null)}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 overflow-y-auto max-h-[90vh]"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900">Pedido #{selectedSale.venta_id}</h2>
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{selectedSale.cliente?.nombre || 'Cliente Invitado'}</p>
                                </div>
                                <button onClick={() => setSelectedSale(null)} className="p-2 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-full transition-colors">
                                    <XCircle size={24} />
                                </button>
                            </div>

                            <div className="bg-slate-50 rounded-2xl p-6 mb-6">
                                <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                    {selectedSale.detalles.map((d, i) => (
                                        <div key={i} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0 text-sm">
                                            <span className="font-bold text-slate-700">{d.producto?.nombre} <span className="text-slate-400 font-medium">x{d.cantidad}</span></span>
                                            <span className="font-black text-slate-900">BOB {Number(d.subtotal).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between pt-4 mt-4 border-t border-slate-200">
                                    <span className="font-black text-slate-900 uppercase tracking-widest text-xs">Total Venta</span>
                                    <span className="font-black text-indigo-600 text-xl">BOB {Number(selectedSale.total).toLocaleString('es-BO', { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>

                             <div className="grid grid-cols-2 gap-4 mb-6">
                                {selectedSale.comprobante_pago && (
                                    <button
                                        onClick={() => {
                                            setPreviewImage(`http://localhost:3000${selectedSale.comprobante_pago}`);
                                            setIsPreviewOpen(true);
                                        }}
                                        className="flex items-center justify-center gap-2 py-4 rounded-2xl font-black uppercase tracking-widest text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all border border-blue-100"
                                    >
                                        <Eye size={16} /> Ver Pago
                                    </button>
                                )}
                                {selectedSale.comprobante_pdf && (
                                    <a
                                        href={`http://localhost:3000${selectedSale.comprobante_pdf}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 py-4 rounded-2xl font-black uppercase tracking-widest text-xs text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-all border border-emerald-100"
                                    >
                                        <Printer size={16} /> Ver Recibo
                                    </a>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {selectedSale.estado === 'REGISTRADA' ? (
                                    <>
                                        <button onClick={() => handleReject(selectedSale.venta_id)} className="py-4 rounded-2xl font-black uppercase tracking-widest text-xs text-red-500 bg-red-50 hover:bg-red-100 transition-all">Rechazar</button>
                                        <button onClick={() => handleApprove(selectedSale.venta_id)} className="py-4 rounded-2xl font-black uppercase tracking-widest text-xs text-white bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-900/20 transition-all">Verificado</button>
                                    </>
                                ) : (
                                    <button onClick={() => setSelectedSale(null)} className="col-span-2 py-4 rounded-2xl font-black uppercase tracking-widest text-xs text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all">Cerrar Detalle</button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Confirm Dialog */}
            <ConfirmDialog
                {...confirmConfig}
                onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
            />

            {/* Image Preview Overlay */}
            <ImageOverlay
                isOpen={isPreviewOpen}
                imageSrc={previewImage}
                onClose={() => setIsPreviewOpen(false)}
                altText="Comprobante de Pago Online"
            />

            {/* Floating Counter */}
            <AnimatePresence>
                {sales.filter(s => s.estado === 'REGISTRADA').length > 0 && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-4 border border-white/10"
                    >
                        <div className="relative">
                            <Smartphone size={20} className="text-teal-400" />
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
                            </span>
                        </div>
                        <span className="font-black text-xs uppercase tracking-widest">
                            {sales.filter(s => s.estado === 'REGISTRADA').length} Pagos por verificar
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
