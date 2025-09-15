import { api } from '../../../lib/api';
import type { QueryParams } from '../hooks/useGroups';

export const groupService = {
  async getGroups(params: Record<string, unknown> | QueryParams) {
    const response = await api.get('/groups', { params });
    return response.data;
  },

  async getGroup(id: string) {
    const response = await api.get(`/groups/${id}`);
    return response.data;
  },

  async createGroup(data: Record<string, unknown>) {
    const response = await api.post('/groups', data);
    return response.data;
  },

  async updateGroup(id: string, data: Record<string, unknown>) {
    const response = await api.put(`/groups/${id}`, data);
    return response.data;
  },

  async deleteGroup(id: string) {
    await api.delete(`/groups/${id}`);
  },

  async getModules() {
    const response = await api.get('/groups/modules');
    return response.data;
  },
};
