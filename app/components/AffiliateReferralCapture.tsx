'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAffiliate } from '../contexts/AffiliateContext';

/** Captures ?ref=CODE from URL and stores affiliate referral cookie in localStorage. */
export function AffiliateReferralCapture() {
  const searchParams = useSearchParams();
  const { storeReferralCode, recordClick } = useAffiliate();

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (!ref?.trim()) return;

    const code = ref.trim().toUpperCase();
    storeReferralCode(code);
    void recordClick(code, 'link');
  }, [searchParams, storeReferralCode, recordClick]);

  return null;
}
