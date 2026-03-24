import { _ as resolveStateDir } from "./paths-ViKUYWUK.js";
import { n as resolveAgentModelPrimaryValue } from "./model-input-BB2wSAHb.js";
import { T as parseAgentSessionKey, c as normalizeAgentId, l as normalizeMainKey } from "./session-key-DAhnzjyr.js";
import { m as resolveDefaultAgentId, p as resolveAgentWorkspaceDir } from "./agent-scope-bjWqU22i.js";
import { n as DEFAULT_MODEL, r as DEFAULT_PROVIDER } from "./defaults-eEZJg44K.js";
import { o as resolveRuntimeServiceVersion } from "./version-CD3oP1-d.js";
import { i as resolveMainSessionKey } from "./main-session-ClbmrpGK.js";
import { l as resolveStorePath } from "./paths-rhN9LKM_.js";
import { a as resolveFreshSessionTotalTokens } from "./types-BRBQbfEQ.js";
import { n as buildGatewayConnectionDetails } from "./call-CQbSO4Fr.js";
import { r as normalizeControlUiBasePath } from "./control-ui-shared-BBhZvISc.js";
import { n as resolveGatewayService } from "./service-DdJ2Qk7P.js";
import { t as formatRuntimeStatusWithDetails } from "./runtime-status-Hq26O7Ky.js";
import { i as probeGateway } from "./probe-BPU90Y9V.js";
import { r as resolveGatewayProbeAuthSafeWithSecretInputs } from "./probe-auth-dhNhn0B4.js";
import { r as formatDurationPrecise } from "./format-duration-DwyQDycT.js";
import { s as peekSystemEvents } from "./system-events-BU_NYynX.js";
import { a as createLazyRuntimeSurface } from "./lazy-runtime-CPDBPNrj.js";
import { n as hasPotentialConfiguredChannels } from "./config-presence-DA3j8Nmi.js";
import { r as resolveHeartbeatSummaryForAgent } from "./heartbeat-summary-B-oiNNxm.js";
import { t as resolveNodeService } from "./node-service-D4mvvQIK.js";
import fs, { existsSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import os from "node:os";
import fs$1 from "node:fs/promises";
//#region src/commands/gateway-presence.ts
function pickGatewaySelfPresence(presence) {
	if (!Array.isArray(presence)) return null;
	const entries = presence;
	const self = entries.find((e) => e.mode === "gateway" && e.reason === "self") ?? entries.find((e) => typeof e.text === "string" && String(e.text).startsWith("Gateway:")) ?? null;
	if (!self) return null;
	return {
		host: typeof self.host === "string" ? self.host : void 0,
		ip: typeof self.ip === "string" ? self.ip : void 0,
		version: typeof self.version === "string" ? self.version : void 0,
		platform: typeof self.platform === "string" ? self.platform : void 0
	};
}
//#endregion
//#region src/infra/os-summary.ts
function safeTrim(value) {
	return typeof value === "string" ? value.trim() : "";
}
function macosVersion() {
	return safeTrim(spawnSync("sw_vers", ["-productVersion"], { encoding: "utf-8" }).stdout) || os.release();
}
function resolveOsSummary() {
	const platform = os.platform();
	const release = os.release();
	const arch = os.arch();
	return {
		platform,
		arch,
		release,
		label: (() => {
			if (platform === "darwin") return `macos ${macosVersion()} (${arch})`;
			if (platform === "win32") return `windows ${release} (${arch})`;
			return `${platform} ${release} (${arch})`;
		})()
	};
}
//#endregion
//#region src/gateway/agent-list.ts
function listExistingAgentIdsFromDisk() {
	const root = resolveStateDir();
	const agentsDir = path.join(root, "agents");
	try {
		return fs.readdirSync(agentsDir, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => normalizeAgentId(entry.name)).filter(Boolean);
	} catch {
		return [];
	}
}
function listConfiguredAgentIds(cfg) {
	const ids = /* @__PURE__ */ new Set();
	const defaultId = normalizeAgentId(resolveDefaultAgentId(cfg));
	ids.add(defaultId);
	for (const entry of cfg.agents?.list ?? []) if (entry?.id) ids.add(normalizeAgentId(entry.id));
	for (const id of listExistingAgentIdsFromDisk()) ids.add(id);
	const sorted = Array.from(ids).filter(Boolean);
	sorted.sort((a, b) => a.localeCompare(b));
	return sorted.includes(defaultId) ? [defaultId, ...sorted.filter((id) => id !== defaultId)] : sorted;
}
function listGatewayAgentsBasic(cfg) {
	const defaultId = normalizeAgentId(resolveDefaultAgentId(cfg));
	const mainKey = normalizeMainKey(cfg.session?.mainKey);
	const scope = cfg.session?.scope ?? "per-sender";
	const configuredById = /* @__PURE__ */ new Map();
	for (const entry of cfg.agents?.list ?? []) {
		if (!entry?.id) continue;
		configuredById.set(normalizeAgentId(entry.id), { name: typeof entry.name === "string" && entry.name.trim() ? entry.name.trim() : void 0 });
	}
	const explicitIds = new Set((cfg.agents?.list ?? []).map((entry) => entry?.id ? normalizeAgentId(entry.id) : "").filter(Boolean));
	const allowedIds = explicitIds.size > 0 ? new Set([...explicitIds, defaultId]) : null;
	let agentIds = listConfiguredAgentIds(cfg).filter((id) => allowedIds ? allowedIds.has(id) : true);
	if (mainKey && !agentIds.includes(mainKey) && (!allowedIds || allowedIds.has(mainKey))) agentIds = [...agentIds, mainKey];
	return {
		defaultId,
		mainKey,
		scope,
		agents: agentIds.map((id) => {
			return {
				id,
				name: configuredById.get(id)?.name
			};
		})
	};
}
//#endregion
//#region src/commands/status.service-summary.ts
async function readServiceStatusSummary(service, fallbackLabel) {
	try {
		const command = await service.readCommand(process.env).catch(() => null);
		const serviceEnv = command?.environment ? {
			...process.env,
			...command.environment
		} : process.env;
		const [loaded, runtime] = await Promise.all([service.isLoaded({ env: serviceEnv }).catch(() => false), service.readRuntime(serviceEnv).catch(() => void 0)]);
		const managedByOpenClaw = command != null;
		const externallyManaged = !managedByOpenClaw && runtime?.status === "running";
		const installed = managedByOpenClaw || externallyManaged;
		const loadedText = externallyManaged ? "running (externally managed)" : loaded ? service.loadedText : service.notLoadedText;
		return {
			label: service.label,
			installed,
			loaded,
			managedByOpenClaw,
			externallyManaged,
			loadedText,
			runtime
		};
	} catch {
		return {
			label: fallbackLabel,
			installed: null,
			loaded: false,
			managedByOpenClaw: false,
			externallyManaged: false,
			loadedText: "unknown",
			runtime: void 0
		};
	}
}
//#endregion
//#region src/commands/status.format.ts
const formatKTokens = (value) => `${(value / 1e3).toFixed(value >= 1e4 ? 0 : 1)}k`;
const formatDuration = (ms) => {
	if (ms == null || !Number.isFinite(ms)) return "unknown";
	return formatDurationPrecise(ms, { decimals: 1 });
};
const formatTokensCompact = (sess) => {
	const used = sess.totalTokens;
	const ctx = sess.contextTokens;
	const cacheRead = sess.cacheRead;
	const cacheWrite = sess.cacheWrite;
	let result = "";
	if (used == null) result = ctx ? `unknown/${formatKTokens(ctx)} (?%)` : "unknown used";
	else if (!ctx) result = `${formatKTokens(used)} used`;
	else {
		const pctLabel = sess.percentUsed != null ? `${sess.percentUsed}%` : "?%";
		result = `${formatKTokens(used)}/${formatKTokens(ctx)} (${pctLabel})`;
	}
	if (typeof cacheRead === "number" && cacheRead > 0) {
		const total = typeof used === "number" ? used : cacheRead + (typeof cacheWrite === "number" ? cacheWrite : 0);
		const hitRate = Math.round(cacheRead / total * 100);
		result += ` · 🗄️ ${hitRate}% cached`;
	}
	return result;
};
const formatDaemonRuntimeShort = (runtime) => {
	if (!runtime) return null;
	const details = [];
	const detail = runtime.detail?.replace(/\s+/g, " ").trim() || "";
	const noisyLaunchctlDetail = runtime.missingUnit === true && detail.toLowerCase().includes("could not find service");
	if (detail && !noisyLaunchctlDetail) details.push(detail);
	return formatRuntimeStatusWithDetails({
		status: runtime.status,
		pid: runtime.pid,
		state: runtime.state,
		details
	});
};
//#endregion
//#region src/commands/status.daemon.ts
async function buildDaemonStatusSummary(serviceLabel) {
	const summary = await readServiceStatusSummary(serviceLabel === "gateway" ? resolveGatewayService() : resolveNodeService(), serviceLabel === "gateway" ? "Daemon" : "Node");
	return {
		label: summary.label,
		installed: summary.installed,
		managedByOpenClaw: summary.managedByOpenClaw,
		externallyManaged: summary.externallyManaged,
		loadedText: summary.loadedText,
		runtimeShort: formatDaemonRuntimeShort(summary.runtime)
	};
}
async function getDaemonStatusSummary() {
	return await buildDaemonStatusSummary("gateway");
}
async function getNodeDaemonStatusSummary() {
	return await buildDaemonStatusSummary("node");
}
//#endregion
//#region src/config/sessions/store-read.ts
function isSessionStoreRecord(value) {
	return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function readSessionStoreReadOnly(storePath) {
	try {
		const raw = fs.readFileSync(storePath, "utf-8");
		if (!raw.trim()) return {};
		const parsed = JSON.parse(raw);
		return isSessionStoreRecord(parsed) ? parsed : {};
	} catch {
		return {};
	}
}
//#endregion
//#region src/commands/status.agent-local.ts
async function fileExists(p) {
	try {
		await fs$1.access(p);
		return true;
	} catch {
		return false;
	}
}
async function getAgentLocalStatuses(cfg) {
	const agentList = listGatewayAgentsBasic(cfg);
	const now = Date.now();
	const statuses = [];
	for (const agent of agentList.agents) {
		const agentId = agent.id;
		const workspaceDir = (() => {
			try {
				return resolveAgentWorkspaceDir(cfg, agentId);
			} catch {
				return null;
			}
		})();
		const bootstrapPath = workspaceDir != null ? path.join(workspaceDir, "BOOTSTRAP.md") : null;
		const bootstrapPending = bootstrapPath != null ? await fileExists(bootstrapPath) : null;
		const sessionsPath = resolveStorePath(cfg.session?.store, { agentId });
		const store = readSessionStoreReadOnly(sessionsPath);
		const sessions = Object.entries(store).filter(([key]) => key !== "global" && key !== "unknown").map(([, entry]) => entry);
		const sessionsCount = sessions.length;
		const lastUpdatedAt = sessions.reduce((max, e) => Math.max(max, e?.updatedAt ?? 0), 0);
		const resolvedLastUpdatedAt = lastUpdatedAt > 0 ? lastUpdatedAt : null;
		const lastActiveAgeMs = resolvedLastUpdatedAt ? now - resolvedLastUpdatedAt : null;
		statuses.push({
			id: agentId,
			name: agent.name,
			workspaceDir,
			bootstrapPending,
			sessionsPath,
			sessionsCount,
			lastUpdatedAt: resolvedLastUpdatedAt,
			lastActiveAgeMs
		});
	}
	const totalSessions = statuses.reduce((sum, s) => sum + s.sessionsCount, 0);
	const bootstrapPendingCount = statuses.reduce((sum, s) => sum + (s.bootstrapPending ? 1 : 0), 0);
	return {
		defaultId: agentList.defaultId,
		agents: statuses,
		totalSessions,
		bootstrapPendingCount
	};
}
//#endregion
//#region src/commands/status.gateway-probe.ts
async function resolveGatewayProbeAuthResolution(cfg) {
	return resolveGatewayProbeAuthSafeWithSecretInputs({
		cfg,
		mode: cfg.gateway?.mode === "remote" ? "remote" : "local",
		env: process.env
	});
}
//#endregion
//#region src/commands/status.scan.shared.ts
function hasExplicitMemorySearchConfig(cfg, agentId) {
	if (cfg.agents?.defaults && Object.prototype.hasOwnProperty.call(cfg.agents.defaults, "memorySearch")) return true;
	return (Array.isArray(cfg.agents?.list) ? cfg.agents.list : []).some((agent) => agent?.id === agentId && Object.prototype.hasOwnProperty.call(agent, "memorySearch"));
}
function resolveMemoryPluginStatus(cfg) {
	if (!(cfg.plugins?.enabled !== false)) return {
		enabled: false,
		slot: null,
		reason: "plugins disabled"
	};
	const raw = typeof cfg.plugins?.slots?.memory === "string" ? cfg.plugins.slots.memory.trim() : "";
	if (raw && raw.toLowerCase() === "none") return {
		enabled: false,
		slot: null,
		reason: "plugins.slots.memory=\"none\""
	};
	return {
		enabled: true,
		slot: raw || "memory-core"
	};
}
async function resolveGatewayProbeSnapshot(params) {
	const gatewayConnection = buildGatewayConnectionDetails({ config: params.cfg });
	const isRemoteMode = params.cfg.gateway?.mode === "remote";
	const remoteUrlRaw = typeof params.cfg.gateway?.remote?.url === "string" ? params.cfg.gateway.remote.url : "";
	const remoteUrlMissing = isRemoteMode && !remoteUrlRaw.trim();
	const gatewayMode = isRemoteMode ? "remote" : "local";
	const gatewayProbeAuthResolution = await resolveGatewayProbeAuthResolution(params.cfg);
	let gatewayProbeAuthWarning = gatewayProbeAuthResolution.warning;
	const gatewayProbe = remoteUrlMissing ? null : params.opts.skipProbe ? null : await probeGateway({
		url: gatewayConnection.url,
		auth: gatewayProbeAuthResolution.auth,
		timeoutMs: Math.min(params.opts.all ? 5e3 : 2500, params.opts.timeoutMs ?? 1e4),
		detailLevel: "presence"
	}).catch(() => null);
	if (gatewayProbeAuthWarning && gatewayProbe?.ok === false) {
		gatewayProbe.error = gatewayProbe.error ? `${gatewayProbe.error}; ${gatewayProbeAuthWarning}` : gatewayProbeAuthWarning;
		gatewayProbeAuthWarning = void 0;
	}
	return {
		gatewayConnection,
		remoteUrlMissing,
		gatewayMode,
		gatewayProbeAuth: gatewayProbeAuthResolution.auth,
		gatewayProbeAuthWarning,
		gatewayProbe
	};
}
function buildTailscaleHttpsUrl(params) {
	return params.tailscaleMode !== "off" && params.tailscaleDns ? `https://${params.tailscaleDns}${normalizeControlUiBasePath(params.controlUiBasePath)}` : null;
}
async function resolveSharedMemoryStatusSnapshot(params) {
	const { cfg, agentStatus, memoryPlugin } = params;
	if (!memoryPlugin.enabled || memoryPlugin.slot !== "memory-core") return null;
	const agentId = agentStatus.defaultId ?? "main";
	const defaultStorePath = params.requireDefaultStore?.(agentId);
	if (defaultStorePath && !hasExplicitMemorySearchConfig(cfg, agentId) && !existsSync(defaultStorePath)) return null;
	const resolvedMemory = params.resolveMemoryConfig(cfg, agentId);
	if (!resolvedMemory) return null;
	if (!(hasExplicitMemorySearchConfig(cfg, agentId) || existsSync(resolvedMemory.store.path))) return null;
	const { manager } = await params.getMemorySearchManager({
		cfg,
		agentId,
		purpose: "status"
	});
	if (!manager) return null;
	try {
		await manager.probeVectorAvailability();
	} catch {}
	const status = manager.status();
	await manager.close?.().catch(() => {});
	return {
		agentId,
		...status
	};
}
//#endregion
//#region src/commands/status.summary.ts
let channelSummaryModulePromise;
let linkChannelModulePromise;
let configIoModulePromise;
function loadChannelSummaryModule() {
	channelSummaryModulePromise ??= import("./channel-summary-MvyLSOvo.js");
	return channelSummaryModulePromise;
}
function loadLinkChannelModule() {
	linkChannelModulePromise ??= import("./status.link-channel-D5d9dx1P.js");
	return linkChannelModulePromise;
}
const loadStatusSummaryRuntimeModule = createLazyRuntimeSurface(() => import("./status.summary.runtime-D-WsfP9l.js"), ({ statusSummaryRuntime }) => statusSummaryRuntime);
function loadConfigIoModule() {
	configIoModulePromise ??= import("./io-BtFEwxeQ.js");
	return configIoModulePromise;
}
function parseStatusModelRef(raw, defaultProvider) {
	const trimmed = raw.trim();
	if (!trimmed) return null;
	const slash = trimmed.indexOf("/");
	if (slash === -1) return {
		provider: defaultProvider,
		model: trimmed
	};
	const provider = trimmed.slice(0, slash).trim();
	const model = trimmed.slice(slash + 1).trim();
	if (!provider || !model) return null;
	return {
		provider,
		model
	};
}
function resolveConfiguredStatusModelRef(params) {
	const rawModel = resolveAgentModelPrimaryValue(params.cfg.agents?.defaults?.model) ?? "";
	if (rawModel) {
		const trimmed = rawModel.trim();
		const configuredModels = params.cfg.agents?.defaults?.models ?? {};
		if (!trimmed.includes("/")) {
			const aliasKey = trimmed.toLowerCase();
			for (const [modelKey, entry] of Object.entries(configuredModels)) {
				const aliasValue = entry?.alias;
				const alias = typeof aliasValue === "string" ? aliasValue.trim() : "";
				if (!alias || alias.toLowerCase() !== aliasKey) continue;
				const parsed = parseStatusModelRef(modelKey, params.defaultProvider);
				if (parsed) return parsed;
			}
			return {
				provider: "anthropic",
				model: trimmed
			};
		}
		const parsed = parseStatusModelRef(trimmed, params.defaultProvider);
		if (parsed) return parsed;
	}
	const configuredProviders = params.cfg.models?.providers;
	if (configuredProviders && typeof configuredProviders === "object") {
		if (!Boolean(configuredProviders[params.defaultProvider])) {
			const availableProvider = Object.entries(configuredProviders).find(([, providerCfg]) => providerCfg && Array.isArray(providerCfg.models) && providerCfg.models.length > 0 && providerCfg.models[0]?.id);
			if (availableProvider) {
				const [providerName, providerCfg] = availableProvider;
				return {
					provider: providerName,
					model: providerCfg.models[0].id
				};
			}
		}
	}
	return {
		provider: params.defaultProvider,
		model: params.defaultModel
	};
}
const buildFlags = (entry) => {
	if (!entry) return [];
	const flags = [];
	const think = entry?.thinkingLevel;
	if (typeof think === "string" && think.length > 0) flags.push(`think:${think}`);
	const verbose = entry?.verboseLevel;
	if (typeof verbose === "string" && verbose.length > 0) flags.push(`verbose:${verbose}`);
	if (typeof entry?.fastMode === "boolean") flags.push(entry.fastMode ? "fast" : "fast:off");
	const reasoning = entry?.reasoningLevel;
	if (typeof reasoning === "string" && reasoning.length > 0) flags.push(`reasoning:${reasoning}`);
	const elevated = entry?.elevatedLevel;
	if (typeof elevated === "string" && elevated.length > 0) flags.push(`elevated:${elevated}`);
	if (entry?.systemSent) flags.push("system");
	if (entry?.abortedLastRun) flags.push("aborted");
	const sessionId = entry?.sessionId;
	if (typeof sessionId === "string" && sessionId.length > 0) flags.push(`id:${sessionId}`);
	return flags;
};
function redactSensitiveStatusSummary(summary) {
	return {
		...summary,
		sessions: {
			...summary.sessions,
			paths: [],
			defaults: {
				model: null,
				contextTokens: null
			},
			recent: [],
			byAgent: summary.sessions.byAgent.map((entry) => ({
				...entry,
				path: "[redacted]",
				recent: []
			}))
		}
	};
}
async function getStatusSummary(options = {}) {
	const { includeSensitive = true } = options;
	const { classifySessionKey, resolveContextTokensForModel, resolveSessionModelRef } = await loadStatusSummaryRuntimeModule();
	const cfg = options.config ?? (await loadConfigIoModule()).loadConfig();
	const needsChannelPlugins = hasPotentialConfiguredChannels(cfg);
	const linkContext = needsChannelPlugins ? await loadLinkChannelModule().then(({ resolveLinkChannelContext }) => resolveLinkChannelContext(cfg)) : null;
	const agentList = listGatewayAgentsBasic(cfg);
	const heartbeatAgents = agentList.agents.map((agent) => {
		const summary = resolveHeartbeatSummaryForAgent(cfg, agent.id);
		return {
			agentId: agent.id,
			enabled: summary.enabled,
			every: summary.every,
			everyMs: summary.everyMs
		};
	});
	const channelSummary = needsChannelPlugins ? await loadChannelSummaryModule().then(({ buildChannelSummary }) => buildChannelSummary(cfg, {
		colorize: true,
		includeAllowFrom: true,
		sourceConfig: options.sourceConfig
	})) : [];
	const queuedSystemEvents = peekSystemEvents(resolveMainSessionKey(cfg));
	const resolved = resolveConfiguredStatusModelRef({
		cfg,
		defaultProvider: DEFAULT_PROVIDER,
		defaultModel: DEFAULT_MODEL
	});
	const configModel = resolved.model ?? "claude-opus-4-6";
	const configContextTokens = resolveContextTokensForModel({
		cfg,
		provider: resolved.provider ?? "anthropic",
		model: configModel,
		contextTokensOverride: cfg.agents?.defaults?.contextTokens,
		fallbackContextTokens: 2e5,
		allowAsyncLoad: false
	}) ?? 2e5;
	const now = Date.now();
	const storeCache = /* @__PURE__ */ new Map();
	const loadStore = (storePath) => {
		const cached = storeCache.get(storePath);
		if (cached) return cached;
		const store = readSessionStoreReadOnly(storePath);
		storeCache.set(storePath, store);
		return store;
	};
	const buildSessionRows = (store, opts = {}) => Object.entries(store).filter(([key]) => key !== "global" && key !== "unknown").map(([key, entry]) => {
		const updatedAt = entry?.updatedAt ?? null;
		const age = updatedAt ? now - updatedAt : null;
		const resolvedModel = resolveSessionModelRef(cfg, entry, opts.agentIdOverride);
		const model = resolvedModel.model ?? configModel ?? null;
		const contextTokens = resolveContextTokensForModel({
			cfg,
			provider: resolvedModel.provider,
			model,
			contextTokensOverride: entry?.contextTokens,
			fallbackContextTokens: configContextTokens ?? void 0,
			allowAsyncLoad: false
		}) ?? null;
		const total = resolveFreshSessionTotalTokens(entry);
		const totalTokensFresh = typeof entry?.totalTokens === "number" ? entry?.totalTokensFresh !== false : false;
		const remaining = contextTokens != null && total !== void 0 ? Math.max(0, contextTokens - total) : null;
		const pct = contextTokens && contextTokens > 0 && total !== void 0 ? Math.min(999, Math.round(total / contextTokens * 100)) : null;
		const parsedAgentId = parseAgentSessionKey(key)?.agentId;
		return {
			agentId: opts.agentIdOverride ?? parsedAgentId,
			key,
			kind: classifySessionKey(key, entry),
			sessionId: entry?.sessionId,
			updatedAt,
			age,
			thinkingLevel: entry?.thinkingLevel,
			fastMode: entry?.fastMode,
			verboseLevel: entry?.verboseLevel,
			reasoningLevel: entry?.reasoningLevel,
			elevatedLevel: entry?.elevatedLevel,
			systemSent: entry?.systemSent,
			abortedLastRun: entry?.abortedLastRun,
			inputTokens: entry?.inputTokens,
			outputTokens: entry?.outputTokens,
			cacheRead: entry?.cacheRead,
			cacheWrite: entry?.cacheWrite,
			totalTokens: total ?? null,
			totalTokensFresh,
			remainingTokens: remaining,
			percentUsed: pct,
			model,
			contextTokens,
			flags: buildFlags(entry)
		};
	}).sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
	const paths = /* @__PURE__ */ new Set();
	const byAgent = agentList.agents.map((agent) => {
		const storePath = resolveStorePath(cfg.session?.store, { agentId: agent.id });
		paths.add(storePath);
		const sessions = buildSessionRows(loadStore(storePath), { agentIdOverride: agent.id });
		return {
			agentId: agent.id,
			path: storePath,
			count: sessions.length,
			recent: sessions.slice(0, 10)
		};
	});
	const allSessions = Array.from(paths).flatMap((storePath) => buildSessionRows(loadStore(storePath))).toSorted((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
	const recent = allSessions.slice(0, 10);
	const totalSessions = allSessions.length;
	const summary = {
		runtimeVersion: resolveRuntimeServiceVersion(process.env),
		linkChannel: linkContext ? {
			id: linkContext.plugin.id,
			label: linkContext.plugin.meta.label ?? "Channel",
			linked: linkContext.linked,
			authAgeMs: linkContext.authAgeMs
		} : void 0,
		heartbeat: {
			defaultAgentId: agentList.defaultId,
			agents: heartbeatAgents
		},
		channelSummary,
		queuedSystemEvents,
		sessions: {
			paths: Array.from(paths),
			count: totalSessions,
			defaults: {
				model: configModel ?? null,
				contextTokens: configContextTokens ?? null
			},
			recent,
			byAgent
		}
	};
	return includeSensitive ? summary : redactSensitiveStatusSummary(summary);
}
//#endregion
export { resolveSharedMemoryStatusSnapshot as a, getNodeDaemonStatusSummary as c, formatTokensCompact as d, readServiceStatusSummary as f, pickGatewaySelfPresence as h, resolveMemoryPluginStatus as i, formatDuration as l, resolveOsSummary as m, buildTailscaleHttpsUrl as n, getAgentLocalStatuses as o, listGatewayAgentsBasic as p, resolveGatewayProbeSnapshot as r, getDaemonStatusSummary as s, getStatusSummary as t, formatKTokens as u };
