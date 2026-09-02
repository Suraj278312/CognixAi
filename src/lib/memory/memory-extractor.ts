/**
 * Memory Extraction & Intent Recognition Engine — Cognix Phase 6
 * Evaluates conversation turns, detects explicit memory commands, and extracts structured facts via Gemini.
 * Source of truth: docs/ai/MEMORY.md
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { AI_CONFIG } from '@/config/ai';
import { checkMemorySensitivity } from './sensitive-filter';
import type { MemoryCandidate, MemoryCategory } from '@/types/memory';

const VALID_CATEGORIES: MemoryCategory[] = [
  'profile',
  'preference',
  'goal',
  'project',
  'instruction',
  'skill',
  'interest',
  'context',
];

// Heuristic cues indicating user is sharing durable personal context
const MEMORY_SIGNAL_PATTERNS: RegExp[] = [
  /\b(?:i\s+prefer|i\s+like|i\s+love|i\s+always|i\s+usually|i\s+never)\b/i,
  /\b(?:i'm\s+working\s+on|i\s+am\s+working\s+on|my\s+project\s+is|building\s+(?:an?|the|my)?|developing|creating\s+a)\b/i,
  /\b(?:i'm\s+learning|i\s+am\s+learning|my\s+goal\s+is|trying\s+to\s+learn)\b/i,
  /\b(?:my\s+name\s+is|i\s+am\s+a\s+(?:developer|engineer|student|designer|manager|founder))\b/i,
  /\b(?:remember\s+that|don't\s+forget\s+that|please\s+remember|keep\s+in\s+mind\s+that)\b/i,
  /\b(?:from\s+now\s+on|always\s+respond\s+in|prefer\s+(?:concise|detailed|python|typescript|dark|light))\b/i,
  /\b(?:i\s+use\s+(?:mac|windows|linux|next\.?js|react|tailwind|vscode))\b/i,
  /\b(?:forget\s+that|forget\s+everything|don't\s+remember)\b/i,
];

/**
 * Fast client/server heuristic to determine if a message warrants memory extraction.
 */
export function hasMemorySignals(userMessage: string): boolean {
  if (!userMessage || userMessage.trim().length < 5) return false;
  const text = userMessage.trim();
  return MEMORY_SIGNAL_PATTERNS.some((pattern) => pattern.test(text));
}

/**
 * Recognizes explicit memory directives ("Remember that...", "Please remember...")
 */
export function detectExplicitMemory(userMessage: string): MemoryCandidate | null {
  const text = userMessage.trim();
  const explicitRegex = /(?:please\s+)?remember\s+(?:that\s+)?(.+)/i;
  const match = explicitRegex.exec(text);

  if (!match || !match[1]) return null;

  const rawFact = match[1].trim().replace(/[.!?]+$/, '');
  if (rawFact.length < 3) return null;

  // Run sensitivity check
  const safety = checkMemorySensitivity(rawFact);
  if (!safety.isSafe) return null;

  // Derive initial category heuristic
  let category: MemoryCategory = 'preference';
  if (/project|building|app|codebase|website/i.test(rawFact)) {
    category = 'project';
  } else if (/learning|goal|target|aim/i.test(rawFact)) {
    category = 'goal';
  } else if (/python|typescript|react|javascript|c\+\+|rust|coding|design/i.test(rawFact)) {
    category = 'skill';
  } else if (/name|i\s+am\s+a|job|role|profession/i.test(rawFact)) {
    category = 'profile';
  } else if (/always|never|rule|format/i.test(rawFact)) {
    category = 'instruction';
  }

  // Format fact into third-person neutral phrasing
  const content = rawFact.startsWith('I ') || rawFact.startsWith("I'm ")
    ? rawFact.replace(/^I\s+(?:am\s+)?/i, 'User is ').replace(/^I\s+prefer\s+/i, 'User prefers ')
    : rawFact;

  return {
    category,
    content,
    confidence: 1.0,
    source: 'explicit',
  };
}

/**
 * Recognizes natural-language forget requests ("Forget that I...", "Don't remember this")
 */
export function detectForgetIntent(userMessage: string): { isForget: boolean; topic?: string } {
  const text = userMessage.trim();
  const forgetRegex = /(?:please\s+)?forget\s+(?:that\s+)?(?:about\s+)?(.+)/i;
  const match = forgetRegex.exec(text);

  if (match && match[1]) {
    return {
      isForget: true,
      topic: match[1].trim().replace(/[.!?]+$/, ''),
    };
  }

  if (/don't\s+remember\s+(?:this|that)/i.test(text)) {
    return { isForget: true };
  }

  return { isForget: false };
}

const MEMORY_EXTRACTION_SYSTEM_PROMPT = `
You are the Cognix Memory Extraction Subsystem.
Your task is to analyze the conversation turn and extract ONLY genuinely useful, durable long-term facts or preferences about the user.

RULES:
1. Extract ONLY information that is durable and useful across future conversations (e.g. user preferences, goals, ongoing projects, skills, role, standing instructions).
2. DO NOT extract one-time queries, transient questions, temporary moods, conversational jokes, or general facts.
3. DO NOT store passwords, API keys, credentials, financial details, health/medical info, sexual orientation, political party, or religious beliefs. Discard any sensitive information immediately.
4. Keep memory statements concise, factual, and written from an objective perspective (e.g. "User is learning Python", "User prefers concise code examples").
5. Assign one of these categories: profile, preference, goal, project, instruction, skill, interest, context.
6. Assign a confidence score from 0.0 to 1.0.
7. Return strictly valid JSON conforming to the schema below. If there is nothing durable to remember, return {"memories": []}.
8. DO NOT extract long-term memories from visual observations, photos, or image descriptions unless the user explicitly stated a personal durable fact in text.

JSON SCHEMA:
{
  "memories": [
    {
      "category": "preference" | "profile" | "goal" | "project" | "instruction" | "skill" | "interest" | "context",
      "content": "string",
      "confidence": number
    }
  ]
}
`.trim();

/**
 * Extracts candidate long-term memories using Gemini model.
 */
export async function extractMemoryCandidates(
  turn: { userMessage: string; assistantResponse?: string },
  apiKey?: string
): Promise<MemoryCandidate[]> {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) return [];

  // Check for explicit memory directive first
  const explicit = detectExplicitMemory(turn.userMessage);
  if (explicit) {
    return [explicit];
  }

  // Pre-filter with heuristics
  if (!hasMemorySignals(turn.userMessage)) {
    return [];
  }

  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({
      model: AI_CONFIG.defaultModel || 'gemini-3.6-flash',
      systemInstruction: MEMORY_EXTRACTION_SYSTEM_PROMPT,
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1024,
        responseMimeType: 'application/json',
      },
    });

    const promptText = `User Message: "${turn.userMessage}"\nAssistant Response: "${turn.assistantResponse || ''}"`;
    const result = await model.generateContent(promptText);
    const responseText = result.response.text().trim();

    if (!responseText) return [];

    const parsed = JSON.parse(responseText);
    if (!parsed || !Array.isArray(parsed.memories)) return [];

    const validCandidates: MemoryCandidate[] = [];

    for (const mem of parsed.memories) {
      if (!mem.content || typeof mem.content !== 'string') continue;
      const content = mem.content.trim();
      if (content.length < 5) continue;

      const category: MemoryCategory = VALID_CATEGORIES.includes(mem.category)
        ? mem.category
        : 'preference';

      const confidence = typeof mem.confidence === 'number' ? mem.confidence : 0.8;

      // Enforce default confidence threshold (0.7) for automatically extracted memories
      if (confidence < 0.7) continue;

      // Enforce active sensitive data filtering
      const safety = checkMemorySensitivity(content);
      if (!safety.isSafe) continue;

      validCandidates.push({
        category,
        content,
        confidence,
        source: 'conversation',
      });
    }

    return validCandidates;
  } catch (error) {
    console.warn('Memory extraction failed gracefully:', error);
    return [];
  }
}
