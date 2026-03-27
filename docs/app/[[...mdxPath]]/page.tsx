import { generateStaticParamsFor, importPage } from 'nextra/pages';
import { useMDXComponents } from 'nextra-theme-docs';

export const generateStaticParams = generateStaticParamsFor('mdxPath');

export async function generateMetadata(props: {
  params: Promise<{ mdxPath?: string[] }>;
}) {
  const params = await props.params;
  const { metadata } = await importPage(params.mdxPath);
  return metadata;
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
