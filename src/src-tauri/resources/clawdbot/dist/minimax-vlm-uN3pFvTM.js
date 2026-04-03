import { u as isRecord } from "./utils-CE3P21nG.js";
import { n as ensureAuthProfileStore } from "./store-CY-e50gT.js";
import "./auth-profiles-bVW1e9Dr.js";
import { n as DEFAULT_MODEL, r as DEFAULT_PROVIDER } from "./defaults-BwiMD7ye.js";
import { n as findNormalizedProviderValue } from "./provider-id-CTiEzT1T.js";
import { n as resolveAgentModelPrimaryValue, t as resolveAgentModelFallbackValues } from "./model-input-DR9jgad-.js";
import { h as resolveConfiguredModelRef } from "./model-selection-8a6zD_aX.js";
import { n as normalizeSecretInput } from "./normalize-secret-input-CRNbANMO.js";
import { n as listProfilesForProvider } from "./profiles-RmR8EAZC.js";
import { t as resolveEnvApiKey } from "./model-auth-env-Cr_twdPk.js";
import { P as sanitizeUserFacingText } from "./pi-embedded-helpers-CGU2Pfj9.js";
import "./model-auth-BxuwOp1l.js";
import { t as stripReasoningTagsFromText } from "./reasoning-tags-D1eMJn9V.js";
import { r as resolveToolDisplay, t as formatToolDetail } from "./tool-display-CSvtnoK0.js";
import { n as ensureGlobalUndiciEnvProxyDispatcher } from "./undici-global-dispatcher-DhfHLrpZ.js";
//#region src/shared/chat-content.ts
function extractTextFromChatContent(content, opts) {
	const normalizeText = opts?.normalizeText ?? ((text) => text.replace(/\s+/g, " ").trim());
	const joinWith = opts?.joinWith ?? " ";
	const coerceText = (value) => {
		if (typeof value === "string") return value;
		if (value == null) return "";
		if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint" || typeof value === "symbol") return String(value);
		if (typeof value === "object") try {
			return JSON.stringify(value) ?? "";
		} catch {
			return "";
		}
		return "";
	};
	const sanitize = (text) => {
		const raw = coerceText(text);
		return coerceText(opts?.sanitizeText ? opts.sanitizeText(raw) : raw);
	};
	const normalize = (text) => coerceText(normalizeText(coerceText(text)));
	if (typeof content === "string") {
		const normalized = normalize(sanitize(content));
		return normalized ? normalized : null;
	}
	if (!Array.isArray(content)) return null;
	const chunks = [];
	for (const block of content) {
		if (!block || typeof block !== "object") continue;
		if (block.type !== "text") continue;
		const text = block.text;
		const value = sanitize(text);
		if (value.trim()) chunks.push(value);
	}
	const joined = normalize(chunks.join(joinWith));
	return joined ? joined : null;
}
//#endregion
//#region src/agents/pi-embedded-utils.ts
function isAssistantMessage(msg) {
	return msg?.role === "assistant";
}
/**
* Strip malformed Minimax tool invocations that leak into text content.
* Minimax sometimes embeds tool calls as XML in text blocks instead of
* proper structured tool calls. This removes:
* - <invoke name="...">...</invoke> blocks
* - </minimax:tool_call> closing tags
*/
function stripMinimaxToolCallXml(text) {
	if (!text) return text;
	if (!/minimax:tool_call/i.test(text)) return text;
	let cleaned = text.replace(/<invoke\b[^>]*>[\s\S]*?<\/invoke>/gi, "");
	cleaned = cleaned.replace(/<\/?minimax:tool_call>/gi, "");
	return cleaned;
}
/**
* Strip model control tokens leaked into assistant text output.
*
* Models like GLM-5 and DeepSeek sometimes emit internal delimiter tokens
* (e.g. `<|assistant|>`, `<|tool_call_result_begin|>`, `<｜begin▁of▁sentence｜>`)
* in their responses. These use the universal `<|...|>` convention (ASCII or
* full-width pipe variants) and should never reach end users.
*
* This is a provider bug — no upstream fix tracked yet.
* Remove this function when upstream providers stop leaking tokens.
* @see https://github.com/openclaw/openclaw/issues/40020
*/
const MODEL_SPECIAL_TOKEN_RE = /<[|｜][^|｜]*[|｜]>/g;
function stripModelSpecialTokens(text) {
	if (!text) return text;
	if (!MODEL_SPECIAL_TOKEN_RE.test(text)) return text;
	MODEL_SPECIAL_TOKEN_RE.lastIndex = 0;
	return text.replace(MODEL_SPECIAL_TOKEN_RE, " ").replace(/  +/g, " ").trim();
}
/**
* Strip downgraded tool call text representations that leak into text content.
* When replaying history to Gemini, tool calls without `thought_signature` are
* downgraded to text blocks like `[Tool Call: name (ID: ...)]`. These should
* not be shown to users.
*/
function stripDowngradedToolCallText(text) {
	if (!text) return text;
	if (!/\[Tool (?:Call|Result)/i.test(text) && !/\[Historical context/i.test(text)) return text;
	const consumeJsonish = (input, start, options) => {
		const { allowLeadingNewlines = false } = options ?? {};
		let index = start;
		while (index < input.length) {
			const ch = input[index];
			if (ch === " " || ch === "	") {
				index += 1;
				continue;
			}
			if (allowLeadingNewlines && (ch === "\n" || ch === "\r")) {
				index += 1;
				continue;
			}
			break;
		}
		if (index >= input.length) return null;
		const startChar = input[index];
		if (startChar === "{" || startChar === "[") {
			let depth = 0;
			let inString = false;
			let escape = false;
			for (let i = index; i < input.length; i += 1) {
				const ch = input[i];
				if (inString) {
					if (escape) escape = false;
					else if (ch === "\\") escape = true;
					else if (ch === "\"") inString = false;
					continue;
				}
				if (ch === "\"") {
					inString = true;
					continue;
				}
				if (ch === "{" || ch === "[") {
					depth += 1;
					continue;
				}
				if (ch === "}" || ch === "]") {
					depth -= 1;
					if (depth === 0) return i + 1;
				}
			}
			return null;
		}
		if (startChar === "\"") {
			let escape = false;
			for (let i = index + 1; i < input.length; i += 1) {
				const ch = input[i];
				if (escape) {
					escape = false;
					continue;
				}
				if (ch === "\\") {
					escape = true;
					continue;
				}
				if (ch === "\"") return i + 1;
			}
			return null;
		}
		let end = index;
		while (end < input.length && input[end] !== "\n" && input[end] !== "\r") end += 1;
		return end;
	};
	const stripToolCalls = (input) => {
		const markerRe = /\[Tool Call:[^\]]*\]/gi;
		let result = "";
		let cursor = 0;
		for (const match of input.matchAll(markerRe)) {
			const start = match.index ?? 0;
			if (start < cursor) continue;
			result += input.slice(cursor, start);
			let index = start + match[0].length;
			while (index < input.length && (input[index] === " " || input[index] === "	")) index += 1;
			if (input[index] === "\r") {
				index += 1;
				if (input[index] === "\n") index += 1;
			} else if (input[index] === "\n") index += 1;
			while (index < input.length && (input[index] === " " || input[index] === "	")) index += 1;
			if (input.slice(index, index + 9).toLowerCase() === "arguments") {
				index += 9;
				if (input[index] === ":") index += 1;
				if (input[index] === " ") index += 1;
				const end = consumeJsonish(input, index, { allowLeadingNewlines: true });
				if (end !== null) index = end;
			}
			if ((input[index] === "\n" || input[index] === "\r") && (result.endsWith("\n") || result.endsWith("\r") || result.length === 0)) {
				if (input[index] === "\r") index += 1;
				if (input[index] === "\n") index += 1;
			}
			cursor = index;
		}
		result += input.slice(cursor);
		return result;
	};
	let cleaned = stripToolCalls(text);
	cleaned = cleaned.replace(/\[Tool Result for ID[^\]]*\]\n?[\s\S]*?(?=\n*\[Tool |\n*$)/gi, "");
	cleaned = cleaned.replace(/\[Historical context:[^\]]*\]\n?/gi, "");
	return cleaned.trim();
}
/**
* Strip thinking tags and their content from text.
* This is a safety net for cases where the model outputs <think> tags
* that slip through other filtering mechanisms.
*/
function stripThinkingTagsFromText(text) {
	return stripReasoningTagsFromText(text, {
		mode: "strict",
		trim: "both"
	});
}
function extractAssistantText(msg) {
	return sanitizeUserFacingText(extractTextFromChatContent(msg.content, {
		sanitizeText: (text) => stripThinkingTagsFromText(stripDowngradedToolCallText(stripModelSpecialTokens(stripMinimaxToolCallXml(text)))).trim(),
		joinWith: "\n",
		normalizeText: (text) => text.trim()
	}) ?? "", { errorContext: msg.stopReason === "error" });
}
function extractAssistantThinking(msg) {
	if (!Array.isArray(msg.content)) return "";
	return msg.content.map((block) => {
		if (!block || typeof block !== "object") return "";
		const record = block;
		if (record.type === "thinking" && typeof record.thinking === "string") return record.thinking.trim();
		return "";
	}).filter(Boolean).join("\n").trim();
}
function formatReasoningMessage(text) {
	const trimmed = text.trim();
	if (!trimmed) return "";
	return `Reasoning:\n${trimmed.split("\n").map((line) => line ? `_${line}_` : line).join("\n")}`;
}
function splitThinkingTaggedText(text) {
	const trimmedStart = text.trimStart();
	if (!trimmedStart.startsWith("<")) return null;
	const openRe = /<\s*(?:think(?:ing)?|thought|antthinking)\s*>/i;
	const closeRe = /<\s*\/\s*(?:think(?:ing)?|thought|antthinking)\s*>/i;
	if (!openRe.test(trimmedStart)) return null;
	if (!closeRe.test(text)) return null;
	const scanRe = /<\s*(\/?)\s*(?:think(?:ing)?|thought|antthinking)\s*>/gi;
	let inThinking = false;
	let cursor = 0;
	let thinkingStart = 0;
	const blocks = [];
	const pushText = (value) => {
		if (!value) return;
		blocks.push({
			type: "text",
			text: value
		});
	};
	const pushThinking = (value) => {
		const cleaned = value.trim();
		if (!cleaned) return;
		blocks.push({
			type: "thinking",
			thinking: cleaned
		});
	};
	for (const match of text.matchAll(scanRe)) {
		const index = match.index ?? 0;
		const isClose = Boolean(match[1]?.includes("/"));
		if (!inThinking && !isClose) {
			pushText(text.slice(cursor, index));
			thinkingStart = index + match[0].length;
			inThinking = true;
			continue;
		}
		if (inThinking && isClose) {
			pushThinking(text.slice(thinkingStart, index));
			cursor = index + match[0].length;
			inThinking = false;
		}
	}
	if (inThinking) return null;
	pushText(text.slice(cursor));
	if (!blocks.some((b) => b.type === "thinking")) return null;
	return blocks;
}
function promoteThinkingTagsToBlocks(message) {
	if (!Array.isArray(message.content)) return;
	if (message.content.some((block) => block && typeof block === "object" && block.type === "thinking")) return;
	const next = [];
	let changed = false;
	for (const block of message.content) {
		if (!block || typeof block !== "object" || !("type" in block)) {
			next.push(block);
			continue;
		}
		if (block.type !== "text") {
			next.push(block);
			continue;
		}
		const split = splitThinkingTaggedText(block.text);
		if (!split) {
			next.push(block);
			continue;
		}
		changed = true;
		for (const part of split) if (part.type === "thinking") next.push({
			type: "thinking",
			thinking: part.thinking
		});
		else if (part.type === "text") {
			const cleaned = part.text.trimStart();
			if (cleaned) next.push({
				type: "text",
				text: cleaned
			});
		}
	}
	if (!changed) return;
	message.content = next;
}
function extractThinkingFromTaggedText(text) {
	if (!text) return "";
	const scanRe = /<\s*(\/?)\s*(?:think(?:ing)?|thought|antthinking)\s*>/gi;
	let result = "";
	let lastIndex = 0;
	let inThinking = false;
	for (const match of text.matchAll(scanRe)) {
		const idx = match.index ?? 0;
		if (inThinking) result += text.slice(lastIndex, idx);
		inThinking = !(match[1] === "/");
		lastIndex = idx + match[0].length;
	}
	return result.trim();
}
function extractThinkingFromTaggedStream(text) {
	if (!text) return "";
	const closed = extractThinkingFromTaggedText(text);
	if (closed) return closed;
	const openRe = /<\s*(?:think(?:ing)?|thought|antthinking)\s*>/gi;
	const closeRe = /<\s*\/\s*(?:think(?:ing)?|thought|antthinking)\s*>/gi;
	const openMatches = [...text.matchAll(openRe)];
	if (openMatches.length === 0) return "";
	const closeMatches = [...text.matchAll(closeRe)];
	const lastOpen = openMatches[openMatches.length - 1];
	const lastClose = closeMatches[closeMatches.length - 1];
	if (lastClose && (lastClose.index ?? -1) > (lastOpen.index ?? -1)) return closed;
	const start = (lastOpen.index ?? 0) + lastOpen[0].length;
	return text.slice(start).trim();
}
function inferToolMetaFromArgs(toolName, args) {
	return formatToolDetail(resolveToolDisplay({
		name: toolName,
		args
	}));
}
//#endregion
//#region src/agents/tools/model-config.helpers.ts
function hasToolModelConfig(model) {
	return Boolean(model?.primary?.trim() || (model?.fallbacks ?? []).some((entry) => entry.trim().length > 0));
}
function resolveDefaultModelRef(cfg) {
	if (cfg) {
		const resolved = resolveConfiguredModelRef({
			cfg,
			defaultProvider: DEFAULT_PROVIDER,
			defaultModel: DEFAULT_MODEL
		});
		return {
			provider: resolved.provider,
			model: resolved.model
		};
	}
	return {
		provider: DEFAULT_PROVIDER,
		model: DEFAULT_MODEL
	};
}
function hasAuthForProvider(params) {
	if (resolveEnvApiKey(params.provider)?.apiKey) return true;
	const agentDir = params.agentDir?.trim();
	if (!agentDir) return false;
	return listProfilesForProvider(ensureAuthProfileStore(agentDir, { allowKeychainPrompt: false }), params.provider).length > 0;
}
function coerceToolModelConfig(model) {
	const primary = resolveAgentModelPrimaryValue(model);
	const fallbacks = resolveAgentModelFallbackValues(model);
	return {
		...primary?.trim() ? { primary: primary.trim() } : {},
		...fallbacks.length > 0 ? { fallbacks } : {}
	};
}
function buildToolModelConfigFromCandidates(params) {
	if (hasToolModelConfig(params.explicit)) return params.explicit;
	const deduped = [];
	for (const candidate of params.candidates) {
		const trimmed = candidate?.trim();
		if (!trimmed || !trimmed.includes("/")) continue;
		const provider = trimmed.slice(0, trimmed.indexOf("/")).trim();
		if (!provider || !hasAuthForProvider({
			provider,
			agentDir: params.agentDir
		})) continue;
		if (!deduped.includes(trimmed)) deduped.push(trimmed);
	}
	if (deduped.length === 0) return null;
	return {
		primary: deduped[0],
		...deduped.length > 1 ? { fallbacks: deduped.slice(1) } : {}
	};
}
//#endregion
//#region src/agents/tools/image-tool.helpers.ts
function decodeDataUrl(dataUrl) {
	const trimmed = dataUrl.trim();
	const match = /^data:([^;,]+);base64,([a-z0-9+/=\r\n]+)$/i.exec(trimmed);
	if (!match) throw new Error("Invalid data URL (expected base64 data: URL).");
	const mimeType = (match[1] ?? "").trim().toLowerCase();
	if (!mimeType.startsWith("image/")) throw new Error(`Unsupported data URL type: ${mimeType || "unknown"}`);
	const b64 = (match[2] ?? "").trim();
	const buffer = Buffer.from(b64, "base64");
	if (buffer.length === 0) throw new Error("Invalid data URL: empty payload.");
	return {
		buffer,
		mimeType,
		kind: "image"
	};
}
function coerceImageAssistantText(params) {
	const stop = params.message.stopReason;
	const errorMessage = params.message.errorMessage?.trim();
	if (stop === "error" || stop === "aborted") throw new Error(errorMessage ? `Image model failed (${params.provider}/${params.model}): ${errorMessage}` : `Image model failed (${params.provider}/${params.model})`);
	if (errorMessage) throw new Error(`Image model failed (${params.provider}/${params.model}): ${errorMessage}`);
	const text = extractAssistantText(params.message);
	if (text.trim()) return text.trim();
	throw new Error(`Image model returned no text (${params.provider}/${params.model}).`);
}
function coerceImageModelConfig(cfg) {
	return coerceToolModelConfig(cfg?.agents?.defaults?.imageModel);
}
function resolveProviderVisionModelFromConfig(params) {
	const id = ((findNormalizedProviderValue(params.cfg?.models?.providers, params.provider)?.models ?? []).find((m) => Boolean((m?.id ?? "").trim()) && m.input?.includes("image"))?.id ?? "").trim();
	return id ? `${params.provider}/${id}` : null;
}
//#endregion
//#region src/agents/minimax-vlm.ts
function isMinimaxVlmProvider(provider) {
	return provider === "minimax" || provider === "minimax-portal";
}
function isMinimaxVlmModel(provider, modelId) {
	return isMinimaxVlmProvider(provider) && modelId.trim() === "MiniMax-VL-01";
}
function coerceApiHost(params) {
	const env = params.env ?? process.env;
	const raw = params.apiHost?.trim() || env.MINIMAX_API_HOST?.trim() || params.modelBaseUrl?.trim() || "https://api.minimax.io";
	try {
		return new URL(raw).origin;
	} catch {}
	try {
		return new URL(`https://${raw}`).origin;
	} catch {
		return "https://api.minimax.io";
	}
}
function pickString(rec, key) {
	const v = rec[key];
	return typeof v === "string" ? v : "";
}
async function minimaxUnderstandImage(params) {
	const apiKey = normalizeSecretInput(params.apiKey);
	if (!apiKey) throw new Error("MiniMax VLM: apiKey required");
	const prompt = params.prompt.trim();
	if (!prompt) throw new Error("MiniMax VLM: prompt required");
	const imageDataUrl = params.imageDataUrl.trim();
	if (!imageDataUrl) throw new Error("MiniMax VLM: imageDataUrl required");
	if (!/^data:image\/(png|jpeg|webp);base64,/i.test(imageDataUrl)) throw new Error("MiniMax VLM: imageDataUrl must be a base64 data:image/(png|jpeg|webp) URL");
	const host = coerceApiHost({
		apiHost: params.apiHost,
		modelBaseUrl: params.modelBaseUrl
	});
	const url = new URL("/v1/coding_plan/vlm", host).toString();
	ensureGlobalUndiciEnvProxyDispatcher();
	const res = await fetch(url, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${apiKey}`,
			"Content-Type": "application/json",
			"MM-API-Source": "OpenClaw"
		},
		body: JSON.stringify({
			prompt,
			image_url: imageDataUrl
		})
	});
	const traceId = res.headers.get("Trace-Id") ?? "";
	if (!res.ok) {
		const body = await res.text().catch(() => "");
		const trace = traceId ? ` Trace-Id: ${traceId}` : "";
		throw new Error(`MiniMax VLM request failed (${res.status} ${res.statusText}).${trace}${body ? ` Body: ${body.slice(0, 400)}` : ""}`);
	}
	const json = await res.json().catch(() => null);
	if (!isRecord(json)) {
		const trace = traceId ? ` Trace-Id: ${traceId}` : "";
		throw new Error(`MiniMax VLM response was not JSON.${trace}`);
	}
	const baseResp = isRecord(json.base_resp) ? json.base_resp : {};
	const code = typeof baseResp.status_code === "number" ? baseResp.status_code : -1;
	if (code !== 0) {
		const msg = (baseResp.status_msg ?? "").trim();
		const trace = traceId ? ` Trace-Id: ${traceId}` : "";
		throw new Error(`MiniMax VLM API error (${code})${msg ? `: ${msg}` : ""}.${trace}`);
	}
	const content = pickString(json, "content").trim();
	if (!content) {
		const trace = traceId ? ` Trace-Id: ${traceId}` : "";
		throw new Error(`MiniMax VLM returned no content.${trace}`);
	}
	return content;
}
//#endregion
export { stripMinimaxToolCallXml as C, extractTextFromChatContent as E, stripDowngradedToolCallText as S, stripThinkingTagsFromText as T, formatReasoningMessage as _, coerceImageModelConfig as a, promoteThinkingTagsToBlocks as b, buildToolModelConfigFromCandidates as c, hasToolModelConfig as d, resolveDefaultModelRef as f, extractThinkingFromTaggedText as g, extractThinkingFromTaggedStream as h, coerceImageAssistantText as i, coerceToolModelConfig as l, extractAssistantThinking as m, isMinimaxVlmProvider as n, decodeDataUrl as o, extractAssistantText as p, minimaxUnderstandImage as r, resolveProviderVisionModelFromConfig as s, isMinimaxVlmModel as t, hasAuthForProvider as u, inferToolMetaFromArgs as v, stripModelSpecialTokens as w, splitThinkingTaggedText as x, isAssistantMessage as y };
