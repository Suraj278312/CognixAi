/**
 * Comprehensive Web Search Grounding Verification Test Suite — Cognix Phase 5
 */

import { validateSafeUrl, extractCleanDomain } from '../src/lib/utils/url-validator.js';
import { buildSystemInstruction } from '../src/lib/ai/prompt.js';

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAIL [Test ${totalTests}]: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  passedTests++;
  console.log(`✅ PASS [Test ${totalTests}]: ${message}`);
}

console.log('================================================================');
console.log(' COGNIX PHASE 5 — REAL-TIME WEB SEARCH & GROUNDING TESTS');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// Test 1: URL Validation & HTTPS Whitelist
// -----------------------------------------------------------------------------
console.log('--- 1. Safe URL Validation & Protocol Checks ---');
const validGoogle = validateSafeUrl('https://ai.google.dev/gemini-api/docs');
assert(validGoogle.isValid === true, 'Valid HTTPS URL must pass validation');
assert(validGoogle.domain === 'ai.google.dev', 'Domain must be ai.google.dev without path or params');

const validWww = validateSafeUrl('https://www.reuters.com/technology/ai-news');
assert(validWww.isValid === true, 'Valid www HTTPS URL must pass validation');
assert(validWww.domain === 'reuters.com', 'Leading www. must be stripped from domain');

// -----------------------------------------------------------------------------
// Test 2: Security Rejections (XSS & Unsafe Protocols)
// -----------------------------------------------------------------------------
console.log('\n--- 2. Security Rejections (XSS Defense & Malicious URLs) ---');
const jsInjection = validateSafeUrl('javascript:alert(document.cookie)');
assert(jsInjection.isValid === false, 'javascript: protocol must be strictly rejected');

const dataInjection = validateSafeUrl('data:text/html,<script>evil()</script>');
assert(dataInjection.isValid === false, 'data: protocol must be strictly rejected');

const fileInjection = validateSafeUrl('file:///etc/passwd');
assert(fileInjection.isValid === false, 'file: protocol must be strictly rejected');

const emptyUrl = validateSafeUrl('   ');
assert(emptyUrl.isValid === false, 'Empty URL string must be rejected');

const garbageUrl = validateSafeUrl('not a url at all');
assert(garbageUrl.isValid === false, 'Malformed string must be rejected');

// -----------------------------------------------------------------------------
// Test 3: Domain Extraction Fallbacks
// -----------------------------------------------------------------------------
console.log('\n--- 3. Clean Domain Extraction ---');
assert(extractCleanDomain('https://nytimes.com/tech') === 'nytimes.com', 'Clean domain extracted from standard URL');
assert(extractCleanDomain('https://sub.domain.co.uk/path') === 'sub.domain.co.uk', 'Multi-level domain extracted accurately');
assert(extractCleanDomain('invalid-protocol://foo') === 'Web Source', 'Invalid URL falls back to safe label');

// -----------------------------------------------------------------------------
// Test 4: Grounding Metadata Normalization & Source Deduplication
// -----------------------------------------------------------------------------
console.log('\n--- 4. Grounding Metadata Normalization ---');
const mockRawGroundingMetadata = {
  webSearchQueries: ['latest Gemini 2.0 release date', 'Google AI announcements'],
  groundingChunks: [
    {
      web: {
        uri: 'https://blog.google/technology/ai/gemini-2-announcement',
        title: 'Introducing Gemini 2.0: Our New AI Model',
      },
    },
    {
      web: {
        uri: 'https://blog.google/technology/ai/gemini-2-announcement', // Duplicate URL
        title: 'Introducing Gemini 2.0 Duplicate',
      },
    },
    {
      web: {
        uri: 'javascript:badCode()', // Unsafe URL
        title: 'Hacker Link',
      },
    },
    {
      web: {
        uri: 'https://techcrunch.com/2025/gemini-analysis',
        title: 'TechCrunch Gemini Review',
      },
    },
  ],
};

function normalizeMetadata(metadata) {
  const citations = [];
  const seenUrls = new Set();
  const queries = metadata.webSearchQueries || [];

  for (let i = 0; i < (metadata.groundingChunks || []).length; i++) {
    const chunk = metadata.groundingChunks[i];
    const web = chunk.web;
    if (!web || !web.uri) continue;

    const { isValid, sanitizedUrl, domain } = validateSafeUrl(web.uri);
    if (!isValid || seenUrls.has(sanitizedUrl)) continue;

    seenUrls.add(sanitizedUrl);
    citations.push({
      id: `web-source-${citations.length + 1}`,
      type: 'web',
      title: web.title || domain,
      url: sanitizedUrl,
      domain,
      searchQueries: queries,
      snippet: `Source from Google Search for: ${web.title}`,
    });
  }
  return citations;
}

const normalized = normalizeMetadata(mockRawGroundingMetadata);
assert(normalized.length === 2, 'Duplicate and unsafe URLs must be filtered out, leaving exactly 2 sources');
assert(normalized[0].domain === 'blog.google', 'First source domain must be blog.google');
assert(normalized[0].type === 'web', 'Citation type must be "web"');
assert(normalized[1].domain === 'techcrunch.com', 'Second source domain must be techcrunch.com');
assert(normalized[0].searchQueries.length === 2, 'Search queries must be preserved on citation');

// -----------------------------------------------------------------------------
// Test 5: System Prompt Web Search Grounding Directives
// -----------------------------------------------------------------------------
console.log('\n--- 5. System Prompt Grounding Directives ---');
const webPromptContext = {
  isWebSearchActive: true,
  userDisplayName: 'Alex',
};

const webInstruction = buildSystemInstruction(webPromptContext);
assert(webInstruction.includes('WEB SEARCH GROUNDING DIRECTIVES:'), 'System prompt must include Web Search Grounding directives');
assert(webInstruction.includes('Google Search grounding is active'), 'Directives must state search grounding is active');
assert(webInstruction.includes('Never fabricate URLs'), 'Directives must forbid fabricating URLs');
assert(webInstruction.includes('[1], [2]'), 'Directives must specify numbered reference brackets [1], [2]');

// -----------------------------------------------------------------------------
// Test 6: Hybrid Mode (PDF Context + Web Search) Prompt Assembly
// -----------------------------------------------------------------------------
console.log('\n--- 6. Hybrid Mode (PDF Context + Web Search) Prompt Assembly ---');
const hybridPromptContext = {
  isWebSearchActive: true,
  activeDocuments: [
    {
      title: 'Attention-Is-All-You-Need.pdf',
      relevantChunks: ['[Source Page 1]: The Transformer model architecture...'],
    },
  ],
};

const hybridInstruction = buildSystemInstruction(hybridPromptContext);
assert(hybridInstruction.includes('<attached_document_context>'), 'Hybrid prompt must include attached PDF document context');
assert(hybridInstruction.includes('DOCUMENT GROUNDING & EVIDENCE DIRECTIVES:'), 'Hybrid prompt must include PDF grounding directives');
assert(hybridInstruction.includes('WEB SEARCH GROUNDING DIRECTIVES:'), 'Hybrid prompt must simultaneously include Web search directives');

// -----------------------------------------------------------------------------
// Test 7: Inline Citation Regex Parsing
// -----------------------------------------------------------------------------
console.log('\n--- 7. Inline Citation Regex Parsing ---');
const sampleAnswer = 'Gemini 2.0 introduces multi-agent reasoning [1] and native multimodal output [2]. Compare this with the uploaded paper [Transformer-Architecture.pdf · p. 4].';

const citationRegex = /\[(\d+)\]|\[([^\]]+(?:\.pdf|\.PDF)[^\]]*[·,]\s*p\.?\s*(\d+))\]/g;
const matches = [];
let m;
while ((m = citationRegex.exec(sampleAnswer)) !== null) {
  matches.push({
    full: m[0],
    numbered: m[1],
    docLabel: m[2],
    pageNum: m[3],
  });
}

assert(matches.length === 3, 'Regex must extract all 3 citations (two web [1],[2] and one PDF document)');
assert(matches[0].numbered === '1', 'First match is numbered citation [1]');
assert(matches[1].numbered === '2', 'Second match is numbered citation [2]');
assert(matches[2].docLabel.includes('Transformer-Architecture.pdf'), 'Third match is document citation');
assert(matches[2].pageNum === '4', 'Third match page number is 4');

console.log('\n================================================================');
console.log(` ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY!`);
console.log('================================================================\n');
