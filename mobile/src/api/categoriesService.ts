import client from './client';

export interface Category {
  categoria_id: number;
  nombre: string;
  descripcion?: string;
}

export const categoriesService = {
  getAll: async () => {
    const response = await client.get<Category[]>('/categories');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await client.get<Category>(`/categories/${id}`);
    return response.data;
  },
  create: async (data: Partial<Category>) => {
    const response = await client.post<Category>('/categories', data);
    return response.data;
  },
  update: async (id: number, data: Partial<Category>) => {
    const response = await client.patch<Category>(`/categories/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    await client.delete(`/categories/${id}`);
  }
};
