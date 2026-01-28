import client from './client';

export interface Category {
  categoria_id: number;
  nombre: string;
  descripcion?: string;
  estado: 'ACTIVO' | 'INACTIVO';
}

export interface CreateCategoryData {
  nombre: string;
  descripcion?: string;
}

export interface UpdateCategoryData {
  nombre?: string;
  descripcion?: string;
}

export const categoriesService = {
  getAll: async (estado?: 'ACTIVO' | 'INACTIVO') => {
    const params = estado ? { estado } : {};
    const response = await client.get<Category[]>('/categories', { params });
    return response.data;
  },
  getById: async (id: number) => {
    const response = await client.get<Category>(`/categories/${id}`);
    return response.data;
  },
  create: async (data: CreateCategoryData) => {
    const response = await client.post<Category>('/categories', data);
    return response.data;
  },
  update: async (id: number, data: UpdateCategoryData) => {
    const response = await client.patch<Category>(`/categories/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await client.delete(`/categories/${id}`);
    return response.data;
  }
};
