'use client';

import Link from 'next/link';
import type { CmsFooterStructured, CmsFooterLinkColumn, CmsFooterLegalItem, CmsSocialLink } from '../lib/cms-types';
import { SocialLinksColumn } from './SocialLinksColumn';

function navUsesNextLink(href: string): boolean {
  if (/^https?:\/\//i.test(href)) return false;
  if (href.includes('#')) return false;
  return href.startsWith('/');
}

function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

function FooterNavLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const h = href.trim();
  if (navUsesNextLink(h)) {
    return (
      <Link href={h} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a
      href={h}
      className={className}
      {...(isExternalHref(h) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {children}
    </a>
  );
}

function FooterColumn({ column }: { column: CmsFooterLinkColumn }) {
  const links = column.links.filter((l) => l.enabled !== false && l.label.trim() && l.href.trim());
  if (!links.length) return null;
  return (
    <div className="min-w-0">
      <h4 className="mb-4 text-sm uppercase tracking-wider text-foreground">{column.title}</h4>
      <ul className="m-0 list-none space-y-3 p-0 text-sm text-muted-foreground">
        {links.map((l) => (
          <li key={l.id}>
            <FooterNavLink href={l.href} className="transition-colors hover:text-primary">
              {l.label}
            </FooterNavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

function activeLegal(links: CmsFooterLegalItem[] | undefined) {
  if (!links?.length) return [];
  return links.filter((l) => l.enabled !== false && l.label.trim() && l.href.trim());
}

function columnIsVisible(column: CmsFooterLinkColumn): boolean {
  return column.links.some((l) => l.enabled !== false && l.label.trim() && l.href.trim());
}

function hasActiveSocial(links: CmsSocialLink[]): boolean {
  return links.some((l) => {
    if (l.enabled === false) return false;
    const h = l.href?.trim() ?? '';
    if (!h || h === 'https://' || h === 'http://') return false;
    return true;
  });
}

export function FooterStructuredView({
  structured: s,
  socialLinks,
  socialColumnTitle,
  marketingLogoSrc,
  staticLogoSrc,
}: {
  structured: CmsFooterStructured;
  socialLinks: CmsSocialLink[];
  socialColumnTitle?: string;
  /** Marketing header logo when footer logo URL is empty */
  marketingLogoSrc: string;
  staticLogoSrc: string;
}) {
  const footerLogoUrl = s.logoImageUrl?.trim();
  const logoSrc =
    footerLogoUrl && footerLogoUrl.length > 0 ? footerLogoUrl : marketingLogoSrc || staticLogoSrc;
  const logoAlt = s.logoAlt?.trim() || 'Brand';
  const socialIdx = s.columnOrder.indexOf('social');
  const socialBorder = socialIdx > 0;
  const showSocial = hasActiveSocial(socialLinks);

  const brandBlock = (
    <div className="min-w-0 lg:max-w-sm">
      {s.showBrandLogo !== false && (
        <Link href="/">
          <img
            src={logoSrc}
            alt={logoAlt}
            className="mb-4 h-12 w-12 transition-all duration-300 sm:h-16 sm:w-16 lg:h-20 lg:w-20"
          />
        </Link>
      )}
      {s.brandTitle?.trim() ? (
        <p className="mb-2 text-sm font-semibold text-foreground">{s.brandTitle.trim()}</p>
      ) : null}
      {s.brandDescription?.trim() ? (
        <p className="mb-6 max-w-xs text-sm text-muted-foreground">{s.brandDescription.trim()}</p>
      ) : null}
    </div>
  );

  return (
    <>
      <div className="mb-12 flex flex-col flex-wrap gap-12 lg:flex-row lg:items-start">
        {s.columnOrder.map((id) => {
          if (id === 'brand') {
            const showBrand =
              s.showBrandLogo !== false ||
              !!s.brandTitle?.trim() ||
              !!s.brandDescription?.trim();
            if (!showBrand) return null;
            return (
              <div key={id} className="w-full shrink-0 lg:w-auto lg:min-w-[220px] lg:flex-[1.15]">
                {brandBlock}
              </div>
            );
          }
          if (id === 'shop') {
            if (!columnIsVisible(s.shop)) return null;
            return (
              <div key={id} className="w-full min-w-0 shrink-0 lg:w-0 lg:flex-1">
                <FooterColumn column={s.shop} />
              </div>
            );
          }
          if (id === 'support') {
            if (!columnIsVisible(s.support)) return null;
            return (
              <div key={id} className="w-full min-w-0 shrink-0 lg:w-0 lg:flex-1">
                <FooterColumn column={s.support} />
              </div>
            );
          }
          if (id === 'company') {
            if (!columnIsVisible(s.company)) return null;
            return (
              <div key={id} className="w-full min-w-0 shrink-0 lg:w-0 lg:flex-1">
                <FooterColumn column={s.company} />
              </div>
            );
          }
          if (id === 'social') {
            if (!showSocial) return null;
            return (
              <div
                key={id}
                className={
                  'w-full shrink-0 lg:w-auto lg:min-w-[200px] lg:max-w-xs' +
                  (socialBorder ? ' lg:border-l lg:border-gray-200 lg:pl-10' : '')
                }
              >
                <SocialLinksColumn links={socialLinks} title={socialColumnTitle} />
              </div>
            );
          }
          return null;
        })}
      </div>

      {(s.copyrightLine?.trim() || activeLegal(s.legalLinks).length > 0) && (
        <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-8 sm:flex-row sm:items-center">
          {s.copyrightLine?.trim() ? (
            <p className="text-center text-sm text-muted-foreground sm:text-left">{s.copyrightLine.trim()}</p>
          ) : (
            <span />
          )}
          {activeLegal(s.legalLinks).length > 0 ? (
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground sm:justify-end">
              {activeLegal(s.legalLinks).map((l) => (
                <FooterNavLink key={l.id} href={l.href} className="transition-colors hover:text-primary">
                  {l.label}
                </FooterNavLink>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </>
  );
}
