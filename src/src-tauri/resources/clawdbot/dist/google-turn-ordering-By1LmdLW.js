//#region src/shared/google-turn-ordering.ts
const GOOGLE_TURN_ORDER_BOOTSTRAP_TEXT = "(session bootstrap)";
function sanitizeGoogleAssistantFirstOrdering(messages) {
	const first = messages[0];
	const role = first?.role;
	const content = first?.content;
	if (role === "user" && typeof content === "string" && content.trim() === "(session bootstrap)") return messages;
	if (role !== "assistant") return messages;
	return [{
		role: "user",
		content: GOOGLE_TURN_ORDER_BOOTSTRAP_TEXT,
		timestamp: Date.now()
	}, ...messages];
}
//#endregion
export { sanitizeGoogleAssistantFirstOrdering as t };
