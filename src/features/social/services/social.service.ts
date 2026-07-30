import { api } from '@/lib/api';
import type { SocialItem, CreateSocialPayload, UpdateSocialPayload } from '../types/social.types';

export const socialService = {
  async list(search?: string): Promise<SocialItem[]> {
    const params = search ? { search } : {};
    const { data } = await api.get('/master/social', { params });
    return data.data || [];
  },

  async get(id: number): Promise<SocialItem> {
    const { data } = await api.get(`/master/social/${id}`);
    return data.data;
  },

  async create(payload: CreateSocialPayload): Promise<SocialItem> {
    const { data } = await api.post('/master/social', payload);
    return data.data;
  },

  async update(id: number, payload: UpdateSocialPayload): Promise<SocialItem> {
    const { data } = await api.put(`/master/social/${id}`, payload);
    return data.data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/master/social/${id}`);
  },
};
