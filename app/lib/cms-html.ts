import sanitizeHtml from 'sanitize-html';

/**
 * Sanitize CMS-authored HTML on the server (no jsdom — works with Next.js + Turbopack).
 * Aligns with TipTap StarterKit output: paragraphs, headings, lists, links, quotes, inline marks.
 */
export function sanitizeCmsHtml(html: string): string {
  if (!html || typeof html !== 'string') return '';
  return sanitizeHtml(html, {
    allowedTags: [
      'p',
      'br',
      'strong',
      'b',
      'em',
      'i',
      's',
      'strike',
      'del',
      'u',
      'h1',
      'h2',
      'h3',
      'h4',
      'ul',
      'ol',
      'li',
      'blockquote',
      'a',
      'code',
      'pre',
      'hr',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowProtocolRelative: false,
  });
}
