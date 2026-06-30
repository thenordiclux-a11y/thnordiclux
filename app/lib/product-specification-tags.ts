import type { Product } from '../contexts/DataContext';
import { DEFAULT_PRODUCT_TAG_PRESETS } from './shop-filter-constants';

/**
 * All tags shown on cards / used in shop filters.
 * Merges `specificationTags` (primary) with legacy `skinConcerns` until data is migrated.
 */
export function getProductSpecificationTags(product: Product): string[] {
  const raw = [...(product.specificationTags ?? []), ...(product.skinConcerns ?? [])]
    .map((t) => t.trim())
    .filter(Boolean);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of raw) {
    const k = t.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(t);
  }
  return out;
}

/** Unique sorted tags across products (for filter UI). */
export function collectAllSpecificationTags(products: Product[]): string[] {
  const set = new Set<string>();
  for (const p of products) {
    getProductSpecificationTags(p).forEach((t) => set.add(t));
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

/**
 * Tags for shop filters and admin presets: defaults first, then every other tag used on any product (sorted).
 */
export function collectShopSpecificationTags(products: Product[]): string[] {
  const catalog = collectAllSpecificationTags(products);
  const presetLower = new Set(DEFAULT_PRODUCT_TAG_PRESETS.map((t) => t.toLowerCase()));
  const extras = catalog.filter((t) => !presetLower.has(t.toLowerCase()));
  return [...DEFAULT_PRODUCT_TAG_PRESETS, ...extras];
}

/** Case-insensitive match: product has at least one of the selected filter tags. */
export function productMatchesSelectedSpecificationTags(
  product: Product,
  selectedTags: string[]
): boolean {
  if (selectedTags.length === 0) return true;
  const productLower = new Set(
    getProductSpecificationTags(product).map((t) => t.trim().toLowerCase()).filter(Boolean)
  );
  return selectedTags.some((s) => productLower.has(s.trim().toLowerCase()));
}
