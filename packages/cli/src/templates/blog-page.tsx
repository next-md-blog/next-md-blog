import type { ReactNode } from 'react';
import { getBlogPost, getAllBlogPosts, generateBlogPostMetadata, BlogPostSEO } from '@next-md-blog/core';
import { MarkdownContent } from '@next-md-blog/core';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import blogConfig from '@/next-md-blog.config';
{{POSTS_DIR_OPTION}}

export async function generateStaticParams() {
{{GENERATE_STATIC_PARAMS}}
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string{{LOCALE_PARAM}} }> }): Promise<Metadata> {
  const resolvedParams = await params;
{{LOCALE_EXTRACT}}
  const post = await getBlogPost(slug{{POSTS_DIR_PARAM_FUNC}}, { config: blogConfig });

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return generateBlogPostMetadata(post, blogConfig);
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string{{LOCALE_PARAM}} }> }) {
  const resolvedParams = await params;
{{LOCALE_EXTRACT}}
  const post = await getBlogPost(slug{{POSTS_DIR_PARAM_FUNC}}, { config: blogConfig });

  if (!post) {
    notFound();
  }

  const metaRows: { key: string; label: ReactNode }[] = [];

  if (post.frontmatter?.date) {
    metaRows.push({
      key: 'date',
      label: (
        <time dateTime={post.frontmatter.date}>
          {new Date(post.frontmatter.date).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>
      ),
    });
  }

  if (post.authors && post.authors.length > 0) {
    metaRows.push({
      key: 'authors',
      label: (
        <span>
          {post.authors.map((author, idx: number) => {
            const name = typeof author === 'string' ? author : author.name;
            return (
              <span key={idx}>
                {idx > 0 && ', '}
                {name}
              </span>
            );
          })}
        </span>
      ),
    });
  }

  if (post.readingTime > 0) {
    metaRows.push({
      key: 'read',
      label: <span>{post.readingTime} min read</span>,
    });
  }

  if (post.wordCount > 0) {
    metaRows.push({
      key: 'words',
      label: <span>{post.wordCount.toLocaleString()} words</span>,
    });
  }

  return (
    <>
      <BlogPostSEO post={post} config={blogConfig} />

      <article className="min-h-screen">
        <div className="container mx-auto px-4 py-8 sm:py-10 max-w-3xl">
          <div className="mb-10">
            <Link
              {{BACK_TO_LIST_HREF_ATTR}}
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              All posts
            </Link>
          </div>

          <header className="mb-8 space-y-6">
            {post.frontmatter?.title && (
              <h1 className="text-3xl sm:text-4xl md:text-[2.75rem] font-bold tracking-tight text-foreground leading-[1.15]">
                {post.frontmatter.title}
              </h1>
            )}
            {post.frontmatter?.description && (
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-prose">
                {post.frontmatter.description}
              </p>
            )}
            {metaRows.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {metaRows.map(({ key, label }) => (
                  <span
                    key={key}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground"
                  >
                    {label}
                  </span>
                ))}
              </div>
            )}
            {post.frontmatter?.tags && Array.isArray(post.frontmatter.tags) && post.frontmatter.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.frontmatter.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="rounded-md border border-border bg-secondary/80 px-2.5 py-1 text-xs font-medium text-secondary-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          <div className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm shadow-sm px-5 py-8 sm:px-10 sm:py-10">
            <div className="prose prose-lg dark:prose-invert max-w-none prose-a:text-primary prose-headings:scroll-mt-24">
              <MarkdownContent content={post.content} />
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
