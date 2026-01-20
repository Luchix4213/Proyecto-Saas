import React, { useState } from 'react';
import { X, CheckCircle, CreditCard, FileText, Upload } from 'lucide-react';
import { type Plan } from '../../services/planesService';

interface PaymentModalProps {
    plan: Plan | null;
    billingCycle: 'MENSUAL' | 'ANUAL';
    onClose: () => void;
    onConfirm: (data: { paymentMethod: 'QR' | 'TRANSFERENCIA'; proof: File }) => Promise<void>;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ plan, billingCycle, onClose, onConfirm }) => {
    const [paymentMethod, setPaymentMethod] = useState<'TRANSFERENCIA' | 'QR'>('QR');
    const [paymentProof, setPaymentProof] = useState<File | null>(null);
    const [previewProof, setPreviewProof] = useState<string | null>(null);
    const [isQrZoomed, setIsQrZoomed] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    if (!plan) return null;

    const price = billingCycle === 'MENSUAL' ? plan.precio_mensual : plan.precio_anual;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPaymentProof(file);
            setPreviewProof(URL.createObjectURL(file));
        }
    };

    const handleConfirm = async () => {
        if (!paymentProof) return;
        setIsProcessing(true);
        try {
            await onConfirm({ paymentMethod, proof: paymentProof });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             {isQrZoomed && (
                <div
                    className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 backdrop-blur-xl cursor-zoom-out animate-fade-in"
                    onClick={() => setIsQrZoomed(false)}
                >
                    <img
                        src="http://localhost:3000/uploads/tenants/QR_generado.jpeg"
                        alt="QR Full Size"
                        className="max-w-[90vw] max-h-[90vh] object-contain rounded-3xl shadow-2xl"
                    />
                </div>
            )}

            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in" onClick={onClose}></div>

            <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <div>
                        <h3 className="text-2xl font-black text-slate-800">Confirmar Suscripción</h3>
                        <p className="text-slate-500 font-medium text-sm">Estás a un paso de mejorar tu plan</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                        <X size={20} className="text-slate-600" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                    {/* Plan Summary */}
                    <div className="bg-slate-900 rounded-3xl p-6 text-center text-white mb-8 shadow-xl shadow-slate-900/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-10">
                            <CreditCard size={100} />
                        </div>
                        <p className="text-slate-300 font-medium mb-1">Plan Seleccionado</p>
                        <h2 className="text-3xl font-black text-teal-400 mb-2">{plan.nombre_plan}</h2>
                        <div className="flex items-baseline justify-center gap-1 mb-2">
                             <span className="text-5xl font-black tracking-tight">{price}</span>
                             <span className="text-xl font-bold text-slate-500">BOB</span>
                        </div>
                        <div className="inline-flex bg-white/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-teal-200">
                             Pago {billingCycle.toLowerCase()}
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* 1. Payment Method */}
                        <div>
                            <h4 className="font-black text-slate-800 mb-4 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-bold">1</span>
                                Elige método de pago
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setPaymentMethod('QR')}
                                    className={`py-4 px-4 rounded-2xl border-2 font-bold transition-all flex flex-col items-center gap-2 ${paymentMethod === 'QR' ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-lg shadow-teal-500/10' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                                >
                                    <CreditCard size={28} />
                                    Pago QR
                                </button>
                                <button
                                    onClick={() => setPaymentMethod('TRANSFERENCIA')}
                                    className={`py-4 px-4 rounded-2xl border-2 font-bold transition-all flex flex-col items-center gap-2 ${paymentMethod === 'TRANSFERENCIA' ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-lg shadow-teal-500/10' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                                >
                                    <FileText size={28} />
                                    Transferencia
                                </button>
                            </div>
                        </div>

                        {/* 2. Make Payment */}
                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/60 dashed-border">
                            <h4 className="font-black text-slate-800 mb-4 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-bold">2</span>
                                Escanea y paga
                            </h4>

                            <div className="flex flex-col items-center">
                                <div className="relative group cursor-zoom-in transition-transform hover:scale-105" onClick={() => setIsQrZoomed(true)}>
                                    <div className="absolute inset-0 bg-teal-500 blur-xl opacity-20 rounded-full"></div>
                                    <img
                                        src="http://localhost:3000/uploads/tenants/QR_generado.jpeg"
                                        alt="Código QR"
                                        className="relative w-48 h-48 object-cover rounded-2xl shadow-sm border-4 border-white"
                                    />
                                    <div className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-md">
                                        <div className="animate-pulse w-2 h-2 rounded-full bg-teal-500"></div>
                                    </div>
                                </div>
                                <p className="mt-4 text-sm font-bold text-slate-500 text-center max-w-[200px]">Haz click en el QR para ampliarlo</p>
                            </div>
                        </div>

                        {/* 3. Upload Proof */}
                        <div>
                            <h4 className="font-black text-slate-800 mb-4 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-bold">3</span>
                                Sube el comprobante
                            </h4>

                            <label
                                className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-3xl cursor-pointer transition-all group ${previewProof ? 'border-teal-500 bg-teal-50/30' : 'border-slate-300 hover:border-teal-400 hover:bg-slate-50'}`}
                            >
                                {previewProof ? (
                                    <div className="relative w-full h-full p-2 group-hover:opacity-90 transition-opacity">
                                        <img src={previewProof} alt="Comprobante" className="w-full h-full object-contain rounded-2xl" />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-2xl opacity-0 hover:opacity-100 transition-opacity font-bold backdrop-blur-sm">
                                            Cambiar imagen
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-400 group-hover:text-teal-600 transition-colors">
                                        <div className="p-4 bg-slate-100 rounded-full mb-3 group-hover:bg-teal-100 transition-colors">
                                           <Upload className="w-8 h-8" strokeWidth={2.5} />
                                        </div>
                                        <p className="text-sm font-bold">Click para subir imagen</p>
                                        <p className="text-xs font-medium opacity-70">PNG, JPG (Max 5MB)</p>
                                    </div>
                                )}
                                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                            </label>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 flex gap-4 bg-white z-10 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 px-4 bg-white border-2 border-slate-100 rounded-2xl text-slate-700 font-bold hover:bg-slate-50 hover:border-slate-200 transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!paymentProof || isProcessing}
                        className="flex-1 py-4 px-4 rounded-2xl font-black text-white bg-slate-900 hover:bg-teal-600 shadow-xl shadow-teal-500/20 hover:shadow-teal-500/40 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                        {isProcessing ? 'Procesando...' : (
                            <>
                                <CheckCircle strokeWidth={3} size={20} /> Confirmar Pago
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
