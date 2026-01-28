import client from './client';

export interface CreateCompraData {
    proveedor_id?: number;
    productos: { producto_id: number; cantidad: number; costo_unitario: number; lote?: string; fecha_vencimiento?: string }[];
    metodo_pago: 'EFECTIVO' | 'QR' | 'TRANSFERENCIA';
    nro_factura?: string;
    observaciones?: string;
}

export interface Compra {
    compra_id: number;
    tenant_id: number;
    proveedor_id: number;
    usuario_id: number;
    fecha_compra: string;
    total: number;
    estado: string;
    metodo_pago: 'EFECTIVO' | 'QR' | 'TRANSFERENCIA';
    nro_factura?: string;
    observaciones?: string;
    comprobante_url?: string;
    proveedor?: {
        nombre: string;
        contacto?: string;
        nit?: string;
    };
    usuario?: {
        nombre: string;
    };
    detalles: PurchaseDetail[];
}

export interface PurchaseDetail {
    detalle_id?: number;
    producto_id: number;
    cantidad: number;
    costo_unitario: number;
    lote?: string;
    fecha_vencimiento?: string;
    producto?: {
        nombre: string;
    };
}

export const purchasesService = {
    getAll: async (proveedorId?: number) => {
        const response = await client.get<Compra[]>('/compras', {
            params: { proveedor_id: proveedorId }
        });
        return response.data;
    },

    getById: async (id: number) => {
        const response = await client.get<Compra>(`/compras/${id}`);
        return response.data;
    },

    create: async (data: CreateCompraData | FormData) => {
        const isFormData = data instanceof FormData;
        const response = await client.post<Compra>('/compras', data, {
            headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined
        });
        return response.data;
    },

    downloadPdf: async (id: number) => {
        const response = await client.get(`/compras/${id}/pdf`, {
            responseType: 'blob'
        });
        return response.data;
    },
};
