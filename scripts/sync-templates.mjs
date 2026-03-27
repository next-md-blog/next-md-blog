#!/usr/bin/env node
/**
 * Copies demos/single → templates/single and demos/i18n → templates/i18n,
 * then rewrites each template package.json for npm-published @next-md-blog/core.
 * Preserves each template README.md and .env.example (excluded from rsync).
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const coreVersion = JSON.parse(
  readFileSync(join(root, 'packages/core/package.json'), 'utf8'),
).version;
const coreRange = `^${coreVersion}`;

const rsyncExcludes = [
  'node_modules',
  '.next',
  'package-lock.json',
  'pnpm-lock.yaml',
  '.git',
  'README.md',
  '.env.example',
  'pnpm-workspace.yaml',
  'vercel.json',
];

const targets = [
  { demo: 'demos/single', template: 'templates/single', name: 'next-md-blog-template' },
  { demo: 'demos/i18n', template: 'templates/i18n', name: 'next-md-blog-template-i18n' },
];

for (const ex of rsyncExcludes) {
  if (ex.includes('*') || ex.includes('..')) {
    throw new Error(`unsafe exclude: ${ex}`);
  }
}

for (const { demo, template, name } of targets) {
  const args = [
    '-a',
    '--delete',
    ...rsyncExcludes.flatMap((e) => ['--exclude', e]),
    `${demo}/`,
    `${template}/`,
  ];
  const r = spawnSync('rsync', args, { cwd: root, stdio: 'inherit' });
  if (r.status !== 0) {
    process.exit(r.status ?? 1);
  }

  const pkgPath = join(root, template, 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  pkg.name = name;
  pkg.private = true;
  pkg.scripts = {
    dev: 'next dev --webpack',
    build: 'next build --webpack',
    start: 'next start',
    lint: 'eslint .',
  };
  if (!pkg.dependencies?.['@next-md-blog/core']) {
    throw new Error(`missing @next-md-blog/core in ${pkgPath}`);
  }
  pkg.dependencies['@next-md-blog/core'] = coreRange;
  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
}

console.log(`sync-templates: patched @next-md-blog/core to ${coreRange} in templates/*/package.json`);
