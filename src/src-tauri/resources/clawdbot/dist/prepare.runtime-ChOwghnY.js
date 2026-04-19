import { o as normalizeOptionalLowercaseString, s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { r as normalizeProviderId } from "./provider-id-KaStHhRz.js";
import { i as applyMergePatch } from "./schema-validator-Byqt0Q69.js";
import { m as resolveSessionAgentIds } from "./agent-scope-KFH9bkHi.js";
import { a as loadAuthProfileStoreForRuntime, g as readCodexCliCredentialsCached, h as readClaudeCliCredentialsCached } from "./store-C1I9Mkh8.js";
import { n as mergePluginTextTransforms, t as applyPluginTextReplacements } from "./plugin-text-transforms-BQzFygd9.js";
import { n as resolvePluginSetupCliBackend } from "./setup-registry-ytDuF5P6.js";
import { f as extractMcpServerMap, m as loadEnabledBundleMcpConfig } from "./loader-DYW2PvbF.js";
import { J as resolveRuntimeTextTransforms } from "./provider-runtime-khVgWetm.js";
import { n as resolveRuntimeCliBackends } from "./model-selection-cli-_3Gn8Wcd.js";
import "./model-selection-CTdyYoio.js";
import { i as buildBootstrapTruncationReportMeta, n as buildBootstrapInjectionStats, r as buildBootstrapPromptWarning, t as analyzeBootstrapBudget } from "./bootstrap-budget-BfULAZ3v.js";
import { i as resolveBootstrapContextForRun, o as resolveHeartbeatPromptForSystemPrompt, r as makeBootstrapWarn } from "./bootstrap-files-ZYTN7n8L.js";
import { _ as resolveBootstrapPromptTruncationWarningMode, g as resolveBootstrapMaxChars, v as resolveBootstrapTotalMaxChars } from "./pi-embedded-helpers-6UMMUO8y.js";
import { c as resolveSkillsPromptForRun } from "./skills-Cwx5TftI.js";
import { t as resolveSystemPromptOverride } from "./system-prompt-override-CuDxkMuk.js";
import { t as buildSystemPromptReport } from "./system-prompt-report-CLLKjEMB.js";
import { n as resolveRunWorkspaceDir, t as redactRunIdentifier } from "./workspace-run-BpESKBl2.js";
import { a as resolveCliSessionReuse, i as hashCliSessionText } from "./cli-session-a7nu3l6_.js";
import { g as cliBackendLog, i as normalizeCliModel, n as buildSystemPrompt, p as serializeTomlInlineValue } from "./helpers-BSxabu9q.js";
import { i as getActiveMcpLoopbackRuntime, n as ensureMcpLoopbackServer, r as createMcpLoopbackServerConfig } from "./mcp-http-LDZ2tv6U.js";
import path from "node:path";
import os from "node:os";
import fs from "node:fs/promises";
import crypto from "node:crypto";
const cliAuthEpochDeps = {
	readClaudeCliCredentialsCached,
	readCodexCliCredentialsCached,
	loadAuthProfileStoreForRuntime
};
function hashCliAuthEpochPart(value) {
	return crypto.createHash("sha256").update(value).digest("hex");
}
function encodeUnknown(value) {
	return JSON.stringify(value ?? null);
}
function encodeClaudeCredential(credential) {
	if (credential.type === "oauth") return JSON.stringify([
		"oauth",
		credential.provider,
		credential.access,
		credential.refresh,
		credential.expires
	]);
	return JSON.stringify([
		"token",
		credential.provider,
		credential.token,
		credential.expires
	]);
}
function encodeCodexCredential(credential) {
	return JSON.stringify([
		credential.type,
		credential.provider,
		credential.access,
		credential.refresh,
		credential.expires,
		credential.accountId ?? null
	]);
}
function encodeAuthProfileCredential(credential) {
	switch (credential.type) {
		case "api_key": return JSON.stringify([
			"api_key",
			credential.provider,
			credential.key ?? null,
			encodeUnknown(credential.keyRef),
			credential.email ?? null,
			credential.displayName ?? null,
			encodeUnknown(credential.metadata)
		]);
		case "token": return JSON.stringify([
			"token",
			credential.provider,
			credential.token ?? null,
			encodeUnknown(credential.tokenRef),
			credential.expires ?? null,
			credential.email ?? null,
			credential.displayName ?? null
		]);
		case "oauth": return JSON.stringify([
			"oauth",
			credential.provider,
			credential.access,
			credential.refresh,
			credential.expires,
			credential.clientId ?? null,
			credential.email ?? null,
			credential.displayName ?? null,
			credential.enterpriseUrl ?? null,
			credential.projectId ?? null,
			credential.accountId ?? null,
			credential.managedBy ?? null
		]);
	}
	throw new Error("Unsupported auth profile credential type");
}
function getLocalCliCredentialFingerprint(provider) {
	switch (provider) {
		case "claude-cli": {
			const credential = cliAuthEpochDeps.readClaudeCliCredentialsCached({
				ttlMs: 5e3,
				allowKeychainPrompt: false
			});
			return credential ? hashCliAuthEpochPart(encodeClaudeCredential(credential)) : void 0;
		}
		case "codex-cli": {
			const credential = cliAuthEpochDeps.readCodexCliCredentialsCached({ ttlMs: 5e3 });
			return credential ? hashCliAuthEpochPart(encodeCodexCredential(credential)) : void 0;
		}
		default: return;
	}
}
function getAuthProfileCredential(store, authProfileId) {
	if (!authProfileId) return;
	return store.profiles[authProfileId];
}
async function resolveCliAuthEpoch(params) {
	const provider = params.provider.trim();
	const authProfileId = normalizeOptionalString(params.authProfileId);
	const parts = [];
	const localFingerprint = getLocalCliCredentialFingerprint(provider);
	if (localFingerprint) parts.push(`local:${provider}:${localFingerprint}`);
	if (authProfileId) {
		const credential = getAuthProfileCredential(cliAuthEpochDeps.loadAuthProfileStoreForRuntime(void 0, {
			readOnly: true,
			allowKeychainPrompt: false
		}), authProfileId);
		if (credential) parts.push(`profile:${authProfileId}:${hashCliAuthEpochPart(encodeAuthProfileCredential(credential))}`);
	}
	if (parts.length === 0) return;
	return hashCliAuthEpochPart(parts.join("\n"));
}
let cliBackendsDeps = {
	resolvePluginSetupCliBackend,
	resolveRuntimeCliBackends
};
const FALLBACK_CLI_BACKEND_POLICIES = {};
function normalizeBundleMcpMode(mode, enabled) {
	if (!enabled) return;
	return mode ?? "claude-config-file";
}
function resolveSetupCliBackendPolicy(provider) {
	const entry = cliBackendsDeps.resolvePluginSetupCliBackend({ backend: provider });
	if (!entry) return;
	return {
		bundleMcp: entry.backend.bundleMcp === true,
		bundleMcpMode: normalizeBundleMcpMode(entry.backend.bundleMcpMode, entry.backend.bundleMcp === true),
		baseConfig: entry.backend.config,
		normalizeConfig: entry.backend.normalizeConfig,
		transformSystemPrompt: entry.backend.transformSystemPrompt,
		textTransforms: entry.backend.textTransforms
	};
}
function resolveFallbackCliBackendPolicy(provider) {
	return FALLBACK_CLI_BACKEND_POLICIES[provider] ?? resolveSetupCliBackendPolicy(provider);
}
function normalizeBackendKey(key) {
	return normalizeProviderId(key);
}
function pickBackendConfig(config, normalizedId) {
	const directKey = Object.keys(config).find((key) => normalizeOptionalLowercaseString(key) === normalizedId);
	if (directKey) return config[directKey];
	for (const [key, entry] of Object.entries(config)) if (normalizeBackendKey(key) === normalizedId) return entry;
}
function resolveRegisteredBackend(provider) {
	const normalized = normalizeBackendKey(provider);
	return cliBackendsDeps.resolveRuntimeCliBackends().find((entry) => normalizeBackendKey(entry.id) === normalized);
}
function mergeBackendConfig(base, override) {
	if (!override) return { ...base };
	const baseFresh = base.reliability?.watchdog?.fresh ?? {};
	const baseResume = base.reliability?.watchdog?.resume ?? {};
	const overrideFresh = override.reliability?.watchdog?.fresh ?? {};
	const overrideResume = override.reliability?.watchdog?.resume ?? {};
	return {
		...base,
		...override,
		args: override.args ?? base.args,
		env: {
			...base.env,
			...override.env
		},
		modelAliases: {
			...base.modelAliases,
			...override.modelAliases
		},
		clearEnv: Array.from(new Set([...base.clearEnv ?? [], ...override.clearEnv ?? []])),
		sessionIdFields: override.sessionIdFields ?? base.sessionIdFields,
		sessionArgs: override.sessionArgs ?? base.sessionArgs,
		resumeArgs: override.resumeArgs ?? base.resumeArgs,
		reliability: {
			...base.reliability,
			...override.reliability,
			watchdog: {
				...base.reliability?.watchdog,
				...override.reliability?.watchdog,
				fresh: {
					...baseFresh,
					...overrideFresh
				},
				resume: {
					...baseResume,
					...overrideResume
				}
			}
		}
	};
}
function resolveCliBackendConfig(provider, cfg) {
	const normalized = normalizeBackendKey(provider);
	const runtimeTextTransforms = resolveRuntimeTextTransforms();
	const override = pickBackendConfig(cfg?.agents?.defaults?.cliBackends ?? {}, normalized);
	const registered = resolveRegisteredBackend(normalized);
	if (registered) {
		const merged = mergeBackendConfig(registered.config, override);
		const config = registered.normalizeConfig ? registered.normalizeConfig(merged) : merged;
		const command = config.command?.trim();
		if (!command) return null;
		return {
			id: normalized,
			config: {
				...config,
				command
			},
			bundleMcp: registered.bundleMcp === true,
			bundleMcpMode: normalizeBundleMcpMode(registered.bundleMcpMode, registered.bundleMcp === true),
			pluginId: registered.pluginId,
			transformSystemPrompt: registered.transformSystemPrompt,
			textTransforms: mergePluginTextTransforms(runtimeTextTransforms, registered.textTransforms)
		};
	}
	const fallbackPolicy = resolveFallbackCliBackendPolicy(normalized);
	if (!override) {
		if (!fallbackPolicy?.baseConfig) return null;
		const baseConfig = fallbackPolicy.normalizeConfig ? fallbackPolicy.normalizeConfig(fallbackPolicy.baseConfig) : fallbackPolicy.baseConfig;
		const command = baseConfig.command?.trim();
		if (!command) return null;
		return {
			id: normalized,
			config: {
				...baseConfig,
				command
			},
			bundleMcp: fallbackPolicy.bundleMcp,
			bundleMcpMode: fallbackPolicy.bundleMcpMode,
			transformSystemPrompt: fallbackPolicy.transformSystemPrompt,
			textTransforms: mergePluginTextTransforms(runtimeTextTransforms, fallbackPolicy.textTransforms)
		};
	}
	const mergedFallback = fallbackPolicy?.baseConfig ? mergeBackendConfig(fallbackPolicy.baseConfig, override) : override;
	const config = fallbackPolicy?.normalizeConfig ? fallbackPolicy.normalizeConfig(mergedFallback) : mergedFallback;
	const command = config.command?.trim();
	if (!command) return null;
	return {
		id: normalized,
		config: {
			...config,
			command
		},
		bundleMcp: fallbackPolicy?.bundleMcp === true,
		bundleMcpMode: fallbackPolicy?.bundleMcpMode,
		transformSystemPrompt: fallbackPolicy?.transformSystemPrompt,
		textTransforms: mergePluginTextTransforms(runtimeTextTransforms, fallbackPolicy?.textTransforms)
	};
}
//#endregion
//#region src/agents/cli-runner/bundle-mcp.ts
function resolveBundleMcpMode(mode) {
	return mode ?? "claude-config-file";
}
async function readExternalMcpConfig(configPath) {
	try {
		return { mcpServers: extractMcpServerMap(JSON.parse(await fs.readFile(configPath, "utf-8"))) };
	} catch {
		return { mcpServers: {} };
	}
}
async function readJsonObject(filePath) {
	try {
		const raw = JSON.parse(await fs.readFile(filePath, "utf-8"));
		return raw && typeof raw === "object" && !Array.isArray(raw) ? { ...raw } : {};
	} catch {
		return {};
	}
}
function findMcpConfigPath(args) {
	if (!args?.length) return;
	for (let i = 0; i < args.length; i += 1) {
		const arg = args[i] ?? "";
		if (arg === "--mcp-config") return normalizeOptionalString(args[i + 1]);
		if (arg.startsWith("--mcp-config=")) return normalizeOptionalString(arg.slice(13));
	}
}
function injectClaudeMcpConfigArgs(args, mcpConfigPath) {
	const next = [];
	for (let i = 0; i < (args?.length ?? 0); i += 1) {
		const arg = args?.[i] ?? "";
		if (arg === "--strict-mcp-config") continue;
		if (arg === "--mcp-config") {
			i += 1;
			continue;
		}
		if (arg.startsWith("--mcp-config=")) continue;
		next.push(arg);
	}
	next.push("--strict-mcp-config", "--mcp-config", mcpConfigPath);
	return next;
}
function isRecord(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
function normalizeStringArray(value) {
	return Array.isArray(value) && value.every((entry) => typeof entry === "string") ? [...value] : void 0;
}
function normalizeStringRecord(value) {
	if (!isRecord(value)) return;
	const entries = Object.entries(value).filter((entry) => {
		return typeof entry[1] === "string";
	});
	return entries.length > 0 ? Object.fromEntries(entries) : void 0;
}
function decodeHeaderEnvPlaceholder(value) {
	const bearerMatch = /^Bearer \${([A-Z0-9_]+)}$/.exec(value);
	if (bearerMatch) return {
		envVar: bearerMatch[1],
		bearer: true
	};
	const envMatch = /^\${([A-Z0-9_]+)}$/.exec(value);
	if (envMatch) return {
		envVar: envMatch[1],
		bearer: false
	};
	return null;
}
function applyCommonServerConfig(next, server) {
	if (typeof server.command === "string") next.command = server.command;
	const args = normalizeStringArray(server.args);
	if (args) next.args = args;
	const env = normalizeStringRecord(server.env);
	if (env) next.env = env;
	if (typeof server.cwd === "string") next.cwd = server.cwd;
	if (typeof server.url === "string") next.url = server.url;
}
function normalizeCodexServerConfig(server) {
	const next = {};
	applyCommonServerConfig(next, server);
	const httpHeaders = normalizeStringRecord(server.headers);
	if (httpHeaders) {
		const staticHeaders = {};
		const envHeaders = {};
		for (const [name, value] of Object.entries(httpHeaders)) {
			const decoded = decodeHeaderEnvPlaceholder(value);
			if (!decoded) {
				staticHeaders[name] = value;
				continue;
			}
			if (decoded.bearer && normalizeOptionalLowercaseString(name) === "authorization") {
				next.bearer_token_env_var = decoded.envVar;
				continue;
			}
			envHeaders[name] = decoded.envVar;
		}
		if (Object.keys(staticHeaders).length > 0) next.http_headers = staticHeaders;
		if (Object.keys(envHeaders).length > 0) next.env_http_headers = envHeaders;
	}
	return next;
}
function resolveEnvPlaceholder(value, inheritedEnv) {
	const decoded = decodeHeaderEnvPlaceholder(value);
	if (!decoded) return value;
	const resolved = inheritedEnv?.[decoded.envVar] ?? process.env[decoded.envVar] ?? "";
	return decoded.bearer ? `Bearer ${resolved}` : resolved;
}
function normalizeGeminiServerConfig(server, inheritedEnv) {
	const next = {};
	applyCommonServerConfig(next, server);
	if (typeof server.type === "string") next.type = server.type;
	const headers = normalizeStringRecord(server.headers);
	if (headers) next.headers = Object.fromEntries(Object.entries(headers).map(([name, value]) => [name, resolveEnvPlaceholder(value, inheritedEnv)]));
	if (typeof server.trust === "boolean") next.trust = server.trust;
	return next;
}
function injectCodexMcpConfigArgs(args, config) {
	const overrides = serializeTomlInlineValue(Object.fromEntries(Object.entries(config.mcpServers).map(([name, server]) => [name, normalizeCodexServerConfig(server)])));
	return [
		...args ?? [],
		"-c",
		`mcp_servers=${overrides}`
	];
}
async function writeGeminiSystemSettings(mergedConfig, inheritedEnv) {
	const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "openclaw-gemini-mcp-"));
	const settingsPath = path.join(tempDir, "settings.json");
	const existingSettingsPath = inheritedEnv?.GEMINI_CLI_SYSTEM_SETTINGS_PATH ?? process.env.GEMINI_CLI_SYSTEM_SETTINGS_PATH;
	const base = typeof existingSettingsPath === "string" && existingSettingsPath.trim() ? await readJsonObject(existingSettingsPath) : {};
	const normalizedConfig = { mcpServers: Object.fromEntries(Object.entries(mergedConfig.mcpServers).map(([name, server]) => [name, normalizeGeminiServerConfig(server, inheritedEnv)])) };
	const settings = applyMergePatch(base, {
		mcp: { allowed: Object.keys(normalizedConfig.mcpServers) },
		mcpServers: normalizedConfig.mcpServers
	});
	await fs.writeFile(settingsPath, `${JSON.stringify(settings, null, 2)}\n`, "utf-8");
	return {
		env: {
			...inheritedEnv,
			GEMINI_CLI_SYSTEM_SETTINGS_PATH: settingsPath
		},
		cleanup: async () => {
			await fs.rm(tempDir, {
				recursive: true,
				force: true
			});
		}
	};
}
async function prepareModeSpecificBundleMcpConfig(params) {
	const serializedConfig = `${JSON.stringify(params.mergedConfig, null, 2)}\n`;
	const mcpConfigHash = crypto.createHash("sha256").update(serializedConfig).digest("hex");
	if (params.mode === "codex-config-overrides") return {
		backend: {
			...params.backend,
			args: injectCodexMcpConfigArgs(params.backend.args, params.mergedConfig),
			resumeArgs: injectCodexMcpConfigArgs(params.backend.resumeArgs ?? params.backend.args ?? [], params.mergedConfig)
		},
		mcpConfigHash,
		env: params.env
	};
	if (params.mode === "gemini-system-settings") {
		const settings = await writeGeminiSystemSettings(params.mergedConfig, params.env);
		return {
			backend: params.backend,
			mcpConfigHash,
			env: settings.env,
			cleanup: settings.cleanup
		};
	}
	const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "openclaw-cli-mcp-"));
	const mcpConfigPath = path.join(tempDir, "mcp.json");
	await fs.writeFile(mcpConfigPath, serializedConfig, "utf-8");
	return {
		backend: {
			...params.backend,
			args: injectClaudeMcpConfigArgs(params.backend.args, mcpConfigPath),
			resumeArgs: injectClaudeMcpConfigArgs(params.backend.resumeArgs ?? params.backend.args ?? [], mcpConfigPath)
		},
		mcpConfigHash,
		env: params.env,
		cleanup: async () => {
			await fs.rm(tempDir, {
				recursive: true,
				force: true
			});
		}
	};
}
async function prepareCliBundleMcpConfig(params) {
	if (!params.enabled) return {
		backend: params.backend,
		env: params.env
	};
	const mode = resolveBundleMcpMode(params.mode);
	const existingMcpConfigPath = mode === "claude-config-file" ? findMcpConfigPath(params.backend.resumeArgs) ?? findMcpConfigPath(params.backend.args) : void 0;
	let mergedConfig = { mcpServers: {} };
	if (existingMcpConfigPath) {
		const resolvedExistingPath = path.isAbsolute(existingMcpConfigPath) ? existingMcpConfigPath : path.resolve(params.workspaceDir, existingMcpConfigPath);
		mergedConfig = applyMergePatch(mergedConfig, await readExternalMcpConfig(resolvedExistingPath));
	}
	const bundleConfig = loadEnabledBundleMcpConfig({
		workspaceDir: params.workspaceDir,
		cfg: params.config
	});
	for (const diagnostic of bundleConfig.diagnostics) params.warn?.(`bundle MCP skipped for ${diagnostic.pluginId}: ${diagnostic.message}`);
	mergedConfig = applyMergePatch(mergedConfig, bundleConfig.config);
	if (params.additionalConfig) mergedConfig = applyMergePatch(mergedConfig, params.additionalConfig);
	return await prepareModeSpecificBundleMcpConfig({
		mode,
		backend: params.backend,
		mergedConfig,
		env: params.env
	});
}
//#endregion
//#region src/agents/cli-runner/prepare.ts
const prepareDeps = {
	makeBootstrapWarn,
	resolveBootstrapContextForRun,
	getActiveMcpLoopbackRuntime,
	ensureMcpLoopbackServer,
	createMcpLoopbackServerConfig,
	resolveOpenClawDocsPath: async (params) => (await import("./docs-path-B67r4hFu.js")).resolveOpenClawDocsPath(params)
};
async function prepareCliRunContext(params) {
	const started = Date.now();
	const workspaceResolution = resolveRunWorkspaceDir({
		workspaceDir: params.workspaceDir,
		sessionKey: params.sessionKey,
		agentId: params.agentId,
		config: params.config
	});
	const resolvedWorkspace = workspaceResolution.workspaceDir;
	const redactedSessionId = redactRunIdentifier(params.sessionId);
	const redactedSessionKey = redactRunIdentifier(params.sessionKey);
	const redactedWorkspace = redactRunIdentifier(resolvedWorkspace);
	if (workspaceResolution.usedFallback) cliBackendLog.warn(`[workspace-fallback] caller=runCliAgent reason=${workspaceResolution.fallbackReason} run=${params.runId} session=${redactedSessionId} sessionKey=${redactedSessionKey} agent=${workspaceResolution.agentId} workspace=${redactedWorkspace}`);
	const workspaceDir = resolvedWorkspace;
	const backendResolved = resolveCliBackendConfig(params.provider, params.config);
	if (!backendResolved) throw new Error(`Unknown CLI backend: ${params.provider}`);
	const authEpoch = await resolveCliAuthEpoch({
		provider: params.provider,
		authProfileId: params.authProfileId
	});
	const extraSystemPrompt = params.extraSystemPrompt?.trim() ?? "";
	const extraSystemPromptHash = hashCliSessionText(extraSystemPrompt);
	const modelId = (params.model ?? "default").trim() || "default";
	const normalizedModel = normalizeCliModel(modelId, backendResolved.config);
	const modelDisplay = `${params.provider}/${modelId}`;
	const sessionLabel = params.sessionKey ?? params.sessionId;
	const { bootstrapFiles, contextFiles } = await prepareDeps.resolveBootstrapContextForRun({
		workspaceDir,
		config: params.config,
		sessionKey: params.sessionKey,
		sessionId: params.sessionId,
		warn: prepareDeps.makeBootstrapWarn({
			sessionLabel,
			warn: (message) => cliBackendLog.warn(message)
		})
	});
	const bootstrapMaxChars = resolveBootstrapMaxChars(params.config);
	const bootstrapTotalMaxChars = resolveBootstrapTotalMaxChars(params.config);
	const bootstrapAnalysis = analyzeBootstrapBudget({
		files: buildBootstrapInjectionStats({
			bootstrapFiles,
			injectedFiles: contextFiles
		}),
		bootstrapMaxChars,
		bootstrapTotalMaxChars
	});
	const bootstrapPromptWarningMode = resolveBootstrapPromptTruncationWarningMode(params.config);
	const bootstrapPromptWarning = buildBootstrapPromptWarning({
		analysis: bootstrapAnalysis,
		mode: bootstrapPromptWarningMode,
		seenSignatures: params.bootstrapPromptWarningSignaturesSeen,
		previousSignature: params.bootstrapPromptWarningSignature
	});
	const { defaultAgentId, sessionAgentId } = resolveSessionAgentIds({
		sessionKey: params.sessionKey,
		config: params.config,
		agentId: params.agentId
	});
	let mcpLoopbackRuntime = backendResolved.bundleMcp ? prepareDeps.getActiveMcpLoopbackRuntime() : void 0;
	if (backendResolved.bundleMcp && !mcpLoopbackRuntime) {
		try {
			await prepareDeps.ensureMcpLoopbackServer();
		} catch (error) {
			cliBackendLog.warn(`mcp loopback server failed to start: ${String(error)}`);
		}
		mcpLoopbackRuntime = prepareDeps.getActiveMcpLoopbackRuntime();
	}
	const preparedBackend = await prepareCliBundleMcpConfig({
		enabled: backendResolved.bundleMcp,
		mode: backendResolved.bundleMcpMode,
		backend: backendResolved.config,
		workspaceDir,
		config: params.config,
		additionalConfig: mcpLoopbackRuntime ? prepareDeps.createMcpLoopbackServerConfig(mcpLoopbackRuntime.port) : void 0,
		env: mcpLoopbackRuntime ? {
			OPENCLAW_MCP_TOKEN: mcpLoopbackRuntime.token,
			OPENCLAW_MCP_AGENT_ID: sessionAgentId ?? "",
			OPENCLAW_MCP_ACCOUNT_ID: params.agentAccountId ?? "",
			OPENCLAW_MCP_SESSION_KEY: params.sessionKey ?? "",
			OPENCLAW_MCP_MESSAGE_CHANNEL: params.messageProvider ?? "",
			OPENCLAW_MCP_SENDER_IS_OWNER: params.senderIsOwner === true ? "true" : "false"
		} : void 0,
		warn: (message) => cliBackendLog.warn(message)
	});
	const reusableCliSession = params.cliSessionBinding ? resolveCliSessionReuse({
		binding: params.cliSessionBinding,
		authProfileId: params.authProfileId,
		authEpoch,
		extraSystemPromptHash,
		mcpConfigHash: preparedBackend.mcpConfigHash
	}) : params.cliSessionId ? { sessionId: params.cliSessionId } : {};
	if (reusableCliSession.invalidatedReason) cliBackendLog.info(`cli session reset: provider=${params.provider} reason=${reusableCliSession.invalidatedReason}`);
	const heartbeatPrompt = resolveHeartbeatPromptForSystemPrompt({
		config: params.config,
		agentId: sessionAgentId,
		defaultAgentId
	});
	const docsPath = await prepareDeps.resolveOpenClawDocsPath({
		workspaceDir,
		argv1: process.argv[1],
		cwd: process.cwd(),
		moduleUrl: import.meta.url
	});
	const skillsPrompt = resolveSkillsPromptForRun({
		skillsSnapshot: params.skillsSnapshot,
		workspaceDir,
		config: params.config,
		agentId: sessionAgentId
	});
	const builtSystemPrompt = resolveSystemPromptOverride({
		config: params.config,
		agentId: sessionAgentId
	}) ?? buildSystemPrompt({
		workspaceDir,
		config: params.config,
		defaultThinkLevel: params.thinkLevel,
		extraSystemPrompt,
		ownerNumbers: params.ownerNumbers,
		heartbeatPrompt,
		docsPath: docsPath ?? void 0,
		skillsPrompt,
		tools: [],
		contextFiles,
		modelDisplay,
		agentId: sessionAgentId
	});
	const systemPrompt = applyPluginTextReplacements(backendResolved.transformSystemPrompt?.({
		config: params.config,
		workspaceDir,
		provider: params.provider,
		modelId,
		modelDisplay,
		agentId: sessionAgentId,
		systemPrompt: builtSystemPrompt
	}) ?? builtSystemPrompt, backendResolved.textTransforms?.input);
	return {
		params,
		started,
		workspaceDir,
		backendResolved,
		preparedBackend,
		reusableCliSession,
		modelId,
		normalizedModel,
		systemPrompt,
		systemPromptReport: buildSystemPromptReport({
			source: "run",
			generatedAt: Date.now(),
			sessionId: params.sessionId,
			sessionKey: params.sessionKey,
			provider: params.provider,
			model: modelId,
			workspaceDir,
			bootstrapMaxChars,
			bootstrapTotalMaxChars,
			bootstrapTruncation: buildBootstrapTruncationReportMeta({
				analysis: bootstrapAnalysis,
				warningMode: bootstrapPromptWarningMode,
				warning: bootstrapPromptWarning
			}),
			sandbox: {
				mode: "off",
				sandboxed: false
			},
			systemPrompt,
			bootstrapFiles,
			injectedFiles: contextFiles,
			skillsPrompt,
			tools: []
		}),
		bootstrapPromptWarningLines: bootstrapPromptWarning.lines,
		heartbeatPrompt,
		authEpoch,
		extraSystemPromptHash
	};
}
//#endregion
export { prepareCliRunContext };
