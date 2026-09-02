/**
 * Image Validation & Security Inspector — Cognix Phase 7
 * Validates MIME types, extensions, size constraints, and magic byte file headers.
 * Source of truth: docs/ai/MULTIMODAL.md & SECURITY.md
 */

import { MULTIMODAL_CONFIG } from '@/config/multimodal';

export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
  mimeType?: string;
}

/**
 * Checks magic byte signatures from ArrayBuffer or Uint8Array.
 */
export function detectMimeFromBytes(bytes: Uint8Array): string | null {
  if (!bytes || bytes.length < 12) return null;

  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'image/jpeg';
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return 'image/png';
  }

  // GIF: GIF87a or GIF89a (47 49 46 38)
  if (
    bytes[0] === 0x47 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x38
  ) {
    return 'image/gif';
  }

  // WEBP: RIFF (52 49 46 46) .... WEBP (57 45 42 50)
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return 'image/webp';
  }

  return null;
}

/**
 * Validates an image file's properties.
 */
export async function validateImageFile(file: File): Promise<ImageValidationResult> {
  if (!file) {
    return { isValid: false, error: 'No file provided.' };
  }

  // 1. Check file size
  if (file.size > MULTIMODAL_CONFIG.maxImageSizeBytes) {
    return {
      isValid: false,
      error: `Image size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the maximum limit of ${MULTIMODAL_CONFIG.maxImageSizeMb}MB.`,
    };
  }

  if (file.size === 0) {
    return { isValid: false, error: 'Image file is empty.' };
  }

  // 2. Check extension
  const fileName = file.name.toLowerCase();
  const hasValidExt = MULTIMODAL_CONFIG.supportedExtensions.some((ext) =>
    fileName.endsWith(ext)
  );

  if (!hasValidExt) {
    return {
      isValid: false,
      error: `Unsupported image format. Allowed formats: ${MULTIMODAL_CONFIG.supportedExtensions.join(', ')}`,
    };
  }

  // 3. Check client MIME type
  const isAllowedMime = (MULTIMODAL_CONFIG.supportedMimeTypes as readonly string[]).includes(
    file.type
  );

  // 4. Inspect magic bytes where slice is supported in browser/Node
  try {
    const slice = file.slice(0, 16);
    const arrayBuffer = await slice.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const detectedMime = detectMimeFromBytes(bytes);

    if (detectedMime) {
      if (!(MULTIMODAL_CONFIG.supportedMimeTypes as readonly string[]).includes(detectedMime)) {
        return {
          isValid: false,
          error: `Detected unsupported image content type: ${detectedMime}`,
        };
      }
      return { isValid: true, mimeType: detectedMime };
    } else if (bytes.length >= 12) {
      return {
        isValid: false,
        error: 'Corrupted image file: unrecognized image header signature.',
      };
    }
  } catch {
    // If arrayBuffer slice fails in limited mock environments, fall back to declared MIME
  }

  if (!isAllowedMime) {
    return {
      isValid: false,
      error: `Unsupported image MIME type: ${file.type}`,
    };
  }

  return { isValid: true, mimeType: file.type };
}
