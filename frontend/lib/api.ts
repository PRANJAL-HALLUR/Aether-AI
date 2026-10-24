import { Conversation, ConversationSummary, HealthStatus, Rating, StreamEvent } from '@/types/chat';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClientError extends Error {
  statusCode?: number;
  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
  }
}

export async function fetchHealth(): Promise<HealthStatus> {
  const res = await fetch(`${API_BASE_URL}/api/health`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new ApiClientError(`Health check failed with status ${res.status}`, res.status);
  }
  return res.json();
}

export async function fetchConversations(): Promise<ConversationSummary[]> {
  const res = await fetch(`${API_BASE_URL}/api/conversations`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new ApiClientError(`Failed to fetch conversations (${res.status})`, res.status);
  }
  return res.json();
}

export async function fetchConversation(id: string): Promise<Conversation> {
  const res = await fetch(`${API_BASE_URL}/api/conversations/${encodeURIComponent(id)}`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new ApiClientError(`Failed to fetch conversation (${res.status})`, res.status);
  }
  return res.json();
}

export async function deleteConversation(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/conversations/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new ApiClientError(`Failed to delete conversation (${res.status})`, res.status);
  }
}

export async function updateMessageFeedback(messageId: string, rating: Rating): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/messages/${encodeURIComponent(messageId)}/feedback`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating }),
  });
  if (!res.ok) {
    throw new ApiClientError(`Failed to update message feedback (${res.status})`, res.status);
  }
}

export interface StreamChatParams {
  conversationId?: string;
  message: string;
  signal?: AbortSignal;
  onEvent: (event: StreamEvent) => void;
  onError?: (err: Error) => void;
}

export async function streamChat({
  conversationId,
  message,
  signal,
  onEvent,
  onError,
}: StreamChatParams): Promise<void> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({
        conversation_id: conversationId || null,
        message,
      }),
      signal,
    });

    if (!res.ok) {
      let errorDetail = `Server error (${res.status})`;
      try {
        const errorJson = await res.json();
        if (errorJson.message || errorJson.error) {
          errorDetail = errorJson.message || errorJson.error;
        }
      } catch {
        // Fallback to text status
      }
      throw new ApiClientError(errorDetail, res.status);
    }

    if (!res.body) {
      throw new ApiClientError('Response body is null, cannot stream SSE');
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          try {
            const rawJson = trimmed.slice(6);
            const parsedEvent: StreamEvent = JSON.parse(rawJson);
            onEvent(parsedEvent);
          } catch (parseErr) {
            console.error('Failed to parse SSE payload:', trimmed, parseErr);
          }
        }
      }
    }
  } catch (err) {
    if (signal?.aborted) {
      return;
    }
    const errorObj = err instanceof Error ? err : new Error(String(err));
    if (onError) {
      onError(errorObj);
    } else {
      throw errorObj;
    }
  }
}
