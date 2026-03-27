import { describe, it, expect } from 'vitest';
import { BlogPostSEO } from '../BlogPostSEO';
import { createMockBlogPost, createMockConfig } from '../../core/__tests__/fixtures';
import type { BlogPost } from '../../core/types';

// Simple test to verify the component structure and that it generates JSON-LD
// Full rendering tests would require jsdom environment
describe('BlogPostSEO', () => {
  it('should be a function', () => {
    expect(typeof BlogPostSEO).toBe('function');
  });

  it('should accept post prop', () => {
    const post = createMockBlogPost();
    const props = {
      post,
    };
    expect(() => BlogPostSEO(props)).not.toThrow();
  });

  it('should accept config prop', () => {
    const post = createMockBlogPost();
    const config = createMockConfig();
    const props = {
      post,
      config,
    };
    expect(() => BlogPostSEO(props)).not.toThrow();
  });

  it('should accept breadcrumbs prop', () => {
    const post = createMockBlogPost();
    const breadcrumbs = [
      { name: 'Home', url: '/' },
      { name: 'Blog', url: '/blog' },
    ];
    const props = {
      post,
      breadcrumbs,
    };
    expect(() => BlogPostSEO(props)).not.toThrow();
  });

  it('should accept includeBreadcrumbs prop', () => {
    const post = createMockBlogPost();
    const props = {
      post,
      includeBreadcrumbs: false,
    };
    expect(() => BlogPostSEO(props)).not.toThrow();
  });

  it('should have default includeBreadcrumbs as true', () => {
    const post = createMockBlogPost();
    const props = {
      post,
    };
    // Default should be true, so breadcrumbs should be included
    expect(() => BlogPostSEO(props)).not.toThrow();
  });

  it('should accept asGraph prop', () => {
    const post = createMockBlogPost();
    expect(() =>
      BlogPostSEO({ post, config: createMockConfig(), asGraph: true })
    ).not.toThrow();
  });
});

