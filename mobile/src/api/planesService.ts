// mobile/src/api/planesService.ts
import client from './client';

export interface Plan {
  plan_id: number;
  nombre_plan: string;
  descripcion?: string;
  max_usuarios: number;
  max_productos: number;
  ventas_online: boolean;
  reportes_avanzados: boolean;
  precio_mensual: number;
  precio_anual: number;
  estado: 'ACTIVO' | 'INACTIVO';
}

export const planesService = {
  getPlanes: async (): Promise<Plan[]> => {
    const response = await client.get('/planes');
    return response.data;
  },

  createPlan: async (data: Omit<Plan, 'plan_id'>) => {
      const response = await client.post('/planes', data);
      return response.data;
  },

  updatePlan: async (id: number, data: Partial<Plan>) => {
      const response = await client.patch(`/planes/${id}`, data);
      return response.data;
  }
};
