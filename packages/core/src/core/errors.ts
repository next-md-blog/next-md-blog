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

