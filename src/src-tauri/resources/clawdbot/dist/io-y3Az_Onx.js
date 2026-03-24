import { C as resolveRequiredHomeDir, _ as resolveStateDir, c as resolveDefaultConfigCandidates, n as DEFAULT_GATEWAY_PORT, o as resolveConfigPath, v as expandHomePrefix } from "./paths-ViKUYWUK.js";
import { D as isPlainObject$2, d as isRecord$1, g as resolveConfigDir, y as resolveUserPath } from "./utils-CS0Ikux6.js";
import { n as resolveAgentModelPrimaryValue } from "./model-input-BB2wSAHb.js";
import { c as normalizeAgentId } from "./session-key-DAhnzjyr.js";
import { t as isBlockedObjectKey } from "./prototype-keys-Cm_8mWvq.js";
import { m as resolveDefaultAgentId, p as resolveAgentWorkspaceDir } from "./agent-scope-bjWqU22i.js";
import { t as DEFAULT_CONTEXT_TOKENS } from "./defaults-eEZJg44K.js";
import { f as parseModelRef } from "./model-selection-BnFtDmP7.js";
import { r as normalizeProviderId } from "./provider-id-Cjha-r0T.js";
import { a as shouldDeferShellEnvFallback, c as isDangerousHostEnvOverrideVarName, i as resolveShellEnvFallbackTimeoutMs, l as isDangerousHostEnvVarName, o as shouldEnableShellEnvFallback, r as loadShellEnvFallback, u as normalizeEnvVarKey } from "./shell-env-BOu7XeT_.js";
import { t as sanitizeTerminalText } from "./safe-text-yavot2qw.js";
import { n as VERSION } from "./version-CD3oP1-d.js";
import { a as hasConfiguredSecretInput, i as coerceSecretRef } from "./types.secrets-DgX397vI.js";
import { n as containsEnvVarReference, r as resolveConfigEnvVars } from "./env-substitution-O6uabUmO.js";
import { a as resolveConfigIncludes, i as readConfigIncludeFileWithGuards, n as ConfigIncludeError } from "./includes-Bj3eLUWH.js";
import { A as resolveSlackNativeStreaming, D as formatSlackStreamingBooleanMigrationMessage, E as formatSlackStreamModeMigrationMessage, M as resolveTelegramPreviewStreamMode, T as ChannelHeartbeatVisibilitySchema, a as IrcConfigSchema, c as SlackConfigSchema, i as IMessageConfigSchema, j as resolveSlackStreamingMode, k as resolveDiscordPreviewStreamMode, l as TelegramConfigSchema, n as DiscordConfigSchema, o as MSTeamsConfigSchema, r as GoogleChatConfigSchema, s as SignalConfigSchema, t as BlueBubblesConfigSchema, w as ChannelHealthMonitorSchema } from "./zod-schema.providers-core-COy5nBQ0.js";
import { a as ensureAgentEntry, c as getRecord, d as resolveDefaultAgentIdFromRaw, l as mapLegacyAudioTranscription, o as ensureRecord, r as normalizeLegacyWebSearchConfig, s as getAgentsList, t as listLegacyWebSearchConfigPaths, u as mergeMissing } from "./legacy-web-search-BB-ZHEhz.js";
import { t as splitShellArgs } from "./shell-argv-DBxSfCs1.js";
import { c as normalizeChatChannelId, l as CHANNEL_IDS } from "./registry-C5UkPpaO.js";
import { a as normalizePluginsConfig, o as resolveEffectiveEnableState, s as resolveMemorySlotDecision } from "./config-state-Br0ucqMb.js";
import { n as loadPluginManifestRegistry } from "./manifest-registry-B5JNQdOM.js";
import { c as isWindowsAbsolutePath, i as isAvatarHttpUrl, n as hasAvatarUriScheme, o as isPathWithinRoot, r as isAvatarDataUrl } from "./avatar-policy-B5nOfso_.js";
import { i as isCanonicalDottedDecimalIPv4, u as isLoopbackIpAddress } from "./ip-Ce8EDTBZ.js";
import { t as parseDurationMs } from "./parse-duration-D6oKXEgx.js";
import { a as MemorySearchSchema, c as AgentModelSchema, i as HeartbeatSchema, n as AgentSandboxSchema, o as ToolPolicySchema, r as ElevatedAllowFromSchema, s as ToolsSchema, t as AgentEntrySchema } from "./zod-schema.agent-runtime-Dtg4Jy6G.js";
import { A as TtsConfigSchema, I as sensitive, L as createAllowDenyChannelRulesSchema, N as TypingModeSchema, O as TranscribeAudioSchema, S as SecretInputSchema, T as SecretsConfigSchema, a as DmPolicySchema, c as GroupPolicySchema, f as InboundDebounceSchema, g as NativeCommandsSettingSchema, h as ModelsConfigSchema, i as DmConfigSchema, l as HexColorSchema, m as MarkdownConfigSchema, n as BlockStreamingCoalesceSchema, r as CliBackendSchema, s as GroupChatSchema, t as BlockStreamingChunkSchema, u as HumanDelaySchema, v as QueueSchema } from "./zod-schema.core-BuVz8Rk7.js";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import JSON5 from "json5";
import { isDeepStrictEqual } from "node:util";
import crypto from "node:crypto";
import dotenv from "dotenv";
import { z } from "zod";
//#region src/agents/owner-display.ts
function trimToUndefined(value) {
	const trimmed = value?.trim();
	return trimmed ? trimmed : void 0;
}
/**
* Resolve owner display settings for prompt rendering.
* Keep auth secrets decoupled from owner hash secrets.
*/
function resolveOwnerDisplaySetting(config) {
	const ownerDisplay = config?.commands?.ownerDisplay;
	if (ownerDisplay !== "hash") return {
		ownerDisplay,
		ownerDisplaySecret: void 0
	};
	return {
		ownerDisplay: "hash",
		ownerDisplaySecret: trimToUndefined(config?.commands?.ownerDisplaySecret)
	};
}
/**
* Ensure hash mode has a dedicated secret.
* Returns updated config and generated secret when autofill was needed.
*/
function ensureOwnerDisplaySecret(config, generateSecret = () => crypto.randomBytes(32).toString("hex")) {
	const settings = resolveOwnerDisplaySetting(config);
	if (settings.ownerDisplay !== "hash" || settings.ownerDisplaySecret) return { config };
	const generatedSecret = generateSecret();
	return {
		config: {
			...config,
			commands: {
				...config.commands,
				ownerDisplay: "hash",
				ownerDisplaySecret: generatedSecret
			}
		},
		generatedSecret
	};
}
//#endregion
//#region src/infra/dotenv.ts
function loadDotEnv(opts) {
	const quiet = opts?.quiet ?? true;
	dotenv.config({ quiet });
	const globalEnvPath = path.join(resolveConfigDir(process.env), ".env");
	if (!fs.existsSync(globalEnvPath)) return;
	dotenv.config({
		quiet,
		path: globalEnvPath,
		override: false
	});
}
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
	const defaultAgentId = agents.find((agent) => agent?.default)?.id ?? agents[0]?.id ?? "main";
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
async function rotateConfigBackups(configPath, ioFs) {
	const backupBase = `${configPath}.bak`;
	const maxIndex = 4;
	await ioFs.unlink(`${backupBase}.${maxIndex}`).catch(() => {});
	for (let index = maxIndex - 1; index >= 1; index -= 1) await ioFs.rename(`${backupBase}.${index}`, `${backupBase}.${index + 1}`).catch(() => {});
	await ioFs.rename(backupBase, `${backupBase}.1`).catch(() => {});
}
/**
* Harden file permissions on all .bak files in the rotation ring.
* copyFile does not guarantee permission preservation on all platforms
* (e.g. Windows, some NFS mounts), so we explicitly chmod each backup
* to owner-only (0o600) to match the main config file.
*/
async function hardenBackupPermissions(configPath, ioFs) {
	if (!ioFs.chmod) return;
	const backupBase = `${configPath}.bak`;
	await ioFs.chmod(backupBase, 384).catch(() => {});
	for (let i = 1; i < 5; i++) await ioFs.chmod(`${backupBase}.${i}`, 384).catch(() => {});
}
/**
* Remove orphan .bak files that fall outside the managed rotation ring.
* These can accumulate from interrupted writes, manual copies, or PID-stamped
* backups (e.g. openclaw.json.bak.1772352289, openclaw.json.bak.before-marketing).
*
* Only files matching `<configBasename>.bak.*` are considered; the primary
* `.bak` and numbered `.bak.1` through `.bak.{N-1}` are preserved.
*/
async function cleanOrphanBackups(configPath, ioFs) {
	if (!ioFs.readdir) return;
	const dir = path.dirname(configPath);
	const bakPrefix = `${path.basename(configPath)}.bak.`;
	const validSuffixes = /* @__PURE__ */ new Set();
	for (let i = 1; i < 5; i++) validSuffixes.add(String(i));
	let entries;
	try {
		entries = await ioFs.readdir(dir);
	} catch {
		return;
	}
	for (const entry of entries) {
		if (!entry.startsWith(bakPrefix)) continue;
		const suffix = entry.slice(bakPrefix.length);
		if (validSuffixes.has(suffix)) continue;
		await ioFs.unlink(path.join(dir, entry)).catch(() => {});
	}
}
/**
* Run the full backup maintenance cycle around config writes.
* Order matters: rotate ring -> create new .bak -> harden modes -> prune orphan .bak.* files.
*/
async function maintainConfigBackups(configPath, ioFs) {
	await rotateConfigBackups(configPath, ioFs);
	await ioFs.copyFile(configPath, `${configPath}.bak`).catch(() => {});
	await hardenBackupPermissions(configPath, ioFs);
	await cleanOrphanBackups(configPath, ioFs);
}
function resolveAgentMaxConcurrent(cfg) {
	const raw = cfg?.agents?.defaults?.maxConcurrent;
	if (typeof raw === "number" && Number.isFinite(raw)) return Math.max(1, Math.floor(raw));
	return 4;
}
function resolveSubagentMaxConcurrent(cfg) {
	const raw = cfg?.agents?.defaults?.subagents?.maxConcurrent;
	if (typeof raw === "number" && Number.isFinite(raw)) return Math.max(1, Math.floor(raw));
	return 8;
}
//#endregion
//#region src/config/talk.ts
const DEFAULT_TALK_PROVIDER = "elevenlabs";
function isPlainObject$1(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
function normalizeString(value) {
	if (typeof value !== "string") return;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : void 0;
}
function normalizeVoiceAliases(value) {
	if (!isPlainObject$1(value)) return;
	const aliases = {};
	for (const [alias, rawId] of Object.entries(value)) {
		if (typeof rawId !== "string") continue;
		aliases[alias] = rawId;
	}
	return Object.keys(aliases).length > 0 ? aliases : void 0;
}
function normalizeTalkSecretInput(value) {
	if (typeof value === "string") {
		const trimmed = value.trim();
		return trimmed.length > 0 ? trimmed : void 0;
	}
	return coerceSecretRef(value) ?? void 0;
}
function normalizeSilenceTimeoutMs(value) {
	if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) return;
	return value;
}
function normalizeTalkProviderConfig(value) {
	if (!isPlainObject$1(value)) return;
	const provider = {};
	for (const [key, raw] of Object.entries(value)) {
		if (raw === void 0) continue;
		if (key === "voiceAliases") {
			const aliases = normalizeVoiceAliases(raw);
			if (aliases) provider.voiceAliases = aliases;
			continue;
		}
		if (key === "apiKey") {
			const normalized = normalizeTalkSecretInput(raw);
			if (normalized !== void 0) provider.apiKey = normalized;
			continue;
		}
		if (key === "voiceId" || key === "modelId" || key === "outputFormat") {
			const normalized = normalizeString(raw);
			if (normalized) provider[key] = normalized;
			continue;
		}
		provider[key] = raw;
	}
	return Object.keys(provider).length > 0 ? provider : void 0;
}
function normalizeTalkProviders(value) {
	if (!isPlainObject$1(value)) return;
	const providers = {};
	for (const [rawProviderId, providerConfig] of Object.entries(value)) {
		const providerId = normalizeString(rawProviderId);
		if (!providerId) continue;
		const normalizedProvider = normalizeTalkProviderConfig(providerConfig);
		if (!normalizedProvider) continue;
		providers[providerId] = normalizedProvider;
	}
	return Object.keys(providers).length > 0 ? providers : void 0;
}
function normalizedLegacyTalkFields(source) {
	const legacy = {};
	const voiceId = normalizeString(source.voiceId);
	if (voiceId) legacy.voiceId = voiceId;
	const voiceAliases = normalizeVoiceAliases(source.voiceAliases);
	if (voiceAliases) legacy.voiceAliases = voiceAliases;
	const modelId = normalizeString(source.modelId);
	if (modelId) legacy.modelId = modelId;
	const outputFormat = normalizeString(source.outputFormat);
	if (outputFormat) legacy.outputFormat = outputFormat;
	const apiKey = normalizeTalkSecretInput(source.apiKey);
	if (apiKey !== void 0) legacy.apiKey = apiKey;
	const silenceTimeoutMs = normalizeSilenceTimeoutMs(source.silenceTimeoutMs);
	if (silenceTimeoutMs !== void 0) legacy.silenceTimeoutMs = silenceTimeoutMs;
	return legacy;
}
function legacyProviderConfigFromTalk(source) {
	return normalizeTalkProviderConfig({
		voiceId: source.voiceId,
		voiceAliases: source.voiceAliases,
		modelId: source.modelId,
		outputFormat: source.outputFormat,
		apiKey: source.apiKey
	});
}
function activeProviderFromTalk(talk) {
	const provider = normalizeString(talk.provider);
	const providers = talk.providers;
	if (provider) {
		if (providers && !(provider in providers)) return;
		return provider;
	}
	const providerIds = providers ? Object.keys(providers) : [];
	return providerIds.length === 1 ? providerIds[0] : void 0;
}
function legacyTalkFieldsFromProviderConfig(config) {
	if (!config) return {};
	const legacy = {};
	if (typeof config.voiceId === "string") legacy.voiceId = config.voiceId;
	if (config.voiceAliases && typeof config.voiceAliases === "object" && !Array.isArray(config.voiceAliases)) {
		const aliases = normalizeVoiceAliases(config.voiceAliases);
		if (aliases) legacy.voiceAliases = aliases;
	}
	if (typeof config.modelId === "string") legacy.modelId = config.modelId;
	if (typeof config.outputFormat === "string") legacy.outputFormat = config.outputFormat;
	if (config.apiKey !== void 0) legacy.apiKey = config.apiKey;
	return legacy;
}
function normalizeTalkSection(value) {
	if (!isPlainObject$1(value)) return;
	const source = value;
	const hasNormalizedShape = typeof source.provider === "string" || isPlainObject$1(source.providers);
	const normalized = {};
	const legacy = normalizedLegacyTalkFields(source);
	if (Object.keys(legacy).length > 0) Object.assign(normalized, legacy);
	if (typeof source.interruptOnSpeech === "boolean") normalized.interruptOnSpeech = source.interruptOnSpeech;
	if (hasNormalizedShape) {
		const providers = normalizeTalkProviders(source.providers);
		const provider = normalizeString(source.provider);
		if (providers) normalized.providers = providers;
		if (provider) normalized.provider = provider;
		else if (providers) {
			const ids = Object.keys(providers);
			if (ids.length === 1) normalized.provider = ids[0];
		}
		return Object.keys(normalized).length > 0 ? normalized : void 0;
	}
	const legacyProviderConfig = legacyProviderConfigFromTalk(source);
	if (legacyProviderConfig) {
		normalized.provider = DEFAULT_TALK_PROVIDER;
		normalized.providers = { [DEFAULT_TALK_PROVIDER]: legacyProviderConfig };
	}
	return Object.keys(normalized).length > 0 ? normalized : void 0;
}
function normalizeTalkConfig(config) {
	if (!config.talk) return config;
	const normalizedTalk = normalizeTalkSection(config.talk);
	if (!normalizedTalk) return config;
	return {
		...config,
		talk: normalizedTalk
	};
}
function resolveActiveTalkProviderConfig(talk) {
	const normalizedTalk = normalizeTalkSection(talk);
	if (!normalizedTalk) return;
	const provider = activeProviderFromTalk(normalizedTalk);
	if (!provider) return;
	return {
		provider,
		config: normalizedTalk.providers?.[provider] ?? {}
	};
}
function buildTalkConfigResponse(value) {
	if (!isPlainObject$1(value)) return;
	const normalized = normalizeTalkSection(value);
	if (!normalized) return;
	const payload = {};
	if (typeof normalized.interruptOnSpeech === "boolean") payload.interruptOnSpeech = normalized.interruptOnSpeech;
	if (typeof normalized.silenceTimeoutMs === "number") payload.silenceTimeoutMs = normalized.silenceTimeoutMs;
	if (normalized.providers && Object.keys(normalized.providers).length > 0) payload.providers = normalized.providers;
	if (typeof normalized.provider === "string") payload.provider = normalized.provider;
	const resolved = resolveActiveTalkProviderConfig(normalized);
	if (resolved) payload.resolved = resolved;
	const providerConfig = resolved?.config;
	const providerCompatibilityLegacy = legacyTalkFieldsFromProviderConfig(providerConfig);
	const compatibilityLegacy = Object.keys(providerCompatibilityLegacy).length > 0 ? providerCompatibilityLegacy : normalizedLegacyTalkFields(normalized);
	Object.assign(payload, compatibilityLegacy);
	return Object.keys(payload).length > 0 ? payload : void 0;
}
function readTalkApiKeyFromProfile(deps = {}) {
	const fsImpl = deps.fs ?? fs;
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
	sonnet: "anthropic/claude-sonnet-4-6",
	gpt: "openai/gpt-5.4",
	"gpt-mini": "openai/gpt-5-mini",
	gemini: "google/gemini-3.1-pro-preview",
	"gemini-flash": "google/gemini-3-flash-preview",
	"gemini-flash-lite": "google/gemini-3.1-flash-lite-preview"
};
const DEFAULT_MODEL_COST = {
	input: 0,
	output: 0,
	cacheRead: 0,
	cacheWrite: 0
};
const DEFAULT_MODEL_INPUT = ["text"];
const DEFAULT_MODEL_MAX_TOKENS = 8192;
const MISTRAL_SAFE_MAX_TOKENS_BY_MODEL = {
	"devstral-medium-latest": 32768,
	"magistral-small": 4e4,
	"mistral-large-latest": 16384,
	"mistral-medium-2508": 8192,
	"mistral-small-latest": 16384,
	"pixtral-large-latest": 32768
};
function resolveDefaultProviderApi(providerId, providerApi) {
	if (providerApi) return providerApi;
	return normalizeProviderId(providerId) === "anthropic" ? "anthropic-messages" : void 0;
}
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
function resolveNormalizedProviderModelMaxTokens(params) {
	const clamped = Math.min(params.rawMaxTokens, params.contextWindow);
	if (normalizeProviderId(params.providerId) !== "mistral" || clamped < params.contextWindow) return clamped;
	const safeMaxTokens = MISTRAL_SAFE_MAX_TOKENS_BY_MODEL[params.modelId] ?? DEFAULT_MODEL_MAX_TOKENS;
	return Math.min(safeMaxTokens, params.contextWindow);
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
	const normalized = normalizeTalkConfig(config);
	const resolved = resolveTalkApiKey();
	if (!resolved) return normalized;
	const talk = normalized.talk;
	const active = resolveActiveTalkProviderConfig(talk);
	if (active?.provider && active.provider !== "elevenlabs") return normalized;
	const existingProviderApiKeyConfigured = hasConfiguredSecretInput(active?.config?.apiKey);
	const existingLegacyApiKeyConfigured = hasConfiguredSecretInput(talk?.apiKey);
	if (existingProviderApiKeyConfigured || existingLegacyApiKeyConfigured) return normalized;
	const providerId = active?.provider ?? "elevenlabs";
	const providers = { ...talk?.providers };
	providers[providerId] = {
		...providers[providerId],
		apiKey: resolved
	};
	const nextTalk = {
		...talk,
		apiKey: resolved,
		provider: talk?.provider ?? providerId,
		providers
	};
	return {
		...normalized,
		talk: nextTalk
	};
}
function applyTalkConfigNormalization(config) {
	return normalizeTalkConfig(config);
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
			const providerApi = resolveDefaultProviderApi(providerId, provider.api);
			let nextProvider = provider;
			if (providerApi && provider.api !== providerApi) {
				mutated = true;
				nextProvider = {
					...nextProvider,
					api: providerApi
				};
			}
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
				const maxTokens = resolveNormalizedProviderModelMaxTokens({
					providerId,
					modelId: raw.id,
					contextWindow,
					rawMaxTokens
				});
				if (raw.maxTokens !== maxTokens) modelMutated = true;
				const api = raw.api ?? providerApi;
				if (raw.api !== api) modelMutated = true;
				if (!modelMutated) return model;
				providerMutated = true;
				return {
					...raw,
					reasoning,
					input,
					cost,
					contextWindow,
					maxTokens,
					api
				};
			});
			if (!providerMutated) {
				if (nextProvider !== provider) nextProviders[providerId] = nextProvider;
				continue;
			}
			nextProviders[providerId] = {
				...nextProvider,
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
		nextDefaults.maxConcurrent = 4;
		mutated = true;
	}
	const nextSubagents = defaults?.subagents ? { ...defaults.subagents } : {};
	if (!hasSubMax) {
		nextSubagents.maxConcurrent = 8;
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
		const isAnthropicCacheRetentionTarget = (parsed) => Boolean(parsed && (parsed.provider === "anthropic" || parsed.provider === "amazon-bedrock" && parsed.model.toLowerCase().includes("anthropic.claude")));
		for (const [key, entry] of Object.entries(nextModels)) {
			if (!isAnthropicCacheRetentionTarget(parseModelRef(key, "anthropic"))) continue;
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
		const primary = resolvePrimaryModelRef(resolveAgentModelPrimaryValue(defaults.model) ?? void 0);
		if (primary) {
			const parsedPrimary = parseModelRef(primary, "anthropic");
			if (isAnthropicCacheRetentionTarget(parsedPrimary)) {
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
	if (isPlainObject$2(incoming) && isPlainObject$2(parsed)) {
		const result = {};
		for (const [key, value] of Object.entries(incoming)) if (key in parsed) result[key] = restoreEnvVarRefs(value, parsed[key], env);
		else result[key] = value;
		return result;
	}
	return incoming;
}
//#endregion
//#region src/config/config-env-vars.ts
function isBlockedConfigEnvVar(key) {
	return isDangerousHostEnvVarName(key) || isDangerousHostEnvOverrideVarName(key);
}
function collectConfigEnvVarsByTarget(cfg) {
	const envConfig = cfg?.env;
	if (!envConfig) return {};
	const entries = {};
	if (envConfig.vars) for (const [rawKey, value] of Object.entries(envConfig.vars)) {
		if (!value) continue;
		const key = normalizeEnvVarKey(rawKey, { portable: true });
		if (!key) continue;
		if (isBlockedConfigEnvVar(key)) continue;
		entries[key] = value;
	}
	for (const [rawKey, value] of Object.entries(envConfig)) {
		if (rawKey === "shellEnv" || rawKey === "vars") continue;
		if (typeof value !== "string" || !value.trim()) continue;
		const key = normalizeEnvVarKey(rawKey, { portable: true });
		if (!key) continue;
		if (isBlockedConfigEnvVar(key)) continue;
		entries[key] = value;
	}
	return entries;
}
function collectConfigRuntimeEnvVars(cfg) {
	return collectConfigEnvVarsByTarget(cfg);
}
function collectConfigServiceEnvVars(cfg) {
	return collectConfigEnvVarsByTarget(cfg);
}
function createConfigRuntimeEnv(cfg, baseEnv = process.env) {
	const env = { ...baseEnv };
	applyConfigEnvVars(cfg, env);
	return env;
}
function applyConfigEnvVars(cfg, env = process.env) {
	const entries = collectConfigRuntimeEnvVars(cfg);
	for (const [key, value] of Object.entries(entries)) {
		if (env[key]?.trim()) continue;
		if (containsEnvVarReference(value)) continue;
		env[key] = value;
	}
}
//#endregion
//#region src/config/state-dir-dotenv.ts
function isBlockedServiceEnvVar(key) {
	return isDangerousHostEnvVarName(key) || isDangerousHostEnvOverrideVarName(key);
}
/**
* Read and parse `~/.openclaw/.env` (or `$OPENCLAW_STATE_DIR/.env`), returning
* a filtered record of key-value pairs suitable for embedding in a service
* environment (LaunchAgent plist, systemd unit, Scheduled Task).
*/
function readStateDirDotEnvVars(env) {
	const stateDir = resolveStateDir(env);
	const dotEnvPath = path.join(stateDir, ".env");
	let content;
	try {
		content = fs.readFileSync(dotEnvPath, "utf8");
	} catch {
		return {};
	}
	const parsed = dotenv.parse(content);
	const entries = {};
	for (const [rawKey, value] of Object.entries(parsed)) {
		if (!value?.trim()) continue;
		const key = normalizeEnvVarKey(rawKey, { portable: true });
		if (!key) continue;
		if (isBlockedServiceEnvVar(key)) continue;
		entries[key] = value;
	}
	return entries;
}
/**
* Durable service env sources survive beyond the invoking shell and are safe to
* persist into gateway install metadata.
*
* Precedence:
* 1. state-dir `.env` file vars
* 2. config service env vars
*/
function collectDurableServiceEnvVars(params) {
	return {
		...readStateDirDotEnvVars(params.env),
		...collectConfigServiceEnvVars(params.config)
	};
}
//#endregion
//#region src/config/legacy.migrations.part-1.ts
function migrateBindings(raw, changes, changeNote, mutator) {
	const bindings = Array.isArray(raw.bindings) ? raw.bindings : null;
	if (!bindings) return;
	let touched = false;
	for (const entry of bindings) {
		if (!isRecord$1(entry)) continue;
		const match = getRecord(entry.match);
		if (!match) continue;
		if (!mutator(match)) continue;
		entry.match = match;
		touched = true;
	}
	if (touched) {
		raw.bindings = bindings;
		changes.push(changeNote);
	}
}
function ensureDefaultGroupEntry(section) {
	const groups = isRecord$1(section.groups) ? section.groups : {};
	const defaultKey = "*";
	return {
		groups,
		entry: isRecord$1(groups[defaultKey]) ? groups[defaultKey] : {}
	};
}
function hasOwnKey(target, key) {
	return Object.prototype.hasOwnProperty.call(target, key);
}
function escapeControlForLog(value) {
	return value.replace(/\r/g, "\\r").replace(/\n/g, "\\n").replace(/\t/g, "\\t");
}
function migrateThreadBindingsTtlHoursForPath(params) {
	const threadBindings = getRecord(params.owner.threadBindings);
	if (!threadBindings || !hasOwnKey(threadBindings, "ttlHours")) return false;
	const hadIdleHours = threadBindings.idleHours !== void 0;
	if (!hadIdleHours) threadBindings.idleHours = threadBindings.ttlHours;
	delete threadBindings.ttlHours;
	params.owner.threadBindings = threadBindings;
	if (hadIdleHours) params.changes.push(`Removed ${params.pathPrefix}.threadBindings.ttlHours (${params.pathPrefix}.threadBindings.idleHours already set).`);
	else params.changes.push(`Moved ${params.pathPrefix}.threadBindings.ttlHours → ${params.pathPrefix}.threadBindings.idleHours.`);
	return true;
}
const LEGACY_CONFIG_MIGRATIONS_PART_1 = [
	{
		id: "bindings.match.provider->bindings.match.channel",
		describe: "Move bindings[].match.provider to bindings[].match.channel",
		apply: (raw, changes) => {
			migrateBindings(raw, changes, "Moved bindings[].match.provider → bindings[].match.channel.", (match) => {
				if (typeof match.channel === "string" && match.channel.trim()) return false;
				const provider = typeof match.provider === "string" ? match.provider.trim() : "";
				if (!provider) return false;
				match.channel = provider;
				delete match.provider;
				return true;
			});
		}
	},
	{
		id: "bindings.match.accountID->bindings.match.accountId",
		describe: "Move bindings[].match.accountID to bindings[].match.accountId",
		apply: (raw, changes) => {
			migrateBindings(raw, changes, "Moved bindings[].match.accountID → bindings[].match.accountId.", (match) => {
				if (match.accountId !== void 0) return false;
				const accountID = typeof match.accountID === "string" ? match.accountID.trim() : match.accountID;
				if (!accountID) return false;
				match.accountId = accountID;
				delete match.accountID;
				return true;
			});
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
				if (!isRecord$1(rule)) continue;
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
			].filter((key) => isRecord$1(raw[key]));
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
		id: "thread-bindings.ttlHours->idleHours",
		describe: "Move legacy threadBindings.ttlHours keys to threadBindings.idleHours (session + channels.discord)",
		apply: (raw, changes) => {
			const session = getRecord(raw.session);
			if (session) {
				migrateThreadBindingsTtlHoursForPath({
					owner: session,
					pathPrefix: "session",
					changes
				});
				raw.session = session;
			}
			const channels = getRecord(raw.channels);
			const discord = getRecord(channels?.discord);
			if (!channels || !discord) return;
			migrateThreadBindingsTtlHoursForPath({
				owner: discord,
				pathPrefix: "channels.discord",
				changes
			});
			const accounts = getRecord(discord.accounts);
			if (accounts) {
				for (const [accountId, accountRaw] of Object.entries(accounts)) {
					const account = getRecord(accountRaw);
					if (!account) continue;
					migrateThreadBindingsTtlHoursForPath({
						owner: account,
						pathPrefix: `channels.discord.accounts.${accountId}`,
						changes
					});
					accounts[accountId] = account;
				}
				discord.accounts = accounts;
			}
			channels.discord = discord;
			raw.channels = channels;
		}
	},
	{
		id: "channels.streaming-keys->channels.streaming",
		describe: "Normalize legacy streaming keys to channels.<provider>.streaming (Telegram/Discord/Slack)",
		apply: (raw, changes) => {
			const channels = getRecord(raw.channels);
			if (!channels) return;
			const migrateProviderEntry = (params) => {
				const migrateCommonStreamingMode = (resolveMode) => {
					const hasLegacyStreamMode = params.entry.streamMode !== void 0;
					const legacyStreaming = params.entry.streaming;
					if (!hasLegacyStreamMode && typeof legacyStreaming !== "boolean") return false;
					const resolved = resolveMode(params.entry);
					params.entry.streaming = resolved;
					if (hasLegacyStreamMode) {
						delete params.entry.streamMode;
						changes.push(`Moved ${params.pathPrefix}.streamMode → ${params.pathPrefix}.streaming (${resolved}).`);
					}
					if (typeof legacyStreaming === "boolean") changes.push(`Normalized ${params.pathPrefix}.streaming boolean → enum (${resolved}).`);
					return true;
				};
				const hasLegacyStreamMode = params.entry.streamMode !== void 0;
				const legacyStreaming = params.entry.streaming;
				const legacyNativeStreaming = params.entry.nativeStreaming;
				if (params.provider === "telegram") {
					migrateCommonStreamingMode(resolveTelegramPreviewStreamMode);
					return;
				}
				if (params.provider === "discord") {
					migrateCommonStreamingMode(resolveDiscordPreviewStreamMode);
					return;
				}
				if (!hasLegacyStreamMode && typeof legacyStreaming !== "boolean") return;
				const resolvedStreaming = resolveSlackStreamingMode(params.entry);
				const resolvedNativeStreaming = resolveSlackNativeStreaming(params.entry);
				params.entry.streaming = resolvedStreaming;
				params.entry.nativeStreaming = resolvedNativeStreaming;
				if (hasLegacyStreamMode) {
					delete params.entry.streamMode;
					changes.push(formatSlackStreamModeMigrationMessage(params.pathPrefix, resolvedStreaming));
				}
				if (typeof legacyStreaming === "boolean") changes.push(formatSlackStreamingBooleanMigrationMessage(params.pathPrefix, resolvedNativeStreaming));
				else if (typeof legacyNativeStreaming !== "boolean" && hasLegacyStreamMode) changes.push(`Set ${params.pathPrefix}.nativeStreaming → ${resolvedNativeStreaming}.`);
			};
			const migrateProvider = (provider) => {
				const providerEntry = getRecord(channels[provider]);
				if (!providerEntry) return;
				migrateProviderEntry({
					provider,
					entry: providerEntry,
					pathPrefix: `channels.${provider}`
				});
				const accounts = getRecord(providerEntry.accounts);
				if (!accounts) return;
				for (const [accountId, accountValue] of Object.entries(accounts)) {
					const account = getRecord(accountValue);
					if (!account) continue;
					migrateProviderEntry({
						provider,
						entry: account,
						pathPrefix: `channels.${provider}.accounts.${accountId}`
					});
				}
			};
			migrateProvider("telegram");
			migrateProvider("discord");
			migrateProvider("slack");
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
				if (options?.requireExisting && !isRecord$1(channels[key])) return;
				const section = channels[key] && typeof channels[key] === "object" ? channels[key] : {};
				const { groups, entry } = ensureDefaultGroupEntry(section);
				const defaultKey = "*";
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
		id: "gateway.bind.host-alias->bind-mode",
		describe: "Normalize gateway.bind host aliases to supported bind modes",
		apply: (raw, changes) => {
			const gateway = getRecord(raw.gateway);
			if (!gateway) return;
			const bindRaw = gateway.bind;
			if (typeof bindRaw !== "string") return;
			const normalized = bindRaw.trim().toLowerCase();
			let mapped;
			if (normalized === "0.0.0.0" || normalized === "::" || normalized === "[::]" || normalized === "*") mapped = "lan";
			else if (normalized === "127.0.0.1" || normalized === "localhost" || normalized === "::1" || normalized === "[::1]") mapped = "loopback";
			if (!mapped || normalized === mapped) return;
			gateway.bind = mapped;
			raw.gateway = gateway;
			changes.push(`Normalized gateway.bind "${escapeControlForLog(bindRaw)}" → "${mapped}".`);
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
			const { groups, entry } = ensureDefaultGroupEntry(telegram);
			const defaultKey = "*";
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
function applyLegacyAudioTranscriptionModel(params) {
	const mapped = mapLegacyAudioTranscription(params.source);
	if (!mapped) {
		params.changes.push(params.invalidMessage);
		return;
	}
	const mediaAudio = ensureRecord(ensureRecord(ensureRecord(params.raw, "tools"), "media"), "audio");
	if ((Array.isArray(mediaAudio.models) ? mediaAudio.models : []).length === 0) {
		mediaAudio.enabled = true;
		mediaAudio.models = [mapped];
		params.changes.push(params.movedMessage);
		return;
	}
	params.changes.push(params.alreadySetMessage);
}
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
				if (!list.some((entry) => isRecord$1(entry) && entry.default === true)) {
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
				applyLegacyAudioTranscriptionModel({
					raw,
					source: routing.transcribeAudio,
					changes,
					movedMessage: "Moved routing.transcribeAudio → tools.media.audio.models.",
					alreadySetMessage: "Removed routing.transcribeAudio (tools.media.audio.models already set).",
					invalidMessage: "Removed routing.transcribeAudio (invalid or empty command)."
				});
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
			applyLegacyAudioTranscriptionModel({
				raw,
				source: audio.transcription,
				changes,
				movedMessage: "Moved audio.transcription → tools.media.audio.models.",
				alreadySetMessage: "Removed audio.transcription (tools.media.audio.models already set).",
				invalidMessage: "Removed audio.transcription (invalid or empty command)."
			});
			delete audio.transcription;
			if (Object.keys(audio).length === 0) delete raw.audio;
			else raw.audio = audio;
		}
	}
];
//#endregion
//#region src/config/gateway-control-ui-origins.ts
function isGatewayNonLoopbackBindMode(bind) {
	return bind === "lan" || bind === "tailnet" || bind === "custom";
}
function hasConfiguredControlUiAllowedOrigins(params) {
	if (params.dangerouslyAllowHostHeaderOriginFallback === true) return true;
	return Array.isArray(params.allowedOrigins) && params.allowedOrigins.some((origin) => typeof origin === "string" && origin.trim().length > 0);
}
function resolveGatewayPortWithDefault(port, fallback = DEFAULT_GATEWAY_PORT) {
	return typeof port === "number" && port > 0 ? port : fallback;
}
function buildDefaultControlUiAllowedOrigins(params) {
	const origins = new Set([`http://localhost:${params.port}`, `http://127.0.0.1:${params.port}`]);
	const customBindHost = params.customBindHost?.trim();
	if (params.bind === "custom" && customBindHost) origins.add(`http://${customBindHost}:${params.port}`);
	return [...origins];
}
function ensureControlUiAllowedOriginsForNonLoopbackBind(config, opts) {
	const bind = config.gateway?.bind;
	if (!isGatewayNonLoopbackBindMode(bind)) return {
		config,
		seededOrigins: null,
		bind: null
	};
	if (opts?.requireControlUiEnabled && config.gateway?.controlUi?.enabled === false) return {
		config,
		seededOrigins: null,
		bind
	};
	if (hasConfiguredControlUiAllowedOrigins({
		allowedOrigins: config.gateway?.controlUi?.allowedOrigins,
		dangerouslyAllowHostHeaderOriginFallback: config.gateway?.controlUi?.dangerouslyAllowHostHeaderOriginFallback
	})) return {
		config,
		seededOrigins: null,
		bind
	};
	const seededOrigins = buildDefaultControlUiAllowedOrigins({
		port: resolveGatewayPortWithDefault(config.gateway?.port, opts?.defaultPort),
		bind,
		customBindHost: config.gateway?.customBindHost
	});
	return {
		config: {
			...config,
			gateway: {
				...config.gateway,
				controlUi: {
					...config.gateway?.controlUi,
					allowedOrigins: seededOrigins
				}
			}
		},
		seededOrigins,
		bind
	};
}
//#endregion
//#region src/config/legacy.migrations.part-3.ts
const AGENT_HEARTBEAT_KEYS = new Set([
	"every",
	"activeHours",
	"model",
	"session",
	"includeReasoning",
	"target",
	"directPolicy",
	"to",
	"accountId",
	"prompt",
	"ackMaxChars",
	"suppressToolErrorWarnings",
	"lightContext",
	"isolatedSession"
]);
const CHANNEL_HEARTBEAT_KEYS = new Set([
	"showOk",
	"showAlerts",
	"useIndicator"
]);
function splitLegacyHeartbeat(legacyHeartbeat) {
	const agentHeartbeat = {};
	const channelHeartbeat = {};
	for (const [key, value] of Object.entries(legacyHeartbeat)) {
		if (isBlockedObjectKey(key)) continue;
		if (CHANNEL_HEARTBEAT_KEYS.has(key)) {
			channelHeartbeat[key] = value;
			continue;
		}
		if (AGENT_HEARTBEAT_KEYS.has(key)) {
			agentHeartbeat[key] = value;
			continue;
		}
		agentHeartbeat[key] = value;
	}
	return {
		agentHeartbeat: Object.keys(agentHeartbeat).length > 0 ? agentHeartbeat : null,
		channelHeartbeat: Object.keys(channelHeartbeat).length > 0 ? channelHeartbeat : null
	};
}
function mergeLegacyIntoDefaults(params) {
	const root = ensureRecord(params.raw, params.rootKey);
	const defaults = ensureRecord(root, "defaults");
	const existing = getRecord(defaults[params.fieldKey]);
	if (!existing) {
		defaults[params.fieldKey] = params.legacyValue;
		params.changes.push(params.movedMessage);
	} else {
		const merged = structuredClone(existing);
		mergeMissing(merged, params.legacyValue);
		defaults[params.fieldKey] = merged;
		params.changes.push(params.mergedMessage);
	}
	root.defaults = defaults;
	params.raw[params.rootKey] = root;
}
const LEGACY_CONFIG_MIGRATIONS_PART_3 = [
	{
		id: "gateway.controlUi.allowedOrigins-seed-for-non-loopback",
		describe: "Seed gateway.controlUi.allowedOrigins for existing non-loopback gateway installs",
		apply: (raw, changes) => {
			const gateway = getRecord(raw.gateway);
			if (!gateway) return;
			const bind = gateway.bind;
			if (!isGatewayNonLoopbackBindMode(bind)) return;
			const controlUi = getRecord(gateway.controlUi) ?? {};
			if (hasConfiguredControlUiAllowedOrigins({
				allowedOrigins: controlUi.allowedOrigins,
				dangerouslyAllowHostHeaderOriginFallback: controlUi.dangerouslyAllowHostHeaderOriginFallback
			})) return;
			const origins = buildDefaultControlUiAllowedOrigins({
				port: resolveGatewayPortWithDefault(gateway.port, DEFAULT_GATEWAY_PORT),
				bind,
				customBindHost: typeof gateway.customBindHost === "string" ? gateway.customBindHost : void 0
			});
			gateway.controlUi = {
				...controlUi,
				allowedOrigins: origins
			};
			raw.gateway = gateway;
			changes.push(`Seeded gateway.controlUi.allowedOrigins ${JSON.stringify(origins)} for bind=${String(bind)}. Required since v2026.2.26. Add other machine origins to gateway.controlUi.allowedOrigins if needed.`);
		}
	},
	{
		id: "memorySearch->agents.defaults.memorySearch",
		describe: "Move top-level memorySearch to agents.defaults.memorySearch",
		apply: (raw, changes) => {
			const legacyMemorySearch = getRecord(raw.memorySearch);
			if (!legacyMemorySearch) return;
			mergeLegacyIntoDefaults({
				raw,
				rootKey: "agents",
				fieldKey: "memorySearch",
				legacyValue: legacyMemorySearch,
				changes,
				movedMessage: "Moved memorySearch → agents.defaults.memorySearch.",
				mergedMessage: "Merged memorySearch → agents.defaults.memorySearch (filled missing fields from legacy; kept explicit agents.defaults values)."
			});
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
			if (isRecord$1(agentCopy.sandbox)) delete agentCopy.sandbox.tools;
			if (isRecord$1(agentCopy.subagents)) delete agentCopy.subagents.tools;
			mergeMissing(defaults, agentCopy);
			agents.defaults = defaults;
			raw.agents = agents;
			delete raw.agent;
			changes.push("Moved agent → agents.defaults.");
		}
	},
	{
		id: "heartbeat->agents.defaults.heartbeat",
		describe: "Move top-level heartbeat to agents.defaults.heartbeat/channels.defaults.heartbeat",
		apply: (raw, changes) => {
			const legacyHeartbeat = getRecord(raw.heartbeat);
			if (!legacyHeartbeat) return;
			const { agentHeartbeat, channelHeartbeat } = splitLegacyHeartbeat(legacyHeartbeat);
			if (agentHeartbeat) mergeLegacyIntoDefaults({
				raw,
				rootKey: "agents",
				fieldKey: "heartbeat",
				legacyValue: agentHeartbeat,
				changes,
				movedMessage: "Moved heartbeat → agents.defaults.heartbeat.",
				mergedMessage: "Merged heartbeat → agents.defaults.heartbeat (filled missing fields from legacy; kept explicit agents.defaults values)."
			});
			if (channelHeartbeat) mergeLegacyIntoDefaults({
				raw,
				rootKey: "channels",
				fieldKey: "heartbeat",
				legacyValue: channelHeartbeat,
				changes,
				movedMessage: "Moved heartbeat visibility → channels.defaults.heartbeat.",
				mergedMessage: "Merged heartbeat visibility → channels.defaults.heartbeat (filled missing fields from legacy; kept explicit channels.defaults values)."
			});
			if (!agentHeartbeat && !channelHeartbeat) changes.push("Removed empty top-level heartbeat.");
			delete raw.heartbeat;
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
function isRecord(value) {
	return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function hasLegacyThreadBindingTtl(value) {
	return isRecord(value) && Object.prototype.hasOwnProperty.call(value, "ttlHours");
}
function hasLegacyThreadBindingTtlInAccounts(value) {
	if (!isRecord(value)) return false;
	return Object.values(value).some((entry) => hasLegacyThreadBindingTtl(isRecord(entry) ? entry.threadBindings : void 0));
}
function isLegacyGatewayBindHostAlias(value) {
	if (typeof value !== "string") return false;
	const normalized = value.trim().toLowerCase();
	if (!normalized) return false;
	if (normalized === "auto" || normalized === "loopback" || normalized === "lan" || normalized === "tailnet" || normalized === "custom") return false;
	return normalized === "0.0.0.0" || normalized === "::" || normalized === "[::]" || normalized === "*" || normalized === "127.0.0.1" || normalized === "localhost" || normalized === "::1" || normalized === "[::1]";
}
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
		path: ["session", "threadBindings"],
		message: "session.threadBindings.ttlHours was renamed to session.threadBindings.idleHours (auto-migrated on load).",
		match: (value) => hasLegacyThreadBindingTtl(value)
	},
	{
		path: [
			"channels",
			"discord",
			"threadBindings"
		],
		message: "channels.discord.threadBindings.ttlHours was renamed to channels.discord.threadBindings.idleHours (auto-migrated on load).",
		match: (value) => hasLegacyThreadBindingTtl(value)
	},
	{
		path: [
			"channels",
			"discord",
			"accounts"
		],
		message: "channels.discord.accounts.<id>.threadBindings.ttlHours was renamed to channels.discord.accounts.<id>.threadBindings.idleHours (auto-migrated on load).",
		match: (value) => hasLegacyThreadBindingTtlInAccounts(value)
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
	},
	{
		path: ["gateway", "bind"],
		message: "gateway.bind host aliases (for example 0.0.0.0/localhost) are legacy; use bind modes (lan/loopback/custom/tailnet/auto) instead (auto-migrated on load).",
		match: (value) => isLegacyGatewayBindHostAlias(value),
		requireSourceLiteral: true
	},
	{
		path: ["heartbeat"],
		message: "top-level heartbeat is not a valid config path; use agents.defaults.heartbeat (cadence/target/model settings) or channels.defaults.heartbeat (showOk/showAlerts/useIndicator)."
	}
];
//#endregion
//#region src/config/legacy.ts
function getPathValue(root, path) {
	let cursor = root;
	for (const key of path) {
		if (!cursor || typeof cursor !== "object") return;
		cursor = cursor[key];
	}
	return cursor;
}
function findLegacyConfigIssues(raw, sourceRaw) {
	if (!raw || typeof raw !== "object") return [];
	const root = raw;
	const sourceRoot = sourceRaw && typeof sourceRaw === "object" ? sourceRaw : root;
	const issues = [];
	for (const rule of LEGACY_CONFIG_RULES) {
		const cursor = getPathValue(root, rule.path);
		if (cursor !== void 0 && (!rule.match || rule.match(cursor, root))) {
			if (rule.requireSourceLiteral) {
				const sourceCursor = getPathValue(sourceRoot, rule.path);
				if (sourceCursor === void 0) continue;
				if (rule.match && !rule.match(sourceCursor, sourceRoot)) continue;
			}
			issues.push({
				path: rule.path.join("."),
				message: rule.message
			});
		}
	}
	return issues;
}
function applyLegacyMigrations(raw) {
	if (!raw || typeof raw !== "object") return {
		next: null,
		changes: []
	};
	const next = structuredClone(raw);
	const changes = [];
	for (const migration of LEGACY_CONFIG_MIGRATIONS) migration.apply(next, changes);
	if (changes.length === 0) return {
		next: null,
		changes: []
	};
	return {
		next,
		changes
	};
}
//#endregion
//#region src/config/merge-patch.ts
function isObjectWithStringId(value) {
	if (!isPlainObject$2(value)) return false;
	return typeof value.id === "string" && value.id.length > 0;
}
/**
* Merge arrays of object-like entries keyed by `id`.
*
* Contract:
* - Base array must be fully id-keyed; otherwise return undefined (caller should replace).
* - Patch entries with valid id merge by id (or append when the id is new).
* - Patch entries without valid id append as-is, avoiding destructive full-array replacement.
*/
function mergeObjectArraysById(base, patch, options) {
	if (!base.every(isObjectWithStringId)) return;
	const merged = [...base];
	const indexById = /* @__PURE__ */ new Map();
	for (const [index, entry] of merged.entries()) {
		if (!isObjectWithStringId(entry)) return;
		indexById.set(entry.id, index);
	}
	for (const patchEntry of patch) {
		if (!isObjectWithStringId(patchEntry)) {
			merged.push(structuredClone(patchEntry));
			continue;
		}
		const existingIndex = indexById.get(patchEntry.id);
		if (existingIndex === void 0) {
			merged.push(structuredClone(patchEntry));
			indexById.set(patchEntry.id, merged.length - 1);
			continue;
		}
		merged[existingIndex] = applyMergePatch(merged[existingIndex], patchEntry, options);
	}
	return merged;
}
function applyMergePatch(base, patch, options = {}) {
	if (!isPlainObject$2(patch)) return patch;
	const result = isPlainObject$2(base) ? { ...base } : {};
	for (const [key, value] of Object.entries(patch)) {
		if (isBlockedObjectKey(key)) continue;
		if (value === null) {
			delete result[key];
			continue;
		}
		if (options.mergeObjectArraysById && Array.isArray(result[key]) && Array.isArray(value)) {
			const mergedArray = mergeObjectArraysById(result[key], value, options);
			if (mergedArray) {
				result[key] = mergedArray;
				continue;
			}
		}
		if (isPlainObject$2(value)) {
			const baseValue = result[key];
			result[key] = applyMergePatch(isPlainObject$2(baseValue) ? baseValue : {}, value, options);
			continue;
		}
		result[key] = value;
	}
	return result;
}
//#endregion
//#region src/infra/exec-safe-bin-policy-profiles.ts
const NO_FLAGS$1 = /* @__PURE__ */ new Set();
const DEFAULT_SAFE_BINS = [
	"cut",
	"uniq",
	"head",
	"tail",
	"tr",
	"wc"
];
const toFlagSet = (flags) => {
	if (!flags || flags.length === 0) return NO_FLAGS$1;
	return new Set(flags);
};
function collectKnownLongFlags(allowedValueFlags, deniedFlags) {
	const known = /* @__PURE__ */ new Set();
	for (const flag of allowedValueFlags) if (flag.startsWith("--")) known.add(flag);
	for (const flag of deniedFlags) if (flag.startsWith("--")) known.add(flag);
	return Array.from(known);
}
function buildLongFlagPrefixMap(knownLongFlags) {
	const prefixMap = /* @__PURE__ */ new Map();
	for (const flag of knownLongFlags) {
		if (!flag.startsWith("--") || flag.length <= 2) continue;
		for (let length = 3; length <= flag.length; length += 1) {
			const prefix = flag.slice(0, length);
			const existing = prefixMap.get(prefix);
			if (existing === void 0) {
				prefixMap.set(prefix, flag);
				continue;
			}
			if (existing !== flag) prefixMap.set(prefix, null);
		}
	}
	return prefixMap;
}
function compileSafeBinProfile(fixture) {
	const allowedValueFlags = toFlagSet(fixture.allowedValueFlags);
	const deniedFlags = toFlagSet(fixture.deniedFlags);
	const knownLongFlags = collectKnownLongFlags(allowedValueFlags, deniedFlags);
	return {
		minPositional: fixture.minPositional,
		maxPositional: fixture.maxPositional,
		allowedValueFlags,
		deniedFlags,
		knownLongFlags,
		knownLongFlagsSet: new Set(knownLongFlags),
		longFlagPrefixMap: buildLongFlagPrefixMap(knownLongFlags)
	};
}
function compileSafeBinProfiles(fixtures) {
	return Object.fromEntries(Object.entries(fixtures).map(([name, fixture]) => [name, compileSafeBinProfile(fixture)]));
}
const SAFE_BIN_PROFILES = compileSafeBinProfiles({
	jq: {
		maxPositional: 1,
		allowedValueFlags: [
			"--arg",
			"--argjson",
			"--argstr"
		],
		deniedFlags: [
			"--argfile",
			"--rawfile",
			"--slurpfile",
			"--from-file",
			"--library-path",
			"-L",
			"-f"
		]
	},
	grep: {
		maxPositional: 0,
		allowedValueFlags: [
			"--regexp",
			"--max-count",
			"--after-context",
			"--before-context",
			"--context",
			"--devices",
			"--binary-files",
			"--exclude",
			"--include",
			"--label",
			"-e",
			"-m",
			"-A",
			"-B",
			"-C",
			"-D"
		],
		deniedFlags: [
			"--file",
			"--exclude-from",
			"--dereference-recursive",
			"--directories",
			"--recursive",
			"-f",
			"-d",
			"-r",
			"-R"
		]
	},
	cut: {
		maxPositional: 0,
		allowedValueFlags: [
			"--bytes",
			"--characters",
			"--fields",
			"--delimiter",
			"--output-delimiter",
			"-b",
			"-c",
			"-f",
			"-d"
		]
	},
	sort: {
		maxPositional: 0,
		allowedValueFlags: [
			"--key",
			"--field-separator",
			"--buffer-size",
			"--parallel",
			"--batch-size",
			"-k",
			"-t",
			"-S"
		],
		deniedFlags: [
			"--compress-program",
			"--files0-from",
			"--output",
			"--random-source",
			"--temporary-directory",
			"-T",
			"-o"
		]
	},
	uniq: {
		maxPositional: 0,
		allowedValueFlags: [
			"--skip-fields",
			"--skip-chars",
			"--check-chars",
			"--group",
			"-f",
			"-s",
			"-w"
		]
	},
	head: {
		maxPositional: 0,
		allowedValueFlags: [
			"--lines",
			"--bytes",
			"-n",
			"-c"
		]
	},
	tail: {
		maxPositional: 0,
		allowedValueFlags: [
			"--lines",
			"--bytes",
			"--sleep-interval",
			"--max-unchanged-stats",
			"--pid",
			"-n",
			"-c"
		]
	},
	tr: {
		minPositional: 1,
		maxPositional: 2
	},
	wc: {
		maxPositional: 0,
		deniedFlags: ["--files0-from"]
	}
});
function normalizeSafeBinProfileName(raw) {
	const name = raw.trim().toLowerCase();
	return name.length > 0 ? name : null;
}
function normalizeFixtureLimit(raw) {
	if (typeof raw !== "number" || !Number.isFinite(raw)) return;
	const next = Math.trunc(raw);
	return next >= 0 ? next : void 0;
}
function normalizeFixtureFlags(flags) {
	if (!Array.isArray(flags) || flags.length === 0) return;
	const normalized = Array.from(new Set(flags.map((flag) => flag.trim()).filter((flag) => flag.length > 0))).toSorted((a, b) => a.localeCompare(b));
	return normalized.length > 0 ? normalized : void 0;
}
function normalizeSafeBinProfileFixture(fixture) {
	const minPositional = normalizeFixtureLimit(fixture.minPositional);
	const maxPositionalRaw = normalizeFixtureLimit(fixture.maxPositional);
	return {
		minPositional,
		maxPositional: minPositional !== void 0 && maxPositionalRaw !== void 0 && maxPositionalRaw < minPositional ? minPositional : maxPositionalRaw,
		allowedValueFlags: normalizeFixtureFlags(fixture.allowedValueFlags),
		deniedFlags: normalizeFixtureFlags(fixture.deniedFlags)
	};
}
function normalizeSafeBinProfileFixtures(fixtures) {
	const normalized = {};
	if (!fixtures) return normalized;
	for (const [rawName, fixture] of Object.entries(fixtures)) {
		const name = normalizeSafeBinProfileName(rawName);
		if (!name) continue;
		normalized[name] = normalizeSafeBinProfileFixture(fixture);
	}
	return normalized;
}
function resolveSafeBinProfiles(fixtures) {
	const normalizedFixtures = normalizeSafeBinProfileFixtures(fixtures);
	if (Object.keys(normalizedFixtures).length === 0) return SAFE_BIN_PROFILES;
	return {
		...SAFE_BIN_PROFILES,
		...compileSafeBinProfiles(normalizedFixtures)
	};
}
//#endregion
//#region src/infra/exec-allowlist-pattern.ts
const GLOB_REGEX_CACHE_LIMIT = 512;
const globRegexCache = /* @__PURE__ */ new Map();
function normalizeMatchTarget(value) {
	if (process.platform === "win32") return value.replace(/^\\\\[?.]\\/, "").replace(/\\/g, "/").toLowerCase();
	return value.replace(/\\\\/g, "/");
}
function tryRealpath(value) {
	try {
		return fs.realpathSync(value);
	} catch {
		return null;
	}
}
function escapeRegExpLiteral(input) {
	return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function compileGlobRegex(pattern) {
	const cacheKey = `${process.platform}:${pattern}`;
	const cached = globRegexCache.get(cacheKey);
	if (cached) return cached;
	let regex = "^";
	let i = 0;
	while (i < pattern.length) {
		const ch = pattern[i];
		if (ch === "*") {
			if (pattern[i + 1] === "*") {
				regex += ".*";
				i += 2;
				continue;
			}
			regex += "[^/]*";
			i += 1;
			continue;
		}
		if (ch === "?") {
			regex += "[^/]";
			i += 1;
			continue;
		}
		regex += escapeRegExpLiteral(ch);
		i += 1;
	}
	regex += "$";
	const compiled = new RegExp(regex, process.platform === "win32" ? "i" : "");
	if (globRegexCache.size >= GLOB_REGEX_CACHE_LIMIT) globRegexCache.clear();
	globRegexCache.set(cacheKey, compiled);
	return compiled;
}
function matchesExecAllowlistPattern(pattern, target) {
	const trimmed = pattern.trim();
	if (!trimmed) return false;
	const expanded = trimmed.startsWith("~") ? expandHomePrefix(trimmed) : trimmed;
	const hasWildcard = /[*?]/.test(expanded);
	let normalizedPattern = expanded;
	let normalizedTarget = target;
	if (process.platform === "win32" && !hasWildcard) {
		normalizedPattern = tryRealpath(expanded) ?? expanded;
		normalizedTarget = tryRealpath(target) ?? target;
	}
	normalizedPattern = normalizeMatchTarget(normalizedPattern);
	normalizedTarget = normalizeMatchTarget(normalizedTarget);
	return compileGlobRegex(normalizedPattern).test(normalizedTarget);
}
//#endregion
//#region src/infra/exec-wrapper-tokens.ts
const WINDOWS_EXECUTABLE_SUFFIXES = [
	".exe",
	".cmd",
	".bat",
	".com"
];
function stripWindowsExecutableSuffix(value) {
	for (const suffix of WINDOWS_EXECUTABLE_SUFFIXES) if (value.endsWith(suffix)) return value.slice(0, -suffix.length);
	return value;
}
function basenameLower(token) {
	const win = path.win32.basename(token);
	const posix = path.posix.basename(token);
	return (win.length < posix.length ? win : posix).trim().toLowerCase();
}
function normalizeExecutableToken(token) {
	return stripWindowsExecutableSuffix(basenameLower(token));
}
const ENV_OPTIONS_WITH_VALUE = new Set([
	"-u",
	"--unset",
	"-c",
	"--chdir",
	"-s",
	"--split-string",
	"--default-signal",
	"--ignore-signal",
	"--block-signal"
]);
const ENV_INLINE_VALUE_PREFIXES = [
	"-u",
	"-c",
	"-s",
	"--unset=",
	"--chdir=",
	"--split-string=",
	"--default-signal=",
	"--ignore-signal=",
	"--block-signal="
];
const ENV_FLAG_OPTIONS = new Set([
	"-i",
	"--ignore-environment",
	"-0",
	"--null"
]);
const NICE_OPTIONS_WITH_VALUE = new Set([
	"-n",
	"--adjustment",
	"--priority"
]);
const STDBUF_OPTIONS_WITH_VALUE = new Set([
	"-i",
	"--input",
	"-o",
	"--output",
	"-e",
	"--error"
]);
const TIME_FLAG_OPTIONS = new Set([
	"-a",
	"--append",
	"-h",
	"--help",
	"-l",
	"-p",
	"-q",
	"--quiet",
	"-v",
	"--verbose",
	"-V",
	"--version"
]);
const TIME_OPTIONS_WITH_VALUE = new Set([
	"-f",
	"--format",
	"-o",
	"--output"
]);
const TIMEOUT_FLAG_OPTIONS = new Set([
	"--foreground",
	"--preserve-status",
	"-v",
	"--verbose"
]);
const TIMEOUT_OPTIONS_WITH_VALUE = new Set([
	"-k",
	"--kill-after",
	"-s",
	"--signal"
]);
function withWindowsExeAliases$1(names) {
	const expanded = /* @__PURE__ */ new Set();
	for (const name of names) {
		expanded.add(name);
		expanded.add(`${name}.exe`);
	}
	return Array.from(expanded);
}
function isEnvAssignment(token) {
	return /^[A-Za-z_][A-Za-z0-9_]*=.*/.test(token);
}
function hasEnvInlineValuePrefix(lower) {
	for (const prefix of ENV_INLINE_VALUE_PREFIXES) if (lower.startsWith(prefix)) return true;
	return false;
}
function scanWrapperInvocation(argv, params) {
	let idx = 1;
	let expectsOptionValue = false;
	while (idx < argv.length) {
		const token = argv[idx]?.trim() ?? "";
		if (!token) {
			idx += 1;
			continue;
		}
		if (expectsOptionValue) {
			expectsOptionValue = false;
			idx += 1;
			continue;
		}
		if (params.separators?.has(token)) {
			idx += 1;
			break;
		}
		const directive = params.onToken(token, token.toLowerCase());
		if (directive === "stop") break;
		if (directive === "invalid") return null;
		if (directive === "consume-next") expectsOptionValue = true;
		idx += 1;
	}
	if (expectsOptionValue) return null;
	const commandIndex = params.adjustCommandIndex ? params.adjustCommandIndex(idx, argv) : idx;
	if (commandIndex === null || commandIndex >= argv.length) return null;
	return argv.slice(commandIndex);
}
function unwrapEnvInvocation(argv) {
	return scanWrapperInvocation(argv, {
		separators: new Set(["--", "-"]),
		onToken: (token, lower) => {
			if (isEnvAssignment(token)) return "continue";
			if (!token.startsWith("-") || token === "-") return "stop";
			const [flag] = lower.split("=", 2);
			if (ENV_FLAG_OPTIONS.has(flag)) return "continue";
			if (ENV_OPTIONS_WITH_VALUE.has(flag)) return lower.includes("=") ? "continue" : "consume-next";
			if (hasEnvInlineValuePrefix(lower)) return "continue";
			return "invalid";
		}
	});
}
function envInvocationUsesModifiers(argv) {
	let idx = 1;
	let expectsOptionValue = false;
	while (idx < argv.length) {
		const token = argv[idx]?.trim() ?? "";
		if (!token) {
			idx += 1;
			continue;
		}
		if (expectsOptionValue) return true;
		if (token === "--" || token === "-") {
			idx += 1;
			break;
		}
		if (isEnvAssignment(token)) return true;
		if (!token.startsWith("-") || token === "-") break;
		const lower = token.toLowerCase();
		const [flag] = lower.split("=", 2);
		if (ENV_FLAG_OPTIONS.has(flag)) return true;
		if (ENV_OPTIONS_WITH_VALUE.has(flag)) {
			if (lower.includes("=")) return true;
			expectsOptionValue = true;
			idx += 1;
			continue;
		}
		if (hasEnvInlineValuePrefix(lower)) return true;
		return true;
	}
	return false;
}
function unwrapDashOptionInvocation(argv, params) {
	return scanWrapperInvocation(argv, {
		separators: new Set(["--"]),
		onToken: (token, lower) => {
			if (!token.startsWith("-") || token === "-") return "stop";
			const [flag] = lower.split("=", 2);
			return params.onFlag(flag, lower);
		},
		adjustCommandIndex: params.adjustCommandIndex
	});
}
function unwrapNiceInvocation(argv) {
	return unwrapDashOptionInvocation(argv, { onFlag: (flag, lower) => {
		if (/^-\d+$/.test(lower)) return "continue";
		if (NICE_OPTIONS_WITH_VALUE.has(flag)) return lower.includes("=") || lower !== flag ? "continue" : "consume-next";
		if (lower.startsWith("-n") && lower.length > 2) return "continue";
		return "invalid";
	} });
}
function unwrapNohupInvocation(argv) {
	return scanWrapperInvocation(argv, {
		separators: new Set(["--"]),
		onToken: (token, lower) => {
			if (!token.startsWith("-") || token === "-") return "stop";
			return lower === "--help" || lower === "--version" ? "continue" : "invalid";
		}
	});
}
function unwrapStdbufInvocation(argv) {
	return unwrapDashOptionInvocation(argv, { onFlag: (flag, lower) => {
		if (!STDBUF_OPTIONS_WITH_VALUE.has(flag)) return "invalid";
		return lower.includes("=") ? "continue" : "consume-next";
	} });
}
function unwrapTimeInvocation(argv) {
	return unwrapDashOptionInvocation(argv, { onFlag: (flag, lower) => {
		if (TIME_FLAG_OPTIONS.has(flag)) return "continue";
		if (TIME_OPTIONS_WITH_VALUE.has(flag)) return lower.includes("=") ? "continue" : "consume-next";
		return "invalid";
	} });
}
function unwrapTimeoutInvocation(argv) {
	return unwrapDashOptionInvocation(argv, {
		onFlag: (flag, lower) => {
			if (TIMEOUT_FLAG_OPTIONS.has(flag)) return "continue";
			if (TIMEOUT_OPTIONS_WITH_VALUE.has(flag)) return lower.includes("=") ? "continue" : "consume-next";
			return "invalid";
		},
		adjustCommandIndex: (commandIndex, currentArgv) => {
			const wrappedCommandIndex = commandIndex + 1;
			return wrappedCommandIndex < currentArgv.length ? wrappedCommandIndex : null;
		}
	});
}
const DISPATCH_WRAPPER_SPECS = [
	{ name: "chrt" },
	{ name: "doas" },
	{
		name: "env",
		unwrap: unwrapEnvInvocation,
		transparentUsage: (argv) => !envInvocationUsesModifiers(argv)
	},
	{ name: "ionice" },
	{
		name: "nice",
		unwrap: unwrapNiceInvocation,
		transparentUsage: true
	},
	{
		name: "nohup",
		unwrap: unwrapNohupInvocation,
		transparentUsage: true
	},
	{ name: "setsid" },
	{
		name: "stdbuf",
		unwrap: unwrapStdbufInvocation,
		transparentUsage: true
	},
	{ name: "sudo" },
	{ name: "taskset" },
	{
		name: "time",
		unwrap: unwrapTimeInvocation,
		transparentUsage: true
	},
	{
		name: "timeout",
		unwrap: unwrapTimeoutInvocation,
		transparentUsage: true
	}
];
const DISPATCH_WRAPPER_SPEC_BY_NAME = new Map(DISPATCH_WRAPPER_SPECS.map((spec) => [spec.name, spec]));
new Set(withWindowsExeAliases$1(DISPATCH_WRAPPER_SPECS.map((spec) => spec.name)));
function blockDispatchWrapper(wrapper) {
	return {
		kind: "blocked",
		wrapper
	};
}
function unwrapDispatchWrapper(wrapper, unwrapped) {
	return unwrapped ? {
		kind: "unwrapped",
		wrapper,
		argv: unwrapped
	} : blockDispatchWrapper(wrapper);
}
function unwrapKnownDispatchWrapperInvocation(argv) {
	const token0 = argv[0]?.trim();
	if (!token0) return { kind: "not-wrapper" };
	const wrapper = normalizeExecutableToken(token0);
	const spec = DISPATCH_WRAPPER_SPEC_BY_NAME.get(wrapper);
	if (!spec) return { kind: "not-wrapper" };
	return spec.unwrap ? unwrapDispatchWrapper(wrapper, spec.unwrap(argv)) : blockDispatchWrapper(wrapper);
}
function unwrapDispatchWrappersForResolution(argv, maxDepth = 4) {
	return resolveDispatchWrapperTrustPlan(argv, maxDepth).argv;
}
function isSemanticDispatchWrapperUsage(wrapper, argv) {
	const spec = DISPATCH_WRAPPER_SPEC_BY_NAME.get(wrapper);
	if (!spec?.unwrap) return true;
	const transparentUsage = spec.transparentUsage;
	if (typeof transparentUsage === "function") return !transparentUsage(argv);
	return transparentUsage !== true;
}
function blockedDispatchWrapperPlan(params) {
	return {
		argv: params.argv,
		wrappers: params.wrappers,
		policyBlocked: true,
		blockedWrapper: params.blockedWrapper
	};
}
function resolveDispatchWrapperTrustPlan(argv, maxDepth = 4) {
	let current = argv;
	const wrappers = [];
	for (let depth = 0; depth < maxDepth; depth += 1) {
		const unwrap = unwrapKnownDispatchWrapperInvocation(current);
		if (unwrap.kind === "blocked") return blockedDispatchWrapperPlan({
			argv: current,
			wrappers,
			blockedWrapper: unwrap.wrapper
		});
		if (unwrap.kind !== "unwrapped" || unwrap.argv.length === 0) break;
		wrappers.push(unwrap.wrapper);
		if (isSemanticDispatchWrapperUsage(unwrap.wrapper, current)) return blockedDispatchWrapperPlan({
			argv: current,
			wrappers,
			blockedWrapper: unwrap.wrapper
		});
		current = unwrap.argv;
	}
	if (wrappers.length >= maxDepth) {
		const overflow = unwrapKnownDispatchWrapperInvocation(current);
		if (overflow.kind === "blocked" || overflow.kind === "unwrapped") return blockedDispatchWrapperPlan({
			argv: current,
			wrappers,
			blockedWrapper: overflow.wrapper
		});
	}
	return {
		argv: current,
		wrappers,
		policyBlocked: false
	};
}
function hasDispatchEnvManipulation(argv) {
	const unwrap = unwrapKnownDispatchWrapperInvocation(argv);
	return unwrap.kind === "unwrapped" && unwrap.wrapper === "env" && envInvocationUsesModifiers(argv);
}
//#endregion
//#region src/infra/shell-inline-command.ts
const POSIX_INLINE_COMMAND_FLAGS = new Set([
	"-lc",
	"-c",
	"--command"
]);
const POWERSHELL_INLINE_COMMAND_FLAGS = new Set([
	"-c",
	"-command",
	"--command",
	"-f",
	"-file",
	"-encodedcommand",
	"-enc",
	"-e"
]);
function resolveInlineCommandMatch(argv, flags, options = {}) {
	for (let i = 1; i < argv.length; i += 1) {
		const token = argv[i]?.trim();
		if (!token) continue;
		const lower = token.toLowerCase();
		if (lower === "--") break;
		if (flags.has(lower)) {
			const valueTokenIndex = i + 1 < argv.length ? i + 1 : null;
			const command = argv[i + 1]?.trim();
			return {
				command: command ? command : null,
				valueTokenIndex
			};
		}
		if (options.allowCombinedC && /^-[^-]*c[^-]*$/i.test(token)) {
			const commandIndex = lower.indexOf("c");
			const inline = token.slice(commandIndex + 1).trim();
			if (inline) return {
				command: inline,
				valueTokenIndex: i
			};
			const valueTokenIndex = i + 1 < argv.length ? i + 1 : null;
			const command = argv[i + 1]?.trim();
			return {
				command: command ? command : null,
				valueTokenIndex
			};
		}
	}
	return {
		command: null,
		valueTokenIndex: null
	};
}
//#endregion
//#region src/infra/shell-wrapper-resolution.ts
const POSIX_SHELL_WRAPPER_NAMES = [
	"ash",
	"bash",
	"dash",
	"fish",
	"ksh",
	"sh",
	"zsh"
];
const WINDOWS_CMD_WRAPPER_NAMES = ["cmd"];
const POWERSHELL_WRAPPER_NAMES = ["powershell", "pwsh"];
const SHELL_MULTIPLEXER_WRAPPER_NAMES = ["busybox", "toybox"];
function withWindowsExeAliases(names) {
	const expanded = /* @__PURE__ */ new Set();
	for (const name of names) {
		expanded.add(name);
		expanded.add(`${name}.exe`);
	}
	return Array.from(expanded);
}
const POSIX_SHELL_WRAPPERS = new Set(POSIX_SHELL_WRAPPER_NAMES);
new Set(withWindowsExeAliases(WINDOWS_CMD_WRAPPER_NAMES));
new Set(withWindowsExeAliases(POWERSHELL_WRAPPER_NAMES));
const POSIX_SHELL_WRAPPER_CANONICAL = new Set(POSIX_SHELL_WRAPPER_NAMES);
const WINDOWS_CMD_WRAPPER_CANONICAL = new Set(WINDOWS_CMD_WRAPPER_NAMES);
const POWERSHELL_WRAPPER_CANONICAL = new Set(POWERSHELL_WRAPPER_NAMES);
const SHELL_MULTIPLEXER_WRAPPER_CANONICAL = new Set(SHELL_MULTIPLEXER_WRAPPER_NAMES);
const SHELL_WRAPPER_CANONICAL = new Set([
	...POSIX_SHELL_WRAPPER_NAMES,
	...WINDOWS_CMD_WRAPPER_NAMES,
	...POWERSHELL_WRAPPER_NAMES
]);
const SHELL_WRAPPER_SPECS = [
	{
		kind: "posix",
		names: POSIX_SHELL_WRAPPER_CANONICAL
	},
	{
		kind: "cmd",
		names: WINDOWS_CMD_WRAPPER_CANONICAL
	},
	{
		kind: "powershell",
		names: POWERSHELL_WRAPPER_CANONICAL
	}
];
function isWithinDispatchClassificationDepth(depth) {
	return depth <= 4;
}
function isShellWrapperExecutable(token) {
	return SHELL_WRAPPER_CANONICAL.has(normalizeExecutableToken(token));
}
function normalizeRawCommand(rawCommand) {
	const trimmed = rawCommand?.trim() ?? "";
	return trimmed.length > 0 ? trimmed : null;
}
function findShellWrapperSpec(baseExecutable) {
	for (const spec of SHELL_WRAPPER_SPECS) if (spec.names.has(baseExecutable)) return spec;
	return null;
}
function unwrapKnownShellMultiplexerInvocation(argv) {
	const token0 = argv[0]?.trim();
	if (!token0) return { kind: "not-wrapper" };
	const wrapper = normalizeExecutableToken(token0);
	if (!SHELL_MULTIPLEXER_WRAPPER_CANONICAL.has(wrapper)) return { kind: "not-wrapper" };
	let appletIndex = 1;
	if (argv[appletIndex]?.trim() === "--") appletIndex += 1;
	const applet = argv[appletIndex]?.trim();
	if (!applet || !isShellWrapperExecutable(applet)) return {
		kind: "blocked",
		wrapper
	};
	const unwrapped = argv.slice(appletIndex);
	if (unwrapped.length === 0) return {
		kind: "blocked",
		wrapper
	};
	return {
		kind: "unwrapped",
		wrapper,
		argv: unwrapped
	};
}
function extractPosixShellInlineCommand(argv) {
	return extractInlineCommandByFlags(argv, POSIX_INLINE_COMMAND_FLAGS, { allowCombinedC: true });
}
function extractCmdInlineCommand(argv) {
	const idx = argv.findIndex((item) => {
		const token = item.trim().toLowerCase();
		return token === "/c" || token === "/k";
	});
	if (idx === -1) return null;
	const tail = argv.slice(idx + 1);
	if (tail.length === 0) return null;
	const cmd = tail.join(" ").trim();
	return cmd.length > 0 ? cmd : null;
}
function extractPowerShellInlineCommand(argv) {
	return extractInlineCommandByFlags(argv, POWERSHELL_INLINE_COMMAND_FLAGS);
}
function extractInlineCommandByFlags(argv, flags, options = {}) {
	return resolveInlineCommandMatch(argv, flags, options).command;
}
function extractShellWrapperPayload(argv, spec) {
	switch (spec.kind) {
		case "posix": return extractPosixShellInlineCommand(argv);
		case "cmd": return extractCmdInlineCommand(argv);
		case "powershell": return extractPowerShellInlineCommand(argv);
	}
}
function hasEnvManipulationBeforeShellWrapperInternal(argv, depth, envManipulationSeen) {
	if (!isWithinDispatchClassificationDepth(depth)) return false;
	const token0 = argv[0]?.trim();
	if (!token0) return false;
	const dispatchUnwrap = unwrapKnownDispatchWrapperInvocation(argv);
	if (dispatchUnwrap.kind === "blocked") return false;
	if (dispatchUnwrap.kind === "unwrapped") {
		const nextEnvManipulationSeen = envManipulationSeen || hasDispatchEnvManipulation(argv);
		return hasEnvManipulationBeforeShellWrapperInternal(dispatchUnwrap.argv, depth + 1, nextEnvManipulationSeen);
	}
	const shellMultiplexerUnwrap = unwrapKnownShellMultiplexerInvocation(argv);
	if (shellMultiplexerUnwrap.kind === "blocked") return false;
	if (shellMultiplexerUnwrap.kind === "unwrapped") return hasEnvManipulationBeforeShellWrapperInternal(shellMultiplexerUnwrap.argv, depth + 1, envManipulationSeen);
	const wrapper = findShellWrapperSpec(normalizeExecutableToken(token0));
	if (!wrapper) return false;
	if (!extractShellWrapperPayload(argv, wrapper)) return false;
	return envManipulationSeen;
}
function hasEnvManipulationBeforeShellWrapper(argv) {
	return hasEnvManipulationBeforeShellWrapperInternal(argv, 0, false);
}
function extractShellWrapperCommandInternal(argv, rawCommand, depth) {
	if (!isWithinDispatchClassificationDepth(depth)) return {
		isWrapper: false,
		command: null
	};
	const token0 = argv[0]?.trim();
	if (!token0) return {
		isWrapper: false,
		command: null
	};
	const dispatchUnwrap = unwrapKnownDispatchWrapperInvocation(argv);
	if (dispatchUnwrap.kind === "blocked") return {
		isWrapper: false,
		command: null
	};
	if (dispatchUnwrap.kind === "unwrapped") return extractShellWrapperCommandInternal(dispatchUnwrap.argv, rawCommand, depth + 1);
	const shellMultiplexerUnwrap = unwrapKnownShellMultiplexerInvocation(argv);
	if (shellMultiplexerUnwrap.kind === "blocked") return {
		isWrapper: false,
		command: null
	};
	if (shellMultiplexerUnwrap.kind === "unwrapped") return extractShellWrapperCommandInternal(shellMultiplexerUnwrap.argv, rawCommand, depth + 1);
	const wrapper = findShellWrapperSpec(normalizeExecutableToken(token0));
	if (!wrapper) return {
		isWrapper: false,
		command: null
	};
	const payload = extractShellWrapperPayload(argv, wrapper);
	if (!payload) return {
		isWrapper: false,
		command: null
	};
	return {
		isWrapper: true,
		command: rawCommand ?? payload
	};
}
function extractShellWrapperInlineCommand(argv) {
	const extracted = extractShellWrapperCommandInternal(argv, null, 0);
	return extracted.isWrapper ? extracted.command : null;
}
function extractShellWrapperCommand(argv, rawCommand) {
	return extractShellWrapperCommandInternal(argv, normalizeRawCommand(rawCommand), 0);
}
//#endregion
//#region src/infra/exec-wrapper-trust-plan.ts
function blockedExecWrapperTrustPlan(params) {
	return {
		argv: params.argv,
		policyArgv: params.policyArgv ?? params.argv,
		wrapperChain: params.wrapperChain,
		policyBlocked: true,
		blockedWrapper: params.blockedWrapper,
		shellWrapperExecutable: false,
		shellInlineCommand: null
	};
}
function finalizeExecWrapperTrustPlan(argv, policyArgv, wrapperChain, policyBlocked, blockedWrapper) {
	const rawExecutable = argv[0]?.trim() ?? "";
	const shellWrapperExecutable = !policyBlocked && rawExecutable.length > 0 && isShellWrapperExecutable(rawExecutable);
	return {
		argv,
		policyArgv,
		wrapperChain,
		policyBlocked,
		blockedWrapper,
		shellWrapperExecutable,
		shellInlineCommand: shellWrapperExecutable ? extractShellWrapperInlineCommand(argv) : null
	};
}
function resolveExecWrapperTrustPlan(argv, maxDepth = 4) {
	let current = argv;
	let policyArgv = argv;
	let sawShellMultiplexer = false;
	const wrapperChain = [];
	for (let depth = 0; depth < maxDepth; depth += 1) {
		const dispatchPlan = resolveDispatchWrapperTrustPlan(current, maxDepth - wrapperChain.length);
		if (dispatchPlan.policyBlocked) return blockedExecWrapperTrustPlan({
			argv: dispatchPlan.argv,
			policyArgv: dispatchPlan.argv,
			wrapperChain,
			blockedWrapper: dispatchPlan.blockedWrapper ?? current[0] ?? "unknown"
		});
		if (dispatchPlan.wrappers.length > 0) {
			wrapperChain.push(...dispatchPlan.wrappers);
			current = dispatchPlan.argv;
			if (!sawShellMultiplexer) policyArgv = current;
			if (wrapperChain.length >= maxDepth) break;
			continue;
		}
		const shellMultiplexerUnwrap = unwrapKnownShellMultiplexerInvocation(current);
		if (shellMultiplexerUnwrap.kind === "blocked") return blockedExecWrapperTrustPlan({
			argv: current,
			policyArgv,
			wrapperChain,
			blockedWrapper: shellMultiplexerUnwrap.wrapper
		});
		if (shellMultiplexerUnwrap.kind === "unwrapped") {
			wrapperChain.push(shellMultiplexerUnwrap.wrapper);
			if (!sawShellMultiplexer) {
				policyArgv = current;
				sawShellMultiplexer = true;
			}
			current = shellMultiplexerUnwrap.argv;
			if (wrapperChain.length >= maxDepth) break;
			continue;
		}
		break;
	}
	if (wrapperChain.length >= maxDepth) {
		const dispatchOverflow = unwrapKnownDispatchWrapperInvocation(current);
		if (dispatchOverflow.kind === "blocked" || dispatchOverflow.kind === "unwrapped") return blockedExecWrapperTrustPlan({
			argv: current,
			policyArgv,
			wrapperChain,
			blockedWrapper: dispatchOverflow.wrapper
		});
		const shellMultiplexerOverflow = unwrapKnownShellMultiplexerInvocation(current);
		if (shellMultiplexerOverflow.kind === "blocked" || shellMultiplexerOverflow.kind === "unwrapped") return blockedExecWrapperTrustPlan({
			argv: current,
			policyArgv,
			wrapperChain,
			blockedWrapper: shellMultiplexerOverflow.wrapper
		});
	}
	return finalizeExecWrapperTrustPlan(current, policyArgv, wrapperChain, false);
}
//#endregion
//#region src/infra/executable-path.ts
function resolveWindowsExecutableExtensions(executable, env) {
	if (process.platform !== "win32") return [""];
	if (path.extname(executable).length > 0) return [""];
	return ["", ...(env?.PATHEXT ?? env?.Pathext ?? process.env.PATHEXT ?? process.env.Pathext ?? ".EXE;.CMD;.BAT;.COM").split(";").map((ext) => ext.toLowerCase())];
}
function resolveWindowsExecutableExtSet(env) {
	return new Set((env?.PATHEXT ?? env?.Pathext ?? process.env.PATHEXT ?? process.env.Pathext ?? ".EXE;.CMD;.BAT;.COM").split(";").map((ext) => ext.toLowerCase()).filter(Boolean));
}
function isExecutableFile(filePath) {
	try {
		if (!fs.statSync(filePath).isFile()) return false;
		if (process.platform === "win32") {
			const ext = path.extname(filePath).toLowerCase();
			if (!ext) return true;
			return resolveWindowsExecutableExtSet(void 0).has(ext);
		}
		fs.accessSync(filePath, fs.constants.X_OK);
		return true;
	} catch {
		return false;
	}
}
function resolveExecutableFromPathEnv(executable, pathEnv, env) {
	const entries = pathEnv.split(path.delimiter).filter(Boolean);
	const extensions = resolveWindowsExecutableExtensions(executable, env);
	for (const entry of entries) for (const ext of extensions) {
		const candidate = path.join(entry, executable + ext);
		if (isExecutableFile(candidate)) return candidate;
	}
}
function resolveExecutablePath(rawExecutable, options) {
	const expanded = rawExecutable.startsWith("~") ? expandHomePrefix(rawExecutable, { env: options?.env }) : rawExecutable;
	if (expanded.includes("/") || expanded.includes("\\")) {
		if (path.isAbsolute(expanded)) return isExecutableFile(expanded) ? expanded : void 0;
		const base = options?.cwd && options.cwd.trim() ? options.cwd.trim() : process.cwd();
		const candidate = path.resolve(base, expanded);
		return isExecutableFile(candidate) ? candidate : void 0;
	}
	return resolveExecutableFromPathEnv(expanded, options?.env?.PATH ?? options?.env?.Path ?? process.env.PATH ?? process.env.Path ?? "", options?.env);
}
//#endregion
//#region src/infra/exec-command-resolution.ts
function isCommandResolution(resolution) {
	return Boolean(resolution && "execution" in resolution && "policy" in resolution);
}
function parseFirstToken(command) {
	const trimmed = command.trim();
	if (!trimmed) return null;
	const first = trimmed[0];
	if (first === "\"" || first === "'") {
		const end = trimmed.indexOf(first, 1);
		if (end > 1) return trimmed.slice(1, end);
		return trimmed.slice(1);
	}
	const match = /^[^\s]+/.exec(trimmed);
	return match ? match[0] : null;
}
function tryResolveRealpath(filePath) {
	if (!filePath) return;
	try {
		return fs.realpathSync(filePath);
	} catch {
		return;
	}
}
function buildExecutableResolution(rawExecutable, params) {
	const resolvedPath = resolveExecutablePath(rawExecutable, {
		cwd: params.cwd,
		env: params.env
	});
	return {
		rawExecutable,
		resolvedPath,
		resolvedRealPath: tryResolveRealpath(resolvedPath),
		executableName: resolvedPath ? path.basename(resolvedPath) : rawExecutable
	};
}
function buildCommandResolution(params) {
	const execution = buildExecutableResolution(params.rawExecutable, params);
	const policy = params.policyRawExecutable ? buildExecutableResolution(params.policyRawExecutable, params) : execution;
	const resolution = {
		execution,
		policy,
		effectiveArgv: params.effectiveArgv,
		wrapperChain: params.wrapperChain,
		policyBlocked: params.policyBlocked,
		blockedWrapper: params.blockedWrapper
	};
	return Object.defineProperties(resolution, {
		rawExecutable: { get: () => execution.rawExecutable },
		resolvedPath: { get: () => execution.resolvedPath },
		resolvedRealPath: { get: () => execution.resolvedRealPath },
		executableName: { get: () => execution.executableName },
		policyResolution: { get: () => policy === execution ? void 0 : policy }
	});
}
function resolveCommandResolution(command, cwd, env) {
	const rawExecutable = parseFirstToken(command);
	if (!rawExecutable) return null;
	return buildCommandResolution({
		rawExecutable,
		effectiveArgv: [rawExecutable],
		wrapperChain: [],
		policyBlocked: false,
		cwd,
		env
	});
}
function resolveCommandResolutionFromArgv(argv, cwd, env) {
	const plan = resolveExecWrapperTrustPlan(argv);
	const effectiveArgv = plan.argv;
	const rawExecutable = effectiveArgv[0]?.trim();
	if (!rawExecutable) return null;
	return buildCommandResolution({
		rawExecutable,
		policyRawExecutable: plan.policyArgv[0]?.trim(),
		effectiveArgv,
		wrapperChain: plan.wrapperChain,
		policyBlocked: plan.policyBlocked,
		blockedWrapper: plan.blockedWrapper,
		cwd,
		env
	});
}
function resolveExecutableCandidatePathFromResolution(resolution, cwd) {
	if (!resolution) return;
	if (resolution.resolvedPath) return resolution.resolvedPath;
	const raw = resolution.rawExecutable?.trim();
	if (!raw) return;
	const expanded = raw.startsWith("~") ? expandHomePrefix(raw) : raw;
	if (!expanded.includes("/") && !expanded.includes("\\")) return;
	if (path.isAbsolute(expanded)) return expanded;
	const base = cwd && cwd.trim() ? cwd.trim() : process.cwd();
	return path.resolve(base, expanded);
}
function resolveExecutionTargetResolution(resolution) {
	if (!resolution) return null;
	return isCommandResolution(resolution) ? resolution.execution : resolution;
}
function resolvePolicyTargetResolution(resolution) {
	if (!resolution) return null;
	return isCommandResolution(resolution) ? resolution.policy : resolution;
}
function resolveExecutionTargetCandidatePath(resolution, cwd) {
	return resolveExecutableCandidatePathFromResolution(isCommandResolution(resolution) ? resolution.execution : resolution, cwd);
}
function resolvePolicyTargetCandidatePath(resolution, cwd) {
	return resolveExecutableCandidatePathFromResolution(isCommandResolution(resolution) ? resolution.policy : resolution, cwd);
}
function resolveApprovalAuditCandidatePath(resolution, cwd) {
	return resolvePolicyTargetCandidatePath(resolution, cwd);
}
function resolveAllowlistCandidatePath(resolution, cwd) {
	return resolveExecutionTargetCandidatePath(resolution, cwd);
}
function resolvePolicyAllowlistCandidatePath(resolution, cwd) {
	return resolvePolicyTargetCandidatePath(resolution, cwd);
}
function matchAllowlist(entries, resolution) {
	if (!entries.length) return null;
	const bareWild = entries.find((e) => e.pattern?.trim() === "*");
	if (bareWild && resolution) return bareWild;
	if (!resolution?.resolvedPath) return null;
	const resolvedPath = resolution.resolvedPath;
	for (const entry of entries) {
		const pattern = entry.pattern?.trim();
		if (!pattern) continue;
		if (!(pattern.includes("/") || pattern.includes("\\") || pattern.includes("~"))) continue;
		if (matchesExecAllowlistPattern(pattern, resolvedPath)) return entry;
	}
	return null;
}
/**
* Tokenizes a single argv entry into a normalized option/positional model.
* Consumers can share this model to keep argv parsing behavior consistent.
*/
function parseExecArgvToken(raw) {
	if (!raw) return {
		kind: "empty",
		raw
	};
	if (raw === "--") return {
		kind: "terminator",
		raw
	};
	if (raw === "-") return {
		kind: "stdin",
		raw
	};
	if (!raw.startsWith("-")) return {
		kind: "positional",
		raw
	};
	if (raw.startsWith("--")) {
		const eqIndex = raw.indexOf("=");
		if (eqIndex > 0) return {
			kind: "option",
			raw,
			style: "long",
			flag: raw.slice(0, eqIndex),
			inlineValue: raw.slice(eqIndex + 1)
		};
		return {
			kind: "option",
			raw,
			style: "long",
			flag: raw
		};
	}
	const cluster = raw.slice(1);
	return {
		kind: "option",
		raw,
		style: "short-cluster",
		cluster,
		flags: cluster.split("").map((entry) => `-${entry}`)
	};
}
//#endregion
//#region src/infra/exec-approvals-analysis.ts
const DISALLOWED_PIPELINE_TOKENS = new Set([
	">",
	"<",
	"`",
	"\n",
	"\r",
	"(",
	")"
]);
const DOUBLE_QUOTE_ESCAPES = new Set([
	"\\",
	"\"",
	"$",
	"`"
]);
const WINDOWS_UNSUPPORTED_TOKENS = new Set([
	"&",
	"|",
	"<",
	">",
	"^",
	"(",
	")",
	"%",
	"!",
	"\n",
	"\r"
]);
function isDoubleQuoteEscape(next) {
	return Boolean(next && DOUBLE_QUOTE_ESCAPES.has(next));
}
function isEscapedLineContinuation(next) {
	return next === "\n" || next === "\r";
}
function isShellCommentStart(source, index) {
	if (source[index] !== "#") return false;
	if (index === 0) return true;
	const prev = source[index - 1];
	return Boolean(prev && /\s/.test(prev));
}
function splitShellPipeline(command) {
	const parseHeredocDelimiter = (source, start) => {
		let i = start;
		while (i < source.length && (source[i] === " " || source[i] === "	")) i += 1;
		if (i >= source.length) return null;
		const first = source[i];
		if (first === "'" || first === "\"") {
			const quote = first;
			i += 1;
			let delimiter = "";
			while (i < source.length) {
				const ch = source[i];
				if (ch === "\n" || ch === "\r") return null;
				if (quote === "\"" && ch === "\\" && i + 1 < source.length) {
					delimiter += source[i + 1];
					i += 2;
					continue;
				}
				if (ch === quote) return {
					delimiter,
					end: i + 1,
					quoted: true
				};
				delimiter += ch;
				i += 1;
			}
			return null;
		}
		let delimiter = "";
		while (i < source.length) {
			const ch = source[i];
			if (/\s/.test(ch) || ch === "|" || ch === "&" || ch === ";" || ch === "<" || ch === ">") break;
			delimiter += ch;
			i += 1;
		}
		if (!delimiter) return null;
		return {
			delimiter,
			end: i,
			quoted: false
		};
	};
	const segments = [];
	let buf = "";
	let inSingle = false;
	let inDouble = false;
	let escaped = false;
	let emptySegment = false;
	const pendingHeredocs = [];
	let inHeredocBody = false;
	let heredocLine = "";
	const pushPart = () => {
		const trimmed = buf.trim();
		if (trimmed) segments.push(trimmed);
		buf = "";
	};
	const isEscapedInHeredocLine = (line, index) => {
		let slashes = 0;
		for (let i = index - 1; i >= 0 && line[i] === "\\"; i -= 1) slashes += 1;
		return slashes % 2 === 1;
	};
	const hasUnquotedHeredocExpansionToken = (line) => {
		for (let i = 0; i < line.length; i += 1) {
			const ch = line[i];
			if (ch === "`" && !isEscapedInHeredocLine(line, i)) return true;
			if (ch === "$" && !isEscapedInHeredocLine(line, i)) {
				const next = line[i + 1];
				if (next === "(" || next === "{") return true;
			}
		}
		return false;
	};
	for (let i = 0; i < command.length; i += 1) {
		const ch = command[i];
		const next = command[i + 1];
		if (inHeredocBody) {
			if (ch === "\n" || ch === "\r") {
				const current = pendingHeredocs[0];
				if (current) {
					if ((current.stripTabs ? heredocLine.replace(/^\t+/, "") : heredocLine) === current.delimiter) pendingHeredocs.shift();
					else if (!current.quoted && hasUnquotedHeredocExpansionToken(heredocLine)) return {
						ok: false,
						reason: "command substitution in unquoted heredoc",
						segments: []
					};
				}
				heredocLine = "";
				if (pendingHeredocs.length === 0) inHeredocBody = false;
				if (ch === "\r" && next === "\n") i += 1;
			} else heredocLine += ch;
			continue;
		}
		if (escaped) {
			buf += ch;
			escaped = false;
			emptySegment = false;
			continue;
		}
		if (!inSingle && !inDouble && ch === "\\") {
			escaped = true;
			buf += ch;
			emptySegment = false;
			continue;
		}
		if (inSingle) {
			if (ch === "'") inSingle = false;
			buf += ch;
			emptySegment = false;
			continue;
		}
		if (inDouble) {
			if (ch === "\\" && isEscapedLineContinuation(next)) return {
				ok: false,
				reason: "unsupported shell token: newline",
				segments: []
			};
			if (ch === "\\" && isDoubleQuoteEscape(next)) {
				buf += ch;
				buf += next;
				i += 1;
				emptySegment = false;
				continue;
			}
			if (ch === "$" && next === "(") return {
				ok: false,
				reason: "unsupported shell token: $()",
				segments: []
			};
			if (ch === "`") return {
				ok: false,
				reason: "unsupported shell token: `",
				segments: []
			};
			if (ch === "\n" || ch === "\r") return {
				ok: false,
				reason: "unsupported shell token: newline",
				segments: []
			};
			if (ch === "\"") inDouble = false;
			buf += ch;
			emptySegment = false;
			continue;
		}
		if (ch === "'") {
			inSingle = true;
			buf += ch;
			emptySegment = false;
			continue;
		}
		if (ch === "\"") {
			inDouble = true;
			buf += ch;
			emptySegment = false;
			continue;
		}
		if (isShellCommentStart(command, i)) break;
		if ((ch === "\n" || ch === "\r") && pendingHeredocs.length > 0) {
			inHeredocBody = true;
			heredocLine = "";
			if (ch === "\r" && next === "\n") i += 1;
			continue;
		}
		if (ch === "|" && next === "|") return {
			ok: false,
			reason: "unsupported shell token: ||",
			segments: []
		};
		if (ch === "|" && next === "&") return {
			ok: false,
			reason: "unsupported shell token: |&",
			segments: []
		};
		if (ch === "|") {
			emptySegment = true;
			pushPart();
			continue;
		}
		if (ch === "&" || ch === ";") return {
			ok: false,
			reason: `unsupported shell token: ${ch}`,
			segments: []
		};
		if (ch === "<" && next === "<") {
			buf += "<<";
			emptySegment = false;
			i += 1;
			let scanIndex = i + 1;
			let stripTabs = false;
			if (command[scanIndex] === "-") {
				stripTabs = true;
				buf += "-";
				scanIndex += 1;
			}
			const parsed = parseHeredocDelimiter(command, scanIndex);
			if (parsed) {
				pendingHeredocs.push({
					delimiter: parsed.delimiter,
					stripTabs,
					quoted: parsed.quoted
				});
				buf += command.slice(scanIndex, parsed.end);
				i = parsed.end - 1;
			}
			continue;
		}
		if (DISALLOWED_PIPELINE_TOKENS.has(ch)) return {
			ok: false,
			reason: `unsupported shell token: ${ch}`,
			segments: []
		};
		if (ch === "$" && next === "(") return {
			ok: false,
			reason: "unsupported shell token: $()",
			segments: []
		};
		buf += ch;
		emptySegment = false;
	}
	if (inHeredocBody && pendingHeredocs.length > 0) {
		const current = pendingHeredocs[0];
		if ((current.stripTabs ? heredocLine.replace(/^\t+/, "") : heredocLine) === current.delimiter) {
			pendingHeredocs.shift();
			if (pendingHeredocs.length === 0) inHeredocBody = false;
		}
	}
	if (pendingHeredocs.length > 0 || inHeredocBody) return {
		ok: false,
		reason: "unterminated heredoc",
		segments: []
	};
	if (escaped || inSingle || inDouble) return {
		ok: false,
		reason: "unterminated shell quote/escape",
		segments: []
	};
	pushPart();
	if (emptySegment || segments.length === 0) return {
		ok: false,
		reason: segments.length === 0 ? "empty command" : "empty pipeline segment",
		segments: []
	};
	return {
		ok: true,
		segments
	};
}
function findWindowsUnsupportedToken(command) {
	for (const ch of command) if (WINDOWS_UNSUPPORTED_TOKENS.has(ch)) {
		if (ch === "\n" || ch === "\r") return "newline";
		return ch;
	}
	return null;
}
function tokenizeWindowsSegment(segment) {
	const tokens = [];
	let buf = "";
	let inDouble = false;
	const pushToken = () => {
		if (buf.length > 0) {
			tokens.push(buf);
			buf = "";
		}
	};
	for (let i = 0; i < segment.length; i += 1) {
		const ch = segment[i];
		if (ch === "\"") {
			inDouble = !inDouble;
			continue;
		}
		if (!inDouble && /\s/.test(ch)) {
			pushToken();
			continue;
		}
		buf += ch;
	}
	if (inDouble) return null;
	pushToken();
	return tokens.length > 0 ? tokens : null;
}
function analyzeWindowsShellCommand(params) {
	const unsupported = findWindowsUnsupportedToken(params.command);
	if (unsupported) return {
		ok: false,
		reason: `unsupported windows shell token: ${unsupported}`,
		segments: []
	};
	const argv = tokenizeWindowsSegment(params.command);
	if (!argv || argv.length === 0) return {
		ok: false,
		reason: "unable to parse windows command",
		segments: []
	};
	return {
		ok: true,
		segments: [{
			raw: params.command,
			argv,
			resolution: resolveCommandResolutionFromArgv(argv, params.cwd, params.env)
		}]
	};
}
function isWindowsPlatform(platform) {
	return String(platform ?? "").trim().toLowerCase().startsWith("win");
}
function parseSegmentsFromParts(parts, cwd, env) {
	const segments = [];
	for (const raw of parts) {
		const argv = splitShellArgs(raw);
		if (!argv || argv.length === 0) return null;
		segments.push({
			raw,
			argv,
			resolution: resolveCommandResolutionFromArgv(argv, cwd, env)
		});
	}
	return segments;
}
/**
* Splits a command string by chain operators (&&, ||, ;) while preserving the operators.
* Returns null when no chain is present or when the chain is malformed.
*/
function splitCommandChainWithOperators(command) {
	const parts = [];
	let buf = "";
	let inSingle = false;
	let inDouble = false;
	let escaped = false;
	let foundChain = false;
	let invalidChain = false;
	const pushPart = (opToNext) => {
		const trimmed = buf.trim();
		buf = "";
		if (!trimmed) return false;
		parts.push({
			part: trimmed,
			opToNext
		});
		return true;
	};
	for (let i = 0; i < command.length; i += 1) {
		const ch = command[i];
		const next = command[i + 1];
		if (escaped) {
			buf += ch;
			escaped = false;
			continue;
		}
		if (!inSingle && !inDouble && ch === "\\") {
			escaped = true;
			buf += ch;
			continue;
		}
		if (inSingle) {
			if (ch === "'") inSingle = false;
			buf += ch;
			continue;
		}
		if (inDouble) {
			if (ch === "\\" && isEscapedLineContinuation(next)) {
				invalidChain = true;
				break;
			}
			if (ch === "\\" && isDoubleQuoteEscape(next)) {
				buf += ch;
				buf += next;
				i += 1;
				continue;
			}
			if (ch === "\"") inDouble = false;
			buf += ch;
			continue;
		}
		if (ch === "'") {
			inSingle = true;
			buf += ch;
			continue;
		}
		if (ch === "\"") {
			inDouble = true;
			buf += ch;
			continue;
		}
		if (isShellCommentStart(command, i)) break;
		if (ch === "&" && next === "&") {
			if (!pushPart("&&")) invalidChain = true;
			i += 1;
			foundChain = true;
			continue;
		}
		if (ch === "|" && next === "|") {
			if (!pushPart("||")) invalidChain = true;
			i += 1;
			foundChain = true;
			continue;
		}
		if (ch === ";") {
			if (!pushPart(";")) invalidChain = true;
			foundChain = true;
			continue;
		}
		buf += ch;
	}
	if (!foundChain) return null;
	const trimmed = buf.trim();
	if (!trimmed) return null;
	parts.push({
		part: trimmed,
		opToNext: null
	});
	if (invalidChain || parts.length === 0) return null;
	return parts;
}
function shellEscapeSingleArg(value) {
	return `'${value.replace(/'/g, `'"'"'`)}'`;
}
function rebuildShellCommandFromSource(params) {
	if (isWindowsPlatform(params.platform ?? null)) return {
		ok: false,
		reason: "unsupported platform"
	};
	const source = params.command.trim();
	if (!source) return {
		ok: false,
		reason: "empty command"
	};
	const chainParts = splitCommandChainWithOperators(source) ?? [{
		part: source,
		opToNext: null
	}];
	let segmentCount = 0;
	let out = "";
	for (const part of chainParts) {
		const pipelineSplit = splitShellPipeline(part.part);
		if (!pipelineSplit.ok) return {
			ok: false,
			reason: pipelineSplit.reason ?? "unable to parse pipeline"
		};
		const renderedSegments = [];
		for (const segmentRaw of pipelineSplit.segments) {
			const rendered = params.renderSegment(segmentRaw, segmentCount);
			if (!rendered.ok) return {
				ok: false,
				reason: rendered.reason
			};
			renderedSegments.push(rendered.rendered);
			segmentCount += 1;
		}
		out += renderedSegments.join(" | ");
		if (part.opToNext) out += ` ${part.opToNext} `;
	}
	return {
		ok: true,
		command: out,
		segmentCount
	};
}
/**
* Builds a shell command string that preserves pipes/chaining, but forces *arguments* to be
* literal (no globbing, no env-var expansion) by single-quoting every argv token.
*
* Used to make "safe bins" actually stdin-only even though execution happens via `shell -c`.
*/
function buildSafeShellCommand(params) {
	return finalizeRebuiltShellCommand(rebuildShellCommandFromSource({
		command: params.command,
		platform: params.platform,
		renderSegment: (segmentRaw) => {
			const argv = splitShellArgs(segmentRaw);
			if (!argv || argv.length === 0) return {
				ok: false,
				reason: "unable to parse shell segment"
			};
			return {
				ok: true,
				rendered: argv.map((token) => shellEscapeSingleArg(token)).join(" ")
			};
		}
	}));
}
function renderQuotedArgv(argv) {
	return argv.map((token) => shellEscapeSingleArg(token)).join(" ");
}
function finalizeRebuiltShellCommand(rebuilt, expectedSegmentCount) {
	if (!rebuilt.ok) return {
		ok: false,
		reason: rebuilt.reason
	};
	if (typeof expectedSegmentCount === "number" && rebuilt.segmentCount !== expectedSegmentCount) return {
		ok: false,
		reason: "segment count mismatch"
	};
	return {
		ok: true,
		command: rebuilt.command
	};
}
function resolvePlannedSegmentArgv(segment) {
	if (segment.resolution?.policyBlocked === true) return null;
	const baseArgv = segment.resolution?.effectiveArgv && segment.resolution.effectiveArgv.length > 0 ? segment.resolution.effectiveArgv : segment.argv;
	if (baseArgv.length === 0) return null;
	const argv = [...baseArgv];
	const execution = segment.resolution?.execution;
	const resolvedExecutable = execution?.resolvedRealPath?.trim() ?? execution?.resolvedPath?.trim() ?? "";
	if (resolvedExecutable) argv[0] = resolvedExecutable;
	return argv;
}
function renderSafeBinSegmentArgv(segment) {
	const argv = resolvePlannedSegmentArgv(segment);
	if (!argv || argv.length === 0) return null;
	return renderQuotedArgv(argv);
}
/**
* Rebuilds a shell command and selectively single-quotes argv tokens for segments that
* must be treated as literal (safeBins hardening) while preserving the rest of the
* shell syntax (pipes + chaining).
*/
function buildSafeBinsShellCommand(params) {
	if (params.segments.length !== params.segmentSatisfiedBy.length) return {
		ok: false,
		reason: "segment metadata mismatch"
	};
	return finalizeRebuiltShellCommand(rebuildShellCommandFromSource({
		command: params.command,
		platform: params.platform,
		renderSegment: (raw, segmentIndex) => {
			const seg = params.segments[segmentIndex];
			const by = params.segmentSatisfiedBy[segmentIndex];
			if (!seg || by === void 0) return {
				ok: false,
				reason: "segment mapping failed"
			};
			if (!(by === "safeBins")) return {
				ok: true,
				rendered: raw.trim()
			};
			const rendered = renderSafeBinSegmentArgv(seg);
			if (!rendered) return {
				ok: false,
				reason: "segment execution plan unavailable"
			};
			return {
				ok: true,
				rendered
			};
		}
	}), params.segments.length);
}
function buildEnforcedShellCommand(params) {
	return finalizeRebuiltShellCommand(rebuildShellCommandFromSource({
		command: params.command,
		platform: params.platform,
		renderSegment: (_raw, segmentIndex) => {
			const seg = params.segments[segmentIndex];
			if (!seg) return {
				ok: false,
				reason: "segment mapping failed"
			};
			const argv = resolvePlannedSegmentArgv(seg);
			if (!argv) return {
				ok: false,
				reason: "segment execution plan unavailable"
			};
			return {
				ok: true,
				rendered: renderQuotedArgv(argv)
			};
		}
	}), params.segments.length);
}
/**
* Splits a command string by chain operators (&&, ||, ;) while respecting quotes.
* Returns null when no chain is present or when the chain is malformed.
*/
function splitCommandChain(command) {
	const parts = splitCommandChainWithOperators(command);
	if (!parts) return null;
	return parts.map((p) => p.part);
}
function analyzeShellCommand(params) {
	if (isWindowsPlatform(params.platform)) return analyzeWindowsShellCommand(params);
	const chainParts = splitCommandChain(params.command);
	if (chainParts) {
		const chains = [];
		const allSegments = [];
		for (const part of chainParts) {
			const pipelineSplit = splitShellPipeline(part);
			if (!pipelineSplit.ok) return {
				ok: false,
				reason: pipelineSplit.reason,
				segments: []
			};
			const segments = parseSegmentsFromParts(pipelineSplit.segments, params.cwd, params.env);
			if (!segments) return {
				ok: false,
				reason: "unable to parse shell segment",
				segments: []
			};
			chains.push(segments);
			allSegments.push(...segments);
		}
		return {
			ok: true,
			segments: allSegments,
			chains
		};
	}
	const split = splitShellPipeline(params.command);
	if (!split.ok) return {
		ok: false,
		reason: split.reason,
		segments: []
	};
	const segments = parseSegmentsFromParts(split.segments, params.cwd, params.env);
	if (!segments) return {
		ok: false,
		reason: "unable to parse shell segment",
		segments: []
	};
	return {
		ok: true,
		segments
	};
}
function analyzeArgvCommand(params) {
	const argv = params.argv.filter((entry) => entry.trim().length > 0);
	if (argv.length === 0) return {
		ok: false,
		reason: "empty argv",
		segments: []
	};
	return {
		ok: true,
		segments: [{
			raw: argv.join(" "),
			argv,
			resolution: resolveCommandResolutionFromArgv(argv, params.cwd, params.env)
		}]
	};
}
//#endregion
//#region src/infra/exec-safe-bin-semantics.ts
const JQ_ENV_FILTER_PATTERN = /(^|[^.$A-Za-z0-9_])env([^A-Za-z0-9_]|$)/;
const SAFE_BIN_SEMANTIC_RULES = { jq: {
	validate: ({ positional }) => !positional.some((token) => JQ_ENV_FILTER_PATTERN.test(token)),
	configWarning: "jq supports broad jq programs and builtins (for example `env`), so prefer explicit allowlist entries or approval-gated runs instead of safeBins."
} };
function normalizeSafeBinName(raw) {
	const trimmed = raw.trim().toLowerCase();
	if (!trimmed) return "";
	return (trimmed.split(/[\\/]/).at(-1) ?? trimmed).replace(/\.(?:exe|cmd|bat|com)$/i, "");
}
function getSafeBinSemanticRule(binName) {
	const normalized = typeof binName === "string" ? normalizeSafeBinName(binName) : "";
	return normalized ? SAFE_BIN_SEMANTIC_RULES[normalized] : void 0;
}
function validateSafeBinSemantics(params) {
	return getSafeBinSemanticRule(params.binName)?.validate?.(params) ?? true;
}
function listRiskyConfiguredSafeBins(entries) {
	const hits = /* @__PURE__ */ new Map();
	for (const entry of entries) {
		const normalized = normalizeSafeBinName(entry);
		if (!normalized || hits.has(normalized)) continue;
		const warning = getSafeBinSemanticRule(normalized)?.configWarning;
		if (!warning) continue;
		hits.set(normalized, warning);
	}
	return Array.from(hits.entries()).map(([bin, warning]) => ({
		bin,
		warning
	})).toSorted((a, b) => a.bin.localeCompare(b.bin));
}
//#endregion
//#region src/infra/exec-safe-bin-policy-validator.ts
function isPathLikeToken(value) {
	const trimmed = value.trim();
	if (!trimmed) return false;
	if (trimmed === "-") return false;
	if (trimmed.startsWith("./") || trimmed.startsWith("../") || trimmed.startsWith("~")) return true;
	if (trimmed.startsWith("/")) return true;
	return /^[A-Za-z]:[\\/]/.test(trimmed);
}
function hasGlobToken(value) {
	return /[*?[\]]/.test(value);
}
const NO_FLAGS = /* @__PURE__ */ new Set();
function isSafeLiteralToken(value) {
	if (!value || value === "-") return true;
	return !hasGlobToken(value) && !isPathLikeToken(value);
}
function isInvalidValueToken(value) {
	return !value || !isSafeLiteralToken(value);
}
function resolveCanonicalLongFlag(params) {
	if (!params.flag.startsWith("--") || params.flag.length <= 2) return null;
	if (params.knownLongFlagsSet.has(params.flag)) return params.flag;
	return params.longFlagPrefixMap.get(params.flag) ?? null;
}
function consumeLongOptionToken(params) {
	const canonicalFlag = resolveCanonicalLongFlag({
		flag: params.flag,
		knownLongFlagsSet: params.knownLongFlagsSet,
		longFlagPrefixMap: params.longFlagPrefixMap
	});
	if (!canonicalFlag) return -1;
	if (params.deniedFlags.has(canonicalFlag)) return -1;
	const expectsValue = params.allowedValueFlags.has(canonicalFlag);
	if (params.inlineValue !== void 0) {
		if (!expectsValue) return -1;
		return isSafeLiteralToken(params.inlineValue) ? params.index + 1 : -1;
	}
	if (!expectsValue) return params.index + 1;
	return isInvalidValueToken(params.args[params.index + 1]) ? -1 : params.index + 2;
}
function consumeShortOptionClusterToken(params) {
	for (let j = 0; j < params.flags.length; j += 1) {
		const flag = params.flags[j];
		if (params.deniedFlags.has(flag)) return -1;
		if (!params.allowedValueFlags.has(flag)) continue;
		const inlineValue = params.cluster.slice(j + 1);
		if (inlineValue) return isSafeLiteralToken(inlineValue) ? params.index + 1 : -1;
		return isInvalidValueToken(params.args[params.index + 1]) ? -1 : params.index + 2;
	}
	return -1;
}
function consumePositionalToken(token, positional) {
	if (!isSafeLiteralToken(token)) return false;
	positional.push(token);
	return true;
}
function validatePositionalCount(positional, profile) {
	const minPositional = profile.minPositional ?? 0;
	if (positional.length < minPositional) return false;
	if (typeof profile.maxPositional === "number" && positional.length > profile.maxPositional) return false;
	return true;
}
function collectPositionalTokens(args, profile) {
	const allowedValueFlags = profile.allowedValueFlags ?? NO_FLAGS;
	const deniedFlags = profile.deniedFlags ?? NO_FLAGS;
	const knownLongFlags = profile.knownLongFlags ?? collectKnownLongFlags(allowedValueFlags, deniedFlags);
	const knownLongFlagsSet = profile.knownLongFlagsSet ?? new Set(knownLongFlags);
	const longFlagPrefixMap = profile.longFlagPrefixMap ?? buildLongFlagPrefixMap(knownLongFlags);
	const positional = [];
	let i = 0;
	while (i < args.length) {
		const token = parseExecArgvToken(args[i] ?? "");
		if (token.kind === "empty" || token.kind === "stdin") {
			i += 1;
			continue;
		}
		if (token.kind === "terminator") {
			for (let j = i + 1; j < args.length; j += 1) {
				const rest = args[j];
				if (!rest || rest === "-") continue;
				if (!consumePositionalToken(rest, positional)) return null;
			}
			break;
		}
		if (token.kind === "positional") {
			if (!consumePositionalToken(token.raw, positional)) return null;
			i += 1;
			continue;
		}
		if (token.style === "long") {
			const nextIndex = consumeLongOptionToken({
				args,
				index: i,
				flag: token.flag,
				inlineValue: token.inlineValue,
				allowedValueFlags,
				deniedFlags,
				knownLongFlagsSet,
				longFlagPrefixMap
			});
			if (nextIndex < 0) return null;
			i = nextIndex;
			continue;
		}
		const nextIndex = consumeShortOptionClusterToken({
			args,
			index: i,
			cluster: token.cluster,
			flags: token.flags,
			allowedValueFlags,
			deniedFlags
		});
		if (nextIndex < 0) return null;
		i = nextIndex;
	}
	return positional;
}
function validateSafeBinArgv(args, profile, options) {
	const positional = collectPositionalTokens(args, profile);
	if (!positional) return false;
	if (!validatePositionalCount(positional, profile)) return false;
	return validateSafeBinSemantics({
		binName: options?.binName,
		positional
	});
}
//#endregion
//#region src/infra/exec-safe-bin-trust.ts
const DEFAULT_SAFE_BIN_TRUSTED_DIRS = ["/bin", "/usr/bin"];
let trustedSafeBinCache = null;
function normalizeTrustedDir(value) {
	const trimmed = value.trim();
	if (!trimmed) return null;
	return path.resolve(trimmed);
}
function normalizeTrustedSafeBinDirs(entries) {
	if (!Array.isArray(entries)) return [];
	const normalized = entries.map((entry) => entry.trim()).filter((entry) => entry.length > 0);
	return Array.from(new Set(normalized));
}
function resolveTrustedSafeBinDirs(entries) {
	const resolved = entries.map((entry) => normalizeTrustedDir(entry)).filter((entry) => Boolean(entry));
	return Array.from(new Set(resolved)).toSorted();
}
function buildTrustedSafeBinCacheKey(entries) {
	return resolveTrustedSafeBinDirs(normalizeTrustedSafeBinDirs(entries)).join("");
}
function buildTrustedSafeBinDirs(params = {}) {
	const baseDirs = params.baseDirs ?? DEFAULT_SAFE_BIN_TRUSTED_DIRS;
	const extraDirs = params.extraDirs ?? [];
	return new Set(resolveTrustedSafeBinDirs([...normalizeTrustedSafeBinDirs(baseDirs), ...normalizeTrustedSafeBinDirs(extraDirs)]));
}
function getTrustedSafeBinDirs(params = {}) {
	const baseDirs = params.baseDirs ?? DEFAULT_SAFE_BIN_TRUSTED_DIRS;
	const extraDirs = params.extraDirs ?? [];
	const key = buildTrustedSafeBinCacheKey([...baseDirs, ...extraDirs]);
	if (!params.refresh && trustedSafeBinCache?.key === key) return trustedSafeBinCache.dirs;
	const dirs = buildTrustedSafeBinDirs({
		baseDirs,
		extraDirs
	});
	trustedSafeBinCache = {
		key,
		dirs
	};
	return dirs;
}
function isTrustedSafeBinPath(params) {
	const trustedDirs = params.trustedDirs ?? getTrustedSafeBinDirs();
	const resolvedDir = path.dirname(path.resolve(params.resolvedPath));
	return trustedDirs.has(resolvedDir);
}
function listWritableExplicitTrustedSafeBinDirs(entries) {
	if (process.platform === "win32") return [];
	const resolved = resolveTrustedSafeBinDirs(normalizeTrustedSafeBinDirs(entries));
	const hits = [];
	for (const dir of resolved) {
		let stat;
		try {
			stat = fs.statSync(dir);
		} catch {
			continue;
		}
		if (!stat.isDirectory()) continue;
		const mode = stat.mode & 511;
		const groupWritable = (mode & 16) !== 0;
		const worldWritable = (mode & 2) !== 0;
		if (!groupWritable && !worldWritable) continue;
		hits.push({
			dir,
			groupWritable,
			worldWritable
		});
	}
	return hits;
}
//#endregion
//#region src/config/normalize-exec-safe-bin.ts
function normalizeExecSafeBinProfilesInConfig(cfg) {
	const normalizeExec = (exec) => {
		if (!exec || typeof exec !== "object" || Array.isArray(exec)) return;
		const typedExec = exec;
		const normalizedProfiles = normalizeSafeBinProfileFixtures(typedExec.safeBinProfiles);
		typedExec.safeBinProfiles = Object.keys(normalizedProfiles).length > 0 ? normalizedProfiles : void 0;
		const normalizedTrustedDirs = normalizeTrustedSafeBinDirs(typedExec.safeBinTrustedDirs);
		typedExec.safeBinTrustedDirs = normalizedTrustedDirs.length > 0 ? normalizedTrustedDirs : void 0;
	};
	normalizeExec(cfg.tools?.exec);
	const agents = Array.isArray(cfg.agents?.list) ? cfg.agents.list : [];
	for (const agent of agents) normalizeExec(agent?.tools?.exec);
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
	if (parts.some((part) => isBlockedObjectKey(part))) return {
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
function sanitizeOverrideValue(value, seen = /* @__PURE__ */ new WeakSet()) {
	if (Array.isArray(value)) return value.map((entry) => sanitizeOverrideValue(entry, seen));
	if (!isPlainObject$2(value)) return value;
	if (seen.has(value)) return {};
	seen.add(value);
	const sanitized = {};
	for (const [key, entry] of Object.entries(value)) {
		if (entry === void 0 || isBlockedObjectKey(key)) continue;
		sanitized[key] = sanitizeOverrideValue(entry, seen);
	}
	seen.delete(value);
	return sanitized;
}
function mergeOverrides(base, override) {
	if (!isPlainObject$2(base) || !isPlainObject$2(override)) return override;
	const next = { ...base };
	for (const [key, value] of Object.entries(override)) {
		if (value === void 0 || isBlockedObjectKey(key)) continue;
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
	setConfigValueAtPath(overrides, parsed.path, sanitizeOverrideValue(value));
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
//#region src/plugins/bundled-compat.ts
function withBundledPluginAllowlistCompat(params) {
	const allow = params.config?.plugins?.allow;
	if (!Array.isArray(allow) || allow.length === 0) return params.config;
	const allowSet = new Set(allow.map((entry) => entry.trim()).filter(Boolean));
	let changed = false;
	for (const pluginId of params.pluginIds) if (!allowSet.has(pluginId)) {
		allowSet.add(pluginId);
		changed = true;
	}
	if (!changed) return params.config;
	return {
		...params.config,
		plugins: {
			...params.config?.plugins,
			allow: [...allowSet]
		}
	};
}
function withBundledPluginEnablementCompat(params) {
	const existingEntries = params.config?.plugins?.entries ?? {};
	let changed = false;
	const nextEntries = { ...existingEntries };
	for (const pluginId of params.pluginIds) {
		if (existingEntries[pluginId] !== void 0) continue;
		nextEntries[pluginId] = { enabled: true };
		changed = true;
	}
	if (!changed) return params.config;
	return {
		...params.config,
		plugins: {
			...params.config?.plugins,
			entries: {
				...existingEntries,
				...nextEntries
			}
		}
	};
}
//#endregion
//#region src/plugins/bundled-web-search-ids.ts
const BUNDLED_WEB_SEARCH_PLUGIN_IDS = [
	"brave",
	"duckduckgo",
	"exa",
	"firecrawl",
	"google",
	"moonshot",
	"perplexity",
	"tavily",
	"xai"
];
function listBundledWebSearchPluginIds() {
	return [...BUNDLED_WEB_SEARCH_PLUGIN_IDS];
}
//#endregion
//#region src/config/allowed-values.ts
const MAX_ALLOWED_VALUES_HINT = 12;
const MAX_ALLOWED_VALUE_CHARS = 160;
function truncateHintText(text, limit) {
	if (text.length <= limit) return text;
	return `${text.slice(0, limit)}... (+${text.length - limit} chars)`;
}
function safeStringify(value) {
	try {
		const serialized = JSON.stringify(value);
		if (serialized !== void 0) return serialized;
	} catch {}
	return String(value);
}
function toAllowedValueLabel(value) {
	if (typeof value === "string") return JSON.stringify(truncateHintText(value, MAX_ALLOWED_VALUE_CHARS));
	return truncateHintText(safeStringify(value), MAX_ALLOWED_VALUE_CHARS);
}
function toAllowedValueValue(value) {
	if (typeof value === "string") return value;
	return safeStringify(value);
}
function toAllowedValueDedupKey(value) {
	if (value === null) return "null:null";
	const kind = typeof value;
	if (kind === "string") return `string:${value}`;
	return `${kind}:${safeStringify(value)}`;
}
function summarizeAllowedValues(values) {
	if (values.length === 0) return null;
	const deduped = [];
	const seenValues = /* @__PURE__ */ new Set();
	for (const item of values) {
		const dedupeKey = toAllowedValueDedupKey(item);
		if (seenValues.has(dedupeKey)) continue;
		seenValues.add(dedupeKey);
		deduped.push({
			value: toAllowedValueValue(item),
			label: toAllowedValueLabel(item)
		});
	}
	const shown = deduped.slice(0, MAX_ALLOWED_VALUES_HINT);
	const hiddenCount = deduped.length - shown.length;
	const formattedCore = shown.map((entry) => entry.label).join(", ");
	const formatted = hiddenCount > 0 ? `${formattedCore}, ... (+${hiddenCount} more)` : formattedCore;
	return {
		values: shown.map((entry) => entry.value),
		hiddenCount,
		formatted
	};
}
function messageAlreadyIncludesAllowedValues(message) {
	const lower = message.toLowerCase();
	return lower.includes("(allowed:") || lower.includes("expected one of");
}
function appendAllowedValuesHint(message, summary) {
	if (messageAlreadyIncludesAllowedValues(message)) return message;
	return `${message} (allowed: ${summary.formatted})`;
}
//#endregion
//#region src/plugins/schema-validator.ts
const require = createRequire(import.meta.url);
let ajvSingleton = null;
function getAjv() {
	if (ajvSingleton) return ajvSingleton;
	const ajvModule = require("ajv");
	ajvSingleton = new (typeof ajvModule.default === "function" ? ajvModule.default : ajvModule)({
		allErrors: true,
		strict: false,
		removeAdditional: false
	});
	return ajvSingleton;
}
const schemaCache = /* @__PURE__ */ new Map();
function normalizeAjvPath(instancePath) {
	const path = instancePath?.replace(/^\//, "").replace(/\//g, ".");
	return path && path.length > 0 ? path : "<root>";
}
function appendPathSegment(path, segment) {
	const trimmed = segment.trim();
	if (!trimmed) return path;
	if (path === "<root>") return trimmed;
	return `${path}.${trimmed}`;
}
function resolveMissingProperty(error) {
	if (error.keyword !== "required" && error.keyword !== "dependentRequired" && error.keyword !== "dependencies") return null;
	const missingProperty = error.params.missingProperty;
	return typeof missingProperty === "string" && missingProperty.trim() ? missingProperty : null;
}
function resolveAjvErrorPath(error) {
	const basePath = normalizeAjvPath(error.instancePath);
	const missingProperty = resolveMissingProperty(error);
	if (!missingProperty) return basePath;
	return appendPathSegment(basePath, missingProperty);
}
function extractAllowedValues(error) {
	if (error.keyword === "enum") {
		const allowedValues = error.params.allowedValues;
		return Array.isArray(allowedValues) ? allowedValues : null;
	}
	if (error.keyword === "const") {
		const params = error.params;
		if (!Object.prototype.hasOwnProperty.call(params, "allowedValue")) return null;
		return [params.allowedValue];
	}
	return null;
}
function getAjvAllowedValuesSummary(error) {
	const allowedValues = extractAllowedValues(error);
	if (!allowedValues) return null;
	return summarizeAllowedValues(allowedValues);
}
function formatAjvErrors(errors) {
	if (!errors || errors.length === 0) return [{
		path: "<root>",
		message: "invalid config",
		text: "<root>: invalid config"
	}];
	return errors.map((error) => {
		const path = resolveAjvErrorPath(error);
		const baseMessage = error.message ?? "invalid";
		const allowedValuesSummary = getAjvAllowedValuesSummary(error);
		const message = allowedValuesSummary ? appendAllowedValuesHint(baseMessage, allowedValuesSummary) : baseMessage;
		return {
			path,
			message,
			text: `${sanitizeTerminalText(path)}: ${sanitizeTerminalText(message)}`,
			...allowedValuesSummary ? {
				allowedValues: allowedValuesSummary.values,
				allowedValuesHiddenCount: allowedValuesSummary.hiddenCount
			} : {}
		};
	});
}
function validateJsonSchemaValue(params) {
	let cached = schemaCache.get(params.cacheKey);
	if (!cached || cached.schema !== params.schema) {
		cached = {
			validate: getAjv().compile(params.schema),
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
//#region src/config/byte-size.ts
/**
* Parse an optional byte-size value from config.
* Accepts non-negative numbers or strings like "2mb".
*/
function parseNonNegativeByteSize(value) {
	if (typeof value === "number" && Number.isFinite(value)) {
		const int = Math.floor(value);
		return int >= 0 ? int : null;
	}
	if (typeof value === "string") {
		const trimmed = value.trim();
		if (!trimmed) return null;
		try {
			const bytes = parseByteSize(trimmed, { defaultUnit: "b" });
			return bytes >= 0 ? bytes : null;
		} catch {
			return null;
		}
	}
	return null;
}
function isValidNonNegativeByteSizeString(value) {
	return parseNonNegativeByteSize(value) !== null;
}
//#endregion
//#region src/config/zod-schema.agent-defaults.ts
const AgentDefaultsSchema = z.object({
	model: AgentModelSchema.optional(),
	imageModel: AgentModelSchema.optional(),
	imageGenerationModel: AgentModelSchema.optional(),
	pdfModel: AgentModelSchema.optional(),
	pdfMaxBytesMb: z.number().positive().optional(),
	pdfMaxPages: z.number().int().positive().optional(),
	models: z.record(z.string(), z.object({
		alias: z.string().optional(),
		params: z.record(z.string(), z.unknown()).optional(),
		streaming: z.boolean().optional()
	}).strict()).optional(),
	workspace: z.string().optional(),
	repoRoot: z.string().optional(),
	skipBootstrap: z.boolean().optional(),
	bootstrapMaxChars: z.number().int().positive().optional(),
	bootstrapTotalMaxChars: z.number().int().positive().optional(),
	bootstrapPromptTruncationWarning: z.union([
		z.literal("off"),
		z.literal("once"),
		z.literal("always")
	]).optional(),
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
		reserveTokens: z.number().int().nonnegative().optional(),
		keepRecentTokens: z.number().int().positive().optional(),
		reserveTokensFloor: z.number().int().nonnegative().optional(),
		maxHistoryShare: z.number().min(.1).max(.9).optional(),
		customInstructions: z.string().optional(),
		identifierPolicy: z.union([
			z.literal("strict"),
			z.literal("off"),
			z.literal("custom")
		]).optional(),
		identifierInstructions: z.string().optional(),
		recentTurnsPreserve: z.number().int().min(0).max(12).optional(),
		qualityGuard: z.object({
			enabled: z.boolean().optional(),
			maxRetries: z.number().int().nonnegative().optional()
		}).strict().optional(),
		postIndexSync: z.enum([
			"off",
			"async",
			"await"
		]).optional(),
		postCompactionSections: z.array(z.string()).optional(),
		model: z.string().optional(),
		timeoutSeconds: z.number().int().positive().optional(),
		memoryFlush: z.object({
			enabled: z.boolean().optional(),
			softThresholdTokens: z.number().int().nonnegative().optional(),
			forceFlushTranscriptBytes: z.union([z.number().int().nonnegative(), z.string().refine(isValidNonNegativeByteSizeString, "Expected byte size string like 2mb")]).optional(),
			prompt: z.string().optional(),
			systemPrompt: z.string().optional()
		}).strict().optional()
	}).strict().optional(),
	embeddedPi: z.object({ projectSettingsPolicy: z.union([
		z.literal("trusted"),
		z.literal("sanitize"),
		z.literal("ignore")
	]).optional() }).strict().optional(),
	thinkingDefault: z.union([
		z.literal("off"),
		z.literal("minimal"),
		z.literal("low"),
		z.literal("medium"),
		z.literal("high"),
		z.literal("xhigh"),
		z.literal("adaptive")
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
	imageMaxDimensionPx: z.number().int().positive().optional(),
	typingIntervalSeconds: z.number().int().positive().optional(),
	typingMode: TypingModeSchema.optional(),
	heartbeat: HeartbeatSchema,
	maxConcurrent: z.number().int().positive().optional(),
	subagents: z.object({
		maxConcurrent: z.number().int().positive().optional(),
		maxSpawnDepth: z.number().int().min(1).max(5).optional().describe("Maximum nesting depth for sub-agent spawning. 1 = no nesting (default), 2 = sub-agents can spawn sub-sub-agents."),
		maxChildrenPerAgent: z.number().int().min(1).max(20).optional().describe("Maximum number of active children a single agent session can spawn (default: 5)."),
		archiveAfterMinutes: z.number().int().min(0).optional(),
		model: AgentModelSchema.optional(),
		thinking: z.string().optional(),
		runTimeoutSeconds: z.number().int().min(0).optional(),
		announceTimeoutMs: z.number().int().positive().optional()
	}).strict().optional(),
	sandbox: AgentSandboxSchema
}).strict().optional();
//#endregion
//#region src/config/zod-schema.agents.ts
const AgentsSchema = z.object({
	defaults: z.lazy(() => AgentDefaultsSchema).optional(),
	list: z.array(AgentEntrySchema).optional()
}).strict().optional();
const BindingMatchSchema = z.object({
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
}).strict();
const RouteBindingSchema = z.object({
	type: z.literal("route").optional(),
	agentId: z.string(),
	comment: z.string().optional(),
	match: BindingMatchSchema
}).strict();
const AcpBindingSchema = z.object({
	type: z.literal("acp"),
	agentId: z.string(),
	comment: z.string().optional(),
	match: BindingMatchSchema,
	acp: z.object({
		mode: z.enum(["persistent", "oneshot"]).optional(),
		label: z.string().optional(),
		cwd: z.string().optional(),
		backend: z.string().optional()
	}).strict().optional()
}).strict().superRefine((value, ctx) => {
	const peerId = value.match.peer?.id?.trim() ?? "";
	if (!peerId) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			path: ["match", "peer"],
			message: "ACP bindings require match.peer.id to target a concrete conversation."
		});
		return;
	}
	const channel = value.match.channel.trim().toLowerCase();
	if (channel !== "discord" && channel !== "telegram" && channel !== "feishu") {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			path: ["match", "channel"],
			message: "ACP bindings currently support only \"discord\", \"telegram\", and \"feishu\" channels."
		});
		return;
	}
	if (channel === "telegram" && !/^-\d+:topic:\d+$/.test(peerId)) ctx.addIssue({
		code: z.ZodIssueCode.custom,
		path: [
			"match",
			"peer",
			"id"
		],
		message: "Telegram ACP bindings require canonical topic IDs in the form -1001234567890:topic:42."
	});
	if (channel === "feishu") {
		const peerKind = value.match.peer?.kind;
		const isDirectId = (peerKind === "direct" || peerKind === "dm") && /^[^:]+$/.test(peerId) && !peerId.startsWith("oc_") && !peerId.startsWith("on_");
		const isTopicId = peerKind === "group" && /^oc_[^:]+:topic:[^:]+(?::sender:ou_[^:]+)?$/.test(peerId);
		if (!isDirectId && !isTopicId) ctx.addIssue({
			code: z.ZodIssueCode.custom,
			path: [
				"match",
				"peer",
				"id"
			],
			message: "Feishu ACP bindings require direct peer IDs for DMs or topic IDs in the form oc_group:topic:om_root[:sender:ou_xxx]."
		});
	}
});
const BindingsSchema = z.array(z.union([RouteBindingSchema, AcpBindingSchema])).optional();
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
//#region src/config/zod-schema.installs.ts
const InstallSourceSchema = z.union([
	z.literal("npm"),
	z.literal("archive"),
	z.literal("path"),
	z.literal("clawhub")
]);
const PluginInstallSourceSchema = z.union([InstallSourceSchema, z.literal("marketplace")]);
const InstallRecordShape = {
	source: InstallSourceSchema,
	spec: z.string().optional(),
	sourcePath: z.string().optional(),
	installPath: z.string().optional(),
	version: z.string().optional(),
	resolvedName: z.string().optional(),
	resolvedVersion: z.string().optional(),
	resolvedSpec: z.string().optional(),
	integrity: z.string().optional(),
	shasum: z.string().optional(),
	resolvedAt: z.string().optional(),
	installedAt: z.string().optional(),
	clawhubUrl: z.string().optional(),
	clawhubPackage: z.string().optional(),
	clawhubFamily: z.union([z.literal("code-plugin"), z.literal("bundle-plugin")]).optional(),
	clawhubChannel: z.union([
		z.literal("official"),
		z.literal("community"),
		z.literal("private")
	]).optional()
};
const PluginInstallRecordShape = {
	...InstallRecordShape,
	source: PluginInstallSourceSchema,
	marketplaceName: z.string().optional(),
	marketplaceSource: z.string().optional(),
	marketplacePlugin: z.string().optional()
};
//#endregion
//#region src/config/zod-schema.hooks.ts
function isSafeRelativeModulePath(raw) {
	const value = raw.trim();
	if (!value) return false;
	if (path.isAbsolute(value)) return false;
	if (value.startsWith("~")) return false;
	if (value.includes(":")) return false;
	if (value.split(/[\\/]+/g).some((part) => part === "..")) return false;
	return true;
}
const SafeRelativeModulePathSchema = z.string().refine(isSafeRelativeModulePath, "module must be a safe relative path (no absolute paths)");
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
		module: SafeRelativeModulePathSchema,
		export: z.string().optional()
	}).strict().optional()
}).strict().optional();
const InternalHookHandlerSchema = z.object({
	event: z.string(),
	module: SafeRelativeModulePathSchema,
	export: z.string().optional()
}).strict();
const HookConfigSchema = z.object({
	enabled: z.boolean().optional(),
	env: z.record(z.string(), z.string()).optional()
}).passthrough();
const HookInstallRecordSchema = z.object({
	...InstallRecordShape,
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
//#region src/config/zod-schema.providers-whatsapp.ts
const ToolPolicyBySenderSchema = z.record(z.string(), ToolPolicySchema).optional();
const WhatsAppGroupEntrySchema = z.object({
	requireMention: z.boolean().optional(),
	tools: ToolPolicySchema,
	toolsBySender: ToolPolicyBySenderSchema
}).strict().optional();
const WhatsAppGroupsSchema = z.record(z.string(), WhatsAppGroupEntrySchema).optional();
const WhatsAppAckReactionSchema = z.object({
	emoji: z.string().optional(),
	direct: z.boolean().optional().default(true),
	group: z.enum([
		"always",
		"mentions",
		"never"
	]).optional().default("mentions")
}).strict().optional();
const WhatsAppSharedSchema = z.object({
	enabled: z.boolean().optional(),
	capabilities: z.array(z.string()).optional(),
	markdown: MarkdownConfigSchema,
	configWrites: z.boolean().optional(),
	sendReadReceipts: z.boolean().optional(),
	messagePrefix: z.string().optional(),
	responsePrefix: z.string().optional(),
	dmPolicy: DmPolicySchema.optional().default("pairing"),
	selfChatMode: z.boolean().optional(),
	allowFrom: z.array(z.string()).optional(),
	defaultTo: z.string().optional(),
	groupAllowFrom: z.array(z.string()).optional(),
	groupPolicy: GroupPolicySchema.optional().default("allowlist"),
	historyLimit: z.number().int().min(0).optional(),
	dmHistoryLimit: z.number().int().min(0).optional(),
	dms: z.record(z.string(), DmConfigSchema.optional()).optional(),
	textChunkLimit: z.number().int().positive().optional(),
	chunkMode: z.enum(["length", "newline"]).optional(),
	blockStreaming: z.boolean().optional(),
	blockStreamingCoalesce: BlockStreamingCoalesceSchema.optional(),
	groups: WhatsAppGroupsSchema,
	ackReaction: WhatsAppAckReactionSchema,
	debounceMs: z.number().int().nonnegative().optional().default(0),
	heartbeat: ChannelHeartbeatVisibilitySchema,
	healthMonitor: ChannelHealthMonitorSchema
});
function enforceOpenDmPolicyAllowFromStar(params) {
	if (params.dmPolicy !== "open") return;
	if ((Array.isArray(params.allowFrom) ? params.allowFrom : []).map((v) => String(v).trim()).filter(Boolean).includes("*")) return;
	params.ctx.addIssue({
		code: z.ZodIssueCode.custom,
		path: params.path ?? ["allowFrom"],
		message: params.message
	});
}
function enforceAllowlistDmPolicyAllowFrom(params) {
	if (params.dmPolicy !== "allowlist") return;
	if ((Array.isArray(params.allowFrom) ? params.allowFrom : []).map((v) => String(v).trim()).filter(Boolean).length > 0) return;
	params.ctx.addIssue({
		code: z.ZodIssueCode.custom,
		path: params.path ?? ["allowFrom"],
		message: params.message
	});
}
const WhatsAppAccountSchema = WhatsAppSharedSchema.extend({
	name: z.string().optional(),
	enabled: z.boolean().optional(),
	authDir: z.string().optional(),
	mediaMaxMb: z.number().int().positive().optional()
}).strict();
const WhatsAppConfigSchema = WhatsAppSharedSchema.extend({
	accounts: z.record(z.string(), WhatsAppAccountSchema.optional()).optional(),
	defaultAccount: z.string().optional(),
	mediaMaxMb: z.number().int().positive().optional().default(50),
	actions: z.object({
		reactions: z.boolean().optional(),
		sendMessage: z.boolean().optional(),
		polls: z.boolean().optional()
	}).strict().optional()
}).strict().superRefine((value, ctx) => {
	enforceOpenDmPolicyAllowFromStar({
		dmPolicy: value.dmPolicy,
		allowFrom: value.allowFrom,
		ctx,
		message: "channels.whatsapp.dmPolicy=\"open\" requires channels.whatsapp.allowFrom to include \"*\""
	});
	enforceAllowlistDmPolicyAllowFrom({
		dmPolicy: value.dmPolicy,
		allowFrom: value.allowFrom,
		ctx,
		message: "channels.whatsapp.dmPolicy=\"allowlist\" requires channels.whatsapp.allowFrom to contain at least one sender ID"
	});
	if (!value.accounts) return;
	for (const [accountId, account] of Object.entries(value.accounts)) {
		if (!account) continue;
		const effectivePolicy = account.dmPolicy ?? value.dmPolicy;
		const effectiveAllowFrom = account.allowFrom ?? value.allowFrom;
		enforceOpenDmPolicyAllowFromStar({
			dmPolicy: effectivePolicy,
			allowFrom: effectiveAllowFrom,
			ctx,
			path: [
				"accounts",
				accountId,
				"allowFrom"
			],
			message: "channels.whatsapp.accounts.*.dmPolicy=\"open\" requires channels.whatsapp.accounts.*.allowFrom (or channels.whatsapp.allowFrom) to include \"*\""
		});
		enforceAllowlistDmPolicyAllowFrom({
			dmPolicy: effectivePolicy,
			allowFrom: effectiveAllowFrom,
			ctx,
			path: [
				"accounts",
				accountId,
				"allowFrom"
			],
			message: "channels.whatsapp.accounts.*.dmPolicy=\"allowlist\" requires channels.whatsapp.accounts.*.allowFrom (or channels.whatsapp.allowFrom) to contain at least one sender ID"
		});
	}
});
//#endregion
//#region src/config/zod-schema.providers.ts
const ChannelModelByChannelSchema = z.record(z.string(), z.record(z.string(), z.string())).optional();
const ChannelsSchema = z.object({
	defaults: z.object({
		groupPolicy: GroupPolicySchema.optional(),
		heartbeat: ChannelHeartbeatVisibilitySchema
	}).strict().optional(),
	modelByChannel: ChannelModelByChannelSchema,
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
//#region src/config/zod-schema.session.ts
const SessionResetConfigSchema = z.object({
	mode: z.union([z.literal("daily"), z.literal("idle")]).optional(),
	atHour: z.number().int().min(0).max(23).optional(),
	idleMinutes: z.number().int().positive().optional()
}).strict();
const SessionSendPolicySchema = createAllowDenyChannelRulesSchema();
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
	typingMode: TypingModeSchema.optional(),
	parentForkMaxTokens: z.number().int().nonnegative().optional(),
	mainKey: z.string().optional(),
	sendPolicy: SessionSendPolicySchema.optional(),
	agentToAgent: z.object({ maxPingPongTurns: z.number().int().min(0).max(5).optional() }).strict().optional(),
	threadBindings: z.object({
		enabled: z.boolean().optional(),
		idleHours: z.number().nonnegative().optional(),
		maxAgeHours: z.number().nonnegative().optional()
	}).strict().optional(),
	maintenance: z.object({
		mode: z.enum(["enforce", "warn"]).optional(),
		pruneAfter: z.union([z.string(), z.number()]).optional(),
		pruneDays: z.number().int().positive().optional(),
		maxEntries: z.number().int().positive().optional(),
		rotateBytes: z.union([z.string(), z.number()]).optional(),
		resetArchiveRetention: z.union([
			z.string(),
			z.number(),
			z.literal(false)
		]).optional(),
		maxDiskBytes: z.union([z.string(), z.number()]).optional(),
		highWaterBytes: z.union([z.string(), z.number()]).optional()
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
		if (val.resetArchiveRetention !== void 0 && val.resetArchiveRetention !== false) try {
			parseDurationMs(String(val.resetArchiveRetention).trim(), { defaultUnit: "d" });
		} catch {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["resetArchiveRetention"],
				message: "invalid duration (use ms, s, m, h, d)"
			});
		}
		if (val.maxDiskBytes !== void 0) try {
			parseByteSize(String(val.maxDiskBytes).trim(), { defaultUnit: "b" });
		} catch {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["maxDiskBytes"],
				message: "invalid size (use b, kb, mb, gb, tb)"
			});
		}
		if (val.highWaterBytes !== void 0) try {
			parseByteSize(String(val.highWaterBytes).trim(), { defaultUnit: "b" });
		} catch {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["highWaterBytes"],
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
		"all",
		"off",
		"none"
	]).optional(),
	removeAckAfterReply: z.boolean().optional(),
	statusReactions: z.object({
		enabled: z.boolean().optional(),
		emojis: z.object({
			thinking: z.string().optional(),
			tool: z.string().optional(),
			coding: z.string().optional(),
			web: z.string().optional(),
			done: z.string().optional(),
			error: z.string().optional(),
			stallSoft: z.string().optional(),
			stallHard: z.string().optional(),
			compacting: z.string().optional()
		}).strict().optional(),
		timing: z.object({
			debounceMs: z.number().int().min(0).optional(),
			stallSoftMs: z.number().int().min(0).optional(),
			stallHardMs: z.number().int().min(0).optional(),
			doneHoldMs: z.number().int().min(0).optional(),
			errorHoldMs: z.number().int().min(0).optional()
		}).strict().optional()
	}).strict().optional(),
	suppressToolErrors: z.boolean().optional(),
	tts: TtsConfigSchema
}).strict().optional();
const CommandsSchema = z.object({
	native: NativeCommandsSettingSchema.optional().default("auto"),
	nativeSkills: NativeCommandsSettingSchema.optional().default("auto"),
	text: z.boolean().optional(),
	bash: z.boolean().optional(),
	bashForegroundMs: z.number().int().min(0).max(3e4).optional(),
	config: z.boolean().optional(),
	mcp: z.boolean().optional(),
	plugins: z.boolean().optional(),
	debug: z.boolean().optional(),
	restart: z.boolean().optional().default(true),
	useAccessGroups: z.boolean().optional(),
	ownerAllowFrom: z.array(z.union([z.string(), z.number()])).optional(),
	ownerDisplay: z.enum(["raw", "hash"]).optional().default("raw"),
	ownerDisplaySecret: z.string().optional().register(sensitive),
	allowFrom: ElevatedAllowFromSchema.optional()
}).strict().optional().default(() => ({
	native: "auto",
	nativeSkills: "auto",
	restart: true,
	ownerDisplay: "raw"
}));
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
const MemoryQmdMcporterSchema = z.object({
	enabled: z.boolean().optional(),
	serverName: z.string().optional(),
	startDaemon: z.boolean().optional()
}).strict();
const LoggingLevelSchema = z.union([
	z.literal("silent"),
	z.literal("fatal"),
	z.literal("error"),
	z.literal("warn"),
	z.literal("info"),
	z.literal("debug"),
	z.literal("trace")
]);
const MemoryQmdSchema = z.object({
	command: z.string().optional(),
	mcporter: MemoryQmdMcporterSchema.optional(),
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
const HttpUrlSchema = z.string().url().refine((value) => {
	const protocol = new URL(value).protocol;
	return protocol === "http:" || protocol === "https:";
}, "Expected http:// or https:// URL");
const ResponsesEndpointUrlFetchShape = {
	allowUrl: z.boolean().optional(),
	urlAllowlist: z.array(z.string()).optional(),
	allowedMimes: z.array(z.string()).optional(),
	maxBytes: z.number().int().positive().optional(),
	maxRedirects: z.number().int().nonnegative().optional(),
	timeoutMs: z.number().int().positive().optional()
};
const SkillEntrySchema = z.object({
	enabled: z.boolean().optional(),
	apiKey: SecretInputSchema.optional().register(sensitive),
	env: z.record(z.string(), z.string()).optional(),
	config: z.record(z.string(), z.unknown()).optional()
}).strict();
const PluginEntrySchema = z.object({
	enabled: z.boolean().optional(),
	hooks: z.object({ allowPromptInjection: z.boolean().optional() }).strict().optional(),
	subagent: z.object({
		allowModelOverride: z.boolean().optional(),
		allowedModels: z.array(z.string()).optional()
	}).strict().optional(),
	config: z.record(z.string(), z.unknown()).optional()
}).strict();
const TalkProviderEntrySchema = z.object({
	voiceId: z.string().optional(),
	voiceAliases: z.record(z.string(), z.string()).optional(),
	modelId: z.string().optional(),
	outputFormat: z.string().optional(),
	apiKey: SecretInputSchema.optional().register(sensitive)
}).catchall(z.unknown());
const TalkSchema = z.object({
	provider: z.string().optional(),
	providers: z.record(z.string(), TalkProviderEntrySchema).optional(),
	voiceId: z.string().optional(),
	voiceAliases: z.record(z.string(), z.string()).optional(),
	modelId: z.string().optional(),
	outputFormat: z.string().optional(),
	apiKey: SecretInputSchema.optional().register(sensitive),
	interruptOnSpeech: z.boolean().optional(),
	silenceTimeoutMs: z.number().int().positive().optional()
}).strict().superRefine((talk, ctx) => {
	const provider = talk.provider?.trim().toLowerCase();
	const providers = talk.providers ? Object.keys(talk.providers) : [];
	if (provider && providers.length > 0 && !(provider in talk.providers)) ctx.addIssue({
		code: z.ZodIssueCode.custom,
		path: ["provider"],
		message: `talk.provider must match a key in talk.providers (missing "${provider}")`
	});
	if (!provider && providers.length > 1) ctx.addIssue({
		code: z.ZodIssueCode.custom,
		path: ["provider"],
		message: "talk.provider is required when talk.providers defines multiple providers"
	});
});
const McpServerSchema = z.object({
	command: z.string().optional(),
	args: z.array(z.string()).optional(),
	env: z.record(z.string(), z.union([
		z.string(),
		z.number(),
		z.boolean()
	])).optional(),
	cwd: z.string().optional(),
	workingDirectory: z.string().optional(),
	url: HttpUrlSchema.optional()
}).catchall(z.unknown());
const McpConfigSchema = z.object({ servers: z.record(z.string(), McpServerSchema).optional() }).strict().optional();
const OpenClawSchema = z.object({
	$schema: z.string().optional(),
	meta: z.object({
		lastTouchedVersion: z.string().optional(),
		lastTouchedAt: z.union([z.string(), z.number().transform((n, ctx) => {
			const d = new Date(n);
			if (Number.isNaN(d.getTime())) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Invalid timestamp"
				});
				return z.NEVER;
			}
			return d.toISOString();
		})]).optional()
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
		stuckSessionWarnMs: z.number().int().positive().optional(),
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
		level: LoggingLevelSchema.optional(),
		file: z.string().optional(),
		maxFileBytes: z.number().int().positive().optional(),
		consoleLevel: LoggingLevelSchema.optional(),
		consoleStyle: z.union([
			z.literal("pretty"),
			z.literal("compact"),
			z.literal("json")
		]).optional(),
		redactSensitive: z.union([z.literal("off"), z.literal("tools")]).optional(),
		redactPatterns: z.array(z.string()).optional()
	}).strict().optional(),
	cli: z.object({ banner: z.object({ taglineMode: z.union([
		z.literal("random"),
		z.literal("default"),
		z.literal("off")
	]).optional() }).strict().optional() }).strict().optional(),
	update: z.object({
		channel: z.union([
			z.literal("stable"),
			z.literal("beta"),
			z.literal("dev")
		]).optional(),
		checkOnStart: z.boolean().optional(),
		auto: z.object({
			enabled: z.boolean().optional(),
			stableDelayHours: z.number().nonnegative().max(168).optional(),
			stableJitterHours: z.number().nonnegative().max(168).optional(),
			betaCheckIntervalHours: z.number().positive().max(24).optional()
		}).strict().optional()
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
		cdpPortRangeStart: z.number().int().min(1).max(65535).optional(),
		defaultProfile: z.string().optional(),
		snapshotDefaults: BrowserSnapshotDefaultsSchema,
		ssrfPolicy: z.object({
			allowPrivateNetwork: z.boolean().optional(),
			dangerouslyAllowPrivateNetwork: z.boolean().optional(),
			allowedHostnames: z.array(z.string()).optional(),
			hostnameAllowlist: z.array(z.string()).optional()
		}).strict().optional(),
		profiles: z.record(z.string().regex(/^[a-z0-9-]+$/, "Profile names must be alphanumeric with hyphens only"), z.object({
			cdpPort: z.number().int().min(1).max(65535).optional(),
			cdpUrl: z.string().optional(),
			userDataDir: z.string().optional(),
			driver: z.union([
				z.literal("openclaw"),
				z.literal("clawd"),
				z.literal("existing-session")
			]).optional(),
			attachOnly: z.boolean().optional(),
			color: HexColorSchema
		}).strict().refine((value) => value.driver === "existing-session" || value.cdpPort || value.cdpUrl, { message: "Profile must set cdpPort or cdpUrl" }).refine((value) => value.driver === "existing-session" || !value.userDataDir, { message: "Profile userDataDir is only supported with driver=\"existing-session\"" })).optional(),
		extraArgs: z.array(z.string()).optional()
	}).strict().optional(),
	ui: z.object({
		seamColor: HexColorSchema.optional(),
		assistant: z.object({
			name: z.string().max(50).optional(),
			avatar: z.string().max(200).optional()
		}).strict().optional()
	}).strict().optional(),
	secrets: SecretsConfigSchema,
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
	acp: z.object({
		enabled: z.boolean().optional(),
		dispatch: z.object({ enabled: z.boolean().optional() }).strict().optional(),
		backend: z.string().optional(),
		defaultAgent: z.string().optional(),
		allowedAgents: z.array(z.string()).optional(),
		maxConcurrentSessions: z.number().int().positive().optional(),
		stream: z.object({
			coalesceIdleMs: z.number().int().nonnegative().optional(),
			maxChunkChars: z.number().int().positive().optional(),
			repeatSuppression: z.boolean().optional(),
			deliveryMode: z.union([z.literal("live"), z.literal("final_only")]).optional(),
			hiddenBoundarySeparator: z.union([
				z.literal("none"),
				z.literal("space"),
				z.literal("newline"),
				z.literal("paragraph")
			]).optional(),
			maxOutputChars: z.number().int().positive().optional(),
			maxSessionUpdateChars: z.number().int().positive().optional(),
			tagVisibility: z.record(z.string(), z.boolean()).optional()
		}).strict().optional(),
		runtime: z.object({
			ttlMinutes: z.number().int().positive().optional(),
			installCommand: z.string().optional()
		}).strict().optional()
	}).strict().optional(),
	models: ModelsConfigSchema,
	nodeHost: NodeHostSchema,
	agents: AgentsSchema,
	tools: ToolsSchema,
	bindings: BindingsSchema,
	broadcast: BroadcastSchema,
	audio: AudioSchema,
	media: z.object({
		preserveFilenames: z.boolean().optional(),
		ttlHours: z.number().int().min(1).max(168).optional()
	}).strict().optional(),
	messages: MessagesSchema,
	commands: CommandsSchema,
	approvals: ApprovalsSchema,
	session: SessionSchema,
	cron: z.object({
		enabled: z.boolean().optional(),
		store: z.string().optional(),
		maxConcurrentRuns: z.number().int().positive().optional(),
		retry: z.object({
			maxAttempts: z.number().int().min(0).max(10).optional(),
			backoffMs: z.array(z.number().int().nonnegative()).min(1).max(10).optional(),
			retryOn: z.array(z.enum([
				"rate_limit",
				"overloaded",
				"network",
				"timeout",
				"server_error"
			])).min(1).optional()
		}).strict().optional(),
		webhook: HttpUrlSchema.optional(),
		webhookToken: SecretInputSchema.optional().register(sensitive),
		sessionRetention: z.union([z.string(), z.literal(false)]).optional(),
		runLog: z.object({
			maxBytes: z.union([z.string(), z.number()]).optional(),
			keepLines: z.number().int().positive().optional()
		}).strict().optional(),
		failureAlert: z.object({
			enabled: z.boolean().optional(),
			after: z.number().int().min(1).optional(),
			cooldownMs: z.number().int().min(0).optional(),
			mode: z.enum(["announce", "webhook"]).optional(),
			accountId: z.string().optional()
		}).strict().optional(),
		failureDestination: z.object({
			channel: z.string().optional(),
			to: z.string().optional(),
			accountId: z.string().optional(),
			mode: z.enum(["announce", "webhook"]).optional()
		}).strict().optional()
	}).strict().superRefine((val, ctx) => {
		if (val.sessionRetention !== void 0 && val.sessionRetention !== false) try {
			parseDurationMs(String(val.sessionRetention).trim(), { defaultUnit: "h" });
		} catch {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["sessionRetention"],
				message: "invalid duration (use ms, s, m, h, d)"
			});
		}
		if (val.runLog?.maxBytes !== void 0) try {
			parseByteSize(String(val.runLog.maxBytes).trim(), { defaultUnit: "b" });
		} catch {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["runLog", "maxBytes"],
				message: "invalid size (use b, kb, mb, gb, tb)"
			});
		}
	}).optional(),
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
		wideArea: z.object({
			enabled: z.boolean().optional(),
			domain: z.string().optional()
		}).strict().optional(),
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
	talk: TalkSchema.optional(),
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
		customBindHost: z.string().optional(),
		controlUi: z.object({
			enabled: z.boolean().optional(),
			basePath: z.string().optional(),
			root: z.string().optional(),
			allowedOrigins: z.array(z.string()).optional(),
			dangerouslyAllowHostHeaderOriginFallback: z.boolean().optional(),
			allowInsecureAuth: z.boolean().optional(),
			dangerouslyDisableDeviceAuth: z.boolean().optional()
		}).strict().optional(),
		auth: z.object({
			mode: z.union([
				z.literal("none"),
				z.literal("token"),
				z.literal("password"),
				z.literal("trusted-proxy")
			]).optional(),
			token: SecretInputSchema.optional().register(sensitive),
			password: SecretInputSchema.optional().register(sensitive),
			allowTailscale: z.boolean().optional(),
			rateLimit: z.object({
				maxAttempts: z.number().optional(),
				windowMs: z.number().optional(),
				lockoutMs: z.number().optional(),
				exemptLoopback: z.boolean().optional()
			}).strict().optional(),
			trustedProxy: z.object({
				userHeader: z.string().min(1, "userHeader is required for trusted-proxy mode"),
				requiredHeaders: z.array(z.string()).optional(),
				allowUsers: z.array(z.string()).optional()
			}).strict().optional()
		}).strict().optional(),
		trustedProxies: z.array(z.string()).optional(),
		allowRealIpFallback: z.boolean().optional(),
		tools: z.object({
			deny: z.array(z.string()).optional(),
			allow: z.array(z.string()).optional()
		}).strict().optional(),
		channelHealthCheckMinutes: z.number().int().min(0).optional(),
		channelStaleEventThresholdMinutes: z.number().int().min(1).optional(),
		channelMaxRestartsPerHour: z.number().int().min(1).optional(),
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
			token: SecretInputSchema.optional().register(sensitive),
			password: SecretInputSchema.optional().register(sensitive),
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
			debounceMs: z.number().int().min(0).optional(),
			deferralTimeoutMs: z.number().int().min(0).optional()
		}).strict().optional(),
		tls: z.object({
			enabled: z.boolean().optional(),
			autoGenerate: z.boolean().optional(),
			certPath: z.string().optional(),
			keyPath: z.string().optional(),
			caPath: z.string().optional()
		}).optional(),
		http: z.object({
			endpoints: z.object({
				chatCompletions: z.object({
					enabled: z.boolean().optional(),
					maxBodyBytes: z.number().int().positive().optional(),
					maxImageParts: z.number().int().nonnegative().optional(),
					maxTotalImageBytes: z.number().int().positive().optional(),
					images: z.object({ ...ResponsesEndpointUrlFetchShape }).strict().optional()
				}).strict().optional(),
				responses: z.object({
					enabled: z.boolean().optional(),
					maxBodyBytes: z.number().int().positive().optional(),
					maxUrlParts: z.number().int().nonnegative().optional(),
					files: z.object({
						...ResponsesEndpointUrlFetchShape,
						maxChars: z.number().int().positive().optional(),
						pdf: z.object({
							maxPages: z.number().int().positive().optional(),
							maxPixels: z.number().int().positive().optional(),
							minTextChars: z.number().int().nonnegative().optional()
						}).strict().optional()
					}).strict().optional(),
					images: z.object({ ...ResponsesEndpointUrlFetchShape }).strict().optional()
				}).strict().optional()
			}).strict().optional(),
			securityHeaders: z.object({ strictTransportSecurity: z.union([z.string(), z.literal(false)]).optional() }).strict().optional()
		}).strict().optional(),
		push: z.object({ apns: z.object({ relay: z.object({
			baseUrl: z.string().optional(),
			timeoutMs: z.number().int().positive().optional()
		}).strict().optional() }).strict().optional() }).strict().optional(),
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
	}).strict().superRefine((gateway, ctx) => {
		const effectiveHealthCheckMinutes = gateway.channelHealthCheckMinutes ?? 5;
		if (gateway.channelStaleEventThresholdMinutes != null && effectiveHealthCheckMinutes !== 0 && gateway.channelStaleEventThresholdMinutes < effectiveHealthCheckMinutes) ctx.addIssue({
			code: z.ZodIssueCode.custom,
			path: ["channelStaleEventThresholdMinutes"],
			message: "channelStaleEventThresholdMinutes should be >= channelHealthCheckMinutes to avoid delayed stale detection"
		});
	}).optional(),
	memory: MemorySchema,
	mcp: McpConfigSchema,
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
		limits: z.object({
			maxCandidatesPerRoot: z.number().int().min(1).optional(),
			maxSkillsLoadedPerSource: z.number().int().min(1).optional(),
			maxSkillsInPrompt: z.number().int().min(0).optional(),
			maxSkillsPromptChars: z.number().int().min(0).optional(),
			maxSkillFileBytes: z.number().int().min(0).optional()
		}).strict().optional(),
		entries: z.record(z.string(), SkillEntrySchema).optional()
	}).strict().optional(),
	plugins: z.object({
		enabled: z.boolean().optional(),
		allow: z.array(z.string()).optional(),
		deny: z.array(z.string()).optional(),
		load: z.object({ paths: z.array(z.string()).optional() }).strict().optional(),
		slots: z.object({
			memory: z.string().optional(),
			contextEngine: z.string().optional()
		}).strict().optional(),
		entries: z.record(z.string(), PluginEntrySchema).optional(),
		installs: z.record(z.string(), z.object({ ...PluginInstallRecordShape }).strict()).optional()
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
const LEGACY_REMOVED_PLUGIN_IDS = new Set(["google-antigravity-auth", "google-gemini-cli-auth"]);
function toIssueRecord(value) {
	if (!value || typeof value !== "object") return null;
	return value;
}
function collectAllowedValuesFromIssue(issue) {
	const record = toIssueRecord(issue);
	if (!record) return {
		values: [],
		incomplete: false,
		hasValues: false
	};
	const code = typeof record.code === "string" ? record.code : "";
	if (code === "invalid_value") {
		const values = record.values;
		if (!Array.isArray(values)) return {
			values: [],
			incomplete: true,
			hasValues: false
		};
		return {
			values,
			incomplete: false,
			hasValues: values.length > 0
		};
	}
	if (code === "invalid_type") {
		if ((typeof record.expected === "string" ? record.expected : "") === "boolean") return {
			values: [true, false],
			incomplete: false,
			hasValues: true
		};
		return {
			values: [],
			incomplete: true,
			hasValues: false
		};
	}
	if (code !== "invalid_union") return {
		values: [],
		incomplete: false,
		hasValues: false
	};
	const nested = record.errors;
	if (!Array.isArray(nested) || nested.length === 0) return {
		values: [],
		incomplete: true,
		hasValues: false
	};
	const collected = [];
	for (const branch of nested) {
		if (!Array.isArray(branch) || branch.length === 0) return {
			values: [],
			incomplete: true,
			hasValues: false
		};
		const branchCollected = collectAllowedValuesFromIssueList(branch);
		if (branchCollected.incomplete || !branchCollected.hasValues) return {
			values: [],
			incomplete: true,
			hasValues: false
		};
		collected.push(...branchCollected.values);
	}
	return {
		values: collected,
		incomplete: false,
		hasValues: collected.length > 0
	};
}
function collectAllowedValuesFromIssueList(issues) {
	const collected = [];
	let hasValues = false;
	for (const issue of issues) {
		const branch = collectAllowedValuesFromIssue(issue);
		if (branch.incomplete) return {
			values: [],
			incomplete: true,
			hasValues: false
		};
		if (!branch.hasValues) continue;
		hasValues = true;
		collected.push(...branch.values);
	}
	return {
		values: collected,
		incomplete: false,
		hasValues
	};
}
function collectAllowedValuesFromUnknownIssue(issue) {
	const collection = collectAllowedValuesFromIssue(issue);
	if (collection.incomplete || !collection.hasValues) return [];
	return collection.values;
}
function mapZodIssueToConfigIssue(issue) {
	const record = toIssueRecord(issue);
	const path = Array.isArray(record?.path) ? record.path.filter((segment) => {
		const segmentType = typeof segment;
		return segmentType === "string" || segmentType === "number";
	}).join(".") : "";
	const message = typeof record?.message === "string" ? record.message : "Invalid input";
	const allowedValuesSummary = summarizeAllowedValues(collectAllowedValuesFromUnknownIssue(issue));
	if (!allowedValuesSummary) return {
		path,
		message
	};
	return {
		path,
		message: appendAllowedValuesHint(message, allowedValuesSummary),
		allowedValues: allowedValuesSummary.values,
		allowedValuesHiddenCount: allowedValuesSummary.hiddenCount
	};
}
function isWorkspaceAvatarPath(value, workspaceDir) {
	const workspaceRoot = path.resolve(workspaceDir);
	return isPathWithinRoot(workspaceRoot, path.resolve(workspaceRoot, value));
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
		if (isAvatarDataUrl(avatar) || isAvatarHttpUrl(avatar)) continue;
		if (avatar.startsWith("~")) {
			issues.push({
				path: `agents.list.${index}.identity.avatar`,
				message: "identity.avatar must be a workspace-relative path, http(s) URL, or data URI."
			});
			continue;
		}
		if (hasAvatarUriScheme(avatar) && !isWindowsAbsolutePath(avatar)) {
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
function validateGatewayTailscaleBind(config) {
	const tailscaleMode = config.gateway?.tailscale?.mode ?? "off";
	if (tailscaleMode !== "serve" && tailscaleMode !== "funnel") return [];
	const bindMode = config.gateway?.bind ?? "loopback";
	if (bindMode === "loopback") return [];
	const customBindHost = config.gateway?.customBindHost;
	if (bindMode === "custom" && isCanonicalDottedDecimalIPv4(customBindHost) && isLoopbackIpAddress(customBindHost)) return [];
	return [{
		path: "gateway.bind",
		message: `gateway.bind must resolve to loopback when gateway.tailscale.mode=${tailscaleMode} (use gateway.bind="loopback" or gateway.bind="custom" with gateway.customBindHost="127.0.0.1")`
	}];
}
/**
* Validates config without applying runtime defaults.
* Use this when you need the raw validated config (e.g., for writing back to file).
*/
function validateConfigObjectRaw(raw) {
	const normalizedRaw = normalizeLegacyWebSearchConfig(raw);
	const legacyIssues = findLegacyConfigIssues(normalizedRaw);
	if (legacyIssues.length > 0) return {
		ok: false,
		issues: legacyIssues.map((iss) => ({
			path: iss.path,
			message: iss.message
		}))
	};
	const validated = OpenClawSchema.safeParse(normalizedRaw);
	if (!validated.success) return {
		ok: false,
		issues: validated.error.issues.map((issue) => mapZodIssueToConfigIssue(issue))
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
	const gatewayTailscaleBindIssues = validateGatewayTailscaleBind(validated.data);
	if (gatewayTailscaleBindIssues.length > 0) return {
		ok: false,
		issues: gatewayTailscaleBindIssues
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
function validateConfigObjectWithPlugins(raw, params) {
	return validateConfigObjectWithPluginsBase(raw, {
		applyDefaults: true,
		env: params?.env
	});
}
function validateConfigObjectRawWithPlugins(raw, params) {
	return validateConfigObjectWithPluginsBase(raw, {
		applyDefaults: false,
		env: params?.env
	});
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
	const warnings = listLegacyWebSearchConfigPaths(raw).map((path) => ({
		path,
		message: `${path} is deprecated for web search provider config. Move it under plugins.entries.<plugin>.config.webSearch.*; OpenClaw mapped it automatically for compatibility.`
	}));
	const hasExplicitPluginsConfig = isRecord$1(raw) && Object.prototype.hasOwnProperty.call(raw, "plugins");
	const resolvePluginConfigIssuePath = (pluginId, errorPath) => {
		const base = `plugins.entries.${pluginId}.config`;
		if (!errorPath || errorPath === "<root>") return base;
		return `${base}.${errorPath}`;
	};
	let registryInfo = null;
	let compatConfig;
	const ensureCompatConfig = () => {
		if (compatConfig !== void 0) return compatConfig ?? config;
		const allow = config.plugins?.allow;
		if (!Array.isArray(allow) || allow.length === 0) {
			compatConfig = config;
			return config;
		}
		const bundledWebSearchPluginIds = new Set(listBundledWebSearchPluginIds());
		const workspaceDir = resolveAgentWorkspaceDir(config, resolveDefaultAgentId(config));
		const seenCompatPluginIds = /* @__PURE__ */ new Set();
		compatConfig = withBundledPluginAllowlistCompat({
			config,
			pluginIds: loadPluginManifestRegistry({
				config,
				workspaceDir: workspaceDir ?? void 0,
				env: opts.env
			}).plugins.filter((plugin) => {
				if (seenCompatPluginIds.has(plugin.id)) return false;
				seenCompatPluginIds.add(plugin.id);
				return plugin.origin === "bundled" && bundledWebSearchPluginIds.has(plugin.id);
			}).map((plugin) => plugin.id).toSorted((left, right) => left.localeCompare(right))
		});
		return compatConfig ?? config;
	};
	const ensureRegistry = () => {
		if (registryInfo) return registryInfo;
		const effectiveConfig = ensureCompatConfig();
		const registry = loadPluginManifestRegistry({
			config: effectiveConfig,
			workspaceDir: resolveAgentWorkspaceDir(effectiveConfig, resolveDefaultAgentId(effectiveConfig)) ?? void 0,
			env: opts.env
		});
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
		registryInfo = { registry };
		return registryInfo;
	};
	const ensureKnownIds = () => {
		const info = ensureRegistry();
		if (!info.knownIds) info.knownIds = new Set(info.registry.plugins.map((record) => record.id));
		return info.knownIds;
	};
	const ensureNormalizedPlugins = () => {
		const info = ensureRegistry();
		if (!info.normalizedPlugins) info.normalizedPlugins = normalizePluginsConfig(ensureCompatConfig().plugins);
		return info.normalizedPlugins;
	};
	const allowedChannels = new Set([
		"defaults",
		"modelByChannel",
		...CHANNEL_IDS
	]);
	if (config.channels && isRecord$1(config.channels)) for (const key of Object.keys(config.channels)) {
		const trimmed = key.trim();
		if (!trimmed) continue;
		if (!allowedChannels.has(trimmed)) {
			const { registry } = ensureRegistry();
			for (const record of registry.plugins) for (const channelId of record.channels) allowedChannels.add(channelId);
		}
		if (!allowedChannels.has(trimmed)) issues.push({
			path: `channels.${trimmed}`,
			message: `unknown channel id: ${trimmed}`
		});
	}
	const heartbeatChannelIds = /* @__PURE__ */ new Set();
	for (const channelId of CHANNEL_IDS) heartbeatChannelIds.add(channelId.toLowerCase());
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
		if (!heartbeatChannelIds.has(normalized)) {
			const { registry } = ensureRegistry();
			for (const record of registry.plugins) for (const channelId of record.channels) {
				const pluginChannel = channelId.trim();
				if (pluginChannel) heartbeatChannelIds.add(pluginChannel.toLowerCase());
			}
		}
		if (heartbeatChannelIds.has(normalized)) return;
		issues.push({
			path,
			message: `unknown heartbeat target: ${target}`
		});
	};
	validateHeartbeatTarget(config.agents?.defaults?.heartbeat?.target, "agents.defaults.heartbeat.target");
	if (Array.isArray(config.agents?.list)) for (const [index, entry] of config.agents.list.entries()) validateHeartbeatTarget(entry?.heartbeat?.target, `agents.list.${index}.heartbeat.target`);
	if (!hasExplicitPluginsConfig) {
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
	const { registry } = ensureRegistry();
	const knownIds = ensureKnownIds();
	const normalizedPlugins = ensureNormalizedPlugins();
	const pushMissingPluginIssue = (path, pluginId, opts) => {
		if (LEGACY_REMOVED_PLUGIN_IDS.has(pluginId)) {
			warnings.push({
				path,
				message: `plugin removed: ${pluginId} (stale config entry ignored; remove it from plugins config)`
			});
			return;
		}
		if (opts?.warnOnly) {
			warnings.push({
				path,
				message: `plugin not found: ${pluginId} (stale config entry ignored; remove it from plugins config)`
			});
			return;
		}
		issues.push({
			path,
			message: `plugin not found: ${pluginId}`
		});
	};
	const pluginsConfig = config.plugins;
	const entries = pluginsConfig?.entries;
	if (entries && isRecord$1(entries)) {
		for (const pluginId of Object.keys(entries)) if (!knownIds.has(pluginId)) pushMissingPluginIssue(`plugins.entries.${pluginId}`, pluginId, { warnOnly: true });
	}
	const allow = pluginsConfig?.allow ?? [];
	for (const pluginId of allow) {
		if (typeof pluginId !== "string" || !pluginId.trim()) continue;
		if (!knownIds.has(pluginId)) pushMissingPluginIssue("plugins.allow", pluginId, { warnOnly: true });
	}
	const deny = pluginsConfig?.deny ?? [];
	for (const pluginId of deny) {
		if (typeof pluginId !== "string" || !pluginId.trim()) continue;
		if (!knownIds.has(pluginId)) pushMissingPluginIssue("plugins.deny", pluginId);
	}
	const pluginSlots = pluginsConfig?.slots;
	const hasExplicitMemorySlot = pluginSlots !== void 0 && Object.prototype.hasOwnProperty.call(pluginSlots, "memory");
	const memorySlot = normalizedPlugins.slots.memory;
	if (hasExplicitMemorySlot && typeof memorySlot === "string" && memorySlot.trim() && !knownIds.has(memorySlot)) pushMissingPluginIssue("plugins.slots.memory", memorySlot);
	let selectedMemoryPluginId = null;
	const seenPlugins = /* @__PURE__ */ new Set();
	for (const record of registry.plugins) {
		const pluginId = record.id;
		if (seenPlugins.has(pluginId)) continue;
		seenPlugins.add(pluginId);
		const entry = normalizedPlugins.entries[pluginId];
		const entryHasConfig = Boolean(entry?.config);
		const enableState = resolveEffectiveEnableState({
			id: pluginId,
			origin: record.origin,
			config: normalizedPlugins,
			rootConfig: config
		});
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
				path: resolvePluginConfigIssuePath(pluginId, error.path),
				message: `invalid config: ${error.message}`,
				allowedValues: error.allowedValues,
				allowedValuesHiddenCount: error.allowedValuesHiddenCount
			});
		} else if (record.format === "bundle") {} else issues.push({
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
const VERSION_RE = /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/;
function parseOpenClawVersion(raw) {
	if (!raw) return null;
	const match = normalizeLegacyDotBetaVersion(raw.trim()).match(VERSION_RE);
	if (!match) return null;
	const [, major, minor, patch, suffix] = match;
	const revision = suffix && /^[0-9]+$/.test(suffix) ? Number.parseInt(suffix, 10) : null;
	return {
		major: Number.parseInt(major, 10),
		minor: Number.parseInt(minor, 10),
		patch: Number.parseInt(patch, 10),
		revision,
		prerelease: suffix && revision == null ? suffix.split(".").filter(Boolean) : null
	};
}
function normalizeOpenClawVersionBase(raw) {
	const parsed = parseOpenClawVersion(raw);
	if (!parsed) return null;
	return `${parsed.major}.${parsed.minor}.${parsed.patch}`;
}
function isSameOpenClawStableFamily(a, b) {
	const parsedA = parseOpenClawVersion(a);
	const parsedB = parseOpenClawVersion(b);
	if (!parsedA || !parsedB) return false;
	if (parsedA.prerelease?.length || parsedB.prerelease?.length) return false;
	return parsedA.major === parsedB.major && parsedA.minor === parsedB.minor && parsedA.patch === parsedB.patch;
}
function compareOpenClawVersions(a, b) {
	const parsedA = parseOpenClawVersion(a);
	const parsedB = parseOpenClawVersion(b);
	if (!parsedA || !parsedB) return null;
	if (parsedA.major !== parsedB.major) return parsedA.major < parsedB.major ? -1 : 1;
	if (parsedA.minor !== parsedB.minor) return parsedA.minor < parsedB.minor ? -1 : 1;
	if (parsedA.patch !== parsedB.patch) return parsedA.patch < parsedB.patch ? -1 : 1;
	const rankA = releaseRank(parsedA);
	const rankB = releaseRank(parsedB);
	if (rankA !== rankB) return rankA < rankB ? -1 : 1;
	if (parsedA.revision != null && parsedB.revision != null && parsedA.revision !== parsedB.revision) return parsedA.revision < parsedB.revision ? -1 : 1;
	if (parsedA.prerelease || parsedB.prerelease) return comparePrerelease(parsedA.prerelease, parsedB.prerelease);
	return 0;
}
function shouldWarnOnTouchedVersion(current, touched) {
	if (isSameOpenClawStableFamily(current, touched)) return false;
	const cmp = compareOpenClawVersions(current, touched);
	return cmp !== null && cmp < 0;
}
function normalizeLegacyDotBetaVersion(version) {
	const dotBetaMatch = /^([vV]?[0-9]+\.[0-9]+\.[0-9]+)\.beta(?:\.([0-9A-Za-z.-]+))?$/.exec(version);
	if (!dotBetaMatch) return version;
	const base = dotBetaMatch[1];
	const suffix = dotBetaMatch[2];
	return suffix ? `${base}-beta.${suffix}` : `${base}-beta`;
}
function releaseRank(version) {
	if (version.prerelease?.length) return 0;
	if (version.revision != null) return 2;
	return 1;
}
function comparePrerelease(a, b) {
	if (!a?.length && !b?.length) return 0;
	if (!a?.length) return 1;
	if (!b?.length) return -1;
	const max = Math.max(a.length, b.length);
	for (let i = 0; i < max; i += 1) {
		const ai = a[i];
		const bi = b[i];
		if (ai == null && bi == null) return 0;
		if (ai == null) return -1;
		if (bi == null) return 1;
		if (ai === bi) continue;
		const aiNumeric = /^[0-9]+$/.test(ai);
		const biNumeric = /^[0-9]+$/.test(bi);
		if (aiNumeric && biNumeric) return Number.parseInt(ai, 10) < Number.parseInt(bi, 10) ? -1 : 1;
		if (aiNumeric && !biNumeric) return -1;
		if (!aiNumeric && biNumeric) return 1;
		return ai < bi ? -1 : 1;
	}
	return 0;
}
//#endregion
//#region src/config/io.ts
const SHELL_ENV_EXPECTED_KEYS = [
	"OPENAI_API_KEY",
	"ANTHROPIC_API_KEY",
	"DEEPSEEK_API_KEY",
	"ANTHROPIC_OAUTH_TOKEN",
	"GEMINI_API_KEY",
	"ZAI_API_KEY",
	"OPENROUTER_API_KEY",
	"AI_GATEWAY_API_KEY",
	"MINIMAX_API_KEY",
	"MODELSTUDIO_API_KEY",
	"SYNTHETIC_API_KEY",
	"KILOCODE_API_KEY",
	"ELEVENLABS_API_KEY",
	"TELEGRAM_BOT_TOKEN",
	"DISCORD_BOT_TOKEN",
	"SLACK_BOT_TOKEN",
	"SLACK_APP_TOKEN",
	"OPENCLAW_GATEWAY_TOKEN",
	"OPENCLAW_GATEWAY_PASSWORD"
];
const OPEN_DM_POLICY_ALLOW_FROM_RE = /^(?<policyPath>[a-z0-9_.-]+)\s*=\s*"open"\s+requires\s+(?<allowPath>[a-z0-9_.-]+)(?:\s+\(or\s+[a-z0-9_.-]+\))?\s+to include "\*"$/i;
const CONFIG_AUDIT_LOG_FILENAME = "config-audit.jsonl";
const loggedInvalidConfigs = /* @__PURE__ */ new Set();
var ConfigRuntimeRefreshError = class extends Error {
	constructor(message, options) {
		super(message, options);
		this.name = "ConfigRuntimeRefreshError";
	}
};
function hashConfigRaw(raw) {
	return crypto.createHash("sha256").update(raw ?? "").digest("hex");
}
async function tightenStateDirPermissionsIfNeeded(params) {
	if (process.platform === "win32") return;
	const stateDir = resolveStateDir(params.env, params.homedir);
	const configDir = path.dirname(params.configPath);
	if (path.resolve(configDir) !== path.resolve(stateDir)) return;
	try {
		if (((await params.fsModule.promises.stat(configDir)).mode & 63) === 0) return;
		await params.fsModule.promises.chmod(configDir, 448);
	} catch {}
}
function formatConfigValidationFailure(pathLabel, issueMessage) {
	const match = issueMessage.match(OPEN_DM_POLICY_ALLOW_FROM_RE);
	const policyPath = match?.groups?.policyPath?.trim();
	const allowPath = match?.groups?.allowPath?.trim();
	if (!policyPath || !allowPath) return `Config validation failed: ${pathLabel}: ${issueMessage}`;
	return [
		`Config validation failed: ${pathLabel}`,
		"",
		`Configuration mismatch: ${policyPath} is "open", but ${allowPath} does not include "*".`,
		"",
		"Fix with:",
		`  openclaw config set ${allowPath} '["*"]'`,
		"",
		"Or switch policy:",
		`  openclaw config set ${policyPath} "pairing"`
	].join("\n");
}
function isNumericPathSegment(raw) {
	return /^[0-9]+$/.test(raw);
}
function isWritePlainObject(value) {
	return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function hasOwnObjectKey(value, key) {
	return Object.prototype.hasOwnProperty.call(value, key);
}
const WRITE_PRUNED_OBJECT = Symbol("write-pruned-object");
function unsetPathForWriteAt(value, pathSegments, depth) {
	if (depth >= pathSegments.length) return {
		changed: false,
		value
	};
	const segment = pathSegments[depth];
	const isLeaf = depth === pathSegments.length - 1;
	if (Array.isArray(value)) {
		if (!isNumericPathSegment(segment)) return {
			changed: false,
			value
		};
		const index = Number.parseInt(segment, 10);
		if (!Number.isFinite(index) || index < 0 || index >= value.length) return {
			changed: false,
			value
		};
		if (isLeaf) {
			const next = value.slice();
			next.splice(index, 1);
			return {
				changed: true,
				value: next
			};
		}
		const child = unsetPathForWriteAt(value[index], pathSegments, depth + 1);
		if (!child.changed) return {
			changed: false,
			value
		};
		const next = value.slice();
		if (child.value === WRITE_PRUNED_OBJECT) next.splice(index, 1);
		else next[index] = child.value;
		return {
			changed: true,
			value: next
		};
	}
	if (isBlockedObjectKey(segment) || !isWritePlainObject(value) || !hasOwnObjectKey(value, segment)) return {
		changed: false,
		value
	};
	if (isLeaf) {
		const next = { ...value };
		delete next[segment];
		return {
			changed: true,
			value: Object.keys(next).length === 0 ? WRITE_PRUNED_OBJECT : next
		};
	}
	const child = unsetPathForWriteAt(value[segment], pathSegments, depth + 1);
	if (!child.changed) return {
		changed: false,
		value
	};
	const next = { ...value };
	if (child.value === WRITE_PRUNED_OBJECT) delete next[segment];
	else next[segment] = child.value;
	return {
		changed: true,
		value: Object.keys(next).length === 0 ? WRITE_PRUNED_OBJECT : next
	};
}
function unsetPathForWrite(root, pathSegments) {
	if (pathSegments.length === 0) return {
		changed: false,
		next: root
	};
	const result = unsetPathForWriteAt(root, pathSegments, 0);
	if (!result.changed) return {
		changed: false,
		next: root
	};
	if (result.value === WRITE_PRUNED_OBJECT) return {
		changed: true,
		next: {}
	};
	if (isWritePlainObject(result.value)) return {
		changed: true,
		next: coerceConfig(result.value)
	};
	return {
		changed: false,
		next: root
	};
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
	if (shouldWarnOnTouchedVersion(VERSION, touched)) logger.warn(`Config was last written by a newer OpenClaw (${touched}); current version is ${VERSION}.`);
}
function resolveConfigPathForDeps(deps) {
	if (deps.configPath) return deps.configPath;
	return resolveConfigPath(deps.env, resolveStateDir(deps.env, deps.homedir));
}
function normalizeDeps(overrides = {}) {
	return {
		fs: overrides.fs ?? fs,
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
		readFileWithGuards: ({ includePath, resolvedPath, rootRealDir }) => readConfigIncludeFileWithGuards({
			includePath,
			resolvedPath,
			rootRealDir,
			ioFs: deps.fs
		}),
		parseJson: (raw) => deps.json5.parse(raw)
	});
}
function resolveConfigForRead(resolvedIncludes, env) {
	if (resolvedIncludes && typeof resolvedIncludes === "object" && "env" in resolvedIncludes) applyConfigEnvVars(resolvedIncludes, env);
	const envWarnings = [];
	return {
		resolvedConfigRaw: resolveConfigEnvVars(resolvedIncludes, env, { onMissing: (w) => envWarnings.push(w) }),
		envSnapshotForRestore: { ...env },
		envWarnings
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
			const readResolution = resolveConfigForRead(resolveConfigIncludesForRead(deps.json5.parse(raw), configPath, deps), deps.env);
			const resolvedConfig = readResolution.resolvedConfigRaw;
			for (const w of readResolution.envWarnings) deps.logger.warn(`Config (${configPath}): missing env var "${w.varName}" at ${w.configPath} — feature using this value will be unavailable`);
			warnOnConfigMiskeys(resolvedConfig, deps.logger);
			if (typeof resolvedConfig !== "object" || resolvedConfig === null) return {};
			const preValidationDuplicates = findDuplicateAgentDirs(resolvedConfig, {
				env: deps.env,
				homedir: deps.homedir
			});
			if (preValidationDuplicates.length > 0) throw new DuplicateAgentDirError(preValidationDuplicates);
			const validated = validateConfigObjectWithPlugins(resolvedConfig);
			if (!validated.ok) {
				const details = validated.issues.map((iss) => `- ${sanitizeTerminalText(iss.path || "<root>")}: ${sanitizeTerminalText(iss.message)}`).join("\n");
				if (!loggedInvalidConfigs.has(configPath)) {
					loggedInvalidConfigs.add(configPath);
					deps.logger.error(`Invalid config at ${configPath}:\\n${details}`);
				}
				const error = /* @__PURE__ */ new Error(`Invalid config at ${configPath}:\n${details}`);
				error.code = "INVALID_CONFIG";
				error.details = details;
				throw error;
			}
			if (validated.warnings.length > 0) {
				const details = validated.warnings.map((iss) => `- ${sanitizeTerminalText(iss.path || "<root>")}: ${sanitizeTerminalText(iss.message)}`).join("\n");
				deps.logger.warn(`Config warnings:\\n${details}`);
			}
			warnIfConfigFromFuture(validated.config, deps.logger);
			const cfg = applyTalkConfigNormalization(applyModelDefaults(applyCompactionDefaults(applyContextPruningDefaults(applyAgentDefaults(applySessionDefaults(applyLoggingDefaults(applyMessageDefaults(validated.config))))))));
			normalizeConfigPaths(cfg);
			normalizeExecSafeBinProfilesInConfig(cfg);
			const duplicates = findDuplicateAgentDirs(cfg, {
				env: deps.env,
				homedir: deps.homedir
			});
			if (duplicates.length > 0) throw new DuplicateAgentDirError(duplicates);
			applyConfigEnvVars(cfg, deps.env);
			if ((shouldEnableShellEnvFallback(deps.env) || cfg.env?.shellEnv?.enabled === true) && !shouldDeferShellEnvFallback(deps.env)) loadShellEnvFallback({
				enabled: true,
				env: deps.env,
				expectedKeys: SHELL_ENV_EXPECTED_KEYS,
				logger: deps.logger,
				timeoutMs: cfg.env?.shellEnv?.timeoutMs ?? resolveShellEnvFallbackTimeoutMs(deps.env)
			});
			const pendingSecret = AUTO_OWNER_DISPLAY_SECRET_BY_PATH.get(configPath);
			const ownerDisplaySecretResolution = ensureOwnerDisplaySecret(cfg, () => pendingSecret ?? crypto.randomBytes(32).toString("hex"));
			const cfgWithOwnerDisplaySecret = ownerDisplaySecretResolution.config;
			if (ownerDisplaySecretResolution.generatedSecret) {
				AUTO_OWNER_DISPLAY_SECRET_BY_PATH.set(configPath, ownerDisplaySecretResolution.generatedSecret);
				if (!AUTO_OWNER_DISPLAY_SECRET_PERSIST_IN_FLIGHT.has(configPath)) {
					AUTO_OWNER_DISPLAY_SECRET_PERSIST_IN_FLIGHT.add(configPath);
					writeConfigFile(cfgWithOwnerDisplaySecret, { expectedConfigPath: configPath }).then(() => {
						AUTO_OWNER_DISPLAY_SECRET_BY_PATH.delete(configPath);
						AUTO_OWNER_DISPLAY_SECRET_PERSIST_WARNED.delete(configPath);
					}).catch((err) => {
						if (!AUTO_OWNER_DISPLAY_SECRET_PERSIST_WARNED.has(configPath)) {
							AUTO_OWNER_DISPLAY_SECRET_PERSIST_WARNED.add(configPath);
							deps.logger.warn(`Failed to persist auto-generated commands.ownerDisplaySecret at ${configPath}: ${String(err)}`);
						}
					}).finally(() => {
						AUTO_OWNER_DISPLAY_SECRET_PERSIST_IN_FLIGHT.delete(configPath);
					});
				}
			} else {
				AUTO_OWNER_DISPLAY_SECRET_BY_PATH.delete(configPath);
				AUTO_OWNER_DISPLAY_SECRET_PERSIST_WARNED.delete(configPath);
			}
			return applyConfigOverrides(cfgWithOwnerDisplaySecret);
		} catch (err) {
			if (err instanceof DuplicateAgentDirError) {
				deps.logger.error(err.message);
				throw err;
			}
			if (err?.code === "INVALID_CONFIG") throw err;
			deps.logger.error(`Failed to read config at ${configPath}`, err);
			throw err;
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
				config: applyTalkApiKey(applyTalkConfigNormalization(applyModelDefaults(applyCompactionDefaults(applyContextPruningDefaults(applyAgentDefaults(applySessionDefaults(applyMessageDefaults({})))))))),
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
			const readResolution = resolveConfigForRead(resolved, deps.env);
			const envVarWarnings = readResolution.envWarnings.map((w) => ({
				path: w.configPath,
				message: `Missing env var "${w.varName}" — feature using this value will be unavailable`
			}));
			const resolvedConfigRaw = readResolution.resolvedConfigRaw;
			const legacyIssues = findLegacyConfigIssues(resolvedConfigRaw, parsedRes.parsed);
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
				warnings: [...validated.warnings, ...envVarWarnings],
				legacyIssues
			} };
			warnIfConfigFromFuture(validated.config, deps.logger);
			const snapshotConfig = normalizeConfigPaths(applyTalkApiKey(applyTalkConfigNormalization(applyModelDefaults(applyAgentDefaults(applySessionDefaults(applyLoggingDefaults(applyMessageDefaults(validated.config))))))));
			normalizeExecSafeBinProfilesInConfig(snapshotConfig);
			return {
				snapshot: {
					path: configPath,
					exists: true,
					raw,
					parsed: parsedRes.parsed,
					resolved: coerceConfig(resolvedConfigRaw),
					valid: true,
					config: snapshotConfig,
					hash,
					issues: [],
					warnings: [...validated.warnings, ...envVarWarnings],
					legacyIssues
				},
				envSnapshotForRestore: readResolution.envSnapshotForRestore
			};
		} catch (err) {
			const nodeErr = err;
			let message;
			if (nodeErr?.code === "EACCES") {
				const uid = process.getuid?.();
				const uidHint = typeof uid === "number" ? String(uid) : "$(id -u)";
				message = [
					`read failed: ${String(err)}`,
					``,
					`Config file is not readable by the current process. If running in a container`,
					`or 1-click deployment, fix ownership with:`,
					`  chown ${uidHint} "${configPath}"`,
					`Then restart the gateway.`
				].join("\n");
				deps.logger.error(message);
			} else message = `read failed: ${String(err)}`;
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
					message
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
					readFileWithGuards: ({ includePath, resolvedPath, rootRealDir }) => readConfigIncludeFileWithGuards({
						includePath,
						resolvedPath,
						rootRealDir,
						ioFs: deps.fs
					}),
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
			const issueMessage = issue?.message ?? "invalid";
			throw new Error(formatConfigValidationFailure(pathLabel, issueMessage));
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
		await tightenStateDirPermissionsIfNeeded({
			configPath,
			env: deps.env,
			homedir: deps.homedir,
			fsModule: deps.fs
		});
		let outputConfig = envRefMap && changedPaths ? restoreEnvRefsFromMap(cfgToWrite, "", envRefMap, changedPaths) : cfgToWrite;
		if (options.unsetPaths?.length) for (const unsetPath of options.unsetPaths) {
			if (!Array.isArray(unsetPath) || unsetPath.length === 0) continue;
			const unsetResult = unsetPathForWrite(outputConfig, unsetPath);
			if (unsetResult.changed) outputConfig = unsetResult.next;
		}
		const stampedOutputConfig = stampConfigVersion(outputConfig);
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
			const isVitest = deps.env.VITEST === "true";
			const shouldLogInVitest = deps.env.OPENCLAW_TEST_CONFIG_WRITE_ANOMALY_LOG === "1";
			if (isVitest && !shouldLogInVitest) return;
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
			if (deps.fs.existsSync(configPath)) await maintainConfigBackups(configPath, deps.fs.promises);
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
const AUTO_OWNER_DISPLAY_SECRET_BY_PATH = /* @__PURE__ */ new Map();
const AUTO_OWNER_DISPLAY_SECRET_PERSIST_IN_FLIGHT = /* @__PURE__ */ new Set();
const AUTO_OWNER_DISPLAY_SECRET_PERSIST_WARNED = /* @__PURE__ */ new Set();
let configCache = null;
let runtimeConfigSnapshot = null;
let runtimeConfigSourceSnapshot = null;
let runtimeConfigSnapshotRefreshHandler = null;
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
function setRuntimeConfigSnapshot(config, sourceConfig) {
	runtimeConfigSnapshot = config;
	runtimeConfigSourceSnapshot = sourceConfig ?? null;
	clearConfigCache();
}
function clearRuntimeConfigSnapshot() {
	runtimeConfigSnapshot = null;
	runtimeConfigSourceSnapshot = null;
	clearConfigCache();
}
function getRuntimeConfigSnapshot() {
	return runtimeConfigSnapshot;
}
function getRuntimeConfigSourceSnapshot() {
	return runtimeConfigSourceSnapshot;
}
function isCompatibleTopLevelRuntimeProjectionShape(params) {
	const runtime = params.runtimeSnapshot;
	const candidate = params.candidate;
	for (const key of Object.keys(runtime)) {
		if (!Object.hasOwn(candidate, key)) return false;
		const runtimeValue = runtime[key];
		const candidateValue = candidate[key];
		if ((Array.isArray(runtimeValue) ? "array" : runtimeValue === null ? "null" : typeof runtimeValue) !== (Array.isArray(candidateValue) ? "array" : candidateValue === null ? "null" : typeof candidateValue)) return false;
	}
	return true;
}
function projectConfigOntoRuntimeSourceSnapshot(config) {
	if (!runtimeConfigSnapshot || !runtimeConfigSourceSnapshot) return config;
	if (config === runtimeConfigSnapshot) return runtimeConfigSourceSnapshot;
	if (!isCompatibleTopLevelRuntimeProjectionShape({
		runtimeSnapshot: runtimeConfigSnapshot,
		candidate: config
	})) return config;
	const runtimePatch = createMergePatch(runtimeConfigSnapshot, config);
	return coerceConfig(applyMergePatch(runtimeConfigSourceSnapshot, runtimePatch));
}
function setRuntimeConfigSnapshotRefreshHandler(refreshHandler) {
	runtimeConfigSnapshotRefreshHandler = refreshHandler;
}
function loadConfig() {
	if (runtimeConfigSnapshot) return runtimeConfigSnapshot;
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
async function readBestEffortConfig() {
	const snapshot = await readConfigFileSnapshot();
	return snapshot.valid ? loadConfig() : snapshot.config;
}
async function readConfigFileSnapshot() {
	return await createConfigIO().readConfigFileSnapshot();
}
async function readConfigFileSnapshotForWrite() {
	return await createConfigIO().readConfigFileSnapshotForWrite();
}
async function writeConfigFile(cfg, options = {}) {
	const io = createConfigIO();
	let nextCfg = cfg;
	const hadRuntimeSnapshot = Boolean(runtimeConfigSnapshot);
	const hadBothSnapshots = Boolean(runtimeConfigSnapshot && runtimeConfigSourceSnapshot);
	if (hadBothSnapshots) {
		const runtimePatch = createMergePatch(runtimeConfigSnapshot, cfg);
		nextCfg = coerceConfig(applyMergePatch(runtimeConfigSourceSnapshot, runtimePatch));
	}
	const sameConfigPath = options.expectedConfigPath === void 0 || options.expectedConfigPath === io.configPath;
	await io.writeConfigFile(nextCfg, {
		envSnapshotForRestore: sameConfigPath ? options.envSnapshotForRestore : void 0,
		unsetPaths: options.unsetPaths
	});
	const refreshHandler = runtimeConfigSnapshotRefreshHandler;
	if (refreshHandler) try {
		if (await refreshHandler.refresh({ sourceConfig: nextCfg })) return;
	} catch (error) {
		try {
			refreshHandler.clearOnRefreshFailure?.();
		} catch {}
		const detail = error instanceof Error ? error.message : String(error);
		throw new ConfigRuntimeRefreshError(`Config was written to ${io.configPath}, but runtime snapshot refresh failed: ${detail}`, { cause: error });
	}
	if (hadBothSnapshots) {
		setRuntimeConfigSnapshot(io.loadConfig(), nextCfg);
		return;
	}
	if (hadRuntimeSnapshot) clearRuntimeConfigSnapshot();
}
//#endregion
export { splitCommandChain as $, applyConfigOverrides as A, applyMergePatch as At, isTrustedSafeBinPath as B, resolveAgentMaxConcurrent as Bt, WhatsAppConfigSchema as C, unwrapDispatchWrappersForResolution as Ct, listBundledWebSearchPluginIds as D, SAFE_BIN_PROFILES as Dt, validateJsonSchemaValue as E, DEFAULT_SAFE_BINS as Et, getConfigValueAtPath as F, resolveNormalizedProviderModelMaxTokens as Ft, normalizeSafeBinName as G, normalizeTrustedSafeBinDirs as H, resolveOwnerDisplaySetting as Ht, parseConfigPath as I, DEFAULT_TALK_PROVIDER as It, buildEnforcedShellCommand as J, analyzeArgvCommand as K, setConfigValueAtPath as L, buildTalkConfigResponse as Lt, resetConfigOverrides as M, ensureControlUiAllowedOriginsForNonLoopbackBind as Mt, setConfigOverride as N, collectDurableServiceEnvVars as Nt, withBundledPluginAllowlistCompat as O, normalizeSafeBinProfileFixtures as Ot, unsetConfigOverride as P, createConfigRuntimeEnv as Pt, resolvePlannedSegmentArgv as Q, unsetConfigValueAtPath as R, normalizeTalkSection as Rt, OpenClawSchema as S, resolveInlineCommandMatch as St, parseByteSize as T, normalizeExecutableToken as Tt, validateSafeBinArgv as U, listWritableExplicitTrustedSafeBinDirs as V, resolveSubagentMaxConcurrent as Vt, listRiskyConfiguredSafeBins as W, buildSafeShellCommand as X, buildSafeBinsShellCommand as Y, isWindowsPlatform as Z, normalizeOpenClawVersionBase as _, hasEnvManipulationBeforeShellWrapper as _t, getRuntimeConfigSnapshot as a, resolveCommandResolution as at, validateConfigObjectRawWithPlugins as b, POSIX_INLINE_COMMAND_FLAGS as bt, parseConfigJson5 as c, resolveExecutionTargetResolution as ct, readConfigFileSnapshot as d, resolvePolicyTargetResolution as dt, splitCommandChainWithOperators as et, readConfigFileSnapshotForWrite as f, resolveExecutableFromPathEnv as ft, writeConfigFile as g, extractShellWrapperInlineCommand as gt, setRuntimeConfigSnapshotRefreshHandler as h, extractShellWrapperCommand as ht, createConfigIO as i, resolveApprovalAuditCandidatePath as it, getConfigOverrides as j, applyLegacyMigrations as jt, withBundledPluginEnablementCompat as k, resolveSafeBinProfiles as kt, projectConfigOntoRuntimeSourceSnapshot as l, resolvePolicyAllowlistCandidatePath as lt, setRuntimeConfigSnapshot as m, POSIX_SHELL_WRAPPERS as mt, clearConfigCache as n, parseExecArgvToken as nt, getRuntimeConfigSourceSnapshot as o, resolveCommandResolutionFromArgv as ot, resolveConfigSnapshotHash as p, resolveExecWrapperTrustPlan as pt, analyzeShellCommand as q, clearRuntimeConfigSnapshot as r, resolveAllowlistCandidatePath as rt, loadConfig as s, resolveExecutionTargetCandidatePath as st, ConfigRuntimeRefreshError as t, matchAllowlist as tt, readBestEffortConfig as u, resolvePolicyTargetCandidatePath as ut, validateConfigObject as v, isShellWrapperExecutable as vt, parseNonNegativeByteSize as w, unwrapKnownDispatchWrapperInvocation as wt, validateConfigObjectWithPlugins as x, POWERSHELL_INLINE_COMMAND_FLAGS as xt, validateConfigObjectRaw as y, unwrapKnownShellMultiplexerInvocation as yt, getTrustedSafeBinDirs as z, resolveActiveTalkProviderConfig as zt };
