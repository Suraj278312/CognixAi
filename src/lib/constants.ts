export const STARTER_PROMPTS = [
  {
    id: '1',
    title: 'Analyze a Document',
    description: 'Extract key findings, methodology, and citations from any PDF file',
    prompt: 'I have uploaded a PDF document. Can you provide an executive summary and extract the 3 key takeaways with page references?',
    category: 'documents',
    icon: 'FileText',
  },
  {
    id: '2',
    title: 'Debug a Function',
    description: 'Review TypeScript, Python, or SQL code and identify edge-case bugs',
    prompt: 'Here is a TypeScript async queue implementation. Can you analyze it for potential race conditions or unhandled rejections?',
    category: 'code',
    icon: 'Code2',
  },
  {
    id: '3',
    title: 'Grounded Web Research',
    description: 'Search the live web for verified facts, releases, and citations',
    prompt: 'Search the web for the latest developments in multimodal AI architectures this month and summarize them with citations.',
    category: 'search',
    icon: 'Globe',
  },
  {
    id: '4',
    title: 'Synthesize Architecture',
    description: 'Compare trade-offs between system designs and database schemas',
    prompt: 'Compare the trade-offs between an event-driven microservices architecture and a modular monolith for an early-stage startup.',
    category: 'architecture',
    icon: 'Cpu',
  },
];

export const SAMPLE_CONVERSATIONS = [
  {
    id: 'conv-1',
    userId: 'user-default',
    title: 'RAG Pipeline & Vector Chunking',
    lastMessageText: 'Chunking with 150-char sliding overlap ensures semantic continuity...',
    updatedAt: Date.now() - 1000 * 60 * 15, // 15 mins ago
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
    isPinned: true,
  },
  {
    id: 'conv-2',
    userId: 'user-default',
    title: 'Next.js App Router Architecture',
    lastMessageText: 'React Server Components allow keeping heavy parsers on the server...',
    updatedAt: Date.now() - 1000 * 60 * 60 * 4, // 4 hours ago
    createdAt: Date.now() - 1000 * 60 * 60 * 6,
  },
  {
    id: 'conv-3',
    userId: 'user-default',
    title: 'TypeScript Discriminated Unions',
    lastMessageText: 'Using discriminated unions eliminates disjoint boolean loading states...',
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 1.5, // Yesterday
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
  },
  {
    id: 'conv-4',
    userId: 'user-default',
    title: 'Google Gemini Multimodal Live API',
    lastMessageText: 'Bidirectional audio streaming provides sub-300ms speech-to-speech...',
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 4, // 4 days ago
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
  },
];

export const SAMPLE_MEMORIES = [
  {
    id: 'mem-1',
    userId: 'user-default',
    content: 'Prefers TypeScript strict mode examples with explicit interfaces over loose types.',
    category: 'technical' as const,
    confidence: 0.96,
    isEnabled: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
  },
  {
    id: 'mem-2',
    userId: 'user-default',
    content: 'Building full-stack AI applications with Next.js, Tailwind CSS, and Firebase.',
    category: 'work' as const,
    confidence: 0.94,
    isEnabled: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
  },
  {
    id: 'mem-3',
    userId: 'user-default',
    content: 'Values clean, calm, distraction-free user interfaces without neon cyberpunk aesthetics.',
    category: 'preference' as const,
    confidence: 0.91,
    isEnabled: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 8,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 8,
  },
];
