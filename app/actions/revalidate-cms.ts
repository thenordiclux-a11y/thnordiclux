'use server';

import { revalidatePath, revalidateTag } from 'next/cache';

const STOREFRONT_SEGMENTS = ['/', '/shop', '/track-order', '/checkout', '/blog'];

/** Run after saving `cms_home` so header/footer/nav update everywhere (including shop/product/checkout). */
export async function revalidateAfterCmsHomeSave() {
  revalidateTag('cms-home');
  revalidateTag('cms-blog');
  revalidatePath('/', 'layout');
  for (const path of STOREFRONT_SEGMENTS) {
    revalidatePath(path, 'layout');
    revalidatePath(path, 'page');
  }
}
