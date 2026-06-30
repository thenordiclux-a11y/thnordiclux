'use client';

import { Label } from '../../components/ui/label';
import type { CmsPageLayout } from '../../lib/cms-types';

const OPTIONS: { value: CmsPageLayout; label: string }[] = [
  { value: 'default', label: 'default (readable width)' },
  { value: 'narrow', label: 'narrow' },
  { value: 'full_width', label: 'full width (wide column)' },
  { value: 'full_bleed', label: 'full bleed' },
  { value: 'grid', label: 'magazine grid' },
  { value: 'grid_2', label: 'grid 2 columns' },
  { value: 'grid_3', label: 'grid 3 columns' },
];

type Props = {
  id?: string;
  value: CmsPageLayout;
  onChange: (layout: CmsPageLayout) => void;
};

export function CmsLayoutSelect({ id, value, onChange }: Props) {
  return (
    <div>
      <Label htmlFor={id ?? 'cms-layout'}>Layout</Label>
      <select
        id={id ?? 'cms-layout'}
        className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value as CmsPageLayout)}
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <p className="mt-1 text-xs text-muted-foreground">
        Same width rules as site pages. Multi-column layouts expose per-block width in the block list.
      </p>
    </div>
  );
}
