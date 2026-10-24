export type Role = 'user' | 'assistant' | 'system';

export type Rating = 'up' | 'down' | null;

export interface Message {
  id: string;
  conversation_id: string;
  role: Role;
  content: string;
  rating?: Rating;
  created_at: string;
  isStreaming?: boolean;
}

export interface ConversationSummary {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages: Message[];
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  provider: string;
  database: string;
  version: string;
}

export type StreamEvent =
  | {
      type: 'start';
      conversation_id: string;
      title: string;
      user_message_id: string;
      assistant_message_id: string;
      is_new: boolean;
    }
  | {
      type: 'chunk';
      content: string;
    }
  | {
      type: 'end';
      conversation_id: string;
      message_id: string;
      full_content: string;
    }
  | {
      type: 'error';
      error: string;
    };
