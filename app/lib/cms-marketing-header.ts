import type { CmsHomeData, CmsMarketingHeader } from './cms-types';

export const DEFAULT_MARKETING_HEADER: CmsMarketingHeader = {
  logoImageUrl: '',
  logoAlt: 'Nordic Lux',
  tagline: '',
  showTagline: false,
  searchPlaceholderDesktop: '',
  searchPlaceholderMobile: '',
  showDesktopSearch: true,
  showMobileSearch: true,
  showWishlist: true,
  showAccount: true,
  layout: 'default',
};

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

/** If old `siteHeaderChrome` exists, pull tagline from first rich-text block once. */
function taglineFromLegacyHeaderChrome(stored: Partial<CmsHomeData> | null | undefined): string | undefined {
  const z = stored?.siteHeaderChrome;
  const first = z?.blocks?.[0];
  if (!first || first.type !== 'richtext') return undefined;
  if (first.html) {
    const m = first.html.match(/<strong[^>]*>([^<]*)<\/strong>/i);
    if (m?.[1]?.trim()) return m[1].trim();
    const plain = stripHtml(first.html);
    if (plain) return plain.split('\n')[0]?.trim();
  }
  const p = first.paragraphs?.[0]?.trim();
  return p || undefined;
}

export function mergeSiteMarketingHeader(stored: Partial<CmsHomeData> | null | undefined): CmsMarketingHeader {
  const base = { ...DEFAULT_MARKETING_HEADER };
  const legacyTagline = taglineFromLegacyHeaderChrome(stored);
  const h = stored?.siteMarketingHeader && typeof stored.siteMarketingHeader === 'object' ? stored.siteMarketingHeader : {};

  return {
    logoImageUrl: typeof h.logoImageUrl === 'string' ? h.logoImageUrl : base.logoImageUrl,
    logoAlt: typeof h.logoAlt === 'string' && h.logoAlt.trim() ? h.logoAlt.trim() : base.logoAlt,
    tagline:
      typeof h.tagline === 'string' && h.tagline.trim()
        ? h.tagline.trim()
        : legacyTagline ?? base.tagline,
    showTagline: h.showTagline !== false,
    searchPlaceholderDesktop:
      typeof h.searchPlaceholderDesktop === 'string' && h.searchPlaceholderDesktop.trim()
        ? h.searchPlaceholderDesktop.trim()
        : base.searchPlaceholderDesktop,
    searchPlaceholderMobile:
      typeof h.searchPlaceholderMobile === 'string' && h.searchPlaceholderMobile.trim()
        ? h.searchPlaceholderMobile.trim()
        : base.searchPlaceholderMobile,
    showDesktopSearch: h.showDesktopSearch !== false,
    showMobileSearch: h.showMobileSearch !== false,
    showWishlist: h.showWishlist !== false,
    showAccount: h.showAccount !== false,
    layout: h.layout === 'wide' ? 'wide' : 'default',
  };
}
