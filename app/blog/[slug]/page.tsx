import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSiteBlogPostBySlug, getSiteBlogPosts } from '../../lib/cms-site';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  const posts = await getSiteBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getSiteBlogPostBySlug(slug);
  if (!post) return { title: 'Post | Nordic Lux' };
  return {
    title: `${post.title} | Nordic Lux Blog`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getSiteBlogPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="relative bg-background overflow-x-hidden">
      <div className="relative w-screen max-w-[100vw] left-1/2 -translate-x-1/2 min-h-[min(88dvh,920px)] sm:min-h-[min(90dvh,960px)] flex flex-col justify-end">
        <img
          src={post.image}
          alt={post.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/25"
          aria-hidden
        />

        <Link
          href="/blog"
          className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2.5 text-sm font-medium text-foreground shadow-lg backdrop-blur-sm hover:bg-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          All posts
        </Link>

        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-8 pb-10 sm:pb-14 pt-28 sm:pt-36 text-white">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/80 mb-4">
            <time dateTime={post.date}>{post.date}</time>
            <span aria-hidden>·</span>
            <span>{post.readTimeMinutes} min read</span>
            {post.category && (
              <>
                <span aria-hidden>·</span>
                <span className="font-medium text-white">{post.category}</span>
              </>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[2.75rem] font-bold tracking-tight leading-[1.15] text-balance">
            {post.title}
          </h1>
          <p className="mt-5 text-lg sm:text-xl text-white/90 leading-relaxed max-w-2xl text-pretty">
            {post.excerpt}
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
        <div className="prose prose-neutral dark:prose-invert max-w-none prose-p:text-[1.0625rem] prose-p:leading-[1.75]">
          {post.body.map((paragraph, i) => (
            <p key={i} className="text-foreground/90 mb-8 last:mb-0">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-16 pt-10 border-t border-border">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to all posts
          </Link>
        </div>
      </div>
    </article>
  );
}
