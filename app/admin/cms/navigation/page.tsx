'use client';

import { useCallback, useEffect, useState } from 'react';
import { mergeCmsHome } from '../../../lib/cms-defaults';
import type { CmsHeaderNavTrackLink, CmsHomeData, CmsNavLink } from '../../../lib/cms-types';
import { DEFAULT_HEADER_NAV_LINKS, DEFAULT_HEADER_NAV_TRACK_LINK } from '../../../lib/nav-links';
import { revalidateAfterCmsHomeSave } from '../../../actions/revalidate-cms';
import { fetchCmsHomeFromDb, upsertCmsHomeInDb } from '../../../lib/cms-db';
import { isSupabaseConfigured } from '../../../lib/supabase';
import { Button } from '../../../components/ui/button';
import { CmsHeaderNavEditor } from '../../../components/admin/CmsHeaderNavEditor';
import { toast } from 'sonner';

export default function CmsNavigationPage() {
  const [data, setData] = useState<CmsHomeData>(() => mergeCmsHome(null));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const partial = await fetchCmsHomeFromDb();
    setData(mergeCmsHome(partial));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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
      toast.success('Navigation saved');
    } else toast.error('Save failed.');
  };

  const links = data.headerNavLinks ?? [];
  const track = data.headerNavTrackLink ?? { label: 'Track Your Order', href: '/track-order', enabled: true };

  const setLinks = (next: CmsNavLink[]) => {
    setData((d) => ({ ...d, headerNavLinks: next }));
  };

  const setTrack = (next: CmsHeaderNavTrackLink) => {
    setData((d) => ({ ...d, headerNavTrackLink: next }));
  };

  const restoreNavDefaults = () => {
    setData((d) => ({
      ...d,
      headerNavLinks: DEFAULT_HEADER_NAV_LINKS.map((l) => ({ ...l })),
      headerNavTrackLink: { ...DEFAULT_HEADER_NAV_TRACK_LINK },
    }));
    toast.message('Navigation reset to built-in defaults (not saved yet)');
  };

  if (loading) {
    return <p className="text-gray-600 text-sm">Loading…</p>;
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Navigation</h1>
          <p className="text-sm text-gray-600 mt-1">
            Header menu on the marketing site (home, blog, and CMS pages). Reorder with drag, edit labels and URLs,
            or remove items. Does not change the admin sidebar.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={restoreNavDefaults}>
            Restore default links
          </Button>
          <Button type="button" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save to Supabase'}
          </Button>
        </div>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <CmsHeaderNavEditor links={links} trackLink={track} onLinksChange={setLinks} onTrackLinkChange={setTrack} />
      </section>

      <Button type="button" onClick={save} disabled={saving}>
        {saving ? 'Saving…' : 'Save to Supabase'}
      </Button>
    </div>
  );
}
