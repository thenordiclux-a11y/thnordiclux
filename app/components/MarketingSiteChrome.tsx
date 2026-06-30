'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ShoppingCart,
  Search,
  Menu,
  X,
  User,
  Heart,
  Package,
  ChevronDown,
  Home,
  ShoppingBag,
  Grid3x3,
  Mail,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { CartDrawer } from './CartDrawer';
import { useCart } from '../contexts/CartContext';
import logo from '../assets/4cb21529e27325b99c96e06426397bce92267e6c.png';
import type { ReactNode } from 'react';
import type {
  CmsAnnouncement,
  CmsHeaderNavTrackLink,
  CmsMarketingHeader,
  CmsNavLink,
  CmsSiteFooterChrome,
} from '../lib/cms-types';
import {
  DEFAULT_HEADER_NAV_LINKS,
  DEFAULT_HEADER_NAV_TRACK_LINK,
} from '../lib/nav-links';
import { FooterStructuredView } from './FooterStructuredView';
import { mergeFooterStructured } from '../lib/cms-footer-structured';

/** Announcement bar only from CMS (CMS → Home); no hardcoded marketing copy. */
function resolveAnnouncement(prop?: CmsAnnouncement | null): { line1: string; line2: string } | null {
  if (prop == null) return null;
  if (prop.enabled === false) return null;
  const line1 = prop.line1?.trim() ?? '';
  const line2 = prop.line2?.trim() ?? '';
  if (!line1 && !line2) return null;
  return { line1, line2 };
}

function resolveHeaderNavLinks(prop?: CmsNavLink[] | null): CmsNavLink[] {
  const base = prop !== undefined && prop !== null ? prop : DEFAULT_HEADER_NAV_LINKS;
  return base.filter((l) => l.enabled !== false);
}

function resolveHeaderNavTrackLink(prop?: CmsHeaderNavTrackLink | null): CmsHeaderNavTrackLink {
  if (prop !== undefined && prop !== null) {
    return {
      label: prop.label?.trim() || DEFAULT_HEADER_NAV_TRACK_LINK.label,
      href: prop.href?.trim() || DEFAULT_HEADER_NAV_TRACK_LINK.href,
      enabled: prop.enabled !== false,
    };
  }
  return { ...DEFAULT_HEADER_NAV_TRACK_LINK };
}

/** Footer content always comes from merged CMS (`siteFooterChrome`); no duplicate static columns. */
function footerCmsEnabled(zone: CmsSiteFooterChrome | undefined | null): boolean {
  return zone?.enabled === true;
}

function resolveMarketingHeader(h?: CmsMarketingHeader | null) {
  const m = h ?? {};
  const url = m.logoImageUrl?.trim();
  return {
    logoSrc: url && url.length > 0 ? url : null,
    logoAlt: m.logoAlt?.trim() || 'Nordic Lux',
    tagline: m.tagline?.trim() ?? '',
    showTagline: m.showTagline !== false,
    searchDesktop: m.searchPlaceholderDesktop?.trim() ?? '',
    searchMobile: m.searchPlaceholderMobile?.trim() ?? '',
    showDesktopSearch: m.showDesktopSearch !== false,
    showMobileSearch: m.showMobileSearch !== false,
    showWishlist: m.showWishlist !== false,
    showAccount: m.showAccount !== false,
    headerInnerClass:
      m.layout === 'wide'
        ? 'max-w-[min(100%,1400px)] mx-auto px-4 sm:px-6 lg:px-8'
        : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  };
}

function navUsesNextLink(href: string): boolean {
  if (/^https?:\/\//i.test(href)) return false;
  if (href.includes('#')) return false;
  return href.startsWith('/');
}

function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

function DesktopNavItem({
  link,
}: {
  link: CmsNavLink;
}) {
  const emphasis = link.variant === 'emphasis';
  const className =
    (link.variant === 'shop' ? 'flex items-center gap-2 ' : '') +
    'text-sm hover:text-primary transition-colors' +
    (emphasis ? ' text-red-600 hover:text-red-700' : '');

  const inner =
    link.variant === 'shop' ? (
      <>
        <span>{link.label}</span>
        <ChevronDown className="w-4 h-4" />
      </>
    ) : (
      link.label
    );

  if (navUsesNextLink(link.href)) {
    return (
      <Link href={link.href} className={className}>
        {inner}
      </Link>
    );
  }
  return (
    <a
      href={link.href}
      className={className}
      {...(isExternalHref(link.href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {inner}
    </a>
  );
}

function MobileNavItem({
  link,
  onNavigate,
}: {
  link: CmsNavLink;
  onNavigate: () => void;
}) {
  const emphasis = link.variant === 'emphasis';
  const className =
    'px-6 py-3 text-base hover:text-primary hover:bg-gray-50 transition-colors flex items-center gap-3' +
    (emphasis ? ' text-red-600 hover:text-red-700 hover:bg-red-50' : '');

  const inner =
    link.variant === 'shop' ? (
      <>
        <ShoppingBag className="w-5 h-5" />
        <span>{link.label}</span>
      </>
    ) : (
      <span>{link.label}</span>
    );

  if (navUsesNextLink(link.href)) {
    return (
      <Link href={link.href} onClick={onNavigate} className={className}>
        {inner}
      </Link>
    );
  }
  return (
    <a
      href={link.href}
      onClick={onNavigate}
      className={className}
      {...(isExternalHref(link.href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {inner}
    </a>
  );
}

export function MarketingSiteChrome({
  children,
  announcement,
  headerNavLinks,
  headerNavTrackLink,
  siteMarketingHeader,
  siteFooterChrome,
}: {
  children: ReactNode;
  announcement?: CmsAnnouncement | null;
  headerNavLinks?: CmsNavLink[] | null;
  headerNavTrackLink?: CmsHeaderNavTrackLink | null;
  siteMarketingHeader?: CmsMarketingHeader | null;
  siteFooterChrome?: CmsSiteFooterChrome | null;
}) {
  const { cartCount, setIsOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const ann = resolveAnnouncement(announcement);
  const navLinks = resolveHeaderNavLinks(headerNavLinks);
  const trackLink = resolveHeaderNavTrackLink(headerNavTrackLink);
  const mh = resolveMarketingHeader(siteMarketingHeader ?? undefined);
  const showFooterCms = footerCmsEnabled(siteFooterChrome ?? undefined);
  const footerStructuredResolved = siteFooterChrome
    ? mergeFooterStructured(siteFooterChrome.structured ?? undefined, undefined)
    : null;

  return (
    <>
      <div className="min-h-screen bg-white flex flex-col">
        {ann && (
          <div className="bg-foreground text-white py-2.5 text-center text-sm">
            <div className="max-w-7xl mx-auto px-4">
              {ann.line1 ? <span className="font-medium">{ann.line1}</span> : null}
              {ann.line1 && ann.line2 ? <span className="mx-2">•</span> : null}
              {ann.line2 ? <span>{ann.line2}</span> : null}
            </div>
          </div>
        )}

        {/* Header */}
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
          <div className={mh.headerInnerClass}>
            <div className="flex items-center justify-between h-20 lg:h-24">
              <Link href="/" className="flex items-center gap-3">
                <img
                  src={mh.logoSrc ?? logo.src}
                  alt={mh.logoAlt}
                  className="h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 transition-all duration-300"
                />
                {mh.showTagline && mh.tagline ? (
                  <div className="hidden sm:block">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">{mh.tagline}</div>
                  </div>
                ) : null}
              </Link>

              {mh.showDesktopSearch && (
                <div className="hidden lg:flex flex-1 max-w-2xl mx-12">
                  <div className="relative w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder={mh.searchDesktop || 'Search'}
                      className="w-full pl-12 pr-4 h-11 rounded-lg border-gray-200 focus:border-primary bg-gray-50 focus:bg-white"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-1">
                {mh.showAccount && (
                  <Link href="/admin/login">
                    <Button variant="ghost" size="icon" className="hidden lg:flex rounded-lg hover:bg-gray-50">
                      <User className="w-5 h-5" />
                    </Button>
                  </Link>
                )}
                {mh.showWishlist && (
                  <Button variant="ghost" size="icon" className="hidden lg:flex rounded-lg hover:bg-gray-50">
                    <Heart className="w-5 h-5" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative rounded-lg hover:bg-gray-50"
                  onClick={() => setIsOpen(true)}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-primary text-white text-xs">
                      {cartCount}
                    </Badge>
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden rounded-lg"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              </div>
            </div>

            <nav className="hidden lg:flex items-center justify-between py-4 border-t border-gray-100 gap-4">
              <div className="flex flex-wrap items-center gap-6 min-w-0">
                {navLinks.map((link) => (
                  <DesktopNavItem key={link.id} link={link} />
                ))}
              </div>
              {trackLink.enabled !== false && (
                <>
                  {navUsesNextLink(trackLink.href) ? (
                    <Link
                      href={trackLink.href}
                      className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors shrink-0"
                    >
                      <Package className="w-4 h-4" />
                      <span>{trackLink.label}</span>
                    </Link>
                  ) : (
                    <a
                      href={trackLink.href}
                      className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors shrink-0"
                      {...(isExternalHref(trackLink.href)
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                    >
                      <Package className="w-4 h-4" />
                      <span>{trackLink.label}</span>
                    </a>
                  )}
                </>
              )}
            </nav>

            {mh.showMobileSearch && (
              <div className="lg:hidden py-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder={mh.searchMobile || 'Search'}
                    className="w-full pl-10 pr-4 rounded-lg border-gray-200 bg-gray-50"
                  />
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 flex flex-col">{children}</div>

        {/* Footer */}
        <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            {showFooterCms && siteFooterChrome && footerStructuredResolved ? (
              <FooterStructuredView
                structured={footerStructuredResolved}
                socialLinks={siteFooterChrome.socialLinks ?? []}
                socialColumnTitle={siteFooterChrome.socialColumnTitle}
                marketingLogoSrc={mh.logoSrc ?? logo.src}
                staticLogoSrc={logo.src}
              />
            ) : null}
          </div>
        </footer>

        {/* Mobile Menu Sheet */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-full sm:w-80 p-0">
            <SheetHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <img src={mh.logoSrc ?? logo.src} alt={mh.logoAlt} className="h-10 w-10" />
                <SheetTitle className="text-xl">Menu</SheetTitle>
              </div>
            </SheetHeader>
            <nav className="flex flex-col py-4">
              {navLinks.map((link) => (
                <MobileNavItem
                  key={link.id}
                  link={link}
                  onNavigate={() => setMobileMenuOpen(false)}
                />
              ))}
              {trackLink.enabled !== false && (
                <>
                  {navUsesNextLink(trackLink.href) ? (
                    <Link
                      href={trackLink.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-6 py-3 text-base hover:text-primary hover:bg-gray-50 transition-colors flex items-center gap-3"
                    >
                      <Package className="w-5 h-5" />
                      <span>{trackLink.label}</span>
                    </Link>
                  ) : (
                    <a
                      href={trackLink.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-6 py-3 text-base hover:text-primary hover:bg-gray-50 transition-colors flex items-center gap-3"
                      {...(isExternalHref(trackLink.href)
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                    >
                      <Package className="w-5 h-5" />
                      <span>{trackLink.label}</span>
                    </a>
                  )}
                </>
              )}
              <div className="border-t border-gray-100 mt-4 pt-4">
                <a
                  href="/#contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-6 py-3 text-base hover:text-primary hover:bg-gray-50 transition-colors flex items-center gap-3"
                >
                  <Mail className="w-5 h-5" />
                  <span>Contact</span>
                </a>
                <Link
                  href="/admin/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-6 py-3 text-base hover:text-primary hover:bg-gray-50 transition-colors flex items-center gap-3"
                >
                  <User className="w-5 h-5" />
                  <span>Account / Admin</span>
                </Link>
              </div>
            </nav>
          </SheetContent>
        </Sheet>

        {/* Bottom Navigation Bar - Mobile Only */}
        <nav
          className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] lg:hidden"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <div className="flex items-center justify-around min-h-[64px] h-auto py-2 px-1 sm:py-3 sm:px-2">
            <Link
              href="/"
              className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 flex-1 max-w-[25%] py-1.5 px-1 sm:px-2 transition-all duration-200 hover:bg-gray-50 active:bg-gray-100 group rounded-lg"
            >
              <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center transition-transform group-active:scale-90">
                <Home className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <span className="text-[9px] sm:text-[10px] text-muted-foreground font-medium group-hover:text-primary transition-colors leading-tight whitespace-nowrap">
                Home
              </span>
            </Link>

            <Link
              href="/shop"
              className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 flex-1 max-w-[25%] py-1.5 px-1 sm:px-2 transition-all duration-200 hover:bg-gray-50 active:bg-gray-100 group rounded-lg"
            >
              <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center transition-transform group-active:scale-90">
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <span className="text-[9px] sm:text-[10px] text-muted-foreground font-medium group-hover:text-primary transition-colors leading-tight whitespace-nowrap">
                Shop
              </span>
            </Link>

            <a
              href="/#categories"
              className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 flex-1 max-w-[25%] py-1.5 px-1 sm:px-2 transition-all duration-200 hover:bg-gray-50 active:bg-gray-100 group rounded-lg"
            >
              <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center transition-transform group-active:scale-90">
                <Grid3x3 className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <span className="text-[9px] sm:text-[10px] text-muted-foreground font-medium group-hover:text-primary transition-colors leading-tight whitespace-nowrap text-center">
                Categories
              </span>
            </a>

            <a
              href="/#contact"
              className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 flex-1 max-w-[25%] py-1.5 px-1 sm:px-2 transition-all duration-200 hover:bg-gray-50 active:bg-gray-100 group rounded-lg"
            >
              <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center transition-transform group-active:scale-90">
                <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <span className="text-[9px] sm:text-[10px] text-muted-foreground font-medium group-hover:text-primary transition-colors leading-tight whitespace-nowrap">
                Contact
              </span>
            </a>
          </div>
        </nav>

        <div className="h-20 sm:h-24 lg:hidden shrink-0" aria-hidden />
      </div>

      <CartDrawer />
    </>
  );
}
