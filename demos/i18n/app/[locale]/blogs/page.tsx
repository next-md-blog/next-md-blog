import { getAllBlogPosts, generateBlogListMetadata } from '@next-md-blog/core';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import { Calendar, User, ArrowRight, Clock } from 'lucide-react';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { DocsLink } from '@/components/docs-link';
import blogConfig from '@/next-md-blog.config';

/**
 * Generate SEO metadata for the blogs listing page
 */
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const { locale } = resolvedParams;
  const posts = await getAllBlogPosts({ locale, config: blogConfig });
  return generateBlogListMetadata(posts);
}

/**
 * Blogs listing page
 */
export default async function BlogsPage({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;
  const { locale } = resolvedParams;
  const posts = await getAllBlogPosts({ locale, config: blogConfig });

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 sm:py-10 max-w-5xl">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-10 pb-8 border-b border-border/80">
          <Button variant="ghost" asChild className="-ml-2 text-muted-foreground hover:text-foreground">
            <Link href={`/${locale}`}>← Back to home</Link>
          </Button>
          <div className="flex items-center gap-2">
            <DocsLink />
            <ThemeToggle />
            <LocaleSwitcher currentLocale={locale} />
          </div>
        </div>

        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-2">Blog</h1>
          <p className="text-muted-foreground text-lg">
            {posts.length} {posts.length === 1 ? 'post' : 'posts'}
          </p>
        </header>

        {posts.length === 0 ? (
          <Card className="border-dashed border-border bg-card/50">
            <CardContent className="pt-10 pb-10">
              <div className="text-center max-w-md mx-auto">
                <p className="text-foreground font-medium mb-2">No posts yet</p>
                <p className="text-sm text-muted-foreground">
                  Add markdown files to{' '}
                  <code className="bg-muted px-2 py-0.5 rounded-md font-mono text-xs">posts/{locale}/</code>
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <ul className="grid gap-5 md:grid-cols-2 list-none p-0 m-0">
            {posts.map((post) => (
              <li key={post.slug}>
                <Link href={`/${locale}/blog/${post.slug}`} className="block group h-full" tabIndex={-1}>
                  <Card
                    className="h-full border-border/80 bg-card/70 backdrop-blur-sm shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/35 cursor-pointer"
                    tabIndex={0}
                    aria-label={`Read blog post: ${post.frontmatter.title || post.slug}`}
                  >
                    <CardHeader className="space-y-3">
                      <CardTitle className="text-xl font-semibold leading-snug group-hover:text-primary transition-colors">
                        {post.frontmatter.title || post.slug}
                      </CardTitle>
                      {post.frontmatter.description && (
                        <CardDescription className="text-base leading-relaxed line-clamp-3">
                          {post.frontmatter.description}
                        </CardDescription>
                      )}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1">
                        {post.frontmatter.date && (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden />
                            <time dateTime={post.frontmatter.date}>
                              {new Date(post.frontmatter.date).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </time>
                          </div>
                        )}
                        {post.authors && post.authors.length > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 shrink-0" aria-hidden />
                            <span>
                              {post.authors.map((author, idx) => (
                                <span key={idx}>
                                  {idx > 0 && ', '}
                                  {typeof author === 'string' ? author : author.name}
                                </span>
                              ))}
                            </span>
                          </div>
                        ) : null}
                        {post.frontmatter.readingTime && (
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                            <span>{post.frontmatter.readingTime} min read</span>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {post.frontmatter.tags && Array.isArray(post.frontmatter.tags) && (
                        <div className="flex gap-2 flex-wrap mb-4">
                          {post.frontmatter.tags.map((tag: string) => (
                            <span
                              key={tag}
                              className="inline-flex items-center rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-xs text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center text-sm font-medium text-primary">
                        Read article
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
