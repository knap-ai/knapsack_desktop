import { s as cloneFirstTemplateModel } from "./provider-model-minimax-DSmX4BNO.js";
//#region extensions/google/provider-models.ts
const GEMINI_3_1_PRO_PREFIX = "gemini-3.1-pro";
const GEMINI_3_1_FLASH_PREFIX = "gemini-3.1-flash";
const GEMINI_3_1_PRO_TEMPLATE_IDS = ["gemini-3-pro-preview"];
const GEMINI_3_1_FLASH_TEMPLATE_IDS = ["gemini-3-flash-preview"];
function resolveGoogle31ForwardCompatModel(params) {
	const trimmed = params.ctx.modelId.trim();
	const lower = trimmed.toLowerCase();
	let templateIds;
	if (lower.startsWith(GEMINI_3_1_PRO_PREFIX)) templateIds = GEMINI_3_1_PRO_TEMPLATE_IDS;
	else if (lower.startsWith(GEMINI_3_1_FLASH_PREFIX)) templateIds = GEMINI_3_1_FLASH_TEMPLATE_IDS;
	else return;
	return cloneFirstTemplateModel({
		providerId: params.providerId,
		modelId: trimmed,
		templateIds,
		ctx: params.ctx,
		patch: { reasoning: true }
	});
}
function isModernGoogleModel(modelId) {
	return modelId.trim().toLowerCase().startsWith("gemini-3");
}
//#endregion
export { resolveGoogle31ForwardCompatModel as n, isModernGoogleModel as t };
