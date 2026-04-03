import "./model-definitions-rmgREJT_.js";
import "./provider-catalog-DTYMtV69.js";
import "./onboard-Bq4DQWS5.js";
const MISTRAL_MODEL_COMPAT_PATCH = {
	supportsStore: false,
	supportsReasoningEffort: false,
	maxTokensField: "max_tokens"
};
function applyMistralModelCompat(model) {
	const compat = model.compat && typeof model.compat === "object" ? model.compat : void 0;
	if (compat && Object.entries(MISTRAL_MODEL_COMPAT_PATCH).every(([key, value]) => compat[key] === value)) return model;
	return {
		...model,
		compat: {
			...compat,
			...MISTRAL_MODEL_COMPAT_PATCH
		}
	};
}
//#endregion
export { applyMistralModelCompat as n, MISTRAL_MODEL_COMPAT_PATCH as t };
