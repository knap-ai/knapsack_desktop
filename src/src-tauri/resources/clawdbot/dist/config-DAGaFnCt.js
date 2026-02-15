import { a as resolveOAuthDir, n as resolveConfigPath, r as resolveDefaultConfigCandidates, s as resolveStateDir, u as resolveRequiredHomeDir } from "./paths-BZtyHNCi.js";
import { C as normalizeAccountId, _ as DEFAULT_AGENT_ID, g as DEFAULT_ACCOUNT_ID, w as normalizeAgentId } from "./workspace-CUznpDHg.js";
import { $ as success, B as resolveUserPath, F as jidToE164, M as isPlainObject$2, N as isRecord, R as resolveConfigDir, Y as info, d as defaultRuntime, h as CHANNEL_IDS, it as getChildLogger, x as normalizeChatChannelId } from "./exec-DBtWJ4Ld.js";
import { c as resolveDefaultAgentId, s as resolveAgentWorkspaceDir } from "./agent-scope-xZu8sXcF.js";
import { G as shouldDeferShellEnvFallback, K as shouldEnableShellEnvFallback, L as DEFAULT_CONTEXT_TOKENS, T as parseModelRef, U as loadShellEnvFallback, W as resolveShellEnvFallbackTimeoutMs } from "./model-auth-BffKC6OJ.js";
import { t as formatCliCommand } from "./command-format-BmTFj7S4.js";
import { n as MANIFEST_KEY } from "./legacy-names-BWhO1_ll.js";
import { createRequire } from "node:module";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import fs$1 from "node:fs";
import JSON5 from "json5";
import { isDeepStrictEqual } from "node:util";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";
import dotenv from "dotenv";
import AjvPkg from "ajv";
import { z } from "zod";

//#region src/web/auth-store.ts
function resolveDefaultWebAuthDir() {
	return path.join(resolveOAuthDir(), "whatsapp", DEFAULT_ACCOUNT_ID);
}
const WA_WEB_AUTH_DIR = resolveDefaultWebAuthDir();
function resolveWebCredsPath(authDir) {
	return path.join(authDir, "creds.json");
}
function resolveWebCredsBackupPath(authDir) {
	return path.join(authDir, "creds.json.bak");
}
function readCredsJsonRaw(filePath) {
	try {
		if (!fs$1.existsSync(filePath)) return null;
		const stats = fs$1.statSync(filePath);
		if (!stats.isFile() || stats.size <= 1) return null;
		return fs$1.readFileSync(filePath, "utf-8");
	} catch {
		return null;
	}
}
function maybeRestoreCredsFromBackup(authDir) {
	const logger = getChildLogger({ module: "web-session" });
	try {
		const credsPath = resolveWebCredsPath(authDir);
		const backupPath = resolveWebCredsBackupPath(authDir);
		const raw = readCredsJsonRaw(credsPath);
		if (raw) {
			JSON.parse(raw);
			return;
		}
		const backupRaw = readCredsJsonRaw(backupPath);
		if (!backupRaw) return;
		JSON.parse(backupRaw);
		fs$1.copyFileSync(backupPath, credsPath);
		try {
			fs$1.chmodSync(credsPath, 384);
		} catch {}
		logger.warn({ credsPath }, "restored corrupted WhatsApp creds.json from backup");
	} catch {}
}
async function webAuthExists(authDir = resolveDefaultWebAuthDir()) {
	const resolvedAuthDir = resolveUserPath(authDir);
	maybeRestoreCredsFromBackup(resolvedAuthDir);
	const credsPath = resolveWebCredsPath(resolvedAuthDir);
	try {
		await fs.access(resolvedAuthDir);
	} catch {
		return false;
	}
	try {
		const stats = await fs.stat(credsPath);
		if (!stats.isFile() || stats.size <= 1) return false;
		const raw = await fs.readFile(credsPath, "utf-8");
		JSON.parse(raw);
		return true;
	} catch {
		return false;
	}
}
async function clearLegacyBaileysAuthState(authDir) {
	const entries = await fs.readdir(authDir, { withFileTypes: true });
	const shouldDelete = (name) => {
		if (name === "oauth.json") return false;
		if (name === "creds.json" || name === "creds.json.bak") return true;
		if (!name.endsWith(".json")) return false;
		return /^(app-state-sync|session|sender-key|pre-key)-/.test(name);
	};
	await Promise.all(entries.map(async (entry) => {
		if (!entry.isFile()) return;
		if (!shouldDelete(entry.name)) return;
		await fs.rm(path.join(authDir, entry.name), { force: true });
	}));
}
async function logoutWeb(params) {
	const runtime = params.runtime ?? defaultRuntime;
	const resolvedAuthDir = resolveUserPath(params.authDir ?? resolveDefaultWebAuthDir());
	if (!await webAuthExists(resolvedAuthDir)) {
		runtime.log(info("No WhatsApp Web session found; nothing to delete."));
		return false;
	}
	if (params.isLegacyAuthDir) await clearLegacyBaileysAuthState(resolvedAuthDir);
	else await fs.rm(resolvedAuthDir, {
		recursive: true,
		force: true
	});
	runtime.log(success("Cleared WhatsApp Web credentials."));
	return true;
}
function readWebSelfId(authDir = resolveDefaultWebAuthDir()) {
	try {
		const credsPath = resolveWebCredsPath(resolveUserPath(authDir));
		if (!fs$1.existsSync(credsPath)) return {
			e164: null,
			jid: null
		};
		const raw = fs$1.readFileSync(credsPath, "utf-8");
		const jid = JSON.parse(raw)?.me?.id ?? null;
		return {
			e164: jid ? jidToE164(jid, { authDir }) : null,
			jid
		};
	} catch {
		return {
			e164: null,
			jid: null
		};
	}
}
/**
* Return the age (in milliseconds) of the cached WhatsApp web auth state, or null when missing.
* Helpful for heartbeats/observability to spot stale credentials.
*/
function getWebAuthAgeMs(authDir = resolveDefaultWebAuthDir()) {
	try {
		const stats = fs$1.statSync(resolveWebCredsPath(resolveUserPath(authDir)));
		return Date.now() - stats.mtimeMs;
	} catch {
		return null;
	}
}
function logWebSelfId(authDir = resolveDefaultWebAuthDir(), runtime = defaultRuntime, includeChannelPrefix = false) {
	const { e164, jid } = readWebSelfId(authDir);
	const details = e164 || jid ? `${e164 ?? "unknown"}${jid ? ` (jid ${jid})` : ""}` : "unknown";
	const prefix = includeChannelPrefix ? "Web Channel: " : "";
	runtime.log(info(`${prefix}${details}`));
}
async function pickWebChannel(pref, authDir = resolveDefaultWebAuthDir()) {
	const choice = pref === "auto" ? "web" : pref;
	if (!await webAuthExists(authDir)) throw new Error(`No WhatsApp Web session found. Run \`${formatCliCommand("openclaw channels login --channel whatsapp --verbose")}\` to link.`);
	return choice;
}

//#endregion
//#region src/web/accounts.ts
function listConfiguredAccountIds(cfg) {
	const accounts = cfg.channels?.whatsapp?.accounts;
	if (!accounts || typeof accounts !== "object") return [];
	return Object.keys(accounts).filter(Boolean);
}
function listWhatsAppAccountIds(cfg) {
	const ids = listConfiguredAccountIds(cfg);
	if (ids.length === 0) return [DEFAULT_ACCOUNT_ID];
	return ids.toSorted((a, b) => a.localeCompare(b));
}
function resolveDefaultWhatsAppAccountId(cfg) {
	const ids = listWhatsAppAccountIds(cfg);
	if (ids.includes(DEFAULT_ACCOUNT_ID)) return DEFAULT_ACCOUNT_ID;
	return ids[0] ?? DEFAULT_ACCOUNT_ID;
}
function resolveAccountConfig(cfg, accountId) {
	const accounts = cfg.channels?.whatsapp?.accounts;
	if (!accounts || typeof accounts !== "object") return;
	return accounts[accountId];
}
function resolveDefaultAuthDir(accountId) {
	return path.join(resolveOAuthDir(), "whatsapp", normalizeAccountId(accountId));
}
function resolveLegacyAuthDir() {
	return resolveOAuthDir();
}
function legacyAuthExists(authDir) {
	try {
		return fs$1.existsSync(path.join(authDir, "creds.json"));
	} catch {
		return false;
	}
}
function resolveWhatsAppAuthDir(params) {
	const accountId = params.accountId.trim() || DEFAULT_ACCOUNT_ID;
	const configured = resolveAccountConfig(params.cfg, accountId)?.authDir?.trim();
	if (configured) return {
		authDir: resolveUserPath(configured),
		isLegacy: false
	};
	const defaultDir = resolveDefaultAuthDir(accountId);
	if (accountId === DEFAULT_ACCOUNT_ID) {
		const legacyDir = resolveLegacyAuthDir();
		if (legacyAuthExists(legacyDir) && !legacyAuthExists(defaultDir)) return {
			authDir: legacyDir,
			isLegacy: true
		};
	}
	return {
		authDir: defaultDir,
		isLegacy: false
	};
}
function resolveWhatsAppAccount(params) {
	const rootCfg = params.cfg.channels?.whatsapp;
	const accountId = params.accountId?.trim() || resolveDefaultWhatsAppAccountId(params.cfg);
	const accountCfg = resolveAccountConfig(params.cfg, accountId);
	const enabled = accountCfg?.enabled !== false;
	const { authDir, isLegacy } = resolveWhatsAppAuthDir({
		cfg: params.cfg,
		accountId
	});
	return {
		accountId,
		name: accountCfg?.name?.trim() || void 0,
		enabled,
		sendReadReceipts: accountCfg?.sendReadReceipts ?? rootCfg?.sendReadReceipts ?? true,
		messagePrefix: accountCfg?.messagePrefix ?? rootCfg?.messagePrefix ?? params.cfg.messages?.messagePrefix,
		authDir,
		isLegacyAuthDir: isLegacy,
		selfChatMode: accountCfg?.selfChatMode ?? rootCfg?.selfChatMode,
		dmPolicy: accountCfg?.dmPolicy ?? rootCfg?.dmPolicy,
		allowFrom: accountCfg?.allowFrom ?? rootCfg?.allowFrom,
		groupAllowFrom: accountCfg?.groupAllowFrom ?? rootCfg?.groupAllowFrom,
		groupPolicy: accountCfg?.groupPolicy ?? rootCfg?.groupPolicy,
		textChunkLimit: accountCfg?.textChunkLimit ?? rootCfg?.textChunkLimit,
		chunkMode: accountCfg?.chunkMode ?? rootCfg?.chunkMode,
		mediaMaxMb: accountCfg?.mediaMaxMb ?? rootCfg?.mediaMaxMb,
		blockStreaming: accountCfg?.blockStreaming ?? rootCfg?.blockStreaming,
		ackReaction: accountCfg?.ackReaction ?? rootCfg?.ackReaction,
		groups: accountCfg?.groups ?? rootCfg?.groups,
		debounceMs: accountCfg?.debounceMs ?? rootCfg?.debounceMs
	};
}

//#endregion
//#region src/infra/dotenv.ts
function loadDotEnv(opts) {
	const quiet = opts?.quiet ?? true;
	dotenv.config({ quiet });
	const globalEnvPath = path.join(resolveConfigDir(process.env), ".env");
	if (!fs$1.existsSync(globalEnvPath)) return;
	dotenv.config({
		quiet,
		path: globalEnvPath,
		override: false
	});
}

//#endregion
//#region src/version.ts
const CORE_PACKAGE_NAME = "openclaw";
const PACKAGE_JSON_CANDIDATES = [
	"../package.json",
	"../../package.json",
	"../../../package.json",
	"./package.json"
];
const BUILD_INFO_CANDIDATES = [
	"../build-info.json",
	"../../build-info.json",
	"./build-info.json"
];
function readVersionFromJsonCandidates(moduleUrl, candidates, opts = {}) {
	try {
		const require = createRequire(moduleUrl);
		for (const candidate of candidates) try {
			const parsed = require(candidate);
			const version = parsed.version?.trim();
			if (!version) continue;
			if (opts.requirePackageName && parsed.name !== CORE_PACKAGE_NAME) continue;
			return version;
		} catch {}
		return null;
	} catch {
		return null;
	}
}
function readVersionFromPackageJsonForModuleUrl(moduleUrl) {
	return readVersionFromJsonCandidates(moduleUrl, PACKAGE_JSON_CANDIDATES, { requirePackageName: true });
}
function readVersionFromBuildInfoForModuleUrl(moduleUrl) {
	return readVersionFromJsonCandidates(moduleUrl, BUILD_INFO_CANDIDATES);
}
function resolveVersionFromModuleUrl(moduleUrl) {
	return readVersionFromPackageJsonForModuleUrl(moduleUrl) || readVersionFromBuildInfoForModuleUrl(moduleUrl);
}
const VERSION = typeof __OPENCLAW_VERSION__ === "string" && __OPENCLAW_VERSION__ || process.env.OPENCLAW_BUNDLED_VERSION || resolveVersionFromModuleUrl(import.meta.url) || "0.0.0";

//#endregion
//#region src/config/agent-dirs.ts
var DuplicateAgentDirError = class extends Error {
	constructor(duplicates) {
		super(formatDuplicateAgentDirError(duplicates));
		this.name = "DuplicateAgentDirError";
		this.duplicates = duplicates;
	}
};
function canonicalizeAgentDir(agentDir) {
	const resolved = path.resolve(agentDir);
	if (process.platform === "darwin" || process.platform === "win32") return resolved.toLowerCase();
	return resolved;
}
function collectReferencedAgentIds(cfg) {
	const ids = /* @__PURE__ */ new Set();
	const agents = Array.isArray(cfg.agents?.list) ? cfg.agents?.list : [];
	const defaultAgentId = agents.find((agent) => agent?.default)?.id ?? agents[0]?.id ?? DEFAULT_AGENT_ID;
	ids.add(normalizeAgentId(defaultAgentId));
	for (const entry of agents) if (entry?.id) ids.add(normalizeAgentId(entry.id));
	const bindings = cfg.bindings;
	if (Array.isArray(bindings)) for (const binding of bindings) {
		const id = binding?.agentId;
		if (typeof id === "string" && id.trim()) ids.add(normalizeAgentId(id));
	}
	return [...ids];
}
function resolveEffectiveAgentDir(cfg, agentId, deps) {
	const id = normalizeAgentId(agentId);
	const trimmed = (Array.isArray(cfg.agents?.list) ? cfg.agents?.list.find((agent) => normalizeAgentId(agent.id) === id)?.agentDir : void 0)?.trim();
	if (trimmed) return resolveUserPath(trimmed);
	const env = deps?.env ?? process.env;
	const root = resolveStateDir(env, deps?.homedir ?? (() => resolveRequiredHomeDir(env, os.homedir)));
	return path.join(root, "agents", id, "agent");
}
function findDuplicateAgentDirs(cfg, deps) {
	const byDir = /* @__PURE__ */ new Map();
	for (const agentId of collectReferencedAgentIds(cfg)) {
		const agentDir = resolveEffectiveAgentDir(cfg, agentId, deps);
		const key = canonicalizeAgentDir(agentDir);
		const entry = byDir.get(key);
		if (entry) entry.agentIds.push(agentId);
		else byDir.set(key, {
			agentDir,
			agentIds: [agentId]
		});
	}
	return [...byDir.values()].filter((v) => v.agentIds.length > 1);
}
function formatDuplicateAgentDirError(dups) {
	return [
		"Duplicate agentDir detected (multi-agent config).",
		"Each agent must have a unique agentDir; sharing it causes auth/session state collisions and token invalidation.",
		"",
		"Conflicts:",
		...dups.map((d) => `- ${d.agentDir}: ${d.agentIds.map((id) => `"${id}"`).join(", ")}`),
		"",
		"Fix: remove the shared agents.list[].agentDir override (or give each agent its own directory).",
		"If you want to share credentials, copy auth-profiles.json instead of sharing the entire agentDir."
	].join("\n");
}

//#endregion
//#region src/config/agent-limits.ts
const DEFAULT_AGENT_MAX_CONCURRENT = 4;
const DEFAULT_SUBAGENT_MAX_CONCURRENT = 8;
function resolveAgentMaxConcurrent(cfg) {
	const raw = cfg?.agents?.defaults?.maxConcurrent;
	if (typeof raw === "number" && Number.isFinite(raw)) return Math.max(1, Math.floor(raw));
	return DEFAULT_AGENT_MAX_CONCURRENT;
}

//#endregion
//#region src/config/talk.ts
function readTalkApiKeyFromProfile(deps = {}) {
	const fsImpl = deps.fs ?? fs$1;
	const osImpl = deps.os ?? os;
	const pathImpl = deps.path ?? path;
	const home = osImpl.homedir();
	const candidates = [
		".profile",
		".zprofile",
		".zshrc",
		".bashrc"
	].map((name) => pathImpl.join(home, name));
	for (const candidate of candidates) {
		if (!fsImpl.existsSync(candidate)) continue;
		try {
			const value = fsImpl.readFileSync(candidate, "utf-8").match(/(?:^|\n)\s*(?:export\s+)?ELEVENLABS_API_KEY\s*=\s*["']?([^\n"']+)["']?/)?.[1]?.trim();
			if (value) return value;
		} catch {}
	}
	return null;
}
function resolveTalkApiKey(env = process.env, deps = {}) {
	const envValue = (env.ELEVENLABS_API_KEY ?? "").trim();
	if (envValue) return envValue;
	return readTalkApiKeyFromProfile(deps);
}

//#endregion
//#region src/config/defaults.ts
let defaultWarnState = { warned: false };
const DEFAULT_MODEL_ALIASES = {
	opus: "anthropic/claude-opus-4-6",
	sonnet: "anthropic/claude-sonnet-4-5",
	gpt: "openai/gpt-5.2",
	"gpt-mini": "openai/gpt-5-mini",
	gemini: "google/gemini-3-pro-preview",
	"gemini-flash": "google/gemini-3-flash-preview"
};
const DEFAULT_MODEL_COST = {
	input: 0,
	output: 0,
	cacheRead: 0,
	cacheWrite: 0
};
const DEFAULT_MODEL_INPUT = ["text"];
const DEFAULT_MODEL_MAX_TOKENS = 8192;
function isPositiveNumber(value) {
	return typeof value === "number" && Number.isFinite(value) && value > 0;
}
function resolveModelCost(raw) {
	return {
		input: typeof raw?.input === "number" ? raw.input : DEFAULT_MODEL_COST.input,
		output: typeof raw?.output === "number" ? raw.output : DEFAULT_MODEL_COST.output,
		cacheRead: typeof raw?.cacheRead === "number" ? raw.cacheRead : DEFAULT_MODEL_COST.cacheRead,
		cacheWrite: typeof raw?.cacheWrite === "number" ? raw.cacheWrite : DEFAULT_MODEL_COST.cacheWrite
	};
}
function resolveAnthropicDefaultAuthMode(cfg) {
	const profiles = cfg.auth?.profiles ?? {};
	const anthropicProfiles = Object.entries(profiles).filter(([, profile]) => profile?.provider === "anthropic");
	const order = cfg.auth?.order?.anthropic ?? [];
	for (const profileId of order) {
		const entry = profiles[profileId];
		if (!entry || entry.provider !== "anthropic") continue;
		if (entry.mode === "api_key") return "api_key";
		if (entry.mode === "oauth" || entry.mode === "token") return "oauth";
	}
	const hasApiKey = anthropicProfiles.some(([, profile]) => profile?.mode === "api_key");
	const hasOauth = anthropicProfiles.some(([, profile]) => profile?.mode === "oauth" || profile?.mode === "token");
	if (hasApiKey && !hasOauth) return "api_key";
	if (hasOauth && !hasApiKey) return "oauth";
	if (process.env.ANTHROPIC_OAUTH_TOKEN?.trim()) return "oauth";
	if (process.env.ANTHROPIC_API_KEY?.trim()) return "api_key";
	return null;
}
function resolvePrimaryModelRef(raw) {
	if (!raw || typeof raw !== "string") return null;
	const trimmed = raw.trim();
	if (!trimmed) return null;
	return DEFAULT_MODEL_ALIASES[trimmed.toLowerCase()] ?? trimmed;
}
function applyMessageDefaults(cfg) {
	const messages = cfg.messages;
	if (messages?.ackReactionScope !== void 0) return cfg;
	const nextMessages = messages ? { ...messages } : {};
	nextMessages.ackReactionScope = "group-mentions";
	return {
		...cfg,
		messages: nextMessages
	};
}
function applySessionDefaults(cfg, options = {}) {
	const session = cfg.session;
	if (!session || session.mainKey === void 0) return cfg;
	const trimmed = session.mainKey.trim();
	const warn = options.warn ?? console.warn;
	const warnState = options.warnState ?? defaultWarnState;
	const next = {
		...cfg,
		session: {
			...session,
			mainKey: "main"
		}
	};
	if (trimmed && trimmed !== "main" && !warnState.warned) {
		warnState.warned = true;
		warn("session.mainKey is ignored; main session is always \"main\".");
	}
	return next;
}
function applyTalkApiKey(config) {
	const resolved = resolveTalkApiKey();
	if (!resolved) return config;
	if (config.talk?.apiKey?.trim()) return config;
	return {
		...config,
		talk: {
			...config.talk,
			apiKey: resolved
		}
	};
}
function applyModelDefaults(cfg) {
	let mutated = false;
	let nextCfg = cfg;
	const providerConfig = nextCfg.models?.providers;
	if (providerConfig) {
		const nextProviders = { ...providerConfig };
		for (const [providerId, provider] of Object.entries(providerConfig)) {
			const models = provider.models;
			if (!Array.isArray(models) || models.length === 0) continue;
			let providerMutated = false;
			const nextModels = models.map((model) => {
				const raw = model;
				let modelMutated = false;
				const reasoning = typeof raw.reasoning === "boolean" ? raw.reasoning : false;
				if (raw.reasoning !== reasoning) modelMutated = true;
				const input = raw.input ?? [...DEFAULT_MODEL_INPUT];
				if (raw.input === void 0) modelMutated = true;
				const cost = resolveModelCost(raw.cost);
				if (!raw.cost || raw.cost.input !== cost.input || raw.cost.output !== cost.output || raw.cost.cacheRead !== cost.cacheRead || raw.cost.cacheWrite !== cost.cacheWrite) modelMutated = true;
				const contextWindow = isPositiveNumber(raw.contextWindow) ? raw.contextWindow : DEFAULT_CONTEXT_TOKENS;
				if (raw.contextWindow !== contextWindow) modelMutated = true;
				const defaultMaxTokens = Math.min(DEFAULT_MODEL_MAX_TOKENS, contextWindow);
				const rawMaxTokens = isPositiveNumber(raw.maxTokens) ? raw.maxTokens : defaultMaxTokens;
				const maxTokens = Math.min(rawMaxTokens, contextWindow);
				if (raw.maxTokens !== maxTokens) modelMutated = true;
				if (!modelMutated) return model;
				providerMutated = true;
				return {
					...raw,
					reasoning,
					input,
					cost,
					contextWindow,
					maxTokens
				};
			});
			if (!providerMutated) continue;
			nextProviders[providerId] = {
				...provider,
				models: nextModels
			};
			mutated = true;
		}
		if (mutated) nextCfg = {
			...nextCfg,
			models: {
				...nextCfg.models,
				providers: nextProviders
			}
		};
	}
	const existingAgent = nextCfg.agents?.defaults;
	if (!existingAgent) return mutated ? nextCfg : cfg;
	const existingModels = existingAgent.models ?? {};
	if (Object.keys(existingModels).length === 0) return mutated ? nextCfg : cfg;
	const nextModels = { ...existingModels };
	for (const [alias, target] of Object.entries(DEFAULT_MODEL_ALIASES)) {
		const entry = nextModels[target];
		if (!entry) continue;
		if (entry.alias !== void 0) continue;
		nextModels[target] = {
			...entry,
			alias
		};
		mutated = true;
	}
	if (!mutated) return cfg;
	return {
		...nextCfg,
		agents: {
			...nextCfg.agents,
			defaults: {
				...existingAgent,
				models: nextModels
			}
		}
	};
}
function applyAgentDefaults(cfg) {
	const agents = cfg.agents;
	const defaults = agents?.defaults;
	const hasMax = typeof defaults?.maxConcurrent === "number" && Number.isFinite(defaults.maxConcurrent);
	const hasSubMax = typeof defaults?.subagents?.maxConcurrent === "number" && Number.isFinite(defaults.subagents.maxConcurrent);
	if (hasMax && hasSubMax) return cfg;
	let mutated = false;
	const nextDefaults = defaults ? { ...defaults } : {};
	if (!hasMax) {
		nextDefaults.maxConcurrent = DEFAULT_AGENT_MAX_CONCURRENT;
		mutated = true;
	}
	const nextSubagents = defaults?.subagents ? { ...defaults.subagents } : {};
	if (!hasSubMax) {
		nextSubagents.maxConcurrent = DEFAULT_SUBAGENT_MAX_CONCURRENT;
		mutated = true;
	}
	if (!mutated) return cfg;
	return {
		...cfg,
		agents: {
			...agents,
			defaults: {
				...nextDefaults,
				subagents: nextSubagents
			}
		}
	};
}
function applyLoggingDefaults(cfg) {
	const logging = cfg.logging;
	if (!logging) return cfg;
	if (logging.redactSensitive) return cfg;
	return {
		...cfg,
		logging: {
			...logging,
			redactSensitive: "tools"
		}
	};
}
function applyContextPruningDefaults(cfg) {
	const defaults = cfg.agents?.defaults;
	if (!defaults) return cfg;
	const authMode = resolveAnthropicDefaultAuthMode(cfg);
	if (!authMode) return cfg;
	let mutated = false;
	const nextDefaults = { ...defaults };
	const contextPruning = defaults.contextPruning ?? {};
	const heartbeat = defaults.heartbeat ?? {};
	if (defaults.contextPruning?.mode === void 0) {
		nextDefaults.contextPruning = {
			...contextPruning,
			mode: "cache-ttl",
			ttl: defaults.contextPruning?.ttl ?? "1h"
		};
		mutated = true;
	}
	if (defaults.heartbeat?.every === void 0) {
		nextDefaults.heartbeat = {
			...heartbeat,
			every: authMode === "oauth" ? "1h" : "30m"
		};
		mutated = true;
	}
	if (authMode === "api_key") {
		const nextModels = defaults.models ? { ...defaults.models } : {};
		let modelsMutated = false;
		for (const [key, entry] of Object.entries(nextModels)) {
			const parsed = parseModelRef(key, "anthropic");
			if (!parsed || parsed.provider !== "anthropic") continue;
			const current = entry ?? {};
			const params = current.params ?? {};
			if (typeof params.cacheRetention === "string") continue;
			nextModels[key] = {
				...current,
				params: {
					...params,
					cacheRetention: "short"
				}
			};
			modelsMutated = true;
		}
		const primary = resolvePrimaryModelRef(defaults.model?.primary ?? void 0);
		if (primary) {
			const parsedPrimary = parseModelRef(primary, "anthropic");
			if (parsedPrimary?.provider === "anthropic") {
				const key = `${parsedPrimary.provider}/${parsedPrimary.model}`;
				const current = nextModels[key] ?? {};
				const params = current.params ?? {};
				if (typeof params.cacheRetention !== "string") {
					nextModels[key] = {
						...current,
						params: {
							...params,
							cacheRetention: "short"
						}
					};
					modelsMutated = true;
				}
			}
		}
		if (modelsMutated) {
			nextDefaults.models = nextModels;
			mutated = true;
		}
	}
	if (!mutated) return cfg;
	return {
		...cfg,
		agents: {
			...cfg.agents,
			defaults: nextDefaults
		}
	};
}
function applyCompactionDefaults(cfg) {
	const defaults = cfg.agents?.defaults;
	if (!defaults) return cfg;
	const compaction = defaults?.compaction;
	if (compaction?.mode) return cfg;
	return {
		...cfg,
		agents: {
			...cfg.agents,
			defaults: {
				...defaults,
				compaction: {
					...compaction,
					mode: "safeguard"
				}
			}
		}
	};
}

//#endregion
//#region src/config/env-preserve.ts
/**
* Preserves `${VAR}` environment variable references during config write-back.
*
* When config is read, `${VAR}` references are resolved to their values.
* When writing back, callers pass the resolved config. This module detects
* values that match what a `${VAR}` reference would resolve to and restores
* the original reference, so env var references survive config round-trips.
*
* A value is restored only if:
* 1. The pre-substitution value contained a `${VAR}` pattern
* 2. Resolving that pattern with current env vars produces the incoming value
*
* If a caller intentionally set a new value (different from what the env var
* resolves to), the new value is kept as-is.
*/
const ENV_VAR_PATTERN = /\$\{[A-Z_][A-Z0-9_]*\}/;
function isPlainObject$1(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value) && Object.prototype.toString.call(value) === "[object Object]";
}
/**
* Check if a string contains any `${VAR}` env var references.
*/
function hasEnvVarRef(value) {
	return ENV_VAR_PATTERN.test(value);
}
/**
* Resolve `${VAR}` references in a single string using the given env.
* Returns null if any referenced var is missing (instead of throwing).
*
* Mirrors the substitution semantics of `substituteString` in env-substitution.ts:
* - `${VAR}` → env value (returns null if missing)
* - `$${VAR}` → literal `${VAR}` (escape sequence)
*/
function tryResolveString(template, env) {
	const ENV_VAR_NAME = /^[A-Z_][A-Z0-9_]*$/;
	const chunks = [];
	for (let i = 0; i < template.length; i++) {
		if (template[i] === "$") {
			if (template[i + 1] === "$" && template[i + 2] === "{") {
				const start = i + 3;
				const end = template.indexOf("}", start);
				if (end !== -1) {
					const name = template.slice(start, end);
					if (ENV_VAR_NAME.test(name)) {
						chunks.push(`\${${name}}`);
						i = end;
						continue;
					}
				}
			}
			if (template[i + 1] === "{") {
				const start = i + 2;
				const end = template.indexOf("}", start);
				if (end !== -1) {
					const name = template.slice(start, end);
					if (ENV_VAR_NAME.test(name)) {
						const val = env[name];
						if (val === void 0 || val === "") return null;
						chunks.push(val);
						i = end;
						continue;
					}
				}
			}
		}
		chunks.push(template[i]);
	}
	return chunks.join("");
}
/**
* Deep-walk the incoming config and restore `${VAR}` references from the
* pre-substitution parsed config wherever the resolved value matches.
*
* @param incoming - The resolved config about to be written
* @param parsed - The pre-substitution parsed config (from the current file on disk)
* @param env - Environment variables for verification
* @returns A new config object with env var references restored where appropriate
*/
function restoreEnvVarRefs(incoming, parsed, env = process.env) {
	if (parsed === null || parsed === void 0) return incoming;
	if (typeof incoming === "string" && typeof parsed === "string") {
		if (hasEnvVarRef(parsed)) {
			if (tryResolveString(parsed, env) === incoming) return parsed;
		}
		return incoming;
	}
	if (Array.isArray(incoming) && Array.isArray(parsed)) return incoming.map((item, i) => i < parsed.length ? restoreEnvVarRefs(item, parsed[i], env) : item);
	if (isPlainObject$1(incoming) && isPlainObject$1(parsed)) {
		const result = {};
		for (const [key, value] of Object.entries(incoming)) if (key in parsed) result[key] = restoreEnvVarRefs(value, parsed[key], env);
		else result[key] = value;
		return result;
	}
	return incoming;
}

//#endregion
//#region src/config/env-substitution.ts
/**
* Environment variable substitution for config values.
*
* Supports `${VAR_NAME}` syntax in string values, substituted at config load time.
* - Only uppercase env vars are matched: `[A-Z_][A-Z0-9_]*`
* - Escape with `$${}` to output literal `${}`
* - Missing env vars throw `MissingEnvVarError` with context
*
* @example
* ```json5
* {
*   models: {
*     providers: {
*       "vercel-gateway": {
*         apiKey: "${VERCEL_GATEWAY_API_KEY}"
*       }
*     }
*   }
* }
* ```
*/
const ENV_VAR_NAME_PATTERN = /^[A-Z_][A-Z0-9_]*$/;
var MissingEnvVarError = class extends Error {
	constructor(varName, configPath) {
		super(`Missing env var "${varName}" referenced at config path: ${configPath}`);
		this.varName = varName;
		this.configPath = configPath;
		this.name = "MissingEnvVarError";
	}
};
function substituteString(value, env, configPath) {
	if (!value.includes("$")) return value;
	const chunks = [];
	for (let i = 0; i < value.length; i += 1) {
		const char = value[i];
		if (char !== "$") {
			chunks.push(char);
			continue;
		}
		const next = value[i + 1];
		const afterNext = value[i + 2];
		if (next === "$" && afterNext === "{") {
			const start = i + 3;
			const end = value.indexOf("}", start);
			if (end !== -1) {
				const name = value.slice(start, end);
				if (ENV_VAR_NAME_PATTERN.test(name)) {
					chunks.push(`\${${name}}`);
					i = end;
					continue;
				}
			}
		}
		if (next === "{") {
			const start = i + 2;
			const end = value.indexOf("}", start);
			if (end !== -1) {
				const name = value.slice(start, end);
				if (ENV_VAR_NAME_PATTERN.test(name)) {
					const envValue = env[name];
					if (envValue === void 0 || envValue === "") throw new MissingEnvVarError(name, configPath);
					chunks.push(envValue);
					i = end;
					continue;
				}
			}
		}
		chunks.push(char);
	}
	return chunks.join("");
}
function containsEnvVarReference(value) {
	if (!value.includes("$")) return false;
	for (let i = 0; i < value.length; i += 1) {
		if (value[i] !== "$") continue;
		const next = value[i + 1];
		const afterNext = value[i + 2];
		if (next === "$" && afterNext === "{") {
			const start = i + 3;
			const end = value.indexOf("}", start);
			if (end !== -1) {
				const name = value.slice(start, end);
				if (ENV_VAR_NAME_PATTERN.test(name)) {
					i = end;
					continue;
				}
			}
		}
		if (next === "{") {
			const start = i + 2;
			const end = value.indexOf("}", start);
			if (end !== -1) {
				const name = value.slice(start, end);
				if (ENV_VAR_NAME_PATTERN.test(name)) return true;
			}
		}
	}
	return false;
}
function substituteAny(value, env, path) {
	if (typeof value === "string") return substituteString(value, env, path);
	if (Array.isArray(value)) return value.map((item, index) => substituteAny(item, env, `${path}[${index}]`));
	if (isPlainObject$2(value)) {
		const result = {};
		for (const [key, val] of Object.entries(value)) result[key] = substituteAny(val, env, path ? `${path}.${key}` : key);
		return result;
	}
	return value;
}
/**
* Resolves `${VAR_NAME}` environment variable references in config values.
*
* @param obj - The parsed config object (after JSON5 parse and $include resolution)
* @param env - Environment variables to use for substitution (defaults to process.env)
* @returns The config object with env vars substituted
* @throws {MissingEnvVarError} If a referenced env var is not set or empty
*/
function resolveConfigEnvVars(obj, env = process.env) {
	return substituteAny(obj, env, "");
}

//#endregion
//#region src/config/env-vars.ts
function collectConfigEnvVars(cfg) {
	const envConfig = cfg?.env;
	if (!envConfig) return {};
	const entries = {};
	if (envConfig.vars) for (const [key, value] of Object.entries(envConfig.vars)) {
		if (!value) continue;
		entries[key] = value;
	}
	for (const [key, value] of Object.entries(envConfig)) {
		if (key === "shellEnv" || key === "vars") continue;
		if (typeof value !== "string" || !value.trim()) continue;
		entries[key] = value;
	}
	return entries;
}

//#endregion
//#region src/config/includes.ts
/**
* Config includes: $include directive for modular configs
*
* @example
* ```json5
* {
*   "$include": "./base.json5",           // single file
*   "$include": ["./a.json5", "./b.json5"] // merge multiple
* }
* ```
*/
const INCLUDE_KEY = "$include";
const MAX_INCLUDE_DEPTH = 10;
var ConfigIncludeError = class extends Error {
	constructor(message, includePath, cause) {
		super(message);
		this.includePath = includePath;
		this.cause = cause;
		this.name = "ConfigIncludeError";
	}
};
var CircularIncludeError = class extends ConfigIncludeError {
	constructor(chain) {
		super(`Circular include detected: ${chain.join(" -> ")}`, chain[chain.length - 1]);
		this.chain = chain;
		this.name = "CircularIncludeError";
	}
};
/** Deep merge: arrays concatenate, objects merge recursively, primitives: source wins */
function deepMerge(target, source) {
	if (Array.isArray(target) && Array.isArray(source)) return [...target, ...source];
	if (isPlainObject$2(target) && isPlainObject$2(source)) {
		const result = { ...target };
		for (const key of Object.keys(source)) result[key] = key in result ? deepMerge(result[key], source[key]) : source[key];
		return result;
	}
	return source;
}
var IncludeProcessor = class IncludeProcessor {
	constructor(basePath, resolver) {
		this.basePath = basePath;
		this.resolver = resolver;
		this.visited = /* @__PURE__ */ new Set();
		this.depth = 0;
		this.visited.add(path.normalize(basePath));
	}
	process(obj) {
		if (Array.isArray(obj)) return obj.map((item) => this.process(item));
		if (!isPlainObject$2(obj)) return obj;
		if (!(INCLUDE_KEY in obj)) return this.processObject(obj);
		return this.processInclude(obj);
	}
	processObject(obj) {
		const result = {};
		for (const [key, value] of Object.entries(obj)) result[key] = this.process(value);
		return result;
	}
	processInclude(obj) {
		const includeValue = obj[INCLUDE_KEY];
		const otherKeys = Object.keys(obj).filter((k) => k !== INCLUDE_KEY);
		const included = this.resolveInclude(includeValue);
		if (otherKeys.length === 0) return included;
		if (!isPlainObject$2(included)) throw new ConfigIncludeError("Sibling keys require included content to be an object", typeof includeValue === "string" ? includeValue : INCLUDE_KEY);
		const rest = {};
		for (const key of otherKeys) rest[key] = this.process(obj[key]);
		return deepMerge(included, rest);
	}
	resolveInclude(value) {
		if (typeof value === "string") return this.loadFile(value);
		if (Array.isArray(value)) return value.reduce((merged, item) => {
			if (typeof item !== "string") throw new ConfigIncludeError(`Invalid $include array item: expected string, got ${typeof item}`, String(item));
			return deepMerge(merged, this.loadFile(item));
		}, {});
		throw new ConfigIncludeError(`Invalid $include value: expected string or array of strings, got ${typeof value}`, String(value));
	}
	loadFile(includePath) {
		const resolvedPath = this.resolvePath(includePath);
		this.checkCircular(resolvedPath);
		this.checkDepth(includePath);
		const raw = this.readFile(includePath, resolvedPath);
		const parsed = this.parseFile(includePath, resolvedPath, raw);
		return this.processNested(resolvedPath, parsed);
	}
	resolvePath(includePath) {
		const resolved = path.isAbsolute(includePath) ? includePath : path.resolve(path.dirname(this.basePath), includePath);
		return path.normalize(resolved);
	}
	checkCircular(resolvedPath) {
		if (this.visited.has(resolvedPath)) throw new CircularIncludeError([...this.visited, resolvedPath]);
	}
	checkDepth(includePath) {
		if (this.depth >= MAX_INCLUDE_DEPTH) throw new ConfigIncludeError(`Maximum include depth (${MAX_INCLUDE_DEPTH}) exceeded at: ${includePath}`, includePath);
	}
	readFile(includePath, resolvedPath) {
		try {
			return this.resolver.readFile(resolvedPath);
		} catch (err) {
			throw new ConfigIncludeError(`Failed to read include file: ${includePath} (resolved: ${resolvedPath})`, includePath, err instanceof Error ? err : void 0);
		}
	}
	parseFile(includePath, resolvedPath, raw) {
		try {
			return this.resolver.parseJson(raw);
		} catch (err) {
			throw new ConfigIncludeError(`Failed to parse include file: ${includePath} (resolved: ${resolvedPath})`, includePath, err instanceof Error ? err : void 0);
		}
	}
	processNested(resolvedPath, parsed) {
		const nested = new IncludeProcessor(resolvedPath, this.resolver);
		nested.visited = new Set([...this.visited, resolvedPath]);
		nested.depth = this.depth + 1;
		return nested.process(parsed);
	}
};
const defaultResolver = {
	readFile: (p) => fs$1.readFileSync(p, "utf-8"),
	parseJson: (raw) => JSON5.parse(raw)
};
/**
* Resolves all $include directives in a parsed config object.
*/
function resolveConfigIncludes(obj, configPath, resolver = defaultResolver) {
	return new IncludeProcessor(configPath, resolver).process(obj);
}

//#endregion
//#region src/infra/exec-safety.ts
const SHELL_METACHARS = /[;&|`$<>]/;
const CONTROL_CHARS = /[\r\n]/;
const QUOTE_CHARS = /["']/;
const BARE_NAME_PATTERN = /^[A-Za-z0-9._+-]+$/;
function isLikelyPath(value) {
	if (value.startsWith(".") || value.startsWith("~")) return true;
	if (value.includes("/") || value.includes("\\")) return true;
	return /^[A-Za-z]:[\\/]/.test(value);
}
function isSafeExecutableValue(value) {
	if (!value) return false;
	const trimmed = value.trim();
	if (!trimmed) return false;
	if (trimmed.includes("\0")) return false;
	if (CONTROL_CHARS.test(trimmed)) return false;
	if (SHELL_METACHARS.test(trimmed)) return false;
	if (QUOTE_CHARS.test(trimmed)) return false;
	if (isLikelyPath(trimmed)) return true;
	if (trimmed.startsWith("-")) return false;
	return BARE_NAME_PATTERN.test(trimmed);
}

//#endregion
//#region src/config/legacy.shared.ts
const getRecord = (value) => isRecord(value) ? value : null;
const ensureRecord = (root, key) => {
	const existing = root[key];
	if (isRecord(existing)) return existing;
	const next = {};
	root[key] = next;
	return next;
};
const mergeMissing = (target, source) => {
	for (const [key, value] of Object.entries(source)) {
		if (value === void 0) continue;
		const existing = target[key];
		if (existing === void 0) {
			target[key] = value;
			continue;
		}
		if (isRecord(existing) && isRecord(value)) mergeMissing(existing, value);
	}
};
const mapLegacyAudioTranscription = (value) => {
	const transcriber = getRecord(value);
	const command = Array.isArray(transcriber?.command) ? transcriber?.command : null;
	if (!command || command.length === 0) return null;
	if (typeof command[0] !== "string") return null;
	if (!command.every((part) => typeof part === "string")) return null;
	const rawExecutable = command[0].trim();
	if (!rawExecutable) return null;
	if (!isSafeExecutableValue(rawExecutable)) return null;
	const args = command.slice(1);
	const timeoutSeconds = typeof transcriber?.timeoutSeconds === "number" ? transcriber?.timeoutSeconds : void 0;
	const result = {
		command: rawExecutable,
		type: "cli"
	};
	if (args.length > 0) result.args = args;
	if (timeoutSeconds !== void 0) result.timeoutSeconds = timeoutSeconds;
	return result;
};
const getAgentsList = (agents) => {
	const list = agents?.list;
	return Array.isArray(list) ? list : [];
};
const resolveDefaultAgentIdFromRaw = (raw) => {
	const list = getAgentsList(getRecord(raw.agents));
	const defaultEntry = list.find((entry) => isRecord(entry) && entry.default === true && typeof entry.id === "string" && entry.id.trim() !== "");
	if (defaultEntry) return defaultEntry.id.trim();
	const routing = getRecord(raw.routing);
	const routingDefault = typeof routing?.defaultAgentId === "string" ? routing.defaultAgentId.trim() : "";
	if (routingDefault) return routingDefault;
	const firstEntry = list.find((entry) => isRecord(entry) && typeof entry.id === "string" && entry.id.trim() !== "");
	if (firstEntry) return firstEntry.id.trim();
	return "main";
};
const ensureAgentEntry = (list, id) => {
	const normalized = id.trim();
	const existing = list.find((entry) => isRecord(entry) && typeof entry.id === "string" && entry.id.trim() === normalized);
	if (existing) return existing;
	const created = { id: normalized };
	list.push(created);
	return created;
};

//#endregion
//#region src/config/legacy.migrations.part-1.ts
const LEGACY_CONFIG_MIGRATIONS_PART_1 = [
	{
		id: "bindings.match.provider->bindings.match.channel",
		describe: "Move bindings[].match.provider to bindings[].match.channel",
		apply: (raw, changes) => {
			const bindings = Array.isArray(raw.bindings) ? raw.bindings : null;
			if (!bindings) return;
			let touched = false;
			for (const entry of bindings) {
				if (!isRecord(entry)) continue;
				const match = getRecord(entry.match);
				if (!match) continue;
				if (typeof match.channel === "string" && match.channel.trim()) continue;
				const provider = typeof match.provider === "string" ? match.provider.trim() : "";
				if (!provider) continue;
				match.channel = provider;
				delete match.provider;
				entry.match = match;
				touched = true;
			}
			if (touched) {
				raw.bindings = bindings;
				changes.push("Moved bindings[].match.provider → bindings[].match.channel.");
			}
		}
	},
	{
		id: "bindings.match.accountID->bindings.match.accountId",
		describe: "Move bindings[].match.accountID to bindings[].match.accountId",
		apply: (raw, changes) => {
			const bindings = Array.isArray(raw.bindings) ? raw.bindings : null;
			if (!bindings) return;
			let touched = false;
			for (const entry of bindings) {
				if (!isRecord(entry)) continue;
				const match = getRecord(entry.match);
				if (!match) continue;
				if (match.accountId !== void 0) continue;
				const accountID = typeof match.accountID === "string" ? match.accountID.trim() : match.accountID;
				if (!accountID) continue;
				match.accountId = accountID;
				delete match.accountID;
				entry.match = match;
				touched = true;
			}
			if (touched) {
				raw.bindings = bindings;
				changes.push("Moved bindings[].match.accountID → bindings[].match.accountId.");
			}
		}
	},
	{
		id: "session.sendPolicy.rules.match.provider->match.channel",
		describe: "Move session.sendPolicy.rules[].match.provider to match.channel",
		apply: (raw, changes) => {
			const session = getRecord(raw.session);
			if (!session) return;
			const sendPolicy = getRecord(session.sendPolicy);
			if (!sendPolicy) return;
			const rules = Array.isArray(sendPolicy.rules) ? sendPolicy.rules : null;
			if (!rules) return;
			let touched = false;
			for (const rule of rules) {
				if (!isRecord(rule)) continue;
				const match = getRecord(rule.match);
				if (!match) continue;
				if (typeof match.channel === "string" && match.channel.trim()) continue;
				const provider = typeof match.provider === "string" ? match.provider.trim() : "";
				if (!provider) continue;
				match.channel = provider;
				delete match.provider;
				rule.match = match;
				touched = true;
			}
			if (touched) {
				sendPolicy.rules = rules;
				session.sendPolicy = sendPolicy;
				raw.session = session;
				changes.push("Moved session.sendPolicy.rules[].match.provider → match.channel.");
			}
		}
	},
	{
		id: "messages.queue.byProvider->byChannel",
		describe: "Move messages.queue.byProvider to messages.queue.byChannel",
		apply: (raw, changes) => {
			const messages = getRecord(raw.messages);
			if (!messages) return;
			const queue = getRecord(messages.queue);
			if (!queue) return;
			if (queue.byProvider === void 0) return;
			if (queue.byChannel === void 0) {
				queue.byChannel = queue.byProvider;
				changes.push("Moved messages.queue.byProvider → messages.queue.byChannel.");
			} else changes.push("Removed messages.queue.byProvider (messages.queue.byChannel already set).");
			delete queue.byProvider;
			messages.queue = queue;
			raw.messages = messages;
		}
	},
	{
		id: "providers->channels",
		describe: "Move provider config sections to channels.*",
		apply: (raw, changes) => {
			const legacyEntries = [
				"whatsapp",
				"telegram",
				"discord",
				"slack",
				"signal",
				"imessage",
				"msteams"
			].filter((key) => isRecord(raw[key]));
			if (legacyEntries.length === 0) return;
			const channels = ensureRecord(raw, "channels");
			for (const key of legacyEntries) {
				const legacy = getRecord(raw[key]);
				if (!legacy) continue;
				const channelEntry = ensureRecord(channels, key);
				const hadEntries = Object.keys(channelEntry).length > 0;
				mergeMissing(channelEntry, legacy);
				channels[key] = channelEntry;
				delete raw[key];
				changes.push(hadEntries ? `Merged ${key} → channels.${key}.` : `Moved ${key} → channels.${key}.`);
			}
			raw.channels = channels;
		}
	},
	{
		id: "routing.allowFrom->channels.whatsapp.allowFrom",
		describe: "Move routing.allowFrom to channels.whatsapp.allowFrom",
		apply: (raw, changes) => {
			const routing = raw.routing;
			if (!routing || typeof routing !== "object") return;
			const allowFrom = routing.allowFrom;
			if (allowFrom === void 0) return;
			const channels = getRecord(raw.channels);
			const whatsapp = channels ? getRecord(channels.whatsapp) : null;
			if (!whatsapp) {
				delete routing.allowFrom;
				if (Object.keys(routing).length === 0) delete raw.routing;
				changes.push("Removed routing.allowFrom (channels.whatsapp not configured).");
				return;
			}
			if (whatsapp.allowFrom === void 0) {
				whatsapp.allowFrom = allowFrom;
				changes.push("Moved routing.allowFrom → channels.whatsapp.allowFrom.");
			} else changes.push("Removed routing.allowFrom (channels.whatsapp.allowFrom already set).");
			delete routing.allowFrom;
			if (Object.keys(routing).length === 0) delete raw.routing;
			channels.whatsapp = whatsapp;
			raw.channels = channels;
		}
	},
	{
		id: "routing.groupChat.requireMention->groups.*.requireMention",
		describe: "Move routing.groupChat.requireMention to channels.whatsapp/telegram/imessage groups",
		apply: (raw, changes) => {
			const routing = raw.routing;
			if (!routing || typeof routing !== "object") return;
			const groupChat = routing.groupChat && typeof routing.groupChat === "object" ? routing.groupChat : null;
			if (!groupChat) return;
			const requireMention = groupChat.requireMention;
			if (requireMention === void 0) return;
			const channels = ensureRecord(raw, "channels");
			const applyTo = (key, options) => {
				if (options?.requireExisting && !isRecord(channels[key])) return;
				const section = channels[key] && typeof channels[key] === "object" ? channels[key] : {};
				const groups = section.groups && typeof section.groups === "object" ? section.groups : {};
				const defaultKey = "*";
				const entry = groups[defaultKey] && typeof groups[defaultKey] === "object" ? groups[defaultKey] : {};
				if (entry.requireMention === void 0) {
					entry.requireMention = requireMention;
					groups[defaultKey] = entry;
					section.groups = groups;
					channels[key] = section;
					changes.push(`Moved routing.groupChat.requireMention → channels.${key}.groups."*".requireMention.`);
				} else changes.push(`Removed routing.groupChat.requireMention (channels.${key}.groups."*" already set).`);
			};
			applyTo("whatsapp", { requireExisting: true });
			applyTo("telegram");
			applyTo("imessage");
			delete groupChat.requireMention;
			if (Object.keys(groupChat).length === 0) delete routing.groupChat;
			if (Object.keys(routing).length === 0) delete raw.routing;
			raw.channels = channels;
		}
	},
	{
		id: "gateway.token->gateway.auth.token",
		describe: "Move gateway.token to gateway.auth.token",
		apply: (raw, changes) => {
			const gateway = raw.gateway;
			if (!gateway || typeof gateway !== "object") return;
			const token = gateway.token;
			if (token === void 0) return;
			const gatewayObj = gateway;
			const auth = gatewayObj.auth && typeof gatewayObj.auth === "object" ? gatewayObj.auth : {};
			if (auth.token === void 0) {
				auth.token = token;
				if (!auth.mode) auth.mode = "token";
				changes.push("Moved gateway.token → gateway.auth.token.");
			} else changes.push("Removed gateway.token (gateway.auth.token already set).");
			delete gatewayObj.token;
			if (Object.keys(auth).length > 0) gatewayObj.auth = auth;
			raw.gateway = gatewayObj;
		}
	},
	{
		id: "telegram.requireMention->channels.telegram.groups.*.requireMention",
		describe: "Move telegram.requireMention to channels.telegram.groups.*.requireMention",
		apply: (raw, changes) => {
			const channels = ensureRecord(raw, "channels");
			const telegram = channels.telegram;
			if (!telegram || typeof telegram !== "object") return;
			const requireMention = telegram.requireMention;
			if (requireMention === void 0) return;
			const groups = telegram.groups && typeof telegram.groups === "object" ? telegram.groups : {};
			const defaultKey = "*";
			const entry = groups[defaultKey] && typeof groups[defaultKey] === "object" ? groups[defaultKey] : {};
			if (entry.requireMention === void 0) {
				entry.requireMention = requireMention;
				groups[defaultKey] = entry;
				telegram.groups = groups;
				changes.push("Moved telegram.requireMention → channels.telegram.groups.\"*\".requireMention.");
			} else changes.push("Removed telegram.requireMention (channels.telegram.groups.\"*\" already set).");
			delete telegram.requireMention;
			channels.telegram = telegram;
			raw.channels = channels;
		}
	}
];

//#endregion
//#region src/config/legacy.migrations.part-2.ts
const LEGACY_CONFIG_MIGRATIONS_PART_2 = [
	{
		id: "agent.model-config-v2",
		describe: "Migrate legacy agent.model/allowedModels/modelAliases/modelFallbacks/imageModelFallbacks to agent.models + model lists",
		apply: (raw, changes) => {
			const agentRoot = getRecord(raw.agent);
			const defaults = getRecord(getRecord(raw.agents)?.defaults);
			const agent = agentRoot ?? defaults;
			if (!agent) return;
			const label = agentRoot ? "agent" : "agents.defaults";
			const legacyModel = typeof agent.model === "string" ? String(agent.model) : void 0;
			const legacyImageModel = typeof agent.imageModel === "string" ? String(agent.imageModel) : void 0;
			const legacyAllowed = Array.isArray(agent.allowedModels) ? agent.allowedModels.map(String) : [];
			const legacyModelFallbacks = Array.isArray(agent.modelFallbacks) ? agent.modelFallbacks.map(String) : [];
			const legacyImageModelFallbacks = Array.isArray(agent.imageModelFallbacks) ? agent.imageModelFallbacks.map(String) : [];
			const legacyAliases = agent.modelAliases && typeof agent.modelAliases === "object" ? agent.modelAliases : {};
			if (!(legacyModel || legacyImageModel || legacyAllowed.length > 0 || legacyModelFallbacks.length > 0 || legacyImageModelFallbacks.length > 0 || Object.keys(legacyAliases).length > 0)) return;
			const models = agent.models && typeof agent.models === "object" ? agent.models : {};
			const ensureModel = (rawKey) => {
				if (typeof rawKey !== "string") return;
				const key = rawKey.trim();
				if (!key) return;
				if (!models[key]) models[key] = {};
			};
			ensureModel(legacyModel);
			ensureModel(legacyImageModel);
			for (const key of legacyAllowed) ensureModel(key);
			for (const key of legacyModelFallbacks) ensureModel(key);
			for (const key of legacyImageModelFallbacks) ensureModel(key);
			for (const target of Object.values(legacyAliases)) {
				if (typeof target !== "string") continue;
				ensureModel(target);
			}
			for (const [alias, targetRaw] of Object.entries(legacyAliases)) {
				if (typeof targetRaw !== "string") continue;
				const target = targetRaw.trim();
				if (!target) continue;
				const entry = models[target] && typeof models[target] === "object" ? models[target] : {};
				if (!("alias" in entry)) {
					entry.alias = alias;
					models[target] = entry;
				}
			}
			const currentModel = agent.model && typeof agent.model === "object" ? agent.model : null;
			if (currentModel) {
				if (!currentModel.primary && legacyModel) currentModel.primary = legacyModel;
				if (legacyModelFallbacks.length > 0 && (!Array.isArray(currentModel.fallbacks) || currentModel.fallbacks.length === 0)) currentModel.fallbacks = legacyModelFallbacks;
				agent.model = currentModel;
			} else if (legacyModel || legacyModelFallbacks.length > 0) agent.model = {
				primary: legacyModel,
				fallbacks: legacyModelFallbacks.length ? legacyModelFallbacks : []
			};
			const currentImageModel = agent.imageModel && typeof agent.imageModel === "object" ? agent.imageModel : null;
			if (currentImageModel) {
				if (!currentImageModel.primary && legacyImageModel) currentImageModel.primary = legacyImageModel;
				if (legacyImageModelFallbacks.length > 0 && (!Array.isArray(currentImageModel.fallbacks) || currentImageModel.fallbacks.length === 0)) currentImageModel.fallbacks = legacyImageModelFallbacks;
				agent.imageModel = currentImageModel;
			} else if (legacyImageModel || legacyImageModelFallbacks.length > 0) agent.imageModel = {
				primary: legacyImageModel,
				fallbacks: legacyImageModelFallbacks.length ? legacyImageModelFallbacks : []
			};
			agent.models = models;
			if (legacyModel !== void 0) changes.push(`Migrated ${label}.model string → ${label}.model.primary.`);
			if (legacyModelFallbacks.length > 0) changes.push(`Migrated ${label}.modelFallbacks → ${label}.model.fallbacks.`);
			if (legacyImageModel !== void 0) changes.push(`Migrated ${label}.imageModel string → ${label}.imageModel.primary.`);
			if (legacyImageModelFallbacks.length > 0) changes.push(`Migrated ${label}.imageModelFallbacks → ${label}.imageModel.fallbacks.`);
			if (legacyAllowed.length > 0) changes.push(`Migrated ${label}.allowedModels → ${label}.models.`);
			if (Object.keys(legacyAliases).length > 0) changes.push(`Migrated ${label}.modelAliases → ${label}.models.*.alias.`);
			delete agent.allowedModels;
			delete agent.modelAliases;
			delete agent.modelFallbacks;
			delete agent.imageModelFallbacks;
		}
	},
	{
		id: "routing.agents-v2",
		describe: "Move routing.agents/defaultAgentId to agents.list",
		apply: (raw, changes) => {
			const routing = getRecord(raw.routing);
			if (!routing) return;
			const routingAgents = getRecord(routing.agents);
			const agents = ensureRecord(raw, "agents");
			const list = getAgentsList(agents);
			if (routingAgents) {
				for (const [rawId, entryRaw] of Object.entries(routingAgents)) {
					const agentId = String(rawId ?? "").trim();
					const entry = getRecord(entryRaw);
					if (!agentId || !entry) continue;
					const target = ensureAgentEntry(list, agentId);
					const entryCopy = { ...entry };
					if ("mentionPatterns" in entryCopy) {
						const mentionPatterns = entryCopy.mentionPatterns;
						const groupChat = ensureRecord(target, "groupChat");
						if (groupChat.mentionPatterns === void 0) {
							groupChat.mentionPatterns = mentionPatterns;
							changes.push(`Moved routing.agents.${agentId}.mentionPatterns → agents.list (id "${agentId}").groupChat.mentionPatterns.`);
						} else changes.push(`Removed routing.agents.${agentId}.mentionPatterns (agents.list groupChat mentionPatterns already set).`);
						delete entryCopy.mentionPatterns;
					}
					const legacyGroupChat = getRecord(entryCopy.groupChat);
					if (legacyGroupChat) {
						mergeMissing(ensureRecord(target, "groupChat"), legacyGroupChat);
						delete entryCopy.groupChat;
					}
					const legacySandbox = getRecord(entryCopy.sandbox);
					if (legacySandbox) {
						const sandboxTools = getRecord(legacySandbox.tools);
						if (sandboxTools) {
							mergeMissing(ensureRecord(ensureRecord(ensureRecord(target, "tools"), "sandbox"), "tools"), sandboxTools);
							delete legacySandbox.tools;
							changes.push(`Moved routing.agents.${agentId}.sandbox.tools → agents.list (id "${agentId}").tools.sandbox.tools.`);
						}
						entryCopy.sandbox = legacySandbox;
					}
					mergeMissing(target, entryCopy);
				}
				delete routing.agents;
				changes.push("Moved routing.agents → agents.list.");
			}
			const defaultAgentId = typeof routing.defaultAgentId === "string" ? routing.defaultAgentId.trim() : "";
			if (defaultAgentId) {
				if (!list.some((entry) => isRecord(entry) && entry.default === true)) {
					const entry = ensureAgentEntry(list, defaultAgentId);
					entry.default = true;
					changes.push(`Moved routing.defaultAgentId → agents.list (id "${defaultAgentId}").default.`);
				} else changes.push("Removed routing.defaultAgentId (agents.list default already set).");
				delete routing.defaultAgentId;
			}
			if (list.length > 0) agents.list = list;
			if (Object.keys(routing).length === 0) delete raw.routing;
		}
	},
	{
		id: "routing.config-v2",
		describe: "Move routing bindings/groupChat/queue/agentToAgent/transcribeAudio",
		apply: (raw, changes) => {
			const routing = getRecord(raw.routing);
			if (!routing) return;
			if (routing.bindings !== void 0) {
				if (raw.bindings === void 0) {
					raw.bindings = routing.bindings;
					changes.push("Moved routing.bindings → bindings.");
				} else changes.push("Removed routing.bindings (bindings already set).");
				delete routing.bindings;
			}
			if (routing.agentToAgent !== void 0) {
				const tools = ensureRecord(raw, "tools");
				if (tools.agentToAgent === void 0) {
					tools.agentToAgent = routing.agentToAgent;
					changes.push("Moved routing.agentToAgent → tools.agentToAgent.");
				} else changes.push("Removed routing.agentToAgent (tools.agentToAgent already set).");
				delete routing.agentToAgent;
			}
			if (routing.queue !== void 0) {
				const messages = ensureRecord(raw, "messages");
				if (messages.queue === void 0) {
					messages.queue = routing.queue;
					changes.push("Moved routing.queue → messages.queue.");
				} else changes.push("Removed routing.queue (messages.queue already set).");
				delete routing.queue;
			}
			const groupChat = getRecord(routing.groupChat);
			if (groupChat) {
				const historyLimit = groupChat.historyLimit;
				if (historyLimit !== void 0) {
					const messagesGroup = ensureRecord(ensureRecord(raw, "messages"), "groupChat");
					if (messagesGroup.historyLimit === void 0) {
						messagesGroup.historyLimit = historyLimit;
						changes.push("Moved routing.groupChat.historyLimit → messages.groupChat.historyLimit.");
					} else changes.push("Removed routing.groupChat.historyLimit (messages.groupChat.historyLimit already set).");
					delete groupChat.historyLimit;
				}
				const mentionPatterns = groupChat.mentionPatterns;
				if (mentionPatterns !== void 0) {
					const messagesGroup = ensureRecord(ensureRecord(raw, "messages"), "groupChat");
					if (messagesGroup.mentionPatterns === void 0) {
						messagesGroup.mentionPatterns = mentionPatterns;
						changes.push("Moved routing.groupChat.mentionPatterns → messages.groupChat.mentionPatterns.");
					} else changes.push("Removed routing.groupChat.mentionPatterns (messages.groupChat.mentionPatterns already set).");
					delete groupChat.mentionPatterns;
				}
				if (Object.keys(groupChat).length === 0) delete routing.groupChat;
				else routing.groupChat = groupChat;
			}
			if (routing.transcribeAudio !== void 0) {
				const mapped = mapLegacyAudioTranscription(routing.transcribeAudio);
				if (mapped) {
					const mediaAudio = ensureRecord(ensureRecord(ensureRecord(raw, "tools"), "media"), "audio");
					if ((Array.isArray(mediaAudio.models) ? mediaAudio.models : []).length === 0) {
						mediaAudio.enabled = true;
						mediaAudio.models = [mapped];
						changes.push("Moved routing.transcribeAudio → tools.media.audio.models.");
					} else changes.push("Removed routing.transcribeAudio (tools.media.audio.models already set).");
				} else changes.push("Removed routing.transcribeAudio (invalid or empty command).");
				delete routing.transcribeAudio;
			}
			if (Object.keys(routing).length === 0) delete raw.routing;
		}
	},
	{
		id: "audio.transcription-v2",
		describe: "Move audio.transcription to tools.media.audio.models",
		apply: (raw, changes) => {
			const audio = getRecord(raw.audio);
			if (audio?.transcription === void 0) return;
			const mapped = mapLegacyAudioTranscription(audio.transcription);
			if (mapped) {
				const mediaAudio = ensureRecord(ensureRecord(ensureRecord(raw, "tools"), "media"), "audio");
				if ((Array.isArray(mediaAudio.models) ? mediaAudio.models : []).length === 0) {
					mediaAudio.enabled = true;
					mediaAudio.models = [mapped];
					changes.push("Moved audio.transcription → tools.media.audio.models.");
				} else changes.push("Removed audio.transcription (tools.media.audio.models already set).");
				delete audio.transcription;
				if (Object.keys(audio).length === 0) delete raw.audio;
				else raw.audio = audio;
			} else {
				delete audio.transcription;
				changes.push("Removed audio.transcription (invalid or empty command).");
				if (Object.keys(audio).length === 0) delete raw.audio;
				else raw.audio = audio;
			}
		}
	}
];

//#endregion
//#region src/config/legacy.migrations.part-3.ts
const LEGACY_CONFIG_MIGRATIONS_PART_3 = [
	{
		id: "memorySearch->agents.defaults.memorySearch",
		describe: "Move top-level memorySearch to agents.defaults.memorySearch",
		apply: (raw, changes) => {
			const legacyMemorySearch = getRecord(raw.memorySearch);
			if (!legacyMemorySearch) return;
			const agents = ensureRecord(raw, "agents");
			const defaults = ensureRecord(agents, "defaults");
			const existing = getRecord(defaults.memorySearch);
			if (!existing) {
				defaults.memorySearch = legacyMemorySearch;
				changes.push("Moved memorySearch → agents.defaults.memorySearch.");
			} else {
				const merged = structuredClone(existing);
				mergeMissing(merged, legacyMemorySearch);
				defaults.memorySearch = merged;
				changes.push("Merged memorySearch → agents.defaults.memorySearch (filled missing fields from legacy; kept explicit agents.defaults values).");
			}
			agents.defaults = defaults;
			raw.agents = agents;
			delete raw.memorySearch;
		}
	},
	{
		id: "auth.anthropic-claude-cli-mode-oauth",
		describe: "Switch anthropic:claude-cli auth profile mode to oauth",
		apply: (raw, changes) => {
			const profiles = getRecord(getRecord(raw.auth)?.profiles);
			if (!profiles) return;
			const claudeCli = getRecord(profiles["anthropic:claude-cli"]);
			if (!claudeCli) return;
			if (claudeCli.mode !== "token") return;
			claudeCli.mode = "oauth";
			changes.push("Updated auth.profiles[\"anthropic:claude-cli\"].mode → \"oauth\".");
		}
	},
	{
		id: "tools.bash->tools.exec",
		describe: "Move tools.bash to tools.exec",
		apply: (raw, changes) => {
			const tools = ensureRecord(raw, "tools");
			const bash = getRecord(tools.bash);
			if (!bash) return;
			if (tools.exec === void 0) {
				tools.exec = bash;
				changes.push("Moved tools.bash → tools.exec.");
			} else changes.push("Removed tools.bash (tools.exec already set).");
			delete tools.bash;
		}
	},
	{
		id: "messages.tts.enabled->auto",
		describe: "Move messages.tts.enabled to messages.tts.auto",
		apply: (raw, changes) => {
			const tts = getRecord(getRecord(raw.messages)?.tts);
			if (!tts) return;
			if (tts.auto !== void 0) {
				if ("enabled" in tts) {
					delete tts.enabled;
					changes.push("Removed messages.tts.enabled (messages.tts.auto already set).");
				}
				return;
			}
			if (typeof tts.enabled !== "boolean") return;
			tts.auto = tts.enabled ? "always" : "off";
			delete tts.enabled;
			changes.push(`Moved messages.tts.enabled → messages.tts.auto (${String(tts.auto)}).`);
		}
	},
	{
		id: "agent.defaults-v2",
		describe: "Move agent config to agents.defaults and tools",
		apply: (raw, changes) => {
			const agent = getRecord(raw.agent);
			if (!agent) return;
			const agents = ensureRecord(raw, "agents");
			const defaults = getRecord(agents.defaults) ?? {};
			const tools = ensureRecord(raw, "tools");
			const agentTools = getRecord(agent.tools);
			if (agentTools) {
				if (tools.allow === void 0 && agentTools.allow !== void 0) {
					tools.allow = agentTools.allow;
					changes.push("Moved agent.tools.allow → tools.allow.");
				}
				if (tools.deny === void 0 && agentTools.deny !== void 0) {
					tools.deny = agentTools.deny;
					changes.push("Moved agent.tools.deny → tools.deny.");
				}
			}
			const elevated = getRecord(agent.elevated);
			if (elevated) if (tools.elevated === void 0) {
				tools.elevated = elevated;
				changes.push("Moved agent.elevated → tools.elevated.");
			} else changes.push("Removed agent.elevated (tools.elevated already set).");
			const bash = getRecord(agent.bash);
			if (bash) if (tools.exec === void 0) {
				tools.exec = bash;
				changes.push("Moved agent.bash → tools.exec.");
			} else changes.push("Removed agent.bash (tools.exec already set).");
			const sandbox = getRecord(agent.sandbox);
			if (sandbox) {
				const sandboxTools = getRecord(sandbox.tools);
				if (sandboxTools) {
					mergeMissing(ensureRecord(ensureRecord(tools, "sandbox"), "tools"), sandboxTools);
					delete sandbox.tools;
					changes.push("Moved agent.sandbox.tools → tools.sandbox.tools.");
				}
			}
			const subagents = getRecord(agent.subagents);
			if (subagents) {
				const subagentTools = getRecord(subagents.tools);
				if (subagentTools) {
					mergeMissing(ensureRecord(ensureRecord(tools, "subagents"), "tools"), subagentTools);
					delete subagents.tools;
					changes.push("Moved agent.subagents.tools → tools.subagents.tools.");
				}
			}
			const agentCopy = structuredClone(agent);
			delete agentCopy.tools;
			delete agentCopy.elevated;
			delete agentCopy.bash;
			if (isRecord(agentCopy.sandbox)) delete agentCopy.sandbox.tools;
			if (isRecord(agentCopy.subagents)) delete agentCopy.subagents.tools;
			mergeMissing(defaults, agentCopy);
			agents.defaults = defaults;
			raw.agents = agents;
			delete raw.agent;
			changes.push("Moved agent → agents.defaults.");
		}
	},
	{
		id: "identity->agents.list",
		describe: "Move identity to agents.list[].identity",
		apply: (raw, changes) => {
			const identity = getRecord(raw.identity);
			if (!identity) return;
			const agents = ensureRecord(raw, "agents");
			const list = getAgentsList(agents);
			const defaultId = resolveDefaultAgentIdFromRaw(raw);
			const entry = ensureAgentEntry(list, defaultId);
			if (entry.identity === void 0) {
				entry.identity = identity;
				changes.push(`Moved identity → agents.list (id "${defaultId}").identity.`);
			} else changes.push("Removed identity (agents.list identity already set).");
			agents.list = list;
			raw.agents = agents;
			delete raw.identity;
		}
	}
];

//#endregion
//#region src/config/legacy.migrations.ts
const LEGACY_CONFIG_MIGRATIONS = [
	...LEGACY_CONFIG_MIGRATIONS_PART_1,
	...LEGACY_CONFIG_MIGRATIONS_PART_2,
	...LEGACY_CONFIG_MIGRATIONS_PART_3
];

//#endregion
//#region src/config/legacy.rules.ts
const LEGACY_CONFIG_RULES = [
	{
		path: ["whatsapp"],
		message: "whatsapp config moved to channels.whatsapp (auto-migrated on load)."
	},
	{
		path: ["telegram"],
		message: "telegram config moved to channels.telegram (auto-migrated on load)."
	},
	{
		path: ["discord"],
		message: "discord config moved to channels.discord (auto-migrated on load)."
	},
	{
		path: ["slack"],
		message: "slack config moved to channels.slack (auto-migrated on load)."
	},
	{
		path: ["signal"],
		message: "signal config moved to channels.signal (auto-migrated on load)."
	},
	{
		path: ["imessage"],
		message: "imessage config moved to channels.imessage (auto-migrated on load)."
	},
	{
		path: ["msteams"],
		message: "msteams config moved to channels.msteams (auto-migrated on load)."
	},
	{
		path: ["routing", "allowFrom"],
		message: "routing.allowFrom was removed; use channels.whatsapp.allowFrom instead (auto-migrated on load)."
	},
	{
		path: ["routing", "bindings"],
		message: "routing.bindings was moved; use top-level bindings instead (auto-migrated on load)."
	},
	{
		path: ["routing", "agents"],
		message: "routing.agents was moved; use agents.list instead (auto-migrated on load)."
	},
	{
		path: ["routing", "defaultAgentId"],
		message: "routing.defaultAgentId was moved; use agents.list[].default instead (auto-migrated on load)."
	},
	{
		path: ["routing", "agentToAgent"],
		message: "routing.agentToAgent was moved; use tools.agentToAgent instead (auto-migrated on load)."
	},
	{
		path: [
			"routing",
			"groupChat",
			"requireMention"
		],
		message: "routing.groupChat.requireMention was removed; use channels.whatsapp/telegram/imessage groups defaults (e.g. channels.whatsapp.groups.\"*\".requireMention) instead (auto-migrated on load)."
	},
	{
		path: [
			"routing",
			"groupChat",
			"mentionPatterns"
		],
		message: "routing.groupChat.mentionPatterns was moved; use agents.list[].groupChat.mentionPatterns or messages.groupChat.mentionPatterns instead (auto-migrated on load)."
	},
	{
		path: ["routing", "queue"],
		message: "routing.queue was moved; use messages.queue instead (auto-migrated on load)."
	},
	{
		path: ["routing", "transcribeAudio"],
		message: "routing.transcribeAudio was moved; use tools.media.audio.models instead (auto-migrated on load)."
	},
	{
		path: ["telegram", "requireMention"],
		message: "telegram.requireMention was removed; use channels.telegram.groups.\"*\".requireMention instead (auto-migrated on load)."
	},
	{
		path: ["identity"],
		message: "identity was moved; use agents.list[].identity instead (auto-migrated on load)."
	},
	{
		path: ["agent"],
		message: "agent.* was moved; use agents.defaults (and tools.* for tool/elevated/exec settings) instead (auto-migrated on load)."
	},
	{
		path: ["memorySearch"],
		message: "top-level memorySearch was moved; use agents.defaults.memorySearch instead (auto-migrated on load)."
	},
	{
		path: ["tools", "bash"],
		message: "tools.bash was removed; use tools.exec instead (auto-migrated on load)."
	},
	{
		path: ["agent", "model"],
		message: "agent.model string was replaced by agents.defaults.model.primary/fallbacks and agents.defaults.models (auto-migrated on load).",
		match: (value) => typeof value === "string"
	},
	{
		path: ["agent", "imageModel"],
		message: "agent.imageModel string was replaced by agents.defaults.imageModel.primary/fallbacks (auto-migrated on load).",
		match: (value) => typeof value === "string"
	},
	{
		path: ["agent", "allowedModels"],
		message: "agent.allowedModels was replaced by agents.defaults.models (auto-migrated on load)."
	},
	{
		path: ["agent", "modelAliases"],
		message: "agent.modelAliases was replaced by agents.defaults.models.*.alias (auto-migrated on load)."
	},
	{
		path: ["agent", "modelFallbacks"],
		message: "agent.modelFallbacks was replaced by agents.defaults.model.fallbacks (auto-migrated on load)."
	},
	{
		path: ["agent", "imageModelFallbacks"],
		message: "agent.imageModelFallbacks was replaced by agents.defaults.imageModel.fallbacks (auto-migrated on load)."
	},
	{
		path: [
			"messages",
			"tts",
			"enabled"
		],
		message: "messages.tts.enabled was replaced by messages.tts.auto (auto-migrated on load)."
	},
	{
		path: ["gateway", "token"],
		message: "gateway.token is ignored; use gateway.auth.token instead (auto-migrated on load)."
	}
];

//#endregion
//#region src/config/legacy.ts
function findLegacyConfigIssues(raw) {
	if (!raw || typeof raw !== "object") return [];
	const root = raw;
	const issues = [];
	for (const rule of LEGACY_CONFIG_RULES) {
		let cursor = root;
		for (const key of rule.path) {
			if (!cursor || typeof cursor !== "object") {
				cursor = void 0;
				break;
			}
			cursor = cursor[key];
		}
		if (cursor !== void 0 && (!rule.match || rule.match(cursor, root))) issues.push({
			path: rule.path.join("."),
			message: rule.message
		});
	}
	return issues;
}

//#endregion
//#region src/config/merge-patch.ts
function applyMergePatch(base, patch) {
	if (!isPlainObject$2(patch)) return patch;
	const result = isPlainObject$2(base) ? { ...base } : {};
	for (const [key, value] of Object.entries(patch)) {
		if (value === null) {
			delete result[key];
			continue;
		}
		if (isPlainObject$2(value)) {
			const baseValue = result[key];
			result[key] = applyMergePatch(isPlainObject$2(baseValue) ? baseValue : {}, value);
			continue;
		}
		result[key] = value;
	}
	return result;
}

//#endregion
//#region src/config/normalize-paths.ts
const PATH_VALUE_RE = /^~(?=$|[\\/])/;
const PATH_KEY_RE = /(dir|path|paths|file|root|workspace)$/i;
const PATH_LIST_KEYS = new Set(["paths", "pathPrepend"]);
function normalizeStringValue(key, value) {
	if (!PATH_VALUE_RE.test(value.trim())) return value;
	if (!key) return value;
	if (PATH_KEY_RE.test(key) || PATH_LIST_KEYS.has(key)) return resolveUserPath(value);
	return value;
}
function normalizeAny(key, value) {
	if (typeof value === "string") return normalizeStringValue(key, value);
	if (Array.isArray(value)) {
		const normalizeChildren = Boolean(key && PATH_LIST_KEYS.has(key));
		return value.map((entry) => {
			if (typeof entry === "string") return normalizeChildren ? normalizeStringValue(key, entry) : entry;
			if (Array.isArray(entry)) return normalizeAny(void 0, entry);
			if (isPlainObject$2(entry)) return normalizeAny(void 0, entry);
			return entry;
		});
	}
	if (!isPlainObject$2(value)) return value;
	for (const [childKey, childValue] of Object.entries(value)) {
		const next = normalizeAny(childKey, childValue);
		if (next !== childValue) value[childKey] = next;
	}
	return value;
}
/**
* Normalize "~" paths in path-ish config fields.
*
* Goal: accept `~/...` consistently across config file + env overrides, while
* keeping the surface area small and predictable.
*/
function normalizeConfigPaths(cfg) {
	if (!cfg || typeof cfg !== "object") return cfg;
	normalizeAny(void 0, cfg);
	return cfg;
}

//#endregion
//#region src/config/config-paths.ts
const BLOCKED_KEYS = new Set([
	"__proto__",
	"prototype",
	"constructor"
]);
function parseConfigPath(raw) {
	const trimmed = raw.trim();
	if (!trimmed) return {
		ok: false,
		error: "Invalid path. Use dot notation (e.g. foo.bar)."
	};
	const parts = trimmed.split(".").map((part) => part.trim());
	if (parts.some((part) => !part)) return {
		ok: false,
		error: "Invalid path. Use dot notation (e.g. foo.bar)."
	};
	if (parts.some((part) => BLOCKED_KEYS.has(part))) return {
		ok: false,
		error: "Invalid path segment."
	};
	return {
		ok: true,
		path: parts
	};
}
function setConfigValueAtPath(root, path, value) {
	let cursor = root;
	for (let idx = 0; idx < path.length - 1; idx += 1) {
		const key = path[idx];
		const next = cursor[key];
		if (!isPlainObject$2(next)) cursor[key] = {};
		cursor = cursor[key];
	}
	cursor[path[path.length - 1]] = value;
}
function unsetConfigValueAtPath(root, path) {
	const stack = [];
	let cursor = root;
	for (let idx = 0; idx < path.length - 1; idx += 1) {
		const key = path[idx];
		const next = cursor[key];
		if (!isPlainObject$2(next)) return false;
		stack.push({
			node: cursor,
			key
		});
		cursor = next;
	}
	const leafKey = path[path.length - 1];
	if (!(leafKey in cursor)) return false;
	delete cursor[leafKey];
	for (let idx = stack.length - 1; idx >= 0; idx -= 1) {
		const { node, key } = stack[idx];
		const child = node[key];
		if (isPlainObject$2(child) && Object.keys(child).length === 0) delete node[key];
		else break;
	}
	return true;
}
function getConfigValueAtPath(root, path) {
	let cursor = root;
	for (const key of path) {
		if (!isPlainObject$2(cursor)) return;
		cursor = cursor[key];
	}
	return cursor;
}

//#endregion
//#region src/config/runtime-overrides.ts
let overrides = {};
function mergeOverrides(base, override) {
	if (!isPlainObject$2(base) || !isPlainObject$2(override)) return override;
	const next = { ...base };
	for (const [key, value] of Object.entries(override)) {
		if (value === void 0) continue;
		next[key] = mergeOverrides(base[key], value);
	}
	return next;
}
function getConfigOverrides() {
	return overrides;
}
function resetConfigOverrides() {
	overrides = {};
}
function setConfigOverride(pathRaw, value) {
	const parsed = parseConfigPath(pathRaw);
	if (!parsed.ok || !parsed.path) return {
		ok: false,
		error: parsed.error ?? "Invalid path."
	};
	setConfigValueAtPath(overrides, parsed.path, value);
	return { ok: true };
}
function unsetConfigOverride(pathRaw) {
	const parsed = parseConfigPath(pathRaw);
	if (!parsed.ok || !parsed.path) return {
		ok: false,
		removed: false,
		error: parsed.error ?? "Invalid path."
	};
	return {
		ok: true,
		removed: unsetConfigValueAtPath(overrides, parsed.path)
	};
}
function applyConfigOverrides(cfg) {
	if (!overrides || Object.keys(overrides).length === 0) return cfg;
	return mergeOverrides(cfg, overrides);
}

//#endregion
//#region src/plugins/slots.ts
const DEFAULT_SLOT_BY_KEY = { memory: "memory-core" };
function defaultSlotIdForKey(slotKey) {
	return DEFAULT_SLOT_BY_KEY[slotKey];
}

//#endregion
//#region src/plugins/config-state.ts
const BUNDLED_ENABLED_BY_DEFAULT = new Set([
	"device-pair",
	"phone-control",
	"talk-voice"
]);
const normalizeList = (value) => {
	if (!Array.isArray(value)) return [];
	return value.map((entry) => typeof entry === "string" ? entry.trim() : "").filter(Boolean);
};
const normalizeSlotValue = (value) => {
	if (typeof value !== "string") return;
	const trimmed = value.trim();
	if (!trimmed) return;
	if (trimmed.toLowerCase() === "none") return null;
	return trimmed;
};
const normalizePluginEntries = (entries) => {
	if (!entries || typeof entries !== "object" || Array.isArray(entries)) return {};
	const normalized = {};
	for (const [key, value] of Object.entries(entries)) {
		if (!key.trim()) continue;
		if (!value || typeof value !== "object" || Array.isArray(value)) {
			normalized[key] = {};
			continue;
		}
		const entry = value;
		normalized[key] = {
			enabled: typeof entry.enabled === "boolean" ? entry.enabled : void 0,
			config: "config" in entry ? entry.config : void 0
		};
	}
	return normalized;
};
const normalizePluginsConfig = (config) => {
	const memorySlot = normalizeSlotValue(config?.slots?.memory);
	return {
		enabled: config?.enabled !== false,
		allow: normalizeList(config?.allow),
		deny: normalizeList(config?.deny),
		loadPaths: normalizeList(config?.load?.paths),
		slots: { memory: memorySlot === void 0 ? defaultSlotIdForKey("memory") : memorySlot },
		entries: normalizePluginEntries(config?.entries)
	};
};
const hasExplicitMemorySlot = (plugins) => Boolean(plugins?.slots && Object.prototype.hasOwnProperty.call(plugins.slots, "memory"));
const hasExplicitMemoryEntry = (plugins) => Boolean(plugins?.entries && Object.prototype.hasOwnProperty.call(plugins.entries, "memory-core"));
const hasExplicitPluginConfig = (plugins) => {
	if (!plugins) return false;
	if (typeof plugins.enabled === "boolean") return true;
	if (Array.isArray(plugins.allow) && plugins.allow.length > 0) return true;
	if (Array.isArray(plugins.deny) && plugins.deny.length > 0) return true;
	if (plugins.load?.paths && Array.isArray(plugins.load.paths) && plugins.load.paths.length > 0) return true;
	if (plugins.slots && Object.keys(plugins.slots).length > 0) return true;
	if (plugins.entries && Object.keys(plugins.entries).length > 0) return true;
	return false;
};
function applyTestPluginDefaults(cfg, env = process.env) {
	if (!env.VITEST) return cfg;
	const plugins = cfg.plugins;
	if (hasExplicitPluginConfig(plugins)) {
		if (hasExplicitMemorySlot(plugins) || hasExplicitMemoryEntry(plugins)) return cfg;
		return {
			...cfg,
			plugins: {
				...plugins,
				slots: {
					...plugins?.slots,
					memory: "none"
				}
			}
		};
	}
	return {
		...cfg,
		plugins: {
			...plugins,
			enabled: false,
			slots: {
				...plugins?.slots,
				memory: "none"
			}
		}
	};
}
function resolveEnableState(id, origin, config) {
	if (!config.enabled) return {
		enabled: false,
		reason: "plugins disabled"
	};
	if (config.deny.includes(id)) return {
		enabled: false,
		reason: "blocked by denylist"
	};
	if (config.allow.length > 0 && !config.allow.includes(id)) return {
		enabled: false,
		reason: "not in allowlist"
	};
	if (config.slots.memory === id) return { enabled: true };
	const entry = config.entries[id];
	if (entry?.enabled === true) return { enabled: true };
	if (entry?.enabled === false) return {
		enabled: false,
		reason: "disabled in config"
	};
	if (origin === "bundled" && BUNDLED_ENABLED_BY_DEFAULT.has(id)) return { enabled: true };
	if (origin === "bundled") return {
		enabled: false,
		reason: "bundled (disabled by default)"
	};
	return { enabled: true };
}
function resolveMemorySlotDecision(params) {
	if (params.kind !== "memory") return { enabled: true };
	if (params.slot === null) return {
		enabled: false,
		reason: "memory slot disabled"
	};
	if (typeof params.slot === "string") {
		if (params.slot === params.id) return {
			enabled: true,
			selected: true
		};
		return {
			enabled: false,
			reason: `memory slot set to "${params.slot}"`
		};
	}
	if (params.selectedId && params.selectedId !== params.id) return {
		enabled: false,
		reason: `memory slot already filled by "${params.selectedId}"`
	};
	return {
		enabled: true,
		selected: true
	};
}

//#endregion
//#region src/plugins/bundled-dir.ts
function resolveBundledPluginsDir() {
	const override = process.env.OPENCLAW_BUNDLED_PLUGINS_DIR?.trim();
	if (override) return override;
	try {
		const execDir = path.dirname(process.execPath);
		const sibling = path.join(execDir, "extensions");
		if (fs$1.existsSync(sibling)) return sibling;
	} catch {}
	try {
		let cursor = path.dirname(fileURLToPath(import.meta.url));
		for (let i = 0; i < 6; i += 1) {
			const candidate = path.join(cursor, "extensions");
			if (fs$1.existsSync(candidate)) return candidate;
			const parent = path.dirname(cursor);
			if (parent === cursor) break;
			cursor = parent;
		}
	} catch {}
}

//#endregion
//#region src/plugins/manifest.ts
const PLUGIN_MANIFEST_FILENAME = "openclaw.plugin.json";
const PLUGIN_MANIFEST_FILENAMES = [PLUGIN_MANIFEST_FILENAME];
function normalizeStringList(value) {
	if (!Array.isArray(value)) return [];
	return value.map((entry) => typeof entry === "string" ? entry.trim() : "").filter(Boolean);
}
function resolvePluginManifestPath(rootDir) {
	for (const filename of PLUGIN_MANIFEST_FILENAMES) {
		const candidate = path.join(rootDir, filename);
		if (fs$1.existsSync(candidate)) return candidate;
	}
	return path.join(rootDir, PLUGIN_MANIFEST_FILENAME);
}
function loadPluginManifest(rootDir) {
	const manifestPath = resolvePluginManifestPath(rootDir);
	if (!fs$1.existsSync(manifestPath)) return {
		ok: false,
		error: `plugin manifest not found: ${manifestPath}`,
		manifestPath
	};
	let raw;
	try {
		raw = JSON.parse(fs$1.readFileSync(manifestPath, "utf-8"));
	} catch (err) {
		return {
			ok: false,
			error: `failed to parse plugin manifest: ${String(err)}`,
			manifestPath
		};
	}
	if (!isRecord(raw)) return {
		ok: false,
		error: "plugin manifest must be an object",
		manifestPath
	};
	const id = typeof raw.id === "string" ? raw.id.trim() : "";
	if (!id) return {
		ok: false,
		error: "plugin manifest requires id",
		manifestPath
	};
	const configSchema = isRecord(raw.configSchema) ? raw.configSchema : null;
	if (!configSchema) return {
		ok: false,
		error: "plugin manifest requires configSchema",
		manifestPath
	};
	const kind = typeof raw.kind === "string" ? raw.kind : void 0;
	const name = typeof raw.name === "string" ? raw.name.trim() : void 0;
	const description = typeof raw.description === "string" ? raw.description.trim() : void 0;
	const version = typeof raw.version === "string" ? raw.version.trim() : void 0;
	const channels = normalizeStringList(raw.channels);
	const providers = normalizeStringList(raw.providers);
	const skills = normalizeStringList(raw.skills);
	let uiHints;
	if (isRecord(raw.uiHints)) uiHints = raw.uiHints;
	return {
		ok: true,
		manifest: {
			id,
			configSchema,
			kind,
			channels,
			providers,
			skills,
			name,
			description,
			version,
			uiHints
		},
		manifestPath
	};
}
function getPackageManifestMetadata(manifest) {
	if (!manifest) return;
	return manifest[MANIFEST_KEY];
}

//#endregion
//#region src/plugins/discovery.ts
const EXTENSION_EXTS = new Set([
	".ts",
	".js",
	".mts",
	".cts",
	".mjs",
	".cjs"
]);
function isExtensionFile(filePath) {
	const ext = path.extname(filePath);
	if (!EXTENSION_EXTS.has(ext)) return false;
	return !filePath.endsWith(".d.ts");
}
function readPackageManifest(dir) {
	const manifestPath = path.join(dir, "package.json");
	if (!fs$1.existsSync(manifestPath)) return null;
	try {
		const raw = fs$1.readFileSync(manifestPath, "utf-8");
		return JSON.parse(raw);
	} catch {
		return null;
	}
}
function resolvePackageExtensions(manifest) {
	const raw = getPackageManifestMetadata(manifest)?.extensions;
	if (!Array.isArray(raw)) return [];
	return raw.map((entry) => typeof entry === "string" ? entry.trim() : "").filter(Boolean);
}
function deriveIdHint(params) {
	const base = path.basename(params.filePath, path.extname(params.filePath));
	const rawPackageName = params.packageName?.trim();
	if (!rawPackageName) return base;
	const unscoped = rawPackageName.includes("/") ? rawPackageName.split("/").pop() ?? rawPackageName : rawPackageName;
	if (!params.hasMultipleExtensions) return unscoped;
	return `${unscoped}/${base}`;
}
function addCandidate(params) {
	const resolved = path.resolve(params.source);
	if (params.seen.has(resolved)) return;
	params.seen.add(resolved);
	const manifest = params.manifest ?? null;
	params.candidates.push({
		idHint: params.idHint,
		source: resolved,
		rootDir: path.resolve(params.rootDir),
		origin: params.origin,
		workspaceDir: params.workspaceDir,
		packageName: manifest?.name?.trim() || void 0,
		packageVersion: manifest?.version?.trim() || void 0,
		packageDescription: manifest?.description?.trim() || void 0,
		packageDir: params.packageDir,
		packageManifest: getPackageManifestMetadata(manifest ?? void 0)
	});
}
function discoverInDirectory(params) {
	if (!fs$1.existsSync(params.dir)) return;
	let entries = [];
	try {
		entries = fs$1.readdirSync(params.dir, { withFileTypes: true });
	} catch (err) {
		params.diagnostics.push({
			level: "warn",
			message: `failed to read extensions dir: ${params.dir} (${String(err)})`,
			source: params.dir
		});
		return;
	}
	for (const entry of entries) {
		const fullPath = path.join(params.dir, entry.name);
		if (entry.isFile()) {
			if (!isExtensionFile(fullPath)) continue;
			addCandidate({
				candidates: params.candidates,
				seen: params.seen,
				idHint: path.basename(entry.name, path.extname(entry.name)),
				source: fullPath,
				rootDir: path.dirname(fullPath),
				origin: params.origin,
				workspaceDir: params.workspaceDir
			});
		}
		if (!entry.isDirectory()) continue;
		const manifest = readPackageManifest(fullPath);
		const extensions = manifest ? resolvePackageExtensions(manifest) : [];
		if (extensions.length > 0) {
			for (const extPath of extensions) {
				const resolved = path.resolve(fullPath, extPath);
				addCandidate({
					candidates: params.candidates,
					seen: params.seen,
					idHint: deriveIdHint({
						filePath: resolved,
						packageName: manifest?.name,
						hasMultipleExtensions: extensions.length > 1
					}),
					source: resolved,
					rootDir: fullPath,
					origin: params.origin,
					workspaceDir: params.workspaceDir,
					manifest,
					packageDir: fullPath
				});
			}
			continue;
		}
		const indexFile = [
			"index.ts",
			"index.js",
			"index.mjs",
			"index.cjs"
		].map((candidate) => path.join(fullPath, candidate)).find((candidate) => fs$1.existsSync(candidate));
		if (indexFile && isExtensionFile(indexFile)) addCandidate({
			candidates: params.candidates,
			seen: params.seen,
			idHint: entry.name,
			source: indexFile,
			rootDir: fullPath,
			origin: params.origin,
			workspaceDir: params.workspaceDir,
			manifest,
			packageDir: fullPath
		});
	}
}
function discoverFromPath(params) {
	const resolved = resolveUserPath(params.rawPath);
	if (!fs$1.existsSync(resolved)) {
		params.diagnostics.push({
			level: "error",
			message: `plugin path not found: ${resolved}`,
			source: resolved
		});
		return;
	}
	const stat = fs$1.statSync(resolved);
	if (stat.isFile()) {
		if (!isExtensionFile(resolved)) {
			params.diagnostics.push({
				level: "error",
				message: `plugin path is not a supported file: ${resolved}`,
				source: resolved
			});
			return;
		}
		addCandidate({
			candidates: params.candidates,
			seen: params.seen,
			idHint: path.basename(resolved, path.extname(resolved)),
			source: resolved,
			rootDir: path.dirname(resolved),
			origin: params.origin,
			workspaceDir: params.workspaceDir
		});
		return;
	}
	if (stat.isDirectory()) {
		const manifest = readPackageManifest(resolved);
		const extensions = manifest ? resolvePackageExtensions(manifest) : [];
		if (extensions.length > 0) {
			for (const extPath of extensions) {
				const source = path.resolve(resolved, extPath);
				addCandidate({
					candidates: params.candidates,
					seen: params.seen,
					idHint: deriveIdHint({
						filePath: source,
						packageName: manifest?.name,
						hasMultipleExtensions: extensions.length > 1
					}),
					source,
					rootDir: resolved,
					origin: params.origin,
					workspaceDir: params.workspaceDir,
					manifest,
					packageDir: resolved
				});
			}
			return;
		}
		const indexFile = [
			"index.ts",
			"index.js",
			"index.mjs",
			"index.cjs"
		].map((candidate) => path.join(resolved, candidate)).find((candidate) => fs$1.existsSync(candidate));
		if (indexFile && isExtensionFile(indexFile)) {
			addCandidate({
				candidates: params.candidates,
				seen: params.seen,
				idHint: path.basename(resolved),
				source: indexFile,
				rootDir: resolved,
				origin: params.origin,
				workspaceDir: params.workspaceDir,
				manifest,
				packageDir: resolved
			});
			return;
		}
		discoverInDirectory({
			dir: resolved,
			origin: params.origin,
			workspaceDir: params.workspaceDir,
			candidates: params.candidates,
			diagnostics: params.diagnostics,
			seen: params.seen
		});
		return;
	}
}
function discoverOpenClawPlugins(params) {
	const candidates = [];
	const diagnostics = [];
	const seen = /* @__PURE__ */ new Set();
	const workspaceDir = params.workspaceDir?.trim();
	const extra = params.extraPaths ?? [];
	for (const extraPath of extra) {
		if (typeof extraPath !== "string") continue;
		const trimmed = extraPath.trim();
		if (!trimmed) continue;
		discoverFromPath({
			rawPath: trimmed,
			origin: "config",
			workspaceDir: workspaceDir?.trim() || void 0,
			candidates,
			diagnostics,
			seen
		});
	}
	if (workspaceDir) {
		const workspaceRoot = resolveUserPath(workspaceDir);
		const workspaceExtDirs = [path.join(workspaceRoot, ".openclaw", "extensions")];
		for (const dir of workspaceExtDirs) discoverInDirectory({
			dir,
			origin: "workspace",
			workspaceDir: workspaceRoot,
			candidates,
			diagnostics,
			seen
		});
	}
	discoverInDirectory({
		dir: path.join(resolveConfigDir(), "extensions"),
		origin: "global",
		candidates,
		diagnostics,
		seen
	});
	const bundledDir = resolveBundledPluginsDir();
	if (bundledDir) discoverInDirectory({
		dir: bundledDir,
		origin: "bundled",
		candidates,
		diagnostics,
		seen
	});
	return {
		candidates,
		diagnostics
	};
}

//#endregion
//#region src/plugins/manifest-registry.ts
const registryCache = /* @__PURE__ */ new Map();
const DEFAULT_MANIFEST_CACHE_MS = 200;
function resolveManifestCacheMs(env) {
	const raw = env.OPENCLAW_PLUGIN_MANIFEST_CACHE_MS?.trim();
	if (raw === "" || raw === "0") return 0;
	if (!raw) return DEFAULT_MANIFEST_CACHE_MS;
	const parsed = Number.parseInt(raw, 10);
	if (!Number.isFinite(parsed)) return DEFAULT_MANIFEST_CACHE_MS;
	return Math.max(0, parsed);
}
function shouldUseManifestCache(env) {
	if (env.OPENCLAW_DISABLE_PLUGIN_MANIFEST_CACHE?.trim()) return false;
	return resolveManifestCacheMs(env) > 0;
}
function buildCacheKey(params) {
	return `${params.workspaceDir ? resolveUserPath(params.workspaceDir) : ""}::${JSON.stringify(params.plugins)}`;
}
function safeStatMtimeMs(filePath) {
	try {
		return fs$1.statSync(filePath).mtimeMs;
	} catch {
		return null;
	}
}
function normalizeManifestLabel(raw) {
	const trimmed = raw?.trim();
	return trimmed ? trimmed : void 0;
}
function buildRecord(params) {
	return {
		id: params.manifest.id,
		name: normalizeManifestLabel(params.manifest.name) ?? params.candidate.packageName,
		description: normalizeManifestLabel(params.manifest.description) ?? params.candidate.packageDescription,
		version: normalizeManifestLabel(params.manifest.version) ?? params.candidate.packageVersion,
		kind: params.manifest.kind,
		channels: params.manifest.channels ?? [],
		providers: params.manifest.providers ?? [],
		skills: params.manifest.skills ?? [],
		origin: params.candidate.origin,
		workspaceDir: params.candidate.workspaceDir,
		rootDir: params.candidate.rootDir,
		source: params.candidate.source,
		manifestPath: params.manifestPath,
		schemaCacheKey: params.schemaCacheKey,
		configSchema: params.configSchema,
		configUiHints: params.manifest.uiHints
	};
}
function loadPluginManifestRegistry(params) {
	const normalized = normalizePluginsConfig((params.config ?? {}).plugins);
	const cacheKey = buildCacheKey({
		workspaceDir: params.workspaceDir,
		plugins: normalized
	});
	const env = params.env ?? process.env;
	const cacheEnabled = params.cache !== false && shouldUseManifestCache(env);
	if (cacheEnabled) {
		const cached = registryCache.get(cacheKey);
		if (cached && cached.expiresAt > Date.now()) return cached.registry;
	}
	const discovery = params.candidates ? {
		candidates: params.candidates,
		diagnostics: params.diagnostics ?? []
	} : discoverOpenClawPlugins({
		workspaceDir: params.workspaceDir,
		extraPaths: normalized.loadPaths
	});
	const diagnostics = [...discovery.diagnostics];
	const candidates = discovery.candidates;
	const records = [];
	const seenIds = /* @__PURE__ */ new Set();
	for (const candidate of candidates) {
		const manifestRes = loadPluginManifest(candidate.rootDir);
		if (!manifestRes.ok) {
			diagnostics.push({
				level: "error",
				message: manifestRes.error,
				source: manifestRes.manifestPath
			});
			continue;
		}
		const manifest = manifestRes.manifest;
		if (candidate.idHint && candidate.idHint !== manifest.id) diagnostics.push({
			level: "warn",
			pluginId: manifest.id,
			source: candidate.source,
			message: `plugin id mismatch (manifest uses "${manifest.id}", entry hints "${candidate.idHint}")`
		});
		if (seenIds.has(manifest.id)) diagnostics.push({
			level: "warn",
			pluginId: manifest.id,
			source: candidate.source,
			message: `duplicate plugin id detected; later plugin may be overridden (${candidate.source})`
		});
		else seenIds.add(manifest.id);
		const configSchema = manifest.configSchema;
		const manifestMtime = safeStatMtimeMs(manifestRes.manifestPath);
		const schemaCacheKey = manifestMtime ? `${manifestRes.manifestPath}:${manifestMtime}` : manifestRes.manifestPath;
		records.push(buildRecord({
			manifest,
			candidate,
			manifestPath: manifestRes.manifestPath,
			schemaCacheKey,
			configSchema
		}));
	}
	const registry = {
		plugins: records,
		diagnostics
	};
	if (cacheEnabled) {
		const ttl = resolveManifestCacheMs(env);
		if (ttl > 0) registryCache.set(cacheKey, {
			expiresAt: Date.now() + ttl,
			registry
		});
	}
	return registry;
}

//#endregion
//#region src/plugins/schema-validator.ts
const ajv = new AjvPkg({
	allErrors: true,
	strict: false,
	removeAdditional: false
});
const schemaCache = /* @__PURE__ */ new Map();
function formatAjvErrors(errors) {
	if (!errors || errors.length === 0) return ["invalid config"];
	return errors.map((error) => {
		return `${error.instancePath?.replace(/^\//, "").replace(/\//g, ".") || "<root>"}: ${error.message ?? "invalid"}`;
	});
}
function validateJsonSchemaValue(params) {
	let cached = schemaCache.get(params.cacheKey);
	if (!cached || cached.schema !== params.schema) {
		cached = {
			validate: ajv.compile(params.schema),
			schema: params.schema
		};
		schemaCache.set(params.cacheKey, cached);
	}
	if (cached.validate(params.value)) return { ok: true };
	return {
		ok: false,
		errors: formatAjvErrors(cached.validate.errors)
	};
}

//#endregion
//#region src/cli/parse-duration.ts
function parseDurationMs(raw, opts) {
	const trimmed = String(raw ?? "").trim().toLowerCase();
	if (!trimmed) throw new Error("invalid duration (empty)");
	const m = /^(\d+(?:\.\d+)?)(ms|s|m|h|d)?$/.exec(trimmed);
	if (!m) throw new Error(`invalid duration: ${raw}`);
	const value = Number(m[1]);
	if (!Number.isFinite(value) || value < 0) throw new Error(`invalid duration: ${raw}`);
	const unit = m[2] ?? opts?.defaultUnit ?? "ms";
	const multiplier = unit === "ms" ? 1 : unit === "s" ? 1e3 : unit === "m" ? 6e4 : unit === "h" ? 36e5 : 864e5;
	const ms = Math.round(value * multiplier);
	if (!Number.isFinite(ms)) throw new Error(`invalid duration: ${raw}`);
	return ms;
}

//#endregion
//#region src/config/zod-schema.sensitive.ts
const sensitive = z.registry();

//#endregion
//#region src/config/zod-schema.core.ts
const ModelApiSchema = z.union([
	z.literal("openai-completions"),
	z.literal("openai-responses"),
	z.literal("anthropic-messages"),
	z.literal("google-generative-ai"),
	z.literal("github-copilot"),
	z.literal("bedrock-converse-stream"),
	z.literal("ollama")
]);
const ModelCompatSchema = z.object({
	supportsStore: z.boolean().optional(),
	supportsDeveloperRole: z.boolean().optional(),
	supportsReasoningEffort: z.boolean().optional(),
	supportsUsageInStreaming: z.boolean().optional(),
	supportsStrictMode: z.boolean().optional(),
	maxTokensField: z.union([z.literal("max_completion_tokens"), z.literal("max_tokens")]).optional(),
	thinkingFormat: z.union([
		z.literal("openai"),
		z.literal("zai"),
		z.literal("qwen")
	]).optional(),
	requiresToolResultName: z.boolean().optional(),
	requiresAssistantAfterToolResult: z.boolean().optional(),
	requiresThinkingAsText: z.boolean().optional(),
	requiresMistralToolIds: z.boolean().optional()
}).strict().optional();
const ModelDefinitionSchema = z.object({
	id: z.string().min(1),
	name: z.string().min(1),
	api: ModelApiSchema.optional(),
	reasoning: z.boolean().optional(),
	input: z.array(z.union([z.literal("text"), z.literal("image")])).optional(),
	cost: z.object({
		input: z.number().optional(),
		output: z.number().optional(),
		cacheRead: z.number().optional(),
		cacheWrite: z.number().optional()
	}).strict().optional(),
	contextWindow: z.number().positive().optional(),
	maxTokens: z.number().positive().optional(),
	headers: z.record(z.string(), z.string()).optional(),
	compat: ModelCompatSchema
}).strict();
const ModelProviderSchema = z.object({
	baseUrl: z.string().min(1),
	apiKey: z.string().optional().register(sensitive),
	auth: z.union([
		z.literal("api-key"),
		z.literal("aws-sdk"),
		z.literal("oauth"),
		z.literal("token")
	]).optional(),
	api: ModelApiSchema.optional(),
	headers: z.record(z.string(), z.string()).optional(),
	authHeader: z.boolean().optional(),
	models: z.array(ModelDefinitionSchema)
}).strict();
const BedrockDiscoverySchema = z.object({
	enabled: z.boolean().optional(),
	region: z.string().optional(),
	providerFilter: z.array(z.string()).optional(),
	refreshInterval: z.number().int().nonnegative().optional(),
	defaultContextWindow: z.number().int().positive().optional(),
	defaultMaxTokens: z.number().int().positive().optional()
}).strict().optional();
const ModelsConfigSchema = z.object({
	mode: z.union([z.literal("merge"), z.literal("replace")]).optional(),
	providers: z.record(z.string(), ModelProviderSchema).optional(),
	bedrockDiscovery: BedrockDiscoverySchema
}).strict().optional();
const GroupChatSchema = z.object({
	mentionPatterns: z.array(z.string()).optional(),
	historyLimit: z.number().int().positive().optional()
}).strict().optional();
const DmConfigSchema = z.object({ historyLimit: z.number().int().min(0).optional() }).strict();
const IdentitySchema = z.object({
	name: z.string().optional(),
	theme: z.string().optional(),
	emoji: z.string().optional(),
	avatar: z.string().optional()
}).strict().optional();
const QueueModeSchema = z.union([
	z.literal("steer"),
	z.literal("followup"),
	z.literal("collect"),
	z.literal("steer-backlog"),
	z.literal("steer+backlog"),
	z.literal("queue"),
	z.literal("interrupt")
]);
const QueueDropSchema = z.union([
	z.literal("old"),
	z.literal("new"),
	z.literal("summarize")
]);
const ReplyToModeSchema = z.union([
	z.literal("off"),
	z.literal("first"),
	z.literal("all")
]);
const GroupPolicySchema = z.enum([
	"open",
	"disabled",
	"allowlist"
]);
const DmPolicySchema = z.enum([
	"pairing",
	"allowlist",
	"open",
	"disabled"
]);
const BlockStreamingCoalesceSchema = z.object({
	minChars: z.number().int().positive().optional(),
	maxChars: z.number().int().positive().optional(),
	idleMs: z.number().int().nonnegative().optional()
}).strict();
const BlockStreamingChunkSchema = z.object({
	minChars: z.number().int().positive().optional(),
	maxChars: z.number().int().positive().optional(),
	breakPreference: z.union([
		z.literal("paragraph"),
		z.literal("newline"),
		z.literal("sentence")
	]).optional()
}).strict();
const MarkdownTableModeSchema = z.enum([
	"off",
	"bullets",
	"code"
]);
const MarkdownConfigSchema = z.object({ tables: MarkdownTableModeSchema.optional() }).strict().optional();
const TtsProviderSchema = z.enum([
	"elevenlabs",
	"openai",
	"edge"
]);
const TtsModeSchema = z.enum(["final", "all"]);
const TtsAutoSchema = z.enum([
	"off",
	"always",
	"inbound",
	"tagged"
]);
const TtsConfigSchema = z.object({
	auto: TtsAutoSchema.optional(),
	enabled: z.boolean().optional(),
	mode: TtsModeSchema.optional(),
	provider: TtsProviderSchema.optional(),
	summaryModel: z.string().optional(),
	modelOverrides: z.object({
		enabled: z.boolean().optional(),
		allowText: z.boolean().optional(),
		allowProvider: z.boolean().optional(),
		allowVoice: z.boolean().optional(),
		allowModelId: z.boolean().optional(),
		allowVoiceSettings: z.boolean().optional(),
		allowNormalization: z.boolean().optional(),
		allowSeed: z.boolean().optional()
	}).strict().optional(),
	elevenlabs: z.object({
		apiKey: z.string().optional().register(sensitive),
		baseUrl: z.string().optional(),
		voiceId: z.string().optional(),
		modelId: z.string().optional(),
		seed: z.number().int().min(0).max(4294967295).optional(),
		applyTextNormalization: z.enum([
			"auto",
			"on",
			"off"
		]).optional(),
		languageCode: z.string().optional(),
		voiceSettings: z.object({
			stability: z.number().min(0).max(1).optional(),
			similarityBoost: z.number().min(0).max(1).optional(),
			style: z.number().min(0).max(1).optional(),
			useSpeakerBoost: z.boolean().optional(),
			speed: z.number().min(.5).max(2).optional()
		}).strict().optional()
	}).strict().optional(),
	openai: z.object({
		apiKey: z.string().optional().register(sensitive),
		model: z.string().optional(),
		voice: z.string().optional()
	}).strict().optional(),
	edge: z.object({
		enabled: z.boolean().optional(),
		voice: z.string().optional(),
		lang: z.string().optional(),
		outputFormat: z.string().optional(),
		pitch: z.string().optional(),
		rate: z.string().optional(),
		volume: z.string().optional(),
		saveSubtitles: z.boolean().optional(),
		proxy: z.string().optional(),
		timeoutMs: z.number().int().min(1e3).max(12e4).optional()
	}).strict().optional(),
	prefsPath: z.string().optional(),
	maxTextLength: z.number().int().min(1).optional(),
	timeoutMs: z.number().int().min(1e3).max(12e4).optional()
}).strict().optional();
const HumanDelaySchema = z.object({
	mode: z.union([
		z.literal("off"),
		z.literal("natural"),
		z.literal("custom")
	]).optional(),
	minMs: z.number().int().nonnegative().optional(),
	maxMs: z.number().int().nonnegative().optional()
}).strict();
const CliBackendSchema = z.object({
	command: z.string(),
	args: z.array(z.string()).optional(),
	output: z.union([
		z.literal("json"),
		z.literal("text"),
		z.literal("jsonl")
	]).optional(),
	resumeOutput: z.union([
		z.literal("json"),
		z.literal("text"),
		z.literal("jsonl")
	]).optional(),
	input: z.union([z.literal("arg"), z.literal("stdin")]).optional(),
	maxPromptArgChars: z.number().int().positive().optional(),
	env: z.record(z.string(), z.string()).optional(),
	clearEnv: z.array(z.string()).optional(),
	modelArg: z.string().optional(),
	modelAliases: z.record(z.string(), z.string()).optional(),
	sessionArg: z.string().optional(),
	sessionArgs: z.array(z.string()).optional(),
	resumeArgs: z.array(z.string()).optional(),
	sessionMode: z.union([
		z.literal("always"),
		z.literal("existing"),
		z.literal("none")
	]).optional(),
	sessionIdFields: z.array(z.string()).optional(),
	systemPromptArg: z.string().optional(),
	systemPromptMode: z.union([z.literal("append"), z.literal("replace")]).optional(),
	systemPromptWhen: z.union([
		z.literal("first"),
		z.literal("always"),
		z.literal("never")
	]).optional(),
	imageArg: z.string().optional(),
	imageMode: z.union([z.literal("repeat"), z.literal("list")]).optional(),
	serialize: z.boolean().optional()
}).strict();
const normalizeAllowFrom = (values) => (values ?? []).map((v) => String(v).trim()).filter(Boolean);
const requireOpenAllowFrom = (params) => {
	if (params.policy !== "open") return;
	if (normalizeAllowFrom(params.allowFrom).includes("*")) return;
	params.ctx.addIssue({
		code: z.ZodIssueCode.custom,
		path: params.path,
		message: params.message
	});
};
const MSTeamsReplyStyleSchema = z.enum(["thread", "top-level"]);
const RetryConfigSchema = z.object({
	attempts: z.number().int().min(1).optional(),
	minDelayMs: z.number().int().min(0).optional(),
	maxDelayMs: z.number().int().min(0).optional(),
	jitter: z.number().min(0).max(1).optional()
}).strict().optional();
const QueueModeBySurfaceSchema = z.object({
	whatsapp: QueueModeSchema.optional(),
	telegram: QueueModeSchema.optional(),
	discord: QueueModeSchema.optional(),
	irc: QueueModeSchema.optional(),
	slack: QueueModeSchema.optional(),
	mattermost: QueueModeSchema.optional(),
	signal: QueueModeSchema.optional(),
	imessage: QueueModeSchema.optional(),
	msteams: QueueModeSchema.optional(),
	webchat: QueueModeSchema.optional()
}).strict().optional();
const DebounceMsBySurfaceSchema = z.record(z.string(), z.number().int().nonnegative()).optional();
const QueueSchema = z.object({
	mode: QueueModeSchema.optional(),
	byChannel: QueueModeBySurfaceSchema,
	debounceMs: z.number().int().nonnegative().optional(),
	debounceMsByChannel: DebounceMsBySurfaceSchema,
	cap: z.number().int().positive().optional(),
	drop: QueueDropSchema.optional()
}).strict().optional();
const InboundDebounceSchema = z.object({
	debounceMs: z.number().int().nonnegative().optional(),
	byChannel: DebounceMsBySurfaceSchema
}).strict().optional();
const TranscribeAudioSchema = z.object({
	command: z.array(z.string()).superRefine((value, ctx) => {
		const executable = value[0];
		if (!isSafeExecutableValue(executable)) ctx.addIssue({
			code: z.ZodIssueCode.custom,
			path: [0],
			message: "expected safe executable name or path"
		});
	}),
	timeoutSeconds: z.number().int().positive().optional()
}).strict().optional();
const HexColorSchema = z.string().regex(/^#?[0-9a-fA-F]{6}$/, "expected hex color (RRGGBB)");
const ExecutableTokenSchema = z.string().refine(isSafeExecutableValue, "expected safe executable name or path");
const MediaUnderstandingScopeSchema = z.object({
	default: z.union([z.literal("allow"), z.literal("deny")]).optional(),
	rules: z.array(z.object({
		action: z.union([z.literal("allow"), z.literal("deny")]),
		match: z.object({
			channel: z.string().optional(),
			chatType: z.union([
				z.literal("direct"),
				z.literal("group"),
				z.literal("channel"),
				z.literal("dm")
			]).optional(),
			keyPrefix: z.string().optional()
		}).strict().optional()
	}).strict()).optional()
}).strict().optional();
const MediaUnderstandingCapabilitiesSchema = z.array(z.union([
	z.literal("image"),
	z.literal("audio"),
	z.literal("video")
])).optional();
const MediaUnderstandingAttachmentsSchema = z.object({
	mode: z.union([z.literal("first"), z.literal("all")]).optional(),
	maxAttachments: z.number().int().positive().optional(),
	prefer: z.union([
		z.literal("first"),
		z.literal("last"),
		z.literal("path"),
		z.literal("url")
	]).optional()
}).strict().optional();
const DeepgramAudioSchema = z.object({
	detectLanguage: z.boolean().optional(),
	punctuate: z.boolean().optional(),
	smartFormat: z.boolean().optional()
}).strict().optional();
const ProviderOptionValueSchema = z.union([
	z.string(),
	z.number(),
	z.boolean()
]);
const ProviderOptionsSchema = z.record(z.string(), z.record(z.string(), ProviderOptionValueSchema)).optional();
const MediaUnderstandingModelSchema = z.object({
	provider: z.string().optional(),
	model: z.string().optional(),
	capabilities: MediaUnderstandingCapabilitiesSchema,
	type: z.union([z.literal("provider"), z.literal("cli")]).optional(),
	command: z.string().optional(),
	args: z.array(z.string()).optional(),
	prompt: z.string().optional(),
	maxChars: z.number().int().positive().optional(),
	maxBytes: z.number().int().positive().optional(),
	timeoutSeconds: z.number().int().positive().optional(),
	language: z.string().optional(),
	providerOptions: ProviderOptionsSchema,
	deepgram: DeepgramAudioSchema,
	baseUrl: z.string().optional(),
	headers: z.record(z.string(), z.string()).optional(),
	profile: z.string().optional(),
	preferredProfile: z.string().optional()
}).strict().optional();
const ToolsMediaUnderstandingSchema = z.object({
	enabled: z.boolean().optional(),
	scope: MediaUnderstandingScopeSchema,
	maxBytes: z.number().int().positive().optional(),
	maxChars: z.number().int().positive().optional(),
	prompt: z.string().optional(),
	timeoutSeconds: z.number().int().positive().optional(),
	language: z.string().optional(),
	providerOptions: ProviderOptionsSchema,
	deepgram: DeepgramAudioSchema,
	baseUrl: z.string().optional(),
	headers: z.record(z.string(), z.string()).optional(),
	attachments: MediaUnderstandingAttachmentsSchema,
	models: z.array(MediaUnderstandingModelSchema).optional()
}).strict().optional();
const ToolsMediaSchema = z.object({
	models: z.array(MediaUnderstandingModelSchema).optional(),
	concurrency: z.number().int().positive().optional(),
	image: ToolsMediaUnderstandingSchema.optional(),
	audio: ToolsMediaUnderstandingSchema.optional(),
	video: ToolsMediaUnderstandingSchema.optional()
}).strict().optional();
const LinkModelSchema = z.object({
	type: z.literal("cli").optional(),
	command: z.string().min(1),
	args: z.array(z.string()).optional(),
	timeoutSeconds: z.number().int().positive().optional()
}).strict();
const ToolsLinksSchema = z.object({
	enabled: z.boolean().optional(),
	scope: MediaUnderstandingScopeSchema,
	maxLinks: z.number().int().positive().optional(),
	timeoutSeconds: z.number().int().positive().optional(),
	models: z.array(LinkModelSchema).optional()
}).strict().optional();
const NativeCommandsSettingSchema = z.union([z.boolean(), z.literal("auto")]);
const ProviderCommandsSchema = z.object({
	native: NativeCommandsSettingSchema.optional(),
	nativeSkills: NativeCommandsSettingSchema.optional()
}).strict().optional();

//#endregion
//#region src/config/zod-schema.agent-runtime.ts
const HeartbeatSchema = z.object({
	every: z.string().optional(),
	activeHours: z.object({
		start: z.string().optional(),
		end: z.string().optional(),
		timezone: z.string().optional()
	}).strict().optional(),
	model: z.string().optional(),
	session: z.string().optional(),
	includeReasoning: z.boolean().optional(),
	target: z.string().optional(),
	to: z.string().optional(),
	accountId: z.string().optional(),
	prompt: z.string().optional(),
	ackMaxChars: z.number().int().nonnegative().optional()
}).strict().superRefine((val, ctx) => {
	if (!val.every) return;
	try {
		parseDurationMs(val.every, { defaultUnit: "m" });
	} catch {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			path: ["every"],
			message: "invalid duration (use ms, s, m, h)"
		});
	}
	const active = val.activeHours;
	if (!active) return;
	const timePattern = /^([01]\d|2[0-3]|24):([0-5]\d)$/;
	const validateTime = (raw, opts, path) => {
		if (!raw) return;
		if (!timePattern.test(raw)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["activeHours", path],
				message: "invalid time (use \"HH:MM\" 24h format)"
			});
			return;
		}
		const [hourStr, minuteStr] = raw.split(":");
		const hour = Number(hourStr);
		if (hour === 24 && Number(minuteStr) !== 0) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["activeHours", path],
				message: "invalid time (24:00 is the only allowed 24:xx value)"
			});
			return;
		}
		if (hour === 24 && !opts.allow24) ctx.addIssue({
			code: z.ZodIssueCode.custom,
			path: ["activeHours", path],
			message: "invalid time (start cannot be 24:00)"
		});
	};
	validateTime(active.start, { allow24: false }, "start");
	validateTime(active.end, { allow24: true }, "end");
}).optional();
const SandboxDockerSchema = z.object({
	image: z.string().optional(),
	containerPrefix: z.string().optional(),
	workdir: z.string().optional(),
	readOnlyRoot: z.boolean().optional(),
	tmpfs: z.array(z.string()).optional(),
	network: z.string().optional(),
	user: z.string().optional(),
	capDrop: z.array(z.string()).optional(),
	env: z.record(z.string(), z.string()).optional(),
	setupCommand: z.string().optional(),
	pidsLimit: z.number().int().positive().optional(),
	memory: z.union([z.string(), z.number()]).optional(),
	memorySwap: z.union([z.string(), z.number()]).optional(),
	cpus: z.number().positive().optional(),
	ulimits: z.record(z.string(), z.union([
		z.string(),
		z.number(),
		z.object({
			soft: z.number().int().nonnegative().optional(),
			hard: z.number().int().nonnegative().optional()
		}).strict()
	])).optional(),
	seccompProfile: z.string().optional(),
	apparmorProfile: z.string().optional(),
	dns: z.array(z.string()).optional(),
	extraHosts: z.array(z.string()).optional(),
	binds: z.array(z.string()).optional()
}).strict().optional();
const SandboxBrowserSchema = z.object({
	enabled: z.boolean().optional(),
	image: z.string().optional(),
	containerPrefix: z.string().optional(),
	cdpPort: z.number().int().positive().optional(),
	vncPort: z.number().int().positive().optional(),
	noVncPort: z.number().int().positive().optional(),
	headless: z.boolean().optional(),
	enableNoVnc: z.boolean().optional(),
	allowHostControl: z.boolean().optional(),
	autoStart: z.boolean().optional(),
	autoStartTimeoutMs: z.number().int().positive().optional()
}).strict().optional();
const SandboxPruneSchema = z.object({
	idleHours: z.number().int().nonnegative().optional(),
	maxAgeDays: z.number().int().nonnegative().optional()
}).strict().optional();
const ToolPolicyBaseSchema = z.object({
	allow: z.array(z.string()).optional(),
	alsoAllow: z.array(z.string()).optional(),
	deny: z.array(z.string()).optional()
}).strict();
const ToolPolicySchema = ToolPolicyBaseSchema.superRefine((value, ctx) => {
	if (value.allow && value.allow.length > 0 && value.alsoAllow && value.alsoAllow.length > 0) ctx.addIssue({
		code: z.ZodIssueCode.custom,
		message: "tools policy cannot set both allow and alsoAllow in the same scope (merge alsoAllow into allow, or remove allow and use profile + alsoAllow)"
	});
}).optional();
const ToolsWebSearchSchema = z.object({
	enabled: z.boolean().optional(),
	provider: z.union([
		z.literal("brave"),
		z.literal("perplexity"),
		z.literal("grok")
	]).optional(),
	apiKey: z.string().optional().register(sensitive),
	maxResults: z.number().int().positive().optional(),
	timeoutSeconds: z.number().int().positive().optional(),
	cacheTtlMinutes: z.number().nonnegative().optional(),
	perplexity: z.object({
		apiKey: z.string().optional().register(sensitive),
		baseUrl: z.string().optional(),
		model: z.string().optional()
	}).strict().optional(),
	grok: z.object({
		apiKey: z.string().optional().register(sensitive),
		model: z.string().optional(),
		inlineCitations: z.boolean().optional()
	}).strict().optional()
}).strict().optional();
const ToolsWebFetchSchema = z.object({
	enabled: z.boolean().optional(),
	maxChars: z.number().int().positive().optional(),
	maxCharsCap: z.number().int().positive().optional(),
	timeoutSeconds: z.number().int().positive().optional(),
	cacheTtlMinutes: z.number().nonnegative().optional(),
	maxRedirects: z.number().int().nonnegative().optional(),
	userAgent: z.string().optional()
}).strict().optional();
const ToolsWebSchema = z.object({
	search: ToolsWebSearchSchema,
	fetch: ToolsWebFetchSchema
}).strict().optional();
const ToolProfileSchema = z.union([
	z.literal("minimal"),
	z.literal("coding"),
	z.literal("messaging"),
	z.literal("full")
]).optional();
const ToolPolicyWithProfileSchema = z.object({
	allow: z.array(z.string()).optional(),
	alsoAllow: z.array(z.string()).optional(),
	deny: z.array(z.string()).optional(),
	profile: ToolProfileSchema
}).strict().superRefine((value, ctx) => {
	if (value.allow && value.allow.length > 0 && value.alsoAllow && value.alsoAllow.length > 0) ctx.addIssue({
		code: z.ZodIssueCode.custom,
		message: "tools.byProvider policy cannot set both allow and alsoAllow in the same scope (merge alsoAllow into allow, or remove allow and use profile + alsoAllow)"
	});
});
const ElevatedAllowFromSchema = z.record(z.string(), z.array(z.union([z.string(), z.number()]))).optional();
const AgentSandboxSchema = z.object({
	mode: z.union([
		z.literal("off"),
		z.literal("non-main"),
		z.literal("all")
	]).optional(),
	workspaceAccess: z.union([
		z.literal("none"),
		z.literal("ro"),
		z.literal("rw")
	]).optional(),
	sessionToolsVisibility: z.union([z.literal("spawned"), z.literal("all")]).optional(),
	scope: z.union([
		z.literal("session"),
		z.literal("agent"),
		z.literal("shared")
	]).optional(),
	perSession: z.boolean().optional(),
	workspaceRoot: z.string().optional(),
	docker: SandboxDockerSchema,
	browser: SandboxBrowserSchema,
	prune: SandboxPruneSchema
}).strict().optional();
const AgentToolsSchema = z.object({
	profile: ToolProfileSchema,
	allow: z.array(z.string()).optional(),
	alsoAllow: z.array(z.string()).optional(),
	deny: z.array(z.string()).optional(),
	byProvider: z.record(z.string(), ToolPolicyWithProfileSchema).optional(),
	elevated: z.object({
		enabled: z.boolean().optional(),
		allowFrom: ElevatedAllowFromSchema
	}).strict().optional(),
	exec: z.object({
		host: z.enum([
			"sandbox",
			"gateway",
			"node"
		]).optional(),
		security: z.enum([
			"deny",
			"allowlist",
			"full"
		]).optional(),
		ask: z.enum([
			"off",
			"on-miss",
			"always"
		]).optional(),
		node: z.string().optional(),
		pathPrepend: z.array(z.string()).optional(),
		safeBins: z.array(z.string()).optional(),
		backgroundMs: z.number().int().positive().optional(),
		timeoutSec: z.number().int().positive().optional(),
		approvalRunningNoticeMs: z.number().int().nonnegative().optional(),
		cleanupMs: z.number().int().positive().optional(),
		notifyOnExit: z.boolean().optional(),
		applyPatch: z.object({
			enabled: z.boolean().optional(),
			allowModels: z.array(z.string()).optional()
		}).strict().optional()
	}).strict().optional(),
	sandbox: z.object({ tools: ToolPolicySchema }).strict().optional()
}).strict().superRefine((value, ctx) => {
	if (value.allow && value.allow.length > 0 && value.alsoAllow && value.alsoAllow.length > 0) ctx.addIssue({
		code: z.ZodIssueCode.custom,
		message: "agent tools cannot set both allow and alsoAllow in the same scope (merge alsoAllow into allow, or remove allow and use profile + alsoAllow)"
	});
}).optional();
const MemorySearchSchema = z.object({
	enabled: z.boolean().optional(),
	sources: z.array(z.union([z.literal("memory"), z.literal("sessions")])).optional(),
	extraPaths: z.array(z.string()).optional(),
	experimental: z.object({ sessionMemory: z.boolean().optional() }).strict().optional(),
	provider: z.union([
		z.literal("openai"),
		z.literal("local"),
		z.literal("gemini"),
		z.literal("voyage")
	]).optional(),
	remote: z.object({
		baseUrl: z.string().optional(),
		apiKey: z.string().optional().register(sensitive),
		headers: z.record(z.string(), z.string()).optional(),
		batch: z.object({
			enabled: z.boolean().optional(),
			wait: z.boolean().optional(),
			concurrency: z.number().int().positive().optional(),
			pollIntervalMs: z.number().int().nonnegative().optional(),
			timeoutMinutes: z.number().int().positive().optional()
		}).strict().optional()
	}).strict().optional(),
	fallback: z.union([
		z.literal("openai"),
		z.literal("gemini"),
		z.literal("local"),
		z.literal("voyage"),
		z.literal("none")
	]).optional(),
	model: z.string().optional(),
	local: z.object({
		modelPath: z.string().optional(),
		modelCacheDir: z.string().optional()
	}).strict().optional(),
	store: z.object({
		driver: z.literal("sqlite").optional(),
		path: z.string().optional(),
		vector: z.object({
			enabled: z.boolean().optional(),
			extensionPath: z.string().optional()
		}).strict().optional()
	}).strict().optional(),
	chunking: z.object({
		tokens: z.number().int().positive().optional(),
		overlap: z.number().int().nonnegative().optional()
	}).strict().optional(),
	sync: z.object({
		onSessionStart: z.boolean().optional(),
		onSearch: z.boolean().optional(),
		watch: z.boolean().optional(),
		watchDebounceMs: z.number().int().nonnegative().optional(),
		intervalMinutes: z.number().int().nonnegative().optional(),
		sessions: z.object({
			deltaBytes: z.number().int().nonnegative().optional(),
			deltaMessages: z.number().int().nonnegative().optional()
		}).strict().optional()
	}).strict().optional(),
	query: z.object({
		maxResults: z.number().int().positive().optional(),
		minScore: z.number().min(0).max(1).optional(),
		hybrid: z.object({
			enabled: z.boolean().optional(),
			vectorWeight: z.number().min(0).max(1).optional(),
			textWeight: z.number().min(0).max(1).optional(),
			candidateMultiplier: z.number().int().positive().optional()
		}).strict().optional()
	}).strict().optional(),
	cache: z.object({
		enabled: z.boolean().optional(),
		maxEntries: z.number().int().positive().optional()
	}).strict().optional()
}).strict().optional();
const AgentModelSchema = z.union([z.string(), z.object({
	primary: z.string().optional(),
	fallbacks: z.array(z.string()).optional()
}).strict()]);
const AgentEntrySchema = z.object({
	id: z.string(),
	default: z.boolean().optional(),
	name: z.string().optional(),
	workspace: z.string().optional(),
	agentDir: z.string().optional(),
	model: AgentModelSchema.optional(),
	skills: z.array(z.string()).optional(),
	memorySearch: MemorySearchSchema,
	humanDelay: HumanDelaySchema.optional(),
	heartbeat: HeartbeatSchema,
	identity: IdentitySchema,
	groupChat: GroupChatSchema,
	subagents: z.object({
		allowAgents: z.array(z.string()).optional(),
		model: z.union([z.string(), z.object({
			primary: z.string().optional(),
			fallbacks: z.array(z.string()).optional()
		}).strict()]).optional(),
		thinking: z.string().optional()
	}).strict().optional(),
	sandbox: AgentSandboxSchema,
	tools: AgentToolsSchema
}).strict();
const ToolsSchema = z.object({
	profile: ToolProfileSchema,
	allow: z.array(z.string()).optional(),
	alsoAllow: z.array(z.string()).optional(),
	deny: z.array(z.string()).optional(),
	byProvider: z.record(z.string(), ToolPolicyWithProfileSchema).optional(),
	web: ToolsWebSchema,
	media: ToolsMediaSchema,
	links: ToolsLinksSchema,
	message: z.object({
		allowCrossContextSend: z.boolean().optional(),
		crossContext: z.object({
			allowWithinProvider: z.boolean().optional(),
			allowAcrossProviders: z.boolean().optional(),
			marker: z.object({
				enabled: z.boolean().optional(),
				prefix: z.string().optional(),
				suffix: z.string().optional()
			}).strict().optional()
		}).strict().optional(),
		broadcast: z.object({ enabled: z.boolean().optional() }).strict().optional()
	}).strict().optional(),
	agentToAgent: z.object({
		enabled: z.boolean().optional(),
		allow: z.array(z.string()).optional()
	}).strict().optional(),
	elevated: z.object({
		enabled: z.boolean().optional(),
		allowFrom: ElevatedAllowFromSchema
	}).strict().optional(),
	exec: z.object({
		host: z.enum([
			"sandbox",
			"gateway",
			"node"
		]).optional(),
		security: z.enum([
			"deny",
			"allowlist",
			"full"
		]).optional(),
		ask: z.enum([
			"off",
			"on-miss",
			"always"
		]).optional(),
		node: z.string().optional(),
		pathPrepend: z.array(z.string()).optional(),
		safeBins: z.array(z.string()).optional(),
		backgroundMs: z.number().int().positive().optional(),
		timeoutSec: z.number().int().positive().optional(),
		cleanupMs: z.number().int().positive().optional(),
		notifyOnExit: z.boolean().optional(),
		applyPatch: z.object({
			enabled: z.boolean().optional(),
			allowModels: z.array(z.string()).optional()
		}).strict().optional()
	}).strict().optional(),
	subagents: z.object({ tools: ToolPolicySchema }).strict().optional(),
	sandbox: z.object({ tools: ToolPolicySchema }).strict().optional()
}).strict().superRefine((value, ctx) => {
	if (value.allow && value.allow.length > 0 && value.alsoAllow && value.alsoAllow.length > 0) ctx.addIssue({
		code: z.ZodIssueCode.custom,
		message: "tools cannot set both allow and alsoAllow in the same scope (merge alsoAllow into allow, or remove allow and use profile + alsoAllow)"
	});
}).optional();

//#endregion
//#region src/config/zod-schema.agent-defaults.ts
const AgentDefaultsSchema = z.object({
	model: z.object({
		primary: z.string().optional(),
		fallbacks: z.array(z.string()).optional()
	}).strict().optional(),
	imageModel: z.object({
		primary: z.string().optional(),
		fallbacks: z.array(z.string()).optional()
	}).strict().optional(),
	models: z.record(z.string(), z.object({
		alias: z.string().optional(),
		params: z.record(z.string(), z.unknown()).optional(),
		streaming: z.boolean().optional()
	}).strict()).optional(),
	workspace: z.string().optional(),
	repoRoot: z.string().optional(),
	skipBootstrap: z.boolean().optional(),
	bootstrapMaxChars: z.number().int().positive().optional(),
	userTimezone: z.string().optional(),
	timeFormat: z.union([
		z.literal("auto"),
		z.literal("12"),
		z.literal("24")
	]).optional(),
	envelopeTimezone: z.string().optional(),
	envelopeTimestamp: z.union([z.literal("on"), z.literal("off")]).optional(),
	envelopeElapsed: z.union([z.literal("on"), z.literal("off")]).optional(),
	contextTokens: z.number().int().positive().optional(),
	cliBackends: z.record(z.string(), CliBackendSchema).optional(),
	memorySearch: MemorySearchSchema,
	contextPruning: z.object({
		mode: z.union([z.literal("off"), z.literal("cache-ttl")]).optional(),
		ttl: z.string().optional(),
		keepLastAssistants: z.number().int().nonnegative().optional(),
		softTrimRatio: z.number().min(0).max(1).optional(),
		hardClearRatio: z.number().min(0).max(1).optional(),
		minPrunableToolChars: z.number().int().nonnegative().optional(),
		tools: z.object({
			allow: z.array(z.string()).optional(),
			deny: z.array(z.string()).optional()
		}).strict().optional(),
		softTrim: z.object({
			maxChars: z.number().int().nonnegative().optional(),
			headChars: z.number().int().nonnegative().optional(),
			tailChars: z.number().int().nonnegative().optional()
		}).strict().optional(),
		hardClear: z.object({
			enabled: z.boolean().optional(),
			placeholder: z.string().optional()
		}).strict().optional()
	}).strict().optional(),
	compaction: z.object({
		mode: z.union([z.literal("default"), z.literal("safeguard")]).optional(),
		reserveTokensFloor: z.number().int().nonnegative().optional(),
		maxHistoryShare: z.number().min(.1).max(.9).optional(),
		memoryFlush: z.object({
			enabled: z.boolean().optional(),
			softThresholdTokens: z.number().int().nonnegative().optional(),
			prompt: z.string().optional(),
			systemPrompt: z.string().optional()
		}).strict().optional()
	}).strict().optional(),
	thinkingDefault: z.union([
		z.literal("off"),
		z.literal("minimal"),
		z.literal("low"),
		z.literal("medium"),
		z.literal("high"),
		z.literal("xhigh")
	]).optional(),
	verboseDefault: z.union([
		z.literal("off"),
		z.literal("on"),
		z.literal("full")
	]).optional(),
	elevatedDefault: z.union([
		z.literal("off"),
		z.literal("on"),
		z.literal("ask"),
		z.literal("full")
	]).optional(),
	blockStreamingDefault: z.union([z.literal("off"), z.literal("on")]).optional(),
	blockStreamingBreak: z.union([z.literal("text_end"), z.literal("message_end")]).optional(),
	blockStreamingChunk: BlockStreamingChunkSchema.optional(),
	blockStreamingCoalesce: BlockStreamingCoalesceSchema.optional(),
	humanDelay: HumanDelaySchema.optional(),
	timeoutSeconds: z.number().int().positive().optional(),
	mediaMaxMb: z.number().positive().optional(),
	typingIntervalSeconds: z.number().int().positive().optional(),
	typingMode: z.union([
		z.literal("never"),
		z.literal("instant"),
		z.literal("thinking"),
		z.literal("message")
	]).optional(),
	heartbeat: HeartbeatSchema,
	maxConcurrent: z.number().int().positive().optional(),
	subagents: z.object({
		maxConcurrent: z.number().int().positive().optional(),
		archiveAfterMinutes: z.number().int().positive().optional(),
		model: z.union([z.string(), z.object({
			primary: z.string().optional(),
			fallbacks: z.array(z.string()).optional()
		}).strict()]).optional(),
		thinking: z.string().optional()
	}).strict().optional(),
	sandbox: z.object({
		mode: z.union([
			z.literal("off"),
			z.literal("non-main"),
			z.literal("all")
		]).optional(),
		workspaceAccess: z.union([
			z.literal("none"),
			z.literal("ro"),
			z.literal("rw")
		]).optional(),
		sessionToolsVisibility: z.union([z.literal("spawned"), z.literal("all")]).optional(),
		scope: z.union([
			z.literal("session"),
			z.literal("agent"),
			z.literal("shared")
		]).optional(),
		perSession: z.boolean().optional(),
		workspaceRoot: z.string().optional(),
		docker: SandboxDockerSchema,
		browser: SandboxBrowserSchema,
		prune: SandboxPruneSchema
	}).strict().optional()
}).strict().optional();

//#endregion
//#region src/config/zod-schema.agents.ts
const AgentsSchema = z.object({
	defaults: z.lazy(() => AgentDefaultsSchema).optional(),
	list: z.array(AgentEntrySchema).optional()
}).strict().optional();
const BindingsSchema = z.array(z.object({
	agentId: z.string(),
	match: z.object({
		channel: z.string(),
		accountId: z.string().optional(),
		peer: z.object({
			kind: z.union([
				z.literal("direct"),
				z.literal("group"),
				z.literal("channel"),
				z.literal("dm")
			]),
			id: z.string()
		}).strict().optional(),
		guildId: z.string().optional(),
		teamId: z.string().optional(),
		roles: z.array(z.string()).optional()
	}).strict()
}).strict()).optional();
const BroadcastStrategySchema = z.enum(["parallel", "sequential"]);
const BroadcastSchema = z.object({ strategy: BroadcastStrategySchema.optional() }).catchall(z.array(z.string())).optional();
const AudioSchema = z.object({ transcription: TranscribeAudioSchema }).strict().optional();

//#endregion
//#region src/config/zod-schema.approvals.ts
const ExecApprovalForwardTargetSchema = z.object({
	channel: z.string().min(1),
	to: z.string().min(1),
	accountId: z.string().optional(),
	threadId: z.union([z.string(), z.number()]).optional()
}).strict();
const ExecApprovalForwardingSchema = z.object({
	enabled: z.boolean().optional(),
	mode: z.union([
		z.literal("session"),
		z.literal("targets"),
		z.literal("both")
	]).optional(),
	agentFilter: z.array(z.string()).optional(),
	sessionFilter: z.array(z.string()).optional(),
	targets: z.array(ExecApprovalForwardTargetSchema).optional()
}).strict().optional();
const ApprovalsSchema = z.object({ exec: ExecApprovalForwardingSchema }).strict().optional();

//#endregion
//#region src/config/zod-schema.hooks.ts
const HookMappingSchema = z.object({
	id: z.string().optional(),
	match: z.object({
		path: z.string().optional(),
		source: z.string().optional()
	}).optional(),
	action: z.union([z.literal("wake"), z.literal("agent")]).optional(),
	wakeMode: z.union([z.literal("now"), z.literal("next-heartbeat")]).optional(),
	name: z.string().optional(),
	agentId: z.string().optional(),
	sessionKey: z.string().optional().register(sensitive),
	messageTemplate: z.string().optional(),
	textTemplate: z.string().optional(),
	deliver: z.boolean().optional(),
	allowUnsafeExternalContent: z.boolean().optional(),
	channel: z.union([
		z.literal("last"),
		z.literal("whatsapp"),
		z.literal("telegram"),
		z.literal("discord"),
		z.literal("irc"),
		z.literal("slack"),
		z.literal("signal"),
		z.literal("imessage"),
		z.literal("msteams")
	]).optional(),
	to: z.string().optional(),
	model: z.string().optional(),
	thinking: z.string().optional(),
	timeoutSeconds: z.number().int().positive().optional(),
	transform: z.object({
		module: z.string(),
		export: z.string().optional()
	}).strict().optional()
}).strict().optional();
const InternalHookHandlerSchema = z.object({
	event: z.string(),
	module: z.string(),
	export: z.string().optional()
}).strict();
const HookConfigSchema = z.object({
	enabled: z.boolean().optional(),
	env: z.record(z.string(), z.string()).optional()
}).passthrough();
const HookInstallRecordSchema = z.object({
	source: z.union([
		z.literal("npm"),
		z.literal("archive"),
		z.literal("path")
	]),
	spec: z.string().optional(),
	sourcePath: z.string().optional(),
	installPath: z.string().optional(),
	version: z.string().optional(),
	installedAt: z.string().optional(),
	hooks: z.array(z.string()).optional()
}).strict();
const InternalHooksSchema = z.object({
	enabled: z.boolean().optional(),
	handlers: z.array(InternalHookHandlerSchema).optional(),
	entries: z.record(z.string(), HookConfigSchema).optional(),
	load: z.object({ extraDirs: z.array(z.string()).optional() }).strict().optional(),
	installs: z.record(z.string(), HookInstallRecordSchema).optional()
}).strict().optional();
const HooksGmailSchema = z.object({
	account: z.string().optional(),
	label: z.string().optional(),
	topic: z.string().optional(),
	subscription: z.string().optional(),
	pushToken: z.string().optional().register(sensitive),
	hookUrl: z.string().optional(),
	includeBody: z.boolean().optional(),
	maxBytes: z.number().int().positive().optional(),
	renewEveryMinutes: z.number().int().positive().optional(),
	allowUnsafeExternalContent: z.boolean().optional(),
	serve: z.object({
		bind: z.string().optional(),
		port: z.number().int().positive().optional(),
		path: z.string().optional()
	}).strict().optional(),
	tailscale: z.object({
		mode: z.union([
			z.literal("off"),
			z.literal("serve"),
			z.literal("funnel")
		]).optional(),
		path: z.string().optional(),
		target: z.string().optional()
	}).strict().optional(),
	model: z.string().optional(),
	thinking: z.union([
		z.literal("off"),
		z.literal("minimal"),
		z.literal("low"),
		z.literal("medium"),
		z.literal("high")
	]).optional()
}).strict().optional();

//#endregion
//#region src/config/zod-schema.channels.ts
const ChannelHeartbeatVisibilitySchema = z.object({
	showOk: z.boolean().optional(),
	showAlerts: z.boolean().optional(),
	useIndicator: z.boolean().optional()
}).strict().optional();

//#endregion
//#region src/config/telegram-custom-commands.ts
const TELEGRAM_COMMAND_NAME_PATTERN = /^[a-z0-9_]{1,32}$/;
function normalizeTelegramCommandName(value) {
	const trimmed = value.trim();
	if (!trimmed) return "";
	return (trimmed.startsWith("/") ? trimmed.slice(1) : trimmed).trim().toLowerCase();
}
function normalizeTelegramCommandDescription(value) {
	return value.trim();
}
function resolveTelegramCustomCommands(params) {
	const entries = Array.isArray(params.commands) ? params.commands : [];
	const reserved = params.reservedCommands ?? /* @__PURE__ */ new Set();
	const checkReserved = params.checkReserved !== false;
	const checkDuplicates = params.checkDuplicates !== false;
	const seen = /* @__PURE__ */ new Set();
	const resolved = [];
	const issues = [];
	for (let index = 0; index < entries.length; index += 1) {
		const entry = entries[index];
		const normalized = normalizeTelegramCommandName(String(entry?.command ?? ""));
		if (!normalized) {
			issues.push({
				index,
				field: "command",
				message: "Telegram custom command is missing a command name."
			});
			continue;
		}
		if (!TELEGRAM_COMMAND_NAME_PATTERN.test(normalized)) {
			issues.push({
				index,
				field: "command",
				message: `Telegram custom command "/${normalized}" is invalid (use a-z, 0-9, underscore; max 32 chars).`
			});
			continue;
		}
		if (checkReserved && reserved.has(normalized)) {
			issues.push({
				index,
				field: "command",
				message: `Telegram custom command "/${normalized}" conflicts with a native command.`
			});
			continue;
		}
		if (checkDuplicates && seen.has(normalized)) {
			issues.push({
				index,
				field: "command",
				message: `Telegram custom command "/${normalized}" is duplicated.`
			});
			continue;
		}
		const description = normalizeTelegramCommandDescription(String(entry?.description ?? ""));
		if (!description) {
			issues.push({
				index,
				field: "description",
				message: `Telegram custom command "/${normalized}" is missing a description.`
			});
			continue;
		}
		if (checkDuplicates) seen.add(normalized);
		resolved.push({
			command: normalized,
			description
		});
	}
	return {
		commands: resolved,
		issues
	};
}

//#endregion
//#region src/config/zod-schema.providers-core.ts
const ToolPolicyBySenderSchema$1 = z.record(z.string(), ToolPolicySchema).optional();
const TelegramInlineButtonsScopeSchema = z.enum([
	"off",
	"dm",
	"group",
	"all",
	"allowlist"
]);
const TelegramCapabilitiesSchema = z.union([z.array(z.string()), z.object({ inlineButtons: TelegramInlineButtonsScopeSchema.optional() }).strict()]);
const TelegramTopicSchema = z.object({
	requireMention: z.boolean().optional(),
	groupPolicy: GroupPolicySchema.optional(),
	skills: z.array(z.string()).optional(),
	enabled: z.boolean().optional(),
	allowFrom: z.array(z.union([z.string(), z.number()])).optional(),
	systemPrompt: z.string().optional()
}).strict();
const TelegramGroupSchema = z.object({
	requireMention: z.boolean().optional(),
	groupPolicy: GroupPolicySchema.optional(),
	tools: ToolPolicySchema,
	toolsBySender: ToolPolicyBySenderSchema$1,
	skills: z.array(z.string()).optional(),
	enabled: z.boolean().optional(),
	allowFrom: z.array(z.union([z.string(), z.number()])).optional(),
	systemPrompt: z.string().optional(),
	topics: z.record(z.string(), TelegramTopicSchema.optional()).optional()
}).strict();
const TelegramCustomCommandSchema = z.object({
	command: z.string().transform(normalizeTelegramCommandName),
	description: z.string().transform(normalizeTelegramCommandDescription)
}).strict();
const validateTelegramCustomCommands = (value, ctx) => {
	if (!value.customCommands || value.customCommands.length === 0) return;
	const { issues } = resolveTelegramCustomCommands({
		commands: value.customCommands,
		checkReserved: false,
		checkDuplicates: false
	});
	for (const issue of issues) ctx.addIssue({
		code: z.ZodIssueCode.custom,
		path: [
			"customCommands",
			issue.index,
			issue.field
		],
		message: issue.message
	});
};
const TelegramAccountSchemaBase = z.object({
	name: z.string().optional(),
	capabilities: TelegramCapabilitiesSchema.optional(),
	markdown: MarkdownConfigSchema,
	enabled: z.boolean().optional(),
	commands: ProviderCommandsSchema,
	customCommands: z.array(TelegramCustomCommandSchema).optional(),
	configWrites: z.boolean().optional(),
	dmPolicy: DmPolicySchema.optional().default("pairing"),
	botToken: z.string().optional().register(sensitive),
	tokenFile: z.string().optional(),
	replyToMode: ReplyToModeSchema.optional(),
	groups: z.record(z.string(), TelegramGroupSchema.optional()).optional(),
	allowFrom: z.array(z.union([z.string(), z.number()])).optional(),
	groupAllowFrom: z.array(z.union([z.string(), z.number()])).optional(),
	groupPolicy: GroupPolicySchema.optional().default("allowlist"),
	historyLimit: z.number().int().min(0).optional(),
	dmHistoryLimit: z.number().int().min(0).optional(),
	dms: z.record(z.string(), DmConfigSchema.optional()).optional(),
	textChunkLimit: z.number().int().positive().optional(),
	chunkMode: z.enum(["length", "newline"]).optional(),
	blockStreaming: z.boolean().optional(),
	draftChunk: BlockStreamingChunkSchema.optional(),
	blockStreamingCoalesce: BlockStreamingCoalesceSchema.optional(),
	streamMode: z.enum([
		"off",
		"partial",
		"block"
	]).optional().default("partial"),
	mediaMaxMb: z.number().positive().optional(),
	timeoutSeconds: z.number().int().positive().optional(),
	retry: RetryConfigSchema,
	network: z.object({ autoSelectFamily: z.boolean().optional() }).strict().optional(),
	proxy: z.string().optional(),
	webhookUrl: z.string().optional(),
	webhookSecret: z.string().optional().register(sensitive),
	webhookPath: z.string().optional(),
	webhookHost: z.string().optional(),
	actions: z.object({
		reactions: z.boolean().optional(),
		sendMessage: z.boolean().optional(),
		deleteMessage: z.boolean().optional(),
		sticker: z.boolean().optional()
	}).strict().optional(),
	reactionNotifications: z.enum([
		"off",
		"own",
		"all"
	]).optional(),
	reactionLevel: z.enum([
		"off",
		"ack",
		"minimal",
		"extensive"
	]).optional(),
	heartbeat: ChannelHeartbeatVisibilitySchema,
	linkPreview: z.boolean().optional(),
	responsePrefix: z.string().optional()
}).strict();
const TelegramAccountSchema = TelegramAccountSchemaBase.superRefine((value, ctx) => {
	requireOpenAllowFrom({
		policy: value.dmPolicy,
		allowFrom: value.allowFrom,
		ctx,
		path: ["allowFrom"],
		message: "channels.telegram.dmPolicy=\"open\" requires channels.telegram.allowFrom to include \"*\""
	});
	validateTelegramCustomCommands(value, ctx);
});
const TelegramConfigSchema = TelegramAccountSchemaBase.extend({ accounts: z.record(z.string(), TelegramAccountSchema.optional()).optional() }).superRefine((value, ctx) => {
	requireOpenAllowFrom({
		policy: value.dmPolicy,
		allowFrom: value.allowFrom,
		ctx,
		path: ["allowFrom"],
		message: "channels.telegram.dmPolicy=\"open\" requires channels.telegram.allowFrom to include \"*\""
	});
	validateTelegramCustomCommands(value, ctx);
	const baseWebhookUrl = typeof value.webhookUrl === "string" ? value.webhookUrl.trim() : "";
	const baseWebhookSecret = typeof value.webhookSecret === "string" ? value.webhookSecret.trim() : "";
	if (baseWebhookUrl && !baseWebhookSecret) ctx.addIssue({
		code: z.ZodIssueCode.custom,
		message: "channels.telegram.webhookUrl requires channels.telegram.webhookSecret",
		path: ["webhookSecret"]
	});
	if (!value.accounts) return;
	for (const [accountId, account] of Object.entries(value.accounts)) {
		if (!account) continue;
		if (account.enabled === false) continue;
		if (!(typeof account.webhookUrl === "string" ? account.webhookUrl.trim() : "")) continue;
		if (!(typeof account.webhookSecret === "string" ? account.webhookSecret.trim() : "") && !baseWebhookSecret) ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: "channels.telegram.accounts.*.webhookUrl requires channels.telegram.webhookSecret or channels.telegram.accounts.*.webhookSecret",
			path: [
				"accounts",
				accountId,
				"webhookSecret"
			]
		});
	}
});
const DiscordDmSchema = z.object({
	enabled: z.boolean().optional(),
	policy: DmPolicySchema.optional().default("pairing"),
	allowFrom: z.array(z.union([z.string(), z.number()])).optional(),
	groupEnabled: z.boolean().optional(),
	groupChannels: z.array(z.union([z.string(), z.number()])).optional()
}).strict().superRefine((value, ctx) => {
	requireOpenAllowFrom({
		policy: value.policy,
		allowFrom: value.allowFrom,
		ctx,
		path: ["allowFrom"],
		message: "channels.discord.dm.policy=\"open\" requires channels.discord.dm.allowFrom to include \"*\""
	});
});
const DiscordGuildChannelSchema = z.object({
	allow: z.boolean().optional(),
	requireMention: z.boolean().optional(),
	tools: ToolPolicySchema,
	toolsBySender: ToolPolicyBySenderSchema$1,
	skills: z.array(z.string()).optional(),
	enabled: z.boolean().optional(),
	users: z.array(z.union([z.string(), z.number()])).optional(),
	roles: z.array(z.union([z.string(), z.number()])).optional(),
	systemPrompt: z.string().optional(),
	includeThreadStarter: z.boolean().optional(),
	autoThread: z.boolean().optional()
}).strict();
const DiscordGuildSchema = z.object({
	slug: z.string().optional(),
	requireMention: z.boolean().optional(),
	tools: ToolPolicySchema,
	toolsBySender: ToolPolicyBySenderSchema$1,
	reactionNotifications: z.enum([
		"off",
		"own",
		"all",
		"allowlist"
	]).optional(),
	users: z.array(z.union([z.string(), z.number()])).optional(),
	roles: z.array(z.union([z.string(), z.number()])).optional(),
	channels: z.record(z.string(), DiscordGuildChannelSchema.optional()).optional()
}).strict();
const DiscordAccountSchema = z.object({
	name: z.string().optional(),
	capabilities: z.array(z.string()).optional(),
	markdown: MarkdownConfigSchema,
	enabled: z.boolean().optional(),
	commands: ProviderCommandsSchema,
	configWrites: z.boolean().optional(),
	token: z.string().optional().register(sensitive),
	proxy: z.string().optional(),
	allowBots: z.boolean().optional(),
	groupPolicy: GroupPolicySchema.optional().default("allowlist"),
	historyLimit: z.number().int().min(0).optional(),
	dmHistoryLimit: z.number().int().min(0).optional(),
	dms: z.record(z.string(), DmConfigSchema.optional()).optional(),
	textChunkLimit: z.number().int().positive().optional(),
	chunkMode: z.enum(["length", "newline"]).optional(),
	blockStreaming: z.boolean().optional(),
	blockStreamingCoalesce: BlockStreamingCoalesceSchema.optional(),
	maxLinesPerMessage: z.number().int().positive().optional(),
	mediaMaxMb: z.number().positive().optional(),
	retry: RetryConfigSchema,
	actions: z.object({
		reactions: z.boolean().optional(),
		stickers: z.boolean().optional(),
		emojiUploads: z.boolean().optional(),
		stickerUploads: z.boolean().optional(),
		polls: z.boolean().optional(),
		permissions: z.boolean().optional(),
		messages: z.boolean().optional(),
		threads: z.boolean().optional(),
		pins: z.boolean().optional(),
		search: z.boolean().optional(),
		memberInfo: z.boolean().optional(),
		roleInfo: z.boolean().optional(),
		roles: z.boolean().optional(),
		channelInfo: z.boolean().optional(),
		voiceStatus: z.boolean().optional(),
		events: z.boolean().optional(),
		moderation: z.boolean().optional(),
		channels: z.boolean().optional(),
		presence: z.boolean().optional()
	}).strict().optional(),
	replyToMode: ReplyToModeSchema.optional(),
	dm: DiscordDmSchema.optional(),
	guilds: z.record(z.string(), DiscordGuildSchema.optional()).optional(),
	heartbeat: ChannelHeartbeatVisibilitySchema,
	execApprovals: z.object({
		enabled: z.boolean().optional(),
		approvers: z.array(z.union([z.string(), z.number()])).optional(),
		agentFilter: z.array(z.string()).optional(),
		sessionFilter: z.array(z.string()).optional(),
		cleanupAfterResolve: z.boolean().optional()
	}).strict().optional(),
	intents: z.object({
		presence: z.boolean().optional(),
		guildMembers: z.boolean().optional()
	}).strict().optional(),
	pluralkit: z.object({
		enabled: z.boolean().optional(),
		token: z.string().optional().register(sensitive)
	}).strict().optional(),
	responsePrefix: z.string().optional(),
	activity: z.string().optional(),
	status: z.enum([
		"online",
		"dnd",
		"idle",
		"invisible"
	]).optional(),
	activityType: z.union([
		z.literal(0),
		z.literal(1),
		z.literal(2),
		z.literal(3),
		z.literal(4),
		z.literal(5)
	]).optional(),
	activityUrl: z.string().url().optional()
}).strict().superRefine((value, ctx) => {
	const activityText = typeof value.activity === "string" ? value.activity.trim() : "";
	const hasActivity = Boolean(activityText);
	const hasActivityType = value.activityType !== void 0;
	const activityUrl = typeof value.activityUrl === "string" ? value.activityUrl.trim() : "";
	const hasActivityUrl = Boolean(activityUrl);
	if ((hasActivityType || hasActivityUrl) && !hasActivity) ctx.addIssue({
		code: z.ZodIssueCode.custom,
		message: "channels.discord.activity is required when activityType or activityUrl is set",
		path: ["activity"]
	});
	if (value.activityType === 1 && !hasActivityUrl) ctx.addIssue({
		code: z.ZodIssueCode.custom,
		message: "channels.discord.activityUrl is required when activityType is 1 (Streaming)",
		path: ["activityUrl"]
	});
	if (hasActivityUrl && value.activityType !== 1) ctx.addIssue({
		code: z.ZodIssueCode.custom,
		message: "channels.discord.activityType must be 1 (Streaming) when activityUrl is set",
		path: ["activityType"]
	});
});
const DiscordConfigSchema = DiscordAccountSchema.extend({ accounts: z.record(z.string(), DiscordAccountSchema.optional()).optional() });
const GoogleChatDmSchema = z.object({
	enabled: z.boolean().optional(),
	policy: DmPolicySchema.optional().default("pairing"),
	allowFrom: z.array(z.union([z.string(), z.number()])).optional()
}).strict().superRefine((value, ctx) => {
	requireOpenAllowFrom({
		policy: value.policy,
		allowFrom: value.allowFrom,
		ctx,
		path: ["allowFrom"],
		message: "channels.googlechat.dm.policy=\"open\" requires channels.googlechat.dm.allowFrom to include \"*\""
	});
});
const GoogleChatGroupSchema = z.object({
	enabled: z.boolean().optional(),
	allow: z.boolean().optional(),
	requireMention: z.boolean().optional(),
	users: z.array(z.union([z.string(), z.number()])).optional(),
	systemPrompt: z.string().optional()
}).strict();
const GoogleChatAccountSchema = z.object({
	name: z.string().optional(),
	capabilities: z.array(z.string()).optional(),
	enabled: z.boolean().optional(),
	configWrites: z.boolean().optional(),
	allowBots: z.boolean().optional(),
	requireMention: z.boolean().optional(),
	groupPolicy: GroupPolicySchema.optional().default("allowlist"),
	groupAllowFrom: z.array(z.union([z.string(), z.number()])).optional(),
	groups: z.record(z.string(), GoogleChatGroupSchema.optional()).optional(),
	serviceAccount: z.union([z.string(), z.record(z.string(), z.unknown())]).optional(),
	serviceAccountFile: z.string().optional(),
	audienceType: z.enum(["app-url", "project-number"]).optional(),
	audience: z.string().optional(),
	webhookPath: z.string().optional(),
	webhookUrl: z.string().optional(),
	botUser: z.string().optional(),
	historyLimit: z.number().int().min(0).optional(),
	dmHistoryLimit: z.number().int().min(0).optional(),
	dms: z.record(z.string(), DmConfigSchema.optional()).optional(),
	textChunkLimit: z.number().int().positive().optional(),
	chunkMode: z.enum(["length", "newline"]).optional(),
	blockStreaming: z.boolean().optional(),
	blockStreamingCoalesce: BlockStreamingCoalesceSchema.optional(),
	mediaMaxMb: z.number().positive().optional(),
	replyToMode: ReplyToModeSchema.optional(),
	actions: z.object({ reactions: z.boolean().optional() }).strict().optional(),
	dm: GoogleChatDmSchema.optional(),
	typingIndicator: z.enum([
		"none",
		"message",
		"reaction"
	]).optional(),
	responsePrefix: z.string().optional()
}).strict();
const GoogleChatConfigSchema = GoogleChatAccountSchema.extend({
	accounts: z.record(z.string(), GoogleChatAccountSchema.optional()).optional(),
	defaultAccount: z.string().optional()
});
const SlackDmSchema = z.object({
	enabled: z.boolean().optional(),
	policy: DmPolicySchema.optional().default("pairing"),
	allowFrom: z.array(z.union([z.string(), z.number()])).optional(),
	groupEnabled: z.boolean().optional(),
	groupChannels: z.array(z.union([z.string(), z.number()])).optional(),
	replyToMode: ReplyToModeSchema.optional()
}).strict().superRefine((value, ctx) => {
	requireOpenAllowFrom({
		policy: value.policy,
		allowFrom: value.allowFrom,
		ctx,
		path: ["allowFrom"],
		message: "channels.slack.dm.policy=\"open\" requires channels.slack.dm.allowFrom to include \"*\""
	});
});
const SlackChannelSchema = z.object({
	enabled: z.boolean().optional(),
	allow: z.boolean().optional(),
	requireMention: z.boolean().optional(),
	tools: ToolPolicySchema,
	toolsBySender: ToolPolicyBySenderSchema$1,
	allowBots: z.boolean().optional(),
	users: z.array(z.union([z.string(), z.number()])).optional(),
	skills: z.array(z.string()).optional(),
	systemPrompt: z.string().optional()
}).strict();
const SlackThreadSchema = z.object({
	historyScope: z.enum(["thread", "channel"]).optional(),
	inheritParent: z.boolean().optional(),
	initialHistoryLimit: z.number().int().min(0).optional()
}).strict();
const SlackReplyToModeByChatTypeSchema = z.object({
	direct: ReplyToModeSchema.optional(),
	group: ReplyToModeSchema.optional(),
	channel: ReplyToModeSchema.optional()
}).strict();
const SlackAccountSchema = z.object({
	name: z.string().optional(),
	mode: z.enum(["socket", "http"]).optional(),
	signingSecret: z.string().optional().register(sensitive),
	webhookPath: z.string().optional(),
	capabilities: z.array(z.string()).optional(),
	markdown: MarkdownConfigSchema,
	enabled: z.boolean().optional(),
	commands: ProviderCommandsSchema,
	configWrites: z.boolean().optional(),
	botToken: z.string().optional().register(sensitive),
	appToken: z.string().optional().register(sensitive),
	userToken: z.string().optional().register(sensitive),
	userTokenReadOnly: z.boolean().optional().default(true),
	allowBots: z.boolean().optional(),
	requireMention: z.boolean().optional(),
	groupPolicy: GroupPolicySchema.optional().default("allowlist"),
	historyLimit: z.number().int().min(0).optional(),
	dmHistoryLimit: z.number().int().min(0).optional(),
	dms: z.record(z.string(), DmConfigSchema.optional()).optional(),
	textChunkLimit: z.number().int().positive().optional(),
	chunkMode: z.enum(["length", "newline"]).optional(),
	blockStreaming: z.boolean().optional(),
	blockStreamingCoalesce: BlockStreamingCoalesceSchema.optional(),
	mediaMaxMb: z.number().positive().optional(),
	reactionNotifications: z.enum([
		"off",
		"own",
		"all",
		"allowlist"
	]).optional(),
	reactionAllowlist: z.array(z.union([z.string(), z.number()])).optional(),
	replyToMode: ReplyToModeSchema.optional(),
	replyToModeByChatType: SlackReplyToModeByChatTypeSchema.optional(),
	thread: SlackThreadSchema.optional(),
	actions: z.object({
		reactions: z.boolean().optional(),
		messages: z.boolean().optional(),
		pins: z.boolean().optional(),
		search: z.boolean().optional(),
		permissions: z.boolean().optional(),
		memberInfo: z.boolean().optional(),
		channelInfo: z.boolean().optional(),
		emojiList: z.boolean().optional()
	}).strict().optional(),
	slashCommand: z.object({
		enabled: z.boolean().optional(),
		name: z.string().optional(),
		sessionPrefix: z.string().optional(),
		ephemeral: z.boolean().optional()
	}).strict().optional(),
	dm: SlackDmSchema.optional(),
	channels: z.record(z.string(), SlackChannelSchema.optional()).optional(),
	heartbeat: ChannelHeartbeatVisibilitySchema,
	responsePrefix: z.string().optional()
}).strict();
const SlackConfigSchema = SlackAccountSchema.extend({
	mode: z.enum(["socket", "http"]).optional().default("socket"),
	signingSecret: z.string().optional().register(sensitive),
	webhookPath: z.string().optional().default("/slack/events"),
	accounts: z.record(z.string(), SlackAccountSchema.optional()).optional()
}).superRefine((value, ctx) => {
	const baseMode = value.mode ?? "socket";
	if (baseMode === "http" && !value.signingSecret) ctx.addIssue({
		code: z.ZodIssueCode.custom,
		message: "channels.slack.mode=\"http\" requires channels.slack.signingSecret",
		path: ["signingSecret"]
	});
	if (!value.accounts) return;
	for (const [accountId, account] of Object.entries(value.accounts)) {
		if (!account) continue;
		if (account.enabled === false) continue;
		if ((account.mode ?? baseMode) !== "http") continue;
		if (!(account.signingSecret ?? value.signingSecret)) ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: "channels.slack.accounts.*.mode=\"http\" requires channels.slack.signingSecret or channels.slack.accounts.*.signingSecret",
			path: [
				"accounts",
				accountId,
				"signingSecret"
			]
		});
	}
});
const SignalAccountSchemaBase = z.object({
	name: z.string().optional(),
	capabilities: z.array(z.string()).optional(),
	markdown: MarkdownConfigSchema,
	enabled: z.boolean().optional(),
	configWrites: z.boolean().optional(),
	account: z.string().optional(),
	httpUrl: z.string().optional(),
	httpHost: z.string().optional(),
	httpPort: z.number().int().positive().optional(),
	cliPath: ExecutableTokenSchema.optional(),
	autoStart: z.boolean().optional(),
	startupTimeoutMs: z.number().int().min(1e3).max(12e4).optional(),
	receiveMode: z.union([z.literal("on-start"), z.literal("manual")]).optional(),
	ignoreAttachments: z.boolean().optional(),
	ignoreStories: z.boolean().optional(),
	sendReadReceipts: z.boolean().optional(),
	dmPolicy: DmPolicySchema.optional().default("pairing"),
	allowFrom: z.array(z.union([z.string(), z.number()])).optional(),
	groupAllowFrom: z.array(z.union([z.string(), z.number()])).optional(),
	groupPolicy: GroupPolicySchema.optional().default("allowlist"),
	historyLimit: z.number().int().min(0).optional(),
	dmHistoryLimit: z.number().int().min(0).optional(),
	dms: z.record(z.string(), DmConfigSchema.optional()).optional(),
	textChunkLimit: z.number().int().positive().optional(),
	chunkMode: z.enum(["length", "newline"]).optional(),
	blockStreaming: z.boolean().optional(),
	blockStreamingCoalesce: BlockStreamingCoalesceSchema.optional(),
	mediaMaxMb: z.number().int().positive().optional(),
	reactionNotifications: z.enum([
		"off",
		"own",
		"all",
		"allowlist"
	]).optional(),
	reactionAllowlist: z.array(z.union([z.string(), z.number()])).optional(),
	actions: z.object({ reactions: z.boolean().optional() }).strict().optional(),
	reactionLevel: z.enum([
		"off",
		"ack",
		"minimal",
		"extensive"
	]).optional(),
	heartbeat: ChannelHeartbeatVisibilitySchema,
	responsePrefix: z.string().optional()
}).strict();
const SignalAccountSchema = SignalAccountSchemaBase.superRefine((value, ctx) => {
	requireOpenAllowFrom({
		policy: value.dmPolicy,
		allowFrom: value.allowFrom,
		ctx,
		path: ["allowFrom"],
		message: "channels.signal.dmPolicy=\"open\" requires channels.signal.allowFrom to include \"*\""
	});
});
const SignalConfigSchema = SignalAccountSchemaBase.extend({ accounts: z.record(z.string(), SignalAccountSchema.optional()).optional() }).superRefine((value, ctx) => {
	requireOpenAllowFrom({
		policy: value.dmPolicy,
		allowFrom: value.allowFrom,
		ctx,
		path: ["allowFrom"],
		message: "channels.signal.dmPolicy=\"open\" requires channels.signal.allowFrom to include \"*\""
	});
});
const IrcGroupSchema = z.object({
	requireMention: z.boolean().optional(),
	tools: ToolPolicySchema,
	toolsBySender: ToolPolicyBySenderSchema$1,
	skills: z.array(z.string()).optional(),
	enabled: z.boolean().optional(),
	allowFrom: z.array(z.union([z.string(), z.number()])).optional(),
	systemPrompt: z.string().optional()
}).strict();
const IrcNickServSchema = z.object({
	enabled: z.boolean().optional(),
	service: z.string().optional(),
	password: z.string().optional().register(sensitive),
	passwordFile: z.string().optional(),
	register: z.boolean().optional(),
	registerEmail: z.string().optional()
}).strict();
const IrcAccountSchemaBase = z.object({
	name: z.string().optional(),
	capabilities: z.array(z.string()).optional(),
	markdown: MarkdownConfigSchema,
	enabled: z.boolean().optional(),
	configWrites: z.boolean().optional(),
	host: z.string().optional(),
	port: z.number().int().min(1).max(65535).optional(),
	tls: z.boolean().optional(),
	nick: z.string().optional(),
	username: z.string().optional(),
	realname: z.string().optional(),
	password: z.string().optional().register(sensitive),
	passwordFile: z.string().optional(),
	nickserv: IrcNickServSchema.optional(),
	channels: z.array(z.string()).optional(),
	dmPolicy: DmPolicySchema.optional().default("pairing"),
	allowFrom: z.array(z.union([z.string(), z.number()])).optional(),
	groupAllowFrom: z.array(z.union([z.string(), z.number()])).optional(),
	groupPolicy: GroupPolicySchema.optional().default("allowlist"),
	groups: z.record(z.string(), IrcGroupSchema.optional()).optional(),
	mentionPatterns: z.array(z.string()).optional(),
	historyLimit: z.number().int().min(0).optional(),
	dmHistoryLimit: z.number().int().min(0).optional(),
	dms: z.record(z.string(), DmConfigSchema.optional()).optional(),
	textChunkLimit: z.number().int().positive().optional(),
	chunkMode: z.enum(["length", "newline"]).optional(),
	blockStreaming: z.boolean().optional(),
	blockStreamingCoalesce: BlockStreamingCoalesceSchema.optional(),
	mediaMaxMb: z.number().positive().optional(),
	heartbeat: ChannelHeartbeatVisibilitySchema,
	responsePrefix: z.string().optional()
}).strict();
const IrcAccountSchema = IrcAccountSchemaBase.superRefine((value, ctx) => {
	requireOpenAllowFrom({
		policy: value.dmPolicy,
		allowFrom: value.allowFrom,
		ctx,
		path: ["allowFrom"],
		message: "channels.irc.dmPolicy=\"open\" requires channels.irc.allowFrom to include \"*\""
	});
	if (value.nickserv?.register && !value.nickserv.registerEmail?.trim()) ctx.addIssue({
		code: z.ZodIssueCode.custom,
		path: ["nickserv", "registerEmail"],
		message: "channels.irc.nickserv.register=true requires channels.irc.nickserv.registerEmail"
	});
});
const IrcConfigSchema = IrcAccountSchemaBase.extend({ accounts: z.record(z.string(), IrcAccountSchema.optional()).optional() }).superRefine((value, ctx) => {
	requireOpenAllowFrom({
		policy: value.dmPolicy,
		allowFrom: value.allowFrom,
		ctx,
		path: ["allowFrom"],
		message: "channels.irc.dmPolicy=\"open\" requires channels.irc.allowFrom to include \"*\""
	});
	if (value.nickserv?.register && !value.nickserv.registerEmail?.trim()) ctx.addIssue({
		code: z.ZodIssueCode.custom,
		path: ["nickserv", "registerEmail"],
		message: "channels.irc.nickserv.register=true requires channels.irc.nickserv.registerEmail"
	});
});
const IMessageAccountSchemaBase = z.object({
	name: z.string().optional(),
	capabilities: z.array(z.string()).optional(),
	markdown: MarkdownConfigSchema,
	enabled: z.boolean().optional(),
	configWrites: z.boolean().optional(),
	cliPath: ExecutableTokenSchema.optional(),
	dbPath: z.string().optional(),
	remoteHost: z.string().optional(),
	service: z.union([
		z.literal("imessage"),
		z.literal("sms"),
		z.literal("auto")
	]).optional(),
	region: z.string().optional(),
	dmPolicy: DmPolicySchema.optional().default("pairing"),
	allowFrom: z.array(z.union([z.string(), z.number()])).optional(),
	groupAllowFrom: z.array(z.union([z.string(), z.number()])).optional(),
	groupPolicy: GroupPolicySchema.optional().default("allowlist"),
	historyLimit: z.number().int().min(0).optional(),
	dmHistoryLimit: z.number().int().min(0).optional(),
	dms: z.record(z.string(), DmConfigSchema.optional()).optional(),
	includeAttachments: z.boolean().optional(),
	mediaMaxMb: z.number().int().positive().optional(),
	textChunkLimit: z.number().int().positive().optional(),
	chunkMode: z.enum(["length", "newline"]).optional(),
	blockStreaming: z.boolean().optional(),
	blockStreamingCoalesce: BlockStreamingCoalesceSchema.optional(),
	groups: z.record(z.string(), z.object({
		requireMention: z.boolean().optional(),
		tools: ToolPolicySchema,
		toolsBySender: ToolPolicyBySenderSchema$1
	}).strict().optional()).optional(),
	heartbeat: ChannelHeartbeatVisibilitySchema,
	responsePrefix: z.string().optional()
}).strict();
const IMessageAccountSchema = IMessageAccountSchemaBase.superRefine((value, ctx) => {
	requireOpenAllowFrom({
		policy: value.dmPolicy,
		allowFrom: value.allowFrom,
		ctx,
		path: ["allowFrom"],
		message: "channels.imessage.dmPolicy=\"open\" requires channels.imessage.allowFrom to include \"*\""
	});
});
const IMessageConfigSchema = IMessageAccountSchemaBase.extend({ accounts: z.record(z.string(), IMessageAccountSchema.optional()).optional() }).superRefine((value, ctx) => {
	requireOpenAllowFrom({
		policy: value.dmPolicy,
		allowFrom: value.allowFrom,
		ctx,
		path: ["allowFrom"],
		message: "channels.imessage.dmPolicy=\"open\" requires channels.imessage.allowFrom to include \"*\""
	});
});
const BlueBubblesAllowFromEntry = z.union([z.string(), z.number()]);
const BlueBubblesActionSchema = z.object({
	reactions: z.boolean().optional(),
	edit: z.boolean().optional(),
	unsend: z.boolean().optional(),
	reply: z.boolean().optional(),
	sendWithEffect: z.boolean().optional(),
	renameGroup: z.boolean().optional(),
	setGroupIcon: z.boolean().optional(),
	addParticipant: z.boolean().optional(),
	removeParticipant: z.boolean().optional(),
	leaveGroup: z.boolean().optional(),
	sendAttachment: z.boolean().optional()
}).strict().optional();
const BlueBubblesGroupConfigSchema = z.object({
	requireMention: z.boolean().optional(),
	tools: ToolPolicySchema,
	toolsBySender: ToolPolicyBySenderSchema$1
}).strict();
const BlueBubblesAccountSchemaBase = z.object({
	name: z.string().optional(),
	capabilities: z.array(z.string()).optional(),
	markdown: MarkdownConfigSchema,
	configWrites: z.boolean().optional(),
	enabled: z.boolean().optional(),
	serverUrl: z.string().optional(),
	password: z.string().optional().register(sensitive),
	webhookPath: z.string().optional(),
	dmPolicy: DmPolicySchema.optional().default("pairing"),
	allowFrom: z.array(BlueBubblesAllowFromEntry).optional(),
	groupAllowFrom: z.array(BlueBubblesAllowFromEntry).optional(),
	groupPolicy: GroupPolicySchema.optional().default("allowlist"),
	historyLimit: z.number().int().min(0).optional(),
	dmHistoryLimit: z.number().int().min(0).optional(),
	dms: z.record(z.string(), DmConfigSchema.optional()).optional(),
	textChunkLimit: z.number().int().positive().optional(),
	chunkMode: z.enum(["length", "newline"]).optional(),
	mediaMaxMb: z.number().int().positive().optional(),
	sendReadReceipts: z.boolean().optional(),
	blockStreaming: z.boolean().optional(),
	blockStreamingCoalesce: BlockStreamingCoalesceSchema.optional(),
	groups: z.record(z.string(), BlueBubblesGroupConfigSchema.optional()).optional(),
	heartbeat: ChannelHeartbeatVisibilitySchema,
	responsePrefix: z.string().optional()
}).strict();
const BlueBubblesAccountSchema = BlueBubblesAccountSchemaBase.superRefine((value, ctx) => {
	requireOpenAllowFrom({
		policy: value.dmPolicy,
		allowFrom: value.allowFrom,
		ctx,
		path: ["allowFrom"],
		message: "channels.bluebubbles.accounts.*.dmPolicy=\"open\" requires allowFrom to include \"*\""
	});
});
const BlueBubblesConfigSchema = BlueBubblesAccountSchemaBase.extend({
	accounts: z.record(z.string(), BlueBubblesAccountSchema.optional()).optional(),
	actions: BlueBubblesActionSchema
}).superRefine((value, ctx) => {
	requireOpenAllowFrom({
		policy: value.dmPolicy,
		allowFrom: value.allowFrom,
		ctx,
		path: ["allowFrom"],
		message: "channels.bluebubbles.dmPolicy=\"open\" requires channels.bluebubbles.allowFrom to include \"*\""
	});
});
const MSTeamsChannelSchema = z.object({
	requireMention: z.boolean().optional(),
	tools: ToolPolicySchema,
	toolsBySender: ToolPolicyBySenderSchema$1,
	replyStyle: MSTeamsReplyStyleSchema.optional()
}).strict();
const MSTeamsTeamSchema = z.object({
	requireMention: z.boolean().optional(),
	tools: ToolPolicySchema,
	toolsBySender: ToolPolicyBySenderSchema$1,
	replyStyle: MSTeamsReplyStyleSchema.optional(),
	channels: z.record(z.string(), MSTeamsChannelSchema.optional()).optional()
}).strict();
const MSTeamsConfigSchema = z.object({
	enabled: z.boolean().optional(),
	capabilities: z.array(z.string()).optional(),
	markdown: MarkdownConfigSchema,
	configWrites: z.boolean().optional(),
	appId: z.string().optional(),
	appPassword: z.string().optional().register(sensitive),
	tenantId: z.string().optional(),
	webhook: z.object({
		port: z.number().int().positive().optional(),
		path: z.string().optional()
	}).strict().optional(),
	dmPolicy: DmPolicySchema.optional().default("pairing"),
	allowFrom: z.array(z.string()).optional(),
	groupAllowFrom: z.array(z.string()).optional(),
	groupPolicy: GroupPolicySchema.optional().default("allowlist"),
	textChunkLimit: z.number().int().positive().optional(),
	chunkMode: z.enum(["length", "newline"]).optional(),
	blockStreamingCoalesce: BlockStreamingCoalesceSchema.optional(),
	mediaAllowHosts: z.array(z.string()).optional(),
	mediaAuthAllowHosts: z.array(z.string()).optional(),
	requireMention: z.boolean().optional(),
	historyLimit: z.number().int().min(0).optional(),
	dmHistoryLimit: z.number().int().min(0).optional(),
	dms: z.record(z.string(), DmConfigSchema.optional()).optional(),
	replyStyle: MSTeamsReplyStyleSchema.optional(),
	teams: z.record(z.string(), MSTeamsTeamSchema.optional()).optional(),
	mediaMaxMb: z.number().positive().optional(),
	sharePointSiteId: z.string().optional(),
	heartbeat: ChannelHeartbeatVisibilitySchema,
	responsePrefix: z.string().optional()
}).strict().superRefine((value, ctx) => {
	requireOpenAllowFrom({
		policy: value.dmPolicy,
		allowFrom: value.allowFrom,
		ctx,
		path: ["allowFrom"],
		message: "channels.msteams.dmPolicy=\"open\" requires channels.msteams.allowFrom to include \"*\""
	});
});

//#endregion
//#region src/config/zod-schema.providers-whatsapp.ts
const ToolPolicyBySenderSchema = z.record(z.string(), ToolPolicySchema).optional();
const WhatsAppAccountSchema = z.object({
	name: z.string().optional(),
	capabilities: z.array(z.string()).optional(),
	markdown: MarkdownConfigSchema,
	configWrites: z.boolean().optional(),
	enabled: z.boolean().optional(),
	sendReadReceipts: z.boolean().optional(),
	messagePrefix: z.string().optional(),
	responsePrefix: z.string().optional(),
	authDir: z.string().optional(),
	dmPolicy: DmPolicySchema.optional().default("pairing"),
	selfChatMode: z.boolean().optional(),
	allowFrom: z.array(z.string()).optional(),
	groupAllowFrom: z.array(z.string()).optional(),
	groupPolicy: GroupPolicySchema.optional().default("allowlist"),
	historyLimit: z.number().int().min(0).optional(),
	dmHistoryLimit: z.number().int().min(0).optional(),
	dms: z.record(z.string(), DmConfigSchema.optional()).optional(),
	textChunkLimit: z.number().int().positive().optional(),
	chunkMode: z.enum(["length", "newline"]).optional(),
	mediaMaxMb: z.number().int().positive().optional(),
	blockStreaming: z.boolean().optional(),
	blockStreamingCoalesce: BlockStreamingCoalesceSchema.optional(),
	groups: z.record(z.string(), z.object({
		requireMention: z.boolean().optional(),
		tools: ToolPolicySchema,
		toolsBySender: ToolPolicyBySenderSchema
	}).strict().optional()).optional(),
	ackReaction: z.object({
		emoji: z.string().optional(),
		direct: z.boolean().optional().default(true),
		group: z.enum([
			"always",
			"mentions",
			"never"
		]).optional().default("mentions")
	}).strict().optional(),
	debounceMs: z.number().int().nonnegative().optional().default(0),
	heartbeat: ChannelHeartbeatVisibilitySchema
}).strict().superRefine((value, ctx) => {
	if (value.dmPolicy !== "open") return;
	if ((value.allowFrom ?? []).map((v) => String(v).trim()).filter(Boolean).includes("*")) return;
	ctx.addIssue({
		code: z.ZodIssueCode.custom,
		path: ["allowFrom"],
		message: "channels.whatsapp.accounts.*.dmPolicy=\"open\" requires allowFrom to include \"*\""
	});
});
const WhatsAppConfigSchema = z.object({
	accounts: z.record(z.string(), WhatsAppAccountSchema.optional()).optional(),
	capabilities: z.array(z.string()).optional(),
	markdown: MarkdownConfigSchema,
	configWrites: z.boolean().optional(),
	sendReadReceipts: z.boolean().optional(),
	dmPolicy: DmPolicySchema.optional().default("pairing"),
	messagePrefix: z.string().optional(),
	responsePrefix: z.string().optional(),
	selfChatMode: z.boolean().optional(),
	allowFrom: z.array(z.string()).optional(),
	groupAllowFrom: z.array(z.string()).optional(),
	groupPolicy: GroupPolicySchema.optional().default("allowlist"),
	historyLimit: z.number().int().min(0).optional(),
	dmHistoryLimit: z.number().int().min(0).optional(),
	dms: z.record(z.string(), DmConfigSchema.optional()).optional(),
	textChunkLimit: z.number().int().positive().optional(),
	chunkMode: z.enum(["length", "newline"]).optional(),
	mediaMaxMb: z.number().int().positive().optional().default(50),
	blockStreaming: z.boolean().optional(),
	blockStreamingCoalesce: BlockStreamingCoalesceSchema.optional(),
	actions: z.object({
		reactions: z.boolean().optional(),
		sendMessage: z.boolean().optional(),
		polls: z.boolean().optional()
	}).strict().optional(),
	groups: z.record(z.string(), z.object({
		requireMention: z.boolean().optional(),
		tools: ToolPolicySchema,
		toolsBySender: ToolPolicyBySenderSchema
	}).strict().optional()).optional(),
	ackReaction: z.object({
		emoji: z.string().optional(),
		direct: z.boolean().optional().default(true),
		group: z.enum([
			"always",
			"mentions",
			"never"
		]).optional().default("mentions")
	}).strict().optional(),
	debounceMs: z.number().int().nonnegative().optional().default(0),
	heartbeat: ChannelHeartbeatVisibilitySchema
}).strict().superRefine((value, ctx) => {
	if (value.dmPolicy !== "open") return;
	if ((value.allowFrom ?? []).map((v) => String(v).trim()).filter(Boolean).includes("*")) return;
	ctx.addIssue({
		code: z.ZodIssueCode.custom,
		path: ["allowFrom"],
		message: "channels.whatsapp.dmPolicy=\"open\" requires channels.whatsapp.allowFrom to include \"*\""
	});
});

//#endregion
//#region src/config/zod-schema.providers.ts
const ChannelsSchema = z.object({
	defaults: z.object({
		groupPolicy: GroupPolicySchema.optional(),
		heartbeat: ChannelHeartbeatVisibilitySchema
	}).strict().optional(),
	whatsapp: WhatsAppConfigSchema.optional(),
	telegram: TelegramConfigSchema.optional(),
	discord: DiscordConfigSchema.optional(),
	irc: IrcConfigSchema.optional(),
	googlechat: GoogleChatConfigSchema.optional(),
	slack: SlackConfigSchema.optional(),
	signal: SignalConfigSchema.optional(),
	imessage: IMessageConfigSchema.optional(),
	bluebubbles: BlueBubblesConfigSchema.optional(),
	msteams: MSTeamsConfigSchema.optional()
}).passthrough().optional();

//#endregion
//#region src/cli/parse-bytes.ts
const UNIT_MULTIPLIERS = {
	b: 1,
	kb: 1024,
	k: 1024,
	mb: 1024 ** 2,
	m: 1024 ** 2,
	gb: 1024 ** 3,
	g: 1024 ** 3,
	tb: 1024 ** 4,
	t: 1024 ** 4
};
function parseByteSize(raw, opts) {
	const trimmed = String(raw ?? "").trim().toLowerCase();
	if (!trimmed) throw new Error("invalid byte size (empty)");
	const m = /^(\d+(?:\.\d+)?)([a-z]+)?$/.exec(trimmed);
	if (!m) throw new Error(`invalid byte size: ${raw}`);
	const value = Number(m[1]);
	if (!Number.isFinite(value) || value < 0) throw new Error(`invalid byte size: ${raw}`);
	const multiplier = UNIT_MULTIPLIERS[(m[2] ?? opts?.defaultUnit ?? "b").toLowerCase()];
	if (!multiplier) throw new Error(`invalid byte size unit: ${raw}`);
	const bytes = Math.round(value * multiplier);
	if (!Number.isFinite(bytes)) throw new Error(`invalid byte size: ${raw}`);
	return bytes;
}

//#endregion
//#region src/config/zod-schema.session.ts
const SessionResetConfigSchema = z.object({
	mode: z.union([z.literal("daily"), z.literal("idle")]).optional(),
	atHour: z.number().int().min(0).max(23).optional(),
	idleMinutes: z.number().int().positive().optional()
}).strict();
const SessionSendPolicySchema = z.object({
	default: z.union([z.literal("allow"), z.literal("deny")]).optional(),
	rules: z.array(z.object({
		action: z.union([z.literal("allow"), z.literal("deny")]),
		match: z.object({
			channel: z.string().optional(),
			chatType: z.union([
				z.literal("direct"),
				z.literal("group"),
				z.literal("channel"),
				z.literal("dm")
			]).optional(),
			keyPrefix: z.string().optional()
		}).strict().optional()
	}).strict()).optional()
}).strict();
const SessionSchema = z.object({
	scope: z.union([z.literal("per-sender"), z.literal("global")]).optional(),
	dmScope: z.union([
		z.literal("main"),
		z.literal("per-peer"),
		z.literal("per-channel-peer"),
		z.literal("per-account-channel-peer")
	]).optional(),
	identityLinks: z.record(z.string(), z.array(z.string())).optional(),
	resetTriggers: z.array(z.string()).optional(),
	idleMinutes: z.number().int().positive().optional(),
	reset: SessionResetConfigSchema.optional(),
	resetByType: z.object({
		direct: SessionResetConfigSchema.optional(),
		dm: SessionResetConfigSchema.optional(),
		group: SessionResetConfigSchema.optional(),
		thread: SessionResetConfigSchema.optional()
	}).strict().optional(),
	resetByChannel: z.record(z.string(), SessionResetConfigSchema).optional(),
	store: z.string().optional(),
	typingIntervalSeconds: z.number().int().positive().optional(),
	typingMode: z.union([
		z.literal("never"),
		z.literal("instant"),
		z.literal("thinking"),
		z.literal("message")
	]).optional(),
	mainKey: z.string().optional(),
	sendPolicy: SessionSendPolicySchema.optional(),
	agentToAgent: z.object({ maxPingPongTurns: z.number().int().min(0).max(5).optional() }).strict().optional(),
	maintenance: z.object({
		mode: z.enum(["enforce", "warn"]).optional(),
		pruneAfter: z.union([z.string(), z.number()]).optional(),
		pruneDays: z.number().int().positive().optional(),
		maxEntries: z.number().int().positive().optional(),
		rotateBytes: z.union([z.string(), z.number()]).optional()
	}).strict().superRefine((val, ctx) => {
		if (val.pruneAfter !== void 0) try {
			parseDurationMs(String(val.pruneAfter).trim(), { defaultUnit: "d" });
		} catch {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["pruneAfter"],
				message: "invalid duration (use ms, s, m, h, d)"
			});
		}
		if (val.rotateBytes !== void 0) try {
			parseByteSize(String(val.rotateBytes).trim(), { defaultUnit: "b" });
		} catch {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["rotateBytes"],
				message: "invalid size (use b, kb, mb, gb, tb)"
			});
		}
	}).optional()
}).strict().optional();
const MessagesSchema = z.object({
	messagePrefix: z.string().optional(),
	responsePrefix: z.string().optional(),
	groupChat: GroupChatSchema,
	queue: QueueSchema,
	inbound: InboundDebounceSchema,
	ackReaction: z.string().optional(),
	ackReactionScope: z.enum([
		"group-mentions",
		"group-all",
		"direct",
		"all"
	]).optional(),
	removeAckAfterReply: z.boolean().optional(),
	tts: TtsConfigSchema
}).strict().optional();
const CommandsSchema = z.object({
	native: NativeCommandsSettingSchema.optional().default("auto"),
	nativeSkills: NativeCommandsSettingSchema.optional().default("auto"),
	text: z.boolean().optional(),
	bash: z.boolean().optional(),
	bashForegroundMs: z.number().int().min(0).max(3e4).optional(),
	config: z.boolean().optional(),
	debug: z.boolean().optional(),
	restart: z.boolean().optional(),
	useAccessGroups: z.boolean().optional(),
	ownerAllowFrom: z.array(z.union([z.string(), z.number()])).optional(),
	allowFrom: ElevatedAllowFromSchema.optional()
}).strict().optional().default({
	native: "auto",
	nativeSkills: "auto"
});

//#endregion
//#region src/config/zod-schema.ts
const BrowserSnapshotDefaultsSchema = z.object({ mode: z.literal("efficient").optional() }).strict().optional();
const NodeHostSchema = z.object({ browserProxy: z.object({
	enabled: z.boolean().optional(),
	allowProfiles: z.array(z.string()).optional()
}).strict().optional() }).strict().optional();
const MemoryQmdPathSchema = z.object({
	path: z.string(),
	name: z.string().optional(),
	pattern: z.string().optional()
}).strict();
const MemoryQmdSessionSchema = z.object({
	enabled: z.boolean().optional(),
	exportDir: z.string().optional(),
	retentionDays: z.number().int().nonnegative().optional()
}).strict();
const MemoryQmdUpdateSchema = z.object({
	interval: z.string().optional(),
	debounceMs: z.number().int().nonnegative().optional(),
	onBoot: z.boolean().optional(),
	waitForBootSync: z.boolean().optional(),
	embedInterval: z.string().optional(),
	commandTimeoutMs: z.number().int().nonnegative().optional(),
	updateTimeoutMs: z.number().int().nonnegative().optional(),
	embedTimeoutMs: z.number().int().nonnegative().optional()
}).strict();
const MemoryQmdLimitsSchema = z.object({
	maxResults: z.number().int().positive().optional(),
	maxSnippetChars: z.number().int().positive().optional(),
	maxInjectedChars: z.number().int().positive().optional(),
	timeoutMs: z.number().int().nonnegative().optional()
}).strict();
const MemoryQmdSchema = z.object({
	command: z.string().optional(),
	searchMode: z.union([
		z.literal("query"),
		z.literal("search"),
		z.literal("vsearch")
	]).optional(),
	includeDefaultMemory: z.boolean().optional(),
	paths: z.array(MemoryQmdPathSchema).optional(),
	sessions: MemoryQmdSessionSchema.optional(),
	update: MemoryQmdUpdateSchema.optional(),
	limits: MemoryQmdLimitsSchema.optional(),
	scope: SessionSendPolicySchema.optional()
}).strict();
const MemorySchema = z.object({
	backend: z.union([z.literal("builtin"), z.literal("qmd")]).optional(),
	citations: z.union([
		z.literal("auto"),
		z.literal("on"),
		z.literal("off")
	]).optional(),
	qmd: MemoryQmdSchema.optional()
}).strict().optional();
const OpenClawSchema = z.object({
	$schema: z.string().optional(),
	meta: z.object({
		lastTouchedVersion: z.string().optional(),
		lastTouchedAt: z.string().optional()
	}).strict().optional(),
	env: z.object({
		shellEnv: z.object({
			enabled: z.boolean().optional(),
			timeoutMs: z.number().int().nonnegative().optional()
		}).strict().optional(),
		vars: z.record(z.string(), z.string()).optional()
	}).catchall(z.string()).optional(),
	wizard: z.object({
		lastRunAt: z.string().optional(),
		lastRunVersion: z.string().optional(),
		lastRunCommit: z.string().optional(),
		lastRunCommand: z.string().optional(),
		lastRunMode: z.union([z.literal("local"), z.literal("remote")]).optional()
	}).strict().optional(),
	diagnostics: z.object({
		enabled: z.boolean().optional(),
		flags: z.array(z.string()).optional(),
		otel: z.object({
			enabled: z.boolean().optional(),
			endpoint: z.string().optional(),
			protocol: z.union([z.literal("http/protobuf"), z.literal("grpc")]).optional(),
			headers: z.record(z.string(), z.string()).optional(),
			serviceName: z.string().optional(),
			traces: z.boolean().optional(),
			metrics: z.boolean().optional(),
			logs: z.boolean().optional(),
			sampleRate: z.number().min(0).max(1).optional(),
			flushIntervalMs: z.number().int().nonnegative().optional()
		}).strict().optional(),
		cacheTrace: z.object({
			enabled: z.boolean().optional(),
			filePath: z.string().optional(),
			includeMessages: z.boolean().optional(),
			includePrompt: z.boolean().optional(),
			includeSystem: z.boolean().optional()
		}).strict().optional()
	}).strict().optional(),
	logging: z.object({
		level: z.union([
			z.literal("silent"),
			z.literal("fatal"),
			z.literal("error"),
			z.literal("warn"),
			z.literal("info"),
			z.literal("debug"),
			z.literal("trace")
		]).optional(),
		file: z.string().optional(),
		consoleLevel: z.union([
			z.literal("silent"),
			z.literal("fatal"),
			z.literal("error"),
			z.literal("warn"),
			z.literal("info"),
			z.literal("debug"),
			z.literal("trace")
		]).optional(),
		consoleStyle: z.union([
			z.literal("pretty"),
			z.literal("compact"),
			z.literal("json")
		]).optional(),
		redactSensitive: z.union([z.literal("off"), z.literal("tools")]).optional(),
		redactPatterns: z.array(z.string()).optional()
	}).strict().optional(),
	update: z.object({
		channel: z.union([
			z.literal("stable"),
			z.literal("beta"),
			z.literal("dev")
		]).optional(),
		checkOnStart: z.boolean().optional()
	}).strict().optional(),
	browser: z.object({
		enabled: z.boolean().optional(),
		evaluateEnabled: z.boolean().optional(),
		cdpUrl: z.string().optional(),
		remoteCdpTimeoutMs: z.number().int().nonnegative().optional(),
		remoteCdpHandshakeTimeoutMs: z.number().int().nonnegative().optional(),
		color: z.string().optional(),
		executablePath: z.string().optional(),
		headless: z.boolean().optional(),
		noSandbox: z.boolean().optional(),
		attachOnly: z.boolean().optional(),
		defaultProfile: z.string().optional(),
		snapshotDefaults: BrowserSnapshotDefaultsSchema,
		profiles: z.record(z.string().regex(/^[a-z0-9-]+$/, "Profile names must be alphanumeric with hyphens only"), z.object({
			cdpPort: z.number().int().min(1).max(65535).optional(),
			cdpUrl: z.string().optional(),
			driver: z.union([z.literal("clawd"), z.literal("extension")]).optional(),
			color: HexColorSchema
		}).strict().refine((value) => value.cdpPort || value.cdpUrl, { message: "Profile must set cdpPort or cdpUrl" })).optional()
	}).strict().optional(),
	ui: z.object({
		seamColor: HexColorSchema.optional(),
		assistant: z.object({
			name: z.string().max(50).optional(),
			avatar: z.string().max(200).optional()
		}).strict().optional()
	}).strict().optional(),
	auth: z.object({
		profiles: z.record(z.string(), z.object({
			provider: z.string(),
			mode: z.union([
				z.literal("api_key"),
				z.literal("oauth"),
				z.literal("token")
			]),
			email: z.string().optional()
		}).strict()).optional(),
		order: z.record(z.string(), z.array(z.string())).optional(),
		cooldowns: z.object({
			billingBackoffHours: z.number().positive().optional(),
			billingBackoffHoursByProvider: z.record(z.string(), z.number().positive()).optional(),
			billingMaxHours: z.number().positive().optional(),
			failureWindowHours: z.number().positive().optional()
		}).strict().optional()
	}).strict().optional(),
	models: ModelsConfigSchema,
	nodeHost: NodeHostSchema,
	agents: AgentsSchema,
	tools: ToolsSchema,
	bindings: BindingsSchema,
	broadcast: BroadcastSchema,
	audio: AudioSchema,
	media: z.object({ preserveFilenames: z.boolean().optional() }).strict().optional(),
	messages: MessagesSchema,
	commands: CommandsSchema,
	approvals: ApprovalsSchema,
	session: SessionSchema,
	cron: z.object({
		enabled: z.boolean().optional(),
		store: z.string().optional(),
		maxConcurrentRuns: z.number().int().positive().optional(),
		sessionRetention: z.union([z.string(), z.literal(false)]).optional()
	}).strict().optional(),
	hooks: z.object({
		enabled: z.boolean().optional(),
		path: z.string().optional(),
		token: z.string().optional().register(sensitive),
		defaultSessionKey: z.string().optional(),
		allowRequestSessionKey: z.boolean().optional(),
		allowedSessionKeyPrefixes: z.array(z.string()).optional(),
		allowedAgentIds: z.array(z.string()).optional(),
		maxBodyBytes: z.number().int().positive().optional(),
		presets: z.array(z.string()).optional(),
		transformsDir: z.string().optional(),
		mappings: z.array(HookMappingSchema).optional(),
		gmail: HooksGmailSchema,
		internal: InternalHooksSchema
	}).strict().optional(),
	web: z.object({
		enabled: z.boolean().optional(),
		heartbeatSeconds: z.number().int().positive().optional(),
		reconnect: z.object({
			initialMs: z.number().positive().optional(),
			maxMs: z.number().positive().optional(),
			factor: z.number().positive().optional(),
			jitter: z.number().min(0).max(1).optional(),
			maxAttempts: z.number().int().min(0).optional()
		}).strict().optional()
	}).strict().optional(),
	channels: ChannelsSchema,
	discovery: z.object({
		wideArea: z.object({ enabled: z.boolean().optional() }).strict().optional(),
		mdns: z.object({ mode: z.enum([
			"off",
			"minimal",
			"full"
		]).optional() }).strict().optional()
	}).strict().optional(),
	canvasHost: z.object({
		enabled: z.boolean().optional(),
		root: z.string().optional(),
		port: z.number().int().positive().optional(),
		liveReload: z.boolean().optional()
	}).strict().optional(),
	talk: z.object({
		voiceId: z.string().optional(),
		voiceAliases: z.record(z.string(), z.string()).optional(),
		modelId: z.string().optional(),
		outputFormat: z.string().optional(),
		apiKey: z.string().optional().register(sensitive),
		interruptOnSpeech: z.boolean().optional()
	}).strict().optional(),
	gateway: z.object({
		port: z.number().int().positive().optional(),
		mode: z.union([z.literal("local"), z.literal("remote")]).optional(),
		bind: z.union([
			z.literal("auto"),
			z.literal("lan"),
			z.literal("loopback"),
			z.literal("custom"),
			z.literal("tailnet")
		]).optional(),
		controlUi: z.object({
			enabled: z.boolean().optional(),
			basePath: z.string().optional(),
			root: z.string().optional(),
			allowedOrigins: z.array(z.string()).optional(),
			allowInsecureAuth: z.boolean().optional(),
			dangerouslyDisableDeviceAuth: z.boolean().optional()
		}).strict().optional(),
		auth: z.object({
			mode: z.union([z.literal("token"), z.literal("password")]).optional(),
			token: z.string().optional().register(sensitive),
			password: z.string().optional().register(sensitive),
			allowTailscale: z.boolean().optional()
		}).strict().optional(),
		trustedProxies: z.array(z.string()).optional(),
		tools: z.object({
			deny: z.array(z.string()).optional(),
			allow: z.array(z.string()).optional()
		}).strict().optional(),
		tailscale: z.object({
			mode: z.union([
				z.literal("off"),
				z.literal("serve"),
				z.literal("funnel")
			]).optional(),
			resetOnExit: z.boolean().optional()
		}).strict().optional(),
		remote: z.object({
			url: z.string().optional(),
			transport: z.union([z.literal("ssh"), z.literal("direct")]).optional(),
			token: z.string().optional().register(sensitive),
			password: z.string().optional().register(sensitive),
			tlsFingerprint: z.string().optional(),
			sshTarget: z.string().optional(),
			sshIdentity: z.string().optional()
		}).strict().optional(),
		reload: z.object({
			mode: z.union([
				z.literal("off"),
				z.literal("restart"),
				z.literal("hot"),
				z.literal("hybrid")
			]).optional(),
			debounceMs: z.number().int().min(0).optional()
		}).strict().optional(),
		tls: z.object({
			enabled: z.boolean().optional(),
			autoGenerate: z.boolean().optional(),
			certPath: z.string().optional(),
			keyPath: z.string().optional(),
			caPath: z.string().optional()
		}).optional(),
		http: z.object({ endpoints: z.object({
			chatCompletions: z.object({ enabled: z.boolean().optional() }).strict().optional(),
			responses: z.object({
				enabled: z.boolean().optional(),
				maxBodyBytes: z.number().int().positive().optional(),
				maxUrlParts: z.number().int().nonnegative().optional(),
				files: z.object({
					allowUrl: z.boolean().optional(),
					urlAllowlist: z.array(z.string()).optional(),
					allowedMimes: z.array(z.string()).optional(),
					maxBytes: z.number().int().positive().optional(),
					maxChars: z.number().int().positive().optional(),
					maxRedirects: z.number().int().nonnegative().optional(),
					timeoutMs: z.number().int().positive().optional(),
					pdf: z.object({
						maxPages: z.number().int().positive().optional(),
						maxPixels: z.number().int().positive().optional(),
						minTextChars: z.number().int().nonnegative().optional()
					}).strict().optional()
				}).strict().optional(),
				images: z.object({
					allowUrl: z.boolean().optional(),
					urlAllowlist: z.array(z.string()).optional(),
					allowedMimes: z.array(z.string()).optional(),
					maxBytes: z.number().int().positive().optional(),
					maxRedirects: z.number().int().nonnegative().optional(),
					timeoutMs: z.number().int().positive().optional()
				}).strict().optional()
			}).strict().optional()
		}).strict().optional() }).strict().optional(),
		nodes: z.object({
			browser: z.object({
				mode: z.union([
					z.literal("auto"),
					z.literal("manual"),
					z.literal("off")
				]).optional(),
				node: z.string().optional()
			}).strict().optional(),
			allowCommands: z.array(z.string()).optional(),
			denyCommands: z.array(z.string()).optional()
		}).strict().optional()
	}).strict().optional(),
	memory: MemorySchema,
	skills: z.object({
		allowBundled: z.array(z.string()).optional(),
		load: z.object({
			extraDirs: z.array(z.string()).optional(),
			watch: z.boolean().optional(),
			watchDebounceMs: z.number().int().min(0).optional()
		}).strict().optional(),
		install: z.object({
			preferBrew: z.boolean().optional(),
			nodeManager: z.union([
				z.literal("npm"),
				z.literal("pnpm"),
				z.literal("yarn"),
				z.literal("bun")
			]).optional()
		}).strict().optional(),
		entries: z.record(z.string(), z.object({
			enabled: z.boolean().optional(),
			apiKey: z.string().optional().register(sensitive),
			env: z.record(z.string(), z.string()).optional(),
			config: z.record(z.string(), z.unknown()).optional()
		}).strict()).optional()
	}).strict().optional(),
	plugins: z.object({
		enabled: z.boolean().optional(),
		allow: z.array(z.string()).optional(),
		deny: z.array(z.string()).optional(),
		load: z.object({ paths: z.array(z.string()).optional() }).strict().optional(),
		slots: z.object({ memory: z.string().optional() }).strict().optional(),
		entries: z.record(z.string(), z.object({
			enabled: z.boolean().optional(),
			config: z.record(z.string(), z.unknown()).optional()
		}).strict()).optional(),
		installs: z.record(z.string(), z.object({
			source: z.union([
				z.literal("npm"),
				z.literal("archive"),
				z.literal("path")
			]),
			spec: z.string().optional(),
			sourcePath: z.string().optional(),
			installPath: z.string().optional(),
			version: z.string().optional(),
			installedAt: z.string().optional()
		}).strict()).optional()
	}).strict().optional()
}).strict().superRefine((cfg, ctx) => {
	const agents = cfg.agents?.list ?? [];
	if (agents.length === 0) return;
	const agentIds = new Set(agents.map((agent) => agent.id));
	const broadcast = cfg.broadcast;
	if (!broadcast) return;
	for (const [peerId, ids] of Object.entries(broadcast)) {
		if (peerId === "strategy") continue;
		if (!Array.isArray(ids)) continue;
		for (let idx = 0; idx < ids.length; idx += 1) {
			const agentId = ids[idx];
			if (!agentIds.has(agentId)) ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: [
					"broadcast",
					peerId,
					idx
				],
				message: `Unknown agent id "${agentId}" (not in agents.list).`
			});
		}
	}
});

//#endregion
//#region src/config/validation.ts
const AVATAR_SCHEME_RE = /^[a-z][a-z0-9+.-]*:/i;
const AVATAR_DATA_RE = /^data:/i;
const AVATAR_HTTP_RE = /^https?:\/\//i;
const WINDOWS_ABS_RE = /^[a-zA-Z]:[\\/]/;
function isWorkspaceAvatarPath(value, workspaceDir) {
	const workspaceRoot = path.resolve(workspaceDir);
	const resolved = path.resolve(workspaceRoot, value);
	const relative = path.relative(workspaceRoot, resolved);
	if (relative === "") return true;
	if (relative.startsWith("..")) return false;
	return !path.isAbsolute(relative);
}
function validateIdentityAvatar(config) {
	const agents = config.agents?.list;
	if (!Array.isArray(agents) || agents.length === 0) return [];
	const issues = [];
	for (const [index, entry] of agents.entries()) {
		if (!entry || typeof entry !== "object") continue;
		const avatarRaw = entry.identity?.avatar;
		if (typeof avatarRaw !== "string") continue;
		const avatar = avatarRaw.trim();
		if (!avatar) continue;
		if (AVATAR_DATA_RE.test(avatar) || AVATAR_HTTP_RE.test(avatar)) continue;
		if (avatar.startsWith("~")) {
			issues.push({
				path: `agents.list.${index}.identity.avatar`,
				message: "identity.avatar must be a workspace-relative path, http(s) URL, or data URI."
			});
			continue;
		}
		if (AVATAR_SCHEME_RE.test(avatar) && !WINDOWS_ABS_RE.test(avatar)) {
			issues.push({
				path: `agents.list.${index}.identity.avatar`,
				message: "identity.avatar must be a workspace-relative path, http(s) URL, or data URI."
			});
			continue;
		}
		if (!isWorkspaceAvatarPath(avatar, resolveAgentWorkspaceDir(config, entry.id ?? resolveDefaultAgentId(config)))) issues.push({
			path: `agents.list.${index}.identity.avatar`,
			message: "identity.avatar must stay within the agent workspace."
		});
	}
	return issues;
}
/**
* Validates config without applying runtime defaults.
* Use this when you need the raw validated config (e.g., for writing back to file).
*/
function validateConfigObjectRaw(raw) {
	const legacyIssues = findLegacyConfigIssues(raw);
	if (legacyIssues.length > 0) return {
		ok: false,
		issues: legacyIssues.map((iss) => ({
			path: iss.path,
			message: iss.message
		}))
	};
	const validated = OpenClawSchema.safeParse(raw);
	if (!validated.success) return {
		ok: false,
		issues: validated.error.issues.map((iss) => ({
			path: iss.path.join("."),
			message: iss.message
		}))
	};
	const duplicates = findDuplicateAgentDirs(validated.data);
	if (duplicates.length > 0) return {
		ok: false,
		issues: [{
			path: "agents.list",
			message: formatDuplicateAgentDirError(duplicates)
		}]
	};
	const avatarIssues = validateIdentityAvatar(validated.data);
	if (avatarIssues.length > 0) return {
		ok: false,
		issues: avatarIssues
	};
	return {
		ok: true,
		config: validated.data
	};
}
function validateConfigObject(raw) {
	const result = validateConfigObjectRaw(raw);
	if (!result.ok) return result;
	return {
		ok: true,
		config: applyModelDefaults(applyAgentDefaults(applySessionDefaults(result.config)))
	};
}
function validateConfigObjectWithPlugins(raw) {
	return validateConfigObjectWithPluginsBase(raw, { applyDefaults: true });
}
function validateConfigObjectRawWithPlugins(raw) {
	return validateConfigObjectWithPluginsBase(raw, { applyDefaults: false });
}
function validateConfigObjectWithPluginsBase(raw, opts) {
	const base = opts.applyDefaults ? validateConfigObject(raw) : validateConfigObjectRaw(raw);
	if (!base.ok) return {
		ok: false,
		issues: base.issues,
		warnings: []
	};
	const config = base.config;
	const issues = [];
	const warnings = [];
	const pluginsConfig = config.plugins;
	const normalizedPlugins = normalizePluginsConfig(pluginsConfig);
	const registry = loadPluginManifestRegistry({
		config,
		workspaceDir: resolveAgentWorkspaceDir(config, resolveDefaultAgentId(config)) ?? void 0
	});
	const knownIds = new Set(registry.plugins.map((record) => record.id));
	for (const diag of registry.diagnostics) {
		let path = diag.pluginId ? `plugins.entries.${diag.pluginId}` : "plugins";
		if (!diag.pluginId && diag.message.includes("plugin path not found")) path = "plugins.load.paths";
		const message = `${diag.pluginId ? `plugin ${diag.pluginId}` : "plugin"}: ${diag.message}`;
		if (diag.level === "error") issues.push({
			path,
			message
		});
		else warnings.push({
			path,
			message
		});
	}
	const entries = pluginsConfig?.entries;
	if (entries && isRecord(entries)) {
		for (const pluginId of Object.keys(entries)) if (!knownIds.has(pluginId)) issues.push({
			path: `plugins.entries.${pluginId}`,
			message: `plugin not found: ${pluginId}`
		});
	}
	const allow = pluginsConfig?.allow ?? [];
	for (const pluginId of allow) {
		if (typeof pluginId !== "string" || !pluginId.trim()) continue;
		if (!knownIds.has(pluginId)) issues.push({
			path: "plugins.allow",
			message: `plugin not found: ${pluginId}`
		});
	}
	const deny = pluginsConfig?.deny ?? [];
	for (const pluginId of deny) {
		if (typeof pluginId !== "string" || !pluginId.trim()) continue;
		if (!knownIds.has(pluginId)) issues.push({
			path: "plugins.deny",
			message: `plugin not found: ${pluginId}`
		});
	}
	const memorySlot = normalizedPlugins.slots.memory;
	if (typeof memorySlot === "string" && memorySlot.trim() && !knownIds.has(memorySlot)) issues.push({
		path: "plugins.slots.memory",
		message: `plugin not found: ${memorySlot}`
	});
	const allowedChannels = new Set(["defaults", ...CHANNEL_IDS]);
	for (const record of registry.plugins) for (const channelId of record.channels) allowedChannels.add(channelId);
	if (config.channels && isRecord(config.channels)) for (const key of Object.keys(config.channels)) {
		const trimmed = key.trim();
		if (!trimmed) continue;
		if (!allowedChannels.has(trimmed)) issues.push({
			path: `channels.${trimmed}`,
			message: `unknown channel id: ${trimmed}`
		});
	}
	const heartbeatChannelIds = /* @__PURE__ */ new Set();
	for (const channelId of CHANNEL_IDS) heartbeatChannelIds.add(channelId.toLowerCase());
	for (const record of registry.plugins) for (const channelId of record.channels) {
		const trimmed = channelId.trim();
		if (trimmed) heartbeatChannelIds.add(trimmed.toLowerCase());
	}
	const validateHeartbeatTarget = (target, path) => {
		if (typeof target !== "string") return;
		const trimmed = target.trim();
		if (!trimmed) {
			issues.push({
				path,
				message: "heartbeat target must not be empty"
			});
			return;
		}
		const normalized = trimmed.toLowerCase();
		if (normalized === "last" || normalized === "none") return;
		if (normalizeChatChannelId(trimmed)) return;
		if (heartbeatChannelIds.has(normalized)) return;
		issues.push({
			path,
			message: `unknown heartbeat target: ${target}`
		});
	};
	validateHeartbeatTarget(config.agents?.defaults?.heartbeat?.target, "agents.defaults.heartbeat.target");
	if (Array.isArray(config.agents?.list)) for (const [index, entry] of config.agents.list.entries()) validateHeartbeatTarget(entry?.heartbeat?.target, `agents.list.${index}.heartbeat.target`);
	let selectedMemoryPluginId = null;
	const seenPlugins = /* @__PURE__ */ new Set();
	for (const record of registry.plugins) {
		const pluginId = record.id;
		if (seenPlugins.has(pluginId)) continue;
		seenPlugins.add(pluginId);
		const entry = normalizedPlugins.entries[pluginId];
		const entryHasConfig = Boolean(entry?.config);
		const enableState = resolveEnableState(pluginId, record.origin, normalizedPlugins);
		let enabled = enableState.enabled;
		let reason = enableState.reason;
		if (enabled) {
			const memoryDecision = resolveMemorySlotDecision({
				id: pluginId,
				kind: record.kind,
				slot: memorySlot,
				selectedId: selectedMemoryPluginId
			});
			if (!memoryDecision.enabled) {
				enabled = false;
				reason = memoryDecision.reason;
			}
			if (memoryDecision.selected && record.kind === "memory") selectedMemoryPluginId = pluginId;
		}
		if (enabled || entryHasConfig) if (record.configSchema) {
			const res = validateJsonSchemaValue({
				schema: record.configSchema,
				cacheKey: record.schemaCacheKey ?? record.manifestPath ?? pluginId,
				value: entry?.config ?? {}
			});
			if (!res.ok) for (const error of res.errors) issues.push({
				path: `plugins.entries.${pluginId}.config`,
				message: `invalid config: ${error}`
			});
		} else issues.push({
			path: `plugins.entries.${pluginId}`,
			message: `plugin schema missing for ${pluginId}`
		});
		if (!enabled && entryHasConfig) warnings.push({
			path: `plugins.entries.${pluginId}`,
			message: `plugin disabled (${reason ?? "disabled"}) but config is present`
		});
	}
	if (issues.length > 0) return {
		ok: false,
		issues,
		warnings
	};
	return {
		ok: true,
		config,
		warnings
	};
}

//#endregion
//#region src/config/version.ts
const VERSION_RE = /^v?(\d+)\.(\d+)\.(\d+)(?:-(\d+))?/;
function parseOpenClawVersion(raw) {
	if (!raw) return null;
	const match = raw.trim().match(VERSION_RE);
	if (!match) return null;
	const [, major, minor, patch, revision] = match;
	return {
		major: Number.parseInt(major, 10),
		minor: Number.parseInt(minor, 10),
		patch: Number.parseInt(patch, 10),
		revision: revision ? Number.parseInt(revision, 10) : 0
	};
}
function compareOpenClawVersions(a, b) {
	const parsedA = parseOpenClawVersion(a);
	const parsedB = parseOpenClawVersion(b);
	if (!parsedA || !parsedB) return null;
	if (parsedA.major !== parsedB.major) return parsedA.major < parsedB.major ? -1 : 1;
	if (parsedA.minor !== parsedB.minor) return parsedA.minor < parsedB.minor ? -1 : 1;
	if (parsedA.patch !== parsedB.patch) return parsedA.patch < parsedB.patch ? -1 : 1;
	if (parsedA.revision !== parsedB.revision) return parsedA.revision < parsedB.revision ? -1 : 1;
	return 0;
}

//#endregion
//#region src/config/io.ts
const SHELL_ENV_EXPECTED_KEYS = [
	"OPENAI_API_KEY",
	"ANTHROPIC_API_KEY",
	"ANTHROPIC_OAUTH_TOKEN",
	"GEMINI_API_KEY",
	"ZAI_API_KEY",
	"OPENROUTER_API_KEY",
	"AI_GATEWAY_API_KEY",
	"MINIMAX_API_KEY",
	"SYNTHETIC_API_KEY",
	"ELEVENLABS_API_KEY",
	"TELEGRAM_BOT_TOKEN",
	"DISCORD_BOT_TOKEN",
	"SLACK_BOT_TOKEN",
	"SLACK_APP_TOKEN",
	"OPENCLAW_GATEWAY_TOKEN",
	"OPENCLAW_GATEWAY_PASSWORD"
];
const CONFIG_BACKUP_COUNT = 5;
const CONFIG_AUDIT_LOG_FILENAME = "config-audit.jsonl";
const loggedInvalidConfigs = /* @__PURE__ */ new Set();
function hashConfigRaw(raw) {
	return crypto.createHash("sha256").update(raw ?? "").digest("hex");
}
function resolveConfigSnapshotHash(snapshot) {
	if (typeof snapshot.hash === "string") {
		const trimmed = snapshot.hash.trim();
		if (trimmed) return trimmed;
	}
	if (typeof snapshot.raw !== "string") return null;
	return hashConfigRaw(snapshot.raw);
}
function coerceConfig(value) {
	if (!value || typeof value !== "object" || Array.isArray(value)) return {};
	return value;
}
function isPlainObject(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
function hasConfigMeta(value) {
	if (!isPlainObject(value)) return false;
	const meta = value.meta;
	return isPlainObject(meta);
}
function resolveGatewayMode(value) {
	if (!isPlainObject(value)) return null;
	const gateway = value.gateway;
	if (!isPlainObject(gateway) || typeof gateway.mode !== "string") return null;
	const trimmed = gateway.mode.trim();
	return trimmed.length > 0 ? trimmed : null;
}
function cloneUnknown(value) {
	return structuredClone(value);
}
function createMergePatch(base, target) {
	if (!isPlainObject(base) || !isPlainObject(target)) return cloneUnknown(target);
	const patch = {};
	const keys = new Set([...Object.keys(base), ...Object.keys(target)]);
	for (const key of keys) {
		const hasBase = key in base;
		if (!(key in target)) {
			patch[key] = null;
			continue;
		}
		const targetValue = target[key];
		if (!hasBase) {
			patch[key] = cloneUnknown(targetValue);
			continue;
		}
		const baseValue = base[key];
		if (isPlainObject(baseValue) && isPlainObject(targetValue)) {
			const childPatch = createMergePatch(baseValue, targetValue);
			if (isPlainObject(childPatch) && Object.keys(childPatch).length === 0) continue;
			patch[key] = childPatch;
			continue;
		}
		if (!isDeepStrictEqual(baseValue, targetValue)) patch[key] = cloneUnknown(targetValue);
	}
	return patch;
}
function collectEnvRefPaths(value, path, output) {
	if (typeof value === "string") {
		if (containsEnvVarReference(value)) output.set(path, value);
		return;
	}
	if (Array.isArray(value)) {
		value.forEach((item, index) => {
			collectEnvRefPaths(item, `${path}[${index}]`, output);
		});
		return;
	}
	if (isPlainObject(value)) for (const [key, child] of Object.entries(value)) collectEnvRefPaths(child, path ? `${path}.${key}` : key, output);
}
function collectChangedPaths(base, target, path, output) {
	if (Array.isArray(base) && Array.isArray(target)) {
		const max = Math.max(base.length, target.length);
		for (let index = 0; index < max; index += 1) {
			const childPath = path ? `${path}[${index}]` : `[${index}]`;
			if (index >= base.length || index >= target.length) {
				output.add(childPath);
				continue;
			}
			collectChangedPaths(base[index], target[index], childPath, output);
		}
		return;
	}
	if (isPlainObject(base) && isPlainObject(target)) {
		const keys = new Set([...Object.keys(base), ...Object.keys(target)]);
		for (const key of keys) {
			const childPath = path ? `${path}.${key}` : key;
			const hasBase = key in base;
			if (!(key in target) || !hasBase) {
				output.add(childPath);
				continue;
			}
			collectChangedPaths(base[key], target[key], childPath, output);
		}
		return;
	}
	if (!isDeepStrictEqual(base, target)) output.add(path);
}
function parentPath(value) {
	if (!value) return "";
	if (value.endsWith("]")) {
		const index = value.lastIndexOf("[");
		return index > 0 ? value.slice(0, index) : "";
	}
	const index = value.lastIndexOf(".");
	return index >= 0 ? value.slice(0, index) : "";
}
function isPathChanged(path, changedPaths) {
	if (changedPaths.has(path)) return true;
	let current = parentPath(path);
	while (current) {
		if (changedPaths.has(current)) return true;
		current = parentPath(current);
	}
	return changedPaths.has("");
}
function restoreEnvRefsFromMap(value, path, envRefMap, changedPaths) {
	if (typeof value === "string") {
		if (!isPathChanged(path, changedPaths)) {
			const original = envRefMap.get(path);
			if (original !== void 0) return original;
		}
		return value;
	}
	if (Array.isArray(value)) {
		let changed = false;
		const next = value.map((item, index) => {
			const updated = restoreEnvRefsFromMap(item, `${path}[${index}]`, envRefMap, changedPaths);
			if (updated !== item) changed = true;
			return updated;
		});
		return changed ? next : value;
	}
	if (isPlainObject(value)) {
		let changed = false;
		const next = {};
		for (const [key, child] of Object.entries(value)) {
			const updated = restoreEnvRefsFromMap(child, path ? `${path}.${key}` : key, envRefMap, changedPaths);
			if (updated !== child) changed = true;
			next[key] = updated;
		}
		return changed ? next : value;
	}
	return value;
}
async function rotateConfigBackups(configPath, ioFs) {
	if (CONFIG_BACKUP_COUNT <= 1) return;
	const backupBase = `${configPath}.bak`;
	const maxIndex = CONFIG_BACKUP_COUNT - 1;
	await ioFs.unlink(`${backupBase}.${maxIndex}`).catch(() => {});
	for (let index = maxIndex - 1; index >= 1; index -= 1) await ioFs.rename(`${backupBase}.${index}`, `${backupBase}.${index + 1}`).catch(() => {});
	await ioFs.rename(backupBase, `${backupBase}.1`).catch(() => {});
}
function resolveConfigAuditLogPath(env, homedir) {
	return path.join(resolveStateDir(env, homedir), "logs", CONFIG_AUDIT_LOG_FILENAME);
}
function resolveConfigWriteSuspiciousReasons(params) {
	const reasons = [];
	if (!params.existsBefore) return reasons;
	if (typeof params.previousBytes === "number" && typeof params.nextBytes === "number" && params.previousBytes >= 512 && params.nextBytes < Math.floor(params.previousBytes * .5)) reasons.push(`size-drop:${params.previousBytes}->${params.nextBytes}`);
	if (!params.hasMetaBefore) reasons.push("missing-meta-before-write");
	if (params.gatewayModeBefore && !params.gatewayModeAfter) reasons.push("gateway-mode-removed");
	return reasons;
}
async function appendConfigWriteAuditRecord(deps, record) {
	try {
		const auditPath = resolveConfigAuditLogPath(deps.env, deps.homedir);
		await deps.fs.promises.mkdir(path.dirname(auditPath), {
			recursive: true,
			mode: 448
		});
		await deps.fs.promises.appendFile(auditPath, `${JSON.stringify(record)}\n`, {
			encoding: "utf-8",
			mode: 384
		});
	} catch {}
}
function warnOnConfigMiskeys(raw, logger) {
	if (!raw || typeof raw !== "object") return;
	const gateway = raw.gateway;
	if (!gateway || typeof gateway !== "object") return;
	if ("token" in gateway) logger.warn("Config uses \"gateway.token\". This key is ignored; use \"gateway.auth.token\" instead.");
}
function stampConfigVersion(cfg) {
	const now = (/* @__PURE__ */ new Date()).toISOString();
	return {
		...cfg,
		meta: {
			...cfg.meta,
			lastTouchedVersion: VERSION,
			lastTouchedAt: now
		}
	};
}
function warnIfConfigFromFuture(cfg, logger) {
	const touched = cfg.meta?.lastTouchedVersion;
	if (!touched) return;
	const cmp = compareOpenClawVersions(VERSION, touched);
	if (cmp === null) return;
	if (cmp < 0) logger.warn(`Config was last written by a newer OpenClaw (${touched}); current version is ${VERSION}.`);
}
function applyConfigEnv(cfg, env) {
	const entries = collectConfigEnvVars(cfg);
	for (const [key, value] of Object.entries(entries)) {
		if (env[key]?.trim()) continue;
		env[key] = value;
	}
}
function resolveConfigPathForDeps(deps) {
	if (deps.configPath) return deps.configPath;
	return resolveConfigPath(deps.env, resolveStateDir(deps.env, deps.homedir));
}
function normalizeDeps(overrides = {}) {
	return {
		fs: overrides.fs ?? fs$1,
		json5: overrides.json5 ?? JSON5,
		env: overrides.env ?? process.env,
		homedir: overrides.homedir ?? (() => resolveRequiredHomeDir(overrides.env ?? process.env, os.homedir)),
		configPath: overrides.configPath ?? "",
		logger: overrides.logger ?? console
	};
}
function maybeLoadDotEnvForConfig(env) {
	if (env !== process.env) return;
	loadDotEnv({ quiet: true });
}
function parseConfigJson5(raw, json5 = JSON5) {
	try {
		return {
			ok: true,
			parsed: json5.parse(raw)
		};
	} catch (err) {
		return {
			ok: false,
			error: String(err)
		};
	}
}
function resolveConfigIncludesForRead(parsed, configPath, deps) {
	return resolveConfigIncludes(parsed, configPath, {
		readFile: (candidate) => deps.fs.readFileSync(candidate, "utf-8"),
		parseJson: (raw) => deps.json5.parse(raw)
	});
}
function resolveConfigForRead(resolvedIncludes, env) {
	if (resolvedIncludes && typeof resolvedIncludes === "object" && "env" in resolvedIncludes) applyConfigEnv(resolvedIncludes, env);
	return {
		resolvedConfigRaw: resolveConfigEnvVars(resolvedIncludes, env),
		envSnapshotForRestore: { ...env }
	};
}
function createConfigIO(overrides = {}) {
	const deps = normalizeDeps(overrides);
	const requestedConfigPath = resolveConfigPathForDeps(deps);
	const configPath = (deps.configPath ? [requestedConfigPath] : resolveDefaultConfigCandidates(deps.env, deps.homedir)).find((candidate) => deps.fs.existsSync(candidate)) ?? requestedConfigPath;
	function loadConfig() {
		try {
			maybeLoadDotEnvForConfig(deps.env);
			if (!deps.fs.existsSync(configPath)) {
				if (shouldEnableShellEnvFallback(deps.env) && !shouldDeferShellEnvFallback(deps.env)) loadShellEnvFallback({
					enabled: true,
					env: deps.env,
					expectedKeys: SHELL_ENV_EXPECTED_KEYS,
					logger: deps.logger,
					timeoutMs: resolveShellEnvFallbackTimeoutMs(deps.env)
				});
				return {};
			}
			const raw = deps.fs.readFileSync(configPath, "utf-8");
			const { resolvedConfigRaw: resolvedConfig } = resolveConfigForRead(resolveConfigIncludesForRead(deps.json5.parse(raw), configPath, deps), deps.env);
			warnOnConfigMiskeys(resolvedConfig, deps.logger);
			if (typeof resolvedConfig !== "object" || resolvedConfig === null) return {};
			const preValidationDuplicates = findDuplicateAgentDirs(resolvedConfig, {
				env: deps.env,
				homedir: deps.homedir
			});
			if (preValidationDuplicates.length > 0) throw new DuplicateAgentDirError(preValidationDuplicates);
			const validated = validateConfigObjectWithPlugins(resolvedConfig);
			if (!validated.ok) {
				const details = validated.issues.map((iss) => `- ${iss.path || "<root>"}: ${iss.message}`).join("\n");
				if (!loggedInvalidConfigs.has(configPath)) {
					loggedInvalidConfigs.add(configPath);
					deps.logger.error(`Invalid config at ${configPath}:\\n${details}`);
				}
				const error = /* @__PURE__ */ new Error("Invalid config");
				error.code = "INVALID_CONFIG";
				error.details = details;
				throw error;
			}
			if (validated.warnings.length > 0) {
				const details = validated.warnings.map((iss) => `- ${iss.path || "<root>"}: ${iss.message}`).join("\n");
				deps.logger.warn(`Config warnings:\\n${details}`);
			}
			warnIfConfigFromFuture(validated.config, deps.logger);
			const cfg = applyModelDefaults(applyCompactionDefaults(applyContextPruningDefaults(applyAgentDefaults(applySessionDefaults(applyLoggingDefaults(applyMessageDefaults(validated.config)))))));
			normalizeConfigPaths(cfg);
			const duplicates = findDuplicateAgentDirs(cfg, {
				env: deps.env,
				homedir: deps.homedir
			});
			if (duplicates.length > 0) throw new DuplicateAgentDirError(duplicates);
			applyConfigEnv(cfg, deps.env);
			if ((shouldEnableShellEnvFallback(deps.env) || cfg.env?.shellEnv?.enabled === true) && !shouldDeferShellEnvFallback(deps.env)) loadShellEnvFallback({
				enabled: true,
				env: deps.env,
				expectedKeys: SHELL_ENV_EXPECTED_KEYS,
				logger: deps.logger,
				timeoutMs: cfg.env?.shellEnv?.timeoutMs ?? resolveShellEnvFallbackTimeoutMs(deps.env)
			});
			return applyConfigOverrides(cfg);
		} catch (err) {
			if (err instanceof DuplicateAgentDirError) {
				deps.logger.error(err.message);
				throw err;
			}
			if (err?.code === "INVALID_CONFIG") return {};
			deps.logger.error(`Failed to read config at ${configPath}`, err);
			return {};
		}
	}
	async function readConfigFileSnapshotInternal() {
		maybeLoadDotEnvForConfig(deps.env);
		if (!deps.fs.existsSync(configPath)) {
			const hash = hashConfigRaw(null);
			return { snapshot: {
				path: configPath,
				exists: false,
				raw: null,
				parsed: {},
				resolved: {},
				valid: true,
				config: applyTalkApiKey(applyModelDefaults(applyCompactionDefaults(applyContextPruningDefaults(applyAgentDefaults(applySessionDefaults(applyMessageDefaults({}))))))),
				hash,
				issues: [],
				warnings: [],
				legacyIssues: []
			} };
		}
		try {
			const raw = deps.fs.readFileSync(configPath, "utf-8");
			const hash = hashConfigRaw(raw);
			const parsedRes = parseConfigJson5(raw, deps.json5);
			if (!parsedRes.ok) return { snapshot: {
				path: configPath,
				exists: true,
				raw,
				parsed: {},
				resolved: {},
				valid: false,
				config: {},
				hash,
				issues: [{
					path: "",
					message: `JSON5 parse failed: ${parsedRes.error}`
				}],
				warnings: [],
				legacyIssues: []
			} };
			let resolved;
			try {
				resolved = resolveConfigIncludesForRead(parsedRes.parsed, configPath, deps);
			} catch (err) {
				const message = err instanceof ConfigIncludeError ? err.message : `Include resolution failed: ${String(err)}`;
				return { snapshot: {
					path: configPath,
					exists: true,
					raw,
					parsed: parsedRes.parsed,
					resolved: coerceConfig(parsedRes.parsed),
					valid: false,
					config: coerceConfig(parsedRes.parsed),
					hash,
					issues: [{
						path: "",
						message
					}],
					warnings: [],
					legacyIssues: []
				} };
			}
			let readResolution;
			try {
				readResolution = resolveConfigForRead(resolved, deps.env);
			} catch (err) {
				const message = err instanceof MissingEnvVarError ? err.message : `Env var substitution failed: ${String(err)}`;
				return { snapshot: {
					path: configPath,
					exists: true,
					raw,
					parsed: parsedRes.parsed,
					resolved: coerceConfig(resolved),
					valid: false,
					config: coerceConfig(resolved),
					hash,
					issues: [{
						path: "",
						message
					}],
					warnings: [],
					legacyIssues: []
				} };
			}
			const resolvedConfigRaw = readResolution.resolvedConfigRaw;
			const legacyIssues = findLegacyConfigIssues(resolvedConfigRaw);
			const validated = validateConfigObjectWithPlugins(resolvedConfigRaw);
			if (!validated.ok) return { snapshot: {
				path: configPath,
				exists: true,
				raw,
				parsed: parsedRes.parsed,
				resolved: coerceConfig(resolvedConfigRaw),
				valid: false,
				config: coerceConfig(resolvedConfigRaw),
				hash,
				issues: validated.issues,
				warnings: validated.warnings,
				legacyIssues
			} };
			warnIfConfigFromFuture(validated.config, deps.logger);
			return {
				snapshot: {
					path: configPath,
					exists: true,
					raw,
					parsed: parsedRes.parsed,
					resolved: coerceConfig(resolvedConfigRaw),
					valid: true,
					config: normalizeConfigPaths(applyTalkApiKey(applyModelDefaults(applyAgentDefaults(applySessionDefaults(applyLoggingDefaults(applyMessageDefaults(validated.config))))))),
					hash,
					issues: [],
					warnings: validated.warnings,
					legacyIssues
				},
				envSnapshotForRestore: readResolution.envSnapshotForRestore
			};
		} catch (err) {
			return { snapshot: {
				path: configPath,
				exists: true,
				raw: null,
				parsed: {},
				resolved: {},
				valid: false,
				config: {},
				hash: hashConfigRaw(null),
				issues: [{
					path: "",
					message: `read failed: ${String(err)}`
				}],
				warnings: [],
				legacyIssues: []
			} };
		}
	}
	async function readConfigFileSnapshot() {
		return (await readConfigFileSnapshotInternal()).snapshot;
	}
	async function readConfigFileSnapshotForWrite() {
		const result = await readConfigFileSnapshotInternal();
		return {
			snapshot: result.snapshot,
			writeOptions: {
				envSnapshotForRestore: result.envSnapshotForRestore,
				expectedConfigPath: configPath
			}
		};
	}
	async function writeConfigFile(cfg, options = {}) {
		clearConfigCache();
		let persistCandidate = cfg;
		const { snapshot } = await readConfigFileSnapshotInternal();
		let envRefMap = null;
		let changedPaths = null;
		if (snapshot.valid && snapshot.exists) {
			const patch = createMergePatch(snapshot.config, cfg);
			persistCandidate = applyMergePatch(snapshot.resolved, patch);
			try {
				const resolvedIncludes = resolveConfigIncludes(snapshot.parsed, configPath, {
					readFile: (candidate) => deps.fs.readFileSync(candidate, "utf-8"),
					parseJson: (raw) => deps.json5.parse(raw)
				});
				const collected = /* @__PURE__ */ new Map();
				collectEnvRefPaths(resolvedIncludes, "", collected);
				if (collected.size > 0) {
					envRefMap = collected;
					changedPaths = /* @__PURE__ */ new Set();
					collectChangedPaths(snapshot.config, cfg, "", changedPaths);
				}
			} catch {
				envRefMap = null;
			}
		}
		const validated = validateConfigObjectRawWithPlugins(persistCandidate);
		if (!validated.ok) {
			const issue = validated.issues[0];
			const pathLabel = issue?.path ? issue.path : "<root>";
			throw new Error(`Config validation failed: ${pathLabel}: ${issue?.message ?? "invalid"}`);
		}
		if (validated.warnings.length > 0) {
			const details = validated.warnings.map((warning) => `- ${warning.path}: ${warning.message}`).join("\n");
			deps.logger.warn(`Config warnings:\n${details}`);
		}
		let cfgToWrite = validated.config;
		try {
			if (deps.fs.existsSync(configPath)) {
				const parsedRes = parseConfigJson5(await deps.fs.promises.readFile(configPath, "utf-8"), deps.json5);
				if (parsedRes.ok) {
					const envForRestore = options.envSnapshotForRestore ?? deps.env;
					cfgToWrite = restoreEnvVarRefs(cfgToWrite, parsedRes.parsed, envForRestore);
				}
			}
		} catch {}
		const dir = path.dirname(configPath);
		await deps.fs.promises.mkdir(dir, {
			recursive: true,
			mode: 448
		});
		const stampedOutputConfig = stampConfigVersion(envRefMap && changedPaths ? restoreEnvRefsFromMap(cfgToWrite, "", envRefMap, changedPaths) : cfgToWrite);
		const json = JSON.stringify(stampedOutputConfig, null, 2).trimEnd().concat("\n");
		const nextHash = hashConfigRaw(json);
		const previousHash = resolveConfigSnapshotHash(snapshot);
		const changedPathCount = changedPaths?.size;
		const previousBytes = typeof snapshot.raw === "string" ? Buffer.byteLength(snapshot.raw, "utf-8") : null;
		const nextBytes = Buffer.byteLength(json, "utf-8");
		const hasMetaBefore = hasConfigMeta(snapshot.parsed);
		const hasMetaAfter = hasConfigMeta(stampedOutputConfig);
		const gatewayModeBefore = resolveGatewayMode(snapshot.resolved);
		const gatewayModeAfter = resolveGatewayMode(stampedOutputConfig);
		const suspiciousReasons = resolveConfigWriteSuspiciousReasons({
			existsBefore: snapshot.exists,
			previousBytes,
			nextBytes,
			hasMetaBefore,
			gatewayModeBefore,
			gatewayModeAfter
		});
		const logConfigOverwrite = () => {
			if (!snapshot.exists) return;
			const isVitest = deps.env.VITEST === "true";
			const shouldLogInVitest = deps.env.OPENCLAW_TEST_CONFIG_OVERWRITE_LOG === "1";
			if (isVitest && !shouldLogInVitest) return;
			const changeSummary = typeof changedPathCount === "number" ? `, changedPaths=${changedPathCount}` : "";
			deps.logger.warn(`Config overwrite: ${configPath} (sha256 ${previousHash ?? "unknown"} -> ${nextHash}, backup=${configPath}.bak${changeSummary})`);
		};
		const logConfigWriteAnomalies = () => {
			if (suspiciousReasons.length === 0) return;
			deps.logger.warn(`Config write anomaly: ${configPath} (${suspiciousReasons.join(", ")})`);
		};
		const auditRecordBase = {
			ts: (/* @__PURE__ */ new Date()).toISOString(),
			source: "config-io",
			event: "config.write",
			configPath,
			pid: process.pid,
			ppid: process.ppid,
			cwd: process.cwd(),
			argv: process.argv.slice(0, 8),
			execArgv: process.execArgv.slice(0, 8),
			watchMode: deps.env.OPENCLAW_WATCH_MODE === "1",
			watchSession: typeof deps.env.OPENCLAW_WATCH_SESSION === "string" && deps.env.OPENCLAW_WATCH_SESSION.trim().length > 0 ? deps.env.OPENCLAW_WATCH_SESSION.trim() : null,
			watchCommand: typeof deps.env.OPENCLAW_WATCH_COMMAND === "string" && deps.env.OPENCLAW_WATCH_COMMAND.trim().length > 0 ? deps.env.OPENCLAW_WATCH_COMMAND.trim() : null,
			existsBefore: snapshot.exists,
			previousHash: previousHash ?? null,
			nextHash,
			previousBytes,
			nextBytes,
			changedPathCount: typeof changedPathCount === "number" ? changedPathCount : null,
			hasMetaBefore,
			hasMetaAfter,
			gatewayModeBefore,
			gatewayModeAfter,
			suspicious: suspiciousReasons
		};
		const appendWriteAudit = async (result, err) => {
			const errorCode = err && typeof err === "object" && "code" in err && typeof err.code === "string" ? err.code : void 0;
			const errorMessage = err && typeof err === "object" && "message" in err && typeof err.message === "string" ? err.message : void 0;
			await appendConfigWriteAuditRecord(deps, {
				...auditRecordBase,
				result,
				nextHash: result === "failed" ? null : auditRecordBase.nextHash,
				nextBytes: result === "failed" ? null : auditRecordBase.nextBytes,
				errorCode,
				errorMessage
			});
		};
		const tmp = path.join(dir, `${path.basename(configPath)}.${process.pid}.${crypto.randomUUID()}.tmp`);
		try {
			await deps.fs.promises.writeFile(tmp, json, {
				encoding: "utf-8",
				mode: 384
			});
			if (deps.fs.existsSync(configPath)) {
				await rotateConfigBackups(configPath, deps.fs.promises);
				await deps.fs.promises.copyFile(configPath, `${configPath}.bak`).catch(() => {});
			}
			try {
				await deps.fs.promises.rename(tmp, configPath);
			} catch (err) {
				const code = err.code;
				if (code === "EPERM" || code === "EEXIST") {
					await deps.fs.promises.copyFile(tmp, configPath);
					await deps.fs.promises.chmod(configPath, 384).catch(() => {});
					await deps.fs.promises.unlink(tmp).catch(() => {});
					logConfigOverwrite();
					logConfigWriteAnomalies();
					await appendWriteAudit("copy-fallback");
					return;
				}
				await deps.fs.promises.unlink(tmp).catch(() => {});
				throw err;
			}
			logConfigOverwrite();
			logConfigWriteAnomalies();
			await appendWriteAudit("rename");
		} catch (err) {
			await appendWriteAudit("failed", err);
			throw err;
		}
	}
	return {
		configPath,
		loadConfig,
		readConfigFileSnapshot,
		readConfigFileSnapshotForWrite,
		writeConfigFile
	};
}
const DEFAULT_CONFIG_CACHE_MS = 200;
let configCache = null;
function resolveConfigCacheMs(env) {
	const raw = env.OPENCLAW_CONFIG_CACHE_MS?.trim();
	if (raw === "" || raw === "0") return 0;
	if (!raw) return DEFAULT_CONFIG_CACHE_MS;
	const parsed = Number.parseInt(raw, 10);
	if (!Number.isFinite(parsed)) return DEFAULT_CONFIG_CACHE_MS;
	return Math.max(0, parsed);
}
function shouldUseConfigCache(env) {
	if (env.OPENCLAW_DISABLE_CONFIG_CACHE?.trim()) return false;
	return resolveConfigCacheMs(env) > 0;
}
function clearConfigCache() {
	configCache = null;
}
function loadConfig() {
	const io = createConfigIO();
	const configPath = io.configPath;
	const now = Date.now();
	if (shouldUseConfigCache(process.env)) {
		const cached = configCache;
		if (cached && cached.configPath === configPath && cached.expiresAt > now) return cached.config;
	}
	const config = io.loadConfig();
	if (shouldUseConfigCache(process.env)) {
		const cacheMs = resolveConfigCacheMs(process.env);
		if (cacheMs > 0) configCache = {
			configPath,
			expiresAt: now + cacheMs,
			config
		};
	}
	return config;
}
async function readConfigFileSnapshot() {
	return await createConfigIO().readConfigFileSnapshot();
}
async function writeConfigFile(cfg, options = {}) {
	const io = createConfigIO();
	const sameConfigPath = options.expectedConfigPath === void 0 || options.expectedConfigPath === io.configPath;
	await io.writeConfigFile(cfg, { envSnapshotForRestore: sameConfigPath ? options.envSnapshotForRestore : void 0 });
}

//#endregion
export { resolveWhatsAppAccount as A, resolveWebCredsPath as B, getConfigValueAtPath as C, isSafeExecutableValue as D, unsetConfigValueAtPath as E, maybeRestoreCredsFromBackup as F, pickWebChannel as I, readWebSelfId as L, getWebAuthAgeMs as M, logWebSelfId as N, resolveAgentMaxConcurrent as O, logoutWeb as P, resolveDefaultWebAuthDir as R, unsetConfigOverride as S, setConfigValueAtPath as T, webAuthExists as V, resolveEnableState as _, writeConfigFile as a, resetConfigOverrides as b, TELEGRAM_COMMAND_NAME_PATTERN as c, parseDurationMs as d, validateJsonSchemaValue as f, normalizePluginsConfig as g, applyTestPluginDefaults as h, resolveConfigSnapshotHash as i, WA_WEB_AUTH_DIR as j, VERSION as k, normalizeTelegramCommandName as l, discoverOpenClawPlugins as m, loadConfig as n, validateConfigObjectWithPlugins as o, loadPluginManifestRegistry as p, readConfigFileSnapshot as r, parseByteSize as s, createConfigIO as t, resolveTelegramCustomCommands as u, resolveMemorySlotDecision as v, parseConfigPath as w, setConfigOverride as x, getConfigOverrides as y, resolveWebCredsBackupPath as z };