#!/usr/bin/env node
/**
 * Fail-closed synthetic desktop QA launcher.
 *
 * Every run gets a unique bundle ID, WebKit data-store identity, state folder,
 * config, and database. This launcher never reads production state, starts a
 * gateway, or modifies a LaunchAgent. The installed gateway may remain running
 * and its listener ownership must remain unchanged for the whole QA run.
 */
const crypto = require("crypto");
const fs = require("fs");
const http = require("http");
const os = require("os");
const path = require("path");
const { spawn, spawnSync } = require("child_process");

const projectDir = path.resolve(__dirname, "..");
const tauriDir = path.join(projectDir, "src-tauri");
const packageVersion = require(path.join(projectDir, "package.json")).version;
const binary = path.join(tauriDir, "target", "debug", process.platform === "win32" ? "knapsack.exe" : "knapsack");
const viteBin = path.join(projectDir, "node_modules", ".bin", process.platform === "win32" ? "vite.cmd" : "vite");
const viteJs = path.join(projectDir, "node_modules", "vite", "bin", "vite.js");
const QA_VITE_PORT = 1420;
const QA_API_PORT = 8897;
const PROTECTED_GATEWAY_PORTS = [18789, 18791];
const SENSITIVE_ENV_PATTERN = /(KEY|TOKEN|SECRET|PASSWORD|CREDENTIAL)/i;

function normalizeRunId(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
}

const qaRunId = normalizeRunId(process.env.KNAPSACK_QA_RUN_ID || crypto.randomUUID());
if (!qaRunId) throw new Error("KNAPSACK_QA_RUN_ID must contain letters or numbers");
const qaBundleId = `ai.knap.knapsack.qa.${qaRunId.replace(/-/g, "").slice(0, 32)}`;
const qaProductName = `Knapsack QA ${qaRunId.slice(0, 8)}`;
const qaRunRoot = path.join(os.tmpdir(), `knapsack-qa-${qaRunId}`);
const qaStateDir = path.join(qaRunRoot, "state");
const qaConfigPath = path.join(qaStateDir, "openclaw.json");
const qaTokensPath = path.join(qaStateDir, "tokens.json");
const qaDbPath = path.join(qaStateDir, "knapsack-qa.db");
const qaAppRoot = path.join(qaRunRoot, "app");
const qaAppBundle = path.join(qaAppRoot, `${qaProductName}.app`);
const qaAppExecutable = path.join(qaAppBundle, "Contents", "MacOS", qaProductName);
const buildIdentityMarker = path.join(tauriDir, "target", "debug", ".knapsack-qa-bundle-id");

function qaEnv(extra = {}, inherited = process.env) {
  const env = { ...inherited, ...extra };
  for (const key of Object.keys(env)) {
    if (
      key === "CODEX_SANDBOX_NETWORK_DISABLED" || key.startsWith("CODEX_") ||
      key.startsWith("AWS_") || key.startsWith("GOOGLE_") || key.startsWith("OLLAMA_") ||
      SENSITIVE_ENV_PATTERN.test(key)
    ) delete env[key];
  }
  delete env.DATABASE_URL;
  delete env.OPENCLAW_HOME;
  delete env.OPENCLAW_STATE_DIR;
  delete env.OPENCLAW_CONFIG_PATH;
  // Reassert after caller input so no launch path can opt into live data.
  env.VITE_KNAPSACK_LOCAL_QA_SAFE = "1";
  env.VITE_KN_API_SERVER = `http://127.0.0.1:${QA_API_PORT}`;
  env.MICROSOFT_CLIENT_ID = "unused";
  env.VITE_GOOGLE_CLIENT_ID = "unused";
  env.VITE_GOOGLE_DEVELOPER_KEY = "";
  env.OPENCLAW_SKIP_CHANNELS = "1";
  env.OPENCLAW_DESKTOP_AUTO_START_CHANNELS = "0";
  env.KNAPSACK_QA_SKIP_GATEWAY = "1";
  env.KNAPSACK_QA_SYNTHETIC = "1";
  env.OPENCLAW_HOME = qaStateDir;
  env.OPENCLAW_STATE_DIR = qaStateDir;
  env.OPENCLAW_CONFIG_PATH = qaConfigPath;
  env.DATABASE_URL = qaDbPath;
  return env;
}

function assertSyntheticModeRequest(env = process.env) {
  if (String(env.KNAPSACK_QA_ENABLE_LIVE_CHANNELS || "") === "1") throw new Error("Synthetic QA refuses live channels.");
  if (String(env.KNAPSACK_QA_SKIP_GATEWAY || "1") !== "1") throw new Error("Synthetic QA refuses to start a gateway.");
  if (String(env.KNAPSACK_QA_PRESERVE_STATE || "") === "1") throw new Error("Synthetic QA refuses preserved state; every run must start empty.");
}

function qaWebKitDataPaths(homeDir = process.env.HOME || "") {
  return [
    path.join(homeDir, "Library", "WebKit", qaBundleId),
    path.join(homeDir, "Library", "Containers", qaBundleId),
    path.join(homeDir, "Library", "Application Support", qaBundleId),
    path.join(homeDir, "Library", "Caches", qaBundleId),
    path.join(homeDir, "Library", "Saved Application State", `${qaBundleId}.savedState`),
  ];
}

function writeJsonFile(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
}

function initializeSyntheticState() {
  if (fs.existsSync(qaRunRoot)) throw new Error(`Synthetic QA run identity was already used: ${qaRunRoot}`);
  const reusedDataPath = qaWebKitDataPaths().find((candidate) => fs.existsSync(candidate));
  if (reusedDataPath) throw new Error(`Synthetic QA WebKit data-store identity is not fresh: ${reusedDataPath}`);
  fs.mkdirSync(qaStateDir, { recursive: true, mode: 0o700 });
  writeJsonFile(qaConfigPath, {
    channels: {},
    cron: { enabled: false },
    browser: { enabled: false },
    agents: { defaults: { heartbeat: { every: "0m" } } },
  });
  writeJsonFile(path.join(qaStateDir, "qa-isolation.json"), {
    version: 1, runId: qaRunId, bundleId: qaBundleId,
    productionSeeded: false, gatewayMode: "disabled",
  });
  if (fs.existsSync(qaDbPath) || fs.existsSync(qaTokensPath)) throw new Error("Synthetic QA state unexpectedly contains a database or token file.");
}

function listeningPortHolderPids(port) {
  if (process.platform !== "darwin") return [];
  const result = spawnSync("lsof", [`-tiTCP:${port}`, "-sTCP:LISTEN"], { encoding: "utf8" });
  if (result.status !== 0 || !result.stdout) return [];
  return result.stdout.split(/\r?\n/).map((line) => line.trim()).filter((pid) => /^\d+$/.test(pid) && pid !== String(process.pid)).map(Number).sort((a, b) => a - b);
}

function gatewayListenerSnapshot() {
  return Object.fromEntries(PROTECTED_GATEWAY_PORTS.map((port) => [port, listeningPortHolderPids(port)]));
}

function assertGatewaySnapshotUnchanged(before, after = gatewayListenerSnapshot()) {
  if (JSON.stringify(before) !== JSON.stringify(after)) throw new Error("Synthetic QA detected a protected gateway ownership change.");
}

function tcpPortIsOpen(port) {
  const result = spawnSync("nc", ["-z", "-w", "1", "127.0.0.1", String(port)], { stdio: "ignore" });
  return result.status === 0;
}

function assertQaAppPortsFree() {
  const blocked = [QA_API_PORT, QA_VITE_PORT].filter(tcpPortIsOpen);
  if (blocked.length) throw new Error(
    `Synthetic QA requires localhost port(s) ${blocked.join(", ")} to be free. ` +
    "Close the installed Knapsack UI or another dev server; the installed gateway may remain running.",
  );
}

function resolveViteLaunch({ binPath = viteBin, jsPath = viteJs } = {}) {
  const args = ["--host", "127.0.0.1", "--port", String(QA_VITE_PORT), "--strictPort"];
  try {
    fs.accessSync(binPath, fs.constants.X_OK);
    return { command: binPath, args };
  } catch {
    if (!fs.existsSync(jsPath)) throw new Error("Vite is not installed. Run the repository setup (npm install) before QA.");
    return { command: process.execPath, args: [jsPath, ...args] };
  }
}

function resolveNpmCli() {
  const candidates = [
    process.env.npm_execpath,
    path.join(path.dirname(process.execPath), "..", "lib", "node_modules", "npm", "bin", "npm-cli.js"),
    path.join(path.dirname(process.execPath), "..", "node_modules", "npm", "bin", "npm-cli.js"),
  ];
  return candidates.find((candidate) => candidate && fs.existsSync(candidate)) || null;
}

function runChecked(command, args, options = {}) {
  const result = spawnSync(command, args, { cwd: options.cwd || projectDir, stdio: "inherit", env: options.env || qaEnv(), windowsHide: true });
  if (result.status !== 0) throw new Error(`${command} exited with status ${result.status ?? "unknown"}`);
}

function ensureRootNodeModules() {
  if (fs.existsSync(viteJs) || fs.existsSync(viteBin)) return;
  const npmCli = resolveNpmCli();
  if (!npmCli) throw new Error("Repository dependencies are missing. Run npm install with the supported Node/npm setup.");
  runChecked(process.execPath, [npmCli, "install"]);
}

function latestMtimeMs(dir, shouldInclude) {
  let latest = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "target") continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) latest = Math.max(latest, latestMtimeMs(fullPath, shouldInclude));
    else if (entry.isFile() && shouldInclude(fullPath)) latest = Math.max(latest, fs.statSync(fullPath).mtimeMs);
  }
  return latest;
}

function binaryNeedsRebuild() {
  if (!fs.existsSync(binary) || !fs.existsSync(buildIdentityMarker)) return true;
  if (fs.readFileSync(buildIdentityMarker, "utf8").trim() !== qaBundleId) return true;
  const binaryMtime = fs.statSync(binary).mtimeMs;
  const rustSourceMtime = Math.max(
    latestMtimeMs(path.join(tauriDir, "src"), (file) => file.endsWith(".rs")),
    fs.statSync(path.join(tauriDir, "Cargo.toml")).mtimeMs,
    fs.statSync(path.join(tauriDir, "build.rs")).mtimeMs,
    fs.statSync(path.join(tauriDir, "tauri.conf.json")).mtimeMs,
    fs.statSync(__filename).mtimeMs,
  );
  return rustSourceMtime > binaryMtime;
}

function buildQaBinary() {
  if (!binaryNeedsRebuild()) return;
  const tauriConfig = JSON.stringify({
    package: { productName: qaProductName },
    tauri: { bundle: { identifier: qaBundleId, resources: ["resources/signin_success.html", "resources/signin_error.html"] } },
  });
  runChecked("cargo", ["build", "--no-default-features"], { cwd: tauriDir, env: qaEnv({ TAURI_CONFIG: tauriConfig }) });
  fs.writeFileSync(buildIdentityMarker, `${qaBundleId}\n`);
}

function prepareMacDevAppBundle() {
  if (process.platform !== "darwin") return binary;
  fs.mkdirSync(qaAppRoot, { recursive: true });
  if (fs.lstatSync(qaAppRoot).isSymbolicLink()) throw new Error(`Refusing unsafe QA app root: ${qaAppRoot}`);
  const contentsDir = path.join(qaAppBundle, "Contents");
  const macosDir = path.join(contentsDir, "MacOS");
  fs.mkdirSync(macosDir, { recursive: true });
  fs.copyFileSync(binary, qaAppExecutable);
  fs.chmodSync(qaAppExecutable, 0o755);
  const infoPlist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>CFBundleDisplayName</key><string>${qaProductName}</string>
<key>CFBundleExecutable</key><string>${qaProductName}</string>
<key>CFBundleIdentifier</key><string>${qaBundleId}</string>
<key>CFBundleName</key><string>${qaProductName}</string>
<key>CFBundlePackageType</key><string>APPL</string>
<key>CFBundleShortVersionString</key><string>${packageVersion}</string>
<key>CFBundleVersion</key><string>${packageVersion}</string>
<key>NSHighResolutionCapable</key><true/>
</dict></plist>\n`;
  fs.writeFileSync(path.join(contentsDir, "Info.plist"), infoPlist);
  const xattr = spawnSync("xattr", ["-cr", qaAppBundle], { encoding: "utf8" });
  if (xattr.status !== 0) throw new Error(`Failed to clear QA bundle metadata: ${xattr.stderr || xattr.stdout}`);
  const sign = spawnSync("codesign", ["--force", "--deep", "--sign", "-", qaAppBundle], { encoding: "utf8" });
  if (sign.status !== 0) throw new Error(`Failed to sign QA app bundle: ${sign.stderr || sign.stdout}`);
  return qaAppExecutable;
}

function parseDatabaseCounts(stdout) {
  return String(stdout || "").trim().split(/\r?\n/).filter(Boolean).map((line) => {
    const match = line.match(/^([a-z_]+)=(\d+)$/);
    if (!match) throw new Error(`Unexpected database isolation output: ${line}`);
    return [match[1], Number(match[2])];
  });
}

function assertSyntheticDatabaseClean() {
  if (!fs.existsSync(qaDbPath)) throw new Error("Synthetic QA database was not created by the app.");
  const tables = ["connections", "user_connections", "users", "messages", "feed_items", "threads", "emails", "calendar_events"];
  const tableSql = `SELECT name FROM sqlite_master WHERE type='table' AND name IN (${tables.map((table) => `'${table}'`).join(",")});`;
  const existing = spawnSync("sqlite3", [qaDbPath, tableSql], { encoding: "utf8" });
  if (existing.status !== 0) throw new Error(`Could not inspect synthetic database: ${existing.stderr || "sqlite3 failed"}`);
  const present = String(existing.stdout || "").trim().split(/\r?\n/).filter(Boolean);
  const query = present.map((table) => `SELECT '${table}=' || COUNT(*) FROM ${table};`).join(" ");
  const counts = query ? spawnSync("sqlite3", [qaDbPath, query], { encoding: "utf8" }) : { status: 0, stdout: "" };
  if (counts.status !== 0) throw new Error(`Could not verify synthetic database: ${counts.stderr || "sqlite3 failed"}`);
  const nonEmpty = parseDatabaseCounts(counts.stdout).filter(([, count]) => count !== 0);
  if (nonEmpty.length) throw new Error(`Synthetic QA database was not empty (${nonEmpty.map(([name, count]) => `${name}=${count}`).join(", ")}).`);
}

function waitForUrl(url, timeoutMs) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const req = http.get(url, (response) => { response.resume(); resolve(); });
      req.on("error", () => {
        if (Date.now() - started > timeoutMs) reject(new Error(`Timed out waiting for ${url}`));
        else setTimeout(attempt, 500);
      });
      req.setTimeout(1000, () => req.destroy());
    };
    attempt();
  });
}

async function main() {
  assertSyntheticModeRequest();
  const gatewayBefore = gatewayListenerSnapshot();
  assertQaAppPortsFree();
  initializeSyntheticState();
  ensureRootNodeModules();
  runChecked(process.execPath, [path.join(projectDir, "scripts", "fix-rollup-native.cjs")]);
  buildQaBinary();
  const appExecutable = prepareMacDevAppBundle();
  assertGatewaySnapshotUnchanged(gatewayBefore);
  if (String(process.env.KNAPSACK_QA_PREPARE_ONLY || "") === "1") {
    console.log(`[qa-dev-run] prepared isolated QA bundle at ${qaAppBundle}`);
    return;
  }

  const viteLaunch = resolveViteLaunch();
  const vite = spawn(viteLaunch.command, viteLaunch.args, { cwd: projectDir, stdio: "inherit", env: qaEnv(), windowsHide: true });
  let app = null;
  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    if (!vite.killed) vite.kill("SIGTERM");
    if (app && !app.killed) app.kill("SIGTERM");
    assertGatewaySnapshotUnchanged(gatewayBefore);
  };
  process.once("exit", cleanup);
  process.once("SIGINT", () => { cleanup(); process.exit(130); });
  process.once("SIGTERM", () => { cleanup(); process.exit(143); });

  await waitForUrl(`http://127.0.0.1:${QA_VITE_PORT}/`, Number(process.env.KNAPSACK_QA_VITE_READY_TIMEOUT_MS || 90_000));
  assertGatewaySnapshotUnchanged(gatewayBefore);
  app = spawn(appExecutable, [], {
    cwd: tauriDir,
    stdio: "inherit",
    env: qaEnv({
      OPENCLAW_HOME: qaStateDir,
      OPENCLAW_STATE_DIR: qaStateDir,
      OPENCLAW_CONFIG_PATH: qaConfigPath,
      DATABASE_URL: qaDbPath,
      KNAPSACK_QA_RUN_ID: qaRunId,
      KNAPSACK_QA_BUNDLE_ID: qaBundleId,
    }),
    windowsHide: true,
  });
  await waitForUrl(`http://127.0.0.1:${QA_API_PORT}/api/clawd/service/status`, 45_000);
  assertSyntheticDatabaseClean();
  assertGatewaySnapshotUnchanged(gatewayBefore);
  console.log(`[qa-dev-run] isolated synthetic runtime ready (${qaRunId}); gateway disabled`);
  app.on("exit", (code, signal) => {
    cleanup();
    if (signal) process.kill(process.pid, signal);
    else process.exit(code || 0);
  });
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`[qa-dev-run] ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  assertGatewaySnapshotUnchanged,
  assertSyntheticModeRequest,
  normalizeRunId,
  parseDatabaseCounts,
  qaBundleId,
  qaEnv,
  qaRunRoot,
  qaWebKitDataPaths,
  resolveViteLaunch,
};
