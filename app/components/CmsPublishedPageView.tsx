import Link from 'next/link';
import { CmsBlocksView, sectionOuterWidthClass } from './CmsBlocksView';
import type { CmsPageRecord } from '../lib/cms-types';

export function CmsPublishedPageView({ page }: { page: CmsPageRecord }) {
  const outer = sectionOuterWidthClass(page.layout);

  return (
    <div className="bg-background pb-16">
      <div className={`mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 ${outer}`}>
        <nav className="mb-8">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            ← Home
          </Link>
        </nav>
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{page.title}</h1>
        </header>
        <div>
          <CmsBlocksView blocks={page.blocks} layout={page.layout} />
        </div>
      </div>
    </div>
  );
}
