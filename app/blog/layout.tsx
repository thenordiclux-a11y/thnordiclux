import type { ReactNode } from 'react';
import { MarketingCmsShell } from '../components/MarketingCmsShell';

export const dynamic = 'force-dynamic';

export default function BlogLayout({ children }: { children: ReactNode }) {
  return <MarketingCmsShell>{children}</MarketingCmsShell>;
}
