# next-md-blog single-locale demo

This is a single-locale Next.js demo application for the `next-md-blog` library.

## Features Demonstrated

- ✅ Dynamic blog routes (`/blog/[slug]`)
- ✅ Blog listing page (`/blogs`)
- ✅ Markdown rendering with frontmatter
- ✅ TypeScript support
- ✅ Static site generation (SSG)
- ✅ SEO optimization with metadata generation
- ✅ OG image generation
- ✅ Beautiful UI with shadcn/ui components
- ✅ Dark mode support
- ✅ Responsive design

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Explore the demo

- **Home Page**: `/` - Overview and quick start guide
- **All Posts**: `/blogs` - List of all blog posts
- **Individual Posts**: `/blog/welcome`, `/blog/getting-started`, etc.

## Project Structure

```
demos/single/
├── app/
│   ├── blog/
│   │   └── [slug]/
│   │       └── page.tsx      # Dynamic blog post page
│   ├── blogs/
│   │   └── page.tsx           # Blog listing page
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Home page
│   └── globals.css            # Global styles
├── posts/                     # Blog posts (markdown files)
│   ├── welcome.md
│   ├── getting-started.md
│   └── markdown-features.md
└── package.json
```

## Adding Your Own Posts

1. Create a new `.md` file in the `posts/` folder
2. Add frontmatter at the top:

```markdown
---
title: "My Post Title"
date: "2024-01-15"
description: "A description of my post"
author: "Your Name"
tags: ["tag1", "tag2"]
---

# My Post Title

Your content here...
```

3. The post will automatically be available at `/blog/[filename]`

## Customization

### Styling

The demo uses **Tailwind CSS v4** with **OKLCH colors** and the **@tailwindcss/typography** plugin for styling. You can customize:

- **Global Styles**: `app/globals.css` - Tailwind v4 configuration with OKLCH color variables
- **Theme Colors**: Update CSS variables in `:root` and `.dark` selectors in `globals.css` to change the color scheme
- **Components**: Modify shadcn/ui components in `components/ui/`
- **Markdown Styling**: Uses `@tailwindcss/typography` plugin - apply `prose` classes for automatic markdown styling
- **PostCSS Config**: `postcss.config.mjs` - Configured for Tailwind CSS v4 with `@tailwindcss/postcss`

#### Color System

The demo uses OKLCH color format (Tailwind CSS v4's default) for better color consistency:

```css
:root {
  --background: oklch(1 0 0);        /* White */
  --foreground: oklch(0.145 0 0);    /* Dark gray */
  --primary: hsl(142 76% 36%);        /* Green (can mix HSL/OKLCH) */
  /* ... */
}
```

#### Theme Toggle

The demo includes a theme toggle component that cycles through:
- **Light mode** → **Dark mode** → **System** (follows OS preference)

### Layout

Modify the layout in:
- `app/layout.tsx` - Root layout with theme provider
- `app/blog/[slug]/page.tsx` - Blog post page layout with SEO
- `app/blogs/page.tsx` - Blog listing page layout

### SEO Configuration

Update SEO settings in `app/blog/[slug]/page.tsx`:

```tsx
const SEO_CONFIG = {
  siteName: 'Your Blog Name',
  siteUrl: 'https://yourdomain.com',
  defaultAuthor: 'Your Name',
  twitterHandle: '@yourhandle',
  // OG images are automatically generated via opengraph-image.tsx file convention
};
```

### OG Images

Customize OG images in `app/blog/[slug]/opengraph-image.tsx`:
- Change colors, fonts, and layout
- Add your logo
- Modify the design to match your brand

## Learn More

- [next-md-blog Documentation](../README.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [Markdown Guide](https://www.markdownguide.org/)

