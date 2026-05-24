import type { ReactNode } from 'react';
import { MarkdownContent } from '@next-md-blog/core';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { DocsLink } from '@/components/docs-link';
import { Calendar, User, Clock, FileText } from 'lucide-react';
import { blog, LOCALES } from '@/next-md-blog.config';

export async function generateStaticParams() {
  const out: Array<{ slug: string; locale: string }> = [];
  for (const locale of LOCALES) {
    const posts = await blog.getAll({ locale });
    for (const post of posts) out.push({ slug: post.slug, locale });
  }
  return out;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const post = await blog.getOne(slug, { locale });
  if (!post) return { title: 'Post Not Found' };

  // hreflang: include every locale that has a sibling translation.
  const alternateLanguages = await blog.hreflangMap(slug, LOCALES);
  return blog.metadata(post, {
    locale,
    titleTemplate: 'absolute',
    alternateLanguages,
  });
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const post = await blog.getOne(slug, { locale });
  if (!post) notFound();

  const postTitle =
    (typeof post.frontmatter.title === 'string' && post.frontmatter.title) ||
    post.slug;

  const metaItems: { key: string; node: ReactNode }[] = [];

  if (post.frontmatter.date) {
    metaItems.push({
      key: 'date',
      node: (
        <>
          <Calendar className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
          <time dateTime={post.frontmatter.date}>
            {new Date(post.frontmatter.date).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
        </>
      ),
    });
  }
  if (post.authors.length > 0) {
    metaItems.push({
      key: 'authors',
      node: (
        <>
          <User className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
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
        </>
      ),
    });
  }
  if (post.readingTime > 0) {
    metaItems.push({
      key: 'read',
      node: (
        <>
          <Clock className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
          <span>{post.readingTime} min read</span>
        </>
      ),
    });
  }
  if (post.wordCount > 0) {
    metaItems.push({
      key: 'words',
      node: (
        <>
          <FileText className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
          <span>{post.wordCount.toLocaleString()} words</span>
        </>
      ),
    });
  }

  // Locale-aware breadcrumbs.
  const homeUrl = blog.config.site.siteUrl
    ? `${blog.config.site.siteUrl}/${locale}`
    : `/${locale}`;
  const breadcrumbs = [
    { name: 'Home', url: homeUrl },
    { name: 'Blog', url: blog.indexUrl(locale) },
    { name: postTitle, url: blog.url(slug, locale) },
  ];
  const jsonLd = blog.schemaGraph(post, breadcrumbs, {
    locale,
    speakable: true,
  });

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
            <Button variant="ghost" asChild className="-ml-2 text-muted-foreground hover:text-foreground shrink-0">
              <Link href={`/${locale}/blogs`}>← All posts</Link>
            </Button>
            <div className="flex items-center gap-2 shrink-0">
              <DocsLink />
              <ThemeToggle />
              <LocaleSwitcher currentLocale={locale} />
            </div>
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
