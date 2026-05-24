import { describe, it, expect } from 'vitest';
import {
  resolvePostUrl,
  resolvePostUrlWithConfig,
} from '../seo-utils.js';
import { generateBlogPostMetadata } from '../seo-metadata.js';
import {
  generateBlogPostSchema,
  generateBlogPostSchemaGraph,
} from '../seo-schema.js';
import { generateOrganizationSchema } from '../organization-schema.js';
import type { BlogPost, Config } from '../types.js';

const SITE_URL = 'https://example.com';

const baseConfig: Config = {
  siteName: 'Example',
  siteUrl: SITE_URL,
  defaultAuthor: 'Author',
  defaultLang: 'en',
  blogPostPathSegment: 'blog',
};

function makePost(overrides: Partial<BlogPost> = {}): BlogPost {
  return {
    slug: 'hello-world',
    content: 'Body content for the post.',
    frontmatter: {
      title: 'Hello world',
      description: 'A short description.',
      date: '2026-01-01',
      tags: ['demo'],
      ...overrides.frontmatter,
    },
    readingTime: 1,
    wordCount: 5,
    authors: [],
    ...overrides,
  };
}

describe('locale-aware URL helpers', () => {
  it('resolvePostUrl prepends locale when provided', () => {
    expect(
      resolvePostUrl(undefined, 'hello', SITE_URL, 'blog', 'fr')
    ).toBe('https://example.com/fr/blog/hello');
  });

  it('resolvePostUrl omits locale when undefined (backwards compat)', () => {
    expect(resolvePostUrl(undefined, 'hello', SITE_URL, 'blog')).toBe(
      'https://example.com/blog/hello'
    );
  });

  it('resolvePostUrl prefers canonicalUrl when present', () => {
    expect(
      resolvePostUrl('https://x.test/custom', 'hello', SITE_URL, 'blog', 'fr')
    ).toBe('https://x.test/custom');
  });

  it('resolvePostUrlWithConfig threads locale through config', () => {
    expect(
      resolvePostUrlWithConfig(undefined, 'hello', SITE_URL, baseConfig, 'de')
    ).toBe('https://example.com/de/blog/hello');
  });
});

describe('generateBlogPostMetadata options', () => {
  it('default title: site-suffix (1.0 behaviour preserved)', () => {
    const md = generateBlogPostMetadata(makePost(), baseConfig);
    expect(md.title).toBe('Hello world | Example');
  });

  it('titleTemplate=absolute returns { absolute } to bypass layout templates', () => {
    const md = generateBlogPostMetadata(makePost(), baseConfig, {
      titleTemplate: 'absolute',
    });
    expect(md.title).toEqual({ absolute: 'Hello world | Example' });
  });

  it('titleTemplate=bare returns just the post title', () => {
    const md = generateBlogPostMetadata(makePost(), baseConfig, {
      titleTemplate: 'bare',
    });
    expect(md.title).toBe('Hello world');
  });

  it('titleTemplate=function lets the caller fully control the format', () => {
    const md = generateBlogPostMetadata(makePost(), baseConfig, {
      titleTemplate: ({ title }) => `${title} — custom`,
    });
    expect(md.title).toBe('Hello world — custom');
  });

  it('locale flows into canonical, openGraph.url, and openGraph.locale', () => {
    const md = generateBlogPostMetadata(makePost(), baseConfig, {
      locale: 'fr',
    });
    expect(md.alternates?.canonical).toBe(
      'https://example.com/fr/blog/hello-world'
    );
    expect(md.openGraph?.url).toBe(
      'https://example.com/fr/blog/hello-world'
    );
    expect(md.openGraph?.locale).toBe('fr');
  });

  it('alternateLanguages option overrides config/frontmatter', () => {
    const md = generateBlogPostMetadata(makePost(), baseConfig, {
      locale: 'fr',
      alternateLanguages: {
        en: 'https://example.com/en/blog/hello-world',
        fr: 'https://example.com/fr/blog/hello-world',
      },
    });
    expect(md.alternates?.languages).toEqual({
      en: 'https://example.com/en/blog/hello-world',
      fr: 'https://example.com/fr/blog/hello-world',
    });
  });

  it('urlBuilder option fully overrides URL resolution', () => {
    const md = generateBlogPostMetadata(makePost(), baseConfig, {
      urlBuilder: ({ slug, locale }) =>
        `https://custom.test/${locale}/posts/${slug}`,
      locale: 'es',
    });
    expect(md.alternates?.canonical).toBe(
      'https://custom.test/es/posts/hello-world'
    );
  });
});

describe('generateBlogPostSchema options', () => {
  it('passes locale through to URL + inLanguage', () => {
    const schema = generateBlogPostSchema(makePost(), baseConfig, {
      locale: 'fr',
    });
    expect(schema.url).toBe('https://example.com/fr/blog/hello-world');
    expect(schema.inLanguage).toBe('fr');
  });

  it('uses `updated` frontmatter as dateModified', () => {
    const schema = generateBlogPostSchema(
      makePost({ frontmatter: { title: 'Hello world', date: '2026-01-01', updated: '2026-02-10' } }),
      baseConfig
    );
    expect(schema.dateModified).toBe('2026-02-10');
  });

  it('speakable=true emits default selectors', () => {
    const schema = generateBlogPostSchema(makePost(), baseConfig, {
      speakable: true,
    });
    expect(schema.speakable).toEqual({
      '@type': 'SpeakableSpecification',
      cssSelector: ['article > header h1', 'article > header p'],
    });
  });

  it('speakable=object passes through xpath/cssSelector', () => {
    const schema = generateBlogPostSchema(makePost(), baseConfig, {
      speakable: { xpath: ['//h1'] },
    });
    expect(schema.speakable).toEqual({
      '@type': 'SpeakableSpecification',
      xpath: ['//h1'],
    });
  });

  it('series + locale produce isPartOf with the pillar CollectionPage', () => {
    const schema = generateBlogPostSchema(
      makePost({
        frontmatter: {
          title: 'Hello world',
          series: 'Getting Started',
          seriesTitle: 'Getting started, end to end',
        },
      }),
      baseConfig,
      { locale: 'fr' }
    );
    expect(schema.isPartOf).toEqual({
      '@type': 'CollectionPage',
      '@id': 'https://example.com/fr/topics/getting-started',
      name: 'Getting started, end to end',
    });
  });

  it('E-E-A-T fields appear when present', () => {
    const schema = generateBlogPostSchema(
      makePost({
        frontmatter: {
          title: 'Hello world',
          reviewedBy: 'Reviewer Name',
          factCheckedBy: 'Checker Name',
          lastReviewed: '2026-03-01',
        },
      }),
      baseConfig
    );
    expect(schema.reviewedBy).toEqual({ '@type': 'Person', name: 'Reviewer Name' });
    expect(schema.factCheckedBy).toEqual({ '@type': 'Person', name: 'Checker Name' });
    expect(schema.lastReviewed).toBe('2026-03-01');
  });

  it('extendArticle hook runs last and can mutate freely', () => {
    const schema = generateBlogPostSchema(makePost(), baseConfig, {
      extendArticle: (node) => ({ ...node, customField: 42 }),
    });
    expect(schema.customField).toBe(42);
  });
});

describe('generateBlogPostSchemaGraph options', () => {
  it('threads locale into both article and breadcrumbs', () => {
    const graph = generateBlogPostSchemaGraph(
      makePost(),
      baseConfig,
      undefined,
      true,
      { locale: 'es' }
    ) as { '@graph': Array<Record<string, unknown>> };
    const article = graph['@graph'].find((n) => n['@type'] === 'BlogPosting')!;
    const crumbs = graph['@graph'].find(
      (n) => n['@type'] === 'BreadcrumbList'
    ) as { itemListElement: Array<{ item: string }> };
    expect(article.url).toBe('https://example.com/es/blog/hello-world');
    expect(crumbs.itemListElement.slice(-1)[0]!.item).toBe(
      'https://example.com/es/blog/hello-world'
    );
  });
});

describe('Organization schema enrichment', () => {
  it('renders founder / foundingDate / address / contactPoint / wikidata', () => {
    const node = generateOrganizationSchema({
      siteName: 'Example',
      siteUrl: SITE_URL,
      organization: {
        legalName: 'Example, Inc.',
        founder: 'Ada Lovelace',
        foundingDate: '2020-01-01',
        address: {
          streetAddress: '1 Example St',
          addressLocality: 'Paris',
          addressCountry: 'FR',
        },
        contactPoint: {
          email: 'hello@example.com',
          contactType: 'customer support',
        },
        sameAs: ['https://twitter.com/example'],
        wikidata: 'https://www.wikidata.org/wiki/Q1',
      },
    })!;
    expect(node.founder).toEqual({ '@type': 'Person', name: 'Ada Lovelace' });
    expect(node.foundingDate).toBe('2020-01-01');
    expect(node.address).toMatchObject({
      '@type': 'PostalAddress',
      streetAddress: '1 Example St',
      addressLocality: 'Paris',
      addressCountry: 'FR',
    });
    expect(node.contactPoint).toMatchObject({
      '@type': 'ContactPoint',
      email: 'hello@example.com',
      contactType: 'customer support',
    });
    expect(node.sameAs).toEqual([
      'https://twitter.com/example',
      'https://www.wikidata.org/wiki/Q1',
    ]);
  });

  it('omits empty address / contactPoint blocks', () => {
    const node = generateOrganizationSchema({
      siteName: 'Example',
      siteUrl: SITE_URL,
      organization: {
        address: {},
        contactPoint: {},
      },
    })!;
    expect(node.address).toBeUndefined();
    expect(node.contactPoint).toBeUndefined();
  });
});
