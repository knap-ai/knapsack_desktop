//#region src/agents/copilot-dynamic-headers.ts
const COPILOT_EDITOR_VERSION = "vscode/1.96.2";
const COPILOT_USER_AGENT = "GitHubCopilotChat/0.26.7";
const COPILOT_GITHUB_API_VERSION = "2025-04-01";
function inferCopilotInitiator(messages) {
	const last = messages[messages.length - 1];
	return last && last.role !== "user" ? "agent" : "user";
}
function hasCopilotVisionInput(messages) {
	return messages.some((message) => {
		if (message.role === "user" && Array.isArray(message.content)) return message.content.some((item) => item.type === "image");
		if (message.role === "toolResult" && Array.isArray(message.content)) return message.content.some((item) => item.type === "image");
		return false;
	});
}
function buildCopilotIdeHeaders(params = {}) {
	return {
		"Editor-Version": COPILOT_EDITOR_VERSION,
		"User-Agent": COPILOT_USER_AGENT,
		...params.includeApiVersion ? { "X-Github-Api-Version": COPILOT_GITHUB_API_VERSION } : {}
	};
}
function buildCopilotDynamicHeaders(params) {
	return {
		...buildCopilotIdeHeaders(),
		"X-Initiator": inferCopilotInitiator(params.messages),
		"Openai-Intent": "conversation-edits",
		...params.hasImages ? { "Copilot-Vision-Request": "true" } : {}
	};
}
//#endregion
export { buildCopilotIdeHeaders as n, hasCopilotVisionInput as r, buildCopilotDynamicHeaders as t };
