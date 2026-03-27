import { getBlogPost, getAllBlogPosts } from '@next-md-blog/core';
import { MarkdownContent } from '@next-md-blog/core';
import { GetStaticPaths, GetStaticProps } from 'next';
import blogConfig from '@/next-md-blog.config';
{{POSTS_DIR_OPTION}}
export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getAllBlogPosts({{POSTS_DIR_PARAM}});
  const paths = posts.map((post) => ({
    params: { slug: post.slug },
  }));

  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const post = await getBlogPost(params?.slug as string{{POSTS_DIR_PARAM_FUNC}});

  if (!post) {
    return { notFound: true };
  }

  return {
    props: { post },
  };
};

export default function BlogPost({ post }: { post: any }) {
  return (
    <article className="min-h-screen">
      <div className="container mx-auto px-4 py-8 sm:py-10 max-w-3xl">
        <header className="mb-8 space-y-6">
          {post.frontmatter?.title && (
            <h1 className="text-3xl sm:text-4xl md:text-[2.75rem] font-bold tracking-tight text-foreground leading-[1.15]">
              {post.frontmatter.title}
            </h1>
          )}
          {post.frontmatter?.date && (
            <p className="text-sm text-muted-foreground">{post.frontmatter.date}</p>
          )}
        </header>
        <div className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm shadow-sm px-5 py-8 sm:px-10 sm:py-10">
          <div className="prose prose-lg dark:prose-invert max-w-none prose-a:text-primary">
            <MarkdownContent content={post.content} />
          </div>
        </div>
      </div>
    </article>
  );
}
