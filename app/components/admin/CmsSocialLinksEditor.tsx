'use client';

import { useCallback, useState } from 'react';
import type { CmsSocialLink, CmsSocialPlatform } from '../../lib/cms-types';
import { newSocialLink, SOCIAL_PLATFORM_LABELS } from '../../lib/cms-social';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ChevronDown, ChevronUp, GripVertical, Plus, Trash2 } from 'lucide-react';
import { SocialPlatformIcon } from '../SocialPlatformIcon';

const PLATFORMS = Object.keys(SOCIAL_PLATFORM_LABELS) as CmsSocialPlatform[];

export function CmsSocialLinksEditor({
  links,
  onChange,
}: {
  links: CmsSocialLink[];
  onChange: (next: CmsSocialLink[]) => void;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const commit = useCallback(
    (next: CmsSocialLink[]) => {
      onChange(next.map((l) => ({ ...l })));
    },
    [onChange]
  );

  const move = (from: number, to: number) => {
    if (to < 0 || to >= links.length) return;
    const next = [...links];
    const [removed] = next.splice(from, 1);
    next.splice(to, 0, removed);
    commit(next);
  };

  const patchLink = (index: number, patchRow: Partial<CmsSocialLink>) => {
    const next = [...links];
    next[index] = { ...next[index], ...patchRow };
    commit(next);
  };

  const remove = (index: number) => {
    commit(links.filter((_, i) => i !== index));
  };

  const add = () => {
    commit([...links, newSocialLink('instagram')]);
  };

  return (
    <div className="space-y-4">
      <Button type="button" variant="outline" size="sm" onClick={add}>
        <Plus className="mr-1 h-4 w-4" />
        Add link
      </Button>

      <ul className="m-0 list-none space-y-3 p-0">
        {links.length === 0 ? (
          <li className="rounded-lg border border-dashed border-gray-200 py-6 text-center text-sm text-gray-500">
            No social links yet.
          </li>
        ) : (
          links.map((link, index) => (
            <li
              key={link.id}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragEnd={() => setDragIndex(null)}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
              }}
              onDrop={() => {
                if (dragIndex === null || dragIndex === index) {
                  setDragIndex(null);
                  return;
                }
                move(dragIndex, index);
                setDragIndex(null);
              }}
              className={
                'space-y-3 rounded-lg border border-gray-200 bg-white p-4 ' +
                (dragIndex === index ? 'opacity-60 ring-2 ring-blue-200' : '')
              }
            >
              <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 pb-2">
                <span className="cursor-grab p-1 text-gray-400" aria-hidden>
                  <GripVertical className="h-4 w-4" />
                </span>
                <span
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-muted-foreground"
                  aria-hidden
                >
                  <SocialPlatformIcon platform={link.platform} className="h-5 w-5" />
                </span>
                <span className="flex-1 text-sm font-medium text-gray-800">
                  {SOCIAL_PLATFORM_LABELS[link.platform]}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={index === 0}
                  onClick={() => move(index, index - 1)}
                  aria-label="Move up"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={index === links.length - 1}
                  onClick={() => move(index, index + 1)}
                  aria-label="Move down"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-600"
                  onClick={() => remove(index)}
                  aria-label="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Platform</Label>
                  <select
                    className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={link.platform}
                    onChange={(e) => patchLink(index, { platform: e.target.value as CmsSocialPlatform })}
                  >
                    {PLATFORMS.map((p) => (
                      <option key={p} value={p}>
                        {SOCIAL_PLATFORM_LABELS[p]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>URL</Label>
                  <Input
                    className="mt-1"
                    value={link.href}
                    onChange={(e) => patchLink(index, { href: e.target.value })}
                    placeholder="https://"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>Label (optional)</Label>
                  <Input
                    className="mt-1"
                    value={link.label ?? ''}
                    onChange={(e) => patchLink(index, { label: e.target.value || undefined })}
                    placeholder={SOCIAL_PLATFORM_LABELS[link.platform]}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={link.enabled !== false}
                      onChange={(e) => patchLink(index, { enabled: e.target.checked })}
                    />
                    Show on site
                  </label>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
