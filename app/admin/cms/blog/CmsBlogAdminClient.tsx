'use client';

import { useCallback, useEffect, useState } from 'react';
import { BLOG_POSTS } from '../../../lib/blog-posts';
import type { CmsBlogPostRecord } from '../../../lib/cms-types';
import {
  fetchAllCmsBlogPostsFromDb,
  insertCmsBlogPost,
  updateCmsBlogPost,
  deleteCmsBlogPost,
} from '../../../lib/cms-db';
import { isSupabaseConfigured } from '../../../lib/supabase';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { toast } from 'sonner';
import { Pencil, Trash2, Download } from 'lucide-react';

const emptyForm = {
  slug: '',
  title: '',
  excerpt: '',
  date: '',
  readTimeMinutes: 5,
  category: '',
  image: '',
  bodyText: '',
  published: true,
  sort_order: 0,
};

export function CmsBlogAdminClient() {
  const [rows, setRows] = useState<CmsBlogPostRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    setRows(await fetchAllCmsBlogPostsFromDb());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (r: CmsBlogPostRecord) => {
    setEditingId(r.id);
    setForm({
      slug: r.slug,
      title: r.title,
      excerpt: r.excerpt,
      date: r.date,
      readTimeMinutes: r.readTimeMinutes,
      category: r.category ?? '',
      image: r.image,
      bodyText: r.body.join('\n\n'),
      published: r.published,
      sort_order: r.sortOrder,
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!isSupabaseConfigured()) {
      toast.error('Supabase is not configured.');
      return;
    }
    const body = form.bodyText
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (!form.slug.trim() || !form.title.trim()) {
      toast.error('Slug and title are required.');
      return;
    }
    if (editingId) {
      const ok = await updateCmsBlogPost(editingId, {
        slug: form.slug.trim(),
        title: form.title,
        excerpt: form.excerpt,
        date: form.date,
        readTimeMinutes: form.readTimeMinutes,
        category: form.category || undefined,
        image: form.image,
        body,
        published: form.published,
        sort_order: form.sort_order,
      });
      if (ok) {
        toast.success('Post updated');
        setDialogOpen(false);
        load();
      } else toast.error('Update failed');
    } else {
      const created = await insertCmsBlogPost({
        slug: form.slug.trim(),
        title: form.title,
        excerpt: form.excerpt,
        date:
          form.date ||
          new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        readTimeMinutes: form.readTimeMinutes,
        category: form.category || undefined,
        image: form.image,
        body,
        published: form.published,
        sort_order: form.sort_order,
      });
      if (created) {
        toast.success('Post created');
        setDialogOpen(false);
        load();
      } else toast.error('Create failed (duplicate slug?)');
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    const ok = await deleteCmsBlogPost(id);
    if (ok) {
      toast.success('Deleted');
      load();
    } else toast.error('Delete failed');
  };

  const seed = async () => {
    if (!isSupabaseConfigured()) {
      toast.error('Supabase is not configured.');
      return;
    }
    let n = 0;
    for (let i = 0; i < BLOG_POSTS.length; i += 1) {
      const p = BLOG_POSTS[i];
      const existing = rows.some((r) => r.slug === p.slug);
      if (existing) continue;
      const created = await insertCmsBlogPost({ ...p, published: true, sort_order: n });
      if (created) n += 1;
    }
    toast.success(n ? `Imported ${n} posts` : 'No new posts to import (slugs already exist)');
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog (CMS)</h1>
          <p className="text-sm text-gray-600 mt-1">
            When at least one published row exists in Supabase, the live site uses this list instead of
            built-in posts in blog-posts.ts.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={seed}>
            <Download className="w-4 h-4 mr-2" />
            Import built-in posts
          </Button>
          <Button type="button" onClick={openNew}>
            New post
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-600">Loading</p>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Slug</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                    No rows in cms_blog_posts. Import built-in posts or add one.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.slug}</TableCell>
                    <TableCell className="max-w-xs truncate">{r.title}</TableCell>
                    <TableCell>{r.published ? 'Yes' : 'No'}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button type="button" variant="ghost" size="icon" onClick={() => openEdit(r)}>
                        <Pencil className="w-4 h-4" />
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
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit post' : 'New post'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div>
              <Label>Slug (URL)</Label>
              <Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
            </div>
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <Label>Excerpt</Label>
              <Textarea
                rows={2}
                value={form.excerpt}
                onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Display date</Label>
                <Input value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
              </div>
              <div>
                <Label>Read time (min)</Label>
                <Input
                  type="number"
                  value={form.readTimeMinutes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, readTimeMinutes: Number(e.target.value) || 0 }))
                  }
                />
              </div>
            </div>
            <div>
              <Label>Category</Label>
              <Input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
            </div>
            <div>
              <Label>Image URL</Label>
              <Input value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} />
            </div>
            <div>
              <Label>Body (paragraphs separated by a blank line)</Label>
              <Textarea
                rows={8}
                value={form.bodyText}
                onChange={(e) => setForm((f) => ({ ...f, bodyText: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Sort order</Label>
                <Input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, sort_order: Number(e.target.value) || 0 }))
                  }
                />
              </div>
              <label className="flex items-center gap-2 text-sm mt-8">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
                />
                Published
              </label>
            </div>
            <Button type="button" className="w-full" onClick={save}>
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
