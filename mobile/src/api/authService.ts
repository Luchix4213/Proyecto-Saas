import client from './client';

export interface RegisterTenantRequest {
  nombre_empresa: string;
  telefono_empresa?: string;
  email_empresa: string;
  direccion_empresa?: string;
  rubros: number[];
  nombre: string;
  paterno: string;
  materno?: string;
  email: string;
  password: string;
}

export const authService = {
  register: async (data: RegisterTenantRequest) => {
    const response = await client.post('/auth/register', data);
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await client.post('/auth/forgot-password', { email });
    return response.data;
  }
};
