/**
 * Pluggable content sources.
 *
 * A `ContentSource` is where a collection's markdown comes from. The default
 * (`fsSource()`) reads the local filesystem relative to `process.cwd()`;
 * `githubSource()` reads a directory of a GitHub repository at build / request
 * time. Collections only ever talk to this interface, so custom sources (a CMS,
 * an S3 bucket, another git host) can be plugged in the same way.
 *
 * Paths are always `/`-separated and relative to the source root.
 */

/** Context passed to `ContentSource.transform`. */
export interface ContentSourceTransformContext {
  /** Source-relative path of the document being rendered (e.g. `en/install.md`). */
  filePath: string;
  /**
   * Map a source-relative markdown path to the URL of the matching document
   * in the calling collection (same locale), or `null` when the target lives
   * outside the collection directory.
   */
  docHref(targetPath: string): string | null;
}

export interface ContentSource {
  /** Identifier used in error / warning messages (e.g. `fs`, `github:owner/repo`). */
  readonly name: string;
  /**
   * `true` when `list()` returns files in nested directories. Nested files
   * become slugs containing `/` (e.g. `guides/install`), so routes should use
   * a catch-all segment (`[...slug]`).
   */
  readonly nested?: boolean;
  /**
   * `true` to derive `frontmatter.title` from the first `# H1` (or the file
   * name) when a document has no `title` in its frontmatter.
   */
  readonly inferTitle?: boolean;
  /**
   * List entries under `dir` (source-relative, may be `''`). Returns paths
   * relative to `dir`. Non-markdown entries are filtered by the collection.
   * Returns `[]` when the directory does not exist.
   */
  list(dir: string): Promise<string[]>;
  /** Read a file (source-relative path). Returns `null` when it does not exist. */
  read(filePath: string): Promise<string | null>;
  /**
   * Optional hook applied to a document body by `getOne()` (after frontmatter
   * is stripped) — e.g. rewriting relative links / images to absolute URLs.
   */
  transform?(content: string, ctx: ContentSourceTransformContext): string;
}

/** Join `/`-separated path parts, ignoring empty parts and duplicate slashes. */
export function joinSourcePath(...parts: (string | undefined)[]): string {
  return parts
    .filter((p): p is string => typeof p === 'string' && p.length > 0)
    .join('/')
    .replace(/\/{2,}/g, '/')
    .replace(/\/$/, '');
}
