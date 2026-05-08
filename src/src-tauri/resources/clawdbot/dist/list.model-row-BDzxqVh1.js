import { t as modelKey } from "./model-ref-shared-1nQh-2FS.js";
import { f as isLocalBaseUrl } from "./shared-CbfwZExx.js";
//#region src/commands/models/list.model-row.ts
function authStoreHasProviderProfile(authStore, provider) {
	return Object.values(authStore.profiles ?? {}).some((credential) => credential.provider === provider);
}
function toModelRow(params) {
	const { model, key, tags, aliases = [], availableKeys, cfg, authStore, allowProviderAvailabilityFallback = false } = params;
	if (!model) return {
		key,
		name: key,
		input: "-",
		contextWindow: null,
		local: null,
		available: null,
		tags: [...tags, "missing"],
		missing: true
	};
	const input = model.input.join("+") || "text";
	const local = isLocalBaseUrl(model.baseUrl ?? "");
	const modelIsAvailable = availableKeys?.has(modelKey(model.provider, model.id)) ?? false;
	const available = availableKeys !== void 0 && !allowProviderAvailabilityFallback ? modelIsAvailable : modelIsAvailable || (cfg && authStore ? (params.hasAuthForProvider ?? ((input) => authStoreHasProviderProfile(input.authStore, input.provider)))({
		provider: model.provider,
		cfg,
		authStore
	}) : false);
	const aliasTags = aliases.length > 0 ? [`alias:${aliases.join(",")}`] : [];
	const mergedTags = new Set(tags);
	if (aliasTags.length > 0) {
		for (const tag of mergedTags) if (tag === "alias" || tag.startsWith("alias:")) mergedTags.delete(tag);
		for (const tag of aliasTags) mergedTags.add(tag);
	}
	return {
		key,
		name: model.name || model.id,
		input,
		contextWindow: model.contextWindow ?? null,
		...typeof model.contextTokens === "number" ? { contextTokens: model.contextTokens } : {},
		local,
		available,
		tags: Array.from(mergedTags),
		missing: false
	};
}
//#endregion
export { toModelRow as t };
