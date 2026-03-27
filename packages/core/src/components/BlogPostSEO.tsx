import React from 'react';
import type { BlogPost, Config } from '../core/types.js';
import {
  generateBlogPostSchema,
  generateBreadcrumbsSchema,
  generateBlogPostSchemaGraph,
} from '../core/seo.js';
import { getConfig } from '../core/config.js';

/**
 * Props for the BlogPostSEO component
 */
export interface BlogPostSEOProps {
  /** The blog post */
  post: BlogPost;
  /** Configuration (optional - will load from next-md-blog.config.ts if not provided) */
  config?: Config;
  /** Custom breadcrumb items (optional) */
  breadcrumbs?: Array<{ name: string; url: string }>;
  /** Whether to include breadcrumbs schema (default: true) */
  includeBreadcrumbs?: boolean;
  /** Single `@graph` script (Organization + article + breadcrumbs by reference) */
  asGraph?: boolean;
}

/**
 * Component that generates and injects JSON-LD structured data for a blog post
 * Handles both article schema and breadcrumbs schema automatically
 * 
 * @example
 * ```tsx
 * <BlogPostSEO post={post} />
 * ```
 */
export function BlogPostSEO({
  post,
  config,
  breadcrumbs,
  includeBreadcrumbs = true,
  asGraph = false,
}: BlogPostSEOProps) {
  const blogConfig = config || getConfig();

  if (asGraph) {
    const graphSchema = generateBlogPostSchemaGraph(
      post,
      blogConfig,
      breadcrumbs,
      includeBreadcrumbs
    );
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(graphSchema) }}
      />
    );
  }

  const articleSchema = generateBlogPostSchema(post, blogConfig);

  const breadcrumbsSchema = includeBreadcrumbs
    ? generateBreadcrumbsSchema(post, blogConfig, breadcrumbs)
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {breadcrumbsSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsSchema) }}
        />
      )}
    </>
  );
}

