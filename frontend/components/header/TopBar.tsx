'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import {
  Bot,
  Moon,
  Sun,
  Settings,
  PanelLeftClose,
  PanelLeft,
  Sparkles,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';
import { fetchHealth } from '@/lib/api';
import { HealthStatus } from '@/types/chat';

interface TopBarProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  isAvatarOpen: boolean;
  onToggleAvatar: () => void;
  onOpenSettings: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  isSidebarOpen,
  onToggleSidebar,
  isAvatarOpen,
  onToggleAvatar,
  onOpenSettings,
}) => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [health, setHealth] = useState<HealthStatus | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchHealth()
      .then(setHealth)
      .catch(() => {
        setHealth({
          status: 'degraded',
          provider: 'offline',
          database: 'disconnected',
          version: '1.0.0',
        });
      });
  }, []);

  const isDark = mounted && (resolvedTheme === 'dark' || theme === 'dark');

  return (
    <header className="h-16 w-full border-b border-[var(--border)] bg-[var(--surface-glass)] backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-30 transition-colors">
      {/* Left section: Sidebar toggle & Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          className="p-2 rounded-xl text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-secondary)] transition-all focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="w-5 h-5" />
          ) : (
            <PanelLeft className="w-5 h-5" />
          )}
        </button>

        <div className="flex items-center gap-2.5 select-none">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold tracking-tight text-base text-[var(--foreground)]">
                Aether
              </span>
              <span className="text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                AI CORE
              </span>
            </div>
            <p className="text-[11px] text-[var(--foreground-muted)] hidden sm:block">
              Intelligent Conversational Copilot
            </p>
          </div>
        </div>
      </div>

      {/* Center status pill */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface-secondary)] border border-[var(--border)] text-xs text-[var(--foreground-muted)]">
        <span
          className={`w-2 h-2 rounded-full ${
            health?.status === 'healthy'
              ? 'bg-emerald-500 animate-pulse'
              : 'bg-amber-500'
          }`}
        />
        <span>
          Provider:{' '}
          <strong className="text-[var(--foreground)] capitalize">
            {health?.provider || 'mock'}
          </strong>
        </span>
      </div>

      {/* Right controls: Theme, Avatar toggle, Settings */}
      <div className="flex items-center gap-2">
        {/* Mobile/Tablet Avatar Panel Toggle */}
        <button
          onClick={onToggleAvatar}
          aria-label="Toggle Avatar Panel"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
            isAvatarOpen
              ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/30'
              : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--surface-secondary)]'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span className="hidden sm:inline">Avatar</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-2 rounded-xl text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-secondary)] transition-all focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          {mounted && isDark ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-indigo-500" />
          )}
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          aria-label="Open Settings"
          className="p-2 rounded-xl text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-secondary)] transition-all focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
