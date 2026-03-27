# Quick Start - Testing Locally

**Documentation:** [www.next-md-blog.com](https://www.next-md-blog.com) · **Demos:** [demo.next-md-blog.com](https://demo.next-md-blog.com) (single) · [demo.i18n.next-md-blog.com](https://demo.i18n.next-md-blog.com) (i18n) · **Source:** [github.com/next-md-blog/next-md-blog](https://github.com/next-md-blog/next-md-blog)

**Vercel templates (end users):** single locale — [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnext-md-blog%2Fnext-md-blog%2Ftree%2Fmain%2Ftemplates%2Fsingle%2F) · i18n — [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnext-md-blog%2Fnext-md-blog%2Ftree%2Fmain%2Ftemplates%2Fi18n)

Clone the monorepo (if you have not already):

```bash
git clone https://github.com/next-md-blog/next-md-blog.git
cd next-md-blog
```

## 🚀 Quick Test (3 Steps)

### 1. Build the Library
```bash
# From the root directory
pnpm run build
```

### 2. Install demo dependencies
```bash
# Navigate to the single-locale demo
cd demos/single
pnpm install
```

### 3. Run the demo app
```bash
# Still in the demo directory
pnpm run dev
```

Then open the URL printed in the terminal (the demo may use a non-default port). 🎉

## 📝 What You'll See

- **Home page** (`/`) - Overview and quick start guide
- **All posts** (`/blogs`) - List of all blog posts
- **Individual posts** (`/blog/welcome`, `/blog/getting-started`, etc.)

## 🌍 i18n demo

To test the i18n demo:

```bash
# From root directory
cd demos/i18n
pnpm install
pnpm run dev
```

Then visit the URLs shown in the terminal for locale routes (for example `/en/blog/welcome`, `/fr/blog/welcome`, and `/en/blogs` or `/fr/blogs`).

## 🔄 Development Workflow

When you make changes to the library:

1. **Rebuild the library:**
   ```bash
   # From root directory
   pnpm run build
   ```

2. **Restart the demo dev server** (if it's running, stop and restart)

## 🎨 Styling Notes

The demos use:
- **Tailwind CSS v4** with OKLCH colors
- **@tailwindcss/typography** plugin for markdown styling
- **Light & dark mode** support with `next-themes`
- **shadcn/ui** components for UI elements

See the main [README.md](../README.md) for detailed styling setup instructions.

## 🧪 Testing the CLI

You can also test the CLI initialization tool:

```bash
# From root directory (after building)
cd /path/to/a/test/nextjs-project
npx ../next-md-blog/dist/cli.js
```

## 📚 More Info

See [testing.md](./testing.md) for detailed testing instructions and troubleshooting.
