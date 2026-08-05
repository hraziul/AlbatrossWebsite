import type { TemplateId, TemplateCopy } from './copySchemas';
import type { BusinessInfo } from './businessStorage';

const GENERIC_ERROR_MESSAGE = 'AI personalization temporarily unavailable.';

function isStringField(value: unknown): value is string {
  return typeof value === 'string';
}

// Runtime shape-check for the AI-generated copy payload. `body.copy` comes
// straight from an external API response with only a `as TemplateCopy`
// assertion otherwise standing between it and React state — a malformed
// shape (missing field, `services` not an array) would previously propagate
// straight into `copy.services.map(...)` and white-screen the page with no
// error boundary anywhere in the tree. This is checked before the value is
// ever handed back to a caller.
export function isValidTemplateCopy(value: unknown): value is TemplateCopy {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;

  const stringFields: Array<keyof TemplateCopy> = [
    'headline',
    'subheadline',
    'aboutTitle',
    'aboutBody',
    'ctaLabel',
    'ctaSubtext',
    'footerTagline',
  ];
  if (!stringFields.every((field) => isStringField(candidate[field]))) return false;

  if (!Array.isArray(candidate.services)) return false;
  return candidate.services.every(
    (item) =>
      item &&
      typeof item === 'object' &&
      isStringField((item as Record<string, unknown>).title) &&
      isStringField((item as Record<string, unknown>).description),
  );
}

export async function fetchPersonalizedCopy(
  templateId: TemplateId,
  business: BusinessInfo,
  fetchImpl: typeof fetch = fetch,
): Promise<TemplateCopy> {
  const res = await fetchImpl('/api/sites-personalize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ templateId, companyName: business.companyName, blurb: business.blurb }),
  });

  if (!res.ok) {
    let message = GENERIC_ERROR_MESSAGE;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // Response wasn't JSON — keep the generic message.
    }
    throw new Error(message);
  }

  const body = await res.json();
  if (!isValidTemplateCopy(body?.copy)) {
    throw new Error(GENERIC_ERROR_MESSAGE);
  }
  return body.copy;
}
