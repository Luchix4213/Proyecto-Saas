import React from 'react';
import { Truck, X, ArrowRight, Calculator, Package } from 'lucide-react';
import { type Product } from '../../services/productsService';
import { type Proveedor } from '../../services/suppliersService';
import { getImageUrl } from '../../utils/imageUtils';

// Define the shape of items in the cart
export interface PurchaseItem extends Product {
    purchaseQuantity: number;
    purchaseCost: number;
}

interface PurchaseCartProps {
    cart: PurchaseItem[];
    suppliers: Proveedor[];
    selectedSupplierId: number | '';
    onSelectSupplier: (id: number) => void;
    onUpdateItem: (productId: number, field: 'purchaseQuantity' | 'purchaseCost', value: number) => void;
    onRemoveItem: (productId: number) => void;
    onSubmit: () => void;
    processing: boolean;

}

export const PurchaseCart: React.FC<PurchaseCartProps> = ({
    cart,
    suppliers,
    selectedSupplierId,
    onSelectSupplier,
    onUpdateItem,
    onRemoveItem,
    onSubmit,
    processing
}) => {
    const total = cart.reduce((sum, item) => sum + (item.purchaseQuantity * item.purchaseCost), 0);

    // Wait, I can't change the interface usage in OwnerPurchasesPage yet without breaking it.
    // I will add an onPaymentMethodChange prop or similar, OR modify onSubmit to accept data.
    // Let's check OwnerPurchasesPage again.


    return (
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 flex flex-col h-full overflow-hidden sticky top-8">
            {/* Header */}
            <div className="p-8 border-b border-slate-100 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <h3 className="text-xl font-black tracking-tight flex items-center gap-3 relative z-10">
                    <Truck className="text-teal-400" size={24} />
                    Nueva Compra
                </h3>
                <p className="text-slate-400 text-sm mt-1 relative z-10">Calculadora de costos y stock</p>
            </div>

            {/* Supplier Selection */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Proveedor</label>
                <div className="relative">
                    <select
                        className="w-full appearance-none px-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 text-sm font-bold text-slate-700 outline-none transition-all cursor-pointer"
                        value={selectedSupplierId}
                        onChange={(e) => onSelectSupplier(Number(e.target.value))}
                    >
                        <option value="">Seleccionar Proveedor...</option>
                        {suppliers.map(s => (
                            <option key={s.proveedor_id} value={s.proveedor_id}>{s.nombre}</option>
                        ))}
                    </select>
                </div>
            </div>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4 bg-white">
                {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-slate-300 text-center">
                        <Calculator size={48} strokeWidth={1} className="mb-3 opacity-50" />
                        <p className="font-bold text-sm">El carrito está vacío</p>
                        <p className="text-xs">Agrega productos del catálogo</p>
                    </div>
                ) : (
                    cart.map(item => {
                        const principalImage = item.imagenes?.find(img => img.es_principal)?.url || item.imagenes?.[0]?.url;

                        return (
                            <div key={item.producto_id} className="relative group bg-slate-50 border border-slate-100 rounded-3xl p-4 transition-all hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 hover:border-teal-100">
                                <div className="flex justify-between items-start mb-3 pr-6">
                                    <div className="flex items-center gap-3 w-full">
                                        <div className="w-12 h-12 bg-white rounded-xl border border-slate-100 flex items-center justify-center text-slate-300 shrink-0 overflow-hidden relative">
                                            {principalImage ? (
                                                <img
                                                    src={getImageUrl(principalImage)}
                                                    alt={item.nombre}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <Package size={20} strokeWidth={1.5} />
                                            )}
                                        </div>
                                        <h4 className="font-bold text-slate-700 text-sm leading-tight line-clamp-2">{item.nombre}</h4>
                                    </div>
                                    <button
                                        onClick={() => onRemoveItem(item.producto_id)}
                                        className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Cantidad</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={item.purchaseQuantity}
                                        onChange={(e) => onUpdateItem(item.producto_id, 'purchaseQuantity', parseInt(e.target.value) || 0)}
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-center font-bold text-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Costo (Bs)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={item.purchaseCost}
                                        onChange={(e) => onUpdateItem(item.producto_id, 'purchaseCost', parseFloat(e.target.value) || 0)}
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-center font-bold text-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center">
                                <span className="text-xs font-medium text-slate-400">Subtotal</span>
                                <span className="font-black text-slate-800 text-sm">Bs {(item.purchaseQuantity * item.purchaseCost).toFixed(2)}</span>
                            </div>
                        </div>
                    );
                })
            )}
            </div>

            {/* Footer / Total */}
            <div className="p-6 bg-slate-50 border-t border-slate-100">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total a Pagar</p>
                        <p className="text-3xl font-black text-slate-800 tracking-tight flex items-baseline gap-1">
                            <span className="text-lg text-slate-400 font-bold">Bs</span>
                            {total.toFixed(2)}
                        </p>
                    </div>
                </div>

                <button
                    onClick={onSubmit}
                    disabled={processing || cart.length === 0}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 disabled:opacity-50 hover:shadow-xl hover:shadow-slate-900/20 hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                >
                    {processing ? (
                        <>Procesando...</>
                    ) : (
                        <>
                            Registrar Ingreso <ArrowRight size={16} />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

