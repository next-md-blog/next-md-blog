#!/usr/bin/env node

import { parseArgs } from './args.js';
import {
  collectInteractiveConfig,
  collectInteractiveSeoConfig,
  createNonInteractiveConfig,
  closeReadline,
} from './prompts.js';
import {
  createConfigFile,
  createContentDir,
  createNextJSRoutes,
  writeAppSeoFiles,
  installNextMdBlog,
  installTailwindTypography,
  installVercelOg,
  updateGlobalsCss,
} from './file-operations.js';

type CliCommand = 'init' | 'seo';

/**
 * Main CLI entry point
 */
async function main() {
  try {
    const rawArgv = process.argv.slice(2);
    let command: CliCommand = 'init';
    if (rawArgv[0] === 'seo') {
      command = 'seo';
      rawArgv.shift();
    }

    const parsedArgs = parseArgs(rawArgv);
    const isNonInteractive = parsedArgs.nonInteractive || process.env.CI === 'true';

    // Debug: log parsed args (can be removed later)
    if (process.env.DEBUG) {
      console.log('Parsed args:', JSON.stringify(parsedArgs, null, 2));
      console.log('isNonInteractive:', isNonInteractive);
      console.log('command:', command);
    }

    if (command === 'seo') {
      const config = isNonInteractive
        ? createNonInteractiveConfig(parsedArgs)
        : await collectInteractiveSeoConfig(parsedArgs);
      console.log('\n--- SEO routes ---\n');
      writeAppSeoFiles(config, { force: parsedArgs.force === true });
      console.log('\n✅ SEO files ready (sitemap.ts, robots.ts, feed.xml/route.ts).');
      return;
    }

    // Default: full init
    const config = isNonInteractive
      ? createNonInteractiveConfig(parsedArgs)
      : await collectInteractiveConfig(parsedArgs);

    console.log('\n--- Creating Files ---\n');

    // Create all files
    createConfigFile(config);
    createContentDir(config);
    createNextJSRoutes(config, { force: parsedArgs.force === true });
    
    // Install dependencies and update globals.css
    installNextMdBlog();
    installTailwindTypography();
    if (config.createOgImage) {
      installVercelOg();
    }
    updateGlobalsCss();
    
    // Print success message and next steps
    console.log('\n✅ Setup complete!');
    console.log('\nNext steps:');
    if (config.createBlogPages) {
      console.log(`1. Review and customize SEO settings in next-md-blog.config.ts`);
      if (config.createOgImage) {
        console.log(`2. Customize the OG image component in app/${config.blogRoute}/[slug]/opengraph-image.tsx`);
        console.log(`3. Add your markdown files to the ${config.contentDir}/ folder`);
        console.log(`4. Visit /${config.blogRoute}/[slug] to see your posts`);
        console.log(`5. Visit /${config.blogsRoute} to see all posts`);
      } else {
        console.log(`2. Add your markdown files to the ${config.contentDir}/ folder`);
        console.log(`3. Visit /${config.blogRoute}/[slug] to see your posts`);
        console.log(`4. Visit /${config.blogsRoute} to see all posts`);
      }
    } else {
      console.log(`1. Review and customize SEO settings in next-md-blog.config.ts`);
      console.log(`2. Add your markdown files to the ${config.contentDir}/ folder`);
      console.log(`3. Use the library functions in your own components`);
    }
  } catch (error) {
    console.error('Error during setup:', error);
    process.exit(1);
  } finally {
    closeReadline();
  }
}

void main();
