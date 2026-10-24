'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Mic, Volume2, ShieldCheck, Cpu } from 'lucide-react';

interface AvatarPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isStreaming?: boolean;
}

export const AvatarPanel: React.FC<AvatarPanelProps> = ({
  isOpen,
  onClose,
  isStreaming = false,
}) => {
  return (
    <aside
      className={`fixed md:static inset-y-0 right-0 z-30 flex flex-col w-80 lg:w-96 h-[calc(100vh-4rem)] bg-[var(--surface-glass)] backdrop-blur-xl border-l border-[var(--border)] transition-all duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full md:hidden'
      }`}
      aria-label="Multimodal Avatar Preview"
    >
      {/* Panel Header */}
      <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
          <h2 className="text-sm font-semibold tracking-wide text-[var(--foreground)]">
            Aether Persona
          </h2>
        </div>
        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
          Slot Reserved
        </span>
      </div>

      {/* Main Avatar Presentation Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6 overflow-hidden">
        {/* Animated Gradient Orb & Aura */}
        <div className="relative flex items-center justify-center w-52 h-52">
          {/* Subtle Outer Pulsing Wave */}
          <div
            className={`absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-2xl ${
              isStreaming ? 'animate-pulse scale-110' : 'animate-pulse-glow'
            }`}
          />

          {/* Secondary Radial Ring */}
          <div className="absolute inset-4 rounded-full border border-indigo-500/30 animate-spin [animation-duration:20s]" />

          {/* Primary Gradient Orb */}
          <div className="relative w-40 h-40 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-1 shadow-2xl shadow-indigo-500/30 animate-orb flex items-center justify-center">
            {/* Inner Gloss / Depth */}
            <div className="w-full h-full rounded-full bg-radial from-white/30 via-transparent to-black/40 flex items-center justify-center backdrop-blur-xs">
              <Sparkles className="w-10 h-10 text-white/90 drop-shadow-md" />
            </div>
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-2 max-w-xs">
          <h3 className="text-base font-semibold text-[var(--foreground)]">
            Avatar coming soon
          </h3>
          <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">
            Reserved high-fidelity slot for real-time 3D expressive mesh, Viseme blendshapes, and synchronized voice response.
          </p>
        </div>

        {/* Dynamic Audio Visualizer Bar Simulation */}
        <div className="w-full max-w-[200px] p-3 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border)] space-y-2">
          <div className="flex items-center justify-between text-[11px] text-[var(--foreground-muted)]">
            <span className="flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
              Speech Engine
            </span>
            <span className={isStreaming ? 'text-indigo-400 font-medium' : ''}>
              {isStreaming ? 'Synthesizing...' : 'Standby'}
            </span>
          </div>

          <div className="flex items-end justify-center gap-1 h-8">
            {[40, 75, 55, 90, 65, 80, 50, 85, 60, 45].map((height, i) => (
              <motion.div
                key={i}
                animate={{
                  height: isStreaming
                    ? [`${height * 0.3}%`, `${height}%`, `${height * 0.4}%`]
                    : '15%',
                }}
                transition={{
                  repeat: Infinity,
                  duration: 0.6 + (i % 3) * 0.2,
                  ease: 'easeInOut',
                }}
                className={`w-1.5 rounded-full transition-colors ${
                  isStreaming
                    ? 'bg-gradient-to-t from-indigo-500 to-purple-400'
                    : 'bg-slate-300 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Future-proof Architecture Specs */}
      <div className="p-4 border-t border-[var(--border)] bg-[var(--surface-secondary)]/40 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-[var(--foreground-muted)]">
          <Cpu className="w-4 h-4 text-indigo-500" />
          <span>WebGL / Three.js Canvas ready</span>
        </div>
        <div className="flex items-center gap-2 text-[var(--foreground-muted)]">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>WebRTC Voice Protocol compatible</span>
        </div>
      </div>
    </aside>
  );
};
