/**
 * Text Cleaning & Scanned Document Detection Utilities — Cognix
 * Source of truth: docs/ai/RAG.md
 */

export interface TextCleanResult {
  cleanedText: string;
  charCount: number;
  wordCount: number;
}

/**
 * Normalizes and cleans raw extracted text from PDF pages.
 * Preserves paragraph structure and meaningful sentence boundaries.
 */
export function cleanExtractedText(rawText: string): TextCleanResult {
  if (!rawText || typeof rawText !== 'string') {
    return { cleanedText: '', charCount: 0, wordCount: 0 };
  }

  let text = rawText;

  // 1. Replace Windows / old Mac line endings with standard UNIX newlines
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // 2. Remove null bytes and non-printable control characters (excluding \n, \t)
  text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // 3. Fix hyphenated line breaks (e.g., "transfor-\nmer" -> "transformer")
  text = text.replace(/(\w+)-\n(\w+)/g, '$1$2');

  // 4. Collapse horizontal whitespace (multiple spaces/tabs to single space)
  text = text.replace(/[ \t]+/g, ' ');

  // 5. Clean up weird line breaks inside paragraphs while preserving actual paragraph breaks (\n\n)
  // Split by double newlines (paragraphs), clean single newlines within each paragraph, and rejoin
  const paragraphs = text.split(/\n\s*\n/);
  const cleanedParagraphs = paragraphs
    .map((p) => {
      // Within a paragraph, replace single newlines that are not bullet lists with spaces
      const lines = p.split('\n').map((l) => l.trim()).filter(Boolean);
      return lines.join(' ');
    })
    .filter((p) => p.trim().length > 0);

  const cleanedText = cleanedParagraphs.join('\n\n').trim();
  const wordCount = cleanedText ? cleanedText.split(/\s+/).length : 0;

  return {
    cleanedText,
    charCount: cleanedText.length,
    wordCount,
  };
}

/**
 * Evaluates whether extracted document text represents a scanned/image-only PDF
 * or an unreadable document requiring OCR.
 */
export function isScannedOrEmptyPdf(
  pages: { pageNumber: number; text: string }[]
): { isScanned: boolean; reason?: string } {
  if (!pages || pages.length === 0) {
    return {
      isScanned: true,
      reason: 'No pages or text could be extracted from this PDF.',
    };
  }

  const totalRawLength = pages.reduce((acc, p) => acc + p.text.trim().length, 0);

  // Minimum threshold: average of at least 30 characters per document or 50 total chars
  if (totalRawLength < 50) {
    return {
      isScanned: true,
      reason:
        'This PDF appears to contain scanned pages. OCR support is not available yet.',
    };
  }

  // Check alphanumeric density
  const allText = pages.map((p) => p.text).join(' ');
  const alphaNumericMatches = allText.match(/[a-zA-Z0-9]/g);
  const alphaCount = alphaNumericMatches ? alphaNumericMatches.length : 0;

  if (alphaCount < 30 || alphaCount / totalRawLength < 0.2) {
    return {
      isScanned: true,
      reason:
        'This PDF appears to contain scanned pages or non-extractable glyphs. OCR support is not available yet.',
    };
  }

  return { isScanned: false };
}
