//#region src/commands/models/list.source-plan.ts
function createSourcePlan(params) {
	return {
		kind: params.kind,
		manifestCatalogRows: params.manifestCatalogRows ?? [],
		providerIndexCatalogRows: params.providerIndexCatalogRows ?? [],
		requiresInitialRegistry: params.requiresInitialRegistry ?? false,
		skipRuntimeModelSuppression: params.skipRuntimeModelSuppression ?? false,
		fallbackToRegistryWhenEmpty: params.fallbackToRegistryWhenEmpty ?? false
	};
}
function createRegistryModelListSourcePlan() {
	return createSourcePlan({
		kind: "registry",
		requiresInitialRegistry: true
	});
}
async function planAllModelListSources(params) {
	if (!params.all || !params.providerFilter) return createRegistryModelListSourcePlan();
	const { loadStaticManifestCatalogRowsForList } = await import("./list.manifest-catalog-CnYiePrj.js");
	const manifestCatalogRows = loadStaticManifestCatalogRowsForList({
		cfg: params.cfg,
		providerFilter: params.providerFilter
	});
	if (manifestCatalogRows.length > 0) return createSourcePlan({
		kind: "manifest",
		manifestCatalogRows,
		skipRuntimeModelSuppression: true
	});
	const { loadProviderIndexCatalogRowsForList } = await import("./list.provider-index-catalog-DILhJ47I.js");
	const providerIndexCatalogRows = loadProviderIndexCatalogRowsForList({
		cfg: params.cfg,
		providerFilter: params.providerFilter
	});
	if (providerIndexCatalogRows.length > 0) return createSourcePlan({
		kind: "provider-index",
		providerIndexCatalogRows,
		skipRuntimeModelSuppression: true
	});
	const { hasProviderStaticCatalogForFilter } = await import("./list.provider-catalog-BBi-Rw7l.js");
	if (await hasProviderStaticCatalogForFilter({
		cfg: params.cfg,
		providerFilter: params.providerFilter
	})) return createSourcePlan({
		kind: "provider-runtime-static",
		skipRuntimeModelSuppression: true,
		fallbackToRegistryWhenEmpty: true
	});
	return createSourcePlan({ kind: "provider-runtime-scoped" });
}
//#endregion
export { createRegistryModelListSourcePlan, planAllModelListSources };
