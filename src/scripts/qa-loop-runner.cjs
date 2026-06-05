#!/usr/bin/env node
const fs = require("node:fs");
const { existsSync } = fs;
const { spawn, spawnSync } = require("node:child_process");
const net = require("node:net");
const path = require("node:path");
const process = require("node:process");

const API_BASE = "http://127.0.0.1:8897";
const UI_BASE = "http://127.0.0.1:1420";

const MODELS_BY_PROVIDER = {
  knapsack: ["auto"],
  openai: [
    "gpt-5.5",
    "gpt-5.5-pro",
    "gpt-5.4",
    "gpt-5.4-pro",
    "o3",
    "gpt-5-mini",
  ],
  anthropic: [
    "claude-opus-4-7",
    "claude-opus-4-6",
    "claude-sonnet-4-6",
    "claude-haiku-4-5-20251001",
    "claude-sonnet-4-5-20250929",
    "claude-opus-4-5-20251101",
  ],
  gemini: [
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-3.1-pro-preview",
    "gemini-3.5-flash",
    "gemini-3-flash-preview",
    "gemini-3.1-flash-lite",
  ],
  groq: [
    "openai/gpt-oss-120b",
    "meta-llama/llama-4-scout-17b-16e-instruct",
    "meta-llama/llama-4-maverick-17b-128e-instruct",
    "moonshotai/kimi-k2-instruct-0905",
    "qwen/qwen-3-32b",
    "deepseek-r1-distill-llama-70b",
    "qwen-qwq-32b",
    "llama-3.3-70b-versatile",
  ],
  xai: [
    "grok-4.20-beta-latest-reasoning",
    "grok-4.20-beta-latest-non-reasoning",
    "grok-code-fast-1",
    "grok-4-1-fast",
    "grok-4-fast",
    "grok-4",
  ],
  openrouter: [
    "openrouter/free",
    "openrouter/auto",
    "qwen/qwen3-coder-480b-a35b-instruct:free",
    "deepseek/deepseek-r1:free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "mistralai/mistral-small-3.1-24b-instruct:free",
    "deepseek/deepseek-v4-pro",
    "deepseek/deepseek-v4-flash",
    "anthropic/claude-opus-4-7",
    "openai/gpt-5.5",
  ],
};

const PLUGIN_BY_PROVIDER = {
  anthropic: "anthropic",
  gemini: "google",
  google: "google",
  groq: "groq",
  knapsack: "openai",
  openai: "openai",
  openrouter: "openrouter",
  xai: "xai",
};

function qaPluginAllowlistForProviders(providers) {
  const explicitAllowlist = String(process.env.KNAPSACK_QA_PLUGIN_ALLOWLIST || "").trim();
  if (explicitAllowlist) {
    return explicitAllowlist
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)
      .sort()
      .join(",");
  }
  if (!Array.isArray(providers) || providers.length === 0) return null;
  const plugins = new Set(["browser"]);
  for (const channel of configuredChannelPluginIdsForQa()) {
    plugins.add(channel);
  }
  return Array.from(plugins).sort().join(",");
}

function configuredChannelPluginIdsForQa() {
  if (String(process.env.KNAPSACK_QA_INCLUDE_CHANNEL_PLUGINS || "0").trim() === "0") {
    return [];
  }
  if (!process.env.APPDATA) return [];
  const configPath = path.join(process.env.APPDATA, "ai.knap.knapsack", "clawdbot", "openclaw.json");
  if (!existsSync(configPath)) return [];
  try {
    const config = JSON.parse(fs.readFileSync(configPath, "utf8").replace(/^\uFEFF/, ""));
    const configured = config && typeof config === "object" && !Array.isArray(config)
      ? config.channels
      : null;
    if (!configured || typeof configured !== "object" || Array.isArray(configured)) return [];
    return ["slack", "telegram", "whatsapp"].filter((channel) =>
      Object.prototype.hasOwnProperty.call(configured, channel)
        && channelEnabledForQa(configured[channel])
        && bundledChannelPluginAvailableForQa(channel),
    );
  } catch {
    return [];
  }
}

function channelEnabledForQa(channelConfig) {
  if (!channelConfig || typeof channelConfig !== "object" || Array.isArray(channelConfig)) return false;
  return channelConfig.enabled !== false;
}

function bundledChannelPluginAvailableForQa(channel) {
  const roots = [
    path.join(__dirname, "..", "src-tauri", "resources", "clawdbot", "dist", "extensions", channel),
    path.join(__dirname, "..", "src-tauri", "target", "release", "resources", "clawdbot", "dist", "extensions", channel),
    path.join(__dirname, "..", "src-tauri", "target", "debug", "resources", "clawdbot", "dist", "extensions", channel),
  ];
  if (process.env.APPDATA) {
    roots.push(path.join(
      process.env.APPDATA,
      "ai.knap.knapsack",
      "clawdbot",
      "runtime",
      "openclaw-2026.6.1-npm",
      "node_modules",
      "openclaw",
      "dist",
      "extensions",
      channel,
    ));
  }
  return roots.some((root) => existsSync(root));
}

function pluginAllowlistIncludesChannel(pluginAllowlist) {
  const plugins = new Set(String(pluginAllowlist || "").split(",").map((value) => value.trim()).filter(Boolean));
  return ["slack", "telegram", "whatsapp"].some((channel) => plugins.has(channel));
}

function qaStartupModelForProvider(provider) {
  const models = {
    anthropic: "anthropic/claude-sonnet-4-6",
    gemini: "google/gemini-2.5-flash",
    google: "google/gemini-2.5-flash",
    groq: "groq/llama-3.3-70b-versatile",
    knapsack: "openai/gpt-5.4",
    openai: "openai/gpt-5.4",
    openrouter: "openrouter/auto",
    xai: "xai/grok-4",
  };
  return models[String(provider || "").trim().toLowerCase()] || null;
}

function patchOpenClawConfigForQa({ pluginAllowlist, provider }) {
  if (pluginAllowlist || provider) {
    console.log("[qa-loop] patching OpenClaw config for QA startup provider/plugin isolation");
  }

  const startupModel = qaStartupModelForProvider(provider);
  if ((!pluginAllowlist && !startupModel) || !process.env.APPDATA) return null;
  const configPath = path.join(process.env.APPDATA, "ai.knap.knapsack", "clawdbot", "openclaw.json");
  if (!existsSync(configPath)) return null;

  const original = fs.readFileSync(configPath, "utf8");
  const parseable = original.replace(/^\uFEFF/, "");
  let config;
  try {
    config = JSON.parse(parseable);
  } catch (error) {
    console.warn(`[qa-loop] could not parse OpenClaw config for QA patch: ${error.message}`);
    return null;
  }

  if (!config || typeof config !== "object" || Array.isArray(config)) return null;
  if (pluginAllowlist) {
    const allowedPlugins = new Set(pluginAllowlist.split(",").map((value) => value.trim()).filter(Boolean));
    config.plugins = config.plugins && typeof config.plugins === "object" && !Array.isArray(config.plugins)
      ? config.plugins
      : {};
    config.plugins.allow = Array.from(allowedPlugins).sort();
    const entries = config.plugins.entries && typeof config.plugins.entries === "object" && !Array.isArray(config.plugins.entries)
      ? config.plugins.entries
      : {};
    for (const [pluginId, entry] of Object.entries(entries)) {
      if (entry && typeof entry === "object" && !Array.isArray(entry)) {
        entry.enabled = allowedPlugins.has(pluginId);
      }
    }
    for (const pluginId of allowedPlugins) {
      entries[pluginId] = entries[pluginId] && typeof entries[pluginId] === "object" && !Array.isArray(entries[pluginId])
        ? entries[pluginId]
        : {};
      entries[pluginId].enabled = true;
    }
    config.plugins.entries = entries;
    if (config.channels && typeof config.channels === "object" && !Array.isArray(config.channels)) {
      for (const channel of ["slack", "telegram", "whatsapp"]) {
        if (
          allowedPlugins.has(channel) &&
          config.channels[channel] &&
          typeof config.channels[channel] === "object" &&
          !Array.isArray(config.channels[channel])
        ) {
          config.channels[channel].enabled = true;
        }
      }
    }
  }
  if (startupModel) {
    config.agents = config.agents && typeof config.agents === "object" && !Array.isArray(config.agents)
      ? config.agents
      : {};
    config.agents.defaults = config.agents.defaults && typeof config.agents.defaults === "object" && !Array.isArray(config.agents.defaults)
      ? config.agents.defaults
      : {};
    config.agents.defaults.model = {
      primary: startupModel,
      fallbacks: [],
    };
    delete config.agents.defaults.models;
  }
  fs.writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);
  console.log(`[qa-loop] patched OpenClaw config for QA: plugins=${pluginAllowlist || "unchanged"} model=${startupModel || "unchanged"}`);
  return () => {
    try {
      fs.writeFileSync(configPath, original);
      console.log("[qa-loop] restored OpenClaw config after QA run.");
    } catch (error) {
      console.warn(`[qa-loop] failed to restore OpenClaw config after QA run: ${error.message}`);
    }
  };
}

function qaDesktopTokenModelForProvider(provider) {
  const normalized = String(provider || "").trim().toLowerCase();
  const model = getModelText((MODELS_BY_PROVIDER[normalized] || [])[0]);
  return model || null;
}

function patchDesktopTokensForQa(provider) {
  const normalized = String(provider || "").trim().toLowerCase();
  const model = qaDesktopTokenModelForProvider(normalized);
  if (!normalized || !model || !process.env.APPDATA) return null;

  const tokensPath = path.join(process.env.APPDATA, "ai.knap.knapsack", "clawdbot", "tokens.json");
  if (!existsSync(tokensPath)) return null;

  const original = fs.readFileSync(tokensPath, "utf8");
  const parseable = original.replace(/^\uFEFF/, "");
  let tokens;
  try {
    tokens = JSON.parse(parseable);
  } catch (error) {
    console.warn(`[qa-loop] could not parse desktop token config for QA patch: ${error.message}`);
    return null;
  }

  if (!tokens || typeof tokens !== "object" || Array.isArray(tokens)) return null;
  tokens.active_provider = normalized === "google" ? "gemini" : normalized;
  const tokenModelKeyByProvider = {
    anthropic: "anthropic_model",
    gemini: "gemini_model",
    google: "gemini_model",
    groq: "groq_model",
    knapsack: "openai_model",
    openai: "openai_model",
    openrouter: "openrouter_model",
    xai: "xai_model",
  };
  const modelKey = tokenModelKeyByProvider[normalized];
  if (modelKey) {
    tokens[modelKey] = model;
  }

  fs.writeFileSync(tokensPath, `${JSON.stringify(tokens, null, 2)}\n`);
  console.log(`[qa-loop] patched desktop tokens for QA: provider=${tokens.active_provider} model=${model}`);
  return () => {
    try {
      fs.writeFileSync(tokensPath, original);
      console.log("[qa-loop] restored desktop tokens after QA run.");
    } catch (error) {
      console.warn(`[qa-loop] failed to restore desktop tokens after QA run: ${error.message}`);
    }
  };
}

function normalizeResult(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  return JSON.stringify(value);
}

function withTimeout(promise, timeoutMs, label) {
  let timer = null;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const error = new Error(`${label} timed out after ${timeoutMs}ms`);
      error.code = "QA_TIMEOUT";
      reject(error);
    }, timeoutMs);
  });
  return Promise.race([promise, timeout]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

function collectCliArgs() {
  const argv = process.argv.slice(2);
  if (!process.env.npm_config_argv) return argv;
  try {
    const parsed = JSON.parse(process.env.npm_config_argv);
    const original = Array.isArray(parsed?.original) ? parsed.original : [];
    const cooked = Array.isArray(parsed?.cooked) ? parsed.cooked : [];
    if (original.length > 0) {
      const markerIdx = original.findIndex((value) => value === "qa:loop");
      if (markerIdx >= 0 && markerIdx + 1 < original.length) {
        const tail = original.slice(markerIdx + 1);
        if (tail.length > 0) return tail;
      }
    }
    const markerIdx = cooked.findIndex((value) => value === "--");
    if (markerIdx >= 0 && markerIdx + 1 < cooked.length) {
      return cooked.slice(markerIdx + 1);
    }
  } catch {
    // ignore malformed npm metadata
  }
  return argv;
}

function parseArgs() {
  const args = collectCliArgs();
  const opts = {
    attemptsPerMode: 12,
    maxRetryDelayMs: 2_000,
    startupBudgetMs: 30_000,
    coreOnly: false,
    providers: null,
    prodBinary: process.env.KNAPSACK_QA_PROD_BINARY || null,
  };
  let mode = "both";
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--dev" || arg === "--qa-dev" || arg === "--both") {
      mode = arg === "--both" ? "both" : "dev";
      continue;
    }
    if (arg.startsWith("--mode=")) {
      const value = arg.split("=", 2)[1];
      if (value === "dev" || value === "both" || value === "prod") {
        mode = value;
      }
      continue;
    }
    if (arg === "--mode") {
      const next = args[i + 1];
      if (next === "dev" || next === "both" || next === "prod") {
        mode = next;
        i += 1;
      }
      continue;
    }
    if (arg === "--prod" || arg === "--release") {
      mode = "prod";
      continue;
    }
    if (arg === "--prod-binary" || arg === "--release-binary") {
      const next = args[i + 1];
      if (next) {
        opts.prodBinary = next;
        i += 1;
      }
      continue;
    }
    if (arg.startsWith("--prod-binary=") || arg.startsWith("--release-binary=")) {
      const value = arg.split("=", 2)[1];
      if (value) opts.prodBinary = value;
      continue;
    }
    if (
      arg === "--max-attempts" ||
      arg === "--attempts" ||
      arg === "--attempts-per-mode"
    ) {
      const next = args[i + 1];
      if (next && Number.isFinite(Number(next))) {
        opts.attemptsPerMode = Number.parseInt(next, 10);
        i += 1;
      }
      continue;
    }
    if (
      arg.startsWith("--max-attempts=") ||
      arg.startsWith("--attempts=") ||
      arg.startsWith("--attempts-per-mode=")
    ) {
      const v = Number.parseInt(arg.split("=")[1], 10);
      if (Number.isFinite(v)) opts.attemptsPerMode = v;
      continue;
    }
    if (arg === "--startup-budget-ms") {
      const next = args[i + 1];
      if (next && Number.isFinite(Number(next))) {
        opts.startupBudgetMs = Number.parseInt(next, 10);
        i += 1;
      }
      continue;
    }
    if (arg.startsWith("--startup-budget-ms=")) {
      const v = Number.parseInt(arg.split("=")[1], 10);
      if (Number.isFinite(v)) opts.startupBudgetMs = v;
      continue;
    }
    if (arg === "--core-only" || arg === "--skip-functional") {
      opts.coreOnly = true;
      continue;
    }
    if (arg === "--run-functional" || arg === "--with-functional") {
      opts.coreOnly = false;
      continue;
    }
    if (arg === "--provider" || arg === "--providers") {
      const next = args[i + 1];
      if (next) {
        opts.providers = next.split(",").map((value) => value.trim().toLowerCase()).filter(Boolean);
        i += 1;
      }
      continue;
    }
    if (arg.startsWith("--provider=") || arg.startsWith("--providers=")) {
      const parts = arg.includes("=") ? arg.split("=", 2) : [];
      const value = parts[1];
      if (value) {
        opts.providers = value.split(",").map((value) => value.trim().toLowerCase()).filter(Boolean);
      }
      continue;
    }
    if (/^\d+$/.test(arg)) {
      const v = Number.parseInt(arg, 10);
      if (Number.isFinite(v)) {
        opts.attemptsPerMode = v;
      }
    }
  }
  if (String(process.env.KNAPSACK_QA_CORE_ONLY || "").trim() === "1") {
    opts.coreOnly = true;
  }
  opts.mode = mode;
  return opts;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      stdio: "ignore",
      windowsHide: true,
      ...options,
    });
    child.on("error", () => resolve(false));
    child.on("close", (code) => resolve(code === 0));
  });
}

async function killOpenClawProcessesForQa() {
  if (process.platform !== "win32") return;
  const command = [
    "$matches = Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match 'openclaw.mjs gateway run|node_modules\\\\openclaw\\\\openclaw.mjs' };",
    "foreach($proc in $matches){",
    "  if($proc.ProcessId -ne $PID){",
    "    try { taskkill /F /T /PID $proc.ProcessId | Out-Null } catch {}",
    "  }",
    "}",
  ].join(" ");
  await runCommand("powershell.exe", ["-NoProfile", "-Command", command]);
}

function fetchWithTimeout(url, options = {}, timeoutMs = 8_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, {
    ...options,
    signal: controller.signal,
  })
    .finally(() => clearTimeout(timer))
    .then(async (res) => {
      const headers = Object.fromEntries(res.headers.entries());
      const text = await res.text();
      let body = text;
      try {
        body = JSON.parse(text);
      } catch {
        // keep text when endpoint doesn't return JSON
      }
      return { ok: res.ok, status: res.status, headers, body };
    });
}

function isExpectedStatusSuccess(payload, endpoint) {
  if (!payload) return false;
  if (endpoint === "status") {
    return Boolean(payload.success && payload.gateway_ok && payload.browser_ok && payload.channels_ok);
  }
  return true;
}

async function probeBrowserControl(timeoutMs = 1_200) {
  const endpoints = [
    "http://127.0.0.1:18791/ready",
    "http://127.0.0.1:18800/json/version",
    "http://127.0.0.1:18900",
  ];
  for (const endpoint of endpoints) {
    try {
      const response = await fetchWithTimeout(endpoint, {}, timeoutMs);
      if (response?.ok) {
        return true;
      }
    } catch {
      // no-op; keep probing
    }
  }
  return false;
}

function summarizeStartupState(payload) {
  const startup = payload.startup || {};
  const status = payload.status || {};
  const health = payload.health || {};
  const channels = payload.channels || {};
  return {
    startup_success: Boolean(startup.success),
    startup_message: startup.message || null,
    startup_elapsed_ms: startup.startup_elapsed_ms,
    service_running: Boolean(status.success && status.running && status.installed),
    gateway_ok: Boolean(health.gateway_ok),
    gateway_listening: Boolean(health.gateway_listening),
    browser_ok: Boolean(health.browser_ok),
    channels_ok: Boolean(channels.success),
    channels_summary_count: Array.isArray(channels.channelSummary)
      ? channels.channelSummary.length
      : undefined,
    channels_configured_count: Array.isArray(channels.configuredChannels)
      ? channels.configuredChannels.length
      : undefined,
  };
}

function killWindowsPortListeners(ports) {
  if (process.platform !== "win32") return;
  try {
    const out = require("node:child_process")
      .execSync("netstat -ano -p tcp")
      .toString("utf8");
    const wanted = new Set(String(ports).split(","));
    const pids = new Set();
    for (const line of out.split(/\r?\n/)) {
      if (!/LISTENING/i.test(line)) continue;
      const parts = line.trim().split(/\s+/);
      const local = parts[1] || "";
      const pid = Number(parts[parts.length - 1]);
      const port = String(local.split(":").pop());
      if (wanted.has(port) && Number.isInteger(pid) && pid > 0 && pid !== process.pid) {
        pids.add(pid);
      }
    }
    for (const pid of pids) {
      try {
        require("node:child_process").spawnSync("taskkill", ["/PID", String(pid), "/F", "/T"]);
      } catch {
        // best effort
      }
    }
  } catch {
    // ignore
  }
}

async function ensureCleanPorts(ports) {
  if (process.platform !== "win32") return;
  for (let i = 0; i < 5; i++) {
    killWindowsPortListeners(ports);
    await sleep(250);
  }
}

function probeTcpPort(port, timeoutMs = 250) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: "127.0.0.1", port });
    const done = (ok) => {
      socket.removeAllListeners();
      socket.destroy();
      resolve(ok);
    };
    socket.setTimeout(timeoutMs);
    socket.once("connect", () => done(true));
    socket.once("timeout", () => done(false));
    socket.once("error", () => done(false));
  });
}

async function captureLivenessSnapshot() {
  const [apiOpen, gatewayOpen, browserOpen, status, health] = await Promise.all([
    probeTcpPort(8897, 250),
    probeTcpPort(18789, 250),
    probeTcpPort(18800, 250),
    fetchWithTimeout(`${API_BASE}/api/clawd/service/status`, { method: "GET" }, 1_500)
      .then((resp) => (resp?.ok ? resp.body : { status: resp?.status || 0 }))
      .catch((error) => ({ error: normalizeResult(error?.message || error) })),
    fetchWithTimeout(`${API_BASE}/api/clawd/service/health`, { method: "GET" }, 1_500)
      .then((resp) => (resp?.ok ? resp.body : { status: resp?.status || 0 }))
      .catch((error) => ({ error: normalizeResult(error?.message || error) })),
  ]);
  return {
    apiOpen,
    gatewayOpen,
    browserOpen,
    status,
    health,
  };
}

async function waitForServiceApiAvailable(proc, timeoutMs = 120_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (proc.exitCode !== null) {
      const signal = proc.signalCode || "none";
      return {
        ok: false,
        message: `launcher exited before service API became available (exitCode=${proc.exitCode}, signal=${signal})`,
      };
    }
    try {
      const resp = await fetchWithTimeout(`${API_BASE}/api/clawd/service/status`, { method: "GET" }, 2_000);
      if (resp?.ok) {
        return { ok: true, elapsedMs: Date.now() - start };
      }
    } catch {
      // keep waiting for the app backend, not the gateway, to come online.
    }
    await sleep(500);
  }
  return {
    ok: false,
    message: `service API did not become available within ${timeoutMs}ms`,
  };
}

function spawnApp(config) {
  const hideWindows = process.platform === "win32" ? { windowsHide: true } : {};
  const common = {
    cwd: path.resolve(__dirname, ".."),
    env: { ...process.env, ...config.env },
    stdio: ["ignore", "pipe", "pipe"],
    ...hideWindows,
  };
  if (config.command === "dev") {
    const qaDevEnv = {
      ...common.env,
      VITE_KN_API_SERVER: "https://api.knapsack.ai",
      KNAPSACK_HEALTH_AUTO_START_BROWSER: "1",
      KNAPSACK_STARTUP_READY_AUTO_START_BROWSER: "1",
      KNAPSACK_QA_SERVICE_READY_TIMEOUT_MS: process.env.KNAPSACK_QA_SERVICE_READY_TIMEOUT_MS || "120000",
    };
    if (!Object.prototype.hasOwnProperty.call(process.env, "KNAPSACK_QA_SKIP_RUST_BUILD")) {
      qaDevEnv.KNAPSACK_QA_SKIP_RUST_BUILD = "1";
    }
    qaDevEnv.KNAPSACK_QA_SKIP_OPENCLAW_WARMUP = "1";
    return spawn(process.execPath, [path.join("scripts", "qa-dev-run.cjs")], {
      ...common,
      windowsHide: true,
      env: qaDevEnv,
    });
  }
  return spawn(config.binary, [], common);
}

function prepareDevRuntime(env) {
  const result = spawnSync(process.execPath, [path.join("scripts", "qa-dev-run.cjs")], {
    cwd: path.resolve(__dirname, ".."),
    env: {
      ...process.env,
      ...env,
      VITE_KN_API_SERVER: "https://api.knapsack.ai",
      KNAPSACK_QA_SKIP_RUST_BUILD: process.env.KNAPSACK_QA_SKIP_RUST_BUILD || "1",
      KNAPSACK_QA_PREPARE_ONLY: "1",
    },
    encoding: "utf8",
    windowsHide: true,
    timeout: Number(process.env.KNAPSACK_QA_PREPARE_TIMEOUT_MS || 180_000),
  });
  const output = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
  if (output) {
    console.log("[qa-loop] dev prepare output:");
    output.split(/\r?\n/).slice(-30).forEach((line) => console.log(`  ${line}`));
  }
  if (result.status !== 0) {
    return {
      ok: false,
      message: `dev prepare failed (status=${result.status}, signal=${result.signal || "none"})`,
    };
  }
  return { ok: true };
}

async function waitForStartupReady({ label, startupBudgetMs = 30_000 }) {
  const start = Date.now();
  const deadline = Date.now() + startupBudgetMs;
  let lastStartupState = {};
  let status = null;
  let health = null;
  let channels = null;
  let channelsReady = false;
  let lastChannelsPollMs = 0;
  let lastHealthPollMs = 0;
  let startupReady = null;
  let startupReadySeen = false;
  let stableTicks = 0;
  let lastReadySignature = "";

  while (Date.now() < deadline) {
    const now = Date.now();
    const startupReadyTimeoutMs = Math.max(
      500,
      Math.min(2_500, deadline - Date.now() + 250),
    );
    const startupReadyResp = await fetchWithTimeout(
      `${API_BASE}/api/clawd/service/startup-ready`,
      { method: "GET" },
      startupReadyTimeoutMs,
    ).then((resp) => (resp?.ok ? resp.body : null)).catch(() => null);
    if (startupReadyResp && typeof startupReadyResp === "object") {
      startupReady = startupReadyResp;
      startupReadySeen = Boolean(startupReadyResp.success);
    }

    const gatewayTcpOpen = await probeTcpPort(18789, 250);
    const serviceRunning = Boolean(
      (status?.success && status.running && status.installed) ||
        startupReady?.gateway_ok === true ||
        gatewayTcpOpen,
    );
    const browserOk = Boolean(
      startupReady?.browser_ok === true ||
        health?.browser_ok ||
        health?.browser_listening ||
        (await probeBrowserControl(900)),
    );
    const cheapChannelsReady = Boolean(
      status?.channels_ok === true ||
        health?.channels_ok === true ||
        health?.channels_ready === true ||
        startupReady?.channels_ok === true,
    );
    const gatewayReachableForDiagnostics = Boolean(
      gatewayTcpOpen ||
        startupReady?.gateway_ok === true ||
        health?.gateway_ok === true ||
        health?.gateway_listening === true,
    );
    const shouldPollChannels =
      cheapChannelsReady === false &&
      gatewayReachableForDiagnostics &&
      now - lastChannelsPollMs >= 10_000;
    const shouldPollHealth = now - lastHealthPollMs >= 5_000;
    const channelsTimeoutMs = 1_500;
    const channelsPoll = shouldPollChannels
      ? fetchWithTimeout(
        `${API_BASE}/api/clawd/channels/diagnostics`,
        { method: "GET" },
        channelsTimeoutMs,
      ).then((resp) => (resp?.ok ? { ok: true, body: resp.body } : null)).catch(() => null)
      : Promise.resolve(null);

    const [statusResp, healthResp, channelsResp] = await Promise.all([
      fetchWithTimeout(`${API_BASE}/api/clawd/service/status`, { method: "GET" }, 1_200)
        .then((resp) => (resp.ok ? resp.body : null))
        .catch(() => null),
      shouldPollHealth ? fetchWithTimeout(`${API_BASE}/api/clawd/service/health`, { method: "GET" }, 1_500)
        .then((resp) => (resp.ok ? resp.body : null))
        .catch(() => null) : Promise.resolve(null),
      channelsPoll,
    ]);

    if (shouldPollChannels) lastChannelsPollMs = now;
    if (shouldPollHealth) lastHealthPollMs = now;
    if (statusResp && typeof statusResp === "object") {
      status = statusResp;
    }
    if (healthResp && typeof healthResp === "object") {
      health = healthResp;
    }
    if (channelsResp && channelsResp.body && typeof channelsResp.body === "object") {
      channels = channelsResp.body;
      channelsReady = Boolean(channelsResp.body.success);
    }
    const isStartupReady = Boolean(startupReadySeen);
    const resolvedServiceRunning = Boolean(
      (status?.success && status.running && status.installed) ||
        startupReady?.gateway_ok === true ||
        gatewayTcpOpen,
    );
    const gatewayOk = Boolean(
      (serviceRunning && health?.gateway_ok) ||
        (Boolean(serviceRunning) && Boolean(health?.gateway_listening)) ||
        startupReady?.gateway_ok === true ||
        gatewayTcpOpen,
    );

    const resolvedChannelsReady = channelsReady || Boolean(
      startupReady?.channels_ok === true ||
        status?.channels_ok === true ||
        health?.channels_ok === true ||
        health?.channels_ready === true,
    );
    const authoritativeReady = Boolean(
      startupReady?.success === true &&
        startupReady?.gateway_ok === true &&
        startupReady?.browser_ok === true &&
        startupReady?.channels_ok === true,
    );
    const readySignature = JSON.stringify({
      serviceRunning: resolvedServiceRunning,
      gatewayOk,
      browserOk,
      resolvedChannelsReady,
      authoritativeReady,
    });
    const readinessOk = resolvedServiceRunning && authoritativeReady;

    if (readinessOk && readySignature === lastReadySignature) {
      stableTicks = Math.min(stableTicks + 1, 4);
    } else if (readinessOk) {
      stableTicks = 1;
    } else {
      stableTicks = 0;
    }
    lastReadySignature = readySignature;

    const startupAndReady = authoritativeReady;
    const active = resolvedServiceRunning && readinessOk && (authoritativeReady || isStartupReady || stableTicks >= 2);

    lastStartupState = {
      serviceRunning: resolvedServiceRunning,
      gatewayOk: Boolean(gatewayOk),
      browserOk: Boolean(browserOk),
      startupReadySeen: isStartupReady,
      authoritativeReady,
      stableTicks,
      channelsReady,
      resolvedChannelsReady,
      startupAndReady,
      active,
      startupMessage: startupReady?.message || null,
      startupElapsedMs: startupReady?.startup_elapsed_ms,
    };

    if (active && stableTicks >= 2) {
      return {
        ok: true,
        startupMs: startupReady?.startup_elapsed_ms || Date.now() - start,
        payload: {
          startup: startupReady,
          status,
          health,
          channels,
        },
      };
    }

    await sleep(250);
  }

  return {
    ok: false,
    startupMs: Date.now() - start,
    payload: {
      startup: startupReady,
      status,
      health,
      channels,
    },
    note: `${label} did not reach active+stable gateway/browser/channels within ${startupBudgetMs}ms ` +
      `(${JSON.stringify(lastStartupState)})`,
    debug: lastStartupState,
  };
}

function toPayload(result, fallback = {}) {
  if (!result) return null;
  return result.body ? result.body : fallback;
}

async function waitForGatewayHealthReady({ budgetMs = 60_000, stableChecks = 2, startupReady = null } = {}) {
  const start = Date.now();
  const deadline = start + budgetMs;
  let lastHealth = null;
  let stable = 0;

  if (
    startupReady?.success === true &&
    startupReady?.gateway_ok === true &&
    startupReady?.browser_ok === true &&
    startupReady?.channels_ok === true &&
    String(process.env.KNAPSACK_QA_REQUIRE_SERVICE_HEALTH || "").trim() !== "1"
  ) {
    return {
      ok: true,
      elapsedMs: 0,
      health: startupReady,
      via: "startup-ready",
    };
  }

  while (Date.now() < deadline) {
    try {
      const resp = await fetchWithTimeout(
        `${API_BASE}/api/clawd/service/health`,
        { method: "GET" },
        Math.min(8_000, Math.max(1_000, deadline - Date.now())),
      );
      if (resp?.ok && resp.body && typeof resp.body === "object") {
        lastHealth = resp.body;
        if (resp.body.success === true && resp.body.gateway_ok === true) {
          stable += 1;
          if (stable >= stableChecks) {
            return {
              ok: true,
              elapsedMs: Date.now() - start,
              health: resp.body,
            };
          }
        } else {
          stable = 0;
        }
      } else {
        stable = 0;
      }
    } catch {
      stable = 0;
    }
    await sleep(500);
  }

  return {
    ok: false,
    elapsedMs: Date.now() - start,
    health: lastHealth,
  };
}

function getModelText(model) {
  if (typeof model === "string") return model;
  if (model && typeof model === "object") {
    if (typeof model.id === "string") return model.id;
  }
  return "";
}

function readinessProviderModels(opts) {
  const provider = opts?.providers?.[0] || "gemini";
  const models = MODELS_BY_PROVIDER[provider] || [];
  const model = getModelText(models[0]);
  return model ? [[provider, [model]]] : [];
}

async function ensureGatewayEnabledForQA(timeoutMs = 12_000) {
  try {
    const enableResp = await fetchWithTimeout(`${API_BASE}/api/clawd/service/enable`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: true }),
    }, timeoutMs);
    return Boolean(enableResp?.ok && enableResp.body?.success);
  } catch {
    return false;
  }
}

async function setProviderAndModel(provider, model) {
  const req = await fetchWithTimeout(`${API_BASE}/api/clawd/service/set-api-key`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      provider,
      model,
      key: "",
    }),
  }, 12_000);
  return {
    ok: Boolean(req.ok),
    payload: req.body,
    status: req.status,
  };
}

async function runChatSmoke(provider, model, options = {}) {
  try {
    if (!options.skipModelSetup) {
      const setting = await setProviderAndModel(provider, model);
      if (!setting.ok) {
        const msg = normalizeResult(setting.payload?.message || setting.payload);
        const keyMissing = typeof msg === "string" && msg.includes("API key cannot be empty");
        return {
          provider,
          model,
          ok: false,
          skipped: keyMissing,
          detail: msg || "could not switch provider/model",
        };
      }
    }

    const payload = {
      text: `QA typing test at ${new Date().toISOString()} for ${provider}/${model}`,
      sessionId: `qa-${provider}-${model}`.replace(/[^A-Za-z0-9._-]/g, "-"),
      disableFallback: true,
      qaSmoke: true,
    };
    const chatRetries = 1;
    const chatTimeoutMs = Number(process.env.KNAPSACK_QA_CHAT_TIMEOUT_MS || 45_000);
    let attemptChat = 0;
    let chat;

    while (attemptChat < chatRetries) {
      attemptChat += 1;
      try {
        chat = await fetchWithTimeout(`${API_BASE}/api/clawd/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }, chatTimeoutMs);
      } catch (error) {
        const message = normalizeResult(error?.message || error);
        const retryable = typeof message === "string" && (
          message.includes("aborted") ||
          message.includes("ETIMEDOUT") ||
          message.includes("timed out") ||
          message.includes("socket hang up")
        );
        if (retryable && attemptChat < chatRetries) {
          await sleep(1_000);
          continue;
        }
        return {
          provider,
          model,
          ok: false,
          skipped: retryable,
          detail: `chat request failed: ${message}`,
        };
      }

      if (!chat.ok) {
        const shouldRetry =
          (chat.status === 429 || chat.status >= 500) && attemptChat < chatRetries;
        if (shouldRetry) {
          await sleep(1_000);
          continue;
        }
        return {
          provider,
          model,
          ok: false,
          skipped: false,
          detail: `chat failed (${chat.status}) ${normalizeResult(chat.body)}`,
        };
      }
      break;
    }

    const body = chat.body || {};
    if (!body.ok) {
      return {
        provider,
        model,
        ok: false,
        skipped: false,
        detail: `chat response not ok: ${normalizeResult(body)}`,
      };
    }

    const hasChatOutput = Boolean(
      (body.message && (body.message.text || body.message.content || body.message.message)) ||
      typeof body.summary === "string" ||
      typeof body.response === "string" ||
      typeof body.text === "string" ||
      typeof body.reply === "string" ||
      typeof body.result === "string",
    );

    if (!hasChatOutput) {
      return {
        provider,
        model,
        ok: false,
        skipped: false,
        detail: `chat response missing message/summary fields: ${normalizeResult(body)}`,
      };
    }
    return { provider, model, ok: true };
  } catch (error) {
    const message = normalizeResult(error?.message || error);
    return {
      provider,
      model,
      ok: false,
      skipped: (
        typeof message === "string" &&
        (
          message.includes("aborted") ||
          message.includes("ETIMEDOUT") ||
          message.includes("timed out") ||
          message.includes("socket hang up")
        )
      ),
      detail: `chat request failed: ${message || "network error"}`,
    };
  }
}

async function createMockMeeting() {
  const timestamp = Date.now();
  const requestTimeoutMs = 30_000;
  const requestWithRetry = async (name, init) => {
    let lastError = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetchWithTimeout(init.url, init.options, requestTimeoutMs);
        return response;
      } catch (error) {
        lastError = error;
        const message = normalizeResult(error?.message || error);
        if (message.includes("aborted") || message.includes("timed out") || message.includes("ETIMEDOUT")) {
          if (attempt < 2) {
            await sleep(1_000);
            continue;
          }
          return {
            ok: false,
            status: 0,
            body: { error: `Request ${name} ${message}` },
          };
        }
        return {
          ok: false,
          status: 0,
          body: { error: `Request ${name} ${message}` },
        };
      }
    }
    return {
      ok: false,
      status: 0,
      body: lastError ? { error: normalizeResult(lastError) } : { error: `Request ${name} failed` },
    };
  };

  const feed = await requestWithRetry("feed_items", {
    url: `${API_BASE}/api/knapsack/feed_items`,
    options: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timestamp, title: "QA Loop Mock Meeting" }),
    },
  });
  if (!feed.ok || !feed.body?.data?.id) {
    return {
      ok: false,
      detail: `create feed item failed (${feed.status}) ${normalizeResult(feed.body)}`,
    };
  }
  const feedItemId = feed.body.data.id;

  const thread = await requestWithRetry("threads", {
    url: `${API_BASE}/api/knapsack/threads`,
    options: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        timestamp,
        hide_follow_up: false,
        feed_item_id: feedItemId,
        thread_type: "MEETING_NOTES",
        title: "QA Loop Meeting Notes",
        subtitle: "automated smoke test",
      }),
    },
  });
  if (!thread.ok || !thread.body?.thread?.id) {
    return {
      ok: false,
      detail: `create thread failed (${thread.status}) ${normalizeResult(thread.body)}`,
    };
  }
  const threadId = thread.body.thread.id;

  const start = await requestWithRetry("start_recording", {
    url: `${API_BASE}/api/knapsack/start_recording`,
    options: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        thread_id: threadId,
        feed_item_id: feedItemId,
        event_id: 0,
        save_transcript: false,
      }),
    },
  });
  if (!start.ok) {
    const alreadyRecording =
      typeof start.body?.error === "string" &&
      start.body.error.toLowerCase().includes("already in progress");
    if (alreadyRecording) {
      const stopRecovery = await requestWithRetry("stop_recording", {
        url: `${API_BASE}/api/knapsack/stop_recording`,
        options: {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ thread_id: threadId, event_id: 0, save_transcript: false }),
        },
      });
      if (stopRecovery.ok) {
        const retryStart = await requestWithRetry("start_recording", {
          url: `${API_BASE}/api/knapsack/start_recording`,
          options: {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              thread_id: threadId,
              feed_item_id: feedItemId,
              event_id: 0,
              save_transcript: false,
            }),
          },
        });
        if (retryStart.ok) {
          await sleep(1_200);
        } else {
          return {
            ok: false,
            detail: `retry start_recording failed (${retryStart.status}) ${normalizeResult(retryStart.body)}`,
          };
        }
      } else {
        return {
          ok: false,
          detail: `start_recording failed (${start.status}) ${normalizeResult(start.body)}; cleanup stop failed (${stopRecovery.status}) ${normalizeResult(stopRecovery.body)}`,
        };
      }
    } else {
    return {
      ok: false,
      detail: `start_recording failed (${start.status}) ${normalizeResult(start.body)}`,
    };
    }
  }
  if (start.ok) {
    await sleep(1_200);
  }

  const stop = await requestWithRetry("stop_recording", {
    url: `${API_BASE}/api/knapsack/stop_recording`,
    options: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        thread_id: threadId,
        event_id: 0,
        save_transcript: false,
      }),
    },
  });
  if (!stop.ok) {
    return {
      ok: false,
      detail: `stop_recording failed (${stop.status}) ${normalizeResult(stop.body)}`,
    };
  }
  return { ok: true };
}

async function checkInterfaceAccess(includeUi) {
  const retryWithDelay = async (thunk, attempts = 3, delayMs = 500) => {
    let result = null;
    for (let attempt = 0; attempt < attempts; attempt++) {
      result = await thunk().catch(() => null);
      if (result) return result;
      if (attempt + 1 < attempts) {
        await sleep(delayMs);
      }
    }
    return result;
  };

  const root = await retryWithDelay(
    () => fetchWithTimeout(`${API_BASE}/api/clawd/service/status`, { method: "GET" }, 8_000),
    4,
    1_000,
  );
  const health = await retryWithDelay(
    () => fetchWithTimeout(`${API_BASE}/api/clawd/service/health`, { method: "GET" }, 8_000),
    4,
    1_000,
  );
  const workspaces = await retryWithDelay(
    () => fetchWithTimeout(`${API_BASE}/api/knapsack/workspaces`, { method: "GET" }, 8_000),
    4,
    1_000,
  );

  const channels = await retryWithDelay(
    () => fetchWithTimeout(`${API_BASE}/api/clawd/channels/diagnostics`, { method: "GET" }, 30_000),
    3,
    1_000,
  );
  const automations = await retryWithDelay(
    () => fetchWithTimeout(`${API_BASE}/api/knapsack/automations`, { method: "GET" }, 10_000),
    3,
    1_000,
  );
  const skills = await retryWithDelay(
    () => fetchWithTimeout(`${API_BASE}/api/clawd/skills/status`, { method: "GET" }, 8_000),
    4,
    1_000,
  );
  const feed = await retryWithDelay(
    () => fetchWithTimeout(`${API_BASE}/api/knapsack/feed_items`, { method: "GET" }, 8_000),
    4,
    1_000,
  );
  const ui = includeUi
    ? await retryWithDelay(
      () => fetchWithTimeout(`${UI_BASE}/home`, { method: "GET" }, 8_000),
      4,
      1_000,
    )
    : { ok: true };
  const browserControl = await retryWithDelay(
    () => probeBrowserControl(20_000),
    8,
    1_000,
  );

  const failures = [];
  if (!root || !root.ok) failures.push("service/status unhealthy");
  if (!health || !health.ok) failures.push("service/health unhealthy");
  const channelsOk = (channels && channels.ok) || Boolean((root && root.body && root.body.channels_ok));
  if (!channelsOk) failures.push("channels diagnostics unavailable");
  const channelStates = Array.isArray(channels?.body?.channelStates)
    ? channels.body.channelStates
    : [];
  const configuredChannelStates = channelStates.filter((state) => state && state.configured);
  const strictChannelTransports =
    String(process.env.KNAPSACK_QA_REQUIRE_CHANNEL_TRANSPORTS || "").trim() === "1";
  if (strictChannelTransports) {
    const inactiveConfiguredChannels = configuredChannelStates
      .filter((state) => !state.deferred && !state.active)
      .map((state) => `${state.channel}:${state.reason || "not active"}`);
    if (inactiveConfiguredChannels.length > 0) {
      failures.push(`configured channel transports inactive: ${inactiveConfiguredChannels.join("; ")}`);
    }
  }
  if (!skills || !skills.ok || skills.body?.success !== true) failures.push("skills status unavailable");
  if (!workspaces || !workspaces.ok) failures.push("workspaces unavailable");
  if (!feed || !feed.ok) failures.push("feed_items unavailable");
  if (automations?.ok) {
    if (!Array.isArray(automations.body?.data)) {
      failures.push("automations response malformed");
    }
  } else {
    failures.push("automations unavailable");
  }
  if (includeUi && (!ui || !ui.ok)) failures.push("UI /home unreachable");
  const uiBrowserOk = browserControl || Boolean(health?.body?.browser_ok);
  if (!uiBrowserOk) failures.push("browser control not reachable");
  return {
    ok: failures.length === 0,
    failures,
    coverage: {
      homeRoute: includeUi ? Boolean(ui?.ok) : "not-applicable",
      gbrainSection: includeUi ? "requires rendered UI check on /home" : "not-applicable",
      emailAutopilot: "feed/automation APIs checked; rendered panel requires UI browser check",
      automationsApi: Boolean(automations?.ok && Array.isArray(automations.body?.data)),
      feedApi: Boolean(feed?.ok),
      browserControl: Boolean(uiBrowserOk),
      channelStates,
      configuredChannelsActive: configuredChannelStates.filter((state) => state.active).map((state) => state.channel),
      configuredChannelsDeferred: configuredChannelStates.filter((state) => state.deferred).map((state) => state.channel),
      strictChannelTransports,
    },
  };
}

async function runMode(mode, opts = {}) {
  const isProd = mode === "prod";
  const defaultBinary = path.join(
    __dirname,
    "..",
    "src-tauri",
    "target",
    isProd ? "release" : "debug",
    process.platform === "win32" ? "knapsack.exe" : "knapsack",
  );
  const binary = isProd && opts.prodBinary
    ? path.resolve(opts.prodBinary)
    : defaultBinary;
  if (isProd && !existsSync(binary)) {
    return { ok: false, phase: "launch", message: `missing binary at ${binary}` };
  }

  await ensureCleanPorts([8897, 1420, 18789, 18791, 18800]);
  const launchEnv = {
    OPENCLAW_DISABLE_BUNDLED_PLUGINS: process.env.OPENCLAW_DISABLE_BUNDLED_PLUGINS || "1",
    KNAPSACK_HEALTH_AUTO_START_BROWSER: "1",
    KNAPSACK_STARTUP_READY_AUTO_START_BROWSER: "1",
    KNAPSACK_STARTUP_READY_DIRECT_CHROME: "1",
  };
  const qaPluginAllowlist = qaPluginAllowlistForProviders(opts.providers);
  if (qaPluginAllowlist) {
    launchEnv.OPENCLAW_DISABLE_BUNDLED_PLUGINS = "0";
  }
  if (pluginAllowlistIncludesChannel(qaPluginAllowlist)) {
    launchEnv.KNAPSACK_EAGER_CHANNEL_PLUGINS = "1";
  }
  if (qaPluginAllowlist) {
    launchEnv.KNAPSACK_QA_PLUGIN_ALLOWLIST = qaPluginAllowlist;
    console.log(`[qa-loop] using QA plugin allowlist: ${qaPluginAllowlist}`);
  }
  if (opts.providers?.length === 1) {
    launchEnv.KNAPSACK_QA_PROVIDER = opts.providers[0];
  }
  let restoreQaConfig = patchOpenClawConfigForQa({
    pluginAllowlist: qaPluginAllowlist,
    provider: opts.providers?.length === 1 ? opts.providers[0] : null,
  });
  let restoreQaTokens = opts.providers?.length === 1
    ? patchDesktopTokensForQa(opts.providers[0])
    : null;
  if (!isProd) {
    const prepared = prepareDevRuntime(launchEnv);
    if (!prepared.ok) {
      if (restoreQaTokens) restoreQaTokens();
      if (restoreQaConfig) restoreQaConfig();
      return { ok: false, phase: "prepare", message: prepared.message };
    }
  }
  const proc = spawnApp(isProd ? { command: "release", binary, env: launchEnv } : { command: "dev", env: launchEnv });
  const label = isProd ? "prod" : "dev";
  const startupLog = [];

  const cleanup = async () => {
    if (proc.exitCode === null) {
      try {
        if (!proc.killed) {
          proc.kill("SIGTERM");
        }
      } catch {
        // ignore
      }
      if (process.platform === "win32" && proc.pid) {
        await runCommand("taskkill", ["/F", "/T", "/PID", String(proc.pid)]);
      }
    }
    await killOpenClawProcessesForQa();
    await ensureCleanPorts([8897, 1420, 18789, 18791, 18800]);
    await killOpenClawProcessesForQa();
    if (restoreQaTokens) {
      const restore = restoreQaTokens;
      restoreQaTokens = null;
      restore();
    }
    if (restoreQaConfig) {
      const restore = restoreQaConfig;
      restoreQaConfig = null;
      restore();
    }
  };

  proc.stdout?.on("data", (chunk) => {
    startupLog.push(chunk.toString("utf8").trim());
    if (startupLog.length > 600) startupLog.shift();
  });
  proc.stderr?.on("data", (chunk) => {
    startupLog.push(chunk.toString("utf8").trim());
    if (startupLog.length > 600) startupLog.shift();
  });
  proc.once("exit", () => {
    // no-op: cleanup is handled by parent loop
  });

  const serviceApiTimeoutMs = isProd
    ? Number(process.env.KNAPSACK_QA_PROD_LAUNCH_TIMEOUT_MS || 120_000)
    : Number(process.env.KNAPSACK_QA_DEV_LAUNCH_TIMEOUT_MS || 300_000);
  const serviceApi = await waitForServiceApiAvailable(proc, serviceApiTimeoutMs);
  if (!serviceApi.ok) {
    await cleanup();
    return {
      ok: false,
      phase: "launch",
      message: serviceApi.message,
      startupLog,
    };
  }

  await ensureGatewayEnabledForQA(2_500);

  const startup = await waitForStartupReady({ label, startupBudgetMs: opts.startupBudgetMs || 30_000 });
  if (!startup.ok) {
    const payloadSummary = summarizeStartupState(startup.payload || {});
    const liveness = await captureLivenessSnapshot();
    await cleanup();
    return {
      ok: false,
      phase: "startup",
      message: `${startup.note || "startup never stabilized"} (${JSON.stringify(payloadSummary)})`,
      startupLog,
      startup,
      liveness,
    };
  }

  if (opts.coreOnly) {
    await cleanup();
    return {
      ok: true,
      phase: "core-ready",
      startup,
      chatChecks: [],
    };
  }

  const functionalTimeoutMs = Number(process.env.KNAPSACK_QA_FUNCTIONAL_TIMEOUT_MS || 90_000);
  let functionalResult;
  const functionalProgress = {
    step: "starting",
    startedAt: new Date().toISOString(),
    chatChecks: [],
  };
  try {
    functionalResult = await withTimeout((async () => {
      const chatChecks = [];
      const chatFailures = [];
      const providers = readinessProviderModels(opts);
      if (providers.length === 0) {
        return {
          ok: false,
          phase: "readiness-chat",
          message: `no readiness model for --provider value(s): ${(opts.providers || []).join(",")}`,
        };
      }

      functionalProgress.step = "gateway health";
      const gatewayHealth = await waitForGatewayHealthReady({
        budgetMs: Number(process.env.KNAPSACK_QA_READINESS_HEALTH_TIMEOUT_MS || 60_000),
        startupReady: startup.payload?.startup,
      });
      if (!gatewayHealth.ok) {
        return {
          ok: false,
          phase: "readiness-health",
          message: `gateway health did not stabilize before chat readiness (${JSON.stringify(gatewayHealth.health || {})})`,
          chatChecks,
        };
      }
      functionalProgress.gatewayHealth = gatewayHealth;

      for (const [provider, models] of providers) {
        for (const modelEntry of models) {
          const model = getModelText(modelEntry);
          if (!model) {
            continue;
          }
          functionalProgress.step = `chat ${provider}/${model}`;
          const check = await runChatSmoke(provider, model, { skipModelSetup: true });
          chatChecks.push(check);
          functionalProgress.chatChecks = chatChecks;
          if (!check.ok) {
            chatFailures.push(`${check.provider}/${check.model}: ${check.detail}`);
          }
        }
      }

      if (chatFailures.length > 0) {
        return {
          ok: false,
          phase: "readiness-chat",
          message: `readiness chat check failed: ${chatFailures.join(" | ")}`,
          chatChecks,
        };
      }

      functionalProgress.step = "mock meeting";
      const meeting = await createMockMeeting();
      if (!meeting.ok) {
        return {
          ok: false,
          phase: "recording",
          message: meeting.detail,
          chatChecks,
        };
      }

      let interfaces = null;
      for (let interfaceAttempt = 1; interfaceAttempt <= 3; interfaceAttempt++) {
        functionalProgress.step = `interfaces attempt ${interfaceAttempt}`;
        interfaces = await checkInterfaceAccess(!isProd);
        if (interfaces.ok) break;
        if (interfaceAttempt < 3) {
          await sleep(interfaceAttempt * 1000);
        }
      }
      if (!interfaces || !interfaces.ok) {
        return {
          ok: false,
          phase: "interfaces",
          message: interfaces ? interfaces.failures.join(", ") : "interface check did not return",
          chatChecks,
          interfaceCoverage: interfaces?.coverage,
        };
      }

      return {
        ok: true,
        phase: "complete",
        chatChecks,
        interfaceCoverage: interfaces.coverage,
      };
    })(), functionalTimeoutMs, "post-startup functional checks");
  } catch (error) {
    functionalResult = {
      ok: false,
      phase: "functional-timeout",
      message: `${normalizeResult(error?.message || error)} while running ${functionalProgress.step}`,
      chatChecks: functionalProgress.chatChecks,
      progress: functionalProgress,
    };
  }

  if (!functionalResult.ok) {
    const liveness = await captureLivenessSnapshot();
    await cleanup();
    return {
      ok: false,
      phase: functionalResult.phase,
      message: functionalResult.message,
      chatChecks: functionalResult.chatChecks || [],
      startup,
      liveness,
      functionalProgress: functionalResult.progress || functionalProgress,
      interfaceCoverage: functionalResult.interfaceCoverage,
    };
  }

  await cleanup();
  return {
    ok: true,
    phase: "complete",
    startup,
    chatChecks: functionalResult.chatChecks,
    interfaceCoverage: functionalResult.interfaceCoverage,
  };
}

async function runLoop() {
  const opts = parseArgs();
  const modes =
    opts.mode === "prod"
      ? ["prod"]
      : opts.mode === "dev"
        ? ["dev"]
        : ["dev", "prod"];
  const attemptsPerMode = Math.max(1, Number.isInteger(opts.attemptsPerMode) ? opts.attemptsPerMode : 1);
  const summary = {};

  for (const mode of modes) {
    let attempt = 0;
    let modeResult = null;
    while (attempt < attemptsPerMode) {
      attempt += 1;
      if (attempt > 1) {
        await ensureCleanPorts([8897, 1420, 18789, 18791, 18800]);
        await sleep(opts.maxRetryDelayMs);
      }
      modeResult = await runMode(mode, opts);
      if (modeResult.ok) break;
      if (attempt >= attemptsPerMode) break;
      console.log(`[qa-loop] ${mode} attempt ${attempt}/${attemptsPerMode} failed: ${modeResult.message}`);
    }
    summary[mode] = modeResult;
    if (!modeResult.ok) {
      if (Array.isArray(modeResult.startupLog) && modeResult.startupLog.length > 0) {
        const traceLines = modeResult.startupLog.filter((line) =>
          /startup trace|http\.bound|ready|plugins\.lookup|secrets|sidecars|browser-control|Using Clawdbot entry|Patched OpenClaw config|Forwarding QA plugin|OpenClaw compile cache/.test(line),
        );
        const linesToPrint = traceLines.length > 0
          ? traceLines
          : modeResult.startupLog.slice(-80);
        console.log(`[qa-loop] ${mode} startup log ${traceLines.length > 0 ? "trace" : "sample"}:`);
        for (const line of linesToPrint) {
          const sanitized = String(line).replace(/\\r?\\n/g, " ");
          console.log(`  ${sanitized}`);
        }
      }
      if (modeResult.functionalProgress) {
        console.log(`[qa-loop] ${mode} functional progress: ${JSON.stringify(modeResult.functionalProgress)}`);
      }
      if (modeResult.interfaceCoverage) {
        console.log(`[qa-loop] ${mode} interface coverage: ${JSON.stringify(modeResult.interfaceCoverage)}`);
      }
      if (modeResult.startup) {
        console.log(`[qa-loop] ${mode} startup result: ${JSON.stringify(modeResult.startup)}`);
      }
      if (modeResult.liveness) {
        console.log(`[qa-loop] ${mode} liveness at failure: ${JSON.stringify(modeResult.liveness)}`);
      }
      console.log(`[qa-loop] ${mode} did not hit target after ${attempt} attempt(s).`);
      continue;
    }
    console.log(
      opts.coreOnly
        ? `[qa-loop] ${mode} hit core active+stable within ${modeResult.startup?.startupMs || "n/a"}ms on attempt ${attempt}.`
        : `[qa-loop] ${mode} hit active+stable within ${modeResult.startup?.startupMs || "n/a"}ms on attempt ${attempt}.`,
    );
    if (modeResult.interfaceCoverage) {
      console.log(`[qa-loop] ${mode} interface coverage: ${JSON.stringify(modeResult.interfaceCoverage)}`);
    }
  }

  const failedModes = Object.entries(summary).filter(([, result]) => !result || !result.ok);
  if (failedModes.length > 0) {
    console.log("\n=== QA Loop Result: FAILED ===");
    for (const [mode, result] of failedModes) {
      console.log(` - ${mode}: ${result.phase} :: ${result.message || "unknown"}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log("\n=== QA Loop Result: PASSED ===");
  console.log("Mode targets hit with active+stable launch and functional checks.");
}

runLoop().catch(error => {
  console.error(`[qa-loop] unhandled failure: ${error && error.stack ? error.stack : String(error)}`);
  process.exit(1);
});
