#!/usr/bin/env node
/**
 * load-env-and-run.js — Loads .env file into process environment, then spawns
 * the given command with those env vars inherited.
 *
 * Cross-platform replacement for `source .env && <command>`.
 *
 * Usage:  node scripts/load-env-and-run.js tauri dev
 *         node scripts/load-env-and-run.js tauri build
 */
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const projectDir = path.resolve(__dirname, '..');
const envFile = path.join(projectDir, '.env');

// Load .env file if it exists
if (fs.existsSync(envFile)) {
  const lines = fs.readFileSync(envFile, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith('#')) continue;
    // Handle export VAR=value and VAR=value
    const match = trimmed.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)=(.*)/);
    if (match) {
      let [, key, value] = match;
      // Strip surrounding quotes
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      // Don't override existing env vars
      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  }
}

// Get the command and args
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node scripts/load-env-and-run.js <command> [args...]');
  process.exit(1);
}

const command = args[0];
const commandArgs = args.slice(1);

// On Windows, npm .bin scripts need to be run through cmd
const isWin = process.platform === 'win32';
const shell = isWin ? true : false;

const child = spawn(command, commandArgs, {
  stdio: 'inherit',
  env: process.env,
  cwd: projectDir,
  shell,
});

child.on('error', (err) => {
  console.error(`Failed to start ${command}: ${err.message}`);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
