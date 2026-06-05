#!/usr/bin/env node
const fs = require("node:fs");
const { existsSync } = fs;
const { spawn } = require("node:child_process");
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
    "gemini-3.1-pro-preview",
    "gemini-3.5-flash",
    "gemini-3-flash-preview",
    "gemini-3.1-flash-lite",
    "gemini-2.5-pro",
    "gemini-2.5-flash",
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
      Object.prototype.hasOwnProperty.call(configured, channel) && bundledChannelPluginAvailableForQa(channel),
    );
  } catch {
    return [];
  }
}

function bundledChannelPluginAvailableForQa(channel) {
  const roots = [
    path.join(__dirname, "..", "src-tauri", "resources", "clawdbot", "dist", "extensions", channel),
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
    if (arg === "--max-attempts" || arg === "--attempts") {
      const next = args[i + 1];
      if (next && Number.isFinite(Number(next))) {
        opts.attemptsPerMode = Number.parseInt(next, 10);
        i += 1;
      }
      continue;
    }
    if (arg.startsWith("--max-attempts=") || arg.startsWith("--attempts=")) {
      const v = Number.parseInt(arg.split("=")[1], 10);
      if (Number.isFinite(v)) opts.attemptsPerMode = v;
      continue;
    }
    if (/^\d+$/.test(arg)) {
      const v = Number.parseInt(arg, 10);
      if (Number.isFinite(v)) {
        opts.attemptsPerMode = v;
      }
    }
  }
  opts.mode = mode;
  return opts;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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

async function probeBrowserControl(timeoutMs = 2_500) {
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

function spawnApp(config) {
  const hideWindows = process.platform === "win32" ? { windowsHide: true } : {};
  const common = {
    cwd: path.resolve(__dirname, ".."),
    env: { ...process.env, ...config.env },
    stdio: ["ignore", "pipe", "pipe"],
    ...hideWindows,
  };
  if (config.command === "dev") {
    return spawn(process.execPath, [path.join("scripts", "qa-dev-run.cjs")], {
      ...common,
      windowsHide: true,
      env: { ...common.env, VITE_KN_API_SERVER: "https://api.knapsack.ai" },
    });
  }
  return spawn(config.binary, [], common);
}

async function waitForStartupReady({ label, startupBudgetMs = 30_000 }) {
  const start = Date.now();
  const deadline = Date.now() + startupBudgetMs;
  let startupReady = null;
  let status = null;
  let health = null;
  let channels = null;
  let consecutiveReady = 0;
  let startupReadySeen = false;
  const startupTimeoutMs = Math.min(35_000, startupBudgetMs + 1_000);

  while (Date.now() < deadline) {
    const [startupResp, statusResp, healthResp, channelsResp] = await Promise.all([
      fetchWithTimeout(
        `${API_BASE}/api/clawd/service/startup-ready`,
        { method: "GET" },
        startupTimeoutMs,
      )
        .then((resp) => (resp.ok ? resp.body : null))
        .catch(() => null),
      fetchWithTimeout(`${API_BASE}/api/clawd/service/status`, { method: "GET" }, 2_000)
        .then((resp) => (resp.ok ? resp.body : null))
        .catch(() => null),
      fetchWithTimeout(`${API_BASE}/api/clawd/service/health`, { method: "GET" }, 2_000)
        .then((resp) => (resp.ok ? resp.body : null))
        .catch(() => null),
      fetchWithTimeout(
        `${API_BASE}/api/clawd/channels/diagnostics`,
        { method: "GET" },
        2_000,
      ).then((resp) => (resp.ok ? resp.body : null)).catch(() => null),
    ]);

    if (startupResp && typeof startupResp === "object") {
      startupReady = startupResp;
    }
    if (statusResp && typeof statusResp === "object") {
      status = statusResp;
    }
    if (healthResp && typeof healthResp === "object") {
      health = healthResp;
    }
    if (channelsResp && typeof channelsResp === "object") {
      channels = channelsResp;
    }
    if (startupResp && startupResp.success) {
      startupReadySeen = true;
    }

    const isStartupReady = Boolean(startupReadySeen);
    const serviceRunning = Boolean(status?.success && status.running && status.installed);
    const gatewayOk = Boolean(
      (serviceRunning && health?.gateway_ok) ||
        (Boolean(serviceRunning) && Boolean(health?.gateway_listening)),
    );
    const browserOk = Boolean(
      health?.browser_ok ||
        (await probeBrowserControl(1_500)),
    );
    const channelsOk = Boolean(channels?.success);
    const startupAndReady = isStartupReady || (gatewayOk && browserOk && channelsOk);
    const active = Boolean(serviceRunning && gatewayOk && browserOk && channelsOk) || startupAndReady;

    if (startupAndReady && isStartupReady) {
      return {
        ok: true,
        startupMs: startupResp?.startup_elapsed_ms || Date.now() - start,
        payload: {
          startup: startupReady,
          status,
          health,
          channels,
        },
      };
    }

    if (active) {
      consecutiveReady += 1;
    } else {
      consecutiveReady = 0;
    }

    if (consecutiveReady >= 2) {
      return {
        ok: true,
        startupMs: startupResp?.startup_elapsed_ms || Date.now() - start,
        payload: {
          startup: startupReady,
          status,
          health,
          channels,
        },
      };
    }

    await sleep(750);
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
    note: `${label} did not reach active+stable gateway/browser/channels within ${startupBudgetMs}ms`,
  };
}

function toPayload(result, fallback = {}) {
  if (!result) return null;
  return result.body ? result.body : fallback;
}

function getModelText(model) {
  if (typeof model === "string") return model;
  if (model && typeof model === "object") {
    if (typeof model.id === "string") return model.id;
  }
  return "";
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

async function runChatSmoke(provider, model) {
  try {
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

    const chat = await fetchWithTimeout(`${API_BASE}/api/clawd/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `QA typing test at ${new Date().toISOString()} for ${provider}/${model}`,
        sessionId: `qa-${provider}-${model}`,
      }),
    }, 20_000);

    if (!chat.ok) {
      return {
        provider,
        model,
        ok: false,
        skipped: false,
        detail: `chat failed (${chat.status}) ${normalizeResult(chat.body)}`,
      };
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

    if (!body.message && !body.summary && typeof body.response !== "string" && !body.text) {
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
    return {
      provider,
      model,
      ok: false,
      skipped: false,
      detail: `chat request failed: ${error?.message || error || "network error"}`,
    };
  }
}

async function createMockMeeting() {
  const timestamp = Date.now();
  const feed = await fetchWithTimeout(`${API_BASE}/api/knapsack/feed_items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timestamp, title: "QA Loop Mock Meeting" }),
  }, 8_000);
  if (!feed.ok || !feed.body?.data?.id) {
    return {
      ok: false,
      detail: `create feed item failed (${feed.status}) ${normalizeResult(feed.body)}`,
    };
  }
  const feedItemId = feed.body.data.id;

  const thread = await fetchWithTimeout(`${API_BASE}/api/knapsack/threads`, {
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
  }, 8_000);
  if (!thread.ok || !thread.body?.thread?.id) {
    return {
      ok: false,
      detail: `create thread failed (${thread.status}) ${normalizeResult(thread.body)}`,
    };
  }
  const threadId = thread.body.thread.id;

  const start = await fetchWithTimeout(`${API_BASE}/api/knapsack/start_recording`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ thread_id: threadId, feed_item_id: feedItemId, event_id: 0, save_transcript: false }),
  }, 8_000);
  if (!start.ok) {
    return {
      ok: false,
      detail: `start_recording failed (${start.status}) ${normalizeResult(start.body)}`,
    };
  }
  await sleep(1_200);

  const stop = await fetchWithTimeout(`${API_BASE}/api/knapsack/stop_recording`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ thread_id: threadId, event_id: 0, save_transcript: false }),
  }, 8_000);
  if (!stop.ok) {
    return {
      ok: false,
      detail: `stop_recording failed (${stop.status}) ${normalizeResult(stop.body)}`,
    };
  }
  return { ok: true };
}

async function checkInterfaceAccess(includeUi) {
  const root = await fetchWithTimeout(`${API_BASE}/api/clawd/service/status`, { method: "GET" }, 8_000).catch(() => null);
  const health = await fetchWithTimeout(`${API_BASE}/api/clawd/service/health`, { method: "GET" }, 8_000).catch(() => null);
  const workspaces = await fetchWithTimeout(`${API_BASE}/api/knapsack/workspaces`, { method: "GET" }, 8_000).catch(() => null);
  const channels = await fetchWithTimeout(
    `${API_BASE}/api/clawd/channels/diagnostics`,
    { method: "GET" },
    8_000,
  ).catch(() => null);
  const automations = await fetchWithTimeout(
    `${API_BASE}/api/knapsack/automations`,
    { method: "GET" },
    8_000,
  ).catch(() => null);
  const skills = await fetchWithTimeout(`${API_BASE}/api/clawd/skills/status`, { method: "GET" }, 8_000).catch(() => null);
  const feed = await fetchWithTimeout(`${API_BASE}/api/knapsack/feed_items`, { method: "GET" }, 8_000).catch(() => null);
  const ui = includeUi
    ? await fetchWithTimeout(`${UI_BASE}/home`, { method: "GET" }, 8_000).catch(() => null)
    : { ok: true };
  const gbrainPage = includeUi ? ui : { ok: true };
  const browserControl = await probeBrowserControl(8_000);

  const failures = [];
  if (!root || !root.ok) failures.push("service/status unhealthy");
  if (!health || !health.ok) failures.push("service/health unhealthy");
  if (!channels || !channels.ok || channels.body?.success !== true) failures.push("channels diagnostics unavailable");
  if (!skills || !skills.ok || skills.body?.success !== true) failures.push("skills status unavailable");
  if (!workspaces || !workspaces.ok) failures.push("workspaces unavailable");
  if (!feed || !feed.ok) failures.push("feed_items unavailable");
  if (automations?.ok) {
    const hasEmailAutopilot = Array.isArray(automations.body?.data)
      ? automations.body.data.some(
          (automation) =>
            String(automation?.name || "").toLowerCase().includes("autopilot"),
        )
      : false;
    if (!hasEmailAutopilot) {
      failures.push("email autopilot automation unavailable");
    }
  } else {
    failures.push("automations unavailable");
  }
  if (includeUi && (!ui || !ui.ok)) failures.push("UI /home unreachable");
  if (includeUi && (!gbrainPage || !gbrainPage.ok)) failures.push("UI GBrain section unreachable");
  if (includeUi && gbrainPage?.body && !String(gbrainPage.body).includes("GBrain")) {
    failures.push("UI GBrain section marker missing");
  }
  if (includeUi && gbrainPage?.body && !String(gbrainPage.body).includes("Email Autopilot")) {
    failures.push("UI Email Autopilot section marker missing");
  }
  if (!browserControl) failures.push("browser control not reachable");
  return {
    ok: failures.length === 0,
    failures,
  };
}

async function runMode(mode) {
  const isProd = mode === "prod";
  const binary = path.join(
    __dirname,
    "..",
    "src-tauri",
    "target",
    isProd ? "release" : "debug",
    process.platform === "win32" ? "knapsack.exe" : "knapsack",
  );
  if (!existsSync(binary)) {
    return { ok: false, phase: "launch", message: `missing binary at ${binary}` };
  }

  await ensureCleanPorts([8897, 1420, 18789, 18791, 18800]);
  const proc = spawnApp(isProd ? { command: "release", binary } : { command: "dev" });
  const label = isProd ? "prod" : "dev";
  const startupLog = [];
  const cleanup = () => {
    if (proc.exitCode !== null) return;
    try {
      if (!proc.killed) {
        proc.kill("SIGTERM");
      }
    } catch {
      // ignore
    }
  };

  proc.stdout?.on("data", (chunk) => {
    startupLog.push(chunk.toString("utf8").trim());
    if (startupLog.length > 32) startupLog.shift();
  });
  proc.stderr?.on("data", (chunk) => {
    startupLog.push(chunk.toString("utf8").trim());
    if (startupLog.length > 32) startupLog.shift();
  });
  proc.once("exit", () => {
    // no-op: cleanup is handled by parent loop
  });

  const startup = await waitForStartupReady({ label, startupBudgetMs: 30_000 });
  if (!startup.ok) {
    const payloadSummary = summarizeStartupState(startup.payload || {});
    cleanup();
      return {
        ok: false,
        phase: "startup",
        message: `${startup.note || "startup never stabilized"} (${JSON.stringify(payloadSummary)})`,
        startupLog,
        startup,
      };
    }

  const chatChecks = [];
  const chatFailures = [];
  for (const [provider, models] of Object.entries(MODELS_BY_PROVIDER)) {
    for (const modelEntry of models) {
      const model = getModelText(modelEntry);
      if (!model) {
        continue;
      }
      const check = await runChatSmoke(provider, model);
      chatChecks.push(check);
      if (!check.ok && !check.skipped) {
        chatFailures.push(`${check.provider}/${check.model}: ${check.detail}`);
      }
    }
  }

  if (chatFailures.length > 0) {
    cleanup();
    return {
      ok: false,
      phase: "chat",
      message: `chat model checks failed: ${chatFailures.join(" | ")}`,
      chatChecks,
      startup,
    };
  }

  const meeting = await createMockMeeting();
  if (!meeting.ok) {
    cleanup();
    return {
      ok: false,
      phase: "recording",
      message: meeting.detail,
      chatChecks,
      startup,
    };
  }

  const interfaces = await checkInterfaceAccess(!isProd);
  if (!interfaces.ok) {
    cleanup();
    return {
      ok: false,
      phase: "interfaces",
      message: interfaces.failures.join(", "),
      chatChecks,
      startup,
    };
  }

  cleanup();
  return {
    ok: true,
    phase: "complete",
    startup,
    chatChecks,
  };
}

async function runLoop() {
  const opts = parseArgs();
  const modes = opts.mode === "prod" ? ["prod"] : ["dev", "prod"];
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
      modeResult = await runMode(mode);
      if (modeResult.ok) break;
      if (attempt >= attemptsPerMode) break;
      console.log(`[qa-loop] ${mode} attempt ${attempt}/${attemptsPerMode} failed: ${modeResult.message}`);
    }
    summary[mode] = modeResult;
    if (!modeResult.ok) {
      if (Array.isArray(modeResult.startupLog) && modeResult.startupLog.length > 0) {
        console.log(`[qa-loop] ${mode} startup log sample:`);
        for (const line of modeResult.startupLog) {
          const sanitized = String(line).replace(/\\r?\\n/g, " ");
          console.log(`  ${sanitized}`);
        }
      }
      console.log(`[qa-loop] ${mode} did not hit target after ${attempt} attempt(s).`);
      continue;
    }
    console.log(
      `[qa-loop] ${mode} hit active+stable within ${modeResult.startup?.startupMs || "n/a"}ms on attempt ${attempt}.`,
    );
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
