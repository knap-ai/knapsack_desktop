import { o as resolveRequiredHomeDir, t as expandHomePrefix } from "./home-dir-BnP38vVl.js";
import { E as isPlainObject$2, u as isRecord$1, v as resolveUserPath } from "./utils-CE3P21nG.js";
import { t as DEFAULT_CONTEXT_TOKENS } from "./defaults-BwiMD7ye.js";
import { n as VERSION } from "./version-TiEvEN12.js";
import { r as normalizeProviderId } from "./provider-id-CTiEzT1T.js";
import { n as resolveAgentModelPrimaryValue } from "./model-input-DR9jgad-.js";
import { f as parseModelRef } from "./model-selection-8a6zD_aX.js";
import { _ as resolveStateDir, c as resolveDefaultConfigCandidates, n as DEFAULT_GATEWAY_PORT, o as resolveConfigPath } from "./paths-CD8i0MSg.js";
import { c as normalizeAgentId } from "./session-key-D7XpmyVq.js";
import { t as isBlockedObjectKey } from "./prototype-keys-C9Ot198c.js";
import { m as resolveDefaultAgentId, p as resolveAgentWorkspaceDir } from "./agent-scope-CYXg_wTS.js";
import { i as normalizeEnvVarKey, n as isDangerousHostEnvOverrideVarName, r as isDangerousHostEnvVarName } from "./host-env-security-B2w9UVHS.js";
import { t as loadDotEnv } from "./dotenv-BMiHUUlZ.js";
import { a as shouldDeferShellEnvFallback, i as resolveShellEnvFallbackTimeoutMs, o as shouldEnableShellEnvFallback, r as loadShellEnvFallback } from "./shell-env-Dihl7qUt.js";
import { t as sanitizeTerminalText } from "./safe-text-BdDBLGQb.js";
import { n as containsEnvVarReference, r as resolveConfigEnvVars } from "./env-substitution-C89GR8CX.js";
import { a as resolveConfigIncludes, i as readConfigIncludeFileWithGuards, n as ConfigIncludeError } from "./includes-DTbWz80r.js";
import { a as mergeMissing, i as mapLegacyAudioTranscription, n as ensureRecord$1, r as getRecord, t as defineLegacyConfigMigration } from "./legacy.shared-CVRCIczI.js";
import { C as resolveSlackNativeStreaming, S as resolveDiscordPreviewStreamMode, T as resolveTelegramPreviewStreamMode, a as IrcConfigSchema, b as formatSlackStreamingBooleanMigrationMessage, c as SlackConfigSchema, i as IMessageConfigSchema, l as TelegramConfigSchema, n as DiscordConfigSchema, o as MSTeamsConfigSchema, r as GoogleChatConfigSchema, s as SignalConfigSchema, t as BlueBubblesConfigSchema, v as ChannelHeartbeatVisibilitySchema, w as resolveSlackStreamingMode, y as formatSlackStreamModeMigrationMessage } from "./zod-schema.providers-core-BJorTsd7.js";
import { a as hasConfiguredSecretInput, i as coerceSecretRef } from "./types.secrets-DTXJhyWe.js";
import { A as TtsConfigSchema, I as createAllowDenyChannelRulesSchema, N as TypingModeSchema, O as TranscribeAudioSchema, S as SecretInputSchema, T as SecretsConfigSchema, c as GroupPolicySchema, f as InboundDebounceSchema, g as NativeCommandsSettingSchema, h as ModelsConfigSchema, l as HexColorSchema, n as BlockStreamingCoalesceSchema, r as CliBackendSchema, s as GroupChatSchema, t as BlockStreamingChunkSchema, u as HumanDelaySchema, v as QueueSchema } from "./zod-schema.core-Cx4hqkoC.js";
import { t as sensitive } from "./zod-schema.sensitive-UYE6KH9T.js";
import { i as CHANNEL_IDS, r as normalizeChatChannelId } from "./chat-meta-Cdrnv7R-.js";
import "./registry-DTO_OK4F.js";
import { o as BUNDLED_WEB_SEARCH_PLUGIN_IDS$1 } from "./bundled-capability-metadata-D5qf8V45.js";
import { r as hasKind } from "./slots-u5aMXqtV.js";
import { a as normalizePluginsConfig, l as resolveMemorySlotDecision, s as resolveEffectivePluginActivationState } from "./config-state-zclcq4hc.js";
import { t as withBundledPluginAllowlistCompat } from "./bundled-compat-Qt2_tpRE.js";
import { n as loadPluginManifestRegistry } from "./manifest-registry-BSmqODu2.js";
import { i as summarizeAllowedValues, n as validateJsonSchemaValue, r as appendAllowedValuesHint, t as applyMergePatch } from "./merge-patch-B__RZvcw.js";
import { c as isWindowsAbsolutePath, i as isAvatarHttpUrl, n as hasAvatarUriScheme, o as isPathWithinRoot, r as isAvatarDataUrl } from "./avatar-policy-CgdIx-AA.js";
import { i as isCanonicalDottedDecimalIPv4, u as isLoopbackIpAddress } from "./ip-CDR21C3h.js";
import { t as splitShellArgs } from "./shell-argv-C_MxnBUo.js";
import { t as parseDurationMs } from "./parse-duration-CYo1PS8c.js";
import { a as MemorySearchSchema, c as AgentModelSchema, i as HeartbeatSchema, n as AgentSandboxSchema, r as ElevatedAllowFromSchema, s as ToolsSchema, t as AgentEntrySchema } from "./zod-schema.agent-runtime-BB53-_4o.js";
import { t as WhatsAppConfigSchema } from "./zod-schema.providers-whatsapp-piwHYP0l.js";
import { n as comparePrereleaseIdentifiers, r as normalizeLegacyDotBetaVersion } from "./semver-compare-BqB55QCY.js";
import fsSync from "node:fs";
import path from "node:path";
import os from "node:os";
import { isDeepStrictEqual } from "node:util";
import crypto from "node:crypto";
import JSON5 from "json5";
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
		content = fsSync.readFileSync(dotEnvPath, "utf8");
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
//#region src/config/legacy.migrations.audio.ts
function applyLegacyAudioTranscriptionModel(params) {
	const mapped = mapLegacyAudioTranscription(params.source);
	if (!mapped) {
		params.changes.push(params.invalidMessage);
		return;
	}
	const mediaAudio = ensureRecord$1(ensureRecord$1(ensureRecord$1(params.raw, "tools"), "media"), "audio");
	if ((Array.isArray(mediaAudio.models) ? mediaAudio.models : []).length === 0) {
		mediaAudio.enabled = true;
		mediaAudio.models = [mapped];
		params.changes.push(params.movedMessage);
		return;
	}
	params.changes.push(params.alreadySetMessage);
}
const LEGACY_CONFIG_MIGRATIONS_AUDIO = [defineLegacyConfigMigration({
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
})];
//#endregion
//#region src/config/legacy.migrations.channels.ts
function hasOwnKey(target, key) {
	return Object.prototype.hasOwnProperty.call(target, key);
}
function hasLegacyThreadBindingTtl(value) {
	const threadBindings = getRecord(value);
	return Boolean(threadBindings && hasOwnKey(threadBindings, "ttlHours"));
}
function hasLegacyThreadBindingTtlInAccounts(value) {
	const accounts = getRecord(value);
	if (!accounts) return false;
	return Object.values(accounts).some((entry) => hasLegacyThreadBindingTtl(getRecord(entry)?.threadBindings));
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
const LEGACY_CONFIG_MIGRATIONS_CHANNELS = [defineLegacyConfigMigration({
	id: "thread-bindings.ttlHours->idleHours",
	describe: "Move legacy threadBindings.ttlHours keys to threadBindings.idleHours (session + channels.discord)",
	legacyRules: [
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
		}
	],
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
}), defineLegacyConfigMigration({
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
})];
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
//#region src/config/legacy-x-search.ts
const XAI_PLUGIN_ID = "xai";
const X_SEARCH_LEGACY_PATH = "tools.web.x_search";
const XAI_WEB_SEARCH_PLUGIN_KEY_PATH = `plugins.entries.${XAI_PLUGIN_ID}.config.webSearch.apiKey`;
function isRecord(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
function cloneRecord(value) {
	if (!value) return value;
	return { ...value };
}
function ensureRecord(target, key) {
	const current = target[key];
	if (isRecord(current)) return current;
	const next = {};
	target[key] = next;
	return next;
}
function resolveLegacyXSearchConfig(raw) {
	if (!isRecord(raw)) return;
	const tools = isRecord(raw.tools) ? raw.tools : void 0;
	const web = isRecord(tools?.web) ? tools.web : void 0;
	return isRecord(web?.x_search) ? web.x_search : void 0;
}
function resolveLegacyXSearchAuth(legacy) {
	return legacy.apiKey;
}
function migrateLegacyXSearchConfig(raw) {
	if (!isRecord(raw)) return {
		config: raw,
		changes: []
	};
	const legacy = resolveLegacyXSearchConfig(raw);
	if (!legacy || !Object.prototype.hasOwnProperty.call(legacy, "apiKey")) return {
		config: raw,
		changes: []
	};
	const nextRoot = structuredClone(raw);
	const web = ensureRecord(ensureRecord(nextRoot, "tools"), "web");
	const nextLegacy = cloneRecord(legacy) ?? {};
	delete nextLegacy.apiKey;
	if (Object.keys(nextLegacy).length === 0) delete web.x_search;
	else web.x_search = nextLegacy;
	const entry = ensureRecord(ensureRecord(ensureRecord(nextRoot, "plugins"), "entries"), XAI_PLUGIN_ID);
	const hadEnabled = entry.enabled !== void 0;
	if (!hadEnabled) entry.enabled = true;
	const config = ensureRecord(entry, "config");
	const auth = resolveLegacyXSearchAuth(legacy);
	const changes = [];
	if (auth !== void 0) {
		const existingWebSearch = isRecord(config.webSearch) ? cloneRecord(config.webSearch) : void 0;
		if (!existingWebSearch) {
			config.webSearch = { apiKey: auth };
			changes.push(`Moved ${X_SEARCH_LEGACY_PATH}.apiKey → ${XAI_WEB_SEARCH_PLUGIN_KEY_PATH}.`);
		} else if (!Object.prototype.hasOwnProperty.call(existingWebSearch, "apiKey")) {
			existingWebSearch.apiKey = auth;
			config.webSearch = existingWebSearch;
			changes.push(`Merged ${X_SEARCH_LEGACY_PATH}.apiKey → ${XAI_WEB_SEARCH_PLUGIN_KEY_PATH} (filled missing plugin auth).`);
		} else changes.push(`Removed ${X_SEARCH_LEGACY_PATH}.apiKey (${XAI_WEB_SEARCH_PLUGIN_KEY_PATH} already set).`);
	}
	if (auth !== void 0 && Object.keys(nextLegacy).length === 0 && !hadEnabled) changes.push(`Removed empty ${X_SEARCH_LEGACY_PATH}.`);
	return {
		config: nextRoot,
		changes
	};
}
//#endregion
//#region src/config/legacy.migrations.runtime.ts
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
const LEGACY_TTS_PROVIDER_KEYS = [
	"openai",
	"elevenlabs",
	"microsoft",
	"edge"
];
const LEGACY_TTS_PLUGIN_IDS = new Set(["voice-call"]);
function isLegacyGatewayBindHostAlias(value) {
	if (typeof value !== "string") return false;
	const normalized = value.trim().toLowerCase();
	if (!normalized) return false;
	if (normalized === "auto" || normalized === "loopback" || normalized === "lan" || normalized === "tailnet" || normalized === "custom") return false;
	return normalized === "0.0.0.0" || normalized === "::" || normalized === "[::]" || normalized === "*" || normalized === "127.0.0.1" || normalized === "localhost" || normalized === "::1" || normalized === "[::1]";
}
function escapeControlForLog(value) {
	return value.replace(/\r/g, "\\r").replace(/\n/g, "\\n").replace(/\t/g, "\\t");
}
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
	const root = ensureRecord$1(params.raw, params.rootKey);
	const defaults = ensureRecord$1(root, "defaults");
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
function hasLegacyTtsProviderKeys(value) {
	const tts = getRecord(value);
	if (!tts) return false;
	return LEGACY_TTS_PROVIDER_KEYS.some((key) => Object.prototype.hasOwnProperty.call(tts, key));
}
function hasLegacyDiscordAccountTtsProviderKeys(value) {
	const accounts = getRecord(value);
	if (!accounts) return false;
	return Object.entries(accounts).some(([accountId, accountValue]) => {
		if (isBlockedObjectKey(accountId)) return false;
		return hasLegacyTtsProviderKeys(getRecord(getRecord(accountValue)?.voice)?.tts);
	});
}
function hasLegacyPluginEntryTtsProviderKeys(value) {
	const entries = getRecord(value);
	if (!entries) return false;
	return Object.entries(entries).some(([pluginId, entryValue]) => {
		if (isBlockedObjectKey(pluginId) || !LEGACY_TTS_PLUGIN_IDS.has(pluginId)) return false;
		return hasLegacyTtsProviderKeys(getRecord(getRecord(entryValue)?.config)?.tts);
	});
}
function getOrCreateTtsProviders(tts) {
	const providers = getRecord(tts.providers) ?? {};
	tts.providers = providers;
	return providers;
}
function mergeLegacyTtsProviderConfig(tts, legacyKey, providerId) {
	const legacyValue = getRecord(tts[legacyKey]);
	if (!legacyValue) return false;
	const providers = getOrCreateTtsProviders(tts);
	const existing = getRecord(providers[providerId]) ?? {};
	const merged = structuredClone(existing);
	mergeMissing(merged, legacyValue);
	providers[providerId] = merged;
	delete tts[legacyKey];
	return true;
}
function migrateLegacyTtsConfig(tts, pathLabel, changes) {
	if (!tts) return;
	const movedOpenAI = mergeLegacyTtsProviderConfig(tts, "openai", "openai");
	const movedElevenLabs = mergeLegacyTtsProviderConfig(tts, "elevenlabs", "elevenlabs");
	const movedMicrosoft = mergeLegacyTtsProviderConfig(tts, "microsoft", "microsoft");
	const movedEdge = mergeLegacyTtsProviderConfig(tts, "edge", "microsoft");
	if (movedOpenAI) changes.push(`Moved ${pathLabel}.openai → ${pathLabel}.providers.openai.`);
	if (movedElevenLabs) changes.push(`Moved ${pathLabel}.elevenlabs → ${pathLabel}.providers.elevenlabs.`);
	if (movedMicrosoft) changes.push(`Moved ${pathLabel}.microsoft → ${pathLabel}.providers.microsoft.`);
	if (movedEdge) changes.push(`Moved ${pathLabel}.edge → ${pathLabel}.providers.microsoft.`);
}
function resolveCompatibleDefaultGroupEntry(section) {
	const existingGroups = section.groups;
	if (existingGroups !== void 0 && !getRecord(existingGroups)) return null;
	const groups = getRecord(existingGroups) ?? {};
	const existingEntry = groups["*"];
	if (existingEntry !== void 0 && !getRecord(existingEntry)) return null;
	return {
		groups,
		entry: getRecord(existingEntry) ?? {}
	};
}
const LEGACY_CONFIG_MIGRATIONS_RUNTIME = [
	defineLegacyConfigMigration({
		id: "tools.web.x_search.apiKey->plugins.entries.xai.config.webSearch.apiKey",
		describe: "Move legacy x_search auth into the xAI plugin webSearch config",
		legacyRules: [{
			path: [
				"tools",
				"web",
				"x_search",
				"apiKey"
			],
			message: "tools.web.x_search.apiKey moved to the xAI plugin; use plugins.entries.xai.config.webSearch.apiKey instead (auto-migrated on load)."
		}],
		apply: (raw, changes) => {
			const migrated = migrateLegacyXSearchConfig(raw);
			if (!migrated.changes.length) return;
			for (const key of Object.keys(raw)) delete raw[key];
			Object.assign(raw, migrated.config);
			changes.push(...migrated.changes);
		}
	}),
	defineLegacyConfigMigration({
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
	}),
	defineLegacyConfigMigration({
		id: "channels.telegram.groupMentionsOnly->channels.telegram.groups.*.requireMention",
		describe: "Move channels.telegram.groupMentionsOnly to channels.telegram.groups.*.requireMention",
		legacyRules: [{
			path: [
				"channels",
				"telegram",
				"groupMentionsOnly"
			],
			message: "channels.telegram.groupMentionsOnly was removed; use channels.telegram.groups.\"*\".requireMention instead (auto-migrated on load)."
		}],
		apply: (raw, changes) => {
			const channels = ensureRecord$1(raw, "channels");
			const telegram = getRecord(channels.telegram);
			if (!telegram || telegram.groupMentionsOnly === void 0) return;
			const groupMentionsOnly = telegram.groupMentionsOnly;
			const defaultGroupEntry = resolveCompatibleDefaultGroupEntry(telegram);
			const defaultKey = "*";
			if (!defaultGroupEntry) {
				changes.push("Skipped channels.telegram.groupMentionsOnly migration because channels.telegram.groups already has an incompatible shape; fix remaining issues manually.");
				return;
			}
			const { groups, entry } = defaultGroupEntry;
			if (entry.requireMention === void 0) {
				entry.requireMention = groupMentionsOnly;
				groups[defaultKey] = entry;
				telegram.groups = groups;
				changes.push("Moved channels.telegram.groupMentionsOnly → channels.telegram.groups.\"*\".requireMention.");
			} else changes.push("Removed channels.telegram.groupMentionsOnly (channels.telegram.groups.\"*\" already set).");
			delete telegram.groupMentionsOnly;
			channels.telegram = telegram;
			raw.channels = channels;
		}
	}),
	defineLegacyConfigMigration({
		id: "memorySearch->agents.defaults.memorySearch",
		describe: "Move top-level memorySearch to agents.defaults.memorySearch",
		legacyRules: [{
			path: ["memorySearch"],
			message: "top-level memorySearch was moved; use agents.defaults.memorySearch instead (auto-migrated on load)."
		}],
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
	}),
	defineLegacyConfigMigration({
		id: "gateway.bind.host-alias->bind-mode",
		describe: "Normalize gateway.bind host aliases to supported bind modes",
		legacyRules: [{
			path: ["gateway", "bind"],
			message: "gateway.bind host aliases (for example 0.0.0.0/localhost) are legacy; use bind modes (lan/loopback/custom/tailnet/auto) instead (auto-migrated on load).",
			match: (value) => isLegacyGatewayBindHostAlias(value),
			requireSourceLiteral: true
		}],
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
	}),
	defineLegacyConfigMigration({
		id: "tts.providers-generic-shape",
		describe: "Move legacy bundled TTS config keys into messages.tts.providers",
		legacyRules: [
			{
				path: ["messages", "tts"],
				message: "messages.tts.<provider> keys (openai/elevenlabs/microsoft/edge) are legacy; use messages.tts.providers.<provider> (auto-migrated on load).",
				match: (value) => hasLegacyTtsProviderKeys(value)
			},
			{
				path: [
					"channels",
					"discord",
					"voice",
					"tts"
				],
				message: "channels.discord.voice.tts.<provider> keys (openai/elevenlabs/microsoft/edge) are legacy; use channels.discord.voice.tts.providers.<provider> (auto-migrated on load).",
				match: (value) => hasLegacyTtsProviderKeys(value)
			},
			{
				path: [
					"channels",
					"discord",
					"accounts"
				],
				message: "channels.discord.accounts.<id>.voice.tts.<provider> keys (openai/elevenlabs/microsoft/edge) are legacy; use channels.discord.accounts.<id>.voice.tts.providers.<provider> (auto-migrated on load).",
				match: (value) => hasLegacyDiscordAccountTtsProviderKeys(value)
			},
			{
				path: ["plugins", "entries"],
				message: "plugins.entries.voice-call.config.tts.<provider> keys (openai/elevenlabs/microsoft/edge) are legacy; use plugins.entries.voice-call.config.tts.providers.<provider> (auto-migrated on load).",
				match: (value) => hasLegacyPluginEntryTtsProviderKeys(value)
			}
		],
		apply: (raw, changes) => {
			migrateLegacyTtsConfig(getRecord(getRecord(raw.messages)?.tts), "messages.tts", changes);
			const discord = getRecord(getRecord(raw.channels)?.discord);
			migrateLegacyTtsConfig(getRecord(getRecord(discord?.voice)?.tts), "channels.discord.voice.tts", changes);
			const discordAccounts = getRecord(discord?.accounts);
			if (discordAccounts) for (const [accountId, accountValue] of Object.entries(discordAccounts)) {
				if (isBlockedObjectKey(accountId)) continue;
				migrateLegacyTtsConfig(getRecord(getRecord(getRecord(accountValue)?.voice)?.tts), `channels.discord.accounts.${accountId}.voice.tts`, changes);
			}
			const pluginEntries = getRecord(getRecord(raw.plugins)?.entries);
			if (!pluginEntries) return;
			for (const [pluginId, entryValue] of Object.entries(pluginEntries)) {
				if (isBlockedObjectKey(pluginId) || !LEGACY_TTS_PLUGIN_IDS.has(pluginId)) continue;
				migrateLegacyTtsConfig(getRecord(getRecord(getRecord(entryValue)?.config)?.tts), `plugins.entries.${pluginId}.config.tts`, changes);
			}
		}
	}),
	defineLegacyConfigMigration({
		id: "heartbeat->agents.defaults.heartbeat",
		describe: "Move top-level heartbeat to agents.defaults.heartbeat/channels.defaults.heartbeat",
		legacyRules: [{
			path: ["heartbeat"],
			message: "top-level heartbeat is not a valid config path; use agents.defaults.heartbeat (cadence/target/model settings) or channels.defaults.heartbeat (showOk/showAlerts/useIndicator)."
		}],
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
	})
];
//#endregion
//#region src/config/legacy.migrations.ts
const LEGACY_CONFIG_MIGRATION_SPECS = [
	...LEGACY_CONFIG_MIGRATIONS_CHANNELS,
	...LEGACY_CONFIG_MIGRATIONS_AUDIO,
	...LEGACY_CONFIG_MIGRATIONS_RUNTIME
];
const LEGACY_CONFIG_MIGRATIONS = LEGACY_CONFIG_MIGRATION_SPECS.map(({ legacyRules: _legacyRules, ...migration }) => migration);
const LEGACY_CONFIG_MIGRATION_RULES = LEGACY_CONFIG_MIGRATION_SPECS.flatMap((migration) => migration.legacyRules ?? []);
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
	for (const rule of LEGACY_CONFIG_MIGRATION_RULES) {
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
//#region src/plugins/bundled-web-search-ids.ts
const BUNDLED_WEB_SEARCH_PLUGIN_IDS = BUNDLED_WEB_SEARCH_PLUGIN_IDS$1;
function listBundledWebSearchPluginIds() {
	return [...BUNDLED_WEB_SEARCH_PLUGIN_IDS];
}
//#endregion
//#region src/secrets/unsupported-surface-policy.ts
function collectUnsupportedSecretRefConfigCandidates(raw) {
	if (!isRecord$1(raw)) return [];
	const candidates = [];
	const commands = isRecord$1(raw.commands) ? raw.commands : null;
	if (commands) candidates.push({
		path: "commands.ownerDisplaySecret",
		value: commands.ownerDisplaySecret
	});
	const hooks = isRecord$1(raw.hooks) ? raw.hooks : null;
	if (hooks) {
		candidates.push({
			path: "hooks.token",
			value: hooks.token
		});
		const gmail = isRecord$1(hooks.gmail) ? hooks.gmail : null;
		if (gmail) candidates.push({
			path: "hooks.gmail.pushToken",
			value: gmail.pushToken
		});
		const mappings = hooks.mappings;
		if (Array.isArray(mappings)) for (const [index, mapping] of mappings.entries()) {
			if (!isRecord$1(mapping)) continue;
			candidates.push({
				path: `hooks.mappings.${index}.sessionKey`,
				value: mapping.sessionKey
			});
		}
	}
	const channels = isRecord$1(raw.channels) ? raw.channels : null;
	if (!channels) return candidates;
	const discord = isRecord$1(channels.discord) ? channels.discord : null;
	if (discord) {
		const threadBindings = isRecord$1(discord.threadBindings) ? discord.threadBindings : null;
		if (threadBindings) candidates.push({
			path: "channels.discord.threadBindings.webhookToken",
			value: threadBindings.webhookToken
		});
		const accounts = isRecord$1(discord.accounts) ? discord.accounts : null;
		if (accounts) for (const [accountId, account] of Object.entries(accounts)) {
			if (!isRecord$1(account)) continue;
			const accountThreadBindings = isRecord$1(account.threadBindings) ? account.threadBindings : null;
			if (!accountThreadBindings) continue;
			candidates.push({
				path: `channels.discord.accounts.${accountId}.threadBindings.webhookToken`,
				value: accountThreadBindings.webhookToken
			});
		}
	}
	const whatsapp = isRecord$1(channels.whatsapp) ? channels.whatsapp : null;
	if (!whatsapp) return candidates;
	const creds = isRecord$1(whatsapp.creds) ? whatsapp.creds : null;
	if (creds) candidates.push({
		path: "channels.whatsapp.creds.json",
		value: creds.json
	});
	const accounts = isRecord$1(whatsapp.accounts) ? whatsapp.accounts : null;
	if (!accounts) return candidates;
	for (const [accountId, account] of Object.entries(accounts)) {
		if (!isRecord$1(account)) continue;
		const accountCreds = isRecord$1(account.creds) ? account.creds : null;
		if (!accountCreds) continue;
		candidates.push({
			path: `channels.whatsapp.accounts.${accountId}.creds.json`,
			value: accountCreds.json
		});
	}
	return candidates;
}
//#endregion
//#region src/config/bundled-channel-config-metadata.generated.ts
const GENERATED_BUNDLED_CHANNEL_CONFIG_METADATA = [
	{
		pluginId: "bluebubbles",
		channelId: "bluebubbles",
		label: "BlueBubbles",
		description: "iMessage via the BlueBubbles mac app + REST API.",
		schema: {
			$schema: "http://json-schema.org/draft-07/schema#",
			type: "object",
			properties: {
				name: { type: "string" },
				enabled: { type: "boolean" },
				markdown: {
					type: "object",
					properties: { tables: {
						type: "string",
						enum: [
							"off",
							"bullets",
							"code",
							"block"
						]
					} },
					additionalProperties: false
				},
				serverUrl: { type: "string" },
				password: { anyOf: [{ type: "string" }, { oneOf: [
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "env"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: {
								type: "string",
								pattern: "^[A-Z][A-Z0-9_]{0,127}$"
							}
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					},
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "file"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: { type: "string" }
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					},
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "exec"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: { type: "string" }
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					}
				] }] },
				webhookPath: { type: "string" },
				dmPolicy: {
					type: "string",
					enum: [
						"pairing",
						"allowlist",
						"open",
						"disabled"
					]
				},
				allowFrom: {
					type: "array",
					items: { anyOf: [{ type: "string" }, { type: "number" }] }
				},
				groupAllowFrom: {
					type: "array",
					items: { anyOf: [{ type: "string" }, { type: "number" }] }
				},
				groupPolicy: {
					type: "string",
					enum: [
						"open",
						"disabled",
						"allowlist"
					]
				},
				enrichGroupParticipantsFromContacts: {
					default: true,
					type: "boolean"
				},
				historyLimit: {
					type: "integer",
					minimum: 0,
					maximum: 9007199254740991
				},
				dmHistoryLimit: {
					type: "integer",
					minimum: 0,
					maximum: 9007199254740991
				},
				textChunkLimit: {
					type: "integer",
					exclusiveMinimum: 0,
					maximum: 9007199254740991
				},
				chunkMode: {
					type: "string",
					enum: ["length", "newline"]
				},
				mediaMaxMb: {
					type: "integer",
					exclusiveMinimum: 0,
					maximum: 9007199254740991
				},
				mediaLocalRoots: {
					type: "array",
					items: { type: "string" }
				},
				sendReadReceipts: { type: "boolean" },
				allowPrivateNetwork: { type: "boolean" },
				blockStreaming: { type: "boolean" },
				groups: {
					type: "object",
					properties: {},
					additionalProperties: {
						type: "object",
						properties: {
							requireMention: { type: "boolean" },
							tools: {
								type: "object",
								properties: {
									allow: {
										type: "array",
										items: { type: "string" }
									},
									alsoAllow: {
										type: "array",
										items: { type: "string" }
									},
									deny: {
										type: "array",
										items: { type: "string" }
									}
								},
								additionalProperties: false
							}
						},
						additionalProperties: false
					}
				},
				accounts: {
					type: "object",
					properties: {},
					additionalProperties: {
						type: "object",
						properties: {
							name: { type: "string" },
							enabled: { type: "boolean" },
							markdown: {
								type: "object",
								properties: { tables: {
									type: "string",
									enum: [
										"off",
										"bullets",
										"code",
										"block"
									]
								} },
								additionalProperties: false
							},
							serverUrl: { type: "string" },
							password: { anyOf: [{ type: "string" }, { oneOf: [
								{
									type: "object",
									properties: {
										source: {
											type: "string",
											const: "env"
										},
										provider: {
											type: "string",
											pattern: "^[a-z][a-z0-9_-]{0,63}$"
										},
										id: {
											type: "string",
											pattern: "^[A-Z][A-Z0-9_]{0,127}$"
										}
									},
									required: [
										"source",
										"provider",
										"id"
									],
									additionalProperties: false
								},
								{
									type: "object",
									properties: {
										source: {
											type: "string",
											const: "file"
										},
										provider: {
											type: "string",
											pattern: "^[a-z][a-z0-9_-]{0,63}$"
										},
										id: { type: "string" }
									},
									required: [
										"source",
										"provider",
										"id"
									],
									additionalProperties: false
								},
								{
									type: "object",
									properties: {
										source: {
											type: "string",
											const: "exec"
										},
										provider: {
											type: "string",
											pattern: "^[a-z][a-z0-9_-]{0,63}$"
										},
										id: { type: "string" }
									},
									required: [
										"source",
										"provider",
										"id"
									],
									additionalProperties: false
								}
							] }] },
							webhookPath: { type: "string" },
							dmPolicy: {
								type: "string",
								enum: [
									"pairing",
									"allowlist",
									"open",
									"disabled"
								]
							},
							allowFrom: {
								type: "array",
								items: { anyOf: [{ type: "string" }, { type: "number" }] }
							},
							groupAllowFrom: {
								type: "array",
								items: { anyOf: [{ type: "string" }, { type: "number" }] }
							},
							groupPolicy: {
								type: "string",
								enum: [
									"open",
									"disabled",
									"allowlist"
								]
							},
							enrichGroupParticipantsFromContacts: {
								default: true,
								type: "boolean"
							},
							historyLimit: {
								type: "integer",
								minimum: 0,
								maximum: 9007199254740991
							},
							dmHistoryLimit: {
								type: "integer",
								minimum: 0,
								maximum: 9007199254740991
							},
							textChunkLimit: {
								type: "integer",
								exclusiveMinimum: 0,
								maximum: 9007199254740991
							},
							chunkMode: {
								type: "string",
								enum: ["length", "newline"]
							},
							mediaMaxMb: {
								type: "integer",
								exclusiveMinimum: 0,
								maximum: 9007199254740991
							},
							mediaLocalRoots: {
								type: "array",
								items: { type: "string" }
							},
							sendReadReceipts: { type: "boolean" },
							allowPrivateNetwork: { type: "boolean" },
							blockStreaming: { type: "boolean" },
							groups: {
								type: "object",
								properties: {},
								additionalProperties: {
									type: "object",
									properties: {
										requireMention: { type: "boolean" },
										tools: {
											type: "object",
											properties: {
												allow: {
													type: "array",
													items: { type: "string" }
												},
												alsoAllow: {
													type: "array",
													items: { type: "string" }
												},
												deny: {
													type: "array",
													items: { type: "string" }
												}
											},
											additionalProperties: false
										}
									},
									additionalProperties: false
								}
							}
						},
						required: ["enrichGroupParticipantsFromContacts"],
						additionalProperties: false
					}
				},
				defaultAccount: { type: "string" },
				actions: {
					type: "object",
					properties: {
						reactions: {
							default: true,
							type: "boolean"
						},
						edit: {
							default: true,
							type: "boolean"
						},
						unsend: {
							default: true,
							type: "boolean"
						},
						reply: {
							default: true,
							type: "boolean"
						},
						sendWithEffect: {
							default: true,
							type: "boolean"
						},
						renameGroup: {
							default: true,
							type: "boolean"
						},
						setGroupIcon: {
							default: true,
							type: "boolean"
						},
						addParticipant: {
							default: true,
							type: "boolean"
						},
						removeParticipant: {
							default: true,
							type: "boolean"
						},
						leaveGroup: {
							default: true,
							type: "boolean"
						},
						sendAttachment: {
							default: true,
							type: "boolean"
						}
					},
					required: [
						"reactions",
						"edit",
						"unsend",
						"reply",
						"sendWithEffect",
						"renameGroup",
						"setGroupIcon",
						"addParticipant",
						"removeParticipant",
						"leaveGroup",
						"sendAttachment"
					],
					additionalProperties: false
				}
			},
			required: ["enrichGroupParticipantsFromContacts"],
			additionalProperties: false
		},
		uiHints: {
			"": {
				label: "BlueBubbles",
				help: "BlueBubbles channel provider configuration used for Apple messaging bridge integrations. Keep DM policy aligned with your trusted sender model in shared deployments."
			},
			dmPolicy: {
				label: "BlueBubbles DM Policy",
				help: "Direct message access control (\"pairing\" recommended). \"open\" requires channels.bluebubbles.allowFrom=[\"*\"]."
			}
		}
	},
	{
		pluginId: "discord",
		channelId: "discord",
		label: "Discord",
		description: "very well supported right now.",
		schema: {
			$schema: "http://json-schema.org/draft-07/schema#",
			type: "object",
			properties: {
				name: { type: "string" },
				capabilities: {
					type: "array",
					items: { type: "string" }
				},
				markdown: {
					type: "object",
					properties: { tables: {
						type: "string",
						enum: [
							"off",
							"bullets",
							"code",
							"block"
						]
					} },
					additionalProperties: false
				},
				enabled: { type: "boolean" },
				commands: {
					type: "object",
					properties: {
						native: { anyOf: [{ type: "boolean" }, {
							type: "string",
							const: "auto"
						}] },
						nativeSkills: { anyOf: [{ type: "boolean" }, {
							type: "string",
							const: "auto"
						}] }
					},
					additionalProperties: false
				},
				configWrites: { type: "boolean" },
				token: { anyOf: [{ type: "string" }, { oneOf: [
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "env"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: {
								type: "string",
								pattern: "^[A-Z][A-Z0-9_]{0,127}$"
							}
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					},
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "file"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: { type: "string" }
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					},
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "exec"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: { type: "string" }
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					}
				] }] },
				proxy: { type: "string" },
				allowBots: { anyOf: [{ type: "boolean" }, {
					type: "string",
					const: "mentions"
				}] },
				dangerouslyAllowNameMatching: { type: "boolean" },
				groupPolicy: {
					default: "allowlist",
					type: "string",
					enum: [
						"open",
						"disabled",
						"allowlist"
					]
				},
				historyLimit: {
					type: "integer",
					minimum: 0,
					maximum: 9007199254740991
				},
				dmHistoryLimit: {
					type: "integer",
					minimum: 0,
					maximum: 9007199254740991
				},
				dms: {
					type: "object",
					propertyNames: { type: "string" },
					additionalProperties: {
						type: "object",
						properties: { historyLimit: {
							type: "integer",
							minimum: 0,
							maximum: 9007199254740991
						} },
						additionalProperties: false
					}
				},
				textChunkLimit: {
					type: "integer",
					exclusiveMinimum: 0,
					maximum: 9007199254740991
				},
				chunkMode: {
					type: "string",
					enum: ["length", "newline"]
				},
				blockStreaming: { type: "boolean" },
				blockStreamingCoalesce: {
					type: "object",
					properties: {
						minChars: {
							type: "integer",
							exclusiveMinimum: 0,
							maximum: 9007199254740991
						},
						maxChars: {
							type: "integer",
							exclusiveMinimum: 0,
							maximum: 9007199254740991
						},
						idleMs: {
							type: "integer",
							minimum: 0,
							maximum: 9007199254740991
						}
					},
					additionalProperties: false
				},
				streaming: { anyOf: [{ type: "boolean" }, {
					type: "string",
					enum: [
						"off",
						"partial",
						"block",
						"progress"
					]
				}] },
				streamMode: {
					type: "string",
					enum: [
						"partial",
						"block",
						"off"
					]
				},
				draftChunk: {
					type: "object",
					properties: {
						minChars: {
							type: "integer",
							exclusiveMinimum: 0,
							maximum: 9007199254740991
						},
						maxChars: {
							type: "integer",
							exclusiveMinimum: 0,
							maximum: 9007199254740991
						},
						breakPreference: { anyOf: [
							{
								type: "string",
								const: "paragraph"
							},
							{
								type: "string",
								const: "newline"
							},
							{
								type: "string",
								const: "sentence"
							}
						] }
					},
					additionalProperties: false
				},
				maxLinesPerMessage: {
					type: "integer",
					exclusiveMinimum: 0,
					maximum: 9007199254740991
				},
				mediaMaxMb: {
					type: "number",
					exclusiveMinimum: 0
				},
				retry: {
					type: "object",
					properties: {
						attempts: {
							type: "integer",
							minimum: 1,
							maximum: 9007199254740991
						},
						minDelayMs: {
							type: "integer",
							minimum: 0,
							maximum: 9007199254740991
						},
						maxDelayMs: {
							type: "integer",
							minimum: 0,
							maximum: 9007199254740991
						},
						jitter: {
							type: "number",
							minimum: 0,
							maximum: 1
						}
					},
					additionalProperties: false
				},
				actions: {
					type: "object",
					properties: {
						reactions: { type: "boolean" },
						stickers: { type: "boolean" },
						emojiUploads: { type: "boolean" },
						stickerUploads: { type: "boolean" },
						polls: { type: "boolean" },
						permissions: { type: "boolean" },
						messages: { type: "boolean" },
						threads: { type: "boolean" },
						pins: { type: "boolean" },
						search: { type: "boolean" },
						memberInfo: { type: "boolean" },
						roleInfo: { type: "boolean" },
						roles: { type: "boolean" },
						channelInfo: { type: "boolean" },
						voiceStatus: { type: "boolean" },
						events: { type: "boolean" },
						moderation: { type: "boolean" },
						channels: { type: "boolean" },
						presence: { type: "boolean" }
					},
					additionalProperties: false
				},
				replyToMode: { anyOf: [
					{
						type: "string",
						const: "off"
					},
					{
						type: "string",
						const: "first"
					},
					{
						type: "string",
						const: "all"
					}
				] },
				dmPolicy: {
					type: "string",
					enum: [
						"pairing",
						"allowlist",
						"open",
						"disabled"
					]
				},
				allowFrom: {
					type: "array",
					items: { type: "string" }
				},
				defaultTo: { type: "string" },
				dm: {
					type: "object",
					properties: {
						enabled: { type: "boolean" },
						policy: {
							type: "string",
							enum: [
								"pairing",
								"allowlist",
								"open",
								"disabled"
							]
						},
						allowFrom: {
							type: "array",
							items: { type: "string" }
						},
						groupEnabled: { type: "boolean" },
						groupChannels: {
							type: "array",
							items: { type: "string" }
						}
					},
					additionalProperties: false
				},
				guilds: {
					type: "object",
					propertyNames: { type: "string" },
					additionalProperties: {
						type: "object",
						properties: {
							slug: { type: "string" },
							requireMention: { type: "boolean" },
							ignoreOtherMentions: { type: "boolean" },
							tools: {
								type: "object",
								properties: {
									allow: {
										type: "array",
										items: { type: "string" }
									},
									alsoAllow: {
										type: "array",
										items: { type: "string" }
									},
									deny: {
										type: "array",
										items: { type: "string" }
									}
								},
								additionalProperties: false
							},
							toolsBySender: {
								type: "object",
								propertyNames: { type: "string" },
								additionalProperties: {
									type: "object",
									properties: {
										allow: {
											type: "array",
											items: { type: "string" }
										},
										alsoAllow: {
											type: "array",
											items: { type: "string" }
										},
										deny: {
											type: "array",
											items: { type: "string" }
										}
									},
									additionalProperties: false
								}
							},
							reactionNotifications: {
								type: "string",
								enum: [
									"off",
									"own",
									"all",
									"allowlist"
								]
							},
							users: {
								type: "array",
								items: { type: "string" }
							},
							roles: {
								type: "array",
								items: { type: "string" }
							},
							channels: {
								type: "object",
								propertyNames: { type: "string" },
								additionalProperties: {
									type: "object",
									properties: {
										allow: { type: "boolean" },
										requireMention: { type: "boolean" },
										ignoreOtherMentions: { type: "boolean" },
										tools: {
											type: "object",
											properties: {
												allow: {
													type: "array",
													items: { type: "string" }
												},
												alsoAllow: {
													type: "array",
													items: { type: "string" }
												},
												deny: {
													type: "array",
													items: { type: "string" }
												}
											},
											additionalProperties: false
										},
										toolsBySender: {
											type: "object",
											propertyNames: { type: "string" },
											additionalProperties: {
												type: "object",
												properties: {
													allow: {
														type: "array",
														items: { type: "string" }
													},
													alsoAllow: {
														type: "array",
														items: { type: "string" }
													},
													deny: {
														type: "array",
														items: { type: "string" }
													}
												},
												additionalProperties: false
											}
										},
										skills: {
											type: "array",
											items: { type: "string" }
										},
										enabled: { type: "boolean" },
										users: {
											type: "array",
											items: { type: "string" }
										},
										roles: {
											type: "array",
											items: { type: "string" }
										},
										systemPrompt: { type: "string" },
										includeThreadStarter: { type: "boolean" },
										autoThread: { type: "boolean" },
										autoThreadName: {
											type: "string",
											enum: ["message", "generated"]
										},
										autoArchiveDuration: { anyOf: [
											{
												type: "string",
												enum: [
													"60",
													"1440",
													"4320",
													"10080"
												]
											},
											{
												type: "number",
												const: 60
											},
											{
												type: "number",
												const: 1440
											},
											{
												type: "number",
												const: 4320
											},
											{
												type: "number",
												const: 10080
											}
										] }
									},
									additionalProperties: false
								}
							}
						},
						additionalProperties: false
					}
				},
				heartbeat: {
					type: "object",
					properties: {
						showOk: { type: "boolean" },
						showAlerts: { type: "boolean" },
						useIndicator: { type: "boolean" }
					},
					additionalProperties: false
				},
				healthMonitor: {
					type: "object",
					properties: { enabled: { type: "boolean" } },
					additionalProperties: false
				},
				execApprovals: {
					type: "object",
					properties: {
						enabled: { type: "boolean" },
						approvers: {
							type: "array",
							items: { type: "string" }
						},
						agentFilter: {
							type: "array",
							items: { type: "string" }
						},
						sessionFilter: {
							type: "array",
							items: { type: "string" }
						},
						cleanupAfterResolve: { type: "boolean" },
						target: {
							type: "string",
							enum: [
								"dm",
								"channel",
								"both"
							]
						}
					},
					additionalProperties: false
				},
				agentComponents: {
					type: "object",
					properties: { enabled: { type: "boolean" } },
					additionalProperties: false
				},
				ui: {
					type: "object",
					properties: { components: {
						type: "object",
						properties: { accentColor: {
							type: "string",
							pattern: "^#?[0-9a-fA-F]{6}$"
						} },
						additionalProperties: false
					} },
					additionalProperties: false
				},
				slashCommand: {
					type: "object",
					properties: { ephemeral: { type: "boolean" } },
					additionalProperties: false
				},
				threadBindings: {
					type: "object",
					properties: {
						enabled: { type: "boolean" },
						idleHours: {
							type: "number",
							minimum: 0
						},
						maxAgeHours: {
							type: "number",
							minimum: 0
						},
						spawnSubagentSessions: { type: "boolean" },
						spawnAcpSessions: { type: "boolean" }
					},
					additionalProperties: false
				},
				intents: {
					type: "object",
					properties: {
						presence: { type: "boolean" },
						guildMembers: { type: "boolean" }
					},
					additionalProperties: false
				},
				voice: {
					type: "object",
					properties: {
						enabled: { type: "boolean" },
						autoJoin: {
							type: "array",
							items: {
								type: "object",
								properties: {
									guildId: {
										type: "string",
										minLength: 1
									},
									channelId: {
										type: "string",
										minLength: 1
									}
								},
								required: ["guildId", "channelId"],
								additionalProperties: false
							}
						},
						daveEncryption: { type: "boolean" },
						decryptionFailureTolerance: {
							type: "integer",
							minimum: 0,
							maximum: 9007199254740991
						},
						tts: {
							type: "object",
							properties: {
								auto: {
									type: "string",
									enum: [
										"off",
										"always",
										"inbound",
										"tagged"
									]
								},
								enabled: { type: "boolean" },
								mode: {
									type: "string",
									enum: ["final", "all"]
								},
								provider: {
									type: "string",
									minLength: 1
								},
								summaryModel: { type: "string" },
								modelOverrides: {
									type: "object",
									properties: {
										enabled: { type: "boolean" },
										allowText: { type: "boolean" },
										allowProvider: { type: "boolean" },
										allowVoice: { type: "boolean" },
										allowModelId: { type: "boolean" },
										allowVoiceSettings: { type: "boolean" },
										allowNormalization: { type: "boolean" },
										allowSeed: { type: "boolean" }
									},
									additionalProperties: false
								},
								providers: {
									type: "object",
									propertyNames: { type: "string" },
									additionalProperties: {
										type: "object",
										properties: { apiKey: { anyOf: [{ type: "string" }, { oneOf: [
											{
												type: "object",
												properties: {
													source: {
														type: "string",
														const: "env"
													},
													provider: {
														type: "string",
														pattern: "^[a-z][a-z0-9_-]{0,63}$"
													},
													id: {
														type: "string",
														pattern: "^[A-Z][A-Z0-9_]{0,127}$"
													}
												},
												required: [
													"source",
													"provider",
													"id"
												],
												additionalProperties: false
											},
											{
												type: "object",
												properties: {
													source: {
														type: "string",
														const: "file"
													},
													provider: {
														type: "string",
														pattern: "^[a-z][a-z0-9_-]{0,63}$"
													},
													id: { type: "string" }
												},
												required: [
													"source",
													"provider",
													"id"
												],
												additionalProperties: false
											},
											{
												type: "object",
												properties: {
													source: {
														type: "string",
														const: "exec"
													},
													provider: {
														type: "string",
														pattern: "^[a-z][a-z0-9_-]{0,63}$"
													},
													id: { type: "string" }
												},
												required: [
													"source",
													"provider",
													"id"
												],
												additionalProperties: false
											}
										] }] } },
										additionalProperties: { anyOf: [
											{ type: "string" },
											{ type: "number" },
											{ type: "boolean" },
											{ type: "null" },
											{
												type: "array",
												items: {}
											},
											{
												type: "object",
												propertyNames: { type: "string" },
												additionalProperties: {}
											}
										] }
									}
								},
								prefsPath: { type: "string" },
								maxTextLength: {
									type: "integer",
									minimum: 1,
									maximum: 9007199254740991
								},
								timeoutMs: {
									type: "integer",
									minimum: 1e3,
									maximum: 12e4
								}
							},
							additionalProperties: false
						}
					},
					additionalProperties: false
				},
				pluralkit: {
					type: "object",
					properties: {
						enabled: { type: "boolean" },
						token: { anyOf: [{ type: "string" }, { oneOf: [
							{
								type: "object",
								properties: {
									source: {
										type: "string",
										const: "env"
									},
									provider: {
										type: "string",
										pattern: "^[a-z][a-z0-9_-]{0,63}$"
									},
									id: {
										type: "string",
										pattern: "^[A-Z][A-Z0-9_]{0,127}$"
									}
								},
								required: [
									"source",
									"provider",
									"id"
								],
								additionalProperties: false
							},
							{
								type: "object",
								properties: {
									source: {
										type: "string",
										const: "file"
									},
									provider: {
										type: "string",
										pattern: "^[a-z][a-z0-9_-]{0,63}$"
									},
									id: { type: "string" }
								},
								required: [
									"source",
									"provider",
									"id"
								],
								additionalProperties: false
							},
							{
								type: "object",
								properties: {
									source: {
										type: "string",
										const: "exec"
									},
									provider: {
										type: "string",
										pattern: "^[a-z][a-z0-9_-]{0,63}$"
									},
									id: { type: "string" }
								},
								required: [
									"source",
									"provider",
									"id"
								],
								additionalProperties: false
							}
						] }] }
					},
					additionalProperties: false
				},
				responsePrefix: { type: "string" },
				ackReaction: { type: "string" },
				ackReactionScope: {
					type: "string",
					enum: [
						"group-mentions",
						"group-all",
						"direct",
						"all",
						"off",
						"none"
					]
				},
				activity: { type: "string" },
				status: {
					type: "string",
					enum: [
						"online",
						"dnd",
						"idle",
						"invisible"
					]
				},
				autoPresence: {
					type: "object",
					properties: {
						enabled: { type: "boolean" },
						intervalMs: {
							type: "integer",
							exclusiveMinimum: 0,
							maximum: 9007199254740991
						},
						minUpdateIntervalMs: {
							type: "integer",
							exclusiveMinimum: 0,
							maximum: 9007199254740991
						},
						healthyText: { type: "string" },
						degradedText: { type: "string" },
						exhaustedText: { type: "string" }
					},
					additionalProperties: false
				},
				activityType: { anyOf: [
					{
						type: "number",
						const: 0
					},
					{
						type: "number",
						const: 1
					},
					{
						type: "number",
						const: 2
					},
					{
						type: "number",
						const: 3
					},
					{
						type: "number",
						const: 4
					},
					{
						type: "number",
						const: 5
					}
				] },
				activityUrl: {
					type: "string",
					format: "uri"
				},
				inboundWorker: {
					type: "object",
					properties: { runTimeoutMs: {
						type: "integer",
						minimum: 0,
						maximum: 9007199254740991
					} },
					additionalProperties: false
				},
				eventQueue: {
					type: "object",
					properties: {
						listenerTimeout: {
							type: "integer",
							exclusiveMinimum: 0,
							maximum: 9007199254740991
						},
						maxQueueSize: {
							type: "integer",
							exclusiveMinimum: 0,
							maximum: 9007199254740991
						},
						maxConcurrency: {
							type: "integer",
							exclusiveMinimum: 0,
							maximum: 9007199254740991
						}
					},
					additionalProperties: false
				},
				accounts: {
					type: "object",
					propertyNames: { type: "string" },
					additionalProperties: {
						type: "object",
						properties: {
							name: { type: "string" },
							capabilities: {
								type: "array",
								items: { type: "string" }
							},
							markdown: {
								type: "object",
								properties: { tables: {
									type: "string",
									enum: [
										"off",
										"bullets",
										"code",
										"block"
									]
								} },
								additionalProperties: false
							},
							enabled: { type: "boolean" },
							commands: {
								type: "object",
								properties: {
									native: { anyOf: [{ type: "boolean" }, {
										type: "string",
										const: "auto"
									}] },
									nativeSkills: { anyOf: [{ type: "boolean" }, {
										type: "string",
										const: "auto"
									}] }
								},
								additionalProperties: false
							},
							configWrites: { type: "boolean" },
							token: { anyOf: [{ type: "string" }, { oneOf: [
								{
									type: "object",
									properties: {
										source: {
											type: "string",
											const: "env"
										},
										provider: {
											type: "string",
											pattern: "^[a-z][a-z0-9_-]{0,63}$"
										},
										id: {
											type: "string",
											pattern: "^[A-Z][A-Z0-9_]{0,127}$"
										}
									},
									required: [
										"source",
										"provider",
										"id"
									],
									additionalProperties: false
								},
								{
									type: "object",
									properties: {
										source: {
											type: "string",
											const: "file"
										},
										provider: {
											type: "string",
											pattern: "^[a-z][a-z0-9_-]{0,63}$"
										},
										id: { type: "string" }
									},
									required: [
										"source",
										"provider",
										"id"
									],
									additionalProperties: false
								},
								{
									type: "object",
									properties: {
										source: {
											type: "string",
											const: "exec"
										},
										provider: {
											type: "string",
											pattern: "^[a-z][a-z0-9_-]{0,63}$"
										},
										id: { type: "string" }
									},
									required: [
										"source",
										"provider",
										"id"
									],
									additionalProperties: false
								}
							] }] },
							proxy: { type: "string" },
							allowBots: { anyOf: [{ type: "boolean" }, {
								type: "string",
								const: "mentions"
							}] },
							dangerouslyAllowNameMatching: { type: "boolean" },
							groupPolicy: {
								default: "allowlist",
								type: "string",
								enum: [
									"open",
									"disabled",
									"allowlist"
								]
							},
							historyLimit: {
								type: "integer",
								minimum: 0,
								maximum: 9007199254740991
							},
							dmHistoryLimit: {
								type: "integer",
								minimum: 0,
								maximum: 9007199254740991
							},
							dms: {
								type: "object",
								propertyNames: { type: "string" },
								additionalProperties: {
									type: "object",
									properties: { historyLimit: {
										type: "integer",
										minimum: 0,
										maximum: 9007199254740991
									} },
									additionalProperties: false
								}
							},
							textChunkLimit: {
								type: "integer",
								exclusiveMinimum: 0,
								maximum: 9007199254740991
							},
							chunkMode: {
								type: "string",
								enum: ["length", "newline"]
							},
							blockStreaming: { type: "boolean" },
							blockStreamingCoalesce: {
								type: "object",
								properties: {
									minChars: {
										type: "integer",
										exclusiveMinimum: 0,
										maximum: 9007199254740991
									},
									maxChars: {
										type: "integer",
										exclusiveMinimum: 0,
										maximum: 9007199254740991
									},
									idleMs: {
										type: "integer",
										minimum: 0,
										maximum: 9007199254740991
									}
								},
								additionalProperties: false
							},
							streaming: { anyOf: [{ type: "boolean" }, {
								type: "string",
								enum: [
									"off",
									"partial",
									"block",
									"progress"
								]
							}] },
							streamMode: {
								type: "string",
								enum: [
									"partial",
									"block",
									"off"
								]
							},
							draftChunk: {
								type: "object",
								properties: {
									minChars: {
										type: "integer",
										exclusiveMinimum: 0,
										maximum: 9007199254740991
									},
									maxChars: {
										type: "integer",
										exclusiveMinimum: 0,
										maximum: 9007199254740991
									},
									breakPreference: { anyOf: [
										{
											type: "string",
											const: "paragraph"
										},
										{
											type: "string",
											const: "newline"
										},
										{
											type: "string",
											const: "sentence"
										}
									] }
								},
								additionalProperties: false
							},
							maxLinesPerMessage: {
								type: "integer",
								exclusiveMinimum: 0,
								maximum: 9007199254740991
							},
							mediaMaxMb: {
								type: "number",
								exclusiveMinimum: 0
							},
							retry: {
								type: "object",
								properties: {
									attempts: {
										type: "integer",
										minimum: 1,
										maximum: 9007199254740991
									},
									minDelayMs: {
										type: "integer",
										minimum: 0,
										maximum: 9007199254740991
									},
									maxDelayMs: {
										type: "integer",
										minimum: 0,
										maximum: 9007199254740991
									},
									jitter: {
										type: "number",
										minimum: 0,
										maximum: 1
									}
								},
								additionalProperties: false
							},
							actions: {
								type: "object",
								properties: {
									reactions: { type: "boolean" },
									stickers: { type: "boolean" },
									emojiUploads: { type: "boolean" },
									stickerUploads: { type: "boolean" },
									polls: { type: "boolean" },
									permissions: { type: "boolean" },
									messages: { type: "boolean" },
									threads: { type: "boolean" },
									pins: { type: "boolean" },
									search: { type: "boolean" },
									memberInfo: { type: "boolean" },
									roleInfo: { type: "boolean" },
									roles: { type: "boolean" },
									channelInfo: { type: "boolean" },
									voiceStatus: { type: "boolean" },
									events: { type: "boolean" },
									moderation: { type: "boolean" },
									channels: { type: "boolean" },
									presence: { type: "boolean" }
								},
								additionalProperties: false
							},
							replyToMode: { anyOf: [
								{
									type: "string",
									const: "off"
								},
								{
									type: "string",
									const: "first"
								},
								{
									type: "string",
									const: "all"
								}
							] },
							dmPolicy: {
								type: "string",
								enum: [
									"pairing",
									"allowlist",
									"open",
									"disabled"
								]
							},
							allowFrom: {
								type: "array",
								items: { type: "string" }
							},
							defaultTo: { type: "string" },
							dm: {
								type: "object",
								properties: {
									enabled: { type: "boolean" },
									policy: {
										type: "string",
										enum: [
											"pairing",
											"allowlist",
											"open",
											"disabled"
										]
									},
									allowFrom: {
										type: "array",
										items: { type: "string" }
									},
									groupEnabled: { type: "boolean" },
									groupChannels: {
										type: "array",
										items: { type: "string" }
									}
								},
								additionalProperties: false
							},
							guilds: {
								type: "object",
								propertyNames: { type: "string" },
								additionalProperties: {
									type: "object",
									properties: {
										slug: { type: "string" },
										requireMention: { type: "boolean" },
										ignoreOtherMentions: { type: "boolean" },
										tools: {
											type: "object",
											properties: {
												allow: {
													type: "array",
													items: { type: "string" }
												},
												alsoAllow: {
													type: "array",
													items: { type: "string" }
												},
												deny: {
													type: "array",
													items: { type: "string" }
												}
											},
											additionalProperties: false
										},
										toolsBySender: {
											type: "object",
											propertyNames: { type: "string" },
											additionalProperties: {
												type: "object",
												properties: {
													allow: {
														type: "array",
														items: { type: "string" }
													},
													alsoAllow: {
														type: "array",
														items: { type: "string" }
													},
													deny: {
														type: "array",
														items: { type: "string" }
													}
												},
												additionalProperties: false
											}
										},
										reactionNotifications: {
											type: "string",
											enum: [
												"off",
												"own",
												"all",
												"allowlist"
											]
										},
										users: {
											type: "array",
											items: { type: "string" }
										},
										roles: {
											type: "array",
											items: { type: "string" }
										},
										channels: {
											type: "object",
											propertyNames: { type: "string" },
											additionalProperties: {
												type: "object",
												properties: {
													allow: { type: "boolean" },
													requireMention: { type: "boolean" },
													ignoreOtherMentions: { type: "boolean" },
													tools: {
														type: "object",
														properties: {
															allow: {
																type: "array",
																items: { type: "string" }
															},
															alsoAllow: {
																type: "array",
																items: { type: "string" }
															},
															deny: {
																type: "array",
																items: { type: "string" }
															}
														},
														additionalProperties: false
													},
													toolsBySender: {
														type: "object",
														propertyNames: { type: "string" },
														additionalProperties: {
															type: "object",
															properties: {
																allow: {
																	type: "array",
																	items: { type: "string" }
																},
																alsoAllow: {
																	type: "array",
																	items: { type: "string" }
																},
																deny: {
																	type: "array",
																	items: { type: "string" }
																}
															},
															additionalProperties: false
														}
													},
													skills: {
														type: "array",
														items: { type: "string" }
													},
													enabled: { type: "boolean" },
													users: {
														type: "array",
														items: { type: "string" }
													},
													roles: {
														type: "array",
														items: { type: "string" }
													},
													systemPrompt: { type: "string" },
													includeThreadStarter: { type: "boolean" },
													autoThread: { type: "boolean" },
													autoThreadName: {
														type: "string",
														enum: ["message", "generated"]
													},
													autoArchiveDuration: { anyOf: [
														{
															type: "string",
															enum: [
																"60",
																"1440",
																"4320",
																"10080"
															]
														},
														{
															type: "number",
															const: 60
														},
														{
															type: "number",
															const: 1440
														},
														{
															type: "number",
															const: 4320
														},
														{
															type: "number",
															const: 10080
														}
													] }
												},
												additionalProperties: false
											}
										}
									},
									additionalProperties: false
								}
							},
							heartbeat: {
								type: "object",
								properties: {
									showOk: { type: "boolean" },
									showAlerts: { type: "boolean" },
									useIndicator: { type: "boolean" }
								},
								additionalProperties: false
							},
							healthMonitor: {
								type: "object",
								properties: { enabled: { type: "boolean" } },
								additionalProperties: false
							},
							execApprovals: {
								type: "object",
								properties: {
									enabled: { type: "boolean" },
									approvers: {
										type: "array",
										items: { type: "string" }
									},
									agentFilter: {
										type: "array",
										items: { type: "string" }
									},
									sessionFilter: {
										type: "array",
										items: { type: "string" }
									},
									cleanupAfterResolve: { type: "boolean" },
									target: {
										type: "string",
										enum: [
											"dm",
											"channel",
											"both"
										]
									}
								},
								additionalProperties: false
							},
							agentComponents: {
								type: "object",
								properties: { enabled: { type: "boolean" } },
								additionalProperties: false
							},
							ui: {
								type: "object",
								properties: { components: {
									type: "object",
									properties: { accentColor: {
										type: "string",
										pattern: "^#?[0-9a-fA-F]{6}$"
									} },
									additionalProperties: false
								} },
								additionalProperties: false
							},
							slashCommand: {
								type: "object",
								properties: { ephemeral: { type: "boolean" } },
								additionalProperties: false
							},
							threadBindings: {
								type: "object",
								properties: {
									enabled: { type: "boolean" },
									idleHours: {
										type: "number",
										minimum: 0
									},
									maxAgeHours: {
										type: "number",
										minimum: 0
									},
									spawnSubagentSessions: { type: "boolean" },
									spawnAcpSessions: { type: "boolean" }
								},
								additionalProperties: false
							},
							intents: {
								type: "object",
								properties: {
									presence: { type: "boolean" },
									guildMembers: { type: "boolean" }
								},
								additionalProperties: false
							},
							voice: {
								type: "object",
								properties: {
									enabled: { type: "boolean" },
									autoJoin: {
										type: "array",
										items: {
											type: "object",
											properties: {
												guildId: {
													type: "string",
													minLength: 1
												},
												channelId: {
													type: "string",
													minLength: 1
												}
											},
											required: ["guildId", "channelId"],
											additionalProperties: false
										}
									},
									daveEncryption: { type: "boolean" },
									decryptionFailureTolerance: {
										type: "integer",
										minimum: 0,
										maximum: 9007199254740991
									},
									tts: {
										type: "object",
										properties: {
											auto: {
												type: "string",
												enum: [
													"off",
													"always",
													"inbound",
													"tagged"
												]
											},
											enabled: { type: "boolean" },
											mode: {
												type: "string",
												enum: ["final", "all"]
											},
											provider: {
												type: "string",
												minLength: 1
											},
											summaryModel: { type: "string" },
											modelOverrides: {
												type: "object",
												properties: {
													enabled: { type: "boolean" },
													allowText: { type: "boolean" },
													allowProvider: { type: "boolean" },
													allowVoice: { type: "boolean" },
													allowModelId: { type: "boolean" },
													allowVoiceSettings: { type: "boolean" },
													allowNormalization: { type: "boolean" },
													allowSeed: { type: "boolean" }
												},
												additionalProperties: false
											},
											providers: {
												type: "object",
												propertyNames: { type: "string" },
												additionalProperties: {
													type: "object",
													properties: { apiKey: { anyOf: [{ type: "string" }, { oneOf: [
														{
															type: "object",
															properties: {
																source: {
																	type: "string",
																	const: "env"
																},
																provider: {
																	type: "string",
																	pattern: "^[a-z][a-z0-9_-]{0,63}$"
																},
																id: {
																	type: "string",
																	pattern: "^[A-Z][A-Z0-9_]{0,127}$"
																}
															},
															required: [
																"source",
																"provider",
																"id"
															],
															additionalProperties: false
														},
														{
															type: "object",
															properties: {
																source: {
																	type: "string",
																	const: "file"
																},
																provider: {
																	type: "string",
																	pattern: "^[a-z][a-z0-9_-]{0,63}$"
																},
																id: { type: "string" }
															},
															required: [
																"source",
																"provider",
																"id"
															],
															additionalProperties: false
														},
														{
															type: "object",
															properties: {
																source: {
																	type: "string",
																	const: "exec"
																},
																provider: {
																	type: "string",
																	pattern: "^[a-z][a-z0-9_-]{0,63}$"
																},
																id: { type: "string" }
															},
															required: [
																"source",
																"provider",
																"id"
															],
															additionalProperties: false
														}
													] }] } },
													additionalProperties: { anyOf: [
														{ type: "string" },
														{ type: "number" },
														{ type: "boolean" },
														{ type: "null" },
														{
															type: "array",
															items: {}
														},
														{
															type: "object",
															propertyNames: { type: "string" },
															additionalProperties: {}
														}
													] }
												}
											},
											prefsPath: { type: "string" },
											maxTextLength: {
												type: "integer",
												minimum: 1,
												maximum: 9007199254740991
											},
											timeoutMs: {
												type: "integer",
												minimum: 1e3,
												maximum: 12e4
											}
										},
										additionalProperties: false
									}
								},
								additionalProperties: false
							},
							pluralkit: {
								type: "object",
								properties: {
									enabled: { type: "boolean" },
									token: { anyOf: [{ type: "string" }, { oneOf: [
										{
											type: "object",
											properties: {
												source: {
													type: "string",
													const: "env"
												},
												provider: {
													type: "string",
													pattern: "^[a-z][a-z0-9_-]{0,63}$"
												},
												id: {
													type: "string",
													pattern: "^[A-Z][A-Z0-9_]{0,127}$"
												}
											},
											required: [
												"source",
												"provider",
												"id"
											],
											additionalProperties: false
										},
										{
											type: "object",
											properties: {
												source: {
													type: "string",
													const: "file"
												},
												provider: {
													type: "string",
													pattern: "^[a-z][a-z0-9_-]{0,63}$"
												},
												id: { type: "string" }
											},
											required: [
												"source",
												"provider",
												"id"
											],
											additionalProperties: false
										},
										{
											type: "object",
											properties: {
												source: {
													type: "string",
													const: "exec"
												},
												provider: {
													type: "string",
													pattern: "^[a-z][a-z0-9_-]{0,63}$"
												},
												id: { type: "string" }
											},
											required: [
												"source",
												"provider",
												"id"
											],
											additionalProperties: false
										}
									] }] }
								},
								additionalProperties: false
							},
							responsePrefix: { type: "string" },
							ackReaction: { type: "string" },
							ackReactionScope: {
								type: "string",
								enum: [
									"group-mentions",
									"group-all",
									"direct",
									"all",
									"off",
									"none"
								]
							},
							activity: { type: "string" },
							status: {
								type: "string",
								enum: [
									"online",
									"dnd",
									"idle",
									"invisible"
								]
							},
							autoPresence: {
								type: "object",
								properties: {
									enabled: { type: "boolean" },
									intervalMs: {
										type: "integer",
										exclusiveMinimum: 0,
										maximum: 9007199254740991
									},
									minUpdateIntervalMs: {
										type: "integer",
										exclusiveMinimum: 0,
										maximum: 9007199254740991
									},
									healthyText: { type: "string" },
									degradedText: { type: "string" },
									exhaustedText: { type: "string" }
								},
								additionalProperties: false
							},
							activityType: { anyOf: [
								{
									type: "number",
									const: 0
								},
								{
									type: "number",
									const: 1
								},
								{
									type: "number",
									const: 2
								},
								{
									type: "number",
									const: 3
								},
								{
									type: "number",
									const: 4
								},
								{
									type: "number",
									const: 5
								}
							] },
							activityUrl: {
								type: "string",
								format: "uri"
							},
							inboundWorker: {
								type: "object",
								properties: { runTimeoutMs: {
									type: "integer",
									minimum: 0,
									maximum: 9007199254740991
								} },
								additionalProperties: false
							},
							eventQueue: {
								type: "object",
								properties: {
									listenerTimeout: {
										type: "integer",
										exclusiveMinimum: 0,
										maximum: 9007199254740991
									},
									maxQueueSize: {
										type: "integer",
										exclusiveMinimum: 0,
										maximum: 9007199254740991
									},
									maxConcurrency: {
										type: "integer",
										exclusiveMinimum: 0,
										maximum: 9007199254740991
									}
								},
								additionalProperties: false
							}
						},
						required: ["groupPolicy"],
						additionalProperties: false
					}
				},
				defaultAccount: { type: "string" }
			},
			required: ["groupPolicy"],
			additionalProperties: false
		},
		uiHints: {
			"": {
				label: "Discord",
				help: "Discord channel provider configuration for bot auth, retry policy, streaming, thread bindings, and optional voice capabilities. Keep privileged intents and advanced features disabled unless needed."
			},
			dmPolicy: {
				label: "Discord DM Policy",
				help: "Direct message access control (\"pairing\" recommended). \"open\" requires channels.discord.allowFrom=[\"*\"]."
			},
			"dm.policy": {
				label: "Discord DM Policy",
				help: "Direct message access control (\"pairing\" recommended). \"open\" requires channels.discord.allowFrom=[\"*\"] (legacy: channels.discord.dm.allowFrom)."
			},
			configWrites: {
				label: "Discord Config Writes",
				help: "Allow Discord to write config in response to channel events/commands (default: true)."
			},
			proxy: {
				label: "Discord Proxy URL",
				help: "Proxy URL for Discord gateway + API requests (app-id lookup and allowlist resolution). Set per account via channels.discord.accounts.<id>.proxy."
			},
			"commands.native": {
				label: "Discord Native Commands",
				help: "Override native commands for Discord (bool or \"auto\")."
			},
			"commands.nativeSkills": {
				label: "Discord Native Skill Commands",
				help: "Override native skill commands for Discord (bool or \"auto\")."
			},
			streaming: {
				label: "Discord Streaming Mode",
				help: "Unified Discord stream preview mode: \"off\" | \"partial\" | \"block\" | \"progress\". \"progress\" maps to \"partial\" on Discord. Legacy boolean/streamMode keys are auto-mapped."
			},
			streamMode: {
				label: "Discord Stream Mode (Legacy)",
				help: "Legacy Discord preview mode alias (off | partial | block); auto-migrated to channels.discord.streaming."
			},
			"draftChunk.minChars": {
				label: "Discord Draft Chunk Min Chars",
				help: "Minimum chars before emitting a Discord stream preview update when channels.discord.streaming=\"block\" (default: 200)."
			},
			"draftChunk.maxChars": {
				label: "Discord Draft Chunk Max Chars",
				help: "Target max size for a Discord stream preview chunk when channels.discord.streaming=\"block\" (default: 800; clamped to channels.discord.textChunkLimit)."
			},
			"draftChunk.breakPreference": {
				label: "Discord Draft Chunk Break Preference",
				help: "Preferred breakpoints for Discord draft chunks (paragraph | newline | sentence). Default: paragraph."
			},
			"retry.attempts": {
				label: "Discord Retry Attempts",
				help: "Max retry attempts for outbound Discord API calls (default: 3)."
			},
			"retry.minDelayMs": {
				label: "Discord Retry Min Delay (ms)",
				help: "Minimum retry delay in ms for Discord outbound calls."
			},
			"retry.maxDelayMs": {
				label: "Discord Retry Max Delay (ms)",
				help: "Maximum retry delay cap in ms for Discord outbound calls."
			},
			"retry.jitter": {
				label: "Discord Retry Jitter",
				help: "Jitter factor (0-1) applied to Discord retry delays."
			},
			maxLinesPerMessage: {
				label: "Discord Max Lines Per Message",
				help: "Soft max line count per Discord message (default: 17)."
			},
			"inboundWorker.runTimeoutMs": {
				label: "Discord Inbound Worker Timeout (ms)",
				help: "Optional queued Discord inbound worker timeout in ms. This is separate from Carbon listener timeouts; defaults to 1800000 and can be disabled with 0. Set per account via channels.discord.accounts.<id>.inboundWorker.runTimeoutMs."
			},
			"eventQueue.listenerTimeout": {
				label: "Discord EventQueue Listener Timeout (ms)",
				help: "Canonical Discord listener timeout control in ms for gateway normalization/enqueue handlers. Default is 120000 in OpenClaw; set per account via channels.discord.accounts.<id>.eventQueue.listenerTimeout."
			},
			"eventQueue.maxQueueSize": {
				label: "Discord EventQueue Max Queue Size",
				help: "Optional Discord EventQueue capacity override (max queued events before backpressure). Set per account via channels.discord.accounts.<id>.eventQueue.maxQueueSize."
			},
			"eventQueue.maxConcurrency": {
				label: "Discord EventQueue Max Concurrency",
				help: "Optional Discord EventQueue concurrency override (max concurrent handler executions). Set per account via channels.discord.accounts.<id>.eventQueue.maxConcurrency."
			},
			"threadBindings.enabled": {
				label: "Discord Thread Binding Enabled",
				help: "Enable Discord thread binding features (/focus, bound-thread routing/delivery, and thread-bound subagent sessions). Overrides session.threadBindings.enabled when set."
			},
			"threadBindings.idleHours": {
				label: "Discord Thread Binding Idle Timeout (hours)",
				help: "Inactivity window in hours for Discord thread-bound sessions (/focus and spawned thread sessions). Set 0 to disable idle auto-unfocus (default: 24). Overrides session.threadBindings.idleHours when set."
			},
			"threadBindings.maxAgeHours": {
				label: "Discord Thread Binding Max Age (hours)",
				help: "Optional hard max age in hours for Discord thread-bound sessions. Set 0 to disable hard cap (default: 0). Overrides session.threadBindings.maxAgeHours when set."
			},
			"threadBindings.spawnSubagentSessions": {
				label: "Discord Thread-Bound Subagent Spawn",
				help: "Allow subagent spawns with thread=true to auto-create and bind Discord threads (default: false; opt-in). Set true to enable thread-bound subagent spawns for this account/channel."
			},
			"threadBindings.spawnAcpSessions": {
				label: "Discord Thread-Bound ACP Spawn",
				help: "Allow /acp spawn to auto-create and bind Discord threads for ACP sessions (default: false; opt-in). Set true to enable thread-bound ACP spawns for this account/channel."
			},
			"ui.components.accentColor": {
				label: "Discord Component Accent Color",
				help: "Accent color for Discord component containers (hex). Set per account via channels.discord.accounts.<id>.ui.components.accentColor."
			},
			"intents.presence": {
				label: "Discord Presence Intent",
				help: "Enable the Guild Presences privileged intent. Must also be enabled in the Discord Developer Portal. Allows tracking user activities (e.g. Spotify). Default: false."
			},
			"intents.guildMembers": {
				label: "Discord Guild Members Intent",
				help: "Enable the Guild Members privileged intent. Must also be enabled in the Discord Developer Portal. Default: false."
			},
			"voice.enabled": {
				label: "Discord Voice Enabled",
				help: "Enable Discord voice channel conversations (default: true). Omit channels.discord.voice to keep voice support disabled for the account."
			},
			"voice.autoJoin": {
				label: "Discord Voice Auto-Join",
				help: "Voice channels to auto-join on startup (list of guildId/channelId entries)."
			},
			"voice.daveEncryption": {
				label: "Discord Voice DAVE Encryption",
				help: "Toggle DAVE end-to-end encryption for Discord voice joins (default: true in @discordjs/voice; Discord may require this)."
			},
			"voice.decryptionFailureTolerance": {
				label: "Discord Voice Decrypt Failure Tolerance",
				help: "Consecutive decrypt failures before DAVE attempts session recovery (passed to @discordjs/voice; default: 24)."
			},
			"voice.tts": {
				label: "Discord Voice Text-to-Speech",
				help: "Optional TTS overrides for Discord voice playback (merged with messages.tts)."
			},
			"pluralkit.enabled": {
				label: "Discord PluralKit Enabled",
				help: "Resolve PluralKit proxied messages and treat system members as distinct senders."
			},
			"pluralkit.token": {
				label: "Discord PluralKit Token",
				help: "Optional PluralKit token for resolving private systems or members."
			},
			activity: {
				label: "Discord Presence Activity",
				help: "Discord presence activity text (defaults to custom status)."
			},
			status: {
				label: "Discord Presence Status",
				help: "Discord presence status (online, dnd, idle, invisible)."
			},
			"autoPresence.enabled": {
				label: "Discord Auto Presence Enabled",
				help: "Enable automatic Discord bot presence updates based on runtime/model availability signals. When enabled: healthy=>online, degraded/unknown=>idle, exhausted/unavailable=>dnd."
			},
			"autoPresence.intervalMs": {
				label: "Discord Auto Presence Check Interval (ms)",
				help: "How often to evaluate Discord auto-presence state in milliseconds (default: 30000)."
			},
			"autoPresence.minUpdateIntervalMs": {
				label: "Discord Auto Presence Min Update Interval (ms)",
				help: "Minimum time between actual Discord presence update calls in milliseconds (default: 15000). Prevents status spam on noisy state changes."
			},
			"autoPresence.healthyText": {
				label: "Discord Auto Presence Healthy Text",
				help: "Optional custom status text while runtime is healthy (online). If omitted, falls back to static channels.discord.activity when set."
			},
			"autoPresence.degradedText": {
				label: "Discord Auto Presence Degraded Text",
				help: "Optional custom status text while runtime/model availability is degraded or unknown (idle)."
			},
			"autoPresence.exhaustedText": {
				label: "Discord Auto Presence Exhausted Text",
				help: "Optional custom status text while runtime detects exhausted/unavailable model quota (dnd). Supports {reason} template placeholder."
			},
			activityType: {
				label: "Discord Presence Activity Type",
				help: "Discord presence activity type (0=Playing,1=Streaming,2=Listening,3=Watching,4=Custom,5=Competing)."
			},
			activityUrl: {
				label: "Discord Presence Activity URL",
				help: "Discord presence streaming URL (required for activityType=1)."
			},
			allowBots: {
				label: "Discord Allow Bot Messages",
				help: "Allow bot-authored messages to trigger Discord replies (default: false). Set \"mentions\" to only accept bot messages that mention the bot."
			},
			token: {
				label: "Discord Bot Token",
				help: "Discord bot token used for gateway and REST API authentication for this provider account. Keep this secret out of committed config and rotate immediately after any leak.",
				sensitive: true
			}
		}
	},
	{
		pluginId: "feishu",
		channelId: "feishu",
		label: "Feishu",
		description: "飞书/Lark enterprise messaging with doc/wiki/drive tools.",
		schema: {
			$schema: "http://json-schema.org/draft-07/schema#",
			type: "object",
			properties: {
				enabled: { type: "boolean" },
				defaultAccount: { type: "string" },
				appId: { type: "string" },
				appSecret: { anyOf: [{ type: "string" }, { oneOf: [
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "env"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: {
								type: "string",
								pattern: "^[A-Z][A-Z0-9_]{0,127}$"
							}
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					},
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "file"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: { type: "string" }
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					},
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "exec"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: { type: "string" }
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					}
				] }] },
				encryptKey: { anyOf: [{ type: "string" }, { oneOf: [
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "env"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: {
								type: "string",
								pattern: "^[A-Z][A-Z0-9_]{0,127}$"
							}
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					},
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "file"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: { type: "string" }
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					},
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "exec"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: { type: "string" }
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					}
				] }] },
				verificationToken: { anyOf: [{ type: "string" }, { oneOf: [
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "env"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: {
								type: "string",
								pattern: "^[A-Z][A-Z0-9_]{0,127}$"
							}
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					},
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "file"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: { type: "string" }
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					},
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "exec"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: { type: "string" }
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					}
				] }] },
				domain: {
					default: "feishu",
					anyOf: [{
						type: "string",
						enum: ["feishu", "lark"]
					}, {
						type: "string",
						format: "uri",
						pattern: "^https:\\/\\/.*"
					}]
				},
				connectionMode: {
					default: "websocket",
					type: "string",
					enum: ["websocket", "webhook"]
				},
				webhookPath: {
					default: "/feishu/events",
					type: "string"
				},
				webhookHost: { type: "string" },
				webhookPort: {
					type: "integer",
					exclusiveMinimum: 0,
					maximum: 9007199254740991
				},
				capabilities: {
					type: "array",
					items: { type: "string" }
				},
				markdown: {
					type: "object",
					properties: {
						mode: {
							type: "string",
							enum: [
								"native",
								"escape",
								"strip"
							]
						},
						tableMode: {
							type: "string",
							enum: [
								"native",
								"ascii",
								"simple"
							]
						}
					},
					additionalProperties: false
				},
				configWrites: { type: "boolean" },
				dmPolicy: {
					default: "pairing",
					type: "string",
					enum: [
						"open",
						"pairing",
						"allowlist"
					]
				},
				allowFrom: {
					type: "array",
					items: { anyOf: [{ type: "string" }, { type: "number" }] }
				},
				groupPolicy: {
					default: "allowlist",
					anyOf: [{
						type: "string",
						enum: [
							"open",
							"allowlist",
							"disabled"
						]
					}, {}]
				},
				groupAllowFrom: {
					type: "array",
					items: { anyOf: [{ type: "string" }, { type: "number" }] }
				},
				groupSenderAllowFrom: {
					type: "array",
					items: { anyOf: [{ type: "string" }, { type: "number" }] }
				},
				requireMention: { type: "boolean" },
				groups: {
					type: "object",
					propertyNames: { type: "string" },
					additionalProperties: {
						type: "object",
						properties: {
							requireMention: { type: "boolean" },
							tools: {
								type: "object",
								properties: {
									allow: {
										type: "array",
										items: { type: "string" }
									},
									deny: {
										type: "array",
										items: { type: "string" }
									}
								},
								additionalProperties: false
							},
							skills: {
								type: "array",
								items: { type: "string" }
							},
							enabled: { type: "boolean" },
							allowFrom: {
								type: "array",
								items: { anyOf: [{ type: "string" }, { type: "number" }] }
							},
							systemPrompt: { type: "string" },
							groupSessionScope: {
								type: "string",
								enum: [
									"group",
									"group_sender",
									"group_topic",
									"group_topic_sender"
								]
							},
							topicSessionMode: {
								type: "string",
								enum: ["disabled", "enabled"]
							},
							replyInThread: {
								type: "string",
								enum: ["disabled", "enabled"]
							}
						},
						additionalProperties: false
					}
				},
				historyLimit: {
					type: "integer",
					minimum: 0,
					maximum: 9007199254740991
				},
				dmHistoryLimit: {
					type: "integer",
					minimum: 0,
					maximum: 9007199254740991
				},
				dms: {
					type: "object",
					propertyNames: { type: "string" },
					additionalProperties: {
						type: "object",
						properties: {
							enabled: { type: "boolean" },
							systemPrompt: { type: "string" }
						},
						additionalProperties: false
					}
				},
				textChunkLimit: {
					type: "integer",
					exclusiveMinimum: 0,
					maximum: 9007199254740991
				},
				chunkMode: {
					type: "string",
					enum: ["length", "newline"]
				},
				blockStreamingCoalesce: {
					type: "object",
					properties: {
						enabled: { type: "boolean" },
						minDelayMs: {
							type: "integer",
							exclusiveMinimum: 0,
							maximum: 9007199254740991
						},
						maxDelayMs: {
							type: "integer",
							exclusiveMinimum: 0,
							maximum: 9007199254740991
						}
					},
					additionalProperties: false
				},
				mediaMaxMb: {
					type: "number",
					exclusiveMinimum: 0
				},
				httpTimeoutMs: {
					type: "integer",
					exclusiveMinimum: 0,
					maximum: 3e5
				},
				heartbeat: {
					type: "object",
					properties: {
						visibility: {
							type: "string",
							enum: ["visible", "hidden"]
						},
						intervalMs: {
							type: "integer",
							exclusiveMinimum: 0,
							maximum: 9007199254740991
						}
					},
					additionalProperties: false
				},
				renderMode: {
					type: "string",
					enum: [
						"auto",
						"raw",
						"card"
					]
				},
				streaming: { type: "boolean" },
				tools: {
					type: "object",
					properties: {
						doc: { type: "boolean" },
						chat: { type: "boolean" },
						wiki: { type: "boolean" },
						drive: { type: "boolean" },
						perm: { type: "boolean" },
						scopes: { type: "boolean" }
					},
					additionalProperties: false
				},
				actions: {
					type: "object",
					properties: { reactions: { type: "boolean" } },
					additionalProperties: false
				},
				replyInThread: {
					type: "string",
					enum: ["disabled", "enabled"]
				},
				reactionNotifications: {
					default: "own",
					type: "string",
					enum: [
						"off",
						"own",
						"all"
					]
				},
				typingIndicator: {
					default: true,
					type: "boolean"
				},
				resolveSenderNames: {
					default: true,
					type: "boolean"
				},
				groupSessionScope: {
					type: "string",
					enum: [
						"group",
						"group_sender",
						"group_topic",
						"group_topic_sender"
					]
				},
				topicSessionMode: {
					type: "string",
					enum: ["disabled", "enabled"]
				},
				dynamicAgentCreation: {
					type: "object",
					properties: {
						enabled: { type: "boolean" },
						workspaceTemplate: { type: "string" },
						agentDirTemplate: { type: "string" },
						maxAgents: {
							type: "integer",
							exclusiveMinimum: 0,
							maximum: 9007199254740991
						}
					},
					additionalProperties: false
				},
				accounts: {
					type: "object",
					propertyNames: { type: "string" },
					additionalProperties: {
						type: "object",
						properties: {
							enabled: { type: "boolean" },
							name: { type: "string" },
							appId: { type: "string" },
							appSecret: { anyOf: [{ type: "string" }, { oneOf: [
								{
									type: "object",
									properties: {
										source: {
											type: "string",
											const: "env"
										},
										provider: {
											type: "string",
											pattern: "^[a-z][a-z0-9_-]{0,63}$"
										},
										id: {
											type: "string",
											pattern: "^[A-Z][A-Z0-9_]{0,127}$"
										}
									},
									required: [
										"source",
										"provider",
										"id"
									],
									additionalProperties: false
								},
								{
									type: "object",
									properties: {
										source: {
											type: "string",
											const: "file"
										},
										provider: {
											type: "string",
											pattern: "^[a-z][a-z0-9_-]{0,63}$"
										},
										id: { type: "string" }
									},
									required: [
										"source",
										"provider",
										"id"
									],
									additionalProperties: false
								},
								{
									type: "object",
									properties: {
										source: {
											type: "string",
											const: "exec"
										},
										provider: {
											type: "string",
											pattern: "^[a-z][a-z0-9_-]{0,63}$"
										},
										id: { type: "string" }
									},
									required: [
										"source",
										"provider",
										"id"
									],
									additionalProperties: false
								}
							] }] },
							encryptKey: { anyOf: [{ type: "string" }, { oneOf: [
								{
									type: "object",
									properties: {
										source: {
											type: "string",
											const: "env"
										},
										provider: {
											type: "string",
											pattern: "^[a-z][a-z0-9_-]{0,63}$"
										},
										id: {
											type: "string",
											pattern: "^[A-Z][A-Z0-9_]{0,127}$"
										}
									},
									required: [
										"source",
										"provider",
										"id"
									],
									additionalProperties: false
								},
								{
									type: "object",
									properties: {
										source: {
											type: "string",
											const: "file"
										},
										provider: {
											type: "string",
											pattern: "^[a-z][a-z0-9_-]{0,63}$"
										},
										id: { type: "string" }
									},
									required: [
										"source",
										"provider",
										"id"
									],
									additionalProperties: false
								},
								{
									type: "object",
									properties: {
										source: {
											type: "string",
											const: "exec"
										},
										provider: {
											type: "string",
											pattern: "^[a-z][a-z0-9_-]{0,63}$"
										},
										id: { type: "string" }
									},
									required: [
										"source",
										"provider",
										"id"
									],
									additionalProperties: false
								}
							] }] },
							verificationToken: { anyOf: [{ type: "string" }, { oneOf: [
								{
									type: "object",
									properties: {
										source: {
											type: "string",
											const: "env"
										},
										provider: {
											type: "string",
											pattern: "^[a-z][a-z0-9_-]{0,63}$"
										},
										id: {
											type: "string",
											pattern: "^[A-Z][A-Z0-9_]{0,127}$"
										}
									},
									required: [
										"source",
										"provider",
										"id"
									],
									additionalProperties: false
								},
								{
									type: "object",
									properties: {
										source: {
											type: "string",
											const: "file"
										},
										provider: {
											type: "string",
											pattern: "^[a-z][a-z0-9_-]{0,63}$"
										},
										id: { type: "string" }
									},
									required: [
										"source",
										"provider",
										"id"
									],
									additionalProperties: false
								},
								{
									type: "object",
									properties: {
										source: {
											type: "string",
											const: "exec"
										},
										provider: {
											type: "string",
											pattern: "^[a-z][a-z0-9_-]{0,63}$"
										},
										id: { type: "string" }
									},
									required: [
										"source",
										"provider",
										"id"
									],
									additionalProperties: false
								}
							] }] },
							domain: { anyOf: [{
								type: "string",
								enum: ["feishu", "lark"]
							}, {
								type: "string",
								format: "uri",
								pattern: "^https:\\/\\/.*"
							}] },
							connectionMode: {
								type: "string",
								enum: ["websocket", "webhook"]
							},
							webhookPath: { type: "string" },
							webhookHost: { type: "string" },
							webhookPort: {
								type: "integer",
								exclusiveMinimum: 0,
								maximum: 9007199254740991
							},
							capabilities: {
								type: "array",
								items: { type: "string" }
							},
							markdown: {
								type: "object",
								properties: {
									mode: {
										type: "string",
										enum: [
											"native",
											"escape",
											"strip"
										]
									},
									tableMode: {
										type: "string",
										enum: [
											"native",
											"ascii",
											"simple"
										]
									}
								},
								additionalProperties: false
							},
							configWrites: { type: "boolean" },
							dmPolicy: {
								type: "string",
								enum: [
									"open",
									"pairing",
									"allowlist"
								]
							},
							allowFrom: {
								type: "array",
								items: { anyOf: [{ type: "string" }, { type: "number" }] }
							},
							groupPolicy: { anyOf: [{
								type: "string",
								enum: [
									"open",
									"allowlist",
									"disabled"
								]
							}, {}] },
							groupAllowFrom: {
								type: "array",
								items: { anyOf: [{ type: "string" }, { type: "number" }] }
							},
							groupSenderAllowFrom: {
								type: "array",
								items: { anyOf: [{ type: "string" }, { type: "number" }] }
							},
							requireMention: { type: "boolean" },
							groups: {
								type: "object",
								propertyNames: { type: "string" },
								additionalProperties: {
									type: "object",
									properties: {
										requireMention: { type: "boolean" },
										tools: {
											type: "object",
											properties: {
												allow: {
													type: "array",
													items: { type: "string" }
												},
												deny: {
													type: "array",
													items: { type: "string" }
												}
											},
											additionalProperties: false
										},
										skills: {
											type: "array",
											items: { type: "string" }
										},
										enabled: { type: "boolean" },
										allowFrom: {
											type: "array",
											items: { anyOf: [{ type: "string" }, { type: "number" }] }
										},
										systemPrompt: { type: "string" },
										groupSessionScope: {
											type: "string",
											enum: [
												"group",
												"group_sender",
												"group_topic",
												"group_topic_sender"
											]
										},
										topicSessionMode: {
											type: "string",
											enum: ["disabled", "enabled"]
										},
										replyInThread: {
											type: "string",
											enum: ["disabled", "enabled"]
										}
									},
									additionalProperties: false
								}
							},
							historyLimit: {
								type: "integer",
								minimum: 0,
								maximum: 9007199254740991
							},
							dmHistoryLimit: {
								type: "integer",
								minimum: 0,
								maximum: 9007199254740991
							},
							dms: {
								type: "object",
								propertyNames: { type: "string" },
								additionalProperties: {
									type: "object",
									properties: {
										enabled: { type: "boolean" },
										systemPrompt: { type: "string" }
									},
									additionalProperties: false
								}
							},
							textChunkLimit: {
								type: "integer",
								exclusiveMinimum: 0,
								maximum: 9007199254740991
							},
							chunkMode: {
								type: "string",
								enum: ["length", "newline"]
							},
							blockStreamingCoalesce: {
								type: "object",
								properties: {
									enabled: { type: "boolean" },
									minDelayMs: {
										type: "integer",
										exclusiveMinimum: 0,
										maximum: 9007199254740991
									},
									maxDelayMs: {
										type: "integer",
										exclusiveMinimum: 0,
										maximum: 9007199254740991
									}
								},
								additionalProperties: false
							},
							mediaMaxMb: {
								type: "number",
								exclusiveMinimum: 0
							},
							httpTimeoutMs: {
								type: "integer",
								exclusiveMinimum: 0,
								maximum: 3e5
							},
							heartbeat: {
								type: "object",
								properties: {
									visibility: {
										type: "string",
										enum: ["visible", "hidden"]
									},
									intervalMs: {
										type: "integer",
										exclusiveMinimum: 0,
										maximum: 9007199254740991
									}
								},
								additionalProperties: false
							},
							renderMode: {
								type: "string",
								enum: [
									"auto",
									"raw",
									"card"
								]
							},
							streaming: { type: "boolean" },
							tools: {
								type: "object",
								properties: {
									doc: { type: "boolean" },
									chat: { type: "boolean" },
									wiki: { type: "boolean" },
									drive: { type: "boolean" },
									perm: { type: "boolean" },
									scopes: { type: "boolean" }
								},
								additionalProperties: false
							},
							actions: {
								type: "object",
								properties: { reactions: { type: "boolean" } },
								additionalProperties: false
							},
							replyInThread: {
								type: "string",
								enum: ["disabled", "enabled"]
							},
							reactionNotifications: {
								type: "string",
								enum: [
									"off",
									"own",
									"all"
								]
							},
							typingIndicator: { type: "boolean" },
							resolveSenderNames: { type: "boolean" },
							groupSessionScope: {
								type: "string",
								enum: [
									"group",
									"group_sender",
									"group_topic",
									"group_topic_sender"
								]
							},
							topicSessionMode: {
								type: "string",
								enum: ["disabled", "enabled"]
							}
						},
						additionalProperties: false
					}
				}
			},
			required: [
				"domain",
				"connectionMode",
				"webhookPath",
				"dmPolicy",
				"groupPolicy",
				"reactionNotifications",
				"typingIndicator",
				"resolveSenderNames"
			],
			additionalProperties: false
		}
	},
	{
		pluginId: "googlechat",
		channelId: "googlechat",
		label: "Google Chat",
		description: "Google Workspace Chat app with HTTP webhook.",
		schema: {
			$schema: "http://json-schema.org/draft-07/schema#",
			type: "object",
			properties: {
				name: { type: "string" },
				capabilities: {
					type: "array",
					items: { type: "string" }
				},
				enabled: { type: "boolean" },
				configWrites: { type: "boolean" },
				allowBots: { type: "boolean" },
				dangerouslyAllowNameMatching: { type: "boolean" },
				requireMention: { type: "boolean" },
				groupPolicy: {
					default: "allowlist",
					type: "string",
					enum: [
						"open",
						"disabled",
						"allowlist"
					]
				},
				groupAllowFrom: {
					type: "array",
					items: { anyOf: [{ type: "string" }, { type: "number" }] }
				},
				groups: {
					type: "object",
					propertyNames: { type: "string" },
					additionalProperties: {
						type: "object",
						properties: {
							enabled: { type: "boolean" },
							allow: { type: "boolean" },
							requireMention: { type: "boolean" },
							users: {
								type: "array",
								items: { anyOf: [{ type: "string" }, { type: "number" }] }
							},
							systemPrompt: { type: "string" }
						},
						additionalProperties: false
					}
				},
				defaultTo: { type: "string" },
				serviceAccount: { anyOf: [
					{ type: "string" },
					{
						type: "object",
						propertyNames: { type: "string" },
						additionalProperties: {}
					},
					{ oneOf: [
						{
							type: "object",
							properties: {
								source: {
									type: "string",
									const: "env"
								},
								provider: {
									type: "string",
									pattern: "^[a-z][a-z0-9_-]{0,63}$"
								},
								id: {
									type: "string",
									pattern: "^[A-Z][A-Z0-9_]{0,127}$"
								}
							},
							required: [
								"source",
								"provider",
								"id"
							],
							additionalProperties: false
						},
						{
							type: "object",
							properties: {
								source: {
									type: "string",
									const: "file"
								},
								provider: {
									type: "string",
									pattern: "^[a-z][a-z0-9_-]{0,63}$"
								},
								id: { type: "string" }
							},
							required: [
								"source",
								"provider",
								"id"
							],
							additionalProperties: false
						},
						{
							type: "object",
							properties: {
								source: {
									type: "string",
									const: "exec"
								},
								provider: {
									type: "string",
									pattern: "^[a-z][a-z0-9_-]{0,63}$"
								},
								id: { type: "string" }
							},
							required: [
								"source",
								"provider",
								"id"
							],
							additionalProperties: false
						}
					] }
				] },
				serviceAccountRef: { oneOf: [
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "env"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: {
								type: "string",
								pattern: "^[A-Z][A-Z0-9_]{0,127}$"
							}
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					},
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "file"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: { type: "string" }
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					},
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "exec"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: { type: "string" }
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					}
				] },
				serviceAccountFile: { type: "string" },
				audienceType: {
					type: "string",
					enum: ["app-url", "project-number"]
				},
				audience: { type: "string" },
				appPrincipal: { type: "string" },
				webhookPath: { type: "string" },
				webhookUrl: { type: "string" },
				botUser: { type: "string" },
				historyLimit: {
					type: "integer",
					minimum: 0,
					maximum: 9007199254740991
				},
				dmHistoryLimit: {
					type: "integer",
					minimum: 0,
					maximum: 9007199254740991
				},
				dms: {
					type: "object",
					propertyNames: { type: "string" },
					additionalProperties: {
						type: "object",
						properties: { historyLimit: {
							type: "integer",
							minimum: 0,
							maximum: 9007199254740991
						} },
						additionalProperties: false
					}
				},
				textChunkLimit: {
					type: "integer",
					exclusiveMinimum: 0,
					maximum: 9007199254740991
				},
				chunkMode: {
					type: "string",
					enum: ["length", "newline"]
				},
				blockStreaming: { type: "boolean" },
				blockStreamingCoalesce: {
					type: "object",
					properties: {
						minChars: {
							type: "integer",
							exclusiveMinimum: 0,
							maximum: 9007199254740991
						},
						maxChars: {
							type: "integer",
							exclusiveMinimum: 0,
							maximum: 9007199254740991
						},
						idleMs: {
							type: "integer",
							minimum: 0,
							maximum: 9007199254740991
						}
					},
					additionalProperties: false
				},
				streamMode: {
					default: "replace",
					type: "string",
					enum: [
						"replace",
						"status_final",
						"append"
					]
				},
				mediaMaxMb: {
					type: "number",
					exclusiveMinimum: 0
				},
				replyToMode: { anyOf: [
					{
						type: "string",
						const: "off"
					},
					{
						type: "string",
						const: "first"
					},
					{
						type: "string",
						const: "all"
					}
				] },
				actions: {
					type: "object",
					properties: { reactions: { type: "boolean" } },
					additionalProperties: false
				},
				dm: {
					type: "object",
					properties: {
						enabled: { type: "boolean" },
						policy: {
							default: "pairing",
							type: "string",
							enum: [
								"pairing",
								"allowlist",
								"open",
								"disabled"
							]
						},
						allowFrom: {
							type: "array",
							items: { anyOf: [{ type: "string" }, { type: "number" }] }
						}
					},
					required: ["policy"],
					additionalProperties: false
				},
				healthMonitor: {
					type: "object",
					properties: { enabled: { type: "boolean" } },
					additionalProperties: false
				},
				typingIndicator: {
					type: "string",
					enum: [
						"none",
						"message",
						"reaction"
					]
				},
				responsePrefix: { type: "string" },
				accounts: {
					type: "object",
					propertyNames: { type: "string" },
					additionalProperties: {
						type: "object",
						properties: {
							name: { type: "string" },
							capabilities: {
								type: "array",
								items: { type: "string" }
							},
							enabled: { type: "boolean" },
							configWrites: { type: "boolean" },
							allowBots: { type: "boolean" },
							dangerouslyAllowNameMatching: { type: "boolean" },
							requireMention: { type: "boolean" },
							groupPolicy: {
								default: "allowlist",
								type: "string",
								enum: [
									"open",
									"disabled",
									"allowlist"
								]
							},
							groupAllowFrom: {
								type: "array",
								items: { anyOf: [{ type: "string" }, { type: "number" }] }
							},
							groups: {
								type: "object",
								propertyNames: { type: "string" },
								additionalProperties: {
									type: "object",
									properties: {
										enabled: { type: "boolean" },
										allow: { type: "boolean" },
										requireMention: { type: "boolean" },
										users: {
											type: "array",
											items: { anyOf: [{ type: "string" }, { type: "number" }] }
										},
										systemPrompt: { type: "string" }
									},
									additionalProperties: false
								}
							},
							defaultTo: { type: "string" },
							serviceAccount: { anyOf: [
								{ type: "string" },
								{
									type: "object",
									propertyNames: { type: "string" },
									additionalProperties: {}
								},
								{ oneOf: [
									{
										type: "object",
										properties: {
											source: {
												type: "string",
												const: "env"
											},
											provider: {
												type: "string",
												pattern: "^[a-z][a-z0-9_-]{0,63}$"
											},
											id: {
												type: "string",
												pattern: "^[A-Z][A-Z0-9_]{0,127}$"
											}
										},
										required: [
											"source",
											"provider",
											"id"
										],
										additionalProperties: false
									},
									{
										type: "object",
										properties: {
											source: {
												type: "string",
												const: "file"
											},
											provider: {
												type: "string",
												pattern: "^[a-z][a-z0-9_-]{0,63}$"
											},
											id: { type: "string" }
										},
										required: [
											"source",
											"provider",
											"id"
										],
										additionalProperties: false
									},
									{
										type: "object",
										properties: {
											source: {
												type: "string",
												const: "exec"
											},
											provider: {
												type: "string",
												pattern: "^[a-z][a-z0-9_-]{0,63}$"
											},
											id: { type: "string" }
										},
										required: [
											"source",
											"provider",
											"id"
										],
										additionalProperties: false
									}
								] }
							] },
							serviceAccountRef: { oneOf: [
								{
									type: "object",
									properties: {
										source: {
											type: "string",
											const: "env"
										},
										provider: {
											type: "string",
											pattern: "^[a-z][a-z0-9_-]{0,63}$"
										},
										id: {
											type: "string",
											pattern: "^[A-Z][A-Z0-9_]{0,127}$"
										}
									},
									required: [
										"source",
										"provider",
										"id"
									],
									additionalProperties: false
								},
								{
									type: "object",
									properties: {
										source: {
											type: "string",
											const: "file"
										},
										provider: {
											type: "string",
											pattern: "^[a-z][a-z0-9_-]{0,63}$"
										},
										id: { type: "string" }
									},
									required: [
										"source",
										"provider",
										"id"
									],
									additionalProperties: false
								},
								{
									type: "object",
									properties: {
										source: {
											type: "string",
											const: "exec"
										},
										provider: {
											type: "string",
											pattern: "^[a-z][a-z0-9_-]{0,63}$"
										},
										id: { type: "string" }
									},
									required: [
										"source",
										"provider",
										"id"
									],
									additionalProperties: false
								}
							] },
							serviceAccountFile: { type: "string" },
							audienceType: {
								type: "string",
								enum: ["app-url", "project-number"]
							},
							audience: { type: "string" },
							appPrincipal: { type: "string" },
							webhookPath: { type: "string" },
							webhookUrl: { type: "string" },
							botUser: { type: "string" },
							historyLimit: {
								type: "integer",
								minimum: 0,
								maximum: 9007199254740991
							},
							dmHistoryLimit: {
								type: "integer",
								minimum: 0,
								maximum: 9007199254740991
							},
							dms: {
								type: "object",
								propertyNames: { type: "string" },
								additionalProperties: {
									type: "object",
									properties: { historyLimit: {
										type: "integer",
										minimum: 0,
										maximum: 9007199254740991
									} },
									additionalProperties: false
								}
							},
							textChunkLimit: {
								type: "integer",
								exclusiveMinimum: 0,
								maximum: 9007199254740991
							},
							chunkMode: {
								type: "string",
								enum: ["length", "newline"]
							},
							blockStreaming: { type: "boolean" },
							blockStreamingCoalesce: {
								type: "object",
								properties: {
									minChars: {
										type: "integer",
										exclusiveMinimum: 0,
										maximum: 9007199254740991
									},
									maxChars: {
										type: "integer",
										exclusiveMinimum: 0,
										maximum: 9007199254740991
									},
									idleMs: {
										type: "integer",
										minimum: 0,
										maximum: 9007199254740991
									}
								},
								additionalProperties: false
							},
							streamMode: {
								default: "replace",
								type: "string",
								enum: [
									"replace",
									"status_final",
									"append"
								]
							},
							mediaMaxMb: {
								type: "number",
								exclusiveMinimum: 0
							},
							replyToMode: { anyOf: [
								{
									type: "string",
									const: "off"
								},
								{
									type: "string",
									const: "first"
								},
								{
									type: "string",
									const: "all"
								}
							] },
							actions: {
								type: "object",
								properties: { reactions: { type: "boolean" } },
								additionalProperties: false
							},
							dm: {
								type: "object",
								properties: {
									enabled: { type: "boolean" },
									policy: {
										default: "pairing",
										type: "string",
										enum: [
											"pairing",
											"allowlist",
											"open",
											"disabled"
										]
									},
									allowFrom: {
										type: "array",
										items: { anyOf: [{ type: "string" }, { type: "number" }] }
									}
								},
								required: ["policy"],
								additionalProperties: false
							},
							healthMonitor: {
								type: "object",
								properties: { enabled: { type: "boolean" } },
								additionalProperties: false
							},
							typingIndicator: {
								type: "string",
								enum: [
									"none",
									"message",
									"reaction"
								]
							},
							responsePrefix: { type: "string" }
						},
						required: ["groupPolicy", "streamMode"],
						additionalProperties: false
					}
				},
				defaultAccount: { type: "string" }
			},
			required: ["groupPolicy", "streamMode"],
			additionalProperties: false
		}
	},
	{
		pluginId: "imessage",
		channelId: "imessage",
		label: "iMessage",
		description: "this is still a work in progress.",
		schema: {
			$schema: "http://json-schema.org/draft-07/schema#",
			type: "object",
			properties: {
				name: { type: "string" },
				capabilities: {
					type: "array",
					items: { type: "string" }
				},
				markdown: {
					type: "object",
					properties: { tables: {
						type: "string",
						enum: [
							"off",
							"bullets",
							"code",
							"block"
						]
					} },
					additionalProperties: false
				},
				enabled: { type: "boolean" },
				configWrites: { type: "boolean" },
				cliPath: { type: "string" },
				dbPath: { type: "string" },
				remoteHost: { type: "string" },
				service: { anyOf: [
					{
						type: "string",
						const: "imessage"
					},
					{
						type: "string",
						const: "sms"
					},
					{
						type: "string",
						const: "auto"
					}
				] },
				region: { type: "string" },
				dmPolicy: {
					default: "pairing",
					type: "string",
					enum: [
						"pairing",
						"allowlist",
						"open",
						"disabled"
					]
				},
				allowFrom: {
					type: "array",
					items: { anyOf: [{ type: "string" }, { type: "number" }] }
				},
				defaultTo: { type: "string" },
				groupAllowFrom: {
					type: "array",
					items: { anyOf: [{ type: "string" }, { type: "number" }] }
				},
				groupPolicy: {
					default: "allowlist",
					type: "string",
					enum: [
						"open",
						"disabled",
						"allowlist"
					]
				},
				historyLimit: {
					type: "integer",
					minimum: 0,
					maximum: 9007199254740991
				},
				dmHistoryLimit: {
					type: "integer",
					minimum: 0,
					maximum: 9007199254740991
				},
				dms: {
					type: "object",
					propertyNames: { type: "string" },
					additionalProperties: {
						type: "object",
						properties: { historyLimit: {
							type: "integer",
							minimum: 0,
							maximum: 9007199254740991
						} },
						additionalProperties: false
					}
				},
				includeAttachments: { type: "boolean" },
				attachmentRoots: {
					type: "array",
					items: { type: "string" }
				},
				remoteAttachmentRoots: {
					type: "array",
					items: { type: "string" }
				},
				mediaMaxMb: {
					type: "integer",
					exclusiveMinimum: 0,
					maximum: 9007199254740991
				},
				textChunkLimit: {
					type: "integer",
					exclusiveMinimum: 0,
					maximum: 9007199254740991
				},
				chunkMode: {
					type: "string",
					enum: ["length", "newline"]
				},
				blockStreaming: { type: "boolean" },
				blockStreamingCoalesce: {
					type: "object",
					properties: {
						minChars: {
							type: "integer",
							exclusiveMinimum: 0,
							maximum: 9007199254740991
						},
						maxChars: {
							type: "integer",
							exclusiveMinimum: 0,
							maximum: 9007199254740991
						},
						idleMs: {
							type: "integer",
							minimum: 0,
							maximum: 9007199254740991
						}
					},
					additionalProperties: false
				},
				groups: {
					type: "object",
					propertyNames: { type: "string" },
					additionalProperties: {
						type: "object",
						properties: {
							requireMention: { type: "boolean" },
							tools: {
								type: "object",
								properties: {
									allow: {
										type: "array",
										items: { type: "string" }
									},
									alsoAllow: {
										type: "array",
										items: { type: "string" }
									},
									deny: {
										type: "array",
										items: { type: "string" }
									}
								},
								additionalProperties: false
							},
							toolsBySender: {
								type: "object",
								propertyNames: { type: "string" },
								additionalProperties: {
									type: "object",
									properties: {
										allow: {
											type: "array",
											items: { type: "string" }
										},
										alsoAllow: {
											type: "array",
											items: { type: "string" }
										},
										deny: {
											type: "array",
											items: { type: "string" }
										}
									},
									additionalProperties: false
								}
							}
						},
						additionalProperties: false
					}
				},
				heartbeat: {
					type: "object",
					properties: {
						showOk: { type: "boolean" },
						showAlerts: { type: "boolean" },
						useIndicator: { type: "boolean" }
					},
					additionalProperties: false
				},
				healthMonitor: {
					type: "object",
					properties: { enabled: { type: "boolean" } },
					additionalProperties: false
				},
				responsePrefix: { type: "string" },
				accounts: {
					type: "object",
					propertyNames: { type: "string" },
					additionalProperties: {
						type: "object",
						properties: {
							name: { type: "string" },
							capabilities: {
								type: "array",
								items: { type: "string" }
							},
							markdown: {
								type: "object",
								properties: { tables: {
									type: "string",
									enum: [
										"off",
										"bullets",
										"code",
										"block"
									]
								} },
								additionalProperties: false
							},
							enabled: { type: "boolean" },
							configWrites: { type: "boolean" },
							cliPath: { type: "string" },
							dbPath: { type: "string" },
							remoteHost: { type: "string" },
							service: { anyOf: [
								{
									type: "string",
									const: "imessage"
								},
								{
									type: "string",
									const: "sms"
								},
								{
									type: "string",
									const: "auto"
								}
							] },
							region: { type: "string" },
							dmPolicy: {
								default: "pairing",
								type: "string",
								enum: [
									"pairing",
									"allowlist",
									"open",
									"disabled"
								]
							},
							allowFrom: {
								type: "array",
								items: { anyOf: [{ type: "string" }, { type: "number" }] }
							},
							defaultTo: { type: "string" },
							groupAllowFrom: {
								type: "array",
								items: { anyOf: [{ type: "string" }, { type: "number" }] }
							},
							groupPolicy: {
								default: "allowlist",
								type: "string",
								enum: [
									"open",
									"disabled",
									"allowlist"
								]
							},
							historyLimit: {
								type: "integer",
								minimum: 0,
								maximum: 9007199254740991
							},
							dmHistoryLimit: {
								type: "integer",
								minimum: 0,
								maximum: 9007199254740991
							},
							dms: {
								type: "object",
								propertyNames: { type: "string" },
								additionalProperties: {
									type: "object",
									properties: { historyLimit: {
										type: "integer",
										minimum: 0,
										maximum: 9007199254740991
									} },
									additionalProperties: false
								}
							},
							includeAttachments: { type: "boolean" },
							attachmentRoots: {
								type: "array",
								items: { type: "string" }
							},
							remoteAttachmentRoots: {
								type: "array",
								items: { type: "string" }
							},
							mediaMaxMb: {
								type: "integer",
								exclusiveMinimum: 0,
								maximum: 9007199254740991
							},
							textChunkLimit: {
								type: "integer",
								exclusiveMinimum: 0,
								maximum: 9007199254740991
							},
							chunkMode: {
								type: "string",
								enum: ["length", "newline"]
							},
							blockStreaming: { type: "boolean" },
							blockStreamingCoalesce: {
								type: "object",
								properties: {
									minChars: {
										type: "integer",
										exclusiveMinimum: 0,
										maximum: 9007199254740991
									},
									maxChars: {
										type: "integer",
										exclusiveMinimum: 0,
										maximum: 9007199254740991
									},
									idleMs: {
										type: "integer",
										minimum: 0,
										maximum: 9007199254740991
									}
								},
								additionalProperties: false
							},
							groups: {
								type: "object",
								propertyNames: { type: "string" },
								additionalProperties: {
									type: "object",
									properties: {
										requireMention: { type: "boolean" },
										tools: {
											type: "object",
											properties: {
												allow: {
													type: "array",
													items: { type: "string" }
												},
												alsoAllow: {
													type: "array",
													items: { type: "string" }
												},
												deny: {
													type: "array",
													items: { type: "string" }
												}
											},
											additionalProperties: false
										},
										toolsBySender: {
											type: "object",
											propertyNames: { type: "string" },
											additionalProperties: {
												type: "object",
												properties: {
													allow: {
														type: "array",
														items: { type: "string" }
													},
													alsoAllow: {
														type: "array",
														items: { type: "string" }
													},
													deny: {
														type: "array",
														items: { type: "string" }
													}
												},
												additionalProperties: false
											}
										}
									},
									additionalProperties: false
								}
							},
							heartbeat: {
								type: "object",
								properties: {
									showOk: { type: "boolean" },
									showAlerts: { type: "boolean" },
									useIndicator: { type: "boolean" }
								},
								additionalProperties: false
							},
							healthMonitor: {
								type: "object",
								properties: { enabled: { type: "boolean" } },
								additionalProperties: false
							},
							responsePrefix: { type: "string" }
						},
						required: ["dmPolicy", "groupPolicy"],
						additionalProperties: false
					}
				},
				defaultAccount: { type: "string" }
			},
			required: ["dmPolicy", "groupPolicy"],
			additionalProperties: false
		},
		uiHints: {
			"": {
				label: "iMessage",
				help: "iMessage channel provider configuration for CLI integration and DM access policy handling. Use explicit CLI paths when runtime environments have non-standard binary locations."
			},
			dmPolicy: {
				label: "iMessage DM Policy",
				help: "Direct message access control (\"pairing\" recommended). \"open\" requires channels.imessage.allowFrom=[\"*\"]."
			},
			configWrites: {
				label: "iMessage Config Writes",
				help: "Allow iMessage to write config in response to channel events/commands (default: true)."
			},
			cliPath: {
				label: "iMessage CLI Path",
				help: "Filesystem path to the iMessage bridge CLI binary used for send/receive operations. Set explicitly when the binary is not on PATH in service runtime environments."
			}
		}
	},
	{
		pluginId: "irc",
		channelId: "irc",
		label: "IRC",
		description: "classic IRC networks with DM/channel routing and pairing controls.",
		schema: {
			$schema: "http://json-schema.org/draft-07/schema#",
			type: "object",
			properties: {
				name: { type: "string" },
				enabled: { type: "boolean" },
				dangerouslyAllowNameMatching: { type: "boolean" },
				host: { type: "string" },
				port: {
					type: "integer",
					minimum: 1,
					maximum: 65535
				},
				tls: { type: "boolean" },
				nick: { type: "string" },
				username: { type: "string" },
				realname: { type: "string" },
				password: { type: "string" },
				passwordFile: { type: "string" },
				nickserv: {
					type: "object",
					properties: {
						enabled: { type: "boolean" },
						service: { type: "string" },
						password: { type: "string" },
						passwordFile: { type: "string" },
						register: { type: "boolean" },
						registerEmail: { type: "string" }
					},
					additionalProperties: false
				},
				dmPolicy: {
					default: "pairing",
					type: "string",
					enum: [
						"pairing",
						"allowlist",
						"open",
						"disabled"
					]
				},
				allowFrom: {
					type: "array",
					items: { anyOf: [{ type: "string" }, { type: "number" }] }
				},
				groupPolicy: {
					default: "allowlist",
					type: "string",
					enum: [
						"open",
						"disabled",
						"allowlist"
					]
				},
				groupAllowFrom: {
					type: "array",
					items: { anyOf: [{ type: "string" }, { type: "number" }] }
				},
				groups: {
					type: "object",
					propertyNames: { type: "string" },
					additionalProperties: {
						type: "object",
						properties: {
							requireMention: { type: "boolean" },
							tools: {
								type: "object",
								properties: {
									allow: {
										type: "array",
										items: { type: "string" }
									},
									alsoAllow: {
										type: "array",
										items: { type: "string" }
									},
									deny: {
										type: "array",
										items: { type: "string" }
									}
								},
								additionalProperties: false
							},
							toolsBySender: {
								type: "object",
								propertyNames: { type: "string" },
								additionalProperties: {
									type: "object",
									properties: {
										allow: {
											type: "array",
											items: { type: "string" }
										},
										alsoAllow: {
											type: "array",
											items: { type: "string" }
										},
										deny: {
											type: "array",
											items: { type: "string" }
										}
									},
									additionalProperties: false
								}
							},
							skills: {
								type: "array",
								items: { type: "string" }
							},
							enabled: { type: "boolean" },
							allowFrom: {
								type: "array",
								items: { anyOf: [{ type: "string" }, { type: "number" }] }
							},
							systemPrompt: { type: "string" }
						},
						additionalProperties: false
					}
				},
				channels: {
					type: "array",
					items: { type: "string" }
				},
				mentionPatterns: {
					type: "array",
					items: { type: "string" }
				},
				markdown: {
					type: "object",
					properties: { tables: {
						type: "string",
						enum: [
							"off",
							"bullets",
							"code",
							"block"
						]
					} },
					additionalProperties: false
				},
				historyLimit: {
					type: "integer",
					minimum: 0,
					maximum: 9007199254740991
				},
				dmHistoryLimit: {
					type: "integer",
					minimum: 0,
					maximum: 9007199254740991
				},
				dms: {
					type: "object",
					propertyNames: { type: "string" },
					additionalProperties: {
						type: "object",
						properties: { historyLimit: {
							type: "integer",
							minimum: 0,
							maximum: 9007199254740991
						} },
						additionalProperties: false
					}
				},
				textChunkLimit: {
					type: "integer",
					exclusiveMinimum: 0,
					maximum: 9007199254740991
				},
				chunkMode: {
					type: "string",
					enum: ["length", "newline"]
				},
				blockStreaming: { type: "boolean" },
				blockStreamingCoalesce: {
					type: "object",
					properties: {
						minChars: {
							type: "integer",
							exclusiveMinimum: 0,
							maximum: 9007199254740991
						},
						maxChars: {
							type: "integer",
							exclusiveMinimum: 0,
							maximum: 9007199254740991
						},
						idleMs: {
							type: "integer",
							minimum: 0,
							maximum: 9007199254740991
						}
					},
					additionalProperties: false
				},
				responsePrefix: { type: "string" },
				mediaMaxMb: {
					type: "number",
					exclusiveMinimum: 0
				},
				accounts: {
					type: "object",
					propertyNames: { type: "string" },
					additionalProperties: {
						type: "object",
						properties: {
							name: { type: "string" },
							enabled: { type: "boolean" },
							dangerouslyAllowNameMatching: { type: "boolean" },
							host: { type: "string" },
							port: {
								type: "integer",
								minimum: 1,
								maximum: 65535
							},
							tls: { type: "boolean" },
							nick: { type: "string" },
							username: { type: "string" },
							realname: { type: "string" },
							password: { type: "string" },
							passwordFile: { type: "string" },
							nickserv: {
								type: "object",
								properties: {
									enabled: { type: "boolean" },
									service: { type: "string" },
									password: { type: "string" },
									passwordFile: { type: "string" },
									register: { type: "boolean" },
									registerEmail: { type: "string" }
								},
								additionalProperties: false
							},
							dmPolicy: {
								default: "pairing",
								type: "string",
								enum: [
									"pairing",
									"allowlist",
									"open",
									"disabled"
								]
							},
							allowFrom: {
								type: "array",
								items: { anyOf: [{ type: "string" }, { type: "number" }] }
							},
							groupPolicy: {
								default: "allowlist",
								type: "string",
								enum: [
									"open",
									"disabled",
									"allowlist"
								]
							},
							groupAllowFrom: {
								type: "array",
								items: { anyOf: [{ type: "string" }, { type: "number" }] }
							},
							groups: {
								type: "object",
								propertyNames: { type: "string" },
								additionalProperties: {
									type: "object",
									properties: {
										requireMention: { type: "boolean" },
										tools: {
											type: "object",
											properties: {
												allow: {
													type: "array",
													items: { type: "string" }
												},
												alsoAllow: {
													type: "array",
													items: { type: "string" }
												},
												deny: {
													type: "array",
													items: { type: "string" }
												}
											},
											additionalProperties: false
										},
										toolsBySender: {
											type: "object",
											propertyNames: { type: "string" },
											additionalProperties: {
												type: "object",
												properties: {
													allow: {
														type: "array",
														items: { type: "string" }
													},
													alsoAllow: {
														type: "array",
														items: { type: "string" }
													},
													deny: {
														type: "array",
														items: { type: "string" }
													}
												},
												additionalProperties: false
											}
										},
										skills: {
											type: "array",
											items: { type: "string" }
										},
										enabled: { type: "boolean" },
										allowFrom: {
											type: "array",
											items: { anyOf: [{ type: "string" }, { type: "number" }] }
										},
										systemPrompt: { type: "string" }
									},
									additionalProperties: false
								}
							},
							channels: {
								type: "array",
								items: { type: "string" }
							},
							mentionPatterns: {
								type: "array",
								items: { type: "string" }
							},
							markdown: {
								type: "object",
								properties: { tables: {
									type: "string",
									enum: [
										"off",
										"bullets",
										"code",
										"block"
									]
								} },
								additionalProperties: false
							},
							historyLimit: {
								type: "integer",
								minimum: 0,
								maximum: 9007199254740991
							},
							dmHistoryLimit: {
								type: "integer",
								minimum: 0,
								maximum: 9007199254740991
							},
							dms: {
								type: "object",
								propertyNames: { type: "string" },
								additionalProperties: {
									type: "object",
									properties: { historyLimit: {
										type: "integer",
										minimum: 0,
										maximum: 9007199254740991
									} },
									additionalProperties: false
								}
							},
							textChunkLimit: {
								type: "integer",
								exclusiveMinimum: 0,
								maximum: 9007199254740991
							},
							chunkMode: {
								type: "string",
								enum: ["length", "newline"]
							},
							blockStreaming: { type: "boolean" },
							blockStreamingCoalesce: {
								type: "object",
								properties: {
									minChars: {
										type: "integer",
										exclusiveMinimum: 0,
										maximum: 9007199254740991
									},
									maxChars: {
										type: "integer",
										exclusiveMinimum: 0,
										maximum: 9007199254740991
									},
									idleMs: {
										type: "integer",
										minimum: 0,
										maximum: 9007199254740991
									}
								},
								additionalProperties: false
							},
							responsePrefix: { type: "string" },
							mediaMaxMb: {
								type: "number",
								exclusiveMinimum: 0
							}
						},
						required: ["dmPolicy", "groupPolicy"],
						additionalProperties: false
					}
				},
				defaultAccount: { type: "string" }
			},
			required: ["dmPolicy", "groupPolicy"],
			additionalProperties: false
		},
		uiHints: {
			"": {
				label: "IRC",
				help: "IRC channel provider configuration and compatibility settings for classic IRC transport workflows. Use this section when bridging legacy chat infrastructure into OpenClaw."
			},
			dmPolicy: {
				label: "IRC DM Policy",
				help: "Direct message access control (\"pairing\" recommended). \"open\" requires channels.irc.allowFrom=[\"*\"]."
			},
			"nickserv.enabled": {
				label: "IRC NickServ Enabled",
				help: "Enable NickServ identify/register after connect (defaults to enabled when password is configured)."
			},
			"nickserv.service": {
				label: "IRC NickServ Service",
				help: "NickServ service nick (default: NickServ)."
			},
			"nickserv.password": {
				label: "IRC NickServ Password",
				help: "NickServ password used for IDENTIFY/REGISTER (sensitive)."
			},
			"nickserv.passwordFile": {
				label: "IRC NickServ Password File",
				help: "Optional file path containing NickServ password."
			},
			"nickserv.register": {
				label: "IRC NickServ Register",
				help: "If true, send NickServ REGISTER on every connect. Use once for initial registration, then disable."
			},
			"nickserv.registerEmail": {
				label: "IRC NickServ Register Email",
				help: "Email used with NickServ REGISTER (required when register=true)."
			},
			configWrites: {
				label: "IRC Config Writes",
				help: "Allow IRC to write config in response to channel events/commands (default: true)."
			}
		}
	},
	{
		pluginId: "line",
		channelId: "line",
		label: "LINE",
		description: "LINE Messaging API webhook bot.",
		schema: {
			$schema: "http://json-schema.org/draft-07/schema#",
			type: "object",
			properties: {
				enabled: { type: "boolean" },
				channelAccessToken: { type: "string" },
				channelSecret: { type: "string" },
				tokenFile: { type: "string" },
				secretFile: { type: "string" },
				name: { type: "string" },
				allowFrom: {
					type: "array",
					items: { anyOf: [{ type: "string" }, { type: "number" }] }
				},
				groupAllowFrom: {
					type: "array",
					items: { anyOf: [{ type: "string" }, { type: "number" }] }
				},
				dmPolicy: {
					default: "pairing",
					type: "string",
					enum: [
						"open",
						"allowlist",
						"pairing",
						"disabled"
					]
				},
				groupPolicy: {
					default: "allowlist",
					type: "string",
					enum: [
						"open",
						"allowlist",
						"disabled"
					]
				},
				responsePrefix: { type: "string" },
				mediaMaxMb: { type: "number" },
				webhookPath: { type: "string" },
				threadBindings: {
					type: "object",
					properties: {
						enabled: { type: "boolean" },
						idleHours: { type: "number" },
						maxAgeHours: { type: "number" },
						spawnSubagentSessions: { type: "boolean" },
						spawnAcpSessions: { type: "boolean" }
					},
					additionalProperties: false
				},
				accounts: {
					type: "object",
					propertyNames: { type: "string" },
					additionalProperties: {
						type: "object",
						properties: {
							enabled: { type: "boolean" },
							channelAccessToken: { type: "string" },
							channelSecret: { type: "string" },
							tokenFile: { type: "string" },
							secretFile: { type: "string" },
							name: { type: "string" },
							allowFrom: {
								type: "array",
								items: { anyOf: [{ type: "string" }, { type: "number" }] }
							},
							groupAllowFrom: {
								type: "array",
								items: { anyOf: [{ type: "string" }, { type: "number" }] }
							},
							dmPolicy: {
								default: "pairing",
								type: "string",
								enum: [
									"open",
									"allowlist",
									"pairing",
									"disabled"
								]
							},
							groupPolicy: {
								default: "allowlist",
								type: "string",
								enum: [
									"open",
									"allowlist",
									"disabled"
								]
							},
							responsePrefix: { type: "string" },
							mediaMaxMb: { type: "number" },
							webhookPath: { type: "string" },
							threadBindings: {
								type: "object",
								properties: {
									enabled: { type: "boolean" },
									idleHours: { type: "number" },
									maxAgeHours: { type: "number" },
									spawnSubagentSessions: { type: "boolean" },
									spawnAcpSessions: { type: "boolean" }
								},
								additionalProperties: false
							},
							groups: {
								type: "object",
								propertyNames: { type: "string" },
								additionalProperties: {
									type: "object",
									properties: {
										enabled: { type: "boolean" },
										allowFrom: {
											type: "array",
											items: { anyOf: [{ type: "string" }, { type: "number" }] }
										},
										requireMention: { type: "boolean" },
										systemPrompt: { type: "string" },
										skills: {
											type: "array",
											items: { type: "string" }
										}
									},
									additionalProperties: false
								}
							}
						},
						required: ["dmPolicy", "groupPolicy"],
						additionalProperties: false
					}
				},
				defaultAccount: { type: "string" },
				groups: {
					type: "object",
					propertyNames: { type: "string" },
					additionalProperties: {
						type: "object",
						properties: {
							enabled: { type: "boolean" },
							allowFrom: {
								type: "array",
								items: { anyOf: [{ type: "string" }, { type: "number" }] }
							},
							requireMention: { type: "boolean" },
							systemPrompt: { type: "string" },
							skills: {
								type: "array",
								items: { type: "string" }
							}
						},
						additionalProperties: false
					}
				}
			},
			required: ["dmPolicy", "groupPolicy"],
			additionalProperties: false
		}
	},
	{
		pluginId: "matrix",
		channelId: "matrix",
		label: "Matrix",
		description: "open protocol; install the plugin to enable.",
		schema: {
			$schema: "http://json-schema.org/draft-07/schema#",
			type: "object",
			properties: {
				name: { type: "string" },
				enabled: { type: "boolean" },
				defaultAccount: { type: "string" },
				accounts: {
					type: "object",
					propertyNames: { type: "string" },
					additionalProperties: {}
				},
				markdown: {
					type: "object",
					properties: { tables: {
						type: "string",
						enum: [
							"off",
							"bullets",
							"code",
							"block"
						]
					} },
					additionalProperties: false
				},
				homeserver: { type: "string" },
				allowPrivateNetwork: { type: "boolean" },
				proxy: { type: "string" },
				userId: { type: "string" },
				accessToken: { anyOf: [{ type: "string" }, { oneOf: [
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "env"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: {
								type: "string",
								pattern: "^[A-Z][A-Z0-9_]{0,127}$"
							}
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					},
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "file"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: { type: "string" }
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					},
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "exec"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: { type: "string" }
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					}
				] }] },
				password: { anyOf: [{ type: "string" }, { oneOf: [
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "env"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: {
								type: "string",
								pattern: "^[A-Z][A-Z0-9_]{0,127}$"
							}
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					},
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "file"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: { type: "string" }
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					},
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "exec"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: { type: "string" }
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					}
				] }] },
				deviceId: { type: "string" },
				deviceName: { type: "string" },
				avatarUrl: { type: "string" },
				initialSyncLimit: { type: "number" },
				encryption: { type: "boolean" },
				allowlistOnly: { type: "boolean" },
				allowBots: { anyOf: [{ type: "boolean" }, {
					type: "string",
					const: "mentions"
				}] },
				groupPolicy: {
					type: "string",
					enum: [
						"open",
						"disabled",
						"allowlist"
					]
				},
				blockStreaming: { type: "boolean" },
				streaming: { anyOf: [{
					type: "string",
					enum: ["partial", "off"]
				}, { type: "boolean" }] },
				replyToMode: {
					type: "string",
					enum: [
						"off",
						"first",
						"all"
					]
				},
				threadReplies: {
					type: "string",
					enum: [
						"off",
						"inbound",
						"always"
					]
				},
				textChunkLimit: { type: "number" },
				chunkMode: {
					type: "string",
					enum: ["length", "newline"]
				},
				responsePrefix: { type: "string" },
				ackReaction: { type: "string" },
				ackReactionScope: {
					type: "string",
					enum: [
						"group-mentions",
						"group-all",
						"direct",
						"all",
						"none",
						"off"
					]
				},
				reactionNotifications: {
					type: "string",
					enum: ["off", "own"]
				},
				threadBindings: {
					type: "object",
					properties: {
						enabled: { type: "boolean" },
						idleHours: {
							type: "number",
							minimum: 0
						},
						maxAgeHours: {
							type: "number",
							minimum: 0
						},
						spawnSubagentSessions: { type: "boolean" },
						spawnAcpSessions: { type: "boolean" }
					},
					additionalProperties: false
				},
				startupVerification: {
					type: "string",
					enum: ["off", "if-unverified"]
				},
				startupVerificationCooldownHours: { type: "number" },
				mediaMaxMb: { type: "number" },
				historyLimit: {
					type: "integer",
					minimum: 0,
					maximum: 9007199254740991
				},
				autoJoin: {
					type: "string",
					enum: [
						"always",
						"allowlist",
						"off"
					]
				},
				autoJoinAllowlist: {
					type: "array",
					items: { anyOf: [{ type: "string" }, { type: "number" }] }
				},
				groupAllowFrom: {
					type: "array",
					items: { anyOf: [{ type: "string" }, { type: "number" }] }
				},
				dm: {
					type: "object",
					properties: {
						enabled: { type: "boolean" },
						policy: {
							type: "string",
							enum: [
								"pairing",
								"allowlist",
								"open",
								"disabled"
							]
						},
						allowFrom: {
							type: "array",
							items: { anyOf: [{ type: "string" }, { type: "number" }] }
						},
						threadReplies: {
							type: "string",
							enum: [
								"off",
								"inbound",
								"always"
							]
						}
					},
					additionalProperties: false
				},
				groups: {
					type: "object",
					properties: {},
					additionalProperties: {
						type: "object",
						properties: {
							account: { type: "string" },
							enabled: { type: "boolean" },
							allow: { type: "boolean" },
							requireMention: { type: "boolean" },
							allowBots: { anyOf: [{ type: "boolean" }, {
								type: "string",
								const: "mentions"
							}] },
							tools: {
								type: "object",
								properties: {
									allow: {
										type: "array",
										items: { type: "string" }
									},
									alsoAllow: {
										type: "array",
										items: { type: "string" }
									},
									deny: {
										type: "array",
										items: { type: "string" }
									}
								},
								additionalProperties: false
							},
							autoReply: { type: "boolean" },
							users: {
								type: "array",
								items: { anyOf: [{ type: "string" }, { type: "number" }] }
							},
							skills: {
								type: "array",
								items: { type: "string" }
							},
							systemPrompt: { type: "string" }
						},
						additionalProperties: false
					}
				},
				rooms: {
					type: "object",
					properties: {},
					additionalProperties: {
						type: "object",
						properties: {
							account: { type: "string" },
							enabled: { type: "boolean" },
							allow: { type: "boolean" },
							requireMention: { type: "boolean" },
							allowBots: { anyOf: [{ type: "boolean" }, {
								type: "string",
								const: "mentions"
							}] },
							tools: {
								type: "object",
								properties: {
									allow: {
										type: "array",
										items: { type: "string" }
									},
									alsoAllow: {
										type: "array",
										items: { type: "string" }
									},
									deny: {
										type: "array",
										items: { type: "string" }
									}
								},
								additionalProperties: false
							},
							autoReply: { type: "boolean" },
							users: {
								type: "array",
								items: { anyOf: [{ type: "string" }, { type: "number" }] }
							},
							skills: {
								type: "array",
								items: { type: "string" }
							},
							systemPrompt: { type: "string" }
						},
						additionalProperties: false
					}
				},
				actions: {
					type: "object",
					properties: {
						reactions: { type: "boolean" },
						messages: { type: "boolean" },
						pins: { type: "boolean" },
						profile: { type: "boolean" },
						memberInfo: { type: "boolean" },
						channelInfo: { type: "boolean" },
						verification: { type: "boolean" }
					},
					additionalProperties: false
				}
			},
			additionalProperties: false
		}
	},
	{
		pluginId: "mattermost",
		channelId: "mattermost",
		label: "Mattermost",
		description: "self-hosted Slack-style chat; install the plugin to enable.",
		schema: {
			$schema: "http://json-schema.org/draft-07/schema#",
			type: "object",
			properties: {
				name: { type: "string" },
				capabilities: {
					type: "array",
					items: { type: "string" }
				},
				dangerouslyAllowNameMatching: { type: "boolean" },
				markdown: {
					type: "object",
					properties: { tables: {
						type: "string",
						enum: [
							"off",
							"bullets",
							"code",
							"block"
						]
					} },
					additionalProperties: false
				},
				enabled: { type: "boolean" },
				configWrites: { type: "boolean" },
				botToken: { anyOf: [{ type: "string" }, { oneOf: [
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "env"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: {
								type: "string",
								pattern: "^[A-Z][A-Z0-9_]{0,127}$"
							}
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					},
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "file"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: { type: "string" }
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					},
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "exec"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: { type: "string" }
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					}
				] }] },
				baseUrl: { type: "string" },
				chatmode: {
					type: "string",
					enum: [
						"oncall",
						"onmessage",
						"onchar"
					]
				},
				oncharPrefixes: {
					type: "array",
					items: { type: "string" }
				},
				requireMention: { type: "boolean" },
				dmPolicy: {
					default: "pairing",
					type: "string",
					enum: [
						"pairing",
						"allowlist",
						"open",
						"disabled"
					]
				},
				allowFrom: {
					type: "array",
					items: { anyOf: [{ type: "string" }, { type: "number" }] }
				},
				groupAllowFrom: {
					type: "array",
					items: { anyOf: [{ type: "string" }, { type: "number" }] }
				},
				groupPolicy: {
					default: "allowlist",
					type: "string",
					enum: [
						"open",
						"disabled",
						"allowlist"
					]
				},
				textChunkLimit: {
					type: "integer",
					exclusiveMinimum: 0,
					maximum: 9007199254740991
				},
				chunkMode: {
					type: "string",
					enum: ["length", "newline"]
				},
				blockStreaming: { type: "boolean" },
				blockStreamingCoalesce: {
					type: "object",
					properties: {
						minChars: {
							type: "integer",
							exclusiveMinimum: 0,
							maximum: 9007199254740991
						},
						maxChars: {
							type: "integer",
							exclusiveMinimum: 0,
							maximum: 9007199254740991
						},
						idleMs: {
							type: "integer",
							minimum: 0,
							maximum: 9007199254740991
						}
					},
					additionalProperties: false
				},
				replyToMode: {
					type: "string",
					enum: [
						"off",
						"first",
						"all"
					]
				},
				responsePrefix: { type: "string" },
				actions: {
					type: "object",
					properties: { reactions: { type: "boolean" } },
					additionalProperties: false
				},
				commands: {
					type: "object",
					properties: {
						native: { anyOf: [{ type: "boolean" }, {
							type: "string",
							const: "auto"
						}] },
						nativeSkills: { anyOf: [{ type: "boolean" }, {
							type: "string",
							const: "auto"
						}] },
						callbackPath: { type: "string" },
						callbackUrl: { type: "string" }
					},
					additionalProperties: false
				},
				interactions: {
					type: "object",
					properties: {
						callbackBaseUrl: { type: "string" },
						allowedSourceIps: {
							type: "array",
							items: { type: "string" }
						}
					},
					additionalProperties: false
				},
				allowPrivateNetwork: { type: "boolean" },
				dmChannelRetry: {
					type: "object",
					properties: {
						maxRetries: {
							type: "integer",
							minimum: 0,
							maximum: 10
						},
						initialDelayMs: {
							type: "integer",
							minimum: 100,
							maximum: 6e4
						},
						maxDelayMs: {
							type: "integer",
							minimum: 1e3,
							maximum: 6e4
						},
						timeoutMs: {
							type: "integer",
							minimum: 5e3,
							maximum: 12e4
						}
					},
					additionalProperties: false
				},
				accounts: {
					type: "object",
					propertyNames: { type: "string" },
					additionalProperties: {
						type: "object",
						properties: {
							name: { type: "string" },
							capabilities: {
								type: "array",
								items: { type: "string" }
							},
							dangerouslyAllowNameMatching: { type: "boolean" },
							markdown: {
								type: "object",
								properties: { tables: {
									type: "string",
									enum: [
										"off",
										"bullets",
										"code",
										"block"
									]
								} },
								additionalProperties: false
							},
							enabled: { type: "boolean" },
							configWrites: { type: "boolean" },
							botToken: { anyOf: [{ type: "string" }, { oneOf: [
								{
									type: "object",
									properties: {
										source: {
											type: "string",
											const: "env"
										},
										provider: {
											type: "string",
											pattern: "^[a-z][a-z0-9_-]{0,63}$"
										},
										id: {
											type: "string",
											pattern: "^[A-Z][A-Z0-9_]{0,127}$"
										}
									},
									required: [
										"source",
										"provider",
										"id"
									],
									additionalProperties: false
								},
								{
									type: "object",
									properties: {
										source: {
											type: "string",
											const: "file"
										},
										provider: {
											type: "string",
											pattern: "^[a-z][a-z0-9_-]{0,63}$"
										},
										id: { type: "string" }
									},
									required: [
										"source",
										"provider",
										"id"
									],
									additionalProperties: false
								},
								{
									type: "object",
									properties: {
										source: {
											type: "string",
											const: "exec"
										},
										provider: {
											type: "string",
											pattern: "^[a-z][a-z0-9_-]{0,63}$"
										},
										id: { type: "string" }
									},
									required: [
										"source",
										"provider",
										"id"
									],
									additionalProperties: false
								}
							] }] },
							baseUrl: { type: "string" },
							chatmode: {
								type: "string",
								enum: [
									"oncall",
									"onmessage",
									"onchar"
								]
							},
							oncharPrefixes: {
								type: "array",
								items: { type: "string" }
							},
							requireMention: { type: "boolean" },
							dmPolicy: {
								default: "pairing",
								type: "string",
								enum: [
									"pairing",
									"allowlist",
									"open",
									"disabled"
								]
							},
							allowFrom: {
								type: "array",
								items: { anyOf: [{ type: "string" }, { type: "number" }] }
							},
							groupAllowFrom: {
								type: "array",
								items: { anyOf: [{ type: "string" }, { type: "number" }] }
							},
							groupPolicy: {
								default: "allowlist",
								type: "string",
								enum: [
									"open",
									"disabled",
									"allowlist"
								]
							},
							textChunkLimit: {
								type: "integer",
								exclusiveMinimum: 0,
								maximum: 9007199254740991
							},
							chunkMode: {
								type: "string",
								enum: ["length", "newline"]
							},
							blockStreaming: { type: "boolean" },
							blockStreamingCoalesce: {
								type: "object",
								properties: {
									minChars: {
										type: "integer",
										exclusiveMinimum: 0,
										maximum: 9007199254740991
									},
									maxChars: {
										type: "integer",
										exclusiveMinimum: 0,
										maximum: 9007199254740991
									},
									idleMs: {
										type: "integer",
										minimum: 0,
										maximum: 9007199254740991
									}
								},
								additionalProperties: false
							},
							replyToMode: {
								type: "string",
								enum: [
									"off",
									"first",
									"all"
								]
							},
							responsePrefix: { type: "string" },
							actions: {
								type: "object",
								properties: { reactions: { type: "boolean" } },
								additionalProperties: false
							},
							commands: {
								type: "object",
								properties: {
									native: { anyOf: [{ type: "boolean" }, {
										type: "string",
										const: "auto"
									}] },
									nativeSkills: { anyOf: [{ type: "boolean" }, {
										type: "string",
										const: "auto"
									}] },
									callbackPath: { type: "string" },
									callbackUrl: { type: "string" }
								},
								additionalProperties: false
							},
							interactions: {
								type: "object",
								properties: {
									callbackBaseUrl: { type: "string" },
									allowedSourceIps: {
										type: "array",
										items: { type: "string" }
									}
								},
								additionalProperties: false
							},
							allowPrivateNetwork: { type: "boolean" },
							dmChannelRetry: {
								type: "object",
								properties: {
									maxRetries: {
										type: "integer",
										minimum: 0,
										maximum: 10
									},
									initialDelayMs: {
										type: "integer",
										minimum: 100,
										maximum: 6e4
									},
									maxDelayMs: {
										type: "integer",
										minimum: 1e3,
										maximum: 6e4
									},
									timeoutMs: {
										type: "integer",
										minimum: 5e3,
										maximum: 12e4
									}
								},
								additionalProperties: false
							}
						},
						required: ["dmPolicy", "groupPolicy"],
						additionalProperties: false
					}
				},
				defaultAccount: { type: "string" }
			},
			required: ["dmPolicy", "groupPolicy"],
			additionalProperties: false
		}
	},
	{
		pluginId: "msteams",
		channelId: "msteams",
		label: "Microsoft Teams",
		description: "Teams SDK; enterprise support.",
		schema: {
			$schema: "http://json-schema.org/draft-07/schema#",
			type: "object",
			properties: {
				enabled: { type: "boolean" },
				capabilities: {
					type: "array",
					items: { type: "string" }
				},
				dangerouslyAllowNameMatching: { type: "boolean" },
				markdown: {
					type: "object",
					properties: { tables: {
						type: "string",
						enum: [
							"off",
							"bullets",
							"code",
							"block"
						]
					} },
					additionalProperties: false
				},
				configWrites: { type: "boolean" },
				appId: { type: "string" },
				appPassword: { anyOf: [{ type: "string" }, { oneOf: [
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "env"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: {
								type: "string",
								pattern: "^[A-Z][A-Z0-9_]{0,127}$"
							}
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					},
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "file"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: { type: "string" }
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					},
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "exec"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: { type: "string" }
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					}
				] }] },
				tenantId: { type: "string" },
				webhook: {
					type: "object",
					properties: {
						port: {
							type: "integer",
							exclusiveMinimum: 0,
							maximum: 9007199254740991
						},
						path: { type: "string" }
					},
					additionalProperties: false
				},
				dmPolicy: {
					default: "pairing",
					type: "string",
					enum: [
						"pairing",
						"allowlist",
						"open",
						"disabled"
					]
				},
				allowFrom: {
					type: "array",
					items: { type: "string" }
				},
				defaultTo: { type: "string" },
				groupAllowFrom: {
					type: "array",
					items: { type: "string" }
				},
				groupPolicy: {
					default: "allowlist",
					type: "string",
					enum: [
						"open",
						"disabled",
						"allowlist"
					]
				},
				textChunkLimit: {
					type: "integer",
					exclusiveMinimum: 0,
					maximum: 9007199254740991
				},
				chunkMode: {
					type: "string",
					enum: ["length", "newline"]
				},
				blockStreaming: { type: "boolean" },
				blockStreamingCoalesce: {
					type: "object",
					properties: {
						minChars: {
							type: "integer",
							exclusiveMinimum: 0,
							maximum: 9007199254740991
						},
						maxChars: {
							type: "integer",
							exclusiveMinimum: 0,
							maximum: 9007199254740991
						},
						idleMs: {
							type: "integer",
							minimum: 0,
							maximum: 9007199254740991
						}
					},
					additionalProperties: false
				},
				mediaAllowHosts: {
					type: "array",
					items: { type: "string" }
				},
				mediaAuthAllowHosts: {
					type: "array",
					items: { type: "string" }
				},
				requireMention: { type: "boolean" },
				historyLimit: {
					type: "integer",
					minimum: 0,
					maximum: 9007199254740991
				},
				dmHistoryLimit: {
					type: "integer",
					minimum: 0,
					maximum: 9007199254740991
				},
				dms: {
					type: "object",
					propertyNames: { type: "string" },
					additionalProperties: {
						type: "object",
						properties: { historyLimit: {
							type: "integer",
							minimum: 0,
							maximum: 9007199254740991
						} },
						additionalProperties: false
					}
				},
				replyStyle: {
					type: "string",
					enum: ["thread", "top-level"]
				},
				teams: {
					type: "object",
					propertyNames: { type: "string" },
					additionalProperties: {
						type: "object",
						properties: {
							requireMention: { type: "boolean" },
							tools: {
								type: "object",
								properties: {
									allow: {
										type: "array",
										items: { type: "string" }
									},
									alsoAllow: {
										type: "array",
										items: { type: "string" }
									},
									deny: {
										type: "array",
										items: { type: "string" }
									}
								},
								additionalProperties: false
							},
							toolsBySender: {
								type: "object",
								propertyNames: { type: "string" },
								additionalProperties: {
									type: "object",
									properties: {
										allow: {
											type: "array",
											items: { type: "string" }
										},
										alsoAllow: {
											type: "array",
											items: { type: "string" }
										},
										deny: {
											type: "array",
											items: { type: "string" }
										}
									},
									additionalProperties: false
								}
							},
							replyStyle: {
								type: "string",
								enum: ["thread", "top-level"]
							},
							channels: {
								type: "object",
								propertyNames: { type: "string" },
								additionalProperties: {
									type: "object",
									properties: {
										requireMention: { type: "boolean" },
										tools: {
											type: "object",
											properties: {
												allow: {
													type: "array",
													items: { type: "string" }
												},
												alsoAllow: {
													type: "array",
													items: { type: "string" }
												},
												deny: {
													type: "array",
													items: { type: "string" }
												}
											},
											additionalProperties: false
										},
										toolsBySender: {
											type: "object",
											propertyNames: { type: "string" },
											additionalProperties: {
												type: "object",
												properties: {
													allow: {
														type: "array",
														items: { type: "string" }
													},
													alsoAllow: {
														type: "array",
														items: { type: "string" }
													},
													deny: {
														type: "array",
														items: { type: "string" }
													}
												},
												additionalProperties: false
											}
										},
										replyStyle: {
											type: "string",
											enum: ["thread", "top-level"]
										}
									},
									additionalProperties: false
								}
							}
						},
						additionalProperties: false
					}
				},
				mediaMaxMb: {
					type: "number",
					exclusiveMinimum: 0
				},
				sharePointSiteId: { type: "string" },
				heartbeat: {
					type: "object",
					properties: {
						showOk: { type: "boolean" },
						showAlerts: { type: "boolean" },
						useIndicator: { type: "boolean" }
					},
					additionalProperties: false
				},
				healthMonitor: {
					type: "object",
					properties: { enabled: { type: "boolean" } },
					additionalProperties: false
				},
				responsePrefix: { type: "string" },
				welcomeCard: { type: "boolean" },
				promptStarters: {
					type: "array",
					items: { type: "string" }
				},
				groupWelcomeCard: { type: "boolean" },
				feedbackEnabled: { type: "boolean" },
				feedbackReflection: { type: "boolean" },
				feedbackReflectionCooldownMs: {
					type: "integer",
					minimum: 0,
					maximum: 9007199254740991
				}
			},
			required: ["dmPolicy", "groupPolicy"],
			additionalProperties: false
		},
		uiHints: {
			"": {
				label: "MS Teams",
				help: "Microsoft Teams channel provider configuration and provider-specific policy toggles. Use this section to isolate Teams behavior from other enterprise chat providers."
			},
			configWrites: {
				label: "MS Teams Config Writes",
				help: "Allow Microsoft Teams to write config in response to channel events/commands (default: true)."
			}
		}
	},
	{
		pluginId: "nextcloud-talk",
		channelId: "nextcloud-talk",
		label: "Nextcloud Talk",
		description: "Self-hosted chat via Nextcloud Talk webhook bots.",
		schema: {
			$schema: "http://json-schema.org/draft-07/schema#",
			type: "object",
			properties: {
				name: { type: "string" },
				enabled: { type: "boolean" },
				markdown: {
					type: "object",
					properties: { tables: {
						type: "string",
						enum: [
							"off",
							"bullets",
							"code",
							"block"
						]
					} },
					additionalProperties: false
				},
				baseUrl: { type: "string" },
				botSecret: { anyOf: [{ type: "string" }, { oneOf: [
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "env"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: {
								type: "string",
								pattern: "^[A-Z][A-Z0-9_]{0,127}$"
							}
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					},
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "file"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: { type: "string" }
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					},
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "exec"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: { type: "string" }
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					}
				] }] },
				botSecretFile: { type: "string" },
				apiUser: { type: "string" },
				apiPassword: { anyOf: [{ type: "string" }, { oneOf: [
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "env"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: {
								type: "string",
								pattern: "^[A-Z][A-Z0-9_]{0,127}$"
							}
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					},
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "file"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: { type: "string" }
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					},
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "exec"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: { type: "string" }
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					}
				] }] },
				apiPasswordFile: { type: "string" },
				dmPolicy: {
					default: "pairing",
					type: "string",
					enum: [
						"pairing",
						"allowlist",
						"open",
						"disabled"
					]
				},
				webhookPort: {
					type: "integer",
					exclusiveMinimum: 0,
					maximum: 9007199254740991
				},
				webhookHost: { type: "string" },
				webhookPath: { type: "string" },
				webhookPublicUrl: { type: "string" },
				allowFrom: {
					type: "array",
					items: { type: "string" }
				},
				groupAllowFrom: {
					type: "array",
					items: { type: "string" }
				},
				groupPolicy: {
					default: "allowlist",
					type: "string",
					enum: [
						"open",
						"disabled",
						"allowlist"
					]
				},
				rooms: {
					type: "object",
					propertyNames: { type: "string" },
					additionalProperties: {
						type: "object",
						properties: {
							requireMention: { type: "boolean" },
							tools: {
								type: "object",
								properties: {
									allow: {
										type: "array",
										items: { type: "string" }
									},
									alsoAllow: {
										type: "array",
										items: { type: "string" }
									},
									deny: {
										type: "array",
										items: { type: "string" }
									}
								},
								additionalProperties: false
							},
							skills: {
								type: "array",
								items: { type: "string" }
							},
							enabled: { type: "boolean" },
							allowFrom: {
								type: "array",
								items: { type: "string" }
							},
							systemPrompt: { type: "string" }
						},
						additionalProperties: false
					}
				},
				allowPrivateNetwork: { type: "boolean" },
				historyLimit: {
					type: "integer",
					minimum: 0,
					maximum: 9007199254740991
				},
				dmHistoryLimit: {
					type: "integer",
					minimum: 0,
					maximum: 9007199254740991
				},
				dms: {
					type: "object",
					propertyNames: { type: "string" },
					additionalProperties: {
						type: "object",
						properties: { historyLimit: {
							type: "integer",
							minimum: 0,
							maximum: 9007199254740991
						} },
						additionalProperties: false
					}
				},
				textChunkLimit: {
					type: "integer",
					exclusiveMinimum: 0,
					maximum: 9007199254740991
				},
				chunkMode: {
					type: "string",
					enum: ["length", "newline"]
				},
				blockStreaming: { type: "boolean" },
				blockStreamingCoalesce: {
					type: "object",
					properties: {
						minChars: {
							type: "integer",
							exclusiveMinimum: 0,
							maximum: 9007199254740991
						},
						maxChars: {
							type: "integer",
							exclusiveMinimum: 0,
							maximum: 9007199254740991
						},
						idleMs: {
							type: "integer",
							minimum: 0,
							maximum: 9007199254740991
						}
					},
					additionalProperties: false
				},
				responsePrefix: { type: "string" },
				mediaMaxMb: {
					type: "number",
					exclusiveMinimum: 0
				},
				accounts: {
					type: "object",
					propertyNames: { type: "string" },
					additionalProperties: {
						type: "object",
						properties: {
							name: { type: "string" },
							enabled: { type: "boolean" },
							markdown: {
								type: "object",
								properties: { tables: {
									type: "string",
									enum: [
										"off",
										"bullets",
										"code",
										"block"
									]
								} },
								additionalProperties: false
							},
							baseUrl: { type: "string" },
							botSecret: { anyOf: [{ type: "string" }, { oneOf: [
								{
									type: "object",
									properties: {
										source: {
											type: "string",
											const: "env"
										},
										provider: {
											type: "string",
											pattern: "^[a-z][a-z0-9_-]{0,63}$"
										},
										id: {
											type: "string",
											pattern: "^[A-Z][A-Z0-9_]{0,127}$"
										}
									},
									required: [
										"source",
										"provider",
										"id"
									],
									additionalProperties: false
								},
								{
									type: "object",
									properties: {
										source: {
											type: "string",
											const: "file"
										},
										provider: {
											type: "string",
											pattern: "^[a-z][a-z0-9_-]{0,63}$"
										},
										id: { type: "string" }
									},
									required: [
										"source",
										"provider",
										"id"
									],
									additionalProperties: false
								},
								{
									type: "object",
									properties: {
										source: {
											type: "string",
											const: "exec"
										},
										provider: {
											type: "string",
											pattern: "^[a-z][a-z0-9_-]{0,63}$"
										},
										id: { type: "string" }
									},
									required: [
										"source",
										"provider",
										"id"
									],
									additionalProperties: false
								}
							] }] },
							botSecretFile: { type: "string" },
							apiUser: { type: "string" },
							apiPassword: { anyOf: [{ type: "string" }, { oneOf: [
								{
									type: "object",
									properties: {
										source: {
											type: "string",
											const: "env"
										},
										provider: {
											type: "string",
											pattern: "^[a-z][a-z0-9_-]{0,63}$"
										},
										id: {
											type: "string",
											pattern: "^[A-Z][A-Z0-9_]{0,127}$"
										}
									},
									required: [
										"source",
										"provider",
										"id"
									],
									additionalProperties: false
								},
								{
									type: "object",
									properties: {
										source: {
											type: "string",
											const: "file"
										},
										provider: {
											type: "string",
											pattern: "^[a-z][a-z0-9_-]{0,63}$"
										},
										id: { type: "string" }
									},
									required: [
										"source",
										"provider",
										"id"
									],
									additionalProperties: false
								},
								{
									type: "object",
									properties: {
										source: {
											type: "string",
											const: "exec"
										},
										provider: {
											type: "string",
											pattern: "^[a-z][a-z0-9_-]{0,63}$"
										},
										id: { type: "string" }
									},
									required: [
										"source",
										"provider",
										"id"
									],
									additionalProperties: false
								}
							] }] },
							apiPasswordFile: { type: "string" },
							dmPolicy: {
								default: "pairing",
								type: "string",
								enum: [
									"pairing",
									"allowlist",
									"open",
									"disabled"
								]
							},
							webhookPort: {
								type: "integer",
								exclusiveMinimum: 0,
								maximum: 9007199254740991
							},
							webhookHost: { type: "string" },
							webhookPath: { type: "string" },
							webhookPublicUrl: { type: "string" },
							allowFrom: {
								type: "array",
								items: { type: "string" }
							},
							groupAllowFrom: {
								type: "array",
								items: { type: "string" }
							},
							groupPolicy: {
								default: "allowlist",
								type: "string",
								enum: [
									"open",
									"disabled",
									"allowlist"
								]
							},
							rooms: {
								type: "object",
								propertyNames: { type: "string" },
								additionalProperties: {
									type: "object",
									properties: {
										requireMention: { type: "boolean" },
										tools: {
											type: "object",
											properties: {
												allow: {
													type: "array",
													items: { type: "string" }
												},
												alsoAllow: {
													type: "array",
													items: { type: "string" }
												},
												deny: {
													type: "array",
													items: { type: "string" }
												}
											},
											additionalProperties: false
										},
										skills: {
											type: "array",
											items: { type: "string" }
										},
										enabled: { type: "boolean" },
										allowFrom: {
											type: "array",
											items: { type: "string" }
										},
										systemPrompt: { type: "string" }
									},
									additionalProperties: false
								}
							},
							allowPrivateNetwork: { type: "boolean" },
							historyLimit: {
								type: "integer",
								minimum: 0,
								maximum: 9007199254740991
							},
							dmHistoryLimit: {
								type: "integer",
								minimum: 0,
								maximum: 9007199254740991
							},
							dms: {
								type: "object",
								propertyNames: { type: "string" },
								additionalProperties: {
									type: "object",
									properties: { historyLimit: {
										type: "integer",
										minimum: 0,
										maximum: 9007199254740991
									} },
									additionalProperties: false
								}
							},
							textChunkLimit: {
								type: "integer",
								exclusiveMinimum: 0,
								maximum: 9007199254740991
							},
							chunkMode: {
								type: "string",
								enum: ["length", "newline"]
							},
							blockStreaming: { type: "boolean" },
							blockStreamingCoalesce: {
								type: "object",
								properties: {
									minChars: {
										type: "integer",
										exclusiveMinimum: 0,
										maximum: 9007199254740991
									},
									maxChars: {
										type: "integer",
										exclusiveMinimum: 0,
										maximum: 9007199254740991
									},
									idleMs: {
										type: "integer",
										minimum: 0,
										maximum: 9007199254740991
									}
								},
								additionalProperties: false
							},
							responsePrefix: { type: "string" },
							mediaMaxMb: {
								type: "number",
								exclusiveMinimum: 0
							}
						},
						required: ["dmPolicy", "groupPolicy"],
						additionalProperties: false
					}
				},
				defaultAccount: { type: "string" }
			},
			required: ["dmPolicy", "groupPolicy"],
			additionalProperties: false
		}
	},
	{
		pluginId: "nostr",
		channelId: "nostr",
		label: "Nostr",
		description: "Decentralized protocol; encrypted DMs via NIP-04.",
		schema: {
			$schema: "http://json-schema.org/draft-07/schema#",
			type: "object",
			properties: {
				name: { type: "string" },
				defaultAccount: { type: "string" },
				enabled: { type: "boolean" },
				markdown: {
					type: "object",
					properties: { tables: {
						type: "string",
						enum: [
							"off",
							"bullets",
							"code",
							"block"
						]
					} },
					additionalProperties: false
				},
				privateKey: { anyOf: [{ type: "string" }, { oneOf: [
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "env"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: {
								type: "string",
								pattern: "^[A-Z][A-Z0-9_]{0,127}$"
							}
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					},
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "file"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: { type: "string" }
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					},
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "exec"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: { type: "string" }
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					}
				] }] },
				relays: {
					type: "array",
					items: { type: "string" }
				},
				dmPolicy: {
					type: "string",
					enum: [
						"pairing",
						"allowlist",
						"open",
						"disabled"
					]
				},
				allowFrom: {
					type: "array",
					items: { anyOf: [{ type: "string" }, { type: "number" }] }
				},
				profile: {
					type: "object",
					properties: {
						name: {
							type: "string",
							maxLength: 256
						},
						displayName: {
							type: "string",
							maxLength: 256
						},
						about: {
							type: "string",
							maxLength: 2e3
						},
						picture: {
							type: "string",
							format: "uri"
						},
						banner: {
							type: "string",
							format: "uri"
						},
						website: {
							type: "string",
							format: "uri"
						},
						nip05: { type: "string" },
						lud16: { type: "string" }
					},
					additionalProperties: false
				}
			},
			additionalProperties: false
		}
	},
	{
		pluginId: "qqbot",
		channelId: "qqbot",
		label: "QQ Bot",
		description: "connect to QQ via official QQ Bot API with group chat and direct message support.",
		schema: {
			$schema: "http://json-schema.org/draft-07/schema#",
			type: "object",
			properties: {
				enabled: { type: "boolean" },
				name: { type: "string" },
				appId: { type: "string" },
				clientSecret: { anyOf: [{ type: "string" }, { oneOf: [
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "env"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: {
								type: "string",
								pattern: "^[A-Z][A-Z0-9_]{0,127}$"
							}
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					},
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "file"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: { type: "string" }
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					},
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "exec"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: { type: "string" }
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					}
				] }] },
				clientSecretFile: { type: "string" },
				allowFrom: {
					type: "array",
					items: { anyOf: [{ type: "string" }, { type: "number" }] }
				},
				systemPrompt: { type: "string" },
				markdownSupport: { type: "boolean" },
				voiceDirectUploadFormats: {
					type: "array",
					items: { type: "string" }
				},
				audioFormatPolicy: {
					type: "object",
					properties: {
						sttDirectFormats: {
							type: "array",
							items: { type: "string" }
						},
						uploadDirectFormats: {
							type: "array",
							items: { type: "string" }
						},
						transcodeEnabled: { type: "boolean" }
					},
					additionalProperties: false
				},
				urlDirectUpload: { type: "boolean" },
				upgradeUrl: { type: "string" },
				upgradeMode: {
					type: "string",
					enum: ["doc", "hot-reload"]
				},
				tts: {
					type: "object",
					properties: {
						enabled: { type: "boolean" },
						provider: { type: "string" },
						baseUrl: { type: "string" },
						apiKey: { type: "string" },
						model: { type: "string" },
						voice: { type: "string" },
						authStyle: {
							type: "string",
							enum: ["bearer", "api-key"]
						},
						queryParams: {
							type: "object",
							propertyNames: { type: "string" },
							additionalProperties: { type: "string" }
						},
						speed: { type: "number" }
					},
					additionalProperties: false
				},
				stt: {
					type: "object",
					properties: {
						enabled: { type: "boolean" },
						provider: { type: "string" },
						baseUrl: { type: "string" },
						apiKey: { type: "string" },
						model: { type: "string" }
					},
					additionalProperties: false
				},
				accounts: {
					type: "object",
					properties: {},
					additionalProperties: {
						type: "object",
						properties: {
							enabled: { type: "boolean" },
							name: { type: "string" },
							appId: { type: "string" },
							clientSecret: { anyOf: [{ type: "string" }, { oneOf: [
								{
									type: "object",
									properties: {
										source: {
											type: "string",
											const: "env"
										},
										provider: {
											type: "string",
											pattern: "^[a-z][a-z0-9_-]{0,63}$"
										},
										id: {
											type: "string",
											pattern: "^[A-Z][A-Z0-9_]{0,127}$"
										}
									},
									required: [
										"source",
										"provider",
										"id"
									],
									additionalProperties: false
								},
								{
									type: "object",
									properties: {
										source: {
											type: "string",
											const: "file"
										},
										provider: {
											type: "string",
											pattern: "^[a-z][a-z0-9_-]{0,63}$"
										},
										id: { type: "string" }
									},
									required: [
										"source",
										"provider",
										"id"
									],
									additionalProperties: false
								},
								{
									type: "object",
									properties: {
										source: {
											type: "string",
											const: "exec"
										},
										provider: {
											type: "string",
											pattern: "^[a-z][a-z0-9_-]{0,63}$"
										},
										id: { type: "string" }
									},
									required: [
										"source",
										"provider",
										"id"
									],
									additionalProperties: false
								}
							] }] },
							clientSecretFile: { type: "string" },
							allowFrom: {
								type: "array",
								items: { anyOf: [{ type: "string" }, { type: "number" }] }
							},
							systemPrompt: { type: "string" },
							markdownSupport: { type: "boolean" },
							voiceDirectUploadFormats: {
								type: "array",
								items: { type: "string" }
							},
							audioFormatPolicy: {
								type: "object",
								properties: {
									sttDirectFormats: {
										type: "array",
										items: { type: "string" }
									},
									uploadDirectFormats: {
										type: "array",
										items: { type: "string" }
									},
									transcodeEnabled: { type: "boolean" }
								},
								additionalProperties: false
							},
							urlDirectUpload: { type: "boolean" },
							upgradeUrl: { type: "string" },
							upgradeMode: {
								type: "string",
								enum: ["doc", "hot-reload"]
							}
						},
						additionalProperties: false
					}
				},
				defaultAccount: { type: "string" }
			},
			additionalProperties: false
		}
	},
	{
		pluginId: "signal",
		channelId: "signal",
		label: "Signal",
		description: "signal-cli linked device; more setup (David Reagans: \"Hop on Discord.\").",
		schema: {
			$schema: "http://json-schema.org/draft-07/schema#",
			type: "object",
			properties: {
				name: { type: "string" },
				capabilities: {
					type: "array",
					items: { type: "string" }
				},
				markdown: {
					type: "object",
					properties: { tables: {
						type: "string",
						enum: [
							"off",
							"bullets",
							"code",
							"block"
						]
					} },
					additionalProperties: false
				},
				enabled: { type: "boolean" },
				configWrites: { type: "boolean" },
				account: { type: "string" },
				accountUuid: { type: "string" },
				httpUrl: { type: "string" },
				httpHost: { type: "string" },
				httpPort: {
					type: "integer",
					exclusiveMinimum: 0,
					maximum: 9007199254740991
				},
				cliPath: { type: "string" },
				autoStart: { type: "boolean" },
				startupTimeoutMs: {
					type: "integer",
					minimum: 1e3,
					maximum: 12e4
				},
				receiveMode: { anyOf: [{
					type: "string",
					const: "on-start"
				}, {
					type: "string",
					const: "manual"
				}] },
				ignoreAttachments: { type: "boolean" },
				ignoreStories: { type: "boolean" },
				sendReadReceipts: { type: "boolean" },
				dmPolicy: {
					default: "pairing",
					type: "string",
					enum: [
						"pairing",
						"allowlist",
						"open",
						"disabled"
					]
				},
				allowFrom: {
					type: "array",
					items: { anyOf: [{ type: "string" }, { type: "number" }] }
				},
				defaultTo: { type: "string" },
				groupAllowFrom: {
					type: "array",
					items: { anyOf: [{ type: "string" }, { type: "number" }] }
				},
				groupPolicy: {
					default: "allowlist",
					type: "string",
					enum: [
						"open",
						"disabled",
						"allowlist"
					]
				},
				groups: {
					type: "object",
					propertyNames: { type: "string" },
					additionalProperties: {
						type: "object",
						properties: {
							requireMention: { type: "boolean" },
							tools: {
								type: "object",
								properties: {
									allow: {
										type: "array",
										items: { type: "string" }
									},
									alsoAllow: {
										type: "array",
										items: { type: "string" }
									},
									deny: {
										type: "array",
										items: { type: "string" }
									}
								},
								additionalProperties: false
							},
							toolsBySender: {
								type: "object",
								propertyNames: { type: "string" },
								additionalProperties: {
									type: "object",
									properties: {
										allow: {
											type: "array",
											items: { type: "string" }
										},
										alsoAllow: {
											type: "array",
											items: { type: "string" }
										},
										deny: {
											type: "array",
											items: { type: "string" }
										}
									},
									additionalProperties: false
								}
							}
						},
						additionalProperties: false
					}
				},
				historyLimit: {
					type: "integer",
					minimum: 0,
					maximum: 9007199254740991
				},
				dmHistoryLimit: {
					type: "integer",
					minimum: 0,
					maximum: 9007199254740991
				},
				dms: {
					type: "object",
					propertyNames: { type: "string" },
					additionalProperties: {
						type: "object",
						properties: { historyLimit: {
							type: "integer",
							minimum: 0,
							maximum: 9007199254740991
						} },
						additionalProperties: false
					}
				},
				textChunkLimit: {
					type: "integer",
					exclusiveMinimum: 0,
					maximum: 9007199254740991
				},
				chunkMode: {
					type: "string",
					enum: ["length", "newline"]
				},
				blockStreaming: { type: "boolean" },
				blockStreamingCoalesce: {
					type: "object",
					properties: {
						minChars: {
							type: "integer",
							exclusiveMinimum: 0,
							maximum: 9007199254740991
						},
						maxChars: {
							type: "integer",
							exclusiveMinimum: 0,
							maximum: 9007199254740991
						},
						idleMs: {
							type: "integer",
							minimum: 0,
							maximum: 9007199254740991
						}
					},
					additionalProperties: false
				},
				mediaMaxMb: {
					type: "integer",
					exclusiveMinimum: 0,
					maximum: 9007199254740991
				},
				reactionNotifications: {
					type: "string",
					enum: [
						"off",
						"own",
						"all",
						"allowlist"
					]
				},
				reactionAllowlist: {
					type: "array",
					items: { anyOf: [{ type: "string" }, { type: "number" }] }
				},
				actions: {
					type: "object",
					properties: { reactions: { type: "boolean" } },
					additionalProperties: false
				},
				reactionLevel: {
					type: "string",
					enum: [
						"off",
						"ack",
						"minimal",
						"extensive"
					]
				},
				heartbeat: {
					type: "object",
					properties: {
						showOk: { type: "boolean" },
						showAlerts: { type: "boolean" },
						useIndicator: { type: "boolean" }
					},
					additionalProperties: false
				},
				healthMonitor: {
					type: "object",
					properties: { enabled: { type: "boolean" } },
					additionalProperties: false
				},
				responsePrefix: { type: "string" },
				accounts: {
					type: "object",
					propertyNames: { type: "string" },
					additionalProperties: {
						type: "object",
						properties: {
							name: { type: "string" },
							capabilities: {
								type: "array",
								items: { type: "string" }
							},
							markdown: {
								type: "object",
								properties: { tables: {
									type: "string",
									enum: [
										"off",
										"bullets",
										"code",
										"block"
									]
								} },
								additionalProperties: false
							},
							enabled: { type: "boolean" },
							configWrites: { type: "boolean" },
							account: { type: "string" },
							accountUuid: { type: "string" },
							httpUrl: { type: "string" },
							httpHost: { type: "string" },
							httpPort: {
								type: "integer",
								exclusiveMinimum: 0,
								maximum: 9007199254740991
							},
							cliPath: { type: "string" },
							autoStart: { type: "boolean" },
							startupTimeoutMs: {
								type: "integer",
								minimum: 1e3,
								maximum: 12e4
							},
							receiveMode: { anyOf: [{
								type: "string",
								const: "on-start"
							}, {
								type: "string",
								const: "manual"
							}] },
							ignoreAttachments: { type: "boolean" },
							ignoreStories: { type: "boolean" },
							sendReadReceipts: { type: "boolean" },
							dmPolicy: {
								default: "pairing",
								type: "string",
								enum: [
									"pairing",
									"allowlist",
									"open",
									"disabled"
								]
							},
							allowFrom: {
								type: "array",
								items: { anyOf: [{ type: "string" }, { type: "number" }] }
							},
							defaultTo: { type: "string" },
							groupAllowFrom: {
								type: "array",
								items: { anyOf: [{ type: "string" }, { type: "number" }] }
							},
							groupPolicy: {
								default: "allowlist",
								type: "string",
								enum: [
									"open",
									"disabled",
									"allowlist"
								]
							},
							groups: {
								type: "object",
								propertyNames: { type: "string" },
								additionalProperties: {
									type: "object",
									properties: {
										requireMention: { type: "boolean" },
										tools: {
											type: "object",
											properties: {
												allow: {
													type: "array",
													items: { type: "string" }
												},
												alsoAllow: {
													type: "array",
													items: { type: "string" }
												},
												deny: {
													type: "array",
													items: { type: "string" }
												}
											},
											additionalProperties: false
										},
										toolsBySender: {
											type: "object",
											propertyNames: { type: "string" },
											additionalProperties: {
												type: "object",
												properties: {
													allow: {
														type: "array",
														items: { type: "string" }
													},
													alsoAllow: {
														type: "array",
														items: { type: "string" }
													},
													deny: {
														type: "array",
														items: { type: "string" }
													}
												},
												additionalProperties: false
											}
										}
									},
									additionalProperties: false
								}
							},
							historyLimit: {
								type: "integer",
								minimum: 0,
								maximum: 9007199254740991
							},
							dmHistoryLimit: {
								type: "integer",
								minimum: 0,
								maximum: 9007199254740991
							},
							dms: {
								type: "object",
								propertyNames: { type: "string" },
								additionalProperties: {
									type: "object",
									properties: { historyLimit: {
										type: "integer",
										minimum: 0,
										maximum: 9007199254740991
									} },
									additionalProperties: false
								}
							},
							textChunkLimit: {
								type: "integer",
								exclusiveMinimum: 0,
								maximum: 9007199254740991
							},
							chunkMode: {
								type: "string",
								enum: ["length", "newline"]
							},
							blockStreaming: { type: "boolean" },
							blockStreamingCoalesce: {
								type: "object",
								properties: {
									minChars: {
										type: "integer",
										exclusiveMinimum: 0,
										maximum: 9007199254740991
									},
									maxChars: {
										type: "integer",
										exclusiveMinimum: 0,
										maximum: 9007199254740991
									},
									idleMs: {
										type: "integer",
										minimum: 0,
										maximum: 9007199254740991
									}
								},
								additionalProperties: false
							},
							mediaMaxMb: {
								type: "integer",
								exclusiveMinimum: 0,
								maximum: 9007199254740991
							},
							reactionNotifications: {
								type: "string",
								enum: [
									"off",
									"own",
									"all",
									"allowlist"
								]
							},
							reactionAllowlist: {
								type: "array",
								items: { anyOf: [{ type: "string" }, { type: "number" }] }
							},
							actions: {
								type: "object",
								properties: { reactions: { type: "boolean" } },
								additionalProperties: false
							},
							reactionLevel: {
								type: "string",
								enum: [
									"off",
									"ack",
									"minimal",
									"extensive"
								]
							},
							heartbeat: {
								type: "object",
								properties: {
									showOk: { type: "boolean" },
									showAlerts: { type: "boolean" },
									useIndicator: { type: "boolean" }
								},
								additionalProperties: false
							},
							healthMonitor: {
								type: "object",
								properties: { enabled: { type: "boolean" } },
								additionalProperties: false
							},
							responsePrefix: { type: "string" }
						},
						required: ["dmPolicy", "groupPolicy"],
						additionalProperties: false
					}
				},
				defaultAccount: { type: "string" }
			},
			required: ["dmPolicy", "groupPolicy"],
			additionalProperties: false
		},
		uiHints: {
			"": {
				label: "Signal",
				help: "Signal channel provider configuration including account identity and DM policy behavior. Keep account mapping explicit so routing remains stable across multi-device setups."
			},
			dmPolicy: {
				label: "Signal DM Policy",
				help: "Direct message access control (\"pairing\" recommended). \"open\" requires channels.signal.allowFrom=[\"*\"]."
			},
			configWrites: {
				label: "Signal Config Writes",
				help: "Allow Signal to write config in response to channel events/commands (default: true)."
			},
			account: {
				label: "Signal Account",
				help: "Signal account identifier (phone/number handle) used to bind this channel config to a specific Signal identity. Keep this aligned with your linked device/session state."
			}
		}
	},
	{
		pluginId: "slack",
		channelId: "slack",
		label: "Slack",
		description: "supported (Socket Mode).",
		schema: {
			$schema: "http://json-schema.org/draft-07/schema#",
			type: "object",
			properties: {
				name: { type: "string" },
				mode: {
					default: "socket",
					type: "string",
					enum: ["socket", "http"]
				},
				signingSecret: { anyOf: [{ type: "string" }, { oneOf: [
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "env"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: {
								type: "string",
								pattern: "^[A-Z][A-Z0-9_]{0,127}$"
							}
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					},
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "file"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: { type: "string" }
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					},
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "exec"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: { type: "string" }
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					}
				] }] },
				webhookPath: {
					default: "/slack/events",
					type: "string"
				},
				capabilities: { anyOf: [{
					type: "array",
					items: { type: "string" }
				}, {
					type: "object",
					properties: { interactiveReplies: { type: "boolean" } },
					additionalProperties: false
				}] },
				execApprovals: {
					type: "object",
					properties: {
						enabled: { type: "boolean" },
						approvers: {
							type: "array",
							items: { anyOf: [{ type: "string" }, { type: "number" }] }
						},
						agentFilter: {
							type: "array",
							items: { type: "string" }
						},
						sessionFilter: {
							type: "array",
							items: { type: "string" }
						},
						target: {
							type: "string",
							enum: [
								"dm",
								"channel",
								"both"
							]
						}
					},
					additionalProperties: false
				},
				markdown: {
					type: "object",
					properties: { tables: {
						type: "string",
						enum: [
							"off",
							"bullets",
							"code",
							"block"
						]
					} },
					additionalProperties: false
				},
				enabled: { type: "boolean" },
				commands: {
					type: "object",
					properties: {
						native: { anyOf: [{ type: "boolean" }, {
							type: "string",
							const: "auto"
						}] },
						nativeSkills: { anyOf: [{ type: "boolean" }, {
							type: "string",
							const: "auto"
						}] }
					},
					additionalProperties: false
				},
				configWrites: { type: "boolean" },
				botToken: { anyOf: [{ type: "string" }, { oneOf: [
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "env"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: {
								type: "string",
								pattern: "^[A-Z][A-Z0-9_]{0,127}$"
							}
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					},
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "file"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: { type: "string" }
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					},
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "exec"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: { type: "string" }
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					}
				] }] },
				appToken: { anyOf: [{ type: "string" }, { oneOf: [
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "env"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: {
								type: "string",
								pattern: "^[A-Z][A-Z0-9_]{0,127}$"
							}
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					},
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "file"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: { type: "string" }
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					},
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "exec"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: { type: "string" }
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					}
				] }] },
				userToken: { anyOf: [{ type: "string" }, { oneOf: [
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "env"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: {
								type: "string",
								pattern: "^[A-Z][A-Z0-9_]{0,127}$"
							}
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					},
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "file"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: { type: "string" }
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					},
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "exec"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: { type: "string" }
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					}
				] }] },
				userTokenReadOnly: {
					default: true,
					type: "boolean"
				},
				allowBots: { type: "boolean" },
				dangerouslyAllowNameMatching: { type: "boolean" },
				requireMention: { type: "boolean" },
				groupPolicy: {
					default: "allowlist",
					type: "string",
					enum: [
						"open",
						"disabled",
						"allowlist"
					]
				},
				historyLimit: {
					type: "integer",
					minimum: 0,
					maximum: 9007199254740991
				},
				dmHistoryLimit: {
					type: "integer",
					minimum: 0,
					maximum: 9007199254740991
				},
				dms: {
					type: "object",
					propertyNames: { type: "string" },
					additionalProperties: {
						type: "object",
						properties: { historyLimit: {
							type: "integer",
							minimum: 0,
							maximum: 9007199254740991
						} },
						additionalProperties: false
					}
				},
				textChunkLimit: {
					type: "integer",
					exclusiveMinimum: 0,
					maximum: 9007199254740991
				},
				chunkMode: {
					type: "string",
					enum: ["length", "newline"]
				},
				blockStreaming: { type: "boolean" },
				blockStreamingCoalesce: {
					type: "object",
					properties: {
						minChars: {
							type: "integer",
							exclusiveMinimum: 0,
							maximum: 9007199254740991
						},
						maxChars: {
							type: "integer",
							exclusiveMinimum: 0,
							maximum: 9007199254740991
						},
						idleMs: {
							type: "integer",
							minimum: 0,
							maximum: 9007199254740991
						}
					},
					additionalProperties: false
				},
				streaming: { anyOf: [{ type: "boolean" }, {
					type: "string",
					enum: [
						"off",
						"partial",
						"block",
						"progress"
					]
				}] },
				nativeStreaming: { type: "boolean" },
				streamMode: {
					type: "string",
					enum: [
						"replace",
						"status_final",
						"append"
					]
				},
				mediaMaxMb: {
					type: "number",
					exclusiveMinimum: 0
				},
				reactionNotifications: {
					type: "string",
					enum: [
						"off",
						"own",
						"all",
						"allowlist"
					]
				},
				reactionAllowlist: {
					type: "array",
					items: { anyOf: [{ type: "string" }, { type: "number" }] }
				},
				replyToMode: { anyOf: [
					{
						type: "string",
						const: "off"
					},
					{
						type: "string",
						const: "first"
					},
					{
						type: "string",
						const: "all"
					}
				] },
				replyToModeByChatType: {
					type: "object",
					properties: {
						direct: { anyOf: [
							{
								type: "string",
								const: "off"
							},
							{
								type: "string",
								const: "first"
							},
							{
								type: "string",
								const: "all"
							}
						] },
						group: { anyOf: [
							{
								type: "string",
								const: "off"
							},
							{
								type: "string",
								const: "first"
							},
							{
								type: "string",
								const: "all"
							}
						] },
						channel: { anyOf: [
							{
								type: "string",
								const: "off"
							},
							{
								type: "string",
								const: "first"
							},
							{
								type: "string",
								const: "all"
							}
						] }
					},
					additionalProperties: false
				},
				thread: {
					type: "object",
					properties: {
						historyScope: {
							type: "string",
							enum: ["thread", "channel"]
						},
						inheritParent: { type: "boolean" },
						initialHistoryLimit: {
							type: "integer",
							minimum: 0,
							maximum: 9007199254740991
						}
					},
					additionalProperties: false
				},
				actions: {
					type: "object",
					properties: {
						reactions: { type: "boolean" },
						messages: { type: "boolean" },
						pins: { type: "boolean" },
						search: { type: "boolean" },
						permissions: { type: "boolean" },
						memberInfo: { type: "boolean" },
						channelInfo: { type: "boolean" },
						emojiList: { type: "boolean" }
					},
					additionalProperties: false
				},
				slashCommand: {
					type: "object",
					properties: {
						enabled: { type: "boolean" },
						name: { type: "string" },
						sessionPrefix: { type: "string" },
						ephemeral: { type: "boolean" }
					},
					additionalProperties: false
				},
				dmPolicy: {
					type: "string",
					enum: [
						"pairing",
						"allowlist",
						"open",
						"disabled"
					]
				},
				allowFrom: {
					type: "array",
					items: { anyOf: [{ type: "string" }, { type: "number" }] }
				},
				defaultTo: { type: "string" },
				dm: {
					type: "object",
					properties: {
						enabled: { type: "boolean" },
						policy: {
							type: "string",
							enum: [
								"pairing",
								"allowlist",
								"open",
								"disabled"
							]
						},
						allowFrom: {
							type: "array",
							items: { anyOf: [{ type: "string" }, { type: "number" }] }
						},
						groupEnabled: { type: "boolean" },
						groupChannels: {
							type: "array",
							items: { anyOf: [{ type: "string" }, { type: "number" }] }
						},
						replyToMode: { anyOf: [
							{
								type: "string",
								const: "off"
							},
							{
								type: "string",
								const: "first"
							},
							{
								type: "string",
								const: "all"
							}
						] }
					},
					additionalProperties: false
				},
				channels: {
					type: "object",
					propertyNames: { type: "string" },
					additionalProperties: {
						type: "object",
						properties: {
							enabled: { type: "boolean" },
							allow: { type: "boolean" },
							requireMention: { type: "boolean" },
							tools: {
								type: "object",
								properties: {
									allow: {
										type: "array",
										items: { type: "string" }
									},
									alsoAllow: {
										type: "array",
										items: { type: "string" }
									},
									deny: {
										type: "array",
										items: { type: "string" }
									}
								},
								additionalProperties: false
							},
							toolsBySender: {
								type: "object",
								propertyNames: { type: "string" },
								additionalProperties: {
									type: "object",
									properties: {
										allow: {
											type: "array",
											items: { type: "string" }
										},
										alsoAllow: {
											type: "array",
											items: { type: "string" }
										},
										deny: {
											type: "array",
											items: { type: "string" }
										}
									},
									additionalProperties: false
								}
							},
							allowBots: { type: "boolean" },
							users: {
								type: "array",
								items: { anyOf: [{ type: "string" }, { type: "number" }] }
							},
							skills: {
								type: "array",
								items: { type: "string" }
							},
							systemPrompt: { type: "string" }
						},
						additionalProperties: false
					}
				},
				heartbeat: {
					type: "object",
					properties: {
						showOk: { type: "boolean" },
						showAlerts: { type: "boolean" },
						useIndicator: { type: "boolean" }
					},
					additionalProperties: false
				},
				healthMonitor: {
					type: "object",
					properties: { enabled: { type: "boolean" } },
					additionalProperties: false
				},
				responsePrefix: { type: "string" },
				ackReaction: { type: "string" },
				typingReaction: { type: "string" },
				accounts: {
					type: "object",
					propertyNames: { type: "string" },
					additionalProperties: {
						type: "object",
						properties: {
							name: { type: "string" },
							mode: {
								type: "string",
								enum: ["socket", "http"]
							},
							signingSecret: { anyOf: [{ type: "string" }, { oneOf: [
								{
									type: "object",
									properties: {
										source: {
											type: "string",
											const: "env"
										},
										provider: {
											type: "string",
											pattern: "^[a-z][a-z0-9_-]{0,63}$"
										},
										id: {
											type: "string",
											pattern: "^[A-Z][A-Z0-9_]{0,127}$"
										}
									},
									required: [
										"source",
										"provider",
										"id"
									],
									additionalProperties: false
								},
								{
									type: "object",
									properties: {
										source: {
											type: "string",
											const: "file"
										},
										provider: {
											type: "string",
											pattern: "^[a-z][a-z0-9_-]{0,63}$"
										},
										id: { type: "string" }
									},
									required: [
										"source",
										"provider",
										"id"
									],
									additionalProperties: false
								},
								{
									type: "object",
									properties: {
										source: {
											type: "string",
											const: "exec"
										},
										provider: {
											type: "string",
											pattern: "^[a-z][a-z0-9_-]{0,63}$"
										},
										id: { type: "string" }
									},
									required: [
										"source",
										"provider",
										"id"
									],
									additionalProperties: false
								}
							] }] },
							webhookPath: { type: "string" },
							capabilities: { anyOf: [{
								type: "array",
								items: { type: "string" }
							}, {
								type: "object",
								properties: { interactiveReplies: { type: "boolean" } },
								additionalProperties: false
							}] },
							execApprovals: {
								type: "object",
								properties: {
									enabled: { type: "boolean" },
									approvers: {
										type: "array",
										items: { anyOf: [{ type: "string" }, { type: "number" }] }
									},
									agentFilter: {
										type: "array",
										items: { type: "string" }
									},
									sessionFilter: {
										type: "array",
										items: { type: "string" }
									},
									target: {
										type: "string",
										enum: [
											"dm",
											"channel",
											"both"
										]
									}
								},
								additionalProperties: false
							},
							markdown: {
								type: "object",
								properties: { tables: {
									type: "string",
									enum: [
										"off",
										"bullets",
										"code",
										"block"
									]
								} },
								additionalProperties: false
							},
							enabled: { type: "boolean" },
							commands: {
								type: "object",
								properties: {
									native: { anyOf: [{ type: "boolean" }, {
										type: "string",
										const: "auto"
									}] },
									nativeSkills: { anyOf: [{ type: "boolean" }, {
										type: "string",
										const: "auto"
									}] }
								},
								additionalProperties: false
							},
							configWrites: { type: "boolean" },
							botToken: { anyOf: [{ type: "string" }, { oneOf: [
								{
									type: "object",
									properties: {
										source: {
											type: "string",
											const: "env"
										},
										provider: {
											type: "string",
											pattern: "^[a-z][a-z0-9_-]{0,63}$"
										},
										id: {
											type: "string",
											pattern: "^[A-Z][A-Z0-9_]{0,127}$"
										}
									},
									required: [
										"source",
										"provider",
										"id"
									],
									additionalProperties: false
								},
								{
									type: "object",
									properties: {
										source: {
											type: "string",
											const: "file"
										},
										provider: {
											type: "string",
											pattern: "^[a-z][a-z0-9_-]{0,63}$"
										},
										id: { type: "string" }
									},
									required: [
										"source",
										"provider",
										"id"
									],
									additionalProperties: false
								},
								{
									type: "object",
									properties: {
										source: {
											type: "string",
											const: "exec"
										},
										provider: {
											type: "string",
											pattern: "^[a-z][a-z0-9_-]{0,63}$"
										},
										id: { type: "string" }
									},
									required: [
										"source",
										"provider",
										"id"
									],
									additionalProperties: false
								}
							] }] },
							appToken: { anyOf: [{ type: "string" }, { oneOf: [
								{
									type: "object",
									properties: {
										source: {
											type: "string",
											const: "env"
										},
										provider: {
											type: "string",
											pattern: "^[a-z][a-z0-9_-]{0,63}$"
										},
										id: {
											type: "string",
											pattern: "^[A-Z][A-Z0-9_]{0,127}$"
										}
									},
									required: [
										"source",
										"provider",
										"id"
									],
									additionalProperties: false
								},
								{
									type: "object",
									properties: {
										source: {
											type: "string",
											const: "file"
										},
										provider: {
											type: "string",
											pattern: "^[a-z][a-z0-9_-]{0,63}$"
										},
										id: { type: "string" }
									},
									required: [
										"source",
										"provider",
										"id"
									],
									additionalProperties: false
								},
								{
									type: "object",
									properties: {
										source: {
											type: "string",
											const: "exec"
										},
										provider: {
											type: "string",
											pattern: "^[a-z][a-z0-9_-]{0,63}$"
										},
										id: { type: "string" }
									},
									required: [
										"source",
										"provider",
										"id"
									],
									additionalProperties: false
								}
							] }] },
							userToken: { anyOf: [{ type: "string" }, { oneOf: [
								{
									type: "object",
									properties: {
										source: {
											type: "string",
											const: "env"
										},
										provider: {
											type: "string",
											pattern: "^[a-z][a-z0-9_-]{0,63}$"
										},
										id: {
											type: "string",
											pattern: "^[A-Z][A-Z0-9_]{0,127}$"
										}
									},
									required: [
										"source",
										"provider",
										"id"
									],
									additionalProperties: false
								},
								{
									type: "object",
									properties: {
										source: {
											type: "string",
											const: "file"
										},
										provider: {
											type: "string",
											pattern: "^[a-z][a-z0-9_-]{0,63}$"
										},
										id: { type: "string" }
									},
									required: [
										"source",
										"provider",
										"id"
									],
									additionalProperties: false
								},
								{
									type: "object",
									properties: {
										source: {
											type: "string",
											const: "exec"
										},
										provider: {
											type: "string",
											pattern: "^[a-z][a-z0-9_-]{0,63}$"
										},
										id: { type: "string" }
									},
									required: [
										"source",
										"provider",
										"id"
									],
									additionalProperties: false
								}
							] }] },
							userTokenReadOnly: {
								default: true,
								type: "boolean"
							},
							allowBots: { type: "boolean" },
							dangerouslyAllowNameMatching: { type: "boolean" },
							requireMention: { type: "boolean" },
							groupPolicy: {
								type: "string",
								enum: [
									"open",
									"disabled",
									"allowlist"
								]
							},
							historyLimit: {
								type: "integer",
								minimum: 0,
								maximum: 9007199254740991
							},
							dmHistoryLimit: {
								type: "integer",
								minimum: 0,
								maximum: 9007199254740991
							},
							dms: {
								type: "object",
								propertyNames: { type: "string" },
								additionalProperties: {
									type: "object",
									properties: { historyLimit: {
										type: "integer",
										minimum: 0,
										maximum: 9007199254740991
									} },
									additionalProperties: false
								}
							},
							textChunkLimit: {
								type: "integer",
								exclusiveMinimum: 0,
								maximum: 9007199254740991
							},
							chunkMode: {
								type: "string",
								enum: ["length", "newline"]
							},
							blockStreaming: { type: "boolean" },
							blockStreamingCoalesce: {
								type: "object",
								properties: {
									minChars: {
										type: "integer",
										exclusiveMinimum: 0,
										maximum: 9007199254740991
									},
									maxChars: {
										type: "integer",
										exclusiveMinimum: 0,
										maximum: 9007199254740991
									},
									idleMs: {
										type: "integer",
										minimum: 0,
										maximum: 9007199254740991
									}
								},
								additionalProperties: false
							},
							streaming: { anyOf: [{ type: "boolean" }, {
								type: "string",
								enum: [
									"off",
									"partial",
									"block",
									"progress"
								]
							}] },
							nativeStreaming: { type: "boolean" },
							streamMode: {
								type: "string",
								enum: [
									"replace",
									"status_final",
									"append"
								]
							},
							mediaMaxMb: {
								type: "number",
								exclusiveMinimum: 0
							},
							reactionNotifications: {
								type: "string",
								enum: [
									"off",
									"own",
									"all",
									"allowlist"
								]
							},
							reactionAllowlist: {
								type: "array",
								items: { anyOf: [{ type: "string" }, { type: "number" }] }
							},
							replyToMode: { anyOf: [
								{
									type: "string",
									const: "off"
								},
								{
									type: "string",
									const: "first"
								},
								{
									type: "string",
									const: "all"
								}
							] },
							replyToModeByChatType: {
								type: "object",
								properties: {
									direct: { anyOf: [
										{
											type: "string",
											const: "off"
										},
										{
											type: "string",
											const: "first"
										},
										{
											type: "string",
											const: "all"
										}
									] },
									group: { anyOf: [
										{
											type: "string",
											const: "off"
										},
										{
											type: "string",
											const: "first"
										},
										{
											type: "string",
											const: "all"
										}
									] },
									channel: { anyOf: [
										{
											type: "string",
											const: "off"
										},
										{
											type: "string",
											const: "first"
										},
										{
											type: "string",
											const: "all"
										}
									] }
								},
								additionalProperties: false
							},
							thread: {
								type: "object",
								properties: {
									historyScope: {
										type: "string",
										enum: ["thread", "channel"]
									},
									inheritParent: { type: "boolean" },
									initialHistoryLimit: {
										type: "integer",
										minimum: 0,
										maximum: 9007199254740991
									}
								},
								additionalProperties: false
							},
							actions: {
								type: "object",
								properties: {
									reactions: { type: "boolean" },
									messages: { type: "boolean" },
									pins: { type: "boolean" },
									search: { type: "boolean" },
									permissions: { type: "boolean" },
									memberInfo: { type: "boolean" },
									channelInfo: { type: "boolean" },
									emojiList: { type: "boolean" }
								},
								additionalProperties: false
							},
							slashCommand: {
								type: "object",
								properties: {
									enabled: { type: "boolean" },
									name: { type: "string" },
									sessionPrefix: { type: "string" },
									ephemeral: { type: "boolean" }
								},
								additionalProperties: false
							},
							dmPolicy: {
								type: "string",
								enum: [
									"pairing",
									"allowlist",
									"open",
									"disabled"
								]
							},
							allowFrom: {
								type: "array",
								items: { anyOf: [{ type: "string" }, { type: "number" }] }
							},
							defaultTo: { type: "string" },
							dm: {
								type: "object",
								properties: {
									enabled: { type: "boolean" },
									policy: {
										type: "string",
										enum: [
											"pairing",
											"allowlist",
											"open",
											"disabled"
										]
									},
									allowFrom: {
										type: "array",
										items: { anyOf: [{ type: "string" }, { type: "number" }] }
									},
									groupEnabled: { type: "boolean" },
									groupChannels: {
										type: "array",
										items: { anyOf: [{ type: "string" }, { type: "number" }] }
									},
									replyToMode: { anyOf: [
										{
											type: "string",
											const: "off"
										},
										{
											type: "string",
											const: "first"
										},
										{
											type: "string",
											const: "all"
										}
									] }
								},
								additionalProperties: false
							},
							channels: {
								type: "object",
								propertyNames: { type: "string" },
								additionalProperties: {
									type: "object",
									properties: {
										enabled: { type: "boolean" },
										allow: { type: "boolean" },
										requireMention: { type: "boolean" },
										tools: {
											type: "object",
											properties: {
												allow: {
													type: "array",
													items: { type: "string" }
												},
												alsoAllow: {
													type: "array",
													items: { type: "string" }
												},
												deny: {
													type: "array",
													items: { type: "string" }
												}
											},
											additionalProperties: false
										},
										toolsBySender: {
											type: "object",
											propertyNames: { type: "string" },
											additionalProperties: {
												type: "object",
												properties: {
													allow: {
														type: "array",
														items: { type: "string" }
													},
													alsoAllow: {
														type: "array",
														items: { type: "string" }
													},
													deny: {
														type: "array",
														items: { type: "string" }
													}
												},
												additionalProperties: false
											}
										},
										allowBots: { type: "boolean" },
										users: {
											type: "array",
											items: { anyOf: [{ type: "string" }, { type: "number" }] }
										},
										skills: {
											type: "array",
											items: { type: "string" }
										},
										systemPrompt: { type: "string" }
									},
									additionalProperties: false
								}
							},
							heartbeat: {
								type: "object",
								properties: {
									showOk: { type: "boolean" },
									showAlerts: { type: "boolean" },
									useIndicator: { type: "boolean" }
								},
								additionalProperties: false
							},
							healthMonitor: {
								type: "object",
								properties: { enabled: { type: "boolean" } },
								additionalProperties: false
							},
							responsePrefix: { type: "string" },
							ackReaction: { type: "string" },
							typingReaction: { type: "string" }
						},
						required: ["userTokenReadOnly"],
						additionalProperties: false
					}
				},
				defaultAccount: { type: "string" }
			},
			required: [
				"mode",
				"webhookPath",
				"userTokenReadOnly",
				"groupPolicy"
			],
			additionalProperties: false
		},
		uiHints: {
			"": {
				label: "Slack",
				help: "Slack channel provider configuration for bot/app tokens, streaming behavior, and DM policy controls. Keep token handling and thread behavior explicit to avoid noisy workspace interactions."
			},
			"dm.policy": {
				label: "Slack DM Policy",
				help: "Direct message access control (\"pairing\" recommended). \"open\" requires channels.slack.allowFrom=[\"*\"] (legacy: channels.slack.dm.allowFrom)."
			},
			dmPolicy: {
				label: "Slack DM Policy",
				help: "Direct message access control (\"pairing\" recommended). \"open\" requires channels.slack.allowFrom=[\"*\"]."
			},
			configWrites: {
				label: "Slack Config Writes",
				help: "Allow Slack to write config in response to channel events/commands (default: true)."
			},
			"commands.native": {
				label: "Slack Native Commands",
				help: "Override native commands for Slack (bool or \"auto\")."
			},
			"commands.nativeSkills": {
				label: "Slack Native Skill Commands",
				help: "Override native skill commands for Slack (bool or \"auto\")."
			},
			allowBots: {
				label: "Slack Allow Bot Messages",
				help: "Allow bot-authored messages to trigger Slack replies (default: false)."
			},
			botToken: {
				label: "Slack Bot Token",
				help: "Slack bot token used for standard chat actions in the configured workspace. Keep this credential scoped and rotate if workspace app permissions change."
			},
			appToken: {
				label: "Slack App Token",
				help: "Slack app-level token used for Socket Mode connections and event transport when enabled. Use least-privilege app scopes and store this token as a secret."
			},
			userToken: {
				label: "Slack User Token",
				help: "Optional Slack user token for workflows requiring user-context API access beyond bot permissions. Use sparingly and audit scopes because this token can carry broader authority."
			},
			userTokenReadOnly: {
				label: "Slack User Token Read Only",
				help: "When true, treat configured Slack user token usage as read-only helper behavior where possible. Keep enabled if you only need supplemental reads without user-context writes."
			},
			"capabilities.interactiveReplies": {
				label: "Slack Interactive Replies",
				help: "Enable agent-authored Slack interactive reply directives (`[[slack_buttons: ...]]`, `[[slack_select: ...]]`). Default: false."
			},
			execApprovals: {
				label: "Slack Exec Approvals",
				help: "Slack-native exec approval routing and approver authorization. When unset, OpenClaw auto-enables DM-first native approvals if approvers can be resolved for this workspace account."
			},
			"execApprovals.enabled": {
				label: "Slack Exec Approvals Enabled",
				help: "Controls Slack native exec approvals for this account: unset or \"auto\" enables DM-first native approvals when approvers can be resolved, true forces native approvals on, and false disables them."
			},
			"execApprovals.approvers": {
				label: "Slack Exec Approval Approvers",
				help: "Slack user IDs allowed to approve exec requests for this workspace account. Use Slack user IDs or user targets such as `U123`, `user:U123`, or `<@U123>`. If you leave this unset, OpenClaw falls back to commands.ownerAllowFrom when possible."
			},
			"execApprovals.agentFilter": {
				label: "Slack Exec Approval Agent Filter",
				help: "Optional allowlist of agent IDs eligible for Slack exec approvals, for example `[\"main\", \"ops-agent\"]`. Use this to keep approval prompts scoped to the agents you actually operate from Slack."
			},
			"execApprovals.sessionFilter": {
				label: "Slack Exec Approval Session Filter",
				help: "Optional session-key filters matched as substring or regex-style patterns before Slack approval routing is used. Use narrow patterns so Slack approvals only appear for intended sessions."
			},
			"execApprovals.target": {
				label: "Slack Exec Approval Target",
				help: "Controls where Slack approval prompts are sent: \"dm\" sends to approver DMs (default), \"channel\" sends to the originating Slack chat/thread, and \"both\" sends to both. Channel delivery exposes the command text to the chat, so only use it in trusted channels."
			},
			streaming: {
				label: "Slack Streaming Mode",
				help: "Unified Slack stream preview mode: \"off\" | \"partial\" | \"block\" | \"progress\". Legacy boolean/streamMode keys are auto-mapped."
			},
			nativeStreaming: {
				label: "Slack Native Streaming",
				help: "Enable native Slack text streaming (chat.startStream/chat.appendStream/chat.stopStream) when channels.slack.streaming is partial (default: true)."
			},
			streamMode: {
				label: "Slack Stream Mode (Legacy)",
				help: "Legacy Slack preview mode alias (replace | status_final | append); auto-migrated to channels.slack.streaming."
			},
			"thread.historyScope": {
				label: "Slack Thread History Scope",
				help: "Scope for Slack thread history context (\"thread\" isolates per thread; \"channel\" reuses channel history)."
			},
			"thread.inheritParent": {
				label: "Slack Thread Parent Inheritance",
				help: "If true, Slack thread sessions inherit the parent channel transcript (default: false)."
			},
			"thread.initialHistoryLimit": {
				label: "Slack Thread Initial History Limit",
				help: "Maximum number of existing Slack thread messages to fetch when starting a new thread session (default: 20, set to 0 to disable)."
			}
		}
	},
	{
		pluginId: "synology-chat",
		channelId: "synology-chat",
		label: "Synology Chat",
		description: "Connect your Synology NAS Chat to OpenClaw with full agent capabilities.",
		schema: {
			$schema: "http://json-schema.org/draft-07/schema#",
			type: "object",
			properties: {
				dangerouslyAllowNameMatching: { type: "boolean" },
				dangerouslyAllowInheritedWebhookPath: { type: "boolean" }
			},
			additionalProperties: {}
		}
	},
	{
		pluginId: "telegram",
		channelId: "telegram",
		label: "Telegram",
		description: "simplest way to get started — register a bot with @BotFather and get going.",
		schema: {
			$schema: "http://json-schema.org/draft-07/schema#",
			type: "object",
			properties: {
				name: { type: "string" },
				capabilities: { anyOf: [{
					type: "array",
					items: { type: "string" }
				}, {
					type: "object",
					properties: { inlineButtons: {
						type: "string",
						enum: [
							"off",
							"dm",
							"group",
							"all",
							"allowlist"
						]
					} },
					additionalProperties: false
				}] },
				execApprovals: {
					type: "object",
					properties: {
						enabled: { type: "boolean" },
						approvers: {
							type: "array",
							items: { anyOf: [{ type: "string" }, { type: "number" }] }
						},
						agentFilter: {
							type: "array",
							items: { type: "string" }
						},
						sessionFilter: {
							type: "array",
							items: { type: "string" }
						},
						target: {
							type: "string",
							enum: [
								"dm",
								"channel",
								"both"
							]
						}
					},
					additionalProperties: false
				},
				markdown: {
					type: "object",
					properties: { tables: {
						type: "string",
						enum: [
							"off",
							"bullets",
							"code",
							"block"
						]
					} },
					additionalProperties: false
				},
				enabled: { type: "boolean" },
				commands: {
					type: "object",
					properties: {
						native: { anyOf: [{ type: "boolean" }, {
							type: "string",
							const: "auto"
						}] },
						nativeSkills: { anyOf: [{ type: "boolean" }, {
							type: "string",
							const: "auto"
						}] }
					},
					additionalProperties: false
				},
				customCommands: {
					type: "array",
					items: {
						type: "object",
						properties: {
							command: { type: "string" },
							description: { type: "string" }
						},
						required: ["command", "description"],
						additionalProperties: false
					}
				},
				configWrites: { type: "boolean" },
				dmPolicy: {
					default: "pairing",
					type: "string",
					enum: [
						"pairing",
						"allowlist",
						"open",
						"disabled"
					]
				},
				botToken: { anyOf: [{ type: "string" }, { oneOf: [
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "env"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: {
								type: "string",
								pattern: "^[A-Z][A-Z0-9_]{0,127}$"
							}
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					},
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "file"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: { type: "string" }
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					},
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "exec"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: { type: "string" }
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					}
				] }] },
				tokenFile: { type: "string" },
				replyToMode: { anyOf: [
					{
						type: "string",
						const: "off"
					},
					{
						type: "string",
						const: "first"
					},
					{
						type: "string",
						const: "all"
					}
				] },
				groups: {
					type: "object",
					propertyNames: { type: "string" },
					additionalProperties: {
						type: "object",
						properties: {
							requireMention: { type: "boolean" },
							disableAudioPreflight: { type: "boolean" },
							groupPolicy: {
								type: "string",
								enum: [
									"open",
									"disabled",
									"allowlist"
								]
							},
							tools: {
								type: "object",
								properties: {
									allow: {
										type: "array",
										items: { type: "string" }
									},
									alsoAllow: {
										type: "array",
										items: { type: "string" }
									},
									deny: {
										type: "array",
										items: { type: "string" }
									}
								},
								additionalProperties: false
							},
							toolsBySender: {
								type: "object",
								propertyNames: { type: "string" },
								additionalProperties: {
									type: "object",
									properties: {
										allow: {
											type: "array",
											items: { type: "string" }
										},
										alsoAllow: {
											type: "array",
											items: { type: "string" }
										},
										deny: {
											type: "array",
											items: { type: "string" }
										}
									},
									additionalProperties: false
								}
							},
							skills: {
								type: "array",
								items: { type: "string" }
							},
							enabled: { type: "boolean" },
							allowFrom: {
								type: "array",
								items: { anyOf: [{ type: "string" }, { type: "number" }] }
							},
							systemPrompt: { type: "string" },
							topics: {
								type: "object",
								propertyNames: { type: "string" },
								additionalProperties: {
									type: "object",
									properties: {
										requireMention: { type: "boolean" },
										disableAudioPreflight: { type: "boolean" },
										groupPolicy: {
											type: "string",
											enum: [
												"open",
												"disabled",
												"allowlist"
											]
										},
										skills: {
											type: "array",
											items: { type: "string" }
										},
										enabled: { type: "boolean" },
										allowFrom: {
											type: "array",
											items: { anyOf: [{ type: "string" }, { type: "number" }] }
										},
										systemPrompt: { type: "string" },
										agentId: { type: "string" },
										errorPolicy: {
											type: "string",
											enum: [
												"always",
												"once",
												"silent"
											]
										},
										errorCooldownMs: {
											type: "integer",
											minimum: 0,
											maximum: 9007199254740991
										}
									},
									additionalProperties: false
								}
							},
							errorPolicy: {
								type: "string",
								enum: [
									"always",
									"once",
									"silent"
								]
							},
							errorCooldownMs: {
								type: "integer",
								minimum: 0,
								maximum: 9007199254740991
							}
						},
						additionalProperties: false
					}
				},
				allowFrom: {
					type: "array",
					items: { anyOf: [{ type: "string" }, { type: "number" }] }
				},
				defaultTo: { anyOf: [{ type: "string" }, { type: "number" }] },
				groupAllowFrom: {
					type: "array",
					items: { anyOf: [{ type: "string" }, { type: "number" }] }
				},
				groupPolicy: {
					default: "allowlist",
					type: "string",
					enum: [
						"open",
						"disabled",
						"allowlist"
					]
				},
				historyLimit: {
					type: "integer",
					minimum: 0,
					maximum: 9007199254740991
				},
				dmHistoryLimit: {
					type: "integer",
					minimum: 0,
					maximum: 9007199254740991
				},
				dms: {
					type: "object",
					propertyNames: { type: "string" },
					additionalProperties: {
						type: "object",
						properties: { historyLimit: {
							type: "integer",
							minimum: 0,
							maximum: 9007199254740991
						} },
						additionalProperties: false
					}
				},
				direct: {
					type: "object",
					propertyNames: { type: "string" },
					additionalProperties: {
						type: "object",
						properties: {
							dmPolicy: {
								type: "string",
								enum: [
									"pairing",
									"allowlist",
									"open",
									"disabled"
								]
							},
							tools: {
								type: "object",
								properties: {
									allow: {
										type: "array",
										items: { type: "string" }
									},
									alsoAllow: {
										type: "array",
										items: { type: "string" }
									},
									deny: {
										type: "array",
										items: { type: "string" }
									}
								},
								additionalProperties: false
							},
							toolsBySender: {
								type: "object",
								propertyNames: { type: "string" },
								additionalProperties: {
									type: "object",
									properties: {
										allow: {
											type: "array",
											items: { type: "string" }
										},
										alsoAllow: {
											type: "array",
											items: { type: "string" }
										},
										deny: {
											type: "array",
											items: { type: "string" }
										}
									},
									additionalProperties: false
								}
							},
							skills: {
								type: "array",
								items: { type: "string" }
							},
							enabled: { type: "boolean" },
							allowFrom: {
								type: "array",
								items: { anyOf: [{ type: "string" }, { type: "number" }] }
							},
							systemPrompt: { type: "string" },
							topics: {
								type: "object",
								propertyNames: { type: "string" },
								additionalProperties: {
									type: "object",
									properties: {
										requireMention: { type: "boolean" },
										disableAudioPreflight: { type: "boolean" },
										groupPolicy: {
											type: "string",
											enum: [
												"open",
												"disabled",
												"allowlist"
											]
										},
										skills: {
											type: "array",
											items: { type: "string" }
										},
										enabled: { type: "boolean" },
										allowFrom: {
											type: "array",
											items: { anyOf: [{ type: "string" }, { type: "number" }] }
										},
										systemPrompt: { type: "string" },
										agentId: { type: "string" },
										errorPolicy: {
											type: "string",
											enum: [
												"always",
												"once",
												"silent"
											]
										},
										errorCooldownMs: {
											type: "integer",
											minimum: 0,
											maximum: 9007199254740991
										}
									},
									additionalProperties: false
								}
							},
							errorPolicy: {
								type: "string",
								enum: [
									"always",
									"once",
									"silent"
								]
							},
							errorCooldownMs: {
								type: "integer",
								minimum: 0,
								maximum: 9007199254740991
							},
							requireTopic: { type: "boolean" },
							autoTopicLabel: { anyOf: [{ type: "boolean" }, {
								type: "object",
								properties: {
									enabled: { type: "boolean" },
									prompt: { type: "string" }
								},
								additionalProperties: false
							}] }
						},
						additionalProperties: false
					}
				},
				textChunkLimit: {
					type: "integer",
					exclusiveMinimum: 0,
					maximum: 9007199254740991
				},
				chunkMode: {
					type: "string",
					enum: ["length", "newline"]
				},
				streaming: { anyOf: [{ type: "boolean" }, {
					type: "string",
					enum: [
						"off",
						"partial",
						"block",
						"progress"
					]
				}] },
				blockStreaming: { type: "boolean" },
				draftChunk: {
					type: "object",
					properties: {
						minChars: {
							type: "integer",
							exclusiveMinimum: 0,
							maximum: 9007199254740991
						},
						maxChars: {
							type: "integer",
							exclusiveMinimum: 0,
							maximum: 9007199254740991
						},
						breakPreference: { anyOf: [
							{
								type: "string",
								const: "paragraph"
							},
							{
								type: "string",
								const: "newline"
							},
							{
								type: "string",
								const: "sentence"
							}
						] }
					},
					additionalProperties: false
				},
				blockStreamingCoalesce: {
					type: "object",
					properties: {
						minChars: {
							type: "integer",
							exclusiveMinimum: 0,
							maximum: 9007199254740991
						},
						maxChars: {
							type: "integer",
							exclusiveMinimum: 0,
							maximum: 9007199254740991
						},
						idleMs: {
							type: "integer",
							minimum: 0,
							maximum: 9007199254740991
						}
					},
					additionalProperties: false
				},
				streamMode: {
					type: "string",
					enum: [
						"off",
						"partial",
						"block"
					]
				},
				mediaMaxMb: {
					type: "number",
					exclusiveMinimum: 0
				},
				timeoutSeconds: {
					type: "integer",
					exclusiveMinimum: 0,
					maximum: 9007199254740991
				},
				retry: {
					type: "object",
					properties: {
						attempts: {
							type: "integer",
							minimum: 1,
							maximum: 9007199254740991
						},
						minDelayMs: {
							type: "integer",
							minimum: 0,
							maximum: 9007199254740991
						},
						maxDelayMs: {
							type: "integer",
							minimum: 0,
							maximum: 9007199254740991
						},
						jitter: {
							type: "number",
							minimum: 0,
							maximum: 1
						}
					},
					additionalProperties: false
				},
				network: {
					type: "object",
					properties: {
						autoSelectFamily: { type: "boolean" },
						dnsResultOrder: {
							type: "string",
							enum: ["ipv4first", "verbatim"]
						}
					},
					additionalProperties: false
				},
				proxy: { type: "string" },
				webhookUrl: {
					description: "Public HTTPS webhook URL registered with Telegram for inbound updates. This must be internet-reachable and requires channels.telegram.webhookSecret.",
					type: "string"
				},
				webhookSecret: {
					description: "Secret token sent to Telegram during webhook registration and verified on inbound webhook requests. Telegram returns this value for verification; this is not the gateway auth token and not the bot token.",
					anyOf: [{ type: "string" }, { oneOf: [
						{
							type: "object",
							properties: {
								source: {
									type: "string",
									const: "env"
								},
								provider: {
									type: "string",
									pattern: "^[a-z][a-z0-9_-]{0,63}$"
								},
								id: {
									type: "string",
									pattern: "^[A-Z][A-Z0-9_]{0,127}$"
								}
							},
							required: [
								"source",
								"provider",
								"id"
							],
							additionalProperties: false
						},
						{
							type: "object",
							properties: {
								source: {
									type: "string",
									const: "file"
								},
								provider: {
									type: "string",
									pattern: "^[a-z][a-z0-9_-]{0,63}$"
								},
								id: { type: "string" }
							},
							required: [
								"source",
								"provider",
								"id"
							],
							additionalProperties: false
						},
						{
							type: "object",
							properties: {
								source: {
									type: "string",
									const: "exec"
								},
								provider: {
									type: "string",
									pattern: "^[a-z][a-z0-9_-]{0,63}$"
								},
								id: { type: "string" }
							},
							required: [
								"source",
								"provider",
								"id"
							],
							additionalProperties: false
						}
					] }]
				},
				webhookPath: {
					description: "Local webhook route path served by the gateway listener. Defaults to /telegram-webhook.",
					type: "string"
				},
				webhookHost: {
					description: "Local bind host for the webhook listener. Defaults to 127.0.0.1; keep loopback unless you intentionally expose direct ingress.",
					type: "string"
				},
				webhookPort: {
					description: "Local bind port for the webhook listener. Defaults to 8787; set to 0 to let the OS assign an ephemeral port.",
					type: "integer",
					minimum: 0,
					maximum: 9007199254740991
				},
				webhookCertPath: {
					description: "Path to the self-signed certificate (PEM) to upload to Telegram during webhook registration. Required for self-signed certs (direct IP or no domain).",
					type: "string"
				},
				actions: {
					type: "object",
					properties: {
						reactions: { type: "boolean" },
						sendMessage: { type: "boolean" },
						poll: { type: "boolean" },
						deleteMessage: { type: "boolean" },
						editMessage: { type: "boolean" },
						sticker: { type: "boolean" },
						createForumTopic: { type: "boolean" },
						editForumTopic: { type: "boolean" }
					},
					additionalProperties: false
				},
				threadBindings: {
					type: "object",
					properties: {
						enabled: { type: "boolean" },
						idleHours: {
							type: "number",
							minimum: 0
						},
						maxAgeHours: {
							type: "number",
							minimum: 0
						},
						spawnSubagentSessions: { type: "boolean" },
						spawnAcpSessions: { type: "boolean" }
					},
					additionalProperties: false
				},
				reactionNotifications: {
					type: "string",
					enum: [
						"off",
						"own",
						"all"
					]
				},
				reactionLevel: {
					type: "string",
					enum: [
						"off",
						"ack",
						"minimal",
						"extensive"
					]
				},
				heartbeat: {
					type: "object",
					properties: {
						showOk: { type: "boolean" },
						showAlerts: { type: "boolean" },
						useIndicator: { type: "boolean" }
					},
					additionalProperties: false
				},
				healthMonitor: {
					type: "object",
					properties: { enabled: { type: "boolean" } },
					additionalProperties: false
				},
				linkPreview: { type: "boolean" },
				silentErrorReplies: { type: "boolean" },
				responsePrefix: { type: "string" },
				ackReaction: { type: "string" },
				errorPolicy: {
					type: "string",
					enum: [
						"always",
						"once",
						"silent"
					]
				},
				errorCooldownMs: {
					type: "integer",
					minimum: 0,
					maximum: 9007199254740991
				},
				apiRoot: {
					type: "string",
					format: "uri"
				},
				autoTopicLabel: { anyOf: [{ type: "boolean" }, {
					type: "object",
					properties: {
						enabled: { type: "boolean" },
						prompt: { type: "string" }
					},
					additionalProperties: false
				}] },
				accounts: {
					type: "object",
					propertyNames: { type: "string" },
					additionalProperties: {
						type: "object",
						properties: {
							name: { type: "string" },
							capabilities: { anyOf: [{
								type: "array",
								items: { type: "string" }
							}, {
								type: "object",
								properties: { inlineButtons: {
									type: "string",
									enum: [
										"off",
										"dm",
										"group",
										"all",
										"allowlist"
									]
								} },
								additionalProperties: false
							}] },
							execApprovals: {
								type: "object",
								properties: {
									enabled: { type: "boolean" },
									approvers: {
										type: "array",
										items: { anyOf: [{ type: "string" }, { type: "number" }] }
									},
									agentFilter: {
										type: "array",
										items: { type: "string" }
									},
									sessionFilter: {
										type: "array",
										items: { type: "string" }
									},
									target: {
										type: "string",
										enum: [
											"dm",
											"channel",
											"both"
										]
									}
								},
								additionalProperties: false
							},
							markdown: {
								type: "object",
								properties: { tables: {
									type: "string",
									enum: [
										"off",
										"bullets",
										"code",
										"block"
									]
								} },
								additionalProperties: false
							},
							enabled: { type: "boolean" },
							commands: {
								type: "object",
								properties: {
									native: { anyOf: [{ type: "boolean" }, {
										type: "string",
										const: "auto"
									}] },
									nativeSkills: { anyOf: [{ type: "boolean" }, {
										type: "string",
										const: "auto"
									}] }
								},
								additionalProperties: false
							},
							customCommands: {
								type: "array",
								items: {
									type: "object",
									properties: {
										command: { type: "string" },
										description: { type: "string" }
									},
									required: ["command", "description"],
									additionalProperties: false
								}
							},
							configWrites: { type: "boolean" },
							dmPolicy: {
								default: "pairing",
								type: "string",
								enum: [
									"pairing",
									"allowlist",
									"open",
									"disabled"
								]
							},
							botToken: { anyOf: [{ type: "string" }, { oneOf: [
								{
									type: "object",
									properties: {
										source: {
											type: "string",
											const: "env"
										},
										provider: {
											type: "string",
											pattern: "^[a-z][a-z0-9_-]{0,63}$"
										},
										id: {
											type: "string",
											pattern: "^[A-Z][A-Z0-9_]{0,127}$"
										}
									},
									required: [
										"source",
										"provider",
										"id"
									],
									additionalProperties: false
								},
								{
									type: "object",
									properties: {
										source: {
											type: "string",
											const: "file"
										},
										provider: {
											type: "string",
											pattern: "^[a-z][a-z0-9_-]{0,63}$"
										},
										id: { type: "string" }
									},
									required: [
										"source",
										"provider",
										"id"
									],
									additionalProperties: false
								},
								{
									type: "object",
									properties: {
										source: {
											type: "string",
											const: "exec"
										},
										provider: {
											type: "string",
											pattern: "^[a-z][a-z0-9_-]{0,63}$"
										},
										id: { type: "string" }
									},
									required: [
										"source",
										"provider",
										"id"
									],
									additionalProperties: false
								}
							] }] },
							tokenFile: { type: "string" },
							replyToMode: { anyOf: [
								{
									type: "string",
									const: "off"
								},
								{
									type: "string",
									const: "first"
								},
								{
									type: "string",
									const: "all"
								}
							] },
							groups: {
								type: "object",
								propertyNames: { type: "string" },
								additionalProperties: {
									type: "object",
									properties: {
										requireMention: { type: "boolean" },
										disableAudioPreflight: { type: "boolean" },
										groupPolicy: {
											type: "string",
											enum: [
												"open",
												"disabled",
												"allowlist"
											]
										},
										tools: {
											type: "object",
											properties: {
												allow: {
													type: "array",
													items: { type: "string" }
												},
												alsoAllow: {
													type: "array",
													items: { type: "string" }
												},
												deny: {
													type: "array",
													items: { type: "string" }
												}
											},
											additionalProperties: false
										},
										toolsBySender: {
											type: "object",
											propertyNames: { type: "string" },
											additionalProperties: {
												type: "object",
												properties: {
													allow: {
														type: "array",
														items: { type: "string" }
													},
													alsoAllow: {
														type: "array",
														items: { type: "string" }
													},
													deny: {
														type: "array",
														items: { type: "string" }
													}
												},
												additionalProperties: false
											}
										},
										skills: {
											type: "array",
											items: { type: "string" }
										},
										enabled: { type: "boolean" },
										allowFrom: {
											type: "array",
											items: { anyOf: [{ type: "string" }, { type: "number" }] }
										},
										systemPrompt: { type: "string" },
										topics: {
											type: "object",
											propertyNames: { type: "string" },
											additionalProperties: {
												type: "object",
												properties: {
													requireMention: { type: "boolean" },
													disableAudioPreflight: { type: "boolean" },
													groupPolicy: {
														type: "string",
														enum: [
															"open",
															"disabled",
															"allowlist"
														]
													},
													skills: {
														type: "array",
														items: { type: "string" }
													},
													enabled: { type: "boolean" },
													allowFrom: {
														type: "array",
														items: { anyOf: [{ type: "string" }, { type: "number" }] }
													},
													systemPrompt: { type: "string" },
													agentId: { type: "string" },
													errorPolicy: {
														type: "string",
														enum: [
															"always",
															"once",
															"silent"
														]
													},
													errorCooldownMs: {
														type: "integer",
														minimum: 0,
														maximum: 9007199254740991
													}
												},
												additionalProperties: false
											}
										},
										errorPolicy: {
											type: "string",
											enum: [
												"always",
												"once",
												"silent"
											]
										},
										errorCooldownMs: {
											type: "integer",
											minimum: 0,
											maximum: 9007199254740991
										}
									},
									additionalProperties: false
								}
							},
							allowFrom: {
								type: "array",
								items: { anyOf: [{ type: "string" }, { type: "number" }] }
							},
							defaultTo: { anyOf: [{ type: "string" }, { type: "number" }] },
							groupAllowFrom: {
								type: "array",
								items: { anyOf: [{ type: "string" }, { type: "number" }] }
							},
							groupPolicy: {
								default: "allowlist",
								type: "string",
								enum: [
									"open",
									"disabled",
									"allowlist"
								]
							},
							historyLimit: {
								type: "integer",
								minimum: 0,
								maximum: 9007199254740991
							},
							dmHistoryLimit: {
								type: "integer",
								minimum: 0,
								maximum: 9007199254740991
							},
							dms: {
								type: "object",
								propertyNames: { type: "string" },
								additionalProperties: {
									type: "object",
									properties: { historyLimit: {
										type: "integer",
										minimum: 0,
										maximum: 9007199254740991
									} },
									additionalProperties: false
								}
							},
							direct: {
								type: "object",
								propertyNames: { type: "string" },
								additionalProperties: {
									type: "object",
									properties: {
										dmPolicy: {
											type: "string",
											enum: [
												"pairing",
												"allowlist",
												"open",
												"disabled"
											]
										},
										tools: {
											type: "object",
											properties: {
												allow: {
													type: "array",
													items: { type: "string" }
												},
												alsoAllow: {
													type: "array",
													items: { type: "string" }
												},
												deny: {
													type: "array",
													items: { type: "string" }
												}
											},
											additionalProperties: false
										},
										toolsBySender: {
											type: "object",
											propertyNames: { type: "string" },
											additionalProperties: {
												type: "object",
												properties: {
													allow: {
														type: "array",
														items: { type: "string" }
													},
													alsoAllow: {
														type: "array",
														items: { type: "string" }
													},
													deny: {
														type: "array",
														items: { type: "string" }
													}
												},
												additionalProperties: false
											}
										},
										skills: {
											type: "array",
											items: { type: "string" }
										},
										enabled: { type: "boolean" },
										allowFrom: {
											type: "array",
											items: { anyOf: [{ type: "string" }, { type: "number" }] }
										},
										systemPrompt: { type: "string" },
										topics: {
											type: "object",
											propertyNames: { type: "string" },
											additionalProperties: {
												type: "object",
												properties: {
													requireMention: { type: "boolean" },
													disableAudioPreflight: { type: "boolean" },
													groupPolicy: {
														type: "string",
														enum: [
															"open",
															"disabled",
															"allowlist"
														]
													},
													skills: {
														type: "array",
														items: { type: "string" }
													},
													enabled: { type: "boolean" },
													allowFrom: {
														type: "array",
														items: { anyOf: [{ type: "string" }, { type: "number" }] }
													},
													systemPrompt: { type: "string" },
													agentId: { type: "string" },
													errorPolicy: {
														type: "string",
														enum: [
															"always",
															"once",
															"silent"
														]
													},
													errorCooldownMs: {
														type: "integer",
														minimum: 0,
														maximum: 9007199254740991
													}
												},
												additionalProperties: false
											}
										},
										errorPolicy: {
											type: "string",
											enum: [
												"always",
												"once",
												"silent"
											]
										},
										errorCooldownMs: {
											type: "integer",
											minimum: 0,
											maximum: 9007199254740991
										},
										requireTopic: { type: "boolean" },
										autoTopicLabel: { anyOf: [{ type: "boolean" }, {
											type: "object",
											properties: {
												enabled: { type: "boolean" },
												prompt: { type: "string" }
											},
											additionalProperties: false
										}] }
									},
									additionalProperties: false
								}
							},
							textChunkLimit: {
								type: "integer",
								exclusiveMinimum: 0,
								maximum: 9007199254740991
							},
							chunkMode: {
								type: "string",
								enum: ["length", "newline"]
							},
							streaming: { anyOf: [{ type: "boolean" }, {
								type: "string",
								enum: [
									"off",
									"partial",
									"block",
									"progress"
								]
							}] },
							blockStreaming: { type: "boolean" },
							draftChunk: {
								type: "object",
								properties: {
									minChars: {
										type: "integer",
										exclusiveMinimum: 0,
										maximum: 9007199254740991
									},
									maxChars: {
										type: "integer",
										exclusiveMinimum: 0,
										maximum: 9007199254740991
									},
									breakPreference: { anyOf: [
										{
											type: "string",
											const: "paragraph"
										},
										{
											type: "string",
											const: "newline"
										},
										{
											type: "string",
											const: "sentence"
										}
									] }
								},
								additionalProperties: false
							},
							blockStreamingCoalesce: {
								type: "object",
								properties: {
									minChars: {
										type: "integer",
										exclusiveMinimum: 0,
										maximum: 9007199254740991
									},
									maxChars: {
										type: "integer",
										exclusiveMinimum: 0,
										maximum: 9007199254740991
									},
									idleMs: {
										type: "integer",
										minimum: 0,
										maximum: 9007199254740991
									}
								},
								additionalProperties: false
							},
							streamMode: {
								type: "string",
								enum: [
									"off",
									"partial",
									"block"
								]
							},
							mediaMaxMb: {
								type: "number",
								exclusiveMinimum: 0
							},
							timeoutSeconds: {
								type: "integer",
								exclusiveMinimum: 0,
								maximum: 9007199254740991
							},
							retry: {
								type: "object",
								properties: {
									attempts: {
										type: "integer",
										minimum: 1,
										maximum: 9007199254740991
									},
									minDelayMs: {
										type: "integer",
										minimum: 0,
										maximum: 9007199254740991
									},
									maxDelayMs: {
										type: "integer",
										minimum: 0,
										maximum: 9007199254740991
									},
									jitter: {
										type: "number",
										minimum: 0,
										maximum: 1
									}
								},
								additionalProperties: false
							},
							network: {
								type: "object",
								properties: {
									autoSelectFamily: { type: "boolean" },
									dnsResultOrder: {
										type: "string",
										enum: ["ipv4first", "verbatim"]
									}
								},
								additionalProperties: false
							},
							proxy: { type: "string" },
							webhookUrl: {
								description: "Public HTTPS webhook URL registered with Telegram for inbound updates. This must be internet-reachable and requires channels.telegram.webhookSecret.",
								type: "string"
							},
							webhookSecret: {
								description: "Secret token sent to Telegram during webhook registration and verified on inbound webhook requests. Telegram returns this value for verification; this is not the gateway auth token and not the bot token.",
								anyOf: [{ type: "string" }, { oneOf: [
									{
										type: "object",
										properties: {
											source: {
												type: "string",
												const: "env"
											},
											provider: {
												type: "string",
												pattern: "^[a-z][a-z0-9_-]{0,63}$"
											},
											id: {
												type: "string",
												pattern: "^[A-Z][A-Z0-9_]{0,127}$"
											}
										},
										required: [
											"source",
											"provider",
											"id"
										],
										additionalProperties: false
									},
									{
										type: "object",
										properties: {
											source: {
												type: "string",
												const: "file"
											},
											provider: {
												type: "string",
												pattern: "^[a-z][a-z0-9_-]{0,63}$"
											},
											id: { type: "string" }
										},
										required: [
											"source",
											"provider",
											"id"
										],
										additionalProperties: false
									},
									{
										type: "object",
										properties: {
											source: {
												type: "string",
												const: "exec"
											},
											provider: {
												type: "string",
												pattern: "^[a-z][a-z0-9_-]{0,63}$"
											},
											id: { type: "string" }
										},
										required: [
											"source",
											"provider",
											"id"
										],
										additionalProperties: false
									}
								] }]
							},
							webhookPath: {
								description: "Local webhook route path served by the gateway listener. Defaults to /telegram-webhook.",
								type: "string"
							},
							webhookHost: {
								description: "Local bind host for the webhook listener. Defaults to 127.0.0.1; keep loopback unless you intentionally expose direct ingress.",
								type: "string"
							},
							webhookPort: {
								description: "Local bind port for the webhook listener. Defaults to 8787; set to 0 to let the OS assign an ephemeral port.",
								type: "integer",
								minimum: 0,
								maximum: 9007199254740991
							},
							webhookCertPath: {
								description: "Path to the self-signed certificate (PEM) to upload to Telegram during webhook registration. Required for self-signed certs (direct IP or no domain).",
								type: "string"
							},
							actions: {
								type: "object",
								properties: {
									reactions: { type: "boolean" },
									sendMessage: { type: "boolean" },
									poll: { type: "boolean" },
									deleteMessage: { type: "boolean" },
									editMessage: { type: "boolean" },
									sticker: { type: "boolean" },
									createForumTopic: { type: "boolean" },
									editForumTopic: { type: "boolean" }
								},
								additionalProperties: false
							},
							threadBindings: {
								type: "object",
								properties: {
									enabled: { type: "boolean" },
									idleHours: {
										type: "number",
										minimum: 0
									},
									maxAgeHours: {
										type: "number",
										minimum: 0
									},
									spawnSubagentSessions: { type: "boolean" },
									spawnAcpSessions: { type: "boolean" }
								},
								additionalProperties: false
							},
							reactionNotifications: {
								type: "string",
								enum: [
									"off",
									"own",
									"all"
								]
							},
							reactionLevel: {
								type: "string",
								enum: [
									"off",
									"ack",
									"minimal",
									"extensive"
								]
							},
							heartbeat: {
								type: "object",
								properties: {
									showOk: { type: "boolean" },
									showAlerts: { type: "boolean" },
									useIndicator: { type: "boolean" }
								},
								additionalProperties: false
							},
							healthMonitor: {
								type: "object",
								properties: { enabled: { type: "boolean" } },
								additionalProperties: false
							},
							linkPreview: { type: "boolean" },
							silentErrorReplies: { type: "boolean" },
							responsePrefix: { type: "string" },
							ackReaction: { type: "string" },
							errorPolicy: {
								type: "string",
								enum: [
									"always",
									"once",
									"silent"
								]
							},
							errorCooldownMs: {
								type: "integer",
								minimum: 0,
								maximum: 9007199254740991
							},
							apiRoot: {
								type: "string",
								format: "uri"
							},
							autoTopicLabel: { anyOf: [{ type: "boolean" }, {
								type: "object",
								properties: {
									enabled: { type: "boolean" },
									prompt: { type: "string" }
								},
								additionalProperties: false
							}] }
						},
						required: ["dmPolicy", "groupPolicy"],
						additionalProperties: false
					}
				},
				defaultAccount: { type: "string" }
			},
			required: ["dmPolicy", "groupPolicy"],
			additionalProperties: false
		},
		uiHints: {
			"": {
				label: "Telegram",
				help: "Telegram channel provider configuration including auth tokens, retry behavior, and message rendering controls. Use this section to tune bot behavior for Telegram-specific API semantics."
			},
			customCommands: {
				label: "Telegram Custom Commands",
				help: "Additional Telegram bot menu commands (merged with native; conflicts ignored)."
			},
			botToken: {
				label: "Telegram Bot Token",
				help: "Telegram bot token used to authenticate Bot API requests for this account/provider config. Use secret/env substitution and rotate tokens if exposure is suspected."
			},
			dmPolicy: {
				label: "Telegram DM Policy",
				help: "Direct message access control (\"pairing\" recommended). \"open\" requires channels.telegram.allowFrom=[\"*\"]."
			},
			configWrites: {
				label: "Telegram Config Writes",
				help: "Allow Telegram to write config in response to channel events/commands (default: true)."
			},
			"commands.native": {
				label: "Telegram Native Commands",
				help: "Override native commands for Telegram (bool or \"auto\")."
			},
			"commands.nativeSkills": {
				label: "Telegram Native Skill Commands",
				help: "Override native skill commands for Telegram (bool or \"auto\")."
			},
			streaming: {
				label: "Telegram Streaming Mode",
				help: "Unified Telegram stream preview mode: \"off\" | \"partial\" | \"block\" | \"progress\" (default: \"partial\"). \"progress\" maps to \"partial\" on Telegram. Legacy boolean/streamMode keys are auto-mapped."
			},
			"retry.attempts": {
				label: "Telegram Retry Attempts",
				help: "Max retry attempts for outbound Telegram API calls (default: 3)."
			},
			"retry.minDelayMs": {
				label: "Telegram Retry Min Delay (ms)",
				help: "Minimum retry delay in ms for Telegram outbound calls."
			},
			"retry.maxDelayMs": {
				label: "Telegram Retry Max Delay (ms)",
				help: "Maximum retry delay cap in ms for Telegram outbound calls."
			},
			"retry.jitter": {
				label: "Telegram Retry Jitter",
				help: "Jitter factor (0-1) applied to Telegram retry delays."
			},
			"network.autoSelectFamily": {
				label: "Telegram autoSelectFamily",
				help: "Override Node autoSelectFamily for Telegram (true=enable, false=disable)."
			},
			timeoutSeconds: {
				label: "Telegram API Timeout (seconds)",
				help: "Max seconds before Telegram API requests are aborted (default: 500 per grammY)."
			},
			silentErrorReplies: {
				label: "Telegram Silent Error Replies",
				help: "When true, Telegram bot replies marked as errors are sent silently (no notification sound). Default: false."
			},
			apiRoot: {
				label: "Telegram API Root URL",
				help: "Custom Telegram Bot API root URL. Use for self-hosted Bot API servers (https://github.com/tdlib/telegram-bot-api) or reverse proxies in regions where api.telegram.org is blocked."
			},
			autoTopicLabel: {
				label: "Telegram Auto Topic Label",
				help: "Auto-rename DM forum topics on first message using LLM. Default: true. Set to false to disable, or use object form { enabled: true, prompt: '...' } for custom prompt."
			},
			"autoTopicLabel.enabled": {
				label: "Telegram Auto Topic Label Enabled",
				help: "Whether auto topic labeling is enabled. Default: true."
			},
			"autoTopicLabel.prompt": {
				label: "Telegram Auto Topic Label Prompt",
				help: "Custom prompt for LLM-based topic naming. The user message is appended after the prompt."
			},
			"capabilities.inlineButtons": {
				label: "Telegram Inline Buttons",
				help: "Enable Telegram inline button components for supported command and interaction surfaces. Disable if your deployment needs plain-text-only compatibility behavior."
			},
			execApprovals: {
				label: "Telegram Exec Approvals",
				help: "Telegram-native exec approval routing and approver authorization. When unset, OpenClaw auto-enables DM-first native approvals if approvers can be resolved for the selected bot account."
			},
			"execApprovals.enabled": {
				label: "Telegram Exec Approvals Enabled",
				help: "Controls Telegram native exec approvals for this account: unset or \"auto\" enables DM-first native approvals when approvers can be resolved, true forces native approvals on, and false disables them."
			},
			"execApprovals.approvers": {
				label: "Telegram Exec Approval Approvers",
				help: "Telegram user IDs allowed to approve exec requests for this bot account. Use numeric Telegram user IDs. If you leave this unset, OpenClaw falls back to numeric owner IDs inferred from channels.telegram.allowFrom and direct-message defaultTo when possible."
			},
			"execApprovals.agentFilter": {
				label: "Telegram Exec Approval Agent Filter",
				help: "Optional allowlist of agent IDs eligible for Telegram exec approvals, for example `[\"main\", \"ops-agent\"]`. Use this to keep approval prompts scoped to the agents you actually operate from Telegram."
			},
			"execApprovals.sessionFilter": {
				label: "Telegram Exec Approval Session Filter",
				help: "Optional session-key filters matched as substring or regex-style patterns before Telegram approval routing is used. Use narrow patterns so Telegram approvals only appear for intended sessions."
			},
			"execApprovals.target": {
				label: "Telegram Exec Approval Target",
				help: "Controls where Telegram approval prompts are sent: \"dm\" sends to approver DMs (default), \"channel\" sends to the originating Telegram chat/topic, and \"both\" sends to both. Channel delivery exposes the command text to the chat, so only use it in trusted groups/topics."
			},
			"threadBindings.enabled": {
				label: "Telegram Thread Binding Enabled",
				help: "Enable Telegram conversation binding features (/focus, /unfocus, /agents, and /session idle|max-age). Overrides session.threadBindings.enabled when set."
			},
			"threadBindings.idleHours": {
				label: "Telegram Thread Binding Idle Timeout (hours)",
				help: "Inactivity window in hours for Telegram bound sessions. Set 0 to disable idle auto-unfocus (default: 24). Overrides session.threadBindings.idleHours when set."
			},
			"threadBindings.maxAgeHours": {
				label: "Telegram Thread Binding Max Age (hours)",
				help: "Optional hard max age in hours for Telegram bound sessions. Set 0 to disable hard cap (default: 0). Overrides session.threadBindings.maxAgeHours when set."
			},
			"threadBindings.spawnSubagentSessions": {
				label: "Telegram Thread-Bound Subagent Spawn",
				help: "Allow subagent spawns with thread=true to auto-bind Telegram current conversations when supported."
			},
			"threadBindings.spawnAcpSessions": {
				label: "Telegram Thread-Bound ACP Spawn",
				help: "Allow ACP spawns with thread=true to auto-bind Telegram current conversations when supported."
			}
		}
	},
	{
		pluginId: "tlon",
		channelId: "tlon",
		label: "Tlon",
		description: "decentralized messaging on Urbit; install the plugin to enable.",
		schema: {
			$schema: "http://json-schema.org/draft-07/schema#",
			type: "object",
			properties: {
				name: { type: "string" },
				enabled: { type: "boolean" },
				ship: {
					type: "string",
					minLength: 1
				},
				url: { type: "string" },
				code: { type: "string" },
				allowPrivateNetwork: { type: "boolean" },
				groupChannels: {
					type: "array",
					items: {
						type: "string",
						minLength: 1
					}
				},
				dmAllowlist: {
					type: "array",
					items: {
						type: "string",
						minLength: 1
					}
				},
				autoDiscoverChannels: { type: "boolean" },
				showModelSignature: { type: "boolean" },
				responsePrefix: { type: "string" },
				autoAcceptDmInvites: { type: "boolean" },
				autoAcceptGroupInvites: { type: "boolean" },
				ownerShip: {
					type: "string",
					minLength: 1
				},
				authorization: {
					type: "object",
					properties: { channelRules: {
						type: "object",
						propertyNames: { type: "string" },
						additionalProperties: {
							type: "object",
							properties: {
								mode: {
									type: "string",
									enum: ["restricted", "open"]
								},
								allowedShips: {
									type: "array",
									items: {
										type: "string",
										minLength: 1
									}
								}
							},
							additionalProperties: false
						}
					} },
					additionalProperties: false
				},
				defaultAuthorizedShips: {
					type: "array",
					items: {
						type: "string",
						minLength: 1
					}
				},
				accounts: {
					type: "object",
					propertyNames: { type: "string" },
					additionalProperties: {
						type: "object",
						properties: {
							name: { type: "string" },
							enabled: { type: "boolean" },
							ship: {
								type: "string",
								minLength: 1
							},
							url: { type: "string" },
							code: { type: "string" },
							allowPrivateNetwork: { type: "boolean" },
							groupChannels: {
								type: "array",
								items: {
									type: "string",
									minLength: 1
								}
							},
							dmAllowlist: {
								type: "array",
								items: {
									type: "string",
									minLength: 1
								}
							},
							autoDiscoverChannels: { type: "boolean" },
							showModelSignature: { type: "boolean" },
							responsePrefix: { type: "string" },
							autoAcceptDmInvites: { type: "boolean" },
							autoAcceptGroupInvites: { type: "boolean" },
							ownerShip: {
								type: "string",
								minLength: 1
							}
						},
						additionalProperties: false
					}
				}
			},
			additionalProperties: false
		}
	},
	{
		pluginId: "twitch",
		channelId: "twitch",
		label: "Twitch",
		description: "Twitch chat integration",
		schema: {
			$schema: "http://json-schema.org/draft-07/schema#",
			anyOf: [{ allOf: [{
				type: "object",
				properties: {
					name: { type: "string" },
					enabled: { type: "boolean" },
					markdown: {
						type: "object",
						properties: { tables: {
							type: "string",
							enum: [
								"off",
								"bullets",
								"code",
								"block"
							]
						} },
						additionalProperties: false
					}
				},
				additionalProperties: false
			}, {
				type: "object",
				properties: {
					username: { type: "string" },
					accessToken: { type: "string" },
					clientId: { type: "string" },
					channel: {
						type: "string",
						minLength: 1
					},
					enabled: { type: "boolean" },
					allowFrom: {
						type: "array",
						items: { type: "string" }
					},
					allowedRoles: {
						type: "array",
						items: {
							type: "string",
							enum: [
								"moderator",
								"owner",
								"vip",
								"subscriber",
								"all"
							]
						}
					},
					requireMention: { type: "boolean" },
					responsePrefix: { type: "string" },
					clientSecret: { type: "string" },
					refreshToken: { type: "string" },
					expiresIn: { anyOf: [{ type: "number" }, { type: "null" }] },
					obtainmentTimestamp: { type: "number" }
				},
				required: [
					"username",
					"accessToken",
					"channel"
				],
				additionalProperties: false
			}] }, { allOf: [{
				type: "object",
				properties: {
					name: { type: "string" },
					enabled: { type: "boolean" },
					markdown: {
						type: "object",
						properties: { tables: {
							type: "string",
							enum: [
								"off",
								"bullets",
								"code",
								"block"
							]
						} },
						additionalProperties: false
					}
				},
				additionalProperties: false
			}, {
				type: "object",
				properties: { accounts: {
					type: "object",
					propertyNames: { type: "string" },
					additionalProperties: {
						type: "object",
						properties: {
							username: { type: "string" },
							accessToken: { type: "string" },
							clientId: { type: "string" },
							channel: {
								type: "string",
								minLength: 1
							},
							enabled: { type: "boolean" },
							allowFrom: {
								type: "array",
								items: { type: "string" }
							},
							allowedRoles: {
								type: "array",
								items: {
									type: "string",
									enum: [
										"moderator",
										"owner",
										"vip",
										"subscriber",
										"all"
									]
								}
							},
							requireMention: { type: "boolean" },
							responsePrefix: { type: "string" },
							clientSecret: { type: "string" },
							refreshToken: { type: "string" },
							expiresIn: { anyOf: [{ type: "number" }, { type: "null" }] },
							obtainmentTimestamp: { type: "number" }
						},
						required: [
							"username",
							"accessToken",
							"channel"
						],
						additionalProperties: false
					}
				} },
				required: ["accounts"],
				additionalProperties: false
			}] }]
		}
	},
	{
		pluginId: "whatsapp",
		channelId: "whatsapp",
		label: "WhatsApp",
		description: "works with your own number; recommend a separate phone + eSIM.",
		schema: {
			$schema: "http://json-schema.org/draft-07/schema#",
			type: "object",
			properties: {
				enabled: { type: "boolean" },
				capabilities: {
					type: "array",
					items: { type: "string" }
				},
				markdown: {
					type: "object",
					properties: { tables: {
						type: "string",
						enum: [
							"off",
							"bullets",
							"code",
							"block"
						]
					} },
					additionalProperties: false
				},
				configWrites: { type: "boolean" },
				sendReadReceipts: { type: "boolean" },
				messagePrefix: { type: "string" },
				responsePrefix: { type: "string" },
				dmPolicy: {
					default: "pairing",
					type: "string",
					enum: [
						"pairing",
						"allowlist",
						"open",
						"disabled"
					]
				},
				selfChatMode: { type: "boolean" },
				allowFrom: {
					type: "array",
					items: { type: "string" }
				},
				defaultTo: { type: "string" },
				groupAllowFrom: {
					type: "array",
					items: { type: "string" }
				},
				groupPolicy: {
					default: "allowlist",
					type: "string",
					enum: [
						"open",
						"disabled",
						"allowlist"
					]
				},
				historyLimit: {
					type: "integer",
					minimum: 0,
					maximum: 9007199254740991
				},
				dmHistoryLimit: {
					type: "integer",
					minimum: 0,
					maximum: 9007199254740991
				},
				dms: {
					type: "object",
					propertyNames: { type: "string" },
					additionalProperties: {
						type: "object",
						properties: { historyLimit: {
							type: "integer",
							minimum: 0,
							maximum: 9007199254740991
						} },
						additionalProperties: false
					}
				},
				textChunkLimit: {
					type: "integer",
					exclusiveMinimum: 0,
					maximum: 9007199254740991
				},
				chunkMode: {
					type: "string",
					enum: ["length", "newline"]
				},
				blockStreaming: { type: "boolean" },
				blockStreamingCoalesce: {
					type: "object",
					properties: {
						minChars: {
							type: "integer",
							exclusiveMinimum: 0,
							maximum: 9007199254740991
						},
						maxChars: {
							type: "integer",
							exclusiveMinimum: 0,
							maximum: 9007199254740991
						},
						idleMs: {
							type: "integer",
							minimum: 0,
							maximum: 9007199254740991
						}
					},
					additionalProperties: false
				},
				groups: {
					type: "object",
					propertyNames: { type: "string" },
					additionalProperties: {
						type: "object",
						properties: {
							requireMention: { type: "boolean" },
							tools: {
								type: "object",
								properties: {
									allow: {
										type: "array",
										items: { type: "string" }
									},
									alsoAllow: {
										type: "array",
										items: { type: "string" }
									},
									deny: {
										type: "array",
										items: { type: "string" }
									}
								},
								additionalProperties: false
							},
							toolsBySender: {
								type: "object",
								propertyNames: { type: "string" },
								additionalProperties: {
									type: "object",
									properties: {
										allow: {
											type: "array",
											items: { type: "string" }
										},
										alsoAllow: {
											type: "array",
											items: { type: "string" }
										},
										deny: {
											type: "array",
											items: { type: "string" }
										}
									},
									additionalProperties: false
								}
							}
						},
						additionalProperties: false
					}
				},
				ackReaction: {
					type: "object",
					properties: {
						emoji: { type: "string" },
						direct: {
							default: true,
							type: "boolean"
						},
						group: {
							default: "mentions",
							type: "string",
							enum: [
								"always",
								"mentions",
								"never"
							]
						}
					},
					required: ["direct", "group"],
					additionalProperties: false
				},
				reactionLevel: {
					type: "string",
					enum: [
						"off",
						"ack",
						"minimal",
						"extensive"
					]
				},
				debounceMs: {
					default: 0,
					type: "integer",
					minimum: 0,
					maximum: 9007199254740991
				},
				heartbeat: {
					type: "object",
					properties: {
						showOk: { type: "boolean" },
						showAlerts: { type: "boolean" },
						useIndicator: { type: "boolean" }
					},
					additionalProperties: false
				},
				healthMonitor: {
					type: "object",
					properties: { enabled: { type: "boolean" } },
					additionalProperties: false
				},
				accounts: {
					type: "object",
					propertyNames: { type: "string" },
					additionalProperties: {
						type: "object",
						properties: {
							enabled: { type: "boolean" },
							capabilities: {
								type: "array",
								items: { type: "string" }
							},
							markdown: {
								type: "object",
								properties: { tables: {
									type: "string",
									enum: [
										"off",
										"bullets",
										"code",
										"block"
									]
								} },
								additionalProperties: false
							},
							configWrites: { type: "boolean" },
							sendReadReceipts: { type: "boolean" },
							messagePrefix: { type: "string" },
							responsePrefix: { type: "string" },
							dmPolicy: {
								default: "pairing",
								type: "string",
								enum: [
									"pairing",
									"allowlist",
									"open",
									"disabled"
								]
							},
							selfChatMode: { type: "boolean" },
							allowFrom: {
								type: "array",
								items: { type: "string" }
							},
							defaultTo: { type: "string" },
							groupAllowFrom: {
								type: "array",
								items: { type: "string" }
							},
							groupPolicy: {
								default: "allowlist",
								type: "string",
								enum: [
									"open",
									"disabled",
									"allowlist"
								]
							},
							historyLimit: {
								type: "integer",
								minimum: 0,
								maximum: 9007199254740991
							},
							dmHistoryLimit: {
								type: "integer",
								minimum: 0,
								maximum: 9007199254740991
							},
							dms: {
								type: "object",
								propertyNames: { type: "string" },
								additionalProperties: {
									type: "object",
									properties: { historyLimit: {
										type: "integer",
										minimum: 0,
										maximum: 9007199254740991
									} },
									additionalProperties: false
								}
							},
							textChunkLimit: {
								type: "integer",
								exclusiveMinimum: 0,
								maximum: 9007199254740991
							},
							chunkMode: {
								type: "string",
								enum: ["length", "newline"]
							},
							blockStreaming: { type: "boolean" },
							blockStreamingCoalesce: {
								type: "object",
								properties: {
									minChars: {
										type: "integer",
										exclusiveMinimum: 0,
										maximum: 9007199254740991
									},
									maxChars: {
										type: "integer",
										exclusiveMinimum: 0,
										maximum: 9007199254740991
									},
									idleMs: {
										type: "integer",
										minimum: 0,
										maximum: 9007199254740991
									}
								},
								additionalProperties: false
							},
							groups: {
								type: "object",
								propertyNames: { type: "string" },
								additionalProperties: {
									type: "object",
									properties: {
										requireMention: { type: "boolean" },
										tools: {
											type: "object",
											properties: {
												allow: {
													type: "array",
													items: { type: "string" }
												},
												alsoAllow: {
													type: "array",
													items: { type: "string" }
												},
												deny: {
													type: "array",
													items: { type: "string" }
												}
											},
											additionalProperties: false
										},
										toolsBySender: {
											type: "object",
											propertyNames: { type: "string" },
											additionalProperties: {
												type: "object",
												properties: {
													allow: {
														type: "array",
														items: { type: "string" }
													},
													alsoAllow: {
														type: "array",
														items: { type: "string" }
													},
													deny: {
														type: "array",
														items: { type: "string" }
													}
												},
												additionalProperties: false
											}
										}
									},
									additionalProperties: false
								}
							},
							ackReaction: {
								type: "object",
								properties: {
									emoji: { type: "string" },
									direct: {
										default: true,
										type: "boolean"
									},
									group: {
										default: "mentions",
										type: "string",
										enum: [
											"always",
											"mentions",
											"never"
										]
									}
								},
								required: ["direct", "group"],
								additionalProperties: false
							},
							reactionLevel: {
								type: "string",
								enum: [
									"off",
									"ack",
									"minimal",
									"extensive"
								]
							},
							debounceMs: {
								default: 0,
								type: "integer",
								minimum: 0,
								maximum: 9007199254740991
							},
							heartbeat: {
								type: "object",
								properties: {
									showOk: { type: "boolean" },
									showAlerts: { type: "boolean" },
									useIndicator: { type: "boolean" }
								},
								additionalProperties: false
							},
							healthMonitor: {
								type: "object",
								properties: { enabled: { type: "boolean" } },
								additionalProperties: false
							},
							name: { type: "string" },
							authDir: { type: "string" },
							mediaMaxMb: {
								type: "integer",
								exclusiveMinimum: 0,
								maximum: 9007199254740991
							}
						},
						required: [
							"dmPolicy",
							"groupPolicy",
							"debounceMs"
						],
						additionalProperties: false
					}
				},
				defaultAccount: { type: "string" },
				mediaMaxMb: {
					default: 50,
					type: "integer",
					exclusiveMinimum: 0,
					maximum: 9007199254740991
				},
				actions: {
					type: "object",
					properties: {
						reactions: { type: "boolean" },
						sendMessage: { type: "boolean" },
						polls: { type: "boolean" }
					},
					additionalProperties: false
				}
			},
			required: [
				"dmPolicy",
				"groupPolicy",
				"debounceMs",
				"mediaMaxMb"
			],
			additionalProperties: false
		},
		uiHints: {
			"": {
				label: "WhatsApp",
				help: "WhatsApp channel provider configuration for access policy and message batching behavior. Use this section to tune responsiveness and direct-message routing safety for WhatsApp chats."
			},
			dmPolicy: {
				label: "WhatsApp DM Policy",
				help: "Direct message access control (\"pairing\" recommended). \"open\" requires channels.whatsapp.allowFrom=[\"*\"]."
			},
			selfChatMode: {
				label: "WhatsApp Self-Phone Mode",
				help: "Same-phone setup (bot uses your personal WhatsApp number)."
			},
			debounceMs: {
				label: "WhatsApp Message Debounce (ms)",
				help: "Debounce window (ms) for batching rapid consecutive messages from the same sender (0 to disable)."
			},
			configWrites: {
				label: "WhatsApp Config Writes",
				help: "Allow WhatsApp to write config in response to channel events/commands (default: true)."
			}
		}
	},
	{
		pluginId: "zalo",
		channelId: "zalo",
		label: "Zalo",
		description: "Vietnam-focused messaging platform with Bot API.",
		schema: {
			$schema: "http://json-schema.org/draft-07/schema#",
			type: "object",
			properties: {
				name: { type: "string" },
				enabled: { type: "boolean" },
				markdown: {
					type: "object",
					properties: { tables: {
						type: "string",
						enum: [
							"off",
							"bullets",
							"code",
							"block"
						]
					} },
					additionalProperties: false
				},
				botToken: { anyOf: [{ type: "string" }, { oneOf: [
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "env"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: {
								type: "string",
								pattern: "^[A-Z][A-Z0-9_]{0,127}$"
							}
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					},
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "file"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: { type: "string" }
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					},
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "exec"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: { type: "string" }
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					}
				] }] },
				tokenFile: { type: "string" },
				webhookUrl: { type: "string" },
				webhookSecret: { anyOf: [{ type: "string" }, { oneOf: [
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "env"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: {
								type: "string",
								pattern: "^[A-Z][A-Z0-9_]{0,127}$"
							}
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					},
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "file"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: { type: "string" }
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					},
					{
						type: "object",
						properties: {
							source: {
								type: "string",
								const: "exec"
							},
							provider: {
								type: "string",
								pattern: "^[a-z][a-z0-9_-]{0,63}$"
							},
							id: { type: "string" }
						},
						required: [
							"source",
							"provider",
							"id"
						],
						additionalProperties: false
					}
				] }] },
				webhookPath: { type: "string" },
				dmPolicy: {
					type: "string",
					enum: [
						"pairing",
						"allowlist",
						"open",
						"disabled"
					]
				},
				allowFrom: {
					type: "array",
					items: { anyOf: [{ type: "string" }, { type: "number" }] }
				},
				groupPolicy: {
					type: "string",
					enum: [
						"open",
						"disabled",
						"allowlist"
					]
				},
				groupAllowFrom: {
					type: "array",
					items: { anyOf: [{ type: "string" }, { type: "number" }] }
				},
				mediaMaxMb: { type: "number" },
				proxy: { type: "string" },
				responsePrefix: { type: "string" },
				accounts: {
					type: "object",
					properties: {},
					additionalProperties: {
						type: "object",
						properties: {
							name: { type: "string" },
							enabled: { type: "boolean" },
							markdown: {
								type: "object",
								properties: { tables: {
									type: "string",
									enum: [
										"off",
										"bullets",
										"code",
										"block"
									]
								} },
								additionalProperties: false
							},
							botToken: { anyOf: [{ type: "string" }, { oneOf: [
								{
									type: "object",
									properties: {
										source: {
											type: "string",
											const: "env"
										},
										provider: {
											type: "string",
											pattern: "^[a-z][a-z0-9_-]{0,63}$"
										},
										id: {
											type: "string",
											pattern: "^[A-Z][A-Z0-9_]{0,127}$"
										}
									},
									required: [
										"source",
										"provider",
										"id"
									],
									additionalProperties: false
								},
								{
									type: "object",
									properties: {
										source: {
											type: "string",
											const: "file"
										},
										provider: {
											type: "string",
											pattern: "^[a-z][a-z0-9_-]{0,63}$"
										},
										id: { type: "string" }
									},
									required: [
										"source",
										"provider",
										"id"
									],
									additionalProperties: false
								},
								{
									type: "object",
									properties: {
										source: {
											type: "string",
											const: "exec"
										},
										provider: {
											type: "string",
											pattern: "^[a-z][a-z0-9_-]{0,63}$"
										},
										id: { type: "string" }
									},
									required: [
										"source",
										"provider",
										"id"
									],
									additionalProperties: false
								}
							] }] },
							tokenFile: { type: "string" },
							webhookUrl: { type: "string" },
							webhookSecret: { anyOf: [{ type: "string" }, { oneOf: [
								{
									type: "object",
									properties: {
										source: {
											type: "string",
											const: "env"
										},
										provider: {
											type: "string",
											pattern: "^[a-z][a-z0-9_-]{0,63}$"
										},
										id: {
											type: "string",
											pattern: "^[A-Z][A-Z0-9_]{0,127}$"
										}
									},
									required: [
										"source",
										"provider",
										"id"
									],
									additionalProperties: false
								},
								{
									type: "object",
									properties: {
										source: {
											type: "string",
											const: "file"
										},
										provider: {
											type: "string",
											pattern: "^[a-z][a-z0-9_-]{0,63}$"
										},
										id: { type: "string" }
									},
									required: [
										"source",
										"provider",
										"id"
									],
									additionalProperties: false
								},
								{
									type: "object",
									properties: {
										source: {
											type: "string",
											const: "exec"
										},
										provider: {
											type: "string",
											pattern: "^[a-z][a-z0-9_-]{0,63}$"
										},
										id: { type: "string" }
									},
									required: [
										"source",
										"provider",
										"id"
									],
									additionalProperties: false
								}
							] }] },
							webhookPath: { type: "string" },
							dmPolicy: {
								type: "string",
								enum: [
									"pairing",
									"allowlist",
									"open",
									"disabled"
								]
							},
							allowFrom: {
								type: "array",
								items: { anyOf: [{ type: "string" }, { type: "number" }] }
							},
							groupPolicy: {
								type: "string",
								enum: [
									"open",
									"disabled",
									"allowlist"
								]
							},
							groupAllowFrom: {
								type: "array",
								items: { anyOf: [{ type: "string" }, { type: "number" }] }
							},
							mediaMaxMb: { type: "number" },
							proxy: { type: "string" },
							responsePrefix: { type: "string" }
						},
						additionalProperties: false
					}
				},
				defaultAccount: { type: "string" }
			},
			additionalProperties: false
		}
	},
	{
		pluginId: "zalouser",
		channelId: "zalouser",
		label: "Zalo Personal",
		description: "Zalo personal account via QR code login.",
		schema: {
			$schema: "http://json-schema.org/draft-07/schema#",
			type: "object",
			properties: {
				name: { type: "string" },
				enabled: { type: "boolean" },
				markdown: {
					type: "object",
					properties: { tables: {
						type: "string",
						enum: [
							"off",
							"bullets",
							"code",
							"block"
						]
					} },
					additionalProperties: false
				},
				profile: { type: "string" },
				dangerouslyAllowNameMatching: { type: "boolean" },
				dmPolicy: {
					type: "string",
					enum: [
						"pairing",
						"allowlist",
						"open",
						"disabled"
					]
				},
				allowFrom: {
					type: "array",
					items: { anyOf: [{ type: "string" }, { type: "number" }] }
				},
				historyLimit: {
					type: "integer",
					minimum: 0,
					maximum: 9007199254740991
				},
				groupAllowFrom: {
					type: "array",
					items: { anyOf: [{ type: "string" }, { type: "number" }] }
				},
				groupPolicy: {
					default: "allowlist",
					type: "string",
					enum: [
						"open",
						"disabled",
						"allowlist"
					]
				},
				groups: {
					type: "object",
					properties: {},
					additionalProperties: {
						type: "object",
						properties: {
							allow: { type: "boolean" },
							enabled: { type: "boolean" },
							requireMention: { type: "boolean" },
							tools: {
								type: "object",
								properties: {
									allow: {
										type: "array",
										items: { type: "string" }
									},
									alsoAllow: {
										type: "array",
										items: { type: "string" }
									},
									deny: {
										type: "array",
										items: { type: "string" }
									}
								},
								additionalProperties: false
							}
						},
						additionalProperties: false
					}
				},
				messagePrefix: { type: "string" },
				responsePrefix: { type: "string" },
				accounts: {
					type: "object",
					properties: {},
					additionalProperties: {
						type: "object",
						properties: {
							name: { type: "string" },
							enabled: { type: "boolean" },
							markdown: {
								type: "object",
								properties: { tables: {
									type: "string",
									enum: [
										"off",
										"bullets",
										"code",
										"block"
									]
								} },
								additionalProperties: false
							},
							profile: { type: "string" },
							dangerouslyAllowNameMatching: { type: "boolean" },
							dmPolicy: {
								type: "string",
								enum: [
									"pairing",
									"allowlist",
									"open",
									"disabled"
								]
							},
							allowFrom: {
								type: "array",
								items: { anyOf: [{ type: "string" }, { type: "number" }] }
							},
							historyLimit: {
								type: "integer",
								minimum: 0,
								maximum: 9007199254740991
							},
							groupAllowFrom: {
								type: "array",
								items: { anyOf: [{ type: "string" }, { type: "number" }] }
							},
							groupPolicy: {
								default: "allowlist",
								type: "string",
								enum: [
									"open",
									"disabled",
									"allowlist"
								]
							},
							groups: {
								type: "object",
								properties: {},
								additionalProperties: {
									type: "object",
									properties: {
										allow: { type: "boolean" },
										enabled: { type: "boolean" },
										requireMention: { type: "boolean" },
										tools: {
											type: "object",
											properties: {
												allow: {
													type: "array",
													items: { type: "string" }
												},
												alsoAllow: {
													type: "array",
													items: { type: "string" }
												},
												deny: {
													type: "array",
													items: { type: "string" }
												}
											},
											additionalProperties: false
										}
									},
									additionalProperties: false
								}
							},
							messagePrefix: { type: "string" },
							responsePrefix: { type: "string" }
						},
						required: ["groupPolicy"],
						additionalProperties: false
					}
				},
				defaultAccount: { type: "string" }
			},
			required: ["groupPolicy"],
			additionalProperties: false
		}
	}
];
//#endregion
//#region src/config/channel-config-metadata.ts
const PLUGIN_ORIGIN_RANK = {
	config: 0,
	workspace: 1,
	global: 2,
	bundled: 3
};
function collectPluginSchemaMetadata(registry) {
	const deduped = /* @__PURE__ */ new Map();
	for (const record of registry.plugins) {
		const current = deduped.get(record.id);
		const nextRank = PLUGIN_ORIGIN_RANK[record.origin] ?? Number.MAX_SAFE_INTEGER;
		if (current && current.originRank <= nextRank) continue;
		deduped.set(record.id, {
			id: record.id,
			name: record.name,
			description: record.description,
			configUiHints: record.configUiHints,
			configSchema: record.configSchema,
			originRank: nextRank
		});
	}
	return [...deduped.values()].toSorted((left, right) => left.id.localeCompare(right.id)).map(({ originRank: _originRank, ...record }) => record);
}
function collectChannelSchemaMetadata(registry) {
	const byChannelId = /* @__PURE__ */ new Map();
	for (const record of registry.plugins) {
		const originRank = PLUGIN_ORIGIN_RANK[record.origin] ?? Number.MAX_SAFE_INTEGER;
		const rootLabel = record.channelCatalogMeta?.label;
		const rootDescription = record.channelCatalogMeta?.blurb;
		for (const channelId of record.channels) {
			const current = byChannelId.get(channelId);
			if (!current || originRank <= current.originRank) byChannelId.set(channelId, {
				id: channelId,
				label: rootLabel ?? current?.label,
				description: rootDescription ?? current?.description,
				configSchema: current?.configSchema,
				configUiHints: current?.configUiHints,
				originRank
			});
		}
		for (const [channelId, channelConfig] of Object.entries(record.channelConfigs ?? {})) {
			const current = byChannelId.get(channelId);
			if (current && current.originRank < originRank) continue;
			byChannelId.set(channelId, {
				id: channelId,
				label: channelConfig.label ?? rootLabel ?? current?.label,
				description: channelConfig.description ?? rootDescription ?? current?.description,
				configSchema: channelConfig.schema,
				configUiHints: channelConfig.uiHints,
				originRank
			});
		}
	}
	return [...byChannelId.values()].toSorted((left, right) => left.id.localeCompare(right.id)).map(({ originRank: _originRank, ...entry }) => entry);
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
const LEGACY_TALK_PROVIDER_ID = "elevenlabs";
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
		return Object.keys(normalized).length > 0 ? normalized : void 0;
	}
	const legacyProviderConfig = legacyProviderConfigFromTalk(source);
	if (legacyProviderConfig) normalized.providers = { [LEGACY_TALK_PROVIDER_ID]: legacyProviderConfig };
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
	const fsImpl = deps.fs ?? fsSync;
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
	if (!active || active.provider !== "elevenlabs") return normalized;
	const existingProviderApiKeyConfigured = hasConfiguredSecretInput(active?.config?.apiKey);
	const existingLegacyApiKeyConfigured = hasConfiguredSecretInput(talk?.apiKey);
	if (existingProviderApiKeyConfigured || existingLegacyApiKeyConfigured) return normalized;
	const providerId = active.provider;
	const providers = { ...talk?.providers };
	providers[providerId] = {
		...providers[providerId],
		apiKey: resolved
	};
	const nextTalk = {
		...talk,
		apiKey: resolved,
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
		return fsSync.realpathSync(value);
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
const CAFFEINATE_OPTIONS_WITH_VALUE = new Set(["-t", "-w"]);
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
const BSD_SCRIPT_FLAG_OPTIONS = new Set([
	"-a",
	"-d",
	"-k",
	"-p",
	"-q",
	"-r"
]);
const BSD_SCRIPT_OPTIONS_WITH_VALUE = new Set(["-F", "-t"]);
const SANDBOX_EXEC_OPTIONS_WITH_VALUE = new Set([
	"-f",
	"-p",
	"-d"
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
const XCRUN_FLAG_OPTIONS = new Set([
	"-k",
	"--kill-cache",
	"-l",
	"--log",
	"-n",
	"--no-cache",
	"-r",
	"--run",
	"-v",
	"--verbose"
]);
function isArchSelectorToken(token) {
	return /^-[A-Za-z0-9_]+$/.test(token);
}
function isKnownArchSelectorToken(token) {
	return token === "-arm64" || token === "-arm64e" || token === "-i386" || token === "-x86_64" || token === "-x86_64h";
}
function isKnownArchNameToken(token) {
	return isKnownArchSelectorToken(`-${token}`);
}
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
function unwrapCaffeinateInvocation(argv) {
	return unwrapDashOptionInvocation(argv, { onFlag: (flag, lower) => {
		if (flag === "-d" || flag === "-i" || flag === "-m" || flag === "-s" || flag === "-u") return "continue";
		if (CAFFEINATE_OPTIONS_WITH_VALUE.has(flag)) return lower !== flag || lower.includes("=") ? "continue" : "consume-next";
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
function unwrapSandboxExecInvocation(argv) {
	return unwrapDashOptionInvocation(argv, { onFlag: (flag, lower) => {
		if (SANDBOX_EXEC_OPTIONS_WITH_VALUE.has(flag)) return lower !== flag || lower.includes("=") ? "continue" : "consume-next";
		return "invalid";
	} });
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
function supportsScriptPositionalCommand(platform = process.platform) {
	return platform === "darwin" || platform === "freebsd";
}
function unwrapScriptInvocation(argv) {
	if (!supportsScriptPositionalCommand()) return null;
	return scanWrapperInvocation(argv, {
		separators: new Set(["--"]),
		onToken: (token, lower) => {
			if (!lower.startsWith("-") || lower === "-") return "stop";
			const [flag] = token.split("=", 2);
			if (BSD_SCRIPT_OPTIONS_WITH_VALUE.has(flag)) return token.includes("=") ? "continue" : "consume-next";
			if (BSD_SCRIPT_FLAG_OPTIONS.has(flag)) return "continue";
			return "invalid";
		},
		adjustCommandIndex: (commandIndex, currentArgv) => {
			let sawTranscript = false;
			for (let idx = commandIndex; idx < currentArgv.length; idx += 1) {
				if (!(currentArgv[idx]?.trim() ?? "")) continue;
				if (!sawTranscript) {
					sawTranscript = true;
					continue;
				}
				return idx;
			}
			return null;
		}
	});
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
function unwrapArchInvocation(argv) {
	let expectsArchName = false;
	return scanWrapperInvocation(argv, { onToken: (token, lower) => {
		if (expectsArchName) {
			expectsArchName = false;
			return isKnownArchNameToken(lower) ? "continue" : "invalid";
		}
		if (!token.startsWith("-") || token === "-") return "stop";
		if (lower === "-32" || lower === "-64") return "continue";
		if (lower === "-arch") {
			expectsArchName = true;
			return "continue";
		}
		if (lower === "-c" || lower === "-d" || lower === "-e" || lower === "-h") return "invalid";
		return isArchSelectorToken(token) && isKnownArchSelectorToken(lower) ? "continue" : "invalid";
	} });
}
function supportsArchDispatchWrapper(platform = process.platform) {
	return platform === "darwin";
}
function supportsXcrunDispatchWrapper(platform = process.platform) {
	return platform === "darwin";
}
function unwrapXcrunInvocation(argv) {
	return scanWrapperInvocation(argv, { onToken: (token, lower) => {
		if (!token.startsWith("-") || token === "-") return "stop";
		if (XCRUN_FLAG_OPTIONS.has(lower)) return "continue";
		return "invalid";
	} });
}
const DISPATCH_WRAPPER_SPECS = [
	{
		name: "arch",
		unwrap: (argv, platform) => supportsArchDispatchWrapper(platform) ? unwrapArchInvocation(argv) : null,
		transparentUsage: (_argv, platform) => supportsArchDispatchWrapper(platform)
	},
	{
		name: "caffeinate",
		unwrap: unwrapCaffeinateInvocation,
		transparentUsage: true
	},
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
	{
		name: "sandbox-exec",
		unwrap: unwrapSandboxExecInvocation,
		transparentUsage: true
	},
	{
		name: "script",
		unwrap: unwrapScriptInvocation,
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
	},
	{
		name: "xcrun",
		unwrap: (argv, platform) => supportsXcrunDispatchWrapper(platform) ? unwrapXcrunInvocation(argv) : null,
		transparentUsage: (_argv, platform) => supportsXcrunDispatchWrapper(platform)
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
function isDispatchWrapperExecutable(token) {
	return DISPATCH_WRAPPER_SPEC_BY_NAME.has(normalizeExecutableToken(token));
}
function unwrapKnownDispatchWrapperInvocation(argv, platform = process.platform) {
	const token0 = argv[0]?.trim();
	if (!token0) return { kind: "not-wrapper" };
	const wrapper = normalizeExecutableToken(token0);
	const spec = DISPATCH_WRAPPER_SPEC_BY_NAME.get(wrapper);
	if (!spec) return { kind: "not-wrapper" };
	return spec.unwrap ? unwrapDispatchWrapper(wrapper, spec.unwrap(argv, platform)) : blockDispatchWrapper(wrapper);
}
function unwrapDispatchWrappersForResolution(argv, maxDepth = 4, platform = process.platform) {
	return resolveDispatchWrapperTrustPlan(argv, maxDepth, platform).argv;
}
function isSemanticDispatchWrapperUsage(wrapper, argv, platform = process.platform) {
	const spec = DISPATCH_WRAPPER_SPEC_BY_NAME.get(wrapper);
	if (!spec?.unwrap) return true;
	const transparentUsage = spec.transparentUsage;
	if (typeof transparentUsage === "function") return !transparentUsage(argv, platform);
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
function resolveDispatchWrapperTrustPlan(argv, maxDepth = 4, platform = process.platform) {
	let current = argv;
	const wrappers = [];
	for (let depth = 0; depth < maxDepth; depth += 1) {
		const unwrap = unwrapKnownDispatchWrapperInvocation(current, platform);
		if (unwrap.kind === "blocked") return blockedDispatchWrapperPlan({
			argv: current,
			wrappers,
			blockedWrapper: unwrap.wrapper
		});
		if (unwrap.kind !== "unwrapped" || unwrap.argv.length === 0) break;
		wrappers.push(unwrap.wrapper);
		if (isSemanticDispatchWrapperUsage(unwrap.wrapper, current, platform)) return blockedDispatchWrapperPlan({
			argv: current,
			wrappers,
			blockedWrapper: unwrap.wrapper
		});
		current = unwrap.argv;
	}
	if (wrappers.length >= maxDepth) {
		const overflow = unwrapKnownDispatchWrapperInvocation(current, platform);
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
const POWERSHELL_WRAPPERS = new Set(withWindowsExeAliases(POWERSHELL_WRAPPER_NAMES));
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
function isDriveLessWindowsRootedPath(value) {
	return process.platform === "win32" && /^:[\\/]/.test(value);
}
function resolveExecutablePathCandidate(rawExecutable, options) {
	const expanded = rawExecutable.startsWith("~") ? expandHomePrefix(rawExecutable, { env: options?.env }) : rawExecutable;
	if (isDriveLessWindowsRootedPath(expanded)) return;
	const hasPathSeparator = expanded.includes("/") || expanded.includes("\\");
	if (options?.requirePathSeparator && !hasPathSeparator) return;
	if (!hasPathSeparator) return expanded;
	if (path.isAbsolute(expanded)) return expanded;
	const base = options?.cwd && options.cwd.trim() ? options.cwd.trim() : process.cwd();
	return path.resolve(base, expanded);
}
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
		if (!fsSync.statSync(filePath).isFile()) return false;
		if (process.platform === "win32") {
			const ext = path.extname(filePath).toLowerCase();
			if (!ext) return true;
			return resolveWindowsExecutableExtSet(void 0).has(ext);
		}
		fsSync.accessSync(filePath, fsSync.constants.X_OK);
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
	const candidate = resolveExecutablePathCandidate(rawExecutable, options);
	if (!candidate) return;
	if (candidate.includes("/") || candidate.includes("\\")) return isExecutableFile(candidate) ? candidate : void 0;
	return resolveExecutableFromPathEnv(candidate, options?.env?.PATH ?? options?.env?.Path ?? process.env.PATH ?? process.env.Path ?? "", options?.env);
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
		return fsSync.realpathSync(filePath);
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
	return resolveExecutablePathCandidate(raw, {
		cwd,
		requirePathSeparator: true
	});
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
const TRAILING_SHELL_REDIRECTIONS_RE = /\s+(?:[12]>&[12]|[12]>\/dev\/null)\s*$/;
function stripTrailingRedirections(value) {
	let prev = value;
	while (true) {
		const next = prev.replace(TRAILING_SHELL_REDIRECTIONS_RE, "");
		if (next === prev) return next;
		prev = next;
	}
}
function matchArgPattern(argPattern, argv, platform) {
	const sep = argPattern.includes("\0") ? "\0" : " ";
	const argsSlice = argv.slice(1);
	const argsString = sep === "\0" ? argsSlice.length === 0 ? "\0\0" : argsSlice.join(sep) + sep : argsSlice.join(sep);
	try {
		const regex = new RegExp(argPattern);
		if (regex.test(argsString)) return true;
		if (String(platform ?? process.platform).trim().toLowerCase().startsWith("win")) {
			const normalized = argsString.replace(/\//g, "\\");
			if (normalized !== argsString && regex.test(normalized)) return true;
		}
		if (sep === " ") {
			const stripped = stripTrailingRedirections(argsString);
			if (stripped !== argsString && regex.test(stripped)) return true;
		}
		return false;
	} catch {
		return false;
	}
}
function matchAllowlist(entries, resolution, argv, platform) {
	if (!entries.length) return null;
	const bareWild = entries.find((e) => e.pattern?.trim() === "*" && !e.argPattern);
	if (bareWild && resolution) return bareWild;
	if (!resolution?.resolvedPath) return null;
	const resolvedPath = resolution.resolvedPath;
	const effectivePlatform = platform ?? process.platform;
	const useArgPattern = String(effectivePlatform).trim().toLowerCase().startsWith("win");
	let pathOnlyMatch = null;
	for (const entry of entries) {
		const pattern = entry.pattern?.trim();
		if (!pattern) continue;
		if (!(pattern.includes("/") || pattern.includes("\\") || pattern.includes("~"))) continue;
		if (!matchesExecAllowlistPattern(pattern, resolvedPath)) continue;
		if (!useArgPattern) return entry;
		if (!entry.argPattern) {
			if (!pathOnlyMatch) pathOnlyMatch = entry;
			continue;
		}
		if (argv && matchArgPattern(entry.argPattern, argv, platform)) return entry;
	}
	return pathOnlyMatch;
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
	"`",
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
const WINDOWS_ALWAYS_UNSAFE_TOKENS = new Set([
	"\n",
	"\r",
	"%",
	"`"
]);
function findWindowsUnsupportedToken(command) {
	let inDouble = false;
	for (let i = 0; i < command.length; i++) {
		const ch = command[i];
		if (ch === "\"") {
			inDouble = !inDouble;
			continue;
		}
		if (ch === "$") {
			const next = command[i + 1];
			if (next !== void 0 && /[A-Za-z_{(?$]/.test(next)) return "$";
			continue;
		}
		if (WINDOWS_UNSUPPORTED_TOKENS.has(ch)) {
			if (inDouble && !WINDOWS_ALWAYS_UNSAFE_TOKENS.has(ch)) continue;
			if (ch === "\n" || ch === "\r") return "newline";
			return ch;
		}
	}
	return null;
}
function tokenizeWindowsSegment(segment) {
	const tokens = [];
	let buf = "";
	let inDouble = false;
	let inSingle = false;
	let wasQuoted = false;
	const pushToken = () => {
		if (buf.length > 0 || wasQuoted) {
			tokens.push(buf);
			buf = "";
		}
		wasQuoted = false;
	};
	for (let i = 0; i < segment.length; i += 1) {
		const ch = segment[i];
		if (ch === "\"" && !inSingle) {
			if (!inDouble) wasQuoted = true;
			inDouble = !inDouble;
			continue;
		}
		if (ch === "'" && !inDouble) {
			if (inSingle && segment[i + 1] === "'") {
				buf += "'";
				i += 1;
				continue;
			}
			if (!inSingle) wasQuoted = true;
			inSingle = !inSingle;
			continue;
		}
		if (!inDouble && !inSingle && /\s/.test(ch)) {
			pushToken();
			continue;
		}
		buf += ch;
	}
	if (inDouble || inSingle) return null;
	pushToken();
	return tokens.length > 0 ? tokens : null;
}
/**
* Recursively strip transparent Windows shell wrappers from a command string.
*
* LLMs generate commands with arbitrary nesting of shell wrappers:
*   powershell -NoProfile -Command "& node 'C:\path' --count 3"
*   cmd /c "node C:\path --count 3"
*   & node C:\path --count 3
*
* All of these should resolve to: node C:\path --count 3
*
* Recognised wrappers (applied repeatedly until stable):
*   - PowerShell call-operator: `& exe args`
*   - cmd.exe pass-through:    `cmd /c "..."` or `cmd /c ...`
*   - PowerShell invocation:   `powershell [-flags] -Command "..."`
*/
function stripWindowsShellWrapper(command) {
	const MAX_DEPTH = 5;
	let result = command;
	for (let i = 0; i < MAX_DEPTH; i++) {
		const prev = result;
		result = stripWindowsShellWrapperOnce(result.trim());
		if (result === prev) break;
	}
	return result;
}
function stripWindowsShellWrapperOnce(command) {
	const psCallMatch = command.match(/^&\s+(.+)$/s);
	if (psCallMatch) return psCallMatch[1];
	const psFlags = /(?:-(?!c(?:ommand)?\b|-command\b)\w+(?:\s+(?!-)(?:"[^"]*(?:""[^"]*)*"|'[^']*(?:''[^']*)*'|\S+))?\s+)*/i.source;
	const psCommandFlag = `(?:-command|-c|--command)`;
	const psInvokeMatch = command.match(new RegExp(`^(?:powershell|pwsh)(?:\\.exe)?\\s+${psFlags}${psCommandFlag}\\s+"(.+)"$`, "is"));
	if (psInvokeMatch) return psInvokeMatch[1].replace(/""/g, "\"");
	const psInvokeSingleQuote = command.match(new RegExp(`^(?:powershell|pwsh)(?:\\.exe)?\\s+${psFlags}${psCommandFlag}\\s+'(.+)'$`, "is"));
	if (psInvokeSingleQuote) return psInvokeSingleQuote[1].replace(/''/g, "'");
	const psInvokeNoQuote = command.match(new RegExp(`^(?:powershell|pwsh)(?:\\.exe)?\\s+${psFlags}${psCommandFlag}\\s+(.+)$`, "is"));
	if (psInvokeNoQuote) return psInvokeNoQuote[1];
	return command;
}
function analyzeWindowsShellCommand(params) {
	const effective = stripWindowsShellWrapper(params.command.trim());
	const unsupported = findWindowsUnsupportedToken(effective);
	if (unsupported) return {
		ok: false,
		reason: `unsupported windows shell token: ${unsupported}`,
		segments: []
	};
	const argv = tokenizeWindowsSegment(effective);
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
const WINDOWS_UNSAFE_CMD_META = /[%`]|\$(?=[A-Za-z_{(?$])/;
function windowsEscapeArg(value) {
	if (value === "") return {
		ok: true,
		escaped: "\"\""
	};
	if (WINDOWS_UNSAFE_CMD_META.test(value)) return { ok: false };
	if (/^[a-zA-Z0-9_./:~\\=-]+$/.test(value)) return {
		ok: true,
		escaped: value
	};
	return {
		ok: true,
		escaped: `"${value.replace(/"/g, "\"\"")}"`
	};
}
function rebuildWindowsShellCommandFromSource(params) {
	const source = stripWindowsShellWrapper(params.command.trim());
	if (!source) return {
		ok: false,
		reason: "empty command"
	};
	const unsupported = findWindowsUnsupportedToken(source);
	if (unsupported) return {
		ok: false,
		reason: `unsupported windows shell token: ${unsupported}`
	};
	const rendered = params.renderSegment(source, 0);
	if (!rendered.ok) return {
		ok: false,
		reason: rendered.reason
	};
	return {
		ok: true,
		command: `& ${rendered.rendered}`,
		segmentCount: 1
	};
}
function rebuildShellCommandFromSource(params) {
	if (isWindowsPlatform(params.platform ?? null)) return rebuildWindowsShellCommandFromSource(params);
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
	const isWindows = isWindowsPlatform(params.platform);
	return finalizeRebuiltShellCommand(rebuildShellCommandFromSource({
		command: params.command,
		platform: params.platform,
		renderSegment: (segmentRaw) => {
			const argv = isWindows ? tokenizeWindowsSegment(segmentRaw) ?? [] : splitShellArgs(segmentRaw) ?? [];
			if (argv.length === 0) return {
				ok: false,
				reason: "unable to parse shell segment"
			};
			if (isWindows) return renderWindowsQuotedArgv(argv);
			return {
				ok: true,
				rendered: argv.map((token) => shellEscapeSingleArg(token)).join(" ")
			};
		}
	}));
}
function renderWindowsQuotedArgv(argv) {
	const parts = [];
	for (const token of argv) {
		const result = windowsEscapeArg(token);
		if (!result.ok) return {
			ok: false,
			reason: `unsafe windows token: ${token}`
		};
		parts.push(result.escaped);
	}
	return {
		ok: true,
		rendered: parts.join(" ")
	};
}
function renderQuotedArgv(argv, platform) {
	if (isWindowsPlatform(platform)) {
		const result = renderWindowsQuotedArgv(argv);
		return result.ok ? result.rendered : null;
	}
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
function renderSafeBinSegmentArgv(segment, platform) {
	const argv = resolvePlannedSegmentArgv(segment);
	if (!argv || argv.length === 0) return null;
	return renderQuotedArgv(argv, platform);
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
			const rendered = renderSafeBinSegmentArgv(seg, params.platform);
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
			const rendered = renderQuotedArgv(argv, params.platform);
			if (!rendered) return {
				ok: false,
				reason: "unsafe windows token in argv"
			};
			return {
				ok: true,
				rendered
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
const JQ_ENV_VARIABLE_PATTERN = /\$ENV\b/;
const ALWAYS_DENY_SAFE_BIN_SEMANTICS = () => false;
const UNSAFE_SAFE_BIN_WARNINGS = {
	awk: "awk-family interpreters can execute commands, access ENVIRON, and write files, so prefer explicit allowlist entries or approval-gated runs instead of safeBins.",
	jq: "jq supports broad jq programs and builtins (for example `env`), so prefer explicit allowlist entries or approval-gated runs instead of safeBins.",
	sed: "sed scripts can execute commands and write files, so prefer explicit allowlist entries or approval-gated runs instead of safeBins."
};
const SAFE_BIN_SEMANTIC_RULES = {
	jq: {
		validate: ({ positional }) => !positional.some((token) => JQ_ENV_FILTER_PATTERN.test(token) || JQ_ENV_VARIABLE_PATTERN.test(token)),
		configWarning: UNSAFE_SAFE_BIN_WARNINGS.jq
	},
	awk: {
		validate: ALWAYS_DENY_SAFE_BIN_SEMANTICS,
		configWarning: UNSAFE_SAFE_BIN_WARNINGS.awk
	},
	gawk: {
		validate: ALWAYS_DENY_SAFE_BIN_SEMANTICS,
		configWarning: UNSAFE_SAFE_BIN_WARNINGS.awk
	},
	mawk: {
		validate: ALWAYS_DENY_SAFE_BIN_SEMANTICS,
		configWarning: UNSAFE_SAFE_BIN_WARNINGS.awk
	},
	nawk: {
		validate: ALWAYS_DENY_SAFE_BIN_SEMANTICS,
		configWarning: UNSAFE_SAFE_BIN_WARNINGS.awk
	},
	sed: {
		validate: ALWAYS_DENY_SAFE_BIN_SEMANTICS,
		configWarning: UNSAFE_SAFE_BIN_WARNINGS.sed
	},
	gsed: {
		validate: ALWAYS_DENY_SAFE_BIN_SEMANTICS,
		configWarning: UNSAFE_SAFE_BIN_WARNINGS.sed
	}
};
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
			stat = fsSync.statSync(dir);
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
//#region src/config/materialize.ts
const MATERIALIZATION_PROFILES = {
	load: {
		includeTalkApiKey: false,
		includeCompactionDefaults: true,
		includeContextPruningDefaults: true,
		includeLoggingDefaults: true,
		normalizePaths: true
	},
	missing: {
		includeTalkApiKey: true,
		includeCompactionDefaults: true,
		includeContextPruningDefaults: true,
		includeLoggingDefaults: false,
		normalizePaths: false
	},
	snapshot: {
		includeTalkApiKey: true,
		includeCompactionDefaults: false,
		includeContextPruningDefaults: false,
		includeLoggingDefaults: true,
		normalizePaths: true
	}
};
function asResolvedSourceConfig(config) {
	return config;
}
function asRuntimeConfig(config) {
	return config;
}
function materializeRuntimeConfig(config, mode) {
	const profile = MATERIALIZATION_PROFILES[mode];
	let next = applyMessageDefaults(config);
	if (profile.includeLoggingDefaults) next = applyLoggingDefaults(next);
	next = applySessionDefaults(next);
	next = applyAgentDefaults(next);
	if (profile.includeContextPruningDefaults) next = applyContextPruningDefaults(next);
	if (profile.includeCompactionDefaults) next = applyCompactionDefaults(next);
	next = applyModelDefaults(next);
	next = applyTalkConfigNormalization(next);
	if (profile.includeTalkApiKey) next = applyTalkApiKey(next);
	if (profile.normalizePaths) normalizeConfigPaths(next);
	normalizeExecSafeBinProfilesInConfig(next);
	return asRuntimeConfig(next);
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
	params: z.record(z.string(), z.unknown()).optional(),
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
	llm: z.object({ idleTimeoutSeconds: z.number().int().nonnegative().optional().describe("Idle timeout for LLM streaming responses in seconds. If no token is received within this time, the request is aborted. Set to 0 to disable. Default: 60 seconds.") }).strict().optional(),
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
		}).strict().optional(),
		notifyUser: z.boolean().optional()
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
		announceTimeoutMs: z.number().int().positive().optional(),
		requireAgentId: z.boolean().optional()
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
const ApprovalsSchema = z.object({
	exec: ExecApprovalForwardingSchema,
	plugin: ExecApprovalForwardingSchema
}).strict().optional();
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
	channel: z.string().trim().min(1).optional(),
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
//#region src/config/zod-schema.providers.ts
const ChannelModelByChannelSchema = z.record(z.string(), z.record(z.string(), z.string())).optional();
const directChannelRuntimeSchemas = new Map([
	["bluebubbles", { safeParse: (value) => BlueBubblesConfigSchema.safeParse(value) }],
	["discord", { safeParse: (value) => DiscordConfigSchema.safeParse(value) }],
	["googlechat", { safeParse: (value) => GoogleChatConfigSchema.safeParse(value) }],
	["imessage", { safeParse: (value) => IMessageConfigSchema.safeParse(value) }],
	["irc", { safeParse: (value) => IrcConfigSchema.safeParse(value) }],
	["msteams", { safeParse: (value) => MSTeamsConfigSchema.safeParse(value) }],
	["signal", { safeParse: (value) => SignalConfigSchema.safeParse(value) }],
	["slack", { safeParse: (value) => SlackConfigSchema.safeParse(value) }],
	["telegram", { safeParse: (value) => TelegramConfigSchema.safeParse(value) }],
	["whatsapp", { safeParse: (value) => WhatsAppConfigSchema.safeParse(value) }]
]);
function addLegacyChannelAcpBindingIssues(value, ctx, path = []) {
	if (!value || typeof value !== "object") return;
	if (Array.isArray(value)) {
		value.forEach((entry, index) => addLegacyChannelAcpBindingIssues(entry, ctx, [...path, index]));
		return;
	}
	const record = value;
	const bindings = record.bindings;
	if (bindings && typeof bindings === "object" && !Array.isArray(bindings)) {
		const acp = bindings.acp;
		if (acp && typeof acp === "object") ctx.addIssue({
			code: z.ZodIssueCode.custom,
			path: [
				...path,
				"bindings",
				"acp"
			],
			message: "Legacy channel-local ACP bindings were removed; use top-level bindings[] entries."
		});
	}
	for (const [key, entry] of Object.entries(record)) addLegacyChannelAcpBindingIssues(entry, ctx, [...path, key]);
}
function normalizeBundledChannelConfigs(value, ctx) {
	if (!value) return value;
	let next;
	for (const [channelId, runtimeSchema] of directChannelRuntimeSchemas) {
		if (!Object.prototype.hasOwnProperty.call(value, channelId)) continue;
		const parsed = runtimeSchema.safeParse(value[channelId]);
		if (!parsed.success) {
			for (const issue of parsed.error.issues) ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: issue.message ?? `Invalid channels.${channelId} config.`,
				path: [channelId, ...Array.isArray(issue.path) ? issue.path : []]
			});
			continue;
		}
		next ??= { ...value };
		next[channelId] = parsed.data;
	}
	return next ?? value;
}
const ChannelsSchema = z.object({
	defaults: z.object({
		groupPolicy: GroupPolicySchema.optional(),
		heartbeat: ChannelHeartbeatVisibilitySchema
	}).strict().optional(),
	modelByChannel: ChannelModelByChannelSchema
}).passthrough().superRefine((value, ctx) => {
	addLegacyChannelAcpBindingIssues(value, ctx);
}).transform((value, ctx) => normalizeBundledChannelConfigs(value, ctx)).optional();
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
	searchTool: z.string().trim().min(1).optional(),
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
	url: HttpUrlSchema.optional(),
	headers: z.record(z.string(), z.union([
		z.string().register(sensitive),
		z.number(),
		z.boolean()
	]).register(sensitive)).optional()
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
			email: z.string().optional(),
			displayName: z.string().optional()
		}).strict()).optional(),
		order: z.record(z.string(), z.array(z.string())).optional(),
		cooldowns: z.object({
			billingBackoffHours: z.number().positive().optional(),
			billingBackoffHoursByProvider: z.record(z.string(), z.number().positive()).optional(),
			billingMaxHours: z.number().positive().optional(),
			failureWindowHours: z.number().positive().optional(),
			overloadedProfileRotations: z.number().int().nonnegative().optional(),
			overloadedBackoffMs: z.number().int().nonnegative().optional(),
			rateLimitedProfileRotations: z.number().int().nonnegative().optional()
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
		webchat: z.object({ chatHistoryMaxChars: z.number().int().positive().max(5e5).optional() }).strict().optional(),
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
const CUSTOM_EXPECTED_ONE_OF_RE = /expected one of ((?:"[^"]+"(?:\|"?[^"]+"?)*)+)/i;
const SECRETREF_POLICY_DOC_URL = "https://docs.openclaw.ai/reference/secretref-credential-surface";
const bundledChannelSchemaById = new Map(GENERATED_BUNDLED_CHANNEL_CONFIG_METADATA.map((entry) => [entry.channelId, entry.schema]));
function toIssueRecord(value) {
	if (!value || typeof value !== "object") return null;
	return value;
}
function toConfigPathSegments(path) {
	if (!Array.isArray(path)) return [];
	return path.filter((segment) => {
		const segmentType = typeof segment;
		return segmentType === "string" || segmentType === "number";
	});
}
function formatConfigPath(segments) {
	return segments.join(".");
}
function asJsonSchemaLike(value) {
	return value && typeof value === "object" ? value : null;
}
function lookupJsonSchemaNode(schema, pathSegments) {
	let current = asJsonSchemaLike(schema);
	for (const segment of pathSegments) {
		if (!current) return null;
		if (typeof segment === "number") {
			const items = current.items;
			if (Array.isArray(items)) {
				current = asJsonSchemaLike(items[segment] ?? items[0]);
				continue;
			}
			current = asJsonSchemaLike(items);
			continue;
		}
		const properties = asJsonSchemaLike(current.properties);
		current = properties && asJsonSchemaLike(properties[segment]) || asJsonSchemaLike(current.additionalProperties);
	}
	return current;
}
function collectAllowedValuesFromJsonSchemaNode(schema) {
	const node = asJsonSchemaLike(schema);
	if (!node) return {
		values: [],
		incomplete: false,
		hasValues: false
	};
	if (Object.prototype.hasOwnProperty.call(node, "const")) return {
		values: [node.const],
		incomplete: false,
		hasValues: true
	};
	if (Array.isArray(node.enum)) return {
		values: node.enum,
		incomplete: false,
		hasValues: node.enum.length > 0
	};
	const type = node.type;
	if (type === "boolean") return {
		values: [true, false],
		incomplete: false,
		hasValues: true
	};
	if (Array.isArray(type) && type.includes("boolean")) return {
		values: [true, false],
		incomplete: false,
		hasValues: true
	};
	const unionBranches = Array.isArray(node.anyOf) ? node.anyOf : Array.isArray(node.oneOf) ? node.oneOf : null;
	if (!unionBranches) return {
		values: [],
		incomplete: false,
		hasValues: false
	};
	const collected = [];
	for (const branch of unionBranches) {
		const branchCollected = collectAllowedValuesFromJsonSchemaNode(branch);
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
function collectAllowedValuesFromBundledChannelSchemaPath(pathSegments) {
	if (pathSegments[0] !== "channels" || typeof pathSegments[1] !== "string") return {
		values: [],
		incomplete: false,
		hasValues: false
	};
	const channelSchema = bundledChannelSchemaById.get(pathSegments[1]);
	if (!channelSchema) return {
		values: [],
		incomplete: false,
		hasValues: false
	};
	const targetNode = lookupJsonSchemaNode(channelSchema, pathSegments.slice(2));
	if (!targetNode) return {
		values: [],
		incomplete: false,
		hasValues: false
	};
	return collectAllowedValuesFromJsonSchemaNode(targetNode);
}
function collectAllowedValuesFromCustomIssue(record) {
	const expectedMatch = (typeof record.message === "string" ? record.message : "").match(CUSTOM_EXPECTED_ONE_OF_RE);
	if (expectedMatch?.[1]) {
		const values = [...expectedMatch[1].matchAll(/"([^"]+)"/g)].map((match) => match[1]);
		return {
			values,
			incomplete: false,
			hasValues: values.length > 0
		};
	}
	return collectAllowedValuesFromBundledChannelSchemaPath(toConfigPathSegments(record.path));
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
	if (code === "custom") return collectAllowedValuesFromCustomIssue(record);
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
function isObjectSecretRefCandidate(value) {
	if (!value || typeof value !== "object" || Array.isArray(value)) return false;
	return coerceSecretRef(value) !== null;
}
function formatUnsupportedMutableSecretRefMessage(path) {
	return [
		`SecretRef objects are not supported at ${path}.`,
		"This credential is runtime-mutable or runtime-managed and must stay a plain string value.",
		"Use a plain string (env template strings like \"${MY_VAR}\" are allowed).",
		`See ${SECRETREF_POLICY_DOC_URL}.`
	].join(" ");
}
function pushUnsupportedMutableSecretRefIssue(issues, path, value) {
	if (!isObjectSecretRefCandidate(value)) return;
	issues.push({
		path,
		message: formatUnsupportedMutableSecretRefMessage(path)
	});
}
function collectUnsupportedMutableSecretRefIssues(raw) {
	const issues = [];
	for (const candidate of collectUnsupportedSecretRefConfigCandidates(raw)) pushUnsupportedMutableSecretRefIssue(issues, candidate.path, candidate.value);
	return issues;
}
function isUnsupportedMutableSecretRefSchemaIssue(params) {
	const { issue, policyIssue } = params;
	if (issue.path === policyIssue.path) return /expected string, received object/i.test(issue.message);
	if (!issue.path || !policyIssue.path || !policyIssue.path.startsWith(`${issue.path}.`)) return false;
	const childKey = policyIssue.path.slice(issue.path.length + 1).split(".")[0];
	if (!childKey) return false;
	if (!/Unrecognized key/i.test(issue.message)) return false;
	const unrecognizedKeys = [...issue.message.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
	if (unrecognizedKeys.length === 0) return false;
	return unrecognizedKeys.length === 1 && unrecognizedKeys[0] === childKey;
}
function mergeUnsupportedMutableSecretRefIssues(policyIssues, schemaIssues) {
	if (policyIssues.length === 0) return schemaIssues;
	const filteredSchemaIssues = schemaIssues.filter((issue) => !policyIssues.some((policyIssue) => isUnsupportedMutableSecretRefSchemaIssue({
		issue,
		policyIssue
	})));
	return [...policyIssues, ...filteredSchemaIssues];
}
function collectUnsupportedSecretRefPolicyIssues(raw) {
	return collectUnsupportedMutableSecretRefIssues(raw);
}
function mapZodIssueToConfigIssue(issue) {
	const record = toIssueRecord(issue);
	const path = formatConfigPath(toConfigPathSegments(record?.path));
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
	const policyIssues = collectUnsupportedSecretRefPolicyIssues(raw);
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
		issues: mergeUnsupportedMutableSecretRefIssues(policyIssues, validated.error.issues.map((issue) => mapZodIssueToConfigIssue(issue)))
	};
	if (policyIssues.length > 0) return {
		ok: false,
		issues: policyIssues
	};
	const validatedConfig = validated.data;
	const duplicates = findDuplicateAgentDirs(validatedConfig);
	if (duplicates.length > 0) return {
		ok: false,
		issues: [{
			path: "agents.list",
			message: formatDuplicateAgentDirError(duplicates)
		}]
	};
	const avatarIssues = validateIdentityAvatar(validatedConfig);
	if (avatarIssues.length > 0) return {
		ok: false,
		issues: avatarIssues
	};
	const gatewayTailscaleBindIssues = validateGatewayTailscaleBind(validatedConfig);
	if (gatewayTailscaleBindIssues.length > 0) return {
		ok: false,
		issues: gatewayTailscaleBindIssues
	};
	return {
		ok: true,
		config: validatedConfig
	};
}
function validateConfigObject(raw) {
	const result = validateConfigObjectRaw(raw);
	if (!result.ok) return result;
	return {
		ok: true,
		config: materializeRuntimeConfig(result.config, "snapshot")
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
	const warnings = [];
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
	const ensureChannelSchemas = () => {
		const info = ensureRegistry();
		if (!info.channelSchemas) info.channelSchemas = new Map(collectChannelSchemaMetadata(info.registry).map((entry) => [entry.id, { schema: entry.configSchema }]));
		return info.channelSchemas;
	};
	let mutatedConfig = config;
	let channelsCloned = false;
	let pluginsCloned = false;
	let pluginEntriesCloned = false;
	const replaceChannelConfig = (channelId, nextValue) => {
		if (!channelsCloned) {
			mutatedConfig = {
				...mutatedConfig,
				channels: { ...mutatedConfig.channels }
			};
			channelsCloned = true;
		}
		mutatedConfig.channels[channelId] = nextValue;
	};
	const replacePluginEntryConfig = (pluginId, nextValue) => {
		if (!pluginsCloned) {
			mutatedConfig = {
				...mutatedConfig,
				plugins: { ...mutatedConfig.plugins }
			};
			pluginsCloned = true;
		}
		if (!pluginEntriesCloned) {
			mutatedConfig.plugins = {
				...mutatedConfig.plugins,
				entries: { ...mutatedConfig.plugins?.entries }
			};
			pluginEntriesCloned = true;
		}
		const currentEntry = mutatedConfig.plugins?.entries?.[pluginId];
		mutatedConfig.plugins.entries[pluginId] = {
			...currentEntry,
			config: nextValue
		};
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
		if (!allowedChannels.has(trimmed)) {
			issues.push({
				path: `channels.${trimmed}`,
				message: `unknown channel id: ${trimmed}`
			});
			continue;
		}
		const channelSchema = ensureChannelSchemas().get(trimmed)?.schema;
		if (!channelSchema) continue;
		const result = validateJsonSchemaValue({
			schema: channelSchema,
			cacheKey: `channel:${trimmed}`,
			value: config.channels[trimmed],
			applyDefaults: true
		});
		if (!result.ok) {
			for (const error of result.errors) issues.push({
				path: error.path === "<root>" ? `channels.${trimmed}` : `channels.${trimmed}.${error.path}`,
				message: `invalid config: ${error.message}`,
				allowedValues: error.allowedValues,
				allowedValuesHiddenCount: error.allowedValuesHiddenCount
			});
			continue;
		}
		replaceChannelConfig(trimmed, result.value);
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
			config: mutatedConfig,
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
		const activationState = resolveEffectivePluginActivationState({
			id: pluginId,
			origin: record.origin,
			config: normalizedPlugins,
			rootConfig: config
		});
		let enabled = activationState.activated;
		let reason = activationState.reason;
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
			if (memoryDecision.selected && hasKind(record.kind, "memory")) selectedMemoryPluginId = pluginId;
		}
		if (enabled || entryHasConfig) if (record.configSchema) {
			const res = validateJsonSchemaValue({
				schema: record.configSchema,
				cacheKey: record.schemaCacheKey ?? record.manifestPath ?? pluginId,
				value: entry?.config ?? {},
				applyDefaults: true
			});
			if (!res.ok) for (const error of res.errors) issues.push({
				path: resolvePluginConfigIssuePath(pluginId, error.path),
				message: `invalid config: ${error.message}`,
				allowedValues: error.allowedValues,
				allowedValuesHiddenCount: error.allowedValuesHiddenCount
			});
			else if (entry || entryHasConfig) replacePluginEntryConfig(pluginId, res.value);
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
		config: mutatedConfig,
		warnings
	};
}
//#endregion
//#region src/config/legacy-migrate.ts
function migrateLegacyConfig(raw) {
	const { next, changes } = applyLegacyMigrations(raw);
	if (!next) return {
		config: null,
		changes: []
	};
	const validated = validateConfigObjectWithPlugins(next);
	if (!validated.ok) {
		changes.push("Migration applied, but config still invalid; fix remaining issues manually.");
		return {
			config: null,
			changes
		};
	}
	return {
		config: validated.config,
		changes
	};
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
	if (parsedA.prerelease || parsedB.prerelease) return comparePrereleaseIdentifiers(parsedA.prerelease, parsedB.prerelease);
	return 0;
}
function shouldWarnOnTouchedVersion(current, touched) {
	const parsedCurrent = parseOpenClawVersion(current);
	const parsedTouched = parseOpenClawVersion(touched);
	if (parsedCurrent && parsedTouched && parsedCurrent.major === parsedTouched.major && parsedCurrent.minor === parsedTouched.minor && parsedCurrent.patch === parsedTouched.patch && parsedTouched.revision != null) return false;
	if (isSameOpenClawStableFamily(current, touched)) return false;
	const cmp = compareOpenClawVersions(current, touched);
	return cmp !== null && cmp < 0;
}
function releaseRank(version) {
	if (version.prerelease?.length) return 0;
	if (version.revision != null) return 2;
	return 1;
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
const CONFIG_HEALTH_STATE_FILENAME = "config-health.json";
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
function resolveConfigHealthStatePath(env, homedir) {
	return path.join(resolveStateDir(env, homedir), "logs", CONFIG_HEALTH_STATE_FILENAME);
}
function normalizeStatNumber(value) {
	return typeof value === "number" && Number.isFinite(value) ? value : null;
}
function normalizeStatId(value) {
	if (typeof value === "bigint") return value.toString();
	if (typeof value === "number" && Number.isFinite(value)) return String(value);
	return null;
}
function resolveConfigStatMetadata(stat) {
	return {
		dev: normalizeStatId(stat?.dev ?? null),
		ino: normalizeStatId(stat?.ino ?? null),
		mode: normalizeStatNumber(stat ? stat.mode & 511 : null),
		nlink: normalizeStatNumber(stat?.nlink ?? null),
		uid: normalizeStatNumber(stat?.uid ?? null),
		gid: normalizeStatNumber(stat?.gid ?? null)
	};
}
function resolveConfigWriteSuspiciousReasons(params) {
	const reasons = [];
	if (!params.existsBefore) return reasons;
	if (typeof params.previousBytes === "number" && typeof params.nextBytes === "number" && params.previousBytes >= 512 && params.nextBytes < Math.floor(params.previousBytes * .5)) reasons.push(`size-drop:${params.previousBytes}->${params.nextBytes}`);
	if (!params.hasMetaBefore) reasons.push("missing-meta-before-write");
	if (params.gatewayModeBefore && !params.gatewayModeAfter) reasons.push("gateway-mode-removed");
	return reasons;
}
async function appendConfigAuditRecord(deps, record) {
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
function appendConfigAuditRecordSync(deps, record) {
	try {
		const auditPath = resolveConfigAuditLogPath(deps.env, deps.homedir);
		deps.fs.mkdirSync(path.dirname(auditPath), {
			recursive: true,
			mode: 448
		});
		deps.fs.appendFileSync(auditPath, `${JSON.stringify(record)}\n`, {
			encoding: "utf-8",
			mode: 384
		});
	} catch {}
}
async function readConfigHealthState(deps) {
	try {
		const healthPath = resolveConfigHealthStatePath(deps.env, deps.homedir);
		const raw = await deps.fs.promises.readFile(healthPath, "utf-8");
		const parsed = JSON.parse(raw);
		return isPlainObject(parsed) ? parsed : {};
	} catch {
		return {};
	}
}
function readConfigHealthStateSync(deps) {
	try {
		const healthPath = resolveConfigHealthStatePath(deps.env, deps.homedir);
		const raw = deps.fs.readFileSync(healthPath, "utf-8");
		const parsed = JSON.parse(raw);
		return isPlainObject(parsed) ? parsed : {};
	} catch {
		return {};
	}
}
async function writeConfigHealthState(deps, state) {
	try {
		const healthPath = resolveConfigHealthStatePath(deps.env, deps.homedir);
		await deps.fs.promises.mkdir(path.dirname(healthPath), {
			recursive: true,
			mode: 448
		});
		await deps.fs.promises.writeFile(healthPath, `${JSON.stringify(state, null, 2)}\n`, {
			encoding: "utf-8",
			mode: 384
		});
	} catch {}
}
function writeConfigHealthStateSync(deps, state) {
	try {
		const healthPath = resolveConfigHealthStatePath(deps.env, deps.homedir);
		deps.fs.mkdirSync(path.dirname(healthPath), {
			recursive: true,
			mode: 448
		});
		deps.fs.writeFileSync(healthPath, `${JSON.stringify(state, null, 2)}\n`, {
			encoding: "utf-8",
			mode: 384
		});
	} catch {}
}
function getConfigHealthEntry(state, configPath) {
	const entries = state.entries;
	if (!entries || !isPlainObject(entries)) return {};
	const entry = entries[configPath];
	return entry && isPlainObject(entry) ? entry : {};
}
function setConfigHealthEntry(state, configPath, entry) {
	return {
		...state,
		entries: {
			...state.entries,
			[configPath]: entry
		}
	};
}
function isUpdateChannelOnlyRoot(value) {
	if (!isPlainObject(value)) return false;
	const keys = Object.keys(value);
	if (keys.length !== 1 || keys[0] !== "update") return false;
	const update = value.update;
	if (!isPlainObject(update)) return false;
	return Object.keys(update).length === 1 && typeof update.channel === "string";
}
function resolveConfigObserveSuspiciousReasons(params) {
	const reasons = [];
	const baseline = params.lastKnownGood;
	if (!baseline) return reasons;
	if (baseline.bytes >= 512 && params.bytes < Math.floor(baseline.bytes * .5)) reasons.push(`size-drop-vs-last-good:${baseline.bytes}->${params.bytes}`);
	if (baseline.hasMeta && !params.hasMeta) reasons.push("missing-meta-vs-last-good");
	if (baseline.gatewayMode && !params.gatewayMode) reasons.push("gateway-mode-missing-vs-last-good");
	if (baseline.gatewayMode && isUpdateChannelOnlyRoot(params.parsed)) reasons.push("update-channel-only-root");
	return reasons;
}
async function readConfigFingerprintForPath(deps, targetPath) {
	try {
		const raw = await deps.fs.promises.readFile(targetPath, "utf-8");
		const stat = await deps.fs.promises.stat(targetPath).catch(() => null);
		const parsedRes = parseConfigJson5(raw, deps.json5);
		const parsed = parsedRes.ok ? parsedRes.parsed : {};
		return {
			hash: hashConfigRaw(raw),
			bytes: Buffer.byteLength(raw, "utf-8"),
			mtimeMs: stat?.mtimeMs ?? null,
			ctimeMs: stat?.ctimeMs ?? null,
			...resolveConfigStatMetadata(stat),
			hasMeta: hasConfigMeta(parsed),
			gatewayMode: resolveGatewayMode(parsed),
			observedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
	} catch {
		return null;
	}
}
function readConfigFingerprintForPathSync(deps, targetPath) {
	try {
		const raw = deps.fs.readFileSync(targetPath, "utf-8");
		const stat = deps.fs.statSync(targetPath, { throwIfNoEntry: false }) ?? null;
		const parsedRes = parseConfigJson5(raw, deps.json5);
		const parsed = parsedRes.ok ? parsedRes.parsed : {};
		return {
			hash: hashConfigRaw(raw),
			bytes: Buffer.byteLength(raw, "utf-8"),
			mtimeMs: stat?.mtimeMs ?? null,
			ctimeMs: stat?.ctimeMs ?? null,
			...resolveConfigStatMetadata(stat),
			hasMeta: hasConfigMeta(parsed),
			gatewayMode: resolveGatewayMode(parsed),
			observedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
	} catch {
		return null;
	}
}
function formatConfigArtifactTimestamp(ts) {
	return ts.replaceAll(":", "-").replaceAll(".", "-");
}
async function persistClobberedConfigSnapshot(params) {
	const targetPath = `${params.configPath}.clobbered.${formatConfigArtifactTimestamp(params.observedAt)}`;
	try {
		await params.deps.fs.promises.writeFile(targetPath, params.raw, {
			encoding: "utf-8",
			mode: 384,
			flag: "wx"
		});
		return targetPath;
	} catch {
		return null;
	}
}
function persistClobberedConfigSnapshotSync(params) {
	const targetPath = `${params.configPath}.clobbered.${formatConfigArtifactTimestamp(params.observedAt)}`;
	try {
		params.deps.fs.writeFileSync(targetPath, params.raw, {
			encoding: "utf-8",
			mode: 384,
			flag: "wx"
		});
		return targetPath;
	} catch {
		return null;
	}
}
async function maybeRecoverSuspiciousConfigRead(params) {
	const stat = await params.deps.fs.promises.stat(params.configPath).catch(() => null);
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const current = {
		hash: hashConfigRaw(params.raw),
		bytes: Buffer.byteLength(params.raw, "utf-8"),
		mtimeMs: stat?.mtimeMs ?? null,
		ctimeMs: stat?.ctimeMs ?? null,
		...resolveConfigStatMetadata(stat),
		hasMeta: hasConfigMeta(params.parsed),
		gatewayMode: resolveGatewayMode(params.parsed),
		observedAt: now
	};
	let healthState = await readConfigHealthState(params.deps);
	const entry = getConfigHealthEntry(healthState, params.configPath);
	const backupPath = `${params.configPath}.bak`;
	const backupBaseline = entry.lastKnownGood ?? await readConfigFingerprintForPath(params.deps, backupPath) ?? void 0;
	const suspicious = resolveConfigObserveSuspiciousReasons({
		bytes: current.bytes,
		hasMeta: current.hasMeta,
		gatewayMode: current.gatewayMode,
		parsed: params.parsed,
		lastKnownGood: backupBaseline
	});
	if (!suspicious.includes("update-channel-only-root")) return {
		raw: params.raw,
		parsed: params.parsed
	};
	const suspiciousSignature = `${current.hash}:${suspicious.join(",")}`;
	const backupRaw = await params.deps.fs.promises.readFile(backupPath, "utf-8").catch(() => null);
	if (!backupRaw) return {
		raw: params.raw,
		parsed: params.parsed
	};
	const backupParsedRes = parseConfigJson5(backupRaw, params.deps.json5);
	if (!backupParsedRes.ok) return {
		raw: params.raw,
		parsed: params.parsed
	};
	const backup = backupBaseline ?? await readConfigFingerprintForPath(params.deps, backupPath);
	if (!backup?.gatewayMode) return {
		raw: params.raw,
		parsed: params.parsed
	};
	const clobberedPath = await persistClobberedConfigSnapshot({
		deps: params.deps,
		configPath: params.configPath,
		raw: params.raw,
		observedAt: now
	});
	let restoredFromBackup = false;
	try {
		await params.deps.fs.promises.copyFile(backupPath, params.configPath);
		restoredFromBackup = true;
	} catch {}
	params.deps.logger.warn(`Config auto-restored from backup: ${params.configPath} (${suspicious.join(", ")})`);
	await appendConfigAuditRecord(params.deps, {
		ts: now,
		source: "config-io",
		event: "config.observe",
		phase: "read",
		configPath: params.configPath,
		pid: process.pid,
		ppid: process.ppid,
		cwd: process.cwd(),
		argv: process.argv.slice(0, 8),
		execArgv: process.execArgv.slice(0, 8),
		exists: true,
		valid: true,
		hash: current.hash,
		bytes: current.bytes,
		mtimeMs: current.mtimeMs,
		ctimeMs: current.ctimeMs,
		dev: current.dev,
		ino: current.ino,
		mode: current.mode,
		nlink: current.nlink,
		uid: current.uid,
		gid: current.gid,
		hasMeta: current.hasMeta,
		gatewayMode: current.gatewayMode,
		suspicious,
		lastKnownGoodHash: entry.lastKnownGood?.hash ?? null,
		lastKnownGoodBytes: entry.lastKnownGood?.bytes ?? null,
		lastKnownGoodMtimeMs: entry.lastKnownGood?.mtimeMs ?? null,
		lastKnownGoodCtimeMs: entry.lastKnownGood?.ctimeMs ?? null,
		lastKnownGoodDev: entry.lastKnownGood?.dev ?? null,
		lastKnownGoodIno: entry.lastKnownGood?.ino ?? null,
		lastKnownGoodMode: entry.lastKnownGood?.mode ?? null,
		lastKnownGoodNlink: entry.lastKnownGood?.nlink ?? null,
		lastKnownGoodUid: entry.lastKnownGood?.uid ?? null,
		lastKnownGoodGid: entry.lastKnownGood?.gid ?? null,
		lastKnownGoodGatewayMode: entry.lastKnownGood?.gatewayMode ?? null,
		backupHash: backup?.hash ?? null,
		backupBytes: backup?.bytes ?? null,
		backupMtimeMs: backup?.mtimeMs ?? null,
		backupCtimeMs: backup?.ctimeMs ?? null,
		backupDev: backup?.dev ?? null,
		backupIno: backup?.ino ?? null,
		backupMode: backup?.mode ?? null,
		backupNlink: backup?.nlink ?? null,
		backupUid: backup?.uid ?? null,
		backupGid: backup?.gid ?? null,
		backupGatewayMode: backup?.gatewayMode ?? null,
		clobberedPath,
		restoredFromBackup,
		restoredBackupPath: backupPath
	});
	healthState = setConfigHealthEntry(healthState, params.configPath, {
		...entry,
		lastObservedSuspiciousSignature: suspiciousSignature
	});
	await writeConfigHealthState(params.deps, healthState);
	return {
		raw: backupRaw,
		parsed: backupParsedRes.parsed
	};
}
function maybeRecoverSuspiciousConfigReadSync(params) {
	const stat = params.deps.fs.statSync(params.configPath, { throwIfNoEntry: false }) ?? null;
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const current = {
		hash: hashConfigRaw(params.raw),
		bytes: Buffer.byteLength(params.raw, "utf-8"),
		mtimeMs: stat?.mtimeMs ?? null,
		ctimeMs: stat?.ctimeMs ?? null,
		...resolveConfigStatMetadata(stat),
		hasMeta: hasConfigMeta(params.parsed),
		gatewayMode: resolveGatewayMode(params.parsed),
		observedAt: now
	};
	let healthState = readConfigHealthStateSync(params.deps);
	const entry = getConfigHealthEntry(healthState, params.configPath);
	const backupPath = `${params.configPath}.bak`;
	const backupBaseline = entry.lastKnownGood ?? readConfigFingerprintForPathSync(params.deps, backupPath) ?? void 0;
	const suspicious = resolveConfigObserveSuspiciousReasons({
		bytes: current.bytes,
		hasMeta: current.hasMeta,
		gatewayMode: current.gatewayMode,
		parsed: params.parsed,
		lastKnownGood: backupBaseline
	});
	if (!suspicious.includes("update-channel-only-root")) return {
		raw: params.raw,
		parsed: params.parsed
	};
	const suspiciousSignature = `${current.hash}:${suspicious.join(",")}`;
	let backupRaw;
	try {
		backupRaw = params.deps.fs.readFileSync(backupPath, "utf-8");
	} catch {
		return {
			raw: params.raw,
			parsed: params.parsed
		};
	}
	const backupParsedRes = parseConfigJson5(backupRaw, params.deps.json5);
	if (!backupParsedRes.ok) return {
		raw: params.raw,
		parsed: params.parsed
	};
	const backup = backupBaseline ?? readConfigFingerprintForPathSync(params.deps, backupPath);
	if (!backup?.gatewayMode) return {
		raw: params.raw,
		parsed: params.parsed
	};
	const clobberedPath = persistClobberedConfigSnapshotSync({
		deps: params.deps,
		configPath: params.configPath,
		raw: params.raw,
		observedAt: now
	});
	let restoredFromBackup = false;
	try {
		params.deps.fs.copyFileSync(backupPath, params.configPath);
		restoredFromBackup = true;
	} catch {}
	params.deps.logger.warn(`Config auto-restored from backup: ${params.configPath} (${suspicious.join(", ")})`);
	appendConfigAuditRecordSync(params.deps, {
		ts: now,
		source: "config-io",
		event: "config.observe",
		phase: "read",
		configPath: params.configPath,
		pid: process.pid,
		ppid: process.ppid,
		cwd: process.cwd(),
		argv: process.argv.slice(0, 8),
		execArgv: process.execArgv.slice(0, 8),
		exists: true,
		valid: true,
		hash: current.hash,
		bytes: current.bytes,
		mtimeMs: current.mtimeMs,
		ctimeMs: current.ctimeMs,
		dev: current.dev,
		ino: current.ino,
		mode: current.mode,
		nlink: current.nlink,
		uid: current.uid,
		gid: current.gid,
		hasMeta: current.hasMeta,
		gatewayMode: current.gatewayMode,
		suspicious,
		lastKnownGoodHash: entry.lastKnownGood?.hash ?? null,
		lastKnownGoodBytes: entry.lastKnownGood?.bytes ?? null,
		lastKnownGoodMtimeMs: entry.lastKnownGood?.mtimeMs ?? null,
		lastKnownGoodCtimeMs: entry.lastKnownGood?.ctimeMs ?? null,
		lastKnownGoodDev: entry.lastKnownGood?.dev ?? null,
		lastKnownGoodIno: entry.lastKnownGood?.ino ?? null,
		lastKnownGoodMode: entry.lastKnownGood?.mode ?? null,
		lastKnownGoodNlink: entry.lastKnownGood?.nlink ?? null,
		lastKnownGoodUid: entry.lastKnownGood?.uid ?? null,
		lastKnownGoodGid: entry.lastKnownGood?.gid ?? null,
		lastKnownGoodGatewayMode: entry.lastKnownGood?.gatewayMode ?? null,
		backupHash: backup?.hash ?? null,
		backupBytes: backup?.bytes ?? null,
		backupMtimeMs: backup?.mtimeMs ?? null,
		backupCtimeMs: backup?.ctimeMs ?? null,
		backupDev: backup?.dev ?? null,
		backupIno: backup?.ino ?? null,
		backupMode: backup?.mode ?? null,
		backupNlink: backup?.nlink ?? null,
		backupUid: backup?.uid ?? null,
		backupGid: backup?.gid ?? null,
		backupGatewayMode: backup?.gatewayMode ?? null,
		clobberedPath,
		restoredFromBackup,
		restoredBackupPath: backupPath
	});
	healthState = setConfigHealthEntry(healthState, params.configPath, {
		...entry,
		lastObservedSuspiciousSignature: suspiciousSignature
	});
	writeConfigHealthStateSync(params.deps, healthState);
	return {
		raw: backupRaw,
		parsed: backupParsedRes.parsed
	};
}
function sameFingerprint(left, right) {
	if (!left) return false;
	return left.hash === right.hash && left.bytes === right.bytes && left.mtimeMs === right.mtimeMs && left.ctimeMs === right.ctimeMs && left.dev === right.dev && left.ino === right.ino && left.mode === right.mode && left.nlink === right.nlink && left.uid === right.uid && left.gid === right.gid && left.hasMeta === right.hasMeta && left.gatewayMode === right.gatewayMode;
}
async function observeConfigSnapshot(deps, snapshot) {
	if (!snapshot.exists || typeof snapshot.raw !== "string") return;
	const stat = await deps.fs.promises.stat(snapshot.path).catch(() => null);
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const current = {
		hash: resolveConfigSnapshotHash(snapshot) ?? hashConfigRaw(snapshot.raw),
		bytes: Buffer.byteLength(snapshot.raw, "utf-8"),
		mtimeMs: stat?.mtimeMs ?? null,
		ctimeMs: stat?.ctimeMs ?? null,
		...resolveConfigStatMetadata(stat),
		hasMeta: hasConfigMeta(snapshot.parsed),
		gatewayMode: resolveGatewayMode(snapshot.resolved),
		observedAt: now
	};
	let healthState = await readConfigHealthState(deps);
	const entry = getConfigHealthEntry(healthState, snapshot.path);
	const backupBaseline = entry.lastKnownGood ?? await readConfigFingerprintForPath(deps, `${snapshot.path}.bak`) ?? void 0;
	const suspicious = resolveConfigObserveSuspiciousReasons({
		bytes: current.bytes,
		hasMeta: current.hasMeta,
		gatewayMode: current.gatewayMode,
		parsed: snapshot.parsed,
		lastKnownGood: backupBaseline
	});
	if (suspicious.length === 0) {
		if (snapshot.valid) {
			const nextEntry = {
				lastKnownGood: current,
				lastObservedSuspiciousSignature: null
			};
			if (!sameFingerprint(entry.lastKnownGood, current) || entry.lastObservedSuspiciousSignature !== null) {
				healthState = setConfigHealthEntry(healthState, snapshot.path, nextEntry);
				await writeConfigHealthState(deps, healthState);
			}
		}
		return;
	}
	const suspiciousSignature = `${current.hash}:${suspicious.join(",")}`;
	if (entry.lastObservedSuspiciousSignature === suspiciousSignature) return;
	const backup = (backupBaseline?.hash ? backupBaseline : null) ?? await readConfigFingerprintForPath(deps, `${snapshot.path}.bak`);
	const clobberedPath = await persistClobberedConfigSnapshot({
		deps,
		configPath: snapshot.path,
		raw: snapshot.raw,
		observedAt: now
	});
	deps.logger.warn(`Config observe anomaly: ${snapshot.path} (${suspicious.join(", ")})`);
	await appendConfigAuditRecord(deps, {
		ts: now,
		source: "config-io",
		event: "config.observe",
		phase: "read",
		configPath: snapshot.path,
		pid: process.pid,
		ppid: process.ppid,
		cwd: process.cwd(),
		argv: process.argv.slice(0, 8),
		execArgv: process.execArgv.slice(0, 8),
		exists: true,
		valid: snapshot.valid,
		hash: current.hash,
		bytes: current.bytes,
		mtimeMs: current.mtimeMs,
		ctimeMs: current.ctimeMs,
		dev: current.dev,
		ino: current.ino,
		mode: current.mode,
		nlink: current.nlink,
		uid: current.uid,
		gid: current.gid,
		hasMeta: current.hasMeta,
		gatewayMode: current.gatewayMode,
		suspicious,
		lastKnownGoodHash: entry.lastKnownGood?.hash ?? null,
		lastKnownGoodBytes: entry.lastKnownGood?.bytes ?? null,
		lastKnownGoodMtimeMs: entry.lastKnownGood?.mtimeMs ?? null,
		lastKnownGoodCtimeMs: entry.lastKnownGood?.ctimeMs ?? null,
		lastKnownGoodDev: entry.lastKnownGood?.dev ?? null,
		lastKnownGoodIno: entry.lastKnownGood?.ino ?? null,
		lastKnownGoodMode: entry.lastKnownGood?.mode ?? null,
		lastKnownGoodNlink: entry.lastKnownGood?.nlink ?? null,
		lastKnownGoodUid: entry.lastKnownGood?.uid ?? null,
		lastKnownGoodGid: entry.lastKnownGood?.gid ?? null,
		lastKnownGoodGatewayMode: entry.lastKnownGood?.gatewayMode ?? null,
		backupHash: backup?.hash ?? null,
		backupBytes: backup?.bytes ?? null,
		backupMtimeMs: backup?.mtimeMs ?? null,
		backupCtimeMs: backup?.ctimeMs ?? null,
		backupDev: backup?.dev ?? null,
		backupIno: backup?.ino ?? null,
		backupMode: backup?.mode ?? null,
		backupNlink: backup?.nlink ?? null,
		backupUid: backup?.uid ?? null,
		backupGid: backup?.gid ?? null,
		backupGatewayMode: backup?.gatewayMode ?? null,
		clobberedPath,
		restoredFromBackup: false,
		restoredBackupPath: null
	});
	healthState = setConfigHealthEntry(healthState, snapshot.path, {
		...entry,
		lastObservedSuspiciousSignature: suspiciousSignature
	});
	await writeConfigHealthState(deps, healthState);
}
function observeConfigSnapshotSync(deps, snapshot) {
	if (!snapshot.exists || typeof snapshot.raw !== "string") return;
	const stat = deps.fs.statSync(snapshot.path, { throwIfNoEntry: false }) ?? null;
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const current = {
		hash: resolveConfigSnapshotHash(snapshot) ?? hashConfigRaw(snapshot.raw),
		bytes: Buffer.byteLength(snapshot.raw, "utf-8"),
		mtimeMs: stat?.mtimeMs ?? null,
		ctimeMs: stat?.ctimeMs ?? null,
		...resolveConfigStatMetadata(stat),
		hasMeta: hasConfigMeta(snapshot.parsed),
		gatewayMode: resolveGatewayMode(snapshot.resolved),
		observedAt: now
	};
	let healthState = readConfigHealthStateSync(deps);
	const entry = getConfigHealthEntry(healthState, snapshot.path);
	const backupBaseline = entry.lastKnownGood ?? readConfigFingerprintForPathSync(deps, `${snapshot.path}.bak`) ?? void 0;
	const suspicious = resolveConfigObserveSuspiciousReasons({
		bytes: current.bytes,
		hasMeta: current.hasMeta,
		gatewayMode: current.gatewayMode,
		parsed: snapshot.parsed,
		lastKnownGood: backupBaseline
	});
	if (suspicious.length === 0) {
		if (snapshot.valid) {
			const nextEntry = {
				lastKnownGood: current,
				lastObservedSuspiciousSignature: null
			};
			if (!sameFingerprint(entry.lastKnownGood, current) || entry.lastObservedSuspiciousSignature !== null) {
				healthState = setConfigHealthEntry(healthState, snapshot.path, nextEntry);
				writeConfigHealthStateSync(deps, healthState);
			}
		}
		return;
	}
	const suspiciousSignature = `${current.hash}:${suspicious.join(",")}`;
	if (entry.lastObservedSuspiciousSignature === suspiciousSignature) return;
	const backup = (backupBaseline?.hash ? backupBaseline : null) ?? readConfigFingerprintForPathSync(deps, `${snapshot.path}.bak`);
	const clobberedPath = persistClobberedConfigSnapshotSync({
		deps,
		configPath: snapshot.path,
		raw: snapshot.raw,
		observedAt: now
	});
	deps.logger.warn(`Config observe anomaly: ${snapshot.path} (${suspicious.join(", ")})`);
	appendConfigAuditRecordSync(deps, {
		ts: now,
		source: "config-io",
		event: "config.observe",
		phase: "read",
		configPath: snapshot.path,
		pid: process.pid,
		ppid: process.ppid,
		cwd: process.cwd(),
		argv: process.argv.slice(0, 8),
		execArgv: process.execArgv.slice(0, 8),
		exists: true,
		valid: snapshot.valid,
		hash: current.hash,
		bytes: current.bytes,
		mtimeMs: current.mtimeMs,
		ctimeMs: current.ctimeMs,
		dev: current.dev,
		ino: current.ino,
		mode: current.mode,
		nlink: current.nlink,
		uid: current.uid,
		gid: current.gid,
		hasMeta: current.hasMeta,
		gatewayMode: current.gatewayMode,
		suspicious,
		lastKnownGoodHash: entry.lastKnownGood?.hash ?? null,
		lastKnownGoodBytes: entry.lastKnownGood?.bytes ?? null,
		lastKnownGoodMtimeMs: entry.lastKnownGood?.mtimeMs ?? null,
		lastKnownGoodCtimeMs: entry.lastKnownGood?.ctimeMs ?? null,
		lastKnownGoodDev: entry.lastKnownGood?.dev ?? null,
		lastKnownGoodIno: entry.lastKnownGood?.ino ?? null,
		lastKnownGoodMode: entry.lastKnownGood?.mode ?? null,
		lastKnownGoodNlink: entry.lastKnownGood?.nlink ?? null,
		lastKnownGoodUid: entry.lastKnownGood?.uid ?? null,
		lastKnownGoodGid: entry.lastKnownGood?.gid ?? null,
		lastKnownGoodGatewayMode: entry.lastKnownGood?.gatewayMode ?? null,
		backupHash: backup?.hash ?? null,
		backupBytes: backup?.bytes ?? null,
		backupMtimeMs: backup?.mtimeMs ?? null,
		backupCtimeMs: backup?.ctimeMs ?? null,
		backupDev: backup?.dev ?? null,
		backupIno: backup?.ino ?? null,
		backupMode: backup?.mode ?? null,
		backupNlink: backup?.nlink ?? null,
		backupUid: backup?.uid ?? null,
		backupGid: backup?.gid ?? null,
		backupGatewayMode: backup?.gatewayMode ?? null,
		clobberedPath,
		restoredFromBackup: false,
		restoredBackupPath: null
	});
	healthState = setConfigHealthEntry(healthState, snapshot.path, {
		...entry,
		lastObservedSuspiciousSignature: suspiciousSignature
	});
	writeConfigHealthStateSync(deps, healthState);
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
		fs: overrides.fs ?? fsSync,
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
function resolveLegacyConfigForRead(resolvedConfigRaw, sourceRaw) {
	const sourceLegacyIssues = findLegacyConfigIssues(resolvedConfigRaw, sourceRaw);
	if (sourceLegacyIssues.length === 0) return {
		effectiveConfigRaw: resolvedConfigRaw,
		sourceLegacyIssues
	};
	return {
		effectiveConfigRaw: migrateLegacyConfig(resolvedConfigRaw).config ?? resolvedConfigRaw,
		sourceLegacyIssues
	};
}
function createConfigFileSnapshot(params) {
	const sourceConfig = asResolvedSourceConfig(params.sourceConfig);
	const runtimeConfig = asRuntimeConfig(params.runtimeConfig);
	return {
		path: params.path,
		exists: params.exists,
		raw: params.raw,
		parsed: params.parsed,
		sourceConfig,
		resolved: sourceConfig,
		valid: params.valid,
		runtimeConfig,
		config: runtimeConfig,
		hash: params.hash,
		issues: params.issues,
		warnings: params.warnings,
		legacyIssues: params.legacyIssues
	};
}
async function finalizeReadConfigSnapshotInternalResult(deps, result) {
	await observeConfigSnapshot(deps, result.snapshot);
	return result;
}
function createConfigIO(overrides = {}) {
	const deps = normalizeDeps(overrides);
	const requestedConfigPath = resolveConfigPathForDeps(deps);
	const configPath = (deps.configPath ? [requestedConfigPath] : resolveDefaultConfigCandidates(deps.env, deps.homedir)).find((candidate) => deps.fs.existsSync(candidate)) ?? requestedConfigPath;
	function observeLoadConfigSnapshot(snapshot) {
		observeConfigSnapshotSync(deps, snapshot);
		return snapshot;
	}
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
			const recovered = maybeRecoverSuspiciousConfigReadSync({
				deps,
				configPath,
				raw,
				parsed: deps.json5.parse(raw)
			});
			const effectiveRaw = recovered.raw;
			const effectiveParsed = recovered.parsed;
			const hash = hashConfigRaw(effectiveRaw);
			const readResolution = resolveConfigForRead(resolveConfigIncludesForRead(effectiveParsed, configPath, deps), deps.env);
			const resolvedConfig = readResolution.resolvedConfigRaw;
			const legacyResolution = resolveLegacyConfigForRead(resolvedConfig, effectiveParsed);
			const effectiveConfigRaw = legacyResolution.effectiveConfigRaw;
			for (const w of readResolution.envWarnings) deps.logger.warn(`Config (${configPath}): missing env var "${w.varName}" at ${w.configPath} - feature using this value will be unavailable`);
			warnOnConfigMiskeys(effectiveConfigRaw, deps.logger);
			if (typeof effectiveConfigRaw !== "object" || effectiveConfigRaw === null) {
				observeLoadConfigSnapshot({ ...createConfigFileSnapshot({
					path: configPath,
					exists: true,
					raw: effectiveRaw,
					parsed: effectiveParsed,
					sourceConfig: {},
					valid: true,
					runtimeConfig: {},
					hash,
					issues: [],
					warnings: [],
					legacyIssues: legacyResolution.sourceLegacyIssues
				}) });
				return {};
			}
			const preValidationDuplicates = findDuplicateAgentDirs(effectiveConfigRaw, {
				env: deps.env,
				homedir: deps.homedir
			});
			if (preValidationDuplicates.length > 0) throw new DuplicateAgentDirError(preValidationDuplicates);
			const validated = validateConfigObjectWithPlugins(effectiveConfigRaw, { env: deps.env });
			if (!validated.ok) {
				observeLoadConfigSnapshot({ ...createConfigFileSnapshot({
					path: configPath,
					exists: true,
					raw: effectiveRaw,
					parsed: effectiveParsed,
					sourceConfig: coerceConfig(effectiveConfigRaw),
					valid: false,
					runtimeConfig: coerceConfig(effectiveConfigRaw),
					hash,
					issues: validated.issues,
					warnings: validated.warnings,
					legacyIssues: legacyResolution.sourceLegacyIssues
				}) });
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
			const cfg = materializeRuntimeConfig(validated.config, "load");
			observeLoadConfigSnapshot({ ...createConfigFileSnapshot({
				path: configPath,
				exists: true,
				raw: effectiveRaw,
				parsed: effectiveParsed,
				sourceConfig: coerceConfig(effectiveConfigRaw),
				valid: true,
				runtimeConfig: cfg,
				hash,
				issues: [],
				warnings: validated.warnings,
				legacyIssues: legacyResolution.sourceLegacyIssues
			}) });
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
			return await finalizeReadConfigSnapshotInternalResult(deps, { snapshot: createConfigFileSnapshot({
				path: configPath,
				exists: false,
				raw: null,
				parsed: {},
				sourceConfig: {},
				valid: true,
				runtimeConfig: materializeRuntimeConfig({}, "missing"),
				hash,
				issues: [],
				warnings: [],
				legacyIssues: []
			}) });
		}
		try {
			const raw = deps.fs.readFileSync(configPath, "utf-8");
			const rawHash = hashConfigRaw(raw);
			const parsedRes = parseConfigJson5(raw, deps.json5);
			if (!parsedRes.ok) return await finalizeReadConfigSnapshotInternalResult(deps, { snapshot: createConfigFileSnapshot({
				path: configPath,
				exists: true,
				raw,
				parsed: {},
				sourceConfig: {},
				valid: false,
				runtimeConfig: {},
				hash: rawHash,
				issues: [{
					path: "",
					message: `JSON5 parse failed: ${parsedRes.error}`
				}],
				warnings: [],
				legacyIssues: []
			}) });
			const recovered = await maybeRecoverSuspiciousConfigRead({
				deps,
				configPath,
				raw,
				parsed: parsedRes.parsed
			});
			const effectiveRaw = recovered.raw;
			const effectiveParsed = recovered.parsed;
			const hash = hashConfigRaw(effectiveRaw);
			let resolved;
			try {
				resolved = resolveConfigIncludesForRead(effectiveParsed, configPath, deps);
			} catch (err) {
				const message = err instanceof ConfigIncludeError ? err.message : `Include resolution failed: ${String(err)}`;
				return await finalizeReadConfigSnapshotInternalResult(deps, { snapshot: createConfigFileSnapshot({
					path: configPath,
					exists: true,
					raw: effectiveRaw,
					parsed: effectiveParsed,
					sourceConfig: coerceConfig(effectiveParsed),
					valid: false,
					runtimeConfig: coerceConfig(effectiveParsed),
					hash,
					issues: [{
						path: "",
						message
					}],
					warnings: [],
					legacyIssues: []
				}) });
			}
			const readResolution = resolveConfigForRead(resolved, deps.env);
			const envVarWarnings = readResolution.envWarnings.map((w) => ({
				path: w.configPath,
				message: `Missing env var "${w.varName}" - feature using this value will be unavailable`
			}));
			const resolvedConfigRaw = readResolution.resolvedConfigRaw;
			const legacyResolution = resolveLegacyConfigForRead(resolvedConfigRaw, effectiveParsed);
			const effectiveConfigRaw = legacyResolution.effectiveConfigRaw;
			const validated = validateConfigObjectWithPlugins(effectiveConfigRaw, { env: deps.env });
			if (!validated.ok) return await finalizeReadConfigSnapshotInternalResult(deps, { snapshot: createConfigFileSnapshot({
				path: configPath,
				exists: true,
				raw: effectiveRaw,
				parsed: effectiveParsed,
				sourceConfig: coerceConfig(effectiveConfigRaw),
				valid: false,
				runtimeConfig: coerceConfig(effectiveConfigRaw),
				hash,
				issues: validated.issues,
				warnings: [...validated.warnings, ...envVarWarnings],
				legacyIssues: legacyResolution.sourceLegacyIssues
			}) });
			warnIfConfigFromFuture(validated.config, deps.logger);
			const snapshotConfig = materializeRuntimeConfig(validated.config, "snapshot");
			return await finalizeReadConfigSnapshotInternalResult(deps, {
				snapshot: createConfigFileSnapshot({
					path: configPath,
					exists: true,
					raw: effectiveRaw,
					parsed: effectiveParsed,
					sourceConfig: coerceConfig(effectiveConfigRaw),
					valid: true,
					runtimeConfig: snapshotConfig,
					hash,
					issues: [],
					warnings: [...validated.warnings, ...envVarWarnings],
					legacyIssues: legacyResolution.sourceLegacyIssues
				}),
				envSnapshotForRestore: readResolution.envSnapshotForRestore
			});
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
			return await finalizeReadConfigSnapshotInternalResult(deps, { snapshot: createConfigFileSnapshot({
				path: configPath,
				exists: true,
				raw: null,
				parsed: {},
				sourceConfig: {},
				valid: false,
				runtimeConfig: {},
				hash: hashConfigRaw(null),
				issues: [{
					path: "",
					message
				}],
				warnings: [],
				legacyIssues: []
			}) });
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
		const validated = validateConfigObjectRawWithPlugins(persistCandidate, { env: deps.env });
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
		let cfgToWrite = persistCandidate;
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
		const previousStat = snapshot.exists ? await deps.fs.promises.stat(configPath).catch(() => null) : null;
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
			previousDev: resolveConfigStatMetadata(previousStat).dev,
			nextDev: null,
			previousIno: resolveConfigStatMetadata(previousStat).ino,
			nextIno: null,
			previousMode: resolveConfigStatMetadata(previousStat).mode,
			nextMode: null,
			previousNlink: resolveConfigStatMetadata(previousStat).nlink,
			nextNlink: null,
			previousUid: resolveConfigStatMetadata(previousStat).uid,
			nextUid: null,
			previousGid: resolveConfigStatMetadata(previousStat).gid,
			nextGid: null,
			changedPathCount: typeof changedPathCount === "number" ? changedPathCount : null,
			hasMetaBefore,
			hasMetaAfter,
			gatewayModeBefore,
			gatewayModeAfter,
			suspicious: suspiciousReasons
		};
		const appendWriteAudit = async (result, err, nextStat) => {
			const errorCode = err && typeof err === "object" && "code" in err && typeof err.code === "string" ? err.code : void 0;
			const errorMessage = err && typeof err === "object" && "message" in err && typeof err.message === "string" ? err.message : void 0;
			const nextMetadata = resolveConfigStatMetadata(nextStat ?? null);
			await appendConfigAuditRecord(deps, {
				...auditRecordBase,
				result,
				nextHash: result === "failed" ? null : auditRecordBase.nextHash,
				nextBytes: result === "failed" ? null : auditRecordBase.nextBytes,
				nextDev: result === "failed" ? null : nextMetadata.dev,
				nextIno: result === "failed" ? null : nextMetadata.ino,
				nextMode: result === "failed" ? null : nextMetadata.mode,
				nextNlink: result === "failed" ? null : nextMetadata.nlink,
				nextUid: result === "failed" ? null : nextMetadata.uid,
				nextGid: result === "failed" ? null : nextMetadata.gid,
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
					await appendWriteAudit("copy-fallback", void 0, await deps.fs.promises.stat(configPath).catch(() => null));
					return { persistedHash: nextHash };
				}
				await deps.fs.promises.unlink(tmp).catch(() => {});
				throw err;
			}
			logConfigOverwrite();
			logConfigWriteAnomalies();
			await appendWriteAudit("rename", void 0, await deps.fs.promises.stat(configPath).catch(() => null));
			return { persistedHash: nextHash };
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
const AUTO_OWNER_DISPLAY_SECRET_BY_PATH = /* @__PURE__ */ new Map();
const AUTO_OWNER_DISPLAY_SECRET_PERSIST_IN_FLIGHT = /* @__PURE__ */ new Set();
const AUTO_OWNER_DISPLAY_SECRET_PERSIST_WARNED = /* @__PURE__ */ new Set();
let runtimeConfigSnapshot = null;
let runtimeConfigSourceSnapshot = null;
let runtimeConfigSnapshotRefreshHandler = null;
const configWriteListeners = /* @__PURE__ */ new Set();
function notifyConfigWriteListeners(event) {
	for (const listener of configWriteListeners) try {
		listener(event);
	} catch {}
}
function clearConfigCache() {}
function registerConfigWriteListener(listener) {
	configWriteListeners.add(listener);
	return () => {
		configWriteListeners.delete(listener);
	};
}
function setRuntimeConfigSnapshot(config, sourceConfig) {
	runtimeConfigSnapshot = config;
	runtimeConfigSourceSnapshot = sourceConfig ?? null;
}
function resetConfigRuntimeState() {
	runtimeConfigSnapshot = null;
	runtimeConfigSourceSnapshot = null;
}
function clearRuntimeConfigSnapshot() {
	resetConfigRuntimeState();
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
	const config = createConfigIO().loadConfig();
	setRuntimeConfigSnapshot(config);
	return runtimeConfigSnapshot ?? config;
}
function getRuntimeConfig() {
	return loadConfig();
}
async function readBestEffortConfig() {
	const snapshot = await readConfigFileSnapshot();
	return snapshot.valid ? loadConfig() : snapshot.config;
}
async function readConfigFileSnapshot() {
	return await createConfigIO().readConfigFileSnapshot();
}
async function readSourceConfigSnapshot() {
	return await readConfigFileSnapshot();
}
async function readConfigFileSnapshotForWrite() {
	return await createConfigIO().readConfigFileSnapshotForWrite();
}
async function readSourceConfigSnapshotForWrite() {
	return await readConfigFileSnapshotForWrite();
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
	const writeResult = await io.writeConfigFile(nextCfg, {
		envSnapshotForRestore: sameConfigPath ? options.envSnapshotForRestore : void 0,
		unsetPaths: options.unsetPaths
	});
	const notifyCommittedWrite = () => {
		if (!runtimeConfigSnapshot) return;
		notifyConfigWriteListeners({
			configPath: io.configPath,
			sourceConfig: nextCfg,
			runtimeConfig: runtimeConfigSnapshot,
			persistedHash: writeResult.persistedHash,
			writtenAtMs: Date.now()
		});
	};
	const refreshHandler = runtimeConfigSnapshotRefreshHandler;
	if (refreshHandler) try {
		if (await refreshHandler.refresh({ sourceConfig: nextCfg })) {
			notifyCommittedWrite();
			return;
		}
	} catch (error) {
		try {
			refreshHandler.clearOnRefreshFailure?.();
		} catch {}
		const detail = error instanceof Error ? error.message : String(error);
		throw new ConfigRuntimeRefreshError(`Config was written to ${io.configPath}, but runtime snapshot refresh failed: ${detail}`, { cause: error });
	}
	if (hadBothSnapshots) {
		setRuntimeConfigSnapshot(io.loadConfig(), nextCfg);
		notifyCommittedWrite();
		return;
	}
	if (hadRuntimeSnapshot) {
		setRuntimeConfigSnapshot(io.loadConfig());
		notifyCommittedWrite();
		return;
	}
	setRuntimeConfigSnapshot(io.loadConfig());
	notifyCommittedWrite();
}
//#endregion
export { buildSafeBinsShellCommand as $, resolveOwnerDisplaySetting as $t, setConfigValueAtPath as A, unwrapDispatchWrappersForResolution as At, parseByteSize as B, normalizeTalkSection as Bt, applyConfigOverrides as C, hasEnvManipulationBeforeShellWrapper as Ct, unsetConfigOverride as D, POWERSHELL_INLINE_COMMAND_FLAGS as Dt, setConfigOverride as E, POSIX_INLINE_COMMAND_FLAGS as Et, validateConfigObjectRaw as F, normalizeSafeBinProfileFixtures as Ft, listWritableExplicitTrustedSafeBinDirs as G, collectPluginSchemaMetadata as Gt, asRuntimeConfig as H, resolveAgentMaxConcurrent as Ht, validateConfigObjectRawWithPlugins as I, resolveSafeBinProfiles as It, listRiskyConfiguredSafeBins as J, applyLegacyMigrations as Jt, normalizeTrustedSafeBinDirs as K, GENERATED_BUNDLED_CHANNEL_CONFIG_METADATA as Kt, validateConfigObjectWithPlugins as L, resolveNormalizedProviderModelMaxTokens as Lt, migrateLegacyConfig as M, normalizeExecutableToken as Mt, collectUnsupportedSecretRefPolicyIssues as N, DEFAULT_SAFE_BINS as Nt, getConfigValueAtPath as O, resolveInlineCommandMatch as Ot, validateConfigObject as P, SAFE_BIN_PROFILES as Pt, buildEnforcedShellCommand as Q, createConfigRuntimeEnv as Qt, OpenClawSchema as R, LEGACY_TALK_PROVIDER_ID as Rt, normalizeOpenClawVersionBase as S, extractShellWrapperInlineCommand as St, resetConfigOverrides as T, unwrapKnownShellMultiplexerInvocation as Tt, getTrustedSafeBinDirs as U, resolveSubagentMaxConcurrent as Ut, asResolvedSourceConfig as V, resolveActiveTalkProviderConfig as Vt, isTrustedSafeBinPath as W, collectChannelSchemaMetadata as Wt, analyzeArgvCommand as X, ensureControlUiAllowedOriginsForNonLoopbackBind as Xt, normalizeSafeBinName as Y, migrateLegacyXSearchConfig as Yt, analyzeShellCommand as Z, collectDurableServiceEnvVars as Zt, resetConfigRuntimeState as _, resolveExecutableFromPathEnv as _t, getRuntimeConfig as a, windowsEscapeArg as at, setRuntimeConfigSnapshotRefreshHandler as b, POWERSHELL_WRAPPERS as bt, loadConfig as c, resolveAllowlistCandidatePath as ct, readBestEffortConfig as d, resolveCommandResolutionFromArgv as dt, buildSafeShellCommand as et, readConfigFileSnapshot as f, resolveExecutionTargetCandidatePath as ft, registerConfigWriteListener as g, resolvePolicyTargetResolution as gt, readSourceConfigSnapshotForWrite as h, resolvePolicyTargetCandidatePath as ht, createConfigIO as i, splitCommandChainWithOperators as it, unsetConfigValueAtPath as j, unwrapKnownDispatchWrapperInvocation as jt, parseConfigPath as k, isDispatchWrapperExecutable as kt, parseConfigJson5 as l, resolveApprovalAuditCandidatePath as lt, readSourceConfigSnapshot as m, resolvePolicyAllowlistCandidatePath as mt, clearConfigCache as n, resolvePlannedSegmentArgv as nt, getRuntimeConfigSnapshot as o, matchAllowlist as ot, readConfigFileSnapshotForWrite as p, resolveExecutionTargetResolution as pt, validateSafeBinArgv as q, listBundledWebSearchPluginIds as qt, clearRuntimeConfigSnapshot as r, splitCommandChain as rt, getRuntimeConfigSourceSnapshot as s, parseExecArgvToken as st, ConfigRuntimeRefreshError as t, isWindowsPlatform as tt, projectConfigOntoRuntimeSourceSnapshot as u, resolveCommandResolution as ut, resolveConfigSnapshotHash as v, resolveExecWrapperTrustPlan as vt, getConfigOverrides as w, isShellWrapperExecutable as wt, writeConfigFile as x, extractShellWrapperCommand as xt, setRuntimeConfigSnapshot as y, POSIX_SHELL_WRAPPERS as yt, parseNonNegativeByteSize as z, buildTalkConfigResponse as zt };
