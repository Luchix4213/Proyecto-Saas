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
        <div className="w-[400px] bg-white shadow-2xl flex flex-col h-full z-20 relative border-l border-slate-100">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 bg-white z-10">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                        <ShoppingCart className="text-teal-500" strokeWidth={2.5} />
                        Orden Actual
                    </h2>
                    {cart.length > 0 && (
                        <button
                            onClick={onClearCart}
                            className="text-xs font-bold text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors"
                        >
                            Vaciar
                        </button>
                    )}
                </div>
                <div className="flex gap-4 text-xs font-bold text-slate-400">
                    <span>{itemCount} items</span>
                    <span>•</span>
                    <span>#ORD-{Math.floor(Math.random() * 10000)}</span>
                </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3 bg-slate-50/50">
                {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4 opacity-50">
                        <Receipt size={64} strokeWidth={1} />
                        <p className="font-bold">Carrito Vacío</p>
                    </div>
                ) : (
                    cart.map(item => (
                        <div key={item.producto_id} className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex gap-3 group relative overflow-hidden">
                            <div className="w-16 h-16 bg-slate-50 rounded-xl shrink-0 flex items-center justify-center overflow-hidden">
                                {item.imagenes && item.imagenes.length > 0 ? (
                                    <img
                                        src={getImageUrl(item.imagenes.find(i => i.es_principal)?.url || item.imagenes[0].url)}
                                        alt={item.nombre}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-xs font-black text-slate-300">#{item.producto_id}</span>
                                )}
                            </div>

                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                                <h4 className="font-bold text-slate-700 text-sm truncate pr-6">{item.nombre}</h4>
                                <div className="flex items-end justify-between">
                                    <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onUpdateQuantity(item.producto_id, -1); }}
                                            className="w-6 h-6 flex items-center justify-center bg-white rounded-md shadow-sm text-slate-600 hover:text-red-500 active:scale-95 transition-all"
                                        >
                                            <Minus size={14} strokeWidth={3} />
                                        </button>
                                        <span className="w-4 text-center text-xs font-black text-slate-700">{item.cartQuantity}</span>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onUpdateQuantity(item.producto_id, 1); }}
                                            className="w-6 h-6 flex items-center justify-center bg-white rounded-md shadow-sm text-slate-600 hover:text-green-500 active:scale-95 transition-all disabled:opacity-50"
                                            disabled={item.cartQuantity >= item.stock_actual}
                                        >
                                            <Plus size={14} strokeWidth={3} />
                                        </button>
                                    </div>
                                    <span className="font-black text-slate-800">
                                        Bs {(Number(item.precio) * item.cartQuantity).toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => onRemoveItem(item.producto_id)}
                                className="absolute top-0 right-0 p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-bl-2xl transition-all"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="p-6 bg-white border-t border-slate-100 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-20">
                <div className="space-y-2 mb-6">
                    <div className="flex justify-between items-center text-slate-500 text-sm font-medium">
                        <span>Subtotal</span>
                        <span>Bs {total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-800 text-3xl font-black tracking-tight">
                        <span>Total</span>
                        <span>Bs {total.toFixed(2)}</span>
                    </div>
                </div>

                <button
                    onClick={onCheckout}
                    disabled={cart.length === 0}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:shadow-teal-500/20 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 group"
                >
                    Cobrar <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
};
