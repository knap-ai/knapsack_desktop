//#region src/agents/model-selection-display.ts
function resolveModelDisplayRef(params) {
	const runtimeModel = params.runtimeModel?.trim();
	const runtimeProvider = params.runtimeProvider?.trim();
	if (runtimeModel) {
		if (runtimeModel.includes("/")) return runtimeModel;
		if (runtimeProvider) return `${runtimeProvider}/${runtimeModel}`;
		return runtimeModel;
	}
	if (runtimeProvider) return runtimeProvider;
	const overrideModel = params.overrideModel?.trim();
	const overrideProvider = params.overrideProvider?.trim();
	if (overrideModel) {
		if (overrideModel.includes("/")) return overrideModel;
		if (overrideProvider) return `${overrideProvider}/${overrideModel}`;
		return overrideModel;
	}
	if (overrideProvider) return overrideProvider;
	return params.fallbackModel?.trim() || void 0;
}
function resolveModelDisplayName(params) {
	const modelRef = resolveModelDisplayRef(params);
	if (!modelRef) return "model n/a";
	const slash = modelRef.lastIndexOf("/");
	if (slash >= 0 && slash < modelRef.length - 1) return modelRef.slice(slash + 1);
	return modelRef;
}
function resolveSessionInfoModelSelection(params) {
	const fallbackProvider = params.currentProvider ?? params.defaultProvider ?? void 0;
	const fallbackModel = params.currentModel ?? params.defaultModel ?? void 0;
	if (params.entryProvider !== void 0 || params.entryModel !== void 0) return {
		modelProvider: params.entryProvider ?? fallbackProvider,
		model: params.entryModel ?? fallbackModel
	};
	const overrideModel = params.overrideModel?.trim();
	if (overrideModel) return {
		modelProvider: params.overrideProvider?.trim() || fallbackProvider,
		model: overrideModel
	};
	return {
		modelProvider: fallbackProvider,
		model: fallbackModel
	};
}
//#endregion
export { resolveModelDisplayRef as n, resolveSessionInfoModelSelection as r, resolveModelDisplayName as t };
