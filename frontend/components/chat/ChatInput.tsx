'use client';

import React, { useRef, useEffect } from 'react';
import { ArrowUp, Square, Mic, AlertCircle } from 'lucide-react';

interface ChatInputProps {
  value: string;
  onChange: (val: string) => void;
  onSend: () => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  onStop,
  isStreaming,
  disabled = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 180)}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isStreaming && value.trim()) {
        onSend();
      }
    }
  };

  const hasContent = value.trim().length > 0;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4 pt-2">
      <div className="relative rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-lg shadow-black/5 focus-within:border-indigo-500/80 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Message Aether... (Shift+Enter for new line)"
          rows={1}
          aria-label="Chat input message"
          className="w-full resize-none bg-transparent px-4 py-3.5 pr-24 text-sm text-[var(--foreground)] placeholder-[var(--foreground-muted)] outline-none min-h-[48px] max-h-[180px] overflow-y-auto leading-relaxed"
        />

        {/* Action Buttons Right aligned */}
        <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1.5">
          {/* Mic Placeholder (Future Voice/Avatar integration) */}
          <div className="relative group">
            <button
              type="button"
              aria-label="Microphone voice input (coming soon)"
              className="p-2 rounded-xl text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-secondary)] transition-all cursor-not-allowed opacity-60"
            >
              <Mic className="w-4 h-4" />
            </button>
            <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block bg-slate-900 text-white text-[11px] px-2.5 py-1 rounded-lg whitespace-nowrap shadow-xl z-50 pointer-events-none">
              Voice & Avatar streaming coming soon
            </div>
          </div>

          {/* Send or Stop Button */}
          {isStreaming ? (
            <button
              type="button"
              onClick={onStop}
              aria-label="Stop generating response"
              className="p-2 rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-500/20 transition-all focus-visible:ring-2 focus-visible:ring-red-400"
            >
              <Square className="w-4 h-4 fill-white" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onSend}
              disabled={!hasContent || disabled}
              aria-label="Send message"
              className={`p-2 rounded-xl transition-all ${
                hasContent && !disabled
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25 focus-visible:ring-2 focus-visible:ring-indigo-400'
                  : 'bg-[var(--surface-secondary)] text-[var(--foreground-muted)] cursor-not-allowed opacity-50'
              }`}
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Disclaimers & tips */}
      <div className="mt-2 text-center text-[11px] text-[var(--foreground-muted)] flex items-center justify-center gap-2 select-none">
        <span>Aether AI can make mistakes. Verify important facts.</span>
      </div>
    </div>
  );
};
