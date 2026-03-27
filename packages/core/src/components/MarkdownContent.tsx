import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkEmoji from 'remark-emoji';
import type { Components, Options } from 'react-markdown';
import { defaultMarkdownComponents } from './markdown/defaults.js';

function toPluggableArray(
  list: Options['remarkPlugins'] | Options['rehypePlugins'] | undefined
): NonNullable<Options['remarkPlugins']> {
  if (list == null) return [];
  return Array.isArray(list) ? list : [list];
}

/**
 * Component types that can be overridden
 */
export type MarkdownComponents = Partial<Components>;

/**
 * Props for the MarkdownContent component
 */
export interface MarkdownContentProps {
  /** The markdown content to render */
  content: string;
  /** Optional CSS class name for the container */
  className?: string;
  /** Optional custom components to override default markdown rendering */
  components?: MarkdownComponents;
  /** Optional remark plugins */
  remarkPlugins?: Options['remarkPlugins'];
  /** Optional rehype plugins */
  rehypePlugins?: Options['rehypePlugins'];
}

/**
 * React Server Component that renders markdown content as React elements
 * Uses react-markdown under the hood with support for custom components.
 * 
 * If custom components are provided in the components/markdown folder, they will be used.
 * Otherwise, Tailwind's prose classes will handle the styling.
 * 
 * @example
 * ```tsx
 * // Using default components from components/markdown folder
 * <MarkdownContent 
 *   content="# Hello World" 
 *   className="prose prose-lg"
 * />
 * 
 * // Overriding specific components
 * <MarkdownContent 
 *   content="# Hello World" 
 *   className="prose prose-lg"
 *   components={{
 *     h1: ({ children, ...props }) => <h1 className="text-4xl font-bold" {...props}>{children}</h1>,
 *   }}
 * />
 * ```
 */
export function MarkdownContent({
  content,
  className = '',
  components,
  remarkPlugins,
  rehypePlugins,
}: MarkdownContentProps) {
  if (!content || typeof content !== 'string') {
    throw new Error('Invalid content: must be a non-empty string');
  }

  // Merge default components with user-provided components
  // User components override defaults
  const mergedComponents: Components = {
    ...defaultMarkdownComponents,
    ...components,
  };

  const defaultRemarkPlugins = [remarkGfm, remarkEmoji, ...toPluggableArray(remarkPlugins)];

  return (
    <article className={className ? `prose prose-lg max-w-none dark:prose-invert ${className}` : 'prose prose-lg max-w-none dark:prose-invert'}>
      <ReactMarkdown
        remarkPlugins={defaultRemarkPlugins}
        rehypePlugins={toPluggableArray(rehypePlugins)}
        components={mergedComponents}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
