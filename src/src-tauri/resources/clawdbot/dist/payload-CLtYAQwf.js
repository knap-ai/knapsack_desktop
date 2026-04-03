//#region src/interactive/payload.ts
function readTrimmedString(value) {
	if (typeof value !== "string") return;
	return value.trim() || void 0;
}
function normalizeButtonStyle(value) {
	const style = readTrimmedString(value)?.toLowerCase();
	return style === "primary" || style === "secondary" || style === "success" || style === "danger" ? style : void 0;
}
function normalizeInteractiveButton(raw) {
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) return;
	const record = raw;
	const label = readTrimmedString(record.label) ?? readTrimmedString(record.text);
	const value = readTrimmedString(record.value) ?? readTrimmedString(record.callbackData) ?? readTrimmedString(record.callback_data);
	if (!label || !value) return;
	return {
		label,
		value,
		style: normalizeButtonStyle(record.style)
	};
}
function normalizeInteractiveOption(raw) {
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) return;
	const record = raw;
	const label = readTrimmedString(record.label) ?? readTrimmedString(record.text);
	const value = readTrimmedString(record.value);
	if (!label || !value) return;
	return {
		label,
		value
	};
}
function normalizeInteractiveBlock(raw) {
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) return;
	const record = raw;
	const type = readTrimmedString(record.type)?.toLowerCase();
	if (type === "text") {
		const text = readTrimmedString(record.text);
		return text ? {
			type: "text",
			text
		} : void 0;
	}
	if (type === "buttons") {
		const buttons = Array.isArray(record.buttons) ? record.buttons.map((entry) => normalizeInteractiveButton(entry)).filter((entry) => Boolean(entry)) : [];
		return buttons.length > 0 ? {
			type: "buttons",
			buttons
		} : void 0;
	}
	if (type === "select") {
		const options = Array.isArray(record.options) ? record.options.map((entry) => normalizeInteractiveOption(entry)).filter((entry) => Boolean(entry)) : [];
		return options.length > 0 ? {
			type: "select",
			placeholder: readTrimmedString(record.placeholder),
			options
		} : void 0;
	}
}
function normalizeInteractiveReply(raw) {
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) return;
	const record = raw;
	const blocks = Array.isArray(record.blocks) ? record.blocks.map((entry) => normalizeInteractiveBlock(entry)).filter((entry) => Boolean(entry)) : [];
	return blocks.length > 0 ? { blocks } : void 0;
}
function hasInteractiveReplyBlocks(value) {
	return Boolean(normalizeInteractiveReply(value));
}
function hasReplyChannelData(value) {
	return Boolean(value && typeof value === "object" && !Array.isArray(value) && Object.keys(value).length > 0);
}
function hasReplyContent(params) {
	return Boolean(params.text?.trim() || params.mediaUrl?.trim() || params.mediaUrls?.some((entry) => Boolean(entry?.trim())) || hasInteractiveReplyBlocks(params.interactive) || params.hasChannelData || params.extraContent);
}
function hasReplyPayloadContent(payload, options) {
	return hasReplyContent({
		text: options?.trimText ? payload.text?.trim() : payload.text,
		mediaUrl: payload.mediaUrl,
		mediaUrls: payload.mediaUrls,
		interactive: payload.interactive,
		hasChannelData: options?.hasChannelData ?? hasReplyChannelData(payload.channelData),
		extraContent: options?.extraContent
	});
}
function resolveInteractiveTextFallback(params) {
	if (readTrimmedString(params.text)) return params.text;
	return (params.interactive?.blocks ?? []).filter((block) => block.type === "text").map((block) => block.text.trim()).filter(Boolean).join("\n\n") || params.text;
}
//#endregion
export { normalizeInteractiveReply as a, hasReplyPayloadContent as i, hasReplyChannelData as n, resolveInteractiveTextFallback as o, hasReplyContent as r, hasInteractiveReplyBlocks as t };
