import api from '../api/axios';

export interface Cliente {
    cliente_id: number;
    tenant_id: number;
    nombre: string;
    paterno?: string;
    materno?: string;
    email?: string;
    telefono?: string;
    nit_ci?: string;
    estado: 'ACTIVO' | 'INACTIVO';
    fecha_registro: string;
}

export interface CreateClienteData {
    nombre: string;
    paterno?: string;
    materno?: string;
    email?: string;
    telefono?: string;
    nit_ci?: string;
}

export interface UpdateClienteData extends Partial<CreateClienteData> {
    estado?: 'ACTIVO' | 'INACTIVO';
}

export const clientsService = {
    getAll: async (): Promise<Cliente[]> => {
        const response = await api.get('/clientes');
        return response.data;
    },

    create: async (data: CreateClienteData): Promise<Cliente> => {
        const response = await api.post('/clientes', data);
        return response.data;
    },

    update: async (id: number, data: UpdateClienteData): Promise<Cliente> => {
        const response = await api.patch(`/clientes/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/clientes/${id}`);
    }
};
