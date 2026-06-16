import { describe, it, expect } from 'vitest';
import { parseFrontmatter } from '../frontmatter';

describe('parseFrontmatter', () => {
  it('parses standard frontmatter and returns the body', () => {
    const { data, content } = parseFrontmatter(
      '---\ntitle: Hello\ntags:\n  - a\n  - b\n---\n\nBody text.\n',
    );
    expect(data).toEqual({ title: 'Hello', tags: ['a', 'b'] });
    expect(content).toBe('\nBody text.\n');
  });

  it('returns the whole input as content when there is no frontmatter', () => {
    const input = '# Just markdown\n\nNo frontmatter here.';
    expect(parseFrontmatter(input)).toEqual({ data: {}, content: input });
  });

  it('handles empty frontmatter', () => {
    const { data, content } = parseFrontmatter('---\n---\nBody only.');
    expect(data).toEqual({});
    expect(content).toBe('Body only.');
  });

  it('handles CRLF line endings', () => {
    const { data, content } = parseFrontmatter(
      '---\r\ntitle: Win\r\n---\r\nBody.\r\n',
    );
    expect(data).toEqual({ title: 'Win' });
    expect(content).toBe('Body.\r\n');
  });

  it('strips a leading UTF-8 BOM before the opening delimiter', () => {
    const { data } = parseFrontmatter('﻿---\ntitle: BOM\n---\nBody');
    expect(data).toEqual({ title: 'BOM' });
  });

  it('treats input as content when the closing delimiter is missing', () => {
    const input = '---\ntitle: unterminated\nstill going';
    expect(parseFrontmatter(input)).toEqual({ data: {}, content: input });
  });

  it('ignores non-object YAML (scalar/array) and yields empty data', () => {
    expect(parseFrontmatter('---\njust a string\n---\nbody').data).toEqual({});
    expect(parseFrontmatter('---\n- 1\n- 2\n---\nbody').data).toEqual({});
  });
});
