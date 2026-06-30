'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchAllCmsPagesFromDb, insertCmsPage, deleteCmsPage } from '../../../lib/cms-db';
import { isReservedCmsPageSlug } from '../../../lib/cms-slugs';
import type { CmsPageRecord } from '../../../lib/cms-types';
import { cmsPagePublicPath } from '../../../lib/nav-links';
import { isSupabaseConfigured } from '../../../lib/supabase';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { toast } from 'sonner';
import { Trash2, ExternalLink, Copy, Link2 } from 'lucide-react';

function copyText(text: string, message = 'Copied to clipboard') {
  void navigator.clipboard.writeText(text).then(
    () => toast.success(message),
    () => toast.error('Could not copy')
  );
}

export default function CmsPagesListPage() {
  const router = useRouter();
  const [rows, setRows] = useState<CmsPageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [origin, setOrigin] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setRows(await fetchAllCmsPagesFromDb());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (typeof window !== 'undefined') setOrigin(window.location.origin);
  }, []);

  const create = async () => {
    if (!isSupabaseConfigured()) {
      toast.error('Supabase is not configured.');
      return;
    }
    const s = slug.trim().toLowerCase().replace(/\s+/g, '-');
    if (!s || !title.trim()) {
      toast.error('Slug and title are required.');
      return;
    }
    if (isReservedCmsPageSlug(s)) {
      toast.error('That slug is reserved for the app routes.');
      return;
    }
    const created = await insertCmsPage({ slug: s, title: title.trim(), published: false });
    if (created) {
      const path = cmsPagePublicPath(created.slug);
      toast.success(`Page created. Link: ${path}${origin ? ` (full URL on the edit screen)` : ''}`);
      setSlug('');
      setTitle('');
      await load();
      router.push(`/admin/cms/pages/${created.id}`);
    } else toast.error('Could not create (duplicate slug?)');
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this page?')) return;
    const ok = await deleteCmsPage(id);
    if (ok) {
      toast.success('Deleted');
      load();
    } else toast.error('Delete failed');
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Site pages (CMS)</h1>
        <p className="text-sm text-gray-600 mt-1">
          Public URL is <code className="text-xs bg-gray-100 px-1 rounded">your-domain.com/your-slug</code> (path{' '}
          <code className="text-xs bg-gray-100 px-1 rounded">/your-slug</code>). Old{' '}
          <code className="text-xs bg-gray-100 px-1 rounded">/pages/your-slug</code> links redirect here. Publish when
          the page should be public.
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-4 max-w-xl">
        <h2 className="font-semibold text-gray-900">New page</h2>
        <div>
          <Label htmlFor="nslug">Slug</Label>
          <Input
            id="nslug"
            placeholder="about-us"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
          {slug.trim() && (
            <p className="text-xs text-gray-500 mt-1.5 font-mono">
              Path: {cmsPagePublicPath(slug)}
              {origin ? (
                <>
                  {' · '}
                  <button
                    type="button"
                    className="text-blue-600 hover:underline"
                    onClick={() => copyText(`${origin}${cmsPagePublicPath(slug)}`)}
                  >
                    Copy full URL
                  </button>
                </>
              ) : null}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="ntitle">Title</Label>
          <Input id="ntitle" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <Button type="button" onClick={create}>
          Create draft and open editor
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-600">Loading</p>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Slug</TableHead>
                <TableHead>Public path</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Layout</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                    No pages yet.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r) => {
                  const path = cmsPagePublicPath(r.slug);
                  const full = origin ? `${origin}${path}` : path;
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-xs">{r.slug}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-1">
                          <code className="text-xs bg-gray-50 px-1.5 py-0.5 rounded max-w-[200px] truncate inline-block align-middle">
                            {path}
                          </code>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0"
                            title="Copy full URL"
                            onClick={() => copyText(full)}
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>{r.title}</TableCell>
                      <TableCell>{r.layout}</TableCell>
                      <TableCell>{r.published ? 'Yes' : 'No'}</TableCell>
                      <TableCell className="text-right space-x-1">
                        {r.published ? (
                          <a
                            href={path}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center h-8 w-8 rounded-md text-blue-600 hover:bg-gray-100"
                            title="Open live page"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        ) : (
                          <span
                            className="inline-flex items-center justify-center h-8 w-8 text-gray-300 cursor-not-allowed"
                            title="Publish the page to open the public URL"
                          >
                            <Link2 className="w-4 h-4" />
                          </span>
                        )}
                        <Button type="button" variant="outline" size="sm" asChild>
                          <Link href={`/admin/cms/pages/${r.id}`}>Edit</Link>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-red-600"
                          onClick={() => remove(r.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
