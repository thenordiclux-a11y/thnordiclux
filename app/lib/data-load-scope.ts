export type DataLoadScope = 'storefront' | 'checkout' | 'admin';

export function getDataLoadScope(pathname: string | null | undefined): DataLoadScope {
  if (!pathname) return 'storefront';
  if (pathname.startsWith('/admin')) return 'admin';
  if (pathname.startsWith('/checkout')) return 'checkout';
  return 'storefront';
}

export function needsAffiliateData(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return pathname.startsWith('/affiliate') || pathname.startsWith('/admin/affiliate');
}
