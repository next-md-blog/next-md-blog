/**
 * Postal address (Schema.org PostalAddress).
 */
export interface PostalAddress {
  streetAddress?: string;
  addressLocality?: string;
  addressRegion?: string;
  postalCode?: string;
  addressCountry?: string;
}

/**
 * Contact point (Schema.org ContactPoint). Used for Organization JSON-LD.
 */
export interface ContactPoint {
  email?: string;
  telephone?: string;
  /** e.g. "customer support", "sales", "press". */
  contactType?: string;
  /** ISO country codes (e.g. ["US", "FR"]) or region names. */
  areaServed?: string | string[];
  /** BCP-47 codes (e.g. ["en", "fr"]). */
  availableLanguage?: string | string[];
}

/**
 * Publisher / Organization fields for JSON-LD (extends siteName + siteUrl).
 */
export interface SiteOrganization {
  /** Override JSON-LD @id (default: `${origin}/#organization`) */
  id?: string;
  legalName?: string;
  description?: string;
  /** Absolute URL of the logo image */
  logo?: string;
  /** Official profiles (Schema.org sameAs) */
  sameAs?: string[];
  /** ISO date string. */
  foundingDate?: string;
  /** Founder name (rendered as Person). */
  founder?: string;
  /** PostalAddress fields. */
  address?: PostalAddress;
  /** ContactPoint fields. */
  contactPoint?: ContactPoint;
  /** Wikidata entity URL (e.g. https://www.wikidata.org/wiki/Q1234567). Auto-merged into sameAs. */
  wikidata?: string;
}

/**
 * Blog configuration
 */
export interface Config {
  /** Site name */
  siteName?: string;
  /** Default site URL */
  siteUrl?: string;
  /** Default author name */
  defaultAuthor?: string;
  /** Array of author objects with detailed information */
  authors?: Author[];
  /** Twitter handle */
  twitterHandle?: string;
  /** Default OG image URL */
  defaultOgImage?: string;
  /** Default language code */
  defaultLang?: string;
  /** Alternate language URLs for hreflang (e.g., { 'en': 'https://example.com/blog/post', 'fr': 'https://example.com/fr/blog/post' }) */
  alternateLanguages?: Record<string, string>;
  /** Path segment for post URLs when no canonicalUrl (default: `blog` → `/blog/{slug}`) */
  blogPostPathSegment?: string;
  /** Absolute or site-relative URL for the blog index in default breadcrumbs (default: `{siteUrl}/blogs`) */
  blogIndexPath?: string;
  /** Rich Organization / publisher JSON-LD */
  organization?: SiteOrganization;
}

/**
 * Author information
 */
export interface Author {
  name: string;
  email?: string;
  bio?: string;
  avatar?: string;
  twitter?: string;
  github?: string;
  url?: string;
}

/**
 * Frontmatter metadata for blog posts
 */
export interface BlogPostFrontmatter {
  title?: string;
  date?: string;
  description?: string;
  /** Author can be a string, an object with name property (Quarto format), or an array of either */
  author?: string | { name: string; [key: string]: unknown } | (string | { name: string; [key: string]: unknown })[];
  /** Authors can be an array of strings or objects with name property */
  authors?: (string | { name: string; [key: string]: unknown })[];
  tags?: string[];
  /** Custom OG image URL */
  ogImage?: string;
  /** Featured image URL (fallback for OG image) */
  image?: string;
  /** Robots meta directive (e.g., 'noindex, nofollow' or 'index, follow') */
  robots?: string;
  /** Whether to exclude from search engine indexing */
  noindex?: boolean;
  /** Whether to exclude from following links */
  nofollow?: boolean;
  /** Reading time in minutes (auto-calculated if not provided) */
  readingTime?: number;
  /** Per-post hreflang map (overrides config.alternateLanguages for this post) */
  alternateLanguages?: Record<string, string>;
  /** Last-updated date. Drives `dateModified` in JSON-LD and `lastmod` in sitemaps. */
  updated?: string;
  /** Topic-cluster identifier. Posts sharing the same series belong to the same pillar. */
  series?: string;
  /** Display name for the series pillar page (defaults to humanized series slug). */
  seriesTitle?: string;
  /** Sort order within a series (lower first). Falls back to date when absent. */
  seriesOrder?: number;
  /** E-E-A-T: editor / reviewer who validated the post. */
  reviewedBy?: string;
  /** E-E-A-T: fact-checker. */
  factCheckedBy?: string;
  /** E-E-A-T: date of last editorial review (yyyy-mm-dd). */
  lastReviewed?: string;
  /**
   * FAQ items rendered as Schema.org `FAQPage` JSON-LD alongside the article.
   * Each item becomes a `Question` + `Answer` pair. Empty array is ignored.
   */
  faq?: FaqItem[];
  /**
   * HowTo data rendered as Schema.org `HowTo` JSON-LD alongside the article.
   * `steps` is required (≥ 1); everything else is optional.
   */
  howto?: HowToFrontmatter;
  [key: string]: unknown;
}

/** A single FAQ entry (mapped to Schema.org Question + Answer). */
export interface FaqItem {
  question: string;
  answer: string;
}

/** Schema.org HowTo as a frontmatter-friendly shape. */
export interface HowToFrontmatter {
  /** Defaults to post title. */
  name?: string;
  /** Defaults to post description. */
  description?: string;
  /** ISO 8601 duration (e.g. `PT15M`). */
  totalTime?: string;
  /** Optional cost block. */
  estimatedCost?: { currency: string; value: string | number };
  /** Materials, ingredients, prerequisites. */
  supply?: string[];
  /** Tools / software needed. */
  tool?: string[];
  /** Free-form yield (e.g. "Serves 4", "1 deployed site"). */
  yield?: string;
  /** Result image URL. */
  image?: string;
  /** Step list — Google requires at least one. */
  steps: HowToStepFrontmatter[];
}

export interface HowToStepFrontmatter {
  name: string;
  text: string;
  /** Step image URL (recommended for richer SERP cards). */
  image?: string;
  /** Anchor URL to the corresponding section within the post. */
  url?: string;
}

/**
 * Complete blog post with content and metadata
 */
export interface BlogPost {
  /** The slug identifier for the post (filename without extension) */
  slug: string;
  /** The markdown content of the post */
  content: string;
  /** Frontmatter metadata parsed from the markdown file */
  frontmatter: BlogPostFrontmatter;
  /** Reading time in minutes (auto-calculated) */
  readingTime: number;
  /** Word count (auto-calculated) */
  wordCount: number;
  /** Normalized authors array (string or Author objects) */
  authors: (string | Author)[];
}

/**
 * Blog post metadata without content (for listings)
 */
export interface BlogPostMetadata {
  /** The slug identifier for the post */
  slug: string;
  /** Frontmatter metadata parsed from the markdown file */
  frontmatter: BlogPostFrontmatter;
  /** Normalized authors array (string or Author objects) */
  authors: (string | Author)[];
}

/**
 * Options for reading blog posts
 */
export interface GetBlogPostOptions {
  /** Custom path to posts directory */
  postsDir?: string;
  /** Locale code for multi-language support (e.g., 'en', 'fr') */
  locale?: string;
  /** Blog configuration for author resolution */
  config?: Config;
}

/**
 * Result of file system operations
 */
export interface FileSystemResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
}
