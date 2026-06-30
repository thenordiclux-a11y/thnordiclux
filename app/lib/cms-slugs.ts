const RESERVED = new Set([
  'admin',
  'api',
  'shop',
  'blog',
  'checkout',
  'product',
  'track-order',
  'login',
  'pages',
  '_next',
  'favicon.ico',
  'icon.png',
]);

export function isReservedCmsPageSlug(slug: string): boolean {
  const s = slug.trim().toLowerCase();
  return RESERVED.has(s) || s.startsWith('_');
}
