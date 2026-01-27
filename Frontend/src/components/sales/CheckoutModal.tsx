import React, { useState } from 'react';
import { X, CheckCircle, Search, CreditCard, Banknote, QrCode, User } from 'lucide-react';
import { type Cliente } from '../../services/clientsService';


interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    total: number;
    clients: Cliente[];
    onSubmit: (data: any) => Promise<void>;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, total, clients, onSubmit }) => {
    const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'EFECTIVO' | 'QR' | 'TRANSFERENCIA'>('EFECTIVO');
    const [clientSearch, setClientSearch] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // New Commercial Fields
    const [montoRecibido, setMontoRecibido] = useState<string>('');
    const [nitFacturacion, setNitFacturacion] = useState('');
    const [razonSocial, setRazonSocial] = useState('');

    // Update fiscal fields when client changes
    React.useEffect(() => {
        if (selectedClient) {
            setNitFacturacion(selectedClient.nit_ci || '');
            setRazonSocial(selectedClient.nombre + (selectedClient.paterno ? ' ' + selectedClient.paterno : ''));
        } else {
            setNitFacturacion('');
            setRazonSocial('');
        }
    }, [selectedClient]);

    const cambio = montoRecibido ? Number(montoRecibido) - total : 0;

    if (!isOpen) return null;

    const handleSubmit = async () => {
        setIsProcessing(true);
        try {
            await onSubmit({
                client: selectedClient,
                paymentMethod,
                montoRecibido: montoRecibido ? Number(montoRecibido) : undefined,
                nitFacturacion,
                razonSocial
            });
        } catch (error) {
            console.error(error);
        } finally {
            setIsProcessing(false);
        }
    };

    const filteredClients = clients.filter(c =>
        c.nombre.toLowerCase().includes(clientSearch.toLowerCase()) ||
        c.paterno?.toLowerCase().includes(clientSearch.toLowerCase()) ||
        c.nit_ci?.includes(clientSearch)
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in" onClick={onClose}></div>

            <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-8 pb-0 flex justify-between items-start shrink-0">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Finalizar Venta</h2>
                        <p className="text-slate-500 font-medium">Selecciona cliente y método de pago</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                        <X size={20} className="text-slate-600" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
                    {/* Total Display */}
                    <div className="bg-slate-900 text-white p-6 rounded-3xl flex justify-between items-center shadow-xl shadow-slate-900/20">
                        <span className="font-medium opacity-80">Monto a cobrar</span>
                        <span className="text-4xl font-black">Bs {total.toFixed(2)}</span>
                    </div>

                    {/* Client Selection */}
                    <div className="space-y-4">
                        <label className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                            <User size={16} /> Cliente
                        </label>

                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar cliente por nombre o CI..."
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-teal-500 outline-none"
                                value={clientSearch}
                                onChange={(e) => setClientSearch(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto custom-scrollbar border border-slate-100 rounded-2xl p-2">
                             <button
                                onClick={() => setSelectedClient(null)}
                                className={`p-4 rounded-xl text-left border transition-all flex items-center gap-3 ${!selectedClient ? 'bg-teal-50 border-teal-500 ring-1 ring-teal-500 shadow-md shadow-teal-500/10' : 'bg-white border-transparent hover:bg-slate-50'}`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${!selectedClient ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                    <User size={20} />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-800">Cliente Casual</div>
                                    <div className="text-xs font-semibold text-slate-400">Sin registro</div>
                                </div>
                            </button>
                            {filteredClients.map(client => (
                                <button
                                    key={client.cliente_id}
                                    onClick={() => setSelectedClient(client)}
                                    className={`p-4 rounded-xl text-left border transition-all flex items-center gap-3 ${selectedClient?.cliente_id === client.cliente_id ? 'bg-teal-50 border-teal-500 ring-1 ring-teal-500 shadow-md shadow-teal-500/10' : 'bg-white border-transparent hover:bg-slate-50'}`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-black ${selectedClient?.cliente_id === client.cliente_id ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                        {client.nombre.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-bold text-slate-800 truncate">{client.nombre} {client.paterno}</div>
                                        <div className="text-xs font-semibold text-slate-400">{client.nit_ci}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-4">
                        <label className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                            <CreditCard size={16} /> Método de Pago
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={() => setPaymentMethod('EFECTIVO')}
                                className={`p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all ${paymentMethod === 'EFECTIVO' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'}`}
                            >
                                <Banknote size={24} strokeWidth={2} />
                                <span className="font-bold text-sm">Efectivo</span>
                            </button>
                            <button
                                onClick={() => setPaymentMethod('QR')}
                                className={`p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all ${paymentMethod === 'QR' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'}`}
                            >
                                <QrCode size={24} strokeWidth={2} />
                                <span className="font-bold text-sm">Pago QR</span>
                            </button>
                            <button
                                onClick={() => setPaymentMethod('TRANSFERENCIA')}
                                className={`p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all ${paymentMethod === 'TRANSFERENCIA' ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-lg shadow-purple-500/10 ring-1 ring-purple-500' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'}`}
                            >
                                <CreditCard size={24} strokeWidth={2} />
                                <span className="font-bold text-sm">Banco</span>
                            </button>
                        </div>
                    </div>
                    {/* Payment Details (Cash) */}
                    {paymentMethod === 'EFECTIVO' && (
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                             <label className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-3">
                                <Banknote size={16} /> Detalle de Pago
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 mb-1 block">Monto Recibido</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Bs</span>
                                        <input
                                            type="number"
                                            className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none font-bold text-slate-800"
                                            value={montoRecibido}
                                            onChange={(e) => setMontoRecibido(e.target.value)}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 mb-1 block">Cambio</label>
                                    <div className={`text-xl font-black ${cambio < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                                        Bs {cambio.toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Invoice Data */}
                    <div className="space-y-3 pt-4 border-t border-slate-100">
                        <label className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                            <CreditCard size={16} /> Datos de Facturación (Opcional)
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <input
                                type="text"
                                placeholder="NIT / CI"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={nitFacturacion}
                                onChange={(e) => setNitFacturacion(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Razón Social"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={razonSocial}
                                onChange={(e) => setRazonSocial(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50/80 shrink-0">
                    <button
                        onClick={handleSubmit}
                        disabled={isProcessing || (paymentMethod === 'EFECTIVO' && (!montoRecibido || Number(montoRecibido) < total))}
                        className="w-full py-4 bg-teal-600 text-white rounded-2xl font-black text-lg hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-teal-500/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                    >
                        {isProcessing ? 'Procesando...' : (
                            <>
                                <CheckCircle strokeWidth={3} /> Confirmar Venta
                            </>
                        )}
                    </button>
                    {paymentMethod === 'EFECTIVO' && montoRecibido && Number(montoRecibido) < total && (
                        <p className="text-center text-red-500 text-xs font-bold mt-2 animate-pulse">
                            ¡Monto insuficiente! Faltan Bs {(total - Number(montoRecibido)).toFixed(2)}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
