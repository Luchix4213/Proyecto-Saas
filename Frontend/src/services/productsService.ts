import api from '../api/axios';
import type { Category } from './categoriesService';

export interface ProductImage {
    imagen_id: number;
    url: string;
    orden: number;
    es_principal: boolean;
}

export interface Product {
    producto_id: number;
    nombre: string;
    descripcion?: string;
    precio: number;
    stock_actual: number;
    stock_minimo: number;
    categoria_id: number;
    categoria?: Category;
    slug?: string;
    destacado: boolean;
    imagenes?: ProductImage[]; // Typed Image Array
    estado: 'ACTIVO' | 'INACTIVO';
    tenant?: {
        tenant_id: number;
        nombre_empresa: string;
        slug: string | null;
        logo_url: string | null;
    };
}

export interface CreateProductData {
    nombre: string;
    descripcion?: string;
    precio: number;
    stock_actual: number;
    stock_minimo: number;
    categoria_id: number;
    destacado?: boolean;
    slug?: string;
}

export interface UpdateProductData {
    nombre?: string;
    descripcion?: string;
    precio?: number;
    stock_actual?: number;
    stock_minimo?: number;
    categoria_id?: number;
    destacado?: boolean;
    slug?: string;
    estado?: 'ACTIVO' | 'INACTIVO';
}

export const productsService = {
    getAll: async () => {
        const response = await api.get<Product[]>('/productos');
        return response.data;
    },

    getById: async (id: number) => {
        const response = await api.get<Product>(`/productos/${id}`);
        return response.data;
    },

    create: async (data: CreateProductData) => {
        const response = await api.post<Product>('/productos', data);
        return response.data;
    },

    update: async (id: number, data: UpdateProductData) => {
        const response = await api.patch<Product>(`/productos/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await api.delete(`/productos/${id}`);
        return response.data;
    },

    // Public Storefront Method
    getStoreProducts: async (tenantSlug: string, categoryId?: number) => {
        const response = await api.get<Product[]>(`/productos/store/${tenantSlug}`, {
            params: categoryId ? { categoryId } : {}
        });
        return response.data;
    },

    getGlobalProducts: async (categoryId?: number) => {
        const response = await api.get<Product[]>('/productos/marketplace/all', {
            params: categoryId ? { categoryId } : {}
        });
        return response.data;
    },

    // Image Management
    uploadImages: async (id: number, files: File[]) => {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('images', file);
        });

        const response = await api.post<ProductImage[]>(`/productos/${id}/imagenes`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    deleteImage: async (imageId: number) => {
        const response = await api.delete(`/productos/imagenes/${imageId}`);
        return response.data;
    },

    setPrincipalImage: async (imageId: number) => {
        const response = await api.patch<ProductImage>(`/productos/imagenes/${imageId}/principal`);
        return response.data;
    }
};
