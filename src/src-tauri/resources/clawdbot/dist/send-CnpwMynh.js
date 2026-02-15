import { t as __exportAll } from "./rolldown-runtime-Cbj13DAv.js";
import { m as normalizeE164, y as resolveUserPath } from "./utils-q1rHOG-N.js";
import { i as loadConfig } from "./config-BJWIHf6x.js";
import { _ as resolveMarkdownTableMode, t as loadWebMedia } from "./media-EWF5qDpT.js";
import { t as convertMarkdownTables } from "./tables-DuWEJJJ_.js";
import { S as mediaKindFromMime } from "./image-ops-BuOO2fiP.js";
import { r as saveMediaBuffer } from "./store-C2n2K571.js";
import { t as resolveIMessageAccount } from "./accounts-DEEdVs21.js";
import { spawn } from "node:child_process";
import { createInterface } from "node:readline";

//#region src/imessage/constants.ts
/** Default timeout for iMessage probe/RPC operations (10 seconds). */
const DEFAULT_IMESSAGE_PROBE_TIMEOUT_MS = 1e4;

//#endregion
//#region src/imessage/client.ts
function isTestEnv() {
	const vitest = process.env.VITEST?.trim().toLowerCase();
	return Boolean(vitest);
}
var IMessageRpcClient = class {
	constructor(opts = {}) {
		this.pending = /* @__PURE__ */ new Map();
		this.closedResolve = null;
		this.child = null;
		this.reader = null;
		this.nextId = 1;
		this.cliPath = opts.cliPath?.trim() || "imsg";
		this.dbPath = opts.dbPath?.trim() ? resolveUserPath(opts.dbPath) : void 0;
		this.runtime = opts.runtime;
		this.onNotification = opts.onNotification;
		this.closed = new Promise((resolve) => {
			this.closedResolve = resolve;
		});
	}
	async start() {
		if (this.child) return;
		if (isTestEnv()) throw new Error("Refusing to start imsg rpc in test environment; mock iMessage RPC client");
		const args = ["rpc"];
		if (this.dbPath) args.push("--db", this.dbPath);
		const child = spawn(this.cliPath, args, { stdio: [
			"pipe",
			"pipe",
			"pipe"
		] });
		this.child = child;
		this.reader = createInterface({ input: child.stdout });
		this.reader.on("line", (line) => {
			const trimmed = line.trim();
			if (!trimmed) return;
			this.handleLine(trimmed);
		});
		child.stderr?.on("data", (chunk) => {
			const lines = chunk.toString().split(/\r?\n/);
			for (const line of lines) {
				if (!line.trim()) continue;
				this.runtime?.error?.(`imsg rpc: ${line.trim()}`);
			}
		});
		child.on("error", (err) => {
			this.failAll(err instanceof Error ? err : new Error(String(err)));
			this.closedResolve?.();
		});
		child.on("close", (code, signal) => {
			if (code !== 0 && code !== null) {
				const reason = signal ? `signal ${signal}` : `code ${code}`;
				this.failAll(/* @__PURE__ */ new Error(`imsg rpc exited (${reason})`));
			} else this.failAll(/* @__PURE__ */ new Error("imsg rpc closed"));
			this.closedResolve?.();
		});
	}
	async stop() {
		if (!this.child) return;
		this.reader?.close();
		this.reader = null;
		this.child.stdin?.end();
		const child = this.child;
		this.child = null;
		await Promise.race([this.closed, new Promise((resolve) => {
			setTimeout(() => {
				if (!child.killed) child.kill("SIGTERM");
				resolve();
			}, 500);
		})]);
	}
	async waitForClose() {
		await this.closed;
	}
	async request(method, params, opts) {
		if (!this.child || !this.child.stdin) throw new Error("imsg rpc not running");
		const id = this.nextId++;
		const payload = {
			jsonrpc: "2.0",
			id,
			method,
			params: params ?? {}
		};
		const line = `${JSON.stringify(payload)}\n`;
		const timeoutMs = opts?.timeoutMs ?? DEFAULT_IMESSAGE_PROBE_TIMEOUT_MS;
		const response = new Promise((resolve, reject) => {
			const key = String(id);
			const timer = timeoutMs > 0 ? setTimeout(() => {
				this.pending.delete(key);
				reject(/* @__PURE__ */ new Error(`imsg rpc timeout (${method})`));
			}, timeoutMs) : void 0;
			this.pending.set(key, {
				resolve: (value) => resolve(value),
				reject,
				timer
			});
		});
		this.child.stdin.write(line);
		return await response;
	}
	handleLine(line) {
		let parsed;
		try {
			parsed = JSON.parse(line);
		} catch (err) {
			const detail = err instanceof Error ? err.message : String(err);
			this.runtime?.error?.(`imsg rpc: failed to parse ${line}: ${detail}`);
			return;
		}
		if (parsed.id !== void 0 && parsed.id !== null) {
			const key = String(parsed.id);
			const pending = this.pending.get(key);
			if (!pending) return;
			if (pending.timer) clearTimeout(pending.timer);
			this.pending.delete(key);
			if (parsed.error) {
				const baseMessage = parsed.error.message ?? "imsg rpc error";
				const details = parsed.error.data;
				const code = parsed.error.code;
				const suffixes = [];
				if (typeof code === "number") suffixes.push(`code=${code}`);
				if (details !== void 0) {
					const detailText = typeof details === "string" ? details : JSON.stringify(details, null, 2);
					if (detailText) suffixes.push(detailText);
				}
				const msg = suffixes.length > 0 ? `${baseMessage}: ${suffixes.join(" ")}` : baseMessage;
				pending.reject(new Error(msg));
				return;
			}
			pending.resolve(parsed.result);
			return;
		}
		if (parsed.method) this.onNotification?.({
			method: parsed.method,
			params: parsed.params
		});
	}
	failAll(err) {
		for (const [key, pending] of this.pending.entries()) {
			if (pending.timer) clearTimeout(pending.timer);
			pending.reject(err);
			this.pending.delete(key);
		}
	}
};
async function createIMessageRpcClient(opts = {}) {
	const client = new IMessageRpcClient(opts);
	await client.start();
	return client;
}

//#endregion
//#region src/imessage/targets.ts
const CHAT_ID_PREFIXES = [
	"chat_id:",
	"chatid:",
	"chat:"
];
const CHAT_GUID_PREFIXES = [
	"chat_guid:",
	"chatguid:",
	"guid:"
];
const CHAT_IDENTIFIER_PREFIXES = [
	"chat_identifier:",
	"chatidentifier:",
	"chatident:"
];
const SERVICE_PREFIXES = [
	{
		prefix: "imessage:",
		service: "imessage"
	},
	{
		prefix: "sms:",
		service: "sms"
	},
	{
		prefix: "auto:",
		service: "auto"
	}
];
function stripPrefix(value, prefix) {
	return value.slice(prefix.length).trim();
}
function normalizeIMessageHandle(raw) {
	const trimmed = raw.trim();
	if (!trimmed) return "";
	const lowered = trimmed.toLowerCase();
	if (lowered.startsWith("imessage:")) return normalizeIMessageHandle(trimmed.slice(9));
	if (lowered.startsWith("sms:")) return normalizeIMessageHandle(trimmed.slice(4));
	if (lowered.startsWith("auto:")) return normalizeIMessageHandle(trimmed.slice(5));
	for (const prefix of CHAT_ID_PREFIXES) if (lowered.startsWith(prefix)) return `chat_id:${trimmed.slice(prefix.length).trim()}`;
	for (const prefix of CHAT_GUID_PREFIXES) if (lowered.startsWith(prefix)) return `chat_guid:${trimmed.slice(prefix.length).trim()}`;
	for (const prefix of CHAT_IDENTIFIER_PREFIXES) if (lowered.startsWith(prefix)) return `chat_identifier:${trimmed.slice(prefix.length).trim()}`;
	if (trimmed.includes("@")) return trimmed.toLowerCase();
	const normalized = normalizeE164(trimmed);
	if (normalized) return normalized;
	return trimmed.replace(/\s+/g, "");
}
function parseIMessageTarget(raw) {
	const trimmed = raw.trim();
	if (!trimmed) throw new Error("iMessage target is required");
	const lower = trimmed.toLowerCase();
	for (const { prefix, service } of SERVICE_PREFIXES) if (lower.startsWith(prefix)) {
		const remainder = stripPrefix(trimmed, prefix);
		if (!remainder) throw new Error(`${prefix} target is required`);
		const remainderLower = remainder.toLowerCase();
		if (CHAT_ID_PREFIXES.some((p) => remainderLower.startsWith(p)) || CHAT_GUID_PREFIXES.some((p) => remainderLower.startsWith(p)) || CHAT_IDENTIFIER_PREFIXES.some((p) => remainderLower.startsWith(p))) return parseIMessageTarget(remainder);
		return {
			kind: "handle",
			to: remainder,
			service
		};
	}
	for (const prefix of CHAT_ID_PREFIXES) if (lower.startsWith(prefix)) {
		const value = stripPrefix(trimmed, prefix);
		const chatId = Number.parseInt(value, 10);
		if (!Number.isFinite(chatId)) throw new Error(`Invalid chat_id: ${value}`);
		return {
			kind: "chat_id",
			chatId
		};
	}
	for (const prefix of CHAT_GUID_PREFIXES) if (lower.startsWith(prefix)) {
		const value = stripPrefix(trimmed, prefix);
		if (!value) throw new Error("chat_guid is required");
		return {
			kind: "chat_guid",
			chatGuid: value
		};
	}
	for (const prefix of CHAT_IDENTIFIER_PREFIXES) if (lower.startsWith(prefix)) {
		const value = stripPrefix(trimmed, prefix);
		if (!value) throw new Error("chat_identifier is required");
		return {
			kind: "chat_identifier",
			chatIdentifier: value
		};
	}
	return {
		kind: "handle",
		to: trimmed,
		service: "auto"
	};
}
function parseIMessageAllowTarget(raw) {
	const trimmed = raw.trim();
	if (!trimmed) return {
		kind: "handle",
		handle: ""
	};
	const lower = trimmed.toLowerCase();
	for (const { prefix } of SERVICE_PREFIXES) if (lower.startsWith(prefix)) {
		const remainder = stripPrefix(trimmed, prefix);
		if (!remainder) return {
			kind: "handle",
			handle: ""
		};
		return parseIMessageAllowTarget(remainder);
	}
	for (const prefix of CHAT_ID_PREFIXES) if (lower.startsWith(prefix)) {
		const value = stripPrefix(trimmed, prefix);
		const chatId = Number.parseInt(value, 10);
		if (Number.isFinite(chatId)) return {
			kind: "chat_id",
			chatId
		};
	}
	for (const prefix of CHAT_GUID_PREFIXES) if (lower.startsWith(prefix)) {
		const value = stripPrefix(trimmed, prefix);
		if (value) return {
			kind: "chat_guid",
			chatGuid: value
		};
	}
	for (const prefix of CHAT_IDENTIFIER_PREFIXES) if (lower.startsWith(prefix)) {
		const value = stripPrefix(trimmed, prefix);
		if (value) return {
			kind: "chat_identifier",
			chatIdentifier: value
		};
	}
	return {
		kind: "handle",
		handle: normalizeIMessageHandle(trimmed)
	};
}
function isAllowedIMessageSender(params) {
	const allowFrom = params.allowFrom.map((entry) => String(entry).trim());
	if (allowFrom.length === 0) return true;
	if (allowFrom.includes("*")) return true;
	const senderNormalized = normalizeIMessageHandle(params.sender);
	const chatId = params.chatId ?? void 0;
	const chatGuid = params.chatGuid?.trim();
	const chatIdentifier = params.chatIdentifier?.trim();
	for (const entry of allowFrom) {
		if (!entry) continue;
		const parsed = parseIMessageAllowTarget(entry);
		if (parsed.kind === "chat_id" && chatId !== void 0) {
			if (parsed.chatId === chatId) return true;
		} else if (parsed.kind === "chat_guid" && chatGuid) {
			if (parsed.chatGuid === chatGuid) return true;
		} else if (parsed.kind === "chat_identifier" && chatIdentifier) {
			if (parsed.chatIdentifier === chatIdentifier) return true;
		} else if (parsed.kind === "handle" && senderNormalized) {
			if (parsed.handle === senderNormalized) return true;
		}
	}
	return false;
}
function formatIMessageChatTarget(chatId) {
	if (!chatId || !Number.isFinite(chatId)) return "";
	return `chat_id:${chatId}`;
}

//#endregion
//#region src/imessage/send.ts
var send_exports = /* @__PURE__ */ __exportAll({ sendMessageIMessage: () => sendMessageIMessage });
function resolveMessageId(result) {
	if (!result) return null;
	const raw = typeof result.messageId === "string" && result.messageId.trim() || typeof result.message_id === "string" && result.message_id.trim() || typeof result.id === "string" && result.id.trim() || typeof result.guid === "string" && result.guid.trim() || (typeof result.message_id === "number" ? String(result.message_id) : null) || (typeof result.id === "number" ? String(result.id) : null);
	return raw ? String(raw).trim() : null;
}
async function resolveAttachment(mediaUrl, maxBytes) {
	const media = await loadWebMedia(mediaUrl, maxBytes);
	const saved = await saveMediaBuffer(media.buffer, media.contentType ?? void 0, "outbound", maxBytes);
	return {
		path: saved.path,
		contentType: saved.contentType
	};
}
async function sendMessageIMessage(to, text, opts = {}) {
	const cfg = opts.config ?? loadConfig();
	const account = opts.account ?? resolveIMessageAccount({
		cfg,
		accountId: opts.accountId
	});
	const cliPath = opts.cliPath?.trim() || account.config.cliPath?.trim() || "imsg";
	const dbPath = opts.dbPath?.trim() || account.config.dbPath?.trim();
	const target = parseIMessageTarget(opts.chatId ? formatIMessageChatTarget(opts.chatId) : to);
	const service = opts.service ?? (target.kind === "handle" ? target.service : void 0) ?? account.config.service;
	const region = opts.region?.trim() || account.config.region?.trim() || "US";
	const maxBytes = typeof opts.maxBytes === "number" ? opts.maxBytes : typeof account.config.mediaMaxMb === "number" ? account.config.mediaMaxMb * 1024 * 1024 : 16 * 1024 * 1024;
	let message = text ?? "";
	let filePath;
	if (opts.mediaUrl?.trim()) {
		const resolved = await (opts.resolveAttachmentImpl ?? resolveAttachment)(opts.mediaUrl.trim(), maxBytes);
		filePath = resolved.path;
		if (!message.trim()) {
			const kind = mediaKindFromMime(resolved.contentType ?? void 0);
			if (kind) message = kind === "image" ? "<media:image>" : `<media:${kind}>`;
		}
	}
	if (!message.trim() && !filePath) throw new Error("iMessage send requires text or media");
	if (message.trim()) {
		const tableMode = resolveMarkdownTableMode({
			cfg,
			channel: "imessage",
			accountId: account.accountId
		});
		message = convertMarkdownTables(message, tableMode);
	}
	const params = {
		text: message,
		service: service || "auto",
		region
	};
	if (filePath) params.file = filePath;
	if (target.kind === "chat_id") params.chat_id = target.chatId;
	else if (target.kind === "chat_guid") params.chat_guid = target.chatGuid;
	else if (target.kind === "chat_identifier") params.chat_identifier = target.chatIdentifier;
	else params.to = target.to;
	const client = opts.client ?? (opts.createClient ? await opts.createClient({
		cliPath,
		dbPath
	}) : await createIMessageRpcClient({
		cliPath,
		dbPath
	}));
	const shouldClose = !opts.client;
	try {
		const result = await client.request("send", params, { timeoutMs: opts.timeoutMs });
		return { messageId: resolveMessageId(result) ?? (result?.ok ? "ok" : "unknown") };
	} finally {
		if (shouldClose) await client.stop();
	}
}

//#endregion
export { normalizeIMessageHandle as a, DEFAULT_IMESSAGE_PROBE_TIMEOUT_MS as c, isAllowedIMessageSender as i, send_exports as n, parseIMessageTarget as o, formatIMessageChatTarget as r, createIMessageRpcClient as s, sendMessageIMessage as t };