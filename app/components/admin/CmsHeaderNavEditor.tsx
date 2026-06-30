'use client';

import { useCallback, useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import type { CmsHeaderNavTrackLink, CmsNavLink, CmsNavLinkVariant } from '../../lib/cms-types';
import { newHeaderNavLink } from '../../lib/nav-links';
import { ChevronDown, ChevronUp, GripVertical, Plus, Trash2 } from 'lucide-react';

const VARIANT_OPTIONS: { value: CmsNavLinkVariant; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'shop', label: 'Shop style (chevron / bag icon)' },
  { value: 'emphasis', label: 'Emphasis (sale style)' },
];

type Props = {
  links: CmsNavLink[];
  trackLink: CmsHeaderNavTrackLink;
  onLinksChange: (next: CmsNavLink[]) => void;
  onTrackLinkChange: (next: CmsHeaderNavTrackLink) => void;
};

export function CmsHeaderNavEditor({ links, trackLink, onLinksChange, onTrackLinkChange }: Props) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const commitLinks = useCallback(
    (next: CmsNavLink[]) => {
      onLinksChange(next.map((l) => ({ ...l })));
    },
    [onLinksChange]
  );

  const move = (from: number, to: number) => {
    if (to < 0 || to >= links.length) return;
    const next = [...links];
    const [removed] = next.splice(from, 1);
    next.splice(to, 0, removed);
    commitLinks(next);
  };

  const updateLink = (index: number, patch: Partial<CmsNavLink>) => {
    commitLinks(links.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  };

  const removeLink = (index: number) => {
    commitLinks(links.filter((_, i) => i !== index));
  };

  const addLink = () => {
    commitLinks([...links, newHeaderNavLink()]);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (targetIndex: number) => {
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null);
      return;
    }
    move(dragIndex, targetIndex);
    setDragIndex(null);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm text-gray-600">
          Drag by the handle to reorder. CMS pages use <span className="font-medium">yoursite.com/page-name</span>{' '}
          (path <span className="font-mono text-xs">/page-name</span>). Anchors like{' '}
          <span className="font-mono text-xs">/#section-id</span> scroll on the home page.
        </p>
        <ul className="space-y-3 list-none p-0 m-0">
          {links.map((link, index) => (
            <li
              key={link.id}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragEnd={() => setDragIndex(null)}
              onDragOver={onDragOver}
              onDrop={() => onDrop(index)}
              className={
                'rounded-lg border border-gray-200 bg-gray-50/80 p-4 space-y-3 ' +
                (dragIndex === index ? 'opacity-60 ring-2 ring-blue-200' : '')
              }
            >
              <div className="flex flex-wrap items-start gap-2">
                <span className="cursor-grab active:cursor-grabbing text-gray-400 p-1 mt-2" aria-hidden>
                  <GripVertical className="w-4 h-4" />
                </span>
                <label className="flex items-center gap-2 text-sm shrink-0 mt-2">
                  <input
                    type="checkbox"
                    checked={link.enabled !== false}
                    onChange={(e) => updateLink(index, { enabled: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  On
                </label>
                <div className="flex-1 grid sm:grid-cols-2 gap-3 min-w-0">
                  <div>
                    <Label className="text-xs text-gray-600">Label</Label>
                    <Input
                      value={link.label}
                      onChange={(e) => updateLink(index, { label: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">URL / path</Label>
                    <Input
                      value={link.href}
                      onChange={(e) => updateLink(index, { href: e.target.value })}
                      placeholder="/shop or /about"
                      className="mt-1 font-mono text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-xs text-gray-600">Style</Label>
                    <select
                      className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                      value={link.variant ?? 'default'}
                      onChange={(e) => updateLink(index, { variant: e.target.value as CmsNavLinkVariant })}
                    >
                      {VARIANT_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 shrink-0 ml-auto">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={index === 0}
                    onClick={() => move(index, index - 1)}
                    aria-label="Move up"
                  >
                    <ChevronUp className="w-4 h-4" />
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
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-600"
                    onClick={() => removeLink(index)}
                    aria-label="Remove link"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <Button type="button" variant="outline" size="sm" onClick={addLink}>
          <Plus className="w-4 h-4 mr-1" />
          Add link
        </Button>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-4">
        <h3 className="font-semibold text-gray-900">Utility link (right side on desktop)</h3>
        <p className="text-xs text-gray-500">Usually track order. Hidden when disabled.</p>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={trackLink.enabled !== false}
            onChange={(e) => onTrackLinkChange({ ...trackLink, enabled: e.target.checked })}
            className="rounded border-gray-300"
          />
          Show utility link
        </label>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-gray-600">Label</Label>
            <Input
              value={trackLink.label}
              onChange={(e) => onTrackLinkChange({ ...trackLink, label: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-600">URL</Label>
            <Input
              value={trackLink.href}
              onChange={(e) => onTrackLinkChange({ ...trackLink, href: e.target.value })}
              className="mt-1 font-mono text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
