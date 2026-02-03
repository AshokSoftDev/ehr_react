import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatHeader } from './ChatHeader';
import { ChatBody, type Message } from './ChatBody';
import { ChatInput } from './ChatInput';
import { api } from '@/lib/api';

type WidgetState = 'minimized' | 'normal' | 'fullscreen';

interface Position {
  x: number;
  y: number;
}

export function AIChatWidget() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [state, setState] = useState<WidgetState>('minimized');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  
  const widgetRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check auth status
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      const wasAuthenticated = isAuthenticated;
      const nowAuthenticated = !!token;
      
      setIsAuthenticated(nowAuthenticated);
      
      // Auto-minimize when user logs out
      if (wasAuthenticated && !nowAuthenticated) {
        setState('minimized');
      }
    };

    checkAuth();
    
    // Listen for storage changes
    window.addEventListener('storage', checkAuth);
    
    // Also check periodically (for same-tab changes)
    const interval = setInterval(checkAuth, 500);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Initialize position on mount
  useEffect(() => {
    const savedPosition = localStorage.getItem('ai-chat-position');
    if (savedPosition) {
      try {
        setPosition(JSON.parse(savedPosition));
      } catch {
        // Use default position
      }
    }
  }, []);

  // Save position on change
  useEffect(() => {
    if (position.x !== 0 || position.y !== 0) {
      localStorage.setItem('ai-chat-position', JSON.stringify(position));
    }
  }, [position]);

  // Handle drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (state === 'fullscreen') return;
    
    setIsDragging(true);
    const rect = widgetRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  }, [state]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || state === 'fullscreen') return;
      
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Keep widget within viewport
      const maxX = window.innerWidth - 400;
      const maxY = window.innerHeight - 500;
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, state]);

  // Send message to AI
  const handleSend = async (message: string) => {
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
  };

  // Close widget (minimize)
  const handleClose = () => {
    setState('minimized');
  };

  // Don't show if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Minimized bubble
  if (state === 'minimized') {
    return (
      <button
        onClick={() => setState('normal')}
        className={cn(
          'fixed z-50 group',
          'w-14 h-14 rounded-full',
          'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500',
          'shadow-lg hover:shadow-xl hover:shadow-purple-500/30',
          'flex items-center justify-center',
          'transition-all duration-300 hover:scale-110',
          'animate-in fade-in zoom-in duration-300'
        )}
        style={{
          bottom: '24px',
          right: '24px',
        }}
      >
        <Sparkles className="w-6 h-6 text-white" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
      </button>
    );
  }

  // Normal or fullscreen widget
  return (
    <div
      ref={widgetRef}
      className={cn(
        'fixed z-50 flex flex-col',
        'bg-white dark:bg-gray-800',
        'shadow-2xl shadow-black/20',
        'transition-all duration-300 ease-out',
        state === 'fullscreen'
          ? 'w-[90vw] max-w-[800px] h-[85vh] max-h-[800px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl'
          : 'w-[90vw] max-w-[400px] h-[550px] max-h-[85vh] rounded-xl',
        isDragging && 'cursor-grabbing select-none'
      )}
      style={
        state === 'normal' && !isDragging
          ? {
              bottom: 24,
              right: 24,
            }
          : state === 'normal' && isDragging
          ? {
              left: Math.min(position.x, window.innerWidth - 320),
              top: Math.min(position.y, window.innerHeight - 400),
              right: 'auto',
              bottom: 'auto',
            }
          : undefined
      }
    >
      <ChatHeader
        isFullscreen={state === 'fullscreen'}
        onMinimize={() => setState('minimized')}
        onToggleFullscreen={() =>
          setState((prev) => (prev === 'fullscreen' ? 'normal' : 'fullscreen'))
        }
        onClose={handleClose}
        onMouseDown={handleMouseDown}
        isDragging={isDragging}
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
