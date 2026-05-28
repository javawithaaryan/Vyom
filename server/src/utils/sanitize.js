/**
 * Strip HTML tags and normalize whitespace for user-provided text.
 */
export function sanitizeText(input, maxLength = 5000) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .trim()
    .slice(0, maxLength);
}
