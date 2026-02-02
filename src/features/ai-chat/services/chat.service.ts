import axios from 'axios';
import type { ChatRequest, ChatResponse } from '../types/chat.types';

// AI Chat API base URL (separate from main API)
const AI_API_BASE_URL = import.meta.env.VITE_AI_API_BASE_URL || 'http://localhost:3001/api/v1';

const getAuthToken = (): string | null => {
  const token = localStorage.getItem('token');
  return token;
};

const aiApiClient = axios.create({
  baseURL: AI_API_BASE_URL,
  timeout: 60000, // 60s timeout for AI responses
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
aiApiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const chatService = {
  /**
   * Send a message to the AI chatbot
   */
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    const response = await aiApiClient.post<ChatResponse>('/chat', request);
    return response.data;
  },

  /**
   * Clear conversation history
   */
  async clearConversation(conversationId: string): Promise<{ success: boolean; message: string }> {
    const response = await aiApiClient.delete<{ success: boolean; message: string }>(
      `/chat/${conversationId}`
    );
    return response.data;
  },

  /**
   * Check AI service health
   */
  async checkHealth(): Promise<{ status: string; services: Record<string, string> }> {
    const response = await aiApiClient.get('/chat/health');
    return response.data;
  },
};
