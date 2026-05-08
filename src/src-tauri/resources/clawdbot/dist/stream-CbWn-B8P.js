import { r as normalizeProviderId } from "./provider-id-DRW5WMbW.js";
import "./provider-model-shared-Bqo51Ufw.js";
import "./provider-stream-shared-C_b_e9Jg.js";
import { i as streamWithPayloadPatch } from "./moonshot-thinking-stream-wrappers-BqR0jo0c.js";
import { t as isFireworksKimiModelId } from "./model-id-DqJW8d2_.js";
import { streamSimple } from "@mariozechner/pi-ai";
//#region extensions/fireworks/stream.ts
function isFireworksProviderId(providerId) {
	const normalized = normalizeProviderId(providerId);
	return normalized === "fireworks" || normalized === "fireworks-ai";
}
function createFireworksKimiThinkingDisabledWrapper(baseStreamFn) {
	const underlying = baseStreamFn ?? streamSimple;
	return (model, context, options) => streamWithPayloadPatch(underlying, model, context, options, (payloadObj) => {
		payloadObj.thinking = { type: "disabled" };
		delete payloadObj.reasoning;
		delete payloadObj.reasoning_effort;
		delete payloadObj.reasoningEffort;
	});
}
function wrapFireworksProviderStream(ctx) {
	if (!isFireworksProviderId(ctx.provider) || ctx.model?.api !== "openai-completions" || !isFireworksKimiModelId(ctx.modelId)) return;
	return createFireworksKimiThinkingDisabledWrapper(ctx.streamFn);
}
//#endregion
export { wrapFireworksProviderStream as n, createFireworksKimiThinkingDisabledWrapper as t };
