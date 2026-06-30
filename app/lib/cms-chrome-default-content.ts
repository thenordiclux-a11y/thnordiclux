import type { CmsContentBlock, CmsPageLayout } from './cms-types';

/**
 * Mirrors the legacy footer: brand intro, three link columns, then legal row.
 * Use layout <code>grid_3</code>: first block spans full width; next three are columns; last spans full width.
 */
export const DEFAULT_FOOTER_CHROME_LAYOUT: CmsPageLayout = 'grid_3';

export const DEFAULT_FOOTER_CHROME_BLOCKS: CmsContentBlock[] = [
  {
    type: 'richtext',
    gridSpan: 'full',
    paragraphs: [
      'Nordic Lux',
      'Your trusted destination for authentic premium cosmetics from leading US and Canadian brands.',
    ],
    html:
      '<p><strong><a href="/">Nordic Lux</a></strong></p>' +
      '<p>Your trusted destination for authentic premium cosmetics from leading US and Canadian brands.</p>',
  },
  {
    type: 'richtext',
    paragraphs: ['Shop links'],
    html:
      '<h4>Shop</h4>' +
      '<ul>' +
      '<li><a href="/shop">All Products</a></li>' +
      '<li><a href="/#concerns">Skin Concerns</a></li>' +
      '<li><a href="/#categories">Categories</a></li>' +
      '<li><a href="/#brands">Brands</a></li>' +
      '<li><a href="/#deals">Sale</a></li>' +
      '</ul>',
  },
  {
    type: 'richtext',
    paragraphs: ['Support links'],
    html:
      '<h4>Support</h4>' +
      '<ul>' +
      '<li><a href="/#contact">Help Center</a></li>' +
      '<li><a href="/track-order">Track Order</a></li>' +
      '<li><a href="/#contact">Returns</a></li>' +
      '<li><a href="/#contact">Shipping Info</a></li>' +
      '<li><a href="/#contact">Contact Us</a></li>' +
      '</ul>',
  },
  {
    type: 'richtext',
    paragraphs: ['Company links'],
    html:
      '<h4>Company</h4>' +
      '<ul>' +
      '<li><a href="/#contact">About Us</a></li>' +
      '<li><a href="/#contact">Careers</a></li>' +
      '<li><a href="/blog">Blog</a></li>' +
      '<li><a href="/affiliate/login">Affiliate</a></li>' +
      '<li><a href="/#contact">Press</a></li>' +
      '<li><a href="/admin/login">Admin</a></li>' +
      '</ul>',
  },
  {
    type: 'richtext',
    gridSpan: 'full',
    paragraphs: ['© 2026 Nordic Lux. All rights reserved.', 'Privacy · Terms · Cookies'],
    html:
      '<p>© 2026 Nordic Lux. All rights reserved.</p>' +
      '<p>' +
      '<a href="/#contact">Privacy</a> · ' +
      '<a href="/#contact">Terms</a> · ' +
      '<a href="/#contact">Cookies</a>' +
      '</p>',
  },
];

export function cloneDefaultFooterChromeBlocks(): CmsContentBlock[] {
  return JSON.parse(JSON.stringify(DEFAULT_FOOTER_CHROME_BLOCKS)) as CmsContentBlock[];
}
