import { streamSimple } from "@mariozechner/pi-ai";
//#region extensions/kimi-coding/stream.ts
const TOOL_CALLS_SECTION_BEGIN = "<|tool_calls_section_begin|>";
const TOOL_CALLS_SECTION_END = "<|tool_calls_section_end|>";
const TOOL_CALL_BEGIN = "<|tool_call_begin|>";
const TOOL_CALL_ARGUMENT_BEGIN = "<|tool_call_argument_begin|>";
const TOOL_CALL_END = "<|tool_call_end|>";
function stripTaggedToolCallCounter(value) {
	return value.trim().replace(/:\d+$/, "");
}
function parseKimiTaggedToolCalls(text) {
	const trimmed = text.trim();
	if (!trimmed.startsWith(TOOL_CALLS_SECTION_BEGIN) || !trimmed.endsWith(TOOL_CALLS_SECTION_END)) return null;
	let cursor = 28;
	const sectionEndIndex = trimmed.length - 26;
	const toolCalls = [];
	while (cursor < sectionEndIndex) {
		while (cursor < sectionEndIndex && /\s/.test(trimmed[cursor] ?? "")) cursor += 1;
		if (cursor >= sectionEndIndex) break;
		if (!trimmed.startsWith(TOOL_CALL_BEGIN, cursor)) return null;
		const nameStart = cursor + 19;
		const argMarkerIndex = trimmed.indexOf(TOOL_CALL_ARGUMENT_BEGIN, nameStart);
		if (argMarkerIndex < 0 || argMarkerIndex >= sectionEndIndex) return null;
		const rawId = trimmed.slice(nameStart, argMarkerIndex).trim();
		if (!rawId) return null;
		const argsStart = argMarkerIndex + 28;
		const callEndIndex = trimmed.indexOf(TOOL_CALL_END, argsStart);
		if (callEndIndex < 0 || callEndIndex > sectionEndIndex) return null;
		const rawArgs = trimmed.slice(argsStart, callEndIndex).trim();
		let parsedArgs;
		try {
			parsedArgs = JSON.parse(rawArgs);
		} catch {
			return null;
		}
		if (!parsedArgs || typeof parsedArgs !== "object" || Array.isArray(parsedArgs)) return null;
		const name = stripTaggedToolCallCounter(rawId);
		if (!name) return null;
		toolCalls.push({
			type: "toolCall",
			id: rawId,
			name,
			arguments: parsedArgs
		});
		cursor = callEndIndex + 17;
	}
	return toolCalls.length > 0 ? toolCalls : null;
}
function rewriteKimiTaggedToolCallsInMessage(message) {
	if (!message || typeof message !== "object") return;
	const content = message.content;
	if (!Array.isArray(content)) return;
	let changed = false;
	const nextContent = [];
	for (const block of content) {
		if (!block || typeof block !== "object") {
			nextContent.push(block);
			continue;
		}
		const typedBlock = block;
		if (typedBlock.type !== "text" || typeof typedBlock.text !== "string") {
			nextContent.push(block);
			continue;
		}
		const parsed = parseKimiTaggedToolCalls(typedBlock.text);
		if (!parsed) {
			nextContent.push(block);
			continue;
		}
		nextContent.push(...parsed);
		changed = true;
	}
	if (!changed) return;
	message.content = nextContent;
	const typedMessage = message;
	if (typedMessage.stopReason === "stop") typedMessage.stopReason = "toolUse";
}
function wrapKimiTaggedToolCalls(stream) {
	const originalResult = stream.result.bind(stream);
	stream.result = async () => {
		const message = await originalResult();
		rewriteKimiTaggedToolCallsInMessage(message);
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
					rewriteKimiTaggedToolCallsInMessage(event.partial);
					rewriteKimiTaggedToolCallsInMessage(event.message);
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
function createKimiToolCallMarkupWrapper(baseStreamFn) {
	const underlying = baseStreamFn ?? streamSimple;
	return (model, context, options) => {
		const maybeStream = underlying(model, context, options);
		if (maybeStream && typeof maybeStream === "object" && "then" in maybeStream) return Promise.resolve(maybeStream).then((stream) => wrapKimiTaggedToolCalls(stream));
		return wrapKimiTaggedToolCalls(maybeStream);
	};
}
function wrapKimiProviderStream(ctx) {
	return createKimiToolCallMarkupWrapper(ctx.streamFn);
}
//#endregion
export { wrapKimiProviderStream as n, createKimiToolCallMarkupWrapper as t };
