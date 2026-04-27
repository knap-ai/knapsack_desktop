//#region src/plugin-sdk/tool-payload.ts
function isToolPayloadTextBlock(block) {
	return !!block && typeof block === "object" && block.type === "text" && typeof block.text === "string";
}
/**
* Extract the most useful payload from tool result-like objects shared across
* outbound core flows and bundled plugin helpers.
*/
function extractToolPayload(result) {
	if (!result) return;
	if (result.details !== void 0) return result.details;
	const text = (Array.isArray(result.content) ? result.content.find(isToolPayloadTextBlock) : void 0)?.text;
	if (!text) return result.content ?? result;
	try {
		return JSON.parse(text);
	} catch {
		return text;
	}
}
//#endregion
export { extractToolPayload as t };
