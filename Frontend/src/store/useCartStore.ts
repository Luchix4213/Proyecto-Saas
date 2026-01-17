import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  producto_id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen_url?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (product: any, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1) => {
        const items = get().items;
        const existingItem = items.find((i) => i.producto_id === product.producto_id);

        if (existingItem) {
          set({
            items: items.map((i) =>
              i.producto_id === product.producto_id
                ? { ...i, cantidad: i.cantidad + quantity }
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
                cantidad: quantity,
                imagen_url: product.imagenes?.[0]?.url,
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
    }),
    {
      name: 'kipu-cart-storage',
    }
  )
);
