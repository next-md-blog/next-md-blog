/**
 * Tests for the 1.2 collection API. Uses real on-disk fixtures (tmpdir).
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  defineCollection,
  defineSite,
  composeSitemap,
  composeLlmsTxt,
  composeLlmsFullTxt,
  generateOrganizationSchema,
  generateWebsiteSchema,
  slugifyAuthor,
  slugifySeries,
  type SiteConfig,
  type Collection,
} from '../../index.js';

const ORIG_CWD = process.cwd();
let tmpRoot: string;

const site: SiteConfig = defineSite({
  siteName: 'Example',
  siteUrl: 'https://example.com',
  defaultAuthor: 'Author',
  authors: [{ name: 'Ada Lovelace', twitter: '@ada' }],
  defaultLang: 'en',
  organization: {
    legalName: 'Example, Inc.',
    founder: 'Ada Lovelace',
    address: { addressCountry: 'FR' },
    contactPoint: { email: 'hi@example.com' },
    sameAs: ['https://twitter.com/example'],
    wikidata: 'https://www.wikidata.org/wiki/Q1',
  },
});

function writePost(
  dir: string,
  slug: string,
  frontmatter: Record<string, unknown>,
  body = 'Body content.',
) {
  fs.mkdirSync(dir, { recursive: true });
  const fm = Object.entries(frontmatter)
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
    .join('\n');
  fs.writeFileSync(
    path.join(dir, `${slug}.md`),
    `---\n${fm}\n---\n\n${body}\n`,
  );
}

beforeAll(() => {
  tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nmb-test-'));
  process.chdir(tmpRoot);

  writePost('content/blog/en', 'hello', {
    title: 'Hello world',
    description: 'A short description.',
    date: '2026-01-01',
    updated: '2026-02-10',
    tags: ['demo'],
    author: 'Ada Lovelace',
    series: 'Getting Started',
    seriesTitle: 'Getting started end to end',
    seriesOrder: 1,
  });
  writePost('content/blog/en', 'second', {
    title: 'Second post',
    description: 'Another post.',
    date: '2026-01-02',
    tags: ['demo', 'other'],
    series: 'Getting Started',
    seriesOrder: 2,
  });
  writePost('content/blog/fr', 'hello', {
    title: 'Bonjour le monde',
    date: '2026-01-01',
  });

  writePost('content/glossary/en', 'seo', {
    title: 'SEO',
    description: 'Search engine optimization.',
    date: '2026-01-01',
  });
  writePost('content/glossary/en', 'hreflang', {
    title: 'hreflang',
    description: 'A signal for international content.',
    date: '2026-01-02',
  });
});

afterAll(() => {
  process.chdir(ORIG_CWD);
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

function makeBlog(): Collection {
  return defineCollection({
    id: 'blog',
    contentDir: 'content/blog',
    pathSegment: 'blog',
    site,
  });
}

function makeGlossary(): Collection {
  return defineCollection({
    id: 'glossary',
    contentDir: 'content/glossary',
    pathSegment: 'glossary',
    label: 'Glossary',
    schemaType: 'DefinedTerm',
    rss: false,
    site,
  });
}

describe('defineCollection — data', () => {
  it('getAll reads markdown from the locale subdir, newest first', async () => {
    const blog = makeBlog();
    const posts = await blog.getAll({ locale: 'en' });
    expect(posts.map((p) => p.slug)).toEqual(['second', 'hello']);
  });

  it('getOne returns null for missing slugs', async () => {
    const blog = makeBlog();
    expect(await blog.getOne('nope', { locale: 'en' })).toBeNull();
  });

  it('getInAllLocales returns sibling posts across locales', async () => {
    const blog = makeBlog();
    const map = await blog.getInAllLocales('hello', ['en', 'fr', 'es']);
    expect(map.get('en')?.frontmatter.title).toBe('Hello world');
    expect(map.get('fr')?.frontmatter.title).toBe('Bonjour le monde');
    expect(map.get('es')).toBeNull();
  });
});

describe('defineCollection — URLs', () => {
  it('url() prefixes the locale segment', () => {
    const blog = makeBlog();
    expect(blog.url('hello', 'en')).toBe(
      'https://example.com/en/blog/hello',
    );
  });

  it('url() honours frontmatter canonicalUrl', () => {
    const blog = makeBlog();
    expect(blog.url('hello', 'en', 'https://x.test/custom')).toBe(
      'https://x.test/custom',
    );
  });

  it('indexUrl() builds the collection landing page', () => {
    const glossary = makeGlossary();
    expect(glossary.indexUrl('fr')).toBe(
      'https://example.com/fr/glossary',
    );
  });

  it('hreflangMap returns only locales with a translation', async () => {
    const blog = makeBlog();
    const map = await blog.hreflangMap('hello', ['en', 'fr', 'de']);
    expect(map).toEqual({
      en: 'https://example.com/en/blog/hello',
      fr: 'https://example.com/fr/blog/hello',
    });
  });
});

describe('defineCollection — metadata', () => {
  it('default titleTemplate = site-suffix', async () => {
    const blog = makeBlog();
    const doc = (await blog.getOne('hello', { locale: 'en' }))!;
    const md = await blog.metadata(doc, { locale: 'en' });
    expect(md.title).toBe('Hello world | Example');
  });

  it('titleTemplate=absolute bypasses layout templates', async () => {
    const blog = makeBlog();
    const doc = (await blog.getOne('hello', { locale: 'en' }))!;
    const md = await blog.metadata(doc, {
      locale: 'en',
      titleTemplate: 'absolute',
    });
    expect(md.title).toEqual({ absolute: 'Hello world | Example' });
  });

  it('locale flows into canonical + openGraph', async () => {
    const blog = makeBlog();
    const doc = (await blog.getOne('hello', { locale: 'fr' }))!;
    const md = await blog.metadata(doc, { locale: 'fr' });
    expect(md.alternates?.canonical).toBe(
      'https://example.com/fr/blog/hello',
    );
    expect(md.openGraph?.url).toBe(
      'https://example.com/fr/blog/hello',
    );
    expect(md.openGraph?.locale).toBe('fr');
  });

  it('alternateLanguages override flows through', async () => {
    const blog = makeBlog();
    const doc = (await blog.getOne('hello', { locale: 'en' }))!;
    const md = await blog.metadata(doc, {
      locale: 'en',
      alternateLanguages: {
        en: 'https://example.com/en/blog/hello',
        fr: 'https://example.com/fr/blog/hello',
      },
    });
    expect(md.alternates?.languages).toEqual({
      en: 'https://example.com/en/blog/hello',
      fr: 'https://example.com/fr/blog/hello',
    });
  });
});

describe('defineCollection — schema', () => {
  it('default schema for blog is BlogPosting with locale-aware URL', async () => {
    const blog = makeBlog();
    const doc = (await blog.getOne('hello', { locale: 'en' }))!;
    const s = blog.schema(doc, { locale: 'en' });
    expect(s['@type']).toBe('BlogPosting');
    expect(s.url).toBe('https://example.com/en/blog/hello');
    expect(s.inLanguage).toBe('en');
    expect(s.dateModified).toBe('2026-02-10');
    expect(s.isPartOf).toMatchObject({
      '@type': 'CollectionPage',
      '@id': 'https://example.com/en/topics/getting-started',
    });
  });

  it('DefinedTerm schema for glossary references inDefinedTermSet', async () => {
    const glossary = makeGlossary();
    const doc = (await glossary.getOne('seo', { locale: 'en' }))!;
    const s = glossary.schema(doc, { locale: 'en' });
    expect(s['@type']).toBe('DefinedTerm');
    expect(s.url).toBe('https://example.com/en/glossary/seo');
    expect(s.termCode).toBe('seo');
    expect(s.inDefinedTermSet).toMatchObject({
      '@type': 'DefinedTermSet',
      '@id': 'https://example.com/en/glossary',
    });
  });

  it('custom schemaBuilder fully overrides default', async () => {
    const custom = defineCollection({
      id: 'custom',
      contentDir: 'content/blog',
      pathSegment: 'blog',
      site,
      schemaBuilder: (doc, ctx) => ({
        '@context': 'https://schema.org',
        '@type': 'CustomType',
        name: doc.slug,
        x: ctx.url,
      }),
    });
    const doc = (await custom.getOne('hello', { locale: 'en' }))!;
    const s = custom.schema(doc, { locale: 'en' });
    expect(s).toMatchObject({
      '@type': 'CustomType',
      name: 'hello',
      x: 'https://example.com/en/blog/hello',
    });
  });

  it('speakable default + extend hook', async () => {
    const blog = defineCollection({
      id: 'blog',
      contentDir: 'content/blog',
      pathSegment: 'blog',
      site,
      defaults: { speakable: true },
    });
    const doc = (await blog.getOne('hello', { locale: 'en' }))!;
    const s = blog.schema(doc, {
      locale: 'en',
      extend: (n) => ({ ...n, customField: 1 }),
    });
    expect(s.speakable).toMatchObject({ '@type': 'SpeakableSpecification' });
    expect(s.customField).toBe(1);
  });

  it('schemaGraph wraps Organization + content + Breadcrumb', async () => {
    const blog = makeBlog();
    const doc = (await blog.getOne('hello', { locale: 'en' }))!;
    const graph = blog.schemaGraph(doc, undefined, { locale: 'en' }) as {
      '@graph': Array<Record<string, unknown>>;
    };
    expect(graph['@graph'].map((n) => n['@type'])).toEqual([
      'Organization',
      'BlogPosting',
      'BreadcrumbList',
    ]);
  });
});

describe('defineCollection — queries', () => {
  it('getByAuthor filters via slugified author names', async () => {
    const blog = makeBlog();
    const posts = await blog.getByAuthor(slugifyAuthor('Ada Lovelace'), {
      locale: 'en',
    });
    expect(posts.map((p) => p.slug)).toEqual(['hello']);
  });

  it('getBySeries returns posts ordered by seriesOrder', async () => {
    const blog = makeBlog();
    const posts = await blog.getBySeries(slugifySeries('Getting Started'), {
      locale: 'en',
    });
    expect(posts.map((p) => p.slug)).toEqual(['hello', 'second']);
  });

  it('getAllAuthorSlugs enumerates config + frontmatter authors', async () => {
    const blog = makeBlog();
    const slugs = await blog.getAllAuthorSlugs(['en']);
    expect(slugs).toContain('ada-lovelace');
  });

  it('getAllSeriesSlugs enumerates frontmatter series', async () => {
    const blog = makeBlog();
    const slugs = await blog.getAllSeriesSlugs(['en']);
    expect(slugs).toEqual(['getting-started']);
  });
});

describe('defineCollection — output', () => {
  it('sitemapEntries emits hreflang alternates', async () => {
    const blog = makeBlog();
    const entries = await blog.sitemapEntries({ locales: ['en', 'fr'] });
    const hello = entries.find((e) => e.url.includes('/hello'))!;
    expect(hello.alternates?.languages).toMatchObject({
      en: 'https://example.com/en/blog/hello',
      fr: 'https://example.com/fr/blog/hello',
      'x-default': 'https://example.com/en/blog/hello',
    });
  });

  it('rssXml respects RSS title + locale; rssResponse sets cache headers', async () => {
    const blog = defineCollection({
      id: 'blog',
      contentDir: 'content/blog',
      pathSegment: 'blog',
      site,
      rss: { title: 'Custom Title' },
    });
    const xml = await blog.rssXml({ locale: 'en' });
    expect(xml).toContain('<title>Custom Title</title>');
    expect(xml).toContain('<language>en</language>');
    const res = await blog.rssResponse({ locale: 'en' });
    expect(res.headers.get('cache-control')).toMatch(/public/);
  });

  it('rssXml throws when rss is disabled', async () => {
    const glossary = makeGlossary();
    await expect(glossary.rssXml({ locale: 'en' })).rejects.toThrow(/disabled/);
  });

  it('llmsTxtSection lists posts per locale', async () => {
    const blog = makeBlog();
    const section = await blog.llmsTxtSection({
      locales: ['en'],
      defaultLocale: 'en',
    });
    expect(section).toContain('## Blog (en) — default locale');
    expect(section).toContain(
      '[Hello world](https://example.com/en/blog/hello)',
    );
  });
});

describe('compose helpers', () => {
  it('composeSitemap merges static + every collection', async () => {
    const blog = makeBlog();
    const glossary = makeGlossary();
    const entries = await composeSitemap({
      collections: [blog, glossary],
      locales: ['en'],
      staticEntries: [{ url: 'https://example.com/en', lastModified: new Date() }],
    });
    const urls = entries.map((e) => e.url);
    expect(urls).toContain('https://example.com/en');
    expect(urls).toContain('https://example.com/en/blog/hello');
    expect(urls).toContain('https://example.com/en/glossary/seo');
  });

  it('composeLlmsTxt assembles per-collection sections', async () => {
    const blog = makeBlog();
    const glossary = makeGlossary();
    const text = await composeLlmsTxt({
      site,
      collections: [blog, glossary],
      locales: ['en'],
      defaultLocale: 'en',
    });
    expect(text).toContain('# Example');
    expect(text).toContain('## Blog (en) — default locale');
    expect(text).toContain('## Glossary (en) — default locale');
    expect(text).toContain('Blog RSS — en'); // glossary rss disabled, only blog feed listed
    expect(text).not.toContain('Glossary RSS');
  });

  it('composeLlmsFullTxt embeds post bodies', async () => {
    const blog = makeBlog();
    const text = await composeLlmsFullTxt({
      site,
      collections: [blog],
      locales: ['en'],
    });
    expect(text).toContain('Body content.');
    expect(text).toContain('Source: https://example.com/en/blog/hello');
  });
});

describe('site-level schemas', () => {
  it('generateOrganizationSchema emits founder + address + wikidata', () => {
    const node = generateOrganizationSchema(site)!;
    expect(node.founder).toEqual({ '@type': 'Person', name: 'Ada Lovelace' });
    expect(node.address).toMatchObject({ '@type': 'PostalAddress', addressCountry: 'FR' });
    expect(node.sameAs).toEqual([
      'https://twitter.com/example',
      'https://www.wikidata.org/wiki/Q1',
    ]);
  });

  it('generateWebsiteSchema with searchPath emits SearchAction', () => {
    const w = generateWebsiteSchema(site, { locale: 'en', searchPath: '/search' });
    expect(w['@type']).toBe('WebSite');
    expect(w.url).toBe('https://example.com/en');
    expect(w.inLanguage).toBe('en');
    expect(w.potentialAction).toMatchObject({ '@type': 'SearchAction' });
  });
});
