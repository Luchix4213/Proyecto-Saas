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
    qr_pago?: string;
    monto_recibido?: number;
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
    estado_facturacion: 'PENDIENTE' | 'EMITIDA' | 'ANULADA';
    nit_facturacion?: string;
    razon_social?: string;
    nro_factura?: string;
    comprobante_pdf?: string;
    comprobante_pago?: string;

    // Pago
    monto_recibido?: number;
    cambio?: number;
    transaccion_id?: string;
    fecha_pago?: string;

    // Logística
    direccion_envio?: string;
    ubicacion_maps?: string;
    costo_envio?: number;
    codigo_seguimiento?: string;
    courier?: string;
    fecha_despacho?: string;
    fecha_entrega?: string;
    estado_entrega: 'PENDIENTE' | 'EN_CAMINO' | 'ENTREGADO';
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

        const response = await api.get<Venta[]>(`/ventas?${queryParams.toString()}`);
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

    emitInvoice: async (id: number) => {
        const response = await api.patch<Venta>(`/ventas/${id}/emitir-factura`);
        return response.data;
    }
};
