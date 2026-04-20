import { i as formatErrorMessage } from "./errors-D8p6rxH8.js";
import { o as normalizeOptionalLowercaseString, s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { a as logWarn, t as logDebug } from "./logger-BA_TvTc6.js";
import { t as safeEqualSecret } from "./secret-equal-DqrgJW5g.js";
import { i as isLoopbackAddress } from "./net-lBInRHnX.js";
import { s as checkBrowserOrigin } from "./auth-DN1PwXy9.js";
import { a as loadConfig } from "./io-5pxHCi7V.js";
import "./config-Q9XZc_2I.js";
import { u as normalizeMessageChannel } from "./message-channel-CBqCPFa_.js";
import { i as resolveMainSessionKey } from "./main-session-DtefsIzj.js";
import "./sessions-vP2E4vs-.js";
import { a as getHeader } from "./http-utils-C26ZfE50.js";
import { t as resolveGatewayScopedTools } from "./tool-resolution-8Rm8yrsK.js";
import crypto from "node:crypto";
import { createServer } from "node:http";
//#region src/gateway/mcp-http.protocol.ts
const MCP_LOOPBACK_SERVER_NAME = "openclaw";
const MCP_LOOPBACK_SERVER_VERSION = "0.1.0";
const MCP_LOOPBACK_SUPPORTED_PROTOCOL_VERSIONS = ["2025-03-26", "2024-11-05"];
function jsonRpcResult(id, result) {
	return {
		jsonrpc: "2.0",
		id: id ?? null,
		result
	};
}
function jsonRpcError(id, code, message) {
	return {
		jsonrpc: "2.0",
		id: id ?? null,
		error: {
			code,
			message
		}
	};
}
//#endregion
//#region src/gateway/mcp-http.handlers.ts
function normalizeToolCallContent(result) {
	const content = result?.content;
	if (Array.isArray(content)) return content.map((block) => ({
		type: block.type ?? "text",
		text: block.text ?? (typeof block === "string" ? block : JSON.stringify(block))
	}));
	return [{
		type: "text",
		text: typeof result === "string" ? result : JSON.stringify(result)
	}];
}
async function handleMcpJsonRpc(params) {
	const { id, method, params: methodParams } = params.message;
	switch (method) {
		case "initialize": {
			const clientVersion = methodParams?.protocolVersion ?? "";
			return jsonRpcResult(id, {
				protocolVersion: MCP_LOOPBACK_SUPPORTED_PROTOCOL_VERSIONS.find((version) => version === clientVersion) ?? MCP_LOOPBACK_SUPPORTED_PROTOCOL_VERSIONS[0],
				capabilities: { tools: {} },
				serverInfo: {
					name: MCP_LOOPBACK_SERVER_NAME,
					version: MCP_LOOPBACK_SERVER_VERSION
				}
			});
		}
		case "notifications/initialized":
		case "notifications/cancelled": return null;
		case "tools/list": return jsonRpcResult(id, { tools: params.toolSchema });
		case "tools/call": {
			const toolName = methodParams?.name;
			const toolArgs = methodParams?.arguments ?? {};
			const tool = params.tools.find((candidate) => candidate.name === toolName);
			if (!tool) return jsonRpcResult(id, {
				content: [{
					type: "text",
					text: `Tool not available: ${toolName}`
				}],
				isError: true
			});
			const toolCallId = `mcp-${crypto.randomUUID()}`;
			try {
				return jsonRpcResult(id, {
					content: normalizeToolCallContent(await tool.execute(toolCallId, toolArgs)),
					isError: false
				});
			} catch (error) {
				return jsonRpcResult(id, {
					content: [{
						type: "text",
						text: formatErrorMessage(error) || "tool execution failed"
					}],
					isError: true
				});
			}
		}
		default: return jsonRpcError(id, -32601, `Method not found: ${method}`);
	}
}
//#endregion
//#region src/gateway/mcp-http.loopback-runtime.ts
let activeRuntime;
function getActiveMcpLoopbackRuntime() {
	return activeRuntime ? { ...activeRuntime } : void 0;
}
function setActiveMcpLoopbackRuntime(runtime) {
	activeRuntime = { ...runtime };
}
function clearActiveMcpLoopbackRuntime(token) {
	if (activeRuntime?.token === token) activeRuntime = void 0;
}
function createMcpLoopbackServerConfig(port) {
	return { mcpServers: { openclaw: {
		type: "http",
		url: `http://127.0.0.1:${port}/mcp`,
		headers: {
			Authorization: "Bearer ${OPENCLAW_MCP_TOKEN}",
			"x-session-key": "${OPENCLAW_MCP_SESSION_KEY}",
			"x-openclaw-agent-id": "${OPENCLAW_MCP_AGENT_ID}",
			"x-openclaw-account-id": "${OPENCLAW_MCP_ACCOUNT_ID}",
			"x-openclaw-message-channel": "${OPENCLAW_MCP_MESSAGE_CHANNEL}",
			"x-openclaw-sender-is-owner": "${OPENCLAW_MCP_SENDER_IS_OWNER}"
		}
	} } };
}
//#endregion
//#region src/gateway/mcp-http.request.ts
const MAX_MCP_BODY_BYTES = 1048576;
function resolveScopedSessionKey(cfg, rawSessionKey) {
	const trimmed = normalizeOptionalString(rawSessionKey);
	return !trimmed || trimmed === "main" ? resolveMainSessionKey(cfg) : trimmed;
}
function rejectsBrowserLoopbackRequest(req) {
	const origin = getHeader(req, "origin");
	if (!origin) return false;
	return !checkBrowserOrigin({
		requestHost: getHeader(req, "host"),
		origin,
		isLocalClient: isLoopbackAddress(req.socket?.remoteAddress)
	}).ok;
}
function validateMcpLoopbackRequest(params) {
	let url;
	try {
		url = new URL(params.req.url ?? "/", `http://${params.req.headers.host ?? "localhost"}`);
	} catch {
		params.res.writeHead(400, { "Content-Type": "application/json" });
		params.res.end(JSON.stringify({ error: "bad_request" }));
		return false;
	}
	if (params.req.method === "GET" && url.pathname.startsWith("/.well-known/")) {
		params.res.writeHead(404);
		params.res.end();
		return false;
	}
	if (url.pathname !== "/mcp") {
		params.res.writeHead(404, { "Content-Type": "application/json" });
		params.res.end(JSON.stringify({ error: "not_found" }));
		return false;
	}
	if (params.req.method !== "POST") {
		params.res.writeHead(405, { Allow: "POST" });
		params.res.end();
		return false;
	}
	if (rejectsBrowserLoopbackRequest(params.req)) {
		params.res.writeHead(403, { "Content-Type": "application/json" });
		params.res.end(JSON.stringify({ error: "forbidden" }));
		return false;
	}
	if (!safeEqualSecret(getHeader(params.req, "authorization") ?? "", `Bearer ${params.token}`)) {
		params.res.writeHead(401, { "Content-Type": "application/json" });
		params.res.end(JSON.stringify({ error: "unauthorized" }));
		return false;
	}
	if (!(getHeader(params.req, "content-type") ?? "").startsWith("application/json")) {
		params.res.writeHead(415, { "Content-Type": "application/json" });
		params.res.end(JSON.stringify({ error: "unsupported_media_type" }));
		return false;
	}
	return true;
}
async function readMcpHttpBody(req) {
	return await new Promise((resolve, reject) => {
		const chunks = [];
		let received = 0;
		req.on("data", (chunk) => {
			received += chunk.length;
			if (received > MAX_MCP_BODY_BYTES) {
				req.destroy();
				reject(/* @__PURE__ */ new Error(`Request body exceeds ${MAX_MCP_BODY_BYTES} bytes`));
				return;
			}
			chunks.push(chunk);
		});
		req.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
		req.on("error", reject);
	});
}
function resolveMcpRequestContext(req, cfg) {
	const senderIsOwnerRaw = normalizeOptionalLowercaseString(getHeader(req, "x-openclaw-sender-is-owner"));
	return {
		sessionKey: resolveScopedSessionKey(cfg, getHeader(req, "x-session-key")),
		messageProvider: normalizeMessageChannel(getHeader(req, "x-openclaw-message-channel")) ?? void 0,
		accountId: normalizeOptionalString(getHeader(req, "x-openclaw-account-id")),
		senderIsOwner: senderIsOwnerRaw === "true" ? true : senderIsOwnerRaw === "false" ? false : void 0
	};
}
//#endregion
//#region src/gateway/mcp-http.schema.ts
function flattenUnionSchema(raw) {
	const variants = raw.anyOf ?? raw.oneOf;
	if (!Array.isArray(variants) || variants.length === 0) return raw;
	const mergedProps = {};
	const requiredSets = [];
	for (const variant of variants) {
		const props = variant.properties;
		if (props) for (const [key, schema] of Object.entries(props)) {
			if (!(key in mergedProps)) {
				mergedProps[key] = schema;
				continue;
			}
			const existing = mergedProps[key];
			const incoming = schema;
			if (Array.isArray(existing.enum) && Array.isArray(incoming.enum)) {
				mergedProps[key] = {
					...existing,
					enum: [...new Set([...existing.enum, ...incoming.enum])]
				};
				continue;
			}
			if ("const" in existing && "const" in incoming && existing.const !== incoming.const) {
				const merged = {
					...existing,
					enum: [existing.const, incoming.const]
				};
				delete merged.const;
				mergedProps[key] = merged;
				continue;
			}
			logWarn(`mcp loopback: conflicting schema definitions for "${key}", keeping the first variant`);
		}
		requiredSets.push(new Set(Array.isArray(variant.required) ? variant.required : []));
	}
	const required = requiredSets.length > 0 ? [...requiredSets[0] ?? []].filter((key) => requiredSets.every((set) => set.has(key))) : [];
	const { anyOf: _anyOf, oneOf: _oneOf, ...rest } = raw;
	return {
		...rest,
		type: "object",
		properties: mergedProps,
		required
	};
}
function buildMcpToolSchema(tools) {
	return tools.map((tool) => {
		let raw = tool.parameters && typeof tool.parameters === "object" ? { ...tool.parameters } : {};
		if (raw.anyOf || raw.oneOf) raw = flattenUnionSchema(raw);
		if (raw.type !== "object") {
			raw.type = "object";
			if (!raw.properties) raw.properties = {};
		}
		return {
			name: tool.name,
			description: tool.description,
			inputSchema: raw
		};
	});
}
//#endregion
//#region src/gateway/mcp-http.runtime.ts
const TOOL_CACHE_TTL_MS = 3e4;
const NATIVE_TOOL_EXCLUDE = new Set([
	"read",
	"write",
	"edit",
	"apply_patch",
	"exec",
	"process"
]);
var McpLoopbackToolCache = class {
	#entries = /* @__PURE__ */ new Map();
	resolve(params) {
		const cacheKey = [
			params.sessionKey,
			params.messageProvider ?? "",
			params.accountId ?? "",
			params.senderIsOwner === true ? "owner" : params.senderIsOwner === false ? "non-owner" : ""
		].join("\0");
		const now = Date.now();
		const cached = this.#entries.get(cacheKey);
		if (cached && cached.configRef === params.cfg && now - cached.time < TOOL_CACHE_TTL_MS) return cached;
		const next = resolveGatewayScopedTools({
			cfg: params.cfg,
			sessionKey: params.sessionKey,
			messageProvider: params.messageProvider,
			accountId: params.accountId,
			senderIsOwner: params.senderIsOwner,
			surface: "loopback",
			excludeToolNames: NATIVE_TOOL_EXCLUDE
		});
		const nextEntry = {
			tools: next.tools,
			toolSchema: buildMcpToolSchema(next.tools),
			configRef: params.cfg,
			time: now
		};
		this.#entries.set(cacheKey, nextEntry);
		for (const [key, entry] of this.#entries) if (now - entry.time >= TOOL_CACHE_TTL_MS) this.#entries.delete(key);
		return nextEntry;
	}
};
//#endregion
//#region src/gateway/mcp-http.ts
let activeMcpLoopbackServer;
let activeMcpLoopbackServerPromise = null;
async function startMcpLoopbackServer(port = 0) {
	const token = crypto.randomBytes(32).toString("hex");
	const toolCache = new McpLoopbackToolCache();
	const httpServer = createServer((req, res) => {
		if (!validateMcpLoopbackRequest({
			req,
			res,
			token
		})) return;
		(async () => {
			try {
				const body = await readMcpHttpBody(req);
				const parsed = JSON.parse(body);
				const cfg = loadConfig();
				const requestContext = resolveMcpRequestContext(req, cfg);
				const scopedTools = toolCache.resolve({
					cfg,
					sessionKey: requestContext.sessionKey,
					messageProvider: requestContext.messageProvider,
					accountId: requestContext.accountId,
					senderIsOwner: requestContext.senderIsOwner
				});
				const messages = Array.isArray(parsed) ? parsed : [parsed];
				const responses = [];
				for (const message of messages) {
					const response = await handleMcpJsonRpc({
						message,
						tools: scopedTools.tools,
						toolSchema: scopedTools.toolSchema
					});
					if (response !== null) responses.push(response);
				}
				if (responses.length === 0) {
					res.writeHead(202);
					res.end();
					return;
				}
				const payload = Array.isArray(parsed) ? JSON.stringify(responses) : JSON.stringify(responses[0]);
				res.writeHead(200, { "Content-Type": "application/json" });
				res.end(payload);
			} catch (error) {
				logWarn(`mcp loopback: request handling failed: ${formatErrorMessage(error)}`);
				if (!res.headersSent) {
					res.writeHead(400, { "Content-Type": "application/json" });
					res.end(JSON.stringify(jsonRpcError(null, -32700, "Parse error")));
				}
			}
		})();
	});
	await new Promise((resolve, reject) => {
		httpServer.once("error", reject);
		httpServer.listen(port, "127.0.0.1", () => {
			httpServer.removeListener("error", reject);
			resolve();
		});
	});
	const address = httpServer.address();
	if (!address || typeof address === "string") throw new Error("mcp loopback did not bind to a TCP port");
	setActiveMcpLoopbackRuntime({
		port: address.port,
		token
	});
	logDebug(`mcp loopback listening on 127.0.0.1:${address.port}`);
	const server = {
		port: address.port,
		close: () => new Promise((resolve, reject) => {
			httpServer.close((error) => {
				if (!error) {
					clearActiveMcpLoopbackRuntime(token);
					if (activeMcpLoopbackServer === server) activeMcpLoopbackServer = void 0;
				}
				if (error) {
					reject(error);
					return;
				}
				resolve();
			});
		})
	};
	return server;
}
async function ensureMcpLoopbackServer(port = 0) {
	if (activeMcpLoopbackServer) return activeMcpLoopbackServer;
	if (!activeMcpLoopbackServerPromise) activeMcpLoopbackServerPromise = startMcpLoopbackServer(port).then((server) => {
		activeMcpLoopbackServer = server;
		return server;
	}).finally(() => {
		activeMcpLoopbackServerPromise = null;
	});
	return activeMcpLoopbackServerPromise;
}
async function closeMcpLoopbackServer() {
	const server = activeMcpLoopbackServer ?? (activeMcpLoopbackServerPromise ? await activeMcpLoopbackServerPromise : void 0);
	if (!server) return;
	activeMcpLoopbackServer = void 0;
	await server.close();
}
//#endregion
export { getActiveMcpLoopbackRuntime as i, ensureMcpLoopbackServer as n, createMcpLoopbackServerConfig as r, closeMcpLoopbackServer as t };
