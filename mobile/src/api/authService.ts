import client from './client';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterTenantRequest {
    nombre_empresa: string;
    telefono_empresa?: string;
    email_empresa?: string;
    direccion_empresa?: string;
    rubros: number[];
    nombre: string;
    paterno: string;
    materno?: string;
    email: string;
    password: string;
}

export interface UpdateProfileData {
    nombre?: string;
    paterno?: string;
    materno?: string;
    email?: string;
    password?: string;
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
    const response = await client.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterTenantRequest) => {
    const response = await client.post('/auth/register', data);
    return response.data;
  },

  getProfile: async () => {
    const response = await client.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileData) => {
    const response = await client.patch('/auth/profile', data);
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await client.post('/auth/forgot-password', { email });
    return response.data;
  }
};

