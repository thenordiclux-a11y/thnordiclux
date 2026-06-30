import type { CmsHomeData, CmsSiteFooterChrome } from './cms-types';
import { DEFAULT_FOOTER_CHROME_LAYOUT } from './cms-chrome-default-content';
import { cloneDefaultFooterStructured } from './cms-footer-structured';

/**
 * Footer admin: no fake social rows — add links in CMS → Footer when needed.
 */
export function applyChromeTemplatesForAdminEditor(data: CmsHomeData): CmsHomeData {
  return data;
}

export function resetFooterChromeBlocks(zone: CmsSiteFooterChrome): CmsSiteFooterChrome {
  return {
    ...zone,
    enabled: true,
    layout: DEFAULT_FOOTER_CHROME_LAYOUT,
    blocks: [],
    structured: cloneDefaultFooterStructured(),
    socialLinks: [],
    socialColumnTitle: '',
  };
}
