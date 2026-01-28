import client from './client';

export interface AuditLog {
    audit_id: number;
    action: string;
    entity: string;
    entity_id: string;
    user_id: number;
    tenant_id: number;
    details: string; // JSON string
    created_at: string;
    user?: {
        nombre: string;
        email: string;
    };
}

export const auditService = {
  getMyTenantLogs: async () => {
    const response = await client.get<AuditLog[]>('/audit/my-tenant');
    return response.data;
  },

  getAllLogs: async () => {
    const response = await client.get<AuditLog[]>('/audit/all');
    return response.data;
  },
};
