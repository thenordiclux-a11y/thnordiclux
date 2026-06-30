'use client';

import { useCallback, useMemo, useState } from 'react';
import type { CmsBlockGridSpan, CmsContentBlock, CmsPageLayout } from '../../lib/cms-types';
import { isMulticolumnGridLayout } from '../../lib/cms-layout';
import { htmlToFallbackParagraphs, resolveRichtextHtml } from '../../lib/cms-richtext';
import { CmsRichTextEditor } from '../CmsRichTextEditor';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ChevronDown, ChevronUp, GripVertical, Trash2 } from 'lucide-react';

type Props = {
  blocks: CmsContentBlock[];
  onChange: (next: CmsContentBlock[]) => void;
  /** Used to show per-block grid span when the page uses a multi-column layout. */
  pageLayout?: CmsPageLayout;
};

function BlockFields({
  block,
  index,
  onPatch,
  showGridSpan,
}: {
  block: CmsContentBlock;
  index: number;
  onPatch: (patch: Partial<CmsContentBlock>) => void;
  showGridSpan: boolean;
}) {
  const gridSelect =
    showGridSpan && (block.type === 'hero' || block.type === 'richtext' || block.type === 'image') ? (
      <div>
        <Label>Width in grid layout</Label>
        <select
          className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
          value={block.gridSpan ?? 'auto'}
          onChange={(e) => onPatch({ gridSpan: e.target.value as CmsBlockGridSpan } as Partial<CmsContentBlock>)}
        >
          <option value="auto">One column (default)</option>
          <option value="full">Full row (all columns)</option>
        </select>
        <p className="text-xs text-muted-foreground mt-1">
          Applies when page layout is Grid 2-col, Grid 3-col, or Magazine grid.
        </p>
      </div>
    ) : null;

  if (block.type === 'hero') {
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label>Title</Label>
          <Input
            value={block.title}
            onChange={(e) =>
              onPatch({ type: 'hero', title: e.target.value, subtitle: block.subtitle, image: block.image })
            }
          />
        </div>
        <div className="sm:col-span-2">
          <Label>Subtitle</Label>
          <Input
            value={block.subtitle ?? ''}
            onChange={(e) =>
              onPatch({ type: 'hero', title: block.title, subtitle: e.target.value, image: block.image })
            }
          />
        </div>
        <div className="sm:col-span-2">
          <Label>Image URL</Label>
          <Input
            value={block.image ?? ''}
            onChange={(e) =>
              onPatch({ type: 'hero', title: block.title, subtitle: block.subtitle, image: e.target.value })
            }
          />
        </div>
        {gridSelect && <div className="sm:col-span-2">{gridSelect}</div>}
      </div>
    );
  }
  if (block.type === 'richtext') {
    return (
      <div className="space-y-3">
        <div>
          <Label>Rich text</Label>
          <p className="text-xs text-muted-foreground mb-2">
            Headings, lists, bold, links, and quotes. Stored as safe HTML.
          </p>
          <CmsRichTextEditor
            key={`rt-${index}`}
            value={resolveRichtextHtml(block)}
            onChange={(html) =>
              onPatch({
                type: 'richtext',
                html,
                paragraphs: htmlToFallbackParagraphs(html),
              })
            }
          />
        </div>
        {gridSelect && gridSelect}
      </div>
    );
  }
  return (
    <div className="grid gap-2">
      <div>
        <Label>Image URL</Label>
        <Input
          value={block.src}
          onChange={(e) =>
            onPatch({ type: 'image', src: e.target.value, caption: block.caption, width: block.width })
          }
        />
      </div>
      <div>
        <Label>Caption</Label>
        <Input
          value={block.caption ?? ''}
          onChange={(e) =>
            onPatch({ type: 'image', src: block.src, caption: e.target.value, width: block.width })
          }
        />
      </div>
      <div>
        <Label>Width</Label>
        <select
          className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
          value={block.width ?? 'contained'}
          onChange={(e) =>
            onPatch({
              type: 'image',
              src: block.src,
              caption: block.caption,
              width: e.target.value as 'full' | 'contained',
            })
          }
        >
          <option value="contained">contained</option>
          <option value="full">full</option>
        </select>
      </div>
      {gridSelect && gridSelect}
    </div>
  );
}

export function CmsPageBlocksEditor({ blocks, onChange, pageLayout = 'default' }: Props) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const showGridSpan = isMulticolumnGridLayout(pageLayout);

  const commit = useCallback(
    (next: CmsContentBlock[]) => {
      onChange(next.map((b) => ({ ...b } as CmsContentBlock)));
    },
    [onChange]
  );

  const move = (from: number, to: number) => {
    if (to < 0 || to >= blocks.length) return;
    const next = [...blocks];
    const [removed] = next.splice(from, 1);
    next.splice(to, 0, removed);
    commit(next);
  };

  const remove = (index: number) => {
    commit(blocks.filter((_, i) => i !== index));
  };

  const patchBlock = (index: number, patch: Partial<CmsContentBlock>) => {
    const next = [...blocks];
    next[index] = { ...next[index], ...patch } as CmsContentBlock;
    commit(next);
  };

  const addHero = () => {
    commit([...blocks, { type: 'hero', title: 'New section', subtitle: '', image: '' }]);
  };
  const addRichtext = () => {
    commit([
      ...blocks,
      { type: 'richtext', paragraphs: ['New paragraph.'], html: '<p>New paragraph.</p>' },
    ]);
  };
  const addImage = () => {
    commit([...blocks, { type: 'image', src: '', caption: '', width: 'contained' }]);
  };

  const labels = useMemo(
    () =>
      blocks.map((b, i) => {
        if (b.type === 'hero') return `${i + 1}. Hero — ${b.title?.slice(0, 40) || '…'}`;
        if (b.type === 'richtext') return `${i + 1}. Rich text`;
        return `${i + 1}. Image`;
      }),
    [blocks]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={addHero}>
          Add hero block
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={addRichtext}>
          Add text block
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={addImage}>
          Add image block
        </Button>
      </div>

      <ul className="space-y-3 list-none p-0 m-0">
        {blocks.length === 0 ? (
          <li className="text-sm text-gray-500 py-4 text-center border border-dashed rounded-lg">
            No blocks yet. Add one above.
          </li>
        ) : (
          blocks.map((block, index) => (
            <li
              key={`${block.type}-${index}`}
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
              className={`rounded-lg border border-gray-200 bg-white p-4 space-y-3 ${
                dragIndex === index ? 'opacity-60 ring-2 ring-blue-200' : ''
              }`}
            >
              <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                <span className="cursor-grab text-gray-400 p-1" aria-hidden>
                  <GripVertical className="w-4 h-4" />
                </span>
                <span className="text-sm font-medium text-gray-800 flex-1">{labels[index]}</span>
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
                  disabled={index === blocks.length - 1}
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
                  onClick={() => remove(index)}
                  aria-label="Remove block"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <BlockFields
                block={block}
                index={index}
                showGridSpan={showGridSpan}
                onPatch={(p) => patchBlock(index, p)}
              />
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
