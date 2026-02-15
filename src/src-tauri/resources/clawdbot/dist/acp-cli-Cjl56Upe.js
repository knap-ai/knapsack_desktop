import { M as theme, h as defaultRuntime } from "./entry.js";
import "./auth-profiles-DnpV8DWM.js";
import "./utils-q1rHOG-N.js";
import "./exec-B52LZOrO.js";
import "./agent-scope-Bu62UIQZ.js";
import "./github-copilot-token-C4G0wDDt.js";
import { F as VERSION, i as loadConfig } from "./config-BJWIHf6x.js";
import "./manifest-registry-DlFh5LWe.js";
import { h as GATEWAY_CLIENT_NAMES, m as GATEWAY_CLIENT_MODES } from "./message-channel-D-iPIX3C.js";
import { i as resolveGatewayAuth } from "./auth-DaQXd14b.js";
import { t as GatewayClient } from "./client-DV6vI7ic.js";
import { t as buildGatewayConnectionDetails } from "./call-FZUZ5EU4.js";
import { t as formatDocsLink } from "./links-C_tOT2wV.js";
import { t as ensureOpenClawCliOnPath } from "./path-env-C8edjgRD.js";
import { t as isMainModule } from "./is-main-DBdQqy8V.js";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import * as readline$1 from "node:readline";
import { Readable, Writable } from "node:stream";
import { AgentSideConnection, ClientSideConnection, PROTOCOL_VERSION, ndJsonStream } from "@agentclientprotocol/sdk";

//#region src/acp/client.ts
/**
* Tools that require explicit user approval in ACP sessions.
* These tools can execute arbitrary code, modify the filesystem,
* or access sensitive resources.
*/
const DANGEROUS_ACP_TOOLS = new Set([
	"exec",
	"spawn",
	"shell",
	"sessions_spawn",
	"sessions_send",
	"gateway",
	"fs_write",
	"fs_delete",
	"fs_move",
	"apply_patch"
]);
function asRecord(value) {
	return value && typeof value === "object" && !Array.isArray(value) ? value : void 0;
}
function readFirstStringValue(source, keys) {
	if (!source) return;
	for (const key of keys) {
		const value = source[key];
		if (typeof value === "string" && value.trim()) return value.trim();
	}
}
function normalizeToolName(value) {
	const normalized = value.trim().toLowerCase();
	if (!normalized) return;
	return normalized;
}
function parseToolNameFromTitle(title) {
	if (!title) return;
	const head = title.split(":", 1)[0]?.trim();
	if (!head || !/^[a-zA-Z0-9._-]+$/.test(head)) return;
	return normalizeToolName(head);
}
function resolveToolNameForPermission(params) {
	const toolCall = params.toolCall;
	const toolMeta = asRecord(toolCall?._meta);
	const rawInput = asRecord(toolCall?.rawInput);
	const fromMeta = readFirstStringValue(toolMeta, [
		"toolName",
		"tool_name",
		"name"
	]);
	const fromRawInput = readFirstStringValue(rawInput, [
		"tool",
		"toolName",
		"tool_name",
		"name"
	]);
	const fromTitle = parseToolNameFromTitle(toolCall?.title);
	return normalizeToolName(fromMeta ?? fromRawInput ?? fromTitle ?? "");
}
function pickOption(options, kinds) {
	for (const kind of kinds) {
		const match = options.find((option) => option.kind === kind);
		if (match) return match;
	}
}
function selectedPermission(optionId) {
	return { outcome: {
		outcome: "selected",
		optionId
	} };
}
function cancelledPermission() {
	return { outcome: { outcome: "cancelled" } };
}
function promptUserPermission(toolName, toolTitle) {
	if (!process.stdin.isTTY || !process.stderr.isTTY) {
		console.error(`[permission denied] ${toolName ?? "unknown"}: non-interactive terminal`);
		return Promise.resolve(false);
	}
	return new Promise((resolve) => {
		let settled = false;
		const rl = readline$1.createInterface({
			input: process.stdin,
			output: process.stderr
		});
		const finish = (approved) => {
			if (settled) return;
			settled = true;
			clearTimeout(timeout);
			rl.close();
			resolve(approved);
		};
		const timeout = setTimeout(() => {
			console.error(`\n[permission timeout] denied: ${toolName ?? "unknown"}`);
			finish(false);
		}, 3e4);
		const label = toolTitle ? toolName ? `${toolTitle} (${toolName})` : toolTitle : toolName ?? "unknown tool";
		rl.question(`\n[permission] Allow "${label}"? (y/N) `, (answer) => {
			const approved = answer.trim().toLowerCase() === "y";
			console.error(`[permission ${approved ? "approved" : "denied"}] ${toolName ?? "unknown"}`);
			finish(approved);
		});
	});
}
async function resolvePermissionRequest(params, deps = {}) {
	const log = deps.log ?? ((line) => console.error(line));
	const prompt = deps.prompt ?? promptUserPermission;
	const options = params.options ?? [];
	const toolTitle = params.toolCall?.title ?? "tool";
	const toolName = resolveToolNameForPermission(params);
	if (options.length === 0) {
		log(`[permission cancelled] ${toolName ?? "unknown"}: no options available`);
		return cancelledPermission();
	}
	const allowOption = pickOption(options, ["allow_once", "allow_always"]);
	const rejectOption = pickOption(options, ["reject_once", "reject_always"]);
	if (!(!toolName || DANGEROUS_ACP_TOOLS.has(toolName))) {
		const option = allowOption ?? options[0];
		if (!option) {
			log(`[permission cancelled] ${toolName}: no selectable options`);
			return cancelledPermission();
		}
		log(`[permission auto-approved] ${toolName}`);
		return selectedPermission(option.optionId);
	}
	log(`\n[permission requested] ${toolTitle}${toolName ? ` (${toolName})` : ""}`);
	const approved = await prompt(toolName, toolTitle);
	if (approved && allowOption) return selectedPermission(allowOption.optionId);
	if (!approved && rejectOption) return selectedPermission(rejectOption.optionId);
	log(`[permission cancelled] ${toolName ?? "unknown"}: missing ${approved ? "allow" : "reject"} option`);
	return cancelledPermission();
}
function toArgs(value) {
	if (!value) return [];
	return Array.isArray(value) ? value : [value];
}
function buildServerArgs(opts) {
	const args = ["acp", ...toArgs(opts.serverArgs)];
	if (opts.serverVerbose && !args.includes("--verbose") && !args.includes("-v")) args.push("--verbose");
	return args;
}
function printSessionUpdate(notification) {
	const update = notification.update;
	if (!("sessionUpdate" in update)) return;
	switch (update.sessionUpdate) {
		case "agent_message_chunk":
			if (update.content?.type === "text") process.stdout.write(update.content.text);
			return;
		case "tool_call":
			console.log(`\n[tool] ${update.title} (${update.status})`);
			return;
		case "tool_call_update":
			if (update.status) console.log(`[tool update] ${update.toolCallId}: ${update.status}`);
			return;
		case "available_commands_update": {
			const names = update.availableCommands?.map((cmd) => `/${cmd.name}`).join(" ");
			if (names) console.log(`\n[commands] ${names}`);
			return;
		}
		default: return;
	}
}
async function createAcpClient(opts = {}) {
	const cwd = opts.cwd ?? process.cwd();
	const log = Boolean(opts.verbose) ? (msg) => console.error(`[acp-client] ${msg}`) : () => {};
	ensureOpenClawCliOnPath({ cwd });
	const serverCommand = opts.serverCommand ?? "openclaw";
	const serverArgs = buildServerArgs(opts);
	log(`spawning: ${serverCommand} ${serverArgs.join(" ")}`);
	const agent = spawn(serverCommand, serverArgs, {
		stdio: [
			"pipe",
			"pipe",
			"inherit"
		],
		cwd
	});
	if (!agent.stdin || !agent.stdout) throw new Error("Failed to create ACP stdio pipes");
	const client = new ClientSideConnection(() => ({
		sessionUpdate: async (params) => {
			printSessionUpdate(params);
		},
		requestPermission: async (params) => {
			return resolvePermissionRequest(params);
		}
	}), ndJsonStream(Writable.toWeb(agent.stdin), Readable.toWeb(agent.stdout)));
	log("initializing");
	await client.initialize({
		protocolVersion: PROTOCOL_VERSION,
		clientCapabilities: {
			fs: {
				readTextFile: true,
				writeTextFile: true
			},
			terminal: true
		},
		clientInfo: {
			name: "openclaw-acp-client",
			version: "1.0.0"
		}
	});
	log("creating session");
	return {
		client,
		agent,
		sessionId: (await client.newSession({
			cwd,
			mcpServers: []
		})).sessionId
	};
}
async function runAcpClientInteractive(opts = {}) {
	const { client, agent, sessionId } = await createAcpClient(opts);
	const rl = readline$1.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	console.log("OpenClaw ACP client");
	console.log(`Session: ${sessionId}`);
	console.log("Type a prompt, or \"exit\" to quit.\n");
	const prompt = () => {
		rl.question("> ", async (input) => {
			const text = input.trim();
			if (!text) {
				prompt();
				return;
			}
			if (text === "exit" || text === "quit") {
				agent.kill();
				rl.close();
				process.exit(0);
			}
			try {
				const response = await client.prompt({
					sessionId,
					prompt: [{
						type: "text",
						text
					}]
				});
				console.log(`\n[${response.stopReason}]\n`);
			} catch (err) {
				console.error(`\n[error] ${String(err)}\n`);
			}
			prompt();
		});
	};
	prompt();
	agent.on("exit", (code) => {
		console.log(`\nAgent exited with code ${code ?? 0}`);
		rl.close();
		process.exit(code ?? 0);
	});
}

//#endregion
//#region src/acp/commands.ts
function getAvailableCommands() {
	return [
		{
			name: "help",
			description: "Show help and common commands."
		},
		{
			name: "commands",
			description: "List available commands."
		},
		{
			name: "status",
			description: "Show current status."
		},
		{
			name: "context",
			description: "Explain context usage (list|detail|json).",
			input: { hint: "list | detail | json" }
		},
		{
			name: "whoami",
			description: "Show sender id (alias: /id)."
		},
		{
			name: "id",
			description: "Alias for /whoami."
		},
		{
			name: "subagents",
			description: "List or manage sub-agents."
		},
		{
			name: "config",
			description: "Read or write config (owner-only)."
		},
		{
			name: "debug",
			description: "Set runtime-only overrides (owner-only)."
		},
		{
			name: "usage",
			description: "Toggle usage footer (off|tokens|full)."
		},
		{
			name: "stop",
			description: "Stop the current run."
		},
		{
			name: "restart",
			description: "Restart the gateway (if enabled)."
		},
		{
			name: "dock-telegram",
			description: "Route replies to Telegram."
		},
		{
			name: "dock-discord",
			description: "Route replies to Discord."
		},
		{
			name: "dock-slack",
			description: "Route replies to Slack."
		},
		{
			name: "activation",
			description: "Set group activation (mention|always)."
		},
		{
			name: "send",
			description: "Set send mode (on|off|inherit)."
		},
		{
			name: "reset",
			description: "Reset the session (/new)."
		},
		{
			name: "new",
			description: "Reset the session (/reset)."
		},
		{
			name: "think",
			description: "Set thinking level (off|minimal|low|medium|high|xhigh)."
		},
		{
			name: "verbose",
			description: "Set verbose mode (on|full|off)."
		},
		{
			name: "reasoning",
			description: "Toggle reasoning output (on|off|stream)."
		},
		{
			name: "elevated",
			description: "Toggle elevated mode (on|off)."
		},
		{
			name: "model",
			description: "Select a model (list|status|<name>)."
		},
		{
			name: "queue",
			description: "Adjust queue mode and options."
		},
		{
			name: "bash",
			description: "Run a host command (if enabled)."
		},
		{
			name: "compact",
			description: "Compact the session history."
		}
	];
}

//#endregion
//#region src/acp/event-mapper.ts
function extractTextFromPrompt(prompt) {
	const parts = [];
	for (const block of prompt) {
		if (block.type === "text") {
			parts.push(block.text);
			continue;
		}
		if (block.type === "resource") {
			const resource = block.resource;
			if (resource?.text) parts.push(resource.text);
			continue;
		}
		if (block.type === "resource_link") {
			const title = block.title ? ` (${block.title})` : "";
			const uri = block.uri ?? "";
			const line = uri ? `[Resource link${title}] ${uri}` : `[Resource link${title}]`;
			parts.push(line);
		}
	}
	return parts.join("\n");
}
function extractAttachmentsFromPrompt(prompt) {
	const attachments = [];
	for (const block of prompt) {
		if (block.type !== "image") continue;
		const image = block;
		if (!image.data || !image.mimeType) continue;
		attachments.push({
			type: "image",
			mimeType: image.mimeType,
			content: image.data
		});
	}
	return attachments;
}
function formatToolTitle(name, args) {
	const base = name ?? "tool";
	if (!args || Object.keys(args).length === 0) return base;
	return `${base}: ${Object.entries(args).map(([key, value]) => {
		const raw = typeof value === "string" ? value : JSON.stringify(value);
		return `${key}: ${raw.length > 100 ? `${raw.slice(0, 100)}...` : raw}`;
	}).join(", ")}`;
}
function inferToolKind(name) {
	if (!name) return "other";
	const normalized = name.toLowerCase();
	if (normalized.includes("read")) return "read";
	if (normalized.includes("write") || normalized.includes("edit")) return "edit";
	if (normalized.includes("delete") || normalized.includes("remove")) return "delete";
	if (normalized.includes("move") || normalized.includes("rename")) return "move";
	if (normalized.includes("search") || normalized.includes("find")) return "search";
	if (normalized.includes("exec") || normalized.includes("run") || normalized.includes("bash")) return "execute";
	if (normalized.includes("fetch") || normalized.includes("http")) return "fetch";
	return "other";
}

//#endregion
//#region src/acp/meta.ts
function readString(meta, keys) {
	if (!meta) return;
	for (const key of keys) {
		const value = meta[key];
		if (typeof value === "string" && value.trim()) return value.trim();
	}
}
function readBool(meta, keys) {
	if (!meta) return;
	for (const key of keys) {
		const value = meta[key];
		if (typeof value === "boolean") return value;
	}
}
function readNumber(meta, keys) {
	if (!meta) return;
	for (const key of keys) {
		const value = meta[key];
		if (typeof value === "number" && Number.isFinite(value)) return value;
	}
}

//#endregion
//#region src/acp/session-mapper.ts
function parseSessionMeta(meta) {
	if (!meta || typeof meta !== "object") return {};
	const record = meta;
	return {
		sessionKey: readString(record, [
			"sessionKey",
			"session",
			"key"
		]),
		sessionLabel: readString(record, ["sessionLabel", "label"]),
		resetSession: readBool(record, ["resetSession", "reset"]),
		requireExisting: readBool(record, ["requireExistingSession", "requireExisting"]),
		prefixCwd: readBool(record, ["prefixCwd"])
	};
}
async function resolveSessionKey(params) {
	const requestedLabel = params.meta.sessionLabel ?? params.opts.defaultSessionLabel;
	const requestedKey = params.meta.sessionKey ?? params.opts.defaultSessionKey;
	const requireExisting = params.meta.requireExisting ?? params.opts.requireExistingSession ?? false;
	if (params.meta.sessionLabel) {
		const resolved = await params.gateway.request("sessions.resolve", { label: params.meta.sessionLabel });
		if (!resolved?.key) throw new Error(`Unable to resolve session label: ${params.meta.sessionLabel}`);
		return resolved.key;
	}
	if (params.meta.sessionKey) {
		if (!requireExisting) return params.meta.sessionKey;
		const resolved = await params.gateway.request("sessions.resolve", { key: params.meta.sessionKey });
		if (!resolved?.key) throw new Error(`Session key not found: ${params.meta.sessionKey}`);
		return resolved.key;
	}
	if (requestedLabel) {
		const resolved = await params.gateway.request("sessions.resolve", { label: requestedLabel });
		if (!resolved?.key) throw new Error(`Unable to resolve session label: ${requestedLabel}`);
		return resolved.key;
	}
	if (requestedKey) {
		if (!requireExisting) return requestedKey;
		const resolved = await params.gateway.request("sessions.resolve", { key: requestedKey });
		if (!resolved?.key) throw new Error(`Session key not found: ${requestedKey}`);
		return resolved.key;
	}
	return params.fallbackKey;
}
async function resetSessionIfNeeded(params) {
	if (!(params.meta.resetSession ?? params.opts.resetSession ?? false)) return;
	await params.gateway.request("sessions.reset", { key: params.sessionKey });
}

//#endregion
//#region src/acp/session.ts
function createInMemorySessionStore() {
	const sessions = /* @__PURE__ */ new Map();
	const runIdToSessionId = /* @__PURE__ */ new Map();
	const createSession = (params) => {
		const sessionId = params.sessionId ?? randomUUID();
		const session = {
			sessionId,
			sessionKey: params.sessionKey,
			cwd: params.cwd,
			createdAt: Date.now(),
			abortController: null,
			activeRunId: null
		};
		sessions.set(sessionId, session);
		return session;
	};
	const getSession = (sessionId) => sessions.get(sessionId);
	const getSessionByRunId = (runId) => {
		const sessionId = runIdToSessionId.get(runId);
		return sessionId ? sessions.get(sessionId) : void 0;
	};
	const setActiveRun = (sessionId, runId, abortController) => {
		const session = sessions.get(sessionId);
		if (!session) return;
		session.activeRunId = runId;
		session.abortController = abortController;
		runIdToSessionId.set(runId, sessionId);
	};
	const clearActiveRun = (sessionId) => {
		const session = sessions.get(sessionId);
		if (!session) return;
		if (session.activeRunId) runIdToSessionId.delete(session.activeRunId);
		session.activeRunId = null;
		session.abortController = null;
	};
	const cancelActiveRun = (sessionId) => {
		const session = sessions.get(sessionId);
		if (!session?.abortController) return false;
		session.abortController.abort();
		if (session.activeRunId) runIdToSessionId.delete(session.activeRunId);
		session.abortController = null;
		session.activeRunId = null;
		return true;
	};
	const clearAllSessionsForTest = () => {
		for (const session of sessions.values()) session.abortController?.abort();
		sessions.clear();
		runIdToSessionId.clear();
	};
	return {
		createSession,
		getSession,
		getSessionByRunId,
		setActiveRun,
		clearActiveRun,
		cancelActiveRun,
		clearAllSessionsForTest
	};
}
const defaultAcpSessionStore = createInMemorySessionStore();

//#endregion
//#region src/acp/types.ts
const ACP_AGENT_INFO = {
	name: "openclaw-acp",
	title: "OpenClaw ACP Gateway",
	version: VERSION
};

//#endregion
//#region src/acp/translator.ts
var AcpGatewayAgent = class {
	constructor(connection, gateway, opts = {}) {
		this.pendingPrompts = /* @__PURE__ */ new Map();
		this.connection = connection;
		this.gateway = gateway;
		this.opts = opts;
		this.log = opts.verbose ? (msg) => process.stderr.write(`[acp] ${msg}\n`) : () => {};
		this.sessionStore = opts.sessionStore ?? defaultAcpSessionStore;
	}
	start() {
		this.log("ready");
	}
	handleGatewayReconnect() {
		this.log("gateway reconnected");
	}
	handleGatewayDisconnect(reason) {
		this.log(`gateway disconnected: ${reason}`);
		for (const pending of this.pendingPrompts.values()) {
			pending.reject(/* @__PURE__ */ new Error(`Gateway disconnected: ${reason}`));
			this.sessionStore.clearActiveRun(pending.sessionId);
		}
		this.pendingPrompts.clear();
	}
	async handleGatewayEvent(evt) {
		if (evt.event === "chat") {
			await this.handleChatEvent(evt);
			return;
		}
		if (evt.event === "agent") await this.handleAgentEvent(evt);
	}
	async initialize(_params) {
		return {
			protocolVersion: PROTOCOL_VERSION,
			agentCapabilities: {
				loadSession: true,
				promptCapabilities: {
					image: true,
					audio: false,
					embeddedContext: true
				},
				mcpCapabilities: {
					http: false,
					sse: false
				},
				sessionCapabilities: { list: {} }
			},
			agentInfo: ACP_AGENT_INFO,
			authMethods: []
		};
	}
	async newSession(params) {
		if (params.mcpServers.length > 0) this.log(`ignoring ${params.mcpServers.length} MCP servers`);
		const sessionId = randomUUID();
		const meta = parseSessionMeta(params._meta);
		const sessionKey = await resolveSessionKey({
			meta,
			fallbackKey: `acp:${sessionId}`,
			gateway: this.gateway,
			opts: this.opts
		});
		await resetSessionIfNeeded({
			meta,
			sessionKey,
			gateway: this.gateway,
			opts: this.opts
		});
		const session = this.sessionStore.createSession({
			sessionId,
			sessionKey,
			cwd: params.cwd
		});
		this.log(`newSession: ${session.sessionId} -> ${session.sessionKey}`);
		await this.sendAvailableCommands(session.sessionId);
		return { sessionId: session.sessionId };
	}
	async loadSession(params) {
		if (params.mcpServers.length > 0) this.log(`ignoring ${params.mcpServers.length} MCP servers`);
		const meta = parseSessionMeta(params._meta);
		const sessionKey = await resolveSessionKey({
			meta,
			fallbackKey: params.sessionId,
			gateway: this.gateway,
			opts: this.opts
		});
		await resetSessionIfNeeded({
			meta,
			sessionKey,
			gateway: this.gateway,
			opts: this.opts
		});
		const session = this.sessionStore.createSession({
			sessionId: params.sessionId,
			sessionKey,
			cwd: params.cwd
		});
		this.log(`loadSession: ${session.sessionId} -> ${session.sessionKey}`);
		await this.sendAvailableCommands(session.sessionId);
		return {};
	}
	async unstable_listSessions(params) {
		const limit = readNumber(params._meta, ["limit"]) ?? 100;
		const result = await this.gateway.request("sessions.list", { limit });
		const cwd = params.cwd ?? process.cwd();
		return {
			sessions: result.sessions.map((session) => ({
				sessionId: session.key,
				cwd,
				title: session.displayName ?? session.label ?? session.key,
				updatedAt: session.updatedAt ? new Date(session.updatedAt).toISOString() : void 0,
				_meta: {
					sessionKey: session.key,
					kind: session.kind,
					channel: session.channel
				}
			})),
			nextCursor: null
		};
	}
	async authenticate(_params) {
		return {};
	}
	async setSessionMode(params) {
		const session = this.sessionStore.getSession(params.sessionId);
		if (!session) throw new Error(`Session ${params.sessionId} not found`);
		if (!params.modeId) return {};
		try {
			await this.gateway.request("sessions.patch", {
				key: session.sessionKey,
				thinkingLevel: params.modeId
			});
			this.log(`setSessionMode: ${session.sessionId} -> ${params.modeId}`);
		} catch (err) {
			this.log(`setSessionMode error: ${String(err)}`);
		}
		return {};
	}
	async prompt(params) {
		const session = this.sessionStore.getSession(params.sessionId);
		if (!session) throw new Error(`Session ${params.sessionId} not found`);
		if (session.abortController) this.sessionStore.cancelActiveRun(params.sessionId);
		const abortController = new AbortController();
		const runId = randomUUID();
		this.sessionStore.setActiveRun(params.sessionId, runId, abortController);
		const meta = parseSessionMeta(params._meta);
		const userText = extractTextFromPrompt(params.prompt);
		const attachments = extractAttachmentsFromPrompt(params.prompt);
		const message = meta.prefixCwd ?? this.opts.prefixCwd ?? true ? `[Working directory: ${session.cwd}]\n\n${userText}` : userText;
		return new Promise((resolve, reject) => {
			this.pendingPrompts.set(params.sessionId, {
				sessionId: params.sessionId,
				sessionKey: session.sessionKey,
				idempotencyKey: runId,
				resolve,
				reject
			});
			this.gateway.request("chat.send", {
				sessionKey: session.sessionKey,
				message,
				attachments: attachments.length > 0 ? attachments : void 0,
				idempotencyKey: runId,
				thinking: readString(params._meta, ["thinking", "thinkingLevel"]),
				deliver: readBool(params._meta, ["deliver"]),
				timeoutMs: readNumber(params._meta, ["timeoutMs"])
			}, { expectFinal: true }).catch((err) => {
				this.pendingPrompts.delete(params.sessionId);
				this.sessionStore.clearActiveRun(params.sessionId);
				reject(err instanceof Error ? err : new Error(String(err)));
			});
		});
	}
	async cancel(params) {
		const session = this.sessionStore.getSession(params.sessionId);
		if (!session) return;
		this.sessionStore.cancelActiveRun(params.sessionId);
		try {
			await this.gateway.request("chat.abort", { sessionKey: session.sessionKey });
		} catch (err) {
			this.log(`cancel error: ${String(err)}`);
		}
		const pending = this.pendingPrompts.get(params.sessionId);
		if (pending) {
			this.pendingPrompts.delete(params.sessionId);
			pending.resolve({ stopReason: "cancelled" });
		}
	}
	async handleAgentEvent(evt) {
		const payload = evt.payload;
		if (!payload) return;
		const stream = payload.stream;
		const data = payload.data;
		const sessionKey = payload.sessionKey;
		if (!stream || !data || !sessionKey) return;
		if (stream !== "tool") return;
		const phase = data.phase;
		const name = data.name;
		const toolCallId = data.toolCallId;
		if (!toolCallId) return;
		const pending = this.findPendingBySessionKey(sessionKey);
		if (!pending) return;
		if (phase === "start") {
			if (!pending.toolCalls) pending.toolCalls = /* @__PURE__ */ new Set();
			if (pending.toolCalls.has(toolCallId)) return;
			pending.toolCalls.add(toolCallId);
			const args = data.args;
			await this.connection.sessionUpdate({
				sessionId: pending.sessionId,
				update: {
					sessionUpdate: "tool_call",
					toolCallId,
					title: formatToolTitle(name, args),
					status: "in_progress",
					rawInput: args,
					kind: inferToolKind(name)
				}
			});
			return;
		}
		if (phase === "result") {
			const isError = Boolean(data.isError);
			await this.connection.sessionUpdate({
				sessionId: pending.sessionId,
				update: {
					sessionUpdate: "tool_call_update",
					toolCallId,
					status: isError ? "failed" : "completed",
					rawOutput: data.result
				}
			});
		}
	}
	async handleChatEvent(evt) {
		const payload = evt.payload;
		if (!payload) return;
		const sessionKey = payload.sessionKey;
		const state = payload.state;
		const runId = payload.runId;
		const messageData = payload.message;
		if (!sessionKey || !state) return;
		const pending = this.findPendingBySessionKey(sessionKey);
		if (!pending) return;
		if (runId && pending.idempotencyKey !== runId) return;
		if (state === "delta" && messageData) {
			await this.handleDeltaEvent(pending.sessionId, messageData);
			return;
		}
		if (state === "final") {
			this.finishPrompt(pending.sessionId, pending, "end_turn");
			return;
		}
		if (state === "aborted") {
			this.finishPrompt(pending.sessionId, pending, "cancelled");
			return;
		}
		if (state === "error") this.finishPrompt(pending.sessionId, pending, "refusal");
	}
	async handleDeltaEvent(sessionId, messageData) {
		const fullText = messageData.content?.find((c) => c.type === "text")?.text ?? "";
		const pending = this.pendingPrompts.get(sessionId);
		if (!pending) return;
		const sentSoFar = pending.sentTextLength ?? 0;
		if (fullText.length <= sentSoFar) return;
		const newText = fullText.slice(sentSoFar);
		pending.sentTextLength = fullText.length;
		pending.sentText = fullText;
		await this.connection.sessionUpdate({
			sessionId,
			update: {
				sessionUpdate: "agent_message_chunk",
				content: {
					type: "text",
					text: newText
				}
			}
		});
	}
	finishPrompt(sessionId, pending, stopReason) {
		this.pendingPrompts.delete(sessionId);
		this.sessionStore.clearActiveRun(sessionId);
		pending.resolve({ stopReason });
	}
	findPendingBySessionKey(sessionKey) {
		for (const pending of this.pendingPrompts.values()) if (pending.sessionKey === sessionKey) return pending;
	}
	async sendAvailableCommands(sessionId) {
		await this.connection.sessionUpdate({
			sessionId,
			update: {
				sessionUpdate: "available_commands_update",
				availableCommands: getAvailableCommands()
			}
		});
	}
};

//#endregion
//#region src/acp/server.ts
function serveAcpGateway(opts = {}) {
	const cfg = loadConfig();
	const connection = buildGatewayConnectionDetails({
		config: cfg,
		url: opts.gatewayUrl
	});
	const isRemoteMode = cfg.gateway?.mode === "remote";
	const remote = isRemoteMode ? cfg.gateway?.remote : void 0;
	const auth = resolveGatewayAuth({
		authConfig: cfg.gateway?.auth,
		env: process.env
	});
	const token = opts.gatewayToken ?? (isRemoteMode ? remote?.token?.trim() : void 0) ?? process.env.OPENCLAW_GATEWAY_TOKEN ?? auth.token;
	const password = opts.gatewayPassword ?? (isRemoteMode ? remote?.password?.trim() : void 0) ?? process.env.OPENCLAW_GATEWAY_PASSWORD ?? auth.password;
	let agent = null;
	let onClosed;
	const closed = new Promise((resolve) => {
		onClosed = resolve;
	});
	let stopped = false;
	const gateway = new GatewayClient({
		url: connection.url,
		token: token || void 0,
		password: password || void 0,
		clientName: GATEWAY_CLIENT_NAMES.CLI,
		clientDisplayName: "ACP",
		clientVersion: "acp",
		mode: GATEWAY_CLIENT_MODES.CLI,
		onEvent: (evt) => {
			agent?.handleGatewayEvent(evt);
		},
		onHelloOk: () => {
			agent?.handleGatewayReconnect();
		},
		onClose: (code, reason) => {
			agent?.handleGatewayDisconnect(`${code}: ${reason}`);
			if (stopped) onClosed();
		}
	});
	const shutdown = () => {
		if (stopped) return;
		stopped = true;
		gateway.stop();
		onClosed();
	};
	process.once("SIGINT", shutdown);
	process.once("SIGTERM", shutdown);
	new AgentSideConnection((conn) => {
		agent = new AcpGatewayAgent(conn, gateway, opts);
		agent.start();
		return agent;
	}, ndJsonStream(Writable.toWeb(process.stdout), Readable.toWeb(process.stdin)));
	gateway.start();
	return closed;
}
function parseArgs(args) {
	const opts = {};
	for (let i = 0; i < args.length; i += 1) {
		const arg = args[i];
		if (arg === "--url" || arg === "--gateway-url") {
			opts.gatewayUrl = args[i + 1];
			i += 1;
			continue;
		}
		if (arg === "--token" || arg === "--gateway-token") {
			opts.gatewayToken = args[i + 1];
			i += 1;
			continue;
		}
		if (arg === "--password" || arg === "--gateway-password") {
			opts.gatewayPassword = args[i + 1];
			i += 1;
			continue;
		}
		if (arg === "--session") {
			opts.defaultSessionKey = args[i + 1];
			i += 1;
			continue;
		}
		if (arg === "--session-label") {
			opts.defaultSessionLabel = args[i + 1];
			i += 1;
			continue;
		}
		if (arg === "--require-existing") {
			opts.requireExistingSession = true;
			continue;
		}
		if (arg === "--reset-session") {
			opts.resetSession = true;
			continue;
		}
		if (arg === "--no-prefix-cwd") {
			opts.prefixCwd = false;
			continue;
		}
		if (arg === "--verbose" || arg === "-v") {
			opts.verbose = true;
			continue;
		}
		if (arg === "--help" || arg === "-h") {
			printHelp();
			process.exit(0);
		}
	}
	return opts;
}
function printHelp() {
	console.log(`Usage: openclaw acp [options]

Gateway-backed ACP server for IDE integration.

Options:
  --url <url>             Gateway WebSocket URL
  --token <token>         Gateway auth token
  --password <password>   Gateway auth password
  --session <key>         Default session key (e.g. "agent:main:main")
  --session-label <label> Default session label to resolve
  --require-existing      Fail if the session key/label does not exist
  --reset-session         Reset the session key before first use
  --no-prefix-cwd         Do not prefix prompts with the working directory
  --verbose, -v           Verbose logging to stderr
  --help, -h              Show this help message
`);
}
if (isMainModule({ currentFile: fileURLToPath(import.meta.url) })) serveAcpGateway(parseArgs(process.argv.slice(2))).catch((err) => {
	console.error(String(err));
	process.exit(1);
});

//#endregion
//#region src/cli/acp-cli.ts
function registerAcpCli(program) {
	const acp = program.command("acp").description("Run an ACP bridge backed by the Gateway");
	acp.option("--url <url>", "Gateway WebSocket URL (defaults to gateway.remote.url when configured)").option("--token <token>", "Gateway token (if required)").option("--password <password>", "Gateway password (if required)").option("--session <key>", "Default session key (e.g. agent:main:main)").option("--session-label <label>", "Default session label to resolve").option("--require-existing", "Fail if the session key/label does not exist", false).option("--reset-session", "Reset the session key before first use", false).option("--no-prefix-cwd", "Do not prefix prompts with the working directory", false).option("--verbose, -v", "Verbose logging to stderr", false).addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/acp", "docs.openclaw.ai/cli/acp")}\n`).action(async (opts) => {
		try {
			await serveAcpGateway({
				gatewayUrl: opts.url,
				gatewayToken: opts.token,
				gatewayPassword: opts.password,
				defaultSessionKey: opts.session,
				defaultSessionLabel: opts.sessionLabel,
				requireExistingSession: Boolean(opts.requireExisting),
				resetSession: Boolean(opts.resetSession),
				prefixCwd: !opts.noPrefixCwd,
				verbose: Boolean(opts.verbose)
			});
		} catch (err) {
			defaultRuntime.error(String(err));
			defaultRuntime.exit(1);
		}
	});
	acp.command("client").description("Run an interactive ACP client against the local ACP bridge").option("--cwd <dir>", "Working directory for the ACP session").option("--server <command>", "ACP server command (default: openclaw)").option("--server-args <args...>", "Extra arguments for the ACP server").option("--server-verbose", "Enable verbose logging on the ACP server", false).option("--verbose, -v", "Verbose client logging", false).action(async (opts) => {
		try {
			await runAcpClientInteractive({
				cwd: opts.cwd,
				serverCommand: opts.server,
				serverArgs: opts.serverArgs,
				serverVerbose: Boolean(opts.serverVerbose),
				verbose: Boolean(opts.verbose)
			});
		} catch (err) {
			defaultRuntime.error(String(err));
			defaultRuntime.exit(1);
		}
	});
}

//#endregion
export { registerAcpCli };