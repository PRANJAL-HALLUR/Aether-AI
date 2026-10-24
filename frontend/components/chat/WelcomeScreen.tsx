'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Terminal, Cpu, Lightbulb, Compass } from 'lucide-react';

interface WelcomeScreenProps {
  onSelectPrompt: (prompt: string) => void;
}

const SUGGESTED_PROMPTS = [
  {
    icon: Terminal,
    title: 'Explain Async SSE Streaming',
    description: 'How Server-Sent Events deliver real-time token streams.',
    prompt: 'Explain how Server-Sent Events (SSE) work in an async FastAPI architecture and why it is optimal for LLM streaming.',
  },
  {
    icon: Cpu,
    title: 'Avatar & Voice Architecture',
    description: 'How to hook a 3D avatar and audio synthesis into chat.',
    prompt: 'What is the recommended architecture for integrating a real-time 3D talking avatar and voice into this chat application?',
  },
  {
    icon: Lightbulb,
    title: 'Code Modern Full-Stack Service',
    description: 'Build a production-ready async Python endpoint.',
    prompt: 'Show me an example of an asynchronous Python FastAPI service with Pydantic validation and error handling.',
  },
  {
    icon: Compass,
    title: 'Explore Aether AI Capabilities',
    description: 'Learn about persona, design tokens, and providers.',
    prompt: 'Who are you and what makes Aether AI unique?',
  },
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectPrompt }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-2xl mx-auto w-full text-center space-y-8 select-none">
      {/* Brand Hero */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        <div className="relative inline-flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 blur-xl opacity-40 animate-pulse" />
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-xl shadow-indigo-500/25 text-white">
            <Sparkles className="w-8 h-8" />
          </div>
        </div>

        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
            How can Aether assist you today?
          </h1>
          <p className="text-sm text-[var(--foreground-muted)] max-w-md mx-auto">
            Experience real-time AI reasoning, full-stack intelligence, and an extensible multimodal interface.
          </p>
        </div>
      </motion.div>

      {/* Suggested Prompt Chips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left"
      >
        {SUGGESTED_PROMPTS.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              onClick={() => onSelectPrompt(item.prompt)}
              className="group p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-secondary)] hover:border-indigo-500/40 transition-all text-left shadow-xs hover:shadow-md hover:shadow-indigo-500/5 focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="space-y-1 overflow-hidden">
                  <h4 className="text-xs font-semibold text-[var(--foreground)] group-hover:text-indigo-400 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-[var(--foreground-muted)] line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </motion.div>
    </div>
  );
};
