/**
 * Appended to globals.css by next-md-blog-init when missing.
 * Matches demo/template tokens so utilities like bg-background and text-primary work.
 */
export const NEXT_MD_BLOG_THEME_MARKER = '/* next-md-blog theme';

export const NEXT_MD_BLOG_THEME_CSS = `
/* next-md-blog theme — keep for starter utilities (bg-background, text-primary, …) */
:root {
  --background: oklch(0.99 0.002 285);
  --foreground: oklch(0.18 0.02 285);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.18 0.02 285);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.18 0.02 285);
  --primary: oklch(0.52 0.14 155);
  --primary-foreground: oklch(0.99 0.01 155);
  --secondary: oklch(0.96 0.008 285);
  --secondary-foreground: oklch(0.28 0.02 285);
  --muted: oklch(0.96 0.006 285);
  --muted-foreground: oklch(0.48 0.02 285);
  --accent: oklch(0.95 0.012 285);
  --accent-foreground: oklch(0.28 0.02 285);
  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: oklch(0.985 0 0);
  --border: oklch(0.91 0.008 285);
  --input: oklch(0.91 0.008 285);
  --ring: oklch(0.52 0.14 155);
  --radius: 0.625rem;
}

.dark {
  --background: oklch(0.16 0.02 285);
  --foreground: oklch(0.96 0.008 285);
  --card: oklch(0.2 0.022 285);
  --card-foreground: oklch(0.96 0.008 285);
  --popover: oklch(0.2 0.022 285);
  --popover-foreground: oklch(0.96 0.008 285);
  --primary: oklch(0.62 0.14 155);
  --primary-foreground: oklch(0.14 0.03 155);
  --secondary: oklch(0.26 0.02 285);
  --secondary-foreground: oklch(0.94 0.01 285);
  --muted: oklch(0.26 0.02 285);
  --muted-foreground: oklch(0.68 0.02 285);
  --accent: oklch(0.28 0.025 285);
  --accent-foreground: oklch(0.96 0.008 285);
  --destructive: oklch(0.396 0.141 25.723);
  --destructive-foreground: oklch(0.637 0.237 25.331);
  --border: oklch(0.32 0.02 285);
  --input: oklch(0.32 0.02 285);
  --ring: oklch(0.62 0.14 155);
}

@theme {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --radius: var(--radius);
  --font-sans: ui-sans-serif, system-ui, sans-serif;
  --font-mono: ui-monospace, monospace;
}

@layer base {
  body {
    background-color: var(--background);
    color: var(--foreground);
    font-family: var(--font-sans);
    background-image: radial-gradient(
      ellipse 100% 70% at 50% -25%,
      oklch(0.72 0.1 155 / 0.14),
      transparent 55%
    );
    background-attachment: fixed;
  }
  .dark body {
    background-image: radial-gradient(
      ellipse 100% 70% at 50% -25%,
      oklch(0.42 0.08 155 / 0.22),
      transparent 55%
    );
  }
}
`.trimStart();
