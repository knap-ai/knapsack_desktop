import { isGoogleGemini25ThinkingBudgetModel, isGoogleGemini3FlashModel, isGoogleGemini3ProModel, resolveGoogleGemini3ThinkingLevel, stripInvalidGoogleThinkingBudget } from "./thinking.js";
import "./thinking-api.js";
import { normalizeGoogleApiBaseUrl } from "./provider-policy.js";
import { parseGeminiAuth } from "./gemini-auth.js";
import { normalizeLowercaseStringOrEmpty } from "openclaw/plugin-sdk/text-runtime";
import { createProviderHttpError } from "openclaw/plugin-sdk/provider-http";
import { calculateCost, getEnvApiKey } from "@mariozechner/pi-ai";
import { buildGuardedModelFetch, coerceTransportToolCallArguments, createEmptyTransportUsage, createWritableTransportEventStream, failTransportStream, finalizeTransportStream, mergeTransportHeaders, sanitizeTransportPayloadText, stripSystemPromptCacheBoundary, transformTransportMessages } from "openclaw/plugin-sdk/provider-transport-runtime";
//#region extensions/google/transport-stream.ts
let toolCallCounter = 0;
function requiresToolCallId(modelId) {
	return modelId.startsWith("claude-") || modelId.startsWith("gpt-oss-");
}
function supportsMultimodalFunctionResponse(modelId) {
	const match = normalizeLowercaseStringOrEmpty(modelId).match(/^gemini(?:-live)?-(\d+)/);
	if (!match) return true;
	return Number.parseInt(match[1] ?? "", 10) >= 3;
}
function retainThoughtSignature(existing, incoming) {
	if (typeof incoming === "string" && incoming.length > 0) return incoming;
	return existing;
}
function mapToolChoice(choice) {
	if (!choice) return;
	if (typeof choice === "object" && choice.type === "function") return {
		mode: "ANY",
		allowedFunctionNames: [choice.function.name]
	};
	switch (choice) {
		case "none": return { mode: "NONE" };
		case "any":
		case "required": return { mode: "ANY" };
		default: return { mode: "AUTO" };
	}
}
function mapStopReasonString(reason) {
	switch (reason) {
		case "STOP": return "stop";
		case "MAX_TOKENS": return "length";
		default: return "error";
	}
}
function normalizeToolCallId(id) {
	return id.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 64);
}
function resolveGoogleModelPath(modelId) {
	if (modelId.startsWith("models/") || modelId.startsWith("tunedModels/")) return modelId;
	return `models/${modelId}`;
}
function buildGoogleRequestUrl(model) {
	return `${normalizeGoogleApiBaseUrl(model.baseUrl)}/${resolveGoogleModelPath(model.id)}:streamGenerateContent?alt=sse`;
}
function resolveThinkingLevel(level, modelId) {
	const resolved = resolveGoogleGemini3ThinkingLevel({
		modelId,
		thinkingLevel: level
	});
	if (resolved) return resolved;
	throw new Error("Unsupported thinking level");
}
function resolveExplicitThinkingLevel(level, modelId) {
	return resolveGoogleGemini3ThinkingLevel({
		modelId,
		thinkingLevel: level.toLowerCase()
	}) ?? level;
}
function getDisabledThinkingConfig(modelId) {
	const thinkingLevel = resolveGoogleGemini3ThinkingLevel({
		modelId,
		thinkingLevel: "off"
	});
	if (thinkingLevel) return { thinkingLevel };
	return normalizeGoogleThinkingConfig(modelId, { thinkingBudget: 0 });
}
function getGoogleThinkingBudget(modelId, effort, customBudgets) {
	const normalizedEffort = effort === "xhigh" ? "high" : effort;
	if (customBudgets?.[normalizedEffort] !== void 0) return customBudgets[normalizedEffort];
	if (modelId.includes("2.5-pro")) return {
		minimal: 128,
		low: 2048,
		medium: 8192,
		high: 32768
	}[normalizedEffort];
	if (modelId.includes("2.5-flash")) return {
		minimal: 128,
		low: 2048,
		medium: 8192,
		high: 24576
	}[normalizedEffort];
}
function isAdaptiveReasoningLevel(value) {
	return value === "adaptive";
}
function resolveGoogleThinkingConfig(model, options) {
	if (!model.reasoning) return;
	if (options?.thinking) {
		if (!options.thinking.enabled) return getDisabledThinkingConfig(model.id);
		const config = { includeThoughts: true };
		if (options.thinking.level) config.thinkingLevel = resolveExplicitThinkingLevel(options.thinking.level, model.id);
		else if (typeof options.thinking.budgetTokens === "number") {
			const thinkingLevel = resolveGoogleGemini3ThinkingLevel({
				modelId: model.id,
				thinkingBudget: options.thinking.budgetTokens
			});
			if (thinkingLevel) config.thinkingLevel = thinkingLevel;
			else config.thinkingBudget = options.thinking.budgetTokens;
		}
		return normalizeGoogleThinkingConfig(model.id, config);
	}
	if (!options?.reasoning) return getDisabledThinkingConfig(model.id);
	if (isAdaptiveReasoningLevel(options.reasoning)) {
		if (isGoogleGemini3ProModel(model.id) || isGoogleGemini3FlashModel(model.id)) return { includeThoughts: true };
		if (isGoogleGemini25ThinkingBudgetModel(model.id)) return normalizeGoogleThinkingConfig(model.id, {
			includeThoughts: true,
			thinkingBudget: -1
		});
	}
	if (isGoogleGemini3ProModel(model.id) || isGoogleGemini3FlashModel(model.id)) return {
		includeThoughts: true,
		thinkingLevel: resolveThinkingLevel(options.reasoning, model.id)
	};
	const budget = getGoogleThinkingBudget(model.id, options.reasoning, options.thinkingBudgets);
	return normalizeGoogleThinkingConfig(model.id, {
		includeThoughts: true,
		...typeof budget === "number" ? { thinkingBudget: budget } : {}
	});
}
function normalizeGoogleThinkingConfig(modelId, thinkingConfig) {
	stripInvalidGoogleThinkingBudget({
		thinkingConfig,
		modelId
	});
	return Object.keys(thinkingConfig).length > 0 ? thinkingConfig : void 0;
}
function convertGoogleMessages(model, context) {
	const contents = [];
	const transformedMessages = transformTransportMessages(context.messages, model, (id) => requiresToolCallId(model.id) ? normalizeToolCallId(id) : id);
	for (const msg of transformedMessages) {
		if (msg.role === "user") {
			if (typeof msg.content === "string") {
				contents.push({
					role: "user",
					parts: [{ text: sanitizeTransportPayloadText(msg.content) }]
				});
				continue;
			}
			const parts = msg.content.map((item) => item.type === "text" ? { text: sanitizeTransportPayloadText(item.text) } : { inlineData: {
				mimeType: item.mimeType,
				data: item.data
			} }).filter((item) => model.input.includes("image") || !("inlineData" in item));
			if (parts.length > 0) contents.push({
				role: "user",
				parts
			});
			continue;
		}
		if (msg.role === "assistant") {
			const isSameProviderAndModel = msg.provider === model.provider && msg.model === model.id;
			const parts = [];
			for (const block of msg.content) {
				if (block.type === "text") {
					if (!block.text.trim()) continue;
					parts.push({
						text: sanitizeTransportPayloadText(block.text),
						...isSameProviderAndModel && block.textSignature ? { thoughtSignature: block.textSignature } : {}
					});
					continue;
				}
				if (block.type === "thinking") {
					if (!block.thinking.trim()) continue;
					if (isSameProviderAndModel) parts.push({
						thought: true,
						text: sanitizeTransportPayloadText(block.thinking),
						...block.thinkingSignature ? { thoughtSignature: block.thinkingSignature } : {}
					});
					else parts.push({ text: sanitizeTransportPayloadText(block.thinking) });
					continue;
				}
				if (block.type === "toolCall") parts.push({
					functionCall: {
						name: block.name,
						args: coerceTransportToolCallArguments(block.arguments),
						...requiresToolCallId(model.id) ? { id: block.id } : {}
					},
					...isSameProviderAndModel && block.thoughtSignature ? { thoughtSignature: block.thoughtSignature } : {}
				});
			}
			if (parts.length > 0) contents.push({
				role: "model",
				parts
			});
			continue;
		}
		if (msg.role === "toolResult") {
			const textResult = msg.content.filter((item) => item.type === "text").map((item) => item.text).join("\n");
			const imageContent = model.input.includes("image") ? msg.content.filter((item) => item.type === "image") : [];
			const responseValue = textResult ? sanitizeTransportPayloadText(textResult) : imageContent.length > 0 ? "(see attached image)" : "";
			const imageParts = imageContent.map((imageBlock) => ({ inlineData: {
				mimeType: imageBlock.mimeType,
				data: imageBlock.data
			} }));
			const functionResponse = { functionResponse: {
				name: msg.toolName,
				response: msg.isError ? { error: responseValue } : { output: responseValue },
				...supportsMultimodalFunctionResponse(model.id) && imageParts.length > 0 ? { parts: imageParts } : {},
				...requiresToolCallId(model.id) ? { id: msg.toolCallId } : {}
			} };
			const last = contents[contents.length - 1];
			if (last?.role === "user" && Array.isArray(last.parts) && last.parts.some((part) => "functionResponse" in part)) last.parts.push(functionResponse);
			else contents.push({
				role: "user",
				parts: [functionResponse]
			});
			if (imageParts.length > 0 && !supportsMultimodalFunctionResponse(model.id)) contents.push({
				role: "user",
				parts: [{ text: "Tool result image:" }, ...imageParts]
			});
		}
	}
	return contents;
}
function convertGoogleTools(tools) {
	if (tools.length === 0) return;
	return [{ functionDeclarations: tools.map((tool) => ({
		name: tool.name,
		description: tool.description,
		parametersJsonSchema: tool.parameters
	})) }];
}
function buildGoogleGenerativeAiParams(model, context, options) {
	const generationConfig = {};
	if (typeof options?.temperature === "number") generationConfig.temperature = options.temperature;
	if (typeof options?.maxTokens === "number") generationConfig.maxOutputTokens = options.maxTokens;
	const thinkingConfig = resolveGoogleThinkingConfig(model, options);
	if (thinkingConfig) generationConfig.thinkingConfig = thinkingConfig;
	const params = { contents: convertGoogleMessages(model, context) };
	if (typeof options?.cachedContent === "string" && options.cachedContent.trim()) params.cachedContent = options.cachedContent.trim();
	if (Object.keys(generationConfig).length > 0) params.generationConfig = generationConfig;
	if (context.systemPrompt) params.systemInstruction = { parts: [{ text: sanitizeTransportPayloadText(stripSystemPromptCacheBoundary(context.systemPrompt)) }] };
	if (context.tools?.length) {
		params.tools = convertGoogleTools(context.tools);
		const toolChoice = mapToolChoice(options?.toolChoice);
		if (toolChoice) params.toolConfig = { functionCallingConfig: toolChoice };
	}
	return params;
}
function buildGoogleHeaders(model, apiKey, optionHeaders) {
	return mergeTransportHeaders({ accept: "text/event-stream" }, apiKey ? parseGeminiAuth(apiKey).headers : void 0, model.headers, optionHeaders) ?? { accept: "text/event-stream" };
}
async function* parseGoogleSseChunks(response, signal) {
	if (!response.body) throw new Error("No response body");
	const reader = response.body.getReader();
	const decoder = new TextDecoder();
	let buffer = "";
	const abortHandler = () => {
		reader.cancel().catch(() => void 0);
	};
	signal?.addEventListener("abort", abortHandler);
	try {
		while (true) {
			if (signal?.aborted) throw new Error("Request was aborted");
			const { done, value } = await reader.read();
			if (done) break;
			buffer += decoder.decode(value, { stream: true }).replace(/\r/g, "");
			let boundary = buffer.indexOf("\n\n");
			while (boundary >= 0) {
				const rawEvent = buffer.slice(0, boundary);
				buffer = buffer.slice(boundary + 2);
				boundary = buffer.indexOf("\n\n");
				const data = rawEvent.split("\n").filter((line) => line.startsWith("data:")).map((line) => line.slice(5).trim()).join("\n");
				if (!data || data === "[DONE]") continue;
				yield JSON.parse(data);
			}
		}
	} finally {
		signal?.removeEventListener("abort", abortHandler);
	}
}
function updateUsage(output, model, chunk) {
	const usage = chunk.usageMetadata;
	if (!usage) return;
	const promptTokens = usage.promptTokenCount || 0;
	const cacheRead = usage.cachedContentTokenCount || 0;
	output.usage = {
		input: Math.max(0, promptTokens - cacheRead),
		output: (usage.candidatesTokenCount || 0) + (usage.thoughtsTokenCount || 0),
		cacheRead,
		cacheWrite: 0,
		totalTokens: usage.totalTokenCount || 0,
		cost: {
			input: 0,
			output: 0,
			cacheRead: 0,
			cacheWrite: 0,
			total: 0
		}
	};
	calculateCost(model, output.usage);
}
function pushTextBlockEnd(stream, output, blockIndex) {
	const block = output.content[blockIndex];
	if (!block) return;
	if (block.type === "thinking") {
		stream.push({
			type: "thinking_end",
			contentIndex: blockIndex,
			content: block.thinking,
			partial: output
		});
		return;
	}
	if (block.type === "text") stream.push({
		type: "text_end",
		contentIndex: blockIndex,
		content: block.text,
		partial: output
	});
}
function createGoogleGenerativeAiTransportStreamFn() {
	return (rawModel, context, rawOptions) => {
		const model = rawModel;
		const options = rawOptions;
		const { eventStream, stream } = createWritableTransportEventStream();
		(async () => {
			const output = {
				role: "assistant",
				content: [],
				api: "google-generative-ai",
				provider: model.provider,
				model: model.id,
				usage: createEmptyTransportUsage(),
				stopReason: "stop",
				timestamp: Date.now()
			};
			try {
				const apiKey = options?.apiKey ?? getEnvApiKey(model.provider) ?? void 0;
				const guardedFetch = buildGuardedModelFetch(model);
				let params = buildGoogleGenerativeAiParams(model, context, options);
				const nextParams = await options?.onPayload?.(params, model);
				if (nextParams !== void 0) params = nextParams;
				const response = await guardedFetch(buildGoogleRequestUrl(model), {
					method: "POST",
					headers: buildGoogleHeaders(model, apiKey, options?.headers),
					body: JSON.stringify(params),
					signal: options?.signal
				});
				if (!response.ok) throw await createProviderHttpError(response, "Google Generative AI API error");
				stream.push({
					type: "start",
					partial: output
				});
				let currentBlockIndex = -1;
				for await (const chunk of parseGoogleSseChunks(response, options?.signal)) {
					output.responseId ||= chunk.responseId;
					updateUsage(output, model, chunk);
					const candidate = chunk.candidates?.[0];
					if (candidate?.content?.parts) for (const part of candidate.content.parts) {
						if (typeof part.text === "string") {
							const isThinking = part.thought === true;
							const currentBlock = output.content[currentBlockIndex];
							if (currentBlockIndex < 0 || !currentBlock || isThinking && currentBlock.type !== "thinking" || !isThinking && currentBlock.type !== "text") {
								if (currentBlockIndex >= 0) pushTextBlockEnd(stream, output, currentBlockIndex);
								if (isThinking) {
									output.content.push({
										type: "thinking",
										thinking: ""
									});
									currentBlockIndex = output.content.length - 1;
									stream.push({
										type: "thinking_start",
										contentIndex: currentBlockIndex,
										partial: output
									});
								} else {
									output.content.push({
										type: "text",
										text: ""
									});
									currentBlockIndex = output.content.length - 1;
									stream.push({
										type: "text_start",
										contentIndex: currentBlockIndex,
										partial: output
									});
								}
							}
							const activeBlock = output.content[currentBlockIndex];
							if (activeBlock?.type === "thinking") {
								activeBlock.thinking += part.text;
								activeBlock.thinkingSignature = retainThoughtSignature(activeBlock.thinkingSignature, part.thoughtSignature);
								stream.push({
									type: "thinking_delta",
									contentIndex: currentBlockIndex,
									delta: part.text,
									partial: output
								});
							} else if (activeBlock?.type === "text") {
								activeBlock.text += part.text;
								activeBlock.textSignature = retainThoughtSignature(activeBlock.textSignature, part.thoughtSignature);
								stream.push({
									type: "text_delta",
									contentIndex: currentBlockIndex,
									delta: part.text,
									partial: output
								});
							}
						}
						if (part.functionCall) {
							if (currentBlockIndex >= 0) {
								pushTextBlockEnd(stream, output, currentBlockIndex);
								currentBlockIndex = -1;
							}
							const providedId = part.functionCall.id;
							const isDuplicate = output.content.some((block) => block.type === "toolCall" && block.id === providedId);
							const toolCall = {
								type: "toolCall",
								id: providedId && !isDuplicate ? providedId : `${part.functionCall.name || "tool"}_${Date.now()}_${++toolCallCounter}`,
								name: part.functionCall.name || "",
								arguments: part.functionCall.args ?? {},
								thoughtSignature: part.thoughtSignature
							};
							output.content.push(toolCall);
							const blockIndex = output.content.length - 1;
							stream.push({
								type: "toolcall_start",
								contentIndex: blockIndex,
								partial: output
							});
							stream.push({
								type: "toolcall_delta",
								contentIndex: blockIndex,
								delta: JSON.stringify(toolCall.arguments),
								partial: output
							});
							stream.push({
								type: "toolcall_end",
								contentIndex: blockIndex,
								toolCall,
								partial: output
							});
						}
					}
					if (typeof candidate?.finishReason === "string") {
						output.stopReason = mapStopReasonString(candidate.finishReason);
						if (output.content.some((block) => block.type === "toolCall")) output.stopReason = "toolUse";
					}
				}
				if (currentBlockIndex >= 0) pushTextBlockEnd(stream, output, currentBlockIndex);
				finalizeTransportStream({
					stream,
					output,
					signal: options?.signal
				});
			} catch (error) {
				failTransportStream({
					stream,
					output,
					signal: options?.signal,
					error
				});
			}
		})();
		return eventStream;
	};
}
//#endregion
export { buildGoogleGenerativeAiParams, createGoogleGenerativeAiTransportStreamFn };
