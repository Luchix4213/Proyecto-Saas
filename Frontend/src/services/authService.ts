import api from '../api/axios';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterTenantRequest {
    nombre_empresa: string;
    telefono_empresa?: string;
    direccion_empresa?: string;
    nombre: string;
    paterno: string;
    materno?: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    access_token: string;
    user: {
        id: number;
        nombre: string;
        email: string;
        rol: string;
        tenant_id: number;
    };
}

export const authService = {
    login: async (data: LoginRequest) => {
        const response = await api.post<AuthResponse>('/auth/login', data);
        return response.data;
    },

    register: async (data: RegisterTenantRequest) => {
        const response = await api.post('/auth/register', data);
        return response.data;
    },

    getProfile: async () => {
        const response = await api.get('/auth/profile');
        return response.data;
    }
};
