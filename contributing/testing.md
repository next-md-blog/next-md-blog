# Testing

## Prerequisites

Clone and install from the repository root:

```bash
git clone https://github.com/next-md-blog/next-md-blog.git
cd next-md-blog
pnpm install
```

## Lint, typecheck, and full CI-style check

From the repository root:

```bash
pnpm lint       # includes demos/single and demos/i18n (eslint .)
pnpm typecheck  # packages/* and docs/ only
pnpm check      # lint + typecheck + test + build (packages, docs, and both demos)
```

## Unit and integration tests (packages)

Run all workspace packages that define a `test` script:

```bash
pnpm test
```

The CLI package includes **Vitest integration tests** that copy a minimal Next.js fixture into a temp directory, run the same init steps as the real CLI (with `child_process.execSync` mocked), and assert that expected files exist. This replaces the old bash-only checks for correctness; an optional shell smoke test can live under `scripts/` if you maintain one.

Run a single package:

```bash
pnpm test:core
pnpm test:cli
```

## Watch mode and coverage

```bash
pnpm test:watch
pnpm test:coverage
```

## Documentation app

The Nextra site in **`docs/`** (repo root) is checked with a production build:

```bash
pnpm build:docs
```

There is no separate Vitest suite for the docs app.

## Prepare hook

`pnpm install` runs **`prepare`**, which builds **`packages/core`** and **`packages/cli`** only (not **`docs/`**) to keep installs fast. Use **`pnpm build`** or **`pnpm build:docs`** when you need the documentation build output.
