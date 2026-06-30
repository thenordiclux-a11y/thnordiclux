import type { BlogPost } from './blog-posts';
import type { HomeSectionRow } from './home-sections';

export interface CmsAnnouncement {
  enabled?: boolean;
  line1?: string;
  line2?: string;
}

/** Header navbar link variant: shop row shows chevron; emphasis uses sale styling. */
export type CmsNavLinkVariant = 'default' | 'emphasis' | 'shop';

export interface CmsNavLink {
  id: string;
  label: string;
  href: string;
  enabled?: boolean;
  variant?: CmsNavLinkVariant;
}

export interface CmsHeaderNavTrackLink {
  label: string;
  href: string;
  enabled?: boolean;
}

/** Main sticky header: logo row, search, icons (nav links stay in CMS → Navigation). */
export type CmsMarketingHeaderLayout = 'default' | 'wide';

export interface CmsMarketingHeader {
  /** Public URL for logo image; empty = built-in site logo */
  logoImageUrl?: string;
  logoAlt?: string;
  tagline?: string;
  showTagline?: boolean;
  searchPlaceholderDesktop?: string;
  searchPlaceholderMobile?: string;
  showDesktopSearch?: boolean;
  showMobileSearch?: boolean;
  showWishlist?: boolean;
  showAccount?: boolean;
  layout?: CmsMarketingHeaderLayout;
}

export interface CmsHomePromoBanner {
  title: string;
  subtitle: string;
  buttonText: string;
  image: string;
  theme: 'primary' | 'secondary';
}

/** One brand tile on the home “Shop by brand” section (logos from CMS). */
export interface CmsHomeBrandItem {
  id: string;
  /** Display name and image alt text */
  name: string;
  /** Public URL to logo image (same host, /public path, or absolute) */
  logoUrl: string;
  /** Optional link when the tile is clicked (e.g. /shop or external URL) */
  href?: string;
  enabled?: boolean;
}

/** Copy + ordered brand logos for the home “Shop by brand” block. */
export interface CmsHomeShopByBrandSection {
  eyebrow?: string;
  title?: string;
  description?: string;
  items: CmsHomeBrandItem[];
}

export interface CmsHomeData {
  /** Ordered home page blocks; drag-reorder in admin CMS Home. */
  homeSections?: HomeSectionRow[];
  /** Main marketing header nav; edit in CMS → Navigation. */
  headerNavLinks?: CmsNavLink[];
  /** Right-side utility link in the header nav row (e.g. track order). */
  headerNavTrackLink?: CmsHeaderNavTrackLink;
  announcement?: CmsAnnouncement;
  hero?: {
    badge?: string;
    titleLine1?: string;
    titleAccent?: string;
    subtitle?: string;
    primaryCtaLabel?: string;
    primaryCtaHref?: string;
    secondaryCtaLabel?: string;
    heroVideoUrl?: string;
    statValue?: string;
    statLabel?: string;
  };
  promoBanners?: CmsHomePromoBanner[];
  newsletter?: {
    heading?: string;
    subheading?: string;
  };
  blogSection?: {
    label?: string;
    title?: string;
    description?: string;
    ctaLabel?: string;
  };
  /** Home “Shop by brand” headings + logo grid; when `items` is empty, the site falls back to catalog brand names. */
  shopByBrandSection?: CmsHomeShopByBrandSection;
  /** Logo, tagline, search placeholders, header layout — CMS → Marketing header. */
  siteMarketingHeader?: CmsMarketingHeader;
  /**
   * Legacy CMS header band (removed from UI). Still read from DB to migrate tagline into `siteMarketingHeader`.
   */
  siteHeaderChrome?: CmsSiteChromeZone;
  /**
   * Optional footer body + social column (replaces default footer link columns when enabled).
   */
  siteFooterChrome?: CmsSiteFooterChrome;
}

export type CmsPageLayout =
  | 'default'
  | 'narrow'
  | 'full_bleed'
  | 'full_width'
  | 'grid'
  | 'grid_2'
  | 'grid_3';

/** In grid page layouts: full row vs one column cell. */
export type CmsBlockGridSpan = 'auto' | 'full';

export type CmsContentBlock =
  | {
      type: 'hero';
      title: string;
      subtitle?: string;
      image?: string;
      gridSpan?: CmsBlockGridSpan;
    }
  | {
      type: 'richtext';
      paragraphs: string[];
      /** Rich HTML from the CMS editor; takes precedence over paragraphs when set. */
      html?: string;
      gridSpan?: CmsBlockGridSpan;
    }
  | {
      type: 'image';
      src: string;
      caption?: string;
      width?: 'full' | 'contained';
      gridSpan?: CmsBlockGridSpan;
    };

/** Known social networks for footer / contact column icons. */
export type CmsSocialPlatform =
  | 'facebook'
  | 'instagram'
  | 'twitter'
  | 'x'
  | 'youtube'
  | 'tiktok'
  | 'linkedin'
  | 'whatsapp'
  | 'pinterest'
  | 'snapchat'
  | 'custom';

export interface CmsSocialLink {
  id: string;
  platform: CmsSocialPlatform;
  href: string;
  enabled?: boolean;
  /** Accessibility / tooltip; defaults to platform name */
  label?: string;
}

/** Main footer row segments (drag-reorder in CMS → Footer). */
export type CmsFooterSectionId = 'brand' | 'shop' | 'support' | 'company' | 'social';

export interface CmsFooterLinkItem {
  id: string;
  label: string;
  href: string;
  enabled?: boolean;
}

export interface CmsFooterLinkColumn {
  title: string;
  links: CmsFooterLinkItem[];
}

export interface CmsFooterLegalItem {
  id: string;
  label: string;
  href: string;
  enabled?: boolean;
}

/** Form-based footer: brand, link columns, copyright + legal row (replaces legacy richtext blocks). */
export interface CmsFooterStructured {
  columnOrder: CmsFooterSectionId[];
  /** Footer-specific logo; empty = use marketing header logo in the site chrome. */
  logoImageUrl?: string;
  logoAlt?: string;
  brandTitle?: string;
  brandDescription?: string;
  showBrandLogo?: boolean;
  shop: CmsFooterLinkColumn;
  support: CmsFooterLinkColumn;
  company: CmsFooterLinkColumn;
  copyrightLine?: string;
  legalLinks?: CmsFooterLegalItem[];
}

/** Base chrome zone (blocks + layout); used by the CMS footer. */
export interface CmsSiteChromeZone {
  enabled?: boolean;
  layout: CmsPageLayout;
  blocks: CmsContentBlock[];
}

export interface CmsSiteFooterChrome extends CmsSiteChromeZone {
  /** Heading above the icon row (e.g. “Follow us” / “Contact”) */
  socialColumnTitle?: string;
  /** Social profiles in a responsive column next to footer CMS blocks */
  socialLinks?: CmsSocialLink[];
  /** Editable footer layout (logo, columns, legal). Legacy `blocks` kept for migration only. */
  structured?: CmsFooterStructured;
}

export interface CmsPageRecord {
  id: string;
  slug: string;
  title: string;
  layout: CmsPageLayout;
  published: boolean;
  blocks: CmsContentBlock[];
  createdAt: string;
  updatedAt: string;
}

export interface CmsBlogPostRecord extends BlogPost {
  id: string;
  published: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}
