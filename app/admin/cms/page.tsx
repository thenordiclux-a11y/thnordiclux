'use client';

import Link from 'next/link';
import {
  LayoutTemplate,
  PanelsTopLeft,
  Newspaper,
  FileStack,
  Menu,
  ArrowUpToLine,
  ArrowDownToLine,
} from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';

const cards = [
  {
    name: 'Home page',
    description: 'Announcement bar, hero, promo banners, blog teaser, newsletter copy.',
    href: '/admin/cms/home',
    icon: PanelsTopLeft,
  },
  {
    name: 'Marketing header',
    description: 'Logo URL, tagline, search placeholders, header width, and which icons show (nav stays under Navigation).',
    href: '/admin/cms/header',
    icon: ArrowUpToLine,
  },
  {
    name: 'Footer',
    description:
      'Logo, brand text, Shop / Support / Company columns (drag links), drag section order, copyright & legal links, social icons.',
    href: '/admin/cms/footer',
    icon: ArrowDownToLine,
  },
  {
    name: 'Navigation',
    description: 'Header menu links for the marketing site: add, edit, reorder, and remove.',
    href: '/admin/cms/navigation',
    icon: Menu,
  },
  {
    name: 'Blog',
    description: 'Create, edit, publish, and order blog posts. Falls back to built-in posts if the table is empty.',
    href: '/admin/cms/blog',
    icon: Newspaper,
  },
  {
    name: 'Site pages',
    description: 'Custom pages at yoursite.com/page-name — rich text, hero, images, and grid layouts.',
    href: '/admin/cms/pages',
    icon: FileStack,
  },
];

export default function CmsOverviewPage() {
  const configured = isSupabaseConfigured();

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <LayoutTemplate className="w-4 h-4" />
          <span>Content management</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">CMS</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1 max-w-2xl">
          Edit marketing copy and structured content stored in Supabase. Run the SQL migration in{' '}
          <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">supabase/migrations/001_schema.sql</code>{' '}
          if tables are missing.
        </p>
      </div>

      {!configured && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Supabase environment variables are not set. CMS saves will not persist until{' '}
          <code className="text-xs">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
          <code className="text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> are configured.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:border-blue-200 hover:shadow transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700 group-hover:bg-blue-100">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 font-semibold text-gray-900">{card.name}</h2>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">{card.description}</p>
              <span className="mt-4 inline-block text-sm font-medium text-blue-600 group-hover:underline">
                Open
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
