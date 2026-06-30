'use client';

import { useCallback, useState } from 'react';
import type {
  CmsFooterStructured,
  CmsFooterSectionId,
  CmsFooterLinkColumn,
  CmsFooterLinkItem,
  CmsFooterLegalItem,
} from '../../lib/cms-types';
import { FOOTER_SECTION_IDS, newFooterLinkItem, newFooterLegalItem } from '../../lib/cms-footer-structured';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { ChevronDown, ChevronUp, GripVertical, Plus, Trash2 } from 'lucide-react';

const SECTION_LABELS: Record<CmsFooterSectionId, string> = {
  brand: 'Brand (logo, title, description)',
  shop: 'Shop column',
  support: 'Support column',
  company: 'Company column',
  social: 'Social icons (URLs in section below)',
};

type Props = {
  structured: CmsFooterStructured;
  onChange: (next: CmsFooterStructured) => void;
};

function FooterColumnEditor({
  column,
  onChange,
}: {
  column: CmsFooterLinkColumn;
  onChange: (next: CmsFooterLinkColumn) => void;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const commitLinks = (links: CmsFooterLinkItem[]) => {
    onChange({ ...column, links: links.map((l) => ({ ...l })) });
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= column.links.length) return;
    const next = [...column.links];
    const [removed] = next.splice(from, 1);
    next.splice(to, 0, removed);
    commitLinks(next);
  };

  const updateLink = (index: number, patch: Partial<CmsFooterLinkItem>) => {
    commitLinks(column.links.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  };

  const removeLink = (index: number) => {
    commitLinks(column.links.filter((_, i) => i !== index));
  };

  const addLink = () => {
    commitLinks([...column.links, newFooterLinkItem()]);
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
    <div className="space-y-4">
      <div>
        <Label className="text-xs text-gray-600">Column heading</Label>
        <Input
          className="mt-1"
          value={column.title}
          onChange={(e) => onChange({ ...column, title: e.target.value })}
        />
      </div>
      <p className="text-xs text-gray-500">Drag links by the handle to reorder.</p>
      <ul className="m-0 list-none space-y-3 p-0">
        {column.links.map((link, index) => (
          <li
            key={link.id}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragEnd={() => setDragIndex(null)}
            onDragOver={onDragOver}
            onDrop={() => onDrop(index)}
            className={
              'space-y-3 rounded-lg border border-gray-200 bg-gray-50/80 p-4 ' +
              (dragIndex === index ? 'opacity-60 ring-2 ring-blue-200' : '')
            }
          >
            <div className="flex flex-wrap items-start gap-2">
              <span className="mt-2 cursor-grab p-1 text-gray-400 active:cursor-grabbing" aria-hidden>
                <GripVertical className="h-4 w-4" />
              </span>
              <label className="mt-2 flex shrink-0 items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={link.enabled !== false}
                  onChange={(e) => updateLink(index, { enabled: e.target.checked })}
                  className="rounded border-gray-300"
                />
                On
              </label>
              <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label className="text-xs text-gray-600">Label</Label>
                  <Input
                    className="mt-1"
                    value={link.label}
                    onChange={(e) => updateLink(index, { label: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">URL / path</Label>
                  <Input
                    className="mt-1 font-mono text-sm"
                    value={link.href}
                    onChange={(e) => updateLink(index, { href: e.target.value })}
                    placeholder="/shop or https://"
                  />
                </div>
              </div>
              <div className="flex gap-1">
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => move(index, index - 1)}>
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => move(index, index + 1)}>
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => removeLink(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <Button type="button" variant="outline" size="sm" onClick={addLink}>
        <Plus className="mr-1 h-4 w-4" />
        Add link
      </Button>
    </div>
  );
}

function LegalLinksEditor({
  links,
  onChange,
}: {
  links: CmsFooterLegalItem[];
  onChange: (next: CmsFooterLegalItem[]) => void;
}) {
  const update = (index: number, patch: Partial<CmsFooterLegalItem>) => {
    onChange(links.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  };

  const remove = (index: number) => {
    onChange(links.filter((_, i) => i !== index));
  };

  const add = () => {
    onChange([...links, newFooterLegalItem({ label: 'Link', href: '/#contact' })]);
  };

  return (
    <div className="space-y-3">
      {links.map((link, index) => (
        <div key={link.id} className="flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 bg-gray-50/80 p-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={link.enabled !== false}
              onChange={(e) => update(index, { enabled: e.target.checked })}
              className="rounded border-gray-300"
            />
            Show
          </label>
          <div className="min-w-[100px] flex-1">
            <Label className="text-xs text-gray-600">Label</Label>
            <Input className="mt-1" value={link.label} onChange={(e) => update(index, { label: e.target.value })} />
          </div>
          <div className="min-w-[140px] flex-[1.5]">
            <Label className="text-xs text-gray-600">URL</Label>
            <Input
              className="mt-1 font-mono text-sm"
              value={link.href}
              onChange={(e) => update(index, { href: e.target.value })}
            />
          </div>
          <Button type="button" variant="ghost" size="icon" className="text-red-600" onClick={() => remove(index)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add}>
        <Plus className="mr-1 h-4 w-4" />
        Add legal link
      </Button>
    </div>
  );
}

export function CmsFooterStructuredEditor({ structured: s, onChange }: Props) {
  const commit = useCallback(
    (patch: Partial<CmsFooterStructured>) => {
      onChange({ ...s, ...patch });
    },
    [s, onChange]
  );

  const [dragSection, setDragSection] = useState<number | null>(null);
  const order = s.columnOrder.length ? s.columnOrder : [...FOOTER_SECTION_IDS];

  const moveSection = (from: number, to: number) => {
    if (to < 0 || to >= order.length) return;
    const next = [...order];
    const [removed] = next.splice(from, 1);
    next.splice(to, 0, removed);
    commit({ columnOrder: next });
  };

  const onSectionDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onSectionDrop = (targetIndex: number) => {
    if (dragSection === null || dragSection === targetIndex) {
      setDragSection(null);
      return;
    }
    moveSection(dragSection, targetIndex);
    setDragSection(null);
  };

  return (
    <div className="space-y-10">
      <section className="space-y-3 rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="font-semibold text-gray-900">Main row order</h3>
        <p className="text-sm text-gray-600">
          Drag sections to change order on the site (desktop wraps as a row; mobile stacks top to bottom).
        </p>
        <ul className="m-0 list-none space-y-2 p-0">
          {order.map((id, index) => (
            <li
              key={`${id}-${index}`}
              draggable
              onDragStart={() => setDragSection(index)}
              onDragEnd={() => setDragSection(null)}
              onDragOver={onSectionDragOver}
              onDrop={() => onSectionDrop(index)}
              className={
                'flex items-center gap-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm ' +
                (dragSection === index ? 'opacity-60 ring-2 ring-blue-200' : '')
              }
            >
              <span className="cursor-grab text-gray-400" aria-hidden>
                <GripVertical className="h-4 w-4" />
              </span>
              <span className="font-medium text-gray-800">{SECTION_LABELS[id]}</span>
              <span className="ml-auto text-xs text-gray-400">{id}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="font-semibold text-gray-900">Brand</h3>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={s.showBrandLogo !== false}
            onChange={(e) => commit({ showBrandLogo: e.target.checked })}
            className="rounded border-gray-300"
          />
          Show logo
        </label>
        <div>
          <Label htmlFor="ft-logo-url">Footer logo URL (optional)</Label>
          <Input
            id="ft-logo-url"
            className="mt-1"
            value={s.logoImageUrl ?? ''}
            onChange={(e) => commit({ logoImageUrl: e.target.value })}
            placeholder="Empty = use marketing header logo"
          />
        </div>
        <div>
          <Label htmlFor="ft-logo-alt">Logo alt text</Label>
          <Input
            id="ft-logo-alt"
            className="mt-1"
            value={s.logoAlt ?? ''}
            onChange={(e) => commit({ logoAlt: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="ft-brand-title">Title (below logo)</Label>
          <Input
            id="ft-brand-title"
            className="mt-1"
            value={s.brandTitle ?? ''}
            onChange={(e) => commit({ brandTitle: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="ft-brand-desc">Description</Label>
          <Textarea
            id="ft-brand-desc"
            className="mt-1 min-h-[80px]"
            value={s.brandDescription ?? ''}
            onChange={(e) => commit({ brandDescription: e.target.value })}
          />
        </div>
      </section>

      <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="font-semibold text-gray-900">Shop links</h3>
        <FooterColumnEditor column={s.shop} onChange={(col) => commit({ shop: col })} />
      </section>

      <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="font-semibold text-gray-900">Support links</h3>
        <FooterColumnEditor column={s.support} onChange={(col) => commit({ support: col })} />
      </section>

      <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="font-semibold text-gray-900">Company links</h3>
        <FooterColumnEditor column={s.company} onChange={(col) => commit({ company: col })} />
      </section>

      <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="font-semibold text-gray-900">Copyright & legal row</h3>
        <div>
          <Label htmlFor="ft-copy">Copyright line</Label>
          <Input
            id="ft-copy"
            className="mt-1"
            value={s.copyrightLine ?? ''}
            onChange={(e) => commit({ copyrightLine: e.target.value })}
          />
        </div>
        <div>
          <Label className="text-sm text-gray-700">Legal links (Privacy, Terms, Cookies, …)</Label>
          <div className="mt-2">
            <LegalLinksEditor links={s.legalLinks ?? []} onChange={(legalLinks) => commit({ legalLinks })} />
          </div>
        </div>
      </section>
    </div>
  );
}
