/**
 * Base error class for next-md-blog library errors
 */
export class MdxBlogError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'MdxBlogError';
    Object.setPrototypeOf(this, MdxBlogError.prototype);
  }
}

/**
 * Error thrown when a blog post is not found
 */
export class BlogPostNotFoundError extends MdxBlogError {
  constructor(slug: string) {
    super(`Blog post with slug "${slug}" not found`, 'BLOG_POST_NOT_FOUND');
    this.name = 'BlogPostNotFoundError';
    Object.setPrototypeOf(this, BlogPostNotFoundError.prototype);
  }
}

/**
 * Error thrown when there's an issue reading files
 */
export class FileReadError extends MdxBlogError {
  constructor(
    filePath: string,
    originalError?: Error,
    context?: { operation?: string; slug?: string }
  ) {
    const contextMessage = context?.operation ? ` during ${context.operation}` : '';
    super(
      `Failed to read file at "${filePath}"${contextMessage}: ${originalError?.message || 'Unknown error'}`,
      'FILE_READ_ERROR'
    );
    this.name = 'FileReadError';
    this.filePath = filePath;
    if (originalError !== undefined) {
      this.originalError = originalError;
    }
    if (context !== undefined) {
      this.context = context;
    }
    Object.setPrototypeOf(this, FileReadError.prototype);
  }

  /** The file path that failed to be read */
  public readonly filePath: string;
  /** The original error that occurred */
  public readonly originalError?: Error;
  /** Additional context about the operation */
  public readonly context?: { operation?: string; slug?: string };
}

/**
 * Error thrown when there's an issue with directory operations
 */
export class DirectoryError extends MdxBlogError {
  constructor(
    directoryPath: string,
    originalError?: Error,
    context?: { operation?: string }
  ) {
    const contextMessage = context?.operation ? ` during ${context.operation}` : '';
    super(
      `Directory operation failed for "${directoryPath}"${contextMessage}: ${originalError?.message || 'Unknown error'}`,
      'DIRECTORY_ERROR'
    );
    this.name = 'DirectoryError';
    this.directoryPath = directoryPath;
    if (originalError !== undefined) {
      this.originalError = originalError;
    }
    if (context !== undefined) {
      this.context = context;
    }
    Object.setPrototypeOf(this, DirectoryError.prototype);
  }

  /** The directory path that failed */
  public readonly directoryPath: string;
  /** The original error that occurred */
  public readonly originalError?: Error;
  /** Additional context about the operation */
  public readonly context?: { operation?: string };
}


/**
 * Error thrown by a remote `ContentSource` (e.g. `githubSource`) when the
 * backing service fails in a way that should not be silently skipped:
 * authentication failures, missing repository / ref, unexpected HTTP status.
 *
 * Messages never include credentials.
 */
export class ContentSourceError extends MdxBlogError {
  constructor(
    message: string,
    options: { source: string; status?: number; code?: string },
  ) {
    super(message, options.code ?? 'CONTENT_SOURCE_ERROR');
    this.name = 'ContentSourceError';
    this.source = options.source;
    if (options.status !== undefined) {
      this.status = options.status;
    }
    Object.setPrototypeOf(this, ContentSourceError.prototype);
  }

  /** Source identifier, e.g. `github:owner/repo`. */
  public readonly source: string;
  /** HTTP status returned by the remote service, when applicable. */
  public readonly status?: number;
}

/**
 * Error thrown when the GitHub API / raw content host rate-limits a request
 * (HTTP 429, or 403 with `x-ratelimit-remaining: 0`).
 */
export class GitHubRateLimitError extends ContentSourceError {
  constructor(
    source: string,
    details: { status: number; resetAt?: Date; limit?: number; authenticated: boolean },
  ) {
    const when = details.resetAt
      ? ` Resets at ${details.resetAt.toISOString()}.`
      : '';
    const hint = details.authenticated
      ? ''
      : ' Unauthenticated requests are limited to 60/hour; pass `token` or set GITHUB_TOKEN.';
    super(`GitHub rate limit exceeded for ${source}.${when}${hint}`, {
      source,
      status: details.status,
      code: 'GITHUB_RATE_LIMIT',
    });
    this.name = 'GitHubRateLimitError';
    if (details.resetAt !== undefined) this.resetAt = details.resetAt;
    if (details.limit !== undefined) this.limit = details.limit;
    Object.setPrototypeOf(this, GitHubRateLimitError.prototype);
  }

  /** When the rate-limit window resets (from `x-ratelimit-reset` / `retry-after`). */
  public readonly resetAt?: Date;
  /** Request quota for the current window (from `x-ratelimit-limit`). */
  public readonly limit?: number;
}
