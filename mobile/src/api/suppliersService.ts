import client from './client';

export interface Supplier {
  proveedor_id: number;
  nombre: string;
  nit_ci?: string;
  telefono?: string;
  direccion?: string;
  email?: string;
  datos_pago?: string;
  contacto_nombre?: string;
  estado: 'ACTIVO' | 'INACTIVO';
}

export const suppliersService = {
  getAll: async () => {
    const response = await client.get<Supplier[]>('/proveedores');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await client.get<Supplier>(`/proveedores/${id}`);
    return response.data;
  },

  create: async (data: Partial<Supplier>) => {
    const response = await client.post<Supplier>('/proveedores', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Supplier>) => {
    const response = await client.patch<Supplier>(`/proveedores/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await client.delete(`/proveedores/${id}`);
    return response.data;
  },
};
