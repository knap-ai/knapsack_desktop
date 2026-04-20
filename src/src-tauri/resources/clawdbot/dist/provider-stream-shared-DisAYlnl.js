import { r as streamWithPayloadPatch } from "./moonshot-thinking-stream-wrappers-B057G_9z.js";
import "./anthropic-payload-policy-DKgsteMF.js";
import "./anthropic-cache-control-payload-B4Uqb9Jq.js";
import { streamSimple } from "@mariozechner/pi-ai";
//#region src/agents/pi-embedded-runner/bedrock-stream-wrappers.ts
function createBedrockNoCacheWrapper(baseStreamFn) {
	const underlying = baseStreamFn ?? streamSimple;
	return (model, context, options) => underlying(model, context, {
		...options,
		cacheRetention: "none"
	});
}
//#endregion
//#region src/agents/pi-embedded-runner/zai-stream-wrappers.ts
/**
* Inject `tool_stream=true` so tool-call deltas stream in real time.
* Providers can disable this by setting `params.tool_stream=false`.
*/
function createToolStreamWrapper(baseStreamFn, enabled) {
	const underlying = baseStreamFn ?? streamSimple;
	return (model, context, options) => {
		if (!enabled) return underlying(model, context, options);
		return streamWithPayloadPatch(underlying, model, context, options, (payloadObj) => {
			payloadObj.tool_stream = true;
		});
	};
}
const createZaiToolStreamWrapper = createToolStreamWrapper;
//#endregion
//#region src/plugin-sdk/provider-stream-shared.ts
function composeProviderStreamWrappers(baseStreamFn, ...wrappers) {
	return wrappers.reduce((streamFn, wrapper) => wrapper ? wrapper(streamFn) : streamFn, baseStreamFn);
}
function defaultToolStreamExtraParams(extraParams) {
	if (extraParams?.tool_stream !== void 0) return extraParams;
	return {
		...extraParams,
		tool_stream: true
	};
}
const HTML_ENTITY_RE = /&(?:amp|lt|gt|quot|apos|#39|#x[0-9a-f]+|#\d+);/i;
function decodeHtmlEntities(value) {
	return value.replace(/&amp;/gi, "&").replace(/&quot;/gi, "\"").replace(/&#39;/gi, "'").replace(/&apos;/gi, "'").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16))).replace(/&#(\d+);/gi, (_, dec) => String.fromCodePoint(Number.parseInt(dec, 10)));
}
function decodeHtmlEntitiesInObject(value) {
	if (typeof value === "string") return HTML_ENTITY_RE.test(value) ? decodeHtmlEntities(value) : value;
	if (Array.isArray(value)) return value.map(decodeHtmlEntitiesInObject);
	if (value && typeof value === "object") {
		const result = {};
		for (const [key, entry] of Object.entries(value)) result[key] = decodeHtmlEntitiesInObject(entry);
		return result;
	}
	return value;
}
function decodeToolCallArgumentsHtmlEntitiesInMessage(message) {
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
function wrapStreamDecodeToolCallArgumentHtmlEntities(stream) {
	const originalResult = stream.result.bind(stream);
	stream.result = async () => {
		const message = await originalResult();
		decodeToolCallArgumentsHtmlEntitiesInMessage(message);
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
					decodeToolCallArgumentsHtmlEntitiesInMessage(event.partial);
					decodeToolCallArgumentsHtmlEntitiesInMessage(event.message);
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
function createHtmlEntityToolCallArgumentDecodingWrapper(baseStreamFn) {
	const underlying = baseStreamFn ?? streamSimple;
	return (model, context, options) => {
		const maybeStream = underlying(model, context, options);
		if (maybeStream && typeof maybeStream === "object" && "then" in maybeStream) return Promise.resolve(maybeStream).then((stream) => wrapStreamDecodeToolCallArgumentHtmlEntities(stream));
		return wrapStreamDecodeToolCallArgumentHtmlEntities(maybeStream);
	};
}
//#endregion
export { createToolStreamWrapper as a, defaultToolStreamExtraParams as i, createHtmlEntityToolCallArgumentDecodingWrapper as n, createZaiToolStreamWrapper as o, decodeHtmlEntitiesInObject as r, createBedrockNoCacheWrapper as s, composeProviderStreamWrappers as t };
