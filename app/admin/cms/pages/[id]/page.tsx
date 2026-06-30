'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { fetchCmsPageById, updateCmsPage } from '../../../../lib/cms-db';
import { isReservedCmsPageSlug } from '../../../../lib/cms-slugs';
import type { CmsContentBlock, CmsPageLayout, CmsPageRecord } from '../../../../lib/cms-types';
import { isSupabaseConfigured } from '../../../../lib/supabase';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';
import { CmsPageBlocksEditor } from '../../../../components/admin/CmsPageBlocksEditor';
import { cmsPagePublicPath } from '../../../../lib/nav-links';
import { toast } from 'sonner';
import { Copy, ExternalLink } from 'lucide-react';

const exampleBlocks: CmsContentBlock[] = [
  {
    type: 'hero',
    title: 'Section headline',
    subtitle: 'Optional subtitle',
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=1200&h=500&fit=crop',
  },
  {
    type: 'richtext',
    paragraphs: ['First paragraph.', 'Second paragraph.'],
    html: '<p>First paragraph.</p><p>Second paragraph.</p>',
  },
  {
    type: 'image',
    src: 'https://images.unsplash.com/photo-1620916566398-39b1148bad5e?w=1200&h=600&fit=crop',
    caption: 'Optional caption',
    width: 'contained',
  },
];

export default function CmsPageEditorPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';

  const [page, setPage] = useState<CmsPageRecord | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [layout, setLayout] = useState<CmsPageLayout>('default');
  const [published, setPublished] = useState(false);
  const [blocks, setBlocks] = useState<CmsContentBlock[]>([]);
  const [advancedJson, setAdvancedJson] = useState('');
  const [loading, setLoading] = useState(true);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') setOrigin(window.location.origin);
  }, []);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const p = await fetchCmsPageById(id);
    if (p) {
      setPage(p);
      setTitle(p.title);
      setSlug(p.slug);
      setLayout(p.layout);
      setPublished(p.published);
      setBlocks(Array.isArray(p.blocks) ? [...p.blocks] : []);
      setAdvancedJson(JSON.stringify(p.blocks ?? [], null, 2));
    } else setPage(null);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const refreshJsonFromBlocks = () => {
    setAdvancedJson(JSON.stringify(blocks, null, 2));
    toast.message('JSON field updated from blocks');
  };

  const applyAdvancedJson = () => {
    try {
      const parsed = JSON.parse(advancedJson) as unknown;
      if (!Array.isArray(parsed)) throw new Error('not array');
      setBlocks(parsed as CmsContentBlock[]);
      toast.success('Applied JSON to blocks');
    } catch {
      toast.error('Invalid JSON array');
    }
  };

  const loadExample = () => {
    setBlocks(exampleBlocks.map((b) => ({ ...b })));
    toast.success('Loaded example blocks');
  };

  const save = async () => {
    if (!isSupabaseConfigured() || !id) {
      toast.error('Missing configuration or id.');
      return;
    }
    if (isReservedCmsPageSlug(slug)) {
      toast.error('That slug is reserved.');
      return;
    }
    const ok = await updateCmsPage(id, {
      slug,
      title,
      layout,
      published,
      blocks,
    });
    if (ok) {
      toast.success('Saved');
      load();
    } else toast.error('Save failed');
  };

  if (loading) return <p className="text-sm text-gray-600">Loading…</p>;
  if (!page) {
    return (
      <div className="space-y-4">
        <p className="text-gray-600">Page not found.</p>
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/cms/pages">Back to list</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button type="button" variant="outline" size="sm" asChild>
          <Link href="/admin/cms/pages">← All pages</Link>
        </Button>
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit page</h1>
        <p className="text-sm text-gray-600 mt-1">
          Drag blocks to reorder. Add hero, text, or image sections. Types: hero, richtext, image.
        </p>
      </div>

      <div className="rounded-lg border border-blue-100 bg-blue-50/90 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-semibold text-gray-900">Public page link</span>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="bg-white"
              onClick={() => {
                const path = cmsPagePublicPath(slug);
                const full = origin ? `${origin}${path}` : path;
                void navigator.clipboard.writeText(full).then(
                  () => toast.success('URL copied'),
                  () => toast.error('Could not copy')
                );
              }}
            >
              <Copy className="w-4 h-4 mr-1" />
              Copy URL
            </Button>
            {published && (
              <Button type="button" variant="outline" size="sm" className="bg-white" asChild>
                <a href={cmsPagePublicPath(slug)} target="_blank" rel="noreferrer">
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Open
                </a>
              </Button>
            )}
          </div>
        </div>
        <p className="text-sm font-mono text-gray-800 break-all">
          {origin ? `${origin}${cmsPagePublicPath(slug)}` : cmsPagePublicPath(slug)}
        </p>
        {!published && (
          <p className="text-xs text-amber-900">
            This page is a draft. The URL above will 404 for visitors until you enable Published below.
          </p>
        )}
      </div>

      <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
        <div>
          <Label>Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <Label>Slug</Label>
          <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
        </div>
        <div>
          <Label>Layout</Label>
          <select
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={layout}
            onChange={(e) => setLayout(e.target.value as CmsPageLayout)}
          >
            <option value="default">default (readable width)</option>
            <option value="narrow">narrow</option>
            <option value="full_width">full width (wide column)</option>
            <option value="full_bleed">full bleed</option>
            <option value="grid">magazine grid (hero/text full row, images 2-col)</option>
            <option value="grid_2">grid 2 columns (set each block width below)</option>
            <option value="grid_3">grid 3 columns (set each block width below)</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
          Published (live at your domain + /{slug || '…'})
        </label>

        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-base">Content blocks</Label>
            <Button type="button" variant="outline" size="sm" onClick={loadExample}>
              Load example set
            </Button>
          </div>
          <CmsPageBlocksEditor blocks={blocks} onChange={setBlocks} pageLayout={layout} />
        </div>

        <details className="rounded-md border border-gray-100 bg-gray-50/50 p-3 text-sm">
          <summary className="cursor-pointer font-medium text-gray-800">Advanced: edit JSON</summary>
          <p className="text-gray-600 mt-2 mb-2">
            Paste a valid blocks array and click Apply, or copy the current structure.
          </p>
          <Textarea
            rows={12}
            className="font-mono text-xs bg-white"
            value={advancedJson}
            onChange={(e) => setAdvancedJson(e.target.value)}
          />
          <div className="flex flex-wrap gap-2 mt-2">
            <Button type="button" variant="outline" size="sm" onClick={refreshJsonFromBlocks}>
              Refresh JSON from blocks
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={applyAdvancedJson}>
              Apply JSON to blocks
            </Button>
          </div>
        </details>

        <Button type="button" onClick={save}>
          Save changes
        </Button>
      </div>
    </div>
  );
}
