import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get the path to the templates directory
 * Works both in development and when installed as a package
 * Templates are copied to dist/templates during build
 * @returns Path to templates directory
 */
export function getTemplatesDir(): string {
  // When compiled: __dirname points to dist/, so templates are at dist/templates
  // In development: __dirname points to src/, so templates are at src/templates
  const templatesPath = path.join(__dirname, 'templates');
  
  // If templates don't exist at the expected location (development case),
  // try the parent directory (for when running from dist/)
  if (!fs.existsSync(templatesPath)) {
    const parentTemplatesPath = path.join(__dirname, '..', 'templates');
    if (fs.existsSync(parentTemplatesPath)) {
      return parentTemplatesPath;
    }
  }
  
  return templatesPath;
}

/**
 * Load a template file and replace placeholders with actual values
 * @param templateName - Name of the template file
 * @param replacements - Object mapping placeholder names to values
 * @returns Template content with placeholders replaced
 * @throws {Error} If template file is not found
 */
export function loadTemplate(templateName: string, replacements: Record<string, string>): string {
  const templatesDir = getTemplatesDir();
  const templatePath = path.join(templatesDir, templateName);
  
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template file not found: ${templatePath}`);
  }
  
  let content = fs.readFileSync(templatePath, 'utf-8');
  
  // Replace all placeholders
  for (const [key, value] of Object.entries(replacements)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    content = content.replace(regex, value);
  }
  
  return content;
}

/**
 * Generate example blog post content
 * @param contentDir - Content directory name
 * @param locale - Optional locale code for locale-specific templates
 * @returns Example post markdown content
 */
export function generateExamplePost(contentDir: string, locale?: string): string {
  // Use locale-specific template if available, otherwise fall back to default
  const templateName = locale && locale !== 'en' 
    ? `example-post.${locale}.md`
    : 'example-post.md';
  
  // Check if locale-specific template exists, otherwise use default
  const templatesDir = getTemplatesDir();
  const localeTemplatePath = path.join(templatesDir, templateName);
  
  const finalTemplateName = fs.existsSync(localeTemplatePath) 
    ? templateName 
    : 'example-post.md';
  
  return loadTemplate(finalTemplateName, {
    CONTENT_DIR: contentDir,
  });
}

