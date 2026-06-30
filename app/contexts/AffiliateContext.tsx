'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { usePathname } from 'next/navigation';
import { toast } from 'sonner';
import type {
  AffiliateMember,
  AffiliateClick,
  AffiliateReferral,
  AffiliateSettings,
} from '../lib/affiliate-types';
import { DEFAULT_AFFILIATE_SETTINGS } from '../lib/affiliate-types';
import { generateAffiliateCode, calculateCommission } from '../lib/affiliate-utils';
import {
  isSupabaseConfigured,
} from '../lib/supabase';
import {
  fetchAffiliatesFromSupabase,
  insertAffiliateDb,
  updateAffiliateInSupabase,
  deleteAffiliateFromSupabase,
  fetchAffiliateClicksFromSupabase,
  insertAffiliateClickDb,
  fetchAffiliateReferralsFromSupabase,
  insertAffiliateReferralDb,
  fetchAffiliateSettingsFromSupabase,
  upsertAffiliateSettingsDb,
} from '../lib/affiliate-db';
import { needsAffiliateData } from '../lib/data-load-scope';
import { setStoredDebounced } from '../lib/debounce-storage';

export interface AffiliateSession {
  id: string;
  name: string;
  email: string;
  affiliateCode: string;
  commissionRate: number;
}

interface AffiliateContextType {
  affiliates: AffiliateMember[];
  clicks: AffiliateClick[];
  referrals: AffiliateReferral[];
  settings: AffiliateSettings;
  member: AffiliateSession | null;
  isAffiliateAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  addAffiliate: (
    data: Omit<
      AffiliateMember,
      | 'id'
      | 'createdAt'
      | 'updatedAt'
      | 'totalClicks'
      | 'totalConversions'
      | 'totalEarnings'
      | 'pendingEarnings'
      | 'affiliateCode'
    > & { affiliateCode?: string }
  ) => void;
  updateAffiliate: (id: string, data: Partial<AffiliateMember>) => void;
  deleteAffiliate: (id: string) => void;
  updateSettings: (settings: Partial<AffiliateSettings>) => void;
  recordClick: (
    affiliateCode: string,
    source: AffiliateClick['source'],
    productId?: string,
    productName?: string
  ) => void;
  recordConversion: (
    orderId: string,
    orderNumber: string,
    orderTotal: number
  ) => void;
  getStoredReferralCode: () => string | null;
  storeReferralCode: (code: string) => void;
}

const AffiliateContext = createContext<AffiliateContextType | undefined>(undefined);

const REF_KEY = 'affiliate_ref';
const SESSION_KEY = 'affiliate_member';
const LS_AFFILIATES = 'admin_affiliates';
const LS_CLICKS = 'admin_affiliate_clicks';
const LS_REFERRALS = 'admin_affiliate_referrals';
const LS_SETTINGS = 'admin_affiliate_settings';

function getStored<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function setStored(key: string, value: unknown): void {
  setStoredDebounced(key, value);
}

export function AffiliateProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const dataLoadedRef = useRef(false);
  const [affiliates, setAffiliates] = useState<AffiliateMember[]>(() =>
    getStored(LS_AFFILIATES, [])
  );
  const [clicks, setClicks] = useState<AffiliateClick[]>(() => getStored(LS_CLICKS, []));
  const [referrals, setReferrals] = useState<AffiliateReferral[]>(() =>
    getStored(LS_REFERRALS, [])
  );
  const [settings, setSettings] = useState<AffiliateSettings>(() =>
    getStored(LS_SETTINGS, DEFAULT_AFFILIATE_SETTINGS)
  );
  const [member, setMember] = useState<AffiliateSession | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      try {
        setMember(JSON.parse(stored));
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }
  }, []);

  const loadAffiliateData = useCallback(async (): Promise<AffiliateMember[]> => {
    if (!isSupabaseConfigured()) return affiliates;
    if (dataLoadedRef.current && affiliates.length > 0) return affiliates;
    dataLoadedRef.current = true;
    try {
      const [affList, clickList, refList, settingsData] = await Promise.all([
        fetchAffiliatesFromSupabase(),
        fetchAffiliateClicksFromSupabase(),
        fetchAffiliateReferralsFromSupabase(),
        fetchAffiliateSettingsFromSupabase(),
      ]);
      if (affList.length) setAffiliates(affList);
      if (clickList.length) setClicks(clickList);
      if (refList.length) setReferrals(refList);
      if (settingsData) setSettings(settingsData);
      return affList.length ? affList : affiliates;
    } catch {
      dataLoadedRef.current = false;
      return affiliates;
    }
  }, [affiliates]);

  useEffect(() => {
    const storedRef = getStored<{ code: string; expiry: number } | null>(REF_KEY, null);
    const hasActiveRef = storedRef && Date.now() < storedRef.expiry;
    if (needsAffiliateData(pathname) || hasActiveRef) {
      void loadAffiliateData();
    }
  }, [pathname, loadAffiliateData]);

  useEffect(() => setStored(LS_AFFILIATES, affiliates), [affiliates]);
  useEffect(() => setStored(LS_CLICKS, clicks), [clicks]);
  useEffect(() => setStored(LS_REFERRALS, referrals), [referrals]);
  useEffect(() => setStored(LS_SETTINGS, settings), [settings]);

  const login = async (email: string, password: string): Promise<boolean> => {
    const found = affiliates.find(
      (a) => a.email.toLowerCase() === email.toLowerCase() && a.status === 'active'
    );
    if (!found || found.password !== password) return false;

    const session: AffiliateSession = {
      id: found.id,
      name: found.name,
      email: found.email,
      affiliateCode: found.affiliateCode,
      commissionRate: found.commissionRate,
    };
    setMember(session);
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return true;
  };

  const logout = () => {
    setMember(null);
    localStorage.removeItem(SESSION_KEY);
  };

  const addAffiliate = async (
    data: Omit<
      AffiliateMember,
      | 'id'
      | 'createdAt'
      | 'updatedAt'
      | 'totalClicks'
      | 'totalConversions'
      | 'totalEarnings'
      | 'pendingEarnings'
      | 'affiliateCode'
    > & { affiliateCode?: string }
  ) => {
    const now = new Date().toISOString();
    let code = data.affiliateCode || generateAffiliateCode(data.name);
    while (affiliates.some((a) => a.affiliateCode === code)) {
      code = generateAffiliateCode(data.name);
    }

    const payload = {
      ...data,
      affiliateCode: code,
      commissionRate: data.commissionRate ?? settings.defaultCommissionRate,
    };

    const inserted = await insertAffiliateDb(payload);
    const newMember: AffiliateMember = inserted ?? {
      id: crypto.randomUUID(),
      ...payload,
      totalClicks: 0,
      totalConversions: 0,
      totalEarnings: 0,
      pendingEarnings: 0,
      createdAt: now,
      updatedAt: now,
    };
    setAffiliates((prev) => [newMember, ...prev]);
    toast.success(`Affiliate member ${newMember.name} added`);
  };

  const updateAffiliate = async (id: string, data: Partial<AffiliateMember>) => {
    await updateAffiliateInSupabase(id, data);
    setAffiliates((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, ...data, updatedAt: new Date().toISOString() } : a
      )
    );
    toast.success('Affiliate updated');
  };

  const deleteAffiliate = async (id: string) => {
    await deleteAffiliateFromSupabase(id);
    setAffiliates((prev) => prev.filter((a) => a.id !== id));
    toast.success('Affiliate removed');
  };

  const updateSettings = async (partial: Partial<AffiliateSettings>) => {
    const next = { ...settings, ...partial };
    await upsertAffiliateSettingsDb(next);
    setSettings(next);
    toast.success('Affiliate settings saved');
  };

  const storeReferralCode = useCallback(
    (code: string) => {
      const expiry = Date.now() + settings.cookieDays * 24 * 60 * 60 * 1000;
      setStored(REF_KEY, { code, expiry });
    },
    [settings.cookieDays]
  );

  const getStoredReferralCode = useCallback((): string | null => {
    const stored = getStored<{ code: string; expiry: number } | null>(REF_KEY, null);
    if (!stored) return null;
    if (Date.now() > stored.expiry) {
      localStorage.removeItem(REF_KEY);
      return null;
    }
    return stored.code;
  }, []);

  const recordClick = async (
    affiliateCode: string,
    source: AffiliateClick['source'],
    productId?: string,
    productName?: string
  ) => {
    const list = affiliates.length === 0 ? await loadAffiliateData() : affiliates;
    const aff = list.find((a) => a.affiliateCode === affiliateCode && a.status === 'active');
    if (!aff) return;

    const clickData = {
      affiliateId: aff.id,
      affiliateCode,
      productId,
      productName,
      source,
    };

    const inserted = await insertAffiliateClickDb(clickData);
    const newClick: AffiliateClick = inserted ?? {
      id: crypto.randomUUID(),
      ...clickData,
      createdAt: new Date().toISOString(),
    };

    setClicks((prev) => [newClick, ...prev]);
    setAffiliates((prev) =>
      prev.map((a) =>
        a.id === aff.id
          ? { ...a, totalClicks: a.totalClicks + 1, updatedAt: new Date().toISOString() }
          : a
      )
    );
    void updateAffiliateInSupabase(aff.id, { totalClicks: aff.totalClicks + 1 });
  };

  const recordConversion = async (
    orderId: string,
    orderNumber: string,
    orderTotal: number
  ) => {
    const code = getStoredReferralCode();
    if (!code) return;

    const list = affiliates.length === 0 ? await loadAffiliateData() : affiliates;
    const aff = list.find((a) => a.affiliateCode === code && a.status === 'active');
    if (!aff) return;

    const commission = calculateCommission(orderTotal, aff.commissionRate);
    const referralData = {
      affiliateId: aff.id,
      affiliateCode: code,
      orderId,
      orderNumber,
      orderTotal,
      commission,
      status: 'pending' as const,
    };

    const inserted = await insertAffiliateReferralDb(referralData);
    const newRef: AffiliateReferral = inserted ?? {
      id: crypto.randomUUID(),
      ...referralData,
      createdAt: new Date().toISOString(),
    };

    setReferrals((prev) => [newRef, ...prev]);
    setAffiliates((prev) =>
      prev.map((a) =>
        a.id === aff.id
          ? {
              ...a,
              totalConversions: a.totalConversions + 1,
              pendingEarnings: a.pendingEarnings + commission,
              updatedAt: new Date().toISOString(),
            }
          : a
      )
    );
    void updateAffiliateInSupabase(aff.id, {
      totalConversions: aff.totalConversions + 1,
      pendingEarnings: aff.pendingEarnings + commission,
    });
  };

  return (
    <AffiliateContext.Provider
      value={{
        affiliates,
        clicks,
        referrals,
        settings,
        member,
        isAffiliateAuthenticated: !!member,
        login,
        logout,
        addAffiliate,
        updateAffiliate,
        deleteAffiliate,
        updateSettings,
        recordClick,
        recordConversion,
        getStoredReferralCode,
        storeReferralCode,
      }}
    >
      {children}
    </AffiliateContext.Provider>
  );
}

export function useAffiliate() {
  const ctx = useContext(AffiliateContext);
  if (!ctx) throw new Error('useAffiliate must be used within AffiliateProvider');
  return ctx;
}
