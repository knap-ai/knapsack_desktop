import { a as normalizeLowercaseStringOrEmpty, c as normalizeOptionalString$1, s as normalizeOptionalLowercaseString } from "./string-coerce-Bje8XVt9.js";
import { _ as resolveStateDir } from "./paths-B2cMK-wd.js";
import { x as isPlainObject$1 } from "./utils-DvkbxKCZ.js";
import { s as resolveRuntimeServiceVersion } from "./version-vQIvyCe_.js";
import { c as normalizeAgentId, o as classifySessionKeyShape, s as isValidAgentId } from "./session-key-hxP9B3Or.js";
import { W as shouldAttemptLastKnownGoodRecovery } from "./io-CFdEhZuM.js";
import { i as readJsonFile, n as createAsyncLock, o as writeJsonAtomic } from "./json-files-C6eUYM9r.js";
import { r as listChannelPlugins } from "./registry-yTN80EXi.js";
import { m as resolveConfigWriteFollowUp } from "./runtime-snapshot-DLisEE8Y.js";
import "./config--k_1dtUP.js";
import { i as isNodeRoleMethod } from "./method-scopes-D2ZEhvQU.js";
import { n as formatConfigIssueLines } from "./issue-format-DUq-EpQO.js";
import { n as pickBestEffortPrimaryLanIPv4 } from "./network-discovery-display-DqVTbCC2.js";
import "./plugins-D-K4uCVI.js";
import { a as getActivePluginRegistry, n as getActivePluginChannelRegistryVersion, s as getActivePluginRegistryVersion } from "./runtime-Df1Zlb_-.js";
import { t as bumpSkillsSnapshotVersion } from "./refresh-state-CW2abCyT.js";
import path from "node:path";
import os from "node:os";
import { spawnSync } from "node:child_process";
import { isDeepStrictEqual } from "node:util";
import chokidar from "chokidar";
//#region src/gateway/control-plane-rate-limit.ts
const CONTROL_PLANE_RATE_LIMIT_MAX_REQUESTS = 3;
const CONTROL_PLANE_RATE_LIMIT_WINDOW_MS = 6e4;
const CONTROL_PLANE_BUCKET_MAX_STALE_MS = 5 * 6e4;
/** Hard cap to prevent memory DoS from rapid unique-key injection (CWE-400). */
const CONTROL_PLANE_BUCKET_MAX_ENTRIES = 1e4;
const controlPlaneBuckets = /* @__PURE__ */ new Map();
function normalizePart(value, fallback) {
	if (typeof value !== "string") return fallback;
	const normalized = value.trim();
	return normalized.length > 0 ? normalized : fallback;
}
function resolveControlPlaneRateLimitKey(client) {
	const deviceId = normalizePart(client?.connect?.device?.id, "unknown-device");
	const clientIp = normalizePart(client?.clientIp, "unknown-ip");
	if (deviceId === "unknown-device" && clientIp === "unknown-ip") {
		const connId = normalizePart(client?.connId, "");
		if (connId) return `${deviceId}|${clientIp}|conn=${connId}`;
	}
	return `${deviceId}|${clientIp}`;
}
function consumeControlPlaneWriteBudget(params) {
	const nowMs = params.nowMs ?? Date.now();
	const key = resolveControlPlaneRateLimitKey(params.client);
	const bucket = controlPlaneBuckets.get(key);
	if (!bucket || nowMs - bucket.windowStartMs >= CONTROL_PLANE_RATE_LIMIT_WINDOW_MS) {
		if (!controlPlaneBuckets.has(key) && controlPlaneBuckets.size >= CONTROL_PLANE_BUCKET_MAX_ENTRIES) {
			const oldest = controlPlaneBuckets.keys().next().value;
			if (oldest !== void 0) controlPlaneBuckets.delete(oldest);
		}
		controlPlaneBuckets.set(key, {
			count: 1,
			windowStartMs: nowMs
		});
		return {
			allowed: true,
			retryAfterMs: 0,
			remaining: CONTROL_PLANE_RATE_LIMIT_MAX_REQUESTS - 1,
			key
		};
	}
	if (bucket.count >= CONTROL_PLANE_RATE_LIMIT_MAX_REQUESTS) return {
		allowed: false,
		retryAfterMs: Math.max(0, bucket.windowStartMs + CONTROL_PLANE_RATE_LIMIT_WINDOW_MS - nowMs),
		remaining: 0,
		key
	};
	bucket.count += 1;
	return {
		allowed: true,
		retryAfterMs: 0,
		remaining: Math.max(0, CONTROL_PLANE_RATE_LIMIT_MAX_REQUESTS - bucket.count),
		key
	};
}
/**
* Remove buckets whose rate-limit window expired more than
* CONTROL_PLANE_BUCKET_MAX_STALE_MS ago.  Called periodically
* by the gateway maintenance timer to prevent unbounded growth.
*/
function pruneStaleControlPlaneBuckets(nowMs = Date.now()) {
	let pruned = 0;
	for (const [key, bucket] of controlPlaneBuckets) if (nowMs - bucket.windowStartMs > CONTROL_PLANE_BUCKET_MAX_STALE_MS) {
		controlPlaneBuckets.delete(key);
		pruned += 1;
	}
	return pruned;
}
//#endregion
//#region src/gateway/role-policy.ts
function parseGatewayRole(roleRaw) {
	if (roleRaw === "operator" || roleRaw === "node") return roleRaw;
	return null;
}
function roleCanSkipDeviceIdentity(role, sharedAuthOk) {
	return role === "operator" && sharedAuthOk;
}
function isRoleAuthorizedForMethod(role, method) {
	if (isNodeRoleMethod(method)) return role === "node";
	return role === "operator";
}
//#endregion
//#region src/infra/voicewake-routing.ts
const MAX_VOICEWAKE_ROUTES = 32;
const MAX_VOICEWAKE_TRIGGER_LENGTH = 64;
const DEFAULT_ROUTING = {
	version: 1,
	defaultTarget: { mode: "current" },
	routes: [],
	updatedAtMs: 0
};
function resolvePath$1(baseDir) {
	const root = baseDir ?? resolveStateDir();
	return path.join(root, "settings", "voicewake-routing.json");
}
function normalizeVoiceWakeTriggerWord(value) {
	return value.toLowerCase().split(/\s+/).map((token) => token.replace(/^[\p{P}\p{S}]+|[\p{P}\p{S}]+$/gu, "")).filter(Boolean).join(" ");
}
function normalizeOptionalString(value) {
	if (typeof value !== "string") return;
	const trimmed = value.trim();
	return trimmed ? trimmed : void 0;
}
function normalizeRouteTarget(value) {
	if (!value || typeof value !== "object") return null;
	const rec = value;
	if (normalizeOptionalString(rec.mode) === "current") return { mode: "current" };
	const agentId = normalizeOptionalString(rec.agentId);
	const sessionKey = normalizeOptionalString(rec.sessionKey);
	if (agentId && !sessionKey) return { agentId: normalizeAgentId(agentId) };
	if (sessionKey && !agentId) return { sessionKey };
	return null;
}
function normalizeRouteRule(value) {
	if (!value || typeof value !== "object") return null;
	const rec = value;
	const triggerRaw = normalizeOptionalString(rec.trigger);
	if (!triggerRaw) return null;
	const trigger = normalizeVoiceWakeTriggerWord(triggerRaw);
	if (!trigger) return null;
	const target = normalizeRouteTarget(rec.target);
	if (!target) return null;
	return {
		trigger,
		target
	};
}
function isCanonicalAgentSessionKey(value) {
	const trimmed = value.trim();
	if (classifySessionKeyShape(trimmed) !== "agent") return false;
	return !trimmed.split(":").some((part) => part.length === 0);
}
function isPlainObject(value) {
	return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function validateRouteTargetInput(value, label) {
	if (!isPlainObject(value)) return {
		ok: false,
		message: `${label} must be an object`
	};
	const rec = value;
	const mode = normalizeOptionalString(rec.mode);
	const agentId = normalizeOptionalString(rec.agentId);
	const sessionKey = normalizeOptionalString(rec.sessionKey);
	if (mode !== void 0) {
		if (mode !== "current") return {
			ok: false,
			message: `${label}.mode must be "current" when provided`
		};
		if (agentId !== void 0 || sessionKey !== void 0) return {
			ok: false,
			message: `${label} cannot mix mode with agentId or sessionKey`
		};
		return { ok: true };
	}
	if (agentId !== void 0 && sessionKey !== void 0) return {
		ok: false,
		message: `${label} cannot include both agentId and sessionKey`
	};
	if (agentId !== void 0) {
		if (!isValidAgentId(agentId)) return {
			ok: false,
			message: `${label}.agentId must be a valid agent id`
		};
		return { ok: true };
	}
	if (sessionKey !== void 0) {
		if (!isCanonicalAgentSessionKey(sessionKey)) return {
			ok: false,
			message: `${label}.sessionKey must be a canonical agent session key`
		};
		return { ok: true };
	}
	return {
		ok: false,
		message: `${label} must include mode, agentId, or sessionKey`
	};
}
function validateVoiceWakeRoutingConfigInput(input) {
	if (!isPlainObject(input)) return {
		ok: false,
		message: "config must be an object"
	};
	const rec = input;
	if (rec.defaultTarget !== void 0) {
		const validatedDefaultTarget = validateRouteTargetInput(rec.defaultTarget, "config.defaultTarget");
		if (!validatedDefaultTarget.ok) return validatedDefaultTarget;
	}
	if (rec.routes !== void 0 && !Array.isArray(rec.routes)) return {
		ok: false,
		message: "config.routes must be an array"
	};
	if (Array.isArray(rec.routes)) {
		if (rec.routes.length > MAX_VOICEWAKE_ROUTES) return {
			ok: false,
			message: `config.routes must contain at most ${MAX_VOICEWAKE_ROUTES} entries`
		};
		const normalizedTriggers = /* @__PURE__ */ new Map();
		for (const [index, route] of rec.routes.entries()) {
			if (!isPlainObject(route)) return {
				ok: false,
				message: `config.routes[${index}] must be an object`
			};
			const trigger = normalizeOptionalString(route.trigger);
			const normalizedTrigger = trigger ? normalizeVoiceWakeTriggerWord(trigger) : "";
			if (!trigger || !normalizedTrigger) return {
				ok: false,
				message: `config.routes[${index}].trigger must be a non-empty string`
			};
			if (trigger.length > MAX_VOICEWAKE_TRIGGER_LENGTH) return {
				ok: false,
				message: `config.routes[${index}].trigger must be at most ${MAX_VOICEWAKE_TRIGGER_LENGTH} characters`
			};
			const duplicateIndex = normalizedTriggers.get(normalizedTrigger);
			if (duplicateIndex !== void 0) return {
				ok: false,
				message: `config.routes[${index}].trigger duplicates config.routes[${duplicateIndex}].trigger after normalization`
			};
			normalizedTriggers.set(normalizedTrigger, index);
			const validatedTarget = validateRouteTargetInput(route.target, `config.routes[${index}].target`);
			if (!validatedTarget.ok) return validatedTarget;
		}
	}
	return { ok: true };
}
function normalizeVoiceWakeRoutingConfig(input) {
	if (!input || typeof input !== "object") return { ...DEFAULT_ROUTING };
	const rec = input;
	return {
		version: 1,
		defaultTarget: normalizeRouteTarget(rec.defaultTarget) ?? { mode: "current" },
		routes: Array.isArray(rec.routes) ? rec.routes.map((entry) => normalizeRouteRule(entry)).filter((entry) => Boolean(entry)) : [],
		updatedAtMs: typeof rec.updatedAtMs === "number" && Number.isFinite(rec.updatedAtMs) && rec.updatedAtMs > 0 ? Math.floor(rec.updatedAtMs) : 0
	};
}
const withLock$1 = createAsyncLock();
async function loadVoiceWakeRoutingConfig(baseDir) {
	const existing = await readJsonFile(resolvePath$1(baseDir));
	if (!existing) return { ...DEFAULT_ROUTING };
	return normalizeVoiceWakeRoutingConfig(existing);
}
async function setVoiceWakeRoutingConfig(config, baseDir) {
	const normalized = normalizeVoiceWakeRoutingConfig(config);
	const filePath = resolvePath$1(baseDir);
	return await withLock$1(async () => {
		const next = {
			...normalized,
			updatedAtMs: Date.now()
		};
		await writeJsonAtomic(filePath, next);
		return next;
	});
}
function resolveVoiceWakeRouteTarget(routeTarget) {
	if (!routeTarget || "mode" in routeTarget && routeTarget.mode === "current") return { mode: "current" };
	if ("agentId" in routeTarget && routeTarget.agentId) return { agentId: routeTarget.agentId };
	if ("sessionKey" in routeTarget && routeTarget.sessionKey) return { sessionKey: routeTarget.sessionKey };
	return { mode: "current" };
}
function resolveVoiceWakeRouteByTrigger(params) {
	const normalizedTrigger = normalizeOptionalString(params.trigger) ? normalizeVoiceWakeTriggerWord(params.trigger) : "";
	if (normalizedTrigger) {
		const matched = params.config.routes.find((route) => route.trigger === normalizedTrigger);
		if (matched) return resolveVoiceWakeRouteTarget(matched.target);
	}
	return resolveVoiceWakeRouteTarget(params.config.defaultTarget);
}
//#endregion
//#region src/gateway/config-reload-plan.ts
const BASE_RELOAD_RULES = [
	{
		prefix: "gateway.remote",
		kind: "none"
	},
	{
		prefix: "gateway.reload",
		kind: "none"
	},
	{
		prefix: "gateway.channelHealthCheckMinutes",
		kind: "hot",
		actions: ["restart-health-monitor"]
	},
	{
		prefix: "gateway.channelStaleEventThresholdMinutes",
		kind: "hot",
		actions: ["restart-health-monitor"]
	},
	{
		prefix: "gateway.channelMaxRestartsPerHour",
		kind: "hot",
		actions: ["restart-health-monitor"]
	},
	{
		prefix: "diagnostics.stuckSessionWarnMs",
		kind: "none"
	},
	{
		prefix: "hooks.gmail",
		kind: "hot",
		actions: ["restart-gmail-watcher"]
	},
	{
		prefix: "hooks",
		kind: "hot",
		actions: ["reload-hooks"]
	},
	{
		prefix: "agents.defaults.heartbeat",
		kind: "hot",
		actions: ["restart-heartbeat"]
	},
	{
		prefix: "agents.defaults.models",
		kind: "hot",
		actions: ["restart-heartbeat"]
	},
	{
		prefix: "agents.defaults.model",
		kind: "hot",
		actions: ["restart-heartbeat"]
	},
	{
		prefix: "models",
		kind: "hot",
		actions: ["restart-heartbeat"]
	},
	{
		prefix: "agents.list",
		kind: "hot",
		actions: ["restart-heartbeat"]
	},
	{
		prefix: "agent.heartbeat",
		kind: "hot",
		actions: ["restart-heartbeat"]
	},
	{
		prefix: "cron",
		kind: "hot",
		actions: ["restart-cron"]
	},
	{
		prefix: "mcp",
		kind: "hot",
		actions: ["dispose-mcp-runtimes"]
	}
];
const BASE_RELOAD_RULES_TAIL = [
	{
		prefix: "meta",
		kind: "none"
	},
	{
		prefix: "identity",
		kind: "none"
	},
	{
		prefix: "wizard",
		kind: "none"
	},
	{
		prefix: "logging",
		kind: "none"
	},
	{
		prefix: "agents",
		kind: "none"
	},
	{
		prefix: "tools",
		kind: "none"
	},
	{
		prefix: "bindings",
		kind: "none"
	},
	{
		prefix: "audio",
		kind: "none"
	},
	{
		prefix: "agent",
		kind: "none"
	},
	{
		prefix: "routing",
		kind: "none"
	},
	{
		prefix: "messages",
		kind: "none"
	},
	{
		prefix: "session",
		kind: "none"
	},
	{
		prefix: "talk",
		kind: "none"
	},
	{
		prefix: "skills",
		kind: "none"
	},
	{
		prefix: "secrets",
		kind: "none"
	},
	{
		prefix: "plugins",
		kind: "restart"
	},
	{
		prefix: "ui",
		kind: "none"
	},
	{
		prefix: "gateway",
		kind: "restart"
	},
	{
		prefix: "discovery",
		kind: "restart"
	},
	{
		prefix: "canvasHost",
		kind: "restart"
	}
];
let cachedReloadRules = null;
let cachedRegistry = null;
let cachedActiveRegistryVersion = -1;
let cachedChannelRegistryVersion = -1;
function listReloadRules() {
	const registry = getActivePluginRegistry();
	const activeRegistryVersion = getActivePluginRegistryVersion();
	const channelRegistryVersion = getActivePluginChannelRegistryVersion();
	if (registry !== cachedRegistry || activeRegistryVersion !== cachedActiveRegistryVersion || channelRegistryVersion !== cachedChannelRegistryVersion) {
		cachedReloadRules = null;
		cachedRegistry = registry;
		cachedActiveRegistryVersion = activeRegistryVersion;
		cachedChannelRegistryVersion = channelRegistryVersion;
	}
	if (cachedReloadRules) return cachedReloadRules;
	const channelReloadRules = listChannelPlugins().flatMap((plugin) => (plugin.reload?.configPrefixes ?? []).map((prefix) => ({
		prefix,
		kind: "hot",
		actions: [`restart-channel:${plugin.id}`]
	})).concat((plugin.reload?.noopPrefixes ?? []).map((prefix) => ({
		prefix,
		kind: "none"
	}))));
	const pluginReloadRules = (registry?.reloads ?? []).flatMap((entry) => (entry.registration.restartPrefixes ?? []).map((prefix) => ({
		prefix,
		kind: "restart"
	})).concat((entry.registration.hotPrefixes ?? []).map((prefix) => ({
		prefix,
		kind: "hot"
	})), (entry.registration.noopPrefixes ?? []).map((prefix) => ({
		prefix,
		kind: "none"
	}))));
	const rules = [
		...BASE_RELOAD_RULES,
		...pluginReloadRules,
		...channelReloadRules,
		...BASE_RELOAD_RULES_TAIL
	];
	cachedReloadRules = rules;
	return rules;
}
function matchRule(path) {
	for (const rule of listReloadRules()) if (path === rule.prefix || path.startsWith(`${rule.prefix}.`)) return rule;
	return null;
}
function isPluginInstallTimestampPath(path) {
	return /^plugins\.installs\..+\.(installedAt|resolvedAt)$/.test(path);
}
function getPluginInstallRecords(config) {
	if (!isPlainObject$1(config)) return {};
	const plugins = config.plugins;
	if (!isPlainObject$1(plugins)) return {};
	const installs = plugins.installs;
	return isPlainObject$1(installs) ? installs : {};
}
function listPluginInstallTimestampMetadataPaths(prevConfig, nextConfig) {
	const prevInstalls = getPluginInstallRecords(prevConfig);
	const nextInstalls = getPluginInstallRecords(nextConfig);
	const ids = new Set([...Object.keys(prevInstalls), ...Object.keys(nextInstalls)]);
	const paths = [];
	for (const id of ids) {
		const prevRecord = prevInstalls[id];
		const nextRecord = nextInstalls[id];
		if (!isPlainObject$1(prevRecord) || !isPlainObject$1(nextRecord)) continue;
		for (const key of ["installedAt", "resolvedAt"]) if (prevRecord[key] !== nextRecord[key]) paths.push(`plugins.installs.${id}.${key}`);
	}
	return paths;
}
function listPluginInstallWholeRecordPaths(prevConfig, nextConfig) {
	const prevInstalls = getPluginInstallRecords(prevConfig);
	const nextInstalls = getPluginInstallRecords(nextConfig);
	const ids = new Set([...Object.keys(prevInstalls), ...Object.keys(nextInstalls)]);
	const paths = [];
	for (const id of ids) {
		const prevRecord = prevInstalls[id];
		const nextRecord = nextInstalls[id];
		if (!isPlainObject$1(prevRecord) || !isPlainObject$1(nextRecord)) paths.push(`plugins.installs.${id}`);
	}
	return paths;
}
function buildGatewayReloadPlan(changedPaths, options = {}) {
	const noopPaths = new Set(options.noopPaths);
	const forceChangedPaths = new Set(options.forceChangedPaths);
	const plan = {
		changedPaths,
		restartGateway: false,
		restartReasons: [],
		hotReasons: [],
		reloadHooks: false,
		restartGmailWatcher: false,
		restartCron: false,
		restartHeartbeat: false,
		restartHealthMonitor: false,
		restartChannels: /* @__PURE__ */ new Set(),
		disposeMcpRuntimes: false,
		noopPaths: []
	};
	const applyAction = (action) => {
		if (action.startsWith("restart-channel:")) {
			const channel = action.slice(16);
			plan.restartChannels.add(channel);
			return;
		}
		switch (action) {
			case "reload-hooks":
				plan.reloadHooks = true;
				break;
			case "restart-gmail-watcher":
				plan.restartGmailWatcher = true;
				break;
			case "restart-cron":
				plan.restartCron = true;
				break;
			case "restart-heartbeat":
				plan.restartHeartbeat = true;
				break;
			case "restart-health-monitor":
				plan.restartHealthMonitor = true;
				break;
			case "dispose-mcp-runtimes":
				plan.disposeMcpRuntimes = true;
				break;
			default: break;
		}
	};
	for (const path of changedPaths) {
		if (!forceChangedPaths.has(path) && (noopPaths.size > 0 ? noopPaths.has(path) : isPluginInstallTimestampPath(path))) {
			plan.noopPaths.push(path);
			continue;
		}
		const rule = matchRule(path);
		if (!rule) {
			plan.restartGateway = true;
			plan.restartReasons.push(path);
			continue;
		}
		if (rule.kind === "restart") {
			plan.restartGateway = true;
			plan.restartReasons.push(path);
			continue;
		}
		if (rule.kind === "none") {
			plan.noopPaths.push(path);
			continue;
		}
		plan.hotReasons.push(path);
		for (const action of rule.actions ?? []) applyAction(action);
	}
	if (plan.restartGmailWatcher) plan.reloadHooks = true;
	return plan;
}
//#endregion
//#region src/gateway/config-reload.ts
const DEFAULT_RELOAD_SETTINGS = {
	mode: "hybrid",
	debounceMs: 300
};
const MISSING_CONFIG_RETRY_DELAY_MS = 150;
const MISSING_CONFIG_MAX_RETRIES = 2;
/**
* Paths under `skills.*` always change the snapshot that sessions cache in
* sessions.json. Any prefix match here (for example `skills.allowBundled`,
* `skills.entries.X.enabled`, `skills.profile`) forces sessions to rebuild
* their snapshot on the next turn rather than silently advertising stale
* tools to the model.
*/
const SKILLS_INVALIDATION_PREFIXES = ["skills"];
function matchesSkillsInvalidationPrefix(path) {
	return SKILLS_INVALIDATION_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}.`));
}
function firstSkillsChangedPath(changedPaths) {
	return changedPaths.find(matchesSkillsInvalidationPrefix);
}
function isNoopReloadPlan(plan) {
	return !plan.restartGateway && plan.hotReasons.length === 0 && !plan.reloadHooks && !plan.restartGmailWatcher && !plan.restartCron && !plan.restartHeartbeat && !plan.restartHealthMonitor && !plan.disposeMcpRuntimes && plan.restartChannels.size === 0;
}
function diffConfigPaths(prev, next, prefix = "") {
	if (prev === next) return [];
	if (isPlainObject$1(prev) && isPlainObject$1(next)) {
		const keys = new Set([...Object.keys(prev), ...Object.keys(next)]);
		const paths = [];
		for (const key of keys) {
			const prevValue = prev[key];
			const nextValue = next[key];
			if (prevValue === void 0 && nextValue === void 0) continue;
			const childPaths = diffConfigPaths(prevValue, nextValue, prefix ? `${prefix}.${key}` : key);
			if (childPaths.length > 0) paths.push(...childPaths);
		}
		return paths;
	}
	if (Array.isArray(prev) && Array.isArray(next)) {
		if (isDeepStrictEqual(prev, next)) return [];
	}
	return [prefix || "<root>"];
}
function resolveGatewayReloadSettings(cfg) {
	const rawMode = cfg.gateway?.reload?.mode;
	const mode = rawMode === "off" || rawMode === "restart" || rawMode === "hot" || rawMode === "hybrid" ? rawMode : DEFAULT_RELOAD_SETTINGS.mode;
	const debounceRaw = cfg.gateway?.reload?.debounceMs;
	return {
		mode,
		debounceMs: typeof debounceRaw === "number" && Number.isFinite(debounceRaw) ? Math.max(0, Math.floor(debounceRaw)) : DEFAULT_RELOAD_SETTINGS.debounceMs
	};
}
function startGatewayConfigReloader(opts) {
	let currentConfig = opts.initialConfig;
	let currentCompareConfig = opts.initialCompareConfig ?? opts.initialConfig;
	let settings = resolveGatewayReloadSettings(currentConfig);
	let debounceTimer = null;
	let pending = false;
	let running = false;
	let stopped = false;
	let restartQueued = false;
	let missingConfigRetries = 0;
	let pendingInProcessConfig = null;
	let lastAppliedWriteHash = opts.initialInternalWriteHash ?? null;
	const scheduleAfter = (wait) => {
		if (stopped) return;
		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			runReload();
		}, wait);
	};
	const schedule = () => {
		scheduleAfter(settings.debounceMs);
	};
	const queueRestart = (plan, nextConfig) => {
		if (restartQueued) return;
		restartQueued = true;
		(async () => {
			try {
				await opts.onRestart(plan, nextConfig);
			} catch (err) {
				restartQueued = false;
				opts.log.error(`config restart failed: ${String(err)}`);
			}
		})();
	};
	const handleMissingSnapshot = (snapshot) => {
		if (snapshot.exists) {
			missingConfigRetries = 0;
			return false;
		}
		if (missingConfigRetries < MISSING_CONFIG_MAX_RETRIES) {
			missingConfigRetries += 1;
			opts.log.info(`config reload retry (${missingConfigRetries}/${MISSING_CONFIG_MAX_RETRIES}): config file not found`);
			scheduleAfter(MISSING_CONFIG_RETRY_DELAY_MS);
			return true;
		}
		opts.log.warn("config reload skipped (config file not found)");
		return true;
	};
	const handleInvalidSnapshot = (snapshot) => {
		if (snapshot.valid) return false;
		const issues = formatConfigIssueLines(snapshot.issues, "").join(", ");
		opts.log.warn(`config reload skipped (invalid config): ${issues}`);
		return true;
	};
	const recoverAndReadSnapshot = async (snapshot, reason) => {
		if (!opts.recoverSnapshot) return null;
		if (!shouldAttemptLastKnownGoodRecovery(snapshot)) {
			opts.log.warn(`config reload recovery skipped after ${reason}: invalidity is scoped to plugin entries`);
			return null;
		}
		if (!await opts.recoverSnapshot(snapshot, reason)) return null;
		opts.log.warn(`config reload restored last-known-good config after ${reason}`);
		const nextSnapshot = await opts.readSnapshot();
		if (!nextSnapshot.valid) {
			const issues = formatConfigIssueLines(nextSnapshot.issues, "").join(", ");
			opts.log.warn(`config reload recovery snapshot is invalid: ${issues}`);
			return null;
		}
		try {
			await opts.onRecovered?.({
				reason,
				snapshot,
				recoveredSnapshot: nextSnapshot
			});
		} catch (err) {
			opts.log.warn(`config reload recovery notice failed: ${String(err)}`);
		}
		return nextSnapshot;
	};
	const applySnapshot = async (nextConfig, nextCompareConfig, afterWrite) => {
		const changedPaths = diffConfigPaths(currentCompareConfig, nextCompareConfig);
		const pluginInstallTimestampNoopPaths = listPluginInstallTimestampMetadataPaths(currentCompareConfig, nextCompareConfig);
		const pluginInstallWholeRecordPaths = listPluginInstallWholeRecordPaths(currentCompareConfig, nextCompareConfig);
		currentConfig = nextConfig;
		currentCompareConfig = nextCompareConfig;
		settings = resolveGatewayReloadSettings(nextConfig);
		if (changedPaths.length === 0) return;
		const skillsChangedPath = firstSkillsChangedPath(changedPaths);
		if (skillsChangedPath !== void 0) {
			bumpSkillsSnapshotVersion({
				reason: "config-change",
				changedPath: skillsChangedPath
			});
			opts.log.info(`skills snapshot invalidated by config change (${skillsChangedPath})`);
		}
		const followUp = resolveConfigWriteFollowUp(afterWrite);
		opts.log.info(`config change detected; evaluating reload (${changedPaths.join(", ")})`);
		if (followUp.mode === "none") {
			opts.log.info(`config reload skipped by writer intent (${followUp.reason})`);
			return;
		}
		const plan = buildGatewayReloadPlan(changedPaths, {
			noopPaths: pluginInstallTimestampNoopPaths,
			forceChangedPaths: pluginInstallWholeRecordPaths
		});
		if (isNoopReloadPlan(plan) && !followUp.requiresRestart) return;
		if (settings.mode === "off") {
			opts.log.info("config reload disabled (gateway.reload.mode=off)");
			return;
		}
		if (followUp.requiresRestart) {
			queueRestart({
				...plan,
				restartGateway: true,
				restartReasons: [...plan.restartReasons, followUp.reason]
			}, nextConfig);
			return;
		}
		if (settings.mode === "restart") {
			queueRestart(plan, nextConfig);
			return;
		}
		if (plan.restartGateway) {
			if (settings.mode === "hot") {
				opts.log.warn(`config reload requires gateway restart; hot mode ignoring (${plan.restartReasons.join(", ")})`);
				return;
			}
			queueRestart(plan, nextConfig);
			return;
		}
		await opts.onHotReload(plan, nextConfig);
	};
	const promoteAcceptedSnapshot = async (snapshot, reason) => {
		if (!opts.promoteSnapshot || !snapshot.exists || !snapshot.valid) return;
		try {
			await opts.promoteSnapshot(snapshot, reason);
		} catch (err) {
			opts.log.warn(`config reload last-known-good promotion failed: ${String(err)}`);
		}
	};
	const promoteAcceptedInProcessWrite = async (persistedHash) => {
		if (!opts.promoteSnapshot) return;
		try {
			const snapshot = await opts.readSnapshot();
			if (snapshot.hash !== persistedHash || !snapshot.valid) return;
			await promoteAcceptedSnapshot(snapshot, "in-process-write");
		} catch (err) {
			opts.log.warn(`config reload in-process last-known-good promotion failed: ${String(err)}`);
		}
	};
	const runReload = async () => {
		if (stopped) return;
		if (running) {
			pending = true;
			return;
		}
		running = true;
		if (debounceTimer) {
			clearTimeout(debounceTimer);
			debounceTimer = null;
		}
		try {
			if (pendingInProcessConfig) {
				const pendingWrite = pendingInProcessConfig;
				pendingInProcessConfig = null;
				missingConfigRetries = 0;
				await applySnapshot(pendingWrite.config, pendingWrite.compareConfig, pendingWrite.afterWrite);
				await promoteAcceptedInProcessWrite(pendingWrite.persistedHash);
				return;
			}
			let snapshot = await opts.readSnapshot();
			if (lastAppliedWriteHash && typeof snapshot.hash === "string") {
				if (snapshot.hash === lastAppliedWriteHash) return;
				lastAppliedWriteHash = null;
			}
			if (handleMissingSnapshot(snapshot)) return;
			if (!snapshot.valid) {
				const recoveredSnapshot = await recoverAndReadSnapshot(snapshot, "invalid-config");
				if (!recoveredSnapshot) {
					handleInvalidSnapshot(snapshot);
					return;
				}
				snapshot = recoveredSnapshot;
			}
			await applySnapshot(snapshot.config, snapshot.sourceConfig);
			await promoteAcceptedSnapshot(snapshot, "valid-config");
		} catch (err) {
			opts.log.error(`config reload failed: ${String(err)}`);
		} finally {
			running = false;
			if (pending) {
				pending = false;
				schedule();
			}
		}
	};
	const watcher = chokidar.watch(opts.watchPath, {
		ignoreInitial: true,
		awaitWriteFinish: {
			stabilityThreshold: 200,
			pollInterval: 50
		},
		usePolling: Boolean(process.env.VITEST)
	});
	const scheduleFromWatcher = () => {
		schedule();
	};
	const unsubscribeFromWrites = opts.subscribeToWrites?.((event) => {
		if (event.configPath !== opts.watchPath) return;
		pendingInProcessConfig = {
			config: event.runtimeConfig,
			compareConfig: event.sourceConfig,
			persistedHash: event.persistedHash,
			afterWrite: event.afterWrite
		};
		lastAppliedWriteHash = event.persistedHash;
		scheduleAfter(0);
	}) ?? (() => {});
	watcher.on("add", scheduleFromWatcher);
	watcher.on("change", scheduleFromWatcher);
	watcher.on("unlink", scheduleFromWatcher);
	let watcherClosed = false;
	watcher.on("error", (err) => {
		if (watcherClosed) return;
		watcherClosed = true;
		opts.log.warn(`config watcher error: ${String(err)}`);
		watcher.close().catch(() => {});
	});
	return { stop: async () => {
		stopped = true;
		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = null;
		watcherClosed = true;
		unsubscribeFromWrites();
		await watcher.close().catch(() => {});
	} };
}
//#endregion
//#region src/infra/voicewake.ts
const DEFAULT_TRIGGERS = [
	"openclaw",
	"claude",
	"computer"
];
function resolvePath(baseDir) {
	const root = baseDir ?? resolveStateDir();
	return path.join(root, "settings", "voicewake.json");
}
function sanitizeTriggers(triggers) {
	const cleaned = (triggers ?? []).map((w) => normalizeOptionalString$1(w) ?? "").filter((w) => w.length > 0);
	return cleaned.length > 0 ? cleaned : DEFAULT_TRIGGERS;
}
const withLock = createAsyncLock();
function defaultVoiceWakeTriggers() {
	return [...DEFAULT_TRIGGERS];
}
async function loadVoiceWakeConfig(baseDir) {
	const existing = await readJsonFile(resolvePath(baseDir));
	if (!existing) return {
		triggers: defaultVoiceWakeTriggers(),
		updatedAtMs: 0
	};
	return {
		triggers: sanitizeTriggers(existing.triggers),
		updatedAtMs: typeof existing.updatedAtMs === "number" && existing.updatedAtMs > 0 ? existing.updatedAtMs : 0
	};
}
async function setVoiceWakeTriggers(triggers, baseDir) {
	const sanitized = sanitizeTriggers(triggers);
	const filePath = resolvePath(baseDir);
	return await withLock(async () => {
		const next = {
			triggers: sanitized,
			updatedAtMs: Date.now()
		};
		await writeJsonAtomic(filePath, next);
		return next;
	});
}
//#endregion
//#region src/gateway/server-utils.ts
function normalizeVoiceWakeTriggers(input) {
	const cleaned = (Array.isArray(input) ? input : []).map((v) => normalizeOptionalString$1(v)).filter((v) => v !== void 0).slice(0, 32).map((v) => v.slice(0, 64));
	return cleaned.length > 0 ? cleaned : defaultVoiceWakeTriggers();
}
function formatError(err) {
	if (err instanceof Error) return err.message;
	if (typeof err === "string") return err;
	const statusValue = err?.status;
	const codeValue = err?.code;
	if (statusValue !== void 0 || codeValue !== void 0) return `status=${typeof statusValue === "string" || typeof statusValue === "number" ? String(statusValue) : "unknown"} code=${typeof codeValue === "string" || typeof codeValue === "number" ? String(codeValue) : "unknown"}`;
	try {
		return JSON.stringify(err, null, 2);
	} catch {
		return String(err);
	}
}
//#endregion
//#region src/gateway/server-methods/nodes-wake-state.ts
const NODE_WAKE_RECONNECT_WAIT_MS = 3e3;
const NODE_WAKE_RECONNECT_RETRY_WAIT_MS = 12e3;
const nodeWakeById = /* @__PURE__ */ new Map();
const nodeWakeNudgeById = /* @__PURE__ */ new Map();
function clearNodeWakeState(nodeId) {
	nodeWakeById.delete(nodeId);
	nodeWakeNudgeById.delete(nodeId);
}
//#endregion
//#region src/infra/system-presence.ts
const entries = /* @__PURE__ */ new Map();
const TTL_MS = 300 * 1e3;
const MAX_ENTRIES = 200;
function normalizePresenceKey(key) {
	return normalizeOptionalLowercaseString(key);
}
function resolvePrimaryIPv4() {
	return pickBestEffortPrimaryLanIPv4() ?? os.hostname();
}
function initSelfPresence() {
	const host = os.hostname();
	const ip = resolvePrimaryIPv4() ?? void 0;
	const version = resolveRuntimeServiceVersion(process.env);
	const modelIdentifier = (() => {
		if (os.platform() === "darwin") {
			const out = normalizeOptionalString$1(spawnSync("sysctl", ["-n", "hw.model"], { encoding: "utf-8" }).stdout) ?? "";
			return out.length > 0 ? out : void 0;
		}
		return os.arch();
	})();
	const macOSVersion = () => {
		const out = normalizeOptionalString$1(spawnSync("sw_vers", ["-productVersion"], { encoding: "utf-8" }).stdout) ?? "";
		return out.length > 0 ? out : os.release();
	};
	const selfEntry = {
		host,
		ip,
		version,
		platform: (() => {
			const p = os.platform();
			const rel = os.release();
			if (p === "darwin") return `macos ${macOSVersion()}`;
			if (p === "win32") return `windows ${rel}`;
			return `${p} ${rel}`;
		})(),
		deviceFamily: (() => {
			const p = os.platform();
			if (p === "darwin") return "Mac";
			if (p === "win32") return "Windows";
			if (p === "linux") return "Linux";
			return p;
		})(),
		modelIdentifier,
		mode: "gateway",
		reason: "self",
		text: `Gateway: ${host}${ip ? ` (${ip})` : ""} · app ${version} · mode gateway · reason self`,
		ts: Date.now()
	};
	const key = normalizeLowercaseStringOrEmpty(host);
	entries.set(key, selfEntry);
}
function ensureSelfPresence() {
	if (entries.size === 0) initSelfPresence();
}
function touchSelfPresence() {
	const key = normalizeLowercaseStringOrEmpty(os.hostname());
	const existing = entries.get(key);
	if (existing) entries.set(key, {
		...existing,
		ts: Date.now()
	});
	else initSelfPresence();
}
initSelfPresence();
function parsePresence(text) {
	const trimmed = text.trim();
	const match = trimmed.match(/Node:\s*([^ (]+)\s*\(([^)]+)\)\s*·\s*app\s*([^·]+?)\s*·\s*last input\s*([0-9]+)s ago\s*·\s*mode\s*([^·]+?)\s*·\s*reason\s*(.+)$/i);
	if (!match) return {
		text: trimmed,
		ts: Date.now()
	};
	const [, host, ip, version, lastInputStr, mode, reasonRaw] = match;
	const lastInputSeconds = Number.parseInt(lastInputStr, 10);
	const reason = reasonRaw.trim();
	return {
		host: host.trim(),
		ip: ip.trim(),
		version: version.trim(),
		lastInputSeconds: Number.isFinite(lastInputSeconds) ? lastInputSeconds : void 0,
		mode: mode.trim(),
		reason,
		text: trimmed,
		ts: Date.now()
	};
}
function mergeStringList(...values) {
	const out = /* @__PURE__ */ new Set();
	for (const list of values) {
		if (!Array.isArray(list)) continue;
		for (const item of list) {
			const trimmed = normalizeOptionalString$1(item) ?? "";
			if (trimmed) out.add(trimmed);
		}
	}
	return out.size > 0 ? [...out] : void 0;
}
function updateSystemPresence(payload) {
	ensureSelfPresence();
	const parsed = parsePresence(payload.text);
	const key = normalizePresenceKey(payload.deviceId) || normalizePresenceKey(payload.instanceId) || normalizePresenceKey(parsed.instanceId) || normalizePresenceKey(parsed.host) || parsed.ip || parsed.text.slice(0, 64) || normalizeLowercaseStringOrEmpty(os.hostname());
	const hadExisting = entries.has(key);
	const existing = entries.get(key) ?? {};
	const merged = {
		...existing,
		...parsed,
		host: payload.host ?? parsed.host ?? existing.host,
		ip: payload.ip ?? parsed.ip ?? existing.ip,
		version: payload.version ?? parsed.version ?? existing.version,
		platform: payload.platform ?? existing.platform,
		deviceFamily: payload.deviceFamily ?? existing.deviceFamily,
		modelIdentifier: payload.modelIdentifier ?? existing.modelIdentifier,
		mode: payload.mode ?? parsed.mode ?? existing.mode,
		lastInputSeconds: payload.lastInputSeconds ?? parsed.lastInputSeconds ?? existing.lastInputSeconds,
		reason: payload.reason ?? parsed.reason ?? existing.reason,
		deviceId: payload.deviceId ?? existing.deviceId,
		roles: mergeStringList(existing.roles, payload.roles),
		scopes: mergeStringList(existing.scopes, payload.scopes),
		instanceId: payload.instanceId ?? parsed.instanceId ?? existing.instanceId,
		text: payload.text || parsed.text || existing.text,
		ts: Date.now()
	};
	entries.set(key, merged);
	const trackKeys = [
		"host",
		"ip",
		"version",
		"mode",
		"reason"
	];
	const changes = {};
	const changedKeys = [];
	for (const k of trackKeys) {
		const prev = existing[k];
		const next = merged[k];
		if (prev !== next) {
			changes[k] = next;
			changedKeys.push(k);
		}
	}
	return {
		key,
		previous: hadExisting ? existing : void 0,
		next: merged,
		changes,
		changedKeys
	};
}
function upsertPresence(key, presence) {
	ensureSelfPresence();
	const normalizedKey = normalizePresenceKey(key) ?? normalizeLowercaseStringOrEmpty(os.hostname());
	const existing = entries.get(normalizedKey) ?? {};
	const roles = mergeStringList(existing.roles, presence.roles);
	const scopes = mergeStringList(existing.scopes, presence.scopes);
	const merged = {
		...existing,
		...presence,
		roles,
		scopes,
		ts: Date.now(),
		text: presence.text || existing.text || `Node: ${presence.host ?? existing.host ?? "unknown"} · mode ${presence.mode ?? existing.mode ?? "unknown"}`
	};
	entries.set(normalizedKey, merged);
}
function listSystemPresence() {
	ensureSelfPresence();
	const now = Date.now();
	for (const [k, v] of entries) if (now - v.ts > TTL_MS) entries.delete(k);
	if (entries.size > MAX_ENTRIES) {
		const sorted = [...entries.entries()].toSorted((a, b) => a[1].ts - b[1].ts);
		const toDrop = entries.size - MAX_ENTRIES;
		for (let i = 0; i < toDrop; i++) entries.delete(sorted[i][0]);
	}
	touchSelfPresence();
	return [...entries.values()].toSorted((a, b) => b.ts - a.ts);
}
//#endregion
//#region src/gateway/server/presence-events.ts
function broadcastPresenceSnapshot(params) {
	const presenceVersion = params.incrementPresenceVersion();
	params.broadcast("presence", { presence: listSystemPresence() }, {
		dropIfSlow: true,
		stateVersion: {
			presence: presenceVersion,
			health: params.getHealthVersion()
		}
	});
	return presenceVersion;
}
//#endregion
export { isRoleAuthorizedForMethod as C, pruneStaleControlPlaneBuckets as D, consumeControlPlaneWriteBudget as E, validateVoiceWakeRoutingConfigInput as S, roleCanSkipDeviceIdentity as T, buildGatewayReloadPlan as _, NODE_WAKE_RECONNECT_RETRY_WAIT_MS as a, resolveVoiceWakeRouteByTrigger as b, nodeWakeById as c, normalizeVoiceWakeTriggers as d, loadVoiceWakeConfig as f, startGatewayConfigReloader as g, resolveGatewayReloadSettings as h, upsertPresence as i, nodeWakeNudgeById as l, diffConfigPaths as m, listSystemPresence as n, NODE_WAKE_RECONNECT_WAIT_MS as o, setVoiceWakeTriggers as p, updateSystemPresence as r, clearNodeWakeState as s, broadcastPresenceSnapshot as t, formatError as u, loadVoiceWakeRoutingConfig as v, parseGatewayRole as w, setVoiceWakeRoutingConfig as x, normalizeVoiceWakeRoutingConfig as y };
