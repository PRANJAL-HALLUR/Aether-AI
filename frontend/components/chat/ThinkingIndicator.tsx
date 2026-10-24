'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export const ThinkingIndicator: React.FC = () => {
  return (
    <div className="flex items-center gap-3 py-2 px-1 text-xs text-[var(--foreground-muted)] animate-fadeIn">
      <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center flex-shrink-0">
        <Sparkles className="w-3.5 h-3.5 animate-spin [animation-duration:3s]" />
      </div>

      <div className="flex items-center gap-1.5">
        <span className="font-medium text-[var(--foreground)]">Aether</span>
        <span>is thinking</span>
        <div className="flex items-center gap-1 ml-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-indigo-500"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{
                repeat: Infinity,
                duration: 1.2,
                delay: i * 0.2,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
