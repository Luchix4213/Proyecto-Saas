import api from '../api/axios';

export interface Suscripcion {
  suscripcion_id: number;
  tenant_id: number;
  plan_id: number;
  fecha_inicio: string;
  fecha_fin: string;
  monto: number;
  metodo_pago: string;
  estado: string;
  referencia?: string;
  plan?: {
    nombre_plan: string;
    precio_mensual: number;
    precio_anual: number;
  };
  tenant?: {
    nombre_empresa: string;
    email: string;
  };
  creado_en?: string;
}

export const getMySubscriptions = async (): Promise<Suscripcion[]> => {
  const response = await api.get('/suscripciones/mis-suscripciones');
  return response.data;
};

export const getTenantSubscriptions = async (tenantId: number): Promise<Suscripcion[]> => {
  const response = await api.get(`/suscripciones/tenant/${tenantId}`);
  return response.data;
};

export const getAllSubscriptions = async (): Promise<Suscripcion[]> => {
  const response = await api.get('/suscripciones');
  return response.data;
};

export const loadCreateSubscription = async (data: any) => {
    const response = await api.post('/suscripciones', data);
    return response.data;
}

export const cancelSubscription = async (id: number): Promise<Suscripcion> => {
  const response = await api.post(`/suscripciones/${id}/cancelar`);
  return response.data;
};
