import { t as __exportAll } from "./rolldown-runtime-CiIaOW0V.js";
import { i as resolveCodexAppServerRuntimeOptions, t as codexAppServerStartOptionsKey } from "./config-BqDfPmSH.js";
import { n as isRpcResponse } from "./protocol-C9UWI98H.js";
import { OPENCLAW_VERSION, embeddedAgentLog } from "openclaw/plugin-sdk/agent-harness-runtime";
import { createInterface } from "node:readline";
import { spawn } from "node:child_process";
import { materializeWindowsSpawnProgram, resolveWindowsSpawnProgram } from "openclaw/plugin-sdk/windows-spawn";
import { EventEmitter } from "node:events";
import { PassThrough, Writable } from "node:stream";
import WebSocket from "ws";
import { resolveOpenClawAgentDir as resolveOpenClawAgentDir$1 } from "openclaw/plugin-sdk/provider-auth";
import { ensureAuthProfileStore, loadAuthProfileStoreForSecretsRuntime, resolveApiKeyForProfile, resolveProviderIdForAuth, saveAuthProfileStore } from "openclaw/plugin-sdk/agent-runtime";
//#region extensions/codex/src/app-server/transport-stdio.ts
const DEFAULT_SPAWN_RUNTIME = {
	platform: process.platform,
	env: process.env,
	execPath: process.execPath
};
function resolveCodexAppServerSpawnInvocation(options, runtime = DEFAULT_SPAWN_RUNTIME) {
	const resolved = materializeWindowsSpawnProgram(resolveWindowsSpawnProgram({
		command: options.command,
		platform: runtime.platform,
		env: runtime.env,
		execPath: runtime.execPath,
		packageName: "@openai/codex"
	}), options.args);
	return {
		command: resolved.command,
		args: resolved.argv,
		shell: resolved.shell,
		windowsHide: resolved.windowsHide
	};
}
function createStdioTransport(options) {
	const env = {
		...process.env,
		...options.env
	};
	for (const key of options.clearEnv ?? []) delete env[key];
	const invocation = resolveCodexAppServerSpawnInvocation(options, {
		platform: process.platform,
		env,
		execPath: process.execPath
	});
	return spawn(invocation.command, invocation.args, {
		env,
		detached: process.platform !== "win32",
		shell: invocation.shell,
		stdio: [
			"pipe",
			"pipe",
			"pipe"
		],
		windowsHide: invocation.windowsHide
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
const CODEX_APP_SERVER_PARSE_LOG_MAX = 500;
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
			if (text) embeddedAgentLog.debug(`codex app-server stderr: ${text}`);
		});
		child.once("error", (error) => this.closeWithError(error instanceof Error ? error : new Error(String(error))));
		child.once("exit", (code, signal) => {
			this.closeWithError(/* @__PURE__ */ new Error(`codex app-server exited: code=${formatExitValue(code)} signal=${formatExitValue(signal)}`));
		});
		child.stdin.on?.("error", (error) => this.closeWithError(error instanceof Error ? error : new Error(String(error))));
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
				version: OPENCLAW_VERSION
			},
			capabilities: { experimentalApi: true }
		}));
		this.notify("initialized");
		this.initialized = true;
	}
	request(method, params, options) {
		options ??= {};
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
		if (this.closed) return;
		this.child.stdin.write(`${JSON.stringify(message)}\n`);
	}
	handleLine(line) {
		const trimmed = line.trim();
		if (!trimmed) return;
		let parsed;
		try {
			parsed = JSON.parse(trimmed);
		} catch (error) {
			embeddedAgentLog.warn("failed to parse codex app-server message", {
				error,
				linePreview: redactCodexAppServerLinePreview(trimmed)
			});
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
			embeddedAgentLog.warn("codex app-server notification handler failed", { error });
		});
	}
	closeWithError(error) {
		if (this.closed) return;
		this.closed = true;
		this.lines.close();
		this.rejectPendingRequests(error);
		closeCodexAppServerTransport(this.child);
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
function redactCodexAppServerLinePreview(value) {
	const redacted = value.replace(/\s+/g, " ").trim().replace(/(Bearer\s+)[A-Za-z0-9._~+/-]+/gi, "$1<redacted>").replace(/("(?:api_?key|authorization|token|access_token|refresh_token)"\s*:\s*")([^"]+)(")/gi, "$1<redacted>$3");
	return redacted.length > CODEX_APP_SERVER_PARSE_LOG_MAX ? `${redacted.slice(0, CODEX_APP_SERVER_PARSE_LOG_MAX)}...` : redacted;
}
const CODEX_APP_SERVER_APPROVAL_REQUEST_METHODS = new Set([
	"item/commandExecution/requestApproval",
	"item/fileChange/requestApproval",
	"item/permissions/requestApproval"
]);
function isCodexAppServerApprovalRequest(method) {
	return CODEX_APP_SERVER_APPROVAL_REQUEST_METHODS.has(method);
}
function formatExitValue(value) {
	if (value === null || value === void 0) return "null";
	if (typeof value === "string" || typeof value === "number") return String(value);
	return "unknown";
}
//#endregion
//#region extensions/codex/src/app-server/auth-bridge.ts
const CODEX_APP_SERVER_AUTH_PROVIDER = "openai-codex";
async function bridgeCodexAppServerStartOptions(params) {
	params.agentDir;
	params.authProfileId;
	return params.startOptions;
}
async function applyCodexAppServerAuthProfile(params) {
	const loginParams = await resolveCodexAppServerAuthProfileLoginParams({
		agentDir: params.agentDir,
		authProfileId: params.authProfileId
	});
	if (!loginParams) return;
	await params.client.request("account/login/start", loginParams);
}
function resolveCodexAppServerAuthProfileLoginParams(params) {
	return resolveCodexAppServerAuthProfileLoginParamsInternal(params);
}
async function refreshCodexAppServerAuthTokens(params) {
	const loginParams = await resolveCodexAppServerAuthProfileLoginParamsInternal({
		...params,
		forceOAuthRefresh: true
	});
	if (!loginParams || loginParams.type !== "chatgptAuthTokens") throw new Error("Codex app-server ChatGPT token refresh requires an OAuth auth profile.");
	return {
		accessToken: loginParams.accessToken,
		chatgptAccountId: loginParams.chatgptAccountId,
		chatgptPlanType: loginParams.chatgptPlanType ?? null
	};
}
async function resolveCodexAppServerAuthProfileLoginParamsInternal(params) {
	const profileId = params.authProfileId?.trim();
	if (!profileId) return;
	const credential = ensureAuthProfileStore(params.agentDir, { allowKeychainPrompt: false }).profiles[profileId];
	if (!credential) throw new Error(`Codex app-server auth profile "${profileId}" was not found.`);
	if (!isCodexAppServerAuthProvider(credential.provider)) throw new Error(`Codex app-server auth profile "${profileId}" must belong to provider "openai-codex" or a supported alias.`);
	const loginParams = await resolveLoginParamsForCredential(profileId, credential, {
		agentDir: params.agentDir,
		forceOAuthRefresh: params.forceOAuthRefresh === true
	});
	if (!loginParams) throw new Error(`Codex app-server auth profile "${profileId}" does not contain usable credentials.`);
	return loginParams;
}
async function resolveLoginParamsForCredential(profileId, credential, params) {
	if (credential.type === "api_key") {
		const apiKey = (await resolveApiKeyForProfile({
			store: ensureAuthProfileStore(params.agentDir, { allowKeychainPrompt: false }),
			profileId,
			agentDir: params.agentDir
		}))?.apiKey?.trim();
		return apiKey ? {
			type: "apiKey",
			apiKey
		} : void 0;
	}
	if (credential.type === "token") {
		const accessToken = (await resolveApiKeyForProfile({
			store: ensureAuthProfileStore(params.agentDir, { allowKeychainPrompt: false }),
			profileId,
			agentDir: params.agentDir
		}))?.apiKey?.trim();
		return accessToken ? buildChatgptAuthTokensParams(profileId, credential, accessToken) : void 0;
	}
	const resolvedCredential = await resolveOAuthCredentialForCodexAppServer(profileId, credential, {
		agentDir: params.agentDir,
		forceRefresh: params.forceOAuthRefresh
	});
	const accessToken = resolvedCredential.access?.trim();
	return accessToken ? buildChatgptAuthTokensParams(profileId, resolvedCredential, accessToken) : void 0;
}
async function resolveOAuthCredentialForCodexAppServer(profileId, credential, params) {
	const store = ensureAuthProfileStore(params.agentDir, { allowKeychainPrompt: false });
	if (params.forceRefresh) {
		store.profiles[profileId] = {
			...credential,
			expires: 0
		};
		saveAuthProfileStore(store, params.agentDir);
	}
	const resolved = await resolveApiKeyForProfile({
		store,
		profileId,
		agentDir: params.agentDir
	});
	const refreshed = loadAuthProfileStoreForSecretsRuntime(params.agentDir).profiles[profileId];
	const storedCredential = store.profiles[profileId];
	const candidate = refreshed?.type === "oauth" && isCodexAppServerAuthProvider(refreshed.provider) ? refreshed : storedCredential?.type === "oauth" && isCodexAppServerAuthProvider(storedCredential.provider) ? storedCredential : credential;
	return resolved?.apiKey ? {
		...candidate,
		access: resolved.apiKey
	} : candidate;
}
function isCodexAppServerAuthProvider(provider) {
	return resolveProviderIdForAuth(provider) === CODEX_APP_SERVER_AUTH_PROVIDER;
}
function buildChatgptAuthTokensParams(profileId, credential, accessToken) {
	return {
		type: "chatgptAuthTokens",
		accessToken,
		chatgptAccountId: resolveChatgptAccountId(profileId, credential),
		chatgptPlanType: resolveChatgptPlanType(credential)
	};
}
function resolveChatgptPlanType(credential) {
	const record = credential;
	const planType = record.chatgptPlanType ?? record.planType;
	return typeof planType === "string" && planType.trim() ? planType.trim() : null;
}
function resolveChatgptAccountId(profileId, credential) {
	if ("accountId" in credential && typeof credential.accountId === "string") {
		const accountId = credential.accountId.trim();
		if (accountId) return accountId;
	}
	return credential.email?.trim() || profileId;
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
var shared_client_exports = /* @__PURE__ */ __exportAll({
	clearSharedCodexAppServerClient: () => clearSharedCodexAppServerClient,
	createIsolatedCodexAppServerClient: () => createIsolatedCodexAppServerClient,
	getSharedCodexAppServerClient: () => getSharedCodexAppServerClient
});
const SHARED_CODEX_APP_SERVER_CLIENT_STATE = Symbol.for("openclaw.codexAppServerClientState");
function getSharedCodexAppServerClientState() {
	const globalState = globalThis;
	globalState[SHARED_CODEX_APP_SERVER_CLIENT_STATE] ??= {};
	return globalState[SHARED_CODEX_APP_SERVER_CLIENT_STATE];
}
async function getSharedCodexAppServerClient(options) {
	const state = getSharedCodexAppServerClientState();
	const startOptions = await bridgeCodexAppServerStartOptions({
		startOptions: options?.startOptions ?? resolveCodexAppServerRuntimeOptions().start,
		agentDir: resolveOpenClawAgentDir$1(),
		authProfileId: options?.authProfileId
	});
	const key = codexAppServerStartOptionsKey(startOptions, { authProfileId: options?.authProfileId });
	if (state.key && state.key !== key) clearSharedCodexAppServerClient();
	state.key = key;
	const sharedPromise = state.promise ?? (state.promise = (async () => {
		const client = CodexAppServerClient.start(startOptions);
		state.client = client;
		client.addCloseHandler(clearSharedClientIfCurrent);
		try {
			await client.initialize();
			await applyCodexAppServerAuthProfile({
				client,
				agentDir: resolveOpenClawAgentDir$1(),
				authProfileId: options?.authProfileId
			});
			return client;
		} catch (error) {
			client.close();
			throw error;
		}
	})());
	try {
		return await withTimeout(sharedPromise, options?.timeoutMs ?? 0, "codex app-server initialize timed out");
	} catch (error) {
		if (state.promise === sharedPromise && state.key === key) clearSharedCodexAppServerClient();
		throw error;
	}
}
async function createIsolatedCodexAppServerClient(options) {
	const startOptions = await bridgeCodexAppServerStartOptions({
		startOptions: options?.startOptions ?? resolveCodexAppServerRuntimeOptions().start,
		agentDir: resolveOpenClawAgentDir$1(),
		authProfileId: options?.authProfileId
	});
	const client = CodexAppServerClient.start(startOptions);
	const initialize = client.initialize();
	try {
		await withTimeout(initialize, options?.timeoutMs ?? 0, "codex app-server initialize timed out");
		await applyCodexAppServerAuthProfile({
			client,
			agentDir: resolveOpenClawAgentDir$1(),
			authProfileId: options?.authProfileId
		});
		return client;
	} catch (error) {
		client.close();
		initialize.catch(() => void 0);
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
export { refreshCodexAppServerAuthTokens as a, withTimeout as i, getSharedCodexAppServerClient as n, CodexAppServerRpcError as o, shared_client_exports as r, isCodexAppServerApprovalRequest as s, clearSharedCodexAppServerClient as t };
