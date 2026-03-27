import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import fs from 'fs';
import { parseArgs } from '../src/args.js';
import { generateExamplePost } from '../src/templates.js';

// Mock process.argv
const originalArgv = process.argv;

describe('parseArgs', () => {
  beforeEach(() => {
    // Reset process.argv before each test
    process.argv = originalArgv;
  });

  it('should parse --non-interactive flag', () => {
    process.argv = ['node', 'cli.js', '--non-interactive'];
    const result = parseArgs();
    expect(result.nonInteractive).toBe(true);
  });

  it('should parse -y as non-interactive', () => {
    process.argv = ['node', 'cli.js', '-y'];
    const result = parseArgs();
    expect(result.nonInteractive).toBe(true);
  });

  it('should parse --force and -f', () => {
    process.argv = ['node', 'cli.js', '--force'];
    expect(parseArgs().force).toBe(true);
    process.argv = ['node', 'cli.js', '-f'];
    expect(parseArgs().force).toBe(true);
  });

  it('should parse argv passed explicitly without reading process.argv', () => {
    const result = parseArgs(['--force', '--content-dir=blog-content']);
    expect(result.force).toBe(true);
    expect(result.contentDir).toBe('blog-content');
  });

  it('should parse --content-dir with equals', () => {
    process.argv = ['node', 'cli.js', '--content-dir=content'];
    const result = parseArgs();
    expect(result.contentDir).toBe('content');
  });

  it('should parse --content-dir with space', () => {
    process.argv = ['node', 'cli.js', '--content-dir', 'content'];
    const result = parseArgs();
    expect(result.contentDir).toBe('content');
  });

  it('should parse --blog-route', () => {
    process.argv = ['node', 'cli.js', '--blog-route=article'];
    const result = parseArgs();
    expect(result.blogRoute).toBe('article');
  });

  it('should parse --blogs-route', () => {
    process.argv = ['node', 'cli.js', '--blogs-route=articles'];
    const result = parseArgs();
    expect(result.blogsRoute).toBe('articles');
  });

  it('should parse --i18n-enabled', () => {
    process.argv = ['node', 'cli.js', '--i18n-enabled'];
    const result = parseArgs();
    expect(result.i18n?.enabled).toBe(true);
    expect(result.i18n?.localeFolder).toBe('[locale]');
    expect(result.i18n?.locales).toEqual(['en', 'fr']);
  });

  it('should parse --locale-folder with equals', () => {
    process.argv = ['node', 'cli.js', '--i18n-enabled', '--locale-folder=lang'];
    const result = parseArgs();
    expect(result.i18n?.localeFolder).toBe('lang');
  });

  it('should parse --locale-folder with space', () => {
    process.argv = ['node', 'cli.js', '--i18n-enabled', '--locale-folder', 'lang'];
    const result = parseArgs();
    expect(result.i18n?.localeFolder).toBe('lang');
  });

  it('should parse --locales with equals', () => {
    process.argv = ['node', 'cli.js', '--i18n-enabled', '--locales=en,fr,es'];
    const result = parseArgs();
    expect(result.i18n?.locales).toEqual(['en', 'fr', 'es']);
  });

  it('should parse --locales with space', () => {
    process.argv = ['node', 'cli.js', '--i18n-enabled', '--locales', 'en,fr,es'];
    const result = parseArgs();
    expect(result.i18n?.locales).toEqual(['en', 'fr', 'es']);
  });

  it('should trim whitespace from locales', () => {
    process.argv = ['node', 'cli.js', '--i18n-enabled', '--locales= en , fr , es '];
    const result = parseArgs();
    expect(result.i18n?.locales).toEqual(['en', 'fr', 'es']);
  });

  it('should filter empty locales', () => {
    process.argv = ['node', 'cli.js', '--i18n-enabled', '--locales=en,,fr'];
    const result = parseArgs();
    expect(result.i18n?.locales).toEqual(['en', 'fr']);
  });

  it('should parse --no-example-post', () => {
    process.argv = ['node', 'cli.js', '--no-example-post'];
    const result = parseArgs();
    expect(result.createExamplePost).toBe(false);
  });

  it('should parse --example-post', () => {
    process.argv = ['node', 'cli.js', '--example-post'];
    const result = parseArgs();
    expect(result.createExamplePost).toBe(true);
  });

  it('should parse --no-blog-pages', () => {
    process.argv = ['node', 'cli.js', '--no-blog-pages'];
    const result = parseArgs();
    expect(result.createBlogPages).toBe(false);
  });

  it('should parse --blog-pages', () => {
    process.argv = ['node', 'cli.js', '--blog-pages'];
    const result = parseArgs();
    expect(result.createBlogPages).toBe(true);
  });

  it('should parse --no-og-image', () => {
    process.argv = ['node', 'cli.js', '--no-og-image'];
    const result = parseArgs();
    expect(result.createOgImage).toBe(false);
  });

  it('should parse --og-image', () => {
    process.argv = ['node', 'cli.js', '--og-image'];
    const result = parseArgs();
    expect(result.createOgImage).toBe(true);
  });

  it('should parse SEO config with equals', () => {
    process.argv = [
      'node',
      'cli.js',
      '--site-name=My Site',
      '--site-url=https://example.com',
      '--author=John Doe',
      '--twitter=@johndoe',
    ];
    const result = parseArgs();
    expect(result.seoConfig?.siteName).toBe('My Site');
    expect(result.seoConfig?.siteUrl).toBe('https://example.com');
    expect(result.seoConfig?.defaultAuthor).toBe('John Doe');
    expect(result.seoConfig?.twitterHandle).toBe('@johndoe');
  });

  it('should parse SEO config with space', () => {
    process.argv = [
      'node',
      'cli.js',
      '--site-name',
      'My Site',
      '--site-url',
      'https://example.com',
      '--author',
      'John Doe',
      '--twitter',
      '@johndoe',
    ];
    const result = parseArgs();
    expect(result.seoConfig?.siteName).toBe('My Site');
    expect(result.seoConfig?.siteUrl).toBe('https://example.com');
    expect(result.seoConfig?.defaultAuthor).toBe('John Doe');
    expect(result.seoConfig?.twitterHandle).toBe('@johndoe');
  });

  it('should handle multiple arguments', () => {
    process.argv = [
      'node',
      'cli.js',
      '--non-interactive',
      '--content-dir=posts',
      '--blog-route=blog',
      '--i18n-enabled',
      '--locales=en,fr,es',
      '--site-name=Test Blog',
    ];
    const result = parseArgs();
    expect(result.nonInteractive).toBe(true);
    expect(result.contentDir).toBe('posts');
    expect(result.blogRoute).toBe('blog');
    expect(result.i18n?.enabled).toBe(true);
    expect(result.i18n?.locales).toEqual(['en', 'fr', 'es']);
    expect(result.seoConfig?.siteName).toBe('Test Blog');
  });

  it('should handle --locales without --i18n-enabled (creates i18n config)', () => {
    process.argv = ['node', 'cli.js', '--locales=en,fr'];
    const result = parseArgs();
    expect(result.i18n?.enabled).toBe(true);
    expect(result.i18n?.locales).toEqual(['en', 'fr']);
  });

  it('should handle --locale-folder without --i18n-enabled (creates i18n config)', () => {
    process.argv = ['node', 'cli.js', '--locale-folder=lang'];
    const result = parseArgs();
    expect(result.i18n?.enabled).toBe(true);
    expect(result.i18n?.localeFolder).toBe('lang');
  });

  it('should return empty config for no arguments', () => {
    process.argv = ['node', 'cli.js'];
    const result = parseArgs();
    expect(result.nonInteractive).toBeUndefined();
    expect(result.contentDir).toBeUndefined();
    expect(result.i18n).toBeUndefined();
  });

  it('should handle --locales with only one locale', () => {
    process.argv = ['node', 'cli.js', '--i18n-enabled', '--locales=en'];
    const result = parseArgs();
    expect(result.i18n?.enabled).toBe(true);
    expect(result.i18n?.locales).toEqual(['en']);
  });

  it('should handle --locales with many locales', () => {
    process.argv = ['node', 'cli.js', '--i18n-enabled', '--locales=en,fr,es,de,it'];
    const result = parseArgs();
    expect(result.i18n?.enabled).toBe(true);
    expect(result.i18n?.locales).toEqual(['en', 'fr', 'es', 'de', 'it']);
  });

  it('should handle locale-folder and locales together', () => {
    process.argv = [
      'node',
      'cli.js',
      '--i18n-enabled',
      '--locale-folder=lang',
      '--locales=en,fr,es',
    ];
    const result = parseArgs();
    expect(result.i18n?.enabled).toBe(true);
    expect(result.i18n?.localeFolder).toBe('lang');
    expect(result.i18n?.locales).toEqual(['en', 'fr', 'es']);
  });
});

describe('generateExamplePost', () => {
  const originalCwd = process.cwd();
  let existsSyncSpy: ReturnType<typeof vi.spyOn>;
  let readFileSyncSpy: ReturnType<typeof vi.spyOn>;

  const defaultTemplateContent = `---
title: "Welcome to My Blog"
date: "2024-01-01"
description: "This is an example blog post"
---

# Welcome to My Blog

This is your first blog post! You can edit this file in the \`{{CONTENT_DIR}}\` folder.

## Getting Started

Write your blog posts in markdown format and save them in the \`{{CONTENT_DIR}}\` folder.

## Features

- Markdown support
- Frontmatter support
- Easy to use with Next.js
`;

  const frenchTemplateContent = `---
title: "Bienvenue sur mon blog"
date: "2024-01-01"
description: "Ceci est un exemple d'article de blog"
---

# Bienvenue sur mon blog

Ceci est votre premier article de blog ! Vous pouvez modifier ce fichier dans le dossier \`{{CONTENT_DIR}}\`.

## Pour commencer

Écrivez vos articles de blog au format markdown et enregistrez-les dans le dossier \`{{CONTENT_DIR}}\`.

## Fonctionnalités

- Support Markdown
- Support Frontmatter
- Facile à utiliser avec Next.js
`;

  beforeEach(() => {
    existsSyncSpy = vi.spyOn(fs, 'existsSync');
    readFileSyncSpy = vi.spyOn(fs, 'readFileSync');
    process.chdir(originalCwd);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should use default template for English locale', () => {
    existsSyncSpy.mockReturnValue(true);
    readFileSyncSpy.mockReturnValue(defaultTemplateContent);
    const result = generateExamplePost('posts', 'en');
    expect(result).toContain('Welcome to My Blog');
    expect(result).toContain('posts');
    expect(result).not.toContain('{{CONTENT_DIR}}');
  });

  it('should use default template when no locale is provided', () => {
    existsSyncSpy.mockReturnValue(true);
    readFileSyncSpy.mockReturnValue(defaultTemplateContent);
    const result = generateExamplePost('posts');
    expect(result).toContain('Welcome to My Blog');
    expect(result).toContain('posts');
    expect(result).not.toContain('{{CONTENT_DIR}}');
  });

  it('should use French template when locale is fr and template exists', () => {
    // Mock that the French template exists
    existsSyncSpy.mockImplementation((filePath: string) => {
      if (typeof filePath === 'string' && filePath.includes('example-post.fr.md')) {
        return true;
      }
      if (typeof filePath === 'string' && filePath.includes('example-post.md')) {
        return true;
      }
      return false;
    });
    
    readFileSyncSpy.mockImplementation((filePath: string) => {
      if (typeof filePath === 'string' && filePath.includes('example-post.fr.md')) {
        return frenchTemplateContent;
      }
      return defaultTemplateContent;
    });

    const result = generateExamplePost('posts', 'fr');
    expect(result).toContain('Bienvenue sur mon blog');
    expect(result).toContain('posts');
    expect(result).not.toContain('{{CONTENT_DIR}}');
  });

  it('should fall back to default template when locale-specific template does not exist', () => {
    // Mock that the locale-specific template does NOT exist
    existsSyncSpy.mockImplementation((filePath: string) => {
      if (typeof filePath === 'string' && filePath.includes('example-post.es.md')) {
        return false; // Spanish template doesn't exist
      }
      if (typeof filePath === 'string' && filePath.includes('example-post.md')) {
        return true; // Default template exists
      }
      return false;
    });
    
    readFileSyncSpy.mockReturnValue(defaultTemplateContent);

    const result = generateExamplePost('posts', 'es');
    expect(result).toContain('Welcome to My Blog');
    expect(result).toContain('posts');
    expect(result).not.toContain('{{CONTENT_DIR}}');
  });

  it('should replace CONTENT_DIR placeholder with provided directory', () => {
    existsSyncSpy.mockReturnValue(true);
    readFileSyncSpy.mockReturnValue(defaultTemplateContent);
    const result = generateExamplePost('my-content', 'en');
    expect(result).toContain('my-content');
    expect(result).not.toContain('{{CONTENT_DIR}}');
  });

  it('should handle custom content directory with French locale', () => {
    existsSyncSpy.mockImplementation((filePath: string) => {
      if (typeof filePath === 'string' && filePath.includes('example-post.fr.md')) {
        return true;
      }
      if (typeof filePath === 'string' && filePath.includes('example-post.md')) {
        return true;
      }
      return false;
    });
    
    readFileSyncSpy.mockImplementation((filePath: string) => {
      if (typeof filePath === 'string' && filePath.includes('example-post.fr.md')) {
        return frenchTemplateContent;
      }
      return defaultTemplateContent;
    });

    const result = generateExamplePost('articles', 'fr');
    expect(result).toContain('articles');
    expect(result).toContain('Bienvenue sur mon blog');
    expect(result).not.toContain('{{CONTENT_DIR}}');
  });
});

