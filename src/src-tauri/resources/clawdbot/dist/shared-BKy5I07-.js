import { c as normalizeOptionalString } from "./string-coerce-Bje8XVt9.js";
import "./provider-model-shared-Bqo51Ufw.js";
import "./text-runtime-DfALcXL5.js";
import "./provider-catalog-shared-D-up-AZr.js";
import { a as OPENAI_RESPONSES_STREAM_HOOKS } from "./provider-stream-7qasVyCl.js";
import "./provider-stream-family-Wl9gUeDn.js";
import { t as createOpenAINativeWebSearchWrapper } from "./native-web-search-BKTDwFxC.js";
import { t as buildOpenAIReplayPolicy } from "./replay-policy-1cXnmJrE.js";
import { n as resolveOpenAIWebSocketSessionPolicy, t as resolveOpenAITransportTurnState } from "./transport-policy-Cc0vazj4.js";
//#region extensions/openai/shared.ts
const OPENAI_API_BASE_URL = "https://api.openai.com/v1";
function toOpenAIDataUrl(buffer, mimeType) {
	return `data:${mimeType};base64,${buffer.toString("base64")}`;
}
function resolveConfiguredOpenAIBaseUrl(cfg) {
	return normalizeOptionalString(cfg?.models?.providers?.openai?.baseUrl) ?? "https://api.openai.com/v1";
}
function hasSupportedOpenAIResponsesTransport(transport) {
	return transport === "auto" || transport === "sse" || transport === "websocket";
}
function defaultOpenAIResponsesExtraParams(extraParams, options) {
	const hasSupportedTransport = hasSupportedOpenAIResponsesTransport(extraParams?.transport);
	const hasExplicitWarmup = typeof extraParams?.openaiWsWarmup === "boolean";
	const shouldDefaultWarmup = options?.openaiWsWarmup === true;
	if (hasSupportedTransport && (!shouldDefaultWarmup || hasExplicitWarmup)) return extraParams;
	return {
		...extraParams,
		...hasSupportedTransport ? {} : { transport: "auto" },
		...shouldDefaultWarmup && !hasExplicitWarmup ? { openaiWsWarmup: true } : {}
	};
}
const resolveOpenAIResponsesTransportTurnState = (ctx) => resolveOpenAITransportTurnState(ctx);
const resolveOpenAIResponsesWebSocketSessionPolicy = (ctx) => resolveOpenAIWebSocketSessionPolicy(ctx);
const wrapOpenAIResponsesStreamFn = OPENAI_RESPONSES_STREAM_HOOKS.wrapStreamFn;
const wrapOpenAIResponsesProviderStreamFn = (ctx) => createOpenAINativeWebSearchWrapper(wrapOpenAIResponsesStreamFn?.(ctx) ?? ctx.streamFn, { config: ctx.config });
function buildOpenAIResponsesProviderHooks(options) {
	return {
		buildReplayPolicy: buildOpenAIReplayPolicy,
		prepareExtraParams: (ctx) => defaultOpenAIResponsesExtraParams(ctx.extraParams, options),
		...OPENAI_RESPONSES_STREAM_HOOKS,
		wrapStreamFn: wrapOpenAIResponsesProviderStreamFn,
		resolveTransportTurnState: resolveOpenAIResponsesTransportTurnState,
		resolveWebSocketSessionPolicy: resolveOpenAIResponsesWebSocketSessionPolicy
	};
}
function buildOpenAISyntheticCatalogEntry(template, entry) {
	if (!template) return;
	return {
		...template,
		id: entry.id,
		name: entry.id,
		reasoning: entry.reasoning,
		input: [...entry.input],
		contextWindow: entry.contextWindow,
		...entry.contextTokens === void 0 ? {} : { contextTokens: entry.contextTokens },
		...entry.cost === void 0 ? {} : { cost: entry.cost }
	};
}
//#endregion
export { resolveConfiguredOpenAIBaseUrl as a, defaultOpenAIResponsesExtraParams as i, buildOpenAIResponsesProviderHooks as n, toOpenAIDataUrl as o, buildOpenAISyntheticCatalogEntry as r, OPENAI_API_BASE_URL as t };
