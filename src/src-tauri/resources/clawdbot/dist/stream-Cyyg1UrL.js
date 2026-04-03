import { streamSimple } from "@mariozechner/pi-ai";
//#region extensions/xai/stream.ts
const XAI_FAST_MODEL_IDS = new Map([
	["grok-3", "grok-3-fast"],
	["grok-3-mini", "grok-3-mini-fast"],
	["grok-4", "grok-4-fast"],
	["grok-4-0709", "grok-4-fast"]
]);
function resolveXaiFastModelId(modelId) {
	if (typeof modelId !== "string") return;
	return XAI_FAST_MODEL_IDS.get(modelId.trim());
}
function stripUnsupportedStrictFlag(tool) {
	if (!tool || typeof tool !== "object") return tool;
	const toolObj = tool;
	const fn = toolObj.function;
	if (!fn || typeof fn !== "object") return tool;
	const fnObj = fn;
	if (typeof fnObj.strict !== "boolean") return tool;
	const nextFunction = { ...fnObj };
	delete nextFunction.strict;
	return {
		...toolObj,
		function: nextFunction
	};
}
function supportsExplicitImageInput(model) {
	return Array.isArray(model.input) && model.input.includes("image");
}
const TOOL_RESULT_IMAGE_REPLAY_TEXT = "Attached image(s) from tool result:";
function isReplayableInputImagePart(part) {
	if (part.type !== "input_image") return false;
	if (typeof part.image_url === "string") return true;
	if (!part.source || typeof part.source !== "object") return false;
	const source = part.source;
	if (source.type === "url") return typeof source.url === "string";
	return source.type === "base64" && typeof source.media_type === "string" && typeof source.data === "string";
}
function normalizeXaiResponsesFunctionCallOutput(item, includeImages) {
	if (!item || typeof item !== "object") return {
		normalizedItem: item,
		imageParts: []
	};
	const itemObj = item;
	if (itemObj.type !== "function_call_output" || !Array.isArray(itemObj.output)) return {
		normalizedItem: itemObj,
		imageParts: []
	};
	const outputParts = itemObj.output;
	const textOutput = outputParts.filter((part) => part.type === "input_text" && typeof part.text === "string").map((part) => part.text).join("");
	const imageParts = includeImages ? outputParts.filter((part) => isReplayableInputImagePart(part)) : [];
	const hadNonTextParts = outputParts.some((part) => part.type !== "input_text");
	return {
		normalizedItem: {
			...itemObj,
			output: textOutput || (hadNonTextParts ? "(see attached image)" : "")
		},
		imageParts
	};
}
function normalizeXaiResponsesToolResultPayload(payloadObj, model) {
	if (model.api !== "openai-responses" || !Array.isArray(payloadObj.input)) return;
	const includeImages = supportsExplicitImageInput(model);
	const normalizedInput = [];
	const collectedImageParts = [];
	for (const item of payloadObj.input) {
		const normalized = normalizeXaiResponsesFunctionCallOutput(item, includeImages);
		normalizedInput.push(normalized.normalizedItem);
		collectedImageParts.push(...normalized.imageParts);
	}
	if (collectedImageParts.length > 0) normalizedInput.push({
		type: "message",
		role: "user",
		content: [{
			type: "input_text",
			text: TOOL_RESULT_IMAGE_REPLAY_TEXT
		}, ...collectedImageParts]
	});
	payloadObj.input = normalizedInput;
}
function createXaiToolPayloadCompatibilityWrapper(baseStreamFn) {
	const underlying = baseStreamFn ?? streamSimple;
	return (model, context, options) => {
		const originalOnPayload = options?.onPayload;
		return underlying(model, context, {
			...options,
			onPayload: (payload) => {
				if (payload && typeof payload === "object") {
					const payloadObj = payload;
					if (Array.isArray(payloadObj.tools)) payloadObj.tools = payloadObj.tools.map((tool) => stripUnsupportedStrictFlag(tool));
					normalizeXaiResponsesToolResultPayload(payloadObj, model);
					delete payloadObj.reasoning;
					delete payloadObj.reasoningEffort;
					delete payloadObj.reasoning_effort;
				}
				return originalOnPayload?.(payload, model);
			}
		});
	};
}
function createXaiFastModeWrapper(baseStreamFn, fastMode) {
	const underlying = baseStreamFn ?? streamSimple;
	return (model, context, options) => {
		const supportsFastAliasTransport = model.api === "openai-completions" || model.api === "openai-responses";
		if (!fastMode || !supportsFastAliasTransport || model.provider !== "xai") return underlying(model, context, options);
		const fastModelId = resolveXaiFastModelId(model.id);
		if (!fastModelId) return underlying(model, context, options);
		return underlying({
			...model,
			id: fastModelId
		}, context, options);
	};
}
function decodeHtmlEntities(value) {
	return value.replaceAll("&quot;", "\"").replaceAll("&#34;", "\"").replaceAll("&apos;", "'").replaceAll("&#39;", "'").replaceAll("&lt;", "<").replaceAll("&#60;", "<").replaceAll("&gt;", ">").replaceAll("&#62;", ">").replaceAll("&amp;", "&").replaceAll("&#38;", "&");
}
function decodeHtmlEntitiesInObject(value) {
	if (typeof value === "string") return decodeHtmlEntities(value);
	if (!value || typeof value !== "object") return value;
	if (Array.isArray(value)) return value.map((entry) => decodeHtmlEntitiesInObject(entry));
	const record = value;
	for (const [key, entry] of Object.entries(record)) record[key] = decodeHtmlEntitiesInObject(entry);
	return record;
}
function decodeXaiToolCallArgumentsInMessage(message) {
	if (!message || typeof message !== "object") return;
	const content = message.content;
	if (!Array.isArray(content)) return;
	for (const block of content) {
		if (!block || typeof block !== "object") continue;
		const typedBlock = block;
		if (typedBlock.type !== "toolCall" || !typedBlock.arguments) continue;
		if (typeof typedBlock.arguments === "object") typedBlock.arguments = decodeHtmlEntitiesInObject(typedBlock.arguments);
	}
}
function wrapStreamDecodeXaiToolCallArguments(stream) {
	const originalResult = stream.result.bind(stream);
	stream.result = async () => {
		const message = await originalResult();
		decodeXaiToolCallArgumentsInMessage(message);
		return message;
	};
	const originalAsyncIterator = stream[Symbol.asyncIterator].bind(stream);
	stream[Symbol.asyncIterator] = function() {
		const iterator = originalAsyncIterator();
		return {
			async next() {
				const result = await iterator.next();
				if (!result.done && result.value && typeof result.value === "object") {
					const event = result.value;
					decodeXaiToolCallArgumentsInMessage(event.partial);
					decodeXaiToolCallArgumentsInMessage(event.message);
				}
				return result;
			},
			async return(value) {
				return iterator.return?.(value) ?? {
					done: true,
					value: void 0
				};
			},
			async throw(error) {
				return iterator.throw?.(error) ?? {
					done: true,
					value: void 0
				};
			}
		};
	};
	return stream;
}
function createXaiToolCallArgumentDecodingWrapper(baseStreamFn) {
	return (model, context, options) => {
		const maybeStream = baseStreamFn(model, context, options);
		if (maybeStream && typeof maybeStream === "object" && "then" in maybeStream) return Promise.resolve(maybeStream).then((stream) => wrapStreamDecodeXaiToolCallArguments(stream));
		return wrapStreamDecodeXaiToolCallArguments(maybeStream);
	};
}
//#endregion
export { createXaiToolCallArgumentDecodingWrapper as n, createXaiToolPayloadCompatibilityWrapper as r, createXaiFastModeWrapper as t };
