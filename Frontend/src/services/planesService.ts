import api from '../api/axios';

export interface Plan {
    plan_id: number;
    nombre_plan: string;
    max_usuarios: number;
    max_productos: number;
    precio: number;
    ventas_online: boolean;
    reportes_avanzados: boolean;
    estado: 'ACTIVO' | 'INACTIVO';
}

export type CreatePlanData = Omit<Plan, 'plan_id'>;
export type UpdatePlanData = Partial<CreatePlanData>;

export const planesService = {
    getAll: async (): Promise<Plan[]> => {
        const response = await api.get('/planes');
        return response.data;
    },

    create: async (data: CreatePlanData): Promise<Plan> => {
        const response = await api.post('/planes', data);
        return response.data;
    },

    update: async (id: number, data: UpdatePlanData): Promise<Plan> => {
        const response = await api.patch(`/planes/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/planes/${id}`);
    }
};
