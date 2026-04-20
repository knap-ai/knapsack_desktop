import { l as listRegisteredMemoryEmbeddingProviders, s as getRegisteredMemoryEmbeddingProvider } from "./loader-DYW2PvbF.js";
import { t as resolvePluginCapabilityProviders } from "./capability-provider-runtime-CFZVcnCd.js";
//#region src/plugins/memory-embedding-provider-runtime.ts
function listRegisteredMemoryEmbeddingProviderAdapters() {
	return listRegisteredMemoryEmbeddingProviders().map((entry) => entry.adapter);
}
function listMemoryEmbeddingProviders(cfg) {
	const registered = listRegisteredMemoryEmbeddingProviderAdapters();
	if (registered.length > 0) return registered;
	return resolvePluginCapabilityProviders({
		key: "memoryEmbeddingProviders",
		cfg
	});
}
function getMemoryEmbeddingProvider(id, cfg) {
	const registered = getRegisteredMemoryEmbeddingProvider(id);
	if (registered) return registered.adapter;
	if (listRegisteredMemoryEmbeddingProviders().length > 0) return;
	return listMemoryEmbeddingProviders(cfg).find((adapter) => adapter.id === id);
}
//#endregion
export { listMemoryEmbeddingProviders as n, listRegisteredMemoryEmbeddingProviderAdapters as r, getMemoryEmbeddingProvider as t };
