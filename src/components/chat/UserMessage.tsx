'use client';

import React, { useState } from 'react';
import { ImageLightbox } from '@/components/chat/ImageLightbox';
import type { Message, ImageAttachment } from '@/types/chat';

interface UserMessageProps {
  message: Message;
}

export function UserMessage({ message }: UserMessageProps) {
  const [selectedImage, setSelectedImage] = useState<ImageAttachment | null>(null);

  const images = message.images || [];

  return (
    <>
      <div className="flex justify-end my-4 select-text">
        <div className="max-w-xl bg-surface-2 border border-border-strong text-foreground rounded-2xl rounded-tr-md px-4 py-2.5 shadow-xs space-y-2.5">
          {/* Attached Images Grid */}
          {images.length > 0 && (
            <div
              className={`grid gap-2 ${
                images.length === 1
                  ? 'grid-cols-1'
                  : images.length === 2
                  ? 'grid-cols-2'
                  : 'grid-cols-2 sm:grid-cols-3'
              }`}
            >
              {images.map((img) => {
                const src = img.url || img.base64Data || '';
                return (
                  <div
                    key={img.id}
                    onClick={() => setSelectedImage(img)}
                    className="group relative rounded-xl overflow-hidden bg-surface-3 border border-border-subtle cursor-pointer hover:border-brand/50 transition-all aspect-video max-h-48"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={img.name || 'Uploaded image'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-end p-1.5 opacity-0 group-hover:opacity-100">
                      <span className="text-[10px] text-white/90 bg-black/60 backdrop-blur-xs px-1.5 py-0.5 rounded truncate max-w-full">
                        {img.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Text Content */}
          {message.content && (
            <p className="text-[14px] leading-relaxed whitespace-pre-wrap font-sans">
              {message.content}
            </p>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <ImageLightbox image={selectedImage} onClose={() => setSelectedImage(null)} />
      )}
    </>
  );
}
