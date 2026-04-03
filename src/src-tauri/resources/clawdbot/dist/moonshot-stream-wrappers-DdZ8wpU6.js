import { r as normalizeProviderId } from "./provider-id-CTiEzT1T.js";
import { n as resolveProviderRequestCapabilities } from "./provider-attribution-BrdhzyJa.js";
import { r as streamWithPayloadPatch } from "./moonshot-thinking-stream-wrappers-ARhjUCLc.js";
import { streamSimple } from "@mariozechner/pi-ai";
//#region src/agents/pi-embedded-runner/moonshot-stream-wrappers.ts
function shouldApplySiliconFlowThinkingOffCompat(params) {
	return params.provider === "siliconflow" && params.thinkingLevel === "off" && params.modelId.startsWith("Pro/");
}
function shouldApplyMoonshotPayloadCompat(params) {
	return resolveProviderRequestCapabilities({
		provider: normalizeProviderId(params.provider),
		modelId: params.modelId,
		capability: "llm",
		transport: "stream"
	}).compatibilityFamily === "moonshot";
}
function createSiliconFlowThinkingWrapper(baseStreamFn) {
	const underlying = baseStreamFn ?? streamSimple;
	return (model, context, options) => streamWithPayloadPatch(underlying, model, context, options, (payloadObj) => {
		if (payloadObj.thinking === "off") payloadObj.thinking = null;
	});
}
//#endregion
export { shouldApplyMoonshotPayloadCompat as n, shouldApplySiliconFlowThinkingOffCompat as r, createSiliconFlowThinkingWrapper as t };
