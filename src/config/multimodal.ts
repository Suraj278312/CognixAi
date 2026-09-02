/**
 * Centralized Multimodal AI & Image Configuration — Cognix Phase 7
 * Source of truth: docs/ai/MULTIMODAL.md
 */

export const MULTIMODAL_CONFIG = {
  // Maximum allowed image upload size in Megabytes (Default: 10MB)
  maxImageSizeMb: Number(process.env.MAX_IMAGE_SIZE_MB) || 10,
  get maxImageSizeBytes(): number {
    return this.maxImageSizeMb * 1024 * 1024;
  },

  // Maximum number of images allowed in a single user message
  maxImagesPerMessage: Number(process.env.MAX_IMAGES_PER_MESSAGE) || 4,

  // Maximum number of recent images to keep in multi-turn conversation context
  maxImagesInContext: Number(process.env.MAX_IMAGES_IN_CONTEXT) || 4,

  // Supported image MIME types
  supportedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ] as const,

  // Supported image file extensions
  supportedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'] as const,
};
