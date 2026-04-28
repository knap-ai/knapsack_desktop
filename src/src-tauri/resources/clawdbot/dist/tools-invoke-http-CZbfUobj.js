import { c as normalizeOptionalString, s as normalizeOptionalLowercaseString } from "./string-coerce-Bje8XVt9.js";
import { a as logWarn } from "./logger-mz_TsqXj.js";
import { n as defaultSlotIdForKey } from "./slots-CjmwiD-v.js";
import { i as isTestDefaultMemorySlotDisabled } from "./config-state-Bw_lAn0M.js";
import { u as normalizeMessageChannel } from "./message-channel-B32dwK-Q.js";
import { g as isKnownCoreToolId, n as applyOwnerOnlyToolPolicy } from "./tool-policy-CC72sL8W.js";
import { i as resolveMainSessionKey } from "./main-session-JXLAAy4Q.js";
import "./sessions-CLHVJJOI.js";
import { r as ToolInputError } from "./common-C4RGIxnG.js";
import { i as runBeforeToolCallHook } from "./pi-tools.before-tool-call-CW1QN3SP.js";
import { n as resolveToolLoopDetectionConfig } from "./pi-tools-oOiy-pNP.js";
import { a as sendMethodNotAllowed, i as sendJson, r as sendInvalidRequest, t as readJsonBodyOrError } from "./http-common-upoyWvf5.js";
import { a as getHeader, l as resolveOpenAiCompatibleHttpOperatorScopes, n as authorizeScopedGatewayHttpRequestOrReply, u as resolveOpenAiCompatibleHttpSenderIsOwner } from "./http-auth-utils-DbcEvDoY.js";
import "./http-utils-DjkbiPAA.js";
import { t as resolveGatewayScopedTools } from "./tool-resolution-DN7RU69d.js";
//#region src/gateway/tools-invoke-http.ts
const DEFAULT_BODY_BYTES = 2 * 1024 * 1024;
const MEMORY_TOOL_NAMES = new Set(["memory_search", "memory_get"]);
function resolveSessionKeyFromBody(body) {
	if (typeof body.sessionKey === "string" && body.sessionKey.trim()) return body.sessionKey.trim();
}
function resolveMemoryToolDisableReasons(cfg) {
	if (!process.env.VITEST) return [];
	const reasons = [];
	const plugins = cfg.plugins;
	const slotRaw = plugins?.slots?.memory;
	const slotDisabled = slotRaw === null || normalizeOptionalLowercaseString(slotRaw) === "none";
	const pluginsDisabled = plugins?.enabled === false;
	const defaultDisabled = isTestDefaultMemorySlotDisabled(cfg);
	if (pluginsDisabled) reasons.push("plugins.enabled=false");
	if (slotDisabled) reasons.push(slotRaw === null ? "plugins.slots.memory=null" : "plugins.slots.memory=\"none\"");
	if (!pluginsDisabled && !slotDisabled && defaultDisabled) reasons.push("memory plugin disabled by test default");
	return reasons;
}
function mergeActionIntoArgsIfSupported(params) {
	const { toolSchema, action, args } = params;
	if (!action) return args;
	if (args.action !== void 0) return args;
	const schemaObj = toolSchema;
	if (!Boolean(schemaObj && typeof schemaObj === "object" && schemaObj.properties && "action" in schemaObj.properties)) return args;
	return {
		...args,
		action
	};
}
function getErrorMessage(err) {
	if (err instanceof Error) return err.message || String(err);
	if (typeof err === "string") return err;
	return String(err);
}
function resolveToolInputErrorStatus(err) {
	if (err instanceof ToolInputError) {
		const status = err.status;
		return typeof status === "number" ? status : 400;
	}
	if (typeof err !== "object" || err === null || !("name" in err)) return null;
	const name = err.name;
	if (name !== "ToolInputError" && name !== "ToolAuthorizationError") return null;
	const status = err.status;
	if (typeof status === "number") return status;
	return name === "ToolAuthorizationError" ? 403 : 400;
}
async function handleToolsInvokeHttpRequest(req, res, opts) {
	let url;
	try {
		url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
	} catch {
		res.writeHead(400, { "Content-Type": "application/json" });
		res.end(JSON.stringify({
			error: "bad_request",
			message: "Invalid request URL"
		}));
		return true;
	}
	if (url.pathname !== "/tools/invoke") return false;
	if (req.method !== "POST") {
		sendMethodNotAllowed(res, "POST");
		return true;
	}
	const authResult = await authorizeScopedGatewayHttpRequestOrReply({
		req,
		res,
		auth: opts.auth,
		trustedProxies: opts.trustedProxies,
		allowRealIpFallback: opts.allowRealIpFallback,
		rateLimiter: opts.rateLimiter,
		operatorMethod: "agent",
		resolveOperatorScopes: resolveOpenAiCompatibleHttpOperatorScopes
	});
	if (!authResult) return true;
	const { cfg, requestAuth } = authResult;
	const bodyUnknown = await readJsonBodyOrError(req, res, opts.maxBodyBytes ?? DEFAULT_BODY_BYTES);
	if (bodyUnknown === void 0) return true;
	const body = bodyUnknown ?? {};
	const toolName = normalizeOptionalString(body.tool) ?? "";
	if (!toolName) {
		sendInvalidRequest(res, "tools.invoke requires body.tool");
		return true;
	}
	if (process.env.VITEST && MEMORY_TOOL_NAMES.has(toolName)) {
		const reasons = resolveMemoryToolDisableReasons(cfg);
		if (reasons.length > 0) {
			sendJson(res, 400, {
				ok: false,
				error: {
					type: "invalid_request",
					message: `memory tools are disabled in tests${reasons.length > 0 ? ` (${reasons.join(", ")})` : ""}. Enable by setting plugins.slots.memory="${defaultSlotIdForKey("memory")}" (and ensure plugins.enabled is not false).`
				}
			});
			return true;
		}
	}
	const action = normalizeOptionalString(body.action);
	const argsRaw = body.args;
	const args = argsRaw && typeof argsRaw === "object" && !Array.isArray(argsRaw) ? argsRaw : {};
	const rawSessionKey = resolveSessionKeyFromBody(body);
	const sessionKey = !rawSessionKey || rawSessionKey === "main" ? resolveMainSessionKey(cfg) : rawSessionKey;
	const messageChannel = normalizeMessageChannel(getHeader(req, "x-openclaw-message-channel") ?? "");
	const accountId = normalizeOptionalString(getHeader(req, "x-openclaw-account-id"));
	const agentTo = normalizeOptionalString(getHeader(req, "x-openclaw-message-to"));
	const agentThreadId = normalizeOptionalString(getHeader(req, "x-openclaw-thread-id"));
	const senderIsOwner = resolveOpenAiCompatibleHttpSenderIsOwner(req, requestAuth);
	const resolveTools = (disablePluginTools) => resolveGatewayScopedTools({
		cfg,
		sessionKey,
		messageProvider: messageChannel ?? void 0,
		accountId,
		agentTo,
		agentThreadId,
		allowGatewaySubagentBinding: true,
		allowMediaInvokeCommands: true,
		surface: "http",
		disablePluginTools,
		senderIsOwner
	});
	const knownCoreTool = isKnownCoreToolId(toolName);
	let { agentId, tools } = resolveTools(knownCoreTool);
	if (knownCoreTool && !tools.some((candidate) => candidate.name === toolName)) ({agentId, tools} = resolveTools(false));
	const tool = applyOwnerOnlyToolPolicy(tools, senderIsOwner).find((t) => t.name === toolName);
	if (!tool) {
		sendJson(res, 404, {
			ok: false,
			error: {
				type: "not_found",
				message: `Tool not available: ${toolName}`
			}
		});
		return true;
	}
	try {
		const gatewayTool = tool;
		const toolCallId = `http-${Date.now()}`;
		const hookResult = await runBeforeToolCallHook({
			toolName,
			params: mergeActionIntoArgsIfSupported({
				toolSchema: gatewayTool.parameters,
				action,
				args
			}),
			toolCallId,
			ctx: {
				agentId,
				sessionKey,
				loopDetection: resolveToolLoopDetectionConfig({
					cfg,
					agentId
				})
			}
		});
		if (hookResult.blocked) {
			sendJson(res, 403, {
				ok: false,
				error: {
					type: "tool_call_blocked",
					message: hookResult.reason
				}
			});
			return true;
		}
		sendJson(res, 200, {
			ok: true,
			result: await gatewayTool.execute?.(toolCallId, hookResult.params)
		});
	} catch (err) {
		const inputStatus = resolveToolInputErrorStatus(err);
		if (inputStatus !== null) {
			sendJson(res, inputStatus, {
				ok: false,
				error: {
					type: "tool_error",
					message: getErrorMessage(err) || "invalid tool arguments"
				}
			});
			return true;
		}
		logWarn(`tools-invoke: tool execution failed: ${String(err)}`);
		sendJson(res, 500, {
			ok: false,
			error: {
				type: "tool_error",
				message: "tool execution failed"
			}
		});
	}
	return true;
}
//#endregion
export { handleToolsInvokeHttpRequest };
