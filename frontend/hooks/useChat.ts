'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  deleteConversation,
  fetchConversation,
  fetchConversations,
  streamChat,
  updateMessageFeedback,
} from '@/lib/api';
import { ConversationSummary, Message, Rating, StreamEvent } from '@/types/chat';

export interface UseChatOptions {
  onTokenChunk?: (token: string) => void;
  onStreamComplete?: (message: Message) => void;
}

export function useChat(options: UseChatOptions = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Load conversation list
  const refreshConversations = useCallback(async () => {
    try {
      const list = await fetchConversations();
      setConversations(list);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  }, []);

  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  // Select and load a conversation's history
  const selectConversation = useCallback(async (conversationId: string) => {
    // Abort any ongoing stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setIsThinking(false);
    setError(null);
    setIsLoadingHistory(true);
    setCurrentConversationId(conversationId);

    try {
      const convo = await fetchConversation(conversationId);
      setMessages(convo.messages || []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load conversation history';
      setError(msg);
      setMessages([]);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  // Reset to brand new conversation state
  const startNewConversation = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setIsThinking(false);
    setError(null);
    setCurrentConversationId(null);
    setMessages([]);
  }, []);

  // Stop active generation
  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setIsThinking(false);
    setMessages((prev) =>
      prev.map((m) => (m.isStreaming ? { ...m, isStreaming: false } : m))
    );
  }, []);

  // Send a message and stream reply
  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || isStreaming) return;

      setError(null);
      setIsStreaming(true);
      setIsThinking(true);

      const tempUserMsgId = `temp-user-${Date.now()}`;
      const tempAssistantMsgId = `temp-assistant-${Date.now()}`;

      const userMessage: Message = {
        id: tempUserMsgId,
        conversation_id: currentConversationId || '',
        role: 'user',
        content: trimmed,
        created_at: new Date().toISOString(),
      };

      const initialAssistantMessage: Message = {
        id: tempAssistantMsgId,
        conversation_id: currentConversationId || '',
        role: 'assistant',
        content: '',
        created_at: new Date().toISOString(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMessage, initialAssistantMessage]);

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      let resolvedConvoId = currentConversationId;
      let finalAssistantId = tempAssistantMsgId;
      let accumulatedContent = '';

      try {
        await streamChat({
          conversationId: currentConversationId || undefined,
          message: trimmed,
          signal: abortController.signal,
          onEvent: (event: StreamEvent) => {
            if (event.type === 'start') {
              setIsThinking(false);
              resolvedConvoId = event.conversation_id;
              finalAssistantId = event.assistant_message_id;

              if (!currentConversationId) {
                setCurrentConversationId(event.conversation_id);
              }

              setMessages((prev) =>
                prev.map((m) => {
                  if (m.id === tempUserMsgId) {
                    return {
                      ...m,
                      id: event.user_message_id,
                      conversation_id: event.conversation_id,
                    };
                  }
                  if (m.id === tempAssistantMsgId) {
                    return {
                      ...m,
                      id: event.assistant_message_id,
                      conversation_id: event.conversation_id,
                    };
                  }
                  return m;
                })
              );

              if (event.is_new) {
                refreshConversations();
              }
            } else if (event.type === 'chunk') {
              setIsThinking(false);
              accumulatedContent += event.content;
              options.onTokenChunk?.(event.content);

              setMessages((prev) =>
                prev.map((m) =>
                  m.id === finalAssistantId || m.id === tempAssistantMsgId
                    ? { ...m, content: accumulatedContent, isStreaming: true }
                    : m
                )
              );
            } else if (event.type === 'end') {
              setIsStreaming(false);
              setIsThinking(false);

              const completedMessage: Message = {
                id: event.message_id,
                conversation_id: event.conversation_id,
                role: 'assistant',
                content: event.full_content,
                created_at: new Date().toISOString(),
                isStreaming: false,
              };

              setMessages((prev) =>
                prev.map((m) =>
                  m.id === finalAssistantId || m.id === tempAssistantMsgId
                    ? completedMessage
                    : m
                )
              );

              options.onStreamComplete?.(completedMessage);
              refreshConversations();
            } else if (event.type === 'error') {
              throw new Error(event.error);
            }
          },
          onError: (err: Error) => {
            setIsStreaming(false);
            setIsThinking(false);
            setError(err.message || 'Stream connection interrupted');
            setMessages((prev) =>
              prev.map((m) => (m.isStreaming ? { ...m, isStreaming: false } : m))
            );
          },
        });
      } catch (err) {
        if (!abortController.signal.aborted) {
          const errorMsg =
            err instanceof Error ? err.message : 'Failed to communicate with AI server';
          setError(errorMsg);
          setIsStreaming(false);
          setIsThinking(false);
          setMessages((prev) =>
            prev.map((m) => (m.isStreaming ? { ...m, isStreaming: false } : m))
          );
        }
      } finally {
        abortControllerRef.current = null;
      }
    },
    [currentConversationId, isStreaming, options, refreshConversations]
  );

  // Regenerate last assistant response
  const regenerateLastMessage = useCallback(async () => {
    if (isStreaming || messages.length === 0) return;

    let lastUserMessage = '';
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        lastUserMessage = messages[i].content;
        break;
      }
    }

    if (!lastUserMessage) return;

    // Remove trailing assistant message if present
    setMessages((prev) => {
      if (prev.length > 0 && prev[prev.length - 1].role === 'assistant') {
        return prev.slice(0, -1);
      }
      return prev;
    });

    await sendMessage(lastUserMessage);
  }, [isStreaming, messages, sendMessage]);

  // Thumbs up / down feedback
  const setRating = useCallback(async (messageId: string, rating: Rating) => {
    try {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, rating } : m))
      );
      await updateMessageFeedback(messageId, rating);
    } catch (err) {
      console.error('Failed to save message rating:', err);
    }
  }, []);

  // Delete conversation
  const deleteConversationById = useCallback(
    async (id: string) => {
      try {
        await deleteConversation(id);
        if (currentConversationId === id) {
          startNewConversation();
        }
        await refreshConversations();
      } catch (err) {
        console.error('Failed to delete conversation:', err);
      }
    },
    [currentConversationId, refreshConversations, startNewConversation]
  );

  return {
    messages,
    conversations,
    currentConversationId,
    isStreaming,
    isThinking,
    isLoadingHistory,
    error,
    sendMessage,
    stopStreaming,
    regenerateLastMessage,
    setRating,
    selectConversation,
    startNewConversation,
    deleteConversationById,
    refreshConversations,
  };
}
