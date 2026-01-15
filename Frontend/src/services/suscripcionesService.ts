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
  comprobante_url?: string;
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

export const loadCreateSubscription = async (data: {
  tenant_id: number;
  plan_id: number;
  ciclo: 'MENSUAL' | 'ANUAL';
  metodo_pago: 'EFECTIVO' | 'QR' | 'TRANSFERENCIA';
  comprobante?: File;
  referencia?: string;
  fecha_inicio?: string;
}) => {
  const formData = new FormData();
  formData.append('tenant_id', data.tenant_id.toString());
  formData.append('plan_id', data.plan_id.toString());
  formData.append('ciclo', data.ciclo);
  formData.append('metodo_pago', data.metodo_pago);
  if (data.fecha_inicio) formData.append('fecha_inicio', data.fecha_inicio);
  if (data.referencia) formData.append('referencia', data.referencia);
  if (data.comprobante) formData.append('comprobante', data.comprobante);

  const response = await api.post('/suscripciones', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

export const cancelSubscription = async (id: number): Promise<Suscripcion> => {
  const response = await api.post(`/suscripciones/${id}/cancelar`);
  return response.data;
};

export const approveSubscription = async (id: number): Promise<Suscripcion> => {
  const response = await api.post(`/suscripciones/${id}/aprobar`);
  return response.data;
};

export const rejectSubscription = async (id: number): Promise<Suscripcion> => {
  const response = await api.post(`/suscripciones/${id}/rechazar`);
  return response.data;
};
