import { a as normalizeLowercaseStringOrEmpty, c as normalizeOptionalString, s as normalizeOptionalLowercaseString } from "./string-coerce-Bje8XVt9.js";
import { t as sanitizeForLog } from "./ansi-Dqm1lzVL.js";
import { o as resolveRequiredHomeDir } from "./home-dir-g5LU3LmA.js";
import { _ as resolveStateDir, n as DEFAULT_GATEWAY_PORT, o as resolveConfigPath } from "./paths-B2cMK-wd.js";
import { i as formatErrorMessage } from "./errors-CDFVCV9D.js";
import { t as isTruthyEnvValue } from "./env-BAymvSVL.js";
import { o as sanitizeHostExecEnv } from "./host-env-security-DZcto3_u.js";
import { c as isRecord$1, p as resolveUserPath, x as isPlainObject } from "./utils-DvkbxKCZ.js";
import { n as resolveConfigEnvVars, t as containsEnvVarReference } from "./env-substitution-3u7r2gr5.js";
import { r as applyConfigEnvVars } from "./state-dir-dotenv-DAjQHBxO.js";
import { n as VERSION } from "./version-vQIvyCe_.js";
import { a as coerceSecretRef, f as parseLegacySecretRefEnvMarker, r as LEGACY_SECRETREF_ENV_MARKER_PREFIX } from "./types.secrets-ClP-vJ-P.js";
import { t as isBlockedObjectKey } from "./prototype-keys-DneRHviA.js";
import { t as resolveBundledPluginsDir } from "./bundled-dir-DygrJuRr.js";
import { r as normalizeChatChannelId, t as CHANNEL_IDS } from "./ids-C5uBFLeA.js";
import { i as isCanonicalDottedDecimalIPv4, u as isLoopbackIpAddress } from "./ip-zu3JmZlh.js";
import { t as DEFAULT_ACCOUNT_ID } from "./account-id-DhSD7lhD.js";
import { c as normalizeAgentId } from "./session-key-hxP9B3Or.js";
import { S as resolveDefaultAgentId, x as resolveAgentWorkspaceDir } from "./agent-scope-i10se9ty.js";
import { t as ensureOwnerDisplaySecret } from "./owner-display-BBJ65Ssl.js";
import { n as resolveManifestCommandAliasOwnerInRegistry } from "./manifest-command-aliases-DLn3d24t.js";
import { t as getBootstrapChannelPlugin } from "./bootstrap-registry-fBj8HD5R.js";
import { t as isSafeExecutableValue } from "./exec-safety-dx46rGdT.js";
import { t as sanitizeTerminalText } from "./safe-text-BsGBhnDf.js";
import { r as hasKind } from "./slots-CjmwiD-v.js";
import { a as normalizePluginId, c as resolveEffectivePluginActivationState, o as normalizePluginsConfig, u as resolveMemorySlotDecision } from "./config-state-Bw_lAn0M.js";
import { t as loadBundledPluginPublicArtifactModuleSync } from "./public-surface-loader-Q3U25ebK.js";
import { r as normalizeProviderId } from "./provider-id-DRW5WMbW.js";
import { m as resolveInstalledPluginIndexPolicyHash } from "./installed-plugin-index-store-Bg0YPG9v.js";
import { i as loadInstalledPluginIndexInstallRecordsSync } from "./manifest-registry-CXpW6f0a.js";
import { n as resolveInstalledManifestRegistryIndexFingerprint, t as loadPluginManifestRegistryForInstalledIndex } from "./manifest-registry-installed-B7YTYcgb.js";
import { n as loadPluginManifestRegistryForPluginRegistry, o as resolveManifestContractOwnerPluginId, x as createPluginRegistryIdNormalizer, y as loadPluginRegistrySnapshotWithMetadata } from "./plugin-registry-CZ8QXP5l.js";
import { i as listPluginDoctorLegacyConfigRules, n as collectRelevantDoctorPluginIds, r as collectRelevantDoctorPluginIdsForTouchedPaths, t as applyPluginDoctorCompatibilityMigrations } from "./doctor-contract-registry-swdZFwwD.js";
import { a as resolveGatewayPortWithDefault, i as isGatewayNonLoopbackBindMode, r as hasConfiguredControlUiAllowedOrigins, t as buildDefaultControlUiAllowedOrigins } from "./gateway-control-ui-origins-DpuxXpK4.js";
import { i as resolveOpenClawMcpTransportAlias, n as isKnownCliMcpTypeAlias } from "./mcp-config-normalize-3KdQ3hdN.js";
import { t as resolveAgentRuntimePolicy } from "./agent-runtime-policy-qmUEJ2vZ.js";
import { t as resolveSingleAccountKeysToMove } from "./setup-promotion-helpers-dWjoiUFB.js";
import { t as DEFAULT_CONTEXT_TOKENS } from "./defaults-CRz26M83.js";
import { n as normalizeTalkConfig, r as normalizeTalkSection } from "./talk-DUMWf2rB.js";
import { r as resolveProviderEndpoint } from "./provider-attribution-Cx1zyNpE.js";
import { t as loadDotEnv } from "./dotenv-BN2Uc37I.js";
import { c as writePersistedInstalledPluginIndexInstallRecordsSync, i as resolveInstalledPluginIndexRecordsStorePath } from "./installed-plugin-index-records-Z8-yA-Tm.js";
import { i as resolveConfigIncludes, r as readConfigIncludeFileWithGuards, t as ConfigIncludeError } from "./includes-D00MH42T.js";
import { t as applyMergePatch } from "./merge-patch-CGxsvYoX.js";
import { V as normalizeSafeBinProfileFixtures, i as normalizeTrustedSafeBinDirs } from "./exec-safe-bin-trust-BvG644ke.js";
import { n as stripShippedPluginInstallConfigRecords, t as extractShippedPluginInstallConfigRecords } from "./plugin-install-config-migration-Cl9LkPI-.js";
import { i as unsetConfigValueAtPath, n as parseConfigPath, r as setConfigValueAtPath } from "./config-paths-B_UaJ6Jd.js";
import { d as registerRuntimeConfigWriteListener, i as getRuntimeConfigSnapshot, l as loadPinnedRuntimeConfig, n as createRuntimeConfigWriteNotification, o as getRuntimeConfigSnapshotRefreshHandler, r as finalizeRuntimeSnapshotWrite, s as getRuntimeConfigSourceSnapshot, u as notifyRuntimeConfigWriteListeners } from "./runtime-snapshot-DLisEE8Y.js";
import { n as listKnownChannelEnvVarNames } from "./channel-env-vars-GGljJ-Ds.js";
import { n as listKnownProviderAuthEnvVarNames } from "./provider-env-vars-COSpaRlD.js";
import { t as withBundledPluginAllowlistCompat } from "./bundled-compat-Cvu6moXL.js";
import { n as appendAllowedValuesHint, r as summarizeAllowedValues, t as validateJsonSchemaValue } from "./schema-validator-CY2IX5dY.js";
import { i as setPathExistingStrict } from "./path-utils-C_sKaEfg.js";
import { n as discoverConfigSecretTargets } from "./target-registry-B9sk7_KR.js";
import { c as isWindowsAbsolutePath, i as isAvatarHttpUrl, n as hasAvatarUriScheme, o as isPathWithinRoot, r as isAvatarDataUrl } from "./avatar-policy-B3Jh2sx_.js";
import { t as OpenClawSchema } from "./zod-schema-DjRHIl0Z.js";
import { n as comparePrereleaseIdentifiers, r as normalizeLegacyDotBetaVersion } from "./semver-compare-BR6PMSO4.js";
import fs from "node:fs";
import JSON5 from "json5";
import path from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";
import { isDeepStrictEqual } from "node:util";
import crypto from "node:crypto";
//#region src/channels/plugins/doctor-contract-api.ts
function loadBundledChannelPublicArtifact(channelId, artifactBasenames) {
	for (const artifactBasename of artifactBasenames) try {
		return loadBundledPluginPublicArtifactModuleSync({
			dirName: channelId,
			artifactBasename
		});
	} catch (error) {
		if (error instanceof Error && error.message.startsWith("Unable to resolve bundled plugin public surface ")) continue;
	}
}
function loadBundledChannelDoctorContractApi(channelId) {
	return loadBundledChannelPublicArtifact(channelId, ["doctor-contract-api.js", "contract-api.js"]);
}
//#endregion
//#region src/commands/doctor/shared/legacy-config-record-shared.ts
function cloneRecord$1(value) {
	return { ...value };
}
function ensureRecord$2(target, key) {
	const current = target[key];
	if (isRecord$1(current)) return current;
	const next = {};
	target[key] = next;
	return next;
}
function hasOwnKey$1(target, key) {
	return Object.prototype.hasOwnProperty.call(target, key);
}
//#endregion
//#region src/commands/doctor/shared/channel-legacy-config-migrate.ts
function collectRelevantDoctorChannelIds(raw) {
	const channels = isRecord$1(raw) && isRecord$1(raw.channels) ? raw.channels : null;
	if (!channels) return [];
	return Object.keys(channels).filter((channelId) => channelId !== "defaults").toSorted();
}
function resolveBundledChannelCompatibilityNormalizer(channelId) {
	const contractNormalizer = loadBundledChannelDoctorContractApi(channelId)?.normalizeCompatibilityConfig;
	if (typeof contractNormalizer === "function") return contractNormalizer;
	return getBootstrapChannelPlugin(channelId)?.doctor?.normalizeCompatibilityConfig;
}
function applyChannelDoctorCompatibilityMigrations(cfg) {
	let nextCfg = cfg;
	const changes = [];
	const unresolvedChannelIds = [];
	for (const channelId of collectRelevantDoctorChannelIds(cfg)) {
		const normalizeCompatibilityConfig = resolveBundledChannelCompatibilityNormalizer(channelId);
		if (!normalizeCompatibilityConfig) {
			unresolvedChannelIds.push(channelId);
			continue;
		}
		const mutation = normalizeCompatibilityConfig({ cfg: nextCfg });
		if (!mutation || mutation.changes.length === 0) continue;
		nextCfg = mutation.config;
		changes.push(...mutation.changes);
	}
	if (unresolvedChannelIds.length > 0) {
		const compat = applyPluginDoctorCompatibilityMigrations(nextCfg, { pluginIds: unresolvedChannelIds });
		nextCfg = compat.config;
		changes.push(...compat.changes);
	}
	return {
		next: nextCfg,
		changes
	};
}
//#endregion
//#region src/config/legacy.shared.ts
const getRecord = (value) => isRecord$1(value) ? value : null;
const ensureRecord$1 = (root, key) => {
	const existing = root[key];
	if (isRecord$1(existing)) return existing;
	const next = {};
	root[key] = next;
	return next;
};
const mergeMissing = (target, source) => {
	for (const [key, value] of Object.entries(source)) {
		if (value === void 0 || isBlockedObjectKey(key)) continue;
		const existing = target[key];
		if (existing === void 0) {
			target[key] = value;
			continue;
		}
		if (isRecord$1(existing) && isRecord$1(value)) mergeMissing(existing, value);
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
	const args = command.slice(1).map((part) => part.replace(/\{input\}/g, "{{MediaPath}}"));
	const timeoutSeconds = typeof transcriber?.timeoutSeconds === "number" ? transcriber?.timeoutSeconds : void 0;
	const result = {
		command: rawExecutable,
		type: "cli"
	};
	if (args.length > 0) result.args = args;
	if (timeoutSeconds !== void 0) result.timeoutSeconds = timeoutSeconds;
	return result;
};
const defineLegacyConfigMigration = (migration) => migration;
//#endregion
//#region src/commands/doctor/shared/legacy-config-migrations.audio.ts
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
//#region src/commands/doctor/shared/legacy-config-migrations.channels.ts
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
function hasLegacyThreadBindingTtlInAnyChannel(value) {
	const channels = getRecord(value);
	if (!channels) return false;
	return Object.values(channels).some((entry) => {
		const channel = getRecord(entry);
		if (!channel) return false;
		return hasLegacyThreadBindingTtl(channel.threadBindings) || hasLegacyThreadBindingTtlInAccounts(channel.accounts);
	});
}
const LEGACY_CONFIG_MIGRATIONS_CHANNELS = [defineLegacyConfigMigration({
	id: "thread-bindings.ttlHours->idleHours",
	describe: "Move legacy threadBindings.ttlHours keys to threadBindings.idleHours (session + channel configs)",
	legacyRules: [{
		path: ["session", "threadBindings"],
		message: "session.threadBindings.ttlHours was renamed to session.threadBindings.idleHours. Run \"openclaw doctor --fix\".",
		match: (value) => hasLegacyThreadBindingTtl(value)
	}, {
		path: ["channels"],
		message: "channels.<id>.threadBindings.ttlHours was renamed to channels.<id>.threadBindings.idleHours. Run \"openclaw doctor --fix\".",
		match: (value) => hasLegacyThreadBindingTtlInAnyChannel(value)
	}],
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
		if (!channels) return;
		for (const [channelId, channelRaw] of Object.entries(channels)) {
			const channel = getRecord(channelRaw);
			if (!channel) continue;
			migrateThreadBindingsTtlHoursForPath({
				owner: channel,
				pathPrefix: `channels.${channelId}`,
				changes
			});
			const accounts = getRecord(channel.accounts);
			if (accounts) {
				for (const [accountId, accountRaw] of Object.entries(accounts)) {
					const account = getRecord(accountRaw);
					if (!account) continue;
					migrateThreadBindingsTtlHoursForPath({
						owner: account,
						pathPrefix: `channels.${channelId}.accounts.${accountId}`,
						changes
					});
					accounts[accountId] = account;
				}
				channel.accounts = accounts;
			}
			channels[channelId] = channel;
		}
		raw.channels = channels;
	}
})];
//#endregion
//#region src/commands/doctor/shared/legacy-config-migrations.runtime.agents.ts
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
const MEMORY_SEARCH_RULE = {
	path: ["memorySearch"],
	message: "top-level memorySearch was moved; use agents.defaults.memorySearch instead. Run \"openclaw doctor --fix\"."
};
const HEARTBEAT_RULE = {
	path: ["heartbeat"],
	message: "top-level heartbeat is not a valid config path; use agents.defaults.heartbeat (cadence/target/model settings) or channels.defaults.heartbeat (showOk/showAlerts/useIndicator)."
};
const LEGACY_SANDBOX_SCOPE_RULES = [{
	path: [
		"agents",
		"defaults",
		"sandbox"
	],
	message: "agents.defaults.sandbox.perSession is legacy; use agents.defaults.sandbox.scope instead. Run \"openclaw doctor --fix\".",
	match: (value) => hasLegacySandboxPerSession(value)
}, {
	path: ["agents", "list"],
	message: "agents.list[].sandbox.perSession is legacy; use agents.list[].sandbox.scope instead. Run \"openclaw doctor --fix\".",
	match: (value) => hasLegacyAgentListSandboxPerSession(value)
}];
const LEGACY_AGENT_RUNTIME_POLICY_RULES = [{
	path: [
		"agents",
		"defaults",
		"embeddedHarness"
	],
	message: "agents.defaults.embeddedHarness is legacy; use agents.defaults.agentRuntime instead. Run \"openclaw doctor --fix\".",
	match: (value) => getRecord(value) !== null
}, {
	path: ["agents", "list"],
	message: "agents.list[].embeddedHarness is legacy; use agents.list[].agentRuntime instead. Run \"openclaw doctor --fix\".",
	match: (value) => hasLegacyAgentListEmbeddedHarness(value)
}];
const LEGACY_AGENT_LLM_TIMEOUT_RULES = [{
	path: [
		"agents",
		"defaults",
		"llm"
	],
	message: "agents.defaults.llm is legacy; use models.providers.<id>.timeoutSeconds for slow model/provider timeouts. Run \"openclaw doctor --fix\".",
	match: (value) => getRecord(value) !== null
}];
function sandboxScopeFromPerSession(perSession) {
	return perSession ? "session" : "shared";
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
function hasLegacySandboxPerSession(value) {
	const sandbox = getRecord(value);
	return Boolean(sandbox && Object.prototype.hasOwnProperty.call(sandbox, "perSession"));
}
function hasLegacyAgentListSandboxPerSession(value) {
	if (!Array.isArray(value)) return false;
	return value.some((agent) => hasLegacySandboxPerSession(getRecord(agent)?.sandbox));
}
function hasLegacyAgentListEmbeddedHarness(value) {
	if (!Array.isArray(value)) return false;
	return value.some((agent) => getRecord(getRecord(agent)?.embeddedHarness) !== null);
}
function migrateLegacySandboxPerSession(sandbox, pathLabel, changes) {
	if (!Object.prototype.hasOwnProperty.call(sandbox, "perSession")) return;
	const rawPerSession = sandbox.perSession;
	if (typeof rawPerSession !== "boolean") return;
	if (sandbox.scope === void 0) {
		sandbox.scope = sandboxScopeFromPerSession(rawPerSession);
		changes.push(`Moved ${pathLabel}.perSession → ${pathLabel}.scope (${String(sandbox.scope)}).`);
	} else changes.push(`Removed ${pathLabel}.perSession (${pathLabel}.scope already set).`);
	delete sandbox.perSession;
}
function migrateLegacyAgentRuntimePolicy(container, pathLabel, changes) {
	const legacy = getRecord(container.embeddedHarness);
	if (!legacy) return;
	const existing = getRecord(container.agentRuntime);
	const next = existing ? structuredClone(existing) : {};
	if (next.id === void 0 && legacy.runtime !== void 0) next.id = legacy.runtime;
	if (next.fallback === void 0 && legacy.fallback !== void 0) next.fallback = legacy.fallback;
	if (Object.keys(next).length > 0) container.agentRuntime = next;
	delete container.embeddedHarness;
	changes.push(`Moved ${pathLabel}.embeddedHarness → ${pathLabel}.agentRuntime.`);
}
const LEGACY_CONFIG_MIGRATIONS_RUNTIME_AGENTS = [
	defineLegacyConfigMigration({
		id: "agents.defaults.llm->models.providers.timeoutSeconds",
		describe: "Remove legacy agents.defaults.llm timeout config",
		legacyRules: LEGACY_AGENT_LLM_TIMEOUT_RULES,
		apply: (raw, changes) => {
			const defaults = getRecord(getRecord(raw.agents)?.defaults);
			if (!defaults || getRecord(defaults.llm) === null) return;
			delete defaults.llm;
			changes.push("Removed agents.defaults.llm; model idle timeout now follows models.providers.<id>.timeoutSeconds.");
		}
	}),
	defineLegacyConfigMigration({
		id: "agents.embeddedHarness->agentRuntime",
		describe: "Move legacy embeddedHarness runtime policy to agentRuntime",
		legacyRules: LEGACY_AGENT_RUNTIME_POLICY_RULES,
		apply: (raw, changes) => {
			const agents = getRecord(raw.agents);
			const defaults = getRecord(agents?.defaults);
			if (defaults) migrateLegacyAgentRuntimePolicy(defaults, "agents.defaults", changes);
			if (!Array.isArray(agents?.list)) return;
			for (const [index, agent] of agents.list.entries()) {
				const agentRecord = getRecord(agent);
				if (!agentRecord) continue;
				migrateLegacyAgentRuntimePolicy(agentRecord, `agents.list.${index}`, changes);
			}
		}
	}),
	defineLegacyConfigMigration({
		id: "agents.sandbox.perSession->scope",
		describe: "Move legacy agent sandbox perSession aliases to sandbox.scope",
		legacyRules: LEGACY_SANDBOX_SCOPE_RULES,
		apply: (raw, changes) => {
			const agents = getRecord(raw.agents);
			const defaultSandbox = getRecord(getRecord(agents?.defaults)?.sandbox);
			if (defaultSandbox) migrateLegacySandboxPerSession(defaultSandbox, "agents.defaults.sandbox", changes);
			if (!Array.isArray(agents?.list)) return;
			for (const [index, agent] of agents.list.entries()) {
				const sandbox = getRecord(getRecord(agent)?.sandbox);
				if (!sandbox) continue;
				migrateLegacySandboxPerSession(sandbox, `agents.list.${index}.sandbox`, changes);
			}
		}
	}),
	defineLegacyConfigMigration({
		id: "memorySearch->agents.defaults.memorySearch",
		describe: "Move top-level memorySearch to agents.defaults.memorySearch",
		legacyRules: [MEMORY_SEARCH_RULE],
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
		id: "heartbeat->agents.defaults.heartbeat",
		describe: "Move top-level heartbeat to agents.defaults.heartbeat/channels.defaults.heartbeat",
		legacyRules: [HEARTBEAT_RULE],
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
//#region src/commands/doctor/shared/legacy-config-migrations.runtime.gateway.ts
const GATEWAY_BIND_RULE = {
	path: ["gateway", "bind"],
	message: "gateway.bind host aliases (for example 0.0.0.0/localhost) are legacy; use bind modes (lan/loopback/custom/tailnet/auto) instead. Run \"openclaw doctor --fix\".",
	match: (value) => isLegacyGatewayBindHostAlias(value),
	requireSourceLiteral: true
};
function isLegacyGatewayBindHostAlias(value) {
	const normalized = normalizeOptionalLowercaseString(value);
	if (!normalized) return false;
	if (normalized === "auto" || normalized === "loopback" || normalized === "lan" || normalized === "tailnet" || normalized === "custom") return false;
	return normalized === "0.0.0.0" || normalized === "::" || normalized === "[::]" || normalized === "*" || normalized === "127.0.0.1" || normalized === "localhost" || normalized === "::1" || normalized === "[::1]";
}
function escapeControlForLog(value) {
	return value.replace(/\r/g, "\\r").replace(/\n/g, "\\n").replace(/\t/g, "\\t");
}
const LEGACY_CONFIG_MIGRATIONS_RUNTIME_GATEWAY = [defineLegacyConfigMigration({
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
		changes.push(`Seeded gateway.controlUi.allowedOrigins ${JSON.stringify(origins)} for bind=${bind}. Required since v2026.2.26. Add other machine origins to gateway.controlUi.allowedOrigins if needed.`);
	}
}), defineLegacyConfigMigration({
	id: "gateway.bind.host-alias->bind-mode",
	describe: "Normalize gateway.bind host aliases to supported bind modes",
	legacyRules: [GATEWAY_BIND_RULE],
	apply: (raw, changes) => {
		const gateway = getRecord(raw.gateway);
		if (!gateway) return;
		const bindRaw = gateway.bind;
		if (typeof bindRaw !== "string") return;
		const normalized = normalizeOptionalLowercaseString(bindRaw);
		if (!normalized) return;
		let mapped;
		if (normalized === "0.0.0.0" || normalized === "::" || normalized === "[::]" || normalized === "*") mapped = "lan";
		else if (normalized === "127.0.0.1" || normalized === "localhost" || normalized === "::1" || normalized === "[::1]") mapped = "loopback";
		if (!mapped || normalized === mapped) return;
		gateway.bind = mapped;
		raw.gateway = gateway;
		changes.push(`Normalized gateway.bind "${escapeControlForLog(bindRaw)}" → "${mapped}".`);
	}
})];
const LEGACY_CONFIG_MIGRATIONS_RUNTIME_MCP = [defineLegacyConfigMigration({
	id: "mcp.servers.type->transport",
	describe: "Move CLI-native MCP server type aliases to OpenClaw transport",
	legacyRules: [{
		path: ["mcp", "servers"],
		message: "mcp.servers entries use OpenClaw transport names; CLI-native type aliases are legacy here. Run \"openclaw doctor --fix\".",
		match: (value) => isRecord$1(value) && Object.values(value).some((server) => isRecord$1(server) && isKnownCliMcpTypeAlias(server.type))
	}],
	apply: (raw, changes) => {
		const mcp = isRecord$1(raw.mcp) ? raw.mcp : void 0;
		const servers = isRecord$1(mcp?.servers) ? mcp?.servers : void 0;
		if (!servers) return;
		for (const [serverName, rawServer] of Object.entries(servers)) {
			if (!isRecord$1(rawServer) || !isKnownCliMcpTypeAlias(rawServer.type)) continue;
			const rawType = typeof rawServer.type === "string" ? rawServer.type : "";
			const alias = resolveOpenClawMcpTransportAlias(rawServer.type);
			if (typeof rawServer.transport !== "string" && alias) {
				rawServer.transport = alias;
				changes.push(`Moved mcp.servers.${serverName}.type "${rawType}" → transport "${alias}".`);
			} else if (typeof rawServer.transport === "string") changes.push(`Removed mcp.servers.${serverName}.type (transport "${rawServer.transport}" already set).`);
			else changes.push(`Removed mcp.servers.${serverName}.type "${rawType}".`);
			delete rawServer.type;
		}
	}
})];
//#endregion
//#region src/commands/doctor/shared/legacy-x-search-migrate.ts
const XAI_PLUGIN_ID = "xai";
const X_SEARCH_LEGACY_PATH = "tools.web.x_search";
const XAI_WEB_SEARCH_PLUGIN_KEY_PATH = `plugins.entries.${XAI_PLUGIN_ID}.config.webSearch.apiKey`;
function cloneRecord(value) {
	if (!value) return value;
	return { ...value };
}
function ensureRecord(target, key) {
	const current = target[key];
	if (isRecord$1(current)) return current;
	const next = {};
	target[key] = next;
	return next;
}
function resolveLegacyXSearchConfig(raw) {
	if (!isRecord$1(raw)) return;
	const tools = isRecord$1(raw.tools) ? raw.tools : void 0;
	const web = isRecord$1(tools?.web) ? tools.web : void 0;
	return isRecord$1(web?.x_search) ? web.x_search : void 0;
}
function resolveLegacyXSearchAuth(legacy) {
	return legacy.apiKey;
}
function migrateLegacyXSearchConfig(raw) {
	if (!isRecord$1(raw)) return {
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
		const existingWebSearch = isRecord$1(config.webSearch) ? cloneRecord(config.webSearch) : void 0;
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
const LEGACY_CONFIG_MIGRATIONS_RUNTIME_PROVIDERS = [defineLegacyConfigMigration({
	id: "tools.web.x_search.apiKey->plugins.entries.xai.config.webSearch.apiKey",
	describe: "Move legacy x_search auth into the xAI plugin webSearch config",
	legacyRules: [{
		path: [
			"tools",
			"web",
			"x_search",
			"apiKey"
		],
		message: "tools.web.x_search.apiKey moved to the xAI plugin; use plugins.entries.xai.config.webSearch.apiKey instead. Run \"openclaw doctor --fix\"."
	}],
	apply: (raw, changes) => {
		const migrated = migrateLegacyXSearchConfig(raw);
		if (!migrated.changes.length) return;
		for (const key of Object.keys(raw)) delete raw[key];
		Object.assign(raw, migrated.config);
		changes.push(...migrated.changes);
	}
})];
//#endregion
//#region src/commands/doctor/shared/legacy-config-migrations.runtime.tts.ts
const LEGACY_TTS_PROVIDER_KEYS = [
	"openai",
	"elevenlabs",
	"microsoft",
	"edge"
];
const LEGACY_TTS_PLUGIN_IDS = new Set(["voice-call"]);
function isLegacyEdgeProviderId(value) {
	return typeof value === "string" && value.trim().toLowerCase() === "edge";
}
function hasLegacyTtsProviderKeys(value) {
	const tts = getRecord(value);
	if (!tts) return false;
	if (isLegacyEdgeProviderId(tts.provider)) return true;
	if (LEGACY_TTS_PROVIDER_KEYS.some((key) => Object.prototype.hasOwnProperty.call(tts, key))) return true;
	const providers = getRecord(tts.providers);
	return Boolean(providers && Object.prototype.hasOwnProperty.call(providers, "edge"));
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
function mergeLegacyTtsProviderAliasConfig(tts, aliasKey, providerId) {
	const providers = getRecord(tts.providers);
	const aliasValue = getRecord(providers?.[aliasKey]);
	if (!providers || !aliasValue) return false;
	const existing = getRecord(providers[providerId]) ?? {};
	const merged = structuredClone(existing);
	mergeMissing(merged, aliasValue);
	providers[providerId] = merged;
	delete providers[aliasKey];
	return true;
}
function migrateLegacyTtsConfig(tts, pathLabel, changes) {
	if (!tts) return;
	if (isLegacyEdgeProviderId(tts.provider)) {
		tts.provider = "microsoft";
		changes.push(`Moved ${pathLabel}.provider "edge" → "microsoft".`);
	}
	const movedOpenAI = mergeLegacyTtsProviderConfig(tts, "openai", "openai");
	const movedElevenLabs = mergeLegacyTtsProviderConfig(tts, "elevenlabs", "elevenlabs");
	const movedMicrosoft = mergeLegacyTtsProviderConfig(tts, "microsoft", "microsoft");
	const movedProviderEdge = mergeLegacyTtsProviderAliasConfig(tts, "edge", "microsoft");
	const movedEdge = mergeLegacyTtsProviderConfig(tts, "edge", "microsoft");
	if (movedOpenAI) changes.push(`Moved ${pathLabel}.openai → ${pathLabel}.providers.openai.`);
	if (movedElevenLabs) changes.push(`Moved ${pathLabel}.elevenlabs → ${pathLabel}.providers.elevenlabs.`);
	if (movedMicrosoft) changes.push(`Moved ${pathLabel}.microsoft → ${pathLabel}.providers.microsoft.`);
	if (movedProviderEdge) changes.push(`Moved ${pathLabel}.providers.edge → ${pathLabel}.providers.microsoft.`);
	if (movedEdge) changes.push(`Moved ${pathLabel}.edge → ${pathLabel}.providers.microsoft.`);
}
const LEGACY_CONFIG_MIGRATIONS_RUNTIME_TTS = [defineLegacyConfigMigration({
	id: "tts.providers-generic-shape",
	describe: "Move legacy bundled TTS config keys into messages.tts.providers",
	legacyRules: [{
		path: ["messages", "tts"],
		message: "messages.tts legacy provider aliases/keys are legacy; use provider: \"microsoft\" and messages.tts.providers.<provider>. Run \"openclaw doctor --fix\".",
		match: (value) => hasLegacyTtsProviderKeys(value)
	}, {
		path: ["plugins", "entries"],
		message: "plugins.entries.voice-call.config.tts legacy provider aliases/keys are legacy; use provider: \"microsoft\" and plugins.entries.voice-call.config.tts.providers.<provider>. Run \"openclaw doctor --fix\".",
		match: (value) => hasLegacyPluginEntryTtsProviderKeys(value)
	}],
	apply: (raw, changes) => {
		migrateLegacyTtsConfig(getRecord(getRecord(raw.messages)?.tts), "messages.tts", changes);
		const pluginEntries = getRecord(getRecord(raw.plugins)?.entries);
		if (!pluginEntries) return;
		for (const [pluginId, entryValue] of Object.entries(pluginEntries)) {
			if (isBlockedObjectKey(pluginId) || !LEGACY_TTS_PLUGIN_IDS.has(pluginId)) continue;
			migrateLegacyTtsConfig(getRecord(getRecord(getRecord(entryValue)?.config)?.tts), `plugins.entries.${pluginId}.config.tts`, changes);
		}
	}
})];
//#endregion
//#region src/commands/doctor/shared/legacy-config-migrations.runtime.ts
const LEGACY_CONFIG_MIGRATIONS_RUNTIME = [
	...LEGACY_CONFIG_MIGRATIONS_RUNTIME_AGENTS,
	...LEGACY_CONFIG_MIGRATIONS_RUNTIME_GATEWAY,
	...LEGACY_CONFIG_MIGRATIONS_RUNTIME_MCP,
	...LEGACY_CONFIG_MIGRATIONS_RUNTIME_PROVIDERS,
	...LEGACY_CONFIG_MIGRATIONS_RUNTIME_TTS
];
//#endregion
//#region src/commands/doctor/shared/legacy-web-search-migrate.ts
const MODERN_SCOPED_WEB_SEARCH_KEYS = new Set(["openaiCodex"]);
const NON_MIGRATED_LEGACY_WEB_SEARCH_PROVIDER_IDS = new Set(["tavily"]);
const LEGACY_GLOBAL_WEB_SEARCH_PROVIDER_ID = "brave";
let legacyWebSearchProviderIdsCache;
let legacyWebSearchProviderIdSetCache;
function getLegacyWebSearchProviderIds() {
	legacyWebSearchProviderIdsCache ??= loadPluginManifestRegistryForPluginRegistry({ includeDisabled: true }).plugins.filter((plugin) => plugin.origin === "bundled").flatMap((plugin) => plugin.contracts?.webSearchProviders ?? []).filter((providerId) => !NON_MIGRATED_LEGACY_WEB_SEARCH_PROVIDER_IDS.has(providerId)).toSorted((left, right) => left.localeCompare(right));
	return legacyWebSearchProviderIdsCache;
}
function getLegacyWebSearchProviderIdSet() {
	legacyWebSearchProviderIdSetCache ??= new Set(getLegacyWebSearchProviderIds());
	return legacyWebSearchProviderIdSetCache;
}
function resolveLegacySearchConfig(raw) {
	if (!isRecord$1(raw)) return;
	const tools = isRecord$1(raw.tools) ? raw.tools : void 0;
	const web = isRecord$1(tools?.web) ? tools.web : void 0;
	return isRecord$1(web?.search) ? web.search : void 0;
}
function copyLegacyProviderConfig(search, providerKey) {
	const current = search[providerKey];
	return isRecord$1(current) ? cloneRecord$1(current) : void 0;
}
function hasMappedLegacyWebSearchConfig(raw) {
	const search = resolveLegacySearchConfig(raw);
	if (!search) return false;
	if (hasOwnKey$1(search, "apiKey")) return true;
	return getLegacyWebSearchProviderIds().some((providerId) => isRecord$1(search[providerId]));
}
function resolveLegacyGlobalWebSearchMigration(search) {
	const legacyProviderConfig = copyLegacyProviderConfig(search, LEGACY_GLOBAL_WEB_SEARCH_PROVIDER_ID);
	const payload = legacyProviderConfig ?? {};
	const hasLegacyApiKey = hasOwnKey$1(search, "apiKey");
	if (hasLegacyApiKey) payload.apiKey = search.apiKey;
	if (Object.keys(payload).length === 0) return null;
	const pluginId = resolveManifestContractOwnerPluginId({
		contract: "webSearchProviders",
		value: LEGACY_GLOBAL_WEB_SEARCH_PROVIDER_ID,
		origin: "bundled"
	}) ?? LEGACY_GLOBAL_WEB_SEARCH_PROVIDER_ID;
	return {
		pluginId,
		payload,
		legacyPath: hasLegacyApiKey ? "tools.web.search.apiKey" : `tools.web.search.${LEGACY_GLOBAL_WEB_SEARCH_PROVIDER_ID}`,
		targetPath: hasLegacyApiKey && !legacyProviderConfig ? `plugins.entries.${pluginId}.config.webSearch.apiKey` : `plugins.entries.${pluginId}.config.webSearch`
	};
}
function migratePluginWebSearchConfig(params) {
	const entry = ensureRecord$2(ensureRecord$2(ensureRecord$2(params.root, "plugins"), "entries"), params.pluginId);
	const config = ensureRecord$2(entry, "config");
	const hadEnabled = entry.enabled !== void 0;
	const existing = isRecord$1(config.webSearch) ? cloneRecord$1(config.webSearch) : void 0;
	if (!hadEnabled) entry.enabled = true;
	if (!existing) {
		config.webSearch = cloneRecord$1(params.payload);
		params.changes.push(`Moved ${params.legacyPath} → ${params.targetPath}.`);
		return;
	}
	const merged = cloneRecord$1(existing);
	mergeMissing(merged, params.payload);
	const changed = JSON.stringify(merged) !== JSON.stringify(existing) || !hadEnabled;
	config.webSearch = merged;
	if (changed) {
		params.changes.push(`Merged ${params.legacyPath} → ${params.targetPath} (filled missing fields from legacy; kept explicit plugin config values).`);
		return;
	}
	params.changes.push(`Removed ${params.legacyPath} (${params.targetPath} already set).`);
}
function listLegacyWebSearchConfigPaths(raw) {
	const search = resolveLegacySearchConfig(raw);
	if (!search) return [];
	const paths = [];
	if ("apiKey" in search) paths.push("tools.web.search.apiKey");
	for (const providerId of getLegacyWebSearchProviderIds()) {
		const scoped = search[providerId];
		if (isRecord$1(scoped)) for (const key of Object.keys(scoped)) paths.push(`tools.web.search.${providerId}.${key}`);
	}
	return paths;
}
function migrateLegacyWebSearchConfig(raw) {
	if (!isRecord$1(raw)) return {
		config: raw,
		changes: []
	};
	if (!hasMappedLegacyWebSearchConfig(raw)) return {
		config: raw,
		changes: []
	};
	return normalizeLegacyWebSearchConfigRecord(raw);
}
function normalizeLegacyWebSearchConfigRecord(raw) {
	const nextRoot = cloneRecord$1(raw);
	const web = ensureRecord$2(ensureRecord$2(nextRoot, "tools"), "web");
	const search = resolveLegacySearchConfig(nextRoot);
	if (!search) return {
		config: raw,
		changes: []
	};
	const nextSearch = {};
	const changes = [];
	for (const [key, value] of Object.entries(search)) {
		if (key === "apiKey") continue;
		if (getLegacyWebSearchProviderIdSet().has(key) && isRecord$1(value)) continue;
		if (MODERN_SCOPED_WEB_SEARCH_KEYS.has(key) || !isRecord$1(value)) nextSearch[key] = value;
	}
	web.search = nextSearch;
	const globalSearchMigration = resolveLegacyGlobalWebSearchMigration(search);
	if (globalSearchMigration) migratePluginWebSearchConfig({
		root: nextRoot,
		legacyPath: globalSearchMigration.legacyPath,
		targetPath: globalSearchMigration.targetPath,
		pluginId: globalSearchMigration.pluginId,
		payload: globalSearchMigration.payload,
		changes
	});
	for (const providerId of getLegacyWebSearchProviderIds()) {
		if (providerId === LEGACY_GLOBAL_WEB_SEARCH_PROVIDER_ID) continue;
		const scoped = copyLegacyProviderConfig(search, providerId);
		if (!scoped || Object.keys(scoped).length === 0) continue;
		const pluginId = resolveManifestContractOwnerPluginId({
			contract: "webSearchProviders",
			value: providerId,
			origin: "bundled"
		});
		if (!pluginId) continue;
		migratePluginWebSearchConfig({
			root: nextRoot,
			legacyPath: `tools.web.search.${providerId}`,
			targetPath: `plugins.entries.${pluginId}.config.webSearch`,
			pluginId,
			payload: scoped,
			changes
		});
	}
	return {
		config: nextRoot,
		changes
	};
}
//#endregion
//#region src/commands/doctor/shared/legacy-config-migrations.web-search.ts
const LEGACY_WEB_SEARCH_RULES = [{
	path: [
		"tools",
		"web",
		"search"
	],
	message: "tools.web.search provider-owned config moved to plugins.entries.<plugin>.config.webSearch. Run \"openclaw doctor --fix\".",
	match: (_value, root) => listLegacyWebSearchConfigPaths(root).length > 0,
	requireSourceLiteral: true
}];
function replaceRootRecord(target, replacement) {
	for (const key of Object.keys(target)) delete target[key];
	Object.assign(target, replacement);
}
const LEGACY_CONFIG_MIGRATIONS_WEB_SEARCH = [defineLegacyConfigMigration({
	id: "tools.web.search-provider-config->plugins.entries",
	describe: "Move legacy tools.web.search provider-owned config into plugins.entries.<plugin>.config.webSearch",
	legacyRules: LEGACY_WEB_SEARCH_RULES,
	apply: (raw, changes) => {
		const migrated = migrateLegacyWebSearchConfig(raw);
		if (migrated.changes.length === 0) return;
		replaceRootRecord(raw, migrated.config);
		changes.push(...migrated.changes);
	}
})];
//#endregion
//#region src/commands/doctor/shared/legacy-config-migrations.ts
const LEGACY_CONFIG_MIGRATION_SPECS = [
	...LEGACY_CONFIG_MIGRATIONS_CHANNELS,
	...LEGACY_CONFIG_MIGRATIONS_AUDIO,
	...LEGACY_CONFIG_MIGRATIONS_RUNTIME,
	...LEGACY_CONFIG_MIGRATIONS_WEB_SEARCH
];
const LEGACY_CONFIG_MIGRATIONS = LEGACY_CONFIG_MIGRATION_SPECS.map(({ legacyRules: _legacyRules, ...migration }) => migration);
const LEGACY_CONFIG_MIGRATION_RULES = LEGACY_CONFIG_MIGRATION_SPECS.flatMap((migration) => migration.legacyRules ?? []);
//#endregion
//#region src/commands/doctor/shared/legacy-config-compat.ts
function applyLegacyDoctorMigrations(raw) {
	if (!raw || typeof raw !== "object") return {
		next: null,
		changes: []
	};
	const original = raw;
	const next = structuredClone(original);
	const changes = [];
	for (const migration of LEGACY_CONFIG_MIGRATIONS) migration.apply(next, changes);
	const compat = applyChannelDoctorCompatibilityMigrations(next);
	changes.push(...compat.changes);
	if (changes.length === 0) return {
		next: null,
		changes: []
	};
	return {
		next: compat.next,
		changes
	};
}
//#endregion
//#region src/agents/model-runtime-aliases.ts
const LEGACY_RUNTIME_MODEL_PROVIDER_ALIASES = [
	{
		legacyProvider: "codex",
		provider: "openai",
		runtime: "codex",
		cli: false
	},
	{
		legacyProvider: "codex-cli",
		provider: "openai",
		runtime: "codex-cli",
		cli: true
	},
	{
		legacyProvider: "claude-cli",
		provider: "anthropic",
		runtime: "claude-cli",
		cli: true
	},
	{
		legacyProvider: "google-gemini-cli",
		provider: "google",
		runtime: "google-gemini-cli",
		cli: true
	}
];
const LEGACY_ALIAS_BY_PROVIDER = new Map(LEGACY_RUNTIME_MODEL_PROVIDER_ALIASES.map((entry) => [normalizeProviderId(entry.legacyProvider), entry]));
const CLI_RUNTIME_BY_PROVIDER = new Map(LEGACY_RUNTIME_MODEL_PROVIDER_ALIASES.filter((entry) => entry.cli).map((entry) => [`${normalizeProviderId(entry.provider)}:${normalizeProviderId(entry.runtime)}`, entry]));
const CLI_RUNTIME_ALIASES = new Set(LEGACY_RUNTIME_MODEL_PROVIDER_ALIASES.filter((entry) => entry.cli).map((entry) => normalizeProviderId(entry.runtime)));
function listLegacyRuntimeModelProviderAliases() {
	return LEGACY_RUNTIME_MODEL_PROVIDER_ALIASES;
}
function resolveLegacyRuntimeModelProviderAlias(provider) {
	return LEGACY_ALIAS_BY_PROVIDER.get(normalizeProviderId(provider));
}
function migrateLegacyRuntimeModelRef(raw) {
	const trimmed = raw.trim();
	const slash = trimmed.indexOf("/");
	if (slash <= 0 || slash >= trimmed.length - 1) return null;
	const alias = resolveLegacyRuntimeModelProviderAlias(trimmed.slice(0, slash));
	if (!alias) return null;
	const model = trimmed.slice(slash + 1).trim();
	if (!model) return null;
	return {
		ref: `${alias.provider}/${model}`,
		legacyProvider: alias.legacyProvider,
		provider: alias.provider,
		model,
		runtime: alias.runtime,
		cli: alias.cli
	};
}
function isLegacyRuntimeModelProvider(provider) {
	return Boolean(resolveLegacyRuntimeModelProviderAlias(provider));
}
function isCliRuntimeAlias(runtime) {
	const normalized = runtime?.trim();
	return normalized ? CLI_RUNTIME_ALIASES.has(normalizeProviderId(normalized)) : false;
}
function resolveConfiguredRuntime(params) {
	const override = params.runtimeOverride?.trim();
	if (override) return normalizeProviderId(override);
	if (params.agentId) {
		const agentEntry = params.cfg?.agents?.list?.find((entry) => normalizeAgentId(entry.id) === normalizeAgentId(params.agentId ?? ""));
		const agentRuntime = resolveAgentRuntimePolicy(agentEntry)?.id?.trim();
		if (agentRuntime) return normalizeProviderId(agentRuntime);
	}
	const defaults = resolveAgentRuntimePolicy(params.cfg?.agents?.defaults)?.id?.trim();
	if (defaults) return normalizeProviderId(defaults);
}
function resolveCliRuntimeExecutionProvider(params) {
	const provider = normalizeProviderId(params.provider);
	const runtime = resolveConfiguredRuntime(params);
	if (!runtime || runtime === "auto" || runtime === "pi") return;
	return CLI_RUNTIME_BY_PROVIDER.get(`${provider}:${runtime}`)?.runtime;
}
//#endregion
//#region src/agents/openai-codex-models-add-legacy.ts
const LEGACY_MODELS_ADD_CODEX_MODEL_IDS = new Set(["gpt-5.5", "gpt-5.5-pro"]);
function isLegacyModelsAddCodexMetadataModel(params) {
	const model = params.model;
	if (normalizeProviderId(params.provider) !== "openai-codex" || !model) return false;
	const id = model.id?.trim().toLowerCase();
	if (!id || !LEGACY_MODELS_ADD_CODEX_MODEL_IDS.has(id)) return false;
	return model.api === "openai-codex-responses" && model.reasoning === true && Array.isArray(model.input) && model.input.length === 2 && model.input[0] === "text" && model.input[1] === "image" && model.cost?.input === 5 && model.cost.output === 30 && model.cost.cacheRead === .5 && model.cost.cacheWrite === 0 && model.contextWindow === 4e5 && model.contextTokens === 272e3 && model.maxTokens === 128e3;
}
//#endregion
//#region src/plugins/provider-public-artifacts.ts
const PROVIDER_POLICY_ARTIFACT_CANDIDATES = ["provider-policy-api.js"];
const bundledProviderPolicySurfaceCache = /* @__PURE__ */ new Map();
function buildProviderPolicySurfaceCacheKey(providerId) {
	return `${providerId}::${resolveBundledPluginsDir() ?? "<default>"}`;
}
function hasProviderPolicyHook(mod) {
	return typeof mod.normalizeConfig === "function" || typeof mod.applyConfigDefaults === "function" || typeof mod.resolveConfigApiKey === "function";
}
function tryLoadBundledProviderPolicySurface(pluginId) {
	for (const artifactBasename of PROVIDER_POLICY_ARTIFACT_CANDIDATES) try {
		const mod = loadBundledPluginPublicArtifactModuleSync({
			dirName: pluginId,
			artifactBasename
		});
		if (hasProviderPolicyHook(mod)) return mod;
	} catch (error) {
		if (error instanceof Error && error.message.startsWith("Unable to resolve bundled plugin public surface ")) continue;
		throw error;
	}
	return null;
}
function resolveBundledProviderPolicySurface(providerId) {
	const normalizedProviderId = normalizeProviderId(providerId);
	if (!normalizedProviderId) return null;
	const cacheKey = buildProviderPolicySurfaceCacheKey(normalizedProviderId);
	if (bundledProviderPolicySurfaceCache.has(cacheKey)) return bundledProviderPolicySurfaceCache.get(cacheKey) ?? null;
	const surface = tryLoadBundledProviderPolicySurface(normalizedProviderId);
	if (surface) {
		bundledProviderPolicySurfaceCache.set(cacheKey, surface);
		return surface;
	}
	bundledProviderPolicySurfaceCache.set(cacheKey, null);
	return null;
}
//#endregion
//#region src/config/provider-policy.ts
function normalizeProviderConfigForConfigDefaults(params) {
	const normalized = resolveBundledProviderPolicySurface(params.provider)?.normalizeConfig?.({
		provider: params.provider,
		providerConfig: params.providerConfig
	});
	return normalized && normalized !== params.providerConfig ? normalized : params.providerConfig;
}
function applyProviderConfigDefaultsForConfig(params) {
	return resolveBundledProviderPolicySurface(params.provider)?.applyConfigDefaults?.({
		provider: params.provider,
		config: params.config,
		env: params.env
	}) ?? params.config;
}
//#endregion
//#region src/config/defaults.ts
let defaultWarnState = { warned: false };
const DEFAULT_MODEL_ALIASES = {
	opus: "anthropic/claude-opus-4-7",
	sonnet: "anthropic/claude-sonnet-4-6",
	gpt: "openai/gpt-5.4",
	"gpt-mini": "openai/gpt-5.4-mini",
	"gpt-nano": "openai/gpt-5.4-nano",
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
function isPositiveNumber(value) {
	return typeof value === "number" && Number.isFinite(value) && value > 0;
}
function resolveModelCost(raw) {
	return {
		input: typeof raw?.input === "number" ? raw.input : DEFAULT_MODEL_COST.input,
		output: typeof raw?.output === "number" ? raw.output : DEFAULT_MODEL_COST.output,
		cacheRead: typeof raw?.cacheRead === "number" ? raw.cacheRead : DEFAULT_MODEL_COST.cacheRead,
		cacheWrite: typeof raw?.cacheWrite === "number" ? raw.cacheWrite : DEFAULT_MODEL_COST.cacheWrite,
		...raw?.tieredPricing ? { tieredPricing: raw.tieredPricing } : {}
	};
}
function resolveNormalizedProviderModelMaxTokens(params) {
	const clamped = Math.min(params.rawMaxTokens, params.contextWindow);
	if (normalizeProviderId(params.providerId) !== "mistral" || clamped < params.contextWindow) return clamped;
	const safeMaxTokens = MISTRAL_SAFE_MAX_TOKENS_BY_MODEL[params.modelId] ?? DEFAULT_MODEL_MAX_TOKENS;
	return Math.min(safeMaxTokens, params.contextWindow);
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
			const normalizedProvider = normalizeProviderConfigForConfigDefaults({
				provider: providerId,
				providerConfig: provider
			});
			const models = normalizedProvider.models;
			if (!Array.isArray(models) || models.length === 0) {
				if (normalizedProvider !== provider) {
					nextProviders[providerId] = normalizedProvider;
					mutated = true;
				}
				continue;
			}
			const providerApi = normalizedProvider.api;
			let nextProvider = normalizedProvider;
			if (nextProvider !== provider) mutated = true;
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
				return Object.assign({}, raw, {
					reasoning,
					input,
					cost,
					contextWindow,
					maxTokens,
					api
				});
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
function hasAnthropicDefaultSignal(cfg, env) {
	if (env.ANTHROPIC_API_KEY?.trim() || env.ANTHROPIC_OAUTH_TOKEN?.trim()) return true;
	const profiles = cfg.auth?.profiles;
	if (profiles) for (const profile of Object.values(profiles)) {
		const provider = normalizeProviderId(profile?.provider);
		if (provider === "anthropic" || provider === "claude-cli") return true;
	}
	const order = cfg.auth?.order;
	if (!order) return false;
	return Object.keys(order).some((provider) => {
		const normalizedProvider = normalizeProviderId(provider);
		if (normalizedProvider !== "anthropic" && normalizedProvider !== "claude-cli") return false;
		return order[provider] !== void 0;
	});
}
function applyContextPruningDefaults(cfg) {
	if (!cfg.agents?.defaults) return cfg;
	if (!hasAnthropicDefaultSignal(cfg, process.env)) return cfg;
	return applyProviderConfigDefaultsForConfig({
		provider: "anthropic",
		config: cfg,
		env: process.env
	}) ?? cfg;
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
//#region src/infra/google-api-base-url.ts
const DEFAULT_GOOGLE_API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
function trimTrailingSlashes(value) {
	return value.replace(/\/+$/, "");
}
function isCanonicalGoogleApiOriginShorthand(value) {
	return /^https:\/\/generativelanguage\.googleapis\.com\/?$/i.test(value);
}
function normalizeGoogleApiBaseUrl(baseUrl) {
	const raw = trimTrailingSlashes(baseUrl?.trim() || "https://generativelanguage.googleapis.com/v1beta");
	try {
		const url = new URL(raw);
		url.hash = "";
		url.search = "";
		if (resolveProviderEndpoint(url.toString()).endpointClass === "google-generative-ai" && trimTrailingSlashes(url.pathname || "") === "") url.pathname = "/v1beta";
		return trimTrailingSlashes(url.toString());
	} catch {
		if (isCanonicalGoogleApiOriginShorthand(raw)) return DEFAULT_GOOGLE_API_BASE_URL;
		return raw;
	}
}
//#endregion
//#region src/commands/doctor/shared/legacy-talk-config-normalizer.ts
function buildLegacyTalkProviderCompat(talk) {
	const compat = {};
	for (const key of [
		"voiceId",
		"voiceAliases",
		"modelId",
		"outputFormat",
		"apiKey"
	]) if (talk[key] !== void 0) compat[key] = talk[key];
	return Object.keys(compat).length > 0 ? compat : void 0;
}
function isRecord(value) {
	return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
function normalizeLegacyTalkConfig(cfg, changes) {
	const rawTalk = cfg.talk;
	if (!isRecord(rawTalk)) return cfg;
	const normalizedTalk = normalizeTalkSection(rawTalk) ?? {};
	const legacyProviderCompat = buildLegacyTalkProviderCompat(rawTalk);
	if (legacyProviderCompat) normalizedTalk.providers = {
		...normalizedTalk.providers,
		elevenlabs: {
			...legacyProviderCompat,
			...normalizedTalk.providers?.elevenlabs
		}
	};
	if (Object.keys(normalizedTalk).length === 0 || isDeepStrictEqual(normalizedTalk, rawTalk)) return cfg;
	changes.push("Normalized talk.provider/providers shape (trimmed provider ids and merged missing compatibility fields).");
	return {
		...cfg,
		talk: normalizedTalk
	};
}
//#endregion
//#region src/commands/doctor/shared/legacy-config-core-normalizers.ts
function normalizeLegacyCommandsConfig(cfg, changes) {
	const rawCommands = cfg.commands;
	if (!isRecord$1(rawCommands) || !("modelsWrite" in rawCommands)) return cfg;
	const commands = { ...rawCommands };
	delete commands.modelsWrite;
	changes.push("Removed deprecated commands.modelsWrite (/models add is deprecated).");
	return {
		...cfg,
		commands
	};
}
function normalizeLegacyBrowserConfig(cfg, changes) {
	const rawBrowser = cfg.browser;
	if (!isRecord$1(rawBrowser)) return cfg;
	const browser = structuredClone(rawBrowser);
	let browserChanged = false;
	if ("relayBindHost" in browser) {
		delete browser.relayBindHost;
		browserChanged = true;
		changes.push("Removed browser.relayBindHost (legacy Chrome extension relay setting; host-local Chrome now uses Chrome MCP existing-session attach).");
	}
	const rawProfiles = browser.profiles;
	if (isRecord$1(rawProfiles)) {
		const profiles = { ...rawProfiles };
		let profilesChanged = false;
		for (const [profileName, rawProfile] of Object.entries(rawProfiles)) {
			if (!isRecord$1(rawProfile)) continue;
			if ((normalizeOptionalString(rawProfile.driver) ?? "") !== "extension") continue;
			profiles[profileName] = {
				...rawProfile,
				driver: "existing-session"
			};
			profilesChanged = true;
			changes.push(`Moved browser.profiles.${profileName}.driver "extension" → "existing-session" (Chrome MCP attach).`);
		}
		if (profilesChanged) {
			browser.profiles = profiles;
			browserChanged = true;
		}
	}
	const rawSsrFPolicy = browser.ssrfPolicy;
	if (isRecord$1(rawSsrFPolicy) && "allowPrivateNetwork" in rawSsrFPolicy) {
		const legacyAllowPrivateNetwork = rawSsrFPolicy.allowPrivateNetwork;
		const currentDangerousAllowPrivateNetwork = rawSsrFPolicy.dangerouslyAllowPrivateNetwork;
		let resolvedDangerousAllowPrivateNetwork = currentDangerousAllowPrivateNetwork;
		if (typeof legacyAllowPrivateNetwork === "boolean" || typeof currentDangerousAllowPrivateNetwork === "boolean") resolvedDangerousAllowPrivateNetwork = legacyAllowPrivateNetwork === true || currentDangerousAllowPrivateNetwork === true;
		else if (currentDangerousAllowPrivateNetwork === void 0) resolvedDangerousAllowPrivateNetwork = legacyAllowPrivateNetwork;
		const nextSsrFPolicy = { ...rawSsrFPolicy };
		delete nextSsrFPolicy.allowPrivateNetwork;
		if (resolvedDangerousAllowPrivateNetwork !== void 0) nextSsrFPolicy.dangerouslyAllowPrivateNetwork = resolvedDangerousAllowPrivateNetwork;
		browser.ssrfPolicy = nextSsrFPolicy;
		browserChanged = true;
		changes.push(`Moved browser.ssrfPolicy.allowPrivateNetwork → browser.ssrfPolicy.dangerouslyAllowPrivateNetwork (${String(resolvedDangerousAllowPrivateNetwork)}).`);
	}
	if (!browserChanged) return cfg;
	return {
		...cfg,
		browser
	};
}
function seedMissingDefaultAccountsFromSingleAccountBase(cfg, changes) {
	const channels = cfg.channels;
	if (!channels) return cfg;
	let channelsChanged = false;
	const nextChannels = { ...channels };
	for (const [channelId, rawChannel] of Object.entries(channels)) {
		if (!isRecord$1(rawChannel)) continue;
		const rawAccounts = rawChannel.accounts;
		if (!isRecord$1(rawAccounts)) continue;
		const accountKeys = Object.keys(rawAccounts);
		if (accountKeys.length === 0) continue;
		if (accountKeys.some((key) => normalizeOptionalLowercaseString(key) === "default")) continue;
		const keysToMove = resolveSingleAccountKeysToMove({
			channelKey: channelId,
			channel: rawChannel
		});
		if (keysToMove.length === 0) continue;
		const defaultAccount = {};
		for (const key of keysToMove) {
			const value = rawChannel[key];
			defaultAccount[key] = value && typeof value === "object" ? structuredClone(value) : value;
		}
		const nextChannel = { ...rawChannel };
		for (const key of keysToMove) delete nextChannel[key];
		nextChannel.accounts = {
			...rawAccounts,
			[DEFAULT_ACCOUNT_ID]: defaultAccount
		};
		nextChannels[channelId] = nextChannel;
		channelsChanged = true;
		changes.push(`Moved channels.${channelId} single-account top-level values into channels.${channelId}.accounts.default.`);
	}
	if (!channelsChanged) return cfg;
	return {
		...cfg,
		channels: nextChannels
	};
}
function mergeModelEntry(legacyEntry, currentEntry) {
	if (!isRecord$1(legacyEntry) || !isRecord$1(currentEntry)) return currentEntry ?? legacyEntry;
	return {
		...legacyEntry,
		...currentEntry
	};
}
function normalizeLegacyRuntimeAgentModelConfig(raw) {
	if (typeof raw === "string") {
		const migrated = migrateLegacyRuntimeModelRef(raw);
		return migrated ? {
			value: migrated.ref,
			changed: true,
			selectedRuntime: migrated.runtime
		} : {
			value: raw,
			changed: false
		};
	}
	if (!isRecord$1(raw)) return {
		value: raw,
		changed: false
	};
	const migratedPrimary = typeof raw.primary === "string" ? migrateLegacyRuntimeModelRef(raw.primary) : null;
	if (!migratedPrimary) return {
		value: raw,
		changed: false
	};
	const next = {
		...raw,
		primary: migratedPrimary.ref
	};
	if (Array.isArray(raw.fallbacks)) next.fallbacks = raw.fallbacks.map((fallback) => {
		if (typeof fallback !== "string") return fallback;
		const migratedFallback = migrateLegacyRuntimeModelRef(fallback);
		return migratedFallback?.runtime === migratedPrimary.runtime ? migratedFallback.ref : fallback;
	});
	return {
		value: next,
		changed: true,
		selectedRuntime: migratedPrimary.runtime
	};
}
function normalizeLegacyRuntimeAllowlistModels(rawModels, selectedRuntime) {
	if (!selectedRuntime || !isRecord$1(rawModels)) return {
		value: rawModels,
		changed: false
	};
	let changed = false;
	const next = {};
	const legacyEntries = [];
	for (const [rawKey, entry] of Object.entries(rawModels)) {
		const migrated = migrateLegacyRuntimeModelRef(rawKey);
		if (migrated?.runtime === selectedRuntime) {
			changed = true;
			legacyEntries.push([migrated.ref, entry]);
			continue;
		}
		next[rawKey] = mergeModelEntry(entry, next[rawKey]);
	}
	for (const [migratedKey, entry] of legacyEntries) next[migratedKey] = mergeModelEntry(entry, next[migratedKey]);
	return {
		value: next,
		changed
	};
}
function ensureAgentRuntimePolicy(raw, selectedRuntime) {
	if (!isRecord$1(raw)) return {
		value: { id: selectedRuntime },
		changed: true
	};
	const currentRuntime = normalizeOptionalLowercaseString(raw.id);
	if (!currentRuntime || currentRuntime === "auto") return {
		value: {
			...raw,
			id: selectedRuntime
		},
		changed: currentRuntime !== selectedRuntime
	};
	return {
		value: raw,
		changed: false
	};
}
function normalizeLegacyRuntimeAgentContainer(raw, path, changes) {
	let changed = false;
	const next = { ...raw };
	const model = normalizeLegacyRuntimeAgentModelConfig(raw.model);
	if (model.changed) {
		next.model = model.value;
		changed = true;
		const runtimeSuffix = model.selectedRuntime ? ` and selected ${model.selectedRuntime} runtime` : "";
		changes.push(`Moved ${path}.model legacy runtime primary refs to canonical provider refs${runtimeSuffix}.`);
	}
	const models = normalizeLegacyRuntimeAllowlistModels(raw.models, model.selectedRuntime);
	if (models.changed) {
		next.models = models.value;
		changed = true;
		changes.push(`Moved ${path}.models legacy runtime keys to canonical provider keys.`);
	}
	if (model.selectedRuntime) {
		const agentRuntime = ensureAgentRuntimePolicy(raw.agentRuntime, model.selectedRuntime);
		if (agentRuntime.changed) {
			next.agentRuntime = agentRuntime.value;
			changed = true;
		}
	}
	return {
		value: next,
		changed
	};
}
function normalizeLegacyRuntimeModelRefs(cfg, changes) {
	const rawAgents = cfg.agents;
	if (!isRecord$1(rawAgents)) return cfg;
	let changed = false;
	const nextAgents = { ...rawAgents };
	if (isRecord$1(rawAgents.defaults)) {
		const defaults = normalizeLegacyRuntimeAgentContainer(rawAgents.defaults, "agents.defaults", changes);
		if (defaults.changed) {
			nextAgents.defaults = defaults.value;
			changed = true;
		}
	}
	if (Array.isArray(rawAgents.list)) {
		const nextList = rawAgents.list.map((entry, index) => {
			if (!isRecord$1(entry)) return entry;
			const agentId = normalizeOptionalString(entry.id);
			const agent = normalizeLegacyRuntimeAgentContainer(entry, agentId ? `agents.list.${sanitizeForLog(agentId)}` : `agents.list[${index}]`, changes);
			if (agent.changed) {
				changed = true;
				return agent.value;
			}
			return entry;
		});
		if (changed) nextAgents.list = nextList;
	}
	return changed ? {
		...cfg,
		agents: nextAgents
	} : cfg;
}
function normalizeLegacyOpenAICodexModelsAddMetadata(cfg, changes) {
	const rawModels = cfg.models;
	if (!isRecord$1(rawModels) || !isRecord$1(rawModels.providers)) return cfg;
	const rawProviders = rawModels.providers;
	let providersChanged = false;
	const nextProviders = { ...rawProviders };
	for (const [providerId, rawProvider] of Object.entries(rawProviders)) {
		if (normalizeProviderId(providerId) !== "openai-codex" || !isRecord$1(rawProvider)) continue;
		const rawProviderModels = rawProvider.models;
		if (!Array.isArray(rawProviderModels)) continue;
		let providerChanged = false;
		const nextModels = [];
		for (const model of rawProviderModels) if (isRecord$1(model) && !("metadataSource" in model) && isLegacyModelsAddCodexMetadataModel({
			provider: providerId,
			model
		})) {
			providerChanged = true;
			const safeProviderId = sanitizeForLog(providerId);
			const safeModelId = sanitizeForLog(normalizeOptionalString(model.id) ?? "unknown");
			changes.push(`Marked models.providers.${safeProviderId}.models.${safeModelId} as /models add metadata so official OpenAI Codex metadata can override it.`);
			nextModels.push(Object.assign({}, model, { metadataSource: "models-add" }));
		} else nextModels.push(model);
		if (!providerChanged) continue;
		nextProviders[providerId] = {
			...rawProvider,
			models: nextModels
		};
		providersChanged = true;
	}
	if (!providersChanged) return cfg;
	return {
		...cfg,
		models: {
			...rawModels,
			providers: nextProviders
		}
	};
}
function normalizeLegacyOpenAIModelProviderApi(cfg, changes) {
	const rawModels = cfg.models;
	if (!isRecord$1(rawModels) || !isRecord$1(rawModels.providers)) return cfg;
	const rawProviders = rawModels.providers;
	let providersChanged = false;
	const nextProviders = { ...rawProviders };
	for (const [providerId, rawProvider] of Object.entries(rawProviders)) {
		if (!isRecord$1(rawProvider)) continue;
		let providerChanged = false;
		const nextProvider = { ...rawProvider };
		if (nextProvider.api === "openai") {
			nextProvider.api = "openai-completions";
			providerChanged = true;
			changes.push(`Moved models.providers.${sanitizeForLog(providerId)}.api "openai" → "openai-completions".`);
		}
		const rawProviderModels = rawProvider.models;
		if (Array.isArray(rawProviderModels)) {
			let modelsChanged = false;
			const nextModels = [];
			rawProviderModels.forEach((model, index) => {
				if (!isRecord$1(model) || model.api !== "openai") {
					nextModels.push(model);
					return;
				}
				modelsChanged = true;
				changes.push(`Moved models.providers.${sanitizeForLog(providerId)}.models[${index}].api "openai" → "openai-completions".`);
				nextModels.push({
					...model,
					api: "openai-completions"
				});
			});
			if (modelsChanged) {
				nextProvider.models = nextModels;
				providerChanged = true;
			}
		}
		if (!providerChanged) continue;
		nextProviders[providerId] = nextProvider;
		providersChanged = true;
	}
	if (!providersChanged) return cfg;
	return {
		...cfg,
		models: {
			...rawModels,
			providers: nextProviders
		}
	};
}
function normalizeLegacyNanoBananaSkill(cfg, changes) {
	const NANO_BANANA_SKILL_KEY = "nano-banana-pro";
	const NANO_BANANA_MODEL = "google/gemini-3-pro-image-preview";
	const rawSkills = cfg.skills;
	if (!isRecord$1(rawSkills)) return cfg;
	let next = cfg;
	let skillsChanged = false;
	const skills = structuredClone(rawSkills);
	if (Array.isArray(skills.allowBundled)) {
		const allowBundled = skills.allowBundled.filter((value) => typeof value !== "string" || value.trim() !== NANO_BANANA_SKILL_KEY);
		if (allowBundled.length !== skills.allowBundled.length) {
			if (allowBundled.length === 0) {
				delete skills.allowBundled;
				changes.push(`Removed skills.allowBundled entry for ${NANO_BANANA_SKILL_KEY}.`);
			} else {
				skills.allowBundled = allowBundled;
				changes.push(`Removed ${NANO_BANANA_SKILL_KEY} from skills.allowBundled.`);
			}
			skillsChanged = true;
		}
	}
	const rawEntries = skills.entries;
	if (!isRecord$1(rawEntries)) {
		if (!skillsChanged) return cfg;
		return {
			...cfg,
			skills
		};
	}
	const rawLegacyEntry = rawEntries[NANO_BANANA_SKILL_KEY];
	if (!isRecord$1(rawLegacyEntry)) {
		if (!skillsChanged) return cfg;
		return {
			...cfg,
			skills
		};
	}
	if (next.agents?.defaults?.imageGenerationModel === void 0) {
		next = {
			...next,
			agents: {
				...next.agents,
				defaults: {
					...next.agents?.defaults,
					imageGenerationModel: { primary: NANO_BANANA_MODEL }
				}
			}
		};
		changes.push(`Moved skills.entries.${NANO_BANANA_SKILL_KEY} → agents.defaults.imageGenerationModel.primary (${NANO_BANANA_MODEL}).`);
	}
	const legacyEnvApiKey = normalizeOptionalString((isRecord$1(rawLegacyEntry.env) ? rawLegacyEntry.env : void 0)?.GEMINI_API_KEY) ?? "";
	const legacyApiKey = legacyEnvApiKey || (typeof rawLegacyEntry.apiKey === "string" ? normalizeOptionalString(rawLegacyEntry.apiKey) : rawLegacyEntry.apiKey && isRecord$1(rawLegacyEntry.apiKey) ? structuredClone(rawLegacyEntry.apiKey) : void 0);
	const rawModels = isRecord$1(next.models) ? structuredClone(next.models) : {};
	const rawProviders = isRecord$1(rawModels.providers) ? { ...rawModels.providers } : {};
	const rawGoogle = isRecord$1(rawProviders.google) ? { ...rawProviders.google } : {};
	if (!(rawGoogle.apiKey !== void 0) && legacyApiKey) {
		rawGoogle.apiKey = legacyApiKey;
		if (!rawGoogle.baseUrl) rawGoogle.baseUrl = DEFAULT_GOOGLE_API_BASE_URL;
		if (!Array.isArray(rawGoogle.models)) rawGoogle.models = [];
		rawProviders.google = rawGoogle;
		rawModels.providers = rawProviders;
		next = {
			...next,
			models: rawModels
		};
		changes.push(`Moved skills.entries.${NANO_BANANA_SKILL_KEY}.${legacyEnvApiKey ? "env.GEMINI_API_KEY" : "apiKey"} → models.providers.google.apiKey.`);
	}
	const entries = { ...rawEntries };
	delete entries[NANO_BANANA_SKILL_KEY];
	if (Object.keys(entries).length === 0) delete skills.entries;
	else skills.entries = entries;
	changes.push(`Removed legacy skills.entries.${NANO_BANANA_SKILL_KEY}.`);
	skillsChanged = true;
	if (Object.keys(skills).length === 0) {
		const { skills: _ignored, ...rest } = next;
		return rest;
	}
	if (!skillsChanged) return next;
	return {
		...next,
		skills
	};
}
function normalizeLegacyCrossContextMessageConfig(cfg, changes) {
	const rawTools = cfg.tools;
	if (!isRecord$1(rawTools)) return cfg;
	const rawMessage = rawTools.message;
	if (!isRecord$1(rawMessage) || !("allowCrossContextSend" in rawMessage)) return cfg;
	const legacyAllowCrossContextSend = rawMessage.allowCrossContextSend;
	if (typeof legacyAllowCrossContextSend !== "boolean") return cfg;
	const nextMessage = { ...rawMessage };
	delete nextMessage.allowCrossContextSend;
	if (legacyAllowCrossContextSend) {
		const rawCrossContext = isRecord$1(nextMessage.crossContext) ? structuredClone(nextMessage.crossContext) : {};
		rawCrossContext.allowWithinProvider = true;
		rawCrossContext.allowAcrossProviders = true;
		nextMessage.crossContext = rawCrossContext;
		changes.push("Moved tools.message.allowCrossContextSend → tools.message.crossContext.allowWithinProvider/allowAcrossProviders (true).");
	} else changes.push("Removed tools.message.allowCrossContextSend=false (default cross-context policy already matches canonical settings).");
	return {
		...cfg,
		tools: {
			...cfg.tools,
			message: nextMessage
		}
	};
}
function mapDeepgramCompatToProviderOptions(rawCompat) {
	const providerOptions = {};
	if (typeof rawCompat.detectLanguage === "boolean") providerOptions.detect_language = rawCompat.detectLanguage;
	if (typeof rawCompat.punctuate === "boolean") providerOptions.punctuate = rawCompat.punctuate;
	if (typeof rawCompat.smartFormat === "boolean") providerOptions.smart_format = rawCompat.smartFormat;
	return providerOptions;
}
function migrateLegacyDeepgramCompat(params) {
	const rawCompat = isRecord$1(params.owner.deepgram) ? structuredClone(params.owner.deepgram) : null;
	if (!rawCompat) return false;
	const compatProviderOptions = mapDeepgramCompatToProviderOptions(rawCompat);
	const currentProviderOptions = isRecord$1(params.owner.providerOptions) ? structuredClone(params.owner.providerOptions) : {};
	const currentDeepgram = isRecord$1(currentProviderOptions.deepgram) ? structuredClone(currentProviderOptions.deepgram) : {};
	const mergedDeepgram = {
		...compatProviderOptions,
		...currentDeepgram
	};
	delete params.owner.deepgram;
	currentProviderOptions.deepgram = mergedDeepgram;
	params.owner.providerOptions = currentProviderOptions;
	const hadCanonicalDeepgram = Object.keys(currentDeepgram).length > 0;
	params.changes.push(hadCanonicalDeepgram ? `Merged ${params.pathPrefix}.deepgram → ${params.pathPrefix}.providerOptions.deepgram (filled missing canonical fields from legacy).` : `Moved ${params.pathPrefix}.deepgram → ${params.pathPrefix}.providerOptions.deepgram.`);
	return true;
}
function normalizeLegacyMediaProviderOptions(cfg, changes) {
	const rawTools = cfg.tools;
	if (!isRecord$1(rawTools)) return cfg;
	const rawMedia = rawTools.media;
	if (!isRecord$1(rawMedia)) return cfg;
	let mediaChanged = false;
	const nextMedia = structuredClone(rawMedia);
	const migrateModelList = (models, pathPrefix) => {
		if (!Array.isArray(models)) return false;
		let changedAny = false;
		for (const [index, entry] of models.entries()) {
			if (!isRecord$1(entry)) continue;
			if (migrateLegacyDeepgramCompat({
				owner: entry,
				pathPrefix: `${pathPrefix}[${index}]`,
				changes
			})) changedAny = true;
		}
		return changedAny;
	};
	for (const capability of [
		"audio",
		"image",
		"video"
	]) {
		const config = isRecord$1(nextMedia[capability]) ? structuredClone(nextMedia[capability]) : null;
		if (!config) continue;
		let configChanged = false;
		if (migrateLegacyDeepgramCompat({
			owner: config,
			pathPrefix: `tools.media.${capability}`,
			changes
		})) configChanged = true;
		if (migrateModelList(config.models, `tools.media.${capability}.models`)) configChanged = true;
		if (configChanged) {
			nextMedia[capability] = config;
			mediaChanged = true;
		}
	}
	if (migrateModelList(nextMedia.models, "tools.media.models")) mediaChanged = true;
	if (!mediaChanged) return cfg;
	return {
		...cfg,
		tools: {
			...cfg.tools,
			media: nextMedia
		}
	};
}
function normalizeLegacyMistralModelMaxTokens(cfg, changes) {
	const rawProviders = cfg.models?.providers;
	if (!isRecord$1(rawProviders)) return cfg;
	let providersChanged = false;
	const nextProviders = { ...rawProviders };
	for (const [providerId, rawProvider] of Object.entries(rawProviders)) {
		if (normalizeProviderId(providerId) !== "mistral" || !isRecord$1(rawProvider)) continue;
		const rawModels = rawProvider.models;
		if (!Array.isArray(rawModels)) continue;
		let modelsChanged = false;
		const nextModels = rawModels.map((model, index) => {
			if (!isRecord$1(model)) return model;
			const modelId = normalizeOptionalString(model.id) ?? "";
			const contextWindow = typeof model.contextWindow === "number" && Number.isFinite(model.contextWindow) ? model.contextWindow : null;
			const maxTokens = typeof model.maxTokens === "number" && Number.isFinite(model.maxTokens) ? model.maxTokens : null;
			if (!modelId || contextWindow === null || maxTokens === null) return model;
			const normalizedMaxTokens = resolveNormalizedProviderModelMaxTokens({
				providerId,
				modelId,
				contextWindow,
				rawMaxTokens: maxTokens
			});
			if (normalizedMaxTokens === maxTokens) return model;
			modelsChanged = true;
			changes.push(`Normalized models.providers.${providerId}.models[${index}].maxTokens (${maxTokens} → ${normalizedMaxTokens}) to avoid Mistral context-window rejects.`);
			return Object.assign({}, model, { maxTokens: normalizedMaxTokens });
		});
		if (!modelsChanged) continue;
		nextProviders[providerId] = {
			...rawProvider,
			models: nextModels
		};
		providersChanged = true;
	}
	if (!providersChanged) return cfg;
	return {
		...cfg,
		models: {
			...cfg.models,
			providers: nextProviders
		}
	};
}
//#endregion
//#region src/commands/doctor/shared/legacy-web-fetch-migrate.ts
const DANGEROUS_RECORD_KEYS = new Set([
	"__proto__",
	"prototype",
	"constructor"
]);
function resolveLegacyFetchConfig(raw) {
	if (!isRecord$1(raw)) return;
	const tools = isRecord$1(raw.tools) ? raw.tools : void 0;
	const web = isRecord$1(tools?.web) ? tools.web : void 0;
	return isRecord$1(web?.fetch) ? web.fetch : void 0;
}
function copyLegacyFirecrawlFetchConfig(fetch) {
	const current = fetch.firecrawl;
	if (!isRecord$1(current)) return;
	const next = cloneRecord$1(current);
	delete next.enabled;
	return next;
}
function hasMappedLegacyWebFetchConfig(raw) {
	const fetch = resolveLegacyFetchConfig(raw);
	if (!fetch) return false;
	return isRecord$1(fetch.firecrawl);
}
function migratePluginWebFetchConfig(params) {
	const entry = ensureRecord$2(ensureRecord$2(ensureRecord$2(params.root, "plugins"), "entries"), "firecrawl");
	const config = ensureRecord$2(entry, "config");
	const hadEnabled = entry.enabled !== void 0;
	const existing = isRecord$1(config.webFetch) ? cloneRecord$1(config.webFetch) : void 0;
	if (!hadEnabled) entry.enabled = true;
	if (!existing) {
		config.webFetch = cloneRecord$1(params.payload);
		params.changes.push("Moved tools.web.fetch.firecrawl → plugins.entries.firecrawl.config.webFetch.");
		return;
	}
	const merged = cloneRecord$1(existing);
	mergeMissing(merged, params.payload);
	const changed = JSON.stringify(merged) !== JSON.stringify(existing) || !hadEnabled;
	config.webFetch = merged;
	if (changed) {
		params.changes.push("Merged tools.web.fetch.firecrawl → plugins.entries.firecrawl.config.webFetch (filled missing fields from legacy; kept explicit plugin config values).");
		return;
	}
	params.changes.push("Removed tools.web.fetch.firecrawl (plugins.entries.firecrawl.config.webFetch already set).");
}
function migrateLegacyWebFetchConfig(raw) {
	if (!isRecord$1(raw) || !hasMappedLegacyWebFetchConfig(raw)) return {
		config: raw,
		changes: []
	};
	return normalizeLegacyWebFetchConfigRecord(raw);
}
function normalizeLegacyWebFetchConfigRecord(raw) {
	const nextRoot = structuredClone(raw);
	const web = ensureRecord$2(ensureRecord$2(nextRoot, "tools"), "web");
	const fetch = resolveLegacyFetchConfig(nextRoot);
	if (!fetch) return {
		config: raw,
		changes: []
	};
	const nextFetch = {};
	for (const [key, value] of Object.entries(fetch)) {
		if (key === "firecrawl" && isRecord$1(value)) continue;
		if (DANGEROUS_RECORD_KEYS.has(key)) continue;
		nextFetch[key] = value;
	}
	web.fetch = nextFetch;
	const firecrawl = copyLegacyFirecrawlFetchConfig(fetch);
	const changes = [];
	if (firecrawl && Object.keys(firecrawl).length > 0) migratePluginWebFetchConfig({
		root: nextRoot,
		payload: firecrawl,
		changes
	});
	else if (hasOwnKey$1(fetch, "firecrawl")) changes.push("Removed empty tools.web.fetch.firecrawl.");
	return {
		config: nextRoot,
		changes
	};
}
//#endregion
//#region src/commands/doctor/shared/legacy-config-compatibility-base.ts
function normalizeBaseCompatibilityConfigValues(cfg, changes, afterBrowser) {
	let next = seedMissingDefaultAccountsFromSingleAccountBase(cfg, changes);
	next = normalizeLegacyBrowserConfig(next, changes);
	next = afterBrowser ? afterBrowser(next) : next;
	for (const migrate of [
		migrateLegacyWebSearchConfig,
		migrateLegacyWebFetchConfig,
		migrateLegacyXSearchConfig
	]) {
		const migrated = migrate(next);
		if (migrated.changes.length === 0) continue;
		next = migrated.config;
		changes.push(...migrated.changes);
	}
	next = normalizeLegacyNanoBananaSkill(next, changes);
	next = normalizeLegacyTalkConfig(next, changes);
	next = normalizeLegacyOpenAIModelProviderApi(next, changes);
	next = normalizeLegacyRuntimeModelRefs(next, changes);
	next = normalizeLegacyCrossContextMessageConfig(next, changes);
	next = normalizeLegacyMediaProviderOptions(next, changes);
	return normalizeLegacyMistralModelMaxTokens(next, changes);
}
//#endregion
//#region src/commands/doctor/shared/legacy-config-runtime-migrate.ts
function normalizeRuntimeCompatibilityConfigValues(cfg) {
	const changes = [];
	return {
		config: normalizeBaseCompatibilityConfigValues(cfg, changes),
		changes
	};
}
//#endregion
//#region src/commands/doctor/shared/runtime-compat-api.ts
function applyRuntimeLegacyConfigMigrations(raw) {
	if (!raw || typeof raw !== "object") return {
		next: null,
		changes: []
	};
	const original = raw;
	const migrated = applyLegacyDoctorMigrations(original);
	const normalized = normalizeRuntimeCompatibilityConfigValues(migrated.next ?? original);
	const next = normalized.config;
	const changes = [...migrated.changes, ...normalized.changes];
	if (changes.length === 0 || isDeepStrictEqual(next, original)) return {
		next: null,
		changes: []
	};
	return {
		next,
		changes
	};
}
//#endregion
//#region src/infra/shell-env.ts
const DEFAULT_TIMEOUT_MS = 15e3;
const DEFAULT_MAX_BUFFER_BYTES = 2 * 1024 * 1024;
const DEFAULT_SHELL = "/bin/sh";
let lastAppliedKeys = [];
let cachedShellPath;
let cachedEtcShells;
let nextExecCacheId = 1;
const loginShellEnvProbeCache = /* @__PURE__ */ new Map();
const execCacheIds = /* @__PURE__ */ new WeakMap();
function resolveShellExecEnv(env) {
	const execEnv = sanitizeHostExecEnv({ baseEnv: env });
	const home = os.homedir().trim();
	if (home) execEnv.HOME = home;
	else delete execEnv.HOME;
	delete execEnv.ZDOTDIR;
	return execEnv;
}
function resolveTimeoutMs(timeoutMs) {
	if (typeof timeoutMs !== "number" || !Number.isFinite(timeoutMs)) return DEFAULT_TIMEOUT_MS;
	return Math.max(0, timeoutMs);
}
function readEtcShells() {
	if (cachedEtcShells !== void 0) return cachedEtcShells;
	try {
		const entries = fs.readFileSync("/etc/shells", "utf8").split(/\r?\n/).map((line) => line.trim()).filter((line) => line.length > 0 && !line.startsWith("#") && path.isAbsolute(line));
		cachedEtcShells = new Set(entries);
	} catch {
		cachedEtcShells = null;
	}
	return cachedEtcShells;
}
function isTrustedShellPath(shell) {
	if (!path.isAbsolute(shell)) return false;
	if (path.normalize(shell) !== shell) return false;
	return readEtcShells()?.has(shell) === true;
}
function resolveShell(env) {
	const shell = env.SHELL?.trim();
	if (shell && isTrustedShellPath(shell)) return shell;
	return DEFAULT_SHELL;
}
function execLoginShellEnvZero(params) {
	return params.exec(params.shell, [
		"-l",
		"-c",
		"env -0"
	], {
		encoding: "buffer",
		timeout: params.timeoutMs,
		maxBuffer: DEFAULT_MAX_BUFFER_BYTES,
		env: params.env,
		stdio: [
			"ignore",
			"pipe",
			"pipe"
		]
	});
}
function parseShellEnv(stdout) {
	const shellEnv = /* @__PURE__ */ new Map();
	const parts = stdout.toString("utf8").split("\0");
	for (const part of parts) {
		if (!part) continue;
		const eq = part.indexOf("=");
		if (eq <= 0) continue;
		const key = part.slice(0, eq);
		const value = part.slice(eq + 1);
		if (!key) continue;
		shellEnv.set(key, value);
	}
	return shellEnv;
}
function resolveExecCacheId(exec) {
	if (!exec) return "default";
	const key = exec;
	let id = execCacheIds.get(key);
	if (!id) {
		id = nextExecCacheId;
		nextExecCacheId += 1;
		execCacheIds.set(key, id);
	}
	return `exec:${id}`;
}
function createLoginShellEnvCacheKey(params) {
	const startupEnvEntries = Object.entries(params.execEnv).filter(([key]) => {
		if (key === "HOME" || key === "PATH" || key === "TERM" || key === "LANG" || key === "LC_ALL" || key === "LC_CTYPE" || key === "USER" || key === "LOGNAME" || key === "TMPDIR") return true;
		return key.startsWith("XDG_") || key.startsWith("OPENCLAW_");
	}).toSorted(([left], [right]) => left.localeCompare(right));
	return JSON.stringify([
		params.shell,
		params.timeoutMs,
		resolveExecCacheId(params.exec),
		startupEnvEntries
	]);
}
function probeLoginShellEnv(params) {
	const exec = params.exec ?? execFileSync;
	const timeoutMs = resolveTimeoutMs(params.timeoutMs);
	const shell = resolveShell(params.env);
	const execEnv = resolveShellExecEnv(params.env);
	const cacheKey = createLoginShellEnvCacheKey({
		shell,
		timeoutMs,
		exec: params.exec,
		execEnv
	});
	const cached = loginShellEnvProbeCache.get(cacheKey);
	if (cached) return {
		ok: true,
		shellEnv: new Map(cached)
	};
	try {
		const shellEnv = parseShellEnv(execLoginShellEnvZero({
			shell,
			env: execEnv,
			exec,
			timeoutMs
		}));
		loginShellEnvProbeCache.set(cacheKey, [...shellEnv.entries()]);
		return {
			ok: true,
			shellEnv
		};
	} catch (err) {
		return {
			ok: false,
			error: formatErrorMessage(err)
		};
	}
}
function hasExplicitEnvBinding(env, key) {
	return Object.prototype.hasOwnProperty.call(env, key);
}
function loadShellEnvFallback(opts) {
	const logger = opts.logger ?? console;
	if (!opts.enabled) {
		lastAppliedKeys = [];
		return {
			ok: true,
			applied: [],
			skippedReason: "disabled"
		};
	}
	const missingExpectedKeys = opts.expectedKeys.filter((key) => !hasExplicitEnvBinding(opts.env, key));
	if (missingExpectedKeys.length === 0) {
		lastAppliedKeys = [];
		return {
			ok: true,
			applied: [],
			skippedReason: "already-has-keys"
		};
	}
	const probe = probeLoginShellEnv({
		env: opts.env,
		timeoutMs: opts.timeoutMs,
		exec: opts.exec
	});
	if (!probe.ok) {
		logger.warn(`[openclaw] shell env fallback failed: ${probe.error}`);
		lastAppliedKeys = [];
		return {
			ok: false,
			error: probe.error,
			applied: []
		};
	}
	const applied = [];
	for (const key of missingExpectedKeys) {
		const value = probe.shellEnv.get(key);
		if (!value?.trim()) continue;
		opts.env[key] = value;
		applied.push(key);
	}
	lastAppliedKeys = applied;
	return {
		ok: true,
		applied
	};
}
function shouldEnableShellEnvFallback(env) {
	return isTruthyEnvValue(env.OPENCLAW_LOAD_SHELL_ENV);
}
function shouldDeferShellEnvFallback(env) {
	return isTruthyEnvValue(env.OPENCLAW_DEFER_SHELL_ENV_FALLBACK);
}
function resolveShellEnvFallbackTimeoutMs(env) {
	const raw = env.OPENCLAW_SHELL_ENV_TIMEOUT_MS?.trim();
	if (!raw) return DEFAULT_TIMEOUT_MS;
	const parsed = Number.parseInt(raw, 10);
	if (!Number.isFinite(parsed)) return DEFAULT_TIMEOUT_MS;
	return Math.max(0, parsed);
}
function getShellPathFromLoginShell(opts) {
	if (cachedShellPath !== void 0) return cachedShellPath;
	if ((opts.platform ?? process.platform) === "win32") {
		cachedShellPath = null;
		return cachedShellPath;
	}
	const probe = probeLoginShellEnv({
		env: opts.env,
		timeoutMs: opts.timeoutMs,
		exec: opts.exec
	});
	if (!probe.ok) {
		cachedShellPath = null;
		return cachedShellPath;
	}
	const shellPath = probe.shellEnv.get("PATH")?.trim();
	cachedShellPath = shellPath && shellPath.length > 0 ? shellPath : null;
	return cachedShellPath;
}
function getShellEnvAppliedKeys() {
	return [...lastAppliedKeys];
}
//#endregion
//#region src/plugins/plugin-metadata-snapshot.ts
function indexesMatch(left, right) {
	if (!left || !right) return true;
	return resolveInstalledManifestRegistryIndexFingerprint(left) === resolveInstalledManifestRegistryIndexFingerprint(right);
}
function isPluginMetadataSnapshotCompatible(params) {
	return params.snapshot.policyHash === resolveInstalledPluginIndexPolicyHash(params.config) && (params.snapshot.workspaceDir ?? "") === (params.workspaceDir ?? "") && indexesMatch(params.snapshot.index, params.index);
}
function appendOwner(owners, ownedId, pluginId) {
	const existing = owners.get(ownedId);
	if (existing) {
		existing.push(pluginId);
		return;
	}
	owners.set(ownedId, [pluginId]);
}
function freezeOwnerMap(owners) {
	return new Map([...owners.entries()].map(([ownedId, pluginIds]) => [ownedId, Object.freeze([...pluginIds])]));
}
function buildPluginMetadataOwnerMaps(plugins) {
	const channels = /* @__PURE__ */ new Map();
	const channelConfigs = /* @__PURE__ */ new Map();
	const providers = /* @__PURE__ */ new Map();
	const modelCatalogProviders = /* @__PURE__ */ new Map();
	const cliBackends = /* @__PURE__ */ new Map();
	const setupProviders = /* @__PURE__ */ new Map();
	const commandAliases = /* @__PURE__ */ new Map();
	const contracts = /* @__PURE__ */ new Map();
	for (const plugin of plugins) {
		for (const channelId of plugin.channels) appendOwner(channels, channelId, plugin.id);
		for (const channelId of Object.keys(plugin.channelConfigs ?? {})) appendOwner(channelConfigs, channelId, plugin.id);
		for (const providerId of plugin.providers) appendOwner(providers, providerId, plugin.id);
		for (const providerId of Object.keys(plugin.modelCatalog?.providers ?? {})) appendOwner(modelCatalogProviders, providerId, plugin.id);
		for (const providerId of Object.keys(plugin.modelCatalog?.aliases ?? {})) appendOwner(modelCatalogProviders, providerId, plugin.id);
		for (const cliBackendId of plugin.cliBackends) appendOwner(cliBackends, cliBackendId, plugin.id);
		for (const cliBackendId of plugin.setup?.cliBackends ?? []) appendOwner(cliBackends, cliBackendId, plugin.id);
		for (const setupProvider of plugin.setup?.providers ?? []) appendOwner(setupProviders, setupProvider.id, plugin.id);
		for (const commandAlias of plugin.commandAliases ?? []) appendOwner(commandAliases, commandAlias.name, plugin.id);
		for (const [contract, values] of Object.entries(plugin.contracts ?? {})) if (Array.isArray(values) && values.length > 0) appendOwner(contracts, contract, plugin.id);
	}
	return {
		channels: freezeOwnerMap(channels),
		channelConfigs: freezeOwnerMap(channelConfigs),
		providers: freezeOwnerMap(providers),
		modelCatalogProviders: freezeOwnerMap(modelCatalogProviders),
		cliBackends: freezeOwnerMap(cliBackends),
		setupProviders: freezeOwnerMap(setupProviders),
		commandAliases: freezeOwnerMap(commandAliases),
		contracts: freezeOwnerMap(contracts)
	};
}
function loadPluginMetadataSnapshot(params) {
	const totalStartedAt = performance.now();
	const registryStartedAt = performance.now();
	const registryResult = loadPluginRegistrySnapshotWithMetadata({
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env,
		...params.index ? { index: params.index } : {}
	});
	const registrySnapshotMs = performance.now() - registryStartedAt;
	const index = registryResult.snapshot;
	const manifestStartedAt = performance.now();
	const manifestRegistry = loadPluginManifestRegistryForInstalledIndex({
		index,
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env,
		includeDisabled: true
	});
	const manifestRegistryMs = performance.now() - manifestStartedAt;
	const normalizePluginId = createPluginRegistryIdNormalizer(index, { manifestRegistry });
	const byPluginId = new Map(manifestRegistry.plugins.map((plugin) => [plugin.id, plugin]));
	const ownerMapsStartedAt = performance.now();
	const owners = buildPluginMetadataOwnerMaps(manifestRegistry.plugins);
	const ownerMapsMs = performance.now() - ownerMapsStartedAt;
	const totalMs = performance.now() - totalStartedAt;
	return {
		policyHash: index.policyHash,
		...params.workspaceDir ? { workspaceDir: params.workspaceDir } : {},
		index,
		registryDiagnostics: registryResult.diagnostics,
		manifestRegistry,
		plugins: manifestRegistry.plugins,
		diagnostics: manifestRegistry.diagnostics,
		byPluginId,
		normalizePluginId,
		owners,
		metrics: {
			registrySnapshotMs,
			manifestRegistryMs,
			ownerMapsMs,
			totalMs,
			indexPluginCount: index.plugins.length,
			manifestPluginCount: manifestRegistry.plugins.length
		}
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
	if (process.platform === "darwin" || process.platform === "win32") return normalizeLowercaseStringOrEmpty(resolved);
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
	if (isPlainObject(incoming) && isPlainObject(parsed)) {
		const result = {};
		for (const [key, value] of Object.entries(incoming)) if (key in parsed) result[key] = restoreEnvVarRefs(value, parsed[key], env);
		else result[key] = value;
		return result;
	}
	return incoming;
}
//#endregion
//#region src/config/io.audit.ts
const CONFIG_AUDIT_LOG_FILENAME = "config-audit.jsonl";
function normalizeAuditLabel(value) {
	if (typeof value !== "string") return null;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
}
function resolveConfigAuditProcessInfo(processInfo) {
	if (processInfo) return processInfo;
	return {
		pid: process.pid,
		ppid: process.ppid,
		cwd: process.cwd(),
		argv: process.argv.slice(0, 8),
		execArgv: process.execArgv.slice(0, 8)
	};
}
function resolveConfigAuditLogPath(env, homedir) {
	return path.join(resolveStateDir(env, homedir), "logs", CONFIG_AUDIT_LOG_FILENAME);
}
function formatConfigOverwriteLogMessage(params) {
	const changeSummary = typeof params.changedPathCount === "number" ? `, changedPaths=${params.changedPathCount}` : "";
	return `Config overwrite: ${params.configPath} (sha256 ${params.previousHash ?? "unknown"} -> ${params.nextHash}, backup=${params.configPath}.bak${changeSummary})`;
}
function createConfigWriteAuditRecordBase(params) {
	const processSnapshot = resolveConfigAuditProcessInfo(params.processInfo);
	return {
		ts: params.now ?? (/* @__PURE__ */ new Date()).toISOString(),
		source: "config-io",
		event: "config.write",
		configPath: params.configPath,
		pid: processSnapshot.pid,
		ppid: processSnapshot.ppid,
		cwd: processSnapshot.cwd,
		argv: processSnapshot.argv,
		execArgv: processSnapshot.execArgv,
		watchMode: params.env.OPENCLAW_WATCH_MODE === "1",
		watchSession: normalizeAuditLabel(params.env.OPENCLAW_WATCH_SESSION),
		watchCommand: normalizeAuditLabel(params.env.OPENCLAW_WATCH_COMMAND),
		existsBefore: params.existsBefore,
		previousHash: params.previousHash,
		nextHash: params.nextHash,
		previousBytes: params.previousBytes,
		nextBytes: params.nextBytes,
		previousDev: params.previousMetadata.dev,
		previousIno: params.previousMetadata.ino,
		previousMode: params.previousMetadata.mode,
		previousNlink: params.previousMetadata.nlink,
		previousUid: params.previousMetadata.uid,
		previousGid: params.previousMetadata.gid,
		changedPathCount: typeof params.changedPathCount === "number" ? params.changedPathCount : null,
		hasMetaBefore: params.hasMetaBefore,
		hasMetaAfter: params.hasMetaAfter,
		gatewayModeBefore: params.gatewayModeBefore,
		gatewayModeAfter: params.gatewayModeAfter,
		suspicious: params.suspicious
	};
}
function finalizeConfigWriteAuditRecord(params) {
	const errorCode = params.err && typeof params.err === "object" && "code" in params.err && typeof params.err.code === "string" ? params.err.code : void 0;
	const errorMessage = params.err && typeof params.err === "object" && "message" in params.err && typeof params.err.message === "string" ? params.err.message : void 0;
	const nextMetadata = params.nextMetadata ?? {
		dev: null,
		ino: null,
		mode: null,
		nlink: null,
		uid: null,
		gid: null
	};
	const success = params.result !== "failed" && params.result !== "rejected";
	return {
		...params.base,
		result: params.result,
		nextHash: success ? params.base.nextHash : null,
		nextBytes: success ? params.base.nextBytes : null,
		nextDev: success ? nextMetadata.dev : null,
		nextIno: success ? nextMetadata.ino : null,
		nextMode: success ? nextMetadata.mode : null,
		nextNlink: success ? nextMetadata.nlink : null,
		nextUid: success ? nextMetadata.uid : null,
		nextGid: success ? nextMetadata.gid : null,
		errorCode,
		errorMessage
	};
}
function resolveConfigAuditAppendRecord(params) {
	if ("record" in params) return params.record;
	const { fs: _fs, env: _env, homedir: _homedir, ...record } = params;
	return record;
}
async function appendConfigAuditRecord(params) {
	try {
		const auditPath = resolveConfigAuditLogPath(params.env, params.homedir);
		const record = resolveConfigAuditAppendRecord(params);
		await params.fs.promises.mkdir(path.dirname(auditPath), {
			recursive: true,
			mode: 448
		});
		await params.fs.promises.appendFile(auditPath, `${JSON.stringify(record)}\n`, {
			encoding: "utf-8",
			mode: 384
		});
	} catch {}
}
function appendConfigAuditRecordSync(params) {
	try {
		const auditPath = resolveConfigAuditLogPath(params.env, params.homedir);
		const record = resolveConfigAuditAppendRecord(params);
		params.fs.mkdirSync(path.dirname(auditPath), {
			recursive: true,
			mode: 448
		});
		params.fs.appendFileSync(auditPath, `${JSON.stringify(record)}\n`, {
			encoding: "utf-8",
			mode: 384
		});
	} catch {}
}
//#endregion
//#region src/config/io.invalid-config.ts
function formatInvalidConfigDetails(issues) {
	return issues.map((issue) => `- ${sanitizeTerminalText(issue.path || "<root>")}: ${sanitizeTerminalText(issue.message)}`).join("\n");
}
function formatInvalidConfigLogMessage(configPath, details) {
	return `Invalid config at ${configPath}:\\n${details}`;
}
function logInvalidConfigOnce(params) {
	if (params.loggedConfigPaths.has(params.configPath)) return;
	params.loggedConfigPaths.add(params.configPath);
	params.logger.error(formatInvalidConfigLogMessage(params.configPath, params.details));
}
function createInvalidConfigError(configPath, details) {
	const error = /* @__PURE__ */ new Error(`Invalid config at ${configPath}:\n${details}`);
	error.code = "INVALID_CONFIG";
	error.details = details;
	return error;
}
function throwInvalidConfig(params) {
	const details = formatInvalidConfigDetails(params.issues);
	logInvalidConfigOnce({
		configPath: params.configPath,
		details,
		logger: params.logger,
		loggedConfigPaths: params.loggedConfigPaths
	});
	throw createInvalidConfigError(params.configPath, details);
}
//#endregion
//#region src/config/recovery-policy.ts
const PLUGIN_ENTRY_PATH_PREFIX = "plugins.entries.";
function isPluginEntryIssue(issue) {
	const path = issue.path.trim();
	if (!path.startsWith(PLUGIN_ENTRY_PATH_PREFIX)) return false;
	return path.slice(16).trim().length > 0;
}
/**
* Returns true when an invalid config snapshot is scoped entirely to plugin entries.
*/
function isPluginLocalInvalidConfigSnapshot(snapshot) {
	if (snapshot.valid || snapshot.legacyIssues.length > 0 || snapshot.issues.length === 0) return false;
	return snapshot.issues.every(isPluginEntryIssue);
}
/**
* Decides whether whole-file last-known-good recovery is safe for a snapshot.
*/
function shouldAttemptLastKnownGoodRecovery(snapshot) {
	if (snapshot.valid) return false;
	return !isPluginLocalInvalidConfigSnapshot(snapshot);
}
//#endregion
//#region src/config/io.observe-recovery.ts
function createConfigObserveAuditRecord(params) {
	return {
		ts: params.ts,
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
		valid: params.valid,
		hash: params.current.hash,
		bytes: params.current.bytes,
		mtimeMs: params.current.mtimeMs,
		ctimeMs: params.current.ctimeMs,
		dev: params.current.dev,
		ino: params.current.ino,
		mode: params.current.mode,
		nlink: params.current.nlink,
		uid: params.current.uid,
		gid: params.current.gid,
		hasMeta: params.current.hasMeta,
		gatewayMode: params.current.gatewayMode,
		suspicious: params.suspicious,
		lastKnownGoodHash: params.lastKnownGood?.hash ?? null,
		lastKnownGoodBytes: params.lastKnownGood?.bytes ?? null,
		lastKnownGoodMtimeMs: params.lastKnownGood?.mtimeMs ?? null,
		lastKnownGoodCtimeMs: params.lastKnownGood?.ctimeMs ?? null,
		lastKnownGoodDev: params.lastKnownGood?.dev ?? null,
		lastKnownGoodIno: params.lastKnownGood?.ino ?? null,
		lastKnownGoodMode: params.lastKnownGood?.mode ?? null,
		lastKnownGoodNlink: params.lastKnownGood?.nlink ?? null,
		lastKnownGoodUid: params.lastKnownGood?.uid ?? null,
		lastKnownGoodGid: params.lastKnownGood?.gid ?? null,
		lastKnownGoodGatewayMode: params.lastKnownGood?.gatewayMode ?? null,
		backupHash: params.backup?.hash ?? null,
		backupBytes: params.backup?.bytes ?? null,
		backupMtimeMs: params.backup?.mtimeMs ?? null,
		backupCtimeMs: params.backup?.ctimeMs ?? null,
		backupDev: params.backup?.dev ?? null,
		backupIno: params.backup?.ino ?? null,
		backupMode: params.backup?.mode ?? null,
		backupNlink: params.backup?.nlink ?? null,
		backupUid: params.backup?.uid ?? null,
		backupGid: params.backup?.gid ?? null,
		backupGatewayMode: params.backup?.gatewayMode ?? null,
		clobberedPath: params.clobberedPath,
		restoredFromBackup: params.restoredFromBackup,
		restoredBackupPath: params.restoredBackupPath
	};
}
function createConfigObserveAuditAppendParams(deps, params) {
	return {
		fs: deps.fs,
		env: deps.env,
		homedir: deps.homedir,
		record: createConfigObserveAuditRecord(params)
	};
}
function hashConfigRaw$1(raw) {
	return crypto.createHash("sha256").update(raw ?? "").digest("hex");
}
function resolveConfigSnapshotHash$1(snapshot) {
	if (typeof snapshot.hash === "string") {
		const trimmed = snapshot.hash.trim();
		if (trimmed) return trimmed;
	}
	if (typeof snapshot.raw !== "string") return null;
	return hashConfigRaw$1(snapshot.raw);
}
function hasConfigMeta$1(value) {
	return isRecord$1(value) && isRecord$1(value.meta) && (typeof value.meta.lastTouchedVersion === "string" || typeof value.meta.lastTouchedAt === "string");
}
function resolveGatewayMode$1(value) {
	if (!isRecord$1(value) || !isRecord$1(value.gateway)) return null;
	return typeof value.gateway.mode === "string" ? value.gateway.mode : null;
}
function resolveConfigStatMetadata$1(stat) {
	if (!stat) return {
		dev: null,
		ino: null,
		mode: null,
		nlink: null,
		uid: null,
		gid: null
	};
	return {
		dev: typeof stat.dev === "number" || typeof stat.dev === "bigint" ? String(stat.dev) : null,
		ino: typeof stat.ino === "number" || typeof stat.ino === "bigint" ? String(stat.ino) : null,
		mode: typeof stat.mode === "number" ? stat.mode : null,
		nlink: typeof stat.nlink === "number" ? stat.nlink : null,
		uid: typeof stat.uid === "number" ? stat.uid : null,
		gid: typeof stat.gid === "number" ? stat.gid : null
	};
}
function createConfigHealthFingerprint(params) {
	return {
		hash: params.hash,
		bytes: Buffer.byteLength(params.raw, "utf-8"),
		mtimeMs: params.stat?.mtimeMs ?? null,
		ctimeMs: params.stat?.ctimeMs ?? null,
		...resolveConfigStatMetadata$1(params.stat),
		hasMeta: hasConfigMeta$1(params.parsed),
		gatewayMode: resolveGatewayMode$1(params.gatewaySource),
		observedAt: params.observedAt
	};
}
function parseConfigRawOrEmpty(deps, raw) {
	try {
		return deps.json5.parse(raw);
	} catch {
		return {};
	}
}
function resolveConfigHealthStatePath$1(env, homedir) {
	return path.join(resolveStateDir(env, homedir), "logs", "config-health.json");
}
async function readConfigHealthState$1(deps) {
	try {
		const raw = await deps.fs.promises.readFile(resolveConfigHealthStatePath$1(deps.env, deps.homedir), "utf-8");
		const parsed = deps.json5.parse(raw);
		return isRecord$1(parsed) ? parsed : {};
	} catch {
		return {};
	}
}
function readConfigHealthStateSync$1(deps) {
	try {
		const raw = deps.fs.readFileSync(resolveConfigHealthStatePath$1(deps.env, deps.homedir), "utf-8");
		const parsed = deps.json5.parse(raw);
		return isRecord$1(parsed) ? parsed : {};
	} catch {
		return {};
	}
}
async function writeConfigHealthState$1(deps, state) {
	try {
		const healthPath = resolveConfigHealthStatePath$1(deps.env, deps.homedir);
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
function writeConfigHealthStateSync$1(deps, state) {
	try {
		const healthPath = resolveConfigHealthStatePath$1(deps.env, deps.homedir);
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
function getConfigHealthEntry$1(state, configPath) {
	const entries = state.entries;
	if (!entries || !isRecord$1(entries)) return {};
	const entry = entries[configPath];
	return entry && isRecord$1(entry) ? entry : {};
}
function setConfigHealthEntry$1(state, configPath, entry) {
	return {
		...state,
		entries: {
			...state.entries,
			[configPath]: entry
		}
	};
}
function createLastObservedSuspiciousEntry(entry, suspiciousSignature) {
	return {
		...entry,
		lastObservedSuspiciousSignature: suspiciousSignature
	};
}
function isUpdateChannelOnlyRoot$1(value) {
	if (!isRecord$1(value)) return false;
	const keys = Object.keys(value);
	if (keys.length !== 1 || keys[0] !== "update") return false;
	const update = value.update;
	if (!isRecord$1(update)) return false;
	return Object.keys(update).length === 1 && typeof update.channel === "string";
}
function resolveConfigObserveSuspiciousReasons$1(params) {
	const reasons = [];
	const baseline = params.lastKnownGood;
	if (!baseline) return reasons;
	if (baseline.bytes >= 512 && params.bytes < Math.floor(baseline.bytes * .5)) reasons.push(`size-drop-vs-last-good:${baseline.bytes}->${params.bytes}`);
	if (baseline.hasMeta && !params.hasMeta) reasons.push("missing-meta-vs-last-good");
	if (baseline.gatewayMode && !params.gatewayMode) reasons.push("gateway-mode-missing-vs-last-good");
	if (baseline.gatewayMode && isUpdateChannelOnlyRoot$1(params.parsed)) reasons.push("update-channel-only-root");
	return reasons;
}
function resolveSuspiciousSignature(current, suspicious) {
	return `${current.hash}:${suspicious.join(",")}`;
}
function isRecoverableConfigReadSuspiciousReason(reason) {
	return reason === "missing-meta-vs-last-good" || reason === "gateway-mode-missing-vs-last-good" || reason === "update-channel-only-root" || reason.startsWith("size-drop-vs-last-good:");
}
function resolveConfigReadRecoveryContext(params) {
	const suspicious = resolveConfigObserveSuspiciousReasons$1({
		bytes: params.current.bytes,
		hasMeta: params.current.hasMeta,
		gatewayMode: params.current.gatewayMode,
		parsed: params.parsed,
		lastKnownGood: params.backupBaseline
	});
	if (!suspicious.some(isRecoverableConfigReadSuspiciousReason)) return null;
	const suspiciousSignature = resolveSuspiciousSignature(params.current, suspicious);
	if (params.entry.lastObservedSuspiciousSignature === suspiciousSignature) return null;
	return {
		suspicious,
		suspiciousSignature
	};
}
async function readConfigFingerprintForPath$1(deps, targetPath) {
	try {
		const raw = await deps.fs.promises.readFile(targetPath, "utf-8");
		const stat = await deps.fs.promises.stat(targetPath).catch(() => null);
		const parsed = parseConfigRawOrEmpty(deps, raw);
		return createConfigHealthFingerprint({
			hash: hashConfigRaw$1(raw),
			raw,
			parsed,
			gatewaySource: parsed,
			stat,
			observedAt: (/* @__PURE__ */ new Date()).toISOString()
		});
	} catch {
		return null;
	}
}
function readConfigFingerprintForPathSync$1(deps, targetPath) {
	try {
		const raw = deps.fs.readFileSync(targetPath, "utf-8");
		const stat = deps.fs.statSync(targetPath, { throwIfNoEntry: false }) ?? null;
		const parsed = parseConfigRawOrEmpty(deps, raw);
		return createConfigHealthFingerprint({
			hash: hashConfigRaw$1(raw),
			raw,
			parsed,
			gatewaySource: parsed,
			stat,
			observedAt: (/* @__PURE__ */ new Date()).toISOString()
		});
	} catch {
		return null;
	}
}
function formatConfigArtifactTimestamp$1(ts) {
	return ts.replaceAll(":", "-").replaceAll(".", "-");
}
function resolveLastKnownGoodConfigPath(configPath) {
	return `${configPath}.last-good`;
}
function isSensitiveConfigPath(pathLabel) {
	return /(^|\.)(api[-_]?key|auth|bearer|credential|password|private[-_]?key|secret|token)(\.|$)/i.test(pathLabel);
}
function collectPollutedSecretPlaceholders(value, pathLabel = "", output = []) {
	if (typeof value === "string") {
		const trimmed = value.trim();
		if (trimmed === "***" || trimmed === "[redacted]") {
			output.push(pathLabel || "<root>");
			return output;
		}
		if (isSensitiveConfigPath(pathLabel) && (trimmed.includes("...") || trimmed.includes("…"))) output.push(pathLabel || "<root>");
		return output;
	}
	if (Array.isArray(value)) {
		value.forEach((item, index) => collectPollutedSecretPlaceholders(item, `${pathLabel}[${index}]`, output));
		return output;
	}
	if (isRecord$1(value)) for (const [key, child] of Object.entries(value)) collectPollutedSecretPlaceholders(child, pathLabel ? `${pathLabel}.${key}` : key, output);
	return output;
}
async function persistClobberedConfigSnapshot$1(params) {
	const targetPath = `${params.configPath}.clobbered.${formatConfigArtifactTimestamp$1(params.observedAt)}`;
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
function persistClobberedConfigSnapshotSync$1(params) {
	const targetPath = `${params.configPath}.clobbered.${formatConfigArtifactTimestamp$1(params.observedAt)}`;
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
	const current = createConfigHealthFingerprint({
		hash: hashConfigRaw$1(params.raw),
		raw: params.raw,
		parsed: params.parsed,
		gatewaySource: params.parsed,
		stat,
		observedAt: now
	});
	let healthState = await readConfigHealthState$1(params.deps);
	const entry = getConfigHealthEntry$1(healthState, params.configPath);
	const backupPath = `${params.configPath}.bak`;
	const backupBaseline = entry.lastKnownGood ?? await readConfigFingerprintForPath$1(params.deps, backupPath) ?? void 0;
	const recoveryContext = resolveConfigReadRecoveryContext({
		current,
		parsed: params.parsed,
		entry,
		backupBaseline
	});
	if (!recoveryContext) return {
		raw: params.raw,
		parsed: params.parsed
	};
	const { suspicious, suspiciousSignature } = recoveryContext;
	const backupRaw = await params.deps.fs.promises.readFile(backupPath, "utf-8").catch(() => null);
	if (!backupRaw) return {
		raw: params.raw,
		parsed: params.parsed
	};
	let backupParsed;
	try {
		backupParsed = params.deps.json5.parse(backupRaw);
	} catch {
		return {
			raw: params.raw,
			parsed: params.parsed
		};
	}
	const backup = backupBaseline ?? await readConfigFingerprintForPath$1(params.deps, backupPath);
	if (!backup?.gatewayMode) return {
		raw: params.raw,
		parsed: params.parsed
	};
	const clobberedPath = await persistClobberedConfigSnapshot$1({
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
	await appendConfigAuditRecord(createConfigObserveAuditAppendParams(params.deps, {
		ts: now,
		configPath: params.configPath,
		valid: true,
		current,
		suspicious,
		lastKnownGood: entry.lastKnownGood,
		backup,
		clobberedPath,
		restoredFromBackup,
		restoredBackupPath: backupPath
	}));
	healthState = setConfigHealthEntry$1(healthState, params.configPath, createLastObservedSuspiciousEntry(entry, suspiciousSignature));
	await writeConfigHealthState$1(params.deps, healthState);
	return {
		raw: backupRaw,
		parsed: backupParsed
	};
}
function maybeRecoverSuspiciousConfigReadSync(params) {
	const stat = params.deps.fs.statSync(params.configPath, { throwIfNoEntry: false }) ?? null;
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const current = createConfigHealthFingerprint({
		hash: hashConfigRaw$1(params.raw),
		raw: params.raw,
		parsed: params.parsed,
		gatewaySource: params.parsed,
		stat,
		observedAt: now
	});
	let healthState = readConfigHealthStateSync$1(params.deps);
	const entry = getConfigHealthEntry$1(healthState, params.configPath);
	const backupPath = `${params.configPath}.bak`;
	const backupBaseline = entry.lastKnownGood ?? readConfigFingerprintForPathSync$1(params.deps, backupPath) ?? void 0;
	const recoveryContext = resolveConfigReadRecoveryContext({
		current,
		parsed: params.parsed,
		entry,
		backupBaseline
	});
	if (!recoveryContext) return {
		raw: params.raw,
		parsed: params.parsed
	};
	const { suspicious, suspiciousSignature } = recoveryContext;
	let backupRaw;
	try {
		backupRaw = params.deps.fs.readFileSync(backupPath, "utf-8");
	} catch {
		return {
			raw: params.raw,
			parsed: params.parsed
		};
	}
	let backupParsed;
	try {
		backupParsed = params.deps.json5.parse(backupRaw);
	} catch {
		return {
			raw: params.raw,
			parsed: params.parsed
		};
	}
	const backup = backupBaseline ?? readConfigFingerprintForPathSync$1(params.deps, backupPath);
	if (!backup?.gatewayMode) return {
		raw: params.raw,
		parsed: params.parsed
	};
	const clobberedPath = persistClobberedConfigSnapshotSync$1({
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
	appendConfigAuditRecordSync(createConfigObserveAuditAppendParams(params.deps, {
		ts: now,
		configPath: params.configPath,
		valid: true,
		current,
		suspicious,
		lastKnownGood: entry.lastKnownGood,
		backup,
		clobberedPath,
		restoredFromBackup,
		restoredBackupPath: backupPath
	}));
	healthState = setConfigHealthEntry$1(healthState, params.configPath, createLastObservedSuspiciousEntry(entry, suspiciousSignature));
	writeConfigHealthStateSync$1(params.deps, healthState);
	return {
		raw: backupRaw,
		parsed: backupParsed
	};
}
async function promoteConfigSnapshotToLastKnownGood$1(params) {
	const { deps, snapshot } = params;
	if (!snapshot.exists || !snapshot.valid || typeof snapshot.raw !== "string") return false;
	const polluted = collectPollutedSecretPlaceholders(snapshot.parsed);
	if (polluted.length > 0) {
		params.logger?.warn(`Config last-known-good promotion skipped: redacted secret placeholder at ${polluted[0]}`);
		return false;
	}
	const stat = await deps.fs.promises.stat(snapshot.path).catch(() => null);
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const current = createConfigHealthFingerprint({
		hash: resolveConfigSnapshotHash$1(snapshot) ?? hashConfigRaw$1(snapshot.raw),
		raw: snapshot.raw,
		parsed: snapshot.parsed,
		gatewaySource: snapshot.resolved,
		stat,
		observedAt: now
	});
	const lastGoodPath = resolveLastKnownGoodConfigPath(snapshot.path);
	await deps.fs.promises.writeFile(lastGoodPath, snapshot.raw, {
		encoding: "utf-8",
		mode: 384
	});
	await deps.fs.promises.chmod?.(lastGoodPath, 384).catch(() => {});
	const healthState = await readConfigHealthState$1(deps);
	const entry = getConfigHealthEntry$1(healthState, snapshot.path);
	await writeConfigHealthState$1(deps, setConfigHealthEntry$1(healthState, snapshot.path, {
		...entry,
		lastKnownGood: current,
		lastPromotedGood: current,
		lastObservedSuspiciousSignature: null
	}));
	return true;
}
async function recoverConfigFromLastKnownGood$1(params) {
	const { deps, snapshot } = params;
	if (!snapshot.exists || typeof snapshot.raw !== "string") return false;
	if (!shouldAttemptLastKnownGoodRecovery(snapshot)) {
		if (isPluginLocalInvalidConfigSnapshot(snapshot)) deps.logger.warn(`Config last-known-good recovery skipped: invalidity is scoped to plugin entries (${params.reason})`);
		return false;
	}
	const healthState = await readConfigHealthState$1(deps);
	const entry = getConfigHealthEntry$1(healthState, snapshot.path);
	const promoted = entry.lastPromotedGood;
	if (!promoted?.hash) return false;
	const lastGoodPath = resolveLastKnownGoodConfigPath(snapshot.path);
	const backupRaw = await deps.fs.promises.readFile(lastGoodPath, "utf-8").catch(() => null);
	if (!backupRaw || hashConfigRaw$1(backupRaw) !== promoted.hash) return false;
	let backupParsed;
	try {
		backupParsed = deps.json5.parse(backupRaw);
	} catch {
		return false;
	}
	const polluted = collectPollutedSecretPlaceholders(backupParsed);
	if (polluted.length > 0) {
		deps.logger.warn(`Config last-known-good recovery skipped: redacted secret placeholder at ${polluted[0]}`);
		return false;
	}
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const stat = await deps.fs.promises.stat(snapshot.path).catch(() => null);
	const current = createConfigHealthFingerprint({
		hash: resolveConfigSnapshotHash$1(snapshot) ?? hashConfigRaw$1(snapshot.raw),
		raw: snapshot.raw,
		parsed: snapshot.parsed,
		gatewaySource: snapshot.resolved,
		stat,
		observedAt: now
	});
	const clobberedPath = await persistClobberedConfigSnapshot$1({
		deps,
		configPath: snapshot.path,
		raw: snapshot.raw,
		observedAt: now
	});
	await deps.fs.promises.copyFile(lastGoodPath, snapshot.path);
	await deps.fs.promises.chmod?.(snapshot.path, 384).catch(() => {});
	deps.logger.warn(`Config auto-restored from last-known-good: ${snapshot.path} (${params.reason})`);
	await appendConfigAuditRecord(createConfigObserveAuditAppendParams(deps, {
		ts: now,
		configPath: snapshot.path,
		valid: snapshot.valid,
		current,
		suspicious: [params.reason],
		lastKnownGood: promoted,
		backup: promoted,
		clobberedPath,
		restoredFromBackup: true,
		restoredBackupPath: lastGoodPath
	}));
	await writeConfigHealthState$1(deps, setConfigHealthEntry$1(healthState, snapshot.path, {
		...entry,
		lastKnownGood: promoted,
		lastPromotedGood: promoted,
		lastObservedSuspiciousSignature: null
	}));
	return true;
}
//#endregion
//#region src/config/io.owner-display-secret.ts
function persistGeneratedOwnerDisplaySecret(params) {
	const { config, configPath, generatedSecret, logger, state, persistConfig } = params;
	if (!generatedSecret) {
		state.pendingByPath.delete(configPath);
		state.persistWarned.delete(configPath);
		return config;
	}
	state.pendingByPath.set(configPath, generatedSecret);
	if (!state.persistInFlight.has(configPath)) {
		state.persistInFlight.add(configPath);
		persistConfig(config, { expectedConfigPath: configPath }).then(() => {
			state.pendingByPath.delete(configPath);
			state.persistWarned.delete(configPath);
		}).catch((err) => {
			if (!state.persistWarned.has(configPath)) {
				state.persistWarned.add(configPath);
				logger.warn(`Failed to persist auto-generated commands.ownerDisplaySecret at ${configPath}: ${String(err)}`);
			}
		}).finally(() => {
			state.persistInFlight.delete(configPath);
		});
	}
	return config;
}
//#endregion
//#region src/config/io.write-prepare.ts
const OPEN_DM_POLICY_ALLOW_FROM_RE = /^(?<policyPath>[a-z0-9_.-]+)\s*=\s*"open"\s+requires\s+(?<allowPath>[a-z0-9_.-]+)(?:\s+\(or\s+[a-z0-9_.-]+\))?\s+to include "\*"$/i;
const MANAGED_CONFIG_UNSET_PATHS = [["plugins", "installs"]];
function cloneUnknown(value) {
	return structuredClone(value);
}
function createMergePatch(base, target) {
	if (!isRecord$1(base) || !isRecord$1(target)) return cloneUnknown(target);
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
		if (isRecord$1(baseValue) && isRecord$1(targetValue)) {
			const childPatch = createMergePatch(baseValue, targetValue);
			if (isRecord$1(childPatch) && Object.keys(childPatch).length === 0) continue;
			patch[key] = childPatch;
			continue;
		}
		if (!isDeepStrictEqual(baseValue, targetValue)) patch[key] = cloneUnknown(targetValue);
	}
	return patch;
}
function projectSourceOntoRuntimeShape(source, runtime) {
	if (!isRecord$1(source) || !isRecord$1(runtime)) return cloneUnknown(source);
	const next = {};
	for (const [key, sourceValue] of Object.entries(source)) {
		if (!(key in runtime)) {
			next[key] = cloneUnknown(sourceValue);
			continue;
		}
		next[key] = projectSourceOntoRuntimeShape(sourceValue, runtime[key]);
	}
	return next;
}
function hasOwnIncludeKey(value) {
	return isRecord$1(value) && Object.prototype.hasOwnProperty.call(value, "$include");
}
function collectIncludeOwnedPaths(value, path = []) {
	if (!isRecord$1(value)) return [];
	if (hasOwnIncludeKey(value)) return [path];
	return Object.entries(value).flatMap(([key, child]) => collectIncludeOwnedPaths(child, [...path, key]));
}
function patchTouchesPath(patch, path) {
	if (path.length === 0) return isRecord$1(patch) ? Object.keys(patch).length > 0 : true;
	if (!isRecord$1(patch)) return true;
	const [head, ...tail] = path;
	if (!Object.prototype.hasOwnProperty.call(patch, head)) return false;
	return patchTouchesPath(patch[head], tail);
}
function formatConfigPath$1(path) {
	return path.length > 0 ? path.join(".") : "<root>";
}
function getPathValue$1(value, path) {
	let current = value;
	for (const segment of path) {
		if (!isRecord$1(current)) return;
		current = current[segment];
	}
	return current;
}
function setPathValue(value, path, nextValue) {
	if (path.length === 0) return cloneUnknown(nextValue);
	if (!isRecord$1(value)) return value;
	const [head, ...tail] = path;
	return {
		...value,
		[head]: setPathValue(value[head], tail, nextValue)
	};
}
function preserveUntouchedIncludes(params) {
	let next = params.persistedCandidate;
	for (const includePath of collectIncludeOwnedPaths(params.rootAuthoredConfig)) {
		if (patchTouchesPath(params.patch, includePath)) throw new Error(`Config write would flatten $include-owned config at ${formatConfigPath$1(includePath)}; edit that include file directly or remove the $include first.`);
		next = setPathValue(next, includePath, getPathValue$1(params.rootAuthoredConfig, includePath));
	}
	return next;
}
function resolvePersistCandidateForWrite(params) {
	const patch = createMergePatch(params.runtimeConfig, params.nextConfig);
	const projectedSource = projectSourceOntoRuntimeShape(params.sourceConfig, params.runtimeConfig);
	const persisted = preserveUntouchedIncludes({
		patch,
		rootAuthoredConfig: params.rootAuthoredConfig ?? params.sourceConfig,
		persistedCandidate: applyMergePatch(projectedSource, patch)
	});
	return preserveRootSchemaUri({
		rootAuthoredConfig: params.rootAuthoredConfig ?? params.sourceConfig,
		nextConfig: params.nextConfig,
		persistedCandidate: persisted
	});
}
function readRootSchemaUri(value) {
	if (!isRecord$1(value) || typeof value.$schema !== "string") return;
	return value.$schema;
}
function hasOwnRootSchemaKey(value) {
	return isRecord$1(value) && Object.prototype.hasOwnProperty.call(value, "$schema");
}
function preserveRootSchemaUri(params) {
	if (hasOwnRootSchemaKey(params.nextConfig)) return params.persistedCandidate;
	const sourceSchema = readRootSchemaUri(params.rootAuthoredConfig);
	if (sourceSchema === void 0 || !isRecord$1(params.persistedCandidate)) return params.persistedCandidate;
	return {
		...params.persistedCandidate,
		$schema: sourceSchema
	};
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
function coerceConfig$1(value) {
	if (!value || typeof value !== "object" || Array.isArray(value)) return {};
	return value;
}
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
		next: coerceConfig$1(result.value)
	};
	return {
		changed: false,
		next: root
	};
}
function applyUnsetPathsForWrite(root, unsetPaths) {
	let next = root;
	for (const unsetPath of unsetPaths ?? []) {
		if (!Array.isArray(unsetPath) || unsetPath.length === 0) continue;
		const unsetResult = unsetPathForWrite(next, unsetPath);
		if (unsetResult.changed) next = unsetResult.next;
	}
	return next;
}
function resolveManagedUnsetPathsForWrite(unsetPaths) {
	const next = [];
	for (const managedPath of MANAGED_CONFIG_UNSET_PATHS) next.push(Array.from(managedPath));
	for (const unsetPath of unsetPaths ?? []) {
		if (!Array.isArray(unsetPath) || unsetPath.length === 0) continue;
		if (next.some((existing) => isDeepStrictEqual(existing, unsetPath))) continue;
		next.push([...unsetPath]);
	}
	return next;
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
	if (isRecord$1(base) && isRecord$1(target)) {
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
	if (isRecord$1(value)) {
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
function resolveWriteEnvSnapshotForPath(params) {
	if (params.expectedConfigPath === void 0 || params.expectedConfigPath === params.actualConfigPath) return params.envSnapshotForRestore;
}
//#endregion
//#region src/channels/plugins/legacy-config.ts
function collectConfiguredChannelIds(raw) {
	if (!raw || typeof raw !== "object") return [];
	const channels = raw.channels;
	if (!channels || typeof channels !== "object" || Array.isArray(channels)) return [];
	return Object.keys(channels).filter((channelId) => channelId !== "defaults").map((channelId) => channelId);
}
function shouldIncludeLegacyRuleForTouchedPaths(rulePath, touchedPaths) {
	if (!touchedPaths || touchedPaths.length === 0) return true;
	return touchedPaths.some((touchedPath) => {
		const sharedLength = Math.min(rulePath.length, touchedPath.length);
		for (let index = 0; index < sharedLength; index += 1) if (rulePath[index] !== touchedPath[index]) return false;
		return true;
	});
}
function collectRelevantChannelIdsForTouchedPaths(params) {
	const channelIds = collectConfiguredChannelIds(params.raw);
	const filteredChannelIds = params.excludedChannelIds?.size ? channelIds.filter((channelId) => !params.excludedChannelIds?.has(channelId)) : channelIds;
	if (!params.touchedPaths || params.touchedPaths.length === 0) return filteredChannelIds;
	const touchedChannelIds = /* @__PURE__ */ new Set();
	for (const touchedPath of params.touchedPaths) {
		const [first, second] = touchedPath;
		if (first !== "channels") continue;
		if (!second) return filteredChannelIds;
		if (second === "defaults") continue;
		touchedChannelIds.add(second);
	}
	if (touchedChannelIds.size === 0) return [];
	return filteredChannelIds.filter((channelId) => touchedChannelIds.has(channelId));
}
function collectChannelLegacyConfigRules(raw, touchedPaths, excludedChannelIds) {
	const channelIds = collectRelevantChannelIdsForTouchedPaths({
		raw,
		touchedPaths,
		excludedChannelIds
	});
	const rules = [];
	const unresolvedChannelIds = [];
	for (const channelId of channelIds) {
		const contractRules = loadBundledChannelDoctorContractApi(channelId)?.legacyConfigRules;
		if (Array.isArray(contractRules)) {
			rules.push(...contractRules);
			continue;
		}
		const plugin = getBootstrapChannelPlugin(channelId);
		if (plugin?.doctor?.legacyConfigRules?.length) {
			rules.push(...plugin.doctor.legacyConfigRules);
			continue;
		}
		if (plugin) continue;
		unresolvedChannelIds.push(channelId);
	}
	if (unresolvedChannelIds.length > 0) rules.push(...listPluginDoctorLegacyConfigRules({ pluginIds: unresolvedChannelIds }));
	const seen = /* @__PURE__ */ new Set();
	return rules.filter((rule) => {
		if (!shouldIncludeLegacyRuleForTouchedPaths(rule.path, touchedPaths)) return false;
		const key = `${rule.path.join(".")}::${rule.message}`;
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}
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
function collectExplicitRuleOwnedChannelIds(extraRules) {
	const channelIds = /* @__PURE__ */ new Set();
	for (const rule of extraRules) {
		const [first, second] = rule.path;
		if (first !== "channels" || typeof second !== "string" || second === "defaults") continue;
		channelIds.add(second);
	}
	return channelIds.size > 0 ? channelIds : void 0;
}
function findLegacyConfigIssues(raw, sourceRaw, extraRules = [], touchedPaths) {
	if (!raw || typeof raw !== "object") return [];
	const root = raw;
	const sourceRoot = sourceRaw && typeof sourceRaw === "object" ? sourceRaw : root;
	const issues = [];
	const explicitRuleOwnedChannelIds = collectExplicitRuleOwnedChannelIds(extraRules);
	for (const rule of [
		...LEGACY_CONFIG_MIGRATION_RULES,
		...collectChannelLegacyConfigRules(raw, touchedPaths, explicitRuleOwnedChannelIds),
		...extraRules
	]) {
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
			if (isPlainObject(entry)) return normalizeAny(void 0, entry);
			return entry;
		});
	}
	if (!isPlainObject(value)) return value;
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
		includeCompactionDefaults: true,
		includeContextPruningDefaults: true,
		includeLoggingDefaults: true,
		normalizePaths: true
	},
	missing: {
		includeCompactionDefaults: true,
		includeContextPruningDefaults: true,
		includeLoggingDefaults: false,
		normalizePaths: false
	},
	snapshot: {
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
	if (profile.normalizePaths) normalizeConfigPaths(next);
	normalizeExecSafeBinProfilesInConfig(next);
	return asRuntimeConfig(next);
}
//#endregion
//#region src/config/runtime-overrides.ts
let overrides = {};
function sanitizeOverrideValue(value, seen = /* @__PURE__ */ new WeakSet()) {
	if (Array.isArray(value)) return value.map((entry) => sanitizeOverrideValue(entry, seen));
	if (!isPlainObject(value)) return value;
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
	if (!isPlainObject(base) || !isPlainObject(override)) return override;
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
//#region src/config/shell-env-expected-keys.ts
const CORE_SHELL_ENV_EXPECTED_KEYS = ["OPENCLAW_GATEWAY_TOKEN", "OPENCLAW_GATEWAY_PASSWORD"];
function resolveShellEnvExpectedKeys(env) {
	return [...new Set([
		...listKnownProviderAuthEnvVarNames({ env }),
		...listKnownChannelEnvVarNames({ env }),
		...CORE_SHELL_ENV_EXPECTED_KEYS
	])];
}
//#endregion
//#region src/secrets/legacy-secretref-env-marker.ts
function isLegacySecretRefEnvMarker(value) {
	return typeof value === "string" && value.trim().startsWith("secretref-env:");
}
function toCandidate(target, defaults) {
	if (!isLegacySecretRefEnvMarker(target.value)) return null;
	return {
		path: target.path,
		pathSegments: target.pathSegments,
		value: target.value.trim(),
		ref: parseLegacySecretRefEnvMarker(target.value, defaults?.env)
	};
}
function collectLegacySecretRefEnvMarkerCandidates(config) {
	const defaults = config.secrets?.defaults;
	return discoverConfigSecretTargets(config).map((target) => toCandidate(target, defaults)).filter((candidate) => candidate !== null);
}
function migrateLegacySecretRefEnvMarkers(config) {
	const candidates = collectLegacySecretRefEnvMarkerCandidates(config).filter((candidate) => candidate.ref !== null);
	if (candidates.length === 0) return {
		config,
		changes: []
	};
	const next = structuredClone(config);
	const changes = [];
	for (const candidate of candidates) {
		const ref = candidate.ref;
		if (!ref) continue;
		if (setPathExistingStrict(next, candidate.pathSegments, ref)) changes.push(`Moved ${candidate.path} ${LEGACY_SECRETREF_ENV_MARKER_PREFIX}${ref.id} marker → structured env SecretRef.`);
	}
	return {
		config: next,
		changes
	};
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
				sendTimeoutMs: {
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
				network: {
					type: "object",
					properties: { dangerouslyAllowPrivateNetwork: { type: "boolean" } },
					additionalProperties: false
				},
				catchup: {
					type: "object",
					properties: {
						enabled: { type: "boolean" },
						maxAgeMinutes: {
							type: "integer",
							exclusiveMinimum: 0,
							maximum: 9007199254740991
						},
						perRunLimit: {
							type: "integer",
							exclusiveMinimum: 0,
							maximum: 9007199254740991
						},
						firstRunLookbackMinutes: {
							type: "integer",
							exclusiveMinimum: 0,
							maximum: 9007199254740991
						},
						maxFailureRetries: {
							type: "integer",
							exclusiveMinimum: 0,
							maximum: 9007199254740991
						}
					},
					additionalProperties: false
				},
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
							},
							systemPrompt: { type: "string" }
						},
						additionalProperties: false
					}
				},
				coalesceSameSenderDms: { type: "boolean" },
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
							sendTimeoutMs: {
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
							network: {
								type: "object",
								properties: { dangerouslyAllowPrivateNetwork: { type: "boolean" } },
								additionalProperties: false
							},
							catchup: {
								type: "object",
								properties: {
									enabled: { type: "boolean" },
									maxAgeMinutes: {
										type: "integer",
										exclusiveMinimum: 0,
										maximum: 9007199254740991
									},
									perRunLimit: {
										type: "integer",
										exclusiveMinimum: 0,
										maximum: 9007199254740991
									},
									firstRunLookbackMinutes: {
										type: "integer",
										exclusiveMinimum: 0,
										maximum: 9007199254740991
									},
									maxFailureRetries: {
										type: "integer",
										exclusiveMinimum: 0,
										maximum: 9007199254740991
									}
								},
								additionalProperties: false
							},
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
										},
										systemPrompt: { type: "string" }
									},
									additionalProperties: false
								}
							},
							coalesceSameSenderDms: { type: "boolean" }
						},
						required: ["enrichGroupParticipantsFromContacts"],
						additionalProperties: false
					}
				},
				defaultAccount: { type: "string" }
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
				contextVisibility: {
					type: "string",
					enum: [
						"all",
						"allowlist",
						"allowlist_quote"
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
				streaming: {
					type: "object",
					properties: {
						mode: {
							type: "string",
							enum: [
								"off",
								"partial",
								"block",
								"progress"
							]
						},
						chunkMode: {
							type: "string",
							enum: ["length", "newline"]
						},
						preview: {
							type: "object",
							properties: {
								chunk: {
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
								toolProgress: { type: "boolean" }
							},
							additionalProperties: false
						},
						block: {
							type: "object",
							properties: {
								enabled: { type: "boolean" },
								coalesce: {
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
								}
							},
							additionalProperties: false
						}
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
					},
					{
						type: "string",
						const: "batched"
					}
				] },
				thread: {
					type: "object",
					properties: { inheritParent: { type: "boolean" } },
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
						model: {
							type: "string",
							minLength: 1
						},
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
								persona: { type: "string" },
								personas: {
									type: "object",
									propertyNames: { type: "string" },
									additionalProperties: {
										type: "object",
										properties: {
											label: { type: "string" },
											description: { type: "string" },
											provider: {
												type: "string",
												minLength: 1
											},
											fallbackPolicy: { anyOf: [
												{
													type: "string",
													const: "preserve-persona"
												},
												{
													type: "string",
													const: "provider-defaults"
												},
												{
													type: "string",
													const: "fail"
												}
											] },
											prompt: {
												type: "object",
												properties: {
													profile: { type: "string" },
													scene: { type: "string" },
													sampleContext: { type: "string" },
													style: { type: "string" },
													accent: { type: "string" },
													pacing: { type: "string" },
													constraints: {
														type: "array",
														items: { type: "string" }
													}
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
											}
										},
										additionalProperties: false
									}
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
							contextVisibility: {
								type: "string",
								enum: [
									"all",
									"allowlist",
									"allowlist_quote"
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
							streaming: {
								type: "object",
								properties: {
									mode: {
										type: "string",
										enum: [
											"off",
											"partial",
											"block",
											"progress"
										]
									},
									chunkMode: {
										type: "string",
										enum: ["length", "newline"]
									},
									preview: {
										type: "object",
										properties: {
											chunk: {
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
											toolProgress: { type: "boolean" }
										},
										additionalProperties: false
									},
									block: {
										type: "object",
										properties: {
											enabled: { type: "boolean" },
											coalesce: {
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
											}
										},
										additionalProperties: false
									}
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
								},
								{
									type: "string",
									const: "batched"
								}
							] },
							thread: {
								type: "object",
								properties: { inheritParent: { type: "boolean" } },
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
									model: {
										type: "string",
										minLength: 1
									},
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
											persona: { type: "string" },
											personas: {
												type: "object",
												propertyNames: { type: "string" },
												additionalProperties: {
													type: "object",
													properties: {
														label: { type: "string" },
														description: { type: "string" },
														provider: {
															type: "string",
															minLength: 1
														},
														fallbackPolicy: { anyOf: [
															{
																type: "string",
																const: "preserve-persona"
															},
															{
																type: "string",
																const: "provider-defaults"
															},
															{
																type: "string",
																const: "fail"
															}
														] },
														prompt: {
															type: "object",
															properties: {
																profile: { type: "string" },
																scene: { type: "string" },
																sampleContext: { type: "string" },
																style: { type: "string" },
																accent: { type: "string" },
																pacing: { type: "string" },
																constraints: {
																	type: "array",
																	items: { type: "string" }
																}
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
														}
													},
													additionalProperties: false
												}
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
			"streaming.mode": {
				label: "Discord Streaming Mode",
				help: "Canonical Discord preview mode: \"off\" | \"partial\" | \"block\" | \"progress\". \"progress\" maps to \"partial\" on Discord."
			},
			"streaming.chunkMode": {
				label: "Discord Chunk Mode",
				help: "Chunking mode for outbound Discord text delivery: \"length\" (default) or \"newline\"."
			},
			"streaming.block.enabled": {
				label: "Discord Block Streaming Enabled",
				help: "Enable chunked block-style Discord preview delivery when channels.discord.streaming.mode=\"block\"."
			},
			"streaming.block.coalesce": {
				label: "Discord Block Streaming Coalesce",
				help: "Merge streamed Discord block replies before final delivery."
			},
			"streaming.preview.chunk.minChars": {
				label: "Discord Draft Chunk Min Chars",
				help: "Minimum chars before emitting a Discord stream preview update when channels.discord.streaming.mode=\"block\" (default: 200)."
			},
			"streaming.preview.chunk.maxChars": {
				label: "Discord Draft Chunk Max Chars",
				help: "Target max size for a Discord stream preview chunk when channels.discord.streaming.mode=\"block\" (default: 800; clamped to channels.discord.textChunkLimit)."
			},
			"streaming.preview.chunk.breakPreference": {
				label: "Discord Draft Chunk Break Preference",
				help: "Preferred breakpoints for Discord draft chunks (paragraph | newline | sentence). Default: paragraph."
			},
			"streaming.preview.toolProgress": {
				label: "Discord Draft Tool Progress",
				help: "Show tool/progress activity in the live draft preview message (default: true). Set false to keep tool updates as separate messages."
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
			"thread.inheritParent": {
				label: "Discord Thread Parent Inheritance",
				help: "If true, Discord thread sessions inherit the parent channel transcript (default: false)."
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
			"voice.model": {
				label: "Discord Voice Model",
				help: "Optional LLM model override for Discord voice channel responses (for example openai/gpt-5.4-mini). Leave unset to inherit the routed agent model."
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
		},
		unsupportedSecretRefSurfacePatterns: ["channels.discord.accounts.*.threadBindings.webhookToken", "channels.discord.threadBindings.webhookToken"]
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
						provider: { type: "string" },
						persona: { type: "string" },
						personas: {
							type: "object",
							propertyNames: { type: "string" },
							additionalProperties: {
								type: "object",
								propertyNames: { type: "string" },
								additionalProperties: {}
							}
						},
						summaryModel: { type: "string" },
						modelOverrides: {
							type: "object",
							propertyNames: { type: "string" },
							additionalProperties: {}
						},
						providers: {
							type: "object",
							propertyNames: { type: "string" },
							additionalProperties: {
								type: "object",
								propertyNames: { type: "string" },
								additionalProperties: {}
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
									provider: { type: "string" },
									persona: { type: "string" },
									personas: {
										type: "object",
										propertyNames: { type: "string" },
										additionalProperties: {
											type: "object",
											propertyNames: { type: "string" },
											additionalProperties: {}
										}
									},
									summaryModel: { type: "string" },
									modelOverrides: {
										type: "object",
										propertyNames: { type: "string" },
										additionalProperties: {}
									},
									providers: {
										type: "object",
										propertyNames: { type: "string" },
										additionalProperties: {
											type: "object",
											propertyNames: { type: "string" },
											additionalProperties: {}
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
					},
					{
						type: "string",
						const: "batched"
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
								},
								{
									type: "string",
									const: "batched"
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
						required: ["groupPolicy"],
						additionalProperties: false
					}
				},
				defaultAccount: { type: "string" }
			},
			required: ["groupPolicy"],
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
				contextVisibility: {
					type: "string",
					enum: [
						"all",
						"allowlist",
						"allowlist_quote"
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
							contextVisibility: {
								type: "string",
								enum: [
									"all",
									"allowlist",
									"allowlist_quote"
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
				contextVisibility: {
					type: "string",
					enum: [
						"all",
						"allowlist",
						"allowlist_quote"
					]
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
							contextVisibility: {
								type: "string",
								enum: [
									"all",
									"allowlist",
									"allowlist_quote"
								]
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
				network: {
					type: "object",
					properties: { dangerouslyAllowPrivateNetwork: { type: "boolean" } },
					additionalProperties: false
				},
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
				contextVisibility: {
					type: "string",
					enum: [
						"all",
						"allowlist",
						"allowlist_quote"
					]
				},
				blockStreaming: { type: "boolean" },
				streaming: { anyOf: [{
					type: "string",
					enum: [
						"partial",
						"quiet",
						"off"
					]
				}, { type: "boolean" }] },
				replyToMode: {
					type: "string",
					enum: [
						"off",
						"first",
						"all",
						"batched"
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
						sessionScope: {
							type: "string",
							enum: ["per-user", "per-room"]
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
				groups: {
					type: "object",
					properties: {},
					additionalProperties: {
						type: "object",
						properties: {
							account: { type: "string" },
							enabled: { type: "boolean" },
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
						"all",
						"batched"
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
				groups: {
					type: "object",
					propertyNames: { type: "string" },
					additionalProperties: {
						type: "object",
						properties: { requireMention: { type: "boolean" } },
						additionalProperties: false
					}
				},
				network: {
					type: "object",
					properties: { dangerouslyAllowPrivateNetwork: { type: "boolean" } },
					additionalProperties: false
				},
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
									"all",
									"batched"
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
							groups: {
								type: "object",
								propertyNames: { type: "string" },
								additionalProperties: {
									type: "object",
									properties: { requireMention: { type: "boolean" } },
									additionalProperties: false
								}
							},
							network: {
								type: "object",
								properties: { dangerouslyAllowPrivateNetwork: { type: "boolean" } },
								additionalProperties: false
							},
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
				authType: {
					type: "string",
					enum: ["secret", "federated"]
				},
				certificatePath: { type: "string" },
				certificateThumbprint: { type: "string" },
				useManagedIdentity: { type: "boolean" },
				managedIdentityClientId: { type: "string" },
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
				contextVisibility: {
					type: "string",
					enum: [
						"all",
						"allowlist",
						"allowlist_quote"
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
				typingIndicator: { type: "boolean" },
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
				},
				delegatedAuth: {
					type: "object",
					properties: {
						enabled: { type: "boolean" },
						scopes: {
							type: "array",
							items: { type: "string" }
						}
					},
					additionalProperties: false
				},
				sso: {
					type: "object",
					properties: {
						enabled: { type: "boolean" },
						connectionName: { type: "string" }
					},
					additionalProperties: false
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
				network: {
					type: "object",
					properties: { dangerouslyAllowPrivateNetwork: { type: "boolean" } },
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
				contextVisibility: {
					type: "string",
					enum: [
						"all",
						"allowlist",
						"allowlist_quote"
					]
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
							network: {
								type: "object",
								properties: { dangerouslyAllowPrivateNetwork: { type: "boolean" } },
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
							contextVisibility: {
								type: "string",
								enum: [
									"all",
									"allowlist",
									"allowlist_quote"
								]
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
		pluginId: "qa-channel",
		channelId: "qa-channel",
		label: "QA Channel",
		description: "Synthetic Slack-class transport for automated OpenClaw QA scenarios.",
		schema: {
			$schema: "http://json-schema.org/draft-07/schema#",
			type: "object",
			properties: {
				name: { type: "string" },
				enabled: { type: "boolean" },
				baseUrl: {
					type: "string",
					format: "uri"
				},
				botUserId: { type: "string" },
				botDisplayName: { type: "string" },
				pollTimeoutMs: {
					type: "integer",
					minimum: 100,
					maximum: 3e4
				},
				allowFrom: {
					type: "array",
					items: { anyOf: [{ type: "string" }, { type: "number" }] }
				},
				defaultTo: { type: "string" },
				actions: {
					type: "object",
					properties: {
						messages: { type: "boolean" },
						reactions: { type: "boolean" },
						search: { type: "boolean" },
						threads: { type: "boolean" }
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
							enabled: { type: "boolean" },
							baseUrl: {
								type: "string",
								format: "uri"
							},
							botUserId: { type: "string" },
							botDisplayName: { type: "string" },
							pollTimeoutMs: {
								type: "integer",
								minimum: 100,
								maximum: 3e4
							},
							allowFrom: {
								type: "array",
								items: { anyOf: [{ type: "string" }, { type: "number" }] }
							},
							defaultTo: { type: "string" },
							actions: {
								type: "object",
								properties: {
									messages: { type: "boolean" },
									reactions: { type: "boolean" },
									search: { type: "boolean" },
									threads: { type: "boolean" }
								},
								additionalProperties: false
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
				groupAllowFrom: {
					type: "array",
					items: { anyOf: [{ type: "string" }, { type: "number" }] }
				},
				dmPolicy: {
					type: "string",
					enum: [
						"open",
						"allowlist",
						"disabled"
					]
				},
				groupPolicy: {
					type: "string",
					enum: [
						"open",
						"allowlist",
						"disabled"
					]
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
				streaming: { anyOf: [{ type: "boolean" }, {
					type: "object",
					properties: {
						mode: {
							default: "partial",
							type: "string",
							enum: ["off", "partial"]
						},
						c2cStreamApi: { type: "boolean" }
					},
					required: ["mode"],
					additionalProperties: {}
				}] },
				execApprovals: {
					type: "object",
					properties: {
						enabled: { anyOf: [{ type: "boolean" }, {
							type: "string",
							const: "auto"
						}] },
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
							groupAllowFrom: {
								type: "array",
								items: { anyOf: [{ type: "string" }, { type: "number" }] }
							},
							dmPolicy: {
								type: "string",
								enum: [
									"open",
									"allowlist",
									"disabled"
								]
							},
							groupPolicy: {
								type: "string",
								enum: [
									"open",
									"allowlist",
									"disabled"
								]
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
							streaming: { anyOf: [{ type: "boolean" }, {
								type: "object",
								properties: {
									mode: {
										default: "partial",
										type: "string",
										enum: ["off", "partial"]
									},
									c2cStreamApi: { type: "boolean" }
								},
								required: ["mode"],
								additionalProperties: {}
							}] },
							execApprovals: {
								type: "object",
								properties: {
									enabled: { anyOf: [{ type: "boolean" }, {
										type: "string",
										const: "auto"
									}] },
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
							}
						},
						additionalProperties: {}
					}
				},
				defaultAccount: { type: "string" }
			},
			additionalProperties: {}
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
				contextVisibility: {
					type: "string",
					enum: [
						"all",
						"allowlist",
						"allowlist_quote"
					]
				},
				groups: {
					type: "object",
					propertyNames: { type: "string" },
					additionalProperties: {
						type: "object",
						properties: {
							requireMention: { type: "boolean" },
							ingest: { type: "boolean" },
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
							contextVisibility: {
								type: "string",
								enum: [
									"all",
									"allowlist",
									"allowlist_quote"
								]
							},
							groups: {
								type: "object",
								propertyNames: { type: "string" },
								additionalProperties: {
									type: "object",
									properties: {
										requireMention: { type: "boolean" },
										ingest: { type: "boolean" },
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
				contextVisibility: {
					type: "string",
					enum: [
						"all",
						"allowlist",
						"allowlist_quote"
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
				streaming: {
					type: "object",
					properties: {
						mode: {
							type: "string",
							enum: [
								"off",
								"partial",
								"block",
								"progress"
							]
						},
						chunkMode: {
							type: "string",
							enum: ["length", "newline"]
						},
						preview: {
							type: "object",
							properties: {
								chunk: {
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
								toolProgress: { type: "boolean" }
							},
							additionalProperties: false
						},
						block: {
							type: "object",
							properties: {
								enabled: { type: "boolean" },
								coalesce: {
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
								}
							},
							additionalProperties: false
						},
						nativeTransport: { type: "boolean" }
					},
					additionalProperties: false
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
					},
					{
						type: "string",
						const: "batched"
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
							},
							{
								type: "string",
								const: "batched"
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
							},
							{
								type: "string",
								const: "batched"
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
							},
							{
								type: "string",
								const: "batched"
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
						},
						requireExplicitMention: { type: "boolean" }
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
							},
							{
								type: "string",
								const: "batched"
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
							contextVisibility: {
								type: "string",
								enum: [
									"all",
									"allowlist",
									"allowlist_quote"
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
							streaming: {
								type: "object",
								properties: {
									mode: {
										type: "string",
										enum: [
											"off",
											"partial",
											"block",
											"progress"
										]
									},
									chunkMode: {
										type: "string",
										enum: ["length", "newline"]
									},
									preview: {
										type: "object",
										properties: {
											chunk: {
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
											toolProgress: { type: "boolean" }
										},
										additionalProperties: false
									},
									block: {
										type: "object",
										properties: {
											enabled: { type: "boolean" },
											coalesce: {
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
											}
										},
										additionalProperties: false
									},
									nativeTransport: { type: "boolean" }
								},
								additionalProperties: false
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
								},
								{
									type: "string",
									const: "batched"
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
										},
										{
											type: "string",
											const: "batched"
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
										},
										{
											type: "string",
											const: "batched"
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
										},
										{
											type: "string",
											const: "batched"
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
									},
									requireExplicitMention: { type: "boolean" }
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
										},
										{
											type: "string",
											const: "batched"
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
			"streaming.mode": {
				label: "Slack Streaming Mode",
				help: "Canonical Slack preview mode: \"off\" | \"partial\" | \"block\" | \"progress\"."
			},
			"streaming.chunkMode": {
				label: "Slack Chunk Mode",
				help: "Chunking mode for outbound Slack text delivery: \"length\" (default) or \"newline\"."
			},
			"streaming.block.enabled": {
				label: "Slack Block Streaming Enabled",
				help: "Enable chunked block-style Slack preview delivery when channels.slack.streaming.mode=\"block\"."
			},
			"streaming.block.coalesce": {
				label: "Slack Block Streaming Coalesce",
				help: "Merge streamed Slack block replies before final delivery."
			},
			"streaming.nativeTransport": {
				label: "Slack Native Streaming",
				help: "Enable native Slack text streaming (chat.startStream/chat.appendStream/chat.stopStream) when channels.slack.streaming.mode is partial (default: true). Requires a reply thread target; top-level DMs stay on the non-thread fallback path."
			},
			"streaming.preview.toolProgress": {
				label: "Slack Draft Tool Progress",
				help: "Show tool/progress activity in the live draft preview message (default: true). Set false to keep tool updates as separate messages."
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
			},
			"thread.requireExplicitMention": {
				label: "Slack Thread Require Explicit Mention",
				help: "If true, require an explicit @mention even inside threads where the bot has participated. Suppresses implicit thread mention behavior so the bot only responds to explicit @bot mentions in threads (default: false)."
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
					},
					{
						type: "string",
						const: "batched"
					}
				] },
				groups: {
					type: "object",
					propertyNames: { type: "string" },
					additionalProperties: {
						type: "object",
						properties: {
							requireMention: { type: "boolean" },
							ingest: { type: "boolean" },
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
										ingest: { type: "boolean" },
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
				contextVisibility: {
					type: "string",
					enum: [
						"all",
						"allowlist",
						"allowlist_quote"
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
										ingest: { type: "boolean" },
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
				streaming: {
					type: "object",
					properties: {
						mode: {
							type: "string",
							enum: [
								"off",
								"partial",
								"block",
								"progress"
							]
						},
						chunkMode: {
							type: "string",
							enum: ["length", "newline"]
						},
						preview: {
							type: "object",
							properties: {
								chunk: {
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
								toolProgress: { type: "boolean" }
							},
							additionalProperties: false
						},
						block: {
							type: "object",
							properties: {
								enabled: { type: "boolean" },
								coalesce: {
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
								}
							},
							additionalProperties: false
						}
					},
					additionalProperties: false
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
				pollingStallThresholdMs: {
					type: "integer",
					minimum: 3e4,
					maximum: 6e5
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
						},
						dangerouslyAllowPrivateNetwork: {
							description: "Dangerous opt-in for trusted Telegram fake-IP or transparent-proxy environments where api.telegram.org resolves to private/internal/special-use addresses during media downloads.",
							type: "boolean"
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
				trustedLocalFileRoots: {
					description: "Trusted local filesystem roots for self-hosted Telegram Bot API absolute file_path values. Only absolute paths under these roots are read directly; all other absolute paths are rejected.",
					type: "array",
					items: { type: "string" }
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
								},
								{
									type: "string",
									const: "batched"
								}
							] },
							groups: {
								type: "object",
								propertyNames: { type: "string" },
								additionalProperties: {
									type: "object",
									properties: {
										requireMention: { type: "boolean" },
										ingest: { type: "boolean" },
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
													ingest: { type: "boolean" },
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
							contextVisibility: {
								type: "string",
								enum: [
									"all",
									"allowlist",
									"allowlist_quote"
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
													ingest: { type: "boolean" },
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
							streaming: {
								type: "object",
								properties: {
									mode: {
										type: "string",
										enum: [
											"off",
											"partial",
											"block",
											"progress"
										]
									},
									chunkMode: {
										type: "string",
										enum: ["length", "newline"]
									},
									preview: {
										type: "object",
										properties: {
											chunk: {
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
											toolProgress: { type: "boolean" }
										},
										additionalProperties: false
									},
									block: {
										type: "object",
										properties: {
											enabled: { type: "boolean" },
											coalesce: {
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
											}
										},
										additionalProperties: false
									}
								},
								additionalProperties: false
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
							pollingStallThresholdMs: {
								type: "integer",
								minimum: 3e4,
								maximum: 6e5
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
									},
									dangerouslyAllowPrivateNetwork: {
										description: "Dangerous opt-in for trusted Telegram fake-IP or transparent-proxy environments where api.telegram.org resolves to private/internal/special-use addresses during media downloads.",
										type: "boolean"
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
							trustedLocalFileRoots: {
								description: "Trusted local filesystem roots for self-hosted Telegram Bot API absolute file_path values. Only absolute paths under these roots are read directly; all other absolute paths are rejected.",
								type: "array",
								items: { type: "string" }
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
				help: "Unified Telegram stream preview mode: \"off\" | \"partial\" | \"block\" | \"progress\" (default: \"partial\"). \"progress\" maps to \"partial\" on Telegram. Legacy boolean/streamMode keys are detected; run doctor --fix to migrate."
			},
			"streaming.mode": {
				label: "Telegram Streaming Mode",
				help: "Canonical Telegram preview mode: \"off\" | \"partial\" | \"block\" | \"progress\" (default: \"partial\"). \"progress\" maps to \"partial\" on Telegram."
			},
			"streaming.chunkMode": {
				label: "Telegram Chunk Mode",
				help: "Chunking mode for outbound Telegram text delivery: \"length\" (default) or \"newline\"."
			},
			"streaming.block.enabled": {
				label: "Telegram Block Streaming Enabled",
				help: "Enable chunked block-style Telegram preview delivery when channels.telegram.streaming.mode=\"block\"."
			},
			"streaming.block.coalesce": {
				label: "Telegram Block Streaming Coalesce",
				help: "Merge streamed Telegram block replies before sending final delivery."
			},
			"streaming.preview.chunk.minChars": {
				label: "Telegram Draft Chunk Min Chars",
				help: "Minimum chars before emitting a Telegram block preview chunk when channels.telegram.streaming.mode=\"block\"."
			},
			"streaming.preview.chunk.maxChars": {
				label: "Telegram Draft Chunk Max Chars",
				help: "Target max size for a Telegram block preview chunk when channels.telegram.streaming.mode=\"block\"."
			},
			"streaming.preview.chunk.breakPreference": {
				label: "Telegram Draft Chunk Break Preference",
				help: "Preferred breakpoints for Telegram draft chunks (paragraph | newline | sentence)."
			},
			"streaming.preview.toolProgress": {
				label: "Telegram Draft Tool Progress",
				help: "Show tool/progress activity in the live draft preview message (default: true when preview streaming is active). Set false to keep tool updates out of the edited Telegram preview."
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
			"network.dangerouslyAllowPrivateNetwork": {
				label: "Telegram Dangerously Allow Private Network",
				help: "Dangerous opt-in for trusted fake-IP or transparent-proxy environments where Telegram media downloads resolve api.telegram.org to private/internal/special-use addresses."
			},
			timeoutSeconds: {
				label: "Telegram API Timeout (seconds)",
				help: "Max seconds before Telegram API requests are aborted (default: 500 per grammY)."
			},
			pollingStallThresholdMs: {
				label: "Telegram Polling Stall Threshold (ms)",
				help: "Milliseconds without completed Telegram getUpdates liveness before the polling watchdog restarts the polling runner. Default: 120000."
			},
			silentErrorReplies: {
				label: "Telegram Silent Error Replies",
				help: "When true, Telegram bot replies marked as errors are sent silently (no notification sound). Default: false."
			},
			apiRoot: {
				label: "Telegram API Root URL",
				help: "Custom Telegram Bot API root URL. Use for self-hosted Bot API servers (https://github.com/tdlib/telegram-bot-api) or reverse proxies in regions where api.telegram.org is blocked."
			},
			trustedLocalFileRoots: {
				label: "Telegram Trusted Local File Roots",
				help: "Trusted local filesystem roots for self-hosted Telegram Bot API absolute file_path values. Only absolute paths inside these roots are read directly; all other absolute paths are rejected."
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
				network: {
					type: "object",
					properties: { dangerouslyAllowPrivateNetwork: { type: "boolean" } },
					additionalProperties: false
				},
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
							network: {
								type: "object",
								properties: { dangerouslyAllowPrivateNetwork: { type: "boolean" } },
								additionalProperties: false
							},
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
				contextVisibility: {
					type: "string",
					enum: [
						"all",
						"allowlist",
						"allowlist_quote"
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
							},
							systemPrompt: { type: "string" }
						},
						additionalProperties: false
					}
				},
				direct: {
					type: "object",
					propertyNames: { type: "string" },
					additionalProperties: {
						type: "object",
						properties: { systemPrompt: { type: "string" } },
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
					},
					{
						type: "string",
						const: "batched"
					}
				] },
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
								type: "string",
								enum: [
									"open",
									"disabled",
									"allowlist"
								]
							},
							contextVisibility: {
								type: "string",
								enum: [
									"all",
									"allowlist",
									"allowlist_quote"
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
										},
										systemPrompt: { type: "string" }
									},
									additionalProperties: false
								}
							},
							direct: {
								type: "object",
								propertyNames: { type: "string" },
								additionalProperties: {
									type: "object",
									properties: { systemPrompt: { type: "string" } },
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
								type: "integer",
								minimum: 0,
								maximum: 9007199254740991
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
								},
								{
									type: "string",
									const: "batched"
								}
							] },
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
		},
		unsupportedSecretRefSurfacePatterns: ["channels.whatsapp.accounts.*.creds.json", "channels.whatsapp.creds.json"]
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
//#region src/secrets/unsupported-surface-policy.ts
const CORE_UNSUPPORTED_SECRETREF_SURFACE_PATTERNS = [
	"commands.ownerDisplaySecret",
	"hooks.token",
	"hooks.gmail.pushToken",
	"hooks.mappings[].sessionKey",
	"auth-profiles.oauth.*"
];
const CORE_UNSUPPORTED_SECRETREF_CONFIG_CANDIDATE_PATTERNS = [
	"commands.ownerDisplaySecret",
	"hooks.token",
	"hooks.gmail.pushToken",
	"hooks.mappings[].sessionKey"
];
const bundledChannelUnsupportedSecretRefSurfacePatterns = [...new Set(GENERATED_BUNDLED_CHANNEL_CONFIG_METADATA.flatMap((entry) => "unsupportedSecretRefSurfacePatterns" in entry ? entry.unsupportedSecretRefSurfacePatterns ?? [] : []))];
[...CORE_UNSUPPORTED_SECRETREF_SURFACE_PATTERNS, ...bundledChannelUnsupportedSecretRefSurfacePatterns];
const unsupportedSecretRefConfigCandidatePatterns = [...CORE_UNSUPPORTED_SECRETREF_CONFIG_CANDIDATE_PATTERNS, ...bundledChannelUnsupportedSecretRefSurfacePatterns];
const parsedPatternCache = /* @__PURE__ */ new Map();
function parseUnsupportedSecretRefSurfacePattern(pattern) {
	const cached = parsedPatternCache.get(pattern);
	if (cached) return cached;
	const parsed = pattern.split(".").filter((segment) => segment.length > 0).map((segment) => {
		if (segment === "*") return { kind: "wildcard" };
		if (segment.endsWith("[]")) return {
			kind: "array",
			key: segment.slice(0, -2)
		};
		return {
			kind: "key",
			key: segment
		};
	});
	parsedPatternCache.set(pattern, parsed);
	return parsed;
}
function collectPatternCandidates(params) {
	if (params.tokenIndex >= params.tokens.length) {
		params.candidates.push({
			path: params.pathSegments.join("."),
			value: params.current
		});
		return;
	}
	const token = params.tokens[params.tokenIndex];
	if (!token) return;
	if (token.kind === "wildcard") {
		if (Array.isArray(params.current)) {
			for (const [index, value] of params.current.entries()) collectPatternCandidates({
				...params,
				current: value,
				tokenIndex: params.tokenIndex + 1,
				pathSegments: [...params.pathSegments, String(index)]
			});
			return;
		}
		if (!isRecord$1(params.current)) return;
		for (const [key, value] of Object.entries(params.current)) collectPatternCandidates({
			...params,
			current: value,
			tokenIndex: params.tokenIndex + 1,
			pathSegments: [...params.pathSegments, key]
		});
		return;
	}
	if (!isRecord$1(params.current)) return;
	if (token.kind === "array") {
		if (!Object.hasOwn(params.current, token.key)) return;
		const value = params.current[token.key];
		if (!Array.isArray(value)) return;
		for (const [index, entry] of value.entries()) collectPatternCandidates({
			...params,
			current: entry,
			tokenIndex: params.tokenIndex + 1,
			pathSegments: [
				...params.pathSegments,
				token.key,
				String(index)
			]
		});
		return;
	}
	if (!Object.hasOwn(params.current, token.key)) return;
	collectPatternCandidates({
		...params,
		current: params.current[token.key],
		tokenIndex: params.tokenIndex + 1,
		pathSegments: [...params.pathSegments, token.key]
	});
}
function collectUnsupportedSecretRefConfigCandidates(raw) {
	if (!isRecord$1(raw)) return [];
	const candidates = [];
	for (const pattern of unsupportedSecretRefConfigCandidatePatterns) collectPatternCandidates({
		current: raw,
		tokens: parseUnsupportedSecretRefSurfacePattern(pattern),
		tokenIndex: 0,
		pathSegments: [],
		candidates
	});
	return candidates;
}
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
			if (current && current.originRank < originRank && (current.configSchema !== void 0 || current.configUiHints !== void 0)) continue;
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
//#endregion
//#region src/config/validation.ts
const LEGACY_REMOVED_PLUGIN_IDS = new Set(["google-antigravity-auth", "google-gemini-cli-auth"]);
function stripDeprecatedValidationKeys(raw) {
	if (!isRecord$1(raw) || !isRecord$1(raw.commands) || !Object.hasOwn(raw.commands, "modelsWrite")) return raw;
	const commands = { ...raw.commands };
	delete commands.modelsWrite;
	return {
		...raw,
		commands
	};
}
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
function isBindingsIssuePath(pathSegments) {
	return pathSegments[0] === "bindings" && typeof pathSegments[1] === "number";
}
function isRouteTypeMismatchIssue(issue) {
	const issuePath = toConfigPathSegments(issue.path);
	if (issuePath.length !== 1 || issuePath[0] !== "type") return false;
	if (issue.code !== "invalid_value" || !Array.isArray(issue.values)) return false;
	return issue.values.includes("route");
}
function extractBindingsSpecificUnionIssue(record, parentPath) {
	if (!isBindingsIssuePath(toConfigPathSegments(record.path)) || !Array.isArray(record.errors)) return null;
	let matchingBranchIssue = null;
	let matchingBranchIsUnrecognized = false;
	let matchingBranchPathLen = -1;
	let sawRouteTypeMismatch = false;
	for (const errGroup of record.errors) {
		if (!Array.isArray(errGroup)) continue;
		const branch = errGroup.map((issue) => toIssueRecord(issue)).filter(Boolean);
		if (branch.length === 0) continue;
		if (branch.some((issue) => isRouteTypeMismatchIssue(issue))) {
			sawRouteTypeMismatch = true;
			continue;
		}
		let branchBestIssue = null;
		let branchBestIsUnrecognized = false;
		let branchBestPathLen = -1;
		for (const issue of branch) {
			const issueCode = typeof issue.code === "string" ? issue.code : "";
			const issuePathLen = toConfigPathSegments(issue.path).length;
			const issueIsUnrecognized = issueCode === "unrecognized_keys";
			if (issuePathLen > branchBestPathLen ? true : issuePathLen === branchBestPathLen && issueIsUnrecognized && !branchBestIsUnrecognized) {
				branchBestIssue = issue;
				branchBestIsUnrecognized = issueIsUnrecognized;
				branchBestPathLen = issuePathLen;
			}
		}
		if (!branchBestIssue) continue;
		if (matchingBranchIssue) return null;
		matchingBranchIssue = branchBestIssue;
		matchingBranchIsUnrecognized = branchBestIsUnrecognized;
		matchingBranchPathLen = branchBestPathLen;
	}
	if (!sawRouteTypeMismatch || !matchingBranchIssue) return null;
	if (matchingBranchPathLen === 0 && !matchingBranchIsUnrecognized) return null;
	const subPath = formatConfigPath(toConfigPathSegments(matchingBranchIssue.path));
	return {
		path: parentPath && subPath ? `${parentPath}.${subPath}` : parentPath || subPath,
		message: typeof matchingBranchIssue.message === "string" ? matchingBranchIssue.message : "Invalid input"
	};
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
	return [...collectUnsupportedMutableSecretRefIssues(raw), ...collectLegacySecretRefEnvMarkerIssues(raw)];
}
function formatLegacySecretRefEnvMarkerMessage(candidate) {
	const replacement = candidate.ref ? JSON.stringify({
		source: "env",
		provider: candidate.ref.provider,
		id: candidate.ref.id
	}) : "{\"source\":\"env\",\"provider\":\"default\",\"id\":\"ENV_VAR\"}";
	return [
		`${JSON.stringify(candidate.value)} is a legacy SecretRef marker and is not valid openclaw.json config.`,
		`Use a structured SecretRef object instead, for example ${replacement}.`,
		"Run \"openclaw doctor --fix\" to migrate valid secretref-env:<ENV_VAR> markers.",
		`See ${SECRETREF_POLICY_DOC_URL}.`
	].join(" ");
}
function collectLegacySecretRefEnvMarkerIssues(raw) {
	if (!isRecord$1(raw)) return [];
	return collectLegacySecretRefEnvMarkerCandidates(raw).map((candidate) => ({
		path: candidate.path,
		message: formatLegacySecretRefEnvMarkerMessage(candidate)
	}));
}
function mapZodIssueToConfigIssue(issue) {
	const record = toIssueRecord(issue);
	const path = formatConfigPath(toConfigPathSegments(record?.path));
	const message = typeof record?.message === "string" ? record.message : "Invalid input";
	const allowedValuesSummary = summarizeAllowedValues(collectAllowedValuesFromUnknownIssue(issue));
	if (record && typeof record.code === "string" && record.code === "invalid_union" && !allowedValuesSummary) {
		const betterIssue = extractBindingsSpecificUnionIssue(record, path);
		if (betterIssue) return betterIssue;
	}
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
function validateConfigObjectRaw(raw, opts) {
	const normalizedRaw = stripDeprecatedValidationKeys(raw);
	const policyIssues = collectUnsupportedSecretRefPolicyIssues(normalizedRaw);
	const legacyIssues = findLegacyConfigIssues(normalizedRaw, normalizedRaw, listPluginDoctorLegacyConfigRules({ pluginIds: opts?.touchedPaths ? collectRelevantDoctorPluginIdsForTouchedPaths({
		raw: normalizedRaw,
		touchedPaths: opts.touchedPaths
	}) : collectRelevantDoctorPluginIds(normalizedRaw) }), opts?.touchedPaths);
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
		env: params?.env,
		pluginValidation: params?.pluginValidation ?? "full",
		pluginMetadataSnapshot: params?.pluginMetadataSnapshot,
		loadPluginMetadataSnapshot: params?.loadPluginMetadataSnapshot
	});
}
function validateConfigObjectRawWithPlugins(raw, params) {
	return validateConfigObjectWithPluginsBase(raw, {
		applyDefaults: false,
		env: params?.env,
		pluginValidation: params?.pluginValidation ?? "full",
		pluginMetadataSnapshot: params?.pluginMetadataSnapshot,
		loadPluginMetadataSnapshot: params?.loadPluginMetadataSnapshot
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
	if (opts.pluginValidation === "skip") return {
		ok: true,
		config,
		warnings: []
	};
	const issues = [];
	const warnings = [];
	const hasExplicitPluginsConfig = isRecord$1(raw) && Object.prototype.hasOwnProperty.call(raw, "plugins");
	const resolvePluginConfigIssuePath = (pluginId, errorPath) => {
		const base = `plugins.entries.${pluginId}.config`;
		if (!errorPath || errorPath === "<root>") return base;
		return `${base}.${errorPath}`;
	};
	let registryInfo = opts.pluginMetadataSnapshot ? { registry: opts.pluginMetadataSnapshot.manifestRegistry } : null;
	let compatConfig;
	let compatPluginIds = null;
	let compatPluginIdsResolved = false;
	let registryDiagnosticsPushed = false;
	const pushRegistryDiagnostics = (registry) => {
		if (registryDiagnosticsPushed) return;
		registryDiagnosticsPushed = true;
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
	};
	const loadValidationRegistry = () => {
		const pluginMetadataSnapshot = opts.loadPluginMetadataSnapshot?.(config);
		if (pluginMetadataSnapshot) {
			registryInfo = { registry: pluginMetadataSnapshot.manifestRegistry };
			return registryInfo;
		}
		registryInfo = { registry: loadPluginManifestRegistryForPluginRegistry({
			config,
			workspaceDir: resolveAgentWorkspaceDir(config, resolveDefaultAgentId(config)) ?? void 0,
			env: opts.env,
			includeDisabled: true
		}) };
		return registryInfo;
	};
	const ensureCompatPluginIds = () => {
		if (compatPluginIdsResolved) return compatPluginIds ?? /* @__PURE__ */ new Set();
		compatPluginIdsResolved = true;
		const allow = config.plugins?.allow;
		if (!Array.isArray(allow) || allow.length === 0) {
			compatPluginIds = /* @__PURE__ */ new Set();
			return compatPluginIds;
		}
		const { registry } = registryInfo ?? loadValidationRegistry();
		const overriddenBundledPluginIds = new Set(registry.diagnostics.filter((diag) => diag.message.includes("duplicate plugin id detected")).map((diag) => diag.pluginId).filter((pluginId) => typeof pluginId === "string" && pluginId !== ""));
		compatPluginIds = new Set(registry.plugins.filter((plugin) => plugin.origin === "bundled" && (plugin.contracts?.webSearchProviders?.length ?? 0) > 0 && !overriddenBundledPluginIds.has(plugin.id)).map((plugin) => plugin.id));
		return compatPluginIds;
	};
	const ensureCompatConfig = () => {
		if (compatConfig !== void 0) return compatConfig ?? config;
		const allow = config.plugins?.allow;
		if (!Array.isArray(allow) || allow.length === 0) {
			compatConfig = config;
			return config;
		}
		compatConfig = withBundledPluginAllowlistCompat({
			config,
			pluginIds: [...ensureCompatPluginIds()]
		});
		return compatConfig ?? config;
	};
	const ensureRegistry = () => {
		const info = registryInfo ?? loadValidationRegistry();
		ensureCompatConfig();
		pushRegistryDiagnostics(info.registry);
		return info;
	};
	const ensureKnownIds = () => {
		const info = ensureRegistry();
		if (!info.knownIds) info.knownIds = new Set(info.registry.plugins.map((record) => record.id));
		return info.knownIds;
	};
	const ensureOverriddenPluginIds = () => {
		const info = ensureRegistry();
		if (!info.overriddenPluginIds) info.overriddenPluginIds = new Set(info.registry.diagnostics.filter((diag) => diag.message.includes("duplicate plugin id detected")).map((diag) => diag.pluginId).filter((pluginId) => typeof pluginId === "string" && pluginId !== ""));
		return info.overriddenPluginIds;
	};
	const ensureNormalizedPlugins = () => {
		const info = ensureRegistry();
		if (!info.normalizedPlugins) info.normalizedPlugins = normalizePluginsConfig(ensureCompatConfig().plugins);
		return info.normalizedPlugins;
	};
	const ensureChannelSchemas = () => {
		const info = ensureRegistry();
		if (!info.channelSchemas) {
			info.channelSchemas = new Map(GENERATED_BUNDLED_CHANNEL_CONFIG_METADATA.map((entry) => [entry.channelId, { schema: entry.schema }]));
			for (const entry of collectChannelSchemaMetadata(info.registry)) {
				const current = info.channelSchemas.get(entry.id);
				if (entry.configSchema) {
					info.channelSchemas.set(entry.id, { schema: entry.configSchema });
					continue;
				}
				if (!current) info.channelSchemas.set(entry.id, {});
			}
		}
		return info.channelSchemas;
	};
	let mutatedConfig = config;
	let channelsCloned = false;
	let pluginsCloned = false;
	let pluginEntriesCloned = false;
	let installedPluginRecordIds;
	const ensureInstalledPluginRecordIds = () => {
		if (installedPluginRecordIds) return installedPluginRecordIds;
		try {
			installedPluginRecordIds = new Set(Object.keys(loadInstalledPluginIndexInstallRecordsSync({ env: opts.env })).map(normalizePluginId));
		} catch {
			installedPluginRecordIds = /* @__PURE__ */ new Set();
		}
		return installedPluginRecordIds;
	};
	const hasStalePluginEvidenceForUnknownChannel = (channelId) => {
		const normalizedChannelId = normalizePluginId(channelId);
		if (!normalizedChannelId || ensureKnownIds().has(normalizedChannelId)) return false;
		const pluginConfig = config.plugins;
		if (Array.isArray(pluginConfig?.allow) && pluginConfig.allow.some((pluginId) => normalizePluginId(pluginId) === normalizedChannelId)) return true;
		if (isRecord$1(pluginConfig?.entries) && Object.keys(pluginConfig.entries).some((pluginId) => normalizePluginId(pluginId) === normalizedChannelId)) return true;
		if (isRecord$1(pluginConfig?.installs) && Object.keys(pluginConfig.installs).some((pluginId) => normalizePluginId(pluginId) === normalizedChannelId)) return true;
		return ensureInstalledPluginRecordIds().has(normalizedChannelId);
	};
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
			const issue = {
				path: `channels.${trimmed}`,
				message: `unknown channel id: ${trimmed}`
			};
			if (hasStalePluginEvidenceForUnknownChannel(trimmed)) warnings.push({
				...issue,
				message: `${issue.message} (stale channel plugin config ignored; run openclaw doctor --fix to remove stale config, or install the plugin)`
			});
			else issues.push(issue);
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
	for (const channelId of CHANNEL_IDS) heartbeatChannelIds.add(normalizeLowercaseStringOrEmpty(channelId));
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
		const normalized = normalizeLowercaseStringOrEmpty(trimmed);
		if (normalized === "last" || normalized === "none") return;
		if (normalizeChatChannelId(trimmed)) return;
		if (!heartbeatChannelIds.has(normalized)) {
			const { registry } = ensureRegistry();
			for (const record of registry.plugins) for (const channelId of record.channels) {
				const pluginChannel = channelId.trim();
				if (pluginChannel) heartbeatChannelIds.add(normalizeLowercaseStringOrEmpty(pluginChannel));
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
	const effectiveConfig = ensureCompatConfig();
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
		if (!knownIds.has(pluginId)) {
			const commandAlias = resolveManifestCommandAliasOwnerInRegistry({
				command: pluginId,
				registry
			});
			if (commandAlias?.pluginId && knownIds.has(commandAlias.pluginId)) warnings.push({
				path: "plugins.allow",
				message: `"${pluginId}" is not a plugin — it is a command provided by the "${commandAlias.pluginId}" plugin. Use "${commandAlias.pluginId}" in plugins.allow instead.`
			});
			else pushMissingPluginIssue("plugins.allow", pluginId, { warnOnly: true });
		}
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
			rootConfig: effectiveConfig
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
		const shouldReplacePluginConfig = entryHasConfig || opts.applyDefaults && enabled;
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
			else if (shouldReplacePluginConfig) replacePluginEntryConfig(pluginId, res.value);
		} else if (record.format === "bundle") {} else issues.push({
			path: `plugins.entries.${pluginId}`,
			message: `plugin schema missing for ${pluginId}`
		});
		const suppressDisabledConfigWarning = ensureCompatPluginIds().has(pluginId) && !ensureOverriddenPluginIds().has(pluginId);
		if (!enabled && entryHasConfig && !suppressDisabledConfigWarning) warnings.push({
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
function hasConfigMeta(value) {
	if (!isRecord$1(value)) return false;
	const meta = value.meta;
	return isRecord$1(meta);
}
function resolveGatewayMode(value) {
	if (!isRecord$1(value)) return null;
	const gateway = value.gateway;
	if (!isRecord$1(gateway) || typeof gateway.mode !== "string") return null;
	const trimmed = gateway.mode.trim();
	return trimmed.length > 0 ? trimmed : null;
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
	if (isRecord$1(value)) for (const [key, child] of Object.entries(value)) collectEnvRefPaths(child, path ? `${path}.${key}` : key, output);
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
function resolveConfigWriteBlockingReasons(suspicious) {
	return suspicious.filter((reason) => reason.startsWith("size-drop:") || reason === "gateway-mode-removed");
}
async function readConfigHealthState(deps) {
	try {
		const healthPath = resolveConfigHealthStatePath(deps.env, deps.homedir);
		const raw = await deps.fs.promises.readFile(healthPath, "utf-8");
		const parsed = JSON.parse(raw);
		return isRecord$1(parsed) ? parsed : {};
	} catch {
		return {};
	}
}
function readConfigHealthStateSync(deps) {
	try {
		const healthPath = resolveConfigHealthStatePath(deps.env, deps.homedir);
		const raw = deps.fs.readFileSync(healthPath, "utf-8");
		const parsed = JSON.parse(raw);
		return isRecord$1(parsed) ? parsed : {};
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
	if (!entries || !isRecord$1(entries)) return {};
	const entry = entries[configPath];
	return entry && isRecord$1(entry) ? entry : {};
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
	if (!isRecord$1(value)) return false;
	const keys = Object.keys(value);
	if (keys.length !== 1 || keys[0] !== "update") return false;
	const update = value.update;
	if (!isRecord$1(update)) return false;
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
				...entry,
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
	await appendConfigAuditRecord({
		fs: deps.fs,
		env: deps.env,
		homedir: deps.homedir,
		record: {
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
		}
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
				...entry,
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
	appendConfigAuditRecordSync({
		fs: deps.fs,
		env: deps.env,
		homedir: deps.homedir,
		record: {
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
		}
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
		fs: overrides.fs ?? fs,
		json5: overrides.json5 ?? JSON5,
		env: overrides.env ?? process.env,
		homedir: overrides.homedir ?? (() => resolveRequiredHomeDir(overrides.env ?? process.env, os.homedir)),
		configPath: overrides.configPath ?? "",
		logger: overrides.logger ?? console,
		measure: overrides.measure ?? (async (_name, run) => await run())
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
function findJsonRootSuffix(raw, json5 = JSON5) {
	if (/^\s*(?:\{|\[)/.test(raw)) return null;
	let offset = 0;
	while (offset < raw.length) {
		const nextNewline = raw.indexOf("\n", offset);
		const lineEnd = nextNewline === -1 ? raw.length : nextNewline + 1;
		const line = raw.slice(offset, lineEnd);
		if (/^\s*(?:\{|\[)/.test(line)) {
			const candidate = raw.slice(offset);
			const parsed = parseConfigJson5(candidate, json5);
			return parsed.ok ? {
				raw: candidate,
				parsed: parsed.parsed
			} : null;
		}
		offset = lineEnd;
	}
	return null;
}
async function persistPrefixedConfigRecovery(params) {
	const observedAt = (/* @__PURE__ */ new Date()).toISOString();
	const clobberedPath = await persistClobberedConfigSnapshot({
		deps: params.deps,
		configPath: params.configPath,
		raw: params.originalRaw,
		observedAt
	});
	await params.deps.fs.promises.writeFile(params.configPath, params.recoveredRaw, {
		encoding: "utf-8",
		mode: 384
	});
	await params.deps.fs.promises.chmod?.(params.configPath, 384).catch(() => {});
	params.deps.logger.warn(`Config auto-stripped non-JSON prefix: ${params.configPath}` + (clobberedPath ? ` (original saved as ${clobberedPath})` : ""));
}
async function recoverConfigFromJsonRootSuffixWithDeps(params) {
	if (!params.snapshot.exists || params.snapshot.valid || typeof params.snapshot.raw !== "string") return false;
	const suffixRecovery = findJsonRootSuffix(params.snapshot.raw, params.deps.json5);
	if (!suffixRecovery) return false;
	let resolved;
	try {
		resolved = resolveConfigIncludesForRead(suffixRecovery.parsed, params.configPath, params.deps);
	} catch {
		return false;
	}
	if (!validateConfigObjectWithPlugins(stripShippedPluginInstallConfigRecords(resolveLegacyConfigForRead(resolveConfigForRead(resolved, params.deps.env).resolvedConfigRaw, suffixRecovery.parsed).effectiveConfigRaw), { env: params.deps.env }).ok) return false;
	await persistPrefixedConfigRecovery({
		deps: params.deps,
		configPath: params.configPath,
		originalRaw: params.snapshot.raw,
		recoveredRaw: suffixRecovery.raw
	});
	return true;
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
	const sourceLegacyIssues = findLegacyConfigIssues(resolvedConfigRaw, sourceRaw, listPluginDoctorLegacyConfigRules({ pluginIds: collectRelevantDoctorPluginIds(resolvedConfigRaw) }));
	if (!resolvedConfigRaw || typeof resolvedConfigRaw !== "object") return {
		effectiveConfigRaw: resolvedConfigRaw,
		sourceLegacyIssues
	};
	return {
		effectiveConfigRaw: applyRuntimeLegacyConfigMigrations(resolvedConfigRaw).next ?? resolvedConfigRaw,
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
	const configPath = resolveConfigPathForDeps(deps);
	function observeLoadConfigSnapshot(snapshot) {
		observeConfigSnapshotSync(deps, snapshot);
		return snapshot;
	}
	function finalizeLoadedRuntimeConfig(cfg) {
		const duplicates = findDuplicateAgentDirs(cfg, {
			env: deps.env,
			homedir: deps.homedir
		});
		if (duplicates.length > 0) throw new DuplicateAgentDirError(duplicates);
		applyConfigEnvVars(cfg, deps.env);
		if ((shouldEnableShellEnvFallback(deps.env) || cfg.env?.shellEnv?.enabled === true) && !shouldDeferShellEnvFallback(deps.env)) loadShellEnvFallback({
			enabled: true,
			env: deps.env,
			expectedKeys: resolveShellEnvExpectedKeys(deps.env),
			logger: deps.logger,
			timeoutMs: cfg.env?.shellEnv?.timeoutMs ?? resolveShellEnvFallbackTimeoutMs(deps.env)
		});
		const pendingSecret = AUTO_OWNER_DISPLAY_SECRET_BY_PATH.get(configPath);
		const ownerDisplaySecretResolution = ensureOwnerDisplaySecret(cfg, () => pendingSecret ?? crypto.randomBytes(32).toString("hex"));
		return applyConfigOverrides(persistGeneratedOwnerDisplaySecret({
			config: ownerDisplaySecretResolution.config,
			configPath,
			generatedSecret: ownerDisplaySecretResolution.generatedSecret,
			logger: deps.logger,
			state: {
				pendingByPath: AUTO_OWNER_DISPLAY_SECRET_BY_PATH,
				persistInFlight: AUTO_OWNER_DISPLAY_SECRET_PERSIST_IN_FLIGHT,
				persistWarned: AUTO_OWNER_DISPLAY_SECRET_PERSIST_WARNED
			},
			persistConfig: (nextConfig, options) => writeConfigFile(nextConfig, options)
		}));
	}
	function captureFileSnapshotSync(filePath) {
		return deps.fs.existsSync(filePath) ? {
			existed: true,
			raw: deps.fs.readFileSync(filePath, "utf-8")
		} : { existed: false };
	}
	function restoreFileSnapshotSync(filePath, previousFile) {
		if (previousFile.existed) {
			deps.fs.writeFileSync(filePath, previousFile.raw, {
				encoding: "utf-8",
				mode: 384
			});
			return;
		}
		try {
			deps.fs.unlinkSync(filePath);
		} catch (err) {
			if (err?.code !== "ENOENT") throw err;
		}
	}
	function replaceConfigFileSync(raw) {
		const dir = path.dirname(configPath);
		deps.fs.mkdirSync(dir, {
			recursive: true,
			mode: 448
		});
		const tmp = path.join(dir, `${path.basename(configPath)}.${process.pid}.${crypto.randomUUID()}.tmp`);
		try {
			deps.fs.writeFileSync(tmp, raw, {
				encoding: "utf-8",
				mode: 384
			});
			try {
				deps.fs.renameSync(tmp, configPath);
			} catch (err) {
				const code = err?.code;
				if (code !== "EPERM" && code !== "EEXIST") throw err;
				deps.fs.copyFileSync(tmp, configPath);
				deps.fs.chmodSync(configPath, 384);
				deps.fs.unlinkSync(tmp);
			}
		} catch (err) {
			try {
				deps.fs.unlinkSync(tmp);
			} catch (cleanupErr) {
				if (cleanupErr?.code !== "ENOENT") deps.logger.warn(`Failed to clean temporary config file ${tmp}: ${String(cleanupErr)}`);
			}
			throw err;
		}
	}
	function migrateAndStripShippedPluginInstallConfigRecords(configRaw, options = {}) {
		const installRecords = extractShippedPluginInstallConfigRecords(configRaw);
		const stripped = stripShippedPluginInstallConfigRecords(configRaw);
		if (Object.keys(installRecords).length === 0) return { config: stripped };
		if (options.persist === false) return { config: stripped };
		try {
			const stateDir = resolveStateDir(deps.env, deps.homedir);
			const filePath = resolveInstalledPluginIndexRecordsStorePath({
				env: deps.env,
				stateDir
			});
			const previousFile = captureFileSnapshotSync(filePath);
			const existingRecords = loadInstalledPluginIndexInstallRecordsSync({
				env: deps.env,
				stateDir
			});
			const nextRecords = {
				...installRecords,
				...existingRecords
			};
			if (Object.keys(installRecords).some((pluginId) => !(pluginId in existingRecords))) writePersistedInstalledPluginIndexInstallRecordsSync(nextRecords, {
				config: coerceConfig(stripped),
				env: deps.env,
				stateDir
			});
			const rootConfigRaw = options.rootConfigRaw;
			if (rootConfigRaw !== void 0 && Object.keys(extractShippedPluginInstallConfigRecords(rootConfigRaw)).length > 0) {
				const persistedRootParsed = stripShippedPluginInstallConfigRecords(rootConfigRaw);
				const persistedRootRaw = JSON.stringify(persistedRootParsed, null, 2).trimEnd().concat("\n");
				try {
					replaceConfigFileSync(persistedRootRaw);
				} catch (err) {
					restoreFileSnapshotSync(filePath, previousFile);
					throw err;
				}
				return {
					config: stripped,
					persistedRootParsed,
					persistedRootRaw
				};
			}
		} catch (err) {
			deps.logger.warn(`Config (${configPath}): could not migrate shipped plugins.installs records into the plugin index: ${formatErrorMessage(err)}`);
			return { config: configRaw };
		}
		return { config: stripped };
	}
	function ensureShippedPluginInstallConfigRecordsMigratedForWrite(snapshot) {
		const installRecords = {
			...extractShippedPluginInstallConfigRecords(snapshot.sourceConfig),
			...extractShippedPluginInstallConfigRecords(snapshot.parsed)
		};
		if (Object.keys(installRecords).length === 0) return { migrated: false };
		const stateDir = resolveStateDir(deps.env, deps.homedir);
		const filePath = resolveInstalledPluginIndexRecordsStorePath({
			env: deps.env,
			stateDir
		});
		const existingRecords = loadInstalledPluginIndexInstallRecordsSync({
			env: deps.env,
			stateDir
		});
		if (Object.keys(installRecords).every((pluginId) => pluginId in existingRecords)) return { migrated: false };
		const previousFile = deps.fs.existsSync(filePath) ? {
			existed: true,
			raw: deps.fs.readFileSync(filePath, "utf-8")
		} : { existed: false };
		try {
			writePersistedInstalledPluginIndexInstallRecordsSync({
				...installRecords,
				...existingRecords
			}, {
				config: coerceConfig(stripShippedPluginInstallConfigRecords(snapshot.sourceConfig)),
				env: deps.env,
				stateDir
			});
			return {
				migrated: true,
				filePath,
				previousFile
			};
		} catch (err) {
			throw new Error(`Config write blocked: shipped plugins.installs records in ${configPath} could not be migrated into the plugin index. Fix state directory permissions or run openclaw plugins registry --refresh, then retry. ${formatErrorMessage(err)}`, { cause: err });
		}
	}
	function rollbackShippedPluginInstallConfigWriteMigration(migration) {
		if (!migration.migrated) return;
		if (migration.previousFile.existed) {
			deps.fs.writeFileSync(migration.filePath, migration.previousFile.raw, {
				encoding: "utf-8",
				mode: 384
			});
			return;
		}
		try {
			deps.fs.unlinkSync(migration.filePath);
		} catch (err) {
			if (err?.code !== "ENOENT") throw err;
		}
	}
	function loadConfig() {
		try {
			maybeLoadDotEnvForConfig(deps.env);
			if (!deps.fs.existsSync(configPath)) {
				if (shouldEnableShellEnvFallback(deps.env) && !shouldDeferShellEnvFallback(deps.env)) loadShellEnvFallback({
					enabled: true,
					env: deps.env,
					expectedKeys: resolveShellEnvExpectedKeys(deps.env),
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
			const readResolution = resolveConfigForRead(resolveConfigIncludesForRead(effectiveParsed, configPath, deps), deps.env);
			const resolvedConfig = readResolution.resolvedConfigRaw;
			const legacyResolution = resolveLegacyConfigForRead(resolvedConfig, effectiveParsed);
			const installMigration = migrateAndStripShippedPluginInstallConfigRecords(legacyResolution.effectiveConfigRaw, { rootConfigRaw: effectiveParsed });
			const effectiveConfigRaw = installMigration.config;
			const snapshotRaw = installMigration.persistedRootRaw ?? effectiveRaw;
			const snapshotParsed = installMigration.persistedRootParsed ?? effectiveParsed;
			const hash = hashConfigRaw(snapshotRaw);
			for (const w of readResolution.envWarnings) deps.logger.warn(`Config (${configPath}): missing env var "${w.varName}" at ${w.configPath} - feature using this value will be unavailable`);
			warnOnConfigMiskeys(effectiveConfigRaw, deps.logger);
			if (typeof effectiveConfigRaw !== "object" || effectiveConfigRaw === null) {
				observeLoadConfigSnapshot({ ...createConfigFileSnapshot({
					path: configPath,
					exists: true,
					raw: snapshotRaw,
					parsed: snapshotParsed,
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
			const validated = validateConfigObjectWithPlugins(effectiveConfigRaw, {
				env: deps.env,
				pluginValidation: overrides.pluginValidation
			});
			if (!validated.ok) {
				observeLoadConfigSnapshot({ ...createConfigFileSnapshot({
					path: configPath,
					exists: true,
					raw: snapshotRaw,
					parsed: snapshotParsed,
					sourceConfig: coerceConfig(effectiveConfigRaw),
					valid: false,
					runtimeConfig: coerceConfig(effectiveConfigRaw),
					hash,
					issues: validated.issues,
					warnings: validated.warnings,
					legacyIssues: legacyResolution.sourceLegacyIssues
				}) });
				throwInvalidConfig({
					configPath,
					issues: validated.issues,
					logger: deps.logger,
					loggedConfigPaths: loggedInvalidConfigs
				});
			}
			if (validated.warnings.length > 0) {
				const details = validated.warnings.map((iss) => `- ${sanitizeTerminalText(iss.path || "<root>")}: ${sanitizeTerminalText(iss.message)}`).join("\n");
				deps.logger.warn(`Config warnings:\n${details}`);
			}
			warnIfConfigFromFuture(validated.config, deps.logger);
			const cfg = materializeRuntimeConfig(validated.config, "load");
			observeLoadConfigSnapshot({ ...createConfigFileSnapshot({
				path: configPath,
				exists: true,
				raw: snapshotRaw,
				parsed: snapshotParsed,
				sourceConfig: coerceConfig(effectiveConfigRaw),
				valid: true,
				runtimeConfig: cfg,
				hash,
				issues: [],
				warnings: validated.warnings,
				legacyIssues: legacyResolution.sourceLegacyIssues
			}) });
			return finalizeLoadedRuntimeConfig(cfg);
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
	async function readConfigFileSnapshotInternal(options = {}) {
		maybeLoadDotEnvForConfig(deps.env);
		if (!deps.fs.existsSync(configPath)) return await finalizeReadConfigSnapshotInternalResult(deps, { snapshot: createConfigFileSnapshot({
			path: configPath,
			exists: false,
			raw: null,
			parsed: {},
			sourceConfig: {},
			valid: true,
			runtimeConfig: {},
			hash: hashConfigRaw(null),
			issues: [],
			warnings: [],
			legacyIssues: []
		}) });
		let fallbackRaw = null;
		let fallbackParsed = {};
		let fallbackSourceConfig = {};
		let fallbackHash = hashConfigRaw(null);
		try {
			const raw = await deps.measure("config.snapshot.read.file", () => deps.fs.readFileSync(configPath, "utf-8"));
			const rawHash = await deps.measure("config.snapshot.read.hash", () => hashConfigRaw(raw));
			fallbackRaw = raw;
			fallbackHash = rawHash;
			const parsedRes = await deps.measure("config.snapshot.read.parse", () => parseConfigJson5(raw, deps.json5));
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
			fallbackParsed = parsedRes.parsed;
			fallbackSourceConfig = coerceConfig(parsedRes.parsed);
			const recovered = await deps.measure("config.snapshot.read.recovery-check", () => maybeRecoverSuspiciousConfigRead({
				deps,
				configPath,
				raw,
				parsed: parsedRes.parsed
			}));
			const effectiveRaw = recovered.raw;
			const effectiveParsed = recovered.parsed;
			const hash = hashConfigRaw(effectiveRaw);
			fallbackRaw = effectiveRaw;
			fallbackParsed = effectiveParsed;
			fallbackSourceConfig = coerceConfig(effectiveParsed);
			fallbackHash = hash;
			let resolved;
			try {
				resolved = await deps.measure("config.snapshot.read.includes", () => resolveConfigIncludesForRead(effectiveParsed, configPath, deps));
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
			const readResolution = await deps.measure("config.snapshot.read.env", () => resolveConfigForRead(resolved, deps.env));
			const envVarWarnings = readResolution.envWarnings.map((w) => ({
				path: w.configPath,
				message: `Missing env var "${w.varName}" - feature using this value will be unavailable`
			}));
			const resolvedConfigRaw = readResolution.resolvedConfigRaw;
			const legacyResolution = await deps.measure("config.snapshot.read.legacy", () => resolveLegacyConfigForRead(resolvedConfigRaw, effectiveParsed));
			const installMigration = await deps.measure("config.snapshot.read.plugin-install-migration", () => migrateAndStripShippedPluginInstallConfigRecords(legacyResolution.effectiveConfigRaw, {
				persist: options.persistShippedPluginInstallMigration !== false,
				rootConfigRaw: effectiveParsed
			}));
			const effectiveConfigRaw = installMigration.config;
			const snapshotRaw = installMigration.persistedRootRaw ?? effectiveRaw;
			const snapshotParsed = installMigration.persistedRootParsed ?? effectiveParsed;
			const snapshotHash = installMigration.persistedRootRaw ? hashConfigRaw(installMigration.persistedRootRaw) : hash;
			fallbackSourceConfig = coerceConfig(effectiveConfigRaw);
			let pluginMetadataSnapshot;
			const loadValidationPluginMetadataSnapshot = (config) => {
				if (pluginMetadataSnapshot) return pluginMetadataSnapshot;
				pluginMetadataSnapshot = loadPluginMetadataSnapshot({
					config,
					workspaceDir: resolveAgentWorkspaceDir(config, resolveDefaultAgentId(config)),
					env: deps.env
				});
				return pluginMetadataSnapshot;
			};
			const validated = await deps.measure("config.snapshot.read.validate", () => validateConfigObjectWithPlugins(effectiveConfigRaw, {
				env: deps.env,
				pluginValidation: overrides.pluginValidation,
				loadPluginMetadataSnapshot: loadValidationPluginMetadataSnapshot
			}));
			if (!validated.ok) return await finalizeReadConfigSnapshotInternalResult(deps, { snapshot: createConfigFileSnapshot({
				path: configPath,
				exists: true,
				raw: snapshotRaw,
				parsed: snapshotParsed,
				sourceConfig: coerceConfig(effectiveConfigRaw),
				valid: false,
				runtimeConfig: coerceConfig(effectiveConfigRaw),
				hash: snapshotHash,
				issues: validated.issues,
				warnings: [...validated.warnings, ...envVarWarnings],
				legacyIssues: legacyResolution.sourceLegacyIssues
			}) });
			warnIfConfigFromFuture(validated.config, deps.logger);
			const snapshotConfig = await deps.measure("config.snapshot.read.materialize", () => materializeRuntimeConfig(validated.config, "snapshot"));
			return await deps.measure("config.snapshot.read.observe", () => finalizeReadConfigSnapshotInternalResult(deps, {
				snapshot: createConfigFileSnapshot({
					path: configPath,
					exists: true,
					raw: snapshotRaw,
					parsed: snapshotParsed,
					sourceConfig: coerceConfig(effectiveConfigRaw),
					valid: true,
					runtimeConfig: snapshotConfig,
					hash: snapshotHash,
					issues: [],
					warnings: [...validated.warnings, ...envVarWarnings],
					legacyIssues: legacyResolution.sourceLegacyIssues
				}),
				envSnapshotForRestore: readResolution.envSnapshotForRestore,
				pluginMetadataSnapshot
			}));
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
				raw: fallbackRaw,
				parsed: fallbackParsed,
				sourceConfig: fallbackSourceConfig,
				valid: false,
				runtimeConfig: fallbackSourceConfig,
				hash: fallbackHash,
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
	async function readConfigFileSnapshotWithPluginMetadata() {
		const result = await readConfigFileSnapshotInternal();
		return {
			snapshot: result.snapshot,
			...result.pluginMetadataSnapshot ? { pluginMetadataSnapshot: result.pluginMetadataSnapshot } : {}
		};
	}
	async function promoteConfigSnapshotToLastKnownGood(snapshot) {
		return await promoteConfigSnapshotToLastKnownGood$1({
			deps,
			snapshot,
			logger: deps.logger
		});
	}
	async function recoverConfigFromLastKnownGood(params) {
		return await recoverConfigFromLastKnownGood$1({
			deps,
			snapshot: params.snapshot,
			reason: params.reason
		});
	}
	async function recoverConfigFromJsonRootSuffix(snapshot) {
		return await recoverConfigFromJsonRootSuffixWithDeps({
			deps,
			configPath,
			snapshot
		});
	}
	async function readConfigFileSnapshotForWrite() {
		const result = await readConfigFileSnapshotInternal({ persistShippedPluginInstallMigration: false });
		return {
			snapshot: result.snapshot,
			writeOptions: {
				envSnapshotForRestore: result.envSnapshotForRestore,
				expectedConfigPath: configPath,
				unsetPaths: resolveManagedUnsetPathsForWrite(void 0)
			}
		};
	}
	async function readBestEffortConfig() {
		const result = await readConfigFileSnapshotInternal();
		if (!result.snapshot.valid) return result.snapshot.config;
		return finalizeLoadedRuntimeConfig(materializeRuntimeConfig(result.snapshot.sourceConfig, "load"));
	}
	async function readSourceConfigBestEffort() {
		maybeLoadDotEnvForConfig(deps.env);
		if (!deps.fs.existsSync(configPath)) return {};
		try {
			const raw = deps.fs.readFileSync(configPath, "utf-8");
			const parsedRes = parseConfigJson5(raw, deps.json5);
			if (!parsedRes.ok) return {};
			const recovered = await maybeRecoverSuspiciousConfigRead({
				deps,
				configPath,
				raw,
				parsed: parsedRes.parsed
			});
			let resolved;
			try {
				resolved = resolveConfigIncludesForRead(recovered.parsed, configPath, deps);
			} catch {
				return coerceConfig(recovered.parsed);
			}
			return coerceConfig(stripShippedPluginInstallConfigRecords(resolveLegacyConfigForRead(resolveConfigForRead(resolved, deps.env).resolvedConfigRaw, recovered.parsed).effectiveConfigRaw));
		} catch {
			return {};
		}
	}
	async function writeConfigFile(cfg, options = {}) {
		const unsetPaths = resolveManagedUnsetPathsForWrite(options.unsetPaths);
		let persistCandidate = cfg;
		const snapshot = options.baseSnapshot ?? (await readConfigFileSnapshotInternal({ persistShippedPluginInstallMigration: false })).snapshot;
		let envRefMap = null;
		let changedPaths = null;
		if (snapshot.valid && snapshot.exists) {
			persistCandidate = resolvePersistCandidateForWrite({
				runtimeConfig: snapshot.config,
				sourceConfig: snapshot.resolved,
				nextConfig: cfg,
				rootAuthoredConfig: snapshot.parsed
			});
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
		persistCandidate = applyUnsetPathsForWrite(persistCandidate, unsetPaths);
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
		const stampedOutputConfig = stampConfigVersion(applyUnsetPathsForWrite(envRefMap && changedPaths ? restoreEnvRefsFromMap(cfgToWrite, "", envRefMap, changedPaths) : cfgToWrite, unsetPaths));
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
			if (options.skipOutputLogs) return;
			const isVitest = deps.env.VITEST === "true";
			const shouldLogInVitest = deps.env.OPENCLAW_TEST_CONFIG_OVERWRITE_LOG === "1";
			if (isVitest && !shouldLogInVitest) return;
			deps.logger.warn(formatConfigOverwriteLogMessage({
				configPath,
				previousHash: previousHash ?? null,
				nextHash,
				changedPathCount
			}));
		};
		const logConfigWriteAnomalies = () => {
			if (suspiciousReasons.length === 0) return;
			if (options.skipOutputLogs) return;
			const isVitest = deps.env.VITEST === "true";
			const shouldLogInVitest = deps.env.OPENCLAW_TEST_CONFIG_WRITE_ANOMALY_LOG === "1";
			if (isVitest && !shouldLogInVitest) return;
			deps.logger.warn(`Config write anomaly: ${configPath} (${suspiciousReasons.join(", ")})`);
		};
		const previousMetadata = resolveConfigStatMetadata(previousStat);
		const auditRecordBase = createConfigWriteAuditRecordBase({
			configPath,
			env: deps.env,
			existsBefore: snapshot.exists,
			previousHash: previousHash ?? null,
			nextHash,
			previousBytes,
			nextBytes,
			previousMetadata,
			changedPathCount,
			hasMetaBefore,
			hasMetaAfter,
			gatewayModeBefore,
			gatewayModeAfter,
			suspicious: suspiciousReasons
		});
		const appendWriteAudit = async (result, err, nextStat) => {
			await appendConfigAuditRecord({
				fs: deps.fs,
				env: deps.env,
				homedir: deps.homedir,
				record: finalizeConfigWriteAuditRecord({
					base: auditRecordBase,
					result,
					err,
					nextMetadata: resolveConfigStatMetadata(nextStat ?? null)
				})
			});
		};
		const blockingReasons = resolveConfigWriteBlockingReasons(suspiciousReasons);
		if (blockingReasons.length > 0 && options.allowDestructiveWrite !== true) {
			const rejectedPath = `${configPath}.rejected.${formatConfigArtifactTimestamp((/* @__PURE__ */ new Date()).toISOString())}`;
			await deps.fs.promises.writeFile(rejectedPath, json, {
				encoding: "utf-8",
				mode: 384,
				flag: "wx"
			}).catch(() => {});
			const message = `Config write rejected: ${configPath} (${blockingReasons.join(", ")}). Rejected payload saved to ${rejectedPath}.`;
			const err = Object.assign(new Error(message), {
				code: "CONFIG_WRITE_REJECTED",
				rejectedPath,
				reasons: blockingReasons
			});
			deps.logger.warn(message);
			await appendWriteAudit("rejected", err);
			throw err;
		}
		const tmp = path.join(dir, `${path.basename(configPath)}.${process.pid}.${crypto.randomUUID()}.tmp`);
		const pluginInstallConfigMigration = ensureShippedPluginInstallConfigRecordsMigratedForWrite(snapshot);
		let configCommitted = false;
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
					configCommitted = true;
					logConfigOverwrite();
					logConfigWriteAnomalies();
					await appendWriteAudit("copy-fallback", void 0, await deps.fs.promises.stat(configPath).catch(() => null));
					return {
						persistedHash: nextHash,
						persistedConfig: stampedOutputConfig
					};
				}
				await deps.fs.promises.unlink(tmp).catch(() => {});
				throw err;
			}
			configCommitted = true;
			logConfigOverwrite();
			logConfigWriteAnomalies();
			await appendWriteAudit("rename", void 0, await deps.fs.promises.stat(configPath).catch(() => null));
			return {
				persistedHash: nextHash,
				persistedConfig: stampedOutputConfig
			};
		} catch (err) {
			if (!configCommitted) rollbackShippedPluginInstallConfigWriteMigration(pluginInstallConfigMigration);
			await appendWriteAudit("failed", err);
			throw err;
		}
	}
	return {
		configPath,
		loadConfig,
		readBestEffortConfig,
		readSourceConfigBestEffort,
		readConfigFileSnapshot,
		readConfigFileSnapshotWithPluginMetadata,
		readConfigFileSnapshotForWrite,
		promoteConfigSnapshotToLastKnownGood,
		recoverConfigFromLastKnownGood,
		recoverConfigFromJsonRootSuffix,
		writeConfigFile
	};
}
const AUTO_OWNER_DISPLAY_SECRET_BY_PATH = /* @__PURE__ */ new Map();
const AUTO_OWNER_DISPLAY_SECRET_PERSIST_IN_FLIGHT = /* @__PURE__ */ new Set();
const AUTO_OWNER_DISPLAY_SECRET_PERSIST_WARNED = /* @__PURE__ */ new Set();
function clearConfigCache() {}
function registerConfigWriteListener(listener) {
	return registerRuntimeConfigWriteListener(listener);
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
	const runtimeConfigSnapshot = getRuntimeConfigSnapshot();
	const runtimeConfigSourceSnapshot = getRuntimeConfigSourceSnapshot();
	if (!runtimeConfigSnapshot || !runtimeConfigSourceSnapshot) return config;
	if (config === runtimeConfigSnapshot) return runtimeConfigSourceSnapshot;
	if (!isCompatibleTopLevelRuntimeProjectionShape({
		runtimeSnapshot: runtimeConfigSnapshot,
		candidate: config
	})) return config;
	return coerceConfig(applyMergePatch(coerceConfig(projectSourceOntoRuntimeShape(runtimeConfigSourceSnapshot, runtimeConfigSnapshot)), createMergePatch(runtimeConfigSnapshot, config)));
}
function loadConfig() {
	return loadPinnedRuntimeConfig(() => createConfigIO().loadConfig());
}
function getRuntimeConfig() {
	return loadConfig();
}
async function readBestEffortConfig() {
	return await createConfigIO().readBestEffortConfig();
}
async function readSourceConfigBestEffort() {
	return await createConfigIO().readSourceConfigBestEffort();
}
async function readConfigFileSnapshot(options) {
	return await createConfigIO(options?.measure ? { measure: options.measure } : {}).readConfigFileSnapshot();
}
async function readConfigFileSnapshotWithPluginMetadata(options) {
	return await createConfigIO(options?.measure ? { measure: options.measure } : {}).readConfigFileSnapshotWithPluginMetadata();
}
async function promoteConfigSnapshotToLastKnownGood(snapshot) {
	return await createConfigIO().promoteConfigSnapshotToLastKnownGood(snapshot);
}
async function recoverConfigFromLastKnownGood(params) {
	return await createConfigIO().recoverConfigFromLastKnownGood(params);
}
async function recoverConfigFromJsonRootSuffix(snapshot) {
	return await createConfigIO().recoverConfigFromJsonRootSuffix(snapshot);
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
	const runtimeConfigSnapshot = getRuntimeConfigSnapshot();
	const runtimeConfigSourceSnapshot = getRuntimeConfigSourceSnapshot();
	const hadRuntimeSnapshot = Boolean(runtimeConfigSnapshot);
	const hadBothSnapshots = Boolean(runtimeConfigSnapshot && runtimeConfigSourceSnapshot);
	if (hadBothSnapshots) nextCfg = coerceConfig(applyMergePatch(runtimeConfigSourceSnapshot, createMergePatch(runtimeConfigSnapshot, cfg)));
	const writeResult = await io.writeConfigFile(nextCfg, {
		envSnapshotForRestore: resolveWriteEnvSnapshotForPath({
			actualConfigPath: io.configPath,
			expectedConfigPath: options.expectedConfigPath,
			envSnapshotForRestore: options.envSnapshotForRestore
		}),
		unsetPaths: resolveManagedUnsetPathsForWrite(options.unsetPaths),
		allowDestructiveWrite: options.allowDestructiveWrite,
		skipRuntimeSnapshotRefresh: options.skipRuntimeSnapshotRefresh,
		skipOutputLogs: options.skipOutputLogs
	});
	if (options.skipRuntimeSnapshotRefresh && !hadRuntimeSnapshot && !getRuntimeConfigSnapshotRefreshHandler()) return;
	const notifyCommittedWrite = () => {
		const currentRuntimeConfig = getRuntimeConfigSnapshot();
		if (!currentRuntimeConfig) return;
		notifyRuntimeConfigWriteListeners(createRuntimeConfigWriteNotification({
			configPath: io.configPath,
			sourceConfig: nextCfg,
			runtimeConfig: currentRuntimeConfig,
			persistedHash: writeResult.persistedHash,
			afterWrite: options.afterWrite
		}));
	};
	await finalizeRuntimeSnapshotWrite({
		nextSourceConfig: nextCfg,
		hadRuntimeSnapshot,
		hadBothSnapshots,
		loadFreshConfig: () => io.loadConfig(),
		notifyCommittedWrite,
		formatRefreshError: (error) => formatErrorMessage(error),
		createRefreshError: (detail, cause) => new ConfigRuntimeRefreshError(`Config was written to ${io.configPath}, but runtime snapshot refresh failed: ${detail}`, { cause })
	});
}
//#endregion
export { shouldEnableShellEnvFallback as $, GENERATED_BUNDLED_CHANNEL_CONFIG_METADATA as A, findLegacyConfigIssues as B, collectUnsupportedSecretRefPolicyIssues as C, validateConfigObjectWithPlugins as D, validateConfigObjectRawWithPlugins as E, setConfigOverride as F, createInvalidConfigError as G, resolveManagedUnsetPathsForWrite as H, unsetConfigOverride as I, isPluginMetadataSnapshotCompatible as J, formatInvalidConfigDetails as K, asResolvedSourceConfig as L, applyConfigOverrides as M, getConfigOverrides as N, collectChannelSchemaMetadata as O, resetConfigOverrides as P, resolveShellEnvFallbackTimeoutMs as Q, asRuntimeConfig as R, shouldWarnOnTouchedVersion as S, validateConfigObjectRaw as T, isPluginLocalInvalidConfigSnapshot as U, applyUnsetPathsForWrite as V, shouldAttemptLastKnownGoodRecovery as W, getShellEnvAppliedKeys as X, loadPluginMetadataSnapshot as Y, getShellPathFromLoginShell as Z, recoverConfigFromLastKnownGood as _, loadConfig as a, isLegacyModelsAddCodexMetadataModel as at, writeConfigFile as b, promoteConfigSnapshotToLastKnownGood as c, listLegacyRuntimeModelProviderAliases as ct, readConfigFileSnapshotForWrite as d, applyChannelDoctorCompatibilityMigrations as dt, normalizeBaseCompatibilityConfigValues as et, readConfigFileSnapshotWithPluginMetadata as f, recoverConfigFromJsonRootSuffix as g, readSourceConfigSnapshotForWrite as h, getRuntimeConfig as i, resolveBundledProviderPolicySurface as it, migrateLegacySecretRefEnvMarkers as j, collectPluginSchemaMetadata as k, readBestEffortConfig as l, resolveCliRuntimeExecutionProvider as lt, readSourceConfigSnapshot as m, clearConfigCache as n, normalizeLegacyOpenAICodexModelsAddMetadata as nt, parseConfigJson5 as o, isCliRuntimeAlias as ot, readSourceConfigBestEffort as p, maintainConfigBackups as q, createConfigIO as r, normalizeGoogleApiBaseUrl as rt, projectConfigOntoRuntimeSourceSnapshot as s, isLegacyRuntimeModelProvider as st, ConfigRuntimeRefreshError as t, normalizeLegacyCommandsConfig as tt, readConfigFileSnapshot as u, applyLegacyDoctorMigrations as ut, registerConfigWriteListener as v, validateConfigObject as w, normalizeOpenClawVersionBase as x, resolveConfigSnapshotHash as y, materializeRuntimeConfig as z };
