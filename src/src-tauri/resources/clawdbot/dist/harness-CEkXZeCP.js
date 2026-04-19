import { i as formatErrorMessage$1 } from "./errors-D8p6rxH8.js";
import { m as resolveUserPath } from "./utils-D5DtWkEu.js";
import { n as VERSION } from "./version-Bk5OW-rN.js";
import { b as isSubagentSessionKey } from "./session-key-Bh1lMwK5.js";
import { m as resolveSessionAgentIds } from "./agent-scope-KFH9bkHi.js";
import { t as resolveOpenClawAgentDir } from "./agent-paths-JWlHCT48.js";
import { t as acquireSessionWriteLock } from "./session-write-lock-CcI4KSH8.js";
import { t as emitSessionTranscriptUpdate } from "./transcript-events-CdRuhFsO.js";
import { a as normalizeUsage } from "./usage-CDsCClku.js";
import { d as isMessagingToolSendAction, i as extractToolResultMediaArtifact, o as filterToolResultMediaUrls, t as buildEmbeddedAttemptToolRunContext, u as isMessagingTool } from "./attempt.tool-run-context-CgVg2Nu2.js";
import { c as resolveModelAuthMode } from "./model-auth-KKLbMBGv.js";
import { c as supportsModelTools, r as resolveAttemptSpawnWorkspaceDir, s as normalizeProviderToolSchemas } from "./attempt.thread-helpers-DleRYb_O.js";
import { t as log } from "./logger-CMwqWyWx.js";
import { t as callGatewayTool } from "./gateway-B1XKgomf.js";
import { t as createOpenClawCodingTools } from "./pi-tools-BXpX0SpG.js";
import { l as setActiveEmbeddedRun, n as clearActiveEmbeddedRun } from "./runs-D-CeEXwD.js";
import { o as resolveSandboxContext } from "./sandbox-BBeXIB2_.js";
import "./agent-harness-fGBR2JSZ.js";
import path from "node:path";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import { z } from "zod";
import { PassThrough, Writable } from "node:stream";
import WebSocket from "ws";
import { SessionManager } from "@mariozechner/pi-coding-agent";
import { EventEmitter } from "node:events";
import { createInterface } from "node:readline";
//#region extensions/codex/src/app-server/config.ts
const codexAppServerTransportSchema = z.enum(["stdio", "websocket"]);
const codexAppServerApprovalPolicySchema = z.enum([
	"never",
	"on-request",
	"on-failure",
	"untrusted"
]);
const codexAppServerSandboxSchema = z.enum([
	"read-only",
	"workspace-write",
	"danger-full-access"
]);
const codexAppServerApprovalsReviewerSchema = z.enum(["user", "guardian_subagent"]);
const codexPluginConfigSchema = z.object({
	discovery: z.object({
		enabled: z.boolean().optional(),
		timeoutMs: z.number().positive().optional()
	}).strict().optional(),
	appServer: z.object({
		transport: codexAppServerTransportSchema.optional(),
		command: z.string().optional(),
		args: z.union([z.array(z.string()), z.string()]).optional(),
		url: z.string().optional(),
		authToken: z.string().optional(),
		headers: z.record(z.string(), z.string()).optional(),
		requestTimeoutMs: z.number().positive().optional(),
		approvalPolicy: codexAppServerApprovalPolicySchema.optional(),
		sandbox: codexAppServerSandboxSchema.optional(),
		approvalsReviewer: codexAppServerApprovalsReviewerSchema.optional(),
		serviceTier: z.string().optional()
	}).strict().optional()
}).strict();
function readCodexPluginConfig(value) {
	const parsed = codexPluginConfigSchema.safeParse(value);
	return parsed.success ? parsed.data : {};
}
function resolveCodexAppServerRuntimeOptions(params = {}) {
	const env = params.env ?? process.env;
	const config = readCodexPluginConfig(params.pluginConfig).appServer ?? {};
	const transport = resolveTransport(config.transport);
	const command = readNonEmptyString$1(config.command) ?? env.OPENCLAW_CODEX_APP_SERVER_BIN ?? "codex";
	const args = resolveArgs(config.args, env.OPENCLAW_CODEX_APP_SERVER_ARGS);
	const headers = normalizeHeaders(config.headers);
	const authToken = readNonEmptyString$1(config.authToken);
	const url = readNonEmptyString$1(config.url);
	if (transport === "websocket" && !url) throw new Error("plugins.entries.codex.config.appServer.url is required when appServer.transport is websocket");
	return {
		start: {
			transport,
			command,
			args: args.length > 0 ? args : [
				"app-server",
				"--listen",
				"stdio://"
			],
			...url ? { url } : {},
			...authToken ? { authToken } : {},
			headers
		},
		requestTimeoutMs: normalizePositiveNumber(config.requestTimeoutMs, 6e4),
		approvalPolicy: resolveApprovalPolicy(config.approvalPolicy) ?? resolveApprovalPolicy(env.OPENCLAW_CODEX_APP_SERVER_APPROVAL_POLICY) ?? "never",
		sandbox: resolveSandbox(config.sandbox) ?? resolveSandbox(env.OPENCLAW_CODEX_APP_SERVER_SANDBOX) ?? "workspace-write",
		approvalsReviewer: resolveApprovalsReviewer(config.approvalsReviewer) ?? (env.OPENCLAW_CODEX_APP_SERVER_GUARDIAN === "1" ? "guardian_subagent" : "user"),
		...readNonEmptyString$1(config.serviceTier) ? { serviceTier: readNonEmptyString$1(config.serviceTier) } : {}
	};
}
function codexAppServerStartOptionsKey(options) {
	return JSON.stringify({
		transport: options.transport,
		command: options.command,
		args: options.args,
		url: options.url ?? null,
		authToken: options.authToken ? "<set>" : null,
		headers: Object.entries(options.headers).toSorted(([left], [right]) => left.localeCompare(right))
	});
}
function resolveTransport(value) {
	return value === "websocket" ? "websocket" : "stdio";
}
function resolveApprovalPolicy(value) {
	return value === "on-request" || value === "on-failure" || value === "untrusted" || value === "never" ? value : void 0;
}
function resolveSandbox(value) {
	return value === "read-only" || value === "workspace-write" || value === "danger-full-access" ? value : void 0;
}
function resolveApprovalsReviewer(value) {
	return value === "guardian_subagent" || value === "user" ? value : void 0;
}
function normalizePositiveNumber(value, fallback) {
	return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : fallback;
}
function normalizeHeaders(value) {
	if (!value || typeof value !== "object" || Array.isArray(value)) return {};
	return Object.fromEntries(Object.entries(value).map(([key, child]) => [key.trim(), readNonEmptyString$1(child)]).filter((entry) => Boolean(entry[0] && entry[1])));
}
function resolveArgs(configArgs, envArgs) {
	if (Array.isArray(configArgs)) return configArgs.map((entry) => readNonEmptyString$1(entry)).filter((entry) => entry !== void 0);
	if (typeof configArgs === "string") return splitShellWords(configArgs);
	return splitShellWords(envArgs ?? "");
}
function readNonEmptyString$1(value) {
	if (typeof value !== "string") return;
	return value.trim() || void 0;
}
function splitShellWords(value) {
	const words = [];
	let current = "";
	let quote = null;
	for (const char of value) {
		if (quote) {
			if (char === quote) quote = null;
			else current += char;
			continue;
		}
		if (char === "\"" || char === "'") {
			quote = char;
			continue;
		}
		if (/\s/.test(char)) {
			if (current) {
				words.push(current);
				current = "";
			}
			continue;
		}
		current += char;
	}
	if (current) words.push(current);
	return words;
}
//#endregion
//#region extensions/codex/src/app-server/protocol.ts
function isJsonObject(value) {
	return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
function isRpcResponse(message) {
	return "id" in message && !("method" in message);
}
//#endregion
//#region extensions/codex/src/app-server/session-binding.ts
function resolveCodexAppServerBindingPath(sessionFile) {
	return `${sessionFile}.codex-app-server.json`;
}
async function readCodexAppServerBinding(sessionFile) {
	const path = resolveCodexAppServerBindingPath(sessionFile);
	let raw;
	try {
		raw = await fs.readFile(path, "utf8");
	} catch (error) {
		if (isNotFound(error)) return;
		log.warn("failed to read codex app-server binding", {
			path,
			error
		});
		return;
	}
	try {
		const parsed = JSON.parse(raw);
		if (parsed.schemaVersion !== 1 || typeof parsed.threadId !== "string") return;
		return {
			schemaVersion: 1,
			threadId: parsed.threadId,
			sessionFile,
			cwd: typeof parsed.cwd === "string" ? parsed.cwd : "",
			model: typeof parsed.model === "string" ? parsed.model : void 0,
			modelProvider: typeof parsed.modelProvider === "string" ? parsed.modelProvider : void 0,
			dynamicToolsFingerprint: typeof parsed.dynamicToolsFingerprint === "string" ? parsed.dynamicToolsFingerprint : void 0,
			createdAt: typeof parsed.createdAt === "string" ? parsed.createdAt : (/* @__PURE__ */ new Date()).toISOString(),
			updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : (/* @__PURE__ */ new Date()).toISOString()
		};
	} catch (error) {
		log.warn("failed to parse codex app-server binding", {
			path,
			error
		});
		return;
	}
}
async function writeCodexAppServerBinding(sessionFile, binding) {
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const payload = {
		schemaVersion: 1,
		sessionFile,
		threadId: binding.threadId,
		cwd: binding.cwd,
		model: binding.model,
		modelProvider: binding.modelProvider,
		dynamicToolsFingerprint: binding.dynamicToolsFingerprint,
		createdAt: binding.createdAt ?? now,
		updatedAt: now
	};
	await fs.writeFile(resolveCodexAppServerBindingPath(sessionFile), `${JSON.stringify(payload, null, 2)}\n`);
}
async function clearCodexAppServerBinding(sessionFile) {
	try {
		await fs.unlink(resolveCodexAppServerBindingPath(sessionFile));
	} catch (error) {
		if (!isNotFound(error)) log.warn("failed to clear codex app-server binding", {
			sessionFile,
			error
		});
	}
}
function isNotFound(error) {
	return Boolean(error && typeof error === "object" && "code" in error && error.code === "ENOENT");
}
//#endregion
//#region extensions/codex/src/app-server/transport-stdio.ts
function createStdioTransport(options) {
	return spawn(options.command, options.args, {
		env: process.env,
		detached: process.platform !== "win32",
		stdio: [
			"pipe",
			"pipe",
			"pipe"
		]
	});
}
//#endregion
//#region extensions/codex/src/app-server/transport-websocket.ts
function createWebSocketTransport(options) {
	if (!options.url) throw new Error("codex app-server websocket transport requires plugins.entries.codex.config.appServer.url");
	const events = new EventEmitter();
	const stdout = new PassThrough();
	const stderr = new PassThrough();
	const headers = {
		...options.headers,
		...options.authToken ? { Authorization: `Bearer ${options.authToken}` } : {}
	};
	const socket = new WebSocket(options.url, { headers });
	const pendingFrames = [];
	let killed = false;
	const sendFrame = (frame) => {
		const trimmed = frame.trim();
		if (!trimmed) return;
		if (socket.readyState === WebSocket.OPEN) {
			socket.send(trimmed);
			return;
		}
		pendingFrames.push(trimmed);
	};
	socket.once("open", () => {
		for (const frame of pendingFrames.splice(0)) socket.send(frame);
	});
	socket.once("error", (error) => events.emit("error", error));
	socket.once("close", (code, reason) => {
		killed = true;
		events.emit("exit", code, reason.toString("utf8"));
	});
	socket.on("message", (data) => {
		const text = websocketFrameToText(data);
		stdout.write(text.endsWith("\n") ? text : `${text}\n`);
	});
	return {
		stdin: new Writable({ write(chunk, _encoding, callback) {
			for (const frame of chunk.toString("utf8").split("\n")) sendFrame(frame);
			callback();
		} }),
		stdout,
		stderr,
		get killed() {
			return killed;
		},
		kill: () => {
			killed = true;
			socket.close();
		},
		once: (event, listener) => events.once(event, listener)
	};
}
function websocketFrameToText(data) {
	if (typeof data === "string") return data;
	if (Buffer.isBuffer(data)) return data.toString("utf8");
	if (Array.isArray(data)) return Buffer.concat(data).toString("utf8");
	return Buffer.from(data).toString("utf8");
}
//#endregion
//#region extensions/codex/src/app-server/transport.ts
function closeCodexAppServerTransport(child, options = {}) {
	child.stdout.destroy?.();
	child.stderr.destroy?.();
	child.stdin.end?.();
	child.stdin.destroy?.();
	signalCodexAppServerTransport(child, "SIGTERM");
	const forceKillDelayMs = options.forceKillDelayMs ?? 1e3;
	const forceKill = setTimeout(() => {
		if (hasCodexAppServerTransportExited(child)) return;
		signalCodexAppServerTransport(child, "SIGKILL");
	}, Math.max(1, forceKillDelayMs));
	forceKill.unref?.();
	child.once("exit", () => clearTimeout(forceKill));
	child.unref?.();
	child.stdout.unref?.();
	child.stderr.unref?.();
	child.stdin.unref?.();
}
function hasCodexAppServerTransportExited(child) {
	return child.exitCode !== null && child.exitCode !== void 0 ? true : child.signalCode !== null && child.signalCode !== void 0;
}
function signalCodexAppServerTransport(child, signal) {
	if (child.pid && process.platform !== "win32") try {
		process.kill(-child.pid, signal);
		return;
	} catch {}
	child.kill?.(signal);
}
//#endregion
//#region extensions/codex/src/app-server/client.ts
const MIN_CODEX_APP_SERVER_VERSION = "0.118.0";
var CodexAppServerRpcError = class extends Error {
	constructor(error, method) {
		super(error.message || `${method} failed`);
		this.name = "CodexAppServerRpcError";
		this.code = error.code;
		this.data = error.data;
	}
};
var CodexAppServerClient = class CodexAppServerClient {
	constructor(child) {
		this.pending = /* @__PURE__ */ new Map();
		this.requestHandlers = /* @__PURE__ */ new Set();
		this.notificationHandlers = /* @__PURE__ */ new Set();
		this.closeHandlers = /* @__PURE__ */ new Set();
		this.nextId = 1;
		this.initialized = false;
		this.closed = false;
		this.child = child;
		this.lines = createInterface({ input: child.stdout });
		this.lines.on("line", (line) => this.handleLine(line));
		child.stderr.on("data", (chunk) => {
			const text = chunk.toString("utf8").trim();
			if (text) log.debug(`codex app-server stderr: ${text}`);
		});
		child.once("error", (error) => this.closeWithError(error instanceof Error ? error : new Error(String(error))));
		child.once("exit", (code, signal) => {
			this.closeWithError(/* @__PURE__ */ new Error(`codex app-server exited: code=${formatExitValue(code)} signal=${formatExitValue(signal)}`));
		});
	}
	static start(options) {
		const defaults = resolveCodexAppServerRuntimeOptions().start;
		const startOptions = {
			...defaults,
			...options,
			headers: options?.headers ?? defaults.headers
		};
		if (startOptions.transport === "websocket") return new CodexAppServerClient(createWebSocketTransport(startOptions));
		return new CodexAppServerClient(createStdioTransport(startOptions));
	}
	static fromTransportForTests(child) {
		return new CodexAppServerClient(child);
	}
	async initialize() {
		if (this.initialized) return;
		assertSupportedCodexAppServerVersion(await this.request("initialize", {
			clientInfo: {
				name: "openclaw",
				title: "OpenClaw",
				version: VERSION
			},
			capabilities: { experimentalApi: true }
		}));
		this.notify("initialized");
		this.initialized = true;
	}
	request(method, params, options = {}) {
		if (this.closed) return Promise.reject(/* @__PURE__ */ new Error("codex app-server client is closed"));
		if (options.signal?.aborted) return Promise.reject(/* @__PURE__ */ new Error(`${method} aborted`));
		const id = this.nextId++;
		const message = {
			id,
			method,
			params
		};
		return new Promise((resolve, reject) => {
			let timeout;
			let cleanupAbort;
			const cleanup = () => {
				if (timeout) {
					clearTimeout(timeout);
					timeout = void 0;
				}
				cleanupAbort?.();
				cleanupAbort = void 0;
			};
			const rejectPending = (error) => {
				if (!this.pending.has(id)) return;
				this.pending.delete(id);
				cleanup();
				reject(error);
			};
			if (options.timeoutMs && Number.isFinite(options.timeoutMs) && options.timeoutMs > 0) {
				timeout = setTimeout(() => rejectPending(/* @__PURE__ */ new Error(`${method} timed out`)), Math.max(100, options.timeoutMs));
				timeout.unref?.();
			}
			if (options.signal) {
				const abortListener = () => rejectPending(/* @__PURE__ */ new Error(`${method} aborted`));
				options.signal.addEventListener("abort", abortListener, { once: true });
				cleanupAbort = () => options.signal?.removeEventListener("abort", abortListener);
			}
			this.pending.set(id, {
				method,
				resolve: (value) => {
					cleanup();
					resolve(value);
				},
				reject: (error) => {
					cleanup();
					reject(error);
				},
				cleanup
			});
			if (options.signal?.aborted) {
				rejectPending(/* @__PURE__ */ new Error(`${method} aborted`));
				return;
			}
			try {
				this.writeMessage(message);
			} catch (error) {
				rejectPending(error instanceof Error ? error : new Error(String(error)));
			}
		});
	}
	notify(method, params) {
		this.writeMessage({
			method,
			params
		});
	}
	addRequestHandler(handler) {
		this.requestHandlers.add(handler);
		return () => this.requestHandlers.delete(handler);
	}
	addNotificationHandler(handler) {
		this.notificationHandlers.add(handler);
		return () => this.notificationHandlers.delete(handler);
	}
	addCloseHandler(handler) {
		this.closeHandlers.add(handler);
		return () => this.closeHandlers.delete(handler);
	}
	close() {
		if (this.closed) return;
		this.closed = true;
		this.lines.close();
		this.rejectPendingRequests(/* @__PURE__ */ new Error("codex app-server client is closed"));
		closeCodexAppServerTransport(this.child);
	}
	writeMessage(message) {
		this.child.stdin.write(`${JSON.stringify(message)}\n`);
	}
	handleLine(line) {
		const trimmed = line.trim();
		if (!trimmed) return;
		let parsed;
		try {
			parsed = JSON.parse(trimmed);
		} catch (error) {
			log.warn("failed to parse codex app-server message", { error });
			return;
		}
		if (!parsed || typeof parsed !== "object") return;
		const message = parsed;
		if (isRpcResponse(message)) {
			this.handleResponse(message);
			return;
		}
		if (!("method" in message)) return;
		if ("id" in message && message.id !== void 0) {
			this.handleServerRequest({
				id: message.id,
				method: message.method,
				params: message.params
			});
			return;
		}
		this.handleNotification({
			method: message.method,
			params: message.params
		});
	}
	handleResponse(response) {
		const pending = this.pending.get(response.id);
		if (!pending) return;
		this.pending.delete(response.id);
		if (response.error) {
			pending.reject(new CodexAppServerRpcError(response.error, pending.method));
			return;
		}
		pending.resolve(response.result);
	}
	async handleServerRequest(request) {
		try {
			for (const handler of this.requestHandlers) {
				const result = await handler(request);
				if (result !== void 0) {
					this.writeMessage({
						id: request.id,
						result
					});
					return;
				}
			}
			this.writeMessage({
				id: request.id,
				result: defaultServerRequestResponse(request)
			});
		} catch (error) {
			this.writeMessage({
				id: request.id,
				error: { message: error instanceof Error ? error.message : String(error) }
			});
		}
	}
	handleNotification(notification) {
		for (const handler of this.notificationHandlers) Promise.resolve(handler(notification)).catch((error) => {
			log.warn("codex app-server notification handler failed", { error });
		});
	}
	closeWithError(error) {
		if (this.closed) return;
		this.closed = true;
		this.rejectPendingRequests(error);
	}
	rejectPendingRequests(error) {
		for (const pending of this.pending.values()) {
			pending.cleanup();
			pending.reject(error);
		}
		this.pending.clear();
		for (const handler of this.closeHandlers) handler(this);
	}
};
function defaultServerRequestResponse(request) {
	if (request.method === "item/tool/call") return {
		contentItems: [{
			type: "inputText",
			text: "OpenClaw did not register a handler for this app-server tool call."
		}],
		success: false
	};
	if (request.method === "item/commandExecution/requestApproval" || request.method === "item/fileChange/requestApproval") return { decision: "decline" };
	if (request.method === "item/permissions/requestApproval") return {
		permissions: {},
		scope: "turn"
	};
	if (isCodexAppServerApprovalRequest(request.method)) return {
		decision: "decline",
		reason: "OpenClaw codex app-server bridge does not grant native approvals yet."
	};
	if (request.method === "item/tool/requestUserInput") return { answers: {} };
	if (request.method === "mcpServer/elicitation/request") return { action: "decline" };
	return {};
}
function assertSupportedCodexAppServerVersion(response) {
	const detectedVersion = readCodexVersionFromUserAgent(response.userAgent);
	if (!detectedVersion) throw new Error(`Codex app-server ${MIN_CODEX_APP_SERVER_VERSION} or newer is required, but OpenClaw could not determine the running Codex version. Upgrade Codex CLI and retry.`);
	if (compareVersions(detectedVersion, "0.118.0") < 0) throw new Error(`Codex app-server ${MIN_CODEX_APP_SERVER_VERSION} or newer is required, but detected ${detectedVersion}. Upgrade Codex CLI and retry.`);
}
function readCodexVersionFromUserAgent(userAgent) {
	return (userAgent?.match(/^[^/]+\/(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?)(?:[\s(]|$)/))?.[1];
}
function compareVersions(left, right) {
	const leftParts = numericVersionParts(left);
	const rightParts = numericVersionParts(right);
	for (let index = 0; index < Math.max(leftParts.length, rightParts.length); index += 1) {
		const leftPart = leftParts[index] ?? 0;
		const rightPart = rightParts[index] ?? 0;
		if (leftPart !== rightPart) return leftPart < rightPart ? -1 : 1;
	}
	return 0;
}
function numericVersionParts(version) {
	return version.split(/[+-]/, 1)[0].split(".").map((part) => Number.parseInt(part, 10)).map((part) => Number.isFinite(part) ? part : 0);
}
function isCodexAppServerApprovalRequest(method) {
	return method.includes("requestApproval") || method.includes("Approval");
}
function formatExitValue(value) {
	if (value === null || value === void 0) return "null";
	if (typeof value === "string" || typeof value === "number") return String(value);
	return "unknown";
}
//#endregion
//#region extensions/codex/src/app-server/timeout.ts
async function withTimeout(promise, timeoutMs, timeoutMessage) {
	if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) return await promise;
	let timeout;
	try {
		return await Promise.race([promise, new Promise((_, reject) => {
			timeout = setTimeout(() => reject(new Error(timeoutMessage)), Math.max(1, timeoutMs));
		})]);
	} finally {
		if (timeout) clearTimeout(timeout);
	}
}
//#endregion
//#region extensions/codex/src/app-server/shared-client.ts
const SHARED_CODEX_APP_SERVER_CLIENT_STATE = Symbol.for("openclaw.codexAppServerClientState");
function getSharedCodexAppServerClientState() {
	const globalState = globalThis;
	globalState[SHARED_CODEX_APP_SERVER_CLIENT_STATE] ??= {};
	return globalState[SHARED_CODEX_APP_SERVER_CLIENT_STATE];
}
async function getSharedCodexAppServerClient(options) {
	const state = getSharedCodexAppServerClientState();
	const startOptions = options?.startOptions ?? resolveCodexAppServerRuntimeOptions().start;
	const key = codexAppServerStartOptionsKey(startOptions);
	if (state.key && state.key !== key) clearSharedCodexAppServerClient();
	state.key = key;
	state.promise ??= (async () => {
		const client = CodexAppServerClient.start(startOptions);
		state.client = client;
		client.addCloseHandler(clearSharedClientIfCurrent);
		try {
			await client.initialize();
			return client;
		} catch (error) {
			client.close();
			throw error;
		}
	})();
	try {
		return await withTimeout(state.promise, options?.timeoutMs ?? 0, "codex app-server initialize timed out");
	} catch (error) {
		clearSharedCodexAppServerClient();
		throw error;
	}
}
async function createIsolatedCodexAppServerClient(options) {
	const startOptions = options?.startOptions ?? resolveCodexAppServerRuntimeOptions().start;
	const client = CodexAppServerClient.start(startOptions);
	const initialize = client.initialize();
	try {
		await withTimeout(initialize, options?.timeoutMs ?? 0, "codex app-server initialize timed out");
		return client;
	} catch (error) {
		client.close();
		await initialize.catch(() => void 0);
		throw error;
	}
}
function clearSharedCodexAppServerClient() {
	const state = getSharedCodexAppServerClientState();
	const client = state.client;
	state.client = void 0;
	state.promise = void 0;
	state.key = void 0;
	client?.close();
}
function clearSharedClientIfCurrent(client) {
	const state = getSharedCodexAppServerClientState();
	if (state.client !== client) return;
	state.client = void 0;
	state.promise = void 0;
	state.key = void 0;
}
//#endregion
//#region extensions/codex/src/app-server/compact.ts
const DEFAULT_CODEX_COMPACTION_WAIT_TIMEOUT_MS = 300 * 1e3;
let clientFactory$1 = (startOptions) => getSharedCodexAppServerClient({ startOptions });
async function maybeCompactCodexAppServerSession(params, options = {}) {
	const appServer = resolveCodexAppServerRuntimeOptions({ pluginConfig: options.pluginConfig });
	const binding = await readCodexAppServerBinding(params.sessionFile);
	if (!binding?.threadId) return {
		ok: false,
		compacted: false,
		reason: "no codex app-server thread binding"
	};
	const client = await clientFactory$1(appServer.start);
	const waiter = createCodexNativeCompactionWaiter(client, binding.threadId);
	let completion;
	try {
		await client.request("thread/compact/start", { threadId: binding.threadId });
		log.info("started codex app-server compaction", {
			sessionId: params.sessionId,
			threadId: binding.threadId
		});
		waiter.startTimeout();
		completion = await waiter.promise;
	} catch (error) {
		waiter.cancel();
		return {
			ok: false,
			compacted: false,
			reason: formatCompactionError(error)
		};
	}
	log.info("completed codex app-server compaction", {
		sessionId: params.sessionId,
		threadId: binding.threadId,
		signal: completion.signal,
		turnId: completion.turnId,
		itemId: completion.itemId
	});
	return {
		ok: true,
		compacted: true,
		result: {
			summary: "",
			firstKeptEntryId: "",
			tokensBefore: params.currentTokenCount ?? 0,
			details: {
				backend: "codex-app-server",
				threadId: binding.threadId,
				signal: completion.signal,
				turnId: completion.turnId,
				itemId: completion.itemId
			}
		}
	};
}
function createCodexNativeCompactionWaiter(client, threadId) {
	let settled = false;
	let removeHandler = () => {};
	let timeout;
	let failWaiter = () => {};
	return {
		promise: new Promise((resolve, reject) => {
			const cleanup = () => {
				removeHandler();
				if (timeout) clearTimeout(timeout);
			};
			const complete = (completion) => {
				if (settled) return;
				settled = true;
				cleanup();
				resolve(completion);
			};
			const fail = (error) => {
				if (settled) return;
				settled = true;
				cleanup();
				reject(error);
			};
			failWaiter = fail;
			const handler = (notification) => {
				const completion = readNativeCompactionCompletion(notification, threadId);
				if (completion) complete(completion);
			};
			removeHandler = client.addNotificationHandler(handler);
		}),
		startTimeout() {
			if (settled || timeout) return;
			timeout = setTimeout(() => {
				failWaiter(/* @__PURE__ */ new Error(`timed out waiting for codex app-server compaction for ${threadId}`));
			}, resolveCompactionWaitTimeoutMs());
			timeout.unref?.();
		},
		cancel() {
			if (settled) return;
			settled = true;
			removeHandler();
			if (timeout) clearTimeout(timeout);
		}
	};
}
function readNativeCompactionCompletion(notification, threadId) {
	const params = notification.params;
	if (!isJsonObject(params) || readString$3(params, "threadId", "thread_id") !== threadId) return;
	if (notification.method === "thread/compacted") return {
		signal: "thread/compacted",
		turnId: readString$3(params, "turnId", "turn_id")
	};
	if (notification.method !== "item/completed") return;
	const item = isJsonObject(params.item) ? params.item : void 0;
	if (readString$3(item, "type") !== "contextCompaction") return;
	return {
		signal: "item/completed",
		turnId: readString$3(params, "turnId", "turn_id"),
		itemId: readString$3(item, "id") ?? readString$3(params, "itemId", "item_id", "id")
	};
}
function resolveCompactionWaitTimeoutMs() {
	const raw = process.env.OPENCLAW_CODEX_COMPACTION_WAIT_TIMEOUT_MS?.trim();
	const parsed = raw ? Number.parseInt(raw, 10) : NaN;
	if (Number.isFinite(parsed) && parsed > 0) return parsed;
	return DEFAULT_CODEX_COMPACTION_WAIT_TIMEOUT_MS;
}
function readString$3(params, ...keys) {
	if (!params) return;
	for (const key of keys) {
		const value = params[key];
		if (typeof value === "string") return value;
	}
}
function formatCompactionError(error) {
	if (error instanceof Error) return error.message;
	return String(error);
}
//#endregion
//#region extensions/codex/src/app-server/models.ts
async function listCodexAppServerModels(options = {}) {
	const timeoutMs = options.timeoutMs ?? 2500;
	const useSharedClient = options.sharedClient !== false;
	const client = useSharedClient ? await getSharedCodexAppServerClient({
		startOptions: options.startOptions,
		timeoutMs
	}) : await createIsolatedCodexAppServerClient({
		startOptions: options.startOptions,
		timeoutMs
	});
	try {
		return readModelListResult(await client.request("model/list", {
			limit: options.limit ?? null,
			cursor: options.cursor ?? null,
			includeHidden: options.includeHidden ?? null
		}, { timeoutMs }));
	} finally {
		if (!useSharedClient) client.close();
	}
}
function readModelListResult(value) {
	if (!isJsonObjectValue(value) || !Array.isArray(value.data)) return { models: [] };
	const models = value.data.map((entry) => readCodexModel(entry)).filter((entry) => entry !== void 0);
	const nextCursor = typeof value.nextCursor === "string" ? value.nextCursor : void 0;
	return {
		models,
		...nextCursor ? { nextCursor } : {}
	};
}
function readCodexModel(value) {
	if (!isJsonObjectValue(value)) return;
	const id = readNonEmptyString(value.id);
	const model = readNonEmptyString(value.model) ?? id;
	if (!id || !model) return;
	return {
		id,
		model,
		...readNonEmptyString(value.displayName) ? { displayName: readNonEmptyString(value.displayName) } : {},
		...readNonEmptyString(value.description) ? { description: readNonEmptyString(value.description) } : {},
		...typeof value.hidden === "boolean" ? { hidden: value.hidden } : {},
		...typeof value.isDefault === "boolean" ? { isDefault: value.isDefault } : {},
		inputModalities: readStringArray(value.inputModalities),
		supportedReasoningEfforts: readReasoningEfforts(value.supportedReasoningEfforts),
		...readNonEmptyString(value.defaultReasoningEffort) ? { defaultReasoningEffort: readNonEmptyString(value.defaultReasoningEffort) } : {}
	};
}
function readReasoningEfforts(value) {
	if (!Array.isArray(value)) return [];
	const efforts = value.map((entry) => {
		if (!isJsonObjectValue(entry)) return;
		return readNonEmptyString(entry.reasoningEffort);
	}).filter((entry) => entry !== void 0);
	return [...new Set(efforts)];
}
function readStringArray(value) {
	if (!Array.isArray(value)) return [];
	return [...new Set(value.map((entry) => readNonEmptyString(entry)).filter((entry) => entry !== void 0))];
}
function readNonEmptyString(value) {
	if (typeof value !== "string") return;
	return value.trim() || void 0;
}
function isJsonObjectValue(value) {
	return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
//#endregion
//#region extensions/codex/src/app-server/approval-bridge.ts
const DEFAULT_CODEX_APPROVAL_TIMEOUT_MS = 12e4;
async function handleCodexAppServerApprovalRequest(params) {
	const requestParams = isJsonObject(params.requestParams) ? params.requestParams : void 0;
	if (!matchesCurrentTurn(requestParams, params.threadId, params.turnId)) return;
	const context = buildApprovalContext({
		method: params.method,
		requestParams,
		paramsForRun: params.paramsForRun
	});
	try {
		const timeoutMs = DEFAULT_CODEX_APPROVAL_TIMEOUT_MS;
		const requestResult = await callGatewayTool("plugin.approval.request", { timeoutMs: timeoutMs + 1e4 }, {
			pluginId: "openclaw-codex-app-server",
			title: context.title,
			description: context.description,
			severity: context.severity,
			toolName: context.kind === "exec" ? "codex_command_approval" : "codex_file_approval",
			toolCallId: context.itemId,
			agentId: params.paramsForRun.agentId,
			sessionKey: params.paramsForRun.sessionKey,
			turnSourceChannel: params.paramsForRun.messageChannel ?? params.paramsForRun.messageProvider,
			turnSourceTo: params.paramsForRun.currentChannelId,
			turnSourceAccountId: params.paramsForRun.agentAccountId,
			turnSourceThreadId: params.paramsForRun.currentThreadTs,
			timeoutMs,
			twoPhase: true
		}, { expectFinal: false });
		const approvalId = requestResult?.id;
		if (!approvalId) {
			emitApprovalEvent(params.paramsForRun, {
				phase: "resolved",
				kind: context.kind,
				status: "unavailable",
				title: context.title,
				...context.eventDetails,
				message: "Codex app-server approval route unavailable."
			});
			return buildApprovalResponse(params.method, context.requestParams, "denied");
		}
		emitApprovalEvent(params.paramsForRun, {
			phase: "requested",
			kind: context.kind,
			status: "pending",
			title: context.title,
			approvalId,
			approvalSlug: approvalId,
			...context.eventDetails,
			message: "Codex app-server approval requested."
		});
		const outcome = mapExecDecisionToOutcome(Object.prototype.hasOwnProperty.call(requestResult, "decision") ? requestResult.decision : await waitForApprovalDecision({
			approvalId,
			timeoutMs,
			signal: params.signal
		}));
		emitApprovalEvent(params.paramsForRun, {
			phase: "resolved",
			kind: context.kind,
			status: outcome === "denied" ? "denied" : outcome === "unavailable" ? "unavailable" : outcome === "cancelled" ? "failed" : "approved",
			title: context.title,
			approvalId,
			approvalSlug: approvalId,
			...context.eventDetails,
			message: approvalResolutionMessage(outcome)
		});
		return buildApprovalResponse(params.method, context.requestParams, outcome);
	} catch (error) {
		const cancelled = params.signal?.aborted === true;
		emitApprovalEvent(params.paramsForRun, {
			phase: "resolved",
			kind: context.kind,
			status: cancelled ? "failed" : "unavailable",
			title: context.title,
			...context.eventDetails,
			message: cancelled ? "Codex app-server approval cancelled because the run stopped." : `Codex app-server approval route failed: ${formatErrorMessage(error)}`
		});
		return buildApprovalResponse(params.method, context.requestParams, cancelled ? "cancelled" : "denied");
	}
}
function buildApprovalResponse(method, requestParams, outcome) {
	if (method === "item/commandExecution/requestApproval") return { decision: commandApprovalDecision(requestParams, outcome) };
	if (method === "item/fileChange/requestApproval") return { decision: fileChangeApprovalDecision(outcome) };
	if (method === "item/permissions/requestApproval") {
		if (outcome === "approved-session" || outcome === "approved-once") return {
			permissions: requestedPermissions(requestParams),
			scope: outcome === "approved-session" ? "session" : "turn"
		};
		return {
			permissions: {},
			scope: "turn"
		};
	}
	return { decision: outcome === "approved-once" || outcome === "approved-session" ? "accept" : "decline" };
}
function matchesCurrentTurn(requestParams, threadId, turnId) {
	if (!requestParams) return true;
	const requestThreadId = readString$2(requestParams, "threadId") ?? readString$2(requestParams, "conversationId");
	const requestTurnId = readString$2(requestParams, "turnId");
	if (requestThreadId && requestThreadId !== threadId) return false;
	if (requestTurnId && requestTurnId !== turnId) return false;
	return true;
}
function buildApprovalContext(params) {
	const itemId = readString$2(params.requestParams, "itemId") ?? readString$2(params.requestParams, "callId") ?? readString$2(params.requestParams, "approvalId");
	const command = readCommand(params.requestParams);
	const reason = readString$2(params.requestParams, "reason");
	const kind = approvalKindForMethod(params.method);
	return {
		kind,
		title: kind === "exec" ? "Codex app-server command approval" : kind === "plugin" ? "Codex app-server file approval" : "Codex app-server approval",
		description: [command ? `Command: ${truncate(command, 180)}` : reason ? `Reason: ${truncate(reason, 180)}` : `Request method: ${params.method}`, params.paramsForRun.sessionKey && `Session: ${params.paramsForRun.sessionKey}`].filter(Boolean).join("\n"),
		severity: kind === "exec" ? "warning" : "info",
		itemId,
		requestParams: params.requestParams,
		eventDetails: {
			...itemId ? { itemId } : {},
			...command ? { command } : {},
			...reason ? { reason } : {}
		}
	};
}
async function waitForApprovalDecision(params) {
	const waitPromise = callGatewayTool("plugin.approval.waitDecision", { timeoutMs: params.timeoutMs + 1e4 }, { id: params.approvalId });
	if (!params.signal) return (await waitPromise)?.decision;
	let onAbort;
	const abortPromise = new Promise((_, reject) => {
		if (params.signal.aborted) {
			reject(params.signal.reason);
			return;
		}
		onAbort = () => reject(params.signal.reason);
		params.signal.addEventListener("abort", onAbort, { once: true });
	});
	try {
		return (await Promise.race([waitPromise, abortPromise]))?.decision;
	} finally {
		if (onAbort) params.signal.removeEventListener("abort", onAbort);
	}
}
function commandApprovalDecision(requestParams, outcome) {
	if (outcome === "cancelled") return "cancel";
	if (outcome === "denied" || outcome === "unavailable") return "decline";
	if (outcome === "approved-session" && hasAvailableDecision(requestParams, "acceptForSession")) return "acceptForSession";
	return "accept";
}
function fileChangeApprovalDecision(outcome) {
	if (outcome === "cancelled") return "cancel";
	if (outcome === "denied" || outcome === "unavailable") return "decline";
	return outcome === "approved-session" ? "acceptForSession" : "accept";
}
function requestedPermissions(requestParams) {
	const permissions = isJsonObject(requestParams?.permissions) ? requestParams.permissions : {};
	const granted = {};
	if (isJsonObject(permissions.network)) granted.network = permissions.network;
	if (isJsonObject(permissions.fileSystem)) granted.fileSystem = permissions.fileSystem;
	return granted;
}
function hasAvailableDecision(requestParams, decision) {
	const available = requestParams?.availableDecisions;
	if (!Array.isArray(available)) return true;
	return available.includes(decision);
}
function mapExecDecisionToOutcome(decision) {
	if (decision === "allow-once") return "approved-once";
	if (decision === "allow-always") return "approved-session";
	if (decision === null || decision === void 0) return "unavailable";
	return "denied";
}
function approvalResolutionMessage(outcome) {
	if (outcome === "approved-session") return "Codex app-server approval granted for the session.";
	if (outcome === "approved-once") return "Codex app-server approval granted once.";
	if (outcome === "cancelled") return "Codex app-server approval cancelled.";
	if (outcome === "unavailable") return "Codex app-server approval unavailable.";
	return "Codex app-server approval denied.";
}
function approvalKindForMethod(method) {
	if (method.includes("commandExecution") || method.includes("execCommand")) return "exec";
	if (method.includes("fileChange") || method.includes("Patch") || method.includes("permissions")) return "plugin";
	return "unknown";
}
function emitApprovalEvent(params, data) {
	params.onAgentEvent?.({
		stream: "approval",
		data
	});
}
function readCommand(record) {
	const command = record?.command;
	if (typeof command === "string") return command;
	if (Array.isArray(command) && command.every((part) => typeof part === "string")) return command.join(" ");
}
function readString$2(record, key) {
	const value = record?.[key];
	return typeof value === "string" ? value : void 0;
}
function truncate(value, maxLength) {
	return value.length <= maxLength ? value : `${value.slice(0, Math.max(0, maxLength - 3))}...`;
}
function formatErrorMessage(error) {
	return error instanceof Error ? error.message : String(error);
}
//#endregion
//#region extensions/codex/src/app-server/dynamic-tools.ts
function createCodexDynamicToolBridge(params) {
	const toolMap = new Map(params.tools.map((tool) => [tool.name, tool]));
	const telemetry = {
		didSendViaMessagingTool: false,
		messagingToolSentTexts: [],
		messagingToolSentMediaUrls: [],
		messagingToolSentTargets: [],
		toolMediaUrls: [],
		toolAudioAsVoice: false
	};
	return {
		specs: params.tools.map((tool) => ({
			name: tool.name,
			description: tool.description,
			inputSchema: toJsonValue(tool.parameters)
		})),
		telemetry,
		handleToolCall: async (call) => {
			const tool = toolMap.get(call.tool);
			if (!tool) return {
				contentItems: [{
					type: "inputText",
					text: `Unknown OpenClaw tool: ${call.tool}`
				}],
				success: false
			};
			const args = jsonObjectToRecord(call.arguments);
			try {
				const preparedArgs = tool.prepareArguments ? tool.prepareArguments(args) : args;
				const result = await tool.execute(call.callId, preparedArgs, params.signal);
				collectToolTelemetry({
					toolName: tool.name,
					args,
					result,
					telemetry,
					isError: false
				});
				return {
					contentItems: result.content.flatMap(convertToolContent),
					success: true
				};
			} catch (error) {
				collectToolTelemetry({
					toolName: tool.name,
					args,
					result: void 0,
					telemetry,
					isError: true
				});
				return {
					contentItems: [{
						type: "inputText",
						text: error instanceof Error ? error.message : String(error)
					}],
					success: false
				};
			}
		}
	};
}
function collectToolTelemetry(params) {
	if (params.isError) return;
	if (!params.isError && params.toolName === "cron" && isCronAddAction(params.args)) params.telemetry.successfulCronAdds = (params.telemetry.successfulCronAdds ?? 0) + 1;
	if (!params.isError && params.result) {
		const media = extractToolResultMediaArtifact(params.result);
		if (media) {
			const mediaUrls = filterToolResultMediaUrls(params.toolName, media.mediaUrls, params.result);
			const seen = new Set(params.telemetry.toolMediaUrls);
			for (const mediaUrl of mediaUrls) if (!seen.has(mediaUrl)) {
				seen.add(mediaUrl);
				params.telemetry.toolMediaUrls.push(mediaUrl);
			}
			if (media.audioAsVoice) params.telemetry.toolAudioAsVoice = true;
		}
	}
	if (!isMessagingTool(params.toolName) || !isMessagingToolSendAction(params.toolName, params.args)) return;
	params.telemetry.didSendViaMessagingTool = true;
	const text = readFirstString(params.args, [
		"text",
		"message",
		"body",
		"content"
	]);
	if (text) params.telemetry.messagingToolSentTexts.push(text);
	params.telemetry.messagingToolSentMediaUrls.push(...collectMediaUrls(params.args));
	params.telemetry.messagingToolSentTargets.push({
		tool: params.toolName,
		provider: readFirstString(params.args, ["provider", "channel"]) ?? params.toolName,
		accountId: readFirstString(params.args, ["accountId", "account_id"]),
		to: readFirstString(params.args, [
			"to",
			"target",
			"recipient"
		]),
		threadId: readFirstString(params.args, [
			"threadId",
			"thread_id",
			"messageThreadId"
		])
	});
}
function convertToolContent(content) {
	if (content.type === "text") return [{
		type: "inputText",
		text: content.text
	}];
	return [{
		type: "inputImage",
		imageUrl: `data:${content.mimeType};base64,${content.data}`
	}];
}
function toJsonValue(value) {
	try {
		const text = JSON.stringify(value);
		if (!text) return {};
		return JSON.parse(text);
	} catch {
		return {};
	}
}
function jsonObjectToRecord(value) {
	if (!value || typeof value !== "object" || Array.isArray(value)) return {};
	return value;
}
function readFirstString(record, keys) {
	for (const key of keys) {
		const value = record[key];
		if (typeof value === "string" && value.trim()) return value.trim();
		if (typeof value === "number" && Number.isFinite(value)) return String(value);
	}
}
function collectMediaUrls(record) {
	const urls = [];
	for (const key of [
		"mediaUrl",
		"media_url",
		"imageUrl",
		"image_url"
	]) {
		const value = record[key];
		if (typeof value === "string" && value.trim()) urls.push(value.trim());
	}
	for (const key of [
		"mediaUrls",
		"media_urls",
		"imageUrls",
		"image_urls"
	]) {
		const value = record[key];
		if (!Array.isArray(value)) continue;
		for (const entry of value) if (typeof entry === "string" && entry.trim()) urls.push(entry.trim());
	}
	return urls;
}
function isCronAddAction(args) {
	const action = args.action;
	return typeof action === "string" && action.trim().toLowerCase() === "add";
}
//#endregion
//#region extensions/codex/src/app-server/event-projector.ts
const ZERO_USAGE = {
	input: 0,
	output: 0,
	cacheRead: 0,
	cacheWrite: 0,
	totalTokens: 0,
	cost: {
		input: 0,
		output: 0,
		cacheRead: 0,
		cacheWrite: 0,
		total: 0
	}
};
var CodexAppServerEventProjector = class {
	constructor(params, threadId, turnId) {
		this.params = params;
		this.threadId = threadId;
		this.turnId = turnId;
		this.assistantTextByItem = /* @__PURE__ */ new Map();
		this.assistantItemOrder = [];
		this.reasoningTextByItem = /* @__PURE__ */ new Map();
		this.planTextByItem = /* @__PURE__ */ new Map();
		this.activeItemIds = /* @__PURE__ */ new Set();
		this.completedItemIds = /* @__PURE__ */ new Set();
		this.activeCompactionItemIds = /* @__PURE__ */ new Set();
		this.toolMetas = /* @__PURE__ */ new Map();
		this.assistantStarted = false;
		this.reasoningStarted = false;
		this.reasoningEnded = false;
		this.promptErrorSource = null;
		this.aborted = false;
		this.guardianReviewCount = 0;
		this.completedCompactionCount = 0;
	}
	async handleNotification(notification) {
		const params = isJsonObject(notification.params) ? notification.params : void 0;
		if (!params || !this.isNotificationForTurn(params)) return;
		switch (notification.method) {
			case "item/agentMessage/delta":
				await this.handleAssistantDelta(params);
				break;
			case "item/reasoning/summaryTextDelta":
			case "item/reasoning/textDelta":
				await this.handleReasoningDelta(params);
				break;
			case "item/plan/delta":
				this.handlePlanDelta(params);
				break;
			case "turn/plan/updated":
				this.handleTurnPlanUpdated(params);
				break;
			case "item/started":
				this.handleItemStarted(params);
				break;
			case "item/completed":
				this.handleItemCompleted(params);
				break;
			case "item/autoApprovalReview/started":
			case "item/autoApprovalReview/completed":
				this.guardianReviewCount += 1;
				this.params.onAgentEvent?.({
					stream: "codex_app_server.guardian",
					data: { method: notification.method }
				});
				break;
			case "thread/tokenUsage/updated":
				this.handleTokenUsage(params);
				break;
			case "turn/completed":
				await this.handleTurnCompleted(params);
				break;
			case "error":
				this.promptError = readString$1(params, "message") ?? "codex app-server error";
				this.promptErrorSource = "prompt";
				break;
			default: break;
		}
	}
	buildResult(toolTelemetry, options) {
		const assistantTexts = this.collectAssistantTexts();
		const reasoningText = collectTextValues(this.reasoningTextByItem).join("\n\n");
		const planText = collectTextValues(this.planTextByItem).join("\n\n");
		const lastAssistant = assistantTexts.length > 0 ? this.createAssistantMessage(assistantTexts.join("\n\n")) : void 0;
		const messagesSnapshot = [{
			role: "user",
			content: this.params.prompt,
			timestamp: Date.now()
		}];
		if (reasoningText) messagesSnapshot.push(this.createAssistantMirrorMessage("Codex reasoning", reasoningText));
		if (planText) messagesSnapshot.push(this.createAssistantMirrorMessage("Codex plan", planText));
		if (lastAssistant) messagesSnapshot.push(lastAssistant);
		const turnFailed = this.completedTurn?.status === "failed";
		const turnInterrupted = this.completedTurn?.status === "interrupted";
		const promptError = this.promptError ?? (turnFailed ? this.completedTurn?.error?.message ?? "codex app-server turn failed" : null);
		return {
			aborted: this.aborted || turnInterrupted,
			externalAbort: false,
			timedOut: false,
			idleTimedOut: false,
			timedOutDuringCompaction: false,
			promptError,
			promptErrorSource: promptError ? this.promptErrorSource || "prompt" : null,
			sessionIdUsed: this.params.sessionId,
			bootstrapPromptWarningSignaturesSeen: this.params.bootstrapPromptWarningSignaturesSeen,
			bootstrapPromptWarningSignature: this.params.bootstrapPromptWarningSignature,
			messagesSnapshot,
			assistantTexts,
			toolMetas: [...this.toolMetas.values()],
			lastAssistant,
			didSendViaMessagingTool: toolTelemetry.didSendViaMessagingTool,
			messagingToolSentTexts: toolTelemetry.messagingToolSentTexts,
			messagingToolSentMediaUrls: toolTelemetry.messagingToolSentMediaUrls,
			messagingToolSentTargets: toolTelemetry.messagingToolSentTargets,
			toolMediaUrls: toolTelemetry.toolMediaUrls,
			toolAudioAsVoice: toolTelemetry.toolAudioAsVoice,
			successfulCronAdds: toolTelemetry.successfulCronAdds,
			cloudCodeAssistFormatError: false,
			attemptUsage: this.tokenUsage,
			replayMetadata: {
				hadPotentialSideEffects: toolTelemetry.didSendViaMessagingTool,
				replaySafe: !toolTelemetry.didSendViaMessagingTool
			},
			itemLifecycle: {
				startedCount: this.activeItemIds.size + this.completedItemIds.size,
				completedCount: this.completedItemIds.size,
				activeCount: this.activeItemIds.size,
				...this.completedCompactionCount > 0 ? { compactionCount: this.completedCompactionCount } : {}
			},
			yieldDetected: options?.yieldDetected || false,
			didSendDeterministicApprovalPrompt: this.guardianReviewCount > 0 ? false : void 0
		};
	}
	markTimedOut() {
		this.aborted = true;
		this.promptError = "codex app-server attempt timed out";
		this.promptErrorSource = "prompt";
	}
	isCompacting() {
		return this.activeCompactionItemIds.size > 0;
	}
	async handleAssistantDelta(params) {
		const itemId = readString$1(params, "itemId") ?? readString$1(params, "id") ?? "assistant";
		const delta = readString$1(params, "delta") ?? "";
		if (!delta) return;
		if (!this.assistantStarted) {
			this.assistantStarted = true;
			await this.params.onAssistantMessageStart?.();
		}
		this.rememberAssistantItem(itemId);
		const text = `${this.assistantTextByItem.get(itemId) ?? ""}${delta}`;
		this.assistantTextByItem.set(itemId, text);
	}
	async handleReasoningDelta(params) {
		const itemId = readString$1(params, "itemId") ?? readString$1(params, "id") ?? "reasoning";
		const delta = readString$1(params, "delta") ?? "";
		if (!delta) return;
		this.reasoningStarted = true;
		this.reasoningTextByItem.set(itemId, `${this.reasoningTextByItem.get(itemId) ?? ""}${delta}`);
		await this.params.onReasoningStream?.({ text: delta });
	}
	handlePlanDelta(params) {
		const itemId = readString$1(params, "itemId") ?? readString$1(params, "id") ?? "plan";
		const delta = readString$1(params, "delta") ?? "";
		if (!delta) return;
		const text = `${this.planTextByItem.get(itemId) ?? ""}${delta}`;
		this.planTextByItem.set(itemId, text);
		this.emitPlanUpdate({
			explanation: void 0,
			steps: splitPlanText(text)
		});
	}
	handleTurnPlanUpdated(params) {
		const plan = Array.isArray(params.plan) ? params.plan.flatMap((entry) => {
			if (!isJsonObject(entry)) return [];
			const step = readString$1(entry, "step");
			const status = readString$1(entry, "status");
			if (!step) return [];
			return status ? [`${step} (${status})`] : [step];
		}) : void 0;
		this.emitPlanUpdate({
			explanation: readNullableString(params, "explanation"),
			steps: plan
		});
	}
	handleItemStarted(params) {
		const item = readItem(params.item);
		const itemId = item?.id ?? readString$1(params, "itemId") ?? readString$1(params, "id");
		if (itemId) this.activeItemIds.add(itemId);
		if (item?.type === "contextCompaction" && itemId) {
			this.activeCompactionItemIds.add(itemId);
			this.params.onAgentEvent?.({
				stream: "compaction",
				data: {
					phase: "start",
					backend: "codex-app-server",
					threadId: this.threadId,
					turnId: this.turnId,
					itemId
				}
			});
		}
		this.emitStandardItemEvent({
			phase: "start",
			item
		});
		this.params.onAgentEvent?.({
			stream: "codex_app_server.item",
			data: {
				phase: "started",
				itemId,
				type: item?.type
			}
		});
	}
	handleItemCompleted(params) {
		const item = readItem(params.item);
		const itemId = item?.id ?? readString$1(params, "itemId") ?? readString$1(params, "id");
		if (itemId) {
			this.activeItemIds.delete(itemId);
			this.completedItemIds.add(itemId);
		}
		if (item?.type === "agentMessage" && typeof item.text === "string" && item.text) {
			this.rememberAssistantItem(item.id);
			this.assistantTextByItem.set(item.id, item.text);
		}
		if (item?.type === "plan" && typeof item.text === "string" && item.text) {
			this.planTextByItem.set(item.id, item.text);
			this.emitPlanUpdate({
				explanation: void 0,
				steps: splitPlanText(item.text)
			});
		}
		if (item?.type === "contextCompaction" && itemId) {
			this.activeCompactionItemIds.delete(itemId);
			this.completedCompactionCount += 1;
			this.params.onAgentEvent?.({
				stream: "compaction",
				data: {
					phase: "end",
					backend: "codex-app-server",
					threadId: this.threadId,
					turnId: this.turnId,
					itemId
				}
			});
		}
		this.recordToolMeta(item);
		this.emitStandardItemEvent({
			phase: "end",
			item
		});
		this.params.onAgentEvent?.({
			stream: "codex_app_server.item",
			data: {
				phase: "completed",
				itemId,
				type: item?.type
			}
		});
	}
	handleTokenUsage(params) {
		const tokenUsage = isJsonObject(params.tokenUsage) ? params.tokenUsage : void 0;
		const total = tokenUsage && isJsonObject(tokenUsage.total) ? tokenUsage.total : void 0;
		if (!total) return;
		this.tokenUsage = normalizeUsage({
			input: readNumber(total, "inputTokens"),
			output: readNumber(total, "outputTokens"),
			cacheRead: readNumber(total, "cachedInputTokens"),
			total: readNumber(total, "totalTokens")
		});
	}
	async handleTurnCompleted(params) {
		const turn = readTurn(params.turn);
		if (!turn || turn.id !== this.turnId) return;
		this.completedTurn = turn;
		if (turn.status === "interrupted") this.aborted = true;
		if (turn.status === "failed") {
			this.promptError = turn.error?.message ?? "codex app-server turn failed";
			this.promptErrorSource = "prompt";
		}
		for (const item of turn.items ?? []) {
			if (item.type === "agentMessage" && typeof item.text === "string" && item.text) {
				this.rememberAssistantItem(item.id);
				this.assistantTextByItem.set(item.id, item.text);
			}
			if (item.type === "plan" && typeof item.text === "string" && item.text) {
				this.planTextByItem.set(item.id, item.text);
				this.emitPlanUpdate({
					explanation: void 0,
					steps: splitPlanText(item.text)
				});
			}
			this.recordToolMeta(item);
		}
		this.activeCompactionItemIds.clear();
		await this.maybeEndReasoning();
	}
	async maybeEndReasoning() {
		if (!this.reasoningStarted || this.reasoningEnded) return;
		this.reasoningEnded = true;
		await this.params.onReasoningEnd?.();
	}
	emitPlanUpdate(params) {
		if (!params.explanation && (!params.steps || params.steps.length === 0)) return;
		this.params.onAgentEvent?.({
			stream: "plan",
			data: {
				phase: "update",
				title: "Plan updated",
				source: "codex-app-server",
				...params.explanation ? { explanation: params.explanation } : {},
				...params.steps && params.steps.length > 0 ? { steps: params.steps } : {}
			}
		});
	}
	emitStandardItemEvent(params) {
		const { item } = params;
		if (!item) return;
		const kind = itemKind(item);
		if (!kind) return;
		this.params.onAgentEvent?.({
			stream: "item",
			data: {
				itemId: item.id,
				phase: params.phase,
				kind,
				title: itemTitle(item),
				status: params.phase === "start" ? "running" : itemStatus(item),
				...itemName(item) ? { name: itemName(item) } : {},
				...itemMeta(item) ? { meta: itemMeta(item) } : {}
			}
		});
	}
	recordToolMeta(item) {
		if (!item) return;
		const toolName = itemName(item);
		if (!toolName) return;
		this.toolMetas.set(item.id, {
			toolName,
			...itemMeta(item) ? { meta: itemMeta(item) } : {}
		});
	}
	collectAssistantTexts() {
		const finalText = this.resolveFinalAssistantText();
		return finalText ? [finalText] : [];
	}
	resolveFinalAssistantText() {
		for (let i = this.assistantItemOrder.length - 1; i >= 0; i -= 1) {
			const itemId = this.assistantItemOrder[i];
			if (!itemId) continue;
			const text = this.assistantTextByItem.get(itemId)?.trim();
			if (text) return text;
		}
	}
	rememberAssistantItem(itemId) {
		if (!itemId || this.assistantItemOrder.includes(itemId)) return;
		this.assistantItemOrder.push(itemId);
	}
	createAssistantMessage(text) {
		const usage = this.tokenUsage ? {
			input: this.tokenUsage.input ?? 0,
			output: this.tokenUsage.output ?? 0,
			cacheRead: this.tokenUsage.cacheRead ?? 0,
			cacheWrite: this.tokenUsage.cacheWrite ?? 0,
			totalTokens: this.tokenUsage.total ?? (this.tokenUsage.input ?? 0) + (this.tokenUsage.output ?? 0) + (this.tokenUsage.cacheRead ?? 0) + (this.tokenUsage.cacheWrite ?? 0),
			cost: ZERO_USAGE.cost
		} : ZERO_USAGE;
		return {
			role: "assistant",
			content: [{
				type: "text",
				text
			}],
			api: this.params.model.api ?? "openai-codex-responses",
			provider: this.params.provider,
			model: this.params.modelId,
			usage,
			stopReason: this.aborted ? "aborted" : this.promptError ? "error" : "stop",
			errorMessage: this.promptError ? formatErrorMessage$1(this.promptError) : void 0,
			timestamp: Date.now()
		};
	}
	createAssistantMirrorMessage(title, text) {
		return {
			role: "assistant",
			content: [{
				type: "text",
				text: `${title}:\n${text}`
			}],
			api: this.params.model.api ?? "openai-codex-responses",
			provider: this.params.provider,
			model: this.params.modelId,
			usage: ZERO_USAGE,
			stopReason: "stop",
			timestamp: Date.now()
		};
	}
	isNotificationForTurn(params) {
		const threadId = readString$1(params, "threadId");
		const turnId = readString$1(params, "turnId");
		return (!threadId || threadId === this.threadId) && (!turnId || turnId === this.turnId);
	}
};
function readString$1(record, key) {
	const value = record[key];
	return typeof value === "string" ? value : void 0;
}
function readNullableString(record, key) {
	const value = record[key];
	if (value === null) return null;
	return typeof value === "string" ? value : void 0;
}
function readNumber(record, key) {
	const value = record[key];
	return typeof value === "number" && Number.isFinite(value) ? value : void 0;
}
function splitPlanText(text) {
	return text.split(/\r?\n/).map((line) => line.trim().replace(/^[-*]\s+/, "")).filter((line) => line.length > 0);
}
function collectTextValues(map) {
	return [...map.values()].filter((text) => text.trim().length > 0);
}
function itemKind(item) {
	switch (item.type) {
		case "dynamicToolCall":
		case "mcpToolCall": return "tool";
		case "commandExecution": return "command";
		case "fileChange": return "patch";
		case "webSearch": return "search";
		case "reasoning":
		case "contextCompaction": return "analysis";
		default: return;
	}
}
function itemTitle(item) {
	switch (item.type) {
		case "commandExecution": return "Command";
		case "fileChange": return "File change";
		case "mcpToolCall": return "MCP tool";
		case "dynamicToolCall": return "Tool";
		case "webSearch": return "Web search";
		case "contextCompaction": return "Context compaction";
		case "reasoning": return "Reasoning";
		default: return item.type;
	}
}
function itemStatus(item) {
	const status = readItemString(item, "status");
	if (status === "failed") return "failed";
	if (status === "inProgress" || status === "running") return "running";
	return "completed";
}
function itemName(item) {
	if (item.type === "dynamicToolCall" && typeof item.tool === "string") return item.tool;
	if (item.type === "mcpToolCall" && typeof item.tool === "string") {
		const server = typeof item.server === "string" ? item.server : void 0;
		return server ? `${server}.${item.tool}` : item.tool;
	}
	if (item.type === "commandExecution") return "bash";
	if (item.type === "fileChange") return "apply_patch";
	if (item.type === "webSearch") return "web_search";
}
function itemMeta(item) {
	if (item.type === "commandExecution" && typeof item.command === "string") return item.command;
	if (item.type === "webSearch" && typeof item.query === "string") return item.query;
	return readItemString(item, "status");
}
function readItemString(item, key) {
	const value = item[key];
	return typeof value === "string" ? value : void 0;
}
function readItem(value) {
	if (!isJsonObject(value)) return;
	const type = typeof value.type === "string" ? value.type : void 0;
	const id = typeof value.id === "string" ? value.id : void 0;
	if (!type || !id) return;
	return value;
}
function readTurn(value) {
	if (!isJsonObject(value)) return;
	const id = typeof value.id === "string" ? value.id : void 0;
	const status = typeof value.status === "string" ? value.status : void 0;
	if (!id || !status) return;
	const items = Array.isArray(value.items) ? value.items.flatMap((item) => {
		const parsed = readItem(item);
		return parsed ? [parsed] : [];
	}) : void 0;
	return {
		id,
		status,
		error: isJsonObject(value.error) ? { message: typeof value.error.message === "string" ? value.error.message : void 0 } : null,
		items
	};
}
//#endregion
//#region extensions/codex/src/app-server/thread-lifecycle.ts
async function startOrResumeThread(params) {
	const dynamicToolsFingerprint = fingerprintDynamicTools(params.dynamicTools);
	const binding = await readCodexAppServerBinding(params.params.sessionFile);
	if (binding?.threadId) if (binding.dynamicToolsFingerprint && binding.dynamicToolsFingerprint !== dynamicToolsFingerprint) {
		log.debug("codex app-server dynamic tool catalog changed; starting a new thread", { threadId: binding.threadId });
		await clearCodexAppServerBinding(params.params.sessionFile);
	} else try {
		const response = await params.client.request("thread/resume", buildThreadResumeParams(params.params, {
			threadId: binding.threadId,
			appServer: params.appServer
		}));
		await writeCodexAppServerBinding(params.params.sessionFile, {
			threadId: response.thread.id,
			cwd: params.cwd,
			model: params.params.modelId,
			modelProvider: response.modelProvider ?? normalizeModelProvider(params.params.provider),
			dynamicToolsFingerprint,
			createdAt: binding.createdAt
		});
		return {
			...binding,
			threadId: response.thread.id,
			cwd: params.cwd,
			model: params.params.modelId,
			modelProvider: response.modelProvider ?? normalizeModelProvider(params.params.provider),
			dynamicToolsFingerprint
		};
	} catch (error) {
		log.warn("codex app-server thread resume failed; starting a new thread", { error });
		await clearCodexAppServerBinding(params.params.sessionFile);
	}
	const response = await params.client.request("thread/start", {
		model: params.params.modelId,
		modelProvider: normalizeModelProvider(params.params.provider),
		cwd: params.cwd,
		approvalPolicy: params.appServer.approvalPolicy,
		approvalsReviewer: params.appServer.approvalsReviewer,
		sandbox: params.appServer.sandbox,
		...params.appServer.serviceTier ? { serviceTier: params.appServer.serviceTier } : {},
		serviceName: "OpenClaw",
		developerInstructions: buildDeveloperInstructions(params.params),
		dynamicTools: params.dynamicTools,
		experimentalRawEvents: true,
		persistExtendedHistory: true
	});
	const createdAt = (/* @__PURE__ */ new Date()).toISOString();
	await writeCodexAppServerBinding(params.params.sessionFile, {
		threadId: response.thread.id,
		cwd: params.cwd,
		model: response.model ?? params.params.modelId,
		modelProvider: response.modelProvider ?? normalizeModelProvider(params.params.provider),
		dynamicToolsFingerprint,
		createdAt
	});
	return {
		schemaVersion: 1,
		threadId: response.thread.id,
		sessionFile: params.params.sessionFile,
		cwd: params.cwd,
		model: response.model ?? params.params.modelId,
		modelProvider: response.modelProvider ?? normalizeModelProvider(params.params.provider),
		dynamicToolsFingerprint,
		createdAt,
		updatedAt: createdAt
	};
}
function buildThreadResumeParams(params, options) {
	return {
		threadId: options.threadId,
		model: params.modelId,
		modelProvider: normalizeModelProvider(params.provider),
		approvalPolicy: options.appServer.approvalPolicy,
		approvalsReviewer: options.appServer.approvalsReviewer,
		sandbox: options.appServer.sandbox,
		...options.appServer.serviceTier ? { serviceTier: options.appServer.serviceTier } : {},
		persistExtendedHistory: true
	};
}
function buildTurnStartParams(params, options) {
	return {
		threadId: options.threadId,
		input: buildUserInput(params),
		cwd: options.cwd,
		approvalPolicy: options.appServer.approvalPolicy,
		approvalsReviewer: options.appServer.approvalsReviewer,
		model: params.modelId,
		...options.appServer.serviceTier ? { serviceTier: options.appServer.serviceTier } : {},
		effort: resolveReasoningEffort(params.thinkLevel)
	};
}
function fingerprintDynamicTools(dynamicTools) {
	return JSON.stringify(dynamicTools.map(stabilizeJsonValue));
}
function stabilizeJsonValue(value) {
	if (Array.isArray(value)) return value.map(stabilizeJsonValue);
	if (!isJsonObject(value)) return value;
	const stable = {};
	for (const [key, child] of Object.entries(value).toSorted(([left], [right]) => left.localeCompare(right))) stable[key] = stabilizeJsonValue(child);
	return stable;
}
function buildDeveloperInstructions(params) {
	return [
		"You are running inside OpenClaw. Use OpenClaw dynamic tools for messaging, cron, sessions, and host actions when available.",
		"Preserve the user's existing channel/session context. If sending a channel reply, use the OpenClaw messaging tool instead of describing that you would reply.",
		params.extraSystemPrompt,
		params.skillsSnapshot?.prompt
	].filter((section) => typeof section === "string" && section.trim()).join("\n\n");
}
function buildUserInput(params) {
	return [{
		type: "text",
		text: params.prompt
	}, ...(params.images ?? []).map((image) => ({
		type: "image",
		url: `data:${image.mimeType};base64,${image.data}`
	}))];
}
function normalizeModelProvider(provider) {
	return provider === "codex" || provider === "openai-codex" ? "openai" : provider;
}
function resolveReasoningEffort(thinkLevel) {
	if (thinkLevel === "minimal" || thinkLevel === "low" || thinkLevel === "medium" || thinkLevel === "high" || thinkLevel === "xhigh") return thinkLevel;
	return null;
}
//#endregion
//#region extensions/codex/src/app-server/transcript-mirror.ts
async function mirrorCodexAppServerTranscript(params) {
	const messages = params.messages.filter((message) => message.role === "user" || message.role === "assistant");
	if (messages.length === 0) return;
	await fs.mkdir(path.dirname(params.sessionFile), { recursive: true });
	const lock = await acquireSessionWriteLock({
		sessionFile: params.sessionFile,
		timeoutMs: 1e4
	});
	try {
		const existingIdempotencyKeys = await readTranscriptIdempotencyKeys(params.sessionFile);
		const sessionManager = SessionManager.open(params.sessionFile);
		for (const [index, message] of messages.entries()) {
			const idempotencyKey = params.idempotencyScope ? `${params.idempotencyScope}:${message.role}:${index}` : void 0;
			if (idempotencyKey && existingIdempotencyKeys.has(idempotencyKey)) continue;
			const transcriptMessage = {
				...message,
				...idempotencyKey ? { idempotencyKey } : {}
			};
			sessionManager.appendMessage(transcriptMessage);
			if (idempotencyKey) existingIdempotencyKeys.add(idempotencyKey);
		}
	} finally {
		await lock.release();
	}
	if (params.sessionKey) emitSessionTranscriptUpdate({
		sessionFile: params.sessionFile,
		sessionKey: params.sessionKey
	});
	else emitSessionTranscriptUpdate(params.sessionFile);
}
async function readTranscriptIdempotencyKeys(sessionFile) {
	const keys = /* @__PURE__ */ new Set();
	let raw;
	try {
		raw = await fs.readFile(sessionFile, "utf8");
	} catch (error) {
		if (error.code !== "ENOENT") throw error;
		return keys;
	}
	for (const line of raw.split(/\r?\n/)) {
		if (!line.trim()) continue;
		try {
			const parsed = JSON.parse(line);
			if (typeof parsed.message?.idempotencyKey === "string") keys.add(parsed.message.idempotencyKey);
		} catch {
			continue;
		}
	}
	return keys;
}
//#endregion
//#region extensions/codex/src/app-server/run-attempt.ts
let clientFactory = (startOptions) => getSharedCodexAppServerClient({ startOptions });
async function runCodexAppServerAttempt(params, options = {}) {
	const appServer = resolveCodexAppServerRuntimeOptions({ pluginConfig: options.pluginConfig });
	const resolvedWorkspace = resolveUserPath(params.workspaceDir);
	await fs.mkdir(resolvedWorkspace, { recursive: true });
	const sandboxSessionKey = params.sessionKey?.trim() || params.sessionId;
	const sandbox = await resolveSandboxContext({
		config: params.config,
		sessionKey: sandboxSessionKey,
		workspaceDir: resolvedWorkspace
	});
	const effectiveWorkspace = sandbox?.enabled ? sandbox.workspaceAccess === "rw" ? resolvedWorkspace : sandbox.workspaceDir : resolvedWorkspace;
	await fs.mkdir(effectiveWorkspace, { recursive: true });
	const runAbortController = new AbortController();
	const abortFromUpstream = () => {
		runAbortController.abort(params.abortSignal?.reason ?? "upstream_abort");
	};
	if (params.abortSignal?.aborted) abortFromUpstream();
	else params.abortSignal?.addEventListener("abort", abortFromUpstream, { once: true });
	const { sessionAgentId } = resolveSessionAgentIds({
		sessionKey: params.sessionKey,
		config: params.config,
		agentId: params.agentId
	});
	let yieldDetected = false;
	const toolBridge = createCodexDynamicToolBridge({
		tools: await buildDynamicTools({
			params,
			resolvedWorkspace,
			effectiveWorkspace,
			sandboxSessionKey,
			sandbox,
			runAbortController,
			sessionAgentId,
			onYieldDetected: () => {
				yieldDetected = true;
			}
		}),
		signal: runAbortController.signal
	});
	let client;
	let thread;
	try {
		({client, thread} = await withCodexStartupTimeout({
			timeoutMs: params.timeoutMs,
			signal: runAbortController.signal,
			operation: async () => {
				const startupClient = await clientFactory(appServer.start);
				return {
					client: startupClient,
					thread: await startOrResumeThread({
						client: startupClient,
						params,
						cwd: effectiveWorkspace,
						dynamicTools: toolBridge.specs,
						appServer
					})
				};
			}
		}));
	} catch (error) {
		clearSharedCodexAppServerClient();
		params.abortSignal?.removeEventListener("abort", abortFromUpstream);
		throw error;
	}
	let projector;
	let turnId;
	const pendingNotifications = [];
	let completed = false;
	let timedOut = false;
	let resolveCompletion;
	const completion = new Promise((resolve) => {
		resolveCompletion = resolve;
	});
	let notificationQueue = Promise.resolve();
	const handleNotification = async (notification) => {
		if (!projector || !turnId) {
			pendingNotifications.push(notification);
			return;
		}
		await projector.handleNotification(notification);
		if (notification.method === "turn/completed" && isTurnNotification(notification.params, turnId)) {
			completed = true;
			resolveCompletion?.();
		}
	};
	const enqueueNotification = (notification) => {
		notificationQueue = notificationQueue.then(() => handleNotification(notification), () => handleNotification(notification));
		return notificationQueue;
	};
	const notificationCleanup = client.addNotificationHandler(enqueueNotification);
	const requestCleanup = client.addRequestHandler(async (request) => {
		if (!turnId) return;
		if (request.method !== "item/tool/call") {
			if (isCodexAppServerApprovalRequest(request.method)) return handleApprovalRequest({
				method: request.method,
				params: request.params,
				paramsForRun: params,
				threadId: thread.threadId,
				turnId,
				signal: runAbortController.signal
			});
			return;
		}
		const call = readDynamicToolCallParams(request.params);
		if (!call || call.threadId !== thread.threadId || call.turnId !== turnId) return;
		return toolBridge.handleToolCall(call);
	});
	let turn;
	try {
		turn = await client.request("turn/start", buildTurnStartParams(params, {
			threadId: thread.threadId,
			cwd: effectiveWorkspace,
			appServer
		}), {
			timeoutMs: params.timeoutMs,
			signal: runAbortController.signal
		});
	} catch (error) {
		notificationCleanup();
		requestCleanup();
		params.abortSignal?.removeEventListener("abort", abortFromUpstream);
		throw error;
	}
	turnId = turn.turn.id;
	projector = new CodexAppServerEventProjector(params, thread.threadId, turnId);
	for (const notification of pendingNotifications.splice(0)) await enqueueNotification(notification);
	const activeTurnId = turnId;
	const activeProjector = projector;
	const handle = {
		kind: "embedded",
		queueMessage: async (text) => {
			await client.request("turn/steer", {
				threadId: thread.threadId,
				expectedTurnId: activeTurnId,
				input: [{
					type: "text",
					text
				}]
			});
		},
		isStreaming: () => !completed,
		isCompacting: () => projector?.isCompacting() ?? false,
		cancel: () => runAbortController.abort("cancelled"),
		abort: () => runAbortController.abort("aborted")
	};
	setActiveEmbeddedRun(params.sessionId, handle, params.sessionKey);
	const timeout = setTimeout(() => {
		timedOut = true;
		projector?.markTimedOut();
		runAbortController.abort("timeout");
	}, Math.max(100, params.timeoutMs));
	const abortListener = () => {
		interruptCodexTurnBestEffort(client, {
			threadId: thread.threadId,
			turnId: activeTurnId
		});
		resolveCompletion?.();
	};
	runAbortController.signal.addEventListener("abort", abortListener, { once: true });
	if (runAbortController.signal.aborted) abortListener();
	try {
		await completion;
		const result = activeProjector.buildResult(toolBridge.telemetry, { yieldDetected });
		await mirrorTranscriptBestEffort({
			params,
			result,
			threadId: thread.threadId,
			turnId: activeTurnId
		});
		return {
			...result,
			timedOut,
			aborted: result.aborted || runAbortController.signal.aborted,
			promptError: timedOut ? "codex app-server attempt timed out" : result.promptError,
			promptErrorSource: timedOut ? "prompt" : result.promptErrorSource
		};
	} finally {
		clearTimeout(timeout);
		notificationCleanup();
		requestCleanup();
		runAbortController.signal.removeEventListener("abort", abortListener);
		params.abortSignal?.removeEventListener("abort", abortFromUpstream);
		clearActiveEmbeddedRun(params.sessionId, handle, params.sessionKey);
	}
}
function interruptCodexTurnBestEffort(client, params) {
	Promise.resolve().then(() => client.request("turn/interrupt", params)).catch((error) => {
		log.debug("codex app-server turn interrupt failed during abort", { error });
	});
}
async function buildDynamicTools(input) {
	const { params } = input;
	if (params.disableTools || !supportsModelTools(params.model)) return [];
	const modelHasVision = params.model.input?.includes("image") ?? false;
	const agentDir = params.agentDir ?? resolveOpenClawAgentDir();
	const allTools = createOpenClawCodingTools({
		agentId: input.sessionAgentId,
		...buildEmbeddedAttemptToolRunContext(params),
		exec: {
			...params.execOverrides,
			elevated: params.bashElevated
		},
		sandbox: input.sandbox,
		messageProvider: params.messageChannel ?? params.messageProvider,
		agentAccountId: params.agentAccountId,
		messageTo: params.messageTo,
		messageThreadId: params.messageThreadId,
		groupId: params.groupId,
		groupChannel: params.groupChannel,
		groupSpace: params.groupSpace,
		spawnedBy: params.spawnedBy,
		senderId: params.senderId,
		senderName: params.senderName,
		senderUsername: params.senderUsername,
		senderE164: params.senderE164,
		senderIsOwner: params.senderIsOwner,
		allowGatewaySubagentBinding: params.allowGatewaySubagentBinding,
		sessionKey: input.sandboxSessionKey,
		sessionId: params.sessionId,
		runId: params.runId,
		agentDir,
		workspaceDir: input.effectiveWorkspace,
		spawnWorkspaceDir: resolveAttemptSpawnWorkspaceDir({
			sandbox: input.sandbox,
			resolvedWorkspace: input.resolvedWorkspace
		}),
		config: params.config,
		abortSignal: input.runAbortController.signal,
		modelProvider: params.model.provider,
		modelId: params.modelId,
		modelCompat: params.model.compat,
		modelApi: params.model.api,
		modelContextWindowTokens: params.model.contextWindow,
		modelAuthMode: resolveModelAuthMode(params.model.provider, params.config),
		currentChannelId: params.currentChannelId,
		currentThreadTs: params.currentThreadTs,
		currentMessageId: params.currentMessageId,
		replyToMode: params.replyToMode,
		hasRepliedRef: params.hasRepliedRef,
		modelHasVision,
		requireExplicitMessageTarget: params.requireExplicitMessageTarget ?? isSubagentSessionKey(params.sessionKey),
		disableMessageTool: params.disableMessageTool,
		onYield: (message) => {
			input.onYieldDetected();
			params.onAgentEvent?.({
				stream: "codex_app_server.tool",
				data: {
					name: "sessions_yield",
					message
				}
			});
			input.runAbortController.abort("sessions_yield");
		}
	});
	return normalizeProviderToolSchemas({
		tools: params.toolsAllow && params.toolsAllow.length > 0 ? allTools.filter((tool) => params.toolsAllow?.includes(tool.name)) : allTools,
		provider: params.provider,
		config: params.config,
		workspaceDir: input.effectiveWorkspace,
		env: process.env,
		modelId: params.modelId,
		modelApi: params.model.api,
		model: params.model
	});
}
async function withCodexStartupTimeout(params) {
	if (params.signal.aborted) throw new Error("codex app-server startup aborted");
	let timeout;
	let abortCleanup;
	try {
		return await Promise.race([params.operation(), new Promise((_, reject) => {
			const rejectOnce = (error) => {
				if (timeout) {
					clearTimeout(timeout);
					timeout = void 0;
				}
				reject(error);
			};
			const timeoutMs = Math.max(100, params.timeoutMs);
			timeout = setTimeout(() => {
				rejectOnce(/* @__PURE__ */ new Error("codex app-server startup timed out"));
			}, timeoutMs);
			const abortListener = () => rejectOnce(/* @__PURE__ */ new Error("codex app-server startup aborted"));
			params.signal.addEventListener("abort", abortListener, { once: true });
			abortCleanup = () => params.signal.removeEventListener("abort", abortListener);
		})]);
	} finally {
		if (timeout) clearTimeout(timeout);
		abortCleanup?.();
	}
}
function readDynamicToolCallParams(value) {
	if (!isJsonObject(value)) return;
	const threadId = readString(value, "threadId");
	const turnId = readString(value, "turnId");
	const callId = readString(value, "callId");
	const tool = readString(value, "tool");
	if (!threadId || !turnId || !callId || !tool) return;
	return {
		threadId,
		turnId,
		callId,
		tool,
		arguments: value.arguments
	};
}
function isTurnNotification(value, turnId) {
	if (!isJsonObject(value)) return false;
	if (readString(value, "turnId") === turnId) return true;
	return readString((isJsonObject(value.turn) ? value.turn : void 0) ?? {}, "id") === turnId;
}
function readString(record, key) {
	const value = record[key];
	return typeof value === "string" ? value : void 0;
}
async function mirrorTranscriptBestEffort(params) {
	try {
		await mirrorCodexAppServerTranscript({
			sessionFile: params.params.sessionFile,
			sessionKey: params.params.sessionKey,
			messages: params.result.messagesSnapshot,
			idempotencyScope: `codex-app-server:${params.threadId}:${params.turnId}`
		});
	} catch (error) {
		log.warn("failed to mirror codex app-server transcript", { error });
	}
}
function handleApprovalRequest(params) {
	return handleCodexAppServerApprovalRequest({
		method: params.method,
		requestParams: params.params,
		paramsForRun: params.paramsForRun,
		threadId: params.threadId,
		turnId: params.turnId,
		signal: params.signal
	});
}
//#endregion
//#region extensions/codex/harness.ts
const DEFAULT_CODEX_HARNESS_PROVIDER_IDS = new Set(["codex"]);
function createCodexAppServerAgentHarness(options) {
	const providerIds = new Set([...options?.providerIds ?? DEFAULT_CODEX_HARNESS_PROVIDER_IDS].map((id) => id.trim().toLowerCase()));
	return {
		id: options?.id ?? "codex",
		label: options?.label ?? "Codex agent harness",
		supports: (ctx) => {
			const provider = ctx.provider.trim().toLowerCase();
			if (providerIds.has(provider)) return {
				supported: true,
				priority: 100
			};
			return {
				supported: false,
				reason: `provider is not one of: ${[...providerIds].toSorted().join(", ")}`
			};
		},
		runAttempt: (params) => runCodexAppServerAttempt(params, { pluginConfig: options?.pluginConfig }),
		compact: (params) => maybeCompactCodexAppServerSession(params, { pluginConfig: options?.pluginConfig }),
		reset: async (params) => {
			if (params.sessionFile) await clearCodexAppServerBinding(params.sessionFile);
		},
		dispose: () => {
			clearSharedCodexAppServerClient();
		}
	};
}
//#endregion
export { CodexAppServerRpcError as a, isJsonObject as c, withTimeout as i, readCodexPluginConfig as l, listCodexAppServerModels as n, readCodexAppServerBinding as o, getSharedCodexAppServerClient as r, writeCodexAppServerBinding as s, createCodexAppServerAgentHarness as t, resolveCodexAppServerRuntimeOptions as u };
