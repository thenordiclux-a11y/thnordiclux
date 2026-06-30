'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Copy,
  Facebook,
  Mail,
  MessageCircle,
  Share2,
  Twitter,
  Instagram,
  Pin,
} from 'lucide-react';
import { Button } from './ui/button';
import type { Product } from '../contexts/DataContext';
import {
  buildAffiliateLink,
  buildShareText,
  buildSocialShareUrl,
  type SocialPlatform,
} from '../lib/affiliate-utils';
import { useAffiliate } from '../contexts/AffiliateContext';

interface AffiliateSharePanelProps {
  product: Product;
  affiliateCode: string;
  compact?: boolean;
}

const SOCIAL_BUTTONS: { platform: SocialPlatform; label: string; icon: typeof Facebook; color: string }[] = [
  { platform: 'facebook', label: 'Facebook', icon: Facebook, color: 'hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200' },
  { platform: 'twitter', label: 'X / Twitter', icon: Twitter, color: 'hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200' },
  { platform: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: 'hover:bg-green-50 hover:text-green-600 hover:border-green-200' },
  { platform: 'pinterest', label: 'Pinterest', icon: Pin, color: 'hover:bg-red-50 hover:text-red-600 hover:border-red-200' },
  { platform: 'email', label: 'Email', icon: Mail, color: 'hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300' },
];

export function AffiliateSharePanel({ product, affiliateCode, compact }: AffiliateSharePanelProps) {
  const { recordClick } = useAffiliate();
  const [copied, setCopied] = useState(false);

  const link = buildAffiliateLink(affiliateCode, '/shop', product.id);
  const shareText = buildShareText(product, affiliateCode);

  const trackAndOpen = (platform: SocialPlatform) => {
    recordClick(affiliateCode, platform === 'twitter' ? 'twitter' : platform, product.id, product.name);

    if (platform === 'instagram') {
      navigator.clipboard.writeText(`${shareText}\n${link}`);
      toast.success('Link copied! Paste it in your Instagram bio, story, or post.');
      return;
    }

    const url = buildSocialShareUrl(platform, link, shareText);
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=500');
  };

  const copyLink = async () => {
    recordClick(affiliateCode, 'copy', product.id, product.name);
    await navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Affiliate link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const nativeShare = async () => {
    recordClick(affiliateCode, 'native', product.id, product.name);
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, text: shareText, url: link });
      } catch {
        copyLink();
      }
    } else {
      copyLink();
    }
  };

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={copyLink} className="gap-1.5">
          <Copy className="w-3.5 h-3.5" />
          {copied ? 'Copied!' : 'Copy link'}
        </Button>
        <Button size="sm" onClick={nativeShare} className="gap-1.5">
          <Share2 className="w-3.5 h-3.5" />
          Share
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          readOnly
          value={link}
          className="flex-1 text-xs bg-gray-50 border rounded-lg px-3 py-2 truncate font-mono"
        />
        <Button size="sm" variant="outline" onClick={copyLink} className="shrink-0 gap-1.5">
          <Copy className="w-3.5 h-3.5" />
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {SOCIAL_BUTTONS.map(({ platform, label, icon: Icon, color }) => (
          <button
            key={platform}
            type="button"
            onClick={() => trackAndOpen(platform)}
            className={`flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium border rounded-lg transition-colors ${color}`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => trackAndOpen('instagram')}
          className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium border rounded-lg transition-colors hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200"
        >
          <Instagram className="w-4 h-4" />
          Instagram
        </button>
      </div>

      {typeof navigator !== 'undefined' && 'share' in navigator && (
        <Button variant="secondary" size="sm" onClick={nativeShare} className="w-full gap-2">
          <Share2 className="w-4 h-4" />
          Share via device
        </Button>
      )}
    </div>
  );
}
