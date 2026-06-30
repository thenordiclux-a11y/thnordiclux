import type { Product } from '../contexts/DataContext';
import { getProductSpecificationTags } from './product-specification-tags';

/** Pick the catalog category string to treat as “Skincare” (exact or contains skin care / skincare). */
export function resolveSkincareCategoryFromCatalog(products: Product[]): string | undefined {
  const cats = [...new Set(products.map((p) => (p.category ?? '').trim()).filter(Boolean))];
  const exact = cats.find((c) => /^skincare$/i.test(c));
  if (exact) return exact;
  return cats.find((c) => /skincare|skin\s+care/i.test(c));
}

export function productHasSpecificationTag(product: Product, tagLabel: string): boolean {
  const want = tagLabel.trim().toLowerCase();
  if (!want) return false;
  return getProductSpecificationTags(product).some((t) => t.trim().toLowerCase() === want);
}

/**
 * Products tagged with `concernTitle` and (when `skincareCategory` is set) in that category.
 * If `skincareCategory` is missing, counts all products with the tag.
 */
export function countProductsForSkinConcern(
  products: Product[],
  concernTitle: string,
  skincareCategory?: string
): number {
  return products.filter((p) => {
    if (!productHasSpecificationTag(p, concernTitle)) return false;
    if (!skincareCategory) return true;
    return (p.category ?? '').trim().toLowerCase() === skincareCategory.trim().toLowerCase();
  }).length;
}

export function buildShopSkinConcernHref(concernTitle: string, skincareCategory?: string): string {
  const p = new URLSearchParams();
  p.set('tag', concernTitle);
  if (skincareCategory) p.set('category', skincareCategory);
  return `/shop?${p.toString()}`;
}

export function isChocolateCategory(category: string): boolean {
  const c = category.trim().toLowerCase();
  return c === 'chocolate' || c === 'chocolates';
}

/** Product tag used for the homepage “Sweet Treats / Chocolate” section (case-insensitive on products). */
export const SWEET_TREATS_TAG_LABEL = 'Sweet Treats';

export function filterSweetTreatsChocolateProducts(products: Product[]): Product[] {
  return products.filter(
    (p) =>
      isChocolateCategory(p.category ?? '') &&
      productHasSpecificationTag(p, SWEET_TREATS_TAG_LABEL)
  );
}

export function resolveChocolateCategoryFromCatalog(products: Product[]): string | undefined {
  const cats = [...new Set(products.map((p) => (p.category ?? '').trim()).filter(Boolean))];
  return cats.find((c) => isChocolateCategory(c));
}

export function buildSweetTreatsChocolateShopHref(chocolateCategoryName?: string): string {
  const p = new URLSearchParams();
  p.set('tag', SWEET_TREATS_TAG_LABEL);
  if (chocolateCategoryName) p.set('category', chocolateCategoryName);
  return `/shop?${p.toString()}`;
}

/** Resolve URL category query to an actual `product.category` value from the catalog. */
export function resolveCategoryParamForCatalog(
  categoryParam: string,
  productCategories: string[]
): string | undefined {
  const q = categoryParam.trim();
  if (!q) return undefined;
  const unique = [...new Set(productCategories.map((c) => c.trim()).filter(Boolean))];
  const exact = unique.find((c) => c.toLowerCase() === q.toLowerCase());
  if (exact) return exact;
  if (/skincare|skin\s*care/i.test(q)) {
    return unique.find((c) => /skincare|skin\s+care/i.test(c));
  }
  if (/^chocolates?$/i.test(q)) {
    return unique.find((c) => isChocolateCategory(c));
  }
  return undefined;
}
