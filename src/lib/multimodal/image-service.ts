/**
 * Image Service & Storage Orchestrator — Cognix Phase 7
 * Handles image validation, Firebase Storage uploads, base64 extraction, and dimension calculation.
 * Source of truth: docs/ai/MULTIMODAL.md & SECURITY.md
 */

import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase/client';
export { validateImageFile } from './image-validator';
import type { ImageAttachment } from '@/types/chat';

/**
 * Converts a File or Blob into a Base64 encoded string.
 */
export function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * Reads image width and height in the browser with safety timeout.
 */
export function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve({ width: 0, height: 0 });
      return;
    }

    try {
      const img = new Image();
      const url = URL.createObjectURL(file);

      const cleanup = () => {
        try {
          URL.revokeObjectURL(url);
        } catch {
          // Ignore revocation issues
        }
      };

      img.onload = () => {
        cleanup();
        resolve({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height });
      };

      img.onerror = () => {
        cleanup();
        resolve({ width: 0, height: 0 });
      };

      setTimeout(() => {
        cleanup();
        resolve({ width: 0, height: 0 });
      }, 1000);

      img.src = url;
    } catch {
      resolve({ width: 0, height: 0 });
    }
  });
}

/**
 * Uploads a user image to Firebase Storage with timeout protection.
 */
export async function uploadUserImage(
  userId: string,
  file: File,
  conversationId?: string
): Promise<ImageAttachment> {
  if (!userId) {
    throw new Error('User authentication is required to upload images.');
  }

  const mimeType = file.type || 'image/jpeg';
  const ext = file.name.split('.').pop() || 'jpg';
  const now = Date.now();
  const imageId = `img-${now}-${Math.random().toString(36).substring(2, 8)}`;
  const storagePath = `users/${userId}/images/${imageId}.${ext}`;

  // Read dimensions & Base64 representation in parallel
  const [dimensions, base64Data] = await Promise.all([
    getImageDimensions(file).catch(() => ({ width: 0, height: 0 })),
    fileToBase64(file),
  ]);

  let downloadUrl: string | undefined = undefined;

  // Background upload attempt to Firebase Storage with strict 5s timeout
  if (storage && typeof window !== 'undefined') {
    try {
      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: mimeType,
        customMetadata: {
          userId,
          originalName: file.name,
          conversationId: conversationId || '',
        },
      });

      await Promise.race([
        new Promise<void>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            undefined,
            (err: Error) => reject(err),
            () => resolve()
          );
        }),
        new Promise<void>((_, reject) =>
          setTimeout(() => reject(new Error('Storage upload timeout')), 5000)
        ),
      ]);

      downloadUrl = await Promise.race([
        getDownloadURL(storageRef),
        new Promise<string>((_, reject) =>
          setTimeout(() => reject(new Error('getDownloadURL timeout')), 3000)
        ),
      ]);
    } catch (err) {
      console.warn('Firebase Storage upload notice (falling back to base64):', err);
    }
  }

  return {
    id: imageId,
    userId,
    conversationId,
    name: file.name,
    storagePath,
    mimeType,
    sizeBytes: file.size,
    width: dimensions.width || undefined,
    height: dimensions.height || undefined,
    url: downloadUrl || base64Data,
    base64Data,
    createdAt: now,
  };
}

/**
 * Deletes an image from Firebase Storage.
 */
export async function deleteUserImage(
  userId: string,
  storagePath: string
): Promise<boolean> {
  if (!userId || !storagePath) return false;

  if (!storagePath.startsWith(`users/${userId}/`)) {
    throw new Error('Access denied: Cannot delete an image belonging to another user.');
  }

  if (storage && typeof window !== 'undefined') {
    try {
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);
      return true;
    } catch (err) {
      console.warn('Failed to delete image from Firebase Storage:', err);
      return false;
    }
  }

  return true;
}
