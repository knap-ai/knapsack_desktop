#!/usr/bin/env node
/**
 * bump-version.cjs — Bumps the version across all config files.
 *
 * Usage:
 *   node scripts/bump-version.cjs           # bump patch/minor/major rollover
 *   node scripts/bump-version.cjs 2.7.3     # set exact version
 *
 * Updates: package.json, package-lock.json, src-tauri/tauri.conf.json
 *
 * When release tags have advanced beyond the checked-in version files, this
 * script uses the higher tagged release as the bump baseline so release
 * automation cannot accidentally roll back to an older version line.
 */
const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

const projectDir = path.resolve(__dirname, '..');
const files = {
  pkg: path.join(projectDir, 'package.json'),
  lock: path.join(projectDir, 'package-lock.json'),
  tauri: path.join(projectDir, 'src-tauri', 'tauri.conf.json'),
};

const pkg = JSON.parse(fs.readFileSync(files.pkg, 'utf8'));
const currentVersion = pkg.version;

function parseVersion(version) {
  if (!/^\d+\.\d+\.\d+$/.test(version)) {
    throw new Error(`Invalid semver version: ${version}`);
  }
  return version.split('.').map(Number);
}

function compareVersions(a, b) {
  const left = parseVersion(a);
  const right = parseVersion(b);
  for (let i = 0; i < 3; i += 1) {
    if (left[i] !== right[i]) return left[i] - right[i];
  }
  return 0;
}

function latestTaggedReleaseVersion() {
  try {
    const output = childProcess
      .execSync('git tag --list "v*" --sort=-v:refname', {
        cwd: projectDir,
        stdio: ['ignore', 'pipe', 'ignore'],
      })
      .toString()
      .trim();
    const taggedVersions = output
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((tag) => tag.replace(/^v/, ''))
      .filter((version) => /^\d+\.\d+\.\d+$/.test(version));
    return taggedVersions[0] || null;
  } catch {
    return null;
  }
}

const latestTagVersion = latestTaggedReleaseVersion();
const baseVersion =
  latestTagVersion && compareVersions(latestTagVersion, currentVersion) > 0
    ? latestTagVersion
    : currentVersion;
const [major, minor, patch] = parseVersion(baseVersion);

const arg = process.argv[2];
let newVersion;

if (arg && /^\d+\.\d+\.\d+$/.test(arg)) {
  // Exact version specified
  newVersion = arg;
} else if (!arg || arg === 'bump') {
  // Auto-bump: increment patch, but roll over to next major at X.9.9
  if (minor === 9 && patch === 9) {
    newVersion = `${major + 1}.0.0`;
  } else if (patch === 9) {
    newVersion = `${major}.${minor + 1}.0`;
  } else {
    newVersion = `${major}.${minor}.${patch + 1}`;
  }
} else {
  console.error(`ERROR: Unknown argument "${arg}". Use no argument to bump, or provide an exact version (e.g. 0.9.8).`);
  process.exit(1);
}

if (newVersion === currentVersion) {
  console.log(`[bump-version] Already at v${currentVersion} — nothing to do.`);
  process.exit(0);
}

if (baseVersion !== currentVersion) {
  console.log(
    `[bump-version] Using tagged release v${baseVersion} as bump baseline because package.json is at v${currentVersion}.`,
  );
}

console.log(`[bump-version] ${currentVersion} → ${newVersion}`);

// Update package.json
pkg.version = newVersion;
fs.writeFileSync(files.pkg, JSON.stringify(pkg, null, 2) + '\n');
console.log(`[bump-version]   Updated package.json`);

// Update package-lock.json
if (fs.existsSync(files.lock)) {
  const lock = JSON.parse(fs.readFileSync(files.lock, 'utf8'));
  lock.version = newVersion;
  if (lock.packages && lock.packages['']) {
    lock.packages[''].version = newVersion;
  }
  fs.writeFileSync(files.lock, JSON.stringify(lock, null, 2) + '\n');
  console.log(`[bump-version]   Updated package-lock.json`);
}

// Update tauri.conf.json
if (fs.existsSync(files.tauri)) {
  const tauri = JSON.parse(fs.readFileSync(files.tauri, 'utf8'));
  tauri.package.version = newVersion;
  fs.writeFileSync(files.tauri, JSON.stringify(tauri, null, 2) + '\n');
  console.log(`[bump-version]   Updated tauri.conf.json`);
}

// Output for CI consumption
console.log(`[bump-version] Done: v${newVersion}`);
// Write to GITHUB_OUTPUT if running in CI
if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `version=${newVersion}\ntag=v${newVersion}\n`);
}
