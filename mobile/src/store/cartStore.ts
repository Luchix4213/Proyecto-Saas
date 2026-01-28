import { create } from 'zustand';

interface CartItem {
  producto_id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen_url?: string;
  tenant_slug: string;
}

interface CartState {
  items: CartItem[];
  addItem: (product: any, tenantSlug: string) => void;
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

  addItem: (product, tenantSlug) => {
    const { items, currentTenantSlug } = get();

    // Reset if adding from a different tenant
    if (currentTenantSlug && currentTenantSlug !== tenantSlug) {
        // Simple strategy: Clear cart if switching stores
        // In a real app, you might ask for confirmation
        set({ items: [], currentTenantSlug: tenantSlug, total: 0 });
    }

    // Ensure currentTenantSlug is set
    if (!get().currentTenantSlug) {
        set({ currentTenantSlug: tenantSlug });
    }

    const currentItems = get().items; // Re-fetch after potential clear
    const existingItem = currentItems.find((i) => i.producto_id === product.producto_id);

    if (existingItem) {
      get().updateQuantity(product.producto_id, 1);
    } else {
      const newItem: CartItem = {
        producto_id: product.producto_id,
        nombre: product.nombre,
        precio: Number(product.precio),
        cantidad: 1,
        imagen_url: product.imagen_url,
        tenant_slug: tenantSlug
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
        // Reset tenant slug if cart becomes empty
        currentTenantSlug: newItems.length === 0 ? null : get().currentTenantSlug
    });
  },

  updateQuantity: (productoId, delta) => {
    const newItems = get().items.map((item) => {
      if (item.producto_id === productoId) {
        const newQty = Math.max(1, item.cantidad + delta);
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
