import api from '../api/axios';

export interface Rubro {
    rubro_id: number;
    nombre: string;
    descripcion?: string;
    estado: 'ACTIVO' | 'INACTIVO';
}

export interface CreateRubroData {
    nombre: string;
    descripcion?: string;
}

export interface UpdateRubroData {
    nombre?: string;
    descripcion?: string;
}

export const rubrosService = {
    getAll: async () => {
        const response = await api.get<Rubro[]>('/rubros');
        return response.data;
    },

    create: async (data: CreateRubroData) => {
        const response = await api.post<Rubro>('/rubros', data);
        return response.data;
    },

    update: async (id: number, data: UpdateRubroData) => {
        const response = await api.patch<Rubro>(`/rubros/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await api.delete(`/rubros/${id}`);
        return response.data;
    }
};
