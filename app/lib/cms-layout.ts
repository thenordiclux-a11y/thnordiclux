import type { CmsContentBlock, CmsPageLayout } from './cms-types';

export function isMulticolumnGridLayout(layout: CmsPageLayout): boolean {
  return layout === 'grid' || layout === 'grid_2' || layout === 'grid_3';
}

export function gridWrapperClass(layout: CmsPageLayout): string {
  switch (layout) {
    case 'grid_3':
      return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8';
    case 'grid_2':
      return 'grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8';
    case 'grid':
      return 'grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6';
    default:
      return '';
  }
}

export function blockGridCellClass(layout: CmsPageLayout, block: CmsContentBlock): string {
  const span = 'gridSpan' in block && block.gridSpan === 'full' ? 'full' : 'auto';
  if (span === 'full') {
    if (layout === 'grid_3') return 'md:col-span-2 lg:col-span-3';
    return 'md:col-span-2';
  }
  if (layout === 'grid' && (block.type === 'hero' || block.type === 'richtext')) {
    return 'md:col-span-2';
  }
  return '';
}
