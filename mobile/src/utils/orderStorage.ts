import AsyncStorage from '@react-native-async-storage/async-storage';

const ORDERS_KEY = 'kipu_guest_orders';

export interface LocalOrder {
    order_id: string | number;
    fecha: string;
    total: number;
    items_count: number;
    estado: string;
    store_name: string;
    store_slug: string;
    items: Array<{
        producto_id: number;
        nombre: string;
        precio: number;
        cantidad: number;
        imagen_url?: string;
    }>;
    details?: {
        direccion: string;
        metodo_entrega: string;
        metodo_pago: string;
    };
}

export const orderStorage = {
    saveOrder: async (order: LocalOrder) => {
        try {
            const existing = await orderStorage.getOrders();
            const updated = [order, ...existing].slice(0, 50); // Keep last 50
            await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
        } catch (error) {
            console.error('Error saving local order', error);
        }
    },

    getOrders: async (): Promise<LocalOrder[]> => {
        try {
            const data = await AsyncStorage.getItem(ORDERS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error getting local orders', error);
            return [];
        }
    },

    clearOrders: async () => {
        await AsyncStorage.removeItem(ORDERS_KEY);
    }
};
