'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown, AlertCircle, RefreshCw } from 'lucide-react';
import { Message, Rating } from '@/types/chat';
import { ChatMessage } from './ChatMessage';
import { ThinkingIndicator } from './ThinkingIndicator';
import { WelcomeScreen } from './WelcomeScreen';

interface ChatAreaProps {
  messages: Message[];
  isStreaming: boolean;
  isThinking: boolean;
  isLoadingHistory: boolean;
  error: string | null;
  onSelectPrompt: (prompt: string) => void;
  onRegenerate: () => void;
  onRating: (messageId: string, rating: Rating) => void;
  onRetry: () => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  isStreaming,
  isThinking,
  isLoadingHistory,
  error,
  onSelectPrompt,
  onRegenerate,
  onRating,
  onRetry,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomMarkerRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const isAutoScrollEnabled = useRef(true);

  // Monitor scroll position to show/hide "jump to latest" button
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const isNearBottom = distanceFromBottom < 80;

    isAutoScrollEnabled.current = isNearBottom;
    setShowScrollBottom(!isNearBottom);
  };

  // Scroll to bottom on new messages / streaming chunks
  useEffect(() => {
    if (isAutoScrollEnabled.current && bottomMarkerRef.current) {
      bottomMarkerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isThinking]);

  const scrollToBottom = () => {
    isAutoScrollEnabled.current = true;
    bottomMarkerRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative flex-1 flex flex-col h-full overflow-hidden">
      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col"
        role="region"
        aria-label="Chat messages list"
      >
        {isLoadingHistory ? (
          // Skeleton Loaders
          <div className="p-6 space-y-6 max-w-3xl mx-auto w-full animate-pulse">
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-xl bg-slate-300 dark:bg-slate-800" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-slate-300 dark:bg-slate-800 rounded w-1/4" />
                <div className="h-12 bg-slate-300 dark:bg-slate-800 rounded-xl w-3/4" />
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-xl bg-slate-300 dark:bg-slate-800" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-slate-300 dark:bg-slate-800 rounded w-1/3" />
                <div className="h-24 bg-slate-300 dark:bg-slate-800 rounded-xl w-full" />
              </div>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <WelcomeScreen onSelectPrompt={onSelectPrompt} />
        ) : (
          <div className="flex-1 pb-4">
            {messages.map((message, index) => {
              const isLast = index === messages.length - 1;
              return (
                <ChatMessage
                  key={message.id || index}
                  message={message}
                  isStreaming={isStreaming && isLast && message.role === 'assistant'}
                  onRegenerate={isLast && message.role === 'assistant' ? onRegenerate : undefined}
                  onRating={(rating) => onRating(message.id, rating)}
                />
              );
            })}

            {/* Thinking indicator when user sent message and waiting for first token */}
            {isThinking && (
              <div className="px-6 py-2">
                <ThinkingIndicator />
              </div>
            )}

            {/* Error Message & Retry Banner */}
            {error && (
              <div className="mx-4 sm:mx-6 my-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
                <button
                  onClick={onRetry}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 font-medium transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Retry
                </button>
              </div>
            )}

            <div ref={bottomMarkerRef} className="h-2" />
          </div>
        )}
      </div>

      {/* Floating Jump to Bottom Button */}
      {showScrollBottom && (
        <button
          onClick={scrollToBottom}
          aria-label="Jump to latest message"
          className="absolute bottom-6 right-6 p-2.5 rounded-full bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] shadow-xl hover:bg-[var(--surface-secondary)] transition-all z-20 focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <ArrowDown className="w-4 h-4 text-indigo-500" />
        </button>
      )}
    </div>
  );
};
