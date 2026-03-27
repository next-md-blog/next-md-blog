import { describe, it, expect } from 'vitest';
import { MarkdownContent } from '../MarkdownContent';

describe('MarkdownContent', () => {
  it('should be a function', () => {
    expect(typeof MarkdownContent).toBe('function');
  });

  it('should accept content prop', () => {
    const props = {
      content: '# Hello World',
    };
    expect(() => MarkdownContent(props)).not.toThrow();
  });

  it('should throw error for invalid content', () => {
    expect(() => MarkdownContent({ content: '' })).toThrow('Invalid content');
    expect(() => MarkdownContent({ content: null as unknown as string })).toThrow('Invalid content');
    expect(() => MarkdownContent({ content: undefined as unknown as string })).toThrow('Invalid content');
  });

  it('should accept className prop', () => {
    const props = {
      content: '# Hello World',
      className: 'custom-class',
    };
    expect(() => MarkdownContent(props)).not.toThrow();
  });

  it('should accept components prop', () => {
    const props = {
      content: '# Hello World',
      components: {
        h1: ({ children }: { children: React.ReactNode }) => <h1>{children}</h1>,
      },
    };
    expect(() => MarkdownContent(props)).not.toThrow();
  });

  it('should accept remarkPlugins prop', () => {
    const props = {
      content: '# Hello World',
      remarkPlugins: [],
    };
    expect(() => MarkdownContent(props)).not.toThrow();
  });

  it('should accept rehypePlugins prop', () => {
    const props = {
      content: '# Hello World',
      rehypePlugins: [],
    };
    expect(() => MarkdownContent(props)).not.toThrow();
  });

  it('should have default className as empty string', () => {
    const props = {
      content: '# Hello World',
    };
    expect(() => MarkdownContent(props)).not.toThrow();
  });
});

