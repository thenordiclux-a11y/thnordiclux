'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAffiliate } from '../contexts/AffiliateContext';

export default function AffiliateIndexPage() {
  const router = useRouter();
  const { isAffiliateAuthenticated } = useAffiliate();

  useEffect(() => {
    router.replace(isAffiliateAuthenticated ? '/affiliate/dashboard' : '/affiliate/login');
  }, [isAffiliateAuthenticated, router]);

  return null;
}
