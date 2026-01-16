import api from '../api/axios';
import type { Category } from './categoriesService';

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
    imagenes?: any[]; // Todo: Define image interface
    estado: 'ACTIVO' | 'INACTIVO';
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
    }
};
