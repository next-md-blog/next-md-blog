import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import * as childProcess from 'child_process';

vi.mock('child_process', async (importOriginal) => {
  const mod = await importOriginal<typeof import('child_process')>();
  return {
    ...mod,
    execSync: vi.fn(() => Buffer.alloc(0)),
  };
});

import { parseArgs } from '../src/args.js';
import { createNonInteractiveConfig } from '../src/prompts.js';
import {
  createConfigFile,
  createContentDir,
  createNextJSRoutes,
  writeAppSeoFiles,
  installNextMdBlog,
  installTailwindTypography,
  installVercelOg,
  updateGlobalsCss,
} from '../src/file-operations.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE = path.join(__dirname, '../test-fixtures/minimal-next');

const baseArgvArgs = [
  '--non-interactive',
  '--content-dir=posts',
  '--blog-route=blog',
  '--blogs-route=blogs',
  '--example-post',
  '--blog-pages',
  '--og-image',
  '--site-name=Test Blog',
  '--site-url=https://test.example.com',
  '--author=Test Author',
  '--twitter=@test',
];

function runInit(extraArgs: string[] = []) {
  process.argv = ['node', 'cli.js', ...baseArgvArgs, ...extraArgs];
  const parsed = parseArgs();
  const config = createNonInteractiveConfig(parsed);
  createConfigFile(config);
  createContentDir(config);
  createNextJSRoutes(config);
  installNextMdBlog();
  installTailwindTypography();
  if (config.createOgImage) {
    installVercelOg();
  }
  updateGlobalsCss();
  return config;
}

describe('cli init integration', () => {
  const originalArgv = process.argv;
  const originalCwd = process.cwd();
  let tmpDir: string;

  beforeEach(() => {
    vi.mocked(childProcess.execSync).mockClear();
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'next-md-blog-cli-init-'));
    fs.cpSync(FIXTURE, tmpDir, { recursive: true });
    process.chdir(tmpDir);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    process.argv = originalArgv;
    if (tmpDir && fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('creates single-language blog files and updates globals.css', () => {
    runInit();
    expect(fs.existsSync(path.join(tmpDir, 'posts', 'welcome.md'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'next-md-blog.config.ts'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'app', 'blog', '[slug]', 'page.tsx'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'app', 'blogs', 'page.tsx'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'app', 'blog', '[slug]', 'opengraph-image.tsx'))).toBe(true);
    const css = fs.readFileSync(path.join(tmpDir, 'app', 'globals.css'), 'utf8');
    expect(css).toContain('@plugin "@tailwindcss/typography"');
    expect(css).toContain('@custom-variant dark');
    expect(css).toContain('next-md-blog theme');
    expect(css).toContain('--color-primary: var(--primary)');
    expect(vi.mocked(childProcess.execSync)).toHaveBeenCalled();
  });

  it('creates i18n locale posts and localized routes', () => {
    runInit(['--i18n-enabled', '--locales=en,fr']);
    expect(fs.existsSync(path.join(tmpDir, 'posts', 'en', 'welcome.md'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'posts', 'fr', 'welcome.md'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'app', '[locale]', 'blog', '[slug]', 'page.tsx'))).toBe(
      true
    );
    expect(fs.existsSync(path.join(tmpDir, 'app', '[locale]', 'blogs', 'page.tsx'))).toBe(true);
    expect(
      fs.existsSync(path.join(tmpDir, 'app', '[locale]', 'blog', '[slug]', 'opengraph-image.tsx'))
    ).toBe(true);
  });

  it('creates sitemap.ts, robots.ts, and feed.xml/route.ts', () => {
    runInit();
    expect(fs.existsSync(path.join(tmpDir, 'app', 'sitemap.ts'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'app', 'robots.ts'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, 'app', 'feed.xml', 'route.ts'))).toBe(true);
    const feed = fs.readFileSync(path.join(tmpDir, 'app', 'feed.xml', 'route.ts'), 'utf8');
    expect(feed).toContain('createRssFeedResponse');
  });

  it('writeAppSeoFiles overwrites when force is true', () => {
    runInit();
    const sitemapPath = path.join(tmpDir, 'app', 'sitemap.ts');
    fs.writeFileSync(sitemapPath, '// stale');
    const parsed = parseArgs([
      '--non-interactive',
      '--content-dir=posts',
      '--blog-route=blog',
      '--blogs-route=blogs',
    ]);
    const config = createNonInteractiveConfig(parsed);
    writeAppSeoFiles(config, { force: true });
    const content = fs.readFileSync(sitemapPath, 'utf8');
    expect(content).not.toContain('// stale');
    expect(content).toContain('getBlogSitemap');
  });
});
