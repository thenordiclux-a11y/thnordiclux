'use client';

import { useCallback, useEffect, useState } from 'react';
import { mergeCmsHome } from '../../../lib/cms-defaults';
import type { CmsHomeData, CmsHomePromoBanner, CmsHomeBrandItem } from '../../../lib/cms-types';
import { revalidateAfterCmsHomeSave } from '../../../actions/revalidate-cms';
import { fetchCmsHomeFromDb, upsertCmsHomeInDb } from '../../../lib/cms-db';
import { isSupabaseConfigured } from '../../../lib/supabase';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { HomeSectionsOrderEditor } from '../../../components/admin/HomeSectionsOrderEditor';

export default function CmsHomeEditorPage() {
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
      toast.success('Home content saved');
    } else toast.error('Save failed. Check console and database tables.');
  };

  const updatePromo = (index: number, patch: Partial<CmsHomePromoBanner>) => {
    setData((d) => {
      const promos = [...(d.promoBanners ?? [])];
      promos[index] = { ...promos[index], ...patch };
      return { ...d, promoBanners: promos };
    });
  };

  const addPromo = () => {
    setData((d) => ({
      ...d,
      promoBanners: [
        ...(d.promoBanners ?? []),
        {
          title: 'New banner',
          subtitle: 'Subtitle',
          buttonText: 'Shop',
          image: '',
          theme: 'primary',
        },
      ],
    }));
  };

  const removePromo = (index: number) => {
    setData((d) => ({
      ...d,
      promoBanners: (d.promoBanners ?? []).filter((_, i) => i !== index),
    }));
  };

  const newBrandItem = (): CmsHomeBrandItem => ({
    id:
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `brand-${Date.now()}`,
    name: 'Brand name',
    logoUrl: '',
    href: '/shop',
    enabled: true,
  });

  const updateBrandItem = (index: number, patch: Partial<CmsHomeBrandItem>) => {
    setData((d) => {
      const s = d.shopByBrandSection;
      if (!s) return d;
      const items = [...s.items];
      items[index] = { ...items[index], ...patch };
      return { ...d, shopByBrandSection: { ...s, items } };
    });
  };

  const addBrandItem = () => {
    setData((d) => {
      const s = d.shopByBrandSection ?? {
        eyebrow: 'Trusted Partners',
        title: 'Shop by Brand',
        description: '',
        items: [],
      };
      return { ...d, shopByBrandSection: { ...s, items: [...s.items, newBrandItem()] } };
    });
  };

  const removeBrandItem = (index: number) => {
    setData((d) => {
      const s = d.shopByBrandSection;
      if (!s) return d;
      return { ...d, shopByBrandSection: { ...s, items: s.items.filter((_, i) => i !== index) } };
    });
  };

  if (loading) {
    return <p className="text-gray-600 text-sm">Loading…</p>;
  }

  return (
    <div className="space-y-10 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Home page (CMS)</h1>
          <p className="text-sm text-gray-600 mt-1">
            Reorder home sections below, then edit copy for hero, promos, shop-by-brand logos, blog teaser, and newsletter. Announcement bar is site-wide.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => setData(mergeCmsHome(null))}>
            Reset form to defaults
          </Button>
          <Button type="button" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save to Supabase'}
          </Button>
        </div>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Home page sections</h2>
        <HomeSectionsOrderEditor
          rows={data.homeSections}
          onChange={(homeSections) => setData((d) => ({ ...d, homeSections }))}
        />
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Announcement bar</h2>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={data.announcement?.enabled !== false}
            onChange={(e) =>
              setData((d) => ({
                ...d,
                announcement: { ...d.announcement, enabled: e.target.checked },
              }))
            }
          />
          Show bar
        </label>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="ann1">Line 1</Label>
            <Input
              id="ann1"
              value={data.announcement?.line1 ?? ''}
              onChange={(e) =>
                setData((d) => ({
                  ...d,
                  announcement: { ...d.announcement, line1: e.target.value },
                }))
              }
            />
          </div>
          <div>
            <Label htmlFor="ann2">Line 2</Label>
            <Input
              id="ann2"
              value={data.announcement?.line2 ?? ''}
              onChange={(e) =>
                setData((d) => ({
                  ...d,
                  announcement: { ...d.announcement, line2: e.target.value },
                }))
              }
            />
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Hero</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Badge</Label>
            <Input
              value={data.hero?.badge ?? ''}
              onChange={(e) => setData((d) => ({ ...d, hero: { ...d.hero, badge: e.target.value } }))}
            />
          </div>
          <div>
            <Label>Hero video URL</Label>
            <Input
              placeholder="/assets/hero-video.mp4"
              value={data.hero?.heroVideoUrl ?? ''}
              onChange={(e) =>
                setData((d) => ({ ...d, hero: { ...d.hero, heroVideoUrl: e.target.value } }))
              }
            />
          </div>
          <div>
            <Label>Title line 1</Label>
            <Input
              value={data.hero?.titleLine1 ?? ''}
              onChange={(e) =>
                setData((d) => ({ ...d, hero: { ...d.hero, titleLine1: e.target.value } }))
              }
            />
          </div>
          <div>
            <Label>Title accent (colored)</Label>
            <Input
              value={data.hero?.titleAccent ?? ''}
              onChange={(e) =>
                setData((d) => ({ ...d, hero: { ...d.hero, titleAccent: e.target.value } }))
              }
            />
          </div>
        </div>
        <div>
          <Label>Subtitle</Label>
          <Textarea
            rows={3}
            value={data.hero?.subtitle ?? ''}
            onChange={(e) => setData((d) => ({ ...d, hero: { ...d.hero, subtitle: e.target.value } }))}
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Primary CTA label</Label>
            <Input
              value={data.hero?.primaryCtaLabel ?? ''}
              onChange={(e) =>
                setData((d) => ({ ...d, hero: { ...d.hero, primaryCtaLabel: e.target.value } }))
              }
            />
          </div>
          <div>
            <Label>Primary CTA link</Label>
            <Input
              value={data.hero?.primaryCtaHref ?? ''}
              onChange={(e) =>
                setData((d) => ({ ...d, hero: { ...d.hero, primaryCtaHref: e.target.value } }))
              }
            />
          </div>
          <div>
            <Label>Secondary CTA label</Label>
            <Input
              value={data.hero?.secondaryCtaLabel ?? ''}
              onChange={(e) =>
                setData((d) => ({ ...d, hero: { ...d.hero, secondaryCtaLabel: e.target.value } }))
              }
            />
          </div>
          <div>
            <Label>Stat value</Label>
            <Input
              value={data.hero?.statValue ?? ''}
              onChange={(e) =>
                setData((d) => ({ ...d, hero: { ...d.hero, statValue: e.target.value } }))
              }
            />
          </div>
          <div>
            <Label>Stat label</Label>
            <Input
              value={data.hero?.statLabel ?? ''}
              onChange={(e) =>
                setData((d) => ({ ...d, hero: { ...d.hero, statLabel: e.target.value } }))
              }
            />
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-semibold text-gray-900">Promo banners</h2>
          <Button type="button" variant="outline" size="sm" onClick={addPromo}>
            <Plus className="w-4 h-4 mr-1" />
            Add banner
          </Button>
        </div>
        {(data.promoBanners ?? []).map((b, i) => (
          <div key={i} className="border border-gray-100 rounded-lg p-4 space-y-3 relative">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-red-600"
              onClick={() => removePromo(i)}
              aria-label="Remove banner"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <div className="grid sm:grid-cols-2 gap-3 pr-10">
              <div>
                <Label>Title</Label>
                <Input value={b.title} onChange={(e) => updatePromo(i, { title: e.target.value })} />
              </div>
              <div>
                <Label>Subtitle</Label>
                <Input value={b.subtitle} onChange={(e) => updatePromo(i, { subtitle: e.target.value })} />
              </div>
              <div>
                <Label>Button</Label>
                <Input
                  value={b.buttonText}
                  onChange={(e) => updatePromo(i, { buttonText: e.target.value })}
                />
              </div>
              <div>
                <Label>Theme</Label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={b.theme}
                  onChange={(e) =>
                    updatePromo(i, { theme: e.target.value as 'primary' | 'secondary' })
                  }
                >
                  <option value="primary">primary</option>
                  <option value="secondary">secondary</option>
                </select>
              </div>
            </div>
            <div>
              <Label>Image URL</Label>
              <Input value={b.image} onChange={(e) => updatePromo(i, { image: e.target.value })} />
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h2 className="font-semibold text-gray-900">Shop by brand (home)</h2>
            <p className="text-sm text-gray-600 mt-1 max-w-xl">
              When you add at least one enabled brand with a name or logo URL, the home page uses this list and headings below. If the list is empty, the site shows brand names from your product catalog (text tiles).
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addBrandItem}>
            <Plus className="w-4 h-4 mr-1" />
            Add brand
          </Button>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Small label (above title)</Label>
            <Input
              value={data.shopByBrandSection?.eyebrow ?? ''}
              onChange={(e) =>
                setData((d) => ({
                  ...d,
                  shopByBrandSection: {
                    ...(d.shopByBrandSection ?? { items: [] }),
                    eyebrow: e.target.value,
                    items: d.shopByBrandSection?.items ?? [],
                  },
                }))
              }
            />
          </div>
          <div>
            <Label>Section title</Label>
            <Input
              value={data.shopByBrandSection?.title ?? ''}
              onChange={(e) =>
                setData((d) => ({
                  ...d,
                  shopByBrandSection: {
                    ...(d.shopByBrandSection ?? { items: [] }),
                    title: e.target.value,
                    items: d.shopByBrandSection?.items ?? [],
                  },
                }))
              }
            />
          </div>
        </div>
        <div>
          <Label>Description</Label>
          <Textarea
            rows={2}
            value={data.shopByBrandSection?.description ?? ''}
            onChange={(e) =>
              setData((d) => ({
                ...d,
                shopByBrandSection: {
                  ...(d.shopByBrandSection ?? { items: [] }),
                  description: e.target.value,
                  items: d.shopByBrandSection?.items ?? [],
                },
              }))
            }
          />
        </div>
        {(data.shopByBrandSection?.items ?? []).map((row, i) => (
          <div key={row.id} className="border border-gray-100 rounded-lg p-4 space-y-3 relative">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-red-600"
              onClick={() => removeBrandItem(i)}
              aria-label="Remove brand"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <label className="flex items-center gap-2 text-sm pr-10">
              <input
                type="checkbox"
                checked={row.enabled !== false}
                onChange={(e) => updateBrandItem(i, { enabled: e.target.checked })}
              />
              Show on site
            </label>
            <div className="grid sm:grid-cols-2 gap-3 pr-10">
              <div>
                <Label>Name (required for accessibility)</Label>
                <Input
                  value={row.name}
                  onChange={(e) => updateBrandItem(i, { name: e.target.value })}
                />
              </div>
              <div>
                <Label>Link (optional)</Label>
                <Input
                  placeholder="/shop"
                  value={row.href ?? ''}
                  onChange={(e) => updateBrandItem(i, { href: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Logo image URL</Label>
              <Input
                placeholder="https://… or /images/brand.png"
                value={row.logoUrl}
                onChange={(e) => updateBrandItem(i, { logoUrl: e.target.value })}
              />
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Blog section (home)</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Small label</Label>
            <Input
              value={data.blogSection?.label ?? ''}
              onChange={(e) =>
                setData((d) => ({ ...d, blogSection: { ...d.blogSection, label: e.target.value } }))
              }
            />
          </div>
          <div>
            <Label>CTA button</Label>
            <Input
              value={data.blogSection?.ctaLabel ?? ''}
              onChange={(e) =>
                setData((d) => ({ ...d, blogSection: { ...d.blogSection, ctaLabel: e.target.value } }))
              }
            />
          </div>
        </div>
        <div>
          <Label>Title</Label>
          <Input
            value={data.blogSection?.title ?? ''}
            onChange={(e) =>
              setData((d) => ({ ...d, blogSection: { ...d.blogSection, title: e.target.value } }))
            }
          />
        </div>
        <div>
          <Label>Description</Label>
          <Textarea
            rows={2}
            value={data.blogSection?.description ?? ''}
            onChange={(e) =>
              setData((d) => ({ ...d, blogSection: { ...d.blogSection, description: e.target.value } }))
            }
          />
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Newsletter block</h2>
        <div>
          <Label>Heading</Label>
          <Input
            value={data.newsletter?.heading ?? ''}
            onChange={(e) =>
              setData((d) => ({ ...d, newsletter: { ...d.newsletter, heading: e.target.value } }))
            }
          />
        </div>
        <div>
          <Label>Subheading</Label>
          <Textarea
            rows={2}
            value={data.newsletter?.subheading ?? ''}
            onChange={(e) =>
              setData((d) => ({ ...d, newsletter: { ...d.newsletter, subheading: e.target.value } }))
            }
          />
        </div>
      </section>

      <Button type="button" onClick={save} disabled={saving}>
        {saving ? 'Saving…' : 'Save to Supabase'}
      </Button>
    </div>
  );
}
