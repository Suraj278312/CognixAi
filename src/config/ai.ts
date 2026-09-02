/**
 * Centralized AI Model & Generation Configuration — Cognix
 * Source of truth: docs/ai/GEMINI.md
 */

export const AI_CONFIG = {
  // Default model configurable via environment variable
  defaultModel: process.env.AI_MODEL || process.env.DEFAULT_AI_MODEL || 'gemini-3.6-flash',
  
  // Generation parameters
  temperature: 0.7,
  maxOutputTokens: 4096,
  topP: 0.95,
  topK: 40,

  // Available models for selection across 3.6, 3.7, 2.0, 1.5, and latest tiers
  availableModels: [
    {
      id: 'gemini-3.6-flash',
      name: 'Gemini 3.6 Flash',
      description: 'Ultra-fast, highly responsive conversational model with low latency.',
      tier: 'fast',
      contextWindow: '1M tokens',
    },
    {
      id: 'gemini-3.7-flash',
      name: 'Gemini 3.7 Flash',
      description: 'High-performance Flash model with advanced multimodal reasoning.',
      tier: 'fast',
      contextWindow: '1M tokens',
    },
    {
      id: 'gemini-2.0-flash',
      name: 'Gemini 2.0 Flash',
      description: 'Next-generation multimodal model with real-time web search grounding.',
      tier: 'fast',
      contextWindow: '1M tokens',
    },
    {
      id: 'gemini-1.5-flash',
      name: 'Gemini 1.5 Flash',
      description: 'High-speed, efficient foundation model with generous free quotas.',
      tier: 'fast',
      contextWindow: '1M tokens',
    },
    {
      id: 'gemini-1.5-pro',
      name: 'Gemini 1.5 Pro',
      description: 'Deep reasoning and complex document synthesis for long-context tasks.',
      tier: 'pro',
      contextWindow: '2M tokens',
    },
    {
      id: 'gemini-flash-latest',
      name: 'Gemini Flash Latest',
      description: 'Latest standard Flash release for everyday assistant queries.',
      tier: 'fast',
      contextWindow: '1M tokens',
    },
    {
      id: 'gemini-pro-latest',
      name: 'Gemini Pro Latest',
      description: 'Flagship production model for complex analytical thinking.',
      tier: 'pro',
      contextWindow: '2M tokens',
    },
  ],
};
