import api from '../api/axios';

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
        const response = await api.get<Category[]>('/categories', { params });
        return response.data;
    },

    getById: async (id: number) => {
        const response = await api.get<Category>(`/categories/${id}`);
        return response.data;
    },

    create: async (data: CreateCategoryData) => {
        const response = await api.post<Category>('/categories', data);
        return response.data;
    },

    update: async (id: number, data: UpdateCategoryData) => {
        const response = await api.patch<Category>(`/categories/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await api.delete(`/categories/${id}`);
        return response.data;
    }
};
