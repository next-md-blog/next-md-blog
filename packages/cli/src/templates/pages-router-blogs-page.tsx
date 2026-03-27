import { getAllBlogPosts } from '@next-md-blog/core';
import Link from 'next/link';
import blogConfig from '@/next-md-blog.config';
{{POSTS_DIR_OPTION}}
export async function getStaticProps() {
  const posts = await getAllBlogPosts({{POSTS_DIR_PARAM}});
  return {
    props: { posts },
  };
}

export default function BlogsPage({ posts }: { posts: any[] }) {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 sm:py-10 max-w-5xl">
        <header className="mb-10 pb-8 border-b border-border/80">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-2">Blog</h1>
          <p className="text-muted-foreground text-lg">
            {posts.length} {posts.length === 1 ? 'post' : 'posts'}
          </p>
        </header>
        <ul className="grid list-none gap-5 p-0 m-0 md:grid-cols-2">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/{{BLOG_ROUTE}}/${post.slug}`}
                className="group block h-full rounded-xl border border-border/80 bg-card/70 shadow-sm transition-all duration-200 hover:border-primary/35 hover:shadow-md"
              >
                <div className="flex h-full flex-col p-6 sm:p-7">
                  <h2 className="text-xl font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                    {post.frontmatter?.title || post.slug}
                  </h2>
                  {post.frontmatter?.date && (
                    <p className="mt-3 text-xs text-muted-foreground">{post.frontmatter.date}</p>
                  )}
                  {post.frontmatter?.description && (
                    <p className="mt-2 line-clamp-3 text-base leading-relaxed text-muted-foreground">
                      {post.frontmatter.description}
                    </p>
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
      </div>
    </div>
  );
}
