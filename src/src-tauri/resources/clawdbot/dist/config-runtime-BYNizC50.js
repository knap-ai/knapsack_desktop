import { v as expandHomePrefix } from "./paths-ViKUYWUK.js";
import { t as CONFIG_DIR } from "./utils-CS0Ikux6.js";
import { r as toAgentModelListLike } from "./model-input-BB2wSAHb.js";
import { _ as normalizeAccountId, c as normalizeAgentId } from "./session-key-DAhnzjyr.js";
import { r as listAgentIds } from "./agent-scope-bjWqU22i.js";
import { r as DEFAULT_PROVIDER } from "./defaults-eEZJg44K.js";
import { c as legacyModelKey, i as buildModelAliasIndex, l as modelKey, v as resolveModelRefFromString } from "./model-selection-BnFtDmP7.js";
import { d as readConfigFileSnapshot, g as writeConfigFile } from "./io-y3Az_Onx.js";
import { t as resolveAccountEntry } from "./account-lookup-C4CvUou_.js";
import { n as parseToolsBySenderTypedKey } from "./config-D4zN4BRl.js";
import { t as formatCliCommand } from "./command-format-DBQUhADm.js";
import { l as normalizeChannelId } from "./plugins-B09-vgme.js";
import { n as formatConfigIssueLines } from "./issue-format-BtLIwOtN.js";
import fs from "node:fs";
import path from "node:path";
import JSON5 from "json5";
import { randomBytes } from "node:crypto";
//#region src/commands/models/shared.ts
const ensureFlagCompatibility = (opts) => {
	if (opts.json && opts.plain) throw new Error("Choose either --json or --plain, not both.");
};
const formatTokenK = (value) => {
	if (!value || !Number.isFinite(value)) return "-";
	if (value < 1024) return `${Math.round(value)}`;
	return `${Math.round(value / 1024)}k`;
};
const formatMs = (value) => {
	if (value === null || value === void 0) return "-";
	if (!Number.isFinite(value)) return "-";
	if (value < 1e3) return `${Math.round(value)}ms`;
	return `${Math.round(value / 100) / 10}s`;
};
const isLocalBaseUrl = (baseUrl) => {
	try {
		const host = new URL(baseUrl).hostname.toLowerCase();
		return host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0" || host === "::1" || host.endsWith(".local");
	} catch {
		return false;
	}
};
async function loadValidConfigOrThrow() {
	const snapshot = await readConfigFileSnapshot();
	if (!snapshot.valid) {
		const issues = formatConfigIssueLines(snapshot.issues, "-").join("\n");
		throw new Error(`Invalid config at ${snapshot.path}\n${issues}`);
	}
	return snapshot.config;
}
async function updateConfig(mutator) {
	const next = mutator(await loadValidConfigOrThrow());
	await writeConfigFile(next);
	return next;
}
function resolveModelTarget(params) {
	const aliasIndex = buildModelAliasIndex({
		cfg: params.cfg,
		defaultProvider: DEFAULT_PROVIDER
	});
	const resolved = resolveModelRefFromString({
		raw: params.raw,
		defaultProvider: DEFAULT_PROVIDER,
		aliasIndex
	});
	if (!resolved) throw new Error(`Invalid model reference: ${params.raw}`);
	return resolved.ref;
}
function resolveModelKeysFromEntries(params) {
	const aliasIndex = buildModelAliasIndex({
		cfg: params.cfg,
		defaultProvider: DEFAULT_PROVIDER
	});
	return params.entries.map((entry) => resolveModelRefFromString({
		raw: entry,
		defaultProvider: DEFAULT_PROVIDER,
		aliasIndex
	})).filter((entry) => Boolean(entry)).map((entry) => modelKey(entry.ref.provider, entry.ref.model));
}
function normalizeAlias(alias) {
	const trimmed = alias.trim();
	if (!trimmed) throw new Error("Alias cannot be empty.");
	if (!/^[A-Za-z0-9_.:-]+$/.test(trimmed)) throw new Error("Alias must use letters, numbers, dots, underscores, colons, or dashes.");
	return trimmed;
}
function resolveKnownAgentId(params) {
	const raw = params.rawAgentId?.trim();
	if (!raw) return;
	const agentId = normalizeAgentId(raw);
	if (!listAgentIds(params.cfg).includes(agentId)) throw new Error(`Unknown agent id "${raw}". Use "${formatCliCommand("openclaw agents list")}" to see configured agents.`);
	return agentId;
}
function upsertCanonicalModelConfigEntry(models, params) {
	const key = modelKey(params.provider, params.model);
	const legacyKey = legacyModelKey(params.provider, params.model);
	if (!models[key]) if (legacyKey && models[legacyKey]) models[key] = models[legacyKey];
	else models[key] = {};
	if (legacyKey) delete models[legacyKey];
	return key;
}
function mergePrimaryFallbackConfig(existing, patch) {
	const next = { ...existing && typeof existing === "object" ? existing : void 0 };
	if (patch.primary !== void 0) next.primary = patch.primary;
	if (patch.fallbacks !== void 0) next.fallbacks = patch.fallbacks;
	return next;
}
function applyDefaultModelPrimaryUpdate(params) {
	const resolved = resolveModelTarget({
		raw: params.modelRaw,
		cfg: params.cfg
	});
	const nextModels = { ...params.cfg.agents?.defaults?.models };
	const key = upsertCanonicalModelConfigEntry(nextModels, resolved);
	const defaults = params.cfg.agents?.defaults ?? {};
	const existing = toAgentModelListLike(defaults[params.field]);
	return {
		...params.cfg,
		agents: {
			...params.cfg.agents,
			defaults: {
				...defaults,
				[params.field]: mergePrimaryFallbackConfig(existing, { primary: key }),
				models: nextModels
			}
		}
	};
}
/**
* Model key format: "provider/model"
*
* The model key is displayed in `/model status` and used to reference models.
* When using `/model <key>`, use the exact format shown (e.g., "openrouter/moonshotai/kimi-k2").
*
* For providers with hierarchical model IDs (e.g., OpenRouter), the model ID may include
* sub-providers (e.g., "moonshotai/kimi-k2"), resulting in a key like "openrouter/moonshotai/kimi-k2".
*/
//#endregion
//#region src/config/markdown-tables.ts
const DEFAULT_TABLE_MODES = new Map([
	["signal", "bullets"],
	["whatsapp", "bullets"],
	["mattermost", "off"]
]);
const isMarkdownTableMode = (value) => value === "off" || value === "bullets" || value === "code";
function resolveMarkdownModeFromSection(section, accountId) {
	if (!section) return;
	const normalizedAccountId = normalizeAccountId(accountId);
	const accounts = section.accounts;
	if (accounts && typeof accounts === "object") {
		const matchMode = resolveAccountEntry(accounts, normalizedAccountId)?.markdown?.tables;
		if (isMarkdownTableMode(matchMode)) return matchMode;
	}
	const sectionMode = section.markdown?.tables;
	return isMarkdownTableMode(sectionMode) ? sectionMode : void 0;
}
function resolveMarkdownTableMode(params) {
	const channel = normalizeChannelId(params.channel);
	const defaultMode = channel ? DEFAULT_TABLE_MODES.get(channel) ?? "code" : "code";
	if (!channel || !params.cfg) return defaultMode;
	return resolveMarkdownModeFromSection(params.cfg.channels?.[channel] ?? params.cfg?.[channel], params.accountId) ?? defaultMode;
}
//#endregion
//#region src/config/group-policy.ts
function resolveChannelGroupConfig(groups, groupId, caseInsensitive = false) {
	if (!groups) return;
	const direct = groups[groupId];
	if (direct) return direct;
	if (!caseInsensitive) return;
	const target = groupId.toLowerCase();
	const matchedKey = Object.keys(groups).find((key) => key !== "*" && key.toLowerCase() === target);
	if (!matchedKey) return;
	return groups[matchedKey];
}
const warnedLegacyToolsBySenderKeys = /* @__PURE__ */ new Set();
const compiledToolsBySenderCache = /* @__PURE__ */ new WeakMap();
function normalizeSenderKey(value, options = {}) {
	const trimmed = value.trim();
	if (!trimmed) return "";
	return (options.stripLeadingAt && trimmed.startsWith("@") ? trimmed.slice(1) : trimmed).toLowerCase();
}
function normalizeTypedSenderKey(value, type) {
	return normalizeSenderKey(value, { stripLeadingAt: type === "username" });
}
function normalizeLegacySenderKey(value) {
	return normalizeSenderKey(value, { stripLeadingAt: true });
}
function warnLegacyToolsBySenderKey(rawKey) {
	const trimmed = rawKey.trim();
	if (!trimmed || warnedLegacyToolsBySenderKeys.has(trimmed)) return;
	warnedLegacyToolsBySenderKeys.add(trimmed);
	process.emitWarning(`toolsBySender key "${trimmed}" is deprecated. Use explicit prefixes (id:, e164:, username:, name:). Legacy unprefixed keys are matched as id only.`, {
		type: "DeprecationWarning",
		code: "OPENCLAW_TOOLS_BY_SENDER_UNTYPED_KEY"
	});
}
function parseSenderPolicyKey(rawKey) {
	const trimmed = rawKey.trim();
	if (!trimmed) return;
	if (trimmed === "*") return { kind: "wildcard" };
	const typed = parseToolsBySenderTypedKey(trimmed);
	if (typed) {
		const key = normalizeTypedSenderKey(typed.value, typed.type);
		if (!key) return;
		return {
			kind: "typed",
			type: typed.type,
			key
		};
	}
	warnLegacyToolsBySenderKey(trimmed);
	const key = normalizeLegacySenderKey(trimmed);
	if (!key) return;
	return {
		kind: "typed",
		type: "id",
		key
	};
}
function createSenderPolicyBuckets() {
	return {
		id: /* @__PURE__ */ new Map(),
		e164: /* @__PURE__ */ new Map(),
		username: /* @__PURE__ */ new Map(),
		name: /* @__PURE__ */ new Map()
	};
}
function compileToolsBySenderPolicy(toolsBySender) {
	const entries = Object.entries(toolsBySender);
	if (entries.length === 0) return;
	const buckets = createSenderPolicyBuckets();
	let wildcard;
	for (const [rawKey, policy] of entries) {
		if (!policy) continue;
		const parsed = parseSenderPolicyKey(rawKey);
		if (!parsed) continue;
		if (parsed.kind === "wildcard") {
			wildcard = policy;
			continue;
		}
		const bucket = buckets[parsed.type];
		if (!bucket.has(parsed.key)) bucket.set(parsed.key, policy);
	}
	return {
		buckets,
		wildcard
	};
}
function resolveCompiledToolsBySenderPolicy(toolsBySender) {
	const cached = compiledToolsBySenderCache.get(toolsBySender);
	if (cached) return cached;
	const compiled = compileToolsBySenderPolicy(toolsBySender);
	if (!compiled) return;
	compiledToolsBySenderCache.set(toolsBySender, compiled);
	return compiled;
}
function normalizeCandidate(value, type) {
	const trimmed = value?.trim();
	if (!trimmed) return "";
	return normalizeTypedSenderKey(trimmed, type);
}
function normalizeSenderIdCandidates(value) {
	const trimmed = value?.trim();
	if (!trimmed) return [];
	const typed = normalizeTypedSenderKey(trimmed, "id");
	const legacy = normalizeLegacySenderKey(trimmed);
	if (!typed) return legacy ? [legacy] : [];
	if (!legacy || legacy === typed) return [typed];
	return [typed, legacy];
}
function matchToolsBySenderPolicy(compiled, params) {
	for (const senderIdCandidate of normalizeSenderIdCandidates(params.senderId)) {
		const match = compiled.buckets.id.get(senderIdCandidate);
		if (match) return match;
	}
	const senderE164 = normalizeCandidate(params.senderE164, "e164");
	if (senderE164) {
		const match = compiled.buckets.e164.get(senderE164);
		if (match) return match;
	}
	const senderUsername = normalizeCandidate(params.senderUsername, "username");
	if (senderUsername) {
		const match = compiled.buckets.username.get(senderUsername);
		if (match) return match;
	}
	const senderName = normalizeCandidate(params.senderName, "name");
	if (senderName) {
		const match = compiled.buckets.name.get(senderName);
		if (match) return match;
	}
	return compiled.wildcard;
}
function resolveToolsBySender(params) {
	const toolsBySender = params.toolsBySender;
	if (!toolsBySender) return;
	const compiled = resolveCompiledToolsBySenderPolicy(toolsBySender);
	if (!compiled) return;
	return matchToolsBySenderPolicy(compiled, params);
}
function resolveChannelGroups(cfg, channel, accountId) {
	const normalizedAccountId = normalizeAccountId(accountId);
	const channelConfig = cfg.channels?.[channel];
	if (!channelConfig) return;
	return resolveAccountEntry(channelConfig.accounts, normalizedAccountId)?.groups ?? channelConfig.groups;
}
function resolveChannelGroupPolicyMode(cfg, channel, accountId) {
	const normalizedAccountId = normalizeAccountId(accountId);
	const channelConfig = cfg.channels?.[channel];
	if (!channelConfig) return;
	return resolveAccountEntry(channelConfig.accounts, normalizedAccountId)?.groupPolicy ?? channelConfig.groupPolicy;
}
function resolveChannelGroupPolicy(params) {
	const { cfg, channel } = params;
	const groups = resolveChannelGroups(cfg, channel, params.accountId);
	const groupPolicy = resolveChannelGroupPolicyMode(cfg, channel, params.accountId);
	const hasGroups = Boolean(groups && Object.keys(groups).length > 0);
	const allowlistEnabled = groupPolicy === "allowlist" || hasGroups;
	const normalizedId = params.groupId?.trim();
	const groupConfig = normalizedId ? resolveChannelGroupConfig(groups, normalizedId, params.groupIdCaseInsensitive) : void 0;
	const defaultConfig = groups?.["*"];
	const allowAll = allowlistEnabled && Boolean(groups && Object.hasOwn(groups, "*"));
	const senderFilterBypass = groupPolicy === "allowlist" && !hasGroups && Boolean(params.hasGroupAllowFrom);
	return {
		allowlistEnabled,
		allowed: groupPolicy === "disabled" ? false : !allowlistEnabled || allowAll || Boolean(groupConfig) || senderFilterBypass,
		groupConfig,
		defaultConfig
	};
}
function resolveChannelGroupRequireMention(params) {
	const { requireMentionOverride, overrideOrder = "after-config" } = params;
	const { groupConfig, defaultConfig } = resolveChannelGroupPolicy(params);
	const configMention = typeof groupConfig?.requireMention === "boolean" ? groupConfig.requireMention : typeof defaultConfig?.requireMention === "boolean" ? defaultConfig.requireMention : void 0;
	if (overrideOrder === "before-config" && typeof requireMentionOverride === "boolean") return requireMentionOverride;
	if (typeof configMention === "boolean") return configMention;
	if (overrideOrder !== "before-config" && typeof requireMentionOverride === "boolean") return requireMentionOverride;
	return true;
}
function resolveChannelGroupToolsPolicy(params) {
	const { groupConfig, defaultConfig } = resolveChannelGroupPolicy(params);
	const groupSenderPolicy = resolveToolsBySender({
		toolsBySender: groupConfig?.toolsBySender,
		senderId: params.senderId,
		senderName: params.senderName,
		senderUsername: params.senderUsername,
		senderE164: params.senderE164
	});
	if (groupSenderPolicy) return groupSenderPolicy;
	if (groupConfig?.tools) return groupConfig.tools;
	const defaultSenderPolicy = resolveToolsBySender({
		toolsBySender: defaultConfig?.toolsBySender,
		senderId: params.senderId,
		senderName: params.senderName,
		senderUsername: params.senderUsername,
		senderE164: params.senderE164
	});
	if (defaultSenderPolicy) return defaultSenderPolicy;
	if (defaultConfig?.tools) return defaultConfig.tools;
}
//#endregion
//#region src/utils/parse-json-compat.ts
function parseJsonWithJson5Fallback(raw) {
	try {
		return JSON.parse(raw);
	} catch {
		return JSON5.parse(raw);
	}
}
//#endregion
//#region src/cron/store.ts
const DEFAULT_CRON_DIR = path.join(CONFIG_DIR, "cron");
const DEFAULT_CRON_STORE_PATH = path.join(DEFAULT_CRON_DIR, "jobs.json");
const serializedStoreCache = /* @__PURE__ */ new Map();
function stripRuntimeOnlyCronFields(store) {
	return {
		version: store.version,
		jobs: store.jobs.map((job) => {
			const { state: _state, updatedAtMs: _updatedAtMs, ...rest } = job;
			return rest;
		})
	};
}
function parseCronStoreForBackupComparison(raw) {
	try {
		const parsed = parseJsonWithJson5Fallback(raw);
		if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
		const version = parsed.version;
		const jobs = parsed.jobs;
		if (version !== 1 || !Array.isArray(jobs)) return null;
		return {
			version: 1,
			jobs: jobs.filter(Boolean)
		};
	} catch {
		return null;
	}
}
function shouldSkipCronBackupForRuntimeOnlyChanges(previousRaw, nextStore) {
	if (previousRaw === null) return false;
	const previous = parseCronStoreForBackupComparison(previousRaw);
	if (!previous) return false;
	return JSON.stringify(stripRuntimeOnlyCronFields(previous)) === JSON.stringify(stripRuntimeOnlyCronFields(nextStore));
}
function resolveCronStorePath(storePath) {
	if (storePath?.trim()) {
		const raw = storePath.trim();
		if (raw.startsWith("~")) return path.resolve(expandHomePrefix(raw));
		return path.resolve(raw);
	}
	return DEFAULT_CRON_STORE_PATH;
}
async function loadCronStore(storePath) {
	try {
		const raw = await fs.promises.readFile(storePath, "utf-8");
		let parsed;
		try {
			parsed = parseJsonWithJson5Fallback(raw);
		} catch (err) {
			throw new Error(`Failed to parse cron store at ${storePath}: ${String(err)}`, { cause: err });
		}
		const parsedRecord = parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
		const store = {
			version: 1,
			jobs: (Array.isArray(parsedRecord.jobs) ? parsedRecord.jobs : []).filter(Boolean)
		};
		serializedStoreCache.set(storePath, JSON.stringify(store, null, 2));
		return store;
	} catch (err) {
		if (err?.code === "ENOENT") {
			serializedStoreCache.delete(storePath);
			return {
				version: 1,
				jobs: []
			};
		}
		throw err;
	}
}
async function setSecureFileMode(filePath) {
	await fs.promises.chmod(filePath, 384).catch(() => void 0);
}
async function saveCronStore(storePath, store, opts) {
	const storeDir = path.dirname(storePath);
	await fs.promises.mkdir(storeDir, {
		recursive: true,
		mode: 448
	});
	await fs.promises.chmod(storeDir, 448).catch(() => void 0);
	const json = JSON.stringify(store, null, 2);
	const cached = serializedStoreCache.get(storePath);
	if (cached === json) return;
	let previous = cached ?? null;
	if (previous === null) try {
		previous = await fs.promises.readFile(storePath, "utf-8");
	} catch (err) {
		if (err.code !== "ENOENT") throw err;
	}
	if (previous === json) {
		serializedStoreCache.set(storePath, json);
		return;
	}
	const skipBackup = opts?.skipBackup === true || shouldSkipCronBackupForRuntimeOnlyChanges(previous, store);
	const tmp = `${storePath}.${process.pid}.${randomBytes(8).toString("hex")}.tmp`;
	await fs.promises.writeFile(tmp, json, {
		encoding: "utf-8",
		mode: 384
	});
	await setSecureFileMode(tmp);
	if (previous !== null && !skipBackup) try {
		const backupPath = `${storePath}.bak`;
		await fs.promises.copyFile(storePath, backupPath);
		await setSecureFileMode(backupPath);
	} catch {}
	await renameWithRetry(tmp, storePath);
	await setSecureFileMode(storePath);
	serializedStoreCache.set(storePath, json);
}
const RENAME_MAX_RETRIES = 3;
const RENAME_BASE_DELAY_MS = 50;
async function renameWithRetry(src, dest) {
	for (let attempt = 0; attempt <= RENAME_MAX_RETRIES; attempt++) try {
		await fs.promises.rename(src, dest);
		return;
	} catch (err) {
		const code = err.code;
		if (code === "EBUSY" && attempt < RENAME_MAX_RETRIES) {
			await new Promise((resolve) => setTimeout(resolve, RENAME_BASE_DELAY_MS * 2 ** attempt));
			continue;
		}
		if (code === "EPERM" || code === "EEXIST") {
			await fs.promises.copyFile(src, dest);
			await fs.promises.unlink(src).catch(() => {});
			return;
		}
		throw err;
	}
}
//#endregion
export { upsertCanonicalModelConfigEntry as S, normalizeAlias as _, resolveChannelGroupPolicy as a, resolveModelTarget as b, resolveToolsBySender as c, ensureFlagCompatibility as d, formatMs as f, mergePrimaryFallbackConfig as g, loadValidConfigOrThrow as h, parseJsonWithJson5Fallback as i, resolveMarkdownTableMode as l, isLocalBaseUrl as m, resolveCronStorePath as n, resolveChannelGroupRequireMention as o, formatTokenK as p, saveCronStore as r, resolveChannelGroupToolsPolicy as s, loadCronStore as t, applyDefaultModelPrimaryUpdate as u, resolveKnownAgentId as v, updateConfig as x, resolveModelKeysFromEntries as y };
