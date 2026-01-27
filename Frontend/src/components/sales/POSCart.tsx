import React from 'react';
import { ShoppingCart, Trash2, Plus, Minus, Receipt, ArrowRight } from 'lucide-react';
import { type Product } from '../../services/productsService';
import { getImageUrl } from '../../utils/imageUtils';

export interface CartItem extends Product {
    cartQuantity: number;
}

interface POSCartProps {
    cart: CartItem[];
    onUpdateQuantity: (productId: number, delta: number) => void;
    onRemoveItem: (productId: number) => void;
    onCheckout: () => void;
    onClearCart: () => void;
}

export const POSCart: React.FC<POSCartProps> = ({ cart, onUpdateQuantity, onRemoveItem, onCheckout, onClearCart }) => {
    const total = cart.reduce((sum, item) => sum + (Number(item.precio) * item.cartQuantity), 0);
    const itemCount = cart.reduce((sum, item) => sum + item.cartQuantity, 0);

    return (
        <div className="w-[420px] bg-white shadow-2xl flex flex-col h-full z-20 relative border-l border-slate-200/60">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 bg-white/80 backdrop-blur-xl z-10 sticky top-0">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                             <ShoppingCart size={24} strokeWidth={2.5} />
                        </div>
                        Orden
                    </h2>
                    {cart.length > 0 && (
                        <button
                            onClick={onClearCart}
                            className="text-xs font-bold text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
                        >
                            <Trash2 size={14} /> Vaciar
                        </button>
                    )}
                </div>
                <div className="flex gap-4 text-xs font-bold text-slate-400 bg-slate-50 px-4 py-2 rounded-lg justify-between items-center">
                    <span className="uppercase tracking-wider">Items: {itemCount}</span>
                    <span className="font-mono text-slate-300">|</span>
                    <span className="font-mono">ORD-{Math.floor(Math.random() * 10000)}</span>
                </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4 bg-slate-50/50">
                {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-6 opacity-60">
                        <div className="p-8 bg-slate-100 rounded-full">
                            <Receipt size={48} strokeWidth={1.5} />
                        </div>
                        <p className="font-bold text-lg">Carrito Vacío</p>
                    </div>
                ) : (
                    cart.map(item => (
                        <div key={item.producto_id} className="bg-white p-3 rounded-[1.25rem] shadow-sm border border-slate-100 hover:border-indigo-100 flex gap-4 group relative overflow-hidden transition-all hover:shadow-md">
                            <div className="w-20 h-20 bg-slate-50 rounded-2xl shrink-0 flex items-center justify-center overflow-hidden border border-slate-100">
                                {item.imagenes && item.imagenes.length > 0 ? (
                                    <img
                                        src={getImageUrl(item.imagenes.find(i => i.es_principal)?.url || item.imagenes[0].url)}
                                        alt={item.nombre}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-xs font-black text-slate-300 opacity-50">#{item.producto_id}</span>
                                )}
                            </div>

                            <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                <h4 className="font-bold text-slate-700 text-sm truncate pr-8 leading-snug">{item.nombre}</h4>
                                <div className="flex items-end justify-between mt-2">
                                    <div className="flex items-center gap-3 bg-slate-100/80 rounded-xl p-1.5">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onUpdateQuantity(item.producto_id, -1); }}
                                            className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-slate-600 hover:text-rose-500 active:scale-90 transition-all border border-transparent hover:border-rose-100"
                                        >
                                            <Minus size={16} strokeWidth={3} />
                                        </button>
                                        <span className="w-6 text-center text-sm font-black text-slate-700 tabular-nums">{item.cartQuantity}</span>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onUpdateQuantity(item.producto_id, 1); }}
                                            className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-slate-600 hover:text-emerald-500 active:scale-90 transition-all border border-transparent hover:border-emerald-100 disabled:opacity-50 disabled:active:scale-100"
                                            disabled={item.cartQuantity >= item.stock_actual}
                                        >
                                            <Plus size={16} strokeWidth={3} />
                                        </button>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Subtotal</div>
                                        <span className="font-black text-slate-800 text-lg leading-none">
                                            <span className="text-xs mr-0.5 align-top">Bs</span>
                                            {(Number(item.precio) * item.cartQuantity).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => onRemoveItem(item.producto_id)}
                                className="absolute top-3 right-3 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="p-8 bg-white border-t border-slate-100 shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.1)] z-20">
                <div className="space-y-3 mb-8">
                    <div className="flex justify-between items-center text-slate-500 text-sm font-medium">
                        <span>Items Total</span>
                        <span>{itemCount}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500 text-sm font-medium">
                        <span>Impuestos (Incl.)</span>
                        <span>Bs {(total * 0.13).toFixed(2)}</span>
                    </div>
                    <div className="pt-4 mt-4 border-t border-slate-100 flex justify-between items-center">
                         <span className="text-slate-400 font-bold text-lg">TOTAL</span>
                         <span className="text-4xl font-black text-slate-900 tracking-tighter">
                            <span className="text-2xl mr-1 font-bold text-slate-400">Bs</span>
                            {total.toFixed(2)}
                         </span>
                    </div>
                </div>

                <button
                    onClick={onCheckout}
                    disabled={cart.length === 0}
                    className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xl tracking-wide hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-slate-900/10 hover:shadow-2xl hover:shadow-indigo-600/20 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-4 group"
                >
                    COBRAR <ArrowRight className="group-hover:translate-x-2 transition-transform" strokeWidth={3} />
                </button>
            </div>
        </div>
    );
};
