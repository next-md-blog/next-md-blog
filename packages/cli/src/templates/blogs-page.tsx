import Link from 'next/link';
import type { Metadata } from 'next';
import { blog } from '@/next-md-blog.config';

export async function generateMetadata({ params }: { params: Promise<{{PARAMS_TYPE}}> }): Promise<Metadata> {
  const resolvedParams = await params;
{{LOCALE_EXTRACT}}
  const posts = await blog.getAll({{GET_OPTS}});
  return {{LIST_METADATA_CALL}};
}

export default async function BlogsPage({ params }: { params: Promise<{{PARAMS_TYPE}}> }) {
  const resolvedParams = await params;
{{LOCALE_EXTRACT}}
  const posts = await blog.getAll({{GET_OPTS}});

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
              Add markdown files to your collection's <code className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs">contentDir</code>.
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
