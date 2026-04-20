import { i as formatErrorMessage } from "./errors-D8p6rxH8.js";
import { d as readStringValue, i as normalizeLowercaseStringOrEmpty } from "./string-coerce-BUSzWgUA.js";
import { t as createSubsystemLogger } from "./subsystem-Cgmckbux.js";
import { r as normalizeProviderId } from "./provider-id-KaStHhRz.js";
import "./defaults-CiQa3xnX.js";
import { u as isNonSecretApiKeyMarker } from "./model-auth-markers-ve-OgG6R.js";
import { n as resolveMoonshotThinkingType, r as streamWithPayloadPatch, t as createMoonshotThinkingWrapper } from "./moonshot-thinking-stream-wrappers-B057G_9z.js";
import { n as fetchWithSsrFGuard } from "./fetch-guard-B3p4gGaY.js";
import "./provider-model-shared-DyDnBaDe.js";
import "./provider-stream-shared-DisAYlnl.js";
import "./text-runtime-DTMxvodz.js";
import "./provider-auth-DWLaZig-.js";
import "./error-runtime-CgBDklBz.js";
import "./runtime-env-DjtBb0Ku.js";
import "./ssrf-runtime-CmuKDV7X.js";
import { t as buildOllamaBaseUrlSsrFPolicy, u as OLLAMA_DEFAULT_BASE_URL } from "./provider-models-DyhFa3ck.js";
import { randomUUID } from "node:crypto";
import { createAssistantMessageEventStream, streamSimple } from "@mariozechner/pi-ai";
//#region extensions/ollama/src/ollama-json.ts
const MAX_SAFE_INTEGER_ABS_STR = String(Number.MAX_SAFE_INTEGER);
function isAsciiDigit(ch) {
	return ch !== void 0 && ch >= "0" && ch <= "9";
}
function parseJsonNumberToken(input, start) {
	let idx = start;
	if (input[idx] === "-") idx += 1;
	if (idx >= input.length) return null;
	if (input[idx] === "0") idx += 1;
	else if (isAsciiDigit(input[idx]) && input[idx] !== "0") while (isAsciiDigit(input[idx])) idx += 1;
	else return null;
	let isInteger = true;
	if (input[idx] === ".") {
		isInteger = false;
		idx += 1;
		if (!isAsciiDigit(input[idx])) return null;
		while (isAsciiDigit(input[idx])) idx += 1;
	}
	if (input[idx] === "e" || input[idx] === "E") {
		isInteger = false;
		idx += 1;
		if (input[idx] === "+" || input[idx] === "-") idx += 1;
		if (!isAsciiDigit(input[idx])) return null;
		while (isAsciiDigit(input[idx])) idx += 1;
	}
	return {
		token: input.slice(start, idx),
		end: idx,
		isInteger
	};
}
function isUnsafeIntegerLiteral(token) {
	const digits = token[0] === "-" ? token.slice(1) : token;
	if (digits.length < MAX_SAFE_INTEGER_ABS_STR.length) return false;
	if (digits.length > MAX_SAFE_INTEGER_ABS_STR.length) return true;
	return digits > MAX_SAFE_INTEGER_ABS_STR;
}
function quoteUnsafeIntegerLiterals(input) {
	let out = "";
	let inString = false;
	let escaped = false;
	let idx = 0;
	while (idx < input.length) {
		const ch = input[idx] ?? "";
		if (inString) {
			out += ch;
			if (escaped) escaped = false;
			else if (ch === "\\") escaped = true;
			else if (ch === "\"") inString = false;
			idx += 1;
			continue;
		}
		if (ch === "\"") {
			inString = true;
			out += ch;
			idx += 1;
			continue;
		}
		if (ch === "-" || isAsciiDigit(ch)) {
			const parsed = parseJsonNumberToken(input, idx);
			if (parsed) {
				if (parsed.isInteger && isUnsafeIntegerLiteral(parsed.token)) out += `"${parsed.token}"`;
				else out += parsed.token;
				idx = parsed.end;
				continue;
			}
		}
		out += ch;
		idx += 1;
	}
	return out;
}
function parseJsonPreservingUnsafeIntegers(input) {
	return JSON.parse(quoteUnsafeIntegerLiterals(input));
}
function parseJsonObjectPreservingUnsafeIntegers(value) {
	if (typeof value === "string") {
		try {
			const parsed = parseJsonPreservingUnsafeIntegers(value);
			if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
		} catch {
			return null;
		}
		return null;
	}
	if (value && typeof value === "object" && !Array.isArray(value)) return value;
	return null;
}
//#endregion
//#region extensions/ollama/src/stream.ts
const log = createSubsystemLogger("ollama-stream");
const OLLAMA_NATIVE_BASE_URL = OLLAMA_DEFAULT_BASE_URL;
function resolveOllamaBaseUrlForRun(params) {
	const providerBaseUrl = params.providerBaseUrl?.trim();
	if (providerBaseUrl) return providerBaseUrl;
	const modelBaseUrl = params.modelBaseUrl?.trim();
	if (modelBaseUrl) return modelBaseUrl;
	return OLLAMA_NATIVE_BASE_URL;
}
function resolveConfiguredOllamaProviderConfig(params) {
	const providerId = params.providerId?.trim();
	if (!providerId) return;
	const providers = params.config?.models?.providers;
	if (!providers) return;
	const direct = providers[providerId];
	if (direct) return direct;
	const normalized = normalizeProviderId(providerId);
	for (const [candidateId, candidate] of Object.entries(providers)) if (normalizeProviderId(candidateId) === normalized) return candidate;
}
function isOllamaCompatProvider(model) {
	const providerId = normalizeProviderId(model.provider ?? "");
	if (providerId === "ollama") return true;
	if (!model.baseUrl) return false;
	try {
		const parsed = new URL(model.baseUrl);
		const hostname = normalizeLowercaseStringOrEmpty(parsed.hostname);
		if ((hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1" || hostname === "[::1]") && parsed.port === "11434") return true;
		const providerHintsOllama = providerId.includes("ollama");
		const isOllamaPort = parsed.port === "11434";
		const isOllamaCompatPath = parsed.pathname === "/" || /^\/v1\/?$/i.test(parsed.pathname);
		return providerHintsOllama && isOllamaPort && isOllamaCompatPath;
	} catch {
		return false;
	}
}
function resolveOllamaCompatNumCtxEnabled(params) {
	return resolveConfiguredOllamaProviderConfig(params)?.injectNumCtxForOpenAICompat ?? true;
}
function shouldInjectOllamaCompatNumCtx(params) {
	if (params.model.api !== "openai-completions") return false;
	if (!isOllamaCompatProvider(params.model)) return false;
	return resolveOllamaCompatNumCtxEnabled({
		config: params.config,
		providerId: params.providerId
	});
}
function wrapOllamaCompatNumCtx(baseFn, numCtx) {
	const streamFn = baseFn ?? streamSimple;
	return (model, context, options) => streamWithPayloadPatch(streamFn, model, context, options, (payloadRecord) => {
		if (!payloadRecord.options || typeof payloadRecord.options !== "object") payloadRecord.options = {};
		payloadRecord.options.num_ctx = numCtx;
		normalizeOllamaCompatMessageToolArgs(payloadRecord);
	});
}
function createOllamaThinkingWrapper(baseFn, think) {
	const streamFn = baseFn ?? streamSimple;
	return (model, context, options) => {
		if (model.api !== "ollama") return streamFn(model, context, options);
		return streamWithPayloadPatch(streamFn, model, context, options, (payloadRecord) => {
			payloadRecord.think = think;
		});
	};
}
function resolveOllamaCompatNumCtx(model) {
	return Math.max(1, Math.floor(model.contextWindow ?? model.maxTokens ?? 2e5));
}
function isOllamaCloudKimiModelRef(modelId) {
	const normalizedModelId = normalizeLowercaseStringOrEmpty(modelId);
	return normalizedModelId.startsWith("kimi-k") && normalizedModelId.includes(":cloud");
}
function createConfiguredOllamaCompatStreamWrapper(ctx) {
	let streamFn = ctx.streamFn;
	const model = ctx.model;
	let injectNumCtx = false;
	if (model) {
		const providerId = typeof model.provider === "string" && model.provider.trim().length > 0 ? model.provider : ctx.provider;
		if (shouldInjectOllamaCompatNumCtx({
			model,
			config: ctx.config,
			providerId
		})) injectNumCtx = true;
	}
	if (injectNumCtx && model) streamFn = wrapOllamaCompatNumCtx(streamFn, resolveOllamaCompatNumCtx(model));
	if (ctx.thinkingLevel === "off") streamFn = createOllamaThinkingWrapper(streamFn, false);
	else if (ctx.thinkingLevel) streamFn = createOllamaThinkingWrapper(streamFn, true);
	if (normalizeProviderId(ctx.provider) === "ollama" && isOllamaCloudKimiModelRef(ctx.modelId)) {
		const thinkingType = resolveMoonshotThinkingType({
			configuredThinking: ctx.extraParams?.thinking,
			thinkingLevel: ctx.thinkingLevel
		});
		streamFn = createMoonshotThinkingWrapper(streamFn, thinkingType);
	}
	return streamFn;
}
const createConfiguredOllamaCompatNumCtxWrapper = createConfiguredOllamaCompatStreamWrapper;
function normalizeOllamaWireModelId(modelId) {
	const trimmed = modelId.trim();
	return trimmed.startsWith("ollama/") ? trimmed.slice(7) : trimmed;
}
function buildOllamaChatRequest(params) {
	return {
		model: normalizeOllamaWireModelId(params.modelId),
		messages: params.messages,
		stream: params.stream ?? true,
		...params.tools && params.tools.length > 0 ? { tools: params.tools } : {},
		...params.options ? { options: params.options } : {}
	};
}
function buildUsageWithNoCost(params) {
	const input = params.input ?? 0;
	const output = params.output ?? 0;
	return {
		input,
		output,
		cacheRead: params.cacheRead ?? 0,
		cacheWrite: params.cacheWrite ?? 0,
		totalTokens: params.totalTokens ?? input + output,
		cost: {
			input: 0,
			output: 0,
			cacheRead: 0,
			cacheWrite: 0,
			total: 0
		}
	};
}
function buildStreamAssistantMessage(params) {
	return {
		role: "assistant",
		content: params.content,
		stopReason: params.stopReason,
		api: params.model.api,
		provider: params.model.provider,
		model: params.model.id,
		usage: params.usage,
		timestamp: params.timestamp ?? Date.now()
	};
}
function buildStreamErrorAssistantMessage(params) {
	return {
		...buildStreamAssistantMessage({
			model: params.model,
			content: [],
			stopReason: "error",
			usage: buildUsageWithNoCost({}),
			timestamp: params.timestamp
		}),
		stopReason: "error",
		errorMessage: params.errorMessage
	};
}
function extractTextContent(content) {
	if (typeof content === "string") return content;
	if (!Array.isArray(content)) return "";
	return content.filter((part) => part.type === "text").map((part) => part.text).join("");
}
function extractOllamaImages(content) {
	if (!Array.isArray(content)) return [];
	return content.filter((part) => part.type === "image").map((part) => part.data);
}
function ensureArgsObject(value) {
	return parseJsonObjectPreservingUnsafeIntegers(value) ?? {};
}
function normalizeOllamaCompatMessageToolArgs(payloadRecord) {
	const messages = payloadRecord.messages;
	if (!Array.isArray(messages)) return;
	for (const message of messages) {
		if (!message || typeof message !== "object" || Array.isArray(message)) continue;
		const messageRecord = message;
		const functionCall = messageRecord.function_call;
		if (functionCall && typeof functionCall === "object" && !Array.isArray(functionCall)) {
			const functionCallRecord = functionCall;
			if (Object.hasOwn(functionCallRecord, "arguments")) functionCallRecord.arguments = ensureArgsObject(functionCallRecord.arguments);
		}
		const toolCalls = messageRecord.tool_calls;
		if (!Array.isArray(toolCalls)) continue;
		for (const toolCall of toolCalls) {
			if (!toolCall || typeof toolCall !== "object" || Array.isArray(toolCall)) continue;
			const functionSpec = toolCall.function;
			if (!functionSpec || typeof functionSpec !== "object" || Array.isArray(functionSpec)) continue;
			const functionRecord = functionSpec;
			if (Object.hasOwn(functionRecord, "arguments")) functionRecord.arguments = ensureArgsObject(functionRecord.arguments);
		}
	}
}
function extractToolCalls(content) {
	if (!Array.isArray(content)) return [];
	const parts = content;
	const result = [];
	for (const part of parts) if (part.type === "toolCall") result.push({ function: {
		name: part.name,
		arguments: ensureArgsObject(part.arguments)
	} });
	else if (part.type === "tool_use") result.push({ function: {
		name: part.name,
		arguments: ensureArgsObject(part.input)
	} });
	return result;
}
function convertToOllamaMessages(messages, system) {
	const result = [];
	if (system) result.push({
		role: "system",
		content: system
	});
	for (const msg of messages) {
		if (msg.role === "user") {
			const text = extractTextContent(msg.content);
			const images = extractOllamaImages(msg.content);
			result.push({
				role: "user",
				content: text,
				...images.length > 0 ? { images } : {}
			});
			continue;
		}
		if (msg.role === "assistant") {
			const text = extractTextContent(msg.content);
			const toolCalls = extractToolCalls(msg.content);
			result.push({
				role: "assistant",
				content: text,
				...toolCalls.length > 0 ? { tool_calls: toolCalls } : {}
			});
			continue;
		}
		if (msg.role === "tool" || msg.role === "toolResult") {
			const text = extractTextContent(msg.content);
			const toolName = typeof msg.toolName === "string" ? msg.toolName : void 0;
			result.push({
				role: "tool",
				content: text,
				...toolName ? { tool_name: toolName } : {}
			});
		}
	}
	return result;
}
function extractOllamaTools(tools) {
	if (!tools || !Array.isArray(tools)) return [];
	const result = [];
	for (const tool of tools) {
		if (typeof tool.name !== "string" || !tool.name) continue;
		result.push({
			type: "function",
			function: {
				name: tool.name,
				description: typeof tool.description === "string" ? tool.description : "",
				parameters: tool.parameters ?? {}
			}
		});
	}
	return result;
}
function buildAssistantMessage(response, modelInfo) {
	const content = [];
	const thinking = response.message.thinking ?? response.message.reasoning ?? "";
	if (thinking) content.push({
		type: "thinking",
		thinking
	});
	const text = response.message.content || "";
	if (text) content.push({
		type: "text",
		text
	});
	const toolCalls = response.message.tool_calls;
	if (toolCalls && toolCalls.length > 0) for (const toolCall of toolCalls) content.push({
		type: "toolCall",
		id: `ollama_call_${randomUUID()}`,
		name: toolCall.function.name,
		arguments: toolCall.function.arguments
	});
	return buildStreamAssistantMessage({
		model: modelInfo,
		content,
		stopReason: toolCalls && toolCalls.length > 0 ? "toolUse" : "stop",
		usage: buildUsageWithNoCost({
			input: response.prompt_eval_count ?? 0,
			output: response.eval_count ?? 0
		})
	});
}
async function* parseNdjsonStream(reader) {
	const decoder = new TextDecoder();
	let buffer = "";
	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		buffer += decoder.decode(value, { stream: true });
		const lines = buffer.split("\n");
		buffer = lines.pop() ?? "";
		for (const line of lines) {
			const trimmed = line.trim();
			if (!trimmed) continue;
			try {
				yield parseJsonPreservingUnsafeIntegers(trimmed);
			} catch {
				log.warn(`Skipping malformed NDJSON line: ${trimmed.slice(0, 120)}`);
			}
		}
	}
	if (buffer.trim()) try {
		yield parseJsonPreservingUnsafeIntegers(buffer.trim());
	} catch {
		log.warn(`Skipping malformed trailing data: ${buffer.trim().slice(0, 120)}`);
	}
}
function resolveOllamaChatUrl(baseUrl) {
	return `${baseUrl.trim().replace(/\/+$/, "").replace(/\/v1$/i, "") || OLLAMA_NATIVE_BASE_URL}/api/chat`;
}
function resolveOllamaModelHeaders(model) {
	if (!model.headers || typeof model.headers !== "object" || Array.isArray(model.headers)) return;
	return model.headers;
}
function createOllamaStreamFn(baseUrl, defaultHeaders) {
	const chatUrl = resolveOllamaChatUrl(baseUrl);
	const ssrfPolicy = buildOllamaBaseUrlSsrFPolicy(chatUrl);
	return (model, context, options) => {
		const stream = createAssistantMessageEventStream();
		const run = async () => {
			try {
				const ollamaMessages = convertToOllamaMessages(context.messages ?? [], context.systemPrompt);
				const ollamaTools = extractOllamaTools(context.tools);
				const ollamaOptions = { num_ctx: model.contextWindow ?? 65536 };
				if (typeof options?.temperature === "number") ollamaOptions.temperature = options.temperature;
				if (typeof options?.maxTokens === "number") ollamaOptions.num_predict = options.maxTokens;
				const body = buildOllamaChatRequest({
					modelId: model.id,
					messages: ollamaMessages,
					stream: true,
					tools: ollamaTools,
					options: ollamaOptions
				});
				options?.onPayload?.(body, model);
				const headers = {
					"Content-Type": "application/json",
					...defaultHeaders,
					...options?.headers
				};
				if (options?.apiKey && (!headers.Authorization || !isNonSecretApiKeyMarker(options.apiKey))) headers.Authorization = `Bearer ${options.apiKey}`;
				const { response, release } = await fetchWithSsrFGuard({
					url: chatUrl,
					init: {
						method: "POST",
						headers,
						body: JSON.stringify(body),
						signal: options?.signal
					},
					policy: ssrfPolicy,
					auditContext: "ollama-stream.chat"
				});
				try {
					if (!response.ok) {
						const errorText = await response.text().catch(() => "unknown error");
						throw new Error(`${response.status} ${errorText}`);
					}
					if (!response.body) throw new Error("Ollama API returned empty response body");
					const reader = response.body.getReader();
					let accumulatedContent = "";
					let accumulatedThinking = "";
					const accumulatedToolCalls = [];
					let finalResponse;
					const modelInfo = {
						api: model.api,
						provider: model.provider,
						id: model.id
					};
					let streamStarted = false;
					let thinkingStarted = false;
					let thinkingEnded = false;
					let textBlockStarted = false;
					let textBlockClosed = false;
					const textContentIndex = () => thinkingStarted ? 1 : 0;
					const buildCurrentContent = () => {
						const parts = [];
						if (accumulatedThinking) parts.push({
							type: "thinking",
							thinking: accumulatedThinking
						});
						if (accumulatedContent) parts.push({
							type: "text",
							text: accumulatedContent
						});
						return parts;
					};
					const closeThinkingBlock = () => {
						if (!thinkingStarted || thinkingEnded) return;
						thinkingEnded = true;
						const partial = buildStreamAssistantMessage({
							model: modelInfo,
							content: buildCurrentContent(),
							stopReason: "stop",
							usage: buildUsageWithNoCost({})
						});
						stream.push({
							type: "thinking_end",
							contentIndex: 0,
							content: accumulatedThinking,
							partial
						});
					};
					const closeTextBlock = () => {
						if (!textBlockStarted || textBlockClosed) return;
						textBlockClosed = true;
						const partial = buildStreamAssistantMessage({
							model: modelInfo,
							content: buildCurrentContent(),
							stopReason: "stop",
							usage: buildUsageWithNoCost({})
						});
						stream.push({
							type: "text_end",
							contentIndex: textContentIndex(),
							content: accumulatedContent,
							partial
						});
					};
					for await (const chunk of parseNdjsonStream(reader)) {
						const thinkingDelta = chunk.message?.thinking ?? chunk.message?.reasoning;
						if (thinkingDelta) {
							if (!streamStarted) {
								streamStarted = true;
								const emptyPartial = buildStreamAssistantMessage({
									model: modelInfo,
									content: [],
									stopReason: "stop",
									usage: buildUsageWithNoCost({})
								});
								stream.push({
									type: "start",
									partial: emptyPartial
								});
							}
							if (!thinkingStarted) {
								thinkingStarted = true;
								const partial = buildStreamAssistantMessage({
									model: modelInfo,
									content: buildCurrentContent(),
									stopReason: "stop",
									usage: buildUsageWithNoCost({})
								});
								stream.push({
									type: "thinking_start",
									contentIndex: 0,
									partial
								});
							}
							accumulatedThinking += thinkingDelta;
							const partial = buildStreamAssistantMessage({
								model: modelInfo,
								content: buildCurrentContent(),
								stopReason: "stop",
								usage: buildUsageWithNoCost({})
							});
							stream.push({
								type: "thinking_delta",
								contentIndex: 0,
								delta: thinkingDelta,
								partial
							});
						}
						if (chunk.message?.content) {
							const delta = chunk.message.content;
							if (thinkingStarted && !thinkingEnded) closeThinkingBlock();
							if (!streamStarted) {
								streamStarted = true;
								const emptyPartial = buildStreamAssistantMessage({
									model: modelInfo,
									content: [],
									stopReason: "stop",
									usage: buildUsageWithNoCost({})
								});
								stream.push({
									type: "start",
									partial: emptyPartial
								});
							}
							if (!textBlockStarted) {
								textBlockStarted = true;
								const partial = buildStreamAssistantMessage({
									model: modelInfo,
									content: buildCurrentContent(),
									stopReason: "stop",
									usage: buildUsageWithNoCost({})
								});
								stream.push({
									type: "text_start",
									contentIndex: textContentIndex(),
									partial
								});
							}
							accumulatedContent += delta;
							const partial = buildStreamAssistantMessage({
								model: modelInfo,
								content: buildCurrentContent(),
								stopReason: "stop",
								usage: buildUsageWithNoCost({})
							});
							stream.push({
								type: "text_delta",
								contentIndex: textContentIndex(),
								delta,
								partial
							});
						}
						if (chunk.message?.tool_calls) {
							closeThinkingBlock();
							closeTextBlock();
							accumulatedToolCalls.push(...chunk.message.tool_calls);
						}
						if (chunk.done) {
							finalResponse = chunk;
							break;
						}
					}
					if (!finalResponse) throw new Error("Ollama API stream ended without a final response");
					finalResponse.message.content = accumulatedContent;
					if (accumulatedThinking) finalResponse.message.thinking = accumulatedThinking;
					if (accumulatedToolCalls.length > 0) finalResponse.message.tool_calls = accumulatedToolCalls;
					const assistantMessage = buildAssistantMessage(finalResponse, modelInfo);
					closeThinkingBlock();
					closeTextBlock();
					stream.push({
						type: "done",
						reason: assistantMessage.stopReason === "toolUse" ? "toolUse" : "stop",
						message: assistantMessage
					});
				} finally {
					await release();
				}
			} catch (err) {
				stream.push({
					type: "error",
					reason: "error",
					error: buildStreamErrorAssistantMessage({
						model,
						errorMessage: formatErrorMessage(err)
					})
				});
			} finally {
				stream.end();
			}
		};
		queueMicrotask(() => void run());
		return stream;
	};
}
function createConfiguredOllamaStreamFn(params) {
	return createOllamaStreamFn(resolveOllamaBaseUrlForRun({
		modelBaseUrl: readStringValue(params.model.baseUrl),
		providerBaseUrl: params.providerBaseUrl
	}), resolveOllamaModelHeaders(params.model));
}
//#endregion
export { createConfiguredOllamaCompatNumCtxWrapper as a, createOllamaStreamFn as c, resolveConfiguredOllamaProviderConfig as d, resolveOllamaBaseUrlForRun as f, wrapOllamaCompatNumCtx as h, convertToOllamaMessages as i, isOllamaCompatProvider as l, shouldInjectOllamaCompatNumCtx as m, buildAssistantMessage as n, createConfiguredOllamaCompatStreamWrapper as o, resolveOllamaCompatNumCtxEnabled as p, buildOllamaChatRequest as r, createConfiguredOllamaStreamFn as s, OLLAMA_NATIVE_BASE_URL as t, parseNdjsonStream as u };
