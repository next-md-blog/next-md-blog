import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import type { CLIConfig } from './types.js';
import { generateExamplePost } from './templates.js';
import {
  generateBlogPage,
  generateBlogsPage,
  generateOgImage,
  generatePagesRouterBlogPage,
  generatePagesRouterBlogsPage,
  generateConfigFile,
  generateAppSitemap,
  generateAppRobots,
  generateAppFeedRoute,
} from './generators.js';
import { NEXT_MD_BLOG_THEME_CSS, NEXT_MD_BLOG_THEME_MARKER } from './next-md-blog-theme-snippet.js';

/**
 * Create the next-md-blog config file
 * @param config - CLI configuration
 */
export function createConfigFile(config: CLIConfig): void {
  const configPath = path.join(process.cwd(), 'next-md-blog.config.ts');
  
  if (!fs.existsSync(configPath)) {
    try {
      fs.writeFileSync(configPath, generateConfigFile(config));
      console.log(`✓ Created next-md-blog.config.ts`);
    } catch (error) {
      console.error(`✗ Failed to create next-md-blog.config.ts:`, error);
      throw error;
    }
  } else {
    console.log(`⚠ next-md-blog.config.ts already exists, skipping`);
  }
}

/**
 * Create content directory and example posts
 * @param config - CLI configuration
 */
export function createContentDir(config: CLIConfig): void {
  const { contentDir, createExamplePost, i18n } = config;
  const contentPath = path.join(process.cwd(), contentDir);
  
  if (!fs.existsSync(contentPath)) {
    fs.mkdirSync(contentPath, { recursive: true });
    console.log(`✓ Created ${contentDir} directory`);
  } else {
    console.log(`✓ ${contentDir} directory already exists`);
  }
  
  if (i18n.enabled && i18n.locales.length > 0) {
    // Create locale folders and example posts for each locale
    for (const locale of i18n.locales) {
      const localePath = path.join(contentPath, locale);
      if (!fs.existsSync(localePath)) {
        fs.mkdirSync(localePath, { recursive: true });
        console.log(`✓ Created ${contentDir}/${locale} directory`);
      } else {
        console.log(`✓ ${contentDir}/${locale} directory already exists`);
      }
      
      if (createExamplePost) {
        const examplePath = path.join(localePath, 'welcome.md');
        if (!fs.existsSync(examplePath)) {
          fs.writeFileSync(examplePath, generateExamplePost(contentDir, locale));
          console.log(`✓ Created example blog post: ${contentDir}/${locale}/welcome.md`);
        } else {
          console.log(`⚠ ${contentDir}/${locale}/welcome.md already exists, skipping`);
        }
      }
    }
  } else {
    // Single language: create example post in root content directory
    if (createExamplePost) {
      const examplePath = path.join(contentPath, 'welcome.md');
      if (!fs.existsSync(examplePath)) {
        fs.writeFileSync(examplePath, generateExamplePost(contentDir));
        console.log(`✓ Created example blog post: ${contentDir}/welcome.md`);
      } else {
        console.log(`⚠ ${contentDir}/welcome.md already exists, skipping`);
      }
    }
  }
}

/**
 * Resolve the Next.js App Router directory (`app/` or `src/app/`).
 */
export function findAppDirectory(cwd: string = process.cwd()): string | null {
  const rootApp = path.join(cwd, 'app');
  if (fs.existsSync(rootApp)) {
    return rootApp;
  }
  const srcApp = path.join(cwd, 'src', 'app');
  if (fs.existsSync(srcApp)) {
    return srcApp;
  }
  return null;
}

/**
 * Write `sitemap.ts`, `robots.ts`, and `feed.xml/route.ts` under the App Router root.
 */
export function writeAppSeoFiles(config: CLIConfig, options: { force: boolean }): void {
  const appDir = findAppDirectory();
  if (!appDir) {
    console.log(
      '⚠ Could not find app/ or src/app/. Run from your Next.js project root with App Router enabled.'
    );
    return;
  }

  const { force } = options;

  const writeFile = (filePath: string, content: string) => {
    const exists = fs.existsSync(filePath);
    if (exists && !force) {
      console.log(`⚠ ${filePath} already exists, skipping (use --force to overwrite)`);
      return;
    }
    fs.writeFileSync(filePath, content);
    console.log(`✓ ${exists ? 'Updated' : 'Created'} ${filePath}`);
  };

  writeFile(path.join(appDir, 'sitemap.ts'), generateAppSitemap(config));
  writeFile(path.join(appDir, 'robots.ts'), generateAppRobots());

  const feedDir = path.join(appDir, 'feed.xml');
  if (!fs.existsSync(feedDir)) {
    fs.mkdirSync(feedDir, { recursive: true });
  }
  writeFile(path.join(feedDir, 'route.ts'), generateAppFeedRoute(config));
}

/**
 * Create Next.js route files (App Router or Pages Router)
 * @param config - CLI configuration
 * @param options - Pass `force` to overwrite existing SEO route files
 */
export function createNextJSRoutes(config: CLIConfig, options?: { force?: boolean }): void {
  if (!config.createBlogPages) {
    console.log('⚠ Skipping blog page creation (disabled in configuration)');
    return;
  }

  const { blogRoute, blogsRoute, createOgImage, i18n } = config;
  const appDir = findAppDirectory();
  const pagesDir = path.join(process.cwd(), 'pages');
  const forceSeo = options?.force === true;

  // Check if using App Router (Next.js 13+)
  if (appDir) {
    // Determine base directory - if i18n is enabled, use [locale] folder
    const baseDir = i18n.enabled 
      ? path.join(appDir, i18n.localeFolder)
      : appDir;
    
    const blogDir = path.join(baseDir, blogRoute);
    const blogSlugDir = path.join(blogDir, '[slug]');
    
    // Create blog/[slug]/page.tsx
    if (!fs.existsSync(blogSlugDir)) {
      fs.mkdirSync(blogSlugDir, { recursive: true });
    }
    
    const blogPagePath = path.join(blogSlugDir, 'page.tsx');
    if (!fs.existsSync(blogPagePath)) {
      fs.writeFileSync(blogPagePath, generateBlogPage(config));
      console.log(`✓ Created ${blogPagePath}`);
    } else {
      console.log(`⚠ ${blogPagePath} already exists, skipping`);
    }
    
    // Create blogs/page.tsx
    const blogsDir = path.join(baseDir, blogsRoute);
    if (!fs.existsSync(blogsDir)) {
      fs.mkdirSync(blogsDir, { recursive: true });
    }
    
    const blogsPagePath = path.join(blogsDir, 'page.tsx');
    if (!fs.existsSync(blogsPagePath)) {
      fs.writeFileSync(blogsPagePath, generateBlogsPage(config));
      console.log(`✓ Created ${blogsPagePath}`);
    } else {
      console.log(`⚠ ${blogsPagePath} already exists, skipping`);
    }
    
    // Create OG image using Next.js file convention
    if (createOgImage) {
      const ogImagePath = path.join(blogSlugDir, 'opengraph-image.tsx');
      if (!fs.existsSync(ogImagePath)) {
        fs.writeFileSync(ogImagePath, generateOgImage(config));
        console.log(`✓ Created ${ogImagePath}`);
      } else {
        console.log(`⚠ ${ogImagePath} already exists, skipping`);
      }
    }

    writeAppSeoFiles(config, { force: forceSeo });
  }
  // Check if using Pages Router
  else if (fs.existsSync(pagesDir)) {
    const blogDir = path.join(pagesDir, blogRoute);
    if (!fs.existsSync(blogDir)) {
      fs.mkdirSync(blogDir, { recursive: true });
    }
    
    const blogSlugPath = path.join(blogDir, '[slug].tsx');
    if (!fs.existsSync(blogSlugPath)) {
      fs.writeFileSync(blogSlugPath, generatePagesRouterBlogPage(config));
      console.log(`✓ Created ${blogSlugPath}`);
    } else {
      console.log(`⚠ ${blogSlugPath} already exists, skipping`);
    }
    
    const blogsPath = path.join(pagesDir, `${blogsRoute}.tsx`);
    if (!fs.existsSync(blogsPath)) {
      fs.writeFileSync(blogsPath, generatePagesRouterBlogsPage(config));
      console.log(`✓ Created ${blogsPath}`);
    } else {
      console.log(`⚠ ${blogsPath} already exists, skipping`);
    }
  } else {
    console.log('⚠ Could not find app/ or pages/ directory. Make sure you are in a Next.js project root.');
  }
}

/**
 * Install @next-md-blog/core package
 */
export function installNextMdBlog(): void {
  try {
    console.log('\n--- Installing Dependencies ---\n');
    console.log('Installing @next-md-blog/core...');
    execSync('npm install @next-md-blog/core', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    console.log('✓ Installed @next-md-blog/core');
  } catch (error) {
    console.error('✗ Failed to install @next-md-blog/core:', error);
    console.log('⚠ You may need to install it manually: npm install @next-md-blog/core');
  }
}

/**
 * Install @tailwindcss/typography package
 */
export function installTailwindTypography(): void {
  try {
    console.log('Installing @tailwindcss/typography...');
    execSync('npm install @tailwindcss/typography', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    console.log('✓ Installed @tailwindcss/typography');
  } catch (error) {
    console.error('✗ Failed to install @tailwindcss/typography:', error);
    console.log('⚠ You may need to install it manually: npm install @tailwindcss/typography');
  }
}

/**
 * Install @vercel/og package
 */
export function installVercelOg(): void {
  try {
    console.log('Installing @vercel/og...');
    execSync('npm install @vercel/og', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    console.log('✓ Installed @vercel/og');
  } catch (error) {
    console.error('✗ Failed to install @vercel/og:', error);
    console.log('⚠ You may need to install it manually: npm install @vercel/og');
  }
}

/**
 * Find and update globals.css to add @tailwindcss/typography plugin and @custom-variant dark
 */
export function updateGlobalsCss(): void {
  // Common locations for globals.css
  const possiblePaths = [
    path.join(process.cwd(), 'app', 'globals.css'),
    path.join(process.cwd(), 'src', 'app', 'globals.css'),
    path.join(process.cwd(), 'styles', 'globals.css'),
    path.join(process.cwd(), 'src', 'styles', 'globals.css'),
  ];

  let globalsCssPath: string | null = null;
  for (const cssPath of possiblePaths) {
    if (fs.existsSync(cssPath)) {
      globalsCssPath = cssPath;
      break;
    }
  }

  if (!globalsCssPath) {
    console.log('⚠ Could not find globals.css file. Please add @plugin "@tailwindcss/typography"; and @custom-variant dark manually.');
    return;
  }

  try {
    let content = fs.readFileSync(globalsCssPath, 'utf-8');
    let modified = false;
    
    // Add @plugin "@tailwindcss/typography"; if not present
    if (!content.includes('@plugin "@tailwindcss/typography"')) {
      const importPattern = /(@import\s+"tailwindcss";)/;
      if (importPattern.test(content)) {
        content = content.replace(
          importPattern,
          '$1\n@plugin "@tailwindcss/typography";'
        );
        modified = true;
        console.log(`✓ Added @tailwindcss/typography plugin to ${globalsCssPath}`);
      } else {
        console.log(`⚠ Could not find @import "tailwindcss"; in ${globalsCssPath}. Please add @plugin "@tailwindcss/typography"; manually.`);
      }
    }

    // Add @custom-variant dark if not present
    if (!content.includes('@custom-variant dark')) {
      // Try to find the plugin line and add the custom variant after it
      const pluginPattern = /(@plugin\s+"@tailwindcss\/typography";)/;
      if (pluginPattern.test(content)) {
        // Add after the plugin line with a blank line
        content = content.replace(
          pluginPattern,
          '$1\n\n@custom-variant dark (&:is(.dark *));'
        );
        modified = true;
        console.log(`✓ Added @custom-variant dark to ${globalsCssPath}`);
      } else {
        // If plugin pattern not found, try to add after @import
        const importPattern = /(@import\s+"tailwindcss";)/;
        if (importPattern.test(content)) {
          content = content.replace(
            importPattern,
            '$1\n@plugin "@tailwindcss/typography";\n\n@custom-variant dark (&:is(.dark *));'
          );
          modified = true;
          console.log(`✓ Added @tailwindcss/typography plugin and @custom-variant dark to ${globalsCssPath}`);
        } else {
          // Add at the beginning of the file as last resort
          content = `@import "tailwindcss";\n@plugin "@tailwindcss/typography";\n\n@custom-variant dark (&:is(.dark *));\n\n${content}`;
          modified = true;
          console.log(`✓ Added @tailwindcss/typography plugin and @custom-variant dark to ${globalsCssPath}`);
        }
      }
    }

    if (!content.includes(NEXT_MD_BLOG_THEME_MARKER)) {
      content = `${content.trimEnd()}\n\n${NEXT_MD_BLOG_THEME_CSS}\n`;
      modified = true;
      console.log(`✓ Added next-md-blog theme tokens to ${globalsCssPath}`);
    }

    if (modified) {
      fs.writeFileSync(globalsCssPath, content);
    } else {
      console.log(`✓ globals.css already contains required configuration`);
    }
  } catch (error) {
    console.error(`✗ Failed to update ${globalsCssPath}:`, error);
  }
}

