# next-md-blog documentation (Nextra)

Next.js 16 + Nextra 4 docs theme. Content is MDX under **`content/`** in this **`docs/`** folder at the repo root.

**Production:** [https://www.next-md-blog.com](https://www.next-md-blog.com) · **Demos:** [demo.next-md-blog.com](https://demo.next-md-blog.com) (single locale) · [demo.i18n.next-md-blog.com](https://demo.i18n.next-md-blog.com) (i18n) · **GitHub:** [next-md-blog/next-md-blog](https://github.com/next-md-blog/next-md-blog)

**Vercel templates:** single locale — [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnext-md-blog%2Fnext-md-blog%2Ftree%2Fmain%2Ftemplates%2Fsingle%2F) · i18n — [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnext-md-blog%2Fnext-md-blog%2Ftree%2Fmain%2Ftemplates%2Fi18n)

## Local

```bash
git clone https://github.com/next-md-blog/next-md-blog.git
cd next-md-blog
pnpm install
pnpm dev:docs
```

[http://localhost:5101](http://localhost:5101)

## Production build

```bash
pnpm build:docs
```

## Vercel

This package is part of a **pnpm workspace**. Install must run at the **monorepo root** so dependencies resolve.

1. Prefer setting the Vercel **root directory** to the **repository root**, then:
   - **Build command:** `pnpm --filter next-md-blog-docs run build`
   - **Install command:** `pnpm install`
2. If the Vercel project root is **`docs/`** instead, set **Install command** to `cd .. && pnpm install` so the workspace lockfile is used.

See the [Deployment](content/deployment.mdx) page in the built site for narrative instructions.
