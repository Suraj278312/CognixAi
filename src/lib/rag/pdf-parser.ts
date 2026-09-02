/**
 * Server-Side PDF Text & Page Extraction Service — Cognix
 * Supports both modern class and legacy function PDF parser APIs.
 * Source of truth: docs/ai/RAG.md
 */

import { isScannedOrEmptyPdf } from './text-cleaner';
import type { ExtractedPage } from './chunker';

export interface ParsePdfResult {
  pageCount: number;
  pages: ExtractedPage[];
  totalTextLength: number;
  info?: Record<string, unknown>;
}

/**
 * Parses a raw PDF buffer into structured page texts, preserving page numbers.
 * Validates against empty and scanned PDFs.
 */
export async function parsePdfBuffer(buffer: Buffer | Uint8Array): Promise<ParsePdfResult> {
  if (!buffer || buffer.length === 0) {
    throw new Error('PDF buffer is empty or corrupted.');
  }

  // Magic byte check for PDF (%PDF-)
  const magic = Buffer.from(buffer.slice(0, 5)).toString('ascii');
  if (!magic.startsWith('%PDF')) {
    throw new Error('Invalid file format. The uploaded file is not a valid PDF document.');
  }

  const pages: ExtractedPage[] = [];
  let pageCount = 1;
  let parsedInfo: Record<string, unknown> | undefined = undefined;

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
    const pdfModule = require('pdf-parse');

    // 1. Check for Modern class API: new pdfModule.PDFParse({ data: buffer })
    if (pdfModule && (pdfModule.PDFParse || typeof pdfModule === 'function')) {
      const PDFParserClass = pdfModule.PDFParse || pdfModule;
      if (typeof PDFParserClass === 'function' && PDFParserClass.prototype?.load) {
        const instance = new PDFParserClass({ data: buffer });
        try {
          await instance.load();
          const infoResult = await instance.getInfo();
          parsedInfo = (infoResult?.info || infoResult) as Record<string, unknown>;
          const textResult = await instance.getText();

          if (textResult?.pages && Array.isArray(textResult.pages)) {
            pageCount = textResult.total || textResult.pages.length;
            for (const p of textResult.pages) {
              pages.push({
                pageNumber: typeof p.num === 'number' ? p.num : pages.length + 1,
                text: p.text || '',
              });
            }
          } else if (textResult?.text) {
            pages.push({
              pageNumber: 1,
              text: textResult.text,
            });
          }
        } finally {
          if (typeof instance.destroy === 'function') {
            await instance.destroy().catch(() => {});
          }
        }
      }
    }

    // 2. Fallback to function API: pdfModule(buffer, options)
    if (pages.length === 0) {
      const parseFn = typeof pdfModule === 'function' ? pdfModule : pdfModule?.default;
      if (typeof parseFn === 'function') {
        const data = await parseFn(buffer, {
          pagerender: async function (pageData: {
            getTextContent: () => Promise<{
              items: Array<{ str: string; transform: number[] }>;
            }>;
            pageIndex: number;
            pageNumber: number;
          }) {
            const textContent = await pageData.getTextContent();
            let pageText = '';
            let lastY: number | undefined;

            for (const item of textContent.items) {
              if (lastY === undefined || lastY === item.transform[5]) {
                pageText += item.str;
              } else {
                pageText += '\n' + item.str;
              }
              lastY = item.transform[5];
            }

            const pageNum =
              typeof pageData.pageIndex === 'number'
                ? pageData.pageIndex + 1
                : pageData.pageNumber || pages.length + 1;

            pages.push({
              pageNumber: pageNum,
              text: pageText,
            });

            return pageText;
          },
        });

        if (pages.length === 0 && data?.text) {
          pages.push({
            pageNumber: 1,
            text: data.text,
          });
        }
        pageCount = data?.numpages || pages.length;
      }
    }

    // Sort pages by pageNumber ascending
    pages.sort((a, b) => a.pageNumber - b.pageNumber);

    // Validate for scanned or empty pages
    const scanCheck = isScannedOrEmptyPdf(pages);
    if (scanCheck.isScanned) {
      throw new Error(
        scanCheck.reason ||
          'This PDF appears to contain scanned pages. OCR support is not available yet.'
      );
    }

    const totalTextLength = pages.reduce((acc, p) => acc + p.text.length, 0);

    return {
      pageCount: Math.max(pageCount, pages.length),
      pages,
      totalTextLength,
      info: parsedInfo,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('scanned') || msg.includes('OCR')) {
      throw error;
    }
    if (msg.includes('Invalid PDF') || msg.includes('corrupted') || msg.includes('bad XRef')) {
      throw new Error('Invalid or corrupted PDF file. Please ensure the file is a standard PDF.');
    }
    throw new Error(`PDF Parsing failed: ${msg}`);
  }
}
