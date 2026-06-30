'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { mergeCmsHome } from '../../../lib/cms-defaults';
import type { CmsHomeData, CmsMarketingHeader } from '../../../lib/cms-types';
import { DEFAULT_MARKETING_HEADER } from '../../../lib/cms-marketing-header';
import { revalidateAfterCmsHomeSave } from '../../../actions/revalidate-cms';
import { fetchCmsHomeFromDb, upsertCmsHomeInDb } from '../../../lib/cms-db';
import { isSupabaseConfigured } from '../../../lib/supabase';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

export default function CmsMarketingHeaderPage() {
  const [data, setData] = useState<CmsHomeData>(() => mergeCmsHome(null));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const h = data.siteMarketingHeader ?? DEFAULT_MARKETING_HEADER;

  const load = useCallback(async () => {
    setLoading(true);
    const partial = await fetchCmsHomeFromDb();
    setData(mergeCmsHome(partial));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const patch = (patch: Partial<CmsMarketingHeader>) => {
    setData((d) => ({
      ...d,
      siteMarketingHeader: { ...(d.siteMarketingHeader ?? DEFAULT_MARKETING_HEADER), ...patch },
    }));
  };

  const restoreDefaults = () => {
    setData((d) => ({ ...d, siteMarketingHeader: { ...DEFAULT_MARKETING_HEADER } }));
    toast.message('Reset to built-in defaults (not saved yet).');
  };

  const save = async () => {
    if (!isSupabaseConfigured()) {
      toast.error('Supabase is not configured.');
      return;
    }
    setSaving(true);
    const ok = await upsertCmsHomeInDb(data);
    setSaving(false);
    if (ok) {
      await revalidateAfterCmsHomeSave();
      toast.success('Marketing header saved');
    } else toast.error('Save failed. Check console and database tables.');
  };

  if (loading) {
    return <p className="text-sm text-gray-600">Loading…</p>;
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/admin/cms"
            className="mb-2 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            CMS overview
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Marketing header</h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-600">
            Logo, tagline, search placeholders, and toolbar icons for the sticky header. Menu links stay under{' '}
            <Link href="/admin/cms/navigation" className="text-blue-600 hover:underline">
              Navigation
            </Link>
            .
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={restoreDefaults}>
            Restore defaults
          </Button>
          <Button type="button" variant="outline" onClick={load}>
            Reload from database
          </Button>
          <Button type="button" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save to Supabase'}
          </Button>
        </div>
      </div>

      <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="font-semibold text-gray-900">Layout</h2>
        <div>
          <Label htmlFor="hdr-layout">Header width</Label>
          <select
            id="hdr-layout"
            className="mt-1 h-10 w-full max-w-md rounded-md border border-input bg-background px-3 text-sm"
            value={h.layout === 'wide' ? 'wide' : 'default'}
            onChange={(e) => patch({ layout: e.target.value === 'wide' ? 'wide' : 'default' })}
          >
            <option value="default">Default (max-width 7xl)</option>
            <option value="wide">Wide (up to 1400px)</option>
          </select>
        </div>
      </section>

      <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="font-semibold text-gray-900">Logo</h2>
        <div>
          <Label htmlFor="logo-url">Logo image URL</Label>
          <Input
            id="logo-url"
            className="mt-1"
            value={h.logoImageUrl ?? ''}
            onChange={(e) => patch({ logoImageUrl: e.target.value })}
            placeholder="Leave empty to use the built-in site logo"
          />
          <p className="mt-1 text-xs text-gray-500">Use a public https URL (e.g. from your CDN or uploads).</p>
        </div>
        <div>
          <Label htmlFor="logo-alt">Logo alt text</Label>
          <Input
            id="logo-alt"
            className="mt-1"
            value={h.logoAlt ?? ''}
            onChange={(e) => patch({ logoAlt: e.target.value })}
          />
        </div>
      </section>

      <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="font-semibold text-gray-900">Tagline</h2>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={h.showTagline !== false}
            onChange={(e) => patch({ showTagline: e.target.checked })}
          />
          Show tagline next to logo (desktop)
        </label>
        <div>
          <Label htmlFor="tagline">Tagline text</Label>
          <Input
            id="tagline"
            className="mt-1"
            value={h.tagline ?? ''}
            onChange={(e) => patch({ tagline: e.target.value })}
          />
        </div>
      </section>

      <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="font-semibold text-gray-900">Search</h2>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={h.showDesktopSearch !== false}
            onChange={(e) => patch({ showDesktopSearch: e.target.checked })}
          />
          Show search bar (large screens)
        </label>
        <div>
          <Label htmlFor="ph-desk">Desktop placeholder</Label>
          <Input
            id="ph-desk"
            className="mt-1"
            value={h.searchPlaceholderDesktop ?? ''}
            onChange={(e) => patch({ searchPlaceholderDesktop: e.target.value })}
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={h.showMobileSearch !== false}
            onChange={(e) => patch({ showMobileSearch: e.target.checked })}
          />
          Show search bar (mobile, under menu row)
        </label>
        <div>
          <Label htmlFor="ph-mob">Mobile placeholder</Label>
          <Input
            id="ph-mob"
            className="mt-1"
            value={h.searchPlaceholderMobile ?? ''}
            onChange={(e) => patch({ searchPlaceholderMobile: e.target.value })}
          />
        </div>
      </section>

      <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="font-semibold text-gray-900">Toolbar icons</h2>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={h.showAccount !== false}
            onChange={(e) => patch({ showAccount: e.target.checked })}
          />
          Show account (user) icon — links to admin login
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={h.showWishlist !== false}
            onChange={(e) => patch({ showWishlist: e.target.checked })}
          />
          Show wishlist (heart) icon
        </label>
        <p className="text-xs text-gray-500">Cart and mobile menu always stay visible.</p>
      </section>
    </div>
  );
}
