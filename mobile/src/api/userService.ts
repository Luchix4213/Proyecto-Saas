import client from './client';

export interface Usuario {
    usuario_id: number;
    nombre: string;
    paterno?: string;
    materno?: string;
    email: string;
    rol: 'ADMIN' | 'PROPIETARIO' | 'VENDEDOR';
    estado: 'ACTIVO' | 'INACTIVO';
}

export interface CreateUserDto {
    nombre: string;
    paterno?: string;
    materno?: string;
    email: string;
    password?: string;
    rol: 'ADMIN' | 'PROPIETARIO' | 'VENDEDOR';
}

export interface UpdateUserDto extends Partial<CreateUserDto> {
    estado?: 'ACTIVO' | 'INACTIVO';
}

export interface ChangePasswordDto {
    currentPassword?: string;
    newPassword: string;
}

export const userService = {
    getAll: async () => {
        const response = await client.get<Usuario[]>('/usuarios');
        return response.data;
    },

    create: async (data: CreateUserDto) => {
        const response = await client.post<Usuario>('/usuarios', data);
        return response.data;
    },

    update: async (id: number, data: UpdateUserDto) => {
        const response = await client.patch<Usuario>(`/usuarios/${id}`, data);
        return response.data;
    },

    changePassword: async (id: number, data: ChangePasswordDto) => {
        const response = await client.post(`/usuarios/password/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await client.delete(`/usuarios/${id}`);
        return response.data;
    },
};
