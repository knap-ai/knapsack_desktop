//#region src/plugins/memory-state.ts
const memoryPluginState = {
	corpusSupplements: [],
	promptSupplements: []
};
function registerMemoryCorpusSupplement(pluginId, supplement) {
	const next = memoryPluginState.corpusSupplements.filter((registration) => registration.pluginId !== pluginId);
	next.push({
		pluginId,
		supplement
	});
	memoryPluginState.corpusSupplements = next;
}
function registerMemoryCapability(pluginId, capability) {
	memoryPluginState.capability = {
		pluginId,
		capability: { ...capability }
	};
}
function getMemoryCapabilityRegistration() {
	return memoryPluginState.capability ? {
		pluginId: memoryPluginState.capability.pluginId,
		capability: { ...memoryPluginState.capability.capability }
	} : void 0;
}
function listMemoryCorpusSupplements() {
	return [...memoryPluginState.corpusSupplements];
}
/** @deprecated Use registerMemoryCapability(pluginId, { promptBuilder }) instead. */
function registerMemoryPromptSection(builder) {
	memoryPluginState.promptBuilder = builder;
}
function registerMemoryPromptSupplement(pluginId, builder) {
	const next = memoryPluginState.promptSupplements.filter((registration) => registration.pluginId !== pluginId);
	next.push({
		pluginId,
		builder
	});
	memoryPluginState.promptSupplements = next;
}
function buildMemoryPromptSection(params) {
	const primary = memoryPluginState.capability?.capability.promptBuilder?.(params) ?? memoryPluginState.promptBuilder?.(params) ?? [];
	const supplements = memoryPluginState.promptSupplements.toSorted((left, right) => left.pluginId.localeCompare(right.pluginId)).flatMap((registration) => registration.builder(params));
	return [...primary, ...supplements];
}
function getMemoryPromptSectionBuilder() {
	return memoryPluginState.capability?.capability.promptBuilder ?? memoryPluginState.promptBuilder;
}
function listMemoryPromptSupplements() {
	return [...memoryPluginState.promptSupplements];
}
/** @deprecated Use registerMemoryCapability(pluginId, { flushPlanResolver }) instead. */
function registerMemoryFlushPlanResolver(resolver) {
	memoryPluginState.flushPlanResolver = resolver;
}
function resolveMemoryFlushPlan(params) {
	return memoryPluginState.capability?.capability.flushPlanResolver?.(params) ?? memoryPluginState.flushPlanResolver?.(params) ?? null;
}
function getMemoryFlushPlanResolver() {
	return memoryPluginState.capability?.capability.flushPlanResolver ?? memoryPluginState.flushPlanResolver;
}
/** @deprecated Use registerMemoryCapability(pluginId, { runtime }) instead. */
function registerMemoryRuntime(runtime) {
	memoryPluginState.runtime = runtime;
}
function getMemoryRuntime() {
	return memoryPluginState.capability?.capability.runtime ?? memoryPluginState.runtime;
}
function hasMemoryRuntime() {
	return getMemoryRuntime() !== void 0;
}
function cloneMemoryPublicArtifact(artifact) {
	return {
		...artifact,
		agentIds: [...artifact.agentIds]
	};
}
async function listActiveMemoryPublicArtifacts(params) {
	return (await memoryPluginState.capability?.capability.publicArtifacts?.listArtifacts(params) ?? []).map(cloneMemoryPublicArtifact).toSorted((left, right) => {
		const workspaceOrder = left.workspaceDir.localeCompare(right.workspaceDir);
		if (workspaceOrder !== 0) return workspaceOrder;
		const relativePathOrder = left.relativePath.localeCompare(right.relativePath);
		if (relativePathOrder !== 0) return relativePathOrder;
		const kindOrder = left.kind.localeCompare(right.kind);
		if (kindOrder !== 0) return kindOrder;
		const contentTypeOrder = left.contentType.localeCompare(right.contentType);
		if (contentTypeOrder !== 0) return contentTypeOrder;
		const agentOrder = left.agentIds.join("\0").localeCompare(right.agentIds.join("\0"));
		if (agentOrder !== 0) return agentOrder;
		return left.absolutePath.localeCompare(right.absolutePath);
	});
}
function restoreMemoryPluginState(state) {
	memoryPluginState.capability = state.capability ? {
		pluginId: state.capability.pluginId,
		capability: { ...state.capability.capability }
	} : void 0;
	memoryPluginState.corpusSupplements = [...state.corpusSupplements];
	memoryPluginState.promptBuilder = state.promptBuilder;
	memoryPluginState.promptSupplements = [...state.promptSupplements];
	memoryPluginState.flushPlanResolver = state.flushPlanResolver;
	memoryPluginState.runtime = state.runtime;
}
function clearMemoryPluginState() {
	memoryPluginState.capability = void 0;
	memoryPluginState.corpusSupplements = [];
	memoryPluginState.promptBuilder = void 0;
	memoryPluginState.promptSupplements = [];
	memoryPluginState.flushPlanResolver = void 0;
	memoryPluginState.runtime = void 0;
}
//#endregion
export { resolveMemoryFlushPlan as _, getMemoryPromptSectionBuilder as a, listActiveMemoryPublicArtifacts as c, registerMemoryCapability as d, registerMemoryCorpusSupplement as f, registerMemoryRuntime as g, registerMemoryPromptSupplement as h, getMemoryFlushPlanResolver as i, listMemoryCorpusSupplements as l, registerMemoryPromptSection as m, clearMemoryPluginState as n, getMemoryRuntime as o, registerMemoryFlushPlanResolver as p, getMemoryCapabilityRegistration as r, hasMemoryRuntime as s, buildMemoryPromptSection as t, listMemoryPromptSupplements as u, restoreMemoryPluginState as v };
