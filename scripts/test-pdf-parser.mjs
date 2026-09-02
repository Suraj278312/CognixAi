/**
 * PDF Parser End-to-End Test — Cognix Phase 4
 */

import { parsePdfBuffer } from '../src/lib/rag/pdf-parser.js';

async function runPdfTest() {
  console.log('Testing PDF Parsing...');

  // 1. Test Magic Check with invalid data
  try {
    await parsePdfBuffer(Buffer.from('not a pdf at all'));
    console.error('❌ Failed: Should have rejected non-PDF buffer');
    process.exit(1);
  } catch (err) {
    console.log('✅ PASS: Rejected non-PDF buffer accurately:', err.message);
  }

  // 2. Test valid minimal PDF
  const minimalPdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources 4 0 R /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >>
endobj
5 0 obj
<< /Length 73 >>
stream
BT
/F1 12 Tf
72 712 Td
(Attention mechanisms in deep neural networks allow selective focus on key tokens.) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000214 00000 n 
0000000293 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
416
%%EOF`;

  try {
    const result = await parsePdfBuffer(Buffer.from(minimalPdf));
    console.log('✅ PASS: Parsed valid PDF successfully!');
    console.log(`- Page Count: ${result.pageCount}`);
    console.log(`- Total Text Length: ${result.totalTextLength} characters`);
    console.log(`- Page 1 Sample: "${result.pages[0]?.text.trim()}"`);
    if (!result.pages[0]?.text.includes('Attention mechanisms')) {
      throw new Error('Extracted text does not match source content');
    }
  } catch (err) {
    console.error('❌ PDF parse error:', err);
    process.exit(1);
  }

  console.log('\n✅ ALL PDF PARSER TESTS COMPLETED SUCCESSFULLY!');
}

runPdfTest();
