'use client';

import { useCallback, useMemo, useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  HOME_SECTION_KEYS,
  HOME_SECTION_LABELS,
  mergeHomeSectionRows,
  newCustomHomeSection,
  type HomeCustomLayout,
  type HomeCustomSectionRow,
  type HomeSectionRow,
  isBuiltinSection,
  isCustomSection,
} from '../../lib/home-sections';
import type { CmsContentBlock } from '../../lib/cms-types';
import { CmsPageBlocksEditor } from './CmsPageBlocksEditor';
import { ChevronDown, ChevronUp, GripVertical, Pencil, Plus, Trash2 } from 'lucide-react';

const LAYOUT_OPTIONS: { value: HomeCustomLayout; label: string }[] = [
  { value: 'default', label: 'Default (readable width)' },
  { value: 'narrow', label: 'Narrow' },
  { value: 'full_width', label: 'Full width' },
  { value: 'full_bleed', label: 'Full bleed' },
  { value: 'grid', label: 'Magazine grid (text full row, images 2-col)' },
  { value: 'grid_2', label: 'Grid 2 columns (per-block width)' },
  { value: 'grid_3', label: 'Grid 3 columns (per-block width)' },
];

type Props = {
  rows: HomeSectionRow[] | undefined;
  onChange: (next: HomeSectionRow[]) => void;
};

function cloneBlocks(blocks: CmsContentBlock[]): CmsContentBlock[] {
  return JSON.parse(JSON.stringify(blocks)) as CmsContentBlock[];
}

export function HomeSectionsOrderEditor({ rows, onChange }: Props) {
  const normalized = useMemo(() => mergeHomeSectionRows(rows), [rows]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [editingCustom, setEditingCustom] = useState<HomeCustomSectionRow | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftLayout, setDraftLayout] = useState<HomeCustomLayout>('default');
  const [draftPublished, setDraftPublished] = useState(false);
  const [draftBlocks, setDraftBlocks] = useState<CmsContentBlock[]>([]);
  const [addBuiltinKey, setAddBuiltinKey] = useState<string>('');

  const commit = useCallback(
    (next: HomeSectionRow[]) => {
      onChange(next.map((r) => ({ ...r })));
    },
    [onChange]
  );

  const builtinKeysInUse = useMemo(() => {
    const set = new Set<string>();
    for (const r of normalized) {
      if (isBuiltinSection(r)) set.add(r.key);
    }
    return set;
  }, [normalized]);

  const availableBuiltinKeys = useMemo(
    () => HOME_SECTION_KEYS.filter((k) => !builtinKeysInUse.has(k)),
    [builtinKeysInUse]
  );

  const openEditCustom = (row: HomeCustomSectionRow) => {
    setEditingCustom(row);
    setDraftTitle(row.sectionTitle ?? '');
    setDraftLayout(row.layout);
    setDraftPublished(row.published);
    setDraftBlocks(cloneBlocks(row.blocks));
  };

  const saveCustomDialog = () => {
    if (!editingCustom) return;
    const id = editingCustom.id;
    const next = normalized.map((r) =>
      isCustomSection(r) && r.id === id
        ? {
            ...r,
            sectionTitle: draftTitle.trim() || undefined,
            layout: draftLayout,
            published: draftPublished,
            blocks: cloneBlocks(draftBlocks),
          }
        : r
    );
    commit(next);
    setEditingCustom(null);
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= normalized.length) return;
    const next = [...normalized];
    const [removed] = next.splice(from, 1);
    next.splice(to, 0, removed);
    commit(next);
  };

  const toggleEnabled = (index: number) => {
    const next = normalized.map((r, i) => (i === index ? { ...r, enabled: !r.enabled } : r));
    commit(next);
  };

  const removeRow = (index: number) => {
    commit(normalized.filter((_, i) => i !== index));
  };

  const addBuiltin = () => {
    const key = addBuiltinKey as (typeof HOME_SECTION_KEYS)[number];
    if (!key || !HOME_SECTION_KEYS.includes(key) || builtinKeysInUse.has(key)) return;
    commit([...normalized, { kind: 'builtin' as const, id: `home-${key}`, key, enabled: true }]);
    setAddBuiltinKey('');
  };

  const addCustom = () => {
    commit([...normalized, newCustomHomeSection()]);
  };

  const toggleCustomPublished = (index: number) => {
    const next = normalized.map((r, i) =>
      i === index && isCustomSection(r) ? { ...r, published: !r.published } : r
    );
    commit(next);
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

  const rowLabel = (row: HomeSectionRow) =>
    isCustomSection(row) ? row.sectionTitle?.trim() || 'Custom section' : HOME_SECTION_LABELS[row.key];

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Drag to reorder. Remove sections you do not want (they stay removed after save). Custom sections support
        the same content blocks and layouts as site pages; check <strong>Published</strong> so they appear on the
        live home page.
      </p>
      <ul className="space-y-2 list-none p-0 m-0">
        {normalized.map((row, index) => (
          <li
            key={row.id}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragEnd={() => setDragIndex(null)}
            onDragOver={onDragOver}
            onDrop={() => onDrop(index)}
            className={
              'flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-2.5 text-sm ' +
              (dragIndex === index ? 'opacity-60 ring-2 ring-blue-200' : '')
            }
          >
            <span className="cursor-grab active:cursor-grabbing text-gray-400 p-1 shrink-0" aria-hidden>
              <GripVertical className="w-4 h-4" />
            </span>
            <label className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer">
              <input
                type="checkbox"
                checked={row.enabled}
                onChange={() => toggleEnabled(index)}
                className="rounded border-gray-300 shrink-0"
              />
              <span className="font-medium text-gray-900 truncate">{rowLabel(row)}</span>
              {isBuiltinSection(row) ? (
                <span className="text-xs text-gray-400 font-mono hidden sm:inline shrink-0">{row.key}</span>
              ) : (
                <span className="text-xs text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded shrink-0">
                  {row.published ? 'Live' : 'Draft'}
                </span>
              )}
            </label>
            {isCustomSection(row) && (
              <>
                <label className="flex items-center gap-1.5 text-xs text-gray-600 shrink-0">
                  <input
                    type="checkbox"
                    checked={row.published}
                    onChange={() => toggleCustomPublished(index)}
                    className="rounded border-gray-300"
                  />
                  Published
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 shrink-0"
                  onClick={() => openEditCustom(row)}
                >
                  <Pencil className="w-3.5 h-3.5 mr-1" />
                  Edit content
                </Button>
              </>
            )}
            <div className="flex items-center gap-0.5 shrink-0 ml-auto sm:ml-0">
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
                disabled={index === normalized.length - 1}
                onClick={() => move(index, index + 1)}
                aria-label="Move down"
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-600 hover:text-red-700"
                onClick={() => removeRow(index)}
                aria-label="Remove section"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-2 border-t border-gray-100">
        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-[200px]">
            <Label className="text-xs text-gray-600">Add built-in section</Label>
            <select
              className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={addBuiltinKey}
              onChange={(e) => setAddBuiltinKey(e.target.value)}
            >
              <option value="">Choose…</option>
              {availableBuiltinKeys.map((k) => (
                <option key={k} value={k}>
                  {HOME_SECTION_LABELS[k]}
                </option>
              ))}
            </select>
          </div>
          <Button type="button" variant="outline" disabled={!addBuiltinKey} onClick={addBuiltin}>
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
        <Button type="button" variant="default" onClick={addCustom}>
          <Plus className="w-4 h-4 mr-1" />
          Add custom section
        </Button>
      </div>

      {availableBuiltinKeys.length === 0 && (
        <p className="text-xs text-gray-500">All built-in section types are already in the list.</p>
      )}

      <Dialog open={!!editingCustom} onOpenChange={(open) => !open && setEditingCustom(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
            <DialogTitle>Custom home section</DialogTitle>
          </DialogHeader>
          <div className="px-6 space-y-4 overflow-y-auto flex-1 min-h-0 py-2">
            <div>
              <Label>Section title (optional)</Label>
              <Input value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} placeholder="Heading above content" />
            </div>
            <div>
              <Label>Layout</Label>
              <select
                className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={draftLayout}
                onChange={(e) => setDraftLayout(e.target.value as HomeCustomLayout)}
              >
                {LAYOUT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={draftPublished} onChange={(e) => setDraftPublished(e.target.checked)} />
              Published (visible on live home when section is enabled)
            </label>
            <div className="border-t border-gray-100 pt-4">
              <Label className="text-base">Content blocks</Label>
              <p className="text-xs text-gray-500 mt-1 mb-3">Same block types as site pages: hero, richtext, image.</p>
              <CmsPageBlocksEditor blocks={draftBlocks} onChange={setDraftBlocks} pageLayout={draftLayout} />
            </div>
          </div>
          <DialogFooter className="px-6 py-4 border-t border-gray-100 shrink-0">
            <Button type="button" variant="outline" onClick={() => setEditingCustom(null)}>
              Cancel
            </Button>
            <Button type="button" onClick={saveCustomDialog}>
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
