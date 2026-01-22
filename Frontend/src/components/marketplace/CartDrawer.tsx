import React from 'react';
import { ShoppingBag, X, Minus, Plus, ArrowRight, Store } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { type Tenant } from '../../services/tenantsService';
import { useNavigate } from 'react-router-dom';

export const CartDrawer: React.FC<{ isOpen: boolean; onClose: () => void; tenant?: Tenant; filterSlug?: string }> = ({ isOpen, onClose, tenant, filterSlug }) => {
  const { items, removeItem, updateQuantity, getTenantTotal, getItemCount } = useCartStore();
  const navigate = useNavigate();

  // Group items by tenant if global view
  const groupedItems = React.useMemo(() => {
    if (tenant) {
      // Fallback to tenant_id if slug is null
      const key = tenant.slug || String(tenant.tenant_id);
      return { [key]: items.filter(i => i.tenant_slug === key) };
    }
    if (filterSlug) {
      // Filter by slug (from URL context) without full tenant object
      // Assuming filterSlug comes from URL, so it matches what was stored.
      const matchingItems = items.filter(i => i.tenant_slug === filterSlug);
      // If we want to show the store name header even if we don't have the Tenant object, we rely on the first item's tenant_name.
      return matchingItems.length > 0 ? { [filterSlug]: matchingItems } : {};
    }
    return items.reduce((acc, item) => {
      const key = item.tenant_slug;
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {} as Record<string, typeof items>);
  }, [items, tenant, filterSlug]);

  if (!isOpen) return null;

  const handleCheckout = (tenantSlug: string) => {
    onClose();
    navigate(`/tienda/${tenantSlug}/checkout`);
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-fade-in" onClick={onClose} />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md transform transition-transform animate-slide-in-right">
          <div className="h-full flex flex-col bg-slate-50 shadow-2xl rounded-l-[2rem] overflow-hidden">

            {/* Header */}
            <div className="px-6 py-6 bg-white border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Tu Carrito</h2>
                  <p className="text-xs text-slate-500 font-medium">{getItemCount()} items en total</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                    <ShoppingBag size={32} className="text-slate-300" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Tu carrito está vacío</h3>
                  <p className="text-slate-500 text-sm max-w-[200px]">Explora nuestras tiendas y encuentra lo que necesitas.</p>
                  <button onClick={onClose} className="mt-6 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm">
                    Seguir comprando
                  </button>
                </div>
              ) : (
                Object.entries(groupedItems).map(([slug, groupItems]) => (
                  <div key={slug} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                    {/* Tenant Header */}
                    {!tenant && (
                      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-50">
                        <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                          <Store size={14} />
                        </div>
                        <span className="font-bold text-slate-800 text-sm">{groupItems[0].tenant_name || slug}</span>
                      </div>
                    )}

                    <div className="space-y-4">
                      {groupItems.map((item) => (
                        <div key={item.producto_id} className="flex gap-3">
                          <div className="h-16 w-16 bg-slate-50 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-100">
                            {item.imagen_url ? (
                              <img src={`http://localhost:3000${item.imagen_url}`} alt={item.nombre} className="w-full h-full object-cover" />
                            ) : (
                              <ShoppingBag size={20} className="text-slate-300" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="font-bold text-slate-900 truncate text-sm">{item.nombre}</h4>
                              <button onClick={() => removeItem(item.producto_id)} className="text-slate-300 hover:text-red-500 transition-colors">
                                <X size={14} />
                              </button>
                            </div>
                            <p className="text-teal-600 font-bold text-sm mb-2">{item.precio} Bs</p>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center bg-slate-50 rounded-lg border border-slate-100">
                                <button onClick={() => updateQuantity(item.producto_id, item.cantidad - 1)} className="p-1 hover:text-teal-600 transition-colors">
                                  <Minus size={12} />
                                </button>
                                <span className="w-6 text-center text-xs font-bold text-slate-700">{item.cantidad}</span>
                                <button onClick={() => updateQuantity(item.producto_id, item.cantidad + 1)} className="p-1 hover:text-teal-600 transition-colors">
                                  <Plus size={12} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Store Total */}
                    <div className="mt-4 pt-4 border-t border-slate-50">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-slate-500 uppercase">Subtotal</span>
                        <span className="text-lg font-black text-slate-900">{getTenantTotal(slug).toFixed(2)} Bs</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer / Checkout Actions */}
            <div className="px-6 py-6 bg-white border-t border-slate-100 space-y-3">
              {items.length > 0 && (
                <button
                  onClick={() => {
                    // Start sequential checkout with the first tenant
                    const firstTenantSlug = Object.keys(groupedItems)[0];
                    handleCheckout(firstTenantSlug);
                  }}
                  className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center justify-between px-6 shadow-xl shadow-slate-900/10 group"
                >
                  <span>Procesar Compra ({items.length} items)</span>
                  <div className="flex items-center gap-3">
                    <span className="opacity-80 font-medium">{useCartStore.getState().getTotal().toFixed(2)} Bs</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              )}
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest text-center pt-2">
                Kipu Secure Checkout
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

