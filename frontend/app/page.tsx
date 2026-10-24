'use client';

import React, { useState, useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import { TopBar } from '@/components/header/TopBar';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { ChatArea } from '@/components/chat/ChatArea';
import { ChatInput } from '@/components/chat/ChatInput';
import { AvatarPanel } from '@/components/avatar/AvatarPanel';
import { SettingsModal } from '@/components/modals/SettingsModal';

export default function ChatPage() {
  const [inputText, setInputText] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAvatarOpen, setIsAvatarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const {
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
  } = useChat();

  // Keyboard shortcut for Ctrl+K (New Chat) and Escape (Close modal)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        startNewConversation();
      }
      if (e.key === 'Escape') {
        setIsSettingsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [startNewConversation]);

  // Mobile layout adjustment on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsAvatarOpen(false);
      } else {
        setIsAvatarOpen(true);
      }
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSend = () => {
    if (!inputText.trim() || isStreaming) return;
    const textToSend = inputText;
    setInputText('');
    sendMessage(textToSend);
  };

  const handleSelectPrompt = (prompt: string) => {
    setInputText('');
    sendMessage(prompt);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[var(--background)]">
      {/* Top Navigation */}
      <TopBar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        isAvatarOpen={isAvatarOpen}
        onToggleAvatar={() => setIsAvatarOpen((prev) => !prev)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Workspace Layout (Sidebar + Chat Area + Avatar Panel) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Collapsible Left Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          conversations={conversations}
          currentConversationId={currentConversationId}
          onSelectConversation={selectConversation}
          onNewChat={startNewConversation}
          onDeleteConversation={deleteConversationById}
        />

        {/* Center Chat Area */}
        <main className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden relative bg-[var(--background)]">
          <ChatArea
            messages={messages}
            isStreaming={isStreaming}
            isThinking={isThinking}
            isLoadingHistory={isLoadingHistory}
            error={error}
            onSelectPrompt={handleSelectPrompt}
            onRegenerate={regenerateLastMessage}
            onRating={setRating}
            onRetry={regenerateLastMessage}
          />

          {/* Chat Input Bar */}
          <ChatInput
            value={inputText}
            onChange={setInputText}
            onSend={handleSend}
            onStop={stopStreaming}
            isStreaming={isStreaming}
            disabled={isLoadingHistory}
          />
        </main>

        {/* Reserved Right Avatar Panel */}
        <AvatarPanel
          isOpen={isAvatarOpen}
          onClose={() => setIsAvatarOpen(false)}
          isStreaming={isStreaming}
        />
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
