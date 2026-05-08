import { r as resolveDebugProxySettings } from "./env-SyWbZ-M-.js";
import { n as fetchWithSsrFGuard } from "./fetch-guard-8smVA_M-.js";
import { a as mergeModelProviderRequestOverrides, c as resolveProviderRequestPolicyConfig, i as getModelProviderRequestTransport, n as buildProviderRequestDispatcherPolicy } from "./provider-request-config-R6tp_Cvt.js";
import { n as repairToolUseResultPairing } from "./session-transcript-repair-D9T_omS-.js";
import { createAssistantMessageEventStream } from "@mariozechner/pi-ai";
//#region src/agents/provider-transport-fetch.ts
const DEFAULT_MAX_SDK_RETRY_WAIT_SECONDS = 60;
function parseRetryAfterSeconds(headers) {
	const retryAfterMs = headers.get("retry-after-ms");
	if (retryAfterMs) {
		const milliseconds = Number.parseFloat(retryAfterMs);
		if (Number.isFinite(milliseconds) && milliseconds >= 0) return milliseconds / 1e3;
	}
	const retryAfter = headers.get("retry-after");
	if (!retryAfter) return;
	const seconds = Number.parseFloat(retryAfter);
	if (Number.isFinite(seconds) && seconds >= 0) return seconds;
	const retryAt = Date.parse(retryAfter);
	if (Number.isNaN(retryAt)) return;
	return Math.max(0, (retryAt - Date.now()) / 1e3);
}
function resolveMaxSdkRetryWaitSeconds() {
	const raw = process.env.OPENCLAW_SDK_RETRY_MAX_WAIT_SECONDS?.trim();
	if (!raw) return DEFAULT_MAX_SDK_RETRY_WAIT_SECONDS;
	if (/^(?:0|false|off|none|disabled)$/i.test(raw)) return;
	const seconds = Number.parseFloat(raw);
	if (Number.isFinite(seconds) && seconds > 0) return seconds;
	return DEFAULT_MAX_SDK_RETRY_WAIT_SECONDS;
}
function shouldBypassLongSdkRetry(response) {
	const maxWaitSeconds = resolveMaxSdkRetryWaitSeconds();
	if (maxWaitSeconds === void 0) return false;
	const status = response.status;
	if (!(status === 408 || status === 409 || status === 429 || status >= 500)) return false;
	const retryAfterSeconds = parseRetryAfterSeconds(response.headers);
	if (retryAfterSeconds !== void 0) return retryAfterSeconds > maxWaitSeconds;
	return status === 429;
}
function buildManagedResponse(response, release) {
	if (!response.body) {
		release();
		return response;
	}
	const source = response.body;
	let reader;
	let released = false;
	const finalize = async () => {
		if (released) return;
		released = true;
		await release().catch(() => void 0);
	};
	const wrappedBody = new ReadableStream({
		start() {
			reader = source.getReader();
		},
		async pull(controller) {
			try {
				const chunk = await reader?.read();
				if (!chunk || chunk.done) {
					controller.close();
					await finalize();
					return;
				}
				controller.enqueue(chunk.value);
			} catch (error) {
				controller.error(error);
				await finalize();
			}
		},
		async cancel(reason) {
			try {
				await reader?.cancel(reason);
			} finally {
				await finalize();
			}
		}
	});
	return new Response(wrappedBody, {
		status: response.status,
		statusText: response.statusText,
		headers: response.headers
	});
}
function resolveModelRequestPolicy(model) {
	const debugProxy = resolveDebugProxySettings();
	let explicitDebugProxyUrl;
	if (debugProxy.enabled && debugProxy.proxyUrl) try {
		if (new URL(model.baseUrl).protocol === "https:") explicitDebugProxyUrl = debugProxy.proxyUrl;
	} catch {}
	const request = mergeModelProviderRequestOverrides(getModelProviderRequestTransport(model), { proxy: explicitDebugProxyUrl ? {
		mode: "explicit-proxy",
		url: explicitDebugProxyUrl
	} : void 0 });
	return resolveProviderRequestPolicyConfig({
		provider: model.provider,
		api: model.api,
		baseUrl: model.baseUrl,
		capability: "llm",
		transport: "stream",
		request
	});
}
function resolveModelRequestTimeoutMs(model, timeoutMs) {
	if (timeoutMs !== void 0) return timeoutMs;
	const modelTimeoutMs = model.requestTimeoutMs;
	return typeof modelTimeoutMs === "number" && Number.isFinite(modelTimeoutMs) && modelTimeoutMs > 0 ? Math.floor(modelTimeoutMs) : void 0;
}
function buildGuardedModelFetch(model, timeoutMs) {
	const requestConfig = resolveModelRequestPolicy(model);
	const dispatcherPolicy = buildProviderRequestDispatcherPolicy(requestConfig);
	const requestTimeoutMs = resolveModelRequestTimeoutMs(model, timeoutMs);
	return async (input, init) => {
		const request = input instanceof Request ? new Request(input, init) : void 0;
		const result = await fetchWithSsrFGuard({
			url: request?.url ?? (input instanceof URL ? input.toString() : typeof input === "string" ? input : (() => {
				throw new Error("Unsupported fetch input for transport-aware model request");
			})()),
			init: (request && {
				method: request.method,
				headers: request.headers,
				body: request.body ?? void 0,
				redirect: request.redirect,
				signal: request.signal,
				...request.body ? { duplex: "half" } : {}
			}) ?? init,
			capture: { meta: {
				provider: model.provider,
				api: model.api,
				model: model.id
			} },
			dispatcherPolicy,
			timeoutMs: requestTimeoutMs,
			allowCrossOriginUnsafeRedirectReplay: false,
			...requestConfig.allowPrivateNetwork ? { policy: { allowPrivateNetwork: true } } : {}
		});
		let response = result.response;
		if (shouldBypassLongSdkRetry(response)) {
			const headers = new Headers(response.headers);
			headers.set("x-should-retry", "false");
			response = new Response(response.body, {
				status: response.status,
				statusText: response.statusText,
				headers
			});
		}
		return buildManagedResponse(response, result.release);
	};
}
//#endregion
//#region src/agents/transport-message-transform.ts
const SYNTHETIC_TOOL_RESULT_APIS = new Set([
	"anthropic-messages",
	"openclaw-anthropic-messages-transport",
	"bedrock-converse-stream",
	"google-generative-ai",
	"openclaw-google-generative-ai-transport",
	"openai-responses",
	"openai-codex-responses",
	"azure-openai-responses",
	"openclaw-openai-responses-transport",
	"openclaw-azure-openai-responses-transport"
]);
const CODEX_STYLE_ABORTED_OUTPUT_APIS = new Set([
	"openai-responses",
	"openai-codex-responses",
	"azure-openai-responses",
	"openclaw-openai-responses-transport",
	"openclaw-azure-openai-responses-transport"
]);
function defaultAllowSyntheticToolResults(modelApi) {
	return SYNTHETIC_TOOL_RESULT_APIS.has(modelApi);
}
function isFailedAssistantTurn(message) {
	if (message.role !== "assistant") return false;
	return message.stopReason === "error" || message.stopReason === "aborted";
}
function transformTransportMessages(messages, model, normalizeToolCallId) {
	const allowSyntheticToolResults = defaultAllowSyntheticToolResults(model.api);
	const syntheticToolResultText = CODEX_STYLE_ABORTED_OUTPUT_APIS.has(model.api) ? "aborted" : "No result provided";
	const toolCallIdMap = /* @__PURE__ */ new Map();
	const replayable = messages.map((msg) => {
		if (msg.role === "user") return msg;
		if (msg.role === "toolResult") {
			const normalizedId = toolCallIdMap.get(msg.toolCallId);
			return normalizedId && normalizedId !== msg.toolCallId ? {
				...msg,
				toolCallId: normalizedId
			} : msg;
		}
		if (msg.role !== "assistant") return msg;
		const isSameModel = msg.provider === model.provider && msg.api === model.api && msg.model === model.id;
		const content = [];
		for (const block of msg.content) {
			if (block.type === "thinking") {
				if (block.redacted) {
					if (isSameModel) content.push(block);
					continue;
				}
				if (isSameModel && block.thinkingSignature) {
					content.push(block);
					continue;
				}
				if (!block.thinking.trim()) continue;
				content.push(isSameModel ? block : {
					type: "text",
					text: block.thinking
				});
				continue;
			}
			if (block.type === "text") {
				content.push(isSameModel ? block : {
					type: "text",
					text: block.text
				});
				continue;
			}
			if (block.type !== "toolCall") {
				content.push(block);
				continue;
			}
			let normalizedToolCall = block;
			if (!isSameModel && block.thoughtSignature) {
				normalizedToolCall = { ...normalizedToolCall };
				delete normalizedToolCall.thoughtSignature;
			}
			if (!isSameModel && normalizeToolCallId) {
				const normalizedId = normalizeToolCallId(block.id, model, msg);
				if (normalizedId !== block.id) {
					toolCallIdMap.set(block.id, normalizedId);
					normalizedToolCall = {
						...normalizedToolCall,
						id: normalizedId
					};
				}
			}
			content.push(normalizedToolCall);
		}
		return {
			...msg,
			content
		};
	}).filter((msg) => !isFailedAssistantTurn(msg));
	if (!allowSyntheticToolResults) return replayable;
	return repairToolUseResultPairing(replayable, {
		erroredAssistantResultPolicy: "drop",
		missingToolResultText: syntheticToolResultText
	}).messages;
}
//#endregion
//#region src/agents/transport-stream-shared.ts
function sanitizeTransportPayloadText(text) {
	return text.replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, "");
}
function coerceTransportToolCallArguments(argumentsValue) {
	if (argumentsValue && typeof argumentsValue === "object" && !Array.isArray(argumentsValue)) return argumentsValue;
	if (typeof argumentsValue === "string") try {
		const parsed = JSON.parse(argumentsValue);
		if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
	} catch {}
	return {};
}
function mergeTransportHeaders(...headerSources) {
	const merged = {};
	for (const headers of headerSources) if (headers) Object.assign(merged, headers);
	return Object.keys(merged).length > 0 ? merged : void 0;
}
function mergeTransportMetadata(payload, metadata) {
	if (!metadata || Object.keys(metadata).length === 0) return payload;
	const existingMetadata = payload.metadata && typeof payload.metadata === "object" && !Array.isArray(payload.metadata) ? payload.metadata : void 0;
	return {
		...payload,
		metadata: {
			...existingMetadata,
			...metadata
		}
	};
}
function createEmptyTransportUsage() {
	return {
		input: 0,
		output: 0,
		cacheRead: 0,
		cacheWrite: 0,
		totalTokens: 0,
		cost: {
			input: 0,
			output: 0,
			cacheRead: 0,
			cacheWrite: 0,
			total: 0
		}
	};
}
function createWritableTransportEventStream() {
	const eventStream = createAssistantMessageEventStream();
	return {
		eventStream,
		stream: eventStream
	};
}
function finalizeTransportStream(params) {
	const { stream, output, signal } = params;
	if (signal?.aborted) throw new Error("Request was aborted");
	if (output.stopReason === "aborted" || output.stopReason === "error") throw new Error("An unknown error occurred");
	stream.push({
		type: "done",
		reason: output.stopReason,
		message: output
	});
	stream.end();
}
function failTransportStream(params) {
	const { stream, output, signal, error, cleanup } = params;
	cleanup?.();
	output.stopReason = signal?.aborted ? "aborted" : "error";
	output.errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
	stream.push({
		type: "error",
		reason: output.stopReason,
		error: output
	});
	stream.end();
}
//#endregion
export { finalizeTransportStream as a, sanitizeTransportPayloadText as c, resolveModelRequestTimeoutMs as d, failTransportStream as i, transformTransportMessages as l, createEmptyTransportUsage as n, mergeTransportHeaders as o, createWritableTransportEventStream as r, mergeTransportMetadata as s, coerceTransportToolCallArguments as t, buildGuardedModelFetch as u };
