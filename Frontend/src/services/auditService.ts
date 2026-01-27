import api from '../api/axios';

export const auditService = {
  getMyTenantLogs: async () => {
    const { data } = await api.get('/audit/my-tenant');
    return data;
  },
  getAllLogs: async () => {
    const { data } = await api.get('/audit/all');
    return data;
  },
};
