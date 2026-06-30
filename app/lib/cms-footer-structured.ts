import type {
  CmsContentBlock,
  CmsFooterLegalItem,
  CmsFooterLinkColumn,
  CmsFooterLinkItem,
  CmsFooterSectionId,
  CmsFooterStructured,
} from './cms-types';

export const FOOTER_SECTION_IDS: CmsFooterSectionId[] = [
  'brand',
  'shop',
  'support',
  'company',
  'social',
];

function newId(prefix: string): string {
  const c = globalThis.crypto;
  if (c?.randomUUID) return `${prefix}-${c.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function newFooterLinkItem(overrides?: Partial<CmsFooterLinkItem>): CmsFooterLinkItem {
  return {
    id: newId('fl'),
    label: '',
    href: '',
    enabled: true,
    ...overrides,
  };
}

export function newFooterLegalItem(overrides?: Partial<CmsFooterLegalItem>): CmsFooterLegalItem {
  return {
    id: newId('legal'),
    label: '',
    href: '',
    enabled: true,
    ...overrides,
  };
}

export const DEFAULT_FOOTER_STRUCTURED: CmsFooterStructured = {
  columnOrder: [...FOOTER_SECTION_IDS],
  logoImageUrl: '',
  logoAlt: 'Nordic Lux',
  brandTitle: 'Nordic Lux',
  brandDescription:
    'Your trusted destination for authentic premium cosmetics from leading US and Canadian brands.',
  showBrandLogo: true,
  shop: {
    title: 'Shop',
    links: [
      newFooterLinkItem({ id: 'shop-1', label: 'All Products', href: '/shop' }),
      newFooterLinkItem({ id: 'shop-2', label: 'Skin Concerns', href: '/#concerns' }),
      newFooterLinkItem({ id: 'shop-3', label: 'Categories', href: '/#categories' }),
      newFooterLinkItem({ id: 'shop-4', label: 'Brands', href: '/#brands' }),
      newFooterLinkItem({ id: 'shop-5', label: 'Sale', href: '/#deals' }),
    ],
  },
  support: {
    title: 'Support',
    links: [
      newFooterLinkItem({ id: 'sup-1', label: 'Help Center', href: '/#contact' }),
      newFooterLinkItem({ id: 'sup-2', label: 'Track Order', href: '/track-order' }),
      newFooterLinkItem({ id: 'sup-3', label: 'Returns', href: '/#contact' }),
      newFooterLinkItem({ id: 'sup-4', label: 'Shipping Info', href: '/#contact' }),
      newFooterLinkItem({ id: 'sup-5', label: 'Contact Us', href: '/#contact' }),
    ],
  },
  company: {
    title: 'Company',
    links: [
      newFooterLinkItem({ id: 'co-1', label: 'About Us', href: '/#contact' }),
      newFooterLinkItem({ id: 'co-2', label: 'Careers', href: '/#contact' }),
      newFooterLinkItem({ id: 'co-3', label: 'Blog', href: '/blog' }),
      newFooterLinkItem({ id: 'co-4', label: 'Affiliate', href: '/affiliate/login' }),
      newFooterLinkItem({ id: 'co-5', label: 'Press', href: '/#contact' }),
      newFooterLinkItem({ id: 'co-6', label: 'Admin', href: '/admin/login' }),
    ],
  },
  copyrightLine: '© 2026 Nordic Lux. All rights reserved.',
  legalLinks: [
    newFooterLegalItem({ id: 'legal-privacy', label: 'Privacy', href: '/#contact' }),
    newFooterLegalItem({ id: 'legal-terms', label: 'Terms', href: '/#contact' }),
    newFooterLegalItem({ id: 'legal-cookies', label: 'Cookies', href: '/#contact' }),
  ],
};

export function cloneDefaultFooterStructured(): CmsFooterStructured {
  return JSON.parse(JSON.stringify(DEFAULT_FOOTER_STRUCTURED)) as CmsFooterStructured;
}

function normalizeColumnOrder(order: CmsFooterSectionId[] | undefined): CmsFooterSectionId[] {
  if (!order?.length) return [...FOOTER_SECTION_IDS];
  const set = new Set(order);
  if (set.size !== FOOTER_SECTION_IDS.length) return [...FOOTER_SECTION_IDS];
  for (const id of FOOTER_SECTION_IDS) {
    if (!set.has(id)) return [...FOOTER_SECTION_IDS];
  }
  return [...order];
}

function mergeLinkColumn(
  base: CmsFooterLinkColumn,
  patch: Partial<CmsFooterLinkColumn> | undefined
): CmsFooterLinkColumn {
  if (!patch) return { ...base, links: base.links.map((l) => ({ ...l })) };
  const links = Array.isArray(patch.links)
    ? patch.links.map((l) => ({
        id: l.id || newId('fl'),
        label: typeof l.label === 'string' ? l.label : '',
        href: typeof l.href === 'string' ? l.href : '',
        enabled: l.enabled !== false,
      }))
    : base.links.map((l) => ({ ...l }));
  return {
    title: typeof patch.title === 'string' ? patch.title : base.title,
    links,
  };
}

function mergeLegalLinks(
  base: CmsFooterLegalItem[],
  patch: CmsFooterLegalItem[] | undefined
): CmsFooterLegalItem[] {
  if (!Array.isArray(patch)) return base.map((l) => ({ ...l }));
  return patch.map((l) => ({
    id: l.id || newId('legal'),
    label: typeof l.label === 'string' ? l.label : '',
    href: typeof l.href === 'string' ? l.href : '',
    enabled: l.enabled !== false,
  }));
}

function mergePartialStructured(partial: Partial<CmsFooterStructured>): CmsFooterStructured {
  const d = cloneDefaultFooterStructured();
  return {
    columnOrder: normalizeColumnOrder(partial.columnOrder),
    logoImageUrl: typeof partial.logoImageUrl === 'string' ? partial.logoImageUrl : d.logoImageUrl,
    logoAlt: typeof partial.logoAlt === 'string' ? partial.logoAlt : d.logoAlt,
    brandTitle: typeof partial.brandTitle === 'string' ? partial.brandTitle : d.brandTitle,
    brandDescription:
      typeof partial.brandDescription === 'string' ? partial.brandDescription : d.brandDescription,
    showBrandLogo: partial.showBrandLogo !== false,
    shop: mergeLinkColumn(d.shop, partial.shop),
    support: mergeLinkColumn(d.support, partial.support),
    company: mergeLinkColumn(d.company, partial.company),
    copyrightLine:
      typeof partial.copyrightLine === 'string' ? partial.copyrightLine : d.copyrightLine,
    legalLinks: mergeLegalLinks(d.legalLinks ?? [], partial.legalLinks),
  };
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function parseLinksFromHtml(html: string): CmsFooterLinkItem[] {
  const links: CmsFooterLinkItem[] = [];
  const re = /<a\s+[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const label = stripTags(m[2]);
    if (label || m[1]) {
      links.push(newFooterLinkItem({ label, href: m[1], enabled: true }));
    }
  }
  return links;
}

function parseColumnFromRichtext(html: string, fallbackTitle: string): CmsFooterLinkColumn {
  const h4 = html.match(/<h4[^>]*>([^<]*)<\/h4>/i);
  const title = h4?.[1]?.trim() || fallbackTitle;
  const links = parseLinksFromHtml(html);
  return { title, links };
}

function migrateFooterFromBlocks(blocks: CmsContentBlock[]): CmsFooterStructured | null {
  if (blocks.length < 4) return null;
  const d = cloneDefaultFooterStructured();
  const b0 = blocks[0];
  if (b0?.type !== 'richtext') {
    const shop =
      blocks[1]?.type === 'richtext' ? parseColumnFromRichtext(blocks[1].html ?? '', 'Shop') : d.shop;
    const support =
      blocks[2]?.type === 'richtext' ? parseColumnFromRichtext(blocks[2].html ?? '', 'Support') : d.support;
    const company =
      blocks[3]?.type === 'richtext' ? parseColumnFromRichtext(blocks[3].html ?? '', 'Company') : d.company;
    return {
      ...d,
      shop: shop.links.length ? shop : d.shop,
      support: support.links.length ? support : d.support,
      company: company.links.length ? company : d.company,
    };
  }
  const html0 = b0.html ?? '';
  const titleMatch = html0.match(/<strong[^>]*>([\s\S]*?)<\/strong>/i);
  const brandTitle = titleMatch ? stripTags(titleMatch[1]) : b0.paragraphs?.[0]?.trim() || d.brandTitle;
  const descP = html0.match(/<p[^>]*>([\s\S]*?)<\/p>/gi);
  let brandDescription = d.brandDescription;
  if (descP && descP.length > 1) {
    brandDescription = stripTags(descP[1]) || brandDescription;
  } else if (b0.paragraphs?.[1]) {
    brandDescription = b0.paragraphs[1];
  }

  const shop = blocks[1]?.type === 'richtext' ? parseColumnFromRichtext(blocks[1].html ?? '', 'Shop') : d.shop;
  const support =
    blocks[2]?.type === 'richtext' ? parseColumnFromRichtext(blocks[2].html ?? '', 'Support') : d.support;
  const company =
    blocks[3]?.type === 'richtext' ? parseColumnFromRichtext(blocks[3].html ?? '', 'Company') : d.company;

  let copyrightLine = d.copyrightLine;
  let legalLinks = [...(d.legalLinks ?? [])];
  const b4 = blocks[4];
  if (b4?.type === 'richtext') {
    const h = b4.html ?? '';
    const p0 = h.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    if (p0 && !/<a/i.test(p0[1])) {
      copyrightLine = stripTags(p0[1]) || copyrightLine;
    }
    const legals = parseLinksFromHtml(h);
    if (legals.length) {
      legalLinks = legals.map((l) => ({
        ...l,
        id: l.id.startsWith('fl-') ? l.id.replace('fl-', 'legal-') : l.id,
      }));
    }
  }

  return {
    ...d,
    brandTitle,
    brandDescription,
    shop: shop.links.length ? shop : d.shop,
    support: support.links.length ? support : d.support,
    company: company.links.length ? company : d.company,
    copyrightLine,
    legalLinks,
  };
}

/**
 * Merge stored structured data, optionally one-time migrate from legacy footer blocks.
 */
export function mergeFooterStructured(
  stored: Partial<CmsFooterStructured> | undefined | null,
  legacyBlocks?: CmsContentBlock[]
): CmsFooterStructured {
  if (stored != null && typeof stored === 'object' && Object.keys(stored).length > 0) {
    return mergePartialStructured(stored);
  }
  if (legacyBlocks?.length) {
    const migrated = migrateFooterFromBlocks(legacyBlocks);
    if (migrated) return migrated;
  }
  return cloneDefaultFooterStructured();
}

export function columnHasVisibleLinks(c: CmsFooterLinkColumn): boolean {
  return c.links.some((l) => l.enabled !== false && l.label.trim() && l.href.trim());
}

export function footerStructuredIsRenderable(s: CmsFooterStructured): boolean {
  const brandVisible =
    s.showBrandLogo !== false ||
    !!s.brandTitle?.trim() ||
    !!s.brandDescription?.trim();
  return !!(
    brandVisible ||
    s.copyrightLine?.trim() ||
    (s.legalLinks ?? []).some((l) => l.enabled !== false && l.label.trim() && l.href.trim()) ||
    columnHasVisibleLinks(s.shop) ||
    columnHasVisibleLinks(s.support) ||
    columnHasVisibleLinks(s.company)
  );
}
