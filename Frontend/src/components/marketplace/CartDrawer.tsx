import React from 'react';
import { ShoppingBag, X, Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { type Tenant } from '../../services/tenantsService';
import { useNavigate } from 'react-router-dom';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, tenant }) => {
  const { items, removeItem, updateQuantity, getTotal, getItemCount } = useCartStore();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleCheckout = () => {
    onClose();
    navigate(`/tienda/${tenant.slug}/checkout`);
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md transform transition-transform animate-slide-in-right">
          <div className="h-full flex flex-col bg-white shadow-2xl rounded-l-[3rem] overflow-hidden">

            {/* Header */}
            <div className="px-8 py-10 bg-slate-900 text-white relative">
              <div className="absolute top-0 right-0 p-8">
                <button
                  onClick={onClose}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex items-center gap-4 mb-2">
                <div className="h-12 w-12 bg-teal-500 rounded-2xl flex items-center justify-center">
                  <ShoppingBag size={24} />
                </div>
                <h2 className="text-2xl font-black">Tu Pedido</h2>
              </div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                {tenant.nombre_empresa} • {getItemCount()} {getItemCount() === 1 ? 'artículo' : 'artículos'}
              </p>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-300">
                    <ShoppingBag size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Carrito vacío</h3>
                  <p className="text-slate-500 max-w-[200px]">Explora el catálogo y agrega tus productos favoritos.</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.producto_id} className="group relative flex items-center gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-100/50 hover:bg-white hover:border-slate-200 transition-all shadow-sm hover:shadow-md">
                    <div className="h-20 w-20 bg-white rounded-2xl flex-shrink-0 flex items-center justify-center border border-slate-100 overflow-hidden">
                      {item.imagen_url ? (
                        <img src={`http://localhost:3000${item.imagen_url}`} alt={item.nombre} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-slate-200"><ShoppingBag size={32} /></div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 truncate mb-1">{item.nombre}</h4>
                      <p className="text-teal-600 font-black text-sm">
                        {item.precio.toFixed(2)} {tenant.moneda}
                      </p>

                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center bg-white rounded-xl border border-slate-100 shadow-sm">
                          <button
                            onClick={() => updateQuantity(item.producto_id, item.cantidad - 1)}
                            className="p-1.5 hover:text-teal-600 transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center text-sm font-black text-slate-700">{item.cantidad}</span>
                          <button
                            onClick={() => updateQuantity(item.producto_id, item.cantidad + 1)}
                            className="p-1.5 hover:text-teal-600 transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => removeItem(item.producto_id)}
                      className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-8 py-10 bg-slate-50 border-t border-slate-100">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">Total a pagar</span>
                  <div className="text-right">
                    <span className="text-3xl font-black text-slate-900">
                      {getTotal().toFixed(2)}
                    </span>
                    <span className="ml-1 text-sm font-bold text-slate-500">{tenant.moneda}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full h-16 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center gap-3 font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-[0.98] group"
                >
                  Continuar pedido
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>

                <p className="text-center text-[10px] text-slate-400 font-medium mt-6 uppercase tracking-widest">
                  Paga con QR o Transferencia bancaria
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
