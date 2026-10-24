'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Sliders, Moon, Sun, Monitor, Command, Key } from 'lucide-react';
import { useTheme } from 'next-themes';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { theme, setTheme } = useTheme();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            aria-hidden="true"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
            className="relative w-full max-w-lg rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-2xl overflow-hidden z-10"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 id="settings-title" className="text-sm font-semibold text-[var(--foreground)]">
                    Aether Settings
                  </h3>
                  <p className="text-xs text-[var(--foreground-muted)]">
                    App preferences & system configuration
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                aria-label="Close settings"
                className="p-1.5 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-secondary)] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Theme Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[var(--foreground)]">
                  Appearance Theme
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'dark', label: 'Dark', icon: Moon },
                    { id: 'light', label: 'Light', icon: Sun },
                    { id: 'system', label: 'System', icon: Monitor },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = theme === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setTheme(item.id)}
                        className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-indigo-500/15 border-indigo-500 text-indigo-500'
                            : 'border-[var(--border)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-secondary)]'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Provider Info */}
              <div className="p-4 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] space-y-2 text-xs">
                <div className="flex items-center justify-between font-medium">
                  <span className="text-[var(--foreground)]">Active LLM Provider</span>
                  <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 font-mono text-[11px]">
                    Mock / OpenAI / Anthropic
                  </span>
                </div>
                <p className="text-[11px] text-[var(--foreground-muted)] leading-relaxed">
                  Configured via <code className="text-indigo-400">backend/.env</code>. Set{' '}
                  <code className="text-indigo-400">LLM_PROVIDER=openai</code> or{' '}
                  <code className="text-indigo-400">LLM_PROVIDER=anthropic</code> to stream live intelligence.
                </p>
              </div>

              {/* Keyboard Shortcuts */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[var(--foreground)] flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-indigo-500" />
                  Keyboard Shortcuts
                </label>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-[var(--surface-secondary)]/50">
                    <span className="text-[var(--foreground-muted)]">Send Message</span>
                    <kbd className="px-2 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)] text-[10px] font-mono">
                      Enter
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-[var(--surface-secondary)]/50">
                    <span className="text-[var(--foreground-muted)]">New Line in Prompt</span>
                    <kbd className="px-2 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)] text-[10px] font-mono">
                      Shift + Enter
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-[var(--surface-secondary)]/50">
                    <span className="text-[var(--foreground-muted)]">New Conversation</span>
                    <kbd className="px-2 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)] text-[10px] font-mono">
                      Ctrl + K
                    </kbd>
                  </div>
                </div>
              </div>

              {/* Multimodal & Avatar Roadmap */}
              <div className="space-y-1 text-xs text-[var(--foreground-muted)]">
                <span className="font-semibold text-[var(--foreground)]">Next Milestones</span>
                <p className="text-[11px] leading-relaxed">
                  Interactive 3D WebGL Avatar with synchronized real-time speech visemes and audio WebRTC streaming will occupy the reserved right panel.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-[var(--border)] bg-[var(--surface-secondary)]/40 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
