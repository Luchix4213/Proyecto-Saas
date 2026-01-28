import client from './client';

export interface PublicTenant {
    tenant_id: number;
    nombre_empresa: string;
    slug: string;
    logo_url: string | null;
    banner_url: string | null;
    rubro?: string;
}

export interface PublicCategory {
    categoria_id: number;
    nombre: string;
}

export interface PublicProduct {
    producto_id: number;
    nombre: string;
    categoria_id?: number;
    descripcion: string | null;
    precio: number;
    stock_actual: number;
    imagen_url: string | null;
    categoria?: {
        nombre: string;
    };
}

export const consumerService = {
    // Get list of tenants/stores for the marketplace
    getFeaturedTenants: async (rubro?: string, search?: string): Promise<PublicTenant[]> => {
        const response = await client.get('/tenants/marketplace', { params: { rubro, search } });
        return response.data;
    },

    // Get specific tenant info by slug
    getTenantBySlug: async (slug: string): Promise<PublicTenant> => {
        const response = await client.get(`/tenants/slug/${slug}`);
        return response.data;
    },

    // Get public products for a specific store
    getStoreProducts: async (slug: string, categoryId?: number, search?: string): Promise<PublicProduct[]> => {
        const response = await client.get(`/productos/store/${slug}`, {
            params: { categoryId, search }
        });
        return response.data;
    },

    // Get categories for a specific store
    getStoreCategories: async (slug: string): Promise<PublicCategory[]> => {
        const response = await client.get(`/categories/public/${slug}`);
        return response.data;
    },

    // Check client existence by NIT
    checkClient: async (slug: string, nit: string) => {
        const response = await client.post(`/ventas/public/${slug}/check-client`, { nit });
        return response.data;
    },

    // Submit a public order/checkout
    checkout: async (slug: string, data: any) => {
        // If data contains a file (comprobante), we need FormData
        const isFormData = data instanceof FormData;

        const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};

        const response = await client.post(`/ventas/public/${slug}/checkout`, data, config);
        return response.data;
    },

    // Get all rubros/categories
    getRubros: async (): Promise<any[]> => {
        const response = await client.get('/rubros');
        return response.data;
    }
};
