import { getSupabaseClient, isSupabaseConfigured, getSupabaseConfigHint } from './supabase';
import type { CmsHomeData, CmsPageRecord, CmsContentBlock, CmsPageLayout, CmsBlogPostRecord } from './cms-types';
import type { BlogPost } from './blog-posts';

const CMS_HOME_KEY = 'default';

function logCmsDbError(operation: string, error: { message?: string } | null): void {
  if (!error?.message) return;
  console.warn(`[cms-db] ${operation}:`, error.message);
  if (error.message.includes('fetch failed') || error.message.includes('AbortError')) {
    const hint = getSupabaseConfigHint();
    if (hint) console.warn('[cms-db]', hint);
    else {
      console.warn(
        '[cms-db] Network could not reach Supabase — check internet, project URL, and that the project is not paused in the Supabase dashboard.'
      );
    }
  }
}

export async function fetchCmsHomeFromDb(): Promise<Partial<CmsHomeData> | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('cms_home')
    .select('data')
    .eq('singleton_key', CMS_HOME_KEY)
    .maybeSingle();
  if (error) {
    logCmsDbError('fetchCmsHome', error);
    return null;
  }
  if (!data?.data) return null;
  return data.data as Partial<CmsHomeData>;
}

export async function upsertCmsHomeInDb(payload: CmsHomeData): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  const { error } = await supabase.from('cms_home').upsert(
    {
      singleton_key: CMS_HOME_KEY,
      data: payload,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'singleton_key' }
  );
  if (error) {
    console.warn('[cms-db] upsertCmsHome:', error.message);
    return false;
  }
  return true;
}

function mapBlogRow(r: Record<string, unknown>): CmsBlogPostRecord {
  return {
    id: String(r.id),
    slug: String(r.slug),
    title: String(r.title),
    excerpt: String(r.excerpt),
    date: String(r.date_display ?? r.date ?? ''),
    readTimeMinutes: Number(r.read_time_minutes ?? 5),
    category: r.category ? String(r.category) : undefined,
    image: String(r.image),
    body: Array.isArray(r.body) ? (r.body as string[]) : [],
    published: Boolean(r.published),
    sortOrder: Number(r.sort_order ?? 0),
    createdAt: String(r.created_at ?? ''),
    updatedAt: String(r.updated_at ?? ''),
  };
}

export async function fetchAllCmsBlogPostsFromDb(): Promise<CmsBlogPostRecord[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('cms_blog_posts')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });
  if (error) {
    logCmsDbError('fetchAllCmsBlogPosts', error);
    return [];
  }
  const rows = (data ?? []) as Record<string, unknown>[];
  return rows.map((r) => mapBlogRow(r));
}

export async function fetchPublishedBlogPostsForSite(): Promise<BlogPost[]> {
  const rows = await fetchAllCmsBlogPostsFromDb();
  const published = rows.filter((r) => r.published);
  return published.map(({ id: _id, published: _p, sortOrder: _s, createdAt: _c, updatedAt: _u, ...post }) => post);
}

export async function insertCmsBlogPost(
  row: BlogPost & { published?: boolean; sort_order?: number }
): Promise<CmsBlogPostRecord | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('cms_blog_posts')
    .insert({
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      date_display: row.date,
      read_time_minutes: row.readTimeMinutes,
      category: row.category ?? null,
      image: row.image,
      body: row.body,
      published: row.published ?? true,
      sort_order: row.sort_order ?? 0,
    })
    .select('*')
    .single();
  if (error) {
    console.warn('[cms-db] insertCmsBlogPost:', error.message);
    return null;
  }
  return mapBlogRow(data as Record<string, unknown>);
}

export async function updateCmsBlogPost(
  id: string,
  updates: Partial<BlogPost> & { published?: boolean; sort_order?: number }
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  const row: Record<string, unknown> = {};
  if (updates.slug !== undefined) row.slug = updates.slug;
  if (updates.title !== undefined) row.title = updates.title;
  if (updates.excerpt !== undefined) row.excerpt = updates.excerpt;
  if (updates.date !== undefined) row.date_display = updates.date;
  if (updates.readTimeMinutes !== undefined) row.read_time_minutes = updates.readTimeMinutes;
  if (updates.category !== undefined) row.category = updates.category ?? null;
  if (updates.image !== undefined) row.image = updates.image;
  if (updates.body !== undefined) row.body = updates.body;
  if (updates.published !== undefined) row.published = updates.published;
  if (updates.sort_order !== undefined) row.sort_order = updates.sort_order;
  row.updated_at = new Date().toISOString();
  const { error } = await supabase.from('cms_blog_posts').update(row).eq('id', id);
  if (error) {
    console.warn('[cms-db] updateCmsBlogPost:', error.message);
    return false;
  }
  return true;
}

export async function deleteCmsBlogPost(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  const { error } = await supabase.from('cms_blog_posts').delete().eq('id', id);
  if (error) {
    console.warn('[cms-db] deleteCmsBlogPost:', error.message);
    return false;
  }
  return true;
}

const CMS_PAGE_LAYOUTS = new Set<CmsPageLayout>([
  'default',
  'narrow',
  'full_bleed',
  'full_width',
  'grid',
  'grid_2',
  'grid_3',
]);

function normalizeCmsPageLayout(raw: unknown): CmsPageLayout {
  return CMS_PAGE_LAYOUTS.has(raw as CmsPageLayout) ? (raw as CmsPageLayout) : 'default';
}

function mapPageRow(r: Record<string, unknown>): CmsPageRecord {
  return {
    id: String(r.id),
    slug: String(r.slug),
    title: String(r.title),
    layout: normalizeCmsPageLayout(r.layout),
    published: Boolean(r.published),
    blocks: Array.isArray(r.blocks) ? (r.blocks as CmsContentBlock[]) : [],
    createdAt: String(r.created_at ?? ''),
    updatedAt: String(r.updated_at ?? ''),
  };
}

export async function fetchAllCmsPagesFromDb(): Promise<CmsPageRecord[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from('cms_pages').select('*').order('updated_at', { ascending: false });
  if (error) {
    console.warn('[cms-db] fetchAllCmsPages:', error.message);
    return [];
  }
  const rows = (data ?? []) as Record<string, unknown>[];
  return rows.map(mapPageRow);
}

export async function fetchPublishedCmsPageBySlug(slug: string): Promise<CmsPageRecord | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('cms_pages')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();
  if (error) {
    console.warn('[cms-db] fetchPublishedCmsPageBySlug:', error.message);
    return null;
  }
  if (!data) return null;
  return mapPageRow(data as Record<string, unknown>);
}

export async function fetchCmsPageById(id: string): Promise<CmsPageRecord | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from('cms_pages').select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  return mapPageRow(data as Record<string, unknown>);
}

export async function insertCmsPage(row: {
  slug: string;
  title: string;
  layout?: CmsPageLayout;
  published?: boolean;
  blocks?: CmsContentBlock[];
}): Promise<CmsPageRecord | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('cms_pages')
    .insert({
      slug: row.slug.trim().toLowerCase().replace(/\s+/g, '-'),
      title: row.title,
      layout: row.layout ?? 'default',
      published: row.published ?? false,
      blocks: row.blocks ?? [
        {
          type: 'richtext',
          paragraphs: ['Start editing your page in the admin.'],
          html: '<p>Start editing your page in the admin.</p>',
        },
      ],
    })
    .select('*')
    .single();
  if (error) {
    console.warn('[cms-db] insertCmsPage:', error.message);
    return null;
  }
  return mapPageRow(data as Record<string, unknown>);
}

export async function updateCmsPage(
  id: string,
  updates: Partial<{
    slug: string;
    title: string;
    layout: CmsPageLayout;
    published: boolean;
    blocks: CmsContentBlock[];
  }>
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.slug !== undefined) row.slug = updates.slug.trim().toLowerCase().replace(/\s+/g, '-');
  if (updates.title !== undefined) row.title = updates.title;
  if (updates.layout !== undefined) row.layout = updates.layout;
  if (updates.published !== undefined) row.published = updates.published;
  if (updates.blocks !== undefined) row.blocks = updates.blocks;
  const { error } = await supabase.from('cms_pages').update(row).eq('id', id);
  if (error) {
    console.warn('[cms-db] updateCmsPage:', error.message);
    return false;
  }
  return true;
}

export async function deleteCmsPage(id: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  const { error } = await supabase.from('cms_pages').delete().eq('id', id);
  if (error) {
    console.warn('[cms-db] deleteCmsPage:', error.message);
    return false;
  }
  return true;
}
