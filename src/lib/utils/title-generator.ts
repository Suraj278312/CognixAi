/**
 * Deterministic Conversation Title Generator — Cognix
 * Converts initial user prompt into a concise, readable conversation title.
 */

export function generateConversationTitle(prompt: string): string {
  if (!prompt || typeof prompt !== 'string') return 'New Conversation';

  let cleaned = prompt.trim();

  // Strip common conversational preamble
  const preambles = [
    /^(can you|could you|please|kindly|help me|tell me|explain to me|what is|how do i|how to|write a|create a)\s+/i,
    /^(i want to|i need to|let's talk about|show me)\s+/i,
  ];

  for (const regex of preambles) {
    cleaned = cleaned.replace(regex, '');
  }

  // Remove trailing punctuation
  cleaned = cleaned.replace(/[?.!:]+$/, '').trim();

  if (!cleaned) return prompt.slice(0, 30).trim() || 'New Conversation';

  // Capitalize first letter of words (title case)
  const title = cleaned
    .split(/\s+/)
    .slice(0, 6) // Max 6 words
    .map((word) => {
      if (word.length === 0) return '';
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');

  return title.slice(0, 42).trim();
}
