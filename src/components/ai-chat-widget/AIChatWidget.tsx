import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { ChatHeader } from './ChatHeader';
import { ChatBody, type Message } from './ChatBody';
import { ChatInput } from './ChatInput';
import { api } from '@/lib/api';

type WidgetState = 'minimized' | 'normal' | 'fullscreen';

interface AIChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIChatWidget({ isOpen, onClose }: AIChatWidgetProps) {
  const [state, setState] = useState<WidgetState>('normal');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const widgetRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setState('normal');
    }
  }, [isOpen]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Send message to AI
  const handleSend = useCallback(async (message: string) => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await api.post('/ai-chat/message', {
        message,
        conversationId,
      });

      if (response.data.success) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.data.response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
        setConversationId(response.data.conversationId);
      } else {
        throw new Error(response.data.error || 'Failed to get response');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${errorMessage}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  // Close widget
  const handleClose = useCallback(() => {
    setState('minimized');
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  // Determine position classes — no transition on position to avoid the glitch
  const isFullscreen = state === 'fullscreen';

  return (
    <div
      ref={widgetRef}
      className={cn(
        'fixed z-50 flex flex-col',
        'bg-white dark:bg-gray-800',
        'shadow-2xl shadow-black/20',
        'animate-in fade-in slide-in-from-bottom-4 duration-200',
        isFullscreen
          ? 'inset-0 m-auto w-[90vw] max-w-[800px] h-[85vh] max-h-[800px] rounded-2xl'
          : 'bottom-6 right-6 w-[90vw] max-w-[400px] h-[550px] max-h-[85vh] rounded-xl'
      )}
    >
      <ChatHeader
        isFullscreen={isFullscreen}
        onMinimize={handleClose}
        onToggleFullscreen={() =>
          setState((prev) => (prev === 'fullscreen' ? 'normal' : 'fullscreen'))
        }
        onClose={handleClose}
        onMouseDown={() => {}} // Drag removed since trigger is in header
        isDragging={false}
      />
      <ChatBody
        messages={messages}
        isLoading={isLoading}
        messagesEndRef={messagesEndRef as React.RefObject<HTMLDivElement>}
      />
      <ChatInput onSend={handleSend} isLoading={isLoading} />
    </div>
  );
}
