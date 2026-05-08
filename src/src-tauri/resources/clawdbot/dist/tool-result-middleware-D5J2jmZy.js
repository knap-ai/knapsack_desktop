import { y as truncateUtf16Safe } from "./utils-DvkbxKCZ.js";
import { t as createSubsystemLogger } from "./subsystem-rHhUC6qs.js";
import { t as listAgentToolResultMiddlewares } from "./agent-tool-result-middleware-CWYVpHac.js";
import { m as inspectProviderToolSchemasWithPlugin, y as normalizeProviderToolSchemasWithPlugin } from "./provider-runtime-CwkNkui5.js";
import { t as log$1 } from "./logger-8xw2ZKab.js";
//#region src/agents/model-tool-support.ts
function supportsModelTools(model) {
	return (model.compat && typeof model.compat === "object" ? model.compat : void 0)?.supportsTools !== false;
}
//#endregion
//#region src/agents/pi-embedded-runner/tool-schema-runtime.ts
function buildProviderToolSchemaContext(params, provider) {
	return {
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env,
		provider,
		modelId: params.modelId,
		modelApi: params.modelApi,
		model: params.model,
		tools: params.tools
	};
}
/**
* Runs provider-owned tool-schema normalization without encoding provider
* families in the embedded runner.
*/
function normalizeProviderToolSchemas(params) {
	const provider = params.provider.trim();
	const pluginNormalized = normalizeProviderToolSchemasWithPlugin({
		provider,
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env,
		context: buildProviderToolSchemaContext(params, provider)
	});
	return Array.isArray(pluginNormalized) ? pluginNormalized : params.tools;
}
/**
* Logs provider-owned tool-schema diagnostics after normalization.
*/
function logProviderToolSchemaDiagnostics(params) {
	const provider = params.provider.trim();
	const diagnostics = inspectProviderToolSchemasWithPlugin({
		provider,
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env,
		context: buildProviderToolSchemaContext(params, provider)
	});
	if (!Array.isArray(diagnostics)) return;
	if (diagnostics.length === 0) return;
	const summary = summarizeProviderToolSchemaDiagnostics(diagnostics);
	log$1.warn(`provider tool schema diagnostics: ${diagnostics.length} ${diagnostics.length === 1 ? "tool" : "tools"} for ${params.provider}: ${summary}`, {
		provider: params.provider,
		toolCount: params.tools.length,
		diagnosticCount: diagnostics.length,
		tools: params.tools.map((tool, index) => `${index}:${tool.name}`),
		diagnostics: diagnostics.map((diagnostic) => ({
			index: diagnostic.toolIndex,
			tool: diagnostic.toolName,
			violations: diagnostic.violations.slice(0, 12),
			violationCount: diagnostic.violations.length
		}))
	});
}
function summarizeProviderToolSchemaDiagnostics(diagnostics) {
	const visible = diagnostics.slice(0, 6).map((diagnostic) => {
		const violationCount = diagnostic.violations.length;
		return `${diagnostic.toolName || "unknown"} (${violationCount} ${violationCount === 1 ? "violation" : "violations"})`;
	});
	const remaining = diagnostics.length - visible.length;
	return remaining > 0 ? `${visible.join(", ")}, +${remaining} more` : visible.join(", ");
}
//#endregion
//#region src/agents/harness/tool-result-middleware.ts
const log = createSubsystemLogger("agents/harness");
const MAX_MIDDLEWARE_CONTENT_BLOCKS = 200;
const MAX_MIDDLEWARE_TEXT_CHARS = 1e5;
const MAX_MIDDLEWARE_IMAGE_DATA_CHARS = 5e6;
const MAX_MIDDLEWARE_DETAILS_BYTES = 1e5;
const MAX_MIDDLEWARE_DETAILS_DEPTH = 20;
const MAX_MIDDLEWARE_DETAILS_KEYS = 1e3;
function isRecord(value) {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}
function isValidMiddlewareContentBlock(value) {
	if (!isRecord(value) || typeof value.type !== "string") return false;
	if (value.type === "text") return typeof value.text === "string" && value.text.length <= MAX_MIDDLEWARE_TEXT_CHARS;
	if (value.type === "image") return typeof value.mimeType === "string" && value.mimeType.trim().length > 0 && typeof value.data === "string" && value.data.length <= MAX_MIDDLEWARE_IMAGE_DATA_CHARS;
	return false;
}
function isValidMiddlewareDetails(value, state = {
	keys: 0,
	bytes: 0,
	seen: /* @__PURE__ */ new WeakSet()
}, depth = 0) {
	if (value === void 0 || value === null) return true;
	if (depth > MAX_MIDDLEWARE_DETAILS_DEPTH) return false;
	if (typeof value === "string") {
		state.bytes += value.length;
		return state.bytes <= MAX_MIDDLEWARE_DETAILS_BYTES;
	}
	if (typeof value === "number" || typeof value === "boolean") {
		state.bytes += String(value).length;
		return state.bytes <= MAX_MIDDLEWARE_DETAILS_BYTES;
	}
	if (typeof value !== "object") return false;
	if (state.seen.has(value)) return false;
	state.seen.add(value);
	if (Array.isArray(value)) {
		state.keys += value.length;
		if (state.keys > MAX_MIDDLEWARE_DETAILS_KEYS) return false;
		for (const entry of value) if (!isValidMiddlewareDetails(entry, state, depth + 1)) return false;
		return true;
	}
	for (const [key, entry] of Object.entries(value)) {
		state.keys += 1;
		state.bytes += key.length;
		if (state.keys > MAX_MIDDLEWARE_DETAILS_KEYS || state.bytes > MAX_MIDDLEWARE_DETAILS_BYTES) return false;
		if (!isValidMiddlewareDetails(entry, state, depth + 1)) return false;
	}
	return true;
}
function isValidMiddlewareToolResult(value) {
	if (!isRecord(value) || !Array.isArray(value.content)) return false;
	if (value.content.length > MAX_MIDDLEWARE_CONTENT_BLOCKS) return false;
	return value.content.every(isValidMiddlewareContentBlock) && isValidMiddlewareDetails(value.details);
}
function buildMiddlewareFailureResult() {
	return {
		content: [{
			type: "text",
			text: "Tool output unavailable due to post-processing error."
		}],
		details: {
			status: "error",
			middlewareError: true
		}
	};
}
function createAgentToolResultMiddlewareRunner(ctx, handlers = listAgentToolResultMiddlewares(ctx.runtime)) {
	const middlewareContext = {
		...ctx,
		harness: ctx.harness ?? ctx.runtime
	};
	return { async applyToolResultMiddleware(event) {
		let current = event.result;
		for (const handler of handlers) try {
			const candidate = (await handler({
				...event,
				result: current
			}, middlewareContext))?.result ?? current;
			if (isValidMiddlewareToolResult(candidate)) current = candidate;
			else {
				log.warn(`[${ctx.runtime}] discarded invalid tool result middleware output for ${truncateUtf16Safe(event.toolName, 120)}`);
				return buildMiddlewareFailureResult();
			}
		} catch {
			log.warn(`[${ctx.runtime}] tool result middleware failed for ${truncateUtf16Safe(event.toolName, 120)}`);
			return buildMiddlewareFailureResult();
		}
		return current;
	} };
}
//#endregion
export { supportsModelTools as i, logProviderToolSchemaDiagnostics as n, normalizeProviderToolSchemas as r, createAgentToolResultMiddlewareRunner as t };
