import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  producto_id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen_url?: string;
  tenant_slug: string;
  tenant_name?: string;
  stock_maximo: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: any) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  getTenantTotal: (tenantSlug: string) => number;
  getTenantItemCount: (tenantSlug: string) => number;
  removeItems: (productIds: number[]) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        const items = get().items;
        const existingItem = items.find((i) => i.producto_id === product.producto_id);

        if (existingItem) {
          // Check stock limit if possible, for now just increment
          set({
            items: items.map((i) =>
              i.producto_id === product.producto_id
                ? { ...i, cantidad: i.cantidad + (product.cantidad || 1) }
                : i
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                producto_id: product.producto_id,
                nombre: product.nombre,
                precio: Number(product.precio),
                cantidad: product.cantidad || 1,
                imagen_url: product.imagen_url || product.imagenes?.[0]?.url,
                tenant_slug: product.tenant_slug || product.tenant?.slug || String(product.tenant?.tenant_id),
                tenant_name: product.tenant_name || product.tenant?.nombre_empresa,
                stock_maximo: product.stock_actual || product.stock_maximo || 100
              },
            ],
          });
        }
      },
      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.producto_id !== productId) });
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.producto_id === productId ? { ...i, cantidad: quantity } : i
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        return get().items.reduce((total, item) => total + item.precio * item.cantidad, 0);
      },
      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.cantidad, 0);
      },
      getTenantTotal: (tenantSlug: string) => {
        return get().items
          .filter(item => item.tenant_slug === tenantSlug)
          .reduce((total, item) => total + item.precio * item.cantidad, 0);
      },
      getTenantItemCount: (tenantSlug: string) => {
        return get().items
          .filter(item => item.tenant_slug === tenantSlug)
          .reduce((total, item) => total + item.cantidad, 0);
      },
      removeItems: (productIds: number[]) => {
        set({
          items: get().items.filter((i) => !productIds.includes(i.producto_id))
        });
      }
    }),
    {
      name: 'kipu-cart-storage',
    }
  )
);
