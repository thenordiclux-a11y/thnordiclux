import type { CmsSocialLink, CmsSocialPlatform } from './cms-types';

const PLATFORMS: CmsSocialPlatform[] = [
  'facebook',
  'instagram',
  'twitter',
  'x',
  'youtube',
  'tiktok',
  'linkedin',
  'whatsapp',
  'pinterest',
  'snapchat',
  'custom',
];

export function normalizeSocialLink(raw: unknown): CmsSocialLink | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id =
    typeof r.id === 'string' && r.id.trim() ? r.id.trim() : `social-${Date.now()}`;
  const href = typeof r.href === 'string' && r.href.trim() ? r.href.trim() : '';
  const p = r.platform as CmsSocialPlatform;
  const platform = PLATFORMS.includes(p) ? p : 'custom';
  return {
    id,
    platform,
    href,
    enabled: r.enabled !== false,
    label: typeof r.label === 'string' ? r.label : undefined,
  };
}

export function mergeSocialLinks(stored: CmsSocialLink[] | undefined | null): CmsSocialLink[] {
  if (!stored || !Array.isArray(stored)) return [];
  const out: CmsSocialLink[] = [];
  for (const item of stored) {
    const row = normalizeSocialLink(item);
    if (row) out.push(row);
  }
  return out;
}

export function newSocialLink(platform: CmsSocialPlatform = 'instagram'): CmsSocialLink {
  const id =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? `social-${crypto.randomUUID()}`
      : `social-${Date.now()}`;
  return {
    id,
    platform,
    href: 'https://',
    enabled: true,
  };
}

export const SOCIAL_PLATFORM_LABELS: Record<CmsSocialPlatform, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  twitter: 'Twitter',
  x: 'X (Twitter)',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
  whatsapp: 'WhatsApp',
  pinterest: 'Pinterest',
  snapchat: 'Snapchat',
  custom: 'Custom link',
};
