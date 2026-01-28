import client from './client';

export interface Proveedor {
  proveedor_id: number;
  nombre: string;
  telefono?: string;
  email?: string;
  datos_pago?: string;
  estado: 'ACTIVO' | 'INACTIVO';
}

export interface CreateProveedorData {
  nombre: string;
  telefono?: string;
  email?: string;
  datos_pago?: string;
}

export interface UpdateProveedorData extends Partial<CreateProveedorData> { }

export const suppliersService = {
  getAll: async () => {
    const response = await client.get<Proveedor[]>('/proveedores');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await client.get<Proveedor>(`/proveedores/${id}`);
    return response.data;
  },

  create: async (data: CreateProveedorData) => {
    const response = await client.post<Proveedor>('/proveedores', data);
    return response.data;
  },

  update: async (id: number, data: UpdateProveedorData) => {
    const response = await client.patch<Proveedor>(`/proveedores/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await client.delete<Proveedor>(`/proveedores/${id}`);
    return response.data;
  },
};
