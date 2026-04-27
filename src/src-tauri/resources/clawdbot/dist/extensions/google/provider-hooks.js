import { createGoogleThinkingStreamWrapper, isGoogleGemini3ProModel } from "./thinking.js";
import "./thinking-api.js";
import { buildProviderReplayFamilyHooks } from "openclaw/plugin-sdk/provider-model-shared";
//#region extensions/google/provider-hooks.ts
const GOOGLE_GEMINI_PROVIDER_HOOKS = {
	...buildProviderReplayFamilyHooks({ family: "google-gemini" }),
	resolveThinkingProfile: ({ modelId }) => ({ levels: isGoogleGemini3ProModel(modelId) ? [
		{ id: "off" },
		{ id: "low" },
		{ id: "adaptive" },
		{ id: "high" }
	] : [
		{ id: "off" },
		{ id: "minimal" },
		{ id: "low" },
		{ id: "medium" },
		{ id: "adaptive" },
		{ id: "high" }
	] }),
	wrapStreamFn: createGoogleThinkingStreamWrapper
};
//#endregion
export { GOOGLE_GEMINI_PROVIDER_HOOKS };
