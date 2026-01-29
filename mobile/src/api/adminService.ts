import client from './client';
import { Usuario } from './userService';

export interface AdminDashboardStats {
    total_tenants: number;
    total_users: number;
    mrr_estimated: number; // Monthly Recurring Revenue
    active_alerts: number;
    activity_log: {
        id: number;
        action: string;
        target: string; // "Bodega Juan"
        created_at: string;
    }[];
}

export interface GlobalUser extends Usuario {
    nombre_empresa: string;
    tenant_slug: string;
}

export const adminService = {
  getDashboardStats: async (): Promise<AdminDashboardStats> => {
    const response = await client.get<AdminDashboardStats>('/admin/dashboard-stats');
    return response.data;
  },

  getGlobalUsers: async (search?: string): Promise<GlobalUser[]> => {
    const response = await client.get<GlobalUser[]>('/admin/users', { params: { search } });
    return response.data;
  }
};
