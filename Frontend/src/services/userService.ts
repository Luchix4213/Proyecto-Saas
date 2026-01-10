import api from '../api/axios';

export interface Usuario {
    usuario_id: number;
    nombre: string;
    paterno?: string;
    materno?: string;
    email: string;
    rol: 'ADMIN' | 'MICROEMPRESA_P' | 'VENDEDOR';
    estado: 'ACTIVO' | 'INACTIVO';
}

export const userService = {
    getAll: async () => {
        const response = await api.get<Usuario[]>('/usuarios');
        return response.data;
    },

    create: async (data: any) => {
        const response = await api.post('/usuarios', data);
        return response.data;
    },

    update: async (id: number, data: any) => {
        const response = await api.patch(`/usuarios/${id}`, data);
        return response.data;
    },

    changePassword: async (id: number, data: any) => {
        const response = await api.post(`/usuarios/password/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await api.delete(`/usuarios/${id}`);
        return response.data;
    },
};
