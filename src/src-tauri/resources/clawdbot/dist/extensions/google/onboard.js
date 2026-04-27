import { applyAgentDefaultModelPrimary } from "openclaw/plugin-sdk/provider-onboard";
//#region extensions/google/onboard.ts
const GOOGLE_GEMINI_DEFAULT_MODEL = "google/gemini-3.1-pro-preview";
function applyGoogleGeminiModelDefault(cfg) {
	const current = cfg.agents?.defaults?.model;
	if ((typeof current === "string" ? current.trim() || void 0 : current && typeof current === "object" && typeof current.primary === "string" ? (current.primary || "").trim() || void 0 : void 0) === "google/gemini-3.1-pro-preview") return {
		next: cfg,
		changed: false
	};
	return {
		next: applyAgentDefaultModelPrimary(cfg, GOOGLE_GEMINI_DEFAULT_MODEL),
		changed: true
	};
}
//#endregion
export { GOOGLE_GEMINI_DEFAULT_MODEL, applyGoogleGeminiModelDefault };
