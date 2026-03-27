import type { Config } from './types.js';
import { DEFAULT_SITE_NAME, DEFAULT_LANG } from './constants.js';

/**
 * Default configuration
 */
const DEFAULT_CONFIG: Config = {
  siteName: DEFAULT_SITE_NAME,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  defaultAuthor: 'Blog Author',
  defaultLang: DEFAULT_LANG,
};

/**
 * Helper function to create a config object with type safety
 * Users can use this in their next-md-blog.config.ts file
 * 
 * @example
 * ```ts
 * import { createConfig } from '@next-md-blog/core';
 * 
 * export default createConfig({
 *   siteName: 'My Blog',
 *   siteUrl: 'https://example.com',
 *   defaultAuthor: 'John Doe',
 * });
 * ```
 */
export function createConfig(config: Config): Config {
  const siteUrl = config.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_CONFIG.siteUrl || 'http://localhost:3000';
  return {
    ...DEFAULT_CONFIG,
    ...config,
    siteUrl,
  };
}

/**
 * Returns default configuration
 * 
 * Note: In Next.js, import your `next-md-blog.config.ts` file directly and pass it to functions.
 * This function returns defaults when no config is provided.
 * 
 * @returns Default configuration object
 */
export async function loadConfig(): Promise<Config> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_CONFIG.siteUrl || 'http://localhost:3000';
  return {
    ...DEFAULT_CONFIG,
    siteUrl,
  };
}

/**
 * Synchronous version that returns default configuration
 * 
 * Note: In Next.js, import your `next-md-blog.config.ts` file directly and pass it to functions.
 * This function returns defaults when no config is provided.
 * 
 * @returns Default configuration object
 */
export function getConfig(): Config {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_CONFIG.siteUrl || 'http://localhost:3000';
  return {
    ...DEFAULT_CONFIG,
    siteUrl,
  };
}
