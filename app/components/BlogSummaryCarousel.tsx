'use client';

import Link from 'next/link';
import type { BlogPost } from '../lib/blog-posts';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from './ui/carousel';
import { ArrowUpRight } from 'lucide-react';

interface BlogSummaryCarouselProps {
  posts: BlogPost[];
}

export function BlogSummaryCarousel({ posts }: BlogSummaryCarouselProps) {
  if (posts.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground py-8 max-w-md mx-auto">
        No blog posts yet. Add posts in the admin under{' '}
        <span className="font-medium text-foreground">Content → Blog (CMS)</span>, or seed the Supabase{' '}
        <code className="text-xs bg-muted px-1 py-0.5 rounded">cms_blog_posts</code> table.
      </p>
    );
  }

  return (
    <div className="relative px-2 sm:px-10">
      <Carousel
        opts={{ align: 'start', loop: posts.length > 2 }}
        className="w-full"
      >
        <CarouselContent className="-ml-3 md:-ml-4">
          {posts.map((post) => (
            <CarouselItem
              key={post.slug}
              className="pl-3 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
            >
              <Link
                href={`/blog/${post.slug}`}
                className="group block h-full rounded-2xl border border-border/80 bg-white overflow-hidden shadow-sm hover:shadow-md hover:border-primary/25 transition-all duration-300"
              >
                <div className="aspect-[16/10] overflow-hidden bg-muted">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>{post.date}</span>
                    <span>{post.readTimeMinutes} min read</span>
                  </div>
                  {post.category && (
                    <span className="text-[11px] uppercase tracking-wider text-primary font-medium">
                      {post.category}
                    </span>
                  )}
                  <h3 className="text-lg font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-primary pt-1">
                    Read article
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex -left-1 lg:-left-3 border-border bg-white shadow-sm" />
        <CarouselNext className="hidden sm:flex -right-1 lg:-right-3 border-border bg-white shadow-sm" />
      </Carousel>
    </div>
  );
}
