'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, X } from 'lucide-react';

interface MemoryToastProps {
  memoryContent: string | null;
  onClose: () => void;
  onOpenManager: () => void;
}

export function MemoryToast({ memoryContent, onClose, onOpenManager }: MemoryToastProps) {
  return (
    <AnimatePresence>
      {memoryContent && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          className="fixed bottom-24 right-6 z-50 max-w-sm p-3.5 bg-surface-2 border border-brand/40 rounded-xl shadow-floating text-xs select-none"
        >
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 rounded-md bg-brand/15 text-brand shrink-0">
              <Brain className="w-4 h-4" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground">Cognix Remembered</p>
              <p className="text-foreground-secondary line-clamp-2 mt-0.5 font-sans">
                &ldquo;{memoryContent}&rdquo;
              </p>
              <button
                onClick={onOpenManager}
                className="mt-1.5 text-[11px] font-medium text-brand hover:underline"
              >
                Manage Memories
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1 text-foreground-muted hover:text-foreground rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
