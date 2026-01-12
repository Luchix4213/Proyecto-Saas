import api from '../api/axios';

export interface Tenant {
    tenant_id: number;
    nombre_empresa: string;
    email: string;
    estado: 'ACTIVA' | 'PENDIENTE' | 'INACTIVA';
    fecha_registro: string;
    plan: {
        nombre_plan: string;
    };
}

export const tenantsService = {
    getAll: async () => {
        const response = await api.get<Tenant[]>('/tenants');
        return response.data;
    },

    updateStatus: async (id: number, estado: 'ACTIVA' | 'INACTIVA') => {
        const response = await api.patch(`/tenants/${id}/status`, { estado });
        return response.data;
    },

    getMyTenant: async () => {
        const response = await api.get<Tenant>('/tenants/me');
        return response.data;
    },

    updatePlan: async (id: number, planName: string) => {
        const response = await api.patch(`/tenants/${id}/plan`, { plan: planName });
        return response.data;
    }
};
