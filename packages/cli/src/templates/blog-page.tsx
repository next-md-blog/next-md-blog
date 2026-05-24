import type { ReactNode } from 'react';
import { MarkdownContent } from '@next-md-blog/core';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
{{LOCALES_IMPORT}}

export async function generateStaticParams() {
{{GENERATE_STATIC_PARAMS}}
}

export async function generateMetadata({ params }: { params: Promise<{{PARAMS_TYPE}}> }): Promise<Metadata> {
  const resolvedParams = await params;
{{LOCALE_EXTRACT}}
  const post = await blog.getOne(slug{{GET_OPTS}});

  if (!post) {
    return { title: 'Post Not Found' };
  }

  return {{METADATA_CALL}};
}

export default async function BlogPost({ params }: { params: Promise<{{PARAMS_TYPE}}> }) {
  const resolvedParams = await params;
{{LOCALE_EXTRACT}}
  const post = await blog.getOne(slug{{GET_OPTS}});

  if (!post) {
    notFound();
  }

  const metaItems: { key: string; node: ReactNode }[] = [];

  if (post.frontmatter.date) {
    metaItems.push({
      key: 'date',
      node: (
        <span className="inline-flex items-center gap-1.5">
          <svg className="h-3.5 w-3.5 shrink-0 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <time dateTime={post.frontmatter.date}>
            {new Date(post.frontmatter.date).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
        </span>
      ),
    });
  }
  if (post.authors.length > 0) {
    metaItems.push({
      key: 'authors',
      node: (
        <span className="inline-flex items-center gap-1.5">
          <svg className="h-3.5 w-3.5 shrink-0 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>
            {post.authors.map((author, idx) => {
              const name = typeof author === 'string' ? author : author.name;
              return (
                <span key={idx}>
                  {idx > 0 && ', '}
                  {name}
                </span>
              );
            })}
          </span>
        </span>
      ),
    });
  }
  if (post.readingTime > 0) {
    metaItems.push({
      key: 'read',
      node: (
        <span className="inline-flex items-center gap-1.5">
          <svg className="h-3.5 w-3.5 shrink-0 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{post.readingTime} min read</span>
        </span>
      ),
    });
  }

  const jsonLd = {{SCHEMA_GRAPH_CALL}};

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd)
            .replace(/</g, '\\u003c')
            .replace(/>/g, '\\u003e')
            .replace(/&/g, '\\u0026'),
        }}
      />

      <article className="min-h-screen">
        <div className="container mx-auto px-4 py-8 sm:py-10 max-w-3xl">
          <div className="flex justify-between items-center gap-4 mb-10">
            <Link
              {{BACK_TO_LIST_HREF_ATTR}}
              className="-ml-2 text-sm text-muted-foreground hover:text-foreground shrink-0"
            >
              ← All posts
            </Link>
          </div>

          <header className="mb-8 space-y-6">
            {post.frontmatter.title && (
              <h1 className="text-3xl sm:text-4xl md:text-[2.75rem] font-bold tracking-tight text-foreground leading-[1.15]">
                {post.frontmatter.title}
              </h1>
            )}
            {post.frontmatter.description && (
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-prose">
                {post.frontmatter.description}
              </p>
            )}
            {metaItems.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {metaItems.map(({ key, node }) => (
                  <span
                    key={key}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground"
                  >
                    {node}
                  </span>
                ))}
              </div>
            )}
            {post.frontmatter.tags && Array.isArray(post.frontmatter.tags) && post.frontmatter.tags.length > 0 && (
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
            <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:scroll-mt-24">
              <MarkdownContent content={post.content} />
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
