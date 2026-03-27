# next-md-blog — i18n template

Multi-locale [Next.js](https://nextjs.org) blog using [`@next-md-blog/core`](https://www.npmjs.com/package/@next-md-blog/core), locale segments, translated post folders, and [shadcn/ui](https://ui.shadcn.com)-style components.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnext-md-blog%2Fnext-md-blog%2Ftree%2Fmain%2Ftemplates%2Fi18n)

## Deploy on Vercel

1. Click **Deploy with Vercel** (or import this repo in the Vercel dashboard).
2. After the first deploy, set **`NEXT_PUBLIC_SITE_URL`** to your production URL in **Project → Settings → Environment Variables**, then redeploy.

## Local development

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and try routes such as `/en/blogs` and `/fr/blogs`.

## Monorepo source

This tree is maintained from the [next-md-blog](https://github.com/next-md-blog/next-md-blog) monorepo under `templates/i18n` (development twin: `demos/i18n` with `workspace:*`). The **`pnpm-workspace.yaml`** here scopes installs to this folder only. For documentation see [next-md-blog.com](https://www.next-md-blog.com).

## License

MIT
