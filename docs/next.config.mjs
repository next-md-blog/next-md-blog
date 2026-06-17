import nextra from 'nextra';

const withNextra = nextra({
  defaultShowCopyCode: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    resolveAlias: {
      'next-mdx-import-source-file': './mdx-components.tsx',
    },
  },
  // Consolidate all ranking signal onto the single canonical host
  // (https://www.next-md-blog.com). Search Console showed the bare apex host
  // indexed as duplicate content competing with www. Vercel's domain
  // "redirect to www" toggle should also be enabled; this is a portable backup.
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'next-md-blog.com' }],
        destination: 'https://www.next-md-blog.com/:path*',
        permanent: true,
      },
    ];
  },
};

export default withNextra(nextConfig);
