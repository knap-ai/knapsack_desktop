import { u as resolveGatewayPort } from "./paths-CD8i0MSg.js";
import { c as loadConfig } from "./io-DhtVmzAJ.js";
import "./config-CJQx-9zo.js";
import { d as trimToUndefined, r as resolveGatewayCredentialsFromConfig } from "./credentials-DyjdApQe.js";
import { _ as GATEWAY_CLIENT_NAMES, g as GATEWAY_CLIENT_MODES } from "./message-channel-D19EDm2g.js";
import { u as resolveLeastPrivilegeOperatorScopesForMethod } from "./method-scopes-DNlWj6m4.js";
import { r as callGateway } from "./call-CQ0eH9Ew.js";
import { h as readStringParam } from "./common-RGbDbB5n.js";
import { i as parsePairingList, n as resolveNodeIdFromNodeList, r as parseNodeList, t as resolveNodeFromNodeList } from "./node-resolve-CbG10E1V.js";
//#region src/agents/tools/gateway.ts
function readGatewayCallOptions(params) {
	return {
		gatewayUrl: readStringParam(params, "gatewayUrl", { trim: false }),
		gatewayToken: readStringParam(params, "gatewayToken", { trim: false }),
		timeoutMs: typeof params.timeoutMs === "number" ? params.timeoutMs : void 0
	};
}
function canonicalizeToolGatewayWsUrl(raw) {
	const input = raw.trim();
	let url;
	try {
		url = new URL(input);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		throw new Error(`invalid gatewayUrl: ${input} (${message})`, { cause: error });
	}
	if (url.protocol !== "ws:" && url.protocol !== "wss:") throw new Error(`invalid gatewayUrl protocol: ${url.protocol} (expected ws:// or wss://)`);
	if (url.username || url.password) throw new Error("invalid gatewayUrl: credentials are not allowed");
	if (url.search || url.hash) throw new Error("invalid gatewayUrl: query/hash not allowed");
	if (url.pathname && url.pathname !== "/") throw new Error("invalid gatewayUrl: path not allowed");
	return {
		origin: url.origin,
		key: `${url.protocol}//${url.host.toLowerCase()}`
	};
}
function validateGatewayUrlOverrideForAgentTools(params) {
	const { cfg } = params;
	const port = resolveGatewayPort(cfg);
	const localAllowed = new Set([
		`ws://127.0.0.1:${port}`,
		`wss://127.0.0.1:${port}`,
		`ws://localhost:${port}`,
		`wss://localhost:${port}`,
		`ws://[::1]:${port}`,
		`wss://[::1]:${port}`
	]);
	let remoteKey;
	const remoteUrl = typeof cfg.gateway?.remote?.url === "string" ? cfg.gateway.remote.url.trim() : "";
	if (remoteUrl) try {
		remoteKey = canonicalizeToolGatewayWsUrl(remoteUrl).key;
	} catch {}
	const parsed = canonicalizeToolGatewayWsUrl(params.urlOverride);
	if (localAllowed.has(parsed.key)) return {
		url: parsed.origin,
		target: "local"
	};
	if (remoteKey && parsed.key === remoteKey) return {
		url: parsed.origin,
		target: "remote"
	};
	throw new Error([
		"gatewayUrl override rejected.",
		`Allowed: ws(s) loopback on port ${port} (127.0.0.1/localhost/[::1])`,
		"Or: configure gateway.remote.url and omit gatewayUrl to use the configured remote gateway."
	].join(" "));
}
function resolveGatewayOverrideToken(params) {
	if (params.explicitToken) return params.explicitToken;
	return resolveGatewayCredentialsFromConfig({
		cfg: params.cfg,
		env: process.env,
		modeOverride: params.target,
		remoteTokenFallback: params.target === "remote" ? "remote-only" : "remote-env-local",
		remotePasswordFallback: params.target === "remote" ? "remote-only" : "remote-env-local"
	}).token;
}
function resolveGatewayOptions(opts) {
	const cfg = loadConfig();
	const validatedOverride = trimToUndefined(opts?.gatewayUrl) !== void 0 ? validateGatewayUrlOverrideForAgentTools({
		cfg,
		urlOverride: String(opts?.gatewayUrl)
	}) : void 0;
	const explicitToken = trimToUndefined(opts?.gatewayToken);
	const token = validatedOverride ? resolveGatewayOverrideToken({
		cfg,
		target: validatedOverride.target,
		explicitToken
	}) : explicitToken;
	const timeoutMs = typeof opts?.timeoutMs === "number" && Number.isFinite(opts.timeoutMs) ? Math.max(1, Math.floor(opts.timeoutMs)) : 3e4;
	return {
		url: validatedOverride?.url,
		token,
		timeoutMs
	};
}
async function callGatewayTool(method, opts, params, extra) {
	const gateway = resolveGatewayOptions(opts);
	const scopes = Array.isArray(extra?.scopes) ? extra.scopes : resolveLeastPrivilegeOperatorScopesForMethod(method);
	return await callGateway({
		url: gateway.url,
		token: gateway.token,
		method,
		params,
		timeoutMs: gateway.timeoutMs,
		expectFinal: extra?.expectFinal,
		clientName: GATEWAY_CLIENT_NAMES.GATEWAY_CLIENT,
		clientDisplayName: "agent",
		mode: GATEWAY_CLIENT_MODES.BACKEND,
		scopes
	});
}
//#endregion
//#region src/agents/tools/nodes-utils.ts
function messageFromError(error) {
	if (error instanceof Error) return error.message;
	if (typeof error === "string") return error;
	if (typeof error === "object" && error !== null && "message" in error && typeof error.message === "string") return error.message;
	if (typeof error === "object" && error !== null) try {
		return JSON.stringify(error);
	} catch {
		return "";
	}
	return "";
}
function shouldFallbackToPairList(error) {
	const message = messageFromError(error).toLowerCase();
	if (!message.includes("node.list")) return false;
	return message.includes("unknown method") || message.includes("method not found") || message.includes("not implemented") || message.includes("unsupported");
}
async function loadNodes(opts) {
	try {
		return parseNodeList(await callGatewayTool("node.list", opts, {}));
	} catch (error) {
		if (!shouldFallbackToPairList(error)) throw error;
		const { paired } = parsePairingList(await callGatewayTool("node.pair.list", opts, {}));
		return paired.map((n) => ({
			nodeId: n.nodeId,
			displayName: n.displayName,
			platform: n.platform,
			remoteIp: n.remoteIp
		}));
	}
}
function isLocalMacNode(node) {
	return node.platform?.toLowerCase().startsWith("mac") === true && typeof node.nodeId === "string" && node.nodeId.startsWith("mac-");
}
function compareDefaultNodeOrder(a, b) {
	const aConnectedAt = Number.isFinite(a.connectedAtMs) ? a.connectedAtMs ?? 0 : -1;
	const bConnectedAt = Number.isFinite(b.connectedAtMs) ? b.connectedAtMs ?? 0 : -1;
	if (aConnectedAt !== bConnectedAt) return bConnectedAt - aConnectedAt;
	return a.nodeId.localeCompare(b.nodeId);
}
function selectDefaultNodeFromList(nodes, options = {}) {
	const capability = options.capability?.trim();
	const withCapability = capability ? nodes.filter((n) => Array.isArray(n.caps) ? n.caps.includes(capability) : true) : nodes;
	if (withCapability.length === 0) return null;
	const connected = withCapability.filter((n) => n.connected);
	const candidates = connected.length > 0 ? connected : withCapability;
	if (candidates.length === 1) return candidates[0];
	if (options.preferLocalMac ?? true) {
		const local = candidates.filter(isLocalMacNode);
		if (local.length === 1) return local[0];
	}
	if ((options.fallback ?? "none") === "none") return null;
	return [...candidates].toSorted(compareDefaultNodeOrder)[0] ?? null;
}
function pickDefaultNode(nodes) {
	return selectDefaultNodeFromList(nodes, {
		capability: "canvas",
		fallback: "first",
		preferLocalMac: true
	});
}
async function listNodes(opts) {
	return loadNodes(opts);
}
function resolveNodeIdFromList(nodes, query, allowDefault = false) {
	return resolveNodeIdFromNodeList(nodes, query, {
		allowDefault,
		pickDefaultNode
	});
}
async function resolveNodeId(opts, query, allowDefault = false) {
	return (await resolveNode(opts, query, allowDefault)).nodeId;
}
async function resolveNode(opts, query, allowDefault = false) {
	return resolveNodeFromNodeList(await loadNodes(opts), query, {
		allowDefault,
		pickDefaultNode
	});
}
//#endregion
//#region src/node-host/with-timeout.ts
async function withTimeout(work, timeoutMs, label) {
	const resolved = typeof timeoutMs === "number" && Number.isFinite(timeoutMs) ? Math.max(1, Math.floor(timeoutMs)) : void 0;
	if (!resolved) return await work(void 0);
	const abortCtrl = new AbortController();
	const timeoutError = /* @__PURE__ */ new Error(`${label ?? "request"} timed out`);
	const timer = setTimeout(() => abortCtrl.abort(timeoutError), resolved);
	timer.unref?.();
	let abortListener;
	const abortPromise = abortCtrl.signal.aborted ? Promise.reject(abortCtrl.signal.reason ?? timeoutError) : new Promise((_, reject) => {
		abortListener = () => reject(abortCtrl.signal.reason ?? timeoutError);
		abortCtrl.signal.addEventListener("abort", abortListener, { once: true });
	});
	try {
		return await Promise.race([work(abortCtrl.signal), abortPromise]);
	} finally {
		clearTimeout(timer);
		if (abortListener) abortCtrl.signal.removeEventListener("abort", abortListener);
	}
}
//#endregion
export { resolveNodeIdFromList as a, readGatewayCallOptions as c, resolveNodeId as i, resolveGatewayOptions as l, listNodes as n, selectDefaultNodeFromList as o, resolveNode as r, callGatewayTool as s, withTimeout as t };
