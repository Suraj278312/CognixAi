/**
 * URL Validation & Domain Sanitization Utility — Cognix
 * Ensures zero unsafe protocol execution (XSS defense) and clean domain extraction.
 * Source of truth: docs/ai/WEB_SEARCH.md
 */

export interface ValidatedUrlResult {
  isValid: boolean;
  sanitizedUrl: string;
  domain: string;
}

const ALLOWED_PROTOCOLS = new Set(['https:', 'http:']);
const DISALLOWED_PROTOCOLS = new Set(['javascript:', 'data:', 'file:', 'vbscript:', 'blob:']);

/**
 * Validates whether a given URL string is safe to render and click.
 * Strictly enforces HTTPS/HTTP protocols and extracts a clean display domain.
 */
export function validateSafeUrl(rawUrl?: string | null): ValidatedUrlResult {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { isValid: false, sanitizedUrl: '', domain: '' };
  }

  const trimmed = rawUrl.trim();

  // Explicit check against malicious protocol strings
  const lower = trimmed.toLowerCase();
  for (const protocol of DISALLOWED_PROTOCOLS) {
    if (lower.startsWith(protocol)) {
      return { isValid: false, sanitizedUrl: '', domain: '' };
    }
  }

  try {
    const parsed = new URL(trimmed);

    if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
      return { isValid: false, sanitizedUrl: '', domain: '' };
    }

    // Extract clean hostname without www.
    let domain = parsed.hostname.toLowerCase();
    if (domain.startsWith('www.')) {
      domain = domain.slice(4);
    }

    // Must have a valid TLD or valid domain structure
    if (!domain || !domain.includes('.')) {
      return { isValid: false, sanitizedUrl: '', domain: '' };
    }

    return {
      isValid: true,
      sanitizedUrl: parsed.href,
      domain,
    };
  } catch {
    return { isValid: false, sanitizedUrl: '', domain: '' };
  }
}

/**
 * Safely extracts domain name from a URL, falling back to a clean label.
 */
export function extractCleanDomain(url?: string | null, fallback = 'Web Source'): string {
  const result = validateSafeUrl(url);
  return result.isValid ? result.domain : fallback;
}
