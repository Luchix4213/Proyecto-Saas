import { create } from 'zustand';

interface CartItem {
  producto_id: number;
  nombre: string;
  precio: number;
  cantidad: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: any) => void;
  removeItem: (productoId: number) => void;
  updateQuantity: (productoId: number, delta: number) => void;
  clearCart: () => void;
  total: number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  total: 0,

  addItem: (product) => {
    const { items } = get();
    const existingItem = items.find((i) => i.producto_id === product.producto_id);

    if (existingItem) {
      get().updateQuantity(product.producto_id, 1);
    } else {
      const newItem = {
        producto_id: product.producto_id,
        nombre: product.nombre,
        precio: product.precio,
        cantidad: 1,
      };
      const newItems = [...items, newItem];
      set({ items: newItems, total: calculateTotal(newItems) });
    }
  },

  removeItem: (productoId) => {
    const newItems = get().items.filter((i) => i.producto_id !== productoId);
    set({ items: newItems, total: calculateTotal(newItems) });
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

  clearCart: () => set({ items: [], total: 0 }),
}));

const calculateTotal = (items: CartItem[]) => {
  return items.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
};
