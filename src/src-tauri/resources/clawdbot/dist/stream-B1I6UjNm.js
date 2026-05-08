import { n as createDeepSeekV4OpenAICompatibleThinkingWrapper } from "./provider-stream-shared-C_b_e9Jg.js";
//#region extensions/deepseek/stream.ts
function isDeepSeekV4ModelId(modelId) {
	return modelId === "deepseek-v4-flash" || modelId === "deepseek-v4-pro";
}
function createDeepSeekV4ThinkingWrapper(baseStreamFn, thinkingLevel) {
	return createDeepSeekV4OpenAICompatibleThinkingWrapper({
		baseStreamFn,
		thinkingLevel,
		shouldPatchModel: (model) => model.provider === "deepseek" && isDeepSeekV4ModelId(model.id)
	});
}
//#endregion
export { createDeepSeekV4ThinkingWrapper as t };
