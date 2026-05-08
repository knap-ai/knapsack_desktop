//#region src/agents/pi-embedded-runner/run/runtime-context-prompt.ts
const OPENCLAW_RUNTIME_CONTEXT_CUSTOM_TYPE = "openclaw.runtime-context";
function removeLastPromptOccurrence(text, prompt) {
	const index = text.lastIndexOf(prompt);
	if (index === -1) return null;
	return [text.slice(0, index).trimEnd(), text.slice(index + prompt.length).trimStart()].filter((part) => part.length > 0).join("\n\n").trim();
}
function resolveRuntimeContextPromptParts(params) {
	const transcriptPrompt = params.transcriptPrompt;
	if (transcriptPrompt === void 0 || transcriptPrompt === params.effectivePrompt) return { prompt: params.effectivePrompt };
	const prompt = transcriptPrompt.trim();
	const runtimeContext = removeLastPromptOccurrence(params.effectivePrompt, transcriptPrompt)?.trim() || params.effectivePrompt.trim();
	if (!prompt) return runtimeContext ? {
		prompt: "",
		runtimeContext,
		runtimeOnly: true,
		runtimeSystemContext: buildRuntimeEventSystemContext(runtimeContext)
	} : { prompt: "" };
	return runtimeContext ? {
		prompt,
		runtimeContext
	} : { prompt };
}
function buildRuntimeContextMessageContent(params) {
	return [
		params.kind === "runtime-event" ? "OpenClaw runtime event." : "OpenClaw runtime context for the immediately preceding user message.",
		"This context is runtime-generated, not user-authored. Keep internal details private.",
		"",
		params.runtimeContext
	].join("\n");
}
function buildRuntimeEventSystemContext(runtimeContext) {
	return buildRuntimeContextMessageContent({
		runtimeContext,
		kind: "runtime-event"
	});
}
async function queueRuntimeContextForNextTurn(params) {
	const runtimeContext = params.runtimeContext?.trim();
	if (!runtimeContext) return;
	await params.session.sendCustomMessage({
		customType: OPENCLAW_RUNTIME_CONTEXT_CUSTOM_TYPE,
		content: buildRuntimeContextMessageContent({
			runtimeContext,
			kind: "next-turn"
		}),
		display: false,
		details: { source: "openclaw-runtime-context" }
	}, { deliverAs: "nextTurn" });
}
//#endregion
export { queueRuntimeContextForNextTurn as n, resolveRuntimeContextPromptParts as r, buildRuntimeEventSystemContext as t };
