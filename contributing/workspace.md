# Workspace Development Guide

This repository uses **pnpm** workspaces (`pnpm-workspace.yaml`) with **`packageManager`** pinned in the root `package.json`.

## Workspace Structure

```
.
├── packages/
│   ├── core/         # @next-md-blog/core
│   └── cli/          # @next-md-blog/cli
├── docs/             # Nextra documentation site (next-md-blog-docs)
├── demos/            # Demo Next.js apps (workspace:* core; separate installs)
└── templates/        # Standalone Vercel templates (npm core); run pnpm sync:templates after demo edits
```

## Getting Started

### Install Dependencies

From the root directory, run:

```bash
pnpm install
```

This installs all workspace packages and links them.

### Development Scripts

All scripts can be run from the root directory:

#### Build

```bash
# Build all packages
pnpm run build

# Build specific package
pnpm run build:core
pnpm run build:cli
```

#### Development (Watch Mode)

```bash
# Watch all packages
pnpm run dev

# Watch specific package
pnpm run dev:core
pnpm run dev:cli
```

#### Testing

```bash
# Test all packages
pnpm run test

# Test specific package
pnpm run test:core
pnpm run test:cli

# Watch mode
pnpm run test:watch

# Coverage
pnpm run test:coverage
```

#### Clean

```bash
pnpm run clean
```

## Workspace Dependencies

The CLI package depends on the main package. This is configured using the `workspace:*` protocol in `packages/cli/package.json`:

```json
{
  "devDependencies": {
    "@next-md-blog/core": "workspace:*"
  }
}
```

This ensures that:
- The CLI always uses the local version of the package during development
- Changes to the package are immediately available to the CLI (after rebuilding)
- No need to manually link packages
- Uses pnpm’s native workspace protocol for dependency resolution
- Automatically resolves to the correct workspace package version

## Package Versions

Both packages are currently at version `1.0.0`:
- `@next-md-blog/core`: 1.0.0
- `@next-md-blog/cli`: 1.0.0

When publishing, ensure version numbers are updated appropriately in each package's `package.json`.

## Publishing

Each package can be published independently:

```bash
# From core package directory
cd packages/core
npm publish

# From cli package directory
cd packages/cli
npm publish
```

The workspace setup ensures that:
- Dependencies are properly resolved
- Each package maintains its own version
- Publishing works independently for each package

## Benefits of Workspace Setup

1. **Unified Development**: Work on multiple packages simultaneously
2. **Automatic Linking**: Changes in one package are immediately available to others
3. **Shared Dependencies**: Common dependencies are hoisted to the root
4. **Single Install**: One `pnpm install` installs everything
5. **Consistent Tooling**: Shared scripts and configurations

## Troubleshooting

### Workspace dependencies not resolving

If you encounter issues with workspace dependencies:

1. Remove install artifacts and reinstall:
   ```bash
   pnpm run clean
   pnpm install
   ```

### Changes not reflecting

If changes in one package aren't visible in another:

1. Ensure you've built the package: `pnpm run build:core`
2. Restart any watch processes
3. Check that workspace protocol is used: `workspace:*` in `packages/cli/package.json`
4. Verify the dependency is correctly linked: `pnpm ls @next-md-blog/core` from the root directory
