import readline from 'readline';
import type { CLIConfig, ParsedCliArgs } from './types.js';
import { validatePath, validateRouteName, validateLocaleFolder, validateLocales } from './validation.js';

let rl: readline.Interface | null = null;

/**
 * Get or create the readline interface
 * @returns Readline interface instance
 */
function getReadlineInterface(): readline.Interface {
  if (!rl) {
    rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }
  return rl;
}

/**
 * Close the readline interface
 */
export function closeReadline(): void {
  if (rl) {
    rl.close();
    rl = null;
  }
}

/**
 * Prompt user for a string input
 * @param query - Question to ask
 * @returns User's answer
 */
export function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    const rlInterface = getReadlineInterface();
    rlInterface.question(query, resolve);
  });
}

/**
 * Prompt user for a boolean input
 * @param query - Question to ask
 * @param defaultValue - Default value if user presses Enter
 * @returns User's boolean answer
 */
export function questionBoolean(query: string, defaultValue: boolean = true): Promise<boolean> {
  return new Promise((resolve) => {
    const rlInterface = getReadlineInterface();
    rlInterface.question(`${query} (${defaultValue ? 'Y/n' : 'y/N'}): `, (answer) => {
      const normalized = answer.trim().toLowerCase();
      if (normalized === '') {
        resolve(defaultValue);
      } else {
        resolve(normalized === 'y' || normalized === 'yes');
      }
    });
  });
}

/**
 * Collect configuration from user prompts (interactive mode)
 * @param parsedArgs - Already parsed command-line arguments
 * @returns Complete CLI configuration
 */
export async function collectInteractiveConfig(parsedArgs: ParsedCliArgs): Promise<CLIConfig> {
  console.log('🚀 Initializing next-md-blog...\n');
  console.log('Please answer the following questions to customize your setup:\n');

  let contentDir = await question('Content directory name (default: posts): ') || parsedArgs.contentDir || 'posts';
  let blogRoute = await question('Blog post route name (default: blog): ') || parsedArgs.blogRoute || 'blog';
  let blogsRoute = await question('Blog listing route name (default: blogs): ') || parsedArgs.blogsRoute || 'blogs';
  
  // Validate inputs
  try {
    contentDir = validatePath(contentDir.trim(), false, true);
    blogRoute = validateRouteName(blogRoute.trim());
    blogsRoute = validateRouteName(blogsRoute.trim());
  } catch (error) {
    console.error(`\n✗ Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
  
  console.log('\n--- i18n Configuration ---');
  const i18nEnabled = parsedArgs.i18n?.enabled !== undefined 
    ? parsedArgs.i18n.enabled 
    : await questionBoolean('Enable i18n support?', false);
  let localeFolder = parsedArgs.i18n?.localeFolder || '[locale]';
  let locales: string[] = parsedArgs.i18n?.locales || [];
  if (i18nEnabled) {
    const localeFolderInput = await question('Locale folder name in app directory (default: [locale]): ') || '[locale]';
    try {
      localeFolder = validateLocaleFolder(localeFolderInput.trim());
    } catch (error) {
      console.error(`\n✗ Validation error for locale folder: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
    
    // Ask for locales
    const localesInput = await question('Enter locales (comma-separated, default: en,fr): ') || 'en,fr';
    const rawLocales = localesInput
      .split(',')
      .map(locale => locale.trim())
      .filter(locale => locale.length > 0);
    
    if (rawLocales.length === 0) {
      locales = ['en', 'fr']; // Default fallback
    } else {
      try {
        locales = validateLocales(rawLocales);
      } catch (error) {
        console.error(`\n✗ Validation error for locales: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw error;
      }
    }
    
    console.log(`✓ Configured locales: ${locales.join(', ')}`);
  }
  
  console.log('\n--- Component Options ---');
  const createExamplePost = parsedArgs.createExamplePost !== undefined
    ? parsedArgs.createExamplePost
    : await questionBoolean('Create example blog post?', true);
  const createBlogPages = parsedArgs.createBlogPages !== undefined
    ? parsedArgs.createBlogPages
    : await questionBoolean('Create blog page components?', true);
  const createOgImage = parsedArgs.createOgImage !== undefined
    ? parsedArgs.createOgImage
    : await questionBoolean('Create OG image component?', true);

  console.log('\n--- SEO Configuration ---');
  const siteName = await question('Site name (default: My Blog): ') || parsedArgs.seoConfig?.siteName || 'My Blog';
  const siteUrl = await question('Site URL (default: https://example.com): ') || parsedArgs.seoConfig?.siteUrl || 'https://example.com';
  const defaultAuthor = await question('Default author name (default: Your Name): ') || parsedArgs.seoConfig?.defaultAuthor || 'Your Name';
  const twitterHandle = await question('Twitter handle (optional, press Enter to skip): ') || parsedArgs.seoConfig?.twitterHandle || '';

  return {
    contentDir,
    blogRoute,
    blogsRoute,
    createExamplePost,
    createBlogPages,
    createOgImage,
    i18n: {
      enabled: i18nEnabled,
      localeFolder: localeFolder,
      locales: locales,
    },
    seoConfig: {
      siteName: siteName.trim(),
      siteUrl: siteUrl.trim(),
      defaultAuthor: defaultAuthor.trim(),
      twitterHandle: twitterHandle.trim(),
    },
  };
}

/**
 * Create configuration from parsed args (non-interactive mode)
 * @param parsedArgs - Parsed command-line arguments
 * @returns Complete CLI configuration
 */
/**
 * Interactive setup for the `seo` subcommand only (content paths + i18n).
 */
export async function collectInteractiveSeoConfig(parsedArgs: ParsedCliArgs): Promise<CLIConfig> {
  console.log('🚀 Add or update next-md-blog SEO files (sitemap.ts, robots.ts, RSS feed)...\n');
  console.log('Use the same content directory and i18n settings as in next-md-blog.config.ts.\n');

  let contentDir =
    (await question('Content directory name (default: posts): ')).trim() ||
    parsedArgs.contentDir ||
    'posts';
  let blogRoute = parsedArgs.blogRoute || 'blog';
  let blogsRoute = parsedArgs.blogsRoute || 'blogs';

  try {
    contentDir = validatePath(contentDir, false, true);
    blogRoute = validateRouteName(blogRoute.trim());
    blogsRoute = validateRouteName(blogsRoute.trim());
  } catch (error) {
    console.error(`\n✗ Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }

  console.log('\n--- i18n Configuration ---');
  const i18nEnabled =
    parsedArgs.i18n?.enabled !== undefined
      ? parsedArgs.i18n.enabled
      : await questionBoolean('Enable i18n support?', false);
  let localeFolder = parsedArgs.i18n?.localeFolder || '[locale]';
  let locales: string[] = parsedArgs.i18n?.locales || [];

  if (i18nEnabled) {
    const localeFolderInput =
      (await question('Locale folder name in app directory (default: [locale]): ')).trim() || '[locale]';
    try {
      localeFolder = validateLocaleFolder(localeFolderInput);
    } catch (error) {
      console.error(
        `\n✗ Validation error for locale folder: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      throw error;
    }

    const localesInput =
      (await question('Enter locales (comma-separated, default: en,fr): ')).trim() || 'en,fr';
    const rawLocales = localesInput
      .split(',')
      .map((locale) => locale.trim())
      .filter((locale) => locale.length > 0);

    try {
      locales = rawLocales.length > 0 ? validateLocales(rawLocales) : ['en', 'fr'];
    } catch (error) {
      console.error(`\n✗ Validation error for locales: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
    console.log(`✓ Configured locales: ${locales.join(', ')}`);
  }

  return {
    contentDir,
    blogRoute,
    blogsRoute,
    createExamplePost: false,
    createBlogPages: false,
    createOgImage: false,
    i18n: {
      enabled: i18nEnabled,
      localeFolder,
      locales,
    },
    seoConfig: {
      siteName: parsedArgs.seoConfig?.siteName || 'My Blog',
      siteUrl: parsedArgs.seoConfig?.siteUrl || 'https://example.com',
      defaultAuthor: parsedArgs.seoConfig?.defaultAuthor || 'Your Name',
      twitterHandle: parsedArgs.seoConfig?.twitterHandle || '',
    },
  };
}

export function createNonInteractiveConfig(parsedArgs: ParsedCliArgs): CLIConfig {
  console.log('🚀 Initializing next-md-blog (non-interactive mode)...\n');
  const i18nConfig = parsedArgs.i18n || {
    enabled: false,
    localeFolder: '[locale]',
    locales: ['en', 'fr'],
  };
  
  // Validate all paths and routes
  let contentDir: string;
  let blogRoute: string;
  let blogsRoute: string;
  let localeFolder: string;
  let locales: string[];
  
  try {
    contentDir = parsedArgs.contentDir ? validatePath(parsedArgs.contentDir, false, true) : 'posts';
    blogRoute = parsedArgs.blogRoute ? validateRouteName(parsedArgs.blogRoute) : 'blog';
    blogsRoute = parsedArgs.blogsRoute ? validateRouteName(parsedArgs.blogsRoute) : 'blogs';
    localeFolder = i18nConfig.localeFolder ? validateLocaleFolder(i18nConfig.localeFolder) : '[locale]';
    locales = i18nConfig.locales && i18nConfig.locales.length > 0 
      ? validateLocales(i18nConfig.locales) 
      : (i18nConfig.enabled ? ['en', 'fr'] : []);
  } catch (error) {
    console.error(`\n✗ Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
  
  return {
    contentDir,
    blogRoute,
    blogsRoute,
    createExamplePost: parsedArgs.createExamplePost !== undefined ? parsedArgs.createExamplePost : true,
    createBlogPages: parsedArgs.createBlogPages !== undefined ? parsedArgs.createBlogPages : true,
    createOgImage: parsedArgs.createOgImage !== undefined ? parsedArgs.createOgImage : true,
    i18n: {
      enabled: i18nConfig.enabled,
      localeFolder,
      locales,
    },
    seoConfig: {
      siteName: parsedArgs.seoConfig?.siteName || 'My Blog',
      siteUrl: parsedArgs.seoConfig?.siteUrl || 'https://example.com',
      defaultAuthor: parsedArgs.seoConfig?.defaultAuthor || 'Your Name',
      twitterHandle: parsedArgs.seoConfig?.twitterHandle || '',
    },
  };
}

