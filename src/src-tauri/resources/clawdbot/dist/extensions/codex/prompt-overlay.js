import { GPT5_BEHAVIOR_CONTRACT, GPT5_FRIENDLY_PROMPT_OVERLAY, isGpt5ModelId, renderGpt5PromptOverlay, resolveGpt5SystemPromptContribution } from "openclaw/plugin-sdk/provider-model-shared";
//#region extensions/codex/prompt-overlay.ts
const CODEX_FRIENDLY_PROMPT_OVERLAY = GPT5_FRIENDLY_PROMPT_OVERLAY;
const CODEX_GPT5_BEHAVIOR_CONTRACT = GPT5_BEHAVIOR_CONTRACT;
function shouldApplyCodexPromptOverlay(params) {
	return isGpt5ModelId(params.modelId);
}
function resolveCodexSystemPromptContribution(params) {
	return resolveGpt5SystemPromptContribution(params);
}
function renderCodexPromptOverlay(params) {
	return renderGpt5PromptOverlay(params);
}
//#endregion
export { CODEX_FRIENDLY_PROMPT_OVERLAY, CODEX_GPT5_BEHAVIOR_CONTRACT, renderCodexPromptOverlay, resolveCodexSystemPromptContribution, shouldApplyCodexPromptOverlay };
