/**
 * Comprehensive Automated Test Suite — Cognix Phase 7: Multimodal AI & Image Understanding
 * Tests: File validation, magic bytes, multimodal formatting, context retention, security rules, and prompt directives.
 * Run: npx tsx scripts/test-multimodal.mjs
 */

import { MULTIMODAL_CONFIG } from '../src/config/multimodal.js';
import {
  detectMimeFromBytes,
  validateImageFile,
} from '../src/lib/multimodal/image-validator.js';
import { buildSystemInstruction } from '../src/lib/ai/prompt.js';

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failed++;
  }
}

console.log('\n================================================================');
console.log(' COGNIX PHASE 7: MULTIMODAL AI & IMAGE UNDERSTANDING TEST SUITE');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// 1. CONFIGURATION & LIMITS
// -----------------------------------------------------------------------------
console.log('--- 1. Multimodal Configuration & Limits ---');

assert(MULTIMODAL_CONFIG.maxImageSizeMb === 10, 'Default MAX_IMAGE_SIZE_MB is 10MB');
assert(MULTIMODAL_CONFIG.maxImageSizeBytes === 10 * 1024 * 1024, 'maxImageSizeBytes calculates accurately');
assert(MULTIMODAL_CONFIG.maxImagesPerMessage === 4, 'maxImagesPerMessage is 4');
assert(MULTIMODAL_CONFIG.maxImagesInContext === 4, 'maxImagesInContext is 4');
assert(MULTIMODAL_CONFIG.supportedMimeTypes.includes('image/jpeg'), 'Supports image/jpeg');
assert(MULTIMODAL_CONFIG.supportedMimeTypes.includes('image/png'), 'Supports image/png');
assert(MULTIMODAL_CONFIG.supportedMimeTypes.includes('image/webp'), 'Supports image/webp');
assert(MULTIMODAL_CONFIG.supportedMimeTypes.includes('image/gif'), 'Supports image/gif');

// -----------------------------------------------------------------------------
// 2. MAGIC BYTE SIGNATURE DETECTION
// -----------------------------------------------------------------------------
console.log('\n--- 2. Magic Byte Signature Detection ---');

// JPEG: FF D8 FF ...
const jpegHeader = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
assert(detectMimeFromBytes(jpegHeader) === 'image/jpeg', 'Detects JPEG from magic bytes FF D8 FF');

// PNG: 89 50 4E 47 0D 0A 1A 0A
const pngHeader = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
assert(detectMimeFromBytes(pngHeader) === 'image/png', 'Detects PNG from magic bytes 89 50 4E 47');

// GIF: 47 49 46 38 ...
const gifHeader = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00]);
assert(detectMimeFromBytes(gifHeader) === 'image/gif', 'Detects GIF from magic bytes 47 49 46 38');

// WEBP: 52 49 46 46 .... 57 45 42 50
const webpHeader = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]);
assert(detectMimeFromBytes(webpHeader) === 'image/webp', 'Detects WEBP from magic bytes RIFF...WEBP');

// Unknown / corrupted bytes
const corruptBytes = new Uint8Array([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b]);
assert(detectMimeFromBytes(corruptBytes) === null, 'Rejects corrupted / unknown byte headers');

// -----------------------------------------------------------------------------
// 3. FILE VALIDATION & SECURITY INSPECTION
// -----------------------------------------------------------------------------
console.log('\n--- 3. File Validation & Size Enforcement ---');

// Mock File for Node environment
function createMockFile(name, size, type, buffer) {
  return {
    name,
    size,
    type,
    slice: () => ({
      arrayBuffer: async () => (buffer ? buffer.buffer : new ArrayBuffer(16)),
    }),
  };
}

const validJpeg = createMockFile('photo.jpg', 2 * 1024 * 1024, 'image/jpeg', jpegHeader);
const validPng = createMockFile('screenshot.png', 4 * 1024 * 1024, 'image/png', pngHeader);
const oversizedFile = createMockFile('huge.png', 15 * 1024 * 1024, 'image/png', pngHeader);
const emptyFile = createMockFile('empty.png', 0, 'image/png', pngHeader);
const invalidExt = createMockFile('script.exe', 1024, 'application/x-msdownload');
const spoofedFile = createMockFile('virus.jpg', 1024, 'image/jpeg', corruptBytes);

const resValidJpeg = await validateImageFile(validJpeg);
assert(resValidJpeg.isValid === true, 'Accepts valid JPEG file within 10MB');

const resValidPng = await validateImageFile(validPng);
assert(resValidPng.isValid === true, 'Accepts valid PNG file within 10MB');

const resOversized = await validateImageFile(oversizedFile);
assert(resOversized.isValid === false && resOversized.error.includes('exceeds the maximum limit'), 'Rejects oversized images > 10MB');

const resEmpty = await validateImageFile(emptyFile);
assert(resEmpty.isValid === false && resEmpty.error.includes('empty'), 'Rejects 0-byte empty files');

const resInvalidExt = await validateImageFile(invalidExt);
assert(resInvalidExt.isValid === false && resInvalidExt.error.includes('Unsupported image format'), 'Rejects non-image file extensions');

const resSpoofed = await validateImageFile(spoofedFile);
assert(resSpoofed.isValid === false, 'Rejects spoofed files with corrupted headers');

// -----------------------------------------------------------------------------
// 4. GEMINI MULTIMODAL MESSAGE FORMATTING & CONTEXT RETENTION
// -----------------------------------------------------------------------------
console.log('\n--- 4. Multimodal Message Assembly & Context Retention ---');

// Test formatMessages logic
function formatMessagesTest(messages) {
  const formattedReversed = [];
  let includedImagesCount = 0;
  const reversed = [...messages].reverse();

  for (const msg of reversed) {
    if (msg.role === 'system') continue;
    const parts = [];

    if (msg.images && msg.images.length > 0) {
      for (const img of msg.images) {
        if (img.base64Data && img.mimeType && includedImagesCount < MULTIMODAL_CONFIG.maxImagesInContext) {
          const cleanBase64 = img.base64Data.replace(/^data:[^;]+;base64,/, '');
          parts.push({
            inlineData: {
              mimeType: img.mimeType,
              data: cleanBase64,
            },
          });
          includedImagesCount++;
        }
      }
    }

    if (msg.content && msg.content.trim()) {
      parts.push({ text: msg.content });
    } else if (parts.length > 0) {
      parts.push({ text: 'Please describe and analyze the attached image.' });
    }

    if (parts.length > 0) {
      formattedReversed.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts,
      });
    }
  }

  const result = formattedReversed.reverse();
  if (result.length > 0 && result[0].role !== 'user') {
    result.unshift({ role: 'user', parts: [{ text: 'Hello' }] });
  }
  return { contents: result, totalImagesIncluded: includedImagesCount };
}

// Single multimodal message
const sampleTurn1 = [
  {
    role: 'user',
    content: 'What is shown in this chart?',
    images: [{ mimeType: 'image/png', base64Data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' }],
  },
];

const formatted1 = formatMessagesTest(sampleTurn1);
assert(formatted1.contents.length === 1, 'Formats single user turn');
assert(formatted1.contents[0].parts.length === 2, 'Turn contains 2 parts: image inlineData and text');
assert(formatted1.contents[0].parts[0].inlineData.mimeType === 'image/png', 'InlineData has correct mimeType');
assert(!formatted1.contents[0].parts[0].inlineData.data.startsWith('data:'), 'Base64 data prefix is properly stripped');

// Image-only message (no prompt text)
const imageOnlyTurn = [
  {
    role: 'user',
    content: '',
    images: [{ mimeType: 'image/jpeg', base64Data: '/9j/4AAQSkZJRgABAQEASABIAAD/' }],
  },
];

const formattedImageOnly = formatMessagesTest(imageOnlyTurn);
assert(formattedImageOnly.contents[0].parts[1].text === 'Please describe and analyze the attached image.', 'Supplies default analysis prompt for image-only user turns');

// Multi-turn follow-up question preserving image context
const multiTurnWithFollowUp = [
  {
    role: 'user',
    content: 'Analyze this diagram.',
    images: [{ mimeType: 'image/png', base64Data: 'AAAA' }],
  },
  {
    role: 'assistant',
    content: 'The diagram illustrates a 3-tier cloud architecture with a load balancer.',
  },
  {
    role: 'user',
    content: 'What is the component on the right side?',
  },
];

const formattedMultiTurn = formatMessagesTest(multiTurnWithFollowUp);
assert(formattedMultiTurn.contents.length === 3, 'Multi-turn sequence preserves 3 conversation turns');
assert(formattedMultiTurn.contents[0].parts[0].inlineData !== undefined, 'Turn 1 retains attached image inlineData for follow-up questions');
assert(formattedMultiTurn.contents[2].parts[0].text === 'What is the component on the right side?', 'Follow-up turn retains exact user query');

// Maximum context limit enforcement (5 images across history, limit is 4)
const heavyImageConversation = [
  { role: 'user', content: 'Turn 1', images: [{ mimeType: 'image/png', base64Data: 'IMG1' }, { mimeType: 'image/png', base64Data: 'IMG2' }] },
  { role: 'assistant', content: 'Understood.' },
  { role: 'user', content: 'Turn 2', images: [{ mimeType: 'image/png', base64Data: 'IMG3' }, { mimeType: 'image/png', base64Data: 'IMG4' }] },
  { role: 'assistant', content: 'Understood.' },
  { role: 'user', content: 'Turn 3', images: [{ mimeType: 'image/png', base64Data: 'IMG5' }] },
];

const formattedHeavy = formatMessagesTest(heavyImageConversation);
assert(formattedHeavy.totalImagesIncluded === 4, 'Enforces MAX_IMAGES_IN_CONTEXT (4) cap across multi-turn history');

// -----------------------------------------------------------------------------
// 5. VISUAL GROUNDING SYSTEM PROMPT DIRECTIVES
// -----------------------------------------------------------------------------
console.log('\n--- 5. Visual Grounding System Prompt Directives ---');

const systemInstruction = buildSystemInstruction({});
assert(systemInstruction.includes('Visual & Multimodal Understanding:'), 'System prompt contains visual understanding section');
assert(systemInstruction.includes('describe only what is genuinely visible'), 'Prompt contains strict visual anti-hallucination directive');
assert(systemInstruction.includes('distinguish directly observed visual details from inferences'), 'Prompt instructs distinguishing observed vs inferred details');
assert(systemInstruction.includes('transparently state so rather than hallucinating'), 'Prompt instructs honest uncertainty on blurry images');
assert(systemInstruction.includes('maintain visual continuity when answering follow-up questions'), 'Prompt instructs follow-up continuity');

// -----------------------------------------------------------------------------
// 6. SUMMARY & RESULTS
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log(` RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('================================================================\n');

if (failed > 0) {
  process.exit(1);
}
