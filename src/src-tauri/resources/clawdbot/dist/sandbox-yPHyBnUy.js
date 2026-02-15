import { B as STATE_DIR, h as defaultRuntime, tt as CHANNEL_IDS } from "./entry.js";
import { t as formatCliCommand } from "./command-format-CVN3MX2Q.js";
import { d as resolveAgentIdFromSessionKey, l as normalizeAgentId } from "./session-key-DVvxnFKg.js";
import { y as resolveUserPath } from "./utils-q1rHOG-N.js";
import { b as DEFAULT_USER_FILENAME, d as DEFAULT_AGENTS_FILENAME, f as DEFAULT_AGENT_WORKSPACE_DIR, h as DEFAULT_IDENTITY_FILENAME, l as resolveSessionAgentId, m as DEFAULT_HEARTBEAT_FILENAME, n as resolveAgentConfig, p as DEFAULT_BOOTSTRAP_FILENAME, v as DEFAULT_SOUL_FILENAME, x as ensureAgentWorkspace, y as DEFAULT_TOOLS_FILENAME } from "./agent-scope-Bu62UIQZ.js";
import { i as loadConfig } from "./config-BJWIHf6x.js";
import { s as resolveProfile, t as createBrowserRouteContext } from "./server-context-DSQVDg5o.js";
import { C as DEFAULT_BROWSER_EVALUATE_ENABLED, E as DEFAULT_OPENCLAW_BROWSER_PROFILE_NAME, w as DEFAULT_OPENCLAW_BROWSER_COLOR } from "./chrome-Biwk6Xdw.js";
import { O as canonicalizeMainSessionAlias, k as resolveAgentMainSessionKey } from "./sessions-DGtM0qOW.js";
import { d as resolveSandboxPath, o as syncSkillsToWorkspace } from "./skills-C1pxUa-I.js";
import { t as registerBrowserRoutes } from "./routes-BpW33PMu.js";
import { spawn } from "node:child_process";
import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import express from "express";

//#region src/agents/sandbox/constants.ts
const DEFAULT_SANDBOX_WORKSPACE_ROOT = path.join(STATE_DIR, "sandboxes");
const DEFAULT_SANDBOX_IMAGE = "openclaw-sandbox:bookworm-slim";
const DEFAULT_SANDBOX_CONTAINER_PREFIX = "openclaw-sbx-";
const DEFAULT_SANDBOX_WORKDIR = "/workspace";
const DEFAULT_SANDBOX_IDLE_HOURS = 24;
const DEFAULT_SANDBOX_MAX_AGE_DAYS = 7;
const DEFAULT_TOOL_ALLOW = [
	"exec",
	"process",
	"read",
	"write",
	"edit",
	"apply_patch",
	"image",
	"sessions_list",
	"sessions_history",
	"sessions_send",
	"sessions_spawn",
	"session_status"
];
const DEFAULT_TOOL_DENY = [
	"browser",
	"canvas",
	"nodes",
	"cron",
	"gateway",
	...CHANNEL_IDS
];
const DEFAULT_SANDBOX_BROWSER_IMAGE = "openclaw-sandbox-browser:bookworm-slim";
const DEFAULT_SANDBOX_COMMON_IMAGE = "openclaw-sandbox-common:bookworm-slim";
const DEFAULT_SANDBOX_BROWSER_PREFIX = "openclaw-sbx-browser-";
const DEFAULT_SANDBOX_BROWSER_CDP_PORT = 9222;
const DEFAULT_SANDBOX_BROWSER_VNC_PORT = 5900;
const DEFAULT_SANDBOX_BROWSER_NOVNC_PORT = 6080;
const DEFAULT_SANDBOX_BROWSER_AUTOSTART_TIMEOUT_MS = 12e3;
const SANDBOX_AGENT_WORKSPACE_MOUNT = "/agent";
const SANDBOX_STATE_DIR = path.join(STATE_DIR, "sandbox");
const SANDBOX_REGISTRY_PATH = path.join(SANDBOX_STATE_DIR, "containers.json");
const SANDBOX_BROWSER_REGISTRY_PATH = path.join(SANDBOX_STATE_DIR, "browsers.json");

//#endregion
//#region src/agents/tool-policy.ts
const TOOL_NAME_ALIASES = {
	bash: "exec",
	"apply-patch": "apply_patch"
};
const TOOL_GROUPS = {
	"group:memory": ["memory_search", "memory_get"],
	"group:web": ["web_search", "web_fetch"],
	"group:fs": [
		"read",
		"write",
		"edit",
		"apply_patch"
	],
	"group:runtime": ["exec", "process"],
	"group:sessions": [
		"sessions_list",
		"sessions_history",
		"sessions_send",
		"sessions_spawn",
		"session_status"
	],
	"group:ui": ["browser", "canvas"],
	"group:automation": ["cron", "gateway"],
	"group:messaging": ["message"],
	"group:nodes": ["nodes"],
	"group:openclaw": [
		"browser",
		"canvas",
		"nodes",
		"cron",
		"message",
		"gateway",
		"agents_list",
		"sessions_list",
		"sessions_history",
		"sessions_send",
		"sessions_spawn",
		"session_status",
		"memory_search",
		"memory_get",
		"web_search",
		"web_fetch",
		"image"
	]
};
const OWNER_ONLY_TOOL_NAMES = new Set(["whatsapp_login"]);
const TOOL_PROFILES = {
	minimal: { allow: ["session_status"] },
	coding: { allow: [
		"group:fs",
		"group:runtime",
		"group:sessions",
		"group:memory",
		"image"
	] },
	messaging: { allow: [
		"group:messaging",
		"sessions_list",
		"sessions_history",
		"sessions_send",
		"session_status"
	] },
	full: {}
};
function normalizeToolName(name) {
	const normalized = name.trim().toLowerCase();
	return TOOL_NAME_ALIASES[normalized] ?? normalized;
}
function isOwnerOnlyToolName(name) {
	return OWNER_ONLY_TOOL_NAMES.has(normalizeToolName(name));
}
function applyOwnerOnlyToolPolicy(tools, senderIsOwner) {
	const withGuard = tools.map((tool) => {
		if (!isOwnerOnlyToolName(tool.name)) return tool;
		if (senderIsOwner || !tool.execute) return tool;
		return {
			...tool,
			execute: async () => {
				throw new Error("Tool restricted to owner senders.");
			}
		};
	});
	if (senderIsOwner) return withGuard;
	return withGuard.filter((tool) => !isOwnerOnlyToolName(tool.name));
}
function normalizeToolList(list) {
	if (!list) return [];
	return list.map(normalizeToolName).filter(Boolean);
}
function expandToolGroups(list) {
	const normalized = normalizeToolList(list);
	const expanded = [];
	for (const value of normalized) {
		const group = TOOL_GROUPS[value];
		if (group) {
			expanded.push(...group);
			continue;
		}
		expanded.push(value);
	}
	return Array.from(new Set(expanded));
}
function collectExplicitAllowlist(policies) {
	const entries = [];
	for (const policy of policies) {
		if (!policy?.allow) continue;
		for (const value of policy.allow) {
			if (typeof value !== "string") continue;
			const trimmed = value.trim();
			if (trimmed) entries.push(trimmed);
		}
	}
	return entries;
}
function buildPluginToolGroups(params) {
	const all = [];
	const byPlugin = /* @__PURE__ */ new Map();
	for (const tool of params.tools) {
		const meta = params.toolMeta(tool);
		if (!meta) continue;
		const name = normalizeToolName(tool.name);
		all.push(name);
		const pluginId = meta.pluginId.toLowerCase();
		const list = byPlugin.get(pluginId) ?? [];
		list.push(name);
		byPlugin.set(pluginId, list);
	}
	return {
		all,
		byPlugin
	};
}
function expandPluginGroups(list, groups) {
	if (!list || list.length === 0) return list;
	const expanded = [];
	for (const entry of list) {
		const normalized = normalizeToolName(entry);
		if (normalized === "group:plugins") {
			if (groups.all.length > 0) expanded.push(...groups.all);
			else expanded.push(normalized);
			continue;
		}
		const tools = groups.byPlugin.get(normalized);
		if (tools && tools.length > 0) {
			expanded.push(...tools);
			continue;
		}
		expanded.push(normalized);
	}
	return Array.from(new Set(expanded));
}
function expandPolicyWithPluginGroups(policy, groups) {
	if (!policy) return;
	return {
		allow: expandPluginGroups(policy.allow, groups),
		deny: expandPluginGroups(policy.deny, groups)
	};
}
function stripPluginOnlyAllowlist(policy, groups, coreTools) {
	if (!policy?.allow || policy.allow.length === 0) return {
		policy,
		unknownAllowlist: [],
		strippedAllowlist: false
	};
	const normalized = normalizeToolList(policy.allow);
	if (normalized.length === 0) return {
		policy,
		unknownAllowlist: [],
		strippedAllowlist: false
	};
	const pluginIds = new Set(groups.byPlugin.keys());
	const pluginTools = new Set(groups.all);
	const unknownAllowlist = [];
	let hasCoreEntry = false;
	for (const entry of normalized) {
		if (entry === "*") {
			hasCoreEntry = true;
			continue;
		}
		const isPluginEntry = entry === "group:plugins" || pluginIds.has(entry) || pluginTools.has(entry);
		const isCoreEntry = expandToolGroups([entry]).some((tool) => coreTools.has(tool));
		if (isCoreEntry) hasCoreEntry = true;
		if (!isCoreEntry && !isPluginEntry) unknownAllowlist.push(entry);
	}
	const strippedAllowlist = !hasCoreEntry;
	if (strippedAllowlist) {}
	return {
		policy: strippedAllowlist ? {
			...policy,
			allow: void 0
		} : policy,
		unknownAllowlist: Array.from(new Set(unknownAllowlist)),
		strippedAllowlist
	};
}
function resolveToolProfilePolicy(profile) {
	if (!profile) return;
	const resolved = TOOL_PROFILES[profile];
	if (!resolved) return;
	if (!resolved.allow && !resolved.deny) return;
	return {
		allow: resolved.allow ? [...resolved.allow] : void 0,
		deny: resolved.deny ? [...resolved.deny] : void 0
	};
}

//#endregion
//#region src/agents/sandbox/tool-policy.ts
function compilePattern(pattern) {
	const normalized = pattern.trim().toLowerCase();
	if (!normalized) return {
		kind: "exact",
		value: ""
	};
	if (normalized === "*") return { kind: "all" };
	if (!normalized.includes("*")) return {
		kind: "exact",
		value: normalized
	};
	const escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	return {
		kind: "regex",
		value: new RegExp(`^${escaped.replaceAll("\\*", ".*")}$`)
	};
}
function compilePatterns(patterns) {
	if (!Array.isArray(patterns)) return [];
	return expandToolGroups(patterns).map(compilePattern).filter((pattern) => pattern.kind !== "exact" || pattern.value);
}
function matchesAny(name, patterns) {
	for (const pattern of patterns) {
		if (pattern.kind === "all") return true;
		if (pattern.kind === "exact" && name === pattern.value) return true;
		if (pattern.kind === "regex" && pattern.value.test(name)) return true;
	}
	return false;
}
function isToolAllowed(policy, name) {
	const normalized = name.trim().toLowerCase();
	if (matchesAny(normalized, compilePatterns(policy.deny))) return false;
	const allow = compilePatterns(policy.allow);
	if (allow.length === 0) return true;
	return matchesAny(normalized, allow);
}
function resolveSandboxToolPolicyForAgent(cfg, agentId) {
	const agentConfig = cfg && agentId ? resolveAgentConfig(cfg, agentId) : void 0;
	const agentAllow = agentConfig?.tools?.sandbox?.tools?.allow;
	const agentDeny = agentConfig?.tools?.sandbox?.tools?.deny;
	const globalAllow = cfg?.tools?.sandbox?.tools?.allow;
	const globalDeny = cfg?.tools?.sandbox?.tools?.deny;
	const allowSource = Array.isArray(agentAllow) ? {
		source: "agent",
		key: "agents.list[].tools.sandbox.tools.allow"
	} : Array.isArray(globalAllow) ? {
		source: "global",
		key: "tools.sandbox.tools.allow"
	} : {
		source: "default",
		key: "tools.sandbox.tools.allow"
	};
	const denySource = Array.isArray(agentDeny) ? {
		source: "agent",
		key: "agents.list[].tools.sandbox.tools.deny"
	} : Array.isArray(globalDeny) ? {
		source: "global",
		key: "tools.sandbox.tools.deny"
	} : {
		source: "default",
		key: "tools.sandbox.tools.deny"
	};
	const deny = Array.isArray(agentDeny) ? agentDeny : Array.isArray(globalDeny) ? globalDeny : [...DEFAULT_TOOL_DENY];
	const allow = Array.isArray(agentAllow) ? agentAllow : Array.isArray(globalAllow) ? globalAllow : [...DEFAULT_TOOL_ALLOW];
	const expandedDeny = expandToolGroups(deny);
	let expandedAllow = expandToolGroups(allow);
	if (!expandedDeny.map((v) => v.toLowerCase()).includes("image") && !expandedAllow.map((v) => v.toLowerCase()).includes("image")) expandedAllow = [...expandedAllow, "image"];
	return {
		allow: expandedAllow,
		deny: expandedDeny,
		sources: {
			allow: allowSource,
			deny: denySource
		}
	};
}

//#endregion
//#region src/agents/sandbox/config.ts
function resolveSandboxScope(params) {
	if (params.scope) return params.scope;
	if (typeof params.perSession === "boolean") return params.perSession ? "session" : "shared";
	return "agent";
}
function resolveSandboxDockerConfig(params) {
	const agentDocker = params.scope === "shared" ? void 0 : params.agentDocker;
	const globalDocker = params.globalDocker;
	const env = agentDocker?.env ? {
		...globalDocker?.env ?? { LANG: "C.UTF-8" },
		...agentDocker.env
	} : globalDocker?.env ?? { LANG: "C.UTF-8" };
	const ulimits = agentDocker?.ulimits ? {
		...globalDocker?.ulimits,
		...agentDocker.ulimits
	} : globalDocker?.ulimits;
	const binds = [...globalDocker?.binds ?? [], ...agentDocker?.binds ?? []];
	return {
		image: agentDocker?.image ?? globalDocker?.image ?? DEFAULT_SANDBOX_IMAGE,
		containerPrefix: agentDocker?.containerPrefix ?? globalDocker?.containerPrefix ?? DEFAULT_SANDBOX_CONTAINER_PREFIX,
		workdir: agentDocker?.workdir ?? globalDocker?.workdir ?? DEFAULT_SANDBOX_WORKDIR,
		readOnlyRoot: agentDocker?.readOnlyRoot ?? globalDocker?.readOnlyRoot ?? true,
		tmpfs: agentDocker?.tmpfs ?? globalDocker?.tmpfs ?? [
			"/tmp",
			"/var/tmp",
			"/run"
		],
		network: agentDocker?.network ?? globalDocker?.network ?? "none",
		user: agentDocker?.user ?? globalDocker?.user,
		capDrop: agentDocker?.capDrop ?? globalDocker?.capDrop ?? ["ALL"],
		env,
		setupCommand: agentDocker?.setupCommand ?? globalDocker?.setupCommand,
		pidsLimit: agentDocker?.pidsLimit ?? globalDocker?.pidsLimit,
		memory: agentDocker?.memory ?? globalDocker?.memory,
		memorySwap: agentDocker?.memorySwap ?? globalDocker?.memorySwap,
		cpus: agentDocker?.cpus ?? globalDocker?.cpus,
		ulimits,
		seccompProfile: agentDocker?.seccompProfile ?? globalDocker?.seccompProfile,
		apparmorProfile: agentDocker?.apparmorProfile ?? globalDocker?.apparmorProfile,
		dns: agentDocker?.dns ?? globalDocker?.dns,
		extraHosts: agentDocker?.extraHosts ?? globalDocker?.extraHosts,
		binds: binds.length ? binds : void 0
	};
}
function resolveSandboxBrowserConfig(params) {
	const agentBrowser = params.scope === "shared" ? void 0 : params.agentBrowser;
	const globalBrowser = params.globalBrowser;
	return {
		enabled: agentBrowser?.enabled ?? globalBrowser?.enabled ?? false,
		image: agentBrowser?.image ?? globalBrowser?.image ?? DEFAULT_SANDBOX_BROWSER_IMAGE,
		containerPrefix: agentBrowser?.containerPrefix ?? globalBrowser?.containerPrefix ?? DEFAULT_SANDBOX_BROWSER_PREFIX,
		cdpPort: agentBrowser?.cdpPort ?? globalBrowser?.cdpPort ?? DEFAULT_SANDBOX_BROWSER_CDP_PORT,
		vncPort: agentBrowser?.vncPort ?? globalBrowser?.vncPort ?? DEFAULT_SANDBOX_BROWSER_VNC_PORT,
		noVncPort: agentBrowser?.noVncPort ?? globalBrowser?.noVncPort ?? DEFAULT_SANDBOX_BROWSER_NOVNC_PORT,
		headless: agentBrowser?.headless ?? globalBrowser?.headless ?? false,
		enableNoVnc: agentBrowser?.enableNoVnc ?? globalBrowser?.enableNoVnc ?? true,
		allowHostControl: agentBrowser?.allowHostControl ?? globalBrowser?.allowHostControl ?? false,
		autoStart: agentBrowser?.autoStart ?? globalBrowser?.autoStart ?? true,
		autoStartTimeoutMs: agentBrowser?.autoStartTimeoutMs ?? globalBrowser?.autoStartTimeoutMs ?? DEFAULT_SANDBOX_BROWSER_AUTOSTART_TIMEOUT_MS
	};
}
function resolveSandboxPruneConfig(params) {
	const agentPrune = params.scope === "shared" ? void 0 : params.agentPrune;
	const globalPrune = params.globalPrune;
	return {
		idleHours: agentPrune?.idleHours ?? globalPrune?.idleHours ?? DEFAULT_SANDBOX_IDLE_HOURS,
		maxAgeDays: agentPrune?.maxAgeDays ?? globalPrune?.maxAgeDays ?? DEFAULT_SANDBOX_MAX_AGE_DAYS
	};
}
function resolveSandboxConfigForAgent(cfg, agentId) {
	const agent = cfg?.agents?.defaults?.sandbox;
	let agentSandbox;
	const agentConfig = cfg && agentId ? resolveAgentConfig(cfg, agentId) : void 0;
	if (agentConfig?.sandbox) agentSandbox = agentConfig.sandbox;
	const scope = resolveSandboxScope({
		scope: agentSandbox?.scope ?? agent?.scope,
		perSession: agentSandbox?.perSession ?? agent?.perSession
	});
	const toolPolicy = resolveSandboxToolPolicyForAgent(cfg, agentId);
	return {
		mode: agentSandbox?.mode ?? agent?.mode ?? "off",
		scope,
		workspaceAccess: agentSandbox?.workspaceAccess ?? agent?.workspaceAccess ?? "none",
		workspaceRoot: agentSandbox?.workspaceRoot ?? agent?.workspaceRoot ?? DEFAULT_SANDBOX_WORKSPACE_ROOT,
		docker: resolveSandboxDockerConfig({
			scope,
			globalDocker: agent?.docker,
			agentDocker: agentSandbox?.docker
		}),
		browser: resolveSandboxBrowserConfig({
			scope,
			globalBrowser: agent?.browser,
			agentBrowser: agentSandbox?.browser
		}),
		tools: {
			allow: toolPolicy.allow,
			deny: toolPolicy.deny
		},
		prune: resolveSandboxPruneConfig({
			scope,
			globalPrune: agent?.prune,
			agentPrune: agentSandbox?.prune
		})
	};
}

//#endregion
//#region src/browser/bridge-server.ts
async function startBrowserBridgeServer(params) {
	const host = params.host ?? "127.0.0.1";
	const port = params.port ?? 0;
	const app = express();
	app.use((req, res, next) => {
		const ctrl = new AbortController();
		const abort = () => ctrl.abort(/* @__PURE__ */ new Error("request aborted"));
		req.once("aborted", abort);
		res.once("close", () => {
			if (!res.writableEnded) abort();
		});
		req.signal = ctrl.signal;
		next();
	});
	app.use(express.json({ limit: "1mb" }));
	const authToken = params.authToken?.trim();
	if (authToken) app.use((req, res, next) => {
		if (String(req.headers.authorization ?? "").trim() === `Bearer ${authToken}`) return next();
		res.status(401).send("Unauthorized");
	});
	const state = {
		server: null,
		port,
		resolved: params.resolved,
		profiles: /* @__PURE__ */ new Map()
	};
	registerBrowserRoutes(app, createBrowserRouteContext({
		getState: () => state,
		onEnsureAttachTarget: params.onEnsureAttachTarget
	}));
	const server = await new Promise((resolve, reject) => {
		const s = app.listen(port, host, () => resolve(s));
		s.once("error", reject);
	});
	const resolvedPort = server.address()?.port ?? port;
	state.server = server;
	state.port = resolvedPort;
	state.resolved.controlPort = resolvedPort;
	return {
		server,
		port: resolvedPort,
		baseUrl: `http://${host}:${resolvedPort}`,
		state
	};
}
async function stopBrowserBridgeServer(server) {
	await new Promise((resolve) => {
		server.close(() => resolve());
	});
}

//#endregion
//#region src/agents/sandbox/browser-bridges.ts
const BROWSER_BRIDGES = /* @__PURE__ */ new Map();

//#endregion
//#region src/agents/sandbox/config-hash.ts
function isPrimitive(value) {
	return value === null || typeof value !== "object" && typeof value !== "function";
}
function normalizeForHash(value) {
	if (value === void 0) return;
	if (Array.isArray(value)) {
		const normalized = value.map(normalizeForHash).filter((item) => item !== void 0);
		const primitives = normalized.filter(isPrimitive);
		if (primitives.length === normalized.length) return [...primitives].toSorted((a, b) => primitiveToString(a).localeCompare(primitiveToString(b)));
		return normalized;
	}
	if (value && typeof value === "object") {
		const entries = Object.entries(value).toSorted(([a], [b]) => a.localeCompare(b));
		const normalized = {};
		for (const [key, entryValue] of entries) {
			const next = normalizeForHash(entryValue);
			if (next !== void 0) normalized[key] = next;
		}
		return normalized;
	}
	return value;
}
function primitiveToString(value) {
	if (value === null) return "null";
	if (typeof value === "string") return value;
	if (typeof value === "number") return String(value);
	if (typeof value === "boolean") return value ? "true" : "false";
	return JSON.stringify(value);
}
function computeSandboxConfigHash(input) {
	const payload = normalizeForHash(input);
	const raw = JSON.stringify(payload);
	return crypto.createHash("sha1").update(raw).digest("hex");
}

//#endregion
//#region src/agents/sandbox/registry.ts
async function readRegistry() {
	try {
		const raw = await fs.readFile(SANDBOX_REGISTRY_PATH, "utf-8");
		const parsed = JSON.parse(raw);
		if (parsed && Array.isArray(parsed.entries)) return parsed;
	} catch {}
	return { entries: [] };
}
async function writeRegistry(registry) {
	await fs.mkdir(SANDBOX_STATE_DIR, { recursive: true });
	await fs.writeFile(SANDBOX_REGISTRY_PATH, `${JSON.stringify(registry, null, 2)}\n`, "utf-8");
}
async function updateRegistry(entry) {
	const registry = await readRegistry();
	const existing = registry.entries.find((item) => item.containerName === entry.containerName);
	const next = registry.entries.filter((item) => item.containerName !== entry.containerName);
	next.push({
		...entry,
		createdAtMs: existing?.createdAtMs ?? entry.createdAtMs,
		image: existing?.image ?? entry.image,
		configHash: entry.configHash ?? existing?.configHash
	});
	await writeRegistry({ entries: next });
}
async function removeRegistryEntry(containerName) {
	const registry = await readRegistry();
	const next = registry.entries.filter((item) => item.containerName !== containerName);
	if (next.length === registry.entries.length) return;
	await writeRegistry({ entries: next });
}
async function readBrowserRegistry() {
	try {
		const raw = await fs.readFile(SANDBOX_BROWSER_REGISTRY_PATH, "utf-8");
		const parsed = JSON.parse(raw);
		if (parsed && Array.isArray(parsed.entries)) return parsed;
	} catch {}
	return { entries: [] };
}
async function writeBrowserRegistry(registry) {
	await fs.mkdir(SANDBOX_STATE_DIR, { recursive: true });
	await fs.writeFile(SANDBOX_BROWSER_REGISTRY_PATH, `${JSON.stringify(registry, null, 2)}\n`, "utf-8");
}
async function updateBrowserRegistry(entry) {
	const registry = await readBrowserRegistry();
	const existing = registry.entries.find((item) => item.containerName === entry.containerName);
	const next = registry.entries.filter((item) => item.containerName !== entry.containerName);
	next.push({
		...entry,
		createdAtMs: existing?.createdAtMs ?? entry.createdAtMs,
		image: existing?.image ?? entry.image
	});
	await writeBrowserRegistry({ entries: next });
}
async function removeBrowserRegistryEntry(containerName) {
	const registry = await readBrowserRegistry();
	const next = registry.entries.filter((item) => item.containerName !== containerName);
	if (next.length === registry.entries.length) return;
	await writeBrowserRegistry({ entries: next });
}

//#endregion
//#region src/agents/sandbox/shared.ts
function slugifySessionKey(value) {
	const trimmed = value.trim() || "session";
	const hash = crypto.createHash("sha1").update(trimmed).digest("hex").slice(0, 8);
	return `${trimmed.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 32) || "session"}-${hash}`;
}
function resolveSandboxWorkspaceDir(root, sessionKey) {
	const resolvedRoot = resolveUserPath(root);
	const slug = slugifySessionKey(sessionKey);
	return path.join(resolvedRoot, slug);
}
function resolveSandboxScopeKey(scope, sessionKey) {
	const trimmed = sessionKey.trim() || "main";
	if (scope === "shared") return "shared";
	if (scope === "session") return trimmed;
	return `agent:${resolveAgentIdFromSessionKey(trimmed)}`;
}
function resolveSandboxAgentId(scopeKey) {
	const trimmed = scopeKey.trim();
	if (!trimmed || trimmed === "shared") return;
	const parts = trimmed.split(":").filter(Boolean);
	if (parts[0] === "agent" && parts[1]) return normalizeAgentId(parts[1]);
	return resolveAgentIdFromSessionKey(trimmed);
}

//#endregion
//#region src/agents/sandbox/docker.ts
function createAbortError() {
	const err = /* @__PURE__ */ new Error("Aborted");
	err.name = "AbortError";
	return err;
}
function execDockerRaw(args, opts) {
	return new Promise((resolve, reject) => {
		const child = spawn("docker", args, { stdio: [
			"pipe",
			"pipe",
			"pipe"
		] });
		const stdoutChunks = [];
		const stderrChunks = [];
		let aborted = false;
		const signal = opts?.signal;
		const handleAbort = () => {
			if (aborted) return;
			aborted = true;
			child.kill("SIGTERM");
		};
		if (signal) if (signal.aborted) handleAbort();
		else signal.addEventListener("abort", handleAbort);
		child.stdout?.on("data", (chunk) => {
			stdoutChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
		});
		child.stderr?.on("data", (chunk) => {
			stderrChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
		});
		child.on("error", (error) => {
			if (signal) signal.removeEventListener("abort", handleAbort);
			reject(error);
		});
		child.on("close", (code) => {
			if (signal) signal.removeEventListener("abort", handleAbort);
			const stdout = Buffer.concat(stdoutChunks);
			const stderr = Buffer.concat(stderrChunks);
			if (aborted || signal?.aborted) {
				reject(createAbortError());
				return;
			}
			const exitCode = code ?? 0;
			if (exitCode !== 0 && !opts?.allowFailure) {
				const message = stderr.length > 0 ? stderr.toString("utf8").trim() : "";
				reject(Object.assign(new Error(message || `docker ${args.join(" ")} failed`), {
					code: exitCode,
					stdout,
					stderr
				}));
				return;
			}
			resolve({
				stdout,
				stderr,
				code: exitCode
			});
		});
		const stdin = child.stdin;
		if (stdin) if (opts?.input !== void 0) stdin.end(opts.input);
		else stdin.end();
	});
}
const HOT_CONTAINER_WINDOW_MS = 300 * 1e3;
async function execDocker(args, opts) {
	const result = await execDockerRaw(args, opts);
	return {
		stdout: result.stdout.toString("utf8"),
		stderr: result.stderr.toString("utf8"),
		code: result.code
	};
}
async function readDockerPort(containerName, port) {
	const result = await execDocker([
		"port",
		containerName,
		`${port}/tcp`
	], { allowFailure: true });
	if (result.code !== 0) return null;
	const match = (result.stdout.trim().split(/\r?\n/)[0] ?? "").match(/:(\d+)\s*$/);
	if (!match) return null;
	const mapped = Number.parseInt(match[1] ?? "", 10);
	return Number.isFinite(mapped) ? mapped : null;
}
async function dockerImageExists(image) {
	const result = await execDocker([
		"image",
		"inspect",
		image
	], { allowFailure: true });
	if (result.code === 0) return true;
	const stderr = result.stderr.trim();
	if (stderr.includes("No such image")) return false;
	throw new Error(`Failed to inspect sandbox image: ${stderr}`);
}
async function ensureDockerImage(image) {
	if (await dockerImageExists(image)) return;
	if (image === DEFAULT_SANDBOX_IMAGE) {
		await execDocker(["pull", "debian:bookworm-slim"]);
		await execDocker([
			"tag",
			"debian:bookworm-slim",
			DEFAULT_SANDBOX_IMAGE
		]);
		return;
	}
	throw new Error(`Sandbox image not found: ${image}. Build or pull it first.`);
}
async function dockerContainerState(name) {
	const result = await execDocker([
		"inspect",
		"-f",
		"{{.State.Running}}",
		name
	], { allowFailure: true });
	if (result.code !== 0) return {
		exists: false,
		running: false
	};
	return {
		exists: true,
		running: result.stdout.trim() === "true"
	};
}
function normalizeDockerLimit(value) {
	if (value === void 0 || value === null) return;
	if (typeof value === "number") return Number.isFinite(value) ? String(value) : void 0;
	const trimmed = value.trim();
	return trimmed ? trimmed : void 0;
}
function formatUlimitValue(name, value) {
	if (!name.trim()) return null;
	if (typeof value === "number" || typeof value === "string") {
		const raw = String(value).trim();
		return raw ? `${name}=${raw}` : null;
	}
	const soft = typeof value.soft === "number" ? Math.max(0, value.soft) : void 0;
	const hard = typeof value.hard === "number" ? Math.max(0, value.hard) : void 0;
	if (soft === void 0 && hard === void 0) return null;
	if (soft === void 0) return `${name}=${hard}`;
	if (hard === void 0) return `${name}=${soft}`;
	return `${name}=${soft}:${hard}`;
}
function buildSandboxCreateArgs(params) {
	const createdAtMs = params.createdAtMs ?? Date.now();
	const args = [
		"create",
		"--name",
		params.name
	];
	args.push("--label", "openclaw.sandbox=1");
	args.push("--label", `openclaw.sessionKey=${params.scopeKey}`);
	args.push("--label", `openclaw.createdAtMs=${createdAtMs}`);
	if (params.configHash) args.push("--label", `openclaw.configHash=${params.configHash}`);
	for (const [key, value] of Object.entries(params.labels ?? {})) if (key && value) args.push("--label", `${key}=${value}`);
	if (params.cfg.readOnlyRoot) args.push("--read-only");
	for (const entry of params.cfg.tmpfs) args.push("--tmpfs", entry);
	if (params.cfg.network) args.push("--network", params.cfg.network);
	if (params.cfg.user) args.push("--user", params.cfg.user);
	for (const [key, value] of Object.entries(params.cfg.env ?? {})) {
		if (!key.trim()) continue;
		args.push("--env", key + "=" + value);
	}
	for (const cap of params.cfg.capDrop) args.push("--cap-drop", cap);
	args.push("--security-opt", "no-new-privileges");
	if (params.cfg.seccompProfile) args.push("--security-opt", `seccomp=${params.cfg.seccompProfile}`);
	if (params.cfg.apparmorProfile) args.push("--security-opt", `apparmor=${params.cfg.apparmorProfile}`);
	for (const entry of params.cfg.dns ?? []) if (entry.trim()) args.push("--dns", entry);
	for (const entry of params.cfg.extraHosts ?? []) if (entry.trim()) args.push("--add-host", entry);
	if (typeof params.cfg.pidsLimit === "number" && params.cfg.pidsLimit > 0) args.push("--pids-limit", String(params.cfg.pidsLimit));
	const memory = normalizeDockerLimit(params.cfg.memory);
	if (memory) args.push("--memory", memory);
	const memorySwap = normalizeDockerLimit(params.cfg.memorySwap);
	if (memorySwap) args.push("--memory-swap", memorySwap);
	if (typeof params.cfg.cpus === "number" && params.cfg.cpus > 0) args.push("--cpus", String(params.cfg.cpus));
	for (const [name, value] of Object.entries(params.cfg.ulimits ?? {})) {
		const formatted = formatUlimitValue(name, value);
		if (formatted) args.push("--ulimit", formatted);
	}
	if (params.cfg.binds?.length) for (const bind of params.cfg.binds) args.push("-v", bind);
	return args;
}
async function createSandboxContainer(params) {
	const { name, cfg, workspaceDir, scopeKey } = params;
	await ensureDockerImage(cfg.image);
	const args = buildSandboxCreateArgs({
		name,
		cfg,
		scopeKey,
		configHash: params.configHash
	});
	args.push("--workdir", cfg.workdir);
	const mainMountSuffix = params.workspaceAccess === "ro" && workspaceDir === params.agentWorkspaceDir ? ":ro" : "";
	args.push("-v", `${workspaceDir}:${cfg.workdir}${mainMountSuffix}`);
	if (params.workspaceAccess !== "none" && workspaceDir !== params.agentWorkspaceDir) {
		const agentMountSuffix = params.workspaceAccess === "ro" ? ":ro" : "";
		args.push("-v", `${params.agentWorkspaceDir}:${SANDBOX_AGENT_WORKSPACE_MOUNT}${agentMountSuffix}`);
	}
	args.push(cfg.image, "sleep", "infinity");
	await execDocker(args);
	await execDocker(["start", name]);
	if (cfg.setupCommand?.trim()) await execDocker([
		"exec",
		"-i",
		name,
		"sh",
		"-lc",
		cfg.setupCommand
	]);
}
async function readContainerConfigHash(containerName) {
	const readLabel = async (label) => {
		const result = await execDocker([
			"inspect",
			"-f",
			`{{ index .Config.Labels "${label}" }}`,
			containerName
		], { allowFailure: true });
		if (result.code !== 0) return null;
		const raw = result.stdout.trim();
		if (!raw || raw === "<no value>") return null;
		return raw;
	};
	return await readLabel("openclaw.configHash");
}
function formatSandboxRecreateHint(params) {
	if (params.scope === "session") return formatCliCommand(`openclaw sandbox recreate --session ${params.sessionKey}`);
	if (params.scope === "agent") return formatCliCommand(`openclaw sandbox recreate --agent ${resolveSandboxAgentId(params.sessionKey) ?? "main"}`);
	return formatCliCommand("openclaw sandbox recreate --all");
}
async function ensureSandboxContainer(params) {
	const scopeKey = resolveSandboxScopeKey(params.cfg.scope, params.sessionKey);
	const slug = params.cfg.scope === "shared" ? "shared" : slugifySessionKey(scopeKey);
	const containerName = `${params.cfg.docker.containerPrefix}${slug}`.slice(0, 63);
	const expectedHash = computeSandboxConfigHash({
		docker: params.cfg.docker,
		workspaceAccess: params.cfg.workspaceAccess,
		workspaceDir: params.workspaceDir,
		agentWorkspaceDir: params.agentWorkspaceDir
	});
	const now = Date.now();
	const state = await dockerContainerState(containerName);
	let hasContainer = state.exists;
	let running = state.running;
	let currentHash = null;
	let hashMismatch = false;
	let registryEntry;
	if (hasContainer) {
		registryEntry = (await readRegistry()).entries.find((entry) => entry.containerName === containerName);
		currentHash = await readContainerConfigHash(containerName);
		if (!currentHash) currentHash = registryEntry?.configHash ?? null;
		hashMismatch = !currentHash || currentHash !== expectedHash;
		if (hashMismatch) {
			const lastUsedAtMs = registryEntry?.lastUsedAtMs;
			if (running && (typeof lastUsedAtMs !== "number" || now - lastUsedAtMs < HOT_CONTAINER_WINDOW_MS)) {
				const hint = formatSandboxRecreateHint({
					scope: params.cfg.scope,
					sessionKey: scopeKey
				});
				defaultRuntime.log(`Sandbox config changed for ${containerName} (recently used). Recreate to apply: ${hint}`);
			} else {
				await execDocker([
					"rm",
					"-f",
					containerName
				], { allowFailure: true });
				hasContainer = false;
				running = false;
			}
		}
	}
	if (!hasContainer) await createSandboxContainer({
		name: containerName,
		cfg: params.cfg.docker,
		workspaceDir: params.workspaceDir,
		workspaceAccess: params.cfg.workspaceAccess,
		agentWorkspaceDir: params.agentWorkspaceDir,
		scopeKey,
		configHash: expectedHash
	});
	else if (!running) await execDocker(["start", containerName]);
	await updateRegistry({
		containerName,
		sessionKey: scopeKey,
		createdAtMs: now,
		lastUsedAtMs: now,
		image: params.cfg.docker.image,
		configHash: hashMismatch && running ? currentHash ?? void 0 : expectedHash
	});
	return containerName;
}

//#endregion
//#region src/agents/sandbox/browser.ts
async function waitForSandboxCdp(params) {
	const deadline = Date.now() + Math.max(0, params.timeoutMs);
	const url = `http://127.0.0.1:${params.cdpPort}/json/version`;
	while (Date.now() < deadline) {
		try {
			const ctrl = new AbortController();
			const t = setTimeout(ctrl.abort.bind(ctrl), 1e3);
			try {
				if ((await fetch(url, { signal: ctrl.signal })).ok) return true;
			} finally {
				clearTimeout(t);
			}
		} catch {}
		await new Promise((r) => setTimeout(r, 150));
	}
	return false;
}
function buildSandboxBrowserResolvedConfig(params) {
	return {
		enabled: true,
		evaluateEnabled: params.evaluateEnabled,
		controlPort: params.controlPort,
		cdpProtocol: "http",
		cdpHost: "127.0.0.1",
		cdpIsLoopback: true,
		remoteCdpTimeoutMs: 1500,
		remoteCdpHandshakeTimeoutMs: 3e3,
		color: DEFAULT_OPENCLAW_BROWSER_COLOR,
		executablePath: void 0,
		headless: params.headless,
		noSandbox: false,
		attachOnly: true,
		defaultProfile: DEFAULT_OPENCLAW_BROWSER_PROFILE_NAME,
		profiles: { [DEFAULT_OPENCLAW_BROWSER_PROFILE_NAME]: {
			cdpPort: params.cdpPort,
			color: DEFAULT_OPENCLAW_BROWSER_COLOR
		} }
	};
}
async function ensureSandboxBrowserImage(image) {
	if ((await execDocker([
		"image",
		"inspect",
		image
	], { allowFailure: true })).code === 0) return;
	throw new Error(`Sandbox browser image not found: ${image}. Build it with scripts/sandbox-browser-setup.sh.`);
}
async function ensureSandboxBrowser(params) {
	if (!params.cfg.browser.enabled) return null;
	if (!isToolAllowed(params.cfg.tools, "browser")) return null;
	const slug = params.cfg.scope === "shared" ? "shared" : slugifySessionKey(params.scopeKey);
	const containerName = `${params.cfg.browser.containerPrefix}${slug}`.slice(0, 63);
	const state = await dockerContainerState(containerName);
	if (!state.exists) {
		await ensureSandboxBrowserImage(params.cfg.browser.image ?? DEFAULT_SANDBOX_BROWSER_IMAGE);
		const args = buildSandboxCreateArgs({
			name: containerName,
			cfg: {
				...params.cfg.docker,
				network: "bridge"
			},
			scopeKey: params.scopeKey,
			labels: { "openclaw.sandboxBrowser": "1" }
		});
		const mainMountSuffix = params.cfg.workspaceAccess === "ro" && params.workspaceDir === params.agentWorkspaceDir ? ":ro" : "";
		args.push("-v", `${params.workspaceDir}:${params.cfg.docker.workdir}${mainMountSuffix}`);
		if (params.cfg.workspaceAccess !== "none" && params.workspaceDir !== params.agentWorkspaceDir) {
			const agentMountSuffix = params.cfg.workspaceAccess === "ro" ? ":ro" : "";
			args.push("-v", `${params.agentWorkspaceDir}:${SANDBOX_AGENT_WORKSPACE_MOUNT}${agentMountSuffix}`);
		}
		args.push("-p", `127.0.0.1::${params.cfg.browser.cdpPort}`);
		if (params.cfg.browser.enableNoVnc && !params.cfg.browser.headless) args.push("-p", `127.0.0.1::${params.cfg.browser.noVncPort}`);
		args.push("-e", `OPENCLAW_BROWSER_HEADLESS=${params.cfg.browser.headless ? "1" : "0"}`);
		args.push("-e", `OPENCLAW_BROWSER_ENABLE_NOVNC=${params.cfg.browser.enableNoVnc ? "1" : "0"}`);
		args.push("-e", `OPENCLAW_BROWSER_CDP_PORT=${params.cfg.browser.cdpPort}`);
		args.push("-e", `OPENCLAW_BROWSER_VNC_PORT=${params.cfg.browser.vncPort}`);
		args.push("-e", `OPENCLAW_BROWSER_NOVNC_PORT=${params.cfg.browser.noVncPort}`);
		args.push(params.cfg.browser.image);
		await execDocker(args);
		await execDocker(["start", containerName]);
	} else if (!state.running) await execDocker(["start", containerName]);
	const mappedCdp = await readDockerPort(containerName, params.cfg.browser.cdpPort);
	if (!mappedCdp) throw new Error(`Failed to resolve CDP port mapping for ${containerName}.`);
	const mappedNoVnc = params.cfg.browser.enableNoVnc && !params.cfg.browser.headless ? await readDockerPort(containerName, params.cfg.browser.noVncPort) : null;
	const existing = BROWSER_BRIDGES.get(params.scopeKey);
	const existingProfile = existing ? resolveProfile(existing.bridge.state.resolved, DEFAULT_OPENCLAW_BROWSER_PROFILE_NAME) : null;
	const shouldReuse = existing && existing.containerName === containerName && existingProfile?.cdpPort === mappedCdp;
	if (existing && !shouldReuse) {
		await stopBrowserBridgeServer(existing.bridge.server).catch(() => void 0);
		BROWSER_BRIDGES.delete(params.scopeKey);
	}
	const bridge = (() => {
		if (shouldReuse && existing) return existing.bridge;
		return null;
	})();
	const ensureBridge = async () => {
		if (bridge) return bridge;
		const onEnsureAttachTarget = params.cfg.browser.autoStart ? async () => {
			const state = await dockerContainerState(containerName);
			if (state.exists && !state.running) await execDocker(["start", containerName]);
			if (!await waitForSandboxCdp({
				cdpPort: mappedCdp,
				timeoutMs: params.cfg.browser.autoStartTimeoutMs
			})) throw new Error(`Sandbox browser CDP did not become reachable on 127.0.0.1:${mappedCdp} within ${params.cfg.browser.autoStartTimeoutMs}ms.`);
		} : void 0;
		return await startBrowserBridgeServer({
			resolved: buildSandboxBrowserResolvedConfig({
				controlPort: 0,
				cdpPort: mappedCdp,
				headless: params.cfg.browser.headless,
				evaluateEnabled: params.evaluateEnabled ?? DEFAULT_BROWSER_EVALUATE_ENABLED
			}),
			onEnsureAttachTarget
		});
	};
	const resolvedBridge = await ensureBridge();
	if (!shouldReuse) BROWSER_BRIDGES.set(params.scopeKey, {
		bridge: resolvedBridge,
		containerName
	});
	const now = Date.now();
	await updateBrowserRegistry({
		containerName,
		sessionKey: params.scopeKey,
		createdAtMs: now,
		lastUsedAtMs: now,
		image: params.cfg.browser.image,
		cdpPort: mappedCdp,
		noVncPort: mappedNoVnc ?? void 0
	});
	const noVncUrl = mappedNoVnc && params.cfg.browser.enableNoVnc && !params.cfg.browser.headless ? `http://127.0.0.1:${mappedNoVnc}/vnc.html?autoconnect=1&resize=remote` : void 0;
	return {
		bridgeUrl: resolvedBridge.baseUrl,
		noVncUrl,
		containerName
	};
}

//#endregion
//#region src/agents/sandbox/fs-bridge.ts
function createSandboxFsBridge(params) {
	return new SandboxFsBridgeImpl(params.sandbox);
}
var SandboxFsBridgeImpl = class {
	constructor(sandbox) {
		this.sandbox = sandbox;
	}
	resolvePath(params) {
		return resolveSandboxFsPath({
			sandbox: this.sandbox,
			filePath: params.filePath,
			cwd: params.cwd
		});
	}
	async readFile(params) {
		const target = this.resolvePath(params);
		return (await this.runCommand("set -eu; cat -- \"$1\"", {
			args: [target.containerPath],
			signal: params.signal
		})).stdout;
	}
	async writeFile(params) {
		this.ensureWriteAccess("write files");
		const target = this.resolvePath(params);
		const buffer = Buffer.isBuffer(params.data) ? params.data : Buffer.from(params.data, params.encoding ?? "utf8");
		const script = params.mkdir === false ? "set -eu; cat >\"$1\"" : "set -eu; dir=$(dirname -- \"$1\"); if [ \"$dir\" != \".\" ]; then mkdir -p -- \"$dir\"; fi; cat >\"$1\"";
		await this.runCommand(script, {
			args: [target.containerPath],
			stdin: buffer,
			signal: params.signal
		});
	}
	async mkdirp(params) {
		this.ensureWriteAccess("create directories");
		const target = this.resolvePath(params);
		await this.runCommand("set -eu; mkdir -p -- \"$1\"", {
			args: [target.containerPath],
			signal: params.signal
		});
	}
	async remove(params) {
		this.ensureWriteAccess("remove files");
		const target = this.resolvePath(params);
		const flags = [params.force === false ? "" : "-f", params.recursive ? "-r" : ""].filter(Boolean);
		const rmCommand = flags.length > 0 ? `rm ${flags.join(" ")}` : "rm";
		await this.runCommand(`set -eu; ${rmCommand} -- "$1"`, {
			args: [target.containerPath],
			signal: params.signal
		});
	}
	async rename(params) {
		this.ensureWriteAccess("rename files");
		const from = this.resolvePath({
			filePath: params.from,
			cwd: params.cwd
		});
		const to = this.resolvePath({
			filePath: params.to,
			cwd: params.cwd
		});
		await this.runCommand("set -eu; dir=$(dirname -- \"$2\"); if [ \"$dir\" != \".\" ]; then mkdir -p -- \"$dir\"; fi; mv -- \"$1\" \"$2\"", {
			args: [from.containerPath, to.containerPath],
			signal: params.signal
		});
	}
	async stat(params) {
		const target = this.resolvePath(params);
		const result = await this.runCommand("set -eu; stat -c \"%F|%s|%Y\" -- \"$1\"", {
			args: [target.containerPath],
			signal: params.signal,
			allowFailure: true
		});
		if (result.code !== 0) {
			const stderr = result.stderr.toString("utf8");
			if (stderr.includes("No such file or directory")) return null;
			const message = stderr.trim() || `stat failed with code ${result.code}`;
			throw new Error(`stat failed for ${target.containerPath}: ${message}`);
		}
		const [typeRaw, sizeRaw, mtimeRaw] = result.stdout.toString("utf8").trim().split("|");
		const size = Number.parseInt(sizeRaw ?? "0", 10);
		const mtime = Number.parseInt(mtimeRaw ?? "0", 10) * 1e3;
		return {
			type: coerceStatType(typeRaw),
			size: Number.isFinite(size) ? size : 0,
			mtimeMs: Number.isFinite(mtime) ? mtime : 0
		};
	}
	async runCommand(script, options = {}) {
		const dockerArgs = [
			"exec",
			"-i",
			this.sandbox.containerName,
			"sh",
			"-c",
			script,
			"moltbot-sandbox-fs"
		];
		if (options.args?.length) dockerArgs.push(...options.args);
		return execDockerRaw(dockerArgs, {
			input: options.stdin,
			allowFailure: options.allowFailure,
			signal: options.signal
		});
	}
	ensureWriteAccess(action) {
		if (!allowsWrites(this.sandbox.workspaceAccess)) throw new Error(`Sandbox workspace (${this.sandbox.workspaceAccess}) does not allow ${action}.`);
	}
};
function allowsWrites(access) {
	return access === "rw";
}
function resolveSandboxFsPath(params) {
	const root = params.sandbox.workspaceDir;
	const cwd = params.cwd ?? root;
	const { resolved, relative } = resolveSandboxPath({
		filePath: params.filePath,
		cwd,
		root
	});
	const normalizedRelative = relative ? relative.split(path.sep).filter(Boolean).join(path.posix.sep) : "";
	return {
		hostPath: resolved,
		relativePath: normalizedRelative,
		containerPath: normalizedRelative ? path.posix.join(params.sandbox.containerWorkdir, normalizedRelative) : params.sandbox.containerWorkdir
	};
}
function coerceStatType(typeRaw) {
	if (!typeRaw) return "other";
	const normalized = typeRaw.trim().toLowerCase();
	if (normalized.includes("directory")) return "directory";
	if (normalized.includes("file")) return "file";
	return "other";
}

//#endregion
//#region src/agents/sandbox/prune.ts
let lastPruneAtMs = 0;
async function pruneSandboxContainers(cfg) {
	const now = Date.now();
	const idleHours = cfg.prune.idleHours;
	const maxAgeDays = cfg.prune.maxAgeDays;
	if (idleHours === 0 && maxAgeDays === 0) return;
	const registry = await readRegistry();
	for (const entry of registry.entries) {
		const idleMs = now - entry.lastUsedAtMs;
		const ageMs = now - entry.createdAtMs;
		if (idleHours > 0 && idleMs > idleHours * 60 * 60 * 1e3 || maxAgeDays > 0 && ageMs > maxAgeDays * 24 * 60 * 60 * 1e3) try {
			await execDocker([
				"rm",
				"-f",
				entry.containerName
			], { allowFailure: true });
		} catch {} finally {
			await removeRegistryEntry(entry.containerName);
		}
	}
}
async function pruneSandboxBrowsers(cfg) {
	const now = Date.now();
	const idleHours = cfg.prune.idleHours;
	const maxAgeDays = cfg.prune.maxAgeDays;
	if (idleHours === 0 && maxAgeDays === 0) return;
	const registry = await readBrowserRegistry();
	for (const entry of registry.entries) {
		const idleMs = now - entry.lastUsedAtMs;
		const ageMs = now - entry.createdAtMs;
		if (idleHours > 0 && idleMs > idleHours * 60 * 60 * 1e3 || maxAgeDays > 0 && ageMs > maxAgeDays * 24 * 60 * 60 * 1e3) try {
			await execDocker([
				"rm",
				"-f",
				entry.containerName
			], { allowFailure: true });
		} catch {} finally {
			await removeBrowserRegistryEntry(entry.containerName);
			const bridge = BROWSER_BRIDGES.get(entry.sessionKey);
			if (bridge?.containerName === entry.containerName) {
				await stopBrowserBridgeServer(bridge.bridge.server).catch(() => void 0);
				BROWSER_BRIDGES.delete(entry.sessionKey);
			}
		}
	}
}
async function maybePruneSandboxes(cfg) {
	const now = Date.now();
	if (now - lastPruneAtMs < 300 * 1e3) return;
	lastPruneAtMs = now;
	try {
		await pruneSandboxContainers(cfg);
		await pruneSandboxBrowsers(cfg);
	} catch (error) {
		const message = error instanceof Error ? error.message : typeof error === "string" ? error : JSON.stringify(error);
		defaultRuntime.error?.(`Sandbox prune failed: ${message ?? "unknown error"}`);
	}
}

//#endregion
//#region src/agents/sandbox/runtime-status.ts
function shouldSandboxSession(cfg, sessionKey, mainSessionKey) {
	if (cfg.mode === "off") return false;
	if (cfg.mode === "all") return true;
	return sessionKey.trim() !== mainSessionKey.trim();
}
function resolveMainSessionKeyForSandbox(params) {
	if (params.cfg?.session?.scope === "global") return "global";
	return resolveAgentMainSessionKey({
		cfg: params.cfg,
		agentId: params.agentId
	});
}
function resolveComparableSessionKeyForSandbox(params) {
	return canonicalizeMainSessionAlias({
		cfg: params.cfg,
		agentId: params.agentId,
		sessionKey: params.sessionKey
	});
}
function resolveSandboxRuntimeStatus(params) {
	const sessionKey = params.sessionKey?.trim() ?? "";
	const agentId = resolveSessionAgentId({
		sessionKey,
		config: params.cfg
	});
	const cfg = params.cfg;
	const sandboxCfg = resolveSandboxConfigForAgent(cfg, agentId);
	const mainSessionKey = resolveMainSessionKeyForSandbox({
		cfg,
		agentId
	});
	const sandboxed = sessionKey ? shouldSandboxSession(sandboxCfg, resolveComparableSessionKeyForSandbox({
		cfg,
		agentId,
		sessionKey
	}), mainSessionKey) : false;
	return {
		agentId,
		sessionKey,
		mainSessionKey,
		mode: sandboxCfg.mode,
		sandboxed,
		toolPolicy: resolveSandboxToolPolicyForAgent(cfg, agentId)
	};
}
function formatSandboxToolPolicyBlockedMessage(params) {
	const tool = params.toolName.trim().toLowerCase();
	if (!tool) return;
	const runtime = resolveSandboxRuntimeStatus({
		cfg: params.cfg,
		sessionKey: params.sessionKey
	});
	if (!runtime.sandboxed) return;
	const deny = new Set(expandToolGroups(runtime.toolPolicy.deny));
	const allow = expandToolGroups(runtime.toolPolicy.allow);
	const allowSet = allow.length > 0 ? new Set(allow) : null;
	const blockedByDeny = deny.has(tool);
	const blockedByAllow = allowSet ? !allowSet.has(tool) : false;
	if (!blockedByDeny && !blockedByAllow) return;
	const reasons = [];
	const fixes = [];
	if (blockedByDeny) {
		reasons.push("deny list");
		fixes.push(`Remove "${tool}" from ${runtime.toolPolicy.sources.deny.key}.`);
	}
	if (blockedByAllow) {
		reasons.push("allow list");
		fixes.push(`Add "${tool}" to ${runtime.toolPolicy.sources.allow.key} (or set it to [] to allow all).`);
	}
	const lines = [];
	lines.push(`Tool "${tool}" blocked by sandbox tool policy (mode=${runtime.mode}).`);
	lines.push(`Session: ${runtime.sessionKey || "(unknown)"}`);
	lines.push(`Reason: ${reasons.join(" + ")}`);
	lines.push("Fix:");
	lines.push(`- agents.defaults.sandbox.mode=off (disable sandbox)`);
	for (const fix of fixes) lines.push(`- ${fix}`);
	if (runtime.mode === "non-main") lines.push(`- Use main session key (direct): ${runtime.mainSessionKey}`);
	lines.push(`- See: ${formatCliCommand(`openclaw sandbox explain --session ${runtime.sessionKey}`)}`);
	return lines.join("\n");
}

//#endregion
//#region src/agents/sandbox/workspace.ts
async function ensureSandboxWorkspace(workspaceDir, seedFrom, skipBootstrap) {
	await fs.mkdir(workspaceDir, { recursive: true });
	if (seedFrom) {
		const seed = resolveUserPath(seedFrom);
		const files = [
			DEFAULT_AGENTS_FILENAME,
			DEFAULT_SOUL_FILENAME,
			DEFAULT_TOOLS_FILENAME,
			DEFAULT_IDENTITY_FILENAME,
			DEFAULT_USER_FILENAME,
			DEFAULT_BOOTSTRAP_FILENAME,
			DEFAULT_HEARTBEAT_FILENAME
		];
		for (const name of files) {
			const src = path.join(seed, name);
			const dest = path.join(workspaceDir, name);
			try {
				await fs.access(dest);
			} catch {
				try {
					const content = await fs.readFile(src, "utf-8");
					await fs.writeFile(dest, content, {
						encoding: "utf-8",
						flag: "wx"
					});
				} catch {}
			}
		}
	}
	await ensureAgentWorkspace({
		dir: workspaceDir,
		ensureBootstrapFiles: !skipBootstrap
	});
}

//#endregion
//#region src/agents/sandbox/context.ts
async function resolveSandboxContext(params) {
	const rawSessionKey = params.sessionKey?.trim();
	if (!rawSessionKey) return null;
	const runtime = resolveSandboxRuntimeStatus({
		cfg: params.config,
		sessionKey: rawSessionKey
	});
	if (!runtime.sandboxed) return null;
	const cfg = resolveSandboxConfigForAgent(params.config, runtime.agentId);
	await maybePruneSandboxes(cfg);
	const agentWorkspaceDir = resolveUserPath(params.workspaceDir?.trim() || DEFAULT_AGENT_WORKSPACE_DIR);
	const workspaceRoot = resolveUserPath(cfg.workspaceRoot);
	const scopeKey = resolveSandboxScopeKey(cfg.scope, rawSessionKey);
	const sandboxWorkspaceDir = cfg.scope === "shared" ? workspaceRoot : resolveSandboxWorkspaceDir(workspaceRoot, scopeKey);
	const workspaceDir = cfg.workspaceAccess === "rw" ? agentWorkspaceDir : sandboxWorkspaceDir;
	if (workspaceDir === sandboxWorkspaceDir) {
		await ensureSandboxWorkspace(sandboxWorkspaceDir, agentWorkspaceDir, params.config?.agents?.defaults?.skipBootstrap);
		if (cfg.workspaceAccess !== "rw") try {
			await syncSkillsToWorkspace({
				sourceWorkspaceDir: agentWorkspaceDir,
				targetWorkspaceDir: sandboxWorkspaceDir,
				config: params.config
			});
		} catch (error) {
			const message = error instanceof Error ? error.message : JSON.stringify(error);
			defaultRuntime.error?.(`Sandbox skill sync failed: ${message}`);
		}
	} else await fs.mkdir(workspaceDir, { recursive: true });
	const containerName = await ensureSandboxContainer({
		sessionKey: rawSessionKey,
		workspaceDir,
		agentWorkspaceDir,
		cfg
	});
	const browser = await ensureSandboxBrowser({
		scopeKey,
		workspaceDir,
		agentWorkspaceDir,
		cfg,
		evaluateEnabled: params.config?.browser?.evaluateEnabled ?? DEFAULT_BROWSER_EVALUATE_ENABLED
	});
	const sandboxContext = {
		enabled: true,
		sessionKey: rawSessionKey,
		workspaceDir,
		agentWorkspaceDir,
		workspaceAccess: cfg.workspaceAccess,
		containerName,
		containerWorkdir: cfg.docker.workdir,
		docker: cfg.docker,
		tools: cfg.tools,
		browserAllowHostControl: cfg.browser.allowHostControl,
		browser: browser ?? void 0
	};
	sandboxContext.fsBridge = createSandboxFsBridge({ sandbox: sandboxContext });
	return sandboxContext;
}
async function ensureSandboxWorkspaceForSession(params) {
	const rawSessionKey = params.sessionKey?.trim();
	if (!rawSessionKey) return null;
	const runtime = resolveSandboxRuntimeStatus({
		cfg: params.config,
		sessionKey: rawSessionKey
	});
	if (!runtime.sandboxed) return null;
	const cfg = resolveSandboxConfigForAgent(params.config, runtime.agentId);
	const agentWorkspaceDir = resolveUserPath(params.workspaceDir?.trim() || DEFAULT_AGENT_WORKSPACE_DIR);
	const workspaceRoot = resolveUserPath(cfg.workspaceRoot);
	const scopeKey = resolveSandboxScopeKey(cfg.scope, rawSessionKey);
	const sandboxWorkspaceDir = cfg.scope === "shared" ? workspaceRoot : resolveSandboxWorkspaceDir(workspaceRoot, scopeKey);
	const workspaceDir = cfg.workspaceAccess === "rw" ? agentWorkspaceDir : sandboxWorkspaceDir;
	if (workspaceDir === sandboxWorkspaceDir) {
		await ensureSandboxWorkspace(sandboxWorkspaceDir, agentWorkspaceDir, params.config?.agents?.defaults?.skipBootstrap);
		if (cfg.workspaceAccess !== "rw") try {
			await syncSkillsToWorkspace({
				sourceWorkspaceDir: agentWorkspaceDir,
				targetWorkspaceDir: sandboxWorkspaceDir,
				config: params.config
			});
		} catch (error) {
			const message = error instanceof Error ? error.message : JSON.stringify(error);
			defaultRuntime.error?.(`Sandbox skill sync failed: ${message}`);
		}
	} else await fs.mkdir(workspaceDir, { recursive: true });
	return {
		workspaceDir,
		containerWorkdir: cfg.docker.workdir
	};
}

//#endregion
//#region src/agents/sandbox/manage.ts
async function listSandboxContainers() {
	const config = loadConfig();
	const registry = await readRegistry();
	const results = [];
	for (const entry of registry.entries) {
		const state = await dockerContainerState(entry.containerName);
		let actualImage = entry.image;
		if (state.exists) try {
			const result = await execDocker([
				"inspect",
				"-f",
				"{{.Config.Image}}",
				entry.containerName
			], { allowFailure: true });
			if (result.code === 0) actualImage = result.stdout.trim();
		} catch {}
		const configuredImage = resolveSandboxConfigForAgent(config, resolveSandboxAgentId(entry.sessionKey)).docker.image;
		results.push({
			...entry,
			image: actualImage,
			running: state.running,
			imageMatch: actualImage === configuredImage
		});
	}
	return results;
}
async function listSandboxBrowsers() {
	const config = loadConfig();
	const registry = await readBrowserRegistry();
	const results = [];
	for (const entry of registry.entries) {
		const state = await dockerContainerState(entry.containerName);
		let actualImage = entry.image;
		if (state.exists) try {
			const result = await execDocker([
				"inspect",
				"-f",
				"{{.Config.Image}}",
				entry.containerName
			], { allowFailure: true });
			if (result.code === 0) actualImage = result.stdout.trim();
		} catch {}
		const configuredImage = resolveSandboxConfigForAgent(config, resolveSandboxAgentId(entry.sessionKey)).browser.image;
		results.push({
			...entry,
			image: actualImage,
			running: state.running,
			imageMatch: actualImage === configuredImage
		});
	}
	return results;
}
async function removeSandboxContainer(containerName) {
	try {
		await execDocker([
			"rm",
			"-f",
			containerName
		], { allowFailure: true });
	} catch {}
	await removeRegistryEntry(containerName);
}
async function removeSandboxBrowserContainer(containerName) {
	try {
		await execDocker([
			"rm",
			"-f",
			containerName
		], { allowFailure: true });
	} catch {}
	await removeBrowserRegistryEntry(containerName);
	for (const [sessionKey, bridge] of BROWSER_BRIDGES.entries()) if (bridge.containerName === containerName) {
		await stopBrowserBridgeServer(bridge.bridge.server).catch(() => void 0);
		BROWSER_BRIDGES.delete(sessionKey);
	}
}

//#endregion
export { DEFAULT_SANDBOX_IMAGE as S, normalizeToolName as _, ensureSandboxWorkspaceForSession as a, DEFAULT_SANDBOX_BROWSER_IMAGE as b, resolveSandboxRuntimeStatus as c, resolveSandboxToolPolicyForAgent as d, applyOwnerOnlyToolPolicy as f, expandToolGroups as g, expandPolicyWithPluginGroups as h, removeSandboxContainer as i, resolveSandboxConfigForAgent as l, collectExplicitAllowlist as m, listSandboxContainers as n, resolveSandboxContext as o, buildPluginToolGroups as p, removeSandboxBrowserContainer as r, formatSandboxToolPolicyBlockedMessage as s, listSandboxBrowsers as t, resolveSandboxScope as u, resolveToolProfilePolicy as v, DEFAULT_SANDBOX_COMMON_IMAGE as x, stripPluginOnlyAllowlist as y };