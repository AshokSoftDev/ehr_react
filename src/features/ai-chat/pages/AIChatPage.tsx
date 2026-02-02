import { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, Menu, RefreshCw, Settings, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'react-toastify';
import { useMutation } from '@tanstack/react-query';

import { ChatMessageBubble } from '../components/ChatMessageBubble';
import { ChatInput } from '../components/ChatInput';
import { ChatWelcomeScreen } from '../components/ChatWelcomeScreen';
import { ChatSidebar } from '../components/ChatSidebar';
import { chatService } from '../services/chat.service';
import type { ChatMessage, ConversationSession } from '../types/chat.types';

export function AIChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [conversations, setConversations] = useState<ConversationSession[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: chatService.sendMessage,
    onSuccess: (response) => {
      // Update conversation ID if new
      if (!conversationId && response.conversationId) {
        setConversationId(response.conversationId);
        // Add to conversations list
        setConversations((prev) => [
          {
            id: response.conversationId,
            title: messages.length > 0 ? messages[0].content.slice(0, 30) + '...' : 'New Chat',
            createdAt: new Date(),
          },
          ...prev,
        ]);
      }

      // Replace loading message with actual response
      setMessages((prev) => {
        const updated = [...prev];
        const loadingIndex = updated.findIndex((m) => m.isLoading);
        if (loadingIndex !== -1) {
          updated[loadingIndex] = {
            id: `ai_${Date.now()}`,
            role: 'assistant',
            content: response.response,
            timestamp: new Date(response.timestamp),
          };
        }
        return updated;
      });
    },
    onError: (error) => {
      console.error('Chat error:', error);
      // Remove loading message and show error
      setMessages((prev) => prev.filter((m) => !m.isLoading));
      toast.error('Failed to get response. Please try again.');
    },
  });

  const handleSendMessage = (content: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    // Add loading message for AI
    const loadingMessage: ChatMessage = {
      id: `loading_${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages((prev) => [...prev, userMessage, loadingMessage]);

    // Send to API
    sendMessageMutation.mutate({
      message: content,
      conversationId,
    });
  };

  const handleNewConversation = () => {
    setMessages([]);
    setConversationId(undefined);
    setSidebarOpen(false);
  };

  const handleSelectConversation = (id: string) => {
    // In a real app, you'd fetch the conversation history
    setConversationId(id);
    setSidebarOpen(false);
    // For now, just show a placeholder
    toast.info('Loading conversation history...');
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await chatService.clearConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (conversationId === id) {
        handleNewConversation();
      }
      toast.success('Conversation deleted');
    } catch {
      toast.error('Failed to delete conversation');
    }
  };

  const handleSuggestedQuery = (query: string) => {
    handleSendMessage(query);
  };

  const handleClearChat = () => {
    setMessages([]);
    toast.success('Chat cleared');
  };

  const isLoading = sendMessageMutation.isPending;
  const hasMessages = messages.length > 0;

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:relative inset-y-0 left-0 z-50 w-72 transform transition-transform duration-200 ease-in-out lg:transform-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${hasMessages ? '' : 'lg:hidden'}`}
      >
        <div className="absolute top-2 right-2 lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <ChatSidebar
          conversations={conversations}
          currentConversationId={conversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onDeleteConversation={handleDeleteConversation}
        />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-card/50 backdrop-blur">
          <div className="flex items-center gap-3">
            {hasMessages && (
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-sm font-semibold">AI Assistant</h1>
                <p className="text-[10px] text-muted-foreground">
                  {isLoading ? 'Thinking...' : 'Online'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasMessages && (
              <Button variant="ghost" size="icon" onClick={handleClearChat} title="Clear chat">
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" title="Settings">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages area */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 px-4 py-6">
          {!hasMessages ? (
            <ChatWelcomeScreen onSuggestedQuery={handleSuggestedQuery} />
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((message) => (
                <ChatMessageBubble key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input area */}
        <div className="p-4 bg-gradient-to-t from-background via-background to-transparent">
          <div className="max-w-3xl mx-auto">
            <ChatInput
              onSend={handleSendMessage}
              isLoading={isLoading}
              placeholder={
                isLoading
                  ? 'AI is thinking...'
                  : 'Ask me about patients, appointments, prescriptions...'
              }
            />
            <p className="text-center text-[10px] text-muted-foreground/60 mt-2">
              AI responses are generated and may not always be accurate. Always verify critical information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIChatPage;
