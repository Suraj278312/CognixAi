'use client';

import React from 'react';

export function AmbientGlow() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
      {/* 1. Primary Backlit Indigo/Violet Core Aura */}
      <div
        style={{
          animation: 'glow-float-1 16s ease-in-out infinite',
          willChange: 'transform, opacity',
        }}
        className="absolute top-[22%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] sm:w-[1000px] lg:w-[1200px] h-[400px] sm:h-[520px] rounded-full blur-[140px] sm:blur-[180px] bg-gradient-to-tr from-[#3730a3] via-[#6366f1] to-[#7e22ce] opacity-30 dark:opacity-35"
      />

      {/* 2. Soft Ambient Cyan Horizon Flare */}
      <div
        style={{
          animation: 'glow-float-2 20s ease-in-out infinite 2s',
          willChange: 'transform, opacity',
        }}
        className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/3 w-[650px] sm:w-[900px] lg:w-[1100px] h-[320px] sm:h-[420px] rounded-full blur-[130px] sm:blur-[160px] bg-gradient-to-r from-[#0e7490] via-[#3b82f6] to-[#6366f1] opacity-20 dark:opacity-25"
      />

      {/* 3. Lower Section Smooth Transition Ambient */}
      <div
        style={{
          animation: 'glow-float-1 12s ease-in-out infinite 4s',
          willChange: 'transform, opacity',
        }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] sm:w-[1300px] h-[260px] rounded-full blur-[120px] bg-gradient-to-t from-[#6366f1]/20 via-[#4f46e5]/10 to-transparent opacity-20 dark:opacity-25"
      />

      <style jsx>{`
        @keyframes glow-float-1 {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1) translate3d(0, 0, 0);
            opacity: 0.3;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.06) translate3d(15px, -12px, 0);
            opacity: 0.4;
          }
        }
        @keyframes glow-float-2 {
          0%, 100% {
            transform: translate(-50%, -33%) scale(0.95) translate3d(0, 0, 0);
            opacity: 0.2;
          }
          50% {
            transform: translate(-50%, -33%) scale(1.05) translate3d(-15px, 15px, 0);
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  );
}
