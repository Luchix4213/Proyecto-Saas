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
    descuento?: number;
}

export interface CreateVentaData {
    cliente_id?: number | null;
    productos: { producto_id: number; cantidad: number; descuento?: number }[];
    tipo_venta: 'FISICA' | 'ONLINE';
    metodo_pago: 'EFECTIVO' | 'QR' | 'TRANSFERENCIA';
    // qr_pago removed
    monto_recibido?: number;

    // Delivery fields (if needed for manual creation, but usually for Checkout)
    tipo_entrega?: 'RECOJO' | 'DELIVERY';
    latitud?: number;
    longitud?: number;
    costo_envio?: number;
}

export interface Venta {
    venta_id: number;
    tenant_id: number;
    cliente_id?: number;
    usuario_id: number;
    fecha_venta: string;
    total: number;
    tipo_venta: 'FISICA' | 'ONLINE';
    metodo_pago: 'EFECTIVO' | 'QR' | 'TRANSFERENCIA';
    estado: 'REGISTRADA' | 'PAGADA' | 'CANCELADA';

    // Fiscal
    // Fiscal fields removed
    comprobante_pdf?: string;
    comprobante_pago?: string;

    // Pago
    monto_recibido?: number;
    cambio?: number;
    transaccion_id?: string;
    fecha_pago?: string;

    // Logística
    // Logística
    tipo_entrega?: 'RECOJO' | 'DELIVERY';
    direccion_envio?: string;
    ubicacion_maps?: string;
    latitud?: number;
    longitud?: number;
    costo_envio?: number;
    fecha_despacho?: string;
    fecha_entrega?: string;
    estado_entrega: 'PENDIENTE' | 'EN_CAMINO' | 'ENTREGADO';

    cliente?: {
        nombre: string;
        paterno?: string;
        nit_ci?: string;
        email?: string;
        telefono?: string;
    };
    usuario?: {
        nombre: string;
    };
    detalles: DetalleVentaItem[];
}

export const salesService = {
    getAll: async (params?: { tipo?: 'FISICA' | 'ONLINE'; inicio?: string; fin?: string; cliente_id?: number }) => {
        const queryParams = new URLSearchParams();
        if (params?.tipo) queryParams.append('tipo', params.tipo);
        if (params?.inicio) queryParams.append('inicio', params.inicio);
        if (params?.fin) queryParams.append('fin', params.fin);
        if (params?.cliente_id) queryParams.append('cliente_id', String(params.cliente_id));

        const response = await api.get<Venta[]>(`/ventas?${queryParams.toString()}`);
        return response.data;
    },

    // Public Confirmation Methods
    verifyToken: async (token: string) => {
        const response = await api.get(`/public/ventas/verify-token?token=${token}`);
        return response.data;
    },

    confirmDelivery: async (token: string, status: 'CONFIRMADO' | 'RECLAMO', comment?: string) => {
        const response = await api.post('/public/ventas/confirm', { token, status, comment });
        return response.data;
    },

    requestConfirmation: async (ventaId: number) => {
        const response = await api.post(`/ventas/${ventaId}/solicitar-confirmacion`);
        return response.data;
    },

    create: async (data: CreateVentaData) => {
        const response = await api.post<Venta>('/ventas', data);
        return response.data;
    },

    getOne: async (id: number) => {
        const response = await api.get<Venta>(`/ventas/${id}`);
        return response.data;
    },


};
