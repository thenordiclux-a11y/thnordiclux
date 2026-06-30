import { unstable_cache } from 'next/cache';
import { BLOG_POSTS, getPostBySlug as getStaticPostBySlug, type BlogPost } from './blog-posts';
import { fetchCmsHomeFromDb, fetchPublishedBlogPostsForSite } from './cms-db';
import { mergeCmsHome } from './cms-defaults';
import type { CmsHomeData } from './cms-types';

const CMS_REVALIDATE_SECONDS = 120;

const getCachedCmsHome = unstable_cache(
  async (): Promise<CmsHomeData> => {
    const partial = await fetchCmsHomeFromDb();
    return mergeCmsHome(partial);
  },
  ['site-cms-home'],
  { revalidate: CMS_REVALIDATE_SECONDS, tags: ['cms-home'] }
);

const getCachedBlogPosts = unstable_cache(
  async (): Promise<BlogPost[]> => {
    const fromDb = await fetchPublishedBlogPostsForSite();
    if (fromDb.length > 0) return fromDb;
    return BLOG_POSTS;
  },
  ['site-blog-posts'],
  { revalidate: CMS_REVALIDATE_SECONDS, tags: ['cms-blog'] }
);

/** CMS home with short server cache (revalidated after admin saves). */
export async function getSiteCmsHome(): Promise<CmsHomeData> {
  return getCachedCmsHome();
}

export async function getSiteBlogPosts(): Promise<BlogPost[]> {
  return getCachedBlogPosts();
}

export async function getSiteBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
  const posts = await getSiteBlogPosts();
  const fromMerged = posts.find((p) => p.slug === slug);
  if (fromMerged) return fromMerged;
  return getStaticPostBySlug(slug);
}
