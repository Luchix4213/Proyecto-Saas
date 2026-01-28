import client from './client';

export interface DashboardStats {
  ventasHoy: number;
  porcentajeVariacion: number;
  pedidosHoy: number;
  productosBajoStock: number;
  ventasRecientes: any[];
  comparativaVentas: {
    dia: string;
    total: number;
  }[];
}

export const reportsService = {
  getDashboardStats: async () => {
    const response = await client.get<DashboardStats>('/reportes/dashboard');
    return response.data;
  },

  getStaffPerformance: async (inicio?: string, fin?: string) => {
    const response = await client.get<any[]>('/reportes/vendedores', { params: { inicio, fin } });
    return response.data;
  }
};
