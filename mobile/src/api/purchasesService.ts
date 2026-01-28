import client from './client';

export interface PurchaseItem {
  producto_id: number;
  cantidad: number;
  costo_unitario: number;
}

export interface Purchase {
  compra_id: number;
  fecha_compra: string;
  total: number;
  proveedor_id: number;
  proveedor: {
    nombre: string;
  };
  comprobante_url?: string;
  detalles: any[];
}

export const purchasesService = {
  getAll: async (params?: { proveedorId?: number }) => {
    const response = await client.get<Purchase[]>('/compras', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await client.get<Purchase>(`/compras/${id}`);
    return response.data;
  },

  create: async (data: { proveedor_id: number; productos: PurchaseItem[]; metodo_pago: string }, file?: any) => {
    const formData = new FormData();

    // Append JSON data as a string (the backend handles 'data' key)
    formData.append('data', JSON.stringify(data));

    if (file) {
      formData.append('comprobante', {
        uri: file.uri,
        type: file.type || 'image/jpeg',
        name: file.name || 'comprobante.jpg',
      } as any);
    }

    const response = await client.post<Purchase>('/compras', formData);
    return response.data;
  }
};
