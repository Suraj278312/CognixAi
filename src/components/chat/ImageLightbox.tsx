'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut, Download } from 'lucide-react';
import type { ImageAttachment } from '@/types/chat';

interface ImageLightboxProps {
  image: ImageAttachment | null;
  onClose: () => void;
}

export function ImageLightbox({ image, onClose }: ImageLightboxProps) {
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (image) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [image, onClose]);

  if (!image) return null;

  const imageUrl = image.url || image.base64Data || '';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-background/90 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center z-10"
        >
          {/* Top Bar Controls */}
          <div className="w-full flex items-center justify-between px-3 py-2 bg-surface-2/80 backdrop-blur-md rounded-t-xl border border-border-strong text-foreground text-xs">
            <div className="flex items-center gap-2 truncate max-w-sm">
              <span className="font-medium truncate">{image.name}</span>
              {image.width && image.height && (
                <span className="text-[10px] text-foreground-muted font-mono">
                  {image.width} × {image.height}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsZoomed(!isZoomed)}
                aria-label={isZoomed ? 'Zoom out' : 'Zoom in'}
                className="p-1.5 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface-3 transition-colors cursor-pointer"
              >
                {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
              </button>

              {imageUrl && (
                <a
                  href={imageUrl}
                  download={image.name}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Download image"
                  className="p-1.5 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface-3 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                </a>
              )}

              <button
                type="button"
                onClick={onClose}
                aria-label="Close image preview"
                className="p-1.5 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface-3 transition-colors cursor-pointer ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Image Canvas */}
          <div
            className={`w-full overflow-auto bg-surface-1 border-x border-b border-border-strong rounded-b-xl flex items-center justify-center p-2 min-h-[250px] max-h-[calc(85vh-45px)] ${
              isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
            }`}
            onClick={() => setIsZoomed(!isZoomed)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={image.name || 'Uploaded image'}
              className={`transition-all duration-200 rounded-lg object-contain ${
                isZoomed ? 'max-w-none scale-125 my-8' : 'max-h-[calc(80vh-60px)] w-auto max-w-full'
              }`}
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
