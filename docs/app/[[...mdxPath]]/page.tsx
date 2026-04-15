import type { Metadata } from 'next';
import { generateStaticParamsFor, importPage } from 'nextra/pages';
import { useMDXComponents } from 'nextra-theme-docs';
import { SITE_NAME, SITE_URL } from '../../lib/site';

export const generateStaticParams = generateStaticParamsFor('mdxPath');

function pathnameFromMdxSegments(mdxPath?: string[]): string {
  if (!mdxPath?.length) return '/';
  return `/${mdxPath.join('/')}`;
}

function pickTitle(meta: Metadata): string | undefined {
  const { title } = meta;
  if (typeof title === 'string') return title;
  if (title && typeof title === 'object' && 'default' in title && typeof title.default === 'string') {
    return title.default;
  }
  if (title && typeof title === 'object' && 'absolute' in title && typeof title.absolute === 'string') {
    return title.absolute;
  }
  return undefined;
}

export async function generateMetadata(props: {
  params: Promise<{ mdxPath?: string[] }>;
}): Promise<Metadata> {
  const params = await props.params;
  const { metadata } = await importPage(params.mdxPath);
  const pathname = pathnameFromMdxSegments(params.mdxPath);
  const canonical = new URL(pathname, SITE_URL).toString();

  const og = metadata.openGraph && typeof metadata.openGraph === 'object' ? metadata.openGraph : {};
  const tw = metadata.twitter && typeof metadata.twitter === 'object' ? metadata.twitter : {};
  const alts =
    metadata.alternates && typeof metadata.alternates === 'object' ? metadata.alternates : {};

  const title = pickTitle(metadata);
  const description =
    typeof metadata.description === 'string' ? metadata.description : undefined;

  return {
    ...metadata,
    alternates: {
      ...alts,
      canonical,
    },
    openGraph: {
      ...og,
      url: canonical,
      siteName: SITE_NAME,
      locale: typeof og.locale === 'string' ? og.locale : 'en_US',
      type: 'website',
      title: title ?? og.title,
      description: description ?? og.description,
    },
    twitter: {
      card: 'summary_large_image',
      ...tw,
      title: title ?? tw.title,
      description: description ?? tw.description,
    },
  };
}

// Nextra theme exposes wrapper via this call at module scope (not a runtime hook).
// eslint-disable-next-line react-hooks/rules-of-hooks -- Nextra pattern
const Wrapper = useMDXComponents({}).wrapper;

export default async function Page(props: {
  params: Promise<{ mdxPath?: string[] }>;
}) {
  const params = await props.params;
  const result = await importPage(params.mdxPath);
  const { default: MDXContent, toc, metadata, sourceCode } = result;

  return (
    <Wrapper toc={toc} metadata={metadata} sourceCode={sourceCode}>
      <MDXContent {...props} params={params} />
    </Wrapper>
  );
}
