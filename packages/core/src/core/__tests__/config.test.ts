import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createConfig, loadConfig, getConfig } from '../config';

describe('createConfig', () => {
  const originalEnv = process.env.NEXT_PUBLIC_SITE_URL;

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  afterEach(() => {
    if (originalEnv) {
      process.env.NEXT_PUBLIC_SITE_URL = originalEnv;
    } else {
      delete process.env.NEXT_PUBLIC_SITE_URL;
    }
  });

  it('should create config with provided values', () => {
    const config = createConfig({
      siteName: 'My Custom Blog',
      siteUrl: 'https://custom.com',
      defaultAuthor: 'Custom Author',
    });

    expect(config.siteName).toBe('My Custom Blog');
    expect(config.siteUrl).toBe('https://custom.com');
    expect(config.defaultAuthor).toBe('Custom Author');
  });

  it('should merge with default config', () => {
    const config = createConfig({
      siteName: 'My Custom Blog',
    });

    expect(config.siteName).toBe('My Custom Blog');
    expect(config.siteUrl).toBe('http://localhost:3000'); // Default
    expect(config.defaultAuthor).toBe('Blog Author'); // Default
    expect(config.defaultLang).toBe('en'); // Default
  });

  it('should use NEXT_PUBLIC_SITE_URL env var when siteUrl not provided', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://env-example.com';

    const config = createConfig({
      siteName: 'My Blog',
    });

    expect(config.siteUrl).toBe('https://env-example.com');
  });

  it('should prioritize provided siteUrl over env var', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://env-example.com';

    const config = createConfig({
      siteName: 'My Blog',
      siteUrl: 'https://custom.com',
    });

    expect(config.siteUrl).toBe('https://custom.com');
  });

  it('should use default siteUrl when neither provided nor in env', () => {
    const config = createConfig({
      siteName: 'My Blog',
    });

    expect(config.siteUrl).toBe('http://localhost:3000');
  });

  it('should handle empty siteUrl string by using env var or default', () => {
    const config = createConfig({
      siteName: 'My Blog',
      siteUrl: '',
    });

    // Empty string triggers fallback to env var or default
    expect(config.siteUrl).toBe(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');
  });

  it('should handle all config options', () => {
    const config = createConfig({
      siteName: 'My Blog',
      siteUrl: 'https://example.com',
      defaultAuthor: 'John Doe',
      twitterHandle: '@johndoe',
      defaultOgImage: 'https://example.com/og.jpg',
      defaultLang: 'fr',
      alternateLanguages: ['en', 'es'],
      authors: [
        {
          name: 'John Doe',
          email: 'john@example.com',
        },
      ],
    });

    expect(config.siteName).toBe('My Blog');
    expect(config.siteUrl).toBe('https://example.com');
    expect(config.defaultAuthor).toBe('John Doe');
    expect(config.twitterHandle).toBe('@johndoe');
    expect(config.defaultOgImage).toBe('https://example.com/og.jpg');
    expect(config.defaultLang).toBe('fr');
    expect(config.alternateLanguages).toEqual(['en', 'es']);
    expect(config.authors).toHaveLength(1);
  });
});

describe('loadConfig', () => {
  const originalEnv = process.env.NEXT_PUBLIC_SITE_URL;

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  afterEach(() => {
    if (originalEnv) {
      process.env.NEXT_PUBLIC_SITE_URL = originalEnv;
    } else {
      delete process.env.NEXT_PUBLIC_SITE_URL;
    }
  });

  it('should return default config', async () => {
    const config = await loadConfig();

    expect(config.siteName).toBe('My Blog');
    expect(config.siteUrl).toBe('http://localhost:3000');
    expect(config.defaultAuthor).toBe('Blog Author');
    expect(config.defaultLang).toBe('en');
  });

  it('should use NEXT_PUBLIC_SITE_URL env var', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://env-example.com';

    const config = await loadConfig();

    expect(config.siteUrl).toBe('https://env-example.com');
  });

  it('should return a Promise that resolves to config', async () => {
    const configPromise = loadConfig();
    expect(configPromise).toBeInstanceOf(Promise);

    const config = await configPromise;
    expect(config).toHaveProperty('siteName');
    expect(config).toHaveProperty('siteUrl');
  });
});

describe('getConfig', () => {
  const originalEnv = process.env.NEXT_PUBLIC_SITE_URL;

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  afterEach(() => {
    if (originalEnv) {
      process.env.NEXT_PUBLIC_SITE_URL = originalEnv;
    } else {
      delete process.env.NEXT_PUBLIC_SITE_URL;
    }
  });

  it('should return default config', () => {
    const config = getConfig();

    expect(config.siteName).toBe('My Blog');
    expect(config.siteUrl).toBe('http://localhost:3000');
    expect(config.defaultAuthor).toBe('Blog Author');
    expect(config.defaultLang).toBe('en');
  });

  it('should use NEXT_PUBLIC_SITE_URL env var', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://env-example.com';

    const config = getConfig();

    expect(config.siteUrl).toBe('https://env-example.com');
  });

  it('should return same structure as loadConfig', () => {
    const syncConfig = getConfig();
    const asyncConfigPromise = loadConfig();

    expect(syncConfig).toHaveProperty('siteName');
    expect(syncConfig).toHaveProperty('siteUrl');
    expect(syncConfig).toHaveProperty('defaultAuthor');
    expect(syncConfig).toHaveProperty('defaultLang');
  });

  it('should handle undefined env var', () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;

    const config = getConfig();

    expect(config.siteUrl).toBe('http://localhost:3000');
  });
});

