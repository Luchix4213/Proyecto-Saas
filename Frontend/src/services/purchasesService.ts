import api from '../api/axios';

export interface CreateCompraData {
    proveedor_id: number;
    productos: { producto_id: number; cantidad: number; costo_unitario: number }[];
}

export interface Compra {
    compra_id: number;
    tenant_id: number;
    proveedor_id: number;
    usuario_id: number;
    fecha_compra: string;
    total: number;
    estado: string;
    proveedor?: {
        nombre: string;
    };
    usuario?: {
        nombre: string;
    };
    detalles: any[]; // Simplified for now
}

export const purchasesService = {
    getAll: async () => {
        const response = await api.get<Compra[]>('/compras');
        return response.data;
    },

    create: async (data: CreateCompraData) => {
        const response = await api.post<Compra>('/compras', data);
        return response.data;
    },
};
