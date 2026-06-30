import Link from 'next/link';
import { getSiteBlogPosts } from '../lib/cms-site';
import { ArrowUpRight } from 'lucide-react';

export const metadata = {
  title: 'Blog | Nordic Lux',
  description: 'Tips on skincare, beauty, wellness, and lifestyle from Nordic Lux.',
};

export const dynamic = 'force-dynamic';

export default async function BlogPage() {
  const posts = await getSiteBlogPosts();

  return (
    <div className="bg-background">
      <header className="border-b border-border bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
          <p className="text-sm uppercase tracking-widest text-primary mb-2">Journal</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Blog</h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Guides and ideas for skincare, makeup, and everyday wellness, updated here first.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12 pb-12">
        <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 list-none p-0 m-0">
          {posts.map((post) => (
            <li key={post.slug}>
              <article className="group h-full">
                <Link
                  href={`/blog/${post.slug}`}
                  className="flex flex-col h-full rounded-2xl border border-border bg-white overflow-hidden shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-muted shrink-0">
                    <img
                      src={post.image}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="flex flex-col flex-1 p-5 sm:p-6">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground mb-3">
                      <time dateTime={post.date}>{post.date}</time>
                      <span aria-hidden>·</span>
                      <span>{post.readTimeMinutes} min</span>
                      {post.category && (
                        <>
                          <span aria-hidden>·</span>
                          <span className="text-primary font-medium">{post.category}</span>
                        </>
                      )}
                    </div>
                    <h2 className="text-lg sm:text-xl font-semibold group-hover:text-primary transition-colors leading-snug mb-2">
                      {post.title}
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1 mb-4">
                      {post.excerpt}
                    </p>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-primary mt-auto">
                      Read article
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              </article>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
