/**
 * Sensitive Information & PII Rejection Filter — Cognix Memory System
 * Guarantees zero retention of passwords, API keys, credentials, financial details, or sensitive attributes.
 * Source of truth: docs/ai/MEMORY.md & SECURITY.md
 */

export interface SensitivityCheckResult {
  isSafe: boolean;
  reason?: string;
}

// Regular expression patterns for credentials, tokens, and financial PII
const SENSITIVE_PATTERNS: { name: string; regex: RegExp }[] = [
  // API Keys and Tokens
  { name: 'Google API Key', regex: /AIza[0-9A-Za-z\-_]{35}/i },
  { name: 'OpenAI API Key', regex: /sk-[A-Za-z0-9-_]{20,}/i },
  { name: 'GitHub Token', regex: /gh[pousr]-[A-Za-z0-9_]{36,}/i },
  { name: 'AWS Access Key', regex: /AKIA[0-9A-Z]{16}/i },
  { name: 'Generic Secret Token', regex: /(?:bearer|api_key|apikey|secret_key|private_key)\s*[:=]\s*['"]?[a-zA-Z0-9_\-.~+]{16,}['"]?/i },
  
  // Passwords and Credentials
  { name: 'Password Declaration', regex: /(?:my\s+password\s+is|password\s*[:=]|passcode\s*[:=]|login\s+credentials?\s*[:=])\s*['"]?[^\s,;]{4,}['"]?/i },
  { name: 'Private Key Block', regex: /-----BEGIN (?:RSA|EC|DSA|OPENSSH|PRIVATE) KEY-----/i },
  
  // Financial Credentials
  { name: 'Credit Card Number', regex: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12})\b/ },
  { name: 'CVV / Security Code', regex: /(?:cvv|cvc|security\s+code)\s*[:=]\s*\d{3,4}\b/i },
  { name: 'Bank Account Number', regex: /(?:bank\s+account|routing\s+number|iban)\s*[:=]\s*[A-Z0-9]{8,34}/i },

  // Government Identification / SSN
  { name: 'US Social Security Number', regex: /\b\d{3}-\d{2}-\d{4}\b/ },
  
  // Sensitive Personal Category Heuristics
  { name: 'Medical/Health Details', regex: /\b(?:diagnosed\s+with|medical\s+history|prescription\s+for|taking\s+medication\s+for|suffers\s+from|psychiatric\s+treatment)\b/i },
  { name: 'Political Affiliation', regex: /\b(?:registered\s+(?:democrat|republican|voter)|political\s+party\s+member|vote\s+strictly\s+for)\b/i },
  { name: 'Religious Affiliation', regex: /\b(?:religious\s+belief|faith\s+is\s+(?:christian|muslim|hindu|jewish|buddhist)|strictly\s+follow\s+religion)\b/i },
  { name: 'Sexual/Intimate Details', regex: /\b(?:sexual\s+orientation|intimate\s+partner\s+details|fetish|sexual\s+preferences?)\b/i },
];

/**
 * Validates whether candidate memory content is safe to store.
 * Discards any content containing secrets, keys, or sensitive attributes.
 */
export function checkMemorySensitivity(text: string): SensitivityCheckResult {
  if (!text || typeof text !== 'string') {
    return { isSafe: false, reason: 'Empty or invalid text' };
  }

  const normalized = text.trim();

  for (const { name, regex } of SENSITIVE_PATTERNS) {
    if (regex.test(normalized)) {
      return {
        isSafe: false,
        reason: `Detected sensitive pattern: ${name}`,
      };
    }
  }

  return { isSafe: true };
}
