import { a as normalizeLowercaseStringOrEmpty, f as readStringValue } from "./string-coerce-Bje8XVt9.js";
import { t as createSubsystemLogger } from "./subsystem-rHhUC6qs.js";
import { i as resolveProviderRequestCapabilities } from "./provider-attribution-Cx1zyNpE.js";
import { B as resolveProviderTransportTurnStateWithPlugin, F as resolveProviderStreamFn } from "./provider-runtime-CwkNkui5.js";
import { c as detectOpenAICompletionsCompat } from "./provider-model-compat-K3Q805Kl.js";
import { i as getModelProviderRequestTransport } from "./provider-request-config-R6tp_Cvt.js";
import { a as resolveOpenAIReasoningEffortForModel, i as normalizeOpenAIReasoningEffort, n as resolveOpenAIResponsesPayloadPolicy, r as flattenCompletionMessagesToStringContent, t as applyOpenAIResponsesPayloadPolicy } from "./openai-responses-payload-policy-DJhGfXAS.js";
import { i as stripSystemPromptCacheBoundary } from "./system-prompt-cache-boundary-BWaaicTu.js";
import { t as normalizeToolParameterSchema } from "./pi-tools-parameter-schema-Cv3H0ghS.js";
import { n as applyAnthropicPayloadPolicyToParams, r as resolveAnthropicPayloadPolicy } from "./anthropic-payload-policy-uBFg2xW5.js";
import { r as hasCopilotVisionInput, t as buildCopilotDynamicHeaders } from "./copilot-dynamic-headers-BOfXPZzF.js";
import { a as finalizeTransportStream, c as sanitizeTransportPayloadText, d as resolveModelRequestTimeoutMs, i as failTransportStream, l as transformTransportMessages, n as createEmptyTransportUsage, o as mergeTransportHeaders, r as createWritableTransportEventStream, s as mergeTransportMetadata, t as coerceTransportToolCallArguments, u as buildGuardedModelFetch } from "./transport-stream-shared-B2gu_mC8.js";
import { randomUUID } from "node:crypto";
import { calculateCost, createAssistantMessageEventStream, getApiProvider, getEnvApiKey, parseStreamingJson, registerApiProvider } from "@mariozechner/pi-ai";
import { convertMessages } from "@mariozechner/pi-ai/openai-completions";
import OpenAI, { AzureOpenAI } from "openai";
//#region src/agents/openai-strict-tool-setting.ts
const optionalString = readStringValue;
function resolvesToNativeOpenAIStrictTools(model, transport) {
	const capabilities = resolveProviderRequestCapabilities({
		provider: optionalString(model.provider),
		api: optionalString(model.api),
		baseUrl: optionalString(model.baseUrl),
		capability: "llm",
		transport,
		modelId: optionalString(model.id),
		compat: model.compat
	});
	if (!capabilities.usesKnownNativeOpenAIRoute) return false;
	return capabilities.provider === "openai" || capabilities.provider === "openai-codex" || capabilities.provider === "azure-openai" || capabilities.provider === "azure-openai-responses";
}
function resolveOpenAIStrictToolSetting(model, options) {
	if (resolvesToNativeOpenAIStrictTools(model, options?.transport ?? "stream")) return true;
	if (options?.supportsStrictMode) return false;
}
//#endregion
//#region src/agents/openai-reasoning-compat.ts
const OPENAI_MEDIUM_ONLY_REASONING_MODEL_IDS = new Set(["gpt-5.1-codex-mini"]);
function readCompatReasoningEffortMap(compat) {
	if (!compat || typeof compat !== "object") return {};
	const rawMap = compat.reasoningEffortMap;
	if (!rawMap || typeof rawMap !== "object") return {};
	return Object.fromEntries(Object.entries(rawMap).filter((entry) => typeof entry[0] === "string" && typeof entry[1] === "string"));
}
function resolveOpenAIReasoningEffortMap(model, fallbackMap = {}) {
	const provider = normalizeLowercaseStringOrEmpty(model.provider ?? "");
	const id = normalizeLowercaseStringOrEmpty(model.id ?? "");
	const builtinMap = (provider === "openai" || provider === "openai-codex") && OPENAI_MEDIUM_ONLY_REASONING_MODEL_IDS.has(id) ? {
		minimal: "medium",
		low: "medium"
	} : {};
	return {
		...fallbackMap,
		...builtinMap,
		...readCompatReasoningEffortMap(model.compat)
	};
}
function mapOpenAIReasoningEffortForModel(params) {
	const { effort } = params;
	if (effort === void 0) return effort;
	return resolveOpenAIReasoningEffortForModel({
		model: params.model,
		effort,
		fallbackMap: resolveOpenAIReasoningEffortMap(params.model, params.fallbackMap)
	});
}
//#endregion
//#region src/agents/openai-tool-schema.ts
function normalizeStrictOpenAIJsonSchema(schema) {
	return normalizeStrictOpenAIJsonSchemaRecursive(normalizeToolParameterSchema(schema ?? {}), 0);
}
function normalizeStrictOpenAIJsonSchemaRecursive(schema, depth) {
	if (Array.isArray(schema)) {
		let changed = false;
		const normalized = schema.map((entry) => {
			const next = normalizeStrictOpenAIJsonSchemaRecursive(entry, depth);
			changed ||= next !== entry;
			return next;
		});
		return changed ? normalized : schema;
	}
	if (!schema || typeof schema !== "object") return schema;
	const record = schema;
	let changed = false;
	const normalized = {};
	for (const [key, value] of Object.entries(record)) {
		const next = normalizeStrictOpenAIJsonSchemaRecursive(value, key === "properties" ? depth : depth + 1);
		normalized[key] = next;
		changed ||= next !== value;
	}
	if (normalized.type === "object") {
		const properties = normalized.properties && typeof normalized.properties === "object" && !Array.isArray(normalized.properties) ? normalized.properties : void 0;
		if (properties && Object.keys(properties).length === 0 && !Array.isArray(normalized.required)) {
			normalized.required = [];
			changed = true;
		}
		if (depth === 0 && !("additionalProperties" in normalized)) {
			normalized.additionalProperties = false;
			changed = true;
		}
	}
	return changed ? normalized : schema;
}
function normalizeOpenAIStrictToolParameters(schema, strict) {
	if (!strict) return normalizeToolParameterSchema(schema ?? {});
	return normalizeStrictOpenAIJsonSchema(schema);
}
function isStrictOpenAIJsonSchemaCompatible(schema) {
	return isStrictOpenAIJsonSchemaCompatibleRecursive(normalizeStrictOpenAIJsonSchema(schema));
}
function findOpenAIStrictToolSchemaDiagnostics(tools) {
	return tools.flatMap((tool, toolIndex) => {
		const violations = findStrictOpenAIJsonSchemaViolations(normalizeStrictOpenAIJsonSchema(tool.parameters), `${typeof tool.name === "string" && tool.name ? tool.name : `tool[${toolIndex}]`}.parameters`);
		if (violations.length === 0) return [];
		return [{
			toolIndex,
			...typeof tool.name === "string" && tool.name ? { toolName: tool.name } : {},
			violations
		}];
	});
}
function isStrictOpenAIJsonSchemaCompatibleRecursive(schema) {
	if (Array.isArray(schema)) return schema.every((entry) => isStrictOpenAIJsonSchemaCompatibleRecursive(entry));
	if (!schema || typeof schema !== "object") return true;
	const record = schema;
	if ("anyOf" in record || "oneOf" in record || "allOf" in record) return false;
	if (Array.isArray(record.type)) return false;
	if (record.type === "object" && record.additionalProperties !== false) return false;
	if (record.type === "object") {
		const properties = record.properties && typeof record.properties === "object" && !Array.isArray(record.properties) ? record.properties : {};
		const required = Array.isArray(record.required) ? record.required.filter((entry) => typeof entry === "string") : void 0;
		if (!required) return false;
		const requiredSet = new Set(required);
		if (Object.keys(properties).some((key) => !requiredSet.has(key))) return false;
	}
	return Object.entries(record).every(([key, entry]) => {
		if (key === "properties" && entry && typeof entry === "object" && !Array.isArray(entry)) return Object.values(entry).every((value) => isStrictOpenAIJsonSchemaCompatibleRecursive(value));
		return isStrictOpenAIJsonSchemaCompatibleRecursive(entry);
	});
}
function findStrictOpenAIJsonSchemaViolations(schema, path) {
	if (Array.isArray(schema)) return schema.flatMap((entry, index) => findStrictOpenAIJsonSchemaViolations(entry, `${path}[${index}]`));
	if (!schema || typeof schema !== "object") return [];
	const record = schema;
	const violations = [];
	for (const key of [
		"anyOf",
		"oneOf",
		"allOf"
	]) if (key in record) violations.push(`${path}.${key}`);
	if (Array.isArray(record.type)) violations.push(`${path}.type`);
	if (record.type === "object") {
		if (record.additionalProperties !== false) violations.push(`${path}.additionalProperties`);
		const properties = record.properties && typeof record.properties === "object" && !Array.isArray(record.properties) ? record.properties : {};
		const required = Array.isArray(record.required) ? record.required.filter((entry) => typeof entry === "string") : void 0;
		if (!required) violations.push(`${path}.required`);
		else {
			const requiredSet = new Set(required);
			for (const key of Object.keys(properties)) if (!requiredSet.has(key)) violations.push(`${path}.required.${key}`);
		}
	}
	if (record.properties && typeof record.properties === "object" && !Array.isArray(record.properties)) for (const [key, value] of Object.entries(record.properties)) violations.push(...findStrictOpenAIJsonSchemaViolations(value, `${path}.properties.${key}`));
	for (const [key, value] of Object.entries(record)) {
		if (key === "properties") continue;
		if (value && typeof value === "object") violations.push(...findStrictOpenAIJsonSchemaViolations(value, `${path}.${key}`));
	}
	return violations;
}
function resolveOpenAIStrictToolFlagForInventory(tools, strict) {
	if (strict !== true) return strict === false ? false : void 0;
	return tools.every((tool) => isStrictOpenAIJsonSchemaCompatible(tool.parameters));
}
//#endregion
//#region src/agents/anthropic-transport-stream.ts
const CLAUDE_CODE_VERSION = "2.1.75";
const CLAUDE_CODE_TOOL_LOOKUP = new Map([
	"Read",
	"Write",
	"Edit",
	"Bash",
	"Grep",
	"Glob",
	"AskUserQuestion",
	"EnterPlanMode",
	"ExitPlanMode",
	"KillShell",
	"NotebookEdit",
	"Skill",
	"Task",
	"TaskOutput",
	"TodoWrite",
	"WebFetch",
	"WebSearch"
].map((tool) => [normalizeLowercaseStringOrEmpty(tool), tool]));
function isClaudeOpus47Model(modelId) {
	return modelId.includes("opus-4-7") || modelId.includes("opus-4.7");
}
function isClaudeOpus46Model(modelId) {
	return modelId.includes("opus-4-6") || modelId.includes("opus-4.6");
}
function supportsAdaptiveThinking(modelId) {
	return isClaudeOpus47Model(modelId) || isClaudeOpus46Model(modelId) || modelId.includes("sonnet-4-6") || modelId.includes("sonnet-4.6");
}
function mapThinkingLevelToEffort(level, modelId) {
	switch (level) {
		case "minimal":
		case "low": return "low";
		case "medium": return "medium";
		case "xhigh":
			if (isClaudeOpus47Model(modelId)) return "xhigh";
			return isClaudeOpus46Model(modelId) ? "max" : "high";
		default: return "high";
	}
}
function clampReasoningLevel(level) {
	return level === "xhigh" ? "high" : level;
}
function resolvePositiveAnthropicMaxTokens(value) {
	if (typeof value !== "number" || !Number.isFinite(value)) return;
	const floored = Math.floor(value);
	return floored > 0 ? floored : void 0;
}
function resolveAnthropicMessagesMaxTokens(params) {
	const requested = resolvePositiveAnthropicMaxTokens(params.requestedMaxTokens);
	if (requested !== void 0) return requested;
	const modelMax = resolvePositiveAnthropicMaxTokens(params.modelMaxTokens);
	return modelMax !== void 0 ? Math.min(modelMax, 32e3) : void 0;
}
function adjustMaxTokensForThinking(params) {
	const budgets = {
		minimal: 1024,
		low: 2048,
		medium: 8192,
		high: 16384,
		...params.customBudgets
	};
	const minOutputTokens = 1024;
	let thinkingBudget = budgets[clampReasoningLevel(params.reasoningLevel)];
	const maxTokens = Math.min(params.baseMaxTokens + thinkingBudget, params.modelMaxTokens);
	if (maxTokens <= thinkingBudget) thinkingBudget = Math.max(0, maxTokens - minOutputTokens);
	return {
		maxTokens,
		thinkingBudget
	};
}
function isAnthropicOAuthToken(apiKey) {
	return apiKey.includes("sk-ant-oat");
}
function toClaudeCodeName(name) {
	return CLAUDE_CODE_TOOL_LOOKUP.get(normalizeLowercaseStringOrEmpty(name)) ?? name;
}
function fromClaudeCodeName(name, tools) {
	if (tools && tools.length > 0) {
		const lowerName = normalizeLowercaseStringOrEmpty(name);
		const matchedTool = tools.find((tool) => normalizeLowercaseStringOrEmpty(tool.name) === lowerName);
		if (matchedTool) return matchedTool.name;
	}
	return name;
}
function convertContentBlocks(content) {
	if (!content.some((item) => item.type === "image")) return sanitizeTransportPayloadText(content.map((item) => "text" in item ? item.text : "").join("\n"));
	const blocks = content.map((block) => {
		if (block.type === "text") return {
			type: "text",
			text: sanitizeTransportPayloadText(block.text)
		};
		return {
			type: "image",
			source: {
				type: "base64",
				media_type: block.mimeType,
				data: block.data
			}
		};
	});
	if (!blocks.some((block) => block.type === "text")) blocks.unshift({
		type: "text",
		text: "(see attached image)"
	});
	return blocks;
}
function normalizeToolCallId(id) {
	return id.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 64);
}
function convertAnthropicMessages(messages, model, isOAuthToken) {
	const params = [];
	const transformedMessages = transformTransportMessages(messages, model, normalizeToolCallId);
	for (let i = 0; i < transformedMessages.length; i += 1) {
		const msg = transformedMessages[i];
		if (msg.role === "user") {
			if (typeof msg.content === "string") {
				if (msg.content.trim().length > 0) params.push({
					role: "user",
					content: sanitizeTransportPayloadText(msg.content)
				});
				continue;
			}
			const blocks = msg.content.map((item) => item.type === "text" ? {
				type: "text",
				text: sanitizeTransportPayloadText(item.text)
			} : {
				type: "image",
				source: {
					type: "base64",
					media_type: item.mimeType,
					data: item.data
				}
			});
			let filteredBlocks = model.input.includes("image") ? blocks : blocks.filter((block) => block.type !== "image");
			filteredBlocks = filteredBlocks.filter((block) => block.type !== "text" || block.text.trim().length > 0);
			if (filteredBlocks.length === 0) continue;
			params.push({
				role: "user",
				content: filteredBlocks
			});
			continue;
		}
		if (msg.role === "assistant") {
			const blocks = [];
			for (const block of msg.content) {
				if (block.type === "text") {
					if (block.text.trim().length > 0) blocks.push({
						type: "text",
						text: sanitizeTransportPayloadText(block.text)
					});
					continue;
				}
				if (block.type === "thinking") {
					if (block.redacted) {
						blocks.push({
							type: "redacted_thinking",
							data: block.thinkingSignature
						});
						continue;
					}
					if (block.thinking.trim().length === 0) continue;
					if (!block.thinkingSignature || block.thinkingSignature.trim().length === 0) blocks.push({
						type: "text",
						text: sanitizeTransportPayloadText(block.thinking)
					});
					else blocks.push({
						type: "thinking",
						thinking: sanitizeTransportPayloadText(block.thinking),
						signature: block.thinkingSignature
					});
					continue;
				}
				if (block.type === "toolCall") blocks.push({
					type: "tool_use",
					id: block.id,
					name: isOAuthToken ? toClaudeCodeName(block.name) : block.name,
					input: coerceTransportToolCallArguments(block.arguments)
				});
			}
			if (blocks.length > 0) params.push({
				role: "assistant",
				content: blocks
			});
			continue;
		}
		if (msg.role === "toolResult") {
			const toolResult = msg;
			const toolResults = [{
				type: "tool_result",
				tool_use_id: toolResult.toolCallId,
				content: convertContentBlocks(toolResult.content),
				is_error: toolResult.isError
			}];
			let j = i + 1;
			while (j < transformedMessages.length && transformedMessages[j].role === "toolResult") {
				const nextMsg = transformedMessages[j];
				toolResults.push({
					type: "tool_result",
					tool_use_id: nextMsg.toolCallId,
					content: convertContentBlocks(nextMsg.content),
					is_error: nextMsg.isError
				});
				j += 1;
			}
			i = j - 1;
			params.push({
				role: "user",
				content: toolResults
			});
		}
	}
	return params;
}
function convertAnthropicTools(tools, isOAuthToken) {
	if (!tools) return [];
	return tools.flatMap((tool) => {
		const parameters = tool.parameters && typeof tool.parameters === "object" && !Array.isArray(tool.parameters) ? tool.parameters : void 0;
		if (!parameters) return [];
		return [{
			name: isOAuthToken ? toClaudeCodeName(tool.name) : tool.name,
			description: tool.description,
			input_schema: {
				type: "object",
				properties: parameters.properties || {},
				required: parameters.required || []
			}
		}];
	});
}
function mapStopReason$1(reason) {
	switch (reason) {
		case "end_turn": return "stop";
		case "max_tokens": return "length";
		case "tool_use": return "toolUse";
		case "pause_turn": return "stop";
		case "refusal":
		case "sensitive": return "error";
		case "stop_sequence": return "stop";
		default: throw new Error(`Unhandled stop reason: ${String(reason)}`);
	}
}
function resolveAnthropicMessagesUrl(baseUrl) {
	const normalized = (baseUrl?.trim() || "https://api.anthropic.com").replace(/\/+$/, "");
	return normalized.endsWith("/v1") ? `${normalized}/messages` : `${normalized}/v1/messages`;
}
async function* parseAnthropicSseBody(body) {
	const reader = body.getReader();
	const decoder = new TextDecoder();
	let buffer = "";
	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			buffer = `${buffer}${decoder.decode(value, { stream: true })}`.replaceAll("\r\n", "\n");
			let frameEnd = buffer.indexOf("\n\n");
			while (frameEnd >= 0) {
				const frame = buffer.slice(0, frameEnd);
				buffer = buffer.slice(frameEnd + 2);
				const data = frame.split("\n").filter((line) => line.startsWith("data:")).map((line) => line.slice(5).trimStart()).join("\n");
				if (data && data !== "[DONE]") yield JSON.parse(data);
				frameEnd = buffer.indexOf("\n\n");
			}
		}
		const tail = `${buffer}${decoder.decode()}`.replaceAll("\r\n", "\n").trim();
		if (tail) {
			const data = tail.split("\n").filter((line) => line.startsWith("data:")).map((line) => line.slice(5).trimStart()).join("\n");
			if (data && data !== "[DONE]") yield JSON.parse(data);
		}
	} finally {
		reader.releaseLock();
	}
}
function createAnthropicMessagesClient(params) {
	const url = resolveAnthropicMessagesUrl(params.baseURL);
	return { messages: { async *stream(body, options) {
		const headers = mergeTransportHeaders({
			"content-type": "application/json",
			"anthropic-version": "2023-06-01",
			...params.apiKey ? { "x-api-key": params.apiKey } : {},
			...params.authToken ? { authorization: `Bearer ${params.authToken}` } : {}
		}, params.defaultHeaders);
		const response = await params.fetch(url, {
			method: "POST",
			headers,
			body: JSON.stringify(body),
			signal: options?.signal
		});
		if (!response.ok) {
			const detail = await response.text().catch(() => "");
			throw new Error(detail || `Anthropic Messages request failed with HTTP ${response.status}`);
		}
		if (!response.body) return;
		yield* parseAnthropicSseBody(response.body);
	} } };
}
function createAnthropicTransportClient(params) {
	const { model, context, apiKey, options } = params;
	const needsInterleavedBeta = (options?.interleavedThinking ?? true) && !supportsAdaptiveThinking(model.id);
	const fetch = buildGuardedModelFetch(model);
	if (model.provider === "github-copilot") {
		const betaFeatures = needsInterleavedBeta ? ["interleaved-thinking-2025-05-14"] : [];
		return {
			client: createAnthropicMessagesClient({
				apiKey: null,
				authToken: apiKey,
				baseURL: model.baseUrl,
				defaultHeaders: mergeTransportHeaders({
					accept: "application/json",
					"anthropic-dangerous-direct-browser-access": "true",
					...betaFeatures.length > 0 ? { "anthropic-beta": betaFeatures.join(",") } : {}
				}, model.headers, buildCopilotDynamicHeaders({
					messages: context.messages,
					hasImages: hasCopilotVisionInput(context.messages)
				}), options?.headers),
				fetch
			}),
			isOAuthToken: false
		};
	}
	const betaFeatures = ["fine-grained-tool-streaming-2025-05-14"];
	if (needsInterleavedBeta) betaFeatures.push("interleaved-thinking-2025-05-14");
	if (isAnthropicOAuthToken(apiKey)) return {
		client: createAnthropicMessagesClient({
			apiKey: null,
			authToken: apiKey,
			baseURL: model.baseUrl,
			defaultHeaders: mergeTransportHeaders({
				accept: "application/json",
				"anthropic-dangerous-direct-browser-access": "true",
				"anthropic-beta": `claude-code-20250219,oauth-2025-04-20,${betaFeatures.join(",")}`,
				"user-agent": `claude-cli/${CLAUDE_CODE_VERSION}`,
				"x-app": "cli"
			}, model.headers, options?.headers),
			fetch
		}),
		isOAuthToken: true
	};
	return {
		client: createAnthropicMessagesClient({
			apiKey,
			baseURL: model.baseUrl,
			defaultHeaders: mergeTransportHeaders({
				accept: "application/json",
				"anthropic-dangerous-direct-browser-access": "true",
				"anthropic-beta": betaFeatures.join(",")
			}, model.headers, options?.headers),
			fetch
		}),
		isOAuthToken: false
	};
}
function buildAnthropicParams(model, context, isOAuthToken, options) {
	const maxTokens = resolveAnthropicMessagesMaxTokens({
		modelMaxTokens: model.maxTokens,
		requestedMaxTokens: options?.maxTokens
	});
	if (maxTokens === void 0) throw new Error(`Anthropic Messages transport requires a positive maxTokens value for ${model.provider}/${model.id}`);
	const payloadPolicy = resolveAnthropicPayloadPolicy({
		provider: model.provider,
		api: model.api,
		baseUrl: model.baseUrl,
		cacheRetention: options?.cacheRetention,
		enableCacheControl: true
	});
	const params = {
		model: model.id,
		messages: convertAnthropicMessages(context.messages, model, isOAuthToken),
		max_tokens: maxTokens,
		stream: true
	};
	if (isOAuthToken) params.system = [{
		type: "text",
		text: "You are Claude Code, Anthropic's official CLI for Claude."
	}, ...context.systemPrompt ? [{
		type: "text",
		text: sanitizeTransportPayloadText(context.systemPrompt)
	}] : []];
	else if (context.systemPrompt) params.system = [{
		type: "text",
		text: sanitizeTransportPayloadText(context.systemPrompt)
	}];
	if (options?.temperature !== void 0 && !options.thinkingEnabled) params.temperature = options.temperature;
	if (context.tools) params.tools = convertAnthropicTools(context.tools, isOAuthToken);
	if (model.reasoning) {
		if (options?.thinkingEnabled) if (supportsAdaptiveThinking(model.id)) {
			params.thinking = { type: "adaptive" };
			if (options.effort) params.output_config = { effort: options.effort };
		} else params.thinking = {
			type: "enabled",
			budget_tokens: options.thinkingBudgetTokens || 1024
		};
		else if (options?.thinkingEnabled === false) params.thinking = { type: "disabled" };
	}
	if (options?.metadata && typeof options.metadata.user_id === "string") params.metadata = { user_id: options.metadata.user_id };
	if (options?.toolChoice) params.tool_choice = typeof options.toolChoice === "string" ? { type: options.toolChoice } : options.toolChoice;
	applyAnthropicPayloadPolicyToParams(params, payloadPolicy);
	return params;
}
function resolveAnthropicTransportOptions(model, options, apiKey) {
	const baseMaxTokens = resolveAnthropicMessagesMaxTokens({
		modelMaxTokens: model.maxTokens,
		requestedMaxTokens: options?.maxTokens
	});
	if (baseMaxTokens === void 0) throw new Error(`Anthropic Messages transport requires a positive maxTokens value for ${model.provider}/${model.id}`);
	const reasoningModelMaxTokens = resolvePositiveAnthropicMaxTokens(model.maxTokens) ?? baseMaxTokens;
	const resolved = {
		temperature: options?.temperature,
		maxTokens: baseMaxTokens,
		signal: options?.signal,
		apiKey,
		cacheRetention: options?.cacheRetention,
		sessionId: options?.sessionId,
		headers: options?.headers,
		onPayload: options?.onPayload,
		maxRetryDelayMs: options?.maxRetryDelayMs,
		metadata: options?.metadata,
		interleavedThinking: options?.interleavedThinking,
		toolChoice: options?.toolChoice,
		thinkingBudgets: options?.thinkingBudgets,
		reasoning: options?.reasoning
	};
	if (!options?.reasoning) {
		resolved.thinkingEnabled = false;
		return resolved;
	}
	if (supportsAdaptiveThinking(model.id)) {
		resolved.thinkingEnabled = true;
		resolved.effort = mapThinkingLevelToEffort(options.reasoning, model.id);
		return resolved;
	}
	const adjusted = adjustMaxTokensForThinking({
		baseMaxTokens,
		modelMaxTokens: reasoningModelMaxTokens,
		reasoningLevel: options.reasoning,
		customBudgets: options.thinkingBudgets
	});
	resolved.maxTokens = adjusted.maxTokens;
	resolved.thinkingEnabled = true;
	resolved.thinkingBudgetTokens = adjusted.thinkingBudget;
	return resolved;
}
function createAnthropicMessagesTransportStreamFn() {
	return (rawModel, context, rawOptions) => {
		const model = rawModel;
		const options = rawOptions;
		const { eventStream, stream } = createWritableTransportEventStream();
		(async () => {
			const output = {
				role: "assistant",
				content: [],
				api: "anthropic-messages",
				provider: model.provider,
				model: model.id,
				usage: createEmptyTransportUsage(),
				stopReason: "stop",
				timestamp: Date.now()
			};
			try {
				const apiKey = options?.apiKey ?? getEnvApiKey(model.provider) ?? "";
				if (!apiKey) throw new Error(`No API key for provider: ${model.provider}`);
				const transportOptions = resolveAnthropicTransportOptions(model, options, apiKey);
				const { client, isOAuthToken } = createAnthropicTransportClient({
					model,
					context,
					apiKey,
					options: transportOptions
				});
				let params = buildAnthropicParams(model, context, isOAuthToken, transportOptions);
				const nextParams = await transportOptions.onPayload?.(params, model);
				if (nextParams !== void 0) params = nextParams;
				const anthropicStream = client.messages.stream({
					...params,
					stream: true
				}, transportOptions.signal ? { signal: transportOptions.signal } : void 0);
				stream.push({
					type: "start",
					partial: output
				});
				const blocks = output.content;
				for await (const event of anthropicStream) {
					if (event.type === "error") {
						const error = event.error;
						throw new Error(error?.message || "Anthropic Messages stream failed");
					}
					if (event.type === "message_start") {
						const message = event.message;
						const usage = message?.usage ?? {};
						output.responseId = typeof message?.id === "string" ? message.id : void 0;
						output.usage.input = typeof usage.input_tokens === "number" ? usage.input_tokens : 0;
						output.usage.output = typeof usage.output_tokens === "number" ? usage.output_tokens : 0;
						output.usage.cacheRead = typeof usage.cache_read_input_tokens === "number" ? usage.cache_read_input_tokens : 0;
						output.usage.cacheWrite = typeof usage.cache_creation_input_tokens === "number" ? usage.cache_creation_input_tokens : 0;
						output.usage.totalTokens = output.usage.input + output.usage.output + output.usage.cacheRead + output.usage.cacheWrite;
						calculateCost(model, output.usage);
						continue;
					}
					if (event.type === "content_block_start") {
						const contentBlock = event.content_block;
						const index = typeof event.index === "number" ? event.index : -1;
						if (contentBlock?.type === "text") {
							const block = {
								type: "text",
								text: "",
								index
							};
							output.content.push(block);
							stream.push({
								type: "text_start",
								contentIndex: output.content.length - 1,
								partial: output
							});
							continue;
						}
						if (contentBlock?.type === "thinking") {
							const block = {
								type: "thinking",
								thinking: "",
								thinkingSignature: "",
								index
							};
							output.content.push(block);
							stream.push({
								type: "thinking_start",
								contentIndex: output.content.length - 1,
								partial: output
							});
							continue;
						}
						if (contentBlock?.type === "redacted_thinking") {
							const block = {
								type: "thinking",
								thinking: "[Reasoning redacted]",
								thinkingSignature: typeof contentBlock.data === "string" ? contentBlock.data : "",
								redacted: true,
								index
							};
							output.content.push(block);
							stream.push({
								type: "thinking_start",
								contentIndex: output.content.length - 1,
								partial: output
							});
							continue;
						}
						if (contentBlock?.type === "tool_use") {
							const block = {
								type: "toolCall",
								id: typeof contentBlock.id === "string" ? contentBlock.id : "",
								name: typeof contentBlock.name === "string" ? isOAuthToken ? fromClaudeCodeName(contentBlock.name, context.tools) : contentBlock.name : "",
								arguments: contentBlock.input && typeof contentBlock.input === "object" ? contentBlock.input : {},
								partialJson: "",
								index
							};
							output.content.push(block);
							stream.push({
								type: "toolcall_start",
								contentIndex: output.content.length - 1,
								partial: output
							});
						}
						continue;
					}
					if (event.type === "content_block_delta") {
						const index = blocks.findIndex((block) => block.index === event.index);
						const block = blocks[index];
						const delta = event.delta;
						if (block?.type === "text" && delta?.type === "text_delta" && typeof delta.text === "string") {
							block.text += delta.text;
							stream.push({
								type: "text_delta",
								contentIndex: index,
								delta: delta.text,
								partial: output
							});
							continue;
						}
						if (block?.type === "thinking" && delta?.type === "thinking_delta" && typeof delta.thinking === "string") {
							block.thinking += delta.thinking;
							stream.push({
								type: "thinking_delta",
								contentIndex: index,
								delta: delta.thinking,
								partial: output
							});
							continue;
						}
						if (block?.type === "toolCall" && delta?.type === "input_json_delta" && typeof delta.partial_json === "string") {
							block.partialJson += delta.partial_json;
							block.arguments = parseStreamingJson(block.partialJson);
							stream.push({
								type: "toolcall_delta",
								contentIndex: index,
								delta: delta.partial_json,
								partial: output
							});
							continue;
						}
						if (block?.type === "thinking" && delta?.type === "signature_delta" && typeof delta.signature === "string") block.thinkingSignature = `${block.thinkingSignature ?? ""}${delta.signature}`;
						continue;
					}
					if (event.type === "content_block_stop") {
						const index = blocks.findIndex((block) => block.index === event.index);
						const block = blocks[index];
						if (!block) continue;
						delete block.index;
						if (block.type === "text") {
							stream.push({
								type: "text_end",
								contentIndex: index,
								content: block.text,
								partial: output
							});
							continue;
						}
						if (block.type === "thinking") {
							stream.push({
								type: "thinking_end",
								contentIndex: index,
								content: block.thinking,
								partial: output
							});
							continue;
						}
						if (block.type === "toolCall") {
							if (typeof block.partialJson === "string" && block.partialJson.length > 0) block.arguments = parseStreamingJson(block.partialJson);
							delete block.partialJson;
							stream.push({
								type: "toolcall_end",
								contentIndex: index,
								toolCall: block,
								partial: output
							});
						}
						continue;
					}
					if (event.type === "message_delta") {
						const delta = event.delta;
						const usage = event.usage;
						if (delta?.stop_reason) output.stopReason = mapStopReason$1(delta.stop_reason);
						if (typeof usage?.input_tokens === "number") output.usage.input = usage.input_tokens;
						if (typeof usage?.output_tokens === "number") output.usage.output = usage.output_tokens;
						if (typeof usage?.cache_read_input_tokens === "number") output.usage.cacheRead = usage.cache_read_input_tokens;
						if (typeof usage?.cache_creation_input_tokens === "number") output.usage.cacheWrite = usage.cache_creation_input_tokens;
						output.usage.totalTokens = output.usage.input + output.usage.output + output.usage.cacheRead + output.usage.cacheWrite;
						calculateCost(model, output.usage);
					}
				}
				finalizeTransportStream({
					stream,
					output,
					signal: transportOptions.signal
				});
			} catch (error) {
				failTransportStream({
					stream,
					output,
					signal: options?.signal,
					error,
					cleanup: () => {
						for (const block of output.content) delete block.index;
					}
				});
			}
		})();
		return eventStream;
	};
}
//#endregion
//#region src/agents/openai-transport-stream.ts
const DEFAULT_AZURE_OPENAI_API_VERSION = "2024-12-01-preview";
const log = createSubsystemLogger("openai-transport");
function stringifyUnknown(value, fallback = "") {
	if (typeof value === "string") return value;
	if (typeof value === "number" || typeof value === "boolean") return String(value);
	return fallback;
}
function stringifyJsonLike(value, fallback = "") {
	if (typeof value === "string") return value;
	if (value && typeof value === "object") return JSON.stringify(value);
	if (typeof value === "number" || typeof value === "boolean") return String(value);
	return fallback;
}
function getServiceTierCostMultiplier(serviceTier) {
	switch (serviceTier) {
		case "flex": return .5;
		case "priority": return 2;
		default: return 1;
	}
}
function applyServiceTierPricing(usage, serviceTier) {
	const multiplier = getServiceTierCostMultiplier(serviceTier);
	if (multiplier === 1) return;
	usage.cost.input *= multiplier;
	usage.cost.output *= multiplier;
	usage.cost.cacheRead *= multiplier;
	usage.cost.cacheWrite *= multiplier;
	usage.cost.total = usage.cost.input + usage.cost.output + usage.cost.cacheRead + usage.cost.cacheWrite;
}
function resolveAzureOpenAIApiVersion(env = process.env) {
	return env.AZURE_OPENAI_API_VERSION?.trim() || DEFAULT_AZURE_OPENAI_API_VERSION;
}
function shortHash(value) {
	let hash = 0;
	for (let i = 0; i < value.length; i += 1) hash = hash * 31 + value.charCodeAt(i) | 0;
	return Math.abs(hash).toString(36);
}
function encodeTextSignatureV1(id, phase) {
	return JSON.stringify({
		v: 1,
		id,
		...phase ? { phase } : {}
	});
}
function parseTextSignature(signature) {
	if (!signature) return;
	if (signature.startsWith("{")) try {
		const parsed = JSON.parse(signature);
		if (parsed.v === 1 && typeof parsed.id === "string") return parsed.phase === "commentary" || parsed.phase === "final_answer" ? {
			id: parsed.id,
			phase: parsed.phase
		} : { id: parsed.id };
	} catch {}
	return { id: signature };
}
function convertResponsesMessages(model, context, allowedToolCallProviders, options) {
	const messages = [];
	const normalizeIdPart = (part) => {
		const sanitized = part.replace(/[^a-zA-Z0-9_-]/g, "_");
		return (sanitized.length > 64 ? sanitized.slice(0, 64) : sanitized).replace(/_+$/, "");
	};
	const buildForeignResponsesItemId = (itemId) => {
		const normalized = `fc_${shortHash(itemId)}`;
		return normalized.length > 64 ? normalized.slice(0, 64) : normalized;
	};
	const normalizeToolCallId = (id, _targetModel, source) => {
		if (!allowedToolCallProviders.has(model.provider)) return normalizeIdPart(id);
		if (!id.includes("|")) return normalizeIdPart(id);
		const [callId, itemId] = id.split("|");
		const normalizedCallId = normalizeIdPart(callId);
		let normalizedItemId = source.provider !== model.provider || source.api !== model.api ? buildForeignResponsesItemId(itemId) : normalizeIdPart(itemId);
		if (!normalizedItemId.startsWith("fc_")) normalizedItemId = normalizeIdPart(`fc_${normalizedItemId}`);
		return `${normalizedCallId}|${normalizedItemId}`;
	};
	const transformedMessages = transformTransportMessages(context.messages, model, normalizeToolCallId);
	if ((options?.includeSystemPrompt ?? true) && context.systemPrompt) messages.push({
		role: model.reasoning && options?.supportsDeveloperRole !== false ? "developer" : "system",
		content: sanitizeTransportPayloadText(stripSystemPromptCacheBoundary(context.systemPrompt))
	});
	let msgIndex = 0;
	for (const msg of transformedMessages) {
		if (msg.role === "user") if (typeof msg.content === "string") messages.push({
			role: "user",
			content: [{
				type: "input_text",
				text: sanitizeTransportPayloadText(msg.content)
			}]
		});
		else {
			const content = msg.content.map((item) => item.type === "text" ? {
				type: "input_text",
				text: sanitizeTransportPayloadText(item.text)
			} : {
				type: "input_image",
				detail: "auto",
				image_url: `data:${item.mimeType};base64,${item.data}`
			}).filter((item) => model.input.includes("image") || item.type !== "input_image");
			if (content.length > 0) messages.push({
				role: "user",
				content
			});
		}
		else if (msg.role === "assistant") {
			const output = [];
			const isDifferentModel = msg.model !== model.id && msg.provider === model.provider && msg.api === model.api;
			for (const block of msg.content) if (block.type === "thinking") {
				if (block.thinkingSignature) output.push(JSON.parse(block.thinkingSignature));
			} else if (block.type === "text") {
				let msgId = parseTextSignature(block.textSignature)?.id ?? `msg_${msgIndex}`;
				if (msgId.length > 64) msgId = `msg_${shortHash(msgId)}`;
				output.push({
					type: "message",
					role: "assistant",
					content: [{
						type: "output_text",
						text: sanitizeTransportPayloadText(block.text),
						annotations: []
					}],
					status: "completed",
					id: msgId,
					phase: parseTextSignature(block.textSignature)?.phase
				});
			} else if (block.type === "toolCall") {
				const [callId, itemIdRaw] = block.id.split("|");
				const itemId = isDifferentModel && itemIdRaw?.startsWith("fc_") ? void 0 : itemIdRaw;
				output.push({
					type: "function_call",
					id: itemId,
					call_id: callId,
					name: block.name,
					arguments: typeof block.arguments === "string" ? block.arguments : JSON.stringify(block.arguments ?? {})
				});
			}
			if (output.length > 0) messages.push(...output);
		} else if (msg.role === "toolResult") {
			const textResult = msg.content.filter((item) => item.type === "text").map((item) => item.text).join("\n");
			const hasImages = msg.content.some((item) => item.type === "image");
			const [callId] = msg.toolCallId.split("|");
			messages.push({
				type: "function_call_output",
				call_id: callId,
				output: hasImages && model.input.includes("image") ? [...textResult ? [{
					type: "input_text",
					text: sanitizeTransportPayloadText(textResult)
				}] : [], ...msg.content.filter((item) => item.type === "image").map((item) => ({
					type: "input_image",
					detail: "auto",
					image_url: `data:${item.mimeType};base64,${item.data}`
				}))] : sanitizeTransportPayloadText(textResult || "(see attached image)")
			});
		}
		msgIndex += 1;
	}
	return messages;
}
function convertResponsesTools(tools, model, options) {
	const strict = resolveOpenAIStrictToolFlagWithDiagnostics(tools, options?.strict, {
		transport: "responses",
		model
	});
	return tools.map((tool) => {
		const base = {
			type: "function",
			name: tool.name,
			description: tool.description,
			parameters: normalizeOpenAIStrictToolParameters(tool.parameters, strict === true)
		};
		return strict === void 0 ? base : {
			...base,
			strict
		};
	});
}
function resolveOpenAIStrictToolFlagWithDiagnostics(tools, strictSetting, context) {
	const strict = resolveOpenAIStrictToolFlagForInventory(tools, strictSetting);
	if (strictSetting === true && strict === false && log.isEnabled("debug", "any")) {
		const diagnostics = findOpenAIStrictToolSchemaDiagnostics(tools);
		const sample = diagnostics.slice(0, 5).map((entry) => ({
			tool: entry.toolName ?? `tool[${entry.toolIndex}]`,
			violations: entry.violations.slice(0, 8)
		}));
		log.debug(`OpenAI ${context.transport} tool schema strict mode downgraded to strict=false for ${context.model.provider ?? "unknown"}/${context.model.id ?? "unknown"} because ${diagnostics.length} tool schema(s) are not strict-compatible`, {
			transport: context.transport,
			provider: context.model.provider,
			model: context.model.id,
			incompatibleToolCount: diagnostics.length,
			sample
		});
	}
	return strict;
}
async function processResponsesStream(openaiStream, output, stream, model, options) {
	let currentItem = null;
	let currentBlock = null;
	const blockIndex = () => output.content.length - 1;
	for await (const rawEvent of openaiStream) {
		const event = rawEvent;
		const type = stringifyUnknown(event.type);
		if (type === "response.created") output.responseId = stringifyUnknown(event.response?.id);
		else if (type === "response.output_item.added") {
			const item = event.item;
			if (item.type === "reasoning") {
				currentItem = item;
				currentBlock = {
					type: "thinking",
					thinking: ""
				};
				output.content.push(currentBlock);
				stream.push({
					type: "thinking_start",
					contentIndex: blockIndex(),
					partial: output
				});
			} else if (item.type === "message") {
				currentItem = item;
				currentBlock = {
					type: "text",
					text: ""
				};
				output.content.push(currentBlock);
				stream.push({
					type: "text_start",
					contentIndex: blockIndex(),
					partial: output
				});
			} else if (item.type === "function_call") {
				currentItem = item;
				currentBlock = {
					type: "toolCall",
					id: `${stringifyUnknown(item.call_id)}|${stringifyUnknown(item.id)}`,
					name: stringifyUnknown(item.name),
					arguments: {},
					partialJson: stringifyJsonLike(item.arguments)
				};
				output.content.push(currentBlock);
				stream.push({
					type: "toolcall_start",
					contentIndex: blockIndex(),
					partial: output
				});
			}
		} else if (type === "response.reasoning_summary_text.delta") {
			if (currentItem?.type === "reasoning" && currentBlock?.type === "thinking") {
				currentBlock.thinking = `${stringifyUnknown(currentBlock.thinking)}${stringifyUnknown(event.delta)}`;
				stream.push({
					type: "thinking_delta",
					contentIndex: blockIndex(),
					delta: stringifyUnknown(event.delta),
					partial: output
				});
			}
		} else if (type === "response.output_text.delta" || type === "response.refusal.delta") {
			if (currentItem?.type === "message" && currentBlock?.type === "text") {
				currentBlock.text = `${stringifyUnknown(currentBlock.text)}${stringifyUnknown(event.delta)}`;
				stream.push({
					type: "text_delta",
					contentIndex: blockIndex(),
					delta: stringifyUnknown(event.delta),
					partial: output
				});
			}
		} else if (type === "response.function_call_arguments.delta") {
			if (currentItem?.type === "function_call" && currentBlock?.type === "toolCall") {
				currentBlock.partialJson = `${stringifyJsonLike(currentBlock.partialJson)}${stringifyJsonLike(event.delta)}`;
				currentBlock.arguments = parseStreamingJson(stringifyJsonLike(currentBlock.partialJson));
				stream.push({
					type: "toolcall_delta",
					contentIndex: blockIndex(),
					delta: stringifyJsonLike(event.delta),
					partial: output
				});
			}
		} else if (type === "response.output_item.done") {
			const item = event.item;
			if (item.type === "reasoning" && currentBlock?.type === "thinking") {
				const summary = Array.isArray(item.summary) ? item.summary.map((part) => {
					return part.text ?? "";
				}).join("\n\n") : "";
				currentBlock.thinking = summary;
				currentBlock.thinkingSignature = JSON.stringify(item);
				stream.push({
					type: "thinking_end",
					contentIndex: blockIndex(),
					content: stringifyUnknown(currentBlock.thinking),
					partial: output
				});
				currentBlock = null;
			} else if (item.type === "message" && currentBlock?.type === "text") {
				const content = Array.isArray(item.content) ? item.content : [];
				currentBlock.text = content.map((part) => {
					const contentPart = part;
					return contentPart.type === "output_text" ? contentPart.text ?? "" : contentPart.refusal ?? "";
				}).join("");
				currentBlock.textSignature = encodeTextSignatureV1(stringifyUnknown(item.id), item.phase ?? void 0);
				stream.push({
					type: "text_end",
					contentIndex: blockIndex(),
					content: stringifyUnknown(currentBlock.text),
					partial: output
				});
				currentBlock = null;
			} else if (item.type === "function_call") {
				const args = currentBlock?.type === "toolCall" && currentBlock.partialJson ? parseStreamingJson(stringifyJsonLike(currentBlock.partialJson, "{}")) : parseStreamingJson(stringifyJsonLike(item.arguments, "{}"));
				stream.push({
					type: "toolcall_end",
					contentIndex: blockIndex(),
					toolCall: {
						type: "toolCall",
						id: `${stringifyUnknown(item.call_id)}|${stringifyUnknown(item.id)}`,
						name: stringifyUnknown(item.name),
						arguments: args
					},
					partial: output
				});
				currentBlock = null;
			}
		} else if (type === "response.completed") {
			const response = event.response;
			if (typeof response?.id === "string") output.responseId = response.id;
			const usage = response?.usage;
			if (usage) {
				const cachedTokens = usage.input_tokens_details?.cached_tokens || 0;
				output.usage = {
					input: (usage.input_tokens || 0) - cachedTokens,
					output: usage.output_tokens || 0,
					cacheRead: cachedTokens,
					cacheWrite: 0,
					totalTokens: usage.total_tokens || 0,
					cost: {
						input: 0,
						output: 0,
						cacheRead: 0,
						cacheWrite: 0,
						total: 0
					}
				};
			}
			calculateCost(model, output.usage);
			if (options?.applyServiceTierPricing) options.applyServiceTierPricing(output.usage, response?.service_tier ?? options.serviceTier);
			output.stopReason = mapResponsesStopReason(response?.status);
			if (output.content.some((block) => block.type === "toolCall") && output.stopReason === "stop") output.stopReason = "toolUse";
		} else if (type === "error") throw new Error(`Error Code ${stringifyUnknown(event.code, "unknown")}: ${stringifyUnknown(event.message, "Unknown error")}`);
		else if (type === "response.failed") {
			const response = event.response;
			const msg = response?.error ? `${response.error.code || "unknown"}: ${response.error.message || "no message"}` : response?.incomplete_details?.reason ? `incomplete: ${response.incomplete_details.reason}` : "Unknown error (no error details in response)";
			throw new Error(msg);
		}
	}
}
function mapResponsesStopReason(status) {
	if (!status) return "stop";
	switch (status) {
		case "completed": return "stop";
		case "incomplete": return "length";
		case "failed":
		case "cancelled": return "error";
		case "in_progress":
		case "queued": return "stop";
		default: throw new Error(`Unhandled stop reason: ${status}`);
	}
}
function buildOpenAIClientHeaders(model, context, optionHeaders, turnHeaders) {
	const headers = { ...model.headers };
	if (model.provider === "github-copilot") Object.assign(headers, buildCopilotDynamicHeaders({
		messages: context.messages,
		hasImages: hasCopilotVisionInput(context.messages)
	}));
	if (optionHeaders) Object.assign(headers, optionHeaders);
	if (turnHeaders) Object.assign(headers, turnHeaders);
	return headers;
}
function resolveProviderTransportTurnState(model, params) {
	return resolveProviderTransportTurnStateWithPlugin({
		provider: model.provider,
		context: {
			provider: model.provider,
			modelId: model.id,
			model,
			sessionId: params.sessionId,
			turnId: params.turnId,
			attempt: params.attempt,
			transport: params.transport
		}
	});
}
function resolveOpenAISdkTimeoutMs(model) {
	return resolveModelRequestTimeoutMs(model, void 0);
}
function buildOpenAISdkClientOptions(model) {
	const timeout = resolveOpenAISdkTimeoutMs(model);
	return timeout === void 0 ? {} : { timeout };
}
function buildOpenAISdkRequestOptions(model, signal) {
	const timeout = resolveOpenAISdkTimeoutMs(model);
	if (timeout === void 0 && !signal) return;
	return {
		...signal ? { signal } : {},
		...timeout !== void 0 ? { timeout } : {}
	};
}
function createOpenAIResponsesClient(model, context, apiKey, optionHeaders, turnHeaders) {
	return new OpenAI({
		apiKey,
		baseURL: model.baseUrl,
		dangerouslyAllowBrowser: true,
		defaultHeaders: buildOpenAIClientHeaders(model, context, optionHeaders, turnHeaders),
		fetch: buildGuardedModelFetch(model),
		...buildOpenAISdkClientOptions(model)
	});
}
function createOpenAIResponsesTransportStreamFn() {
	return (model, context, options) => {
		const eventStream = createAssistantMessageEventStream();
		const stream = eventStream;
		(async () => {
			const output = {
				role: "assistant",
				content: [],
				api: model.api,
				provider: model.provider,
				model: model.id,
				usage: {
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
				},
				stopReason: "stop",
				timestamp: Date.now()
			};
			try {
				const apiKey = options?.apiKey || getEnvApiKey(model.provider) || "";
				const turnState = resolveProviderTransportTurnState(model, {
					sessionId: options?.sessionId,
					turnId: randomUUID(),
					attempt: 1,
					transport: "stream"
				});
				const client = createOpenAIResponsesClient(model, context, apiKey, options?.headers, turnState?.headers);
				let params = buildOpenAIResponsesParams(model, context, options, turnState?.metadata);
				const nextParams = await options?.onPayload?.(params, model);
				if (nextParams !== void 0) params = nextParams;
				params = mergeTransportMetadata(params, turnState?.metadata);
				const responseStream = await client.responses.create(params, buildOpenAISdkRequestOptions(model, options?.signal));
				stream.push({
					type: "start",
					partial: output
				});
				await processResponsesStream(responseStream, output, stream, model, {
					serviceTier: options?.serviceTier,
					applyServiceTierPricing
				});
				if (options?.signal?.aborted) throw new Error("Request was aborted");
				if (output.stopReason === "aborted" || output.stopReason === "error") throw new Error("An unknown error occurred");
				stream.push({
					type: "done",
					reason: output.stopReason,
					message: output
				});
				stream.end();
			} catch (error) {
				output.stopReason = options?.signal?.aborted ? "aborted" : "error";
				output.errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
				stream.push({
					type: "error",
					reason: output.stopReason,
					error: output
				});
				stream.end();
			}
		})();
		return eventStream;
	};
}
function resolveCacheRetention(cacheRetention) {
	if (cacheRetention === "short" || cacheRetention === "long" || cacheRetention === "none") return cacheRetention;
	if (typeof process !== "undefined" && process.env.PI_CACHE_RETENTION === "long") return "long";
	return "short";
}
function getPromptCacheRetention(baseUrl, cacheRetention) {
	if (cacheRetention !== "long") return;
	return baseUrl?.includes("api.openai.com") ? "24h" : void 0;
}
function resolveOpenAIReasoningEffort(options) {
	return normalizeOpenAIReasoningEffort(options?.reasoningEffort ?? options?.reasoning ?? "high");
}
function isRecord(value) {
	return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
function hasResponsesWebSearchTool(tools) {
	if (!Array.isArray(tools)) return false;
	return tools.some((tool) => {
		if (!isRecord(tool)) return false;
		if (tool.type === "web_search") return true;
		if (tool.type === "function" && tool.name === "web_search") return true;
		const fn = tool.function;
		return isRecord(fn) && fn.name === "web_search";
	});
}
function raiseMinimalReasoningForResponsesWebSearch(params) {
	if (params.effort !== "minimal" || !hasResponsesWebSearchTool(params.tools)) return params.effort;
	for (const effort of [
		"low",
		"medium",
		"high"
	]) {
		const resolved = resolveOpenAIReasoningEffortForModel({
			model: params.model,
			effort
		});
		if (resolved && resolved !== "none" && resolved !== "minimal") return resolved;
	}
	return params.effort;
}
function isOpenAICodexResponsesModel(model) {
	return model.provider === "openai-codex" && model.api === "openai-codex-responses";
}
function buildOpenAICodexResponsesInstructions(context) {
	if (!context.systemPrompt) return;
	return sanitizeTransportPayloadText(stripSystemPromptCacheBoundary(context.systemPrompt));
}
function buildOpenAIResponsesParams(model, context, options, metadata) {
	const isCodexResponses = isOpenAICodexResponsesModel(model);
	const compat = getCompat(model);
	const supportsDeveloperRole = typeof compat.supportsDeveloperRole === "boolean" ? compat.supportsDeveloperRole : void 0;
	const messages = convertResponsesMessages(model, context, new Set([
		"openai",
		"openai-codex",
		"opencode",
		"azure-openai-responses"
	]), {
		includeSystemPrompt: !isCodexResponses,
		supportsDeveloperRole
	});
	const cacheRetention = resolveCacheRetention(options?.cacheRetention);
	const payloadPolicy = resolveOpenAIResponsesPayloadPolicy(model, { storeMode: "disable" });
	const params = {
		model: model.id,
		input: messages,
		stream: true,
		prompt_cache_key: cacheRetention === "none" ? void 0 : options?.sessionId,
		prompt_cache_retention: getPromptCacheRetention(model.baseUrl, cacheRetention),
		...isCodexResponses ? { instructions: buildOpenAICodexResponsesInstructions(context) } : {},
		...metadata ? { metadata } : {}
	};
	if (options?.maxTokens) params.max_output_tokens = options.maxTokens;
	if (options?.temperature !== void 0) params.temperature = options.temperature;
	if (options?.serviceTier !== void 0 && payloadPolicy.allowsServiceTier) params.service_tier = options.serviceTier;
	if (context.tools) params.tools = convertResponsesTools(context.tools, model, { strict: resolveOpenAIStrictToolSetting(model, { transport: "stream" }) });
	if (model.reasoning) {
		if (options?.reasoningEffort || options?.reasoning || options?.reasoningSummary) {
			const resolvedReasoningEffort = resolveOpenAIReasoningEffortForModel({
				model,
				effort: resolveOpenAIReasoningEffort(options)
			});
			const reasoningEffort = resolvedReasoningEffort ? raiseMinimalReasoningForResponsesWebSearch({
				model,
				effort: resolvedReasoningEffort,
				tools: params.tools
			}) : void 0;
			if (reasoningEffort) {
				params.reasoning = {
					effort: reasoningEffort,
					...reasoningEffort === "none" ? {} : { summary: options?.reasoningSummary || "auto" }
				};
				if (reasoningEffort !== "none") params.include = ["reasoning.encrypted_content"];
			}
		} else if (model.provider !== "github-copilot") {
			const reasoningEffort = resolveOpenAIReasoningEffortForModel({
				model,
				effort: "none"
			});
			if (reasoningEffort) params.reasoning = { effort: reasoningEffort };
		}
	}
	applyOpenAIResponsesPayloadPolicy(params, payloadPolicy);
	return params;
}
function createAzureOpenAIResponsesTransportStreamFn() {
	return (model, context, options) => {
		const eventStream = createAssistantMessageEventStream();
		const stream = eventStream;
		(async () => {
			const output = {
				role: "assistant",
				content: [],
				api: "azure-openai-responses",
				provider: model.provider,
				model: model.id,
				usage: {
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
				},
				stopReason: "stop",
				timestamp: Date.now()
			};
			try {
				const apiKey = options?.apiKey || getEnvApiKey(model.provider) || "";
				const turnState = resolveProviderTransportTurnState(model, {
					sessionId: options?.sessionId,
					turnId: randomUUID(),
					attempt: 1,
					transport: "stream"
				});
				const client = createAzureOpenAIClient(model, context, apiKey, options?.headers, turnState?.headers);
				let params = buildAzureOpenAIResponsesParams(model, context, options, resolveAzureDeploymentName(model), turnState?.metadata);
				const nextParams = await options?.onPayload?.(params, model);
				if (nextParams !== void 0) params = nextParams;
				params = mergeTransportMetadata(params, turnState?.metadata);
				const responseStream = await client.responses.create(params, buildOpenAISdkRequestOptions(model, options?.signal));
				stream.push({
					type: "start",
					partial: output
				});
				await processResponsesStream(responseStream, output, stream, model);
				if (options?.signal?.aborted) throw new Error("Request was aborted");
				if (output.stopReason === "aborted" || output.stopReason === "error") throw new Error("An unknown error occurred");
				stream.push({
					type: "done",
					reason: output.stopReason,
					message: output
				});
				stream.end();
			} catch (error) {
				output.stopReason = options?.signal?.aborted ? "aborted" : "error";
				output.errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
				stream.push({
					type: "error",
					reason: output.stopReason,
					error: output
				});
				stream.end();
			}
		})();
		return eventStream;
	};
}
function normalizeAzureBaseUrl(baseUrl) {
	return baseUrl.replace(/\/+$/, "");
}
function resolveAzureDeploymentName(model) {
	const deploymentMap = process.env.AZURE_OPENAI_DEPLOYMENT_NAME_MAP;
	if (deploymentMap) for (const entry of deploymentMap.split(",")) {
		const [modelId, deploymentName] = entry.split("=", 2).map((value) => value?.trim());
		if (modelId === model.id && deploymentName) return deploymentName;
	}
	return model.id;
}
function createAzureOpenAIClient(model, context, apiKey, optionHeaders, turnHeaders) {
	return new AzureOpenAI({
		apiKey,
		apiVersion: resolveAzureOpenAIApiVersion(),
		dangerouslyAllowBrowser: true,
		defaultHeaders: buildOpenAIClientHeaders(model, context, optionHeaders, turnHeaders),
		baseURL: normalizeAzureBaseUrl(model.baseUrl),
		fetch: buildGuardedModelFetch(model),
		...buildOpenAISdkClientOptions(model)
	});
}
function buildAzureOpenAIResponsesParams(model, context, options, deploymentName, metadata) {
	const params = buildOpenAIResponsesParams(model, context, options, metadata);
	params.model = deploymentName;
	delete params.store;
	return params;
}
function hasToolHistory(messages) {
	return messages.some((message) => message.role === "toolResult" || message.role === "assistant" && message.content.some((block) => block.type === "toolCall"));
}
function createOpenAICompletionsClient(model, context, apiKey, optionHeaders) {
	const clientConfig = buildOpenAICompletionsClientConfig(model, context, optionHeaders);
	return new OpenAI({
		apiKey,
		baseURL: clientConfig.baseURL,
		dangerouslyAllowBrowser: true,
		defaultHeaders: clientConfig.defaultHeaders,
		defaultQuery: clientConfig.defaultQuery,
		fetch: buildGuardedModelFetch(model),
		...buildOpenAISdkClientOptions(model)
	});
}
function isAzureOpenAICompatibleHost(hostname) {
	return hostname.endsWith(".openai.azure.com") || hostname.endsWith(".services.ai.azure.com") || hostname.endsWith(".cognitiveservices.azure.com");
}
function buildOpenAICompletionsClientConfig(model, context, optionHeaders) {
	const headers = buildOpenAIClientHeaders(model, context, optionHeaders);
	const defaultQuery = {};
	let baseURL = model.baseUrl;
	let isAzureHost = false;
	try {
		const parsed = new URL(model.baseUrl);
		isAzureHost = isAzureOpenAICompatibleHost(parsed.hostname.toLowerCase());
		parsed.searchParams.forEach((value, key) => {
			if (value) defaultQuery[key] = value;
		});
		parsed.search = "";
		baseURL = parsed.toString().replace(/\/$/, "");
	} catch {}
	if (isAzureHost) {
		const apiVersionHeader = Object.keys(headers).find((key) => key.toLowerCase() === "api-version");
		if (apiVersionHeader) {
			const apiVersion = headers[apiVersionHeader]?.trim();
			delete headers[apiVersionHeader];
			if (apiVersion && !defaultQuery["api-version"]) defaultQuery["api-version"] = apiVersion;
		}
	}
	return {
		baseURL,
		defaultHeaders: headers,
		defaultQuery: Object.keys(defaultQuery).length > 0 ? defaultQuery : void 0
	};
}
function createOpenAICompletionsTransportStreamFn() {
	return (model, context, options) => {
		const eventStream = createAssistantMessageEventStream();
		const stream = eventStream;
		(async () => {
			const output = {
				role: "assistant",
				content: [],
				api: model.api,
				provider: model.provider,
				model: model.id,
				usage: {
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
				},
				stopReason: "stop",
				timestamp: Date.now()
			};
			try {
				const client = createOpenAICompletionsClient(model, context, options?.apiKey || getEnvApiKey(model.provider) || "", options?.headers);
				let params = buildOpenAICompletionsParams(model, context, options);
				const nextParams = await options?.onPayload?.(params, model);
				if (nextParams !== void 0) params = nextParams;
				const responseStream = await client.chat.completions.create(params, buildOpenAISdkRequestOptions(model, options?.signal));
				stream.push({
					type: "start",
					partial: output
				});
				await processOpenAICompletionsStream(responseStream, output, model, stream);
				if (options?.signal?.aborted) throw new Error("Request was aborted");
				stream.push({
					type: "done",
					reason: output.stopReason,
					message: output
				});
				stream.end();
			} catch (error) {
				output.stopReason = options?.signal?.aborted ? "aborted" : "error";
				output.errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
				stream.push({
					type: "error",
					reason: output.stopReason,
					error: output
				});
				stream.end();
			}
		})();
		return eventStream;
	};
}
async function processOpenAICompletionsStream(responseStream, output, model, stream) {
	const MAX_POST_TOOL_CALL_BUFFER_BYTES = 256e3;
	const MAX_TOOL_CALL_ARGUMENT_BUFFER_BYTES = 256e3;
	const compat = getCompat(model);
	let currentBlock = null;
	let pendingPostToolCallDeltas = [];
	let pendingPostToolCallBytes = 0;
	let currentToolCallArgumentBytes = 0;
	let isFlushingPendingPostToolCallDeltas = false;
	const blockIndex = () => output.content.length - 1;
	const measureUtf8Bytes = (text) => Buffer.byteLength(text, "utf8");
	const finishCurrentBlock = () => {
		if (!currentBlock) return;
		if (currentBlock.type === "toolCall") {
			currentBlock.arguments = parseStreamingJson(currentBlock.partialArgs);
			const completed = {
				...currentBlock,
				arguments: parseStreamingJson(currentBlock.partialArgs)
			};
			output.content[blockIndex()] = completed;
		}
	};
	const queuePostToolCallDelta = (next) => {
		const nextBytes = measureUtf8Bytes(next.text);
		if (pendingPostToolCallBytes + nextBytes > MAX_POST_TOOL_CALL_BUFFER_BYTES) throw new Error("Exceeded post-tool-call delta buffer limit");
		pendingPostToolCallBytes += nextBytes;
		const previous = pendingPostToolCallDeltas[pendingPostToolCallDeltas.length - 1];
		if (!previous || previous.kind !== next.kind) {
			pendingPostToolCallDeltas.push(next);
			return;
		}
		if (next.kind === "thinking" && previous.kind === "thinking") {
			if (previous.signature !== next.signature) {
				pendingPostToolCallDeltas.push(next);
				return;
			}
			previous.text += next.text;
			return;
		}
		previous.text += next.text;
	};
	const appendThinkingDeltaInternal = (reasoningDelta) => {
		if (!currentBlock || currentBlock.type !== "thinking") {
			finishCurrentBlock();
			currentBlock = {
				type: "thinking",
				thinking: "",
				thinkingSignature: reasoningDelta.signature
			};
			output.content.push(currentBlock);
			stream.push({
				type: "thinking_start",
				contentIndex: blockIndex(),
				partial: output
			});
		}
		currentBlock.thinking += reasoningDelta.text;
		stream.push({
			type: "thinking_delta",
			contentIndex: blockIndex(),
			delta: reasoningDelta.text,
			partial: output
		});
	};
	const appendTextDeltaInternal = (text) => {
		if (!currentBlock || currentBlock.type !== "text") {
			finishCurrentBlock();
			currentBlock = {
				type: "text",
				text: ""
			};
			output.content.push(currentBlock);
			stream.push({
				type: "text_start",
				contentIndex: blockIndex(),
				partial: output
			});
		}
		currentBlock.text += text;
		stream.push({
			type: "text_delta",
			contentIndex: blockIndex(),
			delta: text,
			partial: output
		});
	};
	const flushPendingPostToolCallDeltas = () => {
		if (isFlushingPendingPostToolCallDeltas || currentBlock?.type === "toolCall" || pendingPostToolCallDeltas.length === 0) return;
		isFlushingPendingPostToolCallDeltas = true;
		const bufferedDeltas = pendingPostToolCallDeltas;
		pendingPostToolCallDeltas = [];
		pendingPostToolCallBytes = 0;
		for (const delta of bufferedDeltas) if (delta.kind === "text") appendTextDeltaInternal(delta.text);
		else appendThinkingDeltaInternal(delta);
		isFlushingPendingPostToolCallDeltas = false;
	};
	const appendThinkingDelta = (reasoningDelta) => {
		flushPendingPostToolCallDeltas();
		appendThinkingDeltaInternal(reasoningDelta);
	};
	const appendTextDelta = (text) => {
		flushPendingPostToolCallDeltas();
		appendTextDeltaInternal(text);
	};
	for await (const rawChunk of responseStream) {
		if (!rawChunk || typeof rawChunk !== "object") continue;
		const chunk = rawChunk;
		output.responseId ||= chunk.id;
		if (chunk.usage) output.usage = parseTransportChunkUsage(chunk.usage, model);
		const choice = Array.isArray(chunk.choices) ? chunk.choices[0] : void 0;
		if (!choice) continue;
		const choiceUsage = choice.usage;
		if (!chunk.usage && choiceUsage) output.usage = parseTransportChunkUsage(choiceUsage, model);
		if (choice.finish_reason) {
			const finishReasonResult = mapStopReason(choice.finish_reason);
			output.stopReason = finishReasonResult.stopReason;
			if (finishReasonResult.errorMessage) output.errorMessage = finishReasonResult.errorMessage;
		}
		if (!choice.delta) continue;
		if (choice.delta.content) {
			if (currentBlock?.type === "toolCall") queuePostToolCallDelta({
				kind: "text",
				text: choice.delta.content
			});
			else appendTextDelta(choice.delta.content);
			continue;
		}
		const reasoningDeltas = getCompletionsReasoningDeltas(choice.delta, compat.visibleReasoningDetailTypes);
		for (const reasoningDelta of reasoningDeltas) {
			if (currentBlock?.type === "toolCall") {
				queuePostToolCallDelta({ ...reasoningDelta });
				continue;
			}
			if (reasoningDelta.kind === "text") appendTextDelta(reasoningDelta.text);
			else appendThinkingDelta(reasoningDelta);
		}
		if (choice.delta.tool_calls && choice.delta.tool_calls.length > 0) for (const toolCall of choice.delta.tool_calls) {
			if (!currentBlock || currentBlock.type !== "toolCall" || toolCall.id && currentBlock.id !== toolCall.id) {
				const switchingToolCall = currentBlock?.type === "toolCall";
				finishCurrentBlock();
				if (switchingToolCall) {
					currentBlock = null;
					flushPendingPostToolCallDeltas();
				}
				const initialSig = extractGoogleThoughtSignature(toolCall);
				currentBlock = {
					type: "toolCall",
					id: toolCall.id || "",
					name: toolCall.function?.name || "",
					arguments: {},
					partialArgs: "",
					...initialSig ? { thoughtSignature: initialSig } : {}
				};
				currentToolCallArgumentBytes = 0;
				output.content.push(currentBlock);
				stream.push({
					type: "toolcall_start",
					contentIndex: blockIndex(),
					partial: output
				});
			}
			if (currentBlock.type !== "toolCall") continue;
			if (toolCall.id) currentBlock.id = toolCall.id;
			if (toolCall.function?.name) currentBlock.name = toolCall.function.name;
			const deltaSig = extractGoogleThoughtSignature(toolCall);
			if (deltaSig) currentBlock.thoughtSignature = deltaSig;
			if (toolCall.function?.arguments) {
				const nextArgumentBytes = measureUtf8Bytes(toolCall.function.arguments);
				if (currentToolCallArgumentBytes + nextArgumentBytes > MAX_TOOL_CALL_ARGUMENT_BUFFER_BYTES) throw new Error("Exceeded tool-call argument buffer limit");
				currentToolCallArgumentBytes += nextArgumentBytes;
				currentBlock.partialArgs += toolCall.function.arguments;
				currentBlock.arguments = parseStreamingJson(currentBlock.partialArgs);
				stream.push({
					type: "toolcall_delta",
					contentIndex: blockIndex(),
					delta: toolCall.function.arguments,
					partial: output
				});
			}
		}
		flushPendingPostToolCallDeltas();
	}
	finishCurrentBlock();
	if (currentBlock?.type === "toolCall") currentBlock = null;
	flushPendingPostToolCallDeltas();
	const hasToolCalls = output.content.some((block) => block.type === "toolCall");
	if (output.stopReason === "toolUse" && !hasToolCalls) output.stopReason = "stop";
}
function getCompletionsReasoningDeltas(delta, visibleReasoningDetailTypes) {
	const output = [];
	const pushDelta = (next) => {
		const previous = output[output.length - 1];
		if (!previous || previous.kind !== next.kind) {
			output.push(next);
			return;
		}
		if (next.kind === "thinking" && previous.kind === "thinking") {
			if (previous.signature !== next.signature) {
				output.push(next);
				return;
			}
			previous.text += next.text;
			return;
		}
		previous.text += next.text;
	};
	const reasoningDetails = delta.reasoning_details;
	let usedReasoningThinkingDetails = false;
	if (Array.isArray(reasoningDetails)) {
		const visibleTypes = new Set(visibleReasoningDetailTypes);
		for (const item of reasoningDetails) {
			const detail = item;
			if (typeof detail.text !== "string" || !detail.text) continue;
			if (detail.type === "reasoning.text") {
				usedReasoningThinkingDetails = true;
				pushDelta({
					kind: "thinking",
					signature: "reasoning_details",
					text: detail.text
				});
				continue;
			}
			if (typeof detail.type === "string" && visibleTypes.has(detail.type)) pushDelta({
				kind: "text",
				text: detail.text
			});
		}
	}
	if (!usedReasoningThinkingDetails) for (const field of [
		"reasoning_content",
		"reasoning",
		"reasoning_text"
	]) {
		const value = delta[field];
		if (typeof value === "string" && value.length > 0) {
			pushDelta({
				kind: "thinking",
				signature: field,
				text: value
			});
			break;
		}
	}
	return output;
}
function detectCompat(model) {
	const { defaults: compatDefaults } = detectOpenAICompletionsCompat(model);
	return {
		supportsStore: compatDefaults.supportsStore,
		supportsDeveloperRole: compatDefaults.supportsDeveloperRole,
		supportsReasoningEffort: compatDefaults.supportsReasoningEffort,
		reasoningEffortMap: {},
		supportsUsageInStreaming: compatDefaults.supportsUsageInStreaming,
		maxTokensField: compatDefaults.maxTokensField,
		requiresToolResultName: false,
		requiresAssistantAfterToolResult: false,
		requiresThinkingAsText: false,
		thinkingFormat: compatDefaults.thinkingFormat,
		visibleReasoningDetailTypes: compatDefaults.visibleReasoningDetailTypes,
		openRouterRouting: {},
		vercelGatewayRouting: {},
		supportsStrictMode: compatDefaults.supportsStrictMode
	};
}
function getCompat(model) {
	const detected = detectCompat(model);
	const compat = model.compat ?? {};
	const supportsStore = typeof compat.supportsStore === "boolean" ? compat.supportsStore : detected.supportsStore;
	const supportsReasoningEffort = typeof compat.supportsReasoningEffort === "boolean" ? compat.supportsReasoningEffort : detected.supportsReasoningEffort;
	return {
		supportsStore,
		supportsDeveloperRole: compat.supportsDeveloperRole ?? detected.supportsDeveloperRole,
		supportsReasoningEffort,
		reasoningEffortMap: resolveOpenAIReasoningEffortMap(model, detected.reasoningEffortMap),
		supportsUsageInStreaming: compat.supportsUsageInStreaming ?? detected.supportsUsageInStreaming,
		maxTokensField: compat.maxTokensField ?? detected.maxTokensField,
		requiresToolResultName: compat.requiresToolResultName ?? detected.requiresToolResultName,
		requiresAssistantAfterToolResult: compat.requiresAssistantAfterToolResult ?? detected.requiresAssistantAfterToolResult,
		requiresThinkingAsText: compat.requiresThinkingAsText ?? detected.requiresThinkingAsText,
		thinkingFormat: compat.thinkingFormat ?? detected.thinkingFormat,
		openRouterRouting: compat.openRouterRouting ?? {},
		vercelGatewayRouting: compat.vercelGatewayRouting ?? detected.vercelGatewayRouting,
		supportsStrictMode: compat.supportsStrictMode ?? detected.supportsStrictMode,
		supportsPromptCacheKey: compat.supportsPromptCacheKey === true,
		requiresStringContent: compat.requiresStringContent ?? false,
		visibleReasoningDetailTypes: compat.visibleReasoningDetailTypes ?? detected.visibleReasoningDetailTypes
	};
}
function resolveOpenAICompletionsReasoningEffort(options) {
	return options?.reasoningEffort ?? options?.reasoning ?? "high";
}
function convertTools(tools, compat, model) {
	const strict = resolveOpenAIStrictToolFlagWithDiagnostics(tools, resolveOpenAIStrictToolSetting(model, {
		transport: "stream",
		supportsStrictMode: compat?.supportsStrictMode
	}), {
		transport: "completions",
		model
	});
	return tools.map((tool) => ({
		type: "function",
		function: {
			name: tool.name,
			description: tool.description,
			parameters: normalizeOpenAIStrictToolParameters(tool.parameters, strict === true),
			...strict === void 0 ? {} : { strict }
		}
	}));
}
function extractGoogleThoughtSignature(toolCall) {
	const tc = toolCall;
	if (!tc) return;
	const fromExtra = (tc.extra_content?.google)?.thought_signature;
	if (typeof fromExtra === "string" && fromExtra.length > 0) return fromExtra;
	const fromFunction = tc.function?.thought_signature;
	return typeof fromFunction === "string" && fromFunction.length > 0 ? fromFunction : void 0;
}
function isGoogleOpenAICompatModel(model) {
	const endpointClass = detectOpenAICompletionsCompat(model).capabilities.endpointClass;
	return model.provider === "google" || endpointClass === "google-generative-ai" || endpointClass === "google-vertex";
}
function injectToolCallThoughtSignatures(outgoingMessages, context, model) {
	if (!isGoogleOpenAICompatModel(model)) return;
	const sigById = /* @__PURE__ */ new Map();
	for (const msg of context.messages ?? []) {
		if (msg.role !== "assistant") continue;
		const source = msg;
		if (source.api !== model.api || source.provider !== model.provider || source.model !== model.id) continue;
		if (!Array.isArray(source.content)) continue;
		for (const block of source.content) {
			if (block.type !== "toolCall") continue;
			const id = block.id;
			const sig = block.thoughtSignature;
			if (typeof id === "string" && typeof sig === "string" && sig.length > 0) sigById.set(id, sig);
		}
	}
	if (sigById.size === 0) return;
	for (const message of outgoingMessages) {
		const toolCalls = message.tool_calls;
		if (!Array.isArray(toolCalls)) continue;
		for (const toolCall of toolCalls) {
			const id = toolCall.id;
			if (typeof id !== "string") continue;
			const sig = sigById.get(id);
			if (!sig) continue;
			const extra = toolCall.extra_content && typeof toolCall.extra_content === "object" ? toolCall.extra_content : {};
			toolCall.extra_content = extra;
			const google = extra.google && typeof extra.google === "object" ? extra.google : {};
			extra.google = google;
			google.thought_signature = sig;
		}
	}
}
function buildOpenAICompletionsParams(model, context, options) {
	const compat = getCompat(model);
	const compatDetection = detectOpenAICompletionsCompat(model);
	const messages = convertMessages(model, context.systemPrompt ? {
		...context,
		systemPrompt: stripSystemPromptCacheBoundary(context.systemPrompt)
	} : context, compat);
	injectToolCallThoughtSignatures(messages, context, model);
	const cacheRetention = resolveCacheRetention(options?.cacheRetention);
	const params = {
		model: model.id,
		messages: compat.requiresStringContent ? flattenCompletionMessagesToStringContent(messages) : messages,
		stream: true,
		stream_options: { include_usage: true }
	};
	if (compat.supportsStore) params.store = false;
	if (compat.supportsPromptCacheKey && cacheRetention !== "none" && options?.sessionId) params.prompt_cache_key = options.sessionId;
	if (options?.maxTokens) if (compat.maxTokensField === "max_tokens") params.max_tokens = options.maxTokens;
	else params.max_completion_tokens = options.maxTokens;
	if (options?.temperature !== void 0) params.temperature = options.temperature;
	if (context.tools) {
		params.tools = convertTools(context.tools, compat, model);
		if (options?.toolChoice) params.tool_choice = options.toolChoice;
		else if (compatDetection.capabilities.usesExplicitProxyLikeEndpoint && Array.isArray(params.tools) && params.tools.length > 0) params.tool_choice = "auto";
	} else if (hasToolHistory(context.messages)) params.tools = [];
	const completionsReasoningEffort = resolveOpenAICompletionsReasoningEffort(options);
	const resolvedCompletionsReasoningEffort = completionsReasoningEffort ? resolveOpenAIReasoningEffortForModel({
		model,
		effort: completionsReasoningEffort,
		fallbackMap: compat.reasoningEffortMap
	}) : void 0;
	if (compat.thinkingFormat === "openrouter" && model.reasoning && resolvedCompletionsReasoningEffort) params.reasoning = { effort: resolvedCompletionsReasoningEffort };
	else if (resolvedCompletionsReasoningEffort && model.reasoning && compat.supportsReasoningEffort) params.reasoning_effort = resolvedCompletionsReasoningEffort;
	return params;
}
function parseTransportChunkUsage(rawUsage, model) {
	const cachedTokens = rawUsage.prompt_tokens_details?.cached_tokens || 0;
	const promptTokens = rawUsage.prompt_tokens || 0;
	const input = Math.max(0, promptTokens - cachedTokens);
	const outputTokens = rawUsage.completion_tokens || 0;
	const usage = {
		input,
		output: outputTokens,
		cacheRead: cachedTokens,
		cacheWrite: 0,
		totalTokens: input + outputTokens + cachedTokens,
		cost: {
			input: 0,
			output: 0,
			cacheRead: 0,
			cacheWrite: 0,
			total: 0
		}
	};
	calculateCost(model, usage);
	return usage;
}
function mapStopReason(reason) {
	if (reason === null) return { stopReason: "stop" };
	switch (reason) {
		case "stop":
		case "end": return { stopReason: "stop" };
		case "length": return { stopReason: "length" };
		case "function_call":
		case "tool_call":
		case "tool_calls": return { stopReason: "toolUse" };
		case "content_filter": return {
			stopReason: "error",
			errorMessage: "Provider finish_reason: content_filter"
		};
		case "network_error": return {
			stopReason: "error",
			errorMessage: "Provider finish_reason: network_error"
		};
		default: return {
			stopReason: "error",
			errorMessage: `Provider finish_reason: ${reason}`
		};
	}
}
//#endregion
//#region src/agents/provider-transport-stream.ts
const SUPPORTED_TRANSPORT_APIS = new Set([
	"openai-responses",
	"openai-codex-responses",
	"openai-completions",
	"azure-openai-responses",
	"anthropic-messages",
	"google-generative-ai"
]);
const SIMPLE_TRANSPORT_API_ALIAS = {
	"openai-responses": "openclaw-openai-responses-transport",
	"openai-codex-responses": "openclaw-openai-responses-transport",
	"openai-completions": "openclaw-openai-completions-transport",
	"azure-openai-responses": "openclaw-azure-openai-responses-transport",
	"anthropic-messages": "openclaw-anthropic-messages-transport",
	"google-generative-ai": "openclaw-google-generative-ai-transport"
};
function createProviderOwnedGoogleTransportStreamFn(model, ctx) {
	return resolveProviderStreamFn({
		provider: model.provider,
		config: ctx?.cfg,
		workspaceDir: ctx?.workspaceDir,
		env: ctx?.env,
		context: {
			config: ctx?.cfg,
			agentDir: ctx?.agentDir,
			workspaceDir: ctx?.workspaceDir,
			provider: model.provider,
			modelId: model.id,
			model
		}
	}) ?? resolveProviderStreamFn({
		provider: "google",
		config: ctx?.cfg,
		workspaceDir: ctx?.workspaceDir,
		env: ctx?.env,
		context: {
			config: ctx?.cfg,
			agentDir: ctx?.agentDir,
			workspaceDir: ctx?.workspaceDir,
			provider: model.provider,
			modelId: model.id,
			model
		}
	}) ?? void 0;
}
function createSupportedTransportStreamFn(model, ctx) {
	switch (model.api) {
		case "openai-responses":
		case "openai-codex-responses": return createOpenAIResponsesTransportStreamFn();
		case "openai-completions": return createOpenAICompletionsTransportStreamFn();
		case "azure-openai-responses": return createAzureOpenAIResponsesTransportStreamFn();
		case "anthropic-messages": return createAnthropicMessagesTransportStreamFn();
		case "google-generative-ai": return createProviderOwnedGoogleTransportStreamFn(model, ctx);
		default: return;
	}
}
function hasTransportOverrides(model) {
	const request = getModelProviderRequestTransport(model);
	return Boolean(request?.proxy || request?.tls);
}
function isTransportAwareApiSupported(api) {
	return SUPPORTED_TRANSPORT_APIS.has(api);
}
function resolveTransportAwareSimpleApi(api) {
	return SIMPLE_TRANSPORT_API_ALIAS[api];
}
function createTransportAwareStreamFnForModel(model, ctx) {
	if (!hasTransportOverrides(model)) return;
	if (!isTransportAwareApiSupported(model.api)) throw new Error(`Model-provider request.proxy/request.tls is not yet supported for api "${model.api}"`);
	return createSupportedTransportStreamFn(model, ctx);
}
function createBoundaryAwareStreamFnForModel(model, ctx) {
	if (!isTransportAwareApiSupported(model.api)) return;
	return createSupportedTransportStreamFn(model, ctx);
}
function prepareTransportAwareSimpleModel(model, ctx) {
	const streamFn = createTransportAwareStreamFnForModel(model, ctx);
	const alias = resolveTransportAwareSimpleApi(model.api);
	if (!streamFn || !alias) return model;
	return {
		...model,
		api: alias
	};
}
function buildTransportAwareSimpleStreamFn(model, ctx) {
	return createTransportAwareStreamFnForModel(model, ctx);
}
//#endregion
//#region src/agents/custom-api-registry.ts
const CUSTOM_API_SOURCE_PREFIX = "openclaw-custom-api:";
function getCustomApiRegistrySourceId(api) {
	return `${CUSTOM_API_SOURCE_PREFIX}${api}`;
}
function ensureCustomApiRegistered(api, streamFn) {
	if (getApiProvider(api)) return false;
	registerApiProvider({
		api,
		stream: (model, context, options) => streamFn(model, context, options),
		streamSimple: (model, context, options) => streamFn(model, context, options)
	}, getCustomApiRegistrySourceId(api));
	return true;
}
//#endregion
//#region src/agents/provider-stream.ts
function registerProviderStreamForModel(params) {
	const streamFn = resolveProviderStreamFn({
		provider: params.model.provider,
		config: params.cfg,
		workspaceDir: params.workspaceDir,
		env: params.env,
		context: {
			config: params.cfg,
			agentDir: params.agentDir,
			workspaceDir: params.workspaceDir,
			provider: params.model.provider,
			modelId: params.model.id,
			model: params.model
		}
	}) ?? createTransportAwareStreamFnForModel(params.model, {
		cfg: params.cfg,
		agentDir: params.agentDir,
		workspaceDir: params.workspaceDir,
		env: params.env
	});
	if (!streamFn) return;
	ensureCustomApiRegistered(params.model.api, streamFn);
	return streamFn;
}
//#endregion
export { prepareTransportAwareSimpleModel as a, mapOpenAIReasoningEffortForModel as c, createBoundaryAwareStreamFnForModel as i, resolveOpenAIStrictToolSetting as l, ensureCustomApiRegistered as n, normalizeOpenAIStrictToolParameters as o, buildTransportAwareSimpleStreamFn as r, resolveOpenAIStrictToolFlagForInventory as s, registerProviderStreamForModel as t };
