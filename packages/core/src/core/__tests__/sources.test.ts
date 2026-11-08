/**
 * Tests for pluggable content sources: fsSource, githubSource (fetch mocked),
 * markdown URL rewriting, and collections backed by a remote source.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  defineCollection,
  defineSite,
  fsSource,
  githubSource,
  ContentSourceError,
  GitHubRateLimitError,
  type ContentSource,
} from '../../index.js';
import {
  rewriteMarkdownUrls,
  firstHeading,
  titleFromPath,
} from '../sources/rewrite.js';

const site = defineSite({
  siteName: 'Synthaea',
  siteUrl: 'https://example.com',
});

const TREE_URL =
  'https://api.github.com/repos/acme/agent/git/trees/HEAD?recursive=1';
const RAW = 'https://raw.githubusercontent.com/acme/agent/HEAD';

interface MockRepo {
  files: Record<string, string>;
  /** Override responses by URL. */
  responses?: Record<string, () => Response>;
}

function mockFetch(repo: MockRepo) {
  return vi.fn(async (input: RequestInfo | URL, _init?: RequestInit) => {
    const url = String(input);
    const override = repo.responses?.[url];
    if (override) return override();
    if (url.startsWith('https://api.github.com/repos/acme/agent/git/trees/')) {
      return new Response(
        JSON.stringify({
          sha: 'abc',
          truncated: false,
          tree: [
            ...Object.keys(repo.files).map((p) => ({ path: p, type: 'blob' })),
            { path: 'docs', type: 'tree' },
          ],
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      );
    }
    if (url.startsWith(`${RAW}/`)) {
      const p = decodeURIComponent(url.slice(RAW.length + 1));
      const body = repo.files[p];
      return body === undefined
        ? new Response('404: Not Found', { status: 404 })
        : new Response(body, { status: 200 });
    }
    return new Response('not found', { status: 404 });
  });
}

const REPO: MockRepo = {
  files: {
    'README.md': '# Agent\n',
    'docs/index.md': '# Overview\n\nSee [install](./guides/install.md#linux) and ![arch](img/arch.png).\n',
    'docs/guides/install.md':
      '---\ntitle: Installing the agent\ndescription: How to install.\n---\n\n# Install\n\nBack to [overview](../index.md), [repo readme](../../README.md), [config](../config.yaml).\n',
    'docs/no-heading.md': 'Just text.\n',
    'docs/img/arch.png': 'PNG',
    'docs/config.yaml': 'a: 1',
    'docs/fr/index.md': '# Aperçu\n',
  },
};

describe('rewriteMarkdownUrls', () => {
  const tag = (url: string, kind: string) => `${kind}:${url}`;

  it('rewrites inline links, images and nested badge links', () => {
    expect(rewriteMarkdownUrls('[a](x.md) ![b](y.png "t")', tag)).toBe(
      '[a](link:x.md) ![b](image:y.png "t")',
    );
    expect(rewriteMarkdownUrls('[![badge](b.svg)](page.md)', tag)).toBe(
      '[![badge](image:b.svg)](link:page.md)',
    );
  });

  it('rewrites reference definitions and raw HTML', () => {
    expect(rewriteMarkdownUrls('[logo]: ./logo.png\n[doc]: <a b.md>', tag)).toBe(
      '[logo]: image:./logo.png\n[doc]: <link:a b.md>',
    );
    expect(
      rewriteMarkdownUrls('<img alt="x" src="a.png"> <a href=\'b.md\'>b</a>', tag),
    ).toBe('<img alt="x" src="image:a.png"> <a href=\'link:b.md\'>b</a>');
  });

  it('leaves fenced code blocks and inline code untouched', () => {
    const md = '```md\n[a](x.md)\n```\n`[b](y.md)` [c](z.md)\n~~~\n![d](e.png)\n~~~';
    expect(rewriteMarkdownUrls(md, tag)).toBe(
      '```md\n[a](x.md)\n```\n`[b](y.md)` [c](link:z.md)\n~~~\n![d](e.png)\n~~~',
    );
  });
});

describe('title helpers', () => {
  it('firstHeading skips code fences and strips inline markdown', () => {
    expect(firstHeading('```\n# not this\n```\n## h2\n# The `real` [title](x)')).toBe(
      'The real title',
    );
    expect(firstHeading('no heading')).toBeNull();
  });
  it('titleFromPath humanizes file names and README/index', () => {
    expect(titleFromPath('guides/getting-started.md')).toBe('Getting started');
    expect(titleFromPath('guides/README.md')).toBe('Guides');
    expect(titleFromPath('index.mdx')).toBe('Index');
  });
});

describe('fsSource', () => {
  let tmp: string;
  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'nmb-src-'));
    fs.mkdirSync(path.join(tmp, 'posts/en'), { recursive: true });
    fs.writeFileSync(path.join(tmp, 'posts/en/a.md'), '# A\n');
  });
  afterEach(() => fs.rmSync(tmp, { recursive: true, force: true }));

  it('lists one directory level and reads files relative to root', async () => {
    const src = fsSource({ root: tmp });
    expect(await src.list('posts')).toEqual(['en']);
    expect(await src.list('posts/en')).toEqual(['a.md']);
    expect(await src.read('posts/en/a.md')).toBe('# A\n');
    expect(await src.read('posts/en/missing.md')).toBeNull();
    expect(await src.list('missing')).toEqual([]);
  });

  it('is the default source of a collection (no title inference)', async () => {
    fs.writeFileSync(path.join(tmp, 'posts/en/b.md'), 'No frontmatter\n');
    const blog = defineCollection({
      id: 'blog',
      contentDir: path.join(tmp, 'posts'),
      pathSegment: 'blog',
      site,
    });
    expect(blog.config.source.name).toBe('fs');
    const all = await blog.getAll({ locale: 'en' });
    expect(all.map((d) => d.slug).sort()).toEqual(['a', 'b']);
    expect(all.every((d) => d.frontmatter.title === undefined)).toBe(true);
  });

  it('defineCollection requires contentDir without a source', () => {
    expect(() =>
      defineCollection({ id: 'x', pathSegment: 'x', site } as any),
    ).toThrow(/contentDir/);
  });
});

describe('githubSource', () => {
  const ORIGINAL_TOKEN = process.env.GITHUB_TOKEN;
  beforeEach(() => {
    delete process.env.GITHUB_TOKEN;
  });
  afterEach(() => {
    if (ORIGINAL_TOKEN === undefined) delete process.env.GITHUB_TOKEN;
    else process.env.GITHUB_TOKEN = ORIGINAL_TOKEN;
    vi.restoreAllMocks();
  });

  it('lists markdown recursively under `path` with one tree request', async () => {
    const fetch = mockFetch(REPO);
    const src = githubSource({ owner: 'acme', repo: 'agent', fetch });
    expect(await src.list('')).toEqual([
      'config.yaml',
      'fr/index.md',
      'guides/install.md',
      'img/arch.png',
      'index.md',
      'no-heading.md',
    ]);
    expect(await src.list('guides')).toEqual(['install.md']);
    expect(await src.list('nope')).toEqual([]);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(String(fetch.mock.calls[0]![0])).toBe(TREE_URL);
  });

  it('recursive: false keeps only direct children', async () => {
    const src = githubSource({
      owner: 'acme',
      repo: 'agent',
      recursive: false,
      fetch: mockFetch(REPO),
    });
    expect(src.nested).toBe(false);
    expect(await src.list('')).toEqual([
      'config.yaml',
      'index.md',
      'no-heading.md',
    ]);
  });

  it('reads raw content, returns null for missing files without fetching them', async () => {
    const fetch = mockFetch(REPO);
    const src = githubSource({ owner: 'acme', repo: 'agent', ref: 'v1.2.0', fetch });
    // ref is used for both the tree and raw URLs
    fetch.mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/git/trees/v1.2.0?recursive=1')) {
        return new Response(
          JSON.stringify({ tree: [{ path: 'docs/index.md', type: 'blob' }] }),
        );
      }
      if (url === 'https://raw.githubusercontent.com/acme/agent/v1.2.0/docs/index.md') {
        return new Response('# Hi');
      }
      return new Response('', { status: 500 });
    });
    expect(await src.read('index.md')).toBe('# Hi');
    expect(await src.read('missing.md')).toBeNull();
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('maps a raw 404 (file deleted after listing) to null', async () => {
    const fetch = mockFetch({
      ...REPO,
      responses: {
        [`${RAW}/docs/index.md`]: () => new Response('gone', { status: 404 }),
      },
    });
    const src = githubSource({ owner: 'acme', repo: 'agent', fetch });
    expect(await src.read('index.md')).toBeNull();
  });

  it('caches the tree and file bodies across calls', async () => {
    const fetch = mockFetch(REPO);
    const src = githubSource({ owner: 'acme', repo: 'agent', fetch });
    await src.read('index.md');
    await src.read('index.md');
    await src.list('');
    expect(fetch).toHaveBeenCalledTimes(2); // tree + one raw read
  });

  it('expires the in-memory cache after `revalidate` seconds and forwards Next cache options', async () => {
    vi.useFakeTimers();
    try {
      const fetch = mockFetch(REPO);
      const src = githubSource({ owner: 'acme', repo: 'agent', revalidate: 60, fetch });
      await src.list('');
      vi.advanceTimersByTime(30_000);
      await src.list('');
      expect(fetch).toHaveBeenCalledTimes(1);
      vi.advanceTimersByTime(31_000);
      await src.list('');
      expect(fetch).toHaveBeenCalledTimes(2);
      const init = fetch.mock.calls[0]![1] as RequestInit & { next?: unknown };
      expect(init.next).toEqual({
        revalidate: 60,
        tags: ['next-md-blog:github:acme/agent'],
      });
    } finally {
      vi.useRealTimers();
    }
  });

  it('does not cache failures', async () => {
    let calls = 0;
    const fetch = vi.fn(async () => {
      calls++;
      if (calls === 1) return new Response('boom', { status: 502 });
      return new Response(JSON.stringify({ tree: [] }));
    });
    const src = githubSource({ owner: 'acme', repo: 'agent', fetch });
    await expect(src.list('')).rejects.toBeInstanceOf(ContentSourceError);
    await expect(src.list('')).resolves.toEqual([]);
  });

  it('sends the token from options or GITHUB_TOKEN, never in error messages', async () => {
    const fetch = mockFetch(REPO);
    await githubSource({ owner: 'acme', repo: 'agent', token: 'opt-secret', fetch }).list('');
    let headers = (fetch.mock.calls[0]![1] as RequestInit).headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer opt-secret');

    process.env.GITHUB_TOKEN = 'env-secret';
    const fetch2 = vi.fn(async () => new Response('', { status: 401 }));
    const err = await githubSource({ owner: 'acme', repo: 'agent', fetch: fetch2 })
      .list('')
      .catch((e: unknown) => e as ContentSourceError);
    headers = (fetch2.mock.calls[0]![1] as RequestInit).headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer env-secret');
    expect(err).toBeInstanceOf(ContentSourceError);
    expect(err.status).toBe(401);
    expect(err.message).toMatch(/bad credentials/);
    expect(err.message).not.toContain('env-secret');
  });

  it('omits Authorization without a token', async () => {
    const fetch = mockFetch(REPO);
    await githubSource({ owner: 'acme', repo: 'agent', fetch }).list('');
    const headers = (fetch.mock.calls[0]![1] as RequestInit).headers as Record<string, string>;
    expect(headers.Authorization).toBeUndefined();
  });

  it('throws a typed GitHubRateLimitError on 403 + x-ratelimit-remaining: 0', async () => {
    const reset = Math.floor(Date.UTC(2030, 0, 1) / 1000);
    const fetch = vi.fn(
      async () =>
        new Response('{"message":"API rate limit exceeded"}', {
          status: 403,
          headers: {
            'x-ratelimit-remaining': '0',
            'x-ratelimit-limit': '60',
            'x-ratelimit-reset': String(reset),
          },
        }),
    );
    const err = await githubSource({ owner: 'acme', repo: 'agent', fetch })
      .list('')
      .catch((e: unknown) => e as GitHubRateLimitError);
    expect(err).toBeInstanceOf(GitHubRateLimitError);
    expect(err.code).toBe('GITHUB_RATE_LIMIT');
    expect(err.limit).toBe(60);
    expect(err.resetAt?.toISOString()).toBe('2030-01-01T00:00:00.000Z');
    expect(err.message).toMatch(/GITHUB_TOKEN/);
  });

  it('throws GitHubRateLimitError on 429 from raw reads', async () => {
    const fetch = mockFetch({
      ...REPO,
      responses: {
        [`${RAW}/docs/index.md`]: () =>
          new Response('', { status: 429, headers: { 'retry-after': '30' } }),
      },
    });
    const src = githubSource({ owner: 'acme', repo: 'agent', fetch });
    await expect(src.read('index.md')).rejects.toBeInstanceOf(GitHubRateLimitError);
  });

  it('reports a missing repository / ref clearly', async () => {
    const fetch = vi.fn(async () => new Response('', { status: 404 }));
    await expect(
      githubSource({ owner: 'acme', repo: 'agent', fetch }).list(''),
    ).rejects.toThrow(/repository or ref "HEAD" not found/);
  });

  it('a plain 403 without rate-limit headers is an access error, not a rate limit', async () => {
    const fetch = vi.fn(async () => new Response('', { status: 403 }));
    const err = await githubSource({ owner: 'acme', repo: 'agent', fetch })
      .list('')
      .catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ContentSourceError);
    expect(err).not.toBeInstanceOf(GitHubRateLimitError);
  });
});

describe('collection backed by githubSource', () => {
  function docsCollection(
    opts: Partial<Parameters<typeof githubSource>[0]> = {},
    fetch = mockFetch(REPO),
  ) {
    return {
      fetch,
      docs: defineCollection({
        id: 'agent-docs',
        pathSegment: 'docs/agent',
        site,
        rss: false,
        source: githubSource({ owner: 'acme', repo: 'agent', fetch, ...opts }),
      }),
    };
  }

  it('getAll lists nested docs with inferred titles (frontmatter optional)', async () => {
    const { docs } = docsCollection({ recursive: true });
    const all = await docs.getAll();
    const bySlug = Object.fromEntries(all.map((d) => [d.slug, d.frontmatter.title]));
    expect(bySlug).toEqual({
      'fr/index': 'Aperçu',
      'guides/install': 'Installing the agent',
      index: 'Overview',
      'no-heading': 'No heading',
    });
  });

  it('getOne accepts nested slugs and rewrites links / images', async () => {
    const { docs } = docsCollection();
    const install = await docs.getOne('guides/install');
    expect(install?.frontmatter.title).toBe('Installing the agent');
    expect(install?.content).toContain('[overview](https://example.com/docs/agent/index)');
    expect(install?.content).toContain(
      '[repo readme](https://github.com/acme/agent/blob/HEAD/README.md)',
    );
    expect(install?.content).toContain(
      '[config](https://github.com/acme/agent/blob/HEAD/docs/config.yaml)',
    );

    const index = await docs.getOne('index');
    expect(index?.content).toContain(
      '[install](https://example.com/docs/agent/guides/install#linux)',
    );
    expect(index?.content).toContain(
      '![arch](https://raw.githubusercontent.com/acme/agent/HEAD/docs/img/arch.png)',
    );
    expect(docs.url('guides/install')).toBe('https://example.com/docs/agent/guides/install');
  });

  it('links: "github" sends markdown links to blob URLs', async () => {
    const { docs } = docsCollection({ links: 'github' });
    const index = await docs.getOne('index');
    expect(index?.content).toContain(
      '[install](https://github.com/acme/agent/blob/HEAD/docs/guides/install.md#linux)',
    );
  });

  it('rewriteUrls: false keeps content verbatim', async () => {
    const { docs } = docsCollection({ rewriteUrls: false });
    const index = await docs.getOne('index');
    expect(index?.content).toContain('[install](./guides/install.md#linux)');
  });

  it('still rejects traversal in nested slugs', async () => {
    const { docs } = docsCollection();
    await expect(docs.getOne('../secrets')).rejects.toThrow(/traversal/);
    await expect(docs.getOne('guides//install')).rejects.toThrow(/traversal/);
  });

  it('locale reads from `${contentDir}/${locale}` and links stay in-locale', async () => {
    const fetch = mockFetch({
      files: {
        'docs/en/index.md': '# Home\n\n[setup](setup.md)\n',
        'docs/en/setup.md': '# Setup\n',
        'docs/fr/index.md': '# Accueil\n\n[installation](setup.md)\n',
        'docs/fr/setup.md': '# Installation\n',
      },
    });
    const docs = defineCollection({
      id: 'i18n-docs',
      contentDir: '',
      pathSegment: 'docs',
      site,
      source: githubSource({ owner: 'acme', repo: 'agent', fetch }),
    });
    expect((await docs.getAll({ locale: 'fr' })).map((d) => d.slug).sort()).toEqual([
      'index',
      'setup',
    ]);
    const fr = await docs.getOne('index', { locale: 'fr' });
    expect(fr?.frontmatter.title).toBe('Accueil');
    expect(fr?.content).toContain('[installation](https://example.com/fr/docs/setup)');
    const both = await docs.getInAllLocales('setup', ['en', 'fr', 'de']);
    expect(both.get('en')?.frontmatter.title).toBe('Setup');
    expect(both.get('de')).toBeNull();
  });

  it('getAll surfaces rate-limit errors instead of returning a partial list', async () => {
    const fetch = mockFetch({
      ...REPO,
      responses: {
        [`${RAW}/docs/index.md`]: () => new Response('', { status: 429 }),
      },
    });
    const { docs } = docsCollection({}, fetch);
    await expect(docs.getAll()).rejects.toBeInstanceOf(GitHubRateLimitError);
  });

  it('several repositories can back several collections', async () => {
    const make = (repo: string) =>
      defineCollection({
        id: `${repo}-docs`,
        pathSegment: `docs/${repo}`,
        site,
        source: githubSource({
          owner: 'acme',
          repo,
          fetch: vi.fn(async (input: RequestInfo | URL) => {
            const url = String(input);
            if (url.includes('/git/trees/')) {
              return new Response(
                JSON.stringify({ tree: [{ path: 'docs/index.md', type: 'blob' }] }),
              );
            }
            return new Response(`# ${repo}\n`);
          }),
        }),
      });
    const [a, b] = [make('edr-agent'), make('edr-server')];
    expect((await a.getOne('index'))?.frontmatter.title).toBe('edr-agent');
    expect((await b.getOne('index'))?.frontmatter.title).toBe('edr-server');
    expect(a.url('index')).toBe('https://example.com/docs/edr-agent/index');
  });
});

describe('custom ContentSource', () => {
  it('collections work with any object implementing the interface', async () => {
    const files: Record<string, string> = {
      'notes/one.md': '---\ntitle: One\ndate: "2026-01-02"\n---\nBody',
      'notes/two.md': '---\ntitle: Two\ndate: "2026-01-01"\n---\nBody',
    };
    const memory: ContentSource = {
      name: 'memory',
      async list(dir) {
        return Object.keys(files)
          .filter((p) => p.startsWith(`${dir}/`))
          .map((p) => p.slice(dir.length + 1));
      },
      async read(p) {
        return files[p] ?? null;
      },
    };
    const notes = defineCollection({
      id: 'notes',
      contentDir: 'notes',
      pathSegment: 'notes',
      site,
      source: memory,
    });
    expect((await notes.getAll()).map((d) => d.slug)).toEqual(['one', 'two']);
    expect((await notes.getOne('two'))?.content).toBe('Body');
  });
});
