import client from './client';

export interface Rubro {
  rubro_id: number;
  nombre: string;
  descripcion?: string;
  estado: 'ACTIVO' | 'INACTIVO';
}

export const rubrosService = {
  getAll: async () => {
    const response = await client.get<Rubro[]>('/rubros');
    return response.data;
  }
};
