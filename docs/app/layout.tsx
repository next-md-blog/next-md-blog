import type { ReactNode } from 'react';
import { Footer, Layout, Navbar } from 'nextra-theme-docs';
import { Head } from 'nextra/components';
import { getPageMap } from 'nextra/page-map';
import type { Metadata } from 'next';
import 'nextra-theme-docs/style.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.next-md-blog.com'),
  title: {
    default: 'next-md-blog',
    template: '%s – next-md-blog',
  },
  description:
    'Markdown and MDX blog utilities for Next.js: posts on disk, SEO metadata, feeds, and optional CLI scaffolding.',
};

const navbar = (
  <Navbar
    logo={<span className="font-semibold">next-md-blog</span>}
    projectLink="https://github.com/next-md-blog/next-md-blog"
  />
);

const footer = (
  <Footer>
    MIT {new Date().getFullYear()} © next-md-blog. Documentation for{' '}
    <code>@next-md-blog/core</code> and <code>@next-md-blog/cli</code>.{' '}
    <a href="https://demo.next-md-blog.com" className="x:text-primary-600 x:underline">
      Demo (single)
    </a>
    {' · '}
    <a
      href="https://demo.i18n.next-md-blog.com"
      className="x:text-primary-600 x:underline"
    >
      Demo (i18n)
    </a>
    {' · '}
    <a href="https://github.com/next-md-blog/next-md-blog" className="x:text-primary-600 x:underline">
      GitHub
    </a>
  </Footer>
);

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head />
      <body>
        <Layout
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/next-md-blog/next-md-blog/tree/main/docs"
          footer={footer}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
