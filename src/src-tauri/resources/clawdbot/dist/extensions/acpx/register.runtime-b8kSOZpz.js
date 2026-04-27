import { registerAcpRuntimeBackend, unregisterAcpRuntimeBackend } from "./runtime-api.js";
import { createRequire } from "node:module";
import fs from "node:fs/promises";
import { inspect } from "node:util";
import { formatErrorMessage } from "openclaw/plugin-sdk/error-runtime";
import fs$1 from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { formatPluginConfigIssue } from "openclaw/plugin-sdk/extension-shared";
import { normalizeLowercaseStringOrEmpty } from "openclaw/plugin-sdk/text-runtime";
import { buildPluginConfigSchema } from "openclaw/plugin-sdk/core";
import { z } from "openclaw/plugin-sdk/zod";
import { ACPX_BACKEND_ID, AcpxRuntime, createAgentRegistry, createFileSessionStore, decodeAcpxRuntimeHandleState } from "acpx/runtime";
//#region extensions/acpx/src/codex-auth-bridge.ts
async function prepareAcpxCodexAuthConfig(params) {
	params.stateDir;
	params.logger;
	return params.pluginConfig;
}
//#endregion
//#region extensions/acpx/src/config-schema.ts
const ACPX_PERMISSION_MODES = [
	"approve-all",
	"approve-reads",
	"deny-all"
];
const ACPX_NON_INTERACTIVE_POLICIES = ["deny", "fail"];
const nonEmptyTrimmedString = (message) => z.string({ error: message }).trim().min(1, { error: message });
const McpServerConfigSchema = z.object({
	command: nonEmptyTrimmedString("command must be a non-empty string").describe("Command to run the MCP server"),
	args: z.array(z.string({ error: "args must be an array of strings" }), { error: "args must be an array of strings" }).optional().describe("Arguments to pass to the command"),
	env: z.record(z.string(), z.string({ error: "env values must be strings" }), { error: "env must be an object of strings" }).optional().describe("Environment variables for the MCP server")
});
const AcpxPluginConfigSchema = z.strictObject({
	cwd: nonEmptyTrimmedString("cwd must be a non-empty string").optional(),
	stateDir: nonEmptyTrimmedString("stateDir must be a non-empty string").optional(),
	probeAgent: nonEmptyTrimmedString("probeAgent must be a non-empty string").optional(),
	permissionMode: z.enum(ACPX_PERMISSION_MODES, { error: `permissionMode must be one of: ${ACPX_PERMISSION_MODES.join(", ")}` }).optional(),
	nonInteractivePermissions: z.enum(ACPX_NON_INTERACTIVE_POLICIES, { error: `nonInteractivePermissions must be one of: ${ACPX_NON_INTERACTIVE_POLICIES.join(", ")}` }).optional(),
	pluginToolsMcpBridge: z.boolean({ error: "pluginToolsMcpBridge must be a boolean" }).optional(),
	openClawToolsMcpBridge: z.boolean({ error: "openClawToolsMcpBridge must be a boolean" }).optional(),
	strictWindowsCmdWrapper: z.boolean({ error: "strictWindowsCmdWrapper must be a boolean" }).optional(),
	timeoutSeconds: z.number({ error: "timeoutSeconds must be a number >= 0.001" }).min(.001, { error: "timeoutSeconds must be a number >= 0.001" }).default(120),
	queueOwnerTtlSeconds: z.number({ error: "queueOwnerTtlSeconds must be a number >= 0" }).min(0, { error: "queueOwnerTtlSeconds must be a number >= 0" }).optional(),
	mcpServers: z.record(z.string(), McpServerConfigSchema).optional(),
	agents: z.record(z.string(), z.strictObject({ command: nonEmptyTrimmedString("agents.<id>.command must be a non-empty string") })).optional()
});
function createAcpxPluginConfigSchema() {
	return buildPluginConfigSchema(AcpxPluginConfigSchema);
}
//#endregion
//#region extensions/acpx/src/config.ts
const ACPX_PLUGIN_TOOLS_MCP_SERVER_NAME = "openclaw-plugin-tools";
const ACPX_OPENCLAW_TOOLS_MCP_SERVER_NAME = "openclaw-tools";
const requireFromHere = createRequire(import.meta.url);
function isAcpxPluginRoot(dir) {
	return fs$1.existsSync(path.join(dir, "openclaw.plugin.json")) && fs$1.existsSync(path.join(dir, "package.json"));
}
function resolveNearestAcpxPluginRoot(moduleUrl) {
	let cursor = path.dirname(fileURLToPath(moduleUrl));
	for (let i = 0; i < 3; i += 1) {
		if (isAcpxPluginRoot(cursor)) return cursor;
		const parent = path.dirname(cursor);
		if (parent === cursor) break;
		cursor = parent;
	}
	return path.resolve(path.dirname(fileURLToPath(moduleUrl)), "..");
}
function resolveWorkspaceAcpxPluginRoot(currentRoot) {
	if (path.basename(currentRoot) !== "acpx" || path.basename(path.dirname(currentRoot)) !== "extensions" || path.basename(path.dirname(path.dirname(currentRoot))) !== "dist") return null;
	const workspaceRoot = path.resolve(currentRoot, "..", "..", "..", "extensions", "acpx");
	return isAcpxPluginRoot(workspaceRoot) ? workspaceRoot : null;
}
function resolveRepoAcpxPluginRoot(currentRoot) {
	const workspaceRoot = path.join(currentRoot, "extensions", "acpx");
	return isAcpxPluginRoot(workspaceRoot) ? workspaceRoot : null;
}
function resolveAcpxPluginRootFromOpenClawLayout(moduleUrl) {
	let cursor = path.dirname(fileURLToPath(moduleUrl));
	for (let i = 0; i < 5; i += 1) {
		const candidates = [
			path.join(cursor, "extensions", "acpx"),
			path.join(cursor, "dist", "extensions", "acpx"),
			path.join(cursor, "dist-runtime", "extensions", "acpx")
		];
		for (const candidate of candidates) if (isAcpxPluginRoot(candidate)) return candidate;
		const parent = path.dirname(cursor);
		if (parent === cursor) break;
		cursor = parent;
	}
	return null;
}
function resolveAcpxPluginRoot(moduleUrl = import.meta.url) {
	const resolvedRoot = resolveNearestAcpxPluginRoot(moduleUrl);
	return resolveWorkspaceAcpxPluginRoot(resolvedRoot) ?? resolveRepoAcpxPluginRoot(resolvedRoot) ?? resolveAcpxPluginRootFromOpenClawLayout(moduleUrl) ?? resolvedRoot;
}
resolveAcpxPluginRoot();
const DEFAULT_PERMISSION_MODE = "approve-reads";
const DEFAULT_NON_INTERACTIVE_POLICY = "fail";
const DEFAULT_QUEUE_OWNER_TTL_SECONDS = .1;
const DEFAULT_STRICT_WINDOWS_CMD_WRAPPER = true;
function parseAcpxPluginConfig(value) {
	if (value === void 0) return {
		ok: true,
		value: void 0
	};
	const parsed = AcpxPluginConfigSchema.safeParse(value);
	if (!parsed.success) return {
		ok: false,
		message: formatPluginConfigIssue(parsed.error.issues[0])
	};
	return {
		ok: true,
		value: parsed.data
	};
}
function resolveOpenClawRoot(currentRoot) {
	if (path.basename(currentRoot) === "acpx" && path.basename(path.dirname(currentRoot)) === "extensions") {
		const parent = path.dirname(path.dirname(currentRoot));
		if (path.basename(parent) === "dist") return path.dirname(parent);
		return parent;
	}
	return path.resolve(currentRoot, "..");
}
function resolveTsxImportSpecifier() {
	try {
		return requireFromHere.resolve("tsx");
	} catch {
		return "tsx";
	}
}
function resolvePluginToolsMcpServerConfig(moduleUrl = import.meta.url) {
	const openClawRoot = resolveOpenClawRoot(resolveAcpxPluginRoot(moduleUrl));
	const distEntry = path.join(openClawRoot, "dist", "mcp", "plugin-tools-serve.js");
	if (fs$1.existsSync(distEntry)) return {
		command: process.execPath,
		args: [distEntry]
	};
	const sourceEntry = path.join(openClawRoot, "src", "mcp", "plugin-tools-serve.ts");
	return {
		command: process.execPath,
		args: [
			"--import",
			resolveTsxImportSpecifier(),
			sourceEntry
		]
	};
}
function resolveOpenClawToolsMcpServerConfig(moduleUrl = import.meta.url) {
	const openClawRoot = resolveOpenClawRoot(resolveAcpxPluginRoot(moduleUrl));
	const distEntry = path.join(openClawRoot, "dist", "mcp", "openclaw-tools-serve.js");
	if (fs$1.existsSync(distEntry)) return {
		command: process.execPath,
		args: [distEntry]
	};
	const sourceEntry = path.join(openClawRoot, "src", "mcp", "openclaw-tools-serve.ts");
	return {
		command: process.execPath,
		args: [
			"--import",
			resolveTsxImportSpecifier(),
			sourceEntry
		]
	};
}
function resolveConfiguredMcpServers(params) {
	const resolved = { ...params.mcpServers };
	if (params.pluginToolsMcpBridge && resolved["openclaw-plugin-tools"]) throw new Error(`mcpServers.${ACPX_PLUGIN_TOOLS_MCP_SERVER_NAME} is reserved when pluginToolsMcpBridge=true`);
	if (params.openClawToolsMcpBridge && resolved["openclaw-tools"]) throw new Error(`mcpServers.${ACPX_OPENCLAW_TOOLS_MCP_SERVER_NAME} is reserved when openClawToolsMcpBridge=true`);
	if (params.pluginToolsMcpBridge) resolved[ACPX_PLUGIN_TOOLS_MCP_SERVER_NAME] = resolvePluginToolsMcpServerConfig(params.moduleUrl);
	if (params.openClawToolsMcpBridge) resolved[ACPX_OPENCLAW_TOOLS_MCP_SERVER_NAME] = resolveOpenClawToolsMcpServerConfig(params.moduleUrl);
	return resolved;
}
function toAcpMcpServers(mcpServers) {
	return Object.entries(mcpServers).map(([name, server]) => ({
		name,
		command: server.command,
		args: [...server.args ?? []],
		env: Object.entries(server.env ?? {}).map(([envName, value]) => ({
			name: envName,
			value
		}))
	}));
}
function resolveAcpxPluginConfig(params) {
	const parsed = parseAcpxPluginConfig(params.rawConfig);
	if (!parsed.ok) throw new Error(parsed.message);
	const normalized = parsed.value ?? {};
	const workspaceDir = params.workspaceDir?.trim() || process.cwd();
	const fallbackCwd = workspaceDir;
	const cwd = path.resolve(normalized.cwd?.trim() || fallbackCwd);
	const stateDir = path.resolve(normalized.stateDir?.trim() || path.join(workspaceDir, "state"));
	const pluginToolsMcpBridge = normalized.pluginToolsMcpBridge === true;
	const openClawToolsMcpBridge = normalized.openClawToolsMcpBridge === true;
	const mcpServers = resolveConfiguredMcpServers({
		mcpServers: normalized.mcpServers,
		pluginToolsMcpBridge,
		openClawToolsMcpBridge,
		moduleUrl: params.moduleUrl
	});
	const agents = Object.fromEntries(Object.entries(normalized.agents ?? {}).map(([name, entry]) => [normalizeLowercaseStringOrEmpty(name), entry.command.trim()]));
	return {
		cwd,
		stateDir,
		probeAgent: normalizeLowercaseStringOrEmpty(normalized.probeAgent) || void 0,
		permissionMode: normalized.permissionMode ?? DEFAULT_PERMISSION_MODE,
		nonInteractivePermissions: normalized.nonInteractivePermissions ?? DEFAULT_NON_INTERACTIVE_POLICY,
		pluginToolsMcpBridge,
		openClawToolsMcpBridge,
		strictWindowsCmdWrapper: normalized.strictWindowsCmdWrapper ?? DEFAULT_STRICT_WINDOWS_CMD_WRAPPER,
		timeoutSeconds: normalized.timeoutSeconds ?? 120,
		queueOwnerTtlSeconds: normalized.queueOwnerTtlSeconds ?? DEFAULT_QUEUE_OWNER_TTL_SECONDS,
		legacyCompatibilityConfig: {
			strictWindowsCmdWrapper: normalized.strictWindowsCmdWrapper,
			queueOwnerTtlSeconds: normalized.queueOwnerTtlSeconds
		},
		mcpServers,
		agents
	};
}
//#endregion
//#region extensions/acpx/src/runtime.ts
function readSessionRecordName(record) {
	if (typeof record !== "object" || record === null) return "";
	const { name } = record;
	return typeof name === "string" ? name.trim() : "";
}
function createResetAwareSessionStore(baseStore) {
	const freshSessionKeys = /* @__PURE__ */ new Set();
	return {
		async load(sessionId) {
			const normalized = sessionId.trim();
			if (normalized && freshSessionKeys.has(normalized)) return;
			return await baseStore.load(sessionId);
		},
		async save(record) {
			await baseStore.save(record);
			const sessionName = readSessionRecordName(record);
			if (sessionName) freshSessionKeys.delete(sessionName);
		},
		markFresh(sessionKey) {
			const normalized = sessionKey.trim();
			if (normalized) freshSessionKeys.add(normalized);
		}
	};
}
const OPENCLAW_BRIDGE_EXECUTABLE = "openclaw";
const OPENCLAW_BRIDGE_SUBCOMMAND = "acp";
function normalizeAgentName(value) {
	const normalized = value?.trim().toLowerCase();
	return normalized ? normalized : void 0;
}
function readAgentFromSessionKey(sessionKey) {
	const normalized = sessionKey?.trim();
	if (!normalized) return;
	return normalizeAgentName(/^agent:(?<agent>[^:]+):/i.exec(normalized)?.groups?.agent);
}
function readAgentFromHandle(handle) {
	const decoded = decodeAcpxRuntimeHandleState(handle.runtimeSessionName);
	if (typeof decoded === "object" && decoded !== null) {
		const { agent } = decoded;
		if (typeof agent === "string") return normalizeAgentName(agent) ?? readAgentFromSessionKey(handle.sessionKey);
	}
	return readAgentFromSessionKey(handle.sessionKey);
}
function readAgentCommandFromRecord(record) {
	if (typeof record !== "object" || record === null) return;
	const { agentCommand } = record;
	return typeof agentCommand === "string" ? agentCommand.trim() || void 0 : void 0;
}
function splitCommandParts(value) {
	const parts = [];
	let current = "";
	let quote = null;
	let escaping = false;
	for (const ch of value) {
		if (escaping) {
			current += ch;
			escaping = false;
			continue;
		}
		if (ch === "\\" && quote !== "'") {
			escaping = true;
			continue;
		}
		if (quote) {
			if (ch === quote) quote = null;
			else current += ch;
			continue;
		}
		if (ch === "'" || ch === "\"") {
			quote = ch;
			continue;
		}
		if (/\s/.test(ch)) {
			if (current) {
				parts.push(current);
				current = "";
			}
			continue;
		}
		current += ch;
	}
	if (escaping) current += "\\";
	if (current) parts.push(current);
	return parts;
}
function basename(value) {
	return value.split(/[\\/]/).pop() ?? value;
}
function isEnvAssignment(value) {
	return /^[A-Za-z_][A-Za-z0-9_]*=/.test(value);
}
function unwrapEnvCommand(parts) {
	if (!parts.length || basename(parts[0]) !== "env") return parts;
	let index = 1;
	while (index < parts.length && isEnvAssignment(parts[index])) index += 1;
	return parts.slice(index);
}
function isOpenClawBridgeCommand(command) {
	if (!command) return false;
	const parts = unwrapEnvCommand(splitCommandParts(command.trim()));
	if (basename(parts[0] ?? "") === OPENCLAW_BRIDGE_EXECUTABLE) return parts[1] === OPENCLAW_BRIDGE_SUBCOMMAND;
	if (basename(parts[0] ?? "") !== "node") return false;
	const scriptName = basename(parts[1] ?? "");
	return /^openclaw(?:\.[cm]?js)?$/i.test(scriptName) && parts[2] === OPENCLAW_BRIDGE_SUBCOMMAND;
}
function resolveAgentCommand(params) {
	const normalizedAgentName = normalizeAgentName(params.agentName);
	if (!normalizedAgentName) return;
	const resolvedCommand = params.agentRegistry.resolve(normalizedAgentName);
	return typeof resolvedCommand === "string" ? resolvedCommand.trim() || void 0 : void 0;
}
function resolveProbeAgentName(options) {
	const { probeAgent } = options;
	return normalizeAgentName(typeof probeAgent === "string" ? probeAgent : void 0) ?? "codex";
}
function resolveAgentCommandForName(params) {
	return resolveAgentCommand(params);
}
function shouldUseBridgeSafeDelegateForCommand(command) {
	return isOpenClawBridgeCommand(command);
}
function shouldUseDistinctBridgeDelegate(options) {
	const { mcpServers } = options;
	return Array.isArray(mcpServers) && mcpServers.length > 0;
}
var AcpxRuntime$1 = class {
	constructor(options, testOptions) {
		this.sessionStore = createResetAwareSessionStore(options.sessionStore);
		this.agentRegistry = options.agentRegistry;
		const sharedOptions = {
			...options,
			sessionStore: this.sessionStore
		};
		this.delegate = new AcpxRuntime(sharedOptions, testOptions);
		this.bridgeSafeDelegate = shouldUseDistinctBridgeDelegate(options) ? new AcpxRuntime({
			...sharedOptions,
			mcpServers: []
		}, testOptions) : this.delegate;
		this.probeDelegate = this.resolveDelegateForAgent(resolveProbeAgentName(options));
	}
	resolveDelegateForAgent(agentName) {
		const command = resolveAgentCommandForName({
			agentName,
			agentRegistry: this.agentRegistry
		});
		return this.resolveDelegateForCommand(command);
	}
	resolveDelegateForCommand(command) {
		return shouldUseBridgeSafeDelegateForCommand(command) ? this.bridgeSafeDelegate : this.delegate;
	}
	async resolveDelegateForHandle(handle) {
		const recordCommand = readAgentCommandFromRecord(await this.sessionStore.load(handle.acpxRecordId ?? handle.sessionKey));
		if (recordCommand) return this.resolveDelegateForCommand(recordCommand);
		return this.resolveDelegateForAgent(readAgentFromHandle(handle));
	}
	isHealthy() {
		return this.probeDelegate.isHealthy();
	}
	probeAvailability() {
		return this.probeDelegate.probeAvailability();
	}
	doctor() {
		return this.probeDelegate.doctor();
	}
	ensureSession(input) {
		return this.resolveDelegateForAgent(input.agent).ensureSession(input);
	}
	async *runTurn(input) {
		yield* (await this.resolveDelegateForHandle(input.handle)).runTurn(input);
	}
	getCapabilities() {
		return this.delegate.getCapabilities();
	}
	async getStatus(input) {
		return (await this.resolveDelegateForHandle(input.handle)).getStatus(input);
	}
	async setMode(input) {
		await (await this.resolveDelegateForHandle(input.handle)).setMode(input);
	}
	async setConfigOption(input) {
		await (await this.resolveDelegateForHandle(input.handle)).setConfigOption(input);
	}
	async cancel(input) {
		await (await this.resolveDelegateForHandle(input.handle)).cancel(input);
	}
	async prepareFreshSession(input) {
		this.sessionStore.markFresh(input.sessionKey);
	}
	async close(input) {
		await (await this.resolveDelegateForHandle(input.handle)).close({
			handle: input.handle,
			reason: input.reason,
			discardPersistentState: input.discardPersistentState
		});
		if (input.discardPersistentState) this.sessionStore.markFresh(input.handle.sessionKey);
	}
};
//#endregion
//#region extensions/acpx/src/service.ts
function createDefaultRuntime(params) {
	return new AcpxRuntime$1({
		cwd: params.pluginConfig.cwd,
		sessionStore: createFileSessionStore({ stateDir: params.pluginConfig.stateDir }),
		agentRegistry: createAgentRegistry({ overrides: params.pluginConfig.agents }),
		probeAgent: params.pluginConfig.probeAgent,
		mcpServers: toAcpMcpServers(params.pluginConfig.mcpServers),
		permissionMode: params.pluginConfig.permissionMode,
		nonInteractivePermissions: params.pluginConfig.nonInteractivePermissions,
		timeoutMs: params.pluginConfig.timeoutSeconds != null ? params.pluginConfig.timeoutSeconds * 1e3 : void 0
	});
}
function warnOnIgnoredLegacyCompatibilityConfig(params) {
	const ignoredFields = [];
	if (params.pluginConfig.legacyCompatibilityConfig.queueOwnerTtlSeconds != null) ignoredFields.push("queueOwnerTtlSeconds");
	if (params.pluginConfig.legacyCompatibilityConfig.strictWindowsCmdWrapper === false) ignoredFields.push("strictWindowsCmdWrapper=false");
	if (ignoredFields.length === 0) return;
	params.logger?.warn(`embedded acpx runtime ignores legacy compatibility config: ${ignoredFields.join(", ")}`);
}
function formatDoctorDetail(detail) {
	if (!detail) return null;
	if (typeof detail === "string") return detail.trim() || null;
	if (detail instanceof Error) return formatErrorMessage(detail);
	if (typeof detail === "object") try {
		return JSON.stringify(detail) ?? inspect(detail, {
			breakLength: Infinity,
			depth: 3
		});
	} catch {
		return inspect(detail, {
			breakLength: Infinity,
			depth: 3
		});
	}
	if (typeof detail === "number" || typeof detail === "boolean" || typeof detail === "bigint" || typeof detail === "symbol") return detail.toString();
	return inspect(detail, {
		breakLength: Infinity,
		depth: 3
	});
}
function formatDoctorFailureMessage(report) {
	const detailText = report.details?.map(formatDoctorDetail).filter(Boolean).join("; ").trim();
	return detailText ? `${report.message} (${detailText})` : report.message;
}
function normalizeProbeAgent(value) {
	const normalized = value?.trim().toLowerCase();
	return normalized ? normalized : void 0;
}
function resolveAllowedAgentsProbeAgent(ctx) {
	for (const agent of ctx.config.acp?.allowedAgents ?? []) {
		const normalized = normalizeProbeAgent(agent);
		if (normalized) return normalized;
	}
}
function createAcpxRuntimeService(params = {}) {
	let runtime = null;
	let lifecycleRevision = 0;
	return {
		id: "acpx-runtime",
		async start(ctx) {
			if (process.env.OPENCLAW_SKIP_ACPX_RUNTIME === "1") {
				ctx.logger.info("skipping embedded acpx runtime backend (OPENCLAW_SKIP_ACPX_RUNTIME=1)");
				return;
			}
			const basePluginConfig = resolveAcpxPluginConfig({
				rawConfig: params.pluginConfig,
				workspaceDir: ctx.workspaceDir
			});
			const pluginConfig = await prepareAcpxCodexAuthConfig({
				pluginConfig: {
					...basePluginConfig,
					probeAgent: basePluginConfig.probeAgent ?? resolveAllowedAgentsProbeAgent(ctx)
				},
				stateDir: ctx.stateDir,
				logger: ctx.logger
			});
			await fs.mkdir(pluginConfig.stateDir, { recursive: true });
			warnOnIgnoredLegacyCompatibilityConfig({
				pluginConfig,
				logger: ctx.logger
			});
			runtime = (params.runtimeFactory ?? createDefaultRuntime)({
				pluginConfig,
				logger: ctx.logger
			});
			registerAcpRuntimeBackend({
				id: ACPX_BACKEND_ID,
				runtime,
				healthy: () => runtime?.isHealthy() ?? false
			});
			ctx.logger.info(`embedded acpx runtime backend registered (cwd: ${pluginConfig.cwd})`);
			if (process.env.OPENCLAW_SKIP_ACPX_RUNTIME_PROBE === "1") return;
			lifecycleRevision += 1;
			const currentRevision = lifecycleRevision;
			(async () => {
				try {
					await runtime?.probeAvailability();
					if (currentRevision !== lifecycleRevision) return;
					if (runtime?.isHealthy()) {
						ctx.logger.info("embedded acpx runtime backend ready");
						return;
					}
					const doctorReport = await runtime?.doctor?.();
					if (currentRevision !== lifecycleRevision) return;
					ctx.logger.warn(`embedded acpx runtime backend probe failed: ${doctorReport ? formatDoctorFailureMessage(doctorReport) : "backend remained unhealthy after probe"}`);
				} catch (err) {
					if (currentRevision !== lifecycleRevision) return;
					ctx.logger.warn(`embedded acpx runtime setup failed: ${formatErrorMessage(err)}`);
				}
			})();
		},
		async stop(_ctx) {
			lifecycleRevision += 1;
			unregisterAcpRuntimeBackend(ACPX_BACKEND_ID);
			runtime = null;
		}
	};
}
//#endregion
export { createAcpxPluginConfigSchema as n, createAcpxRuntimeService as t };
