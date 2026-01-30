import { create } from 'zustand';

interface CartItem {
  producto_id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen_url?: string;
  tenant_slug: string;
  stock_actual: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: any, tenantSlug: string, quantity?: number) => void;
  removeItem: (productoId: number) => void;
  updateQuantity: (productoId: number, delta: number) => void;
  clearCart: () => void;
  total: number;
  currentTenantSlug: string | null;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  total: 0,
  currentTenantSlug: null,

  addItem: (product, tenantSlug, quantity = 1) => {
    const { items, currentTenantSlug } = get();

    // Reset if adding from a different tenant
    if (currentTenantSlug && currentTenantSlug !== tenantSlug) {
        set({ items: [], currentTenantSlug: tenantSlug, total: 0 });
    }

    // Ensure currentTenantSlug is set
    if (!get().currentTenantSlug) {
        set({ currentTenantSlug: tenantSlug });
    }

    const currentItems = get().items;
    const existingItem = currentItems.find((i) => i.producto_id === product.producto_id);

    if (existingItem) {
      // Use provided quantity or default to 1 if not specified
      const additionalQty = quantity;
      const stock = Number(product.stock_actual ?? existingItem.stock_actual ?? 999999);
      const newQty = Math.min(stock, existingItem.cantidad + additionalQty);

      const newItems = currentItems.map(item =>
        item.producto_id === product.producto_id ? { ...item, cantidad: newQty } : item
      );
      set({ items: newItems, total: calculateTotal(newItems) });
    } else {
      const newItem: CartItem = {
        producto_id: product.producto_id,
        nombre: product.nombre,
        precio: Number(product.precio),
        cantidad: quantity,
        imagen_url: product.imagenes?.[0]?.url || product.imagen_url,
        tenant_slug: tenantSlug,
        stock_actual: Number(product.stock_actual ?? 999999)
      };
      const newItems = [...currentItems, newItem];
      set({ items: newItems, total: calculateTotal(newItems) });
    }
  },

  removeItem: (productoId) => {
    const newItems = get().items.filter((i) => i.producto_id !== productoId);
    const newTotal = calculateTotal(newItems);
    set({
        items: newItems,
        total: newTotal,
        currentTenantSlug: newItems.length === 0 ? null : get().currentTenantSlug
    });
  },

  updateQuantity: (productoId, delta) => {
    const newItems = get().items.map((item) => {
      if (item.producto_id === productoId) {
        const stock = Number(item.stock_actual ?? 999999);
        const currentQty = Number(item.cantidad || 0);
        const newQty = Math.min(stock, Math.max(1, currentQty + delta));
        return { ...item, cantidad: newQty };
      }
      return item;
    });
    set({ items: newItems, total: calculateTotal(newItems) });
  },

  clearCart: () => set({ items: [], total: 0, currentTenantSlug: null }),
}));

const calculateTotal = (items: CartItem[]) => {
  return items.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
};
