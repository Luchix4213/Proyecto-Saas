// mobile/src/api/tenantsService.ts
import client from './client';

export interface Tenant {
  tenant_id: number;
  nombre_empresa: string;
  slug: string | null;
  logo_url: string | null;
  banner_url: string | null;
  telefono: string | null;
  email: string;
  direccion: string | null;
  horario_atencion: string | null;
  rubro?: string; // or handled via array if backend populated it
  estado: 'ACTIVA' | 'SUSPENDIDO' | 'PENDIENTE' | 'INACTIVA';
  plan_actual?: string;
  [key: string]: any;
}

export interface UpdateTenantDto {
  nombre_empresa?: string;
  telefono?: string;
  direccion?: string;
  email?: string;
  horario_atencion?: string;
  // Fields below must be sent as file uploads if changed
  logo_url?: string;
  banner_url?: string;
}

export const tenantsService = {
  getMyTenant: async (): Promise<Tenant> => {
    const response = await client.get('/tenants/me');
    return response.data;
  },

  getAllTenants: async (rubro?: string): Promise<Tenant[]> => {
    const response = await client.get('/tenants', { params: { rubro } });
    return response.data;
  },

  updateTenant: async (id: number, data: UpdateTenantDto | FormData) => {
    // If data is FormData, let axios handle headers
    const config = data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    const response = await client.patch(`/tenants/${id}`, data, config);
    return response.data;
  },

  updateStatus: async (id: number, estado: string) => {
    const response = await client.patch(`/tenants/${id}/status`, { estado });
    return response.data;
  }
};
