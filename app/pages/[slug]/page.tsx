import { permanentRedirect } from 'next/navigation';
import { cmsPagePublicPath } from '../../lib/nav-links';

export const dynamic = 'force-dynamic';

/** Legacy `/pages/slug` → canonical `/{slug}` for correct public URLs and backlinks. */
export default async function LegacyCmsPageRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  permanentRedirect(cmsPagePublicPath(slug));
}
