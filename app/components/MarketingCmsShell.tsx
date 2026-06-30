import type { ReactNode } from 'react';
import { MarketingSiteChrome } from './MarketingSiteChrome';
import { getSiteCmsHome } from '../lib/cms-site';

/** Shared storefront chrome: announcement, CMS header/nav, CMS footer (server-fetched). */
export async function MarketingCmsShell({ children }: { children: ReactNode }) {
  const cms = await getSiteCmsHome();
  return (
    <MarketingSiteChrome
      announcement={cms.announcement}
      headerNavLinks={cms.headerNavLinks}
      headerNavTrackLink={cms.headerNavTrackLink}
      siteMarketingHeader={cms.siteMarketingHeader}
      siteFooterChrome={cms.siteFooterChrome}
    >
      {children}
    </MarketingSiteChrome>
  );
}
