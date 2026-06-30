import type { Product } from '../contexts/DataContext';
import { DEFAULT_PRODUCT_TAG_PRESETS } from './shop-filter-constants';

type InferInput = Pick<Product, 'name' | 'category' | 'description' | 'overview' | 'benefits'>;

const PRESETS = DEFAULT_PRODUCT_TAG_PRESETS as readonly string[];

/**
 * Suggest product tags from product text + category when none are stored.
 * Uses the same default labels as shop filters and admin.
 */
export function inferAutoSpecificationTags(product: InferInput): string[] {
  const parts = [
    product.name,
    product.category,
    product.description ?? '',
    product.overview ?? '',
    ...(product.benefits ?? []),
  ];
  const text = parts.join(' ').toLowerCase();

  const hits = new Set<string>();

  const add = (label: string) => {
    if (PRESETS.includes(label)) hits.add(label);
  };

  if (/\bacne\b|blemish|niacinamide|salicylic|\bbha\b|blackhead|congestion/.test(text)) {
    add('Acne & Blemishes');
    add('Pores');
    add('Oily Skin');
  }
  if (/retinol|anti[\s-]?aging|wrinkle|fine line|collagen|peptide|mature skin/.test(text)) {
    add('Anti-Aging');
  }
  if (/dark spot|hyperpigment|brightening|vitamin\s*c|melasma|uneven tone|ascorbic/.test(text)) {
    add('Dark Spots');
    add('Uneven Texture');
  }
  if (/\boil\b|sebum|shine|matte\s*fini/.test(text)) add('Oily Skin');
  if (/dry|dehydrat|hydrat|moistur|ceramide|hyaluronic|barrier|toleriane/.test(text)) add('Dry Skin');
  if (/sensitive|gentle|irritat|redness|rosacea|eczema/.test(text)) add('Sensitive Skin');
  if (/fragrance[\s-]?free|unscented/.test(text)) add('Fragrance-free');
  if (/pore|texture|rough|exfoliat/.test(text)) {
    add('Pores');
    add('Uneven Texture');
  }
  if (/\bspf\b|sunscreen|sun screen|\buv\b|broad spectrum/.test(text)) {
    add('Sensitive Skin');
    add('Dark Spots');
  }

  if (hits.size === 0) {
    const c = (product.category ?? '').toLowerCase();
    if (c.includes('sun')) {
      add('Sensitive Skin');
      add('Dark Spots');
    } else if (c.includes('cleanser')) {
      add('Dry Skin');
      add('Sensitive Skin');
    } else if (c.includes('moistur')) {
      add('Dry Skin');
    } else if (c.includes('treatment') || c.includes('serum') || c.includes('toner')) {
      add('Uneven Texture');
    } else if (c.includes('mask')) {
      add('Pores');
    }
  }

  return PRESETS.filter((t) => hits.has(t));
}
