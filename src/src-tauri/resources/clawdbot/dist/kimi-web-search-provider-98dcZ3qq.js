import { s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { d as readNumberParam, h as readStringParam } from "./common-BWtun2If.js";
import { a as wrapWebContent } from "./external-content-Ds7ZVhiZ.js";
import { a as buildUnsupportedSearchFilterResponse, b as writeCachedSearchPayload, d as readCachedSearchPayload, f as readConfiguredSecretString, g as resolveSearchTimeoutSeconds, h as resolveSearchCount, i as buildSearchCacheKey, m as resolveSearchCacheTtlMs, p as readProviderEnvValue, y as withTrustedWebSearchEndpoint } from "./web-search-provider-common-EFbs_Gas.js";
import "./text-runtime-DTMxvodz.js";
import { a as setProviderWebSearchPluginConfigValue, i as resolveProviderWebSearchPluginConfig, o as setScopedCredentialValue, r as mergeScopedSearchConfig, t as getScopedCredentialValue } from "./web-search-provider-config-DP0GzBOv.js";
import "./provider-web-search-B6Xg-MPv.js";
import { n as MOONSHOT_CN_BASE_URL, o as isNativeMoonshotBaseUrl, r as MOONSHOT_DEFAULT_MODEL_ID, t as MOONSHOT_BASE_URL } from "./provider-catalog-2_ZH8EKE.js";
import { Type } from "@sinclair/typebox";
//#region extensions/moonshot/src/kimi-web-search-provider.ts
const DEFAULT_KIMI_BASE_URL = MOONSHOT_BASE_URL;
const DEFAULT_KIMI_SEARCH_MODEL = MOONSHOT_DEFAULT_MODEL_ID;
/** Models that require explicit thinking disablement for web search.
* Reasoning variants (kimi-k2-thinking, kimi-k2-thinking-turbo) are excluded
* because they default to thinking-enabled and disabling it would defeat their
* purpose; they are also unlikely to be used for web search. */
const KIMI_THINKING_MODELS = new Set(["kimi-k2.5"]);
const KIMI_WEB_SEARCH_TOOL = {
	type: "builtin_function",
	function: { name: "$web_search" }
};
function resolveKimiConfig(searchConfig) {
	const kimi = searchConfig?.kimi;
	return kimi && typeof kimi === "object" && !Array.isArray(kimi) ? kimi : {};
}
function resolveKimiApiKey(kimi) {
	return readConfiguredSecretString(kimi?.apiKey, "tools.web.search.kimi.apiKey") ?? readProviderEnvValue(["KIMI_API_KEY", "MOONSHOT_API_KEY"]);
}
function resolveKimiModel(kimi) {
	return (normalizeOptionalString(kimi?.model) ?? "") || DEFAULT_KIMI_SEARCH_MODEL;
}
function trimTrailingSlashes(url) {
	return url.replace(/\/+$/, "");
}
function resolveKimiBaseUrl(kimi, openClawConfig) {
	const explicitBaseUrl = normalizeOptionalString(kimi?.baseUrl) ?? "";
	if (explicitBaseUrl) return trimTrailingSlashes(explicitBaseUrl) || DEFAULT_KIMI_BASE_URL;
	const moonshotBaseUrl = openClawConfig?.models?.providers?.moonshot?.baseUrl;
	if (typeof moonshotBaseUrl === "string") {
		const normalizedMoonshotBaseUrl = trimTrailingSlashes(moonshotBaseUrl.trim());
		if (normalizedMoonshotBaseUrl && isNativeMoonshotBaseUrl(normalizedMoonshotBaseUrl)) return normalizedMoonshotBaseUrl;
	}
	return DEFAULT_KIMI_BASE_URL;
}
function extractKimiMessageText(message) {
	const content = message?.content?.trim();
	if (content) return content;
	return message?.reasoning_content?.trim() || void 0;
}
function extractKimiCitations(data) {
	const citations = (data.search_results ?? []).map((entry) => entry.url?.trim()).filter((url) => Boolean(url));
	for (const toolCall of data.choices?.[0]?.message?.tool_calls ?? []) {
		const rawArguments = toolCall.function?.arguments;
		if (!rawArguments) continue;
		try {
			const parsed = JSON.parse(rawArguments);
			const parsedUrl = normalizeOptionalString(parsed.url);
			if (parsedUrl) citations.push(parsedUrl);
			for (const result of parsed.search_results ?? []) {
				const resultUrl = normalizeOptionalString(result.url);
				if (resultUrl) citations.push(resultUrl);
			}
		} catch {}
	}
	return [...new Set(citations)];
}
function extractKimiToolResultContent(toolCall) {
	const rawArguments = toolCall.function?.arguments;
	if (typeof rawArguments !== "string" || rawArguments.trim().length === 0) return;
	return rawArguments;
}
async function runKimiSearch(params) {
	const endpoint = `${params.baseUrl.trim().replace(/\/$/, "")}/chat/completions`;
	const messages = [{
		role: "user",
		content: params.query
	}];
	const collectedCitations = /* @__PURE__ */ new Set();
	for (let round = 0; round < 3; round += 1) {
		const next = await withTrustedWebSearchEndpoint({
			url: endpoint,
			timeoutSeconds: params.timeoutSeconds,
			init: {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${params.apiKey}`
				},
				body: JSON.stringify({
					model: params.model,
					...KIMI_THINKING_MODELS.has(params.model) ? { thinking: { type: "disabled" } } : {},
					messages,
					tools: [KIMI_WEB_SEARCH_TOOL]
				})
			}
		}, async (res) => {
			if (!res.ok) {
				const detail = await res.text();
				throw new Error(`Kimi API error (${res.status}): ${detail || res.statusText}`);
			}
			const data = await res.json();
			for (const citation of extractKimiCitations(data)) collectedCitations.add(citation);
			const choice = data.choices?.[0];
			const message = choice?.message;
			const text = extractKimiMessageText(message);
			const toolCalls = message?.tool_calls ?? [];
			if (choice?.finish_reason !== "tool_calls" || toolCalls.length === 0) return {
				done: true,
				content: text ?? "No response",
				citations: [...collectedCitations]
			};
			messages.push({
				role: "assistant",
				content: message?.content ?? "",
				...message?.reasoning_content ? { reasoning_content: message.reasoning_content } : {},
				tool_calls: toolCalls
			});
			let pushed = false;
			for (const toolCall of toolCalls) {
				const toolCallId = toolCall.id?.trim();
				const toolCallName = toolCall.function?.name?.trim();
				const toolContent = extractKimiToolResultContent(toolCall);
				if (!toolCallId || !toolCallName || !toolContent) continue;
				pushed = true;
				messages.push({
					role: "tool",
					tool_call_id: toolCallId,
					name: toolCallName,
					content: toolContent
				});
			}
			if (!pushed) return {
				done: true,
				content: text ?? "No response",
				citations: [...collectedCitations]
			};
			return { done: false };
		});
		if (next.done) return {
			content: next.content,
			citations: next.citations
		};
	}
	return {
		content: "Search completed but no final answer was produced.",
		citations: [...collectedCitations]
	};
}
function createKimiSchema() {
	return Type.Object({
		query: Type.String({ description: "Search query string." }),
		count: Type.Optional(Type.Number({
			description: "Number of results to return (1-10).",
			minimum: 1,
			maximum: 10
		})),
		country: Type.Optional(Type.String({ description: "Not supported by Kimi." })),
		language: Type.Optional(Type.String({ description: "Not supported by Kimi." })),
		freshness: Type.Optional(Type.String({ description: "Not supported by Kimi." })),
		date_after: Type.Optional(Type.String({ description: "Not supported by Kimi." })),
		date_before: Type.Optional(Type.String({ description: "Not supported by Kimi." }))
	});
}
function createKimiToolDefinition(searchConfig, openClawConfig) {
	return {
		description: "Search the web using Kimi by Moonshot. Returns AI-synthesized answers with citations from native $web_search.",
		parameters: createKimiSchema(),
		execute: async (args) => {
			const params = args;
			const unsupportedResponse = buildUnsupportedSearchFilterResponse(params, "kimi");
			if (unsupportedResponse) return unsupportedResponse;
			const kimiConfig = resolveKimiConfig(searchConfig);
			const apiKey = resolveKimiApiKey(kimiConfig);
			if (!apiKey) return {
				error: "missing_kimi_api_key",
				message: "web_search (kimi) needs a Moonshot API key. Set KIMI_API_KEY or MOONSHOT_API_KEY in the Gateway environment, or configure tools.web.search.kimi.apiKey.",
				docs: "https://docs.openclaw.ai/tools/web"
			};
			const query = readStringParam(params, "query", { required: true });
			const count = readNumberParam(params, "count", { integer: true }) ?? searchConfig?.maxResults ?? void 0;
			const model = resolveKimiModel(kimiConfig);
			const baseUrl = resolveKimiBaseUrl(kimiConfig, openClawConfig);
			const cacheKey = buildSearchCacheKey([
				"kimi",
				query,
				resolveSearchCount(count, 5),
				baseUrl,
				model
			]);
			const cached = readCachedSearchPayload(cacheKey);
			if (cached) return cached;
			const start = Date.now();
			const result = await runKimiSearch({
				query,
				apiKey,
				baseUrl,
				model,
				timeoutSeconds: resolveSearchTimeoutSeconds(searchConfig)
			});
			const payload = {
				query,
				provider: "kimi",
				model,
				tookMs: Date.now() - start,
				externalContent: {
					untrusted: true,
					source: "web_search",
					provider: "kimi",
					wrapped: true
				},
				content: wrapWebContent(result.content),
				citations: result.citations
			};
			writeCachedSearchPayload(cacheKey, payload, resolveSearchCacheTtlMs(searchConfig));
			return payload;
		}
	};
}
async function runKimiSearchProviderSetup(ctx) {
	const existingPluginConfig = resolveProviderWebSearchPluginConfig(ctx.config, "moonshot");
	const normalizedBaseUrl = (normalizeOptionalString(existingPluginConfig?.baseUrl) ?? "").replace(/\/+$/, "");
	const existingModel = normalizeOptionalString(existingPluginConfig?.model) ?? "";
	const isCustomBaseUrl = normalizedBaseUrl && !isNativeMoonshotBaseUrl(normalizedBaseUrl);
	const regionOptions = [];
	if (isCustomBaseUrl) regionOptions.push({
		value: normalizedBaseUrl,
		label: `Keep current (${normalizedBaseUrl})`,
		hint: "custom endpoint"
	});
	regionOptions.push({
		value: MOONSHOT_BASE_URL,
		label: "Moonshot API key (.ai)",
		hint: "api.moonshot.ai"
	}, {
		value: MOONSHOT_CN_BASE_URL,
		label: "Moonshot API key (.cn)",
		hint: "api.moonshot.cn"
	});
	const baseUrl = await ctx.prompter.select({
		message: "Kimi API region",
		options: regionOptions,
		initialValue: normalizedBaseUrl || "https://api.moonshot.ai/v1"
	});
	const currentModelLabel = existingModel ? `Keep current (moonshot/${existingModel})` : `Use default (moonshot/${DEFAULT_KIMI_SEARCH_MODEL})`;
	const modelChoice = await ctx.prompter.select({
		message: "Kimi web search model",
		options: [
			{
				value: "__keep__",
				label: currentModelLabel
			},
			{
				value: "__custom__",
				label: "Enter model manually"
			},
			{
				value: DEFAULT_KIMI_SEARCH_MODEL,
				label: `moonshot/${DEFAULT_KIMI_SEARCH_MODEL}`
			}
		],
		initialValue: "__keep__"
	});
	let model;
	if (modelChoice === "__keep__") model = existingModel || DEFAULT_KIMI_SEARCH_MODEL;
	else if (modelChoice === "__custom__") model = (await ctx.prompter.text({
		message: "Kimi model name",
		initialValue: existingModel || DEFAULT_KIMI_SEARCH_MODEL,
		placeholder: DEFAULT_KIMI_SEARCH_MODEL
	}))?.trim() || DEFAULT_KIMI_SEARCH_MODEL;
	else model = modelChoice;
	const next = { ...ctx.config };
	setProviderWebSearchPluginConfigValue(next, "moonshot", "baseUrl", baseUrl);
	setProviderWebSearchPluginConfigValue(next, "moonshot", "model", model);
	return next;
}
function createKimiWebSearchProvider() {
	return {
		id: "kimi",
		label: "Kimi (Moonshot)",
		hint: "Requires Moonshot / Kimi API key · Moonshot web search",
		onboardingScopes: ["text-inference"],
		credentialLabel: "Moonshot / Kimi API key",
		envVars: ["KIMI_API_KEY", "MOONSHOT_API_KEY"],
		placeholder: "sk-...",
		signupUrl: "https://platform.moonshot.cn/",
		docsUrl: "https://docs.openclaw.ai/tools/web",
		autoDetectOrder: 40,
		credentialPath: "plugins.entries.moonshot.config.webSearch.apiKey",
		inactiveSecretPaths: ["plugins.entries.moonshot.config.webSearch.apiKey"],
		getCredentialValue: (searchConfig) => getScopedCredentialValue(searchConfig, "kimi"),
		setCredentialValue: (searchConfigTarget, value) => setScopedCredentialValue(searchConfigTarget, "kimi", value),
		getConfiguredCredentialValue: (config) => resolveProviderWebSearchPluginConfig(config, "moonshot")?.apiKey,
		setConfiguredCredentialValue: (configTarget, value) => {
			setProviderWebSearchPluginConfigValue(configTarget, "moonshot", "apiKey", value);
		},
		runSetup: runKimiSearchProviderSetup,
		createTool: (ctx) => createKimiToolDefinition(mergeScopedSearchConfig(ctx.searchConfig, "kimi", resolveProviderWebSearchPluginConfig(ctx.config, "moonshot")), ctx.config)
	};
}
const __testing = {
	resolveKimiApiKey,
	resolveKimiModel,
	resolveKimiBaseUrl,
	extractKimiCitations,
	extractKimiToolResultContent
};
//#endregion
export { createKimiWebSearchProvider as n, __testing as t };
