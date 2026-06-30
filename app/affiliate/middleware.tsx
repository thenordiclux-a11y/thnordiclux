'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAffiliate } from '../contexts/AffiliateContext';

export function AffiliateMiddleware({ children }: { children: React.ReactNode }) {
  const { isAffiliateAuthenticated } = useAffiliate();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicPage = pathname === '/affiliate/login' || pathname === '/affiliate';
  const isAffiliateRoute = pathname?.startsWith('/affiliate');

  useEffect(() => {
    if (!isAffiliateRoute || isPublicPage) return;
    if (!isAffiliateAuthenticated) {
      router.push('/affiliate/login');
    }
  }, [isAffiliateAuthenticated, isAffiliateRoute, isPublicPage, pathname, router]);

  if (isAffiliateRoute && !isPublicPage && !isAffiliateAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
