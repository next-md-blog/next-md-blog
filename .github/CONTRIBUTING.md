# Contributing to next-md-blog

Thank you for your interest in contributing to next-md-blog! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/next-md-blog.git`  
   Or clone upstream directly: `git clone https://github.com/next-md-blog/next-md-blog.git`
3. Install dependencies: `pnpm install`
4. Build packages: `pnpm run build` (or `pnpm --filter './packages/*' -r run build` to skip docs)
5. Create a new branch: `git checkout -b feature/your-feature-name`

## Development

### Project Structure

```
next-md-blog/
├── packages/
│   ├── core/         # @next-md-blog/core
│   └── cli/          # @next-md-blog/cli
├── docs/             # Nextra documentation site (repo root)
├── demos/
│   ├── single/
│   └── i18n/
├── templates/
│   ├── single/       # Source for github.com/next-md-blog/template (Vercel)
│   └── i18n/         # Source for github.com/next-md-blog/template-i18n
└── package.json
```

### Building

```bash
pnpm run build
```

Builds **`packages/*`**, **`docs/`**, and both **demo** apps. For docs only, use **`pnpm build:docs`**.

### Development Mode

```bash
pnpm dev:core
pnpm dev:cli
pnpm dev:docs
```

Package `dev` scripts run TypeScript in watch mode where applicable.

### Monorepo scripts (reference)

Run from the **repository root** after `pnpm install`:

| Command | Description |
| --- | --- |
| `pnpm dev:docs` | Nextra docs dev server (see `docs/package.json` for port, often `5101`) |
| `pnpm dev:demo` | Single-locale demo (`demos/single`) |
| `pnpm dev:demo:i18n` | i18n demo (`demos/i18n`) |
| `pnpm build:docs` | Production build for `docs/` |
| `pnpm build` | Build `packages/*`, `docs/`, and both demo apps (`demos/single`, `demos/i18n`) |
| `pnpm check` | `lint` + `typecheck` + `test` + `build` (CI-style gate) |
| `pnpm test` | Vitest in `packages/core` and `packages/cli` only (`docs/` has no test script) |
| `pnpm lint` | ESLint: `packages/cli`, `packages/core`, `docs/`, and both demos |
| `pnpm typecheck` | `tsc` for packages and docs (demos are type-checked via their Next.js build in `pnpm build`) |
| `pnpm sync:templates` | Copy `demos/*` → `templates/*` and set template `@next-md-blog/core` range from `packages/core` |

### Documentation site (local)

```bash
pnpm install
pnpm dev:docs
```

Content lives under [`docs/content`](../docs/content). For **Vercel** deployment of the docs app inside this monorepo, see the [Deployment](https://www.next-md-blog.com/deployment) page.

### Testing

See [contributing/testing.md](../contributing/testing.md) for Vitest commands from the repo root.

Test your changes using the demos (from repo root, workspace install):

```bash
pnpm dev:demo
# or
pnpm dev:demo:i18n
```

Or from each demo folder after a root `pnpm install`:

```bash
cd demos/single && pnpm dev
cd demos/i18n && pnpm dev
```

## Code Style

- Follow TypeScript best practices
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused (single responsibility)
- Add error handling where appropriate
- Write clean, maintainable code

## Pull Request Process

1. Ensure your code follows the project's code style
2. Update documentation if needed
3. Test your changes thoroughly
4. Submit a pull request with a clear description
5. Reference any related issues

## Vercel template repositories

`templates/single/` and `templates/i18n/` are flat Next.js apps (npm `@next-md-blog/core`) intended to be mirrored at **github.com/next-md-blog/template** and **github.com/next-md-blog/template-i18n** for one-click deploy. After changing `demos/single` or `demos/i18n`, run **`pnpm sync:templates`** from the repo root, review the diff, and when you release **@next-md-blog/core**, ensure the template `package.json` files pick up the new range (the script sets `^` from `packages/core`).

**Single locale** — [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnext-md-blog%2Fnext-md-blog%2Ftree%2Fmain%2Ftemplates%2Fsingle%2F)

**i18n** — [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnext-md-blog%2Fnext-md-blog%2Ftree%2Fmain%2Ftemplates%2Fi18n)

## Areas for Contribution

- Bug fixes
- New features
- Documentation improvements
- Performance optimizations
- Test coverage
- Demo and template improvements

Thank you for contributing.
