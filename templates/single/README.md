# next-md-blog — single-locale template

One-locale [Next.js](https://nextjs.org) blog using [`@next-md-blog/core`](https://www.npmjs.com/package/@next-md-blog/core), [Tailwind CSS v4](https://tailwindcss.com), and [shadcn/ui](https://ui.shadcn.com)-style components.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnext-md-blog%2Fnext-md-blog%2Ftree%2Fmain%2Ftemplates%2Fsingle%2F)

## Deploy on Vercel

1. Click **Deploy with Vercel** (or import this repo in the Vercel dashboard).
2. After the first deploy, open **Project → Settings → Environment Variables** and set **`NEXT_PUBLIC_SITE_URL`** to your production URL (for example `https://your-project.vercel.app`), then redeploy.

## Local development

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Monorepo source

This tree is maintained from the [next-md-blog](https://github.com/next-md-blog/next-md-blog) monorepo under `templates/single` (development twin: `demos/single` with `workspace:*`). The **`pnpm-workspace.yaml`** here scopes installs to this folder only. For documentation see [next-md-blog.com](https://www.next-md-blog.com).

## License

MIT
