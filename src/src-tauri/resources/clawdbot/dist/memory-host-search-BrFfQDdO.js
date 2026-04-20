//#region src/plugin-sdk/memory-host-search.ts
async function loadMemoryHostSearchRuntime() {
	return await import("./memory-host-search.runtime-bXUx6V5Y.js");
}
async function getActiveMemorySearchManager(params) {
	return await (await loadMemoryHostSearchRuntime()).getActiveMemorySearchManager(params);
}
async function closeActiveMemorySearchManagers(cfg) {
	await (await loadMemoryHostSearchRuntime()).closeActiveMemorySearchManagers(cfg);
}
//#endregion
export { getActiveMemorySearchManager as n, closeActiveMemorySearchManagers as t };
