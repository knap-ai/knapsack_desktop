import { a as normalizeLowercaseStringOrEmpty } from "./string-coerce-C1IzJjqi.js";
import { r as normalizeProviderId } from "./provider-id-BLh32HP1.js";
import { E as resolveProviderBuiltInModelSuppression } from "./provider-runtime-C1HXSRlX.js";
//#region src/agents/model-suppression.ts
function resolveBuiltInModelSuppression(params) {
	const provider = normalizeProviderId(params.provider ?? "");
	const modelId = normalizeLowercaseStringOrEmpty(params.id);
	if (!provider || !modelId) return;
	return resolveProviderBuiltInModelSuppression({
		...params.config ? { config: params.config } : {},
		env: process.env,
		context: {
			...params.config ? { config: params.config } : {},
			env: process.env,
			provider,
			modelId,
			...params.baseUrl ? { baseUrl: params.baseUrl } : {}
		}
	});
}
function shouldSuppressBuiltInModel(params) {
	return resolveBuiltInModelSuppression(params)?.suppress ?? false;
}
function buildSuppressedBuiltInModelError(params) {
	return resolveBuiltInModelSuppression(params)?.errorMessage;
}
//#endregion
export { shouldSuppressBuiltInModel as n, buildSuppressedBuiltInModelError as t };
