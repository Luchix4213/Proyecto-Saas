
import api from "../api/axios";

export interface Notificacion {
    notificacion_id: number;
    usuario_id: number;
    tipo: string;
    mensaje: string;
    fecha_envio: string;
    leida: boolean;
}

export const notificationsService = {
    getAll: async () => {
        const response = await api.get<Notificacion[]>("/notificaciones");
        return response.data;
    },

    markAsRead: async (id: number) => {
        const response = await api.patch(`/notificaciones/${id}/leer`);
        return response.data;
    },

    markAllAsRead: async () => {
        const response = await api.patch("/notificaciones/leer-todas");
        return response.data;
    },

    delete: async (id: number) => {
        const response = await api.delete(`/notificaciones/${id}`);
        return response.data;
    },

    deleteAllRead: async () => {
        const response = await api.delete("/notificaciones/limpiar-leidas");
        return response.data;
    }
};
