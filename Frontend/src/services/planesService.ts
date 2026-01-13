import api from '../api/axios';

export interface Plan {
    descripcion?: string;
    plan_id: number;
    nombre_plan: string;
    max_usuarios: number;
    max_productos: number;
    precio_mensual: number;
    precio_anual: number;
    ventas_online: boolean;
    reportes_avanzados: boolean;
    estado: 'ACTIVO' | 'INACTIVO';
}

export type CreatePlanData = Omit<Plan, 'plan_id'>;
export type UpdatePlanData = Partial<CreatePlanData>;

export const getPlans = async (): Promise<Plan[]> => {
    const response = await api.get('/planes');
    return response.data;
};

export const createPlan = async (data: CreatePlanData): Promise<Plan> => {
    const response = await api.post('/planes', data);
    return response.data;
};

export const updatePlan = async (id: number, data: UpdatePlanData): Promise<Plan> => {
    const response = await api.patch(`/planes/${id}`, data);
    return response.data;
};

export const deletePlan = async (id: number): Promise<void> => {
    await api.delete(`/planes/${id}`);
};

export const planesService = {
    getAll: getPlans,
    create: createPlan,
    update: updatePlan,
    delete: deletePlan
};
