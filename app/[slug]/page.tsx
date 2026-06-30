import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { CmsPublishedPageView } from '../components/CmsPublishedPageView';
import { fetchPublishedCmsPageBySlug } from '../lib/cms-db';
import { isReservedCmsPageSlug } from '../lib/cms-slugs';
import { cmsPagePublicPath } from '../lib/nav-links';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  if (isReservedCmsPageSlug(slug)) return { title: 'Not found' };
  const page = await fetchPublishedCmsPageBySlug(slug);
  if (!page) return { title: 'Not found' };

  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? '';
  const proto = h.get('x-forwarded-proto') ?? 'https';
  const path = cmsPagePublicPath(page.slug);
  const canonical = host ? `${proto}://${host}${path}` : path;

  return {
    title: page.title,
    alternates: { canonical },
    openGraph: {
      title: page.title,
      url: canonical,
    },
  };
}

export default async function CmsPageAtRoot({ params }: Props) {
  const { slug } = await params;
  if (isReservedCmsPageSlug(slug)) notFound();

  const page = await fetchPublishedCmsPageBySlug(slug);
  if (!page) notFound();

  return <CmsPublishedPageView page={page} />;
}
