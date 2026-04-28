//#region src/plugin-sdk/memory-host-markdown.ts
function escapeRegex(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function withTrailingNewline(content) {
	return content.endsWith("\n") ? content : `${content}\n`;
}
function replaceManagedMarkdownBlock(params) {
	const managedBlock = `${params.heading ? `${params.heading}\n` : ""}${params.startMarker}\n${params.body}\n${params.endMarker}`;
	const existingPattern = new RegExp(`${params.heading ? `${escapeRegex(params.heading)}\\n` : ""}${escapeRegex(params.startMarker)}[\\s\\S]*?${escapeRegex(params.endMarker)}`, "m");
	if (existingPattern.test(params.original)) return params.original.replace(existingPattern, managedBlock);
	const trimmed = params.original.trimEnd();
	if (trimmed.length === 0) return `${managedBlock}\n`;
	return `${trimmed}\n\n${managedBlock}\n`;
}
//#endregion
export { withTrailingNewline as n, replaceManagedMarkdownBlock as t };
