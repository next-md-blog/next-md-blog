import type { ParsedCliArgs } from './types.js';
import { validatePath, validateRouteName, validateLocaleFolder, validateLocales } from './validation.js';

/**
 * Parse command-line arguments into a config object
 * Supports both --flag and --flag=value formats
 * @param argvInput - Arguments after the script name (defaults to `process.argv.slice(2)`)
 * @returns Parsed configuration with optional nonInteractive and force flags
 * @throws {Error} If any argument validation fails
 */
export function parseArgs(argvInput?: string[]): ParsedCliArgs {
  const args = argvInput ?? process.argv.slice(2);
  const config: ParsedCliArgs = {};
  
  // Debug: log all received arguments
  if (process.env.DEBUG) {
    console.log('Received args:', args);
  }
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--non-interactive' || arg === '-y') {
      config.nonInteractive = true;
      if (process.env.DEBUG) {
        console.log('Non-interactive flag detected!');
      }
    } else if (arg === '--force' || arg === '-f') {
      config.force = true;
    } else if (arg.startsWith('--content-dir=')) {
      try {
        config.contentDir = validatePath(arg.split('=')[1], false, true);
      } catch (error) {
        throw new Error(`Invalid --content-dir value: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else if (arg === '--content-dir' && i + 1 < args.length) {
      try {
        config.contentDir = validatePath(args[++i], false, true);
      } catch (error) {
        throw new Error(`Invalid --content-dir value: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else if (arg.startsWith('--blog-route=')) {
      try {
        config.blogRoute = validateRouteName(arg.split('=')[1]);
      } catch (error) {
        throw new Error(`Invalid --blog-route value: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else if (arg === '--blog-route' && i + 1 < args.length) {
      try {
        config.blogRoute = validateRouteName(args[++i]);
      } catch (error) {
        throw new Error(`Invalid --blog-route value: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else if (arg.startsWith('--blogs-route=')) {
      try {
        config.blogsRoute = validateRouteName(arg.split('=')[1]);
      } catch (error) {
        throw new Error(`Invalid --blogs-route value: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else if (arg === '--blogs-route' && i + 1 < args.length) {
      try {
        config.blogsRoute = validateRouteName(args[++i]);
      } catch (error) {
        throw new Error(`Invalid --blogs-route value: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else if (arg === '--i18n-enabled') {
      config.i18n = { enabled: true, localeFolder: '[locale]', locales: ['en', 'fr'] };
    } else if (arg.startsWith('--locale-folder=')) {
      if (!config.i18n) config.i18n = { enabled: true, localeFolder: '[locale]', locales: ['en', 'fr'] };
      try {
        config.i18n.localeFolder = validateLocaleFolder(arg.split('=')[1]);
      } catch (error) {
        throw new Error(`Invalid --locale-folder value: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else if (arg === '--locale-folder' && i + 1 < args.length) {
      if (!config.i18n) config.i18n = { enabled: true, localeFolder: '[locale]', locales: ['en', 'fr'] };
      try {
        config.i18n.localeFolder = validateLocaleFolder(args[++i]);
      } catch (error) {
        throw new Error(`Invalid --locale-folder value: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else if (arg.startsWith('--locales=')) {
      if (!config.i18n) config.i18n = { enabled: true, localeFolder: '[locale]', locales: [] };
      const localesStr = arg.split('=')[1];
      const rawLocales = localesStr.split(',').map(l => l.trim()).filter(l => l.length > 0);
      try {
        config.i18n.locales = validateLocales(rawLocales);
      } catch (error) {
        throw new Error(`Invalid --locales value: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else if (arg === '--locales' && i + 1 < args.length) {
      if (!config.i18n) config.i18n = { enabled: true, localeFolder: '[locale]', locales: [] };
      const localesStr = args[++i];
      const rawLocales = localesStr.split(',').map(l => l.trim()).filter(l => l.length > 0);
      try {
        config.i18n.locales = validateLocales(rawLocales);
      } catch (error) {
        throw new Error(`Invalid --locales value: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else if (arg === '--no-example-post') {
      config.createExamplePost = false;
    } else if (arg === '--example-post') {
      config.createExamplePost = true;
    } else if (arg === '--no-blog-pages') {
      config.createBlogPages = false;
    } else if (arg === '--blog-pages') {
      config.createBlogPages = true;
    } else if (arg === '--no-og-image') {
      config.createOgImage = false;
    } else if (arg === '--og-image') {
      config.createOgImage = true;
    } else if (arg.startsWith('--site-name=')) {
      if (!config.seoConfig) {
        config.seoConfig = { siteName: '', siteUrl: '', defaultAuthor: '', twitterHandle: '' };
      }
      config.seoConfig.siteName = arg.split('=')[1];
    } else if (arg === '--site-name' && i + 1 < args.length) {
      if (!config.seoConfig) {
        config.seoConfig = { siteName: '', siteUrl: '', defaultAuthor: '', twitterHandle: '' };
      }
      config.seoConfig.siteName = args[++i];
    } else if (arg.startsWith('--site-url=')) {
      if (!config.seoConfig) {
        config.seoConfig = { siteName: '', siteUrl: '', defaultAuthor: '', twitterHandle: '' };
      }
      config.seoConfig.siteUrl = arg.split('=')[1];
    } else if (arg === '--site-url' && i + 1 < args.length) {
      if (!config.seoConfig) {
        config.seoConfig = { siteName: '', siteUrl: '', defaultAuthor: '', twitterHandle: '' };
      }
      config.seoConfig.siteUrl = args[++i];
    } else if (arg.startsWith('--author=')) {
      if (!config.seoConfig) {
        config.seoConfig = { siteName: '', siteUrl: '', defaultAuthor: '', twitterHandle: '' };
      }
      config.seoConfig.defaultAuthor = arg.split('=')[1];
    } else if (arg === '--author' && i + 1 < args.length) {
      if (!config.seoConfig) {
        config.seoConfig = { siteName: '', siteUrl: '', defaultAuthor: '', twitterHandle: '' };
      }
      config.seoConfig.defaultAuthor = args[++i];
    } else if (arg.startsWith('--twitter=')) {
      if (!config.seoConfig) {
        config.seoConfig = { siteName: '', siteUrl: '', defaultAuthor: '', twitterHandle: '' };
      }
      config.seoConfig.twitterHandle = arg.split('=')[1];
    } else if (arg === '--twitter' && i + 1 < args.length) {
      if (!config.seoConfig) {
        config.seoConfig = { siteName: '', siteUrl: '', defaultAuthor: '', twitterHandle: '' };
      }
      config.seoConfig.twitterHandle = args[++i];
    }
  }
  
  return config;
}

