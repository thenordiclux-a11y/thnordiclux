import type { Product } from '../contexts/DataContext';

export function generateAffiliateCode(name: string): string {
  const slug = name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '')
    .slice(0, 8);
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `NORDIC-${slug || 'MEMBER'}-${suffix}`;
}

export function getSiteOrigin(): string {
  if (typeof window !== 'undefined') return window.location.origin;
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://thenordiclux.com';
}

export function buildAffiliateLink(
  affiliateCode: string,
  path: string = '/shop',
  productId?: string
): string {
  const base = getSiteOrigin();
  const target = productId ? `/product/${productId}` : path;
  const url = new URL(target, base);
  url.searchParams.set('ref', affiliateCode);
  return url.toString();
}

export function buildShareText(product: Product, affiliateCode: string): string {
  const price = product.originalPrice
    ? `$${product.price} (was $${product.originalPrice})`
    : `$${product.price}`;
  return `Check out ${product.name} from Nordic Lux — ${price}. Use my link to shop! #NordicLux #Skincare`;
}

export type SocialPlatform =
  | 'facebook'
  | 'twitter'
  | 'whatsapp'
  | 'pinterest'
  | 'email'
  | 'instagram';

export function buildSocialShareUrl(
  platform: SocialPlatform,
  url: string,
  text: string
): string {
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);

  switch (platform) {
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    case 'twitter':
      return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
    case 'whatsapp':
      return `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
    case 'pinterest':
      return `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedText}`;
    case 'email':
      return `mailto:?subject=${encodeURIComponent('Nordic Lux — Product recommendation')}&body=${encodeURIComponent(`${text}\n\n${url}`)}`;
    case 'instagram':
      return url;
    default:
      return url;
  }
}

export function getRecommendedProducts(products: Product[], limit = 6): Product[] {
  return [...products]
    .filter((p) => p.stock > 0)
    .sort((a, b) => {
      const scoreA = (a.rating ?? 0) * 10 + (a.reviews ?? 0) + (a.badge ? 5 : 0);
      const scoreB = (b.rating ?? 0) * 10 + (b.reviews ?? 0) + (b.badge ? 5 : 0);
      return scoreB - scoreA;
    })
    .slice(0, limit);
}

export function calculateCommission(orderTotal: number, rate: number): number {
  return Math.round(orderTotal * (rate / 100) * 100) / 100;
}
