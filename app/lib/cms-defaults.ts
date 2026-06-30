import type {
  CmsContentBlock,
  CmsHomeBrandItem,
  CmsHomeData,
  CmsHomeShopByBrandSection,
  CmsPageLayout,
  CmsSiteChromeZone,
  CmsSiteFooterChrome,
} from './cms-types';
import { mergeHomeSectionRows } from './home-sections';
import { mergeHeaderNavLinks, mergeHeaderNavTrackLink } from './nav-links';
import { mergeSocialLinks } from './cms-social';
import { DEFAULT_FOOTER_CHROME_BLOCKS, DEFAULT_FOOTER_CHROME_LAYOUT } from './cms-chrome-default-content';
import { mergeFooterStructured } from './cms-footer-structured';
import { mergeSiteMarketingHeader } from './cms-marketing-header';

const CMS_LAYOUTS: CmsPageLayout[] = [
  'default',
  'narrow',
  'full_bleed',
  'full_width',
  'grid',
  'grid_2',
  'grid_3',
];

function layoutOrDefault(raw: unknown): CmsPageLayout {
  return CMS_LAYOUTS.includes(raw as CmsPageLayout) ? (raw as CmsPageLayout) : 'default';
}

function cloneBlocks(blocks: CmsContentBlock[]): CmsContentBlock[] {
  return JSON.parse(JSON.stringify(blocks)) as CmsContentBlock[];
}

/**
 * When `blocks` was never saved (key missing), use the marketing template so admins can edit legacy copy.
 * When `blocks` is present (including an empty array), use exactly what was stored.
 * `enabled` defaults to true so CMS header/footer matches the live template until explicitly turned off.
 */
function mergeChromeZone(
  stored: Partial<CmsSiteChromeZone> | undefined | null,
  template: { layout: CmsPageLayout; blocks: CmsContentBlock[] }
): CmsSiteChromeZone {
  if (!stored || typeof stored !== 'object') {
    return {
      enabled: true,
      layout: template.layout,
      blocks: cloneBlocks(template.blocks),
    };
  }
  const hasBlocksKey = Object.prototype.hasOwnProperty.call(stored, 'blocks');
  const layout = hasBlocksKey ? layoutOrDefault(stored.layout) : template.layout;
  const blocks =
    hasBlocksKey && Array.isArray(stored.blocks)
      ? (stored.blocks as CmsContentBlock[])
      : cloneBlocks(template.blocks);
  const hasEnabledKey = Object.prototype.hasOwnProperty.call(stored, 'enabled');
  const enabled = hasEnabledKey ? stored.enabled === true : true;
  return {
    enabled,
    layout,
    blocks,
  };
}

function mergeSiteFooterChrome(stored: Partial<CmsSiteFooterChrome> | undefined | null): CmsSiteFooterChrome {
  const base = mergeChromeZone(stored, {
    layout: DEFAULT_FOOTER_CHROME_LAYOUT,
    blocks: DEFAULT_FOOTER_CHROME_BLOCKS,
  });
  const st = stored && typeof stored === 'object' ? stored : null;
  const hasSocialKey = st !== null && Object.prototype.hasOwnProperty.call(st, 'socialLinks');
  const socialLinks = hasSocialKey ? mergeSocialLinks(st.socialLinks) : [];
  const hasStructuredKey = st !== null && Object.prototype.hasOwnProperty.call(st, 'structured');
  const structuredFromDb = hasStructuredKey ? st!.structured : undefined;
  const structured = mergeFooterStructured(
    structuredFromDb != null && typeof structuredFromDb === 'object' ? structuredFromDb : undefined,
    !hasStructuredKey || structuredFromDb == null ? base.blocks : undefined
  );
  return {
    ...base,
    structured,
    socialColumnTitle:
      typeof st?.socialColumnTitle === 'string' ? st.socialColumnTitle.trim() : '',
    socialLinks,
  };
}

export const DEFAULT_CMS_HOME: CmsHomeData = {
  announcement: {
    enabled: false,
    line1: '',
    line2: '',
  },
  hero: {
    badge: 'Authentic US & Canada Brands',
    titleLine1: 'Discover Your',
    titleAccent: 'Best Skin',
    subtitle:
      "Shop authentic skincare and beauty products from the world's most trusted brands. Expert-curated solutions for every concern.",
    primaryCtaLabel: 'Shop All Products',
    primaryCtaHref: '/shop',
    secondaryCtaLabel: 'Take Skin Quiz',
    heroVideoUrl: '/assets/hero-video.mp4',
    statValue: '50K+',
    statLabel: 'Happy Customers',
  },
  promoBanners: [],
  newsletter: {
    heading: 'Join Our Beauty Community',
    subheading:
      'Get exclusive deals, skincare tips, and early access to new launches',
  },
  blogSection: {
    label: 'Journal',
    title: 'From the blog',
    description:
      'Skincare tips, beauty ideas, and wellness notes—swipe or use the arrows to browse.',
    ctaLabel: 'View all posts',
  },
  shopByBrandSection: {
    eyebrow: 'Trusted Partners',
    title: 'Shop by Brand',
    description: 'Authentic products from the most trusted names in beauty',
    items: [],
  },
};

function mergeShopByBrandSection(
  stored: Partial<CmsHomeData>['shopByBrandSection']
): CmsHomeShopByBrandSection {
  const defaults: CmsHomeShopByBrandSection = {
    eyebrow: 'Trusted Partners',
    title: 'Shop by Brand',
    description: 'Authentic products from the most trusted names in beauty',
    items: [],
  };
  if (!stored || typeof stored !== 'object') {
    return defaults;
  }
  const rawItems = Array.isArray(stored.items) ? stored.items : [];
  const items: CmsHomeBrandItem[] = rawItems.map((raw, index) => {
    if (!raw || typeof raw !== 'object') {
      return { id: `brand-${index}`, name: '', logoUrl: '', enabled: false };
    }
    const o = raw as unknown as Record<string, unknown>;
    return {
      id: typeof o.id === 'string' && o.id.trim() ? o.id.trim() : `brand-${index}`,
      name: typeof o.name === 'string' ? o.name : '',
      logoUrl: typeof o.logoUrl === 'string' ? o.logoUrl : '',
      href: typeof o.href === 'string' && o.href.trim() ? o.href.trim() : undefined,
      enabled: o.enabled !== false,
    };
  });
  return {
    eyebrow: typeof stored.eyebrow === 'string' && stored.eyebrow.trim() ? stored.eyebrow : defaults.eyebrow,
    title: typeof stored.title === 'string' && stored.title.trim() ? stored.title : defaults.title,
    description:
      typeof stored.description === 'string' && stored.description.trim()
        ? stored.description
        : defaults.description,
    items,
  };
}

export function mergeCmsHome(stored: Partial<CmsHomeData> | null | undefined): CmsHomeData {
  const base = DEFAULT_CMS_HOME;
  if (!stored) {
    return {
      ...base,
      promoBanners: [...(base.promoBanners ?? [])],
      homeSections: mergeHomeSectionRows(undefined),
      headerNavLinks: mergeHeaderNavLinks(undefined),
      headerNavTrackLink: mergeHeaderNavTrackLink(undefined),
      siteMarketingHeader: mergeSiteMarketingHeader(undefined),
      siteFooterChrome: mergeSiteFooterChrome(undefined),
      shopByBrandSection: mergeShopByBrandSection(undefined),
    };
  }

  const promoBanners =
    stored.promoBanners !== undefined && stored.promoBanners.length > 0
      ? stored.promoBanners
      : [...(base.promoBanners ?? [])];

  const hasHomeSectionsKey = Object.prototype.hasOwnProperty.call(stored, 'homeSections');
  return {
    announcement: { ...base.announcement, ...stored.announcement },
    hero: { ...base.hero, ...stored.hero },
    promoBanners,
    newsletter: { ...base.newsletter, ...stored.newsletter },
    blogSection: { ...base.blogSection, ...stored.blogSection },
    homeSections: hasHomeSectionsKey
      ? mergeHomeSectionRows(stored.homeSections)
      : mergeHomeSectionRows(undefined),
    headerNavLinks: mergeHeaderNavLinks(stored.headerNavLinks),
    headerNavTrackLink: mergeHeaderNavTrackLink(stored.headerNavTrackLink),
    siteMarketingHeader: mergeSiteMarketingHeader(stored),
    siteFooterChrome: mergeSiteFooterChrome(stored.siteFooterChrome),
    shopByBrandSection: mergeShopByBrandSection(stored.shopByBrandSection),
  };
}
