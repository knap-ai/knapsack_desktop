import { requireStandardPrivacyMode } from "./knapsack-privacy-policy.js";
import { r as normalizeProviderId } from "./provider-id-zTW9Rdln.js";
import { a as listRegisteredMemoryEmbeddingProviders, r as getRegisteredMemoryEmbeddingProvider } from "./memory-embedding-providers-816TTVuI.js";
import { n as resolvePluginCapabilityProvider, r as resolvePluginCapabilityProviders } from "./capability-provider-runtime-BwiWIvn0.js";
//#region src/plugins/memory-embedding-provider-runtime.ts
function listRegisteredMemoryEmbeddingProviderAdapters() {
	return listRegisteredMemoryEmbeddingProviders().map((entry) => entry.adapter);
}
function listMemoryEmbeddingProviders(cfg) {
	const registered = listRegisteredMemoryEmbeddingProviderAdapters();
	const merged = new Map(registered.map((adapter) => [adapter.id, adapter]));
	for (const adapter of resolvePluginCapabilityProviders({
		key: "memoryEmbeddingProviders",
		cfg
	})) if (!merged.has(adapter.id)) merged.set(adapter.id, adapter);
	return [...merged.values()].map(privateEmbeddingAdapter);
}
function readConfiguredProviderApiId(providerId, cfg) {
	const providers = cfg?.models?.providers;
	if (!providers) return;
	const normalized = normalizeProviderId(providerId);
	const api = (providers[providerId] ?? Object.entries(providers).find(([candidateId]) => normalizeProviderId(candidateId) === normalized)?.[1])?.api?.trim();
	if (!api) return;
	const normalizedApi = normalizeProviderId(api);
	return normalizedApi && normalizedApi !== normalized ? normalizedApi : void 0;
}
function resolveMemoryEmbeddingProviderLookupIds(id, cfg) {
	const ids = [id];
	const apiId = readConfiguredProviderApiId(id, cfg);
	if (apiId && !ids.some((candidate) => normalizeProviderId(candidate) === apiId)) ids.push(apiId);
	return ids;
}
function getMemoryEmbeddingProvider(id, cfg) {
	const ids = resolveMemoryEmbeddingProviderLookupIds(id, cfg);
	for (const candidateId of ids) {
		const registered = getRegisteredMemoryEmbeddingProvider(candidateId);
		if (registered) return privateEmbeddingAdapter(registered.adapter);
	}
	for (const candidateId of ids) {
		const provider = resolvePluginCapabilityProvider({
			key: "memoryEmbeddingProviders",
			providerId: candidateId,
			cfg
		});
		if (provider) return privateEmbeddingAdapter(provider);
	}
}
//#endregion
export { listMemoryEmbeddingProviders as n, listRegisteredMemoryEmbeddingProviderAdapters as r, getMemoryEmbeddingProvider as t };

function privateEmbeddingAdapter(adapter) {
  if (adapter.id === "local") return adapter;
  return { ...adapter, create: async (...args) => {
    requireStandardPrivacyMode("remote embeddings");
    const result = await adapter.create(...args);
    if (!result?.provider) return result;
    const provider = result.provider;
    const guarded = { ...provider };
    for (const method of ["embedQuery", "embedBatch"]) {
      if (typeof provider[method] === "function") guarded[method] = (...params) => {
        requireStandardPrivacyMode("remote embeddings");
        return provider[method](...params);
      };
    }
    return { ...result, provider: guarded };
  } };
}
