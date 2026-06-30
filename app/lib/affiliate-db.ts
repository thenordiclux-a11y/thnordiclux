import { getSupabaseClient, isSupabaseConfigured } from './supabase';
import type {
  AffiliateMember,
  AffiliateClick,
  AffiliateReferral,
  AffiliateSettings,
} from './affiliate-types';

function rowToMember(r: Record<string, unknown>): AffiliateMember {
  return {
    id: String(r.id),
    name: String(r.name),
    email: String(r.email),
    password: String(r.password ?? ''),
    affiliateCode: String(r.affiliate_code),
    commissionRate: Number(r.commission_rate ?? 10),
    status: r.status as AffiliateMember['status'],
    phone: r.phone != null ? String(r.phone) : undefined,
    bio: r.bio != null ? String(r.bio) : undefined,
    socialHandles: (r.social_handles as AffiliateMember['socialHandles']) ?? undefined,
    totalClicks: Number(r.total_clicks ?? 0),
    totalConversions: Number(r.total_conversions ?? 0),
    totalEarnings: Number(r.total_earnings ?? 0),
    pendingEarnings: Number(r.pending_earnings ?? 0),
    createdAt: String(r.created_at),
    updatedAt: String(r.updated_at),
  };
}

function rowToClick(r: Record<string, unknown>): AffiliateClick {
  return {
    id: String(r.id),
    affiliateId: String(r.affiliate_id),
    affiliateCode: String(r.affiliate_code),
    productId: r.product_id != null ? String(r.product_id) : undefined,
    productName: r.product_name != null ? String(r.product_name) : undefined,
    source: r.source as AffiliateClick['source'],
    createdAt: String(r.created_at),
  };
}

function rowToReferral(r: Record<string, unknown>): AffiliateReferral {
  return {
    id: String(r.id),
    affiliateId: String(r.affiliate_id),
    affiliateCode: String(r.affiliate_code),
    orderId: String(r.order_id),
    orderNumber: String(r.order_number),
    orderTotal: Number(r.order_total),
    commission: Number(r.commission),
    status: r.status as AffiliateReferral['status'],
    createdAt: String(r.created_at),
  };
}

export async function fetchAffiliatesFromSupabase(): Promise<AffiliateMember[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('affiliate_members')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.warn('[affiliate-db] fetchAffiliates error:', error.message);
    return [];
  }
  return (data ?? []).map((r: Record<string, unknown>) => rowToMember(r));
}

export async function insertAffiliateDb(
  member: Omit<AffiliateMember, 'id' | 'createdAt' | 'updatedAt' | 'totalClicks' | 'totalConversions' | 'totalEarnings' | 'pendingEarnings'>
): Promise<AffiliateMember | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('affiliate_members')
    .insert({
      name: member.name,
      email: member.email,
      password: member.password,
      affiliate_code: member.affiliateCode,
      commission_rate: member.commissionRate,
      status: member.status,
      phone: member.phone ?? null,
      bio: member.bio ?? null,
      social_handles: member.socialHandles ?? null,
    })
    .select('*')
    .single();
  if (error) {
    console.warn('[affiliate-db] insertAffiliate error:', error.message);
    return null;
  }
  return rowToMember(data as Record<string, unknown>);
}

export async function updateAffiliateInSupabase(
  id: string,
  updates: Partial<AffiliateMember>
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  const row: Record<string, unknown> = {};
  if (updates.name !== undefined) row.name = updates.name;
  if (updates.email !== undefined) row.email = updates.email;
  if (updates.password !== undefined) row.password = updates.password;
  if (updates.affiliateCode !== undefined) row.affiliate_code = updates.affiliateCode;
  if (updates.commissionRate !== undefined) row.commission_rate = updates.commissionRate;
  if (updates.status !== undefined) row.status = updates.status;
  if (updates.phone !== undefined) row.phone = updates.phone ?? null;
  if (updates.bio !== undefined) row.bio = updates.bio ?? null;
  if (updates.socialHandles !== undefined) row.social_handles = updates.socialHandles ?? null;
  if (updates.totalClicks !== undefined) row.total_clicks = updates.totalClicks;
  if (updates.totalConversions !== undefined) row.total_conversions = updates.totalConversions;
  if (updates.totalEarnings !== undefined) row.total_earnings = updates.totalEarnings;
  if (updates.pendingEarnings !== undefined) row.pending_earnings = updates.pendingEarnings;
  const { error } = await supabase.from('affiliate_members').update(row).eq('id', id);
  if (error) {
    console.warn('[affiliate-db] updateAffiliate error:', error.message);
    return false;
  }
  return true;
}

export async function deleteAffiliateFromSupabase(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  const { error } = await supabase.from('affiliate_members').delete().eq('id', id);
  if (error) {
    console.warn('[affiliate-db] deleteAffiliate error:', error.message);
    return false;
  }
  return true;
}

export async function fetchAffiliateClicksFromSupabase(): Promise<AffiliateClick[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('affiliate_clicks')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.warn('[affiliate-db] fetchClicks error:', error.message);
    return [];
  }
  return (data ?? []).map((r: Record<string, unknown>) => rowToClick(r));
}

export async function insertAffiliateClickDb(
  click: Omit<AffiliateClick, 'id' | 'createdAt'>
): Promise<AffiliateClick | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('affiliate_clicks')
    .insert({
      affiliate_id: click.affiliateId,
      affiliate_code: click.affiliateCode,
      product_id: click.productId ?? null,
      product_name: click.productName ?? null,
      source: click.source,
    })
    .select('*')
    .single();
  if (error) {
    console.warn('[affiliate-db] insertClick error:', error.message);
    return null;
  }
  return rowToClick(data as Record<string, unknown>);
}

export async function fetchAffiliateReferralsFromSupabase(): Promise<AffiliateReferral[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('affiliate_referrals')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.warn('[affiliate-db] fetchReferrals error:', error.message);
    return [];
  }
  return (data ?? []).map((r: Record<string, unknown>) => rowToReferral(r));
}

export async function insertAffiliateReferralDb(
  referral: Omit<AffiliateReferral, 'id' | 'createdAt'>
): Promise<AffiliateReferral | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('affiliate_referrals')
    .insert({
      affiliate_id: referral.affiliateId,
      affiliate_code: referral.affiliateCode,
      order_id: referral.orderId,
      order_number: referral.orderNumber,
      order_total: referral.orderTotal,
      commission: referral.commission,
      status: referral.status,
    })
    .select('*')
    .single();
  if (error) {
    console.warn('[affiliate-db] insertReferral error:', error.message);
    return null;
  }
  return rowToReferral(data as Record<string, unknown>);
}

export async function fetchAffiliateSettingsFromSupabase(): Promise<AffiliateSettings | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from('affiliate_settings').select('*').eq('id', 1).maybeSingle();
  if (error || !data) return null;
  return {
    defaultCommissionRate: Number(data.default_commission_rate ?? 10),
    cookieDays: Number(data.cookie_days ?? 30),
    programName: String(data.program_name ?? 'Nordic Lux Affiliate Program'),
    programDescription: String(data.program_description ?? ''),
  };
}

export async function upsertAffiliateSettingsDb(settings: AffiliateSettings): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  const { error } = await supabase.from('affiliate_settings').upsert({
    id: 1,
    default_commission_rate: settings.defaultCommissionRate,
    cookie_days: settings.cookieDays,
    program_name: settings.programName,
    program_description: settings.programDescription,
  });
  if (error) {
    console.warn('[affiliate-db] upsertSettings error:', error.message);
    return false;
  }
  return true;
}
