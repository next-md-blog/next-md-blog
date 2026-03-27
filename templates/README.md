# Vercel templates (standalone apps)

These folders are **flat Next.js apps** meant to be published as **separate GitHub repositories** for one-click deploy.

**Single locale** ([next-md-blog/template](https://github.com/next-md-blog/template))

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnext-md-blog%2Fnext-md-blog%2Ftree%2Fmain%2Ftemplates%2Fsingle%2F)

**i18n** ([next-md-blog/template-i18n](https://github.com/next-md-blog/template-i18n))

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnext-md-blog%2Fnext-md-blog%2Ftree%2Fmain%2Ftemplates%2Fi18n)

| Directory    | Intended GitHub repo              | `@next-md-blog/core` |
| ------------ | --------------------------------- | -------------------- |
| `single/`    | `github.com/next-md-blog/template` | npm semver           |
| `i18n/`      | `github.com/next-md-blog/template-i18n` | npm semver      |

Each folder matches the in-repo demo under `demos/single` or `demos/i18n`, but depends on the published core package instead of `workspace:*`.

Each template includes **`pnpm-workspace.yaml`** listing only `.` so `pnpm` treats the folder as its own workspace root (needed when the monorepo lives above it, and harmless in a standalone clone).

## Publishing to GitHub

Create empty repositories **`next-md-blog/template`** and **`next-md-blog/template-i18n`**, then push the contents of **`templates/single`** or **`templates/i18n`** respectively (for example: copy the folder into a fresh clone, or `git subtree split`). The **Deploy to Vercel** links in each template README assume these repository names.

## Sync from demos

After changing `demos/single` or `demos/i18n`, run from the monorepo root:

```bash
node scripts/sync-templates.mjs
```

Then review diffs, update semver in `templates/*/package.json` if you cut a new `@next-md-blog/core` release, and push the standalone repos if you mirror them on GitHub.

SEO in templates follows Next.js **`app/sitemap.ts`**, **`app/robots.ts`**, and optional **`app/feed.xml/route.ts`** (see `@next-md-blog/core/next`).
