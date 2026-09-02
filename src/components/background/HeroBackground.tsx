'use client';

import React, { useEffect, useRef } from 'react';
import { AmbientGlow } from './AmbientGlow';
import { OrbitalField } from './OrbitalField';
import { NeuralFieldCanvas } from './NeuralFieldCanvas';

export function HeroBackground() {
  const mouseRef = useRef({ x: 0, y: 0, ratioX: 0, ratioY: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const w = window.innerWidth || 1200;
      const h = window.innerHeight || 800;
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.ratioX = (e.clientX / w) * 2 - 1;
      mouseRef.current.ratioY = (e.clientY / h) * 2 - 1;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      className="absolute top-0 left-1/2 -translate-x-1/2 w-screen min-w-full h-full overflow-hidden pointer-events-none select-none z-0"
      aria-hidden="true"
    >
      {/* 1. Ambient AI Multi-Layer Cosmic Glow (Pure CSS GPU keyframes) */}
      <AmbientGlow />

      {/* 2. Concentric Orbital Field Tracks (Pure CSS GPU keyframes) */}
      <OrbitalField />

      {/* 3. Neural Field Nodes, Links, and Flowing Wave (60fps Canvas) */}
      <NeuralFieldCanvas mouseRef={mouseRef} />

      {/* 4. Soft Lower Gradient Mask */}
      <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-background via-background/50 to-transparent pointer-events-none z-0" />
    </div>
  );
}
