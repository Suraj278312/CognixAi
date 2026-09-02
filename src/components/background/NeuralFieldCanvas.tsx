'use client';

import React, { useEffect, useRef } from 'react';

interface PeripheralNode {
  baseX: number; // 0 to 1 relative width
  baseY: number; // 0 to 1 relative height
  radius: number;
  freqX: number;
  freqY: number;
  ampX: number;
  ampY: number;
  phase: number;
  depth: number;
  color: string;
  glowColor: string;
}

// Nodes positioned strictly in the ambient margins (away from the center text)
const NODES: PeripheralNode[] = [
  // Left ambient wing
  { baseX: 0.07, baseY: 0.25, radius: 3.5, freqX: 0.0006, freqY: 0.0005, ampX: 14, ampY: 10, phase: 0.2, depth: 0.9, color: '#818cf8', glowColor: 'rgba(99, 102, 241, 0.4)' },
  { baseX: 0.16, baseY: 0.48, radius: 3.0, freqX: 0.0005, freqY: 0.0007, ampX: 12, ampY: 12, phase: 1.5, depth: 1.1, color: '#38bdf8', glowColor: 'rgba(56, 189, 248, 0.45)' },
  { baseX: 0.09, baseY: 0.70, radius: 3.2, freqX: 0.0007, freqY: 0.0006, ampX: 15, ampY: 10, phase: 3.2, depth: 0.8, color: '#c084fc', glowColor: 'rgba(168, 85, 247, 0.4)' },

  // Right ambient wing
  { baseX: 0.93, baseY: 0.22, radius: 3.5, freqX: 0.0005, freqY: 0.0006, ampX: 14, ampY: 12, phase: 2.8, depth: 1.0, color: '#38bdf8', glowColor: 'rgba(56, 189, 248, 0.45)' },
  { baseX: 0.84, baseY: 0.45, radius: 3.0, freqX: 0.0007, freqY: 0.0005, ampX: 12, ampY: 10, phase: 4.1, depth: 1.2, color: '#818cf8', glowColor: 'rgba(99, 102, 241, 0.4)' },
  { baseX: 0.91, baseY: 0.68, radius: 3.6, freqX: 0.0006, freqY: 0.0007, ampX: 16, ampY: 14, phase: 5.0, depth: 0.9, color: '#a78bfa', glowColor: 'rgba(167, 139, 250, 0.45)' },
];

// Peripheral connection links ONLY (never crossing center)
const PERIPHERAL_LINKS: [number, number][] = [
  [0, 1],
  [1, 2],
  [3, 4],
  [4, 5],
];

interface NeuralFieldCanvasProps {
  mouseRef: React.MutableRefObject<{ x: number; y: number; ratioX: number; ratioY: number }>;
}

export function NeuralFieldCanvas({ mouseRef }: NeuralFieldCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const currentMouseX = useRef(0);
  const currentMouseY = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let isVisible = true;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resize = () => {
      const w = window.innerWidth;
      const h = containerRef.current?.clientHeight || 850;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      width = w;
      height = h;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.02 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    const startTime = performance.now();

    const render = (now: number) => {
      if (!isVisible) {
        animationFrameRef.current = requestAnimationFrame(render);
        return;
      }

      const elapsed = now - startTime;

      // Smooth mouse lerp
      const targetX = (mouseRef.current?.ratioX || 0) * 16;
      const targetY = (mouseRef.current?.ratioY || 0) * 12;
      currentMouseX.current += (targetX - currentMouseX.current) * 0.04;
      currentMouseY.current += (targetY - currentMouseY.current) * 0.04;

      ctx.clearRect(0, 0, width, height);

      // -----------------------------------------------------------------------
      // 1. Calculate Floating Node Positions
      // -----------------------------------------------------------------------
      const nodePositions: { x: number; y: number; r: number; color: string; glowColor: string }[] = [];

      for (let i = 0; i < NODES.length; i++) {
        const node = NODES[i];
        const motionTime = prefersReducedMotion ? 0 : elapsed;

        const floatX = Math.sin(motionTime * node.freqX + node.phase) * node.ampX;
        const floatY = Math.cos(motionTime * node.freqY + node.phase) * node.ampY;

        const posX = node.baseX * width + floatX + currentMouseX.current * node.depth;
        const posY = node.baseY * height + floatY + currentMouseY.current * node.depth;

        const pulse = prefersReducedMotion ? 1 : 1 + Math.sin(motionTime * 0.002 + node.phase) * 0.15;
        const radius = node.radius * pulse;

        nodePositions.push({ x: posX, y: posY, r: radius, color: node.color, glowColor: node.glowColor });
      }

      // -----------------------------------------------------------------------
      // 2. Draw Soft Peripheral Neural Links
      // -----------------------------------------------------------------------
      for (const [idxA, idxB] of PERIPHERAL_LINKS) {
        const a = nodePositions[idxA];
        const b = nodePositions[idxB];
        if (!a || !b) continue;

        const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
        grad.addColorStop(0, `${a.color}25`);
        grad.addColorStop(0.5, '#38bdf840');
        grad.addColorStop(1, `${b.color}25`);

        ctx.save();
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 5]);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        ctx.restore();
      }

      // -----------------------------------------------------------------------
      // 3. Draw Ambient Margin Nodes
      // -----------------------------------------------------------------------
      for (const node of nodePositions) {
        ctx.save();

        // Soft halo
        const halo = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.r * 5);
        halo.addColorStop(0, node.glowColor);
        halo.addColorStop(0.5, node.glowColor.replace(/[\d.]+\)$/, '0.1)'));
        halo.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r * 5, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        ctx.fill();

        // White core spark
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r * 0.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // -----------------------------------------------------------------------
      // 4. Lower Hero Flowing Wave / Data Mesh
      // -----------------------------------------------------------------------
      const wavePointsCount = 36;
      const waveBaseY = height * 0.90;
      const waveMotionTime = prefersReducedMotion ? 0 : elapsed * 0.0006;

      // Layer 1: Primary Soft Sine Flow
      ctx.save();
      ctx.beginPath();
      for (let i = 0; i <= wavePointsCount; i++) {
        const x = (i / wavePointsCount) * width;
        const wave1 = Math.sin(x * 0.0028 + waveMotionTime) * 14;
        const wave2 = Math.cos(x * 0.0048 - waveMotionTime * 0.7) * 8;
        const y = waveBaseY + wave1 + wave2 + currentMouseY.current * 0.25;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        // Draw tiny data beads
        if (i % 2 === 0) {
          ctx.save();
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      const waveGrad = ctx.createLinearGradient(0, 0, width, 0);
      waveGrad.addColorStop(0, 'rgba(99, 102, 241, 0)');
      waveGrad.addColorStop(0.25, 'rgba(99, 102, 241, 0.3)');
      waveGrad.addColorStop(0.55, 'rgba(56, 189, 248, 0.45)');
      waveGrad.addColorStop(0.85, 'rgba(168, 85, 247, 0.3)');
      waveGrad.addColorStop(1, 'rgba(99, 102, 241, 0)');

      ctx.strokeStyle = waveGrad;
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();

      // Layer 2: Secondary Soft Trail
      ctx.save();
      ctx.beginPath();
      for (let i = 0; i <= wavePointsCount; i++) {
        const x = (i / wavePointsCount) * width;
        const wave1 = Math.cos(x * 0.0035 + waveMotionTime * 1.1) * 10;
        const wave2 = Math.sin(x * 0.0055 + waveMotionTime * 0.5) * 6;
        const y = waveBaseY + 12 + wave1 + wave2 + currentMouseY.current * 0.2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      const waveGrad2 = ctx.createLinearGradient(0, 0, width, 0);
      waveGrad2.addColorStop(0, 'rgba(56, 189, 248, 0)');
      waveGrad2.addColorStop(0.35, 'rgba(56, 189, 248, 0.2)');
      waveGrad2.addColorStop(0.7, 'rgba(168, 85, 247, 0.25)');
      waveGrad2.addColorStop(1, 'rgba(56, 189, 248, 0)');

      ctx.strokeStyle = waveGrad2;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 5]);
      ctx.stroke();
      ctx.restore();

      if (!prefersReducedMotion) {
        animationFrameRef.current = requestAnimationFrame(render);
      }
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      observer.disconnect();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [mouseRef]);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-none select-none z-0">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
