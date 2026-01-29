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
    rubros?: any[]; // Updated from rubro: string
    slug?: string;
    banner_url?: string;
    estado: 'ACTIVA' | 'PENDIENTE' | 'INACTIVA';
    fecha_registro: string;
    plan?: {
        nombre_plan: string;
        precio_mensual: string | number;
        precio_anual: string | number;
        ventas_online: boolean;
        reportes_avanzados: boolean;
    };
    usuarios?: any[];
    facebook_url?: string;
    instagram_url?: string;
    youtube_url?: string;
    tiktok_url?: string;
    google_maps_url?: string;
    latitud?: number;
    longitud?: number;
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
    rubros?: number[]; // IDs
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
    rubros?: number[];
    impuesto_porcentaje?: number;
    email?: string;
    logo?: File;
    banner?: File;
    facebook_url?: string;
    instagram_url?: string;
    youtube_url?: string;
    tiktok_url?: string;
    google_maps_url?: string;
    latitud?: number;
    longitud?: number;
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
            rubros: data.rubros,
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
        if (data.rubros) formData.append('rubros', JSON.stringify(data.rubros)); // Send as JSON string if file upload involved, or handle in backend as stringified array
        if (data.impuesto_porcentaje !== undefined) formData.append('impuesto_porcentaje', data.impuesto_porcentaje.toString());
        if (data.email) formData.append('email', data.email);
        if (data.logo) formData.append('logo', data.logo);
        if (data.banner) formData.append('banner', data.banner);
        if (data.facebook_url) formData.append('facebook_url', data.facebook_url);
        if (data.instagram_url) formData.append('instagram_url', data.instagram_url);
        if (data.youtube_url) formData.append('youtube_url', data.youtube_url);
        if (data.tiktok_url) formData.append('tiktok_url', data.tiktok_url);
        if (data.google_maps_url) formData.append('google_maps_url', data.google_maps_url);
        if (data.latitud) formData.append('latitud', data.latitud.toString());
        if (data.longitud) formData.append('longitud', data.longitud.toString());

        const response = await api.patch(`/tenants/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    getAll: async (rubro?: string) => {
        const response = await api.get<Tenant[]>('/tenants', {
            params: rubro ? { rubro } : {}
        });
        return response.data;
    },

    getMarketplace: async (rubro?: string) => {
        const response = await api.get<Tenant[]>('/tenants/marketplace', {
            params: rubro ? { rubro } : {}
        });
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
    },

    getBySlug: async (slug: string) => {
        const response = await api.get<Tenant>(`/tenants/slug/${slug}`);
        return response.data;
    }
};
