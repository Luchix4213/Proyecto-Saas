import client from './client';

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
    // qr_pago removed in frontend reference but kept if needed by mobile logic, though keeping strict to frontend:
    // qr_pago?: string;
    monto_recibido?: number;

    // Delivery fields
    tipo_entrega?: 'RECOJO' | 'DELIVERY';
    latitud?: number;
    longitud?: number;
    costo_envio?: number;

    // Mobile specific/Legacy that might be needed, adding optional for compatibility if backend accepts extra fields
    nit_facturacion?: string;
    razon_social?: string;
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
    comprobante_pdf?: string;
    comprobante_pago?: string;
    // Mobile specific fiscal fields kept for safety
    estado_facturacion?: 'PENDIENTE' | 'EMITIDA' | 'ANULADA';
    nit_facturacion?: string;
    razon_social?: string;
    nro_factura?: string;

    // Pago
    monto_recibido?: number;
    cambio?: number;
    transaccion_id?: string;
    fecha_pago?: string;

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

    // Mobile specific logistics
    codigo_seguimiento?: string;
    courier?: string;
    observaciones?: string;

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

        const response = await client.get<Venta[]>(`/ventas?${queryParams.toString()}`);
        return response.data;
    },

    // Public Confirmation Methods
    verifyToken: async (token: string) => {
        const response = await client.get(`/public/ventas/verify-token?token=${token}`);
        return response.data;
    },

    confirmDelivery: async (token: string, status: 'CONFIRMADO' | 'RECLAMO', comment?: string) => {
        const response = await client.post('/public/ventas/confirm', { token, status, comment });
        return response.data;
    },

    requestConfirmation: async (ventaId: number) => {
        const response = await client.post(`/ventas/${ventaId}/solicitar-confirmacion`);
        return response.data;
    },

    create: async (data: CreateVentaData) => {
        const response = await client.post<Venta>('/ventas', data);
        return response.data;
    },

    getOne: async (id: number) => {
        const response = await client.get<Venta>(`/ventas/${id}`);
        return response.data;
    },

    emitInvoice: async (id: number) => {
        const response = await client.patch<Venta>(`/ventas/${id}/emitir-factura`);
        return response.data;
    },

    // Order Status Management
    approvePayment: async (id: number) => {
        const response = await client.patch<Venta>(`/ventas/${id}/aprobar`);
        return response.data;
    },

    rejectSale: async (id: number) => {
        const response = await client.patch<Venta>(`/ventas/${id}/rechazar`);
        return response.data;
    },

    markAsDispatched: async (id: number) => {
        const response = await client.patch<Venta>(`/ventas/${id}/en-camino`);
        return response.data;
    },

    markAsDelivered: async (id: number) => {
        const response = await client.patch<Venta>(`/ventas/${id}/entregar`);
        return response.data;
    }
};
