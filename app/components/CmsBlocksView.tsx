import type { CmsContentBlock, CmsPageLayout } from '../lib/cms-types';
import { sanitizeCmsHtml } from '../lib/cms-html';
import { resolveRichtextHtml } from '../lib/cms-richtext';
import { blockGridCellClass, gridWrapperClass, isMulticolumnGridLayout } from '../lib/cms-layout';

function blockContainedClass(layout: CmsPageLayout): string {
  switch (layout) {
    case 'narrow':
      return 'max-w-xl mx-auto';
    case 'full_bleed':
      return 'max-w-none';
    case 'full_width':
    case 'grid':
    case 'grid_2':
    case 'grid_3':
    case 'default':
    default:
      return 'max-w-3xl mx-auto';
  }
}

export function CmsBlockView({ block, layout }: { block: CmsContentBlock; layout: CmsPageLayout }) {
  const contained = blockContainedClass(layout);

  if (block.type === 'hero') {
    return (
      <div className={`mb-12 ${contained}`}>
        {block.image ? (
          <div className="relative aspect-[21/9] rounded-xl overflow-hidden bg-muted mb-6">
            <img src={block.image} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white">
              <h2 className="text-2xl sm:text-3xl font-bold">{block.title}</h2>
              {block.subtitle && <p className="mt-2 text-white/90">{block.subtitle}</p>}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{block.title}</h2>
            {block.subtitle && <p className="text-lg text-muted-foreground">{block.subtitle}</p>}
          </div>
        )}
      </div>
    );
  }

  if (block.type === 'richtext') {
    const html = sanitizeCmsHtml(resolveRichtextHtml(block));
    return (
      <div
        className={`cms-richtext mb-10 max-w-none ${contained}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  if (block.type === 'image') {
    const wrap = block.width === 'full' ? 'w-full' : `${contained} rounded-xl overflow-hidden`;
    return (
      <figure className={`mb-10 ${wrap}`}>
        <img src={block.src} alt={block.caption || ''} className="w-full h-auto object-cover" />
        {block.caption && (
          <figcaption className="mt-2 text-sm text-muted-foreground text-center">{block.caption}</figcaption>
        )}
      </figure>
    );
  }

  return null;
}

export function sectionOuterWidthClass(layout: CmsPageLayout): string {
  switch (layout) {
    case 'narrow':
      return 'max-w-2xl mx-auto';
    case 'full_bleed':
      return 'max-w-none';
    case 'full_width':
    case 'grid':
    case 'grid_2':
    case 'grid_3':
      return 'max-w-7xl mx-auto';
    case 'default':
    default:
      return 'max-w-4xl mx-auto';
  }
}

export function homeCustomLayoutToPageLayout(layout: string): CmsPageLayout {
  const allowed: CmsPageLayout[] = [
    'narrow',
    'full_bleed',
    'full_width',
    'grid',
    'grid_2',
    'grid_3',
  ];
  if (allowed.includes(layout as CmsPageLayout)) return layout as CmsPageLayout;
  return 'default';
}

export function CmsBlocksView({ blocks, layout }: { blocks: CmsContentBlock[]; layout: CmsPageLayout }) {
  if (isMulticolumnGridLayout(layout)) {
    const gridClass = gridWrapperClass(layout);
    return (
      <div className={gridClass}>
        {blocks.map((block, i) => (
          <div key={i} className={blockGridCellClass(layout, block)}>
            <CmsBlockView block={block} layout="full_width" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {blocks.map((block, i) => (
        <CmsBlockView key={i} block={block} layout={layout} />
      ))}
    </>
  );
}
