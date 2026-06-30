'use client';

import type { CmsSocialLink } from '../lib/cms-types';
import { SOCIAL_PLATFORM_LABELS } from '../lib/cms-social';
import { SocialPlatformIcon } from './SocialPlatformIcon';

function isRenderableHref(href: string): boolean {
  const h = href.trim();
  if (!h) return false;
  if (h === 'https://' || h === 'http://') return false;
  return true;
}

export function SocialLinksColumn({ links, title }: { links: CmsSocialLink[]; title?: string }) {
  const active = links.filter((l) => l.enabled !== false && isRenderableHref(l.href));
  if (active.length === 0) return null;

  const heading = title?.trim() ?? '';

  return (
    <div className="lg:pt-0">
      {heading ? (
        <h4 className="mb-4 text-sm uppercase tracking-wider text-foreground">{heading}</h4>
      ) : null}
      <ul className="m-0 flex flex-wrap gap-3 p-0 list-none" role="list">
        {active.map((link) => {
          const aria =
            link.label?.trim() || SOCIAL_PLATFORM_LABELS[link.platform] || 'Social link';
          return (
            <li key={link.id}>
              <a
                href={link.href.trim()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-muted-foreground transition-all hover:border-primary hover:text-primary"
                aria-label={aria}
                title={aria}
              >
                <SocialPlatformIcon platform={link.platform} />
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
