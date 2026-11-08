import { ContentSourceError, GitHubRateLimitError } from '../errors.js';
import { MARKDOWN_FILE_REGEX } from '../constants.js';
import { isRelativeUrl, rewriteMarkdownUrls, type UrlKind } from './rewrite.js';
import { joinSourcePath, type ContentSource } from './types.js';

export interface GitHubSourceOptions {
  /** Repository owner (user or organization). */
  owner: string;
  /** Repository name. */
  repo: string;
  /** Branch, tag or commit SHA. Default: `HEAD` (the default branch). */
  ref?: string;
  /** Directory inside the repository that acts as the source root. Default: `docs`. Use `''` for the repo root. */
  path?: string;
  /**
   * Token for private repositories and the higher authenticated rate limit
   * (5,000 req/h instead of 60). Defaults to `process.env.GITHUB_TOKEN`.
   * Sent only as an `Authorization` header; never logged or included in errors.
   */
  token?: string;
  /**
   * Seconds before cached responses are refetched. Forwarded to Next.js as
   * `fetch(url, { next: { revalidate } })` and also used as the TTL of the
   * in-memory cache. `false` (or unset) caches for the lifetime of the process.
   */
  revalidate?: number | false;
  /** Include markdown in nested directories (slugs like `guides/install`). Default: `true`. */
  recursive?: boolean;
  /**
   * Where relative links to other markdown files point:
   * - `'site'` (default): the collection's own route (`collection.url(slug, locale)`)
   *   when the target is a document of the same collection, else GitHub.
   * - `'github'`: always the `github.com/…/blob/<ref>/…` page.
   */
  links?: 'site' | 'github';
  /** Rewrite relative links and images to absolute URLs. Default: `true`. */
  rewriteUrls?: boolean;
  /** Derive `title` from the first `# H1` / file name when frontmatter has none. Default: `true`. */
  inferTitle?: boolean;
  /** Keep an in-memory cache of the tree listing and file bodies. Default: `true`. */
  cache?: boolean;
  /** Custom `fetch` implementation (tests, proxies). Default: global `fetch`. */
  fetch?: typeof fetch;
}

interface TreeEntry {
  path: string;
  type: string;
}

interface CacheEntry<T> {
  at: number;
  value: Promise<T>;
}

const API_BASE = 'https://api.github.com';
const RAW_BASE = 'https://raw.githubusercontent.com';
const WEB_BASE = 'https://github.com';

function encodePath(p: string): string {
  return p
    .split('/')
    .map((s) => encodeURIComponent(s))
    .join('/');
}

function safeDecode(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

/** Resolve `target` against the directory of `fromFile` (repo-relative, `/`-separated). Returns null if it escapes the repo. */
function resolveRepoPath(fromFile: string, target: string): string | null {
  const stack = target.startsWith('/')
    ? []
    : fromFile.split('/').slice(0, -1);
  for (const seg of target.split('/')) {
    if (seg === '' || seg === '.') continue;
    if (seg === '..') {
      if (stack.length === 0) return null;
      stack.pop();
    } else {
      stack.push(seg);
    }
  }
  return stack.join('/');
}

/**
 * Read markdown from a GitHub repository.
 *
 * - One `git/trees/<ref>?recursive=1` API call lists the whole repository;
 *   file bodies come from `raw.githubusercontent.com` (not counted against
 *   the REST API rate limit).
 * - Requests go through the global `fetch` with Next.js cache options, plus
 *   an in-memory cache so a build does not refetch the same file twice.
 * - Relative links and images in documents are rewritten to absolute URLs.
 *
 * @example
 *   defineCollection({
 *     id: 'edr-agent-docs',
 *     pathSegment: 'docs/edr-agent',
 *     site,
 *     source: githubSource({ owner: 'synthaea-lab', repo: 'edr-agent', revalidate: 3600 }),
 *   });
 */
export function githubSource(options: GitHubSourceOptions): ContentSource {
  const { owner, repo } = options;
  if (!owner || !repo) {
    throw new Error('githubSource: `owner` and `repo` are required');
  }
  const ref = options.ref || 'HEAD';
  const root = (options.path ?? 'docs').replace(/^\/+|\/+$/g, '');
  const recursive = options.recursive !== false;
  const linkMode = options.links ?? 'site';
  const useCache = options.cache !== false;
  const ttl =
    typeof options.revalidate === 'number'
      ? options.revalidate * 1000
      : Number.POSITIVE_INFINITY;
  const name = `github:${owner}/${repo}`;
  const cache = new Map<string, CacheEntry<unknown>>();

  const token = (): string | undefined =>
    options.token ??
    (typeof process !== 'undefined' ? process.env.GITHUB_TOKEN : undefined) ??
    undefined;

  function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
    if (!useCache) return load();
    const hit = cache.get(key) as CacheEntry<T> | undefined;
    if (hit && Date.now() - hit.at < ttl) return hit.value;
    const value = load();
    cache.set(key, { at: Date.now(), value });
    // Never cache failures.
    value.catch(() => {
      if (cache.get(key)?.value === value) cache.delete(key);
    });
    return value;
  }

  async function request(url: string, accept: string): Promise<Response> {
    const fetchImpl = options.fetch ?? globalThis.fetch;
    if (typeof fetchImpl !== 'function') {
      throw new ContentSourceError(
        `${name}: global fetch is not available (Node.js 18+ required)`,
        { source: name },
      );
    }
    const headers: Record<string, string> = {
      Accept: accept,
      'User-Agent': '@next-md-blog/core',
      'X-GitHub-Api-Version': '2022-11-28',
    };
    const t = token();
    if (t) headers.Authorization = `Bearer ${t}`;
    const init: RequestInit & { next?: { revalidate?: number | false; tags?: string[] } } = {
      headers,
    };
    if (options.revalidate !== undefined) {
      init.next = {
        revalidate: options.revalidate,
        tags: [`next-md-blog:${name}`],
      };
    }
    let res: Response;
    try {
      res = await fetchImpl(url, init);
    } catch (error) {
      throw new ContentSourceError(
        `${name}: request to ${url} failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
        { source: name },
      );
    }
    if (res.status === 429 || (res.status === 403 && isRateLimited(res))) {
      throw new GitHubRateLimitError(name, {
        status: res.status,
        authenticated: Boolean(t),
        ...rateLimitDetails(res),
      });
    }
    return res;
  }

  function isRateLimited(res: Response): boolean {
    return (
      res.headers.get('x-ratelimit-remaining') === '0' ||
      res.headers.has('retry-after')
    );
  }

  function rateLimitDetails(res: Response): { resetAt?: Date; limit?: number } {
    const out: { resetAt?: Date; limit?: number } = {};
    const reset = Number(res.headers.get('x-ratelimit-reset'));
    const retryAfter = Number(res.headers.get('retry-after'));
    if (reset > 0) out.resetAt = new Date(reset * 1000);
    else if (retryAfter > 0) out.resetAt = new Date(Date.now() + retryAfter * 1000);
    const limit = Number(res.headers.get('x-ratelimit-limit'));
    if (limit > 0) out.limit = limit;
    return out;
  }

  function failure(res: Response, what: string): ContentSourceError {
    const hint =
      res.status === 401
        ? ' — bad credentials (check `token` / GITHUB_TOKEN)'
        : res.status === 403
          ? ' — access denied (does the token have read access to this repository?)'
          : res.status === 404
            ? ` — repository or ref "${ref}" not found (private repositories need a token)`
            : '';
    return new ContentSourceError(
      `${name}: ${what} failed with HTTP ${res.status}${hint}`,
      { source: name, status: res.status },
    );
  }

  /** Set of blob paths (repo-relative) in the tree. */
  function tree(): Promise<Set<string>> {
    return cached('tree', async () => {
      const url = `${API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(
        repo,
      )}/git/trees/${encodeURI(ref)}?recursive=1`;
      const res = await request(url, 'application/vnd.github+json');
      if (!res.ok) throw failure(res, 'listing the repository tree');
      const body = (await res.json()) as { tree?: TreeEntry[]; truncated?: boolean };
      if (body.truncated) {
        console.warn(
          `[${name}] Repository tree is truncated by the GitHub API; some files may be missing.`,
        );
      }
      return new Set(
        (body.tree ?? []).filter((e) => e.type === 'blob').map((e) => e.path),
      );
    });
  }

  const repoPath = (sourcePath: string) => joinSourcePath(root, sourcePath);

  function blobUrl(repoRelative: string): string {
    return `${WEB_BASE}/${owner}/${repo}/blob/${ref}/${encodePath(repoRelative)}`;
  }
  function rawUrl(repoRelative: string): string {
    return `${RAW_BASE}/${owner}/${repo}/${ref}/${encodePath(repoRelative)}`;
  }

  const source: ContentSource = {
    name,
    nested: recursive,
    inferTitle: options.inferTitle !== false,

    async list(dir) {
      const prefix = repoPath(dir);
      const files = await tree();
      const out: string[] = [];
      for (const p of files) {
        if (prefix && !p.startsWith(`${prefix}/`)) continue;
        const rel = prefix ? p.slice(prefix.length + 1) : p;
        if (!recursive && rel.includes('/')) continue;
        out.push(rel);
      }
      return out.sort();
    },

    async read(filePath) {
      const target = repoPath(filePath);
      const files = await tree();
      if (!files.has(target)) return null;
      return cached(`raw:${target}`, async () => {
        const res = await request(rawUrl(target), 'text/plain');
        if (res.status === 404) return null;
        if (!res.ok) throw failure(res, `reading ${target}`);
        return res.text();
      });
    },
  };

  if (options.rewriteUrls !== false) {
    source.transform = (content, ctx) => {
      const fromFile = repoPath(ctx.filePath);
      return rewriteMarkdownUrls(content, (url: string, kind: UrlKind) => {
        if (!isRelativeUrl(url)) return url;
        const cut = url.search(/[?#]/);
        const pathPart = cut === -1 ? url : url.slice(0, cut);
        const suffix = cut === -1 ? '' : url.slice(cut);
        if (!pathPart) return url;
        const resolved = resolveRepoPath(fromFile, safeDecode(pathPart));
        if (resolved === null) return url;
        if (kind === 'image') return rawUrl(resolved);
        if (
          linkMode === 'site' &&
          MARKDOWN_FILE_REGEX.test(resolved) &&
          (!root || resolved.startsWith(`${root}/`))
        ) {
          const href = ctx.docHref(root ? resolved.slice(root.length + 1) : resolved);
          if (href) return `${href}${suffix}`;
        }
        return `${blobUrl(resolved)}${suffix}`;
      });
    };
  }

  return source;
}
