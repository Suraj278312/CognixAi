'use client';

import React from 'react';

export function OrbitalField() {
  return (
    <div
      style={{
        perspective: '1200px',
      }}
      className="absolute top-[28%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-screen max-w-[1700px] h-[550px] sm:h-[750px] pointer-events-none select-none z-0"
    >
      <div
        style={{
          transform: 'rotateX(66deg) rotateZ(-12deg)',
          transformStyle: 'preserve-3d',
        }}
        className="w-full h-full flex items-center justify-center"
      >
        <svg
          viewBox="0 0 1400 900"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full opacity-35 dark:opacity-45"
        >
          <defs>
            {/* Outer Horizon Track Gradient */}
            <linearGradient id="orbit-grad-outer" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0" />
              <stop offset="20%" stopColor="#6366f1" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.6" />
              <stop offset="80%" stopColor="#818cf8" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>

            {/* Inner Horizon Track Gradient */}
            <linearGradient id="orbit-grad-inner" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0" />
              <stop offset="30%" stopColor="#c084fc" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#22d3ee" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Outer Wide Orbital Ring */}
          <g className="animate-orbit-cw" style={{ transformOrigin: '700px 450px' }}>
            <ellipse
              cx="700"
              cy="450"
              rx="640"
              ry="380"
              stroke="url(#orbit-grad-outer)"
              strokeWidth="1.2"
              strokeDasharray="6 12"
            />
            {/* Subtle floating satellite bead */}
            <circle cx="1340" cy="450" r="3" fill="#38bdf8" opacity="0.8" />
            <circle cx="1340" cy="450" r="7" fill="#38bdf8" opacity="0.2" />
          </g>

          {/* Inner Wide Orbital Ring */}
          <g className="animate-orbit-ccw" style={{ transformOrigin: '700px 450px' }}>
            <ellipse
              cx="700"
              cy="450"
              rx="490"
              ry="290"
              stroke="url(#orbit-grad-inner)"
              strokeWidth="1"
              strokeDasharray="4 8"
            />
            {/* Inner subtle bead */}
            <circle cx="210" cy="450" r="2.5" fill="#c084fc" opacity="0.8" />
            <circle cx="210" cy="450" r="6" fill="#c084fc" opacity="0.2" />
          </g>
        </svg>
      </div>

      <style jsx>{`
        .animate-orbit-cw {
          animation: spin-cw 80s linear infinite;
        }
        .animate-orbit-ccw {
          animation: spin-ccw 60s linear infinite;
        }

        @keyframes spin-cw {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes spin-ccw {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(-360deg);
          }
        }
      `}</style>
    </div>
  );
}
