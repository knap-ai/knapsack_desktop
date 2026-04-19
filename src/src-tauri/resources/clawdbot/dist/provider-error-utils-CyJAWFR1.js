import { i as normalizeLowercaseStringOrEmpty } from "./string-coerce-BUSzWgUA.js";
import { r as listSpeechProviders } from "./provider-registry-CasPS0mm.js";
//#region src/tts/directives.ts
function buildProviderOrder(left, right) {
	const leftOrder = left.autoSelectOrder ?? Number.MAX_SAFE_INTEGER;
	const rightOrder = right.autoSelectOrder ?? Number.MAX_SAFE_INTEGER;
	if (leftOrder !== rightOrder) return leftOrder - rightOrder;
	return left.id.localeCompare(right.id);
}
function resolveDirectiveProviders(options) {
	if (options?.providers) return [...options.providers].toSorted(buildProviderOrder);
	return listSpeechProviders(options?.cfg).toSorted(buildProviderOrder);
}
function resolveDirectiveProviderConfig(provider, options) {
	return options?.providerConfigs?.[provider.id];
}
function prioritizeProvider(providers, providerId) {
	if (!providerId) return [...providers];
	const preferredProvider = providers.find((provider) => provider.id === providerId);
	if (!preferredProvider) return [...providers];
	return [preferredProvider, ...providers.filter((provider) => provider.id !== providerId)];
}
function parseTtsDirectives(text, policy, options) {
	if (!policy.enabled) return {
		cleanedText: text,
		overrides: {},
		warnings: [],
		hasDirective: false
	};
	const providers = resolveDirectiveProviders(options);
	const overrides = {};
	const warnings = [];
	let cleanedText = text;
	let hasDirective = false;
	cleanedText = cleanedText.replace(/\[\[tts:text\]\]([\s\S]*?)\[\[\/tts:text\]\]/gi, (_match, inner) => {
		hasDirective = true;
		if (policy.allowText && overrides.ttsText == null) overrides.ttsText = inner.trim();
		return "";
	});
	cleanedText = cleanedText.replace(/\[\[tts:([^\]]+)\]\]/gi, (_match, body) => {
		hasDirective = true;
		const tokens = body.split(/\s+/).filter(Boolean);
		let declaredProviderId;
		if (policy.allowProvider) for (const token of tokens) {
			const eqIndex = token.indexOf("=");
			if (eqIndex === -1) continue;
			const rawKey = token.slice(0, eqIndex).trim();
			if (!rawKey || normalizeLowercaseStringOrEmpty(rawKey) !== "provider") continue;
			const rawValue = token.slice(eqIndex + 1).trim();
			if (!rawValue) continue;
			const providerId = normalizeLowercaseStringOrEmpty(rawValue);
			if (!providerId) {
				warnings.push("invalid provider id");
				continue;
			}
			declaredProviderId = providerId;
			overrides.provider = providerId;
		}
		const orderedProviders = prioritizeProvider(providers, declaredProviderId ?? normalizeLowercaseStringOrEmpty(options?.preferredProviderId));
		for (const token of tokens) {
			const eqIndex = token.indexOf("=");
			if (eqIndex === -1) continue;
			const rawKey = token.slice(0, eqIndex).trim();
			const rawValue = token.slice(eqIndex + 1).trim();
			if (!rawKey || !rawValue) continue;
			const key = normalizeLowercaseStringOrEmpty(rawKey);
			if (key === "provider") continue;
			for (const provider of orderedProviders) {
				const parsed = provider.parseDirectiveToken?.({
					key,
					value: rawValue,
					policy,
					providerConfig: resolveDirectiveProviderConfig(provider, options),
					currentOverrides: overrides.providerOverrides?.[provider.id]
				});
				if (!parsed?.handled) continue;
				if (parsed.overrides) overrides.providerOverrides = {
					...overrides.providerOverrides,
					[provider.id]: {
						...overrides.providerOverrides?.[provider.id],
						...parsed.overrides
					}
				};
				if (parsed.warnings?.length) warnings.push(...parsed.warnings);
				break;
			}
		}
		return "";
	});
	return {
		cleanedText,
		ttsText: overrides.ttsText,
		hasDirective,
		overrides,
		warnings
	};
}
//#endregion
//#region src/tts/provider-error-utils.ts
function asBoolean(value) {
	return typeof value === "boolean" ? value : void 0;
}
function asObject(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value) ? value : void 0;
}
function truncateErrorDetail(detail, limit = 220) {
	return detail.length <= limit ? detail : `${detail.slice(0, limit - 1)}…`;
}
async function readResponseTextLimited(response, limitBytes = 16 * 1024) {
	if (limitBytes <= 0) return "";
	const reader = response.body?.getReader();
	if (!reader) return "";
	const decoder = new TextDecoder();
	let total = 0;
	let text = "";
	let reachedLimit = false;
	try {
		while (true) {
			const { value, done } = await reader.read();
			if (done) break;
			if (!value || value.byteLength === 0) continue;
			const remaining = limitBytes - total;
			if (remaining <= 0) {
				reachedLimit = true;
				break;
			}
			const chunk = value.byteLength > remaining ? value.subarray(0, remaining) : value;
			total += chunk.byteLength;
			text += decoder.decode(chunk, { stream: true });
			if (total >= limitBytes) {
				reachedLimit = true;
				break;
			}
		}
		text += decoder.decode();
	} finally {
		if (reachedLimit) await reader.cancel().catch(() => {});
	}
	return text;
}
//#endregion
export { parseTtsDirectives as a, truncateErrorDetail as i, asObject as n, readResponseTextLimited as r, asBoolean as t };
