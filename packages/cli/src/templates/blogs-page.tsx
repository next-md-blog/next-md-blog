import { getAllBlogPosts, generateBlogListMetadata } from '@next-md-blog/core';
import Link from 'next/link';
import type { Metadata } from 'next';
import blogConfig from '@/next-md-blog.config';
{{POSTS_DIR_OPTION}}

/**
 * Generate SEO metadata for the blogs listing page
 */
export async function generateMetadata({ params }: { params: Promise<{{PARAMS_TYPE}}> }): Promise<Metadata> {
  const resolvedParams = await params;
{{LOCALE_EXTRACT}}
  const posts = await getAllBlogPosts({{POSTS_DIR_PARAM}});
  return generateBlogListMetadata(posts);
}

export default async function BlogsPage({ params }: { params: Promise<{{PARAMS_TYPE}}> }) {
  const resolvedParams = await params;
{{LOCALE_EXTRACT}}
  const posts = await getAllBlogPosts({{POSTS_DIR_PARAM}});

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 sm:py-10 max-w-5xl">
        <header className="mb-10 pb-8 border-b border-border/80">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-2">Blog</h1>
          <p className="text-muted-foreground text-lg">
            {posts.length} {posts.length === 1 ? 'post' : 'posts'}
          </p>
        </header>

        {posts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/50 px-6 py-12 text-center">
            <p className="text-foreground font-medium mb-2">No posts yet</p>
            <p className="text-sm text-muted-foreground">
              Add markdown files to{' '}
              <code className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs">{{CONTENT_DIR}}/</code>
            </p>
          </div>
        ) : (
          <ul className="grid list-none gap-5 p-0 m-0 md:grid-cols-2">
            {posts.map((post) => (
              <li key={post.slug}>
                <Link
                  {{POST_LINK_HREF_ATTR}}
                  className="group block h-full rounded-xl border border-border/80 bg-card/70 shadow-sm transition-all duration-200 hover:border-primary/35 hover:shadow-md"
                >
                  <div className="flex h-full flex-col p-6 sm:p-7">
                    <h2 className="text-xl font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                      {post.frontmatter?.title || post.slug}
                    </h2>
                    {post.frontmatter?.description && (
                      <p className="mt-3 line-clamp-3 text-base leading-relaxed text-muted-foreground">
                        {post.frontmatter.description}
                      </p>
                    )}
                    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      {post.frontmatter?.date && (
                        <span className="inline-flex items-center gap-1.5">
                          <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
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
                      )}
                      {post.authors && post.authors.length > 0 && (
                        <span className="inline-flex items-center gap-1.5">
                          <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
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
                      )}
                      {post.readingTime > 0 && (
                        <span className="inline-flex items-center gap-1.5">
                          <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {post.readingTime} min read
                        </span>
                      )}
                    </div>
                    {post.frontmatter?.tags && Array.isArray(post.frontmatter.tags) && post.frontmatter.tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
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
                    <div className="mt-auto flex items-center pt-4 text-sm font-medium text-primary">
                      Read article
                      <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
