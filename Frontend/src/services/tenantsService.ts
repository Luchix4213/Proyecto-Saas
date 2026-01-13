import api from '../api/axios';

export interface Tenant {
    tenant_id: number;
    nombre_empresa: string;
    email: string;
    telefono: string | null;
    direccion: string | null;
    moneda: string;
    impuesto_porcentaje: string;
    logo_url: string | null;
    horario_atencion: string | null;
    estado: 'ACTIVA' | 'PENDIENTE' | 'INACTIVA';
    fecha_registro: string;
    plan?: {
        nombre_plan: string;
        precio_mensual: string | number;
        precio_anual: string | number;
    };
    usuarios?: any[];
}

export interface CreateTenantData {
    nombre_empresa: string;
    email: string;
    email_empresa?: string;
    telefono?: string;
    direccion?: string;
    moneda?: string;
    impuesto_porcentaje?: number;
    horario_atencion?: string;
    plan?: string;
    nombre_contacto: string;
    paterno_contacto: string;
    password_contacto: string;
}

export interface UpdateTenantData {
    nombre_empresa?: string;
    telefono?: string;
    direccion?: string;
    moneda?: string;
    horario_atencion?: string;
    impuesto_porcentaje?: number;
    logo?: File;
}

export const tenantsService = {
    create: async (data: any, logoFile?: File) => {
        // Prepare payload strictly matching CreateTenantDto
        const createPayload: CreateTenantData = {
            nombre_empresa: data.nombre_empresa,
            email: data.email,
            email_empresa: data.email_empresa,
            telefono: data.telefono,
            direccion: data.direccion,
            moneda: data.moneda,
            impuesto_porcentaje: data.impuesto_porcentaje,
            horario_atencion: data.horario_atencion,
            // plan defaults to FREE in backend if omitted
            nombre_contacto: data.nombre_contacto,
            paterno_contacto: data.paterno_contacto,
            password_contacto: data.password_contacto
        };

        const response = await api.post('/tenants', createPayload);
        const responseData = response.data;

        // Backend returns { tenant: ..., admin: ... }
        const tenantId = responseData.tenant?.tenant_id;

        if (logoFile && tenantId) {
            await tenantsService.update(tenantId, { logo: logoFile });
        }

        return responseData;
    },

    update: async (id: number, data: UpdateTenantData) => {
        const formData = new FormData();
        if (data.nombre_empresa) formData.append('nombre_empresa', data.nombre_empresa);
        if (data.telefono) formData.append('telefono', data.telefono);
        if (data.direccion) formData.append('direccion', data.direccion);
        if (data.moneda) formData.append('moneda', data.moneda);
        if (data.horario_atencion) formData.append('horario_atencion', data.horario_atencion);
        if (data.impuesto_porcentaje !== undefined) formData.append('impuesto_porcentaje', data.impuesto_porcentaje.toString());
        if (data.logo) formData.append('logo', data.logo);

        const response = await api.patch(`/tenants/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    getAll: async () => {
        const response = await api.get<Tenant[]>('/tenants');
        return response.data;
    },

    getById: async (id: number) => {
        const response = await api.get<Tenant>(`/tenants/${id}`);
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
