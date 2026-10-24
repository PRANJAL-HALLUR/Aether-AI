'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  MessageSquare,
  Trash2,
  Search,
  Sparkles,
  Check,
  X,
} from 'lucide-react';
import { ConversationSummary } from '@/types/chat';
import { formatDateRelative } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: ConversationSummary[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Filter conversations by query
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    return conversations.filter((c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [conversations, searchQuery]);

  // Group conversations chronologically
  const groupedConversations = useMemo(() => {
    const groups: { [key: string]: ConversationSummary[] } = {
      Today: [],
      Yesterday: [],
      'Previous 7 Days': [],
      Older: [],
    };

    filteredConversations.forEach((conv) => {
      const rel = formatDateRelative(conv.updated_at);
      if (rel === 'Today') {
        groups.Today.push(conv);
      } else if (rel === 'Yesterday') {
        groups.Yesterday.push(conv);
      } else if (rel.includes('days ago')) {
        groups['Previous 7 Days'].push(conv);
      } else {
        groups.Older.push(conv);
      }
    });

    return Object.entries(groups).filter(([_, items]) => items.length > 0);
  }, [filteredConversations]);

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirmDeleteId === id) {
      onDeleteConversation(id);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
    }
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDeleteId(null);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 md:hidden"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Sidebar container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 flex flex-col w-72 md:w-64 lg:w-72 h-[calc(100vh-4rem)] bg-[var(--sidebar-bg)] border-r border-[var(--border)] transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:hidden'
        }`}
        aria-label="Conversation History"
      >
        {/* Top Actions: New Chat */}
        <div className="p-3 border-b border-[var(--border)] space-y-2.5">
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) onClose();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm shadow-md shadow-indigo-600/25 transition-all group focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            <span className="flex items-center gap-2">
              <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
              New Conversation
            </span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded text-white/90">
              Ctrl+K
            </span>
          </button>

          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--foreground-muted)]" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--surface-secondary)] border border-[var(--border)] text-[var(--foreground)] placeholder-[var(--foreground-muted)] text-xs rounded-lg pl-9 pr-3 py-2 outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
          {conversations.length === 0 ? (
            <div className="text-center py-10 px-4 text-[var(--foreground-muted)]">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs">No conversations yet.</p>
              <p className="text-[11px] mt-1 text-indigo-400">
                Start a new chat to begin!
              </p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <p className="text-center text-xs text-[var(--foreground-muted)] py-6">
              No matching conversations
            </p>
          ) : (
            groupedConversations.map(([groupName, items]) => (
              <div key={groupName} className="space-y-1">
                <h2 className="px-2 text-[11px] font-semibold text-[var(--foreground-muted)] uppercase tracking-wider">
                  {groupName}
                </h2>
                <div className="space-y-0.5">
                  {items.map((conv) => {
                    const isSelected = conv.id === currentConversationId;
                    const isConfirming = confirmDeleteId === conv.id;

                    return (
                      <div
                        key={conv.id}
                        onClick={() => {
                          onSelectConversation(conv.id);
                          if (window.innerWidth < 768) onClose();
                        }}
                        className={`group relative flex items-center justify-between px-2.5 py-2 rounded-xl text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-indigo-500/10 text-indigo-500 font-medium'
                            : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-secondary)]'
                        }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden pr-2">
                          <MessageSquare
                            className={`w-3.5 h-3.5 flex-shrink-0 ${
                              isSelected ? 'text-indigo-500' : 'text-slate-400'
                            }`}
                          />
                          <span className="truncate">{conv.title}</span>
                        </div>

                        {/* Delete action / confirm buttons */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {isConfirming ? (
                            <div className="flex items-center gap-1 bg-red-500/10 rounded-md p-0.5">
                              <button
                                onClick={(e) => handleDeleteClick(e, conv.id)}
                                title="Confirm delete"
                                className="p-1 rounded text-red-500 hover:bg-red-500/20 transition-colors"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={handleCancelDelete}
                                title="Cancel"
                                className="p-1 rounded text-slate-400 hover:bg-slate-500/20 transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={(e) => handleDeleteClick(e, conv.id)}
                              title="Delete conversation"
                              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/10 hover:text-red-500 text-[var(--foreground-muted)] transition-opacity"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-[var(--border)] bg-[var(--surface-secondary)]/50 text-[11px] text-[var(--foreground-muted)] flex items-center justify-between">
          <span>Aether AI v1.0</span>
          <span className="flex items-center gap-1 text-emerald-500 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Online
          </span>
        </div>
      </aside>
    </>
  );
};
