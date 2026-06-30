/** Suggested product categories — used in admin picker + shop filter defaults. */
export const SHOP_CATEGORY_SUGGESTIONS = [
  'Cleanser',
  'Serum',
  'Moisturizer',
  'Sunscreen',
  'Toner',
  'Mask',
  'Eye Care',
  'Treatment',
] as const;

/**
 * Default product-tag suggestions (listed first in shop filters when the catalog is empty).
 * Any tag used on a product (e.g. "Chocolates") is also offered as a preset in admin and shop.
 */
export const DEFAULT_PRODUCT_TAG_PRESETS = [
  'Acne & Blemishes',
  'Anti-Aging',
  'Dark Spots',
  'Oily Skin',
  'Dry Skin',
  'Sensitive Skin',
  'Pores',
  'Uneven Texture',
  'Fragrance-free',
] as const;

/** @deprecated Use DEFAULT_PRODUCT_TAG_PRESETS */
export const SKIN_CONCERN_TAG_PRESETS = DEFAULT_PRODUCT_TAG_PRESETS;

