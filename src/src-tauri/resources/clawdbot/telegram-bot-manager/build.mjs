#!/usr/bin/env node
// Bundles the TelegramBotManager TypeScript extension into the OpenClaw dist directory.
// Run: node build.mjs

import { execSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dir, '../dist/extensions/telegrambot');
mkdirSync(outDir, { recursive: true });

const entry = resolve(__dir, 'src/extension.ts');
const esbuild = resolve(__dir, '../node_modules/.bin/esbuild');

execSync(
  [
    esbuild,
    entry,
    '--bundle',
    '--format=esm',
    '--platform=node',
    `--outfile=${outDir}/index.js`,
    "--external:'node:*'",
    "--external:'../../plugin-entry-DA7dUJNL.js'",
  ].join(' '),
  { stdio: 'inherit', cwd: __dir },
);

console.log(`✓ Bundled → ${outDir}/index.js`);
