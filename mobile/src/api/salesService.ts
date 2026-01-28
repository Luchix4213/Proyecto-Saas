import client from './client';

export interface Sale {
  venta_id: number;
  fecha: string;
  total: number;
  tipo_pago: string;
  estado: string;
  vendedor: {
    nombre_completo: string;
  };
  cliente?: {
    nombre_razon_social: string;
  };
}

export const salesService = {
  getAll: async (params?: { startDate?: string; endDate?: string }) => {
    const response = await client.get<Sale[]>('/ventas', { params });
    return response.data;
  }
};
