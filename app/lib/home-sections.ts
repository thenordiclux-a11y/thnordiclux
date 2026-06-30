import type { CmsContentBlock } from './cms-types';

export const HOME_SECTION_KEYS = [
  'hero',
  'promo_banners',
  'skin_concerns',
  'categories',
  'best_sellers',
  'brands',
  'skincare_brands',
  'makeup_perfumes',
  'vitamins_minerals',
  'healthy_eating',
  'supplements',
  'chocolate',
  'blog',
  'why_choose_us',
  'newsletter',
] as const;

export type HomeSectionKey = (typeof HOME_SECTION_KEYS)[number];

/** Layout for custom home sections (same values usable on CMS pages). */
export type HomeCustomLayout =
  | 'default'
  | 'narrow'
  | 'full_width'
  | 'full_bleed'
  | 'grid'
  | 'grid_2'
  | 'grid_3';

export interface HomeBuiltinSectionRow {
  kind: 'builtin';
  id: string;
  key: HomeSectionKey;
  enabled: boolean;
}

export interface HomeCustomSectionRow {
  kind: 'custom';
  id: string;
  enabled: boolean;
  /** When false, section is hidden on the live site (draft). */
  published: boolean;
  /** Optional heading above blocks */
  sectionTitle?: string;
  layout: HomeCustomLayout;
  blocks: CmsContentBlock[];
}

export type HomeSectionRow = HomeBuiltinSectionRow | HomeCustomSectionRow;

export function isBuiltinSection(row: HomeSectionRow): row is HomeBuiltinSectionRow {
  return row.kind === 'builtin';
}

export function isCustomSection(row: HomeSectionRow): row is HomeCustomSectionRow {
  return row.kind === 'custom';
}

export const HOME_SECTION_LABELS: Record<HomeSectionKey, string> = {
  hero: 'Hero',
  promo_banners: 'Promo banners',
  skin_concerns: 'Shop by skin concern',
  categories: 'Browse collections / Shop by category',
  best_sellers: 'Best sellers',
  brands: 'Shop by brand',
  skincare_brands: 'Skin care items (brand grid)',
  makeup_perfumes: 'Makeup & perfumes',
  vitamins_minerals: 'Vitamins & minerals',
  healthy_eating: 'Healthy eating',
  supplements: 'Supplements',
  chocolate: 'Chocolate / Sweet treats',
  blog: 'Blog carousel',
  why_choose_us: 'Why shop with us',
  newsletter: 'Newsletter & contact anchor',
};

const DEFAULT_BUILTIN_ROWS: HomeBuiltinSectionRow[] = HOME_SECTION_KEYS.map((key) => ({
  kind: 'builtin' as const,
  id: `home-${key}`,
  key,
  enabled: true,
}));

const CUSTOM_LAYOUTS: HomeCustomLayout[] = [
  'default',
  'narrow',
  'full_width',
  'full_bleed',
  'grid',
  'grid_2',
  'grid_3',
];

function parseCustomRow(raw: Record<string, unknown>): HomeCustomSectionRow | null {
  const id =
    typeof raw.id === 'string' && raw.id.trim() ? raw.id.trim() : `custom-imported-${Date.now()}`;
  const layout = CUSTOM_LAYOUTS.includes(raw.layout as HomeCustomLayout) ? (raw.layout as HomeCustomLayout) : 'default';
  const blocks = Array.isArray(raw.blocks) ? (raw.blocks as CmsContentBlock[]) : [];
  return {
    kind: 'custom',
    id,
    enabled: raw.enabled !== false,
    published: raw.published !== false,
    sectionTitle: typeof raw.sectionTitle === 'string' ? raw.sectionTitle : undefined,
    layout,
    blocks,
  };
}

/** Normalize a row from JSON (supports legacy rows without `kind`). */
export function normalizeHomeSectionRow(raw: unknown): HomeSectionRow | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;

  if (r.kind === 'custom') return parseCustomRow(r);

  if (r.kind === 'builtin' && typeof r.key === 'string' && HOME_SECTION_KEYS.includes(r.key as HomeSectionKey)) {
    return {
      kind: 'builtin',
      id: typeof r.id === 'string' && r.id.trim() ? r.id.trim() : `home-${r.key}`,
      key: r.key as HomeSectionKey,
      enabled: r.enabled !== false,
    };
  }

  // Legacy: { id, key, enabled } without kind
  if (typeof r.key === 'string' && HOME_SECTION_KEYS.includes(r.key as HomeSectionKey)) {
    return {
      kind: 'builtin',
      id: typeof r.id === 'string' && r.id.trim() ? r.id.trim() : `home-${r.key}`,
      key: r.key as HomeSectionKey,
      enabled: r.enabled !== false,
    };
  }

  return null;
}

/**
 * Empty / missing stored data → full default builtin list.
 * Non-empty stored → exact order, no auto-injection of removed builtins. Custom rows preserved.
 */
export function mergeHomeSectionRows(stored: HomeSectionRow[] | undefined | null): HomeSectionRow[] {
  if (stored == null) {
    return DEFAULT_BUILTIN_ROWS.map((r) => ({ ...r }));
  }

  const result: HomeSectionRow[] = [];
  for (const item of stored) {
    const row = normalizeHomeSectionRow(item);
    if (row) result.push(row);
  }
  return result;
}

export function newCustomHomeSection(): HomeCustomSectionRow {
  const id =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? `custom-${crypto.randomUUID()}`
      : `custom-${Date.now()}`;
  return {
    kind: 'custom',
    id,
    enabled: true,
    published: false,
    sectionTitle: 'New section',
    layout: 'default',
    blocks: [
      {
        type: 'richtext',
        paragraphs: ['Add content in the CMS.'],
        html: '<p>Add content in the CMS.</p>',
      },
    ],
  };
}
