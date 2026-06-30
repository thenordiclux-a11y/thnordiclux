'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { mergeCmsHome } from '../../../lib/cms-defaults';
import { applyChromeTemplatesForAdminEditor, resetFooterChromeBlocks } from '../../../lib/cms-chrome-admin';
import type { CmsHomeData, CmsSiteFooterChrome } from '../../../lib/cms-types';
import { mergeFooterStructured } from '../../../lib/cms-footer-structured';
import { revalidateAfterCmsHomeSave } from '../../../actions/revalidate-cms';
import { fetchCmsHomeFromDb, upsertCmsHomeInDb } from '../../../lib/cms-db';
import { isSupabaseConfigured } from '../../../lib/supabase';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { CmsFooterStructuredEditor } from '../../../components/admin/CmsFooterStructuredEditor';
import { CmsSocialLinksEditor } from '../../../components/admin/CmsSocialLinksEditor';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

const emptyZone = (): CmsSiteFooterChrome => ({
  enabled: true,
  layout: 'grid_3',
  blocks: [],
  socialColumnTitle: '',
  socialLinks: [],
});

export default function CmsFooterPage() {
  const [data, setData] = useState<CmsHomeData>(() =>
    applyChromeTemplatesForAdminEditor(mergeCmsHome(null))
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const zone: CmsSiteFooterChrome = data.siteFooterChrome ?? emptyZone();
  const structured = mergeFooterStructured(zone.structured ?? undefined, undefined);

  const load = useCallback(async () => {
    setLoading(true);
    const partial = await fetchCmsHomeFromDb();
    setData(applyChromeTemplatesForAdminEditor(mergeCmsHome(partial)));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const patchZone = (patch: Partial<CmsSiteFooterChrome>) => {
    setData((d) => {
      const z = d.siteFooterChrome ?? emptyZone();
      return { ...d, siteFooterChrome: { ...z, ...patch } };
    });
  };

  const loadDefaultContent = () => {
    if (
      !confirm(
        'Replace footer with built-in defaults (columns, links, social placeholders)? You can still leave without saving.'
      )
    ) {
      return;
    }
    setData((d) => {
      const z = d.siteFooterChrome ?? emptyZone();
      return { ...d, siteFooterChrome: resetFooterChromeBlocks(z) };
    });
    toast.message('Default footer loaded. Save when ready.');
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
      toast.success('Footer saved');
    } else toast.error('Save failed. Check console and database tables.');
  };

  if (loading) {
    return <p className="text-sm text-gray-600">Loading…</p>;
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/admin/cms"
            className="mb-2 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            CMS overview
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Footer</h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-600">
            Edit logo, brand text, Shop / Support / Company columns (drag links), section order (drag), copyright and
            legal links, plus social icons. Enable below to show this footer on the marketing site.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={loadDefaultContent}>
            Load default content
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
        <h2 className="font-semibold text-gray-900">Footer settings</h2>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={zone.enabled === true}
            onChange={(e) => patchZone({ enabled: e.target.checked })}
          />
          Show footer on the marketing site (uses the content below)
        </label>
        {zone.enabled !== true ? (
          <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
            Footer is hidden on the storefront until this is turned on and you save.
          </p>
        ) : null}
        <div>
          <Label htmlFor="social-title">Social column heading</Label>
          <Input
            id="social-title"
            className="mt-1"
            value={zone.socialColumnTitle ?? ''}
            onChange={(e) => patchZone({ socialColumnTitle: e.target.value })}
            placeholder="Follow us"
          />
        </div>
      </section>

      <CmsFooterStructuredEditor
        structured={structured}
        onChange={(next) => patchZone({ structured: next, blocks: [] })}
      />

      <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="font-semibold text-gray-900">Social links</h2>
        <p className="text-sm text-gray-600">
          Only links with a real URL and “Show on site” appear live. Placeholder rows start disabled.
        </p>
        <CmsSocialLinksEditor
          links={zone.socialLinks ?? []}
          onChange={(socialLinks) => patchZone({ socialLinks })}
        />
      </section>
    </div>
  );
}
