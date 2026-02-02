// AI Chat Types

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

export interface ChatRequest {
  message: string;
  conversationId?: string;
}

export interface ChatResponse {
  success: boolean;
  response: string;
  conversationId: string;
  timestamp: string;
}

export interface ConversationSession {
  id: string;
  title: string;
  createdAt: Date;
  lastMessage?: string;
}
