/** Escape text for safe insertion into HTML paragraphs. */
export function escapeHtmlText(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Legacy plain paragraphs → HTML for the rich editor. */
export function richtextParagraphsToHtml(paragraphs: string[]): string {
  const ps = (paragraphs ?? []).map((p) => p.trim()).filter(Boolean);
  if (ps.length === 0) return '<p></p>';
  return ps.map((p) => `<p>${escapeHtmlText(p)}</p>`).join('');
}

/** Prefer stored HTML; fall back to paragraphs. */
export function resolveRichtextHtml(block: { html?: string; paragraphs?: string[] }): string {
  const h = block.html?.trim();
  if (h) return h;
  return richtextParagraphsToHtml(block.paragraphs ?? []);
}

/** Rough plain-text fallback from HTML for legacy `paragraphs` field. */
export function htmlToFallbackParagraphs(html: string): string[] {
  const withBreaks = html
    .replace(/<\/p>\s*/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(div|h[1-6]|li|blockquote)>/gi, '\n\n');
  const stripped = withBreaks.replace(/<[^>]+>/g, '').trim();
  if (!stripped) return [''];
  const parts = stripped
    .split(/\n\n+/)
    .map((s) => s.replace(/\n+/g, ' ').trim())
    .filter(Boolean);
  return parts.length ? parts : [''];
}
