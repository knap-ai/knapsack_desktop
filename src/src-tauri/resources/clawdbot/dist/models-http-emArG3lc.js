import { a as loadConfig } from "./io-5pxHCi7V.js";
import { g as listAgentIds, x as resolveDefaultAgentId } from "./agent-scope-KFH9bkHi.js";
import "./config-Q9XZc_2I.js";
import { n as authorizeOperatorScopesForMethod } from "./method-scopes-D3xbsVVt.js";
import { b as sendMethodNotAllowed, d as resolveOpenAiCompatibleHttpOperatorScopes, n as OPENCLAW_MODEL_ID, r as authorizeGatewayHttpRequestOrReply, s as resolveAgentIdFromModel, t as OPENCLAW_DEFAULT_MODEL_ID, v as sendInvalidRequest, y as sendJson } from "./http-utils-C26ZfE50.js";
//#region src/gateway/models-http.ts
function toOpenAiModel(id) {
	return {
		id,
		object: "model",
		created: 0,
		owned_by: "openclaw",
		permission: []
	};
}
async function authorizeRequest(req, res, opts) {
	return await authorizeGatewayHttpRequestOrReply({
		req,
		res,
		auth: opts.auth,
		trustedProxies: opts.trustedProxies,
		allowRealIpFallback: opts.allowRealIpFallback,
		rateLimiter: opts.rateLimiter
	});
}
function loadAgentModelIds() {
	const cfg = loadConfig();
	const defaultAgentId = resolveDefaultAgentId(cfg);
	const ids = new Set([OPENCLAW_MODEL_ID, OPENCLAW_DEFAULT_MODEL_ID]);
	ids.add(`openclaw/${defaultAgentId}`);
	for (const agentId of listAgentIds(cfg)) ids.add(`openclaw/${agentId}`);
	return Array.from(ids);
}
function resolveRequestPath(req) {
	return new URL(req.url ?? "/", `http://${req.headers.host || "localhost"}`).pathname;
}
async function handleOpenAiModelsHttpRequest(req, res, opts) {
	const requestPath = resolveRequestPath(req);
	if (requestPath !== "/v1/models" && !requestPath.startsWith("/v1/models/")) return false;
	if (req.method !== "GET") {
		sendMethodNotAllowed(res, "GET");
		return true;
	}
	const requestAuth = await authorizeRequest(req, res, opts);
	if (!requestAuth) return true;
	const scopeAuth = authorizeOperatorScopesForMethod("models.list", resolveOpenAiCompatibleHttpOperatorScopes(req, requestAuth));
	if (!scopeAuth.allowed) {
		sendJson(res, 403, {
			ok: false,
			error: {
				type: "forbidden",
				message: `missing scope: ${scopeAuth.missingScope}`
			}
		});
		return true;
	}
	const ids = loadAgentModelIds();
	if (requestPath === "/v1/models") {
		sendJson(res, 200, {
			object: "list",
			data: ids.map(toOpenAiModel)
		});
		return true;
	}
	const encodedId = requestPath.slice(11);
	if (!encodedId) {
		sendInvalidRequest(res, "Missing model id.");
		return true;
	}
	let decodedId;
	try {
		decodedId = decodeURIComponent(encodedId);
	} catch {
		sendInvalidRequest(res, "Invalid model id encoding.");
		return true;
	}
	if (decodedId !== "openclaw" && !resolveAgentIdFromModel(decodedId)) {
		sendInvalidRequest(res, "Invalid model id.");
		return true;
	}
	if (!ids.includes(decodedId)) {
		sendJson(res, 404, { error: {
			message: `Model '${decodedId}' not found.`,
			type: "invalid_request_error"
		} });
		return true;
	}
	sendJson(res, 200, toOpenAiModel(decodedId));
	return true;
}
//#endregion
export { handleOpenAiModelsHttpRequest };
