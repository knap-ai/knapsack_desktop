//#region extensions/xai/src/responses-tool-shared.ts
const XAI_RESPONSES_ENDPOINT = "https://api.x.ai/v1/responses";
function buildXaiResponsesToolBody(params) {
	return {
		model: params.model,
		input: [{
			role: "user",
			content: params.inputText
		}],
		tools: params.tools,
		...params.maxTurns ? { max_turns: params.maxTurns } : {}
	};
}
function extractXaiWebSearchContent(data) {
	for (const output of data.output ?? []) {
		if (output.type === "message") {
			for (const block of output.content ?? []) if (block.type === "output_text" && typeof block.text === "string" && block.text) {
				const urls = (block.annotations ?? []).filter((annotation) => annotation.type === "url_citation" && typeof annotation.url === "string").map((annotation) => annotation.url);
				return {
					text: block.text,
					annotationCitations: [...new Set(urls)]
				};
			}
		}
		if (output.type === "output_text" && typeof output.text === "string" && output.text) {
			const urls = (output.annotations ?? []).filter((annotation) => annotation.type === "url_citation" && typeof annotation.url === "string").map((annotation) => annotation.url);
			return {
				text: output.text,
				annotationCitations: [...new Set(urls)]
			};
		}
	}
	return {
		text: typeof data.output_text === "string" ? data.output_text : void 0,
		annotationCitations: []
	};
}
function resolveXaiResponseTextAndCitations(data) {
	const { text, annotationCitations } = extractXaiWebSearchContent(data);
	return {
		content: text ?? "No response",
		citations: Array.isArray(data.citations) && data.citations.length > 0 ? data.citations : annotationCitations
	};
}
function resolveXaiResponseTextCitationsAndInline(data, inlineCitationsEnabled) {
	const { content, citations } = resolveXaiResponseTextAndCitations(data);
	return {
		content,
		citations,
		inlineCitations: inlineCitationsEnabled && Array.isArray(data.inline_citations) ? data.inline_citations : void 0
	};
}
//#endregion
export { resolveXaiResponseTextCitationsAndInline as a, resolveXaiResponseTextAndCitations as i, buildXaiResponsesToolBody as n, extractXaiWebSearchContent as r, XAI_RESPONSES_ENDPOINT as t };
