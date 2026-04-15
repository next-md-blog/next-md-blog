import type { ReactNode } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { Footer, Layout, Navbar } from 'nextra-theme-docs';
import { Head } from 'nextra/components';
import { getPageMap } from 'nextra/page-map';
import type { Metadata } from 'next';
import { GITHUB_REPO, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '../lib/site';
import 'nextra-theme-docs/style.css';

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      sameAs: [GITHUB_REPO],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}#website`,
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      inLanguage: 'en',
      publisher: { '@id': `${SITE_URL}#organization` },
    },
  ],
} as const;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: SITE_NAME,
    template: '%s – next-md-blog',
  },
  description: SITE_DESCRIPTION,
  authors: [{ name: 'next-md-blog', url: GITHUB_REPO }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: 'technology',
  keywords: [
    'Next.js',
    'Next.js App Router',
    'blog',
    'markdown',
    'MDX',
    'frontmatter',
    'SEO',
    'JSON-LD',
    'RSS',
    'sitemap',
    'robots.txt',
    'Open Graph',
    'next-md-blog',
    '@next-md-blog/core',
    '@next-md-blog/cli',
  ],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <Layout
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/next-md-blog/next-md-blog/tree/main/docs"
          footer={footer}
        >
          {children}
        </Layout>
        <Analytics />
      </body>
    </html>
  );
}
