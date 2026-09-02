import React from 'react';
import { motion } from 'framer-motion';

export function StreamingIndicator() {
  return (
    <span className="inline-flex items-center ml-1 align-middle select-none">
      <motion.span
        animate={{
          opacity: [0.2, 1, 0.2],
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="inline-block w-2 h-4 bg-brand rounded-[1px] shadow-sm shadow-brand/40"
      />
    </span>
  );
}
