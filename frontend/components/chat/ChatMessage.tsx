'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';
import {
  Copy,
  Check,
  RotateCw,
  ThumbsUp,
  ThumbsDown,
  User,
  Sparkles,
} from 'lucide-react';
import { Message, Rating } from '@/types/chat';
import { formatTimestamp } from '@/lib/utils';

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
  onRegenerate?: () => void;
  onRating?: (rating: Rating) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isStreaming = false,
  onRegenerate,
  onRating,
}) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`group w-full py-4 px-3 sm:px-6 flex gap-3 sm:gap-4 transition-colors ${
        isUser
          ? 'bg-transparent'
          : 'bg-[var(--surface-secondary)]/30 border-y border-[var(--border-subtle)]'
      }`}
      role="article"
      aria-label={`${isUser ? 'User' : 'Assistant'} message`}
    >
      {/* Avatar Icon */}
      <div className="flex-shrink-0 pt-0.5">
        {isUser ? (
          <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center text-xs font-semibold shadow-xs">
            <User className="w-4 h-4" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Message Content Container */}
      <div className="flex-1 overflow-hidden space-y-1.5">
        {/* Name and Timestamp */}
        <div className="flex items-center gap-2 select-none">
          <span className="text-xs font-semibold text-[var(--foreground)]">
            {isUser ? 'You' : 'Aether'}
          </span>
          <span className="text-[11px] text-[var(--foreground-muted)] opacity-0 group-hover:opacity-100 transition-opacity">
            {formatTimestamp(message.created_at)}
          </span>
        </div>

        {/* Markdown Render Body */}
        <div className="prose prose-sm dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed text-[var(--foreground)] break-words">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const isInline = !match && !String(children).includes('\n');

                if (isInline) {
                  return (
                    <code
                      className="px-1.5 py-0.5 rounded-md bg-[var(--surface-secondary)] text-indigo-500 font-mono text-[11px] font-semibold"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                }

                const language = match ? match[1] : '';
                const codeString = String(children).replace(/\n$/, '');

                return (
                  <CodeBlock language={language} code={codeString} />
                );
              },
              p({ children }) {
                return <p className="mb-2 last:mb-0">{children}</p>;
              },
              ul({ children }) {
                return <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>;
              },
              ol({ children }) {
                return <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>;
              },
              li({ children }) {
                return <li className="my-0.5">{children}</li>;
              },
              h1({ children }) {
                return <h1 className="text-base font-bold my-2 text-[var(--foreground)]">{children}</h1>;
              },
              h2({ children }) {
                return <h2 className="text-sm font-bold my-2 text-[var(--foreground)]">{children}</h2>;
              },
              h3({ children }) {
                return <h3 className="text-xs font-bold my-1 text-[var(--foreground)]">{children}</h3>;
              },
              table({ children }) {
                return (
                  <div className="overflow-x-auto my-3 border border-[var(--border)] rounded-xl">
                    <table className="min-w-full divide-y divide-[var(--border)] text-xs">
                      {children}
                    </table>
                  </div>
                );
              },
              th({ children }) {
                return (
                  <th className="px-3 py-2 bg-[var(--surface-secondary)] font-semibold text-left">
                    {children}
                  </th>
                );
              },
              td({ children }) {
                return (
                  <td className="px-3 py-2 border-t border-[var(--border)]">
                    {children}
                  </td>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>

          {/* Real-time streaming blinking cursor */}
          {isStreaming && <span className="cursor-blink" aria-hidden="true" />}
        </div>

        {/* Assistant Action Bar (Copy, Regenerate, Thumbs up/down) */}
        {!isUser && !isStreaming && (
          <div className="pt-2 flex items-center gap-1 text-[var(--foreground-muted)] select-none opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopyMessage}
              aria-label="Copy response"
              title="Copy message"
              className="p-1.5 rounded-lg hover:text-[var(--foreground)] hover:bg-[var(--surface-secondary)] transition-colors focus-visible:ring-1 focus-visible:ring-indigo-500"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>

            {onRegenerate && (
              <button
                onClick={onRegenerate}
                aria-label="Regenerate response"
                title="Regenerate"
                className="p-1.5 rounded-lg hover:text-[var(--foreground)] hover:bg-[var(--surface-secondary)] transition-colors focus-visible:ring-1 focus-visible:ring-indigo-500"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            )}

            <div className="h-3 w-px bg-[var(--border)] mx-1" />

            <button
              onClick={() => onRating?.(message.rating === 'up' ? null : 'up')}
              aria-label="Thumbs up"
              title="Good response"
              className={`p-1.5 rounded-lg transition-colors focus-visible:ring-1 focus-visible:ring-indigo-500 ${
                message.rating === 'up'
                  ? 'text-indigo-500 bg-indigo-500/10'
                  : 'hover:text-[var(--foreground)] hover:bg-[var(--surface-secondary)]'
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onRating?.(message.rating === 'down' ? null : 'down')}
              aria-label="Thumbs down"
              title="Bad response"
              className={`p-1.5 rounded-lg transition-colors focus-visible:ring-1 focus-visible:ring-indigo-500 ${
                message.rating === 'down'
                  ? 'text-red-500 bg-red-500/10'
                  : 'hover:text-[var(--foreground)] hover:bg-[var(--surface-secondary)]'
              }`}
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Standalone syntax-highlighted code block component with copy button
const CodeBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code snippet:', err);
    }
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--code-bg)] text-[var(--code-fg)] shadow-md">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900/90 border-b border-slate-800 text-[11px] text-slate-400 select-none">
        <span className="font-mono uppercase tracking-wider">{language || 'plaintext'}</span>
        <button
          onClick={copyCode}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-md hover:bg-slate-800 hover:text-slate-200 transition-colors"
          aria-label="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <div className="p-3.5 overflow-x-auto text-[12px] font-mono leading-relaxed">
        <pre className="m-0 p-0 bg-transparent">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};
