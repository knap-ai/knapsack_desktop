import { i as normalizeLowercaseStringOrEmpty, o as normalizeOptionalLowercaseString, s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { n as resolveGlobalSingleton } from "./global-singleton-B80lD-oJ.js";
import { a as logWarn, t as logDebug } from "./logger-BA_TvTc6.js";
import { m as loadEnabledBundleMcpConfig } from "./loader-DYW2PvbF.js";
import { i as loadUndiciRuntimeDeps } from "./undici-runtime-C_MCkNOw.js";
import { a as redactSensitiveUrlLikeString, i as redactSensitiveUrl } from "./redact-sensitive-url-DdVF8_IU.js";
import { n as normalizeConfiguredMcpServers } from "./mcp-config-BwEBkG_W.js";
import crypto from "node:crypto";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
//#region src/agents/mcp-config-shared.ts
function isMcpConfigRecord(value) {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}
function toMcpStringRecord(value, options) {
	if (!isMcpConfigRecord(value)) return;
	const entries = Object.entries(value).map(([key, entry]) => {
		if (typeof entry === "string") return [key, entry];
		if (typeof entry === "number" || typeof entry === "boolean") return [key, String(entry)];
		options?.onDroppedEntry?.(key, entry);
		return null;
	}).filter((entry) => entry !== null);
	return entries.length > 0 ? Object.fromEntries(entries) : void 0;
}
function toMcpStringArray(value) {
	if (!Array.isArray(value)) return;
	const entries = value.filter((entry) => typeof entry === "string");
	return entries.length > 0 ? entries : [];
}
//#endregion
//#region src/agents/mcp-stdio.ts
function resolveStdioMcpServerLaunchConfig(raw) {
	if (!isMcpConfigRecord(raw)) return {
		ok: false,
		reason: "server config must be an object"
	};
	if (typeof raw.command !== "string" || raw.command.trim().length === 0) {
		if (typeof raw.url === "string" && raw.url.trim().length > 0) return {
			ok: false,
			reason: "not a stdio server (has url)"
		};
		return {
			ok: false,
			reason: "its command is missing"
		};
	}
	const cwd = typeof raw.cwd === "string" && raw.cwd.trim().length > 0 ? raw.cwd : typeof raw.workingDirectory === "string" && raw.workingDirectory.trim().length > 0 ? raw.workingDirectory : void 0;
	return {
		ok: true,
		config: {
			command: raw.command,
			args: toMcpStringArray(raw.args),
			env: toMcpStringRecord(raw.env),
			cwd
		}
	};
}
function describeStdioMcpServerLaunchConfig(config) {
	const args = Array.isArray(config.args) && config.args.length > 0 ? ` ${config.args.join(" ")}` : "";
	const cwd = config.cwd ? ` (cwd=${config.cwd})` : "";
	return `${config.command}${args}${cwd}`;
}
//#endregion
//#region src/agents/embedded-pi-mcp.ts
function loadEmbeddedPiMcpConfig(params) {
	const bundleMcp = loadEnabledBundleMcpConfig({
		workspaceDir: params.workspaceDir,
		cfg: params.cfg
	});
	const configuredMcp = normalizeConfiguredMcpServers(params.cfg?.mcp?.servers);
	return {
		mcpServers: {
			...bundleMcp.config.mcpServers,
			...configuredMcp
		},
		diagnostics: bundleMcp.diagnostics
	};
}
//#endregion
//#region src/agents/mcp-http.ts
function resolveHttpMcpServerLaunchConfig(raw, options) {
	if (!isMcpConfigRecord(raw)) return {
		ok: false,
		reason: "server config must be an object"
	};
	if (typeof raw.url !== "string" || raw.url.trim().length === 0) return {
		ok: false,
		reason: "its url is missing"
	};
	const url = raw.url.trim();
	let parsed;
	try {
		parsed = new URL(url);
	} catch {
		return {
			ok: false,
			reason: `its url is not a valid URL: ${redactSensitiveUrlLikeString(url)}`
		};
	}
	if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return {
		ok: false,
		reason: `only http and https URLs are supported, got ${parsed.protocol}`
	};
	let headers;
	if (raw.headers !== void 0 && raw.headers !== null) if (!isMcpConfigRecord(raw.headers)) options?.onMalformedHeaders?.(raw.headers);
	else headers = toMcpStringRecord(raw.headers, { onDroppedEntry: options?.onDroppedHeader });
	return {
		ok: true,
		config: {
			transportType: options?.transportType ?? "sse",
			url,
			headers
		}
	};
}
function describeHttpMcpServerLaunchConfig(config) {
	return redactSensitiveUrl(config.url);
}
//#endregion
//#region src/agents/mcp-transport-config.ts
const DEFAULT_CONNECTION_TIMEOUT_MS = 3e4;
function getConnectionTimeoutMs(rawServer) {
	if (rawServer && typeof rawServer === "object" && typeof rawServer.connectionTimeoutMs === "number" && rawServer.connectionTimeoutMs > 0) return rawServer.connectionTimeoutMs;
	return DEFAULT_CONNECTION_TIMEOUT_MS;
}
function getRequestedTransport(rawServer) {
	if (!rawServer || typeof rawServer !== "object" || typeof rawServer.transport !== "string") return "";
	return normalizeLowercaseStringOrEmpty(rawServer.transport);
}
function resolveHttpTransportConfig(serverName, rawServer, transportType) {
	const launch = resolveHttpMcpServerLaunchConfig(rawServer, {
		transportType,
		onDroppedHeader: (key) => {
			logWarn(`bundle-mcp: server "${serverName}": header "${key}" has an unsupported value type and was ignored.`);
		},
		onMalformedHeaders: () => {
			logWarn(`bundle-mcp: server "${serverName}": "headers" must be a JSON object; the value was ignored.`);
		}
	});
	if (!launch.ok) return null;
	return {
		kind: "http",
		transportType: launch.config.transportType,
		url: launch.config.url,
		headers: launch.config.headers,
		description: describeHttpMcpServerLaunchConfig(launch.config),
		connectionTimeoutMs: getConnectionTimeoutMs(rawServer)
	};
}
function resolveMcpTransportConfig(serverName, rawServer) {
	const requestedTransport = getRequestedTransport(rawServer);
	const stdioLaunch = resolveStdioMcpServerLaunchConfig(rawServer);
	if (stdioLaunch.ok) return {
		kind: "stdio",
		transportType: "stdio",
		command: stdioLaunch.config.command,
		args: stdioLaunch.config.args,
		env: stdioLaunch.config.env,
		cwd: stdioLaunch.config.cwd,
		description: describeStdioMcpServerLaunchConfig(stdioLaunch.config),
		connectionTimeoutMs: getConnectionTimeoutMs(rawServer)
	};
	if (requestedTransport && requestedTransport !== "sse" && requestedTransport !== "streamable-http") {
		logWarn(`bundle-mcp: skipped server "${serverName}" because transport "${requestedTransport}" is not supported.`);
		return null;
	}
	if (requestedTransport === "streamable-http") {
		const httpTransport = resolveHttpTransportConfig(serverName, rawServer, "streamable-http");
		if (httpTransport) return httpTransport;
	}
	const sseTransport = resolveHttpTransportConfig(serverName, rawServer, "sse");
	if (sseTransport) return sseTransport;
	const httpLaunch = resolveHttpMcpServerLaunchConfig(rawServer);
	const httpReason = httpLaunch.ok ? "not an HTTP MCP server" : httpLaunch.reason;
	logWarn(`bundle-mcp: skipped server "${serverName}" because ${stdioLaunch.reason} and ${httpReason}.`);
	return null;
}
//#endregion
//#region src/agents/mcp-transport.ts
function attachStderrLogging(serverName, transport) {
	const stderr = transport.stderr;
	if (!stderr || typeof stderr.on !== "function") return;
	const onData = (chunk) => {
		const message = normalizeOptionalString(typeof chunk === "string" ? chunk : String(chunk)) ?? "";
		if (!message) return;
		for (const line of message.split(/\r?\n/)) {
			const trimmed = line.trim();
			if (trimmed) logDebug(`bundle-mcp:${serverName}: ${trimmed}`);
		}
	};
	stderr.on("data", onData);
	return () => {
		if (typeof stderr.off === "function") stderr.off("data", onData);
		else if (typeof stderr.removeListener === "function") stderr.removeListener("data", onData);
	};
}
const fetchWithUndici = async (url, init) => await loadUndiciRuntimeDeps().fetch(url, init);
function buildSseEventSourceFetch(headers) {
	return (url, init) => {
		const sdkHeaders = {};
		if (init?.headers) if (init.headers instanceof Headers) init.headers.forEach((value, key) => {
			sdkHeaders[key] = value;
		});
		else Object.assign(sdkHeaders, init.headers);
		return fetchWithUndici(url, {
			...init,
			headers: {
				...sdkHeaders,
				...headers
			}
		});
	};
}
function resolveMcpTransport(serverName, rawServer) {
	const resolved = resolveMcpTransportConfig(serverName, rawServer);
	if (!resolved) return null;
	if (resolved.kind === "stdio") {
		const transport = new StdioClientTransport({
			command: resolved.command,
			args: resolved.args,
			env: resolved.env,
			cwd: resolved.cwd,
			stderr: "pipe"
		});
		return {
			transport,
			description: resolved.description,
			transportType: "stdio",
			connectionTimeoutMs: resolved.connectionTimeoutMs,
			detachStderr: attachStderrLogging(serverName, transport)
		};
	}
	if (resolved.transportType === "streamable-http") return {
		transport: new StreamableHTTPClientTransport(new URL(resolved.url), { requestInit: resolved.headers ? { headers: resolved.headers } : void 0 }),
		description: resolved.description,
		transportType: "streamable-http",
		connectionTimeoutMs: resolved.connectionTimeoutMs
	};
	const headers = { ...resolved.headers };
	const hasHeaders = Object.keys(headers).length > 0;
	return {
		transport: new SSEClientTransport(new URL(resolved.url), {
			requestInit: hasHeaders ? { headers } : void 0,
			fetch: fetchWithUndici,
			eventSourceInit: { fetch: buildSseEventSourceFetch(headers) }
		}),
		description: resolved.description,
		transportType: "sse",
		connectionTimeoutMs: resolved.connectionTimeoutMs
	};
}
//#endregion
//#region src/agents/pi-bundle-mcp-names.ts
const TOOL_NAME_SAFE_RE = /[^A-Za-z0-9_-]/g;
const TOOL_NAME_MAX_PREFIX = 30;
const TOOL_NAME_MAX_TOTAL = 64;
function sanitizeToolFragment(raw, fallback, maxChars) {
	const normalized = raw.trim().replace(TOOL_NAME_SAFE_RE, "-") || fallback;
	if (!maxChars) return normalized;
	return normalized.length > maxChars ? normalized.slice(0, maxChars) : normalized;
}
function sanitizeServerName(raw, usedNames) {
	const base = sanitizeToolFragment(raw, "mcp", TOOL_NAME_MAX_PREFIX);
	let candidate = base;
	let n = 2;
	while (usedNames.has(normalizeLowercaseStringOrEmpty(candidate))) {
		const suffix = `-${n}`;
		candidate = `${base.slice(0, Math.max(1, TOOL_NAME_MAX_PREFIX - suffix.length))}${suffix}`;
		n += 1;
	}
	usedNames.add(normalizeLowercaseStringOrEmpty(candidate));
	return candidate;
}
function sanitizeToolName(raw) {
	return sanitizeToolFragment(raw, "tool");
}
function normalizeReservedToolNames(names) {
	return new Set(Array.from(names ?? [], (name) => normalizeOptionalLowercaseString(name)).filter((name) => Boolean(name)));
}
function buildSafeToolName(params) {
	const cleanedToolName = sanitizeToolName(params.toolName);
	const maxToolChars = Math.max(1, TOOL_NAME_MAX_TOTAL - params.serverName.length - 2);
	const truncatedToolName = cleanedToolName.slice(0, maxToolChars);
	let candidateToolName = truncatedToolName || "tool";
	let candidate = `${params.serverName}__${candidateToolName}`;
	let n = 2;
	while (params.reservedNames.has(normalizeLowercaseStringOrEmpty(candidate))) {
		const suffix = `-${n}`;
		candidateToolName = `${(truncatedToolName || "tool").slice(0, Math.max(1, maxToolChars - suffix.length))}${suffix}`;
		candidate = `${params.serverName}__${candidateToolName}`;
		n += 1;
	}
	return candidate;
}
//#endregion
//#region src/agents/pi-bundle-mcp-runtime.ts
const SESSION_MCP_RUNTIME_MANAGER_KEY = Symbol.for("openclaw.sessionMcpRuntimeManager");
function connectWithTimeout(client, transport, timeoutMs) {
	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => reject(/* @__PURE__ */ new Error(`MCP server connection timed out after ${timeoutMs}ms`)), timeoutMs);
		client.connect(transport).then((value) => {
			clearTimeout(timer);
			resolve(value);
		}, (error) => {
			clearTimeout(timer);
			reject(error);
		});
	});
}
function redactErrorUrls(error) {
	return redactSensitiveUrlLikeString(String(error));
}
async function listAllTools(client) {
	const tools = [];
	let cursor;
	do {
		const page = await client.listTools(cursor ? { cursor } : void 0);
		tools.push(...page.tools);
		cursor = page.nextCursor;
	} while (cursor);
	return tools;
}
async function disposeSession(session) {
	session.detachStderr?.();
	if (session.transportType === "streamable-http") await session.transport.terminateSession().catch(() => {});
	await session.client.close().catch(() => {});
	await session.transport.close().catch(() => {});
}
function createCatalogFingerprint(servers) {
	return crypto.createHash("sha1").update(JSON.stringify(servers)).digest("hex");
}
function loadSessionMcpConfig(params) {
	const loaded = loadEmbeddedPiMcpConfig({
		workspaceDir: params.workspaceDir,
		cfg: params.cfg
	});
	if (params.logDiagnostics !== false) for (const diagnostic of loaded.diagnostics) logWarn(`bundle-mcp: ${diagnostic.pluginId}: ${diagnostic.message}`);
	return {
		loaded,
		fingerprint: createCatalogFingerprint(loaded.mcpServers)
	};
}
function createDisposedError(sessionId) {
	return /* @__PURE__ */ new Error(`bundle-mcp runtime disposed for session ${sessionId}`);
}
function createSessionMcpRuntime(params) {
	const { loaded, fingerprint: configFingerprint } = loadSessionMcpConfig({
		workspaceDir: params.workspaceDir,
		cfg: params.cfg,
		logDiagnostics: true
	});
	const createdAt = Date.now();
	let lastUsedAt = createdAt;
	let disposed = false;
	let catalog = null;
	let catalogInFlight;
	const sessions = /* @__PURE__ */ new Map();
	const failIfDisposed = () => {
		if (disposed) throw createDisposedError(params.sessionId);
	};
	const getCatalog = async () => {
		failIfDisposed();
		if (catalog) return catalog;
		if (catalogInFlight) return catalogInFlight;
		catalogInFlight = (async () => {
			if (Object.keys(loaded.mcpServers).length === 0) return {
				version: 1,
				generatedAt: Date.now(),
				servers: {},
				tools: []
			};
			const servers = {};
			const tools = [];
			const usedServerNames = /* @__PURE__ */ new Set();
			try {
				for (const [serverName, rawServer] of Object.entries(loaded.mcpServers)) {
					failIfDisposed();
					const resolved = resolveMcpTransport(serverName, rawServer);
					if (!resolved) continue;
					const safeServerName = sanitizeServerName(serverName, usedServerNames);
					if (safeServerName !== serverName) logWarn(`bundle-mcp: server key "${serverName}" registered as "${safeServerName}" for provider-safe tool names.`);
					const client = new Client({
						name: "openclaw-bundle-mcp",
						version: "0.0.0"
					}, {});
					const session = {
						serverName,
						client,
						transport: resolved.transport,
						transportType: resolved.transportType,
						detachStderr: resolved.detachStderr
					};
					sessions.set(serverName, session);
					try {
						failIfDisposed();
						await connectWithTimeout(client, resolved.transport, resolved.connectionTimeoutMs);
						failIfDisposed();
						const listedTools = await listAllTools(client);
						failIfDisposed();
						servers[serverName] = {
							serverName,
							launchSummary: resolved.description,
							toolCount: listedTools.length
						};
						for (const tool of listedTools) {
							const toolName = tool.name.trim();
							if (!toolName) continue;
							tools.push({
								serverName,
								safeServerName,
								toolName,
								title: tool.title,
								description: normalizeOptionalString(tool.description),
								inputSchema: tool.inputSchema,
								fallbackDescription: `Provided by bundle MCP server "${serverName}" (${resolved.description}).`
							});
						}
					} catch (error) {
						if (!disposed) logWarn(`bundle-mcp: failed to start server "${serverName}" (${resolved.description}): ${redactErrorUrls(error)}`);
						await disposeSession(session);
						sessions.delete(serverName);
						failIfDisposed();
					}
				}
				failIfDisposed();
				return {
					version: 1,
					generatedAt: Date.now(),
					servers,
					tools
				};
			} catch (error) {
				await Promise.allSettled(Array.from(sessions.values(), (session) => disposeSession(session)));
				sessions.clear();
				throw error;
			}
		})();
		try {
			const nextCatalog = await catalogInFlight;
			failIfDisposed();
			catalog = nextCatalog;
			return nextCatalog;
		} finally {
			catalogInFlight = void 0;
		}
	};
	return {
		sessionId: params.sessionId,
		sessionKey: params.sessionKey,
		workspaceDir: params.workspaceDir,
		configFingerprint,
		createdAt,
		get lastUsedAt() {
			return lastUsedAt;
		},
		getCatalog,
		markUsed() {
			lastUsedAt = Date.now();
		},
		async callTool(serverName, toolName, input) {
			failIfDisposed();
			await getCatalog();
			const session = sessions.get(serverName);
			if (!session) throw new Error(`bundle-mcp server "${serverName}" is not connected`);
			return await session.client.callTool({
				name: toolName,
				arguments: isMcpConfigRecord(input) ? input : {}
			});
		},
		async dispose() {
			if (disposed) return;
			disposed = true;
			catalog = null;
			catalogInFlight = void 0;
			const sessionsToClose = Array.from(sessions.values());
			sessions.clear();
			await Promise.allSettled(sessionsToClose.map((session) => disposeSession(session)));
		}
	};
}
function createSessionMcpRuntimeManager() {
	const runtimesBySessionId = /* @__PURE__ */ new Map();
	const sessionIdBySessionKey = /* @__PURE__ */ new Map();
	const createInFlight = /* @__PURE__ */ new Map();
	return {
		async getOrCreate(params) {
			if (params.sessionKey) sessionIdBySessionKey.set(params.sessionKey, params.sessionId);
			const { fingerprint: nextFingerprint } = loadSessionMcpConfig({
				workspaceDir: params.workspaceDir,
				cfg: params.cfg,
				logDiagnostics: false
			});
			const existing = runtimesBySessionId.get(params.sessionId);
			if (existing) if (existing.workspaceDir !== params.workspaceDir || existing.configFingerprint !== nextFingerprint) {
				runtimesBySessionId.delete(params.sessionId);
				await existing.dispose();
			} else {
				existing.markUsed();
				return existing;
			}
			const inFlight = createInFlight.get(params.sessionId);
			if (inFlight) {
				if (inFlight.workspaceDir === params.workspaceDir && inFlight.configFingerprint === nextFingerprint) return inFlight.promise;
				createInFlight.delete(params.sessionId);
				const staleRuntime = await inFlight.promise.catch(() => void 0);
				runtimesBySessionId.delete(params.sessionId);
				await staleRuntime?.dispose();
			}
			const created = Promise.resolve(createSessionMcpRuntime({
				sessionId: params.sessionId,
				sessionKey: params.sessionKey,
				workspaceDir: params.workspaceDir,
				cfg: params.cfg
			})).then((runtime) => {
				runtime.markUsed();
				runtimesBySessionId.set(params.sessionId, runtime);
				return runtime;
			});
			createInFlight.set(params.sessionId, {
				promise: created,
				workspaceDir: params.workspaceDir,
				configFingerprint: nextFingerprint
			});
			try {
				return await created;
			} finally {
				createInFlight.delete(params.sessionId);
			}
		},
		bindSessionKey(sessionKey, sessionId) {
			sessionIdBySessionKey.set(sessionKey, sessionId);
		},
		resolveSessionId(sessionKey) {
			return sessionIdBySessionKey.get(sessionKey);
		},
		async disposeSession(sessionId) {
			const inFlight = createInFlight.get(sessionId);
			createInFlight.delete(sessionId);
			let runtime = runtimesBySessionId.get(sessionId);
			if (!runtime && inFlight) runtime = await inFlight.promise.catch(() => void 0);
			runtimesBySessionId.delete(sessionId);
			if (!runtime) {
				for (const [sessionKey, mappedSessionId] of sessionIdBySessionKey.entries()) if (mappedSessionId === sessionId) sessionIdBySessionKey.delete(sessionKey);
				return;
			}
			for (const [sessionKey, mappedSessionId] of sessionIdBySessionKey.entries()) if (mappedSessionId === sessionId) sessionIdBySessionKey.delete(sessionKey);
			await runtime.dispose();
		},
		async disposeAll() {
			const inFlightRuntimes = Array.from(createInFlight.values());
			createInFlight.clear();
			const runtimes = Array.from(runtimesBySessionId.values());
			runtimesBySessionId.clear();
			sessionIdBySessionKey.clear();
			const lateRuntimes = await Promise.all(inFlightRuntimes.map(async ({ promise }) => await promise.catch(() => void 0)));
			const allRuntimes = new Set(runtimes);
			for (const runtime of lateRuntimes) if (runtime) allRuntimes.add(runtime);
			await Promise.allSettled(Array.from(allRuntimes, (runtime) => runtime.dispose()));
		},
		listSessionIds() {
			return Array.from(runtimesBySessionId.keys());
		}
	};
}
function getSessionMcpRuntimeManager() {
	return resolveGlobalSingleton(SESSION_MCP_RUNTIME_MANAGER_KEY, createSessionMcpRuntimeManager);
}
async function getOrCreateSessionMcpRuntime(params) {
	return await getSessionMcpRuntimeManager().getOrCreate(params);
}
async function disposeSessionMcpRuntime(sessionId) {
	await getSessionMcpRuntimeManager().disposeSession(sessionId);
}
//#endregion
//#region src/agents/pi-bundle-mcp-materialize.ts
function toAgentToolResult(params) {
	const content = Array.isArray(params.result.content) ? params.result.content : [];
	const normalizedContent = content.length > 0 ? content : params.result.structuredContent !== void 0 ? [{
		type: "text",
		text: JSON.stringify(params.result.structuredContent, null, 2)
	}] : [{
		type: "text",
		text: JSON.stringify({
			status: params.result.isError === true ? "error" : "ok",
			server: params.serverName,
			tool: params.toolName
		}, null, 2)
	}];
	const details = {
		mcpServer: params.serverName,
		mcpTool: params.toolName
	};
	if (params.result.structuredContent !== void 0) details.structuredContent = params.result.structuredContent;
	if (params.result.isError === true) details.status = "error";
	return {
		content: normalizedContent,
		details
	};
}
async function materializeBundleMcpToolsForRun(params) {
	params.runtime.markUsed();
	const catalog = await params.runtime.getCatalog();
	const reservedNames = normalizeReservedToolNames(params.reservedToolNames);
	const tools = [];
	const sortedCatalogTools = [...catalog.tools].toSorted((a, b) => {
		const serverOrder = a.safeServerName.localeCompare(b.safeServerName);
		if (serverOrder !== 0) return serverOrder;
		const toolOrder = a.toolName.localeCompare(b.toolName);
		if (toolOrder !== 0) return toolOrder;
		return a.serverName.localeCompare(b.serverName);
	});
	for (const tool of sortedCatalogTools) {
		const originalName = tool.toolName.trim();
		if (!originalName) continue;
		const safeToolName = buildSafeToolName({
			serverName: tool.safeServerName,
			toolName: originalName,
			reservedNames
		});
		if (safeToolName !== `${tool.safeServerName}__${originalName}`) logWarn(`bundle-mcp: tool "${tool.toolName}" from server "${tool.serverName}" registered as "${safeToolName}" to keep the tool name provider-safe.`);
		reservedNames.add(normalizeLowercaseStringOrEmpty(safeToolName));
		tools.push({
			name: safeToolName,
			label: tool.title ?? tool.toolName,
			description: tool.description || tool.fallbackDescription,
			parameters: tool.inputSchema,
			execute: async (_toolCallId, input) => {
				const result = await params.runtime.callTool(tool.serverName, tool.toolName, input);
				return toAgentToolResult({
					serverName: tool.serverName,
					toolName: tool.toolName,
					result
				});
			}
		});
	}
	tools.sort((a, b) => a.name.localeCompare(b.name));
	return {
		tools,
		dispose: async () => {
			await params.disposeRuntime?.();
		}
	};
}
async function createBundleMcpToolRuntime(params) {
	const runtime = createSessionMcpRuntime({
		sessionId: `bundle-mcp:${crypto.randomUUID()}`,
		workspaceDir: params.workspaceDir,
		cfg: params.cfg
	});
	return await materializeBundleMcpToolsForRun({
		runtime,
		reservedToolNames: params.reservedToolNames,
		disposeRuntime: async () => {
			await runtime.dispose();
		}
	});
}
//#endregion
export { loadEmbeddedPiMcpConfig as a, getOrCreateSessionMcpRuntime as i, materializeBundleMcpToolsForRun as n, describeStdioMcpServerLaunchConfig as o, disposeSessionMcpRuntime as r, resolveStdioMcpServerLaunchConfig as s, createBundleMcpToolRuntime as t };
