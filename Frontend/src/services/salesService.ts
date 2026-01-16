import api from '../api/axios';

export interface DetalleVentaItem {
    producto_id: number;
    cantidad: number;
    precio_unitario?: number; // Optional on creation (backend handles it), returned on read
    subtotal?: number;
    producto?: {
        nombre: string;
        precio: number;
    };
}

export interface CreateVentaData {
    cliente_id?: number | null;
    productos: { producto_id: number; cantidad: number }[];
    tipo_venta: 'FISICA' | 'ONLINE';
    metodo_pago: 'EFECTIVO' | 'QR' | 'TRANSFERENCIA';
    qr_pago?: string;
}

export interface Venta {
    venta_id: number;
    tenant_id: number;
    cliente_id?: number;
    usuario_id: number;
    fecha_venta: string;
    total: number;
    tipo_venta: string;
    metodo_pago: string;
    estado: string;
    cliente?: {
        nombre: string;
        paterno?: string;
        nit_ci?: string;
    };
    usuario?: {
        nombre: string;
    };
    detalles: DetalleVentaItem[];
}

export const salesService = {
    getAll: async () => {
        const response = await api.get<Venta[]>('/ventas');
        return response.data;
    },

    create: async (data: CreateVentaData) => {
        const response = await api.post<Venta>('/ventas', data);
        return response.data;
    },

    getOne: async (id: number) => {
        const response = await api.get<Venta>(`/ventas/${id}`);
        return response.data;
    }
};
