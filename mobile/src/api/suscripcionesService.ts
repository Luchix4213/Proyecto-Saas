// mobile/src/api/suscripcionesService.ts
import client from './client';

export interface Suscripcion {
  suscripcion_id: number;
  tenant_id: number;
  plan_id: number;
  fecha_inicio: string;
  fecha_fin?: string;
  monto: number;
  metodo_pago: 'EFECTIVO' | 'QR' | 'TRANSFERENCIA';
  estado: 'PENDIENTE' | 'ACTIVA' | 'VENCIDA' | 'CANCELADA';
  referencia?: string;
  comprobante_url?: string;
  creado_en?: string;
  plan?: {
    plan_id: number;
    nombre_plan: string;
    descripcion?: string;
    max_usuarios: number;
    max_productos: number;
    ventas_online: boolean;
    reportes_avanzados: boolean;
    precio_mensual: number;
    precio_anual: number;
    estado: 'ACTIVO' | 'INACTIVO';
  };
  tenant?: {
    tenant_id: number;
    nombre_empresa: string;
    email: string;
  };
}

export const suscripcionesService = {
  getMySubscriptions: async (): Promise<Suscripcion[]> => {
    const response = await client.get('/suscripciones/mis-suscripciones');
    return response.data;
  },

  createSubscription: async (data: FormData) => {
    const response = await client.post('/suscripciones', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  requestUpgrade: async (planId: number, tenantId: number) => {
    const formData = new FormData();
    formData.append('plan_id', planId.toString());
    formData.append('tenant_id', tenantId.toString());
    formData.append('metodo_pago', 'TRANSFERENCIA'); // Default
    formData.append('ciclo', 'MENSUAL'); // Default

    return suscripcionesService.createSubscription(formData);
  }
};
