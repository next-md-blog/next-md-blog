/**
 * Validation utilities for CLI inputs
 * Prevents path traversal, injection attacks, and invalid inputs
 */

/**
 * Validates and sanitizes a path string
 * @param pathValue - The path to validate
 * @param allowAbsolute - Whether to allow absolute paths (default: false)
 * @param allowPathSeparators - Whether to allow path separators (default: true for contentDir, false for routes)
 * @returns Validated and normalized path
 * @throws {Error} If path is invalid
 */
export function validatePath(
  pathValue: string,
  allowAbsolute: boolean = false,
  allowPathSeparators: boolean = true
): string {
  if (!pathValue || typeof pathValue !== 'string') {
    throw new Error('Path must be a non-empty string');
  }

  // Prevent null bytes first (most critical security issue)
  if (pathValue.includes('\0')) {
    throw new Error('Path cannot contain null bytes');
  }

  // Check for other control characters before trimming (trim removes whitespace)
  if (/[\x01-\x1F\x7F]/.test(pathValue)) {
    throw new Error('Path cannot contain control characters');
  }

  const trimmed = pathValue.trim();
  
  if (trimmed.length === 0) {
    throw new Error('Path cannot be empty or whitespace');
  }

  // Prevent directory traversal
  if (trimmed.includes('..')) {
    throw new Error('Path cannot contain directory traversal sequences (..)');
  }

  // Prevent absolute paths unless allowed
  if (!allowAbsolute && (trimmed.startsWith('/') || trimmed.match(/^[A-Za-z]:/))) {
    throw new Error('Absolute paths are not allowed');
  }

  // Prevent path separators if not allowed (for route names)
  if (!allowPathSeparators && (trimmed.includes('/') || trimmed.includes('\\'))) {
    throw new Error('Path cannot contain path separators');
  }

  return trimmed;
}

/**
 * Validates a route name (blog route, blogs route, etc.)
 * Route names should be URL-safe and not contain path separators
 * @param routeName - The route name to validate
 * @returns Validated route name
 * @throws {Error} If route name is invalid
 */
export function validateRouteName(routeName: string): string {
  if (!routeName || typeof routeName !== 'string') {
    throw new Error('Route name must be a non-empty string');
  }

  const trimmed = routeName.trim();
  
  if (trimmed.length === 0) {
    throw new Error('Route name cannot be empty or whitespace');
  }

  // Prevent directory traversal first (before regex check)
  if (trimmed.includes('..')) {
    throw new Error('Route name cannot contain directory traversal sequences');
  }

  // Prevent null bytes
  if (trimmed.includes('\0')) {
    throw new Error('Route name cannot contain null bytes');
  }

  // Route names should be URL-safe: alphanumeric, hyphens, underscores only
  // Allow brackets for Next.js dynamic routes like [slug] or [locale]
  const routeNameRegex = /^[a-zA-Z0-9_\-\[\]]+$/;
  
  if (!routeNameRegex.test(trimmed)) {
    throw new Error('Route name can only contain alphanumeric characters, hyphens, underscores, and brackets');
  }

  return trimmed;
}

/**
 * Validates a locale code
 * Locale codes should follow BCP 47 format (e.g., 'en', 'en-US', 'fr-CA')
 * @param locale - The locale code to validate
 * @returns Validated locale code
 * @throws {Error} If locale is invalid
 */
export function validateLocale(locale: string): string {
  if (!locale || typeof locale !== 'string') {
    throw new Error('Locale must be a non-empty string');
  }

  // Prevent null bytes first (most critical security issue)
  if (locale.includes('\0')) {
    throw new Error('Locale cannot contain null bytes');
  }

  // Check for other control characters before trimming (trim removes whitespace)
  if (/[\x01-\x1F\x7F]/.test(locale)) {
    throw new Error('Locale cannot contain control characters');
  }

  const trimmed = locale.trim();
  
  if (trimmed.length === 0) {
    throw new Error('Locale cannot be empty or whitespace');
  }

  // Prevent directory traversal
  if (trimmed.includes('..')) {
    throw new Error('Locale cannot contain directory traversal sequences');
  }

  // Prevent path separators
  if (trimmed.includes('/') || trimmed.includes('\\')) {
    throw new Error('Locale cannot contain path separators');
  }

  // Basic BCP 47 format validation: language[-script][-region]
  // Allow: en, en-US, fr, fr-CA, zh-Hans, etc.
  // Pattern: 2-3 letter language code, optional script (4 letters), optional region (2-3 letters or 3 digits)
  const localeRegex = /^[a-z]{2,3}(-[A-Z][a-z]{3})?(-[A-Z]{2,3}|-[0-9]{3})?$/i;
  
  if (!localeRegex.test(trimmed)) {
    // Allow common variations and warn, but don't fail
    // Some valid locales might not match strict BCP 47 (e.g., 'en-GB-x-private')
    // So we'll be lenient but log a warning
    console.warn(`Warning: Locale "${trimmed}" may not follow BCP 47 format. Use format like 'en', 'en-US', or 'fr-CA'`);
  }

  return trimmed.toLowerCase();
}

/**
 * Validates an array of locale codes
 * @param locales - Array of locale codes to validate
 * @returns Array of validated locale codes
 * @throws {Error} If any locale is invalid
 */
export function validateLocales(locales: string[]): string[] {
  if (!Array.isArray(locales)) {
    throw new Error('Locales must be an array');
  }

  if (locales.length === 0) {
    return [];
  }

  return locales.map((locale, index) => {
    try {
      return validateLocale(locale);
    } catch (error) {
      throw new Error(`Invalid locale at index ${index}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
}

/**
 * Validates a locale folder name (e.g., '[locale]')
 * @param localeFolder - The locale folder name to validate
 * @returns Validated locale folder name
 * @throws {Error} If locale folder name is invalid
 */
export function validateLocaleFolder(localeFolder: string): string {
  // Locale folder can be a route name (like [locale]) or a simple folder name
  // So we use route name validation
  return validateRouteName(localeFolder);
}

