import type { CmsHeaderNavTrackLink, CmsNavLink, CmsNavLinkVariant } from './cms-types';

const VARIANTS: CmsNavLinkVariant[] = ['default', 'emphasis', 'shop'];

export const DEFAULT_HEADER_NAV_TRACK_LINK: CmsHeaderNavTrackLink = {
  label: 'Track Your Order',
  href: '/track-order',
  enabled: true,
};

/** Default desktop/mobile header links (matches previous hard-coded navbar). */
export const DEFAULT_HEADER_NAV_LINKS: CmsNavLink[] = [
  { id: 'nav-shop', label: 'Shop', href: '/shop', enabled: true, variant: 'shop' },
  { id: 'nav-skincare', label: 'Skincare', href: '/#skincare-brands', enabled: true, variant: 'default' },
  {
    id: 'nav-makeup',
    label: 'Makeup & Perfumes',
    href: '/#makeup-perfumes',
    enabled: true,
    variant: 'default',
  },
  { id: 'nav-vitamins', label: 'Vitamins', href: '/#vitamins-minerals', enabled: true, variant: 'default' },
  {
    id: 'nav-healthy',
    label: 'Healthy Eating',
    href: '/#healthy-eating',
    enabled: true,
    variant: 'default',
  },
  { id: 'nav-chocolate', label: 'Chocolate', href: '/#chocolate', enabled: true, variant: 'default' },
  { id: 'nav-blog', label: 'Blog', href: '/blog', enabled: true, variant: 'default' },
  { id: 'nav-sale', label: 'Sale', href: '/#deals', enabled: true, variant: 'emphasis' },
];

export function mergeHeaderNavLinks(stored: CmsNavLink[] | undefined | null): CmsNavLink[] {
  if (stored === undefined || stored === null) {
    return DEFAULT_HEADER_NAV_LINKS.map((l) => ({ ...l }));
  }
  if (!Array.isArray(stored)) {
    return DEFAULT_HEADER_NAV_LINKS.map((l) => ({ ...l }));
  }
  const out: CmsNavLink[] = [];
  for (const item of stored) {
    const row = normalizeNavLink(item);
    if (row) out.push(row);
  }
  return out;
}

export function mergeHeaderNavTrackLink(
  stored: Partial<CmsHeaderNavTrackLink> | undefined | null
): CmsHeaderNavTrackLink {
  if (stored === undefined || stored === null || typeof stored !== 'object') {
    return { ...DEFAULT_HEADER_NAV_TRACK_LINK };
  }
  return {
    label: stored.label?.trim() || DEFAULT_HEADER_NAV_TRACK_LINK.label,
    href: stored.href?.trim() || DEFAULT_HEADER_NAV_TRACK_LINK.href,
    enabled: stored.enabled !== false,
  };
}

export function normalizeNavLink(raw: unknown): CmsNavLink | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id =
    typeof r.id === 'string' && r.id.trim() ? r.id.trim() : `nav-${Date.now()}`;
  const label = typeof r.label === 'string' && r.label.trim() ? r.label.trim() : 'Link';
  const href = typeof r.href === 'string' && r.href.trim() ? r.href.trim() : '/';
  const v = r.variant;
  const variant = VARIANTS.includes(v as CmsNavLinkVariant) ? (v as CmsNavLinkVariant) : 'default';
  return {
    id,
    label,
    href,
    enabled: r.enabled !== false,
    variant,
  };
}

export function newHeaderNavLink(): CmsNavLink {
  const id =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? `nav-${crypto.randomUUID()}`
      : `nav-${Date.now()}`;
  return { id, label: 'New link', href: '/', enabled: true, variant: 'default' };
}

/** Public URL path for a CMS marketing page: `/{slug}` (site domain + this path). */
export function cmsPagePublicPath(slug: string): string {
  const s = slug.trim().toLowerCase().replace(/\s+/g, '-');
  return s ? `/${s}` : '/';
}
