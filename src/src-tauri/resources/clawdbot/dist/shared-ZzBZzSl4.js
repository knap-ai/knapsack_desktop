import { s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import "./provider-model-shared-DyDnBaDe.js";
import "./text-runtime-DTMxvodz.js";
import "./provider-catalog-shared-CQPCLokR.js";
import { a as OPENAI_RESPONSES_STREAM_HOOKS } from "./provider-stream-DMhSzU-H.js";
import "./provider-stream-family-CjEB-fh0.js";
import { t as buildOpenAIReplayPolicy } from "./replay-policy-C4bWLLe2.js";
import { n as resolveOpenAIWebSocketSessionPolicy, t as resolveOpenAITransportTurnState } from "./transport-policy-B3ic2sUL.js";
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
function buildOpenAIResponsesProviderHooks(options) {
	return {
		buildReplayPolicy: buildOpenAIReplayPolicy,
		prepareExtraParams: (ctx) => defaultOpenAIResponsesExtraParams(ctx.extraParams, options),
		...OPENAI_RESPONSES_STREAM_HOOKS,
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
