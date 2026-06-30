'use client';

import {
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Twitter,
  MessageCircle,
  Link2,
} from 'lucide-react';
import type { CmsSocialPlatform } from '../lib/cms-types';

export function SocialPlatformIcon({
  platform,
  className = 'w-5 h-5',
}: {
  platform: CmsSocialPlatform;
  className?: string;
}) {
  switch (platform) {
    case 'facebook':
      return <Facebook className={className} />;
    case 'instagram':
      return <Instagram className={className} />;
    case 'linkedin':
      return <Linkedin className={className} />;
    case 'youtube':
      return <Youtube className={className} />;
    case 'twitter':
    case 'x':
      return <Twitter className={className} />;
    case 'whatsapp':
      return <MessageCircle className={className} />;
    default:
      return <Link2 className={className} />;
  }
}
